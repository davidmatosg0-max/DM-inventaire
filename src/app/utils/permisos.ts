// Sistema de permisos y control de acceso
import { rolesPredeterminados } from '../data/rolesPermisos';
import { obtenerUsuarioSesion } from './sesionStorage';

// Definición de todos los permisos del sistema
export const PERMISOS = {
  // Permisos de desarrollador
  DESARROLLADOR: 'desarrollador',
  ACCESO_TOTAL: 'acceso_total',
  
  // Permisos de administrador
  ADMINISTRADOR_GENERAL: 'administrador_general',
  ADMINISTRADOR_LIAISON: 'administrador_liaison',
  
  // Permisos de coordinador
  COORDINADOR: 'coordinador',
  
  // Dashboard
  DASHBOARD_VER: 'dashboard.ver',
  DASHBOARD_METRICAS: 'dashboard.metricas',
  
  // Inventario
  INVENTARIO_VER: 'inventario.ver',
  INVENTARIO_CREAR: 'inventario.crear',
  INVENTARIO_EDITAR: 'inventario.editar',
  INVENTARIO_ELIMINAR: 'inventario.eliminar',
  
  // Comandas
  COMANDAS_VER: 'comandas.ver',
  COMANDAS_CREAR: 'comandas.crear',
  COMANDAS_EDITAR: 'comandas.editar',
  COMANDAS_APROBAR: 'comandas.aprobar',
  COMANDAS_ELIMINAR: 'comandas.eliminar',
  
  // Organismos
  ORGANISMOS_VER: 'organismos.ver',
  ORGANISMOS_CREAR: 'organismos.crear',
  ORGANISMOS_EDITAR: 'organismos.editar',
  ORGANISMOS_ELIMINAR: 'organismos.eliminar',
  
  // Transporte
  TRANSPORTE_VER: 'transporte.ver',
  TRANSPORTE_EDITAR: 'transporte.editar',
  TRANSPORTE_ENTREGAR: 'transporte.entregar',
  TRANSPORTE_VEHICULOS: 'transporte.vehiculos',
  
  // Reportes
  REPORTES_VER: 'reportes.ver',
  REPORTES_EXPORTAR: 'reportes.exportar',
  
  // Usuarios y roles
  USUARIOS_VER: 'usuarios.ver',
  USUARIOS_CREAR: 'usuarios.crear',
  USUARIOS_EDITAR: 'usuarios.editar',
  USUARIOS_ELIMINAR: 'usuarios.eliminar',
  USUARIOS_ROLES: 'usuarios.roles',
  USUARIOS_PERMISOS: 'usuarios.permisos',

  // ID Digital
  IDDIGITAL_VER: 'iddigital.ver',
  
  // Configuración
  CONFIGURACION_VER: 'configuracion.ver',
  CONFIGURACION_EDITAR: 'configuracion.editar',
  
  // Comptoir
  COMPTOIR_VER: 'comptoir.ver',
  COMPTOIR_EDITAR: 'comptoir.editar',

  // Achat
  ACHAT_VER: 'achat.ver',
  ACHAT_CREAR: 'achat.crear',
  ACHAT_AUTORISAR: 'achat.autorizar',
} as const;

const ALIAS_ROLES: Record<string, string> = {
  admin: 'administrador',
  administrador: 'administrador',
  administrador_general: 'administrador',
  desarrollador: 'desarrollador',
  coordinador: 'coordinador',
  responsable_entrepot: 'responsable_entrepot',
  almacenista: 'responsable_entrepot',
  responsable_comptoir: 'responsable_comptoir',
  responsable_transport: 'responsable_transport',
  transportista: 'responsable_transport',
  liaison_organisme: 'liaison_organisme',
  administrador_liaison: 'liaison_organisme',
  benevole_comptoir: 'benevole_comptoir',
  benevole_entrepot: 'benevole_entrepot',
  voluntario: 'benevole_comptoir',
  employe: 'employe',
  usuario: 'visualizador',
  visualizador: 'visualizador',
};

