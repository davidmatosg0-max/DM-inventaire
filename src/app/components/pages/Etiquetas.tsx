import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import {
  Copy,
  Edit,
  Eye,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Package,
  Printer,
  Search,
  Settings,
  Tag,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { DatosEtiqueta, VistaImpresion } from '../etiquetas/EtiquetaImprimible';
import { printStandardLabel, type ProductLabelData } from '../etiquetas/StandardProductLabel';
import { generarCodigoBarrasEAN13, generarCodigoUbicacion, generarDatosQRUbicacion } from '../../utils/barcode';
import { mockProductos } from '../../data/mockData';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerCategorias } from '../../utils/categoriaStorage';
import { formatQuantity } from '../../utils/formatUtils';
import {
  buildLocationCodesForZone,
  buildLocationOptions,
  buildLocationSections,
  buildLocationRangeLabel,
  findLocationConflicts,
  loadLocationZones,
  saveLocationZones,
  type LocationZone,
} from '../../utils/locationZones';
import { generateBrandedQrDataUrl } from '../../utils/brandedQr';
import { openAutoPrintPopup } from '../../utils/printPopup';

type LabelSize = 'pequena' | 'mediana' | 'grande';
type CodeFormat = 'EAN13' | 'CODE128' | 'CODE39';
type QueueFilter = 'todas' | 'ubicacion' | 'producto';

type ProductoEtiqueta = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  lote: string;
  fechaVencimiento: string;
  esPRS?: boolean;
  foto?: string;
  icono?: string;
  peso?: number;
  pesoRegistrado?: number;
  pesoUnitario?: number;
  varianteId?: string;
  varianteNombre?: string;
  temperatura?: 'ambiente' | 'refrigerado' | 'congelado';
};

type ZoneFormState = {
  zona: string;
  tipo: string;
  cantidad: number;
};

type LocationMeta = {
  codigoZona: string;
  tipoZona: string;
  configurada: boolean;
};

const ALL_LOCATIONS_VALUE = '__ALL_LOCATIONS__';
const WITHOUT_LOCATION_VALUE = '__WITHOUT_LOCATION__';
const ALL_ZONES_VALUE = '__ALL_ZONES__';

const LOCATION_TYPE_OPTIONS = [
  'Estantería',
  'Cámara Fría',
  'Congelador',
  'Almacén Seco',
  'Zona de Carga',
  'Área de Clasificación',
];

const categoriasInfo: Record<string, { icono: string; color: string; label: string }> = {
  'Alimentos Secos': { icono: '🍚', color: '#FFC107', label: 'Alimentos secos' },
  'Conservas': { icono: '🥫', color: '#4CAF50', label: 'Conservas' },
  'Lácteos': { icono: '🥛', color: '#1E73BE', label: 'Lácteos' },
  'Frutas y Verduras': { icono: '🥬', color: '#4CAF50', label: 'Frutas y verduras' },
  'Proteínas': { icono: '🥩', color: '#DC3545', label: 'Proteínas' },
  'Panadería': { icono: '🍞', color: '#FFA726', label: 'Panadería' },
  'Bebidas': { icono: '🧃', color: '#29B6F6', label: 'Bebidas' },
  'Aceites y Condimentos': { icono: '🫒', color: '#66BB6A', label: 'Aceites y condimentos' },
};

function sortAlphaNumeric(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));
}

function normalizeLocationCode(value?: string | null) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function buildDefaultZoneForm(): ZoneFormState {
  return {
    zona: '',
    tipo: LOCATION_TYPE_OPTIONS[0],
    cantidad: 10,
  };
}

