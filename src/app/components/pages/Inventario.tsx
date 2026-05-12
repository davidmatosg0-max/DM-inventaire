import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Search,
  Filter,
  Grid3x3,
  List,
  Plus,
  ShoppingCart,
  FileText,
  Trash2,
  ArrowUpDown,
  Share2,
  Download,
  Send,
  Users,
  CheckSquare,
  Eye,
  X,
  Check,
  History,
  Copy,
  ArrowLeftRight,
  ArrowRightLeft,
  Undo2,
  Bookmark,
  HelpCircle,
  QrCode,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { COMANDAS_UPDATED_EVENT, obtenerComandas } from '../../utils/comandaStorage';
import { obtenerProductos, guardarProducto, actualizarProducto } from '../../utils/productStorage';
import { guardarEntrada } from '../../utils/entradaInventarioStorage';
import { mockProductos } from '../../data/mockData';
import { calcularValorMonetario, obtenerCategorias, actualizarPesoUnitarioSubcategoria, actualizarPesoUnitarioVariante } from '../../utils/categoriaStorage';
import { registrarActividad } from '../../utils/actividadLogger';
import { obtenerResumenReservasInventario } from '../../utils/inventoryReservations';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import type { Producto, ProductoCreado, HistorialEntrada, ProductoConversion, FormConversion, DatosQR } from '../../types';
import { filterByThreeLettersMultiple } from '../../utils/searchUtils';
import { formatLargeNumber, formatMoney, formatQuantity } from '../../utils/formatUtils';
import { loadLazyNamedModule } from '../../utils/lazyImportRecovery';
import { 
  guardarConversion, 
  revertirConversion,
  obtenerConversionesRecientes,
  obtenerPlantillasConversion,
  guardarPlantillaConversion,
  eliminarPlantillaConversion,
  incrementarUsoPlantilla,
  obtenerEstadisticasConversiones,
  type RegistroConversion,
  type PlantillaConversion
} from '../../utils/conversionStorage';
import { useBranding } from '../../../hooks/useBranding';
import { useCompactViewport } from '../../../hooks/useCompactViewport';
import { 
  migrarValoresMonetariosDesdeEntradas,
  recalcularValoresTotales,
  obtenerEstadisticasValoresMonetarios
} from '../../utils/migrarValoresMonetarios';
import { normalizeScannedLocationQR, normalizeScannedProductQR } from '../../utils/barcode';
import { normalizeScannedComandaQR } from '../../utils/comandaQr';
import { buildLocationOptions, buildLocationSections, loadLocationZones, resolveStandardLocation, type LocationZone } from '../../utils/locationZones';
import { printStandardLabel, type ProductLabelData } from '../etiquetas/StandardProductLabel';
import {
  clearPendingQrNavigation,
  navigateToQrPage,
  readPendingQrNavigation,
  savePendingQrNavigation,
} from '../../utils/pendingQrNavigation';
import {
  clearPendingEntrepotQuickAction,
  readPendingEntrepotQuickAction,
} from '../../utils/pendingEntrepotQuickAction';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { ModuleExecutiveStrip } from '../shared/ModuleExecutiveStrip';

type CarritoItem = {
  productoId: string;
  cantidad: number;
};

type ProductoSeleccionado = {
  id: string;
  seleccionado: boolean;
  cantidadCompartir?: number;
};

type ListaProductos = {
  id: string;
  nombre: string;
  fecha: string;
  productos: string[];
  incluirStock: boolean;
  incluirPrecios: boolean;
  incluirKg: boolean; // Nueva opción para mostrar en kg
  compartidaCon: string[];
};

type AccionUbicacionEscaneada = 'localizar_productos' | 'delocalizar_productos';

type UbicacionEscaneadaPendiente = {
  ubicacion: string;
  action: AccionUbicacionEscaneada;
};

type FormAjoutStockExistant = {
  productoId: string;
  cantidad: string;
  lote: string;
  fechaCaducidad: string;
};

const FORM_AJOUT_STOCK_EXISTANT_INITIAL: FormAjoutStockExistant = {
  productoId: '',
  cantidad: '',
  lote: '',
  fechaCaducidad: '',
};

const categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string; label: string }> = {
  'Alimentos Secos': { icono: '🍚', valorMonetario: 2.50, color: '#e8a419', label: 'Aliments secs' },
  'Conservas': { icono: '🥫', valorMonetario: 3.50, color: '#2d9561', label: 'Conserves' },
  'Lácteos': { icono: '🥛', valorMonetario: 4.00, color: '#1a4d7a', label: 'Produits laitiers' },
  'Frutas y Verduras': { icono: '🥬', valorMonetario: 3.00, color: '#2d9561', label: 'Fruits et legumes' },
  'Proteínas': { icono: '🥩', valorMonetario: 5.50, color: '#c23934', label: 'Proteines' },
  'Panadería': { icono: '🍞', valorMonetario: 2.00, color: '#FFA726', label: 'Boulangerie' },
  'Bebidas': { icono: '🧃', valorMonetario: 1.50, color: '#29B6F6', label: 'Boissons' },
  'Aceites y Condimentos': { icono: '🫒', valorMonetario: 4.50, color: '#66BB6A', label: 'Huiles et condiments' },
};

function lazyNamed<T extends React.ComponentType<any>>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string
) {
  return lazy(() => loadLazyNamedModule<T>(factory, exportName, `inventario:${exportName}`));
}

const CarritoMejorado = lazyNamed(() => import('../inventario/CarritoMejorado'), 'CarritoMejorado');
const HistorialEntradasCompacto = lazyNamed(() => import('../inventario/HistorialEntradasCompacto'), 'HistorialEntradasCompacto');
const HistorialProductoDialog = lazyNamed(() => import('../inventario/HistorialProductoDialog'), 'HistorialProductoDialog');
const TransformarProductoDialog = lazyNamed(() => import('../inventario/TransformarProductoDialog'), 'TransformarProductoDialog');
const EntradaDonAchat = lazyNamed(() => import('../EntradaDonAchat'), 'EntradaDonAchat');
const ValidacionEntradasDialog = lazyNamed(() => import('../inventario/ValidacionEntradasDialog'), 'ValidacionEntradasDialog');
const AnalisisPredictivoStock = lazyNamed(() => import('../inventario/AnalisisPredictivoStock'), 'AnalisisPredictivoStock');
const ExportacionAvanzada = lazyNamed(() => import('../inventario/ExportacionAvanzada'), 'ExportacionAvanzada');
const ConversionUnidadesDialog = lazyNamed(() => import('../inventario/ConversionUnidadesDialog'), 'ConversionUnidadesDialog');
const MovimientosInventario = lazyNamed(() => import('../inventario/MovimientosInventario'), 'MovimientosInventario');
const ConversionDialog = lazyNamed(() => import('../conversion/ConversionDialog'), 'ConversionDialog');
const HistorialConversiones = lazyNamed(() => import('../conversion/HistorialConversiones'), 'HistorialConversiones');
const PlantillasConversion = lazyNamed(() => import('../conversion/PlantillasConversion'), 'PlantillasConversion');
const GuiaConversiones = lazyNamed(() => import('../conversion/GuiaConversiones'), 'GuiaConversiones');
const EscanerQRInventario = lazyNamed(() => import('../inventario/EscanerQRInventario'), 'EscanerQRInventario');

function DeferredPanel({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-[#666666]">Chargement...</div>}>
      {children}
    </Suspense>
  );
}

type UltimaDistribucionGrupoResumen = {
  grupoDistribucionId: string;
  grupoDistribucionEtiqueta: string;
  comandas: Array<{ numero: string; nombre: string; porcentaje: number }>;
};

function construirEtiquetaResumenDistribucion(
  etiquetaActual: string,
  fechaCaducidadGrupo?: string,
  modalidadDistribucion?: string,
): string {
  const prefix = modalidadDistribucion === 'collation' || etiquetaActual.toLowerCase().includes('collation')
    ? 'Distribution Collation'
    : 'Distribution de groupe';

  if (!fechaCaducidadGrupo) {
    return etiquetaActual;
  }

  return `${prefix} ${fechaCaducidadGrupo}`;
}

function sincronizarResumenDistribucionGrupo(
  resumen: UltimaDistribucionGrupoResumen | null,
): UltimaDistribucionGrupoResumen | null {
  if (!resumen) {
    return null;
  }

  const comandaReferencia = obtenerComandas().find(
    (comanda) => comanda.grupoDistribucionId === resumen.grupoDistribucionId,
  );

  if (!comandaReferencia) {
    return resumen;
  }

  const grupoDistribucionEtiqueta = construirEtiquetaResumenDistribucion(
    comandaReferencia.grupoDistribucionEtiqueta || resumen.grupoDistribucionEtiqueta,
    comandaReferencia.fechaCaducidadGrupo,
    comandaReferencia.modalidadDistribucion,
  );

  if (grupoDistribucionEtiqueta === resumen.grupoDistribucionEtiqueta) {
    return resumen;
  }

  return {
    ...resumen,
    grupoDistribucionEtiqueta,
  };
}

const ULTIMA_DISTRIBUCION_GRUPO_STORAGE_KEY = 'inventario_ultima_distribucion_grupo';

function cargarUltimaDistribucionGrupo(): UltimaDistribucionGrupoResumen | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ULTIMA_DISTRIBUCION_GRUPO_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as UltimaDistribucionGrupoResumen;
    if (!parsed?.grupoDistribucionId || !Array.isArray(parsed.comandas)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Erreur lors du chargement de la dernière distribution groupée:', error);
    return null;
  }
}

