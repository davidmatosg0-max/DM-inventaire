import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { FormularioContactoCompacto } from '../departamentos/FormularioContactoCompacto';
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
  UserPlus, 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock,
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
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, type TableColumn } from '../../utils/exportUtils';
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
  type FeuilleTiempoCandidato
} from '../../utils/candidatosStorage'; // ✅ Importar storage

// ✅ Usar tipo Candidato del storage
type Candidate = Candidato;
type CandidateContactForm = Omit<ContactoDepartamento, 'id'>;
type AssignationMode = 'assign' | 'modify';
type RecruitmentMainView = 'candidatures' | 'timesheets';
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

const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

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

export function Recrutement() {
  const { t } = useTranslation();
  const branding = useBranding();
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
  
  // 🎯 Estado para el diálogo de perfil detallado
  const [dialogPerfilOpen, setDialogPerfilOpen] = useState(false);
  const [candidatoParaPerfil, setCandidatoParaPerfil] = useState<Candidate | null>(null);
  const [mainView, setMainView] = useState<RecruitmentMainView>('candidatures');
  const [timesheetDepartmentFilter, setTimesheetDepartmentFilter] = useState<TimesheetDepartmentFilter>('all');
  const [timesheetMonthFilter, setTimesheetMonthFilter] = useState('');
  const [selectedTimesheetCandidateId, setSelectedTimesheetCandidateId] = useState('');
  const [timesheetForm, setTimesheetForm] = useState<CandidateTimesheetForm>(createInitialTimesheetForm);
  const [editingTimesheetId, setEditingTimesheetId] = useState<number | null>(null);
  
  // ✅ NUEVO: Estados para el diálogo de edición
  const [dialogEdicionOpen, setDialogEdicionOpen] = useState(false);
  const [candidatoParaEditar, setCandidatoParaEditar] = useState<Candidate | null>(null);

  // ✅ LISTA CORRECTA DE DEPARTAMENTOS CON IDs NUMÉRICOS (coinciden con departamentosStorage.ts)
  const departamentosDisponibles = [
    { id: '1', nombre: 'Entrepôt', icono: '📦', color: '#1a4d7a', codigo: 'ENTREPOT' },
    { id: '7', nombre: 'Transport', icono: '🚚', color: '#2d9561', codigo: 'TRANSPORT' },
    { id: '2', nombre: 'Comptoir', icono: '🏪', color: '#FF9800', codigo: 'COMPTOIR' },
    { id: '3', nombre: 'Cuisine', icono: '🍳', color: '#E91E63', codigo: 'CUISINE' },
    { id: '4', nombre: 'Liaison', icono: '🤝', color: '#9C27B0', codigo: 'LIAISON' },
    { id: '8', nombre: 'Bénévoles', icono: '👥', color: '#4CAF50', codigo: 'BENEVOLES' },
  ];

  // ✅ Candidatos desde localStorage (ya no mock estáticos)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  // ✅ Cargar candidatos al montar el componente
  useEffect(() => {
    const candidatosGuardados = obtenerCandidatos();
    setCandidates(candidatosGuardados);
    console.log('✅ Candidatos cargados desde localStorage:', candidatosGuardados.length);
  }, []);

  useEffect(() => {
    const candidatosConDepartamento = candidates.filter(candidate => {
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
  }, [candidates, selectedTimesheetCandidateId, timesheetDepartmentFilter]);

  const candidatosFeuilleTemps = candidates
    .filter(candidate => {
      if ((candidate.departamentoIds || []).length === 0) {
        return false;
      }

      return timesheetDepartmentFilter === 'all'
        ? true
        : (candidate.departamentoIds || []).includes(timesheetDepartmentFilter);
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'fr'));

  const candidatoFeuilleTempsSeleccionado = candidatosFeuilleTemps.find(
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
      candidates.flatMap(candidate =>
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
    reader.onloadend = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      setFotoPreview(base64 || null);
      setFormularioCandidato(prev => ({
        ...prev,
        foto: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetAssignationDialog = () => {
    setDialogAssignerOpen(false);
    setCandidatoParaAssignar(null);
    setDepartamentoSeleccionado('');
    setDepartamentoOrigenSeleccionado('');
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
    setDepartamentoOrigenSeleccionado(
      mode === 'modify' && departamentosActuales.length === 1 ? departamentosActuales[0] : ''
    );
    setDialogAssignerOpen(true);
  };

  const handleCrearCandidatura = () => {
    const candidateName = buildFullName(formularioCandidato.nombre, formularioCandidato.apellido);

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

    const nuevoCandidato = agregarCandidato(
      mapContactFormToCandidate(formularioCandidato, 'pending')
    );

    setCandidates(prev => [nuevoCandidato, ...prev]);
    setSearchTerm('');
    setFilterStatus('all');
    handleCerrarFormularioCandidato();

    toast.success('✅ Nouvelle candidature créée avec succès', {
      description: `${nuevoCandidato.name} a été ajouté à la liste de recrutement`,
      duration: 5000
    });
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
  const handleGuardarEdicion = () => {
    if (!candidatoParaEditar) return;
    const candidateName = buildFullName(formularioCandidato.nombre, formularioCandidato.apellido);
    
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
    const candidatoActualizado = persistCandidateChanges(
      candidatoParaEditar.id,
      mapContactFormToCandidate(formularioCandidato, candidatoParaEditar.status, candidatoParaEditar)
    );
    
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
      pending: { label: 'En attente', color: 'bg-[#FFC107] text-[#333333]' },
      reviewed: { label: 'Examiné', color: `text-white`, bgColor: branding.primaryColor },
      interview: { label: 'Entretien', color: 'bg-[#9C27B0] text-white' },
      accepted: { label: 'Accepté', color: `text-white`, bgColor: branding.secondaryColor },
      rejected: { label: 'Rejeté', color: 'bg-[#DC3545] text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (status === 'reviewed' || status === 'accepted') {
      return (
        <Badge 
          className={config.color} 
          style={{ backgroundColor: config.bgColor }}
        >
          {config.label}
        </Badge>
      );
    }
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const renderTimesheetEntries = (timesheets: FeuilleTiempoCandidato[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr
            className="border-b-2"
            style={{ borderColor: `${branding.primaryColor}20` }}
          >
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
              Nom
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
              Département
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: branding.secondaryColor }}>
              Arrivée
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#DC3545' }}>
              Départ
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
              Temps total
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
              Date
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: branding.primaryColor }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {timesheets
            .slice()
            .sort((left, right) => `${right.date}-${right.heureDebut}`.localeCompare(`${left.date}-${left.heureDebut}`))
            .map((timesheet, index) => (
              <tr
                key={timesheet.id}
                className="border-b hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {(candidatoFeuilleTempsSeleccionado?.name || 'BA').split(' ').map(name => name[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#333333]">
                        {candidatoFeuilleTempsSeleccionado?.name || 'Bénévole'}
                      </span>
                      {timesheet.notes && (
                        <p className="text-xs text-gray-500 max-w-[220px] truncate">{timesheet.notes}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {timesheet.departement}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono font-semibold"
                    style={{
                      backgroundColor: `${branding.secondaryColor}15`,
                      color: branding.secondaryColor
                    }}
                  >
                    {timesheet.heureDebut}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono font-semibold"
                    style={{
                      backgroundColor: '#DC354515',
                      color: '#DC3545'
                    }}
                  >
                    {timesheet.heureFin}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-lg" style={{ color: branding.primaryColor }}>
                    {formatTimesheetHours(timesheet.duree)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {timesheet.date}
                </td>
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
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  const handleExportTimesheets = async () => {
    if (feuillesTempsGlobalesFiltradas.length === 0) {
      toast.error('Aucune feuille de temps à exporter avec les filtres actuels');
      return;
    }

    const exportColumns: TableColumn[] = [
      { header: 'Bénévole', key: 'candidateName' },
      { header: 'Email', key: 'candidateEmail' },
      { header: 'Département', key: 'departement' },
      { header: 'Date', key: 'date' },
      { header: 'Début', key: 'heureDebut' },
      { header: 'Fin', key: 'heureFin' },
      { header: 'Durée', key: 'duree', format: (value) => formatTimesheetHours(Number(value) || 0) },
      { header: 'Notes', key: 'notes' }
    ];

    await exportToCSV(feuillesTempsGlobalesFiltradas, exportColumns, {
      filename: `recrutement_feuilles_temps_${timesheetMonthFilter || getTodayLocalDate()}`,
      includeDate: true,
      title: 'Feuilles de temps Recrutement'
    });

    toast.success(`Export CSV généré avec ${feuillesTempsGlobalesFiltradas.length} entrée(s)`);
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
    
    // ✅ Si se acepta el candidat, crear automáticamente en el département correspondiente
    if (newStatus === 'accepted' && candidate) {
      try {
        // 🎯 Detectar département selon la position du candidat - USANDO IDs NUMÉRICOS CORRECTOS
        let departamentoId = '8'; // Par défaut: Bénévoles
        let departamentoNombre = 'Bénévoles';
        const positionLower = candidate.position.toLowerCase();
        
        if (positionLower.includes('entrepôt') || positionLower.includes('entrepo') || positionLower.includes('warehouse')) {
          departamentoId = '1'; // Entrepôt
          departamentoNombre = 'Entrepôt';
        } else if (positionLower.includes('chauffeur') || positionLower.includes('driver') || positionLower.includes('transport')) {
          departamentoId = '7'; // Transport
          departamentoNombre = 'Transport';
        } else if (positionLower.includes('comptoir') || positionLower.includes('counter')) {
          departamentoId = '2'; // Comptoir
          departamentoNombre = 'Comptoir';
        } else if (positionLower.includes('cuisine') || positionLower.includes('kitchen')) {
          departamentoId = '3'; // Cuisine
          departamentoNombre = 'Cuisine';
        } else if (positionLower.includes('liaison')) {
          departamentoId = '4'; // Liaison
          departamentoNombre = 'Liaison';
        }
        
        console.log(`🎯 Detectado département: ${departamentoNombre} (ID: ${departamentoId}) pour position: ${candidate.position}`);
        
        // Séparer nom complet en prénom (nombre) et nom de famille (apellido)
        // Format: "Prénom Nom" -> nombre="Prénom", apellido="Nom"
        const nombreParts = candidate.name.trim().split(' ');
        const nombre = nombreParts[0] || ''; // Premier mot = Prénom
        const apellido = nombreParts.slice(1).join(' ') || ''; // Reste = Nom de famille
        
        // Parser disponibilité en jours de la semaine
        const disponibilidades = diasSemana.map(jour => ({
          jour,
          am: candidate.availability.toLowerCase().includes(jour.toLowerCase()) || 
              candidate.availability.toLowerCase().includes('temps plein') ||
              candidate.availability.toLowerCase().includes('flexible'),
          pm: candidate.availability.toLowerCase().includes(jour.toLowerCase()) ||
              candidate.availability.toLowerCase().includes('temps plein') ||
              candidate.availability.toLowerCase().includes('flexible')
        }));
        
        // Créer événement de création
        const eventoCreacion = {
          id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'creation' as const,
          titre: 'Bénévole ajouté depuis Recrutement',
          description: `Candidat accepté et ajouté automatiquement au département ${departamentoNombre}`,
          date: new Date().toISOString(),
          utilisateur: 'Système',
          couleur: '#4CAF50'
        };
        
        // Créer contact dans le département correspondant
        const nuevoContacto = {
          departamentoId,
          departamentoIds: [departamentoId],
          tipo: 'benevole' as const,
          nombre,
          apellido,
          email: candidate.email,
          telefono: candidate.phone,
          activo: true,
          fechaIngreso: new Date().toISOString().split('T')[0],
          disponibilidades,
          notas: `${candidate.experience}\n\nCandidature du: ${new Date(candidate.applicationDate).toLocaleDateString('fr-FR')}`,
          evenements: [eventoCreacion],
          // Champs optionnels
          direccion: candidate.adresse || '',
          apartamento: candidate.appartement || '',
          ciudad: candidate.ville || '',
          codigoPostal: candidate.codePostal || '',
          quartier: candidate.quartier || '', // ✅ CRÍTICO: Incluir quartier
          cargo: candidate.position,
          idiomas: [],
          documents: []
        };
        
        console.log('✅ Créant contact depuis Recrutement:', {
          département: `${departamentoNombre} (${departamentoId})`,
          contact: nuevoContacto
        });
        
        const contactoGuardado = guardarContacto(nuevoContacto);
        
        console.log('✅ Contacto sauvegardé avec succès:', contactoGuardado);
        
        const departamentosActualizados = Array.from(new Set([
          ...(candidate.departamentoIds || []),
          departamentoId
        ]));

        persistCandidateChanges(candidateId, {
          contactoId: contactoGuardado.id,
          departamentoIds: departamentosActualizados,
          numeroArchivo: contactoGuardado.numeroArchivo || candidate.numeroArchivo
        });
        
        // 🔥 Déclencher événement personnalisé pour synchroniser départements
        window.dispatchEvent(new CustomEvent('contactos-actualizados', {
          detail: { departamentoId, contactoId: contactoGuardado.id }
        }));
        
        toast.success(
          `${candidate.name} accepté et ajouté au département ${departamentoNombre}!`,
          {
            description: `Le contact est maintenant disponible dans la section ${departamentoNombre}. ID: ${contactoGuardado.id}`,
            duration: 5000
          }
        );
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

        // Cerrar el dialog de perfil
        setDialogPerfilOpen(false);
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
        numeroArchivo: contactoGuardado.numeroArchivo || candidatoParaAssignar.numeroArchivo
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
      numeroArchivo: contactoActual.contacto.numeroArchivo || candidatoParaAssignar.numeroArchivo
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

    if (!timesheetForm.departamentoId || !timesheetForm.date || !timesheetForm.heureDebut || !timesheetForm.heureFin) {
      toast.error('Veuillez remplir tous les champs obligatoires de la feuille de temps');
      return;
    }

    const duration = calculateTimesheetDuration(timesheetForm.heureDebut, timesheetForm.heureFin);
    if (duration <= 0) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    const department = departamentosDisponibles.find(item => item.id === timesheetForm.departamentoId);
    if (!department) {
      toast.error('Département non trouvé pour la feuille de temps');
      return;
    }

    const currentTimesheets = candidatoFeuilleTempsSeleccionado.feuillesTemps || [];
    const nextTimesheet: FeuilleTiempoCandidato = {
      id: editingTimesheetId || Date.now(),
      departamentoId: timesheetForm.departamentoId,
      departement: department.nombre,
      date: timesheetForm.date,
      heureDebut: timesheetForm.heureDebut,
      heureFin: timesheetForm.heureFin,
      duree: duration,
      notes: timesheetForm.notes.trim(),
      enCours: false
    };

    const updatedTimesheets = editingTimesheetId
      ? currentTimesheets.map(timesheet =>
          timesheet.id === editingTimesheetId ? nextTimesheet : timesheet
        )
      : [nextTimesheet, ...currentTimesheets];

    const candidatoActualizado = persistCandidateChanges(candidatoFeuilleTempsSeleccionado.id, {
      feuillesTemps: updatedTimesheets
    });

    if (!candidatoActualizado) {
      toast.error('Erreur lors de la sauvegarde de la feuille de temps');
      return;
    }

    toast.success(
      editingTimesheetId
        ? '✅ Feuille de temps mise à jour avec succès'
        : `✅ Feuille de temps enregistrée: ${formatTimesheetHours(duration)}`
    );

    resetTimesheetForm(candidatoActualizado);
  };

  const handleRegisterTimesheetEntry = () => {
    if (!candidatoFeuilleTempsSeleccionado) {
      return;
    }

    if (!timesheetForm.departamentoId || !timesheetForm.date) {
      toast.error('Veuillez sélectionner un département et une date');
      return;
    }

    const hasActiveEntry = (candidatoFeuilleTempsSeleccionado.feuillesTemps || []).some(timesheet => timesheet.enCours);
    if (hasActiveEntry) {
      toast.error('Ce bénévole a déjà une entrée active. Veuillez enregistrer la sortie d\'abord.');
      return;
    }

    const department = departamentosDisponibles.find(item => item.id === timesheetForm.departamentoId);
    if (!department) {
      toast.error('Département non trouvé pour la feuille de temps');
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
      toast.error('Erreur lors de l\'enregistrement de l\'entrée');
      return;
    }

    toast.success(`Entrée enregistrée à ${heureDebut}`, {
      description: `${candidatoFeuilleTempsSeleccionado.name} pourra enregistrer la sortie plus tard`,
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
      toast.error('L\'heure de sortie doit être après l\'heure d\'entrée');
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
      toast.error('Erreur lors de l\'enregistrement de la sortie');
      return;
    }

    toast.success(`Sortie enregistrée: ${formatTimesheetHours(duree)}`, {
      description: `${candidatoFeuilleTempsSeleccionado.name} - ${timesheet.heureDebut} à ${heureFin}`,
      duration: 4000
    });
  };

  const handleDeleteTimesheet = (timesheetId: number) => {
    if (!candidatoFeuilleTempsSeleccionado) {
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette feuille de temps?')) {
      return;
    }

    const updatedTimesheets = (candidatoFeuilleTempsSeleccionado.feuillesTemps || []).filter(
      timesheet => timesheet.id !== timesheetId
    );

    const candidatoActualizado = persistCandidateChanges(candidatoFeuilleTempsSeleccionado.id, {
      feuillesTemps: updatedTimesheets
    });

    if (!candidatoActualizado) {
      toast.error('Erreur lors de la suppression de la feuille de temps');
      return;
    }

    if (editingTimesheetId === timesheetId) {
      resetTimesheetForm(candidatoActualizado);
    }

    toast.success('🗑️ Feuille de temps supprimée avec succès');
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
      className="min-h-screen p-3 sm:p-4 md:p-6 relative overflow-hidden" 
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
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div 
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60"
          style={{
            boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
          }}
        >
          {/* Header avec logo et titre */}
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

          {/* Título con icono y effet Sparkles */}
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

          {/* Estadísticas */}
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
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Total Candidats</p>
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
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">En Attente</p>
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
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Entretiens</p>
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
                <p className="text-xs sm:text-sm text-white/90 mb-1 font-medium">Acceptés</p>
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

          <Tabs value={mainView} onValueChange={(value) => setMainView(value as RecruitmentMainView)} className="mb-6 gap-4">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white border border-gray-200 shadow-sm">
              <TabsTrigger
                value="candidatures"
                className="py-3"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Users className="w-4 h-4" />
                Candidatures
              </TabsTrigger>
              <TabsTrigger
                value="timesheets"
                className="py-3"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Clock className="w-4 h-4" />
                Feuille de temps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="candidatures" className="space-y-6">
              <Card className="border-gray-200/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10" style={{ color: branding.primaryColor }} />
                      <Input
                        placeholder="Rechercher par nom, poste ou email..."
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
                        <SelectValue placeholder="Filtrer par statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="reviewed">Examiné</SelectItem>
                        <SelectItem value="interview">Entretien</SelectItem>
                        <SelectItem value="accepted">Accepté</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
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
                        Nouvelle candidature
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCandidates.map((candidate, index) => {
                  const cardColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
                  const numeroArchivo = obtenerNumeroArchivoCandidato(candidate);

                  return (
                    <Card
                      key={candidate.id}
                      className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-gray-200/50 overflow-hidden group"
                    >
                      <div
                        className="h-1.5 w-full"
                        style={{
                          background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}dd 100%)`
                        }}
                      />

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                              style={{
                                background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                                boxShadow: `0 4px 12px ${cardColor}30`
                              }}
                            >
                              <Users className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle
                                className="text-base sm:text-lg truncate"
                                style={{
                                  fontFamily: 'Montserrat, sans-serif',
                                  color: '#333333'
                                }}
                              >
                                {candidate.name}
                              </CardTitle>
                              <p className="text-sm text-[#666666] truncate">{candidate.position}</p>
                              {numeroArchivo && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FileText className="w-3 h-3" style={{ color: branding.primaryColor }} />
                                  <span
                                    className="text-xs font-mono font-semibold tracking-wide"
                                    style={{ color: branding.primaryColor }}
                                  >
                                    {numeroArchivo}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(candidate.status)}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                          <Mail className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                          <Phone className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                          <span>{candidate.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                          <span>Candidature: {new Date(candidate.applicationDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                          <span>{candidate.availability}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#666666] p-2 rounded-lg bg-gray-50/50">
                          <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: cardColor }} />
                          <span className="line-clamp-1">{candidate.experience}</span>
                        </div>

                        {candidate.departamentoIds && candidate.departamentoIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200/50">
                            <span className="text-xs font-medium text-[#666666] flex items-center gap-1">
                              <Users className="w-3 h-3" style={{ color: branding.primaryColor }} />
                              Département{candidate.departamentoIds.length > 1 ? 's' : ''}:
                            </span>
                            {candidate.departamentoIds.map(deptId => {
                              const dept = departamentosDisponibles.find(d => d.id === deptId);
                              if (!dept) return null;
                              return (
                                <Badge
                                  key={deptId}
                                  className="text-xs px-2 py-0.5 border-0 shadow-sm"
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

                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                          {(() => {
                            const tieneContacto = obtenerContactoCandidato(candidate);

                            if (tieneContacto) {
                              return (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:scale-105 transition-all duration-300"
                                    style={{
                                      fontFamily: 'Montserrat, sans-serif',
                                      color: branding.primaryColor,
                                      borderColor: `${branding.primaryColor}40`,
                                      backgroundColor: `${branding.primaryColor}10`
                                    }}
                                    onClick={() => abrirDialogoAssignacion(candidate, 'modify')}
                                    title="Modifier l'assignation de département"
                                  >
                                    <ArrowRightLeft className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:scale-105 transition-all duration-300 hover:bg-orange-50 border-2"
                                    style={{
                                      fontFamily: 'Montserrat, sans-serif',
                                      color: '#ff6b35',
                                      borderColor: '#ff6b35'
                                    }}
                                    onClick={() => handleEliminarContacto(candidate)}
                                    title="Supprimer le contact du département"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            }

                            return (
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:scale-105 transition-all duration-300"
                                style={{
                                  fontFamily: 'Montserrat, sans-serif',
                                  color: branding.secondaryColor,
                                  borderColor: `${branding.secondaryColor}40`,
                                  backgroundColor: `${branding.secondaryColor}10`
                                }}
                                onClick={() => abrirDialogoAssignacion(candidate, 'assign')}
                                title="Assigner au département"
                              >
                                <Link className="w-4 h-4" />
                              </Button>
                            );
                          })()}

                          <Select
                            value={candidate.status}
                            onValueChange={(value) => handleStatusChange(candidate.id, value)}
                          >
                            <SelectTrigger
                              className="flex-1 h-9 text-sm border-gray-300"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="reviewed">Examiné</SelectItem>
                              <SelectItem value="interview">Entretien</SelectItem>
                              <SelectItem value="accepted">Accepté</SelectItem>
                              <SelectItem value="rejected">Rejeté</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:scale-105 transition-all duration-300"
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: cardColor,
                              borderColor: `${cardColor}30`
                            }}
                            onClick={() => {
                              setCandidatoParaPerfil(candidate);
                              setDialogPerfilOpen(true);
                            }}
                            title="Voir le profil détaillé"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:scale-105 transition-all duration-300 hover:bg-blue-50 border-2"
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#1a4d7a',
                              borderColor: '#1a4d7a'
                            }}
                            onClick={() => handleAbrirEdicion(candidate)}
                            title="Éditer le candidat"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:scale-105 transition-all duration-300 hover:bg-red-50 border-2"
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: '#DC3545',
                              borderColor: '#DC3545'
                            }}
                            onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                            title="Supprimer la candidature"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                      Aucun candidat trouvé
                    </p>
                    <p className="text-[#666666] text-sm">
                      Essayez de modifier vos critères de recherche ou filtres
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timesheets" className="space-y-6">
              <Card className="border-gray-200/50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className="p-5 sm:p-6"
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
                          Gestion des feuilles de temps
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Gérez les heures des bénévoles assignés à un département depuis la page principale.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 lg:items-end">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:min-w-[520px]">
                          <div className="p-4 rounded-xl bg-white/90 border border-white/70 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Bénévoles disponibles</p>
                            <p className="text-2xl font-semibold" style={{ color: branding.primaryColor }}>
                              {candidatosFeuilleTemps.length}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-white/90 border border-white/70 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Entrées filtrées</p>
                            <p className="text-2xl font-semibold" style={{ color: branding.primaryColor }}>
                              {totalEntreesFeuilleTemps}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-white/90 border border-white/70 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Heures filtrées</p>
                            <p className="text-2xl font-semibold" style={{ color: branding.secondaryColor }}>
                              {formatTimesheetHours(totalHeuresFeuilleTemps)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[520px]">
                          <div className="flex-1">
                            <Label htmlFor="recruit-timesheet-filter-department" className="text-xs font-semibold text-gray-600">Département</Label>
                            <Select
                              value={timesheetDepartmentFilter}
                              onValueChange={(value) => setTimesheetDepartmentFilter(value)}
                            >
                              <SelectTrigger id="recruit-timesheet-filter-department" className="mt-1 bg-white/90">
                                <SelectValue placeholder="Tous les départements" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tous les départements</SelectItem>
                                {departamentosDisponibles.map(department => (
                                  <SelectItem key={department.id} value={department.id}>
                                    {department.icono} {department.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="recruit-timesheet-filter-month" className="text-xs font-semibold text-gray-600">Mois</Label>
                            <Select
                              value={timesheetMonthFilter || 'all'}
                              onValueChange={(value) => setTimesheetMonthFilter(value === 'all' ? '' : value)}
                            >
                              <SelectTrigger id="recruit-timesheet-filter-month" className="mt-1 bg-white/90">
                                <SelectValue placeholder="Tous les mois" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tous les mois</SelectItem>
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
                              Réinitialiser
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
                              Exporter CSV
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {candidatosFeuilleTemps.length === 0 ? (
                <Card className="border-amber-200 bg-amber-50/60">
                  <CardContent className="p-6 text-sm text-amber-900">
                    Aucun bénévole assigné à un département n'est disponible pour la gestion des feuilles de temps.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
                  <Card className="border-gray-200/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        Bénévole sélectionné
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold">Bénévoles *</Label>
                        <div className="mt-2 space-y-2 max-h-[320px] overflow-y-auto pr-1">
                          {candidatosFeuilleTemps.map(candidate => {
                            const isSelected = String(candidate.id) === selectedTimesheetCandidateId;
                            const totalCandidateHours = feuillesTempsGlobalesFiltradas
                              .filter(timesheet => timesheet.candidateId === candidate.id)
                              .reduce(
                              (sum, timesheet) => sum + timesheet.duree,
                              0
                            );

                            return (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => setSelectedTimesheetCandidateId(String(candidate.id))}
                                aria-label={`Sélectionner ${candidate.name}`}
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
                                    <p className="text-xs text-gray-500">Heures</p>
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
                          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
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

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Entrées</p>
                              <p className="text-2xl font-semibold" style={{ color: branding.primaryColor }}>
                                {feuillesTempsSeleccionadas.length}
                              </p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Heures totales</p>
                              <p className="text-2xl font-semibold" style={{ color: branding.primaryColor }}>
                                {formatTimesheetHours(totalHeuresFeuilleTempsSeleccionada)}
                              </p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">{timesheetMonthFilter ? 'Période filtrée' : 'Ce mois-ci'}</p>
                              <p className="text-2xl font-semibold" style={{ color: branding.secondaryColor }}>
                                {formatTimesheetHours(heuresMoisFeuilleTempsSeleccionada)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
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
                              {editingTimesheetId ? 'Modifier une entrée' : 'Enregistrer une nouvelle entrée'}
                            </CardTitle>
                            <p className="text-xs text-gray-500 mt-1">
                              Les heures sont enregistrées directement sur le bénévole sélectionné.
                            </p>
                          </div>
                          {editingTimesheetId && candidatoFeuilleTempsSeleccionado && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetTimesheetForm(candidatoFeuilleTempsSeleccionado)}
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              Annuler
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                          <div>
                            <Label htmlFor="recruit-timesheet-department" className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              Département
                            </Label>
                            <Select
                              value={timesheetForm.departamentoId}
                              onValueChange={(value) => setTimesheetForm(prev => ({ ...prev, departamentoId: value }))}
                            >
                              <SelectTrigger
                                id="recruit-timesheet-department"
                                aria-label="Sélectionner un département pour la feuille de temps"
                                className="h-11"
                              >
                                <SelectValue placeholder="Sélectionner..." />
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
                              Date
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
                              Heure de début
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
                              Heure de fin
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
                              Temps (auto)
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
                              Notes
                            </Label>
                            <Input
                              id="recruit-timesheet-notes"
                              className="h-11"
                              placeholder="Tâches effectuées..."
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
                              Mettre à jour
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
                                title="Enregistrer l'arrivée maintenant"
                              >
                                <LogIn className="w-4 h-4 mr-2" />
                                Entrée
                              </Button>
                              <Button
                                onClick={handleSaveTimesheet}
                                style={{
                                  backgroundColor: branding.primaryColor,
                                  fontFamily: 'Montserrat, sans-serif'
                                }}
                                className="h-11 text-white shadow-lg hover:shadow-xl transition-all"
                                disabled={!candidatoFeuilleTempsSeleccionado || !timesheetForm.departamentoId || !timesheetForm.heureDebut || !timesheetForm.heureFin}
                                title="Enregistrer une session complète"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Complet
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
                              Sessions en cours ({feuillesTempsActivasSeleccionadas.length})
                            </CardTitle>
                            <Badge
                              className="text-xs px-3 py-1 animate-pulse"
                              style={{ backgroundColor: '#D97706', color: 'white' }}
                            >
                              En attente de sortie
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
                                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                          style={{ backgroundColor: branding.primaryColor }}
                                        >
                                          {(candidatoFeuilleTempsSeleccionado?.name || 'BA').split(' ').map(name => name[0]).join('').slice(0, 2)}
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
                                            {formatTimesheetHours(elapsedHours)} écoulé
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
                                    <Button
                                      onClick={() => handleRegisterTimesheetExit(timesheet.id)}
                                      className="ml-4 h-12 px-6 text-white shadow-lg hover:shadow-xl transition-all"
                                      style={{ backgroundColor: '#DC3545' }}
                                    >
                                      <LogOut className="w-5 h-5 mr-2" />
                                      Enregistrer Sortie
                                    </Button>
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
                          Entrées récentes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {feuillesTempsHistorialSeleccionadas.length === 0 ? (
                          <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-sm text-gray-600">
                            Aucune feuille de temps ne correspond aux filtres actuels pour ce bénévole.
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
        departamentoNombre="Recrutement"
        contactoId={candidatoParaEditar ? String(candidatoParaEditar.id) : undefined}
      />

      {/* Dialog: Assigner au Département */}
      <Dialog open={dialogAssignerOpen} onOpenChange={(open) => {
        if (!open) {
          resetAssignationDialog();
          return;
        }

        setDialogAssignerOpen(true);
      }}>
        <DialogContent className="max-w-2xl" aria-describedby="assigner-departement-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Link className="w-6 h-6" style={{ color: branding.primaryColor }} />
              {assignationMode === 'modify' ? 'Modifier l\'assignation de Département' : 'Assigner au Département'}
            </DialogTitle>
            <DialogDescription id="assigner-departement-description">
              {assignationMode === 'modify'
                ? 'Choisissez le département actuel puis le nouveau département de destination'
                : 'Sélectionnez le département où le candidat sera assigné comme bénévole'}
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
                  Candidat Sélectionné
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nom:</strong> {candidatoParaAssignar.name}</p>
                  <p><strong>Poste:</strong> {candidatoParaAssignar.position}</p>
                  <p><strong>Email:</strong> {candidatoParaAssignar.email}</p>
                  <p><strong>Téléphone:</strong> {candidatoParaAssignar.phone}</p>
                  <p><strong>Disponibilité:</strong> {candidatoParaAssignar.availability}</p>
                </div>
              </div>

              {assignationMode === 'modify' && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Département actuel à modifier
                  </Label>

                  {(candidatoParaAssignar.departamentoIds || []).length > 1 ? (
                    <Select
                      value={departamentoOrigenSeleccionado}
                      onValueChange={setDepartamentoOrigenSeleccionado}
                    >
                      <SelectTrigger style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <SelectValue placeholder="Sélectionner le département actuel" />
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
                  {assignationMode === 'modify' ? 'Nouveau département' : 'Sélectionner le Département'}
                </Label>
                <div className="grid grid-cols-2 gap-3">
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
                            ? `Département actuel: ${dept.nombre}`
                            : yaAsignado
                              ? `Déjà assigné au département ${dept.nombre}`
                              : `Assigner au département ${dept.nombre}`
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
                            Département actuel
                          </p>
                        ) : !puedeSeleccionarse ? (
                          <p className="text-xs mt-1" style={{ color: '#DC3545' }}>
                            Déjà assigné
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={resetAssignationDialog}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Annuler
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
                  {assignationMode === 'modify' ? 'Modifier l\'assignation' : 'Assigner au Département'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Profil Détaillé du Candidat */}
      <Dialog open={dialogPerfilOpen} onOpenChange={setDialogPerfilOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="perfil-candidato-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Users className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Profil du Candidat
            </DialogTitle>
            <DialogDescription id="perfil-candidato-description">
              Détails complets de la candidature du candidat sélectionné
            </DialogDescription>
          </DialogHeader>

          {candidatoParaPerfil && (() => {
            const numeroArchivo = obtenerNumeroArchivoCandidato(candidatoParaPerfil);
            const cardColor = branding.primaryColor;
            
            return (
              <div className="space-y-6">
                {/* En-tête du profil avec avatar */}
                <div 
                  className="p-6 rounded-xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                        boxShadow: `0 4px 12px ${cardColor}30`
                      }}
                    >
                      <Users className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-2xl font-bold mb-1"
                        style={{ 
                          fontFamily: 'Montserrat, sans-serif',
                          color: branding.primaryColor
                        }}
                      >
                        {candidatoParaPerfil.name}
                      </h3>
                      <p className="text-lg mb-2" style={{ color: branding.secondaryColor }}>
                        {candidatoParaPerfil.position}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {getStatusBadge(candidatoParaPerfil.status)}
                        {numeroArchivo && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/80">
                            <FileText className="w-4 h-4" style={{ color: branding.primaryColor }} />
                            <span 
                              className="text-sm font-mono font-semibold tracking-wide"
                              style={{ color: branding.primaryColor }}
                            >
                              {numeroArchivo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium">{candidatoParaPerfil.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Phone className="w-5 h-5 flex-shrink-0" style={{ color: cardColor }} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                        <p className="text-sm font-medium">{candidatoParaPerfil.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adresse (si disponible) */}
                {(candidatoParaPerfil.adresse || candidatoParaPerfil.ville || candidatoParaPerfil.codePostal || candidatoParaPerfil.appartement) && (
                  <div className="space-y-3">
                    <h4 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                    >
                      <MapPin className="w-5 h-5" />
                      Adresse
                    </h4>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="space-y-2">
                        {candidatoParaPerfil.adresse && (
                          <p className="text-sm font-medium">{candidatoParaPerfil.adresse}</p>
                        )}
                        {candidatoParaPerfil.appartement && (
                          <p className="text-sm text-gray-600">Apt/Unité: {candidatoParaPerfil.appartement}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {candidatoParaPerfil.ville && <span>{candidatoParaPerfil.ville}</span>}
                          {candidatoParaPerfil.ville && candidatoParaPerfil.codePostal && <span>•</span>}
                          {candidatoParaPerfil.codePostal && <span>{candidatoParaPerfil.codePostal}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Détails de la candidature */}
                <div className="space-y-3">
                  <h4 
                    className="font-semibold text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    <Briefcase className="w-5 h-5" />
                    Détails de la candidature
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
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
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <Clock className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: cardColor }} />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Disponibilité</p>
                        <p className="text-sm font-medium">{candidatoParaPerfil.availability}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expérience */}
                <div className="space-y-3">
                  <h4 
                    className="font-semibold text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Expérience
                  </h4>
                  <div 
                    className="p-4 rounded-xl border-l-4"
                    style={{ 
                      backgroundColor: `${branding.secondaryColor}10`,
                      borderLeftColor: branding.secondaryColor
                    }}
                  >
                    <p className="text-sm leading-relaxed">{candidatoParaPerfil.experience}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-between pt-4 border-t">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDialogPerfilOpen(false);
                        setCandidatoParaPerfil(null);
                      }}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Fermer
                    </Button>
                  </div>
                  
                  <div className="flex gap-3">
                    {(() => {
                      const tieneContacto = obtenerContactoCandidato(candidatoParaPerfil);
                      
                      if (tieneContacto) {
                        return (
                          <>
                            <Button
                              variant="outline"
                              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              style={{
                                fontFamily: 'Montserrat, sans-serif',
                                color: branding.primaryColor,
                                borderColor: `${branding.primaryColor}55`
                              }}
                              onClick={() => {
                                setDialogPerfilOpen(false);
                                abrirDialogoAssignacion(candidatoParaPerfil, 'modify');
                              }}
                            >
                              <ArrowRightLeft className="w-4 h-4 mr-2" />
                              Modifier l'assignation
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                              onClick={() => handleEliminarContacto(candidatoParaPerfil)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer le contact
                            </Button>
                          </>
                        );
                      } else {
                        return (
                          <Button
                            className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                            onClick={() => {
                              setDialogPerfilOpen(false);
                              abrirDialogoAssignacion(candidatoParaPerfil, 'assign');
                            }}
                          >
                            <Link className="w-4 h-4 mr-2" />
                            Assigner au département
                          </Button>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}