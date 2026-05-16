// 🆕 NUEVA FUNCIONALIDAD: Botón "Nueva Entrada" para organismos PRS
// - Solo visible para organismos con participaPRS: true
// - Ubicado en el header junto a "Mes Demandes"
// - Color verde (branding.secondaryColor) para distinguirlo
// - Badge "✓ PRS" en el título del organismo cuando participa en PRS
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Phone, Mail, MapPin, Users, Calendar, Package, History, TrendingUp, Award, CheckCircle, Eye, X, Printer, Edit2, Save, Plus, Thermometer, Download, FileText, FileSpreadsheet, Tag, ShoppingCart, Clock, AlertCircle, Minus, Trash2, Star, UserPlus, MessageSquare, Languages, ChefHat, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { mockProductos } from '../../data/mockData';
import { ModeloComanda } from './ModeloComanda';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { LanguageSelector } from '../organism-portal/LanguageSelector';
import { ConfirmacionComanda } from '../organismo/ConfirmacionComanda';
import { MesDemandes } from '../organismos/MesDemandes';
import { obtenerOfertasParaOrganismo, crearSolicitudOferta, anularSolicitud, type Oferta, type SolicitudOferta, type EstadoSolicitud } from '../../utils/ofertaStorage';
import { actualizarComanda, obtenerComandasPorOrganismo } from '../../utils/comandaStorage';
import { Checkbox } from '../ui/checkbox';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { useBranding } from '../../../hooks/useBranding';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { obtenerUsuarios, type Usuario } from '../../utils/usuarios';
import { actualizarOrganismo, type Organismo } from '../../utils/organismosStorage';
import { 
  obtenerPersonasPorOrganismo, 
  guardarPersonaResponsable, 
  actualizarPersonaResponsable, 
  eliminarPersonaResponsable,
  marcarComoPrincipal,
  inicializarPersonasEjemplo,
  limpiarPersonasDuplicadas,
  type PersonaResponsable,
  type IdiomaPersona 
} from '../../utils/personasResponsablesStorage';
import { obtenerProductos, obtenerProductosActivos, type ProductoCreado } from '../../utils/productStorage';
import { guardarEntrada } from '../../utils/entradaInventarioStorage';

interface DonadorPRSAsignado {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  nombreEmpresa: string;
}

interface VistaPublicaOrganismoProps {
  organismo: Organismo & {
    participaPRS?: boolean;
  };
  onCerrarSesion: () => void;
}

type DatosEdicionOrganismo = {
  responsable: string;
  telefono: string;
  email: string;
  beneficiarios: number;
  direccion: string;
  codigoPostal: string;
  quartier: string;
};

