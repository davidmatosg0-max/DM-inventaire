/**
 * Vista de Reporte de Distribución
 *
 * Reporte vivo de comandas y distribuciones del entrepot
 * calculado desde el almacenamiento real.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownCircle,
  Download,
  FileText,
  Filter,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { exportData, generateFilename, type TableColumn } from '../../utils/exportUtils';
import { formatMoney } from '../../utils/formatUtils';
import { obtenerComandas, type Comanda } from '../../utils/comandasLogic';
import type { ReportPeriod } from '../../../types/reports';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type ComandaStatusFilter = 'all' | Comanda['estado'];

function normalizeText(value?: string): string {
  return value?.trim().toLowerCase() || '';
}

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

function matchesRange(dateValue: string, range: { start?: Date; end?: Date }): boolean {
  const current = new Date(dateValue);
  if (Number.isNaN(current.getTime())) {
    return false;
  }

  if (range.start && current < range.start) {
    return false;
  }

  if (range.end && current > range.end) {
    return false;
  }

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

function calculateDelta(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
}

function getDeltaClass(delta: number | null): string {
  if (delta === null) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (delta > 0) return 'border-green-200 bg-green-50 text-green-700';
  if (delta < 0) return 'border-red-200 bg-red-50 text-red-700';
  return 'border-gray-200 bg-gray-50 text-gray-700';
}

function formatDelta(delta: number | null): string {
  if (delta === null) return 'Nuevo';
  if (delta === 0) return '0.0%';
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
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

function getStatusLabel(status: Comanda['estado']): string {
  switch (status) {
    case 'pendiente':
      return 'Pendiente';
    case 'preparada':
      return 'Preparada';
    case 'entregada':
      return 'Entregada';
    case 'cancelada':
      return 'Cancelada';
    default:
      return status;
  }
}

function getStatusBadgeClass(status: Comanda['estado']): string {
  switch (status) {
    case 'entregada':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'preparada':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'cancelada':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  }
}

export function ExitReportView() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ReportPeriod>('thisMonth');
  const [statusFilter, setStatusFilter] = useState<ComandaStatusFilter>('all');
  const [selectedOrganism, setSelectedOrganism] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'excel' | 'csv' | null>(null);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);

    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const comandas = useMemo(() => obtenerComandas().slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()), [refreshKey]);

  const dateRange = useMemo(
    () => toDateRange(period, customStartDate, customEndDate),
    [period, customStartDate, customEndDate]
  );

  const organismOptions = useMemo(
    () => Array.from(new Set(comandas.map((comanda) => comanda.organismoNombre).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [comandas]
  );

  const frequencyOptions = useMemo(
    () => Array.from(new Set(comandas.map((comanda) => comanda.organismoFrecuencia).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b))),
    [comandas]
  );

  const baseFilteredComandas = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return comandas
      .filter((comanda) => statusFilter === 'all' || comanda.estado === statusFilter)
      .filter((comanda) => selectedOrganism === 'all' || comanda.organismoNombre === selectedOrganism)
      .filter((comanda) => selectedFrequency === 'all' || (comanda.organismoFrecuencia || '') === selectedFrequency)
      .filter((comanda) => {
        if (!normalizedSearch) return true;

        return [
          comanda.numero,
          comanda.organismoNombre,
          comanda.estado,
          comanda.observaciones,
          ...comanda.productos.map((producto) => producto.productoNombre),
        ].some((value) => normalizeText(value).includes(normalizedSearch));
      });
  }, [comandas, searchTerm, selectedFrequency, selectedOrganism, statusFilter]);

  const filteredComandas = useMemo(() => {
    return baseFilteredComandas.filter((comanda) => matchesRange(comanda.fecha, dateRange));
  }, [baseFilteredComandas, dateRange]);

  const previousRange = useMemo(() => shiftRange(dateRange), [dateRange]);

  const previousComandas = useMemo(() => {
    if (!previousRange) {
      return [] as Comanda[];
    }

    return baseFilteredComandas.filter((comanda) => matchesRange(comanda.fecha, previousRange));
  }, [baseFilteredComandas, previousRange]);

  const summary = useMemo(() => {
    const totalDistributions = filteredComandas.length;
    const totalQuantity = filteredComandas.reduce((sum, comanda) => sum + comanda.totalPeso, 0);
    const totalValue = filteredComandas.reduce((sum, comanda) => sum + comanda.totalValorMonetario, 0);
    const uniqueOrganisms = new Set(filteredComandas.map((comanda) => comanda.organismoId || comanda.organismoNombre)).size;
    const uniqueProducts = new Set(
      filteredComandas.flatMap((comanda) => comanda.productos.map((producto) => producto.productoId))
    ).size;

    const byOrganismMap = new Map<string, { count: number; value: number }>();
    filteredComandas.forEach((comanda) => {
      const key = comanda.organismoNombre;
      const current = byOrganismMap.get(key) || { count: 0, value: 0 };
      byOrganismMap.set(key, {
        count: current.count + 1,
        value: current.value + comanda.totalValorMonetario,
      });
    });

    const topOrganism = Array.from(byOrganismMap.entries()).sort((a, b) => b[1].value - a[1].value)[0]?.[0] || '-';

    return {
      totalDistributions,
      totalQuantity,
      totalValue,
      uniqueOrganisms,
      uniqueProducts,
      averageDistributionValue: totalDistributions > 0 ? totalValue / totalDistributions : 0,
      topOrganism,
    };
  }, [filteredComandas]);

  const byStatus = useMemo(() => {
    const totalCount = filteredComandas.length;
    const grouped = new Map<Comanda['estado'], { count: number; value: number }>();

    filteredComandas.forEach((comanda) => {
      const current = grouped.get(comanda.estado) || { count: 0, value: 0 };
      grouped.set(comanda.estado, {
        count: current.count + 1,
        value: current.value + comanda.totalValorMonetario,
      });
    });

    return Array.from(grouped.entries())
      .map(([status, current]) => ({
        status,
        ...current,
        percentage: totalCount > 0 ? (current.count / totalCount) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredComandas]);

  const byOrganism = useMemo(() => {
    const totalValue = filteredComandas.reduce((sum, comanda) => sum + comanda.totalValorMonetario, 0);
    const grouped = new Map<string, { count: number; value: number; quantity: number }>();

    filteredComandas.forEach((comanda) => {
      const key = comanda.organismoNombre;
      const current = grouped.get(key) || { count: 0, value: 0, quantity: 0 };
      grouped.set(key, {
        count: current.count + 1,
        value: current.value + comanda.totalValorMonetario,
        quantity: current.quantity + comanda.totalPeso,
      });
    });

    return Array.from(grouped.entries())
      .map(([organismName, current]) => ({
        organismName,
        ...current,
        percentage: totalValue > 0 ? (current.value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredComandas]);

  const comparison = useMemo(() => {
    const previousCount = previousComandas.length;
    const previousQuantity = previousComandas.reduce((sum, comanda) => sum + comanda.totalPeso, 0);
    const previousValue = previousComandas.reduce((sum, comanda) => sum + comanda.totalValorMonetario, 0);

    return {
      distributions: {
        current: summary.totalDistributions,
        previous: previousCount,
        delta: calculateDelta(summary.totalDistributions, previousCount),
      },
      quantity: {
        current: summary.totalQuantity,
        previous: previousQuantity,
        delta: calculateDelta(summary.totalQuantity, previousQuantity),
      },
      value: {
        current: summary.totalValue,
        previous: previousValue,
        delta: calculateDelta(summary.totalValue, previousValue),
      },
      available: previousRange !== null,
    };
  }, [previousComandas, previousRange, summary.totalDistributions, summary.totalQuantity, summary.totalValue]);

  const monthlyEvolution = useMemo(() => {
    const grouped = new Map<string, { distributions: number; quantity: number; value: number }>();

    baseFilteredComandas.forEach((comanda) => {
      const date = new Date(comanda.fecha);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = grouped.get(monthKey) || { distributions: 0, quantity: 0, value: 0 };

      grouped.set(monthKey, {
        distributions: current.distributions + 1,
        quantity: current.quantity + comanda.totalPeso,
        value: current.value + comanda.totalValorMonetario,
      });
    });

    return Array.from(grouped.entries())
      .map(([monthKey, current]) => ({
        monthKey,
        monthLabel: formatMonthLabel(monthKey),
        ...current,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-6);
  }, [baseFilteredComandas]);

  const exportRows = useMemo(() => {
    return filteredComandas.map((comanda) => ({
      number: comanda.numero,
      date: new Date(comanda.fecha),
      organism: comanda.organismoNombre,
      frequency: comanda.organismoFrecuencia || '-',
      status: getStatusLabel(comanda.estado),
      productCount: comanda.productos.length,
      totalQuantity: comanda.totalPeso,
      totalValue: comanda.totalValorMonetario,
      products: comanda.productos.map((product) => `${product.productoNombre} (${product.cantidad} ${product.unidad})`).join(' | '),
      notes: comanda.observaciones || '-',
    }));
  }, [filteredComandas]);

  const exportColumns = useMemo<TableColumn[]>(() => [
    { header: 'Comanda', key: 'number', width: 110 },
    { header: 'Date', key: 'date', width: 90, format: (value) => new Date(value).toLocaleDateString('fr-CA') },
    { header: 'Organisme', key: 'organism', width: 130 },
    { header: 'Frequence', key: 'frequency', width: 80, align: 'center' },
    { header: 'Etat', key: 'status', width: 80, align: 'center' },
    { header: 'Produits', key: 'productCount', width: 65, align: 'right' },
    { header: 'Quantite', key: 'totalQuantity', width: 80, align: 'right', format: (value) => Number(value || 0).toLocaleString() },
    { header: 'Valeur', key: 'totalValue', width: 85, align: 'right', format: (value) => `CAD$ ${formatMoney(Number(value || 0))}` },
    { header: 'Detail produits', key: 'products', width: 180 },
    { header: 'Notes', key: 'notes', width: 120 },
  ], []);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (exportRows.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setExportingFormat(format);

    try {
      await exportData(format, exportRows, exportColumns, {
        filename: generateFilename('rapport_distribution_entrepot', format),
        title: 'Rapport de distribution - Entrepot',
        subtitle: `${exportRows.length} distributions exportées • ${summary.uniqueOrganisms} organismes • CAD$ ${formatMoney(summary.totalValue)}`,
        includeDate: true,
        orientation: format === 'pdf' ? 'landscape' : 'portrait',
      });

      toast.success(`Export ${format.toUpperCase()} genere`, {
        description: `${exportRows.length} distributions exportees.`
      });
    } catch (error) {
      toast.error(`Erreur export ${format.toUpperCase()}`, {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setExportingFormat(null);
    }
  };

  const resetFilters = () => {
    setPeriod('thisMonth');
    setStatusFilter('all');
    setSelectedOrganism('all');
    setSelectedFrequency('all');
    setSearchTerm('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#1a4d7a]" />
            {t('reports.distributionFilters', 'Filtres de distribution')}
          </CardTitle>
          <CardDescription>
            {t('reports.distributionFiltersDesc', 'Affinez le rapport par periode, etat, organisme et frequence.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  <SelectItem value="custom">{t('reports.custom', 'Personnalisé')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.status', 'État')}</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ComandaStatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allStatuses', 'Tous les états')}</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="preparada">Preparada</SelectItem>
                  <SelectItem value="entregada">Entregada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.organism', 'Organisme')}</label>
              <Select value={selectedOrganism} onValueChange={setSelectedOrganism}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allOrganisms', 'Tous les organismes')}</SelectItem>
                  {organismOptions.map((organism) => (
                    <SelectItem key={organism} value={organism}>{organism}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.frequency', 'Fréquence')}</label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allFrequencies', 'Toutes les fréquences')}</SelectItem>
                  {frequencyOptions.map((frequency) => (
                    <SelectItem key={frequency} value={String(frequency)}>{String(frequency)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.startDate', 'Date de début')}</label>
                <Input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.endDate', 'Date de fin')}</label>
                <Input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('reports.search', 'Rechercher')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder={t('reports.distributionSearchPlaceholder', 'Comanda, organismo, estado o producto...')}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                {t('reports.clearFilters', 'Effacer les filtres')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('reports.totalDistributions', 'Distributions')}</span>
              <ArrowDownCircle className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalDistributions}</p>
            <p className="mt-1 text-xs text-gray-500">{summary.uniqueProducts} produits distincts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('reports.totalQuantity', 'Quantité totale')}</span>
              <Package className="h-5 w-5 text-[#2d9561]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalQuantity.toLocaleString()}</p>
            <p className="mt-1 text-xs text-gray-500">poids cumulé distribué</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('reports.totalValue', 'Valeur totale')}</span>
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">CAD$ {formatMoney(summary.totalValue)}</p>
            <p className="mt-1 text-xs text-gray-500">Moyenne: CAD$ {formatMoney(summary.averageDistributionValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('reports.organismsServed', 'Organismes servis')}</span>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.uniqueOrganisms}</p>
            <p className="mt-1 text-xs text-gray-500">Top: {summary.topOrganism}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {comparison.value.delta !== null && comparison.value.delta < 0 ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-[#2d9561]" />
              )}
              {t('reports.periodComparison', 'Comparaison avec la période précédente')}
            </CardTitle>
            <CardDescription>
              {comparison.available
                ? t('reports.distributionPeriodComparisonDesc', 'Compare les distributions courantes avec la période précédente équivalente.')
                : t('reports.periodComparisonUnavailable', 'La comparaison nécessite une plage de dates complète.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comparison.available ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">Distributions</p>
                    <p className="text-xs text-gray-500">{comparison.distributions.previous} précédentes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{comparison.distributions.current}</p>
                    <Badge variant="outline" className={getDeltaClass(comparison.distributions.delta)}>{formatDelta(comparison.distributions.delta)}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">Quantité</p>
                    <p className="text-xs text-gray-500">{comparison.quantity.previous.toLocaleString()} précédentes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{comparison.quantity.current.toLocaleString()}</p>
                    <Badge variant="outline" className={getDeltaClass(comparison.quantity.delta)}>{formatDelta(comparison.quantity.delta)}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">Valeur</p>
                    <p className="text-xs text-gray-500">CAD$ {formatMoney(comparison.value.previous)} précédents</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">CAD$ {formatMoney(comparison.value.current)}</p>
                    <Badge variant="outline" className={getDeltaClass(comparison.value.delta)}>{formatDelta(comparison.value.delta)}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('reports.periodComparisonMissingDates', 'Sélectionnez une période datée pour activer la comparaison.')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-[#1a4d7a]" />
              {t('reports.monthlyEvolution', 'Évolution mensuelle')}
            </CardTitle>
            <CardDescription>
              {t('reports.distributionMonthlyEvolutionDesc', 'Historique des 6 derniers mois selon les filtres structurels actifs.')}
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
                          if (name === 'Valeur') {
                            return [`CAD$ ${formatMoney(Number(value || 0))}`, name];
                          }

                          return [Number(value || 0).toLocaleString(), name];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="quantity" name="Quantité" fill="#1a4d7a" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="value" name="Valeur" stroke="#2d9561" strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {monthlyEvolution.map((month) => (
                    <div key={month.monthKey} className="rounded-lg bg-gray-50 p-3">
                      <p className="font-medium text-gray-900">{month.monthLabel}</p>
                      <p className="mt-1 text-sm text-gray-600">{month.distributions} comandas</p>
                      <p className="text-sm text-gray-600">{month.quantity.toLocaleString()} unités</p>
                      <p className="text-sm font-semibold text-gray-900">CAD$ {formatMoney(month.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.byStatus', 'Répartition par état')}</CardTitle>
            <CardDescription>{t('reports.byStatusDesc', 'Suivi opérationnel des distributions selon leur avancement.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {byStatus.length === 0 ? (
              <p className="text-sm text-gray-500">{t('reports.noDistributionStatuses', 'Aucun état à afficher pour ces filtres.')}</p>
            ) : (
              <div className="space-y-3">
                {byStatus.map((row) => (
                  <div key={row.status} className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline" className={getStatusBadgeClass(row.status)}>{getStatusLabel(row.status)}</Badge>
                      <span className="text-sm font-semibold text-gray-900">{row.count} comandas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-[#1a4d7a]" style={{ width: `${row.percentage}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-500">{row.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Valeur: CAD$ {formatMoney(row.value)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.topOrganisms', 'Principaux organismes')}</CardTitle>
            <CardDescription>{t('reports.topOrganismsDesc', 'Organismes qui recoivent la plus grande valeur distribuee.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {byOrganism.length === 0 ? (
              <p className="text-sm text-gray-500">{t('reports.noDistributionOrganisms', 'Aucun organisme pour ces filtres.')}</p>
            ) : (
              <div className="space-y-3">
                {byOrganism.map((organism) => (
                  <div key={organism.organismName} className="space-y-1 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{organism.organismName}</span>
                      <span className="font-bold text-gray-900">CAD$ {formatMoney(organism.value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-[#2d9561]" style={{ width: `${organism.percentage}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-500">{organism.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">{organism.count} comandas • {organism.quantity.toLocaleString()} unidades</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1a4d7a]" />
                {t('reports.distributionDetails', 'Détail des distributions')}
              </CardTitle>
              <CardDescription>
                {t('reports.distributionDetailsDesc', 'Commandes et sorties correspondant aux filtres selectionnes.')}
              </CardDescription>
            </div>
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
          {filteredComandas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
              {t('reports.noDistributionData', 'Aucune distribution ne correspond aux filtres selectionnes.')}
            </div>
          ) : (
            <ScrollArea className="h-[420px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Comanda</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Organisme</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Produits</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Quantité</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Valeur</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredComandas.map((comanda) => (
                    <tr key={comanda.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-[#1a4d7a]">{comanda.numero}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{new Date(comanda.fecha).toLocaleDateString('fr-CA')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <p>{comanda.organismoNombre}</p>
                          <p className="text-xs text-gray-500">{comanda.organismoFrecuencia || 'Sin frecuencia'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{comanda.productos.length}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{comanda.totalPeso.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">CAD$ {formatMoney(comanda.totalValorMonetario)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={getStatusBadgeClass(comanda.estado)}>
                          {getStatusLabel(comanda.estado)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ExitReportView;
