/**
 * Sistema de Gestión de Ofertas
 * Permite crear ofertas de productos que los organismos pueden aceptar
 */

import { obtenerProductos } from './productStorage';
import { calcularValorMonetario, obtenerValorPorKg } from './categoriaStorage';
import { descontarInventarioReservado, validarReservaInventario } from './inventoryReservations';
import { obtenerNombreUsuarioSesion } from './sesionStorage';

export type EstadoOferta = 'pendiente' | 'aceptada' | 'rechazada' | 'parcial' | 'expirada' | 'anulada';

export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'en_preparacion' | 'entregada' | 'rechazada' | 'anulada';

export type ProductoOferta = {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  categoria: string;
  subcategoria?: string;
  cantidadOfrecida: number;
  cantidadDisponible: number; // Se reduce según aceptaciones
  unidad: string;
  peso: number;
  valorUnitario: number;
  icono?: string;
};

export type AceptacionOferta = {
  organismoId: string;
  organismoNombre: string;
  fecha: string;
  productos: {
    productoId: string;
    cantidadAceptada: number;
  }[];
  observaciones?: string;
};

export type SolicitudOferta = {
  id: string;
  organismoId: string;
  organismoNombre: string;
  fechaSolicitud: string;
  productosAceptados: {
    productoId: string;
    cantidadAceptada: number;
  }[];
  observaciones?: string;
  estado: EstadoSolicitud;
  motivoRechazo?: string;
  fechaActualizacion?: string;
  preparadoPor?: string;
};

export type Oferta = {
  id: string;
  numeroOferta: string; // OFE-2024-001
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  estado: EstadoOferta;
  creadoPor: string;
  
  // Productos ofrecidos
  productos: ProductoOferta[];
  
  // Organismos que pueden ver la oferta
  organismosDestino: 'todos' | string[]; // 'todos' o array de IDs
  departamentosDestino?: string[]; // Array de IDs de departamentos
  tipoAsistencia?: string[]; // Filtrar por tipo de asistencia
  
  // Aceptaciones (legacy)
  aceptaciones: AceptacionOferta[];
  
  // Solicitudes con estados
  solicitudes?: SolicitudOferta[];
  
  // Totales
  totalProductos: number;
  totalKilos: number;
  valorMonetarioTotal: number;
  
  // Metadata
  visible: boolean; // Si está visible para los organismos
  activa: boolean;
};

const STORAGE_KEY = 'ofertas_sistema';

function ofertaEstaExpirada(oferta: Pick<Oferta, 'fechaExpiracion'>, referencia = new Date()): boolean {
  return new Date(oferta.fechaExpiracion).getTime() <= referencia.getTime();
}

function ofertaPuedeRecibirSolicitudes(oferta: Oferta, referencia = new Date()): boolean {
  return oferta.visible && oferta.activa && oferta.estado !== 'anulada' && !ofertaEstaExpirada(oferta, referencia);
}

// Generar número de oferta único
export function generarNumeroOferta(): string {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const ofertas = obtenerOfertas();
  const ofertasDelMes = ofertas.filter(o => o.numeroOferta.includes(`OFE-${año}-${mes}`));
  const numero = String(ofertasDelMes.length + 1).padStart(3, '0');
  return `OFE-${año}-${mes}-${numero}`;
}

// Obtener todas las ofertas
export function obtenerOfertas(): Oferta[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const ofertas: Oferta[] = data ? JSON.parse(data) : [];

    if (ofertas.length > 0 && sincronizarEstadosCaducidad(ofertas)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
    }

    return ofertas;
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    return [];
  }
}

// Obtener ofertas activas
export function obtenerOfertasActivas(): Oferta[] {
  const ofertas = obtenerOfertas();

  return ofertas.filter(o => ofertaPuedeRecibirSolicitudes(o));
}

// Obtener oferta por ID
export function obtenerOfertaPorId(id: string): Oferta | null {
  const ofertas = obtenerOfertas();
  return ofertas.find(o => o.id === id) || null;
}

