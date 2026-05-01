// Sistema de Roles y Permisos del Banco de Alimentos

export interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  modulo: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  permisos: string[]; // Array de IDs de permisos
  usuariosAsignados: number;
  activo: boolean;
  predeterminado: boolean; // No se puede eliminar
}

// Definición de todos los permisos del sistema
export const permisos: Permiso[] = [
  // Dashboard
  { id: 'dashboard.ver', nombre: 'Ver Dashboard', descripcion: 'Acceso al panel principal y estadísticas', modulo: 'Dashboard' },
  
  // Inventario
  { id: 'inventario.ver', nombre: 'Ver Inventario', descripcion: 'Visualizar productos y stock', modulo: 'Inventario' },
  { id: 'inventario.crear', nombre: 'Crear Productos', descripcion: 'Agregar nuevos productos al inventario', modulo: 'Inventario' },
  { id: 'inventario.editar', nombre: 'Editar Productos', descripcion: 'Modificar información de productos', modulo: 'Inventario' },
  { id: 'inventario.eliminar', nombre: 'Eliminar Productos', descripcion: 'Eliminar productos del inventario', modulo: 'Inventario' },
  { id: 'inventario.movimientos', nombre: 'Registrar Movimientos', descripcion: 'Crear entradas y salidas de inventario', modulo: 'Inventario' },
  { id: 'inventario.ajustes', nombre: 'Ajustes de Inventario', descripcion: 'Realizar ajustes y correcciones de stock', modulo: 'Inventario' },
  
  // Comandas
  { id: 'comandas.ver', nombre: 'Ver Comandas', descripcion: 'Visualizar comandas existentes', modulo: 'Comandas' },
  { id: 'comandas.crear', nombre: 'Crear Comandas', descripcion: 'Generar nuevas comandas', modulo: 'Comandas' },
  { id: 'comandas.editar', nombre: 'Editar Comandas', descripcion: 'Modificar comandas pendientes', modulo: 'Comandas' },
  { id: 'comandas.eliminar', nombre: 'Eliminar Comandas', descripcion: 'Eliminar comandas del sistema', modulo: 'Comandas' },
  { id: 'comandas.aprobar', nombre: 'Aprobar Comandas', descripcion: 'Aprobar comandas generadas', modulo: 'Comandas' },
  { id: 'comandas.completar', nombre: 'Completar Comandas', descripcion: 'Marcar comandas como completadas', modulo: 'Comandas' },
  
  // PRS
  { id: 'prs.ver', nombre: 'Ver Panel PRS', descripcion: 'Acceso al módulo PRS', modulo: 'PRS' },
  { id: 'prs.registrar', nombre: 'Registrar PRS', descripcion: 'Crear registros de rescate de sobrantes', modulo: 'PRS' },
  { id: 'prs.editar', nombre: 'Editar Registros PRS', descripcion: 'Modificar registros PRS', modulo: 'PRS' },
  { id: 'prs.eliminar', nombre: 'Eliminar Registros PRS', descripcion: 'Eliminar registros PRS', modulo: 'PRS' },
  { id: 'prs.categorias', nombre: 'Gestionar Categorías PRS', descripcion: 'Administrar categorías y productos PRS', modulo: 'PRS' },
  
  // Organismos
  { id: 'organismos.ver', nombre: 'Ver Organismos', descripcion: 'Visualizar información de organismos', modulo: 'Organismos' },
  { id: 'organismos.crear', nombre: 'Crear Organismos', descripcion: 'Registrar nuevos organismos', modulo: 'Organismos' },
  { id: 'organismos.editar', nombre: 'Editar Organismos', descripcion: 'Modificar datos de organismos', modulo: 'Organismos' },
  { id: 'organismos.eliminar', nombre: 'Eliminar Organismos', descripcion: 'Eliminar organismos del sistema', modulo: 'Organismos' },
  { id: 'organismos.perfil', nombre: 'Ver Perfil Completo', descripcion: 'Acceso a perfil detallado de organismos', modulo: 'Organismos' },
  { id: 'organismos.documentos', nombre: 'Gestionar Documentos', descripcion: 'Subir y gestionar documentos de organismos', modulo: 'Organismos' },
  
  // Transporte
  { id: 'transporte.ver', nombre: 'Ver Transporte', descripcion: 'Visualizar rutas y entregas', modulo: 'Transporte' },
  { id: 'transporte.crear', nombre: 'Crear Rutas', descripcion: 'Planificar nuevas rutas de entrega', modulo: 'Transporte' },
  { id: 'transporte.editar', nombre: 'Editar Rutas', descripcion: 'Modificar rutas existentes', modulo: 'Transporte' },
  { id: 'transporte.eliminar', nombre: 'Eliminar Rutas', descripcion: 'Eliminar rutas del sistema', modulo: 'Transporte' },
  { id: 'transporte.entregar', nombre: 'Registrar Entregas', descripcion: 'Marcar entregas como completadas', modulo: 'Transporte' },
  { id: 'transporte.vehiculos', nombre: 'Gestionar Vehículos', descripcion: 'Administrar flota de vehículos', modulo: 'Transporte' },
  
  // Reportes
  { id: 'reportes.ver', nombre: 'Ver Reportes', descripcion: 'Acceso a módulo de reportes', modulo: 'Reportes' },
  { id: 'reportes.generar', nombre: 'Generar Reportes', descripcion: 'Crear reportes personalizados', modulo: 'Reportes' },
  { id: 'reportes.exportar', nombre: 'Exportar Reportes', descripcion: 'Exportar reportes en PDF/Excel', modulo: 'Reportes' },
  { id: 'reportes.avanzados', nombre: 'Reportes Avanzados', descripcion: 'Acceso a reportes financieros y estadísticos', modulo: 'Reportes' },
  
  // Usuarios y Roles
  { id: 'usuarios.ver', nombre: 'Ver Usuarios', descripcion: 'Visualizar usuarios del sistema', modulo: 'Usuarios' },
  { id: 'usuarios.crear', nombre: 'Crear Usuarios', descripcion: 'Registrar nuevos usuarios', modulo: 'Usuarios' },
  { id: 'usuarios.editar', nombre: 'Editar Usuarios', descripcion: 'Modificar información de usuarios', modulo: 'Usuarios' },
  { id: 'usuarios.eliminar', nombre: 'Eliminar Usuarios', descripcion: 'Eliminar usuarios del sistema', modulo: 'Usuarios' },
  { id: 'usuarios.roles', nombre: 'Gestionar Roles', descripcion: 'Crear y modificar roles y permisos', modulo: 'Usuarios' },
  { id: 'usuarios.permisos', nombre: 'Asignar Permisos', descripcion: 'Asignar permisos a roles', modulo: 'Usuarios' },
  
  // ID Digital
  { id: 'iddigital.ver', nombre: 'Ver IDs Digitales', descripcion: 'Acceso a módulo de ID Digital', modulo: 'ID Digital' },
  { id: 'iddigital.crear', nombre: 'Crear IDs', descripcion: 'Generar nuevas tarjetas digitales', modulo: 'ID Digital' },
  { id: 'iddigital.editar', nombre: 'Editar IDs', descripcion: 'Modificar IDs existentes', modulo: 'ID Digital' },
  { id: 'iddigital.eliminar', nombre: 'Eliminar IDs', descripcion: 'Eliminar IDs digitales', modulo: 'ID Digital' },
  { id: 'iddigital.imprimir', nombre: 'Imprimir IDs', descripcion: 'Generar PDFs para impresión', modulo: 'ID Digital' },
  
  // Configuración
  { id: 'config.ver', nombre: 'Ver Configuración', descripcion: 'Acceso a configuración del sistema', modulo: 'Configuración' },
  { id: 'config.editar', nombre: 'Editar Configuración', descripcion: 'Modificar configuración general', modulo: 'Configuración' },
  { id: 'config.marca', nombre: 'Gestionar Marca', descripcion: 'Personalizar marca y apariencia', modulo: 'Configuración' },
  { id: 'config.idioma', nombre: 'Configurar Idioma', descripcion: 'Cambiar idioma del sistema', modulo: 'Configuración' },
];

