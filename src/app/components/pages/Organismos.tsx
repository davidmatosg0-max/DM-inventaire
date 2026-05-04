// 🎨🎨🎨 VERSIÓN 3.0.0 - SISTEMA DE LOGOS IMPLEMENTADO 🎨🎨🎨
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Edit, Phone, Mail, MapPin, Users, Upload, X, FileText, Bell, Calendar, Percent, UserCheck, UtensilsCrossed, Coffee, Clock, PackageCheck, History, ClipboardCheck, Key, Copy, Check, Send, Sparkles, Languages, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { obtenerComandas } from '../../utils/comandaStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { PerfilOrganismoDialog } from '../organismos/PerfilOrganismoDialog';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { LanguageSelector } from '../ui/language-selector';
import { generarClaveAcceso } from '../../utils/claveAcceso';
import { MapLink } from '../ui/map-link';
import { obtenerPersonasPorOrganismo } from '../../utils/personasResponsablesStorage';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { 
  obtenerOrganismos, 
  crearOrganismo, 
  actualizarOrganismo,
  migrarClavesDeAcceso,
  type Organismo,
  type IdiomaContactoOrganismo
} from '../../utils/organismosStorage';
import { esAdministradorLiaison } from '../../utils/sesionStorage';
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
    
    // Mostrar toast de bienvenida a la nueva versión
    setTimeout(() => {
      toast.success(`🎨 ${t('organisms.version.toast.title')}`, {
        description: t('organisms.version.toast.description'),
        duration: 8000,
      });
    }, 1000);
  }, [branding, t]);

  // Verificar permisos del usuario
  const puedeGestionarOrganismos = esAdministradorLiaison();
  
  // Cargar organismos desde el storage
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [organismoDialogOpen, setOrganismoDialogOpen] = useState(false);
  const [perfilDialogOpen, setPerfilDialogOpen] = useState(false);
  const [seleccionOrganismoPRSOpen, setSeleccionOrganismoPRSOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      setFormOrganismo({
        nombre: '',
        tipo: '',
        codigoPostal: '',
        direccion: '',
        quartier: '',
        responsable: '',
        beneficiarios: 0,
        telefono: '',
        email: '',
        frecuenciaCita: '',
        horaCita: '',
        participantePRS: false,
        regular: true,
        activo: true,
        personasServidas: 0,
        cantidadColaciones: 0,
        cantidadAlmuerzos: 0,
        porcentajeReparticion: 0,
        notas: '',
        notificaciones: true,
        logo: null,
        documentoPDF: null,
        contactosNotificacion: [{ nombre: '', email: '', cargo: '', joursDisponibles: [] }],
        fechaInicioInactividad: '',
        fechaFinInactividad: '',
        contactoCargo: '',
        contactoTelefono: '',
        contactoEmail: '',
        contactoJoursDisponibles: []
      });
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
  const [formOrganismo, setFormOrganismo] = useState({
    nombre: '',
    tipo: '',
    codigoPostal: '',
    direccion: '',
    quartier: '',
    responsable: '',
    beneficiarios: 0,
    telefono: '',
    email: '',
    frecuenciaCita: '',
    horaCita: '',
    participantePRS: false,
    regular: true,
    activo: true,
    personasServidas: 0,
    cantidadColaciones: 0,
    cantidadAlmuerzos: 0,
    porcentajeReparticion: 0,
    notas: '',
    notificaciones: true,
    logo: null as string | null,
    documentoPDF: null as string | null,
    contactosNotificacion: [{ nombre: '', email: '', cargo: '', joursDisponibles: [] as JourDisponible[] }],
    fechaInicioInactividad: '',
    fechaFinInactividad: '',
    contactoCargo: '',
    contactoTelefono: '',
    contactoEmail: '',
    contactoJoursDisponibles: [] as JourDisponible[]
  });

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

  const handleCrearOrganismo = () => {
    // Generar clave de acceso única
    const claveAcceso = generarClaveAcceso(formOrganismo.nombre);

    try {
      // Crear el organismo en el storage
      const nuevoOrganismo = crearOrganismo({
        nombre: formOrganismo.nombre,
        tipo: formOrganismo.tipo,
        email: formOrganismo.email,
        telefono: formOrganismo.telefono,
        direccion: formOrganismo.direccion,
        codigoPostal: formOrganismo.codigoPostal,
        quartier: formOrganismo.quartier,
        zona: '',
        responsable: formOrganismo.responsable,
        beneficiarios: formOrganismo.beneficiarios,
        activo: formOrganismo.activo,
        regular: formOrganismo.regular,
        participantePRS: formOrganismo.participantePRS,
        frecuenciaCita: formOrganismo.frecuenciaCita,
        horaCita: formOrganismo.horaCita,
        personasServidas: formOrganismo.personasServidas,
        cantidadColaciones: formOrganismo.cantidadColaciones,
        cantidadAlmuerzos: formOrganismo.cantidadAlmuerzos,
        porcentajeReparticion: formOrganismo.porcentajeReparticion,
        notas: formOrganismo.notas,
        notificaciones: formOrganismo.notificaciones,
        logo: formOrganismo.logo,
        documentoPDF: formOrganismo.documentoPDF,
        claveAcceso: claveAcceso,
        contactosNotificacion: formOrganismo.contactosNotificacion
      });
      
      // Recargar la lista de organismos
      cargarOrganismos();
      console.log('Organismo creado con clave:', claveAcceso);
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Organismes',
        'crear',
        `Organisme "${formOrganismo.nombre}" créé avec clé d'accès: ${claveAcceso}`,
        { organismoId: nuevoOrganismo.id, claveAcceso }
      );
      
      toast.success(`${t('organisms.organismCreated')} ${claveAcceso}`, {
        duration: 5000,
      });
      
      setOrganismoDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('organisms.errorSavingChanges'));
    }
  };

  const handleVerPerfil = (organismo: any) => {
    setOrganismoSeleccionado(organismo);
    
    // Cargar personas autorizadas del organismo
    const personas = obtenerPersonasPorOrganismo(organismo.id);
    setPersonasAutorizadas(personas);
    
    setFormOrganismo({
      nombre: organismo.nombre,
      tipo: organismo.tipo,
      codigoPostal: organismo.codigoPostal || '',
      direccion: organismo.direccion,
      quartier: organismo.quartier || '',
      responsable: organismo.responsable,
      beneficiarios: organismo.beneficiarios,
      telefono: organismo.telefono,
      email: organismo.email,
      frecuenciaCita: 'semanal',
      horaCita: '10:00',
      participantePRS: false,
      regular: true,
      activo: organismo.activo,
      personasServidas: 120,
      cantidadColaciones: 80,
      cantidadAlmuerzos: 100,
      porcentajeReparticion: 30,
      notas: 'Organismo con excelente trayectoria en la comunidad.',
      notificaciones: true,
      logo: null,
      documentoPDF: null,
      contactosNotificacion: organismo.contactosNotificacion?.length > 0 
        ? organismo.contactosNotificacion.map((contacto: any) => ({
            nombre: contacto.nombre || '',
            email: contacto.email || '',
            cargo: contacto.cargo || '',
            joursDisponibles: contacto.joursDisponibles || []
          }))
        : [{ nombre: '', email: '', cargo: '', joursDisponibles: [] }],
      fechaInicioInactividad: organismo.fechaInicioInactividad || '',
      fechaFinInactividad: organismo.fechaFinInactividad || '',
      claveAcceso: organismo.claveAcceso || ''
    });
    setModoEdicion(false);
    setPerfilDialogOpen(true);
  };

  const handleEditarPerfil = (organismo: any) => {
    setOrganismoSeleccionado(organismo);
    
    // Cargar personas autorizadas del organismo
    const personas = obtenerPersonasPorOrganismo(organismo.id);
    setPersonasAutorizadas(personas);
    
    setFormOrganismo({
      nombre: organismo.nombre,
      tipo: organismo.tipo,
      codigoPostal: organismo.codigoPostal || '',
      direccion: organismo.direccion,
      quartier: organismo.quartier || '',
      responsable: organismo.responsable,
      beneficiarios: organismo.beneficiarios,
      telefono: organismo.telefono,
      email: organismo.email,
      frecuenciaCita: 'semanal',
      horaCita: '10:00',
      participantePRS: false,
      regular: true,
      activo: organismo.activo,
      personasServidas: 120,
      cantidadColaciones: 80,
      cantidadAlmuerzos: 100,
      porcentajeReparticion: 30,
      notas: 'Organismo con excelente trayectoria en la comunidad.',
      notificaciones: true,
      logo: null,
      documentoPDF: null,
      contactosNotificacion: organismo.contactosNotificacion?.length > 0 
        ? organismo.contactosNotificacion.map((contacto: any) => ({
            nombre: contacto.nombre || '',
            email: contacto.email || '',
            cargo: contacto.cargo || '',
            joursDisponibles: contacto.joursDisponibles || []
          }))
        : [{ nombre: '', email: '', cargo: '', joursDisponibles: [] }],
      fechaInicioInactividad: organismo.fechaInicioInactividad || '',
      fechaFinInactividad: organismo.fechaFinInactividad || '',
      claveAcceso: organismo.claveAcceso || ''
    });
    setModoEdicion(true);
    setPerfilDialogOpen(true);
  };

  const handleGuardarCambios = () => {
    if (organismoSeleccionado && organismoSeleccionado.id) {
      try {
        // Actualizar el organismo en el storage
        actualizarOrganismo(organismoSeleccionado.id, {
          nombre: formOrganismo.nombre,
          tipo: formOrganismo.tipo,
          email: formOrganismo.email,
          telefono: formOrganismo.telefono,
          direccion: formOrganismo.direccion,
          codigoPostal: formOrganismo.codigoPostal,
          quartier: formOrganismo.quartier,
          responsable: formOrganismo.responsable,
          beneficiarios: formOrganismo.beneficiarios,
          activo: formOrganismo.activo,
          regular: formOrganismo.regular,
          participantePRS: formOrganismo.participantePRS,
          frecuenciaCita: formOrganismo.frecuenciaCita,
          horaCita: formOrganismo.horaCita,
          personasServidas: formOrganismo.personasServidas,
          cantidadColaciones: formOrganismo.cantidadColaciones,
          cantidadAlmuerzos: formOrganismo.cantidadAlmuerzos,
          porcentajeReparticion: formOrganismo.porcentajeReparticion,
          notas: formOrganismo.notas,
          notificaciones: formOrganismo.notificaciones,
          logo: formOrganismo.logo,
          documentoPDF: formOrganismo.documentoPDF,
          contactosNotificacion: formOrganismo.contactosNotificacion,
          fechaInicioInactividad: formOrganismo.fechaInicioInactividad,
          fechaFinInactividad: formOrganismo.fechaFinInactividad
        });
        
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
    setPerfilDialogOpen(false);
    setModoEdicion(false);
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
      className="app-compact-page min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 relative overflow-hidden"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)',
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
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className="app-compact-page__content relative z-10 space-y-4 sm:space-y-6">
        {/* Header con glassmorphism */}
        <div className="app-compact-panel backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {branding.logo ? (
                <div 
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg border-2"
                  style={{ borderColor: branding.primaryColor }}
                >
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </div>
              ) : (
                <div 
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 
                    className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: branding.primaryColor 
                    }}
                  >
                    🎨 {t('organisms.title')}
                  </h1>
                  <Sparkles 
                    className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
                    style={{ color: branding.secondaryColor }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-[#666666] mt-1 font-medium">
                  {t('organisms.subtitle')} • {t('organisms.version.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button 
                onClick={handleAbrirEmailGrupal}
                className="flex-1 lg:flex-none text-white transition-all duration-300 hover:scale-105"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 500, 
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                  boxShadow: `0 4px 15px ${branding.secondaryColor}40`
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                {t('organisms.email.send')}
              </Button>
              <Dialog open={organismoDialogOpen} onOpenChange={setOrganismoDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className={puedeGestionarOrganismos ? "flex-1 lg:flex-none text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl" : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"} 
                    style={puedeGestionarOrganismos ? { 
                      fontFamily: 'Montserrat, sans-serif', 
                      fontWeight: 500, 
                      background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
                      boxShadow: `0 4px 15px ${branding.primaryColor}40`
                    } : { fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                disabled={!puedeGestionarOrganismos}
                onClick={(e) => {
                  if (!puedeGestionarOrganismos) {
                    e.preventDefault();
                    toast.error(t('organisms.accessDeniedTitle'), {
                      description: t('organisms.createPermissionDescription')
                    });
                  }
                }}
                title={!puedeGestionarOrganismos ? t('organisms.createPermissionTooltip') : ''}
              >
                <Plus className="w-4 h-4 mr-2" />
                🎨 {t('organisms.version.button.newOrganism')}
              </Button>
            </DialogTrigger>
          <DialogContent 
            className="!max-w-none !w-screen !h-screen !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none p-0 m-0"
            aria-describedby="new-organism-description"
          >
            <DialogHeader className="sticky top-0 z-10 text-white px-4 py-4 sm:px-6 sm:py-5 shadow-2xl" style={{ background: `linear-gradient(90deg, ${branding.dangerColor}, ${branding.primaryColor}, ${branding.secondaryColor})`, borderBottom: `4px solid ${branding.warningColor}` }}>
              <DialogTitle className="text-2xl sm:text-[2rem]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                🎨 {t('organisms.version.form.title')}
              </DialogTitle>
              <DialogDescription id="new-organism-description" className="text-white text-sm sm:text-lg font-semibold">
                ✅ {t('organisms.version.form.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="app-form-compact app-form-organismo app-compact-dialog-body space-y-4 sm:space-y-6 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-y-auto max-h-[calc(100vh-144px)] sm:max-h-[calc(100vh-180px)] scrollbar-thin">{/* Contenedor con max-width para mejor lectura */}
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('organisms.basicInfo')}
                </h3>
                <div className="grid grid-cols-6 gap-4">
                  {/* 🎨 CAMPO LOGO DEL ORGANISMO */}
                  <div className="app-form-callout col-span-6 space-y-3" style={{
                    backgroundColor: '#FFF0F0',
                    padding: '20px',
                    borderRadius: '12px',
                    border: `3px solid ${branding.dangerColor}`,
                    marginBottom: '12px'
                  }}>
                    <Label className="app-form-callout-title font-bold text-2xl flex items-center gap-3" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.dangerColor }}>
                      🎨 {t('organisms.version.form.logoField.title')}
                      <Badge className="text-white text-sm px-3 py-1" style={{ backgroundColor: branding.dangerColor }}>
                        {t('organisms.version.form.logoField.badge')}
                      </Badge>
                    </Label>
                    
                    <div className="flex items-start gap-4">
                      {/* Vista previa del logo */}
                      <div className="flex-shrink-0">
                        {formOrganismo.logo ? (
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-white" style={{ border: `2px solid ${branding.primaryColor}` }}>
                            <img 
                              src={formOrganismo.logo} 
                              alt="Logo" 
                              className="w-full h-full object-contain p-2"
                            />
                            <button
                              type="button"
                              onClick={() => setFormOrganismo({ ...formOrganismo, logo: null })}
                              className="absolute top-1 right-1 text-white rounded-full p-1 transition-colors"
                              style={{ backgroundColor: branding.dangerColor }}
                              title="Supprimer le logo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-white" style={{ borderColor: branding.primaryColor }}>
                            <Upload className="w-8 h-8 opacity-50" style={{ color: branding.primaryColor }} />
                          </div>
                        )}
                      </div>

                      {/* Botón de carga */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFormOrganismo({ ...formOrganismo, logo: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="hover:text-white"
                            style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {formOrganismo.logo ? 'Changer le logo' : 'Télécharger le logo'}
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-[#666666]">
                            📁 Formats acceptés: PNG, JPG, SVG
                          </p>
                          <p className="text-sm text-[#666666]">
                            📏 Taille recommandée: 500x500 pixels
                          </p>
                          <p className="text-xs text-[#1E73BE]">
                            💡 Le logo sera affiché sur les documents et rapports de l'organisme
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campo Nombre */}
                  <div className="col-span-3 space-y-2">
                    <Label className="text-sm font-medium">{t('organisms.organismName')} *</Label>
                    <Input 
                      placeholder={t('organisms.organismNamePlaceholder')} 
                      value={formOrganismo.nombre}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, nombre: e.target.value })}
                      className="h-11 text-base"
                    />
                  </div>

                  {/* Campo Tipo */}
                  <div className="col-span-3 space-y-2">
                    <Label className="text-sm font-medium">{t('organisms.type')} *</Label>
                    <Select 
                      value={formOrganismo.tipo}
                      onValueChange={(value) => setFormOrganismo({ ...formOrganismo, tipo: value })}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder={t('organisms.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposOrganismo.map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.nombre} className="text-base">
                            {tipo.icono} {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ⭐ CAMPO QUARTIER - ULTRA VISIBLE ⭐ */}
                  <div className="app-form-callout col-span-6 space-y-3" style={{ 
                    backgroundColor: '#FFF9E6', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    border: `4px solid ${branding.warningColor}`, 
                    boxShadow: `0 4px 20px ${branding.warningColor}40`,
                    marginBottom: '8px'
                  }}>
                    <Label className="app-form-callout-title text-[#333333] font-bold text-xl flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      🏘️ Quartier de Laval *
                      <Badge className="text-black" style={{ backgroundColor: branding.warningColor }}>REQUIS</Badge>
                    </Label>
                    <Select 
                      value={formOrganismo.quartier || ''}
                      onValueChange={(value) => setFormOrganismo({ ...formOrganismo, quartier: value })}
                    >
                      <SelectTrigger className="bg-white h-14 text-lg border-2" style={{ borderColor: branding.warningColor }}>
                        <SelectValue placeholder="⚠️ Sélectionnez un quartier de Laval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Auteuil">Auteuil</SelectItem>
                        <SelectItem value="Chomedey">Chomedey</SelectItem>
                        <SelectItem value="Duvernay">Duvernay</SelectItem>
                        <SelectItem value="Fabreville">Fabreville</SelectItem>
                        <SelectItem value="Laval-des-Rapides">Laval-des-Rapides</SelectItem>
                        <SelectItem value="Laval-Ouest">Laval-Ouest</SelectItem>
                        <SelectItem value="Laval-sur-le-Lac">Laval-sur-le-Lac</SelectItem>
                        <SelectItem value="Pont-Viau">Pont-Viau</SelectItem>
                        <SelectItem value="Sainte-Dorothée">Sainte-Dorothée</SelectItem>
                        <SelectItem value="Sainte-Rose">Sainte-Rose</SelectItem>
                        <SelectItem value="Saint-François">Saint-François</SelectItem>
                        <SelectItem value="Saint-Vincent-de-Paul">Saint-Vincent-de-Paul</SelectItem>
                        <SelectItem value="Vimont">Vimont</SelectItem>
                        <SelectItem value="Îles-Laval">Îles-Laval</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-[#666666] font-medium">
                      📍 Sélectionnez le quartier de Laval où se trouve l'organisme
                    </p>
                  </div>
                  
                  {/* Estado Activo/Inactivo */}
                  <div className="space-y-2 col-span-2">
                    <Label>{t('organisms.organismState')}</Label>
                    <div className="app-form-status-row flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-white">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#333333]">
                          {t('organisms.state')}: {formOrganismo.activo ? t('organisms.active') : t('organisms.inactive')}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {formOrganismo.activo 
                            ? t('organisms.activeDescription') 
                            : t('organisms.inactiveDescription')}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setFormOrganismo({ ...formOrganismo, activo: !formOrganismo.activo })}
                        style={{ 
                          minWidth: '120px',
                          backgroundColor: formOrganismo.activo ? branding.secondaryColor : branding.dangerColor
                        }}
                      >
                        {formOrganismo.activo ? `✓ ${t('organisms.active')}` : `✕ ${t('organisms.inactive')}`}
                      </Button>
                    </div>
                  </div>

                  {/* Fechas de Inactividad - Solo se muestran cuando está inactivo */}
                  {!formOrganismo.activo && (
                    <>
                      <div className="space-y-2">
                        <Label>{t('organisms.inactivityStartDate')} *</Label>
                        <Input 
                          type="date"
                          value={formOrganismo.fechaInicioInactividad || ''}
                          onChange={(e) => setFormOrganismo({ ...formOrganismo, fechaInicioInactividad: e.target.value })}
                          className="bg-white"
                        />
                        <p className="text-xs text-[#666666]">{t('organisms.inactivityStartHelp')}</p>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('organisms.inactivityEndDate')}</Label>
                        <Input 
                          type="date"
                          value={formOrganismo.fechaFinInactividad || ''}
                          onChange={(e) => setFormOrganismo({ ...formOrganismo, fechaFinInactividad: e.target.value })}
                          min={formOrganismo.fechaInicioInactividad || ''}
                          className="bg-white"
                        />
                        <p className="text-xs text-[#666666]">{t('organisms.inactivityEndHelp')}</p>
                      </div>
                    </>
                  )}

                  {/* Dirección con Auto-completado */}
                  <div className="col-span-4 space-y-2 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Label>{t('organisms.fullAddress')} *</Label>
                      <Badge className="text-white text-xs" style={{ background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
                        🔍 Auto-complétion intelligente
                      </Badge>
                    </div>
                    <AddressAutocomplete
                      onAddressSelect={(address) => {
                        const districtText = address.quartier
                          ? t('organisms.addressAutocompleteDistrict', { district: address.quartier })
                          : '';

                        setFormOrganismo({
                          ...formOrganismo,
                          direccion: address.street,
                          codigoPostal: address.postalCode,
                          quartier: address.quartier || ''
                        });
                        toast.success(t('organisms.addressAutocompleteSuccess'), {
                          description: t('organisms.addressAutocompleteDescription', {
                            postalCode: address.postalCode,
                            city: address.city,
                            district: districtText
                          })
                        });
                      }}
                      disabled={false}
                      initialValue={formOrganismo.direccion}
                      initialQuartier={formOrganismo.quartier || ''}
                      label=""
                      placeholder={t('organisms.addressAutocompletePlaceholder')}
                      required={true}
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-xs font-medium flex items-center gap-2" style={{ color: branding.primaryColor }}>
                        <span className="text-base">ℹ️</span>
                        <span>
                          {t('organisms.addressHelp')} Le code postal sera automatiquement rempli lors de la sélection.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Código Postal */}
                  <div className="col-span-2 space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      {t('organisms.postalCode')} *
                      <Badge variant="outline" className="text-xs bg-blue-50" style={{ color: branding.primaryColor, borderColor: branding.primaryColor }}>
                        Auto
                      </Badge>
                    </Label>
                    <div className="relative">
                      <Input 
                        placeholder={t('organisms.postalCodePlaceholder')} 
                        value={formOrganismo.codigoPostal}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, codigoPostal: e.target.value })}
                        readOnly
                        className="bg-blue-50 border-blue-200 font-medium h-11 text-base"
                      />
                      {formOrganismo.codigoPostal && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: branding.secondaryColor }} />
                      )}
                    </div>
                    <p className="text-xs font-medium flex items-center gap-1" style={{ color: branding.primaryColor }}>
                      ✨ {t('organisms.postalCodeAutoFill')}
                    </p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>{t('organisms.responsible')} *</Label>
                    {personasAutorizadas.length > 0 ? (
                      <Select 
                        value={formOrganismo.responsable}
                        onValueChange={(value) => setFormOrganismo({ ...formOrganismo, responsable: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una persona autorizada" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {personasAutorizadas.map(persona => (
                            <SelectItem key={persona.id} value={persona.nombreCompleto}>
                              <div className="flex items-center gap-2">
                                <span>{persona.nombreCompleto}</span>
                                {persona.esPrincipal && (
                                  <span className="text-xs bg-[#4CAF50] text-white px-1.5 py-0.5 rounded">Principal</span>
                                )}
                                {persona.cargo && (
                                  <span className="text-xs text-[#666666]">({persona.cargo})</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        placeholder={t('organisms.responsablePlaceholder')} 
                        value={formOrganismo.responsable}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, responsable: e.target.value })}
                      />
                    )}
                    {personasAutorizadas.length > 0 && (
                      <p className="text-xs text-[#4CAF50]">
                        ✓ {personasAutorizadas.length} persona{personasAutorizadas.length !== 1 ? 's' : ''} autorizada{personasAutorizadas.length !== 1 ? 's' : ''} registrada{personasAutorizadas.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    {personasAutorizadas.length === 0 && (
                      <p className="text-xs text-[#FFC107]">
                        ⚠️ No hay personas autorizadas registradas. Puede ingresar un nombre manualmente o agregar personas en la pestaña "Personas Autorizadas" del perfil.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('organisms.beneficiariesNumber')} *</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formOrganismo.beneficiarios || ''}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, beneficiarios: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('organisms.phone')} *</Label>
                    <Input 
                      placeholder={t('organisms.phonePlaceholder')} 
                      value={formOrganismo.telefono}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, telefono: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('organisms.emailLabel')} *</Label>
                    <Input 
                      type="email" 
                      placeholder={t('organisms.emailPlaceholder')} 
                      value={formOrganismo.email}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Programación y Frecuencia */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Calendar className="w-5 h-5 text-[#1E73BE]" />
                  {t('organisms.scheduling')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('organisms.appointmentFrequency')} *</Label>
                    <Select 
                      value={formOrganismo.frecuenciaCita}
                      onValueChange={(value) => setFormOrganismo({ ...formOrganismo, frecuenciaCita: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('organisms.selectFrequency')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">{t('organisms.weekly')}</SelectItem>
                        <SelectItem value="cada-dos-semanas">{t('organisms.biweekly')}</SelectItem>
                        <SelectItem value="cada-tres-semanas">{t('organisms.triweekly')}</SelectItem>
                        <SelectItem value="mensual">{t('organisms.monthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('organisms.appointmentTime')}</Label>
                    <Input 
                      type="time" 
                      placeholder="00:00" 
                      value={formOrganismo.horaCita}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, horaCita: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('organisms.organismType')}</Label>
                    <Select 
                      value={formOrganismo.regular ? 'regular' : 'eventual'}
                      onValueChange={(value) => setFormOrganismo({ ...formOrganismo, regular: value === 'regular' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('organisms.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">{t('organisms.regular')}</SelectItem>
                        <SelectItem value="eventual">{t('organisms.occasionalOrganism')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('organisms.prsParticipant')}</Label>
                    <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg bg-white">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#333333]">
                          {t('organisms.prsParticipationQuestion')}: {formOrganismo.participantePRS ? t('organisms.yes') : t('organisms.no')}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {formOrganismo.participantePRS 
                            ? t('organisms.prsParticipationYesDescription')
                            : t('organisms.prsParticipationNoDescription')}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setFormOrganismo({ ...formOrganismo, participantePRS: !formOrganismo.participantePRS })}
                        style={{ 
                          minWidth: '120px',
                          backgroundColor: formOrganismo.participantePRS ? branding.secondaryColor : branding.dangerColor
                        }}
                      >
                        {formOrganismo.participantePRS ? `✓ ${t('organisms.yes')}` : `✕ ${t('organisms.no')}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacidad y Servicios */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <UserCheck className="w-5 h-5" style={{ color: branding.primaryColor }} />
                  {t('organisms.capacity')}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: branding.primaryColor }} />
                      {t('organisms.peopleServed')}
                    </Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formOrganismo.personasServidas || ''}
                      onChange={(e) => {
                        setFormOrganismo({ ...formOrganismo, personasServidas: parseInt(e.target.value) || 0 });
                      }}
                      onBlur={calcularPorcentajeAutomatico}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Coffee className="w-4 h-4" style={{ color: branding.warningColor }} />
                      {t('organisms.snacksQuantity')}
                    </Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formOrganismo.cantidadColaciones || ''}
                      onChange={(e) => {
                        setFormOrganismo({ ...formOrganismo, cantidadColaciones: parseInt(e.target.value) || 0 });
                      }}
                      onBlur={calcularPorcentajeAutomatico}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                      {t('organisms.lunchesQuantity')}
                    </Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formOrganismo.cantidadAlmuerzos || ''}
                      onChange={(e) => {
                        setFormOrganismo({ ...formOrganismo, cantidadAlmuerzos: parseInt(e.target.value) || 0 });
                      }}
                      onBlur={calcularPorcentajeAutomatico}
                    />
                  </div>
                </div>
                
                {/* Porcentaje de Repartición */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5" style={{ color: branding.primaryColor }} />
                      <Label className="mb-0">{t('organisms.distributionPercentage')}</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge style={{ fontSize: '1.25rem', padding: '0.5rem 1rem', backgroundColor: branding.primaryColor }}>
                        {(formOrganismo.porcentajeReparticion || 0).toFixed(2)}%
                      </Badge>
                      <Button 
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={calcularPorcentajeAutomatico}
                        style={{ color: branding.primaryColor, borderColor: branding.primaryColor }}
                      >
                        {t('organisms.autoCalculatePercentage')}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-[#666666] mt-2">
                    {t('organisms.percentageCalculationHelp')}
                  </p>
                </div>
              </div>

              {/* Logo y Documentos */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Upload className="w-5 h-5" style={{ color: branding.primaryColor }} />
                  {t('organisms.logoAndDocs')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Logo del Organismo */}
                  <div className="space-y-2">
                    <Label>{t('organisms.organismsLogo')}</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {formOrganismo.logo ? (
                        <div className="relative">
                          <img 
                            src={formOrganismo.logo} 
                            alt="Logo" 
                            className="w-full h-32 object-contain rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFormOrganismo({ ...formOrganismo, logo: null })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 mb-2">{t('organisms.uploadLogo')}</p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="logo-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFormOrganismo({ ...formOrganismo, logo: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            {t('organisms.selectFile')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documento PDF */}
                  <div className="space-y-2">
                    <Label>{t('organisms.pdfDocumentAgreement')}</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {formOrganismo.documentoPDF ? (
                        <div className="flex items-center gap-3">
                          <FileText className="w-10 h-10 text-[#DC3545]" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#333333]">{t('organisms.documentLoaded')}</p>
                            <p className="text-xs text-[#666666]">{t('organisms.pdfAttached')}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setFormOrganismo({ ...formOrganismo, documentoPDF: null })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <FileText className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 mb-2">{t('organisms.loadDocuments')}</p>
                          <Input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            id="pdf-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFormOrganismo({ ...formOrganismo, documentoPDF: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('pdf-upload')?.click()}
                          >
                            {t('organisms.selectFile')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contactos para Notificaciones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-medium text-[#333333] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Bell className="w-5 h-5" style={{ color: branding.primaryColor }} />
                    {t('organisms.notificationContactsList')}
                  </h3>
                  <Button 
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={agregarContacto}
                    style={{ color: branding.secondaryColor, borderColor: branding.secondaryColor }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('organisms.addContact')}
                  </Button>
                </div>
                <p className="text-sm text-[#666666]">
                  {t('organisms.notificationContactsDescription')}
                </p>
                <div className="space-y-3">
                  {formOrganismo.contactosNotificacion.map((contacto, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4 bg-[#F4F4F4]">
                      <div className="flex items-start justify-between mb-3">
                        <Badge style={{ backgroundColor: branding.primaryColor }}>
                          Contacto {index + 1}
                        </Badge>
                        <div className="flex gap-2">
                          {/* Botón para crear acceso al sistema */}
                          {contacto.nombre && contacto.email && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const nombreParts = contacto.nombre.split(' ');
                                const nombre = nombreParts[0] || contacto.nombre;
                                const apellido = nombreParts.slice(1).join(' ') || '';
                                
                                setContactoParaRol({
                                  id: `contacto-org-${index}`,
                                  nombre: nombre,
                                  apellido: apellido,
                                  nombreCompleto: contacto.nombre,
                                  email: contacto.email,
                                  telefono: '',
                                  cargo: contacto.cargo || 'Contact',
                                  modulo: 'organismo'
                                });
                                setDialogAsignarRolOpen(true);
                              }}
                              title="Créer un accès au système"
                            >
                              <Shield className="w-4 h-4" style={{ color: '#9C27B0' }} />
                            </Button>
                          )}
                          {formOrganismo.contactosNotificacion.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarContacto(index)}
                              style={{ color: branding.dangerColor }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">{t('organisms.contactName')}</Label>
                          <Input 
                            placeholder={t('organisms.contactNamePlaceholder')} 
                            value={contacto.nombre}
                            onChange={(e) => actualizarContacto(index, 'nombre', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t('organisms.contactEmail')}</Label>
                          <Input 
                            type="email"
                            placeholder={t('organisms.contactEmailPlaceholder')} 
                            value={contacto.email}
                            onChange={(e) => actualizarContacto(index, 'email', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t('organisms.contactPosition')}</Label>
                          <Select
                            value={contacto.cargo || ''}
                            onValueChange={(value) => actualizarContacto(index, 'cargo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('organisms.contactPositionPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Directeur">Directeur</SelectItem>
                              <SelectItem value="Coordinateur">Coordinateur</SelectItem>
                              <SelectItem value="Responsable">Responsable</SelectItem>
                              <SelectItem value="Chef d'équipe">Chef d'équipe</SelectItem>
                              <SelectItem value="Superviseur">Superviseur</SelectItem>
                              <SelectItem value="Assistant">Assistant</SelectItem>
                              <SelectItem value="Gestionnaire">Gestionnaire</SelectItem>
                              <SelectItem value="Administrateur">Administrateur</SelectItem>
                              <SelectItem value="Bénévole">Bénévole</SelectItem>
                              <SelectItem value="Volontaire">Volontaire</SelectItem>
                              <SelectItem value="Stagiaire">Stagiaire</SelectItem>
                              <SelectItem value="Conseiller">Conseiller</SelectItem>
                              <SelectItem value="Technicien">Technicien</SelectItem>
                              <SelectItem value="Spécialiste">Spécialiste</SelectItem>
                              <SelectItem value="Analyste">Analyste</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Selección múltiple de idiomas */}
                      <div className="mt-3 space-y-2">
                        <LanguageSelector
                          selectedLanguages={contacto.idiomas || []}
                          onChange={(idiomas) => actualizarContacto(index, 'idiomas', idiomas)}
                          predefinedLanguages={[
                            { code: 'fr', label: 'Français', flag: '🇫🇷', color: '#1a4d7a' },
                            { code: 'en', label: 'English', flag: '🇬🇧', color: '#2d9561' },
                            { code: 'es', label: 'Español', flag: '🇪🇸', color: '#8B5CF6' },
                            { code: 'ar', label: 'العربية', flag: '🇸🇦', color: '#F59E0B' }
                          ]}
                        />
                      </div>

                      {/* Selector de días disponibles para el contacto */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <SelecteurJoursDisponibles
                          joursDisponibles={contacto.joursDisponibles || []}
                          onChange={(nouveauxJours) => actualizarContacto(index, 'joursDisponibles', nouveauxJours)}
                          showIcon={true}
                          className=""
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas con Notificaciones */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <FileText className="w-5 h-5" style={{ color: branding.primaryColor }} />
                  {t('organisms.notesObservations')}
                </h3>
                <div className="space-y-2">
                  <Label>{t('organisms.notes')}</Label>
                  <Textarea 
                    placeholder={t('organisms.notesPlaceholder')}
                    rows={4}
                    value={formOrganismo.notas}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, notas: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <input 
                    type="checkbox"
                    id="notificaciones"
                    checked={formOrganismo.notificaciones}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, notificaciones: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="notificaciones" className="mb-0 cursor-pointer">
                    <Bell className="w-4 h-4 inline mr-1" style={{ color: branding.warningColor }} />
                    {t('organisms.enableNotifications')}
                  </Label>
                </div>
              </div>

              {/* Historial de Donaciones */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <PackageCheck className="w-5 h-5" style={{ color: branding.primaryColor }} />
                  {t('organismPortal.donationReports')}
                </h3>
                <p className="text-sm text-[#666666]">
                  {t('organismPortal.donationReportsDescription')}
                </p>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-[#F4F4F4]">
                        <TableRow>
                          <TableHead className="font-medium">{t('common.date')}</TableHead>
                          <TableHead className="font-medium">{t('orders.products')}</TableHead>
                          <TableHead className="font-medium">{t('inventory.quantity')}</TableHead>
                          <TableHead className="font-medium">{t('inventory.monetaryValue')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historialDonaciones.length > 0 ? (
                          historialDonaciones.map((donacion) => (
                            <TableRow key={donacion.id}>
                              <TableCell>{donacion.fecha}</TableCell>
                              <TableCell>{donacion.productos}</TableCell>
                              <TableCell>{donacion.cantidad}</TableCell>
                              <TableCell className="font-medium" style={{ color: branding.secondaryColor }}>{donacion.valorMonetario}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-[#666666] py-6">
                              {t('common.noResults')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#333333]">{t('organisms.totalHistoricalAccumulated')}</p>
                    <p className="text-xs text-[#666666]">{t('organisms.totalDonationsReceived')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ fontSize: '1.25rem', color: branding.secondaryColor }}>$9,200</p>
                    <p className="text-xs text-[#666666]">530 kg totales</p>
                  </div>
                </div>
              </div>

              {/* Historial de Registro PRS */}
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <History className="w-5 h-5" style={{ color: branding.primaryColor }} />
                  {t('prs.prsRecordsHistory')}
                </h3>
                <p className="text-sm text-[#666666]">
                  {t('prs.subtitle')}
                </p>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-[#F4F4F4]">
                        <TableRow>
                          <TableHead className="font-medium">{t('common.date')}</TableHead>
                          <TableHead className="font-medium">{t('common.status')}</TableHead>
                          <TableHead className="font-medium">{t('organisms.beneficiaries')}</TableHead>
                          <TableHead className="font-medium">{t('prs.responsible')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historialPRS.length > 0 ? (
                          historialPRS.map((registro) => (
                            <TableRow key={registro.id}>
                              <TableCell>{registro.fecha}</TableCell>
                              <TableCell>{registro.tipoServicio}</TableCell>
                              <TableCell>
                                <Badge style={{ backgroundColor: branding.primaryColor }}>
                                  {registro.beneficiarios}
                                </Badge>
                              </TableCell>
                              <TableCell>{registro.responsable}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-[#666666] py-6">
                              {t('common.noResults')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-[#333333]">{t('organisms.totalBeneficiariesServedPRS')}</p>
                    <p className="text-xs text-[#666666]">{t('organisms.historicalSumBeneficiaries')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ fontSize: '1.25rem', color: branding.primaryColor }}>325</p>
                    <p className="text-xs text-[#666666]">3 servicios realizados</p>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setOrganismoDialogOpen(false);
                  // Resetear formulario
                  setFormOrganismo({
                    nombre: '',
                    tipo: '',
                    codigoPostal: '',
                    direccion: '',
                    responsable: '',
                    beneficiarios: 0,
                    telefono: '',
                    email: '',
                    frecuenciaCita: '',
                    horaCita: '',
                    participantePRS: false,
                    regular: true,
                    activo: true,
                    personasServidas: 0,
                    cantidadColaciones: 0,
                    cantidadAlmuerzos: 0,
                    porcentajeReparticion: 0,
                    notas: '',
                    notificaciones: true,
                    logo: null,
                    documentoPDF: null,
                    contactosNotificacion: [{ nombre: '', email: '', cargo: '' }],
                    fechaInicioInactividad: '',
                    fechaFinInactividad: ''
                  });
                }}>
                  {t('organisms.email.cancel')}
                </Button>
                <Button onClick={handleCrearOrganismo} style={{ backgroundColor: branding.secondaryColor }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Organismo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card-glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('organisms.totalOrganisms')}</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                {organismos.length}
              </p>
            </div>
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="card-glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: branding.secondaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('organisms.activeOrganisms')}</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                {organismosActivos}
              </p>
            </div>
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
            >
              <Check className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="card-glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 hover-lift cursor-pointer border-l-4 border-l-[#FFC107]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('organisms.totalBeneficiaries')}</p>
              <p className="text-xl sm:text-2xl font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {totalBeneficiarios}
              </p>
            </div>
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)' }}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

        {/* Search con glassmorphism */}
        <div className="app-compact-panel backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <Input
            placeholder={t('organisms.searchOrganism')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Organismos Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        {organismosFiltrados.map(organismo => {
          const comandasOrganismo = obtenerComandas().filter(c => c.organismoId === organismo.id);

          return (
            <Card key={organismo.id} className="hover:shadow-lg transition-shadow border-white/70 shadow-sm overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-3">
                  {/* Logo del organismo */}
                  {organismo.logo && (
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <img 
                        src={organismo.logo} 
                        alt={`Logo ${organismo.nombre}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="mb-1.5 text-lg sm:text-xl leading-tight break-words" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {organismo.nombre}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge style={{ backgroundColor: branding.primaryColor }}>
                        {tiposOrganismo.find(tipo => tipo.nombre === organismo.tipo)?.nombre || organismo.tipo}
                      </Badge>
                      {organismo.participaPRS && (
                        <Badge style={{ backgroundColor: branding.secondaryColor }}>
                          ✓ PRS
                        </Badge>
                      )}
                    </div>
                  </div>
                  {organismo.activo ? (
                    <Badge style={{ backgroundColor: branding.secondaryColor }}>{t('common.active')}</Badge>
                  ) : (
                    <Badge variant="secondary">{t('common.inactive')}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#666666] flex-shrink-0" />
                    <MapLink 
                      direccion={organismo.direccion} 
                      variant="inline"
                      showIcon={false}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Users className="w-4 h-4" />
                    <span>{organismo.responsable} • {organismo.beneficiarios} {t('organisms.beneficiaries')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Phone className="w-4 h-4" />
                    <span>{organismo.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Mail className="w-4 h-4" />
                    <span>{organismo.email}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xs sm:text-sm text-[#666666]">{t('organisms.orders')}</p>
                    <p className="font-medium" style={{ color: '#1E73BE' }}>{comandasOrganismo.length}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAbrirEmailIndividual(organismo)}
                    className="w-full sm:w-auto text-white"
                    style={{ backgroundColor: branding.secondaryColor, borderColor: branding.secondaryColor }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:flex-1" onClick={() => handleVerPerfil(organismo)}>
                    <Eye className="w-4 h-4 mr-1" />
                    {t('organisms.viewProfile')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:flex-1" 
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
                    <Edit className="w-4 h-4 mr-1" />
                    {t('organisms.edit')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de Perfil del Organismo */}
      <PerfilOrganismoDialog
        open={perfilDialogOpen}
        onOpenChange={setPerfilDialogOpen}
        modoEdicion={modoEdicion}
        setModoEdicion={setModoEdicion}
        formOrganismo={formOrganismo}
        setFormOrganismo={setFormOrganismo}
        onGuardar={handleGuardarCambios}
        calcularPorcentajeAutomatico={calcularPorcentajeAutomatico}
        agregarContacto={agregarContacto}
        eliminarContacto={eliminarContacto}
        actualizarContacto={actualizarContacto}
        historialDonaciones={historialDonaciones}
        historialPRS={historialPRS}
        organismoId={organismoSeleccionado?.id}
      />

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