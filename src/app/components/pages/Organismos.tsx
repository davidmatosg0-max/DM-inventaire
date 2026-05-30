// 🎨🎨🎨 VERSIÓN 3.0.0 - SISTEMA DE LOGOS IMPLEMENTADO 🎨🎨🎨
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Phone, Mail, MapPin, Users, Upload, X, FileText, Bell, Calendar, Percent, UserCheck, UtensilsCrossed, Coffee, Clock, PackageCheck, History, ClipboardCheck, Key, Copy, Check, Send, Languages, Shield, Search, LayoutGrid, List, ExternalLink, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { obtenerComandas } from '../../utils/comandaStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { FormularioOrganismoCompacto } from '../organismos/FormularioOrganismoCompacto';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { AdaptiveBrandLogo } from '../shared/AdaptiveBrandLogo';
import { LanguageSelector } from '../ui/language-selector';
import { generarClaveAccesoUnica } from '../../utils/claveAcceso';
import { MapLink } from '../ui/map-link';
import { construirUrlAccesoOrganismo } from '../../utils/organismoAccessLinks';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import { obtenerPersonasPorOrganismo } from '../../utils/personasResponsablesStorage';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import {
  construirPayloadOrganismo,
  convertirOrganismoAFormulario,
  crearFormularioOrganismoVacio,
  validarFormularioOrganismo,
} from '../../utils/organismoForm';
import { 
  obtenerOrganismos, 
  crearOrganismo, 
  actualizarOrganismo,
  migrarClavesDeAcceso,
  reinicializarClaveAccesoOrganismo,
  type Organismo,
  type ClasificacionOrganismo,
  type IdiomaContactoOrganismo
} from '../../utils/organismosStorage';
import { PERMISOS, tieneAlgunoDeEstosPermisos } from '../../utils/permisos';
import { useBranding } from '../../../hooks/useBranding';
import { AsignarRolContacto } from '../AsignarRolContacto';
import { registrarActividad } from '../../utils/actividadLogger';