// Roles predeterminados del sistema
export const rolesPredeterminados: Rol[] = [
  {
    id: 'admin',
    nombre: 'Administrateur',
    descripcion: 'Accès complet à toutes les fonctions du système',
    color: '#DC3545',
    icono: '👑',
    permisos: permisos.map(p => p.id), // Todos los permisos
    usuariosAsignados: 1,
    activo: true,
    predeterminado: true
  },
  {
    id: 'coordinador',
    nombre: 'Coordinateur',
    descripcion: 'Gestion des opérations, commandes et organismes',
    color: '#1E73BE',
    icono: '📋',
    permisos: [
      'dashboard.ver',
      'inventario.ver',
      'comandas.ver',
      'comandas.crear',
      'comandas.editar',
      'comandas.aprobar',
      'comandas.completar',
      'prs.ver',
      'prs.registrar',
      'organismos.ver',
      'organismos.crear',
      'organismos.editar',
      'organismos.perfil',
      'transporte.ver',
      'transporte.crear',
      'reportes.ver',
      'reportes.generar',
      'reportes.exportar',
      'iddigital.ver',
      'iddigital.crear',
      'config.ver'
    ],
    usuariosAsignados: 0,
    activo: true,
    predeterminado: true
  },
  {
    id: 'almacenista',
    nombre: 'Magasinier',
    descripcion: 'Gestion de l\'inventaire et mouvements de produits',
    color: '#4CAF50',
    icono: '📦',
    permisos: [
      'dashboard.ver',
      'inventario.ver',
      'inventario.crear',
      'inventario.editar',
      'inventario.movimientos',
      'inventario.ajustes',
      'comandas.ver',
      'comandas.completar',
      'prs.ver',
      'prs.registrar',
      'organismos.ver',
      'reportes.ver',
      'reportes.generar',
      'config.ver'
    ],
    usuariosAsignados: 1,
    activo: true,
    predeterminado: true
  },
  {
    id: 'transportista',
    nombre: 'Transporteur',
    descripcion: 'Gestion des itinéraires, livraisons et transport',
    color: '#FFC107',
    icono: '🚚',
    permisos: [
      'dashboard.ver',
      'comandas.ver',
      'organismos.ver',
      'transporte.ver',
      'transporte.editar',
      'transporte.entregar',
      'reportes.ver',
      'config.ver'
    ],
    usuariosAsignados: 1,
    activo: true,
    predeterminado: true
  },
  {
    id: 'auditor',
    nombre: 'Auditeur',
    descripcion: 'Lecture seule - Accès aux rapports et visualisation',
    color: '#9C27B0',
    icono: '📊',
    permisos: [
      'dashboard.ver',
      'inventario.ver',
      'comandas.ver',
      'prs.ver',
      'organismos.ver',
      'transporte.ver',
      'reportes.ver',
      'reportes.generar',
      'reportes.exportar',
      'reportes.avanzados',
      'iddigital.ver'
    ],
    usuariosAsignados: 0,
    activo: true,
    predeterminado: false
  },
  {
    id: 'voluntario',
    nombre: 'Bénévole',
    descripcion: 'Accès limité pour les bénévoles',
    color: '#FF9800',
    icono: '🤝',
    permisos: [
      'dashboard.ver',
      'inventario.ver',
      'comandas.ver',
      'organismos.ver',
      'config.ver'
    ],
    usuariosAsignados: 0,
    activo: true,
    predeterminado: false
  }
];

