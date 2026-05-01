/**
 * Sistema de Gestión de Recetas y Transformaciones
 * Permite gestionar recetas de cocina y registrar transformaciones de productos
 */

export type UnidadMedida = 'kg' | 'g' | 'L' | 'ml' | 'unité' | 'pièce';

export type CategoriaReceta = 'plat-principal' | 'soupe' | 'dessert' | 'pain' | 'sauce' | 'conserve' | 'autre';

export type EstadoTransformacion = 'planifiée' | 'en-cours' | 'terminée' | 'annulée';

// Ingrediente de una receta
export interface IngredienteReceta {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  unidad: UnidadMedida;
  esOpcional?: boolean;
  notas?: string;
}

// Producto elaborado que se genera de una receta
export interface ProductoElaborado {
  nombre: string;
  cantidad: number;
  unidad: UnidadMedida;
  pesoUnitario: number; // en kg
  diasConservacion: number; // días que dura el producto
}

// Receta
export interface Receta {
  id: string;
  codigo: string; // REC-001
  nombre: string;
  descripcion: string;
  categoria: CategoriaReceta;
  ingredientes: IngredienteReceta[];
  productoElaborado: ProductoElaborado;
  instrucciones: string;
  tiempoPreparacion: number; // minutos
  rendimiento: string; // ej: "100 porciones", "20 kg"
  notasAdicionales?: string;
  activa: boolean;
  fechaCreacion: string;
  creadoPor: string;
  ultimaModificacion?: string;
}

// Registro de transformación (cuando se ejecuta una receta)
export interface Transformacion {
  id: string;
  numeroTransformacion: string; // TRF-2024-001
  recetaId: string;
  recetaNombre: string;
  fecha: string;
  estado: EstadoTransformacion;
  
  // Ingredientes usados (con cantidades reales)
  ingredientesUsados: {
    productoId: string;
    productoNombre: string;
    cantidadPlanificada: number;
    cantidadReal: number;
    unidad: UnidadMedida;
    lote?: string; // lote del inventario
  }[];
  
  // Productos elaborados generados
  productosGenerados: {
    nombre: string;
    cantidadPlanificada: number;
    cantidadReal: number;
    unidad: UnidadMedida;
    pesoTotal: number; // kg
    fechaElaboracion: string;
    fechaCaducidad: string;
    lote: string; // lote generado
  }[];
  
  // Pérdidas/Mermas
  mermas?: {
    descripcion: string;
    cantidad: number;
    unidad: UnidadMedida;
    motivo: string;
  }[];
  
  // Personal
  responsable: string;
  ayudantes?: string[];
  
  // Observaciones
  observaciones?: string;
  incidencias?: string;
  
  fechaInicio?: string;
  fechaFin?: string;
}

const RECETAS_STORAGE_KEY = 'recetas_cocina';
const TRANSFORMACIONES_STORAGE_KEY = 'transformaciones_cocina';

// ========== RECETAS ==========