function MetricCard({
  title,
  value,
  icon,
  accent,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  subtitle?: string;
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-[#666666]">{title}</p>
            <p className="text-3xl font-bold" style={{ color: accent }}>
              {value}
            </p>
            {subtitle ? <p className="text-xs text-[#999999]">{subtitle}</p> : null}
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ backgroundColor: accent }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Etiquetas() {
  const branding = useBranding();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || 'fr';
  const htmlLang = locale.split('-')[0] || 'fr';

  const translateLocationType = (type?: string) => {
    switch (type) {
      case 'Estantería':
        return t('labels.locationTypes.shelf');
      case 'Cámara Fría':
        return t('labels.locationTypes.coldRoom');
      case 'Congelador':
        return t('labels.locationTypes.freezer');
      case 'Almacén Seco':
        return t('labels.locationTypes.dryStorage');
      case 'Zona de Carga':
        return t('labels.locationTypes.loadingZone');
      case 'Área de Clasificación':
        return t('labels.locationTypes.sortingArea');
      default:
        return type || t('labels.inventoryLocation');
    }
  };

  const getCategoryTranslationKey = (categoria?: string) => {
    switch (categoria) {
      case 'Alimentos Secos':
        return 'labels.categoryNames.dryFood';
      case 'Conservas':
        return 'labels.categoryNames.cannedFood';
      case 'Lácteos':
        return 'labels.categoryNames.dairy';
      case 'Frutas y Verduras':
        return 'labels.categoryNames.fruitsVegetables';
      case 'Proteínas':
        return 'labels.categoryNames.proteins';
      case 'Panadería':
        return 'labels.categoryNames.bakery';
      case 'Bebidas':
        return 'labels.categoryNames.beverages';
      case 'Aceites y Condimentos':
        return 'labels.categoryNames.oilsCondiments';
      default:
        return null;
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const [zonas, setZonas] = useState<LocationZone[]>(() => loadLocationZones());
  const [tamanoEtiqueta, setTamanoEtiqueta] = useState<LabelSize>('mediana');
  const [formatoCodigo, setFormatoCodigo] = useState<CodeFormat>('CODE128');
  const [columnasImpresion, setColumnasImpresion] = useState(2);
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [colaEtiquetas, setColaEtiquetas] = useState<DatosEtiqueta[]>([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<number[]>([]);
  const [filtroCola, setFiltroCola] = useState<QueueFilter>('todas');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [filtroUbicacionProducto, setFiltroUbicacionProducto] = useState(ALL_LOCATIONS_VALUE);
  const [filtroZonaUbicaciones, setFiltroZonaUbicaciones] = useState(ALL_ZONES_VALUE);
  const [zoneForm, setZoneForm] = useState<ZoneFormState>(() => buildDefaultZoneForm());
  const [editingZoneCode, setEditingZoneCode] = useState<string | null>(null);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((current) => current + 1);
      setZonas(loadLocationZones());
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'banco_alimentos_productos' || event.key === 'zonasAlmacen') {
        handleRefresh();
      }
    };

    window.addEventListener('productos-actualizados', handleRefresh);
    window.addEventListener('categorias-actualizadas', handleRefresh);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('productos-actualizados', handleRefresh);
      window.removeEventListener('categorias-actualizadas', handleRefresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const productosCreados = useMemo(() => obtenerProductos(), [refreshKey]);

  const todosLosProductos = useMemo<ProductoEtiqueta[]>(() => {
    const categoriasDB = obtenerCategorias();

    const productosLS: ProductoEtiqueta[] = productosCreados.map((producto) => {
      let iconoFinal = '📦';

      const categoriaObj = categoriasDB.find((categoria) => categoria.nombre === producto.categoria);
      const subcategoriaObj = categoriaObj?.subcategorias?.find((subcategoria) => subcategoria.nombre === producto.subcategoria);

      if (subcategoriaObj?.icono && subcategoriaObj.icono.trim() !== '') {
        iconoFinal = subcategoriaObj.icono;
      } else if (categoriaObj?.icono && categoriaObj.icono.trim() !== '') {
        iconoFinal = categoriaObj.icono;
      } else if (categoriasInfo[producto.categoria]?.icono) {
        iconoFinal = categoriasInfo[producto.categoria].icono;
      }

      return {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        subcategoria: producto.subcategoria,
        unidad: producto.unidad,
        stockActual: producto.stockActual,
        stockMinimo: producto.stockMinimo,
        ubicacion: normalizeLocationCode(producto.ubicacion),
        lote: producto.lote || '',
        fechaVencimiento: producto.fechaVencimiento || '',
        esPRS: producto.esPRS,
        foto: '',
        icono: iconoFinal,
        peso: producto.peso,
        pesoRegistrado: producto.pesoRegistrado,
        pesoUnitario: producto.pesoUnitario || producto.peso,
        varianteId: producto.varianteId,
        varianteNombre: producto.varianteNombre,
        temperatura: producto.temperatura,
      };
    });

    const productosMock: ProductoEtiqueta[] = mockProductos
      .filter((producto) => !productosLS.some((existente) => existente.id === producto.id))
      .map((producto) => ({
        id: producto.id,
        codigo: producto.codigo || producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        subcategoria: producto.subcategoria || '',
        unidad: producto.unidad || 'UND',
        stockActual: Number(producto.stockActual) || 0,
        stockMinimo: Number(producto.stockMinimo) || 0,
        ubicacion: normalizeLocationCode(producto.ubicacion),
        lote: typeof producto.lote === 'string' ? producto.lote : '',
        fechaVencimiento: typeof producto.fechaVencimiento === 'string' ? producto.fechaVencimiento : '',
        esPRS: Boolean(producto.esPRS),
        foto: typeof producto.foto === 'string' ? producto.foto : '',
        icono: typeof producto.icono === 'string' && producto.icono.trim() !== ''
          ? producto.icono
          : categoriasInfo[producto.categoria]?.icono || '📦',
        peso: Number(producto.peso) || 0,
        pesoRegistrado: Number(producto.pesoRegistrado) || 0,
        pesoUnitario: Number(producto.pesoUnitario || producto.peso) || 0,
        varianteId: typeof producto.varianteId === 'string' ? producto.varianteId : undefined,
        varianteNombre: typeof producto.varianteNombre === 'string' ? producto.varianteNombre : undefined,
      }));

    return [...productosLS, ...productosMock];
  }, [productosCreados, refreshKey]);

  const productById = useMemo(() => new Map(todosLosProductos.map((producto) => [producto.id, producto])), [todosLosProductos]);

  const ubicacionesActualesProducto = useMemo(
    () => sortAlphaNumeric(
      todosLosProductos
        .map((producto) => normalizeLocationCode(producto.ubicacion))
        .filter(Boolean)
    ),
    [todosLosProductos]
  );

  const ubicacionesDisponibles = useMemo(
    () => buildLocationOptions(zonas, ubicacionesActualesProducto),
    [zonas, ubicacionesActualesProducto]
  );

  const seccionesUbicacion = useMemo(
    () => buildLocationSections(zonas, ubicacionesDisponibles),
    [zonas, ubicacionesDisponibles]
  );

  const metaUbicacion = useMemo(() => {
    const map = new Map<string, LocationMeta>();

    seccionesUbicacion.forEach((seccion) => {
      seccion.ubicaciones.forEach((ubicacion) => {
        map.set(ubicacion, {
          codigoZona: seccion.codigoZona,
          tipoZona: seccion.tipoZona,
          configurada: seccion.codigoZona !== 'AUTRES',
        });
      });
    });

    return map;
  }, [seccionesUbicacion]);

  const productosPorUbicacion = useMemo(() => {
    const map = new Map<string, ProductoEtiqueta[]>();

    todosLosProductos.forEach((producto) => {
      const ubicacion = normalizeLocationCode(producto.ubicacion);
      if (!ubicacion) {
        return;
      }

      const current = map.get(ubicacion) || [];
      current.push(producto);
      map.set(ubicacion, current);
    });

    return map;
  }, [todosLosProductos]);

  const ubicacionesOcupadas = useMemo(
    () => new Set(Array.from(productosPorUbicacion.entries()).filter(([, productos]) => productos.length > 0).map(([ubicacion]) => ubicacion)),
    [productosPorUbicacion]
  );

  const ubicacionesEtiquetadasEnCola = useMemo(
    () => new Set(
      colaEtiquetas
        .filter((etiqueta) => etiqueta.tipo === 'ubicacion')
        .map((etiqueta) => normalizeLocationCode(etiqueta.subtitulo || etiqueta.codigo))
        .filter(Boolean)
    ),
    [colaEtiquetas]
  );

  const productosEtiquetadosEnCola = useMemo(
    () => new Set(
      colaEtiquetas
        .filter((etiqueta) => etiqueta.tipo === 'producto' && etiqueta.productoId)
        .map((etiqueta) => etiqueta.productoId as string)
    ),
    [colaEtiquetas]
  );

  const resumenZonas = useMemo(
    () => zonas.map((zona) => {
      const codigos = buildLocationCodesForZone(zona);
      const ocupadas = codigos.filter((codigo) => ubicacionesOcupadas.has(codigo)).length;
      const etiquetadas = codigos.filter((codigo) => ubicacionesEtiquetadasEnCola.has(codigo)).length;
      const productos = codigos.reduce((total, codigo) => total + (productosPorUbicacion.get(codigo)?.length || 0), 0);

      return {
        ...zona,
        ocupadas,
        etiquetadas,
        libres: Math.max(codigos.length - ocupadas, 0),
        productos,
      };
    }),
    [zonas, ubicacionesOcupadas, ubicacionesEtiquetadasEnCola, productosPorUbicacion]
  );

  const productosSinUbicacion = useMemo(
    () => todosLosProductos.filter((producto) => !normalizeLocationCode(producto.ubicacion)),
    [todosLosProductos]
  );

  const productosFiltrados = useMemo(() => {
    const query = busquedaProducto.trim().toLowerCase();

    return todosLosProductos
      .filter((producto) => {
        const ubicacion = normalizeLocationCode(producto.ubicacion);

        if (filtroUbicacionProducto === WITHOUT_LOCATION_VALUE && ubicacion) {
          return false;
        }

        if (filtroUbicacionProducto !== ALL_LOCATIONS_VALUE && filtroUbicacionProducto !== WITHOUT_LOCATION_VALUE && ubicacion !== filtroUbicacionProducto) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [producto.nombre, producto.codigo, producto.categoria, producto.subcategoria, ubicacion]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      })
      .sort((left, right) => {
        const locationOrder = normalizeLocationCode(left.ubicacion).localeCompare(normalizeLocationCode(right.ubicacion), undefined, { numeric: true, sensitivity: 'base' });
        if (locationOrder !== 0) {
          return locationOrder;
        }

        return left.nombre.localeCompare(right.nombre, undefined, { sensitivity: 'base' });
      });
  }, [todosLosProductos, busquedaProducto, filtroUbicacionProducto]);

  const seccionesFiltradas = useMemo(() => {
    if (filtroZonaUbicaciones === ALL_ZONES_VALUE) {
      return seccionesUbicacion;
    }

    return seccionesUbicacion.filter((seccion) => seccion.codigoZona === filtroZonaUbicaciones);
  }, [seccionesUbicacion, filtroZonaUbicaciones]);

  const colaVisible = useMemo(() => {
    return colaEtiquetas
      .map((etiqueta, index) => ({ etiqueta, index }))
      .filter(({ etiqueta }) => filtroCola === 'todas' || etiqueta.tipo === filtroCola);
  }, [colaEtiquetas, filtroCola]);

  const etiquetasParaAccion = useMemo(() => {
    if (etiquetasSeleccionadas.length > 0) {
      return etiquetasSeleccionadas
        .map((index) => colaEtiquetas[index])
        .filter((etiqueta): etiqueta is DatosEtiqueta => Boolean(etiqueta));
    }

    return colaVisible.map(({ etiqueta }) => etiqueta);
  }, [etiquetasSeleccionadas, colaEtiquetas, colaVisible]);

  const getCategoriaLabel = (categoria?: string) => {
    if (!categoria) {
      return t('labels.noCategory');
    }

    const translationKey = getCategoryTranslationKey(categoria);
    return translationKey ? t(translationKey) : categoria;
  };

  const getSectionTypeLabel = (metadata?: LocationMeta | null) => {
    if (!metadata) {
      return t('labels.inventoryLocation');
    }

    if (!metadata.configurada) {
      return t('labels.outsideCurrentConfiguration');
    }

    return translateLocationType(metadata.tipoZona);
  };

  const persistZones = (nextZones: LocationZone[]) => {
    const sortedZones = [...nextZones].sort((left, right) => left.zona.localeCompare(right.zona, undefined, { numeric: true, sensitivity: 'base' }));
    setZonas(sortedZones);
    saveLocationZones(sortedZones);
  };

  const resetZoneForm = () => {
    setZoneForm(buildDefaultZoneForm());
    setEditingZoneCode(null);
  };

  const getLocationUsageForZone = (zone: LocationZone) => {
    const codigos = buildLocationCodesForZone(zone);
    return codigos.filter((codigo) => ubicacionesOcupadas.has(codigo) || ubicacionesEtiquetadasEnCola.has(codigo));
  };

  const handleSaveZone = () => {
    const codigoZona = zoneForm.zona.trim().toUpperCase();
    const cantidadNormalizada = Math.max(1, Math.round(zoneForm.cantidad));

    if (!codigoZona) {
      toast.error(t('labels.locationCodeRequired'));
      return;
    }

    if (!/^[A-Z0-9]{1,3}$/.test(codigoZona)) {
      toast.error(t('labels.zoneCodeFormat'));
      return;
    }

    if (editingZoneCode && codigoZona !== editingZoneCode && zonas.some((zona) => zona.zona === codigoZona)) {
      toast.error(t('labels.zoneAlreadyExists', { zone: codigoZona }));
      return;
    }

    if (!editingZoneCode && zonas.some((zona) => zona.zona === codigoZona)) {
      toast.error(t('labels.zoneAlreadyExists', { zone: codigoZona }));
      return;
    }

    const updatedZone: LocationZone = {
      zona: codigoZona,
      tipo: zoneForm.tipo,
      cantidad: cantidadNormalizada,
    };

    const nextZones = editingZoneCode
      ? zonas.map((zona) => (zona.zona === editingZoneCode ? updatedZone : zona))
      : [...zonas, updatedZone];

    const conflicts = findLocationConflicts(nextZones);
    if (conflicts.length > 0) {
      const example = conflicts[0];
      toast.error(t('labels.zoneConflictDetected', {
        location: example.ubicacion,
        zones: example.zonas.join(', '),
      }));
      return;
    }

    if (editingZoneCode) {
      const previousZone = zonas.find((zona) => zona.zona === editingZoneCode);
      if (previousZone) {
        const usedCodes = getLocationUsageForZone(previousZone);
        const nextCodes = new Set(buildLocationCodesForZone(updatedZone));
        const invalidated = usedCodes.filter((codigo) => !nextCodes.has(codigo));

        if (invalidated.length > 0) {
          toast.error(t('labels.usedLocationsConflict', { locations: invalidated.join(', ') }));
          return;
        }
      }
    }

    persistZones(nextZones);
    toast.success(editingZoneCode ? t('labels.zoneUpdated', { zone: codigoZona }) : t('labels.zoneCreated', { zone: codigoZona }));
    resetZoneForm();
  };

  const handleEditZone = (zoneCode: string) => {
    const zone = zonas.find((item) => item.zona === zoneCode);
    if (!zone) {
      return;
    }

    setEditingZoneCode(zone.zona);
    setZoneForm({
      zona: zone.zona,
      tipo: zone.tipo,
      cantidad: zone.cantidad,
    });
  };

  const handleDeleteZone = (zoneCode: string) => {
    const zone = zonas.find((item) => item.zona === zoneCode);
    if (!zone) {
      return;
    }

    const usedCodes = getLocationUsageForZone(zone);
    if (usedCodes.length > 0) {
      toast.error(t('labels.cannotDeleteZoneUsed', { zone: zoneCode, locations: usedCodes.join(', ') }));
      return;
    }

    if (!window.confirm(t('labels.deleteZoneConfirm', { zone: zoneCode }))) {
      return;
    }

    persistZones(zonas.filter((item) => item.zona !== zoneCode));
    toast.success(t('labels.zoneDeleted', { zone: zoneCode }));
    if (editingZoneCode === zoneCode) {
      resetZoneForm();
    }
  };

  const buildLocationLabel = (locationCode: string): DatosEtiqueta | null => {
    const normalizedLocation = normalizeLocationCode(locationCode);
    if (!normalizedLocation) {
      return null;
    }

    const metadata = metaUbicacion.get(normalizedLocation);
    const descripcion = metadata
      ? metadata.configurada
        ? t('labels.locationDescriptionConfigured', { type: translateLocationType(metadata.tipoZona), zone: metadata.codigoZona })
        : t('labels.locationDescriptionInherited')
      : t('labels.inventoryLocation');

    return {
      tipo: 'ubicacion',
      titulo: t('labels.location').toUpperCase(),
      codigo: generarCodigoUbicacion(normalizedLocation),
      subtitulo: normalizedLocation,
      descripcion,
      icono: '📍',
      mostrarQR: true,
    };
  };

  const addLocationLabels = (locationCodes: string[]) => {
    const nextReserved = new Set(ubicacionesEtiquetadasEnCola);
    const newLabels: DatosEtiqueta[] = [];

    sortAlphaNumeric(Array.from(new Set(locationCodes.map((code) => normalizeLocationCode(code)).filter(Boolean)))).forEach((locationCode) => {
      if (nextReserved.has(locationCode)) {
        return;
      }

      const label = buildLocationLabel(locationCode);
      if (!label) {
        return;
      }

      nextReserved.add(locationCode);
      newLabels.push(label);
    });

    if (newLabels.length === 0) {
      toast.error(t('labels.noNewLocationLabels'));
      return 0;
    }

    setColaEtiquetas((current) => [...current, ...newLabels]);
    toast.success(t('labels.locationLabelsAdded', { count: formatQuantity(newLabels.length) }));
    return newLabels.length;
  };

  const buildProductLabel = (producto: ProductoEtiqueta): DatosEtiqueta => {
    const ubicacion = normalizeLocationCode(producto.ubicacion);

    return {
      tipo: 'producto',
      productoId: producto.id,
      titulo: producto.nombre,
      codigo: generarCodigoBarrasEAN13(producto.id),
      subtitulo: ubicacion ? `${producto.codigo} · ${ubicacion}` : producto.codigo,
      descripcion: ubicacion
        ? t('labels.productDescriptionWithLocation', { category: getCategoriaLabel(producto.categoria), location: ubicacion })
        : t('labels.productDescriptionWithoutLocation', { category: getCategoriaLabel(producto.categoria) }),
      categoria: producto.categoria,
      lote: producto.lote,
      fechaVencimiento: producto.fechaVencimiento,
      icono: producto.icono || categoriasInfo[producto.categoria]?.icono || '📦',
    };
  };

  const addProductLabels = (productIds: string[]) => {
    const nextReserved = new Set(productosEtiquetadosEnCola);
    const newLabels: DatosEtiqueta[] = [];

    productIds.forEach((productId) => {
      if (nextReserved.has(productId)) {
        return;
      }

      const producto = productById.get(productId);
      if (!producto) {
        return;
      }

      nextReserved.add(productId);
      newLabels.push(buildProductLabel(producto));
    });

    if (newLabels.length === 0) {
      toast.error(t('labels.noNewProductLabels'));
      return 0;
    }

    setColaEtiquetas((current) => [...current, ...newLabels]);
    toast.success(t('labels.productLabelsAdded', { count: formatQuantity(newLabels.length) }));
    return newLabels.length;
  };

  const handleAddZoneLocationLabels = (zoneCode: string, onlyOccupied: boolean) => {
    const zone = zonas.find((item) => item.zona === zoneCode);
    if (!zone) {
      return;
    }

    const codes = buildLocationCodesForZone(zone).filter((codigo) => !onlyOccupied || ubicacionesOcupadas.has(codigo));
    if (codes.length === 0) {
      toast.error(t('labels.zoneHasNoLocationsForAction', { zone: zoneCode }));
      return;
    }

    addLocationLabels(codes);
  };

  const handleAddLocationProductLabels = (locationCode: string) => {
    const productos = productosPorUbicacion.get(locationCode) || [];
    if (productos.length === 0) {
      toast.error(t('labels.locationHasNoProducts', { location: locationCode }));
      return;
    }

    addProductLabels(productos.map((producto) => producto.id));
  };

  const toggleSeleccion = (index: number) => {
    setEtiquetasSeleccionadas((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index]
    );
  };

  const toggleSeleccionVisible = () => {
    const visibleIndices = colaVisible.map(({ index }) => index);
    const allVisibleSelected = visibleIndices.length > 0 && visibleIndices.every((index) => etiquetasSeleccionadas.includes(index));

    if (allVisibleSelected) {
      setEtiquetasSeleccionadas((current) => current.filter((index) => !visibleIndices.includes(index)));
      return;
    }

    setEtiquetasSeleccionadas((current) => Array.from(new Set([...current, ...visibleIndices])));
  };

  const eliminarSeleccionadas = () => {
    if (etiquetasSeleccionadas.length === 0) {
      toast.error(t('labels.selectAtLeastOneLabel'));
      return;
    }

    const selectedSet = new Set(etiquetasSeleccionadas);
    setColaEtiquetas((current) => current.filter((_, index) => !selectedSet.has(index)));
    setEtiquetasSeleccionadas([]);
    toast.success(t('labels.labelsRemovedFromQueue'));
  };

  const duplicarSeleccionadas = () => {
    if (etiquetasSeleccionadas.length === 0) {
      toast.error(t('labels.selectAtLeastOneLabel'));
      return;
    }

    const duplicates = etiquetasSeleccionadas
      .map((index) => colaEtiquetas[index])
      .filter((etiqueta): etiqueta is DatosEtiqueta => Boolean(etiqueta))
      .map((etiqueta) => ({ ...etiqueta }));

    setColaEtiquetas((current) => [...current, ...duplicates]);
    setEtiquetasSeleccionadas([]);
    toast.success(`${formatQuantity(duplicates.length)} etiquetas duplicadas.`);
  };

  const imprimirEtiquetas = async () => {
    if (etiquetasParaAccion.length === 0) {
      toast.error(t('labels.noLabelsToPrint'));
      return;
    }

    const etiquetasProducto = etiquetasParaAccion.filter((etiqueta) => etiqueta.tipo === 'producto');
    const etiquetasUbicacion = etiquetasParaAccion.filter((etiqueta) => etiqueta.tipo === 'ubicacion');

    if (etiquetasProducto.length > 0) {
      let preparadas = 0;
      let omitidas = 0;

      etiquetasProducto.forEach((etiqueta) => {
        if (!etiqueta.productoId) {
          omitidas += 1;
          return;
        }

        const producto = productById.get(etiqueta.productoId);
        if (!producto) {
          omitidas += 1;
          return;
        }

        preparadas += 1;
        const cantidad = Math.max(1, Math.round(producto.stockActual || 1));
        const pesoUnidad = Math.round(producto.pesoUnitario || producto.peso || 0);

        const labelData: ProductLabelData = {
          id: producto.id,
          codigo: producto.codigo,
          nombreProducto: producto.nombre,
          productoIcono: producto.icono,
          categoria: producto.categoria,
          subcategoria: producto.subcategoria,
          cantidad,
          unidad: producto.unidad,
          pesoTotal: pesoUnidad * cantidad,
          pesoUnidad,
          temperatura: producto.temperatura || 'ambiente',
          ubicacion: normalizeLocationCode(producto.ubicacion),
          lote: producto.lote,
          fechaCaducidad: producto.fechaVencimiento,
          fechaEntrada: new Date().toISOString(),
          locale,
          translations: {
            foodBank: t('labels.productPrint.foodBank'),
            productLabel: t('labels.productPrint.productLabel'),
            quantity: t('labels.productPrint.quantity'),
            temperature: t('labels.productPrint.temperature'),
            lot: t('labels.productPrint.lot'),
            expiryDate: t('labels.productPrint.expiryDate'),
            weight: t('labels.productPrint.weight'),
            program: t('labels.productPrint.program'),
            donor: t('labels.productPrint.donor'),
            entryDate: t('labels.productPrint.entryDate'),
            systemFooter: t('labels.systemFooter'),
            ambient: t('labels.productPrint.ambient'),
            refrigerated: t('labels.productPrint.refrigerated'),
            frozen: t('labels.productPrint.frozen'),
            packagingDetails: t('labels.productPrint.packagingDetails'),
            printButton: t('labels.productPrint.printButton'),
            closeButton: t('labels.productPrint.closeButton'),
          },
        };

        printStandardLabel(labelData).catch((error) => {
          console.error('Error al imprimir etiqueta de producto:', error);
          toast.error(t('labels.couldNotPrintProduct', { product: producto.nombre }));
        });
      });

      if (preparadas > 0) {
        toast.success(t('labels.productLabelsSentToPrint', { count: formatQuantity(preparadas) }));
      }

      if (omitidas > 0) {
        toast.error(t('labels.productLabelsOmitted', { count: formatQuantity(omitidas) }));
      }
    }

    if (etiquetasUbicacion.length === 0) {
      return;
    }

    const dimensiones = {
      pequena: { width: '6cm', height: '4cm' },
      mediana: { width: '10cm', height: '6cm' },
      grande: { width: '14cm', height: '8cm' },
    };

    const etiquetasRenderizadas = await Promise.all(
      etiquetasUbicacion.map(async (etiqueta) => {
        const ubicacion = etiqueta.subtitulo || etiqueta.codigo;

        try {
          const qrImage = await generateBrandedQrDataUrl(generarDatosQRUbicacion(ubicacion, etiqueta.codigo), {
            width: tamanoEtiqueta === 'pequena' ? 140 : tamanoEtiqueta === 'mediana' ? 180 : 220,
            margin: 1,
            errorCorrectionLevel: 'H',
          });

          return { ...etiqueta, qrImage };
        } catch (error) {
          console.error('Error al generar QR de ubicación:', error);
          return { ...etiqueta, qrImage: null };
        }
      })
    );

    const dim = dimensiones[tamanoEtiqueta];

    try {
      openAutoPrintPopup(`
        <!DOCTYPE html>
        <html lang="${htmlLang}">
          <head>
            <meta charset="UTF-8" />
            <title>${t('labels.locationPrintWindowTitle')}</title>
            <style>
              * { box-sizing: border-box; }
              body { margin: 0; font-family: Arial, sans-serif; background: white; }
              @page { size: A4; margin: 1cm; }
              .grid { display: grid; grid-template-columns: repeat(${columnasImpresion}, 1fr); gap: 0.5cm; padding: 0.5cm; }
              .label { width: ${dim.width}; height: ${dim.height}; border: 2px solid #111827; padding: 10px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; page-break-inside: avoid; }
              .header { border-bottom: 2px solid #d1d5db; padding-bottom: 6px; text-align: center; }
              .title { font-size: 16px; font-weight: 700; letter-spacing: 0.08em; }
              .subtitle { font-size: 11px; color: #6b7280; margin-top: 4px; }
              .qr { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
              .qr img { width: ${tamanoEtiqueta === 'pequena' ? '90px' : tamanoEtiqueta === 'mediana' ? '120px' : '150px'}; height: ${tamanoEtiqueta === 'pequena' ? '90px' : tamanoEtiqueta === 'mediana' ? '120px' : '150px'}; object-fit: contain; }
              .qr-code { font-size: ${tamanoEtiqueta === 'pequena' ? '10px' : tamanoEtiqueta === 'mediana' ? '12px' : '14px'}; font-weight: 700; }
              .footer { border-top: 2px solid #d1d5db; padding-top: 6px; font-size: 10px; color: #4b5563; }
              .system { margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 8px; color: #9ca3af; }
            </style>
          </head>
          <body>
            <div class="grid">
              ${etiquetasRenderizadas.map((etiqueta) => `
                <div class="label">
                  <div class="header">
                    <div class="title">${etiqueta.titulo}</div>
                    <div class="subtitle">${etiqueta.subtitulo || ''}</div>
                  </div>
                  <div class="qr">
                    ${etiqueta.qrImage ? `<img src="${etiqueta.qrImage}" alt="${t('labels.qrAlt', { code: etiqueta.subtitulo || etiqueta.codigo })}" />` : ''}
                    <div class="qr-code">${etiqueta.subtitulo || etiqueta.codigo}</div>
                  </div>
                  <div class="footer">
                    ${etiqueta.descripcion || ''}
                    <div class="system">${t('labels.systemFooter')}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `, { width: 1100, height: 800, printDelayMs: 300 });
    } catch (error) {
      toast.error(t('labels.couldNotOpenPrintWindow'));
      return;
    }

    toast.success(t('labels.locationLabelsSentToPrint', { count: formatQuantity(etiquetasUbicacion.length) }));
  };

  const totalUbicacionesConfiguradas = zonas.reduce((total, zona) => total + zona.cantidad, 0);

  return (
    <div
      className="min-h-screen space-y-6 p-4 sm:p-6"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor}10 0%, ${branding.secondaryColor}10 100%)`,
      }}
    >
      <div className="space-y-6">
        <Card className="border-0 shadow-xl">
          <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}
                >
                  <Tag className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: branding.primaryColor }}>
                    {t('labels.inventoryTitle')}
                  </h1>
                  <p className="text-sm text-[#666666]">
                    {t('labels.inventorySubtitle')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: branding.primaryColor }}>
                {t('labels.activeZones', { count: formatQuantity(zonas.length) })}
              </Badge>
              <Badge className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: branding.secondaryColor }}>
                {t('labels.queuedLabels', { count: formatQuantity(colaEtiquetas.length) })}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title={t('labels.configuredZones')}
            value={formatQuantity(zonas.length)}
            subtitle={t('labels.configuredZonesSubtitle')}
            icon={<Settings className="h-5 w-5" />}
            accent={branding.primaryColor}
          />
          <MetricCard
            title={t('labels.standardLocations')}
            value={formatQuantity(totalUbicacionesConfiguradas)}
            subtitle={t('labels.standardLocationsSubtitle')}
            icon={<LayoutGrid className="h-5 w-5" />}
            accent={branding.secondaryColor}
          />
          <MetricCard
            title={t('labels.occupiedLocations')}
            value={formatQuantity(ubicacionesOcupadas.size)}
            subtitle={t('labels.occupiedLocationsSubtitle')}
            icon={<MapPin className="h-5 w-5" />}
            accent="#f59e0b"
          />
          <MetricCard
            title={t('labels.productsWithoutLocation')}
            value={formatQuantity(productosSinUbicacion.length)}
            subtitle={t('labels.productsWithoutLocationSubtitle')}
            icon={<Package className="h-5 w-5" />}
            accent="#dc2626"
          />
        </div>

        <Tabs defaultValue="ubicaciones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md">
            <TabsTrigger value="ubicaciones">
              <MapPin className="mr-2 h-4 w-4" />
              {t('labels.locations')}
            </TabsTrigger>
            <TabsTrigger value="productos">
              <Package className="mr-2 h-4 w-4" />
              {t('labels.products')}
            </TabsTrigger>
            <TabsTrigger value="cola">
              <Printer className="mr-2 h-4 w-4" />
              {t('labels.createdLabels')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ubicaciones" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5" style={{ color: branding.primaryColor }} />
                      {editingZoneCode ? t('labels.editZone', { zone: editingZoneCode }) : t('labels.configureZone')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('labels.code')}</Label>
                      <Input
                        placeholder="A, B, C..."
                        maxLength={3}
                        value={zoneForm.zona}
                        onChange={(event) => setZoneForm((current) => ({ ...current, zona: event.target.value.toUpperCase() }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('labels.type')}</Label>
                      <Select value={zoneForm.tipo} onValueChange={(value) => setZoneForm((current) => ({ ...current, tipo: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type} value={type}>
                              {translateLocationType(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('labels.capacity')}</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={zoneForm.cantidad}
                        onChange={(event) => setZoneForm((current) => ({ ...current, cantidad: Math.max(1, parseInt(event.target.value, 10) || 1) }))}
                      />
                    </div>

                    {zoneForm.zona ? (
                      <div className="rounded-2xl border p-4" style={{ backgroundColor: `${branding.primaryColor}08`, borderColor: `${branding.primaryColor}30` }}>
                        <p className="text-xs uppercase tracking-wide text-[#666666]">{t('labels.preview')}</p>
                        <p className="mt-1 text-lg font-semibold" style={{ color: branding.primaryColor }}>
                          {t('labels.zonePreview', { zone: zoneForm.zona.trim().toUpperCase(), type: translateLocationType(zoneForm.tipo) })}
                        </p>
                        <p className="text-sm text-[#666666]">
                          {buildLocationRangeLabel({ zona: zoneForm.zona.trim().toUpperCase(), tipo: zoneForm.tipo, cantidad: Math.max(1, Math.round(zoneForm.cantidad)) })}
                        </p>
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                      {editingZoneCode ? (
                        <Button variant="outline" className="flex-1" onClick={resetZoneForm}>
                          {t('labels.cancelEdit')}
                        </Button>
                      ) : null}
                      <Button
                        className="flex-1 text-white"
                        style={{ backgroundColor: branding.primaryColor }}
                        onClick={handleSaveZone}
                      >
                        {editingZoneCode ? t('labels.saveZone') : t('labels.createZone')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <List className="h-5 w-5" style={{ color: branding.secondaryColor }} />
                      {t('labels.zoneSummary')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resumenZonas.map((zona) => (
                      <div key={zona.zona} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-[#1f2937]">{t('labels.zoneLabel', { zone: zona.zona })}</p>
                            <p className="text-sm text-[#666666]">{translateLocationType(zona.tipo)}</p>
                            <p className="text-xs text-[#999999]">{buildLocationRangeLabel(zona)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditZone(zona.zona)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteZone(zona.zona)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#666666]">
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{t('labels.locationsCount', { count: formatQuantity(zona.cantidad) })}</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{t('labels.occupiedCount', { count: formatQuantity(zona.ocupadas) })}</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{t('labels.alreadyQueuedCount', { count: formatQuantity(zona.etiquetadas) })}</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{t('labels.productsCount', { count: formatQuantity(zona.productos) })}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5" style={{ color: branding.primaryColor }} />
                      {t('labels.locationMapTitle')}
                    </CardTitle>
                    <p className="text-sm text-[#666666]">
                      {t('labels.locationMapDescription')}
                    </p>
                  </div>

                  <div className="w-full lg:max-w-xs">
                    <Label className="mb-2 block text-xs uppercase tracking-wide text-[#666666]">{t('labels.filterZone')}</Label>
                    <Select value={filtroZonaUbicaciones} onValueChange={setFiltroZonaUbicaciones}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_ZONES_VALUE}>{t('labels.allZones')}</SelectItem>
                        {seccionesUbicacion.map((seccion) => (
                          <SelectItem key={seccion.codigoZona} value={seccion.codigoZona}>
                            {seccion.codigoZona === 'AUTRES' ? t('labels.inheritedLocations') : t('labels.zoneLabel', { zone: seccion.codigoZona })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {seccionesFiltradas.map((seccion) => {
                    const zoneSummary = resumenZonas.find((item) => item.zona === seccion.codigoZona);
                    const isConfiguredZone = seccion.codigoZona !== 'AUTRES';

                    return (
                      <div key={seccion.codigoZona} className="rounded-3xl border p-4 sm:p-5">
                        <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-[#1f2937]">
                                {isConfiguredZone ? t('labels.zoneLabel', { zone: seccion.codigoZona }) : t('labels.inheritedLocations')}
                              </h3>
                              <Badge variant="outline">
                                {isConfiguredZone ? translateLocationType(seccion.tipoZona) : t('labels.outsideCurrentConfiguration')}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-[#666666]">
                              {isConfiguredZone && zoneSummary
                                ? t('labels.zoneSummaryLine', {
                                    locations: formatQuantity(zoneSummary.cantidad),
                                    occupied: formatQuantity(zoneSummary.ocupadas),
                                    products: formatQuantity(zoneSummary.productos),
                                  })
                                : t('labels.inheritedLocationsSummary', { count: formatQuantity(seccion.ubicaciones.length) })}
                            </p>
                          </div>

                          {isConfiguredZone ? (
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" onClick={() => handleAddZoneLocationLabels(seccion.codigoZona, true)}>
                                {t('labels.labelOccupied')}
                              </Button>
                              <Button className="text-white" style={{ backgroundColor: branding.secondaryColor }} onClick={() => handleAddZoneLocationLabels(seccion.codigoZona, false)}>
                                {t('labels.labelFullZone')}
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-4 grid gap-3 xl:grid-cols-2">
                          {seccion.ubicaciones.map((ubicacion) => {
                            const productos = productosPorUbicacion.get(ubicacion) || [];
                            const queued = ubicacionesEtiquetadasEnCola.has(ubicacion);

                            return (
                              <div key={ubicacion} className="rounded-2xl border bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-lg font-semibold text-[#111827]">{ubicacion}</p>
                                      {queued ? <Badge style={{ backgroundColor: branding.primaryColor }}>{t('labels.queued')}</Badge> : null}
                                      {productos.length > 0 ? <Badge variant="outline">{t('labels.productsCount', { count: formatQuantity(productos.length) })}</Badge> : <Badge variant="secondary">{t('labels.empty')}</Badge>}
                                    </div>
                                    <p className="text-sm text-[#666666]">{getSectionTypeLabel(metaUbicacion.get(ubicacion))}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={queued} onClick={() => addLocationLabels([ubicacion])}>
                                      <MapPin className="mr-1 h-4 w-4" />
                                      {t('labels.createLocationLabel')}
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="text-white"
                                      style={{ backgroundColor: branding.secondaryColor }}
                                      disabled={productos.length === 0}
                                      onClick={() => handleAddLocationProductLabels(ubicacion)}
                                    >
                                      <Package className="mr-1 h-4 w-4" />
                                      {t('labels.createProductLabels')}
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                  {productos.length === 0 ? (
                                    <p className="text-sm text-[#999999]">{t('labels.noProductsAssigned')}</p>
                                  ) : (
                                    productos.slice(0, 3).map((producto) => (
                                      <div key={producto.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                                        <div className="min-w-0">
                                          <p className="truncate font-medium text-[#1f2937]">{producto.nombre}</p>
                                          <p className="truncate text-xs text-[#666666]">{producto.codigo} · {getCategoriaLabel(producto.categoria)}</p>
                                        </div>
                                        <Badge variant="outline">
                                          {formatQuantity(producto.stockActual)} {producto.unidad}
                                        </Badge>
                                      </div>
                                    ))
                                  )}
                                  {productos.length > 3 ? (
                                    <p className="text-xs text-[#999999]">{t('labels.moreProducts', { count: formatQuantity(productos.length - 3) })}</p>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="productos" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="gap-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" style={{ color: branding.primaryColor }} />
                  {t('labels.filterProductsForLabels')}
                </CardTitle>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px_auto]">
                  <div className="space-y-2">
                    <Label>{t('labels.search')}</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
                      <Input className="pl-9" placeholder={t('labels.productSearchPlaceholder')} value={busquedaProducto} onChange={(event) => setBusquedaProducto(event.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('labels.location')}</Label>
                    <Select value={filtroUbicacionProducto} onValueChange={setFiltroUbicacionProducto}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_LOCATIONS_VALUE}>{t('labels.allLocations')}</SelectItem>
                        <SelectItem value={WITHOUT_LOCATION_VALUE}>{t('labels.withoutLocation')}</SelectItem>
                        {ubicacionesDisponibles.map((ubicacion) => (
                          <SelectItem key={ubicacion} value={ubicacion}>
                            {ubicacion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button className="w-full text-white lg:w-auto" style={{ backgroundColor: branding.secondaryColor }} onClick={() => addProductLabels(productosFiltrados.map((producto) => producto.id))}>
                      {t('labels.labelFiltered')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {productosFiltrados.map((producto) => {
                const ubicacion = normalizeLocationCode(producto.ubicacion);
                const queued = productosEtiquetadosEnCola.has(producto.id);

                return (
                  <Card key={producto.id} className="border-0 shadow-lg">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                            {producto.icono || categoriasInfo[producto.categoria]?.icono || '📦'}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-[#111827]">{producto.nombre}</p>
                            <p className="truncate text-sm text-[#666666]">{producto.codigo}</p>
                          </div>
                        </div>
                        {queued ? <Badge style={{ backgroundColor: branding.primaryColor }}>{t('labels.queued')}</Badge> : null}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">{t('labels.category')}</p>
                          <p className="truncate font-medium text-[#1f2937]">{getCategoriaLabel(producto.categoria)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">{t('labels.location')}</p>
                          <p className="truncate font-medium text-[#1f2937]">{ubicacion || t('labels.withoutLocation')}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">{t('labels.stock')}</p>
                          <p className="font-medium text-[#1f2937]">{formatQuantity(producto.stockActual)} {producto.unidad}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">{t('labels.lot')}</p>
                          <p className="truncate font-medium text-[#1f2937]">{producto.lote || t('labels.withoutBatch')}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 text-white" style={{ backgroundColor: branding.primaryColor }} disabled={queued} onClick={() => addProductLabels([producto.id])}>
                          {t('labels.createLabel')}
                        </Button>
                        {ubicacion ? (
                          <Button variant="outline" onClick={() => addLocationLabels([ubicacion])} disabled={ubicacionesEtiquetadasEnCola.has(ubicacion)}>
                            <MapPin className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {productosFiltrados.length === 0 ? (
                <Card className="col-span-full border-0 shadow-lg">
                  <CardContent className="py-12 text-center text-[#666666]">
                    <Package className="mx-auto mb-3 h-12 w-12 text-[#cbd5e1]" />
                    <p>{t('labels.noProductsForFilter')}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="cola" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="gap-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Printer className="h-5 w-5" style={{ color: branding.primaryColor }} />
                  {t('labels.preparePrint')}
                </CardTitle>

                <div className="grid gap-4 xl:grid-cols-[220px_220px_220px_140px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    <Label>{t('labels.queueFilter')}</Label>
                    <Select value={filtroCola} onValueChange={(value) => setFiltroCola(value as QueueFilter)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">{t('labels.printAll')}</SelectItem>
                        <SelectItem value="ubicacion">{t('labels.locations')}</SelectItem>
                        <SelectItem value="producto">{t('labels.products')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('labels.labelSize')}</Label>
                    <Select value={tamanoEtiqueta} onValueChange={(value) => setTamanoEtiqueta(value as LabelSize)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pequena">{t('labels.small')}</SelectItem>
                        <SelectItem value="mediana">{t('labels.medium')}</SelectItem>
                        <SelectItem value="grande">{t('labels.large')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('labels.codeFormat')}</Label>
                    <Select value={formatoCodigo} onValueChange={(value) => setFormatoCodigo(value as CodeFormat)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CODE128">CODE128</SelectItem>
                        <SelectItem value="EAN13">EAN13</SelectItem>
                        <SelectItem value="CODE39">CODE39</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('labels.columns')}</Label>
                    <Select value={columnasImpresion.toString()} onValueChange={(value) => setColumnasImpresion(parseInt(value, 10))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap items-end gap-2">
                    <Button variant="outline" onClick={() => setVistaPrevia((current) => !current)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {vistaPrevia ? t('labels.hidePreview') : t('labels.showPreview')}
                    </Button>
                    <Button className="text-white" style={{ backgroundColor: branding.secondaryColor }} onClick={imprimirEtiquetas}>
                      {t('labels.print')}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-gray-50 px-4 py-3">
                  <Checkbox
                    checked={colaVisible.length > 0 && colaVisible.every(({ index }) => etiquetasSeleccionadas.includes(index))}
                    onCheckedChange={toggleSeleccionVisible}
                  />
                  <span className="text-sm text-[#374151]">{t('labels.selectVisible', { count: formatQuantity(colaVisible.length) })}</span>
                  <div className="h-6 w-px bg-gray-300" />
                  <Badge variant="outline">{t('labels.selectedCount', { count: formatQuantity(etiquetasSeleccionadas.length) })}</Badge>
                  <Button variant="outline" size="sm" disabled={etiquetasSeleccionadas.length === 0} onClick={duplicarSeleccionadas}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('labels.duplicate')}
                  </Button>
                  <Button variant="outline" size="sm" disabled={etiquetasSeleccionadas.length === 0} className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={eliminarSeleccionadas}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('labels.delete')}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {vistaPrevia && etiquetasParaAccion.length > 0 ? (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5" style={{ color: branding.primaryColor }} />
                    {t('labels.previewLabels')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VistaImpresion etiquetas={etiquetasParaAccion} tamano={tamanoEtiqueta} formato={formatoCodigo} columnas={columnasImpresion} />
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {colaVisible.map(({ etiqueta, index }) => (
                <Card
                  key={`${etiqueta.tipo}-${index}`}
                  className={`border-0 shadow-lg transition-all ${etiquetasSeleccionadas.includes(index) ? 'ring-2 ring-offset-2' : ''}`}
                  style={etiquetasSeleccionadas.includes(index) ? { borderColor: branding.primaryColor } : undefined}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={etiquetasSeleccionadas.includes(index)} onCheckedChange={() => toggleSeleccion(index)} />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{etiqueta.icono || '🏷️'}</span>
                              <div>
                                <p className="truncate text-base font-semibold text-[#111827]">{etiqueta.titulo}</p>
                                <p className="truncate text-sm text-[#666666]">{etiqueta.subtitulo || etiqueta.codigo}</p>
                              </div>
                            </div>
                          </div>
                          <Badge variant={etiqueta.tipo === 'ubicacion' ? 'outline' : 'secondary'}>
                            {etiqueta.tipo === 'ubicacion' ? t('labels.location') : t('labels.product')}
                          </Badge>
                        </div>

                        <div className="space-y-2 rounded-2xl bg-gray-50 p-3 text-sm">
                          <p className="font-mono text-xs text-[#4b5563] break-all">{etiqueta.codigo}</p>
                          {etiqueta.descripcion ? <p className="text-[#666666]">{etiqueta.descripcion}</p> : null}
                          {etiqueta.categoria ? <p className="text-[#666666]">{t('labels.category')}: {getCategoriaLabel(etiqueta.categoria)}</p> : null}
                          {etiqueta.lote ? <p className="text-[#666666]">{t('labels.lot')}: {etiqueta.lote}</p> : null}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {colaVisible.length === 0 ? (
                <Card className="col-span-full border-0 shadow-lg">
                  <CardContent className="py-12 text-center text-[#666666]">
                    <Tag className="mx-auto mb-3 h-12 w-12 text-[#cbd5e1]" />
                    <p>{t('labels.noLabelsInQueueForFilter')}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
