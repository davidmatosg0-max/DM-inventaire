/**
 * Vista de Reporte por Donador
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Building2, DollarSign, Download, Package, Search, TrendingDown, TrendingUp, Users } from 'lucide-react';
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
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type AggregatedDonor = {
  id: string;
  name: string;
  totalEntries: number;
  totalValue: number;
  totalQuantity: number;
  currentMonthEntries: number;
  currentMonthValue: number;
  previousMonthValue: number;
  growth: number | null;
  programs: string[];
  entryTypes: string[];
  lastEntryDate?: string;
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

  return current >= range.start && current <= range.end;
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

function formatEntryType(
  type: string,
  labels: { donation: string; purchase: string; other: string }
): string {
  switch (type.toLowerCase()) {
    case 'don':
      return labels.donation;
    case 'achat':
      return labels.purchase;
    default:
      return type || labels.other;
  }
}

export function DonorReportView() {
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

  const donorReport = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const entries = obtenerTodasLasEntradas().filter(
      (entry) => entry.activo && entry.donadorNombre?.trim().length > 0
    );

    const filteredEntries = entries.filter((entry) => {
      if (!normalizedSearch) return true;

      const searchable = [
        entry.donadorNombre,
        entry.programaNombre,
        entry.nombreProducto,
        entry.tipoEntrada,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });

    const selectedPeriodEntries = filteredEntries.filter((entry) => matchesRange(entry.fecha, dateRange));

    const donorMap = new Map<string, AggregatedDonor>();

    for (const entry of filteredEntries) {
      const key = entry.donadorId || entry.donadorNombre.trim().toLowerCase();
      const totalValue = entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad);
      const donor = donorMap.get(key) ?? {
        id: key,
        name: entry.donadorNombre,
        totalEntries: 0,
        totalValue: 0,
        totalQuantity: 0,
        currentMonthEntries: 0,
        currentMonthValue: 0,
        previousMonthValue: 0,
        growth: 0,
        programs: [],
        entryTypes: [],
        lastEntryDate: undefined,
      };

      donor.totalEntries += 1;
      donor.totalValue += totalValue;
      donor.totalQuantity += entry.cantidad;

      if (!donor.programs.includes(entry.programaNombre)) {
        donor.programs.push(entry.programaNombre);
      }

      const entryTypeLabel = formatEntryType(entry.tipoEntrada, {
        donation: t('reports.entryTypeDonation', 'Don'),
        purchase: t('reports.entryTypePurchase', 'Achat'),
        other: t('reports.other', 'Autre')
      });
      if (!donor.entryTypes.includes(entryTypeLabel)) {
        donor.entryTypes.push(entryTypeLabel);
      }

      if (matchesRange(entry.fecha, dateRange)) {
        donor.currentMonthEntries += 1;
        donor.currentMonthValue += totalValue;
      }

      if (previousRange && matchesRange(entry.fecha, previousRange)) {
        donor.previousMonthValue += totalValue;
      }

      if (!donor.lastEntryDate || new Date(entry.fecha).getTime() > new Date(donor.lastEntryDate).getTime()) {
        donor.lastEntryDate = entry.fecha;
      }

      donorMap.set(key, donor);
    }

    const donors = Array.from(donorMap.values())
      .map((donor) => ({
        ...donor,
        growth: calculateGrowth(donor.currentMonthValue, donor.previousMonthValue),
        programs: donor.programs.sort((left, right) => left.localeCompare(right)),
        entryTypes: donor.entryTypes.sort((left, right) => left.localeCompare(right)),
      }))
      .sort((left, right) => right.totalValue - left.totalValue);

    const previousPeriodEntries = previousRange
      ? filteredEntries.filter((entry) => matchesRange(entry.fecha, previousRange))
      : [];
    const currentMonthValue = selectedPeriodEntries.reduce(
      (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
      0
    );
    const previousMonthValue = previousPeriodEntries.reduce(
      (sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)),
      0
    );

    return {
      donors,
      filteredEntries,
      summary: {
        activeDonors: donors.filter((donor) => donor.currentMonthEntries > 0).length,
        totalDonors: donors.length,
        currentMonthEntries: selectedPeriodEntries.length,
        currentMonthValue,
        growth: calculateGrowth(currentMonthValue, previousMonthValue),
      }
    };
  }, [dateRange, previousRange, refreshKey, searchTerm, t]);

  const comparison = useMemo(() => {
    const currentMonthEntries = donorReport.filteredEntries.filter((entry) => matchesRange(entry.fecha, dateRange));
    const previousMonthEntries = previousRange
      ? donorReport.filteredEntries.filter((entry) => matchesRange(entry.fecha, previousRange))
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
      donors: {
        current: new Set(currentMonthEntries.map((entry) => entry.donadorId || entry.donadorNombre)).size,
        previous: new Set(previousMonthEntries.map((entry) => entry.donadorId || entry.donadorNombre)).size,
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
  }, [dateRange, donorReport.filteredEntries, previousRange]);

  const monthlyEvolution = useMemo(() => {
    const grouped = new Map<string, { entries: number; value: number }>();

    donorReport.filteredEntries.forEach((entry) => {
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
  }, [donorReport.filteredEntries]);

  const exportRows = useMemo(() => {
    return donorReport.donors.map((donor, index) => ({
      rank: index + 1,
      donor: donor.name,
      entryTypes: donor.entryTypes.join(', ') || '-',
      programs: donor.programs.join(', ') || '-',
      totalEntries: donor.totalEntries,
      currentMonthEntries: donor.currentMonthEntries,
      totalQuantity: donor.totalQuantity,
      totalValue: donor.totalValue,
      currentMonthValue: donor.currentMonthValue,
      growth: donor.growth,
      lastEntryDate: donor.lastEntryDate ? new Date(donor.lastEntryDate) : null,
    }));
  }, [donorReport.donors]);

  const exportColumns = useMemo<TableColumn[]>(() => [
    { header: '#', key: 'rank', width: 50, align: 'right' },
    { header: t('reports.donors', 'Donateurs'), key: 'donor', width: 130 },
    { header: t('reports.donorReport.entryTypes', 'Types'), key: 'entryTypes', width: 90 },
    { header: t('reports.programs', 'Programmes'), key: 'programs', width: 140 },
    { header: t('reports.totalEntries', 'Entrées'), key: 'totalEntries', width: 70, align: 'right' },
    { header: t('reports.period', 'Période'), key: 'currentMonthEntries', width: 90, align: 'right' },
    { header: t('reports.totalQuantity', 'Quantité totale'), key: 'totalQuantity', width: 80, align: 'right', format: (value) => Number(value || 0).toLocaleString() },
    { header: t('reports.totalValue', 'Valeur totale'), key: 'totalValue', width: 90, align: 'right', format: (value) => `CAD$ ${formatMoney(Number(value || 0))}` },
    { header: t('reports.donorReport.periodValue', 'Valeur période'), key: 'currentMonthValue', width: 90, align: 'right', format: (value) => `CAD$ ${formatMoney(Number(value || 0))}` },
    { header: t('reports.donorReport.growth', 'Croissance'), key: 'growth', width: 80, align: 'center', format: (value) => formatGrowth(value as number | null, t('reports.new', 'Nouveau')) },
    { header: t('reports.donorReport.lastEntry', 'Dernière entrée'), key: 'lastEntryDate', width: 90, format: (value) => value ? new Date(value as Date).toLocaleDateString('fr-CA') : '-' },
  ], [t]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (exportRows.length === 0) {
      toast.error(t('reports.noDataToExport', 'Aucune donnée à exporter'));
      return;
    }

    setExportingFormat(format);

    try {
      await exportData(format, exportRows, exportColumns, {
        filename: generateFilename('rapport_donateurs_entrepot', format),
        title: t('reports.donorReport.exportTitle', 'Rapport donateurs - Entrepôt'),
        subtitle: t(
          'reports.donorReport.exportSubtitle',
          '{{count}} donateurs exportés • {{entries}} entrées sur la période • CAD$ {{value}}',
          {
            count: exportRows.length,
            entries: donorReport.summary.currentMonthEntries,
            value: formatMoney(donorReport.summary.currentMonthValue)
          }
        ),
        includeDate: true,
        orientation: format === 'pdf' ? 'landscape' : 'portrait',
      });

      toast.success(t('reports.exportSuccess', 'Rapport exporté avec succès'), {
        description: t('reports.donorReport.exportSuccessDescription', '{{count}} profils de donateurs exportés.', {
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
                placeholder={t('reports.donorReport.searchPlaceholder', 'Rechercher un donateur, un programme ou un produit...')}
                className="pl-9"
              />
            </div>
            <Badge variant="outline" className="whitespace-nowrap border-[#1a4d7a]/20 bg-[#1a4d7a]/5 text-[#1a4d7a]">
              {t('reports.donorReport.profileCount', '{{count}} profils', { count: donorReport.donors.length })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.donorReport.activeDonors', 'Donateurs actifs')}</span>
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{donorReport.summary.activeDonors}</p>
          <p className="text-xs text-gray-500">{t('reports.donorReport.totalDonorsSummary', 'sur {{count}} au total', { count: donorReport.summary.totalDonors })}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.donorReport.periodEntries', 'Entrées sur la période')}</span>
            <Package className="h-5 w-5 text-[#2d9561]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{donorReport.summary.currentMonthEntries}</p>
          <p className="text-xs text-gray-500">{t('reports.donorReport.periodProcurements', 'approvisionnements sur la période')}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.donorReport.periodValueTitle', 'Valeur de la période')}</span>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">CAD$ {formatMoney(donorReport.summary.currentMonthValue)}</p>
          <p className="text-xs text-gray-500">{t('reports.donorReport.periodValueDescription', 'valeur des entrées sur la période')}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t('reports.donorReport.growth', 'Croissance')}</span>
            {(donorReport.summary.growth ?? 0) >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className={`text-2xl font-bold ${(donorReport.summary.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatGrowth(donorReport.summary.growth, t('reports.new', 'Nouveau'))}
          </p>
          <p className="text-xs text-gray-500">{t('reports.donorReport.vsPreviousPeriod', 'vs période précédente')}</p>
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
                  <p className="font-medium text-gray-900">{t('reports.donorReport.activeDonors', 'Donateurs actifs')}</p>
                  <p className="text-xs text-gray-500">{t('reports.donorReport.previousPeriodCount', '{{count}} sur la période précédente', { count: comparison.donors.previous })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{comparison.donors.current}</p>
                  <Badge variant="outline" className={getDeltaClass(calculateGrowth(comparison.donors.current, comparison.donors.previous))}>
                    {formatGrowth(calculateGrowth(comparison.donors.current, comparison.donors.previous), t('reports.new', 'Nouveau'))}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="font-medium text-gray-900">{t('reports.totalEntries', 'Entrées')}</p>
                  <p className="text-xs text-gray-500">{t('reports.donorReport.previousPeriodCount', '{{count}} sur la période précédente', { count: comparison.entries.previous })}</p>
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
                  <p className="font-medium text-gray-900">{t('reports.donorReport.value', 'Valeur')}</p>
                  <p className="text-xs text-gray-500">{t('reports.donorReport.previousPeriodValue', 'CAD$ {{value}} sur la période précédente', { value: formatMoney(comparison.value.previous) })}</p>
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
              {t('reports.donorReport.monthlyEvolutionDesc', 'Historique des 6 derniers mois pour les donateurs filtrés.')}
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
                          if (name === t('reports.donorReport.value', 'Valeur')) {
                            return [`CAD$ ${formatMoney(Number(value || 0))}`, name];
                          }

                          return [Number(value || 0).toLocaleString(), name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="entries" name={t('reports.totalEntries', 'Entrées')} fill="#1a4d7a" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="value" name={t('reports.donorReport.value', 'Valeur')} stroke="#2d9561" strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {monthlyEvolution.map((month) => (
                    <div key={month.monthKey} className="rounded-lg bg-gray-50 p-3">
                      <p className="font-medium text-gray-900">{month.monthLabel}</p>
                      <p className="mt-1 text-sm text-gray-600">{t('reports.donorReport.entriesCount', '{{count}} entrées', { count: month.entries })}</p>
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
            <CardTitle>{t('reports.donorReport.rankingTitle', 'Classement des donateurs')}</CardTitle>
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
          {donorReport.donors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
              {t('reports.donorReport.noData', 'Aucun donateur ne correspond aux données disponibles.')}
            </div>
          ) : (
            <ScrollArea className="max-h-[560px] pr-4">
              <div className="space-y-3">
                {donorReport.donors.map((donor, index) => (
                  <div key={donor.id} className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className="bg-[#1a4d7a] text-white">#{index + 1}</Badge>
                          <div className="flex min-w-0 items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#1a4d7a]" />
                            <p className="truncate font-bold text-gray-900">{donor.name}</p>
                          </div>
                          {donor.entryTypes.map((entryType) => (
                            <Badge key={`${donor.id}-${entryType}`} variant="outline" className="border-green-200 bg-green-50 text-green-700">
                              {entryType}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{t('reports.donorReport.totalVolume', 'Volume total')}</p>
                            <p className="font-semibold text-gray-900">{t('reports.donorReport.totalVolumeValue', '{{entries}} entrées • {{quantity}} unités', { entries: donor.totalEntries, quantity: donor.totalQuantity.toLocaleString() })}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{t('reports.donorReport.activePeriod', 'Période active')}</p>
                            <p className="font-semibold text-gray-900">{t('reports.donorReport.activePeriodValue', '{{entries}} entrées • CAD$ {{value}}', { entries: donor.currentMonthEntries, value: formatMoney(donor.currentMonthValue) })}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{t('reports.donorReport.lastEntry', 'Dernière entrée')}</p>
                            <p className="font-semibold text-gray-900">
                              {donor.lastEntryDate
                                ? new Date(donor.lastEntryDate).toLocaleDateString('fr-CA')
                                : t('reports.notAvailable', 'N/A')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {donor.programs.map((program) => (
                            <Badge key={`${donor.id}-${program}`} variant="secondary" className="bg-slate-100 text-slate-700">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 text-left lg:text-right">
                        <p className="text-lg font-bold text-gray-900">CAD$ {formatMoney(donor.totalValue)}</p>
                        <p className={`text-sm font-medium ${(donor.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {t('reports.donorReport.growthOnPeriod', '{{growth}} sur la période', { growth: formatGrowth(donor.growth, t('reports.new', 'Nouveau')) })}
                        </p>
                      </div>
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

export default DonorReportView;
