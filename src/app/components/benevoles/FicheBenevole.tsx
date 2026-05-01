import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, Phone, Mail, MapPin, Calendar, AlertCircle, 
  Save, ChevronDown, ChevronUp, Edit2, Plus, Printer,
  Clock, Award, Languages, Car, Briefcase, CalendarDays,
  StickyNote, FileText, Upload, File, Trash2, Building2, Eye, Download,
  Activity, UserPlus, UserCheck, Edit3, FileCheck, FileMinus,
  TrendingUp, MessageSquare, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Checkbox } from '../ui/checkbox';
import { HistoriqueActivite } from './HistoriqueActivite';

// ===== UTILITÉ: Formatage des heures =====
/**
 * Formate les heures décimales en format lisible
 * @param heures - Nombre d'heures en décimal (ex: 26.97)
 * @param format - 'short' pour "27h" ou 'long' pour "26h 58m"
 * @returns Chaîne formatée
 */
const formaterHeures = (heures: number, format: 'short' | 'long' = 'short'): string => {
  if (format === 'short') {
    // Format court: arrondir à l'entier le plus proche
    return `${Math.round(heures)}h`;
  } else {
    // Format long: afficher heures et minutes
    const heuresEntieres = Math.floor(heures);
    const minutes = Math.round((heures - heuresEntieres) * 60);
    
    if (minutes === 0) {
      return `${heuresEntieres}h`;
    } else if (minutes === 60) {
      return `${heuresEntieres + 1}h`;
    } else {
      return `${heuresEntieres}h ${minutes}m`;
    }
  }
};

interface Note {
  id: number;
  text: string;
  date: string;
}

interface Document {
  id: number;
  nom: string;
  type: string;
  date: string;
  url: string;
  taille: string;
}

interface FeuilleTemps {
  id: number;
  benevoleId: number;
  benevoleName: string;
  departement: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  notes: string;
}

// Tipos de eventos para el historial de actividad
type TipoEvento = 
  | 'creation'           // Creación del contacto
  | 'modification'       // Modificación de datos
  | 'changement_statut'  // Cambio de estado (actif, inactif, en pause)
  | 'note_ajoutee'       // Nota agregada
  | 'document_ajoute'    // Documento agregado
  | 'document_supprime'  // Documento eliminado
  | 'heure_enregistree'  // Horas registradas
  | 'type_modifie'       // Tipo de bénévole modificado
  | 'personnalise';      // Evento personalizado

interface EvenementActivite {
  id: string;
  type: TipoEvento;
  titre: string;
  description?: string;
  date: string;
  utilisateur?: string; // Usuario que realizó la acción
  icone?: string; // Nombre del ícono lucide
  couleur?: string; // Color del evento
  metadata?: Record<string, any>; // Datos adicionales
}

// Tipo de bénévole similar a ContactoDepartamento
type TipoBenevole = 'benevole' | 'stagiaire' | 'employe' | 'coordinateur' | 'responsable' | 'autre';

interface JourDisponible {
  jour: string;
  horaire: 'AM' | 'PM' | 'AM/PM' | null;
}

interface Benevole {
  id: number;
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  departement: string;
  disponibilites: string;
  statut: 'actif' | 'inactif' | 'en pause';
  heuresTotal: number;
  heuresMois: number;
  dateInscription: string;
  sexe?: 'Homme' | 'Femme' | 'Autre' | 'Non spécifié';
  dateNaissance?: string;
  langues?: string[];
  adresse?: string;
  quartier?: string;
  voiture?: boolean;
  horaire?: 'AM' | 'PM' | 'AM/PM';
  joursDisponibles?: JourDisponible[];
  notes?: Note[];
  documents?: Document[];
  feuillesTemps?: FeuilleTemps[];
  type?: TipoBenevole;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaRelacion?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaEmail?: string;
  historiqueActivite?: EvenementActivite[]; // Historial de actividad del contacto
}

interface FicheBenevoleProps {
  benevole: Benevole;
  onNavigate: (view: string) => void;
  onUpdate?: (benevole: Benevole) => void;
}

