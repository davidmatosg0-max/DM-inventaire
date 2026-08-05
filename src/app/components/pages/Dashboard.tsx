import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ClipboardList, Building, TrendingUp, Clock, Users, DollarSign, AlertTriangle, Sparkles, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertaComandasUrgentes } from '../AlertaComandasUrgentes';
import { COMANDAS_UPDATED_EVENT, obtenerComandas } from '../../utils/comandaStorage';
import { EntradaDonAchat } from '../EntradaDonAchat';
import { VerificacionesRecientes } from '../VerificacionesRecientes';
import { AlertasInteligentes } from '../inventario/AlertasInteligentes';
import { useBranding } from '../../../hooks/useBranding';
import { formatLargeNumber } from '../../utils/formatUtils';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { escucharCambiosOrganismo } from '../../utils/organismoEvents';
import { obtenerMovimientos, type MovimientoExtendido } from '../../utils/movimientoStorage';
import { 
  obtenerProductosActivos, 
  type ProductoCreado 
} from '../../utils/productStorage';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import type { Comanda } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


type MovimientoChartPoint = {
  id: string;
  dia: string;
  entradas: number;
  salidas: number;
  stockTotal: number;
};

function obtenerDeltaMovimiento(movimiento: MovimientoExtendido): number {
  const cantidadAnterior = Number(movimiento.cantidadAnterior);
  const cantidadActual = Number(movimiento.cantidadActual);

  if (Number.isFinite(cantidadAnterior) && Number.isFinite(cantidadActual)) {
    return cantidadActual - cantidadAnterior;
  }

  const cantidad = Number(movimiento.cantidad || 0);
  switch (movimiento.tipo) {
    case 'entrada':
      return cantidad;
    case 'salida':
    case 'distribucion':
    case 'distribucion_completada':
    case 'transformacion':
    case 'conversion_unidad':
      return -cantidad;
    default:
      return 0;
  }
}

function construirSerieDashboard(movimientos: MovimientoExtendido[], stockActualTotal: number): MovimientoChartPoint[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const puntos = Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - (6 - index));

    return {
      id: `dashboard-dia-${index}`,
      fechaClave: fecha.toISOString().slice(0, 10),
      dia: fecha.toLocaleDateString('fr-CA', { weekday: 'short' }),
      entradas: 0,
      salidas: 0,
    };
  });

  const puntoPorFecha = new Map(puntos.map((punto) => [punto.fechaClave, punto]));

  movimientos.forEach((movimiento) => {
    const fecha = new Date(movimiento.fecha);
    if (Number.isNaN(fecha.getTime())) {
      return;
    }

    const fechaClave = fecha.toISOString().slice(0, 10);
    const punto = puntoPorFecha.get(fechaClave);
    if (!punto) {
      return;
    }

    const delta = obtenerDeltaMovimiento(movimiento);
    if (delta >= 0) {
      punto.entradas += delta;
    } else {
      punto.salidas += Math.abs(delta);
    }
  });

  const movimientoNetoPeriodo = puntos.reduce((total, punto) => total + punto.entradas - punto.salidas, 0);
  let stockAcumulado = Math.max(0, stockActualTotal - movimientoNetoPeriodo);

  return puntos.map((punto) => {
    stockAcumulado += punto.entradas - punto.salidas;

    return {
      id: punto.id,
      dia: punto.dia,
      entradas: Math.round(punto.entradas),
      salidas: Math.round(punto.salidas),
      stockTotal: Math.max(0, Math.round(stockAcumulado)),
    };
  });
}

