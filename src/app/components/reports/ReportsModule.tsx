/**
 * Módulo Principal de Reportes
 * 
 * Sistema completo de reportes para approvisionnement, distribution
 * y comparación con visualización y exportación.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { EntryReportView } from './EntryReportView';
import { ExitReportView } from './ExitReportView';
import { DonorReportView } from './DonorReportView';
import { ProgramReportView } from './ProgramReportView';
import { obtenerComandasReporte } from './reportComandas';
import { formatMoney } from '../../utils/formatUtils';
import { obtenerTodasLasEntradas } from '../../utils/entradaInventarioStorage';
import type { ReportType } from '../../../types/reports';

type QuickStatCard = {
  primaryValue: number;
  secondaryValue: number;
  growth: number | null;
};

interface ReportsModuleProps {
  embedded?: boolean;
  hideHeader?: boolean;
}

function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  };
}

function getPreviousMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
  };
}

function isWithinRange(dateValue: string | undefined, range: { start: Date; end: Date }): boolean {
  if (!dateValue) return false;

  const current = new Date(dateValue);
  if (Number.isNaN(current.getTime())) return false;

  return current >= range.start && current <= range.end;
}

function calculateGrowth(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
}

function formatGrowth(growth: number | null): string {
  if (growth === null) return 'Nuevo';
  if (growth === 0) return '0.0%';
  return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
}

function getSafeMoneyValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function ReportsModule({ embedded = false, hideHeader = false }: ReportsModuleProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ReportType>('entries');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);

    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const quickStats = useMemo(() => {
    const currentMonth = getCurrentMonthRange();
    const previousMonth = getPreviousMonthRange();

    const entries = obtenerTodasLasEntradas();
    const commandes = obtenerComandasReporte();

    const currentEntries = entries.filter((entry) => entry.activo && isWithinRange(entry.fecha, currentMonth));
    const previousEntries = entries.filter((entry) => entry.activo && isWithinRange(entry.fecha, previousMonth));
    const currentEntryValue = currentEntries.reduce((sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)), 0);
    const previousEntryValue = previousEntries.reduce((sum, entry) => sum + (entry.valorTotal ?? ((entry.valorUnitario || 0) * entry.cantidad)), 0);

    const activeCommandes = commandes.filter((comanda) => comanda.estado !== 'anulada');
    const currentCommandes = activeCommandes.filter((comanda) => isWithinRange(comanda.fecha, currentMonth));
    const previousCommandes = activeCommandes.filter((comanda) => isWithinRange(comanda.fecha, previousMonth));
    const currentCommandeValue = currentCommandes.reduce((sum, comanda) => sum + getSafeMoneyValue(comanda.totalValorMonetario), 0);
    const previousCommandeValue = previousCommandes.reduce((sum, comanda) => sum + getSafeMoneyValue(comanda.totalValorMonetario), 0);

    const currentActors = new Set(currentEntries.map((entry) => entry.donadorNombre).filter(Boolean));
    const allActors = new Set(entries.filter((entry) => entry.activo).map((entry) => entry.donadorNombre).filter(Boolean));
    const previousActors = new Set(previousEntries.map((entry) => entry.donadorNombre).filter(Boolean));

    const currentPrograms = new Set(currentEntries.map((entry) => entry.programaCodigo || entry.programaNombre).filter(Boolean));
    const allPrograms = new Set(entries.filter((entry) => entry.activo).map((entry) => entry.programaCodigo || entry.programaNombre).filter(Boolean));
    const previousPrograms = new Set(previousEntries.map((entry) => entry.programaCodigo || entry.programaNombre).filter(Boolean));

    return {
      procurement: {
        primaryValue: currentEntries.length,
        secondaryValue: currentEntryValue,
        growth: calculateGrowth(currentEntryValue, previousEntryValue),
      } satisfies QuickStatCard,
      distribution: {
        primaryValue: currentCommandes.length,
        secondaryValue: currentCommandeValue,
        growth: calculateGrowth(currentCommandeValue, previousCommandeValue),
      } satisfies QuickStatCard,
      actors: {
        primaryValue: currentActors.size,
        secondaryValue: allActors.size,
        growth: calculateGrowth(currentActors.size, previousActors.size),
      } satisfies QuickStatCard,
      programs: {
        primaryValue: currentPrograms.size,
        secondaryValue: allPrograms.size,
        growth: calculateGrowth(currentPrograms.size, previousPrograms.size),
      } satisfies QuickStatCard,
    };
  }, [refreshKey]);

  return (
    <div className={embedded ? 'space-y-6' : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'}>
      {!embedded && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>
      )}

      <div className={embedded ? 'space-y-6' : 'container mx-auto px-4 py-8 relative'}>
        {!hideHeader && (
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl text-white shadow-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                    {t('reports.title', 'Rapports')}
                  </h1>
                  <p className="text-gray-600">
                    {t('reports.subtitle', 'Système complet de rapports et d\'analyse')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('reports.period', 'Période')}
                  </Button>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    {t('reports.filters', 'Filtres')}
                  </Button>
                  <Button className="bg-[#2d9561] hover:bg-[#257a4f]">
                    <Download className="w-4 h-4 mr-2" />
                    {t('reports.export', 'Exporter')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          {/* Entradas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.procurement', 'Approvisionnement')}
                </span>
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.procurement.primaryValue}
                  </p>
                  <p className="text-xs text-gray-500">
                    CAD$ {formatMoney(quickStats.procurement.secondaryValue)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {(quickStats.procurement.growth ?? 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${(quickStats.procurement.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatGrowth(quickStats.procurement.growth)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salidas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.distribution', 'Distribution')}
                </span>
                <ArrowDownCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.distribution.primaryValue}
                  </p>
                  <p className="text-xs text-gray-500">
                    CAD$ {formatMoney(quickStats.distribution.secondaryValue)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {(quickStats.distribution.growth ?? 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${(quickStats.distribution.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatGrowth(quickStats.distribution.growth)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donadores */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.donors', 'Donateurs')}
                </span>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.actors.primaryValue}
                  </p>
                  <p className="text-xs text-gray-500">
                    sur {quickStats.actors.secondaryValue} au total
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {(quickStats.actors.growth ?? 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${(quickStats.actors.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatGrowth(quickStats.actors.growth)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {t('reports.programs', 'Programmes')}
                </span>
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {quickStats.programs.primaryValue}
                  </p>
                  <p className="text-xs text-gray-500">
                    sur {quickStats.programs.secondaryValue} au total
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {(quickStats.programs.growth ?? 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${(quickStats.programs.growth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatGrowth(quickStats.programs.growth)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de reportes */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportType)} className="space-y-6">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl">
            <TabsList className="grid grid-cols-3 w-full p-1 bg-gray-100/50">
              <TabsTrigger value="entries" className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                {t('reports.procurement', 'Approvisionnement')}
              </TabsTrigger>
              <TabsTrigger value="exits" className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                {t('reports.distribution', 'Distribution')}
              </TabsTrigger>
              <TabsTrigger value="comparative" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('reports.comparisonTab', 'Comparaison')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Reporte de Entradas */}
          <TabsContent value="entries">
            <EntryReportView />
          </TabsContent>

          {/* Tab: Reporte de Salidas */}
          <TabsContent value="exits">
            <ExitReportView />
          </TabsContent>

          {/* Tab: Reporte Comparativo */}
          <TabsContent value="comparative" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border border-[#E0E0E0] shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Users className="w-5 h-5 text-[#1a4d7a]" />
                    {t('reports.donors', 'Donateurs')}
                  </CardTitle>
                  <CardDescription>
                    {t('reports.periodComparisonDesc', 'Mesure l\'écart entre la période sélectionnée et la période précédente équivalente.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DonorReportView />
                </CardContent>
              </Card>

              <Card className="border border-[#E0E0E0] shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Activity className="w-5 h-5 text-[#2d9561]" />
                    {t('reports.programs', 'Programmes')}
                  </CardTitle>
                  <CardDescription>
                    {t('reports.monthlyEvolutionDesc', 'Historique des 6 derniers mois selon les filtres structurels actifs.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgramReportView />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ReportsModule;