// Tipos de organismos predefinidos
const getTiposOrganismo = (t: any) => [
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

const diasCitaOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const ORDEN_CLASIFICACION: ClasificacionOrganismo[] = ['regular', 'eventual', 'collation'];

function obtenerClasificacionOrganismo(organismo: Organismo): ClasificacionOrganismo {
  return organismo.clasificacionOrganismo || (organismo.regular ? 'regular' : 'eventual');
}

function getEtiquetaClasificacion(clasificacion: ClasificacionOrganismo): string {
  switch (clasificacion) {
    case 'regular':
      return 'Organismes reguliers';
    case 'eventual':
      return 'Organismes eventuels';
    case 'collation':
      return 'Organismes collation';
    default:
      return 'Organismes';
  }
}

function getDescripcionClasificacion(clasificacion: ClasificacionOrganismo): string {
  switch (clasificacion) {
    case 'regular':
      return 'Suivi recurrent avec repartition reguliere.';
    case 'eventual':
      return 'Demandes ponctuelles ou interventions occasionnelles.';
    case 'collation':
      return 'Distribution dediee aux collations et services rapides.';
    default:
      return 'Reseau des organismes accredites.';
  }
}

function getAcentoClasificacion(clasificacion: ClasificacionOrganismo): string {
  switch (clasificacion) {
    case 'regular':
      return '#1E73BE';
    case 'eventual':
      return '#F59E0B';
    case 'collation':
      return '#8B5CF6';
    default:
      return '#64748B';
  }
}

export function Organismos() {
  const { t } = useTranslation();
  const branding = useBranding();
  const tiposOrganismo = getTiposOrganismo(t);
  
  // Log para verificar que el código se recargó
  useEffect(() => {
    console.log('%c🎨🎨🎨 ORGANISMOS v3.0.0 - SISTEMA DE LOGOS IMPLEMENTADO 🎨🎨🎨', `background: linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor}); color: white; font-size: 20px; font-weight: bold; padding: 15px; border-radius: 8px;`);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', `color: ${branding.primaryColor}; font-weight: bold;`);
    console.log('%c🎨 NUEVO: Sistema completo de gestión de logos', `color: ${branding.primaryColor}; font-size: 16px; font-weight: bold;`);
    console.log('%c   ✓ Cargar logo en formulario de creación', `color: ${branding.secondaryColor}; font-weight: bold;`);
    console.log('%c   ✓ Ver logo en tarjetas de organismos', `color: ${branding.secondaryColor}; font-weight: bold;`);
    console.log('%c   ✓ Editar logo en perfil del organismo', `color: ${branding.secondaryColor}; font-weight: bold;`);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', `color: ${branding.primaryColor}; font-weight: bold;`);
    console.log('%c🏘️ Campo Quartier en PRIMERA posición', `color: ${branding.warningColor}; font-size: 14px; font-weight: bold;`);
    console.log('%c📍 Auto-rellenado de dirección activado', `color: ${branding.secondaryColor}; font-size: 14px; font-weight: bold;`);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', `color: ${branding.primaryColor}; font-weight: bold;`);
    console.log('%c⚠️ SI NO VES EL CAMPO LOGO, PRESIONA: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)', `background: ${branding.dangerColor}; color: white; font-size: 14px; font-weight: bold; padding: 8px; border-radius: 4px;`);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', `color: ${branding.primaryColor}; font-weight: bold;`);
    
  }, [branding, t]);

  // Usar el sistema de permisos expandido para no bloquear a desarrolladores
  // ni a usuarios con acceso total cuando el módulo de Organismos sí está habilitado.
  const puedeGestionarOrganismos = tieneAlgunoDeEstosPermisos([
    PERMISOS.ORGANISMOS_CREAR,
    PERMISOS.ORGANISMOS_EDITAR,
    PERMISOS.ADMINISTRADOR_LIAISON,
    PERMISOS.ADMINISTRADOR_GENERAL,
    PERMISOS.DESARROLLADOR,
    PERMISOS.ACCESO_TOTAL,
  ]);
  
  // Cargar organismos desde el storage
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [organismoDialogOpen, setOrganismoDialogOpen] = useState(false);
  const [seleccionOrganismoPRSOpen, setSeleccionOrganismoPRSOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoVisualizacion, setModoVisualizacion] = useState(false);
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState<any>(null);
  const organismoSeleccionadoAccessKey = String(organismoSeleccionado?.claveAcceso || '').trim();
  const organismoSeleccionadoAccessUrl = organismoSeleccionadoAccessKey
    ? construirUrlAccesoOrganismo(organismoSeleccionadoAccessKey)
    : '';
  const [searchTerm, setSearchTerm] = useState('');
  const [vistaOrganismos, setVistaOrganismos] = useState<'grid' | 'list'>('grid');
  const [searchOrganismoPRS, setSearchOrganismoPRS] = useState('');
  
  // Estados para AsignarRolContacto
  const [dialogAsignarRolOpen, setDialogAsignarRolOpen] = useState(false);
  const [contactoParaRol, setContactoParaRol] = useState<{
    id: string;
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
    cargo: string;
    modulo: 'organismo' | 'benevole' | 'donador' | 'vendedor';
  } | null>(null);
  
  // Cargar organismos al montar el componente
  useEffect(() => {
    // Ejecutar migración de claves de acceso
    migrarClavesDeAcceso();
    cargarOrganismos();
  }, []);

  // 🔔 Escuchar cambios en organismos desde otros módulos
  useEffect(() => {
    const handleOrganismoChange = () => {
      console.log('🔄 [Organismos] Recargando debido a cambio en otro módulo...');
      cargarOrganismos();
    };

    window.addEventListener('organismo:changed', handleOrganismoChange);
    
    return () => {
      window.removeEventListener('organismo:changed', handleOrganismoChange);
    };
  }, []);

  // Resetear formulario cuando se cierra el diálogo
  useEffect(() => {
    if (!organismoDialogOpen) {
      setFormOrganismo(crearFormularioOrganismoVacio());
      setPersonasAutorizadas([]);
    }
  }, [organismoDialogOpen]);

  const cargarOrganismos = () => {
    const organismosActuales = obtenerOrganismos();
    setOrganismos(organismosActuales);
  };
  
  // Estado para personas autorizadas
  const [personasAutorizadas, setPersonasAutorizadas] = useState<any[]>([]);
  
  // Roles disponibles del sistema
  const rolesDisponibles = [
    {
      id: 'organismo',
      nombre: 'Organisme',
      descripcion: 'Accès au portail public de l\'organisme',
      color: branding.primaryColor
    },
    {
      id: 'coordinador',
      nombre: 'Coordinateur Organisme',
      descripcion: 'Gestion complète de l\'organisme',
      color: '#FF9800'
    },
    {
      id: 'contact-organismo',
      nombre: 'Contact Organisme',
      descripcion: 'Accès limité pour recevoir des notifications',
      color: branding.secondaryColor
    }
  ];
  
  // Estado para sistema de emails
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [tipoEmail, setTipoEmail] = useState<'individual' | 'grupo'>('individual');
  const [emailDestinatario, setEmailDestinatario] = useState<any>(null);
  const [organismosSeleccionados, setOrganismosSeleccionados] = useState<string[]>([]);
  const [formEmail, setFormEmail] = useState({
    asunto: '',
    mensaje: ''
  });
  
  // Estado del formulario
  const [formOrganismo, setFormOrganismo] = useState(crearFormularioOrganismoVacio());

  // Datos mock para historial (en producción vendrían de la base de datos)
  const historialDonaciones = [
    { id: 1, fecha: '2024-01-15', productos: 'Riz, Haricots, Huile', cantidad: '150 kg', valorMonetario: '$2,450' },
    { id: 2, fecha: '2024-01-08', productos: 'Lait, Céréales, Sucre', cantidad: '200 kg', valorMonetario: '$3,800' },
    { id: 3, fecha: '2024-01-01', productos: 'Pâtes, Thon, Légumes', cantidad: '180 kg', valorMonetario: '$2,950' },
  ];

  const historialPRS = [
    { id: 1, fecha: '2024-01-20', tipoServicio: 'Distribution régulière', beneficiarios: 120, responsable: 'Juan Perez' },
    { id: 2, fecha: '2024-01-13', tipoServicio: 'Distribution spéciale', beneficiarios: 95, responsable: 'Maria Lopez' },
    { id: 3, fecha: '2024-01-06', tipoServicio: 'Distribution régulière', beneficiarios: 110, responsable: 'Juan Perez' },
  ];

  // Cálculo automático del porcentaje de repartición
  const calcularPorcentajeAutomatico = () => {
    const { personasServidas, cantidadColaciones, cantidadAlmuerzos } = formOrganismo;
    const totalServicios = personasServidas + cantidadColaciones + cantidadAlmuerzos;
    
    if (totalServicios > 0) {
      // Fórmula: base de 1000 servicios = 100%
      const porcentaje = Math.min((totalServicios / 1000) * 100, 100);
      setFormOrganismo({ ...formOrganismo, porcentajeReparticion: parseFloat(porcentaje.toFixed(2)) });
    }
  };

  const agregarContacto = () => {
    setFormOrganismo({
      ...formOrganismo,
      contactosNotificacion: [...formOrganismo.contactosNotificacion, { nombre: '', email: '', cargo: '', joursDisponibles: [] }]
    });
  };

  const eliminarContacto = (index: number) => {
    const nuevosContactos = formOrganismo.contactosNotificacion.filter((_, i) => i !== index);
    setFormOrganismo({ ...formOrganismo, contactosNotificacion: nuevosContactos });
  };

  const actualizarContacto = (index: number, campo: string, valor: string | JourDisponible[]) => {
    const nuevosContactos = [...formOrganismo.contactosNotificacion];
    nuevosContactos[index] = { ...nuevosContactos[index], [campo]: valor };
    setFormOrganismo({ ...formOrganismo, contactosNotificacion: nuevosContactos });
  };

  const organismosFiltrados = organismos.filter(o =>
    o.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const organismosAgrupadosPorClasificacion = ORDEN_CLASIFICACION
    .map((clasificacion) => ({
      clasificacion,
      organismos: organismosFiltrados.filter((organismo) => obtenerClasificacionOrganismo(organismo) === clasificacion),
    }))
    .filter((grupo) => grupo.organismos.length > 0);

  const renderOrganismoActions = (organismo: Organismo) => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAbrirEmailIndividual(organismo)}
        className="h-9 w-full rounded-xl border-transparent text-white sm:w-auto"
        style={{ backgroundColor: branding.secondaryColor, borderColor: branding.secondaryColor }}
      >
        <Send className="mr-1 h-4 w-4" />
        Email
      </Button>
      <Button variant="outline" size="sm" className="h-9 w-full rounded-xl border-slate-200 bg-white sm:flex-1" onClick={() => handleVerPerfil(organismo)}>
        <Eye className="mr-1 h-4 w-4" />
        {t('organisms.viewProfile')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-full rounded-xl border-slate-200 bg-white sm:flex-1"
        onClick={() => {
          if (!puedeGestionarOrganismos) {
            toast.error(t('organisms.accessDeniedTitle'), {
              description: t('organisms.editPermissionDescription')
            });
            return;
          }
          handleEditarPerfil(organismo);
        }}
        disabled={!puedeGestionarOrganismos}
        title={!puedeGestionarOrganismos ? t('organisms.editPermissionTooltip') : ''}
      >
        <Edit className="mr-1 h-4 w-4" />
        {t('organisms.edit')}
      </Button>
    </>
  );

  const handleCrearOrganismo = () => {
    const errorValidacion = validarFormularioOrganismo(formOrganismo);
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }

    // Generar clave de acceso única
    const claveAcceso = generarClaveAccesoUnica(formOrganismo.nombre, organismos.map(org => org.claveAcceso || ''));
    const payloadOrganismo = construirPayloadOrganismo(formOrganismo);

    try {
      // Crear el organismo en el storage
      const nuevoOrganismo = crearOrganismo({
        ...payloadOrganismo,
        claveAcceso: claveAcceso,
      });
      
      // Recargar la lista de organismos
      cargarOrganismos();
      console.log('Organismo creado con clave:', nuevoOrganismo.claveAcceso);
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Organismes',
        'crear',
        `Organisme "${formOrganismo.nombre}" créé avec clé d'accès: ${nuevoOrganismo.claveAcceso}`,
        { organismoId: nuevoOrganismo.id, claveAcceso: nuevoOrganismo.claveAcceso }
      );
      
      toast.success(`${t('organisms.organismCreated')} ${nuevoOrganismo.claveAcceso}`, {
        duration: 5000,
      });
      
      setOrganismoDialogOpen(false);
      setModoVisualizacion(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('organisms.errorSavingChanges'));
    }
  };

  const handleVerPerfil = (organismo: any) => {
    setOrganismoSeleccionado(organismo);
    
    // Cargar personas autorizadas del organismo
    const personas = obtenerPersonasPorOrganismo(organismo.id);
    setPersonasAutorizadas(personas);
    
    setFormOrganismo(convertirOrganismoAFormulario(organismo));
    setModoEdicion(false);
    setModoVisualizacion(true);
    setOrganismoDialogOpen(true);
  };

  const handleEditarPerfil = (organismo: any) => {
    setOrganismoSeleccionado(organismo);
    
    // Cargar personas autorizadas del organismo
    const personas = obtenerPersonasPorOrganismo(organismo.id);
    setPersonasAutorizadas(personas);
    
    setFormOrganismo(convertirOrganismoAFormulario(organismo));
    setModoEdicion(true);
    setModoVisualizacion(false);
    setOrganismoDialogOpen(true);
  };

  const handleReinicializarClaveAcceso = () => {
    if (!organismoSeleccionado?.id) {
      return;
    }

    try {
      const organismoActualizado = reinicializarClaveAccesoOrganismo(organismoSeleccionado.id);

      if (!organismoActualizado) {
        toast.error('Impossible de reinitialiser la cle d\'acces.');
        return;
      }

      setOrganismoSeleccionado(organismoActualizado);
      cargarOrganismos();
      toast.success('Cle d\'acces reinitialisee', {
        description: 'Les anciens liens du portail organisme devront etre remplaces.',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la reinitialisation de la cle d\'acces');
    }
  };

  const handleGuardarCambios = () => {
    if (organismoSeleccionado && organismoSeleccionado.id) {
      const errorValidacion = validarFormularioOrganismo(formOrganismo);
      if (errorValidacion) {
        toast.error(errorValidacion);
        return;
      }

      try {
        // Actualizar el organismo en el storage
        actualizarOrganismo(organismoSeleccionado.id, construirPayloadOrganismo(formOrganismo));
        
        // Recargar la lista de organismos
        cargarOrganismos();
        
        // 📝 REGISTRAR ACTIVIDAD
        registrarActividad(
          'Organismes',
          'modificar',
          `Organisme "${formOrganismo.nombre}" modifié`,
          { organismoId: organismoSeleccionado.id }
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('organisms.errorSavingChanges'));
        return;
      }
    }
    
    toast.success(t('organisms.changesSaved'));
    setOrganismoDialogOpen(false);
    setModoEdicion(false);
    setModoVisualizacion(false);
  };

  // Funciones para emails
  const handleAbrirEmailIndividual = (organismo: any) => {
    setTipoEmail('individual');
    setEmailDestinatario(organismo);
    setFormEmail({ asunto: '', mensaje: '' });
    setEmailDialogOpen(true);
  };

  const handleAbrirEmailGrupal = () => {
    setTipoEmail('grupo');
    setEmailDestinatario(null);
    setOrganismosSeleccionados([]);
    setFormEmail({ asunto: '', mensaje: '' });
    setEmailDialogOpen(true);
  };

  const handleToggleOrganismoSeleccionado = (organismoId: string) => {
    setOrganismosSeleccionados(prev => 
      prev.includes(organismoId)
        ? prev.filter(id => id !== organismoId)
        : [...prev, organismoId]
    );
  };

  const handleSeleccionarTodos = () => {
    if (organismosSeleccionados.length === organismosFiltrados.length) {
      setOrganismosSeleccionados([]);
    } else {
      setOrganismosSeleccionados(organismosFiltrados.map(o => o.id));
    }
  };

  const handleEnviarEmail = () => {
    if (tipoEmail === 'individual') {
      toast.success(`${t('organisms.email.emailSentSuccessfully')} ${emailDestinatario?.nombre}`);
    } else {
      toast.success(`${t('organisms.email.emailSentSuccessfully')} ${organismosSeleccionados.length} ${t('organisms.email.organisms')}`);
    }
    setEmailDialogOpen(false);
    setFormEmail({ asunto: '', mensaje: '' });
    setOrganismosSeleccionados([]);
  };

  const totalBeneficiarios = organismos.reduce((sum, o) => sum + o.beneficiarios, 0);
  const organismosActivos = organismos.filter(o => o.activo).length;

  return (
    <div 
      className="app-compact-page relative min-h-screen overflow-hidden p-3 sm:p-4 lg:p-5"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, rgba(26,77,122,0.08) 0%, rgba(45,149,97,0.06) 100%)',
      }}
    >
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div 
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 transform rounded-full opacity-8 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className="app-compact-page__content relative z-10 space-y-3 sm:space-y-4">
        {/* Header con glassmorphism */}
        <div className="app-compact-panel rounded-[28px] border border-white/70 bg-white/92 p-4 shadow-[0_24px_60px_-38px_rgba(15,45,71,0.34)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {branding.logo ? (
                <AdaptiveBrandLogo
                  src={branding.logo}
                  alt="Logo"
                  wrapperClassName="h-11 w-11 sm:h-12 sm:w-12"
                  containerClassName="border shadow-md"
                  containerStyle={{ borderColor: branding.primaryColor }}
                  squareRadiusClassName="rounded-[18px]"
                  shadowClassName=""
                />
              ) : (
                <div 
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md sm:h-12 sm:w-12"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Liaison
                  </span>
                  <h1 
                    className="break-words text-xl font-bold tracking-tight sm:text-2xl md:text-[30px]"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: branding.primaryColor 
                    }}
                  >
                    {t('organisms.title')}
                  </h1>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Gestion centralisée des organismes bénéficiaires, de leurs contacts et des accès de portail.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-wrap gap-2 xl:w-auto xl:justify-end">
              <Button 
                onClick={handleAbrirEmailGrupal}
                className="h-10 flex-1 rounded-2xl px-4 text-white xl:flex-none"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 500, 
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                  boxShadow: `0 10px 24px -18px ${branding.secondaryColor}`
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                {t('organisms.email.send')}
              </Button>
              <Button 
                className={puedeGestionarOrganismos ? "h-10 flex-1 rounded-2xl px-4 text-white xl:flex-none" : "h-10 flex-1 cursor-not-allowed rounded-2xl bg-gray-300 px-4 text-gray-500 opacity-60 xl:flex-none"} 
                style={puedeGestionarOrganismos ? { 
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 500, 
                  background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
                  boxShadow: `0 10px 24px -18px ${branding.primaryColor}`
                } : { fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                disabled={!puedeGestionarOrganismos}
                onClick={() => {
                  if (!puedeGestionarOrganismos) {
                    toast.error(t('organisms.accessDeniedTitle'), {
                      description: t('organisms.createPermissionDescription')
                    });
                    return;
                  }
                  setModoEdicion(false);
                  setModoVisualizacion(false);
                  setOrganismoSeleccionado(null);
                  setOrganismoDialogOpen(true);
                }}
                title={!puedeGestionarOrganismos ? t('organisms.createPermissionTooltip') : ''}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('organisms.newOrganism')}
              </Button>

              <FormularioOrganismoCompacto
                abierto={organismoDialogOpen}
                onCerrar={() => {
                  setOrganismoDialogOpen(false);
                  setModoEdicion(false);
                  setModoVisualizacion(false);
                  setOrganismoSeleccionado(null);
                }}
                formulario={formOrganismo}
                setFormulario={setFormOrganismo}
                modoEdicion={modoEdicion}
                modoVisualizacion={modoVisualizacion}
                onGuardar={modoEdicion ? handleGuardarCambios : handleCrearOrganismo}
                tiposOrganismo={tiposOrganismo}
                encabezadoExtra={organismoSeleccionado ? (
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
                                {organismoSeleccionado.nombre}
                              </h3>
                              <Badge className="border-0 bg-white/15 text-white backdrop-blur-sm">
                                {organismoSeleccionado.activo ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-white/80">
                              Portail organisme avec acces direct et gestion centralisee de la cle d'acces.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/90">
                              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                                {organismoSeleccionado.tipo || 'Type a definir'}
                              </span>
                              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                                {organismoSeleccionado.responsable || 'Responsable non renseigne'}
                              </span>
                              <span className="rounded-full border border-white/15 bg-emerald-400/15 px-3 py-1 text-emerald-50">
                                {organismoSeleccionadoAccessKey ? 'Cle disponible' : 'Cle non disponible'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col xl:min-w-[220px]">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-amber-200/50 bg-amber-400/10 text-white hover:bg-amber-400/20"
                            onClick={handleReinicializarClaveAcceso}
                          >
                            <History className="mr-2 h-4 w-4" />
                            Reinitialiser la cle
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                            onClick={async () => {
                              const exito = await copiarAlPortapapeles(organismoSeleccionadoAccessKey);
                              if (exito) {
                                toast.success('Clé d\'accès copiée');
                              }
                            }}
                            disabled={!organismoSeleccionadoAccessKey}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copier la cle
                          </Button>
                          <Button
                            type="button"
                            className="bg-white text-slate-900 shadow-lg hover:bg-white/90"
                            onClick={() => window.open(organismoSeleccionadoAccessUrl, '_blank', 'noopener,noreferrer')}
                            disabled={!organismoSeleccionadoAccessUrl}
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
                            {organismoSeleccionadoAccessKey || 'Cle non disponible'}
                          </p>
                        </div>
                        <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">Coordonnees</p>
                          <div className="mt-2 space-y-1 text-sm text-white/90">
                            <p className="break-all">{organismoSeleccionado.email || 'Aucun email'}</p>
                            <p>{organismoSeleccionado.telefono || 'Aucun telephone'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/15 bg-[#0f172a]/16 px-4 py-3">
                        <div className="flex items-center gap-2 text-white/85">
                          <ExternalLink className="h-4 w-4" />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Lien du portail</p>
                        </div>
                        <p className="mt-2 text-sm text-white/75">
                          Ce lien ouvre le portail organisme en conservant sa cle de connexion pre-remplie.
                        </p>
                        <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 font-mono text-[11px] text-white/92 break-all">
                          {organismoSeleccionadoAccessUrl || 'Lien non disponible tant qu\'aucune cle n\'est definie.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : undefined}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card-glass cursor-pointer rounded-2xl border border-white/70 p-3 shadow-sm" style={{ borderLeft: `4px solid ${branding.primaryColor}` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('organisms.totalOrganisms')}</p>
              <p className="text-xl font-bold sm:text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                {organismos.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Base visible dans le registre principal.</p>
            </div>
            <div 
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md sm:h-10 sm:w-10"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="card-glass cursor-pointer rounded-2xl border border-white/70 p-3 shadow-sm" style={{ borderLeft: `4px solid ${branding.secondaryColor}` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('organisms.activeOrganisms')}</p>
              <p className="text-xl font-bold sm:text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                {organismosActivos}
              </p>
              <p className="mt-1 text-xs text-slate-500">Organismes actuellement opérationnels.</p>
            </div>
            <div 
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md sm:h-10 sm:w-10"
              style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
            >
              <Check className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="card-glass cursor-pointer rounded-2xl border border-white/70 p-3 shadow-sm" style={{ borderLeft: '4px solid #FFC107' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('organisms.totalBeneficiaries')}</p>
              <p className="text-xl font-bold text-[#FFC107] sm:text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {totalBeneficiarios}
              </p>
              <p className="mt-1 text-xs text-slate-500">Population totale couverte par le réseau.</p>
            </div>
            <div 
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md sm:h-10 sm:w-10"
              style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)' }}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        </div>

        {/* Search con glassmorphism */}
        <div className="app-compact-panel rounded-[24px] border border-white/70 bg-white/92 p-3 shadow-[0_18px_45px_-34px_rgba(15,45,71,0.3)] backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t('organisms.searchOrganism')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-2xl border-slate-200 bg-white pl-10 text-sm shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setVistaOrganismos('grid')}
                  className={`h-8 rounded-xl px-2.5 ${vistaOrganismos === 'grid' ? 'shadow-sm' : ''}`}
                  style={vistaOrganismos === 'grid' ? { backgroundColor: branding.primaryColor, color: 'white' } : { color: '#475569' }}
                  title="Vue cartes"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setVistaOrganismos('list')}
                  className={`h-8 rounded-xl px-2.5 ${vistaOrganismos === 'list' ? 'shadow-sm' : ''}`}
                  style={vistaOrganismos === 'list' ? { backgroundColor: branding.primaryColor, color: 'white' } : { color: '#475569' }}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] text-slate-700">
                {organismosFiltrados.length} affiché(s)
              </span>
            </div>
          </div>
        </div>

        {/* Organismos Grid */}
        <div className="space-y-5">
          {organismosAgrupadosPorClasificacion.map(({ clasificacion, organismos: organismosDelGrupo }) => {
            const colorClasificacion = getAcentoClasificacion(clasificacion);

            return (
              <section key={clasificacion} className="space-y-3">
                <div
                  className="rounded-[24px] border border-white/70 bg-white/92 px-4 py-3 shadow-[0_18px_45px_-34px_rgba(15,45,71,0.3)] backdrop-blur-xl"
                  style={{ borderLeft: `5px solid ${colorClasificacion}` }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Classification
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-[#16324f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {getEtiquetaClasificacion(clasificacion)}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {getDescripcionClasificacion(clasificacion)}
                      </p>
                    </div>
                    <Badge className="rounded-full px-3 py-1 text-[11px] text-white" style={{ backgroundColor: colorClasificacion }}>
                      {organismosDelGrupo.length} organisme(s)
                    </Badge>
                  </div>
                </div>

                {vistaOrganismos === 'grid' ? (
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
                    {organismosDelGrupo.map((organismo) => {
                      const comandasOrganismo = obtenerComandas().filter(c => c.organismoId === organismo.id);

                      return (
                        <Card key={organismo.id} className="overflow-hidden rounded-[24px] border border-white/80 bg-white/96 shadow-[0_18px_40px_-32px_rgba(15,45,71,0.34)] transition-shadow hover:shadow-[0_24px_55px_-34px_rgba(15,45,71,0.42)]">
                          <CardHeader className="px-4 pb-2 pt-4">
                            <div className="flex items-start justify-between gap-3">
                              {organismo.logo && (
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:h-14 sm:w-14">
                                  <img
                                    src={organismo.logo}
                                    alt={`Logo ${organismo.nombre}`}
                                    className="h-full w-full object-contain p-1"
                                  />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <CardTitle className="mb-1 text-base leading-tight break-words sm:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {organismo.nombre}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: branding.primaryColor }}>
                                    {tiposOrganismo.find(tipo => tipo.nombre === organismo.tipo)?.nombre || organismo.tipo}
                                  </Badge>
                                  <Badge className="rounded-full px-2.5 py-0.5 text-[11px] text-white" style={{ backgroundColor: colorClasificacion }}>
                                    {getEtiquetaClasificacion(clasificacion).replace('Organismes ', '')}
                                  </Badge>
                                  {organismo.participaPRS && (
                                    <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: branding.secondaryColor }}>
                                      ✓ PRS
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {organismo.activo ? (
                                <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: branding.secondaryColor }}>
                                  {t('common.active')}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">
                                  {t('common.inactive')}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3 px-4 pb-4">
                            <div className="grid gap-2 text-xs text-slate-600 sm:text-[13px]">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                                <MapLink direccion={organismo.direccion} variant="inline" showIcon={false} />
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span>{organismo.responsable} • {organismo.beneficiarios} {t('organisms.beneficiaries')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span>{organismo.telefono}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span>{organismo.email}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t('organisms.orders')}</p>
                                <p className="text-xs text-slate-500">Activité récente de commande</p>
                              </div>
                              <p className="text-lg font-bold" style={{ color: '#1E73BE', fontFamily: 'Montserrat, sans-serif' }}>
                                {comandasOrganismo.length}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                              {renderOrganismoActions(organismo)}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {organismosDelGrupo.map((organismo) => {
                      const comandasOrganismo = obtenerComandas().filter(c => c.organismoId === organismo.id);

                      return (
                        <div key={organismo.id} className="rounded-[24px] border border-white/80 bg-white/96 p-4 shadow-[0_18px_40px_-32px_rgba(15,45,71,0.34)] transition-shadow hover:shadow-[0_24px_55px_-34px_rgba(15,45,71,0.42)]">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 flex-1 gap-3">
                              {organismo.logo && (
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:h-14 sm:w-14">
                                  <img
                                    src={organismo.logo}
                                    alt={`Logo ${organismo.nombre}`}
                                    className="h-full w-full object-contain p-1"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-base font-semibold text-[#16324f] sm:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    {organismo.nombre}
                                  </h4>
                                  {organismo.activo ? (
                                    <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: branding.secondaryColor }}>
                                      {t('common.active')}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">
                                      {t('common.inactive')}
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: branding.primaryColor }}>
                                    {tiposOrganismo.find(tipo => tipo.nombre === organismo.tipo)?.nombre || organismo.tipo}
                                  </Badge>
                                  <Badge className="rounded-full px-2.5 py-0.5 text-[11px] text-white" style={{ backgroundColor: colorClasificacion }}>
                                    {getEtiquetaClasificacion(clasificacion).replace('Organismes ', '')}
                                  </Badge>
                                  {organismo.participaPRS && (
                                    <Badge className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ backgroundColor: branding.secondaryColor }}>
                                      ✓ PRS
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2 sm:text-[13px] xl:grid-cols-4">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                                    <MapLink direccion={organismo.direccion} variant="inline" showIcon={false} />
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="h-4 w-4 text-slate-400" />
                                    <span>{organismo.responsable} • {organismo.beneficiarios} {t('organisms.beneficiaries')}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span>{organismo.telefono}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span>{organismo.email}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 xl:min-w-[300px] xl:max-w-[320px]">
                              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t('organisms.orders')}</p>
                                  <p className="text-xs text-slate-500">Activité récente de commande</p>
                                </div>
                                <p className="text-lg font-bold" style={{ color: '#1E73BE', fontFamily: 'Montserrat, sans-serif' }}>
                                  {comandasOrganismo.length}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                                {renderOrganismoActions(organismo)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

      {/* Dialog de Envío de Email */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="app-dialog-comfort max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="email-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" style={{ color: branding.secondaryColor }} />
                {tipoEmail === 'individual' 
                  ? `${t('organisms.email.sendTo')} ${emailDestinatario?.nombre}` 
                  : t('organisms.email.groupEmail')}
              </div>
            </DialogTitle>
            <DialogDescription id="email-dialog-description">
              {tipoEmail === 'individual' 
                ? t('organisms.email.emailModalIndividualDescription') 
                : t('organisms.email.emailModalGroupDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
            {tipoEmail === 'grupo' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label className="text-base font-medium">{t('organisms.email.selectOrganisms')}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSeleccionarTodos}
                    className="text-xs"
                  >
                    {organismosSeleccionados.length === organismosFiltrados.length 
                      ? t('organisms.email.deselectAll') 
                      : t('organisms.email.selectAll')}
                  </Button>
                </div>

                <div className="border rounded-lg p-2.5 sm:p-3 max-h-52 sm:max-h-60 overflow-y-auto space-y-2">
                  {organismosFiltrados.map(organismo => (
                    <label
                      key={organismo.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={organismosSeleccionados.includes(organismo.id)}
                        onChange={() => handleToggleOrganismoSeleccionado(organismo.id)}
                        className="w-4 h-4"
                      />
                      {organismo.logo && (
                        <div className="flex-shrink-0 w-10 h-10 border border-gray-200 rounded overflow-hidden bg-white">
                          <img 
                            src={organismo.logo} 
                            alt={`Logo ${organismo.nombre}`}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{organismo.nombre}</p>
                        <p className="text-xs text-[#666666]">{organismo.email}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-[#1E73BE] font-medium">
                    {organismosSeleccionados.length} {t('organisms.email.organismsSelected')}
                  </p>
                </div>
              </div>
            )}

            {tipoEmail === 'individual' && emailDestinatario && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-sm font-medium text-[#333333]">{emailDestinatario.nombre}</p>
                <p className="text-sm text-[#666666]">{emailDestinatario.email}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('organisms.email.subject')}</Label>
              <Input
                placeholder={t('organisms.email.subjectPlaceholder')}
                value={formEmail.asunto}
                onChange={(e) => setFormEmail({ ...formEmail, asunto: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('organisms.email.message')}</Label>
              <Textarea
                placeholder={t('organisms.email.messagePlaceholder')}
                rows={8}
                value={formEmail.mensaje}
                onChange={(e) => setFormEmail({ ...formEmail, mensaje: e.target.value })}
                className="resize-none"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-[#666666]">
                {t('organisms.email.demoSystemWarning')}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setEmailDialogOpen(false);
                setFormEmail({ asunto: '', mensaje: '' });
                setOrganismosSeleccionados([]);
              }}
            >
              {t('organisms.email.cancel')}
            </Button>
            <Button
              onClick={handleEnviarEmail}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
              disabled={
                !formEmail.asunto.trim() || 
                !formEmail.mensaje.trim() || 
                (tipoEmail === 'grupo' && organismosSeleccionados.length === 0)
              }
            >
              <Send className="w-4 h-4 mr-2" />
              {t('organisms.email.send')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Asignar Rol a Contacto */}
      {contactoParaRol && (
        <AsignarRolContacto
          open={dialogAsignarRolOpen}
          onOpenChange={setDialogAsignarRolOpen}
          contacto={contactoParaRol}
          rolesDisponibles={rolesDisponibles}
          onGuardar={(datosAcceso) => {
            console.log('✅ Accès créé pour contact d\'organisme:', datosAcceso);
            toast.success(t('organisms.systemAccessCreated', { name: contactoParaRol.nombreCompleto }));
            setContactoParaRol(null);
          }}
        />
      )}
      </div>
    </div>
  );
}
