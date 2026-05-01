/**
 * Sistema de almacenamiento para mensajes de contacto
 * Guarda todos los mensajes enviados desde el formulario de contacto
 */

const STORAGE_KEY = 'mensajes_contacto';

export interface MensajeContacto {
  id: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
  respondido: boolean;
  prioridad: 'baja' | 'media' | 'alta';
}

/**
 * Obtener todos los mensajes de contacto
 */
export function obtenerMensajesContacto(): MensajeContacto[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error al leer mensajes de contacto:', error);
    return [];
  }
}

/**
 * Guardar un nuevo mensaje de contacto
 */
export function guardarMensajeContacto(
  nombre: string,
  email: string,
  asunto: string,
  mensaje: string
): MensajeContacto {
  const mensajes = obtenerMensajesContacto();
  
  const nuevoMensaje: MensajeContacto = {
    id: `contacto-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    nombre: nombre.trim(),
    email: email.trim(),
    asunto: asunto.trim(),
    mensaje: mensaje.trim(),
    fecha: new Date().toISOString(),
    leido: false,
    respondido: false,
    prioridad: 'media'
  };
  
  mensajes.unshift(nuevoMensaje); // Agregar al inicio
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes));
    console.log('✅ Mensaje de contacto guardado:', nuevoMensaje.id);
    return nuevoMensaje;
  } catch (error) {
    console.error('❌ Error al guardar mensaje de contacto:', error);
    throw error;
  }
}

/**
 * Marcar mensaje como leído
 */
export function marcarMensajeComoLeido(id: string): boolean {
  const mensajes = obtenerMensajesContacto();
  const mensaje = mensajes.find(m => m.id === id);
  
  if (!mensaje) return false;
  
  mensaje.leido = true;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes));
    return true;
  } catch (error) {
    console.error('❌ Error al marcar mensaje como leído:', error);
    return false;
  }
}

/**
 * Marcar mensaje como respondido
 */
export function marcarMensajeComoRespondido(id: string): boolean {
  const mensajes = obtenerMensajesContacto();
  const mensaje = mensajes.find(m => m.id === id);
  
  if (!mensaje) return false;
  
  mensaje.respondido = true;
  mensaje.leido = true;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes));
    return true;
  } catch (error) {
    console.error('❌ Error al marcar mensaje como respondido:', error);
    return false;
  }
}

/**
 * Cambiar prioridad de un mensaje
 */
export function cambiarPrioridadMensaje(id: string, prioridad: 'baja' | 'media' | 'alta'): boolean {
  const mensajes = obtenerMensajesContacto();
  const mensaje = mensajes.find(m => m.id === id);
  
  if (!mensaje) return false;
  
  mensaje.prioridad = prioridad;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes));
    return true;
  } catch (error) {
    console.error('❌ Error al cambiar prioridad del mensaje:', error);
    return false;
  }
}

/**
 * Eliminar un mensaje de contacto
 */
export function eliminarMensajeContacto(id: string): boolean {
  const mensajes = obtenerMensajesContacto();
  const nuevosMensajes = mensajes.filter(m => m.id !== id);
  
  if (nuevosMensajes.length === mensajes.length) return false;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosMensajes));
    console.log('✅ Mensaje de contacto eliminado:', id);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar mensaje de contacto:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de mensajes
 */
export function obtenerEstadisticasMensajes() {
  const mensajes = obtenerMensajesContacto();
  
  return {
    total: mensajes.length,
    noLeidos: mensajes.filter(m => !m.leido).length,
    pendientes: mensajes.filter(m => !m.respondido).length,
    porPrioridad: {
      alta: mensajes.filter(m => m.prioridad === 'alta').length,
      media: mensajes.filter(m => m.prioridad === 'media').length,
      baja: mensajes.filter(m => m.prioridad === 'baja').length
    }
  };
}

/**
 * Limpiar todos los mensajes (para mantenimiento)
 */
export function limpiarTodosMensajes(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Todos los mensajes de contacto eliminados');
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar mensajes:', error);
    return false;
  }
}
