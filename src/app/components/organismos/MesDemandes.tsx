import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Plus, Send, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, Paperclip, User, Calendar, Tag, ArrowLeft, FileText, Loader } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  creerDemande,
  obtenirDemandesParOrganisme,
  ajouterReponse,
  Demande,
  initialiserDonneesDemo
} from '../../utils/demandesStorage';
import { obtenerOfertas, type Oferta, type SolicitudOferta } from '../../utils/ofertaStorage';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';

interface MesDemandesProps {
  organismeId: string;
  organismeNom: string;
  onRetour: () => void;
}

export const MesDemandes: React.FC<MesDemandesProps> = ({ organismeId, organismeNom, onRetour }) => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [demandeSelectionnee, setDemandeSelectionnee] = useState<Demande | null>(null);
  const [dialogNouvelledemAnde, setDialogNouvelledemAnde] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [recherche, setRecherche] = useState('');
  const [nouvelleReponse, setNouvelleReponse] = useState('');
  
  // Formulaire nouvelle demande
  const [formDemande, setFormDemande] = useState({
    type: 'question' as const,
    priorite: 'normale' as const,
    sujet: '',
    description: ''
  });

  useEffect(() => {
    initialiserDonneesDemo();
    chargerDemandes();
  }, [organismeId]);

  const chargerDemandes = () => {
    const demandesOrganisme = obtenirDemandesParOrganisme(organismeId);
    setDemandes(demandesOrganisme.sort((a, b) => 
      new Date(b.dateDerniereModification).getTime() - new Date(a.dateDerniereModification).getTime()
    ));
  };

  const creerNouvelleDemande = () => {
    if (!formDemande.sujet.trim() || !formDemande.description.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const nouvelleDemande = creerDemande({
      organismeId,
      organismeNom,
      type: formDemande.type,
      priorite: formDemande.priorite,
      sujet: formDemande.sujet,
      description: formDemande.description
    });

    toast.success('✅ Demande créée avec succès!');
    setDialogNouvelledemAnde(false);
    setFormDemande({
      type: 'question',
      priorite: 'normale',
      sujet: '',
      description: ''
    });
    chargerDemandes();
  };

  const envoyerReponse = () => {
    if (!demandeSelectionnee || !nouvelleReponse.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    ajouterReponse(
      demandeSelectionnee.id,
      organismeId,
      organismeNom,
      'organisme',
      nouvelleReponse
    );

    toast.success('✅ Réponse envoyée!');
    setNouvelleReponse('');
    chargerDemandes();
    
    // Mettre à jour la demande sélectionnée
    const demandesMisesAJour = obtenirDemandesParOrganisme(organismeId);
    const demandeMiseAJour = demandesMisesAJour.find(d => d.id === demandeSelectionnee.id);
    if (demandeMiseAJour) {
      setDemandeSelectionnee(demandeMiseAJour);
    }
  };

  const demandesFiltrees = demandes.filter(d => {
    const matchStatut = filtreStatut === 'tous' || d.statut === filtreStatut;
    const matchRecherche = d.sujet.toLowerCase().includes(recherche.toLowerCase()) ||
                           d.description.toLowerCase().includes(recherche.toLowerCase());
    return matchStatut && matchRecherche;
  });

  const reclamosOfertas = obtenerOfertas()
    .flatMap((oferta: Oferta) =>
      (oferta.solicitudes || [])
        .filter((solicitud: SolicitudOferta) => solicitud.organismoId === organismeId)
        .map((solicitud: SolicitudOferta) => {
          const totalKilos = solicitud.productosAceptados.reduce((sum, productoAceptado) => {
            const productoOferta = oferta.productos.find(producto => producto.productoId === productoAceptado.productoId);
            return sum + ((productoOferta?.peso || 0) * productoAceptado.cantidadAceptada);
          }, 0);

          const totalValor = solicitud.productosAceptados.reduce((sum, productoAceptado) => {
            const productoOferta = oferta.productos.find(producto => producto.productoId === productoAceptado.productoId);
            return sum + ((productoOferta?.valorUnitario || 0) * productoAceptado.cantidadAceptada);
          }, 0);

          return {
            oferta,
            solicitud,
            totalProductos: solicitud.productosAceptados.length,
            totalKilos,
            totalValor,
          };
        })
    )
    .sort((a, b) => new Date(b.solicitud.fechaSolicitud).getTime() - new Date(a.solicitud.fechaSolicitud).getTime());

  const getEstadoSolicitudBadge = (estado: SolicitudOferta['estado']) => {
    const configs = {
      pendiente: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏳', text: 'Réclamation en attente' },
      aceptada: { color: 'bg-green-100 text-green-700 border-green-300', icon: '✅', text: 'Offre acceptée' },
      entregada: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🚚', text: 'Offre livrée' },
      rechazada: { color: 'bg-red-100 text-red-700 border-red-300', icon: '❌', text: 'Offre refusée' },
      anulada: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🚫', text: 'Réclamation annulée' }
    };
    const config = configs[estado];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <button
              onClick={() => setDemandeSelectionnee(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux demandes
            </button>

            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {demandeSelectionnee.sujet}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  {getStatutBadge(demandeSelectionnee.statut)}
                  {getTypeBadge(demandeSelectionnee.type)}
                  {getPrioriteBadge(demandeSelectionnee.priorite)}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Créée le: {new Date(demandeSelectionnee.dateCreation).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Modifiée: {new Date(demandeSelectionnee.dateDerniereModification).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>

          {/* Description initiale */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              📋 Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{demandeSelectionnee.description}</p>
          </div>

          {/* Conversation */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              💬 Conversation ({demandeSelectionnee.reponses.length})
            </h2>

            <div className="space-y-4 mb-6">
              {demandeSelectionnee.reponses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Aucune réponse pour le moment</p>
                </div>
              ) : (
                demandeSelectionnee.reponses.map((reponse) => (
                  <div
                    key={reponse.id}
                    className={`p-4 rounded-lg ${
                      reponse.auteurRole === 'liaison'
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'bg-gray-50 border-l-4 border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          reponse.auteurRole === 'liaison' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          <User className="w-4 h-4 text-white" />
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
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Ajouter une réponse</h3>
                <Textarea
                  value={nouvelleReponse}
                  onChange={(e) => setNouvelleReponse(e.target.value)}
                  placeholder="Votre message..."
                  className="mb-3"
                  rows={4}
                />
                <Button
                  onClick={envoyerReponse}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer la réponse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <button
            onClick={onRetour}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                💬 Mes Demandes à Liaison
              </h1>
              <p className="text-white/90">
                Communiquez avec l'équipe Liaison pour toutes vos questions et demandes
              </p>
            </div>
            
            <Button
              onClick={() => setDialogNouvelledemAnde(true)}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Demande
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-900">{demandes.length}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Nouvelles</div>
                <div className="text-2xl font-bold text-blue-600">
                  {demandes.filter(d => d.statut === 'nouveau').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">En cours</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {demandes.filter(d => d.statut === 'en_cours').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Résolues</div>
                <div className="text-2xl font-bold text-green-600">
                  {demandes.filter(d => d.statut === 'resolu').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher une demande..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtreStatut} onValueChange={setFiltreStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">📋 Tous les statuts</SelectItem>
                <SelectItem value="nouveau">🆕 Nouveau</SelectItem>
                <SelectItem value="en_cours">⏳ En cours</SelectItem>
                <SelectItem value="resolu">✅ Résolu</SelectItem>
                <SelectItem value="ferme">🔒 Fermé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Réclamations d'offres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                🏷️ Réclamations d'offres
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Suivi de vos demandes d'offres spéciales envoyées à la Banque Alimentaire
              </p>
            </div>
            <Badge className="bg-[#1E73BE] text-white">{reclamosOfertas.length}</Badge>
          </div>

          {reclamosOfertas.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
              <Tag className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p>Vous n'avez encore aucune réclamation d'offre.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reclamosOfertas.map(({ oferta, solicitud, totalProductos, totalKilos, totalValor }) => (
                <div key={`${oferta.id}-${solicitud.id}`} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-5 h-5 text-[#1E73BE]" />
                        <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {oferta.titulo}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{oferta.numeroOferta}</p>
                      {oferta.descripcion && (
                        <p className="text-sm text-gray-700">{oferta.descripcion}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-start lg:items-end">
                      {getEstadoSolicitudBadge(solicitud.estado)}
                      <span className="text-xs text-gray-500">
                        Demandée le {new Date(solicitud.fechaSolicitud).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="bg-white rounded border p-3">
                      <div className="text-xs text-gray-500">Produits</div>
                      <div className="font-bold text-[#1E73BE]">{totalProductos}</div>
                    </div>
                    <div className="bg-white rounded border p-3">
                      <div className="text-xs text-gray-500">Poids total</div>
                      <div className="font-bold text-[#4CAF50]">{formatQuantity(totalKilos)} kg</div>
                    </div>
                    <div className="bg-white rounded border p-3">
                      <div className="text-xs text-gray-500">Valeur estimée</div>
                      <div className="font-bold text-[#FF9800]">CAD$ {formatMoney(totalValor)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Produits réclamés</p>
                    {solicitud.productosAceptados.map((productoAceptado, index) => {
                      const productoOferta = oferta.productos.find(producto => producto.productoId === productoAceptado.productoId);
                      return (
                        <div key={`${solicitud.id}-${productoAceptado.productoId}-${index}`} className="flex items-center justify-between bg-white rounded border px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{productoOferta?.icono || '📦'}</span>
                            <span>{productoOferta?.productoNombre || 'Produit'}</span>
                          </div>
                          <span className="font-medium">{productoAceptado.cantidadAceptada} {productoOferta?.unidad || 'unités'}</span>
                        </div>
                      );
                    })}
                  </div>

                  {solicitud.observaciones && (
                    <div className="mt-3 p-3 bg-white border rounded text-sm text-gray-700">
                      <span className="font-medium">Détails:</span> {solicitud.observaciones}
                    </div>
                  )}

                  {solicitud.estado === 'entregada' && solicitud.fechaActualizacion && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      <span className="font-medium">Livrée le:</span> {new Date(solicitud.fechaActualizacion).toLocaleDateString('fr-FR')}
                    </div>
                  )}

                  {solicitud.motivoRechazo && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <span className="font-medium">Motif du refus:</span> {solicitud.motivoRechazo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {demandesFiltrees.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune demande</h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore créé de demande. Commencez par créer votre première demande!
              </p>
              <Button
                onClick={() => setDialogNouvelledemAnde(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une demande
              </Button>
            </div>
          ) : (
            demandesFiltrees.map((demande) => (
              <div
                key={demande.id}
                onClick={() => setDemandeSelectionnee(demande)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {demande.sujet}
                        </h3>
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
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Modifiée: {new Date(demande.dateDerniereModification).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dialog nouvelle demande */}
        <Dialog open={dialogNouvelledemAnde} onOpenChange={setDialogNouvelledemAnde}>
          <DialogContent className="max-w-2xl" aria-describedby="nouvelle-demande-description">
            <DialogHeader>
              <DialogTitle className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                📝 Nouvelle Demande à Liaison
              </DialogTitle>
              <DialogDescription id="nouvelle-demande-description">
                Remplissez le formulaire ci-dessous pour soumettre votre demande à l'équipe Liaison
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de demande *</Label>
                  <Select
                    value={formDemande.type}
                    onValueChange={(value: any) => setFormDemande({ ...formDemande, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">❓ Question</SelectItem>
                      <SelectItem value="technique">🔧 Aide technique</SelectItem>
                      <SelectItem value="modification">✏️ Modification de données</SelectItem>
                      <SelectItem value="urgente">🚨 Demande urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priorité *</Label>
                  <Select
                    value={formDemande.priorite}
                    onValueChange={(value: any) => setFormDemande({ ...formDemande, priorite: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Sujet *</Label>
                <Input
                  value={formDemande.sujet}
                  onChange={(e) => setFormDemande({ ...formDemande, sujet: e.target.value })}
                  placeholder="Ex: Problème de connexion, mise à jour de coordonnées..."
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formDemande.sujet.length}/100 caractères
                </div>
              </div>

              <div>
                <Label>Description détaillée *</Label>
                <Textarea
                  value={formDemande.description}
                  onChange={(e) => setFormDemande({ ...formDemande, description: e.target.value })}
                  placeholder="Décrivez votre demande en détail..."
                  rows={6}
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formDemande.description.length}/1000 caractères
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Conseils:</strong> Soyez le plus précis possible dans votre description. 
                    Plus vous fournirez de détails, plus rapidement l'équipe Liaison pourra vous aider.
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogNouvelledemAnde(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={creerNouvelleDemande}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer la demande
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};