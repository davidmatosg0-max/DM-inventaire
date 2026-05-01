/**
 * Utilidades para Generación de Reportes
 * 
 * Funciones para calcular, agregar y formatear datos de reportes.
 */

import type {
  ReportConfig,
  ReportPeriod,
  EntryRecord,
  ExitRecord,
  EntryReport,
  ExitReport,
  DonorReport,
  ProgramReport,
  PeriodSummary,
  CategorySummary,
  DonorSummary,
  ProgramSummary,
  OrganismSummary,
  ProductSummary,
  ReportChartData
} from '../types/reports';

// ==================== FILTRADO DE DATOS ====================

/**
 * Filtrar registros por configuración de reporte
 */
export function filterRecords<T extends { date: Date }>(
  records: T[],
  config: ReportConfig
): T[] {
  let filtered = [...records];
  const { filters, startDate, endDate } = config;

  // Filtro por fecha
  if (startDate) {
    filtered = filtered.filter(r => new Date(r.date) >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(r => new Date(r.date) <= endDate);
  }

  return filtered;
}

/**
 * Obtener rango de fechas según período
 */
export function getDateRange(period: ReportPeriod): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last7days':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;

    case 'last30days':
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;

    case 'thisMonth':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;

    case 'lastMonth':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0); // Último día del mes anterior
      end.setHours(23, 59, 59, 999);
      break;

    case 'thisYear':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;

    case 'lastYear':
      start.setFullYear(start.getFullYear() - 1, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(end.getFullYear() - 1, 11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      // custom - usar fechas del config
      break;
  }

  return { start, end };
}

// ==================== GENERACIÓN DE REPORTES DE ENTRADA ====================

/**
 * Generar reporte completo de entradas
 */
export function generateEntryReport(
  entries: EntryRecord[],
  config: ReportConfig
): EntryReport {
  const filtered = filterRecords(entries, config);

  // Calcular totales
  const totalEntries = filtered.length;
  const totalProducts = filtered.reduce((sum, e) => sum + e.products.length, 0);
  const totalQuantity = filtered.reduce((sum, e) => sum + e.totalQuantity, 0);
  const totalValue = filtered.reduce((sum, e) => sum + e.totalValue, 0);

  // Donadores únicos
  const uniqueDonors = new Set(filtered.map(e => e.donorId)).size;
  
  // Productos únicos
  const allProducts = filtered.flatMap(e => e.products);
  const uniqueProducts = new Set(allProducts.map(p => p.productId)).size;

  // Top donador
  const donorCounts = groupBy(filtered, 'donorId');
  const topDonor = Object.entries(donorCounts)
    .sort((a, b) => b[1].length - a[1].length)[0]?.[1][0]?.donorName || 'N/A';

  // Top categoría
  const categoryTotals = groupByCategory(allProducts);
  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1].totalValue - a[1].totalValue)[0]?.[0] || 'N/A';

  const summary = {
    period: formatPeriod(config.period, config.startDate, config.endDate),
    totalEntries,
    totalProducts,
    totalQuantity,
    totalValue,
    uniqueDonors,
    uniqueProducts,
    averageEntryValue: totalEntries > 0 ? totalValue / totalEntries : 0,
    topDonor,
    topCategory
  };

  const details = filtered.map(entry => ({
    entryId: entry.id,
    entryNumber: entry.entryNumber,
    date: entry.date,
    donorName: entry.donorName,
    warehouseName: entry.warehouseName,
    productCount: entry.products.length,
    totalQuantity: entry.totalQuantity,
    totalValue: entry.totalValue,
    status: entry.status,
    receivedBy: entry.receivedBy
  }));

  const byDonor = generateDonorSummary(filtered);
  const byCategory = generateCategorySummary(allProducts, totalValue);
  const byWarehouse = generateWarehouseSummary(filtered, 'entry');
  const byPeriod = generatePeriodSummary(filtered, config.groupBy || 'month');

  const charts = generateEntryCharts(summary, byDonor, byCategory, byPeriod);

  return {
    summary,
    details,
    byDonor,
    byCategory,
    byWarehouse,
    byPeriod,
    charts
  };
}

// ==================== GENERACIÓN DE REPORTES DE SALIDA ====================

/**
 * Generar reporte completo de salidas
 */
