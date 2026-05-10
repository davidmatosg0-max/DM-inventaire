// Sistema de Roles y Permisos del Banco de Alimentos

import { ROLES_CONFIG, type RolUsuario } from '../utils/usuarios';

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
  { id: 'dashboard.ver', nombre: 'Voir le tableau de bord', descripcion: 'Accès au panneau principal et aux statistiques', modulo: 'Tableau de bord' },
  { id: 'dashboard.metricas', nombre: 'Voir les métriques avancées', descripcion: 'Accéder aux indicateurs détaillés et aux métriques exécutives', modulo: 'Tableau de bord' },
  
  // Inventario
  { id: 'inventario.ver', nombre: 'Voir l\'inventaire', descripcion: 'Consulter les produits et le stock', modulo: 'Inventaire' },
  { id: 'inventario.crear', nombre: 'Créer des produits', descripcion: 'Ajouter de nouveaux produits à l\'inventaire', modulo: 'Inventaire' },
  { id: 'inventario.editar', nombre: 'Modifier les produits', descripcion: 'Mettre à jour les informations des produits', modulo: 'Inventaire' },
  { id: 'inventario.eliminar', nombre: 'Supprimer des produits', descripcion: 'Retirer des produits de l\'inventaire', modulo: 'Inventaire' },
  { id: 'inventario.movimientos', nombre: 'Enregistrer des mouvements', descripcion: 'Créer des entrées et des sorties d\'inventaire', modulo: 'Inventaire' },
  { id: 'inventario.ajustes', nombre: 'Ajustements d\'inventaire', descripcion: 'Effectuer des ajustements et corrections de stock', modulo: 'Inventaire' },
  
  // Comandas
  { id: 'comandas.ver', nombre: 'Voir les commandes', descripcion: 'Consulter les commandes existantes', modulo: 'Commandes' },
  { id: 'comandas.crear', nombre: 'Créer des commandes', descripcion: 'Générer de nouvelles commandes', modulo: 'Commandes' },
  { id: 'comandas.editar', nombre: 'Modifier les commandes', descripcion: 'Mettre à jour les commandes en attente', modulo: 'Commandes' },
  { id: 'comandas.eliminar', nombre: 'Supprimer des commandes', descripcion: 'Supprimer des commandes du système', modulo: 'Commandes' },
  { id: 'comandas.aprobar', nombre: 'Approuver les commandes', descripcion: 'Valider les commandes générées', modulo: 'Commandes' },
  { id: 'comandas.completar', nombre: 'Finaliser les commandes', descripcion: 'Marquer les commandes comme terminées', modulo: 'Commandes' },
  
  // PRS
  { id: 'prs.ver', nombre: 'Voir le panneau PRS', descripcion: 'Accès au module PRS', modulo: 'PRS' },
  { id: 'prs.registrar', nombre: 'Enregistrer des dossiers PRS', descripcion: 'Créer des registres de récupération des surplus', modulo: 'PRS' },
  { id: 'prs.editar', nombre: 'Modifier les dossiers PRS', descripcion: 'Mettre à jour les registres PRS', modulo: 'PRS' },
  { id: 'prs.eliminar', nombre: 'Supprimer les dossiers PRS', descripcion: 'Supprimer des registres PRS', modulo: 'PRS' },
  { id: 'prs.categorias', nombre: 'Gérer les catégories PRS', descripcion: 'Administrer les catégories et produits PRS', modulo: 'PRS' },
  
  // Organismos
  { id: 'organismos.ver', nombre: 'Voir les organismes', descripcion: 'Consulter les informations des organismes', modulo: 'Organismes' },
  { id: 'organismos.crear', nombre: 'Créer des organismes', descripcion: 'Enregistrer de nouveaux organismes', modulo: 'Organismes' },
  { id: 'organismos.editar', nombre: 'Modifier les organismes', descripcion: 'Mettre à jour les données des organismes', modulo: 'Organismes' },
  { id: 'organismos.eliminar', nombre: 'Supprimer des organismes', descripcion: 'Retirer des organismes du système', modulo: 'Organismes' },
  { id: 'organismos.perfil', nombre: 'Voir le profil complet', descripcion: 'Accès au profil détaillé des organismes', modulo: 'Organismes' },
  { id: 'organismos.documentos', nombre: 'Gérer les documents', descripcion: 'Téléverser et gérer les documents des organismes', modulo: 'Organismes' },

  // Offres organismes
  { id: 'ofertas.ver', nombre: 'Voir les offres aux organismes', descripcion: 'Consulter les offres disponibles pour les organismes', modulo: 'Offres Organismes' },
  { id: 'ofertas.editar', nombre: 'Gérer les offres aux organismes', descripcion: 'Créer et mettre à jour les offres destinées aux organismes', modulo: 'Offres Organismes' },

  // Partenaires et fournisseurs
  { id: 'partenaires.ver', nombre: 'Voir les partenaires et fournisseurs', descripcion: 'Consulter le registre des partenaires et fournisseurs', modulo: 'Partenaires & Fournisseurs' },
  { id: 'partenaires.editar', nombre: 'Gérer les partenaires et fournisseurs', descripcion: 'Créer et mettre à jour les partenaires et fournisseurs', modulo: 'Partenaires & Fournisseurs' },

  // Annuaire entrepôt
  { id: 'annuaire_entrepot.ver', nombre: 'Voir l\'annuaire Entrepôt', descripcion: 'Consulter les contacts opérationnels de l\'entrepôt', modulo: 'Annuaire Entrepôt' },
  { id: 'annuaire_entrepot.editar', nombre: 'Gérer l\'annuaire Entrepôt', descripcion: 'Créer et mettre à jour les contacts de l\'entrepôt', modulo: 'Annuaire Entrepôt' },
  
  // Transporte
  { id: 'transporte.ver', nombre: 'Voir le transport', descripcion: 'Consulter les routes et les livraisons', modulo: 'Transport' },
  { id: 'transporte.crear', nombre: 'Créer des routes', descripcion: 'Planifier de nouvelles routes de livraison', modulo: 'Transport' },
  { id: 'transporte.editar', nombre: 'Modifier les routes', descripcion: 'Mettre à jour les routes existantes', modulo: 'Transport' },
  { id: 'transporte.eliminar', nombre: 'Supprimer des routes', descripcion: 'Supprimer des routes du système', modulo: 'Transport' },
  { id: 'transporte.entregar', nombre: 'Enregistrer les livraisons', descripcion: 'Marquer les livraisons comme terminées', modulo: 'Transport' },
  { id: 'transporte.vehiculos', nombre: 'Gérer les véhicules', descripcion: 'Administrer la flotte de véhicules', modulo: 'Transport' },

  // Comptoir
  { id: 'comptoir.ver', nombre: 'Voir le comptoir', descripcion: 'Accéder au module de comptoir et aux opérations associées', modulo: 'Comptoir' },
  { id: 'comptoir.editar', nombre: 'Gérer le comptoir', descripcion: 'Mettre à jour les opérations et informations du comptoir', modulo: 'Comptoir' },

  // Cuisine
  { id: 'cuisine.ver', nombre: 'Voir la cuisine', descripcion: 'Accéder au module de cuisine et de préparation', modulo: 'Cuisine' },
  { id: 'cuisine.editar', nombre: 'Gérer la cuisine', descripcion: 'Mettre à jour les opérations de cuisine et de production', modulo: 'Cuisine' },

  // Liaison organismes
  { id: 'liaison.ver', nombre: 'Voir la liaison organismes', descripcion: 'Accéder au module de liaison avec les organismes', modulo: 'Liaison Organismes' },
  { id: 'liaison.editar', nombre: 'Gérer la liaison organismes', descripcion: 'Mettre à jour les échanges et le suivi des organismes', modulo: 'Liaison Organismes' },

  // Communication interne
  { id: 'communication.ver', nombre: 'Voir la messagerie interne', descripcion: 'Accéder à la messagerie interne et aux conversations', modulo: 'Messagerie Interne' },
  { id: 'communication.editar', nombre: 'Gérer la messagerie interne', descripcion: 'Envoyer et gérer les messages internes', modulo: 'Messagerie Interne' },

  // Recrutement
  { id: 'recrutement.ver', nombre: 'Voir le recrutement', descripcion: 'Accéder au module de recrutement et aux candidatures', modulo: 'Recrutement' },
  { id: 'recrutement.editar', nombre: 'Gérer le recrutement', descripcion: 'Mettre à jour les candidatures et les campagnes de recrutement', modulo: 'Recrutement' },
  
  // Reportes
  { id: 'reportes.ver', nombre: 'Voir les rapports', descripcion: 'Accès au module de rapports', modulo: 'Rapports' },
  { id: 'reportes.generar', nombre: 'Générer des rapports', descripcion: 'Créer des rapports personnalisés', modulo: 'Rapports' },
  { id: 'reportes.exportar', nombre: 'Exporter les rapports', descripcion: 'Exporter les rapports en PDF ou Excel', modulo: 'Rapports' },
  { id: 'reportes.avanzados', nombre: 'Rapports avancés', descripcion: 'Accès aux rapports financiers et statistiques', modulo: 'Rapports' },

  // Achats
  { id: 'achat.ver', nombre: 'Voir les achats', descripcion: 'Accès au module des bons d\'achat et au suivi des achats', modulo: 'Achats' },
  { id: 'achat.crear', nombre: 'Créer des bons d\'achat', descripcion: 'Créer et envoyer des bons d\'achat pour approbation', modulo: 'Achats' },
  { id: 'achat.autorizar', nombre: 'Autoriser les achats', descripcion: 'Approuver ou refuser les bons d\'achat selon la politique interne', modulo: 'Achats' },
  
  // Usuarios y Roles
  { id: 'usuarios.ver', nombre: 'Voir les utilisateurs', descripcion: 'Consulter les utilisateurs du système', modulo: 'Utilisateurs' },
  { id: 'usuarios.crear', nombre: 'Créer des utilisateurs', descripcion: 'Enregistrer de nouveaux utilisateurs', modulo: 'Utilisateurs' },
  { id: 'usuarios.editar', nombre: 'Modifier les utilisateurs', descripcion: 'Mettre à jour les informations des utilisateurs', modulo: 'Utilisateurs' },
  { id: 'usuarios.eliminar', nombre: 'Supprimer des utilisateurs', descripcion: 'Supprimer des utilisateurs du système', modulo: 'Utilisateurs' },
  { id: 'usuarios.roles', nombre: 'Gérer les rôles', descripcion: 'Créer et modifier les rôles et les permissions', modulo: 'Utilisateurs' },
  { id: 'usuarios.permisos', nombre: 'Attribuer des permissions', descripcion: 'Attribuer des permissions aux rôles', modulo: 'Utilisateurs' },
  
  // ID Digital
  { id: 'iddigital.ver', nombre: 'Voir les identifiants numériques', descripcion: 'Accès au module ID Digital', modulo: 'ID Digital' },
  { id: 'iddigital.crear', nombre: 'Créer des identifiants', descripcion: 'Générer de nouvelles cartes numériques', modulo: 'ID Digital' },
  { id: 'iddigital.editar', nombre: 'Modifier les identifiants', descripcion: 'Mettre à jour les identifiants existants', modulo: 'ID Digital' },
  { id: 'iddigital.eliminar', nombre: 'Supprimer des identifiants', descripcion: 'Supprimer des identifiants numériques', modulo: 'ID Digital' },
  { id: 'iddigital.imprimir', nombre: 'Imprimer les identifiants', descripcion: 'Générer des PDF pour l\'impression', modulo: 'ID Digital' },
  
  // Configuración
  { id: 'configuracion.ver', nombre: 'Voir la configuration', descripcion: 'Accès à la configuration du système', modulo: 'Configuration' },
  { id: 'configuracion.editar', nombre: 'Modifier la configuration', descripcion: 'Mettre à jour la configuration générale', modulo: 'Configuration' },
  { id: 'configuracion.marca', nombre: 'Gérer la marque', descripcion: 'Personnaliser la marque et l\'apparence', modulo: 'Configuration' },
  { id: 'configuracion.idioma', nombre: 'Configurer la langue', descripcion: 'Changer la langue du système', modulo: 'Configuration' },
];

