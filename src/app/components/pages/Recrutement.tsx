import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { AdaptiveBrandLogo } from '../shared/AdaptiveBrandLogo';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { FormularioContactoCompacto } from '../departamentos/FormularioContactoCompacto';
import { FormularioOrganismoCompacto } from '../organismos/FormularioOrganismoCompacto';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ArrowLeft,
  UserPlus, 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Filter,
  Search,
  Sparkles,
  Trash2,
  ClipboardList,
  Timer,
  LogIn,
  LogOut,
  Check,
  Link,
  UserMinus,
  Edit,
  ArrowRightLeft,
  Plus,
  Download,
  Copy,
  ExternalLink,
  Building2,
  Eye
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { exportToCSV, type TableColumn } from '../../utils/exportUtils';
import { ModuleControlSurface, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import {
  guardarContacto,
  obtenerContactosPorDepartamento,
  actualizarContacto,
  eliminarContacto,
  type ContactoDepartamento,
  type DisponibilidadDia,
  type TipoContacto
} from '../../utils/contactosDepartamentoStorage';
import {
  obtenerCandidatos,
  guardarCandidatos,
  actualizarCandidato,
  agregarCandidato,
  eliminarCandidato,
  type Candidato,
  type FeuilleTiempoCandidato,
  type HistorialCorreccionFeuilleTiempo
} from '../../utils/candidatosStorage'; // ✅ Importar storage
import {
  crearReferenciaDocumentoCandidato,
  eliminarContenidosDocumentoCandidato,
  guardarContenidoDocumentoCandidato,
} from '../../utils/candidatoDocumentoIndexedDb';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import {
  construirPayloadOrganismo,
  convertirOrganismoAFormulario,
  crearFormularioOrganismoVacio,
  validarFormularioOrganismo,
  type FormularioOrganismo,
} from '../../utils/organismoForm';
import {
  obtenerOrganismosRecrutement,
  guardarOrganismoRecrutement,
  eliminarOrganismoRecrutement,
  reinicializarClaveAccesoOrganismoRecrutement,
  RECRUTEMENT_ORGANISMES_UPDATED_EVENT,
  type OrganismoRecrutement
} from '../../utils/recrutementOrganismosStorage';
import { normalizarClaveAcceso } from '../../utils/claveAcceso';

// ✅ Usar tipo Candidato del storage
type Candidate = Candidato;
type CandidateContactForm = Omit<ContactoDepartamento, 'id'>;
type AssignationMode = 'assign' | 'modify';
type RecruitmentMainView = 'candidatures' | 'reports' | 'timesheets' | 'organisms';
type TimesheetDepartmentFilter = 'all' | string;
type CandidateTimesheetForm = {
  departamentoId: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  notes: string;
};
type FlattenedCandidateTimesheet = FeuilleTiempoCandidato & {
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
};

interface RecrutementProps {
  isPublicAccess?: boolean;
}

const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const RECRUITMENT_MOCK_POSITION_KEYS: Record<string, string> = {
  'Bénévole - Distribution': 'distributionVolunteer',
  'Coordinateur bénévole': 'volunteerCoordinator',
  'Chauffeur bénévole': 'volunteerDriver',
  'Bénévole - Cuisine': 'kitchenVolunteer',
  'Bénévole - Entrepôt': 'warehouseVolunteer'
};

const RECRUITMENT_MOCK_AVAILABILITY_KEYS: Record<string, string> = {
  'Lundi, Mercredi, Vendredi': 'mondayWednesdayFriday',
  'Temps plein': 'fullTime',
  'Mardi, Jeudi': 'tuesdayThursday',
  'Mercredi, Vendredi, Samedi': 'wednesdayFridaySaturday',
  'Flexible': 'flexible'
};

const RECRUITMENT_MOCK_EXPERIENCE_KEYS: Record<string, string> = {
  "2 ans d'expérience en service communautaire": 'communityServiceTwoYears',
  "5 ans d'expérience en gestion d'équipe": 'teamManagementFiveYears',
  '3 ans comme chauffeur professionnel': 'professionalDriverThreeYears',
  'Diplômée en arts culinaires': 'culinaryArtsGraduate',
  "1 an d'expérience en logistique": 'logisticsOneYear'
};

const getTiposOrganismoRecrutement = (t: any) => [
  { id: '1', nombre: t('organisms.organismTypes.communityKitchen'), icono: '🍽️' },
  { id: '2', nombre: t('organisms.organismTypes.foundation'), icono: '🏛️' },
  { id: '3', nombre: t('organisms.organismTypes.ngo'), icono: '🤝' },
  { id: '4', nombre: t('organisms.organismTypes.shelter'), icono: '🏠' },
  { id: '5', nombre: t('organisms.organismTypes.dayCenter'), icono: '☀️' },
  { id: '21', nombre: 'Collation', icono: '🥪' },
  { id: '6', nombre: t('organisms.organismTypes.school'), icono: '🎓' },
  { id: '7', nombre: t('organisms.organismTypes.daycare'), icono: '👶' },
  { id: '8', nombre: t('organisms.organismTypes.childrensHome'), icono: '👨‍👩‍👧‍👦' },
  { id: '9', nombre: t('organisms.organismTypes.seniorsHome'), icono: '👴' },
  { id: '10', nombre: t('organisms.organismTypes.rehabCenter'), icono: '💪' },
  { id: '11', nombre: t('organisms.organismTypes.hospital'), icono: '🏥' },
  { id: '12', nombre: t('organisms.organismTypes.church'), icono: '⛪' },
  { id: '13', nombre: t('organisms.organismTypes.civilAssociation'), icono: '📋' },
  { id: '14', nombre: t('organisms.organismTypes.communityCenter'), icono: '🏘️' },
  { id: '15', nombre: t('organisms.organismTypes.homelessShelter'), icono: '🛏️' },
  { id: '16', nombre: t('organisms.organismTypes.migrantCenter'), icono: '🌍' },
  { id: '17', nombre: t('organisms.organismTypes.womensHome'), icono: '👩' },
  { id: '18', nombre: t('organisms.organismTypes.disabilityCenter'), icono: '♿' },
  { id: '19', nombre: t('organisms.organismTypes.foodBank'), icono: '🛒' },
  { id: '20', nombre: t('organisms.organismTypes.other'), icono: '📌' }
];

const cloneDisponibilidades = (disponibilidades?: DisponibilidadDia[]) =>
  (disponibilidades && disponibilidades.length > 0
    ? disponibilidades
    : diasSemana.map(jour => ({ jour, am: false, pm: false })))
    .map(disponibilidad => ({ ...disponibilidad }));

const createInitialCandidateContactForm = (): CandidateContactForm => ({
  departamentoId: '7',
  departamentoIds: [],
  tipo: 'benevole',
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  genero: 'Non spécifié',
  email: '',
  telefono: '',
  cargo: '',
  disponibilidad: '',
  disponibilidades: cloneDisponibilidades(),
  notas: '',
  activo: true,
  fechaIngreso: new Date().toISOString().split('T')[0],
  direccion: '',
  apartamento: '',
  ciudad: '',
  codigoPostal: '',
  quartier: '',
  numeroEmpleado: '',
  horario: '',
  heuresSemaines: 0,
  reference: '',
  supervisor: '',
  especialidad: '',
  certificaciones: [],
  idiomas: [],
  foto: '',
  documents: []
});

const splitCandidateName = (fullName: string) => {
  const trimmedName = fullName.trim();

  if (!trimmedName) {
    return { nombre: '', apellido: '' };
  }

  const parts = trimmedName.split(/\s+/);
  return {
    nombre: parts[0] || '',
    apellido: parts.slice(1).join(' ')
  };
};

const getCandidateInitials = (fullName: string) =>
  fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const buildFullName = (nombre: string, apellido: string) =>
  [nombre.trim(), apellido.trim()].filter(Boolean).join(' ').trim();

const buildAvailabilityFromDisponibilidades = (disponibilidades?: DisponibilidadDia[]) => {
  if (!disponibilidades || disponibilidades.length === 0) {
    return '';
  }

  const diasSeleccionados = disponibilidades
    .filter(disponibilidad => disponibilidad.am || disponibilidad.pm)
    .map(disponibilidad => disponibilidad.jour);

  return Array.from(new Set(diasSeleccionados)).join(', ');
};

const buildDisponibilidadesFromAvailability = (
  availability: string,
  existingDisponibilidades?: DisponibilidadDia[]
) => {
  if (existingDisponibilidades && existingDisponibilidades.length > 0) {
    return cloneDisponibilidades(existingDisponibilidades);
  }

  const normalizedAvailability = availability.trim().toLowerCase();

  return diasSemana.map(jour => {
    const selected = normalizedAvailability.includes(jour.toLowerCase()) ||
      normalizedAvailability.includes('temps plein') ||
      normalizedAvailability.includes('flexible');

    return {
      jour,
      am: selected,
      pm: selected
    };
  });
};

const getTodayLocalDate = () => new Date().toISOString().split('T')[0];

const getCurrentLocalTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getCurrentTimestamp = () => new Date().toISOString();

const normalizeSearchText = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const isFoodBankOrganism = (organismo?: Partial<OrganismoRecrutement> | null) => {
  if (!organismo) {
    return false;
  }

  const normalizedText = normalizeSearchText([
    organismo.tipo,
    organismo.nombre,
    organismo.responsable,
  ].filter(Boolean).join(' '));

  return (
    normalizedText.includes('food bank') ||
    normalizedText.includes('foodbank') ||
    normalizedText.includes('banque alimentaire') ||
    normalizedText.includes('banco alimentario') ||
    normalizedText.includes('banco de alimentos') ||
    normalizedText.includes('despensa popular') ||
    normalizedText.includes('reseau alimentaire') ||
    normalizedText.includes('red alimentaria')
  );
};

const formatCorrectionTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} • ${hours}:${minutes}`;
};

const createInitialTimesheetForm = (candidate?: Candidate): CandidateTimesheetForm => ({
  departamentoId: candidate?.departamentoIds?.[0] || '',
  date: getTodayLocalDate(),
  heureDebut: '',
  heureFin: '',
  notes: ''
});

const calculateTimesheetDuration = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  return Math.max(0, (endTotalMinutes - startTotalMinutes) / 60);
};

const formatTimesheetHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}min`;
};

const calculateCurrentMonthHours = (timesheets: FeuilleTiempoCandidato[]) => {
  const currentMonth = getTodayLocalDate().slice(0, 7);

  return timesheets
    .filter(timesheet => timesheet.date.startsWith(currentMonth))
    .reduce((sum, timesheet) => sum + timesheet.duree, 0);
};

const mapCandidateToContactForm = (candidate: Candidate): CandidateContactForm => {
  const { nombre, apellido } = splitCandidateName(candidate.name);

  return {
    ...createInitialCandidateContactForm(),
    departamentoIds: candidate.departamentoIds || [],
    nombre,
    apellido,
    fechaNacimiento: candidate.fechaNacimiento || '',
    genero: candidate.genero || 'Non spécifié',
    email: candidate.email,
    telefono: candidate.phone,
    cargo: candidate.position,
    disponibilidad: candidate.availability,
    disponibilidades: buildDisponibilidadesFromAvailability(candidate.availability, candidate.disponibilidades),
    notas: candidate.experience,
    fechaIngreso: candidate.applicationDate ? candidate.applicationDate.split('T')[0] : new Date().toISOString().split('T')[0],
    direccion: candidate.adresse || '',
    apartamento: candidate.appartement || '',
    ciudad: candidate.ville || '',
    codigoPostal: candidate.codePostal || '',
    quartier: candidate.quartier || '',
    certificaciones: candidate.certificaciones || [],
    idiomas: candidate.idiomas || [],
    foto: candidate.foto || '',
    documents: candidate.documents || []
  };
};

const mapContactFormToCandidate = (
  form: CandidateContactForm,
  status: Candidate['status'],
  existingCandidate?: Candidate
): Omit<Candidate, 'id'> => {
  const disponibilidadTexto = buildAvailabilityFromDisponibilidades(form.disponibilidades) || form.disponibilidad.trim();

  return {
    name: buildFullName(form.nombre, form.apellido),
    email: form.email.trim(),
    phone: form.telefono.trim(),
    position: form.cargo?.trim() || '',
    status,
    applicationDate: existingCandidate?.applicationDate || new Date().toISOString(),
    experience: form.notas?.trim() || '',
    availability: disponibilidadTexto,
    numeroArchivo: existingCandidate?.numeroArchivo,
    adresse: form.direccion?.trim() || '',
    appartement: form.appartement?.trim() || '',
    ville: form.ciudad?.trim() || '',
    codePostal: form.codigoPostal?.trim() || '',
    quartier: form.quartier?.trim() || '',
    departamentoIds: form.departamentoIds || existingCandidate?.departamentoIds || [],
    contactoId: existingCandidate?.contactoId,
    fechaNacimiento: form.fechaNacimiento || undefined,
    genero: form.genero,
    disponibilidades: cloneDisponibilidades(form.disponibilidades),
    idiomas: form.idiomas || [],
    certificaciones: form.certificaciones || [],
    foto: form.foto || '',
    documents: form.documents || []
  };
};

