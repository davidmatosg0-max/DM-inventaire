// Almacenamiento de verificaciones de vehículos
import { VerificacionVehiculo } from '../types/verificacion';

const STORAGE_KEY = 'banco_alimentos_verificaciones';

/**
 * Obtener todas las verificaciones del localStorage
 */
export function obtenerVerificaciones(): VerificacionVehiculo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error al obtener verificaciones:', error);
    return [];
  }
}

/**
 * Guardar una nueva verificación
 */
export function guardarVerificacion(verificacion: VerificacionVehiculo): boolean {
  try {
    const verificaciones = obtenerVerificaciones();
    verificaciones.unshift(verificacion); // Agregar al inicio
    localStorage.setItem(STORAGE_KEY, JSON.stringify(verificaciones));
    return true;
  } catch (error) {
    console.error('Error al guardar verificación:', error);
    return false;
  }
}

/**
 * Obtener verificaciones por vehículo
 */
export function obtenerVerificacionesPorVehiculo(vehiculoId: string): VerificacionVehiculo[] {
  const verificaciones = obtenerVerificaciones();
  return verificaciones.filter(v => v.vehiculoId === vehiculoId);
}

/**
 * Obtener la última verificación de un vehículo
 */
export function obtenerUltimaVerificacion(vehiculoId: string): VerificacionVehiculo | null {
  const verificaciones = obtenerVerificacionesPorVehiculo(vehiculoId);
  return verificaciones.length > 0 ? verificaciones[0] : null;
}

/**
 * Obtener verificaciones por conductor
 */
export function obtenerVerificacionesPorConductor(conductorId: string): VerificacionVehiculo[] {
  const verificaciones = obtenerVerificaciones();
  return verificaciones.filter(v => v.conductorId === conductorId);
}

/**
 * Obtener verificaciones por fecha
 */
export function obtenerVerificacionesPorFecha(fecha: string): VerificacionVehiculo[] {
  const verificaciones = obtenerVerificaciones();
  return verificaciones.filter(v => v.fecha === fecha);
}

/**
 * Obtener verificaciones con problemas (no aptas o con observaciones)
 */
export function obtenerVerificacionesConProblemas(): VerificacionVehiculo[] {
  const verificaciones = obtenerVerificaciones();
  return verificaciones.filter(v => 
    v.estadoGeneral === 'no_apto' || 
    v.estadoGeneral === 'apto_con_observaciones'
  );
}

/**
 * Eliminar una verificación
 */
export function eliminarVerificacion(verificacionId: string): boolean {
  try {
    const verificaciones = obtenerVerificaciones();
    const filtradas = verificaciones.filter(v => v.id !== verificacionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtradas));
    return true;
  } catch (error) {
    console.error('Error al eliminar verificación:', error);
    return false;
  }
}

/**
 * Generar ID único para verificación
 */
export function generarIdVerificacion(): string {
  return `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
