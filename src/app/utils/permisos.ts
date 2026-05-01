// Sistema de permisos y control de acceso
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
  
  // Configuración
  CONFIGURACION_VER: 'configuracion.ver',
  CONFIGURACION_EDITAR: 'configuracion.editar',
  
  // Comptoir
  COMPTOIR_VER: 'comptoir.ver',
  COMPTOIR_EDITAR: 'comptoir.editar',
} as const;

// Mapeo de roles a permisos
export const PERMISOS_POR_ROL: Record<string, string[]> = {
  // Desarrollador - Acceso total
  desarrollador: [
    PERMISOS.DESARROLLADOR,
    PERMISOS.ACCESO_TOTAL,
    PERMISOS.ADMINISTRADOR_GENERAL,
    PERMISOS.ADMINISTRADOR_LIAISON,
    ...Object.values(PERMISOS)
  ],
  
  // Administrador General - Todos los módulos excepto desarrollo
  administrador_general: [
    PERMISOS.ADMINISTRADOR_GENERAL,
    PERMISOS.DASHBOARD_VER,
    PERMISOS.DASHBOARD_METRICAS,
    PERMISOS.INVENTARIO_VER,
    PERMISOS.INVENTARIO_CREAR,
    PERMISOS.INVENTARIO_EDITAR,
    PERMISOS.INVENTARIO_ELIMINAR,
    PERMISOS.COMANDAS_VER,
    PERMISOS.COMANDAS_CREAR,
    PERMISOS.COMANDAS_EDITAR,
    PERMISOS.COMANDAS_APROBAR,
    PERMISOS.COMANDAS_ELIMINAR,
    PERMISOS.ORGANISMOS_VER,
    PERMISOS.ORGANISMOS_CREAR,
    PERMISOS.ORGANISMOS_EDITAR,
    PERMISOS.ORGANISMOS_ELIMINAR,
    PERMISOS.TRANSPORTE_VER,
    PERMISOS.TRANSPORTE_EDITAR,
    PERMISOS.TRANSPORTE_ENTREGAR,
    PERMISOS.TRANSPORTE_VEHICULOS,
    PERMISOS.REPORTES_VER,
    PERMISOS.REPORTES_EXPORTAR,
    PERMISOS.USUARIOS_VER,
    PERMISOS.USUARIOS_CREAR,
    PERMISOS.USUARIOS_EDITAR,
    PERMISOS.USUARIOS_ELIMINAR,
    PERMISOS.CONFIGURACION_VER,
    PERMISOS.CONFIGURACION_EDITAR,
    PERMISOS.COMPTOIR_VER,
    PERMISOS.COMPTOIR_EDITAR,
  ],
  
  // Administrador Liaison - Solo gestión de organismos y comandas
  administrador_liaison: [
    PERMISOS.ADMINISTRADOR_LIAISON,
    PERMISOS.DASHBOARD_VER,
    PERMISOS.ORGANISMOS_VER,
    PERMISOS.ORGANISMOS_CREAR,
    PERMISOS.ORGANISMOS_EDITAR,
    PERMISOS.ORGANISMOS_ELIMINAR,
    PERMISOS.COMANDAS_VER,
    PERMISOS.COMANDAS_CREAR,
    PERMISOS.COMANDAS_EDITAR,
    PERMISOS.COMANDAS_APROBAR,
    PERMISOS.INVENTARIO_VER,
    PERMISOS.REPORTES_VER,
  ],
  
  // Coordinador - Solo lectura
  coordinador: [
    PERMISOS.COORDINADOR,
    PERMISOS.DASHBOARD_VER,
    PERMISOS.INVENTARIO_VER,
    PERMISOS.COMANDAS_VER,
    PERMISOS.ORGANISMOS_VER,
    PERMISOS.TRANSPORTE_VER,
    PERMISOS.REPORTES_VER,
  ],
};

/**
 * Verifica si el usuario actual tiene un permiso específico
 */
export function tienePermiso(permiso: string): boolean {
  const usuario = obtenerUsuarioSesion();
  
  if (!usuario) {
    return false;
  }
  
  // Debug: Log para verificar
  if (permiso === 'transporte.ver') {
    console.log('🔍 Verificando permiso transporte.ver:', {
      usuario: usuario.username,
      permisos: usuario.permisos,
      tienePermisoDirecto: usuario.permisos?.includes(permiso)
    });
  }
  
  // Si el usuario tiene acceso total o es desarrollador, permitir todo
  if (usuario.permisos?.includes(PERMISOS.ACCESO_TOTAL) || 
      usuario.permisos?.includes(PERMISOS.DESARROLLADOR)) {
    return true;
  }
  
  // Verificar si tiene el permiso específico
  if (usuario.permisos?.includes(permiso)) {
    return true;
  }
  
  // Verificar permisos derivados del rol
  for (const permisoUsuario of usuario.permisos || []) {
    const permisosDerivados = PERMISOS_POR_ROL[permisoUsuario] || [];
    if (permisosDerivados.includes(permiso)) {
      return true;
    }
  }
  
  return false;
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
  
  // Si no puede crear, editar o eliminar nada, es solo lectura
  const permisosEscritura = [
    'crear', 'editar', 'eliminar', 'aprobar', 'entregar'
  ];
  
  return !usuario.permisos?.some(p => 
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
    'usuario': 'Utilisateur',
    'almacenista': 'Magasinier',
    'transportista': 'Transporteur',
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
    'contactos-almacen': [PERMISOS.ORGANISMOS_VER],
    'usuarios': [PERMISOS.USUARIOS_VER],
    'roles': [PERMISOS.USUARIOS_VER],
    'configuracion': [PERMISOS.CONFIGURACION_VER],
    'branding': [PERMISOS.CONFIGURACION_VER],
    'categorias': [PERMISOS.CONFIGURACION_VER],
    'comptoir': [PERMISOS.COMPTOIR_VER],
    'guia-completa': [PERMISOS.ACCESO_TOTAL, PERMISOS.DESARROLLADOR],
    // Módulos sin permisos específicos - solo para desarrolladores
    'cuisine': [PERMISOS.DESARROLLADOR, PERMISOS.ADMINISTRADOR_GENERAL],
    'email-organismos': [PERMISOS.ADMINISTRADOR_LIAISON, PERMISOS.ADMINISTRADOR_GENERAL, PERMISOS.DESARROLLADOR],
    'communication': [PERMISOS.DESARROLLADOR, PERMISOS.ADMINISTRADOR_GENERAL],
    'recrutement': [PERMISOS.DESARROLLADOR, PERMISOS.ADMINISTRADOR_GENERAL],
    'id-digital': [PERMISOS.DESARROLLADOR, PERMISOS.ADMINISTRADOR_GENERAL],
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
  
  // Expandir permisos basados en rol
  const permisosExpandidos = new Set<string>(usuario.permisos || []);
  
  for (const permisoUsuario of usuario.permisos || []) {
    const permisosDerivados = PERMISOS_POR_ROL[permisoUsuario] || [];
    permisosDerivados.forEach(p => permisosExpandidos.add(p));
  }
  
  return {
    ...usuario,
    permisosExpandidos: Array.from(permisosExpandidos),
    esDesarrollador: esDesarrollador(),
    esAdministrador: esAdministrador(),
    esCoordinador: esCoordinador(),
    soloLectura: soloLectura(),
  };
}