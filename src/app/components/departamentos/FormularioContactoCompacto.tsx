/**
 * ====================================================================
 * FORMULARIO: Contacts Départements (Sistema Unificado Multi-Departamento)
 * ====================================================================
 * 
 * MÓDULO: Départements (Sistema Universal)
 * UBICACIÓN: /src/app/components/departamentos/FormularioContactoCompacto.tsx
 * DEPARTAMENTO ID: Variable (según contexto)
 * 
 * DEPARTAMENTOS SOPORTADOS:
 * - '1' → Entrepôt (desde Inventaire > Contactos)
 * - '2' → Comptoir (desde Comptoir > Contactos)
 * - '3' → Cuisine (desde Cuisine > Contactos)
 * - '4' → Liaison (desde Liaison > Contactos)
 * - '5' → PTC (Programa de Trabajo Comunitario)
 * - '6' → Maintien (Mantenimiento)
 * - '7' → Recrutement (Reclutamiento)
 * 
 * USADO EN:
 * - GestionContactosDepartamento.tsx (componente universal)
 * - Cada departamento tiene su propia instancia
 * 
 * TIPOS DE CONTACTO:
 * - Dinámicos y personalizables por departamento
 * - Tipos globales (compartidos entre todos)
 * - Tipos específicos (solo para un departamento)
 * 
 * STORAGE:
 * - Key: 'banqueAlimentaire_contactosDepartamento'
 * - Sistema unificado de contactos
 * 
 * CARACTERÍSTICAS ESPECIALES:
 * - Gestión de tipos de contacto personalizados
 * - Tipos de documentos estandarizados
 * - Sistema de disponibilidad por días (AM/PM)
 * - Historial de actividad completo
 * - Soporte multi-departamento
 * - Gestión de idiomas personalizados
 * - Importar/Exportar configuraciones
 * 
 * PESTAÑAS:
 * - Base (información básica)
 * - Contact (comunicación y dirección)
 * - Professionnel (datos profesionales)
 * - Disponibilités (horarios y disponibilidad)
 * - Documents (archivos adjuntos)
 * - Historique (registro de actividad)
 * 
 * ACCESIBILIDAD:
 * - aria-describedby: "contact-form-description"
 * 
 * VERSIÓN: 2.1
 * ÚLTIMA ACTUALIZACIÓN: 11 marzo 2026
 * ====================================================================
 */

// Formulaire Compacto v2.1
import React, { useRef, useState, useEffect } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Heart,
  Star,
  Building2,
  Stethoscope,
  UserCheck,
  UserPlus,
  Building,
  ShieldCheck,
  Award,
  Crown,
  Zap,
  Sparkles,
  Mail,
  MessageCircle,
  Package,
  Truck,
  FileText,
  Download,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Checkbox } from '../ui/checkbox';
import { LanguageSelector } from '../ui/language-selector';
import { toast } from 'sonner';
import { validateDocumentFile } from '../../utils/fileValidation';
import {
  type ContactoDepartamento,
  type TipoContacto,
  type GeneroContacto
} from '../../utils/contactosDepartamentoStorage';
import {
  obtenerTiposContacto,
  obtenerTiposPersonalizados,
  guardarTipoPersonalizado,
  actualizarTipoPersonalizado,
  eliminarTipoPersonalizado,
  existeCodigoTipo,
  COLORES_DISPONIBLES,
  ICONOS_DISPONIBLES,
  type TipoContactoPersonalizado,
  exportarTiposContacto,
  importarTiposContacto,
  obtenerEstadisticasTipos
} from '../../utils/tiposContactoStorage';
import {
  obtenerTiposDocumento,
  guardarTipoDocumento,
  actualizarTipoDocumento,
  eliminarTipoDocumento,
  existeCodigoTipoDocumento,
  restablecerTiposPredefinidos as restablecerTiposDocumentoPredefinidos,
  guardarConfiguracionActualComoPredeterminada as guardarConfigDocumentoPredeterminada,
  COLORES_DOCUMENTO_DISPONIBLES,
  type TipoDocumento
} from '../../utils/tiposDocumentoStorage';
import { TaskSelector } from '../ui/task-selector';
import { obtenerDepartamentos, type Departamento } from '../../utils/departamentosStorage';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { SelecteurDepartementsMultiple } from '../shared/SelecteurDepartementsMultiple';

interface FormularioContactoCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: Omit<ContactoDepartamento, 'id'>;
  setFormulario: React.Dispatch<React.SetStateAction<Omit<ContactoDepartamento, 'id'>>>;
  modoEdicion: boolean;
  onGuardar: () => void;
  fotoPreview: string | null;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getTipoConfig: (tipo: TipoContacto) => {
    color: string;
    icon: any;
    label: string;
    bgColor: string;
  };
  updateDisponibilidad: (index: number, field: 'am' | 'pm', value: boolean) => void;
  tiposPermitidos: TipoContacto[];
  departamentoId?: string; // Nuevo: para identificar el departamento
  departamentoNombre?: string; // Nuevo: nombre del departamento para mostrar
  contactoId?: string; // ✅ NUEVO: ID del contacto en modo edición para forzar reinicialización de componentes
}

// Mapeo de iconos
const ICON_MAP: Record<string, any> = {
  User, UserCheck, UserPlus, Users, Heart, Star,
  Building, Building2, Briefcase, Stethoscope,
  ShieldCheck, Award, Crown, Zap, Sparkles,
  Phone, Mail, MessageCircle, Package, Truck,
  FileText, Download
};

