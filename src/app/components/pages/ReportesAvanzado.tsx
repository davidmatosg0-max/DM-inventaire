import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Truck,
  FileSpreadsheet,
  Filter,
  ArrowUp,
  ArrowDown,
  Activity,
  RefreshCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { toast } from 'sonner';
import { formatQuantity } from '../../utils/formatUtils';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { obtenerProductos, type ProductoCreado } from '../../utils/productStorage';
import { obtenerComandas } from '../../utils/comandaStorage';
import { obtenerOrganismos, obtenerOrganismosPRS, type Organismo } from '../../utils/organismosStorage';
import { obtenerMovimientos, type MovimientoExtendido } from '../../utils/movimientoStorage';
import { obtenerTransformaciones, type Transformacion } from '../../utils/recetaStorage';
import { obtenerRutas, obtenerVehiculos, obtenerChoferes, type Ruta, type Vehiculo, type Chofer } from '../../utils/transporteLogic';
import { exportarComandasPDF, exportarInventarioPDF, exportarOrganismosPDF, exportarReportePersonalizado } from '../../utils/exportarPDF';
import { exportarComandasExcel, exportarDatosPersonalizados, exportarInventarioExcel, exportarOrganismosExcel } from '../../utils/exportarExcel';
import { obtenerEtiquetaModalidadDistribucion, resolverModalidadDistribucionComanda } from '../../utils/comandaDistributionMode';
import { obtenerReportePRSRemoto } from '../../utils/remoteReports';
import type { Comanda } from '../../types';

type TipoReporte = 'general' | 'inventario' | 'comandas' | 'prs' | 'organismos' | 'transporte';
type PeriodoComparacion = 'dia' | 'semana' | 'mes' | 'anio';
type DatePreset = 'today' | 'last7days' | 'last30days' | 'month' | 'year';
type MovimientoReporte = MovimientoExtendido & {
  fecha?: string;
  productoId?: string;
  cantidad?: number;
  productoNombre?: string;
};
type ComandaExportable = Comanda & {
  organismo?: {
    nombre?: string;
  };
  modalidadDistribucionLabel?: string;
};
type RemotePRSReport = {
  resumen: {
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstime: number;
    donadoresUnicos: number;
    productosUnicos: number;
    organismosUnicos: number;
    participantesPRSUnicos: number;
  };
  porOrganismo: Array<{
    organismoId: string;
    organismoNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstime: number;
  }>;
  porDonador: Array<{
    donadorId: string;
    donadorNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstime: number;
  }>;
  generadoEn: string;
};

const REPORT_OPTIONS: Array<{ value: TipoReporte; label: string; description: string }> = [
  { value: 'general', label: 'Résumé exécutif', description: 'Vue synthétique des indicateurs clés et des écarts.' },
  { value: 'inventario', label: 'Inventaire détaillé', description: 'Stock réel, catégories et mouvements sur la période.' },
  { value: 'comandas', label: 'Commandes et distribution', description: 'Exécution, volume et statut des commandes.' },
  { value: 'prs', label: 'Cuisine et PRS', description: 'Transformations, kilos produits et participation PRS.' },
  { value: 'organismos', label: 'Organismes et bénéficiaires', description: 'Couverture, volume desservi et activité des organismes.' },
  { value: 'transporte', label: 'Logistique et transport', description: 'Routes, flotte, chauffeurs et capacité livrée.' },
];

const PERIOD_LABELS: Record<PeriodoComparacion, string> = {
  dia: 'Jour précédent',
  semana: 'Semaine précédente',
  mes: 'Mois précédent',
  anio: 'Année précédente',
};

const DATE_PRESET_OPTIONS: Array<{ value: DatePreset; label: string }> = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'last7days', label: '7 derniers jours' },
  { value: 'last30days', label: '30 derniers jours' },
  { value: 'month', label: 'Mois en cours' },
  { value: 'year', label: 'Année en cours' },
];

const COLORS = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#9C27B0', '#00BCD4'];

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDatePresetRange(preset: DatePreset): { start: string; end: string } {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);

  if (preset === 'last7days') {
    start.setDate(start.getDate() - 6);
  }

  if (preset === 'last30days') {
    start.setDate(start.getDate() - 29);
  }

  if (preset === 'month') {
    start.setDate(1);
  }

  if (preset === 'year') {
    start.setMonth(0, 1);
  }

  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
  };
}

function parseDateValue(value: string, endOfDay = false): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
}

function isDateInRange(value: string | undefined, start: Date | null, end: Date | null): boolean {
  if (!value || !start || !end) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date >= start && date <= end;
}