export function generateExitReport(
  exits: ExitRecord[],
  config: ReportConfig
): ExitReport {
  const filtered = filterRecords(exits, config);

  const totalExits = filtered.length;
  const totalProducts = filtered.reduce((sum, e) => sum + e.products.length, 0);
  const totalQuantity = filtered.reduce((sum, e) => sum + e.totalQuantity, 0);
  const totalValue = filtered.reduce((sum, e) => sum + e.totalValue, 0);
  const totalBeneficiaries = filtered.reduce((sum, e) => sum + e.beneficiaries, 0);

  const uniquePrograms = new Set(filtered.map(e => e.programId)).size;
  const uniqueOrganisms = new Set(filtered.map(e => e.organismId)).size;

  const programCounts = groupBy(filtered, 'programId');
  const topProgram = Object.entries(programCounts)
    .sort((a, b) => b[1].length - a[1].length)[0]?.[1][0]?.programName || 'N/A';

  const organismCounts = groupBy(filtered, 'organismId');
  const topOrganism = Object.entries(organismCounts)
    .sort((a, b) => b[1].length - a[1].length)[0]?.[1][0]?.organismName || 'N/A';

  const summary = {
    period: formatPeriod(config.period, config.startDate, config.endDate),
    totalExits,
    totalProducts,
    totalQuantity,
    totalValue,
    totalBeneficiaries,
    uniquePrograms,
    uniqueOrganisms,
    averageExitValue: totalExits > 0 ? totalValue / totalExits : 0,
    topProgram,
    topOrganism
  };

  const details = filtered.map(exit => ({
    exitId: exit.id,
    exitNumber: exit.exitNumber,
    date: exit.date,
    programName: exit.programName,
    organismName: exit.organismName,
    warehouseName: exit.warehouseName,
    productCount: exit.products.length,
    totalQuantity: exit.totalQuantity,
    totalValue: exit.totalValue,
    beneficiaries: exit.beneficiaries,
    status: exit.status,
    deliveredBy: exit.deliveredBy
  }));

  const allProducts = filtered.flatMap(e => e.products);
  
  const byProgram = generateProgramSummary(filtered);
  const byOrganism = generateOrganismSummary(filtered);
  const byCategory = generateCategorySummary(allProducts, totalValue);
  const byWarehouse = generateWarehouseSummary(filtered, 'exit');
  const byPeriod = generatePeriodSummary(filtered, config.groupBy || 'month', true);

  const charts = generateExitCharts(summary, byProgram, byCategory, byPeriod);

  return {
    summary,
    details,
    byProgram,
    byOrganism,
    byCategory,
    byWarehouse,
    byPeriod,
    charts
  };
}

// ==================== SUMARIOS ====================

/**
 * Generar sumario por donador
 */
