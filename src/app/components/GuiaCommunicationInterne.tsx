import React from 'react';
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
  AlertTriangle,
  Info,
  Inbox,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';

interface GuiaCommunicationInterneProps {
  onClose: () => void;
}

export function GuiaCommunicationInterne({ onClose }: GuiaCommunicationInterneProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Guide de Communication Interne
              </h2>
              <p className="text-blue-100 text-sm">Système de messagerie entre départements</p>
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

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <section>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Bienvenue!</h3>
                  <p className="text-sm text-blue-800">
                    Ce système permet une communication efficace entre tous les départements 
                    de la Banque Alimentaire. Envoyez des messages, créez des demandes et suivez 
                    leur statut en temps réel.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 1: Types de messages */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <MessageSquare className="w-6 h-6 text-blue-600" />
              1. Types de Messages
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold">Message</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Communication générale entre départements. Idéal pour partager des 
                  informations ou poser des questions.
                </p>
              </div>

              <div className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-900">Demande</h4>
                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                    Avec suivi
                  </span>
                </div>
                <p className="text-sm text-green-800">
                  Créez des demandes avec priorité et échéance. Parfait pour solliciter 
                  des ressources, approbations ou actions spécifiques.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold">Alerte</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Notifications urgentes qui nécessitent une attention immédiate.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold">Annonce</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Communications officielles ou informations importantes pour tous.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Créer un message */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Send className="w-6 h-6 text-blue-600" />
              2. Envoyer un Message
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Cliquez sur "Nouveau Message"</p>
                  <p className="text-sm text-gray-600">Bouton bleu en haut à droite</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Sélectionnez le type et le destinataire</p>
                  <p className="text-sm text-gray-600">Choisissez le département cible</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Rédigez votre message</p>
                  <p className="text-sm text-gray-600">Ajoutez un sujet clair et un contenu détaillé</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Pour les demandes: définissez la priorité</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded">Basse</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 border border-blue-300 rounded">Normale</span>
                    <span className="text-xs px-2 py-1 bg-orange-100 border border-orange-300 rounded">Haute</span>
                    <span className="text-xs px-2 py-1 bg-red-100 border border-red-300 rounded">Urgente</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  5
                </div>
                <div>
                  <p className="font-medium">Envoyez!</p>
                  <p className="text-sm text-gray-600">Le destinataire recevra une notification</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Demande de Volontaire */}
          <section className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <UserPlus className="w-6 h-6 text-green-600" />
              3. Demander un Volontaire (Fonction Spéciale)
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">Bouton Vert Flotant</h4>
                <p className="text-sm text-gray-700 mb-3">
                  En bas à droite de l'écran, vous trouverez un bouton vert 
                  <span className="inline-flex items-center mx-1 px-2 py-1 bg-green-600 text-white rounded text-xs">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Demander un Volontaire
                  </span>
                </p>
                
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-sm font-medium text-green-900 mb-2">✅ Avantages:</p>
                  <ul className="text-sm text-green-800 space-y-1 ml-4">
                    <li>• Formulaire pré-rempli automatiquement</li>
                    <li>• Envoi direct au département RH</li>
                    <li>• Type de demande pré-sélectionné</li>
                    <li>• Gain de temps considérable</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">Informations à inclure:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Nombre de volontaires nécessaires</li>
                  <li>✓ Compétences requises</li>
                  <li>✓ Durée estimée de la mission</li>
                  <li>✓ Date et heure souhaitées</li>
                  <li>✓ Lieu de l'activité</li>
                  <li>✓ Description détaillée des tâches</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Filtres */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Search className="w-6 h-6 text-blue-600" />
              4. Organiser vos Messages
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Inbox className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm">Reçus</h4>
                </div>
                <p className="text-xs text-gray-600">Messages que vous avez reçus</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-4 h-4 text-green-600" />
                  <h4 className="font-bold text-sm">Envoyés</h4>
                </div>
                <p className="text-xs text-gray-600">Messages que vous avez envoyés</p>
              </div>

              <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-sm text-red-900">Non lus</h4>
                </div>
                <p className="text-xs text-red-800">Messages non consultés</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-bold text-sm">Importants</h4>
                </div>
                <p className="text-xs text-gray-600">Messages marqués en favori</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-sm">Demandes</h4>
                </div>
                <p className="text-xs text-gray-600">Toutes les demandes actives</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="w-4 h-4 text-gray-600" />
                  <h4 className="font-bold text-sm">Archives</h4>
                </div>
                <p className="text-xs text-gray-600">Messages archivés</p>
              </div>
            </div>
          </section>

          {/* Section 5: Statuts des demandes */}
          <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <TrendingUp className="w-6 h-6 text-blue-600" />
              5. Suivi des Demandes
            </h3>
            
            <p className="text-sm text-gray-700 mb-4">
              Les demandes passent par différents statuts. Seul le département destinataire peut modifier le statut.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">En attente</p>
                  <p className="text-xs text-gray-600">Demande reçue, en attente de traitement</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">En cours</p>
                  <p className="text-xs text-gray-600">Demande en cours de traitement</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">Complétée</p>
                  <p className="text-xs text-gray-600">Demande traitée avec succès</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">Rejetée</p>
                  <p className="text-xs text-gray-600">Demande refusée</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                <X className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">Annulée</p>
                  <p className="text-xs text-gray-600">Demande annulée par l'émetteur</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-100 border-l-4 border-blue-600 p-3 rounded-r">
              <p className="text-sm text-blue-900">
                <strong>💡 Astuce:</strong> Vous recevrez une notification automatique à chaque changement de statut.
              </p>
            </div>
          </section>

          {/* Section 6: Actions rapides */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Star className="w-6 h-6 text-blue-600" />
              6. Actions Rapides
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-bold text-sm">Marquer Important</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Cliquez sur l'étoile pour marquer un message comme important et le retrouver facilement.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="w-4 h-4 text-gray-600" />
                  <h4 className="font-bold text-sm">Archiver</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Archivez les messages traités pour garder votre boîte propre.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm">Répondre</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Répondez directement aux messages. Les réponses sont liées au message original.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-gray-600" />
                  <h4 className="font-bold text-sm">Rechercher</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Utilisez la barre de recherche pour trouver un message spécifique.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Types de demandes */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <FileText className="w-6 h-6 text-blue-600" />
              7. Types de Demandes Disponibles
            </h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">🤝 Demande de volontaire</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">📦 Transfert inventaire</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">🚚 Transport</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">✅ Approbation</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">ℹ️ Information</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">💻 Support technique</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">👥 Ressources humaines</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-medium text-sm">💰 Finance</p>
              </div>
            </div>
          </section>

          {/* Section 8: Conseils */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-300">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              8. Bonnes Pratiques
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Sujets clairs:</strong> Utilisez des sujets descriptifs pour faciliter la recherche
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Priorités appropriées:</strong> Réservez "Urgente" aux vraies urgences
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Réponses rapides:</strong> Consultez régulièrement vos messages non lus
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Statuts à jour:</strong> Mettez à jour le statut des demandes dès qu'elles évoluent
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Archives:</strong> Archivez les messages traités pour garder une boîte organisée
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Détails complets:</strong> Pour les demandes, incluez toutes les informations nécessaires
                </p>
              </div>
            </div>
          </section>

          {/* Départements */}
          <section className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Inbox className="w-6 h-6 text-blue-600" />
              9. Départements Disponibles
            </h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">ADM - Administration</p>
                <p className="text-xs text-gray-600">Marie Dubois</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">INV - Inventaire</p>
                <p className="text-xs text-gray-600">Jean Tremblay</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">TRL - Transport & Logistique</p>
                <p className="text-xs text-gray-600">Pierre Martin</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">ORG - Relations avec Organismes</p>
                <p className="text-xs text-gray-600">Sophie Gagnon</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">CPT - Comptoir de Distribution</p>
                <p className="text-xs text-gray-600">Luc Lefebvre</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">RH - Ressources Humaines</p>
                <p className="text-xs text-gray-600">Caroline Roy</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">FIN - Finance</p>
                <p className="text-xs text-gray-600">Robert Côté</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-bold text-sm text-blue-900">TEC - Support Technique</p>
                <p className="text-xs text-gray-600">Michel Lavoie</p>
              </div>
            </div>
          </section>

          {/* Footer con soporte */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white text-center">
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Besoin d'aide?
            </h3>
            <p className="text-sm text-blue-100 mb-4">
              Contactez le Support Technique pour toute question ou problème
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>support@banquealimentaire.ca</span>
              <span className="mx-2">•</span>
              <span>📞 514-555-0108</span>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            Fermer le guide
          </Button>
        </div>
      </div>
    </div>
  );
}