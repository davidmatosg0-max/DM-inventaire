/**
 * Lógica de negocio para el módulo de Comandas
 * Maneja la creación, actualización y gestión de comandas
 */

import { toast } from 'sonner';
import { obtenerProductos, actualizarProducto } from './productStorage';
import { obtenerCategorias } from './categoriaStorage';

export interface ComandaProducto {
  productoId: string;
  productoNombre: string;
  productoCodigo?: string;
  cantidad: number;
  unidad: string;
  valorMonetario: number;
  icono?: string;
  categoria?: string;
  subcategoria?: string;
}

export interface Comanda {
  id: string;
  numero: string;
  organismoId: string;
  organismoNombre: string;
  organismoFrecuencia?: 'semanal' | 'quincenal' | 'mensual' | 'eventual';
  fecha: string;
  fechaEntrega?: string;
  estado: 'pendiente' | 'preparada' | 'entregada' | 'cancelada';
  productos: ComandaProducto[];
  observaciones?: string;
  creadoPor: string;
  totalValorMonetario: number;
  totalPeso: number;
  transporteAsignado?: string;
}

// ==================== STORAGE ====================

const COMANDAS_KEY = 'banco_alimentos_comandas';

export function obtenerComandas(): Comanda[] {
  try {
    const datos = localStorage.getItem(COMANDAS_KEY);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error('Error al obtener comandas:', error);
    return [];
  }
}

export function guardarComandas(comandas: Comanda[]): boolean {
  try {
    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandas));
    return true;
  } catch (error) {
    console.error('Error al guardar comandas:', error);
    return false;
  }
}

// ==================== CREAR COMANDA ====================

export function generarNumeroComanda(): string {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `CMD-${año}${mes}${dia}-${timestamp}`;
}

export function calcularValorMonetarioProducto(
  productoId: string,
  cantidad: number
): number {
  const productos = obtenerProductos();
  const producto = productos.find(p => p.id === productoId);
  
  if (!producto) return 0;

  const categorias = obtenerCategorias();
  const categoria = categorias.find(c => c.nombre === producto.categoria);
  
  if (!categoria) return 0;

  const valorPorKg = categoria.valorMonetario || 0;
  
  // Si el producto está en kg, calcular directamente
  if (producto.unidad === 'kg') {
    return cantidad * valorPorKg;
  }
  
  // Si el producto está en otra unidad, intentar convertir
  // Por ahora, asumir 1 unidad = 1kg (esto debería mejorarse)
  return cantidad * valorPorKg;
}