const permisosDisponibles = new Set(permisos.map((permiso) => permiso.id));

const iconosRol: Record<RolUsuario, string> = {
  desarrollador: '💻',
  administrador: '👑',
  coordinador: '📋',
  responsable_entrepot: '📦',
  responsable_comptoir: '🛒',
  responsable_transport: '🚚',
  liaison_organisme: '🏛️',
  benevole_comptoir: '🤝',
  benevole_entrepot: '🧺',
  employe: '🧑‍💼',
  visualizador: '👁️'
};

const permisosPorRolSistema: Record<RolUsuario, string[]> = {
  desarrollador: permisos.map((permiso) => permiso.id),
  administrador: permisos.map((permiso) => permiso.id),
  coordinador: [
    'dashboard.ver',
    'dashboard.metricas',
    'inventario.ver',
    'inventario.editar',
    'inventario.movimientos',
    'comandas.ver',
    'comandas.crear',
    'comandas.editar',
    'comandas.aprobar',
    'prs.ver',
    'prs.registrar',
    'organismos.ver',
    'organismos.crear',
    'organismos.editar',
    'organismos.perfil',
    'ofertas.ver',
    'partenaires.ver',
    'annuaire_entrepot.ver',
    'transporte.ver',
    'cuisine.ver',
    'communication.ver',
    'reportes.ver',
    'reportes.generar',
    'reportes.exportar',
    'reportes.avanzados',
    'achat.ver',
    'achat.crear'
  ],
  responsable_entrepot: [
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
    'prs.editar',
    'organismos.ver',
    'partenaires.ver',
    'annuaire_entrepot.ver',
    'communication.ver',
    'reportes.ver',
    'achat.ver'
  ],
  responsable_comptoir: [
    'dashboard.ver',
    'comandas.ver',
    'comandas.crear',
    'comandas.editar',
    'comptoir.ver',
    'organismos.ver',
    'communication.ver',
    'reportes.ver',
    'achat.ver'
  ],
  responsable_transport: [
    'dashboard.ver',
    'comandas.ver',
    'organismos.ver',
    'transporte.ver',
    'transporte.crear',
    'transporte.editar',
    'transporte.entregar',
    'transporte.vehiculos',
    'reportes.ver'
  ],
  liaison_organisme: [
    'dashboard.ver',
    'organismos.ver',
    'organismos.crear',
    'organismos.editar',
    'organismos.eliminar',
    'organismos.perfil',
    'organismos.documentos',
    'ofertas.ver',
    'ofertas.editar',
    'liaison.ver',
    'liaison.editar',
    'communication.ver',
    'communication.editar',
    'comandas.ver',
    'comandas.crear',
    'comandas.editar',
    'comandas.aprobar',
    'reportes.ver',
    'achat.ver',
    'achat.crear'
  ],
  benevole_comptoir: [
    'dashboard.ver',
    'comandas.ver',
    'organismos.ver'
  ],
  benevole_entrepot: [
    'dashboard.ver',
    'inventario.ver',
    'prs.ver'
  ],
  employe: [
    'dashboard.ver',
    'inventario.ver',
    'comandas.ver',
    'organismos.ver',
    'reportes.ver'
  ],
  visualizador: [
    'dashboard.ver',
    'reportes.ver',
  ]
};