export function obtenerRecetas(): Receta[] {
  try {
    const data = localStorage.getItem(RECETAS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    return [];
  }
}

export function obtenerRecetasActivas(): Receta[] {
  return obtenerRecetas().filter(r => r.activa);
}

export function obtenerRecetaPorId(id: string): Receta | null {
  const recetas = obtenerRecetas();
  return recetas.find(r => r.id === id) || null;
}

export function generarCodigoReceta(): string {
  const recetas = obtenerRecetas();
  const numero = recetas.length + 1;
  return `REC-${String(numero).padStart(3, '0')}`;
}

export function crearReceta(receta: Omit<Receta, 'id' | 'codigo' | 'fechaCreacion'>): Receta {
  const recetas = obtenerRecetas();
  
  const nuevaReceta: Receta = {
    ...receta,
    id: Date.now().toString(),
    codigo: generarCodigoReceta(),
    fechaCreacion: new Date().toISOString()
  };
  
  recetas.push(nuevaReceta);
  localStorage.setItem(RECETAS_STORAGE_KEY, JSON.stringify(recetas));
  
  console.log('✅ Receta creada:', nuevaReceta);
  return nuevaReceta;
}

export function actualizarReceta(id: string, cambios: Partial<Receta>): boolean {
  const recetas = obtenerRecetas();
  const index = recetas.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  recetas[index] = {
    ...recetas[index],
    ...cambios,
    ultimaModificacion: new Date().toISOString()
  };
  
  localStorage.setItem(RECETAS_STORAGE_KEY, JSON.stringify(recetas));
  console.log('✅ Receta actualizada:', recetas[index]);
  return true;
}

export function eliminarReceta(id: string): boolean {
  const recetas = obtenerRecetas();
  const filtradas = recetas.filter(r => r.id !== id);
  
  if (filtradas.length === recetas.length) return false;
  
  localStorage.setItem(RECETAS_STORAGE_KEY, JSON.stringify(filtradas));
  console.log('✅ Receta eliminada:', id);
  return true;
}

export function duplicarReceta(id: string): Receta | null {
  const receta = obtenerRecetaPorId(id);
  if (!receta) return null;
  
  return crearReceta({
    ...receta,
    nombre: `${receta.nombre} (Copie)`,
    creadoPor: receta.creadoPor
  });
}

// ========== TRANSFORMACIONES ==========

export function obtenerTransformaciones(): Transformacion[] {
  try {
    const data = localStorage.getItem(TRANSFORMACIONES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener transformaciones:', error);
    return [];
  }
}

export function obtenerTransformacionPorId(id: string): Transformacion | null {
  const transformaciones = obtenerTransformaciones();
  return transformaciones.find(t => t.id === id) || null;
}

export function generarNumeroTransformacion(): string {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const transformaciones = obtenerTransformaciones();
  const delMes = transformaciones.filter(t => 
    t.numeroTransformacion.includes(`TRF-${año}-${mes}`)
  );
  const numero = String(delMes.length + 1).padStart(3, '0');
  return `TRF-${año}-${mes}-${numero}`;
}

export function crearTransformacion(
  transformacion: Omit<Transformacion, 'id' | 'numeroTransformacion'>
): Transformacion {
  const transformaciones = obtenerTransformaciones();
  
  const nuevaTransformacion: Transformacion = {
    ...transformacion,
    id: Date.now().toString(),
    numeroTransformacion: generarNumeroTransformacion()
  };
  
  transformaciones.push(nuevaTransformacion);
  localStorage.setItem(TRANSFORMACIONES_STORAGE_KEY, JSON.stringify(transformaciones));
  
  console.log('✅ Transformación creada:', nuevaTransformacion);
  return nuevaTransformacion;
}

export function actualizarTransformacion(id: string, cambios: Partial<Transformacion>): boolean {
  const transformaciones = obtenerTransformaciones();
  const index = transformaciones.findIndex(t => t.id === id);
  
  if (index === -1) return false;
  
  transformaciones[index] = {
    ...transformaciones[index],
    ...cambios
  };
  
  localStorage.setItem(TRANSFORMACIONES_STORAGE_KEY, JSON.stringify(transformaciones));
  console.log('✅ Transformación actualizada:', transformaciones[index]);
  return true;
}

export function eliminarTransformacion(id: string): boolean {
  const transformaciones = obtenerTransformaciones();
  const filtradas = transformaciones.filter(t => t.id !== id);
  
  if (filtradas.length === transformaciones.length) return false;
  
  localStorage.setItem(TRANSFORMACIONES_STORAGE_KEY, JSON.stringify(filtradas));
  console.log('✅ Transformación eliminada:', id);
  return true;
}

// Obtener transformaciones por fecha
export function obtenerTransformacionesPorFecha(fechaInicio: Date, fechaFin: Date): Transformacion[] {
  const transformaciones = obtenerTransformaciones();
  return transformaciones.filter(t => {
    const fecha = new Date(t.fecha);
    return fecha >= fechaInicio && fecha <= fechaFin;
  });
}

// Obtener transformaciones por receta
export function obtenerTransformacionesPorReceta(recetaId: string): Transformacion[] {
  const transformaciones = obtenerTransformaciones();
  return transformaciones.filter(t => t.recetaId === recetaId);
}

// Estadísticas
export function obtenerEstadisticasCocina() {
  const recetas = obtenerRecetas();
  const transformaciones = obtenerTransformaciones();
  
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const transformacionesMes = transformaciones.filter(t => {
    const fecha = new Date(t.fecha);
    return fecha >= inicioMes;
  });
  
  const transformacionesCompletadas = transformacionesMes.filter(t => t.estado === 'terminée');
  
  const totalKgElaborados = transformacionesCompletadas.reduce((sum, t) => {
    return sum + t.productosGenerados.reduce((s, p) => s + p.pesoTotal, 0);
  }, 0);
  
  return {
    totalRecetas: recetas.length,
    recetasActivas: recetas.filter(r => r.activa).length,
    transformacionesMes: transformacionesMes.length,
    transformacionesCompletadas: transformacionesCompletadas.length,
    transformacionesEnCurso: transformacionesMes.filter(t => t.estado === 'en-cours').length,
    totalKgElaborados,
    recetaMasUsada: obtenerRecetaMasUsada()
  };
}

function obtenerRecetaMasUsada(): { nombre: string; usos: number } | null {
  const transformaciones = obtenerTransformaciones();
  const conteo: Record<string, { nombre: string; count: number }> = {};
  
  transformaciones.forEach(t => {
    if (!conteo[t.recetaId]) {
      conteo[t.recetaId] = { nombre: t.recetaNombre, count: 0 };
    }
    conteo[t.recetaId].count++;
  });
  
  const entries = Object.values(conteo);
  if (entries.length === 0) return null;
  
  const max = entries.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  );
  
  return { nombre: max.nombre, usos: max.count };
}

// Inicializar con recetas de ejemplo
export function inicializarRecetasEjemplo(): void {
  const recetasExistentes = obtenerRecetas();
  if (recetasExistentes.length > 0) {
    console.log('Ya existen recetas en el sistema');
    return;
  }
  
  // Receta 1: Soupe aux Légumes
  crearReceta({
    nombre: 'Soupe aux Légumes',
    descripcion: 'Soupe nutritive préparée avec des légumes de saison',
    categoria: 'soupe',
    ingredientes: [
      { productoId: 'prod-carotte', productoNombre: 'Carottes', cantidad: 5, unidad: 'kg' },
      { productoId: 'prod-pomme-terre', productoNombre: 'Pommes de terre', cantidad: 8, unidad: 'kg' },
      { productoId: 'prod-oignon', productoNombre: 'Oignons', cantidad: 2, unidad: 'kg' },
      { productoId: 'prod-celeri', productoNombre: 'Céleri', cantidad: 1, unidad: 'kg' },
      { productoId: 'prod-huile', productoNombre: 'Huile d\'olive', cantidad: 0.5, unidad: 'L' },
    ],
    productoElaborado: {
      nombre: 'Soupe aux Légumes (portions)',
      cantidad: 100,
      unidad: 'pièce',
      pesoUnitario: 0.3,
      diasConservacion: 3
    },
    instrucciones: '1. Laver et couper tous les légumes\n2. Faire revenir les oignons dans l\'huile\n3. Ajouter les légumes et couvrir d\'eau\n4. Cuire 45 minutes\n5. Mixer et assaisonner',
    tiempoPreparacion: 90,
    rendimiento: '100 portions de 300g',
    activa: true,
    creadoPor: 'Chef Cuisine'
  });
  
  // Receta 2: Pain Maison
  crearReceta({
    nombre: 'Pain Maison',
    descripcion: 'Pain frais préparé quotidiennement',
    categoria: 'pain',
    ingredientes: [
      { productoId: 'prod-farine', productoNombre: 'Farine', cantidad: 10, unidad: 'kg' },
      { productoId: 'prod-levure', productoNombre: 'Levure', cantidad: 0.2, unidad: 'kg' },
      { productoId: 'prod-sel', productoNombre: 'Sel', cantidad: 0.15, unidad: 'kg' },
      { productoId: 'prod-huile', productoNombre: 'Huile', cantidad: 0.3, unidad: 'L' },
    ],
    productoElaborado: {
      nombre: 'Pain (miches)',
      cantidad: 20,
      unidad: 'pièce',
      pesoUnitario: 0.5,
      diasConservacion: 2
    },
    instrucciones: '1. Mélanger farine, levure et sel\n2. Ajouter eau tiède et huile\n3. Pétrir 10 minutes\n4. Laisser lever 1h\n5. Former les pains\n6. Cuire 25 min à 220°C',
    tiempoPreparacion: 150,
    rendimiento: '20 miches de 500g',
    activa: true,
    creadoPor: 'Chef Cuisine'
  });
  
  // Receta 3: Ragoût de Poulet
  crearReceta({
    nombre: 'Ragoût de Poulet aux Légumes',
    descripcion: 'Plat complet avec poulet et légumes variés',
    categoria: 'plat-principal',
    ingredientes: [
      { productoId: 'prod-poulet', productoNombre: 'Poulet', cantidad: 15, unidad: 'kg' },
      { productoId: 'prod-carotte', productoNombre: 'Carottes', cantidad: 4, unidad: 'kg' },
      { productoId: 'prod-pomme-terre', productoNombre: 'Pommes de terre', cantidad: 6, unidad: 'kg' },
      { productoId: 'prod-tomate', productoNombre: 'Sauce tomate', cantidad: 3, unidad: 'L' },
      { productoId: 'prod-oignon', productoNombre: 'Oignons', cantidad: 2, unidad: 'kg' },
    ],
    productoElaborado: {
      nombre: 'Ragoût de Poulet (portions)',
      cantidad: 80,
      unidad: 'pièce',
      pesoUnitario: 0.4,
      diasConservacion: 4
    },
    instrucciones: '1. Découper le poulet en morceaux\n2. Faire revenir avec oignons\n3. Ajouter légumes et sauce tomate\n4. Cuire à feu doux 1h30\n5. Assaisonner',
    tiempoPreparacion: 120,
    rendimiento: '80 portions de 400g',
    activa: true,
    creadoPor: 'Chef Cuisine'
  });
  
  console.log('✅ Recetas de ejemplo creadas');
}

// ========== ENVÍO DE PRODUCTOS DESDE INVENTARIO ==========

const PRODUCTOS_COCINA_PENDIENTES_KEY = 'productos_cocina_pendientes';

export interface ProductoCocina {
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  categoria: string;
  subcategoria?: string;
  cantidad: number;
  unidad: string;
  peso: number;
  icono: string;
}

export interface EnvioCocina {
  id: string;
  numeroEnvio: string; // ENV-2024-001
  productos: ProductoCocina[];
  tipoEnvio: 'receta' | 'transformacion' | 'inventario';
  notas?: string;
  usuarioEnvio: string;
  fechaEnvio: string;
  estado: 'pendiente' | 'procesado' | 'cancelado';
  procesadoPor?: string;
  fechaProcesado?: string;
}

export function generarNumeroEnvio(): string {
  const envios = obtenerEnviosCocina();
  const año = new Date().getFullYear();
  const numero = envios.filter(e => e.numeroEnvio.includes(`ENV-${año}`)).length + 1;
  return `ENV-${año}-${String(numero).padStart(3, '0')}`;
}

export function obtenerEnviosCocina(): EnvioCocina[] {
  try {
    const data = localStorage.getItem(PRODUCTOS_COCINA_PENDIENTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener envíos a cocina:', error);
    return [];
  }
}

export function obtenerEnviosPendientes(): EnvioCocina[] {
  return obtenerEnviosCocina().filter(e => e.estado === 'pendiente');
}

export async function enviarProductosACocina(datos: {
  productos: ProductoCocina[];
  tipoEnvio: 'receta' | 'transformacion' | 'inventario';
  notas?: string;
  usuarioEnvio: string;
}): Promise<string> {
  const envios = obtenerEnviosCocina();
  
  const nuevoEnvio: EnvioCocina = {
    id: Date.now().toString(),
    numeroEnvio: generarNumeroEnvio(),
    productos: datos.productos,
    tipoEnvio: datos.tipoEnvio,
    notas: datos.notas,
    usuarioEnvio: datos.usuarioEnvio,
    fechaEnvio: new Date().toISOString(),
    estado: 'pendiente'
  };
  
  envios.push(nuevoEnvio);
  localStorage.setItem(PRODUCTOS_COCINA_PENDIENTES_KEY, JSON.stringify(envios));
  
  console.log('✅ Productos enviados a cocina:', nuevoEnvio);
  return nuevoEnvio.id;
}

export function procesarEnvioCocina(envioId: string, procesadoPor: string): boolean {
  const envios = obtenerEnviosCocina();
  const index = envios.findIndex(e => e.id === envioId);
  
  if (index === -1) {
    console.error('Envío no encontrado');
    return false;
  }
  
  envios[index] = {
    ...envios[index],
    estado: 'procesado',
    procesadoPor,
    fechaProcesado: new Date().toISOString()
  };
  
  localStorage.setItem(PRODUCTOS_COCINA_PENDIENTES_KEY, JSON.stringify(envios));
  console.log('✅ Envío procesado:', envios[index]);
  return true;
}

export function cancelarEnvioCocina(envioId: string): boolean {
  const envios = obtenerEnviosCocina();
  const index = envios.findIndex(e => e.id === envioId);
  
  if (index === -1) {
    console.error('Envío no encontrado');
    return false;
  }
  
  envios[index] = {
    ...envios[index],
    estado: 'cancelado'
  };
  
  localStorage.setItem(PRODUCTOS_COCINA_PENDIENTES_KEY, JSON.stringify(envios));
  console.log('✅ Envío cancelado:', envios[index]);
  return true;
}