// Sistema de eventos para sincronización automática de organismos
// Cuando un componente crea/actualiza/elimina un organismo, 
// notifica a todos los demás componentes para que recarguen sus datos

export const ORGANISMO_EVENTS = {
  CREATED: 'organismo:created',
  UPDATED: 'organismo:updated',
  DELETED: 'organismo:deleted',
  CHANGED: 'organismo:changed' // Evento genérico para cualquier cambio
} as const;

// Disparar evento de cambio en organismo
export function notificarCambioOrganismo(tipo: keyof typeof ORGANISMO_EVENTS, organismoId?: string) {
  const evento = new CustomEvent(ORGANISMO_EVENTS[tipo], {
    detail: { organismoId, timestamp: Date.now() }
  });
  window.dispatchEvent(evento);
  
  // También disparar el evento genérico
  if (tipo !== 'CHANGED') {
    const eventoGenerico = new CustomEvent(ORGANISMO_EVENTS.CHANGED, {
      detail: { tipo, organismoId, timestamp: Date.now() }
    });
    window.dispatchEvent(eventoGenerico);
  }
  
  console.log(`🔔 Evento de organismo disparado: ${ORGANISMO_EVENTS[tipo]}`, { organismoId });
}

// Hook para escuchar cambios en organismos
export function escucharCambiosOrganismo(callback: () => void): () => void {
  const handler = () => {
    console.log('🔄 Recargando organismos debido a cambio detectado...');
    callback();
  };
  
  // Escuchar el evento genérico de cambios
  window.addEventListener(ORGANISMO_EVENTS.CHANGED, handler);
  
  // Retornar función para limpiar el listener
  return () => {
    window.removeEventListener(ORGANISMO_EVENTS.CHANGED, handler);
  };
}
