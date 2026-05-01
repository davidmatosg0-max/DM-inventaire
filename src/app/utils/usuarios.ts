// Sistema de usuarios con credenciales
// Usuarios predefinidos del sistema

import { registrarActividad } from './actividadLogger';

// 🎭 ROLES DEL SISTEMA
export type RolUsuario = 
  | 'desarrollador'           // Acceso total al sistema, debugging, configuración avanzada
  | 'administrador'           // Gestión completa del sistema
  | 'coordinador'             // Coordinación de operaciones, inventario y comandas
  | 'responsable_entrepot'    // Gestión del almacén e inventario
  | 'responsable_comptoir'    // Gestión del comptoir y beneficiarios
  | 'responsable_transport'   // Gestión de transporte y logística
  | 'liaison_organisme'       // Comunicación y gestión de organismos
  | 'benevole_comptoir'       // Voluntario del comptoir
  | 'benevole_entrepot'       // Voluntario del almacén
  | 'employe'                 // Empleado general
  | 'visualizador';           // Solo lectura

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
}> = {
  desarrollador: {
    nombre: 'Développeur',
    descripcion: 'Accès complet au système avec permissions de développement et debugging',
    color: '#000000',
    permisos: [
      PERMISOS.DESARROLLADOR,
      PERMISOS.ACCESO_TOTAL,
      PERMISOS.DEBUG_MODE,
      PERMISOS.ADMINISTRADOR_GENERAL,
      PERMISOS.GESTION_USUARIOS,
      PERMISOS.GESTION_ROLES,
      PERMISOS.CONFIGURACION_SISTEMA,
      PERMISOS.BACKUP_RESTAURACION
    ]
  },
  
  administrador: {
    nombre: 'Administrateur',
    descripcion: 'Gestion complète du système et de toutes les opérations',
    color: '#DC3545',
    permisos: [
      PERMISOS.ADMINISTRADOR_GENERAL,
      PERMISOS.GESTION_USUARIOS,
      PERMISOS.GESTION_ROLES,
      PERMISOS.CONFIGURACION_SISTEMA,
      PERMISOS.BACKUP_RESTAURACION,
      PERMISOS.COORDINADOR,
      PERMISOS.GESTION_ORGANISMOS,
      PERMISOS.GESTION_COMANDAS,
      PERMISOS.GESTION_INVENTARIO,
      PERMISOS.REPORTES_AVANZADOS,
      PERMISOS.GESTION_PRODUCTOS,
      PERMISOS.GESTION_BENEFICIARIOS,
      PERMISOS.GESTION_VEHICULOS,
      PERMISOS.GESTION_RUTAS,
      PERMISOS.ADMINISTRADOR_LIAISON
    ]
  },
  
  coordinador: {
    nombre: 'Coordinateur',
    descripcion: 'Coordination des opérations, gestion des commandes et de l\'inventaire',
    color: '#1E73BE',
    permisos: [
      PERMISOS.COORDINADOR,
      PERMISOS.GESTION_ORGANISMOS,
      PERMISOS.GESTION_COMANDAS,
      PERMISOS.GESTION_INVENTARIO,
      PERMISOS.REPORTES_AVANZADOS,
      PERMISOS.MOVIMIENTOS_INVENTARIO,
      PERMISOS.GESTION_OFERTAS,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_REPORTES
    ]
  },
  
  responsable_entrepot: {
    nombre: 'Responsable Entrepôt',
    descripcion: 'Gestion de l\'entrepôt, inventaire et réception des produits',
    color: '#4CAF50',
    permisos: [
      PERMISOS.RESPONSABLE_ENTREPOT,
      PERMISOS.GESTION_PRODUCTOS,
      PERMISOS.MOVIMIENTOS_INVENTARIO,
      PERMISOS.GESTION_PRS,
      PERMISOS.RECEPCION_PRODUCTOS,
      PERMISOS.GESTION_INVENTARIO,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_INVENTARIO
    ]
  },
  
  responsable_comptoir: {
    nombre: 'Responsable Comptoir',
    descripcion: 'Gestion du comptoir, bénéficiaires et distribution d\'aide',
    color: '#2d9561',
    permisos: [
      PERMISOS.RESPONSABLE_COMPTOIR,
      PERMISOS.GESTION_BENEFICIARIOS,
      PERMISOS.GESTION_RENDEZ_VOUS,
      PERMISOS.GESTION_AIDE_ALIMENTAIRE,
      PERMISOS.REGISTRO_VISITAS,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_REPORTES
    ]
  },
  
  responsable_transport: {
    nombre: 'Responsable Transport',
    descripcion: 'Gestion du transport, véhicules, routes et livraisons',
    color: '#FFC107',
    permisos: [
      PERMISOS.RESPONSABLE_TRANSPORT,
      PERMISOS.GESTION_VEHICULOS,
      PERMISOS.GESTION_RUTAS,
      PERMISOS.GESTION_TRANSPORTES,
      PERMISOS.TRACKING_GPS,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_REPORTES
    ]
  },
  
  liaison_organisme: {
    nombre: 'Liaison Organisme',
    descripcion: 'Communication avec les organismes et gestion des relations',
    color: '#9C27B0',
    permisos: [
      PERMISOS.ADMINISTRADOR_LIAISON,
      PERMISOS.COMUNICACION_ORGANISMOS,
      PERMISOS.GESTION_OFERTAS,
      PERMISOS.VERIFICACION_ORGANISMOS,
      PERMISOS.GESTION_ORGANISMOS,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_REPORTES
    ]
  },
  
  benevole_comptoir: {
    nombre: 'Bénévole Comptoir',
    descripcion: 'Aide au comptoir et assistance aux bénéficiaires',
    color: '#17A2B8',
    permisos: [
      PERMISOS.BENEVOLE_LECTEUR,
      PERMISOS.AIDE_COMPTOIR,
      PERMISOS.REGISTRO_VISITAS,
      PERMISOS.VER_DASHBOARD
    ]
  },
  
  benevole_entrepot: {
    nombre: 'Bénévole Entrepôt',
    descripcion: 'Aide à l\'entrepôt et organisation des produits',
    color: '#28A745',
    permisos: [
      PERMISOS.BENEVOLE_LECTEUR,
      PERMISOS.AIDE_ENTREPOT,
      PERMISOS.VER_INVENTARIO,
      PERMISOS.VER_DASHBOARD
    ]
  },
  
  employe: {
    nombre: 'Employé',
    descripcion: 'Employé général avec accès aux fonctions courantes',
    color: '#6C757D',
    permisos: [
      PERMISOS.EMPLOYE_GENERAL,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_INVENTARIO,
      PERMISOS.VER_REPORTES
    ]
  },
  
  visualizador: {
    nombre: 'Visualiseur',
    descripcion: 'Accès en lecture seule au système',
    color: '#9E9E9E',
    permisos: [
      PERMISOS.VISUALIZADOR,
      PERMISOS.VER_DASHBOARD,
      PERMISOS.VER_REPORTES,
      PERMISOS.VER_INVENTARIO
    ]
  }
};

