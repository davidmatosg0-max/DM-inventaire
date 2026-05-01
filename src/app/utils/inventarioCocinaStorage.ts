/**
 * Sistema de Gestión de Inventario de Cuisine
 * Gestiona el stock de productos recibidos desde el inventario general
 * y utilizados en recetas y transformaciones
 */

export type MovimientoInventarioCocina = 'entrada' | 'salida' | 'ajuste' | 'merma';

export interface ProductoInventarioCocina {
  id: string;
  productoId: string; // ID del producto original del inventario general
  productoNombre: string;
  productoCodigo: string;
  categoria: string;
  subcategoria?: string;
  icono: string;
  
  // Stock
  stockActual: number;
  unidad: string;
  peso: number; // peso unitario en kg
  
  // Ubicación en cocina
  ubicacion?: string; // ej: "Refrigerador A", "Despensa 1", etc.
  zona?: 'refrigerado' | 'congelado' | 'seco' | 'fresco';
  
  // Trazabilidad
  lote?: string;
  fechaRecepcion: string;
  fechaCaducidad?: string;
  
  // Metadata
  origenEnvio?: string; // número de envío de donde proviene (ENV-2024-001)
  notas?: string;
  
  // Control
  stockMinimo?: number;
  alertaBaja: boolean;
  fechaCreacion: string;
  ultimaActualizacion: string;
}

export interface MovimientoStock {
  id: string;
  productoInventarioCocinaId: string;
  productoNombre: string;
  tipo: MovimientoInventarioCocina;
  cantidad: number;
  unidad: string;
  stockAnterior: number;
  stockNuevo: number;
  
  // Contexto
  motivo: string;
  referencia?: string; // ID de receta, transformación, etc.
  usuario: string;
  fecha: string;
  notas?: string;
}

const INVENTARIO_COCINA_KEY = 'inventario_cocina';
const MOVIMIENTOS_COCINA_KEY = 'movimientos_inventario_cocina';

// ========== INVENTARIO ==========

export function obtenerInventarioCocina(): ProductoInventarioCocina[] {
  try {
    const data = localStorage.getItem(INVENTARIO_COCINA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener inventario de cocina:', error);
    return [];
  }
}

export function obtenerProductoPorId(id: string): ProductoInventarioCocina | null {
  const inventario = obtenerInventarioCocina();
  return inventario.find(p => p.id === id) || null;
}

export function obtenerProductosPorCategoria(categoria: string): ProductoInventarioCocina[] {
  const inventario = obtenerInventarioCocina();
  return inventario.filter(p => p.categoria === categoria);
}

export function obtenerProductosAlertaBaja(): ProductoInventarioCocina[] {
  const inventario = obtenerInventarioCocina();
  return inventario.filter(p => p.alertaBaja || (p.stockMinimo && p.stockActual <= p.stockMinimo));
}

export function obtenerProductosPorZona(zona: string): ProductoInventarioCocina[] {
  const inventario = obtenerInventarioCocina();
  return inventario.filter(p => p.zona === zona);
}

function guardarInventario(inventario: ProductoInventarioCocina[]): void {
  localStorage.setItem(INVENTARIO_COCINA_KEY, JSON.stringify(inventario));
}

/**
 * Agregar productos al inventario de cocina desde una oferta aceptada
 */
export function agregarProductosDesdeOferta(
  productos: Array<{
    productoId: string;
    productoNombre: string;
    productoCodigo: string;
    categoria: string;
    subcategoria?: string;
    cantidad: number;
    unidad: string;
    peso: number;
    icono: string;
  }>,
  origenEnvio: string,
  usuario: string
): ProductoInventarioCocina[] {
  const inventario = obtenerInventarioCocina();
  const productosAgregados: ProductoInventarioCocina[] = [];
  
  productos.forEach(prod => {
    // Buscar si ya existe el producto en inventario
    const existente = inventario.find(
      p => p.productoId === prod.productoId && 
           p.categoria === prod.categoria &&
           p.subcategoria === prod.subcategoria
    );
    
    if (existente) {
      // Actualizar stock existente
      const stockAnterior = existente.stockActual;
      existente.stockActual += prod.cantidad;
      existente.ultimaActualizacion = new Date().toISOString();
      existente.alertaBaja = existente.stockMinimo ? existente.stockActual <= existente.stockMinimo : false;
      
      // Registrar movimiento
      registrarMovimiento({
        productoInventarioCocinaId: existente.id,
        productoNombre: existente.productoNombre,
        tipo: 'entrada',
        cantidad: prod.cantidad,
        unidad: prod.unidad,
        stockAnterior,
        stockNuevo: existente.stockActual,
        motivo: `Recepción desde inventario general - ${origenEnvio}`,
        referencia: origenEnvio,
        usuario,
        fecha: new Date().toISOString()
      });
      
      productosAgregados.push(existente);
    } else {
      // Crear nuevo producto en inventario
      const nuevoProducto: ProductoInventarioCocina = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        productoId: prod.productoId,
        productoNombre: prod.productoNombre,
        productoCodigo: prod.productoCodigo,
        categoria: prod.categoria,
        subcategoria: prod.subcategoria,
        icono: prod.icono,
        stockActual: prod.cantidad,
        unidad: prod.unidad,
        peso: prod.peso,
        origenEnvio,
        fechaRecepcion: new Date().toISOString(),
        alertaBaja: false,
        fechaCreacion: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      };
      
      inventario.push(nuevoProducto);
      
      // Registrar movimiento
      registrarMovimiento({
        productoInventarioCocinaId: nuevoProducto.id,
        productoNombre: nuevoProducto.productoNombre,
        tipo: 'entrada',
        cantidad: prod.cantidad,
        unidad: prod.unidad,
        stockAnterior: 0,
        stockNuevo: prod.cantidad,
        motivo: `Primera recepción desde inventario general - ${origenEnvio}`,
        referencia: origenEnvio,
        usuario,
        fecha: new Date().toISOString()
      });
      
      productosAgregados.push(nuevoProducto);
    }
  });
  
  guardarInventario(inventario);
  console.log('✅ Productos agregados al inventario de cocina:', productosAgregados);
  return productosAgregados;
}

