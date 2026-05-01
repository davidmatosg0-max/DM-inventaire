import React, { useState } from 'react';
import { 
  Activity, UserPlus, UserCheck, Edit3, FileCheck, FileMinus,
  TrendingUp, MessageSquare, Sparkles, Plus, Save, Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

// Tipos de eventos
type TipoEvento = 
  | 'creation'
  | 'modification'
  | 'changement_statut'
  | 'note_ajoutee'
  | 'document_ajoute'
  | 'document_supprime'
  | 'heure_enregistree'
  | 'type_modifie'
  | 'personnalise';

interface EvenementActivite {
  id: string;
  type: TipoEvento;
  titre: string;
  description?: string;
  date: string;
  utilisateur?: string;
  icone?: string;
  couleur?: string;
  metadata?: Record<string, any>;
}

interface HistoriqueActiviteProps {
  evenements?: EvenementActivite[];
  onAjouterEvenement?: (evenement: EvenementActivite) => void;
  isEditing?: boolean;
}

// Configuración de íconos y colores por tipo de evento
const configEventos: Record<TipoEvento, { icon: any, couleur: string, label: string }> = {
  creation: { icon: UserPlus, couleur: '#4CAF50', label: 'Création' },
  modification: { icon: Edit3, couleur: '#2196F3', label: 'Modification' },
  changement_statut: { icon: UserCheck, couleur: '#FF9800', label: 'Changement de statut' },
  note_ajoutee: { icon: MessageSquare, couleur: '#9C27B0', label: 'Note ajoutée' },
  document_ajoute: { icon: FileCheck, couleur: '#4CAF50', label: 'Document ajouté' },
  document_supprime: { icon: FileMinus, couleur: '#F44336', label: 'Document supprimé' },
  heure_enregistree: { icon: TrendingUp, couleur: '#FF9800', label: 'Heures enregistrées' },
  type_modifie: { icon: Activity, couleur: '#00BCD4', label: 'Type modifié' },
  personnalise: { icon: Sparkles, couleur: '#607D8B', label: 'Événement personnalisé' }
};

export function HistoriqueActivite({ 
  evenements = [], 
  onAjouterEvenement, 
  isEditing = false 
}: HistoriqueActiviteProps) {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'personnalise' as TipoEvento,
    titre: '',
    description: ''
  });

  // Ordenar eventos por fecha (más reciente primero)
  const evenementsOrdonnes = [...evenements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAjouterEvenement = () => {
    if (!newEvent.titre.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    const evenement: EvenementActivite = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: newEvent.type,
      titre: newEvent.titre,
      description: newEvent.description || undefined,
      date: new Date().toISOString(),
      utilisateur: 'David', // Usuario actual (puede ser dinámico)
      couleur: configEventos[newEvent.type].couleur
    };

    if (onAjouterEvenement) {
      onAjouterEvenement(evenement);
    }

    setNewEvent({ type: 'personnalise', titre: '', description: '' });
    setIsAddingEvent(false);
    toast.success('✅ Événement ajouté au journal d\'activité');
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Bouton ajouter événement */}
      {isEditing && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingEvent(!isAddingEvent)}
            className="border-[#607D8B] text-[#607D8B] hover:bg-[#607D8B] hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAddingEvent ? 'Annuler' : 'Ajouter un événement'}
          </Button>
        </div>
      )}

      {/* Formulaire d'ajout d'événement */}
      {isAddingEvent && (
        <div className="p-4 bg-[#ECEFF1] rounded-lg border-2 border-[#607D8B]">
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold mb-1">Type d'événement</Label>
              <Select
                value={newEvent.type}
                onValueChange={(val) => setNewEvent({ ...newEvent, type: val as TipoEvento })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(configEventos).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" style={{ color: config.couleur }} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1">Titre *</Label>
              <Input
                value={newEvent.titre}
                onChange={(e) => setNewEvent({ ...newEvent, titre: e.target.value })}
                placeholder="Ex: Réunion d'orientation complétée"
                className="bg-white"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1">Description (optionnel)</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Détails supplémentaires..."
                className="min-h-[80px] bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="bg-[#607D8B] hover:bg-[#546E7A] text-white"
                onClick={handleAjouterEvenement}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingEvent(false);
                  setNewEvent({ type: 'personnalise', titre: '', description: '' });
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline d'événements */}
      {evenementsOrdonnes.length > 0 ? (
        <div className="relative">
          {/* Línea vertical del timeline */}
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#607D8B] via-[#607D8B]/50 to-transparent" />
          
          <div className="space-y-4">
            {evenementsOrdonnes.map((evt, index) => {
              const config = configEventos[evt.type] || configEventos.personnalise;
              const Icon = config.icon;
              const couleur = evt.couleur || config.couleur;

              return (
                <div key={evt.id} className="relative pl-12">
                  {/* Punto del timeline */}
                  <div
                    className="absolute left-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md"
                    style={{ backgroundColor: couleur }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Contenido del evento */}
                  <div
                    className="p-4 bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: couleur }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[#333333]">{evt.titre}</h4>
                          <Badge 
                            className="text-xs" 
                            style={{ 
                              backgroundColor: `${couleur}15`, 
                              color: couleur,
                              border: `1px solid ${couleur}40`
                            }}
                          >
                            {config.label}
                          </Badge>
                        </div>
                        
                        {evt.description && (
                          <p className="text-sm text-[#666666] mt-1 whitespace-pre-wrap">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right text-xs text-[#999999]">
                        <p className="font-semibold" style={{ color: couleur }}>
                          {formatRelativeTime(evt.date)}
                        </p>
                        <p className="mt-0.5" title={formatFullDate(evt.date)}>
                          {new Date(evt.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                      {evt.utilisateur && (
                        <div className="flex items-center gap-1 text-xs text-[#999999]">
                          <UserCheck className="w-3 h-3" />
                          <span>{evt.utilisateur}</span>
                        </div>
                      )}
                      
                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <div className="flex items-center gap-2">
                          {Object.entries(evt.metadata).slice(0, 3).map(([key, value]) => (
                            <Badge 
                              key={key} 
                              variant="outline" 
                              className="text-xs border-gray-300 text-gray-600"
                            >
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aucune activité enregistrée</p>
          <p className="text-sm text-gray-400 mt-1">
            L'historique des événements apparaîtra ici
          </p>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingEvent(true)}
              className="mt-4 border-[#607D8B] text-[#607D8B] hover:bg-[#607D8B] hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter le premier événement
            </Button>
          )}
        </div>
      )}

      {/* Résumé statistique */}
      {evenementsOrdonnes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {Object.entries(
            evenementsOrdonnes.reduce((acc, evt) => {
              acc[evt.type] = (acc[evt.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => {
            const config = configEventos[type as TipoEvento];
            const Icon = config.icon;
            return (
              <div
                key={type}
                className="p-3 rounded-lg border-2 text-center"
                style={{ 
                  borderColor: `${config.couleur}40`,
                  backgroundColor: `${config.couleur}08`
                }}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: config.couleur }} />
                <p className="text-2xl font-bold" style={{ color: config.couleur }}>
                  {count}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{config.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
