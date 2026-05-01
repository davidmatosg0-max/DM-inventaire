// Gestión de sesión de usuario conectado
// Última actualización: 2026-03-17 - Soporte para apellido

export type PermisoModulo = 'administrador_liaison' | 'coordinador' | 'almacenista' | 'transportista' | 'administrador_general' | 'desarrollador' | 'acceso_total';

export interface UsuarioSesion {
  id: string;
  username?: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: 'administrador' | 'coordinador' | 'almacenista' | 'transportista';
  permisos: PermisoModulo[];
  foto?: string;
}

const STORAGE_KEY = 'usuario_sesion_banco_alimentos';

/**
 * Guarda el usuario actual en la sesión
 */
export function guardarUsuarioSesion(usuario: UsuarioSesion | any): void;
export function guardarUsuarioSesion(username: string, recordarme: boolean): void;
export function guardarUsuarioSesion(usuarioOUsername: UsuarioSesion | string | any, recordarme?: boolean): void {
  try {
    let usuario: UsuarioSesion;
    
    if (typeof usuarioOUsername === 'string') {
      // Crear usuario demo basado en el username
      usuario = {
        id: '1',
        username: usuarioOUsername,
        nombre: 'Administrateur',
        apellido: 'Système',
        email: `${usuarioOUsername.toLowerCase()}@banquealimentaire.ca`,
        rol: 'administrador',
        permisos: ['administrador_general', 'desarrollador', 'acceso_total'],
        foto: undefined
      };
    } else {
      // Si viene del JWT, adaptar el formato
      if (usuarioOUsername.userId || usuarioOUsername.permissions || usuarioOUsername.role) {
        usuario = {
          id: usuarioOUsername.userId || usuarioOUsername.id || '1',
          username: usuarioOUsername.username,
          nombre: usuarioOUsername.nombre || usuarioOUsername.username || 'Usuario',
          apellido: usuarioOUsername.apellido || '',
          email: usuarioOUsername.email || 'usuario@banquealimentaire.ca',
          rol: (usuarioOUsername.role || usuarioOUsername.rol || 'administrador').toLowerCase() as any,
          permisos: (usuarioOUsername.permissions || usuarioOUsername.permisos || ['administrador_general', 'desarrollador', 'acceso_total']) as any,
          foto: usuarioOUsername.foto
        };
      } else {
        usuario = usuarioOUsername;
      }
    }
    
    console.log('💾 Guardando usuario en sesión:', usuario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
  } catch (error) {
    console.error('Error al guardar usuario en sesión:', error);
  }
}

/**
 * Obtiene el usuario actual de la sesión
 */
export function obtenerUsuarioSesion(): UsuarioSesion | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as UsuarioSesion;
  } catch (error) {
    console.error('Error al obtener usuario de sesión:', error);
    return null;
  }
}

/**
 * Elimina el usuario de la sesión (logout)
 */
export function cerrarSesionUsuario(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

/**
 * Verifica si hay un usuario en sesión
 */
export function hayUsuarioEnSesion(): boolean {
  return obtenerUsuarioSesion() !== null;
}

/**
 * Actualiza los datos del usuario en sesión
 */
export function actualizarUsuarioSesion(datosActualizados: Partial<UsuarioSesion>): void {
  const usuarioActual = obtenerUsuarioSesion();
  if (usuarioActual) {
    const usuarioActualizado = { ...usuarioActual, ...datosActualizados };
    guardarUsuarioSesion(usuarioActualizado);
  }
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
export function tienePermiso(permiso: PermisoModulo): boolean {
  const usuario = obtenerUsuarioSesion();
  if (!usuario) return false;
  
  // El administrador general tiene todos los permisos
  if (usuario.permisos.includes('administrador_general')) return true;
  
  return usuario.permisos.includes(permiso);
}

/**
 * Verifica si el usuario es administrador de Liaison
 */
export function esAdministradorLiaison(): boolean {
  return tienePermiso('administrador_liaison') || tienePermiso('administrador_general');
}