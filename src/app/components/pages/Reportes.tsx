import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, BarChart3, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { obtenerProductos, type ProductoCreado } from '../../utils/productStorage';
import { obtenerComandas } from '../../utils/comandaStorage';
import { obtenerOrganismos, type Organismo } from '../../utils/organismosStorage';
import { obtenerTransformaciones, type Transformacion } from '../../utils/recetaStorage';
import { obtenerTodasLasEntradas } from '../../utils/entradaInventarioStorage';
import { obtenerLogs } from '../../utils/auditStorage';
import { 
  exportarInventarioPDF, 
  exportarComandasPDF, 
  exportarOrganismosPDF,
  exportarEstadisticasPDF,
  exportarReportePersonalizado,
} from '../../utils/exportarPDF';
import { 
  exportarInventarioExcel, 
  exportarComandasExcel, 
  exportarOrganismosExcel,
  exportarEstadisticasExcel,
  exportarDatosPersonalizados,
} from '../../utils/exportarExcel';
import { exportData, generateFilename, type TableColumn } from '../../utils/exportUtils';
import { useBranding } from '../../../hooks/useBranding';
import { AuditLogViewer } from '../auditoria/AuditLogViewer';
import { ReportsModule } from '../reports/ReportsModule';
import { obtenerComandasReporte } from '../reports/reportComandas';
import { isActiveReportComanda } from '../reports/reportComandaStatus';
import { registrarActividad } from '../../utils/actividadLogger';
import type { Comanda } from '../../types';

type ComandaExportable = Comanda & {
  organismo?: {
    nombre?: string;
  };
};

type DatePreset = 'today' | 'last7days' | 'last30days' | 'month';
type ReportTab = 'general' | 'operaciones' | 'inventario' | 'comandas' | 'prs' | 'auditoria';
type ExportableReportType = 'general' | 'operaciones' | 'inventario' | 'comandas' | 'prs' | 'auditoria' | 'organismos';
type ReportExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

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

const LEGACY_PANEL_CLASSNAME = 'backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40';

type ReportStatCardProps = {
  label: string;
  value: React.ReactNode;
  accentColor: string;
  valueColor: string;
};

function ReportStatCard({ label, value, accentColor, valueColor }: ReportStatCardProps) {
  return (
    <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4" style={{ borderLeftColor: accentColor }}>
      <p className="text-xs sm:text-sm text-gray-600">{label}</p>
      <div className="text-2xl sm:text-3xl font-bold mt-1" style={{ fontFamily: 'Montserrat, sans-serif', color: valueColor }}>
        {value}
      </div>
    </div>
  );
}

type ReportChartCardProps = {
  title: string;
  titleColor: string;
  hasData: boolean;
  emptyHeight?: number;
  children: React.ReactNode;
};

