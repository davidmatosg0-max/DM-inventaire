import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Send, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, User, Calendar, ArrowLeft, Tag, UserCheck, Building2, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  type Demande, 
  obtenirDemandes, 
  ajouterReponse, 
  changerStatutDemande, 
  assignerDemande, 
  initialiserDonneesDemo,
  obtenirStatistiquesDemandes
} from '../../utils/demandesStorage';
import { useTranslation } from 'react-i18next';

export const GestionDemandes: React.FC = () => {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [demandeSelectionnee, setDemandeSelectionnee] = useState<Demande | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtreType, setFiltreType] = useState<string>('tous');
  const [filtrePriorite, setFiltrePriorite] = useState<string>('tous');
  const [recherche, setRecherche] = useState('');
  const [nouvelleReponse, setNouvelleReponse] = useState('');
  const [dialogAssigner, setDialogAssigner] = useState(false);
  const [assigneNom, setAssigneNom] = useState('');

  // Simuler l'utilisateur Liaison connecté
  const utilisateurLiaison = {
    id: 'admin-liaison-1',
    nom: 'Marie Dubois'
  };

  useEffect(() => {
    initialiserDonneesDemo();
    chargerDemandes();
  }, []);

  const chargerDemandes = () => {
    const toutesLesDemandes = obtenirDemandes();
    setDemandes(toutesLesDemandes.sort((a, b) => {
      // Priorité: urgente > nouveau > en_cours > haute > normale > basse > resolu > ferme
      const prioriteOrdre: any = {
        urgente: 0,
        haute: 1,
        normale: 2,
        basse: 3
      };
      
      const statutOrdre: any = {
        nouveau: 0,
        en_cours: 1,
        resolu: 2,
        ferme: 3
      };
      
      // D'abord par statut, puis par priorité
      const diffStatut = statutOrdre[a.statut] - statutOrdre[b.statut];
      if (diffStatut !== 0) return diffStatut;
      
      const diffPriorite = prioriteOrdre[a.priorite] - prioriteOrdre[b.priorite];
      if (diffPriorite !== 0) return diffPriorite;
      
      // Enfin par date (plus récent d'abord)
      return new Date(b.dateDerniereModification).getTime() - new Date(a.dateDerniereModification).getTime();
    }));
  };

  const envoyerReponse = () => {
    if (!demandeSelectionnee || !nouvelleReponse.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    ajouterReponse(
      demandeSelectionnee.id,
      utilisateurLiaison.id,
      utilisateurLiaison.nom,
      'liaison',
      nouvelleReponse
    );

    toast.success('✅ Réponse envoyée à l\'organisme!');
    setNouvelleReponse('');
    chargerDemandes();
    
    // Mettre à jour la demande sélectionnée
    const demandesMisesAJour = obtenirDemandes();
    const demandeMiseAJour = demandesMisesAJour.find(d => d.id === demandeSelectionnee.id);
    if (demandeMiseAJour) {
      setDemandeSelectionnee(demandeMiseAJour);
    }
  };

  const changerStatut = (statut: Demande['statut']) => {
    if (!demandeSelectionnee) return;

    changerStatutDemande(demandeSelectionnee.id, statut);
    
    const messages: any = {
      nouveau: 'Statut changé en "Nouveau"',
      en_cours: 'Demande marquée "En cours"',
      resolu: '✅ Demande marquée comme "Résolue"',
      ferme: '🔒 Demande fermée'
    };
    
    toast.success(messages[statut]);
    chargerDemandes();
    
    const demandesMisesAJour = obtenirDemandes();
    const demandeMiseAJour = demandesMisesAJour.find(d => d.id === demandeSelectionnee.id);
    if (demandeMiseAJour) {
      setDemandeSelectionnee(demandeMiseAJour);
    }
  };

  const assignerDemandeA = () => {
    if (!demandeSelectionnee || !assigneNom.trim()) {
      toast.error('Veuillez entrer un nom');
      return;
    }

    assignerDemande(demandeSelectionnee.id, assigneNom);
    toast.success(`✅ Demande assignée à ${assigneNom}`);
    setDialogAssigner(false);
    setAssigneNom('');
    chargerDemandes();
    
    const demandesMisesAJour = obtenirDemandes();
    const demandeMiseAJour = demandesMisesAJour.find(d => d.id === demandeSelectionnee.id);
    if (demandeMiseAJour) {
      setDemandeSelectionnee(demandeMiseAJour);
    }
  };

  const demandesFiltrees = demandes.filter(d => {
    const matchStatut = filtreStatut === 'tous' || d.statut === filtreStatut;
    const matchType = filtreType === 'tous' || d.type === filtreType;
    const matchPriorite = filtrePriorite === 'tous' || d.priorite === filtrePriorite;
    const matchRecherche = d.sujet.toLowerCase().includes(recherche.toLowerCase()) ||
                           d.description.toLowerCase().includes(recherche.toLowerCase()) ||
                           d.organismeNom.toLowerCase().includes(recherche.toLowerCase());
    return matchStatut && matchType && matchPriorite && matchRecherche;
  });

  const stats = obtenirStatistiquesDemandes();

  const getStatutBadge = (statut: Demande['statut']) => {
    const configs = {
      nouveau: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🆕', text: 'Nouveau' },
      en_cours: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏳', text: 'En cours' },
      resolu: { color: 'bg-green-100 text-green-700 border-green-300', icon: '✅', text: 'Résolu' },
      ferme: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🔒', text: 'Fermé' }
    };
    const config = configs[statut];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: Demande['type']) => {
    const configs = {
      technique: { color: 'bg-purple-100 text-purple-700', icon: '🔧', text: 'Technique' },
      modification: { color: 'bg-blue-100 text-blue-700', icon: '✏️', text: 'Modification' },
      question: { color: 'bg-green-100 text-green-700', icon: '❓', text: 'Question' },
      urgente: { color: 'bg-red-100 text-red-700', icon: '🚨', text: 'Urgent' }
    };
    const config = configs[type];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getPrioriteBadge = (priorite: Demande['priorite']) => {
    const configs = {
      basse: { color: 'bg-gray-100 text-gray-600', text: 'Basse' },
      normale: { color: 'bg-blue-100 text-blue-600', text: 'Normale' },
      haute: { color: 'bg-orange-100 text-orange-600', text: 'Haute' },
      urgente: { color: 'bg-red-100 text-red-600', text: 'Urgente' }
    };
    const config = configs[priorite];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (demandeSelectionnee) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Fondo degradado moderno */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#1a4d7a] via-[#2d5f8d] to-[#2d9561] -z-10" />
        
        {/* Patrón de puntos decorativo */}
        <div 
          className="fixed inset-0 opacity-10 -z-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
        
        <div className="max-w-6xl mx-auto p-6">
          {/* Header con glassmorphism */}
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]" />
            
            <button
              onClick={() => setDemandeSelectionnee(null)}
              className="group flex items-center gap-2 text-[#1a4d7a] hover:text-[#2d9561] mb-4 font-medium transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour à la liste
            </button>

            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {demandeSelectionnee.sujet}
                    </h1>
                    <p className="text-gray-600">
                      🏢 {demandeSelectionnee.organismeNom}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {getStatutBadge(demandeSelectionnee.statut)}
                  {getTypeBadge(demandeSelectionnee.type)}
                  {getPrioriteBadge(demandeSelectionnee.priorite)}
                  
                  {demandeSelectionnee.assigneA && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      <UserCheck className="w-4 h-4" />
                      Assigné à: {demandeSelectionnee.assigneA}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Créée: {new Date(demandeSelectionnee.dateCreation).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Modifiée: {new Date(demandeSelectionnee.dateDerniereModification).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <Button
                onClick={() => changerStatut('en_cours')}
                disabled={demandeSelectionnee.statut === 'en_cours'}
                variant="outline"
                size="sm"
              >
                ⏳ Marquer en cours
              </Button>
              <Button
                onClick={() => changerStatut('resolu')}
                disabled={demandeSelectionnee.statut === 'resolu'}
                variant="outline"
                size="sm"
              >
                ✅ Marquer résolu
              </Button>
              <Button
                onClick={() => changerStatut('ferme')}
                disabled={demandeSelectionnee.statut === 'ferme'}
                variant="outline"
                size="sm"
              >
                🔒 Fermer
              </Button>
              <Button
                onClick={() => setDialogAssigner(true)}
                variant="outline"
                size="sm"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Assigner
              </Button>
            </div>
          </div>

          {/* Description initiale */}
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1a4d7a] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              📋 Description de la demande
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50">
              {demandeSelectionnee.description}
            </p>
          </div>

          {/* Conversation */}
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              💬 Échanges avec l'organisme ({demandeSelectionnee.reponses.length})
            </h2>

            <div className="space-y-4 mb-6">
              {demandeSelectionnee.reponses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Aucune réponse pour le moment</p>
                  <p className="text-sm">Soyez le premier à répondre à cette demande</p>
                </div>
              ) : (
                demandeSelectionnee.reponses.map((reponse) => (
                  <div
                    key={reponse.id}
                    className={`p-4 rounded-lg ${
                      reponse.auteurRole === 'liaison'
                        ? 'bg-blue-50 border-l-4 border-blue-500 ml-8'
                        : 'bg-gray-50 border-l-4 border-gray-400 mr-8'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          reponse.auteurRole === 'liaison' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {reponse.auteurRole === 'liaison' ? (
                            <UserCheck className="w-4 h-4 text-white" />
                          ) : (
                            <Building2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{reponse.auteurNom}</div>
                          <div className="text-xs text-gray-500">
                            {reponse.auteurRole === 'liaison' ? '👔 Équipe Liaison' : '🏢 Organisme'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(reponse.dateCreation).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(reponse.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reponse.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Formulaire de réponse */}
            {demandeSelectionnee.statut !== 'ferme' && (
              <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Répondre en tant qu'équipe Liaison
                </h3>
                <Textarea
                  value={nouvelleReponse}
                  onChange={(e) => setNouvelleReponse(e.target.value)}
                  placeholder="Votre réponse à l'organisme..."
                  className="mb-3 bg-white"
                  rows={5}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">
                    💡 Votre réponse sera visible par l'organisme
                  </p>
                  <Button
                    onClick={envoyerReponse}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer la réponse
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dialog Assigner */}
        <Dialog open={dialogAssigner} onOpenChange={setDialogAssigner}>
          <DialogContent aria-describedby="assign-request-description">
            <DialogHeader>
              <DialogTitle>{t('requests.dialog.assignTitle')}</DialogTitle>
              <DialogDescription id="assign-request-description">
                {t('requests.dialog.assignDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Assigner à</Label>
                <Input
                  value={assigneNom}
                  onChange={(e) => setAssigneNom(e.target.value)}
                  placeholder="Nom de l'administrateur..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDialogAssigner(false)}>
                  Annuler
                </Button>
                <Button onClick={assignerDemandeA} className="bg-blue-600 hover:bg-blue-700">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assigner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo degradado moderno */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a4d7a] via-[#2d5f8d] to-[#2d9561] -z-10" />
      
      {/* Patrón de puntos decorativo */}
      <div 
        className="fixed inset-0 opacity-10 -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]" />
          <h1 className="text-4xl font-bold text-[#1a4d7a] mb-2 flex items-center gap-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
              💬
            </div>
            Gestion des Demandes des Organismes
          </h1>
          <p className="text-gray-600 text-lg ml-[60px]">
            Gérez toutes les communications et demandes provenant des organismes partenaires
          </p>
        </div>

        {/* Statistiques con glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-4 hover:scale-105 transition-transform duration-300">
            <div className="text-sm text-gray-600 mb-1 font-medium">Total</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#1a4d7a] to-blue-600 bg-clip-text text-transparent">{stats.total}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-4 border-l-4 border-blue-500 hover:scale-105 transition-transform duration-300">
            <div className="text-sm text-gray-600 mb-1 font-medium">Nouvelles</div>
            <div className="text-2xl font-bold text-blue-600">{stats.nouveau}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-4 border-l-4 border-yellow-500 hover:scale-105 transition-transform duration-300">
            <div className="text-sm text-gray-600 mb-1 font-medium">En cours</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.enCours}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-4 border-l-4 border-green-500 hover:scale-105 transition-transform duration-300">
            <div className="text-sm text-gray-600 mb-1 font-medium">Résolues</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolu}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-4 border-l-4 border-gray-400 hover:scale-105 transition-transform duration-300">
            <div className="text-sm text-gray-600 mb-1 font-medium">Fermées</div>
            <div className="text-2xl font-bold text-gray-600">{stats.ferme}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-4 border-l-4 border-red-500 hover:scale-105 transition-transform duration-300">
            <div className="text-sm text-gray-600 mb-1 font-medium">Urgentes</div>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          </div>
        </div>

        {/* Filtres con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtreStatut} onValueChange={setFiltreStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">📋 Tous</SelectItem>
                <SelectItem value="nouveau">🆕 Nouveau</SelectItem>
                <SelectItem value="en_cours">⏳ En cours</SelectItem>
                <SelectItem value="resolu">✅ Résolu</SelectItem>
                <SelectItem value="ferme">🔒 Fermé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtreType} onValueChange={setFiltreType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">📋 Tous les types</SelectItem>
                <SelectItem value="question">❓ Question</SelectItem>
                <SelectItem value="technique">🔧 Technique</SelectItem>
                <SelectItem value="modification">✏️ Modification</SelectItem>
                <SelectItem value="urgente">🚨 Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtrePriorite} onValueChange={setFiltrePriorite}>
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes priorités</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="normale">Normale</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {demandesFiltrees.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#1a4d7a]" />
              <h3 className="text-xl font-bold text-[#1a4d7a] mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-600">
                Aucune demande ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            demandesFiltrees.map((demande) => (
              <div
                key={demande.id}
                onClick={() => setDemandeSelectionnee(demande)}
                className={`group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 cursor-pointer hover:scale-[1.01] relative overflow-hidden ${
                  demande.priorite === 'urgente' ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#1a4d7a]/10 to-[#2d9561]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1a4d7a] to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-[#1a4d7a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {demande.sujet}
                          </h3>
                          {demande.priorite === 'urgente' && (
                            <span className="text-red-600 text-xl">🚨</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          🏢 {demande.organismeNom}
                        </p>
                        <p className="text-gray-600 line-clamp-2">{demande.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {getStatutBadge(demande.statut)}
                      {getTypeBadge(demande.type)}
                      {getPrioriteBadge(demande.priorite)}
                      
                      {demande.reponses.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          💬 {demande.reponses.length} réponse{demande.reponses.length > 1 ? 's' : ''}
                        </span>
                      )}
                      
                      {demande.assigneA && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          <UserCheck className="w-3 h-3" />
                          {demande.assigneA}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(demande.dateDerniereModification).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};