const PERMISOS_CANONICOS_POR_ROL = rolesPredeterminados.reduce((acc, rol) => {
  acc[rol.id] = rol.permisos;
  return acc;
}, {} as Record<string, string[]>);

const TODOS_LOS_PERMISOS_CANONICOS = new Set(
  rolesPredeterminados.flatMap((rol) => rol.permisos)
);

function obtenerPermisosDerivados(clave: string): string[] {
  const rolNormalizado = ALIAS_ROLES[clave] || clave;
  return PERMISOS_CANONICOS_POR_ROL[rolNormalizado] || [];
}

function obtenerPermisosExpandidos(usuario: ReturnType<typeof obtenerUsuarioSesion>): string[] {
  if (!usuario) {
    return [];
  }

  const permisosExpandidos = new Set<string>(usuario.permisos || []);
  if (usuario.rol) {
    permisosExpandidos.add(usuario.rol);
  }

  if (
    permisosExpandidos.has(PERMISOS.ACCESO_TOTAL)
    || permisosExpandidos.has(PERMISOS.DESARROLLADOR)
  ) {
    Object.values(PERMISOS).forEach((permiso) => permisosExpandidos.add(permiso));
    TODOS_LOS_PERMISOS_CANONICOS.forEach((permiso) => permisosExpandidos.add(permiso));
  }

  const clavesDerivadas = new Set<string>([
    usuario.rol || '',
    ...(usuario.permisos || []),
  ].filter(Boolean));

  clavesDerivadas.forEach((clave) => {
    const rolNormalizado = ALIAS_ROLES[clave] || clave;
    permisosExpandidos.add(rolNormalizado);
    obtenerPermisosDerivados(clave).forEach((permiso) => permisosExpandidos.add(permiso));
  });

  return Array.from(permisosExpandidos);
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 */
export function tienePermiso(permiso: string): boolean {
  const usuario = obtenerUsuarioSesion();
  
  if (!usuario) {
    return false;
  }

  const permisosExpandidos = obtenerPermisosExpandidos(usuario);
  
  // Debug: Log para verificar
  if (permiso === 'transporte.ver') {
    console.log('🔍 Verificando permiso transporte.ver:', {
      usuario: usuario.username,
      rol: usuario.rol,
      permisos: usuario.permisos,
      permisosExpandidos,
      tienePermisoDirecto: permisosExpandidos.includes(permiso)
    });
  }

  return permisosExpandidos.includes(permiso);
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos proporcionados
 */
export function tieneAlgunoDeEstosPermisos(permisos: string[]): boolean {
  return permisos.some(permiso => tienePermiso(permiso));
}

/**
 * Verifica si el usuario tiene todos los permisos proporcionados
 */
export function tieneTodosLosPermisos(permisos: string[]): boolean {
  return permisos.every(permiso => tienePermiso(permiso));
}

/**
 * Verifica si el usuario es desarrollador
 */
export function esDesarrollador(): boolean {
  return tienePermiso(PERMISOS.DESARROLLADOR);
}

/**
 * Verifica si el usuario es administrador (cualquier tipo)
 */
export function esAdministrador(): boolean {
  return tieneAlgunoDeEstosPermisos([
    PERMISOS.ADMINISTRADOR_GENERAL,
    PERMISOS.ADMINISTRADOR_LIAISON,
    PERMISOS.DESARROLLADOR
  ]);
}

/**
 * Verifica si el usuario es coordinador
 */
export function esCoordinador(): boolean {
  return tienePermiso(PERMISOS.COORDINADOR) && !esAdministrador();
}

/**
 * Verifica si el usuario solo tiene acceso de lectura
 */
export function soloLectura(): boolean {
  const usuario = obtenerUsuarioSesion();
  if (!usuario) return true;
  
  // Coordinadores solo tienen lectura
  if (esCoordinador()) return true;

  const permisosExpandidos = obtenerPermisosExpandidos(usuario);
  
  // Si no puede crear, editar o eliminar nada, es solo lectura
  const permisosEscritura = [
    'crear', 'editar', 'eliminar', 'aprobar', 'entregar'
  ];
  
  return !permisosExpandidos.some(p => 
    permisosEscritura.some(pe => p.includes(pe))
  );
}

/**
 * Obtiene el nombre del rol traducido al francés
 */
export function obtenerNombreRol(rol: string): string {
  const traducciones: Record<string, string> = {
    'administrador': 'Administrateur',
    'coordinador': 'Coordinateur',
    'usuario': 'Visualiseur',
    'visualizador': 'Visualiseur',
    'almacenista': 'Responsable Entrepôt',
    'responsable_entrepot': 'Responsable Entrepôt',
    'responsable_comptoir': 'Responsable Comptoir',
    'transportista': 'Responsable Transport',
    'responsable_transport': 'Responsable Transport',
    'liaison_organisme': 'Liaison Organisme',
    'benevole_comptoir': 'Bénévole Comptoir',
    'benevole_entrepot': 'Bénévole Entrepôt',
    'employe': 'Employé',
    'desarrollador': 'Développeur',
  };
  
  return traducciones[rol] || rol;
}

/**
 * Verifica si un módulo está disponible para el usuario actual
 */
export function moduloDisponible(moduloId: string): boolean {
  const mapaPermisos: Record<string, string[]> = {
    'dashboard': [PERMISOS.DASHBOARD_VER],
    'dashboard-metricas': [PERMISOS.DASHBOARD_METRICAS, PERMISOS.DASHBOARD_VER],
    'inventario': [PERMISOS.INVENTARIO_VER],
    'etiquetas': [PERMISOS.INVENTARIO_VER],
    'comandas': [PERMISOS.COMANDAS_VER],
    'organismos': [PERMISOS.ORGANISMOS_VER],
    'ofertas-organismo': [PERMISOS.ORGANISMOS_VER],
    'transporte': [PERMISOS.TRANSPORTE_VER],
    'reportes': [PERMISOS.REPORTES_VER],
    'donateurs-fournisseurs': [PERMISOS.ORGANISMOS_VER, PERMISOS.ACHAT_VER],
    'contactos-almacen': [PERMISOS.ORGANISMOS_VER],
    'usuarios': [PERMISOS.USUARIOS_VER],
    'roles': [PERMISOS.USUARIOS_ROLES, PERMISOS.USUARIOS_VER],
    'configuracion': [PERMISOS.CONFIGURACION_VER],
    'achat': [PERMISOS.ACHAT_VER],
    'branding': [PERMISOS.CONFIGURACION_VER],
    'categorias': [PERMISOS.CONFIGURACION_VER],
    'comptoir': [PERMISOS.COMPTOIR_VER],
    'id-digital': [PERMISOS.IDDIGITAL_VER],
    'guia-completa': [PERMISOS.ACCESO_TOTAL, PERMISOS.DESARROLLADOR],
    // Módulos sin permiso canónico dedicado: se controlan por rol
    'cuisine': ['administrador', 'coordinador', 'desarrollador'],
    'email-organismos': ['liaison_organisme', 'administrador', 'desarrollador'],
    'communication': ['administrador', 'desarrollador'],
    'recrutement': ['administrador', 'desarrollador'],
    'panel-marca': [PERMISOS.DESARROLLADOR],
  };
  
  const permisosNecesarios = mapaPermisos[moduloId];
  
  if (!permisosNecesarios) {
    // Si no está en el mapa, verificar si es desarrollador
    return esDesarrollador();
  }
  
  return tieneAlgunoDeEstosPermisos(permisosNecesarios);
}

/**
 * Obtiene información del usuario con sus permisos expandidos
 */
export function obtenerInfoUsuarioConPermisos() {
  const usuario = obtenerUsuarioSesion();
  
  if (!usuario) {
    return null;
  }

  const permisosExpandidos = obtenerPermisosExpandidos(usuario);
  
  return {
    ...usuario,
    permisosExpandidos,
    esDesarrollador: esDesarrollador(),
    esAdministrador: esAdministrador(),
    esCoordinador: esCoordinador(),
    soloLectura: soloLectura(),
  };
}