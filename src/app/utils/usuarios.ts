// Sistema de usuarios con credenciales
// Usuarios predefinidos del sistema

import { registrarActividad } from './actividadLogger';
import { queueStorageSync } from './cloudPersistence';
import {
  desactivarUsuarioRemotoAdmin,
  guardarUsuarioRemotoAdmin,
  listarUsuariosRemotosAdmin,
} from './remoteUserAdmin';
import { SYSTEM_ROLES, esRolSistema as esRolSistemaCatalogo, type RolUsuario } from '../data/systemRoles';

export type { RolUsuario } from '../data/systemRoles';

// 🔐 PERMISOS DEL SISTEMA
export const PERMISOS = {
  // Permisos de Desarrollador
  DESARROLLADOR: 'desarrollador',
  ACCESO_TOTAL: 'acceso_total',
  DEBUG_MODE: 'debug_mode',
  
  // Permisos de Administración General
  ADMINISTRADOR_GENERAL: 'administrador_general',
  GESTION_USUARIOS: 'gestion_usuarios',
  GESTION_ROLES: 'gestion_roles',
  CONFIGURACION_SISTEMA: 'configuracion_sistema',
  BACKUP_RESTAURACION: 'backup_restauracion',
  
  // Permisos de Coordinación
  COORDINADOR: 'coordinador',
  GESTION_ORGANISMOS: 'gestion_organismos',
  GESTION_COMANDAS: 'gestion_comandas',
  GESTION_INVENTARIO: 'gestion_inventario',
  REPORTES_AVANZADOS: 'reportes_avanzados',
  
  // Permisos de Entrepôt (Almacén)
  RESPONSABLE_ENTREPOT: 'responsable_entrepot',
  GESTION_PRODUCTOS: 'gestion_productos',
  MOVIMIENTOS_INVENTARIO: 'movimientos_inventario',
  GESTION_PRS: 'gestion_prs',
  RECEPCION_PRODUCTOS: 'recepcion_productos',
  
  // Permisos de Comptoir
  RESPONSABLE_COMPTOIR: 'responsable_comptoir',
  GESTION_BENEFICIARIOS: 'gestion_beneficiarios',
  GESTION_RENDEZ_VOUS: 'gestion_rendez_vous',
  GESTION_AIDE_ALIMENTAIRE: 'gestion_aide_alimentaire',
  REGISTRO_VISITAS: 'registro_visitas',
  
  // Permisos de Transport
  RESPONSABLE_TRANSPORT: 'responsable_transport',
  GESTION_VEHICULOS: 'gestion_vehiculos',
  GESTION_RUTAS: 'gestion_rutas',
  GESTION_TRANSPORTES: 'gestion_transportes',
  TRACKING_GPS: 'tracking_gps',
  
  // Permisos de Liaison (Comunicación)
  ADMINISTRADOR_LIAISON: 'administrador_liaison',
  COMUNICACION_ORGANISMOS: 'comunicacion_organismos',
  GESTION_OFERTAS: 'gestion_ofertas',
  VERIFICACION_ORGANISMOS: 'verificacion_organismos',
  
  // Permisos de Bénévoles
  BENEVOLE_LECTEUR: 'benevole_lecteur',
  AIDE_COMPTOIR: 'aide_comptoir',
  AIDE_ENTREPOT: 'aide_entrepot',
  
  // Permisos de Empleados
  EMPLOYE_GENERAL: 'employe_general',
  
  // Permisos de Visualización
  VISUALIZADOR: 'visualizador',
  VER_DASHBOARD: 'ver_dashboard',
  VER_REPORTES: 'ver_reportes',
  VER_INVENTARIO: 'ver_inventario'
} as const;

// 🎯 CONFIGURACIÓN DE ROLES Y SUS PERMISOS
export const ROLES_CONFIG: Record<RolUsuario, {
  nombre: string;
  descripcion: string;
  color: string;
  permisos: string[];
}> = Object.fromEntries(
  Object.entries(SYSTEM_ROLES).map(([rol, config]) => [
    rol,
    {
      nombre: config.nombre,
      descripcion: config.descripcion,
      color: config.color,
      permisos: [...config.legacyPermissions],
    },
  ])
) as Record<RolUsuario, {
  nombre: string;
  descripcion: string;
  color: string;
  permisos: string[];
}>;