const crearIdDocumentoCandidato = (index: number): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `candidate-document-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
};

const normalizarDocumentosCandidatoParaPersistencia = async (
  documents: CandidateContactForm['documents']
): Promise<{ documentos: CandidateContactForm['documents']; referenciasCreadas: string[] }> => {
  if (!documents || documents.length === 0) {
    return { documentos: [], referenciasCreadas: [] };
  }

  const referenciasCreadas: string[] = [];

  const documentos = await Promise.all(
    documents.map(async (documento, index) => {
      const urlDocumento = String(documento.url || '').trim();

      if (!urlDocumento.startsWith('data:')) {
        return documento;
      }

      const documentoId = crearIdDocumentoCandidato(index);
      await guardarContenidoDocumentoCandidato(documentoId, urlDocumento);

      const referencia = crearReferenciaDocumentoCandidato(documentoId);
      referenciasCreadas.push(referencia);

      return {
        ...documento,
        url: referencia,
      };
    })
  );

  return { documentos, referenciasCreadas };
};

const optimizarImagenCandidato = (source: string): Promise<string> => {
  const safeSource = String(source || '').trim();

  if (!safeSource.startsWith('data:image/')) {
    return Promise.resolve(safeSource);
  }

  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(safeSource);
        return;
      }

      const compressionSteps = [
        { maxSize: 240, quality: 0.78 },
        { maxSize: 160, quality: 0.68 },
        { maxSize: 120, quality: 0.58 },
      ];

      let optimized = safeSource;

      compressionSteps.some(({ maxSize, quality }) => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        optimized = canvas.toDataURL('image/jpeg', quality);
        return optimized.length <= 36 * 1024;
      });

      resolve(optimized);
    };

    image.onerror = () => resolve(safeSource);
    image.src = safeSource;
  });
};

export function Recrutement({ isPublicAccess = false }: RecrutementProps) {
  const { t, i18n } = useTranslation();
  const branding = useBranding();
  const tiposOrganismoRecrutement = getTiposOrganismoRecrutement(t);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogNuevoOpen, setDialogNuevoOpen] = useState(false);
  const [formularioCandidato, setFormularioCandidato] = useState<CandidateContactForm>(createInitialCandidateContactForm);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  
  // 🎯 Estados para el diálogo de asignación a departamento
  const [dialogAssignerOpen, setDialogAssignerOpen] = useState(false);
  const [candidatoParaAssignar, setCandidatoParaAssignar] = useState<Candidate | null>(null);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [departamentoOrigenSeleccionado, setDepartamentoOrigenSeleccionado] = useState('');
  const [assignationMode, setAssignationMode] = useState<AssignationMode>('assign');
  
  // 🎯 Estado para el panel de perfil detallado
  const [candidatoParaPerfil, setCandidatoParaPerfil] = useState<Candidate | null>(null);
  const [mainView, setMainView] = useState<RecruitmentMainView>(() => {
    if (isPublicAccess) {
      return 'timesheets';
    }

    return 'candidatures';
  });
  const [timesheetDepartmentFilter, setTimesheetDepartmentFilter] = useState<TimesheetDepartmentFilter>('all');
  const [timesheetMonthFilter, setTimesheetMonthFilter] = useState('');
  const [reportYearFilter, setReportYearFilter] = useState('all');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportVolunteerFilter, setReportVolunteerFilter] = useState('all');
  const [reportDepartmentFilter, setReportDepartmentFilter] = useState('all');
  const [timesheetCandidateSearch, setTimesheetCandidateSearch] = useState('');
  const [selectedTimesheetCandidateId, setSelectedTimesheetCandidateId] = useState('');
  const [timesheetForm, setTimesheetForm] = useState<CandidateTimesheetForm>(createInitialTimesheetForm);
  const [editingTimesheetId, setEditingTimesheetId] = useState<number | null>(null);
  const [publicAccessCodeInput, setPublicAccessCodeInput] = useState('');
  const [publicAccessSessionKey, setPublicAccessSessionKey] = useState('');
  const [publicAccessAuthError, setPublicAccessAuthError] = useState('');
  const [organismosAcreditados, setOrganismosAcreditados] = useState<OrganismoRecrutement[]>([]);
  const [organismosAcreditadosSeleccionados, setOrganismosAcreditadosSeleccionados] = useState<string[]>([]);
  const [organismSearchTerm, setOrganismSearchTerm] = useState('');
  const [organismFilter, setOrganismFilter] = useState<'all' | 'active' | 'linked' | 'inactive'>('all');
  const [organismoDialogOpen, setOrganismoDialogOpen] = useState(false);
  const [organismoRecrutementForm, setOrganismoRecrutementForm] = useState<FormularioOrganismo>(crearFormularioOrganismoVacio);
  const [organismoRecrutementSeleccionado, setOrganismoRecrutementSeleccionado] = useState<OrganismoRecrutement | null>(null);
  const [modoEdicionOrganismo, setModoEdicionOrganismo] = useState(false);
  const [modoVisualizacionOrganismo, setModoVisualizacionOrganismo] = useState(false);

  useEffect(() => {
    if (isPublicAccess && mainView !== 'timesheets') {
      setMainView('timesheets');
    }
  }, [isPublicAccess, mainView]);

  useEffect(() => {
    if (!isPublicAccess || typeof window === 'undefined') {
      return;
    }

    const claveDesdeUrl = normalizarClaveAcceso(new URLSearchParams(window.location.search).get('clave') || '');
    if (!claveDesdeUrl) {
      return;
    }

    setPublicAccessCodeInput(claveDesdeUrl);
    setPublicAccessSessionKey(claveDesdeUrl);
  }, [isPublicAccess]);
  
  // ✅ NUEVO: Estados para el diálogo de edición
  const [dialogEdicionOpen, setDialogEdicionOpen] = useState(false);
  const [candidatoParaEditar, setCandidatoParaEditar] = useState<Candidate | null>(null);

  // ✅ LISTA CORRECTA DE DEPARTAMENTOS CON IDs NUMÉRICOS (coinciden con departamentosStorage.ts)
  const departamentosDisponibles = [
    { id: '1', nombre: t('nav.warehouse'), icono: '📦', color: '#1a4d7a', codigo: 'ENTREPOT' },
    { id: '7', nombre: t('nav.transport'), icono: '🚚', color: '#2d9561', codigo: 'TRANSPORT' },
    { id: '2', nombre: t('nav.digitalID'), icono: '🏪', color: '#FF9800', codigo: 'COMPTOIR' },
    { id: '3', nombre: t('common.cuisine'), icono: '🍳', color: '#E91E63', codigo: 'CUISINE' },
    { id: '4', nombre: t('nav.liaison'), icono: '🤝', color: '#9C27B0', codigo: 'LIAISON' },
    { id: '8', nombre: t('recruitmentPublic.volunteers'), icono: '👥', color: '#4CAF50', codigo: 'BENEVOLES' },
  ];

  const resolveIntlLocale = useCallback((language: string) => {
    switch (language) {
      case 'en':
        return 'en-US';
      case 'es':
        return 'es-ES';
      case 'ar':
        return 'ar';
      default:
        return 'fr-CA';
    }
  }, []);

  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'fr';

  const formatLocalizedDate = useCallback((value: string, options?: Intl.DateTimeFormatOptions) => {
    if (!value) {
      return '';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleDateString(resolveIntlLocale(currentLanguage), options);
  }, [currentLanguage, resolveIntlLocale]);

  const getCandidateStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return t('recruitmentInternal.statuses.pending');
      case 'reviewed':
        return t('recruitmentInternal.statuses.reviewed');
      case 'interview':
        return t('recruitmentInternal.statuses.interview');
      case 'accepted':
        return t('recruitmentInternal.statuses.accepted');
      case 'rejected':
        return t('recruitmentInternal.statuses.rejected');
      default:
        return status;
    }
  }, [t]);

  const getLocalizedRecruitmentMockValue = useCallback((
    value: string,
    scope: 'positions' | 'availability' | 'experience'
  ) => {
    if (!value) {
      return value;
    }

    const scopeMaps = {
      positions: RECRUITMENT_MOCK_POSITION_KEYS,
      availability: RECRUITMENT_MOCK_AVAILABILITY_KEYS,
      experience: RECRUITMENT_MOCK_EXPERIENCE_KEYS,
    };

    const translationKey = scopeMaps[scope][value.trim()];
    return translationKey ? t(`recruitmentInternal.mockData.${scope}.${translationKey}`) : value;
  }, [t]);

  const getLocalizedCandidatePosition = useCallback(
    (value: string) => getLocalizedRecruitmentMockValue(value, 'positions'),
    [getLocalizedRecruitmentMockValue]
  );

  const getLocalizedCandidateAvailability = useCallback(
    (value: string) => getLocalizedRecruitmentMockValue(value, 'availability'),
    [getLocalizedRecruitmentMockValue]
  );

  const getLocalizedCandidateExperience = useCallback(
    (value: string) => getLocalizedRecruitmentMockValue(value, 'experience'),
    [getLocalizedRecruitmentMockValue]
  );

  const resolveDepartmentForCandidate = (candidate: Candidate) => {
    const positionLower = candidate.position.toLowerCase();

    if (positionLower.includes('entrepôt') || positionLower.includes('entrepo') || positionLower.includes('warehouse')) {
      return departamentosDisponibles.find(departamento => departamento.id === '1') || departamentosDisponibles[0];
    }

    if (positionLower.includes('chauffeur') || positionLower.includes('driver') || positionLower.includes('transport')) {
      return departamentosDisponibles.find(departamento => departamento.id === '7') || departamentosDisponibles[0];
    }

    if (positionLower.includes('comptoir') || positionLower.includes('counter')) {
      return departamentosDisponibles.find(departamento => departamento.id === '2') || departamentosDisponibles[0];
    }

    if (positionLower.includes('cuisine') || positionLower.includes('kitchen')) {
      return departamentosDisponibles.find(departamento => departamento.id === '3') || departamentosDisponibles[0];
    }

    if (positionLower.includes('liaison')) {
      return departamentosDisponibles.find(departamento => departamento.id === '4') || departamentosDisponibles[0];
    }

    return departamentosDisponibles.find(departamento => departamento.id === '8') || departamentosDisponibles[0];
  };

  // ✅ Candidatos desde localStorage (ya no mock estáticos)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  // ✅ Cargar candidatos al montar el componente
  useEffect(() => {
    const candidatosGuardados = obtenerCandidatos();
    setCandidates(candidatosGuardados);
    console.log('✅ Candidatos cargados desde localStorage:', candidatosGuardados.length);
  }, []);

  const cargarOrganismosAcreditados = useCallback(() => {
    const organismosDisponibles = obtenerOrganismosRecrutement();
    setOrganismosAcreditados(organismosDisponibles);
  }, []);

  useEffect(() => {
    cargarOrganismosAcreditados();

    const handleOrganismosChanged = () => {
      cargarOrganismosAcreditados();
    };

    window.addEventListener(RECRUTEMENT_ORGANISMES_UPDATED_EVENT, handleOrganismosChanged);
    window.addEventListener('storage', handleOrganismosChanged);

    return () => {
      window.removeEventListener(RECRUTEMENT_ORGANISMES_UPDATED_EVENT, handleOrganismosChanged);
      window.removeEventListener('storage', handleOrganismosChanged);
    };
  }, [cargarOrganismosAcreditados]);

  const publicAccessOrganismMatch = isPublicAccess && publicAccessSessionKey
    ? organismosAcreditados.find(
        (organismo) => normalizarClaveAcceso(organismo.claveAcceso || '') === publicAccessSessionKey
      ) || null
    : organismosAcreditados.find(
        (organismo) => organismo.activo && isFoodBankOrganism(organismo)
      ) || null;

  const publicAccessOrganism = publicAccessOrganismMatch?.activo ? publicAccessOrganismMatch : null;
  const publicAccessOrganismId = publicAccessOrganism?.id || '';

  const candidateMatchesPublicAccess = useCallback((candidate: Candidate) => {
    if (!isPublicAccess) {
      return true;
    }

    if (!publicAccessOrganismId) {
      return false;
    }

    return (candidate.organismosAcreditadosIds || []).includes(publicAccessOrganismId);
  }, [isPublicAccess, publicAccessOrganismId]);

  const handleAuthenticatePublicAccess = useCallback(() => {
    const claveNormalizada = normalizarClaveAcceso(publicAccessCodeInput);

    if (!claveNormalizada) {
      const message = 'Veuillez saisir la clé d\'accès de votre organisme.';
      setPublicAccessAuthError(message);
      toast.error(message);
      return;
    }

    const organismoEncontrado = organismosAcreditados.find(
      (organismo) => normalizarClaveAcceso(organismo.claveAcceso || '') === claveNormalizada
    );

    if (!organismoEncontrado) {
      const message = 'Clé d\'accès invalide. Vérifiez la clé transmise par le module Organismes.';
      setPublicAccessAuthError(message);
      toast.error(message);
      return;
    }

    if (!organismoEncontrado.activo) {
      const message = 'Cet organisme est actuellement inactif. L\'accès à la feuille de temps est suspendu.';
      setPublicAccessAuthError(message);
      toast.error(message);
      return;
    }

    setPublicAccessSessionKey(claveNormalizada);
    setPublicAccessAuthError('');

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('clave', claveNormalizada);
      window.history.replaceState({}, '', url.toString());
    }

    toast.success(`Feuille de temps ouverte pour ${organismoEncontrado.nombre}.`);
  }, [organismosAcreditados, publicAccessCodeInput]);

  useEffect(() => {
    const candidatosConDepartamento = candidates.filter(candidate => {
      if (!candidateMatchesPublicAccess(candidate)) {
        return false;
      }

      if ((candidate.departamentoIds || []).length === 0) {
        return false;
      }

      return timesheetDepartmentFilter === 'all'
        ? true
        : (candidate.departamentoIds || []).includes(timesheetDepartmentFilter);
    });

    if (candidatosConDepartamento.length === 0) {
      if (selectedTimesheetCandidateId) {
        setSelectedTimesheetCandidateId('');
      }
      return;
    }

    const existeSeleccion = candidatosConDepartamento.some(candidate => String(candidate.id) === selectedTimesheetCandidateId);

    if (!existeSeleccion) {
      setSelectedTimesheetCandidateId(String(candidatosConDepartamento[0].id));
    }
  }, [candidateMatchesPublicAccess, candidates, selectedTimesheetCandidateId, timesheetDepartmentFilter]);

  const candidatosFeuilleTemps = candidates
    .filter(candidate => {
      if (!candidateMatchesPublicAccess(candidate)) {
        return false;
      }

      if ((candidate.departamentoIds || []).length === 0) {
        return false;
      }

      return timesheetDepartmentFilter === 'all'
        ? true
        : (candidate.departamentoIds || []).includes(timesheetDepartmentFilter);
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'fr'));

  const candidatosFeuilleTempsFiltrados = candidatosFeuilleTemps.filter(candidate => {
    const searchValue = timesheetCandidateSearch.trim().toLowerCase();
    if (!searchValue) {
      return true;
    }

    return [candidate.name, candidate.email, candidate.phone]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(searchValue));
  });

  useEffect(() => {
    if (candidatosFeuilleTempsFiltrados.length === 0) {
      if (selectedTimesheetCandidateId) {
        setSelectedTimesheetCandidateId('');
      }
      return;
    }

    const existeSeleccionFiltrada = candidatosFeuilleTempsFiltrados.some(
      candidate => String(candidate.id) === selectedTimesheetCandidateId
    );

    if (!existeSeleccionFiltrada) {
      setSelectedTimesheetCandidateId(String(candidatosFeuilleTempsFiltrados[0].id));
    }
  }, [candidatosFeuilleTempsFiltrados, selectedTimesheetCandidateId]);

  const candidatoFeuilleTempsSeleccionado = candidatosFeuilleTempsFiltrados.find(
    candidate => String(candidate.id) === selectedTimesheetCandidateId
  ) || null;

  const departamentosFeuilleTemps = departamentosDisponibles.filter(departamento =>
    (candidatoFeuilleTempsSeleccionado?.departamentoIds || []).includes(departamento.id)
  );

  const feuillesTempsGlobalesFiltradas = candidatosFeuilleTemps.flatMap(candidate =>
    (candidate.feuillesTemps || [])
      .filter(timesheet => {
        const matchesDepartment = timesheetDepartmentFilter === 'all'
          ? true
          : timesheet.departamentoId === timesheetDepartmentFilter;
        const matchesMonth = timesheetMonthFilter
          ? timesheet.date.startsWith(timesheetMonthFilter)
          : true;

        return matchesDepartment && matchesMonth;
      })
      .map(timesheet => ({
        ...timesheet,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email
      }))
  );
  const timesheetMonthOptions = Array.from(
    new Set(
      candidates
        .filter(candidate => candidateMatchesPublicAccess(candidate))
        .flatMap(candidate =>
        (candidate.feuillesTemps || []).map(timesheet => timesheet.date.slice(0, 7))
      )
    )
  ).sort((left, right) => right.localeCompare(left));

  const feuillesTempsSeleccionadas = candidatoFeuilleTempsSeleccionado
    ? feuillesTempsGlobalesFiltradas.filter(timesheet => timesheet.candidateId === candidatoFeuilleTempsSeleccionado.id)
    : [];
  const feuillesTempsActivasSeleccionadas = feuillesTempsSeleccionadas.filter(timesheet => timesheet.enCours);
  const feuillesTempsHistorialSeleccionadas = feuillesTempsSeleccionadas.filter(timesheet => !timesheet.enCours);
  const totalHeuresFeuilleTempsSeleccionada = feuillesTempsSeleccionadas.reduce(
    (sum, timesheet) => sum + timesheet.duree,
    0
  );
  const heuresMoisFeuilleTempsSeleccionada = timesheetMonthFilter
    ? totalHeuresFeuilleTempsSeleccionada
    : calculateCurrentMonthHours(feuillesTempsSeleccionadas);
  const totalEntreesFeuilleTemps = feuillesTempsGlobalesFiltradas.length;
  const totalHeuresFeuilleTemps = feuillesTempsGlobalesFiltradas.reduce((sum, timesheet) => sum + timesheet.duree, 0);
  const heuresAccumuleesParDepartement = departamentosDisponibles
    .map(department => {
      const heures = feuillesTempsGlobalesFiltradas
        .filter(timesheet => timesheet.departamentoId === department.id)
        .reduce((sum, timesheet) => sum + timesheet.duree, 0);

      return {
        departement: department.nombre,
        heures: Number(heures.toFixed(2)),
        color: department.color
      };
    })
    .filter(item => item.heures > 0);

  useEffect(() => {
    if (!candidatoFeuilleTempsSeleccionado) {
      setTimesheetForm(createInitialTimesheetForm());
      setEditingTimesheetId(null);
      return;
    }

    setTimesheetForm(createInitialTimesheetForm(candidatoFeuilleTempsSeleccionado));
    setEditingTimesheetId(null);
  }, [candidatoFeuilleTempsSeleccionado?.id]);

  // Estadísticas
  const stats = {
    total: candidates.length,
    pending: candidates.filter(c => c.status === 'pending').length,
    interview: candidates.filter(c => c.status === 'interview').length,
    accepted: candidates.filter(c => c.status === 'accepted').length
  };
  const candidatsAssignes = candidates.filter(candidate => (candidate.departamentoIds || []).length > 0);
  const candidatsAvecFeuilles = candidates.filter(candidate => (candidate.feuillesTemps || []).length > 0);
  const candidatsSansAssignation = candidates.filter(candidate => !(candidate.departamentoIds || []).length);
  const recentCandidates = candidates
    .slice()
    .sort((left, right) => new Date(right.applicationDate).getTime() - new Date(left.applicationDate).getTime())
    .slice(0, 5);
  const reportVolunteerOptions = Array.from(
    new Map(
      feuillesTempsGlobalesFiltradas.map(timesheet => [
        String(timesheet.candidateId),
        {
          id: String(timesheet.candidateId),
          nom: timesheet.candidateName,
          email: timesheet.candidateEmail
        }
      ])
    ).values()
  ).sort((left, right) => left.nom.localeCompare(right.nom, 'fr'));
  const reportDepartmentOptions = departamentosDisponibles.filter(department =>
    feuillesTempsGlobalesFiltradas.some(timesheet => timesheet.departamentoId === department.id)
  );
  const reportTimesheets = feuillesTempsGlobalesFiltradas.filter(timesheet => {
    const matchesYear = reportYearFilter === 'all' ? true : timesheet.date.startsWith(reportYearFilter);
    const matchesStartDate = reportStartDate ? timesheet.date >= reportStartDate : true;
    const matchesEndDate = reportEndDate ? timesheet.date <= reportEndDate : true;
    const matchesVolunteer = reportVolunteerFilter === 'all'
      ? true
      : String(timesheet.candidateId) === reportVolunteerFilter;
    const matchesDepartment = reportDepartmentFilter === 'all'
      ? true
      : timesheet.departamentoId === reportDepartmentFilter;

    return matchesYear && matchesStartDate && matchesEndDate && matchesVolunteer && matchesDepartment;
  });
  const reportYearStats = Array.from(
    reportTimesheets.reduce((map, timesheet) => {
      const year = /^\d{4}/.test(timesheet.date) ? timesheet.date.slice(0, 4) : 'Sans année';
      const current = map.get(year) || {
        annee: year,
        heures: 0,
        feuilles: 0,
        benevoles: new Set<string>(),
        departements: new Set<string>()
      };

      current.heures += timesheet.duree;
      current.feuilles += 1;
      current.benevoles.add(timesheet.candidateName);
      current.departements.add(timesheet.departement);
      map.set(year, current);

      return map;
    }, new Map<string, {
      annee: string;
      heures: number;
      feuilles: number;
      benevoles: Set<string>;
      departements: Set<string>;
    }>()).values()
  )
    .map(item => ({
      annee: item.annee,
      heures: item.heures,
      feuilles: item.feuilles,
      benevoles: item.benevoles.size,
      departements: item.departements.size
    }))
    .sort((left, right) => right.annee.localeCompare(left.annee));
  const reportYearOptions = Array.from(
    new Set(
      feuillesTempsGlobalesFiltradas
        .filter(timesheet => /^\d{4}/.test(timesheet.date))
        .map(timesheet => timesheet.date.slice(0, 4))
    )
  ).sort((left, right) => right.localeCompare(left));
  const recentTimesheetEntries = reportTimesheets
    .slice()
    .sort((left, right) => `${right.date}-${right.heureDebut}`.localeCompare(`${left.date}-${left.heureDebut}`))
    .slice(0, 6);
  const reportDepartmentStats = departamentosDisponibles
    .map(department => {
      const feuilles = reportTimesheets.filter(timesheet => timesheet.departamentoId === department.id);
      const heures = feuilles.reduce((sum, timesheet) => sum + timesheet.duree, 0);
      const benevoles = new Set(feuilles.map(timesheet => String(timesheet.candidateId))).size;

      return {
        id: department.id,
        nom: department.nombre,
        icono: department.icono,
        color: department.color,
        benevoles,
        feuilles: feuilles.length,
        heures
      };
    })
    .filter(item => item.benevoles > 0 || item.feuilles > 0 || item.heures > 0)
    .sort((left, right) => {
      if (right.heures !== left.heures) {
        return right.heures - left.heures;
      }

      return right.benevoles - left.benevoles;
    });
  const reportVolunteerStats = Array.from(
    reportTimesheets.reduce((map, timesheet) => {
      const key = String(timesheet.candidateId);
      const current = map.get(key) || {
        id: key,
        nom: timesheet.candidateName,
        email: timesheet.candidateEmail,
        heures: 0,
        feuilles: 0,
        departements: new Set<string>()
      };

      current.heures += timesheet.duree;
      current.feuilles += 1;
      current.departements.add(timesheet.departement);
      map.set(key, current);

      return map;
    }, new Map<string, {
      id: string;
      nom: string;
      email: string;
      heures: number;
      feuilles: number;
      departements: Set<string>;
    }>()).values()
  )
    .map(item => ({
      id: item.id,
      nom: item.nom,
      email: item.email,
      heures: item.heures,
      feuilles: item.feuilles,
      departements: item.departements.size
    }))
    .sort((left, right) => {
      if (right.heures !== left.heures) {
        return right.heures - left.heures;
      }

      return left.nom.localeCompare(right.nom);
    });
  const reportHeuresTotales = reportTimesheets.reduce((sum, timesheet) => sum + timesheet.duree, 0);
  const reportEntreesTotales = reportTimesheets.length;
  const reportVolunteerActifs = reportVolunteerStats.length;
  const reportDepartmentChartData = reportDepartmentStats.slice(0, 6).map(item => ({
    nom: item.nom,
    heures: Number(item.heures.toFixed(2))
  }));
  const reportVolunteerChartData = reportVolunteerStats.slice(0, 6).map(item => ({
    nom: item.nom.split(' ').slice(0, 2).join(' '),
    heures: Number(item.heures.toFixed(2))
  }));
  const organismosAcreditadosPorId = candidates.reduce<Record<string, number>>((acumulado, candidate) => {
    (candidate.organismosAcreditadosIds || []).forEach((organismoId) => {
      acumulado[organismoId] = (acumulado[organismoId] || 0) + 1;
    });

    return acumulado;
  }, {});
  const organismosAcreditadosActivos = organismosAcreditados.filter((organismo) => organismo.activo);
  const organismosAcreditadosEnriquecidos = organismosAcreditados
    .map((organismo) => ({
      ...organismo,
      benevolesAsignados: organismosAcreditadosPorId[organismo.id] || 0,
    }))
    .sort((left, right) => {
      if (right.benevolesAsignados !== left.benevolesAsignados) {
        return right.benevolesAsignados - left.benevolesAsignados;
      }

      if (left.activo !== right.activo) {
        return left.activo ? -1 : 1;
      }

      return left.nombre.localeCompare(right.nombre, 'fr');
    });
  const organismosAcreditadosFiltrados = organismosAcreditadosEnriquecidos.filter((organismo) => {
    const searchValue = organismSearchTerm.trim().toLowerCase();
    const coincideBusqueda = !searchValue || [
      organismo.nombre,
      organismo.tipo,
      organismo.responsable,
      organismo.email,
      organismo.quartier,
      organismo.zona,
    ]
      .filter(Boolean)
      .some((valor) => String(valor).toLowerCase().includes(searchValue));

    if (!coincideBusqueda) {
      return false;
    }

    if (organismFilter === 'active') {
      return organismo.activo;
    }

    if (organismFilter === 'inactive') {
      return !organismo.activo;
    }

    if (organismFilter === 'linked') {
      return organismo.benevolesAsignados > 0;
    }

    return true;
  });
  const organismosAcreditadosInactivos = organismosAcreditados.length - organismosAcreditadosActivos.length;
  const organismosAcreditadosSinBenevoles = organismosAcreditadosEnriquecidos.filter((organismo) => organismo.benevolesAsignados === 0).length;
  const organismosAcreditadosSinCoordonnees = organismosAcreditadosEnriquecidos.filter(
    (organismo) => !String(organismo.email || '').trim() && !String(organismo.telefono || '').trim()
  ).length;
  const organismosAcreditadosConBenevoles = organismosAcreditados
    .map((organismo) => {
      const benevoles = candidates.filter(candidate =>
        (candidate.organismosAcreditadosIds || []).includes(organismo.id)
      ).length;

      return {
        id: organismo.id,
        nombre: organismo.nombre,
        tipo: organismo.tipo,
        benevoles,
      };
    })
    .filter((organismo) => organismo.benevoles > 0)
    .sort((left, right) => {
      if (right.benevoles !== left.benevoles) {
        return right.benevoles - left.benevoles;
      }

      return left.nombre.localeCompare(right.nombre, 'fr');
    });
  const totalAssignationsOrganismosAcreditados = candidates.reduce(
    (sum, candidate) => sum + (candidate.organismosAcreditadosIds?.length || 0),
    0
  );
  const buildOrganismRemoteTimesheetUrl = useCallback((claveAcceso: string) => {
    const normalizedKey = normalizarClaveAcceso(claveAcceso);
    const params = new URLSearchParams();
    params.set('page', 'recrutement-public');

    if (normalizedKey) {
      params.set('clave', normalizedKey);
    }

    const route = `?${params.toString()}`;

    if (typeof window === 'undefined') {
      return route;
    }

    return `${window.location.origin}${window.location.pathname}${route}`;
  }, []);

  const reportExportRows = [
    ...reportYearStats.map(item => ({
      axe: 'Année',
      libelle: item.annee,
      heures: item.heures,
      entrees: item.feuilles,
      benevoles: item.benevoles,
      departements: item.departements
    })),
    ...reportDepartmentStats.map(item => ({
      axe: 'Département',
      libelle: item.nom,
      heures: item.heures,
      entrees: item.feuilles,
      benevoles: item.benevoles,
      departements: 1
    })),
    ...reportVolunteerStats.map(item => ({
      axe: 'Bénévole',
      libelle: item.nom,
      heures: item.heures,
      entrees: item.feuilles,
      benevoles: 1,
      departements: item.departements
    })),
    ...organismosAcreditadosConBenevoles.map(item => ({
      axe: 'Organisme accrédité',
      libelle: item.nombre,
      heures: 0,
      entrees: 0,
      benevoles: item.benevoles,
      departements: 0
    }))
  ];

  useEffect(() => {
    if (reportYearFilter !== 'all' && !reportYearOptions.includes(reportYearFilter)) {
      setReportYearFilter('all');
    }
  }, [reportYearFilter, reportYearOptions]);

  useEffect(() => {
    if (reportVolunteerFilter !== 'all' && !reportVolunteerOptions.some(option => option.id === reportVolunteerFilter)) {
      setReportVolunteerFilter('all');
    }
  }, [reportVolunteerFilter, reportVolunteerOptions]);

  useEffect(() => {
    if (reportDepartmentFilter !== 'all' && !reportDepartmentOptions.some(option => option.id === reportDepartmentFilter)) {
      setReportDepartmentFilter('all');
    }
  }, [reportDepartmentFilter, reportDepartmentOptions]);

  const persistCandidateChanges = (candidateId: number, changes: Partial<Candidate>) => {
    const candidatoActualizado = actualizarCandidato(candidateId, changes);

    if (!candidatoActualizado) {
      return null;
    }

    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? candidatoActualizado : c
    ));

    if (candidatoParaPerfil?.id === candidateId) {
      setCandidatoParaPerfil(candidatoActualizado);
    }

    if (candidatoParaEditar?.id === candidateId) {
      setCandidatoParaEditar(candidatoActualizado);
      setFormularioCandidato(mapCandidateToContactForm(candidatoActualizado));
      setFotoPreview(candidatoActualizado.foto || null);
    }

    if (candidatoParaAssignar?.id === candidateId) {
      setCandidatoParaAssignar(candidatoActualizado);
    }

    return candidatoActualizado;
  };

  const getTimesheetActorName = () => {
    if (isPublicAccess) {
      return t('recruitmentPublic.publicAccessActor');
    }

    const usuario = obtenerUsuarioSesion();
    if (!usuario) {
      return 'Utilisateur interne';
    }

    return [usuario.nombre?.trim(), usuario.apellido?.trim()].filter(Boolean).join(' ') || usuario.username || usuario.email || 'Utilisateur interne';
  };

  const obtenerOrganismosAcreditadosAsignados = useCallback((candidate: Candidate) => {
    const idsAsignados = candidate.organismosAcreditadosIds || [];

    return organismosAcreditados.filter((organismo) => idsAsignados.includes(organismo.id));
  }, [organismosAcreditados]);

  const resetRecruitmentOrganismForm = () => {
    setOrganismoDialogOpen(false);
    setModoEdicionOrganismo(false);
    setModoVisualizacionOrganismo(false);
    setOrganismoRecrutementSeleccionado(null);
    setOrganismoRecrutementForm({
      ...crearFormularioOrganismoVacio(),
      clasificacionOrganismo: 'regular',
      regular: true,
    });
  };

  const handleOpenCreateRecruitmentOrganism = () => {
    setMainView('organisms');
    setModoEdicionOrganismo(false);
    setModoVisualizacionOrganismo(false);
    setOrganismoRecrutementSeleccionado(null);
    setOrganismoRecrutementForm({
      ...crearFormularioOrganismoVacio(),
      clasificacionOrganismo: 'regular',
      regular: true,
    });
    setOrganismoDialogOpen(true);
  };

  const handleViewRecruitmentOrganismProfile = (organismo: OrganismoRecrutement) => {
    setMainView('organisms');
    setModoEdicionOrganismo(false);
    setModoVisualizacionOrganismo(true);
    setOrganismoRecrutementSeleccionado(organismo);
    setOrganismoRecrutementForm({
      ...convertirOrganismoAFormulario(organismo),
      clasificacionOrganismo: 'regular',
      regular: true,
    });
    setOrganismoDialogOpen(true);
  };

  const handleEditRecruitmentOrganism = (organismo: OrganismoRecrutement) => {
    setMainView('organisms');
    setModoEdicionOrganismo(true);
    setModoVisualizacionOrganismo(false);
    setOrganismoRecrutementSeleccionado(organismo);
    setOrganismoRecrutementForm({
      ...convertirOrganismoAFormulario(organismo),
      clasificacionOrganismo: 'regular',
      regular: true,
    });
    setOrganismoDialogOpen(true);
  };

  const handleSaveRecruitmentOrganism = () => {
    const errorValidacion = validarFormularioOrganismo(organismoRecrutementForm);
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }

    guardarOrganismoRecrutement({
      ...construirPayloadOrganismo({
        ...organismoRecrutementForm,
        clasificacionOrganismo: 'regular',
        regular: true,
      }),
      id: organismoRecrutementSeleccionado?.id,
    });

    toast.success(
      organismoRecrutementSeleccionado?.id
        ? 'Organisme de recrutement mis à jour'
        : 'Organisme de recrutement ajouté'
    );
    resetRecruitmentOrganismForm();
  };

  const handleDeleteRecruitmentOrganism = (organismo: OrganismoRecrutement) => {
    eliminarOrganismoRecrutement(organismo.id);

    const updatedCandidates = candidates.map((candidate) => ({
      ...candidate,
      organismosAcreditadosIds: (candidate.organismosAcreditadosIds || []).filter((id) => id !== organismo.id)
    }));

    setCandidates(updatedCandidates);
    guardarCandidatos(updatedCandidates);

    if (candidatoParaPerfil) {
      const nextCandidate = updatedCandidates.find((candidate) => candidate.id === candidatoParaPerfil.id) || null;
      setCandidatoParaPerfil(nextCandidate);
    }

    if (candidatoParaEditar) {
      const nextCandidate = updatedCandidates.find((candidate) => candidate.id === candidatoParaEditar.id) || null;
      setCandidatoParaEditar(nextCandidate);
    }

    if (candidatoParaAssignar) {
      const nextCandidate = updatedCandidates.find((candidate) => candidate.id === candidatoParaAssignar.id) || null;
      setCandidatoParaAssignar(nextCandidate);
    }

    if (organismoRecrutementSeleccionado?.id === organismo.id) {
      resetRecruitmentOrganismForm();
    }

    toast.success('Organisme de recrutement supprimé');
  };

  const alternarOrganismoAcreditadoSeleccionado = (organismoId: string) => {
    setOrganismosAcreditadosSeleccionados((prev) => (
      prev.includes(organismoId)
        ? prev.filter((id) => id !== organismoId)
        : [...prev, organismoId]
    ));
  };

  const handleCopyRemoteTimesheetLinkForOrganism = async (organismo: OrganismoRecrutement) => {
    const organismoKey = normalizarClaveAcceso(organismo.claveAcceso || '');
    const allowDirectAccess = isFoodBankOrganism(organismo);

    if (!allowDirectAccess && !organismoKey) {
      toast.error('Cet organisme ne dispose pas encore de clé d\'accès.');
      return;
    }

    const personalizedUrl = buildOrganismRemoteTimesheetUrl(allowDirectAccess ? '' : organismoKey);

    try {
      await navigator.clipboard.writeText(personalizedUrl);
      toast.success('Lien personnalisé copié', {
        description: `Le lien distant de ${organismo.nombre} inclut déjà sa clé d'accès.`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Erreur lors de la copie du lien personnalisé de feuille de temps:', error);
      toast.error('Impossible de copier le lien personnalisé de la feuille de temps');
    }
  };

  const handleOpenRemoteTimesheetForOrganism = (organismo: OrganismoRecrutement) => {
    const organismoKey = normalizarClaveAcceso(organismo.claveAcceso || '');
    const allowDirectAccess = isFoodBankOrganism(organismo);

    if (!allowDirectAccess && !organismoKey) {
      toast.error('Cet organisme ne dispose pas encore de clé d\'accès.');
      return;
    }

    window.open(buildOrganismRemoteTimesheetUrl(allowDirectAccess ? '' : organismoKey), '_blank', 'noopener,noreferrer');
  };

  const handleResetRemoteAccessKeyForOrganism = () => {
    if (!organismoRecrutementSeleccionado?.id) {
      return;
    }

    try {
      const organismoActualizado = reinicializarClaveAccesoOrganismoRecrutement(organismoRecrutementSeleccionado.id);

      if (!organismoActualizado) {
        toast.error('Impossible de reinitialiser la cle d\'acces.');
        return;
      }

      setOrganismoRecrutementSeleccionado(organismoActualizado);
      toast.success('Cle d\'acces reinitialisee', {
        description: 'Les anciens liens distants devront etre remplaces par le nouveau lien personnalise.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la reinitialisation de la cle d\'acces');
    }
  };

  const selectedRecruitmentOrganismAccessKey = normalizarClaveAcceso(organismoRecrutementSeleccionado?.claveAcceso || '');
  const selectedRecruitmentOrganismAllowsDirectAccess = isFoodBankOrganism(organismoRecrutementSeleccionado);
  const selectedRecruitmentOrganismRemoteUrl = selectedRecruitmentOrganismAllowsDirectAccess
    ? buildOrganismRemoteTimesheetUrl('')
    : selectedRecruitmentOrganismAccessKey
      ? buildOrganismRemoteTimesheetUrl(selectedRecruitmentOrganismAccessKey)
      : '';

  const buildTimesheetCorrectionHistory = (
    originalTimesheet: FeuilleTiempoCandidato,
    nextTimesheet: FeuilleTiempoCandidato
  ) => {
    const changes: string[] = [];

    if (originalTimesheet.heureDebut !== nextTimesheet.heureDebut) {
      changes.push(`Arrivée: ${originalTimesheet.heureDebut || '—'} -> ${nextTimesheet.heureDebut || '—'}`);
    }

    if ((originalTimesheet.heureFin || '') !== (nextTimesheet.heureFin || '')) {
      changes.push(`Départ: ${originalTimesheet.heureFin || '—'} -> ${nextTimesheet.heureFin || '—'}`);
    }

    if (originalTimesheet.date !== nextTimesheet.date) {
      changes.push(`Date: ${originalTimesheet.date} -> ${nextTimesheet.date}`);
    }

    if (originalTimesheet.departement !== nextTimesheet.departement) {
      changes.push(`Département: ${originalTimesheet.departement} -> ${nextTimesheet.departement}`);
    }

    if (changes.length === 0) {
      return originalTimesheet.correctionHistory || [];
    }

    const nextEntry: HistorialCorreccionFeuilleTiempo = {
      id: `${nextTimesheet.id}-${Date.now()}`,
      actor: getTimesheetActorName(),
      timestamp: getCurrentTimestamp(),
      source: isPublicAccess ? 'public' : 'internal',
      changes
    };

    return [nextEntry, ...(originalTimesheet.correctionHistory || [])];
  };

  const tiposPermitidos: TipoContacto[] = ['benevole'];

  const getTipoConfig = (tipo: TipoContacto) => ({
    color: '#9CA3AF',
    icon: Users,
    label: tipo === 'benevole' ? 'Bénévole / Professionnel administratif' : tipo,
    bgColor: '#F3F4F6'
  });

  const updateDisponibilidad = (index: number, field: 'am' | 'pm', value: boolean) => {
    setFormularioCandidato(prev => ({
      ...prev,
      disponibilidades: prev.disponibilidades.map((disponibilidad, disponibilidadIndex) =>
        disponibilidadIndex === index
          ? { ...disponibilidad, [field]: value }
          : disponibilidad
      )
    }));
  };

  const resetCandidateForm = () => {
    setFormularioCandidato(createInitialCandidateContactForm());
    setFotoPreview(null);
  };

  const handleCerrarFormularioCandidato = () => {
    setDialogNuevoOpen(false);
    setDialogEdicionOpen(false);
    setCandidatoParaEditar(null);
    resetCandidateForm();
  };

  const handleAbrirNuevoCandidato = () => {
    setCandidatoParaEditar(null);
    resetCandidateForm();
    setDialogEdicionOpen(false);
    setDialogNuevoOpen(true);
  };

  const handleFotoCandidatoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      const optimized = await optimizarImagenCandidato(base64);
      setFotoPreview(optimized || null);
      setFormularioCandidato(prev => ({
        ...prev,
        foto: optimized
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const resetAssignationDialog = () => {
    setDialogAssignerOpen(false);
    setCandidatoParaAssignar(null);
    setDepartamentoSeleccionado('');
    setDepartamentoOrigenSeleccionado('');
    setOrganismosAcreditadosSeleccionados([]);
    setAssignationMode('assign');
  };

  const resetTimesheetForm = (candidate?: Candidate) => {
    setTimesheetForm(createInitialTimesheetForm(candidate));
    setEditingTimesheetId(null);
  };

  const abrirDialogoAssignacion = (candidate: Candidate, mode: AssignationMode = 'assign') => {
    const departamentosActuales = candidate.departamentoIds || [];

    setCandidatoParaAssignar(candidate);
    setAssignationMode(mode);
    setDepartamentoSeleccionado('');
    setOrganismosAcreditadosSeleccionados(candidate.organismosAcreditadosIds || []);
    setDepartamentoOrigenSeleccionado(
      mode === 'modify' && departamentosActuales.length === 1 ? departamentosActuales[0] : ''
    );
    setDialogAssignerOpen(true);
  };

  const handleCrearCandidatura = async () => {
    const candidateName = buildFullName(formularioCandidato.nombre, formularioCandidato.apellido);
    let referenciasCreadas: string[] = [];

    if (!candidateName) {
      toast.error('❌ Le nom est requis');
      return;
    }

    if (!formularioCandidato.email.trim()) {
      toast.error('❌ L\'email est requis');
      return;
    }

    if (!(formularioCandidato.cargo || '').trim()) {
      toast.error('❌ Le poste recherché est requis');
      return;
    }

    const emailDuplicado = candidates.some(candidate =>
      candidate.email.trim().toLowerCase() === formularioCandidato.email.trim().toLowerCase()
    );

    if (emailDuplicado) {
      toast.error('❌ Une candidature avec cet email existe déjà');
      return;
    }

    try {
      const fotoOptimizada = await optimizarImagenCandidato(formularioCandidato.foto || '');
      const resultadoDocumentos = await normalizarDocumentosCandidatoParaPersistencia(formularioCandidato.documents);
      referenciasCreadas = resultadoDocumentos.referenciasCreadas;

      const nuevoCandidato = agregarCandidato(
        mapContactFormToCandidate(
          {
            ...formularioCandidato,
            foto: fotoOptimizada,
            documents: resultadoDocumentos.documentos || [],
          },
          'pending'
        )
      );

      setCandidates(prev => [nuevoCandidato, ...prev]);
      setSearchTerm('');
      setFilterStatus('all');
      handleCerrarFormularioCandidato();

      toast.success('✅ Nouvelle candidature créée avec succès', {
        description: `${nuevoCandidato.name} a été ajouté à la liste de recrutement`,
        duration: 5000
      });
    } catch (error) {
      if (referenciasCreadas.length > 0) {
        await eliminarContenidosDocumentoCandidato(referenciasCreadas);
      }

      console.error('❌ Error al crear candidato con documentos:', error);
      toast.error('❌ Impossible d\'enregistrer la candidature avec les documents');
    }
  };

  // ✅ NUEVO: Función para abrir edición de candidato
  const handleAbrirEdicion = (candidato: Candidate) => {
    console.log('✏️ Abriendo edición de candidato:', candidato.id, candidato.name);
    setCandidatoParaEditar(candidato);
    setFormularioCandidato(mapCandidateToContactForm(candidato));
    setFotoPreview(candidato.foto || null);
    console.log('📋 Quartier cargado:', candidato.quartier || '[vacío]');
    setDialogNuevoOpen(false);
    setDialogEdicionOpen(true);
  };

  // ✅ NUEVO: Función para guardar edición con QUARTIER
  const handleGuardarEdicion = async () => {
    if (!candidatoParaEditar) return;
    const candidateName = buildFullName(formularioCandidato.nombre, formularioCandidato.apellido);
    let referenciasCreadas: string[] = [];
    
    // Validaciones
    if (!candidateName) {
      toast.error('❌ Le nom est requis');
      return;
    }
    if (!formularioCandidato.email.trim()) {
      toast.error('❌ L\'email est requis');
      return;
    }

    const emailDuplicado = candidates.some(candidate =>
      candidate.id !== candidatoParaEditar.id &&
      candidate.email.trim().toLowerCase() === formularioCandidato.email.trim().toLowerCase()
    );

    if (emailDuplicado) {
      toast.error('❌ Une candidature avec cet email existe déjà');
      return;
    }
    
    console.log('💾 Guardando candidato con datos COMPLETOS:', {
      id: candidatoParaEditar.id,
      name: candidateName,
      email: formularioCandidato.email,
      phone: formularioCandidato.telefono,
      position: formularioCandidato.cargo,
      status: candidatoParaEditar.status,
      experience: formularioCandidato.notas,
      availability: buildAvailabilityFromDisponibilidades(formularioCandidato.disponibilidades),
      adresse: formularioCandidato.direccion || '[vacío]',
      appartement: formularioCandidato.appartement || '[vacío]',
      ville: formularioCandidato.ciudad || '[vacío]',
      codePostal: formularioCandidato.codigoPostal || '[vacío]',
      quartier: formularioCandidato.quartier || '[vacío]'
    });
    
    // ✅ CRÍTICO: Actualizar candidato con TODOS los campos sin excepción
    let candidatoActualizado: Candidate | null = null;

    try {
      const fotoOptimizada = await optimizarImagenCandidato(formularioCandidato.foto || '');
      const resultadoDocumentos = await normalizarDocumentosCandidatoParaPersistencia(formularioCandidato.documents);
      referenciasCreadas = resultadoDocumentos.referenciasCreadas;

      candidatoActualizado = persistCandidateChanges(
        candidatoParaEditar.id,
        mapContactFormToCandidate(
          {
            ...formularioCandidato,
            foto: fotoOptimizada,
            documents: resultadoDocumentos.documentos || [],
          },
          candidatoParaEditar.status,
          candidatoParaEditar
        )
      );
    } catch (error) {
      if (referenciasCreadas.length > 0) {
        await eliminarContenidosDocumentoCandidato(referenciasCreadas);
      }

      console.error('❌ Error al actualizar candidato con documentos:', error);
      toast.error('❌ Impossible de mettre à jour le candidat avec les documents');
      return;
    }

    if (!candidatoActualizado && referenciasCreadas.length > 0) {
      await eliminarContenidosDocumentoCandidato(referenciasCreadas);
    }
    
    if (candidatoActualizado) {
      console.log('✅ Candidato actualizado exitosamente con TODOS LOS DATOS:', {
        id: candidatoActualizado.id,
        name: candidatoActualizado.name,
        email: candidatoActualizado.email,
        phone: candidatoActualizado.phone,
        position: candidatoActualizado.position,
        status: candidatoActualizado.status,
        experience: candidatoActualizado.experience,
        availability: candidatoActualizado.availability,
        adresse: candidatoActualizado.adresse || '[vacío]',
        appartement: candidatoActualizado.appartement || '[vacío]',
        ville: candidatoActualizado.ville || '[vacío]',
        codePostal: candidatoActualizado.codePostal || '[vacío]',
        quartier: candidatoActualizado.quartier || '[vacío]'
      });
      
      // ✅ Verificar que los datos se guardaron en localStorage
      const candidatosVerificacion = obtenerCandidatos();
      const candidatoVerificado = candidatosVerificacion.find(c => c.id === candidatoActualizado.id);
      
      if (candidatoVerificado) {
        console.log('✅ VERIFICACIÓN EXITOSA - Candidato guardado en localStorage:', {
          id: candidatoVerificado.id,
          name: candidatoVerificado.name,
          quartier: candidatoVerificado.quartier || '[vacío]',
          ville: candidatoVerificado.ville || '[vacío]',
          codePostal: candidatoVerificado.codePostal || '[vacío]'
        });
      } else {
        console.error('❌ ERROR DE VERIFICACIÓN - Candidato NO encontrado en localStorage');
      }
      
      toast.success('✅ Candidat mis à jour avec succès', {
        description: formularioCandidato.quartier 
          ? `Quartier: ${formularioCandidato.quartier} | Ville: ${formularioCandidato.ciudad}` 
          : `Informations sauvegardées`,
        duration: 5000
      });
      
      handleCerrarFormularioCandidato();
    } else {
      console.error('❌ Error al actualizar candidato en localStorage');
      toast.error('❌ Erreur lors de la mise à jour du candidat');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-[#FFC107] text-[#333333]' },
      reviewed: { color: `text-white`, bgColor: branding.primaryColor },
      interview: { color: 'bg-[#9C27B0] text-white' },
      accepted: { color: `text-white`, bgColor: branding.secondaryColor },
      rejected: { color: 'bg-[#DC3545] text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const label = getCandidateStatusLabel(status);
    if (status === 'reviewed' || status === 'accepted') {
      return (
        <Badge 
          className={config.color} 
          style={{ backgroundColor: config.bgColor }}
        >
          {label}
        </Badge>
      );
    }
    return <Badge className={config.color}>{label}</Badge>;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const numeroArchivo = String(candidate.numeroArchivo || '').toLowerCase();
    const matchesSearch = 
      candidate.name.toLowerCase().includes(normalizedSearchTerm) ||
      candidate.position.toLowerCase().includes(normalizedSearchTerm) ||
      candidate.email.toLowerCase().includes(normalizedSearchTerm) ||
      numeroArchivo.includes(normalizedSearchTerm);
    
    const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const renderTimesheetEntries = (timesheets: FeuilleTiempoCandidato[]) => {
    const sortedTimesheets = timesheets
      .slice()
      .sort((left, right) => `${right.date}-${right.heureDebut}`.localeCompare(`${left.date}-${left.heureDebut}`));
    const displayedTimesheets = isPublicAccess ? sortedTimesheets.slice(0, 6) : sortedTimesheets;

    return (
    <div className="app-dense-table-wrap overflow-x-auto">
      <table className="app-dense-table w-full">
        <thead>
          <tr
            className="border-b-2"
            style={{ borderColor: `${branding.primaryColor}20` }}
          >
            <th className={`${isPublicAccess ? 'px-3 py-2' : 'px-4 py-3'} text-left text-xs font-bold uppercase tracking-wider`} style={{ color: branding.primaryColor }}>
              Nom
            </th>
            <th className={`${isPublicAccess ? 'px-3 py-2' : 'px-4 py-3'} text-left text-xs font-bold uppercase tracking-wider`} style={{ color: branding.primaryColor }}>
              Département
            </th>
            <th className={`${isPublicAccess ? 'px-2 py-2' : 'px-4 py-3'} text-center text-xs font-bold uppercase tracking-wider`} style={{ color: branding.secondaryColor }}>
              Arrivée
            </th>
            <th className={`${isPublicAccess ? 'px-2 py-2' : 'px-4 py-3'} text-center text-xs font-bold uppercase tracking-wider`} style={{ color: '#DC3545' }}>
              Départ
            </th>
            <th className={`${isPublicAccess ? 'px-3 py-2' : 'px-4 py-3'} text-right text-xs font-bold uppercase tracking-wider`} style={{ color: branding.primaryColor }}>
              Temps total
            </th>
            <th className={`${isPublicAccess ? 'px-3 py-2' : 'px-4 py-3'} text-left text-xs font-bold uppercase tracking-wider`} style={{ color: branding.primaryColor }}>
              Date
            </th>
            {!isPublicAccess && (
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayedTimesheets.map((timesheet, index) => (
              <tr
                key={timesheet.id}
                className="border-b hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}
              >
                <td className={isPublicAccess ? 'px-3 py-2' : 'px-4 py-3'}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`${isPublicAccess ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full flex items-center justify-center text-white font-bold overflow-hidden`}
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {candidatoFeuilleTempsSeleccionado?.foto ? (
                        <ImageWithFallback
                          src={candidatoFeuilleTempsSeleccionado.foto}
                          alt={candidatoFeuilleTempsSeleccionado.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getCandidateInitials(candidatoFeuilleTempsSeleccionado?.name || 'BA')
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#333333] leading-tight">
                        {candidatoFeuilleTempsSeleccionado?.name || 'Bénévole'}
                      </span>
                      {!isPublicAccess && timesheet.notes && (
                        <p className="text-xs text-gray-500 max-w-[220px] truncate">{timesheet.notes}</p>
                      )}
                      {!isPublicAccess && timesheet.correctionHistory && timesheet.correctionHistory.length > 0 && (
                        <div className="mt-1 space-y-1">
                          <Badge className="border-0 bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5">
                            {timesheet.correctionHistory.length} correction{timesheet.correctionHistory.length > 1 ? 's' : ''}
                          </Badge>
                          <p className="text-[11px] text-amber-700 leading-snug max-w-[260px]">
                            Dernière correction: {timesheet.correctionHistory[0].actor} • {formatCorrectionTimestamp(timesheet.correctionHistory[0].timestamp)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className={`${isPublicAccess ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} text-[#666666]`}>
                  {timesheet.departement}
                </td>
                <td className={isPublicAccess ? 'px-2 py-2 text-center' : 'px-4 py-3 text-center'}>
                  <span
                    className={`inline-flex items-center gap-1 ${isPublicAccess ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} rounded-full font-mono font-semibold`}
                    style={{
                      backgroundColor: `${branding.secondaryColor}15`,
                      color: branding.secondaryColor
                    }}
                  >
                    {timesheet.heureDebut}
                  </span>
                </td>
                <td className={isPublicAccess ? 'px-2 py-2 text-center' : 'px-4 py-3 text-center'}>
                  <span
                    className={`inline-flex items-center gap-1 ${isPublicAccess ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} rounded-full font-mono font-semibold`}
                    style={{
                      backgroundColor: '#DC354515',
                      color: '#DC3545'
                    }}
                  >
                    {timesheet.heureFin}
                  </span>
                </td>
                <td className={isPublicAccess ? 'px-3 py-2 text-right' : 'px-4 py-3 text-right'}>
                  <span className={`font-bold ${isPublicAccess ? 'text-sm' : 'text-lg'}`} style={{ color: branding.primaryColor }}>
                    {formatTimesheetHours(timesheet.duree)}
                  </span>
                </td>
                <td className={`${isPublicAccess ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} text-[#666666]`}>
                  <div>
                    <p>{timesheet.date}</p>
                    {!isPublicAccess && timesheet.correctionHistory && timesheet.correctionHistory.length > 0 && (
                      <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] leading-snug">
                        {timesheet.correctionHistory[0].changes[0]}
                      </p>
                    )}
                  </div>
                </td>
                {!isPublicAccess && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        onClick={() => handleStartEditTimesheet(timesheet)}
                        title="Modifier la feuille de temps"
                      >
                        <Edit className="w-4 h-4" style={{ color: branding.primaryColor }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        onClick={() => handleDeleteTimesheet(timesheet.id)}
                        title="Supprimer la feuille de temps"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
      {isPublicAccess && sortedTimesheets.length > displayedTimesheets.length && (
        <p className="mt-2 text-right text-xs text-gray-500">
          Affichage des 6 dernières entrées pour conserver l'écran complet.
        </p>
      )}
    </div>
    );
  };

  const renderCandidateProfilePanel = () => {
    if (!candidatoParaPerfil) {
      return null;
    }

    const numeroArchivo = obtenerNumeroArchivoCandidato(candidatoParaPerfil);
    const cardColor = branding.primaryColor;
    const tieneContacto = obtenerContactoCandidato(candidatoParaPerfil);
    const organismosExternosAsignados = obtenerOrganismosAcreditadosAsignados(candidatoParaPerfil);

    return (
      <Card className="border-gray-200/50 shadow-sm overflow-hidden xl:sticky xl:top-4">
        <CardHeader className="pb-3 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
              <Users className="w-5 h-5" />
              Profil détaillé du candidat
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setCandidatoParaPerfil(null)} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Fermer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div
            className="p-4 rounded-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`
            }}
          >
            <div className="flex flex-col lg:flex-row items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                  boxShadow: `0 4px 12px ${cardColor}30`
                }}
              >
                {candidatoParaPerfil.foto ? (
                  <ImageWithFallback
                    src={candidatoParaPerfil.foto}
                    alt={candidatoParaPerfil.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-base font-bold">
                    {getCandidateInitials(candidatoParaPerfil.name || 'BA')}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {candidatoParaPerfil.name}
                </h3>
                <p className="text-base mb-2" style={{ color: branding.secondaryColor }}>
                  {getLocalizedCandidatePosition(candidatoParaPerfil.position)}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusBadge(candidatoParaPerfil.status)}
                  {numeroArchivo && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80">
                      <FileText className="w-4 h-4" style={{ color: branding.primaryColor }} />
                      <span className="text-sm font-mono font-semibold tracking-wide" style={{ color: branding.primaryColor }}>
                        {numeroArchivo}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                <Mail className="w-5 h-5" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Mail className="w-5 h-5 flex-shrink-0" style={{ color: cardColor }} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium break-all">{candidatoParaPerfil.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: cardColor }} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                    <p className="text-sm font-medium">{candidatoParaPerfil.phone}</p>
                  </div>
                </div>
                {(candidatoParaPerfil.adresse || candidatoParaPerfil.ville || candidatoParaPerfil.codePostal || candidatoParaPerfil.appartement) && (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5" style={{ color: cardColor }} />
                      <p className="text-sm font-semibold">Adresse</p>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      {candidatoParaPerfil.adresse && <p className="font-medium">{candidatoParaPerfil.adresse}</p>}
                      {candidatoParaPerfil.appartement && <p>Apt/Unité: {candidatoParaPerfil.appartement}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {candidatoParaPerfil.ville && <span>{candidatoParaPerfil.ville}</span>}
                        {candidatoParaPerfil.ville && candidatoParaPerfil.codePostal && <span>•</span>}
                        {candidatoParaPerfil.codePostal && <span>{candidatoParaPerfil.codePostal}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                <Briefcase className="w-5 h-5" />
                Détails de la candidature
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Calendar className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: cardColor }} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date de candidature</p>
                    <p className="text-sm font-medium">
                      {new Date(candidatoParaPerfil.applicationDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Clock className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: cardColor }} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Disponibilité</p>
                    <p className="text-sm font-medium">{getLocalizedCandidateAvailability(candidatoParaPerfil.availability)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border-l-4" style={{ backgroundColor: `${branding.secondaryColor}10`, borderLeftColor: branding.secondaryColor }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" style={{ color: branding.secondaryColor }} />
                    <p className="text-sm font-semibold">Expérience</p>
                  </div>
                  <p className="text-sm leading-relaxed">{getLocalizedCandidateExperience(candidatoParaPerfil.experience)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5" style={{ color: branding.primaryColor }} />
              <h4 className="font-semibold text-base" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                Organismes externes accrédités
              </h4>
            </div>
            {organismosExternosAsignados.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {organismosExternosAsignados.map((organismo) => (
                  <Badge
                    key={organismo.id}
                    className="border-0 px-3 py-1"
                    style={{ backgroundColor: `${branding.secondaryColor}15`, color: branding.secondaryColor }}
                  >
                    {organismo.nombre}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Aucun organisme accrédité lié à ce bénévole pour le moment.
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 flex-wrap">
            {tieneContacto ? (
              <>
                <Button
                  variant="outline"
                  className="shadow-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor, borderColor: `${branding.primaryColor}55` }}
                  onClick={() => abrirDialogoAssignacion(candidatoParaPerfil, 'modify')}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Modifier l'assignation
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 shadow-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                  onClick={() => handleEliminarContacto(candidatoParaPerfil)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer le contact
                </Button>
              </>
            ) : (
              <Button
                className="text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onClick={() => abrirDialogoAssignacion(candidatoParaPerfil, 'assign')}
              >
                <Link className="w-4 h-4 mr-2" />
                Assigner au département
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPublicTimesheetsLayout = () => {
    if (!publicAccessOrganism) {
      return (
        <Card className="border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Organisme accredite
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Identifiez votre organisme avec sa cle d'acces
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  La feuille de temps affichera uniquement les benevoles assignes a votre organisme dans le module Recrutement.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Label htmlFor="recruit-public-access-key" className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Cle d'acces de l'organisme
                </Label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="recruit-public-access-key"
                    value={publicAccessCodeInput}
                    onChange={(event) => {
                      setPublicAccessCodeInput(normalizarClaveAcceso(event.target.value));
                      setPublicAccessAuthError('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleAuthenticatePublicAccess();
                      }
                    }}
                    placeholder="Ex. HORIZON2026"
                    className="h-11 font-mono uppercase tracking-[0.12em]"
                  />
                  <Button
                    onClick={handleAuthenticatePublicAccess}
                    className="h-11 whitespace-nowrap text-white"
                    style={{
                      backgroundColor: branding.primaryColor,
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Identifier l'organisme
                  </Button>
                </div>
                {publicAccessAuthError && (
                  <p className="mt-3 text-sm text-red-600">{publicAccessAuthError}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const publicRecentTimesheets = feuillesTempsHistorialSeleccionadas
      .slice()
      .sort((left, right) => `${right.date}-${right.heureDebut}`.localeCompare(`${left.date}-${left.heureDebut}`))
      .slice(0, 4);
    const publicActiveTimesheets = feuillesTempsActivasSeleccionadas.slice(0, 2);
    const selectedDepartmentName = departamentosFeuilleTemps.find(
      department => department.id === timesheetForm.departamentoId
    )?.nombre || 'Non sélectionné';
    const selectedCandidateInitials = candidatoFeuilleTempsSeleccionado?.name
      ?.split(' ')
      .map(name => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'BA';

    return (
      <div className="grid grid-cols-1 gap-3 md:h-[412px] md:grid-cols-[minmax(292px,1.02fr)_minmax(330px,1.18fr)_minmax(248px,0.96fr)]">
        <Card className="border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:h-full">
          <CardContent className="flex h-full flex-col gap-4 p-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Organisme identifie
              </p>
              <p className="mt-1 font-semibold">{publicAccessOrganism.nombre}</p>
              <p className="mt-1 text-xs text-emerald-800">
                Cle: {publicAccessOrganism.claveAcceso || publicAccessSessionKey}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{
                    backgroundColor: branding.primaryColor,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {selectedCandidateInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {t('recruitmentPublic.selectedVolunteer')}
                  </p>
                  <p className="mt-1 text-lg font-bold leading-tight text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {candidatoFeuilleTempsSeleccionado?.name || t('recruitmentPublic.selectVolunteer')}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {candidatoFeuilleTempsSeleccionado
                      ? t('recruitmentPublic.chooseDepartmentThenEntryOrExit')
                      : t('recruitmentPublic.searchVolunteerToEnableTimesheet')}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-200 bg-white px-2 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">{t('recruitmentPublic.entries')}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{feuillesTempsSeleccionadas.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-2 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">{t('recruitmentPublic.total')}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{formatTimesheetHours(totalHeuresFeuilleTempsSeleccionada)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-2 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">{t('recruitmentPublic.month')}</p>
                  <p className="mt-1 text-base font-semibold" style={{ color: branding.secondaryColor }}>{formatTimesheetHours(heuresMoisFeuilleTempsSeleccionada)}</p>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{t('recruitmentPublic.volunteers')}</Label>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-500">
                  {candidatosFeuilleTempsFiltrados.length}
                </span>
              </div>
              <div className="mt-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={timesheetCandidateSearch}
                  onChange={(event) => setTimesheetCandidateSearch(event.target.value)}
                  placeholder={t('recruitmentPublic.quickSearchPlaceholder')}
                  className="h-10 rounded-xl border-white bg-gray-50 pl-10 text-sm"
                />
              </div>
              <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {candidatosFeuilleTempsFiltrados.length === 0 ? (
                  <div className="flex h-full min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-sm text-gray-500">
                    {t('recruitmentPublic.noVolunteerFound')}
                  </div>
                ) : candidatosFeuilleTempsFiltrados.slice(0, 5).map(candidate => {
                  const isSelected = String(candidate.id) === selectedTimesheetCandidateId;
                  const totalCandidateHours = feuillesTempsGlobalesFiltradas
                    .filter(timesheet => timesheet.candidateId === candidate.id)
                    .reduce((sum, timesheet) => sum + timesheet.duree, 0);

                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelectedTimesheetCandidateId(String(candidate.id))}
                      aria-label={t('recruitmentPublic.selectVolunteerAria', { name: candidate.name })}
                      className="w-full rounded-2xl border px-3 py-2.5 text-left transition-all duration-200"
                      style={{
                        borderColor: isSelected ? branding.primaryColor : '#E2E8F0',
                        backgroundColor: '#FFFFFF',
                        boxShadow: isSelected ? `0 8px 20px ${branding.primaryColor}14` : '0 2px 10px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold shrink-0"
                            style={{ backgroundColor: isSelected ? branding.primaryColor : `${branding.primaryColor}cc` }}
                          >
                            {candidate.foto ? (
                              <ImageWithFallback
                                src={candidate.foto}
                                alt={candidate.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getCandidateInitials(candidate.name || 'BA')
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: isSelected ? branding.primaryColor : '#1F2937' }}>
                              {candidate.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-gray-500">{candidate.email}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] uppercase tracking-wide text-gray-400">{t('recruitmentPublic.hours')}</p>
                          <p className="text-sm font-semibold" style={{ color: branding.secondaryColor }}>
                            {formatTimesheetHours(totalCandidateHours)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {candidatoFeuilleTempsSeleccionado && departamentosFeuilleTemps.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                  {departamentosFeuilleTemps.map(departamento => (
                    <Badge
                      key={departamento.id}
                      className="border-0 px-2.5 py-1 text-xs"
                      style={{
                        backgroundColor: `${departamento.color}15`,
                        color: departamento.color,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      {departamento.icono} {departamento.nombre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:h-full">
          <CardContent className="flex h-full flex-col gap-4 p-4">
            <div
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {t('recruitmentPublic.timesheet')}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: branding.primaryColor }} />
                    <p className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('recruitmentPublic.registerEntry')}
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                  {t('recruitmentPublic.automatic')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <Label htmlFor="recruit-timesheet-department-public" className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  <Briefcase className="h-3.5 w-3.5" />
                  {t('recruitmentPublic.department')}
                </Label>
                <Select
                  value={timesheetForm.departamentoId}
                  onValueChange={(value) => setTimesheetForm(prev => ({ ...prev, departamentoId: value }))}
                >
                  <SelectTrigger
                    id="recruit-timesheet-department-public"
                    aria-label={t('recruitmentPublic.selectDepartmentForTimesheet')}
                    className="h-11 rounded-xl bg-white"
                  >
                    <SelectValue placeholder={t('recruitmentPublic.selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentosFeuilleTemps.map(department => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.icono} {department.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <Label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Date
                </Label>
                <div className="flex h-11 items-center rounded-xl border border-white bg-white px-3 text-sm text-gray-700">
                  {timesheetForm.date}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <Label htmlFor="recruit-timesheet-notes-public" className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                <FileText className="h-3.5 w-3.5" />
                Notes
              </Label>
              <div className="grid grid-cols-[minmax(0,1fr)_170px] gap-2.5 items-center">
                <Input
                  id="recruit-timesheet-notes-public"
                  className="h-11 rounded-xl border-slate-200 bg-gray-50 text-sm"
                  placeholder={t('recruitmentPublic.notesPlaceholder')}
                  value={timesheetForm.notes}
                  onChange={(event) => setTimesheetForm(prev => ({ ...prev, notes: event.target.value }))}
                />
                <Button
                  className="h-11 rounded-xl px-4 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{
                    backgroundColor: branding.primaryColor,
                    boxShadow: `0 12px 26px ${branding.primaryColor}33`,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                  onClick={handleRegisterTimesheetEntry}
                  disabled={!candidatoFeuilleTempsSeleccionado || !timesheetForm.departamentoId}
                  title={t('recruitmentPublic.registerArrivalNow')}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {t('recruitmentPublic.entry')}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50/70 px-4 py-2.5 text-sm text-amber-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold leading-5">{t('recruitmentPublic.automaticEntryExitOnly')}</p>
                  <p className="mt-0.5 text-xs leading-4 text-amber-800">
                    {t('recruitmentPublic.noManualCorrectionPublic')}
                  </p>
                </div>
                <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  {t('recruitmentPublic.publicBadge')}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {t('recruitmentPublic.activeSessions')}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {feuillesTempsActivasSeleccionadas.length > 0
                        ? t('recruitmentPublic.sessionsInProgress', { count: feuillesTempsActivasSeleccionadas.length })
                        : t('recruitmentPublic.noOpenSession')}
                    </p>
                  </div>
                  {feuillesTempsActivasSeleccionadas.length > 0 ? (
                    <Badge className="border-0 px-2.5 py-1 text-xs text-white" style={{ backgroundColor: '#D97706' }}>
                      {t('recruitmentPublic.pending')}
                    </Badge>
                  ) : (
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                      {t('recruitmentPublic.ready')}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 min-h-0 space-y-2 overflow-y-auto">
                {publicActiveTimesheets.length === 0 ? (
                  <div className="flex h-[122px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 text-center text-sm text-gray-500">
                    {t('recruitmentPublic.exitAppearsWhenSessionOpen')}
                  </div>
                ) : publicActiveTimesheets.map(timesheet => {
                  const elapsedHours = calculateTimesheetDuration(timesheet.heureDebut, getCurrentLocalTime());

                  return (
                    <div
                      key={timesheet.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">{candidatoFeuilleTempsSeleccionado?.name}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{timesheet.departement} • {timesheet.date}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="rounded-full bg-emerald-50 px-2 py-1 font-mono font-semibold text-emerald-700">
                            {timesheet.heureDebut}
                          </span>
                          <span className="font-mono text-amber-700">{formatTimesheetHours(elapsedHours)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRegisterTimesheetExit(timesheet.id)}
                        className="h-10 rounded-xl px-4 text-white shadow-lg hover:shadow-xl transition-all"
                        style={{ backgroundColor: '#DC3545' }}
                      >
                        <LogOut className="mr-1.5 h-4 w-4" />
                        {t('recruitmentPublic.exit')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] md:h-full">
          <CardContent className="flex h-full flex-col gap-3 p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{t('recruitmentPublic.overview')}</p>
              <div className="mt-1 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: branding.primaryColor }} />
                <p className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('recruitmentPublic.accumulatedHours')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {heuresAccumuleesParDepartement.length > 0 ? (
                <div className="h-[130px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heuresAccumuleesParDepartement} margin={{ top: 4, right: 4, left: -20, bottom: 18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="departement" tick={{ fill: '#666666', fontSize: 10 }} height={26} />
                      <YAxis width={26} tick={{ fill: '#666666', fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number) => [`${formatTimesheetHours(Number(value))}`, 'Heures']}
                        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                      />
                      <Bar dataKey="heures" fill={branding.primaryColor} radius={[8, 8, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-4 text-sm text-gray-600">
                  <p className="text-center font-semibold text-slate-700">{t('recruitmentPublic.noHoursData')}</p>
                  <p className="mt-1 text-center text-xs leading-4 text-gray-500">
                    {t('recruitmentPublic.chartAppearsAfterEntry')}
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                      <span className="text-gray-500">{t('recruitmentPublic.volunteer')}</span>
                      <span className="max-w-[55%] truncate font-medium text-slate-700">
                        {candidatoFeuilleTempsSeleccionado?.name || t('recruitmentPublic.none')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                      <span className="text-gray-500">{t('recruitmentPublic.department')}</span>
                      <span className="max-w-[55%] truncate font-medium text-slate-700">
                        {selectedDepartmentName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                      <span className="text-gray-500">{t('recruitmentPublic.activeSession')}</span>
                      <span className="font-medium text-slate-700">
                        {feuillesTempsActivasSeleccionadas.length > 0 ? t('recruitmentPublic.yes') : t('recruitmentPublic.no')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{t('recruitmentPublic.volunteers')}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{candidatosFeuilleTemps.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{t('recruitmentPublic.entries')}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{totalEntreesFeuilleTemps}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{t('recruitmentPublic.total')}</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: branding.secondaryColor }}>{formatTimesheetHours(totalHeuresFeuilleTemps)}</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{t('recruitmentPublic.recentEntries')}</p>
              <div className="mt-2 min-h-0 space-y-2 overflow-y-auto">
                {publicRecentTimesheets.length === 0 ? (
                  <div className="flex h-[84px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-3 text-center text-sm text-gray-500">
                    {t('recruitmentPublic.noTimesheetForVolunteer')}
                  </div>
                ) : publicRecentTimesheets.slice(0, 3).map(timesheet => (
                  <div key={timesheet.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                      <span className="truncate">{timesheet.date}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">{timesheet.departement}</span>
                    </div>
                    <p className="mt-2 font-mono text-sm text-gray-700">
                      {timesheet.heureDebut}{timesheet.heureFin ? ` - ${timesheet.heureFin}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleExportTimesheets = async () => {
    if (feuillesTempsGlobalesFiltradas.length === 0) {
      toast.error(t('recruitmentInternal.timesheets.toasts.noExportWithFilters'));
      return;
    }

    const exportColumns: TableColumn[] = [
      { header: t('recruitmentInternal.timesheets.csvHeaders.volunteer'), key: 'candidateName' },
      { header: t('recruitmentInternal.timesheets.csvHeaders.email'), key: 'candidateEmail' },
      { header: t('recruitmentInternal.timesheets.csvHeaders.department'), key: 'departement' },
      { header: t('recruitmentInternal.timesheets.csvHeaders.date'), key: 'date' },
      { header: t('recruitmentInternal.timesheets.csvHeaders.start'), key: 'heureDebut' },
      { header: t('recruitmentInternal.timesheets.csvHeaders.end'), key: 'heureFin' },
      { header: t('recruitmentInternal.timesheets.csvHeaders.duration'), key: 'duree', format: (value) => formatTimesheetHours(Number(value) || 0) },
      { header: t('recruitmentInternal.timesheets.csvHeaders.notes'), key: 'notes' }
    ];

    await exportToCSV(feuillesTempsGlobalesFiltradas, exportColumns, {
      filename: `recrutement_feuilles_temps_${timesheetMonthFilter || getTodayLocalDate()}`,
      includeDate: true,
      title: t('recruitmentInternal.timesheets.csvTitle')
    });

    toast.success(t('recruitmentInternal.timesheets.toasts.exportGenerated', { count: feuillesTempsGlobalesFiltradas.length }));
  };

  const handleExportRecruitmentReport = async () => {
    if (reportExportRows.length === 0) {
      toast.error(t('recruitmentInternal.reports.toasts.noDataToExport'));
      return;
    }

    const exportColumns: TableColumn[] = [
      { header: t('recruitmentInternal.reports.csvHeaders.axis'), key: 'axe' },
      { header: t('recruitmentInternal.reports.csvHeaders.label'), key: 'libelle' },
      { header: t('recruitmentInternal.reports.csvHeaders.entries'), key: 'entrees' },
      { header: t('recruitmentInternal.reports.csvHeaders.volunteers'), key: 'benevoles' },
      { header: t('recruitmentInternal.reports.csvHeaders.departments'), key: 'departements' },
      { header: t('recruitmentInternal.reports.csvHeaders.hours'), key: 'heures', format: (value) => formatTimesheetHours(Number(value) || 0) }
    ];

    await exportToCSV(reportExportRows, exportColumns, {
      filename: `recrutement_rapport_${getTodayLocalDate()}`,
      includeDate: true,
      title: t('recruitmentInternal.reports.csvTitle')
    });

    toast.success(t('recruitmentInternal.reports.toasts.exportGenerated', { count: reportExportRows.length }));
  };

  const handleStatusChange = (candidateId: number, newStatus: string) => {
    // Buscar el candidat pour obtener sus datos
    const candidate = candidates.find(c => c.id === candidateId);
    
    // ✅ Actualizar en localStorage primero
    const candidatoActualizado = persistCandidateChanges(candidateId, { 
      status: newStatus as Candidate['status'] 
    });
    
    if (!candidatoActualizado) {
      toast.error('❌ Erreur lors de la mise à jour du statut');
      return;
    }
    
    // Actualizar el estado local
    setCandidates(prev => 
      prev.map(c => c.id === candidateId ? candidatoActualizado : c)
    );
    
    console.log('✅ Statut mis à jour:', { id: candidateId, newStatus });
    
    // ✅ Si se acepta el candidat, sincronizar automatiquement avec le département correspondant
    if (newStatus === 'accepted' && candidate) {
      try {
        const resultado = sincronizarCandidatoAceptado(candidate, { notify: true });

        if (!resultado.creado) {
          toast.success(
            `${candidate.name} accepté et déjà synchronisé avec ${resultado.departamentoNombre}`,
            {
              description: 'Le contact existant a été réutilisé sans créer de doublon.',
              duration: 5000
            }
          );
        }
      } catch (error) {
        console.error('❌ Erreur lors de la création du contact depuis Recrutement:', error);
        toast.error('Le statut a été mis à jour mais il y a eu une erreur lors de l\'ajout au département.');
      }
    } else {
      toast.success('Statut mis à jour avec succès');
    }
  };

  const handleDeleteCandidate = (candidateId: number, candidateName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la candidature de ${candidateName}?\n\nCette action est irréversible.`)) {
      const eliminado = eliminarCandidato(candidateId);

      if (!eliminado) {
        toast.error('Erreur lors de la suppression de la candidature');
        return;
      }

      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast.success('Candidature supprimée avec succès');
    }
  };

  // 🗑️ Fonction pour supprimer le contact créé depuis Recrutement
  const handleEliminarContacto = (candidate: Candidate) => {
    // Buscar el contacto asociado
    const contactoInfo = obtenerContactoCandidato(candidate);
    
    if (!contactoInfo) {
      toast.error('Aucun contact associé à ce candidat');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer le contact de ${candidate.name}?\n\nCette action supprimera le contact du département mais conservera la candidature.`)) {
      try {
        eliminarContacto(contactoInfo.id);

        const departamentosRestantes = (candidate.departamentoIds || [])
          .filter(id => id !== contactoInfo.departamentoId);
        const contactoRestante = obtenerContactoCandidato(candidate);
        const numeroArchivoRestante = obtenerNumeroArchivoCandidato(candidate);
        
        persistCandidateChanges(candidate.id, {
          contactoId: contactoRestante?.id,
          departamentoIds: departamentosRestantes,
          numeroArchivo: numeroArchivoRestante || undefined,
          status: departamentosRestantes.length === 0 ? 'reviewed' : candidate.status
        });

        // Notificar a los departamentos
        window.dispatchEvent(new CustomEvent('contactos-actualizados', {
          detail: { contactoId: contactoInfo.id }
        }));

        toast.success(`Contact de ${candidate.name} supprimé avec succès`, {
          description: 'Le candidat est maintenant disponible pour être assigné à nouveau'
        });

        // Cerrar el panel de perfil
        setCandidatoParaPerfil(null);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du contact:', error);
        toast.error('Erreur lors de la suppression du contact');
      }
    }
  };

  // 🔍 Fonction pour vérifier si un candidat est déjà assigné à un département
  const verificarCandidatoAsignado = (candidate: Candidate, departamentoId: string): boolean => {
    const contactosExistentes = obtenerContactosPorDepartamento(departamentoId);
    return contactosExistentes.some(contacto => 
      contacto.email.toLowerCase() === candidate.email.toLowerCase() ||
      (contacto.nombre.toLowerCase() === candidate.name.split(' ')[0].toLowerCase() &&
       contacto.apellido.toLowerCase() === candidate.name.split(' ').slice(1).join(' ').toLowerCase())
    );
  };

  const obtenerContactosCandidato = (candidate: Candidate) => {
    return departamentosDisponibles.flatMap(dept => {
      const contactosExistentes = obtenerContactosPorDepartamento(dept.id);
      const contactosCoincidentes = contactosExistentes.filter(contacto =>
        contacto.email.toLowerCase() === candidate.email.toLowerCase() ||
        (
          contacto.nombre.toLowerCase() === candidate.name.split(' ')[0].toLowerCase() &&
          contacto.apellido.toLowerCase() === candidate.name.split(' ').slice(1).join(' ').toLowerCase()
        )
      );

      return contactosCoincidentes.map(contacto => ({
        id: contacto.id,
        departamentoId: dept.id,
        contacto
      }));
    });
  };

  // 🔍 Fonction pour obtenir le numéro d'archive d'un candidat s'il est déjà assigné
  const obtenerNumeroArchivoCandidato = (candidate: Candidate): string | null => {
    const contactoConNumero = obtenerContactosCandidato(candidate)
      .find(({ contacto }) => contacto.numeroArchivo);

    return contactoConNumero?.contacto.numeroArchivo || null;
  };

  // 🔍 Fonction pour obtenir le contacto asociado a un candidato si existe
  const obtenerContactoCandidato = (candidate: Candidate): { id: string; departamentoId: string } | null => {
    const contactoEncontrado = obtenerContactosCandidato(candidate)[0];

    if (!contactoEncontrado) {
      return null;
    }

    return {
      id: contactoEncontrado.id,
      departamentoId: contactoEncontrado.departamentoId
    };
  };

  const obtenerContactoCandidatoPorDepartamento = (candidate: Candidate, departamentoId: string) => {
    return obtenerContactosCandidato(candidate)
      .find(contacto => contacto.departamentoId === departamentoId) || null;
  };

  const sincronizarCandidatoAceptado = (candidate: Candidate, options?: { notify?: boolean }) => {
    const departamento = resolveDepartmentForCandidate(candidate);
    const contactosExistentes = obtenerContactosCandidato(candidate);

    if (contactosExistentes.length > 0) {
      const contactoPrincipal = contactosExistentes.find(contacto => contacto.departamentoId === departamento.id) || contactosExistentes[0];
      const departamentosActualizados = Array.from(new Set([
        ...(candidate.departamentoIds || []),
        ...contactosExistentes.map(contacto => contacto.departamentoId)
      ]));

      const requiereActualizacion =
        candidate.contactoId !== contactoPrincipal.id ||
        departamentosActualizados.length !== (candidate.departamentoIds || []).length ||
        departamentosActualizados.some(id => !(candidate.departamentoIds || []).includes(id)) ||
        (contactoPrincipal.contacto.numeroArchivo || candidate.numeroArchivo) !== candidate.numeroArchivo;

      if (requiereActualizacion) {
        persistCandidateChanges(candidate.id, {
          contactoId: contactoPrincipal.id,
          departamentoIds: departamentosActualizados,
          numeroArchivo: contactoPrincipal.contacto.numeroArchivo || candidate.numeroArchivo
        });
      }

      return {
        creado: false,
        departamentoNombre: departamento.nombre,
        contactoId: contactoPrincipal.id
      };
    }

    const { nombre, apellido } = splitCandidateName(candidate.name);
    const eventoCreacion = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'creation' as const,
      titre: 'Bénévole ajouté depuis Recrutement',
      description: `Candidat accepté et ajouté automatiquement au département ${departamento.nombre}`,
      date: new Date().toISOString(),
      utilisateur: 'Système',
      couleur: '#4CAF50'
    };

    const nuevoContacto = {
      departamentoId: departamento.id,
      departamentoIds: [departamento.id],
      tipo: 'benevole' as const,
      nombre,
      apellido,
      email: candidate.email,
      telefono: candidate.phone,
      activo: true,
      fechaIngreso: new Date().toISOString().split('T')[0],
      disponibilidades: buildDisponibilidadesFromAvailability(candidate.availability, candidate.disponibilidades),
      notas: `${candidate.experience}\n\nCandidature du: ${new Date(candidate.applicationDate).toLocaleDateString('fr-FR')}`,
      evenements: [eventoCreacion],
      direccion: candidate.adresse || '',
      apartamento: candidate.appartement || '',
      ciudad: candidate.ville || '',
      codigoPostal: candidate.codePostal || '',
      quartier: candidate.quartier || '',
      cargo: candidate.position,
      idiomas: candidate.idiomas || [],
      documents: candidate.documents || []
    };

    const contactoGuardado = guardarContacto(nuevoContacto);
    const departamentosActualizados = Array.from(new Set([
      ...(candidate.departamentoIds || []),
      departamento.id
    ]));

    persistCandidateChanges(candidate.id, {
      contactoId: contactoGuardado.id,
      departamentoIds: departamentosActualizados,
      numeroArchivo: contactoGuardado.numeroArchivo || candidate.numeroArchivo
    });

    window.dispatchEvent(new CustomEvent('contactos-actualizados', {
      detail: { departamentoId: departamento.id, contactoId: contactoGuardado.id }
    }));

    if (options?.notify) {
      toast.success(
        `${candidate.name} accepté et ajouté au département ${departamento.nombre}!`,
        {
          description: `Le contact est maintenant disponible dans la section ${departamento.nombre}. ID: ${contactoGuardado.id}`,
          duration: 5000
        }
      );
    }

    return {
      creado: true,
      departamentoNombre: departamento.nombre,
      contactoId: contactoGuardado.id
    };
  };

  useEffect(() => {
    const candidatsAceptadosDesincronizados = candidates.filter(candidate => {
      if (candidate.status !== 'accepted') {
        return false;
      }

      const contactosExistentes = obtenerContactosCandidato(candidate);

      if (contactosExistentes.length === 0) {
        return !candidate.contactoId || (candidate.departamentoIds || []).length === 0;
      }

      return (
        !candidate.contactoId ||
        (candidate.departamentoIds || []).length === 0 ||
        !contactosExistentes.some(contacto => contacto.id === candidate.contactoId) ||
        contactosExistentes.some(contacto => !(candidate.departamentoIds || []).includes(contacto.departamentoId))
      );
    });

    if (candidatsAceptadosDesincronizados.length === 0) {
      return;
    }

    candidatsAceptadosDesincronizados.forEach(candidate => {
      sincronizarCandidatoAceptado(candidate);
    });
  }, [candidates]);

  // 🎯 Fonction pour assigner candidat à un département spécifique
  const handleAssignerCandidat = () => {
    if (!candidatoParaAssignar || !departamentoSeleccionado) {
      toast.error('Veuillez sélectionner un département');
      return;
    }

    // 🔒 VERIFIER SI LE CANDIDAT EST DÉJÀ ASSIGNÉ À CE DÉPARTEMENT
    const yaExiste = verificarCandidatoAsignado(candidatoParaAssignar, departamentoSeleccionado);

    if (yaExiste) {
      const departamento = departamentosDisponibles.find(d => d.id === departamentoSeleccionado);
      toast.error(
        `${candidatoParaAssignar.name} est déjà assigné au département ${departamento?.nombre}!`,
        {
          description: 'Veuillez sélectionner un autre département ou vérifier la liste des contacts.',
          duration: 5000
        }
      );
      return;
    }

    try {
      const departamento = departamentosDisponibles.find(d => d.id === departamentoSeleccionado);
      if (!departamento) {
        toast.error('Département non trouvé');
        return;
      }

      // Séparer nom complet en prénom (nombre) et nom de famille (apellido)
      // Format: "Prénom Nom" -> nombre="Prénom", apellido="Nom"
      const nombreParts = candidatoParaAssignar.name.trim().split(' ');
      const nombre = nombreParts[0] || ''; // Premier mot = Prénom
      const apellido = nombreParts.slice(1).join(' ') || ''; // Reste = Nom de famille
      
      // Parser disponibilité en jours de la semaine
      const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      const disponibilidades = diasSemana.map(jour => ({
        jour,
        am: candidatoParaAssignar.availability.toLowerCase().includes(jour.toLowerCase()) || 
            candidatoParaAssignar.availability.toLowerCase().includes('temps plein') ||
            candidatoParaAssignar.availability.toLowerCase().includes('flexible'),
        pm: candidatoParaAssignar.availability.toLowerCase().includes(jour.toLowerCase()) ||
            candidatoParaAssignar.availability.toLowerCase().includes('temps plein') ||
            candidatoParaAssignar.availability.toLowerCase().includes('flexible')
      }));
      
      // Créer événement de création
      const eventoCreacion = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'creation' as const,
        titre: 'Bénévole assigné depuis Recrutement',
        description: `Candidat assigné manuellement au département ${departamento.nombre}`,
        date: new Date().toISOString(),
        utilisateur: 'Système',
        couleur: departamento.color
      };
      
      // Créer contact dans le département sélectionné
      const nuevoContacto = {
        departamentoId: departamentoSeleccionado,
        departamentoIds: [departamentoSeleccionado],
        tipo: 'benevole' as const,
        nombre,
        apellido,
        email: candidatoParaAssignar.email,
        telefono: candidatoParaAssignar.phone,
        activo: true,
        fechaIngreso: new Date().toISOString().split('T')[0],
        disponibilidades,
        notas: `${candidatoParaAssignar.experience}\n\nCandidature du: ${new Date(candidatoParaAssignar.applicationDate).toLocaleDateString('fr-FR')}\n\nAssigné manuellement au département ${departamento.nombre}`,
        evenements: [eventoCreacion],
        // Champs optionnels
        direccion: candidatoParaAssignar.adresse || '',
        apartamento: candidatoParaAssignar.appartement || '',
        ciudad: candidatoParaAssignar.ville || '',
        codigoPostal: candidatoParaAssignar.codePostal || '',
        quartier: candidatoParaAssignar.quartier || '', // ✅ CRÍTICO: Incluir quartier
        cargo: candidatoParaAssignar.position,
        idiomas: [],
        documents: []
      };
      
      console.log('✅ Assignant candidat au département:', {
        département: `${departamento.nombre} (${departamentoSeleccionado})`,
        contact: nuevoContacto
      });
      
      const contactoGuardado = guardarContacto(nuevoContacto);
      
      console.log('✅ Contacto sauvegardé avec succès:', contactoGuardado);
      
      const departamentosActualizados = Array.from(new Set([
        ...(candidatoParaAssignar.departamentoIds || []),
        departamentoSeleccionado
      ]));

      persistCandidateChanges(candidatoParaAssignar.id, {
        contactoId: contactoGuardado.id,
        departamentoIds: departamentosActualizados,
        numeroArchivo: contactoGuardado.numeroArchivo || candidatoParaAssignar.numeroArchivo,
        organismosAcreditadosIds: organismosAcreditadosSeleccionados
      });
      
      // 🔥 Déclencher événement personnalisé pour synchroniser départements
      window.dispatchEvent(new CustomEvent('contactos-actualizados', {
        detail: { departamentoId: departamentoSeleccionado, contactoId: contactoGuardado.id }
      }));
      
      toast.success(
        `${candidatoParaAssignar.name} assigné au département ${departamento.nombre}!`,
        {
          description: `Le contact est maintenant disponible dans la section ${departamento.nombre}`,
          duration: 5000
        }
      );

      // Fermer dialog et nettoyer états
      setDialogAssignerOpen(false);
      setCandidatoParaAssignar(null);
      setDepartamentoSeleccionado('');
    } catch (error) {
      console.error('❌ Erreur lors de l\'assignation du candidat:', error);
      toast.error('Erreur lors de l\'assignation au département');
    }
  };

  const handleModifierAsignacion = () => {
    if (!candidatoParaAssignar || !departamentoOrigenSeleccionado || !departamentoSeleccionado) {
      toast.error('Veuillez sélectionner le département actuel et le nouveau département');
      return;
    }

    if (departamentoOrigenSeleccionado === departamentoSeleccionado) {
      toast.info('Sélectionnez un département différent pour appliquer le changement');
      return;
    }

    const contactoActual = obtenerContactoCandidatoPorDepartamento(
      candidatoParaAssignar,
      departamentoOrigenSeleccionado
    );

    if (!contactoActual) {
      toast.error('Contact actuel introuvable pour le département sélectionné');
      return;
    }

    if (verificarCandidatoAsignado(candidatoParaAssignar, departamentoSeleccionado)) {
      const departamentoDestino = departamentosDisponibles.find(d => d.id === departamentoSeleccionado);
      toast.error(
        `${candidatoParaAssignar.name} est déjà assigné au département ${departamentoDestino?.nombre}!`
      );
      return;
    }

    const departamentoOrigen = departamentosDisponibles.find(d => d.id === departamentoOrigenSeleccionado);
    const departamentoDestino = departamentosDisponibles.find(d => d.id === departamentoSeleccionado);

    if (!departamentoOrigen || !departamentoDestino) {
      toast.error('Département non trouvé');
      return;
    }

    const evenementsActualizados = [
      ...(contactoActual.contacto.evenements || []),
      {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assignation_departement' as const,
        titre: 'Assignation modifiée depuis Recrutement',
        description: `Transféré de ${departamentoOrigen.nombre} vers ${departamentoDestino.nombre}`,
        date: new Date().toISOString(),
        utilisateur: 'Système',
        couleur: departamentoDestino.color
      }
    ];

    const actualizado = actualizarContacto(contactoActual.id, {
      departamentoId: departamentoSeleccionado,
      departamentoIds: [departamentoSeleccionado],
      cargo: candidatoParaAssignar.position,
      evenements: evenementsActualizados
    });

    if (!actualizado) {
      toast.error('Erreur lors de la modification de l\'assignation');
      return;
    }

    const departamentosActualizados = Array.from(new Set([
      ...(candidatoParaAssignar.departamentoIds || []).filter(id => id !== departamentoOrigenSeleccionado),
      departamentoSeleccionado
    ]));

    persistCandidateChanges(candidatoParaAssignar.id, {
      departamentoIds: departamentosActualizados,
      contactoId: contactoActual.id,
      numeroArchivo: contactoActual.contacto.numeroArchivo || candidatoParaAssignar.numeroArchivo,
      organismosAcreditadosIds: organismosAcreditadosSeleccionados
    });

    window.dispatchEvent(new CustomEvent('contactos-actualizados', {
      detail: { departamentoId: departamentoOrigenSeleccionado, contactoId: contactoActual.id }
    }));

    toast.success(
      `${candidatoParaAssignar.name} transféré vers ${departamentoDestino.nombre}`,
      {
        description: `Assignation mise à jour depuis ${departamentoOrigen.nombre}`,
        duration: 5000
      }
    );

    resetAssignationDialog();
  };

  const handleStartEditTimesheet = (timesheet: FeuilleTiempoCandidato) => {
    setEditingTimesheetId(timesheet.id);
    setTimesheetForm({
      departamentoId: timesheet.departamentoId,
      date: timesheet.date,
      heureDebut: timesheet.heureDebut,
      heureFin: timesheet.heureFin,
      notes: timesheet.notes || ''
    });
  };

  const handleSaveTimesheet = () => {
    if (!candidatoFeuilleTempsSeleccionado) {
      return;
    }

    const currentTimesheets = candidatoFeuilleTempsSeleccionado.feuillesTemps || [];
    const originalTimesheet = editingTimesheetId
      ? currentTimesheets.find(timesheet => timesheet.id === editingTimesheetId)
      : undefined;
    const isEditingActiveTimesheet = Boolean(originalTimesheet?.enCours);

    if (!timesheetForm.departamentoId || !timesheetForm.date || !timesheetForm.heureDebut || (!timesheetForm.heureFin && !isEditingActiveTimesheet)) {
      toast.error(t('recruitmentInternal.timesheets.toasts.fillRequired'));
      return;
    }

    const isOpenEntry = isEditingActiveTimesheet && !timesheetForm.heureFin;
    const duration = isOpenEntry ? 0 : calculateTimesheetDuration(timesheetForm.heureDebut, timesheetForm.heureFin);
    if (!isOpenEntry && duration <= 0) {
      toast.error(t('recruitmentInternal.timesheets.toasts.endAfterStart'));
      return;
    }

    const department = departamentosDisponibles.find(item => item.id === timesheetForm.departamentoId);
    if (!department) {
      toast.error(t('recruitmentInternal.timesheets.toasts.departmentNotFound'));
      return;
    }

    const nextTimesheetBase: FeuilleTiempoCandidato = {
      id: editingTimesheetId || Date.now(),
      departamentoId: timesheetForm.departamentoId,
      departement: department.nombre,
      date: timesheetForm.date,
      heureDebut: timesheetForm.heureDebut,
      heureFin: timesheetForm.heureFin,
      duree: duration,
      notes: timesheetForm.notes.trim(),
      enCours: isOpenEntry
    };

    const nextTimesheet = originalTimesheet
      ? {
          ...nextTimesheetBase,
          correctionHistory: buildTimesheetCorrectionHistory(originalTimesheet, nextTimesheetBase)
        }
      : nextTimesheetBase;

    const updatedTimesheets = editingTimesheetId
      ? currentTimesheets.map(timesheet =>
          timesheet.id === editingTimesheetId ? nextTimesheet : timesheet
        )
      : [nextTimesheet, ...currentTimesheets];

    const candidatoActualizado = persistCandidateChanges(candidatoFeuilleTempsSeleccionado.id, {
      feuillesTemps: updatedTimesheets
    });

    if (!candidatoActualizado) {
      toast.error(t('recruitmentInternal.timesheets.toasts.saveError'));
      return;
    }

    toast.success(
      editingTimesheetId
        ? isOpenEntry
          ? t('recruitmentInternal.timesheets.toasts.entryUpdated')
          : t('recruitmentInternal.timesheets.toasts.timesheetUpdated')
        : t('recruitmentInternal.timesheets.toasts.timesheetSaved', { duration: formatTimesheetHours(duration) })
    );

    resetTimesheetForm(candidatoActualizado);
  };

  const handleRegisterTimesheetEntry = () => {
    if (!candidatoFeuilleTempsSeleccionado) {
      return;
    }

    if (!timesheetForm.departamentoId || !timesheetForm.date) {
      toast.error(t('recruitmentInternal.timesheets.toasts.selectDepartmentAndDate'));
      return;
    }

    const hasActiveEntry = (candidatoFeuilleTempsSeleccionado.feuillesTemps || []).some(timesheet => timesheet.enCours);
    if (hasActiveEntry) {
      toast.error(t('recruitmentInternal.timesheets.toasts.activeEntryExists'));
      return;
    }

    const department = departamentosDisponibles.find(item => item.id === timesheetForm.departamentoId);
    if (!department) {
      toast.error(t('recruitmentInternal.timesheets.toasts.departmentNotFound'));
      return;
    }

    const heureDebut = timesheetForm.heureDebut || getCurrentLocalTime();
    const nextTimesheet: FeuilleTiempoCandidato = {
      id: Date.now(),
      departamentoId: timesheetForm.departamentoId,
      departement: department.nombre,
      date: timesheetForm.date,
      heureDebut,
      heureFin: '',
      duree: 0,
      notes: timesheetForm.notes.trim(),
      enCours: true
    };

    const candidatoActualizado = persistCandidateChanges(candidatoFeuilleTempsSeleccionado.id, {
      feuillesTemps: [nextTimesheet, ...(candidatoFeuilleTempsSeleccionado.feuillesTemps || [])]
    });

    if (!candidatoActualizado) {
      toast.error(t('recruitmentInternal.timesheets.toasts.entrySaveError'));
      return;
    }

    toast.success(t('recruitmentInternal.timesheets.toasts.entryRegisteredAt', { time: heureDebut }), {
      description: t('recruitmentInternal.timesheets.toasts.entryRegisteredDescription', { name: candidatoFeuilleTempsSeleccionado.name }),
      duration: 4000
    });

    resetTimesheetForm(candidatoActualizado);
  };

  const handleRegisterTimesheetExit = (timesheetId: number) => {
    if (!candidatoFeuilleTempsSeleccionado) {
      return;
    }

    const currentTimesheets = candidatoFeuilleTempsSeleccionado.feuillesTemps || [];
    const timesheet = currentTimesheets.find(item => item.id === timesheetId);
    if (!timesheet || !timesheet.enCours) {
      return;
    }

    const heureFin = getCurrentLocalTime();
    const duree = calculateTimesheetDuration(timesheet.heureDebut, heureFin);
    if (duree <= 0) {
      toast.error(t('recruitmentInternal.timesheets.toasts.exitAfterEntry'));
      return;
    }

    const candidatoActualizado = persistCandidateChanges(candidatoFeuilleTempsSeleccionado.id, {
      feuillesTemps: currentTimesheets.map(item =>
        item.id === timesheetId
          ? { ...item, heureFin, duree, enCours: false }
          : item
      )
    });

    if (!candidatoActualizado) {
      toast.error(t('recruitmentInternal.timesheets.toasts.exitSaveError'));
      return;
    }

    toast.success(t('recruitmentInternal.timesheets.toasts.exitRegistered', { duration: formatTimesheetHours(duree) }), {
      description: t('recruitmentInternal.timesheets.toasts.exitRegisteredDescription', {
        name: candidatoFeuilleTempsSeleccionado.name,
        start: timesheet.heureDebut,
        end: heureFin
      }),
      duration: 4000
    });
  };

  const handleDeleteTimesheet = (timesheetId: number) => {
    if (!candidatoFeuilleTempsSeleccionado) {
      return;
    }

    if (!window.confirm(t('recruitmentInternal.timesheets.toasts.confirmDelete'))) {
      return;
    }

    const updatedTimesheets = (candidatoFeuilleTempsSeleccionado.feuillesTemps || []).filter(
      timesheet => timesheet.id !== timesheetId
    );

    const candidatoActualizado = persistCandidateChanges(candidatoFeuilleTempsSeleccionado.id, {
      feuillesTemps: updatedTimesheets
    });

    if (!candidatoActualizado) {
      toast.error(t('recruitmentInternal.timesheets.toasts.deleteError'));
      return;
    }

    if (editingTimesheetId === timesheetId) {
      resetTimesheetForm(candidatoActualizado);
    }

    toast.success(t('recruitmentInternal.timesheets.toasts.deleteSuccess'));
  };

  // 🔄 SINCRONIZAR números de archivo desde contactos a candidatos
  useEffect(() => {
    const sincronizarCandidatos = () => {
      const candidatosActuales = obtenerCandidatos();
      const contactos = departamentosDisponibles.flatMap(dept => 
        obtenerContactosPorDepartamento(dept.id).map(contacto => ({
          ...contacto,
          _departamentoId: dept.id
        }))
      );
      let actualizado = false;
      
      const candidatosActualizados = candidatosActuales.map(candidate => {
        const contactosCoincidentes = contactos.filter(contacto => 
          contacto.email.toLowerCase() === candidate.email.toLowerCase() ||
          (
            contacto.nombre.toLowerCase() === candidate.name.split(' ')[0].toLowerCase() &&
            contacto.apellido.toLowerCase() === candidate.name.split(' ').slice(1).join(' ').toLowerCase()
          )
        );
        
        const departamentosContacto = Array.from(new Set(contactosCoincidentes.flatMap(contacto => 
          contacto.departamentoIds && contacto.departamentoIds.length > 0
            ? contacto.departamentoIds
            : [contacto._departamentoId]
        ))).sort();
        const departamentosActuales = [...(candidate.departamentoIds || [])].sort();
        const numeroArchivoContacto = contactosCoincidentes.find(contacto => contacto.numeroArchivo)?.numeroArchivo;
        const contactoPrincipal = contactosCoincidentes[0];
        const cambios: Partial<Candidate> = {};

        if ((numeroArchivoContacto || '') !== (candidate.numeroArchivo || '')) {
          console.log(`🔄 Sincronizando número de archivo para candidato ${candidate.name}: ${numeroArchivoContacto || '[vacío]'}`);
          cambios.numeroArchivo = numeroArchivoContacto || undefined;
          actualizado = true;
        }

        if (JSON.stringify(departamentosContacto) !== JSON.stringify(departamentosActuales)) {
          console.log(`🔄 Sincronizando departamentos para candidato ${candidate.name}:`, departamentosContacto);
          cambios.departamentoIds = departamentosContacto;
          actualizado = true;
        }

        if ((contactoPrincipal?.id || '') !== (candidate.contactoId || '')) {
          cambios.contactoId = contactoPrincipal?.id;
          actualizado = true;
        }

        if (Object.keys(cambios).length > 0) {
          return {
            ...candidate,
            ...cambios
          };
        }
        
        return candidate;
      });
      
      if (actualizado) {
        console.log('✅ Sincronización de candidatos actualizada');
        guardarCandidatos(candidatosActualizados);
        setCandidates(candidatosActualizados);
      }
    };
    
    // Ejecutar sincronización al montar el componente
    sincronizarCandidatos();
    
    // Escuchar cambios en contactos
    const handleContactosUpdate = () => {
      console.log('🔔 Recrutement: Evento contactos-actualizados recibido');
      sincronizarCandidatos();
    };
    
    window.addEventListener('contactos-actualizados', handleContactosUpdate);
    
    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosUpdate);
    };
  }, []);

  return (
    <div 
      className={`${isPublicAccess ? 'h-screen p-1 sm:p-2' : 'min-h-screen p-3 sm:p-4 md:p-6'} relative overflow-hidden`} 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
      }}
    >
      {/* Formas decorativas de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>

      {/* Conteneur principal avec glassmorphism */}
      <div className={`relative z-10 w-full ${isPublicAccess ? 'h-full max-w-[1500px]' : 'max-w-7xl'} mx-auto`}>
        <div 
          className={`backdrop-blur-xl bg-white/90 ${isPublicAccess ? 'rounded-2xl' : 'rounded-3xl'} shadow-2xl border border-white/60 ${isPublicAccess ? 'h-full flex flex-col p-2 sm:p-2.5' : 'p-4 sm:p-6 md:p-8'}`}
          style={{
            boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
          }}
        >
          {/* Header avec logo et titre */}
          {!isPublicAccess && (
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              {/* Glow effect detrás del logo */}
              <div 
                className="absolute inset-0 rounded-none blur-2xl opacity-30 animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
              {branding.logo ? (
                <AdaptiveBrandLogo
                  src={branding.logo}
                  alt="Logo"
                  wrapperClassName={`relative ${isPublicAccess ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-16 w-16 sm:h-20 sm:w-20'}`}
                  backgroundClassName="bg-white"
                  borderWidthClassName={isPublicAccess ? 'border-2' : 'border-4'}
                  shadowClassName="shadow-2xl"
                  containerStyle={{ borderColor: branding.primaryColor }}
                  imageStyle={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset' }}
                />
              ) : (
                <div 
                  className={`relative ${isPublicAccess ? 'h-12 w-12 sm:h-14 sm:w-14 border-2' : 'h-16 w-16 sm:h-20 sm:w-20 border-4'} rounded-[24px] flex items-center justify-center overflow-hidden shadow-2xl bg-white`}
                  style={{ borderColor: branding.primaryColor }}
                >
                  <div 
                    className="h-full w-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className={`${isPublicAccess ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'} font-bold`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      BA
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Título con icono y effet Sparkles */}
          {!isPublicAccess && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <UserPlus 
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
                {t('nav.recruitment')}
              </h1>
              <Sparkles 
                className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse"
                style={{ color: branding.secondaryColor }}
              />
            </div>
          )}

          {isPublicAccess && (
            <Card className="mb-1 overflow-hidden border-slate-200/90 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <CardContent
                className="px-2 py-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className="text-xs sm:text-sm font-bold"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: '#0F172A' }}
                    >
                      {t('recruitmentPublic.headerTitle')}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {t('recruitmentPublic.headerSubtitle')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = window.location.pathname;
                      }
                    }}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('recruitmentPublic.backHome')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadísticas */}
          {!isPublicAccess && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Total Candidats */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
                boxShadow: `0 4px 15px ${branding.primaryColor}40`
              }}
            >
              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">{t('recruitmentInternal.dashboard.totalCandidates')}</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.total}
                  </p>
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* En Attente */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)',
                boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">{t('recruitmentInternal.dashboard.pending')}</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.pending}
                  </p>
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Entretiens */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.4)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">{t('recruitmentInternal.dashboard.interviews')}</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.interview}
                  </p>
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Acceptés */}
            <div 
              className="p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                boxShadow: `0 4px 15px ${branding.secondaryColor}40`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className="relative">
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">{t('recruitmentInternal.dashboard.accepted')}</p>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300" 
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {stats.accepted}
                  </p>
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
          )}

          <Tabs value={mainView} onValueChange={(value) => setMainView(value as RecruitmentMainView)} className={`${isPublicAccess ? 'flex-1 min-h-0' : 'mb-6 gap-4'}`}>
            {!isPublicAccess && (
              <ModuleControlSurface>
                <ModuleControlSurfaceTabs>
                  <TabsList className="app-compact-tabs-grid w-full bg-transparent p-0">
                    <TabsTrigger
                      value="candidatures"
                      className="app-compact-tab-trigger py-3"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <Users className="w-4 h-4" />
                      {t('recruitmentInternal.tabs.candidates')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="reports"
                      className="app-compact-tab-trigger py-3"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <BarChart3 className="w-4 h-4" />
                      {t('recruitmentInternal.tabs.reports')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="timesheets"
                      className="app-compact-tab-trigger py-3"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <Clock className="w-4 h-4" />
                      {t('recruitmentInternal.tabs.timesheets')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="organisms"
                      className="app-compact-tab-trigger py-3"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <Building2 className="w-4 h-4" />
                      Organismes
                    </TabsTrigger>
                  </TabsList>
                </ModuleControlSurfaceTabs>
              </ModuleControlSurface>
            )}

            {!isPublicAccess && (
            <TabsContent value="candidatures" className="space-y-4">
              <div className={`grid grid-cols-1 ${candidatoParaPerfil ? 'xl:grid-cols-[minmax(360px,0.9fr)_minmax(420px,1.1fr)]' : ''} gap-4 items-start`}>
                <div className="space-y-4 min-w-0">
                  <Card className="border-gray-200/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10" style={{ color: branding.primaryColor }} />
                          <Input
                            placeholder={t('recruitmentInternal.candidates.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 border-gray-300 focus:border-[#1a4d7a] focus:ring-[#1a4d7a]"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger
                            className="w-full sm:w-56 h-11 border-gray-300"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder={t('recruitmentInternal.candidates.filterByStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('recruitmentInternal.statuses.all')}</SelectItem>
                            <SelectItem value="pending">{getCandidateStatusLabel('pending')}</SelectItem>
                            <SelectItem value="reviewed">{getCandidateStatusLabel('reviewed')}</SelectItem>
                            <SelectItem value="interview">{getCandidateStatusLabel('interview')}</SelectItem>
                            <SelectItem value="accepted">{getCandidateStatusLabel('accepted')}</SelectItem>
                            <SelectItem value="rejected">{getCandidateStatusLabel('rejected')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          className="h-11 px-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                          style={{
                            background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                            fontFamily: 'Montserrat, sans-serif',
                            boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                          }}
                          onClick={handleAbrirNuevoCandidato}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <span className="relative flex items-center">
                            <UserPlus className="w-5 h-5 mr-2" />
                            {t('recruitmentInternal.candidates.newCandidate')}
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className={`grid grid-cols-1 ${candidatoParaPerfil ? 'gap-3' : 'md:grid-cols-2 2xl:grid-cols-3 gap-3'}`}>
                {filteredCandidates.map((candidate, index) => {
                  const cardColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
                  const numeroArchivo = obtenerNumeroArchivoCandidato(candidate);
                  const isSelected = candidatoParaPerfil?.id === candidate.id;
                  const organismosExternosAsignados = obtenerOrganismosAcreditadosAsignados(candidate);

                  return (
                    <Card
                      key={candidate.id}
                      className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-gray-200/50 overflow-hidden group ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
                      style={isSelected ? { borderColor: `${cardColor}55`, boxShadow: `0 0 0 1px ${cardColor}25` } : undefined}
                    >
                      <div
                        className="h-1 w-full"
                        style={{
                          background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}dd 100%)`
                        }}
                      />

                      <CardHeader className="px-4 pb-2 pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="h-10 w-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                              style={{
                                background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                                boxShadow: `0 4px 12px ${cardColor}30`
                              }}
                            >
                              {candidate.foto ? (
                                <ImageWithFallback
                                  src={candidate.foto}
                                  alt={candidate.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold">
                                  {getCandidateInitials(candidate.name || 'BA')}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle
                                className="text-[15px] sm:text-base truncate leading-tight"
                                style={{
                                  fontFamily: 'Montserrat, sans-serif',
                                  color: '#333333'
                                }}
                              >
                                {candidate.name}
                              </CardTitle>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#666666]">
                                <span className="truncate font-medium">{getLocalizedCandidatePosition(candidate.position)}</span>
                                {numeroArchivo && (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 font-mono font-semibold tracking-wide"
                                    style={{ color: branding.primaryColor }}
                                  >
                                    <FileText className="w-3 h-3" style={{ color: branding.primaryColor }} />
                                    {numeroArchivo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(candidate.status)}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 px-4 pb-4 pt-0">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cardColor }} />
                            <span className="truncate">{candidate.email}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cardColor }} />
                            <span className="truncate">{candidate.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cardColor }} />
                            <span className="truncate">{formatLocalizedDate(candidate.applicationDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cardColor }} />
                            <span className="truncate">{getLocalizedCandidateAvailability(candidate.availability)}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                          <Briefcase className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: cardColor }} />
                          <span className="line-clamp-2 leading-5">{getLocalizedCandidateExperience(candidate.experience)}</span>
                        </div>

                        {candidate.departamentoIds && candidate.departamentoIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200/50 px-2.5 py-2">
                            <span className="text-[11px] font-medium text-[#666666] flex items-center gap-1">
                              <Users className="w-3 h-3" style={{ color: branding.primaryColor }} />
                              {t('recruitmentInternal.candidates.assignedDepartments')}
                            </span>
                            {candidate.departamentoIds.map(deptId => {
                              const dept = departamentosDisponibles.find(d => d.id === deptId);
                              if (!dept) return null;
                              return (
                                <Badge
                                  key={deptId}
                                  className="text-[11px] px-2 py-0.5 border-0 shadow-sm"
                                  style={{
                                    backgroundColor: `${dept.color}15`,
                                    color: dept.color,
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 600
                                  }}
                                >
                                  <span className="mr-1">{dept.icono}</span>
                                  {dept.nombre}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        {organismosExternosAsignados.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 rounded-lg border border-emerald-200/70 bg-emerald-50/80 px-2.5 py-2">
                            <span className="text-[11px] font-medium text-[#666666] flex items-center gap-1">
                              <Building2 className="w-3 h-3" style={{ color: branding.secondaryColor }} />
                              Organismes accrédités :
                            </span>
                            {organismosExternosAsignados.map((organismo) => (
                              <Badge
                                key={organismo.id}
                                className="text-[11px] px-2 py-0.5 border-0 shadow-sm"
                                style={{
                                  backgroundColor: `${branding.secondaryColor}15`,
                                  color: branding.secondaryColor,
                                  fontFamily: 'Montserrat, sans-serif',
                                  fontWeight: 600
                                }}
                              >
                                {organismo.nombre}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2 pt-2 border-t border-gray-200">
                          <div className="flex gap-2">
                            {(() => {
                              const tieneContacto = obtenerContactoCandidato(candidate);

                              if (tieneContacto) {
                                return (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 hover:scale-105 transition-all duration-300"
                                      style={{
                                        fontFamily: 'Montserrat, sans-serif',
                                        color: branding.primaryColor,
                                        borderColor: `${branding.primaryColor}40`,
                                        backgroundColor: `${branding.primaryColor}10`
                                      }}
                                      onClick={() => abrirDialogoAssignacion(candidate, 'modify')}
                                      title={t('recruitmentInternal.candidates.modifyDepartmentAssignment')}
                                    >
                                      <ArrowRightLeft className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 hover:scale-105 transition-all duration-300 hover:bg-orange-50 border-2"
                                      style={{
                                        fontFamily: 'Montserrat, sans-serif',
                                        color: '#ff6b35',
                                        borderColor: '#ff6b35'
                                      }}
                                      onClick={() => handleEliminarContacto(candidate)}
                                      title={t('recruitmentInternal.candidates.removeDepartmentContact')}
                                    >
                                      <UserMinus className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                );
                              }

                              return (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2.5 hover:scale-105 transition-all duration-300"
                                  style={{
                                    fontFamily: 'Montserrat, sans-serif',
                                    color: branding.secondaryColor,
                                    borderColor: `${branding.secondaryColor}40`,
                                    backgroundColor: `${branding.secondaryColor}10`
                                  }}
                                  onClick={() => abrirDialogoAssignacion(candidate, 'assign')}
                                  title={t('recruitmentInternal.candidates.assignDepartment')}
                                >
                                  <Link className="w-3.5 h-3.5" />
                                </Button>
                              );
                            })()}

                            <Select
                              value={candidate.status}
                              onValueChange={(value) => handleStatusChange(candidate.id, value)}
                            >
                              <SelectTrigger
                                className="flex-1 h-8 text-xs border-gray-300"
                                style={{ fontFamily: 'Roboto, sans-serif' }}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{getCandidateStatusLabel('pending')}</SelectItem>
                                <SelectItem value="reviewed">{getCandidateStatusLabel('reviewed')}</SelectItem>
                                <SelectItem value="interview">{getCandidateStatusLabel('interview')}</SelectItem>
                                <SelectItem value="accepted">{getCandidateStatusLabel('accepted')}</SelectItem>
                                <SelectItem value="rejected">{getCandidateStatusLabel('rejected')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 flex-1 hover:scale-[1.01] transition-all duration-300"
                              style={{
                                fontFamily: 'Montserrat, sans-serif',
                                color: cardColor,
                                borderColor: `${cardColor}30`
                              }}
                              onClick={() => {
                                setCandidatoParaPerfil(prev => prev?.id === candidate.id ? null : candidate);
                              }}
                              title={t('recruitmentInternal.candidates.viewProfile')}
                            >
                              <FileText className="w-3.5 h-3.5 mr-1.5" />
                              {t('recruitmentInternal.candidates.profile')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 hover:scale-105 transition-all duration-300 hover:bg-blue-50 border-2"
                              style={{
                                fontFamily: 'Montserrat, sans-serif',
                                color: '#1a4d7a',
                                borderColor: '#1a4d7a'
                              }}
                              onClick={() => handleAbrirEdicion(candidate)}
                              title={t('recruitmentInternal.candidates.editCandidate')}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 hover:scale-105 transition-all duration-300 hover:bg-red-50 border-2"
                              style={{
                                fontFamily: 'Montserrat, sans-serif',
                                color: '#DC3545',
                                borderColor: '#DC3545'
                              }}
                              onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                              title={t('recruitmentInternal.candidates.deleteCandidate')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                  </div>

                  {filteredCandidates.length === 0 && (
                    <Card className="border-gray-200/50">
                      <CardContent className="p-12 text-center">
                        <div
                          className="inline-flex p-6 rounded-full mb-4"
                          style={{
                            background: `linear-gradient(135deg, ${branding.primaryColor}20 0%, ${branding.secondaryColor}20 100%)`
                          }}
                        >
                          <Users className="w-16 h-16" style={{ color: branding.primaryColor }} />
                        </div>
                        <p
                          className="text-xl font-semibold mb-2"
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            color: branding.primaryColor
                          }}
                        >
                          {t('recruitmentInternal.candidates.noCandidateFound')}
                        </p>
                        <p className="text-[#666666] text-sm">
                          {t('recruitmentInternal.candidates.adjustSearch')}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {candidatoParaPerfil && (
                  <div className="min-w-0">
                    {renderCandidateProfilePanel()}
                  </div>
                )}
              </div>
            </TabsContent>
            )}

            {!isPublicAccess && (
            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
                <div className="space-y-4 min-w-0">
                  <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div
                        className="p-4 sm:p-5"
                        style={{
                          background: `linear-gradient(135deg, ${branding.primaryColor}10 0%, ${branding.secondaryColor}10 100%)`
                        }}
                      >
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                          <div>
                            <h2
                              className="text-xl font-bold flex items-center gap-2"
                              style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                            >
                              <BarChart3 className="w-5 h-5" />
                              {t('recruitmentInternal.reports.ui.title')}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                              {t('recruitmentInternal.reports.ui.description')}
                            </p>
                          </div>
                          <div className="flex flex-col gap-3 w-full xl:w-auto xl:items-end">
                            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-5 gap-3 w-full">
                            <Select value={reportYearFilter} onValueChange={setReportYearFilter}>
                              <SelectTrigger className="w-full bg-white/90 border-white/70" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Calendar className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t('recruitmentInternal.reports.ui.filterByYear')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{t('recruitmentInternal.reports.ui.allYears')}</SelectItem>
                                {reportYearOptions.map(year => (
                                  <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={reportStartDate}
                              onChange={(e) => setReportStartDate(e.target.value)}
                              max={reportEndDate || undefined}
                              className="w-full bg-white/90 border-white/70"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            />
                            <Input
                              type="date"
                              value={reportEndDate}
                              onChange={(e) => setReportEndDate(e.target.value)}
                              min={reportStartDate || undefined}
                              className="w-full bg-white/90 border-white/70"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            />
                            <Select value={reportVolunteerFilter} onValueChange={setReportVolunteerFilter}>
                              <SelectTrigger className="w-full bg-white/90 border-white/70" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Users className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t('recruitmentInternal.reports.ui.filterByVolunteer')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{t('recruitmentInternal.reports.ui.allVolunteers')}</SelectItem>
                                {reportVolunteerOptions.map(option => (
                                  <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={reportDepartmentFilter} onValueChange={setReportDepartmentFilter}>
                              <SelectTrigger className="w-full bg-white/90 border-white/70" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t('recruitmentInternal.reports.ui.filterByDepartment')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{t('recruitmentInternal.reports.ui.allDepartments')}</SelectItem>
                                {reportDepartmentOptions.map(option => (
                                  <SelectItem key={option.id} value={option.id}>{option.nombre}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 xl:justify-end w-full">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setReportYearFilter('all');
                                setReportStartDate('');
                                setReportEndDate('');
                                setReportVolunteerFilter('all');
                                setReportDepartmentFilter('all');
                              }}
                              className="bg-white/90 border-white/70 w-full sm:w-auto"
                              style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                            >
                              {t('recruitmentInternal.reports.ui.reset')}
                            </Button>
                            <Button
                              onClick={handleExportRecruitmentReport}
                              className="text-white w-full sm:w-auto"
                              style={{
                                backgroundColor: branding.primaryColor,
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {t('recruitmentInternal.reports.ui.exportReport')}
                            </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card className="border-gray-200/50 shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.reports.cards.totalApplications')}</p>
                        <p className="text-3xl font-bold" style={{ color: branding.primaryColor }}>{stats.total}</p>
                        <p className="text-sm text-gray-500 mt-2">{t('recruitmentInternal.reports.cards.totalApplicationsHint')}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200/50 shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.reports.cards.assigned')}</p>
                        <p className="text-3xl font-bold" style={{ color: branding.secondaryColor }}>{candidatsAssignes.length}</p>
                        <p className="text-sm text-gray-500 mt-2">{t('recruitmentInternal.reports.cards.assignedHint')}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200/50 shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.reports.cards.timesheets')}</p>
                        <p className="text-3xl font-bold text-amber-600">{reportEntreesTotales}</p>
                        <p className="text-sm text-gray-500 mt-2">{t('recruitmentInternal.reports.cards.timesheetsHint')}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200/50 shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.reports.cards.accumulatedHours')}</p>
                        <p className="text-3xl font-bold text-emerald-600">{formatTimesheetHours(reportHeuresTotales)}</p>
                        <p className="text-sm text-gray-500 mt-2">{t('recruitmentInternal.reports.cards.accumulatedHoursHint')}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200/50 shadow-sm">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500 mb-1">Organismes accrédités liés</p>
                        <p className="text-3xl font-bold" style={{ color: branding.secondaryColor }}>{organismosAcreditadosConBenevoles.length}</p>
                        <p className="text-sm text-gray-500 mt-2">{totalAssignationsOrganismosAcreditados} liaison(s) bénévole-organisme</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-4">
                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          {t('recruitmentInternal.reports.ui.hoursByYear')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {reportYearStats.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            {t('recruitmentInternal.reports.ui.noAnnualData')}
                          </div>
                        ) : (
                          <>
                            <div className="h-[180px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportYearStats} margin={{ top: 4, right: 4, left: -20, bottom: 18 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                  <XAxis dataKey="annee" tick={{ fill: '#666666', fontSize: 10 }} height={26} />
                                  <YAxis width={26} tick={{ fill: '#666666', fontSize: 10 }} />
                                  <Tooltip
                                    formatter={(value: number) => [formatTimesheetHours(Number(value)), t('recruitmentInternal.reports.ui.hoursLabel')]}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                  />
                                  <Bar dataKey="heures" fill={branding.primaryColor} radius={[8, 8, 0, 0]} maxBarSize={38} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                            {reportYearStats.map(item => (
                              <div
                                key={item.annee}
                                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                                style={reportYearFilter === item.annee ? { boxShadow: `0 0 0 1px ${branding.primaryColor}30`, borderColor: `${branding.primaryColor}55` } : undefined}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      {item.annee}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {t('recruitmentInternal.reports.ui.yearSummary', {
                                        entries: item.feuilles,
                                        volunteers: item.benevoles,
                                        departments: item.departements
                                      })}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.hoursLabel')}</p>
                                    <p className="font-semibold" style={{ color: branding.primaryColor }}>
                                      {formatTimesheetHours(item.heures)}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                  <div className="rounded-lg bg-white/80 px-2 py-2">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">{t('recruitmentPublic.entries')}</p>
                                    <p className="text-sm font-semibold text-gray-700">{item.feuilles}</p>
                                  </div>
                                  <div className="rounded-lg bg-white/80 px-2 py-2">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">{t('recruitmentPublic.volunteers')}</p>
                                    <p className="text-sm font-semibold text-gray-700">{item.benevoles}</p>
                                  </div>
                                  <div className="rounded-lg bg-white/80 px-2 py-2">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">{t('recruitmentInternal.reports.ui.departmentsLabel')}</p>
                                    <p className="text-sm font-semibold text-gray-700">{item.departements}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          {t('recruitmentInternal.reports.ui.globalState')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
                          <p className="text-xs text-gray-500">{getCandidateStatusLabel('pending')}</p>
                          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
                          <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.inInterview')}</p>
                          <p className="text-2xl font-bold text-sky-600">{stats.interview}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
                          <p className="text-xs text-gray-500">{t('recruitmentInternal.dashboard.accepted')}</p>
                          <p className="text-2xl font-bold text-emerald-600">{stats.accepted}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
                          <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.unassigned')}</p>
                          <p className="text-2xl font-bold text-rose-600">{candidatsSansAssignation.length}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
                          <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.withTimesheets')}</p>
                          <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>{reportVolunteerActifs}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          {t('recruitmentInternal.reports.ui.hoursByDepartment')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {reportDepartmentStats.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            {t('recruitmentInternal.reports.ui.noDepartmentData')}
                          </div>
                        ) : (
                          <>
                            <div className="h-[180px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportDepartmentChartData} margin={{ top: 4, right: 4, left: -20, bottom: 34 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                  <XAxis dataKey="nom" tick={{ fill: '#666666', fontSize: 10 }} angle={-18} textAnchor="end" height={46} interval={0} />
                                  <YAxis width={26} tick={{ fill: '#666666', fontSize: 10 }} />
                                  <Tooltip
                                    formatter={(value: number) => [formatTimesheetHours(Number(value)), t('recruitmentInternal.reports.ui.hoursLabel')]}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                  />
                                  <Bar dataKey="heures" fill={branding.secondaryColor} radius={[8, 8, 0, 0]} maxBarSize={34} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                            {reportDepartmentStats.map(item => (
                              <div
                                key={item.id}
                                className="rounded-xl border px-4 py-3"
                                style={{ borderColor: `${item.color}35`, backgroundColor: `${item.color}08` }}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      <span className="mr-2">{item.icono}</span>
                                      {item.nom}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {t('recruitmentInternal.reports.ui.departmentSummary', {
                                        entries: item.feuilles,
                                        volunteers: item.benevoles
                                      })}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.hoursLabel')}</p>
                                    <p className="font-semibold" style={{ color: item.color }}>
                                      {formatTimesheetHours(item.heures)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          {t('recruitmentInternal.reports.ui.hoursByVolunteer')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {reportVolunteerStats.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            {t('recruitmentInternal.reports.ui.noVolunteerData')}
                          </div>
                        ) : (
                          <>
                            <div className="h-[180px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportVolunteerChartData} margin={{ top: 4, right: 4, left: -20, bottom: 34 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                  <XAxis dataKey="nom" tick={{ fill: '#666666', fontSize: 10 }} angle={-18} textAnchor="end" height={46} interval={0} />
                                  <YAxis width={26} tick={{ fill: '#666666', fontSize: 10 }} />
                                  <Tooltip
                                    formatter={(value: number) => [formatTimesheetHours(Number(value)), t('recruitmentInternal.reports.ui.hoursLabel')]}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                  />
                                  <Bar dataKey="heures" fill="#D97706" radius={[8, 8, 0, 0]} maxBarSize={34} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                            {reportVolunteerStats.map(item => (
                              <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-[#333333] truncate">{item.nom}</p>
                                    <p className="text-xs text-gray-500 truncate">{t('recruitmentInternal.reports.ui.volunteerSummary', {
                                      email: item.email || t('recruitmentInternal.reports.ui.noEmail'),
                                      entries: item.feuilles,
                                      departments: item.departements
                                    })}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.hoursLabel')}</p>
                                    <p className="text-sm font-semibold" style={{ color: branding.primaryColor }}>
                                      {formatTimesheetHours(item.heures)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          {t('recruitmentInternal.reports.ui.recentCandidates')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {recentCandidates.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            {t('recruitmentInternal.reports.ui.noRecentCandidates')}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {recentCandidates.map(candidate => (
                              <div key={candidate.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3">
                                <div className="min-w-0 flex items-center gap-3">
                                  <div
                                    className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold shrink-0"
                                    style={{ backgroundColor: branding.primaryColor }}
                                  >
                                    {candidate.foto ? (
                                      <ImageWithFallback
                                        src={candidate.foto}
                                        alt={candidate.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      getCandidateInitials(candidate.name || 'BA')
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-[#333333] truncate">{candidate.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{getLocalizedCandidatePosition(candidate.position)} • {formatLocalizedDate(candidate.applicationDate)}</p>
                                  </div>
                                </div>
                                {getStatusBadge(candidate.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          {t('recruitmentInternal.reports.ui.latestTimesheets')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {recentTimesheetEntries.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                            {t('recruitmentInternal.reports.ui.noRecentTimesheets')}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {recentTimesheetEntries.map(timesheet => (
                              <div key={timesheet.id} className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-[#333333] truncate">{timesheet.candidateName}</p>
                                    <p className="text-xs text-gray-500 truncate">{timesheet.departement} • {timesheet.date}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.duration')}</p>
                                    <p className="text-sm font-semibold" style={{ color: branding.primaryColor }}>
                                      {formatTimesheetHours(timesheet.duree)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4 min-w-0">
                  <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        {t('recruitmentInternal.reports.ui.controlPoints')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.assignmentRate')}</p>
                        <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                          {stats.total > 0 ? `${Math.round((candidatsAssignes.length / stats.total) * 100)}%` : '0%'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.acceptanceRate')}</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {stats.total > 0 ? `${Math.round((stats.accepted / stats.total) * 100)}%` : '0%'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">{t('recruitmentInternal.reports.ui.averageHoursPerEntry')}</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {reportEntreesTotales > 0 ? formatTimesheetHours(reportHeuresTotales / reportEntreesTotales) : '0h 00m'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">Accrédités avec bénévoles</p>
                        <p className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>{organismosAcreditadosConBenevoles.length}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        Organismes accrédités suivis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {organismosAcreditadosConBenevoles.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                          Aucun organisme accrédité n'est encore lié à un bénévole recruté.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {organismosAcreditadosConBenevoles.slice(0, 6).map((organismo) => (
                            <div key={organismo.id} className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-[#333333] truncate">{organismo.nombre}</p>
                                  <p className="text-xs text-gray-500 truncate">{organismo.tipo}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Bénévoles</p>
                                  <p className="text-sm font-semibold" style={{ color: branding.secondaryColor }}>{organismo.benevoles}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            )}

            {!isPublicAccess && (
            <TabsContent value="organisms" className="space-y-4">
              <div className="space-y-4">
                <Card className="overflow-hidden border-0 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${branding.primaryColor}12 0%, ${branding.secondaryColor}12 55%, #ffffff 100%)`
                        }}
                      />
                      <div
                        className="absolute -right-12 top-0 h-40 w-40 rounded-full blur-3xl"
                        style={{ backgroundColor: `${branding.secondaryColor}20` }}
                      />
                      <div
                        className="absolute left-8 top-8 h-24 w-24 rounded-full blur-2xl"
                        style={{ backgroundColor: `${branding.primaryColor}18` }}
                      />
                      <div className="relative space-y-5 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="max-w-3xl space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                              <Building2 className="h-3.5 w-3.5" style={{ color: branding.primaryColor }} />
                              Réseau externe recrutement
                            </div>
                            <div>
                              <h3 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                                Organismes accrédités, organisés pour l'assignation rapide
                              </h3>
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Cette vue concentre les profils utiles au recrutement externe : état d'activation, niveau d'usage, coordonnées et accès rapide à la fiche organisme.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge className="border-0 bg-white/85 px-3 py-1 text-slate-700 shadow-sm">Formulaire Liaison réutilisé</Badge>
                              <Badge className="border-0 bg-white/85 px-3 py-1 text-slate-700 shadow-sm">Stockage distinct Recrutement</Badge>
                              <Badge className="border-0 bg-white/85 px-3 py-1 text-slate-700 shadow-sm">Assignations bénévoles externes</Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 sm:min-w-[260px]">
                            <Button
                              onClick={handleOpenCreateRecruitmentOrganism}
                              className="h-11 rounded-2xl text-white shadow-lg"
                              style={{ backgroundColor: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t('organisms.newOrganism')}
                            </Button>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Vue active</p>
                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {organismosAcreditadosFiltrados.length} organisme(s) visible(s)
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Triés par usage réel puis par disponibilité.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
                            <p className="mt-1 text-3xl font-bold" style={{ color: branding.primaryColor }}>{organismosAcreditados.length}</p>
                            <p className="mt-1 text-xs text-slate-500">Répertoire complet recrutement</p>
                          </div>
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">Actifs</p>
                            <p className="mt-1 text-3xl font-bold text-emerald-600">{organismosAcreditadosActivos.length}</p>
                            <p className="mt-1 text-xs text-slate-500">Disponibles immédiatement</p>
                          </div>
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">Liés</p>
                            <p className="mt-1 text-3xl font-bold" style={{ color: branding.secondaryColor }}>{organismosAcreditadosConBenevoles.length}</p>
                            <p className="mt-1 text-xs text-slate-500">Avec bénévoles déjà affectés</p>
                          </div>
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">Inactifs</p>
                            <p className="mt-1 text-3xl font-bold text-slate-600">{organismosAcreditadosInactivos}</p>
                            <p className="mt-1 text-xs text-slate-500">À réviser avant usage</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200/60 shadow-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="relative flex-1 xl:max-w-xl">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={organismSearchTerm}
                          onChange={(event) => setOrganismSearchTerm(event.target.value)}
                          placeholder="Rechercher par organisme, type, responsable, email ou quartier"
                          className="h-11 rounded-2xl border-slate-200 bg-slate-50/80 pl-10"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'all', label: 'Tous' },
                          { key: 'active', label: 'Actifs' },
                          { key: 'linked', label: 'Liés' },
                          { key: 'inactive', label: 'Inactifs' },
                        ].map((option) => {
                          const isActive = organismFilter === option.key;

                          return (
                            <Button
                              key={option.key}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-full px-4"
                              style={isActive
                                ? {
                                    backgroundColor: `${branding.primaryColor}12`,
                                    borderColor: `${branding.primaryColor}55`,
                                    color: branding.primaryColor,
                                    fontFamily: 'Montserrat, sans-serif',
                                  }
                                : { fontFamily: 'Montserrat, sans-serif' }}
                              onClick={() => setOrganismFilter(option.key as 'all' | 'active' | 'linked' | 'inactive')}
                            >
                              {option.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Filter className="h-3.5 w-3.5" />
                      <span>{organismosAcreditadosFiltrados.length} carte(s) affichée(s)</span>
                      <span>•</span>
                      <span>{organismosAcreditadosSinBenevoles} organisme(s) sans bénévole affecté</span>
                      <span>•</span>
                      <span>{organismosAcreditadosSinCoordonnees} fiche(s) sans coordonnées directes</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] items-start">
                  <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-white/90 pb-3">
                      <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        Organismes disponibles pour les assignations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {organismosAcreditadosFiltrados.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                          Aucun organisme ne correspond aux filtres actuels.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                          {organismosAcreditadosFiltrados.map((organismo, index) => {
                            const cardColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
                            const inicialesOrganismo = organismo.nombre
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((fragmento) => fragmento.charAt(0).toUpperCase())
                              .join('') || 'OR';
                            const organismoAccessKey = normalizarClaveAcceso(organismo.claveAcceso || '');

                            return (
                              <Card
                                key={organismo.id}
                                className="overflow-hidden border-slate-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                              >
                                <div
                                  className="h-1 w-full"
                                  style={{
                                    background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}dd 100%)`
                                  }}
                                />
                                <CardHeader className="px-4 pb-2 pt-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <div
                                        className="h-12 w-12 overflow-hidden rounded-none flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0 bg-white"
                                        style={{
                                          background: organismo.logo ? '#FFFFFF' : `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                                          boxShadow: `0 4px 12px ${cardColor}30`
                                        }}
                                      >
                                        {organismo.logo ? (
                                          <img
                                            src={organismo.logo}
                                            alt={`Profil de ${organismo.nombre}`}
                                            className="h-full w-full object-contain p-1"
                                          />
                                        ) : (
                                          inicialesOrganismo
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <CardTitle
                                          className="text-[15px] sm:text-base leading-tight break-words whitespace-normal"
                                          style={{
                                            fontFamily: 'Montserrat, sans-serif',
                                            color: '#333333'
                                          }}
                                        >
                                          {organismo.nombre}
                                        </CardTitle>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#666666]">
                                          <span className="font-medium break-words whitespace-normal">{organismo.tipo || 'Organisme partenaire'}</span>
                                          {organismo.responsable ? (
                                            <span className="rounded-full bg-slate-50 px-2 py-0.5 break-words whitespace-normal">
                                              {organismo.responsable}
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge
                                      className="border-0"
                                      style={{
                                        backgroundColor: organismo.activo ? '#DCFCE7' : '#F3F4F6',
                                        color: organismo.activo ? '#166534' : '#6B7280'
                                      }}
                                    >
                                      {organismo.activo ? 'Actif' : 'Inactif'}
                                    </Badge>
                                  </div>
                                </CardHeader>

                                <CardContent className="space-y-3 px-4 pb-4 pt-0">
                                  <div
                                    className="rounded-xl p-3"
                                    style={{
                                      background: `linear-gradient(135deg, ${cardColor}12 0%, ${branding.secondaryColor}10 100%)`
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className="text-xs text-gray-500">Bénévoles assignés</p>
                                        <p className="text-xl font-bold" style={{ color: cardColor }}>{organismo.benevolesAsignados}</p>
                                      </div>
                                      <Badge className="border-0 bg-blue-50 text-blue-700">
                                        {organismo.benevolesAsignados} bénévole(s)
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                                      <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cardColor }} />
                                      <span className="break-all whitespace-normal">{organismo.email || 'Aucun email'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                                      <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cardColor }} />
                                      <span className="break-words whitespace-normal">{organismo.telefono || 'Aucun téléphone'}</span>
                                    </div>
                                  </div>

                                  {(organismo.direccion || organismo.quartier || organismo.codigoPostal || organismo.zona) ? (
                                    <div className="flex items-start gap-2 rounded-lg bg-gray-50/70 px-2.5 py-2 text-xs text-[#666666]">
                                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: cardColor }} />
                                      <div className="space-y-0.5">
                                        {organismo.direccion ? <p className="font-medium text-[#333333]">{organismo.direccion}</p> : null}
                                        <p>
                                          {[organismo.quartier, organismo.codigoPostal, organismo.zona].filter(Boolean).join(' • ') || 'Localisation non renseignée'}
                                        </p>
                                      </div>
                                    </div>
                                  ) : null}

                                  {organismo.notas ? (
                                    <div className="rounded-lg border-l-4 bg-slate-50/80 px-3 py-2" style={{ borderLeftColor: cardColor }}>
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Profil</p>
                                      <p className="mt-1 text-xs leading-5 text-[#666666] whitespace-pre-wrap break-words">{organismo.notas}</p>
                                    </div>
                                  ) : null}

                                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Accès distant feuille de temps</p>
                                    <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                      <span className="rounded-md bg-white px-2 py-1 font-mono text-[11px] text-slate-700 break-all">
                                        {organismoAccessKey || (isFoodBankOrganism(organismo) ? 'Accès direct' : 'Clé non disponible')}
                                      </span>
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-2.5"
                                          style={{
                                            fontFamily: 'Montserrat, sans-serif',
                                            color: cardColor,
                                            borderColor: `${cardColor}30`
                                          }}
                                          onClick={() => handleCopyRemoteTimesheetLinkForOrganism(organismo)}
                                          disabled={!organismoAccessKey && !isFoodBankOrganism(organismo)}
                                          title={!organismoAccessKey && !isFoodBankOrganism(organismo) ? 'Clé d\'accès indisponible' : 'Copier le lien personnalisé'}
                                        >
                                          <Copy className="h-3.5 w-3.5 sm:mr-1.5" />
                                          <span className="hidden sm:inline">Copier</span>
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-2.5"
                                          style={{
                                            fontFamily: 'Montserrat, sans-serif',
                                            color: cardColor,
                                            borderColor: `${cardColor}30`
                                          }}
                                          onClick={() => handleOpenRemoteTimesheetForOrganism(organismo)}
                                          disabled={!organismoAccessKey && !isFoodBankOrganism(organismo)}
                                          title={!organismoAccessKey && !isFoodBankOrganism(organismo) ? 'Clé d\'accès indisponible' : 'Ouvrir le lien personnalisé'}
                                        >
                                          <ExternalLink className="h-3.5 w-3.5 sm:mr-1.5" />
                                          <span className="hidden sm:inline">Ouvrir</span>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 flex-1 hover:scale-[1.01] transition-all duration-300"
                                      style={{
                                        fontFamily: 'Montserrat, sans-serif',
                                        color: cardColor,
                                        borderColor: `${cardColor}30`
                                      }}
                                      onClick={() => handleViewRecruitmentOrganismProfile(organismo)}
                                    >
                                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                                      Voir profil
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 hover:scale-105 transition-all duration-300 hover:bg-blue-50 border-2"
                                      style={{
                                        fontFamily: 'Montserrat, sans-serif',
                                        color: '#1a4d7a',
                                        borderColor: '#1a4d7a'
                                      }}
                                      onClick={() => handleEditRecruitmentOrganism(organismo)}
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2.5 hover:scale-105 transition-all duration-300 hover:bg-red-50 border-2"
                                      style={{
                                        fontFamily: 'Montserrat, sans-serif',
                                        color: '#DC3545',
                                        borderColor: '#DC3545'
                                      }}
                                      onClick={() => handleDeleteRecruitmentOrganism(organismo)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3 border-b border-slate-100 bg-white/90">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          Vue rapide
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">Assignations</p>
                            <p className="mt-1 text-2xl font-bold" style={{ color: branding.secondaryColor }}>{totalAssignationsOrganismosAcreditados}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-wide text-slate-400">Sans contact</p>
                            <p className="mt-1 text-2xl font-bold text-amber-600">{organismosAcreditadosSinCoordonnees}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <p className="text-sm font-semibold text-slate-700">Lecture recommandée</p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Les cartes liées à au moins un bénévole remontent en premier. Utilise les filtres pour isoler rapidement les organismes à activer ou à compléter avant affectation.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                      <CardHeader className="pb-3 border-b border-slate-100 bg-white/90">
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          Priorités d'assignation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        {organismosAcreditadosEnriquecidos.slice(0, 5).map((organismo) => (
                          <div key={organismo.id} className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 break-words whitespace-normal">{organismo.nombre}</p>
                                <p className="mt-1 text-xs text-slate-500 break-words whitespace-normal">
                                  {[organismo.tipo, organismo.quartier].filter(Boolean).join(' • ') || 'Profil à compléter'}
                                </p>
                              </div>
                              <Badge className="border-0 bg-blue-50 text-blue-700">
                                {organismo.benevolesAsignados}
                              </Badge>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${Math.min(100, organismo.benevolesAsignados * 20 || (organismo.activo ? 12 : 6))}%`,
                                  background: `linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <FormularioOrganismoCompacto
                abierto={organismoDialogOpen}
                onCerrar={resetRecruitmentOrganismForm}
                formulario={organismoRecrutementForm}
                setFormulario={setOrganismoRecrutementForm}
                modoEdicion={modoEdicionOrganismo}
                modoVisualizacion={modoVisualizacionOrganismo}
                ocultarPestanaServicios
                soloClasificacionRegular
                onGuardar={handleSaveRecruitmentOrganism}
                tiposOrganismo={tiposOrganismoRecrutement}
                encabezadoExtra={organismoRecrutementSeleccionado ? (
                  <div className="overflow-hidden rounded-[28px] border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.10)_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-md">
                    <div className="border-b border-white/15 px-5 py-4">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[20px] bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                            <Building2 className="h-7 w-7 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-white sm:text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {organismoRecrutementSeleccionado.nombre}
                              </h3>
                              <Badge className="border-0 bg-white/15 text-white backdrop-blur-sm">
                                {organismoRecrutementSeleccionado.activo ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-white/80">
                              Profil de recrutement avec acces distant dedie pour la feuille de temps.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/90">
                              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                                {organismoRecrutementSeleccionado.tipo || 'Type a definir'}
                              </span>
                              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                                {organismoRecrutementSeleccionado.responsable || 'Responsable non renseigne'}
                              </span>
                              <span className="rounded-full border border-white/15 bg-emerald-400/15 px-3 py-1 text-emerald-50">
                                {selectedRecruitmentOrganismAccessKey ? 'Acces pret a partager' : 'Acces non disponible'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col xl:min-w-[220px]">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-amber-200/50 bg-amber-400/10 text-white hover:bg-amber-400/20"
                            onClick={handleResetRemoteAccessKeyForOrganism}
                          >
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Reinitialiser la cle
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                            onClick={() => handleCopyRemoteTimesheetLinkForOrganism(organismoRecrutementSeleccionado)}
                            disabled={!selectedRecruitmentOrganismAccessKey}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copier le lien distant
                          </Button>
                          <Button
                            type="button"
                            className="bg-white text-slate-900 shadow-lg hover:bg-white/90"
                            onClick={() => handleOpenRemoteTimesheetForOrganism(organismoRecrutementSeleccionado)}
                            disabled={!selectedRecruitmentOrganismAccessKey}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ouvrir le portail
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">Cle d'acces</p>
                          <p className="mt-2 font-mono text-sm text-white break-all">
                            {selectedRecruitmentOrganismAccessKey || 'Cle non disponible'}
                          </p>
                        </div>
                        <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">Coordonnees</p>
                          <div className="mt-2 space-y-1 text-sm text-white/90">
                            <p className="break-all">{organismoRecrutementSeleccionado.email || 'Aucun email'}</p>
                            <p>{organismoRecrutementSeleccionado.telefono || 'Aucun telephone'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/15 bg-[#0f172a]/16 px-4 py-3">
                        <div className="flex items-center gap-2 text-white/85">
                          <ExternalLink className="h-4 w-4" />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Lien personnalise</p>
                        </div>
                        <p className="mt-2 text-sm text-white/75">
                          Ce lien ouvre directement la feuille de temps publique en limitant l'affichage aux benevoles accredites pour cet organisme.
                        </p>
                        <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 font-mono text-[11px] text-white/92 break-all">
                          {selectedRecruitmentOrganismRemoteUrl || 'Lien non disponible tant qu\'aucune cle n\'est definie.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : undefined}
              />
            </TabsContent>
            )}

            {isPublicAccess ? (
              <TabsContent value="timesheets" className="mt-0">
                {renderPublicTimesheetsLayout()}
            </TabsContent>
            ) : (
            <TabsContent value="timesheets" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div
                      className="p-4 sm:p-5"
                      style={{
                        background: `linear-gradient(135deg, ${branding.primaryColor}10 0%, ${branding.secondaryColor}10 100%)`
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <h2
                            className="text-xl font-bold flex items-center gap-2"
                            style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                          >
                            <Clock className="w-5 h-5" />
                            {t('recruitmentInternal.timesheets.managementTitle')}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {t('recruitmentInternal.timesheets.managementDescription')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 lg:items-end">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:min-w-[460px]">
                            <div className="p-3 rounded-xl bg-white/90 border border-white/70 shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.timesheets.availableVolunteers')}</p>
                              <p className="text-xl font-semibold" style={{ color: branding.primaryColor }}>
                                {candidatosFeuilleTemps.length}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/90 border border-white/70 shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.timesheets.filteredEntries')}</p>
                              <p className="text-xl font-semibold" style={{ color: branding.primaryColor }}>
                                {totalEntreesFeuilleTemps}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/90 border border-white/70 shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.timesheets.filteredHours')}</p>
                              <p className="text-xl font-semibold" style={{ color: branding.secondaryColor }}>
                                {formatTimesheetHours(totalHeuresFeuilleTemps)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 lg:min-w-[460px]">
                            <div className="flex-1">
                              <Label htmlFor="recruit-timesheet-filter-department" className="text-xs font-semibold text-gray-600">{t('recruitmentPublic.department')}</Label>
                              <Select
                                value={timesheetDepartmentFilter}
                                onValueChange={(value) => setTimesheetDepartmentFilter(value)}
                              >
                                <SelectTrigger id="recruit-timesheet-filter-department" className="mt-1 bg-white/90">
                                  <SelectValue placeholder={t('recruitmentInternal.timesheets.allDepartments')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">{t('recruitmentInternal.timesheets.allDepartments')}</SelectItem>
                                  {departamentosDisponibles.map(department => (
                                    <SelectItem key={department.id} value={department.id}>
                                      {department.icono} {department.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="recruit-timesheet-filter-month" className="text-xs font-semibold text-gray-600">{t('recruitmentPublic.month')}</Label>
                              <Select
                                value={timesheetMonthFilter || 'all'}
                                onValueChange={(value) => setTimesheetMonthFilter(value === 'all' ? '' : value)}
                              >
                                <SelectTrigger id="recruit-timesheet-filter-month" className="mt-1 bg-white/90">
                                  <SelectValue placeholder={t('recruitmentInternal.timesheets.allMonths')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">{t('recruitmentInternal.timesheets.allMonths')}</SelectItem>
                                  {timesheetMonthOptions.map(month => (
                                    <SelectItem key={month} value={month}>
                                      {month}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setTimesheetDepartmentFilter('all');
                                  setTimesheetMonthFilter('');
                                }}
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >
                                {t('recruitmentInternal.timesheets.resetFilters')}
                              </Button>
                              <Button
                                onClick={handleExportTimesheets}
                                className="text-white"
                                style={{
                                  backgroundColor: branding.primaryColor,
                                  fontFamily: 'Montserrat, sans-serif'
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {t('recruitmentInternal.timesheets.exportCsv')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {candidatosFeuilleTemps.length === 0 ? (
                <Card className="border-amber-200 bg-amber-50/60">
                  <CardContent className="p-6 text-sm text-amber-900">
                    {t('recruitmentInternal.timesheets.emptyAssigned')}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-4">
                  <Card className="border-gray-200/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        {t('recruitmentPublic.selectedVolunteer')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold">{t('recruitmentPublic.volunteers')} *</Label>
                        <div className="mt-2 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={timesheetCandidateSearch}
                            onChange={(event) => setTimesheetCandidateSearch(event.target.value)}
                            placeholder={t('recruitmentPublic.quickSearchPlaceholder')}
                            className="pl-10 h-10"
                          />
                        </div>
                        <div className="mt-2 space-y-2 max-h-[240px] overflow-y-auto pr-1">
                          {candidatosFeuilleTempsFiltrados.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                              {t('recruitmentInternal.timesheets.noVolunteerMatchesSearch')}
                            </div>
                          ) : candidatosFeuilleTempsFiltrados.map(candidate => {
                            const isSelected = String(candidate.id) === selectedTimesheetCandidateId;
                            const totalCandidateHours = feuillesTempsGlobalesFiltradas
                              .filter(timesheet => timesheet.candidateId === candidate.id)
                              .reduce((sum, timesheet) => sum + timesheet.duree, 0);

                            return (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => setSelectedTimesheetCandidateId(String(candidate.id))}
                                aria-label={t('recruitmentPublic.selectVolunteerAria', { name: candidate.name })}
                                className="w-full text-left p-3 rounded-xl border transition-all duration-200"
                                style={{
                                  borderColor: isSelected ? branding.primaryColor : '#E5E7EB',
                                  backgroundColor: isSelected ? `${branding.primaryColor}12` : '#FFFFFF',
                                  boxShadow: isSelected ? `0 6px 16px ${branding.primaryColor}20` : 'none'
                                }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p
                                      className="text-sm font-semibold truncate"
                                      style={{ color: isSelected ? branding.primaryColor : '#1F2937' }}
                                    >
                                      {candidate.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate mt-1">{candidate.email}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs text-gray-500">{t('recruitmentPublic.hours')}</p>
                                    <p className="text-sm font-semibold" style={{ color: branding.secondaryColor }}>
                                      {formatTimesheetHours(totalCandidateHours)}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {candidatoFeuilleTempsSeleccionado && (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                            <p className="text-sm font-semibold" style={{ color: branding.primaryColor }}>
                              {candidatoFeuilleTempsSeleccionado.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{candidatoFeuilleTempsSeleccionado.email}</p>
                            <p className="text-sm text-gray-600">{candidatoFeuilleTempsSeleccionado.phone}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {departamentosFeuilleTemps.map(departamento => (
                                <Badge
                                  key={departamento.id}
                                  className="border-0"
                                  style={{
                                    backgroundColor: `${departamento.color}15`,
                                    color: departamento.color,
                                    fontFamily: 'Montserrat, sans-serif'
                                  }}
                                >
                                  {departamento.icono} {departamento.nombre}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">{t('recruitmentPublic.entries')}</p>
                              <p className="text-xl font-semibold" style={{ color: branding.primaryColor }}>
                                {feuillesTempsSeleccionadas.length}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">{t('recruitmentInternal.timesheets.totalHours')}</p>
                              <p className="text-xl font-semibold" style={{ color: branding.primaryColor }}>
                                {formatTimesheetHours(totalHeuresFeuilleTempsSeleccionada)}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">{timesheetMonthFilter ? t('recruitmentInternal.timesheets.filteredPeriod') : t('recruitmentInternal.timesheets.thisMonth')}</p>
                              <p className="text-xl font-semibold" style={{ color: branding.secondaryColor }}>
                                {formatTimesheetHours(heuresMoisFeuilleTempsSeleccionada)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <Card className="border-0 shadow-lg">
                      <CardHeader
                        className="pb-3"
                        style={{
                          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2" style={{ color: branding.primaryColor }}>
                              <Clock className="w-5 h-5" />
                              {editingTimesheetId ? t('recruitmentInternal.timesheets.editEntryTitle') : t('recruitmentInternal.timesheets.newEntryTitle')}
                            </CardTitle>
                            <p className="text-xs text-gray-500 mt-1">
                              {editingTimesheetId && feuillesTempsActivasSeleccionadas.some(timesheet => timesheet.id === editingTimesheetId)
                                ? t('recruitmentInternal.timesheets.editActiveDescription')
                                : t('recruitmentInternal.timesheets.newEntryDescription')}
                            </p>
                          </div>
                          {editingTimesheetId && candidatoFeuilleTempsSeleccionado && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetTimesheetForm(candidatoFeuilleTempsSeleccionado)}
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {t('recruitmentInternal.timesheets.cancel')}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div>
                            <Label htmlFor="recruit-timesheet-department" className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {t('recruitmentPublic.department')}
                            </Label>
                            <Select
                              value={timesheetForm.departamentoId}
                              onValueChange={(value) => setTimesheetForm(prev => ({ ...prev, departamentoId: value }))}
                            >
                              <SelectTrigger
                                id="recruit-timesheet-department"
                                aria-label={t('recruitmentInternal.timesheets.selectDepartmentAria')}
                                className="h-11"
                              >
                                <SelectValue placeholder={t('recruitmentPublic.selectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {departamentosFeuilleTemps.map(department => (
                                  <SelectItem key={department.id} value={department.id}>
                                    {department.icono} {department.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="recruit-timesheet-date" className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {t('recruitmentInternal.timesheets.date')}
                            </Label>
                            <Input
                              id="recruit-timesheet-date"
                              type="date"
                              className="h-11"
                              value={timesheetForm.date}
                              onChange={(event) => setTimesheetForm(prev => ({ ...prev, date: event.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-4">
                          <div>
                            <Label htmlFor="recruit-timesheet-start" className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {t('recruitmentInternal.timesheets.startTime')}
                            </Label>
                            <Input
                              id="recruit-timesheet-start"
                              type="time"
                              className="h-11"
                              value={timesheetForm.heureDebut}
                              onChange={(event) => setTimesheetForm(prev => ({ ...prev, heureDebut: event.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="recruit-timesheet-end" className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {t('recruitmentInternal.timesheets.endTime')}
                            </Label>
                            <Input
                              id="recruit-timesheet-end"
                              type="time"
                              className="h-11"
                              value={timesheetForm.heureFin}
                              onChange={(event) => setTimesheetForm(prev => ({ ...prev, heureFin: event.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                              <Timer className="w-3 h-3" style={{ color: branding.primaryColor }} />
                              {t('recruitmentInternal.timesheets.autoTime')}
                            </Label>
                            <div
                              className="h-11 px-4 rounded-lg flex items-center justify-center border-2"
                              style={{
                                backgroundColor: calculateTimesheetDuration(timesheetForm.heureDebut, timesheetForm.heureFin) > 0 ? `${branding.primaryColor}10` : '#F3F4F6',
                                borderColor: calculateTimesheetDuration(timesheetForm.heureDebut, timesheetForm.heureFin) > 0 ? `${branding.primaryColor}40` : '#E5E7EB'
                              }}
                            >
                              <p
                                className="text-xl font-bold font-mono"
                                style={{
                                  color: calculateTimesheetDuration(timesheetForm.heureDebut, timesheetForm.heureFin) > 0 ? branding.primaryColor : '#9CA3AF',
                                  fontFamily: 'Montserrat, sans-serif'
                                }}
                              >
                                {calculateTimesheetDuration(timesheetForm.heureDebut, timesheetForm.heureFin) > 0
                                  ? formatTimesheetHours(calculateTimesheetDuration(timesheetForm.heureDebut, timesheetForm.heureFin))
                                  : '—'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="recruit-timesheet-notes" className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {t('recruitmentInternal.timesheets.notes')}
                            </Label>
                            <Input
                              id="recruit-timesheet-notes"
                              className="h-11"
                              placeholder={t('recruitmentPublic.notesPlaceholder')}
                              value={timesheetForm.notes}
                              onChange={(event) => setTimesheetForm(prev => ({ ...prev, notes: event.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                          {editingTimesheetId ? (
                            <Button
                              onClick={handleSaveTimesheet}
                              style={{
                                backgroundColor: branding.secondaryColor,
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                              className="h-11 text-white shadow-lg hover:shadow-xl transition-all"
                              disabled={!candidatoFeuilleTempsSeleccionado}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t('recruitmentInternal.timesheets.updateEntry')}
                            </Button>
                          ) : (
                            <>
                              <Button
                                className="h-11 text-white shadow-lg hover:shadow-xl transition-all"
                                style={{
                                  backgroundColor: branding.secondaryColor,
                                  fontFamily: 'Montserrat, sans-serif'
                                }}
                                onClick={handleRegisterTimesheetEntry}
                                disabled={!candidatoFeuilleTempsSeleccionado || !timesheetForm.departamentoId}
                                title={t('recruitmentPublic.registerArrivalNow')}
                              >
                                <LogIn className="w-4 h-4 mr-2" />
                                {t('recruitmentPublic.entry')}
                              </Button>
                              <Button
                                onClick={handleSaveTimesheet}
                                style={{
                                  backgroundColor: branding.primaryColor,
                                  fontFamily: 'Montserrat, sans-serif'
                                }}
                                className="h-11 text-white shadow-lg hover:shadow-xl transition-all"
                                disabled={!candidatoFeuilleTempsSeleccionado || !timesheetForm.departamentoId || !timesheetForm.heureDebut || !timesheetForm.heureFin}
                                title={t('recruitmentInternal.timesheets.registerFullSession')}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                {t('recruitmentInternal.timesheets.complete')}
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {feuillesTempsActivasSeleccionadas.length > 0 && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader
                          className="pb-3"
                          style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2" style={{ color: '#D97706' }}>
                              <Timer className="w-5 h-5" />
                              {t('recruitmentInternal.timesheets.activeSessionsCount', { count: feuillesTempsActivasSeleccionadas.length })}
                            </CardTitle>
                            <Badge
                              className="text-xs px-3 py-1 animate-pulse"
                              style={{ backgroundColor: '#D97706', color: 'white' }}
                            >
                              {t('recruitmentInternal.timesheets.pendingExit')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {feuillesTempsActivasSeleccionadas.map(timesheet => {
                              const elapsedHours = calculateTimesheetDuration(timesheet.heureDebut, getCurrentLocalTime());

                              return (
                                <div
                                  key={timesheet.id}
                                  className="p-4 rounded-lg border-2 bg-white hover:shadow-md transition-all"
                                  style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
                                          style={{ backgroundColor: branding.primaryColor }}
                                        >
                                          {candidatoFeuilleTempsSeleccionado?.foto ? (
                                            <ImageWithFallback
                                              src={candidatoFeuilleTempsSeleccionado.foto}
                                              alt={candidatoFeuilleTempsSeleccionado.name}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            getCandidateInitials(candidatoFeuilleTempsSeleccionado?.name || 'BA')
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-bold text-lg">{candidatoFeuilleTempsSeleccionado?.name}</p>
                                          <p className="text-sm text-gray-600">
                                            {timesheet.departement} • {timesheet.date}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                          <LogIn className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                                          <span className="font-mono text-lg font-bold" style={{ color: branding.secondaryColor }}>
                                            {timesheet.heureDebut}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Timer className="w-4 h-4" style={{ color: '#D97706' }} />
                                          <span className="font-mono text-sm" style={{ color: '#D97706' }}>
                                            {t('recruitmentInternal.timesheets.elapsed', { duration: formatTimesheetHours(elapsedHours) })}
                                          </span>
                                        </div>
                                        {timesheet.notes && (
                                          <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FileText className="w-3 h-3" />
                                            {timesheet.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="ml-4 flex items-center gap-3">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleStartEditTimesheet(timesheet)}
                                        className="h-12 px-4"
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t('recruitmentInternal.timesheets.edit')}
                                      </Button>
                                      <Button
                                        onClick={() => handleRegisterTimesheetExit(timesheet.id)}
                                        className="h-12 px-6 text-white shadow-lg hover:shadow-xl transition-all"
                                        style={{ backgroundColor: '#DC3545' }}
                                      >
                                        <LogOut className="w-5 h-5 mr-2" />
                                        {t('recruitmentInternal.timesheets.registerExit')}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          <ClipboardList className="w-5 h-5" />
                          {t('recruitmentPublic.recentEntries')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {feuillesTempsHistorialSeleccionadas.length === 0 ? (
                          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-sm text-gray-600">
                            {t('recruitmentInternal.timesheets.noEntriesForVolunteer')}
                          </div>
                        ) : (
                          renderTimesheetEntries(feuillesTempsHistorialSeleccionadas)
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <FormularioContactoCompacto
        abierto={dialogNuevoOpen || dialogEdicionOpen}
        onCerrar={handleCerrarFormularioCandidato}
        formulario={formularioCandidato}
        setFormulario={setFormularioCandidato}
        modoEdicion={Boolean(candidatoParaEditar)}
        onGuardar={candidatoParaEditar ? handleGuardarEdicion : handleCrearCandidatura}
        fotoPreview={fotoPreview}
        onFotoChange={handleFotoCandidatoChange}
        getTipoConfig={getTipoConfig}
        updateDisponibilidad={updateDisponibilidad}
        tiposPermitidos={tiposPermitidos}
        departamentoId="7"
        departamentoNombre={t('nav.recruitment')}
        contactoId={candidatoParaEditar ? String(candidatoParaEditar.id) : undefined}
        dialogVariant="compact"
        textOverrides={{
          createTitle: t('recruitmentInternal.candidateForm.createTitle'),
          editTitle: t('recruitmentInternal.candidateForm.editTitle'),
          createDescription: t('recruitmentInternal.candidateForm.createDescription'),
          editDescription: t('recruitmentInternal.candidateForm.editDescription'),
          emptyTypeTitle: t('recruitmentInternal.candidateForm.emptyTypeTitle'),
          emptyTypeDescription: t('recruitmentInternal.candidateForm.emptyTypeDescription'),
          createTypeButtonLabel: t('recruitmentInternal.candidateForm.createTypeButtonLabel'),
          photoLabel: t('recruitmentInternal.candidateForm.photoLabel'),
          typeLabel: t('recruitmentInternal.candidateForm.typeLabel'),
          contactTypeLabel: t('recruitmentInternal.candidateForm.contactTypeLabel'),
          tabBase: t('recruitmentInternal.candidateForm.tabBase'),
          tabContact: t('recruitmentInternal.candidateForm.tabContact'),
          tabProfessional: t('recruitmentInternal.candidateForm.tabProfessional'),
          tabOther: t('recruitmentInternal.candidateForm.tabOther'),
          genderPlaceholder: t('recruitmentInternal.candidateForm.genderPlaceholder'),
          genderMale: t('recruitmentInternal.candidateForm.genderMale'),
          genderFemale: t('recruitmentInternal.candidateForm.genderFemale'),
          genderOther: t('recruitmentInternal.candidateForm.genderOther'),
          genderUnspecified: t('recruitmentInternal.candidateForm.genderUnspecified'),
          firstNameLabel: t('recruitmentInternal.candidateForm.firstNameLabel'),
          lastNameLabel: t('recruitmentInternal.candidateForm.lastNameLabel'),
          birthDateLabel: t('recruitmentInternal.candidateForm.birthDateLabel'),
          genderLabel: t('recruitmentInternal.candidateForm.genderLabel'),
          startDateLabel: t('recruitmentInternal.candidateForm.startDateLabel'),
          spokenLanguagesLabel: t('recruitmentInternal.candidateForm.spokenLanguagesLabel'),
          languageSelectorAddButtonLabel: t('recruitmentInternal.candidateForm.languageSelectorAddButtonLabel'),
          languageFrench: t('recruitmentInternal.candidateForm.languageFrench'),
          languageArabic: t('recruitmentInternal.candidateForm.languageArabic'),
          languageEnglish: t('recruitmentInternal.candidateForm.languageEnglish'),
          languageSpanish: t('recruitmentInternal.candidateForm.languageSpanish'),
          autoAssignedDepartmentLabel: t('recruitmentInternal.candidateForm.autoAssignedDepartmentLabel'),
          ethicsSectionTitle: t('recruitmentInternal.candidateForm.ethicsSectionTitle'),
          confirmationDateLabel: t('recruitmentInternal.candidateForm.confirmationDateLabel'),
          ethicsCodeSignedLabel: t('recruitmentInternal.candidateForm.ethicsCodeSignedLabel'),
          ethicsUnspecifiedLabel: t('recruitmentInternal.candidateForm.ethicsUnspecifiedLabel'),
          cancelButtonLabel: t('recruitmentInternal.candidateForm.cancelButtonLabel'),
          saveButtonLabel: t('recruitmentInternal.candidateForm.saveButtonLabel'),
          updateButtonLabel: t('recruitmentInternal.candidateForm.updateButtonLabel')
        }}
      />

      {/* Dialog: Assigner au Département */}
      <Dialog open={dialogAssignerOpen} onOpenChange={(open) => {
        if (!open) {
          resetAssignationDialog();
          return;
        }

        setDialogAssignerOpen(true);
      }}>
        <DialogContent className="app-dialog-comfort max-w-2xl" aria-describedby="assigner-departement-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Link className="w-6 h-6" style={{ color: branding.primaryColor }} />
              {assignationMode === 'modify'
                ? t('recruitmentInternal.assignmentDialog.modifyTitle')
                : t('recruitmentInternal.assignmentDialog.assignTitle')}
            </DialogTitle>
            <DialogDescription id="assigner-departement-description">
              {assignationMode === 'modify'
                ? t('recruitmentInternal.assignmentDialog.modifyDescription')
                : t('recruitmentInternal.assignmentDialog.assignDescription')}
            </DialogDescription>
          </DialogHeader>

          {candidatoParaAssignar && (
            <div className="space-y-6">
              {/* Información del candidat */}
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: `${branding.primaryColor}10`, 
                  borderLeftColor: branding.primaryColor
                }}
              >
                <h4 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {t('recruitmentInternal.assignmentDialog.selectedCandidate')}
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>{t('recruitmentInternal.assignmentDialog.fields.name')}:</strong> {candidatoParaAssignar.name}</p>
                  <p><strong>{t('recruitmentInternal.assignmentDialog.fields.position')}:</strong> {getLocalizedCandidatePosition(candidatoParaAssignar.position)}</p>
                  <p><strong>{t('recruitmentInternal.assignmentDialog.fields.email')}:</strong> {candidatoParaAssignar.email}</p>
                  <p><strong>{t('recruitmentInternal.assignmentDialog.fields.phone')}:</strong> {candidatoParaAssignar.phone}</p>
                  <p><strong>{t('recruitmentInternal.assignmentDialog.fields.availability')}:</strong> {getLocalizedCandidateAvailability(candidatoParaAssignar.availability)}</p>
                </div>
              </div>

              {assignationMode === 'modify' && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('recruitmentInternal.assignmentDialog.currentDepartmentToModify')}
                  </Label>

                  {(candidatoParaAssignar.departamentoIds || []).length > 1 ? (
                    <Select
                      value={departamentoOrigenSeleccionado}
                      onValueChange={setDepartamentoOrigenSeleccionado}
                    >
                      <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <SelectValue placeholder={t('recruitmentInternal.assignmentDialog.selectCurrentDepartment')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(candidatoParaAssignar.departamentoIds || []).map(deptId => {
                          const dept = departamentosDisponibles.find(item => item.id === deptId);
                          if (!dept) {
                            return null;
                          }

                          return (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.icono} {dept.nombre}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(candidatoParaAssignar.departamentoIds || []).map(deptId => {
                        const dept = departamentosDisponibles.find(item => item.id === deptId);
                        if (!dept) {
                          return null;
                        }

                        return (
                          <Badge
                            key={dept.id}
                            className="text-sm px-3 py-1 border-0"
                            style={{
                              backgroundColor: `${dept.color}15`,
                              color: dept.color,
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                          >
                            {dept.icono} {dept.nombre}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Selector de département */}
              <div className="space-y-3">
                <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {assignationMode === 'modify'
                    ? t('recruitmentInternal.assignmentDialog.newDepartment')
                    : t('recruitmentInternal.assignmentDialog.selectDepartment')}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {departamentosDisponibles.map((dept) => {
                    const yaAsignado = verificarCandidatoAsignado(candidatoParaAssignar, dept.id);
                    const esDepartamentoOrigen = assignationMode === 'modify' && departamentoOrigenSeleccionado === dept.id;
                    const puedeSeleccionarse = assignationMode === 'modify'
                      ? !yaAsignado || esDepartamentoOrigen
                      : !yaAsignado;
                    const esSeleccionado = departamentoSeleccionado === dept.id;
                    
                    return (
                      <button
                        key={dept.id}
                        onClick={() => puedeSeleccionarse && setDepartamentoSeleccionado(dept.id)}
                        disabled={!puedeSeleccionarse || (assignationMode === 'modify' && !departamentoOrigenSeleccionado)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                          !puedeSeleccionarse 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:scale-105'
                        } ${
                          esSeleccionado 
                            ? 'shadow-lg' 
                            : 'hover:shadow-md'
                        }`}
                        style={{
                          borderColor: esSeleccionado 
                            ? dept.color 
                            : !puedeSeleccionarse 
                              ? '#DC3545' 
                              : '#e5e7eb',
                          backgroundColor: esSeleccionado 
                            ? `${dept.color}10` 
                            : !puedeSeleccionarse 
                              ? '#DC354510' 
                              : 'white'
                        }}
                        title={
                          assignationMode === 'modify' && esDepartamentoOrigen
                            ? t('recruitmentInternal.assignmentDialog.currentDepartmentTitle', { department: dept.nombre })
                            : yaAsignado
                              ? t('recruitmentInternal.assignmentDialog.alreadyAssignedTitle', { department: dept.nombre })
                              : t('recruitmentInternal.assignmentDialog.assignDepartmentTitle', { department: dept.nombre })
                        }
                      >
                        {/* Indicador de ya asignado */}
                        {!puedeSeleccionarse && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-[#DC3545]" />
                          </div>
                        )}
                        
                        <div className="text-3xl mb-2">{dept.icono}</div>
                        <p 
                          className="font-semibold text-sm"
                          style={{ 
                            fontFamily: 'Montserrat, sans-serif',
                            color: esSeleccionado 
                              ? dept.color 
                              : !puedeSeleccionarse 
                                ? '#DC3545' 
                                : '#666666'
                          }}
                        >
                          {dept.nombre}
                        </p>
                        
                        {/* Texto de estado */}
                        {assignationMode === 'modify' && esDepartamentoOrigen ? (
                          <p className="text-xs mt-1" style={{ color: dept.color }}>
                            {t('recruitmentInternal.assignmentDialog.currentDepartment')}
                          </p>
                        ) : !puedeSeleccionarse ? (
                          <p className="text-xs mt-1" style={{ color: '#DC3545' }}>
                            {t('recruitmentInternal.assignmentDialog.alreadyAssigned')}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Organismes externes accrédités
                </Label>
                {organismosAcreditadosActivos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                    Aucun organisme actif n'est disponible dans la gestion propre au recrutement.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Sélectionnez les organismes externes accrédités pouvant accueillir ou suivre ce bénévole.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {organismosAcreditadosActivos.map((organismo) => {
                        const seleccionado = organismosAcreditadosSeleccionados.includes(organismo.id);

                        return (
                          <button
                            key={organismo.id}
                            type="button"
                            onClick={() => alternarOrganismoAcreditadoSeleccionado(organismo.id)}
                            className="rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md"
                            style={{
                              borderColor: seleccionado ? branding.secondaryColor : '#E5E7EB',
                              backgroundColor: seleccionado ? `${branding.secondaryColor}10` : '#FFFFFF'
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-slate-900 truncate">{organismo.nombre}</p>
                                <p className="text-xs text-gray-500 mt-1 truncate">{organismo.tipo}</p>
                              </div>
                              {seleccionado && (
                                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: branding.secondaryColor }} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="app-compact-actions justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={resetAssignationDialog}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {t('recruitmentInternal.assignmentDialog.cancel')}
                </Button>
                <Button
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                  onClick={assignationMode === 'modify' ? handleModifierAsignacion : handleAssignerCandidat}
                  disabled={!departamentoSeleccionado || (assignationMode === 'modify' && !departamentoOrigenSeleccionado)}
                >
                  {assignationMode === 'modify' ? <ArrowRightLeft className="w-4 h-4 mr-2" /> : <Link className="w-4 h-4 mr-2" />}
                  {assignationMode === 'modify'
                    ? t('recruitmentInternal.assignmentDialog.modifyAssignment')
                    : t('recruitmentInternal.assignmentDialog.assignToDepartment')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}