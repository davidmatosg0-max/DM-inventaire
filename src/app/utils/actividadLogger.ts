/**
 * Sistema de Registro de Actividades
 * Última actualización: 2026-03-17 - Soporte para nombre completo
 * 
 * Este módulo permite registrar todas las acciones de los usuarios
 * en el sistema para auditoría y seguimiento.
 * 
 * USO:
 * 
 * 1. Importar la función:
 *    import { registrarActividad } from '../utils/actividadLogger';
 * 
 * 2. Llamar después de cada acción importante:
 *    registrarActividad('Inventario', 'crear', 'Producto \"Arroz 1kg\" creado');
 *    registrarActividad('Organismos', 'modificar', 'Organismo \"Cruz Roja\" actualizado');
 *    registrarActividad('Comandas', 'eliminar', 'Comanda #123 eliminada');
 */

export interface ActividadLog {
  id: string;
  fecha: string;
  hora: string;
  usuario: string;
  usuarioId: string;
  modulo: string;
  accion: 'crear' | 'modificar' | 'eliminar';
  descripcion: string;
  detalles?: any;
  ipAddress?: string;
}

/**
 * Registra una actividad en el sistema
 * 
 * @param modulo - Nombre del módulo donde ocurre la acción (ej: 'Inventario', 'Organismos', 'Comandas')
 * @param accion - Tipo de acción: 'crear', 'modificar', 'eliminar'
 * @param descripcion - Descripción legible de la acción realizada
 * @param detalles - (Opcional) Objeto con detalles adicionales para referencia
 * @returns El objeto de actividad creado
 * 
 * @example
 * // Al crear un producto
 * registrarActividad('Inventario', 'crear', `Producto "${producto.nombre}" creado`, { productoId: producto.id });
 * 
 * // Al modificar un organismo
 * registrarActividad('Organismos', 'modificar', `Organismo "${organismo.nombre}" modificado`, { organismoId: organismo.id });
 * 
 * // Al eliminar una comanda
 * registrarActividad('Comandas', 'eliminar', `Comanda #${comanda.numero} eliminada`, { comandaId: comanda.id });
 */
export const registrarActividad = (
  modulo: string,
  accion: 'crear' | 'modificar' | 'eliminar',
  descripcion: string,
  detalles?: any
): ActividadLog | undefined => {
  try {
    // Obtener usuario actual desde usuario_sesion_banco_alimentos (guardado por sesionStorage.ts)
    const usuario = JSON.parse(localStorage.getItem('usuario_sesion_banco_alimentos') || '{}');
    
    // Crear objeto de actividad
    const actividad: ActividadLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fecha: new Date().toLocaleDateString('fr-CA'), // Formato YYYY-MM-DD
      hora: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      usuario: `${usuario.nombre || 'Usuario'} ${usuario.apellido || ''}`.trim(),
      usuarioId: usuario.id || 'unknown',
      modulo,
      accion,
      descripcion,
      detalles,
      ipAddress: 'local' // En producción se obtendría del servidor
    };

    // Obtener actividades existentes
    const actividadesExistentes = JSON.parse(localStorage.getItem('registroActividades') || '[]');
    
    // Agregar nueva actividad al principio
    const actividadesActualizadas = [actividad, ...actividadesExistentes];
    
    // Limitar a las últimas 1000 actividades para no sobrecargar localStorage
    const actividadesLimitadas = actividadesActualizadas.slice(0, 1000);
    
    // Guardar en localStorage
    localStorage.setItem('registroActividades', JSON.stringify(actividadesLimitadas));
    
    // Emitir evento para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent('actividadRegistrada', { detail: actividad }));
    
    console.log(`📝 Actividad registrada: ${modulo} - ${accion} - ${descripcion}`);
    
    return actividad;
  } catch (error) {
    console.error('❌ Error al registrar actividad:', error);
    return undefined;
  }
};

/**
 * Obtiene todas las actividades registradas
 * @returns Array de actividades
 */
export const obtenerActividades = (): ActividadLog[] => {
  try {
    const actividades = JSON.parse(localStorage.getItem('registroActividades') || '[]');
    return actividades;
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return [];
  }
};

/**
 * Limpia todas las actividades registradas
 */
export const limpiarActividades = (): void => {
  try {
    localStorage.removeItem('registroActividades');
    window.dispatchEvent(new Event('actividadesLimpiadas'));
    console.log('✅ Registro de actividades limpiado');
  } catch (error) {
    console.error('Error al limpiar actividades:', error);
  }
};

/**
 * Exporta las actividades a JSON
 * @returns String JSON con las actividades
 */
export const exportarActividadesJSON = (): string => {
  const actividades = obtenerActividades();
  return JSON.stringify(actividades, null, 2);
};