export interface Usuario {
  id: string;
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  permisos: string[];
  foto?: string;
  descripcion?: string;
  activo?: boolean;
  departamentoId?: string;
  telefono?: string;
  fechaCreacion?: string;
  ultimoAcceso?: string;
}

export const DAVID_DEVELOPPEUR_USERNAME = 'David';
export const DAVID_DEVELOPPEUR_NOMBRE = 'David';
export const DAVID_DEVELOPPEUR_APELLIDO = 'Développeur';
export const DAVID_DEVELOPPEUR_EMAIL = 'davidmatosg0@gmail.com';

export function esRolSistema(rol: string): rol is RolUsuario {
  return esRolSistemaCatalogo(rol);
}

export function obtenerEtiquetaRol(rol: string): string {
  return esRolSistema(rol) ? ROLES_CONFIG[rol].nombre : rol;
}

// Lista de usuarios predefinidos - MODO PRODUCCIÓN
const USUARIOS_PREDEFINIDOS: Usuario[] = [
  {
    id: '1',
    username: DAVID_DEVELOPPEUR_USERNAME,
    password: 'Lettycia26',
    nombre: DAVID_DEVELOPPEUR_NOMBRE,
    apellido: DAVID_DEVELOPPEUR_APELLIDO,
    email: DAVID_DEVELOPPEUR_EMAIL,
    rol: 'desarrollador',
    permisos: [
      PERMISOS.DESARROLLADOR,
      PERMISOS.ACCESO_TOTAL,
      PERMISOS.DEBUG_MODE,
      PERMISOS.ADMINISTRADOR_GENERAL,
      PERMISOS.GESTION_USUARIOS,
      PERMISOS.GESTION_ROLES,
      PERMISOS.CONFIGURACION_SISTEMA,
      PERMISOS.BACKUP_RESTAURACION,
      PERMISOS.COORDINADOR,
      PERMISOS.ADMINISTRADOR_LIAISON
    ],
    activo: true,
    descripcion: 'Développeur Principal - Accès Total au Système'
  }
];

const STORAGE_KEY = 'banque_alimentaire_usuarios';
const VERSION_KEY = 'banque_alimentaire_usuarios_version';
const CURRENT_VERSION = '5.2-production'; // Versión producción - Normaliza el email real de David

function esUsuarioDavidDeveloppeur(usuario: Partial<Usuario>): boolean {
  const username = usuario.username?.trim().toLowerCase();
  const nombre = usuario.nombre?.trim().toLowerCase();
  const apellido = usuario.apellido?.trim().toLowerCase();

  return username === DAVID_DEVELOPPEUR_USERNAME.toLowerCase()
    || (nombre === DAVID_DEVELOPPEUR_NOMBRE.toLowerCase() && apellido === DAVID_DEVELOPPEUR_APELLIDO.toLowerCase());
}

function normalizarUsuarioSistema(usuario: Usuario): Usuario {
  if (!esUsuarioDavidDeveloppeur(usuario)) {
    return usuario;
  }

  return {
    ...usuario,
    username: DAVID_DEVELOPPEUR_USERNAME,
    nombre: DAVID_DEVELOPPEUR_NOMBRE,
    apellido: DAVID_DEVELOPPEUR_APELLIDO,
    email: DAVID_DEVELOPPEUR_EMAIL,
  };
}