export function Dashboard() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileEntryOpen, setMobileEntryOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrganismos: 0,
    organismosActivos: 0,
    totalProductos: 0,
    totalStock: 0,
    stockBajo: 0,
    comandasPendientes: 0,
    comandasAceptadas: 0,
    comandasMes: 0,
    valorTotalInventario: 0,
    personasAtendidas: 0,
  });
  const [productosStockBajo, setProductosStockBajo] = useState<ProductoCreado[]>([]);
  const [comandasRecientes, setComandasRecientes] = useState<Comanda[]>([]);
  const [movimientosPorDia, setMovimientosPorDia] = useState<MovimientoChartPoint[]>([]);
  const [organismosDisponibles, setOrganismosDisponibles] = useState<any[]>([]);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'executive' | 'suivi' | 'prevision'>('executive');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cargarDatos = useCallback(() => {
    // Obtener datos de localStorage
    const productos = obtenerProductosActivos();
    const comandas = obtenerComandas();
    const organismos = obtenerOrganismos();
    const movimientos = obtenerMovimientos();

    // Calcular estadísticas
    const totalStock = productos.reduce((sum, p) => sum + p.stockActual, 0);
    const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo);
    const comandasPendientes = comandas.filter(c => c.estado === 'pendiente' || c.estado === 'en_preparacion').length;
    const comandasAceptadas = comandas.filter(c => c.estado === 'confirmada').length;
    
    // Calcular valor total del inventario
    const valorTotal = productos.reduce((sum, p) => {
      // Prioridad 1: Usar valorTotal si está disponible
      if (p.valorTotal && p.valorTotal > 0) {
        return sum + p.valorTotal;
      }
      // Prioridad 2: Calcular desde valorUnitario
      if (p.valorUnitario && p.valorUnitario > 0) {
        return sum + (p.valorUnitario * p.stockActual);
      }
      // Si no hay valores monetarios específicos, no sumar nada
      return sum;
    }, 0);

    setStats({
      totalOrganismos: organismos.length,
      organismosActivos: organismos.filter(o => o.activo).length,
      totalProductos: productos.length,
      totalStock: Math.round(totalStock),
      stockBajo: stockBajo.length,
      comandasPendientes,
      comandasAceptadas,
      comandasMes: comandas.length,
      valorTotalInventario: Math.round(valorTotal),
      personasAtendidas: organismos.reduce((sum, o) => sum + (o.beneficiarios || 0), 0),
    });

    setProductosStockBajo(stockBajo.slice(0, 5));
    setComandasRecientes(
      [...comandas].sort((a, b) => {
        const fechaA = new Date(a.fechaEntrega || a.fechaCreacion || a.fecha).getTime();
        const fechaB = new Date(b.fechaEntrega || b.fechaCreacion || b.fecha).getTime();
        return fechaB - fechaA;
      }).slice(0, 5)
    );
    setMovimientosPorDia(construirSerieDashboard(movimientos, totalStock));
    setOrganismosDisponibles(organismos);
  }, []);

  useEffect(() => {
    cargarDatos();

    const handleRefresh = () => {
      cargarDatos();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        cargarDatos();
      }
    };

    const cleanupOrganismos = escucharCambiosOrganismo(cargarDatos);
    const refreshEvents = ['productos-actualizados', 'entradaGuardada', COMANDAS_UPDATED_EVENT, 'storage', 'focus'] as const;

    refreshEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleRefresh);
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      refreshEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleRefresh);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupOrganismos();
    };
  }, [cargarDatos]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [activeDashboardTab]);

  const totalProductos = stats.totalProductos;
  const stockTotal = stats.totalStock;
  const comandasPendientes = stats.comandasPendientes;
  const comandasAceptadas = stats.comandasAceptadas;
  const organismosActivos = stats.organismosActivos;
  const totalOrganismos = stats.totalOrganismos;
  const organismesInactifs = Math.max(0, totalOrganismos - organismosActivos);
  const fluxEntranteMoyen = movimientosPorDia.length > 0
    ? Math.round(movimientosPorDia.reduce((sum, point) => sum + point.entradas, 0) / movimientosPorDia.length)
    : 0;
  const fluxSortantMoyen = movimientosPorDia.length > 0
    ? Math.round(movimientosPorDia.reduce((sum, point) => sum + point.salidas, 0) / movimientosPorDia.length)
    : 0;
  const variationNetteMoyenne = fluxEntranteMoyen - fluxSortantMoyen;
  const projectionStock14Jours = Math.max(0, Math.round(stockTotal + (variationNetteMoyenne * 14)));
  const joursAvantTension = variationNetteMoyenne < 0
    ? Math.max(1, Math.ceil(stockTotal / Math.abs(variationNetteMoyenne)))
    : null;
  const tauxRisqueStock = totalProductos > 0 ? Math.round((stats.stockBajo / totalProductos) * 100) : 0;
  const valeurMoyenneProduit = totalProductos > 0 ? Math.round(stats.valorTotalInventario / totalProductos) : 0;
  const glassCardClassName = 'border-white/60 bg-white/80 shadow-lg backdrop-blur-xl';
  const usuarioActual = obtenerUsuarioSesion();
  const nombreUsuario = usuarioActual?.nombre || 'David';

  if (isMobile) {
    const productos = obtenerProductosActivos();
    const grouped = productos.reduce((acc, producto) => {
      const key = producto.categoria || producto.subcategoria || 'Autres';
      acc.set(key, (acc.get(key) || 0) + Number(producto.stockActual || 0));
      return acc;
    }, new Map<string, number>());

    const totalCategorias = Array.from(grouped.values()).reduce((sum, value) => sum + value, 0);
    const colores = ['#2F6BFF', '#57C76E', '#FF8A34', '#9B5CF7'];
    const topCategorias = Array.from(grouped.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, value], index) => ({
        name,
        value,
        color: colores[index % colores.length],
        pct: totalCategorias > 0 ? Math.max(8, Math.round((value / totalCategorias) * 100)) : 0,
      }));

    return (
      <div className="space-y-3 pb-24">
        <section className="rounded-[22px] bg-gradient-to-br from-[#153B7A] to-[#102E61] p-4 text-white shadow-[0_16px_34px_-20px_rgba(16,46,97,0.72)]">
          <p className="text-[11px] text-white/80">{t('dashboard.mobile.greeting', { name: nombreUsuario })}</p>
          <h2 className="text-[18px] font-semibold tracking-tight text-white sm:text-[20px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('dashboard.mobile.todaySummary')}</h2>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div><div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF]"><Package className="h-4 w-4" /></div><p className="text-sm font-bold">{formatLargeNumber(stockTotal)}</p><p className="text-[10px] text-white/75">{t('dashboard.mobile.stockShort')}</p></div>
            <div><div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#57C76E]"><Users className="h-4 w-4" /></div><p className="text-sm font-bold">{organismosActivos}</p><p className="text-[10px] text-white/75">{t('dashboard.mobile.organismsShort')}</p></div>
            <div><div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF8A34]"><ClipboardList className="h-4 w-4" /></div><p className="text-sm font-bold">{comandasPendientes}</p><p className="text-[10px] text-white/75">{t('dashboard.mobile.ordersShort')}</p></div>
            <div><div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#9B5CF7]"><TrendingUp className="h-4 w-4" /></div><p className="text-sm font-bold">{tauxRisqueStock}%</p><p className="text-[10px] text-white/75">{t('dashboard.mobile.riskShort')}</p></div>
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)]">
          <h3 className="mb-2 text-[17px] font-semibold text-[#17314F] sm:text-[18px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('dashboard.quickActions')}</h3>
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => setMobileEntryOpen(true)} className="flex flex-col items-center gap-1.5"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2F6BFF] text-white"><Package className="h-4 w-4" /></span><span className="text-[11px] font-medium text-[#20344f]">{t('dashboard.mobile.entryAction')}</span></button>
            <button onClick={() => setActiveDashboardTab('executive')} className="flex flex-col items-center gap-1.5"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#57C76E] text-white"><Clock className="h-4 w-4" /></span><span className="text-[11px] font-medium text-[#20344f]">{t('dashboard.mobile.monitorAction')}</span></button>
            <button onClick={() => setActiveDashboardTab('suivi')} className="flex flex-col items-center gap-1.5"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF8A34] text-white"><Users className="h-4 w-4" /></span><span className="text-[11px] font-medium text-[#20344f]">{t('dashboard.mobile.organismsAction')}</span></button>
            <button onClick={() => setActiveDashboardTab('prevision')} className="flex flex-col items-center gap-1.5"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9B5CF7] text-white"><TrendingUp className="h-4 w-4" /></span><span className="text-[11px] font-medium text-[#20344f]">{t('dashboard.mobile.aiAction')}</span></button>
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)]">
          <h3 className="mb-2 text-[17px] font-semibold text-[#17314F] sm:text-[18px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('dashboard.inventoryByCategory')}</h3>
          <div className="space-y-3">
            {topCategorias.length === 0 ? (
              <p className="text-sm text-[#6b7280]">{t('dashboard.mobile.noCategoryAvailable')}</p>
            ) : (
              topCategorias.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between"><p className="truncate text-sm font-semibold text-[#1f3250]">{item.name}</p><p className="text-xs font-semibold" style={{ color: item.color }}>{formatLargeNumber(item.value)} kg</p></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: item.pct + '%', backgroundColor: item.color }} /></div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.35)]">
          <h3 className="mb-2 text-[17px] font-semibold text-[#17314F] sm:text-[18px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('dashboard.mobile.alertsTitle')}</h3>
          <div className="space-y-2">
            <div className="rounded-2xl border border-[#edf1f5] px-3 py-2.5"><p className="text-sm font-semibold text-[#1f3250]">{t('dashboard.mobile.lowStockLine', { count: stats.stockBajo })}</p><p className="text-xs text-[#6b7280]">{t('dashboard.mobile.reviewRecommended')}</p></div>
            <div className="rounded-2xl border border-[#edf1f5] px-3 py-2.5"><p className="text-sm font-semibold text-[#1f3250]">{t('dashboard.mobile.projection14Days', { value: formatLargeNumber(projectionStock14Jours) })}</p><p className="text-xs text-[#6b7280]">{joursAvantTension ? t('dashboard.mobile.tensionInDays', { days: joursAvantTension }) : t('dashboard.mobile.stockStable')}</p></div>
            <div className="flex items-center gap-2 rounded-2xl border border-[#fee2e2] bg-[#fef2f2] px-3 py-2.5 text-[#b91c1c]"><AlertTriangle className="h-4 w-4" /><p className="text-xs font-semibold">{t('dashboard.mobile.activeCriticalWatch')}</p></div>
          </div>
        </section>

        <EntradaDonAchat open={mobileEntryOpen} onOpenChange={setMobileEntryOpen} hideTrigger />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ModulePageHeader
        title={`${t('dashboard.title')} - Entrepôt`}
        subtitle={t('dashboard.viewOverview') || `Vue d'ensemble du système de ${branding.systemName}`}
        icon={<LayoutDashboard className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
        compact
        showExperienceChips={false}
        showContextChips={false}
        actions={(
          <>
            <VerificacionesRecientes />
            <EntradaDonAchat />
          </>
        )}
      />

      <ModuleStatsGrid defaultLayout="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        <ModuleStatCard
          label={t('dashboard.totalInventory')}
          value={formatLargeNumber(stockTotal)}
          icon={<Package className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor={branding.primaryColor}
          compact
          showPriorityView={false}
          helper={<div className="badge-primary text-xs">{totalProductos} {t('dashboard.differentProducts')}</div>}
        />
        <ModuleStatCard
          label={t('dashboard.activeOrganisms')}
          value={organismosActivos}
          icon={<Building className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor={branding.secondaryColor}
          compact
          showPriorityView={false}
          helper={<div className="badge-secondary text-xs">{t('organisms.totalBeneficiaries')}: {stats.personasAtendidas}</div>}
        />
        <ModuleStatCard
          label={t('dashboard.activeOrders')}
          value={comandasPendientes}
          icon={<ClipboardList className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor="#FFC107"
          valueColor="#FFC107"
          compact
          showPriorityView={false}
          helper={<div className="badge-warning text-xs">{t('dashboard.inPreparationAndPending') || 'En preparación y pendientes'}</div>}
        />
        <ModuleStatCard
          label="Commandes acceptées"
          value={comandasAceptadas}
          icon={<ClipboardList className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor="#7E57C2"
          valueColor="#7E57C2"
          compact
          showPriorityView={false}
          helper={<div className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-[#7E57C2]">En attente de préparation</div>}
        />
        <ModuleStatCard
          label={t('inventory.stockAlert')}
          value={stats.stockBajo}
          icon={<AlertTriangle className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor="#DC3545"
          valueColor="#DC3545"
          compact
          showPriorityView={false}
          helper={<div className="badge-danger text-xs">{t('inventory.lowStock')}</div>}
        />
      </ModuleStatsGrid>

      <Tabs value={activeDashboardTab} onValueChange={(value) => setActiveDashboardTab(value as 'executive' | 'suivi' | 'prevision')} className="overflow-visible">
        <ModuleControlSurface>
          <ModuleControlSurfaceTabs>
            <TabsList className="app-compact-tabs-grid flex w-full max-w-5xl gap-1 overflow-x-auto bg-transparent p-0 sm:grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <TabsTrigger value="executive" className="app-compact-tab-trigger flex min-w-[8.25rem] items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] sm:min-w-0">
                <LayoutDashboard className="h-4 w-4" />
                Vue executive
              </TabsTrigger>
              <TabsTrigger value="suivi" className="app-compact-tab-trigger flex min-w-[8.25rem] items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] sm:min-w-0">
                <Clock className="h-4 w-4" />
                Suivi en temps réel
              </TabsTrigger>
              <TabsTrigger value="prevision" className="app-compact-tab-trigger flex min-w-[8.25rem] items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] sm:min-w-0">
                <Sparkles className="h-4 w-4" />
                Prévision & IA
              </TabsTrigger>
            </TabsList>
          </ModuleControlSurfaceTabs>

          <ModuleControlSurfaceBody className="space-y-6">
            <TabsContent value="executive" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_0.9fr]">
                <Card className={glassCardClassName}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Vue exécutive consolidée
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E73BE] text-white shadow-sm">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1E73BE]">Couverture organismes</p>
                            <p className="text-2xl font-bold text-[#0f172a]">{organismosActivos} / {totalOrganismos}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-[#516071]">{stats.personasAtendidas} bénéficiaires servis au total avec {organismesInactifs} organisme(s) inactif(s).</p>
                      </div>

                      <div className="rounded-2xl border border-[#dcfce7] bg-[#f0fdf4] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2d9561] text-white shadow-sm">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2d9561]">Valeur inventaire</p>
                            <p className="text-2xl font-bold text-[#0f172a]">{formatLargeNumber(stats.valorTotalInventario)} $</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-[#516071]">Valeur moyenne par produit: {formatLargeNumber(valeurMoyenneProduit)} $.</p>
                      </div>

                      <div className="rounded-2xl border border-[#fef3c7] bg-[#fffbeb] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC107] text-white shadow-sm">
                            <ClipboardList className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a16207]">Pipeline commandes</p>
                            <p className="text-2xl font-bold text-[#0f172a]">{comandasPendientes + comandasAceptadas}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-[#516071]">{comandasPendientes} à traiter immédiatement et {comandasAceptadas} acceptées à préparer.</p>
                      </div>

                      <div className="rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DC3545] text-white shadow-sm">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b91c1c]">Risque stock</p>
                            <p className="text-2xl font-bold text-[#0f172a]">{tauxRisqueStock}%</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-[#516071]">{stats.stockBajo} référence(s) sous seuil minimum sur {totalProductos} produit(s) actifs.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={glassCardClassName}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      📊 {t('dashboard.quickSummary')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-[#1E73BE]" />
                          <span className="text-sm font-medium">{t('dashboard.totalProducts')}</span>
                        </div>
                        <span className="text-xl font-bold text-[#1E73BE]">{stats.totalProductos}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-green-50 p-3">
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-[#4CAF50]" />
                          <span className="text-sm font-medium">{t('dashboard.activeOrganisms')}</span>
                        </div>
                        <span className="text-xl font-bold text-[#4CAF50]">{stats.organismosActivos}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-yellow-50 p-3">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="h-5 w-5 text-[#FFC107]" />
                          <span className="text-sm font-medium">{t('dashboard.pendingOrders')}</span>
                        </div>
                        <span className="text-xl font-bold text-[#FFC107]">{stats.comandasPendientes}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="h-5 w-5 text-[#7E57C2]" />
                          <span className="text-sm font-medium">Commandes acceptées</span>
                        </div>
                        <span className="text-xl font-bold text-[#7E57C2]">{stats.comandasAceptadas}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-red-50 p-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-[#DC3545]" />
                          <span className="text-sm font-medium">{t('dashboard.lowStock')}</span>
                        </div>
                        <span className="text-xl font-bold text-[#DC3545]">{stats.stockBajo}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="suivi" className="mt-0 space-y-6">
              <AlertaComandasUrgentes />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className={glassCardClassName}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      {t('dashboard.lowStockProducts')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {productosStockBajo.length === 0 ? (
                        <p className="py-4 text-center text-[#666666]">{t('dashboard.noLowStockProducts')}</p>
                      ) : (
                        productosStockBajo.map((producto) => (
                          <div key={producto.id} className="flex items-center justify-between rounded-xl bg-[#FFF3CD] p-3">
                            <div>
                              <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {producto.nombre}
                              </p>
                              <p className="text-sm text-[#666666]">{producto.categoria}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-[#DC3545]">
                                {producto.stockActual} {producto.unidad}
                              </p>
                              <p className="text-xs text-[#666666]">{t('dashboard.min')}: {producto.stockMinimo}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className={glassCardClassName}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      {t('dashboard.recentOrders')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comandasRecientes.map((comanda) => {
                        const organismo = organismosDisponibles.find(o => o.id === comanda.organismoId);
                        const estadoColor = {
                          pendiente: '#FFC107',
                          confirmada: '#7E57C2',
                          en_preparacion: '#1E73BE',
                          completada: '#4CAF50',
                          anulada: '#DC3545'
                        }[comanda.estado];

                        return (
                          <div key={comanda.id} className="flex items-center justify-between rounded-xl border border-white/70 bg-white p-3 shadow-sm">
                            <div className="flex-1">
                              <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {comanda.numero}
                              </p>
                              <p className="text-sm text-[#666666]">{organismo?.nombre}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#666666]" />
                              <span className="text-sm text-[#666666]">{comanda.fecha}</span>
                            </div>
                            <div
                              className="ml-3 rounded-full px-3 py-1 text-xs font-medium"
                              style={{ 
                                backgroundColor: `${estadoColor}20`, 
                                color: estadoColor,
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                            >
                              {comanda.estado === 'pendiente' ? t('orders.pending') :
                               comanda.estado === 'confirmada' ? 'Acceptée' :
                               comanda.estado === 'en_preparacion' ? t('orders.inPreparation') :
                               comanda.estado === 'completada' ? t('orders.completed') :
                               comanda.estado === 'anulada' ? t('orders.cancelled') :
                               comanda.estado}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="prevision" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <AlertasInteligentes />

                <Card className={glassCardClassName}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Prévision & IA opérationnelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1E73BE]">Projection stock 14 jours</p>
                        <p className="mt-2 text-2xl font-bold text-[#0f172a]">{formatLargeNumber(projectionStock14Jours)}</p>
                        <p className="mt-2 text-sm text-[#516071]">Basé sur un delta moyen quotidien de {variationNetteMoyenne >= 0 ? '+' : ''}{variationNetteMoyenne} unités.</p>
                      </div>
                      <div className="rounded-2xl border border-[#fef3c7] bg-[#fffbeb] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a16207]">Pression sortante moyenne</p>
                        <p className="mt-2 text-2xl font-bold text-[#0f172a]">{fluxSortantMoyen}</p>
                        <p className="mt-2 text-sm text-[#516071]">contre {fluxEntranteMoyen} unités entrantes par jour sur la dernière semaine.</p>
                      </div>
                      <div className="rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b91c1c]">Horizon de tension</p>
                        <p className="mt-2 text-2xl font-bold text-[#0f172a]">{joursAvantTension ? `${joursAvantTension} j` : 'Stable'}</p>
                        <p className="mt-2 text-sm text-[#516071]">Estimation automatique avant tension structurelle si le rythme actuel se maintient.</p>
                      </div>
                      <div className="rounded-2xl border border-[#e9d5ff] bg-[#faf5ff] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7E57C2]">Lecture IA recommandée</p>
                        <p className="mt-2 text-lg font-bold text-[#0f172a]">{stats.stockBajo > 0 ? 'Prioriser le réapprovisionnement ciblé' : 'Conserver la cadence actuelle'}</p>
                        <p className="mt-2 text-sm text-[#516071]">Le moteur suggère de surveiller les références sensibles et les commandes en attente pour éviter les ruptures.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className={glassCardClassName}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      {t('dashboard.inventoryMovements')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart key="bar-chart-movimientos" data={movimientosPorDia}>
                        <CartesianGrid key="grid-bar" strokeDasharray="3 3" />
                        <XAxis key="xaxis-bar" dataKey="dia" />
                        <YAxis key="yaxis-bar" />
                        <Tooltip key="tooltip-bar" />
                        <Bar key="entradas-bar" dataKey="entradas" fill="#4CAF50" name={t('common.incoming')} />
                        <Bar key="salidas-bar" dataKey="salidas" fill="#DC3545" name={t('common.outgoing')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className={glassCardClassName}>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                      {t('dashboard.stockTrend')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart key="line-chart-tendencia" data={movimientosPorDia}>
                        <CartesianGrid key="grid-line" strokeDasharray="3 3" />
                        <XAxis key="xaxis-line" dataKey="dia" />
                        <YAxis key="yaxis-line" />
                        <Tooltip key="tooltip-line" />
                        <Line key="stock-line" type="monotone" dataKey="stockTotal" stroke="#1E73BE" strokeWidth={2} name="Stock" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ModuleControlSurfaceBody>
        </ModuleControlSurface>
      </Tabs>
    </div>
  );
}



