import React, { useState } from 'react';
import { 
  X, 
  Home,
  Package,
  ClipboardList,
  Building2,
  Truck,
  FileBarChart,
  Users,
  ShoppingCart,
  MessageSquare,
  BookOpen,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  QrCode,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  Star,
  Award,
  Lightbulb,
  Target,
  Rocket,
  Zap,
  Globe,
  MapPin,
  Phone,
  Mail,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Smile,
  Pin,
  Warehouse,
  ChefHat,
  UserPlus,
  Gift,
  Tag,
  Presentation
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { generarPresentacionHTML } from '../utils/presentacionHTML';

interface GuideCompletModulesProps {
  onClose: () => void;
}

export function GuideCompletModules({ onClose }: GuideCompletModulesProps) {
  const [seccionActiva, setSeccionActiva] = useState<string>('inicio');

  // Función para abrir presentación en nueva ventana
  const abrirPresentacion = () => {
    try {
      const ventana = window.open('', '_blank', 'width=1400,height=900');
      
      if (!ventana) {
        toast.error('Veuillez autoriser les fenêtres contextuelles pour ouvrir la présentation');
        return;
      }

      // Generar y escribir el HTML
      const htmlContent = generarPresentacionHTML();
      ventana.document.write(htmlContent);
      ventana.document.close();
      
      toast.success('Présentation ouverte! Utilisez Ctrl+P ou le bouton pour imprimer en PDF', {
        duration: 4000
      });
      
    } catch (error) {
      console.error('Error al abrir presentación:', error);
      toast.error('Erreur lors de l\'ouverture de la présentation');
    }
  };

  const secciones = [
    { id: 'inicio', titulo: 'Vue d\'ensemble', icono: BookOpen },
    { id: 'diseno', titulo: 'Système de Design', icono: Sparkles },
    { id: 'dashboard', titulo: 'Tableau de bord', icono: LayoutDashboard },
    { id: 'entrepot', titulo: 'Entrepôt (Accordéon)', icono: Warehouse },
    { id: 'inventario', titulo: 'Inventaire', icono: Package },
    { id: 'comandas', titulo: 'Commandes', icono: ClipboardList },
    { id: 'organismos', titulo: 'Organismes', icono: Building2 },
    { id: 'ofertas', titulo: 'Offres Organismes', icono: Gift },
    { id: 'transporte', titulo: 'Transport', icono: Truck },
    { id: 'achats', titre: 'Achats', icono: ShoppingCart },
    { id: 'dechets', titre: 'Déchets & compostage', icono: Trash2 },
    { id: 'reportes', titre: 'Rapports', icono: FileBarChart },
    { id: 'cuisine', titre: 'Cuisine', icono: ChefHat },
    { id: 'liaison', titre: 'Liaison', icono: Mail },
    { id: 'usuarios', titre: 'Utilisateurs/Rôles', icono: Users },
    { id: 'recrutement', titre: 'Recrutement', icono: UserPlus },
    { id: 'comptoir', titre: 'Comptoir', icono: ShoppingCart },
    { id: 'messagerie', titre: 'Messagerie', icono: MessageSquare }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex">
        
        {/* Sidebar de navigation */}
        <div className="w-72 bg-gradient-to-b from-[#1a4d7a] to-blue-900 text-white p-6 overflow-y-auto">
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-4">
              <BookOpen className="w-12 h-12 mb-2" />
              <h3 className="font-bold text-lg">Guide Complet</h3>
              <p className="text-xs text-blue-100">Réseau solidaire</p>
              <p className="text-xs text-blue-200 mt-1">Tous les Modules</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {secciones.map((seccion) => {
              const Icon = seccion.icono;
              return (
                <button
                  key={seccion.id}
                  onClick={() => setSeccionActiva(seccion.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    seccionActiva === seccion.id
                      ? 'bg-white text-[#1a4d7a] shadow-lg scale-105'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{seccion.titulo || seccion.titre}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a4d7a] to-blue-700 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Guide Complet du Système
                </h2>
                <p className="text-blue-100 text-sm">Système de Gestion - Réseau solidaire</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={abrirPresentacion}
                className="bg-[#2d9561] hover:bg-[#26804f] text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
              >
                <Presentation className="w-5 h-5" />
                <span className="hidden sm:inline">Mode Présentation</span>
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            
            {/* VUE D'ENSEMBLE */}
            {seccionActiva === 'inicio' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#1a4d7a] to-blue-600 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Award className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Bienvenue dans le système de gestion
                      </h3>
                      <p className="text-blue-50 mb-4 text-lg">
                        Une solution complète et intégrée pour gérer efficacement tous les aspects 
                        de votre réseau alimentaire, de l'inventaire à la distribution.
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                          <Package className="w-6 h-6 mb-2" />
                          <p className="text-sm font-bold">Gestion Inventaire</p>
                          <p className="text-xs text-blue-100">Contrôle stock complet</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                          <Building2 className="w-6 h-6 mb-2" />
                          <p className="text-sm font-bold">Organismes</p>
                          <p className="text-xs text-blue-100">Gestion bénéficiaires</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                          <MessageSquare className="w-6 h-6 mb-2" />
                          <p className="text-sm font-bold">Communication</p>
                          <p className="text-xs text-blue-100">Messagerie interne</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#2d9561]" />
                    Modules du Système
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {secciones.slice(1).map((modulo) => {
                      const Icon = modulo.icono;
                      return (
                        <div 
                          key={modulo.id}
                          onClick={() => setSeccionActiva(modulo.id)}
                          className="flex gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-[#1a4d7a] hover:shadow-lg transition-all cursor-pointer group"
                        >
                          <div className="bg-[#1a4d7a] p-3 rounded-lg group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-[#1a4d7a]">{modulo.titulo || modulo.titre}</p>
                            <p className="text-sm text-gray-600">Cliquez pour en savoir plus</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-[#2d9561] rounded-xl p-6">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-[#2d9561]">
                    <Lightbulb className="w-6 h-6" />
                    Caractéristiques Générales
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-[#2d9561] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Multilingue</p>
                        <p className="text-sm text-gray-600">Français, Anglais, Espagnol, Arabe (RTL)</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-[#2d9561] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Design Moderne</p>
                        <p className="text-sm text-gray-600">Interface glassmorphism élégante</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-[#2d9561] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Temps Réel</p>
                        <p className="text-sm text-gray-600">Mises à jour instantanées</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-[#2d9561] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Sécurisé</p>
                        <p className="text-sm text-gray-600">Gestion avancée des rôles et permissions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-blue-600" />
                    Mises à Jour Récentes
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="font-bold text-blue-900">Inventaire</p>
                      <p className="mt-1 text-sm text-gray-700">
                        Ajout d'une action indépendante pour <strong>ajouter au stock existant</strong> et simplification du formulaire de saisie avec un bouton <strong>Annuler</strong> visible.
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="font-bold text-purple-900">Commandes</p>
                      <p className="mt-1 text-sm text-gray-700">
                        Le modèle de commande s'ouvre maintenant en <strong>vue compacte</strong> par défaut pour afficher les informations essentielles plus rapidement.
                      </p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <p className="font-bold text-teal-900">Rapports</p>
                      <p className="mt-1 text-sm text-gray-700">
                        L'onglet <strong>Opérations</strong> calcule correctement la <strong>valeur entrante</strong>, même lorsque les anciennes entrées n'avaient pas de montant stocké.
                      </p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <p className="font-bold text-pink-900">Liaison</p>
                      <p className="mt-1 text-sm text-gray-700">
                        Réactivation de l'envoi d'emails groupés avec filtres par <strong>jour de rendez-vous</strong> et <strong>classification</strong>, plus retour direct depuis la gestion des demandes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTÈME DE DESIGN */}
            {seccionActiva === 'diseno' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Système de Design Standardisé
                      </h3>
                      <p className="text-purple-50 text-lg">
                        Interface moderne, cohérente et professionnelle pour tous les modules!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    Composants Partagés
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Tous les modules utilisent désormais un ensemble de composants standardisés pour garantir une expérience utilisateur cohérente.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">ModuleContainer</h5>
                      <p className="text-sm text-gray-600">Conteneur principal avec fond dégradé et formes décoratives animées</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">ModuleHeader</h5>
                      <p className="text-sm text-gray-600">En-tête standardisé avec icône, titre, description et actions</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">StatCard</h5>
                      <p className="text-sm text-gray-600">Cartes de statistiques avec effet glassmorphism</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">ModuleSection</h5>
                      <p className="text-sm text-gray-600">Sections de contenu organisées et élégantes</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">ModuleTable</h5>
                      <p className="text-sm text-gray-600">Tables avec effets hover et design professionnel</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">ModuleCardList</h5>
                      <p className="text-sm text-gray-600">Listes de cartes avec grille responsive</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-pink-600" />
                    Effets Visuels Modernes
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <h5 className="font-bold text-blue-900 mb-2">✨ Glassmorphism</h5>
                      <p className="text-sm text-blue-800">
                        Effet de verre avec transparence et flou pour une interface moderne et élégante
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h5 className="font-bold text-purple-900 mb-2">🎨 Gradients Sophistiqués</h5>
                      <p className="text-sm text-purple-800">
                        Dégradés subtils pour boutons, en-têtes et éléments mis en évidence
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-600">
                      <h5 className="font-bold text-green-900 mb-2">💫 Animations Fluides</h5>
                      <p className="text-sm text-green-800">
                        Entrées avec slideInUp, fadeInScale et effets hover élégants
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border-l-4 border-orange-600">
                      <h5 className="font-bold text-orange-900 mb-2">🌈 Ombres Professionnelles</h5>
                      <p className="text-sm text-orange-800">
                        Système d'ombres à plusieurs niveaux (sm, md, lg, xl) pour donner de la profondeur
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#2d9561]" />
                    Palette de Couleurs
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-full h-24 rounded-lg mb-2" style={{ backgroundColor: '#1a4d7a' }}></div>
                      <p className="font-medium text-sm">Primaire</p>
                      <p className="text-xs text-gray-600">#1a4d7a</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-24 rounded-lg mb-2" style={{ backgroundColor: '#2d9561' }}></div>
                      <p className="font-medium text-sm">Secondaire</p>
                      <p className="text-xs text-gray-600">#2d9561</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-24 rounded-lg mb-2" style={{ backgroundColor: '#c23934' }}></div>
                      <p className="font-medium text-sm">Destructif</p>
                      <p className="text-xs text-gray-600">#c23934</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-24 rounded-lg mb-2" style={{ backgroundColor: '#e8a419' }}></div>
                      <p className="font-medium text-sm">Avertissement</p>
                      <p className="text-xs text-gray-600">#e8a419</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6" />
                    Avantages du Système de Design
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Cohérence Visuelle</p>
                        <p className="text-sm text-gray-600">Même apparence et comportement dans tous les modules</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Développement Rapide</p>
                        <p className="text-sm text-gray-600">Composants réutilisables pour créer de nouvelles fonctionnalités</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Maintenance Facilitée</p>
                        <p className="text-sm text-gray-600">Modifications centralisées dans les composants partagés</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Expérience Utilisateur</p>
                        <p className="text-sm text-gray-600">Interface moderne et intuitive qui améliore la productivité</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5">
                  <div className="flex gap-3">
                    <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-yellow-900 mb-2">Documentation Complète</h4>
                      <p className="text-sm text-yellow-800 mb-2">
                        Consultez les fichiers de documentation dans <code className="bg-yellow-100 px-2 py-1 rounded">/src/app/components/shared/</code>:
                      </p>
                      <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                        <li>• <strong>DesignStandards.md</strong> - Guide complet des standards</li>
                        <li>• <strong>README.md</strong> - Référence rapide pour développeurs</li>
                        <li>• <strong>ModuleTemplate.tsx</strong> - Exemple fonctionnel complet</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABLEAU DE BORD */}
            {seccionActiva === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <LayoutDashboard className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Tableau de bord</h3>
                      <p className="text-blue-50 text-lg">
                        Vue d'ensemble complète de toutes les activités du réseau alimentaire.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    Indicateurs Clés (KPIs)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-600 p-3 rounded-lg">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Stock Total</p>
                          <p className="text-2xl font-bold text-blue-900">12,450 kg</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Quantité totale de produits en stock</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#2d9561] p-3 rounded-lg">
                          <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Commandes Actives</p>
                          <p className="text-2xl font-bold text-green-900">24</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Commandes en cours de traitement</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-orange-600 p-3 rounded-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Organismes</p>
                          <p className="text-2xl font-bold text-orange-900">87</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Organismes partenaires actifs</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-600 p-3 rounded-lg">
                          <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Livraisons Aujourd'hui</p>
                          <p className="text-2xl font-bold text-purple-900">8</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Transports programmés pour aujourd'hui</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Fonctionnalités
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Graphiques en Temps Réel</p>
                        <p className="text-sm text-gray-600">Visualisations dynamiques des stocks, commandes et distributions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Alertes Automatiques</p>
                        <p className="text-sm text-gray-600">Notifications pour produits expirés, stock faible, commandes urgentes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Eye className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Accès Rapide</p>
                        <p className="text-sm text-gray-600">Navigation directe vers tous les modules depuis le tableau de bord</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INVENTAIRE */}
            {seccionActiva === 'inventario' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Package className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Inventaire</h3>
                      <p className="text-green-50 text-lg">
                        Gestion complète et en temps réel de tous vos stocks de produits alimentaires.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-green-600" />
                    Fonctionnalités Principales
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <QrCode className="w-6 h-6 text-green-600" />
                        <h5 className="font-bold">Scanner QR</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Ajoutez rapidement des produits en scannant leur code QR ou code-barres
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Search className="w-6 h-6 text-green-600" />
                        <h5 className="font-bold">Recherche Avancée</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Filtrez par catégorie, statut, dates d'expiration, fournisseur
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        <h5 className="font-bold">Alertes Expiration</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Notifications automatiques pour produits proches de l'expiration
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <h5 className="font-bold">Statistiques</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Analyses détaillées des entrées, sorties et rotations de stock
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    Actions Disponibles
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Plus className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Ajouter un Produit</p>
                        <p className="text-sm text-gray-600">Enregistrez de nouveaux produits manuellement ou par scanner</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Edit className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Modifier</p>
                        <p className="text-sm text-gray-600">Mettez à jour les quantités, dates et informations produit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Download className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Exporter</p>
                        <p className="text-sm text-gray-600">Téléchargez des rapports Excel ou PDF de votre inventaire</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Upload className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Importer</p>
                        <p className="text-sm text-gray-600">Chargez des produits en masse via fichier Excel</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-6">
                  <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Plus className="w-6 h-6" />
                    Nouveautés de Saisie
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="bg-white p-4 rounded-lg border border-emerald-200">
                      <p className="font-bold mb-2">Ajouter au stock existant</p>
                      <p>
                        Un bouton dédié permet d'augmenter rapidement la quantité d'un produit déjà présent sans passer par le formulaire complet de nouvelle entrée.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-emerald-200">
                      <p className="font-bold mb-2">Formulaire de nouvelle entrée clarifié</p>
                      <p>
                        Le formulaire principal conserve le flux standard, avec un <strong>cockpit produit</strong>, un calcul de poids automatique et un bouton <strong>Annuler</strong> directement visible pendant la saisie.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Conseils d'Utilisation
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /> 
                      Vérifiez régulièrement la section "Produits à expirer" pour éviter le gaspillage
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /> 
                      Utilisez les filtres pour trouver rapidement des produits spécifiques
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /> 
                      Exportez l'inventaire en fin de mois pour archivage
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /> 
                      Le système calcule automatiquement la valeur totale en CAD$
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* COMMANDES */}
            {seccionActiva === 'comandas' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <ClipboardList className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Commandes</h3>
                      <p className="text-purple-50 text-lg">
                        Système complet de gestion des commandes des organismes bénéficiaires.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-purple-600" />
                    Flux de Travail
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="font-bold mb-2">Création de la Commande</p>
                        <p className="text-sm text-gray-600">
                          Les organismes créent leurs commandes via le portail public ou l'administrateur les crée
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Statut: En attente</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="font-bold mb-2">Validation</p>
                        <p className="text-sm text-gray-600">
                          L'équipe vérifie la disponibilité des produits et valide ou rejette
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Statut: Validée</span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">ou Refusée</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="font-bold mb-2">Préparation</p>
                        <p className="text-sm text-gray-600">
                          Les produits sont préparés pour l'expédition ou le retrait
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Statut: En préparation</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                      <div className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="font-bold mb-2">Livraison/Retrait</p>
                        <p className="text-sm text-gray-600">
                          Expédition via le module Transport ou retrait sur place
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Statut: En transit</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                      <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="font-bold mb-2">Complétée</p>
                        <p className="text-sm text-gray-600">
                          Commande acceptée par l'organisme et prête pour la suite du flux
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Statut: Livrée</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-600" />
                    Fonctionnalités Clés
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <QrCode className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Scanner Produits</p>
                        <p className="text-sm text-gray-600">Ajoutez rapidement des produits via QR</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <Filter className="w-6 h-6 text-purple-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Filtres Avancés</p>
                        <p className="text-sm text-gray-600">Par statut, organisme, date, priorité</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Bon de Livraison</p>
                        <p className="text-sm text-gray-600">Génération automatique PDF</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Suivi en Temps Réel</p>
                        <p className="text-sm text-gray-600">Mises à jour instantanées du statut</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-6">
                  <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <Eye className="w-6 h-6" />
                    Mise à Jour de la Vue Commande
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Le modèle de commande s'ouvre désormais en <strong>vue compacte</strong> par défaut afin d'afficher immédiatement les informations essentielles sans surcharge visuelle.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-indigo-200 text-sm text-gray-700">
                    <p className="font-medium">Idéal pour:</p>
                    <p className="mt-1">consulter rapidement l'organisme, les produits, les quantités, les notes et le statut sans devoir basculer manuellement vers un affichage plus dense.</p>
                    <p className="mt-2">Dans le bloc <strong>Reçu par</strong>, la <strong>date</strong> et l'<strong>heure</strong> se complètent automatiquement à partir du rendez-vous de l'organisme.</p>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Système d'Offres
                  </h4>
                  <p className="text-gray-700 mb-4">
                    La banque peut publier des offres spéciales de produits disponibles. Les organismes 
                    voient ces offres dans leur portail et peuvent les réserver directement!
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-green-300">
                    <p className="text-sm text-gray-600">
                      <strong>Exemple:</strong> "50 kg de pommes disponibles - Réservation jusqu'au 28 février 2026"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ORGANISMES */}
            {seccionActiva === 'organismos' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Building2 className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Organismes</h3>
                      <p className="text-orange-50 text-lg">
                        Référentiel complet des organismes avec profils détaillés, accès portail, documents et lecture compacte des fiches.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-orange-600" />
                    Informations Gérées
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-orange-600" />
                        <h5 className="font-bold">Données Générales</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Nom de l'organisme</li>
                        <li>• Type d'organisme</li>
                        <li>• Statut (Actif/Inactif)</li>
                        <li>• Classification, quartier et langue</li>
                        <li>• Clé d'accès et lien direct de portail</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <h5 className="font-bold">Coordonnées</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Adresse complète</li>
                        <li>• Téléphone</li>
                        <li>• Email</li>
                        <li>• Personne de contact</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h5 className="font-bold">Bénéficiaires</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Nombre de familles</li>
                        <li>• Nombre de personnes</li>
                        <li>• Nombre d'enfants</li>
                        <li>• Capacité d'accueil</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h5 className="font-bold">Documentation</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Documents PDF associés à la fiche</li>
                        <li>• Notes internes et contacts de notification</li>
                        <li>• Vue complète en lecture seule</li>
                        <li>• Historique et accès portail partagé</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-blue-900">
                    <Globe className="w-6 h-6" />
                    Portail Organisme & fiche complète
                  </h4>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Chaque organisme dispose d'une <strong>clé d'accès unique</strong> affichée directement dans les vues <strong>Voir le profil</strong> et <strong>Modifier le profil</strong>.
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg border-2 border-blue-300">
                      <p className="font-bold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Ce que la fiche organisme permet maintenant
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-3">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                          <p>Consulter toute la fiche dans une <strong>vue complète</strong> avec défilement global et en-tête fixe.</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                          <p>Copier la clé d'accès ou le <strong>lien direct du portail</strong> sans reconstruire l'URL manuellement.</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                          <p>Réinitialiser la clé d'accès quand un partage doit être invalidé ou renouvelé.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-300">
                      <p className="font-bold mb-2 text-green-900">Fonctionnalités du Portail:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          Créer et suivre des commandes
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          Consulter les offres disponibles
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          Voir l'historique complet
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          Accéder via une clé partagée individuellement par l'équipe interne
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSPORT */}
            {seccionActiva === 'transporte' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Truck className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Transport</h3>
                      <p className="text-indigo-50 text-lg">
                        Organisation et suivi des livraisons vers les organismes bénéficiaires.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-indigo-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    Planification des Livraisons
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
                      <h5 className="font-bold mb-3 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-indigo-600" />
                        Créer une Livraison
                      </h5>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Sélectionnez la commande à livrer</p>
                        <p>• Assignez un véhicule et un chauffeur</p>
                        <p>• Définissez la date et l'heure</p>
                        <p>• Ajoutez des notes spéciales si nécessaire</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="font-bold">Programmée</p>
                        <p className="text-xs text-gray-600">En attente de départ</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                        <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <p className="font-bold">En Transit</p>
                        <p className="text-xs text-gray-600">En cours de livraison</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-bold">Livrée</p>
                        <p className="text-xs text-gray-600">Acceptée puis livrée</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-purple-600" />
                    Gestion de la Flotte
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold mb-2 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-purple-600" />
                        Véhicules
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Enregistrer les véhicules</li>
                        <li>• Capacité de charge</li>
                        <li>• État et entretien</li>
                        <li>• Disponibilité</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold mb-2 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Chauffeurs
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Liste des conducteurs</li>
                        <li>• Permis et certifications</li>
                        <li>• Horaires de disponibilité</li>
                        <li>• Historique de livraisons</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Optimisation des Trajets
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Le système peut suggérer des itinéraires optimisés pour réduire le temps et les coûts:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      Regroupement de livraisons dans la même zone
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      Calcul des distances et temps estimés
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      Alertes de retard automatiques
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ACHATS */}
            {seccionActiva === 'achats' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <ShoppingCart className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Achats</h3>
                      <p className="text-violet-50 text-lg">
                        Pilotage des bons d'achat, des fournisseurs, des programmes budgétaires et des circuits d'autorisation internes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-violet-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-violet-600" />
                    Parcours Principal
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div className="flex-1 bg-violet-50 p-4 rounded-lg border border-violet-200">
                        <p className="font-bold mb-2">Tableau de bord achats</p>
                        <p className="text-sm text-gray-700">Visualisez le volume engagé, les demandes en validation, les bons approuvés et les réceptions finalisées.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div className="flex-1 bg-violet-50 p-4 rounded-lg border border-violet-200">
                        <p className="font-bold mb-2">Création d'un bon d'achat</p>
                        <p className="text-sm text-gray-700">Rattachez un fournisseur, un programme d'achat, un montant, une date de livraison souhaitée et préparez la demande avant soumission.</p>
                        <p className="text-sm text-gray-700 mt-2">Les lignes permettent la <strong>saisie manuelle directe de la quantité</strong> (sans boutons +/-) avec des <strong>valeurs entières</strong> uniquement.</p>
                        <p className="text-sm text-gray-700 mt-2">Chaque colonne est décrite pour plus de clarté: <strong>Produit</strong> (article), <strong>Quantité</strong> (nombre entier), <strong>Unité</strong> (mesure) et <strong>Prix</strong> (coût unitaire).</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div className="flex-1 bg-violet-50 p-4 rounded-lg border border-violet-200">
                        <p className="font-bold mb-2">Validation interne</p>
                        <p className="text-sm text-gray-700">Les bons passent par une file d'autorisation. Les montants importants peuvent exiger une double validation selon les règles configurées.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                      <div className="flex-1 bg-violet-50 p-4 rounded-lg border border-violet-200">
                        <p className="font-bold mb-2">Emission et réception</p>
                        <p className="text-sm text-gray-700">Après approbation, le bon peut être marqué commandé, reçu ou annulé, avec historique des décisions et export PDF.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-violet-200">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-violet-600" />
                      Base fournisseurs
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Référence centralisée des fournisseurs actifs</li>
                      <li>• Coordonnées, catégories de produits et contacts principaux</li>
                      <li>• Réutilisation directe lors de la création des bons</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md border border-violet-200">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-violet-600" />
                      Programmes et autorisations
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Programmes d'achat avec responsable et budget annuel</li>
                      <li>• Suivi de consommation et restant budgétaire</li>
                      <li>• Règles d'autorisation par seuil financier et rôle responsable</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-violet-50 border-l-4 border-violet-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-violet-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Conseils d'Usage
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" /> Associez chaque bon à un programme pour suivre le budget réel.</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" /> Utilisez la prévisualisation et l'export PDF avant émission au fournisseur.</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" /> Vérifiez régulièrement la file d'autorisation pour éviter les blocages opérationnels.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* DÉCHETS & COMPOSTAGE */}
            {seccionActiva === 'dechets' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-600 to-lime-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Trash2 className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Déchets & compostage</h3>
                      <p className="text-emerald-50 text-lg">
                        Suivi opérationnel des déchets et compostages de l'entrepôt avec enregistrement en kilogrammes, gestion des catégories et rapports par période.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-emerald-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-emerald-600" />
                    Organisation du Module
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <p className="font-bold mb-2">Gestion par kg</p>
                      <p className="text-sm text-gray-700">Saisissez la date, le type, la catégorie, le poids et les notes pour chaque registre, avec édition, duplication et suppression.</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <p className="font-bold mb-2">Rapport par dates</p>
                      <p className="text-sm text-gray-700">Analysez une période avec dates de début et de fin, catégories dominantes, volume total et détail exportable.</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-md border border-emerald-200">
                    <p className="text-sm font-semibold text-slate-900">Types personnalisables</p>
                    <p className="mt-2 text-sm text-gray-700">Les types comme déchet, compostage ou recyclage peuvent être configurés avec leur propre couleur.</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-md border border-emerald-200">
                    <p className="text-sm font-semibold text-slate-900">Catégories suivies</p>
                    <p className="mt-2 text-sm text-gray-700">Les catégories sont gérées séparément pour normaliser les enregistrements et faciliter la lecture des volumes.</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-md border border-emerald-200">
                    <p className="text-sm font-semibold text-slate-900">Exports opérationnels</p>
                    <p className="mt-2 text-sm text-gray-700">Le rapport de période peut être exporté en Excel ou PDF pour le suivi interne et les bilans mensuels.</p>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Indicateurs Disponibles
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Volume total enregistré sur l'ensemble du module</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Répartition par type avec cartes de synthèse</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Top catégories sur la période analysée</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Recherche textuelle dans les registres et dans les rapports</li>
                  </ul>
                </div>
              </div>
            )}

            {/* RAPPORTS */}
            {seccionActiva === 'reportes' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <FileBarChart className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Rapports</h3>
                      <p className="text-teal-50 text-lg">
                        Analyses détaillées et statistiques complètes de toutes les activités.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-teal-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <PieChart className="w-6 h-6 text-teal-600" />
                    Types de Rapports
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="w-8 h-8 text-blue-600" />
                        <h5 className="font-bold text-lg">Rapport Inventaire</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Stock actuel par catégorie</li>
                        <li>• Produits expirés/à expirer</li>
                        <li>• Valeur totale en CAD$</li>
                        <li>• Entrées et sorties mensuelles</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <ClipboardList className="w-8 h-8 text-purple-600" />
                        <h5 className="font-bold text-lg">Rapport Commandes</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Commandes par période</li>
                        <li>• Taux de validation/refus</li>
                        <li>• Délais de traitement</li>
                        <li>• Top organismes demandeurs</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="w-8 h-8 text-orange-600" />
                        <h5 className="font-bold text-lg">Rapport Organismes</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Organismes actifs/inactifs</li>
                        <li>• Distribution par type</li>
                        <li>• Bénéficiaires totaux</li>
                        <li>• Historique de participations</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border-2 border-indigo-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Truck className="w-8 h-8 text-indigo-600" />
                        <h5 className="font-bold text-lg">Rapport Transport</h5>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Livraisons effectuées</li>
                        <li>• Kilomètres parcourus</li>
                        <li>• Coûts de transport</li>
                        <li>• Performance des chauffeurs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    Visualisations Graphiques
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                      <PieChart className="w-10 h-10 text-green-600 mx-auto mb-2" />
                      <p className="font-bold">Graphiques Circulaires</p>
                      <p className="text-xs text-gray-600">Distribution par catégories</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                      <BarChart3 className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                      <p className="font-bold">Graphiques à Barres</p>
                      <p className="text-xs text-gray-600">Comparaisons temporelles</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                      <Activity className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                      <p className="font-bold">Courbes d'Évolution</p>
                      <p className="text-xs text-gray-600">Tendances dans le temps</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-xl p-6">
                  <h4 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    Fiabilité de l'Onglet Opérations
                  </h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      La <strong>valeur entrante</strong> est maintenant recalculée de manière robuste, même si certaines entrées historiques ne contiennent pas directement de valeur unitaire ou totale.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-teal-200">
                      <p className="font-medium mb-2">Ordre de calcul appliqué:</p>
                      <ul className="space-y-1">
                        <li>• valeur totale enregistrée sur l'entrée</li>
                        <li>• valeur unitaire × quantité</li>
                        <li>• repli sur la valeur monétaire du produit associé</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Download className="w-6 h-6" />
                    Exportation
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Tous les rapports peuvent être exportés dans les formats suivants:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border-2 border-green-300 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="font-medium">PDF</span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border-2 border-green-300 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Excel (.xlsx)</span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border-2 border-green-300 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="font-medium">CSV</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UTILISATEURS / RÔLES */}
            {seccionActiva === 'usuarios' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-rose-600 to-pink-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Users className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Utilisateurs et Rôles</h3>
                      <p className="text-rose-50 text-lg">
                        Gestion des utilisateurs, permissions et sécurité du système.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-rose-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-rose-600" />
                    Rôles et Permissions
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-5 rounded-xl border-2 border-red-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-red-600 text-white p-2 rounded-lg">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">Administrateur</h5>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Accès Total</span>
                        </div>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✅ Accès à tous les modules</li>
                        <li>✅ Gestion des utilisateurs</li>
                        <li>✅ Configuration système</li>
                        <li>✅ Suppression de données</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-600 text-white p-2 rounded-lg">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">Gestionnaire</h5>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Gestion Quotidienne</span>
                        </div>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✅ Gestion inventaire</li>
                        <li>✅ Validation commandes</li>
                        <li>✅ Gestion organismes</li>
                        <li>❌ Suppression système</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-5 rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-600 text-white p-2 rounded-lg">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">Bénévole</h5>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Lecture & Saisie</span>
                        </div>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✅ Ajout produits inventaire</li>
                        <li>✅ Consultation commandes</li>
                        <li>❌ Validation/Refus</li>
                        <li>❌ Gestion utilisateurs</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-5 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-600 text-white p-2 rounded-lg">
                          <Eye className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">Consultant</h5>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Lecture Seule</span>
                        </div>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✅ Consultation tous modules</li>
                        <li>✅ Génération rapports</li>
                        <li>❌ Modification données</li>
                        <li>❌ Création/Suppression</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Gestion des Utilisateurs
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Plus className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Créer Utilisateur</p>
                        <p className="text-sm text-gray-600">Nom, email, rôle, mot de passe</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Edit className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Modifier Informations</p>
                        <p className="text-sm text-gray-600">Changer rôle, email, activer/désactiver</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Réinitialiser Mot de Passe</p>
                        <p className="text-sm text-gray-600">Envoi d'un lien de réinitialisation sécurisé</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Sécurité
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      Authentification sécurisée requise
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      Journaux d'audit de toutes les actions
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      Expiration automatique des sessions
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      Utilisateur développeur: David (Lettycia26) - Accès complet
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* COMPTOIR */}
            {seccionActiva === 'comptoir' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <ShoppingCart className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Comptoir</h3>
                      <p className="text-emerald-50 text-lg">
                        Point de vente et distribution directe aux bénéficiaires individuels.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-emerald-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-emerald-600" />
                    Fonctionnement
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Le Comptoir permet de gérer les distributions en face à face avec les bénéficiaires 
                    qui viennent chercher des produits directement au point de distribution.
                  </p>
                  <div className="bg-emerald-50 p-5 rounded-lg border-2 border-emerald-200">
                    <h5 className="font-bold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-600" />
                      Processus de Distribution
                    </h5>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</span>
                        <div>
                          <p className="font-medium">Enregistrement Bénéficiaire</p>
                          <p className="text-sm text-gray-600">Vérification identité et éligibilité</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</span>
                        <div>
                          <p className="font-medium">Sélection Produits</p>
                          <p className="text-sm text-gray-600">Scanner QR ou sélection manuelle</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</span>
                        <div>
                          <p className="font-medium">Validation</p>
                          <p className="text-sm text-gray-600">Vérification des quantités et limites</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</span>
                        <div>
                          <p className="font-medium">Distribution</p>
                          <p className="text-sm text-gray-600">Remise des produits et reçu</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-600" />
                    Fonctionnalités
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <QrCode className="w-5 h-5 text-blue-600" />
                        <h5 className="font-bold">Scanner Rapide</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Lecture de codes QR pour ajouter rapidement des produits
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <h5 className="font-bold">Fichiers Bénéficiaires</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Base de données des personnes aidées avec historique
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <h5 className="font-bold">Limites & Quotas</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Configuration des limites par bénéficiaire et période
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-orange-600" />
                        <h5 className="font-bold">Reçus Automatiques</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Génération de reçus PDF pour chaque distribution
                      </p>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        <h5 className="font-bold">Événements Spéciaux</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Création d’événements ponctuels avec date de commencement et de fin, liaison directe des bénéficiaires, filtres par événement et export de rapports ciblés.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
                  <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-blue-900">
                    <Activity className="w-6 h-6" />
                    Statistiques en Temps Réel
                  </h4>
                  <p className="text-gray-700 mb-3">Le module affiche en direct:</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-blue-600">124</p>
                      <p className="text-sm text-gray-600">Bénéficiaires aujourd'hui</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-green-600">856 kg</p>
                      <p className="text-sm text-gray-600">Distribués aujourd'hui</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-purple-600">CAD$ 3,245</p>
                      <p className="text-sm text-gray-600">Valeur distribuée</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-emerald-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-emerald-900">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    Gestion des événements spéciaux
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>Le menu Comptoir inclut désormais une vue <strong>Événements spéciaux</strong> pour planifier des distributions saisonnières, journées thématiques ou activités ciblées, avec <strong>période de début et de fin</strong>.</p>
                    <p>Dans <strong>Aide alimentaire</strong>, le formulaire de demande permet aussi de définir un <strong>intervalle de rendez-vous (minutes)</strong>, une <strong>capacité de personnes par horaire</strong> et d'afficher la <strong>disponibilité restante pour chaque horaire</strong> au moment de la sélection, puis redirige automatiquement vers la <strong>vue principale des événements</strong> si l'action vient d'un flux événementiel, sinon vers la <strong>page principale du module Comptoir</strong>.</p>
                    <p>Dans la vue <strong>Rendez-vous</strong>, les demandes d'aide approuvées peuvent maintenant être marquées comme <strong>complétées</strong> ou <strong>livrées</strong> dès que le bénéficiaire se présente à son créneau, et les rendez-vous peuvent aussi être marqués <strong>absent</strong> en cas de non-présentation. Ces états sont repris automatiquement dans la <strong>liste des demandes approuvées</strong> du module et sont disponibles dans le <strong>filtre de statut</strong> (planifié, complété, livré, absent).</p>
                    <p>La vue <strong>Demandes d'aide</strong> propose aussi un bouton <strong>Imprimer la liste</strong> pour imprimer la liste actuellement filtrée avec bénéficiaire, type d'aide, quantité, rendez-vous et statut.</p>
                    <p>La section <strong>Programmation des réservations</strong> de la page principale du module inclut désormais aussi le champ <strong>Personnes par horaire</strong> pour centraliser cette logique.</p>
                    <p>Les changements de programmation (heure de début/fin, intervalle et personnes par horaire) sont automatiquement appliqués aux <strong>formulaires de création de demandes</strong> et au <strong>formulaire de création de rendez-vous des bénéficiaires</strong>.</p>
                    <p>La vue <strong>Rapports</strong> du Comptoir propose maintenant deux rapports distincts: <strong>Aides régulières</strong> et <strong>Événements spéciaux</strong>, avec filtres et exports séparés, dont un <strong>filtre par type d'événement</strong> dans le rapport des événements spéciaux.</p>
                    <p>Chaque événement peut recevoir une <strong>liste d’inscriptions de bénéficiaires</strong>, avec <strong>statut défini dès l’inscription</strong>, <strong>type d'aide associé</strong>, <strong>jour et heure de cita par inscription</strong>, une <strong>capacité configurable par horaire</strong> et une <strong>sélection du jour limitée aux dates programmées de l'événement</strong>, suivi de présence et consultation rapide du profil du bénéficiaire.</p>
                    <p>Les inscriptions restent <strong>filtrables par événement, statut et type d'aide</strong>, avec <strong>édition directe du type d'aide et du statut</strong> dans la table, une <strong>option explicite de modification d'inscription</strong> (statut, type d'aide, date et heure de cita), un <strong>bouton d'inscription actif tant que l’objectif de distribution n'est pas atteint</strong> même si aucun bénéficiaire n'est encore disponible dans la liste, un <strong>résumé des quantités par type d'aide dans l'en-tête des inscriptions</strong>, une <strong>prévention des doublons d'inscription</strong> (1 bénéficiaire par événement), un <strong>contrôle d’objectif au moment de l'enregistrement basé sur les paniers assignés</strong> et des <strong>créneaux automatiquement masqués lorsqu'ils sont complets selon la capacité par horaire</strong>, dans une <strong>présentation empilée</strong> affichant désormais les <strong>événements au-dessus</strong> puis les <strong>inscriptions en dessous</strong>, avec <strong>métriques supérieures compactées</strong>, <strong>barre de filtres compactée</strong>, <strong>menu unique pour les exportations</strong>, <strong>en-tête d'inscriptions allégé</strong>, <strong>métadonnées d'événement condensées en badges</strong> et <strong>lignes d'inscription resserrées dans une zone plus haute</strong> pour une lecture plus complète à l'écran, tout en permettant de générer un <strong>rapport PDF ou Excel par événement</strong> avec résumé, <strong>répartition par type d'aide</strong> et liste détaillée.</p>
                    <p>Une <strong>feuille de présence imprimable</strong> peut être lancée depuis l’événement sélectionné, avec colonnes présence et signature pour le jour de l’activité.</p>
                    <p>La <strong>fiche du bénéficiaire</strong> affiche aussi l’historique de ses participations aux événements spéciaux, les ajoute à sa timeline d’activité et permet désormais de <strong>créer directement une inscription à un événement</strong> depuis le profil (événement, statut, type d'aide, date et heure de cita), tandis que le bouton <strong>Ajouter une aide</strong> du bloc historique est actif, ouvre la vue d'aide alimentaire et <strong>pré-sélectionne automatiquement le bénéficiaire du profil</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGERIE */}
            {seccionActiva === 'messagerie' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Messagerie Interne</h3>
                      <p className="text-blue-50 text-lg">
                        Communication professionnelle entre tous les départements du réseau.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-blue-600" />
                    Fonctionnalités Principales
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <h5 className="font-bold">Messages Individuels</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Envoyez des messages privés à un département spécifique
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <h5 className="font-bold">Messages Groupes</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Communiquez avec plusieurs départements simultanément
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        <h5 className="font-bold">Messages Importants</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Marquez les messages prioritaires avec une étoile
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h5 className="font-bold">Demandes avec Suivi</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Créez des demandes formelles avec statut et priorité
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2 text-purple-900">
                    <Sparkles className="w-6 h-6" />
                    Fonctions Avancées
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-600 text-white p-2 rounded-lg">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h5 className="font-bold">Correction Automatique</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        L'IA vérifie et corrige l'orthographe en temps réel pendant que vous écrivez
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-pink-600 text-white p-2 rounded-lg">
                          <Smile className="w-5 h-5" />
                        </div>
                        <h5 className="font-bold">Réactions Émotionnelles</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Réagissez aux messages avec des emojis: 👍 ❤️ 😂 ⭐ ⚡ ✅ 🎉 🔥
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-600 text-white p-2 rounded-lg">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <h5 className="font-bold">Sondages Intégrés</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Créez des sondages pour recueillir l'opinion de l'équipe
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-600 text-white p-2 rounded-lg">
                          <Pin className="w-5 h-5" />
                        </div>
                        <h5 className="font-bold">Épingler Messages</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Gardez les messages importants toujours visibles en haut
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Statistiques
                  </h4>
                  <p className="text-gray-700 mb-3">
                    Chaque département peut consulter ses propres statistiques:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      Messages envoyés/reçus par période
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      Taux de réponse et temps moyen
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      Demandes en attente, validées, refusées
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      Graphiques d'activité
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Conseil Pro
                  </h4>
                  <p className="text-sm text-gray-700">
                    Utilisez le <strong>bouton flotant orange</strong> en bas à droite pour envoyer rapidement 
                    un message groupe à plusieurs départements, ou le <strong>bouton vert</strong> pour demander 
                    un bénévole au département RH!
                  </p>
                </div>
              </div>
            )}

            {/* ENTREPÔT (ACCORDÉON) */}
            {seccionActiva === 'entrepot' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Warehouse className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Entrepôt (Menu Accordéon)</h3>
                      <p className="text-blue-50 text-lg">
                        Hub central regroupant l'ensemble des accès opérationnels: inventaire, commandes, organismes, rapports, PRS, partenaires et annuaire Entrepôt.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-600" />
                    Modules Intégrés
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">📦 Inventaire</h5>
                      <p className="text-sm text-gray-700">
                        Gestion complète des stocks, produits, catégories, températures de conservation, entrées/sorties et alertes de stock.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">🏷️ Étiquettes</h5>
                      <p className="text-sm text-gray-700">
                        Génération et impression d'étiquettes de produits avec codes-barres, QR codes et dates d'expiration.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">🛒 Commandes</h5>
                      <p className="text-sm text-gray-700">
                        Gestion des commandes organismes avec suivi des statuts, préparation, livraison et lecture compacte de la commande.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        La création de distribution affiche maintenant un <strong>encadré de prévisualisation</strong> plus professionnel avant validation, avec l'organisme, les totaux et un aperçu des lignes.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Cette prévisualisation inclut aussi un <strong>sello visuel</strong> en monogramme pour renforcer l'aspect document officiel.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Pour les distributions de groupe, un <strong>graphique de répartition</strong> en barres affiche visuellement les pourcentages de chaque organisme avant la création.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Lors du clic sur <strong>« Créer les commandes »</strong>, une <strong>animation professionnelle</strong> s'affiche : barre de progression globale, étapes (Validation → Génération → Notification) et remplissage progressif par organisme avec ses couleurs et son pourcentage, pour un rendu visuel clair pendant la création.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Cette même simulation visuelle apparaît aussi pour les distributions <strong>individuelles</strong>, les distributions <strong>Collation</strong> et la publication d'une <strong>offre</strong>, garantissant une expérience homogène sur toutes les créations.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        L'ensemble de l'application adopte désormais un <strong>langage visuel unifié</strong> : fond clair avec dégradés subtils aux couleurs de la marque, boutons avec relief léger au survol, cartes aux coins arrondis, dialogues avec liseré supérieur bleu → vert → ambre, focus ring bleu, tables avec en-têtes typographiés et lignes surlignées au survol, menus et champs harmonisés.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Une couche <strong>ultra premium</strong> vient d'être appliquée à toute la plateforme : barre supérieure et sidebar avec liseré tricolore, cartes avec ombres multi-couches et halo au survol, boutons primaires avec léger dégradé, champs de saisie avec double focus ring, tableaux avec en-tête sticky et surlignage latéral, barres de progression aux couleurs de la marque, toasts avec hairline coloré selon leur type (succès, avertissement, erreur), popovers et menus avec liseré discret, transitions fluides à chaque changement de page.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Une nouvelle <strong>identité visuelle « monogramme DMi »</strong> est désormais active partout dans l'application : hexagone bleu institutionnel avec les lettres « DM » blanches, point du « i » en accent vert-doré et fine barre solidaire en base. Le logo est vectoriel (SVG) donc net à toute taille, du favicon aux impressions. Vous pouvez toujours importer votre propre logo depuis <strong>« Aide et Support &gt; Personnalisation »</strong> — le bouton « Rétablir » vous ramène au monogramme officiel.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Le <strong>nom d'affichage par défaut</strong> de la plateforme est désormais <strong>« DM inventaire »</strong> — cohérent avec le monogramme DMi. Il apparaît partout où le nom du système est utilisé (onglet du navigateur, PWA, impressions, PDF, en-têtes d'étiquettes, rapports PRS). Vous pouvez toujours le personnaliser depuis <strong>« Aide et Support &gt; Personnalisation »</strong> pour l'adapter au nom exact de votre organisation.
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        L'ensemble des modules opérationnels — <strong>Organismes, Utilisateurs, Authentification, Étiquettes, Rapports avancés, Tableaux de bord (Métriques &amp; Prédictif), Offres, Clés API, Contacts entrepôt</strong> — adopte désormais un <strong>en-tête professionnel unifié</strong> et des <strong>cartes KPI harmonisées</strong> (couleurs de la marque, icônes, disposition responsive). Les écrans-portail (Marque, Départements, Configuration, Recrutement) conservent leur identité dédiée. Résultat : navigation plus cohérente et lecture plus rapide de l'état de chaque module.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">🏛️ Organismes</h5>
                      <p className="text-sm text-gray-700">
                        Fiches complètes des organismes, classifications, personnes responsables, clés d'accès, lien direct de portail et réinitialisation de clé.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">🎁 Offres</h5>
                      <p className="text-sm text-gray-700">
                        Création et gestion d'offres de dons avec produits, quantités, dates d'expiration et destinataires.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">🚚 Transport</h5>
                      <p className="text-sm text-gray-700">
                        Planification des routes, gestion de la flotte, chauffeurs, suivi GPS et optimisation des livraisons.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">📊 Rapports</h5>
                      <p className="text-sm text-gray-700">
                        Rapports standards et avancés avec exports, synthèses et lecture croisée des activités de l'entrepôt.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">🤝 Partenaires & fournisseurs</h5>
                      <p className="text-sm text-gray-700">
                        Suivi des donateurs et fournisseurs, participation PRS, organisme accrédité assigné et historique des activités partenaires.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">📞 Annuaire Entrepôt</h5>
                      <p className="text-sm text-gray-700">
                        Annuaire de contacts du département avec types dédiés Entrepôt: donateurs, fournisseurs, PRS, transporteurs et autres contacts opérationnels.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-bold text-blue-900 mb-2">♻️ Déchets & compostage</h5>
                      <p className="text-sm text-gray-700">
                        Suivi du gaspillage, de la valorisation et des sorties vers compostage pour documenter les pertes et leur traitement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Navigation Rapide
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Le menu accordéon Entrepôt permet de passer rapidement d'un sous-module à l'autre sans casser le contexte de travail. Depuis les formulaires PRS et partenaires, des raccourcis ouvrent aussi directement le module Organismes quand une vérification est nécessaire.
                  </p>
                </div>
              </div>
            )}

            {/* OFFRES ORGANISMES */}
            {seccionActiva === 'ofertas' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Gift className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Offres aux Organismes</h3>
                      <p className="text-rose-50 text-lg">
                        Créez, publiez et suivez des offres de produits visibles dans le portail organisme relié aux clés d'accès individuelles.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-pink-600" />
                    Fonctionnalités Principales
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <h5 className="font-bold text-pink-900 mb-2">📝 Création d'Offres</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Sélection de produits disponibles en inventaire</li>
                        <li>• Définition des quantités offertes</li>
                        <li>• Dates de validité et d'expiration</li>
                        <li>• Choix des organismes destinataires</li>
                      </ul>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <h5 className="font-bold text-pink-900 mb-2">✅ Gestion des Demandes</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Acceptation/refus des demandes organismes</li>
                        <li>• Suivi des quantités demandées vs disponibles</li>
                        <li>• Visibilité immédiate dans le portail organisme concerné</li>
                        <li>• Historique complet des transactions</li>
                      </ul>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <h5 className="font-bold text-pink-900 mb-2">🔄 États des Offres</h5>
                      <p className="text-sm text-gray-700">
                        Les offres passent par différents états: <strong>Active</strong> (visible aux organismes), <strong>En attente</strong> (demandes reçues), <strong>Acceptée</strong> (validée pour livraison), <strong>Expirée</strong> (date dépassée).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Connexion avec le Portail Organismes
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Les offres créées ici deviennent automatiquement visibles dans le <strong>portail organisme</strong> accessible par clé individuelle. Les équipes internes peuvent partager le lien direct depuis les fiches Organismes et Liaison.
                  </p>
                </div>
              </div>
            )}

            {/* CUISINE */}
            {seccionActiva === 'cuisine' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <ChefHat className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Cuisine</h3>
                      <p className="text-orange-50 text-lg">
                        Gestion de la production cuisine avec six accès principaux alignés sur le tableau de bord réel du module.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-orange-600" />
                    Sous-modules Cuisine
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h5 className="font-bold text-orange-900 mb-2">📖 Recettes</h5>
                      <p className="text-sm text-gray-700">
                        Créer et gérer les recettes de production avec ingrédients, quantités, instructions et rendement.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h5 className="font-bold text-orange-900 mb-2">🔄 Transformations</h5>
                      <p className="text-sm text-gray-700">
                        Enregistrer les transformations réalisées avec traçabilité complète des productions.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h5 className="font-bold text-orange-900 mb-2">🍽️ Planification Production</h5>
                      <p className="text-sm text-gray-700">
                        Planifier les productions quotidiennes et hebdomadaires depuis le calendrier de production.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h5 className="font-bold text-orange-900 mb-2">📦 Inventaire Cuisine</h5>
                      <p className="text-sm text-gray-700">
                        Consulter les stocks disponibles pour la production et l'inventaire dédié à la cuisine.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h5 className="font-bold text-orange-900 mb-2">📊 Statistiques</h5>
                      <p className="text-sm text-gray-700">
                        Consulter les analyses et rapports de production détaillés du module cuisine.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h5 className="font-bold text-orange-900 mb-2">👥 Gestion des Contacts</h5>
                      <p className="text-sm text-gray-700">
                        Gérer les bénévoles, PTC, employés et programmes rattachés au département Cuisine.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Traçabilité Complète
                  </h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Le module Cuisine assure une traçabilité complète depuis l'arrivée des produits frais jusqu'à la distribution des repas préparés:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Origine des ingrédients et stock utilisé</li>
                    <li>• Date de transformation et lot de production</li>
                    <li>• Température de conservation et dates limites</li>
                    <li>• Étiquetage automatique conforme aux normes</li>
                  </ul>
                </div>
              </div>
            )}

            {/* LIAISON */}
            {seccionActiva === 'liaison' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Mail className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Liaison</h3>
                      <p className="text-purple-50 text-lg">
                        Communication externe et suivi opérationnel des organismes avec email, profils complets et partage sécurisé des accès.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Mail className="w-6 h-6 text-purple-600" />
                    Fonctionnalités Principales
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">📧 Emails Massifs</h5>
                      <p className="text-sm text-gray-700">
                        Envoyez des emails à tous les organismes ou à une sélection spécifique (par type, région, statut PRS, etc.).
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">🗂️ Fiche organisme complète</h5>
                      <p className="text-sm text-gray-700">
                        Consultation et modification du profil organisme dans une vue compacte complète avec toutes les informations visibles sans changer de module.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">🔑 Clé d'accès et portail</h5>
                      <p className="text-sm text-gray-700">
                        La fiche Liaison affiche la clé d'accès, le lien direct du portail organisme et l'action de réinitialisation de clé.
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-bold text-purple-900 mb-2">📜 Historique & ciblage</h5>
                      <p className="text-sm text-gray-700">
                        Consultez l'historique des envois et ciblez les organismes par jour de rendez-vous, classification et recherche directe.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 border-2 border-fuchsia-300 rounded-xl p-6">
                  <h4 className="font-bold text-fuchsia-900 mb-4 flex items-center gap-2">
                    <Filter className="w-6 h-6" />
                    Mises à Jour Récentes de Liaison
                  </h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="bg-white p-4 rounded-lg border border-fuchsia-200">
                      <p className="font-bold mb-1">Profil organisme enrichi</p>
                      <p>
                        Les vues Voir/Modifier affichent maintenant la fiche complète de l'organisme, la clé d'accès, le lien du portail et la réinitialisation de clé.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-fuchsia-200">
                      <p className="font-bold mb-1">Mise en page compacte et lisible</p>
                      <p>
                        Le bandeau d'accès a été compacté et la fiche organisme se lit avec défilement global pour afficher toutes les informations sans coupure.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-fuchsia-200">
                      <p className="font-bold mb-1">Ciblage opérationnel</p>
                      <p>
                        Les envois restent filtrables par <strong>jour de rendez-vous</strong> et <strong>classification</strong> pour cibler plus finement les organismes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50 border-l-4 border-pink-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-pink-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Bonnes Pratiques
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                      Utilisez des objets clairs et descriptifs
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                      Personnalisez avec le nom de l'organisme
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                      Incluez toujours des informations de contact
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                      Respectez la langue préférée de chaque organisme
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* RECRUTEMENT */}
            {seccionActiva === 'recrutement' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <UserPlus className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Module Recrutement & Bénévoles</h3>
                      <p className="text-green-50 text-lg">
                        Gestion des candidatures, bénévoles, organismes partenaires et accès distant aux feuilles de temps par organisme.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-green-600" />
                    Fonctionnalités Principales
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-bold text-green-900 mb-2">👤 Profils Bénévoles</h5>
                      <p className="text-sm text-gray-700">
                        Informations complètes: coordonnées, compétences, langues parlées, expérience et disponibilités.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-bold text-green-900 mb-2">📅 Feuilles de temps</h5>
                      <p className="text-sm text-gray-700">
                        Saisie, suivi et corrections des feuilles de temps avec accès public individualisé par organisme.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-bold text-green-900 mb-2">🏛️ Organismes Recrutement</h5>
                      <p className="text-sm text-gray-700">
                        Gestion des organismes partenaires avec clé d'accès propre, lien de feuille de temps distant et réinitialisation de clé depuis la fiche profil.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-bold text-green-900 mb-2">⭐ Candidatures & affectations</h5>
                      <p className="text-sm text-gray-700">
                        Gestion des candidats, affectations, disponibilités, heures et suivi des activités bénévoles.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-bold text-green-900 mb-2">📢 Portail public ciblé</h5>
                      <p className="text-sm text-gray-700">
                        L'accès distant général n'est plus utilisé: chaque organisme reçoit son propre lien sécurisé pour son portail de temps.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-bold text-green-900 mb-2">📊 Statistiques</h5>
                      <p className="text-sm text-gray-700">
                        Heures travaillées, présence, activité par organisme et suivi des feuilles de temps validées.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Accès distant par organisme
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>Chaque organisme Recrutement possède désormais sa <strong>clé d'accès propre</strong> et son <strong>lien direct de feuille de temps</strong>.</p>
                    <p>Depuis la fiche Voir/Modifier, l'équipe peut copier le lien, ouvrir le portail distant ou réinitialiser la clé si nécessaire.</p>
                    <p>La fiche organisme en consultation s'ouvre dans une <strong>vue complète avec défilement</strong>, pour éviter les informations tronquées.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