/**
 * Consumir productos del inventario (para recetas/transformaciones)
 */
export function consumirProducto(
  productoId: string,
  cantidad: number,
  motivo: string,
  referencia: string,
  usuario: string
): boolean {
  const inventario = obtenerInventarioCocina();
  const index = inventario.findIndex(p => p.id === productoId);
  
  if (index === -1) {
    console.error('Producto no encontrado en inventario de cocina');
    return false;
  }
  
  const producto = inventario[index];
  
  if (producto.stockActual < cantidad) {
    console.error('Stock insuficiente');
    return false;
  }
  
  const stockAnterior = producto.stockActual;
  producto.stockActual -= cantidad;
  producto.ultimaActualizacion = new Date().toISOString();
  producto.alertaBaja = producto.stockMinimo ? producto.stockActual <= producto.stockMinimo : false;
  
  // Registrar movimiento
  registrarMovimiento({
    productoInventarioCocinaId: producto.id,
    productoNombre: producto.productoNombre,
    tipo: 'salida',
    cantidad,
    unidad: producto.unidad,
    stockAnterior,
    stockNuevo: producto.stockActual,
    motivo,
    referencia,
    usuario,
    fecha: new Date().toISOString()
  });
  
  guardarInventario(inventario);
  console.log('✅ Producto consumido:', producto.productoNombre, cantidad, producto.unidad);
  return true;
}

/**
 * Ajustar stock manualmente
 */
export function ajustarStock(
  productoId: string,
  nuevoStock: number,
  motivo: string,
  usuario: string,
  notas?: string
): boolean {
  const inventario = obtenerInventarioCocina();
  const index = inventario.findIndex(p => p.id === productoId);
  
  if (index === -1) {
    console.error('Producto no encontrado');
    return false;
  }
  
  const producto = inventario[index];
  const stockAnterior = producto.stockActual;
  producto.stockActual = nuevoStock;
  producto.ultimaActualizacion = new Date().toISOString();
  producto.alertaBaja = producto.stockMinimo ? producto.stockActual <= producto.stockMinimo : false;
  
  // Registrar movimiento
  registrarMovimiento({
    productoInventarioCocinaId: producto.id,
    productoNombre: producto.productoNombre,
    tipo: 'ajuste',
    cantidad: Math.abs(nuevoStock - stockAnterior),
    unidad: producto.unidad,
    stockAnterior,
    stockNuevo: nuevoStock,
    motivo,
    usuario,
    fecha: new Date().toISOString(),
    notas
  });
  
  guardarInventario(inventario);
  console.log('✅ Stock ajustado:', producto.productoNombre, 'de', stockAnterior, 'a', nuevoStock);
  return true;
}

/**
 * Registrar merma/pérdida
 */
export function registrarMerma(
  productoId: string,
  cantidad: number,
  motivo: string,
  usuario: string,
  notas?: string
): boolean {
  const inventario = obtenerInventarioCocina();
  const index = inventario.findIndex(p => p.id === productoId);
  
  if (index === -1) {
    console.error('Producto no encontrado');
    return false;
  }
  
  const producto = inventario[index];
  
  if (producto.stockActual < cantidad) {
    console.error('Stock insuficiente para registrar merma');
    return false;
  }
  
  const stockAnterior = producto.stockActual;
  producto.stockActual -= cantidad;
  producto.ultimaActualizacion = new Date().toISOString();
  producto.alertaBaja = producto.stockMinimo ? producto.stockActual <= producto.stockMinimo : false;
  
  // Registrar movimiento
  registrarMovimiento({
    productoInventarioCocinaId: producto.id,
    productoNombre: producto.productoNombre,
    tipo: 'merma',
    cantidad,
    unidad: producto.unidad,
    stockAnterior,
    stockNuevo: producto.stockActual,
    motivo,
    usuario,
    fecha: new Date().toISOString(),
    notas
  });
  
  guardarInventario(inventario);
  console.log('✅ Merma registrada:', producto.productoNombre, cantidad, producto.unidad);
  return true;
}

