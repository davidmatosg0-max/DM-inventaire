import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, BarChart3, Shield, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { obtenerProductos, type ProductoCreado } from '../../utils/productStorage';
import { obtenerComandas } from '../../utils/comandaStorage';
import { obtenerOrganismos, type Organismo } from '../../utils/organismosStorage';
import { obtenerRecetas, obtenerTransformaciones, type Transformacion } from '../../utils/recetaStorage';
import { obtenerTodasLasEntradas } from '../../utils/entradaInventarioStorage';
import { obtenerLogs } from '../../utils/auditStorage';
import { obtenerEtiquetaModalidadDistribucion, resolverModalidadDistribucionComanda } from '../../utils/comandaDistributionMode';
import { 
  exportarOrganismosPDF,
} from '../../utils/exportarPDF';
import { 
  exportarInventarioExcel, 
  exportarComandasExcel, 
  exportarOrganismosExcel,
  exportarEstadisticasExcel,
  exportarDatosPersonalizados,
} from '../../utils/exportarExcel';
import { exportData, exportToPDFWithCharts, generateFilename, type ChartElement, type TableColumn } from '../../utils/exportUtils';
import { useBranding } from '../../../hooks/useBranding';
import { AuditLogViewer } from '../auditoria/AuditLogViewer';
import { obtenerComandasReporte } from '../reports/reportComandas';
import { isActiveReportComanda } from '../reports/reportComandaStatus';
import { registrarActividad } from '../../utils/actividadLogger';
import { obtenerReportePRSRemoto } from '../../utils/remoteReports';
import type { Comanda } from '../../types';
import { useCompactViewport } from '../../../hooks/useCompactViewport';
import { ModulePageHeader } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceHeader } from '../shared/ModuleControlSurface';

type ComandaExportable = Comanda & {
  organismo?: {
    nombre?: string;
  };
  modalidadDistribucionLabel?: string;
};

type DatePreset = 'today' | 'last7days' | 'last30days' | 'month';
type ReportTab = 'general' | 'operaciones' | 'inventario' | 'comandas' | 'prs' | 'auditoria';
type ExportableReportType = 'general' | 'operaciones' | 'inventario' | 'comandas' | 'prs' | 'auditoria' | 'organismos';
type ReportExportFormat = 'pdf' | 'excel' | 'csv' | 'json';
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
  detalles: Array<{
    id: string;
    fecha: string;
    organismoNombre: string;
    donadorNombre: string;
    participantePRSNombre: string;
    productoNombre: string;
    cantidad: number;
    unidad: string;
    pesoTotal: number;
    valorTotalEstime: number;
  }>;
  periodo: {
    inicio: string;
    fin: string;
  };
  generadoEn: string;
};

const REPORT_TAB_TO_TYPE: Partial<Record<ReportTab, ExportableReportType>> = {
  general: 'general',
  operaciones: 'operaciones',
  inventario: 'inventario',
  comandas: 'comandas',
  prs: 'prs',
  auditoria: 'auditoria',
};

const PAGE_RANGE_REPORT_TYPES: ExportableReportType[] = ['general', 'inventario', 'comandas', 'prs'];

const DATE_PRESET_OPTIONS: Array<{ value: DatePreset; label: string }> = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'last7days', label: '7 derniers jours' },
  { value: 'last30days', label: '30 derniers jours' },
  { value: 'month', label: 'Mois en cours' },
];

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

function getMonthBuckets(reference: Date, count = 6): Array<{ key: string; label: string }> {
  const buckets: Array<{ key: string; label: string }> = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - index, 1);
    buckets.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('fr-CA', { month: 'short' }),
    });
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

function getSafeNumericValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function getCurrentMonthReportRange() {
  const currentMonthRange = getDatePresetRange('month');

  return {
    label: `${currentMonthRange.start} - ${currentMonthRange.end}`,
    start: parseDateValue(currentMonthRange.start),
    end: parseDateValue(currentMonthRange.end, true),
  };
}

function buildExportColumns(rows: Array<Record<string, unknown>>): TableColumn[] {
  const keys = Array.from(
    rows.reduce((columnSet, row) => {
      Object.keys(row).forEach((key) => columnSet.add(key));
      return columnSet;
    }, new Set<string>())
  );

  return keys.map((key) => ({ header: key, key }));
}

async function exportStructuredRows(
  format: 'csv' | 'json',
  prefix: string,
  title: string,
  subtitle: string,
  rows: Array<Record<string, unknown>>,
) {
  const exportRows = rows.length > 0 ? rows : [{ Note: 'Aucune donnée disponible.' }];

  await exportData(format, exportRows, buildExportColumns(exportRows), {
    filename: generateFilename(prefix, format),
    title,
    subtitle,
  });
}

async function exportReportRowsToPdf(
  prefix: string,
  title: string,
  subtitle: string,
  rows: Array<Record<string, unknown>>,
  charts: ChartElement[] = [],
  orientation: 'portrait' | 'landscape' = 'landscape',
) {
  const exportRows = rows.length > 0 ? rows : [{ Note: 'Aucune donnée disponible.' }];

  await exportToPDFWithCharts(exportRows, buildExportColumns(exportRows), charts, {
    filename: generateFilename(prefix, 'pdf'),
    title,
    subtitle,
    orientation,
  });
}

const LEGACY_PANEL_CLASSNAME = 'backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40';
const REPORT_EXPORT_CANVAS_STYLE: React.CSSProperties = {
  position: 'fixed',
  left: '-10000px',
  top: 0,
  width: '1280px',
  padding: '24px',
  background: '#ffffff',
  pointerEvents: 'none',
  zIndex: -1,
};

type ReportStatCardProps = {
  label: string;
  value: React.ReactNode;
  accentColor: string;
  valueColor: string;
  helper?: string;
  compact?: boolean;
};

function ReportStatCard({ label, value, accentColor, valueColor, helper, compact = false }: ReportStatCardProps) {
  return (
    <div className={`backdrop-blur-lg bg-white/80 rounded-xl shadow-lg border-l-4 ${compact ? 'p-3' : 'p-4 sm:p-6'}`} style={{ borderLeftColor: accentColor }}>
      <p className={`${compact ? 'text-[11px]' : 'text-xs sm:text-sm'} text-gray-600`}>{label}</p>
      <div className={`${compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'} font-bold mt-1`} style={{ fontFamily: 'Montserrat, sans-serif', color: valueColor }}>
        {value}
      </div>
      {helper ? <p className={`${compact ? 'text-[10px]' : 'text-xs'} mt-1 text-gray-500`}>{helper}</p> : null}
    </div>
  );
}

type ReportChartCardProps = {
  title: string;
  titleColor: string;
  hasData: boolean;
  emptyHeight?: number;
  chartId?: string;
  children: React.ReactNode;
};

