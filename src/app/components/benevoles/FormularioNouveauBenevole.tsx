import React, { useState, useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Users,
  Camera,
  User,
  Phone,
  Briefcase,
  Calendar,
  FileUp,
  Upload,
  Settings as SettingsIcon,
  X,
  UserPlus,
  UserCheck,
  Building2,
  Award,
  Star,
  Heart,
  Crown,
  Sparkles,
  Mail,
  MapPin,
  FileText,
  Trash2,
  Download,
  Languages,
  Plus,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { LanguageSelector } from '../ui/language-selector';
import { Checkbox } from '../ui/checkbox';
import { TaskSelector } from '../ui/task-selector';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { obtenerDepartamentos, type Departamento } from '../../utils/departamentosStorage';

// Tipo para tipos de bénévole personalizados
interface TipoBenevolePersonalizado {
  id: string;
  code: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  dateCreated: string;
}

// Mapeo de iconos disponibles
const ICON_MAP: Record<string, any> = {
  Heart, UserCheck, Briefcase, Award, Crown, Star,
  User, Users, UserPlus, Building2, Phone, Mail,
  Sparkles, Calendar, FileText, MapPin, Trash2,
  Download, Languages, Plus, Edit2, SettingsIcon
};

// Iconos disponibles para selección
const ICONOS_DISPONIBLES = [
  'Heart', 'UserCheck', 'Briefcase', 'Award', 'Crown', 'Star',
  'User', 'Users', 'UserPlus', 'Building2', 'Sparkles'
];

// Colores disponibles para tipos
const COLORES_DISPONIBLES = [
  { name: 'Vert', value: '#2d9561', bg: '#2d956115' },
  { name: 'Bleu', value: '#3B82F6', bg: '#3B82F615' },
  { name: 'Violet', value: '#8B5CF6', bg: '#8B5CF615' },
  { name: 'Orange', value: '#F59E0B', bg: '#F59E0B15' },
  { name: 'Rouge', value: '#EF4444', bg: '#EF444415' },
  { name: 'Rose', value: '#EC4899', bg: '#EC489915' },
  { name: 'Indigo', value: '#6366F1', bg: '#6366F115' },
  { name: 'Gris', value: '#6B7280', bg: '#6B728015' },
  { name: 'Cyan', value: '#06B6D4', bg: '#06B6D415' },
  { name: 'Jaune', value: '#EAB308', bg: '#EAB30815' }
];

// Función auxiliar para obtener componente de icono
const getIconComponent = (iconName: string) => {
  return ICON_MAP[iconName] || User;
};

// Utilidades de localStorage para tipos de bénévoles (específicos por departamento)
const DEPARTAMENTO_ID = 'benevoles'; // ID único del departamento Bénévoles

const getStorageKey = (deptId: string) => `ba_tipos_contacto_dept_${deptId}`;
const getInitializedKey = (deptId: string) => `ba_tipos_contacto_dept_${deptId}_initialized`;

// Tipos predefinidos por defecto para el departamento Bénévoles
const TIPOS_PREDEFINIDOS_BENEVOLES = [
  { code: 'benevole', label: 'Bénévole', icon: 'Heart', color: '#2d9561', bgColor: '#2d956115' },
  { code: 'stagiaire', label: 'Stagiaire', icon: 'UserCheck', color: '#3B82F6', bgColor: '#3B82F615' },
  { code: 'employe', label: 'Employé', icon: 'Briefcase', color: '#8B5CF6', bgColor: '#8B5CF615' },
  { code: 'coordinateur', label: 'Coordinateur', icon: 'Award', color: '#F59E0B', bgColor: '#F59E0B15' },
  { code: 'responsable', label: 'Responsable', icon: 'Crown', color: '#EF4444', bgColor: '#EF444415' },
  { code: 'autre', label: 'Autre', icon: 'Star', color: '#6B7280', bgColor: '#6B728015' }
];

const inicializarTiposPredefinidos = (deptId: string) => {
  const initialized = localStorage.getItem(getInitializedKey(deptId));
  if (!initialized) {
    const tiposIniciales: TipoBenevolePersonalizado[] = TIPOS_PREDEFINIDOS_BENEVOLES.map((tipo) => ({
      ...tipo,
      id: `${deptId}-predefinido-${tipo.code}`,
      dateCreated: new Date().toISOString()
    }));
    localStorage.setItem(getStorageKey(deptId), JSON.stringify(tiposIniciales));
    localStorage.setItem(getInitializedKey(deptId), 'true');
  }
};

const obtenerTiposBenevoles = (deptId: string = DEPARTAMENTO_ID): TipoBenevolePersonalizado[] => {
  try {
    inicializarTiposPredefinidos(deptId);
    const stored = localStorage.getItem(getStorageKey(deptId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al obtener tipos de bénévoles:', error);
    return [];
  }
};

const guardarTiposBenevoles = (tipos: TipoBenevolePersonalizado[], deptId: string = DEPARTAMENTO_ID) => {
  try {
    localStorage.setItem(getStorageKey(deptId), JSON.stringify(tipos));
  } catch (error) {
    console.error('Error al guardar tipos de bénévoles:', error);
  }
};

const agregarTipoBenevole = (tipo: Omit<TipoBenevolePersonalizado, 'id' | 'dateCreated'>, deptId: string = DEPARTAMENTO_ID) => {
  const tipos = obtenerTiposBenevoles(deptId);
  const nuevoTipo: TipoBenevolePersonalizado = {
    ...tipo,
    id: `${deptId}-tipo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dateCreated: new Date().toISOString()
  };
  tipos.push(nuevoTipo);
  guardarTiposBenevoles(tipos, deptId);
  return nuevoTipo;
};

const actualizarTipoBenevole = (id: string, datos: Partial<TipoBenevolePersonalizado>, deptId: string = DEPARTAMENTO_ID) => {
  const tipos = obtenerTiposBenevoles(deptId);
  const index = tipos.findIndex(t => t.id === id);
  if (index !== -1) {
    tipos[index] = { ...tipos[index], ...datos };
    guardarTiposBenevoles(tipos, deptId);
    return true;
  }
  return false;
};

const eliminarTipoBenevole = (id: string, deptId: string = DEPARTAMENTO_ID) => {
  const tipos = obtenerTiposBenevoles(deptId);
  const nuevosTipos = tipos.filter(t => t.id !== id);
  guardarTiposBenevoles(nuevosTipos, deptId);
};

const existeCodigoTipoBenevole = (code: string, excludeId?: string, deptId: string = DEPARTAMENTO_ID): boolean => {
  const tipos = obtenerTiposBenevoles(deptId);
  return tipos.some(t => t.code === code && t.id !== excludeId);
};

export type TipoBenevole = 'benevole' | 'stagiaire' | 'employe' | 'coordinateur' | 'responsable' | 'autre';

interface DisponibilidadSemanal {
  jour: string;
  am: boolean;
  pm: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  url: string;
}

interface FormData {
  tipo: TipoBenevole;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  departement: string[];
  dateNaissance: string;
  sexe: 'Homme' | 'Femme' | 'Autre' | 'Non spécifié';
  statut: 'actif' | 'inactif' | 'en pause' | 'en attente'; // AGREGADO
  adresse?: string;
  appartement?: string;
  ville?: string;
  codePostal?: string;
  heuresSemaines?: number;
  reference?: string;
  notasGenerales?: string;
  langues?: string[];
  disponibilidadesSemanal?: DisponibilidadSemanal[];
  poste: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaRelacion?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaEmail?: string;
  documents?: Document[];
}

interface FormularioNouveauBenevoleProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSave: () => void;
  departements: string[];
  photoPreview: string | null;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getTipoBenevoleConfig: (tipo: TipoBenevole) => {
    icon: React.ComponentType<any>;
    label: string;
    color: string;
    bgColor: string;
  };
  onOpenGestionTiposContacto?: () => void;
  isEditMode?: boolean; // Nuevo: indica si está en modo edición
  benevoleId?: number; // Nuevo: ID del bénévole que se está editando
}

export function FormularioNouveauBenevole({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSave,
  departements,
  photoPreview,
  onPhotoChange,
  getTipoBenevoleConfig,
  onOpenGestionTiposContacto,
  isEditMode = false,
  benevoleId
}: FormularioNouveauBenevoleProps) {
  const branding = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para el dialog de gestión de tipos
  const [dialogGestionTiposOpen, setDialogGestionTiposOpen] = useState(false);
  const [dialogEditarTipo, setDialogEditarTipo] = useState(false);
  const [tiposBenevoles, setTiposBenevoles] = useState<TipoBenevolePersonalizado[]>([]);
  const [tipoEditando, setTipoEditando] = useState<TipoBenevolePersonalizado | null>(null);
  const [nuevoTipo, setNuevoTipo] = useState({
    code: '',
    label: '',
    icon: 'Heart',
    color: branding.primaryColor,
    bgColor: `${branding.primaryColor}15`
  });

  // Cargar tipos al abrir el dialog y cuando se actualiza el estado
  React.useEffect(() => {
    if (dialogGestionTiposOpen || isOpen) {
      setTiposBenevoles(obtenerTiposBenevoles());
    }
  }, [dialogGestionTiposOpen, isOpen]);

  const limpiarFormularioTipo = () => {
    setNuevoTipo({
      code: '',
      label: '',
      icon: 'Heart',
      color: branding.primaryColor,
      bgColor: `${branding.primaryColor}15`
    });
    setTipoEditando(null);
  };

  const abrirNuevoTipo = () => {
    limpiarFormularioTipo();
    setDialogEditarTipo(true);
  };

  const abrirEditarTipo = (tipo: TipoBenevolePersonalizado) => {
    setTipoEditando(tipo);
    setNuevoTipo({
      code: tipo.code,
      label: tipo.label,
      icon: tipo.icon,
      color: tipo.color,
      bgColor: tipo.bgColor
    });
    setDialogEditarTipo(true);
  };

  const handleGuardarTipo = () => {
    // Validaciones
    if (!nuevoTipo.code.trim()) {
      toast.error('Le code est requis');
      return;
    }
    if (!nuevoTipo.label.trim()) {
      toast.error('Le libellé est requis');
      return;
    }

    // Verificar código duplicado
    if (existeCodigoTipoBenevole(nuevoTipo.code, tipoEditando?.id)) {
      toast.error('Ce code existe déjà');
      return;
    }

    if (tipoEditando) {
      // Actualizar tipo existente
      actualizarTipoBenevole(tipoEditando.id, nuevoTipo);
      toast.success(`✅ Type "${nuevoTipo.label}" mis à jour avec succès`);
    } else {
      // Crear nuevo tipo
      agregarTipoBenevole(nuevoTipo);
      toast.success(`✅ Type "${nuevoTipo.label}" créé avec succès`);
    }

    // Recargar lista inmediatamente
    const tiposActualizados = obtenerTiposBenevoles();
    setTiposBenevoles(tiposActualizados);
    setDialogEditarTipo(false);
    limpiarFormularioTipo();
  };

  const handleEliminarTipo = (tipo: TipoBenevolePersonalizado) => {
    if (confirm(`⚠️ Voulez-vous vraiment supprimer le type "${tipo.label}" ?\n\nCette action est irréversible.`)) {
      eliminarTipoBenevole(tipo.id);
      const tiposActualizados = obtenerTiposBenevoles();
      setTiposBenevoles(tiposActualizados);
      toast.success(`✅ Type "${tipo.label}" supprimé avec succès`);
    }
  };

  const updateDisponibilidad = (index: number, period: 'am' | 'pm', value: boolean) => {
    if (!formData.disponibilidadesSemanal) return;
    
    const newDisponibilidades = formData.disponibilidadesSemanal.map((dia, i) => {
      if (i === index) {
        return {
          ...dia,
          [period]: value
        };
      }
      return dia;
    });
    
    onFormChange({ 
      ...formData, 
      disponibilidadesSemanal: newDisponibilidades 
    });
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
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          url: event.target?.result as string
        };

        onFormChange({
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
    e.target.value = '';
  };

  const handleRemoveDocument = (documentId: string) => {
    if (!formData.documents) return;
    
    onFormChange({
      ...formData,
      documents: formData.documents.filter(doc => doc.id !== documentId)
    });
    
    toast.success('Document supprimé avec succès');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh] overflow-hidden p-0 m-0 rounded-xl"
        aria-describedby="nouveau-benevole-description"
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              {isEditMode ? (
                <>
                  <Edit2 className="w-5 h-5 inline mr-2" />
                  Modifier le bénévole
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 inline mr-2" />
                  Enregistrer un nouveau bénévole
                </>
              )}
            </DialogTitle>
            <DialogDescription id="nouveau-benevole-description" className="sr-only">
              {isEditMode 
                ? "Formulaire de modification d'un bénévole avec informations personnelles, contact, et professionnelles"
                : "Formulaire d'enregistrement d'un nouveau bénévole avec informations personnelles, contact, et professionnelles"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda: Foto y Tipo */}
            <div className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin">
              {/* Photo de Profil */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">Photo</h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-full border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-8 w-8"
                      style={{ backgroundColor: branding.primaryColor }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPhotoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Type de Bénévole */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#666666] uppercase tracking-wide">Type</h4>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDialogGestionTiposOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors group"
                    title="Gérer les types de contact"
                  >
                    <SettingsIcon className="w-4 h-4 text-gray-500 group-hover:text-[#1a4d7a] group-hover:rotate-90 transition-all duration-300" />
                  </button>
                </div>
                <div className="space-y-2">
                  {tiposBenevoles.length > 0 ? (
                    tiposBenevoles.map((tipo) => {
                      const Icon = getIconComponent(tipo.icon);
                      const isSelected = formData.tipo === tipo.code;
                      return (
                        <div
                          key={tipo.id}
                          onClick={() => onFormChange({ ...formData, tipo: tipo.code as TipoBenevole })}
                          className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected ? 'ring-2 ring-offset-2 shadow-lg scale-105' : 'hover:scale-102'
                          }`}
                          style={{
                            borderColor: isSelected ? tipo.color : '#E0E0E0',
                            backgroundColor: isSelected ? tipo.bgColor : 'white',
                            ringColor: tipo.color,
                            boxShadow: isSelected ? `0 4px 12px ${tipo.color}40` : undefined
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className={`p-1.5 rounded-full transition-all ${isSelected ? 'scale-110' : ''}`}
                              style={{ backgroundColor: isSelected ? 'white' : tipo.bgColor }}
                            >
                              <Icon className="w-4 h-4" style={{ color: tipo.color }} />
                            </div>
                            <span className={`text-xs font-medium leading-tight ${isSelected ? 'font-bold' : ''}`} style={{ color: isSelected ? tipo.color : '#333333' }}>
                              {tipo.label}
                            </span>
                            {isSelected && (
                              <div className="ml-auto">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: tipo.color }}>
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-xs">Aucun type disponible</p>
                      <p className="text-xs mt-1">Cliquez sur ⚙️ pour créer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
                  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <User className="w-4 h-4 mr-2" />
                    Base
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="pro" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Professionnel
                  </TabsTrigger>
                  <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Autres
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prenom" className="text-xs">Prénom *</Label>
                        <Input
                          id="prenom"
                          value={formData.prenom}
                          onChange={(e) => onFormChange({ ...formData, prenom: e.target.value })}
                          placeholder="Jean"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nom" className="text-xs">Nom de famille *</Label>
                        <Input
                          id="nom"
                          value={formData.nom}
                          onChange={(e) => onFormChange({ ...formData, nom: e.target.value })}
                          placeholder="Dupont"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateNaissance" className="text-xs">Date de naissance</Label>
                        <Input
                          id="dateNaissance"
                          type="date"
                          value={formData.dateNaissance}
                          onChange={(e) => onFormChange({ ...formData, dateNaissance: e.target.value })}
                          className="h-9"
                          placeholder="AAAA-MM-JJ"
                          title="Vous pouvez écrire directement l'année (ex: 1985-03-15)"
                          lang="fr-CA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sexe" className="text-xs">Genre</Label>
                        <Select
                          value={formData.sexe}
                          onValueChange={(value: any) => onFormChange({ ...formData, sexe: value })}
                        >
                          <SelectTrigger id="sexe" className="h-9">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Homme">Homme</SelectItem>
                            <SelectItem value="Femme">Femme</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                            <SelectItem value="Non spécifié">Non spécifié</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Langues */}
                    <div>
                      <Label className="text-xs mb-1.5 block">Langues parlées</Label>
                      <LanguageSelector
                        selectedLanguages={formData.langues || []}
                        onChange={(langues) => onFormChange({ ...formData, langues })}
                      />
                    </div>

                    {/* 🎯 DÉPARTEMENTS - Sección destacada y visible */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 rounded-xl p-4 mt-4" style={{ borderColor: branding.primaryColor }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5" style={{ color: branding.primaryColor }} />
                        <Label className="text-sm font-bold text-[#333333] m-0" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Départements Assignés
                          <span className="text-red-500 ml-1">*</span>
                          {formData.departement && formData.departement.length > 0 && (
                            <span 
                              className="ml-2 px-2 py-0.5 rounded-full text-white font-bold text-xs"
                              style={{ backgroundColor: branding.primaryColor }}
                            >
                              {formData.departement.length} sélectionné{formData.departement.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </Label>
                      </div>
                      
                      <p className="text-xs text-[#666666] mb-3 italic">
                        <span className="text-red-500 font-semibold">* Obligatoire</span> - Sélectionnez au moins un département où ce bénévole travaillera
                      </p>
                      
                      {/* Pills de departamentos */}
                      <div className="flex flex-wrap gap-2">
                        {obtenerDepartamentos()
                          .filter(dept => dept.activo)
                          .sort((a, b) => a.orden - b.orden)
                          .map(dept => {
                            const isSelected = formData.departement.includes(dept.id);
                            return (
                              <button
                                key={dept.id}
                                type="button"
                                onClick={() => {
                                  const newDepartements = isSelected
                                    ? formData.departement.filter(id => id !== dept.id)
                                    : [...formData.departement, dept.id];
                                  onFormChange({ ...formData, departement: newDepartements });
                                }}
                                className={`
                                  px-3 py-2 rounded-lg transition-all duration-200 font-semibold text-xs
                                  ${isSelected 
                                    ? 'ring-2 ring-offset-2 shadow-md scale-105' 
                                    : 'hover:ring-2 hover:ring-offset-1 border-2 hover:scale-102'
                                  }
                                `}
                                style={{
                                  backgroundColor: isSelected ? dept.color : 'white',
                                  borderColor: dept.color,
                                  color: isSelected ? 'white' : dept.color,
                                  ringColor: dept.color,
                                  fontFamily: 'Montserrat, sans-serif'
                                }}
                              >
                                {isSelected && <span className="mr-1">✓</span>}
                                {dept.nombre}
                              </button>
                            );
                          })}
                      </div>
                      
                      {/* Mensaje de ayuda */}
                      {(!formData.departement || formData.departement.length === 0) && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                          <span className="text-yellow-600 text-lg">⚠️</span>
                          <p className="text-xs text-yellow-800">
                            Veuillez sélectionner au moins un département pour ce bénévole
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Contact */}
                <TabsContent value="contact" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-6">
                    {/* Información General de Contacto */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Phone className="w-4 h-4 text-[#1a4d7a]" />
                        <h4 className="font-semibold text-sm text-[#333333]">
                          Contact Général
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="text-xs">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                            placeholder="exemple@email.com"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telephone" className="text-xs">Téléphone</Label>
                          <Input
                            id="telephone"
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => onFormChange({ ...formData, telephone: e.target.value })}
                            placeholder="+1 (514) 000-0000"
                            className="h-9"
                          />
                        </div>
                      </div>

                      {/* Adresse complète avec autocomplétion */}
                      <div>
                        <Label className="text-xs mb-1.5 block">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Adresse complète
                        </Label>
                        <AddressAutocomplete
                          value={formData.adresse || ''}
                          initialCity={formData.ville || ''}
                          initialPostalCode={formData.codePostal || ''}
                          initialApartment={formData.appartement || ''}
                          initialQuartier={formData.quartier || ''}
                          onChange={(street, details) => {
                            // Mantener los valores existentes si details no los proporciona
                            onFormChange({ 
                              ...formData, 
                              adresse: street,
                              ville: details?.city || formData.ville,
                              codePostal: details?.postalCode || formData.codePostal,
                              appartement: details?.apt || formData.appartement,
                              quartier: details?.quartier || formData.quartier
                            });
                          }}
                          onSelect={(place) => {
                            onFormChange({
                              ...formData,
                              adresse: place.street,
                              ville: place.city,
                              codePostal: place.postalCode,
                              appartement: place.apt || formData.appartement,
                              quartier: place.quartier || ''
                            });
                          }}
                        />
                        {/* Info sobre campos rellenados automáticamente */}
                        {(formData.ville || formData.codePostal) && (
                          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <span className="font-medium">{formData.ville}</span>
                            {formData.ville && formData.codePostal && <span>•</span>}
                            <span className="font-medium">{formData.codePostal}</span>
                          </p>
                        )}
                      </div>

                      {/* Campo de Apartamento */}
                      <div>
                        <Label htmlFor="appartement" className="text-xs">
                          <Building2 className="w-3 h-3 inline mr-1" />
                          Appartement / Unité
                        </Label>
                        <Input
                          id="appartement"
                          value={formData.appartement || ''}
                          onChange={(e) => onFormChange({ ...formData, appartement: e.target.value })}
                          placeholder="Apt 305, Unité B, etc."
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Persona de Contacto de Emergencia */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <User className="w-4 h-4 text-[#2d9561]" />
                        <h4 className="font-semibold text-sm text-[#333333]">
                          Contact d'Urgence
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactoEmergenciaNombre" className="text-xs">
                            <User className="w-3 h-3 inline mr-1" />
                            Nom complet
                          </Label>
                          <Input
                            id="contactoEmergenciaNombre"
                            type="text"
                            value={formData.contactoEmergenciaNombre || ''}
                            onChange={(e) => onFormChange({ ...formData, contactoEmergenciaNombre: e.target.value })}
                            placeholder="Marie Tremblay"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactoEmergenciaRelacion" className="text-xs">
                            <Users className="w-3 h-3 inline mr-1" />
                            Relation
                          </Label>
                          <Input
                            id="contactoEmergenciaRelacion"
                            type="text"
                            value={formData.contactoEmergenciaRelacion || ''}
                            onChange={(e) => onFormChange({ ...formData, contactoEmergenciaRelacion: e.target.value })}
                            placeholder="Conjoint, Parent, Ami..."
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactoEmergenciaTelefono" className="text-xs">
                            <Phone className="w-3 h-3 inline mr-1" />
                            Téléphone
                          </Label>
                          <Input
                            id="contactoEmergenciaTelefono"
                            type="tel"
                            value={formData.contactoEmergenciaTelefono || ''}
                            onChange={(e) => onFormChange({ ...formData, contactoEmergenciaTelefono: e.target.value })}
                            placeholder="+1 (514) 000-0000"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactoEmergenciaEmail" className="text-xs">
                            <Mail className="w-3 h-3 inline mr-1" />
                            Email
                          </Label>
                          <Input
                            id="contactoEmergenciaEmail"
                            type="email"
                            value={formData.contactoEmergenciaEmail || ''}
                            onChange={(e) => onFormChange({ ...formData, contactoEmergenciaEmail: e.target.value })}
                            placeholder="marie.tremblay@email.com"
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Professionnel */}
                <TabsContent value="pro" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="poste" className="text-xs">Poste/Rôle</Label>
                        <Input
                          id="poste"
                          value={formData.poste}
                          onChange={(e) => onFormChange({ ...formData, poste: e.target.value })}
                          placeholder="Bénévole"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="heuresSemaines" className="text-xs">Heures/Semaine</Label>
                        <Input
                          id="heuresSemaines"
                          type="number"
                          value={formData.heuresSemaines || 0}
                          onChange={(e) => onFormChange({ ...formData, heuresSemaines: parseInt(e.target.value) || 0 })}
                          placeholder="20"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reference" className="text-xs">Référence</Label>
                        <Input
                          id="reference"
                          value={formData.reference || ''}
                          onChange={(e) => onFormChange({ ...formData, reference: e.target.value })}
                          placeholder="REF-001"
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Mensaje de référence pour les départements */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-800">
                          <strong>Départements assignés:</strong> {formData.departement && formData.departement.length > 0 ? (
                            <span className="ml-1">
                              {obtenerDepartamentos()
                                .filter(d => formData.departement.includes(d.id))
                                .map(d => d.nombre)
                                .join(', ')}
                            </span>
                          ) : (
                            <span className="ml-1 italic text-gray-500">Aucun département sélectionné</span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-6">
                        💡 Modifier dans l'onglet "Base"
                      </p>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-[#E0E0E0] my-3"></div>

                    {/* Disponibilidades */}
                    <div>
                      <SelecteurJoursDisponibles
                        joursDisponibles={(formData.disponibilidadesSemanal || []).map(dia => ({
                          jour: dia.jour,
                          horaire: dia.am && dia.pm ? 'AM/PM' : dia.am ? 'AM' : dia.pm ? 'PM' : null
                        }))}
                        onChange={(nouveauxJours) => {
                          const newDisponibilidades = nouveauxJours.map(j => ({
                            jour: j.jour,
                            am: j.horaire === 'AM' || j.horaire === 'AM/PM',
                            pm: j.horaire === 'PM' || j.horaire === 'AM/PM'
                          }));
                          // Agregar días faltantes
                          const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                          const allDays = joursSemaine.map(jour => {
                            const existing = newDisponibilidades.find(d => d.jour === jour);
                            return existing || { jour, am: false, pm: false };
                          });
                          onFormChange({ 
                            ...formData, 
                            disponibilidadesSemanal: allDays 
                          });
                        }}
                        showIcon={true}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes" className="text-xs">Notes générales</Label>
                      <Textarea
                        id="notes"
                        value={formData.notasGenerales || ''}
                        onChange={(e) => onFormChange({ ...formData, notasGenerales: e.target.value })}
                        placeholder="Notes additionnelles..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    {/* Sección de documentos */}
                    <div>
                      <Label className="text-xs mb-2 block flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: branding.primaryColor }} />
                        <span className="font-semibold">Documents & Images</span>
                        {formData.documents && formData.documents.length > 0 && (
                          <span 
                            className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                            style={{ backgroundColor: branding.secondaryColor }}
                          >
                            {formData.documents.length}
                          </span>
                        )}
                      </Label>

                      {/* Lista de documentos existentes */}
                      {formData.documents && formData.documents.length > 0 && (
                        <div className="mb-3 space-y-2 max-h-48 overflow-y-auto">
                          {formData.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 border-2 rounded-lg hover:shadow-sm transition-all"
                              style={{ borderColor: '#E0E0E0' }}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div 
                                  className="p-2 rounded-lg"
                                  style={{ backgroundColor: `${branding.primaryColor}15` }}
                                >
                                  <FileText className="w-5 h-5" style={{ color: branding.primaryColor }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-[#333333] truncate" title={doc.name}>
                                    {doc.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                    <span>{formatFileSize(doc.size)}</span>
                                    <span>•</span>
                                    <span>{new Date(doc.uploadDate).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                  onClick={() => window.open(doc.url, '_blank')}
                                  title="Voir le document"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:bg-red-100"
                                  onClick={() => {
                                    if (confirm(`Voulez-vous vraiment supprimer "${doc.name}" ?`)) {
                                      handleRemoveDocument(doc.id);
                                    }
                                  }}
                                  title="Supprimer le document"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Zona de drop/upload */}
                      <div 
                        className="border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:bg-gray-50"
                        style={{ borderColor: '#CCCCCC' }}
                        onClick={() => documentInputRef.current?.click()}
                      >
                        <FileUp 
                          className="w-10 h-10 mx-auto mb-2" 
                          style={{ color: branding.secondaryColor }} 
                        />
                        <h4 className="text-sm font-semibold text-[#666666] mb-1">
                          Ajouter des fichiers
                        </h4>
                        <p className="text-xs text-[#999999] mb-3">
                          Contrats, certificats, photos, attestations...
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          style={{ 
                            borderColor: branding.secondaryColor, 
                            color: branding.secondaryColor 
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            documentInputRef.current?.click();
                          }}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Parcourir
                        </Button>
                        <p className="text-[10px] text-gray-400 mt-2">
                          Formats: PDF, JPG, PNG • Taille max: 5MB
                        </p>
                        <input
                          ref={documentInputRef}
                          type="file"
                          accept="application/pdf,image/jpeg,image/jpg,image/png"
                          className="hidden"
                          multiple
                          onChange={handleAddDocument}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="sticky bottom-0 bg-white border-t-2 border-[#E0E0E0] px-6 py-3 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9"
            >
              Annuler
            </Button>
            <Button
              onClick={onSave}
              className="text-white h-9"
              style={{ backgroundColor: branding.secondaryColor }}
            >
              {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
      
      {/* Dialog de Gestion de Types de Bénévoles */}
      <Dialog open={dialogGestionTiposOpen} onOpenChange={setDialogGestionTiposOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin" aria-describedby="gestion-tipos-benevoles-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Gestion des Types - Département Bénévoles
            </DialogTitle>
            <DialogDescription id="gestion-tipos-benevoles-description">
              Créez, modifiez ou supprimez les types de contact spécifiques au département Bénévoles. Ces types sont indépendants des autres départements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <Button
              onClick={abrirNuevoTipo}
              className="w-full text-white"
              style={{ backgroundColor: branding.secondaryColor }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un nouveau type
            </Button>

            {/* Panel de estadísticas e información */}
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  📋 <strong>Département:</strong> Bénévoles
                </p>
                <p className="text-xs text-blue-600 text-center mt-1">
                  Ces types sont indépendants des autres départements
                </p>
              </div>
              
              {tiposBenevoles.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-3xl font-bold" style={{ color: branding.primaryColor }}>
                    {tiposBenevoles.length}
                  </p>
                  <p className="text-xs text-gray-600">Types disponibles</p>
                </div>
              )}
            </div>

            {/* Lista de todos los tipos (editables y eliminables) */}
            {tiposBenevoles.length > 0 ? (
              <div className="border rounded-lg divide-y">
                <div className="p-2 bg-gradient-to-r from-blue-50 to-green-50">
                  <p className="text-xs font-semibold text-gray-700">Tous les types (modifiables)</p>
                </div>
                {tiposBenevoles.map((tipo) => {
                  const Icon = getIconComponent(tipo.icon);
                  const isPredefinido = tipo.id.startsWith('predefinido-');
                  return (
                    <div key={tipo.id} className="p-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: tipo.bgColor }}>
                          <Icon className="w-5 h-5" style={{ color: tipo.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{tipo.label}</p>
                            {isPredefinido && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                Défaut
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#999999]">Code: {tipo.code}</p>
                          <p className="text-xs text-[#999999]">
                            Créé: {new Date(tipo.dateCreated).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => abrirEditarTipo(tipo)}
                          title="Modifier ce type"
                        >
                          <Edit2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEliminarTipo(tipo)}
                          title="Supprimer ce type"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Aucun type de bénévole</p>
                <p className="text-xs mt-1">Créez votre premier type de bénévole</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear/Editar Tipo */}
      <Dialog open={dialogEditarTipo} onOpenChange={(open) => {
        setDialogEditarTipo(open);
        if (!open) limpiarFormularioTipo();
      }}>
        <DialogContent className="max-w-xl" aria-describedby="editar-tipo-description">
          <DialogHeader>
            <DialogTitle>{tipoEditando ? 'Modifier le type' : 'Créer un nouveau type'}</DialogTitle>
            <DialogDescription id="editar-tipo-description">
              Définissez les propriétés du type de bénévole
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo-code" className="text-xs">Code unique *</Label>
              <Input
                id="tipo-code"
                value={nuevoTipo.code}
                onChange={(e) => setNuevoTipo({ ...nuevoTipo, code: e.target.value })}
                placeholder="benevole-special"
                className="h-9"
                disabled={!!tipoEditando}
              />
              {tipoEditando && (
                <p className="text-xs text-gray-500 mt-1">Le code ne peut pas être modifié</p>
              )}
            </div>

            <div>
              <Label htmlFor="tipo-label" className="text-xs">Étiquette *</Label>
              <Input
                id="tipo-label"
                value={nuevoTipo.label}
                onChange={(e) => setNuevoTipo({ ...nuevoTipo, label: e.target.value })}
                placeholder="Bénévole Spécial"
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Icône</Label>
              <div className="grid grid-cols-8 gap-2">
                {ICONOS_DISPONIBLES.map((iconName) => {
                  const Icon = ICON_MAP[iconName];
                  const isSelected = nuevoTipo.icon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNuevoTipo({ ...nuevoTipo, icon: iconName })}
                      className={`p-2 border-2 rounded-lg hover:shadow-sm transition-all ${
                        isSelected ? 'ring-2' : ''
                      }`}
                      style={{
                        borderColor: isSelected ? nuevoTipo.color : '#E0E0E0',
                        backgroundColor: isSelected ? nuevoTipo.bgColor : 'white',
                        ringColor: nuevoTipo.color
                      }}
                    >
                      <Icon className="w-5 h-5 mx-auto" style={{ color: nuevoTipo.color }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Couleur</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLORES_DISPONIBLES.map((color) => {
                  const isSelected = nuevoTipo.color === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNuevoTipo({ ...nuevoTipo, color: color.value, bgColor: color.bg })}
                      className={`p-3 border-2 rounded-lg hover:shadow-sm transition-all ${
                        isSelected ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        borderColor: color.value,
                        backgroundColor: color.bg,
                        ringColor: color.value
                      }}
                    >
                      <div className="w-full h-4 rounded" style={{ backgroundColor: color.value }} />
                      <p className="text-xs mt-1 font-medium">{color.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogEditarTipo(false);
                  limpiarFormularioTipo();
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleGuardarTipo}
                className="text-white"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                {tipoEditando ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}