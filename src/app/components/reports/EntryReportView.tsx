/**
 * Vista de Reporte de Aprovisionamiento
 *
 * Reporte vivo de entradas de inventario con filtros y agregados
 * calculados desde el almacenamiento real del entrepot.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Download,
  FileText,
  Filter,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  Truck,
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
import { obtenerTodasLasEntradas, type EntradaInventario } from '../../utils/entradaInventarioStorage';
import type { ReportPeriod } from '../../../types/reports';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type EntryStatusFilter = 'all' | 'active' | 'inactive';

type EntryRow = EntradaInventario & {
  categoryLabel: string;
  actorLabel: string;
  typeLabel: string;
  totalValueResolved: number;
};

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

function getEntryTypeLabel(tipoEntrada: string): string {
  const normalized = normalizeText(tipoEntrada);

  if (normalized === 'don') return 'Don';
  if (normalized === 'achat') return 'Achat';
  if (normalized === 'transferencia') return 'Transferencia';

  return tipoEntrada || 'Sin tipo';
}

function getStatusLabel(activo: boolean): string {
  return activo ? 'Activo' : 'Anulado';
}

export function EntryReportView() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ReportPeriod>('thisMonth');
  const [selectedActor, setSelectedActor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEntryType, setSelectedEntryType] = useState('all');
  const [statusFilter, setStatusFilter] = useState<EntryStatusFilter>('active');
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

  const entries = useMemo<EntryRow[]>(() => {
    return obtenerTodasLasEntradas().map((entry) => {
      const totalValueResolved = typeof entry.valorTotal === 'number'
        ? entry.valorTotal
        : typeof entry.valorUnitario === 'number'
          ? entry.valorUnitario * entry.cantidad
          : 0;

      return {
        ...entry,
        categoryLabel: entry.productoCategoria || entry.categoria || 'Sin categoria',
        actorLabel: entry.donadorNombre || 'Sin actor',
        typeLabel: getEntryTypeLabel(entry.tipoEntrada),
        totalValueResolved,
      };
    });
  }, [refreshKey]);

  const dateRange = useMemo(
    () => toDateRange(period, customStartDate, customEndDate),
    [period, customStartDate, customEndDate]
  );

  const actorOptions = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.actorLabel))).sort((a, b) => a.localeCompare(b)),
    [entries]
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.categoryLabel))).sort((a, b) => a.localeCompare(b)),
    [entries]
  );

  const entryTypeOptions = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.tipoEntrada).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [entries]
  );

  const baseFilteredEntries = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return entries
      .filter((entry) => selectedActor === 'all' || entry.actorLabel === selectedActor)
      .filter((entry) => selectedCategory === 'all' || entry.categoryLabel === selectedCategory)
      .filter((entry) => selectedEntryType === 'all' || entry.tipoEntrada === selectedEntryType)
      .filter((entry) => {
        if (statusFilter === 'active') return entry.activo;
        if (statusFilter === 'inactive') return !entry.activo;
        return true;
      })
      .filter((entry) => {
        if (!normalizedSearch) return true;

        return [
          entry.id,
          entry.actorLabel,
          entry.nombreProducto,
          entry.typeLabel,
          entry.productoCodigo,
          entry.programaNombre,
        ].some((value) => normalizeText(value).includes(normalizedSearch));
      });
  }, [entries, searchTerm, selectedActor, selectedCategory, selectedEntryType, statusFilter]);

  const filteredEntries = useMemo(() => {
    return baseFilteredEntries
      .filter((entry) => matchesRange(entry.fecha, dateRange))
      .slice()
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [baseFilteredEntries, dateRange]);

  const previousRange = useMemo(() => shiftRange(dateRange), [dateRange]);

  const previousEntries = useMemo(() => {
    if (!previousRange) {
      return [] as EntryRow[];
    }

    return baseFilteredEntries.filter((entry) => matchesRange(entry.fecha, previousRange));
  }, [baseFilteredEntries, previousRange]);

  const summary = useMemo(() => {
    const totalEntries = filteredEntries.length;
    const totalQuantity = filteredEntries.reduce((sum, entry) => sum + entry.cantidad, 0);
    const totalWeight = filteredEntries.reduce((sum, entry) => sum + (entry.pesoTotal || 0), 0);
    const totalValue = filteredEntries.reduce((sum, entry) => sum + entry.totalValueResolved, 0);
    const uniqueActors = new Set(filteredEntries.map((entry) => entry.actorLabel)).size;
    const uniqueProducts = new Set(filteredEntries.map((entry) => entry.productoId)).size;

    const byActorMap = new Map<string, { entries: number; value: number }>();
    const byCategoryMap = new Map<string, { entries: number; value: number }>();

    filteredEntries.forEach((entry) => {
      const actorCurrent = byActorMap.get(entry.actorLabel) || { entries: 0, value: 0 };
      byActorMap.set(entry.actorLabel, {
        entries: actorCurrent.entries + 1,
        value: actorCurrent.value + entry.totalValueResolved,
      });

      const categoryCurrent = byCategoryMap.get(entry.categoryLabel) || { entries: 0, value: 0 };
      byCategoryMap.set(entry.categoryLabel, {
        entries: categoryCurrent.entries + 1,
        value: categoryCurrent.value + entry.totalValueResolved,
      });
    });

    const topActor = Array.from(byActorMap.entries()).sort((a, b) => b[1].value - a[1].value)[0]?.[0] || '-';
    const topCategory = Array.from(byCategoryMap.entries()).sort((a, b) => b[1].value - a[1].value)[0]?.[0] || '-';

    return {
      totalEntries,
      totalQuantity,
      totalWeight,
      totalValue,
      uniqueActors,
      uniqueProducts,
      averageEntryValue: totalEntries > 0 ? totalValue / totalEntries : 0,
      topActor,
      topCategory,
    };
  }, [filteredEntries]);

  const byActor = useMemo(() => {
    const totalValue = filteredEntries.reduce((sum, entry) => sum + entry.totalValueResolved, 0);
    const grouped = new Map<string, { totalEntries: number; totalValue: number; totalQuantity: number }>();

    filteredEntries.forEach((entry) => {
      const current = grouped.get(entry.actorLabel) || { totalEntries: 0, totalValue: 0, totalQuantity: 0 };
      grouped.set(entry.actorLabel, {
        totalEntries: current.totalEntries + 1,
        totalValue: current.totalValue + entry.totalValueResolved,
        totalQuantity: current.totalQuantity + entry.cantidad,
      });
    });

    return Array.from(grouped.entries())
      .map(([actorLabel, current]) => ({
        actorLabel,
        ...current,
        percentage: totalValue > 0 ? (current.totalValue / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }, [filteredEntries]);

  const byCategory = useMemo(() => {
    const totalValue = filteredEntries.reduce((sum, entry) => sum + entry.totalValueResolved, 0);
    const grouped = new Map<string, { totalEntries: number; totalValue: number; totalQuantity: number }>();

    filteredEntries.forEach((entry) => {
      const current = grouped.get(entry.categoryLabel) || { totalEntries: 0, totalValue: 0, totalQuantity: 0 };
      grouped.set(entry.categoryLabel, {
        totalEntries: current.totalEntries + 1,
        totalValue: current.totalValue + entry.totalValueResolved,
        totalQuantity: current.totalQuantity + entry.cantidad,
      });
    });

    return Array.from(grouped.entries())
      .map(([categoryLabel, current]) => ({
        categoryLabel,
        ...current,
        percentage: totalValue > 0 ? (current.totalValue / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }, [filteredEntries]);

  const comparison = useMemo(() => {
    const previousEntriesCount = previousEntries.length;
    const previousQuantity = previousEntries.reduce((sum, entry) => sum + entry.cantidad, 0);
    const previousValue = previousEntries.reduce((sum, entry) => sum + entry.totalValueResolved, 0);

    return {
      entries: {
        current: summary.totalEntries,
        previous: previousEntriesCount,
        delta: calculateDelta(summary.totalEntries, previousEntriesCount),
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
  }, [previousEntries, previousRange, summary.totalEntries, summary.totalQuantity, summary.totalValue]);

  const monthlyEvolution = useMemo(() => {
    const grouped = new Map<string, { entries: number; quantity: number; value: number }>();

    baseFilteredEntries.forEach((entry) => {
      const date = new Date(entry.fecha);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = grouped.get(monthKey) || { entries: 0, quantity: 0, value: 0 };

      grouped.set(monthKey, {
        entries: current.entries + 1,
        quantity: current.quantity + entry.cantidad,
        value: current.value + entry.totalValueResolved,
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
  }, [baseFilteredEntries]);

  const exportRows = useMemo(() => {
    return filteredEntries.map((entry) => ({
      id: entry.id,
      date: new Date(entry.fecha),
      entryType: entry.typeLabel,
      actor: entry.actorLabel,
      program: entry.programaNombre || '-',
      product: entry.nombreProducto,
      category: entry.categoryLabel,
      quantity: entry.cantidad,
      unit: entry.unidad,
      totalWeight: entry.pesoTotal || 0,
      totalValue: entry.totalValueResolved,
      status: getStatusLabel(entry.activo),
    }));
  }, [filteredEntries]);

  const exportColumns = useMemo<TableColumn[]>(() => [
    { header: 'ID', key: 'id', width: 110 },
    { header: 'Date', key: 'date', width: 90, format: (value) => new Date(value).toLocaleDateString('fr-CA') },
    { header: 'Type', key: 'entryType', width: 80 },
    { header: 'Acteur', key: 'actor', width: 120 },
    { header: 'Programme', key: 'program', width: 100 },
    { header: 'Produit', key: 'product', width: 130 },
    { header: 'Categorie', key: 'category', width: 100 },
    { header: 'Quantite', key: 'quantity', width: 70, align: 'right' },
    { header: 'Unite', key: 'unit', width: 60, align: 'center' },
    { header: 'Poids (kg)', key: 'totalWeight', width: 85, align: 'right', format: (value) => Number(value || 0).toFixed(2) },
    { header: 'Valeur', key: 'totalValue', width: 85, align: 'right', format: (value) => `CAD$ ${formatMoney(Number(value || 0))}` },
    { header: 'Etat', key: 'status', width: 80, align: 'center' },
  ], []);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (exportRows.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setExportingFormat(format);

    try {
      await exportData(format, exportRows, exportColumns, {
        filename: generateFilename('rapport_approvisionnement_entrepot', format),
        title: 'Rapport d\'approvisionnement - Entrepot',
        subtitle: `${exportRows.length} lignes exportées • ${summary.totalEntries} entrées • CAD$ ${formatMoney(summary.totalValue)}`,
        includeDate: true,
        orientation: format === 'pdf' ? 'landscape' : 'portrait',
      });

      toast.success(`Export ${format.toUpperCase()} genere`, {
        description: `${exportRows.length} lignes d'approvisionnement exportees.`
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
    setSelectedActor('all');
    setSelectedCategory('all');
    setSelectedEntryType('all');
    setStatusFilter('active');
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
            {t('reports.procurementFilters', 'Filtres d\'approvisionnement')}
          </CardTitle>
          <CardDescription>
            {t('reports.procurementFiltersDesc', 'Affinez le rapport par periode, type d\'entree, acteur et produit.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reports.period', 'Période')}
              </label>
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reports.entryType', 'Type d\'entrée')}
              </label>
              <Select value={selectedEntryType} onValueChange={setSelectedEntryType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allEntryTypes', 'Tous les types')}</SelectItem>
                  {entryTypeOptions.map((entryType) => (
                    <SelectItem key={entryType} value={entryType}>
                      {getEntryTypeLabel(entryType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reports.actor', 'Donateur / fournisseur')}
              </label>
              <Select value={selectedActor} onValueChange={setSelectedActor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allActors', 'Tous les acteurs')}</SelectItem>
                  {actorOptions.map((actor) => (
                    <SelectItem key={actor} value={actor}>
                      {actor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reports.category', 'Catégorie')}
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allCategories', 'Toutes les catégories')}</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reports.status', 'État')}
              </label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EntryStatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allStatuses', 'Tous les états')}</SelectItem>
                  <SelectItem value="active">{t('reports.activeOnly', 'Actifs')}</SelectItem>
                  <SelectItem value="inactive">{t('reports.inactiveOnly', 'Annulés')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('reports.startDate', 'Date de début')}
                </label>
                <Input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('reports.endDate', 'Date de fin')}
                </label>
                <Input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reports.search', 'Rechercher')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder={t('reports.procurementSearchPlaceholder', 'Entrada, actor, producto o programa...')}
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
              <span className="text-sm text-gray-500">{t('reports.totalEntries', 'Entrées')}</span>
              <Package className="h-5 w-5 text-[#1a4d7a]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalEntries}</p>
            <p className="mt-1 text-xs text-gray-500">{summary.uniqueProducts} produits distincts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('reports.totalQuantity', 'Quantité totale')}</span>
              <BarChart3 className="h-5 w-5 text-[#2d9561]" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalQuantity.toLocaleString()}</p>
            <p className="mt-1 text-xs text-gray-500">{summary.totalWeight.toFixed(2)} kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('reports.totalValue', 'Valeur totale')}</span>
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">CAD$ {formatMoney(summary.totalValue)}</p>
            <p className="mt-1 text-xs text-gray-500">Moyenne: CAD$ {formatMoney(summary.averageEntryValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('reports.uniqueActors', 'Acteurs')}</span>
              <Truck className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.uniqueActors}</p>
            <p className="mt-1 text-xs text-gray-500">Top: {summary.topActor}</p>
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
                ? t('reports.periodComparisonDesc', 'Mesure l\'écart entre la période sélectionnée et la période précédente équivalente.')
                : t('reports.periodComparisonUnavailable', 'La comparaison nécessite une plage de dates complète.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comparison.available ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">Entrées</p>
                    <p className="text-xs text-gray-500">{comparison.entries.previous} précédentes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{comparison.entries.current}</p>
                    <Badge variant="outline" className={getDeltaClass(comparison.entries.delta)}>{formatDelta(comparison.entries.delta)}</Badge>
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
              <BarChart3 className="h-5 w-5 text-[#1a4d7a]" />
              {t('reports.monthlyEvolution', 'Évolution mensuelle')}
            </CardTitle>
            <CardDescription>
              {t('reports.monthlyEvolutionDesc', 'Historique des 6 derniers mois selon les filtres structurels actifs.')}
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
                      <p className="mt-1 text-sm text-gray-600">{month.entries} entrées</p>
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2d9561]" />
              {t('reports.topActors', 'Principaux acteurs')}
            </CardTitle>
            <CardDescription>
              {t('reports.topActorsDesc', 'Acteurs qui alimentent le plus le stock pendant la periode.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {byActor.length === 0 ? (
              <p className="text-sm text-gray-500">{t('reports.noProcurementActors', 'Aucun acteur pour ces filtres.')}</p>
            ) : (
              <div className="space-y-3">
                {byActor.map((actor, index) => (
                  <div key={actor.actorLabel} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-0 bg-[#1a4d7a] text-white">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium text-gray-900">{actor.actorLabel}</p>
                        <p className="text-xs text-gray-500">{actor.totalEntries} entrées • {actor.totalQuantity.toLocaleString()} unités</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">CAD$ {formatMoney(actor.totalValue)}</p>
                      <p className="text-xs text-gray-500">{actor.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#1a4d7a]" />
              {t('reports.byCategory', 'Répartition par catégorie')}
            </CardTitle>
            <CardDescription>
              {t('reports.byCategoryDesc', 'Contribution de chaque categorie au flux d\'approvisionnement.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="text-sm text-gray-500">{t('reports.noProcurementCategories', 'Aucune categorie pour ces filtres.')}</p>
            ) : (
              <div className="space-y-3">
                {byCategory.map((category) => (
                  <div key={category.categoryLabel} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{category.categoryLabel}</span>
                      <span className="font-bold text-gray-900">CAD$ {formatMoney(category.totalValue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-gradient-to-r from-[#1a4d7a] to-[#2d9561]" style={{ width: `${category.percentage}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-500">{category.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">{category.totalEntries} entrées • {category.totalQuantity.toLocaleString()} unités</p>
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
                {t('reports.procurementDetails', 'Détail des approvisionnements')}
              </CardTitle>
              <CardDescription>
                {t('reports.procurementDetailsDesc', 'Lignes d\'entrée correspondant aux filtres selectionnes.')}
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
          {filteredEntries.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
              {t('reports.noProcurementData', 'Aucune entree ne correspond aux filtres selectionnes.')}
            </div>
          ) : (
            <ScrollArea className="h-[420px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Acteur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Produit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Quantité</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Valeur</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-[#1a4d7a]">{entry.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{new Date(entry.fecha).toLocaleDateString('fr-CA')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.typeLabel}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{entry.actorLabel}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p>{entry.nombreProducto}</p>
                          <p className="text-xs text-gray-500">{entry.categoryLabel}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{entry.cantidad.toLocaleString()} {entry.unidad}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">CAD$ {formatMoney(entry.totalValueResolved)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={entry.activo ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}
                        >
                          {getStatusLabel(entry.activo)}
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

export default EntryReportView;
