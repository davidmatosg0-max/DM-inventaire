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
import { obtenerProductos, guardarProducto, actualizarProducto } from '../../utils/productStorage';
import { mockProductos, mockOrganismos } from '../../data/mockData';
import { calcularValorMonetario, obtenerCategorias, actualizarPesoUnitarioSubcategoria, actualizarPesoUnitarioVariante } from '../../utils/categoriaStorage';
import { registrarActividad } from '../../utils/actividadLogger';
import { obtenerResumenReservasInventario } from '../../utils/inventoryReservations';
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
import { 
  migrarValoresMonetariosDesdeEntradas,
  recalcularValoresTotales,
  obtenerEstadisticasValoresMonetarios
} from '../../utils/migrarValoresMonetarios';
import { normalizeScannedLocationQR, normalizeScannedProductQR } from '../../utils/barcode';
import { normalizeScannedComandaQR } from '../../utils/comandaQr';
import { printStandardLabel, type ProductLabelData } from '../etiquetas/StandardProductLabel';
import {
  clearPendingQrNavigation,
  navigateToQrPage,
  readPendingQrNavigation,
  savePendingQrNavigation,
} from '../../utils/pendingQrNavigation';

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

const DEFAULT_LOCATION_ZONES = [
  { zona: 'A', cantidad: 10 },
  { zona: 'B', cantidad: 10 },
  { zona: 'C', cantidad: 5 },
  { zona: 'D', cantidad: 8 },
  { zona: 'E', cantidad: 4 },
];

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
const ReportsModule = lazyNamed(() => import('../reports/ReportsModule'), 'ReportsModule');
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

