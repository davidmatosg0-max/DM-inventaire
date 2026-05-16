// Sistema de almacenamiento y registro de movimientos de inventario

import { MovimientoInventario } from '../types';
import { queueStorageSync } from './cloudPersistence';

const STORAGE_KEY = 'banco_alimentos_movimientos';

export type TipoMovimiento = 
  | 'entrada' 
  | 'salida' 
  | 'transformacion' 
  | 'correccion' 
  | 'distribucion' // Nueva comanda creada
  | 'distribucion_completada' // Comanda entregada
  | 'ajuste_stock' // Ajuste manual de stock
  | 'conversion_unidad'; // Conversión de unidades

export interface MovimientoExtendido extends MovimientoInventario {
  tipo: TipoMovimiento;
  organismoId?: string; // Para distribuciones
  organismoNombre?: string; // Para distribuciones
  numeroComanda?: string; // Para distribuciones
  observaciones?: string;
  cantidadAnterior?: number; // Stock antes del movimiento
  cantidadActual?: number; // Stock después del movimiento
  pesoUnitario?: number; // Peso unitario de entrada (en kg)
  fechaEntrada?: string; // Fecha de entrada del producto
}

/**
 * Obtener todos los movimientos
 */
export function obtenerMovimientos(): MovimientoExtendido[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return [];
  }
}

/**
 * Obtener movimientos de un producto específico
 */
export function obtenerMovimientosProducto(productoId: string): MovimientoExtendido[] {
  const movimientos = obtenerMovimientos();
  return movimientos
    .filter(m => m.productoId === productoId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

/**
 * Actualizar el movimiento de entrada asociado a un documento
 */
export function actualizarMovimientoEntrada(documentoReferencia: string, datos: Partial<MovimientoExtendido>): boolean {
  try {
    const movimientos = obtenerMovimientos();
    const index = movimientos.findIndex(
      movimiento => movimiento.tipo === 'entrada' && movimiento.documentoReferencia === documentoReferencia
    );

    if (index === -1) return false;

    movimientos[index] = {
      ...movimientos[index],
      ...datos,
      id: movimientos[index].id,
      fecha: movimientos[index].fecha,
      tipo: 'entrada',
      documentoReferencia: movimientos[index].documentoReferencia
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientos));
    queueStorageSync(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error al actualizar movimiento de entrada:', error);
    return false;
  }
}

/**
 * Eliminar todos los movimientos asociados a un documento
 */
export function eliminarMovimientosPorDocumento(documentoReferencia: string): number {
  try {
    const movimientos = obtenerMovimientos();
    const movimientosFiltrados = movimientos.filter(
      movimiento => movimiento.documentoReferencia !== documentoReferencia
    );
    const eliminados = movimientos.length - movimientosFiltrados.length;

    if (eliminados > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientosFiltrados));
      queueStorageSync(STORAGE_KEY);
    }

    return eliminados;
  } catch (error) {
    console.error('Error al eliminar movimientos por documento:', error);
    return 0;
  }
}

export function reasignarProductoEnMovimientos(productoIdAnterior: string, productoIdNuevo: string): number {
  try {
    if (!productoIdAnterior || !productoIdNuevo || productoIdAnterior === productoIdNuevo) {
      return 0;
    }

    const movimientos = obtenerMovimientos();
    let actualizados = 0;

    const movimientosActualizados = movimientos.map(movimiento => {
      if (movimiento.productoId !== productoIdAnterior) {
        return movimiento;
      }

      actualizados += 1;
      return {
        ...movimiento,
        productoId: productoIdNuevo,
      };
    });

    if (actualizados > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientosActualizados));
      queueStorageSync(STORAGE_KEY);
    }

    return actualizados;
  } catch (error) {
    console.error('Error al reasignar producto en movimientos:', error);
    return 0;
  }
}

/**
 * Registrar un nuevo movimiento
 */