// Migrar usuarios existentes para actualizar permisos del usuario David
export function migrarUsuarios(): void {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    const storedUsers = localStorage.getItem(STORAGE_KEY);
    const usuariosActuales = storedUsers ? (JSON.parse(storedUsers) as Usuario[]) : [];

    if (version === CURRENT_VERSION && usuariosActuales.length > 0) {
      return; // Ya está actualizado
    }

    const usuariosNormalizados = (usuariosActuales.length > 0 ? usuariosActuales : USUARIOS_PREDEFINIDOS).map(normalizarUsuarioSistema);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosNormalizados));
    queueStorageSync(STORAGE_KEY);
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    console.log(`✅ Utilisateurs migrés pour la production : ${usuariosNormalizados.length} utilisateur(s)`);
  } catch (error) {
    console.error('Erreur lors de la migration des utilisateurs :', error);
  }
}

// Inicializar usuarios en localStorage si no existen
export function inicializarUsuarios(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
      queueStorageSync(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      console.log('✅ Utilisateurs initialisés :', USUARIOS_PREDEFINIDOS.length, 'utilisateur(s)');
    } else {
      const usuarios = (JSON.parse(stored) as Usuario[]).map(normalizarUsuarioSistema);
      if (usuarios.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
        queueStorageSync(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        console.log('✅ Utilisateur administrateur initial restauré');
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));

      migrarUsuarios();
    }
  } catch (error) {
    console.error('Erreur lors de l’initialisation des utilisateurs :', error);
  }
}

// Obtener todos los usuarios
export function obtenerUsuarios(): Usuario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      // Si existe la clave (aunque sea un array vacío), usarla
      const usuarios = JSON.parse(stored);
      // Si hay usuarios, ejecutar migración si es necesaria
      if (usuarios.length > 0) {
        migrarUsuarios();
      }
      return usuarios;
    } else {
      // Solo inicializar si NO existe la clave en localStorage (primera vez)
      inicializarUsuarios();
      const nuevosUsuarios = localStorage.getItem(STORAGE_KEY);
      return nuevosUsuarios ? JSON.parse(nuevosUsuarios) : [];
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs :', error);
  }
  // Retornar array vacío si hay error
  return [];
}

export function obtenerUsuariosTransporte(): Usuario[] {
  return obtenerUsuarios().filter((usuario) => {
    if (usuario.activo === false) {
      return false;
    }

    return usuario.rol === 'responsable_transport'
      || usuario.rol === 'administrador'
      || usuario.rol === 'desarrollador'
      || usuario.permisos.includes(PERMISOS.GESTION_RUTAS)
      || usuario.permisos.includes(PERMISOS.GESTION_TRANSPORTES)
      || usuario.permisos.includes(PERMISOS.GESTION_VEHICULOS)
      || usuario.permisos.includes(PERMISOS.ACCESO_TOTAL);
  });
}

// Guardar usuarios en localStorage
export function guardarUsuarios(usuarios: Usuario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    queueStorageSync(STORAGE_KEY);
    console.log('✅ Utilisateurs enregistrés :', usuarios.length, 'utilisateur(s)');
  } catch (error) {
    console.error('Erreur lors de l’enregistrement des utilisateurs :', error);
  }
}

// Validar credenciales de usuario
export function validarCredenciales(username: string, password: string): Usuario | null {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  
  if (usuario) {
    console.log('✅ Connexion réussie :', usuario.username, '-', usuario.descripcion);
    // No retornar el password por seguridad
    const { password: _, ...usuarioSinPassword } = usuario;
    return usuario;
  }
  
  console.log('❌ Identifiants invalides pour :', username);
  return null;
}

