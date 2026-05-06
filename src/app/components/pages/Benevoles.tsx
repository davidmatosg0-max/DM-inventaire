// Module Bénévoles - Version 2.2 (Optimización de rendimiento)
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { LanguageSelector } from '../ui/language-selector';
import { MultiSelectDepartements } from '../ui/multi-select-departements';
import { FicheBenevole } from '../benevoles/FicheBenevole';
import { IDDigitalBenevole } from '../benevoles/IDDigitalBenevole';
import { FormularioNouveauBenevole } from '../benevoles/FormularioNouveauBenevole';
import { AsignarRolContacto } from '../AsignarRolContacto';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { obtenirQuartiersLaval } from '../../data/quartiersLaval';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { obtenerDepartamentos } from '../../utils/departamentosStorage';
import { obtenerUsuarioSesion, tienePermiso } from '../../utils/sesionStorage';
import { guardarContacto, type ContactoDepartamento, sincronizarDesdeBenevole, obtenerContactosDepartamento, eliminarContacto, actualizarContacto } from '../../utils/contactosDepartamentoStorage';
import { sincronizarVoluntariosEntrepot } from '../../utils/sincronizarVoluntariosEntrepot';
import { registrarActividad } from '../../utils/actividadLogger';
import { openAutoPrintPopup } from '../../utils/printPopup';
import { BoutonRetourHeader } from '../shared/BoutonRetour';
// 🔧 Importar utilidades de debugging
import '../../utils/debugBenevoles';
import { 
  UserPlus, 
  Users, 
  Clock, 
  Calendar,
  BarChart3,
  FileText,
  Filter,
  Search,
  Edit,
  Edit2,
  Eye,
  Plus,
  Download,
  TrendingUp,
  Award,
  Building2,
  Menu,
  X,
  Save,
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Languages,
  Briefcase,
  Car,
  CalendarDays,
  Send,
  CheckSquare,
  Square,
  Printer,
  FileEdit,
  StickyNote,
  Upload,
  Trash2,
  FileCheck,
  Image as ImageIcon,
  File,
  CreditCard,
  Sparkles,
  Camera,
  LogIn,
  LogOut,
  Timer,
  ClipboardList,
  Building,
  FileUp,
  Heart,
  Star,
  UserCheck,
  ShieldPlus,
  Shield,
  AlertCircle,
  Link,
  UserMinus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

// Types
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

// Tipo de bénévole similar a ContactoDepartamento
type TipoBenevole = 'benevole' | 'stagiaire' | 'employe' | 'coordinateur' | 'responsable' | 'autre';

interface DisponibilidadDiaBenevole {
  jour: string; // 'Lundi', 'Mardi', etc.
  am: boolean;
  pm: boolean;
}

interface Benevole {
  id: number;
  identifiant: string; // DEPRECADO - Solo se usa numeroArchivo ahora
  numeroArchivo?: string; // 🆕 Número de archivo del sistema de contactos (CONT-YYYY-NNNN)
  tipo?: TipoBenevole; // NUEVO - Tipo de bénévole
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  departement: string;
  disponibilites: string;
  disponibilidadesSemanal?: DisponibilidadDiaBenevole[]; // NUEVO - Disponibilidades estructuradas
  statut: 'actif' | 'inactif' | 'en pause' | 'en attente';
  heuresTotal: number;
  heuresMois: number;
  dateInscription: string;
  // Campos existentes mejorados
  sexe?: 'Homme' | 'Femme' | 'Autre' | 'Non spécifié';
  dateNaissance?: string;
  langues?: string[];
  adresse?: string;
  appartement?: string; // NUEVO - Número de apartamento
  ville?: string; // NUEVO - Ciudad/Secteur
  codePostal?: string; // NUEVO - Código postal
  quartier?: string;
  voiture?: boolean;
  joursDisponibles?: JourDisponible[];
  notes?: Note[];
  notasGenerales?: string; // NUEVO - Notas de texto libre
  documents?: Document[];
  photo?: string | null;
  // Campos profesionales NUEVOS
  poste?: string; // NUEVO - Poste/Rôle
  heuresSemaines?: number; // NUEVO - Heures Semaines
  reference?: string; // NUEVO - Référence
  feuillesTemps?: FeuilleTemps[]; // NUEVO - Historial de horas
  // Contacto de emergencia
  contactoEmergenciaNombre?: string;
  contactoEmergenciaRelacion?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaEmail?: string;
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
  enCours?: boolean; // Nueva propiedad para indicar si la entrada está en progreso
}

type BenevoleView = 'liste' | 'fiche' | 'feuilles-temps' | 'historique' | 'repartition' | 'rapports' | 'contactos';

interface BenevolesProps {
  isPublicAccess?: boolean;
}

export function Benevoles({ isPublicAccess = false }: BenevolesProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  const [currentView, setCurrentView] = useState<BenevoleView>(isPublicAccess ? 'feuilles-temps' : 'liste');
  const [selectedBenevoleId, setSelectedBenevoleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // ⚡ Debounced search
  const [filterDepartement, setFilterDepartement] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBenevoleForHistorique, setSelectedBenevoleForHistorique] = useState<number | null>(null);
  const [filterDepartementHistorique, setFilterDepartementHistorique] = useState<string>('all');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBenevole, setEditingBenevole] = useState<Benevole | null>(null);
  
  // 🎯 Profile modal state (pour voir les détails complets)
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileBenevole, setProfileBenevole] = useState<Benevole | null>(null);
  
  const [editForm, setEditForm] = useState({
    tipo: 'benevole' as TipoBenevole,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    departement: [] as string[],
    disponibilites: '',
    disponibilidadesSemanal: [
      { jour: 'Lundi', am: false, pm: false },
      { jour: 'Mardi', am: false, pm: false },
      { jour: 'Mercredi', am: false, pm: false },
      { jour: 'Jeudi', am: false, pm: false },
      { jour: 'Vendredi', am: false, pm: false },
      { jour: 'Samedi', am: false, pm: false },
      { jour: 'Dimanche', am: false, pm: false }
    ],
    statut: 'actif' as 'actif' | 'inactif' | 'en pause' | 'en attente',
    sexe: 'Non spécifié' as 'Homme' | 'Femme' | 'Autre' | 'Non spécifié',
    dateInscription: new Date().toISOString().split('T')[0],
    dateNaissance: '',
    langues: [] as string[],
    adresse: '',
    ville: '',
    codePostal: '',
    quartier: '',
    voiture: false,
    joursDisponibles: [] as JourDisponible[],
    notes: [] as Note[],
    notasGenerales: '',
    documents: [] as Document[],
    photo: null as string | null,
    poste: '',
    heuresSemaines: 0,
    reference: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaRelacion: '',
    contactoEmergenciaTelefono: '',
    contactoEmergenciaEmail: ''
  });
  const [editFormPhotoPreview, setEditFormPhotoPreview] = useState<string | null>(null);

  // New modal state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState(() => {
    // Intentar cargar el formulario en progreso desde localStorage
    const savedForm = localStorage.getItem('banqueAlimentaire_newBenevoleForm_temp');
    if (savedForm) {
      try {
        return JSON.parse(savedForm);
      } catch (error) {
        console.error('Error al cargar formulario temporal:', error);
      }
    }
    return {
      tipo: 'benevole' as TipoBenevole,
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      departement: [] as string[],
      disponibilites: '',
      disponibilidadesSemanal: [
        { jour: 'Lundi', am: false, pm: false },
        { jour: 'Mardi', am: false, pm: false },
        { jour: 'Mercredi', am: false, pm: false },
        { jour: 'Jeudi', am: false, pm: false },
        { jour: 'Vendredi', am: false, pm: false },
        { jour: 'Samedi', am: false, pm: false },
        { jour: 'Dimanche', am: false, pm: false }
      ],
      statut: 'actif' as 'actif' | 'inactif' | 'en pause' | 'en attente',
      sexe: 'Non spécifié' as 'Homme' | 'Femme' | 'Autre' | 'Non spécifié',
      dateInscription: new Date().toISOString().split('T')[0],
      dateNaissance: '',
      langues: [] as string[],
      adresse: '',
      ville: '',
      codePostal: '',
      quartier: '',
      voiture: false,
      joursDisponibles: [] as JourDisponible[],
      notes: [] as Note[],
      notasGenerales: '',
      documents: [] as Document[],
      photo: null as string | null,
      poste: '',
      heuresSemaines: 0,
      reference: '',
      contactoEmergenciaNombre: '',
      contactoEmergenciaRelacion: '',
      contactoEmergenciaTelefono: '',
      contactoEmergenciaEmail: ''
    };
  });
  const [newFormPhotoPreview, setNewFormPhotoPreview] = useState<string | null>(null);

  // Guardar formulario temporal en localStorage cuando cambie
  React.useEffect(() => {
    if (newModalOpen) {
      localStorage.setItem('banqueAlimentaire_newBenevoleForm_temp', JSON.stringify(newForm));
    }
  }, [newForm, newModalOpen]);

  // Estado para dialog de asignar bénévole a departamentos
  const [dialogAsignarDepartamentos, setDialogAsignarDepartamentos] = useState(false);
  const [benevoleSeleccionadoAsignar, setBenevoleSeleccionadoAsignar] = useState<Benevole | null>(null);
  const [departamentosAsignar, setDepartamentosAsignar] = useState<string[]>([]);

  // ✅ Efecto para cargar departamentos cuando se selecciona un bénévole
  useEffect(() => {
    if (benevoleSeleccionadoAsignar && dialogAsignarDepartamentos) {
      // Cargar departamentos desde los contactos asociados al bénévole
      const todosLosContactos = obtenerContactosDepartamento();
      const contactosDelBenevole = todosLosContactos.filter(c => 
        c.email.toLowerCase() === benevoleSeleccionadoAsignar.email.toLowerCase()
      );
      
      // Extraer los IDs únicos de departamentos donde está asignado
      const deptsActuales = [...new Set(contactosDelBenevole.map(c => c.departamentoId))].filter(id => id && id !== '');
      
      // Filtrar solo los departamentos que existen y están activos
      const departamentosActivos = obtenerDepartamentos().filter(d => d.activo);
      const idsActivos = departamentosActivos.map(d => d.id);
      const deptsValidados = deptsActuales.filter(id => idsActivos.includes(id));
      
      console.log('🔄 useEffect - Cargando departamentos del bénévole:', {
        benevole: `${benevoleSeleccionadoAsignar.prenom} ${benevoleSeleccionadoAsignar.nom}`,
        email: benevoleSeleccionadoAsignar.email,
        contactosEncontrados: contactosDelBenevole.length,
        departamentosAsignados: deptsActuales,
        departamentosValidados: deptsValidados
      });
      
      setDepartamentosAsignar(deptsValidados);
    }
  }, [benevoleSeleccionadoAsignar, dialogAsignarDepartamentos]);

  // Ref para input de foto
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editDocumentInputRef = useRef<HTMLInputElement>(null);

  // Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  // Rapports filter state
  const [rapportFilterType, setRapportFilterType] = useState<'departement' | 'statut' | 'benevole'>('departement');
  const [rapportFilterValue, setRapportFilterValue] = useState<string>('tous');
  const [rapportDateDebut, setRapportDateDebut] = useState<string>('');
  const [rapportDateFin, setRapportDateFin] = useState<string>('');
  const [rapportGenerated, setRapportGenerated] = useState(false);

  // Statistiques démographiques filter state
  const [statsFilterType, setStatsFilterType] = useState<'departement' | 'statut'>('departement');
  const [statsFilterValue, setStatsFilterValue] = useState<string>('tous');
  const [statsDateDebut, setStatsDateDebut] = useState<string>('');
  const [statsDateFin, setStatsDateFin] = useState<string>('');
  const [statsGenerated, setStatsGenerated] = useState(false);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedBenevolesForEmail, setSelectedBenevolesForEmail] = useState<number[]>([]);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    template: 'custom' as 'custom' | 'invitation' | 'rappel' | 'remerciement' | 'annonce'
  });

  // ID Digital modal state
  const [idDigitalModalOpen, setIdDigitalModalOpen] = useState(false);
  const [selectedBenevoleForID, setSelectedBenevoleForID] = useState<Benevole | null>(null);

  // Estado para diálogo de asignar rol
  const [dialogAsignarRolOpen, setDialogAsignarRolOpen] = useState(false);
  const [benevoleParaRol, setBenevoleParaRol] = useState<any>(null);

  // 🔄 Estado para forzar actualización de departamentos
  const [refreshDepartamentos, setRefreshDepartamentos] = useState(0);

  // Départements - Cargar desde el sistema
  const departementosStorage = obtenerDepartamentos();
  const departements = departementosStorage.map(d => d.nombre).filter(Boolean);

  const coincidenBenevoleYContacto = (benevole: Pick<Benevole, 'email' | 'numeroArchivo'>, contacto: Pick<ContactoDepartamento, 'email' | 'numeroArchivo'>) => {
    if (benevole.numeroArchivo && contacto.numeroArchivo) {
      return benevole.numeroArchivo === contacto.numeroArchivo;
    }

    return benevole.email.toLowerCase() === contacto.email.toLowerCase();
  };

  const obtenerDepartamentoPrincipalContacto = (contacto: ContactoDepartamento) => {
    const departamentosIds = [...new Set([
      ...(Array.isArray(contacto.departamentoIds) ? contacto.departamentoIds : []),
      contacto.departamentoId
    ].filter(Boolean))];

    return departamentosIds
      .map(id => departementosStorage.find(departamento => departamento.id === id)?.nombre)
      .find(Boolean) || '';
  };

  const convertirIdiomasContacto = (idiomas?: ContactoDepartamento['idiomas']) => {
    const langMap: Record<string, string> = {
      es: 'Espagnol',
      fr: 'Français',
      en: 'Anglais',
      ar: 'Arabe'
    };

    return idiomas?.map(lang => langMap[lang] || lang) || [];
  };

  const crearBenevoleDesdeContacto = (contacto: ContactoDepartamento, id: number): Benevole => ({
    id,
    identifiant: contacto.numeroArchivo || '',
    numeroArchivo: contacto.numeroArchivo,
    tipo: 'benevole',
    nom: contacto.apellido || '',
    prenom: contacto.nombre || '',
    email: contacto.email,
    telephone: contacto.telefono,
    departement: obtenerDepartamentoPrincipalContacto(contacto),
    disponibilites: contacto.disponibilidad || '',
    disponibilidadesSemanal: contacto.disponibilidades,
    statut: contacto.activo ? 'actif' : 'inactif',
    heuresTotal: 0,
    heuresMois: 0,
    dateInscription: (contacto.fechaIngreso || new Date().toISOString()).split('T')[0],
    sexe: contacto.genero,
    dateNaissance: contacto.fechaNacimiento,
    langues: convertirIdiomasContacto(contacto.idiomas),
    adresse: contacto.direccion,
    appartement: contacto.apartamento,
    ville: contacto.ciudad,
    codePostal: contacto.codigoPostal,
    quartier: contacto.quartier,
    notasGenerales: contacto.notas,
    documents: contacto.documents,
    photo: contacto.foto || null,
    poste: contacto.cargo,
    heuresSemaines: contacto.heuresSemaines,
    reference: contacto.reference
  });

  // Jours de la semaine
  const joursDisponibles = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche'
  ];

  // Langues disponibles
  const languesDisponibles = [
    'Français',
    'Anglais',
    'Espagnol',
    'Arabe',
    'Créole',
    'Mandarin',
    'Portugais',
    'Italien'
  ];

  // Quartiers de Laval (TOUS les barrios oficiales)
  const quartiersDisponibles = obtenirQuartiersLaval();

  // Plantillas d'email
  const emailTemplates = {
    custom: { subject: '', message: '' },
    invitation: {
      subject: 'Invitation à un événement spécial',
      message: 'Bonjour,\n\nNous avons le plaisir de vous inviter à participer à notre prochain événement.\n\nDate: [À compléter]\nLieu: [À compléter]\n\nNous comptons sur votre présence!\n\nCordialement,\nL\'équipe de la Banque Alimentaire'
    },
    rappel: {
      subject: 'Rappel - Votre prochaine session de bénévolat',
      message: 'Bonjour,\n\nCeci est un rappel concernant votre prochaine session de bénévolat.\n\nDate: [À compléter]\nHoraire: [À compléter]\nDépartement: [À compléter]\n\nMerci de confirmer votre présence.\n\nCordialement,\nL\'équipe de la Banque Alimentaire'
    },
    remerciement: {
      subject: 'Merci pour votre engagement!',
      message: 'Cher(e) bénévole,\n\nNous tenons à vous remercier chaleureusement pour votre précieux engagement et le temps que vous consacrez à notre mission.\n\nVotre contribution fait une réelle différence dans notre communauté.\n\nMerci encore!\n\nCordialement,\nL\'équipe de la Banque Alimentaire'
    },
    annonce: {
      subject: 'Annonce importante',
      message: 'Bonjour,\n\nNous souhaitons vous informer d\'une annonce importante concernant nos activités.\n\n[Votre message ici]\n\nN\'hésitez pas à nous contacter pour toute question.\n\nCordialement,\nL\'équipe de la Banque Alimentaire'
    }
  };

  // Roles disponibles del sistema
  const rolesDisponibles = [
    {
      id: 'desarrollador',
      nombre: 'Développeur',
      descripcion: 'Accès complet au système avec permissions de développement et debugging',
      color: '#000000'
    },
    {
      id: 'administrador',
      nombre: 'Administrateur',
      descripcion: 'Gestion complète du système et de toutes les opérations',
      color: '#DC3545'
    },
    {
      id: 'coordinador',
      nombre: 'Coordinateur',
      descripcion: 'Coordination des opérations, gestion des commandes et de l\'inventaire',
      color: '#1E73BE'
    },
    {
      id: 'responsable_entrepot',
      nombre: 'Responsable Entrepôt',
      descripcion: 'Gestion de l\'entrepôt, inventaire et réception des produits',
      color: '#4CAF50'
    },
    {
      id: 'responsable_comptoir',
      nombre: 'Responsable Comptoir',
      descripcion: 'Gestion du comptoir, bénéficiaires et distribution d\'aide',
      color: '#2d9561'
    },
    {
      id: 'responsable_transport',
      nombre: 'Responsable Transport',
      descripcion: 'Gestion du transport, véhicules, routes et livraisons',
      color: '#FFC107'
    },
    {
      id: 'liaison_organisme',
      nombre: 'Liaison Organisme',
      descripcion: 'Communication avec les organismes et gestion des relations',
      color: '#9C27B0'
    },
    {
      id: 'benevole_comptoir',
      nombre: 'Bénévole Comptoir',
      descripcion: 'Aide au comptoir et assistance aux bénéficiaires',
      color: '#17A2B8'
    },
    {
      id: 'benevole_entrepot',
      nombre: 'Bénévole Entrepôt',
      descripcion: 'Aide à l\'entrepôt et organisation des produits',
      color: '#28A745'
    },
    {
      id: 'employe',
      nombre: 'Employé',
      descripcion: 'Employé général avec accès aux fonctions courantes',
      color: '#6C757D'
    },
    {
      id: 'visualizador',
      nombre: 'Visualiseur',
      descripcion: 'Accès en lecture seule au système',
      color: '#9E9E9E'
    }
  ];

  // Mock Data - Bénévoles
  const [benevoles, setBenevoles] = useState<Benevole[]>(() => {
    // Cargar bénévoles desde localStorage al iniciar
    const stored = localStorage.getItem('banqueAlimentaire_benevoles');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar bénévoles:', error);
        return []; // PRODUCCIÓN: Array vacío, no usar datos de ejemplo
      }
    }
    return []; // PRODUCCIÓN: Array vacío, no usar datos de ejemplo
  });

  // 🔧 NORMALIZAR estados al montar el componente (convertir "Actif" a "actif", etc.)
  React.useEffect(() => {
    const normalizarEstados = () => {
      const benevolesNormalizados = benevoles.map(b => ({
        ...b,
        statut: (b.statut?.toLowerCase().trim() || 'actif') as 'actif' | 'inactif' | 'en pause' | 'en attente'
      }));
      
      // Solo actualizar si hay cambios
      const hayCambios = benevolesNormalizados.some((bn, i) => bn.statut !== benevoles[i].statut);
      if (hayCambios) {
        console.log('🔧 Normalizando estados de bénévoles...');
        setBenevoles(benevolesNormalizados);
      }
    };
    
    if (benevoles.length > 0) {
      normalizarEstados();
    }
  }, []); // Solo ejecutar al montar

  // Guardar bénévoles en localStorage cada vez que cambien
  React.useEffect(() => {
    localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevoles));
  }, [benevoles]);

  // 🔄 SINCRONIZAR números de archivo desde contactos a bénévoles
  React.useEffect(() => {
    const sincronizarNumerosArchivo = () => {
      // Leer benevoles directamente de localStorage para evitar dependencias circulares
      const storedBenevoles = localStorage.getItem('banqueAlimentaire_benevoles');
      let benevolesActuales: Benevole[] = [];

      if (storedBenevoles) {
        try {
          benevolesActuales = JSON.parse(storedBenevoles);
        } catch (error) {
          console.error('Error al leer bénévoles para sincronización:', error);
        }
      }

      const contactos = obtenerContactosDepartamento().filter(contacto => contacto.tipo === 'benevole');
      let actualizado = false;
      
      const benevolesActualizados = benevolesActuales.map((benevole: Benevole) => {
        const contacto = contactos.find(c => coincidenBenevoleYContacto(benevole, c));
        
        // ✅ Si existe el contacto, sincronizar TODOS los datos relevantes
        if (contacto) {
          const statutSincronizado = contacto.activo ? 'actif' : 'inactif';

          // Verificar si hay cambios en cualquier campo relevante
          const hayCambios = 
            contacto.numeroArchivo !== benevole.numeroArchivo ||
            contacto.direccion !== benevole.adresse ||
            contacto.apartamento !== benevole.appartement ||
            contacto.ciudad !== benevole.ville ||
            contacto.codigoPostal !== benevole.codePostal ||
            contacto.telefono !== benevole.telephone ||
            contacto.nombre !== benevole.prenom ||
            contacto.apellido !== benevole.nom ||
            contacto.notas !== benevole.notasGenerales ||
            statutSincronizado !== benevole.statut;
          
          if (hayCambios) {
            console.log(`🔄 Sincronizando datos completos para ${benevole.prenom} ${benevole.nom}:`, {
              numeroArchivo: contacto.numeroArchivo,
              direccion: contacto.direccion,
              apartamento: contacto.apartamento,
              ciudad: contacto.ciudad,
              codigoPostal: contacto.codigoPostal,
              telefono: contacto.telefono
            });
            actualizado = true;
            
            return {
              ...benevole,
              numeroArchivo: contacto.numeroArchivo,
              prenom: contacto.nombre,
              nom: contacto.apellido,
              telephone: contacto.telefono,
              statut: statutSincronizado,
              adresse: contacto.direccion || benevole.adresse,
              appartement: contacto.apartamento || benevole.appartement,
              ville: contacto.ciudad || benevole.ville,
              codePostal: contacto.codigoPostal || benevole.codePostal,
              notasGenerales: contacto.notas || benevole.notasGenerales,
              poste: contacto.cargo || benevole.poste,
              heuresSemaines: contacto.heuresSemaines || benevole.heuresSemaines,
              reference: contacto.reference || benevole.reference,
              sexe: contacto.genero || benevole.sexe,
              dateNaissance: contacto.fechaNacimiento || benevole.dateNaissance,
              langues: convertirIdiomasContacto(contacto.idiomas).length > 0 ? convertirIdiomasContacto(contacto.idiomas) : benevole.langues,
              disponibilidadesSemanal: contacto.disponibilidades || benevole.disponibilidadesSemanal,
              photo: contacto.foto || benevole.photo
            };
          }
        }
        
        return benevole;
      });

      let nextId = Math.max(0, ...benevolesActualizados.map(benevole => benevole.id));
      const benevolesImportados = contactos
        .filter(contacto => !benevolesActualizados.some(benevole => coincidenBenevoleYContacto(benevole, contacto)))
        .map(contacto => {
          actualizado = true;
          nextId += 1;
          return crearBenevoleDesdeContacto(contacto, nextId);
        });

      const benevolesSincronizados = [...benevolesActualizados, ...benevolesImportados];

      if (benevolesImportados.length > 0) {
        console.log('✅ Bénévoles importés depuis la base partagée:', benevolesImportados.map(benevole => `${benevole.prenom} ${benevole.nom}`));
      }
      
      if (actualizado) {
        console.log('✅ Sincronización completa de bénévoles actualizada');
        setBenevoles(benevolesSincronizados);
      }
    };
    
    // Ejecutar sincronización al montar el componente
    sincronizarNumerosArchivo();
    
    // Escuchar cambios en contactos
    const handleContactosUpdate = () => {
      console.log('🔔 Benevoles: Evento contactos-actualizados recibido');
      sincronizarNumerosArchivo();
      // 🔄 Forzar actualización de departamentos para reflejar cambios
      setRefreshDepartamentos(prev => prev + 1);
    };
    
    window.addEventListener('contactos-actualizados', handleContactosUpdate);
    
    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosUpdate);
    };
  }, []); // ✅ Sin dependencias para evitar loops infinitos

  // ⚡ OPTIMIZACIÓN: Debounce del searchTerm para mejorar rendimiento
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Mock Data - Feuilles de temps
  const [feuillesTemps, setFeuillesTemps] = useState<FeuilleTemps[]>(() => {
    // Cargar feuilles de temps desde localStorage al iniciar
    const stored = localStorage.getItem('banqueAlimentaire_feuillesTemps');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar feuilles de temps:', error);
        return []; // PRODUCCIÓN: Array vacío, no usar datos de ejemplo
      }
    }
    return []; // PRODUCCIÓN: Array vacío, no usar datos de ejemplo
  });

  // Guardar feuilles de temps en localStorage cada vez que cambien
  React.useEffect(() => {
    localStorage.setItem('banqueAlimentaire_feuillesTemps', JSON.stringify(feuillesTemps));
  }, [feuillesTemps]);

  // Form states
  const [newFeuilleTemps, setNewFeuilleTemps] = useState({
    benevoleId: '',
    departement: '',
    date: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: '',
    notes: ''
  });

  // Estado para búsqueda de bénévoles en el selector
  const [searchBenevole, setSearchBenevole] = useState('');
  const [searchSortiePending, setSearchSortiePending] = useState('');

  // Estados para edición de feuille de temps
  const [editingFeuilleId, setEditingFeuilleId] = useState<number | null>(null);
  const [editFeuilleTemps, setEditFeuilleTemps] = useState<FeuilleTemps | null>(null);

  // La gestion des feuilles de temps est reservee au module Recrutement.
  const gestionFeuillesTempsDepuisRecrutement = false;

  // Verificar permisos del usuario para correcciones
  const usuarioActual = obtenerUsuarioSesion();
  const puedeCorregir = gestionFeuillesTempsDepuisRecrutement && usuarioActual && (
    tienePermiso('administrador_general') || 
    tienePermiso('acceso_total') || 
    tienePermiso('desarrollador')
  );

  const selectedBenevole = benevoles.find(b => b.id === selectedBenevoleId);

  // Format hours without decimals (or with minutes if needed)
  const formatHeures = (heures: number): string => {
    const heuresEntier = Math.floor(heures);
    const minutes = Math.round((heures - heuresEntier) * 60);
    
    if (minutes === 0) {
      return `${heuresEntier}h`;
    }
    return `${heuresEntier}h ${minutes}min`;
  };

  // Helper: Render status badge with proper colors
  const getStatusBadge = (statut: string) => {
    // Todos los estados posibles de bénévoles
    const statusConfigurations: Record<string, { label: string; color: string }> = {
      'actif': { label: 'Actif', color: 'bg-[#4CAF50] text-white' },
      'inactif': { label: 'Inactif', color: 'bg-[#999999] text-white' },
      'en pause': { label: 'En pause', color: 'bg-[#FFC107] text-[#333333]' },
      'en attente': { label: 'En attente', color: 'bg-[#FF9800] text-white' }
    };
    
    // 🔧 FIX: Normalizar el statut a minúsculas para comparación
    const statutNormalized = (statut || '').toLowerCase().trim();
    const config = statusConfigurations[statutNormalized];
    
    // Si el estado no existe, mostrar badge genérico
    if (!config) {
      console.warn(`Estado desconocido: ${statut}`);
      return <Badge className="bg-gray-400 text-white">{statut || 'N/A'}</Badge>;
    }
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const calculateDuree = (debut: string, fin: string): number => {
    if (!debut || !fin) return 0;
    const [hDebut, mDebut] = debut.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);
    const minutesDebut = hDebut * 60 + mDebut;
    const minutesFin = hFin * 60 + mFin;
    return Math.max(0, (minutesFin - minutesDebut) / 60);
  };

  const handleAddFeuilleTemps = () => {
    if (!newFeuilleTemps.benevoleId || !newFeuilleTemps.departement || !newFeuilleTemps.heureDebut || !newFeuilleTemps.heureFin) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const duree = calculateDuree(newFeuilleTemps.heureDebut, newFeuilleTemps.heureFin);
    if (duree <= 0) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    const benevole = benevoles.find(b => b.id === parseInt(newFeuilleTemps.benevoleId));
    if (!benevole) return;

    const nouvelleFeuille: FeuilleTemps = {
      id: feuillesTemps.length + 1,
      benevoleId: parseInt(newFeuilleTemps.benevoleId),
      benevoleName: `${benevole.prenom} ${benevole.nom}`,
      departement: newFeuilleTemps.departement,
      date: newFeuilleTemps.date,
      heureDebut: newFeuilleTemps.heureDebut,
      heureFin: newFeuilleTemps.heureFin,
      duree,
      notes: newFeuilleTemps.notes
    };

    setFeuillesTemps([nouvelleFeuille, ...feuillesTemps]);

    // Update benevole hours
    setBenevoles(prev => prev.map(b => {
      if (b.id === parseInt(newFeuilleTemps.benevoleId)) {
        return {
          ...b,
          heuresTotal: b.heuresTotal + duree,
          heuresMois: b.heuresMois + duree
        };
      }
      return b;
    }));

    setNewFeuilleTemps({
      benevoleId: '',
      departement: '',
      date: new Date().toISOString().split('T')[0],
      heureDebut: '',
      heureFin: '',
      notes: ''
    });

    toast.success(`Feuille de temps enregistrée: ${formatHeures(duree)}`);
  };

  // NUEVA FUNCIÓN: Registrar solo la entrada (sin salida)
  const handleRegistrarEntrada = () => {
    if (!newFeuilleTemps.benevoleId || !newFeuilleTemps.departement) {
      toast.error('Veuillez sélectionner un bénévole et un département');
      return;
    }

    const benevole = benevoles.find(b => b.id === parseInt(newFeuilleTemps.benevoleId));
    if (!benevole) return;

    // NUEVA VALIDACIÓN: Verificar si el voluntario ya tiene una entrada activa sin salida registrada
    const tieneEntradaActiva = feuillesTemps.some(f => 
      f.benevoleId === parseInt(newFeuilleTemps.benevoleId) && 
      f.enCours === true
    );

    if (tieneEntradaActiva) {
      toast.error('Ce bénévole a déjà une entrée active. Veuillez enregistrer la sortie d\'abord.', {
        description: `${benevole.prenom} ${benevole.nom} doit terminer sa session en cours`,
        duration: 5000
      });
      return;
    }

    // Capturar hora actual si no se ha ingresado una
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const heureDebut = newFeuilleTemps.heureDebut || `${hours}:${minutes}`;

    const nouvelleFeuille: FeuilleTemps = {
      id: Date.now(), // Usar timestamp para ID único
      benevoleId: parseInt(newFeuilleTemps.benevoleId),
      benevoleName: `${benevole.prenom} ${benevole.nom}`,
      departement: newFeuilleTemps.departement,
      date: newFeuilleTemps.date,
      heureDebut: heureDebut,
      heureFin: '', // Vacío porque aún no ha terminado
      duree: 0, // Duración 0 porque aún no ha terminado
      notes: newFeuilleTemps.notes,
      enCours: true // Marcado como en progreso
    };

    setFeuillesTemps([nouvelleFeuille, ...feuillesTemps]);

    setNewFeuilleTemps({
      benevoleId: '',
      departement: '',
      date: new Date().toISOString().split('T')[0],
      heureDebut: '',
      heureFin: '',
      notes: ''
    });

    toast.success(`Entrée enregistrée pour ${benevole.prenom} ${benevole.nom} à ${heureDebut}`, {
      description: 'Vous pourrez enregistrer la sortie plus tard',
      duration: 4000
    });
  };

  // NUEVA FUNCIÓN: Registrar la salida de una entrada existente
  const handleRegistrarSalida = (feuilleId: number) => {
    const feuille = feuillesTemps.find(f => f.id === feuilleId);
    if (!feuille || !feuille.enCours) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const heureFin = `${hours}:${minutes}`;

    const duree = calculateDuree(feuille.heureDebut, heureFin);
    
    if (duree <= 0) {
      toast.error('L\'heure de sortie doit être après l\'heure d\'entrée');
      return;
    }

    // Actualizar la feuille de temps
    setFeuillesTemps(prev => prev.map(f => 
      f.id === feuilleId 
        ? { ...f, heureFin, duree, enCours: false }
        : f
    ));

    // Actualizar las horas totales del bénévole
    setBenevoles(prev => prev.map(b => {
      if (b.id === feuille.benevoleId) {
        return {
          ...b,
          heuresTotal: b.heuresTotal + duree,
          heuresMois: b.heuresMois + duree
        };
      }
      return b;
    }));

    toast.success(`Sortie enregistrée: ${formatHeures(duree)} de travail`, {
      description: `${feuille.benevoleName} - ${feuille.heureDebut} à ${heureFin}`,
      duration: 4000
    });
  };

  // Funciones para edición de feuille de temps
  const handleStartEditFeuille = (feuille: FeuilleTemps) => {
    if (!puedeCorregir) {
      toast.error('Vous n\'avez pas les permissions nécessaires pour modifier les feuilles de temps');
      return;
    }
    setEditingFeuilleId(feuille.id);
    setEditFeuilleTemps({ ...feuille });
  };

  const handleCancelEditFeuille = () => {
    setEditingFeuilleId(null);
    setEditFeuilleTemps(null);
  };

  const handleSaveEditFeuille = () => {
    if (!puedeCorregir) {
      toast.error('Vous n\'avez pas les permissions nécessaires pour sauvegarder les modifications');
      return;
    }

    if (!editFeuilleTemps) return;

    if (!editFeuilleTemps.heureDebut || !editFeuilleTemps.heureFin) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const duree = calculateDuree(editFeuilleTemps.heureDebut, editFeuilleTemps.heureFin);
    if (duree <= 0) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    const originalFeuille = feuillesTemps.find(f => f.id === editFeuilleTemps.id);
    if (!originalFeuille) return;

    const dureeDifference = duree - originalFeuille.duree;

    // Actualizar feuille de temps
    setFeuillesTemps(prev => prev.map(f => 
      f.id === editFeuilleTemps.id 
        ? { ...editFeuilleTemps, duree }
        : f
    ));

    // Actualizar horas del bénévole
    setBenevoles(prev => prev.map(b => {
      if (b.id === editFeuilleTemps.benevoleId) {
        return {
          ...b,
          heuresTotal: b.heuresTotal + dureeDifference,
          heuresMois: b.heuresMois + dureeDifference
        };
      }
      return b;
    }));

    toast.success('✅ Feuille de temps mise à jour avec succès');
    setEditingFeuilleId(null);
    setEditFeuilleTemps(null);
  };

  const handleDeleteFeuille = (feuille: FeuilleTemps) => {
    if (!puedeCorregir) {
      toast.error('Vous n\'avez pas les permissions nécessaires pour supprimer les feuilles de temps');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée?')) return;

    // Actualizar horas del bénévole
    setBenevoles(prev => prev.map(b => {
      if (b.id === feuille.benevoleId) {
        return {
          ...b,
          heuresTotal: Math.max(0, b.heuresTotal - feuille.duree),
          heuresMois: Math.max(0, b.heuresMois - feuille.duree)
        };
      }
      return b;
    }));

    setFeuillesTemps(prev => prev.filter(f => f.id !== feuille.id));
    toast.success('🗑️ Feuille de temps supprimée avec succès');
  };

  // Función para actualizar disponibilidad semanal (newForm)
  const updateDisponibilidadNew = (index: number, periodo: 'am' | 'pm', checked: boolean) => {
    const nuevasDisponibilidades = [...newForm.disponibilidadesSemanal];
    nuevasDisponibilidades[index][periodo] = checked;
    setNewForm({ ...newForm, disponibilidadesSemanal: nuevasDisponibilidades });
  };

  // Función para actualizar disponibilidad semanal (editForm)
  const updateDisponibilidadEdit = (index: number, periodo: 'am' | 'pm', checked: boolean) => {
    const nuevasDisponibilidades = [...editForm.disponibilidadesSemanal];
    nuevasDisponibilidades[index][periodo] = checked;
    setEditForm({ ...editForm, disponibilidadesSemanal: nuevasDisponibilidades });
  };

  // Función para toggle idiomas (newForm)
  const toggleIdiomaNew = (idioma: string) => {
    const langues = newForm.langues.includes(idioma)
      ? newForm.langues.filter(l => l !== idioma)
      : [...newForm.langues, idioma];
    setNewForm({ ...newForm, langues });
  };

  // Función para toggle idiomas (editForm)
  const toggleIdiomaEdit = (idioma: string) => {
    const langues = editForm.langues.includes(idioma)
      ? editForm.langues.filter(l => l !== idioma)
      : [...editForm.langues, idioma];
    setEditForm({ ...editForm, langues });
  };

  // Configuración de tipos de bénévole
  const getTipoBenevoleConfig = (tipo: TipoBenevole) => {
    const configs = {
      benevole: { label: 'Bénévole', icon: Heart, color: '#4CAF50', bgColor: '#E8F5E9' },
      stagiaire: { label: 'Stagiaire', icon: User, color: '#2196F3', bgColor: '#E3F2FD' },
      employe: { label: 'Employé', icon: Briefcase, color: '#FF9800', bgColor: '#FFF3E0' },
      coordinateur: { label: 'Coordinateur', icon: UserCheck, color: '#9C27B0', bgColor: '#F3E5F5' },
      responsable: { label: 'Responsable', icon: Star, color: '#F44336', bgColor: '#FFEBEE' },
      autre: { label: 'Autre', icon: Users, color: '#607D8B', bgColor: '#ECEFF1' }
    };
    return configs[tipo];
  };

  // Handlers for edit modal - Ahora usa el mismo formulario que para crear
  const handleOpenEditModal = (benevole: Benevole) => {
    setEditingBenevole(benevole);
    
    // Configurar el formulario con los datos del bénévole
    setNewForm({
      tipo: benevole.tipo || 'benevole',
      nom: benevole.nom,
      prenom: benevole.prenom,
      email: benevole.email,
      telephone: benevole.telephone,
      departement: Array.isArray(benevole.departement) ? benevole.departement : [benevole.departement],
      disponibilites: benevole.disponibilites,
      disponibilidadesSemanal: benevole.disponibilidadesSemanal || [
        { jour: 'Lundi', am: false, pm: false },
        { jour: 'Mardi', am: false, pm: false },
        { jour: 'Mercredi', am: false, pm: false },
        { jour: 'Jeudi', am: false, pm: false },
        { jour: 'Vendredi', am: false, pm: false },
        { jour: 'Samedi', am: false, pm: false },
        { jour: 'Dimanche', am: false, pm: false }
      ],
      statut: benevole.statut,
      sexe: benevole.sexe || 'Non spécifié',
      dateInscription: benevole.dateInscription,
      dateNaissance: benevole.dateNaissance || '',
      langues: benevole.langues || [],
      adresse: benevole.adresse || '',
      ville: benevole.ville || '',
      codePostal: benevole.codePostal || '',
      quartier: benevole.quartier || '',
      voiture: benevole.voiture || false,
      joursDisponibles: benevole.joursDisponibles || [],
      notes: benevole.notes || [],
      notasGenerales: benevole.notasGenerales || '',
      documents: benevole.documents || [],
      photo: benevole.photo || null,
      poste: benevole.poste || '',
      heuresSemaines: benevole.heuresSemaines || 0,
      reference: benevole.reference || '',
      contactoEmergenciaNombre: benevole.contactoEmergenciaNombre || '',
      contactoEmergenciaRelacion: benevole.contactoEmergenciaRelacion || '',
      contactoEmergenciaTelefono: benevole.contactoEmergenciaTelefono || '',
      contactoEmergenciaEmail: benevole.contactoEmergenciaEmail || ''
    });
    
    setNewFormPhotoPreview(benevole.photo || null);
    setNewModalOpen(true); // Abrir el modal de nuevo (que ahora funciona en modo edición)
  };

  const handleSaveEdit = () => {
    if (!editForm.nom || !editForm.prenom || !editForm.email) {
      toast.error('Veuillez remplir tous les champs obligatoires (nom, prénom, email)');
      return;
    }

    if (!editForm.departement || (Array.isArray(editForm.departement) && editForm.departement.length === 0)) {
      toast.error('⚠️ Vous devez sélectionner au moins un département');
      return;
    }

    if (!editingBenevole) return;

    setBenevoles(prev => prev.map(b => {
      if (b.id === editingBenevole.id) {
        return {
          ...b,
          tipo: editForm.tipo,
          nom: editForm.nom,
          prenom: editForm.prenom,
          email: editForm.email,
          telephone: editForm.telephone,
          departement: Array.isArray(editForm.departement) 
            ? (editForm.departement.length > 0 ? editForm.departement[0] : '') 
            : editForm.departement,
          disponibilites: editForm.disponibilites,
          disponibilidadesSemanal: editForm.disponibilidadesSemanal,
          statut: editForm.statut,
          sexe: editForm.sexe,
          dateInscription: editForm.dateInscription,
          dateNaissance: editForm.dateNaissance,
          langues: editForm.langues,
          adresse: editForm.adresse,
          ville: editForm.ville,
          codePostal: editForm.codePostal,
          quartier: editForm.quartier,
          voiture: editForm.voiture,
          joursDisponibles: editForm.joursDisponibles,
          notes: editForm.notes,
          notasGenerales: editForm.notasGenerales,
          documents: editForm.documents,
          photo: editForm.photo,
          poste: editForm.poste,
          heuresSemaines: editForm.heuresSemaines,
          reference: editForm.reference,
          contactoEmergenciaNombre: editForm.contactoEmergenciaNombre,
          contactoEmergenciaRelacion: editForm.contactoEmergenciaRelacion,
          contactoEmergenciaTelefono: editForm.contactoEmergenciaTelefono,
          contactoEmergenciaEmail: editForm.contactoEmergenciaEmail
        };
      }
      return b;
    }));

    // Update feuilles de temps names
    setFeuillesTemps(prev => prev.map(f => {
      if (f.benevoleId === editingBenevole.id) {
        return {
          ...f,
          benevoleName: `${editForm.prenom} ${editForm.nom}`
        };
      }
      return f;
    }));

    // 🔄 SINCRONIZAR AUTOMÁTICAMENTE CON CONTACTOS DE DEPARTAMENTO
    try {
      const resultado = sincronizarDesdeBenevole({
        email: editForm.email,
        nom: editForm.nom,
        prenom: editForm.prenom,
        telephone: editForm.telephone,
        direccion: editForm.adresse,
        apartamento: editForm.appartement,
        ciudad: editForm.ville,
        codigoPostal: editForm.codePostal,
        statut: editForm.statut,
        disponibilidadesSemanal: editForm.disponibilidadesSemanal,
        photo: editForm.photo,
        poste: editForm.poste,
        sexe: editForm.sexe,
        dateNaissance: editForm.dateNaissance,
        langues: editForm.langues,
        urgenceNom: editForm.contactoEmergenciaNombre,
        urgenceRelation: editForm.contactoEmergenciaRelacion,
        urgenceTelephone: editForm.contactoEmergenciaTelefono,
        urgenceEmail: editForm.contactoEmergenciaEmail,
        notes: editForm.notes || editForm.notasGenerales
      });

      if (resultado.actualizados > 0) {
        console.log(`✅ Bénévole synchronisé avec ${resultado.actualizados} contact(s) dans ${resultado.departamentos.length} département(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }

    // 📝 REGISTRAR ACTIVIDAD
    registrarActividad(
      'Bénévoles',
      'modificar',
      `Bénévole "${editForm.prenom} ${editForm.nom}" modifié`,
      { benevoleId: editingBenevole.id, email: editForm.email }
    );

    toast.success('Bénévole modifié avec succès');
    setEditModalOpen(false);
    setEditingBenevole(null);
    setEditFormPhotoPreview(null);
  };

  // Handlers for new modal - Ahora maneja tanto creación como edición
  const handleSaveNew = () => {
    if (!newForm.nom || !newForm.prenom || !newForm.email) {
      toast.error('Veuillez remplir tous les champs obligatoires (nom, prénom, email)');
      return;
    }

    if (!newForm.departement || newForm.departement.length === 0) {
      toast.error('⚠️ Vous devez sélectionner au moins un département');
      return;
    }

    // Convertir documentos de newForm (interface de FormularioNouveauBenevole) al formato de Benevole
    const convertedDocuments = (newForm.documents || []).map((doc: any) => ({
      id: Date.now() + Math.floor(Math.random() * 10000),
      nom: doc.name || doc.nom,
      type: doc.type,
      date: doc.uploadDate ? new Date(doc.uploadDate).toISOString().split('T')[0] : doc.date || new Date().toISOString().split('T')[0],
      url: doc.url,
      taille: doc.size ? formatFileSize(doc.size) : doc.taille || '0 KB'
    }));

    // MODO EDICIÓN: Si editingBenevole existe, actualizar el bénévole existente
    if (editingBenevole) {
      setBenevoles(benevoles.map(b => {
        if (b.id === editingBenevole.id) {
          return {
            ...b,
            tipo: newForm.tipo,
            nom: newForm.nom,
            prenom: newForm.prenom,
            email: newForm.email,
            telephone: newForm.telephone,
            departement: Array.isArray(newForm.departement) 
              ? (newForm.departement.length > 0 ? newForm.departement[0] : '') 
              : newForm.departement,
            disponibilites: newForm.disponibilites,
            disponibilidadesSemanal: newForm.disponibilidadesSemanal,
            statut: (newForm.statut?.toLowerCase().trim() || 'actif') as 'actif' | 'inactif' | 'en pause' | 'en attente',
            sexe: newForm.sexe,
            dateInscription: newForm.dateInscription,
            dateNaissance: newForm.dateNaissance,
            langues: newForm.langues,
            adresse: newForm.adresse,
            ville: newForm.ville,
            codePostal: newForm.codePostal,
            quartier: newForm.quartier,
            voiture: newForm.voiture,
            joursDisponibles: newForm.joursDisponibles,
            notes: newForm.notes,
            notasGenerales: newForm.notasGenerales,
            documents: convertedDocuments,
            photo: newForm.photo,
            poste: newForm.poste,
            heuresSemaines: newForm.heuresSemaines,
            reference: newForm.reference,
            contactoEmergenciaNombre: newForm.contactoEmergenciaNombre,
            contactoEmergenciaRelacion: newForm.contactoEmergenciaRelacion,
            contactoEmergenciaTelefono: newForm.contactoEmergenciaTelefono,
            contactoEmergenciaEmail: newForm.contactoEmergenciaEmail
          };
        }
        return b;
      }));

      // Update feuilles de temps names
      setFeuillesTemps(prev => prev.map(f => {
        if (f.benevoleId === editingBenevole.id) {
          return {
            ...f,
            benevoleName: `${newForm.prenom} ${newForm.nom}`
          };
        }
        return f;
      }));

      // 🔄 SINCRONIZAR AUTOMÁTICAMENTE CON CONTACTOS DE DEPARTAMENTO
      try {
        const resultado = sincronizarDesdeBenevole({
          email: newForm.email,
          nom: newForm.nom,
          prenom: newForm.prenom,
          telephone: newForm.telephone,
          direccion: newForm.adresse,
          apartamento: newForm.appartement,
          ciudad: newForm.ville,
          codigoPostal: newForm.codePostal,
          statut: newForm.statut,
          disponibilidadesSemanal: newForm.disponibilidadesSemanal,
          photo: newForm.photo,
          poste: newForm.poste,
          sexe: newForm.sexe,
          dateNaissance: newForm.dateNaissance,
          langues: newForm.langues,
          urgenceNom: newForm.contactoEmergenciaNombre,
          urgenceRelation: newForm.contactoEmergenciaRelacion,
          urgenceTelephone: newForm.contactoEmergenciaTelefono,
          urgenceEmail: newForm.contactoEmergenciaEmail,
          notes: newForm.notes || newForm.notasGenerales
        });

        if (resultado.actualizados > 0) {
          console.log(`✅ Bénévole synchronisé avec ${resultado.actualizados} contact(s) dans ${resultado.departamentos.length} département(s)`);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error);
      }

      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Bénévoles',
        'modificar',
        `Bénévole "${newForm.prenom} ${newForm.nom}" modifié`,
        { benevoleId: editingBenevole.id, email: newForm.email }
      );

      // 🔔 DISPARAR EVENTO DE BÉNÉVOLE ACTUALIZADO
      window.dispatchEvent(new CustomEvent('benevole-sincronizado', {
        detail: {
          nombreCompleto: `${newForm.prenom} ${newForm.nom}`,
          email: newForm.email,
          tipo: 'modificar'
        }
      }));

      toast.success('Bénévole modifié avec succès');
      setEditingBenevole(null);
    } else {
      // MODO CREACIÓN: Crear un nuevo bénévole
      const maxId = Math.max(...benevoles.map(b => b.id), 0);
      
      const nouveauBenevole: Benevole = {
        id: maxId + 1,
        identifiant: '', // Solo se usa numeroArchivo
        tipo: newForm.tipo,
        nom: newForm.nom,
        prenom: newForm.prenom,
        email: newForm.email,
        telephone: newForm.telephone,
        departement: Array.isArray(newForm.departement) 
          ? (newForm.departement.length > 0 ? newForm.departement[0] : '') 
          : newForm.departement,
        disponibilites: newForm.disponibilites,
        disponibilidadesSemanal: newForm.disponibilidadesSemanal,
        statut: (newForm.statut?.toLowerCase().trim() || 'actif') as 'actif' | 'inactif' | 'en pause' | 'en attente',
        heuresTotal: 0,
        heuresMois: 0,
        dateInscription: newForm.dateInscription,
        sexe: newForm.sexe,
        dateNaissance: newForm.dateNaissance,
        langues: newForm.langues,
        adresse: newForm.adresse,
        ville: newForm.ville,
        codePostal: newForm.codePostal,
        quartier: newForm.quartier,
        voiture: newForm.voiture,
        joursDisponibles: newForm.joursDisponibles,
        notes: newForm.notes,
        notasGenerales: newForm.notasGenerales,
        documents: convertedDocuments,
        photo: newForm.photo,
        poste: newForm.poste,
        heuresSemaines: newForm.heuresSemaines,
        reference: newForm.reference,
        contactoEmergenciaNombre: newForm.contactoEmergenciaNombre,
        contactoEmergenciaRelacion: newForm.contactoEmergenciaRelacion,
        contactoEmergenciaTelefono: newForm.contactoEmergenciaTelefono,
        contactoEmergenciaEmail: newForm.contactoEmergenciaEmail
      };

      setBenevoles([...benevoles, nouveauBenevole]);
      
      // 🆕 CREAR AUTOMÁTICAMENTE CONTACTO EN DEPARTAMENTO(S) PARA GENERAR NÚMERO DE ARCHIVO
      const departamentosArray = Array.isArray(newForm.departement) 
        ? newForm.departement 
        : (newForm.departement ? [newForm.departement] : []);
      
      if (departamentosArray.length > 0) {
        departamentosArray.forEach((deptId) => {
          const nuevoContacto: Omit<ContactoDepartamento, 'id'> = {
            departamentoId: deptId,
            departamentoIds: departamentosArray,
            tipo: 'benevole',
            nombre: newForm.nom,
            apellido: newForm.prenom,
            fechaNacimiento: newForm.dateNaissance || '',
            genero: newForm.sexe === 'Homme' ? 'Homme' : newForm.sexe === 'Femme' ? 'Femme' : 'Non spécifié',
            email: newForm.email,
            telefono: newForm.telephone,
            cargo: newForm.poste || '',
            disponibilidad: newForm.disponibilites || '',
            disponibilidades: newForm.joursDisponibles?.map((j: any) => ({
              jour: j.jour,
              am: j.am || false,
              pm: j.pm || false
            })) || [],
            notas: newForm.notasGenerales || '',
            activo: newForm.statut === 'actif',
            fechaIngreso: newForm.dateInscription || new Date().toISOString().split('T')[0],
            direccion: newForm.adresse || '',
            apartamento: newForm.appartement || '',
            ciudad: newForm.ville || '',
            codigoPostal: newForm.codePostal || '',
            quartier: newForm.quartier || '', // ✅ CRÍTICO: Incluir quartier
            numeroEmpleado: '',
            horario: '',
            heuresSemaines: newForm.heuresSemaines || 0,
            reference: newForm.reference || '',
            supervisor: '',
            especialidad: '',
            certificaciones: [],
            idiomas: newForm.langues || [],
            foto: newForm.photo || '',
            documents: newForm.documents || [],
            urgenceNom: newForm.contactoEmergenciaNombre || '',
            urgenceRelacion: newForm.contactoEmergenciaRelacion || '',
            urgenceTelephone: newForm.contactoEmergenciaTelefono || '',
            urgenceEmail: newForm.contactoEmergenciaEmail || ''
          };

          const resultado = guardarContacto(nuevoContacto);
          console.log(`📝 Contacto creado automáticamente en departamento ${deptId} con número: ${resultado.numeroArchivo}`);
          
          // Actualizar el bénévole con el número de archivo generado
          if (resultado.numeroArchivo) {
            nouveauBenevole.numeroArchivo = resultado.numeroArchivo;
            console.log(`✅ Número de archivo asignado: ${resultado.numeroArchivo}`);
          }
        });
        
        // Actualizar el bénévole en el array con el número de archivo
        setBenevoles(prev => prev.map(b => 
          b.id === nouveauBenevole.id ? { ...b, numeroArchivo: nouveauBenevole.numeroArchivo } : b
        ));
        
        // 🔄 SINCRONIZAR AUTOMÁTICAMENTE SI SE ASIGNÓ A ENTREPÔT
        if (departamentosArray.some(dept => dept.toLowerCase().includes('entrepôt') || dept.toLowerCase().includes('entrepot'))) {
          console.log('🔄 Sincronizando bénévole a contactos de Entrepôt...');
          setTimeout(() => {
            const resultado = sincronizarVoluntariosEntrepot();
            if (resultado.sincronizados > 0) {
              toast.success('✅ Bénévole synchronisé automatiquement vers Contacts Entrepôt');
            }
          }, 500);
        }
      }
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Bénévoles',
        'crear',
        `Nouveau bénévole "${newForm.prenom} ${newForm.nom}" créé`,
        { benevoleId: nouveauBenevole.id, email: newForm.email }
      );

      // 🔔 DISPARAR EVENTO DE NUEVO BÉNÉVOLE CREADO
      window.dispatchEvent(new CustomEvent('benevole-sincronizado', {
        detail: {
          nombreCompleto: `${newForm.prenom} ${newForm.nom}`,
          email: newForm.email,
          tipo: 'crear'
        }
      }));

      toast.success('Nouveau bénévole créé avec succès');
    }

    // Limpiar el formulario temporal guardado
    localStorage.removeItem('banqueAlimentaire_newBenevoleForm_temp');

    // Reset form
    setNewForm({
      tipo: 'benevole',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      departement: [] as string[],
      disponibilites: '',
      disponibilidadesSemanal: [
        { jour: 'Lundi', am: false, pm: false },
        { jour: 'Mardi', am: false, pm: false },
        { jour: 'Mercredi', am: false, pm: false },
        { jour: 'Jeudi', am: false, pm: false },
        { jour: 'Vendredi', am: false, pm: false },
        { jour: 'Samedi', am: false, pm: false },
        { jour: 'Dimanche', am: false, pm: false }
      ],
      statut: 'actif' as 'actif' | 'inactif' | 'en pause' | 'en attente',
      sexe: 'Non spécifié' as 'Homme' | 'Femme' | 'Autre' | 'Non spécifié',
      dateInscription: new Date().toISOString().split('T')[0],
      dateNaissance: '',
      langues: [],
      adresse: '',
      ville: '',
      codePostal: '',
      quartier: '',
      voiture: false,
      joursDisponibles: [],
      notes: [],
      notasGenerales: '',
      documents: [],
      photo: null,
      poste: '',
      heuresSemaines: 0,
      reference: '',
      contactoEmergenciaNombre: '',
      contactoEmergenciaRelacion: '',
      contactoEmergenciaTelefono: '',
      contactoEmergenciaEmail: ''
    });
    setNewFormPhotoPreview(null);

    toast.success(`Bénévole ajouté: ${newForm.prenom} ${newForm.nom}`);
    setNewModalOpen(false);
  };

  // Función para abrir dialog de asignación de bénévole a departamentos
  const abrirDialogoAsignarDepartamentos = (benevole: Benevole) => {
    console.log('📋 Abriendo diálogo de asignación para:', `${benevole.prenom} ${benevole.nom}`);
    setBenevoleSeleccionadoAsignar(benevole);
    setDialogAsignarDepartamentos(true);
    // El useEffect se encargará de cargar los departamentos
  };

  // Función para guardar asignación de bénévole a departamentos
  const handleGuardarAsignacionDepartamentos = () => {
    if (!benevoleSeleccionadoAsignar) return;
    
    if (departamentosAsignar.length === 0) {
      toast.error('⚠️ Vous devez sélectionner au moins un département');
      return;
    }

    // ✅ PASO 1: Obtener contactos actuales del bénévole
    const todosLosContactos = obtenerContactosDepartamento();
    const contactosActuales = todosLosContactos.filter(c => 
      c.email.toLowerCase() === benevoleSeleccionadoAsignar.email.toLowerCase()
    );
    
    const deptsActuales = contactosActuales.map(c => c.departamentoId).filter(id => id && id !== '');
    const deptsNuevos = departamentosAsignar.filter(id => id && id !== '');
    
    // ✅ PASO 2: Encontrar departamentos a eliminar y a agregar
    const deptsAEliminar = deptsActuales.filter(id => !deptsNuevos.includes(id));
    const deptsAAgregar = deptsNuevos.filter(id => !deptsActuales.includes(id));
    const deptsQueSeQuedan = deptsActuales.filter(id => deptsNuevos.includes(id));
    
    console.log('🔄 Modificando asignación de departamentos:', {
      benevole: `${benevoleSeleccionadoAsignar.prenom} ${benevoleSeleccionadoAsignar.nom}`,
      deptsActuales,
      deptsNuevos,
      deptsAEliminar,
      deptsAAgregar,
      deptsQueSeQuedan
    });

    // ✅ PASO 3: Eliminar contactos de departamentos que ya no están seleccionados
    deptsAEliminar.forEach(deptId => {
      const contactoAEliminar = contactosActuales.find(c => c.departamentoId === deptId);
      if (contactoAEliminar) {
        eliminarContacto(contactoAEliminar.id);
        console.log(`  ❌ Eliminado contacto del departamento ${deptId}`);
      }
    });

    // ✅ PASO 4: Crear contactos para departamentos nuevos
    deptsAAgregar.forEach((deptId) => {
      const nuevoContacto: Omit<ContactoDepartamento, 'id'> = {
        departamentoId: deptId,
        departamentoIds: deptsNuevos,
        tipo: 'benevole',
        nombre: benevoleSeleccionadoAsignar.nom,
        apellido: benevoleSeleccionadoAsignar.prenom,
        fechaNacimiento: benevoleSeleccionadoAsignar.dateNaissance || '',
        genero: benevoleSeleccionadoAsignar.sexe === 'Homme' ? 'Homme' : benevoleSeleccionadoAsignar.sexe === 'Femme' ? 'Femme' : 'Non spécifié',
        email: benevoleSeleccionadoAsignar.email,
        telefono: benevoleSeleccionadoAsignar.telephone,
        cargo: benevoleSeleccionadoAsignar.poste || '',
        disponibilidad: benevoleSeleccionadoAsignar.disponibilites || '',
        disponibilidades: benevoleSeleccionadoAsignar.joursDisponibles?.map((j: any) => ({
          jour: j.jour,
          am: j.am || false,
          pm: j.pm || false
        })) || [],
        notas: benevoleSeleccionadoAsignar.notasGenerales || '',
        activo: benevoleSeleccionadoAsignar.statut === 'actif',
        fechaIngreso: benevoleSeleccionadoAsignar.dateInscription || new Date().toISOString().split('T')[0],
        direccion: benevoleSeleccionadoAsignar.adresse || '',
        apartamento: benevoleSeleccionadoAsignar.appartement || '',
        ciudad: benevoleSeleccionadoAsignar.ville || '',
        codigoPostal: benevoleSeleccionadoAsignar.codePostal || '',
        quartier: benevoleSeleccionadoAsignar.quartier || '', // ✅ CRÍTICO: Incluir quartier
        numeroEmpleado: benevoleSeleccionadoAsignar.numeroArchivo || '',
        horario: '',
        heuresSemaines: benevoleSeleccionadoAsignar.heuresSemaines || 0,
        reference: benevoleSeleccionadoAsignar.reference || '',
        supervisor: '',
        especialidad: '',
        certificaciones: [],
        idiomas: benevoleSeleccionadoAsignar.langues || [],
        foto: benevoleSeleccionadoAsignar.photo || '',
        documents: benevoleSeleccionadoAsignar.documents || []
      };

      const contactoCreado = guardarContacto(nuevoContacto);
      console.log(`  ✅ Creado contacto para departamento ${deptId}`, contactoCreado);
    });
    
    // ✅ PASO 5: Actualizar departamentoIds en contactos existentes
    deptsQueSeQuedan.forEach(deptId => {
      const contactoExistente = contactosActuales.find(c => c.departamentoId === deptId);
      if (contactoExistente) {
        actualizarContacto(contactoExistente.id, {
          ...contactoExistente,
          departamentoIds: deptsNuevos
        });
        console.log(`  🔄 Actualizado departamentoIds para departamento ${deptId}`);
      }
    });

    // ✅ PASO 6: Actualizar el bénévole con los nuevos departamentos
    const benevolesActualizados = benevoles.map(b => {
      if (b.id === benevoleSeleccionadoAsignar.id) {
        // 🔧 Mantener departamentosAsignar como array de IDs
        return { ...b, departement: deptsNuevos };
      }
      return b;
    });
    
    // 🔒 GUARDAR EN LOCALSTORAGE
    localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesActualizados));
    setBenevoles(benevolesActualizados);
    
    console.log('💾 Bénévole actualizado con nuevos departamentos:', {
      benevole: `${benevoleSeleccionadoAsignar.prenom} ${benevoleSeleccionadoAsignar.nom}`,
      departamentosGuardados: deptsNuevos,
      benevolesTotal: benevolesActualizados.length
    });

    // 🔄 SINCRONIZAR AUTOMÁTICAMENTE SI SE ASIGNÓ A ENTREPÔT
    // ✅ CORRECCIÓN: Buscar por nombre del departamento, no por ID
    const departamentosCompletos = obtenerDepartamentos();
    const departamentosSeleccionados = departamentosCompletos.filter(dept => 
      departamentosAsignar.includes(dept.id)
    );
    
    console.log('🔍 Verificando si se asignó a Entrepôt:', {
      departamentosAsignar,
      departamentosSeleccionados: departamentosSeleccionados.map(d => ({ id: d.id, nombre: d.nombre }))
    });
    
    if (departamentosSeleccionados.some(dept => 
      dept.nombre.toLowerCase().includes('entrepôt') || 
      dept.nombre.toLowerCase().includes('entrepot') ||
      dept.nombre.toLowerCase().includes('almacén') ||
      dept.nombre.toLowerCase().includes('almacen')
    )) {
      console.log('🔄 Sincronizando bénévole a contactos de Entrepôt...');
      setTimeout(() => {
        const resultado = sincronizarVoluntariosEntrepot();
        if (resultado.sincronizados > 0) {
          toast.success('✅ Bénévole synchronisé automatiquement vers Contacts Entrepôt');
        }
      }, 500);
    }

    // 🔄 PASO 7: Forzar eventos de actualización
    window.dispatchEvent(new CustomEvent('contactos-actualizados'));
    window.dispatchEvent(new CustomEvent('benevoles-actualizados'));
    
    // ✅ Mensaje de éxito detallado
    let mensaje = `✅ Départements mis à jour pour ${benevoleSeleccionadoAsignar.prenom} ${benevoleSeleccionadoAsignar.nom}`;
    if (deptsAAgregar.length > 0) {
      mensaje += `\n✨ ${deptsAAgregar.length} département(s) ajouté(s)`;
    }
    if (deptsAEliminar.length > 0) {
      mensaje += `\n❌ ${deptsAEliminar.length} département(s) retiré(s)`;
    }
    toast.success(mensaje);
    
    // 🔄 PASO 8: Forzar actualización de la tabla y verificar resultado final
    setRefreshDepartamentos(prev => prev + 1);
    
    // Verificar que los contactos se guardaron correctamente
    setTimeout(() => {
      const contactosFinales = obtenerContactosDepartamento().filter(c => 
        c.email.toLowerCase() === benevoleSeleccionadoAsignar.email.toLowerCase()
      );
      console.log('✅ VERIFICACIÓN FINAL - Contactos guardados:', {
        benevole: `${benevoleSeleccionadoAsignar.prenom} ${benevoleSeleccionadoAsignar.nom}`,
        totalContactos: contactosFinales.length,
        departamentos: contactosFinales.map(c => c.departamentoId),
        contactosCompletos: contactosFinales
      });
    }, 100);
    
    setDialogAsignarDepartamentos(false);
    setBenevoleSeleccionadoAsignar(null);
    setDepartamentosAsignar([]);
  };

  // Función para eliminar contacto del departamento
  const handleEliminarContactoBenevole = async (benevole: Benevole) => {
    // Buscar contacto asociado por email
    const todosLosContactos = obtenerContactosDepartamento();
    const contactoAsociado = todosLosContactos.find(c => 
      c.email.toLowerCase() === benevole.email.toLowerCase()
    );

    if (!contactoAsociado) {
      toast.error('❌ Aucun contact associé trouvé');
      return;
    }

    // Confirmación
    const confirmacion = window.confirm(
      `⚠️ Voulez-vous vraiment supprimer le contact du département?\n\n` +
      `Bénévole: ${benevole.prenom} ${benevole.nom}\n` +
      `Email: ${benevole.email}\n` +
      `Contact ID: ${contactoAsociado.numeroArchivo || contactoAsociado.id}\n\n` +
      `Cette action ne supprimera PAS le bénévole, seulement son lien avec le département.`
    );

    if (!confirmacion) return;

    try {
      // Eliminar contacto
      const eliminado = eliminarContacto(contactoAsociado.id);
      
      if (eliminado) {
        toast.success(`✅ Contact supprimé du département: ${benevole.prenom} ${benevole.nom}`);
        
        // 🔄 Forzar actualización de la tabla
        setRefreshDepartamentos(prev => prev + 1);
        
        // Recargar la página o actualizar el estado si es necesario
        window.dispatchEvent(new CustomEvent('contactos-actualizados'));
      } else {
        toast.error('❌ Erreur lors de la suppression du contact');
      }
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      toast.error('❌ Erreur lors de la suppression du contact');
    }
  };

  // Función para eliminar COMPLETAMENTE el perfil del bénévole
  const handleEliminarPerfilCompleto = async (benevole: Benevole) => {
    // Confirmación doble para evitar eliminaciones accidentales
    const confirmacion = window.confirm(
      `⚠️ ATTENTION: Cette action est IRRÉVERSIBLE!\n\n` +
      `Voulez-vous vraiment SUPPRIMER COMPLÈTEMENT le profil de:\n\n` +
      `👤 ${benevole.prenom} ${benevole.nom}\n` +
      `📧 ${benevole.email}\n\n` +
      `Cela supprimera:\n` +
      `• Le profil du bénévole\n` +
      `• Tous ses contacts dans les départements\n` +
      `• Toutes ses feuilles de temps\n` +
      `• Son accès au système (si existant)\n\n` +
      `Êtes-vous ABSOLUMENT SÛR(E)?`
    );

    if (!confirmacion) return;

    try {
      // 1. Eliminar el bénévole de la lista
      const benevolesActualizados = benevoles.filter(b => b.id !== benevole.id);
      localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesActualizados));
      setBenevoles(benevolesActualizados);

      // 2. Eliminar TODOS los contactos del bénévole en TODOS los departamentos
      const todosLosContactos = obtenerContactosDepartamento();
      const contactosActualizados = todosLosContactos.filter(c => 
        c.email.toLowerCase() !== benevole.email.toLowerCase()
      );
      localStorage.setItem('banqueAlimentaire_contactosDepartamentos', JSON.stringify(contactosActualizados));

      // 3. Eliminar todas las feuilles de temps del bénévole
      const feuillesActualizadas = feuillesTemps.filter(ft => ft.benevoleId !== benevole.id);
      localStorage.setItem('banqueAlimentaire_feuillesTemps', JSON.stringify(feuillesActualizadas));
      setFeuillesTemps(feuillesActualizadas);

      // 4. Eliminar el acceso al sistema si existe
      const usuariosStr = localStorage.getItem('banqueAlimentaire_usuarios');
      if (usuariosStr) {
        try {
          const usuarios = JSON.parse(usuariosStr);
          const usuariosActualizados = usuarios.filter((u: any) => 
            u.email?.toLowerCase() !== benevole.email.toLowerCase()
          );
          localStorage.setItem('banqueAlimentaire_usuarios', JSON.stringify(usuariosActualizados));
        } catch (error) {
          console.error('Error al eliminar usuario del sistema:', error);
        }
      }

      // Emitir evento de actualización
      window.dispatchEvent(new CustomEvent('contactos-actualizados'));
      window.dispatchEvent(new CustomEvent('benevoles-actualizados'));

      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Bénévoles',
        'eliminar',
        `Bénévole "${benevole.prenom} ${benevole.nom}" complètement supprimé`,
        { benevoleId: benevole.id, email: benevole.email }
      );

      toast.success(`✅ Profil de ${benevole.prenom} ${benevole.nom} COMPLÈTEMENT supprimé`);
    } catch (error) {
      console.error('Error al eliminar perfil completo:', error);
      toast.error('❌ Erreur lors de la suppression du profil complet');
    }
  };

  // Función para verificar si el bénévole tiene contacto asociado
  const tieneContactoAsociado = (benevole: Benevole): boolean => {
    const todosLosContactos = obtenerContactosDepartamento();
    return todosLosContactos.some(c => 
      c.email.toLowerCase() === benevole.email.toLowerCase()
    );
  };

  // Función para obtener el contacto asociado
  const obtenerContactoAsociado = (benevole: Benevole): ContactoDepartamento | undefined => {
    const todosLosContactos = obtenerContactosDepartamento();
    return todosLosContactos.find(c => 
      c.email.toLowerCase() === benevole.email.toLowerCase()
    );
  };

  // Función para obtener el nombre del departamento del contacto asociado
  const obtenerNombreDepartamentoContacto = (benevole: Benevole): string => {
    const todosLosContactos = obtenerContactosDepartamento();
    // Buscar TODOS los contactos asociados a este bénévole
    const contactosAsociados = todosLosContactos.filter(c => 
      c.email.toLowerCase() === benevole.email.toLowerCase()
    );

    // Si no hay contactos asociados, indicar claramente que no tiene departamento
    if (contactosAsociados.length === 0) {
      return '⚠️ Aucun département assigné';
    }

    // Crear un Map para evitar duplicados de departamentos
    const departamentosUnicos = new Map<string, { nombre: string; activo: boolean }>();
    
    contactosAsociados.forEach(contacto => {
      // 🔧 CORRECCIÓN: Obtener departamentos tanto de departamentoId como de departamentoIds
      const departamentosDelContacto = new Set<string>();
      
      // Agregar departamentoId principal
      if (contacto.departamentoId && contacto.departamentoId !== '') {
        departamentosDelContacto.add(contacto.departamentoId.toString());
      }
      
      // Agregar todos los departamentos de departamentoIds
      if (contacto.departamentoIds && Array.isArray(contacto.departamentoIds)) {
        contacto.departamentoIds.forEach(deptId => {
          if (deptId && deptId !== '') {
            departamentosDelContacto.add(deptId.toString());
          }
        });
      }
      
      // Procesar cada departamento único del contacto
      departamentosDelContacto.forEach(deptId => {
        const departamento = departementosStorage.find(
          d => d.id.toString() === deptId
        );
        
        if (departamento) {
          // Si el departamento ya existe, mantener el estado activo si al menos uno está activo
          const existing = departamentosUnicos.get(departamento.id.toString());
          if (existing) {
            departamentosUnicos.set(departamento.id.toString(), {
              nombre: departamento.nombre,
              activo: existing.activo || contacto.activo
            });
          } else {
            departamentosUnicos.set(departamento.id.toString(), {
              nombre: departamento.nombre,
              activo: contacto.activo
            });
          }
        }
      });
    });

    // Convertir a array y formatear con emojis
    const nombresDepartamentos = Array.from(departamentosUnicos.values()).map(dept => {
      const estadoIcon = dept.activo ? '✅' : '⚠️';
      return `${estadoIcon} ${dept.nombre}`;
    });

    // Unir todos los nombres con ", "
    return nombresDepartamentos.length > 0 
      ? nombresDepartamentos.join(', ') 
      : '⚠️ Aucun département assigné';
  };

  // Función para obtener los departamentos como objetos para badges
  const obtenerDepartamentosBenevole = (benevole: Benevole): Array<{ id: string; nombre: string; activo: boolean; color: string }> => {
    // 🔄 IMPORTANTE: Obtener departamentos frescos cada vez
    const departementosActuales = obtenerDepartamentos();
    const todosLosContactos = obtenerContactosDepartamento();
    const contactosAsociados = todosLosContactos.filter(c => 
      c.email.toLowerCase() === benevole.email.toLowerCase()
    );

    console.log('🔍 Obteniendo departamentos para:', {
      benevole: `${benevole.prenom} ${benevole.nom}`,
      email: benevole.email,
      contactosAsociados: contactosAsociados.length,
      departamentosIds: contactosAsociados.map(c => c.departamentoId),
      departamentosIdsArray: contactosAsociados.map(c => c.departamentoIds),
      refreshKey: refreshDepartamentos
    });

    if (contactosAsociados.length === 0) {
      return [];
    }

    const departamentosUnicos = new Map<string, { nombre: string; activo: boolean; color: string }>();
    
    contactosAsociados.forEach(contacto => {
      // 🔧 CORRECCIÓN: Obtener departamentos tanto de departamentoId como de departamentoIds
      const departamentosDelContacto = new Set<string>();
      
      // Agregar departamentoId principal
      if (contacto.departamentoId && contacto.departamentoId !== '') {
        departamentosDelContacto.add(contacto.departamentoId.toString());
      }
      
      // Agregar todos los departamentos de departamentoIds
      if (contacto.departamentoIds && Array.isArray(contacto.departamentoIds)) {
        contacto.departamentoIds.forEach(deptId => {
          if (deptId && deptId !== '') {
            departamentosDelContacto.add(deptId.toString());
          }
        });
      }
      
      // Procesar cada departamento único del contacto
      departamentosDelContacto.forEach(deptId => {
        const departamento = departementosActuales.find(
          d => d.id.toString() === deptId
        );
        
        if (departamento) {
          const existing = departamentosUnicos.get(departamento.id.toString());
          if (existing) {
            departamentosUnicos.set(departamento.id.toString(), {
              nombre: departamento.nombre,
              activo: existing.activo || contacto.activo,
              color: departamento.color
            });
          } else {
            departamentosUnicos.set(departamento.id.toString(), {
              nombre: departamento.nombre,
              activo: contacto.activo,
              color: departamento.color
            });
          }
        }
      });
    });

    const resultado = Array.from(departamentosUnicos.entries()).map(([id, dept]) => ({
      id,
      ...dept
    }));

    console.log('✅ Departamentos obtenidos:', resultado);

    return resultado;
  };

  // Función para cambiar el estado activo/inactivo del contacto
  const handleCambiarEstadoContacto = async (benevole: Benevole) => {
    const contactoAsociado = obtenerContactoAsociado(benevole);

    if (!contactoAsociado) {
      toast.error('❌ Aucun contact associé trouvé');
      return;
    }

    const nuevoEstado = !contactoAsociado.activo;
    const estadoTexto = nuevoEstado ? 'ACTIF' : 'INACTIF';

    // Confirmación
    const confirmacion = window.confirm(
      `⚠️ Voulez-vous changer le statut du contact?\n\n` +
      `Bénévole: ${benevole.prenom} ${benevole.nom}\n` +
      `Statut actuel: ${contactoAsociado.activo ? 'ACTIF' : 'INACTIF'}\n` +
      `Nouveau statut: ${estadoTexto}\n\n` +
      `Contact ID: ${contactoAsociado.numeroArchivo || contactoAsociado.id}`
    );

    if (!confirmacion) return;

    try {
      // Actualizar el estado del contacto
      const actualizado = actualizarContacto(contactoAsociado.id, {
        activo: nuevoEstado
      });
      
      if (actualizado) {
        toast.success(
          `✅ Contact ${nuevoEstado ? 'activé' : 'désactivé'}: ${benevole.prenom} ${benevole.nom}`
        );
        
        // Recargar la página o actualizar el estado
        window.dispatchEvent(new CustomEvent('contactos-actualizados'));
        
        // Forzar actualización visual
        setBenevoles([...benevoles]);
      } else {
        toast.error('❌ Erreur lors de la modification du statut');
      }
    } catch (error) {
      console.error('Error al cambiar estado del contacto:', error);
      toast.error('❌ Erreur lors de la modification du statut');
    }
  };

  // Función genérica para optimizar imágenes
  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validar tamaño original (max 10MB antes de compresión)
      if (file.size > 10 * 1024 * 1024) {
        reject('La taille de l\'image ne doit pas dépasser 10MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        reject('Veuillez sélectionner une image valide');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Crear canvas para redimensionar y convertir
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject('Erreur lors du traitement de l\'image');
              return;
            }

            // Dimensiones máximas para optimizar
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            // Calcular nuevas dimensiones manteniendo proporción
            if (width > height) {
              if (width > MAX_WIDTH) {
                height = (height * MAX_WIDTH) / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = (width * MAX_HEIGHT) / height;
                height = MAX_HEIGHT;
              }
            }

            // Configurar canvas
            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen redimensionada con fondo blanco (para PNGs transparentes)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a JPEG con calidad 0.85 para mejor compatibilidad
            let optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

            // Verificar tamaño final (debe ser menor a 2MB después de optimización)
            const sizeInBytes = (optimizedDataUrl.length * 3) / 4;
            if (sizeInBytes > 2 * 1024 * 1024) {
              // Si aún es muy grande, reducir calidad
              optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            }

            resolve(optimizedDataUrl);
          } catch (error) {
            reject('Erreur lors du traitement de l\'image');
          }
        };

        img.onerror = () => {
          reject('Erreur lors du chargement de l\'image');
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject('Erreur lors de la lecture du fichier');
      };

      reader.readAsDataURL(file);
    });
  };

  // Handler para cambio de foto en nuevo formulario
  const handleNewFormPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimizedDataUrl = await optimizeImage(file);
        setNewForm({ ...newForm, photo: optimizedDataUrl });
        setNewFormPhotoPreview(optimizedDataUrl);
        toast.success('Photo ajoutée avec succès');
      } catch (error) {
        toast.error(error as string);
      }
    }
  };

  // Handler para eliminar foto en nuevo formulario
  const handleNewFormPhotoRemove = () => {
    setNewForm({ ...newForm, photo: null });
    setNewFormPhotoPreview(null);
  };

  // Handler para cambio de foto en formulario de edición
  const handleEditFormPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimizedDataUrl = await optimizeImage(file);
        setEditForm({ ...editForm, photo: optimizedDataUrl });
        setEditFormPhotoPreview(optimizedDataUrl);
        toast.success('Photo modifiée avec succès');
      } catch (error) {
        toast.error(error as string);
      }
    }
  };

  // Handler para eliminar foto en formulario de edición
  const handleEditFormPhotoRemove = () => {
    setEditForm({ ...editForm, photo: null });
    setEditFormPhotoPreview(null);
  };

  // Handlers para días disponibles con horarios
  const handleToggleJourDisponible = (jour: string, formType: 'new' | 'edit') => {
    const form = formType === 'new' ? newForm : editForm;
    const setForm = formType === 'new' ? setNewForm : setEditForm;
    
    const existing = form.joursDisponibles.find(j => j.jour === jour);
    
    let newJoursDisponibles: JourDisponible[];
    
    if (!existing) {
      // Agregar con horario AM
      newJoursDisponibles = [...form.joursDisponibles, { jour, horaire: 'AM' as 'AM' }];
    } else if (existing.horaire === 'AM') {
      // Cambiar a PM
      newJoursDisponibles = form.joursDisponibles.map(j => 
        j.jour === jour ? { ...j, horaire: 'PM' as 'PM' } : j
      );
    } else if (existing.horaire === 'PM') {
      // Cambiar a AM/PM
      newJoursDisponibles = form.joursDisponibles.map(j => 
        j.jour === jour ? { ...j, horaire: 'AM/PM' as 'AM/PM' } : j
      );
    } else {
      // Remover (ciclo completo)
      newJoursDisponibles = form.joursDisponibles.filter(j => j.jour !== jour);
    }
    
    setForm({ ...form, joursDisponibles: newJoursDisponibles });
  };

  // Handlers para documentos en nuevo formulario
  const handleNewFormAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    Array.from(files).forEach((file) => {
      // Validar tipo de archivo
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Le fichier "${file.name}" n'est pas un format accepté (PDF, JPG, PNG)`);
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Le fichier "${file.name}" dépasse la taille maximale de 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newDocument: Document = {
          id: Date.now() + Math.random(), // Asegurar unicidad
          nom: file.name,
          type: file.type,
          date: new Date().toISOString().split('T')[0],
          url: event.target?.result as string,
          taille: formatFileSize(file.size)
        };

        setNewForm({
          ...newForm,
          documents: [...newForm.documents, newDocument]
        });

        toast.success(`Document ajouté: ${file.name}`);
      };

      reader.onerror = () => {
        toast.error('Erreur lors de la lecture du fichier');
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleNewFormRemoveDocument = (documentId: number) => {
    setNewForm({
      ...newForm,
      documents: newForm.documents.filter(doc => doc.id !== documentId)
    });
    toast.success('Document supprimé');
  };

  // Handlers para documentos en formulario de edición
  const handleEditFormAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    Array.from(files).forEach((file) => {
      // Validar tipo de archivo
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Le fichier "${file.name}" n'est pas un format accepté (PDF, JPG, PNG)`);
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Le fichier "${file.name}" dépasse la taille maximale de 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newDocument: Document = {
          id: Date.now() + Math.random(), // Asegurar unicidad
          nom: file.name,
          type: file.type,
          date: new Date().toISOString().split('T')[0],
          url: event.target?.result as string,
          taille: formatFileSize(file.size)
        };

        setEditForm({
          ...editForm,
          documents: [...editForm.documents, newDocument]
        });

        toast.success(`Document ajouté: ${file.name}`);
      };

      reader.onerror = () => {
        toast.error('Erreur lors de la lecture du fichier');
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleEditFormRemoveDocument = (documentId: number) => {
    setEditForm({
      ...editForm,
      documents: editForm.documents.filter(doc => doc.id !== documentId)
    });
    toast.success('Document supprimé');
  };

  // Función helper para formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Función helper para obtener ícono según tipo de documento
  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return ImageIcon;
    return File;
  };


  // Handlers for email
  // ⚡ OPTIMIZACIÓN: useCallback para handlers de email
  const handleOpenEmailModal = useCallback((benevoleIds: number[]) => {
    setSelectedBenevolesForEmail(benevoleIds);
    setEmailModalOpen(true);
  }, []);

  const handleTemplateChange = useCallback((template: 'custom' | 'invitation' | 'rappel' | 'remerciement' | 'annonce') => {
    const selectedTemplate = emailTemplates[template];
    setEmailForm({
      template,
      subject: selectedTemplate.subject,
      message: selectedTemplate.message
    });
  }, [emailTemplates]);

  const handleSendEmail = () => {
    if (!emailForm.subject || !emailForm.message) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    if (selectedBenevolesForEmail.length === 0) {
      toast.error('Aucun destinataire sélectionné');
      return;
    }

    const destinataires = benevoles
      .filter(b => selectedBenevolesForEmail.includes(b.id))
      .map(b => `${b.prenom} ${b.nom} (${b.email})`);

    // Simulation d'envoi d'email
    console.log('Envoi d\'email à:', destinataires);
    console.log('Sujet:', emailForm.subject);
    console.log('Message:', emailForm.message);

    toast.success(`Email envoyé à ${selectedBenevolesForEmail.length} bénévole(s)`);
    
    setEmailModalOpen(false);
    setSelectedBenevolesForEmail([]);
    setEmailForm({
      subject: '',
      message: '',
      template: 'custom'
    });
  };

  // ⚡ OPTIMIZACIÓN: useCallback para toggleBenevoleSelection
  const toggleBenevoleSelection = useCallback((benevoleId: number) => {
    setSelectedBenevolesForEmail(prev => {
      if (prev.includes(benevoleId)) {
        return prev.filter(id => id !== benevoleId);
      } else {
        return [...prev, benevoleId];
      }
    });
  }, []);

  // ⚡ OPTIMIZACIÓN: Memoizar bénévoles filtrados con debounced search
  const filteredBenevoles = useMemo(() => {
    return benevoles.filter(b => {
      const matchesSearch = 
        `${b.prenom} ${b.nom}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // 🔧 CORRECCIÓN: Filtrar por departamento usando IDs reales
      let matchesDept = filterDepartement === 'all';
      if (!matchesDept && filterDepartement !== 'all') {
        // Obtener departamentos del bénévole desde los contactos
        const departamentosBenevole = obtenerDepartamentosBenevole(b);
        // Verificar si alguno de los departamentos del bénévole coincide con el filtro
        matchesDept = departamentosBenevole.some(dept => dept.nombre === filterDepartement);
        
        // Fallback: también verificar el campo departement directo (compatibilidad con datos antiguos)
        if (!matchesDept) {
          matchesDept = Array.isArray(b.departement) 
            ? b.departement.includes(filterDepartement)
            : b.departement === filterDepartement;
        }
      }
      
      const matchesStatut = filterStatut === 'all' || b.statut === filterStatut;
      return matchesSearch && matchesDept && matchesStatut;
    });
  }, [benevoles, debouncedSearchTerm, filterDepartement, filterStatut, refreshDepartamentos]);

  // ⚡ OPTIMIZACI��N: useCallback para evitar recrear funciones
  const toggleSelectAll = useCallback(() => {
    if (selectedBenevolesForEmail.length === filteredBenevoles.length && filteredBenevoles.length > 0) {
      setSelectedBenevolesForEmail([]);
    } else {
      setSelectedBenevolesForEmail(filteredBenevoles.map(b => b.id));
    }
  }, [selectedBenevolesForEmail.length, filteredBenevoles]);

  // Handler pour l'impression du formulaire
  const handlePrint = () => {
    const selectedBenevole = benevoles.find(b => b.id === selectedBenevoleId);
    if (!selectedBenevole) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fiche Bénévole - ${selectedBenevole.prenom} ${selectedBenevole.nom}</title>
        <style>
          @media print {
            @page {
              margin: 1.2cm;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Roboto', Arial, sans-serif;
            color: #333333;
            line-height: 1.3;
            padding: 10px;
            font-size: 11px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1E73BE;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .header h1 {
            color: #1E73BE;
            font-family: 'Montserrat', sans-serif;
            font-size: 20px;
            margin: 0 0 4px 0;
          }
          .header p {
            color: #666666;
            margin: 0;
            font-size: 10px;
          }
          .section {
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          .section-title {
            font-family: 'Montserrat', sans-serif;
            font-weight: bold;
            font-size: 13px;
            color: #1E73BE;
            border-bottom: 1px solid #E0E0E0;
            padding-bottom: 3px;
            margin-bottom: 6px;
          }
          .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .field-group {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px 12px;
          }
          .field {
            margin-bottom: 0;
          }
          .field-label {
            font-size: 9px;
            color: #666666;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
          }
          .field-value {
            font-size: 11px;
            color: #333333;
            font-weight: 500;
            line-height: 1.2;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 9px;
            font-weight: 500;
            margin-right: 4px;
            margin-bottom: 3px;
          }
          .badge-blue {
            background-color: #1E73BE;
            color: white;
          }
          .badge-green {
            background-color: #4CAF50;
            color: white;
          }
          .status-actif {
            color: #4CAF50;
            font-weight: bold;
          }
          .status-inactif {
            color: #DC3545;
            font-weight: bold;
          }
          .status-pause {
            color: #FFC107;
            font-weight: bold;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          .stats-box {
            text-align: center;
            padding: 8px;
            background-color: #F9F9F9;
            border-radius: 6px;
          }
          .stats-value {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .stats-label {
            font-size: 9px;
            color: #666666;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid #E0E0E0;
            text-align: center;
            color: #999999;
            font-size: 9px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Fiche Bénévole</h1>
          <p>Imprimé le ${new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="two-columns">
          <!-- Colonne gauche -->
          <div>
            <div class="section">
              <div class="section-title">Informations Personnelles</div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Numéro de dossier</div>
                  <div class="field-value" style="font-family: monospace; color: #1E73BE; font-weight: bold;">${selectedBenevole.numeroArchivo || 'N/A'}</div>
                </div>
                <div class="field full-width">
                  <div class="field-label">Nom complet</div>
                  <div class="field-value">${selectedBenevole.prenom} ${selectedBenevole.nom}</div>
                </div>
                <div class="field">
                  <div class="field-label">Sexe</div>
                  <div class="field-value">${selectedBenevole.sexe || 'Non spécifié'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Date de naissance</div>
                  <div class="field-value">${
                    selectedBenevole.dateNaissance 
                      ? new Date(selectedBenevole.dateNaissance).toLocaleDateString('fr-FR')
                      : '—'
                  }</div>
                </div>
                <div class="field full-width">
                  <div class="field-label">Date d'inscription</div>
                  <div class="field-value">${new Date(selectedBenevole.dateInscription).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Coordonnées</div>
              <div class="field-group">
                <div class="field full-width">
                  <div class="field-label">Email</div>
                  <div class="field-value">${selectedBenevole.email}</div>
                </div>
                <div class="field full-width">
                  <div class="field-label">Téléphone</div>
                  <div class="field-value">${selectedBenevole.telephone}</div>
                </div>
                ${selectedBenevole.adresse ? `
                  <div class="field full-width">
                    <div class="field-label">Adresse</div>
                    <div class="field-value">${selectedBenevole.adresse}</div>
                  </div>
                ` : ''}
                ${selectedBenevole.quartier ? `
                  <div class="field full-width">
                    <div class="field-label">Quartier</div>
                    <div class="field-value">${selectedBenevole.quartier}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            ${selectedBenevole.langues && selectedBenevole.langues.length > 0 ? `
              <div class="section">
                <div class="section-title">Langues Parlées</div>
                <div>
                  ${selectedBenevole.langues.map(langue => `<span class="badge badge-blue">${langue}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Colonne droite -->
          <div>
            <div class="section">
              <div class="section-title">Affectation et Disponibilité</div>
              <div class="field-group">
                <div class="field">
                  <div class="field-label">Département${Array.isArray(selectedBenevole.departement) && selectedBenevole.departement.length > 1 ? 's' : ''}</div>
                  <div class="field-value">${
                    Array.isArray(selectedBenevole.departement) 
                      ? selectedBenevole.departement.map(d => `<span class="badge badge-blue">${d}</span>`).join(' ') 
                      : selectedBenevole.departement
                  }</div>
                </div>
                <div class="field">
                  <div class="field-label">Statut</div>
                  <div class="field-value status-${selectedBenevole.statut.replace(' ', '-')}">${
                    selectedBenevole.statut === 'actif' ? 'Actif' :
                    selectedBenevole.statut === 'inactif' ? 'Inactif' : 'En pause'
                  }</div>
                </div>

                <div class="field">
                  <div class="field-label">Voiture</div>
                  <div class="field-value">${selectedBenevole.voiture ? 'Oui ✓' : 'Non'}</div>
                </div>
                ${selectedBenevole.joursDisponibles && selectedBenevole.joursDisponibles.length > 0 ? `
                  <div class="field full-width">
                    <div class="field-label">Jours disponibles</div>
                    <div>
                      ${selectedBenevole.joursDisponibles.map(j => `<span class="badge badge-green">${j.jour} (${j.horaire === 'AM' ? '🌅 Matin' : j.horaire === 'PM' ? '🌆 Après-midi' : '☀️ Journée'})</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
                ${selectedBenevole.disponibilites ? `
                  <div class="field full-width">
                    <div class="field-label">Notes</div>
                    <div class="field-value">${selectedBenevole.disponibilites}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Statistiques</div>
              <div class="field-group">
                <div class="stats-box">
                  <div class="stats-value" style="color: #1E73BE;">${Math.round(selectedBenevole.heuresTotal)}h</div>
                  <div class="stats-label">Heures totales</div>
                </div>
                <div class="stats-box">
                  <div class="stats-value" style="color: #4CAF50;">${Math.round(selectedBenevole.heuresMois)}h</div>
                  <div class="stats-label">Mois courant</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${selectedBenevole.notes && selectedBenevole.notes.length > 0 ? `
          <div class="section" style="margin-top: 12px;">
            <div class="section-title">Notes (${selectedBenevole.notes.length})</div>
            ${selectedBenevole.notes.map((note, index) => `
              <div style="background-color: #F9F9F9; padding: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; margin-bottom: 8px; border-left: 3px solid #1E73BE;">
                <div style="font-weight: 500; margin-bottom: 4px;">${note.text}</div>
                <div style="font-size: 8px; color: #999999;">
                  ${new Date(note.date).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${selectedBenevole.documents && selectedBenevole.documents.length > 0 ? `
          <div class="section" style="margin-top: 12px;">
            <div class="section-title">Documents (${selectedBenevole.documents.length})</div>
            ${selectedBenevole.documents.map((doc, index) => `
              <div style="background-color: #F9F9F9; padding: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; margin-bottom: 6px; border-left: 3px solid #4CAF50; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 500; margin-bottom: 2px;">${doc.nom}</div>
                  <div style="font-size: 8px; color: #999999;">
                    ${doc.taille} • ${new Date(doc.date).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          Banque Alimentaire - Système de Gestion des Bénévoles
        </div>
      </body>
      </html>
    `;

    try {
      openAutoPrintPopup(printContent, { width: 1024, height: 900, printDelayMs: 250 });
    } catch (error) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression');
      return;
    }

    toast.success('Préparation de l\'impression...');
  };

  // Handler pour agregar una nueva nota
  const handleAddNote = () => {
    if (!notesText.trim() || !selectedBenevoleId) {
      toast.error('Veuillez écrire une note avant de sauvegarder');
      return;
    }

    const selectedBenevole = benevoles.find(b => b.id === selectedBenevoleId);
    if (selectedBenevole) {
      const currentNotes = selectedBenevole.notes || [];
      const maxId = currentNotes.length > 0 ? Math.max(...currentNotes.map(n => n.id)) : 0;
      
      const newNote: Note = {
        id: maxId + 1,
        text: notesText.trim(),
        date: new Date().toISOString()
      };

      const updatedBenevoles = benevoles.map(b => 
        b.id === selectedBenevoleId 
          ? { ...b, notes: [...currentNotes, newNote] } 
          : b
      );
      
      setBenevoles(updatedBenevoles);
      setNotesText('');
      setIsEditingNotes(false);
      toast.success('Note ajoutée avec succès');
    }
  };

  // Handler pour supprimer una nota
  const handleDeleteNote = (noteId: number) => {
    if (selectedBenevoleId) {
      const updatedBenevoles = benevoles.map(b => {
        if (b.id === selectedBenevoleId) {
          return { ...b, notes: (b.notes || []).filter(n => n.id !== noteId) };
        }
        return b;
      });
      
      setBenevoles(updatedBenevoles);
      toast.success('Note supprimée');
    }
  };

  // Handler pour annuler l'édition des notes
  const handleCancelNotes = () => {
    setNotesText('');
    setIsEditingNotes(false);
  };

  // Handlers pour documents
  const handleUploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBenevoleId) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const selectedBenevole = benevoles.find(b => b.id === selectedBenevoleId);
    if (!selectedBenevole) return;

    const currentDocuments = selectedBenevole.documents || [];
    const maxId = currentDocuments.length > 0 ? Math.max(...currentDocuments.map(d => d.id)) : 0;

    // Simuler le téléchargement
    const newDocument: Document = {
      id: maxId + 1,
      nom: file.name,
      type: file.type,
      date: new Date().toISOString(),
      url: '#', // En production, ce serait l'URL réelle du fichier uploadé
      taille: `${(file.size / 1024).toFixed(0)} KB`
    };

    const updatedBenevoles = benevoles.map(b => 
      b.id === selectedBenevoleId 
        ? { ...b, documents: [...currentDocuments, newDocument] } 
        : b
    );
    
    setBenevoles(updatedBenevoles);
    toast.success(`Document "${file.name}" ajouté avec succès`);
    
    // Réinitialiser l'input
    event.target.value = '';
  };

  const handleDeleteDocument = (documentId: number) => {
    if (selectedBenevoleId) {
      const updatedBenevoles = benevoles.map(b => {
        if (b.id === selectedBenevoleId) {
          return { ...b, documents: (b.documents || []).filter(d => d.id !== documentId) };
        }
        return b;
      });
      
      setBenevoles(updatedBenevoles);
      toast.success('Document supprimé');
    }
  };

  const handleDownloadDocument = (document: Document) => {
    // En production, cela téléchargerait le fichier réel
    toast.info(`Téléchargement de "${document.nom}"...`);
  };

  // Función para calcular la edad
  const calculateAge = (dateNaissance: string): number => {
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ⚡ OPTIMIZACIÓN: Memoizar estadísticas demográficas
  const getDemographicStats = useMemo(() => {
    // Estadísticas por sexo
    const sexeStats = benevoles.reduce((acc, b) => {
      const sexe = b.sexe || 'Non spécifié';
      acc[sexe] = (acc[sexe] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas por tranche d'âge
    const ageRanges = {
      '18-25 ans': 0,
      '26-35 ans': 0,
      '36-45 ans': 0,
      '46-55 ans': 0,
      '56-65 ans': 0,
      '66+ ans': 0,
      'Non spécifié': 0
    };

    benevoles.forEach(b => {
      if (b.dateNaissance) {
        const age = calculateAge(b.dateNaissance);
        if (age >= 18 && age <= 25) ageRanges['18-25 ans']++;
        else if (age >= 26 && age <= 35) ageRanges['26-35 ans']++;
        else if (age >= 36 && age <= 45) ageRanges['36-45 ans']++;
        else if (age >= 46 && age <= 55) ageRanges['46-55 ans']++;
        else if (age >= 56 && age <= 65) ageRanges['56-65 ans']++;
        else if (age > 65) ageRanges['66+ ans']++;
      } else {
        ageRanges['Non spécifié']++;
      }
    });

    return { sexeStats, ageRanges };
  }, [benevoles]);

  // ⚡ OPTIMIZACIÓN: Memoizar estadísticas generales
  const statsGenerales = useMemo(() => ({
    total: benevoles.length,
    actifs: benevoles.filter(b => b.statut === 'actif').length,
    heuresTotal: benevoles.reduce((sum, b) => sum + b.heuresTotal, 0),
    heuresMois: benevoles.reduce((sum, b) => sum + b.heuresMois, 0)
  }), [benevoles]);

  // ⚡ OPTIMIZACIÓN: Memoizar horas por departamento
  const heuresByDepartement = useMemo(() => {
    return departements.map(dept => {
      const total = feuillesTemps
        .filter(f => f.departement === dept)
        .reduce((sum, f) => sum + f.duree, 0);
      return { departement: dept, heures: total };
    }).filter(d => d.heures > 0);
  }, [departements, feuillesTemps]);

  // ⚡ OPTIMIZACIÓN: Memoizar bénévoles filtrados para estadísticas
  const filteredBenevolesStats = useMemo(() => {
    if (!statsGenerated) return benevoles;
    
    return benevoles.filter(b => {
      // Filtro por fecha de inscripción
      if (statsDateDebut && statsDateFin) {
        const dateInscription = new Date(b.dateInscription);
        const dateDebut = new Date(statsDateDebut);
        const dateFin = new Date(statsDateFin);
        if (dateInscription < dateDebut || dateInscription > dateFin) return false;
      }

      // Filtro por tipo
      if (statsFilterValue !== 'tous') {
        if (statsFilterType === 'departement' && b.departement !== statsFilterValue) return false;
        if (statsFilterType === 'statut' && b.statut !== statsFilterValue) return false;
      }

      return true;
    });
  }, [benevoles, statsGenerated, statsDateDebut, statsDateFin, statsFilterType, statsFilterValue]);

  // ⚡ HOOKS para estadísticas - movidos fuera de renderStatistiques
  const handleGenerateStats = useCallback(() => {
    if (!statsDateDebut || !statsDateFin) {
      toast.error('Veuillez sélectionner les deux dates');
      return;
    }

    if (new Date(statsDateDebut) > new Date(statsDateFin)) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }

    setStatsGenerated(true);
    toast.success('Statistiques générées avec succès');
  }, [statsDateDebut, statsDateFin]);

  const handleResetStats = useCallback(() => {
    setStatsGenerated(false);
    setStatsFilterType('departement');
    setStatsFilterValue('tous');
    setStatsDateDebut('');
    setStatsDateFin('');
  }, []);

  // ⚡ Memoizar cálculos de estadísticas demográficas
  const statsResult = useMemo(() => {
    // Estadísticas por sexo
    const sexeStats = filteredBenevolesStats.reduce((acc, b) => {
      const sexe = b.sexe || 'Non spécifié';
      acc[sexe] = (acc[sexe] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas por tranche d'âge
    const ageRanges = {
      '18-25 ans': 0,
      '26-35 ans': 0,
      '36-45 ans': 0,
      '46-55 ans': 0,
      '56-65 ans': 0,
      '66+ ans': 0,
      'Non spécifié': 0
    };

    filteredBenevolesStats.forEach(b => {
      if (b.dateNaissance) {
        const age = calculateAge(b.dateNaissance);
        if (age >= 18 && age <= 25) ageRanges['18-25 ans']++;
        else if (age >= 26 && age <= 35) ageRanges['26-35 ans']++;
        else if (age >= 36 && age <= 45) ageRanges['36-45 ans']++;
        else if (age >= 46 && age <= 55) ageRanges['46-55 ans']++;
        else if (age >= 56 && age <= 65) ageRanges['56-65 ans']++;
        else if (age > 65) ageRanges['66+ ans']++;
      } else {
        ageRanges['Non spécifié']++;
      }
    });

    return { sexeStats, ageRanges };
  }, [filteredBenevolesStats]);

  const { sexeStats, ageRanges } = statsResult;

  // ⚡ Memoizar datos para gráficos
  const sexeData = useMemo(() => 
    Object.entries(sexeStats).map(([sexe, count]) => ({
      name: sexe,
      value: count
    }))
  , [sexeStats]);

  const ageData = useMemo(() =>
    Object.entries(ageRanges)
      .filter(([_, count]) => count > 0)
      .map(([range, count]) => ({
        name: range,
        value: count
      }))
  , [ageRanges]);

  // ⚡ Memoizar cálculos de edad
  const ageCalculations = useMemo(() => {
    const agesArray = filteredBenevolesStats
      .filter(b => b.dateNaissance)
      .map(b => calculateAge(b.dateNaissance!));
    
    const avgAge = agesArray.length > 0 
      ? Math.round(agesArray.reduce((sum, age) => sum + age, 0) / agesArray.length)
      : 0;

    const minAge = agesArray.length > 0 ? Math.min(...agesArray) : 0;
    const maxAge = agesArray.length > 0 ? Math.max(...agesArray) : 0;

    return { avgAge, minAge, maxAge };
  }, [filteredBenevolesStats]);

  const { avgAge, minAge, maxAge } = ageCalculations;

  // Navigation menu items
  const menuItems = [
    { id: 'liste', label: 'Liste des bénévoles', icon: <Users className="w-5 h-5" /> },
    { id: 'feuilles-temps', label: 'Feuilles de temps', icon: <Clock className="w-5 h-5" /> },
    { id: 'statistiques', label: 'Statistiques démographiques', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'historique', label: 'Historique', icon: <Calendar className="w-5 h-5" /> },
    { id: 'repartition', label: 'Répartition', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'rapports', label: 'Rapports', icon: <FileText className="w-5 h-5" /> },
    { id: 'contactos', label: 'Gestion des Contacts', icon: <Users className="w-5 h-5" /> }
  ];

  // Render Navigation
  const renderNavigation = () => (
    <nav className="space-y-1 px-3">
      {menuItems.map(item => (
        <button
          key={item.id}
          onClick={() => {
            if (item.id === 'historique') {
              setSelectedBenevoleForHistorique(null);
            }
            setCurrentView(item.id as BenevoleView);
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentView === item.id
              ? 'bg-[#1E73BE] text-white shadow-md'
              : 'text-[#333333] hover:bg-[#F4F4F4]'
          }`}
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  // RENDER: Liste des bénévoles
  const renderListeBenevoles = () => {
    // ⚡ Usar stats memoizadas
    const stats = statsGenerales;

    return (
      <div className="space-y-4 sm:space-y-5">
        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div 
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
              boxShadow: `0 4px 15px ${branding.primaryColor}40`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative">
              <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Total Bénévoles</p>
              <div className="flex items-center justify-between">
                <p 
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {stats.total}
                </p>
                <Users className="w-7 h-7 sm:w-9 sm:h-9 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>

          <div 
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
              boxShadow: `0 4px 15px ${branding.secondaryColor}40`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative">
              <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Actifs</p>
              <div className="flex items-center justify-between">
                <p 
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {stats.actifs}
                </p>
                <TrendingUp className="w-7 h-7 sm:w-9 sm:h-9 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => {
              setSelectedBenevoleForHistorique(null);
              setCurrentView('historique');
            }}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
              boxShadow: '0 4px 15px rgba(156, 39, 176, 0.4)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative">
              <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Heures Totales</p>
              <div className="flex items-center justify-between">
                <p 
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {formaterHeures(stats.heuresTotal)}
                </p>
                <Clock className="w-7 h-7 sm:w-9 sm:h-9 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => {
              setSelectedBenevoleForHistorique(null);
              setCurrentView('historique');
            }}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
              boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative">
              <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Heures Mois</p>
              <div className="flex items-center justify-between">
                <p 
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {formaterHeures(stats.heuresMois)}
                </p>
                <Calendar className="w-7 h-7 sm:w-9 sm:h-9 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="border-gray-200/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10" style={{ color: branding.primaryColor }} />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-[#1a4d7a] focus:ring-[#1a4d7a]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <Select value={filterDepartement} onValueChange={setFilterDepartement}>
                <SelectTrigger 
                  className="w-full lg:w-56 h-11 border-gray-300"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <SelectValue placeholder="Département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {departements.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger 
                  className="w-full lg:w-48 h-11 border-gray-300"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="en pause">En pause</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Barra de acciones para selección múltiple */}
        {selectedBenevolesForEmail.length > 0 && (
          <Card className="border-[#1E73BE] border-2 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-[#1E73BE]" />
                  <span className="font-semibold text-[#333333]">
                    {selectedBenevolesForEmail.length} bénévole(s) sélectionné(s)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBenevolesForEmail([])}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="bg-[#1E73BE] hover:bg-[#1557A0]"
                    onClick={() => handleOpenEmailModal(selectedBenevolesForEmail)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tableau */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F4F4F4] border-b">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">
                      <Checkbox
                        checked={selectedBenevolesForEmail.length === filteredBenevoles.length && filteredBenevoles.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Département</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#333333]">Heures Totales</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#333333]">Heures Mois</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-[#333333]">Statut</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-[#333333]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBenevoles.map(benevole => (
                    <tr key={`${benevole.id}-${refreshDepartamentos}`} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="px-4 py-4 text-center">
                        <Checkbox
                          checked={selectedBenevolesForEmail.includes(benevole.id)}
                          onCheckedChange={() => toggleBenevoleSelection(benevole.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#333333]">{benevole.prenom} {benevole.nom}</p>
                          {benevole.numeroArchivo && (
                            <p className="text-xs font-mono font-semibold text-[#1a4d7a] mb-0.5">
                              📋 {benevole.numeroArchivo}
                            </p>
                          )}
                          <p className="text-sm text-[#666666]">{benevole.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const departamentos = obtenerDepartamentosBenevole(benevole);
                          
                          if (departamentos.length === 0) {
                            return (
                              <span className="text-[#c23934] font-medium italic text-sm">
                                ⚠️ Aucun département assigné
                              </span>
                            );
                          }
                          
                          return (
                            <div className="flex flex-wrap gap-1">
                              {departamentos.map(dept => (
                                <Badge
                                  key={dept.id}
                                  className="text-xs font-semibold px-2 py-1"
                                  style={{
                                    backgroundColor: dept.activo ? dept.color : '#9e9e9e',
                                    color: 'white',
                                    opacity: dept.activo ? 1 : 0.6
                                  }}
                                >
                                  {dept.activo ? '✓' : '⚠️'} {dept.nombre}
                                </Badge>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[#1E73BE]">{formaterHeures(benevole.heuresTotal)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-[#4CAF50]">{formaterHeures(benevole.heuresMois)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(benevole.statut)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setProfileBenevole(benevole);
                              setProfileModalOpen(true);
                            }}
                            className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                            title="Voir le profil"
                          >
                            <User className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedBenevoleForHistorique(benevole.id);
                              setCurrentView('historique');
                            }}
                            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                            title="Voir l'historique"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => abrirDialogoAsignarDepartamentos(benevole)}
                            className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                            title="Assigner aux départements"
                          >
                            <Link className="w-4 h-4" />
                          </Button>
                          {tieneContactoAsociado(benevole) && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleCambiarEstadoContacto(benevole)}
                                className={
                                  obtenerContactoAsociado(benevole)?.activo
                                    ? "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    : "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
                                }
                                title={(() => {
                                  const contacto = obtenerContactoAsociado(benevole);
                                  const dept = departementosStorage.find(d => d.id.toString() === contacto?.departamentoId.toString());
                                  const deptNombre = dept?.nombre || 'Département';
                                  return contacto?.activo
                                    ? `Contact actif (${deptNombre}) - Cliquer pour désactiver`
                                    : `Contact inactif (${deptNombre}) - Cliquer pour activer`;
                                })()}
                              >
                                {obtenerContactoAsociado(benevole)?.activo ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEliminarPerfilCompleto(benevole)}
                                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                title="Supprimer complètement le profil du bénévole"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setBenevoleParaRol({
                                id: benevole.id.toString(),
                                nombre: benevole.prenom,
                                apellido: benevole.nom,
                                nombreCompleto: `${benevole.prenom} ${benevole.nom}`,
                                email: benevole.email,
                                telefono: benevole.telephone,
                                cargo: benevole.poste || 'Bénévole',
                                modulo: 'benevole'
                              });
                              setDialogAsignarRolOpen(true);
                            }}
                            className="border-[#9C27B0] text-[#9C27B0] hover:bg-[#9C27B0] hover:text-white"
                            title="Créer un accès au système"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEditModal(benevole)}
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenEmailModal([benevole.id])}
                            title="Envoyer un email"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // RENDER: Fiche bénévole
  const renderFicheBenevole = () => {
    if (!selectedBenevole) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-[#666666]">Aucun bénévole sélectionné</p>
            <Button className="mt-4" onClick={() => setCurrentView('liste')}>
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Filtrar las hojas de tiempo del voluntario seleccionado
    const benevoleFeuillesTemps = feuillesTemps.filter(ft => ft.benevoleId === selectedBenevole.id);
    
    // Agregar las hojas de tiempo al objeto benevole
    const benevoleWithFeuilles = {
      ...selectedBenevole,
      feuillesTemps: benevoleFeuillesTemps
    };

    return (
      <FicheBenevole 
        benevole={benevoleWithFeuilles} 
        onNavigate={setCurrentView}
        onUpdate={(updatedBenevole) => {
          // Actualizar el bénévole en la lista
          const updatedList = benevoles.map(b => 
            b.id === updatedBenevole.id ? updatedBenevole : b
          );
          setBenevoles(updatedList);

          // 🔄 SINCRONIZAR AUTOMÁTICAMENTE CON CONTACTOS DE DEPARTAMENTO
          try {
            const resultado = sincronizarDesdeBenevole({
              email: updatedBenevole.email,
              nom: updatedBenevole.nom,
              prenom: updatedBenevole.prenom,
              telephone: updatedBenevole.telephone,
              direccion: updatedBenevole.adresse,
              apartamento: updatedBenevole.appartement,
              ciudad: updatedBenevole.ville,
              codigoPostal: updatedBenevole.codePostal,
              statut: updatedBenevole.statut,
              disponibilidadesSemanal: updatedBenevole.disponibilidadesSemanal,
              photo: updatedBenevole.photo,
              poste: updatedBenevole.poste,
              sexe: updatedBenevole.sexe,
              dateNaissance: updatedBenevole.dateNaissance,
              langues: updatedBenevole.langues,
              urgenceNom: updatedBenevole.contactoEmergenciaNombre,
              urgenceRelation: updatedBenevole.contactoEmergenciaRelacion,
              urgenceTelephone: updatedBenevole.contactoEmergenciaTelefono,
              urgenceEmail: updatedBenevole.contactoEmergenciaEmail,
              notes: updatedBenevole.notes || updatedBenevole.notasGenerales
            });

            if (resultado.actualizados > 0) {
              console.log(`✅ Bénévole synchronisé avec ${resultado.actualizados} contact(s) dans ${resultado.departamentos.length} département(s)`);
            }
          } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
          }

          toast.success('Bénévole mis à jour avec succès');
        }}
      />
    );
  };

  // RENDER: Feuilles de temps
  const renderFeuillesTemps = () => {
    const dureeCalculee = calculateDuree(newFeuilleTemps.heureDebut, newFeuilleTemps.heureFin);
    const sessionsEnCours = feuillesTemps.filter(f => f.enCours);
    const sessionsEnCoursFiltradas = sessionsEnCours.filter(feuille =>
      feuille.benevoleName.toLowerCase().includes(searchSortiePending.toLowerCase().trim())
    );

    return (
      <div className="space-y-4">
        {/* Information: gestion centralisée dans Recrutement */}
        <Card className="border-0 shadow-lg">
          <CardHeader
            className="pb-3"
            style={{
              background: `linear-gradient(135deg, ${branding.warningColor}15 0%, ${branding.primaryColor}10 100%)`
            }}
          >
            <CardTitle className="flex items-center gap-2" style={{ color: branding.warningColor }}>
              <AlertCircle className="w-5 h-5" />
              Feuilles de temps en lecture seule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div
              className="rounded-xl border p-4 text-sm"
              style={{
                backgroundColor: branding.warningColor + '10',
                borderColor: branding.warningColor + '35',
                color: '#5f6368'
              }}
            >
              <p className="font-semibold text-[#333333] mb-1">La modification du temps n’est pas autorisée depuis Bénévoles.</p>
              <p>
                Les entrées, sorties, corrections et suppressions de feuilles de temps doivent être faites uniquement dans le module Recrutement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sección de entradas en progreso */}
        {sessionsEnCours.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader 
              className="pb-3"
              style={{ 
                background: `linear-gradient(135deg, ${branding.warningColor}15 0%, ${branding.warningColor}10 100%)`
              }}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: branding.warningColor }}>
                  <Timer className="w-5 h-5" />
                  Sessions en cours ({sessionsEnCoursFiltradas.length}/{sessionsEnCours.length})
                </CardTitle>
                <Badge 
                  className="text-xs px-3 py-1 animate-pulse"
                  style={{ 
                    backgroundColor: branding.warningColor,
                    color: 'white'
                  }}
                >
                  En attente de sortie
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchSortiePending}
                  onChange={(e) => setSearchSortiePending(e.target.value)}
                  placeholder="Filtrer rapidement par nom..."
                  className="pl-10 h-11 bg-white"
                />
              </div>
              <div className="space-y-3">
                {sessionsEnCoursFiltradas.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 border rounded-lg bg-white">
                    Aucun bénévole en attente de sortie pour ce filtre.
                  </div>
                ) : sessionsEnCoursFiltradas.map(feuille => {
                    const tempsEcoule = (() => {
                      const now = new Date();
                      const hours = String(now.getHours()).padStart(2, '0');
                      const minutes = String(now.getMinutes()).padStart(2, '0');
                      return calculateDuree(feuille.heureDebut, `${hours}:${minutes}`);
                    })();

                    return (
                      <div 
                        key={feuille.id}
                        className="p-4 rounded-lg border-2 bg-white hover:shadow-md transition-all"
                        style={{ borderColor: branding.warningColor + '40' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: branding.primaryColor }}
                              >
                                {feuille.benevoleName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-lg">{feuille.benevoleName}</p>
                                <p className="text-sm text-gray-600">
                                  {feuille.departement} • {feuille.date}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                                <span className="font-mono text-lg font-bold" style={{ color: branding.secondaryColor }}>
                                  {feuille.heureDebut}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4" style={{ color: branding.warningColor }} />
                                <span className="font-mono text-sm" style={{ color: branding.warningColor }}>
                                  {formatHeures(tempsEcoule)} écoulé
                                </span>
                              </div>
                              {feuille.notes && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FileText className="w-3 h-3" />
                                  {feuille.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            className="ml-4 border border-[#F59E0B]/20 bg-[#FFF7E8] px-4 py-2 text-[#B45309] hover:bg-[#FFF7E8]"
                          >
                            Sortie à enregistrer depuis Recrutement
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla moderna de entradas recientes */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" style={{ color: branding.primaryColor }} />
                Entrées récentes
              </CardTitle>
              {puedeCorregir && (
                <Badge 
                  className="text-xs px-3 py-1 flex items-center gap-1.5"
                  style={{ 
                    backgroundColor: branding.secondaryColor + '15',
                    color: branding.secondaryColor,
                    border: `1px solid ${branding.secondaryColor}40`
                  }}
                >
                  <ShieldPlus className="w-3.5 h-3.5" />
                  Mode Correction Activé
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!puedeCorregir && (
              <div 
                className="mb-4 p-3 rounded-lg border flex items-center gap-2 text-sm"
                style={{ 
                  backgroundColor: branding.warningColor + '10',
                  borderColor: branding.warningColor + '40',
                  color: '#666'
                }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: branding.warningColor }} />
                <span>
                  <strong>Mode lecture seule:</strong> Les feuilles de temps se gèrent uniquement dans Recrutement.
                </span>
              </div>
            )}
            {feuillesTemps.filter(f => !f.enCours).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr 
                      className="border-b-2"
                      style={{ borderColor: branding.primaryColor + '20' }}
                    >
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
                        Département
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: branding.secondaryColor }}>
                        ARRIVÉE
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#DC3545' }}>
                        DÉPART
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
                        Temps Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
                        Date
                      </th>
                      {puedeCorregir && (
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {feuillesTemps.filter(f => !f.enCours).slice(0, 10).map((feuille, index) => {
                      const isEditing = puedeCorregir && editingFeuilleId === feuille.id;
                      const currentData = isEditing && editFeuilleTemps ? editFeuilleTemps : feuille;

                      return (
                        <tr 
                          key={feuille.id} 
                          className={`border-b hover:bg-gray-50 transition-colors ${isEditing ? 'bg-blue-50' : ''}`}
                          style={{ 
                            backgroundColor: isEditing ? branding.primaryColor + '10' : (index % 2 === 0 ? '#FFFFFF' : '#F9FAFB')
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: branding.primaryColor }}
                              >
                                {feuille.benevoleName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-semibold text-sm text-[#333333]">
                                {feuille.benevoleName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#666666]">
                            {feuille.departement}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <Input
                                type="time"
                                value={currentData.heureDebut}
                                onChange={(e) => setEditFeuilleTemps({ ...currentData, heureDebut: e.target.value })}
                                className="h-9 text-center font-mono w-28 mx-auto"
                                style={{ borderColor: branding.secondaryColor + '40' }}
                              />
                            ) : (
                              <span 
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono font-semibold"
                                style={{ 
                                  backgroundColor: branding.secondaryColor + '15',
                                  color: branding.secondaryColor
                                }}
                              >
                                <LogIn className="w-3 h-3" />
                                {feuille.heureDebut}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <Input
                                type="time"
                                value={currentData.heureFin}
                                onChange={(e) => setEditFeuilleTemps({ ...currentData, heureFin: e.target.value })}
                                className="h-9 text-center font-mono w-28 mx-auto"
                                style={{ borderColor: '#DC354540' }}
                              />
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-mono font-semibold">
                                <LogOut className="w-3 h-3" />
                                {feuille.heureFin}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span 
                              className="text-xl font-bold font-mono"
                              style={{ 
                                color: branding.primaryColor,
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                            >
                              {formatHeures(isEditing ? calculateDuree(currentData.heureDebut, currentData.heureFin) : feuille.duree)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#666666]">
                            {isEditing ? (
                              <Input
                                type="date"
                                value={currentData.date}
                                onChange={(e) => setEditFeuilleTemps({ ...currentData, date: e.target.value })}
                                className="h-9 w-40"
                              />
                            ) : (
                              new Date(feuille.date).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: 'short',
                                year: 'numeric'
                              })
                            )}
                          </td>
                          {puedeCorregir && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEditFeuille}
                                      className="h-8 px-3 text-white"
                                      style={{ backgroundColor: branding.secondaryColor }}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEditFeuille}
                                      className="h-8 px-3"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleStartEditFeuille(feuille)}
                                      className="h-8 px-2 hover:bg-blue-50"
                                    >
                                      <Edit2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteFeuille(feuille)}
                                      className="h-8 px-2 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Aucune entrée de temps enregistrée</p>
                <p className="text-sm text-gray-400 mt-1">Commencez par enregistrer une nouvelle entrée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // RENDER: Historique
  const renderHistorique = () => {
    // Filtrar feuilles de temps por bénévole y departamento si hay filtros seleccionados
    const filteredFeuillesTemps = feuillesTemps.filter(f => {
      const matchBenevole = selectedBenevoleForHistorique 
        ? f.benevoleId === selectedBenevoleForHistorique 
        : true;
      const matchDepartement = filterDepartementHistorique !== 'all' 
        ? f.departement === filterDepartementHistorique 
        : true;
      return matchBenevole && matchDepartement;
    });
    
    const totalHeures = filteredFeuillesTemps.reduce((sum, f) => sum + f.duree, 0);
    
    // Obtener nombre del bénévole seleccionado
    const selectedBenevole = selectedBenevoleForHistorique 
      ? benevoles.find(b => b.id === selectedBenevoleForHistorique)
      : null;

    return (
      <div className="space-y-4">
        <BoutonRetourHeader 
          onClick={() => {
            setCurrentView('liste');
            setSelectedBenevoleForHistorique(null);
            setFilterDepartementHistorique('all');
          }} 
          titre={selectedBenevole ? `Historique - ${selectedBenevole.prenom} ${selectedBenevole.nom}` : "Historique des Heures"}
        />
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <Select 
                value={selectedBenevoleForHistorique?.toString() || 'all'}
                onValueChange={(value) => setSelectedBenevoleForHistorique(value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger className="w-full lg:w-56">
                  <SelectValue placeholder="Tous les bénévoles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les bénévoles</SelectItem>
                  {benevoles.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.prenom} {b.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filterDepartementHistorique} 
                onValueChange={setFilterDepartementHistorique}
              >
                <SelectTrigger className="w-full lg:w-56">
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {departements.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1" />

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historique des heures</CardTitle>
              <div className="text-right">
                <p className="text-sm text-[#666666]">Total période</p>
                <p className="text-3xl font-bold text-[#1E73BE]">{formatHeures(totalHeures)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F4F4F4] border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Bénévole</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Département</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Horaire</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#333333]">Durée</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFeuillesTemps.length > 0 ? (
                    filteredFeuillesTemps.map(feuille => (
                      <tr key={feuille.id} className="hover:bg-[#F9F9F9]">
                        <td className="px-6 py-4 font-semibold text-[#333333]">{feuille.benevoleName}</td>
                        <td className="px-6 py-4 text-[#666666]">{feuille.departement}</td>
                        <td className="px-6 py-4 text-[#666666]">{new Date(feuille.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-[#666666]">{feuille.heureDebut} - {feuille.heureFin}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-[#1E73BE]">{formaterHeures(feuille.duree)}</span>
                        </td>
                        <td className="px-6 py-4 text-[#999999] text-sm">{feuille.notes || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Aucune heure enregistrée pour ce bénévole</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // RENDER: Statistiques démographiques
  const renderStatistiques = () => {
    // Usar bénévoles filtrados memoizados
    const filteredBenevoles = filteredBenevolesStats;

    // Opciones para el selector de filtro
    const getStatsFilterOptions = () => {
      switch (statsFilterType) {
        case 'departement':
          return ['tous', ...departements];
        case 'statut':
          return ['tous', 'actif', 'inactif', 'en pause', 'en attente'];
        default:
          return ['tous'];
      }
    };

    // Colores para el gráfico de sexo
    const sexeColors: Record<string, string> = {
      'Homme': '#1E73BE',
      'Femme': '#DC3545',
      'Autre': '#FFC107',
      'Non spécifié': '#999999'
    };

    // Colores para el gráfico de edad
    const ageColors = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#9C27B0', '#FF5722', '#999999'];

    return (
      <div className="space-y-6">
        {/* Encabezado de impresión (solo visible al imprimir) */}
        <div className="hidden print:block border-b-2 border-[#1E73BE] pb-3 mb-4">
          <h1 className="text-2xl font-bold text-[#1E73BE] mb-1">Banque Alimentaire - Statistiques démographiques</h1>
          <div className="flex justify-between text-sm text-[#666666]">
            <span>Répartition des bénévoles par sexe et par âge</span>
            <span>Date: {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {statsGenerated && statsDateDebut && statsDateFin && (
            <div className="mt-2 text-sm text-[#1E73BE]">
              <strong>Période d'inscription:</strong> {new Date(statsDateDebut).toLocaleDateString('fr-FR')} au {new Date(statsDateFin).toLocaleDateString('fr-FR')}
              {statsFilterValue !== 'tous' && <> • <strong>Filtre:</strong> {statsFilterValue}</>}
            </div>
          )}
        </div>

        {/* Encabezado normal (oculto en impresión) */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-[#333333]">Statistiques démographiques</h2>
            <p className="text-[#666666] mt-1">Répartition des bénévoles par sexe et par âge</p>
          </div>
        </div>

        {/* Panneau de filtres */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#1E73BE]" />
              Critères de filtrage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Ligne 1: Type de filtre et valeur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Type de filtre
                  </label>
                  <select
                    value={statsFilterType}
                    onChange={(e) => {
                      setStatsFilterType(e.target.value as 'departement' | 'statut');
                      setStatsFilterValue('tous');
                    }}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  >
                    <option value="departement">Par département</option>
                    <option value="statut">Par statut</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Valeur du filtre
                  </label>
                  <select
                    value={statsFilterValue}
                    onChange={(e) => setStatsFilterValue(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  >
                    {getStatsFilterOptions().map(option => (
                      <option key={option} value={option}>
                        {option === 'tous' ? 'Tous' : option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ligne 2: Dates d'inscription */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date d'inscription - Début
                  </label>
                  <input
                    type="date"
                    value={statsDateDebut}
                    onChange={(e) => setStatsDateDebut(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date d'inscription - Fin
                  </label>
                  <input
                    type="date"
                    value={statsDateFin}
                    onChange={(e) => setStatsDateFin(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleGenerateStats}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Générer les statistiques
                </Button>
                
                {statsGenerated && (
                  <Button
                    onClick={handleResetStats}
                    variant="outline"
                    className="border-[#666666] text-[#666666] hover:bg-[#F4F4F4]"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                )}

                {(statsGenerated || (!statsDateDebut && !statsDateFin)) && (
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white print:hidden"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                )}
              </div>

              {/* Información del período */}
              {statsGenerated && statsDateDebut && statsDateFin && (
                <div className="p-4 bg-[#E3F2FD] rounded-lg border border-[#1E73BE]">
                  <p className="text-sm text-[#1E73BE] font-medium">
                    📊 Statistiques pour les inscriptions du{' '}
                    <strong>{new Date(statsDateDebut).toLocaleDateString('fr-FR')}</strong>
                    {' '}au{' '}
                    <strong>{new Date(statsDateFin).toLocaleDateString('fr-FR')}</strong>
                    {statsFilterValue !== 'tous' && (
                      <>
                        {' '}• Filtre: <strong>{statsFilterValue}</strong>
                      </>
                    )}
                    {' '}• <strong>{filteredBenevoles.length}</strong> bénévole(s) trouvé(s)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Résultats - mostrar siempre si no hay filtros, o solo cuando statsGenerated */}
        {(!statsDateDebut && !statsDateFin) || statsGenerated ? (
          <>
        {/* Cartes de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666] mb-1">Total bénévoles</p>
                  <p className="text-3xl font-bold text-[#1E73BE]">{filteredBenevoles.length}</p>
                </div>
                <Users className="w-12 h-12 text-[#1E73BE] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666] mb-1">Âge moyen</p>
                  <p className="text-3xl font-bold text-[#4CAF50]">{avgAge} ans</p>
                </div>
                <User className="w-12 h-12 text-[#4CAF50] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666] mb-1">Âge minimum</p>
                  <p className="text-3xl font-bold text-[#FFC107]">{minAge} ans</p>
                </div>
                <TrendingUp className="w-12 h-12 text-[#FFC107] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666] mb-1">Âge maximum</p>
                  <p className="text-3xl font-bold text-[#DC3545]">{maxAge} ans</p>
                </div>
                <Award className="w-12 h-12 text-[#DC3545] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par sexe */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par sexe</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sexeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sexeData.map((entry) => (
                      <Cell key={`sexe-${entry.name}`} fill={sexeColors[entry.name] || '#999999'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Tabla de detalles */}
              <div className="mt-6 space-y-2">
                {Object.entries(sexeStats).map(([sexe, count]) => {
                  const percentage = filteredBenevoles.length > 0 ? ((count / filteredBenevoles.length) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={sexe} className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: sexeColors[sexe] || '#999999' }}
                        />
                        <span className="text-[#333333] font-medium">{sexe}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#1E73BE] font-bold">{count}</span>
                        <span className="text-[#666666] text-sm ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Répartition par tranche d'âge */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par tranche d'âge</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#666666', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#666666' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`age-${entry.name}`} fill={ageColors[index % ageColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Tabla de detalles */}
              <div className="mt-6 space-y-2">
                {Object.entries(ageRanges)
                  .filter(([_, count]) => count > 0)
                  .map(([range, count], index) => {
                    const percentage = filteredBenevoles.length > 0 ? ((count / filteredBenevoles.length) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={range} className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: ageColors[index % ageColors.length] }}
                          />
                          <span className="text-[#333333] font-medium">{range}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#1E73BE] font-bold">{count}</span>
                          <span className="text-[#666666] text-sm ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
          </>
        ) : (
          /* Message si aucune statistique générée avec filtres */
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-20 h-20 text-[#E0E0E0] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#333333] mb-2">
                Configurez vos filtres
              </h3>
              <p className="text-[#666666]">
                Sélectionnez un type de filtre, une période d'inscription et cliquez sur "Générer les statistiques"<br />
                pour visualiser les données démographiques
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // RENDER: Répartition
  const renderRepartition = () => {
    // ⚡ Usar heures by department memoizadas
    const heuresByDept = heuresByDepartement;

    const COLORS = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#9C27B0', '#FF9800'];

    return (
      <div className="space-y-4">
        <BoutonRetourHeader 
          onClick={() => setCurrentView('liste')} 
          titre="Répartition des Heures"
        />
        <div className="space-y-6">
          {/* Encabezado de impresión (solo visible al imprimir) */}
          <div className="hidden print:block border-b-2 border-[#1E73BE] pb-3 mb-4">
            <h1 className="text-2xl font-bold text-[#1E73BE] mb-1">Banque Alimentaire - Répartition des heures</h1>
          <div className="flex justify-between text-sm text-[#666666]">
            <span>Distribution des heures par département et par bénévole</span>
            <span>Date: {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Encabezado normal con botón de impresión */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-[#333333]">Répartition des heures</h2>
            <p className="text-[#666666] mt-1">Distribution des heures par département et par bénévole</p>
          </div>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white print:hidden"
          >
            <FileText className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>

        {/* Cartes par département */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heuresByDept.map((dept, index) => (
            <Card key={dept.departement}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-8 h-8" style={{ color: COLORS[index % COLORS.length] }} />
                  <h3 className="font-semibold text-[#333333]">{dept.departement}</h3>
                </div>
                <p className="text-3xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                  {formaterHeures(dept.heures)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par département</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={heuresByDept}
                    dataKey="heures"
                    nameKey="departement"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => formaterHeures(entry.heures)}
                  >
                    {heuresByDept.map((entry, index) => (
                      <Cell key={`dept-${entry.departement}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Heures par département</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={heuresByDept}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="departement" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="heures" fill="#1E73BE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Liste détaillée */}
        <Card>
          <CardHeader>
            <CardTitle>Heures par bénévole et département</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F4F4F4] border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#333333]">Bénévole</th>
                    {departements.map(dept => (
                      <th key={dept} className="px-4 py-3 text-right text-sm font-semibold text-[#333333]">{dept}</th>
                    ))}
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#1E73BE]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {benevoles.map(benevole => {
                    const benevoleHeures = departements.map(dept => {
                      return feuillesTemps
                        .filter(f => f.benevoleId === benevole.id && f.departement === dept)
                        .reduce((sum, f) => sum + f.duree, 0);
                    });
                    const total = benevoleHeures.reduce((sum, h) => sum + h, 0);

                    if (total === 0) return null;

                    return (
                      <tr key={benevole.id} className="hover:bg-[#F9F9F9]">
                        <td className="px-6 py-4 font-semibold text-[#333333]">
                          {benevole.prenom} {benevole.nom}
                        </td>
                        {benevoleHeures.map((heures, index) => (
                          <td key={index} className="px-4 py-4 text-right text-[#666666]">
                            {heures > 0 ? formaterHeures(heures) : '—'}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-[#1E73BE]">{formaterHeures(total)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  };

  // RENDER: Rapports
  const renderRapports = () => {
    // Función para generar el reporte
    const handleGenerateRapport = () => {
      if (!rapportDateDebut || !rapportDateFin) {
        toast.error('Veuillez sélectionner les deux dates');
        return;
      }

      if (new Date(rapportDateDebut) > new Date(rapportDateFin)) {
        toast.error('La date de début doit être antérieure à la date de fin');
        return;
      }

      setRapportGenerated(true);
      toast.success('Rapport généré avec succès');
    };

    const handleResetRapport = () => {
      setRapportGenerated(false);
      setRapportFilterType('departement');
      setRapportFilterValue('tous');
      setRapportDateDebut('');
      setRapportDateFin('');
    };

    // Filtrar feuilles de temps según criterios
    const filteredFeuillesTemps = feuillesTemps.filter(f => {
      // Filtro por fecha
      if (rapportGenerated && rapportDateDebut && rapportDateFin) {
        const feuilleDate = new Date(f.date);
        const dateDebut = new Date(rapportDateDebut);
        const dateFin = new Date(rapportDateFin);
        if (feuilleDate < dateDebut || feuilleDate > dateFin) return false;
      }

      // Filtro por tipo
      if (rapportGenerated && rapportFilterValue !== 'tous') {
        if (rapportFilterType === 'departement' && f.departement !== rapportFilterValue) return false;
        if (rapportFilterType === 'benevole' && f.benevoleName !== rapportFilterValue) return false;
        if (rapportFilterType === 'statut') {
          const benevole = benevoles.find(b => b.id === f.benevoleId);
          if (benevole && benevole.statut !== rapportFilterValue) return false;
        }
      }

      return true;
    });

    // Filtrar bénévoles según criterios
    const filteredBenevoles = benevoles.filter(b => {
      if (!rapportGenerated || rapportFilterValue === 'tous') return true;
      
      if (rapportFilterType === 'departement') return b.departement === rapportFilterValue;
      if (rapportFilterType === 'statut') return b.statut === rapportFilterValue;
      if (rapportFilterType === 'benevole') return `${b.prenom} ${b.nom}` === rapportFilterValue;
      
      return true;
    });

    // Calcular estadísticas
    const totalHeuresRapport = filteredFeuillesTemps.reduce((sum, f) => sum + f.duree, 0);
    const benevolesActifsRapport = filteredBenevoles.filter(b => b.statut === 'actif').length;
    const nombreActivitesRapport = filteredFeuillesTemps.length;

    // Heures par département en el período
    const heuresByDeptRapport = departements.map(dept => {
      const heures = filteredFeuillesTemps
        .filter(f => f.departement === dept)
        .reduce((sum, f) => sum + f.duree, 0);
      return { departement: dept, heures };
    }).filter(d => d.heures > 0);

    // Opciones para el selector de filtro
    const getFilterOptions = () => {
      switch (rapportFilterType) {
        case 'departement':
          return ['tous', ...departements];
        case 'statut':
          return ['tous', 'actif', 'inactif', 'en pause', 'en attente'];
        case 'benevole':
          return ['tous', ...benevoles.map(b => `${b.prenom} ${b.nom}`)];
        default:
          return ['tous'];
      }
    };

    return (
      <div className="space-y-6">
        <div className="print:hidden">
          <BoutonRetourHeader 
            onClick={() => setCurrentView('liste')} 
            titre="Rapports et Statistiques"
          />
        </div>
        {/* Encabezado de impresión (solo visible al imprimir) */}
        <div className="hidden print:block border-b-2 border-[#1E73BE] pb-3 mb-4">
          <h1 className="text-2xl font-bold text-[#1E73BE] mb-1">Banque Alimentaire - Rapport d'activités</h1>
          <div className="flex justify-between text-sm text-[#666666]">
            <span>Rapport détaillé des activités des bénévoles</span>
            <span>Date: {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {rapportGenerated && rapportDateDebut && rapportDateFin && (
            <div className="mt-2 text-sm text-[#1E73BE]">
              <strong>Période:</strong> {new Date(rapportDateDebut).toLocaleDateString('fr-FR')} au {new Date(rapportDateFin).toLocaleDateString('fr-FR')}
              {rapportFilterValue !== 'tous' && <> • <strong>Filtre:</strong> {rapportFilterValue}</>}
              <> • <strong>{nombreActivitesRapport}</strong> activité(s) • <strong>{formaterHeures(totalHeuresRapport)}</strong> totales</>
            </div>
          )}
        </div>

        {/* Encabezado normal (oculto en impresión) */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-[#333333]">Rapports personnalisés</h2>
            <p className="text-[#666666] mt-1">Générez des rapports détaillés avec filtres et période</p>
          </div>
        </div>

        {/* Panneau de filtres */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#1E73BE]" />
              Critères de filtrage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Ligne 1: Type de filtre et valeur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Type de filtre
                  </label>
                  <select
                    value={rapportFilterType}
                    onChange={(e) => {
                      setRapportFilterType(e.target.value as 'departement' | 'statut' | 'benevole');
                      setRapportFilterValue('tous');
                    }}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  >
                    <option value="departement">Par département</option>
                    <option value="statut">Par statut</option>
                    <option value="benevole">Par bénévole</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Valeur du filtre
                  </label>
                  <select
                    value={rapportFilterValue}
                    onChange={(e) => setRapportFilterValue(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  >
                    {getFilterOptions().map(option => (
                      <option key={option} value={option}>
                        {option === 'tous' ? 'Tous' : option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ligne 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={rapportDateDebut}
                    onChange={(e) => setRapportDateDebut(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={rapportDateFin}
                    onChange={(e) => setRapportDateFin(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E73BE]"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleGenerateRapport}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Générer le rapport
                </Button>
                
                {rapportGenerated && (
                  <>
                    <Button
                      onClick={handleResetRapport}
                      variant="outline"
                      className="border-[#666666] text-[#666666] hover:bg-[#F4F4F4]"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                    
                    <Button
                      onClick={() => toast.info('Exportation en cours...')}
                      variant="outline"
                      className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter PDF
                    </Button>

                    <Button
                      onClick={() => toast.info('Exportation en cours...')}
                      variant="outline"
                      className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter Excel
                    </Button>

                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      className="border-[#9C27B0] text-[#9C27B0] hover:bg-[#9C27B0] hover:text-white print:hidden"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Imprimer
                    </Button>
                  </>
                )}
              </div>

              {/* Información del período */}
              {rapportGenerated && rapportDateDebut && rapportDateFin && (
                <div className="p-4 bg-[#E3F2FD] rounded-lg border border-[#1E73BE]">
                  <p className="text-sm text-[#1E73BE] font-medium">
                    📊 Rapport généré pour la période du{' '}
                    <strong>{new Date(rapportDateDebut).toLocaleDateString('fr-FR')}</strong>
                    {' '}au{' '}
                    <strong>{new Date(rapportDateFin).toLocaleDateString('fr-FR')}</strong>
                    {rapportFilterValue !== 'tous' && (
                      <>
                        {' '}• Filtre: <strong>{rapportFilterValue}</strong>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Résultats du rapport */}
        {rapportGenerated && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666] mb-1">Heures totales</p>
                      <p className="text-4xl font-bold text-[#1E73BE]">{formaterHeures(totalHeuresRapport)}</p>
                    </div>
                    <Clock className="w-16 h-16 text-[#1E73BE] opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666] mb-1">Activités</p>
                      <p className="text-4xl font-bold text-[#4CAF50]">{nombreActivitesRapport}</p>
                    </div>
                    <FileText className="w-16 h-16 text-[#4CAF50] opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666] mb-1">Bénévoles</p>
                      <p className="text-4xl font-bold text-[#9C27B0]">{filteredBenevoles.length}</p>
                    </div>
                    <Users className="w-16 h-16 text-[#9C27B0] opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de heures par département */}
            {heuresByDeptRapport.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des heures par département</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={heuresByDeptRapport}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis 
                        dataKey="departement" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        tick={{ fill: '#666666', fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: '#666666' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="heures" fill="#1E73BE" name="Heures" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Tableau détaillé des activités */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Détail des activités ({filteredFeuillesTemps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFeuillesTemps.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-[#E0E0E0]">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[#333333]">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[#333333]">Bénévole</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[#333333]">Département</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[#333333]">Horaire</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-[#333333]">Durée</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[#333333]">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeuillesTemps.map((feuille) => (
                          <tr key={feuille.id} className="border-b border-[#E0E0E0] hover:bg-[#F9F9F9]">
                            <td className="px-4 py-3 text-sm text-[#333333]">
                              {new Date(feuille.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#333333] font-medium">
                              {feuille.benevoleName}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#666666]">
                              {feuille.departement}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#666666]">
                              {feuille.heureDebut} - {feuille.heureFin}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-[#1E73BE]">
                              {formaterHeures(feuille.duree)}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#666666] italic">
                              {feuille.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#F4F4F4] font-bold">
                          <td colSpan={4} className="px-4 py-3 text-right text-[#333333]">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-right text-[#1E73BE] text-lg">
                            {formaterHeures(totalHeuresRapport)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-[#E0E0E0] mx-auto mb-3" />
                    <p className="text-[#999999] italic">Aucune activité trouvée pour ces critères</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Message si aucun rapport généré */}
        {!rapportGenerated && (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-20 h-20 text-[#E0E0E0] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#333333] mb-2">
                Configurez vos filtres
              </h3>
              <p className="text-[#666666]">
                Sélectionnez un type de filtre, une période et cliquez sur "Générer le rapport"<br />
                pour visualiser les statistiques détaillées
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Main render - Se renderiza basado en la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'liste':
        return renderListeBenevoles();
      case 'fiche':
        return renderFicheBenevole();
      case 'feuilles-temps':
        return renderFeuillesTemps();
      case 'statistiques':
        return renderStatistiques(); // ✅ Re-activado con optimizaciones
      case 'historique':
        return renderHistorique();
      case 'repartition':
        return renderRepartition();
      case 'rapports':
        return renderRapports();
      case 'contactos':
        // ✅ Vista especial: Mostrar TODOS los bénévoles del sistema (todos los departamentos)
        return <GestionContactosDepartamento departamentoId="todos" departamentoNombre="Tous les Bénévoles" />;
      default:
        return renderListeBenevoles();
    }
  };

  // Vista pública simplificada (solo hojas de tiempo)
  if (isPublicAccess) {
    return (
      <div 
        className="app-compact-page min-h-screen p-3 sm:p-4 md:p-6 relative overflow-hidden" 
        style={{ 
          fontFamily: 'Roboto, sans-serif',
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
        }}
      >
        {/* Formas decorativas de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: branding.primaryColor }}
          />
          <div 
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: branding.secondaryColor }}
          />
        </div>

        {/* Contenedor principal */}
        <div className="app-compact-page__content relative z-10 w-full max-w-6xl mx-auto">
          <div 
            className="app-compact-panel backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60"
            style={{
              boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2)'
            }}
          >
            {/* Header simplificado */}
            <div className="flex justify-center mb-4">
              <div className="relative inline-block">
                <div 
                  className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <div 
                  className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                  style={{ borderColor: branding.primaryColor }}
                >
                  {branding.logo ? (
                    <img 
                      src={branding.logo} 
                      alt="Logo" 
                      className="h-full w-full rounded-full"
                      style={{ 
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  ) : (
                    <div 
                      className="h-full w-full flex items-center justify-center text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <span className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        BA
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Título */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock 
                className="w-6 h-6 sm:w-8 sm:h-8" 
                style={{ color: branding.secondaryColor }}
              />
              <h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-center" 
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: branding.primaryColor 
                }}
              >
                Feuilles de Temps - Accès Public
              </h1>
              <Sparkles 
                className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
                style={{ color: branding.secondaryColor }}
              />
            </div>

            {/* Badge de acceso público */}
            <div className="flex justify-center mb-6">
              <div 
                className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"
                style={{ 
                  backgroundColor: branding.secondaryColor + '15',
                  color: branding.secondaryColor,
                  border: `2px solid ${branding.secondaryColor}40`,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                <ShieldPlus className="w-4 h-4" />
                Accès Libre • Sans Connexion
              </div>
            </div>

            {/* Contenido: Solo Feuilles de temps */}
            <div>
              {renderFeuillesTemps()}
            </div>

            {/* Botón de retour */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'white',
                  color: branding.primaryColor,
                  border: `2px solid ${branding.primaryColor}`,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                <LogOut className="w-4 h-4" />
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo degradado con colores del branding */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            top: '10%',
            left: '5%',
            backgroundColor: branding.secondaryColor
          }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            top: '60%',
            right: '10%',
            backgroundColor: branding.primaryColor,
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            bottom: '20%',
            left: '50%',
            backgroundColor: branding.secondaryColor
          }}
        />
      </div>

      {/* Contenedor principal */}
      <div className="app-compact-page relative z-10 p-3 sm:p-4 md:p-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="app-compact-page__content w-full max-w-7xl mx-auto">
          <div 
            className="app-compact-panel backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60"
            style={{
              boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
            }}
          >
          {/* Header con logo y título */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              {/* Glow effect detrás del logo */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div 
                className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                style={{ borderColor: branding.primaryColor }}
              >
                {branding.logo ? (
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full rounded-full"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
                    }}
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      BA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Título con icono y botones de acción */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users 
                className="w-6 h-6 sm:w-8 sm:h-8" 
                style={{ color: branding.primaryColor }}
              />
              <h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" 
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: branding.primaryColor 
                }}
              >
                Gestion des Bénévoles
              </h1>
              <Sparkles 
                className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
                style={{ color: branding.secondaryColor }}
              />
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setNewModalOpen(true)}
                className="text-white"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Bénévole
              </Button>
            </div>
          </div>

          {/* Navegación horizontal */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {menuItems.map((item, index) => {
                const isActive = currentView === item.id;
                const buttonColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'historique') {
                        setSelectedBenevoleForHistorique(null);
                      }
                      setCurrentView(item.id as BenevoleView);
                    }}
                    className={`relative px-4 py-2.5 rounded-xl transition-all duration-300 overflow-hidden group ${
                      isActive ? 'shadow-lg' : 'hover:scale-105'
                    }`}
                    style={{
                      background: isActive 
                        ? `linear-gradient(135deg, ${buttonColor} 0%, ${buttonColor}dd 100%)`
                        : 'rgba(255, 255, 255, 0.6)',
                      color: isActive ? 'white' : buttonColor,
                      fontFamily: 'Montserrat, sans-serif',
                      border: isActive ? 'none' : `1px solid ${buttonColor}40`,
                      boxShadow: isActive ? `0 4px 15px ${buttonColor}40` : 'none'
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                    <span className="relative flex items-center gap-2 text-sm font-medium">
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido */}
          <div>
            {renderCurrentView()}
          </div>
          </div>
        </div>
      </div>

      {/* Modal de edición - ELIMINADO: Ahora se usa FormularioNouveauBenevole en modo edición */}

      {/* Modal de création - Se usa FormularioNouveauBenevole */}

      {/* Modal d'envoi d'email */}
      {emailModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setEmailModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
              <CardHeader className="border-b bg-gradient-to-r from-[#1E73BE] to-[#1557A0] text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Envoyer un Email</CardTitle>
                      <p className="text-sm text-white/80 mt-1">
                        {selectedBenevolesForEmail.length} destinataire(s)
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEmailModalOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Destinataires */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <Label className="text-sm font-semibold text-[#1E73BE] mb-2 block">Destinataires</Label>
                  <div className="flex flex-wrap gap-2">
                    {benevoles
                      .filter(b => selectedBenevolesForEmail.includes(b.id))
                      .map(b => (
                        <Badge key={b.id} className="bg-[#1E73BE] text-white px-3 py-1">
                          {b.prenom} {b.nom}
                        </Badge>
                      ))
                    }
                  </div>
                </div>

                {/* Sélection de template */}
                <div>
                  <Label>Template d'email</Label>
                  <Select 
                    value={emailForm.template} 
                    onValueChange={(value: any) => handleTemplateChange(value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez un template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          <span>Message personnalisé</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="invitation">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Invitation à un événement</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rappel">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Rappel de session</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="remerciement">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span>Remerciement</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="annonce">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Annonce importante</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sujet */}
                <div>
                  <Label>Sujet *</Label>
                  <Input
                    placeholder="Sujet de l'email"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Message */}
                <div>
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Écrivez votre message ici..."
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                    rows={12}
                    className="mt-1 font-sans"
                  />
                  <p className="text-xs text-[#666666] mt-1">
                    Astuce: Vous pouvez personnaliser les templates en modifiant le texte
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => setEmailModalOpen(false)}
                    className="px-6"
                  >
                    Annuler
                  </Button>
                  <Button 
                    className="px-8 bg-gradient-to-r from-[#1E73BE] to-[#1557A0] hover:from-[#1557A0] hover:to-[#1E73BE] text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={handleSendEmail}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Modal de ID Digital */}
      {selectedBenevoleForID && (
        <IDDigitalBenevole
          benevole={selectedBenevoleForID}
          isOpen={idDigitalModalOpen}
          onClose={() => {
            setIdDigitalModalOpen(false);
            setSelectedBenevoleForID(null);
          }}
        />
      )}

      {/* Modal de création/édition avec tabs */}
      <FormularioNouveauBenevole
        isOpen={newModalOpen}
        onClose={() => {
          setNewModalOpen(false);
          setEditingBenevole(null); // Limpiar el estado de edición al cerrar
        }}
        formData={newForm}
        onFormChange={setNewForm}
        onSave={handleSaveNew}
        departements={departements}
        photoPreview={newFormPhotoPreview}
        onPhotoChange={handleNewFormPhotoChange}
        getTipoBenevoleConfig={getTipoBenevoleConfig}
        onOpenGestionTiposContacto={() => {
          setNewModalOpen(false);
          setCurrentView('contactos');
        }}
        isEditMode={!!editingBenevole}
        benevoleId={editingBenevole?.id}
      />

      {/* Dialog Asignar Bénévole a Departamentos */}
      <Dialog open={dialogAsignarDepartamentos} onOpenChange={setDialogAsignarDepartamentos}>
        <DialogContent className="app-dialog-comfort max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="asignar-departamentos-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Link className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Assigner aux départements
            </DialogTitle>
            <DialogDescription id="asignar-departamentos-description">
              Sélectionnez les départements où ce bénévole travaillera
            </DialogDescription>
          </DialogHeader>

          {benevoleSeleccionadoAsignar && (
            <div className="space-y-3 sm:space-y-4">
              {/* Info du bénévole */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border-2" style={{ borderColor: branding.primaryColor }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: branding.primaryColor }}>
                    {benevoleSeleccionadoAsignar.photo ? (
                      <img src={benevoleSeleccionadoAsignar.photo} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#333333]">{benevoleSeleccionadoAsignar.prenom} {benevoleSeleccionadoAsignar.nom}</h3>
                    <p className="text-sm text-[#666666]">{benevoleSeleccionadoAsignar.email}</p>
                  </div>
                </div>
              </div>

              {/* Selector de departamentos */}
              <div>
                <Label className="text-sm font-bold text-[#333333] mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Départements
                  <span className="text-red-500 ml-1">*</span>
                  {departamentosAsignar.length > 0 && (
                    <span 
                      className="ml-2 px-2 py-0.5 rounded-full text-white font-bold text-xs"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {departamentosAsignar.length} sélectionné{departamentosAsignar.length > 1 ? 's' : ''}
                    </span>
                  )}
                </Label>
                
                <p className="text-xs text-[#666666] mb-3 italic">
                  <span className="text-red-500 font-semibold">* Obligatoire</span> - Sélectionnez au moins un département
                </p>

                <MultiSelectDepartements
                  value={departamentosAsignar}
                  onChange={(nouveauxDepts) => {
                    console.log('🔄 Nouveaux départements sélectionnés:', {
                      avant: departamentosAsignar,
                      apres: nouveauxDepts,
                      total: nouveauxDepts.length
                    });
                    setDepartamentosAsignar(nouveauxDepts);
                  }}
                  options={obtenerDepartamentos()
                    .filter(dept => dept.activo)
                    .sort((a, b) => a.orden - b.orden)
                    .map(dept => ({ id: dept.id, label: dept.nombre }))}
                  placeholder="Cliquez pour sélectionner les départements"
                  maxHeight="350px"
                />
              </div>

              {/* Botones */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 sm:pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setDialogAsignarDepartamentos(false);
                    setBenevoleSeleccionadoAsignar(null);
                    setDepartamentosAsignar([]);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleGuardarAsignacionDepartamentos}
                  className="w-full sm:w-auto text-white"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Assigner
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Asignar Rol a Bénévole */}
      {benevoleParaRol && (
        <AsignarRolContacto
          open={dialogAsignarRolOpen}
          onOpenChange={setDialogAsignarRolOpen}
          contacto={benevoleParaRol}
          rolesDisponibles={rolesDisponibles}
          onGuardar={(datosAcceso) => {
            console.log('✅ Accès créé pour bénévole:', datosAcceso);
            toast.success(`🔐 Accès au système créé pour ${benevoleParaRol.nombreCompleto}!`);
            // Aquí podrías actualizar el bénévole con la información de acceso si lo deseas
            setBenevoleParaRol(null);
          }}
        />
      )}

      {/* Dialog: Profil Détaillé du Bénévole */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="app-dialog-comfort max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="benevole-profile-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Users className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Profil du Bénévole
            </DialogTitle>
            <DialogDescription id="benevole-profile-description">
              Informations détaillées du bénévole et son activité
            </DialogDescription>
          </DialogHeader>

          {profileBenevole && (() => {
            const cardColor = branding.primaryColor;
            const departamentos = obtenerDepartamentos();
            const departementsNoms = Array.isArray(profileBenevole.departement)
              ? profileBenevole.departement.map(deptId => {
                  const dept = departamentos.find(d => d.id.toString() === deptId.toString());
                  return dept ? dept.nombre : deptId;
                })
              : [profileBenevole.departement];
            
            return (
              <div className="space-y-4 sm:space-y-6">
                {/* En-tête du profil avec avatar et badge */}
                <div 
                  className="p-4 sm:p-6 rounded-xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-white flex-shrink-0 relative"
                      style={{ 
                        background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                        boxShadow: `0 4px 12px ${cardColor}30`
                      }}
                    >
                      {profileBenevole.photo ? (
                        <img 
                          src={profileBenevole.photo} 
                          alt={profileBenevole.prenom}
                          className="w-full h-full rounded-xl sm:rounded-2xl object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 sm:w-10 sm:h-10" />
                      )}
                      {profileBenevole.statut === 'actif' && (
                        <div 
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center"
                          style={{ backgroundColor: branding.secondaryColor }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <h3 
                            className="text-xl sm:text-2xl font-bold mb-1 break-words"
                            style={{ 
                              fontFamily: 'Montserrat, sans-serif',
                              color: branding.primaryColor
                            }}
                          >
                            {profileBenevole.prenom} {profileBenevole.nom}
                          </h3>
                          {profileBenevole.poste && (
                            <p className="text-sm sm:text-lg mb-2" style={{ color: branding.secondaryColor }}>
                              {profileBenevole.poste}
                            </p>
                          )}
                        </div>
                        <Badge
                          className="text-xs px-3 py-1 self-start"
                          style={{
                            backgroundColor: profileBenevole.statut === 'actif' 
                              ? branding.secondaryColor 
                              : profileBenevole.statut === 'en pause'
                                ? '#FFC107'
                                : '#DC3545',
                            color: 'white'
                          }}
                        >
                          {profileBenevole.statut.charAt(0).toUpperCase() + profileBenevole.statut.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap mt-2">
                        {profileBenevole.numeroArchivo && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80">
                            <FileText className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                            <span 
                              className="text-sm font-mono font-semibold tracking-wide"
                              style={{ color: branding.secondaryColor }}
                            >
                              {profileBenevole.numeroArchivo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques du bénévole */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div 
                    className="p-3 sm:p-4 rounded-xl border-l-4"
                    style={{ 
                      backgroundColor: `${branding.primaryColor}10`,
                      borderLeftColor: branding.primaryColor
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" style={{ color: branding.primaryColor }} />
                      <p className="text-xs text-gray-500">Total Heures</p>
                    </div>
                    <p 
                      className="text-2xl font-bold"
                      style={{ 
                        fontFamily: 'Montserrat, sans-serif',
                        color: branding.primaryColor
                      }}
                    >
                      {formaterHeures(profileBenevole.heuresTotal)}
                    </p>
                  </div>
                  <div 
                    className="p-3 sm:p-4 rounded-xl border-l-4"
                    style={{ 
                      backgroundColor: `${branding.secondaryColor}10`,
                      borderLeftColor: branding.secondaryColor
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                      <p className="text-xs text-gray-500">Ce mois</p>
                    </div>
                    <p 
                      className="text-2xl font-bold"
                      style={{ 
                        fontFamily: 'Montserrat, sans-serif',
                        color: branding.secondaryColor
                      }}
                    >
                      {formaterHeures(profileBenevole.heuresMois)}
                    </p>
                  </div>
                  <div 
                    className="p-3 sm:p-4 rounded-xl border-l-4"
                    style={{ 
                      backgroundColor: `${branding.primaryColor}10`,
                      borderLeftColor: branding.primaryColor
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-4 h-4" style={{ color: branding.primaryColor }} />
                      <p className="text-xs text-gray-500">Inscription</p>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(profileBenevole.dateInscription).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="space-y-3">
                  <h4 
                    className="font-semibold text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    <Mail className="w-5 h-5" />
                    Coordonnées
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Mail className="w-5 h-5 flex-shrink-0" style={{ color: cardColor }} />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium truncate">{profileBenevole.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Phone className="w-5 h-5 flex-shrink-0" style={{ color: cardColor }} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                        <p className="text-sm font-medium">{profileBenevole.telephone}</p>
                      </div>
                    </div>
                    {profileBenevole.adresse && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 md:col-span-2">
                        <MapPin className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: cardColor }} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 mb-1">Adresse</p>
                          <p className="text-sm font-medium">{profileBenevole.adresse}</p>
                          {(profileBenevole.ville || profileBenevole.codePostal) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {profileBenevole.ville && profileBenevole.ville}
                              {profileBenevole.codePostal && `, ${profileBenevole.codePostal}`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Départements et Disponibilités */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Départements */}
                  <div className="space-y-3">
                    <h4 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                    >
                      <Building2 className="w-5 h-5" />
                      Départements
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {departementsNoms.map((nom, idx) => {
                        const dept = departamentos.find(d => d.nombre === nom);
                        return (
                          <Badge
                            key={idx}
                            className="px-3 py-1"
                            style={{
                              backgroundColor: dept?.color ? `${dept.color}20` : `${branding.primaryColor}20`,
                              color: dept?.color || branding.primaryColor,
                              border: `1px solid ${dept?.color || branding.primaryColor}40`
                            }}
                          >
                            {dept?.icono} {nom}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Langues */}
                  {profileBenevole.langues && profileBenevole.langues.length > 0 && (
                    <div className="space-y-3">
                      <h4 
                        className="font-semibold text-lg flex items-center gap-2"
                        style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                      >
                        <Languages className="w-5 h-5" />
                        Langues
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profileBenevole.langues.map((langue, idx) => (
                          <Badge
                            key={idx}
                            className="px-3 py-1"
                            style={{
                              backgroundColor: `${branding.secondaryColor}20`,
                              color: branding.secondaryColor,
                              border: `1px solid ${branding.secondaryColor}40`
                            }}
                          >
                            {langue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Disponibilités hebdomadaires */}
                {profileBenevole.disponibilidadesSemanal && profileBenevole.disponibilidadesSemanal.length > 0 && (
                  <div className="space-y-3">
                    <h4 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                    >
                      <CalendarDays className="w-5 h-5" />
                      Disponibilités
                    </h4>
                    <div className="grid grid-cols-7 gap-2">
                      {profileBenevole.disponibilidadesSemanal.map((dispo, idx) => {
                        const hasDisponibilite = dispo.am || dispo.pm;
                        return (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg text-center ${hasDisponibilite ? 'border-2' : 'border'}`}
                            style={{
                              backgroundColor: hasDisponibilite ? `${branding.secondaryColor}10` : '#f9fafb',
                              borderColor: hasDisponibilite ? branding.secondaryColor : '#e5e7eb'
                            }}
                          >
                            <p 
                              className="text-xs font-semibold mb-2"
                              style={{ 
                                color: hasDisponibilite ? branding.secondaryColor : '#9ca3af',
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                            >
                              {dispo.jour.substring(0, 3)}
                            </p>
                            <div className="space-y-1">
                              <div 
                                className={`text-xs px-1 py-0.5 rounded ${dispo.am ? 'font-medium' : ''}`}
                                style={{
                                  backgroundColor: dispo.am ? branding.secondaryColor : 'transparent',
                                  color: dispo.am ? 'white' : '#d1d5db'
                                }}
                              >
                                AM
                              </div>
                              <div 
                                className={`text-xs px-1 py-0.5 rounded ${dispo.pm ? 'font-medium' : ''}`}
                                style={{
                                  backgroundColor: dispo.pm ? branding.secondaryColor : 'transparent',
                                  color: dispo.pm ? 'white' : '#d1d5db'
                                }}
                              >
                                PM
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contact d'urgence */}
                {(profileBenevole.contactoEmergenciaNombre || profileBenevole.contactoEmergenciaTelefono) && (
                  <div className="space-y-3">
                    <h4 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                    >
                      <AlertCircle className="w-5 h-5" />
                      Contact d'urgence
                    </h4>
                    <div 
                      className="p-4 rounded-xl border-l-4"
                      style={{ 
                        backgroundColor: '#FFF3CD',
                        borderLeftColor: '#FFC107'
                      }}
                    >
                      {profileBenevole.contactoEmergenciaNombre && (
                        <p className="text-sm mb-1">
                          <strong>Nom:</strong> {profileBenevole.contactoEmergenciaNombre}
                          {profileBenevole.contactoEmergenciaRelacion && ` (${profileBenevole.contactoEmergenciaRelacion})`}
                        </p>
                      )}
                      {profileBenevole.contactoEmergenciaTelefono && (
                        <p className="text-sm mb-1">
                          <strong>Téléphone:</strong> {profileBenevole.contactoEmergenciaTelefono}
                        </p>
                      )}
                      {profileBenevole.contactoEmergenciaEmail && (
                        <p className="text-sm">
                          <strong>Email:</strong> {profileBenevole.contactoEmergenciaEmail}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {profileBenevole.notes && (
                  <div className="space-y-3">
                    <h4 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                    >
                      <StickyNote className="w-5 h-5" />
                      Notes
                    </h4>
                    <div 
                      className="p-4 rounded-xl border-l-4"
                      style={{ 
                        backgroundColor: `${branding.primaryColor}05`,
                        borderLeftColor: branding.primaryColor
                      }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{profileBenevole.notes}</p>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {profileBenevole.documents && profileBenevole.documents.length > 0 && (
                  <div className="space-y-3">
                    <h4 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                    >
                      <FileText className="w-5 h-5" />
                      Documents ({profileBenevole.documents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {profileBenevole.documents.map((doc) => (
                        <div 
                          key={doc.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${branding.primaryColor}15` }}
                          >
                            {doc.type.includes('image') ? (
                              <ImageIcon className="w-5 h-5" style={{ color: branding.primaryColor }} />
                            ) : (
                              <File className="w-5 h-5" style={{ color: branding.primaryColor }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.nom}</p>
                            <p className="text-xs text-gray-500">
                              {doc.taille} • {new Date(doc.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setProfileModalOpen(false);
                      setProfileBenevole(null);
                    }}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Fermer
                  </Button>
                  <Button
                    className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                    onClick={() => {
                      setProfileModalOpen(false);
                      handleOpenEditModal(profileBenevole);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Botón flotante para agregar bénévole */}
      <button
        onClick={() => setNewModalOpen(true)}
        className="fixed bottom-24 right-8 w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center group z-50"
        style={{
          background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
          boxShadow: `0 8px 24px ${branding.secondaryColor}60, 0 0 40px ${branding.secondaryColor}20`
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <UserPlus className="w-7 h-7 text-white relative z-10" />
      </button>
    </div>
  );
}