export function FormularioContactoCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  modoEdicion,
  onGuardar,
  fotoPreview,
  onFotoChange,
  getTipoConfig,
  updateDisponibilidad,
  tiposPermitidos,
  departamentoId, // Nuevo parámetro
  departamentoNombre = 'Département', // Nuevo parámetro con valor por defecto
  contactoId // ✅ NUEVO: ID del contacto en modo edición
}: FormularioContactoCompactoProps) {
  const branding = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Estados para gestión de tipos
  const [tiposContacto, setTiposContacto] = useState<TipoContactoPersonalizado[]>([]);
  const [dialogGestionTipos, setDialogGestionTipos] = useState(false);
  const [dialogEditarTipo, setDialogEditarTipo] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoContactoPersonalizado | null>(null);
  const [nuevoTipo, setNuevoTipo] = useState({
    code: '',
    label: '',
    icon: 'User',
    color: branding.primaryColor,
    bgColor: '#DBEAFE'
  });
  const [tipoEsGlobal, setTipoEsGlobal] = useState(false); // NUEVO: Controlar si el tipo es global

  // Estados para gestión de tipos de documentos
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [dialogGestionDocumentos, setDialogGestionDocumentos] = useState(false);
  const [dialogEditarDocumento, setDialogEditarDocumento] = useState(false);
  const [documentoEditando, setDocumentoEditando] = useState<TipoDocumento | null>(null);
  const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState({
    code: '',
    label: '',
    icon: '📄',
    color: branding.primaryColor,
    bgColor: '#E3F2FD',
    description: ''
  });
  const [dialogSeleccionarTipo, setDialogSeleccionarTipo] = useState(false);
  const [archivosPendientes, setArchivosPendientes] = useState<File[]>([]);

  // Estados para exportación/importación de tipos
  const [dialogExportarImportar, setDialogExportarImportar] = useState(false);
  const [jsonImportar, setJsonImportar] = useState('');

  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState('base');

  // Efecto para resetear la pestaña activa cuando se abre el diálogo
  useEffect(() => {
    if (abierto) {
      setActiveTab('base');
    }
  }, [abierto]);

  // Efecto para forzar cambio de pestaña cuando se selecciona Donador
  useEffect(() => {
    if (formulario.tipo === 'donador' && (activeTab === 'pro' || activeTab === 'autres')) {
      setActiveTab('base');
    }
  }, [formulario.tipo, activeTab]);

  useEffect(() => {
    cargarTipos();
    cargarTiposDocumento();
  }, [tiposPermitidos]);

  const cargarTipos = () => {
    // Cargar tipos globales + específicos del departamento
    const tipos = obtenerTiposContacto(departamentoId);
    // NO filtrar aquí - mostrar todos los tipos disponibles
    setTiposContacto(tipos);
  };

  const limpiarFormularioTipo = () => {
    setNuevoTipo({
      code: '',
      label: '',
      icon: 'User',
      color: branding.primaryColor,
      bgColor: '#DBEAFE'
    });
    setTipoEditando(null);
    setTipoEsGlobal(false); // Reset al estado por defecto (específico del departamento)
  };

  const abrirNuevoTipo = () => {
    limpiarFormularioTipo();
    setDialogEditarTipo(true);
  };

  const abrirEditarTipo = (tipo: TipoContactoPersonalizado) => {
    setTipoEditando(tipo);
    setNuevoTipo({
      code: tipo.code,
      label: tipo.label,
      icon: tipo.icon,
      color: tipo.color,
      bgColor: tipo.bgColor
    });
    setTipoEsGlobal(!tipo.departamentoId); // Establecer si es global o del departamento
    setDialogEditarTipo(true);
  };

  const handleGuardarTipo = () => {
    if (!nuevoTipo.code.trim() || !nuevoTipo.label.trim()) {
      toast.error('Le code et l\'étiquette sont obligatoires');
      return;
    }

    if (existeCodigoTipo(nuevoTipo.code, departamentoId, tipoEditando?.id)) {
      toast.error('Ce code existe déjà');
      return;
    }

    if (tipoEditando) {
      // Editar tipo existente
      actualizarTipoPersonalizado(tipoEditando.id, nuevoTipo);
      toast.success('Type mis à jour avec succès');
    } else {
      // Crear nuevo tipo: global o específico del departamento
      const deptoId = tipoEsGlobal ? undefined : departamentoId;
      guardarTipoPersonalizado(nuevoTipo, deptoId);
      const scope = tipoEsGlobal ? 'global' : `pour ${departamentoNombre}`;
      toast.success(`Type créé avec succès (${scope})`);
    }

    cargarTipos();
    setDialogEditarTipo(false);
    limpiarFormularioTipo();
  };

  const handleEliminarTipo = (tipo: TipoContactoPersonalizado) => {
    if (tipo.isPredefined) {
      // Eliminar de tipos predefinidos requiere actualizar el storage de predefinidos
      eliminarTipoPersonalizado(tipo.id);
    } else {
      eliminarTipoPersonalizado(tipo.id);
    }
    toast.success('Type supprimé avec succès');
    cargarTipos();
  };

  const getIconComponent = (iconName: string) => {
    return ICON_MAP[iconName] || User;
  };

  // Funciones para gestión de tipos de documentos
  const cargarTiposDocumento = () => {
    const tipos = obtenerTiposDocumento();
    setTiposDocumento(tipos);
  };

  const limpiarFormularioTipoDocumento = () => {
    setNuevoTipoDocumento({
      code: '',
      label: '',
      icon: '📄',
      color: branding.primaryColor,
      bgColor: '#E3F2FD',
      description: ''
    });
    setDocumentoEditando(null);
  };

  const abrirNuevoTipoDocumento = () => {
    limpiarFormularioTipoDocumento();
    setDialogEditarDocumento(true);
  };

  const abrirEditarTipoDocumento = (tipo: TipoDocumento) => {
    setDocumentoEditando(tipo);
    setNuevoTipoDocumento({
      code: tipo.code,
      label: tipo.label,
      icon: tipo.icon,
      color: tipo.color,
      bgColor: tipo.bgColor,
      description: tipo.description || ''
    });
    setDialogEditarDocumento(true);
  };

  const handleGuardarTipoDocumento = () => {
    if (!nuevoTipoDocumento.code.trim() || !nuevoTipoDocumento.label.trim()) {
      toast.error('Le code et l\'étiquette sont obligatoires');
      return;
    }

    if (existeCodigoTipoDocumento(nuevoTipoDocumento.code, documentoEditando?.id)) {
      toast.error('Ce code existe déjà');
      return;
    }

    if (documentoEditando) {
      // Editar tipo existente - ESTO AFECTARÁ TODOS LOS DOCUMENTOS DE ESTE TIPO
      actualizarTipoDocumento(documentoEditando.id, nuevoTipoDocumento);
      toast.success('Type de document mis à jour. Tous les documents de ce type ont été actualisés.');
    } else {
      // Crear nuevo tipo
      guardarTipoDocumento(nuevoTipoDocumento);
      toast.success('Type de document créé avec succès');
    }

    cargarTiposDocumento();
    setDialogEditarDocumento(false);
    limpiarFormularioTipoDocumento();
  };

  const handleEliminarTipoDocumento = (tipo: TipoDocumento) => {
    if (confirm(`Voulez-vous vraiment supprimer le type "${tipo.label}" ?\n\nATTENTION: Les documents existants de ce type ne seront plus synchronisés.`)) {
      eliminarTipoDocumento(tipo.id);
      toast.success('Type de document supprimé');
      cargarTiposDocumento();
    }
  };

  // Funciones para manejo de documentos
  const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      // ✅ Validar usando utilidad centralizada
      if (validateDocumentFile(file, allowedTypes)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      // Guardar archivos pendientes y abrir dialog de selección de tipo
      setArchivosPendientes(validFiles);
      setDialogSeleccionarTipo(true);
    }

    // Reset input
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleConfirmarTipoDocumento = (tipoSeleccionado: TipoDocumento) => {
    archivosPendientes.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDocument = {
          nom: file.name,
          tipo: tipoSeleccionado.code,
          tipoLabel: tipoSeleccionado.label,
          tipoColor: tipoSeleccionado.color,
          tipoBgColor: tipoSeleccionado.bgColor,
          tipoIcon: tipoSeleccionado.icon,
          url: event.target?.result as string,
          date: new Date().toISOString()
        };

        setFormulario({
          ...formulario,
          documents: [...(formulario.documents || []), newDocument]
        });

        toast.success(`Document "${file.name}" ajouté comme "${tipoSeleccionado.label}"`);
      };

      reader.onerror = () => {
        toast.error('Erreur lors de la lecture du fichier');
      };

      reader.readAsDataURL(file);
    });

    setArchivosPendientes([]);
    setDialogSeleccionarTipo(false);
  };

  const handleRemoveDocument = (index: number) => {
    if (!formulario.documents) return;
    
    const updatedDocuments = formulario.documents.filter((_, i) => i !== index);
    setFormulario({
      ...formulario,
      documents: updatedDocuments
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

  // Funciones para exportar/importar tipos
  const handleExportarTipos = () => {
    const json = exportarTiposContacto();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tipos-contacto-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Types de contact exportés avec succès');
  };

  const handleImportarTipos = (sobrescribir: boolean) => {
    if (!jsonImportar.trim()) {
      toast.error('Veuillez coller le JSON à importer');
      return;
    }

    const resultado = importarTiposContacto(jsonImportar, sobrescribir);
    
    if (resultado.success) {
      toast.success(resultado.message);
      cargarTipos();
      setDialogExportarImportar(false);
      setJsonImportar('');
    } else {
      toast.error(resultado.message);
    }
  };

  const handleMostrarEstadisticas = () => {
    const stats = obtenerEstadisticasTipos();
    const mensaje = `
📊 Statistiques des Types de Contact:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Total: ${stats.total} types
🔒 Prédéfinis: ${stats.predefinidos} types
✏️ Personnalisés: ${stats.personalizados} types
${stats.fechaCreacionMasAntigua ? `\n📅 Plus ancien: ${new Date(stats.fechaCreacionMasAntigua).toLocaleDateString('fr-FR')}` : ''}
${stats.fechaCreacionMasReciente ? `📅 Plus récent: ${new Date(stats.fechaCreacionMasReciente).toLocaleDateString('fr-FR')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 Tous les types sont sauvegardés de manière permanente dans le localStorage.
    `.trim();
    
    alert(mensaje);
  };

  // Función para determinar si una pestaña debe mostrarse según el tipo de contacto
  const mostrarPestana = (pestana: 'base' | 'contact' | 'pro' | 'autres'): boolean => {
    // Para Donador: SOLO mostrar Base y Contact
    if (formulario.tipo === 'donador') {
      return ['base', 'contact'].includes(pestana);
    }
    
    // Para todos los demás tipos: mostrar todas las pestañas
    return true;
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="w-full h-full sm:w-screen sm:h-screen md:w-screen md:h-screen max-w-none overflow-hidden p-0 m-0 rounded-none"
        aria-describedby="contact-form-description"
      >
        <div className="h-screen w-screen flex flex-col overflow-hidden">
          <DialogHeader className="flex-none bg-white border-b-2 border-[#E0E0E0] px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-sm z-10">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-base sm:text-lg md:text-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              {modoEdicion ? 'Modifier le contact' : 'Enregistrer un nouveau contact'}
            </DialogTitle>
            <DialogDescription id="contact-form-description" className="text-xs text-gray-500 mt-1">
              {modoEdicion ? 'Modifier les informations du contact' : 'Formulaire d\'enregistrement d\'un nouveau contact'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Sidebar izquierda: Foto y Tipo */}
            <div className="flex-none w-full md:w-64 lg:w-72 border-b-2 md:border-b-0 md:border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-3 sm:p-4 overflow-y-auto max-h-[250px] md:max-h-full">
              {/* Photo de Profil */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-[#666666] mb-2 sm:mb-3 uppercase tracking-wide">Photo</h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-7 w-7 sm:h-8 sm:w-8"
                      style={{ backgroundColor: branding.primaryColor }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFotoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Type de Contact */}
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#666666] uppercase tracking-wide">Type</h4>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setDialogGestionTipos(true)}
                  >
                    <SettingsIcon className="w-4 h-4 text-[#666666]" />
                  </Button>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {tiposContacto.length === 0 ? (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-900 mb-1">
                            Aucun type de contact créé
                          </p>
                          <p className="text-xs text-amber-700 mb-3">
                            Le système est vide. Créez vos premiers types de contact pour commencer.
                          </p>
                          <Button
                            type="button"
                            onClick={() => setDialogGestionTipos(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Créer des types
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    tiposContacto.map((tipo) => {
                      const Icon = getIconComponent(tipo.icon);
                      const isSelected = formulario.tipo === tipo.code;
                      // TODOS los departamentos tienen acceso a TODOS los tipos
                      const isPermitted = true; // Restricción eliminada
                      
                      return (
                        <div
                          key={tipo.id}
                          onClick={() => {
                            if (isPermitted) {
                              setFormulario({ ...formulario, tipo: tipo.code as TipoContacto });
                            } else {
                              toast.error(`Le type "${tipo.label}" n'est pas autorisé pour ce département`);
                            }
                          }}
                          className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                            isSelected ? 'ring-2' : ''
                          } ${!isPermitted ? 'opacity-50' : ''}`}
                          style={{
                            borderColor: isSelected ? tipo.color : '#E0E0E0',
                            backgroundColor: isSelected ? tipo.bgColor : 'white',
                            ringColor: tipo.color
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-1.5 rounded-full"
                              style={{ backgroundColor: isSelected ? 'white' : tipo.bgColor }}
                            >
                              <Icon className="w-4 h-4" style={{ color: tipo.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-[#333333] leading-tight block truncate">
                                {tipo.label}
                              </span>
                              {!isPermitted && (
                                <span className="text-[10px] text-[#999999] italic">Non autorisé</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{/* VISTA SIMPLIFICADA: Solo para Donador y Fournisseur */}
              {(formulario.tipo === 'donador' || formulario.tipo === 'fournisseur') ? (
                <div 
                  className="flex-1 overflow-y-scroll px-4 sm:px-6 md:px-8 py-4 sm:py-6 scrollbar-thin"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#1a4d7a #f1f1f1',
                    height: '100%'
                  }}
                >
                  {/* Indicador de scroll superior */}
                  <div className="sticky top-0 left-0 right-0 h-1 bg-gradient-to-b from-gray-300/50 to-transparent -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 mb-2 pointer-events-none z-10"></div>
                  
                  <div className="max-w-full sm:max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-20">{/* Header informativo */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-900 text-xs sm:text-sm mb-1">
                            Formulaire Simplifié - {formulario.tipo === 'donador' ? 'Donateur' : 'Fournisseur'}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-blue-700">
                            Remplissez uniquement les 6 champs essentiels pour créer rapidement ce contact
                          </p>
                          {formulario.tipo === 'donador' && (
                            <p className="text-[10px] sm:text-xs text-pink-600 font-semibold mt-2 flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              ⬇️ Faites défiler vers le bas pour le Programme PRS
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Campo 1: Tipo de contacto (ya seleccionado en sidebar) */}
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: branding.primaryColor }} />
                        Type de Contact *
                      </Label>
                      <div 
                        className="p-2.5 sm:p-3 border-2 rounded-lg"
                        style={{ 
                          borderColor: branding.primaryColor + '40',
                          backgroundColor: branding.primaryColor + '08'
                        }}
                      >
                        <p className="text-xs sm:text-sm font-medium" style={{ color: branding.primaryColor }}>
                          {formulario.tipo === 'donador' ? '💰 Donateur' : '🛍️ Fournisseur'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                          {formulario.tipo === 'donador' 
                            ? 'Entreprise ou personne qui fait des dons alimentaires'
                            : 'Fournisseur de produits ou services'}
                        </p>
                      </div>
                    </div>

                    {/* SECCIÓN: Información de l'Entreprise */}
                    <div className="space-y-3 sm:space-y-4 pt-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Building className="w-4 h-4 text-gray-600" />
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Informations sur l'Entreprise
                        </h4>
                      </div>

                      {/* Nombre de Empresa */}
                      <div className="space-y-2">
                        <Label htmlFor="empresa-simple" className="text-xs sm:text-sm font-medium flex items-center gap-2">
                          <Building className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: branding.secondaryColor }} />
                          Nom de l'Entreprise / Organisation *
                        </Label>
                        <Input
                          id="empresa-simple"
                          value={formulario.nombreEmpresa || ''}
                          onChange={(e) => setFormulario({ ...formulario, nombreEmpresa: e.target.value })}
                          placeholder="Ex: Costco Montréal, IGA Saint-Laurent..."
                          className="h-10 sm:h-11 text-sm sm:text-base bg-gray-50 border-gray-300 focus:bg-white"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                          <span>💡</span>
                          Nom officiel de l'entreprise ou organisation
                        </p>
                      </div>
                    </div>

                    {/* SECCIÓN: Personne de Contact */}
                    <div className="space-y-3 sm:space-y-4 pt-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <User className="w-4 h-4 text-gray-600" />
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Personne de Contact
                        </h4>
                      </div>

                      {/* Nombre y Apellido */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre-simple" className="text-xs sm:text-sm font-medium flex items-center gap-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: branding.primaryColor }} />
                            Prénom *
                          </Label>
                          <Input
                            id="nombre-simple"
                            value={formulario.nombre}
                            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                            placeholder="Jean"
                            className="h-10 sm:h-11 text-sm sm:text-base bg-gray-50 border-gray-300 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apellido-simple" className="text-xs sm:text-sm font-medium flex items-center gap-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: branding.primaryColor }} />
                            Nom de famille *
                          </Label>
                          <Input
                            id="apellido-simple"
                            value={formulario.apellido}
                            onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                            placeholder="Tremblay"
                            className="h-10 sm:h-11 text-sm sm:text-base bg-gray-50 border-gray-300 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Email y Teléfono */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="email-simple" className="text-xs sm:text-sm font-medium flex items-center gap-2">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: branding.secondaryColor }} />
                            Email *
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <Input
                              id="email-simple"
                              type="email"
                              value={formulario.email}
                              onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                              placeholder="contact@entreprise.com"
                              className="h-10 sm:h-11 text-sm sm:text-base pl-10 sm:pl-11 bg-gray-50 border-gray-300 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-2">
                          <Label htmlFor="telefono-simple" className="text-xs sm:text-sm font-medium flex items-center gap-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: branding.secondaryColor }} />
                            Téléphone *
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <Input
                              id="telefono-simple"
                              type="tel"
                              value={formulario.telefono}
                              onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                              placeholder="(514) 555-1234"
                              className="h-10 sm:h-11 text-sm sm:text-base pl-10 sm:pl-11 bg-gray-50 border-gray-300 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Campo de Dirección */}
                      <div className="space-y-2 w-full bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 rounded-xl border-2 border-blue-300 shadow-sm">
                        <Label htmlFor="direccion-simple" className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <span className="text-blue-900">📍 Adresse de l'entreprise</span>
                        </Label>
                        <AddressAutocomplete
                          key={`address-base-${contactoId || 'new'}-${abierto}`}
                          value={formulario.direccion || ''}
                          initialCity={formulario.ciudad || ''}
                          initialPostalCode={formulario.codigoPostal || ''}
                          initialApartment={formulario.apartamento || ''}
                          initialQuartier={formulario.quartier || ''}
                          onChange={(value, details) => {
                            console.log('📝 Formulario BASE - onChange recibido:', { value, details });
                            console.log('📝 Formulario ACTUAL antes de actualizar:', {
                              direccion: formulario.direccion,
                              apartamento: formulario.apartamento,
                              ciudad: formulario.ciudad,
                              codigoPostal: formulario.codigoPostal,
                              quartier: formulario.quartier
                            });
                            
                            // ✅ Siempre actualizar con los valores que vienen (ya no preservamos vacíos)
                            // porque AddressAutocomplete ahora notifica INMEDIATAMENTE cuando cada campo cambia
                            const nuevoFormulario = {
                              ...formulario,
                              direccion: value,
                              ciudad: details?.city !== undefined ? details.city : formulario.ciudad,
                              codigoPostal: details?.postalCode !== undefined ? details.postalCode : formulario.codigoPostal,
                              apartamento: details?.apt !== undefined ? details.apt : formulario.apartamento,
                              quartier: details?.quartier !== undefined ? details.quartier : formulario.quartier
                            };
                            console.log('💾 Formulario BASE - Guardando:', nuevoFormulario);
                            setFormulario(nuevoFormulario);
                          }}
                          placeholder="123 Rue Principale, Montréal, QC H1A 1A1"
                          showAdditionalFields={true}
                        />
                        <p className="text-[10px] sm:text-xs text-blue-700 italic flex items-center gap-1 font-medium">
                          💡 Commencez à taper pour voir les suggestions d'adresses
                        </p>
                      </div>
                    </div>

                    {/* SECCIÓN PRS - Solo para Donadores */}
                    {formulario.tipo === 'donador' && (
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200">
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-lg sm:rounded-xl p-4 sm:p-5">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-pink-900 text-xs sm:text-sm">Programme PRS</h3>
                              <p className="text-[10px] sm:text-xs text-pink-700">Programme de Récupération en Supermarché</p>
                            </div>
                          </div>

                          <div 
                            onClick={() => setFormulario({ ...formulario, participaPRS: !formulario.participaPRS })}
                            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg border-2 border-pink-200 mb-3 sm:mb-4 cursor-pointer hover:bg-pink-50 hover:border-pink-300 transition-all active:scale-[0.98]"
                          >
                            <div 
                              className={`h-6 w-6 sm:h-7 sm:w-7 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                                formulario.participaPRS 
                                  ? 'bg-pink-500 border-pink-500' 
                                  : 'bg-white border-pink-400'
                              }`}
                            >
                              {formulario.participaPRS && (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-pink-900 flex-1">
                              🚚 Ce donateur participe au programme PRS
                            </span>
                          </div>

                          {formulario.participaPRS && (
                            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border border-pink-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                <div className="space-y-1.5 sm:space-y-2">
                                  <Label htmlFor="frecuenciaPRS" className="text-[10px] sm:text-xs font-medium text-gray-700">
                                    Fréquence (fois/semaine)
                                  </Label>
                                  <Input
                                    id="frecuenciaPRS"
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={formulario.frecuenciaPRS || 1}
                                    onChange={(e) => setFormulario({ ...formulario, frecuenciaPRS: parseInt(e.target.value) || 1 })}
                                    className="h-8 sm:h-9 text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                  <Label htmlFor="fechaInicioPRS" className="text-[10px] sm:text-xs font-medium text-gray-700">
                                    Date de début
                                  </Label>
                                  <Input
                                    id="fechaInicioPRS"
                                    type="date"
                                    value={formulario.fechaInicioPRS || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormulario({ ...formulario, fechaInicioPRS: e.target.value })}
                                    className="h-8 sm:h-9 text-sm"
                                    placeholder="AAAA-MM-JJ"
                                    title="Vous pouvez écrire directement (ex: 2024-02-20)"
                                    lang="fr-CA"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 sm:space-y-2">
                                <Label htmlFor="horarioRecoleccionPRS" className="text-[10px] sm:text-xs font-medium text-gray-700">
                                  Horaire de collecte préféré
                                </Label>
                                <Input
                                  id="horarioRecoleccionPRS"
                                  value={formulario.horarioRecoleccionPRS || ''}
                                  onChange={(e) => setFormulario({ ...formulario, horarioRecoleccionPRS: e.target.value })}
                                  placeholder="Ex: 08:00 - 10:00"
                                  className="h-8 sm:h-9 text-sm"
                                />
                              </div>

                              <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-[10px] sm:text-xs font-medium text-gray-700">Jours de collecte</Label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
                                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(dia => (
                                    <div key={dia} className="flex items-center gap-1 sm:gap-1.5">
                                      <Checkbox
                                        id={`dia-${dia}`}
                                        checked={(formulario.diasRecoleccionPRS || []).includes(dia)}
                                        onCheckedChange={(checked) => {
                                          const dias = formulario.diasRecoleccionPRS || [];
                                          if (checked) {
                                            setFormulario({ ...formulario, diasRecoleccionPRS: [...dias, dia] });
                                          } else {
                                            setFormulario({ ...formulario, diasRecoleccionPRS: dias.filter(d => d !== dia) });
                                          }
                                        }}
                                        className="border-pink-400 data-[state=checked]:bg-pink-500 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                      />
                                      <Label htmlFor={`dia-${dia}`} className="text-[10px] sm:text-xs cursor-pointer">
                                        {dia.substring(0, 3)}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                <div className="space-y-1.5 sm:space-y-2">
                                  <Label htmlFor="contactoPRS" className="text-[10px] sm:text-xs font-medium text-gray-700">Contact PRS</Label>
                                  <Input
                                    id="contactoPRS"
                                    value={formulario.contactoPRS || ''}
                                    onChange={(e) => setFormulario({ ...formulario, contactoPRS: e.target.value })}
                                    placeholder="Nom du contact"
                                    className="h-8 sm:h-9 text-sm"
                                  />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                  <Label htmlFor="telefonoPRS" className="text-[10px] sm:text-xs font-medium text-gray-700">Téléphone PRS</Label>
                                  <Input
                                    id="telefonoPRS"
                                    type="tel"
                                    value={formulario.telefonoPRS || ''}
                                    onChange={(e) => setFormulario({ ...formulario, telefonoPRS: e.target.value })}
                                    placeholder="(514) 555-..."
                                    className="h-8 sm:h-9 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 sm:space-y-2">
                                <Label htmlFor="notasPRS" className="text-[10px] sm:text-xs font-medium text-gray-700">Notes spéciales PRS</Label>
                                <Textarea
                                  id="notasPRS"
                                  value={formulario.notasPRS || ''}
                                  onChange={(e) => setFormulario({ ...formulario, notasPRS: e.target.value })}
                                  placeholder="Instructions spéciales, accès, consignes..."
                                  rows={3}
                                  className="text-[10px] sm:text-xs resize-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Nota informativa */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-6 sm:mt-8">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-green-800">
                          <p className="font-semibold mb-1">✨ C'est tout ce dont nous avons besoin!</p>
                          <p>
                            Une fois ces 6 champs remplis, vous pourrez créer le contact. 
                            Vous pourrez toujours ajouter plus d'informations plus tard si nécessaire.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de fin de scroll */}
                    <div className="sticky bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-gray-300/50 to-transparent -mx-4 sm:-mx-6 md:-mx-8 -mb-4 sm:-mb-6 mt-4 pointer-events-none"></div>
                  </div>
                </div>
              ) : (
                // VISTA COMPLETA: Para todos los demás tipos
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-3 sm:px-4 md:px-6 py-0 h-10 sm:h-12 overflow-x-auto">
                    <TabsTrigger value="base" className="data-[state=active]:border-b-2 text-xs sm:text-sm" style={{ borderColor: branding.primaryColor }}>
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Base
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="data-[state=active]:border-b-2 text-xs sm:text-sm" style={{ borderColor: branding.primaryColor }}>
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Contact
                    </TabsTrigger>
                    {/* Ocultar pestaña Professionnel para Donador */}
                    {mostrarPestana('pro') && (
                      <TabsTrigger value="pro" className="data-[state=active]:border-b-2 text-xs sm:text-sm" style={{ borderColor: branding.primaryColor }}>
                        <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Professionnel
                      </TabsTrigger>
                    )}
                    {/* Ocultar pestaña Autres para Donador */}
                    {mostrarPestana('autres') && (
                      <TabsTrigger value="autres" className="data-[state=active]:border-b-2 text-xs sm:text-sm" style={{ borderColor: branding.primaryColor }}>
                        <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Autres
                      </TabsTrigger>
                    )}
                  </TabsList>

                {/* Tab: Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 scrollbar-thin m-0">
                  <div className="max-w-full sm:max-w-2xl lg:max-w-4xl space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="nombre" className="text-xs">Prénom *</Label>
                        <Input
                          id="nombre"
                          value={formulario.nombre}
                          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                          placeholder="Jean"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellido" className="text-xs">Nom de famille *</Label>
                        <Input
                          id="apellido"
                          value={formulario.apellido}
                          onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                          placeholder="Dupont"
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className={`grid gap-4 ${formulario.tipo === 'donador' || formulario.tipo === 'fournisseur' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                      {/* Ocultar fecha de nacimiento y género para donadores y proveedores (son empresas) */}
                      {formulario.tipo !== 'donador' && formulario.tipo !== 'fournisseur' && (
                        <div>
                          <Label htmlFor="fechaNacimiento" className="text-xs">Date de Naissance</Label>
                          <Input
                            id="fechaNacimiento"
                            type="date"
                            value={formulario.fechaNacimiento || ''}
                            onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })}
                            className="h-9"
                            placeholder="AAAA-MM-JJ"
                            title="Vous pouvez écrire directement l'année (ex: 1985-03-15)"
                            lang="fr-CA"
                          />
                        </div>
                      )}
                      {/* Ocultar género para donadores y proveedores (son empresas) */}
                      {formulario.tipo !== 'donador' && formulario.tipo !== 'fournisseur' && (
                        <div>
                          <Label htmlFor="genero" className="text-xs">Genre</Label>
                          <Select
                            value={formulario.genero || 'Non spécifié'}
                            onValueChange={(value) => setFormulario({ ...formulario, genero: value as GeneroContacto })}
                          >
                            <SelectTrigger id="genero" className="h-9">
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
                      )}
                      <div>
                        <Label htmlFor="fechaInicio" className="text-xs">Date de Début</Label>
                        <Input
                          id="fechaInicio"
                          type="date"
                          value={formulario.fechaInicio || ''}
                          onChange={(e) => setFormulario({ ...formulario, fechaInicio: e.target.value })}
                          className="h-9"
                          placeholder="AAAA-MM-JJ"
                          title="Vous pouvez écrire directement (ex: 2020-01-15)"
                          lang="fr-CA"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Langues parlées</Label>
                      <LanguageSelector
                        selectedLanguages={formulario.idiomas || []}
                        onChange={(idiomas) => setFormulario({ ...formulario, idiomas })}
                        predefinedLanguages={[
                          { code: 'fr', label: 'Français', flag: '🇫🇷', color: branding.primaryColor },
                          { code: 'ar', label: 'العربية', flag: '🇸🇦', color: '#F59E0B' },
                          { code: 'en', label: 'English', flag: '🇬🇧', color: branding.secondaryColor },
                          { code: 'es', label: 'Español', flag: '🇪🇸', color: '#8B5CF6' }
                        ]}
                      />
                    </div>

                    {/* 📍 INFORMACIÓN DE DEPARTAMENTO - Muestra dónde se guardará el contacto */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3" style={{ borderColor: branding.primaryColor }}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" style={{ color: branding.primaryColor }} />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Département assigné automatiquement:
                          </p>
                          <p className="text-sm font-bold mt-1" style={{ color: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}>
                            {departamentoNombre}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 🎯 DÉPARTEMENTS - OCULTADO: El departamento se asigna automáticamente según el módulo actual */}
                    {false && (formulario.tipo === 'benevole' || formulario.tipo === 'employe' || formulario.tipo === 'responsable-sante' || formulario.tipo === 'partenaire') && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 rounded-xl p-4" style={{ borderColor: branding.primaryColor }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-5 h-5" style={{ color: branding.primaryColor }} />
                          <Label className="text-sm font-bold text-[#333333] m-0" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Départements Assignés
                            <span className="text-red-500 ml-1">*</span>
                            {formulario.departamentoIds && formulario.departamentoIds.length > 0 && (
                              <span 
                                className="ml-2 px-2 py-0.5 rounded-full text-white font-bold text-xs"
                                style={{ backgroundColor: branding.primaryColor }}
                              >
                                {formulario.departamentoIds.length} sélectionné{formulario.departamentoIds.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </Label>
                        </div>
                        
                        <p className="text-xs text-[#666666] mb-3 italic">
                          <span className="text-red-500 font-semibold">* Obligatoire</span> - Sélectionnez au moins un département où cette personne travaillera
                        </p>
                        
                        {/* Pills de departamentos */}
                        <div className="flex flex-wrap gap-2">
                          {obtenerDepartamentos()
                            .filter(dept => dept.activo)
                            .sort((a, b) => a.orden - b.orden)
                            .map(dept => {
                              const isSelected = formulario.departamentoIds?.includes(dept.id) || formulario.departamentoId === dept.id;
                              return (
                                <button
                                  key={dept.id}
                                  type="button"
                                  onClick={() => {
                                    const currentIds = formulario.departamentoIds || (formulario.departamentoId ? [formulario.departamentoId] : []);
                                    const newIds = isSelected
                                      ? currentIds.filter(id => id !== dept.id)
                                      : [...currentIds, dept.id];
                                    setFormulario({
                                      ...formulario,
                                      departamentoIds: newIds,
                                      departamentoId: newIds[0] || ''
                                    });
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
                        {(!formulario.departamentoIds || formulario.departamentoIds.length === 0) && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                            <span className="text-yellow-600 text-lg">⚠️</span>
                            <p className="text-xs text-yellow-800">
                              Veuillez sélectionner au moins un département pour ce contact
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Separador */}
                    <div className="border-t-2 border-[#E0E0E0] my-6"></div>

                    {/* Sección: Casier judiciaire et éthique */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-1 h-6 rounded-full" 
                          style={{ backgroundColor: branding.primaryColor }}
                        ></div>
                        <h3 className="text-base font-semibold text-[#333333]">
                          Casier Judiciaire et Éthique
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fechaConfirmacionCasier" className="text-xs">Date de Confirmation</Label>
                          <Input
                            id="fechaConfirmacionCasier"
                            type="date"
                            value={formulario.fechaConfirmacionCasier || ''}
                            onChange={(e) => setFormulario({ ...formulario, fechaConfirmacionCasier: e.target.value })}
                            className="h-9"
                            placeholder="AAAA-MM-JJ"
                            title="Vous pouvez écrire directement (ex: 2024-02-20)"
                            lang="fr-CA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="codigoEthiqueSigne" className="text-xs mb-2 block">Code d'Éthique Signé</Label>
                          <Select
                            value={formulario.codigoEthiqueSigne === true ? 'oui' : formulario.codigoEthiqueSigne === false ? 'non' : 'non-specifie'}
                            onValueChange={(value) => {
                              if (value === 'oui') {
                                setFormulario({ ...formulario, codigoEthiqueSigne: true });
                              } else if (value === 'non') {
                                setFormulario({ ...formulario, codigoEthiqueSigne: false });
                              } else {
                                setFormulario({ ...formulario, codigoEthiqueSigne: undefined });
                              }
                            }}
                          >
                            <SelectTrigger id="codigoEthiqueSigne" className="h-9">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oui">
                                <span className="flex items-center gap-2">
                                  <span className="text-green-600">✓</span> Oui
                                </span>
                              </SelectItem>
                              <SelectItem value="non">
                                <span className="flex items-center gap-2">
                                  <span className="text-red-600">✗</span> Non
                                </span>
                              </SelectItem>
                              <SelectItem value="non-specifie">
                                <span className="flex items-center gap-2">
                                  <span className="text-gray-400">—</span> Non spécifié
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Indicador visual del estado */}
                      {formulario.codigoEthiqueSigne !== undefined && (
                        <div 
                          className="p-3 rounded-lg border-l-4 text-sm"
                          style={{
                            backgroundColor: formulario.codigoEthiqueSigne ? '#ECFDF5' : '#FEF2F2',
                            borderLeftColor: formulario.codigoEthiqueSigne ? '#10B981' : '#EF4444'
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {formulario.codigoEthiqueSigne ? '✅' : '⚠️'}
                            </span>
                            <span style={{ color: formulario.codigoEthiqueSigne ? '#065F46' : '#991B1B' }}>
                              {formulario.codigoEthiqueSigne 
                                ? 'Code d\'éthique signé et confirmé' 
                                : 'Code d\'éthique non signé'}
                            </span>
                          </div>
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
                            value={formulario.email}
                            onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                            placeholder="jean.dupont@email.com"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefono" className="text-xs">Téléphone</Label>
                          <Input
                            id="telefono"
                            type="tel"
                            value={formulario.telefono}
                            onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                            placeholder="(514) 555-0123"
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Adresse complète</Label>
                        <AddressAutocomplete
                          key={`address-contact-${contactoId || 'new'}-${abierto}`}
                          value={formulario.direccion || ''}
                          initialCity={formulario.ciudad || ''}
                          initialPostalCode={formulario.codigoPostal || ''}
                          initialApartment={formulario.apartamento || ''}
                          initialQuartier={formulario.quartier || ''}
                          onChange={(value, details) => {
                            console.log('📝 Formulario CONTACT - onChange recibido:', { value, details });
                            console.log('📝 Formulario ACTUAL antes de actualizar:', {
                              direccion: formulario.direccion,
                              apartamento: formulario.apartamento,
                              ciudad: formulario.ciudad,
                              codigoPostal: formulario.codigoPostal,
                              quartier: formulario.quartier
                            });
                            
                            // ✅ Siempre actualizar con los valores que vienen (ya no preservamos vacíos)
                            // porque AddressAutocomplete ahora notifica INMEDIATAMENTE cuando cada campo cambia
                            const nuevoFormulario = {
                              ...formulario,
                              direccion: value,
                              ciudad: details?.city !== undefined ? details.city : formulario.ciudad,
                              codigoPostal: details?.postalCode !== undefined ? details.postalCode : formulario.codigoPostal,
                              apartamento: details?.apt !== undefined ? details.apt : formulario.apartamento,
                              quartier: details?.quartier !== undefined ? details.quartier : formulario.quartier
                            };
                            console.log('💾 Formulario CONTACT - Guardando:', nuevoFormulario);
                            setFormulario(nuevoFormulario);
                          }}
                          placeholder="123 Boulevard Saint-Laurent Est"
                          showAdditionalFields={true}
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
                            value={formulario.contactoEmergenciaNombre || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaNombre: e.target.value })}
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
                            value={formulario.contactoEmergenciaRelacion || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaRelacion: e.target.value })}
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
                            value={formulario.contactoEmergenciaTelefono || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaTelefono: e.target.value })}
                            placeholder="(514) 555-0123"
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
                            value={formulario.contactoEmergenciaEmail || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaEmail: e.target.value })}
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
                  <div className="max-w-4xl space-y-3">
                    {/* Mensaje de référence pour les départements */}
                    {(formulario.tipo === 'benevole' || formulario.tipo === 'employe' || formulario.tipo === 'responsable-sante' || formulario.tipo === 'partenaire') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-800">
                            <strong>Départements assignés:</strong> {formulario.departamentoIds && formulario.departamentoIds.length > 0 ? (
                              <span className="ml-1">
                                {obtenerDepartamentos()
                                  .filter(d => formulario.departamentoIds?.includes(d.id))
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
                    )}

                    {/* Información Profesional */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="cargo" className="text-xs">Poste/Rôle</Label>
                        <Select
                          value={formulario.cargo || ''}
                          onValueChange={(value) => setFormulario({ ...formulario, cargo: value })}
                        >
                          <SelectTrigger id="cargo" className="h-8">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Directeur">Directeur</SelectItem>
                            <SelectItem value="Coordinateur">Coordinateur</SelectItem>
                            <SelectItem value="Responsable">Responsable</SelectItem>
                            <SelectItem value="Chef d'équipe">Chef d'équipe</SelectItem>
                            <SelectItem value="Superviseur">Superviseur</SelectItem>
                            <SelectItem value="Assistant">Assistant</SelectItem>
                            <SelectItem value="Bénévole">Bénévole</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="heuresSemaines" className="text-xs">Heures/Semaine</Label>
                        <Input
                          id="heuresSemaines"
                          type="number"
                          value={formulario.heuresSemaines || 0}
                          onChange={(e) => setFormulario({ ...formulario, horasSemaines: parseInt(e.target.value) || 0 })}
                          placeholder="40"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reference" className="text-xs">Référence</Label>
                        <Input
                          id="reference"
                          value={formulario.reference || ''}
                          onChange={(e) => setFormulario({ ...formulario, reference: e.target.value })}
                          placeholder="REF-001"
                          className="h-8"
                        />
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-[#E0E0E0] my-3"></div>

                    {/* Tâches assignées */}
                    <div>
                      <TaskSelector
                        selectedTasks={formulario.tareas || []}
                        onChange={(tareas) => setFormulario({ ...formulario, tareas })}
                        departamentoId={departamentoId}
                        departamentoNombre={formulario.departamentoNombre || ''}
                        tipoContacto={formulario.tipo}
                        nombreTipoContacto={formulario.tipo === 'donador' ? 'Donateur' : formulario.tipo === 'fournisseur' ? 'Fournisseur' : formulario.tipo === 'benevole' ? 'Bénévole' : formulario.tipo}
                        predefinedTasks={[
                          { code: 'accueil', label: 'Accueil', icon: '🤝', color: branding.primaryColor },
                          { code: 'distribution', label: 'Distribution', icon: '📦', color: branding.secondaryColor },
                          { code: 'inventaire', label: 'Inventaire', icon: '📋', color: '#F59E0B' },
                          { code: 'transport', label: 'Transport', icon: '🚛', color: '#8B5CF6' },
                          { code: 'comptoir', label: 'Comptoir', icon: '🏪', color: '#EC4899' },
                          { code: 'cuisine', label: 'Cuisine', icon: '👨‍🍳', color: '#10B981' },
                          { code: 'nettoyage', label: 'Nettoyage', icon: '🧹', color: '#6B7280' },
                          { code: 'admin', label: 'Admin', icon: '📊', color: '#3B82F6' }
                        ]}
                      />
                    </div>

                    {/* Separador */}
                    <div className="border-t border-[#E0E0E0] my-3"></div>

                    {/* Disponibilidades */}
                    <div>
                      <SelecteurJoursDisponibles
                        joursDisponibles={(formulario.disponibilidades || []).map(dia => ({
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
                          setFormulario({ ...formulario, disponibilidades: allDays });
                        }}
                        showIcon={true}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={formulario.notas || ''}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder="Ajoutez des notes sur ce contact..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    {/* Sección de Documentos */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[#666666]">
                          <FileText className="w-4 h-4 inline mr-2" style={{ color: branding.primaryColor }} />
                          Documents
                          {formulario.documents && formulario.documents.length > 0 && (
                            <span 
                              className="ml-2 px-2 py-0.5 rounded-full text-white text-xs font-bold"
                              style={{ backgroundColor: branding.secondaryColor }}
                            >
                              {formulario.documents.length}
                            </span>
                          )}
                        </h4>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setDialogGestionDocumentos(true)}
                          title="Gérer les types de documents"
                        >
                          <SettingsIcon className="w-4 h-4 text-[#666666]" />
                        </Button>
                      </div>

                      {/* Lista de documentos existentes */}
                      {formulario.documents && formulario.documents.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {formulario.documents.map((doc, index) => {
                            const docColor = doc.tipoColor || branding.primaryColor;
                            const docBgColor = doc.tipoBgColor || '#E3F2FD';
                            const docIcon = doc.tipoIcon || '📄';
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg hover:shadow-sm transition-all border-2"
                                style={{ 
                                  borderColor: docColor,
                                  backgroundColor: docBgColor 
                                }}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div 
                                    className="p-2 rounded-lg text-2xl"
                                    style={{ backgroundColor: `${docColor}15` }}
                                  >
                                    {docIcon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                                        style={{ 
                                          backgroundColor: docColor,
                                          color: 'white'
                                        }}
                                      >
                                        {doc.tipoLabel || 'Document'}
                                      </span>
                                      <p className="text-sm font-semibold text-[#333333] truncate" title={doc.nom}>
                                        {doc.nom}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                      <span>{new Date(doc.date).toLocaleDateString('fr-FR')}</span>
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
                                      if (confirm(`Voulez-vous vraiment supprimer "${doc.nom}" ?`)) {
                                        handleRemoveDocument(index);
                                      }
                                    }}
                                    title="Supprimer le document"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
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
                          Contrats, Assurables, etc.
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
                          Ajouter PDF
                        </Button>
                        <p className="text-[10px] text-gray-400 mt-2">
                          Formats: PDF, JPG, PNG • Taille max: 2MB
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
              )}
            </div>
          </div>

          {/* Footer con botones */}
          <div className="sticky bottom-0 bg-white border-t-2 border-[#E0E0E0] px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <Button
              variant="outline"
              onClick={onCerrar}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base"
            >
              Annuler
            </Button>
            <Button
              onClick={onGuardar}
              className="w-full sm:w-auto text-white h-9 sm:h-10 text-sm sm:text-base"
              style={{ backgroundColor: branding.secondaryColor }}
            >
              {modoEdicion ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Dialog: Gestión de Tipos */}
      <Dialog open={dialogGestionTipos} onOpenChange={setDialogGestionTipos}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="gestion-tipos-description">
          <DialogHeader>
            <DialogTitle>Gestion des Types de Contact - {departamentoNombre}</DialogTitle>
            <DialogDescription id="gestion-tipos-description">
              Créez des types spécifiques à {departamentoNombre} ou globaux (disponibles pour tous les départements). 
              Les types globaux s'affichent avec un badge bleu "Global".
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

            {/* Panel de estadísticas */}
            {tiposContacto.length > 0 && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                    {tiposContacto.length}
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {tiposContacto.filter(t => !t.departamentoId).length}
                  </p>
                  <p className="text-xs text-gray-600">Globaux</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {tiposContacto.filter(t => t.departamentoId === departamentoId).length}
                  </p>
                  <p className="text-xs text-gray-600">{departamentoNombre}</p>
                </div>
              </div>
            )}

            {tiposContacto.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Aucun type de contact disponible</p>
                <p className="text-xs mt-1">Créez votre premier type de contact</p>
              </div>
            ) : (
              <div className="border rounded-lg divide-y">
                {tiposContacto.map((tipo) => {
                  const Icon = getIconComponent(tipo.icon);
                  return (
                    <div key={tipo.id} className="p-3 flex items-center justify-between hover:bg-[#F9FAFB]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: tipo.bgColor }}>
                          <Icon className="w-5 h-5" style={{ color: tipo.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{tipo.label}</p>
                            {!tipo.departamentoId ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                Global
                              </span>
                            ) : tipo.departamentoId === departamentoId ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                {departamentoNombre}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-[#999999]">Code: {tipo.code}</p>
                          {tipo.dateCreated && (
                            <p className="text-xs text-[#999999]">
                              Créé: {new Date(tipo.dateCreated).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => abrirEditarTipo(tipo)}
                        >
                          <Edit2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEliminarTipo(tipo)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
              Définissez les propriétés du type de contact
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo-code" className="text-xs">Code unique *</Label>
              <Input
                id="tipo-code"
                value={nuevoTipo.code}
                onChange={(e) => setNuevoTipo({ ...nuevoTipo, code: e.target.value })}
                placeholder="employe-interne"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="tipo-label" className="text-xs">Étiquette *</Label>
              <Input
                id="tipo-label"
                value={nuevoTipo.label}
                onChange={(e) => setNuevoTipo({ ...nuevoTipo, label: e.target.value })}
                placeholder="Employé Interne"
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

            {/* NUEVO: Opción para hacer global o específico del departamento */}
            {!tipoEditando && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tipo-global"
                    checked={tipoEsGlobal}
                    onCheckedChange={(checked) => setTipoEsGlobal(checked as boolean)}
                  />
                  <label
                    htmlFor="tipo-global"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Type global (disponible pour tous les départements)
                  </label>
                </div>
                <p className="text-xs text-gray-600 mt-2 ml-6">
                  {tipoEsGlobal 
                    ? "Ce type sera disponible dans tous les départements du système"
                    : `Ce type sera spécifique au département ${departamentoNombre}`
                  }
                </p>
              </div>
            )}

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

      {/* Dialog: Gestión de Tipos de Documentos */}
      <Dialog open={dialogGestionDocumentos} onOpenChange={setDialogGestionDocumentos}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" aria-describedby="gestion-documentos-description">
          <DialogHeader>
            <DialogTitle>Gestion des Types de Documents</DialogTitle>
            <DialogDescription id="gestion-documentos-description">
              Créez, modifiez ou supprimez des types de documents estandarizados. 
              Les modifications affecteront tous les documents de ce type dans tous les contacts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={abrirNuevoTipoDocumento}
                className="w-full text-white"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un nouveau type
              </Button>
              
              <Button
                onClick={() => {
                  guardarConfigDocumentoPredeterminada();
                  cargarTiposDocumento();
                  toast.success('Configuration enregistrée comme prédéfinie');
                }}
                variant="outline"
                className="w-full"
                style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
              >
                <Check className="w-4 h-4 mr-2" />
                Enregistrer comme prédéfinis
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
              {tiposDocumento.map((tipo) => (
                <div key={tipo.id} className="p-3 flex items-center justify-between hover:bg-[#F9FAFB]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg text-2xl" style={{ backgroundColor: tipo.bgColor }}>
                      {tipo.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tipo.label}</p>
                      <p className="text-xs text-[#999999]">Code: {tipo.code}</p>
                      {tipo.description && (
                        <p className="text-xs text-[#666666] italic mt-0.5">{tipo.description}</p>
                      )}
                    </div>
                    {tipo.isPredefined && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Prédéfini</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => abrirEditarTipoDocumento(tipo)}
                    >
                      <Edit2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEliminarTipoDocumento(tipo)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir rétablir les types prédéfinis par défaut ? Cette action supprimera tous vos types personnalisés.')) {
                  restablecerTiposDocumentoPredefinidos();
                  cargarTiposDocumento();
                  toast.success('Types prédéfinis rétablis par défaut');
                }
              }}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Rétablir les valeurs par défaut
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear/Editar Tipo de Documento */}
      <Dialog open={dialogEditarDocumento} onOpenChange={(open) => {
        setDialogEditarDocumento(open);
        if (!open) limpiarFormularioTipoDocumento();
      }}>
        <DialogContent className="max-w-xl" aria-describedby="editar-documento-description">
          <DialogHeader>
            <DialogTitle>
              {documentoEditando ? 'Modifier le type de document' : 'Créer un nouveau type de document'}
            </DialogTitle>
            <DialogDescription id="editar-documento-description">
              Définissez les propriétés du type de document. 
              {documentoEditando && ' Les modifications affecteront tous les documents de ce type.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc-code" className="text-xs">Code unique *</Label>
              <Input
                id="doc-code"
                value={nuevoTipoDocumento.code}
                onChange={(e) => setNuevoTipoDocumento({ ...nuevoTipoDocumento, code: e.target.value })}
                placeholder="contrat-travail"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="doc-label" className="text-xs">Étiquette *</Label>
              <Input
                id="doc-label"
                value={nuevoTipoDocumento.label}
                onChange={(e) => setNuevoTipoDocumento({ ...nuevoTipoDocumento, label: e.target.value })}
                placeholder="Contrat de Travail"
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="doc-description" className="text-xs">Description</Label>
              <Input
                id="doc-description"
                value={nuevoTipoDocumento.description}
                onChange={(e) => setNuevoTipoDocumento({ ...nuevoTipoDocumento, description: e.target.value })}
                placeholder="Description optionnelle..."
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Icône (Emoji)</Label>
              <div className="grid grid-cols-10 gap-2">
                {['📄', '🛡️', '🏥', '🎓', '📋', '✉️', '🪪', '⭐', '📚', '📎', '📑', '🔐', '💼', '📝', '🏆', '📊', '🔖', '📌', '📁', '🗂️'].map((emoji) => {
                  const isSelected = nuevoTipoDocumento.icon === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNuevoTipoDocumento({ ...nuevoTipoDocumento, icon: emoji })}
                      className={`p-2 border-2 rounded-lg hover:shadow-sm transition-all text-2xl ${isSelected ? 'ring-2' : ''}`}
                      style={{
                        borderColor: isSelected ? nuevoTipoDocumento.color : '#E0E0E0',
                        backgroundColor: isSelected ? nuevoTipoDocumento.bgColor : 'white',
                        ringColor: nuevoTipoDocumento.color
                      }}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Couleur</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLORES_DOCUMENTO_DISPONIBLES.map((color) => {
                  const isSelected = nuevoTipoDocumento.color === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNuevoTipoDocumento({ 
                        ...nuevoTipoDocumento, 
                        color: color.value, 
                        bgColor: color.bg 
                      })}
                      className={`p-3 border-2 rounded-lg hover:shadow-sm transition-all ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
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
                  setDialogEditarDocumento(false);
                  limpiarFormularioTipoDocumento();
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleGuardarTipoDocumento}
                className="text-white"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                {documentoEditando ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Seleccionar Tipo de Documento */}
      <Dialog open={dialogSeleccionarTipo} onOpenChange={setDialogSeleccionarTipo}>
        <DialogContent className="max-w-2xl" aria-describedby="seleccionar-tipo-description">
          <DialogHeader>
            <DialogTitle>Sélectionner le type de document</DialogTitle>
            <DialogDescription id="seleccionar-tipo-description">
              Choisissez le type de document pour {archivosPendientes.length} fichier(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {tiposDocumento.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => handleConfirmarTipoDocumento(tipo)}
                className="p-4 border-2 rounded-lg hover:shadow-md transition-all text-left"
                style={{
                  borderColor: tipo.color,
                  backgroundColor: tipo.bgColor
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{tipo.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: tipo.color }}>
                      {tipo.label}
                    </p>
                    {tipo.description && (
                      <p className="text-xs text-gray-600 mt-1">{tipo.description}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setDialogSeleccionarTipo(false);
                setArchivosPendientes([]);
              }}
              className="w-full"
            >
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Exportar/Importar Tipos */}
      <Dialog open={dialogExportarImportar} onOpenChange={setDialogExportarImportar}>
        <DialogContent className="max-w-2xl" aria-describedby="exportar-importar-description">
          <DialogHeader>
            <DialogTitle>Exporter / Importer Types de Contact</DialogTitle>
            <DialogDescription id="exportar-importar-description">
              Sauvegardez ou restaurez vos types de contact personnalisés
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Sección Exportar */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-start gap-3 mb-3">
                <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-blue-900">Exporter les types</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Téléchargez tous vos types de contact en format JSON pour les sauvegarder ou les partager
                  </p>
                </div>
              </div>
              <Button
                onClick={handleExportarTipos}
                variant="outline"
                className="w-full border-blue-300 hover:bg-blue-100"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le fichier JSON
              </Button>
            </div>

            {/* Sección Importar */}
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-start gap-3 mb-3">
                <Upload className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-green-900">Importer des types</h3>
                  <p className="text-xs text-green-700 mt-1">
                    Collez le contenu JSON pour importer des types de contact
                  </p>
                </div>
              </div>
              
              <Textarea
                value={jsonImportar}
                onChange={(e) => setJsonImportar(e.target.value)}
                placeholder='[{"code":"example","label":"Example","icon":"User","color":"#1a4d7a","bgColor":"#DBEAFE"}]'
                className="font-mono text-xs h-32 mb-3"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleImportarTipos(false)}
                  variant="outline"
                  className="border-green-300 hover:bg-green-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter (sans dupliquer)
                </Button>
                <Button
                  onClick={() => handleImportarTipos(true)}
                  variant="outline"
                  className="border-red-300 hover:bg-red-100 text-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Remplacer tout
                </Button>
              </div>
            </div>

            {/* Información importante */}
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded">
              <div className="flex gap-2">
                <span className="text-lg">💾</span>
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold mb-1">Conservation permanente</p>
                  <p>
                    Tous les types créés sont automatiquement sauvegardés dans le navigateur (localStorage) 
                    et resteront disponibles même après redémarrage de l'application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}