// Obtener usuario por username
export function obtenerUsuarioPorUsername(username: string): Usuario | null {
  const usuarios = obtenerUsuarios();
  return usuarios.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

function mezclarUsuariosConCacheLocal(usuariosRemotos: Usuario[]): Usuario[] {
  const usuariosLocales = obtenerUsuarios();

  return usuariosRemotos.map((usuarioRemoto) => {
    const usuarioLocal = usuariosLocales.find((usuario) =>
      usuario.id === usuarioRemoto.id
      || usuario.username.toLowerCase() === usuarioRemoto.username.toLowerCase()
      || usuario.email.toLowerCase() === usuarioRemoto.email.toLowerCase()
    );

    return {
      ...usuarioRemoto,
      password: usuarioLocal?.password || usuarioRemoto.password || '',
      foto: usuarioLocal?.foto || usuarioRemoto.foto || undefined,
      descripcion: usuarioLocal?.descripcion || usuarioRemoto.descripcion || undefined,
      telefono: usuarioLocal?.telefono || usuarioRemoto.telefono || undefined,
      departamentoId: usuarioLocal?.departamentoId || usuarioRemoto.departamentoId || undefined,
      ultimoAcceso: usuarioLocal?.ultimoAcceso || usuarioRemoto.ultimoAcceso,
      fechaCreacion: usuarioLocal?.fechaCreacion || usuarioRemoto.fechaCreacion,
    };
  });
}

export async function sincronizarUsuariosConProveedor(): Promise<Usuario[]> {
  try {
    const usuariosRemotos = await listarUsuariosRemotosAdmin();
    if (!usuariosRemotos) {
      return obtenerUsuarios();
    }

    const usuariosFusionados = mezclarUsuariosConCacheLocal(usuariosRemotos);
    guardarUsuarios(usuariosFusionados);
    return usuariosFusionados;
  } catch (error) {
    console.error('Error al sincronizar usuarios remotos:', error);
    return obtenerUsuarios();
  }
}

export async function guardarUsuarioEnProveedor(
  usuario: Omit<Usuario, 'id'>,
  usuarioId?: string
): Promise<Usuario> {
  try {
    const resultadoRemoto = await guardarUsuarioRemotoAdmin({
      userId: usuarioId,
      email: usuario.email,
      password: usuario.password || undefined,
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      roleId: usuario.rol,
      descripcion: usuario.descripcion,
      telefono: usuario.telefono,
      departamentoId: usuario.departamentoId,
      activo: usuario.activo,
    });

    if (resultadoRemoto?.userId) {
      const usuariosActualizados = await sincronizarUsuariosConProveedor();
      const usuarioGuardado = usuariosActualizados.find((item) => item.id === resultadoRemoto.userId)
        || usuariosActualizados.find((item) => item.username.toLowerCase() === usuario.username.toLowerCase());

      if (usuarioGuardado) {
        if (usuario.foto || usuario.descripcion || usuario.telefono || usuario.departamentoId) {
          actualizarUsuario(usuarioGuardado.id, {
            foto: usuario.foto,
            descripcion: usuario.descripcion,
            telefono: usuario.telefono,
            departamentoId: usuario.departamentoId,
          });
        }

        return {
          ...usuarioGuardado,
          password: usuario.password || usuarioGuardado.password,
          foto: usuario.foto || usuarioGuardado.foto,
          descripcion: usuario.descripcion || usuarioGuardado.descripcion,
          telefono: usuario.telefono || usuarioGuardado.telefono,
          departamentoId: usuario.departamentoId || usuarioGuardado.departamentoId,
        };
      }
    }
  } catch (error) {
    console.error('Error al guardar usuario remoto:', error);
  }

  if (usuarioId) {
    const actualizado = actualizarUsuario(usuarioId, usuario);
    if (!actualizado) {
      throw new Error('No se pudo actualizar el usuario');
    }

    const usuarioActualizado = obtenerUsuarios().find((item) => item.id === usuarioId);
    if (!usuarioActualizado) {
      throw new Error('Usuario actualizado no encontrado');
    }

    return usuarioActualizado;
  }

  return agregarUsuario(usuario);
}

export async function eliminarUsuarioEnProveedor(usuarioId: string): Promise<boolean> {
  try {
    const eliminadoRemoto = await desactivarUsuarioRemotoAdmin(usuarioId);
    if (eliminadoRemoto) {
      await sincronizarUsuariosConProveedor();
      return true;
    }
  } catch (error) {
    console.error('Error al eliminar usuario remoto:', error);
  }

  return eliminarUsuario(usuarioId);
}

// Agregar nuevo usuario
export function agregarUsuario(usuario: Omit<Usuario, 'id'>): Usuario {
  const usuarios = obtenerUsuarios();
  const nuevoUsuario: Usuario = {
    ...usuario,
    id: Date.now().toString()
  };
  
  usuarios.push(nuevoUsuario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  queueStorageSync(STORAGE_KEY);
  console.log('✅ Usuario agregado:', nuevoUsuario.username);
  
  // Registrar actividad
  const nombreRol = obtenerEtiquetaRol(nuevoUsuario.rol);
  registrarActividad(
    'Utilisateurs',
    'crear',
    `Utilisateur "${nuevoUsuario.username}" créé - Rôle: ${nombreRol}`,
    { usuarioId: nuevoUsuario.id, username: nuevoUsuario.username, rol: nuevoUsuario.rol }
  );
  
  return nuevoUsuario;
}

// Actualizar usuario existente
export function actualizarUsuario(id: string, datosActualizados: Partial<Usuario>): boolean {
  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index !== -1) {
    const usuarioAnterior = { ...usuarios[index] };
    usuarios[index] = { ...usuarios[index], ...datosActualizados };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    queueStorageSync(STORAGE_KEY);
    console.log('✅ Usuario actualizado:', usuarios[index].username);
    
    // Registrar actividad
    const cambios = [];
    if (datosActualizados.rol && datosActualizados.rol !== usuarioAnterior.rol) {
      const rolAnteriorNombre = obtenerEtiquetaRol(usuarioAnterior.rol);
      const rolNuevoNombre = obtenerEtiquetaRol(datosActualizados.rol);
      cambios.push(`Rôle: ${rolAnteriorNombre} → ${rolNuevoNombre}`);
    }
    if (datosActualizados.nombre || datosActualizados.apellido) {
      cambios.push('Profil mis à jour');
    }
    if (datosActualizados.password) {
      cambios.push('Mot de passe modifié');
    }
    if (datosActualizados.activo !== undefined && datosActualizados.activo !== usuarioAnterior.activo) {
      cambios.push(datosActualizados.activo ? 'Activé' : 'Désactivé');
    }
    
    if (cambios.length > 0) {
      registrarActividad(
        'Utilisateurs',
        'modificar',
        `Utilisateur "${usuarios[index].username}" modifié - ${cambios.join(', ')}`,
        { usuarioId: id, cambios: datosActualizados }
      );
    }
    
    return true;
  }
  
  console.log('❌ Usuario no encontrado:', id);
  return false;
}

// Eliminar usuario
export function eliminarUsuario(id: string): boolean {
  const usuarios = obtenerUsuarios();
  const usuarioEliminar = usuarios.find(u => u.id === id);
  const usuariosFiltrados = usuarios.filter(u => u.id !== id);
  
  if (usuariosFiltrados.length < usuarios.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosFiltrados));
    queueStorageSync(STORAGE_KEY);
    console.log('✅ Usuario eliminado');
    
    // Registrar actividad
    if (usuarioEliminar) {
      const nombreRol = obtenerEtiquetaRol(usuarioEliminar.rol);
      registrarActividad(
        'Utilisateurs',
        'eliminar',
        `Utilisateur "${usuarioEliminar.username}" supprimé - Rôle: ${nombreRol}`,
        { usuarioId: id, username: usuarioEliminar.username }
      );
    }
    
    return true;
  }
  
  console.log('❌ Usuario no encontrado:', id);
  return false;
}

// Eliminar todos los usuarios (para producción)
export function eliminarTodosLosUsuarios(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    queueStorageSync(STORAGE_KEY);
    console.log('✅ Todos los usuarios eliminados');
    return true;
  } catch (error) {
    console.error('Error al eliminar todos los usuarios:', error);
    return false;
  }
}

// Resetear a usuarios predefinidos
export function resetearUsuarios(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
  queueStorageSync(STORAGE_KEY);
  console.log('✅ Usuarios reseteados a valores predefinidos');
}

// Verificar si un usuario tiene un permiso específico
export function tienePermiso(usuario: Usuario, permiso: string): boolean {
  return usuario.permisos.includes(permiso) || usuario.permisos.includes('acceso_total');
}