function ReportChartCard({ title, titleColor, hasData, emptyHeight = 300, children }: ReportChartCardProps) {
  return (
    <div className={LEGACY_PANEL_CLASSNAME}>
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

export function Reportes() {
  const { t } = useTranslation();
  const branding = useBranding();
  const initialRange = getDatePresetRange('month');
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('operaciones');
  const [fechaInicio, setFechaInicio] = useState(initialRange.start);
  const [fechaFin, setFechaFin] = useState(initialRange.end);
  const [productos, setProductos] = useState<ProductoCreado[]>([]);
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [transformaciones, setTransformaciones] = useState<Transformacion[]>([]);

  const cargarDatos = () => {
    setProductos(obtenerProductos());
    setComandas(obtenerComandas());
    setOrganismos(obtenerOrganismos());
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
  const presetActivo = DATE_PRESET_OPTIONS.find((preset) => {
    const rango = getDatePresetRange(preset.value);
    return rango.start === fechaInicio && rango.end === fechaFin;
  })?.value;
  const exportableReportType = REPORT_TAB_TO_TYPE[activeReportTab];
  const usesPageDateRange = exportableReportType ? PAGE_RANGE_REPORT_TYPES.includes(exportableReportType) : false;
  const exportContextDescription = exportableReportType === 'operaciones'
    ? 'Télécharge un résumé consolidé du mois en cours pour les rapports opérationnels.'
    : exportableReportType === 'auditoria'
      ? 'Télécharge l\'état actuel du registre d\'audit.'
      : 'Les graphiques et exports de cette vue utilisent cette plage de dates.';
  const comandasFiltradas = rangoValido
    ? comandas.filter((comanda) => isDateInRange(comanda.fechaEntrega || comanda.fechaCreacion || comanda.fecha, rangoInicio, rangoFin))
    : [];
  const transformacionesTerminadas = rangoValido
    ? transformaciones.filter((transformacion) => isDateInRange(transformacion.fecha, rangoInicio, rangoFin) && transformacion.estado === 'terminée')
    : [];

  const datosInventario = Array.from(
    productos.reduce((mapa, producto) => {
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
      comandas: delMes.length,
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

  const comandasExportables: ComandaExportable[] = comandasFiltradas.map((comanda) => ({
    ...comanda,
    organismo: (comanda as ComandaExportable).organismo ?? (comanda.organismoId ? { nombre: organismosPorId.get(comanda.organismoId)?.nombre || 'N/A' } : undefined),
  }));

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

  const valorTotalCalculado = productos.reduce((sum, producto) => {
    if (producto.valorTotal && producto.valorTotal > 0) {
      return sum + producto.valorTotal;
    }

    if (producto.valorUnitario && producto.valorUnitario > 0) {
      return sum + (producto.valorUnitario * producto.stockActual);
    }

    return sum;
  }, 0);

  const COLORS = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#9C27B0', '#00BCD4'];

  const handleApplyDatePreset = (preset: DatePreset) => {
    const rango = getDatePresetRange(preset);
    setFechaInicio(rango.start);
    setFechaFin(rango.end);
  };

  const handleReportTabChange = (value: string) => {
    setActiveReportTab(value as ReportTab);
  };

  const handleGenerarReporte = async (formato: ReportExportFormat) => {
    if (!exportableReportType) {
      toast.info('Cette vue utilise ses propres filtres et exportations.');
      return;
    }

    if (usesPageDateRange && !rangoValido) {
      toast.error('Définissez une plage de dates valide avant de générer un rapport.');
      return;
    }
    
    try {
      switch (exportableReportType) {
        case 'operaciones': {
          const currentMonthRange = getCurrentMonthReportRange();
          const operationalEntries = obtenerTodasLasEntradas().filter((entry) => entry.activo && isDateInRange(entry.fecha, currentMonthRange.start, currentMonthRange.end));
          const operationalDistributions = obtenerComandasReporte()
            .filter(isActiveReportComanda)
            .filter((comanda) => isDateInRange(comanda.fecha, currentMonthRange.start, currentMonthRange.end));

          const procurementValue = operationalEntries.reduce(
            (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
            0,
          );
          const distributionValue = operationalDistributions.reduce(
            (sum, comanda) => sum + getSafeNumericValue(comanda.totalValorMonetario),
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
            { Indicateur: 'Approvisionnements', Valeur: operationalEntries.length },
            { Indicateur: 'Valeur approvisionnement', Valeur: `CAD$ ${procurementValue.toFixed(2)}` },
            { Indicateur: 'Distributions', Valeur: operationalDistributions.length },
            { Indicateur: 'Valeur distribution', Valeur: `CAD$ ${distributionValue.toFixed(2)}` },
            { Indicateur: 'Donateurs actifs', Valeur: activeDonors },
            { Indicateur: 'Programmes actifs', Valeur: activePrograms },
          ];

          if (formato === 'pdf') {
            exportarReportePersonalizado(
              'Rapports opérationnels',
              `Résumé consolidé du mois en cours (${currentMonthRange.label})`,
              [
                {
                  titulo: 'Résumé opérationnel',
                  columnas: ['Indicateur', 'Valeur'],
                  datos: operationalSummary.map((row) => [row.Indicateur, String(row.Valeur)]),
                },
              ],
              'rapport-operaciones'
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
                      Quantité: getSafeNumericValue(comanda.totalPeso),
                      Valeur: getSafeNumericValue(comanda.totalValorMonetario),
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
                      Quantité: getSafeNumericValue(comanda.totalPeso),
                      Valeur: getSafeNumericValue(comanda.totalValorMonetario),
                    }))
                  : [{ Section: 'Distribution', Note: 'Aucune donnée disponible.' }]),
              ],
            );
          }
          break;
        }

        case 'inventario':
          if (formato === 'pdf') {
            exportarInventarioPDF(productos);
          } else if (formato === 'excel') {
            exportarInventarioExcel(productos);
          } else {
            await exportStructuredRows(
              formato,
              'rapport_inventaire',
              'Rapport d\'inventaire',
              `Vue exportée le ${new Date().toLocaleDateString('fr-CA')}`,
              productos.length > 0
                ? productos.map((producto) => ({
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
            exportarComandasPDF(comandasExportables);
          } else if (formato === 'excel') {
            exportarComandasExcel(comandasExportables);
          } else {
            await exportStructuredRows(
              formato,
              'rapport_commandes',
              'Rapport de commandas',
              `Période: ${fechaInicio} - ${fechaFin}`,
              comandasExportables.length > 0
                ? comandasExportables.map((comanda) => ({
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
            exportarReportePersonalizado('Rapport PRS', `Période: ${fechaInicio} - ${fechaFin}`, [
              {
                titulo: 'Résumé PRS',
                columnas: ['Indicateur', 'Valeur'],
                datos: [
                  ['Transformations terminées', String(transformacionesTerminadas.length)],
                  ['Production totale (kg)', String(Number(transformacionesTerminadas.reduce((sum, transformacion) => sum + transformacion.productosGenerados.reduce((subtotal, producto) => subtotal + producto.pesoTotal, 0), 0).toFixed(1)))],
                  ['Organismes PRS', String(organismos.filter((organismo) => organismo.participantePRS).length)],
                ],
              },
            ]);
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
            exportarReportePersonalizado(
              'Rapport d\'audit',
              `Export du registre courant (${auditLogs.length} événements)`,
              [
                {
                  titulo: 'Résumé d\'audit',
                  columnas: ['Indicateur', 'Valeur'],
                  datos: auditSummary.map((row) => [row.Indicateur, String(row.Valeur)]),
                },
                {
                  titulo: 'Derniers événements',
                  columnas: ['Date', 'Utilisateur', 'Module', 'Action', 'Succès'],
                  datos: (auditLogs.length > 0 ? auditLogs.slice(0, 100) : [{ fecha: 'N/A', usuario: 'N/A', modulo: 'N/A', accion: 'N/A', exito: false }])
                    .map((log) => [
                      log.fecha,
                      log.usuario,
                      log.modulo,
                      log.accion,
                      log.exito ? 'Oui' : 'Non',
                    ]),
                },
              ],
              'rapport-audit'
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
            totalProductos: productos.length,
            totalStock: productos.reduce((sum, producto) => sum + producto.stockActual, 0),
            totalComandas: comandasFiltradas.length,
            totalOrganismos: organismos.filter((organismo) => organismo.activo).length,
            valorTotal: valorTotalCalculado,
            periodo: `${fechaInicio} - ${fechaFin}`,
          };
          
          if (formato === 'pdf') {
            exportarEstadisticasPDF(estadisticas);
          } else if (formato === 'excel') {
            exportarEstadisticasExcel({
              resumen: estadisticas,
              inventario: productos.map((producto) => ({
                Code: producto.codigo || 'N/A',
                Produit: producto.nombre,
                Catégorie: producto.categoria,
                Stock: producto.stockActual,
                Unité: producto.unidad,
              })),
              comandas: comandasExportables.map((comanda) => ({
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
                { Section: 'Résumé général', Indicateur: 'Total produits', Valeur: productos.length },
                { Section: 'Résumé général', Indicateur: 'Stock total', Valeur: productos.reduce((sum, producto) => sum + producto.stockActual, 0) },
                { Section: 'Résumé général', Indicateur: 'Commandes filtrées', Valeur: comandasFiltradas.length },
                { Section: 'Résumé général', Indicateur: 'Organismes actifs', Valeur: organismos.filter((organismo) => organismo.activo).length },
                { Section: 'Résumé général', Indicateur: 'Valeur totale', Valeur: Number(valorTotalCalculado.toFixed(2)) },
                ...(productos.length > 0
                  ? productos.map((producto) => ({
                      Section: 'Inventaire',
                      Code: producto.codigo || 'N/A',
                      Produit: producto.nombre,
                      Catégorie: producto.categoria || 'N/A',
                      Stock: producto.stockActual,
                      Unité: producto.unidad,
                    }))
                  : [{ Section: 'Inventaire', Note: 'Aucune donnée disponible.' }]),
                ...(comandasExportables.length > 0
                  ? comandasExportables.map((comanda) => ({
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
        { tipoReporte: exportableReportType, formato, fechaInicio, fechaFin }
      );
      
      toast.success(`✅ Rapport ${formato.toUpperCase()} généré avec succès`);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast.error('❌ Erreur lors de la génération du rapport');
    }
  };

  const generalOverviewCards = [
    {
      key: 'products',
      label: t('reports.totalProducts'),
      value: productos.length,
      accentColor: branding.primaryColor,
      valueColor: branding.primaryColor,
    },
    {
      key: 'orders',
      label: t('reports.ordersMonth'),
      value: comandasFiltradas.length,
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
    <div className="min-h-screen relative overflow-hidden">
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
      <div className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
            {t('reports.title')}
          </h1>
          <p className="text-gray-700">{t('reports.subtitle')}</p>
        </div>

      {/* Tabs de Reportes con glassmorphism */}
      <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border border-white/60">
        <Tabs value={activeReportTab} onValueChange={handleReportTabChange} className="space-y-4">
          {exportableReportType && (
            <div className="border-b border-white/60 px-4 pt-4 sm:px-6 sm:pt-6 pb-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {usesPageDateRange ? 'Période de la vue' : 'Export de la vue'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {exportContextDescription}
                    </p>
                  </div>
                  {usesPageDateRange && (
                    <>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-700">{t('reports.startDate')}</span>
                          <Input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full sm:w-[170px] bg-white/85"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-700">{t('reports.endDate')}</span>
                          <Input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-full sm:w-[170px] bg-white/85"
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
                            className={presetActivo === preset.value ? 'border-[#1E73BE] bg-[#1E73BE] text-white hover:bg-[#1557A0] hover:text-white' : 'border-white/60 bg-white/80 text-gray-700'}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 xl:pb-0.5 xl:justify-end">
                  <Button
                    onClick={() => handleGenerarReporte('pdf')}
                    variant="outline"
                    className="border-[#DC3545] text-[#DC3545] hover:bg-red-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => handleGenerarReporte('excel')}
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => handleGenerarReporte('csv')}
                    variant="outline"
                    className="border-[#2d9561] text-[#2d9561] hover:bg-green-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    onClick={() => handleGenerarReporte('json')}
                    variant="outline"
                    className="border-[#1a4d7a] text-[#1a4d7a] hover:bg-blue-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </div>
          )}

          <TabsList className="w-full bg-transparent border-b rounded-none flex flex-wrap">
            <TabsTrigger value="general" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('reports.general')}
            </TabsTrigger>
            <TabsTrigger value="operaciones" className="flex-1 min-w-[140px] gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <BarChart3 className="w-4 h-4" />
              Opérations
            </TabsTrigger>
            <TabsTrigger value="inventario" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('nav.inventory')}
            </TabsTrigger>
            <TabsTrigger value="comandas" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('nav.orders')}
            </TabsTrigger>
            <TabsTrigger value="prs" className="flex-1 min-w-[120px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              PRS
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex-1 min-w-[120px] gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Shield className="w-4 h-4" />
              Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ReportChartCard title={t('reports.ordersMonth')} titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0}>
                  <ResponsiveContainer width="100%" height={300} key="linechart-comandas-mes">
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

              <ReportChartCard title={t('reports.beneficiariesOrganism')} titleColor={branding.primaryColor} hasData={datosOrganismos.length > 0}>
                  <ResponsiveContainer width="100%" height={300} key="barchart-organismos">
                    <BarChart data={datosOrganismos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="beneficiarios" fill="#4CAF50" name={t('reports.beneficiaries')} />
                    </BarChart>
                  </ResponsiveContainer>
              </ReportChartCard>
            </div>
          </TabsContent>

          <TabsContent value="operaciones" className="space-y-4 p-4 sm:p-6 pt-0">
            <div className={LEGACY_PANEL_CLASSNAME}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#1a4d7a]/10 p-3 text-[#1a4d7a]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                    Rapports opérationnels
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Approvisionnement, distribution y comparatifs consolidés ahora viven dentro del módulo Rapports.
                  </p>
                </div>
              </div>
            </div>

            <ReportsModule embedded hideHeader />
          </TabsContent>

          <TabsContent value="inventario" className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ReportChartCard title={t('reports.stockCategory')} titleColor={branding.primaryColor} hasData={datosInventario.length > 0}>
                  <ResponsiveContainer width="100%" height={300} key="barchart-inventario">
                    <BarChart data={datosInventario}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="stock" fill={branding.primaryColor} name={t('reports.stockKg')} />
                    </BarChart>
                  </ResponsiveContainer>
              </ReportChartCard>

              <ReportChartCard title={t('reports.inventoryDistribution')} titleColor={branding.primaryColor} hasData={datosInventario.length > 0}>
                  <ResponsiveContainer width="100%" height={300} key="piechart-inventario">
                    <PieChart>
                      <Pie
                        data={datosInventario}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.categoria}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="stock"
                      >
                        {datosInventario.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
              </ReportChartCard>
            </div>
          </TabsContent>

          <TabsContent value="comandas" className="space-y-4 p-4 sm:p-6 pt-0">
            <ReportChartCard title={t('reports.ordersEvolution')} titleColor={branding.primaryColor} hasData={datosComandasMes.length > 0} emptyHeight={400}>
                <ResponsiveContainer width="100%" height={400} key="barchart-comandas">
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
          </TabsContent>

          <TabsContent value="prs" className="space-y-4 p-4 sm:p-6 pt-0">
            <ReportChartCard title={t('reports.prsRescueMonth')} titleColor={branding.primaryColor} hasData={datosPRS.length > 0} emptyHeight={400}>
                <ResponsiveContainer width="100%" height={400} key="linechart-prs">
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
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-4 p-4 sm:p-6 pt-0">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}