// Roles predeterminados del sistema
export const rolesPredeterminados: Rol[] = (Object.entries(ROLES_CONFIG) as Array<[RolUsuario, typeof ROLES_CONFIG[RolUsuario]]>).map(([id, config], index) => ({
  id,
  nombre: config.nombre,
  descripcion: config.descripcion,
  color: config.color,
  icono: iconosRol[id],
  permisos: (permisosPorRolSistema[id] || []).filter((permisoId) => permisosDisponibles.has(permisoId)),
  usuariosAsignados: index < 2 ? 1 : 0,
  activo: true,
  predeterminado: true
}));

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
  'Tableau de bord': '📊',
  'Inventaire': '📦',
  'Commandes': '📋',
  'PRS': '♻️',
  'Organismes': '🏛️',
  'Offres Organismes': '🏷️',
  'Partenaires & Fournisseurs': '🤝',
  'Annuaire Entrepôt': '📇',
  'Transport': '🚚',
  'Comptoir': '🛒',
  'Cuisine': '👨‍🍳',
  'Liaison Organismes': '📨',
  'Messagerie Interne': '💬',
  'Recrutement': '🧑‍💼',
  'Rapports': '📈',
  'Achats': '🧾',
  'Utilisateurs': '👥',
  'ID Digital': '🪪',
  'Configuration': '⚙️'
};

// Colores de módulos
export const coloresModulos: Record<string, string> = {
  'Tableau de bord': '#1E73BE',
  'Inventaire': '#4CAF50',
  'Commandes': '#FFC107',
  'PRS': '#4CAF50',
  'Organismes': '#1E73BE',
  'Offres Organismes': '#0F766E',
  'Partenaires & Fournisseurs': '#8B5CF6',
  'Annuaire Entrepôt': '#64748B',
  'Transport': '#FFC107',
  'Comptoir': '#2D9561',
  'Cuisine': '#EA580C',
  'Liaison Organismes': '#7C3AED',
  'Messagerie Interne': '#0F172A',
  'Recrutement': '#BE185D',
  'Rapports': '#9C27B0',
  'Achats': '#8B5CF6',
  'Utilisateurs': '#DC3545',
  'ID Digital': '#00BCD4',
  'Configuration': '#607D8B'
};