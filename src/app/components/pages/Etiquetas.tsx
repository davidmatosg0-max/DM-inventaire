import React, { useEffect, useMemo, useState } from 'react';
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
      return 'Sin categoría';
    }

    return categoriasInfo[categoria]?.label || categoria;
  };

  const getSectionTypeLabel = (metadata?: LocationMeta | null) => {
    if (!metadata) {
      return 'Ubicación de inventario';
    }

    if (!metadata.configurada) {
      return 'Ubicación fuera de la configuración actual';
    }

    return metadata.tipoZona;
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
      toast.error('El código de zona es obligatorio.');
      return;
    }

    if (!/^[A-Z0-9]{1,3}$/.test(codigoZona)) {
      toast.error('Usa entre 1 y 3 caracteres alfanuméricos para la zona.');
      return;
    }

    if (editingZoneCode && codigoZona !== editingZoneCode && zonas.some((zona) => zona.zona === codigoZona)) {
      toast.error(`La zona ${codigoZona} ya existe.`);
      return;
    }

    if (!editingZoneCode && zonas.some((zona) => zona.zona === codigoZona)) {
      toast.error(`La zona ${codigoZona} ya existe.`);
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
      toast.error(`Conflicto detectado: ${example.ubicacion} sería generada por ${example.zonas.join(', ')}.`);
      return;
    }

    if (editingZoneCode) {
      const previousZone = zonas.find((zona) => zona.zona === editingZoneCode);
      if (previousZone) {
        const usedCodes = getLocationUsageForZone(previousZone);
        const nextCodes = new Set(buildLocationCodesForZone(updatedZone));
        const invalidated = usedCodes.filter((codigo) => !nextCodes.has(codigo));

        if (invalidated.length > 0) {
          toast.error(`No se puede guardar. Estas ubicaciones ya están en uso: ${invalidated.join(', ')}.`);
          return;
        }
      }
    }

    persistZones(nextZones);
    toast.success(editingZoneCode ? `Zona ${codigoZona} actualizada.` : `Zona ${codigoZona} creada.`);
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
      toast.error(`No se puede eliminar la zona ${zoneCode}. Ubicaciones en uso: ${usedCodes.join(', ')}.`);
      return;
    }

    if (!window.confirm(`¿Eliminar la zona ${zoneCode}? Esta acción no se puede deshacer.`)) {
      return;
    }

    persistZones(zonas.filter((item) => item.zona !== zoneCode));
    toast.success(`Zona ${zoneCode} eliminada.`);
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
        ? `${metadata.tipoZona} · Zona ${metadata.codigoZona}`
        : 'Ubicación heredada · Fuera de la configuración actual'
      : 'Ubicación de inventario';

    return {
      tipo: 'ubicacion',
      titulo: 'UBICACIÓN',
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
      toast.error('No hay nuevas etiquetas de ubicación para agregar.');
      return 0;
    }

    setColaEtiquetas((current) => [...current, ...newLabels]);
    toast.success(`${formatQuantity(newLabels.length)} etiquetas de ubicación agregadas a la cola.`);
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
      descripcion: `${getCategoriaLabel(producto.categoria)}${ubicacion ? ` · Ubicación ${ubicacion}` : ' · Sin ubicación'}`,
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
      toast.error('No hay nuevas etiquetas de producto para agregar.');
      return 0;
    }

    setColaEtiquetas((current) => [...current, ...newLabels]);
    toast.success(`${formatQuantity(newLabels.length)} etiquetas de producto agregadas a la cola.`);
    return newLabels.length;
  };

  const handleAddZoneLocationLabels = (zoneCode: string, onlyOccupied: boolean) => {
    const zone = zonas.find((item) => item.zona === zoneCode);
    if (!zone) {
      return;
    }

    const codes = buildLocationCodesForZone(zone).filter((codigo) => !onlyOccupied || ubicacionesOcupadas.has(codigo));
    if (codes.length === 0) {
      toast.error(`La zona ${zoneCode} no tiene ubicaciones para esa acción.`);
      return;
    }

    addLocationLabels(codes);
  };

  const handleAddLocationProductLabels = (locationCode: string) => {
    const productos = productosPorUbicacion.get(locationCode) || [];
    if (productos.length === 0) {
      toast.error(`La ubicación ${locationCode} no tiene productos asociados.`);
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
      toast.error('Selecciona al menos una etiqueta.');
      return;
    }

    const selectedSet = new Set(etiquetasSeleccionadas);
    setColaEtiquetas((current) => current.filter((_, index) => !selectedSet.has(index)));
    setEtiquetasSeleccionadas([]);
    toast.success('Etiquetas eliminadas de la cola.');
  };

  const duplicarSeleccionadas = () => {
    if (etiquetasSeleccionadas.length === 0) {
      toast.error('Selecciona al menos una etiqueta.');
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
      toast.error('No hay etiquetas para imprimir.');
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
          translations: {
            foodBank: 'BANCO DE ALIMENTOS',
            productLabel: 'Etiqueta del producto',
            quantity: 'CANTIDAD',
            temperature: 'TEMPERATURA',
            lot: 'LOTE',
            expiryDate: 'CADUCIDAD',
            weight: 'PESO',
            program: 'PROGRAMA',
            donor: 'DONANTE',
            entryDate: 'FECHA DE ENTRADA',
            systemFooter: 'Sistema de gestión de inventario',
            ambient: 'Ambiente',
            refrigerated: 'Refrigerado',
            frozen: 'Congelado',
            packagingDetails: 'Detalles del empaque',
          },
        };

        printStandardLabel(labelData).catch((error) => {
          console.error('Error al imprimir etiqueta de producto:', error);
          toast.error(`No se pudo imprimir ${producto.nombre}.`);
        });
      });

      if (preparadas > 0) {
        toast.success(`${formatQuantity(preparadas)} etiquetas de producto enviadas a impresión.`);
      }

      if (omitidas > 0) {
        toast.error(`${formatQuantity(omitidas)} etiquetas de producto se omitieron porque el producto ya no existe.`);
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
        <html lang="es">
          <head>
            <meta charset="UTF-8" />
            <title>Impresión de ubicaciones</title>
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
                    ${etiqueta.qrImage ? `<img src="${etiqueta.qrImage}" alt="QR ${etiqueta.subtitulo || etiqueta.codigo}" />` : ''}
                    <div class="qr-code">${etiqueta.subtitulo || etiqueta.codigo}</div>
                  </div>
                  <div class="footer">
                    ${etiqueta.descripcion || ''}
                    <div class="system">Banco de Alimentos · Sistema de inventario</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `, { width: 1100, height: 800, printDelayMs: 300 });
    } catch (error) {
      toast.error('No se pudo abrir la ventana de impresión.');
      return;
    }

    toast.success(`${formatQuantity(etiquetasUbicacion.length)} etiquetas de ubicación enviadas a impresión.`);
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
                    Etiquetas coherentes con inventario
                  </h1>
                  <p className="text-sm text-[#666666]">
                    Las ubicaciones salen de la misma configuración que usan los productos y el inventario. Aquí gestionas zonas, generas etiquetas por ubicación y preparas la impresión desde una cola única.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: branding.primaryColor }}>
                {formatQuantity(zonas.length)} zonas activas
              </Badge>
              <Badge className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: branding.secondaryColor }}>
                {formatQuantity(colaEtiquetas.length)} etiquetas en cola
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Zonas configuradas"
            value={formatQuantity(zonas.length)}
            subtitle="Fuente maestra de ubicaciones"
            icon={<Settings className="h-5 w-5" />}
            accent={branding.primaryColor}
          />
          <MetricCard
            title="Ubicaciones estándar"
            value={formatQuantity(totalUbicacionesConfiguradas)}
            subtitle="Capacidad definida en Etiquetas"
            icon={<LayoutGrid className="h-5 w-5" />}
            accent={branding.secondaryColor}
          />
          <MetricCard
            title="Ubicaciones ocupadas"
            value={formatQuantity(ubicacionesOcupadas.size)}
            subtitle="Con productos reales asignados"
            icon={<MapPin className="h-5 w-5" />}
            accent="#f59e0b"
          />
          <MetricCard
            title="Productos sin ubicación"
            value={formatQuantity(productosSinUbicacion.length)}
            subtitle="Pendientes de ubicación coherente"
            icon={<Package className="h-5 w-5" />}
            accent="#dc2626"
          />
        </div>

        <Tabs defaultValue="ubicaciones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md">
            <TabsTrigger value="ubicaciones">
              <MapPin className="mr-2 h-4 w-4" />
              Ubicaciones
            </TabsTrigger>
            <TabsTrigger value="productos">
              <Package className="mr-2 h-4 w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="cola">
              <Printer className="mr-2 h-4 w-4" />
              Cola de impresión
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ubicaciones" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5" style={{ color: branding.primaryColor }} />
                      {editingZoneCode ? `Editar zona ${editingZoneCode}` : 'Configurar zona'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Código</Label>
                      <Input
                        placeholder="A, B, C..."
                        maxLength={3}
                        value={zoneForm.zona}
                        onChange={(event) => setZoneForm((current) => ({ ...current, zona: event.target.value.toUpperCase() }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={zoneForm.tipo} onValueChange={(value) => setZoneForm((current) => ({ ...current, tipo: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Capacidad</Label>
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
                        <p className="text-xs uppercase tracking-wide text-[#666666]">Vista previa</p>
                        <p className="mt-1 text-lg font-semibold" style={{ color: branding.primaryColor }}>
                          Zona {zoneForm.zona.trim().toUpperCase()} · {zoneForm.tipo}
                        </p>
                        <p className="text-sm text-[#666666]">
                          {buildLocationRangeLabel({ zona: zoneForm.zona.trim().toUpperCase(), tipo: zoneForm.tipo, cantidad: Math.max(1, Math.round(zoneForm.cantidad)) })}
                        </p>
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                      {editingZoneCode ? (
                        <Button variant="outline" className="flex-1" onClick={resetZoneForm}>
                          Cancelar edición
                        </Button>
                      ) : null}
                      <Button
                        className="flex-1 text-white"
                        style={{ backgroundColor: branding.primaryColor }}
                        onClick={handleSaveZone}
                      >
                        {editingZoneCode ? 'Guardar zona' : 'Crear zona'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <List className="h-5 w-5" style={{ color: branding.secondaryColor }} />
                      Resumen por zona
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resumenZonas.map((zona) => (
                      <div key={zona.zona} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-[#1f2937]">Zona {zona.zona}</p>
                            <p className="text-sm text-[#666666]">{zona.tipo}</p>
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
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{formatQuantity(zona.cantidad)} ubicaciones</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{formatQuantity(zona.ocupadas)} ocupadas</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{formatQuantity(zona.etiquetadas)} ya en cola</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2">{formatQuantity(zona.productos)} productos</div>
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
                      Mapa de ubicaciones
                    </CardTitle>
                    <p className="text-sm text-[#666666]">
                      Cada ubicación muestra sus productos reales y permite generar etiquetas de ubicación o de producto sin salir de esta vista.
                    </p>
                  </div>

                  <div className="w-full lg:max-w-xs">
                    <Label className="mb-2 block text-xs uppercase tracking-wide text-[#666666]">Filtrar zona</Label>
                    <Select value={filtroZonaUbicaciones} onValueChange={setFiltroZonaUbicaciones}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_ZONES_VALUE}>Todas las zonas</SelectItem>
                        {seccionesUbicacion.map((seccion) => (
                          <SelectItem key={seccion.codigoZona} value={seccion.codigoZona}>
                            {seccion.codigoZona === 'AUTRES' ? 'Ubicaciones heredadas' : `Zona ${seccion.codigoZona}`}
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
                                {isConfiguredZone ? `Zona ${seccion.codigoZona}` : 'Ubicaciones heredadas'}
                              </h3>
                              <Badge variant="outline">
                                {isConfiguredZone ? seccion.tipoZona : 'Fuera de configuración'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-[#666666]">
                              {isConfiguredZone && zoneSummary
                                ? `${formatQuantity(zoneSummary.cantidad)} ubicaciones · ${formatQuantity(zoneSummary.ocupadas)} ocupadas · ${formatQuantity(zoneSummary.productos)} productos`
                                : `${formatQuantity(seccion.ubicaciones.length)} ubicaciones provenientes de productos fuera de la configuración actual`}
                            </p>
                          </div>

                          {isConfiguredZone ? (
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" onClick={() => handleAddZoneLocationLabels(seccion.codigoZona, true)}>
                                Etiquetar ocupadas
                              </Button>
                              <Button className="text-white" style={{ backgroundColor: branding.secondaryColor }} onClick={() => handleAddZoneLocationLabels(seccion.codigoZona, false)}>
                                Etiquetar zona completa
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
                                      {queued ? <Badge style={{ backgroundColor: branding.primaryColor }}>En cola</Badge> : null}
                                      {productos.length > 0 ? <Badge variant="outline">{formatQuantity(productos.length)} productos</Badge> : <Badge variant="secondary">Vacía</Badge>}
                                    </div>
                                    <p className="text-sm text-[#666666]">{getSectionTypeLabel(metaUbicacion.get(ubicacion))}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={queued} onClick={() => addLocationLabels([ubicacion])}>
                                      <MapPin className="mr-1 h-4 w-4" />
                                      Ubicación
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="text-white"
                                      style={{ backgroundColor: branding.secondaryColor }}
                                      disabled={productos.length === 0}
                                      onClick={() => handleAddLocationProductLabels(ubicacion)}
                                    >
                                      <Package className="mr-1 h-4 w-4" />
                                      Productos
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                  {productos.length === 0 ? (
                                    <p className="text-sm text-[#999999]">Sin productos asignados.</p>
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
                                    <p className="text-xs text-[#999999]">+ {formatQuantity(productos.length - 3)} productos más</p>
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
                  Filtrar productos para etiquetas
                </CardTitle>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px_auto]">
                  <div className="space-y-2">
                    <Label>Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
                      <Input className="pl-9" placeholder="Nombre, código, categoría o ubicación" value={busquedaProducto} onChange={(event) => setBusquedaProducto(event.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Select value={filtroUbicacionProducto} onValueChange={setFiltroUbicacionProducto}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_LOCATIONS_VALUE}>Todas las ubicaciones</SelectItem>
                        <SelectItem value={WITHOUT_LOCATION_VALUE}>Sin ubicación</SelectItem>
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
                      Etiquetar filtrados
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
                        {queued ? <Badge style={{ backgroundColor: branding.primaryColor }}>En cola</Badge> : null}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">Categoría</p>
                          <p className="truncate font-medium text-[#1f2937]">{getCategoriaLabel(producto.categoria)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">Ubicación</p>
                          <p className="truncate font-medium text-[#1f2937]">{ubicacion || 'Sin ubicación'}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">Stock</p>
                          <p className="font-medium text-[#1f2937]">{formatQuantity(producto.stockActual)} {producto.unidad}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-[#999999]">Lote</p>
                          <p className="truncate font-medium text-[#1f2937]">{producto.lote || 'Sin lote'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 text-white" style={{ backgroundColor: branding.primaryColor }} disabled={queued} onClick={() => addProductLabels([producto.id])}>
                          Crear etiqueta
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
                    <p>No hay productos para el filtro actual.</p>
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
                  Preparar impresión
                </CardTitle>

                <div className="grid gap-4 xl:grid-cols-[220px_220px_220px_140px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    <Label>Filtro de cola</Label>
                    <Select value={filtroCola} onValueChange={(value) => setFiltroCola(value as QueueFilter)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="ubicacion">Ubicaciones</SelectItem>
                        <SelectItem value="producto">Productos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamaño</Label>
                    <Select value={tamanoEtiqueta} onValueChange={(value) => setTamanoEtiqueta(value as LabelSize)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pequena">Pequeña</SelectItem>
                        <SelectItem value="mediana">Mediana</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato</Label>
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
                    <Label>Columnas</Label>
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
                      {vistaPrevia ? 'Ocultar vista previa' : 'Ver vista previa'}
                    </Button>
                    <Button className="text-white" style={{ backgroundColor: branding.secondaryColor }} onClick={imprimirEtiquetas}>
                      Imprimir
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-gray-50 px-4 py-3">
                  <Checkbox
                    checked={colaVisible.length > 0 && colaVisible.every(({ index }) => etiquetasSeleccionadas.includes(index))}
                    onCheckedChange={toggleSeleccionVisible}
                  />
                  <span className="text-sm text-[#374151]">Seleccionar visibles ({formatQuantity(colaVisible.length)})</span>
                  <div className="h-6 w-px bg-gray-300" />
                  <Badge variant="outline">{formatQuantity(etiquetasSeleccionadas.length)} seleccionadas</Badge>
                  <Button variant="outline" size="sm" disabled={etiquetasSeleccionadas.length === 0} onClick={duplicarSeleccionadas}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </Button>
                  <Button variant="outline" size="sm" disabled={etiquetasSeleccionadas.length === 0} className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={eliminarSeleccionadas}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {vistaPrevia && etiquetasParaAccion.length > 0 ? (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5" style={{ color: branding.primaryColor }} />
                    Vista previa de impresión
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
                            {etiqueta.tipo === 'ubicacion' ? 'Ubicación' : 'Producto'}
                          </Badge>
                        </div>

                        <div className="space-y-2 rounded-2xl bg-gray-50 p-3 text-sm">
                          <p className="font-mono text-xs text-[#4b5563] break-all">{etiqueta.codigo}</p>
                          {etiqueta.descripcion ? <p className="text-[#666666]">{etiqueta.descripcion}</p> : null}
                          {etiqueta.categoria ? <p className="text-[#666666]">Categoría: {getCategoriaLabel(etiqueta.categoria)}</p> : null}
                          {etiqueta.lote ? <p className="text-[#666666]">Lote: {etiqueta.lote}</p> : null}
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
                    <p>No hay etiquetas en la cola para este filtro.</p>
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
