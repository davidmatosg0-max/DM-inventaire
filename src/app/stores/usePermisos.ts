import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      setUsuarioActual: (usuario) => set({ usuarioActual: usuario }),

      setPermisos: (permisos) => set({ permisosUsuario: permisos }),

      tienePermiso: (permisoId: string) => {
        const { permisosUsuario } = get();
        return permisosUsuario.includes(permisoId);
      },

      tieneAlgunPermiso: (permisosIds: string[]) => {
        const { permisosUsuario } = get();
        return permisosIds.some((id) => permisosUsuario.includes(id));
      },

      tieneTodosPermisos: (permisosIds: string[]) => {
        const { permisosUsuario } = get();
        return permisosIds.every((id) => permisosUsuario.includes(id));
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

  // Aquí puedes mapear los roles a sus permisos
  // Por ahora, otorgamos todos los permisos (usuario administrador)
  const permisosAdmin = [
    // Inventario
    'inventario_ver',
    'inventario_crear',
    'inventario_editar',
    'inventario_eliminar',
    'inventario_exportar',
    'inventario_importar',
    // Comandas
    'comandas_ver',
    'comandas_crear',
    'comandas_editar',
    'comandas_eliminar',
    'comandas_aprobar',
    'comandas_notificar',
    // Organismos
    'organismos_ver',
    'organismos_crear',
    'organismos_editar',
    'organismos_eliminar',
    'organismos_gestionar_acceso',
    'organismos_ver_historial',
    // Transporte
    'transporte_ver',
    'transporte_crear',
    'transporte_editar',
    'transporte_eliminar',
    'transporte_asignar',
    'transporte_gestionar_rutas',
    // Reportes
    'reportes_ver',
    'reportes_generar',
    'reportes_exportar',
    'reportes_avanzados',
    'reportes_estadisticas',
    'reportes_financieros',
    // Usuarios
    'usuarios_ver',
    'usuarios_crear',
    'usuarios_editar',
    'usuarios_eliminar',
    'usuarios_gestionar_roles',
    'usuarios_gestionar_permisos',
    // Configuración
    'configuracion_ver',
    'configuracion_editar',
    'configuracion_categorias',
    'configuracion_programas',
    'configuracion_sistema',
    'configuracion_exportar',
  ];

  // Aquí puedes implementar lógica para diferentes roles
  if (rolId === 'admin' || !rolId) {
    setPermisos(permisosAdmin);
  } else {
    // Implementar lógica para otros roles
    setPermisos([]);
  }
};