export function registrarMovimiento(movimiento: Omit<MovimientoExtendido, 'id' | 'fecha'>): MovimientoExtendido {
  try {
    const movimientos = obtenerMovimientos();
    
    const nuevoMovimiento: MovimientoExtendido = {
      ...movimiento,
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fecha: new Date().toISOString()
    };
    
    movimientos.push(nuevoMovimiento);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientos));
    queueStorageSync(STORAGE_KEY);
    
    console.log('✅ Movimiento registrado:', nuevoMovimiento);
    return nuevoMovimiento;
  } catch (error) {
    console.error('❌ Error al registrar movimiento:', error);
    throw error;
  }
}

/**
 * Registrar entrada de producto
 */
export function registrarEntrada(
  productoId: string,
  cantidad: number,
  motivo: string,
  usuario: string,
  documentoReferencia?: string,
  cantidadAnterior?: number,
  cantidadActual?: number,
  pesoUnitario?: number,
  fechaEntrada?: string
): MovimientoExtendido {
  return registrarMovimiento({
    tipo: 'entrada',
    productoId,
    cantidad,
    motivo,
    usuario,
    documentoReferencia,
    cantidadAnterior,
    cantidadActual,
    pesoUnitario,
    fechaEntrada
  });
}

/**
 * Registrar salida de producto
 */
export function registrarSalida(
  productoId: string,
  cantidad: number,
  motivo: string,
  usuario: string,
  documentoReferencia?: string,
  cantidadAnterior?: number,
  cantidadActual?: number
): MovimientoExtendido {
  return registrarMovimiento({
    tipo: 'salida',
    productoId,
    cantidad,
    motivo,
    usuario,
    documentoReferencia,
    cantidadAnterior,
    cantidadActual
  });
}

/**
 * Registrar distribución (creación de comanda)
 */
export function registrarDistribucion(
  productoId: string,
  cantidad: number,
  organismoId: string,
  organismoNombre: string,
  numeroComanda: string,
  usuario: string,
  cantidadAnterior?: number,
  cantidadActual?: number
): MovimientoExtendido {
  return registrarMovimiento({
    tipo: 'distribucion',
    productoId,
    cantidad,
    motivo: `Distribución a ${organismoNombre}`,
    usuario,
    organismoId,
    organismoNombre,
    numeroComanda,
    documentoReferencia: numeroComanda,
    cantidadAnterior,
    cantidadActual
  });
}

/**
 * Registrar distribución completada (entrega de comanda)
 */
export function registrarDistribucionCompletada(
  productoId: string,
  cantidadEntregada: number,
  organismoId: string,
  organismoNombre: string,
  numeroComanda: string,
  usuario: string,
  observaciones?: string,
  cantidadAnterior?: number,
  cantidadActual?: number
): MovimientoExtendido {
  return registrarMovimiento({
    tipo: 'distribucion_completada',
    productoId,
    cantidad: cantidadEntregada,
    motivo: `Entrega completada a ${organismoNombre}`,
    usuario,
    organismoId,
    organismoNombre,
    numeroComanda,
    documentoReferencia: numeroComanda,
    observaciones,
    cantidadAnterior,
    cantidadActual
  });
}

/**
 * Registrar transformación de producto
 */
export function registrarTransformacion(
  productoId: string,
  cantidad: number,
  motivo: string,
  usuario: string,
  documentoReferencia?: string,
  cantidadAnterior?: number,
  cantidadActual?: number
): MovimientoExtendido {
  return registrarMovimiento({
    tipo: 'transformacion',
    productoId,
    cantidad,
    motivo,
    usuario,
    documentoReferencia,
    cantidadAnterior,
    cantidadActual
  });
}

/**
 * Registrar corrección de stock
 */
export function registrarCorreccion(
  productoId: string,
  cantidad: number,
  motivo: string,
  usuario: string,
  cantidadAnterior: number,
  cantidadActual: number
): MovimientoExtendido {
  return registrarMovimiento({
    tipo: 'correccion',
    productoId,
    cantidad,
    motivo,
    usuario,
    cantidadAnterior,
    cantidadActual
  });
}

