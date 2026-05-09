import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ClipboardList, Building, TrendingUp, Clock, Users, DollarSign, AlertTriangle, Sparkles, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertaComandasUrgentes } from '../AlertaComandasUrgentes';
import { obtenerComandas } from '../../utils/comandaStorage';
import { EntradaDonAchat } from '../EntradaDonAchat';
import { VerificacionesRecientes } from '../VerificacionesRecientes';
import { AlertasInteligentes } from '../inventario/AlertasInteligentes';
import { useBranding } from '../../../hooks/useBranding';
import { formatLargeNumber } from '../../utils/formatUtils';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { obtenerMovimientos, type MovimientoExtendido } from '../../utils/movimientoStorage';
import { 
  obtenerProductosActivos, 
  type ProductoCreado 
} from '../../utils/productStorage';
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

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [activeDashboardTab]);

  const cargarDatos = () => {
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
  };

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <ModulePageHeader
        title={`${t('dashboard.title')} - Entrepôt`}
        subtitle={t('dashboard.viewOverview') || 'Vue d\'ensemble du système de la Banque Alimentaire'}
        icon={<LayoutDashboard className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
        actions={(
          <>
            <VerificacionesRecientes />
            <EntradaDonAchat />
          </>
        )}
      />

      <ModuleStatsGrid defaultLayout="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        <ModuleStatCard
          label={t('dashboard.totalInventory')}
          value={formatLargeNumber(stockTotal)}
          icon={<Package className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor={branding.primaryColor}
          helper={<div className="badge-primary text-xs">{totalProductos} {t('dashboard.differentProducts')}</div>}
        />
        <ModuleStatCard
          label={t('dashboard.activeOrganisms')}
          value={organismosActivos}
          icon={<Building className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor={branding.secondaryColor}
          helper={<div className="badge-secondary text-xs">{t('organisms.totalBeneficiaries')}: {stats.personasAtendidas}</div>}
        />
        <ModuleStatCard
          label={t('dashboard.activeOrders')}
          value={comandasPendientes}
          icon={<ClipboardList className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor="#FFC107"
          valueColor="#FFC107"
          helper={<div className="badge-warning text-xs">{t('dashboard.inPreparationAndPending') || 'En preparación y pendientes'}</div>}
        />
        <ModuleStatCard
          label="Commandes acceptées"
          value={comandasAceptadas}
          icon={<ClipboardList className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor="#7E57C2"
          valueColor="#7E57C2"
          helper={<div className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-[#7E57C2]">En attente de préparation</div>}
        />
        <ModuleStatCard
          label={t('inventory.stockAlert')}
          value={stats.stockBajo}
          icon={<AlertTriangle className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor="#DC3545"
          valueColor="#DC3545"
          helper={<div className="badge-danger text-xs">{t('inventory.lowStock')}</div>}
        />
      </ModuleStatsGrid>

      <Tabs value={activeDashboardTab} onValueChange={(value) => setActiveDashboardTab(value as 'executive' | 'suivi' | 'prevision')} className="overflow-visible">
        <ModuleControlSurface>
          <ModuleControlSurfaceTabs>
            <TabsList className="app-compact-tabs-grid w-full max-w-5xl gap-1 bg-transparent p-0" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <TabsTrigger value="executive" className="app-compact-tab-trigger flex items-center gap-2 min-h-8 px-2 py-1.5 text-[11px]">
                <LayoutDashboard className="h-4 w-4" />
                Vue executive
              </TabsTrigger>
              <TabsTrigger value="suivi" className="app-compact-tab-trigger flex items-center gap-2 min-h-8 px-2 py-1.5 text-[11px]">
                <Clock className="h-4 w-4" />
                Suivi en temps réel
              </TabsTrigger>
              <TabsTrigger value="prevision" className="app-compact-tab-trigger flex items-center gap-2 min-h-8 px-2 py-1.5 text-[11px]">
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