export function VistaPublicaOrganismo({ organismo, onCerrarSesion }: VistaPublicaOrganismoProps) {
  const { t, i18n } = useTranslation();
  const branding = useBranding();
  const portalSectionCardClassName = 'overflow-hidden border border-white/78 bg-white/94 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.28)]';
  const portalSubCardClassName = 'border border-white/78 bg-white/88 shadow-[0_18px_40px_-34px_rgba(15,45,71,0.22)]';
  const portalSoftPanelClassName = 'rounded-[22px] border border-white/78 bg-slate-50/88 shadow-[0_16px_36px_-32px_rgba(15,45,71,0.18)]';

  const getPortalSectionStyle = (accentColor: string) => ({
    borderLeft: `4px solid ${accentColor}`,
  });

  const getPortalHeaderStyle = (startColor: string, endColor = startColor) => ({
    background: `linear-gradient(135deg, ${startColor}14 0%, ${endColor}08 100%)`,
  });

  const contactoGeneralAyuda = {
    nombre: branding.systemName,
    telefono: branding.phone?.trim() || '(514) 555-0100',
    email: 'info@bancoalimentos.org'
  };

  const responsableLiaison = React.useMemo(() => {
    const usuariosLiaison = obtenerUsuarios()
      .filter((usuario: Usuario) => usuario.activo !== false)
      .filter((usuario: Usuario) =>
        usuario.rol === 'liaison_organisme'
        || usuario.permisos.includes('administrador_liaison')
        || usuario.permisos.includes('comunicacion_organismos')
      )
      .sort((usuarioA: Usuario, usuarioB: Usuario) => {
        const prioridad = (usuario: Usuario) => {
          if (usuario.rol === 'liaison_organisme') return 0;
          if (usuario.permisos.includes('comunicacion_organismos')) return 1;
          if (usuario.permisos.includes('administrador_liaison')) return 2;
          return 3;
        };

        return prioridad(usuarioA) - prioridad(usuarioB);
      });

    const usuarioLiaison = usuariosLiaison[0];

    if (!usuarioLiaison) {
      return contactoGeneralAyuda;
    }

    return {
      nombre: [usuarioLiaison.nombre, usuarioLiaison.apellido].filter(Boolean).join(' ').trim() || contactoGeneralAyuda.nombre,
      telefono: usuarioLiaison.telefono?.trim() || contactoGeneralAyuda.telefono,
      email: usuarioLiaison.email?.trim() || contactoGeneralAyuda.email
    };
  }, []);

  const obtenerValorUnitario = (item: any, producto?: any) => {
    if (typeof item?.valorUnitario === 'number' && item.valorUnitario > 0) {
      return item.valorUnitario;
    }

    if (typeof producto?.valorUnitario === 'number' && producto.valorUnitario > 0) {
      return producto.valorUnitario;
    }

    return 0;
  };

  const productosCatalogo = obtenerProductos();

  const resolverProductoComanda = (item: any) =>
    productosCatalogo.find(producto => producto.id === item?.productoId)
    || mockProductos.find(producto => producto.id === item?.productoId)
    || null;

  const obtenerColorEstadoComanda = (estado?: string) => {
    switch (estado) {
      case 'confirmada':
        return '#7E57C2';
      case 'en_preparacion':
        return '#e8a419';
      case 'completada':
        return branding.primaryColor;
      case 'entregada':
        return branding.secondaryColor;
      case 'pendiente':
        return branding.primaryColor;
      default:
        return '#c23934';
    }
  };

  const obtenerEtiquetaEstadoComanda = (estado?: string) => {
    switch (estado) {
      case 'confirmada':
        return 'Acceptée';
      case 'en_preparacion':
        return t('orders.inPreparation');
      case 'completada':
        return t('orders.completed');
      case 'entregada':
        return 'Livrée';
      case 'pendiente':
        return t('orders.pending');
      default:
        return t('orders.cancelled');
    }
  };

  const formatearFechaRegistroOrganismo = () => {
    const fechaRegistro = organismo?.fechaRegistro || organismo?.fechaCreacion || organismo?.fechaModificacion;

    if (!fechaRegistro) {
      return '--';
    }

    const fecha = new Date(fechaRegistro);

    if (Number.isNaN(fecha.getTime())) {
      return '--';
    }

    return fecha.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Estado para refrescar ofertas (DEBE estar antes de useMemo)
  const [refreshOfertas, setRefreshOfertas] = useState(0);
  const [refreshComandas, setRefreshComandas] = useState(0);

  // Obtener comandas del organismo
  const comandasOrganismo = React.useMemo(
    () => obtenerComandasPorOrganismo(organismo.id),
    [organismo.id, refreshComandas]
  );

  // Obtener ofertas disponibles para el organismo (se actualiza con refreshOfertas)
  const tipoAsistenciaOrganismo = typeof organismo?.tipoAsistencia === 'string'
    ? organismo.tipoAsistencia
    : undefined;
  const ofertasDelOrganismo = React.useMemo(
    () => obtenerOfertasParaOrganismo(organismo.id, tipoAsistenciaOrganismo),
    [organismo.id, refreshOfertas, tipoAsistenciaOrganismo]
  );

  // Calcular estado de una oferta
  const calcularEstadoOferta = (oferta: Oferta): {
    estado: 'activa' | 'expirada' | 'agotada';
    label: string;
    color: string;
    diasRestantes: number;
  } => {
    const ahora = new Date();
    const fechaExpiracion = new Date(oferta.fechaExpiracion);
    const diasRestantes = Math.ceil((fechaExpiracion.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    
    // Verificar si está expirada
    if (fechaExpiracion < ahora || !oferta.activa) {
      return {
        estado: 'expirada',
        label: 'Expirada',
        color: '#c23934',
        diasRestantes: 0
      };
    }
    
    // Verificar si tiene productos disponibles
    const tieneDisponibilidad = oferta.productos.some(p => p.cantidadDisponible > 0);
    if (!tieneDisponibilidad) {
      return {
        estado: 'agotada',
        label: 'Agotada',
        color: '#6c757d',
        diasRestantes
      };
    }
    
    return {
      estado: 'activa',
      label: diasRestantes <= 3 ? `Expira en ${diasRestantes} días` : 'Activa',
      color: diasRestantes <= 3 ? '#e8a419' : '#2d9561',
      diasRestantes
    };
  };

  const esComandaHistorica = (estado?: string) => estado === 'completada' || estado === 'entregada';

  const filtrarComandasHistoricasPorFecha = () => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    return comandasOrganismo.filter(c => {
      if (!esComandaHistorica(c.estado)) return false;
      const fechaComanda = new Date(c.fecha);
      return fechaComanda >= inicio && fechaComanda <= fin;
    });
  };

  // Calcular estadísticas
  const totalComandas = comandasOrganismo.length;
  const comandasCompletadas = comandasOrganismo.filter(c => esComandaHistorica(c.estado)).length;
  const comandasEnAttenteAcceptation = comandasOrganismo.filter(c => c.estado === 'pendiente');
  const prochaineDateLimiteAcceptation = comandasEnAttenteAcceptation
    .map(comanda => comanda.fechaEntrega || comanda.fecha)
    .filter(Boolean)
    .sort()[0] || null;

  // Calcular datos para el gráfico de categorías
  const calcularDatosCategorias = () => {
    const categorias: { [key: string]: { cantidad: number, icono: string } } = {};
    
    // Procesar comandas historicas disponibles para el organismo
    comandasOrganismo
      .filter(c => esComandaHistorica(c.estado))
      .forEach(comanda => {
        comanda.items.forEach(item => {
          const producto = resolverProductoComanda(item);
          const categoria = producto?.categoria || item?.categoria || 'Autres';
          const icono = producto?.icono || item?.icono || '📦';

          if (categoria) {
            if (!categorias[categoria]) {
              categorias[producto.categoria] = { 
                cantidad: 0, 
                icono
              };
            }
            categorias[categoria].cantidad += item.cantidad;
          }
        });
      });

    // Convertir a array para el gráfico
    return Object.entries(categorias).map(([nombre, data]) => ({
      categoria: nombre,
      cantidad: Math.round(data.cantidad),
      icono: data.icono
    })).sort((a, b) => b.cantidad - a.cantidad);
  };

  const datosCategorias = calcularDatosCategorias();

  // Colores para las barras del gráfico
  const coloresGrafico = ['#1a4d7a', '#2d9561', '#e8a419', '#c23934', '#9C27B0', '#FF5722', '#00BCD4', '#795548'];

  // Estado para mostrar detalles de una comanda
  const [comandaSeleccionada, setComandaSeleccionada] = useState<any>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  
  // Estado para mostrar Mes Demandes
  const [mostrarDemandes, setMostrarDemandes] = useState(false);
  
  // Estados para edición de perfil
  const [editarPerfilOpen, setEditarPerfilOpen] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<DatosEdicionOrganismo>({
    responsable: organismo.responsable,
    telefono: organismo.telefono,
    email: organismo.email,
    beneficiarios: organismo.beneficiarios,
    direccion: organismo.direccion,
    codigoPostal: organismo.codigoPostal || '',
    quartier: organismo.quartier || ''
  });

  // Estados para Reportes
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estado para el diálogo de PRS (Registro de Servicios Prestados)
  const [prsDialogOpen, setPrsDialogOpen] = useState(false);

  // Estados para gestión de personas responsables
  const [personasResponsables, setPersonasResponsables] = useState<PersonaResponsable[]>([]);
  const [dialogPersonasOpen, setDialogPersonasOpen] = useState(false);
  const [dialogFormPersonaOpen, setDialogFormPersonaOpen] = useState(false);
  const [personaEditando, setPersonaEditando] = useState<PersonaResponsable | null>(null);
  const [formPersona, setFormPersona] = useState({
    nombreCompleto: '',
    telefono: '',
    email: '',
    cargo: '',
    notas: '',
    esPrincipal: false,
    joursDisponibles: [] as JourDisponible[],
    idiomas: [] as IdiomaPersona[]
  });

  // Estados para formulario de Nueva Entrada (PRS)
  const [dialogNuevaEntradaOpen, setDialogNuevaEntradaOpen] = useState(false);
  const [productosPRS, setProductosPRS] = useState<ProductoCreado[]>([]);
  const [donadoresPRS, setDonadoresPRS] = useState<DonadorPRSAsignado[]>([]);
  const [formEntrada, setFormEntrada] = useState({
    donadorId: '',
    productoId: '',
    cantidad: '',
    temperatura: '' as 'ambiente' | 'refrigerado' | 'congelado' | '',
    observaciones: ''
  });

  // Estados para botón de guía flotante
  const [guiaVisible, setGuiaVisible] = useState(false);
  const [guiaPosicion, setGuiaPosicion] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [arrastrando, setArrastrando] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const obtenerDonadoresPRSAsignados = React.useCallback((): DonadorPRSAsignado[] => {
    const storageRaw = localStorage.getItem('banque_alimentaire_donateurs_fournisseurs');
    const partenaires = storageRaw ? JSON.parse(storageRaw) : [];

    return partenaires
      .filter((partenaire: any) =>
        partenaire?.actif === true &&
        partenaire?.isDonateur === true &&
        partenaire?.participantPRS === true &&
        (
          partenaire?.organismeAcreditadoId === organismo.id ||
          partenaire?.organismeAcreditadoNombre === organismo.nombre
        )
      )
      .map((partenaire: any) => {
        const contactoPrincipal = Array.isArray(partenaire.personnesContact)
          ? partenaire.personnesContact.find((contacto: any) => String(contacto?.nom || '').trim().length > 0)
          : null;

        const nombreCompleto = String(contactoPrincipal?.nom || partenaire.nomEntreprise || 'Donateur PRS').trim();
        const partesNombre = nombreCompleto.split(/\s+/).filter(Boolean);
        const nombre = partesNombre[0] || nombreCompleto;
        const apellido = partesNombre.slice(1).join(' ') || partenaire.nomEntreprise || nombre;

        return {
          id: partenaire.id,
          nombre,
          apellido,
          nombreCompleto,
          nombreEmpresa: partenaire.nomEntreprise || '',
        };
      });
  }, [organismo.id, organismo.nombre]);

  // Cargar datos para el formulario de Nueva Entrada
  useEffect(() => {
    if (dialogNuevaEntradaOpen) {
      // Cargar productos PRS
      const productos = obtenerProductosActivos().filter(p => p.esPRS);
      setProductosPRS(productos);
      
      // Cargar solo donadores PRS asignados a este organismo acreditado
      const donadores = obtenerDonadoresPRSAsignados();
      setDonadoresPRS(donadores);
      
      console.log('📦 Productos PRS cargados:', productos.length);
      console.log('👥 Donadores PRS asignados cargados:', donadores.length);
    }
  }, [dialogNuevaEntradaOpen, obtenerDonadoresPRSAsignados]);

  // Cargar personas responsables
  useEffect(() => {
    // Limpiar duplicados si existen
    limpiarPersonasDuplicadas();
    
    // Solo inicializar personas de ejemplo si no hay ninguna persona para este organismo
    const personasExistentes = obtenerPersonasPorOrganismo(organismo.id);
    if (personasExistentes.length === 0) {
      inicializarPersonasEjemplo(organismo.id, organismo.nombre, organismo.responsable);
    }
    cargarPersonasResponsables();
  }, [organismo.id]);

  const cargarPersonasResponsables = () => {
    const personas = obtenerPersonasPorOrganismo(organismo.id);
    setPersonasResponsables(personas);
  };

  // Estados para edición de ofertas
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<Oferta | null>(null);
  const [editarOfertaOpen, setEditarOfertaOpen] = useState(false);
  const [fechaRecogida, setFechaRecogida] = useState('');
  const [personaRecogida, setPersonaRecogida] = useState('');
  const [telefonoRecogida, setTelefonoRecogida] = useState('');
  const [productosOferta, setProductosOferta] = useState<Array<{
    id: string;
    seleccionado: boolean;
    cantidadSolicitada: number;
    cantidadMaxima: number;
    productoNombre: string;
    icono: string;
    kilos: number;
    valorUnitario: number;
  }>>([]);

  // Abrir diálogo de edición de oferta
  const handleEditarOferta = (oferta: Oferta) => {
    setOfertaSeleccionada(oferta);
    
    // Inicializar productos con cantidades disponibles
    const productosIniciales = oferta.productos.map(p => ({
      id: p.productoId,
      seleccionado: p.cantidadDisponible > 0, // Pre-seleccionar si hay disponibilidad
      cantidadSolicitada: p.cantidadDisponible, // Por defecto, toda la cantidad disponible
      cantidadMaxima: p.cantidadDisponible,
      productoNombre: p.productoNombre || 'Producto sin nombre',
      icono: p.icono || '📦',
      kilos: p.peso || 0,
      valorUnitario: p.valorUnitario || 0
    }));
    
    setProductosOferta(productosIniciales);
    setEditarOfertaOpen(true);
  };

  // Actualizar selección de producto
  const toggleProductoSeleccionado = (productoId: string) => {
    setProductosOferta(prev => prev.map(p => 
      p.id === productoId ? { ...p, seleccionado: !p.seleccionado } : p
    ));
  };

  // Actualizar cantidad solicitada
  const actualizarCantidad = (productoId: string, cantidad: number) => {
    setProductosOferta(prev => prev.map(p => 
      p.id === productoId ? { 
        ...p, 
        cantidadSolicitada: Math.max(0, Math.min(cantidad, p.cantidadMaxima)) 
      } : p
    ));
  };

  // Calcular totales de la oferta editada
  const calcularTotalesOferta = () => {
    const productosSeleccionados = productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0);
    
    const totalProductos = productosSeleccionados.length;
    const totalKilos = productosSeleccionados.reduce((sum, p) => sum + ((p.kilos || 0) * p.cantidadSolicitada), 0);
    const totalValor = productosSeleccionados.reduce((sum, p) => sum + ((p.valorUnitario || 0) * (p.kilos || 0) * p.cantidadSolicitada), 0);
    
    return { totalProductos, totalKilos, totalValor };
  };

  // Confirmar solicitud de oferta
  const handleConfirmarSolicitudOferta = () => {
    const productosSeleccionados = productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0);
    
    if (productosSeleccionados.length === 0) {
      toast.error('Vous devez selectionner au moins un produit', {
        description: 'Selectionnez les produits que vous souhaitez demander dans cette offre.',
        duration: 4000
      });
      return;
    }
    
    if (!fechaRecogida) {
      toast.error('Date de collecte obligatoire', {
        description: 'Veuillez indiquer la date a laquelle vous prevoyez recuperer les produits.',
        duration: 4000
      });
      return;
    }
    
    if (!personaRecogida.trim()) {
      toast.error('Personne responsable de la collecte obligatoire', {
        description: 'Veuillez indiquer qui recuperera les produits.',
        duration: 4000
      });
      return;
    }
    
    // Validar que la fecha no sea en el pasado
    const fechaSeleccionada = new Date(fechaRecogida);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      toast.error('Date invalide', {
        description: 'La date de collecte ne peut pas etre anterieure a aujourd\'hui.',
        duration: 4000
      });
      return;
    }
    
    if (!ofertaSeleccionada) return;
    
    const totales = calcularTotalesOferta();
    
    // Preparar productos aceptados para el sistema de ofertas
    const productosAceptados = productosSeleccionados.map(p => ({
      productoId: p.id,
      cantidadAceptada: p.cantidadSolicitada
    }));
    
    // Crear solicitud para revisión administrativa sin reservar stock todavía
    const observacionesCompletas = `Solicitud desde el portal del organismo. Total: ${totales.totalProductos} productos, ${formatQuantity(totales.totalKilos)} kg. Fecha de recogida: ${new Date(fechaRecogida).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Persona que recogerá: ${personaRecogida}${telefonoRecogida ? ` (Tel: ${telefonoRecogida})` : ''}`;
    
    const exito = crearSolicitudOferta(
      ofertaSeleccionada.id,
      organismo.id,
      organismo.nombre,
      productosAceptados,
      observacionesCompletas
    );
    
    if (exito) {
      toast.success('Solicitud de oferta confirmada', {
        description: `${totales.totalProductos} productos • ${formatQuantity(totales.totalKilos)} kg • Valor: CAD$ ${formatMoney(totales.totalValor)} • Fecha de recogida: ${new Date(fechaRecogida).toLocaleDateString(i18n.language)} • Recogerá: ${personaRecogida}. La solicitud fue enviada a ${branding.systemName} para validación.`,
        duration: 6000
      });
      
      setEditarOfertaOpen(false);
      setOfertaSeleccionada(null);
      setFechaRecogida('');
      setPersonaRecogida('');
      setTelefonoRecogida('');
      
      // Actualizar la vista de ofertas sin recargar la página
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error('Erreur lors du traitement de la demande', {
        description: 'La demande n’a pas pu être enregistrée. Vérifiez s’il existe déjà une demande active pour cette offre ou si les quantités sont encore disponibles.',
        duration: 4000
      });
    }
  };

  const handleGuardarCambios = () => {
    const organismoActualizado = actualizarOrganismo(organismo.id, {
      responsable: datosEdicion.responsable.trim(),
      telefono: datosEdicion.telefono.trim(),
      email: datosEdicion.email.trim(),
      beneficiarios: Math.max(0, Number(datosEdicion.beneficiarios) || 0),
      direccion: datosEdicion.direccion.trim(),
      codigoPostal: datosEdicion.codigoPostal.trim() || undefined,
      quartier: datosEdicion.quartier.trim() || undefined,
    });

    if (!organismoActualizado) {
      toast.error('Impossible de mettre a jour le profil de l\'organisme.', {
        description: 'Veuillez reessayer ou contacter l\'administrateur si le probleme persiste.',
        duration: 5000
      });
      return;
    }

    toast.success(t('organismPortal.profileUpdated'), {
      description: t('organismPortal.profileUpdatedDescription'),
      duration: 5000
    });
    setEditarPerfilOpen(false);
  };

  const reconstruirItemsAceptados = (itemsOriginales: any[], itemsAceptados: any[]) => {
    const aceptadosPorProducto = new Map<string, any[]>();

    itemsAceptados.forEach((itemAceptado) => {
      const productoId = itemAceptado?.productoId;
      if (!productoId) {
        return;
      }

      const aceptadosActuales = aceptadosPorProducto.get(productoId) || [];
      aceptadosActuales.push(itemAceptado);
      aceptadosPorProducto.set(productoId, aceptadosActuales);
    });

    return itemsOriginales.map((item) => {
      const aceptadosDelProducto = aceptadosPorProducto.get(item.productoId) || [];
      const itemAceptado = aceptadosDelProducto.shift();

      if (!itemAceptado) {
        return item;
      }

      const cantidadAceptada = Number(itemAceptado.cantidadAceptada ?? itemAceptado.cantidad ?? item.cantidad);

      return {
        ...item,
        cantidad: cantidadAceptada,
        cantidadAceptada
      };
    });
  };

  // Funciones para gestión de comandas
  const handleAceptarComanda = (itemsAceptados: any[], comandaOrigen?: any) => {
    const comandaObjetivo = comandaOrigen || comandaSeleccionada;

    if (!comandaObjetivo) {
      return;
    }

    try {
      const itemsReconstruidos = reconstruirItemsAceptados(comandaObjetivo.items || [], itemsAceptados);
      const totalAceptado = itemsReconstruidos.reduce(
        (total, item) => total + Number(item.cantidadAceptada ?? item.cantidad ?? 0),
        0,
      );
      const comandaActualizada = {
        ...comandaObjetivo,
        estado: totalAceptado > 0 ? 'confirmada' : 'anulada',
        items: itemsReconstruidos,
        confirmadaPorOrganismo: totalAceptado > 0,
        fechaConfirmacion: totalAceptado > 0 ? new Date().toISOString() : undefined,
        fechaModificacion: new Date().toISOString()
      };

      actualizarComanda(comandaActualizada);
      setRefreshComandas((valorActual) => valorActual + 1);
    } catch (error) {
      console.error('Error al aceptar la comanda desde el portal del organismo:', error);
      toast.error('La commande n’a pas pu être mise à jour');
      return;
    }

    toast.success(totalAceptado > 0 ? t('organismPortal.orderAccepted') : t('organismPortal.orderCancelled'), {
      description: totalAceptado > 0
        ? t('organismPortal.orderAcceptedDescription')
        : 'Aucune quantité acceptée, la commande a été annulée automatiquement.',
      duration: 5000
    });
    setMostrarDetalles(false);
    setComandaSeleccionada(null);
  };

  const handleAnularComanda = (comandaOrigen?: any) => {
    const comandaObjetivo = comandaOrigen || comandaSeleccionada;

    if (!comandaObjetivo) {
      return;
    }

    try {
      const comandaActualizada = {
        ...comandaObjetivo,
        estado: 'anulada',
        confirmadaPorOrganismo: false,
        fechaModificacion: new Date().toISOString()
      };

      actualizarComanda(comandaActualizada);
      setRefreshComandas((valorActual) => valorActual + 1);
    } catch (error) {
      console.error('Error al anular la comanda desde el portal del organismo:', error);
      toast.error('La commande n’a pas pu être annulée');
      return;
    }

    toast.success(t('organismPortal.orderCancelled'), {
      description: t('organismPortal.orderCancelledDescription'),
      duration: 4000
    });
    setMostrarDetalles(false);
    setComandaSeleccionada(null);
  };

  // Funciones para gestión de personas responsables
  const handleAbrirFormPersona = (persona?: PersonaResponsable) => {
    if (persona) {
      setPersonaEditando(persona);
      setFormPersona({
        nombreCompleto: persona.nombreCompleto,
        telefono: persona.telefono,
        email: persona.email,
        cargo: persona.cargo || '',
        notas: persona.notas || '',
        esPrincipal: persona.esPrincipal,
        joursDisponibles: persona.joursDisponibles || [],
        idiomas: persona.idiomas || []
      });
    } else {
      setPersonaEditando(null);
      setFormPersona({
        nombreCompleto: '',
        telefono: '',
        email: '',
        cargo: '',
        notas: '',
        esPrincipal: false,
        joursDisponibles: [],
        idiomas: []
      });
    }
    setDialogFormPersonaOpen(true);
  };

  const handleGuardarPersona = () => {
    // Validaciones
    if (!formPersona.nombreCompleto.trim()) {
      toast.error('Nom obligatoire', { description: 'Veuillez saisir le nom complet.' });
      return;
    }
    if (!formPersona.telefono.trim()) {
      toast.error('Telephone obligatoire', { description: 'Veuillez saisir un numero de telephone.' });
      return;
    }
    if (!formPersona.email.trim()) {
      toast.error('Courriel obligatoire', { description: 'Veuillez saisir une adresse courriel.' });
      return;
    }

    if (personaEditando) {
      // Actualizar persona existente
      actualizarPersonaResponsable(personaEditando.id, formPersona);
      toast.success('Personne mise a jour', {
        description: `${formPersona.nombreCompleto} a ete mis a jour correctement.`
      });
    } else {
      // Crear nueva persona
      guardarPersonaResponsable({
        organismoId: organismo.id,
        ...formPersona,
        activo: true
      });
      toast.success('Personne ajoutee', {
        description: `${formPersona.nombreCompleto} a ete ajoute a votre liste de contacts.`
      });
    }

    setDialogFormPersonaOpen(false);
    cargarPersonasResponsables();
  };

  const handleEliminarPersona = (persona: PersonaResponsable) => {
    if (window.confirm(`Supprimer ${persona.nombreCompleto} ?`)) {
      eliminarPersonaResponsable(persona.id);
      toast.success('Personne supprimee', {
        description: `${persona.nombreCompleto} a ete retire de votre liste.`
      });
      cargarPersonasResponsables();
    }
  };

  const handleMarcarPrincipal = (persona: PersonaResponsable) => {
    marcarComoPrincipal(persona.id);
    toast.success('Contact principal mis a jour', {
      description: `${persona.nombreCompleto} est maintenant votre contact principal.`
    });
    cargarPersonasResponsables();
  };

  // Funciones para reportes
  // Función para manejar el guardado de nueva entrada PRS
  const handleGuardarEntrada = () => {
    // Validaciones
    if (!formEntrada.donadorId) {
      toast.error('Donateur obligatoire', { description: 'Veuillez selectionner un donateur.' });
      return;
    }
    if (!formEntrada.productoId) {
      toast.error('Produit obligatoire', { description: 'Veuillez selectionner un produit.' });
      return;
    }
    if (!formEntrada.cantidad || parseFloat(formEntrada.cantidad) <= 0) {
      toast.error('Quantite invalide', { description: 'Veuillez saisir une quantite valide.' });
      return;
    }
    if (!formEntrada.temperatura) {
      toast.error('Temperature requise', { description: 'Veuillez selectionner la temperature d\'entreposage.' });
      return;
    }

    // Obtener producto y donador seleccionados
    const producto = productosPRS.find(p => p.id === formEntrada.productoId);
    const donador = donadoresPRS.find(d => d.id === formEntrada.donadorId);

    if (!producto || !donador) {
      toast.error('Error', { description: 'Producto o donador no encontrado.' });
      return;
    }

    const cantidad = parseFloat(formEntrada.cantidad);
    const pesoTotal = cantidad * (producto.pesoUnitario || producto.peso || 0);

    // Crear entrada
    const entrada = {
      fecha: new Date().toISOString(),
      tipoEntrada: 'prs',
      programaNombre: 'Programme de Ramassage de Surplus',
      programaCodigo: 'prs',
      programaColor: branding.secondaryColor,
      programaIcono: '🚚',
      donadorId: formEntrada.donadorId,
      donadorNombre: donador.nombreCompleto,
      donadorEsCustom: false,
      participantePRSId: formEntrada.donadorId,
      participantePRSNombre: donador.nombreCompleto,
      productoId: producto.id,
      nombreProducto: producto.nombre,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      productoCategoria: producto.categoria,
      productoSubcategoria: producto.subcategoria,
      productoIcono: producto.icono,
      productoCodigo: producto.codigo,
      cantidad: cantidad,
      unidad: producto.unidad,
      pesoUnidad: producto.pesoUnitario || producto.peso || 0,
      pesoTotal: pesoTotal,
      temperatura: formEntrada.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
      observaciones: `Entrada registrada por organismo ${organismo.nombre}. ${formEntrada.observaciones || ''}`.trim(),
      creadoPor: organismo.nombre,
      registradoPor: organismo.nombre,
      organismoId: organismo.id
    };

    try {
      const exito = guardarEntrada(entrada as any);
      
      if (exito) {
        toast.success('✅ Entrada registrada correctamente', {
          description: `${formatQuantity(cantidad)} ${producto.unidad} de ${producto.nombre} - ${formatQuantity(pesoTotal)} kg`,
          duration: 5000
        });
        
        // Limpiar formulario
        setFormEntrada({
          donadorId: '',
          productoId: '',
          cantidad: '',
          temperatura: '',
          observaciones: ''
        });
        
        setDialogNuevaEntradaOpen(false);
      } else {
        toast.error('Erreur lors de l’enregistrement de l’entrée');
      }
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de l’entrée :', error);
      toast.error('Erreur lors de l’enregistrement de l’entrée');
    }
  };

  const handleGenerarPDF = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error(t('organismPortal.selectBothDates'), {
        description: t('organismPortal.selectBothDatesDescription'),
        duration: 4000
      });
      return;
    }

    // Filtrar comandas historicas en el rango de fechas
    const comandasFiltradas = filtrarComandasHistoricasPorFecha();

    if (comandasFiltradas.length === 0) {
      toast.warning(t('organismPortal.noDataForReport'), {
        description: t('organismPortal.noDataForReportDescription'),
        duration: 4000
      });
      return;
    }

    toast.success(t('organismPortal.pdfReportGenerated'), {
      description: t('organismPortal.donationsFound', { count: comandasFiltradas.length }),
      duration: 4000
    });
  };

  const handleGenerarExcel = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error(t('organismPortal.selectBothDates'), {
        description: t('organismPortal.selectBothDatesDescription'),
        duration: 4000
      });
      return;
    }

    // Filtrar comandas historicas en el rango de fechas
    const comandasFiltradas = filtrarComandasHistoricasPorFecha();

    if (comandasFiltradas.length === 0) {
      toast.warning(t('organismPortal.noDataForReport'), {
        description: t('organismPortal.noDataForReportDescription'),
        duration: 4000
      });
      return;
    }

    toast.success(t('organismPortal.excelReportGenerated'), {
      description: t('organismPortal.donationsFound', { count: comandasFiltradas.length }),
      duration: 4000
    });
  };

  // Funciones para manejar el arrastre del botón de guía
  const handleMouseDownGuia = (e: React.MouseEvent) => {
    setArrastrando(true);
    setOffset({
      x: e.clientX - guiaPosicion.x,
      y: e.clientY - guiaPosicion.y
    });
  };

  const handleMouseMoveGuia = (e: MouseEvent) => {
    if (arrastrando) {
      const nuevaX = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - offset.x));
      const nuevaY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - offset.y));
      setGuiaPosicion({ x: nuevaX, y: nuevaY });
    }
  };

  const handleMouseUpGuia = () => {
    setArrastrando(false);
  };

  // Efecto para manejar eventos de arrastre
  useEffect(() => {
    if (arrastrando) {
      window.addEventListener('mousemove', handleMouseMoveGuia);
      window.addEventListener('mouseup', handleMouseUpGuia);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGuia);
      window.removeEventListener('mouseup', handleMouseUpGuia);
    };
  }, [arrastrando, offset]);

  return (
    <>
      {mostrarDemandes ? (
        <MesDemandes
          organismeId={organismo.id}
          organismeNom={organismo.nombre}
          onRetour={() => setMostrarDemandes(false)}
        />
      ) : (
        <div 
          className="app-main-stage relative min-h-screen overflow-hidden"
          style={{ 
            fontFamily: 'Roboto, sans-serif',
            background: 'linear-gradient(135deg, #1a4d7a08 0%, #2d956108 100%)',
          }}
        >
          {/* Formas decorativas de fondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
              style={{ backgroundColor: branding.primaryColor }}
            />
            <div 
              className="absolute bottom-0 -left-24 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
              style={{ backgroundColor: branding.secondaryColor }}
            />
          </div>
      {/* Header du portail */}
      <header className="relative overflow-hidden rounded-[32px] border border-white/78 bg-white/74 shadow-[0_32px_78px_-48px_rgba(15,45,71,0.34)] ring-1 ring-slate-900/5 backdrop-blur-xl">
        <div className="pointer-events-none absolute -left-12 top-[-4rem] h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: `${branding.primaryColor}18` }} />
        <div className="pointer-events-none absolute bottom-[-5rem] right-[-2rem] h-44 w-44 rounded-full blur-3xl" style={{ backgroundColor: `${branding.secondaryColor}18` }} />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
            <div className="rounded-[30px] border border-white/82 bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(247,250,252,0.92)_100%)] p-4 shadow-[0_28px_60px_-40px_rgba(15,45,71,0.34)] sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/80 bg-white text-2xl shadow-[0_16px_34px_-28px_rgba(15,45,71,0.4)] sm:h-14 sm:w-14 sm:text-3xl">
                  {organismo.tipo === 'Comedor' ? '🍽️' :
                   organismo.tipo === 'Fundación' ? '🏛️' :
                   organismo.tipo === 'Hogar' ? '🏠' : '🏘️'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
                      {t('organismPortal.privatePortal')}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/64 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <Sparkles className="h-3.5 w-3.5" style={{ color: branding.primaryColor }} />
                      {t('experience.executiveCadence')}
                    </div>
                    {organismo.participaPRS && (
                      <Badge className="border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        ✓ PRS
                      </Badge>
                    )}
                  </div>
                  <h1 className="mt-2 break-words text-[1.45rem] font-bold leading-tight text-slate-900 sm:text-[1.8rem]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {organismo.nombre}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 sm:text-[0.98rem]">
                    {organismo.tipo} • {t('organismPortal.registeredSince')} {formatearFechaRegistroOrganismo()}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 shadow-sm">
                    <ShieldCheck className="h-4 w-4" style={{ color: branding.primaryColor }} />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{t('organismPortal.prioritySignal')}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    {organismo.direccion && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" style={{ color: branding.primaryColor }} />
                        <span>{organismo.direccion}</span>
                      </span>
                    )}
                    {organismo.telefono && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4" style={{ color: branding.primaryColor }} />
                        <span>{organismo.telefono}</span>
                      </span>
                    )}
                    {organismo.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-4 w-4" style={{ color: branding.primaryColor }} />
                        <span>{organismo.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/82 bg-white/94 p-4 shadow-[0_28px_60px_-40px_rgba(15,45,71,0.3)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-slate-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <Star className="h-3.5 w-3.5" style={{ color: branding.primaryColor }} />
                    {t('organismPortal.quickActionsLabel')}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{t('organismPortal.quickActionsDescription')}</p>
                </div>
                <LanguageSelector />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {organismo.participaPRS && (
                  <Button
                    onClick={() => setDialogNuevaEntradaOpen(true)}
                    className="h-11 justify-start rounded-2xl px-4 text-white shadow-[0_20px_36px_-24px_rgba(26,77,122,0.45)]"
                    style={{
                      background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('organismPortal.newPRSEntry')}
                  </Button>
                )}
                <Button
                  onClick={() => setMostrarDemandes(true)}
                  variant="outline"
                  className="h-11 justify-start rounded-2xl border-slate-200 bg-slate-50/92 px-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.26)] hover:bg-slate-100"
                  style={{
                    color: branding.primaryColor,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  <Package className="mr-2 h-4 w-4" />
                  {t('organismPortal.myRequests')}
                </Button>
                <Button
                  onClick={onCerrarSesion}
                  variant="outline"
                  className="h-11 justify-start rounded-2xl border-slate-200 bg-slate-50/92 px-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.26)] hover:bg-slate-100"
                  style={{
                    color: branding.primaryColor,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('organismPortal.logout')}
                </Button>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/82 px-4 py-2 shadow-sm">
                <ShieldCheck className="h-4 w-4" style={{ color: branding.secondaryColor }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{t('organismPortal.immediateAccess')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="app-shell-content relative z-10 max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-8" data-app-shell>
        {/* Comandas Pendientes de Confirmación */}
        <ConfirmacionComanda organismoId={organismo.id} organismo={organismo} />

        {/* Estado del Organismo */}
        {!organismo.activo && (
          <div 
            className="mb-6 p-4 rounded-lg border-l-4 backdrop-blur-sm"
            style={{
              backgroundColor: '#c2393410',
              borderColor: '#c23934',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#c23934' }}
              >
                <span className="text-white text-xl">⚠️</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: '#c23934' }}>{t('organisms.profileDialog.inactiveAlert.message')}</p>
                <p className="text-sm text-[#666666]">
                  {organismo.fechaInicioInactividad && `${t('organisms.profileDialog.inactiveAlert.from')}: ${new Date(organismo.fechaInicioInactividad).toLocaleDateString(i18n.language)}`}
                  {organismo.fechaFinInactividad && ` • ${t('organisms.profileDialog.inactiveAlert.until')}: ${new Date(organismo.fechaFinInactividad).toLocaleDateString(i18n.language)}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Indicateurs principaux */}
        <section className="mb-6 rounded-[28px] border border-white/80 bg-white/92 p-4 shadow-[0_24px_54px_-40px_rgba(15,45,71,0.28)] sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Vue synthèse</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Tableau de bord organisme
              </h2>
            </div>
            <p className="text-sm text-slate-500">Aperçu rapide de votre activité et de vos demandes.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fbfd_100%)] p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{t('organismPortal.beneficiaries')}</p>
                  <p className="mt-1 text-[1.75rem] font-bold" style={{ color: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}>
                    {organismo.beneficiarios}
                  </p>
                </div>
                <div className="rounded-2xl p-3" style={{ backgroundColor: `${branding.primaryColor}12` }}>
                  <Users className="h-5 w-5" style={{ color: branding.primaryColor }} />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f7fbf8_100%)] p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{t('organismPortal.orders')}</p>
                  <p className="mt-1 text-[1.75rem] font-bold" style={{ color: branding.secondaryColor, fontFamily: 'Montserrat, sans-serif' }}>
                    {totalComandas}
                  </p>
                </div>
                <div className="rounded-2xl p-3" style={{ backgroundColor: `${branding.secondaryColor}12` }}>
                  <Package className="h-5 w-5" style={{ color: branding.secondaryColor }} />
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#fffaf1_100%)] p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{t('organismPortal.completed')}</p>
                  <p className="mt-1 text-[1.75rem] font-bold text-[#e8a419]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {comandasCompletadas}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#e8a41914] p-3">
                  <CheckCircle className="h-5 w-5 text-[#e8a419]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Personas Responsables */}
        <Card 
          className={`mb-6 ${portalSectionCardClassName}`}
          style={getPortalSectionStyle(branding.secondaryColor)}
        >
          <CardHeader 
            className="rounded-t-[inherit] border-b border-white/75"
            style={getPortalHeaderStyle(branding.secondaryColor)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <UserPlus 
                    className="w-6 h-6" 
                    style={{ color: branding.secondaryColor }}
                  />
                  {t('organisms.profileDialog.authorizedPersons.listTitle')}
                </CardTitle>
                <p className="text-sm text-[#666666] mt-2">
                  {t('organisms.profileDialog.authorizedPersons.listDescription')}
                </p>
              </div>
              <Button 
                onClick={() => handleAbrirFormPersona()}
                className="text-white shadow-sm hover:shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 500 
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('organisms.profileDialog.authorizedPersons.addPersonShort')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {personasResponsables.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personasResponsables.map(persona => (
                  <Card 
                    key={persona.id} 
                    className={`${portalSubCardClassName} transition-colors ${persona.esPrincipal ? 'bg-green-50/60' : 'bg-white/90'}`}
                    style={{ 
                      borderColor: persona.esPrincipal ? branding.secondaryColor : '#e0e0e0' 
                    }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {persona.nombreCompleto}
                            </h4>
                            {persona.esPrincipal && (
                              <Badge 
                                className="text-white flex items-center gap-1"
                                style={{ backgroundColor: branding.secondaryColor }}
                              >
                                <Star className="w-3 h-3 fill-white" />
                                {t('organisms.profileDialog.authorizedPersons.principal')}
                              </Badge>
                            )}
                          </div>
                          {persona.cargo && (
                            <p className="text-sm text-[#666666] mb-2">{persona.cargo}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone 
                            className="w-4 h-4" 
                            style={{ color: branding.primaryColor }}
                          />
                          <span className="text-[#333333]">{persona.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail 
                            className="w-4 h-4" 
                            style={{ color: branding.primaryColor }}
                          />
                          <span className="text-[#333333]">{persona.email}</span>
                        </div>
                        {persona.notas && (
                          <div className="mt-2 rounded-xl border border-white/70 bg-slate-50/90 p-3 text-xs text-[#666666]">
                            {persona.notas}
                          </div>
                        )}
                        {persona.idiomas && persona.idiomas.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Languages className="w-3 h-3 text-[#666666]" />
                              <span className="text-xs text-[#666666]">Langues:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {persona.idiomas.map((code) => {
                                const idiomaInfo = [
                                  { code: 'fr', label: '🇫🇷 FR', color: '#1a4d7a' },
                                  { code: 'en', label: '🇬🇧 EN', color: '#2d9561' },
                                  { code: 'es', label: '🇪🇸 ES', color: '#8B5CF6' },
                                  { code: 'ar', label: '🇸🇦 AR', color: '#F59E0B' }
                                ].find(i => i.code === code);
                                return idiomaInfo ? (
                                  <Badge
                                    key={code}
                                    className="text-white text-xs"
                                    style={{ backgroundColor: idiomaInfo.color }}
                                  >
                                    {idiomaInfo.label}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        {!persona.esPrincipal && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarPrincipal(persona)}
                            className="flex-1"
                            style={{ 
                              color: branding.secondaryColor,
                              borderColor: `${branding.secondaryColor}40`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${branding.secondaryColor}10`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {t('organisms.profileDialog.authorizedPersons.markAsPrincipalShort')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAbrirFormPersona(persona)}
                          className="flex-1"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          {t('organisms.profileDialog.authorizedPersons.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEliminarPersona(persona)}
                          className=""
                          style={{ 
                            color: '#c23934',
                            borderColor: '#c2393440'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#c2393410';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${portalSoftPanelClassName}`}>
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-[#666666] mb-4">{t('organisms.profileDialog.authorizedPersons.noPersonsRegistered')}</p>
                <Button 
                  onClick={() => handleAbrirFormPersona()}
                  className="text-white shadow-sm hover:shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('organisms.profileDialog.authorizedPersons.addFirstPerson')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de Reportes de Donaciones */}
        <Card 
          className={`mb-6 ${portalSectionCardClassName}`}
          style={getPortalSectionStyle('#e8a419')}
        >
          <CardHeader 
            className="rounded-t-[inherit] border-b border-white/75"
            style={getPortalHeaderStyle('#e8a419')}
          >
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <FileText className="w-6 h-6 text-[#e8a419]" />
              {t('organismPortal.donationReports')}
            </CardTitle>
            <p className="text-sm text-[#666666] mt-2">
              {t('organismPortal.donationReportsDescription')}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar 
                    className="w-4 h-4" 
                    style={{ color: branding.primaryColor }}
                  />
                  {t('organismPortal.startDate')} *
                </Label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar 
                    className="w-4 h-4" 
                    style={{ color: branding.primaryColor }}
                  />
                  {t('organismPortal.endDate')} *
                </Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-transparent select-none">Formato</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerarPDF}
                    className="flex-1 text-white shadow-sm hover:shadow-md"
                    style={{ 
                      background: '#c23934',
                      opacity: (!fechaInicio || !fechaFin) ? 0.5 : 1
                    }}
                    disabled={!fechaInicio || !fechaFin}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={handleGenerarExcel}
                    className="flex-1 text-white shadow-sm hover:shadow-md"
                    style={{ 
                      background: branding.secondaryColor,
                      opacity: (!fechaInicio || !fechaFin) ? 0.5 : 1
                    }}
                    disabled={!fechaInicio || !fechaFin}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </div>

            <div 
              className="rounded-[22px] p-4 border border-white/75 shadow-[0_16px_36px_-32px_rgba(15,45,71,0.18)]"
              style={{
                backgroundColor: `${branding.primaryColor}08`,
                borderColor: `${branding.primaryColor}30`
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[#333333] mb-1">{t('organismPortal.reportInfo')}</p>
                  <p className="text-sm text-[#666666]">
                    {t('organismPortal.reportDescription')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Organismo */}
          <Card className={portalSectionCardClassName}>
            <CardHeader className="flex flex-row items-center justify-between rounded-t-[inherit] border-b border-white/75" style={getPortalHeaderStyle(branding.primaryColor, branding.secondaryColor)}>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('organismPortal.organisInfo')}
              </CardTitle>
              <Button
                onClick={() => {
                  setDatosEdicion({
                    responsable: organismo.responsable,
                    telefono: organismo.telefono,
                    email: organismo.email,
                    beneficiarios: organismo.beneficiarios,
                    direccion: organismo.direccion,
                    codigoPostal: organismo.codigoPostal || '',
                    quartier: organismo.quartier || ''
                  });
                  setEditarPerfilOpen(true);
                }}
                className="text-white shadow-sm hover:shadow-md"
                style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
                size="sm"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t('organismPortal.editProfile')}
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.address')}</p>
                  <p className="font-medium text-[#333333]">{organismo.direccion}</p>
                  {organismo.codigoPostal && (
                    <p className="text-sm text-[#666666]">{t('organismPortal.postalCode')}: {organismo.codigoPostal}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.responsible')}</p>
                  <p className="font-medium text-[#333333]">{organismo.responsable}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.phone')}</p>
                  <p className="font-medium text-[#333333]">{organismo.telefono}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.email')}</p>
                  <p className="font-medium text-[#333333]">{organismo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar 
                  className="w-5 h-5 mt-1" 
                  style={{ color: branding.primaryColor }}
                />
                <div>
                  <p className="text-sm text-[#666666]">{t('organismPortal.registrationDate')}</p>
                  <p className="font-medium text-[#333333]">
                    {formatearFechaRegistroOrganismo()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Badge 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '0.5rem 1rem',
                    backgroundColor: organismo.activo ? branding.secondaryColor : '#c23934'
                  }}
                >
                  {organismo.activo ? t('organismPortal.activeOrganism') : t('organismPortal.inactiveOrganism')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Comandas */}
          <Card className={portalSectionCardClassName}>
            <CardHeader className="rounded-t-[inherit] border-b border-white/75" style={getPortalHeaderStyle(branding.primaryColor, branding.secondaryColor)}>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <History className="w-5 h-5" />
                {t('organismPortal.ordersHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4 rounded-xl border border-[#F6C26B] bg-[#FFF8E8] p-4 text-sm text-[#7A4B00]">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-[#8A5A00]">Rappel important concernant l’acceptation des commandes</p>
                    <p>
                      Si une commande n’est pas acceptée avant la date prévue, elle sera annulée automatiquement.
                    </p>
                    {comandasEnAttenteAcceptation.length > 0 && (
                      <p className="text-xs text-[#946200]">
                        {comandasEnAttenteAcceptation.length} commande(s) en attente d’acceptation
                        {prochaineDateLimiteAcceptation
                          ? ` • Prochaine échéance: ${new Date(prochaineDateLimiteAcceptation).toLocaleDateString(i18n.language)}`
                          : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {comandasOrganismo.length > 0 ? (
                <div className="space-y-3">
                  {comandasOrganismo.map(comanda => {
                    // Calcular totales de la comanda
                    const pesoTotal = comanda.items.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0);
                    const valorTotal = comanda.valorTotal || comanda.totalValorMonetario || comanda.items.reduce((sum: number, item: any) => {
                      const producto = resolverProductoComanda(item);
                      return sum + ((item.cantidad || 0) * obtenerValorUnitario(item, producto));
                    }, 0);
                    
                    return (
                    <div key={comanda.id} className="rounded-[22px] border border-white/75 bg-slate-50/88 p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.16)] hover:shadow-[0_20px_40px_-30px_rgba(15,45,71,0.22)] transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-[#333333]">{comanda.numero}</p>
                        <Badge 
                          style={{ backgroundColor: obtenerColorEstadoComanda(comanda.estado) }}
                        >
                          {obtenerEtiquetaEstadoComanda(comanda.estado)}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#666666] space-y-1">
                        <p>{t('organismPortal.date')}: {new Date(comanda.fecha).toLocaleDateString(i18n.language)}</p>
                        <p>{t('organismPortal.products')}: {comanda.items.length}</p>
                        <div className="flex items-center gap-3 pt-1">
                          <p 
                            className="font-semibold"
                            style={{ color: branding.primaryColor }}
                          >
                            📦 {formatQuantity(pesoTotal)} kg
                          </p>
                          <p 
                            className="font-semibold"
                            style={{ color: branding.secondaryColor }}
                          >
                            💰 CAD$ {formatMoney(valorTotal)}
                          </p>
                        </div>
                        {comanda.fechaEntrega && (
                          <p>{t('organismPortal.delivery')}: {new Date(comanda.fechaEntrega).toLocaleDateString(i18n.language)}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          setComandaSeleccionada(comanda);
                          setMostrarDetalles(true);
                        }}
                        variant="outline"
                        className="mt-2 w-full hover:shadow-md transition-all duration-200"
                        style={{ 
                          color: branding.primaryColor,
                          borderColor: `${branding.primaryColor}40`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${branding.primaryColor}10`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('organismPortal.viewDetails')}
                      </Button>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[#666666]">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>{t('organismPortal.noOrders')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nueva Sección: Ofertas Disponibles */}
        {ofertasDelOrganismo.length > 0 && (
          <Card className={`mt-6 ${portalSectionCardClassName}`} style={getPortalSectionStyle(branding.secondaryColor)}>
            <CardHeader 
              className="rounded-t-[inherit] border-b border-white/75"
              style={getPortalHeaderStyle(branding.secondaryColor, branding.primaryColor)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Tag className="w-6 h-6" style={{ color: branding.secondaryColor }} />
                    {t('organismPortal.specialOffersAvailable')}
                  </CardTitle>
                  <p className="text-sm text-[#666666] mt-2">
                    {t('organismPortal.specialOffersAvailableDesc')}
                  </p>
                </div>
                <Badge 
                  className="text-gray-900 hover:bg-opacity-90" 
                  style={{ 
                    backgroundColor: branding.secondaryColor, 
                    fontSize: '1rem', 
                    padding: '0.5rem 1rem' 
                  }}
                >
                  {ofertasDelOrganismo.filter(o => calcularEstadoOferta(o).estado === 'activa').length} {t('organismPortal.active')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ofertasDelOrganismo.map(oferta => {
                  const estadoOferta = calcularEstadoOferta(oferta);
                  const totalDisponible = oferta.productos.reduce((sum, p) => sum + (p.cantidadDisponible || 0), 0);
                  const totalOfrecido = oferta.productos.reduce((sum, p) => sum + (p.cantidadOfrecida || 0), 0);
                  const porcentajeDisponible = totalOfrecido > 0 ? (totalDisponible / totalOfrecido) * 100 : 0;
                  
                  // Verificar si el organismo ya ha solicitado esta oferta
                  const aceptacionOrganismo = oferta.aceptaciones.find(a => a.organismoId === organismo.id);
                  const yaSolicitada = !!aceptacionOrganismo;
                  const cantidadReservada = aceptacionOrganismo 
                    ? aceptacionOrganismo.productos.reduce((sum, p) => sum + p.cantidadAceptada, 0)
                    : 0;

                  return (
                    <div 
                      key={oferta.id} 
                      className={`border-2 rounded-lg p-4 transition-all ${
                        estadoOferta.estado === 'activa' 
                          ? 'hover:shadow-lg' 
                          : 'bg-gray-50'
                      }`}
                      style={{
                        borderColor: estadoOferta.estado === 'activa' ? branding.secondaryColor : '#d1d5db',
                        backgroundColor: estadoOferta.estado === 'activa' ? `${branding.secondaryColor}08` : undefined
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              style={{ backgroundColor: estadoOferta.color }}
                              className="text-white"
                            >
                              {estadoOferta.label}
                            </Badge>
                            {estadoOferta.diasRestantes <= 3 && estadoOferta.estado === 'activa' && (
                              <Badge style={{ backgroundColor: branding.secondaryColor }} className="text-gray-900">
                                <Clock className="w-3 h-3 mr-1" />
                                {t('organismPortal.expiresSoon')}
                              </Badge>
                            )}
                            {yaSolicitada && (
                              <Badge style={{ backgroundColor: branding.primaryColor }} className="text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t('organismPortal.alreadyRequested')}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-bold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {oferta.titulo}
                          </h4>
                          <p className="text-xs text-[#666666] mb-2">{oferta.numeroOferta}</p>
                        </div>
                        <div className="text-3xl">🏷️</div>
                      </div>

                      {oferta.descripcion && (
                        <p className="text-sm text-[#666666] mb-3 line-clamp-2">{oferta.descripcion}</p>
                      )}

                      {/* Información de la oferta */}
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" style={{ color: branding.primaryColor }} />
                          <span className="text-[#666666]">{t('organismPortal.products')}</span>
                          <span className="font-semibold">{oferta.totalProductos}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#666666]">{t('organismPortal.weight')}</span>
                          <span className="font-semibold">{formatQuantity(oferta.totalKilos || 0)} kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#666666]">{t('organismPortal.expires')}</span>
                          <span className="font-semibold text-sm">
                            {new Date(oferta.fechaExpiracion).toLocaleDateString(i18n.language)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#666666]">{t('organismPortal.value')}</span>
                          <span className="font-semibold" style={{ color: branding.secondaryColor }}>CAD$ {formatMoney(oferta.valorMonetarioTotal || 0)}</span>
                        </div>
                      </div>

                      {/* Barra de disponibilidad */}
                      {estadoOferta.estado === 'activa' && (
                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-xs text-[#666666]">
                            <span>{t('organismPortal.availability')}</span>
                            <span className="font-semibold">{porcentajeDisponible.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${porcentajeDisponible}%`,
                                backgroundColor: porcentajeDisponible > 50 ? branding.secondaryColor : 
                                                 porcentajeDisponible > 20 ? '#FFC107' : 
                                                 '#DC3545'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Información de reserva si ya fue solicitada */}
                      {yaSolicitada && aceptacionOrganismo && (
                        <div className={`border rounded-lg p-3 mb-3 ${
                          aceptacionOrganismo.estado === 'entregada' ? 'bg-blue-50 border-blue-200' :
                          aceptacionOrganismo.estado === 'aceptada' ? 'bg-green-50 border-green-200' :
                          aceptacionOrganismo.estado === 'rechazada' ? 'bg-red-50 border-red-200' :
                          aceptacionOrganismo.estado === 'anulada' ? 'bg-gray-50 border-gray-300' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start gap-2 mb-3">
                            <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                              aceptacionOrganismo.estado === 'entregada' ? 'text-[#1E73BE]' :
                              aceptacionOrganismo.estado === 'aceptada' ? 'text-[#4CAF50]' :
                              aceptacionOrganismo.estado === 'rechazada' ? 'text-[#DC3545]' :
                              aceptacionOrganismo.estado === 'anulada' ? 'text-gray-500' :
                              'text-[#1E73BE]'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-[#333333]">{t('organismPortal.yourRequest')}</p>
                                <Badge className={
                                  aceptacionOrganismo.estado === 'entregada' ? 'bg-[#1E73BE]' :
                                  aceptacionOrganismo.estado === 'aceptada' ? 'bg-[#4CAF50]' :
                                  aceptacionOrganismo.estado === 'rechazada' ? 'bg-[#DC3545]' :
                                  aceptacionOrganismo.estado === 'anulada' ? 'bg-gray-500' :
                                  'bg-[#FFC107] text-gray-900'
                                }>
                                  {aceptacionOrganismo.estado === 'entregada' ? 'Livrée' :
                                   aceptacionOrganismo.estado === 'aceptada' ? t('organismPortal.accepted') :
                                   aceptacionOrganismo.estado === 'rechazada' ? t('organismPortal.rejected') :
                                   aceptacionOrganismo.estado === 'anulada' ? t('organismPortal.cancelled') :
                                   t('organismPortal.pending')}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {aceptacionOrganismo.productos.map((prod, idx) => {
                                  const prodInfo = oferta.productos.find(p => p.productoId === prod.productoId);
                                  return (
                                    <p key={`reserva-${oferta.id}-${prod.productoId}-${idx}`} className="text-xs text-[#666666]">
                                      • {prodInfo?.productoNombre || t('organismPortal.product')}: {prod.cantidadAceptada} {t('organismPortal.unitsLower')}
                                    </p>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-[#666666] mt-2">
                                {t('organismPortal.requestedOn')} {new Date(aceptacionOrganismo.fechaSolicitud).toLocaleDateString(i18n.language)}
                              </p>
                              {aceptacionOrganismo.estado === 'entregada' && aceptacionOrganismo.fechaActualizacion && (
                                <p className="text-xs text-[#1E73BE] mt-1 font-medium">
                                  Livrée le {new Date(aceptacionOrganismo.fechaActualizacion).toLocaleDateString(i18n.language)}
                                </p>
                              )}
                              {aceptacionOrganismo.observaciones && (
                                <p className="text-xs text-[#666666] mt-1 italic">
                                  {aceptacionOrganismo.observaciones}
                                </p>
                              )}
                              {aceptacionOrganismo.motivoRechazo && (
                                <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded">
                                  <p className="text-xs font-semibold text-[#DC3545]">{t('organismPortal.rejectionReason')}</p>
                                  <p className="text-xs text-[#666666]">{aceptacionOrganismo.motivoRechazo}</p>
                                </div>
                              )}
                              
                              {/* Botón para anular solicitud si está pendiente o aceptada */}
                              {(aceptacionOrganismo.estado === 'pendiente' || aceptacionOrganismo.estado === 'aceptada') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 w-full border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                                  onClick={() => {
                                    if (confirm(t('organismPortal.confirmCancelRequest'))) {
                                      const exito = anularSolicitud(oferta.id, aceptacionOrganismo.id);
                                      if (exito) {
                                        toast.success(t('organismPortal.requestCancelled'));
                                        setRefreshOfertas(prev => prev + 1);
                                      } else {
                                        toast.error(t('organismPortal.errorCancellingRequest'));
                                      }
                                    }
                                  }}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  {t('organismPortal.cancelMyRequest')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Productos incluidos */}
                      <div className="border-t pt-3 mb-3">
                        <p className="text-xs text-[#666666] mb-2">{t('organismPortal.productsIncluded')}</p>
                        <div className="flex flex-wrap gap-1">
                          {oferta.productos.slice(0, 3).map((prod, idx) => (
                            <Badge key={`${oferta.id}-prod-${idx}`} variant="outline" className="text-xs">
                              {prod.icono} {prod.productoNombre}
                            </Badge>
                          ))}
                          {oferta.productos.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{oferta.productos.length - 3} {t('organismPortal.more')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Botón de acción */}
                      {estadoOferta.estado === 'activa' ? (
                        <Button
                          className="w-full text-white hover:opacity-90"
                          style={{ backgroundColor: branding.secondaryColor }}
                          onClick={() => handleEditarOferta(oferta)}
                          disabled={yaSolicitada}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {yaSolicitada ? t('organismPortal.alreadyRequestedBtn') : t('organismPortal.requestOffer')}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          {estadoOferta.label}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Información adicional */}
              <div 
                className="mt-6 rounded-lg p-4 border-2"
                style={{
                  backgroundColor: `${branding.primaryColor}08`,
                  borderColor: `${branding.primaryColor}30`
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className="text-white text-lg">ℹ️</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#333333] mb-1">{t('organismPortal.specialOffersTitle')}</p>
                    <p className="text-sm text-[#666666]">
                      {t('organismPortal.specialOffersDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de Ofertas Solicitadas */}
        {ofertasDelOrganismo.filter(o => o.aceptaciones.some(a => a.organismoId === organismo.id)).length > 0 && (
          <Card className={`mt-6 ${portalSectionCardClassName}`} style={getPortalSectionStyle('#1E73BE')}>
            <CardHeader className="rounded-t-[inherit] border-b border-white/75" style={getPortalHeaderStyle('#1E73BE', '#4f46e5')}>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <History className="w-6 h-6 text-[#1E73BE]" />
                📋 Historial de Ofertas Solicitadas
              </CardTitle>
              <p className="text-sm text-[#666666] mt-2">
                Resumen de todas las ofertas especiales que ha solicitado y sus cantidades reservadas
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ofertasDelOrganismo
                  .filter(o => o.aceptaciones.some(a => a.organismoId === organismo.id))
                  .map(oferta => {
                    const aceptacion = oferta.aceptaciones.find(a => a.organismoId === organismo.id);
                    if (!aceptacion) return null;

                    const totalReservado = aceptacion.productos.reduce((sum, p) => sum + p.cantidadAceptada, 0);
                    const totalKilosReservados = aceptacion.productos.reduce((sum, p) => {
                      const prod = oferta.productos.find(op => op.productoId === p.productoId);
                      return sum + ((prod?.peso || 0) * p.cantidadAceptada);
                    }, 0);
                    const valorTotalReservado = aceptacion.productos.reduce((sum, p) => {
                      const prod = oferta.productos.find(op => op.productoId === p.productoId);
                      return sum + ((prod?.valorUnitario || 0) * (prod?.peso || 0) * p.cantidadAceptada);
                    }, 0);

                    return (
                      <div key={oferta.id} className="rounded-[24px] border border-white/75 bg-[linear-gradient(135deg,rgba(239,246,255,0.96)_0%,rgba(238,242,255,0.92)_100%)] p-4 shadow-[0_18px_36px_-30px_rgba(15,45,71,0.18)]">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-[#1E73BE] text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Acceptée
                              </Badge>
                              <Badge variant="outline" className="bg-white">
                                {oferta.numeroOferta}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {oferta.titulo}
                            </h4>
                            <p className="text-xs text-[#666666]">
                              {t('organismPortal.requestedOnWithDate')} {new Date(aceptacion.fecha).toLocaleDateString(i18n.language, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-3xl">✅</div>
                        </div>

                        {/* Resumen de cantidades */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-white rounded-lg p-3 text-center border">
                            <p className="text-xs text-[#666666] mb-1">Productos</p>
                            <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.25rem' }}>
                              {totalReservado}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border">
                            <p className="text-xs text-[#666666] mb-1">Peso Total</p>
                            <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.25rem' }}>
                              {formatQuantity(totalKilosReservados)} kg
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center border">
                            <p className="text-xs text-[#666666] mb-1">Valor Total</p>
                            <p className="font-bold text-[#FFC107]" style={{ fontSize: '1.25rem' }}>
                              CAD$ {formatMoney(valorTotalReservado)}
                            </p>
                          </div>
                        </div>

                        {/* Lista de productos reservados */}
                        <div className="bg-white rounded-lg p-3 border">
                          <p className="text-xs text-[#666666] mb-2 font-semibold">Productos Reservados:</p>
                          <div className="space-y-1">
                            {aceptacion.productos.map((prod, idx) => {
                              const prodInfo = oferta.productos.find(p => p.productoId === prod.productoId);
                              return (
                                <div key={`aceptacion-${aceptacion.organismoId}-${prod.productoId}-${idx}`} className="flex items-center justify-between text-sm">
                                  <span className="text-[#333333]">
                                    {prodInfo?.icono} {prodInfo?.productoNombre || 'Producto'}
                                  </span>
                                  <span className="font-semibold text-[#1E73BE]">
                                    {prod.cantidadAceptada} und.
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {aceptacion.observaciones && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-[#DC3545]">
                                <strong>Observaciones:</strong> {aceptacion.observaciones}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Donaciones por Categoría */}
        {datosCategorias.length > 0 && (
          <Card className={`mt-6 ${portalSectionCardClassName}`} style={getPortalSectionStyle('#1E73BE')}>
            <CardHeader className="rounded-t-[inherit] border-b border-white/75" style={getPortalHeaderStyle('#1E73BE', '#4f46e5')}>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <TrendingUp className="w-6 h-6 text-[#1E73BE]" />
                Donaciones Recibidas por Categoría
              </CardTitle>
              <p className="text-sm text-[#666666] mt-2">
                Visualización de productos recibidos agrupados por categoría (solo comandas completadas)
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={datosCategorias}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis 
                      dataKey="categoria" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fill: '#333333', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#333333', fontSize: 12 }}
                      label={{ value: 'Cantidad (kg/litros)', angle: -90, position: 'insideLeft', style: { fill: '#666666' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #1E73BE',
                        borderRadius: '8px',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                      formatter={(value: any, name: string, props: any) => {
                        const icono = props.payload.icono;
                        return [`${icono} ${value} unidades`, 'Cantidad Recibida'];
                      }}
                      labelFormatter={(label: string) => `Categoría: ${label}`}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      formatter={() => 'Cantidad Recibida'}
                    />
                    <Bar 
                      dataKey="cantidad" 
                      radius={[8, 8, 0, 0]}
                      label={{ 
                        position: 'top', 
                        fill: '#333333',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    >
                      {datosCategorias.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={coloresGrafico[index % coloresGrafico.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {datosCategorias.slice(0, 4).map((cat, index) => (
                  <div 
                    key={cat.categoria}
                    className="rounded-[20px] border border-white/75 bg-slate-50/88 p-3 shadow-[0_14px_30px_-28px_rgba(15,45,71,0.16)]"
                    style={{ borderLeftColor: coloresGrafico[index % coloresGrafico.length] }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{cat.icono}</span>
                      <p className="text-xs text-[#666666] truncate">{cat.categoria}</p>
                    </div>
                    <p className="font-bold text-[#333333]" style={{ fontSize: '1.25rem' }}>
                      {cat.cantidad.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#666666]">{t('organismPortal.units')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje de Ayuda */}
        <Card className={`mt-6 ${portalSectionCardClassName}`} style={getPortalSectionStyle('#1E73BE')}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <p className="font-medium text-[#333333] mb-2">{t('organismPortal.needAssistance')}</p>
                <p className="text-sm text-[#666666] mb-3">
                  {t('organismPortal.assistanceDescription')}
                </p>
                <p className="text-sm font-medium text-[#1E73BE] mb-2">
                  Contact liaison: {responsableLiaison.nombre}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <p className="text-[#1E73BE]">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {t('organismPortal.phone')}: {responsableLiaison.telefono}
                  </p>
                  <p className="text-[#1E73BE]">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email: {responsableLiaison.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-12 px-4 pb-8 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-[24px] border border-white/75 bg-white/88 px-6 py-6 text-center text-sm text-[#666666] shadow-[0_20px_44px_-34px_rgba(15,45,71,0.2)]">
          <p>{t('organismPortal.copyright')}</p>
          <p className="mt-1">{t('organismPortal.thankYou')}</p>
        </div>
      </footer>

      {/* Dialog para detalles de la comanda */}
      {comandaSeleccionada && (
        <ModeloComanda
          comanda={comandaSeleccionada}
          organismo={organismo}
          mostrar={mostrarDetalles}
          onCerrar={() => {
            setMostrarDetalles(false);
            setComandaSeleccionada(null);
          }}
          onAceptarComanda={handleAceptarComanda}
          onAnularComanda={handleAnularComanda}
          modoOrganismo={true}
        />
      )}

      {/* Dialog para edición de perfil */}
      <Dialog open={editarPerfilOpen} onOpenChange={setEditarPerfilOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="editar-perfil-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Modifier le profil de l'organisme
            </DialogTitle>
            <DialogDescription id="editar-perfil-description" className="text-sm text-[#666666] mt-2">
              Mettez a jour les informations de contact de votre organisme. Les changements seront examines par l'administrateur.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-[#1E73BE]">
                <strong>📌 Note :</strong> Vous pouvez uniquement modifier les informations de contact. Pour tout changement du type d'organisme ou du statut, 
                contactez l'administrateur.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E73BE]" />
                Responsable *
              </Label>
              <Input
                value={datosEdicion.responsable}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, responsable: e.target.value })}
                placeholder="Nom du responsable"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1E73BE]" />
                Teléfono *
              </Label>
              <Input
                value={datosEdicion.telefono}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, telefono: e.target.value })}
                placeholder="(514) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1E73BE]" />
                Email *
              </Label>
              <Input
                type="email"
                value={datosEdicion.email}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, email: e.target.value })}
                placeholder="contacto@organismo.org"
              />
            </div>

            <div className="space-y-2">
              <AddressAutocomplete
                onAddressSelect={(address) => {
                  setDatosEdicion({ 
                    ...datosEdicion, 
                    direccion: address.street,
                    codigoPostal: address.postalCode,
                    quartier: address.quartier || ''
                  });
                }}
                disabled={false}
                initialValue={datosEdicion.direccion}
                initialQuartier={datosEdicion.quartier || ''}
                label="Adresse *"
                placeholder="Ex. : 123 boulevard Saint-Martin Est"
                required={true}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E73BE]" />
                Número de Beneficiarios *
              </Label>
              <Input
                type="number"
                value={datosEdicion.beneficiarios}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, beneficiarios: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-[#666666]">
                Cantidad aproximada de personas que atiende su organismo
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="flex items-center gap-2 text-base font-semibold text-[#333333]">
                    <UserPlus className="w-4 h-4 text-[#4CAF50]" />
                    Contacts autorises
                  </Label>
                  <p className="text-sm text-[#666666] mt-1">
                    Ajoutez ou modifiez les personnes que votre organisme autorise a recuperer les commandes et recevoir le suivi.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleAbrirFormPersona()}
                  className="bg-[#4CAF50] hover:bg-[#45a049]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau contact
                </Button>
              </div>

              {personasResponsables.length > 0 ? (
                <div className="space-y-3">
                  {personasResponsables.map((persona) => (
                    <div
                      key={persona.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#333333]">{persona.nombreCompleto}</p>
                          {persona.esPrincipal && (
                            <Badge className="bg-[#4CAF50] text-white">Principal</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#666666]">
                          <span>{persona.cargo || 'Sin cargo asignado'}</span>
                          <span>{persona.telefono}</span>
                          <span>{persona.email}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAbrirFormPersona(persona)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modificar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-4 text-sm text-[#666666]">
                  Votre organisme n'a pas encore de contacts autorises enregistres. Utilisez "Nouveau contact" pour ajouter le premier.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => setEditarPerfilOpen(false)}
                variant="outline"
              >
                Annuler
              </Button>
              <Button
                onClick={handleGuardarCambios}
                className="bg-[#4CAF50] hover:bg-[#45a049]"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para edición de ofertas */}
      <Dialog open={editarOfertaOpen} onOpenChange={setEditarOfertaOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="editar-oferta-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-[#FFC107]" />
                Solicitar Oferta Especial
              </div>
            </DialogTitle>
            <DialogDescription id="editar-oferta-description" className="text-sm text-[#666666] mt-2">
              Seleccione los productos que desea solicitar y ajuste las cantidades según sus necesidades.
            </DialogDescription>
          </DialogHeader>
          
          {ofertaSeleccionada && (
            <div className="space-y-4 py-4">
              {/* Información de la oferta */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-[#FFC107] rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                      {ofertaSeleccionada.titulo}
                    </h3>
                    <p className="text-xs text-[#666666] mb-2">{ofertaSeleccionada.numeroOferta}</p>
                    {ofertaSeleccionada.descripcion && (
                      <p className="text-sm text-[#666666]">{ofertaSeleccionada.descripcion}</p>
                    )}
                  </div>
                  <Badge className="bg-[#4CAF50] text-white">
                    {t('organismPortal.expiresOn')} {new Date(ofertaSeleccionada.fechaExpiracion).toLocaleDateString(i18n.language)}
                  </Badge>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Productos Disponibles ({productosOferta.length})
                  </Label>
                  <p className="text-xs text-[#666666]">
                    Seleccionados: {productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0).length}
                  </p>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={productosOferta.every(p => p.seleccionado)}
                            onCheckedChange={(checked) => {
                              setProductosOferta(prev => prev.map(p => ({
                                ...p,
                                seleccionado: checked as boolean
                              })));
                            }}
                          />
                        </TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Disponible</TableHead>
                        <TableHead className="text-right">Kilos/Und</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center w-[200px]">Cantidad Solicitada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosOferta.map((producto) => (
                        <TableRow key={producto.id} className={producto.seleccionado ? 'bg-green-50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={producto.seleccionado}
                              onCheckedChange={() => toggleProductoSeleccionado(producto.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{producto.icono}</span>
                              <span className="font-medium text-[#333333]">{producto.productoNombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-white">
                              {producto.cantidadMaxima}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-[#666666]">
                            {formatQuantity(producto.kilos || 0)} kg
                          </TableCell>
                          <TableCell className="text-right text-[#4CAF50] font-semibold">
                            CAD$ {formatMoney(producto.valorUnitario || 0)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => actualizarCantidad(producto.id, producto.cantidadSolicitada - 1)}
                                disabled={!producto.seleccionado || producto.cantidadSolicitada <= 0}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                value={producto.cantidadSolicitada}
                                onChange={(e) => actualizarCantidad(producto.id, parseFloat(e.target.value) || 0)}
                                disabled={!producto.seleccionado}
                                className="w-20 text-center h-8"
                                min="0"
                                max={producto.cantidadMaxima}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => actualizarCantidad(producto.id, producto.cantidadSolicitada + 1)}
                                disabled={!producto.seleccionado || producto.cantidadSolicitada >= producto.cantidadMaxima}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Resumen de totales */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Resumen de la Solicitud
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-[#666666] mb-1">Productos</p>
                    <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.5rem' }}>
                      {calcularTotalesOferta().totalProductos}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-[#666666] mb-1">Peso Total</p>
                    <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.5rem' }}>
                      {formatQuantity(calcularTotalesOferta().totalKilos)} kg
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-[#666666] mb-1">Valor Total</p>
                    <p className="font-bold text-[#FFC107]" style={{ fontSize: '1.5rem' }}>
                      CAD$ {formatMoney(calcularTotalesOferta().totalValor)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de Fecha de Recogida */}
              <div className="bg-white border-2 border-[#1E73BE] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1E73BE] rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-bold text-[#333333] mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Fecha de Recogida <span className="text-[#DC3545]">*</span>
                    </Label>
                    <p className="text-sm text-[#666666] mb-3">
                      Indique la fecha en que planea recoger los productos. Esta información es obligatoria para procesar su solicitud.
                    </p>
                    <Input
                      type="date"
                      value={fechaRecogida}
                      onChange={(e) => setFechaRecogida(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="max-w-xs border-[#1E73BE]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Campo de Persona que Recogerá */}
              <div className="bg-white border-2 border-[#1E73BE] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1E73BE] rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="font-bold text-[#333333] mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Persona que Recogerá <span className="text-[#DC3545]">*</span>
                    </Label>
                    <p className="text-sm text-[#666666] mb-3">
                      Seleccione la persona autorizada que recogerá los productos en la fecha indicada.
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Select 
                          value={personaRecogida} 
                          onValueChange={(value) => {
                            setPersonaRecogida(value);
                            // Buscar la persona seleccionada y autocompletar el teléfono si existe
                            const personaSeleccionada = personasResponsables.find(p => p.nombreCompleto === value);
                            if (personaSeleccionada && personaSeleccionada.telefono) {
                              setTelefonoRecogida(personaSeleccionada.telefono);
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1 border-[#1E73BE]">
                            <SelectValue placeholder="Sélectionnez une personne autorisée" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            {personasResponsables.length > 0 ? (
                              personasResponsables.map((persona) => (
                                <SelectItem key={persona.id} value={persona.nombreCompleto}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{persona.nombreCompleto}</span>
                                    {persona.cargo && (
                                      <span className="text-xs text-[#666666]">({persona.cargo})</span>
                                    )}
                                    {persona.esPrincipal && (
                                      <span className="text-xs">⭐</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-personas" disabled>
                                Aucune personne autorisee n'est enregistree
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogPersonasOpen(true)}
                          className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white whitespace-nowrap"
                          title="Gerer les personnes autorisees"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-sm text-[#666666] mb-1 block">
                          Telephone de contact (optionnel)
                        </Label>
                        <Input
                          type="tel"
                          value={telefonoRecogida}
                          onChange={(e) => setTelefonoRecogida(e.target.value)}
                          placeholder="Ex : 555-1234"
                          className="max-w-xs border-[#1E73BE]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensaje informativo */}
              <div className="bg-yellow-50 border border-[#FFC107] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#333333] mb-1">Importante</p>
                    <p className="text-sm text-[#666666]">
                      <strong>La fecha de recogida indicada es une proposition de l'organisme, mais ${branding.systemName} 
                      se reserva el derecho de modificarla</strong> según disponibilidad y logística. Las cantidades 
                      solicitadas están sujetas a disponibilidad final.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setEditarOfertaOpen(false);
                    setOfertaSeleccionada(null);
                    setFechaRecogida('');
                    setPersonaRecogida('');
                    setTelefonoRecogida('');
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmarSolicitudOferta}
                  className="bg-[#4CAF50] hover:bg-[#45a049]"
                  disabled={productosOferta.filter(p => p.seleccionado && p.cantidadSolicitada > 0).length === 0 || !fechaRecogida || !personaRecogida.trim()}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Confirmar Solicitud
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Formulario de Persona Responsable */}
      <Dialog open={dialogFormPersonaOpen} onOpenChange={setDialogFormPersonaOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="form-persona-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-[#4CAF50]" />
                {personaEditando ? t('organisms.profileDialog.authorizedPersons.editPerson') : t('organisms.profileDialog.authorizedPersons.addPerson')}
              </div>
            </DialogTitle>
            <DialogDescription id="form-persona-description">
              {personaEditando 
                ? t('organisms.profileDialog.authorizedPersons.updatePersonDescription')
                : t('organisms.profileDialog.authorizedPersons.addPersonDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Completo */}
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Users className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.fullNameRequired')}
                </Label>
                <Input
                  value={formPersona.nombreCompleto}
                  onChange={(e) => setFormPersona({ ...formPersona, nombreCompleto: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.fullNamePlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Phone className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.phoneRequired')}
                </Label>
                <Input
                  type="tel"
                  value={formPersona.telefono}
                  onChange={(e) => setFormPersona({ ...formPersona, telefono: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.phonePlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Mail className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.emailRequired')}
                </Label>
                <Input
                  type="email"
                  value={formPersona.email}
                  onChange={(e) => setFormPersona({ ...formPersona, email: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.emailPlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Cargo */}
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Award className="w-4 h-4 text-[#1E73BE]" />
                  {t('organisms.profileDialog.authorizedPersons.position')}
                </Label>
                <Input
                  value={formPersona.cargo}
                  onChange={(e) => setFormPersona({ ...formPersona, cargo: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.positionPlaceholder')}
                  className="border-gray-300"
                />
              </div>

              {/* Selección múltiple de idiomas */}
              <div className="md:col-span-2 space-y-3">
                <Label className="flex items-center gap-2 text-[#333333]">
                  <Languages className="w-4 h-4 text-[#1E73BE]" />
                  Langues parlées
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: 'fr' as IdiomaPersona, label: '🇫🇷 Français', color: '#1a4d7a' },
                    { code: 'en' as IdiomaPersona, label: '🇬🇧 English', color: '#2d9561' },
                    { code: 'es' as IdiomaPersona, label: '🇪🇸 Espagnol', color: '#8B5CF6' },
                    { code: 'ar' as IdiomaPersona, label: '🇸🇦 العربية', color: '#F59E0B' }
                  ].map((idioma) => (
                    <label
                      key={idioma.code}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: formPersona.idiomas?.includes(idioma.code) ? idioma.color : '#e5e7eb',
                        backgroundColor: formPersona.idiomas?.includes(idioma.code) ? `${idioma.color}10` : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formPersona.idiomas?.includes(idioma.code) || false}
                        onChange={(e) => {
                          const currentIdiomas = formPersona.idiomas || [];
                          const newIdiomas = e.target.checked
                            ? [...currentIdiomas, idioma.code]
                            : currentIdiomas.filter(i => i !== idioma.code);
                          setFormPersona({ ...formPersona, idiomas: newIdiomas });
                        }}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: idioma.color }}
                      />
                      <span className="text-sm font-medium">{idioma.label}</span>
                    </label>
                  ))}
                </div>
                {formPersona.idiomas && formPersona.idiomas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formPersona.idiomas.map((code) => {
                      const idiomaInfo = [
                        { code: 'fr', label: '🇫🇷 Français', color: '#1a4d7a' },
                        { code: 'en', label: '🇬🇧 English', color: '#2d9561' },
                        { code: 'es', label: '🇪🇸 Espagnol', color: '#8B5CF6' },
                        { code: 'ar', label: '🇸🇦 العربية', color: '#F59E0B' }
                      ].find(i => i.code === code);
                      return idiomaInfo ? (
                        <Badge
                          key={code}
                          className="text-white"
                          style={{ backgroundColor: idiomaInfo.color }}
                        >
                          {idiomaInfo.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[#333333]">
                  {t('organisms.profileDialog.authorizedPersons.additionalNotes')}
                </Label>
                <Textarea
                  value={formPersona.notas}
                  onChange={(e) => setFormPersona({ ...formPersona, notas: e.target.value })}
                  placeholder={t('organisms.profileDialog.authorizedPersons.additionalNotesPlaceholder')}
                  rows={3}
                  className="border-gray-300"
                />
              </div>

              {/* Checkbox Principal */}
              <div className="md:col-span-2">
                <div className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Checkbox
                    id="es-principal"
                    checked={formPersona.esPrincipal}
                    onCheckedChange={(checked) => setFormPersona({ ...formPersona, esPrincipal: checked as boolean })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="es-principal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#4CAF50]" />
                        {t('organisms.profileDialog.authorizedPersons.markAsPrimary')}
                      </div>
                    </label>
                    <p className="text-xs text-[#666666]">
                      {t('organisms.profileDialog.authorizedPersons.primaryContactSuggestion')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disponibilidad - Días y Horarios */}
              <div className="md:col-span-2 mt-4 pt-4 border-t">
                <SelecteurJoursDisponibles
                  joursDisponibles={formPersona.joursDisponibles}
                  onChange={(nouveauxJours) => setFormPersona({ ...formPersona, joursDisponibles: nouveauxJours })}
                  showIcon={true}
                  label="Jours et horaires disponibles pour récupérer les commandes"
                />
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#1E73BE] rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-[#333333] mb-1">{t('organisms.profileDialog.authorizedPersons.importantInfo')}</p>
                  <ul className="text-sm text-[#666666] space-y-1 list-disc list-inside">
                    <li>{t('organisms.profileDialog.authorizedPersons.canIdentifyToPickUp')}</li>
                    <li>{t('organisms.profileDialog.authorizedPersons.keepListUpdated')}</li>
                    <li>{t('organisms.profileDialog.authorizedPersons.onlyAuthorizedPersons')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setDialogFormPersonaOpen(false);
                setPersonaEditando(null);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              {t('organisms.profileDialog.authorizedPersons.cancel')}
            </Button>
            <Button
              onClick={handleGuardarPersona}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              disabled={!formPersona.nombreCompleto.trim() || !formPersona.telefono.trim() || !formPersona.email.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {personaEditando ? t('organisms.profileDialog.authorizedPersons.updatePerson') : t('organisms.profileDialog.authorizedPersons.addPersonButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Nueva Entrada PRS */}
      <Dialog open={dialogNuevaEntradaOpen} onOpenChange={setDialogNuevaEntradaOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 border-0 shadow-2xl" aria-describedby="nueva-entrada-description">
          {/* Header con degradado */}
          <div 
            className="absolute top-0 left-0 right-0 h-32 -z-10 rounded-t-xl"
            style={{
              background: `linear-gradient(135deg, ${branding.secondaryColor}20 0%, ${branding.primaryColor}15 100%)`
            }}
          />
          
          <DialogHeader className="relative">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
                  }}
                >
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                  <Plus className="w-7 h-7 relative z-10" />
                </div>
                <div>
                  <p style={{ color: branding.primaryColor }}>Nouvelle Entrée PRS</p>
                  <p className="text-sm font-normal text-[#666666] mt-1">
                    Programme de Ramassage de Surplus
                  </p>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription id="nueva-entrada-description" className="sr-only">
              Créer une nouvelle entrée pour le Programme de Ramassage de Surplus
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Badge organismo PRS con diseño mejorado */}
            <div 
              className="p-4 rounded-xl border-2 backdrop-blur-sm relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${branding.secondaryColor}10 0%, ${branding.secondaryColor}05 100%)`,
                borderColor: `${branding.secondaryColor}30`
              }}
            >
              {/* Patrón de fondo sutil */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `radial-gradient(circle, ${branding.secondaryColor} 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} />
              
              <div className="flex items-center gap-3 relative z-10">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  <span className="text-2xl">✓</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {organismo.nombre}
                  </p>
                  <p className="text-sm text-[#666666]">
                    Participant actif au Programme PRS
                  </p>
                </div>
                <Badge 
                  className="text-white text-xs px-3 py-1"
                  style={{ 
                    backgroundColor: branding.secondaryColor,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  PRS ACTIF
                </Badge>
              </div>
            </div>

            {/* Grid de campos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Donador PRS */}
              <div className="space-y-2.5">
                <Label htmlFor="donador" className="flex items-center gap-2 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${branding.secondaryColor}15` }}
                  >
                    <Users className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                  </div>
                  Donateur PRS <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formEntrada.donadorId}
                  onValueChange={(value) => setFormEntrada({ ...formEntrada, donadorId: value })}
                >
                  <SelectTrigger className="border-2 h-12 bg-white hover:border-opacity-60 transition-all" style={{ borderColor: `${branding.secondaryColor}30` }}>
                    <SelectValue placeholder="Sélectionner un donateur..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {donadoresPRS.length > 0 ? (
                      donadoresPRS.map((donador) => (
                        <SelectItem key={donador.id} value={donador.id}>
                          <div className="flex items-center gap-2 py-1">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                              style={{ backgroundColor: branding.secondaryColor }}
                            >
                              {donador.nombre.charAt(0)}{donador.apellido.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{donador.nombreCompleto}</p>
                              {donador.nombreEmpresa && (
                                <p className="text-xs text-gray-500">{donador.nombreEmpresa}</p>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Aucun donateur PRS disponible
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {donadoresPRS.length === 0 && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="text-xs text-orange-700">
                      Aucun donateur PRS assigné à votre organisme
                    </p>
                  </div>
                )}
              </div>

              {/* Producto PRS */}
              <div className="space-y-2.5">
                <Label htmlFor="producto" className="flex items-center gap-2 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${branding.secondaryColor}15` }}
                  >
                    <Package className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                  </div>
                  Produit PRS <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formEntrada.productoId}
                  onValueChange={(value) => setFormEntrada({ ...formEntrada, productoId: value })}
                >
                  <SelectTrigger className="border-2 h-12 bg-white hover:border-opacity-60 transition-all" style={{ borderColor: `${branding.secondaryColor}30` }}>
                    <SelectValue placeholder="Sélectionner un produit..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {productosPRS.length > 0 ? (
                      productosPRS.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          <div className="flex items-center gap-3 py-1">
                            <span className="text-2xl">{producto.icono}</span>
                            <div>
                              <p className="font-medium">{producto.nombre}</p>
                              <p className="text-xs text-gray-500">
                                {producto.categoria} • {producto.unidad}
                                {producto.pesoUnitario && ` • ${producto.pesoUnitario.toFixed(3)} kg`}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Aucun produit PRS disponible
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {productosPRS.length === 0 && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="text-xs text-orange-700">
                      Aucun produit PRS configuré
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del producto seleccionado - Diseño mejorado */}
            {formEntrada.productoId && productosPRS.find(p => p.id === formEntrada.productoId) && (
              <div 
                className="p-4 rounded-xl border-2 backdrop-blur-sm relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${branding.primaryColor}08 0%, ${branding.primaryColor}03 100%)`,
                  borderColor: `${branding.primaryColor}20`
                }}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-white shadow-md"
                    style={{ borderColor: `${branding.primaryColor}30`, borderWidth: 2 }}
                  >
                    {productosPRS.find(p => p.id === formEntrada.productoId)?.icono}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg" style={{ color: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}>
                      {productosPRS.find(p => p.id === formEntrada.productoId)?.nombre}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de Cantidad y Temperatura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cantidad */}
              <div className="space-y-2.5">
                <Label htmlFor="cantidad" className="flex items-center gap-2 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${branding.secondaryColor}15` }}
                  >
                    <ShoppingCart className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                  </div>
                  Quantité <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formEntrada.cantidad}
                  onChange={(e) => setFormEntrada({ ...formEntrada, cantidad: e.target.value })}
                  placeholder="Ex: 100"
                  className="border-2 h-12 bg-white text-lg transition-all"
                  style={{ borderColor: `${branding.secondaryColor}30` }}
                />
                {formEntrada.productoId && formEntrada.cantidad && parseFloat(formEntrada.cantidad) > 0 && (
                  <div 
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: `${branding.secondaryColor}10` }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: branding.secondaryColor }}
                    >
                      <span className="text-white text-lg">✓</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#666666]">Poids total estimé</p>
                      <p className="font-bold text-sm" style={{ color: branding.secondaryColor }}>
                        {formatQuantity(parseFloat(formEntrada.cantidad) * (productosPRS.find(p => p.id === formEntrada.productoId)?.pesoUnitario || productosPRS.find(p => p.id === formEntrada.productoId)?.peso || 0))} kg
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Temperatura */}
              <div className="space-y-2.5">
                <Label htmlFor="temperatura" className="flex items-center gap-2 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${branding.secondaryColor}15` }}
                  >
                    <Thermometer className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                  </div>
                  Température <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formEntrada.temperatura}
                  onValueChange={(value) => setFormEntrada({ ...formEntrada, temperatura: value as 'ambiente' | 'refrigerado' | 'congelado' })}
                >
                  <SelectTrigger className="border-2 h-12 bg-white hover:border-opacity-60 transition-all" style={{ borderColor: `${branding.secondaryColor}30` }}>
                    <SelectValue placeholder="Sélectionner la température..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambiente">
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <span className="text-2xl">🌡️</span>
                        </div>
                        <div>
                          <p className="font-medium">Ambiante</p>
                          <p className="text-xs text-gray-500">Température ambiante</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="refrigerado">
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-2xl">❄️</span>
                        </div>
                        <div>
                          <p className="font-medium">Réfrigéré</p>
                          <p className="text-xs text-gray-500">0°C à 5°C</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="congelado">
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <span className="text-2xl">🧊</span>
                        </div>
                        <div>
                          <p className="font-medium">Congelé</p>
                          <p className="text-xs text-gray-500">-18°C ou moins</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2.5">
              <Label htmlFor="observaciones" className="flex items-center gap-2 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${branding.secondaryColor}15` }}
                >
                  <MessageSquare className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                </div>
                Observations
                <span className="text-xs text-[#999999] font-normal">(optionnel)</span>
              </Label>
              <Textarea
                id="observaciones"
                value={formEntrada.observaciones}
                onChange={(e) => setFormEntrada({ ...formEntrada, observaciones: e.target.value })}
                placeholder="Notes additionnelles sur cette entrée..."
                rows={4}
                className="border-2 bg-white resize-none transition-all"
                style={{ borderColor: `${branding.secondaryColor}30` }}
              />
            </div>

            {/* Mensaje informativo con diseño mejorado */}
            <div 
              className="p-4 rounded-xl border-2 backdrop-blur-sm"
              style={{ 
                background: 'linear-gradient(135deg, #e8a41910 0%, #e8a41905 100%)',
                borderColor: '#e8a41930'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Information importante
                  </p>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    Cette entrée sera enregistrée dans le système d'inventaire et sera visible pour les administrateurs. Assurez-vous que toutes les informations sont correctes avant de soumettre.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones con diseño mejorado */}
          <div className="flex justify-end gap-3 pt-6 border-t-2" style={{ borderColor: '#e0e0e0' }}>
            <Button
              variant="outline"
              onClick={() => {
                setDialogNuevaEntradaOpen(false);
                setFormEntrada({
                  donadorId: '',
                  productoId: '',
                  cantidad: '',
                  temperatura: '',
                  observaciones: ''
                });
              }}
              className="h-11 px-6 hover:shadow-md transition-all duration-300 hover:scale-105"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleGuardarEntrada}
              className="h-11 px-6 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{ 
                background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                opacity: (!formEntrada.donadorId || !formEntrada.productoId || !formEntrada.cantidad || parseFloat(formEntrada.cantidad) <= 0 || !formEntrada.temperatura) ? 0.5 : 1
              }}
              disabled={!formEntrada.donadorId || !formEntrada.productoId || !formEntrada.cantidad || parseFloat(formEntrada.cantidad) <= 0 || !formEntrada.temperatura}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer l'entrée
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botón de Guía Flotante y Movible */}
      {!mostrarDemandes && (
        <>
          {/* Botón Flotante */}
          <div
            onMouseDown={handleMouseDownGuia}
            style={{
              position: 'fixed',
              left: `${guiaPosicion.x}px`,
              top: `${guiaPosicion.y}px`,
              cursor: arrastrando ? 'grabbing' : 'grab',
              zIndex: 9999,
              userSelect: 'none'
            }}
          >
            <div className="relative">
              {/* Halo pulsante */}
              <div 
                className="absolute inset-0 rounded-full animate-pulse opacity-20 blur-lg"
                style={{ backgroundColor: branding.secondaryColor }}
              />
              {/* Botón principal */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setGuiaVisible(!guiaVisible);
                }}
                className="relative w-16 h-16 rounded-full shadow-2xl border-2 border-white/40 hover:scale-110 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`,
                  pointerEvents: 'auto'
                }}
              >
                <MessageSquare className="w-7 h-7 text-white relative z-10" />
                {/* Indicador de pulso */}
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
                  style={{ backgroundColor: '#fff' }}
                />
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#fff' }}
                />
              </Button>
            </div>
          </div>

          {/* Panel de Guía */}
          {guiaVisible && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998]"
              onClick={() => setGuiaVisible(false)}
            >
              <div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/40 max-w-2xl w-full mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del panel */}
                <div
                  className="p-6 text-white relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Guide du Portal
                        </h2>
                        <p className="text-sm text-white/80">Bienvenue dans votre espace organisme</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setGuiaVisible(false)}
                      variant="ghost"
                      className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Contenido del panel */}
                <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="space-y-5">
                    {/* Banner de bienvenida */}
                    <div className="p-4 rounded-xl border-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50" style={{ borderColor: branding.primaryColor }}>
                      <h4 className="font-bold text-base mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        🎯 Guide du Portal Organismes
                      </h4>
                      <p className="text-xs text-gray-600">
                        Découvrez toutes les fonctionnalités disponibles dans votre portail
                      </p>
                    </div>

                    {/* PORTAL ORGANISMOS */}
                    <div className="border-l-4 pl-4" style={{ borderColor: branding.secondaryColor }}>
                      <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                        📱 PORTAL ORGANISMES
                      </h3>
                      
                      {/* Dashboard Principal */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}20` }}>
                            <TrendingUp className="w-4 h-4" style={{ color: branding.primaryColor }} />
                          </div>
                          <h4 className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Dashboard Principal
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-9">
                          • Vue d'ensemble de vos statistiques de dons<br/>
                          • Graphique des catégories de produits reçus<br/>
                          • Historique des commandes complétées<br/>
                          • Total des bénéficiaires servis
                        </p>
                      </div>

                      {/* Mes Demandes */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}20` }}>
                            <ShoppingCart className="w-4 h-4" style={{ color: branding.primaryColor }} />
                          </div>
                          <h4 className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Mes Demandes
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-9">
                          • Gérez toutes vos demandes d'offres<br/>
                          • Statuts: Acceptées, En attente, Expirées<br/>
                          • Suivez le détail de chaque demande<br/>
                          • Annulez les demandes non traitées
                        </p>
                      </div>

                      {/* Offres Disponibles */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.secondaryColor}20` }}>
                            <Star className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                          </div>
                          <h4 className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Offres Disponibles
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-9">
                          • Consultez les offres de dons disponibles<br/>
                          • Vérifiez quantités et dates d'expiration<br/>
                          • Réservez les produits dont vous avez besoin<br/>
                          • Indiquez date et personne de collecte
                        </p>
                      </div>

                      {/* PRS (si aplica) */}
                      {organismo.participaPRS && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.secondaryColor}20` }}>
                              <Plus className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                            </div>
                            <h4 className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              Nouvelle Entrée PRS
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 ml-9">
                            • Programme de Récupération en Supermarchés<br/>
                            • Enregistrez les produits reçus<br/>
                            • Sélectionnez donateur, produit, quantité<br/>
                            • Indiquez température de conservation
                          </p>
                        </div>
                      )}

                      {/* Rapports */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}20` }}>
                            <FileSpreadsheet className="w-4 h-4" style={{ color: branding.primaryColor }} />
                          </div>
                          <h4 className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Rapports Excel
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-9">
                          • Générez des rapports détaillés<br/>
                          • Sélectionnez une période spécifique<br/>
                          • Exportez vos dons reçus en Excel<br/>
                          • Analysez vos historiques
                        </p>
                      </div>

                      {/* Profil & Personnes */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}20` }}>
                            <Users className="w-4 h-4" style={{ color: branding.primaryColor }} />
                          </div>
                          <h4 className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Profil & Personnes Responsables
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-9">
                          • Gérez votre profil d'organisme<br/>
                          • Ajoutez des personnes autorisées<br/>
                          • Définissez jours et heures de disponibilité<br/>
                          • Indiquez les langues parlées
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-dashed" style={{ borderColor: `${branding.primaryColor}30` }} />

                    {/* INFORMATION GÉNÉRALE */}
                    <div className="border-l-4 pl-4" style={{ borderColor: branding.primaryColor }}>
                      <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        ℹ️ À PROPOS DU SYSTÈME
                      </h3>
                      
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                        <p className="text-xs text-gray-700 mb-2">
                          Ce portail fait partie du système intégral de gestion de ${branding.systemName} qui permet à l'équipe interne de gérer efficacement tous les aspects des opérations:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1 ml-4">
                          <li>• Gestion complète de l'inventaire et des stocks</li>
                          <li>• Préparation et suivi des commandes</li>
                          <li>• Coordination du transport et des livraisons</li>
                          <li>• Génération de rapports et statistiques</li>
                          <li>• Communication avec tous les organismes bénéficiaires</li>
                        </ul>
                        <p className="text-xs text-gray-700 mt-3 italic">
                          En tant qu'organisme bénéficiaire, vous avez accès aux modules nécessaires pour gérer vos demandes et consulter vos dons reçus.
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-dashed" style={{ borderColor: `${branding.secondaryColor}30` }} />

                    {/* FONCTIONNALITÉS SPÉCIALES */}
                    <div className="border-l-4 pl-4" style={{ borderColor: branding.secondaryColor }}>
                      <h3 className="font-bold text-base mb-3" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                        ✨ FONCTIONNALITÉS SPÉCIALES
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: branding.secondaryColor }} />
                          <p className="text-xs text-gray-600">
                            <strong>Multilingue:</strong> Français, Espagnol, Anglais, Arabe (RTL)
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: branding.secondaryColor }} />
                          <p className="text-xs text-gray-600">
                            <strong>Glassmorphism:</strong> Design moderne avec effets visuels élégants
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: branding.secondaryColor }} />
                          <p className="text-xs text-gray-600">
                            <strong>Responsive:</strong> Compatible mobile, tablette et desktop
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: branding.secondaryColor }} />
                          <p className="text-xs text-gray-600">
                            <strong>Temps réel:</strong> Synchronisation instantanée des données
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: branding.secondaryColor }} />
                          <p className="text-xs text-gray-600">
                            <strong>Monnaie:</strong> Dollars canadiens (CAD$)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conseils útiles */}
                    <div className="p-4 rounded-xl border-2" style={{ borderColor: `${branding.secondaryColor}40`, backgroundColor: `${branding.secondaryColor}05` }}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: branding.secondaryColor }} />
                        <div>
                          <h4 className="font-semibold text-sm mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            💡 Conseils pour Organismes
                          </h4>
                          <ul className="text-xs text-gray-600 space-y-1.5">
                            <li>✓ Vérifiez quotidiennement les nouvelles offres disponibles</li>
                            <li>✓ Répondez rapidement avant expiration des offres</li>
                            <li>✓ Maintenez votre profil et vos personnes à jour</li>
                            <li>✓ Utilisez votre langue préférée avec le sélecteur</li>
                            <li>✓ Consultez régulièrement vos demandes acceptées</li>
                            {organismo.participaPRS && (
                              <li>✓ Enregistrez vos entrées PRS le jour même</li>
                            )}
                            <li>✓ Générez des rapports pour votre gestion interne</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Nota movible */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2" style={{ borderColor: branding.primaryColor }}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5" style={{ color: branding.secondaryColor }} />
                        <p className="font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                          Guide Déplaçable
                        </p>
                      </div>
                      <p className="text-xs text-center text-gray-600">
                        Cliquez et faites glisser le bouton vert pour le déplacer où vous voulez sur l'écran
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-2 border-t" style={{ borderColor: `${branding.primaryColor}20` }}>
                      <p className="text-xs text-gray-500">
                        {branding.systemName} • Système Intégral de Gestion v2.0
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
      )}
    </>
  );
}