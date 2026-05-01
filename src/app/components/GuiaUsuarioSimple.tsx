import React from 'react';
import { 
  BookOpen, 
  Package, 
  ShoppingCart, 
  Building2, 
  Truck, 
  FileText, 
  Users, 
  Settings,
  BarChart3,
  ChevronRight,
  ChevronDown,
  X,
  Keyboard,
  Command
} from 'lucide-react';
import { useSupportConfig } from '../utils/supportConfigSync';

interface GuiaUsuarioSimpleProps {
  open: boolean;
  onClose: () => void;
  initialTab?: string;
}

export function GuiaUsuarioSimple({ open, onClose, initialTab = 'modules' }: GuiaUsuarioSimpleProps) {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  // Hook para obtener configuración de soporte actualizada en tiempo real
  const supportConfig = useSupportConfig();
  // Inicialmente todos los módulos están expandidos para que se vea el contenido
  const [expandedModules, setExpandedModules] = React.useState<string[]>([
    'dashboard', 'inventario', 'comandas', 'organismos', 'transporte', 'reportes', 'usuarios', 'configuracion'
  ]);

  // Actualizar la pestaña activa cuando cambia initialTab
  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  if (!open) return null;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const modulosGuia = [
    {
      id: 'dashboard',
      titulo: 'Tableau de bord',
      icono: <BarChart3 className="w-5 h-5" />,
      descripcion: 'Vue d\'ensemble des statistiques et activités du système',
      caracteristicas: [
        'Inventaire total et valeur',
        'Commandes actives et en attente',
        'Produits à stock faible',
        'Graphiques et tendances',
        'Activité récente'
      ]
    },
    {
      id: 'inventario',
      titulo: 'Inventaire',
      icono: <Package className="w-5 h-5" />,
      descripcion: 'Gestion complète des produits et mouvements d\'inventaire',
      caracteristicas: [
        'Enregistrement d\'entrées (dons/achats)',
        'Gestion de catégories et sous-catégories',
        'Suivi de lots et dates d\'expiration',
        'Étiquettes avec codes-barres et QR',
        'Historique des mouvements',
        'Système de conversion de produits'
      ]
    },
    {
      id: 'comandas',
      titulo: 'Commandes',
      icono: <ShoppingCart className="w-5 h-5" />,
      descripcion: 'Administration des commandes et livraisons aux organismes',
      caracteristicas: [
        'Création de commandes individuelles',
        'Commandes en groupe',
        'Offres spéciales',
        'Suivi d\'état et préparation',
        'Impression d\'étiquettes',
        'Notifications aux organismes'
      ]
    },
    {
      id: 'organismos',
      titulo: 'Organismes',
      icono: <Building2 className="w-5 h-5" />,
      descripcion: 'Gestion des organismes bénéficiaires et contacts',
      caracteristicas: [
        'Base de données des organismes',
        'Programme PRS (Sauvetage)',
        'Historique de distribution',
        'Gestion de contacts',
        'Accès au portail pour organismes'
      ]
    },
    {
      id: 'transporte',
      titulo: 'Transport',
      icono: <Truck className="w-5 h-5" />,
      descripcion: 'Planification et suivi des livraisons',
      caracteristicas: [
        'Routes de livraison',
        'Assignation de véhicules',
        'Suivi GPS (à venir)',
        'Historique de transports'
      ]
    },
    {
      id: 'reportes',
      titulo: 'Rapports',
      icono: <FileText className="w-5 h-5" />,
      descripcion: 'Génération de rapports et statistiques',
      caracteristicas: [
        'Rapports d\'inventaire',
        'Rapports de distribution',
        'Statistiques par organisme',
        'Export PDF et Excel',
        'Rapports personnalisés'
      ]
    },
    {
      id: 'usuarios',
      titulo: 'Utilisateurs',
      icono: <Users className="w-5 h-5" />,
      descripcion: 'Gestion des utilisateurs et permissions',
      caracteristicas: [
        'Création d\'utilisateurs',
        'Rôles et permissions',
        'Historique d\'activités',
        'Sécurité et accès'
      ]
    },
    {
      id: 'configuracion',
      titulo: 'Configuration',
      icono: <Settings className="w-5 h-5" />,
      descripcion: 'Paramètres du système',
      caracteristicas: [
        'Catégories de produits',
        'Unités de mesure',
        'Valeurs monétaires',
        'Paramètres généraux',
        'Personnalisation'
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#1E73BE]" />
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide Utilisateur - Système Banque Alimentaire
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'modules'
                  ? 'border-b-2 border-[#1E73BE] text-[#1E73BE]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Modules
            </button>
            <button
              onClick={() => setActiveTab('caracteristiques')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'caracteristiques'
                  ? 'border-b-2 border-[#1E73BE] text-[#1E73BE]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Fonctionnalités
            </button>
            <button
              onClick={() => setActiveTab('aide')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'aide'
                  ? 'border-b-2 border-[#1E73BE] text-[#1E73BE]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Aide Rapide
            </button>
            <button
              onClick={() => setActiveTab('raccourcis')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'raccourcis'
                  ? 'border-b-2 border-[#1E73BE] text-[#1E73BE]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Raccourcis Clavier
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Content: Modules */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modulosGuia.map((modulo) => {
                const isExpanded = expandedModules.includes(modulo.id);
                return (
                  <div 
                    key={modulo.id} 
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Header cliqueable */}
                    <button
                      onClick={() => toggleModule(modulo.id)}
                      className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#1E73BE] bg-opacity-10 flex items-center justify-center text-[#1E73BE] flex-shrink-0">
                        {modulo.icono}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {modulo.titulo}
                          </h3>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-[#1E73BE]" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {modulo.descripcion}
                        </p>
                      </div>
                    </button>

                    {/* Contenido desplegable */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 space-y-2 border-t border-gray-100">
                        <div className="mt-3 space-y-2">
                          {modulo.caracteristicas.map((caracteristica, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-[#4CAF50] flex-shrink-0 mt-0.5" />
                              <span style={{ fontFamily: 'Roboto, sans-serif' }}>{caracteristica}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content: Caractéristiques */}
          {activeTab === 'caracteristiques' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Multilingue
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Support pour français, espagnol, anglais et arabe avec RTL
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Système d'Étiquettes
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Génération automatique d'étiquettes avec codes-barres et QR
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Balances Électroniques
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Intégration avec balances pour pesage automatique
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Comptoir (ID Digital)
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Système de vérification d'identité pour organismes
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Conversions
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Transformation de produits avec suivi complet
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Accès Organismes
                  </h3>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Portail web pour que les organismes consultent leurs offres
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  📚 Documentation Spécialisée
                </h3>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#4CAF50] flex-shrink-0 mt-0.5" />
                    <span><strong>Guide des Balances:</strong> Consultez la documentation technique dans Configuration → Balances</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#4CAF50] flex-shrink-0 mt-0.5" />
                    <span><strong>Guide des Conversions:</strong> Disponible dans Inventaire → Conversions → Bouton Guide</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#4CAF50] flex-shrink-0 mt-0.5" />
                    <span><strong>Système ID Digital:</strong> Documentation dans le module Comptoir</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Aide Rapide */}
          {activeTab === 'aide' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Premiers Pas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Configuration Initiale
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Allez dans Configuration pour créer vos catégories, sous-catégories et unités de mesure
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Enregistrer des Produits
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Dans Inventaire, utilisez "Nouvelle Entrée" pour enregistrer dons ou achats
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Créer des Organismes
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Ajoutez vos organismes bénéficiaires dans le module Organismes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Générer des Commandes
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Utilisez le panier dans Inventaire ou créez des commandes directes dans Commandes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  💡 Conseils Utiles
                </h3>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <p>✓ <strong>Étiquettes:</strong> Imprimez automatiquement les étiquettes après chaque entrée</p>
                  <p>✓ <strong>Codes-barres:</strong> Scannez les codes pour accéder rapidement aux produits</p>
                  <p>✓ <strong>Filtres:</strong> Utilisez les filtres par catégorie, date et statut pour trouver rapidement</p>
                  <p>✓ <strong>Multilingue:</strong> Changez la langue depuis le sélecteur dans le header</p>
                  <p>✓ <strong>Export:</strong> Tous les rapports peuvent être exportés en PDF ou Excel</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  📞 Besoin d'Aide?
                </h3>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {supportConfig.support.enabled && supportConfig.support.email && (
                    <p><strong>Email:</strong> {supportConfig.support.email}</p>
                  )}
                  {supportConfig.support.enabled && supportConfig.support.emailSecondaire && (
                    <p><strong>Email secondaire:</strong> {supportConfig.support.emailSecondaire}</p>
                  )}
                  {supportConfig.support.enabled && supportConfig.support.phone && (
                    <p><strong>Téléphone:</strong> {supportConfig.support.phone}</p>
                  )}
                  {supportConfig.chatAide.enabled && supportConfig.chatAide.type === 'email' && (
                    <p><strong>Chat d'aide:</strong> {supportConfig.chatAide.value}</p>
                  )}
                  {supportConfig.chatAide.enabled && supportConfig.chatAide.type === 'url' && (
                    <p><strong>Chat en ligne:</strong> <a href={supportConfig.chatAide.value} target="_blank" rel="noopener noreferrer" className="text-[#1E73BE] underline">{supportConfig.chatAide.value}</a></p>
                  )}
                  {!supportConfig.support.enabled && !supportConfig.chatAide.enabled && (
                    <p className="text-gray-500">Configuration de support non disponible. Configurez-le dans Configuration → Support et Aide</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Raccourcis Clavier */}
          {activeTab === 'raccourcis' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Raccourcis Clavier
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir le tableau de bord
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + D</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir l'Inventaire
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + I</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir les Commandes
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + C</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir les Organismes
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + O</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      5
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir le Transport
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + T</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      6
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir les Rapports
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + R</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      7
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir les Utilisateurs
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + U</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E73BE] text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                      8
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ouvrir la Configuration
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Keyboard className="w-4 h-4 inline-block mr-1" /> <strong>Ctrl + S</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  💡 Conseils Utiles
                </h3>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <p>✓ <strong>Étiquettes:</strong> Imprimez automatiquement les étiquettes après chaque entrée</p>
                  <p>✓ <strong>Codes-barres:</strong> Scannez les codes pour accéder rapidement aux produits</p>
                  <p>✓ <strong>Filtres:</strong> Utilisez les filtres par catégorie, date et statut pour trouver rapidement</p>
                  <p>✓ <strong>Multilingue:</strong> Changez la langue depuis le sélecteur dans le header</p>
                  <p>✓ <strong>Export:</strong> Tous les rapports peuvent être exportés en PDF ou Excel</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  📞 Besoin d'Aide?
                </h3>
                <div className="space-y-2 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {supportConfig.support.enabled && supportConfig.support.email && (
                    <p><strong>Email:</strong> {supportConfig.support.email}</p>
                  )}
                  {supportConfig.support.enabled && supportConfig.support.emailSecondaire && (
                    <p><strong>Email secondaire:</strong> {supportConfig.support.emailSecondaire}</p>
                  )}
                  {supportConfig.support.enabled && supportConfig.support.phone && (
                    <p><strong>Téléphone:</strong> {supportConfig.support.phone}</p>
                  )}
                  {supportConfig.chatAide.enabled && supportConfig.chatAide.type === 'email' && (
                    <p><strong>Chat d'aide:</strong> {supportConfig.chatAide.value}</p>
                  )}
                  {supportConfig.chatAide.enabled && supportConfig.chatAide.type === 'url' && (
                    <p><strong>Chat en ligne:</strong> <a href={supportConfig.chatAide.value} target="_blank" rel="noopener noreferrer" className="text-[#1E73BE] underline">{supportConfig.chatAide.value}</a></p>
                  )}
                  {!supportConfig.support.enabled && !supportConfig.chatAide.enabled && (
                    <p className="text-gray-500">Configuration de support non disponible. Configurez-le dans Configuration → Support et Aide</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}