export function Inventario() {
  const { t, i18n } = useTranslation();
  const branding = useBranding();
  const translatedNewEntry = t('newEntry');
  const newEntryLabel = translatedNewEntry !== 'newEntry'
    ? translatedNewEntry
    : i18n.resolvedLanguage?.startsWith('es')
      ? 'Nueva entrada'
      : i18n.resolvedLanguage?.startsWith('en')
        ? 'New entry'
        : i18n.resolvedLanguage?.startsWith('ar')
          ? 'إدخال جديد'
          : 'Nouvelle entrée';
  const [activeTab, setActiveTab] = useState('productos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLote, setSearchLote] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [vistaMode, setVistaMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [carritoOpen, setCarritoOpen] = useState(false);
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
  
  // Estado para escáner QR
  const [escanerQROpen, setEscanerQROpen] = useState(false);
  const [productoEscaneado, setProductoEscaneado] = useState<ProductoCreado | null>(null);
  const [dialogLocalizacionOpen, setDialogLocalizacionOpen] = useState(false);
  const [ubicacionEscaneadaPendiente, setUbicacionEscaneadaPendiente] = useState<UbicacionEscaneadaPendiente | null>(null);
  
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

  const organismosActivos = mockOrganismos.filter(o => o.activo);

  const ubicacionesEscaneables = React.useMemo(() => {
    let zonas = DEFAULT_LOCATION_ZONES;

    try {
      const zonasGuardadas = localStorage.getItem('zonasAlmacen');
      if (zonasGuardadas) {
        const parsed = JSON.parse(zonasGuardadas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const zonasValidas = parsed
            .filter(
              (item): item is { zona: string; cantidad: number } =>
                Boolean(item) && typeof item.zona === 'string' && typeof item.cantidad === 'number'
            )
            .map(item => ({ zona: item.zona.trim().toUpperCase(), cantidad: item.cantidad }));

          if (zonasValidas.length > 0) {
            zonas = zonasValidas;
          }
        }
      }
    } catch (error) {
      console.error('Erreur lecture zones entrepôt:', error);
    }

    const ubicacionesGeneradas = zonas.flatMap(({ zona, cantidad }) =>
      Array.from({ length: Math.max(0, cantidad) }, (_, index) => `${zona}${index + 1}`)
    );

    const ubicacionesActuales = todosLosProductos
      .map(producto => producto.ubicacion)
      .filter((ubicacion): ubicacion is string => typeof ubicacion === 'string' && ubicacion.trim() !== '')
      .map(ubicacion => ubicacion.trim());

    return Array.from(new Set([...ubicacionesGeneradas, ...ubicacionesActuales]));
  }, [todosLosProductos, refreshKey]);

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
    setDialogLocalizacionOpen(true);
  };

  const focusProductFromQr = (producto: ProductoCreado) => {
    setEscanerQROpen(false);
    setActiveTab('productos');
    setSelectedCategories([]);
    setShowFilters(false);
    setSearchTerm(getInventoryProductName(producto));
    setSearchLote(producto.lote || '');
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
        agregarAlCarrito(producto.id, 1);
        setCarritoOpen(true);
        return;
      case 'ver_historial':
        setEscanerQROpen(false);
        abrirHistorialProducto(producto);
        return;
      case 'ver_ubicacion':
        openScannedProduct(producto);
        return;
      case 'imprimir_etiqueta':
        setEscanerQROpen(false);
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
        agregarAlCarrito(producto.id, 1);
        setCarritoOpen(true);
        toast.info('Produit ajouté au panier. Créez ensuite une offre depuis le panier');
        return;
      case 'enviar_departamento':
        setEscanerQROpen(false);
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
    const pendingNavigation = readPendingQrNavigation();

    if (!pendingNavigation || pendingNavigation.targetPage !== 'inventario' || pendingNavigation.qrType !== 'producto') {
      return;
    }

    clearPendingQrNavigation();

    const producto = findProductoByScannedData(pendingNavigation.rawData);

    if (!producto) {
      toast.error('Produit non trouvé');
      return;
    }

    handleScannedProductAction(producto, pendingNavigation.action);
  }, [todosLosProductos]);

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
    const percentage = (producto.stockActual / producto.stockMinimo) * 100;
    if (percentage <= 100) return { label: t('inventory.low'), color: 'bg-[#c23934]', value: 'bajo' };
    if (percentage <= 150) return { label: t('inventory.medium'), color: 'bg-[#e8a419]', value: 'medio' };
    return { label: t('inventory.optimal'), color: 'bg-[#2d9561]', value: 'optimo' };
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
  };

  const productosFiltrados = todosLosProductos
    .filter(p => {
      const matchSearch = filterByThreeLettersMultiple(
        [p.nombre, p.codigo],
        searchTerm
      );

      const matchLote = !searchLote || (p.lote && p.lote.toLowerCase().includes(searchLote.toLowerCase()));

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(getInventorySubcategoriaLabel(p));

      // Solo mostrar productos con stock mayor a cero
      const tieneStock = p.stockActual > 0;

      return matchSearch && matchLote && matchCategory && tieneStock;
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

    toast.success(`${getInventoryProductName(producto)} localisé à: ${ubicacion}`);
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
      setEscanerQROpen(false);
      toast.info('Action d\'emplacement annulée');
      return;
    }

    const producto = findProductoByScannedData(data);

    if (ubicacionEscaneadaPendiente) {
      if (!producto) {
        toast.error('Scannez un produit valide pour terminer cette action');
        setEscanerQROpen(false);
        return;
      }

      const accionAplicada = ubicacionEscaneadaPendiente.action === 'delocalizar_productos'
        ? deslocalizarProductoEscaneado(producto, ubicacionEscaneadaPendiente.ubicacion)
        : localizarProductoEscaneado(producto, ubicacionEscaneadaPendiente.ubicacion);

      setUbicacionEscaneadaPendiente(null);

      if (accionAplicada) {
        setEscanerQROpen(false);
      }

      return;
    }

    if (producto) {
      handleScannedProductAction(producto, action);
      return;
    }

    const ubicacion = findUbicacionByScannedData(data);

    if (ubicacion && (action === 'localizar_productos' || action === 'delocalizar_productos')) {
      setUbicacionEscaneadaPendiente({ ubicacion, action });
      setEscanerQROpen(false);
      toast.info(
        action === 'delocalizar_productos'
          ? `Emplacement ${ubicacion} détecté. Scannez maintenant le produit à délocaliser.`
          : `Emplacement ${ubicacion} détecté. Scannez maintenant le produit à localiser.`
      );
      window.setTimeout(() => setEscanerQROpen(true), 50);
      return;
    }

    const comandaData = normalizeScannedComandaQR(data);

    if (comandaData?.comanda) {
      setEscanerQROpen(false);
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

    const actualizado = localizarProductoEscaneado(productoEscaneado, ubicacion);

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
        `Stock du produit "${productoOrigen.nombre}" ajusté: ${nuevoStock} ${productoOrigen.unidad}`,
        { productoId, stockAnterior: productoOrigen.stockActual, stockNuevo: nuevoStock }
      );
      
      // 2. Calcular el peso total que se está convirtiendo
      // 🎯 FÓRMULA DIRECTA: Peso Unitario Origen ÷ Factor de Conversión = Peso Unitario Destino
      const factorConversion = cantidadDestino / cantidadOrigen;
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
          stockMinimo: Math.ceil(productoOrigen.stockMinimo * (cantidadDestino / cantidadOrigen)),
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
    
    guardarProducto(nuevaSubcategoria);
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

  return (
    <div className="relative h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] flex flex-col overflow-hidden -my-3 sm:-my-4 lg:-my-6 -mx-3 sm:-mx-4 lg:-mx-6">
      {/* Fondo degradado fijo con glassmorphism */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 50%, ${branding.primaryColor}08 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: `radial-gradient(circle, ${branding.secondaryColor} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${branding.primaryColor} 0%, transparent 70%)`,
            animationDelay: '1s'
          }}
        />
      </div>

      <Card className="border-none shadow-none flex-1 flex flex-col overflow-hidden rounded-none w-full relative z-10">
        <CardHeader className="border-b backdrop-blur-xl bg-white/90 flex-shrink-0 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
              >
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: branding.primaryColor }}>
                    {t('inventory.title')}
                  </CardTitle>
                  <Sparkles className="w-5 h-5 animate-pulse" style={{ color: branding.secondaryColor }} />
                </div>
                <CardDescription className="text-[#666666] text-sm mt-0.5">
                  {t('inventory.subtitle')}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 flex-1 flex flex-col overflow-hidden space-y-3">
          {/* Stats Cards */}
          <div className="grid gap-3 md:grid-cols-4 flex-shrink-0">
            <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('inventory.totalProducts')}</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>{todosLosProductos.length}</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
                >
                  <Package className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: branding.secondaryColor }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Sous-catégories</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>{subcategoriasInventario.length}</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
                >
                  <Grid3x3 className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4 border-l-[#e8a419]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('inventory.totalStock')}</p>
                  <p className="text-2xl font-bold text-[#e8a419]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {todosLosProductos.reduce((sum, p) => sum + p.stockActual, 0)}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #e8a419 0%, #d19316 100%)' }}
                >
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4 border-l-[#c23934]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('inventory.inCart')}</p>
                  <p className="text-2xl font-bold text-[#c23934]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{calcularTotalItems()}</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #c23934 0%, #a82f2a 100%)' }}
                >
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-7 flex-shrink-0">
          <TabsTrigger value="productos">{t('inventory.products')}</TabsTrigger>
          <TabsTrigger value="movimientos">{t('inventory.movements')}</TabsTrigger>
          <TabsTrigger value="conversions">🔄 {t('inventory.conversionsTab')}</TabsTrigger>
          <TabsTrigger value="entradas">{t('inventory.entryHistory')}</TabsTrigger>
          <TabsTrigger value="rapports">📊 Rapports</TabsTrigger>
          <TabsTrigger value="validacion">✅ {t('inventory.validationTab')}</TabsTrigger>
          <TabsTrigger value="prediccion">🔮 {t('inventory.predictionTab')}</TabsTrigger>
        </TabsList>

        {/* Productos Tab */}
        <TabsContent value="productos" className="flex-1 flex flex-col overflow-hidden space-y-3 mt-3">
          {/* Toolbar */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between flex-shrink-0">
            <div className="flex-1 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                <Input
                  placeholder={t('inventory.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative flex-1 max-w-xs">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                <Input
                  placeholder={t('inventory.searchByLotNumber')}
                  value={searchLote}
                  onChange={(e) => setSearchLote(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {t('common.filter')}
              </Button>

              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setVistaMode(vistaMode === 'grid' ? 'list' : 'grid')}
                title={vistaMode === 'grid' ? t('inventory.viewList') : t('inventory.viewGrid')}
              >
                {vistaMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>

              <Button
                size="icon"
                onClick={() => setCompartirDialogOpen(true)}
                className="bg-[#2d9561] hover:bg-[#267a4f]"
                title={t('inventory.shareProductList')}
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                onClick={() => setExportacionOpen(true)}
                variant="outline"
                className="border-[#1a4d7a] text-[#1a4d7a] hover:bg-blue-50"
                title={t('common.export')}
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                onClick={() => setEscanerQROpen(true)}
                variant="outline"
                className="border-[#9C27B0] text-[#9C27B0] hover:bg-purple-50"
                title={t('inventory.scanQrTitle')}
              >
                <QrCode className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                onClick={() => setCarritoOpen(true)}
                variant="outline"
                className="relative"
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
            <Card>
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
          {(searchLote || selectedCategories.length > 0) && (
            <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
              <span className="text-sm text-[#666666]">{t('inventory.activeFilters')}</span>
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

          {/* Products List */}
          {vistaMode === 'list' ? (
            <Card className="shadow-lg border-[#E0E0E0] flex-1 flex flex-col overflow-hidden">
              <CardContent className="pt-4 px-4 pb-4 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto border-2 border-[#E0E0E0] rounded-xl shadow-sm">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] z-10 border-b-2 border-[#1a4d7a]">
                      <TableRow className="h-8">
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.photo')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.code')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.productName')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>📦 {t('inventory.lotNumberShort')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('common.unit')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('common.unitWeight')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.currentStock')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.minimumStock')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>💰 Valor Total</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.location')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('common.status')}</TableHead>
                        <TableHead className="font-semibold text-[#333333] text-xs py-1 px-2 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('inventory.actions')}</TableHead>
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
                            <TableCell className="py-1 px-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-[#F4F4F4] to-[#E8E8E8] border border-[#E0E0E0]">
                                <span className="text-lg emoji-icon">{obtenerIconoProducto(producto)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <span className="font-mono text-[10px] font-semibold text-[#1a4d7a] bg-blue-50 px-1.5 py-0.5 rounded">
                                {producto.codigo}
                              </span>
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <div className="flex flex-col">
                                <span className="font-semibold text-[#333333] text-xs leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {getInventoryProductName(producto)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              {producto.lote ? (
                                <Badge 
                                  variant="outline" 
                                  className="bg-blue-50 text-[#1a4d7a] border-[#1a4d7a] font-mono text-[10px] px-1.5 py-0"
                                >
                                  📦 {producto.lote}
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-[#999999] italic">-</span>
                              )}
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <Badge 
                                variant="secondary" 
                                className="font-medium bg-[#F4F4F4] text-[#333333] border border-[#E0E0E0] text-[10px] px-1.5 py-0"
                              >
                                {producto.unidad}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              {(producto.pesoUnitario && producto.pesoUnitario > 0) ? (
                                <span className="font-bold text-[#1a4d7a] text-xs">
                                  {Math.round(producto.pesoUnitario)} <span className="text-[10px]">kg</span>
                                </span>
                              ) : (producto.peso && producto.peso > 0 && producto.stockActual > 0) ? (
                                <span className="font-bold text-[#1a4d7a] text-xs">
                                  {Math.round(producto.peso / producto.stockActual)} <span className="text-[10px]">kg</span>
                                </span>
                              ) : (producto.peso && producto.peso > 0) ? (
                                <span className="font-bold text-[#1a4d7a] text-xs">
                                  {Math.round(producto.peso)} <span className="text-[10px]">kg</span>
                                </span>
                              ) : (
                                <span className="text-[#999999] text-[10px] italic">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <div className="flex flex-col leading-tight">
                                <span className="text-sm font-bold text-[#333333]">{reserva.disponibleParaReservar}</span>
                                <span className="text-[10px] text-[#666666]">Reservado: {reserva.totalReservado}</span>
                                <span className="text-[10px] text-[#999999]">Físico: {producto.stockActual}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <span className="text-xs font-medium text-[#666666]">
                                {producto.stockMinimo}
                              </span>
                            </TableCell>
                            <TableCell className="py-1 px-2">
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
                            <TableCell className="py-1 px-2">
                              {producto.ubicacion ? (
                                <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded border border-[#2d9561]">
                                  <MapPin className="h-3 w-3 text-[#2d9561]" />
                                  <span className="text-[10px] font-medium text-[#333333]">{producto.ubicacion}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                  <MapPin className="h-3 w-3 text-[#999999]" />
                                  <span className="text-[10px] italic text-[#999999]">Non localisé</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <Badge 
                                className={`${stockStatus.color} text-white font-medium text-[10px] px-2 py-0`}
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >
                                {stockStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-1 px-2">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setProductoEscaneado(producto);
                                    setDialogLocalizacionOpen(true);
                                  }}
                                  title="Localiser le produit"
                                  className="hover:bg-green-50 hover:border-[#2d9561] transition-all h-7 w-7 p-0"
                                >
                                  <MapPin className="h-3 w-3 text-[#2d9561]" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirConversionUnidades(producto)}
                                  title={t('inventory.convertUnits')}
                                  className="hover:bg-blue-50 hover:border-[#1a4d7a] transition-all h-7 w-7 p-0"
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
                                  className="hover:bg-purple-50 hover:border-[#9C27B0] transition-all h-7 w-7 p-0"
                                >
                                  <History className="h-3 w-3 text-[#9C27B0]" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => agregarAlCarrito(producto.id, 1)}
                                  className={`transition-all h-7 w-7 p-0 ${
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
                  <div className="py-16 text-center bg-gradient-to-b from-white to-[#F8F9FA]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-[#1a4d7a]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {t('common.noResults')}
                        </p>
                        <p className="text-sm text-[#666666]">
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
            <div className="max-h-[600px] overflow-y-auto border rounded-lg p-3 bg-white">
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
                            {((producto.pesoUnitario && producto.pesoUnitario > 0) || (producto.peso && producto.peso > 0)) && (
                              <Badge variant="outline" className="bg-white text-[#1a4d7a] border-[#1a4d7a] text-[10px] px-1.5 py-0">
                                ⚖️ {((producto.pesoUnitario && producto.pesoUnitario > 0)
                                  ? Math.round(producto.pesoUnitario)
                                  : (producto.peso && producto.stockActual > 0)
                                    ? Math.round(producto.peso / producto.stockActual)
                                    : Math.round(producto.peso))} kg/{producto.unidad}
                              </Badge>
                            )}
                            <Badge className={`${stockStatus.color} text-white text-[10px] px-1.5 py-0`}>
                              {stockStatus.label}
                            </Badge>
                            {producto.ubicacion ? (
                              <Badge className="bg-green-50 text-[#2d9561] border border-[#2d9561] text-[10px] px-1.5 py-0 max-w-full">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">{producto.ubicacion}</span>
                              </Badge>
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
        <TabsContent value="movimientos" className="flex-1 flex flex-col overflow-hidden mt-3">
          {activeTab === 'movimientos' && (
            <DeferredPanel>
              <MovimientosInventario productos={todosLosProductos} />
            </DeferredPanel>
          )}
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="flex-1 flex flex-col overflow-hidden space-y-3 mt-3">
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
                                  `${d.cantidad.toFixed(2)} ${d.unidad} de "${d.productoNombre}"`
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
        <TabsContent value="entradas" className="flex-1 flex flex-col overflow-hidden space-y-3 mt-3">
          <div className="flex items-center">
            <div>
              <h2 className="text-xl font-bold text-[#333333]">{t('inventory.entryHistory')}</h2>
              <p className="text-sm text-[#666666]">Historial completo de entradas Don/Achat</p>
            </div>
          </div>

          {activeTab === 'entradas' && (
            <DeferredPanel>
              <HistorialEntradasCompacto onAgregarAlCarrito={agregarEntradaAlCarrito} />
            </DeferredPanel>
          )}
        </TabsContent>

        {/* Rapports Tab */}
        <TabsContent value="rapports" className="flex-1 flex flex-col overflow-hidden space-y-3 mt-3">
          {activeTab === 'rapports' && (
            <DeferredPanel>
              <ReportsModule />
            </DeferredPanel>
          )}
        </TabsContent>

        {/* Validación Tab - NUEVO */}
        <TabsContent value="validacion" className="flex-1 flex flex-col overflow-hidden space-y-3 mt-3">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#333333]">Validación de Entradas</h2>
              <p className="text-sm text-[#666666]">Revisa y valida las entradas recientes de inventario</p>
            </div>
            <Button
              size="icon"
              onClick={() => setValidacionEntradasOpen(true)}
              className="bg-[#2d9561] hover:bg-[#267a4f]"
              title="Abrir Panel de Validación"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="py-12 text-center">
                <CheckSquare className="mx-auto h-16 w-16 text-[#2d9561] mb-4" />
                <h3 className="text-lg font-semibold text-[#333333] mb-2">
                  Sistema de Validación de Entradas
                </h3>
                <p className="text-[#666666] mb-4 max-w-2xl mx-auto">
                  Valida las entradas recibidas en los últimos 7 días. Detecta automáticamente alertas de 
                  caducidad próxima, stock alto y otros eventos que requieren revisión manual.
                </p>
                <Button
                  onClick={() => setValidacionEntradasOpen(true)}
                  className="bg-[#2d9561] hover:bg-[#267a4f]"
                  size="lg"
                >
                  <CheckSquare className="h-5 w-5 mr-2" />
                  Iniciar Validación
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predicción Tab - NUEVO */}
        <TabsContent value="prediccion" className="flex-1 flex flex-col overflow-hidden space-y-3 mt-3">
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
                                  {(producto.pesoUnitario && producto.pesoUnitario > 0) ? (
                                    <> • {Math.round(producto.pesoUnitario)} kg/{producto.unidad}</>
                                  ) : (producto.peso && producto.peso > 0 && producto.stockActual > 0) && (
                                    <> • {Math.round(producto.peso / producto.stockActual)} kg/{producto.unidad}</>
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
                              {(producto.pesoUnitario && producto.pesoUnitario > 0) ? (
                                <> • {Math.round(producto.pesoUnitario)} kg/{producto.unidad}</>
                              ) : (producto.peso && producto.peso > 0 && producto.stockActual > 0) && (
                                <> • {Math.round(producto.peso / producto.stockActual)} kg/{producto.unidad}</>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="crear-variante-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Copy className="h-5 w-5 text-[#1a4d7a]" />
              Crear Variante de Producto
            </DialogTitle>
            <DialogDescription id="product-variant-description">
              Crea una variante basada en: {productoBase?.nombre}
            </DialogDescription>
          </DialogHeader>

          {productoBase && (
            <div className="space-y-4">
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
                    placeholder="Ej: PROD-VAR-001"
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
                    placeholder="Ej: Manzanas Verdes (Variante)"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>

                {/* Unidad */}
                <div className="space-y-2">
                  <Label htmlFor="varianteUnidad" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                    Unidad de Medida
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
                      step="0.001"
                      value={formVariante.pesoUnitario}
                      onChange={(e) => setFormVariante({ ...formVariante, pesoUnitario: parseFloat(e.target.value) || 0 })}
                      placeholder="0.000"
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

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={cerrarVarianteDialog}
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarVariante}
              disabled={!formVariante.codigo || !formVariante.nombre}
              className="bg-[#1a4d7a] hover:bg-[#153d61] disabled:bg-gray-300"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Crear Variante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!entradaDonAchatOpen && (
        <Button
          size="icon"
          onClick={() => setEntradaDonAchatOpen(true)}
          className="fixed bottom-20 right-6 z-30 h-12 w-12 rounded-full text-white transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #1a4d7a 0%, #153d61 100%)',
            boxShadow: '0 10px 25px rgba(26, 77, 122, 0.35)'
          }}
          title={newEntryLabel}
          aria-label={newEntryLabel}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      {!escanerQROpen && (
        <Button
          size="icon"
          onClick={() => setEscanerQROpen(true)}
          className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full text-white transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            boxShadow: '0 10px 25px rgba(156, 39, 176, 0.35)'
          }}
          title={t('inventory.scanQrTitle')}
          aria-label={t('inventory.scanQrTitle')}
        >
          <QrCode className="h-5 w-5" />
        </Button>
      )}

      {/* Escáner QR para Inventario */}
      {escanerQROpen && (
        <DeferredPanel>
          <EscanerQRInventario
            autoStartCamera
            onScanSuccess={handleScanQR}
            onClose={() => setEscanerQROpen(false)}
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
                  Emplacements Rapides
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Entrepôt A', 'Entrepôt B', 'Zone Froide', 'Zone Sèche', 'Réception', 'Expédition'].map((ubicacion) => (
                    <Button
                      key={ubicacion}
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

              {/* Ubicación Personalizada */}
              <div className="space-y-2">
                <Label htmlFor="ubicacion-custom" className="text-sm font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Emplacement Personnalisé
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="ubicacion-custom"
                    placeholder="Ex: Allée 3, Étagère B"
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
    </div>
  );
}