export function Inventario() {
  const { t, i18n } = useTranslation();
  const branding = useBranding();
  const translatedNewEntry = t('newEntry');
  const isFrenchLocale = !i18n.resolvedLanguage || i18n.resolvedLanguage.startsWith('fr');
  const newEntryLabel = isFrenchLocale
    ? 'Registrer Entrée'
    : translatedNewEntry !== 'newEntry'
      ? translatedNewEntry
      : i18n.resolvedLanguage?.startsWith('es')
        ? 'Nueva entrada'
        : i18n.resolvedLanguage?.startsWith('en')
          ? 'New entry'
          : i18n.resolvedLanguage?.startsWith('ar')
            ? 'إدخال جديد'
            : 'Registrer Entrée';
  const [activeTab, setActiveTab] = useState('productos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLote, setSearchLote] = useState('');
  const [searchUbicacion, setSearchUbicacion] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [vistaMode, setVistaMode] = useState<'grid' | 'list'>('list');
  const {
    isCompactViewport: isCompactInventoryViewport,
    viewportZoom: inventoryViewportZoom,
  } = useCompactViewport({
    compactHeight: 720,
    deps: [activeTab],
    resolveZoom: ({ height, isCompact }) => {
      const compactProductsOverview = isCompact && activeTab === 'productos';

      if (height < 600) {
        if (compactProductsOverview) {
          return 0.74;
        }

        return 0.72;
      }

      if (height < 700) {
        if (compactProductsOverview) {
          return 0.84;
        }

        return 0.86;
      }

      return 1;
    },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [ultimaDistribucionGrupoCreada, setUltimaDistribucionGrupoCreada] = useState<UltimaDistribucionGrupoResumen | null>(() => cargarUltimaDistribucionGrupo());
  const [sortBy, setSortBy] = useState<'nombre' | 'stock' | 'categoria' | 'valor'>('nombre');
  
  // Estado para forzar actualización de productos sin recargar página
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Estado para compartir lista de productos
  const [compartirDialogOpen, setCompartirDialogOpen] = useState(false);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [nombreLista, setNombreLista] = useState('');
  const [incluirStock, setIncluirStock] = useState(true);
  const [incluirPrecios, setIncluirPrecios] = useState(false);
  const [incluirKg, setIncluirKg] = useState(false); // Nueva opción para mostrar en kg
  const [organismosSeleccionados, setOrganismosSeleccionados] = useState<string[]>([]);
  const [modoCompartir, setModoCompartir] = useState<'individual' | 'grupo'>('grupo');
  const [listaGenerada, setListaGenerada] = useState<ListaProductos | null>(null);
  const [vistaPreviewLista, setVistaPreviewLista] = useState(false);
  
  // Estados para historial y transformación
  const [transformarDialogOpen, setTransformarDialogOpen] = useState(false);
  const [historialProductoDialogOpen, setHistorialProductoDialogOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoCreado | null>(null);
  
  // Estado para conversión de unidades
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [productoConversion, setProductoConversion] = useState<ProductoCreado | null>(null);
  
  // Estado para historial de entradas
  const [historialEntradasOpen, setHistorialEntradasOpen] = useState(false);
  
  // Estado para formulario de entrada
  const [entradaDonAchatOpen, setEntradaDonAchatOpen] = useState(false);
  const [ajoutStockExistantOpen, setAjoutStockExistantOpen] = useState(false);
  const [formAjoutStockExistant, setFormAjoutStockExistant] = useState<FormAjoutStockExistant>(FORM_AJOUT_STOCK_EXISTANT_INITIAL);
  
  // Estado para escáner QR
  const [escanerQROpen, setEscanerQROpen] = useState(false);
  const [scannerDefaultProductAction, setScannerDefaultProductAction] = useState<string | null>(null);
  const [productoEscaneado, setProductoEscaneado] = useState<ProductoCreado | null>(null);
  const [dialogLocalizacionOpen, setDialogLocalizacionOpen] = useState(false);
  const [ubicacionEscaneadaPendiente, setUbicacionEscaneadaPendiente] = useState<UbicacionEscaneadaPendiente | null>(null);
  const [quickCartQuantityDialogOpen, setQuickCartQuantityDialogOpen] = useState(false);
  const [quickCartProduct, setQuickCartProduct] = useState<ProductoCreado | null>(null);
  const [quickCartQuantity, setQuickCartQuantity] = useState('');
  const [quickCartResumeScannerAction, setQuickCartResumeScannerAction] = useState<string | null>(null);
  const [floatingButtonsDragging, setFloatingButtonsDragging] = useState(false);
  const [floatingButtonsPosition, setFloatingButtonsPosition] = useState({ x: 0, y: 0 });
  const [floatingButtonsDragStart, setFloatingButtonsDragStart] = useState({ x: 0, y: 0 });
  const [floatingButtonsDragDistance, setFloatingButtonsDragDistance] = useState(0);
  const floatingButtonsRef = React.useRef<HTMLDivElement>(null);

  const abrirEntradaInventario = () => {
    setEntradaDonAchatOpen(true);
  };

  const abrirAjoutStockExistant = () => {
    setFormAjoutStockExistant(FORM_AJOUT_STOCK_EXISTANT_INITIAL);
    setAjoutStockExistantOpen(true);
  };

  const handleAjoutStockExistantOpenChange = (open: boolean) => {
    setAjoutStockExistantOpen(open);
    if (!open) {
      setFormAjoutStockExistant(FORM_AJOUT_STOCK_EXISTANT_INITIAL);
    }
  };
  
  // Estados para nuevos componentes
  const [validacionEntradasOpen, setValidacionEntradasOpen] = useState(false);
  const [analisisPredictivo, setAnalisisPredictivo] = useState(false);
  const [exportacionOpen, setExportacionOpen] = useState(false);
  
  // Estados para subcategoría de producto
  const [subcategoriaDialogOpen, setSubcategoriaDialogOpen] = useState(false);
  const [productoBase, setProductoBase] = useState<ProductoCreado | null>(null);
  const [formSubcategoria, setFormSubcategoria] = useState({
    codigo: '',
    nombre: '',
    unidad: '',
    stockMinimo: 0,
    pesoUnitario: 0
  });
  
  // Alias para compatibilidad (formVariante es lo mismo que formSubcategoria)
  const formVariante = formSubcategoria;
  const setFormVariante = setFormSubcategoria;
  const varianteDialogOpen = subcategoriaDialogOpen;
  const setVarianteDialogOpen = setSubcategoriaDialogOpen;

  // Estados para conversión de productos
  const [conversionProductoDialogOpen, setConversionProductoDialogOpen] = useState(false);
  const [historialConversionesOpen, setHistorialConversionesOpen] = useState(false);
  const [plantillasConversionOpen, setPlantillasConversionOpen] = useState(false);
  const [guiaConversionesOpen, setGuiaConversionesOpen] = useState(false);
  const [formConversion, setFormConversion] = useState({
    productoOrigenId: '',
    productosDestino: [] as { productoId: string; ratio: number }[],
    cantidadOrigen: 0,
    merma: 0,
    mermaMotivo: '',
    observaciones: '',
    guardarComoPlantilla: false,
    nombrePlantilla: ''
  });
  const [conversionesRecientes, setConversionesRecientes] = useState<RegistroConversion[]>([]);
  const [plantillasConversion, setPlantillasConversion] = useState<PlantillaConversion[]>([]);

  // Obtener productos creados desde localStorage y combinarlos con mockProductos
  // Se actualiza cuando refreshKey cambia
  const productosCreados = React.useMemo(() => obtenerProductos(), [refreshKey]);
  
  // 🎯 PRIORIDAD: Los productos de localStorage sobrescriben mockProductos
  // Esto permite que las actualizaciones (conversiones, ediciones) se reflejen correctamente
  const todosLosProductos = React.useMemo(() => {
    const categoriasDB = obtenerCategorias();
    
    // Primero, tomar todos los productos de localStorage (mapeados)
    const productosLS = productosCreados.map(p => {
      // 🎯 SIEMPRE obtener el icono desde la configuración de categorías/subcategorías
      let iconoFinal = '📦'; // Default
      
      // Buscar el icono de la subcategoría en la configuración
      const categoriaObj = categoriasDB.find(c => c.nombre === p.categoria);
      const subcategoriaObj = categoriaObj?.subcategorias?.find(s => s.nombre === p.subcategoria);
      
      if (subcategoriaObj?.icono && subcategoriaObj.icono.trim() !== '') {
        iconoFinal = subcategoriaObj.icono;
      } else if (categoriaObj?.icono && categoriaObj.icono.trim() !== '') {
        iconoFinal = categoriaObj.icono;
      } else if (categoriasInfo[p.categoria]?.icono) {
        iconoFinal = categoriasInfo[p.categoria].icono;
      }
      
      // Log para debug
      if (!iconoFinal || iconoFinal === '📦') {
        console.log(`⚠️ Producto ${p.nombre}: icono=${iconoFinal}, cat=${p.categoria}, subcat=${p.subcategoria}`);
      }
      
      return {
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        subcategoria: p.subcategoria,
        unidad: p.unidad,
        stockActual: p.stockActual,
        stockMinimo: p.stockMinimo,
        ubicacion: p.ubicacion,
        lote: p.lote || '',
        fechaVencimiento: p.fechaVencimiento || '',
        esPRS: p.esPRS,
        foto: '',
        icono: iconoFinal,
        peso: p.peso,
        pesoRegistrado: p.pesoRegistrado,
        pesoUnitario: p.pesoUnitario || p.peso,
        varianteId: p.varianteId
      };
    });
    
    // Luego, agregar mockProductos que NO estén en localStorage
    const mockProductosFiltrados = mockProductos.filter(
      mp => !productosLS.some(p => p.id === mp.id)
    );
    
    return [...productosLS, ...mockProductosFiltrados];
  }, [productosCreados, refreshKey]);

  const productosDisponiblesParaAjout = React.useMemo(
    () => todosLosProductos
      .filter(producto => Boolean(producto.id) && Boolean(producto.nombre))
      .sort((left, right) => left.nombre.localeCompare(right.nombre)),
    [todosLosProductos]
  );

  const productoAjoutStockSeleccionado = React.useMemo(
    () => productosDisponiblesParaAjout.find(producto => producto.id === formAjoutStockExistant.productoId) || null,
    [productosDisponiblesParaAjout, formAjoutStockExistant.productoId]
  );

  const productoCreadoAjoutStockSeleccionado = React.useMemo(
    () => productosCreados.find(producto => producto.id === formAjoutStockExistant.productoId) || null,
    [productosCreados, formAjoutStockExistant.productoId]
  );

  const handleProductoAjoutStockChange = (productoId: string) => {
    const producto = productosCreados.find(item => item.id === productoId)
      || productosDisponiblesParaAjout.find(item => item.id === productoId);

    setFormAjoutStockExistant(prev => ({
      ...prev,
      productoId,
      lote: producto?.lote || '',
      fechaCaducidad: producto?.fechaVencimiento || '',
    }));
  };

  const obtenerUsuarioInventarioActual = () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario_sesion_banco_alimentos') || '{}');
      const nombreCompleto = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ').trim();
      return nombreCompleto || 'Utilisateur inventaire';
    } catch {
      return 'Utilisateur inventaire';
    }
  };

  const resolverTemperaturaAjoutStock = () => {
    const temperaturaBase = [
      (productoCreadoAjoutStockSeleccionado as any)?.temperaturaOriginalEntrada,
      (productoCreadoAjoutStockSeleccionado as any)?.temperaturaAlmacenamiento,
      (productoAjoutStockSeleccionado as any)?.temperatura,
    ].find((value): value is string => typeof value === 'string' && value.trim().length > 0);

    const valorNormalizado = temperaturaBase?.toLowerCase() || '';

    if (valorNormalizado.includes('congel')) return 'congelado' as const;
    if (valorNormalizado.includes('refrig')) return 'refrigerado' as const;
    return 'ambiente' as const;
  };

  const handleGuardarAjoutStockExistant = () => {
    if (!productoAjoutStockSeleccionado) {
      toast.error('Sélectionnez un produit existant');
      return;
    }

    const cantidad = Number.parseFloat(formAjoutStockExistant.cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      toast.error('Saisissez une quantité valide');
      return;
    }

    const pesoUnitario = productoCreadoAjoutStockSeleccionado?.pesoUnitario
      || productoAjoutStockSeleccionado.pesoUnitario
      || productoAjoutStockSeleccionado.peso
      || 0;

    const temperatura = resolverTemperaturaAjoutStock();
    const usuarioActual = obtenerUsuarioInventarioActual();

    guardarEntrada({
      fecha: new Date().toISOString(),
      tipoEntrada: 'ajustement-manuel',
      programaNombre: 'Ajustement inventaire',
      programaCodigo: 'INV',
      programaColor: '#2d9561',
      programaIcono: '➕',
      donadorId: 'inventaire-ajustement-manuel',
      donadorNombre: 'Ajustement manuel inventaire',
      donadorEsCustom: true,
      productoId: productoAjoutStockSeleccionado.id,
      nombreProducto: productoAjoutStockSeleccionado.nombre,
      categoria: productoAjoutStockSeleccionado.categoria,
      subcategoria: productoAjoutStockSeleccionado.subcategoria,
      productoCategoria: productoAjoutStockSeleccionado.categoria,
      productoSubcategoria: productoAjoutStockSeleccionado.subcategoria,
      productoIcono: productoAjoutStockSeleccionado.icono,
      productoCodigo: productoAjoutStockSeleccionado.codigo,
      varianteId: productoCreadoAjoutStockSeleccionado?.varianteId,
      cantidad,
      unidad: productoAjoutStockSeleccionado.unidad,
      pesoUnidad: pesoUnitario,
      pesoTotal: pesoUnitario * cantidad,
      temperatura,
      lote: formAjoutStockExistant.lote.trim(),
      fechaCaducidad: formAjoutStockExistant.fechaCaducidad || '',
      observaciones: 'Ajout rapide depuis le module Inventaire',
      creadoPor: usuarioActual,
      registradoPor: usuarioActual,
    });

    setRefreshKey(prev => prev + 1);
    setAjoutStockExistantOpen(false);
    setFormAjoutStockExistant(FORM_AJOUT_STOCK_EXISTANT_INITIAL);
    toast.success(`Stock ajouté à ${productoAjoutStockSeleccionado.nombre}`);
  };

  const organismosActivos = React.useMemo(
    () => obtenerOrganismos().filter(organismo => organismo.activo),
    [refreshKey, compartirDialogOpen]
  );

  const effectiveVistaMode = isCompactInventoryViewport ? 'grid' : vistaMode;

  const zonasUbicacionConfiguradas = React.useMemo<LocationZone[]>(() => loadLocationZones(), [refreshKey, dialogLocalizacionOpen, escanerQROpen]);

  const ubicacionesEscaneables = React.useMemo(() => {
    const ubicacionesActuales = todosLosProductos
      .map(producto => producto.ubicacion)
      .filter((ubicacion): ubicacion is string => typeof ubicacion === 'string' && ubicacion.trim() !== '')
      .map(ubicacion => ubicacion.trim());

    return buildLocationOptions(zonasUbicacionConfiguradas, ubicacionesActuales);
  }, [todosLosProductos, zonasUbicacionConfiguradas]);

  const seccionesUbicacionDisponibles = React.useMemo(() => {
    return buildLocationSections(zonasUbicacionConfiguradas, ubicacionesEscaneables);
  }, [zonasUbicacionConfiguradas, ubicacionesEscaneables]);

  const getCategoriaLabel = (categoria: string) => categoriasInfo[categoria]?.label || categoria;

  const getInventorySubcategoriaLabel = (producto: Pick<ProductoCreado, 'categoria' | 'subcategoria'>) => {
    const subcategoria = producto.subcategoria?.trim();
    return subcategoria && subcategoria.length > 0 ? subcategoria : getCategoriaLabel(producto.categoria);
  };

  const normalizeInventoryNameToken = (value?: string) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : '';

  const getInventoryProductName = (producto: Pick<ProductoCreado, 'nombre' | 'categoria' | 'subcategoria' | 'varianteNombre'>) => {
    const rawName = producto.nombre?.trim() || '';
    const categoria = producto.categoria?.trim() || '';
    const subcategoria = producto.subcategoria?.trim() || '';
    const variante = producto.varianteNombre?.trim() || '';
    const hasDistinctVariant = Boolean(variante) && normalizeInventoryNameToken(variante) !== normalizeInventoryNameToken(subcategoria);
    const cleanName = hasDistinctVariant
      ? `${subcategoria} - ${variante}`
      : subcategoria || variante || rawName;

    const legacyCandidates = [
      categoria && subcategoria ? `${categoria} - ${subcategoria}` : '',
      categoria && subcategoria ? `${categoria} - ${subcategoria} - ${subcategoria}` : '',
      categoria && subcategoria && variante ? `${categoria} - ${subcategoria} - ${variante}` : '',
    ]
      .map(normalizeInventoryNameToken)
      .filter(Boolean);

    if (!rawName) {
      return cleanName;
    }

    return legacyCandidates.includes(normalizeInventoryNameToken(rawName)) ? cleanName : rawName;
  };

  const subcategoriasInventario = React.useMemo(() => {
    const subcategoriasMap = new Map<string, string>();

    todosLosProductos.forEach(producto => {
      const label = getInventorySubcategoriaLabel(producto);

      if (!subcategoriasMap.has(label)) {
        subcategoriasMap.set(label, producto.icono || categoriasInfo[producto.categoria]?.icono || '📦');
      }
    });

    return Array.from(subcategoriasMap, ([label, icon]) => ({ label, icon }));
  }, [todosLosProductos]);

  const normalizeQrMatch = (value?: string | null) =>
    typeof value === 'string' ? value.trim().toLowerCase() : '';

  const findProductoByScannedData = (rawData: unknown) => {
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

    const exactMatch = todosLosProductos.find(producto => {
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

    const scoredMatches = todosLosProductos
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

  const findUbicacionByScannedData = (rawData: unknown) => {
    const locationData = normalizeScannedLocationQR(rawData, ubicacionesEscaneables);
    return locationData?.ubicacion || null;
  };

  const openScannedProduct = (producto: ProductoCreado) => {
    setProductoEscaneado(producto);
    setEscanerQROpen(false);
    setScannerDefaultProductAction(null);
    setDialogLocalizacionOpen(true);
  };

  const openInventoryScanner = (defaultAction: string | null = null) => {
    setScannerDefaultProductAction(defaultAction);
    setEscanerQROpen(true);
  };

  const closeInventoryScanner = () => {
    setEscanerQROpen(false);
    setScannerDefaultProductAction(null);
  };

  const focusProductFromQr = (producto: ProductoCreado) => {
    setEscanerQROpen(false);
    setActiveTab('productos');
    setSelectedCategories([]);
    setShowFilters(false);
    setSearchUbicacion('');
    setSearchTerm(getInventoryProductName(producto));
    setSearchLote(producto.lote || '');
  };

  const applyLocationContextFromQr = (ubicacion: string, options?: { clearPending?: boolean; closeScanner?: boolean }) => {
    const normalizedLocation = ubicacion.trim();

    if (options?.closeScanner !== false) {
      setEscanerQROpen(false);
    }

    if (options?.clearPending !== false) {
      setUbicacionEscaneadaPendiente(null);
    }

    setActiveTab('productos');
    setSelectedCategories([]);
    setShowFilters(false);
    setSearchTerm('');
    setSearchLote('');
    setSearchUbicacion(normalizedLocation);

    return normalizedLocation;
  };

  const focusLocationProductsFromQr = (ubicacion: string) => {
    const normalizedLocation = applyLocationContextFromQr(ubicacion);
    const productosEnUbicacion = todosLosProductos.filter(producto =>
      normalizeQrMatch(producto.ubicacion) === normalizeQrMatch(normalizedLocation) && producto.stockActual > 0
    );

    if (productosEnUbicacion.length > 0) {
      toast.info(`${formatQuantity(productosEnUbicacion.length)} produits filtrés pour l'emplacement ${normalizedLocation}`);
      return;
    }

    toast.info(`Aucun produit avec stock n'est localisé à ${normalizedLocation}`);
  };

  const openShareDialogForProduct = (producto: ProductoCreado) => {
    focusProductFromQr(producto);
    setProductosSeleccionados(prev =>
      prev.map(item => ({
        ...item,
        seleccionado: item.id === producto.id,
      }))
    );
    setNombreLista(`Liste ${getInventoryProductName(producto)}`);
    setVistaPreviewLista(false);
    setListaGenerada(null);
    setOrganismosSeleccionados([]);
    setCompartirDialogOpen(true);
  };

  const mapProductTemperatureForLabel = (producto: ProductoCreado): ProductLabelData['temperatura'] => {
    const rawTemperature = String((producto as ProductoCreado & { temperaturaAlmacenamiento?: string }).temperaturaAlmacenamiento || '').toLowerCase();

    if (rawTemperature.includes('congel')) {
      return 'congelado';
    }

    if (rawTemperature.includes('refrig') || rawTemperature.includes('frio') || rawTemperature.includes('froid')) {
      return 'refrigerado';
    }

    return 'ambiente';
  };

  const printProductLabelFromQr = async (producto: ProductoCreado) => {
    const unitWeight = Number(producto.pesoUnitario || 0);
    const totalWeight = unitWeight > 0
      ? unitWeight * Number(producto.stockActual || 0)
      : Number(producto.pesoRegistrado || producto.peso || 0);

    const labelData: ProductLabelData = {
      id: producto.id,
      codigo: producto.codigo,
      nombreProducto: getInventoryProductName(producto),
      productoIcono: obtenerIconoProducto(producto),
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      cantidad: Number(producto.stockActual || 0),
      unidad: producto.unidad,
      pesoTotal: totalWeight,
      pesoUnidad: unitWeight > 0 ? unitWeight : undefined,
      temperatura: mapProductTemperatureForLabel(producto),
      ubicacion: producto.ubicacion,
      lote: producto.lote,
      fechaCaducidad: producto.fechaVencimiento,
      fechaEntrada: new Date().toISOString(),
      systemName: branding.systemName,
      systemLogo: branding.logo,
    };

    await printStandardLabel(labelData, true);
  };

  const handleScannedProductAction = (producto: ProductoCreado, action = 'ver_detalles') => {
    switch (action) {
      case 'agregar_carrito':
        setEscanerQROpen(false);
        setScannerDefaultProductAction(null);
        setQuickCartProduct(producto);
        setQuickCartQuantity('');
        setQuickCartResumeScannerAction(null);
        setQuickCartQuantityDialogOpen(true);
        return;
      case 'agregar_carrito_rapido':
        setEscanerQROpen(false);
        setScannerDefaultProductAction(null);
        setQuickCartProduct(producto);
        setQuickCartQuantity('');
        setQuickCartResumeScannerAction('agregar_carrito_rapido');
        setQuickCartQuantityDialogOpen(true);
        return;
      case 'ver_historial':
        setEscanerQROpen(false);
        setScannerDefaultProductAction(null);
        abrirHistorialProducto(producto);
        return;
      case 'ver_ubicacion':
        openScannedProduct(producto);
        return;
      case 'imprimir_etiqueta':
        setEscanerQROpen(false);
        setScannerDefaultProductAction(null);
        void printProductLabelFromQr(producto)
          .then(() => {
            toast.success(`Étiquette imprimée pour ${getInventoryProductName(producto)}`);
          })
          .catch((error) => {
            console.error('Erreur impression étiquette QR:', error);
            toast.error(`Erreur lors de l'impression de l'étiquette de ${getInventoryProductName(producto)}`);
          });
        return;
      case 'ver_estadisticas':
        setEscanerQROpen(false);
        setScannerDefaultProductAction(null);
        setActiveTab('prediccion');
        setSearchTerm(getInventoryProductName(producto));
        setSearchLote(producto.lote || '');
        toast.info('Module d\'analyse ouvert pour ce produit');
        return;
      case 'compartir_producto':
        openShareDialogForProduct(producto);
        return;
      case 'crear_oferta':
        setEscanerQROpen(false);
        setScannerDefaultProductAction(null);
        agregarAlCarrito(producto.id, 1);
        setCarritoOpen(true);
        toast.info('Produit ajouté au panier. Créez ensuite une offre depuis le panier');
        return;
      case 'enviar_departamento':
        setEscanerQROpen(false);
        setScannerDefaultProductAction(null);
        agregarAlCarrito(producto.id, 1);
        setCarritoOpen(true);
        toast.info('Produit ajouté au panier. Continuez la distribution depuis le panier');
        return;
      case 'ajustar_stock':
        focusProductFromQr(producto);
        toast.info('Produit filtré dans Inventaire pour ajuster le stock');
        return;
      case 'modificar_producto':
        focusProductFromQr(producto);
        toast.info('Produit filtré dans Inventaire pour modification');
        return;
      case 'ver_detalles':
      default:
        focusProductFromQr(producto);
        toast.success(`${getInventoryProductName(producto)} prêt à consulter dans Inventaire`);
    }
  };

  // Función helper para obtener el icono del producto (variante o subcategoría)
  const obtenerIconoProducto = (producto: ProductoCreado): string => {
    // El icono ya fue asignado en el useMemo, solo devolverlo
    return producto.icono || '📦';
  };

  // Inicializar productos seleccionados (solo productos con stock > 0)
  useEffect(() => {
    setProductosSeleccionados(
      todosLosProductos
        .filter(p => p.stockActual > 0) // Solo productos con stock
        .map(p => ({
          id: p.id,
          seleccionado: false
        }))
    );
  }, [todosLosProductos]); // Agregada dependencia todosLosProductos

  useEffect(() => {
    const pendingQuickAction = readPendingEntrepotQuickAction();

    if (!pendingQuickAction) {
      return;
    }

    clearPendingEntrepotQuickAction();

    if (pendingQuickAction === 'open-new-entry') {
      abrirEntradaInventario();
      return;
    }

    setScannerDefaultProductAction(null);
    setEscanerQROpen(true);
  }, []);

  useEffect(() => {
    const pendingNavigation = readPendingQrNavigation();

    if (!pendingNavigation || pendingNavigation.targetPage !== 'inventario') {
      return;
    }

    clearPendingQrNavigation();

    if (pendingNavigation.qrType === 'ubicacion') {
      const ubicacion = findUbicacionByScannedData(pendingNavigation.rawData);
      const pendingAction = pendingNavigation.action === 'agregar_o_modificar_ubicacion_producto'
        ? 'localizar_productos'
        : pendingNavigation.action;

      if (!ubicacion) {
        toast.error('Emplacement non trouvé');
        return;
      }

      if (pendingAction === 'modificar_productos_ubicacion') {
        focusLocationProductsFromQr(ubicacion);
        return;
      }

      if (pendingAction === 'localizar_productos') {
        setUbicacionEscaneadaPendiente({ ubicacion, action: pendingAction });
        applyLocationContextFromQr(ubicacion, { clearPending: false, closeScanner: false });
        setEscanerQROpen(true);
        toast.info(`Emplacement ${ubicacion} sélectionné. Inventaire filtré sur cet emplacement. Scannez maintenant le produit à y ajouter.`);
        return;
      }

      if (pendingAction === 'delocalizar_productos') {
        setUbicacionEscaneadaPendiente({ ubicacion, action: pendingAction });
        setEscanerQROpen(true);
        toast.info(
          `Emplacement ${ubicacion} détecté. Scannez maintenant le produit à délocaliser.`
        );
        return;
      }
    }

    if (pendingNavigation.qrType !== 'producto') {
      return;
    }

    const producto = findProductoByScannedData(pendingNavigation.rawData);

    if (!producto) {
      toast.error('Produit non trouvé');
      return;
    }

    handleScannedProductAction(producto, pendingNavigation.action);
  }, [todosLosProductos, ubicacionesEscaneables]);

  // Cargar conversiones y plantillas al montar el componente
  useEffect(() => {
    const conversiones = obtenerConversionesRecientes(20);
    setConversionesRecientes(conversiones);
    const plantillas = obtenerPlantillasConversion();
    setPlantillasConversion(plantillas);
    
    // 🔄 Escuchar evento de restauración de backup para recargar datos
    const handleBackupRestored = () => {
      console.log('🔄 Backup restaurado - Recargando inventario...');
      setRefreshKey(prev => prev + 1);
    };

    // 🔄 Escuchar evento de actualización de categorías
    const handleCategoriasActualizadas = () => {
      console.log('🔄 Categorías actualizadas - Recargando inventario...');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('backupRestored', handleBackupRestored);
    window.addEventListener('categorias-actualizadas', handleCategoriasActualizadas);

    return () => {
      window.removeEventListener('backupRestored', handleBackupRestored);
      window.removeEventListener('categorias-actualizadas', handleCategoriasActualizadas);
    };
  }, []);

  const getStockStatus = (producto: typeof todosLosProductos[0]) => {
    const stockActual = Number(producto.stockActual ?? 0);
    const stockMinimo = Number(producto.stockMinimo ?? 0);

    if (!Number.isFinite(stockActual) || stockActual <= 0) {
      return { label: t('inventory.low'), color: 'bg-[#c23934]', value: 'bajo' };
    }

    if (!Number.isFinite(stockMinimo) || stockMinimo <= 0) {
      return { label: t('inventory.optimal'), color: 'bg-[#2d9561]', value: 'optimo' };
    }

    const percentage = (producto.stockActual / producto.stockMinimo) * 100;
    if (percentage <= 100) return { label: t('inventory.low'), color: 'bg-[#c23934]', value: 'bajo' };
    if (percentage <= 150) return { label: t('inventory.medium'), color: 'bg-[#e8a419]', value: 'medio' };
    return { label: t('inventory.optimal'), color: 'bg-[#2d9561]', value: 'optimo' };
  };

  const getReliableUnitWeight = (producto: typeof todosLosProductos[0]): number | null => {
    if (producto.pesoUnitario && producto.pesoUnitario > 0) {
      return Math.round(producto.pesoUnitario);
    }

    if (producto.peso && producto.peso > 0 && producto.stockActual > 0) {
      return Math.round(producto.peso / producto.stockActual);
    }

    return null;
  };

  const getDisplayWeight = (producto: typeof todosLosProductos[0]): number | null => {
    const unitWeight = getReliableUnitWeight(producto);
    if (unitWeight !== null) {
      return unitWeight;
    }

    if (producto.peso && producto.peso > 0) {
      return Math.round(producto.peso);
    }

    return null;
  };

  const reservasInventario = React.useMemo(
    () => obtenerResumenReservasInventario(todosLosProductos.map(producto => producto.id)),
    [todosLosProductos]
  );

  const toggleCategoria = (categoria: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const limpiarFiltros = () => {
    setSelectedCategories([]);
    setSearchTerm('');
    setSearchLote('');
    setSearchUbicacion('');
  };

  const productosFiltrados = todosLosProductos
    .filter(p => {
      const matchSearch = filterByThreeLettersMultiple(
        [p.nombre, p.codigo],
        searchTerm
      );

      const matchLote = !searchLote || (p.lote && p.lote.toLowerCase().includes(searchLote.toLowerCase()));
      const matchUbicacion = !searchUbicacion || normalizeQrMatch(p.ubicacion) === normalizeQrMatch(searchUbicacion);

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(getInventorySubcategoriaLabel(p));

      // Solo mostrar productos con stock mayor a cero
      const tieneStock = p.stockActual > 0;

      return matchSearch && matchLote && matchUbicacion && matchCategory && tieneStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'stock':
          return b.stockActual - a.stockActual;
        case 'categoria':
          return getInventorySubcategoriaLabel(a).localeCompare(getInventorySubcategoriaLabel(b), 'fr-CA');
        case 'valor':
          const valorA = categoriasInfo[a.categoria]?.valorMonetario || 0;
          const valorB = categoriasInfo[b.categoria]?.valorMonetario || 0;
          return valorB - valorA;
        default:
          return 0;
      }
    });

  const showCompactProductsOverview = isCompactInventoryViewport && activeTab === 'productos';

  const compactProductsBySubcategory = Array.from(
    productosFiltrados.reduce((acc, producto) => {
      const label = getInventorySubcategoriaLabel(producto);
      const current = acc.get(label);

      if (current) {
        current.count += 1;
        current.stock += producto.stockActual;
        return acc;
      }

      acc.set(label, {
        label,
        icon: obtenerIconoProducto(producto),
        count: 1,
        stock: producto.stockActual,
      });
      return acc;
    }, new Map<string, { label: string; icon: string; count: number; stock: number }>())
      .values()
  )
    .sort((left, right) => right.stock - left.stock)
    .slice(0, 4);

  const compactHighlightedProducts = [...productosFiltrados]
    .sort((left, right) => {
      const leftAvailable = reservasInventario[left.id]?.disponibleParaReservar ?? left.stockActual;
      const rightAvailable = reservasInventario[right.id]?.disponibleParaReservar ?? right.stockActual;
      return rightAvailable - leftAvailable;
    })
    .slice(0, 4);

  const compactLowStockProducts = productosFiltrados
    .filter(producto => getStockStatus(producto).value === 'bajo')
    .slice(0, 3);

  const compactReservedTotal = productosFiltrados.reduce((sum, producto) => {
    return sum + (reservasInventario[producto.id]?.totalReservado ?? 0);
  }, 0);

  // Funciones del carrito
  const agregarAlCarrito = (productoId: string, cantidad: number) => {
    // Buscar el producto en el inventario
    const producto = todosLosProductos.find(p => p.id === productoId);
    
    if (!producto) {
      toast.error(t('inventory.errors.productNotFound'));
      return;
    }

    const productoExiste = carrito.find(item => item.productoId === productoId);
    const cantidadActualEnCarrito = productoExiste ? productoExiste.cantidad : 0;
    const nuevaCantidadTotal = cantidadActualEnCarrito + cantidad;
    const reserva = reservasInventario[productoId] || {
      disponibleParaReservar: producto.stockActual,
      totalReservado: 0
    };
    
    if (nuevaCantidadTotal > reserva.disponibleParaReservar) {
      const cantidadDisponible = reserva.disponibleParaReservar - cantidadActualEnCarrito;
      
      toast.error(
        <div className="space-y-1">
          <p className="font-bold">{t('inventory.insufficientStock')}</p>
          <p className="text-sm">
            {t('inventory.onlyAvailable')
              .replace('{quantity}', reserva.disponibleParaReservar.toString())
              .replace('{unit}', producto.unidad)}
          </p>
          <p className="text-sm">
            {t('inventory.requestedQuantity')
              .replace('{quantity}', nuevaCantidadTotal.toString())
              .replace('{unit}', producto.unidad)}
          </p>
          <p className="text-sm text-[#666666]">Reservado actualmente: {reserva.totalReservado} {producto.unidad}</p>
          {cantidadDisponible > 0 && (
            <p className="text-sm text-[#2d9561]">
              {t('inventory.availableQuantity')
                .replace('{quantity}', cantidadDisponible.toString())
                .replace('{unit}', producto.unidad)}
            </p>
          )}
        </div>,
        { duration: 5000 }
      );
      return;
    }
    
    if (productoExiste) {
      setCarrito(carrito.map(item =>
        item.productoId === productoId
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
      toast.success(t('inventory.quantityUpdated'));
    } else {
      setCarrito([...carrito, { productoId, cantidad }]);
      toast.success(t('inventory.productAdded'));
    }
  };

  const getQuickCartAvailableQuantity = (producto: ProductoCreado) => {
    const disponibleParaReservar = reservasInventario[producto.id]?.disponibleParaReservar ?? producto.stockActual;
    const cantidadEnCarrito = carrito.find(item => item.productoId === producto.id)?.cantidad ?? 0;

    return Math.max(0, disponibleParaReservar - cantidadEnCarrito);
  };

  const cerrarQuickCartQuantityDialog = () => {
    setQuickCartQuantityDialogOpen(false);
    setQuickCartProduct(null);
    setQuickCartQuantity('');
    setQuickCartResumeScannerAction(null);
  };

  const confirmarQuickCartQuantity = () => {
    if (!quickCartProduct) {
      return;
    }

    const cantidad = Number.parseInt(quickCartQuantity, 10);
    const cantidadDisponible = getQuickCartAvailableQuantity(quickCartProduct);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      toast.error('Saisissez une quantité valide');
      return;
    }

    if (cantidad > cantidadDisponible) {
      toast.error(`La quantité dépasse le stock disponible (${formatQuantity(cantidadDisponible)} ${quickCartProduct.unidad})`);
      return;
    }

    agregarAlCarrito(quickCartProduct.id, cantidad);
    const resumeScannerAction = quickCartResumeScannerAction;
    cerrarQuickCartQuantityDialog();

    if (resumeScannerAction) {
      openInventoryScanner(resumeScannerAction);
    } else {
      setCarritoOpen(true);
    }
  };

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    // Buscar el producto en el inventario para validar el stock
    const producto = todosLosProductos.find(p => p.id === productoId);
    
    if (!producto) {
      toast.error(t('inventory.errors.productNotFound'));
      return;
    }
    
    const reserva = reservasInventario[productoId] || {
      disponibleParaReservar: producto.stockActual,
      totalReservado: 0
    };

    if (cantidad > reserva.disponibleParaReservar) {
      toast.error(
        <div className="space-y-1">
          <p className="font-bold">{t('inventory.insufficientStock')}</p>
          <p className="text-sm">
            {t('inventory.onlyAvailable')
              .replace('{quantity}', reserva.disponibleParaReservar.toString())
              .replace('{unit}', producto.unidad)}
          </p>
          <p className="text-sm">
            {t('inventory.requestedQuantity')
              .replace('{quantity}', cantidad.toString())
              .replace('{unit}', producto.unidad)}
          </p>
          <p className="text-sm text-[#666666]">Reservado actualmente: {reserva.totalReservado} {producto.unidad}</p>
        </div>,
        { duration: 5000 }
      );
      
      // Ajustar automáticamente al stock reservable
      setCarrito(carrito.map(item =>
        item.productoId === productoId ? { ...item, cantidad: reserva.disponibleParaReservar } : item
      ));
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.productoId === productoId ? { ...item, cantidad } : item
    ));
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter(item => item.productoId !== productoId));
    toast.success(t('inventory.productRemoved'));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    toast.success(t('inventory.cartCleared'));
  };

  const calcularTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  // Función para agregar entrada al carrito
  const agregarEntradaAlCarrito = (entrada: HistorialEntrada) => {
    // Agregar el producto de la entrada al carrito
    agregarAlCarrito(entrada.productoId, entrada.cantidad);
  };

  // Funciones para compartir lista de productos
  const toggleProductoSeleccionado = (productoId: string) => {
    setProductosSeleccionados(prev =>
      prev.map(p =>
        p.id === productoId ? { ...p, seleccionado: !p.seleccionado } : p
      )
    );
  };

  const toggleTodosProductos = () => {
    const todosSeleccionados = productosSeleccionados.every(p => p.seleccionado);
    setProductosSeleccionados(prev =>
      prev.map(p => ({ ...p, seleccionado: !todosSeleccionados }))
    );
  };

  const toggleOrganismo = (organismoId: string) => {
    setOrganismosSeleccionados(prev =>
      prev.includes(organismoId)
        ? prev.filter(id => id !== organismoId)
        : [...prev, organismoId]
    );
  };

  const toggleTodosOrganismos = () => {
    if (organismosSeleccionados.length === organismosActivos.length) {
      setOrganismosSeleccionados([]);
    } else {
      setOrganismosSeleccionados(organismosActivos.map(o => o.id));
    }
  };

  const generarLista = () => {
    const productosIds = productosSeleccionados
      .filter(p => p.seleccionado)
      .map(p => p.id);

    if (productosIds.length === 0) {
      toast.error(t('inventory.noProductsSelected'));
      return;
    }

    if (!nombreLista.trim()) {
      toast.error(t('inventory.listName') + ' ' + t('validation.required'));
      return;
    }

    const nuevaLista: ListaProductos = {
      id: `lista-${Date.now()}`,
      nombre: nombreLista,
      fecha: new Date().toISOString(),
      productos: productosIds,
      incluirStock,
      incluirPrecios,
      incluirKg, // Nueva opción para mostrar en kg
      compartidaCon: []
    };

    setListaGenerada(nuevaLista);
    setVistaPreviewLista(true);
    toast.success(t('inventory.listCreatedSuccessfully'));
  };

  const compartirLista = () => {
    if (!listaGenerada) return;

    if (organismosSeleccionados.length === 0) {
      toast.error(t('inventory.selectMinimumOrganismError'));
      return;
    }

    // Simular el compartir la lista
    const listaActualizada = {
      ...listaGenerada,
      compartidaCon: organismosSeleccionados
    };

    // Aquí se guardaría en localStorage o se enviaría al backend
    localStorage.setItem(`lista-${listaGenerada.id}`, JSON.stringify(listaActualizada));

    toast.success(
      `${t('inventory.productListShared')} ${organismosSeleccionados.length} ${t('inventory.organisms')}`
    );

    // Resetear estados
    cerrarCompartirDialog();
  };

  const descargarLista = () => {
    if (!listaGenerada) return;

    const productosLista = todosLosProductos.filter(p =>
      listaGenerada.productos.includes(p.id)
    );

    // Función helper para convertir a kg
    const convertirAKg = (cantidad: number, unidad: string): { kg: number | null, textoConversion: string } => {
      const unidadLower = unidad.toLowerCase();
      
      if (unidadLower === 'kg' || unidadLower === 'kgs' || unidadLower === 'kilogramos') {
        return { kg: cantidad, textoConversion: `${Math.round(cantidad)} kg` };
      } else if (unidadLower === 'g' || unidadLower === 'gr' || unidadLower === 'gramos') {
        return { kg: cantidad / 1000, textoConversion: `${Math.round(cantidad / 1000)} kg (${cantidad} g)` };
      } else if (unidadLower === 'l' || unidadLower === 'lt' || unidadLower === 'litros') {
        // Para líquidos, asumimos densidad similar al agua (1 L ≈ 1 kg)
        return { kg: cantidad, textoConversion: `${Math.round(cantidad)} kg aprox. (${cantidad} L, densidad agua)` };
      } else if (unidadLower === 'ml' || unidadLower === 'mililitros') {
        return { kg: cantidad / 1000, textoConversion: `${Math.round(cantidad / 1000)} kg aprox. (${cantidad} mL, densidad agua)` };
      } else {
        // Unidades, piezas, etc. no se pueden convertir
        return { kg: null, textoConversion: `${cantidad} ${unidad} (no convertible a kg)` };
      }
    };

    let contenido = `Lista de Productos: ${listaGenerada.nombre}\n`;
    contenido += `Fecha: ${new Date(listaGenerada.fecha).toLocaleDateString()}\n`;
    contenido += `Total de productos: ${productosLista.length}\n\n`;
    contenido += '─'.repeat(80) + '\n\n';

    productosLista.forEach((producto, index) => {
      contenido += `${index + 1}. ${getInventoryProductName(producto)}\n`;
      contenido += `   Código: ${producto.codigo}\n`;
      contenido += `   Unidad Original: ${producto.unidad}\n`;
      
      if (listaGenerada.incluirStock) {
        contenido += `   Stock Actual: ${producto.stockActual} ${producto.unidad}\n`;
        
        if (listaGenerada.incluirKg) {
          const conversion = convertirAKg(producto.stockActual, producto.unidad);
          contenido += `   Stock en Kg: ${conversion.textoConversion}\n`;
        }
        
        contenido += `   Stock Mínimo: ${producto.stockMinimo} ${producto.unidad}\n`;
      }
      
      if (listaGenerada.incluirPrecios || listaGenerada.incluirKg) {
        const valorKg = categoriasInfo[producto.categoria]?.valorMonetario || 0;
        contenido += `   Valor estimado/kg: $${formatMoney(valorKg)} CAD\n`;
        
        if (listaGenerada.incluirKg && listaGenerada.incluirStock) {
          const conversion = convertirAKg(producto.stockActual, producto.unidad);
          if (conversion.kg !== null) {
            const valorTotal = conversion.kg * valorKg;
            contenido += `   Valor total estimado: $${formatMoney(valorTotal)} CAD\n`;
          }
        }
      }
      
      contenido += '\n';
    });

    // Agregar resumen al final
    if (listaGenerada.incluirKg && listaGenerada.incluirStock) {
      contenido += '─'.repeat(80) + '\n\n';
      contenido += 'RESUMEN TOTAL EN KG:\n\n';
      
      let totalKg = 0;
      let totalValor = 0;
      let productosConvertibles = 0;
      
      productosLista.forEach(producto => {
        const conversion = convertirAKg(producto.stockActual, producto.unidad);
        if (conversion.kg !== null) {
          totalKg += conversion.kg;
          const valorKg = categoriasInfo[producto.categoria]?.valorMonetario || 0;
          totalValor += conversion.kg * valorKg;
          productosConvertibles++;
        }
      });
      
      contenido += `Total convertible a kg: ${Math.round(totalKg)} kg (${productosConvertibles} productos)\n`;
      contenido += `Productos no convertibles: ${productosLista.length - productosConvertibles}\n`;
      if (listaGenerada.incluirPrecios) {
        contenido += `Valor total estimado: $${Math.round(totalValor)} CAD\n`;
      }
    }

    // Crear blob y descargar
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${listaGenerada.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success(t('inventory.downloadList'));
  };

  const cerrarCompartirDialog = () => {
    setCompartirDialogOpen(false);
    setVistaPreviewLista(false);
    setListaGenerada(null);
    setNombreLista('');
    setProductosSeleccionados(prev => prev.map(p => ({ ...p, seleccionado: false })));
    setOrganismosSeleccionados([]);
    setIncluirStock(true);
    setIncluirPrecios(false);
    setIncluirKg(false); // Nueva opción para mostrar en kg
  };

  const abrirHistorialProducto = (producto: ProductoCreado) => {
    setProductoSeleccionado(producto);
    setHistorialProductoDialogOpen(true);
  };

  const abrirTransformarProducto = (producto: ProductoCreado) => {
    setProductoSeleccionado(producto);
    setTransformarDialogOpen(true);
  };

  const abrirConversionUnidades = (producto: ProductoCreado) => {
    // Buscar el producto en localStorage para obtener todos los datos actualizados
    const productosLS = obtenerProductos();
    const productoCompleto = productosLS.find(p => p.id === producto.id) || producto;
    
    // Asegurarse de que el producto tenga pesoRegistrado
    if (!productoCompleto.pesoRegistrado && productoCompleto.peso) {
      productoCompleto.pesoRegistrado = productoCompleto.peso;
    }
    
    setProductoConversion(productoCompleto);
    setConversionDialogOpen(true);
  };

  const actualizarUbicacionProducto = (producto: ProductoCreado, ubicacion: string) => {
    const productosLocalStorage = obtenerProductos();
    const productoEnStorage = productosLocalStorage.find(p => p.id === producto.id);

    if (!productoEnStorage) {
      toast.error('Produit introuvable dans le stockage local');
      return false;
    }

    actualizarProducto(producto.id, { ubicacion });
    setRefreshKey(prev => prev + 1);
    return true;
  };

  const localizarProductoEscaneado = (producto: ProductoCreado, ubicacion: string) => {
    const actualizado = actualizarUbicacionProducto(producto, ubicacion);

    if (!actualizado) {
      return false;
    }

    toast.success(`${getInventoryProductName(producto)} ajouté ou déplacé vers: ${ubicacion}`);
    return true;
  };

  const deslocalizarProductoEscaneado = (producto: ProductoCreado, ubicacionEsperada?: string) => {
    const ubicacionActual = normalizeQrMatch(producto.ubicacion);

    if (ubicacionEsperada && ubicacionActual !== normalizeQrMatch(ubicacionEsperada)) {
      toast.error(`${getInventoryProductName(producto)} n'est pas localisé à ${ubicacionEsperada}`);
      return false;
    }

    if (!producto.ubicacion) {
      toast.info(`${getInventoryProductName(producto)} n'a pas d'emplacement assigné`);
      return false;
    }

    const actualizado = actualizarUbicacionProducto(producto, '');

    if (!actualizado) {
      return false;
    }

    toast.success(`${getInventoryProductName(producto)} délocalisé avec succès`);
    return true;
  };

  const handleScanQR = (data: DatosQR, action: string) => {
    console.log('QR escaneado:', data, 'Acción:', action);

    if (action === 'annuler_accion_ubicacion') {
      setUbicacionEscaneadaPendiente(null);
      closeInventoryScanner();
      toast.info('Action d\'emplacement annulée');
      return;
    }

    const producto = findProductoByScannedData(data);

    if (ubicacionEscaneadaPendiente) {
      if (!producto) {
        toast.error('Scannez un produit valide pour terminer cette action');
        return;
      }

      const accionAplicada = ubicacionEscaneadaPendiente.action === 'delocalizar_productos'
        ? deslocalizarProductoEscaneado(producto, ubicacionEscaneadaPendiente.ubicacion)
        : localizarProductoEscaneado(producto, ubicacionEscaneadaPendiente.ubicacion);

      setUbicacionEscaneadaPendiente(null);

      if (accionAplicada) {
        closeInventoryScanner();
      }

      return;
    }

    if (producto) {
      handleScannedProductAction(producto, action);
      return;
    }

    const ubicacion = findUbicacionByScannedData(data);

    if (ubicacion && action === 'modificar_productos_ubicacion') {
      focusLocationProductsFromQr(ubicacion);
      return;
    }

    if (ubicacion && action === 'localizar_productos') {
      setUbicacionEscaneadaPendiente({ ubicacion, action });
      applyLocationContextFromQr(ubicacion, { clearPending: false, closeScanner: false });
      toast.info(`Emplacement ${ubicacion} sélectionné. Inventaire filtré sur cet emplacement. Scannez maintenant le produit à y ajouter.`);
      return;
    }

    if (ubicacion && action === 'delocalizar_productos') {
      setUbicacionEscaneadaPendiente({ ubicacion, action });
      toast.info(
        `Emplacement ${ubicacion} détecté. Scannez maintenant le produit à délocaliser.`
      );
      return;
    }

    const comandaData = normalizeScannedComandaQR(data);

    if (comandaData?.comanda) {
      setEscanerQROpen(false);
      setScannerDefaultProductAction(null);
      savePendingQrNavigation({
        targetPage: 'comandas',
        qrType: 'comanda',
        rawData: data,
        action,
      });
      toast.success('Commande détectée, redirection vers Commandes');
      navigateToQrPage('comandas');
      return;
    }

    if (!producto) {
      toast.error('Produit non trouvé');
      setEscanerQROpen(false);
      return;
    }
  };

  const handleLocalizarProducto = (ubicacion: string) => {
    if (!productoEscaneado) return;

    const ubicacionEstandar = resolveStandardLocation(ubicacion, ubicacionesEscaneables);

    if (!ubicacionEstandar) {
      toast.error('Choisissez un emplacement standard configuré dans le module Étiquettes');
      return;
    }

    const actualizado = localizarProductoEscaneado(productoEscaneado, ubicacionEstandar);

    if (!actualizado) {
      return;
    }

    setDialogLocalizacionOpen(false);
    setProductoEscaneado(null);
  };

  const handleDeslocalizarProducto = () => {
    if (!productoEscaneado) return;

    const actualizado = deslocalizarProductoEscaneado(productoEscaneado);

    if (!actualizado) {
      return;
    }

    setDialogLocalizacionOpen(false);
    setProductoEscaneado(null);
  };

  const handleConversionUnidades = (
    productoId: string,
    cantidadOrigen: number,
    unidadOrigen: string,
    cantidadDestino: number,
    unidadDestino: string
  ) => {
    if (!Number.isFinite(cantidadOrigen) || !Number.isFinite(cantidadDestino) || cantidadOrigen <= 0 || cantidadDestino <= 0) {
      toast.error(t('inventory.errors.quantityMustBePositive'));
      return;
    }

    // 🎯 Buscar el producto en TODOS los productos (localStorage + mockProductos)
    const todosProductos = obtenerProductos();
    let productoOrigen = todosProductos.find(p => p.id === productoId);
    
    // Si el producto no está en localStorage, buscarlo en mockProductos y copiarlo
    if (!productoOrigen) {
      const productoMock = mockProductos.find(p => p.id === productoId);
      if (productoMock) {
        // Copiar el producto mock a localStorage
        const productoParaGuardar: Partial<ProductoCreado> = {
          id: productoMock.id,
          codigo: productoMock.codigo || `PROD-${Date.now()}`,
          nombre: productoMock.nombre,
          categoria: productoMock.categoria || 'General',
          subcategoria: productoMock.subcategoria || 'General',
          unidad: productoMock.unidad,
          icono: productoMock.icono || '📦',
          peso: productoMock.peso || 0,
          pesoUnitario: productoMock.pesoUnitario || productoMock.peso || 0,
          pesoRegistrado: (productoMock.pesoUnitario || productoMock.peso || 0) * productoMock.stockActual,
          stockActual: productoMock.stockActual,
          stockMinimo: productoMock.stockMinimo,
          ubicacion: productoMock.ubicacion || '',
          lote: productoMock.lote || '',
          fechaVencimiento: productoMock.fechaVencimiento || '',
          esPRS: productoMock.esPRS || false,
          activo: true,
          fechaCreacion: new Date().toISOString()
        };
        guardarProducto(productoParaGuardar);
        productoOrigen = productoParaGuardar;
      } else {
        toast.error(t('inventory.errors.productNotFound'));
        return;
      }
    }
    
    if (productoOrigen) {
      
      // 1. Reducir el stock del producto origen y actualizar el peso total
      const nuevoStockOrigen = productoOrigen.stockActual - cantidadOrigen;
      
      // 🎯 Calcular el nuevo peso total del producto origen
      // IMPORTANTE: pesoUnitario NO debe cambiar, solo el peso total (pesoRegistrado)
      const pesoPorUnidadOrigen = productoOrigen.pesoUnitario || productoOrigen.peso || 0;
      const nuevoPesoRegistrado = pesoPorUnidadOrigen * nuevoStockOrigen;
      
      // 📌 SOLO actualizar stockActual y pesoRegistrado
      // NO actualizar pesoUnitario ni peso (que en algunos casos es el pesoUnitario)
      const actualizacion: Partial<ProductoCreado> = {
        stockActual: nuevoStockOrigen,
        pesoRegistrado: nuevoPesoRegistrado
      };
      
      // Si el producto NO tiene pesoUnitario, actualizar peso (es el peso total)
      if (!productoOrigen.pesoUnitario || productoOrigen.pesoUnitario === 0) {
        actualizacion.peso = nuevoPesoRegistrado;
      }
      
      actualizarProducto(productoId, actualizacion);
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Inventaire',
        'modificar',
        `Stock du produit "${productoOrigen.nombre}" ajusté: ${nuevoStockOrigen} ${productoOrigen.unidad}`,
        { productoId, stockAnterior: productoOrigen.stockActual, stockNuevo: nuevoStockOrigen }
      );
      
      // 2. Calcular el peso total que se está convirtiendo
      // 🎯 FÓRMULA DIRECTA: Peso Unitario Origen ÷ Factor de Conversión = Peso Unitario Destino
      const factorConversion = cantidadDestino / cantidadOrigen;
      if (!Number.isFinite(factorConversion) || factorConversion <= 0) {
        toast.error(t('inventory.errors.conversionError'));
        return;
      }

      const pesoUnitarioDestino = pesoPorUnidadOrigen / factorConversion;
      const pesoTotalConvertido = pesoPorUnidadOrigen * cantidadOrigen;
      
      // 3. Buscar o crear el producto con la unidad destino
      const nombreProductoDestino = `${productoOrigen.nombre} (${unidadDestino})`;
      const productoDestinoExistente = todosProductos.find(
        p => p.nombre === nombreProductoDestino && p.unidad === unidadDestino
      );
      
      if (productoDestinoExistente) {
        // Si ya existe, actualizar su stock y peso
        const nuevoStockDestino = productoDestinoExistente.stockActual + cantidadDestino;
        const pesoTotalDestino = (productoDestinoExistente.pesoRegistrado || 0) + pesoTotalConvertido;
        
        actualizarProducto(productoDestinoExistente.id, {
          stockActual: nuevoStockDestino,
          pesoRegistrado: pesoTotalDestino,
          pesoUnitario: pesoUnitarioDestino
        });
        
        // 📝 REGISTRAR ACTIVIDAD
        registrarActividad(
          'Inventaire',
          'modificar',
          `Conversion: ${cantidadOrigen} ${unidadOrigen} → ${cantidadDestino} ${unidadDestino} de "${productoOrigen.nombre}"`,
          { productoId: productoOrigen.id, unidadOrigen, unidadDestino }
        );
        
        // 🎯 Memorizar peso actualizado en configuración (excepto PLT)
        if (unidadDestino !== 'PLT' && productoOrigen.categoria && productoOrigen.subcategoria) {
          if (productoOrigen.varianteId) {
            actualizarPesoUnitarioVariante(
              productoOrigen.categoria,
              productoOrigen.subcategoria,
              productoOrigen.varianteId,
              1,
              pesoUnitarioDestino,
              unidadDestino
            );
          } else {
            actualizarPesoUnitarioSubcategoria(
              productoOrigen.categoria,
              productoOrigen.subcategoria,
              1,
              pesoUnitarioDestino,
              unidadDestino
            );
          }
        }
      } else {
        // Si no existe, crear un nuevo producto
        const nuevoProductoDestino = {
          id: `${productoOrigen.id}-${unidadDestino}-${Date.now()}`,
          codigo: `${productoOrigen.codigo}-${unidadDestino}`,
          nombre: nombreProductoDestino,
          categoria: productoOrigen.categoria,
          subcategoria: productoOrigen.subcategoria,
          varianteId: productoOrigen.varianteId,
          varianteNombre: productoOrigen.varianteNombre,
          unidad: unidadDestino,
          icono: productoOrigen.icono,
          peso: pesoTotalConvertido,
          pesoRegistrado: pesoTotalConvertido,
          pesoUnitario: pesoUnitarioDestino,
          stockActual: cantidadDestino,
          stockMinimo: Math.ceil((productoOrigen.stockMinimo || 0) * factorConversion),
          ubicacion: productoOrigen.ubicacion,
          lote: productoOrigen.lote,
          fechaVencimiento: productoOrigen.fechaVencimiento,
          esPRS: productoOrigen.esPRS,
          activo: true,
          fechaCreacion: new Date().toISOString(),
          temperaturaAlmacenamiento: productoOrigen.temperaturaAlmacenamiento,
          productoOrigenId: productoOrigen.id,
          esConversion: true
        };
        
        guardarProducto(nuevoProductoDestino);
        
        // 🎯 Memorizar peso en configuración de categorías (excepto PLT)
        if (unidadDestino !== 'PLT' && productoOrigen.categoria && productoOrigen.subcategoria) {
          if (productoOrigen.varianteId) {
            // Memorizar peso de variante
            actualizarPesoUnitarioVariante(
              productoOrigen.categoria,
              productoOrigen.subcategoria,
              productoOrigen.varianteId,
              1, // cantidad = 1 unidad
              pesoUnitarioDestino, // peso total
              unidadDestino
            );
          } else {
            // Memorizar peso de subcategoría
            actualizarPesoUnitarioSubcategoria(
              productoOrigen.categoria,
              productoOrigen.subcategoria,
              1, // cantidad = 1 unidad
              pesoUnitarioDestino, // peso total
              unidadDestino
            );
          }
        }
      }
      
      // Nota: El toast de éxito se muestra desde ConversionUnidadesDialog
      // para evitar mensajes duplicados
      
      // Actualizar el estado para reflejar los cambios sin recargar la página
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(t('inventory.errors.conversionError'));
    }
  };
  
  // Funciones para subcategoría de producto
  const abrirCrearSubcategoria = (producto: ProductoCreado) => {
    setProductoBase(producto);
    setFormSubcategoria({
      codigo: producto.codigo + '-SUB',
      nombre: producto.nombre + ' (Subcategoría)',
      unidad: producto.unidad,
      stockMinimo: producto.stockMinimo,
      pesoUnitario: producto.pesoUnitario || 0
    });
    setSubcategoriaDialogOpen(true);
  };
  
  const cerrarSubcategoriaDialog = () => {
    setSubcategoriaDialogOpen(false);
    setProductoBase(null);
    setFormSubcategoria({
      codigo: '',
      nombre: '',
      unidad: '',
      stockMinimo: 0,
      pesoUnitario: 0
    });
  };
  
  // Alias para cerrar dialog de variante (mismo que subcategoría)
  const cerrarVarianteDialog = cerrarSubcategoriaDialog;
  
  const guardarSubcategoria = () => {
    if (!formSubcategoria.codigo || !formSubcategoria.nombre) {
      toast.error(t('inventory.errors.completeRequiredFields'));
      return;
    }
    
    const nuevaSubcategoria = {
      id: Date.now().toString(),
      codigo: formSubcategoria.codigo,
      nombre: formSubcategoria.nombre,
      categoria: productoBase?.categoria || '',
      subcategoria: productoBase?.subcategoria || '',
      unidad: formSubcategoria.unidad,
      stockActual: 0,
      stockMinimo: formSubcategoria.stockMinimo,
      ubicacion: productoBase?.ubicacion || '',
      lote: '',
      fechaVencimiento: '',
      esPRS: productoBase?.esPRS || false,
      activo: true,
      icono: productoBase?.icono || '📦',
      peso: 0,
      pesoUnitario: formSubcategoria.pesoUnitario,
      fechaCreacion: new Date().toISOString(),
      esVariante: true,
      productoBaseId: productoBase?.id,
      productoBaseNombre: productoBase?.nombre
    };
    
    guardarProducto(nuevaSubcategoria, { estrategiaDeduplicacion: 'inventario-canonico' });
    toast.success(`✅ Variante creada: "${formVariante.nombre}"`);
    cerrarVarianteDialog();
    
    // Actualizar el estado para mostrar el nuevo producto sin recargar
    setRefreshKey(prev => prev + 1);
  };
  
  // Alias para guardar variante (mismo que subcategoría)
  const guardarVariante = guardarSubcategoria;

  // Funciones para conversión de productos
  const agregarProductoDestino = () => {
    setFormConversion({
      ...formConversion,
      productosDestino: [...formConversion.productosDestino, { productoId: '', ratio: 1 }]
    });
  };

  const eliminarProductoDestino = (index: number) => {
    const nuevosDestinos = formConversion.productosDestino.filter((_, i) => i !== index);
    setFormConversion({ ...formConversion, productosDestino: nuevosDestinos });
  };

  const actualizarProductoDestino = (index: number, campo: 'productoId' | 'ratio', valor: string | number) => {
    const nuevosDestinos = [...formConversion.productosDestino];
    nuevosDestinos[index] = { ...nuevosDestinos[index], [campo]: valor };
    setFormConversion({ ...formConversion, productosDestino: nuevosDestinos });
  };

  const handleConvertirProducto = () => {
    if (!formConversion.productoOrigenId) {
      toast.error(t('inventory.errors.selectOriginProduct'));
      return;
    }

    if (formConversion.productosDestino.length === 0) {
      toast.error(t('inventory.errors.addDestinationProduct'));
      return;
    }

    if (formConversion.cantidadOrigen <= 0) {
      toast.error(t('inventory.errors.quantityMustBePositive'));
      return;
    }

    const productoOrigen = todosLosProductos.find(p => p.id === formConversion.productoOrigenId);
    if (!productoOrigen) {
      toast.error(t('inventory.errors.productNotFound'));
      return;
    }

    // Verificar que hay suficiente stock
    const cantidadTotal = formConversion.cantidadOrigen + formConversion.merma;
    if (productoOrigen.stockActual < cantidadTotal) {
      toast.error(`Stock insuffisant. Disponible: ${productoOrigen.stockActual} ${productoOrigen.unidad}`);
      return;
    }

    // Procesar conversión
    const productosDestinoData = formConversion.productosDestino.map(d => {
      const producto = todosLosProductos.find(p => p.id === d.productoId);
      if (!producto) return null;
      
      const cantidadDestino = formConversion.cantidadOrigen * d.ratio;
      
      // Actualizar stock del producto destino
      actualizarProducto(producto.id, {
        stockActual: producto.stockActual + cantidadDestino,
        productoOrigenId: productoOrigen.id,
        esConversion: true
      });

      return {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: cantidadDestino,
        unidad: producto.unidad
      };
    }).filter(Boolean) as ProductoConversion[];

    // Actualizar stock del producto origen (restar cantidad + merma)
    actualizarProducto(productoOrigen.id, {
      stockActual: productoOrigen.stockActual - cantidadTotal
    });

    // Guardar registro de conversión
    const registroConversion: RegistroConversion = {
      id: `conv-${Date.now()}`,
      fecha: new Date().toISOString(),
      productoOrigen: {
        productoId: productoOrigen.id,
        productoNombre: productoOrigen.nombre,
        cantidad: formConversion.cantidadOrigen,
        unidad: productoOrigen.unidad
      },
      productosDestino: productosDestinoData,
      merma: formConversion.merma,
      mermaMotivo: formConversion.mermaMotivo,
      observaciones: formConversion.observaciones,
      revertida: false
    };

    guardarConversion(registroConversion);
    
    // 📝 REGISTRAR ACTIVIDAD
    registrarActividad(
      'Inventaire',
      'modificar',
      `Conversion de produit: "${productoOrigen.nombre}" (${formConversion.cantidadOrigen} ${productoOrigen.unidad}) vers ${productosDestinoData.length} produit(s)`,
      { 
        conversionId: registroConversion.id,
        productoOrigen: productoOrigen.nombre,
        cantidadDestinos: productosDestinoData.length
      }
    );

    // Guardar como plantilla si se solicitó
    if (formConversion.guardarComoPlantilla && formConversion.nombrePlantilla) {
      const plantilla: PlantillaConversion = {
        id: `plantilla-${Date.now()}`,
        nombre: formConversion.nombrePlantilla,
        descripcion: formConversion.observaciones,
        productoOrigenId: productoOrigen.id,
        configuracion: formConversion.productosDestino.map(d => {
          const prod = todosLosProductos.find(p => p.id === d.productoId);
          return {
            productoDestinoId: d.productoId,
            productoDestinoNombre: prod?.nombre || '',
            ratio: d.ratio
          };
        }),
        mermaEsperada: (formConversion.merma / formConversion.cantidadOrigen) * 100,
        activa: true,
        fechaCreacion: new Date().toISOString(),
        vecesUsada: 1
      };
      guardarPlantillaConversion(plantilla);
      setPlantillasConversion([...plantillasConversion, plantilla]);
    }

    // Recargar productos y conversiones
    setRefreshKey(prev => prev + 1);
    const conversionesActualizadas = obtenerConversionesRecientes(20);
    setConversionesRecientes(conversionesActualizadas);

    // Mensaje de éxito
    const mensajeDestinos = productosDestinoData.map(d => 
      `${formatQuantity(d.cantidad)} ${d.unidad} de "${d.productoNombre}"`
    ).join(', ');
    
    toast.success(
      `✅ Conversion effectuée: ${formConversion.cantidadOrigen} ${productoOrigen.unidad} de "${productoOrigen.nombre}" → ${mensajeDestinos}${formConversion.merma > 0 ? ` (Perte: ${formConversion.merma} ${productoOrigen.unidad})` : ''}`,
      { duration: 6000 }
    );

    // Resetear formulario
    setFormConversion({
      productoOrigenId: '',
      productosDestino: [],
      cantidadOrigen: 0,
      merma: 0,
      mermaMotivo: '',
      observaciones: '',
      guardarComoPlantilla: false,
      nombrePlantilla: ''
    });

    setConversionProductoDialogOpen(false);
  };

  const handleRevertirConversion = (conversionId: string) => {
    const conversion = conversionesRecientes.find(c => c.id === conversionId);
    if (!conversion || conversion.revertida) {
      toast.error(t('inventory.errors.cannotCancelConversion'));
      return;
    }

    // Revertir stock del producto origen (sumar)
    const productoOrigen = todosLosProductos.find(p => p.id === conversion.productoOrigen.productoId);
    if (productoOrigen) {
      const cantidadTotal = conversion.productoOrigen.cantidad + conversion.merma;
      actualizarProducto(productoOrigen.id, {
        stockActual: productoOrigen.stockActual + cantidadTotal
      });
    }

    // Revertir stock de productos destino (restar)
    conversion.productosDestino.forEach(destino => {
      const productoDestino = todosLosProductos.find(p => p.id === destino.productoId);
      if (productoDestino && productoDestino.stockActual >= destino.cantidad) {
        actualizarProducto(productoDestino.id, {
          stockActual: productoDestino.stockActual - destino.cantidad
        });
      }
    });

    // Marcar como revertida
    revertirConversion(conversionId);

    // Recargar datos
    setRefreshKey(prev => prev + 1);
    const conversionesActualizadas = obtenerConversionesRecientes(20);
    setConversionesRecientes(conversionesActualizadas);

    toast.success('✅ Conversion annulée avec succès');
  };

  const aplicarPlantilla = (plantilla: PlantillaConversion) => {
    setFormConversion({
      ...formConversion,
      productoOrigenId: plantilla.productoOrigenId || '',
      productosDestino: plantilla.configuracion.map(c => ({
        productoId: c.productoDestinoId,
        ratio: c.ratio
      })),
      merma: 0,
      mermaMotivo: '',
      observaciones: plantilla.descripcion || ''
    });

    // Incrementar contador de uso
    incrementarUsoPlantilla(plantilla.id);
    const plantillasActualizadas = obtenerPlantillasConversion();
    setPlantillasConversion(plantillasActualizadas);

    // Cambiar al diálogo de conversión
    setPlantillasConversionOpen(false);
    setConversionProductoDialogOpen(true);

    toast.success(`✅ Modèle "${plantilla.nombre}" appliqué`);
  };

  const productosEnLista = listaGenerada
    ? todosLosProductos.filter(p => listaGenerada.productos.includes(p.id))
    : [];

  const totalSeleccionados = productosSeleccionados.filter(p => p.seleccionado).length;

  const quickCartAvailableQuantity = quickCartProduct ? getQuickCartAvailableQuantity(quickCartProduct) : 0;
  const quickCartRequestedQuantity = Number.parseInt(quickCartQuantity, 10);
  const quickCartHasTypedQuantity = quickCartQuantity.trim().length > 0;
  const quickCartQuantityInvalid = quickCartHasTypedQuantity && (!Number.isFinite(quickCartRequestedQuantity) || quickCartRequestedQuantity <= 0);
  const quickCartQuantityExceedsAvailable = Number.isFinite(quickCartRequestedQuantity) && quickCartRequestedQuantity > quickCartAvailableQuantity;
  const quickCartConfirmDisabled = !quickCartHasTypedQuantity || quickCartQuantityInvalid || quickCartQuantityExceedsAvailable;
  const quickCartContinuesScanning = Boolean(quickCartResumeScannerAction);
  const floatingButtonsDragThreshold = 5;

  const handleFloatingButtonsMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    setFloatingButtonsDragging(true);
    setFloatingButtonsDragDistance(0);

    const rect = floatingButtonsRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setFloatingButtonsDragStart({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setFloatingButtonsPosition({
      x: rect.left,
      y: rect.top,
    });
  };

  const handleFloatingButtonsTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFloatingButtonsDragging(true);
    setFloatingButtonsDragDistance(0);

    const touch = event.touches[0];
    const rect = floatingButtonsRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setFloatingButtonsDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setFloatingButtonsPosition({
      x: rect.left,
      y: rect.top,
    });
  };

  const handleFloatingButtonsMouseMove = React.useCallback((event: MouseEvent) => {
    if (!floatingButtonsDragging) {
      return;
    }

    event.preventDefault();

    const newX = event.clientX - floatingButtonsDragStart.x;
    const newY = event.clientY - floatingButtonsDragStart.y;
    const margin = 10;
    const maxX = window.innerWidth - (floatingButtonsRef.current?.offsetWidth || 56) - margin;
    const maxY = window.innerHeight - (floatingButtonsRef.current?.offsetHeight || 112) - margin;
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));

    setFloatingButtonsPosition({ x: boundedX, y: boundedY });

    const distance = Math.sqrt(
      Math.pow(boundedX - floatingButtonsPosition.x, 2) +
      Math.pow(boundedY - floatingButtonsPosition.y, 2)
    );
    setFloatingButtonsDragDistance((current) => current + distance);
  }, [floatingButtonsDragging, floatingButtonsDragStart, floatingButtonsPosition.x, floatingButtonsPosition.y]);

  const handleFloatingButtonsTouchMove = React.useCallback((event: TouchEvent) => {
    if (!floatingButtonsDragging) {
      return;
    }

    event.preventDefault();

    const touch = event.touches[0];
    const newX = touch.clientX - floatingButtonsDragStart.x;
    const newY = touch.clientY - floatingButtonsDragStart.y;
    const margin = 10;
    const maxX = window.innerWidth - (floatingButtonsRef.current?.offsetWidth || 56) - margin;
    const maxY = window.innerHeight - (floatingButtonsRef.current?.offsetHeight || 112) - margin;
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));

    setFloatingButtonsPosition({ x: boundedX, y: boundedY });

    const distance = Math.sqrt(
      Math.pow(boundedX - floatingButtonsPosition.x, 2) +
      Math.pow(boundedY - floatingButtonsPosition.y, 2)
    );
    setFloatingButtonsDragDistance((current) => current + distance);
  }, [floatingButtonsDragging, floatingButtonsDragStart, floatingButtonsPosition.x, floatingButtonsPosition.y]);

  const handleFloatingButtonsDragEnd = React.useCallback(() => {
    setFloatingButtonsDragging(false);
  }, []);

  React.useEffect(() => {
    if (!floatingButtonsDragging) {
      return;
    }

    document.addEventListener('mousemove', handleFloatingButtonsMouseMove);
    document.addEventListener('mouseup', handleFloatingButtonsDragEnd);
    document.addEventListener('touchmove', handleFloatingButtonsTouchMove, { passive: false });
    document.addEventListener('touchend', handleFloatingButtonsDragEnd);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleFloatingButtonsMouseMove);
      document.removeEventListener('mouseup', handleFloatingButtonsDragEnd);
      document.removeEventListener('touchmove', handleFloatingButtonsTouchMove);
      document.removeEventListener('touchend', handleFloatingButtonsDragEnd);
      document.body.style.userSelect = '';
    };
  }, [floatingButtonsDragging, handleFloatingButtonsMouseMove, handleFloatingButtonsTouchMove, handleFloatingButtonsDragEnd]);

  const navigateToModule = (page: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
  };

  const handleAbrirComandasParaEditarDistribucionGrupo = () => {
    const numeroComanda = ultimaDistribucionGrupoCreada?.comandas[0]?.numero;

    if (numeroComanda) {
      savePendingQrNavigation({
        targetPage: 'comandas',
        qrType: 'comanda',
        rawData: {
          tipo: 'comanda',
          id: numeroComanda,
          comanda: numeroComanda,
        },
        action: 'modificar_grupo',
      });
    }

    navigateToModule('comandas');
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (ultimaDistribucionGrupoCreada) {
        window.localStorage.setItem(
          ULTIMA_DISTRIBUCION_GRUPO_STORAGE_KEY,
          JSON.stringify(ultimaDistribucionGrupoCreada)
        );
      } else {
        window.localStorage.removeItem(ULTIMA_DISTRIBUCION_GRUPO_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la dernière distribution groupée:', error);
    }
  }, [ultimaDistribucionGrupoCreada]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const sincronizar = () => {
      setUltimaDistribucionGrupoCreada((actual) => sincronizarResumenDistribucionGrupo(actual));
    };

    sincronizar();
    window.addEventListener(COMANDAS_UPDATED_EVENT, sincronizar);
    window.addEventListener('storage', sincronizar);
    window.addEventListener('focus', sincronizar);

    return () => {
      window.removeEventListener(COMANDAS_UPDATED_EVENT, sincronizar);
      window.removeEventListener('storage', sincronizar);
      window.removeEventListener('focus', sincronizar);
    };
  }, []);

  const inventoryTabLabels: Record<string, string> = {
    productos: 'Produits',
    movimientos: 'Mouvements',
    conversions: 'Conversions',
    entradas: 'Entrées',
    validacion: 'Validation',
    prediccion: 'Prévision',
  };

  const reservedProductsCount = Object.values(reservasInventario).filter((resumen) => (resumen?.totalReservado ?? 0) > 0).length;

  const inventoryExecutiveMetrics = [
    {
      id: 'active-tab',
      label: 'Vue active',
      value: inventoryTabLabels[activeTab] || 'Produits',
      helper: 'Le module garde votre contexte actif pour enchaîner les opérations.',
      icon: <Package className="h-4 w-4" />,
      accentColor: branding.primaryColor,
    },
    {
      id: 'low-stock',
      label: 'Stock critique',
      value: compactLowStockProducts.length,
      helper: compactLowStockProducts.length > 0 ? 'Produits sous seuil minimum à traiter rapidement.' : 'Aucune alerte critique détectée actuellement.',
      icon: <CheckSquare className="h-4 w-4" />,
      accentColor: '#c23934',
    },
    {
      id: 'reserved',
      label: 'Réservations',
      value: reservedProductsCount,
      helper: reservedProductsCount > 0 ? 'Produits actuellement réservés pour des commandes actives.' : 'Aucune réservation en attente.',
      icon: <ShoppingCart className="h-4 w-4" />,
      accentColor: '#e8a419',
    },
    {
      id: 'group-distribution',
      label: 'Distribution ancrée',
      value: ultimaDistribucionGrupoCreada ? ultimaDistribucionGrupoCreada.comandas.length : 0,
      helper: ultimaDistribucionGrupoCreada ? ultimaDistribucionGrupoCreada.grupoDistribucionEtiqueta : 'Aucune distribution de groupe récente mémorisée.',
      icon: <History className="h-4 w-4" />,
      accentColor: branding.secondaryColor,
    },
  ];

  return (
    <div
      className="app-compact-page relative min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] flex flex-col overflow-visible -my-3 sm:-my-4 lg:-my-6 -mx-3 sm:-mx-4 lg:-mx-6"
      style={inventoryViewportZoom < 1 ? { zoom: inventoryViewportZoom } : undefined}
    >
      <Card className="border-none bg-transparent shadow-none flex flex-col overflow-visible rounded-none w-full relative z-10">
        <div className="space-y-3 px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6">
          <ModulePageHeader
            title={t('inventory.title')}
            subtitle={t('inventory.subtitle')}
            icon={<Package className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
            accentColor={branding.primaryColor}
            secondaryColor={branding.secondaryColor}
            actions={(
              <Button
                variant="outline"
                onClick={() => navigateToModule('reportes')}
                className="border-[#1a4d7a] text-[#1a4d7a] hover:bg-blue-50 shrink-0 w-full sm:w-auto"
                title="Ouvrir le module Rapports"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Module Rapports</span>
                <span className="sm:hidden">Rapports</span>
              </Button>
            )}
          />

          <ModuleExecutiveStrip
            eyebrow="Pilotage opérationnel"
            title="Console d'action Entrepôt"
            description="Gardez les signaux critiques, l'onglet actif et les accès rapides au même endroit pour piloter l'inventaire sans changer de contexte."
            accentColor={branding.primaryColor}
            secondaryColor={branding.secondaryColor}
            metrics={inventoryExecutiveMetrics}
            actions={(
              <>
                <Button variant="outline" onClick={() => setActiveTab('productos')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                  <Package className="mr-2 h-4 w-4" />
                  Produits
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('entradas')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                  <History className="mr-2 h-4 w-4" />
                  Entrées
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('validacion')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Validation
                </Button>
                <Button onClick={() => setActiveTab('prediccion')} className="text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Prévision
                </Button>
              </>
            )}
          />
        </div>

        <CardContent className="pt-3 sm:pt-4 flex flex-col overflow-visible space-y-3">
          <ModuleStatsGrid
            compact={isCompactInventoryViewport}
            compactLayout="grid grid-cols-4 gap-1.5"
            defaultLayout="grid grid-cols-2 gap-2 md:grid-cols-4"
            className="flex-shrink-0"
          >
            <ModuleStatCard
              label={t('inventory.totalProducts')}
              value={todosLosProductos.length}
              icon={<Package className="h-4 w-4 text-white" />}
              accentColor={branding.primaryColor}
            />
            <ModuleStatCard
              label="Sous-catégories"
              value={subcategoriasInventario.length}
              icon={<Grid3x3 className="h-4 w-4 text-white" />}
              accentColor={branding.secondaryColor}
            />
            <ModuleStatCard
              label={t('inventory.totalStock')}
              value={todosLosProductos.reduce((sum, p) => sum + p.stockActual, 0)}
              icon={<FileText className="h-4 w-4 text-white" />}
              accentColor="#e8a419"
              valueColor="#e8a419"
            />
            <ModuleStatCard
              label={t('inventory.inCart')}
              value={calcularTotalItems()}
              icon={<ShoppingCart className="h-4 w-4 text-white" />}
              accentColor="#c23934"
              valueColor="#c23934"
            />
          </ModuleStatsGrid>

      {ultimaDistribucionGrupoCreada && (
        <Card className="mx-3 mb-3 overflow-hidden border border-[#A7D7AE] bg-[linear-gradient(145deg,rgba(232,245,233,0.96)_0%,rgba(255,255,255,0.96)_100%)] shadow-[0_22px_48px_-36px_rgba(46,125,50,0.24)] sm:mx-4 lg:mx-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#2E7D32] text-white">Derniere distribution de groupe</Badge>
                  <Badge className="bg-[#1E73BE] text-white">{ultimaDistribucionGrupoCreada.grupoDistribucionId}</Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1B5E20]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {ultimaDistribucionGrupoCreada.grupoDistribucionEtiqueta}
                  </p>
                  <p className="text-xs text-[#355E3B]">
                    L'acces reste visible ici apres la creation. Vous pouvez ouvrir Commandes a tout moment pour modifier la distribution ancree.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ultimaDistribucionGrupoCreada.comandas.slice(0, 4).map((comanda) => (
                    <span
                      key={comanda.numero}
                      className="rounded-full border border-[#A7D7AE] bg-white px-2.5 py-1 text-[11px] font-medium text-[#1F2937]"
                    >
                      {comanda.numero}
                    </span>
                  ))}
                  {ultimaDistribucionGrupoCreada.comandas.length > 4 && (
                    <span className="rounded-full border border-dashed border-[#A7D7AE] px-2.5 py-1 text-[11px] font-medium text-[#355E3B]">
                      +{ultimaDistribucionGrupoCreada.comandas.length - 4}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleAbrirComandasParaEditarDistribucionGrupo}
                  className="bg-[#1E73BE] hover:bg-[#1557A0]"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ouvrir les commandes
                </Button>
                <Button variant="outline" onClick={() => setUltimaDistribucionGrupoCreada(null)}>
                  <X className="mr-2 h-4 w-4" />
                  Masquer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col overflow-visible">
        <ModuleControlSurface>
          <ModuleControlSurfaceTabs>
            <TabsList
              className="app-compact-tabs-grid flex-shrink-0 gap-1 bg-transparent p-0"
              style={isCompactInventoryViewport ? { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' } : undefined}
            >
              <TabsTrigger className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" value="productos">{t('inventory.products')}</TabsTrigger>
              <TabsTrigger className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" value="movimientos">{t('inventory.movements')}</TabsTrigger>
              <TabsTrigger className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" value="conversions">🔄 {t('inventory.conversionsTab')}</TabsTrigger>
              <TabsTrigger className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" value="entradas">{t('inventory.entryHistory')}</TabsTrigger>
              <TabsTrigger className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" value="validacion">✅ {t('inventory.validationTab')}</TabsTrigger>
              <TabsTrigger className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" value="prediccion">🔮 {t('inventory.predictionTab')}</TabsTrigger>
            </TabsList>
          </ModuleControlSurfaceTabs>
        </ModuleControlSurface>

        {/* Productos Tab */}
        <TabsContent value="productos" className={`flex flex-col overflow-visible ${showCompactProductsOverview ? 'space-y-2 mt-2' : 'space-y-3 mt-3'}`}>
          <ModuleControlSurface>
            <ModuleControlSurfaceBody className={showCompactProductsOverview ? 'space-y-2 pt-3 sm:pt-4' : 'space-y-3 pt-3 sm:pt-4'}>
              {/* Toolbar */}
              <div className={`flex flex-col ${showCompactProductsOverview ? 'gap-1.5' : 'gap-2'} lg:flex-row lg:items-center lg:justify-between flex-shrink-0`}>
                <div className="flex-1 flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                    <Input
                      placeholder={t('inventory.searchPlaceholder', { defaultValue: t('inventory.searchByNameOrCode') })}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-xs"
                    />
                  </div>

                  <div className="relative flex-1 max-w-xs">
                    <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                    <Input
                      placeholder={t('inventory.searchByLotNumber')}
                      value={searchLote}
                      onChange={(e) => setSearchLote(e.target.value)}
                      className="pl-10 h-9 text-xs"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 h-9 text-xs"
                  >
                    <Filter className="h-4 w-4" />
                    {t('common.filter')}
                  </Button>

                  <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nombre">{t('inventory.productName')}</SelectItem>
                      <SelectItem value="stock">{t('inventory.stock')}</SelectItem>
                      <SelectItem value="categoria">Sous-catégorie</SelectItem>
                      <SelectItem value="valor">{t('inventory.monetaryValue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isCompactInventoryViewport && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setVistaMode(vistaMode === 'grid' ? 'list' : 'grid')}
                      title={vistaMode === 'grid' ? t('inventory.viewList') : t('inventory.viewGrid')}
                      className="h-9 w-9"
                    >
                      {vistaMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                    </Button>
                  )}

                  <Button
                    onClick={abrirAjoutStockExistant}
                    className="h-9 gap-2 bg-[#2d9561] px-3 text-white hover:bg-[#24794f]"
                    title="Ajouter au stock existant"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-xs font-semibold">Ajouter au stock</span>
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => setCompartirDialogOpen(true)}
                    className="bg-[#2d9561] hover:bg-[#267a4f] h-9 w-9"
                    title={t('inventory.shareProductList')}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => setExportacionOpen(true)}
                    variant="outline"
                    className="border-[#1a4d7a] text-[#1a4d7a] hover:bg-blue-50 h-9 w-9"
                    title={t('common.export')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => openInventoryScanner()}
                    variant="outline"
                    className="border-[#9C27B0] text-[#9C27B0] hover:bg-purple-50 h-9 w-9"
                    title={t('inventory.scanQrTitle')}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => openInventoryScanner('agregar_carrito_rapido')}
                    variant="outline"
                    className="border-[#2d9561] text-[#2d9561] hover:bg-green-50 h-9 w-9"
                    title="Scanner QR et saisir la quantité pour le panier"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => setCarritoOpen(true)}
                    variant="outline"
                    className="relative h-9 w-9"
                    title={t('inventory.cart')}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {carrito.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#c23934]">
                        {carrito.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <Card className="overflow-hidden border-white/75 bg-white/90 shadow-[0_20px_46px_-36px_rgba(15,45,71,0.22)]">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2">Sous-catégorie</Label>
                        <div className="flex flex-wrap gap-2">
                          {subcategoriasInventario.map(subcategoria => (
                            <Button
                              key={subcategoria.label}
                              variant={selectedCategories.includes(subcategoria.label) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleCategoria(subcategoria.label)}
                              className={selectedCategories.includes(subcategoria.label) ? 'bg-[#1a4d7a]' : ''}
                            >
                              <span className="emoji-icon">{subcategoria.icon}</span> {subcategoria.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                          {t('common.clear')} {t('common.filter')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Indicador de Filtros Activos */}
              {(searchLote || searchUbicacion || selectedCategories.length > 0) && (
                <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
                  <span className="text-sm text-[#666666]">{t('inventory.activeFilters')}</span>
                  {searchUbicacion && (
                    <Badge variant="outline" className="bg-blue-50 text-[#1a4d7a] border-[#1a4d7a]">
                      📍 Emplacement: {searchUbicacion}
                      <button
                        onClick={() => setSearchUbicacion('')}
                        className="ml-2 hover:text-[#c23934]"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {searchLote && (
                    <Badge variant="outline" className="bg-blue-50 text-[#1a4d7a] border-[#1a4d7a]">
                      📦 Lot: {searchLote}
                      <button
                        onClick={() => setSearchLote('')}
                        className="ml-2 hover:text-[#c23934]"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCategories.map(cat => {
                    const subcategoria = subcategoriasInventario.find(item => item.label === cat);

                    return (
                      <Badge key={cat} variant="outline" className="bg-blue-50 text-[#1a4d7a] border-[#1a4d7a]">
                        {subcategoria?.icon || '📦'} {cat}
                        <button
                          onClick={() => toggleCategoria(cat)}
                          className="ml-2 hover:text-[#c23934]"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </ModuleControlSurfaceBody>
          </ModuleControlSurface>

          {/* Products List */}
          {showCompactProductsOverview ? (
            <Card className="overflow-hidden border-white/75 bg-white/90 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)]">
              <CardContent className="space-y-2.5 p-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[18px] border border-white/80 bg-[#F4F8FB]/92 px-3 py-2 shadow-[0_14px_28px_-24px_rgba(15,45,71,0.16)]">
                    <p className="text-[10px] uppercase tracking-wide text-[#666666]">Produits visibles</p>
                    <p className="mt-1 text-lg font-bold text-[#1a4d7a]">{productosFiltrados.length}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/80 bg-[#FFF8E8]/92 px-3 py-2 shadow-[0_14px_28px_-24px_rgba(15,45,71,0.16)]">
                    <p className="text-[10px] uppercase tracking-wide text-[#666666]">Unités réservées</p>
                    <p className="mt-1 text-lg font-bold text-[#e8a419]">{compactReservedTotal}</p>
                  </div>
                </div>

                {productosFiltrados.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-[#D6D6D6] bg-[#FAFBFC]/92 px-3 py-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <Package className="mx-auto h-8 w-8 text-[#999999]" />
                    <p className="mt-2 text-sm font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('common.noResults')}
                    </p>
                    <p className="mt-1 text-[11px] text-[#666666]">{t('inventory.adjustSearchFilters')}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#666666]">Sous-catégories dominantes</p>
                        <Badge variant="outline" className="text-[10px]">
                          {compactProductsBySubcategory.length} vues
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {compactProductsBySubcategory.map(item => (
                          <div key={item.label} className="rounded-[18px] border border-white/80 bg-white/92 px-2.5 py-2 shadow-[0_12px_24px_-22px_rgba(15,45,71,0.16)]">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-[#333333]">
                                  <span className="emoji-icon mr-1">{item.icon}</span>
                                  {item.label}
                                </p>
                                <p className="mt-1 text-[10px] text-[#666666]">{item.count} produits</p>
                              </div>
                              <span className="text-xs font-bold text-[#1a4d7a]">{item.stock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#666666]">Produits prioritaires</p>
                        {compactLowStockProducts.length > 0 && (
                          <Badge className="bg-[#c23934] text-[10px] text-white hover:bg-[#c23934]">
                            {compactLowStockProducts.length} stock bas
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-2">
                        {compactHighlightedProducts.map(producto => {
                          const reserva = reservasInventario[producto.id] || {
                            totalReservado: 0,
                            disponibleParaReservar: producto.stockActual,
                          };
                          const stockStatus = getStockStatus(producto);

                          return (
                            <div key={producto.id} className="rounded-[18px] border border-white/80 bg-white/92 px-3 py-2 shadow-[0_12px_24px_-22px_rgba(15,45,71,0.16)]">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-[#333333]" title={getInventoryProductName(producto)}>
                                    <span className="emoji-icon mr-1">{obtenerIconoProducto(producto)}</span>
                                    {getInventoryProductName(producto)}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-[#666666]">
                                    <span>{producto.codigo}</span>
                                    {producto.ubicacion && <span>• {producto.ubicacion}</span>}
                                    {producto.lote && <span>• L:{producto.lote}</span>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-[#1a4d7a]">{reserva.disponibleParaReservar}</p>
                                  <p className="text-[10px] text-[#666666]">res.</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <Badge className={`${stockStatus.color} text-[10px] text-white hover:${stockStatus.color}`}>
                                  {stockStatus.label}
                                </Badge>
                                <p className="text-[10px] text-[#666666]">Réservé: {reserva.totalReservado}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : effectiveVistaMode === 'list' ? (
            <Card className="flex flex-col overflow-visible border-white/75 bg-white/90 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)]">
              <CardContent className="pt-4 px-4 pb-4 overflow-visible">
                <div className="overflow-visible rounded-[22px] border border-white/78 shadow-[0_16px_36px_-30px_rgba(15,45,71,0.16)]">
                  <Table className="min-w-0 table-fixed [&_th]:whitespace-normal [&_th]:break-words [&_td]:whitespace-normal [&_td]:break-words">
                    <TableHeader className="sticky top-0 bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] z-10 border-b-2 border-[#1a4d7a]">
                      <TableRow className="h-8">
                        <TableHead className="w-[4%] font-semibold text-[#333333] text-[11px] py-1 px-1.5 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.photo')}</TableHead>
                        <TableHead className="w-[8%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.code')}</TableHead>
                        <TableHead className="w-[15%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.productName')}</TableHead>
                        <TableHead className="w-[8%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>📦 {t('inventory.lotNumberShort')}</TableHead>
                        <TableHead className="w-[6%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('common.unit')}</TableHead>
                        <TableHead className="w-[9%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('common.unitWeight')}</TableHead>
                        <TableHead className="w-[12%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.currentStock')}</TableHead>
                        <TableHead className="w-[7%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.minimumStock')}</TableHead>
                        <TableHead className="w-[10%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>💰 Valor Total</TableHead>
                        <TableHead className="w-[9%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.location')}</TableHead>
                        <TableHead className="w-[5%] font-semibold text-[#333333] text-[11px] py-1 px-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('common.status')}</TableHead>
                        <TableHead className="w-[7%] font-semibold text-[#333333] text-[11px] py-1 px-1.5 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosFiltrados.map((producto, index) => {
                        const stockStatus = getStockStatus(producto);
                        const itemEnCarrito = carrito.find(item => item.productoId === producto.id);
                        const reserva = reservasInventario[producto.id] || {
                          totalReservado: 0,
                          disponibleParaReservar: producto.stockActual
                        };

                        return (
                          <TableRow 
                            key={producto.id}
                            className={`hover:bg-blue-50/50 transition-colors border-b border-[#F0F0F0] h-10 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                            }`}
                          >
                            <TableCell className="py-1 px-1.5 align-top">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-[#F4F4F4] to-[#E8E8E8] border border-[#E0E0E0]">
                                <span className="text-lg emoji-icon">{obtenerIconoProducto(producto)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              <span className="inline-block font-mono text-[10px] font-semibold text-[#1a4d7a] bg-blue-50 px-1.5 py-0.5 rounded break-all">
                                {producto.codigo}
                              </span>
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              <div className="flex flex-col">
                                <span className="font-semibold text-[#333333] text-xs leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {getInventoryProductName(producto)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              {producto.lote ? (
                                <Badge 
                                  variant="outline" 
                                  className="max-w-full bg-blue-50 text-[#1a4d7a] border-[#1a4d7a] font-mono text-[10px] px-1.5 py-0 break-all"
                                >
                                  📦 {producto.lote}
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-[#999999] italic">-</span>
                              )}
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top text-center">
                              <Badge 
                                variant="secondary" 
                                className="font-medium bg-[#F4F4F4] text-[#333333] border border-[#E0E0E0] text-[10px] px-1.5 py-0"
                              >
                                {producto.unidad}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              {getDisplayWeight(producto) !== null ? (
                                <span className="font-bold text-[#1a4d7a] text-xs">
                                  {getDisplayWeight(producto)} <span className="text-[10px]">kg</span>
                                </span>
                              ) : (
                                <span className="text-[#999999] text-[10px] italic">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              <div className="flex flex-col leading-tight">
                                <span className="text-sm font-bold text-[#333333]">{reserva.disponibleParaReservar}</span>
                                <span className="text-[10px] text-[#666666]">Reservado: {reserva.totalReservado}</span>
                                <span className="text-[10px] text-[#999999]">Físico: {producto.stockActual}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              <span className="text-xs font-medium text-[#666666]">
                                {producto.stockMinimo}
                              </span>
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              {(() => {
                                // 🎯 PRIORIDAD 1: Usar valorTotal o valorUnitario si están disponibles
                                if (producto.valorTotal && producto.valorTotal > 0) {
                                  return (
                                    <div className="flex flex-col items-start bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                      <span className="text-xs font-bold text-[#2d9561]">
                                        CAD$ {formatMoney(producto.valorTotal)}
                                      </span>
                                    </div>
                                  );
                                }
                                
                                if (producto.valorUnitario && producto.valorUnitario > 0) {
                                  const valorTotal = producto.valorUnitario * producto.stockActual;
                                  return (
                                    <div className="flex flex-col items-start bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                      <span className="text-xs font-bold text-[#2d9561]">
                                        CAD$ {formatMoney(valorTotal)}
                                      </span>
                                      <span className="text-[9px] text-gray-600">
                                        ${formatMoney(producto.valorUnitario)}/u
                                      </span>
                                    </div>
                                  );
                                }
                                
                                // 🎯 PRIORIDAD 2: Calcular el valor monetario basado en el PESO TOTAL del stock
                                // peso total = stockActual × pesoUnitario
                                const pesoUnitario = producto.pesoUnitario || producto.peso || 0;
                                const pesoTotal = producto.stockActual * pesoUnitario;
                                
                                const valorCalculado = calcularValorMonetario(
                                  pesoTotal,
                                  producto.categoria,
                                  producto.subcategoria,
                                  producto.varianteId // 🔧 CORRECCIÓN: Usar varianteId en lugar de productoBaseId
                                );
                                
                                if (valorCalculado !== undefined && valorCalculado > 0) {
                                  return (
                                    <div className="flex flex-col items-start bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                      <span className="text-xs font-bold text-[#2d9561]">
                                        CAD$ {formatMoney(valorCalculado)}
                                      </span>
                                    </div>
                                  );
                                }
                                
                                // Mostrar mensaje de ayuda si no hay valor
                                if (pesoUnitario === 0) {
                                  return <span className="text-[10px] text-amber-600 italic">Sin peso</span>;
                                }
                                
                                return <span className="text-[10px] text-[#999999] italic">-</span>;
                              })()}
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              {producto.ubicacion ? (
                                <button
                                  type="button"
                                  onClick={() => focusLocationProductsFromQr(producto.ubicacion)}
                                  title={`Modifier tous les produits de ${producto.ubicacion}`}
                                  className="flex max-w-full items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded border border-[#2d9561] hover:bg-green-100 transition-colors"
                                >
                                  <MapPin className="h-3 w-3 text-[#2d9561]" />
                                  <span className="text-[10px] font-medium text-[#333333] break-words">{producto.ubicacion}</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                  <MapPin className="h-3 w-3 text-[#999999]" />
                                  <span className="text-[10px] italic text-[#999999]">Non localisé</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top text-center">
                              <Badge 
                                className={`${stockStatus.color} max-w-full text-white font-medium text-[10px] px-2 py-0 whitespace-normal break-words`}
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >
                                {stockStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-1 px-1.5 align-top">
                              <div className="grid grid-cols-2 gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setProductoEscaneado(producto);
                                    setDialogLocalizacionOpen(true);
                                  }}
                                  title="Localiser le produit"
                                  className="hover:bg-green-50 hover:border-[#2d9561] transition-all h-7 w-full min-w-0 p-0"
                                >
                                  <MapPin className="h-3 w-3 text-[#2d9561]" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirConversionUnidades(producto)}
                                  title={t('inventory.convertUnits')}
                                  className="hover:bg-blue-50 hover:border-[#1a4d7a] transition-all h-7 w-full min-w-0 p-0"
                                >
                                  <ArrowLeftRight className="h-3 w-3 text-[#1a4d7a]" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setProductoSeleccionado(producto);
                                    setHistorialProductoDialogOpen(true);
                                  }}
                                  title={t('inventory.viewHistory')}
                                  className="hover:bg-purple-50 hover:border-[#9C27B0] transition-all h-7 w-full min-w-0 p-0"
                                >
                                  <History className="h-3 w-3 text-[#9C27B0]" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => agregarAlCarrito(producto.id, 1)}
                                  className={`transition-all h-7 w-full min-w-0 p-0 ${
                                    itemEnCarrito 
                                      ? 'bg-[#2d9561] text-white hover:bg-[#267a4f]' 
                                      : 'bg-white border-2 border-[#2d9561] text-[#2d9561] hover:bg-[#2d9561] hover:text-white'
                                  }`}
                                  title={itemEnCarrito ? t('inventory.inCart') : t('inventory.addToCart')}
                                >
                                  <ShoppingCart className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {productosFiltrados.length === 0 && (
                  <div className="py-6 text-center bg-gradient-to-b from-white to-[#F8F9FA]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <Package className="h-7 w-7 text-[#1a4d7a]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {t('common.noResults')}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {t('inventory.adjustSearchFilters')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Vista Grid */
            <div className="overflow-visible border rounded-lg p-3 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {productosFiltrados.map(producto => {
                  const stockStatus = getStockStatus(producto);
                  const itemEnCarrito = carrito.find(item => item.productoId === producto.id);
                  const reserva = reservasInventario[producto.id] || {
                    totalReservado: 0,
                    disponibleParaReservar: producto.stockActual
                  };

                  return (
                    <Card key={producto.id} className="overflow-hidden border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        {/* Icono de la subcategoría del producto */}
                        <div className="bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] h-20 flex items-center justify-center">
                          <span className="text-4xl emoji-icon">{obtenerIconoProducto(producto)}</span>
                        </div>
                        
                        {/* Información del producto */}
                        <div className="p-3 space-y-2.5">
                          {/* Nombre y código */}
                          <div className="space-y-1.5">
                            <h3 className="font-semibold text-sm text-[#333333] leading-tight h-9 overflow-hidden" title={getInventoryProductName(producto)}>
                              {getInventoryProductName(producto)}
                            </h3>
                            <p
                              className="text-[10px] text-[#666666] font-mono truncate"
                              title={producto.lote ? `${producto.codigo} • L:${producto.lote}` : producto.codigo}
                            >
                              {producto.codigo}
                              {producto.lote ? ` • L:${producto.lote}` : ''}
                            </p>
                          </div>

                          {/* Stock y estado */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-md bg-[#F4F7FA] px-2 py-1.5">
                              <p className="text-[10px] uppercase tracking-wide text-[#666666]">Reservable</p>
                              <p className="text-base font-bold leading-none text-[#1a4d7a] mt-1">
                                {reserva.disponibleParaReservar}
                              </p>
                              <p className="text-[10px] text-[#999999] mt-1">Físico: {producto.stockActual} {producto.unidad}</p>
                            </div>
                            <div className="rounded-md bg-[#F4F7FA] px-2 py-1.5 text-right">
                              <p className="text-[10px] uppercase tracking-wide text-[#666666]">Min.</p>
                              <p className="text-sm font-semibold leading-none text-[#333333] mt-1">
                                {producto.stockMinimo} {producto.unidad}
                              </p>
                              <p className="text-[10px] text-[#999999] mt-1">Res.: {reserva.totalReservado}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {producto.unidad}
                            </Badge>
                            {getReliableUnitWeight(producto) !== null && (
                              <Badge variant="outline" className="bg-white text-[#1a4d7a] border-[#1a4d7a] text-[10px] px-1.5 py-0">
                                ⚖️ {getReliableUnitWeight(producto)} kg/{producto.unidad}
                              </Badge>
                            )}
                            <Badge className={`${stockStatus.color} text-white text-[10px] px-1.5 py-0`}>
                              {stockStatus.label}
                            </Badge>
                            {producto.ubicacion ? (
                              <button
                                type="button"
                                onClick={() => focusLocationProductsFromQr(producto.ubicacion)}
                                title={`Modifier tous les produits de ${producto.ubicacion}`}
                                className="inline-flex max-w-full items-center rounded-md border border-[#2d9561] bg-green-50 px-1.5 py-0 text-[10px] text-[#2d9561] hover:bg-green-100 transition-colors"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">{producto.ubicacion}</span>
                              </button>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-[#999999] px-1.5 py-0">
                                <MapPin className="h-3 w-3 mr-1" />
                                Non localisé
                              </Badge>
                            )}
                          </div>

                          {/* Valor Monetario */}
                          {(() => {
                            // 🎯 PRIORIDAD 1: Usar valorTotal o valorUnitario si están disponibles
                            if (producto.valorTotal && producto.valorTotal > 0) {
                              return (
                                <div className="flex items-center justify-between rounded-md bg-green-50 px-2 py-1.5 border border-green-200">
                                  <p className="text-[10px] text-[#666666]">💰 Valor</p>
                                  <p className="text-sm font-bold text-[#2d9561]">CAD$ {formatMoney(producto.valorTotal)}</p>
                                </div>
                              );
                            }
                            
                            if (producto.valorUnitario && producto.valorUnitario > 0) {
                              const valorTotal = producto.valorUnitario * producto.stockActual;
                              return (
                                <div className="rounded-md bg-green-50 px-2 py-1.5 border border-green-200">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] text-[#666666]">💰 Valor</p>
                                    <p className="text-sm font-bold text-[#2d9561]">CAD$ {formatMoney(valorTotal)}</p>
                                  </div>
                                  <p className="text-[10px] text-gray-600 mt-1 text-right">${formatMoney(producto.valorUnitario)}/u</p>
                                </div>
                              );
                            }
                            
                            // 🎯 PRIORIDAD 2: Calcular usando categoría
                            const pesoUnitario = producto.pesoUnitario || producto.peso || 0;
                            const pesoTotal = producto.stockActual * pesoUnitario;
                            
                            const valorCalculado = calcularValorMonetario(
                              pesoTotal,
                              producto.categoria,
                              producto.subcategoria,
                              producto.varianteId
                            );
                            
                            if (valorCalculado !== undefined && valorCalculado > 0) {
                              return (
                                <div className="flex items-center justify-between rounded-md bg-green-50 px-2 py-1.5 border border-green-200">
                                  <p className="text-[10px] text-[#666666]">💰 Valor</p>
                                  <p className="text-sm font-bold text-[#2d9561]">CAD$ {formatMoney(valorCalculado)}</p>
                                </div>
                              );
                            }
                            
                            return null;
                          })()}

                          {/* Acciones */}
                          <div className="grid grid-cols-4 gap-1 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setProductoEscaneado(producto);
                                setDialogLocalizacionOpen(true);
                              }}
                              title="Localiser le produit"
                              className="h-8 p-0 hover:bg-green-50 hover:border-[#2d9561]"
                            >
                              <MapPin className="h-4 w-4 text-[#2d9561]" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirConversionUnidades(producto)}
                              title={t('inventory.convertUnits')}
                              className="h-8 p-0 hover:bg-blue-50 hover:border-[#1a4d7a]"
                            >
                              <ArrowLeftRight className="h-4 w-4 text-[#1a4d7a]" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setProductoSeleccionado(producto);
                                setHistorialProductoDialogOpen(true);
                              }}
                              title={t('inventory.viewHistory')}
                              className="h-8 p-0 hover:bg-purple-50 hover:border-[#9C27B0]"
                            >
                              <History className="h-4 w-4 text-[#9C27B0]" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => agregarAlCarrito(producto.id, 1)}
                              className={`h-8 p-0 ${itemEnCarrito ? 'bg-[#2d9561] text-white hover:bg-[#267a4f]' : ''}`}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {productosFiltrados.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-[#999999]" />
                    <p className="mt-4 text-[#666666]">{t('common.noResults')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Movimientos Tab */}
        <TabsContent value="movimientos" className="flex flex-col overflow-hidden mt-3">
          {activeTab === 'movimientos' && (
            <DeferredPanel>
              <MovimientosInventario productos={todosLosProductos} />
            </DeferredPanel>
          )}
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="flex flex-col overflow-hidden space-y-3 mt-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    <ArrowRightLeft className="w-6 h-6 text-[#e8a419]" />
                    Conversion de Produits
                  </CardTitle>
                  <CardDescription>
                    Convertissez le stock d'un produit vers un ou plusieurs autres produits avec support pour pertes et modèles.
                  </CardDescription>
                </div>
                <Button
                  size="icon"
                  onClick={() => setGuiaConversionesOpen(true)}
                  variant="outline"
                  className="border-[#1a4d7a] text-[#1a4d7a] hover:bg-blue-50"
                  title="Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estadísticas de conversiones */}
              {conversionesRecientes.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-[#666666] mb-1">Total</p>
                      <p className="text-2xl font-bold text-[#e8a419]">{obtenerEstadisticasConversiones().total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#666666] mb-1">Cette semaine</p>
                      <p className="text-2xl font-bold text-[#2d9561]">{obtenerEstadisticasConversiones().ultimaSemana}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#666666] mb-1">Annulées</p>
                      <p className="text-2xl font-bold text-[#c23934]">{obtenerEstadisticasConversiones().revertidas}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#666666] mb-1">Modèles</p>
                      <p className="text-2xl font-bold text-[#1a4d7a]">{plantillasConversion.length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="icon"
                  onClick={() => setConversionProductoDialogOpen(true)}
                  className="bg-[#e8a419] hover:bg-[#d19316] text-[#333333]"
                  title="Nouvelle Conversion"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon"
                  onClick={() => setHistorialConversionesOpen(true)}
                  variant="outline"
                  className="border-[#e8a419] text-[#e8a419] hover:bg-orange-50"
                  title={`Historique (${conversionesRecientes.length})`}
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon"
                  onClick={() => setPlantillasConversionOpen(true)}
                  variant="outline"
                  className="border-[#1a4d7a] text-[#1a4d7a] hover:bg-blue-50"
                  title={`Modèles (${plantillasConversion.length})`}
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                
                {/* Mensaje informativo si no hay conversiones */}
                {conversionesRecientes.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Aucune conversion récente disponible
                  </p>
                )}
              </div>

              {/* Lista de conversiones recientes */}
              {conversionesRecientes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Conversions Récentes
                  </h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {conversionesRecientes.slice(0, 5).map((conversion) => (
                      <div 
                        key={conversion.id} 
                        className={`p-4 rounded-lg border ${conversion.revertida ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowRightLeft className={`w-4 h-4 ${conversion.revertida ? 'text-[#c23934]' : 'text-[#e8a419]'}`} />
                              <span className="font-medium text-[#333333]">
                                {conversion.productoOrigen.cantidad} {conversion.productoOrigen.unidad} de "{conversion.productoOrigen.productoNombre}"
                              </span>
                              {conversion.revertida && (
                                <Badge className="bg-[#c23934] text-white">
                                  <Undo2 className="w-3 h-3 mr-1" />
                                  Annulée
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-[#666666] space-y-1 ml-6">
                              <p>
                                → {conversion.productosDestino.map(d => 
                                  `${formatQuantity(d.cantidad)} ${d.unidad} de "${d.productoNombre}"`
                                ).join(', ')}
                              </p>
                              {conversion.merma > 0 && (
                                <p className="text-[#c23934]">
                                  ⚠️ Perte: {conversion.merma} {conversion.productoOrigen.unidad}
                                  {conversion.mermaMotivo && ` (${conversion.mermaMotivo})`}
                                </p>
                              )}
                              <p className="text-xs">
                                📅 {new Date(conversion.fecha).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          {!conversion.revertida && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevertirConversion(conversion.id)}
                              className="text-[#c23934] border-[#c23934] hover:bg-red-50"
                            >
                              <Undo2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay conversiones */}
              {conversionesRecientes.length === 0 && (
                <div className="text-center py-12">
                  <ArrowRightLeft className="w-12 h-12 text-[#999999] mx-auto mb-4" />
                  <p className="text-[#666666] mb-2 text-lg font-medium">Aucune conversion effectuée</p>
                  <p className="text-[#999999] text-sm mb-6">
                    Reconditionnez des produits (céréales 2kg → 3kg), triez des produits variés (fruits variés → pommes),<br />
                    ou transformez du vrac en portions familiales (riz 25kg → paquets 1kg)
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button 
                      onClick={() => setConversionProductoDialogOpen(true)}
                      className="bg-[#e8a419] hover:bg-[#d19316] text-[#333333]"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Créer une conversion
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entradas Tab */}
        <TabsContent value="entradas" className="flex flex-col overflow-hidden space-y-3 mt-3">
          <div className="flex items-center">
            <div>
              <h2 className="text-xl font-bold text-[#333333]">{t('inventory.entryHistory')}</h2>
              <p className="text-sm text-[#666666]">{t('inventory.entryHistoryCompact.tabDescription')}</p>
            </div>
          </div>

          {activeTab === 'entradas' && (
            <DeferredPanel>
              <HistorialEntradasCompacto onAgregarAlCarrito={agregarEntradaAlCarrito} />
            </DeferredPanel>
          )}
        </TabsContent>

        {/* Validación Tab - NUEVO */}
        <TabsContent value="validacion" className="flex flex-col overflow-hidden space-y-3 mt-3">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#333333]">{t('inventory.entryValidationDialog.tabTitle')}</h2>
              <p className="text-sm text-[#666666]">{t('inventory.entryValidationDialog.tabDescription')}</p>
            </div>
            <Button
              size="icon"
              onClick={() => setValidacionEntradasOpen(true)}
              className="bg-[#2d9561] hover:bg-[#267a4f]"
              title={t('inventory.entryValidationDialog.openPanelTitle')}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="py-12 text-center">
                <CheckSquare className="mx-auto h-16 w-16 text-[#2d9561] mb-4" />
                <h3 className="text-lg font-semibold text-[#333333] mb-2">
                  {t('inventory.entryValidationDialog.panelTitle')}
                </h3>
                <p className="text-[#666666] mb-4 max-w-2xl mx-auto">
                  {t('inventory.entryValidationDialog.panelDescription')}
                </p>
                <Button
                  onClick={() => setValidacionEntradasOpen(true)}
                  className="bg-[#2d9561] hover:bg-[#267a4f]"
                  size="lg"
                >
                  <CheckSquare className="h-5 w-5 mr-2" />
                  {t('inventory.entryValidationDialog.startButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predicción Tab - NUEVO */}
        <TabsContent value="prediccion" className="flex flex-col overflow-hidden space-y-3 mt-3">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#333333]">Análisis Predictivo de Stock</h2>
            <p className="text-sm text-[#666666]">
              Proyección inteligente de agotamiento de productos basada en consumo histórico
            </p>
          </div>

          {activeTab === 'prediccion' && (
            <DeferredPanel>
              <AnalisisPredictivoStock />
            </DeferredPanel>
          )}
        </TabsContent>


      </Tabs>
        </CardContent>
      </Card>

      {/* Dialog: Compartir Lista de Productos */}
      <Dialog open={compartirDialogOpen} onOpenChange={setCompartirDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="share-product-list-description">
          {!vistaPreviewLista ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-[#1a4d7a]" />
                  {t('inventory.shareProductList')}
                </DialogTitle>
                <DialogDescription id="share-product-list-description">
                  {t('inventory.selectProductsForList')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Nombre de la lista */}
                <div className="space-y-2">
                  <Label htmlFor="nombreLista">{t('inventory.listName')} *</Label>
                  <Input
                    id="nombreLista"
                    value={nombreLista}
                    onChange={(e) => setNombreLista(e.target.value)}
                    placeholder={t('inventory.listNamePlaceholder')}
                  />
                </div>

                {/* Opciones */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incluirStock"
                      checked={incluirStock}
                      onCheckedChange={(checked) => setIncluirStock(checked as boolean)}
                    />
                    <Label htmlFor="incluirStock" className="cursor-pointer">
                      {t('inventory.includeStock')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incluirPrecios"
                      checked={incluirPrecios}
                      onCheckedChange={(checked) => setIncluirPrecios(checked as boolean)}
                    />
                    <Label htmlFor="incluirPrecios" className="cursor-pointer">
                      {t('inventory.includePrices')}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incluirKg"
                      checked={incluirKg}
                      onCheckedChange={(checked) => setIncluirKg(checked as boolean)}
                    />
                    <Label htmlFor="incluirKg" className="cursor-pointer">
                      {t('inventory.includeKg')}
                    </Label>
                  </div>
                </div>

                <Separator />

                {/* Selección de productos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">{t('inventory.products')}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleTodosProductos}
                      className="gap-2"
                    >
                      <CheckSquare className="h-4 w-4" />
                      {t('inventory.selectAllProducts')}
                    </Button>
                  </div>

                  <div className="text-sm text-[#666666]">
                    {totalSeleccionados} {t('inventory.selectedProducts')}
                  </div>

                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-2">
                      {todosLosProductos
                        .filter(p => p.stockActual > 0) // Solo mostrar productos con stock
                        .map(producto => {
                        const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
                        
                        return (
                          <div
                            key={producto.id}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#F4F4F4] cursor-pointer"
                            onClick={() => toggleProductoSeleccionado(producto.id)}
                          >
                            <Checkbox
                              checked={seleccionado?.seleccionado || false}
                              onCheckedChange={() => toggleProductoSeleccionado(producto.id)}
                            />
                            <div className="flex-1 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F4F4F4]">
                                <span className="text-lg emoji-icon">{obtenerIconoProducto(producto)}</span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{getInventoryProductName(producto)}</p>
                                <p className="text-xs text-[#666666]">
                                  {producto.codigo}
                                  {getReliableUnitWeight(producto) !== null && (
                                    <> • {getReliableUnitWeight(producto)} kg/{producto.unidad}</>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{producto.stockActual} {producto.unidad}</p>
                                <Badge className={`${getStockStatus(producto).color} text-white text-xs`}>
                                  {getStockStatus(producto).label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={cerrarCompartirDialog}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={generarLista}
                  className="bg-[#2d9561] hover:bg-[#267a4f] gap-2"
                  disabled={totalSeleccionados === 0 || !nombreLista.trim()}
                >
                  <FileText className="h-4 w-4" />
                  {t('inventory.generateList')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#1a4d7a]" />
                  Vista Previa: {listaGenerada?.nombre}
                </DialogTitle>
                <DialogDescription id="share-product-list-description">
                  {t('inventory.reviewListAndSelectOrganisms')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Resumen de la lista */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[#1a4d7a]">{productosEnLista.length}</p>
                        <p className="text-sm text-[#666666]">{t('inventory.products')}</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#2d9561]">
                          {listaGenerada?.incluirStock ? '✓' : '✗'}
                        </p>
                        <p className="text-sm text-[#666666]">{t('inventory.includeStock')}</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#e8a419]">
                          {listaGenerada?.incluirPrecios ? '✓' : '✗'}
                        </p>
                        <p className="text-sm text-[#666666]">{t('inventory.includePrices')}</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#9C27B0]">
                          {listaGenerada?.incluirKg ? '✓' : '✗'}
                        </p>
                        <p className="text-sm text-[#666666]">Incluir en Kg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Productos en la lista */}
                <div>
                  <Label className="text-base mb-3 block">{t('inventory.products')}</Label>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-2">
                      {productosEnLista.map(producto => (
                        <div key={producto.id} className="flex items-center gap-3 p-2 rounded-md bg-[#F4F4F4]">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
                            <span className="text-lg emoji-icon">{obtenerIconoProducto(producto)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{getInventoryProductName(producto)}</p>
                            <p className="text-xs text-[#666666]">
                              {producto.codigo} • {producto.unidad}
                              {getReliableUnitWeight(producto) !== null && (
                                <> • {getReliableUnitWeight(producto)} kg/{producto.unidad}</>
                              )}
                            </p>
                          </div>
                          {listaGenerada?.incluirStock && (
                            <p className="text-sm font-medium">{producto.stockActual} {producto.unidad}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Selección de organismos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">{t('inventory.selectOrganisms')}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleTodosOrganismos}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {organismosSeleccionados.length === organismosActivos.length
                        ? 'Deseleccionar todos'
                        : t('inventory.allOrganismsCount')}
                    </Button>
                  </div>

                  <div className="text-sm text-[#666666]">
                    {organismosSeleccionados.length} {t('inventory.organisms')} {t('common.selected')}
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-2">
                      {organismosActivos.map(organismo => (
                        <div
                          key={organismo.id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#F4F4F4] cursor-pointer"
                          onClick={() => toggleOrganismo(organismo.id)}
                        >
                          <Checkbox
                            checked={organismosSeleccionados.includes(organismo.id)}
                            onCheckedChange={() => toggleOrganismo(organismo.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{organismo.nombre}</p>
                            <p className="text-xs text-[#666666]">
                              {organismo.responsable} • {organismo.beneficiarios} beneficiarios
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setVistaPreviewLista(false)}>
                  <X className="h-4 w-4 mr-2" />
                  {t('common.back')}
                </Button>
                <Button
                  variant="outline"
                  onClick={descargarLista}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('inventory.downloadList')}
                </Button>
                <Button
                  onClick={compartirLista}
                  className="bg-[#2d9561] hover:bg-[#267a4f] gap-2"
                  disabled={organismosSeleccionados.length === 0}
                >
                  <Send className="h-4 w-4" />
                  {t('inventory.shareList')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Carrito Dialog */}
      {carritoOpen && (
        <DeferredPanel>
          <CarritoMejorado
            carrito={carrito}
            carritoOpen={carritoOpen}
            setCarritoOpen={setCarritoOpen}
            actualizarCantidad={actualizarCantidad}
            eliminarDelCarrito={eliminarDelCarrito}
            vaciarCarrito={vaciarCarrito}
            onComandaCreada={() => {
              toast.success(t('orders.orderCreatedSuccessfully'));
              setCarritoOpen(false);
            }}
            onDistribucionGrupoCreada={setUltimaDistribucionGrupoCreada}
            productos={todosLosProductos}
          />
        </DeferredPanel>
      )}

      {/* Historial Producto Dialog */}
      {productoSeleccionado && (
        <DeferredPanel>
          <HistorialProductoDialog
            open={historialProductoDialogOpen}
            onOpenChange={setHistorialProductoDialogOpen}
            productoId={productoSeleccionado.id}
            categoriasInfo={categoriasInfo}
          />
        </DeferredPanel>
      )}

      {/* Transformar Producto Dialog */}
      {productoSeleccionado && (
        <DeferredPanel>
          <TransformarProductoDialog
            open={transformarDialogOpen}
            onOpenChange={setTransformarDialogOpen}
            producto={productoSeleccionado}
            onTransformar={() => {
              toast.success(t('inventory.success.productTransformed'));
              setTransformarDialogOpen(false);
            }}
          />
        </DeferredPanel>
      )}

      {/* Conversión de Unidades Dialog */}
      {productoConversion && (
        <DeferredPanel>
          <ConversionUnidadesDialog
            open={conversionDialogOpen}
            onOpenChange={setConversionDialogOpen}
            producto={productoConversion}
            onConversion={handleConversionUnidades}
          />
        </DeferredPanel>
      )}
      
      {/* Formulario de Entrada */}
      {entradaDonAchatOpen && (
        <DeferredPanel>
          <EntradaDonAchat
            open={entradaDonAchatOpen}
            onOpenChange={setEntradaDonAchatOpen}
            hideTrigger
          />
        </DeferredPanel>
      )}

      {ajoutStockExistantOpen && (
      <Dialog open={ajoutStockExistantOpen} onOpenChange={handleAjoutStockExistantOpenChange}>
        <DialogContent className="w-[min(92vw,720px)] max-w-[720px] overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_36px_90px_-42px_rgba(15,23,42,0.55)]">
          <DialogHeader className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(45,149,97,0.08)_0%,rgba(26,77,122,0.06)_100%)] px-6 py-5 text-left">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Ajouter au stock existant</DialogTitle>
            <DialogDescription>
              Sélectionnez un produit déjà créé, indiquez la quantité à ajouter et enregistrez l’ajustement sans passer par le formulaire complet d’entrée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.3)]">
                <Label>Produit existant *</Label>
                <Select value={formAjoutStockExistant.productoId} onValueChange={handleProductoAjoutStockChange}>
                  <SelectTrigger className="mt-2 min-h-[54px] rounded-2xl border-slate-200 bg-slate-50/70">
                    <SelectValue placeholder="Sélectionner un produit..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[320px]">
                    {productosDisponiblesParaAjout.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        {producto.icono || '📦'} {producto.nombre} • {producto.categoria} • Stock: {formatQuantity(producto.stockActual)} {producto.unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-[24px] border border-emerald-200 bg-[linear-gradient(145deg,#ffffff_0%,#f4fbf7_100%)] p-4 shadow-[0_16px_34px_-30px_rgba(45,149,97,0.28)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Résumé rapide</p>
                <p className="mt-3 text-sm text-slate-500">Stock actuel</p>
                <p className="text-2xl font-bold text-slate-900">{productoAjoutStockSeleccionado ? formatQuantity(productoAjoutStockSeleccionado.stockActual) : '0'} <span className="text-sm font-medium text-slate-500">{productoAjoutStockSeleccionado?.unidad || ''}</span></p>
                <p className="mt-3 text-sm text-slate-500">Après ajout</p>
                <p className="text-lg font-semibold text-emerald-700">
                  {productoAjoutStockSeleccionado
                    ? `${formatQuantity(productoAjoutStockSeleccionado.stockActual + (Number.parseFloat(formAjoutStockExistant.cantidad) || 0))} ${productoAjoutStockSeleccionado.unidad}`
                    : 'Sélection requise'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                <Label>Quantité à ajouter *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formAjoutStockExistant.cantidad}
                  onChange={(event) => setFormAjoutStockExistant(prev => ({ ...prev, cantidad: event.target.value }))}
                  placeholder="0"
                  className="mt-2 rounded-2xl border-slate-200 bg-slate-50/70"
                />
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                <Label>Lot</Label>
                <Input
                  value={formAjoutStockExistant.lote}
                  onChange={(event) => setFormAjoutStockExistant(prev => ({ ...prev, lote: event.target.value }))}
                  placeholder="LOT-12345"
                  className="mt-2 rounded-2xl border-slate-200 bg-slate-50/70"
                />
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.35)]">
                <Label>Date d'expiration</Label>
                <Input
                  type="date"
                  value={formAjoutStockExistant.fechaCaducidad}
                  onChange={(event) => setFormAjoutStockExistant(prev => ({ ...prev, fechaCaducidad: event.target.value }))}
                  className="mt-2 rounded-2xl border-slate-200 bg-slate-50/70"
                />
              </div>
            </div>

            {productoAjoutStockSeleccionado && (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{productoAjoutStockSeleccionado.icono || '📦'} {productoAjoutStockSeleccionado.nombre}</p>
                <p className="mt-1">{productoAjoutStockSeleccionado.categoria} • {productoAjoutStockSeleccionado.subcategoria || 'Sans sous-catégorie'} • {productoAjoutStockSeleccionado.codigo}</p>
                <p className="mt-2 text-xs text-slate-500">Cette action ajoute du stock directement au produit existant et enregistre un mouvement d’inventaire séparé.</p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Button variant="outline" onClick={() => handleAjoutStockExistantOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleGuardarAjoutStockExistant}
              className="bg-[#2d9561] hover:bg-[#24794f]"
            >
              Ajouter au stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* Validación de Entradas - NUEVO */}
      {validacionEntradasOpen && (
        <DeferredPanel>
          <ValidacionEntradasDialog
            open={validacionEntradasOpen}
            onOpenChange={setValidacionEntradasOpen}
          />
        </DeferredPanel>
      )}

      {/* Exportación Avanzada - NUEVO */}
      {exportacionOpen && (
        <DeferredPanel>
          <ExportacionAvanzada
            open={exportacionOpen}
            onOpenChange={setExportacionOpen}
          />
        </DeferredPanel>
      )}

      {/* Diálogos de Conversión de Productos */}
      {conversionProductoDialogOpen && (
        <DeferredPanel>
          <ConversionDialog
            open={conversionProductoDialogOpen}
            onOpenChange={setConversionProductoDialogOpen}
            productos={todosLosProductos}
            plantillas={plantillasConversion}
            formConversion={formConversion}
            setFormConversion={setFormConversion}
            onConvertir={handleConvertirProducto}
            onAgregarDestino={agregarProductoDestino}
            onEliminarDestino={eliminarProductoDestino}
            onActualizarDestino={actualizarProductoDestino}
            onAplicarPlantilla={aplicarPlantilla}
          />
        </DeferredPanel>
      )}

      {historialConversionesOpen && (
        <DeferredPanel>
          <HistorialConversiones
            open={historialConversionesOpen}
            onOpenChange={setHistorialConversionesOpen}
            conversiones={conversionesRecientes}
            onRevertir={handleRevertirConversion}
          />
        </DeferredPanel>
      )}

      {plantillasConversionOpen && (
        <DeferredPanel>
          <PlantillasConversion
            open={plantillasConversionOpen}
            onOpenChange={setPlantillasConversionOpen}
            plantillas={plantillasConversion}
            onAplicar={aplicarPlantilla}
            onEliminar={(plantillaId) => {
              eliminarPlantillaConversion(plantillaId);
              const plantillasActualizadas = obtenerPlantillasConversion();
              setPlantillasConversion(plantillasActualizadas);
              toast.success(t('inventory.success.templateDeleted'));
            }}
          />
        </DeferredPanel>
      )}

      {/* Dialog Guía de Conversiones */}
      <Dialog open={guiaConversionesOpen} onOpenChange={setGuiaConversionesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="guia-conversiones-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <HelpCircle className="w-6 h-6 text-[#1a4d7a]" />
              Guide des Conversions de Produits
            </DialogTitle>
            <DialogDescription id="conversion-guide-description">
              Découvrez comment utiliser efficacement le système de conversion de produits
            </DialogDescription>
          </DialogHeader>
          {guiaConversionesOpen && (
            <DeferredPanel>
              <GuiaConversiones />
            </DeferredPanel>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Crear Variante de Producto */}
      <Dialog open={varianteDialogOpen} onOpenChange={setVarianteDialogOpen}>
        <DialogContent className="app-dialog-form-shell app-dialog-form-shell--compact" aria-describedby="crear-variante-description">
          <DialogHeader className="app-dialog-form-header">
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Copy className="h-5 w-5 text-[#1a4d7a]" />
              Créer une variante de produit
            </DialogTitle>
            <DialogDescription id="product-variant-description">
              Créez une variante basée sur : {productoBase?.nombre}
            </DialogDescription>
          </DialogHeader>

          {productoBase && (
            <div className="app-dialog-form-body space-y-4">
              {/* Producto Base Info */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                    <span className="text-2xl emoji-icon">{obtenerIconoProducto(productoBase)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {productoBase.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {productoBase.codigo}
                      </Badge>
                      <Badge className="text-xs bg-[#1a4d7a] text-white border-[#1a4d7a]">
                        📂 {getInventorySubcategoriaLabel(productoBase)}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-[#2d9561] text-white border-[#2d9561]">
                        📏 {productoBase.unidad}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-[#1a4d7a] font-medium">
                    ℹ️ La variante se creara automatiquement dans : <span className="font-bold">{getInventorySubcategoriaLabel(productoBase)}</span>
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4 pt-2">
                {/* Código */}
                <div className="space-y-2">
                  <Label htmlFor="varianteCodigo" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                    Código *
                  </Label>
                  <Input
                    id="varianteCodigo"
                    value={formVariante.codigo}
                    onChange={(e) => setFormVariante({ ...formVariante, codigo: e.target.value })}
                    placeholder="Ex. : PROD-VAR-001"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="varianteNombre" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                    Nombre *
                  </Label>
                  <Input
                    id="varianteNombre"
                    value={formVariante.nombre}
                    onChange={(e) => setFormVariante({ ...formVariante, nombre: e.target.value })}
                    placeholder="Ex. : pommes vertes (variante)"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Unidad */}
                <div className="space-y-2">
                  <Label htmlFor="varianteUnidad" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                    {t('inventory.unit')}
                  </Label>
                  <Input
                    id="varianteUnidad"
                    value={formVariante.unidad}
                    onChange={(e) => setFormVariante({ ...formVariante, unidad: e.target.value })}
                    placeholder="kg"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Stock Mínimo */}
                <div className="space-y-2">
                  <Label htmlFor="varianteStockMinimo" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                    Stock Mínimo
                  </Label>
                  <Input
                    id="varianteStockMinimo"
                    type="number"
                    value={formVariante.stockMinimo}
                    onChange={(e) => setFormVariante({ ...formVariante, stockMinimo: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Peso Unitario */}
                <div className="space-y-2">
                  <Label htmlFor="variantePesoUnitario" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                    Peso Unitario (kg) *
                  </Label>
                  <div className="relative">
                    <Input
                      id="variantePesoUnitario"
                      type="number"
                      step="1"
                      value={formVariante.pesoUnitario}
                      onChange={(e) => setFormVariante({ ...formVariante, pesoUnitario: Math.round(parseFloat(e.target.value) || 0) })}
                      placeholder="0"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                      className={formVariante.pesoUnitario !== productoBase?.pesoUnitario ? 'border-[#e8a419] border-2' : ''}
                    />
                    {productoBase && formVariante.pesoUnitario !== productoBase.pesoUnitario && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Badge className="bg-[#e8a419] text-white text-xs">
                          Modificado
                        </Badge>
                      </div>
                    )}
                  </div>
                  {productoBase && productoBase.pesoUnitario > 0 && (
                    <p className="text-xs text-[#666666]">
                      Peso original: <span className="font-medium text-[#1a4d7a]">{productoBase.pesoUnitario} kg</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="app-dialog-form-footer">
            <Button 
              variant="outline" 
              onClick={cerrarVarianteDialog}
            >
              Annuler
            </Button>
            <Button
              onClick={guardarVariante}
              disabled={!formVariante.codigo || !formVariante.nombre}
              className="bg-[#1a4d7a] hover:bg-[#153d61] disabled:bg-gray-300"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Créer la variante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        ref={floatingButtonsRef}
        onMouseDown={handleFloatingButtonsMouseDown}
        onTouchStart={handleFloatingButtonsTouchStart}
        className={`app-floating-inventory-actions fixed z-[60] flex flex-col items-end gap-3 ${floatingButtonsDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          bottom: 'auto',
          right: floatingButtonsPosition.x === 0 ? 'max(env(safe-area-inset-right), 1rem)' : 'auto',
          top: floatingButtonsPosition.y === 0 ? '50%' : `${floatingButtonsPosition.y}px`,
          left: floatingButtonsPosition.x !== 0 ? `${floatingButtonsPosition.x}px` : 'auto',
          transform: floatingButtonsPosition.y === 0 ? 'translateY(-50%)' : 'none',
          transition: floatingButtonsDragging ? 'none' : 'all 0.3s ease',
          userSelect: 'none',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
        <Button
          size="icon"
          onClick={() => {
            if (floatingButtonsDragDistance < floatingButtonsDragThreshold) {
              abrirEntradaInventario();
            }
          }}
          disabled={entradaDonAchatOpen}
          className="h-12 w-12 rounded-full text-white transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #1a4d7a 0%, #153d61 100%)',
            boxShadow: '0 10px 25px rgba(26, 77, 122, 0.35)'
          }}
          title={newEntryLabel}
          aria-label={newEntryLabel}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          onClick={() => {
            if (floatingButtonsDragDistance < floatingButtonsDragThreshold) {
              openInventoryScanner();
            }
          }}
          disabled={escanerQROpen}
          className="h-12 w-12 rounded-full text-white transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            boxShadow: '0 10px 25px rgba(156, 39, 176, 0.35)'
          }}
          title={t('inventory.scanQrTitle')}
          aria-label={t('inventory.scanQrTitle')}
        >
          <QrCode className="h-5 w-5" />
        </Button>
      </div>

      {/* Escáner QR para Inventario */}
      {escanerQROpen && (
        <DeferredPanel>
          <EscanerQRInventario
            autoStartCamera
            defaultProductAction={scannerDefaultProductAction}
            onScanSuccess={handleScanQR}
            onClose={closeInventoryScanner}
            knownLocationCodes={ubicacionesEscaneables}
            pendingLocationAction={ubicacionEscaneadaPendiente}
          />
        </DeferredPanel>
      )}

      {/* Diálogo de Localización/Deslocalización */}
      <Dialog open={dialogLocalizacionOpen} onOpenChange={setDialogLocalizacionOpen}>
        <DialogContent className="max-w-md" aria-describedby="location-management-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1a4d7a]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              <MapPin className="h-5 w-5" />
              Gestion d'Emplacement
            </DialogTitle>
            <DialogDescription id="location-management-description">
              Gérer l'emplacement du produit scanné
            </DialogDescription>
          </DialogHeader>

          {productoEscaneado && (
            <div className="space-y-4">
              {/* Información del Producto */}
              <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-[#1a4d7a]">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border-2 border-[#1a4d7a]">
                      <span className="text-2xl">{obtenerIconoProducto(productoEscaneado)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {productoEscaneado.nombre}
                      </p>
                      <p className="text-sm text-[#666666]">
                        Code: <span className="font-mono text-[#1a4d7a]">{productoEscaneado.codigo}</span>
                      </p>
                      {productoEscaneado.ubicacion && (
                        <p className="text-sm text-[#2d9561] flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          Emplacement actuel: <span className="font-medium">{productoEscaneado.ubicacion}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opciones de Ubicación Rápida */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Zones et emplacements du module Étiquettes
                </Label>
                <ScrollArea className="h-72 rounded-md border border-[#d8e1ea] bg-[#fafcfe] p-3">
                  <div className="space-y-4">
                    {seccionesUbicacionDisponibles.map((seccion) => (
                      <div key={seccion.codigoZona} className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold text-[#1a4d7a]">
                            {seccion.codigoZona === 'AUTRES' ? 'Autres emplacements' : `Zona ${seccion.codigoZona}`}
                          </p>
                          <p className="text-xs text-[#666666]">{seccion.tipoZona}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {seccion.ubicaciones.map((ubicacion) => (
                            <Button
                              key={`${seccion.codigoZona}-${ubicacion}`}
                              variant="outline"
                              onClick={() => handleLocalizarProducto(ubicacion)}
                              className="justify-start gap-2 hover:bg-blue-50 hover:border-[#1a4d7a]"
                            >
                              <MapPin className="h-4 w-4 text-[#1a4d7a]" />
                              <span className="text-sm">{ubicacion}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {ubicacionesEscaneables.length === 0 && (
                  <p className="text-sm text-[#666666]">
                    Aucune zone enregistrée. Créez d'abord des emplacements dans le module Étiquettes.
                  </p>
                )}
              </div>

              {/* Búsqueda de ubicación estándar */}
              <div className="space-y-2">
                <Label htmlFor="ubicacion-custom" className="text-sm font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Recherche rapide d'un emplacement standard
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="ubicacion-custom"
                    placeholder="Ex: A1, A11, B3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleLocalizarProducto(e.currentTarget.value.trim());
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      const input = document.getElementById('ubicacion-custom') as HTMLInputElement;
                      if (input?.value.trim()) {
                        handleLocalizarProducto(input.value.trim());
                      }
                    }}
                    className="bg-[#1a4d7a] hover:bg-[#153d61]"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Botón de Deslocalización */}
              {productoEscaneado.ubicacion && (
                <Button
                  variant="outline"
                  onClick={handleDeslocalizarProducto}
                  className="w-full gap-2 border-[#c23934] text-[#c23934] hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Délocaliser le Produit
                </Button>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogLocalizacionOpen(false);
                setProductoEscaneado(null);
              }}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={quickCartQuantityDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            cerrarQuickCartQuantityDialog();
          }
        }}
      >
        <DialogContent className="max-w-md" aria-describedby="quick-cart-quantity-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1a4d7a]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier
            </DialogTitle>
            <DialogDescription id="quick-cart-quantity-description">
              Choisissez la quantité à ajouter pour le produit scanné.
            </DialogDescription>
          </DialogHeader>

          {quickCartProduct && (
            <div className="space-y-4">
              <Card className="border-[#1a4d7a]/20 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-[#1a4d7a] bg-white">
                      <span className="text-2xl">{obtenerIconoProducto(quickCartProduct)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1a4d7a] truncate">{getInventoryProductName(quickCartProduct)}</p>
                      <p className="text-sm text-[#666666]">Code: {quickCartProduct.codigo}</p>
                      <p className={`text-sm ${quickCartQuantityExceedsAvailable ? 'font-semibold text-[#c23934]' : 'text-[#666666]'}`}>
                        Disponible: {formatQuantity(quickCartAvailableQuantity)} {quickCartProduct.unidad}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="quick-cart-quantity">Quantité</Label>
                <Input
                  id="quick-cart-quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Entrez la quantité"
                  value={quickCartQuantity}
                  onChange={(event) => setQuickCartQuantity(event.target.value)}
                  className={quickCartQuantityExceedsAvailable ? 'border-[#c23934] text-[#c23934] focus-visible:ring-[#c23934]/30' : ''}
                  aria-invalid={quickCartQuantityExceedsAvailable}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      confirmarQuickCartQuantity();
                    }
                  }}
                  autoFocus
                />
                {quickCartQuantityExceedsAvailable && (
                  <p className="text-sm font-medium text-[#c23934]">
                    La quantité saisie dépasse le stock disponible.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={cerrarQuickCartQuantityDialog}>
              Annuler
            </Button>
            <Button onClick={confirmarQuickCartQuantity} disabled={quickCartConfirmDisabled} className="bg-[#1a4d7a] hover:bg-[#153d61] disabled:bg-[#cbd5e1] disabled:text-[#64748b]">
              {quickCartContinuesScanning ? 'Ajouter et continuer' : 'Ajouter au panier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}