/**
 * Registrar ajuste de stock
 */
export function registrarAjusteStock(
  productoId: string,
  cantidadAnterior: number,
  cantidadNueva: number,
  motivo: string,
  usuario: string
): MovimientoExtendido {
  const diferencia = cantidadNueva - cantidadAnterior;
  
  return registrarMovimiento({
    tipo: 'ajuste_stock',
    productoId,
    cantidad: Math.abs(diferencia),
    motivo: `${motivo} (${diferencia > 0 ? '+' : ''}${diferencia})`,
    usuario,
    cantidadAnterior,
    cantidadActual: cantidadNueva
  });
}

/**
 * Registrar conversión de unidades
 */
export function registrarConversionUnidad(
  productoId: string,
  cantidadAnterior: number,
  cantidadNueva: number,
  unidadAnterior: string,
  unidadNueva: string,
  usuario: string
): MovimientoExtendido {
  return registrarMovimiento({
    tipo: 'conversion_unidad',
    productoId,
    cantidad: cantidadNueva,
    motivo: `Conversión de ${cantidadAnterior} ${unidadAnterior} a ${cantidadNueva} ${unidadNueva}`,
    usuario,
    cantidadAnterior,
    cantidadActual: cantidadNueva
  });
}

/**
 * Obtener estadísticas de movimientos por producto
 */
export function obtenerEstadisticasProducto(productoId: string) {
  const movimientos = obtenerMovimientosProducto(productoId);
  
  return {
    totalEntradas: movimientos
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.cantidad, 0),
    
    totalSalidas: movimientos
      .filter(m => m.tipo === 'salida')
      .reduce((sum, m) => sum + m.cantidad, 0),
    
    totalDistribuciones: movimientos
      .filter(m => m.tipo === 'distribucion')
      .reduce((sum, m) => sum + m.cantidad, 0),
    
    totalDistribucionesCompletadas: movimientos
      .filter(m => m.tipo === 'distribucion_completada')
      .reduce((sum, m) => sum + m.cantidad, 0),
    
    totalTransformaciones: movimientos
      .filter(m => m.tipo === 'transformacion')
      .reduce((sum, m) => sum + m.cantidad, 0),
    
    totalCorrecciones: movimientos
      .filter(m => m.tipo === 'correccion')
      .reduce((sum, m) => sum + m.cantidad, 0),
    
    totalAjustes: movimientos
      .filter(m => m.tipo === 'ajuste_stock')
      .reduce((sum, m) => sum + m.cantidad, 0),
    
    totalConversiones: movimientos
      .filter(m => m.tipo === 'conversion_unidad').length,
    
    totalMovimientos: movimientos.length,
    
    ultimoMovimiento: movimientos[0] || null
  };
}

/**
 * Obtener movimientos por rango de fechas
 */
export function obtenerMovimientosPorFecha(
  fechaInicio: string,
  fechaFin: string,
  productoId?: string
): MovimientoExtendido[] {
  let movimientos = obtenerMovimientos();
  
  if (productoId) {
    movimientos = movimientos.filter(m => m.productoId === productoId);
  }
  
  return movimientos.filter(m => {
    const fechaMov = new Date(m.fecha);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return fechaMov >= inicio && fechaMov <= fin;
  });
}

/**
 * Limpiar movimientos (útil para testing)
 */
export function limpiarMovimientos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    queueStorageSync(STORAGE_KEY);
    console.log('✅ Movimientos limpiados');
  } catch (error) {
    console.error('Error al limpiar movimientos:', error);
  }
}

/**
 * Exportar movimientos a JSON
 */
export function exportarMovimientos(): string {
  const movimientos = obtenerMovimientos();
  return JSON.stringify(movimientos, null, 2);
}