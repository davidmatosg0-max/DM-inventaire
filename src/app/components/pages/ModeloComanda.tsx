import React, { useRef, useState, useEffect } from 'react';
import { Printer, X, Thermometer, Snowflake, Sun, Maximize2, Minimize2, Check, Ban, Edit2, Box, AlertCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { mockProductos } from '../../data/mockData';
import { obtenerProductos } from '../../utils/productStorage';
import {
  resolverTemperaturaAlmacenamientoProducto,
  resolverTemperaturaOriginalEntradaProducto,
} from '../../utils/productTemperature';
import { sortByTemperature } from '../../utils/temperatureSort';
import { NotificacionComanda } from '../NotificacionComanda';
import { obtenerPersonaPrincipal } from '../../utils/personasResponsablesStorage';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { buildComandaQRData, COMANDA_QR_SVG_LEVEL } from '../../utils/comandaQr';
import { useTranslation } from 'react-i18next';
import { BrandedQRCode } from '../shared/BrandedQRCode';
import { actualizarComanda, actualizarComandasGrupo } from '../../utils/comandaStorage';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../../utils/brandingPrint';
import { obtenerReservaInventarioProducto } from '../../utils/inventoryReservations';
import { useBranding } from '../../../hooks/useBranding';
import { toast } from 'sonner';

interface ModeloComandaProps {
  comanda: any;
  organismo: any;
  mostrar: boolean;
  onCerrar: () => void;
  onAbrirImpresionCompacta?: () => void;
  onCambiarEstado?: (nuevoEstado: string) => void;
  onAceptarComanda?: (itemsAceptados: any[], comandaOrigen?: any) => void;
  onAnularComanda?: (comandaOrigen?: any) => void;
  modoOrganismo?: boolean; // Para diferenciar si es vista de organismo o administrador
  onComandaActualizada?: (comandaActualizada: any) => void;
  abrirEdicionGrupoInicial?: boolean;
}

export function ModeloComanda({ 
  comanda, 
  organismo, 
  mostrar, 
  onCerrar,
  onAbrirImpresionCompacta,
  onCambiarEstado,
  onAceptarComanda,
  onAnularComanda,
  modoOrganismo = false,
  onComandaActualizada,
  abrirEdicionGrupoInicial = false,
}: ModeloComandaProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const defaultLocale = 'fr-CA';
  const comandaRef = useRef<HTMLDivElement>(null);
  const bloqueGrupoRef = useRef<HTMLDivElement>(null);
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);

  const parseDateForDisplay = (value?: string) => {
    if (!value) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    return new Date(value);
  };

  const formatDisplayDate = (value?: string, options?: Intl.DateTimeFormatOptions) => {
    const parsedDate = parseDateForDisplay(value);
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return 'Date invalide';
    }

    return parsedDate.toLocaleDateString(defaultLocale, options);
  };

  const formatearCantidadProducto = (valor: number) => {
    return new Intl.NumberFormat(defaultLocale, {
      minimumFractionDigits: Number.isInteger(valor) ? 0 : 1,
      maximumFractionDigits: 2,
    }).format(valor);
  };

  const obtenerEtiquetaProducto = (producto: any, nombreProducto?: string) => {
    return nombreProducto || producto?.nombre || producto?.subcategoria || 'Produit introuvable';
  };

  const obtenerPoidsUnitaire = (producto: any) => {
    if (typeof producto?.pesoUnitario !== 'number' || producto.pesoUnitario <= 0) {
      return null;
    }

    return `Poids unitaire : ${formatearCantidadProducto(producto.pesoUnitario)} kg`;
  };

  const obtenerValorUnitario = (item: any) => {
    if (typeof item?.valorUnitario === 'number' && item.valorUnitario > 0) {
      return item.valorUnitario;
    }

    if (typeof item?.producto?.valorUnitario === 'number' && item.producto.valorUnitario > 0) {
      return item.producto.valorUnitario;
    }

    return 0;
  };

  const itemsComanda = React.useMemo(() => Array.isArray(comanda.items) ? comanda.items : [], [comanda.items]);
  const [vistaCompacta, setVistaCompacta] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoEdicionInterna, setModoEdicionInterna] = useState(false);
  const [cantidadesEditadas, setCantidadesEditadas] = useState<{[key: string]: number}>({});
  const [campoEditando, setCampoEditando] = useState<string | null>(null); // Para edición inline
  const [modoEdicionGrupo, setModoEdicionGrupo] = useState(false);
  const [fechaCaducidadGrupoEditada, setFechaCaducidadGrupoEditada] = useState('');
  const [grupoAncladoEditado, setGrupoAncladoEditado] = useState(false);
  const [observacionesGrupoEditadas, setObservacionesGrupoEditadas] = useState('');
  const [productoAgregarId, setProductoAgregarId] = useState('');
  const [filtroRapidoProducto, setFiltroRapidoProducto] = useState('');
  const [cantidadAgregarProducto, setCantidadAgregarProducto] = useState('1');
  const distribucionGrupoFinalizada = ['entregada', 'anulada'].includes(String(comanda.estado || ''));
  
  // 🎯 NUEVO: Estado para marcar productos como completados durante la preparación
  const [productosCompletados, setProductosCompletados] = useState<{[key: string]: boolean}>({});

  const toggleProductoCompletado = (itemKey: string) => {
    setProductosCompletados((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const inventarioProductos = React.useMemo(() => {
    return obtenerProductos()
      .filter((producto: any) => producto?.id)
      .sort((left: any, right: any) => String(left?.nombre || '').localeCompare(String(right?.nombre || ''), 'fr'));
  }, []);

  const productoAgregarSeleccionado = React.useMemo(() => {
    return inventarioProductos.find((producto: any) => producto.id === productoAgregarId) || null;
  }, [inventarioProductos, productoAgregarId]);

  const obtenerCantidadActualProductoEnEdicion = (productoId: string) => {
    return itemsComanda.reduce((total: number, item: any, index: number) => {
      if (item?.productoId !== productoId) {
        return total;
      }

      const itemKey = `${item.productoId}-${index}`;
      const cantidadVisible = (modoEdicion || modoEdicionInterna) && cantidadesEditadas[itemKey] !== undefined
        ? cantidadesEditadas[itemKey]
        : Number(item?.cantidad || 0);

      return total + Number(cantidadVisible || 0);
    }, 0);
  };

  const productosFiltradosAgregar = React.useMemo(() => {
    const inventarioDisponible = inventarioProductos.filter((producto: any) => {
      return obtenerStockDisponibleProducto(producto) > 0 || producto.id === productoAgregarId;
    });

    const filtro = filtroRapidoProducto.trim().toLocaleLowerCase('fr-CA');

    if (!filtro) {
      return inventarioDisponible;
    }

    const filtrados = inventarioDisponible.filter((producto: any) => {
      const textoBusqueda = [
        producto?.nombre,
        producto?.codigo,
        producto?.categoria,
        producto?.subcategoria,
        producto?.varianteNombre,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('fr-CA');

      return textoBusqueda.includes(filtro);
    });

    if (productoAgregarSeleccionado && !filtrados.some((producto: any) => producto.id === productoAgregarSeleccionado.id)) {
      return [productoAgregarSeleccionado, ...filtrados];
    }

    return filtrados;
  }, [inventarioProductos, filtroRapidoProducto, productoAgregarSeleccionado, productoAgregarId, itemsComanda, cantidadesEditadas, modoEdicion, modoEdicionInterna, comanda.id]);

  function obtenerStockDisponibleProducto(producto: any) {
    if (!producto?.id) {
      return 0;
    }

    const reserva = obtenerReservaInventarioProducto(producto.id, {
      excludeComandaId: comanda.id,
    });
    const cantidadActual = obtenerCantidadActualProductoEnEdicion(producto.id);
    const cantidadDisponible = Number(reserva?.disponibleParaReservar ?? 0) - cantidadActual;

    return Number.isFinite(cantidadDisponible) ? Math.max(cantidadDisponible, 0) : 0;
  }

  const construirEtiquetaOpcionProducto = (producto: any) => {
    const nombre = obtenerEtiquetaProducto(producto);
    const stockDisponible = obtenerStockDisponibleProducto(producto);
    const pesoUnitario = typeof producto?.pesoUnitario === 'number' && producto.pesoUnitario > 0
      ? `${formatearCantidadProducto(producto.pesoUnitario)} kg`
      : null;

    return [
      `${producto?.icono || '📦'} ${nombre}`,
      pesoUnitario ? `${pesoUnitario}/un.` : null,
      `Ajoutable: ${formatearCantidadProducto(stockDisponible)} ${producto?.unidad || 'kg'}`,
    ]
      .filter(Boolean)
      .join(' · ');
  };

  const getItemKey = (item: any, index: number) => `${item.productoId}-${index}`;

  const getCantidadVisible = (item: any, index: number) => {
    const itemKey = getItemKey(item, index);
    if ((modoEdicion || modoEdicionInterna) && cantidadesEditadas[itemKey] !== undefined) {
      return cantidadesEditadas[itemKey];
    }

    return item.cantidad;
  };

  const inicializarCantidadesEditadas = (items: any[]) => {
    const cantidadesIniciales: {[key: string]: number} = {};
    items.forEach((item: any, index: number) => {
      cantidadesIniciales[getItemKey(item, index)] = Number(item.cantidad || 0);
    });
    setCantidadesEditadas(cantidadesIniciales);
  };

  const normalizarTemperaturaPersistida = (temperatura?: string) => {
    if (temperatura === 'refrigerado' || temperatura === 'Réfrigéré') {
      return 'refrigerado';
    }

    if (temperatura === 'congelado' || temperatura === 'Congelé') {
      return 'congelado';
    }

    return 'ambiente';
  };

  const construirItemPersistido = (item: any, cantidad: number) => {
    const nombreProducto = item.nombreProducto || item.productoNombre || item.producto?.nombre || 'Produit introuvable';

    return {
      ...item,
      producto: undefined,
      nombreProducto,
      productoNombre: nombreProducto,
      cantidad,
      cantidadAceptada: typeof item.cantidadAceptada === 'number' ? Math.min(item.cantidadAceptada, cantidad) : item.cantidadAceptada,
      unidad: item.unidad || item.producto?.unidad || 'kg',
      icono: item.icono || item.producto?.icono,
      valorUnitario: typeof item.valorUnitario === 'number' ? item.valorUnitario : item.producto?.valorUnitario,
      temperatura: normalizarTemperaturaPersistida(item.temperaturaOriginalEntrada || item.temperatura),
      temperaturaOriginalEntrada: normalizarTemperaturaPersistida(item.temperaturaOriginalEntrada || item.temperatura),
    };
  };

  const construirItemsInternosEditados = () => {
    return productosOrdenados
      .map((item: any, index: number) => construirItemPersistido(item, getCantidadVisible(item, index)))
      .filter((item: any) => Number(item.cantidad) > 0);
  };

  const handleImprimir = () => {
    if (onAbrirImpresionCompacta) {
      onCerrar();
      onAbrirImpresionCompacta();
      return;
    }

    window.print();

    const handleAfterPrint = () => {
      onCerrar();
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
  };

  const productosOrdenados = React.useMemo(() => {
    const todosLosProductos = obtenerProductos();
    const items = itemsComanda.map((item: any) => {
      const productoPersistido = todosLosProductos.find(p => p.id === item.productoId);
      const productoEnMemoria = mockProductos.find(p => p.id === item.productoId);
      const producto = productoPersistido || productoEnMemoria;
      const temperaturaFuente = resolverTemperaturaAlmacenamientoProducto({
        ...(producto || {}),
        categoria: (producto as any)?.categoria || item?.categoria,
        subcategoria: (producto as any)?.subcategoria || item?.subcategoria,
        nombre: (producto as any)?.nombre || item?.nombreProducto || item?.productoNombre,
        temperatura: (producto as any)?.temperatura || item?.temperatura,
        temperaturaAlmacenamiento: (producto as any)?.temperaturaAlmacenamiento,
      });

      const temperatura =
        String(temperaturaFuente).toLowerCase().includes('congel')
          ? 'Congelé'
          : String(temperaturaFuente).toLowerCase().includes('refrig')
            ? 'Réfrigéré'
            : 'Température ambiante';
      const temperaturaOriginalEntrada = resolverTemperaturaOriginalEntradaProducto({
        ...(producto || {}),
        categoria: (producto as any)?.categoria || item?.categoria,
        subcategoria: (producto as any)?.subcategoria || item?.subcategoria,
        nombre: (producto as any)?.nombre || item?.nombreProducto || item?.productoNombre,
        temperatura: (producto as any)?.temperatura || item?.temperatura,
        temperaturaAlmacenamiento: (producto as any)?.temperaturaAlmacenamiento,
        temperaturaOriginalEntrada:
          (item as any)?.temperaturaOriginalEntrada ||
          (productoPersistido as any)?.temperaturaOriginalEntrada ||
          (productoEnMemoria as any)?.temperaturaOriginalEntrada,
      });

      return {
        ...item,
        producto,
        temperatura,
        temperaturaOriginalEntrada,
      };
    });

    return sortByTemperature(
      items,
      (item: any) => item.temperatura,
      (a: any, b: any) => String(a.nombreProducto || a.producto?.nombre || '').localeCompare(
        String(b.nombreProducto || b.producto?.nombre || ''),
        'fr',
      ),
    );
  }, [itemsComanda]);

  // 🎯 NUEVO: Calcular progreso de preparación (DESPUÉS de productosOrdenados)
  const totalProductos = productosOrdenados.length;
  const productosCompletadosCount = Object.values(productosCompletados).filter(Boolean).length;
  const porcentajeCompletado = totalProductos > 0 ? (productosCompletadosCount / totalProductos) * 100 : 0;
  const hayCambiosCantidad = productosOrdenados.some((item: any, index: number) => {
    const itemKey = getItemKey(item, index);
    return cantidadesEditadas[itemKey] !== undefined && cantidadesEditadas[itemKey] !== item.cantidad;
  });

  // Agrupar por temperatura para mostrar secciones
  const productosAgrupados = React.useMemo(() => {
    const grupos: { [key: string]: any[] } = {
      'Température ambiante': [],
      'Réfrigéré': [],
      'Congelé': []
    };

    productosOrdenados.forEach((item: any) => {
      const temperatura = typeof item.temperatura === 'string' ? item.temperatura : 'Température ambiante';
      if (!grupos[temperatura]) {
        grupos[temperatura] = [];
      }
      grupos[temperatura].push(item);
    });

    return grupos;
  }, [productosOrdenados]);

  const obtenerEtiquetaTemperatura = (temperatura: string) => {
    if (temperatura === 'Température ambiante') {
      return 'Ambiante';
    }

    if (temperatura === 'Réfrigéré') {
      return 'Réfrigéré';
    }

    if (temperatura === 'Congelé') {
      return 'Congelé';
    }

    return temperatura;
  };

  const obtenerNombreOriginalTemperatura = (temperatura?: string) => {
    if (temperatura === 'refrigerado' || temperatura === 'Réfrigéré') {
      return 'refrigerado';
    }

    if (temperatura === 'congelado' || temperatura === 'Congelé') {
      return 'congelado';
    }

    return 'ambiente';
  };

  const getTemperatureBadgeStyle = (temp: string) => {
    switch (temp) {
      case 'Température ambiante':
        return 'bg-[#FFF8E1] text-[#F57C00] border-[#FFC107]';
      case 'Réfrigéré':
        return 'bg-[#E3F2FD] text-[#1E73BE] border-[#1E73BE]';
      case 'Congelé':
        return 'bg-[#E1F5FE] text-[#0277BD] border-[#0288D1]';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Obtener fecha y hora actual
  const fechaActual = new Date();
  const dia = fechaActual.toLocaleDateString(defaultLocale, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const hora = fechaActual.toLocaleTimeString(defaultLocale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Generar datos para QR (información de la comanda)
  const qrData = buildComandaQRData({
    numeroComanda: comanda.numero,
    organismo: organismo?.nombre || 'Sin organismo',
    fecha: comanda.fecha,
    items: itemsComanda.length,
    organismoId: organismo?.id,
  });

  // Función para obtener icono de temperatura
  const getTemperaturaIcon = (temp: string) => {
    switch (temp) {
      case 'Température ambiante':
        return <Sun className="w-5 h-5 text-[#FFC107]" />;
      case 'Réfrigéré':
        return <Thermometer className="w-5 h-5 text-[#1E73BE]" />;
      case 'Congelé':
        return <Snowflake className="w-5 h-5 text-[#4CAF50]" />;
      default:
        return null;
    }
  };

  // Estados disponibles
  const estadosDisponibles = [
    { valor: 'pendiente', label: 'En attente', color: 'bg-[#1E73BE]' },
    { valor: 'confirmada', label: 'Acceptée', color: 'bg-[#7E57C2]' },
    { valor: 'en_preparacion', label: 'En préparation', color: 'bg-[#FFC107]' },
    { valor: 'completada', label: 'Complétée', color: 'bg-[#4CAF50]' },
    { valor: 'entregada', label: 'Livrée', color: 'bg-[#2E7D32]' },
    { valor: 'anulada', label: 'Annulée', color: 'bg-[#DC3545]' }
  ];

  const estadoActual = estadosDisponibles.find(e => e.valor === comanda.estado);
  const tamanoQr = vistaCompacta ? 104 : 144;
  const estiloContenedorComanda = vistaCompacta
    ? 'rounded-[28px] border border-[#d7e3ef] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-4 shadow-[0_28px_70px_-42px_rgba(15,45,71,0.34)] sm:p-5'
    : 'bg-white p-8';
  const estiloTarjetaCompacta = vistaCompacta
    ? 'rounded-[22px] border border-[#d9e5f0] bg-white/96 p-4 shadow-[0_20px_40px_-34px_rgba(15,45,71,0.32)]'
    : '';
  const estiloEtiquetaCompacta = vistaCompacta ? 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500' : 'text-xs sm:text-sm text-[#666666] mb-2 uppercase tracking-wide';
  const estiloValorCompacto = vistaCompacta ? 'text-[13px] leading-5 text-slate-700' : 'text-sm sm:text-base';

  // Inicializar cantidades editadas
  useEffect(() => {
    if (mostrar) {
      setVistaCompacta(true);
    }
  }, [mostrar]);

  useEffect(() => {
    if (mostrar && modoOrganismo) {
      const cantidadesIniciales: {[key: string]: number} = {};
      productosOrdenados.forEach((item: any, index: number) => {
        cantidadesIniciales[`${item.productoId}-${index}`] = item.cantidad;
      });
      setCantidadesEditadas(cantidadesIniciales);
    }
  }, [mostrar, modoOrganismo, productosOrdenados]);

  useEffect(() => {
    if (mostrar) {
      setFechaCaducidadGrupoEditada(comanda.fechaCaducidadGrupo || '');
      setGrupoAncladoEditado(Boolean(comanda.grupoDistribucionAnclada));
      setObservacionesGrupoEditadas(comanda.observaciones || '');
      setModoEdicionGrupo(abrirEdicionGrupoInicial && Boolean(comanda.grupoDistribucionId || comanda.fechaCaducidadGrupo));
    }
  }, [mostrar, comanda.fechaCaducidadGrupo, comanda.grupoDistribucionAnclada, comanda.observaciones, comanda.grupoDistribucionId, abrirEdicionGrupoInicial]);

  useEffect(() => {
    if (!mostrar || !modoEdicionGrupo || !bloqueGrupoRef.current) {
      return;
    }

    bloqueGrupoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [mostrar, modoEdicionGrupo]);

  const handleGuardarMetadatosGrupo = () => {
    try {
      if (distribucionGrupoFinalizada) {
        toast.error('Cette distribution de groupe est finalisée et ne peut plus être modifiée.');
        return;
      }

      if (!comanda.grupoDistribucionId) {
        toast.error('La date de péremption de la distribution doit être modifiée depuis une distribution de groupe valide.');
        return;
      }

      const cambios = {
        fechaCaducidadGrupo: fechaCaducidadGrupoEditada || undefined,
        grupoDistribucionAnclada: grupoAncladoEditado,
        observaciones: observacionesGrupoEditadas.trim() || undefined,
        fechaModificacion: new Date().toISOString(),
      };

      const comandasActualizadas = actualizarComandasGrupo(comanda.grupoDistribucionId, cambios);
      const comandaActualizada = comandasActualizadas.find((item) => item.id === comanda.id);
      if (comandaActualizada) {
        Object.assign(comanda, comandaActualizada);
        onComandaActualizada?.(comandaActualizada);
      }

      toast.success('Distribution de groupe mise à jour pour tout le groupe.');

      setModoEdicionGrupo(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la distribution de groupe:', error);
      toast.error('Impossible d’appliquer les modifications de la distribution de groupe.');
    }
  };

  // Función para cambiar cantidad
  const handleCambioCantidad = (itemKey: string, nuevaCantidad: number, cantidadOriginal: number) => {
    if (nuevaCantidad < 0 || Number.isNaN(nuevaCantidad)) {
      return;
    }

    if (modoEdicionInterna || nuevaCantidad <= cantidadOriginal) {
      setCantidadesEditadas(prev => ({
        ...prev,
        [itemKey]: nuevaCantidad
      }));
    }
  };

  const handleIniciarEdicionInterna = () => {
    inicializarCantidadesEditadas(productosOrdenados);
    setCampoEditando(null);
    setModoEdicionInterna(true);
  };

  const handleCancelarEdicionInterna = () => {
    setModoEdicionInterna(false);
    setCampoEditando(null);
    setCantidadesEditadas({});
    setProductoAgregarId('');
    setFiltroRapidoProducto('');
    setCantidadAgregarProducto('1');
  };

  const handleGuardarEdicionInterna = () => {
    try {
      const itemsActualizados = construirItemsInternosEditados();
      const comandaActualizada = {
        ...comanda,
        items: itemsActualizados,
        fechaModificacion: new Date().toISOString(),
      };

      actualizarComanda(comandaActualizada);
      onComandaActualizada?.(comandaActualizada);
      setModoEdicionInterna(false);
      setCampoEditando(null);
      setCantidadesEditadas({});
      toast.success('Les articles de la commande ont été mis à jour.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour interne de la commande:', error);
      toast.error('Impossible de mettre à jour les articles de la commande.');
    }
  };

  const handleAgregarProductoInterno = () => {
    const producto = inventarioProductos.find((item: any) => item.id === productoAgregarId);
    const cantidad = Number(cantidadAgregarProducto);

    if (!producto) {
      toast.error('Sélectionnez un produit à ajouter.');
      return;
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      toast.error('La quantité à ajouter doit être supérieure à 0.');
      return;
    }

    const cantidadDisponibleAgregar = obtenerStockDisponibleProducto(producto);
    const nombreProducto = producto.nombre || producto.subcategoria || 'Produit introuvable';

    if (cantidadDisponibleAgregar <= 0) {
      toast.error(`Aucune quantité réservabile n’est disponible pour ${nombreProducto}.`);
      return;
    }

    if (cantidad > cantidadDisponibleAgregar) {
      toast.error(
        `Quantité indisponible pour ${nombreProducto}. Maximum ajoutable: ${formatearCantidadProducto(cantidadDisponibleAgregar)} ${producto.unidad || 'kg'}.`,
      );
      return;
    }

    try {
      const itemsBase = construirItemsInternosEditados();
      const indiceExistente = itemsBase.findIndex((item: any) => item.productoId === producto.id);
      const temperaturaOriginal = normalizarTemperaturaPersistida(
        resolverTemperaturaOriginalEntradaProducto(producto as any),
      );

      if (indiceExistente >= 0) {
        itemsBase[indiceExistente] = {
          ...itemsBase[indiceExistente],
          cantidad: Number(itemsBase[indiceExistente].cantidad || 0) + cantidad,
        };
      } else {
        itemsBase.push({
          productoId: producto.id,
          nombreProducto,
          productoNombre: nombreProducto,
          cantidad,
          unidad: producto.unidad || 'kg',
          icono: producto.icono,
          valorUnitario: typeof producto.valorUnitario === 'number' ? producto.valorUnitario : undefined,
          temperatura: temperaturaOriginal,
          temperaturaOriginalEntrada: temperaturaOriginal,
        });
      }

      const comandaActualizada = {
        ...comanda,
        items: itemsBase,
        fechaModificacion: new Date().toISOString(),
      };

      actualizarComanda(comandaActualizada);
      onComandaActualizada?.(comandaActualizada);
      setProductoAgregarId('');
      setFiltroRapidoProducto('');
      setCantidadAgregarProducto('1');
      setCantidadesEditadas({});
      toast.success('Produit ajouté à la commande.');
    } catch (error) {
      console.error('Erreur lors de l’ajout interne de produit:', error);
      if (!(error instanceof Error) || !error.message) {
        toast.error('Impossible d’ajouter le produit à la commande.');
      }
    }
  };

  // Función para aceptar toda la comanda
  const handleAceptarTodo = () => {
    if (onAceptarComanda) {
      const itemsAceptados = productosOrdenados.map((item: any, index: number) => ({
        ...item,
        cantidadAceptada: item.cantidad
      }));
      onAceptarComanda(itemsAceptados, comanda);
      setModoEdicion(false);
    }
  };

  // Función para aceptar con cantidades modificadas
  const handleAceptarModificado = () => {
    if (onAceptarComanda) {
      const itemsAceptados = productosOrdenados.map((item: any, index: number) => {
        const itemKey = `${item.productoId}-${index}`;
        return {
          ...item,
          cantidadAceptada: cantidadesEditadas[itemKey] ?? item.cantidad
        };
      });
      onAceptarComanda(itemsAceptados, comanda);
      setModoEdicion(false);
    }
  };

  // Función para anular comanda
  const handleAnular = () => {
    if (onAnularComanda && window.confirm('Êtes-vous certain de vouloir annuler cette commande ?')) {
      onAnularComanda(comanda);
    }
  };

  // 🎯 NUEVO: Obtener persona autorizada para recoger la comanda
  const personaAutorizada = React.useMemo(() => {
    if (!organismo?.id) return null;
    const persona = obtenerPersonaPrincipal(organismo.id);
    return persona || null;
  }, [organismo?.id]);

  return (
    <Dialog open={mostrar} onOpenChange={onCerrar}>
      <DialogContent
        className={`p-0 overflow-y-auto border border-slate-200 bg-white shadow-2xl print:max-w-full print:max-h-full ${
          vistaCompacta
            ? 'w-[calc(100vw-1rem)] sm:w-[min(96vw,1120px)] max-w-[1120px] h-[88vh] max-h-[88vh] rounded-2xl'
            : 'w-[calc(100vw-1rem)] sm:w-[min(98vw,1380px)] max-w-[1380px] h-[94vh] max-h-[94vh] rounded-2xl'
        }`}
        aria-describedby="modelo-comanda-description"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t('orders.dialog.title', { number: comanda.numero })}</DialogTitle>
          <DialogDescription id="modelo-comanda-description">{t('orders.dialog.description')}</DialogDescription>
        </DialogHeader>
        {/* Botones de acción (no se imprimen) */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm flex flex-wrap justify-between items-center px-4 py-3 print:hidden gap-2">
          <h2 className="text-lg sm:text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Commande - {comanda.numero}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {!modoOrganismo && (
              modoEdicionInterna ? (
                <>
                  <Button
                    onClick={handleGuardarEdicionInterna}
                    variant="outline"
                    size="sm"
                    className="bg-[#2D9561] text-white hover:bg-[#267d50] border-0"
                  >
                    <Check className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Enregistrer les articles</span>
                  </Button>
                  <Button
                    onClick={handleCancelarEdicionInterna}
                    variant="outline"
                    size="sm"
                    className="bg-white text-[#334155] hover:bg-slate-50 border-[#dbe4ee]"
                  >
                    <X className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Annuler les modifications</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleIniciarEdicionInterna}
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#1E73BE] hover:bg-blue-50 border-[#dbe4ee]"
                >
                  <Edit2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Modifier les articles</span>
                </Button>
              )
            )}
            <Button
              onClick={() => setVistaCompacta((prev) => !prev)}
              variant="outline"
              size="sm"
              className="bg-white text-[#334155] hover:bg-slate-50 border-[#dbe4ee]"
            >
              {vistaCompacta ? <Maximize2 className="w-4 h-4 sm:mr-2" /> : <Minimize2 className="w-4 h-4 sm:mr-2" />}
              <span className="hidden sm:inline">{vistaCompacta ? 'Vue étendue' : 'Vue compacte'}</span>
            </Button>
            <Button
              onClick={handleImprimir}
              variant="outline"
              size="sm"
              className="bg-[#1E73BE] text-white hover:bg-[#1557A0] border-0"
            >
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Imprimer</span>
            </Button>
            <Button
              onClick={onCerrar}
              variant="outline"
              size="sm"
              className="bg-white text-[#1E73BE] hover:bg-blue-50 border-0"
            >
              <X className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Fermer</span>
            </Button>
          </div>
        </div>

        {/* Cambiar Estado de Preparación (no se imprime) */}
        {onCambiarEstado && (
          <div className={`mx-4 mb-4 bg-gray-50 rounded-lg print:hidden ${vistaCompacta ? 'p-3' : 'p-4'}`}>
            <p className={`font-medium text-[#333333] mb-3 ${vistaCompacta ? 'text-sm' : 'text-sm sm:text-base'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
              État de préparation
            </p>
            <div className="flex flex-wrap gap-2">
              {estadosDisponibles.map((estado) => (
                <Button
                  key={estado.valor}
                  onClick={() => onCambiarEstado(estado.valor)}
                  size="sm"
                  className={`${estado.color} text-white ${vistaCompacta ? 'text-[11px] h-8 px-3' : 'text-xs sm:text-sm'} ${
                    comanda.estado === estado.valor ? 'ring-2 ring-offset-2 ring-[#333333]' : ''
                  }`}
                >
                  {estado.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {!modoOrganismo && modoEdicionInterna && (
          <div className={`mx-4 mb-4 rounded-lg border border-[#dbe4ee] bg-slate-50 print:hidden ${vistaCompacta ? 'p-3.5' : 'p-4'}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <div className="flex-1 space-y-3">
                <p className="font-semibold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Ajouter un produit à la commande
                </p>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Filtre rapide
                  </p>
                  <Input
                    type="text"
                    value={filtroRapidoProducto}
                    onChange={(e) => setFiltroRapidoProducto(e.target.value)}
                    placeholder="Nom, code, catégorie..."
                    className="bg-white"
                  />
                  <p className="text-xs text-slate-500">
                    {productosFiltradosAgregar.length} produit{productosFiltradosAgregar.length > 1 ? 's' : ''} affiché{productosFiltradosAgregar.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    Seuls les produits avec quantité réservabile disponible sont proposés.
                  </p>
                </div>
                <select
                  value={productoAgregarId}
                  onChange={(e) => setProductoAgregarId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#dbe4ee] bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">Sélectionner un produit</option>
                  {productosFiltradosAgregar.map((producto: any) => (
                    <option key={producto.id} value={producto.id}>
                      {construirEtiquetaOpcionProducto(producto)}
                    </option>
                  ))}
                </select>
                {filtroRapidoProducto.trim() && productosFiltradosAgregar.length === 0 && (
                  <p className="text-xs text-amber-700">
                    Aucun produit ne correspond à ce filtre.
                  </p>
                )}
                {productoAgregarSeleccionado && (
                  <div className="rounded-xl border border-[#cfe0f2] bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-2xl shadow-inner">
                        {productoAgregarSeleccionado.icono || '📦'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {obtenerEtiquetaProducto(productoAgregarSeleccionado)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Code: {productoAgregarSeleccionado.codigo || 'N/A'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-[#EAF4FF] px-2.5 py-1 font-medium text-[#1E73BE]">
                            Poids unitaire: {typeof productoAgregarSeleccionado.pesoUnitario === 'number' && productoAgregarSeleccionado.pesoUnitario > 0 ? `${formatearCantidadProducto(productoAgregarSeleccionado.pesoUnitario)} kg` : 'N/A'}
                          </span>
                          <span className="rounded-full bg-[#EDF8EE] px-2.5 py-1 font-medium text-[#2E7D32]">
                            Ajoutable: {formatearCantidadProducto(obtenerStockDisponibleProducto(productoAgregarSeleccionado))} {productoAgregarSeleccionado.unidad || 'kg'}
                          </span>
                          <span className="rounded-full bg-[#FFF6E8] px-2.5 py-1 font-medium text-[#B46900]">
                            Unité: {productoAgregarSeleccionado.unidad || 'kg'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2 lg:w-40">
                <p className="text-sm font-medium text-slate-700">Quantité</p>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={cantidadAgregarProducto}
                  onChange={(e) => setCantidadAgregarProducto(e.target.value)}
                />
              </div>
              <Button onClick={handleAgregarProductoInterno} className="bg-[#1E73BE] text-white hover:bg-[#1557A0]">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter produit
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              En mode interne, vous pouvez augmenter, diminuer ou compléter les articles puis enregistrer la commande.
            </p>
          </div>
        )}

        {/* 🎯 NUEVO: Indicador de Progreso de Preparación (no se imprime) */}
        {comanda.estado === 'en_preparacion' && !modoOrganismo && (
          <div className={`mx-4 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-[#FFC107] rounded-lg print:hidden ${vistaCompacta ? 'p-3.5' : 'p-5'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-[#F57C00] mb-1 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                  📦 Progrès de préparation
                </p>
                <p className="text-sm text-[#666666]">
                  Cochez les produits au fur et à mesure de la préparation
                </p>
              </div>
              <div className="flex flex-col items-end text-right">
                <p className="text-3xl font-bold" style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: porcentajeCompletado === 100 ? '#4CAF50' : porcentajeCompletado > 50 ? '#FFC107' : '#DC3545'
                }}>
                  {productosCompletadosCount}/{totalProductos}
                </p>
                <p className="text-xs text-[#666666] mt-1">Produits prêts</p>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full transition-all duration-300 ease-out flex items-center justify-center text-white text-xs font-bold"
                style={{
                  width: `${porcentajeCompletado}%`,
                  backgroundColor: porcentajeCompletado === 100 ? '#4CAF50' : porcentajeCompletado > 50 ? '#FFC107' : '#1E73BE'
                }}
              >
                {porcentajeCompletado > 10 && `${Math.round(porcentajeCompletado)}%`}
              </div>
            </div>
            
            {porcentajeCompletado === 100 && (
              <div className="mt-3 flex items-center gap-2 text-[#4CAF50]">
                <Check className="w-5 h-5" />
                <p className="font-semibold text-sm">✨ Tous les produits sont prêts. Vous pouvez passer l'état à « Complétée ».</p>
              </div>
            )}
          </div>
        )}

        {/* Notificación al Organismo (no se imprime) */}
        {!modoOrganismo && comanda.estado === 'completada' && organismo && (
          <div className={`mb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-[#4CAF50] print:hidden ${vistaCompacta ? 'p-3.5' : 'p-4'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-[#4CAF50] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                  🎉 Commande complétée - prête à notifier
                </p>
                <p className="text-sm text-[#666666]">
                  La commande est prête. Envoyez une notification à l'organisme avec le lien d'accès direct.
                </p>
              </div>
              <NotificacionComanda comanda={comanda} organismo={organismo} />
            </div>
          </div>
        )}

        {/* Acciones del Organismo (no se imprime) */}
        {modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'confirmada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' && (
          <div className={`mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-[#1E73BE] print:hidden ${vistaCompacta ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-[#1E73BE] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.2rem' }}>
                  Actions de la commande
                </p>
                <p className="text-sm text-[#666666]">
                  Cliquez directement sur une quantité pour la modifier, ou acceptez la commande complète
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAceptarTodo}
                className="flex-1 bg-[#4CAF50] text-white hover:bg-green-600 border-0"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Check className="w-5 h-5 mr-2" />
                Accepter tout
              </Button>
              <Button
                onClick={handleAnular}
                variant="outline"
                className="flex-1 bg-[#DC3545] text-white hover:bg-red-700 border-0"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Ban className="w-5 h-5 mr-2" />
                Annuler la commande
              </Button>
            </div>

            {hayCambiosCantidad && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-[#FFC107] rounded">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#333333] mb-1">Quantités modifiées</p>
                    <p className="text-sm text-[#666666] mb-3">
                      Certaines quantités ont été modifiées. Vous pouvez continuer à en ajuster d'autres ou confirmer les changements.
                    </p>
                    <Button
                      onClick={handleAceptarModificado}
                      className="bg-[#4CAF50] text-white hover:bg-green-600"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmer les quantités modifiées
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modelo de Comanda (se imprime) */}
        <div ref={comandaRef} className={`print:p-0 ${estiloContenedorComanda}`} data-comanda-print>
          {/* Encabezado */}
          <div className={`${vistaCompacta ? 'mb-5 rounded-[24px] border border-[#d7e3ef] bg-[linear-gradient(135deg,#f7fbff_0%,#eef6fb_48%,#f6fbf7_100%)] p-4 shadow-[0_18px_42px_-36px_rgba(15,45,71,0.35)]' : 'border-b-4 border-[#1E73BE] pb-6 mb-6'}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {vistaCompacta && (
                  <span className="mb-2 inline-flex rounded-full border border-[#cfe0ee] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1E73BE] shadow-sm">
                    Recu de commande
                  </span>
                )}
                <h1 className="font-bold text-[#1E73BE] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: vistaCompacta ? '1.75rem' : '2.5rem', letterSpacing: vistaCompacta ? '-0.03em' : undefined }}>
                  {nombreSistemaImpresion}
                </h1>
                <p className="text-[#475569] mb-1" style={{ fontSize: vistaCompacta ? '0.95rem' : '1.1rem', fontWeight: vistaCompacta ? 500 : undefined }}>Système de gestion des commandes</p>
                <p className="text-[#64748b] text-sm">{brandingPrint.address || 'Laval, Québec, Canada'}</p>
                {brandingPrint.phone && <p className="text-[#64748b] text-sm">{brandingPrint.phone}</p>}
                {vistaCompacta && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#dbe7f1] bg-white/90 px-3 py-2 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Commande</p>
                      <p className="mt-1 font-semibold text-slate-800">{comanda.numero}</p>
                    </div>
                    <div className="rounded-2xl border border-[#dbe7f1] bg-white/90 px-3 py-2 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Créée le</p>
                      <p className="mt-1 font-semibold text-slate-800">{formatDisplayDate(comanda.fecha)}</p>
                    </div>
                    <div className="rounded-2xl border border-[#dbe7f1] bg-white/90 px-3 py-2 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Statut</p>
                      <div className="mt-1">
                        <Badge className={`${estadoActual?.color || 'bg-slate-500'} border-0 shadow-sm`}>
                          {estadoActual?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className={`flex flex-col items-end text-right ${vistaCompacta ? 'rounded-[22px] border border-[#d4e1ec] bg-white/92 p-3 shadow-[0_18px_40px_-34px_rgba(15,45,71,0.3)]' : ''}`}>
                <div className={`bg-white p-2 rounded-lg shadow-md qrcode-container ${vistaCompacta ? 'mb-2 border border-[#e2ebf3]' : 'mb-4'}`}>
                  <BrandedQRCode
                    value={qrData}
                    size={tamanoQr}
                    level={COMANDA_QR_SVG_LEVEL}
                    includeMargin={true}
                    data-testid="qr-code"
                  />
                </div>
                {!vistaCompacta && (
                  <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.3rem', fontFamily: 'Montserrat, sans-serif' }}>
                    {comanda.numero}
                  </p>
                )}
                {modoOrganismo && comanda.estado === 'pendiente' && (
                  <div className="mt-3 w-[20rem] max-w-full rounded-lg border-l-4 border-t border-r border-b border-[#F6C26B] border-l-[#C27A00] bg-gradient-to-r from-[#FFF3D6] to-[#FFE7B8] p-3 text-left shadow-sm print:hidden">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B46900]" />
                      <div>
                        <p className="font-bold text-[#7A4200] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Acceptation requise avant la date prévue
                        </p>
                        <p className="text-sm leading-5 text-[#7A4200]">
                          Si cette commande n’est pas acceptée avant le {formatDisplayDate(comanda.fechaEntrega || comanda.fecha)}, elle sera annulée automatiquement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {(comanda.grupoDistribucionAnclada || comanda.fechaCaducidadGrupo) && (
                  <div className="mt-3 flex flex-col items-end gap-2">
                    {comanda.grupoDistribucionAnclada && (
                      <Badge className="border border-[#1E73BE]/20 bg-[#EAF4FF] text-[#1E73BE] hover:bg-[#EAF4FF]">
                        Distribution ancrée
                      </Badge>
                    )}
                    {comanda.fechaCaducidadGrupo && (
                      <Badge className="border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]">
                        Péremption: {formatDisplayDate(comanda.fechaCaducidadGrupo)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className={`grid grid-cols-1 ${vistaCompacta ? 'xl:grid-cols-[1.45fr_0.8fr_0.85fr] gap-3' : 'xl:grid-cols-1 gap-0'}`}>
            <div className={`${vistaCompacta ? estiloTarjetaCompacta : 'bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9] rounded-xl shadow-lg mb-8 p-4 sm:p-6 border-4 border-[#1E73BE]'}`}>
              <p className={estiloEtiquetaCompacta} style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                Organisme destinataire
              </p>
              <h2 className="font-bold text-[#1E73BE] mb-3" style={{ fontFamily: 'Montserrat, sans-serif', lineHeight: '1.1', fontSize: vistaCompacta ? '1.7rem' : 'clamp(1.25rem, 2.3vw, 2.5rem)' }}>
                {organismo?.nombre || 'Sans organisme'}
              </h2>
              <div className={`grid ${vistaCompacta ? 'grid-cols-1 gap-2.5' : 'grid-cols-1 sm:grid-cols-2 gap-4 text-sm'}`}>
                <div className={vistaCompacta ? 'rounded-2xl bg-[#f8fbff] px-3 py-2.5' : ''}>
                  <p className={vistaCompacta ? estiloValorCompacto : 'text-[#666666]'}><strong>Adresse :</strong> {organismo?.direccion || 'N/A'}</p>
                  <p className={vistaCompacta ? estiloValorCompacto : 'text-[#666666]'}><strong>Téléphone :</strong> {organismo?.telefono || 'N/A'}</p>
                </div>
                <div className={vistaCompacta ? 'rounded-2xl bg-[#f8fbff] px-3 py-2.5' : ''}>
                  <p className={vistaCompacta ? estiloValorCompacto : 'text-[#666666]'}><strong>Responsable :</strong> {organismo?.responsable || 'N/A'}</p>
                  <p className={vistaCompacta ? estiloValorCompacto : 'text-[#666666]'}><strong>Courriel :</strong> {organismo?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className={`${vistaCompacta ? `${estiloTarjetaCompacta} border-[#f3dfb1] bg-[linear-gradient(180deg,#fffef9_0%,#fff8e7_100%)]` : 'bg-[#FFF8E1] border-2 border-[#FFC107] rounded-lg mb-8 p-4 sm:p-5'}`}>
              <p className={`font-bold text-[#C98800] mb-3 flex items-center gap-2 ${vistaCompacta ? 'text-sm' : 'text-base sm:text-lg'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                📅 Rendez-vous de collecte
              </p>
              <div className={`space-y-1.5 ${vistaCompacta ? 'text-[13px]' : 'text-sm sm:text-base'}`}>
                <p className={vistaCompacta ? 'text-slate-700 leading-5' : 'text-[#333333]'}>
                  <strong>Jour :</strong> {comanda.fechaEntrega ? 
                    formatDisplayDate(comanda.fechaEntrega, { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : dia}
                </p>
                <p className={vistaCompacta ? 'text-slate-700 leading-5' : 'text-[#333333]'}>
                  <strong>Heure :</strong> {comanda.horaRecogida || hora}
                </p>
                {comanda.fechaLimiteRespuesta && (
                  <p className="text-xs sm:text-sm text-[#DC3545] mt-2 font-medium rounded-xl bg-white/80 px-2.5 py-2 border border-[#f6d0d0]">
                    ⚠️ À confirmer avant le : {formatDisplayDate(comanda.fechaLimiteRespuesta)}
                  </p>
                )}
              </div>
            </div>
            
            <div className={`${vistaCompacta ? `${estiloTarjetaCompacta} border-[#d5e8db] bg-[linear-gradient(180deg,#fbfefc_0%,#eef8f2_100%)]` : 'bg-[#E8F5E9] border-2 border-[#4CAF50] rounded-lg mb-8 p-4 sm:p-5'}`}>
              <p className={`font-bold text-[#2D9561] mb-3 flex items-center gap-2 ${vistaCompacta ? 'text-sm' : 'text-base sm:text-lg'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                👤 Informations de préparation
              </p>
              <div className={`space-y-1.5 ${vistaCompacta ? 'text-[13px]' : 'text-sm sm:text-base'}`}>
                <p className={vistaCompacta ? 'text-slate-700 leading-5' : 'text-[#333333]'}>
                  <strong>Préparée par :</strong> {comanda.usuarioCreacion || 'Non attribué'}
                </p>
                <p className={vistaCompacta ? 'text-slate-700 leading-5' : 'text-[#333333]'}>
                  <strong>Date de création :</strong> {formatDisplayDate(comanda.fecha)}
                </p>
                <p className={vistaCompacta ? 'text-slate-700 leading-5' : 'text-[#333333]'}>
                  <strong>Heure de création :</strong> {new Date(comanda.fecha).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                </p>
                {!vistaCompacta && (
                <p className="text-[#333333]">
                  <strong>État :</strong>{' '}
                  <Badge className={estadoActual?.color}>
                    {estadoActual?.label}
                  </Badge>
                </p>
                )}
              </div>
            </div>
          </div>

          {(comanda.grupoDistribucionId || comanda.fechaCaducidadGrupo) && !modoOrganismo && (
            <div ref={bloqueGrupoRef} className={`rounded-xl border-2 border-[#90CAF9] bg-[#F4F9FF] ${vistaCompacta ? 'mb-4 p-3.5' : 'mb-8 p-4 sm:p-5'}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#666666]">Distribution de groupe</p>
                  <h3 className="text-lg font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {comanda.grupoDistribucionEtiqueta || comanda.grupoDistribucionId || 'Distribution de groupe'}
                  </h3>
                </div>
                <Badge className={grupoAncladoEditado ? 'bg-[#1E73BE]' : 'bg-gray-500'}>
                  {grupoAncladoEditado ? 'Ancrée' : 'Non ancrée'}
                </Badge>
              </div>

              {modoEdicionGrupo ? (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#333333]">Date de péremption de la distribution</label>
                      <Input
                        type="date"
                        value={fechaCaducidadGrupoEditada}
                        onChange={(e) => setFechaCaducidadGrupoEditada(e.target.value)}
                        disabled={distribucionGrupoFinalizada}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#333333]">Observations de la distribution</label>
                      <Textarea
                        value={observacionesGrupoEditadas}
                        onChange={(e) => setObservacionesGrupoEditadas(e.target.value)}
                        placeholder="Notes partagées pour toute la distribution"
                        className="min-h-[110px]"
                        disabled={distribucionGrupoFinalizada}
                      />
                    </div>
                    <label className="flex items-start gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={grupoAncladoEditado}
                        onChange={(e) => setGrupoAncladoEditado(e.target.checked)}
                        disabled={distribucionGrupoFinalizada}
                      />
                      <span>
                        <span className="block font-medium">Conserver la distribution ancrée</span>
                        <span className="block text-xs text-gray-500 mt-1">
                          La date de péremption et les observations restent toujours liées à toute la distribution.
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setModoEdicionGrupo(false)}>
                      Annuler
                    </Button>
                    <Button className="bg-[#1E73BE] hover:bg-[#1557A0]" onClick={handleGuardarMetadatosGrupo} disabled={distribucionGrupoFinalizada}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 text-sm text-[#333333]">
                    <p>
                      <strong>Date de péremption de la distribution :</strong>{' '}
                      {comanda.fechaCaducidadGrupo
                        ? formatDisplayDate(comanda.fechaCaducidadGrupo)
                        : 'Non définie'}
                    </p>
                    <p>
                      <strong>Portée des modifications :</strong> Toute la distribution de groupe
                    </p>
                    <p>
                      <strong>Observations de la distribution :</strong>{' '}
                      {comanda.observaciones?.trim() ? comanda.observaciones : 'Aucune observation'}
                    </p>
                    {distribucionGrupoFinalizada && (
                      <p className="font-medium text-[#8D6E63]">Cette distribution est finalisée et n’est plus modifiable.</p>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setModoEdicionGrupo(true)} disabled={distribucionGrupoFinalizada}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Modifier la distribution
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Productos organizados por temperatura */}
          <div className={vistaCompacta ? 'mb-5 rounded-[24px] border border-[#dce6f0] bg-white/96 p-4 shadow-[0_20px_40px_-34px_rgba(15,45,71,0.28)]' : 'mb-6'}>
            <h2 className={`font-bold text-[#1E73BE] pb-2 flex items-center gap-3 ${vistaCompacta ? 'mb-4 border-b border-[#dce6f0]' : 'mb-4 border-b-4 border-[#1E73BE]'}`} 
                style={{ fontFamily: 'Montserrat, sans-serif', fontSize: vistaCompacta ? '1.1rem' : '1.5rem' }}>
              <Thermometer className={vistaCompacta ? 'w-5 h-5' : 'w-6 h-6'} />
              Produits par température d'entreposage
            </h2>

            {Object.entries(productosAgrupados).map(([temperatura, items]) => {
              if (items.length === 0) return null;
              
              const colorConfig = {
                'Température ambiante': { 
                  bg: 'bg-[#FFF8E1]', 
                  border: 'border-[#FFC107]', 
                  text: 'text-[#F57C00]',
                  icon: <Sun className="w-6 h-6 text-[#FFC107]" />
                },
                'Réfrigéré': { 
                  bg: 'bg-[#E3F2FD]', 
                  border: 'border-[#1E73BE]', 
                  text: 'text-[#1E73BE]',
                  icon: <Thermometer className="w-6 h-6 text-[#1E73BE]" />
                },
                'Congelé': { 
                  bg: 'bg-[#E1F5FE]', 
                  border: 'border-[#0288D1]', 
                  text: 'text-[#0277BD]',
                  icon: <Snowflake className="w-6 h-6 text-[#0288D1]" />
                }
              };

              const config = colorConfig[temperatura as keyof typeof colorConfig];
              
              return (
                <div key={temperatura} className={`${vistaCompacta ? 'mb-4' : 'mb-8'} break-inside-avoid`}>
                  <div className={`flex items-center gap-3 mb-3 ${config.bg} border ${config.border} ${vistaCompacta ? 'rounded-2xl p-3 shadow-sm' : 'p-4 rounded-lg border-2'}`}>
                    {config.icon}
                    <h3 className={`font-bold ${config.text} ${vistaCompacta ? 'text-sm sm:text-base' : 'text-base sm:text-lg lg:text-xl'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {obtenerEtiquetaTemperatura(temperatura)}
                    </h3>
                    <Badge className="bg-[#4CAF50] ml-auto text-xs sm:text-sm border-0 shadow-sm" style={{ padding: '0.3rem 0.6rem' }}>
                      {items.length} produit{items.length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className={`overflow-x-auto ${vistaCompacta ? 'rounded-[20px] border border-[#deE7ef] bg-white shadow-sm' : ''}`}>
                    <Table className={vistaCompacta ? 'border-0' : 'border-2 border-gray-300'}>
                      <TableHeader>
                        <TableRow className={vistaCompacta ? 'bg-[#f5f8fb]' : 'bg-gray-100'}>
                          {/* 🎯 NUEVO: Columna para checkbox de progreso */}
                          {comanda.estado === 'en_preparacion' && !modoOrganismo && (
                            <TableHead className={`font-bold text-center ${vistaCompacta ? 'text-[11px] w-12 text-slate-500' : 'text-xs sm:text-sm w-16'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>✓</TableHead>
                          )}
                          <TableHead className={`font-bold ${vistaCompacta ? 'text-[11px] px-3 py-3 text-slate-500' : 'text-xs sm:text-sm'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>Icône</TableHead>
                          <TableHead className={`font-bold ${vistaCompacta ? 'text-[11px] px-3 py-3 text-slate-500' : 'text-xs sm:text-sm'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>Code</TableHead>
                          <TableHead className={`font-bold ${vistaCompacta ? 'text-[11px] px-3 py-3 text-slate-500' : 'text-xs sm:text-sm'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>Produit</TableHead>
                          <TableHead className={`font-bold ${vistaCompacta ? 'text-[11px] px-3 py-3 text-slate-500' : 'text-xs sm:text-sm'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>Lot</TableHead>
                          <TableHead className={`font-bold text-center ${vistaCompacta ? 'text-[11px] px-3 py-3 text-slate-500' : 'text-xs sm:text-sm'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>Quantité</TableHead>
                          <TableHead className={`font-bold text-center ${vistaCompacta ? 'text-[11px] px-3 py-3 text-slate-500' : 'text-xs sm:text-sm'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>Unité</TableHead>
                          {comanda.estado === 'completada' && (
                            <TableHead className={`font-bold text-center ${vistaCompacta ? 'text-[11px] px-3 py-3 text-slate-500' : 'text-xs sm:text-sm'}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>Livré</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item: any, index: number) => {
                                  const itemKey = getItemKey(item, index);
                          return (
                            <TableRow key={itemKey} className={vistaCompacta ? 'border-b border-[#edf2f7] last:border-b-0 hover:bg-[#f8fbff]' : 'hover:bg-gray-50'}>
                              {/* 🎯 NUEVO: Checkbox para marcar producto como completado */}
                              {comanda.estado === 'en_preparacion' && !modoOrganismo && (
                                <TableCell className={`text-center ${vistaCompacta ? 'px-2 py-2' : ''}`}>
                                  <input
                                    type="checkbox"
                                    checked={productosCompletados[itemKey] || false}
                                    onChange={() => toggleProductoCompletado(itemKey)}
                                    className={`${vistaCompacta ? 'w-4 h-4' : 'w-5 h-5'} cursor-pointer accent-[#4CAF50]`}
                                    title="Marquer comme complété"
                                  />
                                </TableCell>
                              )}
                              <TableCell className={`text-center ${vistaCompacta ? 'px-3 py-3' : ''}`}>
                                {item.producto?.icono ? (
                                  <span className={vistaCompacta ? 'text-2xl' : 'text-3xl'}>{item.producto.icono}</span>
                                ) : (
                                  <Box className={`${vistaCompacta ? 'w-5 h-5' : 'w-6 h-6'} text-gray-400 mx-auto`} />
                                )}
                              </TableCell>
                              <TableCell className={`font-mono font-medium ${vistaCompacta ? 'px-3 py-3 text-[11px] text-slate-600' : ''}`}>{item.producto?.codigo || 'N/A'}</TableCell>
                              <TableCell className={vistaCompacta ? 'px-3 py-3' : ''}>
                                <div className="flex flex-col">
                                  <span className={`font-medium text-[#1f2937] ${vistaCompacta ? 'text-[12px] leading-4' : ''}`}>
                                    {obtenerEtiquetaProducto(item.producto, item.nombreProducto)}
                                  </span>
                                  <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 font-medium mt-1 ${vistaCompacta ? 'text-[10px]' : 'text-xs'} ${getTemperatureBadgeStyle(item.temperatura)}`}>
                                    {getTemperaturaIcon(item.temperatura)}
                                    {obtenerEtiquetaTemperatura(item.temperatura)}
                                  </span>
                                  <span className={`text-[#666666] mt-1 ${vistaCompacta ? 'text-[10px]' : 'text-[11px]'}`}>
                                    Entrée: {obtenerNombreOriginalTemperatura(item.temperaturaOriginalEntrada)}
                                  </span>
                                  {obtenerPoidsUnitaire(item.producto) && (
                                    <span className={`text-[#666666] mt-1 ${vistaCompacta ? 'text-[10px]' : 'text-xs'}`}>
                                      {obtenerPoidsUnitaire(item.producto)}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className={`text-[#666666] ${vistaCompacta ? 'px-3 py-3 text-[11px] text-slate-500' : 'text-sm'}`}>
                                {item.producto?.lote || 'N/A'}
                              </TableCell>
                              <TableCell className={`text-center ${vistaCompacta ? 'px-3 py-3' : ''}`}>
                                {modoEdicionInterna || modoEdicion || campoEditando === itemKey ? (
                                  <Input
                                    type="number"
                                    min={modoEdicionInterna ? '0.01' : '0'}
                                    step="0.01"
                                    max={modoEdicionInterna ? undefined : String(Math.round(item.cantidad))}
                                    value={String(getCantidadVisible(item, index))}
                                    onChange={(e) => handleCambioCantidad(itemKey, Number(e.target.value), item.cantidad)}
                                    onBlur={() => {
                                      if (!modoEdicionInterna) {
                                        setCampoEditando(null);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (!modoEdicionInterna) {
                                          setCampoEditando(null);
                                        }
                                      } else if (e.key === 'Escape') {
                                        setCantidadesEditadas(prev => ({
                                          ...prev,
                                          [itemKey]: item.cantidad
                                        }));
                                        if (!modoEdicionInterna) {
                                          setCampoEditando(null);
                                        }
                                      }
                                    }}
                                    autoFocus={!modoEdicionInterna}
                                    className={`${vistaCompacta ? 'w-16 h-8 text-sm' : 'w-20'} text-center font-bold text-[#1E73BE]`}
                                  />
                                ) : (
                                  <span
                                    className={`font-bold text-[#1E73BE] ${modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' ? 'cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition-colors' : ''}`}
                                    style={{ fontSize: vistaCompacta ? '1rem' : '1.2rem' }}
                                    onClick={() => {
                                      if (modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada') {
                                        setCampoEditando(itemKey);
                                      }
                                    }}
                                    title={modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' ? 'Cliquer pour modifier' : ''}
                                  >
                                    {getCantidadVisible(item, index) !== item.cantidad ? (
                                      <span className="flex items-center justify-center gap-1">
                                        <span className="line-through text-gray-400 text-sm">{formatQuantity(item.cantidad)}</span>
                                        <span className="text-[#FFC107]">{formatQuantity(getCantidadVisible(item, index))}</span>
                                      </span>
                                    ) : (
                                      formatQuantity(item.cantidad)
                                    )}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className={`text-center text-[#666666] font-medium ${vistaCompacta ? 'px-3 py-3 text-[11px] text-slate-500' : ''}`}>
                                {item.producto?.unidad || 'N/A'}
                              </TableCell>
                              {comanda.estado === 'completada' && (
                                <TableCell className={`text-center ${vistaCompacta ? 'px-2 py-2' : ''}`}>
                                  <Badge className="bg-[#4CAF50]" style={{ fontSize: vistaCompacta ? '0.85rem' : '1rem', padding: vistaCompacta ? '0.25rem 0.55rem' : '0.4rem 0.8rem' }}>
                                    {formatQuantity(item.cantidadEntregada || item.cantidad)}
                                  </Badge>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className={`${vistaCompacta ? 'mb-5 rounded-[24px] border border-[#dce6f0] bg-white/96 p-4 shadow-[0_20px_40px_-34px_rgba(15,45,71,0.28)]' : 'border-t-4 border-[#1E73BE] pt-6 mb-8'}`}>
            <h3 className="font-bold text-[#333333] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: vistaCompacta ? '1.1rem' : '1.3rem' }}>
              Résumé de la commande
            </h3>
            <div className={`grid text-center ${vistaCompacta ? 'grid-cols-2 lg:grid-cols-5 gap-2.5' : 'grid-cols-5 gap-4'}`}>
              <div className={`${vistaCompacta ? 'rounded-2xl border border-[#d5e4f0] bg-[#f7fbff] p-3 shadow-sm' : 'bg-blue-50 border-2 border-[#1E73BE] rounded-lg p-5'}`}>
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Total des produits</p>
                <p className="font-bold text-[#1E73BE]" style={{ fontSize: vistaCompacta ? '1.55rem' : '2rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosOrdenados.length}
                </p>
              </div>
              <div className={`${vistaCompacta ? 'rounded-2xl border border-[#d8e9dc] bg-[#f6fcf8] p-3 shadow-sm' : 'bg-green-50 border-2 border-[#4CAF50] rounded-lg p-5'}`}>
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Poids total</p>
                <p className="font-bold text-[#4CAF50]" style={{ fontSize: vistaCompacta ? '1.2rem' : '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {formatQuantity(productosOrdenados.reduce((sum: number, item: any, index: number) => sum + getCantidadVisible(item, index), 0))} kg
                </p>
              </div>
              <div className={`${vistaCompacta ? 'rounded-2xl border border-[#f0dec5] bg-[#fff8ef] p-3 shadow-sm' : 'bg-orange-50 border-2 border-[#FF9800] rounded-lg p-5'}`}>
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Valeur monétaire</p>
                <p className="font-bold text-[#FF9800]" style={{ fontSize: vistaCompacta ? '1.05rem' : '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  CAD$ {formatMoney(productosOrdenados.reduce((sum: number, item: any) => {
                    const index = productosOrdenados.findIndex((productoActual: any) => productoActual === item);
                    const cantidad = getCantidadVisible(item, index);
                    return sum + (cantidad * obtenerValorUnitario(item));
                  }, 0))}
                </p>
              </div>
              <div className={`${vistaCompacta ? 'rounded-2xl border border-[#f2e2b4] bg-[#fffbed] p-3 shadow-sm' : 'bg-yellow-50 border-2 border-[#FFC107] rounded-lg p-5'}`}>
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Ambiante</p>
                <p className="font-bold text-[#FFC107]" style={{ fontSize: vistaCompacta ? '1.2rem' : '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosAgrupados['Température ambiante'].length}
                </p>
              </div>
              <div className={`${vistaCompacta ? 'rounded-2xl border border-[#d6e6f3] bg-[#f2f9ff] p-3 shadow-sm' : 'bg-blue-50 border-2 border-[#0288D1] rounded-lg p-5'}`}>
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Réfrigéré/Congelé</p>
                <p className="font-bold text-[#0288D1]" style={{ fontSize: vistaCompacta ? '1.2rem' : '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosAgrupados['Réfrigéré'].length + productosAgrupados['Congelé'].length}
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {comanda.observaciones && (
            <div className={`${vistaCompacta ? 'mb-5 rounded-[22px] border border-[#f0dfb0] bg-[#fffaf0] p-4 shadow-sm' : 'bg-yellow-50 border-l-4 border-[#FFC107] rounded-lg mb-8 p-5'}`}>
              <p className="font-bold text-[#F57C00] mb-2 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: vistaCompacta ? '1rem' : '1.1rem' }}>
                📝 Observations importantes
              </p>
              <p className="text-[#333333]">{comanda.observaciones}</p>
            </div>
          )}

          {/* Firmas */}
          <div className={`grid ${vistaCompacta ? 'grid-cols-1 xl:grid-cols-2 gap-3 mt-4 pt-0' : 'grid-cols-2 gap-8 mt-8 pt-6'} ${vistaCompacta ? '' : 'border-t-4 border-gray-300'}`}>
            <div className={`${vistaCompacta ? 'rounded-[22px] border border-[#d8e9dc] bg-[#f8fcf9] p-4 shadow-sm' : 'bg-[#E8F5E9] rounded-lg border-2 border-[#4CAF50] p-5'}`}>
              <p className="font-bold text-[#4CAF50] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: vistaCompacta ? '1rem' : '1.1rem' }}>
                ✓ Préparée par
              </p>
              <div className="border-b-2 border-gray-400 mb-3" style={{ height: vistaCompacta ? '44px' : '60px' }}></div>
              <div className="text-sm text-[#333333] space-y-1">
                <p><strong>Nom :</strong> {comanda.usuarioCreacion || '_____________________'}</p>
                <p><strong>Date :</strong> {new Date(comanda.fecha).toLocaleDateString(defaultLocale)}</p>
                <p><strong>Heure :</strong> {new Date(comanda.fecha).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className={`${vistaCompacta ? 'rounded-[22px] border border-[#d7e4f0] bg-[#f7fbff] p-4 shadow-sm' : 'bg-[#E3F2FD] rounded-lg border-2 border-[#1E73BE] p-5'}`}>
              <p className="font-bold text-[#1E73BE] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: vistaCompacta ? '1rem' : '1.1rem' }}>
                ✓ Reçu par ({organismo?.nombre})
              </p>
              <div className="border-b-2 border-gray-400 mb-3" style={{ height: vistaCompacta ? '44px' : '60px' }}></div>
              <div className="text-sm text-[#333333] space-y-1">
                <p><strong>Nom :</strong> {personaAutorizada?.nombreCompleto || organismo?.responsable || '_____________________'}</p>
                {personaAutorizada && (
                  <>
                    <p><strong>Fonction :</strong> {personaAutorizada.cargo}</p>
                    <p><strong>Téléphone :</strong> {personaAutorizada.telefono}</p>
                  </>
                )}
                <p><strong>Date :</strong> _____________________</p>
                <p><strong>Heure :</strong> _____________________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`${vistaCompacta ? 'rounded-[20px] border border-[#dbe5ef] bg-[#f8fbfe] px-4 py-3 text-left' : 'mt-8 pt-4 border-t-2 text-center'} text-xs text-[#666666]`}>
            <p className="font-medium">Ce document est un reçu officiel de {nombreSistemaImpresion}</p>
            <p className="mt-1">
              {brandingContactLine
                ? `Pour toute question, scannez le code QR ou contactez-nous : ${brandingContactLine}`
                : 'Pour toute question, scannez le code QR pour retrouver les informations de la commande.'}
            </p>
            <p className="mt-1">© 2026 {nombreSistemaImpresion} - Système de gestion intégral</p>
          </div>
        </div>
      </DialogContent>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 1cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          [role="dialog"] {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          
          [role="dialog"] * {
            visibility: visible;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          
          .print\\:max-h-full {
            max-height: none !important;
          }
        }
      `}</style>
    </Dialog>
  );
}