export interface Usuario {
  id: string;
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  permisos: string[];
  foto?: string;
  descripcion?: string;
  activo?: boolean;
  departamentoId?: string;
  telefono?: string;
  fechaCreacion?: string;
  ultimoAcceso?: string;
}

// Lista de usuarios predefinidos - MODO PRODUCCIÓN
const USUARIOS_PREDEFINIDOS: Usuario[] = [
  {
    id: '1',
    username: 'David',
    password: 'Lettycia26',
    nombre: 'David',
    apellido: 'Développeur',
    email: 'david@banque-alimentaire.org',
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
const CURRENT_VERSION = '5.0-production'; // Versión producción - Solo David

// Migrar usuarios existentes para actualizar permisos del usuario David
export function migrarUsuarios(): void {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version === CURRENT_VERSION) {
      return; // Ya está actualizado
    }

    // MODO PRODUCCIÓN: Limpiar todos los usuarios y mantener solo David
    localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    console.log('✅ Modo Producción - Solo usuario David (développeur)');
  } catch (error) {
    console.error('Error al migrar usuarios:', error);
  }
}

// Inicializar usuarios en localStorage si no existen
export function inicializarUsuarios(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_PREDEFINIDOS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      console.log('✅ Usuarios inicializados:', USUARIOS_PREDEFINIDOS.length, 'usuarios');
    } else {
      // Si ya existen usuarios, ejecutar migración
      migrarUsuarios();
    }
  } catch (error) {
    console.error('Error al inicializar usuarios:', error);
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
    console.error('Error al cargar usuarios:', error);
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
    console.log('✅ Usuarios guardados:', usuarios.length, 'usuarios');
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
  }
}

// Validar credenciales de usuario
export function validarCredenciales(username: string, password: string): Usuario | null {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  
  if (usuario) {
    console.log('✅ Login exitoso:', usuario.username, '-', usuario.descripcion);
    // No retornar el password por seguridad
    const { password: _, ...usuarioSinPassword } = usuario;
    return usuario;
  }
  
  console.log('❌ Credenciales inválidas para:', username);
  return null;
}

// Obtener usuario por username
export function obtenerUsuarioPorUsername(username: string): Usuario | null {
  const usuarios = obtenerUsuarios();
  return usuarios.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
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
  console.log('✅ Usuario agregado:', nuevoUsuario.username);
  
  // Registrar actividad
  const rolConfig = ROLES_CONFIG[nuevoUsuario.rol];
  registrarActividad(
    'Utilisateurs',
    'crear',
    `Utilisateur "${nuevoUsuario.username}" créé - Rôle: ${rolConfig?.nombre || nuevoUsuario.rol}`,
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
    console.log('✅ Usuario actualizado:', usuarios[index].username);
    
    // Registrar actividad
    const cambios = [];
    if (datosActualizados.rol && datosActualizados.rol !== usuarioAnterior.rol) {
      const rolAnteriorConfig = ROLES_CONFIG[usuarioAnterior.rol];
      const rolNuevoConfig = ROLES_CONFIG[datosActualizados.rol];
      cambios.push(`Rôle: ${rolAnteriorConfig?.nombre} → ${rolNuevoConfig?.nombre}`);
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
    console.log('✅ Usuario eliminado');
    
    // Registrar actividad
    if (usuarioEliminar) {
      const rolConfig = ROLES_CONFIG[usuarioEliminar.rol];
      registrarActividad(
        'Utilisateurs',
        'eliminar',
        `Utilisateur "${usuarioEliminar.username}" supprimé - Rôle: ${rolConfig?.nombre || usuarioEliminar.rol}`,
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
  console.log('✅ Usuarios reseteados a valores predefinidos');
}

// Verificar si un usuario tiene un permiso específico
export function tienePermiso(usuario: Usuario, permiso: string): boolean {
  return usuario.permisos.includes(permiso) || usuario.permisos.includes('acceso_total');
}