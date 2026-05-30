import React, { useState, useEffect, useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { validateImageFile, readFileAsDataURL } from '../../utils/fileValidation';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  User,
  UserCheck,
  Building,
  Filter,
  X,
  Eye,
  Languages,
  Camera,
  Heart,
  Star,
  ShieldPlus,
  Stethoscope,
  Building2,
  UserPlus,
  FileUp,
  Download,
  Upload,
  Settings,
  Link,
  RefreshCw,
  Shield,
  Database,
  HardDrive,
  Globe,
  FileText
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Checkbox } from '../ui/checkbox';
import { LanguageSelector } from '../ui/language-selector';
import {
  obtenerContactosDepartamento,
  obtenerContactosPorDepartamento,
  obtenerContactoPorId,
  guardarContacto,
  actualizarContacto,
  eliminarContacto,
  contarContactosPorTipo,
  migrarContactosDesdeEntrepot,
  diagnosticarContactos,
  repararContactosConProblemas,
  obtenerInfoAlmacenamiento,
  eliminarTodasLasFotos,
  eliminarTodosLosDocumentos,
  optimizarTodosLosContactos,
  type ContactoDepartamento,
  type TipoContacto,
  type IdiomaContacto,
  type GeneroContacto,
  type DisponibilidadDia,
  type EvenementActivite,
  type TipoEventoActividad
} from '../../utils/contactosDepartamentoStorage';
import { obtenerDepartamentos } from '../../utils/departamentosStorage';
import {
  obtenerIdiomasPersonalizados,
  guardarIdiomaPersonalizado,
  eliminarIdiomaPersonalizado,
  existeCodigoIdioma,
  type IdiomaPersonalizado
} from '../../utils/idiomasPersonalizadosStorage';
import { obtenerTiposContacto } from '../../utils/tiposContactoStorage';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import { FormularioContactoCompacto } from './FormularioContactoCompacto';
import { CalendarioContactos } from './CalendarioContactos';
import { AsignarRolContacto } from '../AsignarRolContacto';
import { HistoriqueActivite } from '../benevoles/HistoriqueActivite';
import { useCompactViewport } from '../../../hooks/useCompactViewport';

// Mapeo de iconos para tipos personalizados
const ICON_MAP: Record<string, any> = {
  User, UserCheck, UserPlus, Users, Heart, Star,
  Building, Building2, Briefcase, Stethoscope,
  ShieldPlus, Eye, Phone, Mail, MapPin, Calendar
};

interface GestionContactosDepartamentoProps {
  departamentoId: string;
  departamentoNombre: string;
}

