/**
 * Tipos de Datos para Sistema de Reportes
 * 
 * Define todas las interfaces y tipos para el sistema
 * completo de reportes de entrada, salida, programas y donadores.
 */

// ==================== TIPOS DE REPORTES ====================

export type ReportType = 
  | 'entries'           // Reportes de entradas
  | 'exits'             // Reportes de salidas
  | 'donors'            // Reportes por donador
  | 'programs'          // Reportes por programa
  | 'inventory'         // Reportes de inventario
  | 'comparative'       // Reportes comparativos
  | 'trends';           // Reportes de tendencias

export type ReportPeriod = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type GroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'donor' | 'program' | 'product' | 'category';

// ==================== CONFIGURACIÓN DE REPORTES ====================

export interface ReportConfig {
  id: string;
  type: ReportType;
  name: string;
  description?: string;
  period: ReportPeriod;
  startDate?: Date;
  endDate?: Date;
  filters: ReportFilters;
  groupBy?: GroupBy;
  includeCharts?: boolean;
  includeDetails?: boolean;
  format?: ReportFormat;
}

export interface ReportFilters {
  // Filtros de fecha
  startDate?: Date;
  endDate?: Date;
  
  // Filtros de entidades
  donorIds?: string[];
  programIds?: string[];
  productIds?: string[];
  categoryIds?: string[];
  warehouseIds?: string[];
  
  // Filtros de estado
  status?: string[];
  
  // Filtros de cantidad
  minQuantity?: number;
  maxQuantity?: number;
  minValue?: number;
  maxValue?: number;
  
  // Otros filtros
  includeZeroQuantity?: boolean;
  onlyExpiring?: boolean;
  expirationDays?: number;
}

// ==================== ENTRADA DE PRODUCTOS ====================

export interface EntryRecord {
  id: string;
  entryNumber: string;
  date: Date;
  donorId: string;
  donorName: string;
  donorType: 'individual' | 'company' | 'government' | 'ngo';
  warehouseId: string;
  warehouseName: string;
  products: EntryProduct[];
  totalQuantity: number;
  totalValue: number;
  notes?: string;
  receivedBy: string;
  status: 'pending' | 'received' | 'verified' | 'cancelled';
  createdAt: Date;
  verifiedAt?: Date;
}