function generateDonorSummary(entries: EntryRecord[]): DonorSummary[] {
  const grouped = groupBy(entries, 'donorId');
  const totalValue = entries.reduce((sum, e) => sum + e.totalValue, 0);

  return Object.values(grouped).map(group => {
    const donorEntries = group;
    const donorValue = donorEntries.reduce((sum, e) => sum + e.totalValue, 0);

    return {
      donorId: donorEntries[0].donorId,
      donorName: donorEntries[0].donorName,
      donorType: donorEntries[0].donorType,
      totalEntries: donorEntries.length,
      totalProducts: donorEntries.reduce((sum, e) => sum + e.products.length, 0),
      totalQuantity: donorEntries.reduce((sum, e) => sum + e.totalQuantity, 0),
      totalValue: donorValue,
      percentage: (donorValue / totalValue) * 100
    };
  }).sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Generar sumario por programa
 */
function generateProgramSummary(exits: ExitRecord[]): ProgramSummary[] {
  const grouped = groupBy(exits, 'programId');
  const totalValue = exits.reduce((sum, e) => sum + e.totalValue, 0);

  return Object.values(grouped).map(group => {
    const programExits = group;
    const programValue = programExits.reduce((sum, e) => sum + e.totalValue, 0);

    return {
      programId: programExits[0].programId,
      programName: programExits[0].programName,
      programType: 'regular', // Aquí deberías obtener el tipo real
      totalExits: programExits.length,
      totalProducts: programExits.reduce((sum, e) => sum + e.products.length, 0),
      totalQuantity: programExits.reduce((sum, e) => sum + e.totalQuantity, 0),
      totalValue: programValue,
      beneficiaries: programExits.reduce((sum, e) => sum + e.beneficiaries, 0),
      percentage: (programValue / totalValue) * 100
    };
  }).sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Generar sumario por organismo
 */
function generateOrganismSummary(exits: ExitRecord[]): OrganismSummary[] {
  const grouped = groupBy(exits, 'organismId');
  const totalValue = exits.reduce((sum, e) => sum + e.totalValue, 0);

  return Object.values(grouped).map(group => {
    const organismExits = group;
    const organismValue = organismExits.reduce((sum, e) => sum + e.totalValue, 0);

    return {
      organismId: organismExits[0].organismId,
      organismName: organismExits[0].organismName,
      organismType: organismExits[0].organismType,
      totalExits: organismExits.length,
      totalProducts: organismExits.reduce((sum, e) => sum + e.products.length, 0),
      totalQuantity: organismExits.reduce((sum, e) => sum + e.totalQuantity, 0),
      totalValue: organismValue,
      beneficiaries: organismExits.reduce((sum, e) => sum + e.beneficiaries, 0),
      percentage: (organismValue / totalValue) * 100
    };
  }).sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Generar sumario por categoría
 */
function generateCategorySummary(products: any[], totalValue: number): CategorySummary[] {
  const grouped = groupByCategory(products);

  return Object.entries(grouped).map(([category, data]) => ({
    category,
    totalProducts: data.count,
    totalQuantity: data.totalQuantity,
    totalValue: data.totalValue,
    percentage: (data.totalValue / totalValue) * 100,
    avgUnitValue: data.totalValue / data.totalQuantity
  })).sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Generar sumario por bodega
 */
function generateWarehouseSummary(
  records: any[],
  type: 'entry' | 'exit'
): any[] {
  const grouped = groupBy(records, 'warehouseId');
  const totalValue = records.reduce((sum, r) => sum + r.totalValue, 0);

  return Object.values(grouped).map(group => {
    const warehouseRecords = group;
    const warehouseValue = warehouseRecords.reduce((sum, r) => sum + r.totalValue, 0);

    return {
      warehouseId: warehouseRecords[0].warehouseId,
      warehouseName: warehouseRecords[0].warehouseName,
      [type === 'entry' ? 'totalEntries' : 'totalExits']: warehouseRecords.length,
      totalQuantity: warehouseRecords.reduce((sum, r) => sum + r.totalQuantity, 0),
      totalValue: warehouseValue,
      percentage: (warehouseValue / totalValue) * 100
    };
  }).sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Generar sumario por período
 */
function generatePeriodSummary(
  records: any[],
  groupBy: string,
  includeBeneficiaries: boolean = false
): PeriodSummary[] {
  const grouped: Record<string, any[]> = {};

  records.forEach(record => {
    const period = formatRecordPeriod(record.date, groupBy);
    if (!grouped[period]) {
      grouped[period] = [];
    }
    grouped[period].push(record);
  });

  return Object.entries(grouped).map(([period, periodRecords]) => ({
    period,
    label: formatPeriodLabel(period, groupBy),
    entries: periodRecords.length,
    quantity: periodRecords.reduce((sum, r) => sum + r.totalQuantity, 0),
    value: periodRecords.reduce((sum, r) => sum + r.totalValue, 0),
    ...(includeBeneficiaries && {
      beneficiaries: periodRecords.reduce((sum, r) => sum + (r.beneficiaries || 0), 0)
    })
  })).sort((a, b) => a.period.localeCompare(b.period));
}

// ==================== GRÁFICOS ====================

/**
 * Generar gráficos para reporte de entradas
 */
function generateEntryCharts(
  summary: any,
  byDonor: DonorSummary[],
  byCategory: CategorySummary[],
  byPeriod: PeriodSummary[]
): ReportChartData[] {
  return [
    // Gráfico por donador (top 10)
    {
      type: 'bar',
      title: 'Top 10 Donadores por Valor',
      labels: byDonor.slice(0, 10).map(d => d.donorName),
      data: [{
        label: 'Valor Total (CAD$)',
        data: byDonor.slice(0, 10).map(d => d.totalValue),
        backgroundColor: '#2d9561'
      }]
    },
    // Gráfico por categoría
    {
      type: 'doughnut',
      title: 'Distribución por Categoría',
      labels: byCategory.map(c => c.category),
      data: [{
        label: 'Valor',
        data: byCategory.map(c => c.totalValue),
        backgroundColor: [
          '#1a4d7a', '#2d9561', '#e67e22', '#9b59b6',
          '#3498db', '#e74c3c', '#f39c12', '#16a085'
        ]
      }]
    },
    // Gráfico de tendencia
    {
      type: 'line',
      title: 'Tendencia de Entradas',
      labels: byPeriod.map(p => p.label),
      data: [{
        label: 'Valor (CAD$)',
        data: byPeriod.map(p => p.value),
        borderColor: '#1a4d7a',
        backgroundColor: 'rgba(26, 77, 122, 0.1)'
      }]
    }
  ];
}

/**
 * Generar gráficos para reporte de salidas
 */
function generateExitCharts(
  summary: any,
  byProgram: ProgramSummary[],
  byCategory: CategorySummary[],
  byPeriod: PeriodSummary[]
): ReportChartData[] {
  return [
    // Gráfico por programa
    {
      type: 'bar',
      title: 'Distribución por Programa',
      labels: byProgram.map(p => p.programName),
      data: [
        {
          label: 'Valor (CAD$)',
          data: byProgram.map(p => p.totalValue),
          backgroundColor: '#1a4d7a'
        },
        {
          label: 'Beneficiarios',
          data: byProgram.map(p => p.beneficiaries),
          backgroundColor: '#2d9561'
        }
      ]
    },
    // Gráfico por categoría
    {
      type: 'pie',
      title: 'Categorías Distribuidas',
      labels: byCategory.map(c => c.category),
      data: [{
        label: 'Cantidad',
        data: byCategory.map(c => c.totalQuantity),
        backgroundColor: [
          '#1a4d7a', '#2d9561', '#e67e22', '#9b59b6',
          '#3498db', '#e74c3c', '#f39c12', '#16a085'
        ]
      }]
    },
    // Gráfico de tendencia con beneficiarios
    {
      type: 'line',
      title: 'Tendencia de Distribución',
      labels: byPeriod.map(p => p.label),
      data: [
        {
          label: 'Valor (CAD$)',
          data: byPeriod.map(p => p.value),
          borderColor: '#1a4d7a',
          backgroundColor: 'rgba(26, 77, 122, 0.1)'
        },
        {
          label: 'Beneficiarios',
          data: byPeriod.map(p => p.beneficiaries || 0),
          borderColor: '#2d9561',
          backgroundColor: 'rgba(45, 149, 97, 0.1)'
        }
      ]
    }
  ];
}

// ==================== HELPERS ====================

/**
 * Agrupar por campo
 */
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Agrupar productos por categoría
 */
function groupByCategory(products: any[]): Record<string, any> {
  const result: Record<string, any> = {};

  products.forEach(product => {
    const category = product.category;
    if (!result[category]) {
      result[category] = {
        count: 0,
        totalQuantity: 0,
        totalValue: 0
      };
    }
    result[category].count++;
    result[category].totalQuantity += product.quantity;
    result[category].totalValue += product.totalValue;
  });

  return result;
}

/**
 * Formatear período de registro
 */
function formatRecordPeriod(date: Date, groupBy: string): string {
  const d = new Date(date);

  switch (groupBy) {
    case 'day':
      return d.toISOString().split('T')[0];
    case 'week':
      const weekNum = getWeekNumber(d);
      return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    case 'month':
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    case 'quarter':
      const quarter = Math.floor(d.getMonth() / 3) + 1;
      return `${d.getFullYear()}-Q${quarter}`;
    case 'year':
      return d.getFullYear().toString();
    default:
      return d.toISOString().split('T')[0];
  }
}

/**
 * Formatear etiqueta de período
 */
function formatPeriodLabel(period: string, groupBy: string): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  switch (groupBy) {
    case 'day':
      return new Date(period).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    case 'week':
      const [year, week] = period.split('-W');
      return `Semana ${week}, ${year}`;
    case 'month':
      const [y, m] = period.split('-');
      return `${months[parseInt(m) - 1]} ${y}`;
    case 'quarter':
      const [qy, q] = period.split('-Q');
      return `Q${q} ${qy}`;
    case 'year':
      return period;
    default:
      return period;
  }
}

/**
 * Obtener número de semana
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Formatear período general
 */
function formatPeriod(
  period: ReportPeriod,
  startDate?: Date,
  endDate?: Date
): string {
  if (period === 'custom' && startDate && endDate) {
    return `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`;
  }

  const labels: Record<string, string> = {
    today: 'Hoy',
    yesterday: 'Ayer',
    last7days: 'Últimos 7 días',
    last30days: 'Últimos 30 días',
    thisMonth: 'Este mes',
    lastMonth: 'Mes pasado',
    thisYear: 'Este año',
    lastYear: 'Año pasado'
  };

  return labels[period] || period;
}

// ==================== EXPORTACIONES ====================

export default {
  filterRecords,
  getDateRange,
  generateEntryReport,
  generateExitReport,
  formatPeriod,
  formatPeriodLabel
};