// Agrupar permisos por módulo
export const permisosPorModulo = permisos.reduce((acc, permiso) => {
  if (!acc[permiso.modulo]) {
    acc[permiso.modulo] = [];
  }
  acc[permiso.modulo].push(permiso);
  return acc;
}, {} as Record<string, Permiso[]>);

// Función para obtener permisos de un rol
export const getPermisosDeRol = (rolId: string): Permiso[] => {
  const rol = rolesPredeterminados.find(r => r.id === rolId);
  if (!rol) return [];
  return permisos.filter(p => rol.permisos.includes(p.id));
};

// Función para verificar si un rol tiene un permiso específico
export const tienePermiso = (rolId: string, permisoId: string): boolean => {
  const rol = rolesPredeterminados.find(r => r.id === rolId);
  return rol ? rol.permisos.includes(permisoId) : false;
};

// Iconos de módulos
export const iconosModulos: Record<string, string> = {
  'Dashboard': '📊',
  'Inventario': '📦',
  'Comandas': '📋',
  'PRS': '♻️',
  'Organismos': '🏛️',
  'Transporte': '🚚',
  'Reportes': '📈',
  'Usuarios': '👥',
  'ID Digital': '🪪',
  'Configuración': '⚙️'
};

// Colores de módulos
export const coloresModulos: Record<string, string> = {
  'Dashboard': '#1E73BE',
  'Inventario': '#4CAF50',
  'Comandas': '#FFC107',
  'PRS': '#4CAF50',
  'Organismos': '#1E73BE',
  'Transporte': '#FFC107',
  'Reportes': '#9C27B0',
  'Usuarios': '#DC3545',
  'ID Digital': '#00BCD4',
  'Configuración': '#607D8B'
};