// Obtener ofertas visibles para un organismo específico
export function obtenerOfertasParaOrganismo(organismoId: string, tipoAsistencia?: string): Oferta[] {
  const ofertas = obtenerOfertasActivas();
  
  return ofertas.filter(o => {
    // Verificar si el organismo es destinatario
    const esDestinatario = o.organismosDestino === 'todos' || 
                           (Array.isArray(o.organismosDestino) && o.organismosDestino.includes(organismoId));
    
    // Verificar tipo de asistencia si está especificado
    const cumpleTipoAsistencia = !o.tipoAsistencia || o.tipoAsistencia.length === 0 ||
                                 (tipoAsistencia && o.tipoAsistencia.includes(tipoAsistencia));
    
    // Verificar que tenga productos disponibles
    const tieneProductosDisponibles = o.productos.some(p => p.cantidadDisponible > 0);
    
    return esDestinatario && cumpleTipoAsistencia && tieneProductosDisponibles;
  });
}

// Crear nueva oferta
export function crearOferta(oferta: Omit<Oferta, 'id' | 'numeroOferta' | 'fechaCreacion' | 'estado' | 'aceptaciones'>): Oferta {
  const validacion = validarReservaInventario(
    oferta.productos.map(producto => ({
      productoId: producto.productoId,
      cantidad: producto.cantidadOfrecida
    }))
  );

  if (!validacion.ok) {
    throw new Error(validacion.errores[0] || 'No fue posible reservar inventario para la oferta');
  }

  const ofertas = obtenerOfertas();
  
  const nuevaOferta: Oferta = {
    ...oferta,
    id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
    numeroOferta: generarNumeroOferta(),
    fechaCreacion: new Date().toISOString(),
    estado: 'pendiente',
    aceptaciones: []
  };
  
  ofertas.push(nuevaOferta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  
  console.log('✅ Oferta creada:', nuevaOferta);
  return nuevaOferta;
}

// Actualizar oferta
export function actualizarOferta(id: string, cambios: Partial<Oferta>): boolean {
  const ofertas = obtenerOfertas();
  const index = ofertas.findIndex(o => o.id === id);
  
  if (index === -1) return false;
  
  ofertas[index] = { ...ofertas[index], ...cambios };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  
  console.log('✅ Oferta actualizada:', ofertas[index]);
  return true;
}

// Actualizar estado de oferta (función auxiliar)
export function actualizarEstadoOferta(id: string, estado: EstadoOferta): boolean {
  if (estado === 'anulada') {
    return actualizarOferta(id, { estado, activa: false, visible: false });
  }

  return actualizarOferta(id, { estado });
}

export function actualizarFechaExpiracionOferta(id: string, nuevaFechaExpiracion: string): boolean {
  const ofertas = obtenerOfertas();
  const oferta = ofertas.find(item => item.id === id);

  if (!oferta) return false;

  const nuevaFecha = new Date(nuevaFechaExpiracion);
  if (Number.isNaN(nuevaFecha.getTime())) {
    return false;
  }

  oferta.fechaExpiracion = nuevaFecha.toISOString();

  if (oferta.estado !== 'anulada') {
    oferta.activa = true;
    oferta.visible = true;
    actualizarEstadoDerivadoOferta(oferta);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  console.log('✅ Fecha de expiración de oferta actualizada:', { id, fechaExpiracion: oferta.fechaExpiracion });
  return true;
}

export function anularOferta(id: string): boolean {
  const ofertas = obtenerOfertas();
  const oferta = ofertas.find(item => item.id === id);

  if (!oferta) return false;

  oferta.estado = 'anulada';
  oferta.activa = false;
  oferta.visible = false;

  (oferta.solicitudes || []).forEach(solicitud => {
    if (solicitud.estado === 'pendiente') {
      solicitud.estado = 'anulada';
      solicitud.fechaActualizacion = new Date().toISOString();
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  console.log('✅ Oferta anulada:', { id });
  return true;
}

function validarProductosDisponibles(
  oferta: Oferta,
  productos: { productoId: string; cantidadAceptada: number }[]
): boolean {
  if (!ofertaPuedeRecibirSolicitudes(oferta)) {
    return false;
  }

  for (const item of productos) {
    const producto = oferta.productos.find(p => p.productoId === item.productoId);
    if (!producto) return false;
    if (item.cantidadAceptada <= 0) return false;
    if (item.cantidadAceptada > producto.cantidadDisponible) return false;
  }

  return productos.length > 0;
}

function actualizarEstadoDerivadoOferta(oferta: Oferta): void {
  if (oferta.estado === 'anulada' || oferta.activa === false) {
    return;
  }

  if (ofertaEstaExpirada(oferta)) {
    oferta.estado = 'expirada';
    return;
  }

  const todosLosProductosAgotados = oferta.productos.every(p => p.cantidadDisponible === 0);
  const tieneReservasAceptadas =
    oferta.aceptaciones.length > 0 ||
    (oferta.solicitudes || []).some(
      solicitud => solicitud.estado === 'aceptada' || solicitud.estado === 'en_preparacion' || solicitud.estado === 'entregada'
    );

  if (todosLosProductosAgotados) {
    oferta.estado = 'aceptada';
    return;
  }

  oferta.estado = tieneReservasAceptadas ? 'parcial' : 'pendiente';
}

function sincronizarEstadosCaducidad(ofertas: Oferta[]): boolean {
  let actualizadas = false;

  ofertas.forEach(oferta => {
    if (oferta.estado === 'anulada' || oferta.activa === false) {
      return;
    }

    const estadoAnterior = oferta.estado;

    if (ofertaEstaExpirada(oferta)) {
      if (oferta.estado !== 'expirada') {
        oferta.estado = 'expirada';
        actualizadas = true;
      }
      return;
    }

    if (estadoAnterior === 'expirada') {
      actualizarEstadoDerivadoOferta(oferta);
      if (oferta.estado !== estadoAnterior) {
        actualizadas = true;
      }
    }
  });

  return actualizadas;
}

export function crearSolicitudOferta(
  ofertaId: string,
  organismoId: string,
  organismoNombre: string,
  productosAceptados: { productoId: string; cantidadAceptada: number }[],
  observaciones?: string
): boolean {
  const ofertas = obtenerOfertas();
  const oferta = ofertas.find(o => o.id === ofertaId);

  if (!oferta) return false;
  if (!ofertaPuedeRecibirSolicitudes(oferta)) return false;
  if (!validarProductosDisponibles(oferta, productosAceptados)) return false;

  const solicitudExistente = (oferta.solicitudes || []).find(
    solicitud =>
      solicitud.organismoId === organismoId &&
      (solicitud.estado === 'pendiente' || solicitud.estado === 'aceptada' || solicitud.estado === 'en_preparacion')
  );

  if (solicitudExistente) {
    return false;
  }

  if (!oferta.solicitudes) {
    oferta.solicitudes = [];
  }

  oferta.solicitudes.push({
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    organismoId,
    organismoNombre,
    fechaSolicitud: new Date().toISOString(),
    productosAceptados,
    observaciones,
    estado: 'pendiente'
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  console.log('✅ Solicitud de oferta creada:', { ofertaId, organismoId, productosAceptados });
  return true;
}

// Aceptar oferta (completa o parcial)
export function aceptarOferta(
  ofertaId: string,
  organismoId: string,
  productosAceptados: { productoId: string; cantidadAceptada: number }[],
  organismoNombre?: string,
  observaciones?: string
): boolean {
  const ofertas = obtenerOfertas();
  const oferta = ofertas.find(o => o.id === ofertaId);
  
  if (!oferta) return false;
  if (!ofertaPuedeRecibirSolicitudes(oferta)) return false;
  if (!validarProductosDisponibles(oferta, productosAceptados)) return false;
  
  // Crear aceptación
  const aceptacion: AceptacionOferta = {
    organismoId,
    organismoNombre: organismoNombre || '',
    fecha: new Date().toISOString(),
    productos: productosAceptados,
    observaciones
  };
  
  // Actualizar cantidades disponibles
  for (const item of productosAceptados) {
    const producto = oferta.productos.find(p => p.productoId === item.productoId);
    if (producto) {
      producto.cantidadDisponible -= item.cantidadAceptada;
    }
  }
  
  // Agregar aceptación
  oferta.aceptaciones.push(aceptacion);

  actualizarEstadoDerivadoOferta(oferta);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  
  console.log('✅ Oferta aceptada:', { ofertaId, organismoId, productosAceptados });
  return true;
}

// Rechazar oferta
export function rechazarOferta(ofertaId: string, organismoId: string, observaciones?: string): boolean {
  const ofertas = obtenerOfertas();
  const oferta = ofertas.find(o => o.id === ofertaId);
  
  if (!oferta) return false;
  
  // Agregar "aceptación" con cantidad 0 como rechazo
  const rechazo: AceptacionOferta = {
    organismoId,
    organismoNombre: '',
    fecha: new Date().toISOString(),
    productos: [],
    observaciones: observaciones || 'Rechazado por el organismo'
  };
  
  oferta.aceptaciones.push(rechazo);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  
  console.log('✅ Oferta rechazada:', { ofertaId, organismoId });
  return true;
}

// Marcar ofertas expiradas
export function marcarOfertasExpiradas(): number {
  const ofertas = obtenerOfertas();
  let contador = 0;
  
  ofertas.forEach(o => {
    if (o.estado !== 'anulada' && o.activa !== false && ofertaEstaExpirada(o) && o.estado !== 'expirada') {
      o.estado = 'expirada';
      contador++;
    }
  });
  
  if (contador > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
    console.log(`✅ ${contador} ofertas marcadas como expiradas`);
  }
  
  return contador;
}

// Eliminar oferta
export function eliminarOferta(id: string): boolean {
  const ofertas = obtenerOfertas();
  const filtradas = ofertas.filter(o => o.id !== id);
  
  if (filtradas.length === ofertas.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtradas));
  console.log('✅ Oferta eliminada:', id);
  return true;
}

// Obtener estadísticas de ofertas
export function obtenerEstadisticasOfertas() {
  const ofertas = obtenerOfertas();
  
  return {
    total: ofertas.length,
    activas: ofertas.filter(o => o.estado === 'pendiente').length,
    aceptadas: ofertas.filter(o => o.estado === 'aceptada').length,
    parciales: ofertas.filter(o => o.estado === 'parcial').length,
    expiradas: ofertas.filter(o => o.estado === 'expirada').length,
    anuladas: ofertas.filter(o => o.estado === 'anulada').length,
    rechazadas: ofertas.filter(o => o.estado === 'rechazada').length,
  };
}

// Crear ofertas de ejemplo (solo para demostración)
// DESACTIVADA PARA PRODUCCIÓN
export function crearOfertasEjemplo() {
  // No crear ofertas de ejemplo en producción
  return;
  
  /* CÓDIGO ORIGINAL DESACTIVADO
  const ofertasExistentes = obtenerOfertas();
  
  // Si ya hay ofertas, no crear ejemplos
  if (ofertasExistentes.length > 0) {
    console.log('Ya existen ofertas en el sistema');
    return;
  }
  
  // Importar productos y categorías del inventario real
  const productosInventario = obtenerProductos();
  
  const hoy = new Date();
  const enUnaSemana = new Date(hoy);
  enUnaSemana.setDate(enUnaSemana.getDate() + 7);
  
  const enDosSemanas = new Date(hoy);
  enDosSemanas.setDate(enDosSemanas.getDate() + 14);
  
  // Función helper para calcular valores reales de productos
  const calcularProductoOferta = (producto: any, cantidadOfrecida: number): ProductoOferta => {
    const pesoUnitario = producto.peso || producto.pesoUnitario || 0;
    const pesoTotal = cantidadOfrecida * pesoUnitario;
    const valorTotal = calcularValorMonetario(
      pesoTotal,
      producto.categoria,
      producto.subcategoria,
      producto.varianteId
    ) || 0;
    
    return {
      productoId: producto.id,
      productoNombre: producto.nombre,
      productoCodigo: producto.codigo,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      cantidadOfrecida,
      cantidadDisponible: cantidadOfrecida,
      unidad: producto.unidad,
      peso: pesoUnitario,
      valorUnitario: pesoUnitario > 0 ? valorTotal / pesoTotal : 0,
      icono: producto.icono || '📦'
    };
  };
  
  // Buscar productos del inventario para las ofertas
  const arroz = productosInventario.find(p => p.nombre.toLowerCase().includes('arroz'));
  const aceite = productosInventario.find(p => p.nombre.toLowerCase().includes('aceite'));
  const pasta = productosInventario.find(p => p.nombre.toLowerCase().includes('pasta'));
  const manzanas = productosInventario.find(p => p.nombre.toLowerCase().includes('manzana'));
  const zanahorias = productosInventario.find(p => p.nombre.toLowerCase().includes('zanahoria'));
  const atun = productosInventario.find(p => p.nombre.toLowerCase().includes('atún') || p.nombre.toLowerCase().includes('conserva'));
  
  // Oferta 1: Con solicitudes (usar productos reales del inventario si existen)
  const productos1: ProductoOferta[] = [];
  let totalKilos1 = 0;
  let valorTotal1 = 0;
  
  if (arroz) {
    const prod = calcularProductoOferta(arroz, 2); // 2 paletas de arroz
    productos1.push(prod);
    totalKilos1 += prod.cantidadOfrecida * prod.peso;
    valorTotal1 += calcularValorMonetario(totalKilos1, arroz.categoria, arroz.subcategoria, arroz.varianteId) || 0;
  } else {
    // Fallback si no existe
    productos1.push({
      productoId: 'prod-001',
      productoNombre: 'Riz Blanc',
      productoCodigo: 'RIZ-001',
      categoria: 'Céréales',
      cantidadOfrecida: 100,
      cantidadDisponible: 100,
      unidad: 'kg',
      peso: 1,
      valorUnitario: 2.5,
      icono: '🍚'
    });
    totalKilos1 += 100;
    valorTotal1 += 250;
  }
  
  if (aceite) {
    const prod = calcularProductoOferta(aceite, 1); // 1 paleta de aceite
    productos1.push(prod);
    const kilosAceite = prod.cantidadOfrecida * prod.peso;
    totalKilos1 += kilosAceite;
    valorTotal1 += calcularValorMonetario(kilosAceite, aceite.categoria, aceite.subcategoria, aceite.varianteId) || 0;
  } else {
    productos1.push({
      productoId: 'prod-002',
      productoNombre: 'Huile d\'Olive',
      productoCodigo: 'HUIL-002',
      categoria: 'Huiles',
      cantidadOfrecida: 50,
      cantidadDisponible: 50,
      unidad: 'L',
      peso: 0.9,
      valorUnitario: 5.0,
      icono: '🫒'
    });
    totalKilos1 += 45;
    valorTotal1 += 250;
  }
  
  if (pasta) {
    const prod = calcularProductoOferta(pasta, 1); // 1 paleta de pasta
    productos1.push(prod);
    const kilosPasta = prod.cantidadOfrecida * prod.peso;
    totalKilos1 += kilosPasta;
    valorTotal1 += calcularValorMonetario(kilosPasta, pasta.categoria, pasta.subcategoria, pasta.varianteId) || 0;
  } else {
    productos1.push({
      productoId: 'prod-003',
      productoNombre: 'Pâtes',
      productoCodigo: 'PAT-003',
      categoria: 'Céréales',
      cantidadOfrecida: 80,
      cantidadDisponible: 80,
      unidad: 'kg',
      peso: 1,
      valorUnitario: 1.8,
      icono: '🍝'
    });
    totalKilos1 += 80;
    valorTotal1 += 144;
  }
  
  const oferta1 = crearOferta({
    titulo: 'Offre Spéciale - Produits de Base',
    descripcion: 'Lot de produits de base disponibles pour distribution immédiate',
    fechaExpiracion: enUnaSemana.toISOString(),
    creadoPor: 'Administrateur Système',
    productos: productos1,
    organismosDestino: 'todos',
    visible: true,
    activa: true,
    totalProductos: productos1.length,
    totalKilos: totalKilos1,
    valorMonetarioTotal: valorTotal1,
    solicitudes: [
      {
        id: 'sol-001',
        organismoId: 'org-001',
        organismoNombre: 'Cáritas Diocesana',
        fechaSolicitud: new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        productosAceptados: [
          { productoId: productos1[0].productoId, cantidadAceptada: Math.floor(productos1[0].cantidadOfrecida * 0.25) },
          { productoId: productos1[1]?.productoId || 'prod-002', cantidadAceptada: Math.floor((productos1[1]?.cantidadOfrecida || 50) * 0.3) }
        ],
        observaciones: 'Demande depuis le portail de l\'organisme. Date de collecte: lundi, 10 février 2026',
        estado: 'pendiente'
      },
      {
        id: 'sol-002',
        organismoId: 'org-002',
        organismoNombre: 'Cruz Roja Laval',
        fechaSolicitud: new Date(hoy.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        productosAceptados: [
          { productoId: productos1[0].productoId, cantidadAceptada: Math.floor(productos1[0].cantidadOfrecida * 0.3) },
          { productoId: productos1[1]?.productoId || 'prod-002', cantidadAceptada: Math.floor((productos1[1]?.cantidadOfrecida || 50) * 0.3) }
        ],
        observaciones: 'Demande depuis le portail de l\'organisme. Date de collecte: mercredi, 12 février 2026',
        estado: 'aceptada'
      }
    ]
  });
  
  // Reducir cantidades por solicitud aceptada
  const ofertaActualizada1 = obtenerOfertaPorId(oferta1.id);
  if (ofertaActualizada1) {
    ofertaActualizada1.productos[0].cantidadDisponible = Math.floor(productos1[0].cantidadOfrecida * 0.45); // 100 - 25 - 30
    ofertaActualizada1.productos[1].cantidadDisponible = Math.floor((productos1[1]?.cantidadOfrecida || 50) * 0.4); // 50 - 15 - 15
    actualizarOferta(oferta1.id, { productos: ofertaActualizada1.productos });
  }
  
  // Oferta 2: Pendiente sin solicitudes
  const productos2: ProductoOferta[] = [];
  let totalKilos2 = 0;
  let valorTotal2 = 0;
  
  if (manzanas) {
    const prod = calcularProductoOferta(manzanas, 1); // 1 paleta de manzanas
    productos2.push(prod);
    totalKilos2 += prod.cantidadOfrecida * prod.peso;
    valorTotal2 += calcularValorMonetario(totalKilos2, manzanas.categoria, manzanas.subcategoria, manzanas.varianteId) || 0;
  } else {
    productos2.push({
      productoId: 'prod-004',
      productoNombre: 'Pommes',
      productoCodigo: 'FRU-001',
      categoria: 'Fruits',
      cantidadOfrecida: 60,
      cantidadDisponible: 60,
      unidad: 'kg',
      peso: 1,
      valorUnitario: 2.0,
      icono: '🍎'
    });
    totalKilos2 += 60;
    valorTotal2 += 120;
  }
  
  if (zanahorias) {
    const prod = calcularProductoOferta(zanahorias, 1); // 1 paleta de zanahorias
    productos2.push(prod);
    const kilosZanahorias = prod.cantidadOfrecida * prod.peso;
    totalKilos2 += kilosZanahorias;
    valorTotal2 += calcularValorMonetario(kilosZanahorias, zanahorias.categoria, zanahorias.subcategoria, zanahorias.varianteId) || 0;
  } else {
    productos2.push({
      productoId: 'prod-005',
      productoNombre: 'Carottes',
      productoCodigo: 'LEG-001',
      categoria: 'Légumes',
      cantidadOfrecida: 40,
      cantidadDisponible: 40,
      unidad: 'kg',
      peso: 1,
      valorUnitario: 1.5,
      icono: '🥕'
    });
    totalKilos2 += 40;
    valorTotal2 += 60;
  }
  
  crearOferta({
    titulo: 'Produits Frais Disponibles',
    descripcion: 'Fruits et légumes frais de saison',
    fechaExpiracion: enDosSemanas.toISOString(),
    creadoPor: 'Coordinateur Logistique',
    productos: productos2,
    organismosDestino: 'todos',
    visible: true,
    activa: true,
    totalProductos: productos2.length,
    totalKilos: totalKilos2,
    valorMonetarioTotal: valorTotal2
  });
  
  // Oferta 3: Casi agotada
  const productos3: ProductoOferta[] = [];
  let totalKilos3 = 0;
  let valorTotal3 = 0;
  
  if (atun) {
    const prod = calcularProductoOferta(atun, 1); // 1 paleta de atún
    productos3.push(prod);
    totalKilos3 += prod.cantidadOfrecida * prod.peso;
    valorTotal3 += calcularValorMonetario(totalKilos3, atun.categoria, atun.subcategoria, atun.varianteId) || 0;
  } else {
    productos3.push({
      productoId: 'prod-006',
      productoNombre: 'Thon en Conserve',
      productoCodigo: 'CONS-001',
      categoria: 'Conserves',
      cantidadOfrecida: 100,
      cantidadDisponible: 100,
      unidad: 'boîtes',
      peso: 0.2,
      valorUnitario: 3.0,
      icono: '🐟'
    });
    totalKilos3 += 20;
    valorTotal3 += 300;
  }
  
  const oferta3 = crearOferta({
    titulo: 'Lot de Conserves - Dernières Unités',
    descripcion: 'Conserves variées bientôt épuisées',
    fechaExpiracion: enUnaSemana.toISOString(),
    creadoPor: 'Administrateur Système',
    productos: productos3,
    organismosDestino: 'todos',
    visible: true,
    activa: true,
    totalProductos: productos3.length,
    totalKilos: totalKilos3,
    valorMonetarioTotal: valorTotal3,
    solicitudes: [
      {
        id: 'sol-003',
        organismoId: 'org-003',
        organismoNombre: 'Réseau alimentaire communautaire',
        fechaSolicitud: new Date(hoy.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        productosAceptados: [
          { productoId: productos3[0].productoId, cantidadAceptada: Math.floor(productos3[0].cantidadOfrecida * 0.5) }
        ],
        observaciones: 'Demande depuis le portail de l\'organisme. Date de collecte: vendredi, 7 février 2026',
        estado: 'aceptada'
      },
      {
        id: 'sol-004',
        organismoId: 'org-004',
        organismoNombre: 'Comedor Social San José',
        fechaSolicitud: new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        productosAceptados: [
          { productoId: productos3[0].productoId, cantidadAceptada: Math.floor(productos3[0].cantidadOfrecida * 0.45) }
        ],
        observaciones: 'Demande depuis le portail de l\'organisme. Date de collecte: samedi, 8 février 2026',
        estado: 'aceptada'
      }
    ]
  });
  
  // Reducir cantidades por solicitudes aceptadas
  const ofertaActualizada3 = obtenerOfertaPorId(oferta3.id);
  if (ofertaActualizada3) {
    ofertaActualizada3.productos[0].cantidadDisponible = Math.floor(productos3[0].cantidadOfrecida * 0.05); // 100 - 50 - 45
    actualizarOferta(oferta3.id, { productos: ofertaActualizada3.productos });
  }
  
  console.log('✅ Ofertas de ejemplo creadas exitosamente');
  */
}

// === GESTIÓN DE SOLICITUDES ===

// Actualizar estado de una solicitud
export function actualizarEstadoSolicitud(
  ofertaId: string,
  solicitudId: string,
  nuevoEstado: EstadoSolicitud,
  motivoRechazo?: string
): boolean {
  const ofertas = obtenerOfertas();
  const oferta = ofertas.find(o => o.id === ofertaId);
  
  if (!oferta || !oferta.solicitudes) return false;
  
  const solicitud = oferta.solicitudes.find(s => s.id === solicitudId);
  if (!solicitud) return false;
  
  const estadoAnterior = solicitud.estado;

  if (estadoAnterior === 'entregada' && nuevoEstado !== 'entregada') {
    console.error('Una solicitud entregada no puede volver a un estado anterior');
    return false;
  }

  if (nuevoEstado === 'en_preparacion' && estadoAnterior !== 'aceptada') {
    console.error('Solo las solicitudes aceptadas pueden pasar a preparación');
    return false;
  }

  if (nuevoEstado === 'entregada' && estadoAnterior !== 'en_preparacion') {
    console.error('Solo se pueden marcar como entregadas las solicitudes en preparación');
    return false;
  }

  if (nuevoEstado === 'entregada') {
    const resultado = descontarInventarioReservado(
      solicitud.productosAceptados.map(producto => ({
        productoId: producto.productoId,
        cantidad: producto.cantidadAceptada
      }))
    );

    if (!resultado.ok) {
      console.error(resultado.error || 'No fue posible descontar inventario al entregar la oferta');
      return false;
    }
  }

  solicitud.estado = nuevoEstado;
  solicitud.fechaActualizacion = new Date().toISOString();

  if (nuevoEstado === 'en_preparacion') {
    solicitud.preparadoPor = obtenerNombreUsuarioSesion(solicitud.preparadoPor || 'Système');
  }
  
  if (motivoRechazo) {
    solicitud.motivoRechazo = motivoRechazo;
  }
  
  // Aceptar una solicitud reserva cantidades si antes no estaban reservadas
  if (nuevoEstado === 'aceptada' && estadoAnterior !== 'aceptada' && estadoAnterior !== 'en_preparacion') {
    if (!validarProductosDisponibles(oferta, solicitud.productosAceptados)) {
      console.error('No hay suficiente cantidad disponible');
      solicitud.estado = estadoAnterior;
      solicitud.fechaActualizacion = undefined;
      return false;
    }

    for (const prod of solicitud.productosAceptados) {
      const producto = oferta.productos.find(p => p.productoId === prod.productoId);
      if (producto) {
        producto.cantidadDisponible -= prod.cantidadAceptada;
      }
    }
  }
  
  // Si se anula o rechaza una solicitud que estaba aceptada, devolver cantidades
  if ((nuevoEstado === 'anulada' || nuevoEstado === 'rechazada') && (estadoAnterior === 'aceptada' || estadoAnterior === 'en_preparacion')) {
    for (const prod of solicitud.productosAceptados) {
      const producto = oferta.productos.find(p => p.productoId === prod.productoId);
      if (producto) {
        producto.cantidadDisponible += prod.cantidadAceptada;
      }
    }
  }

  actualizarEstadoDerivadoOferta(oferta);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  console.log('✅ Estado de solicitud actualizado:', { ofertaId, solicitudId, nuevoEstado });
  return true;
}

// Editar productos de una solicitud
export function editarSolicitud(
  ofertaId: string,
  solicitudId: string,
  nuevosProductos: { productoId: string; cantidadAceptada: number }[],
  nuevasObservaciones?: string
): boolean {
  const ofertas = obtenerOfertas();
  const oferta = ofertas.find(o => o.id === ofertaId);
  
  if (!oferta || !oferta.solicitudes) return false;
  
  const solicitud = oferta.solicitudes.find(s => s.id === solicitudId);
  if (!solicitud) return false;
  
  // Si la solicitud estaba aceptada, devolver las cantidades anteriores
  if (solicitud.estado === 'aceptada' || solicitud.estado === 'en_preparacion') {
    for (const prod of solicitud.productosAceptados) {
      const producto = oferta.productos.find(p => p.productoId === prod.productoId);
      if (producto) {
        producto.cantidadDisponible += prod.cantidadAceptada;
      }
    }
  }
  
  // Verificar que las nuevas cantidades sean válidas
  for (const prod of nuevosProductos) {
    const producto = oferta.productos.find(p => p.productoId === prod.productoId);
    if (!producto) return false;
    if (prod.cantidadAceptada > producto.cantidadDisponible) {
      console.error('Cantidad solicitada excede la disponible');
      return false;
    }
  }
  
  // Actualizar productos y observaciones
  solicitud.productosAceptados = nuevosProductos;
  if (nuevasObservaciones !== undefined) {
    solicitud.observaciones = nuevasObservaciones;
  }
  solicitud.fechaActualizacion = new Date().toISOString();
  
  // Si la solicitud estaba aceptada, reservar las nuevas cantidades
  if (solicitud.estado === 'aceptada' || solicitud.estado === 'en_preparacion') {
    for (const prod of nuevosProductos) {
      const producto = oferta.productos.find(p => p.productoId === prod.productoId);
      if (producto) {
        producto.cantidadDisponible -= prod.cantidadAceptada;
      }
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ofertas));
  console.log('✅ Solicitud editada:', { ofertaId, solicitudId });
  return true;
}

// Anular solicitud
export function anularSolicitud(ofertaId: string, solicitudId: string): boolean {
  return actualizarEstadoSolicitud(ofertaId, solicitudId, 'anulada');
}

// Aceptar solicitud
export function aceptarSolicitud(ofertaId: string, solicitudId: string): boolean {
  return actualizarEstadoSolicitud(ofertaId, solicitudId, 'aceptada');
}

// Marcar solicitud en preparación
export function marcarSolicitudEnPreparacion(ofertaId: string, solicitudId: string): boolean {
  return actualizarEstadoSolicitud(ofertaId, solicitudId, 'en_preparacion');
}

// Marcar solicitud como entregada
export function marcarSolicitudEntregada(ofertaId: string, solicitudId: string): boolean {
  return actualizarEstadoSolicitud(ofertaId, solicitudId, 'entregada');
}

// Rechazar solicitud
export function rechazarSolicitud(ofertaId: string, solicitudId: string, motivo: string): boolean {
  return actualizarEstadoSolicitud(ofertaId, solicitudId, 'rechazada', motivo);
}