export interface EntryProduct {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitValue: number;
  totalValue: number;
  expirationDate?: Date;
  batchNumber?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

// ==================== SALIDA DE PRODUCTOS ====================

export interface ExitRecord {
  id: string;
  exitNumber: string;
  date: Date;
  programId: string;
  programName: string;
  organismId: string;
  organismName: string;
  organismType: 'food_bank' | 'soup_kitchen' | 'shelter' | 'community_center' | 'school';
  warehouseId: string;
  warehouseName: string;
  products: ExitProduct[];
  totalQuantity: number;
  totalValue: number;
  beneficiaries: number;
  deliveryMethod: 'pickup' | 'delivery' | 'transfer';
  notes?: string;
  authorizedBy: string;
  deliveredBy?: string;
  status: 'pending' | 'prepared' | 'delivered' | 'completed' | 'cancelled';
  createdAt: Date;
  deliveredAt?: Date;
}

export interface ExitProduct {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitValue: number;
  totalValue: number;
  batchNumber?: string;
  allocatedFrom: string; // ID de la entrada de origen
}

// ==================== REPORTES DE ENTRADA ====================

export interface EntryReport {
  summary: EntryReportSummary;
  details: EntryReportDetail[];
  byDonor: DonorSummary[];
  byCategory: CategorySummary[];
  byWarehouse: WarehouseSummary[];
  byPeriod: PeriodSummary[];
  charts: ReportChartData[];
}

export interface EntryReportSummary {
  period: string;
  totalEntries: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  uniqueDonors: number;
  uniqueProducts: number;
  averageEntryValue: number;
  topDonor: string;
  topCategory: string;
}

export interface EntryReportDetail {
  entryId: string;
  entryNumber: string;
  date: Date;
  donorName: string;
  warehouseName: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  status: string;
  receivedBy: string;
}

// ==================== REPORTES DE SALIDA ====================

export interface ExitReport {
  summary: ExitReportSummary;
  details: ExitReportDetail[];
  byProgram: ProgramSummary[];
  byOrganism: OrganismSummary[];
  byCategory: CategorySummary[];
  byWarehouse: WarehouseSummary[];
  byPeriod: PeriodSummary[];
  charts: ReportChartData[];
}

export interface ExitReportSummary {
  period: string;
  totalExits: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  totalBeneficiaries: number;
  uniquePrograms: number;
  uniqueOrganisms: number;
  averageExitValue: number;
  topProgram: string;
  topOrganism: string;
}

export interface ExitReportDetail {
  exitId: string;
  exitNumber: string;
  date: Date;
  programName: string;
  organismName: string;
  warehouseName: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
  beneficiaries: number;
  status: string;
  deliveredBy?: string;
}

// ==================== REPORTES POR DONADOR ====================

export interface DonorReport {
  donor: DonorInfo;
  summary: DonorReportSummary;
  entries: EntryReportDetail[];
  byCategory: CategorySummary[];
  byPeriod: PeriodSummary[];
  topProducts: ProductSummary[];
  charts: ReportChartData[];
  comparison?: DonorComparison;
}

export interface DonorInfo {
  id: string;
  name: string;
  type: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  registrationDate: Date;
  status: 'active' | 'inactive';
}

export interface DonorReportSummary {
  period: string;
  totalDonations: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  averageDonationValue: number;
  donationFrequency: number; // donaciones por mes
  lastDonationDate?: Date;
  rank?: number; // Ranking entre donadores
  percentageOfTotal: number;
}

export interface DonorComparison {
  previousPeriod: {
    donations: number;
    value: number;
  };
  growth: {
    donations: number;
    value: number;
    percentage: number;
  };
}

// ==================== REPORTES POR PROGRAMA ====================

export interface ProgramReport {
  program: ProgramInfo;
  summary: ProgramReportSummary;
  exits: ExitReportDetail[];
  byOrganism: OrganismSummary[];
  byCategory: CategorySummary[];
  byPeriod: PeriodSummary[];
  topProducts: ProductSummary[];
  charts: ReportChartData[];
  impact: ProgramImpact;
}

export interface ProgramInfo {
  id: string;
  name: string;
  type: 'emergency' | 'regular' | 'seasonal' | 'special';
  description?: string;
  startDate: Date;
  endDate?: Date;
  responsiblePerson?: string;
  status: 'active' | 'completed' | 'suspended';
}

export interface ProgramReportSummary {
  period: string;
  totalDistributions: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  totalBeneficiaries: number;
  uniqueOrganisms: number;
  averageDistributionValue: number;
  distributionFrequency: number;
  lastDistributionDate?: Date;
}

export interface ProgramImpact {
  directBeneficiaries: number;
  indirectBeneficiaries: number;
  mealsProvided: number;
  familiesServed: number;
  coverageArea: string[];
  effectivenessScore: number; // 0-100
}

// ==================== SUMARIOS COMPARTIDOS ====================

export interface DonorSummary {
  donorId: string;
  donorName: string;
  donorType: string;
  totalEntries: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  percentage: number;
}

export interface ProgramSummary {
  programId: string;
  programName: string;
  programType: string;
  totalExits: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  beneficiaries: number;
  percentage: number;
}

export interface OrganismSummary {
  organismId: string;
  organismName: string;
  organismType: string;
  totalExits: number;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  beneficiaries: number;
  percentage: number;
}

export interface CategorySummary {
  category: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  percentage: number;
  avgUnitValue: number;
}

export interface ProductSummary {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalValue: number;
  frequency: number;
  percentage: number;
}

export interface WarehouseSummary {
  warehouseId: string;
  warehouseName: string;
  totalEntries?: number;
  totalExits?: number;
  totalQuantity: number;
  totalValue: number;
  percentage: number;
}

export interface PeriodSummary {
  period: string; // "2026-02", "2026-W08", etc.
  label: string;  // "Febrero 2026", "Semana 8", etc.
  entries?: number;
  exits?: number;
  quantity: number;
  value: number;
  beneficiaries?: number;
}

// ==================== GRÁFICOS ====================

export interface ReportChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  title: string;
  data: ChartDataset[];
  labels: string[];
  options?: ChartOptions;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  legend?: {
    display: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  scales?: any;
}

// ==================== REPORTE COMPARATIVO ====================

export interface ComparativeReport {
  type: 'period' | 'donor' | 'program';
  comparison: ComparisonData[];
  summary: ComparativeSummary;
  charts: ReportChartData[];
}

export interface ComparisonData {
  name: string;
  current: number;
  previous: number;
  difference: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ComparativeSummary {
  totalIncrease: number;
  totalDecrease: number;
  netChange: number;
  averageGrowth: number;
  bestPerformer: string;
  worstPerformer: string;
}

// ==================== REPORTE DE TENDENCIAS ====================

export interface TrendReport {
  metric: 'entries' | 'exits' | 'value' | 'beneficiaries';
  data: TrendData[];
  forecast?: ForecastData[];
  analysis: TrendAnalysis;
  charts: ReportChartData[];
}

export interface TrendData {
  period: string;
  value: number;
  movingAverage?: number;
}

export interface ForecastData {
  period: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  growthRate: number;
  seasonality: boolean;
  peaks: string[];
  valleys: string[];
  recommendation: string;
}

// ==================== REPORTE PROGRAMADO ====================

export interface ScheduledReport {
  id: string;
  name: string;
  config: ReportConfig;
  schedule: ReportSchedule;
  recipients: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number; // 0-6 para weekly
  dayOfMonth?: number; // 1-31 para monthly
  time: string; // HH:mm formato
  timezone: string;
}

// ==================== EXPORTACIÓN ====================

export interface ExportOptions {
  format: ReportFormat;
  includeCharts: boolean;
  includeDetails: boolean;
  includeSummary: boolean;
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'letter' | 'legal' | 'a4';
}

// ==================== TEMPLATES ====================

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  config: Partial<ReportConfig>;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== HELPERS ====================

export interface ReportMetadata {
  generatedAt: Date;
  generatedBy: string;
  reportType: ReportType;
  period: string;
  filters: ReportFilters;
  recordCount: number;
  version: string;
}

export interface ReportError {
  code: string;
  message: string;
  details?: any;
}

// ==================== EXPORTACIONES ====================

export default {
  // Types
  ReportType,
  ReportPeriod,
  ReportFormat,
  GroupBy,
  
  // Interfaces principales
  ReportConfig,
  ReportFilters,
  EntryReport,
  ExitReport,
  DonorReport,
  ProgramReport,
  ComparativeReport,
  TrendReport,
  
  // Metadata
  ReportMetadata,
  ExportOptions,
  ScheduledReport,
  ReportTemplate
};
