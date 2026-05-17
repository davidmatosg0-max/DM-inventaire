// Gestión de sesión de usuario conectado
// Última actualización: 2026-03-17 - Soporte para apellido

import {
  DAVID_DEVELOPPEUR_APELLIDO,
  DAVID_DEVELOPPEUR_EMAIL,
  DAVID_DEVELOPPEUR_NOMBRE,
  DAVID_DEVELOPPEUR_USERNAME,
} from './usuarios';
import {
  SYSTEM_ROLES,
  esRolSistema,
  obtenerCanonicalPermissionsDelRol,
  obtenerLegacyPermissionsDelRol,
  type RolUsuario,
} from '../data/systemRoles';

export type PermisoModulo = string;

export interface UsuarioSesion {
  id: string;
  username?: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: RolUsuario | string;
  permisos: PermisoModulo[];
  foto?: string;
}

const STORAGE_KEY = 'usuario_sesion_banco_alimentos';

function expandirPermisosSegunRol(usuario: UsuarioSesion): UsuarioSesion {
  const permisosExpandidos = new Set<string>(usuario.permisos || []);

  if (!esRolSistema(usuario.rol)) {
    return {
      ...usuario,
      permisos: [...permisosExpandidos],
    };
  }

  obtenerLegacyPermissionsDelRol(usuario.rol).forEach((permiso) => permisosExpandidos.add(permiso));
  obtenerCanonicalPermissionsDelRol(usuario.rol).forEach((permiso) => permisosExpandidos.add(permiso));

  return {
    ...usuario,
    permisos: [...permisosExpandidos],
  };
}

function esSesionDavidDeveloppeur(usuario: Partial<UsuarioSesion> & { role?: string; rol?: string; username?: string }): boolean {
  const username = usuario.username?.trim().toLowerCase();
  const nombre = usuario.nombre?.trim().toLowerCase();
  const apellido = usuario.apellido?.trim().toLowerCase();

  return username === DAVID_DEVELOPPEUR_USERNAME.toLowerCase()
    || (nombre === DAVID_DEVELOPPEUR_NOMBRE.toLowerCase() && apellido === DAVID_DEVELOPPEUR_APELLIDO.toLowerCase());
}

function normalizarUsuarioSesion(usuario: UsuarioSesion): UsuarioSesion {
  const email = usuario.email?.trim();
  const baseNormalizada = expandirPermisosSegunRol({
    ...usuario,
    email: email || 'usuario@banquealimentaire.ca',
  });

  if (!esSesionDavidDeveloppeur(baseNormalizada)) {
    return baseNormalizada;
  }

  return expandirPermisosSegunRol({
    ...baseNormalizada,
    username: DAVID_DEVELOPPEUR_USERNAME,
    nombre: DAVID_DEVELOPPEUR_NOMBRE,
    apellido: DAVID_DEVELOPPEUR_APELLIDO,
    email: DAVID_DEVELOPPEUR_EMAIL,
  });
}

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
      const esDavidDeveloppeur = usuarioOUsername.trim().toLowerCase() === DAVID_DEVELOPPEUR_USERNAME.toLowerCase();
      usuario = {
        id: '1',
        username: usuarioOUsername,
        nombre: esDavidDeveloppeur ? DAVID_DEVELOPPEUR_NOMBRE : 'Administrateur',
        apellido: esDavidDeveloppeur ? DAVID_DEVELOPPEUR_APELLIDO : 'Système',
        email: esDavidDeveloppeur
          ? DAVID_DEVELOPPEUR_EMAIL
          : `${usuarioOUsername.toLowerCase()}@banquealimentaire.ca`,
        rol: esDavidDeveloppeur ? 'desarrollador' : 'administrador',
        permisos: esDavidDeveloppeur
          ? ['desarrollador', 'acceso_total']
          : ['administrador_general'],
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

    usuario = normalizarUsuarioSesion(usuario);
    
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
    const usuario = normalizarUsuarioSesion(JSON.parse(data) as UsuarioSesion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    return usuario;
  } catch (error) {
    console.error('Error al obtener usuario de sesión:', error);
    return null;
  }
}

export function obtenerNombreUsuarioSesion(fallback = 'Système'): string {
  const usuario = obtenerUsuarioSesion();
  const nombreCompleto = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ').trim();

  return nombreCompleto || usuario?.username || fallback;
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
  
  // Mantener compatibilidad con componentes legados que siguen consultando
  // permisos desde la sesión en lugar del sistema expandido.
  if (
    usuario.permisos.includes('administrador_general')
    || usuario.permisos.includes('desarrollador')
    || usuario.permisos.includes('acceso_total')
  ) {
    return true;
  }
  
  return usuario.permisos.includes(permiso);
}

/**
 * Verifica si el usuario es administrador de Liaison
 */
export function esAdministradorLiaison(): boolean {
  return tienePermiso('administrador_liaison') || tienePermiso('administrador_general');
}