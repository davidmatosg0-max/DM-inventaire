import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notificacion {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'alerta';
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  link?: string; // Link opcional para navegar
  datos?: any; // Datos adicionales
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  categoria?: 'inventario' | 'comandas' | 'organismos' | 'transporte' | 'sistema';
}

interface NotificacionesState {
  notificaciones: Notificacion[];
  noLeidas: number;
  agregarNotificacion: (notificacion: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => void;
  marcarComoLeida: (id: string) => void;
  marcarTodasComoLeidas: () => void;
  eliminarNotificacion: (id: string) => void;
  eliminarTodas: () => void;
  obtenerNoLeidas: () => Notificacion[];
  obtenerPorCategoria: (categoria: string) => Notificacion[];
}

export const useNotificaciones = create<NotificacionesState>()(
  persist(
    (set, get) => ({
      notificaciones: [],
      noLeidas: 0,

      agregarNotificacion: (notificacionData) => {
        const nuevaNotificacion: Notificacion = {
          ...notificacionData,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fecha: new Date(),
          leida: false,
        };

        set((state) => ({
          notificaciones: [nuevaNotificacion, ...state.notificaciones],
          noLeidas: state.noLeidas + 1,
        }));
      },

      marcarComoLeida: (id) => {
        set((state) => {
          const notificacion = state.notificaciones.find((n) => n.id === id);
          if (!notificacion || notificacion.leida) return state;

          return {
            notificaciones: state.notificaciones.map((n) =>
              n.id === id ? { ...n, leida: true } : n
            ),
            noLeidas: state.noLeidas - 1,
          };
        });
      },

      marcarTodasComoLeidas: () => {
        set((state) => ({
          notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
          noLeidas: 0,
        }));
      },

      eliminarNotificacion: (id) => {
        set((state) => {
          const notificacion = state.notificaciones.find((n) => n.id === id);
          const esNoLeida = notificacion && !notificacion.leida;

          return {
            notificaciones: state.notificaciones.filter((n) => n.id !== id),
            noLeidas: esNoLeida ? state.noLeidas - 1 : state.noLeidas,
          };
        });
      },

      eliminarTodas: () => {
        set({ notificaciones: [], noLeidas: 0 });
      },

      obtenerNoLeidas: () => {
        return get().notificaciones.filter((n) => !n.leida);
      },

      obtenerPorCategoria: (categoria) => {
        return get().notificaciones.filter((n) => n.categoria === categoria);
      },
    }),
    {
      name: 'notificaciones-storage',
    }
  )
);

// ===== FUNCIONES AUXILIARES PARA CREAR NOTIFICACIONES =====

/**
 * Notificación de stock crítico
 */
export function notificarStockCritico(producto: {
  nombre: string;
  stockActual: number;
  stockMinimo: number;
}) {
  const { agregarNotificacion } = useNotificaciones.getState();

  agregarNotificacion({
    tipo: 'warning',
    titulo: '⚠️ Stock Crítico',
    mensaje: `El producto "${producto.nombre}" tiene stock bajo (${producto.stockActual}/${producto.stockMinimo})`,
    prioridad: 'alta',
    categoria: 'inventario',
    datos: { producto },
  });
}

/**
 * Notificación de caducidad próxima
 */
export function notificarCaducidadProxima(producto: {
  nombre: string;
  fechaVencimiento: Date;
  diasRestantes: number;
}) {
  const { agregarNotificacion } = useNotificaciones.getState();

  agregarNotificacion({
    tipo: 'error',
    titulo: '📅 Caducidad Próxima',
    mensaje: `"${producto.nombre}" caduca en ${producto.diasRestantes} días`,
    prioridad: producto.diasRestantes <= 7 ? 'urgente' : 'alta',
    categoria: 'inventario',
    datos: { producto },
  });
}

/**
 * Notificación de nueva comanda
 */
export function notificarNuevaComanda(comanda: { numero: string; organismo: string }) {
  const { agregarNotificacion } = useNotificaciones.getState();

  agregarNotificacion({
    tipo: 'success',
    titulo: '✅ Nueva Comanda',
    mensaje: `Comanda #${comanda.numero} creada para ${comanda.organismo}`,
    prioridad: 'media',
    categoria: 'comandas',
    datos: { comanda },
  });
}

/**
 * Notificación de comanda urgente
 */
export function notificarComandaUrgente(comanda: { numero: string; organismo: string }) {
  const { agregarNotificacion } = useNotificaciones.getState();

  agregarNotificacion({
    tipo: 'error',
    titulo: '🚨 Comanda Urgente',
    mensaje: `Comanda #${comanda.numero} de ${comanda.organismo} requiere atención inmediata`,
    prioridad: 'urgente',
    categoria: 'comandas',
    datos: { comanda },
  });
}

/**
 * Notificación de ruta asignada
 */
export function notificarRutaAsignada(ruta: { numero: string; conductor: string }) {
  const { agregarNotificacion } = useNotificaciones.getState();

  agregarNotificacion({
    tipo: 'info',
    titulo: '🚛 Ruta Asignada',
    mensaje: `Ruta #${ruta.numero} asignada a ${ruta.conductor}`,
    prioridad: 'media',
    categoria: 'transporte',
    datos: { ruta },
  });
}

/**
 * Notificación de nuevo organismo registrado
 */
export function notificarNuevoOrganismo(organismo: { nombre: string; tipo: string }) {
  const { agregarNotificacion } = useNotificaciones.getState();

  agregarNotificacion({
    tipo: 'success',
    titulo: '🏢 Nuevo Organismo',
    mensaje: `${organismo.nombre} (${organismo.tipo}) registrado exitosamente`,
    prioridad: 'baja',
    categoria: 'organismos',
    datos: { organismo },
  });
}

/**
 * Notificación de sistema
 */
export function notificarSistema(titulo: string, mensaje: string, prioridad: 'baja' | 'media' | 'alta' = 'media') {
  const { agregarNotificacion } = useNotificaciones.getState();

  agregarNotificacion({
    tipo: 'info',
    titulo,
    mensaje,
    prioridad,
    categoria: 'sistema',
  });
}

/**
 * Hook para escuchar cambios en tiempo real (simula websockets)
 */
export function useNotificacionesEnTiempoReal() {
  const { notificaciones, noLeidas } = useNotificaciones();

  // En una implementación real, aquí se conectaría a WebSockets
  // Por ahora, simplemente retornamos el estado actual

  return {
    notificaciones,
    noLeidas,
    hayNuevas: noLeidas > 0,
  };
}