export function crearComanda(
  organismoId: string,
  organismoNombre: string,
  productos: ComandaProducto[],
  fechaEntrega?: string,
  observaciones?: string,
  organismoFrecuencia?: 'semanal' | 'quincenal' | 'mensual' | 'eventual'
): Comanda | null {
  if (!organismoId || !organismoNombre || productos.length === 0) {
    toast.error('Datos incompletos para crear la comanda');
    return null;
  }

  // Verificar stock disponible
  const productosStorage = obtenerProductos();
  for (const item of productos) {
    const producto = productosStorage.find(p => p.id === item.productoId);
    if (!producto) {
      toast.error(`Producto no encontrado: ${item.productoNombre}`);
      return null;
    }
    if (producto.stockActual < item.cantidad) {
      toast.error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stockActual} ${producto.unidad}`);
      return null;
    }
  }

  const comandas = obtenerComandas();
  const totalValorMonetario = productos.reduce((sum, p) => sum + p.valorMonetario, 0);
  const totalPeso = productos.reduce((sum, p) => sum + p.cantidad, 0);

  const nuevaComanda: Comanda = {
    id: Date.now().toString(),
    numero: generarNumeroComanda(),
    organismoId,
    organismoNombre,
    organismoFrecuencia,
    fecha: new Date().toISOString(),
    fechaEntrega,
    estado: 'pendiente',
    productos,
    observaciones,
    creadoPor: 'Usuario Actual', // Esto debería venir del sistema de autenticación
    totalValorMonetario,
    totalPeso,
  };

  comandas.push(nuevaComanda);
  guardarComandas(comandas);

  return nuevaComanda;
}

// ==================== CREAR COMANDAS EN GRUPO ====================

export function crearComandasGrupo(
  organismosIds: string[],
  organismosData: Array<{ id: string; nombre: string; frecuencia?: string }>,
  productos: ComandaProducto[],
  fechaEntrega?: string,
  observaciones?: string
): Comanda[] {
  const comandasCreadas: Comanda[] = [];
  const comandas = obtenerComandas();

  for (const organismoData of organismosData) {
    if (!organismosIds.includes(organismoData.id)) continue;

    const totalValorMonetario = productos.reduce((sum, p) => sum + p.valorMonetario, 0);
    const totalPeso = productos.reduce((sum, p) => sum + p.cantidad, 0);

    const nuevaComanda: Comanda = {
      id: Date.now().toString() + '-' + organismoData.id,
      numero: generarNumeroComanda(),
      organismoId: organismoData.id,
      organismoNombre: organismoData.nombre,
      organismoFrecuencia: organismoData.frecuencia as any,
      fecha: new Date().toISOString(),
      fechaEntrega,
      estado: 'pendiente',
      productos: [...productos],
      observaciones,
      creadoPor: 'Usuario Actual',
      totalValorMonetario,
      totalPeso,
    };

    comandasCreadas.push(nuevaComanda);
  }

  guardarComandas([...comandas, ...comandasCreadas]);
  return comandasCreadas;
}

// ==================== ACTUALIZAR COMANDA ====================

export function actualizarComanda(id: string, datos: Partial<Comanda>): boolean {
  const comandas = obtenerComandas();
  const index = comandas.findIndex(c => c.id === id);
  
  if (index === -1) {
    toast.error('Comanda no encontrada');
    return false;
  }

  comandas[index] = { ...comandas[index], ...datos };
  guardarComandas(comandas);
  return true;
}

export function cambiarEstadoComanda(
  id: string,
  nuevoEstado: 'pendiente' | 'preparada' | 'entregada' | 'cancelada'
): boolean {
  const comandas = obtenerComandas();
  const comanda = comandas.find(c => c.id === id);
  
  if (!comanda) {
    toast.error('Comanda no encontrada');
    return false;
  }

  // Si la comanda se marca como preparada, descontar del inventario
  if (nuevoEstado === 'preparada' && comanda.estado === 'pendiente') {
    const productosStorage = obtenerProductos();
    
    for (const item of comanda.productos) {
      const producto = productosStorage.find(p => p.id === item.productoId);
      if (producto) {
        const nuevoStock = producto.stockActual - item.cantidad;
        if (nuevoStock < 0) {
          toast.error(`Stock insuficiente para ${producto.nombre}`);
          return false;
        }
        actualizarProducto(producto.id, { stockActual: nuevoStock });
      }
    }
  }

  // Si la comanda se cancela después de preparada, devolver al inventario
  if (nuevoEstado === 'cancelada' && comanda.estado === 'preparada') {
    const productosStorage = obtenerProductos();
    
    for (const item of comanda.productos) {
      const producto = productosStorage.find(p => p.id === item.productoId);
      if (producto) {
        const nuevoStock = producto.stockActual + item.cantidad;
        actualizarProducto(producto.id, { stockActual: nuevoStock });
      }
    }
  }

  return actualizarComanda(id, { estado: nuevoEstado });
}

// ==================== ELIMINAR COMANDA ====================

export function eliminarComanda(id: string): boolean {
  const comandas = obtenerComandas();
  const comandaAEliminar = comandas.find(c => c.id === id);
  
  if (!comandaAEliminar) {
    toast.error('Comanda no encontrada');
    return false;
  }

  // Si la comanda estaba preparada, devolver al inventario
  if (comandaAEliminar.estado === 'preparada') {
    const productosStorage = obtenerProductos();
    
    for (const item of comandaAEliminar.productos) {
      const producto = productosStorage.find(p => p.id === item.productoId);
      if (producto) {
        const nuevoStock = producto.stockActual + item.cantidad;
        actualizarProducto(producto.id, { stockActual: nuevoStock });
      }
    }
  }

  const nuevasComandas = comandas.filter(c => c.id !== id);
  guardarComandas(nuevasComandas);
  return true;
}

// ==================== FILTROS Y BÚSQUEDA ====================

export function filtrarComandasPorEstado(estado: string): Comanda[] {
  const comandas = obtenerComandas();
  if (estado === 'todos') return comandas;
  return comandas.filter(c => c.estado === estado);
}

export function filtrarComandasPorOrganismo(organismoId: string): Comanda[] {
  const comandas = obtenerComandas();
  return comandas.filter(c => c.organismoId === organismoId);
}

export function buscarComandas(termino: string): Comanda[] {
  const comandas = obtenerComandas();
  const terminoLower = termino.toLowerCase();
  
  return comandas.filter(c => 
    c.numero.toLowerCase().includes(terminoLower) ||
    c.organismoNombre.toLowerCase().includes(terminoLower) ||
    c.observaciones?.toLowerCase().includes(terminoLower)
  );
}

export function filtrarComandasPorFecha(fechaInicio: string, fechaFin: string): Comanda[] {
  const comandas = obtenerComandas();
  return comandas.filter(c => {
    const fechaComanda = new Date(c.fecha);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return fechaComanda >= inicio && fechaComanda <= fin;
  });
}

// ==================== ESTADÍSTICAS ====================

export function obtenerEstadisticasComandas() {
  const comandas = obtenerComandas();
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const primerDiaSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));

  return {
    total: comandas.length,
    pendientes: comandas.filter(c => c.estado === 'pendiente').length,
    preparadas: comandas.filter(c => c.estado === 'preparada').length,
    entregadas: comandas.filter(c => c.estado === 'entregada').length,
    canceladas: comandas.filter(c => c.estado === 'cancelada').length,
    estaSemana: comandas.filter(c => new Date(c.fecha) >= primerDiaSemana).length,
    esteMes: comandas.filter(c => new Date(c.fecha) >= primerDiaMes).length,
    valorTotalMes: comandas
      .filter(c => new Date(c.fecha) >= primerDiaMes && c.estado !== 'cancelada')
      .reduce((sum, c) => sum + c.totalValorMonetario, 0),
  };
}

// ==================== NOTIFICACIONES ====================

export function obtenerComandasUrgentes(): Comanda[] {
  const comandas = obtenerComandas();
  const hoy = new Date();
  const dosDiasDespues = new Date(hoy.getTime() + (2 * 24 * 60 * 60 * 1000));

  return comandas.filter(c => {
    if (c.estado !== 'pendiente') return false;
    if (!c.fechaEntrega) return false;
    
    const fechaEntrega = new Date(c.fechaEntrega);
    return fechaEntrega <= dosDiasDespues && fechaEntrega >= hoy;
  });
}

// ==================== EXPORTAR/IMPRIMIR ====================

export function exportarComanda(comandaId: string): string {
  const comandas = obtenerComandas();
  const comanda = comandas.find(c => c.id === comandaId);
  
  if (!comanda) {
    return '';
  }

  return JSON.stringify(comanda, null, 2);
}

export function exportarComandasPorFecha(fechaInicio: string, fechaFin: string): string {
  const comandas = filtrarComandasPorFecha(fechaInicio, fechaFin);
  return JSON.stringify(comandas, null, 2);
}