function shiftDate(base: Date, comparison: PeriodoComparacion): Date {
  const date = new Date(base);

  if (comparison === 'dia') date.setDate(date.getDate() - 1);
  if (comparison === 'semana') date.setDate(date.getDate() - 7);
  if (comparison === 'mes') date.setMonth(date.getMonth() - 1);
  if (comparison === 'anio') date.setFullYear(date.getFullYear() - 1);

  return date;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function calculatePercent(part: number, total: number): number {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

function calculateVariation(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function getMonthBuckets(reference: Date, count = 6): Array<{ key: string; label: string }> {
  const buckets: Array<{ key: string; label: string }> = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('fr-CA', { month: 'short' });
    buckets.push({ key, label });
  }

  return buckets;
}

function getMonthKey(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getProductWeight(producto: ProductoCreado): number {
  if (producto.unidad === 'kg') {
    return producto.stockActual;
  }

  if (producto.pesoRegistrado && producto.pesoRegistrado > 0) {
    return producto.pesoRegistrado;
  }

  const pesoUnitario = producto.pesoUnitario ?? producto.peso ?? 0;
  return pesoUnitario > 0 ? pesoUnitario * producto.stockActual : producto.stockActual;
}

function renderEmptyState(message: string) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      {message}
    </div>
  );
}

export function ReportesAvanzado() {
  const { t } = useTranslation();
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('general');
  const [fechaInicio, setFechaInicio] = useState('2025-01-01');
  const [fechaFin, setFechaFin] = useState('2025-01-31');
  const [periodoComparacion, setPeriodoComparacion] = useState<PeriodoComparacion>('mes');
  const [productos, setProductos] = useState<ProductoCreado[]>([]);
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoExtendido[]>([]);
  const [transformaciones, setTransformaciones] = useState<Transformacion[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(null);
  const [remotePrsReport, setRemotePrsReport] = useState<RemotePRSReport | null>(null);
  const [remotePrsStatus, setRemotePrsStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle');
  const [remotePrsError, setRemotePrsError] = useState('');
  const [isDownloadingRemotePrs, setIsDownloadingRemotePrs] = useState(false);

  const cargarDatos = () => {
    setProductos(obtenerProductos());
    setComandas(obtenerComandas());
    setOrganismos(obtenerOrganismos());
    setMovimientos(obtenerMovimientos());
    setTransformaciones(obtenerTransformaciones());
    setRutas(obtenerRutas());
    setVehiculos(obtenerVehiculos());
    setChoferes(obtenerChoferes());
    setUltimaActualizacion(new Date().toISOString());
  };

  useEffect(() => {
    cargarDatos();

    const handleStorage = () => cargarDatos();
    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (tipoReporte !== 'prs' || !rangoValido) {
      return;
    }

    void cargarReportePRSRemoto(false);
  }, [tipoReporte, fechaInicio, fechaFin, rangoValido]);

  const rangoInicio = parseDateValue(fechaInicio);
  const rangoFin = parseDateValue(fechaFin, true);
  const rangoValido = Boolean(rangoInicio && rangoFin && rangoInicio <= rangoFin);
  const referenciaFin = rangoFin ?? new Date();
  const comparacionInicio = rangoInicio ? shiftDate(rangoInicio, periodoComparacion) : null;
  const comparacionFin = rangoFin ? shiftDate(rangoFin, periodoComparacion) : null;
  const movimientosReporte = movimientos as MovimientoReporte[];

  const comandasFiltradas = rangoValido
    ? comandas.filter((comanda) => isDateInRange(comanda.fechaEntrega || comanda.fechaCreacion || comanda.fecha, rangoInicio, rangoFin))
    : [];
  const comandasComparacion = rangoValido
    ? comandas.filter((comanda) => isDateInRange(comanda.fechaEntrega || comanda.fechaCreacion || comanda.fecha, comparacionInicio, comparacionFin))
    : [];
  const movimientosFiltrados = rangoValido
    ? movimientosReporte.filter((movimiento) => isDateInRange(movimiento.fecha, rangoInicio, rangoFin))
    : [];
  const movimientosComparacion = rangoValido
    ? movimientosReporte.filter((movimiento) => isDateInRange(movimiento.fecha, comparacionInicio, comparacionFin))
    : [];
  const transformacionesFiltradas = rangoValido
    ? transformaciones.filter((transformacion) => isDateInRange(transformacion.fecha, rangoInicio, rangoFin))
    : [];
  const transformacionesComparacion = rangoValido
    ? transformaciones.filter((transformacion) => isDateInRange(transformacion.fecha, comparacionInicio, comparacionFin))
    : [];
  const rutasFiltradas = rangoValido
    ? rutas.filter((ruta) => isDateInRange(ruta.fechaEntrega || ruta.fecha, rangoInicio, rangoFin))
    : [];
  const rutasComparacion = rangoValido
    ? rutas.filter((ruta) => isDateInRange(ruta.fechaEntrega || ruta.fecha, comparacionInicio, comparacionFin))
    : [];

  const organismosPorId = new Map(organismos.map((organismo) => [organismo.id, organismo]));
  const totalBeneficiariosSistema = organismos.reduce((sum, organismo) => sum + organismo.beneficiarios, 0);
  const comandasAceptadas = comandasFiltradas.filter((comanda) => comanda.estado === 'confirmada').length;
  const comandasCompletadas = comandasFiltradas.filter((comanda) => ['completada', 'entregada'].includes(comanda.estado)).length;
  const comandasCompletadasComparacion = comandasComparacion.filter((comanda) => ['completada', 'entregada'].includes(comanda.estado)).length;
  const tasaCumplimiento = calculatePercent(comandasCompletadas, comandasFiltradas.length);
  const tasaCumplimientoComparacion = calculatePercent(comandasCompletadasComparacion, comandasComparacion.length);

  const productoIdsConActividad = new Set(movimientosFiltrados.map((movimiento) => movimiento.productoId).filter(Boolean));
  const productoIdsConActividadComparacion = new Set(movimientosComparacion.map((movimiento) => movimiento.productoId).filter(Boolean));
  const productosSeguidos = productoIdsConActividad.size || productos.length;
  const productosSeguidosComparacion = productoIdsConActividadComparacion.size || productos.length;

  const organismoIdsServidos = Array.from(new Set(comandasFiltradas.map((comanda) => comanda.organismoId).filter(Boolean)));
  const organismoIdsServidosComparacion = Array.from(new Set(comandasComparacion.map((comanda) => comanda.organismoId).filter(Boolean)));
  const beneficiariosCubiertos = organismoIdsServidos.reduce(
    (sum, organismoId) => sum + (organismosPorId.get(organismoId)?.beneficiarios || 0),
    0
  );
  const beneficiariosCubiertosComparacion = organismoIdsServidosComparacion.reduce(
    (sum, organismoId) => sum + (organismosPorId.get(organismoId)?.beneficiarios || 0),
    0
  );

  const transformacionesTerminadas = transformacionesFiltradas.filter((transformacion) => transformacion.estado === 'terminée');
  const transformacionesTerminadasComparacion = transformacionesComparacion.filter((transformacion) => transformacion.estado === 'terminée');
  const totalKgPRS = transformacionesTerminadas.reduce(
    (sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0),
    0
  );
  const totalKgPRSComparacion = transformacionesTerminadasComparacion.reduce(
    (sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0),
    0
  );

  const rutasCompletadas = rutasFiltradas.filter((ruta) => ruta.estado === 'completada').length;
  const rutasCompletadasComparacion = rutasComparacion.filter((ruta) => ruta.estado === 'completada').length;
  const tasaLogistica = calculatePercent(rutasCompletadas, rutasFiltradas.length);
  const pesoInventario = productos.reduce((sum, producto) => sum + getProductWeight(producto), 0);
  const rotacionInventario = calculatePercent(productoIdsConActividad.size, productos.length || 0);
  const eficienciaCuisine = calculatePercent(transformacionesTerminadas.length, transformacionesFiltradas.length || 0);
  const couvertureBeneficiaires = calculatePercent(beneficiariosCubiertos, totalBeneficiariosSistema || 0);

  const datosRendimiento = [
    { metrica: 'Conformité', valor: clampPercent(tasaCumplimiento) },
    { metrica: 'Rotation', valor: clampPercent(rotacionInventario) },
    { metrica: 'Cuisine', valor: clampPercent(eficienciaCuisine) },
    { metrica: 'Couverture', valor: clampPercent(couvertureBeneficiaires) },
    { metrica: 'Logistique', valor: clampPercent(tasaLogistica) },
  ];

  const datosInventarioCategoria = Array.from(
    productos.reduce((mapa, producto) => {
      const categoria = producto.categoria || 'Sans catégorie';
      const actual = mapa.get(categoria) || { categoria, stock: 0, productos: 0 };
      actual.stock += getProductWeight(producto);
      actual.productos += 1;
      mapa.set(categoria, actual);
      return mapa;
    }, new Map<string, { categoria: string; stock: number; productos: number }>())
  )
    .map(([, value]) => ({ ...value, stock: Number(value.stock.toFixed(1)) }))
    .sort((a, b) => b.stock - a.stock);

  const monthBuckets = getMonthBuckets(referenciaFin, 6);
  const datosComandasMes = monthBuckets.map((bucket) => {
    const delMes = comandas.filter((comanda) => getMonthKey(comanda.fechaEntrega || comanda.fechaCreacion || comanda.fecha) === bucket.key);
    return {
      mes: bucket.label,
      comandas: delMes.length,
      completadas: delMes.filter((comanda) => ['completada', 'entregada'].includes(comanda.estado)).length,
      canceladas: delMes.filter((comanda) => comanda.estado === 'anulada').length,
    };
  });

  const datosPRSMes = monthBuckets.map((bucket) => {
    const delMes = transformaciones.filter((transformacion) => getMonthKey(transformacion.fecha) === bucket.key && transformacion.estado === 'terminée');
    return {
      mes: bucket.label,
      kg: Number(
        delMes
          .reduce((sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0), 0)
          .toFixed(1)
      ),
      rescates: delMes.length,
    };
  });

  const datosMovimientos = [
    { tipo: 'Entrees', cantidad: movimientosFiltrados.filter((movimiento) => movimiento.tipo === 'entrada').length, color: '#4CAF50' },
    { tipo: 'Sorties', cantidad: movimientosFiltrados.filter((movimiento) => ['salida', 'distribucion', 'distribucion_completada'].includes(movimiento.tipo)).length, color: '#DC3545' },
    { tipo: 'Transformations', cantidad: movimientosFiltrados.filter((movimiento) => movimiento.tipo === 'transformacion').length, color: '#1E73BE' },
    { tipo: 'Corrections', cantidad: movimientosFiltrados.filter((movimiento) => ['correccion', 'ajuste_stock'].includes(movimiento.tipo)).length, color: '#FFC107' },
  ].filter((entry) => entry.cantidad > 0);

  const datosOrganismosBeneficiarios = organismos
    .map((organismo) => ({
      nombre: organismo.nombre.length > 20 ? `${organismo.nombre.slice(0, 20)}...` : organismo.nombre,
      beneficiarios: organismo.beneficiarios,
      activo: organismo.activo,
    }))
    .sort((a, b) => b.beneficiarios - a.beneficiarios)
    .slice(0, 10);

  const productoNombrePorId = new Map(productos.map((producto) => [producto.id, producto.nombre]));
  const topProductos = Array.from(
    movimientosFiltrados
      .filter((movimiento) => ['salida', 'distribucion', 'distribucion_completada'].includes(movimiento.tipo))
      .reduce((mapa, movimiento) => {
        if (!movimiento.productoId) return mapa;
        const nombre = productoNombrePorId.get(movimiento.productoId) || movimiento.productoNombre || 'Produit inconnu';
        const actual = mapa.get(movimiento.productoId) || { nombre, distribuido: 0 };
        actual.distribuido += Math.abs(Number(movimiento.cantidad) || 0);
        mapa.set(movimiento.productoId, actual);
        return mapa;
      }, new Map<string, { nombre: string; distribuido: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.distribuido - a.distribuido)
    .slice(0, 5);

  const datosRutasEstado = [
    { estado: 'Planifiees', cantidad: rutasFiltradas.filter((ruta) => ruta.estado === 'planificada').length, color: '#1E73BE' },
    { estado: 'En cours', cantidad: rutasFiltradas.filter((ruta) => ruta.estado === 'en_curso').length, color: '#FFC107' },
    { estado: 'Completees', cantidad: rutasFiltradas.filter((ruta) => ruta.estado === 'completada').length, color: '#4CAF50' },
    { estado: 'Annulees', cantidad: rutasFiltradas.filter((ruta) => ruta.estado === 'cancelada').length, color: '#DC3545' },
  ].filter((entry) => entry.cantidad > 0);

  const datosVehiculosEstado = [
    { estado: 'Disponibles', cantidad: vehiculos.filter((vehiculo) => vehiculo.estado === 'disponible').length, color: '#4CAF50' },
    { estado: 'En route', cantidad: vehiculos.filter((vehiculo) => vehiculo.estado === 'en_ruta').length, color: '#1E73BE' },
    { estado: 'Maintenance', cantidad: vehiculos.filter((vehiculo) => vehiculo.estado === 'mantenimiento').length, color: '#FFC107' },
  ].filter((entry) => entry.cantidad > 0);

  const totalCargaRutas = rutasFiltradas.reduce((sum, ruta) => sum + (ruta.pesoTotalKg || 0), 0);
  const choferesActifs = choferes.filter((chofer) => chofer.estado === 'activo').length;
  const organismosPRS = obtenerOrganismosPRS().length;
  const remotePrsTopOrganism = remotePrsReport?.porOrganismo?.[0];
  const remotePrsTopDonor = remotePrsReport?.porDonador?.[0];
  const remotePrsUpdatedAt = remotePrsReport?.generadoEn
    ? new Date(remotePrsReport.generadoEn).toLocaleString('fr-CA')
    : null;
  const remotePrsStatusMessage = remotePrsStatus === 'loading'
    ? 'Chargement du rapport PRS distant en cours...'
    : remotePrsStatus === 'unavailable'
      ? (remotePrsError || 'Le rapport PRS distant n’est pas disponible pour cette session.')
      : remotePrsStatus === 'error'
        ? (remotePrsError || 'Erreur lors du chargement du rapport PRS distant.')
        : remotePrsStatus === 'idle'
          ? 'Sélectionnez une période valide pour charger le rapport PRS distant.'
          : '';
  const reportMeta = REPORT_OPTIONS.find((option) => option.value === tipoReporte) || REPORT_OPTIONS[0];
  const periodoReporte = `${fechaInicio} au ${fechaFin}`;
  const presetActivo = DATE_PRESET_OPTIONS.find((preset) => {
    const rango = getDatePresetRange(preset.value);
    return rango.start === fechaInicio && rango.end === fechaFin;
  })?.value;
  const volumenReporte = {
    general: `${productosSeguidos} produits suivis`,
    inventario: `${datosInventarioCategoria.length} catégories d'inventaire`,
    comandas: `${comandasFiltradas.length} commandes dans la période`,
    prs: `${formatQuantity(totalKgPRS)} kg produits`,
    organismos: `${organismoIdsServidos.length} organismes desservis`,
    transporte: `${rutasFiltradas.length} routes analysées`,
  }[tipoReporte];

  const comandasExportables: ComandaExportable[] = comandasFiltradas.map((comanda) => ({
    ...comanda,
    organismo: (comanda as ComandaExportable).organismo ?? (comanda.organismoId ? { nombre: organismosPorId.get(comanda.organismoId)?.nombre || 'N/A' } : undefined),
    modalidadDistribucionLabel: obtenerEtiquetaModalidadDistribucion(resolverModalidadDistribucionComanda(comanda)),
  }));

  const organismosReportados = organismoIdsServidos
    .map((organismoId) => organismosPorId.get(organismoId))
    .filter((organismo): organismo is Organismo => Boolean(organismo));

  const organismosExportables = (organismosReportados.length > 0 ? organismosReportados : organismos).map((organismo) => ({
    ...organismo,
    contacto: {
      telefono: organismo.telefono || 'N/A',
      email: organismo.email || 'N/A',
    },
    direccion: {
      calle: organismo.direccion || 'N/A',
      ciudad: organismo.quartier || organismo.zona || 'N/A',
      codigoPostal: organismo.codigoPostal || 'N/A',
    },
  }));

  const resumenGeneralExportable = [
    { Indicateur: 'Rapport actif', Valeur: reportMeta.label },
    { Indicateur: 'Période analysée', Valeur: periodoReporte },
    { Indicateur: 'Produits suivis', Valeur: productosSeguidos },
    { Indicateur: 'Exécution des commandes', Valeur: `${tasaCumplimiento}%` },
    { Indicateur: 'Bénéficiaires couverts', Valeur: beneficiariosCubiertos },
    { Indicateur: 'Production cuisine (kg)', Valeur: formatQuantity(totalKgPRS) },
    { Indicateur: 'Routes analysées', Valeur: rutasFiltradas.length },
    { Indicateur: 'Charge livrée (kg)', Valeur: Number(totalCargaRutas.toFixed(1)) },
  ];

  const detallePRSExportable = transformacionesTerminadas.map((transformacion, index) => ({
    Référence: transformacion.id || `TR-${index + 1}`,
    Date: new Date(transformacion.fecha).toLocaleDateString('fr-CA'),
    'Produits générés': transformacion.productosGenerados.length,
    'Poids total (kg)': Number(
      transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0).toFixed(1)
    ),
    État: transformacion.estado,
  }));

  const detalleTransportExportable = rutasFiltradas.map((ruta) => ({
    'N° route': ruta.numeroRuta || ruta.numero || ruta.id,
    Date: new Date(ruta.fechaEntrega || ruta.fecha).toLocaleDateString('fr-CA'),
    Conducteur: ruta.conductorNombre || ruta.conductor || 'Non assigné',
    Véhicule: ruta.vehiculoMatricula || ruta.vehiculo || 'Non assigné',
    Arrêts: ruta.paradas.length,
    'Charge (kg)': Number((ruta.pesoTotalKg || 0).toFixed(1)),
    'Distance (km)': Number((ruta.distanciaTotalKm ?? ruta.distanciaTotal ?? 0).toFixed(1)),
    État: ruta.estado,
  }));

  const flotteExportable = vehiculos.map((vehiculo) => ({
    Matricule: vehiculo.matricula || vehiculo.placa || 'N/A',
    Type: vehiculo.tipo,
    'Capacité (kg)': vehiculo.capacidadKg,
    'Capacité (m3)': vehiculo.capacidadM3,
    État: vehiculo.estado,
    Actif: vehiculo.activo ? 'Oui' : 'Non',
  }));

  const choferesExportables = choferes.map((chofer) => ({
    Nom: `${chofer.nombre} ${chofer.apellido}`.trim(),
    Téléphone: chofer.telefono,
    Email: chofer.email,
    État: chofer.estado,
    'Années expérience': chofer.experienciaAnios,
  }));

  const renderVariation = (current: number, previous: number) => {
    const variation = calculateVariation(current, previous);

    if (variation === null) {
      return <Badge className="bg-[#1E73BE] text-white">Nouveau</Badge>;
    }

    if (variation === 0) {
      return <span className="text-sm text-[#666666]">0% vs période comparée</span>;
    }

    const positive = variation > 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${positive ? 'text-[#4CAF50]' : 'text-[#DC3545]'}`}>
        {positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        <span>{positive ? '+' : ''}{variation}% vs période comparée</span>
      </div>
    );
  };

  const handleGenerarReporte = (formato: 'pdf' | 'excel') => {
    if (!rangoValido) {
      toast.error('Définissez une plage de dates valide avant de générer un rapport.');
      return;
    }

    const nombreArchivo = `rapport-${tipoReporte}-${fechaInicio}-${fechaFin}.${formato}`;

    try {
      switch (tipoReporte) {
        case 'inventario':
          if (formato === 'pdf') {
            exportarInventarioPDF(productos);
          } else {
            exportarInventarioExcel(productos);
          }
          break;
        case 'comandas':
          if (formato === 'pdf') {
            exportarComandasPDF(comandasExportables);
          } else {
            exportarComandasExcel(comandasExportables);
          }
          break;
        case 'organismos':
          if (formato === 'pdf') {
            exportarOrganismosPDF(organismosExportables);
          } else {
            exportarOrganismosExcel(organismosExportables);
          }
          break;
        case 'prs':
          if (formato === 'pdf') {
            exportarReportePersonalizado('Rapport PRS et cuisine', `Période: ${periodoReporte}`, [
              {
                titulo: 'Résumé PRS',
                columnas: ['Indicateur', 'Valeur'],
                datos: [
                  ['Transformations terminées', String(transformacionesTerminadas.length)],
                  ['Production totale (kg)', formatQuantity(totalKgPRS)],
                  ['Organismes PRS actifs', String(organismosPRS)],
                  ['Comparaison', PERIOD_LABELS[periodoComparacion]],
                ],
              },
              {
                titulo: 'Transformations terminées',
                columnas: ['Référence', 'Date', 'Produits générés', 'Poids total (kg)', 'État'],
                datos: detallePRSExportable.length > 0
                  ? detallePRSExportable.map((item) => [item.Référence, item.Date, item['Produits générés'], item['Poids total (kg)'], item.État])
                  : [['Aucune donnée', '-', '0', '0', '-']],
              },
            ]);
          } else {
            exportarDatosPersonalizados('rapport-prs', [
              { nombre: 'Résumé PRS', datos: resumenGeneralExportable.filter((item) => ['Période analysée', 'Production cuisine (kg)'].includes(String(item.Indicateur))).concat([
                { Indicateur: 'Transformations terminées', Valeur: transformacionesTerminadas.length },
                { Indicateur: 'Organismes PRS actifs', Valeur: organismosPRS },
              ]) },
              { nombre: 'Transformations', datos: detallePRSExportable.length > 0 ? detallePRSExportable : [{ Note: 'Aucune transformation terminée sur la période.' }] },
              { nombre: 'Tendance mensuelle', datos: datosPRSMes.map((item) => ({ Mois: item.mes, 'Production (kg)': item.kg, Transformations: item.rescates })) },
            ]);
          }
          break;
        case 'transporte':
          if (formato === 'pdf') {
            exportarReportePersonalizado('Rapport logistique et transport', `Période: ${periodoReporte}`, [
              {
                titulo: 'Résumé logistique',
                columnas: ['Indicateur', 'Valeur'],
                datos: [
                  ['Routes analysées', String(rutasFiltradas.length)],
                  ['Routes complétées', String(rutasCompletadas)],
                  ['Véhicules disponibles', String(vehiculos.filter((vehiculo) => vehiculo.estado === 'disponible').length)],
                  ['Charge livrée (kg)', formatQuantity(totalCargaRutas)],
                  ['Chauffeurs actifs', String(choferesActifs)],
                ],
              },
              {
                titulo: 'Détail des routes',
                columnas: ['N° route', 'Date', 'Conducteur', 'Véhicule', 'Arrêts', 'Charge (kg)', 'État'],
                datos: detalleTransportExportable.length > 0
                  ? detalleTransportExportable.map((item) => [item['N° route'], item.Date, item.Conducteur, item.Véhicule, item.Arrêts, item['Charge (kg)'], item.État])
                  : [['Aucune donnée', '-', '-', '-', '0', '0', '-']],
              },
            ]);
          } else {
            exportarDatosPersonalizados('rapport-transport', [
              {
                nombre: 'Résumé transport',
                datos: [
                  { Indicateur: 'Période analysée', Valeur: periodoReporte },
                  { Indicateur: 'Routes analysées', Valeur: rutasFiltradas.length },
                  { Indicateur: 'Routes complétées', Valeur: rutasCompletadas },
                  { Indicateur: 'Charge livrée (kg)', Valeur: Number(totalCargaRutas.toFixed(1)) },
                  { Indicateur: 'Chauffeurs actifs', Valeur: choferesActifs },
                ],
              },
              { nombre: 'Routes', datos: detalleTransportExportable.length > 0 ? detalleTransportExportable : [{ Note: 'Aucune route sur la période.' }] },
              { nombre: 'Flotte', datos: flotteExportable.length > 0 ? flotteExportable : [{ Note: 'Aucun véhicule enregistré.' }] },
              { nombre: 'Chauffeurs', datos: choferesExportables.length > 0 ? choferesExportables : [{ Note: 'Aucun chauffeur enregistré.' }] },
            ]);
          }
          break;
        case 'general':
        default:
          if (formato === 'pdf') {
            exportarReportePersonalizado('Rapport exécutif', `Période: ${periodoReporte}`, [
              {
                titulo: 'Résumé opérationnel',
                columnas: ['Indicateur', 'Valeur'],
                datos: resumenGeneralExportable.map((item) => [item.Indicateur, String(item.Valeur)]),
              },
              {
                titulo: 'Commandes mensuelles',
                columnas: ['Mois', 'Commandes', 'Complétées', 'Annulées'],
                datos: datosComandasMes.length > 0
                  ? datosComandasMes.map((item) => [item.mes, item.comandas, item.completadas, item.canceladas])
                  : [['Aucune donnée', '0', '0', '0']],
              },
            ]);
          } else {
            exportarDatosPersonalizados('rapport-general', [
              { nombre: 'Résumé', datos: resumenGeneralExportable },
              {
                nombre: 'Inventaire',
                datos: datosInventarioCategoria.length > 0
                  ? datosInventarioCategoria.map((item) => ({ Catégorie: item.categoria, 'Stock (kg)': item.stock, Produits: item.productos }))
                  : [{ Note: 'Aucune catégorie disponible.' }],
              },
              {
                nombre: 'Commandes mensuelles',
                datos: datosComandasMes.length > 0
                  ? datosComandasMes.map((item) => ({ Mois: item.mes, Commandes: item.comandas, Complétées: item.completadas, Annulées: item.canceladas }))
                  : [{ Note: 'Aucune commande disponible.' }],
              },
            ]);
          }
          break;
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Rapport exporté</span>
          <span className="text-sm text-[#666666]">{nombreArchivo}</span>
          <span className="text-sm text-[#666666]">{volumenReporte}</span>
        </div>,
        { duration: 4000 }
      );
    } catch (error) {
      console.error('Erreur lors de l’export du rapport avancé:', error);
      toast.error('Impossible d’exporter le rapport avancé avec les données actuelles.');
    }
  };

  const handleExportarDatos = () => {
    cargarDatos();
    toast.success('Analyse actualisée à partir des données réelles du système.');
  };

  const handleApplyDatePreset = (preset: DatePreset) => {
    const rango = getDatePresetRange(preset);
    setFechaInicio(rango.start);
    setFechaFin(rango.end);
  };

  const cargarReportePRSRemoto = async (notifyResult = false) => {
    if (!rangoValido) {
      setRemotePrsStatus('idle');
      setRemotePrsReport(null);
      setRemotePrsError('');
      return;
    }

    setRemotePrsStatus('loading');
    setRemotePrsError('');

    try {
      const reporte = await obtenerReportePRSRemoto({
        startDate: fechaInicio,
        endDate: fechaFin,
        format: 'json',
      });

      if (!reporte || typeof reporte === 'string') {
        const message = 'Rapport PRS distant indisponible. Déployez reports-prs et ouvrez une session Supabase.';
        setRemotePrsReport(null);
        setRemotePrsStatus('unavailable');
        setRemotePrsError(message);

        if (notifyResult) {
          toast.info(message);
        }
        return;
      }

      setRemotePrsReport(reporte as RemotePRSReport);
      setRemotePrsStatus('ready');

      if (notifyResult) {
        toast.success('Rapport PRS distant actualisé');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger le rapport PRS distant.';
      setRemotePrsReport(null);
      setRemotePrsStatus('error');
      setRemotePrsError(message);

      if (notifyResult) {
        toast.error('Erreur de rapport PRS distant', { description: message });
      }
    }
  };

  const handleDescargarReportePRSRemoto = async () => {
    if (!rangoValido) {
      toast.error('Définissez une plage de dates valide avant le téléchargement.');
      return;
    }

    setIsDownloadingRemotePrs(true);

    try {
      const csv = await obtenerReportePRSRemoto({
        startDate: fechaInicio,
        endDate: fechaFin,
        format: 'csv',
      });

      if (typeof csv !== 'string' || csv.length === 0) {
        toast.info('Rapport PRS distant indisponible.');
        return;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `rapport-prs-distant-${fechaInicio}-${fechaFin}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success('Rapport PRS distant téléchargé');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de télécharger le rapport PRS distant.';
      toast.error('Erreur de téléchargement', { description: message });
    } finally {
      setIsDownloadingRemotePrs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#333333' }}>
            {t('reports.title')}
          </h1>
          <p className="text-[#666666]">{t('reports.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExportarDatos} variant="outline" className="border-[#1E73BE] text-[#1E73BE]">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Actualiser l'analyse
          </Button>
          <Button onClick={() => handleGenerarReporte('excel')} variant="outline" className="border-[#1E73BE] text-[#1E73BE]" disabled={!rangoValido}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exporter le rapport actif
          </Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-[#1E73BE]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <Filter className="w-5 h-5" />
            {t('reports.generate')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>{t('reports.reportType')}</Label>
              <Select value={tipoReporte} onValueChange={(value) => setTipoReporte(value as TipoReporte)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('reports.startDate')}</Label>
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('reports.endDate')}</Label>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Période de comparaison</Label>
              <Select value={periodoComparacion} onValueChange={(value) => setPeriodoComparacion(value as PeriodoComparacion)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Jour précédent</SelectItem>
                  <SelectItem value="semana">Semaine précédente</SelectItem>
                  <SelectItem value="mes">Mois précédent</SelectItem>
                  <SelectItem value="anio">Année précédente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.export')}</Label>
              <div className="app-compact-actions">
                <Button onClick={() => handleGenerarReporte('pdf')} className="flex-1 bg-[#DC3545] hover:bg-[#c82333]" size="sm" disabled={!rangoValido}>
                  <FileText className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button onClick={() => handleGenerarReporte('excel')} className="flex-1 bg-[#4CAF50] hover:bg-[#45a049]" size="sm" disabled={!rangoValido}>
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">Raccourcis de période</p>
              <span className="text-xs text-slate-500">Appliquez une plage courante en un clic</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESET_OPTIONS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyDatePreset(preset.value)}
                  className={presetActivo === preset.value ? 'border-[#1E73BE] bg-[#1E73BE] text-white hover:bg-[#1557A0] hover:text-white' : 'border-slate-300 text-slate-700'}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Rapport actif</p>
              <p className="font-semibold text-slate-900">{reportMeta.label}</p>
              <p className="text-sm text-slate-600">{reportMeta.description}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Périmètre</p>
              <p className="font-semibold text-slate-900">{fechaInicio} au {fechaFin}</p>
              <p className="text-sm text-slate-600">Comparaison: {PERIOD_LABELS[periodoComparacion]}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Sources analysées</p>
              <p className="font-semibold text-slate-900">{productos.length} produits, {comandas.length} commandes, {organismos.length} organismes</p>
              <p className="text-sm text-slate-600">{movimientos.length} mouvements, {transformaciones.length} transformations, {rutas.length} routes</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Actualisation</p>
              <p className="font-semibold text-slate-900">{ultimaActualizacion ? new Date(ultimaActualizacion).toLocaleString('fr-CA') : 'Chargement...'}</p>
              <p className={`text-sm ${rangoValido ? 'text-slate-600' : 'text-[#DC3545]'}`}>
                {rangoValido ? 'Plage valide, métriques calculées sur données réelles.' : 'Corrigez les dates pour activer l’analyse.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Produits suivis</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#1E73BE' }}>{productosSeguidos}</p>
                <p className="text-sm text-[#666666] mt-2">{formatQuantity(pesoInventario)} kg en stock</p>
                <div className="mt-2">{renderVariation(productosSeguidos, productosSeguidosComparacion)}</div>
              </div>
              <Package className="w-12 h-12 text-[#1E73BE] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Exécution des commandes</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#4CAF50' }}>{tasaCumplimiento}%</p>
                <p className="text-sm text-[#666666] mt-2">{comandasCompletadas} / {comandasFiltradas.length} complétées</p>
                <div className="mt-2">{renderVariation(tasaCumplimiento, tasaCumplimientoComparacion)}</div>
              </div>
              <Activity className="w-12 h-12 text-[#4CAF50] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Bénéficiaires couverts</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#FFC107' }}>{beneficiariosCubiertos}</p>
                <p className="text-sm text-[#666666] mt-2">{organismoIdsServidos.length} organismes desservis</p>
                <div className="mt-2">{renderVariation(beneficiariosCubiertos, beneficiariosCubiertosComparacion)}</div>
              </div>
              <Users className="w-12 h-12 text-[#FFC107] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#9C27B0]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Production cuisine (kg)</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#9C27B0' }}>{formatQuantity(totalKgPRS)}</p>
                <p className="text-sm text-[#666666] mt-2">{transformacionesTerminadas.length} transformations terminées</p>
                <div className="mt-2">{renderVariation(totalKgPRS, totalKgPRSComparacion)}</div>
              </div>
              <TrendingUp className="w-12 h-12 text-[#9C27B0] opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tipoReporte} onValueChange={(value) => setTipoReporte(value as TipoReporte)} className="space-y-4">
        <TabsList className="app-compact-tabs-grid bg-white border h-auto">
          <TabsTrigger value="general" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="inventario" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Package className="w-4 h-4 mr-2" />
            Inventaire
          </TabsTrigger>
          <TabsTrigger value="comandas" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <FileText className="w-4 h-4 mr-2" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="prs" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <TrendingUp className="w-4 h-4 mr-2" />
            PRS
          </TabsTrigger>
          <TabsTrigger value="organismos" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Users className="w-4 h-4 mr-2" />
            Organismes
          </TabsTrigger>
          <TabsTrigger value="transporte" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Truck className="w-4 h-4 mr-2" />
            Transport
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Indice de performance global</CardTitle>
              </CardHeader>
              <CardContent>
                {rangoValido ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={datosRendimiento}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metrica" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Performance" dataKey="valor" stroke="#1E73BE" fill="#1E73BE" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : renderEmptyState('Choisissez une plage de dates valide pour afficher la performance.')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Mouvements d'inventaire</CardTitle>
              </CardHeader>
              <CardContent>
                {datosMovimientos.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={datosMovimientos} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.tipo}: ${entry.cantidad}`} outerRadius={100} dataKey="cantidad">
                        {datosMovimientos.map((entry, index) => (
                          <Cell key={`mov-${entry.tipo}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : renderEmptyState('Aucun mouvement sur la période sélectionnée.')}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Top 5 des produits les plus distribués</CardTitle>
            </CardHeader>
            <CardContent>
              {topProductos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Quantité distribuée</TableHead>
                      <TableHead className="text-right">Tendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProductos.map((producto, index) => (
                      <TableRow key={`top-producto-${producto.nombre}-${index}`}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell className="text-right">{formatQuantity(producto.distribuido)} kg</TableCell>
                        <TableCell className="text-right">
                          <Badge className={index < 2 ? 'bg-[#4CAF50]' : 'bg-[#1E73BE]'}>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Activité forte
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : renderEmptyState('Aucune distribution de produits détectée sur la période.')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Stock par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                {datosInventarioCategoria.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosInventarioCategoria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stock" fill="#1E73BE" name="Stock (kg)" />
                      <Bar dataKey="productos" fill="#4CAF50" name="Nb produits" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : renderEmptyState('Aucun produit en inventaire pour alimenter ce rapport.')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Repartition de l'inventaire</CardTitle>
              </CardHeader>
              <CardContent>
                {datosInventarioCategoria.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={datosInventarioCategoria} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.categoria} outerRadius={90} dataKey="stock">
                        {datosInventarioCategoria.map((entry, index) => (
                          <Cell key={`inv-${entry.categoria}-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : renderEmptyState('Aucune catégorie de stock disponible.')}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comandas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Évolution des commandes (6 derniers mois)</CardTitle>
            </CardHeader>
            <CardContent>
              {datosComandasMes.some((entry) => entry.comandas > 0) ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={datosComandasMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="comandas" stackId="1" stroke="#1E73BE" fill="#1E73BE" name="Total commandes" />
                    <Area type="monotone" dataKey="completadas" stackId="2" stroke="#4CAF50" fill="#4CAF50" name="Complétées" />
                    <Area type="monotone" dataKey="canceladas" stackId="2" stroke="#DC3545" fill="#DC3545" name="Annulées" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : renderEmptyState('Aucune commande disponible pour tracer une tendance.')}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-[#4CAF50]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Taux de réussite</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>{tasaCumplimiento}%</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#1E73BE]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Organismes desservis</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>{organismoIdsServidos.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FFC107]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Commandes en attente</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>{comandasFiltradas.filter((comanda) => comanda.estado === 'pendiente').length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#7E57C2]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Commandes acceptées</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#7E57C2' }}>{comandasAceptadas}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prs" className="space-y-4">
          <Card className="border-l-4 border-l-[#1E73BE]">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>API PRS distante</CardTitle>
                  <p className="mt-2 text-sm text-[#666666]">
                    Synthèse Supabase en direct sur la période filtrée. La vue locale reste affichée en dessous comme point de comparaison.
                  </p>
                  {remotePrsUpdatedAt && remotePrsStatus === 'ready' ? (
                    <p className="mt-1 text-xs text-[#666666]">Dernière synchronisation: {remotePrsUpdatedAt}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => { void cargarReportePRSRemoto(true); }} disabled={remotePrsStatus === 'loading' || !rangoValido}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDescargarReportePRSRemoto} disabled={isDownloadingRemotePrs || remotePrsStatus !== 'ready'}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV distant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {remotePrsReport && remotePrsStatus === 'ready' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="border-l-4 border-l-[#1E73BE]">
                      <CardContent className="pt-6">
                        <p className="text-sm text-[#666666]">Entrées distantes</p>
                        <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>{remotePrsReport.resumen.totalEntradas}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-[#4CAF50]">
                      <CardContent className="pt-6">
                        <p className="text-sm text-[#666666]">Poids total distant</p>
                        <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>{formatQuantity(remotePrsReport.resumen.totalPesoKg)} kg</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-[#FFC107]">
                      <CardContent className="pt-6">
                        <p className="text-sm text-[#666666]">Organismes couverts</p>
                        <p className="font-bold" style={{ fontSize: '1.5rem', color: '#E0A800' }}>{remotePrsReport.resumen.organismosUnicos}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-[#9C27B0]">
                      <CardContent className="pt-6">
                        <p className="text-sm text-[#666666]">Donateurs PRS</p>
                        <p className="font-bold" style={{ fontSize: '1.5rem', color: '#9C27B0' }}>{remotePrsReport.resumen.donadoresUnicos}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Organisme principal à distance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {remotePrsTopOrganism ? (
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-[#1E73BE]">{remotePrsTopOrganism.organismoNombre}</p>
                            <p className="text-sm text-[#666666]">{formatQuantity(remotePrsTopOrganism.totalPesoKg)} kg • {remotePrsTopOrganism.totalEntradas} entrées</p>
                            <p className="text-sm text-[#666666]">{formatQuantity(remotePrsTopOrganism.totalCantidad)} unités estimées</p>
                          </div>
                        ) : renderEmptyState('Aucun organisme dominant retourné par le rapport distant.')}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Donateur principal à distance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {remotePrsTopDonor ? (
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-[#4CAF50]">{remotePrsTopDonor.donadorNombre}</p>
                            <p className="text-sm text-[#666666]">{formatQuantity(remotePrsTopDonor.totalPesoKg)} kg • {remotePrsTopDonor.totalEntradas} entrées</p>
                            <p className="text-sm text-[#666666]">{formatQuantity(remotePrsTopDonor.totalCantidad)} unités estimées</p>
                          </div>
                        ) : renderEmptyState('Aucun donateur dominant retourné par le rapport distant.')}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  {remotePrsStatusMessage}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Production cuisine par mois</CardTitle>
            </CardHeader>
            <CardContent>
              {datosPRSMes.some((entry) => entry.kg > 0 || entry.rescates > 0) ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={datosPRSMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="kg" stroke="#4CAF50" strokeWidth={3} name="Kg produits" />
                    <Line yAxisId="right" type="monotone" dataKey="rescates" stroke="#1E73BE" strokeWidth={3} name="Transformations" />
                  </LineChart>
                </ResponsiveContainer>
              ) : renderEmptyState('Aucune transformation cuisine terminée sur les six derniers mois.')}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-[#4CAF50]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Total KG produits</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>{formatQuantity(totalKgPRS)} kg</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#1E73BE]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Organismes participants PRS</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>{organismosPRS}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#9C27B0]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Moyenne par transformation</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#9C27B0' }}>
                  {transformacionesTerminadas.length > 0 ? `${formatQuantity(totalKgPRS / transformacionesTerminadas.length)} kg` : '0 kg'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organismos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Beneficiaires par organisme</CardTitle>
            </CardHeader>
            <CardContent>
              {datosOrganismosBeneficiarios.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={datosOrganismosBeneficiarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={120} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beneficiarios" fill="#4CAF50" name="Beneficiaires" />
                  </BarChart>
                </ResponsiveContainer>
              ) : renderEmptyState('Aucun organisme enregistré pour générer ce graphique.')}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-[#1E73BE]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Total des organismes</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>{organismos.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#4CAF50]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Actifs</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>{organismos.filter((organismo) => organismo.activo).length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#DC3545]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Inactifs</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#DC3545' }}>{organismos.filter((organismo) => !organismo.activo).length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FFC107]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Total des bénéficiaires</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>{totalBeneficiariosSistema}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transporte" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Routes par état</CardTitle>
              </CardHeader>
              <CardContent>
                {datosRutasEstado.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosRutasEstado}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="estado" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cantidad" name="Routes">
                        {datosRutasEstado.map((entry, index) => (
                          <Cell key={`ruta-${entry.estado}-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : renderEmptyState('Aucune route enregistrée sur la période sélectionnée.')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Disponibilité de la flotte</CardTitle>
              </CardHeader>
              <CardContent>
                {datosVehiculosEstado.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={datosVehiculosEstado} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.estado}: ${entry.cantidad}`} outerRadius={100} dataKey="cantidad">
                        {datosVehiculosEstado.map((entry, index) => (
                          <Cell key={`veh-${entry.estado}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : renderEmptyState('Aucun véhicule enregistré dans la flotte.')}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-[#1E73BE]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Routes analysées</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>{rutasFiltradas.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#4CAF50]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Véhicules disponibles</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>{vehiculos.filter((vehiculo) => vehiculo.estado === 'disponible').length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#FFC107]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Chauffeurs actifs</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>{choferesActifs}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-[#9C27B0]">
              <CardContent className="pt-6">
                <p className="text-sm text-[#666666]">Charge livrée</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#9C27B0' }}>{formatQuantity(totalCargaRutas)} kg</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