export function GestionContactosDepartamento({ departamentoId, departamentoNombre }: GestionContactosDepartamentoProps) {
  const branding = useBranding();
  const usuarioSesion = obtenerUsuarioSesion();
  const departamentosDisponibles = obtenerDepartamentos();
  const [activeContactsTab, setActiveContactsTab] = useState('liste');
  const {
    isCompactViewport: isCompactContactsViewport,
    viewportZoom: contactsViewportZoom,
  } = useCompactViewport({
    deps: [activeContactsTab],
    resolveZoom: ({ height, isCompact }) => {
      const compactCalendarOverview = isCompact && activeContactsTab === 'calendrier';

      if (height < 600) {
        if (compactCalendarOverview) {
          return 0.56;
        }

        return 0.52;
      }

      if (height < 700) {
        if (compactCalendarOverview) {
          return 0.68;
        }

        return 0.68;
      }

      if (isCompact) {
        if (compactCalendarOverview) {
          return 0.8;
        }

        return 0.84;
      }

      return 1;
    },
  });
  const [contactos, setContactos] = useState<ContactoDepartamento[]>([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [dialogDetalle, setDialogDetalle] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<ContactoDepartamento | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoContacto | 'todos'>('todos');
  const [diaFiltro, setDiaFiltro] = useState<'todos' | string>('todos');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para idiomas personalizados
  const [idiomasPersonalizados, setIdiomasPersonalizados] = useState<IdiomaPersonalizado[]>([]);
  const [dialogNuevoIdioma, setDialogNuevoIdioma] = useState(false);
  const [nuevoIdioma, setNuevoIdioma] = useState({ code: '', label: '', flag: '', color: branding.primaryColor });

  const obtenerNombreDepartamentoPorId = (id: string) => {
    return departamentosDisponibles.find(departamento => departamento.id === id)?.nombre || `Dept ${id}`;
  };

  const obtenerIdDepartamentoPorNombre = (nombre: string) => {
    const nombreNormalizado = nombre.trim().toLowerCase();
    return departamentosDisponibles.find(departamento => departamento.nombre.trim().toLowerCase() === nombreNormalizado)?.id;
  };

  // Estados para asignación de voluntarios existents
  const [dialogAsignarBenevole, setDialogAsignarBenevole] = useState(false);
  const [busquedaBenevole, setBusquedaBenevole] = useState('');
  const [benevolesDisponibles, setBenevolesDisponibles] = useState<any[]>([]);

  // Estado para editar departamentos
  const [dialogEditarDepartamentos, setDialogEditarDepartamentos] = useState(false);
  const [departamentosEditando, setDepartamentosEditando] = useState<string[]>([]);

  // NUEVO: Estados para asignar rol y acceso al système
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

  // Estados para modal de diagnóstico
  const [dialogDiagnostico, setDialogDiagnostico] = useState(false);
  const [diagnosticoResultado, setDiagnosticoResultado] = useState<{
    total: number;
    porDepartamento: { [key: string]: any[] };
    problemas: {
      sinActivo: any[];
      inactivos: any[];
      sinDepartamento: any[];
    };
  } | null>(null);

  // Estados para modal de información de almacenamiento
  const [dialogAlmacenamiento, setDialogAlmacenamiento] = useState(false);

  const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Roles disponibles du système
  const rolesDisponibles = [
    {
      id: 'admin',
      nombre: 'Administrateur',
      descripcion: 'Accès complet à toutes les fonctionnalités du système',
      color: '#DC3545'
    },
    {
      id: 'coordinador',
      nombre: 'Coordinateur',
      descripcion: 'Gestion de l\'inventaire, des commandes et des organismes',
      color: '#FF9800'
    },
    {
      id: 'benevole',
      nombre: 'Bénévole',
      descripcion: 'Accès limité aux fonctions assignées',
      color: '#9C27B0'
    },
    {
      id: 'responsable-departement',
      nombre: 'Responsable de Département',
      descripcion: 'Gestion d\'un département spécifique',
      color: branding.primaryColor
    }
  ];

  // NUEVO: Definir types de contacto disponibles selon le département
  const getTiposPermitidos = (): TipoContacto[] => {
    // 🔒 SOLO BÉNÉVOLES - Los contactos de departamento son exclusivamente para bénévoles
    // Los donadores y fournisseurs se gestionan desde el módulo de Entrepôt
    return ['benevole'];
  };

  const tiposPermitidos = getTiposPermitidos();

  const [formulario, setFormulario] = useState<Omit<ContactoDepartamento, 'id'>>({
    departamentoId: '', // ✅ NO asignar departamento por defecto
    departamentoIds: [], // ✅ Array vacío - sin departamentos por defecto
    tipo: 'benevole', // SIEMPRE bénévole en contactos de departamento
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    genero: 'Non spécifié',
    email: '',
    telefono: '',
    cargo: '',
    disponibilidad: '',
    disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: false })),
    notas: '',
    activo: true,
    fechaIngreso: new Date().toISOString().split('T')[0],
    direccion: '',
    apartamento: '', // ✅ Campo apartamento agregado
    ciudad: '',
    codigoPostal: '',
    quartier: '', // ✅ Campo quartier agregado - CRÍTICO para persistencia
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

  useEffect(() => {
    // Initialiser les types de contact par défaut (si première fois)
    obtenerTiposContacto(departamentoId); // Cargar tipos globales + específicos del departamento
    cargarContactos();
    cargarIdiomasPersonalizados();
    cargarBenevolesDisponibles();
  }, [departamentoId]);

  // 🔥 Escuchar eventos de actualización de contactos (desde Recrutement u otros módulos)
  useEffect(() => {
    const handleContactosActualizados = (event: any) => {
      console.log('🔔 Evento contactos-actualizados recibido:', event.detail);
      
      // Recargar contactos cuando se actualicen
      cargarContactos();
      
      // Si el evento trae detalles del departamento y coincide con el actual, mostrar notificación
      if (event.detail?.departamentoId === departamentoId) {
        console.log(`✅ Contacto actualizado en este departamento (${departamentoId})`);
      }
    };

    // Agregar listeners
    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    
    // 🆕 Escuchar sincronizaciones de bénévoles
    const handleBenevoleSincronizado = (event: any) => {
      console.log('🔔 Evento benevole-sincronizado recibido:', event.detail);
      // Recargar contactos para reflejar los cambios
      cargarContactos();
      // ✅ TAMBIÉN RECARGAR LA LISTA DE VOLUNTARIOS DISPONIBLES
      cargarBenevolesDisponibles();
      toast.success(`Bénévole ${event.detail.nombreCompleto} synchronisé dans tous les départements`);
    };
    
    window.addEventListener('benevole-sincronizado', handleBenevoleSincronizado);

    // Cleanup: remover listeners cuando se desmonta el componente
    return () => {
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
      window.removeEventListener('benevole-sincronizado', handleBenevoleSincronizado);
    };
  }, [departamentoId]); // Dependencia: volver a suscribirse si cambia el departamento

  // 🔄 Recargar voluntarios disponibles cuando se abre el diálogo
  useEffect(() => {
    if (dialogAsignarBenevole) {
      console.log('🔄 Diálogo de asignación abierto - Recargando voluntarios disponibles...');
      cargarBenevolesDisponibles();
    }
  }, [dialogAsignarBenevole]);

  const cargarContactos = () => {
    // ✅ SIEMPRE cargar contactos de departamento Y bénévoles del módulo principal
    let contactosData: ContactoDepartamento[];
    
    // 1️⃣ Cargar contactos de departamentos
    if (departamentoId === 'todos') {
      contactosData = obtenerContactosDepartamento();
    } else {
      contactosData = obtenerContactosPorDepartamento(departamentoId);
    }
    
    // 2️⃣ 🔥 SIEMPRE FUSIONAR Y SINCRONIZAR con bénévoles del módulo Bénévoles
    const benevolesModuloRaw = localStorage.getItem('banqueAlimentaire_benevoles');
    if (benevolesModuloRaw) {
      try {
        const benevolesModulo = JSON.parse(benevolesModuloRaw);
        console.log('🔍 DEBUG - Bénévoles encontrados en módulo principal:', benevolesModulo.length);
        console.log('🔍 DEBUG - Filtrando para departamento:', departamentoId);
        
        // Convertir bénévoles a formato ContactoDepartamento
        benevolesModulo.forEach((benevole: any) => {
          // Verificar si ya existe como contacto
          const contactoExistente = contactosData.find(c => 
            c.email && benevole.email && c.email.toLowerCase() === benevole.email.toLowerCase()
          );
          
          if (contactoExistente) {
            // 🔄 ACTUALIZAR contacto existente con datos del módulo principal
            console.log(`🔄 Sincronizando datos de: ${benevole.prenom} ${benevole.nom}`);
            contactoExistente.nombre = benevole.prenom || contactoExistente.nombre;
            contactoExistente.apellido = benevole.nom || contactoExistente.apellido;
            contactoExistente.nombreCompleto = `${benevole.prenom || ''} ${benevole.nom || ''}`.trim();
            contactoExistente.telefono = benevole.telephone || contactoExistente.telefono;
            contactoExistente.direccion = benevole.adresse || contactoExistente.direccion;
            contactoExistente.ciudad = benevole.ville || contactoExistente.ciudad;
            contactoExistente.codigoPostal = benevole.codePostal || contactoExistente.codigoPostal;
            contactoExistente.foto = contactoExistente.foto || benevole.photo;
            contactoExistente.notas = benevole.notes || contactoExistente.notas;
            contactoExistente.activo = benevole.statut?.toLowerCase() === 'actif';
          } else if (departamentoId === 'todos' && benevole.statut?.toLowerCase() === 'actif') {
            // ➕ SOLO AGREGAR nuevos contactos SI estamos en vista "todos"
            // En vistas de departamentos específicos, NO agregar automáticamente
            
            // Extraer IDs de departamentos asignados
            let departamentosAsignados: string[] = [];
            if (Array.isArray(benevole.departement)) {
              departamentosAsignados = benevole.departement;
            } else if (typeof benevole.departement === 'string') {
              departamentosAsignados = benevole.departement.split(',').map((d: string) => d.trim());
            }
            
            console.log(`  🔍 Bénévole ${benevole.prenom} ${benevole.nom}: departamentos =`, departamentosAsignados);
            
            // Convertir bénévole a contacto (solo para vista 'todos')
            const contactoConvertido: ContactoDepartamento = {
              id: benevole.id || `benevole-${Date.now()}-${Math.random()}`,
              departamentoId: benevole.departementId || '',
              departamentoIds: departamentosAsignados,
              nombre: benevole.prenom || '',
              apellido: benevole.nom || '',
              email: benevole.email || '',
              telefono: benevole.telephone || '',
              tipo: 'benevole',
              activo: benevole.statut?.toLowerCase() === 'actif',
              fechaRegistro: benevole.dateInscription || new Date().toISOString(),
              direccion: benevole.adresse || '',
              codigoPostal: benevole.codePostal || '',
              ciudad: benevole.quartier || 'Laval',
              cargo: 'Bénévole',
              notas: benevole.notes || '',
              idiomas: [],
              genero: 'otro',
              nombreCompleto: `${benevole.prenom || ''} ${benevole.nom || ''}`.trim()
            };
            
            contactosData.push(contactoConvertido);
            console.log(`  ✅ Agregado bénévole a vista 'todos': ${contactoConvertido.nombreCompleto}`);
          }
        });
      } catch (error) {
        console.error('❌ Error al cargar bénévoles del módulo principal:', error);
      }
    }
    
    console.log('🔍 DEBUG - Total después de fusión:', contactosData.length);
    
    const contactosVisibles = contactosData.filter((contacto) =>
      tiposPermitidos.includes(contacto.tipo)
    );
    
    console.log('🔍 DEBUG - Contactos cargados pour département', departamentoId, ':', contactosVisibles);
    console.log('🔍 DEBUG - Total contactos visibles:', contactosVisibles.length);
    console.log(`🔍 DEBUG - Contactos filtrados desde fuente completa: ${contactosData.length - contactosVisibles.length}`);
    contactosVisibles.forEach(c => {
      console.log(`  - ${c.nombre} ${c.apellido} (tipo: ${c.tipo}, activo: ${c.activo}, deptId: ${c.departamentoId}, deptIds: ${c.departamentoIds?.join(', ') || 'N/A'})`);
      console.log(`    📍 Dirección: ${c.direccion || 'N/A'}, Apt: ${c.apartamento || 'N/A'}, Ciudad: ${c.ciudad || 'N/A'}, CP: ${c.codigoPostal || 'N/A'}`);
    });
    setContactos(contactosVisibles);
    
    // 🚨 DIAGNÓSTICO ADICIONAL: Verificar localStorage directamente
    const allContactosRaw = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
    if (allContactosRaw) {
      const allContactos = JSON.parse(allContactosRaw);
      console.log(`📦 DEBUG - Total contactos en localStorage: ${allContactos.length}`);
      console.log('📦 DEBUG - Contactos por departamento:');
      const byDept: any = {};
      allContactos.forEach((c: any) => {
        if (!byDept[c.departamentoId]) byDept[c.departamentoId] = [];
        byDept[c.departamentoId].push(`${c.nombre} ${c.apellido} (${c.tipo}, activo:${c.activo})`);
      });
      Object.entries(byDept).forEach(([dept, contacts]: [string, any]) => {
        console.log(`  📁 Dept ${dept}: ${contacts.length} contactos`);
        contacts.forEach((c: any) => console.log(`    ${c}`));
      });
    }
  };

  const cargarIdiomasPersonalizados = () => {
    const idiomasData = obtenerIdiomasPersonalizados();
    setIdiomasPersonalizados(idiomasData);
  };

  const cargarBenevolesDisponibles = () => {
    // Obtenir les bénévoles depuis localStorage (où ils sont stockés dans le module Benevoles)
    const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles'); // ✅ CORREGIDO: clave correcta
    if (benevolesData) {
      try {
        const benevoles = JSON.parse(benevolesData);
        // 🔒 FILTRAR SOLO BÉNÉVOLES ACTIVOS (normalizado a minúsculas)
        const benevolesActivos = benevoles.filter((b: any) => b.statut?.toLowerCase().trim() === 'actif');
        setBenevolesDisponibles(benevolesActivos);
        console.log('✅ Bénévoles disponibles cargados:', benevolesActivos.length);
      } catch (error) {
        console.error('Erreur lors du chargement des bénévoles:', error);
      }
    } else {
      console.warn('⚠️ No se encontraron bénévoles en localStorage');
      setBenevolesDisponibles([]);
    }
  };

  // Fonction pour obtenir dans quels départements un bénévole est assigné
  const obtenerDepartamentosAsignados = (email: string): string[] => {
    const departamentosAsignados: string[] = [];
    
    // Rechercher dans tous les départements configurés
    const departamentosIds = departamentosDisponibles.map(departamento => departamento.id);
    departamentosIds.forEach(deptId => {
      const contactosDept = obtenerContactosDepartamento(deptId);
      const yaAsignado = contactosDept.some(c => c.email === email && c.tipo === 'benevole');
      if (yaAsignado) {
        departamentosAsignados.push(obtenerNombreDepartamentoPorId(deptId));
      }
    });
    
    return departamentosAsignados;
  };

  const abrirDialogoAsignarBenevole = () => {
    cargarBenevolesDisponibles();
    setBusquedaBenevole('');
    setDialogAsignarBenevole(true);
  };

  const asignarBenevoleExistente = (benevole: any) => {
    console.log('🔍 DEBUG - Intentando asignar bénévole:', benevole);
    
    // 🔒 VERIFICAR DUPLICADOS: Buscar en localStorage directamente para mayor confiabilidad
    const todosContactos = obtenerContactosDepartamento();
    const yaExisteEnSistema = todosContactos.find(c => 
      c.email.toLowerCase() === benevole.email.toLowerCase() && c.tipo === 'benevole'
    );
    
    if (yaExisteEnSistema) {
      console.log('⚠️ Bénévole ya existe en el sistema:', yaExisteEnSistema);
      
      // Verificar si ya está en este departamento específico
      if (yaExisteEnSistema.departamentoIds?.includes(departamentoId)) {
        // En lugar de mostrar error, abrir el diálogo de detalle
        console.log('ℹ️ Bénévole ya asignado, mostrando detalles...');
        abrirDialogoDetalle(yaExisteEnSistema);
        setDialogAsignarBenevole(false);
        return;
      }
      
      // Si existe pero no en este departamento, agregarlo a este departamento
      const departamentosActualizados = [...(yaExisteEnSistema.departamentoIds || [yaExisteEnSistema.departamentoId]), departamentoId];
      actualizarContacto(yaExisteEnSistema.id, {
        departamentoIds: departamentosActualizados
      });
      
      // 🔄 Disparar evento de actualización de contactos
      window.dispatchEvent(new CustomEvent('contactos-actualizados', {
        detail: {
          action: 'update',
          departamentoId,
          contactoId: yaExisteEnSistema.id
        }
      }));
      
      toast.success(`Bénévole ${benevole.nom || benevole.nombre} ${benevole.prenom || benevole.apellido} assigné à ce département`);
      cargarContactos(); // Recargar para mostrar el cambio
      setDialogAsignarBenevole(false);
      return;
    }

    // Créer un contact basé sur le bénévole existant
    const nuevoContacto: Omit<ContactoDepartamento, 'id'> = {
      departamentoId,
      departamentoIds: [departamentoId], // ✅ Inicializar con departamento actual
      tipo: 'benevole',
      nombre: benevole.nom || benevole.nombre || '',
      apellido: benevole.prenom || benevole.apellido || '',
      fechaNacimiento: benevole.dateNaissance || benevole.fechaNacimiento || '',
      genero: benevole.sexe || benevole.genero || 'Non spécifié',
      email: benevole.email || '',
      telefono: benevole.telephone || benevole.telefono || '',
      cargo: benevole.poste || benevole.cargo || '',
      disponibilidad: benevole.disponibilites || benevole.disponibilidad || '',
      disponibilidades: benevole.disponibilidadesSemanal || benevole.joursDisponibles?.map((j: any) => ({
        jour: j.jour,
        am: j.am || false,
        pm: j.pm || false
      })) || diasSemana.map(jour => ({ jour, am: false, pm: false })),
      notas: benevole.notasGenerales || benevole.notas || '',
      // ✅ FIX: Asegurar que activo sea true por defecto para nuevos contactos
      activo: benevole.statut ? (benevole.statut.toLowerCase() === 'actif' || benevole.statut.toLowerCase() === 'activo') : true,
      fechaIngreso: benevole.dateInscription || benevole.fechaIngreso || new Date().toISOString().split('T')[0],
      direccion: benevole.adresse || benevole.direccion || '',
      ciudad: benevole.ville || benevole.ciudad || '',
      codigoPostal: benevole.codePostal || benevole.codigoPostal || '',
      numeroEmpleado: '',
      horario: '',
      heuresSemaines: benevole.heuresSemaines || 0,
      reference: benevole.reference || '',
      supervisor: '',
      especialidad: '',
      certificaciones: [],
      idiomas: benevole.langues || benevole.idiomas || [],
      foto: benevole.photo || benevole.foto || '',
      documents: benevole.documents || []
    };

    try {
      console.log('📝 DEBUG - Guardando nuevo contacto:', nuevoContacto);
      const contactoGuardado = guardarContacto(nuevoContacto);
      console.log('✅ Contacto guardado exitosamente:', contactoGuardado);
      console.log('📊 DEBUG - departamentoId:', contactoGuardado.departamentoId);
      console.log('📊 DEBUG - departamentoIds:', contactoGuardado.departamentoIds);
      console.log('📊 DEBUG - activo:', contactoGuardado.activo);
      
      // ✅ VERIFICAR PERSISTENCIA: Leer desde localStorage directamente
      const verificacion = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
      if (verificacion) {
        const todosContactos = JSON.parse(verificacion);
        const contactoVerificado = todosContactos.find((c: any) => c.id === contactoGuardado.id);
        if (contactoVerificado) {
          console.log('✅ VERIFICADO - Contacto guardado en localStorage:', contactoVerificado);
        } else {
          console.error('❌ ERROR - Contacto NO encontrado en localStorage después de guardar');
        }
      }
      
      toast.success(`Bénévole ${benevole.nom || benevole.nombre} ${benevole.prenom || benevole.apellido} assigné avec succès`);
      
      // 🔄 Disparar evento de actualización de contactos
      window.dispatchEvent(new CustomEvent('contactos-actualizados', {
        detail: {
          action: 'create',
          departamentoId,
          contactoId: contactoGuardado.id
        }
      }));
      
      // ✅ RECARGA COMPLETA: Recargar desde localStorage para asegurar persistencia
      cargarContactos();
      
      setDialogAsignarBenevole(false);
    } catch (error) {
      console.error('❌ Error al asignar bénévole:', error);
      toast.error('Espace de stockage insuffisant. Veuillez supprimer des contacts, photos ou documents.');
    }
  };

  const abrirDialogoNuevo = () => {
    // ⚠️ No permitir crear contactos si estamos en modo "todos"
    if (departamentoId === 'todos') {
      toast.error('❌ Impossible de créer un contact en mode "Tous les Bénévoles". Veuillez utiliser le module Bénévoles pour assigner des départements.');
      return;
    }
    limpiarFormulario();
    setDialogAbierto(true);
  };

  const abrirDialogoEditar = (contacto: ContactoDepartamento) => {
    console.log('📂 ABRIR DIÁLOGO EDITAR - Contacto original:', contacto);
    console.log('📂 Dirección del contacto:', {
      direccion: contacto.direccion,
      apartamento: contacto.apartamento,
      ciudad: contacto.ciudad,
      codigoPostal: contacto.codigoPostal,
      quartier: contacto.quartier
    });
    
    // ✅ FORZAR copia completa del contacto con todos los campos de dirección
    const formularioCompleto = {
      ...contacto,
      // ✅ FORZAR campos de dirección explícitamente para evitar pérdida de datos
      direccion: contacto.direccion || '',
      apartamento: contacto.apartamento || '',
      ciudad: contacto.ciudad || '',
      codigoPostal: contacto.codigoPostal || '',
      quartier: contacto.quartier || '' // ✅ CRÍTICO: Incluir quartier para persistencia
    };
    
    console.log('📂 Formulario preparado:', formularioCompleto);
    
    setFormulario(formularioCompleto);
    setContactoSeleccionado(contacto);
    setModoEdicion(true);
    setFotoPreview(contacto.foto || null);
    setDialogAbierto(true);
  };

  const abrirDialogoDetalle = (contacto: ContactoDepartamento) => {
    setContactoSeleccionado(contacto);
    setDialogDetalle(true);
  };

  const limpiarFormulario = () => {
    setFormulario({
      departamentoId: '', // ✅ NO asignar departamento por defecto
      departamentoIds: [], // ✅ Array vacío - sin departamentos por defecto
      tipo: 'benevole', // SIEMPRE bénévole en contactos de departamento
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      genero: 'Non spécifié',
      email: '',
      telefono: '',
      cargo: '',
      disponibilidad: '',
      disponibilidades: diasSemana.map(jour => ({ jour, am: false, pm: false })),
      notas: '',
      activo: true,
      fechaIngreso: new Date().toISOString().split('T')[0],
      direccion: '',
      apartamento: '', // ✅ Campo apartamento
      ciudad: '',
      codigoPostal: '',
      quartier: '', // ✅ Campo quartier - CRÍTICO para inicialización limpia
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
    setModoEdicion(false);
    setContactoSeleccionado(null);
    setFotoPreview(null);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Validar archivo usando utilidad centralizada
    if (!validateImageFile(file)) {
      e.target.value = ''; // Limpiar input
      return;
    }

    // ✅ Leer archivo con utilidad centralizada
    readFileAsDataURL(
      file,
      (dataUrl) => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement('canvas');
          const compressionSteps = [
            { maxSize: 160, quality: 0.72 },
            { maxSize: 120, quality: 0.6 },
            { maxSize: 96, quality: 0.5 }
          ];

          const context = canvas.getContext('2d');
          if (!context) {
            setFotoPreview(dataUrl);
            setFormulario((prev) => ({ ...prev, foto: dataUrl }));
            return;
          }

          let optimized = dataUrl;

          compressionSteps.some(({ maxSize, quality }) => {
            const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
            const width = Math.max(1, Math.round(image.width * scale));
            const height = Math.max(1, Math.round(image.height * scale));

            canvas.width = width;
            canvas.height = height;
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);

            optimized = canvas.toDataURL('image/jpeg', quality);
            return optimized.length <= 24 * 1024;
          });

          setFotoPreview(optimized);
          setFormulario((prev) => ({ ...prev, foto: optimized }));
        };

        image.onerror = () => {
          setFotoPreview(dataUrl);
          setFormulario((prev) => ({ ...prev, foto: dataUrl }));
        };

        image.src = dataUrl;
      },
      () => {
        e.target.value = ''; // Limpiar input en caso de error
      }
    );

    e.target.value = '';
  };

  const limpiarFotosDuplicadasBenevole = (email: string, contactoIdActual: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return;
    }

    const contactosRaw = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
    if (contactosRaw) {
      const contactos = JSON.parse(contactosRaw);
      let cambios = 0;

      const contactosSinFotosDuplicadas = contactos.map((contacto: any) => {
        const mismoBenevole = contacto.email?.trim().toLowerCase() === normalizedEmail;
        if (mismoBenevole && contacto.id !== contactoIdActual && contacto.foto) {
          cambios++;
          return {
            ...contacto,
            foto: ''
          };
        }

        return contacto;
      });

      if (cambios > 0) {
        localStorage.setItem('banqueAlimentaire_contactosDepartamento', JSON.stringify(contactosSinFotosDuplicadas));
      }
    }

    const benevolesRaw = localStorage.getItem('banqueAlimentaire_benevoles');
    if (benevolesRaw) {
      const benevoles = JSON.parse(benevolesRaw);
      let cambios = 0;

      const benevolesSinFotosEspejo = benevoles.map((benevole: any) => {
        const mismoBenevole = benevole.email?.trim().toLowerCase() === normalizedEmail;
        if (mismoBenevole && benevole.photo) {
          cambios++;
          return {
            ...benevole,
            photo: ''
          };
        }

        return benevole;
      });

      if (cambios > 0) {
        localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesSinFotosEspejo));
      }
    }
  };

  const handleGuardar = () => {
    if (!formulario.nombre.trim() || !formulario.apellido.trim()) {
      toast.error('Le nom et prénom sont obligatoires');
      return;
    }

    console.log('🚀 DEBUG - Iniciando guardado de contacto...');
    console.log('  - Modo edición:', modoEdicion);
    console.log('  - Formulario completo:', formulario);
    console.log('  - Campos de dirección:', {
      direccion: formulario.direccion,
      apartamento: formulario.apartamento,
      ciudad: formulario.ciudad,
      codigoPostal: formulario.codigoPostal,
      quartier: formulario.quartier
    });
    console.log('  - Departamento actual (forzado):', departamentoId);

    if (modoEdicion && contactoSeleccionado) {
      // Crear evento de modificación
      const eventoModificacion = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'modification' as const,
        titre: 'Informations modifiées',
        description: 'Les informations du contact ont été mises à jour',
        date: new Date().toISOString(),
        utilisateur: 'David',
        couleur: '#2196F3'
      };
      
      const eventosActuales = contactoSeleccionado.evenements || [];
      
      // ✅ GARANTÍA ABSOLUTA: Guardar TODOS los campos del formulario sin excepciones
      const datosActualizados = {
        // ✅ PASO 1: Copiar ABSOLUTAMENTE TODO del formulario
        ...formulario,
        
        // ✅ PASO 2: FORZAR campos críticos de dirección (garantía extra)
        direccion: formulario.direccion || '',
        apartamento: formulario.apartamento || '',
        ciudad: formulario.ciudad || '',
        codigoPostal: formulario.codigoPostal || '',
        quartier: formulario.quartier || '', // ✅ CRÍTICO: Quartier permanente
        
        // ✅ PASO 3: FORZAR campos de contacto
        email: formulario.email || '',
        telefono: formulario.telefono || '',
        emailPrincipal: formulario.emailPrincipal || formulario.email || '',
        telefonoPrincipal: formulario.telefonoPrincipal || formulario.telefono || '',
        
        // ✅ PASO 4: FORZAR datos personales
        nombre: formulario.nombre || '',
        apellido: formulario.apellido || '',
        fechaNacimiento: formulario.fechaNacimiento || '',
        genero: formulario.genero || 'Non spécifié',
        
        // ✅ PASO 5: FORZAR datos laborales
        cargo: formulario.cargo || '',
        numeroEmpleado: formulario.numeroEmpleado || '',
        horario: formulario.horario || '',
        heuresSemaines: formulario.heuresSemaines || 0,
        reference: formulario.reference || '',
        supervisor: formulario.supervisor || '',
        especialidad: formulario.especialidad || '',
        
        // ✅ PASO 6: FORZAR arrays
        idiomas: formulario.idiomas || [],
        certificaciones: formulario.certificaciones || [],
        disponibilidades: formulario.disponibilidades || [],
        documents: formulario.documents || [],
        
        // ✅ PASO 7: FORZAR emergencia y casier
        contactoEmergencia: formulario.contactoEmergencia,
        fechaConfirmacionCasier: formulario.fechaConfirmacionCasier,
        codigoEthiqueSigne: formulario.codigoEthiqueSigne,
        
        // ✅ PASO 8: FORZAR foto
        foto: formulario.foto || fotoPreview || '',
        
        // ✅ PASO 9: FORZAR notas
        notas: formulario.notas || '',
        
        // ✅ PASO 10: Agregar historial
        evenements: [...eventosActuales, eventoModificacion]
      };
      
      console.log('💾 ==========================================');
      console.log('💾 GUARDANDO CONTACTO ACTUALIZADO (TODOS LOS CAMPOS):');
      console.log('💾 ==========================================');
      console.log('💾 COMPLETO:', datosActualizados);
      console.log('💾 📍 DIRECCIÓN:', {
        direccion: datosActualizados.direccion,
        apartamento: datosActualizados.apartamento,
        ciudad: datosActualizados.ciudad,
        codigoPostal: datosActualizados.codigoPostal,
        quartier: datosActualizados.quartier
      });
      console.log('💾 📧 CONTACTO:', {
        email: datosActualizados.email,
        telefono: datosActualizados.telefono,
        emailPrincipal: datosActualizados.emailPrincipal,
        telefonoPrincipal: datosActualizados.telefonoPrincipal
      });
      console.log('💾 👤 PERSONAL:', {
        nombre: datosActualizados.nombre,
        apellido: datosActualizados.apellido,
        fechaNacimiento: datosActualizados.fechaNacimiento,
        genero: datosActualizados.genero
      });
      console.log('💾 ==========================================');
      
      try {
        if (datosActualizados.tipo === 'benevole' && datosActualizados.email) {
          limpiarFotosDuplicadasBenevole(datosActualizados.email, contactoSeleccionado.id);
        }

        let actualizacionPersistida = actualizarContacto(contactoSeleccionado.id, datosActualizados);

        if (!actualizacionPersistida && datosActualizados.tipo === 'benevole' && datosActualizados.email) {
          optimizarTodosLosContactos();
          limpiarFotosDuplicadasBenevole(datosActualizados.email, contactoSeleccionado.id);
          actualizacionPersistida = actualizarContacto(contactoSeleccionado.id, datosActualizados);
        }

        if (!actualizacionPersistida) {
          throw new Error('La mise à jour n’a pas pu être persistée dans le stockage local');
        }

        // 🔄🔄🔄 SINCRONIZACIÓN TOTAL: Si es un bénévole, propagar cambios a TODOS los lugares
        if (datosActualizados.tipo === 'benevole' && datosActualizados.email) {
          console.log('🔄 ==========================================');
          console.log('🔄 INICIANDO SINCRONIZACIÓN TOTAL DE BÉNÉVOLE');
          console.log('🔄 Email:', datosActualizados.email);
          console.log('🔄 ==========================================');
          
          // 1️⃣ Actualizar en el módulo Bénévoles principal
          const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
          if (benevolesData) {
            const benevoles = JSON.parse(benevolesData);
            const benevolesActualizados = benevoles.map((b: any) => {
              if (b.email && datosActualizados.email && 
                  b.email.toLowerCase() === datosActualizados.email.toLowerCase()) {
                console.log('✅ Actualizando bénévole en módulo principal:', b.nom);
                return {
                  ...b,
                  // Actualizar TODOS los campos
                  nom: datosActualizados.apellido || b.nom,
                  prenom: datosActualizados.nombre || b.prenom,
                  email: datosActualizados.email,
                  telephone: datosActualizados.telefono || b.telephone,
                  adresse: datosActualizados.direccion || b.adresse,
                  ville: datosActualizados.ciudad || b.ville,
                  codePostal: datosActualizados.codigoPostal || b.codePostal,
                  dateNaissance: datosActualizados.fechaNacimiento || b.dateNaissance,
                  langues: datosActualizados.idiomas || b.langues,
                  competences: datosActualizados.certificaciones || b.competences,
                  disponibilites: datosActualizados.disponibilidades || b.disponibilites,
                  statut: datosActualizados.activo ? 'Actif' : 'Inactif',
                  photo: b.photo || '',
                  notes: datosActualizados.notas || b.notes,
                  // Mantener departamentos y rol existentes
                  departement: b.departement,
                  role: b.role
                };
              }
              return b;
            });
            localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesActualizados));
            console.log('✅ Módulo Bénévoles principal actualizado');
          }
          
          // 2️⃣ Actualizar en TODOS los registros de contactosDepartamento con el mismo email
          const contactosDeptData = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
          if (contactosDeptData) {
            const contactosDept = JSON.parse(contactosDeptData);
            let contactosActualizados = 0;
            
            const contactosDeptActualizados = contactosDept.map((c: any) => {
              if (c.email && datosActualizados.email && 
                  c.email.toLowerCase() === datosActualizados.email.toLowerCase() &&
                  c.id !== contactoSeleccionado.id) { // No actualizar el que ya actualizamos
                contactosActualizados++;
                console.log(`✅ Sincronizando contacto en departamento: ${c.departamentoId}`);
                return {
                  ...c,
                  // Sincronizar TODOS los campos importantes
                  nombre: datosActualizados.nombre,
                  apellido: datosActualizados.apellido,
                  nombreCompleto: datosActualizados.nombreCompleto,
                  email: datosActualizados.email,
                  telefono: datosActualizados.telefono,
                  emailPrincipal: datosActualizados.emailPrincipal,
                  telefonoPrincipal: datosActualizados.telefonoPrincipal,
                  direccion: datosActualizados.direccion,
                  apartamento: datosActualizados.apartamento,
                  ciudad: datosActualizados.ciudad,
                  codigoPostal: datosActualizados.codigoPostal,
                  quartier: datosActualizados.quartier,
                  fechaNacimiento: datosActualizados.fechaNacimiento,
                  genero: datosActualizados.genero,
                  cargo: datosActualizados.cargo,
                  numeroEmpleado: datosActualizados.numeroEmpleado,
                  horario: datosActualizados.horario,
                  heuresSemaines: datosActualizados.heuresSemaines,
                  reference: datosActualizados.reference,
                  supervisor: datosActualizados.supervisor,
                  especialidad: datosActualizados.especialidad,
                  idiomas: datosActualizados.idiomas,
                  certificaciones: datosActualizados.certificaciones,
                  disponibilidades: datosActualizados.disponibilidades,
                  contactoEmergencia: datosActualizados.contactoEmergencia,
                  fechaConfirmacionCasier: datosActualizados.fechaConfirmacionCasier,
                  codigoEthiqueSigne: datosActualizados.codigoEthiqueSigne,
                  foto: c.foto,
                  notas: datosActualizados.notas,
                  activo: datosActualizados.activo,
                  // Mantener campos específicos del departamento
                  departamentoId: c.departamentoId,
                  departamentoIds: c.departamentoIds,
                  tipo: c.tipo
                };
              }
              return c;
            });
            
            localStorage.setItem('banqueAlimentaire_contactosDepartamento', JSON.stringify(contactosDeptActualizados));
            console.log(`✅ ${contactosActualizados} contacto(s) sincronizado(s) en otros departamentos`);
          }
          
          console.log('🔄 ==========================================');
          console.log('🔄 SINCRONIZACIÓN TOTAL COMPLETADA');
          console.log('🔄 ==========================================');
          
          // 🔄 Disparar evento de sincronización global
          window.dispatchEvent(new CustomEvent('benevole-sincronizado', {
            detail: {
              email: datosActualizados.email,
              nombreCompleto: datosActualizados.nombreCompleto
            }
          }));
        }

        // ✅ VERIFICACIÓN POST-GUARDADO: Leer inmediatamente de localStorage
        setTimeout(() => {
          const contactoVerificado = obtenerContactoPorId(contactoSeleccionado.id);
          console.log('✅ ==========================================');
          console.log('✅ VERIFICACIÓN POST-GUARDADO:');
          console.log('✅ ==========================================');
          console.log('✅ Contacto leído de localStorage:', contactoVerificado);
          console.log('✅ 📍 Dirección verificada:', {
            direccion: contactoVerificado?.direccion,
            apartamento: contactoVerificado?.apartamento,
            ciudad: contactoVerificado?.ciudad,
            codigoPostal: contactoVerificado?.codigoPostal,
            quartier: contactoVerificado?.quartier
          });
          console.log('✅ 📧 Contacto verificado:', {
            email: contactoVerificado?.email,
            telefono: contactoVerificado?.telefono
          });
          
          // ⚠️ ALERTA SI FALTAN DATOS
          if (!contactoVerificado?.quartier && datosActualizados.quartier) {
            console.error('❌❌❌ CRÍTICO: ¡El campo quartier NO se guardó!');
            console.error('❌ Esperado:', datosActualizados.quartier);
            console.error('❌ Encontrado:', contactoVerificado?.quartier);
          }
          if (!contactoVerificado?.direccion && datosActualizados.direccion) {
            console.error('❌❌❌ CRÍTICO: ¡El campo direccion NO se guardó!');
          }
          console.log('✅ ==========================================');
        }, 100);
        
        toast.success('Contact mis à jour avec succès');
        cargarContactos();
      } catch (error) {
        console.error('❌ Error al actualizar contacto:', error);
        toast.error('Impossible de mettre à jour le contact avec la photo. Le stockage local a été assaini, mais il reste saturé.');
        return;
      }
    } else {
      // Crear evento de creación
      const eventoCreacion = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'creation' as const,
        titre: 'Contact créé',
        description: `Nouveau contact ajouté au département ${departamentoNombre}`,
        date: new Date().toISOString(),
        utilisateur: 'David',
        couleur: '#4CAF50'
      };
      
      const departamentoAsignadoPorDefecto = departamentoId !== 'todos' ? departamentoId : '';

      const contactoParaGuardar = {
        ...formulario,
        // En un módulo de departamento específico, asignar automáticamente ese departamento.
        departamentoId: formulario.departamentoId || departamentoAsignadoPorDefecto,
        departamentoIds: formulario.departamentoIds && formulario.departamentoIds.length > 0 
          ? formulario.departamentoIds 
          : (departamentoAsignadoPorDefecto ? [departamentoAsignadoPorDefecto] : []),
        activo: true, // ✅ GARANTIZAR que el campo activo esté definido
        evenements: [eventoCreacion] // ✅ Añadir evento de creación
      };
      
      console.log('📝 ==========================================');
      console.log('📝 GUARDANDO NUEVO CONTACTO (TODOS LOS CAMPOS):');
      console.log('📝 ==========================================');
      console.log('📝 COMPLETO:', contactoParaGuardar);
      console.log('📝 📍 DIRECCIÓN:', {
        direccion: contactoParaGuardar.direccion,
        apartamento: contactoParaGuardar.apartamento,
        ciudad: contactoParaGuardar.ciudad,
        codigoPostal: contactoParaGuardar.codigoPostal,
        quartier: contactoParaGuardar.quartier
      });
      console.log('📝 ==========================================');
      
      try {
        const contactoGuardado = guardarContacto(contactoParaGuardar);
        console.log(`✅ DEBUG - Contacto guardado con ID: ${contactoGuardado.id}`);
        
        // 🔄🔄🔄 SINCRONIZACIÓN EN CREACIÓN: Si es un bénévole nuevo, agregarlo al módulo principal
        if (contactoGuardado.tipo === 'benevole' && contactoGuardado.email) {
          try {
            console.log('🔄 ==========================================');
            console.log('🔄 SINCRONIZANDO NUEVO BÉNÉVOLE AL MÓDULO PRINCIPAL');
            console.log('🔄 Email:', contactoGuardado.email);
            console.log('🔄 ==========================================');
            
            const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
            const benevoles = benevolesData ? JSON.parse(benevolesData) : [];
            
            // Verificar si el bénévole ya existe por email
            const benevoleExistente = benevoles.find((b: any) => 
              b.email && contactoGuardado.email && 
              b.email.toLowerCase() === contactoGuardado.email.toLowerCase()
            );
            
            if (!benevoleExistente) {
              // Crear nuevo bénévole en el módulo principal
              const nuevoBenevole = {
                id: contactoGuardado.id,
                nom: contactoGuardado.apellido || '',
                prenom: contactoGuardado.nombre || '',
                email: contactoGuardado.email,
                telephone: contactoGuardado.telefono || '',
                adresse: contactoGuardado.direccion || '',
                ville: contactoGuardado.ciudad || '',
                codePostal: contactoGuardado.codigoPostal || '',
                dateNaissance: contactoGuardado.fechaNacimiento || '',
                langues: contactoGuardado.idiomas || [],
                competences: contactoGuardado.certificaciones || [],
                disponibilites: contactoGuardado.disponibilidades || [],
                departement: contactoGuardado.departamentoIds || [departamentoId],
                statut: 'Actif',
                photo: '',
                notes: contactoGuardado.notas || '',
                dateInscription: new Date().toISOString().split('T')[0],
                heuresContribuees: 0,
                role: 'Bénévole'
              };
              
              benevoles.push(nuevoBenevole);
              localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevoles));
              console.log('✅ Nuevo bénévole agregado al módulo principal');
            } else {
              // Si ya existe, actualizar sus departamentos
              const benevolesActualizados = benevoles.map((b: any) => {
                if (b.id === benevoleExistente.id) {
                  const deptsActuales = Array.isArray(b.departement) ? b.departement : [b.departement];
                  const nuevosDepts = [...new Set([...deptsActuales, departamentoId])];
                  console.log(`✅ Agregando departamento ${departamentoId} a bénévole existente`);
                  return { ...b, departement: nuevosDepts };
                }
                return b;
              });
              localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesActualizados));
            }
            
            console.log('🔄 SINCRONIZACIÓN DE CREACIÓN COMPLETADA');
            console.log('🔄 ==========================================');
          } catch (error) {
            console.error('❌ Error en sincronización de creación:', error);
          }
        }
        
        // ✅ VERIFICACIÓN POST-GUARDADO: Leer inmediatamente de localStorage
        setTimeout(() => {
          const contactoVerificado = obtenerContactoPorId(contactoGuardado.id);
          console.log('✅ ==========================================');
          console.log('✅ VERIFICACIÓN POST-CREACIÓN:');
          console.log('✅ ==========================================');
          console.log('✅ Contacto leído de localStorage:', contactoVerificado);
          console.log('✅ 📍 Dirección verificada:', {
            direccion: contactoVerificado?.direccion,
            apartamento: contactoVerificado?.apartamento,
            ciudad: contactoVerificado?.ciudad,
            codigoPostal: contactoVerificado?.codigoPostal,
            quartier: contactoVerificado?.quartier
          });
          
          // ⚠️ ALERTA SI FALTAN DATOS
          if (!contactoVerificado?.quartier && contactoParaGuardar.quartier) {
            console.error('❌❌❌ CRÍTICO: ¡El campo quartier NO se guardó en nuevo contacto!');
            console.error('❌ Esperado:', contactoParaGuardar.quartier);
            console.error('❌ Encontrado:', contactoVerificado?.quartier);
          }
          if (!contactoVerificado?.direccion && contactoParaGuardar.direccion) {
            console.error('❌❌❌ CRÍTICO: ¡El campo direccion NO se guardó en nuevo contacto!');
          }
          console.log('✅ ==========================================');
        }, 100);
        
        // ✅ RECARGA COMPLETA: Recargar desde localStorage para asegurar persistencia
        cargarContactos();
        
        // 🔄 Disparar evento de actualización de contactos
        window.dispatchEvent(new CustomEvent('contactos-actualizados', {
          detail: {
            action: modoEdicion ? 'update' : 'create',
            departamentoId,
            contactoId: contactoGuardado.id
          }
        }));
        
        toast.success('Contact créé avec succès');
      } catch (error) {
        console.error('❌ Error al guardar contacto:', error);
        toast.error('Espace de stockage insuffisant. Veuillez supprimer des photos ou documents.');
        return; // No cerrar el diálogo para que el usuario pueda modificar
      }
    }

    setDialogAbierto(false);
    limpiarFormulario();
  };

  const handleEliminar = () => {
    if (contactoSeleccionado) {
      eliminarContacto(contactoSeleccionado.id);
      
      // 🔄 Si es un bénévole, TAMBIÉN eliminarlo del módulo Bénévoles principal
      if (contactoSeleccionado.tipo === 'benevole' && contactoSeleccionado.email) {
        try {
          const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
          if (benevolesData) {
            const benevoles = JSON.parse(benevolesData);
            
            // Buscar el bénévole por email
            const benevoleEncontrado = benevoles.find((b: any) => 
              b.email && contactoSeleccionado.email && 
              b.email.toLowerCase() === contactoSeleccionado.email.toLowerCase()
            );
            
            if (benevoleEncontrado) {
              // 🗑️ ELIMINAR del módulo principal si solo está en este departamento
              const depts = Array.isArray(benevoleEncontrado.departement) 
                ? benevoleEncontrado.departement 
                : (benevoleEncontrado.departement ? [benevoleEncontrado.departement] : []);
              
              const departamentosRestantes = depts.filter((d: string) => {
                return d !== departamentoId && obtenerIdDepartamentoPorNombre(d) !== departamentoId;
              });
              
              if (departamentosRestantes.length === 0) {
                // Si no tiene más departamentos, ELIMINAR completamente
                const benevolesActualizados = benevoles.filter((b: any) => b.id !== benevoleEncontrado.id);
                localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesActualizados));
                console.log(`🗑️ Bénévole ${contactoSeleccionado.nombreCompleto} eliminado completamente del módulo principal`);
              } else {
                // Si tiene otros departamentos, solo actualizar la lista
                const benevolesActualizados = benevoles.map((b: any) => {
                  if (b.id === benevoleEncontrado.id) {
                    return {
                      ...b,
                      departement: departamentosRestantes
                    };
                  }
                  return b;
                });
                localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesActualizados));
                console.log(`♻️ Bénévole ${contactoSeleccionado.nombreCompleto} actualizado - Departamentos restantes:`, departamentosRestantes);
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du bénévole:', error);
        }
      }
      
      toast.success('Contact supprimé avec succès');
      
      // 🔄 Disparar evento de actualización de contactos
      window.dispatchEvent(new CustomEvent('contactos-actualizados', {
        detail: {
          action: 'delete',
          departamentoId,
          contactoId: contactoSeleccionado.id
        }
      }));
      
      // ✅ SOLUCIÓN DEFINITIVA: Actualizar el estado inmediatamente
      setContactos(prevContactos => prevContactos.filter(c => c.id !== contactoSeleccionado.id));
      
      setDialogEliminar(false);
      setContactoSeleccionado(null);
    }
  };

  const toggleIdioma = (idioma: IdiomaContacto) => {
    const idiomasActuels = formulario.idiomas || [];
    const nouveauxIdiomas = idiomasActuels.includes(idioma)
      ? idiomasActuels.filter(i => i !== idioma)
      : [...idiomasActuels, idioma];
    setFormulario({ ...formulario, idiomas: nouveauxIdiomas });
  };

  const updateDisponibilidad = (index: number, field: 'am' | 'pm', value: boolean) => {
    setFormulario(prev => {
      const nouvellesDisponibilites = [...(prev.disponibilidades || [])];
      nouvellesDisponibilites[index] = { ...nouvellesDisponibilites[index], [field]: value };
      return { ...prev, disponibilidades: nouvellesDisponibilites };
    });
  };

  const abrirBorradorEmailOutlook = (destinatarios: string[], asunto: string, mensaje: string) => {
    const destinatariosLimpios = Array.from(new Set(destinatarios.map((email) => String(email || '').trim()).filter(Boolean)));
    if (destinatariosLimpios.length === 0) {
      toast.error('Aucun destinataire email valide.');
      return;
    }

    const senderEmail = String(usuarioSesion?.email || '').trim();
    if (!senderEmail) {
      toast.error('Aucun expéditeur connecté', {
        description: 'Connectez-vous avec un utilisateur ayant une adresse email valide.',
      });
      return;
    }

    const composeUrl = new URL('https://outlook.office.com/mail/deeplink/compose');
    composeUrl.searchParams.set('to', destinatariosLimpios.join(';'));
    composeUrl.searchParams.set('subject', asunto);
    composeUrl.searchParams.set('body', mensaje);
    composeUrl.searchParams.set('from', senderEmail);

    const mailtoTo = encodeURIComponent(destinatariosLimpios.join(','));
    const mailtoSubject = encodeURIComponent(asunto);
    const mailtoBody = encodeURIComponent(mensaje);
    const mailtoUrl = `mailto:${mailtoTo}?subject=${mailtoSubject}&body=${mailtoBody}`;

    let localClientLikelyOpened = false;
    const markClientOpen = () => {
      localClientLikelyOpened = true;
    };
    window.addEventListener('blur', markClientOpen, { once: true });

    window.location.href = mailtoUrl;

    window.setTimeout(() => {
      if (localClientLikelyOpened) {
        return;
      }

      const shouldOpenWeb = window.confirm('Outlook local ne semble pas disponible. Voulez-vous ouvrir Outlook Web ?');
      if (shouldOpenWeb) {
        window.open(composeUrl.toString(), '_blank', 'noopener,noreferrer');
      }
    }, 1500);

    toast.success('Ouverture du brouillon Outlook local', {
      description: 'Si Outlook local ne s’ouvre pas, vous pourrez basculer vers Outlook Web.',
      duration: 5000,
    });
  };

  const handleEnviarEmailContacto = (contacto: ContactoDepartamento) => {
    if (!contacto.email) {
      toast.error('Ce contact n’a pas d’adresse email.');
      return;
    }

    const nombreMostrado = (contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && contacto.nombreEmpresa
      ? contacto.nombreEmpresa
      : `${contacto.nombre} ${contacto.apellido}`.trim();
    const asunto = `Message - ${departamentoNombre}`;
    const mensaje = `Bonjour ${nombreMostrado},\n\n`;
    abrirBorradorEmailOutlook([contacto.email], asunto, mensaje);
  };

  const handleEnviarEmailGrupal = (contactosLista: ContactoDepartamento[]) => {
    const destinatarios = contactosLista
      .map((contacto) => contacto.email)
      .filter((email): email is string => Boolean(String(email || '').trim()));

    if (destinatarios.length === 0) {
      toast.error('Aucun contact filtré avec un email valide.');
      return;
    }

    const asunto = `Message groupé - ${departamentoNombre}`;
    const mensaje = 'Bonjour,\n\n';
    abrirBorradorEmailOutlook(destinatarios, asunto, mensaje);
  };

  const contactosFiltrados = contactos.filter(contacto => {
    // Filtrer seulement les contacts actifs (ou sans le champ activo défini pour la compatibilité)
    if (contacto.activo === false) {
      console.log(`❌ Filtrado contacto inactivo: ${contacto.nombre} ${contacto.apellido}`);
      return false;
    }
    
    const searchText = busqueda.toLowerCase();
    const matchBusqueda = busqueda === '' || 
      `${contacto.nombre} ${contacto.apellido}`.toLowerCase().includes(searchText) ||
      (contacto.nombreEmpresa || '').toLowerCase().includes(searchText) ||
      contacto.email.toLowerCase().includes(searchText) ||
      contacto.telefono.includes(busqueda) ||
      (contacto.numeroArchivo || '').toLowerCase().includes(searchText);
    
    const matchTipo = tipoFiltro === 'todos' || contacto.tipo === tipoFiltro;
    const matchDia = diaFiltro === 'todos' || Boolean(
      (contacto.disponibilidades || []).some((disponibilidad) => (
        disponibilidad.jour === diaFiltro && (disponibilidad.am || disponibilidad.pm)
      ))
    );
    
    if (!matchBusqueda) {
      console.log(`❌ Filtrado por búsqueda: ${contacto.nombre} ${contacto.apellido} (búsqueda: "${busqueda}")`);
    }
    if (!matchTipo) {
      console.log(`❌ Filtrado por tipo: ${contacto.nombre} ${contacto.apellido} (tipo: ${contacto.tipo}, filtro: ${tipoFiltro})`);
    }
    if (!matchDia) {
      console.log(`❌ Filtrado por día: ${contacto.nombre} ${contacto.apellido} (día: ${diaFiltro})`);
    }
    
    return matchBusqueda && matchTipo && matchDia;
  });
  
  // Log final de resultados filtrados
  console.log(`✅ Contactos después de filtros: ${contactosFiltrados.length}/${contactos.length}`);

  const estadisticas = contarContactosPorTipo(departamentoId);

  const getTipoConfig = (tipo: TipoContacto) => {
    // D'abord rechercher dans les types personnalisés créés par l'utilisateur (globales + departamento)
    const tiposPersonalizados = obtenerTiposContacto(departamentoId);
    const tipoPersonalizado = tiposPersonalizados.find(t => t.code === tipo);
    
    if (tipoPersonalizado) {
      const IconComponent = ICON_MAP[tipoPersonalizado.icon] || User;
      return {
        color: tipoPersonalizado.color,
        icon: IconComponent,
        label: tipoPersonalizado.label,
        bgColor: tipoPersonalizado.bgColor
      };
    }
    
    // Si n'existe pas dans les personnalisés, utiliser la configuration par défaut
    const configs = {
      donador: { 
        color: '#FCD34D', 
        icon: Heart, 
        label: 'Donateur de la Banque',
        bgColor: '#FEF3C7'
      },
      fournisseur: { 
        color: branding.primaryColor, 
        icon: Building2, 
        label: 'Fournisseur',
        bgColor: '#DBEAFE'
      },
      benevole: { 
        color: '#9CA3AF', 
        icon: UserCheck, 
        label: 'Bénévole / Professionnel administratif',
        bgColor: '#F3F4F6'
      },
      'responsable-sante': { 
        color: '#EC4899', 
        icon: Stethoscope, 
        label: 'Responsable de Santé Alimentaire',
        bgColor: '#FCE7F3'
      },
      partenaire: { 
        color: '#F59E0B', 
        icon: Star, 
        label: 'Partenaire / Bénévole informel',
        bgColor: '#FEF3C7'
      },
      visiteur: { 
        color: branding.secondaryColor, 
        icon: UserPlus, 
        label: 'Visitante ou Invité',
        bgColor: '#D1FAE5'
      },
      employe: { 
        color: '#65A30D', 
        icon: User, 
        label: 'Employé',
        bgColor: '#ECF9EE'
      }
    };
    return configs[tipo] || {
      color: branding.primaryColor,
      icon: User,
      label: tipo,
      bgColor: '#F3F4F6'
    };
  };

  const handleMigrarContactos = () => {
    if (confirm('🔄 Voulez-vous migrer les contacts depuis l\'ancien système?\n\nCeci va transférer tous les donateurs et fournisseurs au nouveau système de Gestion des Contacts.')) {
      const resultado = migrarContactosDesdeEntrepot();
      
      if (resultado.migrados > 0) {
        cargarContactos();
        toast.success(`✅ Migration réussie! ${resultado.migrados} contact(s) migré(s).`);
        
        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('contactos-migrados', { 
          detail: { departamentoId, migrados: resultado.migrados } 
        }));
      } else {
        toast.info('ℹ️ Aucun contact à migrer.');
      }
      
      if (resultado.errores > 0) {
        toast.error(`⚠️ ${resultado.errores} erreur(s) lors de la migration.`);
      }
    }
  };

  // ===== FUNCIONES AUXILIARES PARA HISTORIAL DE ACTIVIDAD =====
  
  /**
   * Genera eventos de ejemplo para demostración del historial de actividad
   * Esta función es solo para fines de demostración
   */
  const generarEventosEjemplo = (contactoNombre: string): EvenementActivite[] => {
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
    
    const haceTresDias = new Date();
    haceTresDias.setDate(haceTresDias.getDate() - 3);
    
    const haceUnDia = new Date();
    haceUnDia.setDate(haceUnDia.getDate() - 1);
    
    return [
      {
        id: `evt-${Date.now()}-1`,
        type: 'creation',
        titre: 'Contact créé',
        description: `${contactoNombre} a été ajouté au système`,
        date: haceUnaSemana.toISOString(),
        utilisateur: 'David',
        couleur: '#4CAF50'
      },
      {
        id: `evt-${Date.now()}-2`,
        type: 'note_ajoutee',
        titre: 'Note ajoutée',
        description: 'Informations complémentaires sur les disponibilités',
        date: haceTresDias.toISOString(),
        utilisateur: 'David',
        couleur: '#9C27B0'
      },
      {
        id: `evt-${Date.now()}-3`,
        type: 'modification',
        titre: 'Coordonnées mises à jour',
        description: 'Numéro de téléphone et adresse modifiés',
        date: haceUnDia.toISOString(),
        utilisateur: 'David',
        couleur: '#2196F3'
      }
    ];
  };

  return (
    <div
      className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-3 sm:p-4 space-y-3 sm:space-y-4"
      style={contactsViewportZoom < 1 ? { zoom: contactsViewportZoom } : undefined}
    >
      {/* Header avec statistiques - Diseño Premium */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 p-3 sm:p-4 lg:p-5">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-green-500/5 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" 
                     style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate" 
                      style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Gestion des Contacts
                  </h2>
                  <p className="text-xs sm:text-sm font-medium truncate" style={{ color: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}>
                    {departamentoNombre}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 ml-0" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Gérez tous les contacts du département • <span className="font-semibold">{contactos.length} contacts</span> actifs
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              {departamentoId !== 'todos' && (
                <>
                  <Button
                    onClick={abrirDialogoAsignarBenevole}
                    className="text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl w-full sm:w-auto text-sm sm:text-base"
                    style={{ 
                      backgroundColor: branding.primaryColor,
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    <span className="truncate">Assigner un bénévole</span>
                  </Button>
                  {tiposPermitidos.length > 0 && (
                    <Button
                      onClick={abrirDialogoNuevo}
                      className="text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl w-full sm:w-auto text-sm sm:text-base"
                      style={{ 
                        backgroundColor: branding.secondaryColor,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau contact
                    </Button>
                  )}
                </>
              )}
              {departamentoId === 'todos' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  💡 <strong>Mode Visualisation</strong> - Pour assigner des départements aux bénévoles, utilisez le bouton "Assigner aux départements" dans la liste des bénévoles.
                </div>
              )}
              {/* BOTONES DE DIAGNÓSTICO REMOVIDOS - NO NECESARIOS EN PRODUCCIÓN */}
            </div>
          </div>

          {/* Statistiques */}
          {tiposPermitidos.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-2xl p-8 text-center shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-lg">
                <Building2 className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Aucun type de contact créé
                </p>
                <p className="text-sm text-amber-700 mb-5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Créez vos premiers types de contact pour commencer à gérer vos contacts.
                </p>
                <Button
                  onClick={abrirDialogoNuevo}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un contact
                </Button>
                <p className="text-xs text-amber-600 mt-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  💡 Les types de contact se créent automatiquement lors de la création du premier contact
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${isCompactContactsViewport ? 'grid grid-cols-3 sm:grid-cols-6 gap-2' : 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4'}`}>
            {Object.entries(estadisticas)
              .filter(([tipo]) => tiposPermitidos.includes(tipo as TipoContacto))
              .map(([tipo, count]) => {
              const config = getTipoConfig(tipo as TipoContacto);
              const Icon = config.icon;
              return (
                <div
                  key={tipo}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-slate-200/60 hover:border-slate-300 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       style={{ background: `linear-gradient(135deg, ${config.color}15, transparent)` }} />
                  <div className="relative p-2.5 sm:p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0" 
                           style={{ backgroundColor: config.bgColor }}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: config.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-600 font-medium truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {config.label.split(' /')[0]}
                        </p>
                        <p className="text-base sm:text-lg font-bold" style={{ color: config.color, fontFamily: 'Montserrat, sans-serif' }}>
                          {count}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 rounded-bl-full opacity-10" 
                       style={{ backgroundColor: config.color }} />
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Tabs: Liste et Calendrier */}
      <Tabs value={activeContactsTab} onValueChange={setActiveContactsTab} className="w-full">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <div className="relative z-10">
            <TabsList className={`grid w-full grid-cols-2 ${isCompactContactsViewport ? 'max-w-full' : 'max-w-full sm:max-w-md'} bg-slate-100/80 p-1 rounded-xl`}>
              <TabsTrigger 
                value="liste" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Users className="w-4 h-4" />
                Liste des Contacts
              </TabsTrigger>
              <TabsTrigger 
                value="calendrier" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-xs sm:text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Calendar className="w-4 h-4" />
                Calendrier des horaires
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Liste */}
        <TabsContent value="liste" className="space-y-3 sm:space-y-4 mt-0">
          {/* Recherche et filtres */}
          <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 p-3 sm:p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/30 pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-12 h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white/80 text-xs"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {tiposPermitidos.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Aucun type de contact créé. Créez votre premier contact pour commencer.</span>
                  </div>
                ) : (
                  <>
                    <Select value={diaFiltro} onValueChange={(value) => setDiaFiltro(value)}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Filtrer par jour" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Tous les jours</SelectItem>
                        {diasSemana.map((jour) => (
                          <SelectItem key={jour} value={jour}>{jour}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={tipoFiltro === 'todos' ? 'default' : 'outline'}
                      onClick={() => setTipoFiltro('todos')}
                      size="sm"
                      style={tipoFiltro === 'todos' ? { backgroundColor: branding.primaryColor } : {}}
                    >
                      Tous ({contactos.filter(c => c.activo).length})
                    </Button>
                    {Object.entries(estadisticas)
                      .filter(([tipo]) => tiposPermitidos.includes(tipo as TipoContacto))
                      .map(([tipo, count]) => {
                      const config = getTipoConfig(tipo as TipoContacto);
                      return (
                        <Button
                          key={tipo}
                          variant={tipoFiltro === tipo ? 'default' : 'outline'}
                          onClick={() => setTipoFiltro(tipo as TipoContacto)}
                          size="sm"
                          style={tipoFiltro === tipo ? { backgroundColor: config.color } : {}}
                        >
                          {config.label.split(' ')[0]} ({count})
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEnviarEmailGrupal(contactosFiltrados)}
                      disabled={!contactosFiltrados.some((contacto) => Boolean(String(contacto.email || '').trim()))}
                      className="gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email groupé
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Liste de contacts */}
          <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/60 p-3 sm:p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 pointer-events-none" />
            <div className="relative z-10">
              {contactosFiltrados.length === 0 ? (
                <div className="text-center py-8 sm:py-10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Users className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base font-semibold mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Aucun contact trouvé
                  </p>
                  <p className="text-slate-500 text-xs" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Créez un nouveau contact pour commencer
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {contactosFiltrados.map((contacto) => {
                    const config = getTipoConfig(contacto.tipo);
                    const Icon = config.icon;
                    return (
                      <div 
                        key={contacto.id} 
                        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${config.color}60`;
                          e.currentTarget.style.background = `linear-gradient(to bottom right, white, ${config.color}08)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgb(226 232 240 / 0.6)';
                          e.currentTarget.style.background = 'white';
                        }}
                      >
                        {/* Decorative accent */}
                        <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2" 
                             style={{ backgroundColor: config.color }} />
                        
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-md flex-shrink-0 transition-transform duration-300 group-hover:scale-110" 
                                   style={{ borderColor: config.color }}>
                                {contacto.foto ? (
                                  <ImageWithFallback src={contacto.foto} alt={`${contacto.nombre} ${contacto.apellido}`} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br" 
                                       style={{ 
                                         background: `linear-gradient(135deg, ${config.bgColor}, ${config.color}20)` 
                                       }}>
                                    <User className="w-7 h-7" style={{ color: config.color }} />
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center shadow-sm" 
                                   style={{ backgroundColor: config.color }}>
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="font-bold text-slate-800 truncate text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {(contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && contacto.nombreEmpresa 
                                    ? contacto.nombreEmpresa 
                                    : `${contacto.nombre} ${contacto.apellido}`}
                                </h3>
                              </div>
                              
                              {/* 🆔 Número de archivo */}
                              {contacto.numeroArchivo && (
                                <Badge 
                                  className="text-[10px] mb-2 font-mono font-semibold rounded-md px-2 py-0.5" 
                                  style={{ 
                                    backgroundColor: '#1a4d7a15', 
                                    color: '#1a4d7a',
                                    border: '1px solid #1a4d7a30'
                                  }}
                                >
                                  {contacto.numeroArchivo}
                                </Badge>
                              )}
                              
                              <Badge 
                                className="text-xs mb-2 font-medium rounded-lg" 
                                style={{ backgroundColor: `${config.color}15`, color: config.color, fontFamily: 'Roboto, sans-serif' }}
                              >
                                {config.label.split(' ')[0]}
                              </Badge>
                              
                              {/* Afficher la personne de contact si c'est une entreprise */}
                              {(contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && contacto.nombreEmpresa && (contacto.nombre || contacto.apellido) && (
                                <p className="text-xs text-slate-600 mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                  <User className="w-3.5 h-3.5" />
                                  Contact: {contacto.nombre} {contacto.apellido}
                                </p>
                              )}
                              {contacto.cargo && (
                                <p className="text-xs text-slate-600 mb-1.5 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                  {contacto.cargo}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{contacto.email}</span>
                              </div>
                              {contacto.telefono && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{contacto.telefono}</span>
                                </div>
                              )}
                              {contacto.idiomas && contacto.idiomas.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                  {contacto.idiomas.map((idioma, idx) => (
                                    <Badge 
                                      key={`${contacto.id}-idioma-${idx}-${idioma}`} 
                                      variant="outline" 
                                      className="text-xs rounded-md border-slate-300"
                                      style={{ fontFamily: 'Roboto, sans-serif' }}
                                    >
                                      {idioma.toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirDialogoDetalle(contacto)}
                              className="flex-1 hover:bg-blue-50 rounded-lg transition-colors"
                              style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                              <Eye className="w-4 h-4 mr-1.5" style={{ color: branding.primaryColor }} />
                              Voir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEnviarEmailContacto(contacto)}
                              disabled={!Boolean(String(contacto.email || '').trim())}
                              title={contacto.email ? 'Envoyer un email' : 'Aucun email disponible'}
                              className="hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Mail className="w-4 h-4" style={{ color: '#059669' }} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setContactoParaRol({
                                  id: contacto.id.toString(),
                                  nombre: contacto.nombre,
                                  apellido: contacto.apellido,
                                  nombreCompleto: `${contacto.nombre} ${contacto.apellido}`,
                                  email: contacto.email,
                                  telefono: contacto.telefono || '',
                                  cargo: contacto.cargo || 'Contact',
                                  modulo: contacto.tipo === 'benevole' ? 'benevole' : contacto.tipo === 'donador' ? 'donador' : 'vendedor'
                                });
                                setDialogAsignarRolOpen(true);
                              }}
                              title="Créer un accès au système"
                              className="hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Shield className="w-4 h-4" style={{ color: '#9C27B0' }} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirDialogoEditar(contacto)}
                              className="hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setContactoSeleccionado(contacto);
                                setDialogEliminar(true);
                              }}
                              className="hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" style={{ color: '#c23934' }} />
                            </Button>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        </TabsContent>

        {/* Tab Calendrier */}
        <TabsContent value="calendrier" className="mt-0">
          <CalendarioContactos
            contactos={contactos}
            onVerDetalle={abrirDialogoDetalle}
            getTipoConfig={getTipoConfig}
            departamentoNombre={departamentoNombre}
            departamentoId={departamentoId}
            compactMode={isCompactContactsViewport}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog Créer/Éditer - FORMULAIRE COMPACT */}
      <FormularioContactoCompacto
        abierto={dialogAbierto}
        onCerrar={() => {
          setDialogAbierto(false);
          limpiarFormulario();
        }}
        formulario={formulario}
        setFormulario={setFormulario}
        modoEdicion={modoEdicion}
        onGuardar={handleGuardar}
        fotoPreview={fotoPreview}
        onFotoChange={handleFotoChange}
        getTipoConfig={getTipoConfig}
        updateDisponibilidad={updateDisponibilidad}
        tiposPermitidos={tiposPermitidos}
        departamentoId={departamentoId}
        departamentoNombre={departamentoNombre}
        contactoId={contactoSeleccionado?.id}
      />

      {/* Dialog Détails */}
      <Dialog open={dialogDetalle} onOpenChange={setDialogDetalle}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="contact-detail-description">
          <DialogHeader>
            <DialogTitle>Détails du contact</DialogTitle>
            <DialogDescription id="contact-detail-description">
              Informations complètes du contact sélectionné
            </DialogDescription>
          </DialogHeader>
          {contactoSeleccionado && (
            <Tabs defaultValue="information" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="information">Informations</TabsTrigger>
                <TabsTrigger value="activite">Historial de actividad</TabsTrigger>
              </TabsList>
              
              <TabsContent value="information" className="space-y-4 mt-4">
              {/* 🎨 Header del perfil con color del tipo de contacto */}
              <div className="relative rounded-2xl overflow-hidden mb-6" style={{ 
                background: `linear-gradient(135deg, ${getTipoConfig(contactoSeleccionado.tipo).color}15 0%, ${getTipoConfig(contactoSeleccionado.tipo).color}05 100%)`,
                border: `2px solid ${getTipoConfig(contactoSeleccionado.tipo).color}30`
              }}>
                <div className="p-6 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: getTipoConfig(contactoSeleccionado.tipo).color }}>
                    {contactoSeleccionado.foto ? (
                      <ImageWithFallback src={contactoSeleccionado.foto} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}20` }}>
                        <User className="w-12 h-12" style={{ color: getTipoConfig(contactoSeleccionado.tipo).color }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2" style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: getTipoConfig(contactoSeleccionado.tipo).color 
                    }}>
                      {contactoSeleccionado.nombre} {contactoSeleccionado.apellido}
                    </h3>
                    {/* 🆔 Número de archivo prominente */}
                    {contactoSeleccionado.numeroArchivo && (
                      <div className="mb-3">
                        <Badge 
                          className="text-sm font-mono font-bold shadow-md px-3 py-1.5"
                          style={{ 
                            backgroundColor: '#1a4d7a',
                            color: 'white',
                            fontFamily: 'monospace'
                          }}
                        >
                          📋 {contactoSeleccionado.numeroArchivo}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="text-sm font-medium shadow-sm"
                        style={{ 
                          backgroundColor: getTipoConfig(contactoSeleccionado.tipo).color,
                          color: 'white',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      >
                        {getTipoConfig(contactoSeleccionado.tipo).label}
                      </Badge>
                      {contactoSeleccionado.activo && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: '#10b981', color: '#10b981' }}>
                          ✓ Actif
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* 🆔 Número de archivo */}
                {contactoSeleccionado.numeroArchivo && (
                  <div className="p-3 rounded-lg border-2" style={{ 
                    borderColor: '#1a4d7a',
                    backgroundColor: '#1a4d7a10'
                  }}>
                    <span className="font-semibold flex items-center gap-2 mb-1" style={{ 
                      color: '#1a4d7a',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <FileText className="w-4 h-4" />
                      N° de Dossier:
                    </span>
                    <p className="font-mono font-bold text-base" style={{ 
                      fontFamily: 'monospace',
                      color: '#1a4d7a'
                    }}>
                      {contactoSeleccionado.numeroArchivo}
                    </p>
                  </div>
                )}
                {contactoSeleccionado.email && (
                  <div className="p-3 rounded-lg border" style={{ 
                    borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                    backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                  }}>
                    <span className="font-semibold flex items-center gap-2 mb-1" style={{ 
                      color: getTipoConfig(contactoSeleccionado.tipo).color,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <Mail className="w-4 h-4" />
                      Email:
                    </span>
                    <p style={{ fontFamily: 'Roboto, sans-serif' }}>{contactoSeleccionado.email}</p>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleEnviarEmailContacto(contactoSeleccionado)}
                      >
                        <Mail className="w-4 h-4" />
                        Envoyer un email
                      </Button>
                    </div>
                  </div>
                )}
                {contactoSeleccionado.telefono && (
                  <div className="p-3 rounded-lg border" style={{ 
                    borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                    backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                  }}>
                    <span className="font-semibold flex items-center gap-2 mb-1" style={{ 
                      color: getTipoConfig(contactoSeleccionado.tipo).color,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <Phone className="w-4 h-4" />
                      Téléphone:
                    </span>
                    <p style={{ fontFamily: 'Roboto, sans-serif' }}>{contactoSeleccionado.telefono}</p>
                  </div>
                )}
                {contactoSeleccionado.cargo && (
                  <div className="p-3 rounded-lg border" style={{ 
                    borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                    backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                  }}>
                    <span className="font-semibold flex items-center gap-2 mb-1" style={{ 
                      color: getTipoConfig(contactoSeleccionado.tipo).color,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <Briefcase className="w-4 h-4" />
                      Poste:
                    </span>
                    <p style={{ fontFamily: 'Roboto, sans-serif' }}>{contactoSeleccionado.cargo}</p>
                  </div>
                )}
                {contactoSeleccionado.fechaNacimiento && (
                  <div className="p-3 rounded-lg border" style={{ 
                    borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                    backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                  }}>
                    <span className="font-semibold flex items-center gap-2 mb-1" style={{ 
                      color: getTipoConfig(contactoSeleccionado.tipo).color,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <Calendar className="w-4 h-4" />
                      Date de Naissance:
                    </span>
                    <p style={{ fontFamily: 'Roboto, sans-serif' }}>{new Date(contactoSeleccionado.fechaNacimiento).toLocaleDateString('fr-CA')}</p>
                  </div>
                )}
                {contactoSeleccionado.genero && (
                  <div className="p-3 rounded-lg border" style={{ 
                    borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                    backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                  }}>
                    <span className="font-semibold flex items-center gap-2 mb-1" style={{ 
                      color: getTipoConfig(contactoSeleccionado.tipo).color,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <User className="w-4 h-4" />
                      Genre:
                    </span>
                    <p style={{ fontFamily: 'Roboto, sans-serif' }}>{contactoSeleccionado.genero}</p>
                  </div>
                )}
                {contactoSeleccionado.direccion && (
                  <div className="col-span-2 p-3 rounded-lg border" style={{ 
                    borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                    backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                  }}>
                    <span className="font-semibold flex items-center gap-2 mb-1" style={{ 
                      color: getTipoConfig(contactoSeleccionado.tipo).color,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <MapPin className="w-4 h-4" />
                      Adresse:
                    </span>
                    <p style={{ fontFamily: 'Roboto, sans-serif' }}>{contactoSeleccionado.direccion}</p>
                    {contactoSeleccionado.ciudad && <p style={{ fontFamily: 'Roboto, sans-serif' }}>{contactoSeleccionado.ciudad}, {contactoSeleccionado.codigoPostal}</p>}
                  </div>
                )}
              </div>

              {contactoSeleccionado.idiomas && contactoSeleccionado.idiomas.length > 0 && (
                <div className="p-4 rounded-lg border" style={{ 
                  borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                  backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                }}>
                  <span className="font-semibold text-sm flex items-center gap-2 mb-2" style={{ 
                    color: getTipoConfig(contactoSeleccionado.tipo).color,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    <Globe className="w-4 h-4" />
                    Langues:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {contactoSeleccionado.idiomas.map((idioma, idx) => (
                      <Badge 
                        key={`detalle-idioma-${idx}-${idioma}`} 
                        style={{ 
                          backgroundColor: getTipoConfig(contactoSeleccionado.tipo).color,
                          color: 'white',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      >
                        {idioma.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {contactoSeleccionado.notas && (
                <div className="p-4 rounded-lg border" style={{ 
                  borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30`,
                  backgroundColor: `${getTipoConfig(contactoSeleccionado.tipo).color}05`
                }}>
                  <span className="font-semibold text-sm flex items-center gap-2 mb-2" style={{ 
                    color: getTipoConfig(contactoSeleccionado.tipo).color,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    <FileText className="w-4 h-4" />
                    Notes:
                  </span>
                  <p className="text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>{contactoSeleccionado.notas}</p>
                </div>
              )}

              {/* Historial de modificaciones */}
              <div className="mt-6 pt-6 border-t-2" style={{ borderColor: `${getTipoConfig(contactoSeleccionado.tipo).color}30` }}>
                <h4 className="font-bold mb-4 flex items-center gap-2" style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: getTipoConfig(contactoSeleccionado.tipo).color
                }}>
                  <Clock className="w-5 h-5" />
                  Historique de modifications
                </h4>
                <HistoriqueActivite 
                  evenements={contactoSeleccionado.evenements || []}
                  isEditing={false}
                />
              </div>
              </TabsContent>

              <TabsContent value="activite" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2" style={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    color: getTipoConfig(contactoSeleccionado.tipo).color
                  }}>
                    <Briefcase className="w-5 h-5" />
                    Registres de travail
                  </h3>
                  
                  {/* Tabla de historial de actividad */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2" style={{ borderColor: getTipoConfig(contactoSeleccionado.tipo).color }}>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: getTipoConfig(contactoSeleccionado.tipo).color }}>Date</th>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: getTipoConfig(contactoSeleccionado.tipo).color }}>Heures travaillées</th>
                          <th className="text-left py-3 px-4 font-semibold" style={{ color: getTipoConfig(contactoSeleccionado.tipo).color }}>Département</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Ejemplo de datos - En el futuro esto vendrá de un array de registros */}
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              {new Date().toLocaleDateString('fr-CA')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {contactoSeleccionado.heuresSemaines || 0} heures
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}>
                              {departamentoNombre}
                            </Badge>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {contactoSeleccionado.heuresSemaines || 0} heures
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}>
                              {departamentoNombre}
                            </Badge>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              {new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {contactoSeleccionado.heuresSemaines || 0} heures
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}>
                              {departamentoNombre}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Resumen de actividad */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}20` }}>
                          <Clock className="w-6 h-6" style={{ color: branding.primaryColor }} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Heures/semaine</p>
                          <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                            {contactoSeleccionado.heuresSemaines || 0}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${branding.secondaryColor}20` }}>
                          <Calendar className="w-6 h-6" style={{ color: branding.secondaryColor }} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Jours travaillés</p>
                          <p className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>
                            {contactoSeleccionado.disponibilidades?.filter(d => d.am || d.pm).length || 0}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
                          <Building className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Départements</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {contactoSeleccionado.departamentoIds?.length || 1}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Supprimer */}
      <Dialog open={dialogEliminar} onOpenChange={setDialogEliminar}>
        <DialogContent aria-describedby="delete-confirmation-description">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription id="delete-confirmation-description">
              Cette action est irréversible. Le contact sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer ce contact ?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDialogEliminar(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleEliminar}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Assigner Bénévole Existant */}
      <Dialog open={dialogAsignarBenevole} onOpenChange={setDialogAsignarBenevole}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="assign-benevole-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Link className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Assigner un bénévole existant
            </DialogTitle>
            <DialogDescription id="assign-benevole-description">
              Sélectionnez un bénévole enregistré dans le système pour l'assigner à ce département
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                placeholder="Rechercher un bénévole par nom, prénom ou email..."
                value={busquedaBenevole}
                onChange={(e) => setBusquedaBenevole(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Liste de bénévoles */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {benevolesDisponibles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
                  <p className="text-[#666666] text-lg">Aucun bénévole trouvé</p>
                  <p className="text-[#999999] text-sm mt-2">Les bénévoles doivent être créés depuis le module de Gestion des Bénévoles</p>
                </div>
              ) : (
                benevolesDisponibles
                  .filter(b => {
                    const searchLower = busquedaBenevole.toLowerCase();
                    return (
                      busquedaBenevole === '' ||
                      (b.nom || b.nombre || '').toLowerCase().includes(searchLower) ||
                      (b.prenom || b.apellido || '').toLowerCase().includes(searchLower) ||
                      (b.email || '').toLowerCase().includes(searchLower) ||
                      (b.departement || b.departamento || '').toLowerCase().includes(searchLower)
                    );
                  })
                  .map((benevole) => {
                    const departamentosAsignados = obtenerDepartamentosAsignados(benevole.email);
                    const yaAsignadoAqui = departamentosAsignados.includes(departamentoNombre);
                    
                    return (
                    <Card 
                      key={benevole.id} 
                      className={`p-4 transition-all hover:shadow-lg cursor-pointer ${
                        yaAsignadoAqui 
                          ? 'border-2 bg-green-50/30' 
                          : 'border hover:border-gray-300'
                      }`}
                      style={yaAsignadoAqui ? { 
                        borderColor: branding.secondaryColor,
                        backgroundColor: 'rgba(45, 149, 97, 0.05)' // Verde elegante con transparencia
                      } : {}}
                      onClick={() => asignarBenevoleExistente(benevole)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: branding.primaryColor }}>
                          {(benevole.photo || benevole.foto) ? (
                            <ImageWithFallback src={benevole.photo || benevole.foto} alt={`${benevole.nom || benevole.nombre} ${benevole.prenom || benevole.apellido}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#333333]">
                              {benevole.nom || benevole.nombre} {benevole.prenom || benevole.apellido}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: benevole.statut?.toLowerCase().trim() === 'actif' ? branding.secondaryColor : '#999999',
                                color: benevole.statut?.toLowerCase().trim() === 'actif' ? branding.secondaryColor : '#999999'
                              }}
                            >
                              {benevole.statut || 'actif'}
                            </Badge>
                            {yaAsignadoAqui && (
                              <Badge 
                                className="text-xs font-semibold"
                                style={{ 
                                  backgroundColor: branding.secondaryColor,
                                  color: 'white'
                                }}
                              >
                                ✓ Déjà assigné ici
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#666666] mb-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {benevole.email}
                            </span>
                            {(benevole.telephone || benevole.telefono) && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {benevole.telephone || benevole.telefono}
                              </span>
                            )}
                            {(benevole.departement || benevole.departamento) && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {benevole.departement || benevole.departamento}
                              </span>
                            )}
                          </div>
                          {departamentosAsignados.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[#999999]">
                              <Users className="w-3 h-3" />
                              <span>Travaille aussi dans: {departamentosAsignados.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            asignarBenevoleExistente(benevole);
                          }}
                          variant={yaAsignadoAqui ? "outline" : "default"}
                          style={!yaAsignadoAqui ? { backgroundColor: branding.primaryColor } : { borderColor: branding.secondaryColor, color: branding.secondaryColor }}
                          className={yaAsignadoAqui ? "" : "text-white"}
                        >
                          {yaAsignadoAqui ? <Eye className="w-4 h-4 mr-1" /> : <Link className="w-4 h-4 mr-1" />}
                          {yaAsignadoAqui ? 'Voir détails' : 'Assigner'}
                        </Button>
                      </div>
                    </Card>
                  );
                  })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Assigner Rol à Contact */}
      {contactoParaRol && (
        <AsignarRolContacto
          open={dialogAsignarRolOpen}
          onOpenChange={setDialogAsignarRolOpen}
          contacto={contactoParaRol}
          rolesDisponibles={rolesDisponibles}
          onGuardar={(datosAcceso) => {
            console.log('✅ Accès créé pour contact:', datosAcceso);
            toast.success(`🔐 Accès au système créé pour ${contactoParaRol.nombreCompleto}!`);
            setContactoParaRol(null);
          }}
        />
      )}

      {/* Dialog: Diagnostic du Système */}
      <Dialog open={dialogDiagnostico} onOpenChange={setDialogDiagnostico}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="diagnostic-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Diagnostic du Système de Contacts
            </DialogTitle>
            <DialogDescription id="diagnostic-description">
              Analyse complète de tous les contacts dans le système
            </DialogDescription>
          </DialogHeader>

          {diagnosticoResultado && (
            <div className="space-y-6">
              {/* Résumé */}
              <Card className="p-4 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: branding.primaryColor }}>
                  📊 Résumé Général
                </h3>
                <p className="text-2xl font-bold">{diagnosticoResultado.total} contacts au total</p>
              </Card>

              {/* Contacts par département */}
              <div>
                <h3 className="font-bold text-lg mb-3">📂 Contacts par Département</h3>
                <div className="space-y-2">
                  {Object.entries(diagnosticoResultado.porDepartamento).map(([deptId, contactos]) => {
                    const nombreDept = obtenerNombreDepartamentoPorId(deptId);
                    const esEsteDept = deptId === departamentoId;
                    
                    return (
                      <Card 
                        key={deptId} 
                        className={`p-3 ${esEsteDept ? 'border-2' : ''}`}
                        style={esEsteDept ? { borderColor: branding.secondaryColor } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" style={{ color: branding.primaryColor }} />
                            <span className="font-semibold">
                              {nombreDept} {esEsteDept && <Badge className="ml-2" style={{ backgroundColor: branding.secondaryColor }}>Actuel</Badge>}
                            </span>
                          </div>
                          <Badge variant="outline">{contactos.length} contacts</Badge>
                        </div>
                        <div className="mt-2 pl-6 space-y-1">
                          {contactos.slice(0, 5).map((c: any) => (
                            <div key={c.id} className="text-sm text-[#666666] flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span>{c.nombre} {c.apellido}</span>
                              <Badge variant="outline" className="text-xs">{c.tipo}</Badge>
                              {c.activo === undefined && <Badge variant="destructive" className="text-xs">⚠️ Pas de champ activo</Badge>}
                              {c.activo === false && <Badge variant="secondary" className="text-xs">Inactif</Badge>}
                            </div>
                          ))}
                          {contactos.length > 5 && (
                            <p className="text-xs text-[#999999] pl-5">... et {contactos.length - 5} autres</p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Problèmes détectés */}
              <div>
                <h3 className="font-bold text-lg mb-3">⚠️ Problèmes Détectés</h3>
                
                {diagnosticoResultado.problemas.sinActivo.length > 0 && (
                  <Card className="p-4 mb-3 border-l-4 border-yellow-500 bg-yellow-50">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      ⚠️ {diagnosticoResultado.problemas.sinActivo.length} contacts sans champ 'activo'
                    </h4>
                    <div className="space-y-1">
                      {diagnosticoResultado.problemas.sinActivo.map((c: any) => (
                        <p key={c.id} className="text-sm text-yellow-700">
                          • {c.nombre} {c.apellido} - {c.email}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {diagnosticoResultado.problemas.inactivos.length > 0 && (
                  <Card className="p-4 mb-3 border-l-4 border-gray-500 bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      🚫 {diagnosticoResultado.problemas.inactivos.length} contacts inactifs
                    </h4>
                    <div className="space-y-1">
                      {diagnosticoResultado.problemas.inactivos.map((c: any) => (
                        <p key={c.id} className="text-sm text-gray-700">
                          • {c.nombre} {c.apellido} - {c.email}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {diagnosticoResultado.problemas.sinDepartamento.length > 0 && (
                  <Card className="p-4 mb-3 border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-semibold text-red-800 mb-2">
                      ⚠️ {diagnosticoResultado.problemas.sinDepartamento.length} contacts sans département
                    </h4>
                    <div className="space-y-1">
                      {diagnosticoResultado.problemas.sinDepartamento.map((c: any) => (
                        <p key={c.id} className="text-sm text-red-700">
                          • {c.nombre} {c.apellido} - {c.email}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}

                {diagnosticoResultado.problemas.sinActivo.length === 0 && 
                 diagnosticoResultado.problemas.inactivos.length === 0 && 
                 diagnosticoResultado.problemas.sinDepartamento.length === 0 && (
                  <Card className="p-4 border-l-4 border-green-500 bg-green-50">
                    <p className="text-green-800 font-semibold">✅ Aucun problème détecté</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Información de Almacenamiento */}
      <Dialog open={dialogAlmacenamiento} onOpenChange={setDialogAlmacenamiento}>
        <DialogContent className="max-w-2xl" aria-describedby="almacenamiento-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDrive className="w-6 h-6" style={{ color: branding.primaryColor }} />
              Information sur le Stockage
            </DialogTitle>
            <DialogDescription id="almacenamiento-description">
              Gérez l'espace de stockage utilisé par les contacts
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const info = obtenerInfoAlmacenamiento();
            const limiteEstimado = 5; // 5MB est une estimation sûre pour localStorage
            const porcentajeUsado = (info.tamañoMB / limiteEstimado) * 100;
            
            return (
              <div className="space-y-6">
                {/* Información general */}
                <Card className="p-4 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
                  <h4 className="font-semibold text-[#333333] mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Résumé du Stockage
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#666666]">Total de contacts</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.totalContactos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Espace utilisé</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.tamañoMB} MB</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Contacts avec photos</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.contactosConFotos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#666666]">Total documents</p>
                      <p className="text-2xl font-bold text-[#333333]">{info.totalDocumentos}</p>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#666666]">Utilisation estimée</span>
                      <span className="text-sm font-semibold" style={{ 
                        color: porcentajeUsado > 80 ? '#dc2626' : porcentajeUsado > 60 ? '#f59e0b' : branding.secondaryColor 
                      }}>
                        {porcentajeUsado.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(porcentajeUsado, 100)}%`,
                          backgroundColor: porcentajeUsado > 80 ? '#dc2626' : porcentajeUsado > 60 ? '#f59e0b' : branding.secondaryColor
                        }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Alertas */}
                {porcentajeUsado > 80 && (
                  <Card className="p-4 border-l-4 border-red-500 bg-red-50">
                    <p className="text-red-800 font-semibold">
                      ⚠️ Espace de stockage critique! Veuillez libérer de l'espace.
                    </p>
                  </Card>
                )}

                {porcentajeUsado > 60 && porcentajeUsado <= 80 && (
                  <Card className="p-4 border-l-4 border-orange-500 bg-orange-50">
                    <p className="text-orange-800 font-semibold">
                      ⚠️ Espace de stockage limité. Considérez libérer de l'espace.
                    </p>
                  </Card>
                )}

                {/* Acciones de limpieza */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#333333]">Actions de Nettoyage</h4>
                  
                  <Button
                    onClick={() => {
                      if (confirm('⚠️ Cela va supprimer TOUTES les photos des contacts.\n\nCette action est irréversible. Continuer?')) {
                        const fotosEliminadas = eliminarTodasLasFotos();
                        toast.success(`🗑️ ${fotosEliminadas} photo(s) supprimée(s)`);
                        setDialogAlmacenamiento(false);
                      }
                    }}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Supprimer toutes les photos ({info.contactosConFotos} contacts)
                  </Button>

                  <Button
                    onClick={() => {
                      if (confirm('⚠️ Cela va supprimer TOUS les documents des contacts.\n\nCette action est irréversible. Continuer?')) {
                        const docsEliminados = eliminarTodosLosDocumentos();
                        toast.success(`🗑️ ${docsEliminados} document(s) supprimé(s)`);
                        setDialogAlmacenamiento(false);
                      }
                    }}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ borderColor: '#dc2626', color: '#dc2626' }}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Supprimer tous les documents ({info.totalDocumentos} documents)
                  </Button>

                  <Button
                    onClick={() => {
                      optimizarTodosLosContactos();
                      toast.success('✅ Contacts optimisés avec succès');
                      setDialogAlmacenamiento(false);
                    }}
                    variant="outline"
                    className="w-full justify-start"
                    style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Optimiser tous les contacts
                  </Button>
                </div>

                {/* Información adicional */}
                <Card className="p-4 bg-blue-50 border-l-4 border-blue-500">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Conseil:</strong> Les photos et documents volumineux peuvent rapidement remplir l'espace de stockage. 
                    Limitez la taille des fichiers à moins de 200KB chacun.
                  </p>
                </Card>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}