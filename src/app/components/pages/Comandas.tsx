import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, FileCheck, Search, Printer, Users, Bell, Tag, Package, Check, X, Edit2, Ban, Calendar, Clock, Rows3, LayoutGrid, QrCode } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { mockOrganismos, mockProductos } from '../../data/mockData';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ModeloComanda } from './ModeloComanda';
import { actualizarComanda, esTransicionEstadoComandaValida, obtenerComandas } from '../../utils/comandaStorage';
import { obtenerProductos } from '../../utils/productStorage';
import { AlertaComandasUrgentes } from '../AlertaComandasUrgentes';
import { EtiquetaComanda } from '../comandas/EtiquetaComanda';
import { ComandaCompletaImprimible } from '../comandas/ComandaCompletaImprimible';
import { ListaProductosDistribuidosDialog } from '../comandas/ListaProductosDistribuidosDialog';
import { printStandardOrderLabel, type EtiquetaComandaData } from '../comandas/EtiquetaComandaEstandarizada';
import { printComandaYEtiquetaSeparadas } from '../comandas/ImpresionComandaEtiquetaSeparada';
import { obtenerEtiquetaModalidadDistribucion, resolverModalidadDistribucionComanda } from '../../utils/comandaDistributionMode';
import { ProponerNuevaFecha } from '../comandas/ProponerNuevaFecha';
import { EscanerQR } from '../comandas/EscanerQR';
import { filterByThreeLettersMultiple } from '../../utils/searchUtils';
import { 
  obtenerOfertas, 
  aceptarSolicitud,
  actualizarFechaExpiracionOferta,
  anularOferta,
  marcarSolicitudEnPreparacion,
  marcarSolicitudEntregada,
  rechazarSolicitud,
  anularSolicitud,
  type Oferta,
  type SolicitudOferta 
} from '../../utils/ofertaStorage';
import { useBranding } from '../../../hooks/useBranding';
import { useCompactViewport } from '../../../hooks/useCompactViewport';
import type { Comanda, ItemComanda, Organismo, ProductoOferta, Oferta as OfertaTipo, Solicitud, ProductoAceptado, DatosQR } from '../../types';
import { registrarActividad } from '../../utils/actividadLogger';
import { obtenerOrganismos as obtenerOrganismosReales } from '../../utils/organismosStorage';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import { normalizeScannedComandaQR } from '../../utils/comandaQr';
import { normalizeScannedLocationQR, normalizeScannedProductQR } from '../../utils/barcode';
import {
  clearPendingQrNavigation,
  readPendingQrNavigation,
} from '../../utils/pendingQrNavigation';
import { formatNumberSimple } from '../../utils/formatUtils';
import { sortByTemperature } from '../../utils/temperatureSort';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { ModuleExecutiveStrip } from '../shared/ModuleExecutiveStrip';

