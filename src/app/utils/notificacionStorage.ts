import { NotificacionComanda } from '../types';
import { formatMoney } from './formatUtils';
import { construirRutaAccesoOrganismo } from './organismoAccessLinks';

const STORAGE_KEY = 'notificaciones_comandas';
const STORAGE_KEY_OFERTAS = 'notificaciones_ofertas';
export const NOTIFICACIONES_COMANDA_EVENT = 'notificaciones-comanda-actualizadas';

function emitirEventoNotificacionComanda(notificacion: NotificacionComanda): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(NOTIFICACIONES_COMANDA_EVENT, {
    detail: {
      notificacionId: notificacion.id,
      comandaId: notificacion.comandaId,
      organismoId: notificacion.organismoId,
      tipo: notificacion.tipo,
      leida: notificacion.leida,
    }
  }));
}

export type NotificacionOferta = {
  id: string;
  ofertaId: string;
  organismoId: string; // 'todos' si es para todos los organismos
  tipo: 'nueva_oferta' | 'oferta_aceptada' | 'oferta_expirando' | 'oferta_expirada';
  mensaje: string;
  fecha: string;
  leida: boolean;
  urlAcceso?: string;
  prioridad?: 'alta' | 'media' | 'baja';
};

export const obtenerNotificaciones = (): NotificacionComanda[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
};

export const guardarNotificacion = (notificacion: NotificacionComanda): void => {
  try {
    const notificaciones = obtenerNotificaciones();
    notificaciones.push(notificacion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notificaciones));
    emitirEventoNotificacionComanda(notificacion);
  } catch (error) {
    console.error('Error al guardar notificación:', error);
    throw error;
  }
};

export const obtenerNotificacionesPorOrganismo = (organismoId: string): NotificacionComanda[] => {
  const notificaciones = obtenerNotificaciones();
  return notificaciones.filter(n => n.organismoId === organismoId);
};

export const obtenerNotificacionesNoLeidas = (organismoId: string): NotificacionComanda[] => {
  const notificaciones = obtenerNotificacionesPorOrganismo(organismoId);
  return notificaciones.filter(n => !n.leida);
};

export const marcarNotificacionComoLeida = (notificacionId: string): void => {
  try {
    const notificaciones = obtenerNotificaciones();
    const index = notificaciones.findIndex(n => n.id === notificacionId);
    if (index !== -1) {
      notificaciones[index].leida = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notificaciones));
      emitirEventoNotificacionComanda(notificaciones[index]);
    }
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

export const crearNotificacionNuevaComanda = (
  comandaId: string,
  comandaNumero: string,
  organismoId: string,
  claveAcceso?: string
): NotificacionComanda => {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    comandaId,
    organismoId,
    tipo: 'nueva_comanda',
    mensaje: `Nouvelle commande ${comandaNumero} disponible pour confirmation`,
    fecha: new Date().toISOString(),
    leida: false,
    urlAcceso: construirRutaAccesoOrganismo(claveAcceso)
  };
};

const ETIQUETAS_ESTADO_NOTIF_FR: Record<string, string> = {
  pendiente: 'En attente',
  confirmada: 'acceptée',
  en_preparacion: 'en préparation',
  completada: 'complétée',
  entregada: 'livrée',
  anulada: 'annulée',
  rechazada: 'refusée',
};

export const crearNotificacionCambioEstadoComanda = (
  comandaId: string,
  comandaNumero: string,
  organismoId: string,
  nuevoEstado: string,
  claveAcceso?: string
): NotificacionComanda => {
  const etiqueta = ETIQUETAS_ESTADO_NOTIF_FR[nuevoEstado] || nuevoEstado;
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    comandaId,
    organismoId,
    tipo: 'cambio_estado',
    mensaje: `Commande ${comandaNumero} ${etiqueta}`,
    fecha: new Date().toISOString(),
    leida: false,
    urlAcceso: construirRutaAccesoOrganismo(claveAcceso),
  };
};

// ============ FUNCIONES PARA NOTIFICACIONES DE OFERTAS ============

export const obtenerNotificacionesOfertas = (): NotificacionOferta[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_OFERTAS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener notificaciones de ofertas:', error);
    return [];
  }
};

export const guardarNotificacionOferta = (notificacion: NotificacionOferta): void => {
  try {
    const notificaciones = obtenerNotificacionesOfertas();
    notificaciones.push(notificacion);
    localStorage.setItem(STORAGE_KEY_OFERTAS, JSON.stringify(notificaciones));
  } catch (error) {
    console.error('Error al guardar notificación de oferta:', error);
    throw error;
  }
};

export const obtenerNotificacionesOfertasPorOrganismo = (organismoId: string): NotificacionOferta[] => {
  const notificaciones = obtenerNotificacionesOfertas();
  return notificaciones.filter(n => n.organismoId === organismoId || n.organismoId === 'todos');
};

export const obtenerNotificacionesOfertasNoLeidas = (organismoId: string): NotificacionOferta[] => {
  const notificaciones = obtenerNotificacionesOfertasPorOrganismo(organismoId);
  return notificaciones.filter(n => !n.leida);
};

export const marcarNotificacionOfertaComoLeida = (notificacionId: string): void => {
  try {
    const notificaciones = obtenerNotificacionesOfertas();
    const index = notificaciones.findIndex(n => n.id === notificacionId);
    if (index !== -1) {
      notificaciones[index].leida = true;
      localStorage.setItem(STORAGE_KEY_OFERTAS, JSON.stringify(notificaciones));
    }
  } catch (error) {
    console.error('Error al marcar notificación de oferta como leída:', error);
    throw error;
  }
};

export const crearNotificacionNuevaOferta = (
  ofertaId: string, 
  numeroOferta: string, 
  organismoId: string,
  titulo: string,
  totalProductos: number,
  valorTotal: number
): NotificacionOferta => {
  return {
    id: `notif-oferta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ofertaId,
    organismoId,
    tipo: 'nueva_oferta',
    mensaje: `🏷️ Nueva oferta disponible: ${titulo} - ${totalProductos} productos (CAD$ ${formatMoney(valorTotal)})`,
    fecha: new Date().toISOString(),
    leida: false,
    urlAcceso: `/ofertas?oferta=${ofertaId}`,
    prioridad: 'alta'
  };
};

export const crearNotificacionOfertaExpirando = (
  ofertaId: string, 
  numeroOferta: string, 
  organismoId: string,
  horasRestantes: number
): NotificacionOferta => {
  return {
    id: `notif-oferta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ofertaId,
    organismoId,
    tipo: 'oferta_expirando',
    mensaje: `⏰ La oferta ${numeroOferta} expira en ${horasRestantes} horas`,
    fecha: new Date().toISOString(),
    leida: false,
    urlAcceso: `/ofertas?oferta=${ofertaId}`,
    prioridad: 'alta'
  };
};