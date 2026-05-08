import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  obtenerInfoUsuarioConPermisos,
  tienePermiso as verificarPermisoSistema,
  tieneAlgunoDeEstosPermisos,
  tieneTodosLosPermisos,
} from '../utils/permisos';

// Tipos
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  departamento?: string;
  activo: boolean;
}

interface PermisosState {
  usuarioActual: Usuario | null;
  permisosUsuario: string[];
  setUsuarioActual: (usuario: Usuario | null) => void;
  setPermisos: (permisos: string[]) => void;
  tienePermiso: (permisoId: string) => boolean;
  tieneAlgunPermiso: (permisosIds: string[]) => boolean;
  tieneTodosPermisos: (permisosIds: string[]) => boolean;
  cerrarSesion: () => void;
}

// Store de permisos con persistencia
export const usePermisos = create<PermisosState>()(
  persist(
    (set, get) => ({
      usuarioActual: null,
      permisosUsuario: [],

      setUsuarioActual: (usuario) => {
        const infoUsuario = obtenerInfoUsuarioConPermisos();
        set({
          usuarioActual: usuario,
          permisosUsuario: infoUsuario?.permisosExpandidos || [],
        });
      },

      setPermisos: (permisos) => set({ permisosUsuario: permisos }),

      tienePermiso: (permisoId: string) => {
        const { permisosUsuario } = get();
        return verificarPermisoSistema(permisoId) || permisosUsuario.includes(permisoId);
      },

      tieneAlgunPermiso: (permisosIds: string[]) => {
        const { permisosUsuario } = get();
        return tieneAlgunoDeEstosPermisos(permisosIds) || permisosIds.some((id) => permisosUsuario.includes(id));
      },

      tieneTodosPermisos: (permisosIds: string[]) => {
        const { permisosUsuario } = get();
        return tieneTodosLosPermisos(permisosIds) || permisosIds.every((id) => permisosUsuario.includes(id));
      },

      cerrarSesion: () => set({ usuarioActual: null, permisosUsuario: [] }),
    }),
    {
      name: 'permisos-storage',
    }
  )
);

// Hook para inicializar el usuario actual basado en roles
export const useInicializarPermisos = (rolId?: string) => {
  const { setPermisos } = usePermisos();
  const infoUsuario = obtenerInfoUsuarioConPermisos();

  if (infoUsuario?.permisosExpandidos?.length) {
    setPermisos(infoUsuario.permisosExpandidos);
    return;
  }

  if (!rolId) {
    setPermisos([]);
  }
};