/**
 * Actualizar información de producto
 */
export function actualizarProductoInventario(
  productoId: string,
  cambios: Partial<ProductoInventarioCocina>
): boolean {
  const inventario = obtenerInventarioCocina();
  const index = inventario.findIndex(p => p.id === productoId);
  
  if (index === -1) {
    console.error('Producto no encontrado');
    return false;
  }
  
  inventario[index] = {
    ...inventario[index],
    ...cambios,
    ultimaActualizacion: new Date().toISOString()
  };
  
  guardarInventario(inventario);
  console.log('✅ Producto actualizado:', inventario[index].productoNombre);
  return true;
}

/**
 * Eliminar producto del inventario
 */
export function eliminarProductoInventario(productoId: string): boolean {
  const inventario = obtenerInventarioCocina();
  const nuevoInventario = inventario.filter(p => p.id !== productoId);
  
  if (nuevoInventario.length === inventario.length) {
    console.error('Producto no encontrado');
    return false;
  }
  
  guardarInventario(nuevoInventario);
  console.log('✅ Producto eliminado del inventario');
  return true;
}

// ========== MOVIMIENTOS ==========

function obtenerMovimientos(): MovimientoStock[] {
  try {
    const data = localStorage.getItem(MOVIMIENTOS_COCINA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return [];
  }
}

function guardarMovimientos(movimientos: MovimientoStock[]): void {
  localStorage.setItem(MOVIMIENTOS_COCINA_KEY, JSON.stringify(movimientos));
}

function registrarMovimiento(movimiento: Omit<MovimientoStock, 'id'>): void {
  const movimientos = obtenerMovimientos();
  const nuevoMovimiento: MovimientoStock = {
    ...movimiento,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
  };
  
  movimientos.push(nuevoMovimiento);
  guardarMovimientos(movimientos);
}

export function obtenerMovimientosPorProducto(productoId: string): MovimientoStock[] {
  const movimientos = obtenerMovimientos();
  return movimientos
    .filter(m => m.productoInventarioCocinaId === productoId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export function obtenerMovimientosRecientes(limite: number = 50): MovimientoStock[] {
  const movimientos = obtenerMovimientos();
  return movimientos
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limite);
}

export function obtenerMovimientosPorTipo(tipo: MovimientoInventarioCocina): MovimientoStock[] {
  const movimientos = obtenerMovimientos();
  return movimientos.filter(m => m.tipo === tipo);
}

export function obtenerMovimientosPorFecha(fechaInicio: Date, fechaFin: Date): MovimientoStock[] {
  const movimientos = obtenerMovimientos();
  return movimientos.filter(m => {
    const fecha = new Date(m.fecha);
    return fecha >= fechaInicio && fecha <= fechaFin;
  });
}

// ========== ESTADÍSTICAS ==========

export function obtenerEstadisticasInventarioCocina() {
  const inventario = obtenerInventarioCocina();
  const movimientos = obtenerMovimientos();
  
  const totalProductos = inventario.length;
  const productosAlertaBaja = inventario.filter(p => p.alertaBaja || (p.stockMinimo && p.stockActual <= p.stockMinimo)).length;
  
  const pesoTotal = inventario.reduce((sum, p) => {
    if (p.unidad === 'kg') {
      return sum + p.stockActual;
    }
    return sum + (p.stockActual * p.peso);
  }, 0);
  
  const categorias = [...new Set(inventario.map(p => p.categoria))];
  const productosPorCategoria = categorias.map(cat => ({
    categoria: cat,
    cantidad: inventario.filter(p => p.categoria === cat).length,
    peso: inventario
      .filter(p => p.categoria === cat)
      .reduce((sum, p) => {
        if (p.unidad === 'kg') return sum + p.stockActual;
        return sum + (p.stockActual * p.peso);
      }, 0)
  }));
  
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const movimientosMes = movimientos.filter(m => new Date(m.fecha) >= inicioMes);
  
  return {
    totalProductos,
    productosAlertaBaja,
    pesoTotal,
    productosPorCategoria,
    movimientosMes: movimientosMes.length,
    entradasMes: movimientosMes.filter(m => m.tipo === 'entrada').length,
    salidasMes: movimientosMes.filter(m => m.tipo === 'salida').length,
    mermasMes: movimientosMes.filter(m => m.tipo === 'merma').length,
    ultimaActualizacion: inventario.length > 0 
      ? inventario.reduce((latest, p) => {
          const pDate = new Date(p.ultimaActualizacion);
          return pDate > latest ? pDate : latest;
        }, new Date(0)).toISOString()
      : null
  };
}

/**
 * Limpiar inventario (usar con precaución)
 */
export function limpiarInventarioCocina(): void {
  localStorage.removeItem(INVENTARIO_COCINA_KEY);
  localStorage.removeItem(MOVIMIENTOS_COCINA_KEY);
  console.log('⚠️ Inventario de cocina limpiado');
}