export function Comandas() {
  const { t, i18n } = useTranslation();
  const tFr = i18n.getFixedT('fr');
  const branding = useBranding();
  const [tabActual, setTabActual] = useState('comandas');
  const {
    isCompactViewport: isCompactOrdersViewport,
    viewportZoom: ordersViewportZoom,
  } = useCompactViewport({
    deps: [tabActual],
    resolveZoom: ({ height, isCompact }) => {
      const compactOrdersOverview = isCompact && tabActual === 'comandas';
      const compactOffersView = isCompact && tabActual === 'ofertas';

      if (height < 600) {
        if (compactOrdersOverview) {
          return 0.56;
        }

        if (compactOffersView) {
          return 0.5;
        }

        return 0.38;
      }

      if (height < 700) {
        if (compactOrdersOverview) {
          return 0.66;
        }

        if (compactOffersView) {
          return 0.6;
        }

        return 0.52;
      }

      if (isCompact) {
        if (compactOrdersOverview) {
          return 0.84;
        }

        if (compactOffersView) {
          return 0.82;
        }

        return 0.78;
      }

      return 1;
    },
  });
  const currentLocale = i18n.language || 'fr';

  const parseDateForDisplay = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(value);
  };

  const formatLocalizedDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
    parseDateForDisplay(value).toLocaleDateString(currentLocale, options);
  const formatFrenchDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
    parseDateForDisplay(value).toLocaleDateString('fr', options);
  const formatOfferObservation = (value?: string | null) => {
    if (!value) {
      return '';
    }

    return value
      .replace(/^Solicitud desde el portal del organismo\.\s*/i, 'Demande soumise depuis le portail de l’organisme. ')
      .replace(/Total:\s*(\d+)\s+productos?,\s*/i, (_match, totalProductos: string) => {
        const total = Number(totalProductos);
        const label = total === 1 ? 'produit' : 'produits';
        return `Total : ${totalProductos} ${label}, `;
      })
      .replace(/Fecha de recogida:\s*/i, 'Date de collecte : ')
      .replace(/Persona que recogerá:\s*/i, 'Personne qui récupérera : ')
      .replace(/\(Tel:\s*/i, '(Tél. : ');
  };
  const formatDateInputValue = (value: string) => {
    const fecha = parseDateForDisplay(value);

    if (Number.isNaN(fecha.getTime())) {
      return '';
    }

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };
  const searchByNumberPlaceholder = t('orders.searchByNumber');
  const [searchTerm, setSearchTerm] = useState('');
  const [comandaDialogOpen, setComandaDialogOpen] = useState(false);
  const [comandaGrupoDialogOpen, setComandaGrupoDialogOpen] = useState(false);
  const [dialogNotificacionOpen, setDialogNotificacionOpen] = useState(false);
  const [dialogListaDistribuidosOpen, setDialogListaDistribuidosOpen] = useState(false);
  const [mostrarModeloComanda, setMostrarModeloComanda] = useState(false);
  const [mostrarImpresionCompacta, setMostrarImpresionCompacta] = useState(false);
  const [abrirEdicionGrupoDirecta, setAbrirEdicionGrupoDirecta] = useState(false);
  const [comandaSeleccionada, setComandaSeleccionada] = useState<Comanda | null>(null);
  const [selectedOrganismos, setSelectedOrganismos] = useState<string[]>([]);
  const [comandasSeleccionadas, setComandasSeleccionadas] = useState<string[]>([]);
  const [confirmacionNotificaciones, setConfirmacionNotificaciones] = useState(false);
  const [grupoItems, setGrupoItems] = useState<ItemComanda[]>([{ productoId: '', cantidad: 1, nombreProducto: '', unidad: '' }]);
  const [fechaEntregaGrupo, setFechaEntregaGrupo] = useState('');
  const [observacionesGrupo, setObservacionesGrupo] = useState('');
  const [searchInventario, setSearchInventario] = useState('');
  const [cantidadesInventario, setCantidadesInventario] = useState<Record<string, number>>({});
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [vistaCompactaComandas, setVistaCompactaComandas] = useState(false);
  
  // Estados para proponer nueva fecha
  const [dialogProponerFechaOpen, setDialogProponerFechaOpen] = useState(false);
  const [comandaParaAccion, setComandaParaAccion] = useState<Comanda | null>(null);
  
  // Estados para escanear QR
  const [escanerQROpen, setEscanerQROpen] = useState(false);
  
  // Estados para solicitudes de ofertas
  const [dialogVerSolicitudOpen, setDialogVerSolicitudOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [ofertaParaSolicitud, setOfertaParaSolicitud] = useState<OfertaTipo | null>(null);
  
  // Estados para ofertas
  const [estadoFiltroOferta, setEstadoFiltroOferta] = useState('todos');
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<Oferta | null>(null);
  const [ofertaEnGestion, setOfertaEnGestion] = useState<Oferta | null>(null);
  const [dialogEditarCaducidadOfertaOpen, setDialogEditarCaducidadOfertaOpen] = useState(false);
  const [dialogAnularOfertaOpen, setDialogAnularOfertaOpen] = useState(false);
  const [nuevaFechaCaducidadOferta, setNuevaFechaCaducidadOferta] = useState('');
  const [refreshOfertas, setRefreshOfertas] = useState(0);
  
  // Obtener ofertas actualizadas
  const ofertas = obtenerOfertas();

  const organismosDisponibles = [
    ...obtenerOrganismosReales(),
    ...mockOrganismos.filter(mockOrganismo => !obtenerOrganismosReales().some(organismoReal => organismoReal.id === mockOrganismo.id))
  ];
  const productosReales = obtenerProductos();
  const productosCatalogoMap = new Map(
    [
      ...productosReales,
      ...mockProductos.filter(mockProducto => !productosReales.some(producto => producto.id === mockProducto.id))
    ].map(producto => [producto.id, producto])
  );
  const productosCatalogo = Array.from(productosCatalogoMap.values());

  const normalizeQrMatch = (value?: string | null) =>
    typeof value === 'string' ? value.trim().toLowerCase() : '';

  const obtenerNombreOrganismoComanda = (comanda: Comanda | null | undefined) => {
    if (!comanda) {
      return '';
    }

    return comanda.nombreOrganismo || (comanda as Comanda & { organismoNombre?: string }).organismoNombre || '';
  };

  const resolverOrganismoComanda = (comanda: Comanda | null | undefined) => {
    if (!comanda) {
      return null;
    }

    const nombreOrganismo = obtenerNombreOrganismoComanda(comanda);

    return organismosDisponibles.find(organismo =>
      organismo.id === comanda.organismoId ||
      (nombreOrganismo !== '' && organismo.nombre === nombreOrganismo)
    ) || null;
  };
  
  // Estado para comandas
  const [comandas, setComandas] = useState<Comanda[]>([]);

  const cargarComandas = () => {
    const comandasCargadas = obtenerComandas();
    setComandas(comandasCargadas);
    return comandasCargadas;
  };

  const handleCerrarModeloComanda = () => {
    setMostrarModeloComanda(false);
    setAbrirEdicionGrupoDirecta(false);
  };
  
  // Cargar comandas desde localStorage
  useEffect(() => {
    cargarComandas();
  }, []);

  const findComandaByScannedData = (rawData: unknown) => {
    const data = normalizeScannedComandaQR(rawData);
    const numeroComanda = data?.comanda;

    if (!numeroComanda) {
      return null;
    }

    return comandas.find(c =>
      (c.numero && c.numero === numeroComanda) ||
      (c.numeroComanda && c.numeroComanda === numeroComanda) ||
      c.id === numeroComanda
    ) || null;
  };

  const findProductByScannedData = (rawData: unknown) => {
    const productData = normalizeScannedProductQR(rawData);
    if (!productData) {
      return null;
    }

    const candidates = [productData.id, productData.codigo, productData.producto, productData.nombre]
      .map(normalizeQrMatch)
      .filter(Boolean);

    if (candidates.length === 0) {
      return null;
    }

    const exactMatch = productosCatalogo.find(producto => {
      const productKeys = [producto.id, producto.codigo, producto.nombre]
        .map(normalizeQrMatch)
        .filter(Boolean);

      return productKeys.some(key => candidates.includes(key));
    });

    if (exactMatch) {
      return exactMatch;
    }

    const legacyCandidate = candidates.find(candidate => candidate.includes('banco-alimentos-'));

    if (!legacyCandidate) {
      return null;
    }

    const scoredMatches = productosCatalogo
      .map(producto => {
        const normalizedId = normalizeQrMatch(producto.id);
        const normalizedCode = normalizeQrMatch(producto.codigo);
        const normalizedName = normalizeQrMatch(producto.nombre);

        let score = 0;

        if (normalizedId && legacyCandidate.includes(normalizedId)) {
          score += 4;
        }

        if (normalizedCode.length >= 5 && legacyCandidate.includes(normalizedCode)) {
          score += 3;
        }

        if (normalizedName.length >= 6 && legacyCandidate.includes(normalizedName)) {
          score += 2;
        }

        return { producto, score };
      })
      .filter(match => match.score > 0)
      .sort((left, right) => right.score - left.score);

    return scoredMatches[0]?.producto || null;
  };

  const openScannedComanda = (comanda: Comanda, numeroComanda: string) => {
    setAbrirEdicionGrupoDirecta(false);
    setComandaSeleccionada(comanda);
    setMostrarModeloComanda(true);
    setEscanerQROpen(false);

    toast.success(
      <div>
        <span className="font-semibold">{t('orders.qrFound')}</span>
        <p className="text-sm text-[#666666]">N° {numeroComanda}</p>
      </div>,
      { duration: 3000 }
    );
  };

  const getComandaNumero = (comanda: Comanda) => comanda.numero || comanda.numeroComanda || comanda.id;

  const actualizarEstadoComandaDesdeQr = (comanda: Comanda, nuevoEstado: string) => {
    const comandaActualizada = { ...comanda, estado: nuevoEstado };
    actualizarComanda(comandaActualizada);

    const comandasActualizadas = cargarComandas();
    return comandasActualizadas.find(item => item.id === comandaActualizada.id) || comandaActualizada;
  };

  const handleScannedComandaAction = (
    comanda: Comanda,
    action = 'ver_detalles',
    numeroComanda = getComandaNumero(comanda)
  ) => {
    switch (action) {
      case 'marcar_entregado': {
        setEscanerQROpen(false);

        try {
          const comandaActualizada = actualizarEstadoComandaDesdeQr(comanda, 'entregada');
          setComandaSeleccionada(comandaActualizada);
          setMostrarModeloComanda(true);
          toast.success(`${t('orders.statusChangedTo')} ${t('orders.delivered')}`);
        } catch (error) {
          console.error('Error al marcar comanda entregada desde QR:', error);
        }

        return;
      }
      case 'gestionar_transporte':
        setEscanerQROpen(false);
        setComandaParaAccion(comanda);
        setDialogProponerFechaOpen(true);
        toast.info('Gestion de livraison ouverte pour cette commande');
        return;
      case 'modificar':
        setEscanerQROpen(false);
        setAbrirEdicionGrupoDirecta(false);
        setComandaSeleccionada(comanda);
        setMostrarModeloComanda(true);
        toast.info(`Commande N° ${numeroComanda} ouverte pour modification`);
        return;
      case 'modificar_grupo':
        setEscanerQROpen(false);
        setAbrirEdicionGrupoDirecta(true);
        setComandaSeleccionada(comanda);
        setMostrarModeloComanda(true);
        toast.info('Distribution de groupe ouverte directement pour modifier la date');
        return;
      case 'cancelar': {
        setEscanerQROpen(false);

        try {
          const comandaActualizada = actualizarEstadoComandaDesdeQr(comanda, 'anulada');
          setComandaSeleccionada(comandaActualizada);
          setMostrarModeloComanda(true);
          toast.success(t('orders.orderCancelled'));
        } catch (error) {
          console.error('Error al anular comanda desde QR:', error);
        }

        return;
      }
      case 'ver_detalles':
      default:
        openScannedComanda(comanda, numeroComanda);
    }
  };

  useEffect(() => {
    const pendingNavigation = readPendingQrNavigation();

    if (!pendingNavigation || pendingNavigation.targetPage !== 'comandas' || pendingNavigation.qrType !== 'comanda') {
      return;
    }
    const data = normalizeScannedComandaQR(pendingNavigation.rawData);
    const numeroComanda = data?.comanda;
    const comandasDisponibles = comandas.length > 0 ? comandas : obtenerComandas();

    if (comandasDisponibles.length === 0) {
      return;
    }

    const comandaEncontrada = comandasDisponibles.find(comanda =>
      (comanda.numero && comanda.numero === numeroComanda) ||
      (comanda.numeroComanda && comanda.numeroComanda === numeroComanda) ||
      comanda.id === numeroComanda
    ) || null;

    if (!numeroComanda || !comandaEncontrada) {
      clearPendingQrNavigation();
      toast.error(
        <div>
          <span className="font-semibold">{t('orders.qrNotFound')}</span>
          <p className="text-sm text-[#666666]">{numeroComanda ? `N° ${numeroComanda}` : t('common.error')}</p>
        </div>,
        { duration: 3000 }
      );
      return;
    }

    clearPendingQrNavigation();
    handleScannedComandaAction(comandaEncontrada, pendingNavigation.action, numeroComanda);
  }, [comandas, t]);

  // useEffect para leer el tab guardado desde CuisinePage
  useEffect(() => {
    const tabGuardado = localStorage.getItem('comandas-tab-activo');
    if (tabGuardado === 'ofertas-cocina') {
      setTabActual('ofertas');
      // Limpiar el localStorage después de usarlo
      localStorage.removeItem('comandas-tab-activo');
    }
  }, []);

  const getEstadoBadge = (estado: string) => {
    const config = {
      pendiente: { bg: 'bg-[#FFC107]', text: t('orders.pending') },
      confirmada: { bg: 'bg-[#7E57C2]', text: 'Acceptée' },
      en_preparacion: { bg: 'bg-[#1E73BE]', text: t('orders.inPreparation') },
      completada: { bg: 'bg-[#4CAF50]', text: t('orders.completed') },
      entregada: { bg: 'bg-[#2E7D32]', text: t('orders.delivered') },
      anulada: { bg: 'bg-[#DC3545]', text: t('orders.cancelled') }
    }[estado] || { bg: 'bg-gray-500', text: estado };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const getModalidadDistribucionBadge = (comanda: Comanda) => {
    const modalidad = resolverModalidadDistribucionComanda(comanda);
    if (modalidad !== 'collation') {
      return null;
    }

    return (
      <Badge className="border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]">
        {obtenerEtiquetaModalidadDistribucion(modalidad)}
      </Badge>
    );
  };

  const estadoVisualConfig: Array<{
    key: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    soft: string;
    border: string;
  }> = [
    {
      key: 'pendiente',
      label: t('orders.pending'),
      description: 'Commandes en attente de validation ou de réponse.',
      icon: Clock,
      accent: '#FFC107',
      soft: 'linear-gradient(135deg, rgba(255, 193, 7, 0.18) 0%, rgba(255, 243, 205, 0.85) 100%)',
      border: 'rgba(255, 193, 7, 0.35)'
    },
    {
      key: 'confirmada',
      label: 'Acceptée',
      description: 'Commandes confirmées par les organismes et prêtes pour le suivi.',
      icon: Check,
      accent: '#7E57C2',
      soft: 'linear-gradient(135deg, rgba(126, 87, 194, 0.16) 0%, rgba(245, 240, 255, 0.95) 100%)',
      border: 'rgba(126, 87, 194, 0.28)'
    },
    {
      key: 'en_preparacion',
      label: t('orders.inPreparation'),
      description: 'Commandes en cours de préparation logistique.',
      icon: Package,
      accent: '#1E73BE',
      soft: 'linear-gradient(135deg, rgba(30, 115, 190, 0.14) 0%, rgba(233, 245, 255, 0.95) 100%)',
      border: 'rgba(30, 115, 190, 0.22)'
    },
    {
      key: 'completada',
      label: t('orders.completed'),
      description: 'Commandes préparées et clôturées côté opération.',
      icon: FileCheck,
      accent: '#4CAF50',
      soft: 'linear-gradient(135deg, rgba(76, 175, 80, 0.16) 0%, rgba(237, 247, 237, 0.95) 100%)',
      border: 'rgba(76, 175, 80, 0.24)'
    },
    {
      key: 'entregada',
      label: t('orders.delivered'),
      description: 'Commandes livrées et visibles dans l’historique final.',
      icon: FileCheck,
      accent: '#2E7D32',
      soft: 'linear-gradient(135deg, rgba(46, 125, 50, 0.16) 0%, rgba(232, 245, 233, 0.98) 100%)',
      border: 'rgba(46, 125, 50, 0.25)'
    },
    {
      key: 'anulada',
      label: t('orders.cancelled'),
      description: 'Commandes annulées, conservées pour traçabilité.',
      icon: Ban,
      accent: '#DC3545',
      soft: 'linear-gradient(135deg, rgba(220, 53, 69, 0.14) 0%, rgba(253, 237, 239, 0.98) 100%)',
      border: 'rgba(220, 53, 69, 0.22)'
    }
  ];

  const calcularMetricasEstado = (comandasEstado: Comanda[]) => {
    const totalProduits = comandasEstado.reduce((sum, comanda) => sum + (comanda.items?.length || 0), 0);
    const totalArticles = comandasEstado.reduce(
      (sum, comanda) => sum + (comanda.items || []).reduce((itemsSum, item) => itemsSum + Number(item.cantidad || 0), 0),
      0
    );
    const organismes = new Set(
      comandasEstado
        .map(comanda => resolverOrganismoComanda(comanda)?.nombre || obtenerNombreOrganismoComanda(comanda))
        .filter(Boolean)
    ).size;
    const prochaineLivraison = comandasEstado
      .map(comanda => comanda.fechaEntrega)
      .filter((fecha): fecha is string => Boolean(fecha))
      .sort((left, right) => new Date(left).getTime() - new Date(right).getTime())[0] || null;

    return {
      totalCommandes: comandasEstado.length,
      totalProduits,
      totalArticles,
      organismes,
      prochaineLivraison,
    };
  };

  const handleCrearComandasGrupo = () => {
    if (selectedOrganismos.length === 0) {
      toast.error(t('orders.selectMinimumOrganism'));
      return;
    }
    if (grupoItems.length === 0 || grupoItems.some(item => !item.productoId || item.cantidad <= 0)) {
      toast.error(t('orders.selectValidProduct'));
      return;
    }
    
    // 📝 REGISTRAR ACTIVIDAD
    registrarActividad(
      'Commandes',
      'crear',
      `${selectedOrganismos.length} commande(s) de groupe créée(s) avec ${grupoItems.length} produit(s)`,
      { 
        numeroOrganismos: selectedOrganismos.length,
        numeroProductos: grupoItems.length,
        fechaEntrega: fechaEntregaGrupo 
      }
    );
    
    toast.success(`${selectedOrganismos.length} ${t('orders.ordersCreatedSuccessfully')}`);
    setComandaGrupoDialogOpen(false);
    setSelectedOrganismos([]);
    setGrupoItems([{ productoId: '', cantidad: 1 }]);
    setFechaEntregaGrupo('');
    setObservacionesGrupo('');
  };

  const handleAddGrupoItem = () => {
    setGrupoItems([...grupoItems, { productoId: '', cantidad: 1 }]);
  };

  const handleRemoveGrupoItem = (index: number) => {
    setGrupoItems(grupoItems.filter((_, i) => i !== index));
  };

  const toggleOrganismo = (organismoId: string) => {
    setSelectedOrganismos(prev => 
      prev.includes(organismoId)
        ? prev.filter(id => id !== organismoId)
        : [...prev, organismoId]
    );
  };

  const toggleTodosOrganismos = () => {
    if (selectedOrganismos.length === mockOrganismos.length) {
      setSelectedOrganismos([]);
    } else {
      setSelectedOrganismos(mockOrganismos.map(o => o.id));
    }
  };

  const handleAgregarDesdeInventario = () => {
    const nuevosItems = Object.entries(cantidadesInventario)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId, cantidad }));
    
    if (nuevosItems.length === 0) {
      toast.error(t('orders.selectValidProduct'));
      return;
    }

    setGrupoItems([...grupoItems, ...nuevosItems]);
    setCantidadesInventario({});
    toast.success(`${nuevosItems.length} ${t('orders.productsAdded')}`);
  };

  const productosFiltrados = mockProductos.filter(p =>
    p.nombre.toLowerCase().includes(searchInventario.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchInventario.toLowerCase())
  );

  const handleCambiarEstado = (nuevoEstado: string) => {
    if (!comandaSeleccionada) {
      return;
    }

    if (!esTransicionEstadoComandaValida(comandaSeleccionada.estado, nuevoEstado)) {
      toast.error(`Transition de statut invalide: ${comandaSeleccionada.estado} → ${nuevoEstado}`);
      return;
    }

    try {
      const comandaActualizada = { ...comandaSeleccionada, estado: nuevoEstado };
      actualizarComanda(comandaActualizada);

      const comandasActualizadas = cargarComandas();
      const comandaPersistida = comandasActualizadas.find(comanda => comanda.id === comandaActualizada.id) || comandaActualizada;
      setComandaSeleccionada(comandaPersistida);
    } catch (error) {
      console.error(error);
      return;
    }
    
    // Obtener el texto traducido del estado
    const estadosMap: Record<string, string> = {
      'pendiente': t('orders.pending'),
      'confirmada': 'Acceptée',
      'en_preparacion': t('orders.inPreparation'),
      'completada': t('orders.completed'),
      'entregada': t('orders.delivered'),
      'anulada': t('orders.cancelled')
    };
    
    const estadoTexto = estadosMap[nuevoEstado] || nuevoEstado;
    
    // 📝 REGISTRAR ACTIVIDAD
    if (comandaSeleccionada) {
      registrarActividad(
        'Commandes',
        'modificar',
        `Commande N° ${comandaSeleccionada.numero || comandaSeleccionada.id} - État changé à "${estadoTexto}"`,
        { 
          comandaId: comandaSeleccionada.id,
          nuevoEstado,
          organismo: obtenerNombreOrganismoComanda(comandaSeleccionada)
        }
      );
    }
    
    toast.success(`${t('orders.statusChangedTo')} ${estadoTexto}`);
  };

  const reconstruirItemsAceptados = (itemsOriginales: ItemComanda[], itemsAceptados: ItemComanda[]) => {
    const aceptadosPorProducto = new Map<string, ItemComanda[]>();

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
        cantidadAceptada,
      };
    });
  };

  const handleAceptarComanda = (itemsAceptados: ItemComanda[], comandaOrigen?: Comanda) => {
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
        estado: (totalAceptado > 0 ? 'confirmada' : 'anulada') as const,
        items: itemsReconstruidos,
        fechaConfirmacion: totalAceptado > 0 ? new Date().toISOString() : undefined,
        fechaModificacion: new Date().toISOString(),
      };

      actualizarComanda(comandaActualizada);
      const comandasActualizadas = cargarComandas();
      const comandaPersistida = comandasActualizadas.find(comanda => comanda.id === comandaActualizada.id) || comandaActualizada;
      setComandaSeleccionada(comandaPersistida);
      toast.success(totalAceptado > 0 ? t('orders.orderAccepted') : t('orders.orderCancelled'), {
        description: totalAceptado > 0
          ? 'Les quantités acceptées ont été confirmées.'
          : 'Aucune quantité acceptée, la commande a été annulée automatiquement.',
      });
      setMostrarModeloComanda(false);
    } catch (error) {
      console.error('Error al aceptar la comanda:', error);
      toast.error('Impossible de valider cette commande.');
    }
  };

  const handleAnularComanda = () => {
    if (comandaSeleccionada) {
      try {
        const comandaActualizada = { ...comandaSeleccionada, estado: 'anulada' };
        actualizarComanda(comandaActualizada);
        cargarComandas();
        setComandaSeleccionada(comandaActualizada);
      } catch (error) {
        console.error(error);
        return;
      }
    }

    // 📝 REGISTRAR ACTIVIDAD
    if (comandaSeleccionada) {
      registrarActividad(
        'Commandes',
        'eliminar',
        `Commande N° ${comandaSeleccionada.numero || comandaSeleccionada.id} annulée - Organisme: ${obtenerNombreOrganismoComanda(comandaSeleccionada)}`,
        { 
          comandaId: comandaSeleccionada.id,
          organismo: obtenerNombreOrganismoComanda(comandaSeleccionada)
        }
      );
    }
    
    toast.success(t('orders.orderCancelled'));
    setMostrarModeloComanda(false);
  };

  const comandasPendientes = comandas.filter(c => c.estado === 'pendiente');
  
  const toggleComandaSeleccionada = (comandaId: string) => {
    setComandasSeleccionadas(prev => 
      prev.includes(comandaId)
        ? prev.filter(id => id !== comandaId)
        : [...prev, comandaId]
    );
  };

  const toggleTodasComandas = () => {
    if (comandasSeleccionadas.length === comandasPendientes.length) {
      setComandasSeleccionadas([]);
    } else {
      setComandasSeleccionadas(comandasPendientes.map(c => c.id));
    }
  };

  const handleNotificarComandas = () => {
    if (comandasSeleccionadas.length === 0) {
      toast.error(t('orders.noOrdersSelected'));
      return;
    }

    if (!confirmacionNotificaciones) {
      toast.error('Veuillez confirmer la vérification avant l\'envoi.');
      return;
    }

    const usuarioSesion = obtenerUsuarioSesion();
    const senderEmail = String(usuarioSesion?.email || '').trim();
    if (!senderEmail) {
      toast.error('Aucun expéditeur connecté', {
        description: 'Connectez-vous avec un utilisateur ayant une adresse email valide.',
      });
      return;
    }

    const comandasObjetivo = comandasPendientes.filter((comanda) => comandasSeleccionadas.includes(comanda.id));
    const destinatarios = Array.from(new Set(
      comandasObjetivo
        .map((comanda) => resolverOrganismoComanda(comanda)?.email)
        .map((email) => String(email || '').trim())
        .filter(Boolean)
    ));

    if (destinatarios.length === 0) {
      toast.error('Aucun organisme sélectionné avec une adresse email valide.');
      return;
    }

    const confirmarEnvio = window.confirm(
      `Vous allez préparer ${comandasObjetivo.length} notification(s) pour ${destinatarios.length} destinataire(s).\n\n` +
      'Une ouverture d\'Outlook sera lancée avant l\'envoi. Voulez-vous continuer ?'
    );

    if (!confirmarEnvio) {
      return;
    }

    const detalleComandas = comandasObjetivo
      .map((comanda) => {
        const organismo = resolverOrganismoComanda(comanda);
        const nombreOrganismo = organismo?.nombre || obtenerNombreOrganismoComanda(comanda) || t('orders.withoutOrganism');
        return `- ${comanda.numero || comanda.id} (${nombreOrganismo})`;
      })
      .join('\n');

    const asunto = `Notifications de commandes prêtes (${comandasObjetivo.length})`;
    const cuerpo = [
      'Bonjour,',
      '',
      'Les commandes suivantes sont prêtes :',
      detalleComandas,
      '',
      'Merci de confirmer la réception dans le portail.',
    ].join('\n');

    const composeUrl = new URL('https://outlook.office.com/mail/deeplink/compose');
    composeUrl.searchParams.set('to', destinatarios.join(';'));
    composeUrl.searchParams.set('subject', asunto);
    composeUrl.searchParams.set('body', cuerpo);
    composeUrl.searchParams.set('from', senderEmail);

    const mailtoTo = encodeURIComponent(destinatarios.join(','));
    const mailtoSubject = encodeURIComponent(asunto);
    const mailtoBody = encodeURIComponent(cuerpo);
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

    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-semibold">{t('orders.sendNotifications')}</span>
        <span className="text-sm text-[#666666]">
          Brouillon Outlook préparé pour {destinatarios.length} {t('organisms.name')}{destinatarios.length !== 1 ? 's' : ''}
        </span>
      </div>,
      { duration: 5000 }
    );
    
    // Mantener el diálogo y la selección para que el usuario termine el envío manual en Outlook.
  };

  // Handler para escanear QR
  const handleScanQR = (rawData: DatosQR, action: string) => {
    console.log('QR escaneado:', rawData, 'Acción:', action);

    const ubicacion = normalizeScannedLocationQR(rawData)?.ubicacion;

    if (ubicacion) {
      setEscanerQROpen(false);
      toast.info(`Emplacement ${ubicacion} détecté. Vous restez dans le module Commandes.`);
      return;
    }

    const data = normalizeScannedComandaQR(rawData);
    const numeroComanda = data?.comanda;

    if (numeroComanda) {
      const comandaEncontrada = findComandaByScannedData(rawData);

      if (comandaEncontrada) {
        handleScannedComandaAction(comandaEncontrada, action, numeroComanda);
        return;
      }
    }

    const producto = findProductByScannedData(rawData);

    if (producto) {
      setEscanerQROpen(false);
      toast.info('Produit détecté. Aucune redirection automatique vers Inventaire depuis Commandes.');
      return;
    }

    if (!numeroComanda) {
      toast.error(
        <div>
          <span className="font-semibold">{t('orders.qrNotFound')}</span>
          <p className="text-sm text-[#666666]">{typeof rawData === 'string' ? rawData : t('common.error')}</p>
        </div>,
        { duration: 3000 }
      );
      return;
    }

    toast.error(
      <div>
        <span className="font-semibold">{t('orders.qrNotFound')}</span>
        <p className="text-sm text-[#666666]">N° {numeroComanda}</p>
      </div>,
      { duration: 3000 }
    );
  };

  // Handlers para gestión de solicitudes de ofertas
  const handleAceptarSolicitud = (ofertaId: string, solicitudId: string, organismoNombre: string) => {
    const exito = aceptarSolicitud(ofertaId, solicitudId);
    if (exito) {
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Commandes',
        'modificar',
        `Demande d'offre acceptée - Organisme: ${organismoNombre}`,
        { ofertaId, solicitudId, organismoNombre }
      );
      
      toast.success(t('orders.requestAcceptedSuccess', { organism: organismoNombre }));
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error(t('orders.errors.acceptError'));
    }
  };

  const handleRechazarSolicitud = (ofertaId: string, solicitudId: string, organismoNombre: string, motivo: string) => {
    if (!motivo || motivo.trim() === '') {
      toast.error(t('orders.errors.rejectReasonRequired'));
      return;
    }
    
    const exito = rechazarSolicitud(ofertaId, solicitudId, motivo);
    if (exito) {
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Commandes',
        'modificar',
        `Demande d'offre refusée - Organisme: ${organismoNombre} - Motif: ${motivo}`,
        { ofertaId, solicitudId, organismoNombre, motivo }
      );
      
      toast.success(t('orders.requestRejectedSuccess', { organism: organismoNombre }));
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error(t('orders.errors.rejectError'));
    }
  };

  const handleMarcarSolicitudEntregada = (ofertaId: string, solicitudId: string, organismoNombre: string) => {
    const exito = marcarSolicitudEntregada(ofertaId, solicitudId);
    if (exito) {
      registrarActividad(
        'Commandes',
        'modificar',
        `Offre livrée - Organisme: ${organismoNombre}`,
        { ofertaId, solicitudId, organismoNombre }
      );

      toast.success(t('orders.requestDeliveredSuccess', { organism: organismoNombre }));
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error('Seules les demandes en préparation peuvent être marquées comme livrées.');
    }
  };

  const handleMarcarSolicitudEnPreparacion = (ofertaId: string, solicitudId: string, organismoNombre: string) => {
    const exito = marcarSolicitudEnPreparacion(ofertaId, solicitudId);
    if (exito) {
      registrarActividad(
        'Commandes',
        'modificar',
        `Offre en préparation - Organisme: ${organismoNombre}`,
        { ofertaId, solicitudId, organismoNombre }
      );

      toast.success(`Demande de ${organismoNombre} passée en préparation.`);
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error('Seules les demandes acceptées peuvent passer en préparation.');
    }
  };

  const handleAnularSolicitud = (ofertaId: string, solicitudId: string, organismoNombre: string) => {
    const exito = anularSolicitud(ofertaId, solicitudId);
    if (exito) {
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Commandes',
        'eliminar',
        `Demande d'offre annulée - Organisme: ${organismoNombre}`,
        { ofertaId, solicitudId, organismoNombre }
      );
      
      toast.success(t('orders.requestCancelledSuccess', { organism: organismoNombre }));
      setRefreshOfertas(prev => prev + 1);
    } else {
      toast.error(t('orders.cancelRequestError'));
    }
  };

  const abrirDialogEditarCaducidadOferta = (oferta: Oferta) => {
    setOfertaEnGestion(oferta);
    setNuevaFechaCaducidadOferta(formatDateInputValue(oferta.fechaExpiracion));
    setDialogEditarCaducidadOfertaOpen(true);
  };

  const handleGuardarNuevaCaducidadOferta = () => {
    if (!ofertaEnGestion || !nuevaFechaCaducidadOferta) {
      toast.error('Veuillez sélectionner une date de caducité valide.');
      return;
    }

    const fechaNueva = new Date(nuevaFechaCaducidadOferta);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (Number.isNaN(fechaNueva.getTime()) || fechaNueva < hoy) {
      toast.error('La nouvelle date de caducité doit être aujourd’hui ou dans le futur.');
      return;
    }

    const exito = actualizarFechaExpiracionOferta(ofertaEnGestion.id, nuevaFechaCaducidadOferta);

    if (!exito) {
      toast.error('Impossible de mettre à jour la date de caducité de l’offre.');
      return;
    }

    registrarActividad(
      'Commandes',
      'modificar',
      `Date de caducité d'offre modifiée - Offre: ${ofertaEnGestion.numeroOferta}`,
      { ofertaId: ofertaEnGestion.id, numeroOferta: ofertaEnGestion.numeroOferta, nuevaFechaCaducidadOferta }
    );

    toast.success('Date de caducité de l’offre mise à jour.');
    setDialogEditarCaducidadOfertaOpen(false);
    setOfertaEnGestion(null);
    setNuevaFechaCaducidadOferta('');
    setRefreshOfertas(prev => prev + 1);
  };

  const abrirDialogAnularOferta = (oferta: Oferta) => {
    setOfertaEnGestion(oferta);
    setDialogAnularOfertaOpen(true);
  };

  const handleConfirmarAnularOferta = () => {
    if (!ofertaEnGestion) {
      return;
    }

    const exito = anularOferta(ofertaEnGestion.id);

    if (!exito) {
      toast.error('Impossible d’annuler l’offre sélectionnée.');
      return;
    }

    registrarActividad(
      'Commandes',
      'eliminar',
      `Offre annulée - Offre: ${ofertaEnGestion.numeroOferta}`,
      { ofertaId: ofertaEnGestion.id, numeroOferta: ofertaEnGestion.numeroOferta }
    );

    toast.success('Offre annulée avec succès.');
    setDialogAnularOfertaOpen(false);
    setOfertaEnGestion(null);
    setRefreshOfertas(prev => prev + 1);
  };
  
  // Función para imprimir etiqueta estandarizada
  const handleImprimirEtiquetaEstandarizada = async (comanda: Comanda, organismo: Organismo) => {
    const numeroEtiqueta = comanda.numero || comanda.numeroComanda || comanda.id;
    const esEtiquetaOferta = numeroEtiqueta.startsWith('SOL-');
    const labelData: EtiquetaComandaData = {
      numeroComanda: numeroEtiqueta,
      fechaEntrega: comanda.fechaEntrega,
      estado: comanda.estado || 'pendiente',
      observaciones: comanda.observaciones,
      items: (comanda.items || []).map((item: ItemComanda) => ({
        nombre: item.nombreProducto || item.productoNombre || t('common.product'),
        icono: item.icono,
        cantidad: item.cantidad,
        unidad: item.unidad,
        peso: item.peso
      })),
      organismoNombre: organismo?.nombre || t('orders.withoutOrganism'),
      organismoTipo: organismo?.tipo,
      organismoDireccion: organismo?.direccion,
      organismoResponsable: organismo?.responsable,
      organismoTelefono: organismo?.telefono,
      horaCita: organismo?.horaCita,
      translations: {
        foodBank: branding.systemName?.trim() || t('common.foodBank') || 'BANQUE ALIMENTAIRE',
        brandSubtitle: esEtiquetaOferta ? 'Système de gestion des offres' : 'Système de gestion des commandes',
        orderLabel: esEtiquetaOferta ? 'Étiquette d\'Offre' : t('commands.orderLabel') || 'Étiquette de Commande',
        orderNumber: esEtiquetaOferta ? 'N° Offre' : t('commands.orderNumber') || 'N° Commande',
        deliveryDate: esEtiquetaOferta ? 'Date de demande' : t('commands.deliveryDate') || 'Livraison',
        status: esEtiquetaOferta ? 'Statut' : t('commands.status') || 'Statut',
        products: esEtiquetaOferta ? 'Produits' : t('commands.products') || 'Produits',
        articles: esEtiquetaOferta ? 'articles' : t('commands.articles') || 'articles',
        productDetailsTitle: esEtiquetaOferta ? 'Produits demandés' : '',
        recipient: esEtiquetaOferta ? 'Organisme demandeur' : t('commands.recipient') || 'Organisme Destinataire',
        name: esEtiquetaOferta ? 'Nom' : t('common.name') || 'Nom',
        type: esEtiquetaOferta ? 'Type' : t('common.type') || 'Type',
        address: esEtiquetaOferta ? 'Adresse' : t('common.address') || 'Adresse',
        responsible: esEtiquetaOferta ? 'Responsable' : t('common.responsible') || 'Responsable',
        phone: esEtiquetaOferta ? 'Téléphone' : t('common.phone') || 'Téléphone',
        observations: esEtiquetaOferta ? 'Observations' : t('common.observations') || 'Observations',
        deliveredBy: esEtiquetaOferta ? 'Préparé par' : t('commands.deliveredBy') || 'Remis par',
        receivedBy: esEtiquetaOferta ? 'Reçu par' : t('commands.receivedBy') || 'Reçu par',
        nameAndSignature: esEtiquetaOferta ? 'Nom et signature' : t('commands.nameAndSignature') || 'Nom et signature',
        printedOn: esEtiquetaOferta ? 'Imprimé le' : t('common.printedOn') || 'Imprimé le',
        systemFooter: esEtiquetaOferta ? 'Système de Gestion des Offres' : t('commands.systemFooter') || 'Système de Gestion des Commandes',
        pending: esEtiquetaOferta ? 'EN ATTENTE' : t('commands.pending') || 'EN ATTENTE',
        confirmed: esEtiquetaOferta ? 'ACCEPTÉE' : 'ACCEPTÉE',
        inPreparation: esEtiquetaOferta ? 'EN PRÉPARATION' : t('commands.inPreparation') || 'EN PRÉPARATION',
        ready: esEtiquetaOferta ? 'PRÊTE' : t('commands.ready') || 'PRÊTE',
        delivered: esEtiquetaOferta ? 'LIVRÉE' : t('commands.delivered') || 'LIVRÉE',
        cancelled: esEtiquetaOferta ? 'ANNULÉE' : t('commands.cancelled') || 'ANNULÉE',
      }
    };

    try {
      flushSync(() => {
        setMostrarModeloComanda(false);
        setMostrarImpresionCompacta(false);
        setDialogVerSolicitudOpen(false);
        setComandaSeleccionada(null);
      });

      await new Promise<void>(resolve => {
        window.requestAnimationFrame(() => resolve());
      });

      await printStandardOrderLabel(labelData);
      toast.success(t('orders.printLabelSuccess'));
    } catch (err) {
      console.error('Error al imprimir etiqueta:', err);
      toast.error(t('orders.printLabelError'));
    }
  };
  
  // Función para imprimir comanda y etiqueta en hojas separadas
  const handleImprimirComandaYEtiqueta = async (comanda: Comanda, organismo: Organismo) => {
    try {
      await printComandaYEtiquetaSeparadas(comanda, organismo);
      toast.success(t('orders.printOrderAndLabelSuccess'));
    } catch (err) {
      console.error('Error al imprimir comanda y etiqueta:', err);
      toast.error(t('orders.printOrderAndLabelError'));
    }
  };

  const handleAbrirImpresionCompacta = (comanda: Comanda) => {
    setComandaSeleccionada(comanda);
    setMostrarModeloComanda(false);
    setMostrarImpresionCompacta(true);
  };
  
  // Función helper para convertir solicitud a formato de comanda para etiqueta e impresión
  const convertirSolicitudAComanda = (solicitud: SolicitudOferta, oferta: Oferta) => {
    // Buscar organismo
    const organismo = obtenerOrganismosReales().find(o => o.id === solicitud.organismoId || o.nombre === solicitud.organismoNombre);
    
    // Convertir productos de la solicitud al formato esperado por EtiquetaComanda
    const items = solicitud.productosAceptados.map(prodAceptado => {
      const productoOferta = oferta.productos.find(p => p.productoId === prodAceptado.productoId);
      return {
        productoId: prodAceptado.productoId,
        nombreProducto: productoOferta?.productoNombre || t('common.product'),
        cantidad: prodAceptado.cantidadAceptada,
        unidad: productoOferta?.unidad || t('orders.units')
      };
    });
    
    // Crear comanda ficticia para la etiqueta
    return {
      id: `SOL-${solicitud.id}`,
      numeroComanda: `SOL-${solicitud.id}`,
      organismoId: organismo?.id || '',
      fechaCreacion: solicitud.fechaSolicitud,
      fechaEntrega: solicitud.fechaSolicitud, // Usar la fecha de solicitud como referencia
      estado: solicitud.estado === 'entregada'
        ? 'entregada'
        : solicitud.estado === 'en_preparacion'
        ? 'en_preparacion'
        : 'confirmada',
      preparadoPor: solicitud.preparadoPor,
      items: items,
      observaciones: solicitud.observaciones || ''
    };
  };

  const getEstadoSolicitudBadge = (estado: string) => {
    const config = {
      pendiente: { bg: 'bg-[#FFC107]', text: t('orders.requestPending') },
      aceptada: { bg: 'bg-[#4CAF50]', text: t('orders.requestAccepted') },
      en_preparacion: { bg: 'bg-[#1E73BE]', text: 'En préparation' },
      entregada: { bg: 'bg-[#1E73BE]', text: t('orders.requestDelivered') },
      rechazada: { bg: 'bg-[#DC3545]', text: t('orders.requestRejected') },
      anulada: { bg: 'bg-[#666666]', text: t('orders.requestCancelled') }
    }[estado] || { bg: 'bg-gray-500', text: estado };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const comandasFiltradas = comandas.filter(comanda => {
    const organismo = resolverOrganismoComanda(comanda);
    const cumpleBusqueda = filterByThreeLettersMultiple(
      [comanda.id, comanda.numero || '', organismo?.nombre || obtenerNombreOrganismoComanda(comanda)],
      searchTerm
    );
    const cumpleEstado = estadoFiltro === 'todos' || comanda.estado === estadoFiltro;
    return cumpleBusqueda && cumpleEstado;
  });

  const totalComandas = comandas.length;
  const comandasDistribuidasFiltradas = comandasFiltradas.filter(comanda => comanda.estado !== 'anulada');
  const comandasActivas = comandas.filter(c => c.estado !== 'anulada' && c.estado !== 'entregada' && c.estado !== 'confirmada').length;
  const comandasPendientesCount = comandas.filter(c => c.estado === 'pendiente').length;
  const comandasAceptadasCount = comandas.filter(c => c.estado === 'confirmada').length;
  const comandasCompletadas = comandas.filter(c => c.estado === 'entregada').length;
  const comandasAgrupadasPorEstado = estadoVisualConfig
    .filter(estado => estadoFiltro === 'todos' || estado.key === estadoFiltro)
    .map(estado => ({
      ...estado,
      comandas: comandasFiltradas.filter(comanda => comanda.estado === estado.key)
    }))
    .map(grupo => ({
      ...grupo,
      metricas: calcularMetricasEstado(grupo.comandas)
    }));
  const ofertasFiltradas = ofertas.filter(oferta => {
    if (estadoFiltroOferta === 'todos') return true;
    if (estadoFiltroOferta === 'pendientes') return (oferta.solicitudes?.length || 0) === 0 && oferta.activa;
    if (estadoFiltroOferta === 'con_solicitudes') return (oferta.solicitudes?.length || 0) > 0;
    if (estadoFiltroOferta === 'entregadas') {
      return (oferta.solicitudes || []).some(solicitud => solicitud.estado === 'entregada');
    }
    if (estadoFiltroOferta === 'activas') return oferta.activa && new Date(oferta.fechaExpiracion) > new Date();
    if (estadoFiltroOferta === 'expiradas') return !oferta.activa || new Date(oferta.fechaExpiracion) < new Date();
    return true;
  });
  const ofertasConSolicitudes = ofertasFiltradas.filter(oferta => (oferta.solicitudes?.length || 0) > 0).length;
  const ofertasExpiradasCount = ofertasFiltradas.filter(oferta => !oferta.activa || new Date(oferta.fechaExpiracion) < new Date()).length;
  const solicitudesOfertaCount = ofertasFiltradas.reduce((sum, oferta) => sum + (oferta.solicitudes?.length || 0), 0);
  const ordersTabLabels: Record<string, string> = {
    comandas: t('nav.orders'),
    ofertas: t('nav.offers'),
  };
  const ordersExecutiveMetrics = [
    {
      id: 'active-view',
      label: t('orders.executive.metrics.activeView'),
      value: ordersTabLabels[tabActual] || t('nav.orders'),
      helper: tabActual === 'comandas'
        ? t('orders.executive.metrics.ordersHelper')
        : t('orders.executive.metrics.offersHelper'),
      icon: <FileCheck className="h-4 w-4" />,
      accentColor: branding.primaryColor,
    },
    {
      id: 'pending-orders',
      label: t('orders.executive.metrics.pending'),
      value: comandasPendientesCount,
      helper: comandasPendientesCount > 0
        ? t('orders.executive.metrics.pendingBusy')
        : t('orders.executive.metrics.pendingClear'),
      icon: <Bell className="h-4 w-4" />,
      accentColor: '#f59e0b',
    },
    {
      id: 'distributed-list',
      label: t('orders.executive.metrics.distributable'),
      value: comandasDistribuidasFiltradas.length,
      helper: t('orders.executive.metrics.distributableHelper'),
      icon: <Package className="h-4 w-4" />,
      accentColor: branding.secondaryColor,
    },
    {
      id: 'offers-demand',
      label: t('orders.executive.metrics.offerRequests'),
      value: solicitudesOfertaCount,
      helper: ofertasConSolicitudes > 0
        ? t('orders.executive.metrics.offerRequestsActive', { count: ofertasConSolicitudes })
        : t('orders.executive.metrics.offerRequestsIdle'),
      icon: <Tag className="h-4 w-4" />,
      accentColor: '#7c3aed',
    },
  ];

  if (mostrarImpresionCompacta && comandaSeleccionada) {
    const organismo = resolverOrganismoComanda(comandaSeleccionada);
    return (
      <ComandaCompletaImprimible
        comanda={comandaSeleccionada}
        organismo={organismo}
        onClose={() => {
          setMostrarImpresionCompacta(false);
          setComandaSeleccionada(null);
        }}
      />
    );
  }

  if (mostrarModeloComanda && comandaSeleccionada) {
    const organismo = resolverOrganismoComanda(comandaSeleccionada);
    return (
      <ModeloComanda
        comanda={comandaSeleccionada}
        organismo={organismo}
        mostrar={mostrarModeloComanda}
        onCerrar={handleCerrarModeloComanda}
        onAbrirImpresionCompacta={() => handleAbrirImpresionCompacta(comandaSeleccionada)}
        onCambiarEstado={handleCambiarEstado}
        onAceptarComanda={handleAceptarComanda}
        onAnularComanda={handleAnularComanda}
        onComandaActualizada={(comandaActualizada) => {
          setComandaSeleccionada(comandaActualizada);
          setComandas((prev) => prev.map((item) => item.id === comandaActualizada.id ? comandaActualizada : item));
        }}
        abrirEdicionGrupoInicial={abrirEdicionGrupoDirecta}
      />
    );
  }

  return (
    <div 
      className="min-h-[calc(100vh-56px)] p-2.5 sm:p-3 lg:p-4 space-y-3 sm:space-y-4 relative overflow-hidden"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)',
        ...(ordersViewportZoom < 1 ? { zoom: ordersViewportZoom } : {}),
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
      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Alerta de comandas urgentes */}
        <AlertaComandasUrgentes />

        <ModulePageHeader
          title={t('orders.title')}
          subtitle={t('orders.subtitle')}
          icon={<FileCheck className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
          accentColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
        />

        <ModuleExecutiveStrip
          eyebrow={t('orders.executive.eyebrow')}
          title={t('orders.executive.title')}
          description={t('orders.executive.description')}
          accentColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
          metrics={ordersExecutiveMetrics}
          actions={(
            <>
              <Button variant="outline" onClick={() => setTabActual('comandas')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                <FileCheck className="mr-2 h-4 w-4" />
                {t('orders.executive.actions.orders')}
              </Button>
              {tabActual !== 'comandas' && (
                <Button variant="outline" onClick={() => setDialogListaDistribuidosOpen(true)} disabled={comandasDistribuidasFiltradas.length === 0} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white disabled:bg-white/60">
                  <Package className="mr-2 h-4 w-4" />
                  {t('orders.executive.actions.distributedList')}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmacionNotificaciones(false);
                  setDialogNotificacionOpen(true);
                }}
                className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white"
              >
                <Bell className="mr-2 h-4 w-4" />
                {t('orders.executive.actions.notifications')}
              </Button>
              <Button variant="outline" onClick={() => setTabActual('ofertas')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                <Tag className="mr-2 h-4 w-4" />
                {t('orders.executive.actions.offers')}
              </Button>
              <Button onClick={() => setEscanerQROpen(true)} className="text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}>
                <QrCode className="mr-2 h-4 w-4" />
                {t('orders.executive.actions.qrScanner')}
              </Button>
            </>
          )}
        />

        <ModuleStatsGrid
          compact={isCompactOrdersViewport}
          compactLayout="grid grid-cols-5 gap-2"
          defaultLayout="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <ModuleStatCard
            label={t('orders.totalOrders')}
            value={totalComandas}
            icon={<FileCheck className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor={branding.primaryColor}
          />
          <ModuleStatCard
            label={t('orders.activeOrders')}
            value={comandasActivas}
            icon={<Eye className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor={branding.secondaryColor}
          />
          <ModuleStatCard
            label={t('orders.pendingOrders')}
            value={comandasPendientesCount}
            icon={<Printer className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor="#FFC107"
            valueColor="#FFC107"
          />
          <ModuleStatCard
            label={t('orders.acceptedOrders')}
            value={comandasAceptadasCount}
            icon={<Check className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor="#7E57C2"
            valueColor="#7E57C2"
          />
          <ModuleStatCard
            label={t('orders.completedOrders')}
            value={comandasCompletadas}
            icon={<FileCheck className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor="#2E7D32"
            valueColor="#2E7D32"
          />
        </ModuleStatsGrid>

        {/* Tabs: Comandas y Ofertas - Con glassmorphism */}
        <ModuleControlSurface>
          <Tabs value={tabActual} onValueChange={setTabActual}>
            <ModuleControlSurfaceTabs>
              <TabsList className="app-compact-tabs-grid w-full gap-1 bg-transparent p-0">
                <TabsTrigger value="comandas" className="app-compact-tab-trigger flex items-center gap-2 min-h-8 px-2 py-1.5 text-[11px]">
                  <Package className="w-4 h-4" />
                  {t('orders.title')}
                </TabsTrigger>
                <TabsTrigger value="ofertas" className="app-compact-tab-trigger flex items-center gap-2 min-h-8 px-2 py-1.5 text-[11px]">
                  <Tag className="w-4 h-4" />
                  {t('orders.offersRequestsTab')}
                </TabsTrigger>
              </TabsList>
            </ModuleControlSurfaceTabs>

          {/* TAB: COMANDAS */}
          <TabsContent value="comandas" className="mt-0">
            <ModuleControlSurfaceBody className="space-y-3">
            {/* Búsqueda y filtros */}
          <div className="app-compact-filters">
            <div className="flex-1">
              <Input
                placeholder={searchByNumberPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder={t('orders.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{t('orders.allStatuses')}</SelectItem>
                <SelectItem value="pendiente">{t('orders.pending')}</SelectItem>
                <SelectItem value="confirmada">Acceptée</SelectItem>
                <SelectItem value="en_preparacion">{t('orders.inPreparation')}</SelectItem>
                <SelectItem value="completada">{t('orders.completed')}</SelectItem>
                <SelectItem value="entregada">{t('orders.delivered')}</SelectItem>
                <SelectItem value="anulada">{t('orders.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setDialogListaDistribuidosOpen(true)}
              disabled={comandasDistribuidasFiltradas.length === 0}
              className="whitespace-nowrap h-9 text-xs"
            >
              <Package className="w-4 h-4 mr-2" />
              Liste de distributions
            </Button>
          </div>

          <Card className="overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl">
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2
                    className="text-base sm:text-lg font-semibold"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    Vue compacte par état des commandes
                  </h2>
                  <p className="text-xs sm:text-sm text-[#666666]">
                    Tous les états visibles dans une lecture plus dense, sans perdre les détails opérationnels.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center rounded-full border border-[#dbe4ee] bg-white p-0.5 shadow-sm">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setVistaCompactaComandas(true)}
                      className={`h-7 rounded-full px-2.5 text-[11px] ${vistaCompactaComandas ? 'bg-[#1E73BE] text-white hover:bg-[#1E73BE] hover:text-white' : 'text-[#516071] hover:bg-[#f8fafc]'}`}
                    >
                      <Rows3 className="mr-1.5 h-3.5 w-3.5" />
                      Compact
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setVistaCompactaComandas(false)}
                      className={`h-7 rounded-full px-2.5 text-[11px] ${!vistaCompactaComandas ? 'bg-[#0f172a] text-white hover:bg-[#0f172a] hover:text-white' : 'text-[#516071] hover:bg-[#f8fafc]'}`}
                    >
                      <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                      Confort
                    </Button>
                  </div>
                  {comandasAgrupadasPorEstado.map((grupo) => (
                    <div
                      key={`resume-${grupo.key}`}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm"
                      style={{
                        color: grupo.accent,
                        background: grupo.soft,
                        border: `1px solid ${grupo.border}`
                      }}
                    >
                      {grupo.label}: {grupo.comandas.length}
                    </div>
                  ))}
                </div>
              </div>

              {comandasFiltradas.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#d0d7de] bg-[#f8fafc]/90 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <Package className="mx-auto mb-3 h-10 w-10 text-[#9aa4b2]" />
                  <p className="text-sm font-medium text-[#334155]">Aucune commande ne correspond aux filtres actuels.</p>
                  <p className="mt-1 text-xs text-[#64748b]">Essayez une autre recherche ou changez le statut sélectionné.</p>
                </div>
              ) : (
                <div
                  className="grid gap-3 lg:gap-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
                >
                  {comandasAgrupadasPorEstado.map((grupo) => {
                    const EstadoIcon = grupo.icon;

                    return (
                      <div
                        key={grupo.key}
                        className="overflow-hidden rounded-[26px] border border-white/75 shadow-[0_24px_56px_-38px_rgba(15,45,71,0.24)] backdrop-blur-xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.92)',
                          borderColor: grupo.border,
                          boxShadow: `0 24px 56px -38px ${grupo.accent}35`
                        }}
                      >
                        <div
                          className="border-b px-3.5 py-3"
                          style={{
                            background: grupo.soft,
                            borderColor: grupo.border
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
                                style={{ backgroundColor: grupo.accent }}
                              >
                                <EstadoIcon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-[#1f2937]">{grupo.label}</h3>
                                <p className="mt-0.5 text-[11px] leading-4 text-[#5b6472]">{grupo.description}</p>
                              </div>
                            </div>
                            <div
                              className="rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{
                                color: grupo.accent,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              {grupo.metricas.totalCommandes}
                            </div>
                          </div>
                          <div className={`mt-3 grid ${vistaCompactaComandas ? 'grid-cols-4 gap-1' : 'grid-cols-2 gap-1.5'}`}>
                            <div className="rounded-lg bg-white/70 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">Articles</p>
                              <p className="mt-0.5 text-xs font-semibold text-[#111827]">{formatNumberSimple(grupo.metricas.totalArticles)}</p>
                            </div>
                            <div className="rounded-lg bg-white/70 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">Organismes</p>
                              <p className="mt-0.5 text-xs font-semibold text-[#111827]">{formatNumberSimple(grupo.metricas.organismes)}</p>
                            </div>
                            <div className="rounded-lg bg-white/70 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">Produits</p>
                              <p className="mt-0.5 text-xs font-semibold text-[#111827]">{formatNumberSimple(grupo.metricas.totalProduits)}</p>
                            </div>
                            <div className="rounded-lg bg-white/70 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-[#6b7280]">Prochaine</p>
                              <p className="mt-0.5 text-xs font-semibold text-[#111827]">
                                {grupo.metricas.prochaineLivraison ? formatLocalizedDate(grupo.metricas.prochaineLivraison) : '--'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={`max-h-[60vh] overflow-y-auto p-3 ${vistaCompactaComandas ? 'space-y-1.5' : 'space-y-2'}`}>
                          {grupo.comandas.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-4 text-center text-xs text-[#7b8794]">
                              Aucun élément dans cet état.
                            </div>
                          ) : (
                            grupo.comandas.map((comanda) => {
                              const organismo = resolverOrganismoComanda(comanda);
                              const fechaRendezVous = comanda.fechaEntrega ? formatLocalizedDate(comanda.fechaEntrega) : '';
                              const horaRendezVous = organismo?.horaCita || '';
                              const rendezVousTexte = fechaRendezVous && horaRendezVous
                                ? `${fechaRendezVous} • ${horaRendezVous}`
                                : fechaRendezVous || horaRendezVous || '--';

                              return (
                                <div
                                  key={comanda.id}
                                  className={`rounded-[22px] border border-white/75 bg-white/92 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_-30px_rgba(15,23,42,0.18)] ${vistaCompactaComandas ? 'p-2.5' : 'p-3'}`}
                                  style={{ boxShadow: '0 14px 30px -28px rgba(15, 23, 42, 0.16)' }}
                                >
                                  {vistaCompactaComandas ? (
                                    <>
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="truncate text-[13px] font-bold leading-5 text-[#0f172a]">
                                              {organismo?.nombre || obtenerNombreOrganismoComanda(comanda) || t('orders.withoutOrganism')}
                                            </p>
                                            <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#475569]">
                                              {comanda.numero || comanda.id}
                                            </span>
                                          </div>
                                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#64748b]">
                                            <span>{rendezVousTexte}</span>
                                            <span className="text-[#cbd5e1]">•</span>
                                            <span>{comanda.items?.length || 0} {t('inventory.products')}</span>
                                          </div>
                                          {comanda.preparadoPor && ['en_preparacion', 'completada', 'entregada'].includes(comanda.estado) && (
                                            <p className="mt-1 text-[11px] font-medium text-[#0f766e]">
                                              Préparée par : {comanda.preparadoPor}
                                            </p>
                                          )}
                                        </div>
                                        <div className="shrink-0">
                                          {getEstadoBadge(comanda.estado)}
                                        </div>
                                      </div>

                                      {(comanda.grupoDistribucionAnclada || comanda.fechaCaducidadGrupo || resolverModalidadDistribucionComanda(comanda) === 'collation') && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {getModalidadDistribucionBadge(comanda)}
                                          {comanda.grupoDistribucionAnclada && (
                                            <Badge className="border border-[#1E73BE]/20 bg-[#EAF4FF] text-[#1E73BE] hover:bg-[#EAF4FF]">
                                              Distribution ancrée
                                            </Badge>
                                          )}
                                          {comanda.fechaCaducidadGrupo && (
                                            <Badge className="border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]">
                                              Péremption: {formatLocalizedDate(comanda.fechaCaducidadGrupo)}
                                            </Badge>
                                          )}
                                        </div>
                                      )}

                                      <div className="mt-2 flex items-center justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setComandaSeleccionada(comanda);
                                            setMostrarModeloComanda(true);
                                          }}
                                          title={t('orders.viewOrder')}
                                          className="h-7 px-2 text-[11px] text-[#334155] hover:bg-[#f8fafc]"
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleAbrirImpresionCompacta(comanda)}
                                          title={t('orders.printOrder')}
                                          className="h-7 px-2 text-[11px] text-[#2E7D32] hover:bg-[#eef8ef] hover:text-[#2E7D32]"
                                        >
                                          <Printer className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const organismo = resolverOrganismoComanda(comanda);
                                            handleImprimirEtiquetaEstandarizada(comanda, organismo);
                                          }}
                                          title={t('orders.printLabelTitle')}
                                          className="h-7 px-2 text-[11px] text-[#1E73BE] hover:bg-[#edf5ff] hover:text-[#1E73BE]"
                                        >
                                          <Tag className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 space-y-0.5">
                                          <p className="whitespace-normal break-words text-sm font-bold leading-5 text-[#0f172a]">
                                            {organismo?.nombre || obtenerNombreOrganismoComanda(comanda) || t('orders.withoutOrganism')}
                                          </p>
                                          <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                                            <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 font-semibold tracking-wide text-[#475569]">
                                              {comanda.numero || comanda.id}
                                            </span>
                                          </div>
                                          {(comanda.grupoDistribucionAnclada || comanda.fechaCaducidadGrupo || resolverModalidadDistribucionComanda(comanda) === 'collation') && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                              {getModalidadDistribucionBadge(comanda)}
                                              {comanda.grupoDistribucionAnclada && (
                                                <Badge className="border border-[#1E73BE]/20 bg-[#EAF4FF] text-[#1E73BE] hover:bg-[#EAF4FF]">
                                                  Distribution ancrée
                                                </Badge>
                                              )}
                                              {comanda.fechaCaducidadGrupo && (
                                                <Badge className="border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]">
                                                  Péremption: {formatLocalizedDate(comanda.fechaCaducidadGrupo)}
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        {getEstadoBadge(comanda.estado)}
                                      </div>

                                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-lg bg-[#f8fafc] px-2.5 py-2">
                                          <p className="text-[10px] uppercase tracking-wide text-[#64748b]">Rendez-vous</p>
                                          <p className="mt-0.5 font-medium text-[#1e293b]">
                                            {rendezVousTexte}
                                          </p>
                                        </div>
                                        <div className="rounded-lg bg-[#f8fafc] px-2.5 py-2">
                                          <p className="text-[10px] uppercase tracking-wide text-[#64748b]">Produits</p>
                                          <p className="mt-0.5 font-medium text-[#1e293b]">
                                            {comanda.items?.length || 0} {t('inventory.products')}
                                          </p>
                                        </div>
                                      </div>
                                      {comanda.preparadoPor && ['en_preparacion', 'completada', 'entregada'].includes(comanda.estado) && (
                                        <div className="mt-2 rounded-lg bg-[#ecfeff] px-2.5 py-2 text-xs text-[#0f766e]">
                                          <span className="font-semibold">Préparée par :</span> {comanda.preparadoPor}
                                        </div>
                                      )}

                                      <div className="mt-3 flex flex-wrap gap-1.5">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setComandaSeleccionada(comanda);
                                            setMostrarModeloComanda(true);
                                          }}
                                          title={t('orders.viewOrder')}
                                          className="h-8 border-[#dbe4ee] bg-white px-2.5 text-[11px] hover:bg-[#f8fafc]"
                                        >
                                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                                          Ouvrir
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAbrirImpresionCompacta(comanda)}
                                          title={t('orders.printOrder')}
                                          className="h-8 border-[#dbe4ee] bg-white px-2.5 text-[11px] text-[#2E7D32] hover:bg-[#eef8ef] hover:text-[#2E7D32]"
                                        >
                                          <Printer className="mr-1.5 h-3.5 w-3.5" />
                                          Imprimer
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const organismo = resolverOrganismoComanda(comanda);
                                            handleImprimirEtiquetaEstandarizada(comanda, organismo);
                                          }}
                                          title={t('orders.printLabelTitle')}
                                          className="h-8 border-[#dbe4ee] bg-white px-2.5 text-[11px] text-[#1E73BE] hover:bg-[#edf5ff] hover:text-[#1E73BE]"
                                        >
                                          <Tag className="mr-1.5 h-3.5 w-3.5" />
                                          Étiquette
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
            </ModuleControlSurfaceBody>
        </TabsContent>

        {/* TAB: OFERTAS */}
        <TabsContent value="ofertas" className="mt-0">
          <ModuleControlSurfaceBody className="space-y-4">
          <Card className="overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl">
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2
                    className="text-base sm:text-lg font-semibold"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                  >
                    Vue compacte des offres et demandes
                  </h2>
                  <p className="text-xs sm:text-sm text-[#666666]">
                    Suivi harmonisé des offres actives, des demandes reçues et des échéances sans changer de contexte.
                  </p>
                </div>
                <div className="app-compact-filters">
                  <Select value={estadoFiltroOferta} onValueChange={setEstadoFiltroOferta}>
                    <SelectTrigger className="w-[250px] h-9 text-xs">
                      <SelectValue placeholder={tFr('orders.offerStatusFilter')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">{tFr('orders.allOffers')}</SelectItem>
                      <SelectItem value="pendientes">{tFr('orders.pending')}</SelectItem>
                      <SelectItem value="con_solicitudes">{tFr('orders.withRequests')}</SelectItem>
                      <SelectItem value="entregadas">{tFr('orders.deliveredOffers')}</SelectItem>
                      <SelectItem value="activas">{tFr('orders.activeOffers')}</SelectItem>
                      <SelectItem value="expiradas">{tFr('orders.expiredOffers')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <div className="rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm" style={{ color: branding.primaryColor, background: `${branding.primaryColor}15`, border: `1px solid ${branding.primaryColor}30` }}>
                  Offres visibles: {ofertasFiltradas.length}
                </div>
                <div className="rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm" style={{ color: branding.secondaryColor, background: `${branding.secondaryColor}15`, border: `1px solid ${branding.secondaryColor}30` }}>
                  Avec demandes: {ofertasConSolicitudes}
                </div>
                <div className="rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm" style={{ color: '#b45309', background: '#fff7e8', border: '1px solid #fcd34d' }}>
                  Demandes: {solicitudesOfertaCount}
                </div>
                <div className="rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca' }}>
                  Expirées: {ofertasExpiradasCount}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de ofertas con sus solicitudes */}
          <div className="space-y-4">
            {ofertasFiltradas.map(oferta => {
                const totalSolicitudes = oferta.solicitudes?.length || 0;
                const fechaExpiracion = new Date(oferta.fechaExpiracion);
                const estaAnulada = oferta.estado === 'anulada';
                const estaExpirada = !estaAnulada && (!oferta.activa || fechaExpiracion < new Date());
                const ofertaBloqueada = estaAnulada || estaExpirada;
                const diasRestantes = Math.ceil((fechaExpiracion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={oferta.id} className={`overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl ${ofertaBloqueada ? 'opacity-70' : ''}`}>
                    <CardContent className="pt-5">
                      <div className="space-y-4">
                        {/* Header de la oferta */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Tag className="w-5 h-5 text-[#FFC107]" />
                              <h3 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                                {oferta.titulo}
                              </h3>
                            </div>
                            <p className="text-xs text-[#666666] mb-1">{oferta.numeroOferta}</p>
                            {oferta.descripcion && (
                              <p className="text-sm text-[#666666]">{oferta.descripcion}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={estaAnulada ? 'bg-[#64748b]' : estaExpirada ? 'bg-[#DC3545]' : diasRestantes <= 3 ? 'bg-[#FFC107]' : 'bg-[#4CAF50]'}>
                              {estaAnulada
                                ? 'Annulée'
                                : estaExpirada
                                ? tFr('orders.expired')
                                : tFr('orders.expiresOn', { date: formatFrenchDate(oferta.fechaExpiracion) })}
                            </Badge>
                            {totalSolicitudes > 0 && (
                              <Badge className="bg-[#1E73BE]">
                                {totalSolicitudes} {totalSolicitudes === 1 ? tFr('orders.requestCountSingular') : tFr('orders.requestCountPlural')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 border-t border-[#e5edf5] pt-4">
                          {!estaAnulada && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                              onClick={() => abrirDialogEditarCaducidadOferta(oferta)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Modifier l'échéance
                            </Button>
                          )}
                          {!estaAnulada && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                              onClick={() => abrirDialogAnularOferta(oferta)}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Annuler l'offre
                            </Button>
                          )}
                        </div>

                        {/* Productos de la oferta */}
                        <div className="rounded-[22px] border border-white/75 bg-[#f8fbff]/92 p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.16)]">
                          <h4 className="font-semibold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {tFr('orders.offeredProducts')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {sortByTemperature(
                              oferta.productos,
                              producto => {
                                const productoCatalogo = productosCatalogoMap.get(producto.productoId);
                                return (producto as { temperaturaAlmacenamiento?: string; temperatura?: string }).temperaturaAlmacenamiento ||
                                  (producto as { temperatura?: string }).temperatura ||
                                  productoCatalogo?.temperaturaAlmacenamiento ||
                                  (productoCatalogo as { temperatura?: string } | undefined)?.temperatura;
                              },
                              (a, b) => String(a.productoNombre || '').localeCompare(String(b.productoNombre || ''), currentLocale || 'fr')
                            ).map((producto, idx) => {
                              const cantidadReservada = producto.cantidadOfrecida - producto.cantidadDisponible;
                              const porcentajeDisponible = (producto.cantidadDisponible / producto.cantidadOfrecida) * 100;
                              
                              return (
                                <div key={`${oferta.id}-producto-${producto.productoId}-${idx}`} className="rounded-[20px] border border-white/80 bg-white/92 p-3 shadow-[0_14px_30px_-26px_rgba(15,45,71,0.14)]">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{producto.icono}</span>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-[#333333]">{producto.productoNombre}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-[#666666]">{tFr('orders.available')}</span>
                                      <span className="font-semibold text-[#4CAF50]">
                                        {producto.cantidadDisponible} / {producto.cantidadOfrecida} {producto.unidad}
                                      </span>
                                    </div>
                                    {cantidadReservada > 0 && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-[#666666]">{tFr('orders.reserved')}</span>
                                        <span className="font-semibold text-[#FFC107]">
                                          {cantidadReservada} {producto.unidad}
                                        </span>
                                      </div>
                                    )}
                                    {/* Barra de progreso */}
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                      <div
                                        className="h-2 rounded-full transition-all"
                                        style={{
                                          width: `${porcentajeDisponible}%`,
                                          backgroundColor: porcentajeDisponible > 50 ? '#4CAF50' : porcentajeDisponible > 20 ? '#FFC107' : '#DC3545'
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Solicitudes de la oferta */}
                        {totalSolicitudes > 0 && (
                          <div className="border-t border-[#e5edf5] pt-4">
                            <h4 className="font-semibold text-[#333333] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              <Users className="w-4 h-4 text-[#1E73BE]" />
                              {tFr('orders.requestsReceived')} ({totalSolicitudes})
                            </h4>
                            <div className="space-y-2">
                              {oferta.solicitudes?.map((solicitud, idx) => {
                                // Calcular totales de la solicitud
                                const totalKilos = solicitud.productosAceptados.reduce((sum, p) => {
                                  const producto = oferta.productos.find(prod => prod.productoId === p.productoId);
                                  return sum + (producto?.peso || 0) * p.cantidadAceptada;
                                }, 0);
                                
                                const totalValor = solicitud.productosAceptados.reduce((sum, p) => {
                                  const producto = oferta.productos.find(prod => prod.productoId === p.productoId);
                                  return sum + (producto?.valorUnitario || 0) * (producto?.peso || 0) * p.cantidadAceptada;
                                }, 0);

                                return (
                                  <div key={`${oferta.id}-solicitud-${solicitud.id}`} className="rounded-xl border border-[#cfe2ff] bg-[#eff6ff] p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <p className="font-semibold text-[#333333]">{solicitud.organismoNombre}</p>
                                        <p className="text-xs text-[#666666]">
                                          {formatFrenchDate(solicitud.fechaSolicitud, { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                        {solicitud.preparadoPor && (solicitud.estado === 'en_preparacion' || solicitud.estado === 'entregada') && (
                                          <p className="mt-1 text-xs font-medium text-[#0f766e]">
                                            Préparée par : {solicitud.preparadoPor}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getEstadoSolicitudBadge(solicitud.estado)}
                                      </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    {solicitud.estado === 'pendiente' && (
                                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <Button
                                          size="sm"
                                          className="flex-1 bg-[#4CAF50] hover:bg-[#45A049]"
                                          disabled={ofertaBloqueada}
                                          onClick={() => handleAceptarSolicitud(oferta.id, solicitud.id, solicitud.organismoNombre)}
                                        >
                                          <Check className="w-4 h-4 mr-1" />
                                          {tFr('orders.accept')}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="flex-1"
                                          onClick={() => {
                                            const motivo = prompt(t('orders.rejectReasonPrompt'));
                                            if (motivo) {
                                              handleRechazarSolicitud(oferta.id, solicitud.id, solicitud.organismoNombre, motivo);
                                            }
                                          }}
                                        >
                                          <X className="w-4 h-4 mr-1" />
                                          {tFr('orders.reject')}
                                        </Button>
                                      </div>
                                    )}

                                    {(solicitud.estado === 'aceptada' || solicitud.estado === 'en_preparacion') && (
                                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                                          onClick={() => {
                                            setSolicitudSeleccionada(solicitud);
                                            setOfertaParaSolicitud(oferta);
                                            setDialogVerSolicitudOpen(true);
                                          }}
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          {tFr('orders.view')}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                                          onClick={() => {
                                            const comandaConvertida = convertirSolicitudAComanda(solicitud, oferta);
                                            const organismo = obtenerOrganismosReales().find(o => o.id === comandaConvertida.organismoId);
                                            handleImprimirEtiquetaEstandarizada(comandaConvertida, organismo);
                                          }}
                                        >
                                          <Printer className="w-4 h-4 mr-1" />
                                          {tFr('orders.print')}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-white"
                                          onClick={() => {
                                            const comandaConvertida = convertirSolicitudAComanda(solicitud, oferta);
                                            setComandaParaAccion(comandaConvertida);
                                            setDialogProponerFechaOpen(true);
                                          }}
                                        >
                                          <Calendar className="w-4 h-4 mr-1" />
                                          {tFr('orders.proposeDate')}
                                        </Button>
                                        {solicitud.estado === 'aceptada' && (
                                          <Button
                                            size="sm"
                                            className="flex-1 bg-[#1E73BE] hover:bg-[#175a95]"
                                            onClick={() => handleMarcarSolicitudEnPreparacion(oferta.id, solicitud.id, solicitud.organismoNombre)}
                                          >
                                            <Package className="w-4 h-4 mr-1" />
                                            En préparation
                                          </Button>
                                        )}
                                        {solicitud.estado === 'en_preparacion' && (
                                          <Button
                                            size="sm"
                                            className="flex-1 bg-[#0f766e] hover:bg-[#115e59]"
                                            onClick={() => handleMarcarSolicitudEntregada(oferta.id, solicitud.id, solicitud.organismoNombre)}
                                          >
                                            <FileCheck className="w-4 h-4 mr-1" />
                                            {tFr('orders.markDelivered')}
                                          </Button>
                                        )}
                                      </div>
                                    )}

                                    {(solicitud.estado === 'aceptada' || solicitud.estado === 'en_preparacion') && (
                                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => handleAnularSolicitud(oferta.id, solicitud.id, solicitud.organismoNombre)}
                                        >
                                          <Ban className="w-4 h-4 mr-1" />
                                          {tFr('orders.cancelOrder')}
                                        </Button>
                                      </div>
                                    )}

                                    {solicitud.estado === 'entregada' && (
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-sm text-green-800">
                                        {solicitud.fechaActualizacion
                                          ? t('orders.offerDeliveredOn', {
                                              date: formatLocalizedDate(solicitud.fechaActualizacion, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                              })
                                            })
                                          : t('orders.offerDeliveredWithoutDate')}
                                      </div>
                                    )}

                                    {/* Productos solicitados */}
                                    <div className="rounded-lg border border-white/80 bg-white p-3 mb-3">
                                      <p className="text-xs font-semibold text-[#666666] mb-2">{tFr('orders.requestedProducts')}</p>
                                      <div className="space-y-1">
                                        {solicitud.productosAceptados.map((prodAceptado, pIdx) => {
                                          const producto = oferta.productos.find(p => p.productoId === prodAceptado.productoId);
                                          return (
                                            <div key={`${solicitud.id}-prod-${prodAceptado.productoId}-${pIdx}`} className="flex items-center justify-between text-sm">
                                              <div className="flex items-center gap-2">
                                                <span>{producto?.icono}</span>
                                                <span className="text-[#333333]">{producto?.productoNombre}</span>
                                              </div>
                                              <span className="font-semibold text-[#1E73BE]">
                                                {prodAceptado.cantidadAceptada} {producto?.unidad}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Totales */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                      <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                                        <p className="text-xs text-[#666666]">{tFr('orders.products')}</p>
                                        <p className="font-bold text-[#1E73BE]">{solicitud.productosAceptados.length}</p>
                                      </div>
                                      <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                                        <p className="text-xs text-[#666666]">{tFr('orders.totalWeight')}</p>
                                        <p className="font-bold text-[#4CAF50]">{Math.round(totalKilos)} kg</p>
                                      </div>
                                      <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                                        <p className="text-xs text-[#666666]">{tFr('orders.value')}</p>
                                        <p className="font-bold text-[#FFC107]">CAD$ {formatNumberSimple(totalValor)}</p>
                                      </div>
                                    </div>

                                    {/* Observaciones y fecha de recogida */}
                                    {solicitud.observaciones && (
                                      <div className="bg-yellow-50 border border-[#FFC107] rounded p-3">
                                        <p className="text-xs font-semibold text-[#666666] mb-1">{tFr('orders.detailsLabel')}</p>
                                        <p className="text-sm text-[#333333]">{formatOfferObservation(solicitud.observaciones)}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Mensaje si no hay solicitudes */}
                        {totalSolicitudes === 0 && !ofertaBloqueada && (
                          <div className="text-center py-4 text-[#666666]">
                            <p className="text-sm">{tFr('orders.noRequestsYet')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

            {/* Mensaje si no hay ofertas */}
            {ofertasFiltradas.length === 0 && (
              <Card className="overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-[#666666]">
                    <Tag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-semibold mb-2">Aucune offre ne correspond au filtre actuel.</p>
                    <p className="text-sm">Changez le statut sélectionné ou créez une nouvelle offre pour alimenter cette vue.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          </ModuleControlSurfaceBody>
        </TabsContent>

        </Tabs>
        </ModuleControlSurface>

      {/* Dialog de notificaciones */}
      <Dialog open={dialogNotificacionOpen} onOpenChange={setDialogNotificacionOpen}>
        <DialogContent className="app-dialog-comfort max-w-2xl" aria-describedby="notificacion-dialog-description">
          <DialogHeader>
            <DialogTitle>{t('orders.notifyPendingOrders')}</DialogTitle>
            <DialogDescription id="notificacion-dialog-description">
              {t('orders.notifyOrdersDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#666666]">{t('orders.selectOrdersToNotify')}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={comandasSeleccionadas.length === comandasPendientes.length}
                onCheckedChange={toggleTodasComandas}
              />
              <Label>{t('inventory.selectAll')}</Label>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {comandasPendientes.map(comanda => {
                const organismo = resolverOrganismoComanda(comanda);
                return (
                  <div key={comanda.id} className="flex items-center gap-2 p-3 border rounded">
                    <Checkbox
                      checked={comandasSeleccionadas.includes(comanda.id)}
                      onCheckedChange={() => toggleComandaSeleccionada(comanda.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{comanda.id}</p>
                      <p className="text-sm text-[#666666]">{organismo?.nombre || obtenerNombreOrganismoComanda(comanda) || t('orders.withoutOrganism')}</p>
                      {getModalidadDistribucionBadge(comanda)}
                    </div>
                    {getEstadoBadge(comanda.estado)}
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-[#1E73BE]/25 bg-[#EAF3FF] p-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="verification-notifications"
                  checked={confirmacionNotificaciones}
                  onCheckedChange={(checked) => setConfirmacionNotificaciones(Boolean(checked))}
                />
                <div>
                  <Label htmlFor="verification-notifications" className="cursor-pointer font-medium text-[#1A4D7A]">
                    J’ai vérifié les destinataires et je confirme l’ouverture d’Outlook avant l’envoi.
                  </Label>
                  <p className="mt-1 text-xs text-[#4B647A]">
                    Cette confirmation est obligatoire pour envoyer les notifications.
                  </p>
                </div>
              </div>
            </div>

            <div className="app-compact-actions justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogNotificacionOpen(false);
                  setConfirmacionNotificaciones(false);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleNotificarComandas}
                disabled={!confirmacionNotificaciones || comandasSeleccionadas.length === 0}
                className="bg-[#1E73BE] hover:bg-[#1557A0]"
              >
                {t('orders.sendNotifications')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ListaProductosDistribuidosDialog
        open={dialogListaDistribuidosOpen}
        onOpenChange={setDialogListaDistribuidosOpen}
        comandas={comandasDistribuidasFiltradas}
        currentLocale={currentLocale}
        onDistribucionesActualizadas={cargarComandas}
      />

      {/* Dialog para proponer nueva fecha */}
      <ProponerNuevaFecha
        open={dialogProponerFechaOpen}
        onOpenChange={setDialogProponerFechaOpen}
        comanda={comandaParaAccion}
        organismo={obtenerOrganismosReales().find(o => o.id === comandaParaAccion?.organismoId)}
        onConfirmar={(nuevaFecha, nuevaHora, motivo) => {
          console.log('Nueva fecha propuesta:', { nuevaFecha, nuevaHora, motivo });
          // Aquí se actualizaría la comanda con la nueva fecha propuesta
        }}
      />

      {/* Dialog para ver detalles de solicitud */}
      <Dialog open={dialogVerSolicitudOpen} onOpenChange={setDialogVerSolicitudOpen}>
        <DialogContent className="app-dialog-comfort max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="ver-solicitud-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
              {tFr('orders.requestDialogTitle')}
            </DialogTitle>
            <DialogDescription id="solicitud-dialog-description">
              {tFr('orders.requestDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          {solicitudSeleccionada && ofertaParaSolicitud && (
            <div className="space-y-4 py-4">
              {/* Info del organismo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {tFr('orders.organism')}
                </h3>
                <p className="text-lg font-semibold text-[#1E73BE]">{solicitudSeleccionada.organismoNombre}</p>
                <p className="text-sm text-[#666666] mt-1">
                  {tFr('orders.requestMadeOn', {
                    date: formatFrenchDate(solicitudSeleccionada.fechaSolicitud, {
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  })}
                </p>
                <div className="mt-2">
                  {getEstadoSolicitudBadge(solicitudSeleccionada.estado)}
                </div>
                {solicitudSeleccionada.preparadoPor && (solicitudSeleccionada.estado === 'en_preparacion' || solicitudSeleccionada.estado === 'entregada') && (
                  <p className="text-sm text-[#0f766e] mt-2 font-medium">
                    Préparée par : {solicitudSeleccionada.preparadoPor}
                  </p>
                )}
                {solicitudSeleccionada.estado === 'entregada' && solicitudSeleccionada.fechaActualizacion && (
                  <p className="text-sm text-[#1E73BE] mt-2 font-medium">
                    {tFr('orders.deliveryRecordedOn', {
                      date: formatFrenchDate(solicitudSeleccionada.fechaActualizacion, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    })}
                  </p>
                )}
              </div>

              {/* Productos solicitados */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {tFr('orders.requestedProductsTitle')} ({solicitudSeleccionada.productosAceptados.length})
                </h3>
                <div className="space-y-2">
                  {solicitudSeleccionada.productosAceptados.map((prodAceptado: ProductoAceptado, idx: number) => {
                    const producto = ofertaParaSolicitud.productos.find((p: ProductoOferta) => p.productoId === prodAceptado.productoId);
                    const pesoTotal = (producto?.peso || 0) * prodAceptado.cantidadAceptada;
                    const valorTotal = (producto?.valorUnitario || 0) * pesoTotal;
                    
                    return (
                      <div key={`detalle-prod-${prodAceptado.productoId}-${idx}`} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{producto?.icono}</span>
                            <div>
                              <p className="font-semibold text-[#333333]">{producto?.productoNombre}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-[#1E73BE]">
                            {prodAceptado.cantidadAceptada} {producto?.unidad}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="text-center">
                            <p className="text-xs text-[#666666]">{tFr('orders.totalWeight')}</p>
                            <p className="font-semibold text-[#4CAF50]">{Math.round(pesoTotal)} kg</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[#666666]">{tFr('orders.valuePerKg')}</p>
                            <p className="font-semibold text-[#FFC107]">CAD$ {formatNumberSimple(producto?.valorUnitario || 0)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-[#666666]">{tFr('orders.valueTotal')}</p>
                            <p className="font-semibold text-[#FFC107]">CAD$ {formatNumberSimple(valorTotal)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totales generales */}
              <div className="bg-green-50 border-2 border-[#4CAF50] rounded-lg p-4">
                <h3 className="font-bold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {tFr('orders.totals')}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-[#666666] mb-1">{tFr('orders.totalProductsLabel')}</p>
                    <p className="text-2xl font-bold text-[#1E73BE]">
                      {solicitudSeleccionada.productosAceptados.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#666666] mb-1">{tFr('orders.totalWeight')}</p>
                    <p className="text-2xl font-bold text-[#4CAF50]">
                      {formatNumberSimple(solicitudSeleccionada.productosAceptados.reduce((sum: number, p: ProductoAceptado) => {
                        const producto = ofertaParaSolicitud.productos.find((prod: ProductoOferta) => prod.productoId === p.productoId);
                        return sum + (producto?.peso || 0) * p.cantidadAceptada;
                      }, 0))} kg
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#666666] mb-1">{tFr('orders.valueTotal')}</p>
                    <p className="text-2xl font-bold text-[#FFC107]">
                      CAD$ {formatNumberSimple(solicitudSeleccionada.productosAceptados.reduce((sum: number, p: ProductoAceptado) => {
                        const producto = ofertaParaSolicitud.productos.find((prod: ProductoOferta) => prod.productoId === p.productoId);
                        return sum + (producto?.valorUnitario || 0) * (producto?.peso || 0) * p.cantidadAceptada;
                      }, 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {solicitudSeleccionada.observaciones && (
                <div className="bg-yellow-50 border border-[#FFC107] rounded-lg p-4">
                  <h3 className="font-bold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {tFr('orders.detailsAndObservations')}
                  </h3>
                  <p className="text-sm text-[#333333] whitespace-pre-wrap">
                    {formatOfferObservation(solicitudSeleccionada.observaciones)}
                  </p>
                </div>
              )}

              {/* Botón de cerrar */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogVerSolicitudOpen(false)}
                  className="min-w-[120px]"
                >
                  {tFr('common.close')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogEditarCaducidadOfertaOpen} onOpenChange={setDialogEditarCaducidadOfertaOpen}>
        <DialogContent className="app-dialog-comfort max-w-md" aria-describedby="editar-caducidad-oferta-description">
          <DialogHeader>
            <DialogTitle>Modifier la date de caducité</DialogTitle>
            <DialogDescription id="editar-caducidad-oferta-description">
              Ajustez l’échéance de l’offre pour prolonger sa disponibilité administrative.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="oferta-nueva-caducidad">Nouvelle date de caducité</Label>
              <Input
                id="oferta-nueva-caducidad"
                type="date"
                value={nuevaFechaCaducidadOferta}
                onChange={(e) => setNuevaFechaCaducidadOferta(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogEditarCaducidadOfertaOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleGuardarNuevaCaducidadOferta} className="bg-[#1E73BE] hover:bg-[#175a95]">
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogAnularOfertaOpen} onOpenChange={setDialogAnularOfertaOpen}>
        <DialogContent className="app-dialog-comfort max-w-md" aria-describedby="anular-oferta-description">
          <DialogHeader>
            <DialogTitle>Annuler l'offre</DialogTitle>
            <DialogDescription id="anular-oferta-description">
              Cette action rendra l’offre invisible pour les organismes et annulera les demandes encore en attente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b]">
              Les demandes déjà acceptées restent historiques et ne seront pas supprimées automatiquement.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogAnularOfertaOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleConfirmarAnularOferta}>
                Confirmer l'annulation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Escáner QR */}
      {escanerQROpen && (
        <EscanerQR
          autoStartCamera
          onScanSuccess={handleScanQR}
          onClose={() => setEscanerQROpen(false)}
        />
      )}
      </div>
    </div>
  );
}