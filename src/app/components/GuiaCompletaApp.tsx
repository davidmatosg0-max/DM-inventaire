import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  FileText, 
  UserPlus, 
  Bell,
  Star,
  Archive,
  Search,
  CheckCircle,
  Info,
  Inbox,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  Pin,
  Smile,
  CheckCheck,
  Reply,
  Forward,
  Edit2,
  Copy,
  Hash,
  Zap,
  ThumbsUp,
  Heart,
  Laugh,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Target,
  Award,
  Rocket
} from 'lucide-react';
import { Button } from './ui/button';

interface GuiaCompletaAppProps {
  onClose: () => void;
}

export function GuiaCompletaApp({ onClose }: GuiaCompletaAppProps) {
  const [seccionActiva, setSeccionActiva] = useState<string>('inicio');

  const secciones = [
    { id: 'inicio', titulo: 'Inicio', icono: BookOpen },
    { id: 'diseno', titulo: 'Sistema de Diseño', icono: Sparkles },
    { id: 'componentes', titulo: 'Componentes Compartidos', icono: Target },
    { id: 'mensajes', titulo: 'Mensajes', icono: MessageSquare },
    { id: 'grupal', titulo: 'Mensajes Grupales', icono: Users },
    { id: 'demandas', titulo: 'Demandas', icono: FileText },
    { id: 'avanzado', titulo: 'Funciones Avanzadas', icono: Zap },
    { id: 'correccion', titulo: 'Corrección Automática', icono: Sparkles },
    { id: 'sondeos', titulo: 'Sondeos', icono: BarChart3 },
    { id: 'organizacion', titulo: 'Organización', icono: Archive },
    { id: 'tips', titulo: 'Consejos Pro', icono: Lightbulb }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex">
        
        {/* Sidebar de navegación */}
        <div className="w-64 bg-gradient-to-b from-[#1a4d7a] to-blue-800 text-white p-6 overflow-y-auto">
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-4">
              <BookOpen className="w-12 h-12 mb-2" />
              <h3 className="font-bold text-lg">Guide Complet</h3>
              <p className="text-xs text-blue-100">Communication Interne Pro</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {secciones.map((seccion) => {
              const Icon = seccion.icono;
              return (
                <button
                  key={seccion.id}
                  onClick={() => setSeccionActiva(seccion.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    seccionActiva === seccion.id
                      ? 'bg-white text-[#1a4d7a] shadow-lg scale-105'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{seccion.titulo}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a4d7a] to-blue-700 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Guide Complet de l'Application
                </h2>
                <p className="text-blue-100 text-sm">Système de Communication Interne - Banque Alimentaire</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            
            {/* INICIO */}
            {seccionActiva === 'inicio' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Award className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold mb-3">Bienvenue dans le Chat Interne Pro!</h3>
                      <p className="text-blue-50 mb-4">
                        Un système de communication moderne et puissant conçu spécialement pour 
                        optimiser la collaboration entre tous les départements de la Banque Alimentaire.
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                          <MessageSquare className="w-6 h-6 mb-2" />
                          <p className="text-sm font-bold">Messages</p>
                          <p className="text-xs text-blue-100">Individuels & Groupes</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                          <Zap className="w-6 h-6 mb-2" />
                          <p className="text-sm font-bold">Temps Réel</p>
                          <p className="text-xs text-blue-100">Notifications instantanées</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                          <Sparkles className="w-6 h-6 mb-2" />
                          <p className="text-sm font-bold">IA Intégrée</p>
                          <p className="text-xs text-blue-100">Correction automatique</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-[#2d9561]" />
                    Objectifs du Système
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Communication Efficace</p>
                        <p className="text-sm text-gray-600">Échanges rapides entre départements</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Suivi des Demandes</p>
                        <p className="text-sm text-gray-600">Traçabilité complète des requêtes</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Collaboration Renforcée</p>
                        <p className="text-sm text-gray-600">Travail d'équipe optimisé</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Transparence Totale</p>
                        <p className="text-sm text-gray-600">Visibilité sur toutes les interactions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SISTEMA DE DISEÑO */}
            {seccionActiva === 'diseno' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Sistema de Diseño</h3>
                      <p className="text-purple-50 text-lg">
                        Diseño moderno y atractivo para una mejor experiencia de usuario!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-200">
                  <h4 className="font-bold text-xl mb-4">🎯 Características</h4>
                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                    <p className="font-medium mb-3">🎨 Interface Visuelle</p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">Diseño Moderno</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Interface utilisateur intuitive et esthétique.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <CheckCheck className="w-6 h-6 text-purple-600" />
                    Diseño de Componentes
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div className="flex-1">
                        <p className="font-bold mb-2">Botones y Controles</p>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm mb-2">Botones de acción y controles de entrada:</p>
                          <div className="flex gap-3">
                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 border border-gray-300 rounded-full">Botones</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 border border-purple-300 rounded-full flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Controles
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div className="flex-1">
                        <p className="font-bold mb-2">Estilos y Temas</p>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm mb-3">Variété de styles et thèmes disponibles:</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                              <CheckCheck className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">Thème Claro</span> - Interface lumineuse
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                              <input type="checkbox" className="w-4 h-4" checked readOnly />
                              <span className="font-medium">Thème Sombre</span> - Interface sombre
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                              <X className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">Thème Personnalisé</span> - Couleurs personnalisées
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div className="flex-1">
                        <p className="font-bold mb-2">Diseño de Pantallas</p>
                        <p className="text-sm text-gray-600">
                          Diseño de pantallas optimisé pour une meilleure navigation et utilisation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Avantages du Sistema de Diseño
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Expérience Utilisateur Améliorée</p>
                        <p className="text-sm text-gray-600">Interface intuitive et esthétique</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Navigation Facilitée</p>
                        <p className="text-sm text-gray-600">Pantallas optimisées pour la navigation</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Personnalisation</p>
                        <p className="text-sm text-gray-600">Thèmes et styles personnalisables</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Performance</p>
                        <p className="text-sm text-gray-600">Diseño optimisé pour des performances élevées</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COMPONENTES COMPARTIDOS */}
            {seccionActiva === 'componentes' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Target className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Componentes Compartidos</h3>
                      <p className="text-green-50 text-lg">Componentes réutilisables pour une meilleure efficacité!</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
                  <h4 className="font-bold text-xl mb-4">🎯 Características</h4>
                  <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                    <p className="font-medium mb-3">🛠️ Componentes Réutilisables</p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2d9561] to-green-700 text-white px-6 py-3 rounded-xl shadow-lg">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">Componentes Compartidos</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4">✅ Avantages</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Zap className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Réutilisation</p>
                      <p className="text-sm text-gray-600">Componentes réutilisables pour économiser du temps</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Send className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Consistance</p>
                      <p className="text-sm text-gray-600">Interface cohérente entre les écrans</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Clock className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Performance</p>
                      <p className="text-sm text-gray-600">Componentes optimisés pour des performances élevées</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Maintenabilité</p>
                      <p className="text-sm text-gray-600">Facilité de maintenance et de mise à jour</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3">📋 Informations à inclure</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Componentes de bouton</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Componentes de champ de texte</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Componentes de liste déroulante</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Componentes de carte</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Componentes de graphique</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Componentes de table</li>
                  </ul>
                </div>
              </div>
            )}

            {/* MENSAJES */}
            {seccionActiva === 'mensajes' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                  Types de Messages
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Message Standard</h4>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Basique</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Communication générale entre départements. Parfait pour partager des 
                      informations, poser des questions ou coordonner des activités.
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg text-xs">
                      <p className="font-medium text-blue-900 mb-1">📌 Utilisation recommandée:</p>
                      <ul className="text-blue-700 space-y-1 ml-4">
                        <li>• Coordination quotidienne</li>
                        <li>• Questions rapides</li>
                        <li>• Partage d'informations</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-green-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Demande</h4>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Avec suivi</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Créez des demandes formelles avec priorité, échéance et suivi de statut. 
                      Idéal pour solliciter des ressources ou approbations.
                    </p>
                    <div className="bg-green-50 p-3 rounded-lg text-xs">
                      <p className="font-medium text-green-900 mb-2">🎯 Statuts disponibles:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">En attente</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">En cours</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Approuvée</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Refusée</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-orange-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Bell className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Alerte</h4>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Urgent</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Notifications urgentes qui nécessitent une attention immédiate. 
                      Réservé aux situations critiques.
                    </p>
                  </div>

                  <div className="bg-white border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Bell className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Annonce</h4>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Officiel</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Communications officielles et informations importantes destinées 
                      à tous les membres du département.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Comment envoyer un message?
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div>
                        <p className="font-medium">Cliquez sur "Nouveau Message"</p>
                        <p className="text-sm text-gray-600">Bouton bleu en haut à droite</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div>
                        <p className="font-medium">Sélectionnez le type et le destinataire</p>
                        <p className="text-sm text-gray-600">Mode individuel ou groupe</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div>
                        <p className="font-medium">Rédigez votre message avec correction automatique</p>
                        <p className="text-sm text-gray-600">L'IA vérifie l'orthographe en temps réel</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                      <div>
                        <p className="font-medium">Envoyez!</p>
                        <p className="text-sm text-gray-600">Notification instantanée au destinataire</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MENSAJES GRUPALES */}
            {seccionActiva === 'grupal' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Users className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Messages Groupes</h3>
                      <p className="text-orange-50 text-lg">
                        Communiquez efficacement avec plusieurs départements simultanément!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-orange-200">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-orange-600" />
                    Accès Rapide
                  </h4>
                  <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                    <p className="font-medium mb-3">🎯 Bouton Flotant Orange (en bas à droite)</p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl shadow-lg">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Message Groupe</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Cliquez ici pour ouvrir directement le formulaire en mode groupe!
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <CheckCheck className="w-6 h-6 text-purple-600" />
                    Guide Étape par Étape
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div className="flex-1">
                        <p className="font-bold mb-2">Activez le mode Groupe</p>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm mb-2">Dans "Mode d'envoi", cliquez sur le toggle:</p>
                          <div className="flex gap-3">
                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 border border-gray-300 rounded-full">Individuel</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 border border-purple-300 rounded-full flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Groupe
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div className="flex-1">
                        <p className="font-bold mb-2">Sélectionnez les destinataires</p>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm mb-3">Trois options disponibles:</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                              <CheckCheck className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">Tout sélectionner</span> - Tous les départements d'un coup
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                              <input type="checkbox" className="w-4 h-4" checked readOnly />
                              <span className="font-medium">Sélection individuelle</span> - Cochez département par département
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2 rounded border">
                              <X className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">Tout désélectionner</span> - Réinitialise la sélection
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div className="flex-1">
                        <p className="font-bold mb-2">Rédigez et envoyez</p>
                        <p className="text-sm text-gray-600">
                          Le système enverra automatiquement une copie du message à chaque 
                          département sélectionné avec le préfixe <code className="bg-purple-100 px-2 py-1 rounded text-purple-800">[GROUPE]</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Avantages des Messages Groupes
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Gain de temps</p>
                        <p className="text-sm text-gray-600">Un message, plusieurs destinataires</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Communication cohérente</p>
                        <p className="text-sm text-gray-600">Même information pour tous</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Traçabilité</p>
                        <p className="text-sm text-gray-600">Suivi de chaque envoi</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Identification facile</p>
                        <p className="text-sm text-gray-600">Préfixe [GROUPE] automatique</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEMANDAS */}
            {seccionActiva === 'demandas' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <UserPlus className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Demander un Volontaire</h3>
                      <p className="text-green-50 text-lg">Fonction spéciale pour recruter rapidement des volontaires!</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
                  <h4 className="font-bold text-xl mb-4">🎯 Bouton Vert Flotant</h4>
                  <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                    <p className="mb-4">En bas à droite de l'écran:</p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2d9561] to-green-700 text-white px-6 py-3 rounded-xl shadow-lg">
                      <UserPlus className="w-5 h-5" />
                      <span className="font-medium text-lg">Demander un Volontaire</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4">✅ Avantages</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Zap className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Formulaire pré-rempli</p>
                      <p className="text-sm text-gray-600">Type et destinataire déjà configurés</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Send className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Envoi direct au RH</p>
                      <p className="text-sm text-gray-600">Département RECRUTEMENT automatique</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Clock className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Gain de temps</p>
                      <p className="text-sm text-gray-600">3 clics au lieu de 10</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium mb-1">Priorité configurée</p>
                      <p className="text-sm text-gray-600">Normale par défaut</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3">📋 Informations à inclure</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Nombre de volontaires nécessaires</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Compétences requises</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Durée estimée de la mission</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Date et heure souhaitées</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Lieu de l'activité</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Description détaillée des tâches</li>
                  </ul>
                </div>
              </div>
            )}

            {/* FUNCIONES AVANZADAS */}
            {seccionActiva === 'avanzado' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-600" />
                  Fonctions Avancées
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-pink-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-pink-100 p-3 rounded-lg">
                        <Smile className="w-6 h-6 text-pink-600" />
                      </div>
                      <h4 className="font-bold text-lg">Réactions</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Réagissez rapidement aux messages avec des émojis
                    </p>
                    <div className="flex gap-2 text-2xl">
                      👍 ❤️ 😂 ⭐ ⚡ ✅ 🎉 🔥
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Pin className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-bold text-lg">Épingler</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Gardez les messages importants en haut de la liste
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Reply className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-lg">Répondre Rapidement</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Boutons de réponse rapide pour gagner du temps
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Edit2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-bold text-lg">Éditer</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Modifiez vos messages après envoi (marqué comme édité)
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-indigo-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Forward className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-lg">Transférer</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Partagez des messages avec d'autres départements
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <Copy className="w-6 h-6 text-gray-600" />
                      </div>
                      <h4 className="font-bold text-lg">Copier</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Copiez le contenu dans le presse-papiers
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6">
                  <h4 className="font-bold text-purple-900 mb-3">💡 Astuce Pro</h4>
                  <p className="text-sm text-purple-800">
                    Survolez un message et cliquez sur l'icône <strong>⋮ (trois points)</strong> pour 
                    accéder à toutes les actions avancées: épingler, éditer, transférer, copier, supprimer.
                  </p>
                </div>
              </div>
            )}

            {/* CORRECCIÓN AUTOMÁTICA */}
            {seccionActiva === 'correccion' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Correction Automatique avec IA</h3>
                      <p className="text-purple-50 text-lg">
                        Intelligence artificielle intégrée pour des messages parfaits!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4">✨ Fonctionnalités</h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                      <h5 className="font-bold text-blue-900 mb-2">Vérification Orthographique</h5>
                      <p className="text-sm text-blue-800 mb-2">
                        Les mots mal orthographiés sont soulignés en <span className="border-b-2 border-red-500 border-dotted">rouge pointillé</span>
                      </p>
                      <p className="text-xs text-blue-600">Cliquez sur un mot souligné pour voir les suggestions</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h5 className="font-bold text-purple-900 mb-2">Reestructurer (Nouveau!)</h5>
                      <p className="text-sm text-purple-800 mb-3">
                        Amélioration automatique complète du texte en un clic:
                      </p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>✓ Correction de toutes les fautes d'orthographe</li>
                        <li>✓ Capitalisation automatique</li>
                        <li>✓ Ponctuation optimisée</li>
                        <li>✓ Espacement corrigé</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                      <h5 className="font-bold text-green-900 mb-2">Interface Élégante</h5>
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Correction automatique activée</span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Badge visible sur tous les champs de texte
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6 border-2 border-pink-300">
                  <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Rocket className="w-6 h-6" />
                    Comment utiliser?
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium mb-2">1️⃣ Vérification en temps réel</p>
                      <p className="text-sm text-gray-600">
                        Écrivez normalement. Les erreurs sont détectées automatiquement.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium mb-2">2️⃣ Corrections manuelles</p>
                      <p className="text-sm text-gray-600">
                        Cliquez sur les mots soulignés pour choisir une correction.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="font-medium mb-2">3️⃣ Reestructurer (IA)</p>
                      <p className="text-sm text-gray-600">
                        Cliquez sur le bouton <strong>"Reestructurer"</strong> avec l'icône ✨ pour 
                        améliorer tout le texte automatiquement!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5">
                  <div className="flex gap-3">
                    <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-yellow-900 mb-2">Conseil Expert</h4>
                      <p className="text-sm text-yellow-800">
                        Utilisez <strong>"Reestructurer"</strong> avant d'envoyer des messages importants 
                        pour garantir un texte professionnel et sans fautes!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SONDEOS */}
            {seccionActiva === 'sondeos' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <BarChart3 className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Créer des Sondages</h3>
                      <p className="text-purple-50 text-lg">
                        Recueillez l'avis de votre équipe avec des sondages interactifs!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-200">
                  <h4 className="font-bold text-xl mb-4">🎯 Bouton Violet Flotant</h4>
                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-medium text-lg">Créer un Sondage</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-xl mb-4">✅ Caractéristiques</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Hash className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium mb-1">Questions multiples</p>
                      <p className="text-sm text-gray-600">Ajoutez autant d'options que nécessaire</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium mb-1">Résultats en temps réel</p>
                      <p className="text-sm text-gray-600">Visualisez les votes instantanément</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Clock className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium mb-1">Date limite</p>
                      <p className="text-sm text-gray-600">Définissez une échéance</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium mb-1">Statistiques</p>
                      <p className="text-sm text-gray-600">Graphiques et pourcentages</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3">💡 Cas d'usage</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Choisir des dates pour événements</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Décisions d'équipe</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Feedback sur processus</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" /> Enquêtes de satisfaction</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ORGANIZACIÓN */}
            {seccionActiva === 'organizacion' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Archive className="w-8 h-8 text-blue-600" />
                  Organiser vos Messages
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-200">
                    <Inbox className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-bold mb-2">Tous</h4>
                    <p className="text-sm text-gray-600">Tous vos messages actifs</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-purple-200">
                    <Pin className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-bold mb-2">Épinglés</h4>
                    <p className="text-sm text-gray-600">Messages importants en priorité</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-200">
                    <Inbox className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-bold mb-2">Reçus</h4>
                    <p className="text-sm text-gray-600">Messages entrants</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-green-200">
                    <Send className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-bold mb-2">Envoyés</h4>
                    <p className="text-sm text-gray-600">Vos messages sortants</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-red-200">
                    <Bell className="w-8 h-8 text-red-600 mb-3" />
                    <h4 className="font-bold mb-2">Non lus</h4>
                    <p className="text-sm text-gray-600">Nouveaux messages</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-yellow-200">
                    <Star className="w-8 h-8 text-yellow-600 mb-3" />
                    <h4 className="font-bold mb-2">Importants</h4>
                    <p className="text-sm text-gray-600">Messages marqués comme importants</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-green-200">
                    <FileText className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-bold mb-2">Demandes</h4>
                    <p className="text-sm text-gray-600">Toutes les demandes actives</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
                    <Archive className="w-8 h-8 text-gray-600 mb-3" />
                    <h4 className="font-bold mb-2">Archives</h4>
                    <p className="text-sm text-gray-600">Messages archivés</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-indigo-200">
                    <Search className="w-8 h-8 text-indigo-600 mb-3" />
                    <h4 className="font-bold mb-2">Recherche</h4>
                    <p className="text-sm text-gray-600">Trouvez rapidement</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Statistiques
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Accédez aux statistiques détaillées de votre département:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>• Total de messages reçus/envoyés</li>
                    <li>• Messages non lus</li>
                    <li>• Demandes par statut</li>
                    <li>• Temps de réponse moyen</li>
                    <li>• Top départements</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CONSEJOS PRO */}
            {seccionActiva === 'tips' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <Lightbulb className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">Conseils Pro</h3>
                      <p className="text-yellow-50 text-lg">
                        Maximisez votre productivité avec ces astuces d'expert!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                        <CheckCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Utilisez les messages groupes</h4>
                        <p className="text-sm text-gray-600">
                          Pour les annonces générales, gagnez du temps en envoyant  plusieurs 
                          départements simultanément
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-purple-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                        <Pin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Épinglez les messages importants</h4>
                        <p className="text-sm text-gray-600">
                          Gardez les informations critiques toujours visibles en haut de votre liste
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        <Search className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Maîtrisez la recherche</h4>
                        <p className="text-sm text-gray-600">
                          Utilisez des mots-clés précis pour retrouver rapidement n'importe quel message
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-orange-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Reestructurer avant d'envoyer</h4>
                        <p className="text-sm text-gray-600">
                          Un clic sur "Reestructurer" garantit un message professionnel et sans fautes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                        <Bell className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Configurez les priorités</h4>
                        <p className="text-sm text-gray-600">
                          Utilisez les niveaux de priorité pour que les demandes urgentes soient traitées rapidement
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-indigo-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Consultez les statistiques</h4>
                        <p className="text-sm text-gray-600">
                          Analysez vos métriques pour optimiser votre communication
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-pink-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-pink-100 p-2 rounded-lg flex-shrink-0">
                        <Smile className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Réagissez aux messages</h4>
                        <p className="text-sm text-gray-600">
                          Les réactions rapides (émojis) facilitent la communication informelle
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-teal-500">
                    <div className="flex items-start gap-3">
                      <div className="bg-teal-100 p-2 rounded-lg flex-shrink-0">
                        <Archive className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Archivez régulièrement</h4>
                        <p className="text-sm text-gray-600">
                          Gardez votre boîte de réception propre en archivant les messages traités
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6">
                  <div className="flex gap-4">
                    <Award className="w-12 h-12 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-900 text-xl mb-3">Bonus: Raccourcis Clavier (à venir)</h4>
                      <p className="text-sm text-green-800 mb-3">
                        Restez à l'affût! Des raccourcis clavier seront bientôt disponibles pour 
                        une navigation ultra-rapide.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white px-3 py-2 rounded border">
                          <code className="font-mono font-bold">Ctrl + N</code> - Nouveau message
                        </div>
                        <div className="bg-white px-3 py-2 rounded border">
                          <code className="font-mono font-bold">Ctrl + R</code> - Répondre
                        </div>
                        <div className="bg-white px-3 py-2 rounded border">
                          <code className="font-mono font-bold">Ctrl + F</code> - Rechercher
                        </div>
                        <div className="bg-white px-3 py-2 rounded border">
                          <code className="font-mono font-bold">Ctrl + E</code> - Archiver
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-gray-100 border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Version 2.0 - Communication Interne Pro</span>
            </div>
            <Button onClick={onClose} className="bg-[#1a4d7a] hover:bg-blue-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              Compris!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}