export function FicheBenevole({ benevole, onNavigate, onUpdate }: FicheBenevoleProps) {
  const { t } = useTranslation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [affectationExpanded, setAffectationExpanded] = useState(true);
  const [statistiquesExpanded, setStatistiquesExpanded] = useState(true);
  const [historiqueExpanded, setHistoriqueExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [contactUrgenceExpanded, setContactUrgenceExpanded] = useState(true);
  const [activiteExpanded, setActiviteExpanded] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState<Benevole>(benevole);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Filtros para historial de horas
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');

  const handleSave = () => {
    toast.success('Informations du bénévole mises à jour avec succès');
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(formData);
    }
  };

  // Función para descargar el historial en CSV
  const handleDownloadHistorique = () => {
    const feuillesFiltered = getFilteredFeuilles();
    
    if (feuillesFiltered.length === 0) {
      toast.error('Aucune donnée à télécharger');
      return;
    }

    // Crear contenido CSV
    const headers = ['Date', 'ARRIVÉE', 'DÉPART', 'Durée (h)', 'Département', 'Notes'];
    const rows = feuillesFiltered.map(feuille => [
      feuille.date,
      feuille.heureDebut,
      feuille.heureFin,
      feuille.duree,
      feuille.departement,
      feuille.notes || '-'
    ]);

    const csvContent = [
      `Historial de Horas - ${formData.prenom} ${formData.nom}`,
      `ID: ${formData.identifiant}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_${formData.identifiant}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Historial téléchargé avec succès');
  };

  // Filtrar feuilles de temps
  const getFilteredFeuilles = () => {
    if (!formData.feuillesTemps) return [];
    
    return formData.feuillesTemps.filter(feuille => {
      const dateFeuillle = new Date(feuille.date);
      const dateDebut = filterDateDebut ? new Date(filterDateDebut) : null;
      const dateFin = filterDateFin ? new Date(filterDateFin) : null;

      if (dateDebut && dateFeuillle < dateDebut) return false;
      if (dateFin && dateFeuillle > dateFin) return false;
      
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now(),
      text: newNote,
      date: new Date().toISOString()
    };
    
    const updatedBenevole = {
      ...formData,
      notes: [...(formData.notes || []), note]
    };
    
    setFormData(updatedBenevole);
    setNewNote('');
    setIsAddingNote(false);
    toast.success('Note ajoutée avec succès');
  };

  const handleDeleteNote = (noteId: number) => {
    const updatedBenevole = {
      ...formData,
      notes: formData.notes?.filter(n => n.id !== noteId) || []
    };
    setFormData(updatedBenevole);
    toast.success('Note supprimée');
  };

  const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    Array.from(files).forEach((file) => {
      // Validar tipo de archivo
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Le fichier "${file.name}" n'est pas un format accepté (PDF, JPG, PNG)`);
        return;
      }

      // Validar tamaño máximo (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`Le fichier "${file.name}" dépasse la taille maximale de 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newDocument: Document = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          nom: file.name,
          type: file.type,
          date: new Date().toISOString(),
          url: event.target?.result as string,
          taille: formatFileSize(file.size)
        };

        setFormData({
          ...formData,
          documents: [...(formData.documents || []), newDocument]
        });

        toast.success(`Document "${file.name}" ajouté avec succès`);
      };
      
      reader.onerror = () => {
        toast.error('Erreur lors de la lecture du fichier');
      };
      
      reader.readAsDataURL(file);
    });

    // Reset input
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleRemoveDocument = (documentId: number) => {
    if (!formData.documents) return;
    
    setFormData({
      ...formData,
      documents: formData.documents.filter(doc => doc.id !== documentId)
    });
    
    toast.success('Document supprimé');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'actif': { bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]', border: 'border-[#4CAF50]' },
      'inactif': { bg: 'bg-[#FFEBEE]', text: 'text-[#DC3545]', border: 'border-[#DC3545]' },
      'en pause': { bg: 'bg-[#FFF3E0]', text: 'text-[#FFC107]', border: 'border-[#FFC107]' }
    };
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['actif'];
    
    return (
      <Badge className={`${config.bg} ${config.text} border-2 ${config.border}`}>
        {statut.charAt(0).toUpperCase() + statut.slice(1)}
      </Badge>
    );
  };

  const CollapsibleSection = ({ 
    title, 
    expanded, 
    onToggle, 
    children,
    icon: Icon,
    headerColor = '#1E73BE'
  }: { 
    title: string; 
    expanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
    icon?: React.ElementType;
    headerColor?: string;
  }) => (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-[#F4F4F4] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5" style={{ color: headerColor }} />}
            <CardTitle style={{ color: '#333333', fontFamily: 'Montserrat, sans-serif' }}>
              {title}
            </CardTitle>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-[#666666]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#666666]" />
          )}
        </div>
      </CardHeader>
      {expanded && <CardContent>{children}</CardContent>}
    </Card>
  );

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon, 
    type = 'text',
    disabled = false,
    required = false
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    type?: string;
    disabled?: boolean;
    required?: boolean;
  }) => (
    <div>
      <Label className="text-[#666666] mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#1E73BE]" />}
        {label} {required && <span className="text-[#DC3545]">*</span>}
      </Label>
      {isEditing && !disabled ? (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-[#E0E0E0] focus:border-[#1E73BE] focus:ring-[#1E73BE]"
        />
      ) : (
        <p className="text-[#333333] py-2 px-3 bg-[#F9F9F9] rounded-md border border-[#E0E0E0]">
          {value || '—'}
        </p>
      )}
    </div>
  );

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const languesDisponibles = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Créole', 'Mandarin', 'Autre'];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between no-print">
        <Button variant="outline" onClick={() => onNavigate('liste')}>
          ← Retour à la liste
        </Button>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                className="bg-[#1E73BE] hover:bg-[#1557A0] text-white"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(benevole);
                }}
              >
                Annuler
              </Button>
              <Button
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Identifiant et Statut - Toujours visible */}
      <Card className="border-l-4 border-l-[#1E73BE] bg-gradient-to-r from-[#E3F2FD] to-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1E73BE] flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {formData.prenom} {formData.nom}
                </h2>
                <p className="text-[#666666] font-mono text-sm mt-1">
                  ID: {formData.identifiant}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(formData.statut)}
              <p className="text-sm text-[#666666]">
                Inscrit le {new Date(formData.dateInscription).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: Informations personnelles */}
      <CollapsibleSection
        title="Informations personnelles"
        expanded={infoExpanded}
        onToggle={() => setInfoExpanded(!infoExpanded)}
        icon={User}
        headerColor="#1E73BE"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Prénom"
            value={formData.prenom}
            onChange={(val) => setFormData({ ...formData, prenom: val })}
            icon={User}
            required
          />
          <InputField
            label="Nom"
            value={formData.nom}
            onChange={(val) => setFormData({ ...formData, nom: val })}
            icon={User}
            required
          />
          
          <div>
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#1E73BE]" />
              Sexe
            </Label>
            {isEditing ? (
              <Select 
                value={formData.sexe || 'Non spécifié'}
                onValueChange={(val) => setFormData({ ...formData, sexe: val as any })}
              >
                <SelectTrigger className="border-[#E0E0E0] focus:border-[#1E73BE] focus:ring-[#1E73BE]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                  <SelectItem value="Non spécifié">Non spécifié</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-[#333333] py-2 px-3 bg-[#F9F9F9] rounded-md border border-[#E0E0E0]">
                {formData.sexe || 'Non spécifié'}
              </p>
            )}
          </div>

          <InputField
            label="Date de naissance"
            value={formData.dateNaissance || ''}
            onChange={(val) => setFormData({ ...formData, dateNaissance: val })}
            icon={Calendar}
            type="date"
          />

          <InputField
            label="Email"
            value={formData.email}
            onChange={(val) => setFormData({ ...formData, email: val })}
            icon={Mail}
            type="email"
            required
          />

          <InputField
            label="Téléphone"
            value={formData.telephone}
            onChange={(val) => setFormData({ ...formData, telephone: val })}
            icon={Phone}
            required
          />

          <div className="md:col-span-2">
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1E73BE]" />
              Adresse
            </Label>
            {isEditing ? (
              <Input
                value={formData.adresse || ''}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="border-[#E0E0E0] focus:border-[#1E73BE] focus:ring-[#1E73BE]"
                placeholder="123 Rue Example, Ville, Code Postal"
              />
            ) : (
              <p className="text-[#333333] py-2 px-3 bg-[#F9F9F9] rounded-md border border-[#E0E0E0]">
                {formData.adresse || '—'}
              </p>
            )}
          </div>

          <InputField
            label="Quartier"
            value={formData.quartier || ''}
            onChange={(val) => setFormData({ ...formData, quartier: val })}
            icon={MapPin}
          />

          <div>
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#1E73BE]" />
              Langues parlées
            </Label>
            {isEditing ? (
              <div className="space-y-2 p-3 border border-[#E0E0E0] rounded-md bg-white">
                {languesDisponibles.map((langue) => (
                  <div key={langue} className="flex items-center space-x-2">
                    <Checkbox
                      id={`langue-${langue}`}
                      checked={formData.langues?.includes(langue) || false}
                      onCheckedChange={(checked) => {
                        const currentLangues = formData.langues || [];
                        const newLangues = checked
                          ? [...currentLangues, langue]
                          : currentLangues.filter(l => l !== langue);
                        setFormData({ ...formData, langues: newLangues });
                      }}
                    />
                    <label
                      htmlFor={`langue-${langue}`}
                      className="text-sm text-[#333333] cursor-pointer"
                    >
                      {langue}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.langues && formData.langues.length > 0 ? (
                  formData.langues.map(langue => (
                    <Badge key={langue} className="bg-[#1E73BE] text-white">
                      {langue}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[#999999] italic">Aucune langue spécifiée</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Section: Contact d'Urgence */}
      <CollapsibleSection
        title="Contact d'Urgence"
        expanded={contactUrgenceExpanded}
        onToggle={() => setContactUrgenceExpanded(!contactUrgenceExpanded)}
        icon={User}
        headerColor="#2d9561"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Nom complet"
            value={formData.contactoEmergenciaNombre || ''}
            onChange={(val) => setFormData({ ...formData, contactoEmergenciaNombre: val })}
            icon={User}
          />
          <InputField
            label="Relation"
            value={formData.contactoEmergenciaRelacion || ''}
            onChange={(val) => setFormData({ ...formData, contactoEmergenciaRelacion: val })}
            icon={User}
          />
          <InputField
            label="Téléphone"
            value={formData.contactoEmergenciaTelefono || ''}
            onChange={(val) => setFormData({ ...formData, contactoEmergenciaTelefono: val })}
            icon={Phone}
            type="tel"
          />
          <InputField
            label="Email"
            value={formData.contactoEmergenciaEmail || ''}
            onChange={(val) => setFormData({ ...formData, contactoEmergenciaEmail: val })}
            icon={Mail}
            type="email"
          />
        </div>
      </CollapsibleSection>

      {/* Section: Affectation et disponibilité */}
      <CollapsibleSection
        title="Affectation et disponibilité"
        expanded={affectationExpanded}
        onToggle={() => setAffectationExpanded(!affectationExpanded)}
        icon={Building2}
        headerColor="#4CAF50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#4CAF50]" />
              Département principal <span className="text-[#DC3545]">*</span>
            </Label>
            {isEditing ? (
              <Select 
                value={formData.departement}
                onValueChange={(val) => setFormData({ ...formData, departement: val })}
              >
                <SelectTrigger className="border-[#E0E0E0] focus:border-[#4CAF50] focus:ring-[#4CAF50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comptoir">Comptoir</SelectItem>
                  <SelectItem value="Logistique">Logistique</SelectItem>
                  <SelectItem value="Entrepôt">Entrepôt</SelectItem>
                  <SelectItem value="Distribution">Distribution</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Collecte">Collecte</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-[#333333] py-2 px-3 bg-[#F9F9F9] rounded-md border border-[#E0E0E0]">
                {formData.departement}
              </p>
            )}
          </div>

          <div>
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#4CAF50]" />
              Statut
            </Label>
            {isEditing ? (
              <Select 
                value={formData.statut}
                onValueChange={(val) => setFormData({ ...formData, statut: val as any })}
              >
                <SelectTrigger className="border-[#E0E0E0] focus:border-[#4CAF50] focus:ring-[#4CAF50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="en pause">En pause</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div>{getStatusBadge(formData.statut)}</div>
            )}
          </div>

          <div>
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#4CAF50]" />
              Jours disponibles
            </Label>
            {isEditing ? (
              <div className="space-y-2 p-3 border border-[#E0E0E0] rounded-md bg-white max-h-48 overflow-y-auto">
                {jours.map((jour) => (
                  <div key={jour} className="flex items-center space-x-2">
                    <Checkbox
                      id={`jour-${jour}`}
                      checked={formData.joursDisponibles?.some(j => j.jour === jour) || false}
                      onCheckedChange={(checked) => {
                        const currentJours = formData.joursDisponibles || [];
                        const newJours = checked
                          ? [...currentJours, { jour, horaire: null }]
                          : currentJours.filter(j => j.jour !== jour);
                        setFormData({ ...formData, joursDisponibles: newJours });
                      }}
                    />
                    <label
                      htmlFor={`jour-${jour}`}
                      className="text-sm text-[#333333] cursor-pointer"
                    >
                      {jour}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.joursDisponibles && formData.joursDisponibles.length > 0 ? (
                  formData.joursDisponibles.map(jour => (
                    <Badge key={jour.jour} className="bg-[#4CAF50] text-white">
                      {jour.jour}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[#999999] italic">Aucun jour spécifié</p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4CAF50]" />
              Horaire préféré
            </Label>
            {isEditing ? (
              <Select 
                value={formData.horaire || 'AM/PM'}
                onValueChange={(val) => setFormData({ ...formData, horaire: val as any })}
              >
                <SelectTrigger className="border-[#E0E0E0] focus:border-[#4CAF50] focus:ring-[#4CAF50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">Matin (AM)</SelectItem>
                  <SelectItem value="PM">Après-midi (PM)</SelectItem>
                  <SelectItem value="AM/PM">Toute la journée (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-[#333333] py-2 px-3 bg-[#F9F9F9] rounded-md border border-[#E0E0E0]">
                {formData.horaire === 'AM' && 'Matin (AM)'}
                {formData.horaire === 'PM' && 'Après-midi (PM)'}
                {formData.horaire === 'AM/PM' && 'Toute la journée (AM/PM)'}
                {!formData.horaire && '—'}
              </p>
            )}
          </div>

          <div>
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#4CAF50]" />
              Possession d'une voiture
            </Label>
            {isEditing ? (
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="voiture"
                  checked={formData.voiture || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, voiture: checked as boolean })}
                />
                <label htmlFor="voiture" className="text-sm text-[#333333] cursor-pointer">
                  Oui, possède une voiture
                </label>
              </div>
            ) : (
              <p className="text-[#333333] py-2 px-3 bg-[#F9F9F9] rounded-md border border-[#E0E0E0]">
                {formData.voiture ? '✓ Oui' : 'Non'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label className="text-[#666666] mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4CAF50]" />
              Notes sur disponibilités
            </Label>
            {isEditing ? (
              <Textarea
                value={formData.disponibilites || ''}
                onChange={(e) => setFormData({ ...formData, disponibilites: e.target.value })}
                className="border-[#E0E0E0] focus:border-[#4CAF50] focus:ring-[#4CAF50] min-h-[80px]"
                placeholder="Informations complémentaires sur les disponibilités..."
              />
            ) : (
              <p className="text-[#333333] py-2 px-3 bg-[#F9F9F9] rounded-md border border-[#E0E0E0] whitespace-pre-wrap">
                {formData.disponibilites || '—'}
              </p>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Section: Statistiques et activité */}
      <CollapsibleSection
        title="Statistiques et activité"
        expanded={statistiquesExpanded}
        onToggle={() => setStatistiquesExpanded(!statistiquesExpanded)}
        icon={Award}
        headerColor="#FFC107"
      >
        <div className="space-y-6">
          {/* Cartes de statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-[#1E73BE] bg-gradient-to-r from-[#E3F2FD] to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#666666] mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Heures totales accumulées
                    </p>
                    <p className="text-5xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {formaterHeures(formData.heuresTotal)}
                    </p>
                    <p className="text-xs text-[#666666] mt-2">
                      Depuis l'inscription
                    </p>
                  </div>
                  <Award className="w-20 h-20 text-[#1E73BE] opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#4CAF50] bg-gradient-to-r from-[#E8F5E9] to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#666666] mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Heures ce mois-ci
                    </p>
                    <p className="text-5xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {formaterHeures(formData.heuresMois)}
                    </p>
                    <p className="text-xs text-[#666666] mt-2">
                      {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Calendar className="w-20 h-20 text-[#4CAF50] opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#FF9800] bg-gradient-to-r from-[#FFF3E0] to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#666666] mb-1 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Jours travaillés
                    </p>
                    <p className="text-5xl font-bold text-[#FF9800]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {(() => {
                        const uniqueDates = new Set(
                          (formData.feuillesTemps || []).map(f => f.date)
                        );
                        return uniqueDates.size;
                      })()}
                    </p>
                    <p className="text-xs text-[#666666] mt-2">
                      Jours uniques
                    </p>
                  </div>
                  <CalendarDays className="w-20 h-20 text-[#FF9800] opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heures par département */}
          {(() => {
            const heuresParDept = (formData.feuillesTemps || []).reduce((acc, feuille) => {
              acc[feuille.departement] = (acc[feuille.departement] || 0) + feuille.duree;
              return acc;
            }, {} as Record<string, number>);

            const totalHeures = Object.values(heuresParDept).reduce((sum, h) => sum + h, 0);

            return Object.keys(heuresParDept).length > 0 && (
              <div className="p-5 bg-gradient-to-br from-[#F5F5F5] to-white rounded-lg border-2 border-[#E0E0E0]">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#1E73BE]" />
                  <h4 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Heures par département
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(heuresParDept)
                    .sort(([, a], [, b]) => b - a)
                    .map(([dept, heures]) => {
                      const percentage = totalHeures > 0 ? (heures / totalHeures) * 100 : 0;
                      
                      const deptColors: Record<string, string> = {
                        'Comptoir': '#1E73BE',
                        'Logistique': '#4CAF50',
                        'Entrepôt': '#FF9800',
                        'Distribution': '#9C27B0',
                        'Administration': '#00BCD4',
                        'Collecte': '#FF5722'
                      };
                      const color = deptColors[dept] || '#607D8B';
                      
                      return (
                        <div key={dept}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#333333]">{dept}</span>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: color, color: color }}
                              >
                                {formaterHeures(heures)}
                              </Badge>
                              <span className="text-xs text-[#999999]">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: color
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })()}

          {/* Activités récentes */}
          {formData.feuillesTemps && formData.feuillesTemps.length > 0 && (
            <div className="p-5 bg-gradient-to-br from-[#E8F5E9] to-white rounded-lg border-2 border-[#4CAF50]/30">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#4CAF50]" />
                <h4 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Activités récentes
                </h4>
              </div>
              
              <div className="space-y-2">
                {formData.feuillesTemps
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((feuille) => (
                    <div 
                      key={feuille.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E0E0E0] hover:border-[#4CAF50] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#4CAF50]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#333333]">
                            {new Date(feuille.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                          <p className="text-xs text-[#666666]">{feuille.departement}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-[#666666] mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono">{feuille.heureDebut} - {feuille.heureFin}</span>
                        </div>
                        <Badge className="bg-[#4CAF50] text-white text-xs">
                          {formaterHeures(feuille.duree)}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Engagement et reconnaissance */}
          <div className="bg-[#F9F9F9] p-4 rounded-lg border border-[#E0E0E0]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FFC107] mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#333333] mb-1">Engagement et reconnaissance</h4>
                <p className="text-sm text-[#666666]">
                  Ce bénévole a contribué <strong>{Math.round(formData.heuresTotal)} heures</strong> au total.
                  {formData.heuresTotal >= 100 && ' 🏆 Bénévole hautement engagé!'}
                  {formData.heuresTotal >= 50 && formData.heuresTotal < 100 && ' ⭐ Bénvole actif!'}
                  {formData.heuresTotal < 50 && ' Nouveau bénévole en formation.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section: Historique des heures */}
      <CollapsibleSection
        title={`Historique des heures (${formData.feuillesTemps?.length || 0} entrées)`}
        expanded={historiqueExpanded}
        onToggle={() => setHistoriqueExpanded(!historiqueExpanded)}
        icon={Clock}
        headerColor="#FF9800"
      >
        <div className="space-y-4">
          {/* Filtrado de fechas y botón de descarga */}
          <div className="bg-[#FFF3E0] p-4 rounded-lg border border-[#FF9800]/30">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs font-semibold mb-1 text-[#666666]">Date de début</Label>
                <Input
                  type="date"
                  value={filterDateDebut}
                  onChange={(e) => setFilterDateDebut(e.target.value)}
                  className="border-[#E0E0E0] focus:border-[#FF9800] focus:ring-[#FF9800]"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs font-semibold mb-1 text-[#666666]">Date de fin</Label>
                <Input
                  type="date"
                  value={filterDateFin}
                  onChange={(e) => setFilterDateFin(e.target.value)}
                  className="border-[#E0E0E0] focus:border-[#FF9800] focus:ring-[#FF9800]"
                />
              </div>
              <div className="flex gap-2 items-end">
                {(filterDateDebut || filterDateFin) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterDateDebut('');
                      setFilterDateFin('');
                    }}
                    className="h-10"
                  >
                    Réinitialiser
                  </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadHistorique}
                    className="border-[#FF9800] text-[#FF9800] hover:bg-[#FF9800] hover:text-white h-10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
              </div>
            </div>
            
            {/* Resumen de horas filtradas */}
            {(() => {
              const filtered = getFilteredFeuilles();
              const totalHeures = filtered.reduce((sum, f) => sum + f.duree, 0);
              return filtered.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#FF9800]/30 flex items-center gap-4 text-sm">
                  <span className="text-[#666666]">Période affichée:</span>
                  <Badge className="bg-[#FF9800] text-white">
                    {filtered.length} {filtered.length > 1 ? 'entrées' : 'entrée'}
                  </Badge>
                  <Badge variant="outline" className="border-[#FF9800] text-[#FF9800]">
                    Total: {formaterHeures(totalHeures)}
                  </Badge>
                </div>
              );
            })()}
          </div>

          {/* Lista de fechas */}
          {(() => {
            const filtered = getFilteredFeuilles();
            return filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((feuille) => (
                  <div 
                    key={feuille.id}
                    className="p-4 bg-white rounded-lg border border-[#E0E0E0] hover:border-[#FF9800] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-[#FF9800] text-white">
                            {new Date(feuille.date).toLocaleDateString('fr-FR', { 
                              weekday: 'short',
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </Badge>
                          <span className="text-sm font-semibold text-[#666666]">
                            {feuille.departement}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-[#4CAF50]">
                            <span className="font-mono font-semibold">{feuille.heureDebut}</span>
                            <span>→</span>
                            <span className="font-mono font-semibold">{feuille.heureFin}</span>
                          </div>
                          <Badge variant="outline" className="border-[#FF9800] text-[#FF9800]">
                            {formaterHeures(feuille.duree)}
                          </Badge>
                        </div>
                        {feuille.notes && (
                          <p className="text-xs text-[#999999] mt-2 italic">
                            {feuille.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-[#E0E0E0] mx-auto mb-3" />
                <p className="text-[#999999] italic">
                  {formData.feuillesTemps && formData.feuillesTemps.length > 0 
                    ? 'Aucune heure dans cette période' 
                    : 'Aucune heure enregistrée'}
                </p>
              </div>
            );
          })()}
        </div>
      </CollapsibleSection>

      {/* Section: Notes */}
      <CollapsibleSection
        title={`Notes (${formData.notes?.length || 0})`}
        expanded={notesExpanded}
        onToggle={() => setNotesExpanded(!notesExpanded)}
        icon={StickyNote}
        headerColor="#9C27B0"
      >
        <div className="space-y-4">
          {/* Bouton ajouter note */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="border-[#9C27B0] text-[#9C27B0] hover:bg-[#9C27B0] hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAddingNote ? 'Annuler' : 'Ajouter une note'}
            </Button>
          </div>

          {/* Formulaire d'ajout */}
          {isAddingNote && (
            <div className="p-4 bg-[#F3E5F5] rounded-lg border border-[#9C27B0]">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Écrire une nouvelle note..."
                className="min-h-[100px] mb-3 border-[#9C27B0] focus:border-[#9C27B0] focus:ring-[#9C27B0] bg-white"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#9C27B0] hover:bg-[#7B1FA2] text-white"
                  onClick={handleAddNote}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Liste des notes */}
          {formData.notes && formData.notes.length > 0 ? (
            <div className="space-y-3">
              {formData.notes.map((note) => (
                <div 
                  key={note.id}
                  className="p-4 bg-white rounded-lg border border-[#E0E0E0] hover:border-[#9C27B0] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[#333333] whitespace-pre-wrap">{note.text}</p>
                      <p className="text-xs text-[#999999] mt-2">
                        {new Date(note.date).toLocaleDateString('fr-FR', { 
                          day: 'numeric',
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-[#DC3545] hover:text-[#DC3545] hover:bg-[#FFEBEE]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <StickyNote className="w-12 h-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-[#999999] italic">Aucune note enregistrée</p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Section: Documents */}
      <CollapsibleSection
        title={`Documents (${formData.documents?.length || 0})`}
        expanded={documentsExpanded}
        onToggle={() => setDocumentsExpanded(!documentsExpanded)}
        icon={FileText}
        headerColor="#FF5722"
      >
        <div className="space-y-4">
          {/* Bouton ajouter document en mode édition */}
          {isEditing && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => documentInputRef.current?.click()}
                className="border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un document
              </Button>
              <input
                ref={documentInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                className="hidden"
                multiple
                onChange={handleAddDocument}
              />
            </div>
          )}

          {formData.documents && formData.documents.length > 0 ? (
            <div className="space-y-3">
              {formData.documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-4 bg-white rounded-lg border border-[#E0E0E0] hover:border-[#FF5722] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#FFF3E0] flex items-center justify-center">
                      <File className="w-5 h-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#333333]">{doc.nom}</p>
                      <p className="text-xs text-[#666666]">
                        {doc.type} • {doc.taille} • {new Date(doc.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                      title="Voir le document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.url;
                        link.download = doc.nom;
                        link.click();
                      }}
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Voulez-vous vraiment supprimer "${doc.nom}" ?`)) {
                            handleRemoveDocument(doc.id);
                          }
                        }}
                        className="text-[#DC3545] hover:text-[#DC3545] hover:bg-[#FFEBEE]"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-[#999999] italic mb-4">Aucun document attaché</p>
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => documentInputRef.current?.click()}
                    className="border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Télécharger un document
                  </Button>
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept="application/pdf,image/jpeg,image/jpg,image/png"
                    className="hidden"
                    multiple
                    onChange={handleAddDocument}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Formats: PDF, JPG, PNG • Taille max: 5MB
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Section: Activité */}
      <CollapsibleSection
        title={`Historique d'activité (${formData.historiqueActivite?.length || 0})`}
        expanded={activiteExpanded}
        onToggle={() => setActiviteExpanded(!activiteExpanded)}
        icon={Activity}
        headerColor="#607D8B"
      >
        <HistoriqueActivite
          evenements={formData.historiqueActivite || []}
          onAjouterEvenement={(evt) => {
            setFormData({
              ...formData,
              historiqueActivite: [...(formData.historiqueActivite || []), evt]
            });
          }}
          isEditing={isEditing}
        />
      </CollapsibleSection>

      {/* Styles pour l'impression */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}