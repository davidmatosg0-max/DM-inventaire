/**
 * Vista de Reporte por Programa
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, BarChart3, DollarSign, Download, Package, Search, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { exportData, generateFilename, type TableColumn } from '../../utils/exportUtils';
import { formatMoney } from '../../utils/formatUtils';
import { obtenerTodasLasEntradas } from '../../utils/entradaInventarioStorage';
import type { ReportPeriod } from '../../../types/reports';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type AggregatedProgram = {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  totalEntries: number;
  currentMonthEntries: number;
  totalValue: number;
  currentMonthValue: number;
  previousMonthValue: number;
  donorCount: number;
  productCount: number;
  growth: number | null;
  contributionShare: number;
};

function toDateRange(period: ReportPeriod, customStart: string, customEnd: string): { start?: Date; end?: Date } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return { start: startOfToday, end: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1) };
    case 'yesterday': {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1) };
    }
    case 'last7days': {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
      return { start, end: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1) };
    }
    case 'last30days': {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      return { start, end: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1) };
    }
    case 'thisMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    case 'lastMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      };
    case 'thisYear':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      };
    case 'lastYear':
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      };
    case 'custom': {
      const start = customStart ? new Date(`${customStart}T00:00:00`) : undefined;
      const end = customEnd ? new Date(`${customEnd}T23:59:59.999`) : undefined;
      return { start, end };
    }
    default:
      return {};
  }
}

function matchesRange(dateValue: string | undefined, range: { start?: Date; end?: Date }): boolean {
  if (!dateValue) return false;

  const current = new Date(dateValue);
  if (Number.isNaN(current.getTime())) return false;

  if (range.start && current < range.start) return false;
  if (range.end && current > range.end) return false;

  return true;
}

function shiftRange(range: { start?: Date; end?: Date }): { start?: Date; end?: Date } | null {
  if (!range.start || !range.end) {
    return null;
  }

  const duration = range.end.getTime() - range.start.getTime();
  const previousEnd = new Date(range.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return { start: previousStart, end: previousEnd };
}

function calculateGrowth(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
}

function formatGrowth(growth: number | null, newLabel = 'Nouveau'): string {
  if (growth === null) return newLabel;
  if (growth === 0) return '0.0%';
  return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
}

function getDeltaClass(delta: number | null): string {
  if (delta === null) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (delta > 0) return 'border-green-200 bg-green-50 text-green-700';
  if (delta < 0) return 'border-red-200 bg-red-50 text-red-700';
  return 'border-gray-200 bg-gray-50 text-gray-700';
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) {
    return monthKey;
  }

  return new Date(year, month - 1, 1).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short'
  });
}

function formatCompactNumber(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return value.toLocaleString();
}

export function ProgramReportView() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ReportPeriod>('thisMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'excel' | 'csv' | null>(null);

  const dateRange = useMemo(() => toDateRange(period, customStartDate, customEndDate), [period, customStartDate, customEndDate]);
  const previousRange = useMemo(() => shiftRange(dateRange), [dateRange]);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);

    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const programReport = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const entries = obtenerTodasLasEntradas().filter(
      (entry) => entry.activo && entry.programaNombre?.trim().length > 0
    );

    const filteredEntries = entries.filter((entry) => {
      if (!normalizedSearch) return true;

      const searchable = [
        entry.programaNombre,
        entry.programaCodigo,
        entry.donadorNombre,
        entry.nombreProducto,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });

    const selectedPeriodEntries = filteredEntries.filter((entry) => matchesRange(entry.fecha, dateRange));

    const programMap = new Map<string, AggregatedProgram & { donors: Set<string>; products: Set<string> }>();

    for (const entry of filteredEntries) {
      const key = entry.programaCodigo || entry.programaNombre.trim().toLowerCase();
      const totalValue = entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad);
      const program = programMap.get(key) ?? {
        id: key,
        name: entry.programaNombre,
        code: entry.programaCodigo || 'N/A',
        color: entry.programaColor || '#1a4d7a',
        icon: entry.programaIcono || '📦',
        totalEntries: 0,
        currentMonthEntries: 0,
        totalValue: 0,
        currentMonthValue: 0,
        previousMonthValue: 0,
        donorCount: 0,
        productCount: 0,
        growth: 0,
        contributionShare: 0,
        donors: new Set<string>(),
        products: new Set<string>(),
      };

      program.totalEntries += 1;
      program.totalValue += totalValue;
      program.donors.add(entry.donadorNombre);
      program.products.add(entry.nombreProducto);

      if (matchesRange(entry.fecha, dateRange)) {
        program.currentMonthEntries += 1;
        program.currentMonthValue += totalValue;
      }

      if (previousRange && matchesRange(entry.fecha, previousRange)) {
        program.previousMonthValue += totalValue;
      }

      programMap.set(key, program);
    }

    const totalPortfolioValue = Array.from(programMap.values()).reduce((sum, program) => sum + program.totalValue, 0);

    const programs = Array.from(programMap.values())
      .map((program) => ({
        ...program,
        donorCount: program.donors.size,
        productCount: program.products.size,
        growth: calculateGrowth(program.currentMonthValue, program.previousMonthValue),
        contributionShare: totalPortfolioValue > 0 ? (program.totalValue / totalPortfolioValue) * 100 : 0,
      }))
      .sort((left, right) => right.totalValue - left.totalValue);

    const currentMonthValue = selectedPeriodEntries.reduce(
      (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
      0
    );
    const previousMonthValue = (previousRange
      ? filteredEntries.filter((entry) => matchesRange(entry.fecha, previousRange))
      : []
    )
      .reduce((sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)), 0);
    const currentMonthDonors = new Set(selectedPeriodEntries.map((entry) => entry.donadorNombre).filter(Boolean));

    return {
      programs,
      filteredEntries,
      summary: {
        activePrograms: programs.filter((program) => program.currentMonthEntries > 0).length,
        totalPrograms: programs.length,
        currentMonthEntries: selectedPeriodEntries.length,
        currentMonthDonors: currentMonthDonors.size,
        currentMonthValue,
        growth: calculateGrowth(currentMonthValue, previousMonthValue),
      }
    };
  }, [dateRange, previousRange, refreshKey, searchTerm]);

  const comparison = useMemo(() => {
    const currentMonthEntries = programReport.filteredEntries.filter((entry) => matchesRange(entry.fecha, dateRange));
    const previousMonthEntries = previousRange
      ? programReport.filteredEntries.filter((entry) => matchesRange(entry.fecha, previousRange))
      : [];
    const currentMonthValue = currentMonthEntries.reduce(
      (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
      0
    );
    const previousMonthValue = previousMonthEntries.reduce(
      (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
      0
    );

    return {
      programs: {
        current: new Set(currentMonthEntries.map((entry) => entry.programaCodigo || entry.programaNombre)).size,
        previous: new Set(previousMonthEntries.map((entry) => entry.programaCodigo || entry.programaNombre)).size,
      },
      entries: {
        current: currentMonthEntries.length,
        previous: previousMonthEntries.length,
      },
      value: {
        current: currentMonthValue,
        previous: previousMonthValue,
      },
    };
  }, [dateRange, programReport.filteredEntries, previousRange]);

  const monthlyEvolution = useMemo(() => {
    const grouped = new Map<string, { entries: number; value: number }>();

    programReport.filteredEntries.forEach((entry) => {
      const date = new Date(entry.fecha);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = grouped.get(monthKey) || { entries: 0, value: 0 };

      grouped.set(monthKey, {
        entries: current.entries + 1,
        value: current.value + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
      });
    });

    return Array.from(grouped.entries())
      .map(([monthKey, current]) => ({
        monthKey,
        monthLabel: formatMonthLabel(monthKey),
        ...current,
      }))
      .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
      .slice(-6);
  }, [programReport.filteredEntries]);

  const exportRows = useMemo(() => {
    return programReport.programs.map((program, index) => ({
      rank: index + 1,
      code: program.code,
      program: program.name,
      totalEntries: program.totalEntries,
      currentMonthEntries: program.currentMonthEntries,
      donorCount: program.donorCount,
      productCount: program.productCount,
      totalValue: program.totalValue,
      currentMonthValue: program.currentMonthValue,
      growth: program.growth,
      contributionShare: program.contributionShare,
    }));
  }, [programReport.programs]);

  const exportColumns = useMemo<TableColumn[]>(() => [
    { header: '#', key: 'rank', width: 50, align: 'right' },
    { header: t('reports.programReport.code', 'Code'), key: 'code', width: 70, align: 'center' },
    { header: t('reports.programs', 'Programmes'), key: 'program', width: 150 },
    { header: t('reports.totalEntries', 'Entrées'), key: 'totalEntries', width: 70, align: 'right' },
    { header: t('reports.period', 'Période'), key: 'currentMonthEntries', width: 90, align: 'right' },
    { header: t('reports.donors', 'Donateurs'), key: 'donorCount', width: 80, align: 'right' },
    { header: t('reports.programReport.products', 'Produits'), key: 'productCount', width: 70, align: 'right' },
    { header: t('reports.totalValue', 'Valeur totale'), key: 'totalValue', width: 90, align: 'right', format: (value) => `CAD$ ${formatMoney(Number(value || 0))}` },
    { header: t('reports.programReport.periodValue', 'Valeur période'), key: 'currentMonthValue', width: 90, align: 'right', format: (value) => `CAD$ ${formatMoney(Number(value || 0))}` },
    { header: t('reports.programReport.growth', 'Croissance'), key: 'growth', width: 80, align: 'center', format: (value) => formatGrowth(value as number | null, t('reports.new', 'Nouveau')) },
    { header: t('reports.programReport.portfolioShare', 'Part portefeuille'), key: 'contributionShare', width: 90, align: 'right', format: (value) => `${Number(value || 0).toFixed(1)}%` },
  ], [t]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (exportRows.length === 0) {
      toast.error(t('reports.noDataToExport', 'Aucune donnée à exporter'));
      return;
    }

    setExportingFormat(format);

    try {
      await exportData(format, exportRows, exportColumns, {
        filename: generateFilename('rapport_programmes_entrepot', format),
        title: t('reports.programReport.exportTitle', 'Rapport programmes - Entrepôt'),
        subtitle: t(
          'reports.programReport.exportSubtitle',
          '{{count}} programmes exportés • {{entries}} entrées sur la période • CAD$ {{value}}',
          {
            count: exportRows.length,
            entries: programReport.summary.currentMonthEntries,
            value: formatMoney(programReport.summary.currentMonthValue)
          }
        ),
        includeDate: true,
        orientation: format === 'pdf' ? 'landscape' : 'portrait',
      });

      toast.success(t('reports.exportSuccess', 'Rapport exporté avec succès'), {
        description: t('reports.programReport.exportSuccessDescription', '{{count}} programmes exportés.', {
          count: exportRows.length
        })
      });
    } catch (error) {
      toast.error(t('reports.exportError', 'Erreur lors de l\'exportation du rapport'), {
        description: error instanceof Error ? error.message : t('reports.unknownError', 'Erreur inconnue')
      });
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.period', 'Période')}</label>
              <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t('reports.today', 'Aujourd\'hui')}</SelectItem>
                  <SelectItem value="yesterday">{t('reports.yesterday', 'Hier')}</SelectItem>
                  <SelectItem value="last7days">{t('reports.last7days', '7 derniers jours')}</SelectItem>
                  <SelectItem value="last30days">{t('reports.last30days', '30 derniers jours')}</SelectItem>
                  <SelectItem value="thisMonth">{t('reports.thisMonth', 'Ce mois-ci')}</SelectItem>
                  <SelectItem value="lastMonth">{t('reports.lastMonth', 'Mois dernier')}</SelectItem>
                  <SelectItem value="thisYear">{t('reports.thisYear', 'Cette année')}</SelectItem>
                  <SelectItem value="lastYear">{t('reports.lastYear', 'Année dernière')}</SelectItem>
                  <SelectItem value="custom">{t('reports.custom', 'Personnalisé')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === 'custom' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.startDate', 'Date de début')}</label>
                  <Input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.endDate', 'Date de fin')}</label>
                  <Input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('reports.programReport.searchPlaceholder', 'Rechercher un programme, un code, un donateur ou un produit...')}
                className="pl-9"
              />
            </div>
            <Badge variant="outline" className="whitespace-nowrap border-orange-200 bg-orange-50 text-orange-700">
              {t('reports.programReport.count', '{{count}} programmes', { count: programReport.programs.length })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.programReport.activePrograms', 'Programmes actifs')}</span>
            <Activity className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{programReport.summary.activePrograms}</p>
          <p className="text-xs text-gray-500">{t('reports.programReport.totalProgramsSummary', 'sur {{count}} au total', { count: programReport.summary.totalPrograms })}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.programReport.periodEntries', 'Entrées sur la période')}</span>
            <Package className="h-5 w-5 text-[#2d9561]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{programReport.summary.currentMonthEntries}</p>
          <p className="text-xs text-gray-500">{t('reports.programReport.periodProcurements', 'approvisionnements sur la période')}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.programReport.periodDonors', 'Donateurs sur la période')}</span>
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{programReport.summary.currentMonthDonors}</p>
          <p className="text-xs text-gray-500">{t('reports.programReport.currentPeriodSummary', 'sur la période en cours')}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.programReport.periodValueTitle', 'Valeur de la période')}</span>
            {(programReport.summary.growth ?? 0) >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">CAD$ {formatMoney(programReport.summary.currentMonthValue)}</p>
          <p className={`text-xs font-medium ${(programReport.summary.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {t('reports.programReport.vsPreviousPeriodWithGrowth', '{{growth}} vs période précédente', { growth: formatGrowth(programReport.summary.growth, t('reports.new', 'Nouveau')) })}
          </p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(calculateGrowth(comparison.value.current, comparison.value.previous) ?? 0) < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-[#2d9561]" />
              )}
              {t('reports.periodComparison', 'Comparaison avec la période précédente')}
            </CardTitle>
            <CardDescription>
              {t('reports.periodComparisonDesc', 'Mesure l\'écart entre la période sélectionnée et la période précédente équivalente.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="font-medium text-gray-900">{t('reports.programReport.activePrograms', 'Programmes actifs')}</p>
                  <p className="text-xs text-gray-500">{t('reports.programReport.previousPeriodCount', '{{count}} sur la période précédente', { count: comparison.programs.previous })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{comparison.programs.current}</p>
                  <Badge variant="outline" className={getDeltaClass(calculateGrowth(comparison.programs.current, comparison.programs.previous))}>
                    {formatGrowth(calculateGrowth(comparison.programs.current, comparison.programs.previous), t('reports.new', 'Nouveau'))}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="font-medium text-gray-900">{t('reports.totalEntries', 'Entrées')}</p>
                  <p className="text-xs text-gray-500">{t('reports.programReport.previousPeriodCount', '{{count}} sur la période précédente', { count: comparison.entries.previous })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{comparison.entries.current}</p>
                  <Badge variant="outline" className={getDeltaClass(calculateGrowth(comparison.entries.current, comparison.entries.previous))}>
                    {formatGrowth(calculateGrowth(comparison.entries.current, comparison.entries.previous), t('reports.new', 'Nouveau'))}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="font-medium text-gray-900">{t('reports.programReport.value', 'Valeur')}</p>
                  <p className="text-xs text-gray-500">{t('reports.programReport.previousPeriodValue', 'CAD$ {{value}} sur la période précédente', { value: formatMoney(comparison.value.previous) })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">CAD$ {formatMoney(comparison.value.current)}</p>
                  <Badge variant="outline" className={getDeltaClass(calculateGrowth(comparison.value.current, comparison.value.previous))}>
                    {formatGrowth(calculateGrowth(comparison.value.current, comparison.value.previous), t('reports.new', 'Nouveau'))}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#1a4d7a]" />
              {t('reports.monthlyEvolution', 'Évolution mensuelle')}
            </CardTitle>
            <CardDescription>
              {t('reports.programReport.monthlyEvolutionDesc', 'Historique des 6 derniers mois pour les programmes filtrés.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyEvolution.length === 0 ? (
              <p className="text-sm text-gray-500">{t('reports.noMonthlyEvolution', 'Aucune évolution disponible pour ces filtres.')}</p>
            ) : (
              <div className="space-y-4">
                <div className="h-[280px] w-full rounded-lg border border-gray-100 bg-white p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyEvolution}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompactNumber(Number(value))} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(value) => `CAD$ ${formatCompactNumber(Number(value))}`} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === t('reports.programReport.value', 'Valeur')) {
                            return [`CAD$ ${formatMoney(Number(value || 0))}`, name];
                          }

                          return [Number(value || 0).toLocaleString(), name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="entries" name={t('reports.totalEntries', 'Entrées')} fill="#1a4d7a" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="value" name={t('reports.programReport.value', 'Valeur')} stroke="#2d9561" strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {monthlyEvolution.map((month) => (
                    <div key={month.monthKey} className="rounded-lg bg-gray-50 p-3">
                      <p className="font-medium text-gray-900">{month.monthLabel}</p>
                      <p className="mt-1 text-sm text-gray-600">{t('reports.programReport.entriesCount', '{{count}} entrées', { count: month.entries })}</p>
                      <p className="text-sm font-semibold text-gray-900">CAD$ {formatMoney(month.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>{t('reports.programReport.performanceTitle', 'Performance des programmes')}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={exportingFormat !== null} onClick={() => void handleExport('pdf')}>
                <Download className="mr-2 h-4 w-4" />PDF
              </Button>
              <Button variant="outline" size="sm" disabled={exportingFormat !== null} onClick={() => void handleExport('excel')}>
                <Download className="mr-2 h-4 w-4" />Excel
              </Button>
              <Button variant="outline" size="sm" disabled={exportingFormat !== null} onClick={() => void handleExport('csv')}>
                <Download className="mr-2 h-4 w-4" />CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {programReport.programs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
              {t('reports.programReport.noData', 'Aucun programme ne correspond aux données disponibles.')}
            </div>
          ) : (
            <ScrollArea className="max-h-[560px] pr-4">
              <div className="space-y-4">
                {programReport.programs.map((program) => (
                  <div key={program.id} className="space-y-3 rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            variant="outline"
                            className="border-transparent text-white"
                            style={{ backgroundColor: program.color || '#1a4d7a' }}
                          >
                            {program.icon} {program.code}
                          </Badge>
                          <div>
                            <p className="font-bold text-gray-900">{program.name}</p>
                            <p className="text-sm text-gray-500">
                              {t('reports.programReport.summaryLine', '{{entries}} entrées • {{donors}} donateurs • {{products}} produits', {
                                entries: program.totalEntries,
                                donors: program.donorCount,
                                products: program.productCount
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{t('reports.programReport.periodActivity', 'Activité sur la période')}</p>
                            <p className="font-semibold text-gray-900">{t('reports.programReport.periodActivityValue', '{{entries}} entrées • CAD$ {{value}}', { entries: program.currentMonthEntries, value: formatMoney(program.currentMonthValue) })}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{t('reports.programReport.cumulativeValue', 'Valeur cumulée')}</p>
                            <p className="font-semibold text-gray-900">CAD$ {formatMoney(program.totalValue)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{t('reports.programReport.growth', 'Croissance')}</p>
                            <p className={`font-semibold ${(program.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatGrowth(program.growth, t('reports.new', 'Nouveau'))}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-left lg:text-right">
                        <p className="text-lg font-bold text-gray-900">{program.contributionShare.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500">{t('reports.programReport.filteredPortfolio', 'du portefeuille filtré')}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{t('reports.programReport.contribution', 'Contribution du programme')}</span>
                        <span className="font-medium">{program.contributionShare.toFixed(1)}%</span>
                      </div>
                      <Progress value={program.contributionShare} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgramReportView;