function ReportChartCard({ title, titleColor, hasData, emptyHeight = 300, chartId, children }: ReportChartCardProps) {
  return (
    <div id={chartId} className={LEGACY_PANEL_CLASSNAME}>
      <h3 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: titleColor }}>
        {title}
      </h3>
      {hasData ? (
        children
      ) : (
        <div className="flex items-center justify-center text-gray-400" style={{ height: `${emptyHeight}px` }}>
          <p className="text-center">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}

function ExportChartCard({ title, titleColor, hasData, emptyHeight = 300, chartId, children }: ReportChartCardProps) {
  return (
    <div
      id={chartId}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(203, 213, 225, 0.95)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: titleColor, fontFamily: 'Montserrat, sans-serif' }}>
        {title}
      </h3>
      {hasData ? (
        children
      ) : (
        <div className="flex items-center justify-center text-gray-400" style={{ height: `${emptyHeight}px`, color: '#94a3b8' }}>
          <p className="text-center">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}

type ReportDetailItem = {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
};

type ReportDetailPanelProps = {
  title: string;
  description?: string;
  items: ReportDetailItem[];
  emptyMessage?: string;
  compact?: boolean;
};

function ReportDetailPanel({ title, description, items, emptyMessage = 'Aucune donnée disponible.', compact = false }: ReportDetailPanelProps) {
  return (
    <div className={LEGACY_PANEL_CLASSNAME}>
      <div className={`${compact ? 'mb-3' : 'mb-4'} space-y-1`}>
        <h3 className={`${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-bold`} style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a4d7a' }}>
          {title}
        </h3>
        {description && <p className={`${compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'} text-gray-600`}>{description}</p>}
      </div>

      {items.length > 0 ? (
        <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
          {items.map((item) => (
            <div key={item.label} className={`rounded-xl bg-gray-50/90 ${compact ? 'px-2.5 py-2.5' : 'px-3 py-3'}`}>
              <div className="flex items-start justify-between gap-3">
                <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold uppercase tracking-wide text-gray-500`}>{item.label}</span>
                <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 text-right`}>{item.value}</span>
              </div>
              {item.helper && <div className={`${compact ? 'mt-1 text-[11px]' : 'mt-1.5 text-xs'} text-gray-600`}>{item.helper}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50/90 px-3 py-6 text-sm text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

function formatCurrencySummary(value: number): string {
  return `CAD$ ${value.toFixed(0)}`;
}

function formatWeightSummary(value: number): string {
  return `${Number(value.toFixed(1))} kg`;
}

function formatChartCategoryLabel(value: string, maxLength = 18): string {
  if (!value) {
    return 'Sans catégorie';
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function getPrsCategoryLabel(value?: string): string {
  switch (value) {
    case 'plat-principal':
      return 'Plat principal';
    case 'soupe':
      return 'Soupe';
    case 'dessert':
      return 'Dessert';
    case 'pain':
      return 'Pain';
    case 'sauce':
      return 'Sauce';
    case 'conserve':
      return 'Conserve';
    case 'autre':
      return 'Autre';
    default:
      return 'Sans catégorie';
  }
}

function getProductCategoryLabel(producto?: Pick<ProductoCreado, 'categoria'> | null): string {
  return producto?.categoria?.trim() || 'Sans catégorie';
}

function getProductUnitWeight(producto?: ProductoCreado | null): number {
  if (!producto) {
    return 0;
  }

  if (producto.unidad === 'kg') {
    return 1;
  }

  if (producto.pesoUnitario && producto.pesoUnitario > 0) {
    return producto.pesoUnitario;
  }

  if (producto.peso && producto.peso > 0) {
    return producto.peso;
  }

  return 0;
}

function getEntryCategoryLabel(
  entry: { productoCategoria?: string; categoria?: string; productoId?: string },
  productIndex: Map<string, ProductoCreado>
): string {
  return entry.productoCategoria?.trim()
    || entry.categoria?.trim()
    || getProductCategoryLabel(productIndex.get(entry.productoId || ''));
}

function getReportProductWeight(
  item: { productoId?: string; cantidad: number; unidad?: string },
  productIndex: Map<string, ProductoCreado>
): number {
  if (item.unidad === 'kg') {
    return item.cantidad;
  }

  const unitWeight = getProductUnitWeight(productIndex.get(item.productoId || ''));
  return unitWeight > 0 ? unitWeight * item.cantidad : item.cantidad;
}

function formatReportDate(value?: string): string {
  if (!value) return 'N/A';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return parsedDate.toLocaleDateString('fr-CA');
}

export function Reportes() {
  const { t } = useTranslation();
  const branding = useBranding();
  const initialRange = getDatePresetRange('month');
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('general');
  const {
    isCompactViewport: isCompactReportsViewport,
    viewportZoom: reportsViewportZoom,
  } = useCompactViewport({
    deps: [activeReportTab],
    resolveZoom: ({ height, isCompact }) => {
      if (!isCompact) {
        return 1;
      }

      if (height < 600) {
        return activeReportTab === 'auditoria' ? 0.5 : 0.55;
      }

      if (height < 700) {
        return activeReportTab === 'auditoria' ? 0.62 : 0.68;
      }

      return 1;
    },
  });
  const [fechaInicio, setFechaInicio] = useState(initialRange.start);
  const [fechaFin, setFechaFin] = useState(initialRange.end);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedActor, setSelectedActor] = useState('all');
  const [productos, setProductos] = useState<ProductoCreado[]>([]);
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [recetas, setRecetas] = useState(obtenerRecetas());
  const [transformaciones, setTransformaciones] = useState<Transformacion[]>([]);
  const [remotePrsReport, setRemotePrsReport] = useState<RemotePRSReport | null>(null);
  const [remotePrsStatus, setRemotePrsStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle');
  const [remotePrsError, setRemotePrsError] = useState('');
  const [isDownloadingRemotePrs, setIsDownloadingRemotePrs] = useState(false);

  const cargarDatos = () => {
    setProductos(obtenerProductos());
    setComandas(obtenerComandas());
    setOrganismos(obtenerOrganismos());
    setRecetas(obtenerRecetas());
    setTransformaciones(obtenerTransformaciones());
  };

  useEffect(() => {
    cargarDatos();

    const handleStorage = () => cargarDatos();
    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const rangoInicio = parseDateValue(fechaInicio);
  const rangoFin = parseDateValue(fechaFin, true);
  const rangoValido = Boolean(rangoInicio && rangoFin && rangoInicio <= rangoFin);
  const referenciaFin = rangoFin ?? new Date();
  const organismosPorId = new Map(organismos.map((organismo) => [organismo.id, organismo]));
  const recipeIndex = new Map(recetas.map((receta) => [receta.id, receta]));
  const productIndex = new Map(productos.map((producto) => [producto.id, producto]));
  const activeEntries = obtenerTodasLasEntradas().filter((entry) => entry.activo);
  const categoryOptions = Array.from(
    new Set([
      ...productos.map((producto) => getProductCategoryLabel(producto)),
      ...activeEntries.map((entry) => getEntryCategoryLabel(entry, productIndex)),
    ])
  ).sort((left, right) => left.localeCompare(right, 'fr'));
  const actorOptions = Array.from(
    new Set(activeEntries.map((entry) => entry.donadorNombre?.trim()).filter((value): value is string => Boolean(value)))
  ).sort((left, right) => left.localeCompare(right, 'fr'));
  const presetActivo = DATE_PRESET_OPTIONS.find((preset) => {
    const rango = getDatePresetRange(preset.value);
    return rango.start === fechaInicio && rango.end === fechaFin;
  })?.value;
  const exportableReportType = REPORT_TAB_TO_TYPE[activeReportTab];
  const usesPageDateRange = exportableReportType ? PAGE_RANGE_REPORT_TYPES.includes(exportableReportType) : false;
  const showCategoryFilter = exportableReportType === 'general'
    || exportableReportType === 'operaciones'
    || exportableReportType === 'inventario'
    || exportableReportType === 'comandas';
  const showActorFilter = exportableReportType === 'general' || exportableReportType === 'operaciones';
  const exportContextDescription = exportableReportType === 'operaciones'
    ? 'Télécharge un résumé consolidé du mois en cours pour les rapports opérationnels.'
    : exportableReportType === 'auditoria'
      ? 'Télécharge l\'état actuel du registre d\'audit.'
      : 'Les graphiques et exports de cette vue utilisent cette plage de dates.';
  const activeFilterDescription = [
    selectedCategory !== 'all' ? `Catégorie: ${selectedCategory}` : null,
    selectedActor !== 'all' ? `Donateur / fournisseur: ${selectedActor}` : null,
  ].filter(Boolean).join(' • ');
  const comandasFiltradas = rangoValido
    ? comandas.filter((comanda) => isDateInRange(comanda.fechaEntrega || comanda.fechaCreacion || comanda.fecha, rangoInicio, rangoFin))
    : [];
  const transformacionesTerminadas = rangoValido
    ? transformaciones.filter((transformacion) => isDateInRange(transformacion.fecha, rangoInicio, rangoFin) && transformacion.estado === 'terminée')
    : [];

  const productosFiltrados = productos.filter((producto) => (
    selectedCategory === 'all' || getProductCategoryLabel(producto) === selectedCategory
  ));

  const datosInventario = Array.from(
    productosFiltrados.reduce((mapa, producto) => {
      const categoria = producto.categoria || 'Sans catégorie';
      mapa.set(categoria, (mapa.get(categoria) || 0) + getProductWeight(producto));
      return mapa;
    }, new Map<string, number>())
  ).map(([categoria, stock]) => ({ categoria, stock: Number(stock.toFixed(1)) }));

  const monthBuckets = getMonthBuckets(referenciaFin, 6);
  const datosComandasMes = monthBuckets.map((bucket) => {
    const delMes = comandas.filter((comanda) => getMonthKey(comanda.fechaEntrega || comanda.fechaCreacion || comanda.fecha) === bucket.key);
    return {
      mes: bucket.label,
      comandas: selectedCategory === 'all'
        ? delMes.length
        : delMes.filter((comanda) =>
            (comanda.items || []).some((item) => getProductCategoryLabel(productIndex.get(item.productoId)) === selectedCategory)
          ).length,
    };
  });

  const datosOrganismos = organismos
    .map((organismo) => ({
      id: organismo.id,
      nombre: organismo.nombre.length > 15 ? `${organismo.nombre.substring(0, 15)}...` : organismo.nombre,
      beneficiarios: organismo.beneficiarios,
    }))
    .sort((a, b) => b.beneficiarios - a.beneficiarios)
    .slice(0, 10);

  const datosPRS = monthBuckets.map((bucket) => {
    const delMes = transformaciones.filter((transformacion) => getMonthKey(transformacion.fecha) === bucket.key && transformacion.estado === 'terminée');
    return {
      mes: bucket.label,
      kg: Number(
        delMes
          .reduce((sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0), 0)
          .toFixed(1)
      ),
    };
  });

  const datosPrsCategoria = Array.from(
    transformacionesTerminadas.reduce((mapa, transformacion) => {
      const categoria = getPrsCategoryLabel(recipeIndex.get(transformacion.recetaId)?.categoria);
      const totalKg = transformacion.productosGenerados.reduce((sum, producto) => sum + producto.pesoTotal, 0);
      mapa.set(categoria, (mapa.get(categoria) || 0) + totalKg);
      return mapa;
    }, new Map<string, number>())
  )
    .map(([categoria, kg]) => ({ categoria, kg: Number(kg.toFixed(1)) }))
    .sort((left, right) => right.kg - left.kg);

  const comandasExportables: ComandaExportable[] = comandasFiltradas.map((comanda) => ({
    ...comanda,
    organismo: (comanda as ComandaExportable).organismo ?? (comanda.organismoId ? { nombre: organismosPorId.get(comanda.organismoId)?.nombre || 'N/A' } : undefined),
    modalidadDistribucionLabel: obtenerEtiquetaModalidadDistribucion(resolverModalidadDistribucionComanda(comanda)),
  }));

  const comandasExportablesFiltradas = selectedCategory === 'all'
    ? comandasExportables
    : comandasExportables.filter((comanda) =>
        (comanda.items || []).some((item) => getProductCategoryLabel(productIndex.get(item.productoId)) === selectedCategory)
      );

  const organismosExportables = organismos.map((organismo) => ({
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

  const valorTotalCalculado = productosFiltrados.reduce((sum, producto) => {
    if (producto.valorTotal && producto.valorTotal > 0) {
      return sum + producto.valorTotal;
    }

    if (producto.valorUnitario && producto.valorUnitario > 0) {
      return sum + (producto.valorUnitario * producto.stockActual);
    }

    return sum;
  }, 0);

  const COLORS = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#9C27B0', '#00BCD4'];
  const inventoryDistributionTotal = datosInventario.reduce((sum, item) => sum + item.stock, 0);

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
      anchor.download = generateFilename('rapport-prs-distant', 'csv');
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

  const handleReportTabChange = (value: string) => {
    setActiveReportTab(value as ReportTab);
  };

  useEffect(() => {
    if (activeReportTab !== 'prs' || !rangoValido) {
      return;
    }

    void cargarReportePRSRemoto(false);
  }, [activeReportTab, fechaInicio, fechaFin, rangoValido]);

  const handleGenerarReporte = async (formato: ReportExportFormat) => {
    if (!exportableReportType) {
      toast.info('Cette vue utilise ses propres filtres et exportations.');
      return;
    }

    if (usesPageDateRange && !rangoValido) {
      toast.error('Définissez une plage de dates valide avant de générer un rapport.');
      return;
    }

    const activePdfCharts = pdfChartsByTab[activeReportTab] ?? [];
    
    try {
      switch (exportableReportType) {
        case 'operaciones': {
          const currentMonthRange = getCurrentMonthReportRange();
          const operationalEntries = activeEntries.filter((entry) =>
            isDateInRange(entry.fecha, currentMonthRange.start, currentMonthRange.end)
            && (selectedCategory === 'all' || getEntryCategoryLabel(entry, productIndex) === selectedCategory)
            && (selectedActor === 'all' || (entry.donadorNombre || '').trim() === selectedActor)
          );
          const operationalDistributions = obtenerComandasReporte()
            .filter(isActiveReportComanda)
            .filter((comanda) => isDateInRange(comanda.fecha, currentMonthRange.start, currentMonthRange.end))
            .map((comanda) => {
              const filteredPeso = selectedCategory === 'all'
                ? getSafeNumericValue(comanda.totalPeso)
                : comanda.productos.reduce((sum, item) => (
                    getProductCategoryLabel(productIndex.get(item.productoId)) === selectedCategory
                      ? sum + getReportProductWeight(item, productIndex)
                      : sum
                  ), 0);
              const totalPeso = getSafeNumericValue(comanda.totalPeso);
              const filteredValor = selectedCategory === 'all'
                ? getSafeNumericValue(comanda.totalValorMonetario)
                : (totalPeso > 0 ? getSafeNumericValue(comanda.totalValorMonetario) * (filteredPeso / totalPeso) : 0);

              return {
                ...comanda,
                filteredPeso: Number(filteredPeso.toFixed(1)),
                filteredValor: Number(filteredValor.toFixed(2)),
              };
            })
            .filter((comanda) => selectedCategory === 'all' || comanda.filteredPeso > 0);

          const procurementValue = operationalEntries.reduce(
            (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
            0,
          );
          const distributionValue = operationalDistributions.reduce(
            (sum, comanda) => sum + getSafeNumericValue(comanda.filteredValor),
            0,
          );
          const activeDonors = new Set(
            operationalEntries.map((entry) => entry.donadorNombre).filter(Boolean)
          ).size;
          const activePrograms = new Set(
            operationalEntries.map((entry) => entry.programaCodigo || entry.programaNombre).filter(Boolean)
          ).size;
          const operationalSummary = [
            { Indicateur: 'Période', Valeur: currentMonthRange.label },
            { Indicateur: 'Catégorie', Valeur: selectedCategory === 'all' ? 'Toutes' : selectedCategory },
            { Indicateur: 'Donateur / fournisseur', Valeur: selectedActor === 'all' ? 'Tous' : selectedActor },
            { Indicateur: 'Approvisionnements', Valeur: operationalEntries.length },
            { Indicateur: 'Valeur approvisionnement', Valeur: `CAD$ ${procurementValue.toFixed(2)}` },
            { Indicateur: 'Distributions', Valeur: operationalDistributions.length },
            { Indicateur: 'Valeur distribution', Valeur: `CAD$ ${distributionValue.toFixed(2)}` },
            { Indicateur: 'Donateurs actifs', Valeur: activeDonors },
            { Indicateur: 'Programmes actifs', Valeur: activePrograms },
          ];

          if (formato === 'pdf') {
            await exportReportRowsToPdf(
              'rapport_operaciones',
              'Rapports opérationnels',
              `Résumé consolidé du mois en cours (${currentMonthRange.label})`,
              [
                ...operationalSummary.map((row) => ({ Section: 'Résumé opérationnel', ...row })),
                ...(operationalEntries.length > 0
                  ? operationalEntries.map((entry) => ({
                      Section: 'Approvisionnement',
                      Date: entry.fecha,
                      Produit: entry.nombreProducto,
                      Acteur: entry.donadorNombre || 'N/A',
                      Catégorie: getEntryCategoryLabel(entry, productIndex),
                      Programme: entry.programaCodigo || entry.programaNombre || 'N/A',
                      Quantité: entry.cantidad,
                      Valeur: entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad),
                    }))
                  : [{ Section: 'Approvisionnement', Note: 'Aucune donnée disponible.' }]),
                ...(operationalDistributions.length > 0
                  ? operationalDistributions.map((comanda) => ({
                      Section: 'Distribution',
                      Comanda: comanda.numero,
                      Date: comanda.fecha,
                      Organisme: comanda.organismoNombre,
                      État: comanda.estado,
                      Quantité: getSafeNumericValue(comanda.filteredPeso),
                      Valeur: getSafeNumericValue(comanda.filteredValor),
                    }))
                  : [{ Section: 'Distribution', Note: 'Aucune donnée disponible.' }]),
              ],
              activePdfCharts,
            );
          } else if (formato === 'excel') {
            exportarDatosPersonalizados('rapport-operaciones', [
              { nombre: 'Résumé opérationnel', datos: operationalSummary },
              {
                nombre: 'Approvisionnement',
                datos: operationalEntries.length > 0
                  ? operationalEntries.map((entry) => ({
                      Date: entry.fecha,
                      Produit: entry.nombreProducto,
                      Acteur: entry.donadorNombre || 'N/A',
                      Catégorie: getEntryCategoryLabel(entry, productIndex),
                      Programme: entry.programaCodigo || entry.programaNombre || 'N/A',
                      Quantité: entry.cantidad,
                      Valeur: entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad),
                    }))
                  : [{ Note: 'Aucune donnée disponible.' }],
              },
              {
                nombre: 'Distribution',
                datos: operationalDistributions.length > 0
                  ? operationalDistributions.map((comanda) => ({
                      Comanda: comanda.numero,
                      Date: comanda.fecha,
                      Organisme: comanda.organismoNombre,
                      État: comanda.estado,
                      Quantité: getSafeNumericValue(comanda.filteredPeso),
                      Valeur: getSafeNumericValue(comanda.filteredValor),
                    }))
                  : [{ Note: 'Aucune donnée disponible.' }],
              },
            ]);
          } else {
            await exportStructuredRows(
              formato,
              'rapport_operaciones',
              'Rapports opérationnels',
              `Résumé consolidé du mois en cours (${currentMonthRange.label})`,
              [
                ...operationalSummary.map((row) => ({ Section: 'Résumé opérationnel', ...row })),
                ...(operationalEntries.length > 0
                  ? operationalEntries.map((entry) => ({
                      Section: 'Approvisionnement',
                      Date: entry.fecha,
                      Produit: entry.nombreProducto,
                      Acteur: entry.donadorNombre || 'N/A',
                      Catégorie: getEntryCategoryLabel(entry, productIndex),
                      Programme: entry.programaCodigo || entry.programaNombre || 'N/A',
                      Quantité: entry.cantidad,
                      Valeur: entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad),
                    }))
                  : [{ Section: 'Approvisionnement', Note: 'Aucune donnée disponible.' }]),
                ...(operationalDistributions.length > 0
                  ? operationalDistributions.map((comanda) => ({
                      Section: 'Distribution',
                      Comanda: comanda.numero,
                      Date: comanda.fecha,
                      Organisme: comanda.organismoNombre,
                      État: comanda.estado,
                      Quantité: getSafeNumericValue(comanda.filteredPeso),
                      Valeur: getSafeNumericValue(comanda.filteredValor),
                    }))
                  : [{ Section: 'Distribution', Note: 'Aucune donnée disponible.' }]),
              ],
            );
          }
          break;
        }

        case 'inventario':
          if (formato === 'pdf') {
            await exportReportRowsToPdf(
              'rapport_inventaire',
              'Rapport d\'inventaire',
              `Vue exportée le ${new Date().toLocaleDateString('fr-CA')}`,
              productosFiltrados.length > 0
                ? productosFiltrados.map((producto) => ({
                    Code: producto.codigo || 'N/A',
                    Produit: producto.nombre,
                    Catégorie: producto.categoria || 'N/A',
                    SousCatégorie: producto.subcategoria || 'N/A',
                    Stock: producto.stockActual,
                    Unité: producto.unidad,
                    PoidsKg: Number(getProductWeight(producto).toFixed(2)),
                    État: producto.estado || 'Disponible',
                  }))
                : [{ Note: 'Aucune donnée disponible.' }],
              activePdfCharts,
            );
          } else if (formato === 'excel') {
            exportarInventarioExcel(productosFiltrados);
          } else {
            await exportStructuredRows(
              formato,
              'rapport_inventaire',
              'Rapport d\'inventaire',
              `Vue exportée le ${new Date().toLocaleDateString('fr-CA')}`,
              productosFiltrados.length > 0
                ? productosFiltrados.map((producto) => ({
                    Code: producto.codigo || 'N/A',
                    Produit: producto.nombre,
                    Catégorie: producto.categoria || 'N/A',
                    SousCatégorie: producto.subcategoria || 'N/A',
                    Stock: producto.stockActual,
                    Unité: producto.unidad,
                    PoidsKg: Number(getProductWeight(producto).toFixed(2)),
                    État: producto.estado || 'Disponible',
                  }))
                : [{ Note: 'Aucune donnée disponible.' }],
            );
          }
          break;
        
        case 'comandas':
          if (formato === 'pdf') {
            await exportReportRowsToPdf(
              'rapport_commandes',
              'Rapport de commandas',
              `Période: ${fechaInicio} - ${fechaFin}`,
              comandasExportablesFiltradas.length > 0
                ? comandasExportablesFiltradas.map((comanda) => ({
                    Comanda: comanda.numero,
                    Organisme: comanda.organismo?.nombre || 'N/A',
                    Date: comanda.fecha,
                    Livraison: comanda.fechaEntrega || 'N/A',
                    État: comanda.estado,
                    Produits: comanda.productos?.length || 0,
                    Valeur: comanda.valorTotal || 0,
                  }))
                : [{ Note: 'Aucune donnée disponible.' }],
              activePdfCharts,
            );
          } else if (formato === 'excel') {
            exportarComandasExcel(comandasExportablesFiltradas);
          } else {
            await exportStructuredRows(
              formato,
              'rapport_commandes',
              'Rapport de commandas',
              `Période: ${fechaInicio} - ${fechaFin}`,
              comandasExportablesFiltradas.length > 0
                ? comandasExportablesFiltradas.map((comanda) => ({
                    Comanda: comanda.numero,
                    Organisme: comanda.organismo?.nombre || 'N/A',
                    Date: comanda.fecha,
                    Livraison: comanda.fechaEntrega || 'N/A',
                    État: comanda.estado,
                    Produits: comanda.productos?.length || 0,
                    Valeur: comanda.valorTotal || 0,
                  }))
                : [{ Note: 'Aucune donnée disponible.' }],
            );
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
            await exportReportRowsToPdf(
              'rapport_prs',
              'Rapport PRS',
              `Période: ${fechaInicio} - ${fechaFin}`,
              [
                {
                  Section: 'Résumé PRS',
                  Indicateur: 'Période',
                  Valeur: `${fechaInicio} - ${fechaFin}`,
                },
                {
                  Section: 'Résumé PRS',
                  Indicateur: 'Transformations terminées',
                  Valeur: transformacionesTerminadas.length,
                },
                {
                  Section: 'Résumé PRS',
                  Indicateur: 'Production totale (kg)',
                  Valeur: Number(transformacionesTerminadas.reduce((sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0), 0).toFixed(1)),
                },
                ...(datosPRS.length > 0
                  ? datosPRS.map((entry) => ({
                      Section: 'Production mensuelle',
                      Mois: entry.mes,
                      ProductionKg: entry.kg,
                    }))
                  : [{ Section: 'Production mensuelle', Note: 'Aucune donnée disponible.' }]),
              ],
              activePdfCharts,
            );
          } else if (formato === 'excel') {
            exportarDatosPersonalizados('rapport-prs-simple', [
              {
                nombre: 'Résumé PRS',
                datos: [
                  { Indicateur: 'Période', Valeur: `${fechaInicio} - ${fechaFin}` },
                  { Indicateur: 'Transformations terminées', Valeur: transformacionesTerminadas.length },
                  {
                    Indicateur: 'Production totale (kg)',
                    Valeur: Number(transformacionesTerminadas.reduce((sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0), 0).toFixed(1)),
                  },
                ],
              },
              {
                nombre: 'Production mensuelle',
                datos: datosPRS.length > 0 ? datosPRS.map((entry) => ({ Mois: entry.mes, 'Production (kg)': entry.kg })) : [{ Note: 'Aucune donnée disponible.' }],
              },
            ]);
          } else {
            await exportStructuredRows(
              formato,
              'rapport_prs',
              'Rapport PRS',
              `Période: ${fechaInicio} - ${fechaFin}`,
              [
                {
                  Section: 'Résumé PRS',
                  Indicateur: 'Période',
                  Valeur: `${fechaInicio} - ${fechaFin}`,
                },
                {
                  Section: 'Résumé PRS',
                  Indicateur: 'Transformations terminées',
                  Valeur: transformacionesTerminadas.length,
                },
                {
                  Section: 'Résumé PRS',
                  Indicateur: 'Production totale (kg)',
                  Valeur: Number(transformacionesTerminadas.reduce((sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0), 0).toFixed(1)),
                },
                ...(datosPRS.length > 0
                  ? datosPRS.map((entry) => ({
                      Section: 'Production mensuelle',
                      Mois: entry.mes,
                      ProductionKg: entry.kg,
                    }))
                  : [{ Section: 'Production mensuelle', Note: 'Aucune donnée disponible.' }]),
              ],
            );
          }
          break;

        case 'auditoria': {
          const auditLogs = obtenerLogs();
          const successfulLogs = auditLogs.filter((log) => log.exito).length;
          const errorLogs = auditLogs.filter((log) => !log.exito).length;
          const criticalLogs = auditLogs.filter((log) => log.severidad === 'critical').length;
          const auditSummary = [
            { Indicateur: 'Logs totaux', Valeur: auditLogs.length },
            { Indicateur: 'Logs réussis', Valeur: successfulLogs },
            { Indicateur: 'Logs en erreur', Valeur: errorLogs },
            { Indicateur: 'Logs critiques', Valeur: criticalLogs },
          ];

          if (formato === 'pdf') {
            await exportReportRowsToPdf(
              'rapport_audit',
              'Rapport d\'audit',
              `Export du registre courant (${auditLogs.length} événements)`,
              [
                ...auditSummary.map((row) => ({ Section: 'Résumé audit', ...row })),
                ...(auditLogs.length > 0
                  ? auditLogs.map((log) => ({
                      Section: 'Logs',
                      Date: log.fecha,
                      Utilisateur: log.usuario,
                      Module: log.modulo,
                      Action: log.accion,
                      Sévérité: log.severidad || 'info',
                      Succès: log.exito ? 'Oui' : 'Non',
                    }))
                  : [{ Section: 'Logs', Note: 'Aucune donnée disponible.' }]),
              ],
              activePdfCharts,
            );
          } else if (formato === 'excel') {
            exportarDatosPersonalizados('rapport-audit', [
              { nombre: 'Résumé audit', datos: auditSummary },
              {
                nombre: 'Logs',
                datos: auditLogs.length > 0
                  ? auditLogs.map((log) => ({
                      Date: log.fecha,
                      Utilisateur: log.usuario,
                      Module: log.modulo,
                      Action: log.accion,
                      Sévérité: log.severidad || 'info',
                      Succès: log.exito ? 'Oui' : 'Non',
                    }))
                  : [{ Note: 'Aucune donnée disponible.' }],
              },
            ]);
          } else {
            await exportStructuredRows(
              formato,
              'rapport_audit',
              'Rapport d\'audit',
              `Export du registre courant (${auditLogs.length} événements)`,
              [
                ...auditSummary.map((row) => ({ Section: 'Résumé audit', ...row })),
                ...(auditLogs.length > 0
                  ? auditLogs.map((log) => ({
                      Section: 'Logs',
                      Date: log.fecha,
                      Utilisateur: log.usuario,
                      Module: log.modulo,
                      Action: log.accion,
                      Sévérité: log.severidad || 'info',
                      Succès: log.exito ? 'Oui' : 'Non',
                    }))
                  : [{ Section: 'Logs', Note: 'Aucune donnée disponible.' }]),
              ],
            );
          }
          break;
        }
        
        case 'general':
        default:
          const estadisticas = {
            totalProductos: productosFiltrados.length,
            totalStock: productosFiltrados.reduce((sum, producto) => sum + producto.stockActual, 0),
            totalComandas: comandasExportablesFiltradas.length,
            totalOrganismos: organismos.filter((organismo) => organismo.activo).length,
            valorTotal: valorTotalCalculado,
            periodo: `${fechaInicio} - ${fechaFin}`,
          };
          
          if (formato === 'pdf') {
            await exportReportRowsToPdf(
              'rapport_general',
              'Rapport général',
              `Période: ${fechaInicio} - ${fechaFin}`,
              [
                { Section: 'Résumé général', Indicateur: 'Catégorie', Valeur: selectedCategory === 'all' ? 'Toutes' : selectedCategory },
                { Section: 'Résumé général', Indicateur: 'Donateur / fournisseur', Valeur: selectedActor === 'all' ? 'Tous' : selectedActor },
                { Section: 'Résumé général', Indicateur: 'Total produits', Valeur: productosFiltrados.length },
                { Section: 'Résumé général', Indicateur: 'Stock total', Valeur: productosFiltrados.reduce((sum, producto) => sum + producto.stockActual, 0) },
                { Section: 'Résumé général', Indicateur: 'Commandes filtrées', Valeur: comandasExportablesFiltradas.length },
                { Section: 'Résumé général', Indicateur: 'Organismes actifs', Valeur: organismos.filter((organismo) => organismo.activo).length },
                { Section: 'Résumé général', Indicateur: 'Valeur totale', Valeur: Number(valorTotalCalculado.toFixed(2)) },
                ...(productosFiltrados.length > 0
                  ? productosFiltrados.map((producto) => ({
                      Section: 'Inventaire',
                      Code: producto.codigo || 'N/A',
                      Produit: producto.nombre,
                      Catégorie: producto.categoria || 'N/A',
                      Stock: producto.stockActual,
                      Unité: producto.unidad,
                    }))
                  : [{ Section: 'Inventaire', Note: 'Aucune donnée disponible.' }]),
                ...(comandasExportablesFiltradas.length > 0
                  ? comandasExportablesFiltradas.map((comanda) => ({
                      Section: 'Commandes',
                      Comanda: comanda.numero,
                      Organisme: comanda.organismo?.nombre || 'N/A',
                      Date: comanda.fecha,
                      État: comanda.estado,
                    }))
                  : [{ Section: 'Commandes', Note: 'Aucune donnée disponible.' }]),
                ...(organismos.length > 0
                  ? organismos.map((organismo) => ({
                      Section: 'Organismes',
                      Nom: organismo.nombre,
                      Type: organismo.tipo || 'N/A',
                      Bénéficiaires: organismo.beneficiarios || 0,
                      État: organismo.activo ? 'Actif' : 'Inactif',
                    }))
                  : [{ Section: 'Organismes', Note: 'Aucune donnée disponible.' }]),
              ],
              activePdfCharts,
            );
          } else if (formato === 'excel') {
            exportarEstadisticasExcel({
              resumen: estadisticas,
              inventario: productosFiltrados.map((producto) => ({
                Code: producto.codigo || 'N/A',
                Produit: producto.nombre,
                Catégorie: producto.categoria,
                Stock: producto.stockActual,
                Unité: producto.unidad,
              })),
              comandas: comandasExportablesFiltradas.map((comanda) => ({
                'No commande': comanda.numero,
                Organisme: comanda.organismo?.nombre || 'N/A',
                Date: new Date(comanda.fecha).toLocaleDateString('fr-CA'),
                État: comanda.estado,
              })),
              organismos: organismos.map((organismo) => ({
                Nom: organismo.nombre,
                Type: organismo.tipo || 'N/A',
                Bénéficiaires: organismo.beneficiarios || 0,
                État: organismo.activo ? 'Actif' : 'Inactif',
              })),
              periodo: `${fechaInicio} - ${fechaFin}`,
            });
          } else {
            await exportStructuredRows(
              formato,
              'rapport_general',
              'Rapport général',
              `Période: ${fechaInicio} - ${fechaFin}`,
              [
                { Section: 'Résumé général', Indicateur: 'Total produits', Valeur: productosFiltrados.length },
                { Section: 'Résumé général', Indicateur: 'Catégorie', Valeur: selectedCategory === 'all' ? 'Toutes' : selectedCategory },
                { Section: 'Résumé général', Indicateur: 'Donateur / fournisseur', Valeur: selectedActor === 'all' ? 'Tous' : selectedActor },
                { Section: 'Résumé général', Indicateur: 'Total produits', Valeur: productosFiltrados.length },
                { Section: 'Résumé général', Indicateur: 'Stock total', Valeur: productosFiltrados.reduce((sum, producto) => sum + producto.stockActual, 0) },
                { Section: 'Résumé général', Indicateur: 'Commandes filtrées', Valeur: comandasExportablesFiltradas.length },
                { Section: 'Résumé général', Indicateur: 'Organismes actifs', Valeur: organismos.filter((organismo) => organismo.activo).length },
                { Section: 'Résumé général', Indicateur: 'Valeur totale', Valeur: Number(valorTotalCalculado.toFixed(2)) },
                ...(productosFiltrados.length > 0
                  ? productosFiltrados.map((producto) => ({
                      Section: 'Inventaire',
                      Code: producto.codigo || 'N/A',
                      Produit: producto.nombre,
                      Catégorie: producto.categoria || 'N/A',
                      Stock: producto.stockActual,
                      Unité: producto.unidad,
                    }))
                  : [{ Section: 'Inventaire', Note: 'Aucune donnée disponible.' }]),
                ...(comandasExportablesFiltradas.length > 0
                  ? comandasExportablesFiltradas.map((comanda) => ({
                      Section: 'Commandes',
                      Comanda: comanda.numero,
                      Organisme: comanda.organismo?.nombre || 'N/A',
                      Date: comanda.fecha,
                      État: comanda.estado,
                    }))
                  : [{ Section: 'Commandes', Note: 'Aucune donnée disponible.' }]),
                ...(organismos.length > 0
                  ? organismos.map((organismo) => ({
                      Section: 'Organismes',
                      Nom: organismo.nombre,
                      Type: organismo.tipo || 'N/A',
                      Bénéficiaires: organismo.beneficiarios || 0,
                      État: organismo.activo ? 'Actif' : 'Inactif',
                    }))
                  : [{ Section: 'Organismes', Note: 'Aucune donnée disponible.' }]),
              ],
            );
          }
          break;
      }
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Rapports',
        'crear',
        `Rapport généré: ${exportableReportType} (${formato.toUpperCase()}) pour la période ${fechaInicio} - ${fechaFin}`,
        { tipoReporte: exportableReportType, formato, fechaInicio, fechaFin, categorie: selectedCategory, acteur: selectedActor }
      );
      
      toast.success(`✅ Rapport ${formato.toUpperCase()} généré avec succès`);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast.error('❌ Erreur lors de la génération du rapport');
    }
  };

  const showCompactReportsOverview = isCompactReportsViewport;
  const showCompactGeneralOverview = showCompactReportsOverview && activeReportTab === 'general';
  const pdfChartsByTab: Record<ReportTab, ChartElement[]> = {
    general: [
      { id: 'pdf-chart-general-orders' },
      { id: 'pdf-chart-general-organisms' },
    ],
    operaciones: [{ id: 'pdf-chart-operaciones-monthly' }],
    inventario: [
      { id: 'pdf-chart-inventario-stock-category' },
      { id: 'pdf-chart-inventario-distribution' },
    ],
    comandas: [{ id: 'pdf-chart-comandas-evolution' }],
    prs: [
      { id: 'pdf-chart-prs-monthly' },
      { id: 'pdf-chart-prs-category' },
    ],
    auditoria: [],
  };
  const stockTotal = productosFiltrados.reduce((sum, producto) => sum + producto.stockActual, 0);
  const totalBeneficiarios = organismos.reduce((sum, organismo) => sum + organismo.beneficiarios, 0);
  const activeOrganisms = organismos.filter((organismo) => organismo.activo);
  const currentMonthRange = getCurrentMonthReportRange();
  const operationalEntries = activeEntries.filter((entry) =>
    isDateInRange(entry.fecha, currentMonthRange.start, currentMonthRange.end)
    && (selectedCategory === 'all' || getEntryCategoryLabel(entry, productIndex) === selectedCategory)
    && (selectedActor === 'all' || (entry.donadorNombre || '').trim() === selectedActor)
  );
  const operationalDistributions = obtenerComandasReporte()
    .filter(isActiveReportComanda)
    .filter((comanda) => isDateInRange(comanda.fecha, currentMonthRange.start, currentMonthRange.end))
    .map((comanda) => {
      const filteredPeso = selectedCategory === 'all'
        ? getSafeNumericValue(comanda.totalPeso)
        : comanda.productos.reduce((sum, item) => (
            getProductCategoryLabel(productIndex.get(item.productoId)) === selectedCategory
              ? sum + getReportProductWeight(item, productIndex)
              : sum
          ), 0);
      const totalPeso = getSafeNumericValue(comanda.totalPeso);
      const filteredValor = selectedCategory === 'all'
        ? getSafeNumericValue(comanda.totalValorMonetario)
        : (totalPeso > 0 ? getSafeNumericValue(comanda.totalValorMonetario) * (filteredPeso / totalPeso) : 0);

      return {
        ...comanda,
        filteredPeso: Number(filteredPeso.toFixed(1)),
        filteredValor: Number(filteredValor.toFixed(2)),
      };
    })
    .filter((comanda) => selectedCategory === 'all' || comanda.filteredPeso > 0);
  const procurementValue = operationalEntries.reduce(
    (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
    0,
  );
  const operationalEntriesKg = Number(
    operationalEntries.reduce((sum, entry) => sum + getSafeNumericValue(entry.pesoTotal), 0).toFixed(1)
  );
  const distributionValue = operationalDistributions.reduce(
    (sum, comanda) => sum + getSafeNumericValue(comanda.filteredValor),
    0,
  );
  const operationalDistributionsKg = Number(
    operationalDistributions.reduce((sum, comanda) => sum + getSafeNumericValue(comanda.filteredPeso), 0).toFixed(1)
  );
  const operationalDonors = new Set(operationalEntries.map((entry) => entry.donadorNombre).filter(Boolean)).size;
  const operationalPrograms = new Set(operationalEntries.map((entry) => entry.programaCodigo || entry.programaNombre).filter(Boolean)).size;
  const lowStockProducts = productos
    .filter((producto) => producto.stockActual <= producto.stockMinimo)
    .sort((left, right) => (left.stockActual - left.stockMinimo) - (right.stockActual - right.stockMinimo))
    .slice(0, 5);
  const topInventoryCategories = [...datosInventario]
    .sort((left, right) => right.stock - left.stock)
    .slice(0, 5);
  const orderStatusSummary = Array.from(
    comandasExportablesFiltradas.reduce((mapa, comanda) => {
      const estado = comanda.estado || 'Sans état';
      mapa.set(estado, (mapa.get(estado) || 0) + 1);
      return mapa;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);
  const topOrderingOrganisms = Array.from(
    comandasExportablesFiltradas.reduce((mapa, comanda) => {
      const nombre = comanda.organismo?.nombre || 'N/A';
      mapa.set(nombre, (mapa.get(nombre) || 0) + 1);
      return mapa;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);
  const commandasTotalValue = comandasExportablesFiltradas.reduce((sum, comanda) => sum + getSafeNumericValue(comanda.valorTotal), 0);
  const averageOrderValue = comandasExportablesFiltradas.length > 0 ? commandasTotalValue / comandasExportablesFiltradas.length : 0;
  const totalPrsKg = Number(
    transformacionesTerminadas
      .reduce((sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0), 0)
      .toFixed(1)
  );
  const participatingPrsCount = organismos.filter((organismo) => organismo.participantePRS).length;
  const latestTransformations = [...transformacionesTerminadas]
    .sort((left, right) => new Date(right.fecha).getTime() - new Date(left.fecha).getTime())
    .slice(0, 5);
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
          ? 'Sélectionnez l’onglet PRS avec une plage valide pour charger le rapport distant.'
          : '';
  const auditLogs = obtenerLogs();
  const auditSuccessCount = auditLogs.filter((log) => log.exito).length;
  const auditErrorCount = auditLogs.filter((log) => !log.exito).length;
  const auditCriticalCount = auditLogs.filter((log) => log.severidad === 'critical').length;
  const auditModuleSummary = Array.from(
    auditLogs.reduce((mapa, log) => {
      const modulo = log.modulo || 'Général';
      mapa.set(modulo, (mapa.get(modulo) || 0) + 1);
      return mapa;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);
  const recentAuditLogs = auditLogs.slice(0, 5);
  const compactGeneralItems: ReportDetailItem[] = [
    {
      label: 'Période',
      value: `${fechaInicio} -> ${fechaFin}`,
      helper: `${productosFiltrados.length} produits • ${activeOrganisms.length} organismes actifs`,
    },
    {
      label: 'Stock et valeur',
      value: `${stockTotal} unités`,
      helper: formatCurrencySummary(valorTotalCalculado),
    },
    {
      label: 'Flux physiques',
      value: `${formatWeightSummary(operationalEntriesKg)} / ${formatWeightSummary(operationalDistributionsKg)}`,
      helper: `${operationalEntries.length} entrées • ${operationalDistributions.length} distributions sur la fenêtre mensuelle courante.`,
    },
    {
      label: 'Attention immédiate',
      value: `${lowStockProducts.length} produits`,
      helper: lowStockProducts[0]?.nombre || 'Aucune alerte prioritaire.',
    },
  ];
  const compactOperationsItems: ReportDetailItem[] = [
    {
      label: 'Flux physiques',
      value: `${formatWeightSummary(operationalEntriesKg)} / ${formatWeightSummary(operationalDistributionsKg)}`,
      helper: `${operationalEntries.length} entrées actives • ${operationalDistributions.length} distributions actives`,
    },
    { label: 'Balance', value: formatCurrencySummary(procurementValue - distributionValue), helper: `${formatCurrencySummary(procurementValue)} entrants • ${formatCurrencySummary(distributionValue)} sortants` },
    { label: 'Acteurs', value: `${operationalDonors} donateurs`, helper: `${operationalPrograms} programmes actifs` },
    { label: 'Distribution', value: `${operationalDistributions.length} commandas`, helper: topOrderingOrganisms[0] ? `${topOrderingOrganisms[0][0]} en tête` : 'Aucun organisme servi sur la période.' },
  ];
  const compactInventoryItems: ReportDetailItem[] = [
    ...topInventoryCategories.slice(0, 3).map((item) => ({ label: item.categoria, value: `${item.stock} kg`, helper: 'Volume dominant actuellement en stock.' })),
    {
      label: 'Sous seuil',
      value: lowStockProducts.length,
      helper: lowStockProducts[0] ? `${lowStockProducts[0].nombre} à surveiller en priorité.` : 'Aucune rupture imminente.',
    },
  ];
  const compactOrdersItems: ReportDetailItem[] = [
    ...orderStatusSummary.slice(0, 3).map(([status, total]) => ({ label: status, value: total, helper: 'État observé sur la période filtrée.' })),
    {
      label: 'Panier moyen',
      value: formatCurrencySummary(averageOrderValue),
      helper: topOrderingOrganisms[0] ? `${topOrderingOrganisms[0][0]} est l'organisme le plus demandeur.` : 'Aucun organisme demandeur sur la période.',
    },
  ];
  const compactPrsItems: ReportDetailItem[] = [
    { label: 'Production', value: `${totalPrsKg} kg`, helper: `${transformacionesTerminadas.length} transformations terminées` },
    ...latestTransformations.slice(0, 2).map((transformacion) => ({
      label: transformacion.recetaNombre,
      value: `${transformacion.productosGenerados.reduce((sum, producto) => sum + producto.pesoTotal, 0).toFixed(1)} kg`,
      helper: `${formatReportDate(transformacion.fecha)} • ${transformacion.responsable}`,
    })),
  ];
  const compactAuditItems: ReportDetailItem[] = [
    { label: 'Registre', value: `${auditLogs.length} événements`, helper: `${auditSuccessCount} succès • ${auditErrorCount} erreurs • ${auditCriticalCount} critiques` },
    ...recentAuditLogs.slice(0, 2).map((log) => ({
      label: `${log.modulo || 'Général'} • ${log.accion}`,
      value: log.exito ? 'Succès' : 'Erreur',
      helper: `${formatReportDate(log.fecha)} • ${log.usuario || 'Système'}`,
    })),
  ];
  const generalOverviewCards = [
    {
      key: 'products',
      label: t('reports.totalProducts'),
      value: productosFiltrados.length,
      accentColor: branding.primaryColor,
      valueColor: branding.primaryColor,
    },
    {
      key: 'orders',
      label: t('reports.ordersMonth'),
      value: comandasExportablesFiltradas.length,
      accentColor: '#4CAF50',
      valueColor: '#4CAF50',
    },
    {
      key: 'organisms',
      label: t('reports.organisms'),
      value: organismos.length,
      accentColor: '#FFC107',
      valueColor: '#FFC107',
    },
    {
      key: 'beneficiaries',
      label: t('reports.beneficiaries'),
      value: organismos.reduce((sum, organismo) => sum + organismo.beneficiarios, 0),
      accentColor: '#DC3545',
      valueColor: '#DC3545',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] relative overflow-hidden" style={reportsViewportZoom < 1 ? { zoom: reportsViewportZoom } : undefined}>
      {/* Fondo degradado con colores del branding */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            top: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{
            bottom: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            animation: 'pulse 5s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            top: '50%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            animation: 'pulse 6s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className={`relative z-10 ${showCompactReportsOverview ? 'space-y-2 p-2.5' : 'space-y-3 sm:space-y-4 p-3 sm:p-4'}`}>
        {/* Header con glassmorphism */}
        {!showCompactReportsOverview && (
          <ModulePageHeader
            title={t('reports.title')}
            subtitle={t('reports.subtitle')}
            icon={<BarChart3 className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
            accentColor={branding.primaryColor}
            secondaryColor={branding.secondaryColor}
          />
        )}

      {/* Tabs de Reportes con glassmorphism */}
      <ModuleControlSurface>
        <Tabs value={activeReportTab} onValueChange={handleReportTabChange} className="space-y-3">
          {exportableReportType && (
            <ModuleControlSurfaceHeader>
              <div className={`flex flex-col ${showCompactReportsOverview ? 'gap-2' : 'gap-4'} xl:flex-row xl:items-end xl:justify-between`}>
                <div className={`flex flex-col ${showCompactReportsOverview ? 'gap-2' : 'gap-3'}`}>
                  <div>
                    {showCompactReportsOverview && (
                      <h1 className="text-base font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        {t('reports.title')}
                      </h1>
                    )}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {usesPageDateRange ? 'Période de la vue' : 'Export de la vue'}
                    </p>
                    <p className={`${showCompactReportsOverview ? 'text-[11px]' : 'text-sm'} text-gray-600 mt-1`}>
                      {exportContextDescription}
                    </p>
                    {activeFilterDescription && (
                      <p className={`${showCompactReportsOverview ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1`}>
                        {activeFilterDescription}
                      </p>
                    )}
                  </div>
                  {showCompactReportsOverview ? (
                    <div className="flex gap-1 overflow-x-auto pb-0.5">
                      {usesPageDateRange && (
                        <>
                          <Input
                            type="date"
                            title={t('reports.startDate')}
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-[132px] h-7 bg-white/85 text-[11px]"
                          />
                          <Input
                            type="date"
                            title={t('reports.endDate')}
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-[132px] h-7 bg-white/85 text-[11px]"
                          />
                        </>
                      )}
                      {showCategoryFilter && (
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-[156px] h-7 bg-white/85 text-[11px]">
                            <SelectValue placeholder="Toutes les catégories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes les catégories</SelectItem>
                            {categoryOptions.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {showActorFilter && (
                        <Select value={selectedActor} onValueChange={setSelectedActor}>
                          <SelectTrigger className="w-[188px] h-7 bg-white/85 text-[11px]">
                            <SelectValue placeholder="Tous les donateurs / fournisseurs" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les donateurs / fournisseurs</SelectItem>
                            {actorOptions.map((actor) => (
                              <SelectItem key={actor} value={actor}>{actor}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ) : (
                    <>
                      {usesPageDateRange && (
                        <>
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium text-gray-700">{t('reports.startDate')}</span>
                              <Input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full sm:w-[160px] bg-white/85 text-xs h-9"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium text-gray-700">{t('reports.endDate')}</span>
                              <Input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full sm:w-[160px] bg-white/85 text-xs h-9"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {DATE_PRESET_OPTIONS.map((preset) => (
                              <Button
                                key={preset.value}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleApplyDatePreset(preset.value)}
                                className={`${presetActivo === preset.value ? 'border-[#1E73BE] bg-[#1E73BE] text-white hover:bg-[#1557A0] hover:text-white' : 'border-white/60 bg-white/80 text-gray-700'}`}
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
                      {(showCategoryFilter || showActorFilter) && (
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                          {showCategoryFilter && (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium text-gray-700">Catégorie</span>
                              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-[210px] h-9 bg-white/85 text-xs">
                                  <SelectValue placeholder="Toutes les catégories" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Toutes les catégories</SelectItem>
                                  {categoryOptions.map((category) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {showActorFilter && (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium text-gray-700">Donateur / fournisseur</span>
                              <Select value={selectedActor} onValueChange={setSelectedActor}>
                                <SelectTrigger className="w-full sm:w-[230px] h-9 bg-white/85 text-xs">
                                  <SelectValue placeholder="Tous les donateurs / fournisseurs" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Tous les donateurs / fournisseurs</SelectItem>
                                  {actorOptions.map((actor) => (
                                    <SelectItem key={actor} value={actor}>{actor}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="app-compact-actions xl:justify-end xl:pb-0.5">
                  <Button
                    onClick={() => handleGenerarReporte('pdf')}
                    variant="outline"
                    className={`${showCompactReportsOverview ? 'h-8 px-2 text-[11px]' : ''} border-[#DC3545] text-[#DC3545] hover:bg-red-50`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => handleGenerarReporte('excel')}
                    className={`${showCompactReportsOverview ? 'h-8 px-2 text-[11px]' : ''} bg-[#4CAF50] hover:bg-[#45a049]`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => handleGenerarReporte('csv')}
                    variant="outline"
                    className={`${showCompactReportsOverview ? 'h-8 px-2 text-[11px]' : ''} border-[#2d9561] text-[#2d9561] hover:bg-green-50`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    onClick={() => handleGenerarReporte('json')}
                    variant="outline"
                    className={`${showCompactReportsOverview ? 'h-8 px-2 text-[11px]' : ''} border-[#1a4d7a] text-[#1a4d7a] hover:bg-blue-50`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </ModuleControlSurfaceHeader>
          )}

          <TabsList className={`app-compact-tabs-grid w-full bg-transparent border-b rounded-none gap-1 ${showCompactReportsOverview ? 'flex-nowrap overflow-x-auto justify-start' : ''}`}>
            <TabsTrigger value="general" className="app-compact-tab-trigger flex-1 min-w-[96px] min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('reports.general')}
            </TabsTrigger>
            <TabsTrigger value="operaciones" className="app-compact-tab-trigger flex-1 min-w-[110px] min-h-8 px-2 py-1.5 text-[11px] gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <BarChart3 className="w-4 h-4" />
              Opérations
            </TabsTrigger>
            <TabsTrigger value="inventario" className="app-compact-tab-trigger flex-1 min-w-[96px] min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('nav.inventory')}
            </TabsTrigger>
            <TabsTrigger value="comandas" className="app-compact-tab-trigger flex-1 min-w-[96px] min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('nav.orders')}
            </TabsTrigger>
            <TabsTrigger value="prs" className="app-compact-tab-trigger flex-1 min-w-[96px] min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              PRS
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="app-compact-tab-trigger flex-1 min-w-[96px] min-h-8 px-2 py-1.5 text-[11px] gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Shield className="w-4 h-4" />
              Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className={`${showCompactReportsOverview ? 'space-y-2 p-2.5 pt-0' : 'space-y-3 p-3 sm:p-4 pt-0'}`}>
            {showCompactReportsOverview ? (
              <>
                <ReportDetailPanel
                  title="Résumé exécutif"
                  description="Version compacte de la lecture globale du module."
                  items={compactGeneralItems}
                  compact
                />
              </>
            ) : (
            <>
            <div className={`grid gap-3 ${isCompactReportsViewport ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
              {generalOverviewCards.map((card) => (
                <ReportStatCard
                  key={card.key}
                  label={card.label}
                  value={card.value}
                  accentColor={card.accentColor}
                  valueColor={card.valueColor}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <ReportDetailPanel
                title="Résumé exécutif"
                description="Lecture simple de la période affichée et de la couverture actuelle du service."
                items={[
                  {
                    label: 'Période analysée',
                    value: `${fechaInicio} -> ${fechaFin}`,
                    helper: rangoValido ? 'Les cartes, graphiques et exports suivent cette plage.' : 'La plage sélectionnée doit être corrigée pour réactiver les exports.',
                  },
                  {
                    label: 'Couverture active',
                    value: `${activeOrganisms.length} organismes`,
                    helper: `${totalBeneficiarios} bénéficiaires suivis dans le réseau.`,
                  },
                  {
                    label: 'Stock disponible',
                    value: `${stockTotal} unités`,
                    helper: `${productosFiltrados.length} produits répartis dans ${datosInventario.length} catégories.`,
                  },
                  {
                    label: 'Valeur estimée',
                    value: formatCurrencySummary(valorTotalCalculado),
                    helper: 'Estimation basée sur la valorisation disponible dans l’inventaire.',
                  },
                ]}
              />

              <ReportDetailPanel
                title="Points d'attention"
                description="Éléments à surveiller avant la prochaine revue opérationnelle."
                items={[
                  {
                    label: 'Produits en tension',
                    value: lowStockProducts.length,
                    helper: lowStockProducts.length > 0
                      ? `${lowStockProducts[0].nombre} est la référence la plus proche de sa rupture.`
                      : 'Aucun produit n’est sous son stock minimum.',
                  },
                  {
                    label: 'Flux physiques du mois',
                    value: `${formatWeightSummary(operationalEntriesKg)} / ${formatWeightSummary(operationalDistributionsKg)}`,
                    helper: `${operationalEntries.length} entrées et ${operationalDistributions.length} distributions. Balance financière actuelle: ${formatCurrencySummary(procurementValue - distributionValue)}.`,
                  },
                  {
                    label: 'Activité PRS',
                    value: `${totalPrsKg} kg`,
                    helper: `${transformacionesTerminadas.length} transformations terminées sur la période filtrée.`,
                  },
                  {
                    label: 'Audit critique',
                    value: auditCriticalCount,
                    helper: `${auditErrorCount} événements en erreur dans le registre courant.`,
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ReportChartCard chartId="report-chart-general-orders" title={t('reports.ordersMonth')} titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0} emptyHeight={isCompactReportsViewport ? 180 : 280}>
                <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 280} key="linechart-comandas-mes">
                  <LineChart data={datosComandasMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="comandas" stroke={branding.primaryColor} strokeWidth={2} name={t('nav.orders')} />
                  </LineChart>
                </ResponsiveContainer>
              </ReportChartCard>

              <ReportChartCard chartId="report-chart-general-organisms" title={t('reports.beneficiariesOrganism')} titleColor={branding.primaryColor} hasData={datosOrganismos.length > 0} emptyHeight={isCompactReportsViewport ? 180 : 280}>
                <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 280} key="barchart-organismos">
                  <BarChart data={datosOrganismos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={90} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beneficiarios" fill="#4CAF50" name={t('reports.beneficiaries')} />
                  </BarChart>
                </ResponsiveContainer>
              </ReportChartCard>
            </div>
            </>
            )}
          </TabsContent>

          <TabsContent value="operaciones" className={`${showCompactReportsOverview ? 'space-y-2 p-2.5 pt-0' : 'space-y-3 p-3 sm:p-4 pt-0'}`}>
            {showCompactReportsOverview ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ReportStatCard label="Kg entrants" value={formatWeightSummary(operationalEntriesKg)} helper={`${operationalEntries.length} entrées`} accentColor={branding.primaryColor} valueColor={branding.primaryColor} compact />
                  <ReportStatCard label="Kg distribués" value={formatWeightSummary(operationalDistributionsKg)} helper={`${operationalDistributions.length} distributions`} accentColor="#e8a419" valueColor="#e8a419" compact />
                </div>
                <ReportDetailPanel title="Lecture opérationnelle" description="Synthèse courte des flux en cours." items={compactOperationsItems} compact />
              </>
            ) : (
            <>
            <div className={`grid gap-3 ${isCompactReportsViewport ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
              <ReportStatCard label="Kg entrants du mois" value={formatWeightSummary(operationalEntriesKg)} helper={`${operationalEntries.length} entrées actives`} accentColor={branding.primaryColor} valueColor={branding.primaryColor} />
              <ReportStatCard label="Valeur entrante" value={formatCurrencySummary(procurementValue)} accentColor="#2d9561" valueColor="#2d9561" />
              <ReportStatCard label="Kg distribués du mois" value={formatWeightSummary(operationalDistributionsKg)} helper={`${operationalDistributions.length} distributions actives`} accentColor="#e8a419" valueColor="#e8a419" />
              <ReportStatCard label="Valeur sortante" value={formatCurrencySummary(distributionValue)} accentColor="#c23934" valueColor="#c23934" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <ReportDetailPanel
                title="Lecture opérationnelle"
                description="Indicateurs mensuels pour suivre l’équilibre entre approvisionnement et distribution."
                items={[
                  {
                    label: 'Période de pilotage',
                    value: currentMonthRange.label,
                    helper: 'Cette synthèse reste calée sur le mois en cours pour comparer les flux actifs.',
                  },
                  {
                    label: 'Flux physiques',
                    value: `${formatWeightSummary(operationalEntriesKg)} / ${formatWeightSummary(operationalDistributionsKg)}`,
                    helper: `${operationalEntries.length} entrées actives contre ${operationalDistributions.length} distributions actives.`,
                  },
                  {
                    label: 'Balance financière',
                    value: formatCurrencySummary(procurementValue - distributionValue),
                    helper: `${formatCurrencySummary(procurementValue)} d’entrées contre ${formatCurrencySummary(distributionValue)} de sorties valorisées.`,
                  },
                  {
                    label: 'Acteurs engagés',
                    value: `${operationalDonors} donateurs`,
                    helper: `${operationalPrograms} programmes ou campagnes actifs sur le mois courant.`,
                  },
                  {
                    label: 'Rythme de distribution',
                    value: operationalDistributions.length,
                    helper: `${topOrderingOrganisms.length} organismes se retrouvent dans le top des distributions.`,
                  },
                ]}
              />

              <ReportDetailPanel
                title="Organismes les plus servis"
                description="Classement simple des organismes les plus présents dans les commandas filtrées."
                items={topOrderingOrganisms.map(([name, total]) => ({
                  label: name,
                  value: `${total} commande${total > 1 ? 's' : ''}`,
                  helper: 'Présence comptée sur la plage de dates actuellement affichée.',
                }))}
              />
            </div>

            <ReportChartCard chartId="report-chart-operaciones-monthly" title="Tendance mensuelle des distributions" titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0} emptyHeight={isCompactReportsViewport ? 180 : 260}>
              <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 260} key="barchart-operaciones-monthly">
                <BarChart data={datosComandasMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="comandas" fill={branding.primaryColor} name="Commandes livrées" />
                </BarChart>
              </ResponsiveContainer>
            </ReportChartCard>
            </>
            )}
          </TabsContent>

          <TabsContent value="inventario" className={`${showCompactReportsOverview ? 'space-y-2 p-2.5 pt-0' : 'space-y-3 p-3 sm:p-4 pt-0'}`}>
            {showCompactReportsOverview ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ReportStatCard label="Produits" value={productosFiltrados.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} compact />
                  <ReportStatCard label="Sous seuil" value={lowStockProducts.length} accentColor="#c23934" valueColor="#c23934" compact />
                </div>
                <ReportDetailPanel title="Catégories dominantes" description="Vue rapide de l'inventaire en petit format." items={compactInventoryItems} compact />
              </>
            ) : (
            <>
            <div className={`grid gap-3 ${isCompactReportsViewport ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
              <ReportStatCard label="Produits suivis" value={productosFiltrados.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} />
              <ReportStatCard label="Stock total" value={stockTotal} accentColor="#2d9561" valueColor="#2d9561" />
              <ReportStatCard label="Catégories" value={datosInventario.length} accentColor="#e8a419" valueColor="#e8a419" />
              <ReportStatCard label="Sous seuil" value={lowStockProducts.length} accentColor="#c23934" valueColor="#c23934" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <ReportDetailPanel
                title="Catégories dominantes"
                description="Répartition des volumes actuellement les plus représentés dans l’inventaire."
                items={topInventoryCategories.map((item) => ({
                  label: item.categoria,
                  value: `${item.stock} kg`,
                  helper: 'Volume calculé à partir du poids ou du stock équivalent disponible.',
                }))}
              />

              <ReportDetailPanel
                title="Produits à surveiller"
                description="Produits déjà sous leur minimum ou proches d’un réapprovisionnement."
                items={lowStockProducts.map((producto) => ({
                  label: producto.nombre,
                  value: `${producto.stockActual}/${producto.stockMinimo}`,
                  helper: `${producto.categoria || 'Sans catégorie'} • ${producto.unidad} • ${producto.ubicacion || 'Sans emplacement'}`,
                }))}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <ReportChartCard chartId="report-chart-inventario-stock-category" title={t('reports.stockCategory')} titleColor={branding.primaryColor} hasData={datosInventario.length > 0}>
                  <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 300} key="barchart-inventario">
                    <BarChart data={datosInventario}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="categoria"
                        tickFormatter={(value) => formatChartCategoryLabel(String(value), isCompactReportsViewport ? 10 : 14)}
                        angle={isCompactReportsViewport ? -28 : -18}
                        textAnchor="end"
                        interval={0}
                        height={isCompactReportsViewport ? 52 : 64}
                        tick={{ fontSize: isCompactReportsViewport ? 10 : 11 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="stock" fill={branding.primaryColor} name={t('reports.stockKg')} />
                    </BarChart>
                  </ResponsiveContainer>
              </ReportChartCard>

              <ReportChartCard chartId="report-chart-inventario-distribution" title={t('reports.inventoryDistribution')} titleColor={branding.primaryColor} hasData={datosInventario.length > 0}>
                  <div className="space-y-3">
                    <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 260} key="piechart-inventario">
                      <PieChart>
                        <Pie
                          data={datosInventario}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isCompactReportsViewport ? 58 : 78}
                          innerRadius={isCompactReportsViewport ? 26 : 34}
                          paddingAngle={2}
                          fill="#8884d8"
                          dataKey="stock"
                        >
                          {datosInventario.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${Number(value).toFixed(1)} kg`, 'Volume']}
                          labelFormatter={(_, payload) => {
                            const item = payload?.[0]?.payload as { categoria?: string } | undefined;
                            return item?.categoria || 'Sans catégorie';
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className={`grid gap-2 ${isCompactReportsViewport ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {datosInventario
                        .slice()
                        .sort((left, right) => right.stock - left.stock)
                        .map((item, index) => {
                          const percentage = inventoryDistributionTotal > 0
                            ? ((item.stock / inventoryDistributionTotal) * 100).toFixed(1)
                            : '0.0';

                          return (
                            <div key={item.categoria} className="flex items-start gap-2 rounded-lg bg-gray-50/90 px-3 py-2">
                              <span
                                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-gray-800" title={item.categoria}>
                                  {item.categoria}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatWeightSummary(item.stock)} • {percentage}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
              </ReportChartCard>
            </div>
            </>
            )}
          </TabsContent>

          <TabsContent value="comandas" className={`${showCompactReportsOverview ? 'space-y-2 p-2.5 pt-0' : 'space-y-3 p-3 sm:p-4 pt-0'}`}>
            {showCompactReportsOverview ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ReportStatCard label="Commandes" value={comandasExportablesFiltradas.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} compact />
                  <ReportStatCard label="Panier moyen" value={formatCurrencySummary(averageOrderValue)} accentColor="#c23934" valueColor="#c23934" compact />
                </div>
                <ReportDetailPanel title="États de commandes" description="Vue compacte des commandas sur la période." items={compactOrdersItems} compact />
              </>
            ) : (
            <>
            <div className={`grid gap-3 ${isCompactReportsViewport ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
              <ReportStatCard label="Commandes filtrées" value={comandasExportablesFiltradas.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} />
              <ReportStatCard label="Organismes servis" value={topOrderingOrganisms.length} accentColor="#2d9561" valueColor="#2d9561" />
              <ReportStatCard label="Valeur cumulée" value={formatCurrencySummary(commandasTotalValue)} accentColor="#e8a419" valueColor="#e8a419" />
              <ReportStatCard label="Panier moyen" value={formatCurrencySummary(averageOrderValue)} accentColor="#c23934" valueColor="#c23934" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <ReportDetailPanel
                title="États de commandes"
                description="Répartition simple des commandas sur la période sélectionnée."
                items={orderStatusSummary.map(([status, total]) => ({
                  label: status,
                  value: total,
                  helper: 'Le statut est repris tel qu’il est stocké dans la comanda.',
                }))}
              />

              <ReportDetailPanel
                title="Organismes les plus demandants"
                description="Vue détaillée des organismes qui concentrent le plus de demandes sur la période."
                items={topOrderingOrganisms.map(([name, total]) => ({
                  label: name,
                  value: `${total} commande${total > 1 ? 's' : ''}`,
                  helper: `Valeur moyenne non pondérée incluse dans la synthèse globale de ${formatCurrencySummary(commandasTotalValue)}.`,
                }))}
              />
            </div>

            <ReportChartCard chartId="report-chart-comandas-evolution" title={t('reports.ordersEvolution')} titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0} emptyHeight={isCompactReportsViewport ? 180 : 320}>
                <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 400} key="barchart-comandas">
                  <BarChart data={datosComandasMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="comandas" fill="#4CAF50" name={t('reports.completedOrders')} />
                  </BarChart>
                </ResponsiveContainer>
            </ReportChartCard>
            </>
            )}
          </TabsContent>

          <TabsContent value="prs" className={`${showCompactReportsOverview ? 'space-y-2 p-2.5 pt-0' : 'space-y-3 p-3 sm:p-4 pt-0'}`}>
            {showCompactReportsOverview ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ReportStatCard label="Production" value={`${totalPrsKg} kg`} accentColor="#2d9561" valueColor="#2d9561" compact />
                  <ReportStatCard label="Transformations" value={transformacionesTerminadas.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} compact />
                </div>
                <ReportDetailPanel title="Dernières transformations" description="Résumé PRS en petit format." items={compactPrsItems} compact />
                <div className={LEGACY_PANEL_CLASSNAME}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>API PRS distante</h3>
                      <p className="text-[11px] text-gray-600">Synthèse Supabase live sur la période visible.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="h-8 px-2 text-[11px]" onClick={() => { void cargarReportePRSRemoto(true); }} disabled={remotePrsStatus === 'loading' || !rangoValido}>
                      <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                      Actualiser
                    </Button>
                  </div>
                  {remotePrsReport && remotePrsStatus === 'ready' ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <ReportStatCard label="Entrées distantes" value={remotePrsReport.resumen.totalEntradas} accentColor="#1E73BE" valueColor="#1E73BE" compact />
                      <ReportStatCard label="Poids distant" value={`${formatQuantity(remotePrsReport.resumen.totalPesoKg)} kg`} accentColor="#2d9561" valueColor="#2d9561" compact />
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] text-gray-500">{remotePrsStatusMessage}</p>
                  )}
                </div>
                <ReportChartCard chartId="report-chart-prs-category-compact" title="Production PRS par catégorie" titleColor={branding.primaryColor} hasData={datosPrsCategoria.length > 0} emptyHeight={160}>
                    <ResponsiveContainer width="100%" height={160} key="barchart-prs-category-compact">
                      <BarChart data={datosPrsCategoria}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="categoria"
                          tickFormatter={(value) => formatChartCategoryLabel(String(value), 10)}
                          angle={-28}
                          textAnchor="end"
                          interval={0}
                          height={52}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)} kg`, 'Production']} />
                        <Bar dataKey="kg" fill="#2d9561" name="Production PRS" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                </ReportChartCard>
              </>
            ) : (
            <>
            <div className={`grid gap-3 ${isCompactReportsViewport ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
              <ReportStatCard label="Transformations terminées" value={transformacionesTerminadas.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} />
              <ReportStatCard label="Production totale" value={`${totalPrsKg} kg`} accentColor="#2d9561" valueColor="#2d9561" />
              <ReportStatCard label="Organismes PRS" value={participatingPrsCount} accentColor="#e8a419" valueColor="#e8a419" />
              <ReportStatCard label="Moyenne par transformation" value={`${transformacionesTerminadas.length > 0 ? (totalPrsKg / transformacionesTerminadas.length).toFixed(1) : '0.0'} kg`} accentColor="#c23934" valueColor="#c23934" />
            </div>

            <div className={LEGACY_PANEL_CLASSNAME}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                    API PRS distante
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cette section consomme la fonction Supabase reports-prs pour afficher les entrées PRS distantes sur la période sélectionnée.
                  </p>
                  {remotePrsUpdatedAt && remotePrsStatus === 'ready' ? (
                    <p className="text-xs text-gray-500 mt-1">Dernière synchronisation: {remotePrsUpdatedAt}</p>
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

              {remotePrsReport && remotePrsStatus === 'ready' ? (
                <>
                  <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-gray-50/90 p-4 border border-gray-100">
                      <p className="text-xs text-gray-500">Entrées distantes</p>
                      <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>{remotePrsReport.resumen.totalEntradas}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50/90 p-4 border border-gray-100">
                      <p className="text-xs text-gray-500">Poids total distant</p>
                      <p className="text-2xl font-bold text-[#2d9561]">{formatQuantity(remotePrsReport.resumen.totalPesoKg)} kg</p>
                    </div>
                    <div className="rounded-xl bg-gray-50/90 p-4 border border-gray-100">
                      <p className="text-xs text-gray-500">Organismes couverts</p>
                      <p className="text-2xl font-bold text-[#e8a419]">{remotePrsReport.resumen.organismosUnicos}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50/90 p-4 border border-gray-100">
                      <p className="text-xs text-gray-500">Donateurs PRS</p>
                      <p className="text-2xl font-bold text-[#c23934]">{remotePrsReport.resumen.donadoresUnicos}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <ReportDetailPanel
                      title="Organisme principal à distance"
                      description="Organisme avec le plus grand volume PRS dans les données distantes."
                      items={remotePrsTopOrganism ? [
                        {
                          label: remotePrsTopOrganism.organismoNombre,
                          value: `${formatQuantity(remotePrsTopOrganism.totalPesoKg)} kg`,
                          helper: `${remotePrsTopOrganism.totalEntradas} entrées • ${formatQuantity(remotePrsTopOrganism.totalCantidad)} unités`,
                        },
                      ] : [{ label: 'Aucune donnée', value: '-', helper: 'Le rapport distant ne retourne pas encore d’organisme dominant.' }]}
                    />
                    <ReportDetailPanel
                      title="Donateur principal à distance"
                      description="Donateur PRS le plus actif dans les données distantes."
                      items={remotePrsTopDonor ? [
                        {
                          label: remotePrsTopDonor.donadorNombre,
                          value: `${formatQuantity(remotePrsTopDonor.totalPesoKg)} kg`,
                          helper: `${remotePrsTopDonor.totalEntradas} entrées • ${formatQuantity(remotePrsTopDonor.totalCantidad)} unités`,
                        },
                      ] : [{ label: 'Aucune donnée', value: '-', helper: 'Le rapport distant ne retourne pas encore de donateur dominant.' }]}
                    />
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-500">
                  {remotePrsStatusMessage}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              <ReportDetailPanel
                title="Dernières transformations"
                description="Opérations PRS terminées les plus récentes avec responsable et production générée."
                items={latestTransformations.map((transformacion) => ({
                  label: transformacion.recetaNombre,
                  value: `${transformacion.productosGenerados.reduce((sum, producto) => sum + producto.pesoTotal, 0).toFixed(1)} kg`,
                  helper: `${formatReportDate(transformacion.fecha)} • ${transformacion.responsable}`,
                }))}
              />

              <ReportDetailPanel
                title="Production mensuelle"
                description="Lecture détaillée des volumes PRS sur les derniers mois calculés."
                items={datosPRS.map((entry) => ({
                  label: entry.mes,
                  value: `${entry.kg} kg`,
                  helper: entry.kg > 0 ? 'Production enregistrée sur la période.' : 'Aucune transformation terminée sur ce mois.',
                }))}
              />

              <ReportDetailPanel
                title="Production par catégorie"
                description="Répartition PRS par catégorie de recette sur la période filtrée."
                items={datosPrsCategoria.map((entry) => ({
                  label: entry.categoria,
                  value: `${entry.kg} kg`,
                  helper: 'Poids total des produits générés pour cette catégorie.',
                }))}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <ReportChartCard chartId="report-chart-prs-monthly" title={t('reports.prsRescueMonth')} titleColor={branding.primaryColor} hasData={datosPRS.length > 0} emptyHeight={isCompactReportsViewport ? 180 : 320}>
                  <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 400} key="linechart-prs">
                    <LineChart data={datosPRS}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="kg" stroke="#4CAF50" strokeWidth={3} name={t('reports.rescuedKg')} />
                    </LineChart>
                  </ResponsiveContainer>
              </ReportChartCard>

              <ReportChartCard chartId="report-chart-prs-category" title="Production PRS par catégorie" titleColor={branding.primaryColor} hasData={datosPrsCategoria.length > 0} emptyHeight={isCompactReportsViewport ? 180 : 320}>
                  <ResponsiveContainer width="100%" height={isCompactReportsViewport ? 180 : 400} key="barchart-prs-category">
                    <BarChart data={datosPrsCategoria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="categoria"
                        tickFormatter={(value) => formatChartCategoryLabel(String(value), isCompactReportsViewport ? 10 : 14)}
                        angle={isCompactReportsViewport ? -28 : -18}
                        textAnchor="end"
                        interval={0}
                        height={isCompactReportsViewport ? 52 : 64}
                        tick={{ fontSize: isCompactReportsViewport ? 10 : 11 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)} kg`, 'Production']} />
                      <Legend />
                      <Bar dataKey="kg" fill="#2d9561" name="Production PRS" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
              </ReportChartCard>
            </div>
            </>
            )}
          </TabsContent>

          <TabsContent value="auditoria" className={`${showCompactReportsOverview ? 'space-y-2 p-2.5 pt-0' : 'space-y-3 p-3 sm:p-4 pt-0'}`}>
            {showCompactReportsOverview ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ReportStatCard label="Événements" value={auditLogs.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} compact />
                  <ReportStatCard label="Critiques" value={auditCriticalCount} accentColor="#c23934" valueColor="#c23934" compact />
                </div>
                <ReportDetailPanel title="Modules les plus journalisés" description="Résumé du registre d'audit en petit format." items={compactAuditItems} compact />
              </>
            ) : (
            <>
            <div className={`grid gap-3 ${isCompactReportsViewport ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
              <ReportStatCard label="Événements totaux" value={auditLogs.length} accentColor={branding.primaryColor} valueColor={branding.primaryColor} />
              <ReportStatCard label="Succès" value={auditSuccessCount} accentColor="#2d9561" valueColor="#2d9561" />
              <ReportStatCard label="Erreurs" value={auditErrorCount} accentColor="#e8a419" valueColor="#e8a419" />
              <ReportStatCard label="Critiques" value={auditCriticalCount} accentColor="#c23934" valueColor="#c23934" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <ReportDetailPanel
                title="Modules les plus journalisés"
                description="Vue synthétique des modules qui produisent le plus d’événements dans le registre actuel."
                items={auditModuleSummary.map(([module, total]) => ({
                  label: module,
                  value: total,
                  helper: 'Nombre brut d’événements journalisés pour ce module.',
                }))}
              />

              <ReportDetailPanel
                title="Derniers événements"
                description="Aperçu rapide avant de descendre dans le journal complet."
                items={recentAuditLogs.map((log) => ({
                  label: `${log.modulo || 'Général'} • ${log.accion}`,
                  value: log.exito ? 'Succès' : 'Erreur',
                  helper: `${formatReportDate(log.fecha)} • ${log.usuario || 'Système'}${log.severidad ? ` • ${log.severidad}` : ''}`,
                }))}
              />
            </div>

            <AuditLogViewer />
            </>
            )}
          </TabsContent>
        </Tabs>

        <div aria-hidden="true" style={REPORT_EXPORT_CANVAS_STYLE}>
          {activeReportTab === 'general' && (
            <div className="grid grid-cols-1 gap-4">
              <ExportChartCard chartId="pdf-chart-general-orders" title={t('reports.ordersMonth')} titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0} emptyHeight={280}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={datosComandasMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="comandas" stroke={branding.primaryColor} strokeWidth={2} name={t('nav.orders')} />
                  </LineChart>
                </ResponsiveContainer>
              </ExportChartCard>

              <ExportChartCard chartId="pdf-chart-general-organisms" title={t('reports.beneficiariesOrganism')} titleColor={branding.primaryColor} hasData={datosOrganismos.length > 0} emptyHeight={280}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={datosOrganismos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={90} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beneficiarios" fill="#4CAF50" name={t('reports.beneficiaries')} />
                  </BarChart>
                </ResponsiveContainer>
              </ExportChartCard>
            </div>
          )}

          {activeReportTab === 'operaciones' && (
            <ExportChartCard chartId="pdf-chart-operaciones-monthly" title="Tendance mensuelle des distributions" titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0} emptyHeight={260}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={datosComandasMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="comandas" fill={branding.primaryColor} name="Commandes livrées" />
                </BarChart>
              </ResponsiveContainer>
            </ExportChartCard>
          )}

          {activeReportTab === 'inventario' && (
            <div className="grid grid-cols-1 gap-4">
              <ExportChartCard chartId="pdf-chart-inventario-stock-category" title={t('reports.stockCategory')} titleColor={branding.primaryColor} hasData={datosInventario.length > 0} emptyHeight={300}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosInventario}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="categoria"
                      tickFormatter={(value) => formatChartCategoryLabel(String(value), 14)}
                      angle={-18}
                      textAnchor="end"
                      interval={0}
                      height={64}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill={branding.primaryColor} name={t('reports.stockKg')} />
                  </BarChart>
                </ResponsiveContainer>
              </ExportChartCard>

              <ExportChartCard chartId="pdf-chart-inventario-distribution" title={t('reports.inventoryDistribution')} titleColor={branding.primaryColor} hasData={datosInventario.length > 0} emptyHeight={320}>
                <div className="space-y-3">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={datosInventario}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={78}
                        innerRadius={34}
                        paddingAngle={2}
                        fill="#8884d8"
                        dataKey="stock"
                      >
                        {datosInventario.map((entry, index) => (
                          <Cell key={`pdf-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${Number(value).toFixed(1)} kg`, 'Volume']}
                        labelFormatter={(_, payload) => {
                          const item = payload?.[0]?.payload as { categoria?: string } | undefined;
                          return item?.categoria || 'Sans catégorie';
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-2">
                    {datosInventario
                      .slice()
                      .sort((left, right) => right.stock - left.stock)
                      .map((item, index) => {
                        const percentage = inventoryDistributionTotal > 0
                          ? ((item.stock / inventoryDistributionTotal) * 100).toFixed(1)
                          : '0.0';

                        return (
                          <div key={`pdf-legend-${item.categoria}`} className="flex items-start gap-2 rounded-lg bg-gray-50/90 px-3 py-2">
                            <span
                              className="mt-1 h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-gray-800" title={item.categoria}>
                                {item.categoria}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatWeightSummary(item.stock)} • {percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </ExportChartCard>
            </div>
          )}

          {activeReportTab === 'comandas' && (
            <ExportChartCard chartId="pdf-chart-comandas-evolution" title={t('reports.ordersEvolution')} titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0} emptyHeight={320}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosComandasMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="comandas" fill="#4CAF50" name={t('reports.completedOrders')} />
                </BarChart>
              </ResponsiveContainer>
            </ExportChartCard>
          )}

          {activeReportTab === 'prs' && (
            <div className="grid grid-cols-1 gap-4">
              <ExportChartCard chartId="pdf-chart-prs-monthly" title={t('reports.prsRescueMonth')} titleColor={branding.primaryColor} hasData={datosPRS.length > 0} emptyHeight={320}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={datosPRS}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="kg" stroke="#4CAF50" strokeWidth={3} name={t('reports.rescuedKg')} />
                  </LineChart>
                </ResponsiveContainer>
              </ExportChartCard>

              <ExportChartCard chartId="pdf-chart-prs-category" title="Production PRS par catégorie" titleColor={branding.primaryColor} hasData={datosPrsCategoria.length > 0} emptyHeight={320}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={datosPrsCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="categoria"
                      tickFormatter={(value) => formatChartCategoryLabel(String(value), 14)}
                      angle={-18}
                      textAnchor="end"
                      interval={0}
                      height={64}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${Number(value).toFixed(1)} kg`, 'Production']} />
                    <Legend />
                    <Bar dataKey="kg" fill="#2d9561" name="Production PRS" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ExportChartCard>
            </div>
          )}
        </div>
      </ModuleControlSurface>
      </div>
    </div>
  );
}