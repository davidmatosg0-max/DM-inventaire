import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  ClipboardList, 
  Building, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Sparkles, 
  LayoutDashboard,
  Activity,
  Calendar,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { useBranding } from '../../../hooks/useBranding';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerComandas } from '../../utils/comandaStorage';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { obtenerRutas } from '../../utils/transporteLogic';
import { obtenerMovimientos, type MovimientoExtendido } from '../../utils/movimientoStorage';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';

function obtenerFechaValida(valor?: string): Date | null {
  if (!valor) {
    return null;
  }

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function obtenerFechaComanda(comanda: any): Date | null {
  return (
    obtenerFechaValida(comanda?.fechaEntrega) ||
    obtenerFechaValida(comanda?.fechaCreacion) ||
    obtenerFechaValida(comanda?.fecha)
  );
}

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

// Función para formatear números grandes
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Función para formatear moneda CAD
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: string;
  bgColor: string;
}

function KPICard({ title, value, subtitle, icon, trend, color, bgColor }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
      style={{ 
        background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}
        >
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="text-xs font-bold">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-[#666666] mb-2 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {title}
      </p>
      <div className="font-bold text-3xl mb-1" style={{ color, fontFamily: 'Montserrat, sans-serif' }}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-[#999999]">{subtitle}</p>
      )}
    </motion.div>
  );
}

export function DashboardMetricas() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [metrics, setMetrics] = useState({
    inventario: {
      totalProductos: 0,
      stockTotal: 0,
      stockBajo: 0,
      valorEstimado: 0,
      productosCriticos: [] as any[],
    },
    comandas: {
      activas: 0,
      pendientes: 0,
      completadasMes: 0,
      urgentes: 0,
      recientes: [] as any[],
    },
    organismos: {
      total: 0,
      activos: 0,
      beneficiariosTotales: 0,
      nuevosEsteMes: 0,
    },
    transporte: {
      rutasHoy: 0,
      rutasPendientes: 0,
      rutasCompletadas: 0,
      proximasEntregas: [] as any[],
    },
  });

  // Datos para gráficos
  const [chartData, setChartData] = useState({
    movimientosSemana: [] as any[],
    distribucionCategorias: [] as any[],
    tendenciaMensual: [] as any[],
    actividadReciente: [] as any[],
  });

  useEffect(() => {
    cargarMetricas();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarMetricas, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarMetricas = async () => {
    setRefreshing(true);
    try {
      // Cargar datos
      const productos = obtenerProductos();
      const comandas = obtenerComandas();
      const organismos = obtenerOrganismos();
      const rutas = obtenerRutas();
      const movimientos = obtenerMovimientos();

      // Calcular métricas de inventario
      const stockTotal = productos.reduce((sum, p) => sum + Number(p.stockActual || 0), 0);
      const stockBajo = productos.filter(p => p.stockMinimo && Number(p.stockActual || 0) <= p.stockMinimo * 1.2);
      const valorEstimado = productos.reduce((sum, p) => {
        if (typeof p.valorTotal === 'number' && p.valorTotal > 0) {
          return sum + p.valorTotal;
        }

        if (typeof p.valorUnitario === 'number' && p.valorUnitario > 0) {
          return sum + (p.valorUnitario * Number(p.stockActual || 0));
        }

        return sum;
      }, 0);

      // Calcular métricas de comandas
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const comandasActivas = comandas.filter(c => c.estado === 'pendiente' || c.estado === 'en_preparacion');
      const comandasUrgentes = comandasActivas.filter(c => {
        if (!c.fechaEntrega) return false;
        const fechaEntrega = new Date(c.fechaEntrega);
        return fechaEntrega <= hoy;
      });
      const comandasCompletadasMes = comandas.filter(c => {
        const fecha = obtenerFechaComanda(c);
        return fecha !== null && fecha >= inicioMes && (c.estado === 'completada' || c.estado === 'entregada');
      });

      // Calcular métricas de organismos
      const organismosActivos = organismos.filter(o => o.activo !== false);
      const beneficiariosTotales = organismos.reduce((sum, o) => sum + (o.beneficiarios || 0), 0);
      const organismosNuevosMes = organismos.filter(o => {
        if (!o.fechaRegistro) return false;
        const fecha = new Date(o.fechaRegistro);
        return fecha >= inicioMes;
      });

      // Calcular métricas de transporte
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const rutasHoy = rutas.filter(r => {
        const fecha = obtenerFechaValida(r.fechaEntrega || r.fecha);
        if (!fecha) return false;
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
      });
      
      const rutasPendientes = rutas.filter(r => r.estado === 'planificada' || r.estado === 'en_curso');
      const rutasCompletadas = rutas.filter(r => r.estado === 'completada');

      // Datos para gráficos
      const movimientosSemana = calcularMovimientosSemana(movimientos);
      const distribucionCategorias = calcularDistribucionCategorias(productos);
      const tendenciaMensual = calcularTendenciaMensual(comandas);
      const actividadReciente = calcularActividadReciente(comandas, movimientos);

      setMetrics({
        inventario: {
          totalProductos: productos.length,
          stockTotal,
          stockBajo: stockBajo.length,
          valorEstimado,
          productosCriticos: stockBajo.slice(0, 5),
        },
        comandas: {
          activas: comandasActivas.length,
          pendientes: comandasActivas.filter(c => c.estado === 'pendiente').length,
          completadasMes: comandasCompletadasMes.length,
          urgentes: comandasUrgentes.length,
          recientes: comandas.slice(0, 5),
        },
        organismos: {
          total: organismos.length,
          activos: organismosActivos.length,
          beneficiariosTotales,
          nuevosEsteMes: organismosNuevosMes.length,
        },
        transporte: {
          rutasHoy: rutasHoy.length,
          rutasPendientes: rutasPendientes.length,
          rutasCompletadas: rutasCompletadas.length,
          proximasEntregas: [...rutasHoy].sort((a, b) => {
            const fechaA = obtenerFechaValida(a.fechaEntrega || a.fecha)?.getTime() || 0;
            const fechaB = obtenerFechaValida(b.fechaEntrega || b.fecha)?.getTime() || 0;
            return fechaA - fechaB;
          }).slice(0, 5),
        },
      });

      setChartData({
        movimientosSemana,
        distribucionCategorias,
        tendenciaMensual,
        actividadReciente,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Funciones auxiliares para calcular datos de gráficos
  const calcularMovimientosSemana = (movimientos: MovimientoExtendido[]) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const dias = Array.from({ length: 7 }, (_, index) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - (6 - index));

      return {
        id: `movimiento-${index}`,
        fechaClave: fecha.toISOString().slice(0, 10),
        dia: fecha.toLocaleDateString('fr-CA', { weekday: 'short' }),
        entradas: 0,
        salidas: 0,
      };
    });

    const diaPorFecha = new Map(dias.map((dia) => [dia.fechaClave, dia]));

    movimientos.forEach((movimiento) => {
      const fecha = obtenerFechaValida(movimiento.fecha);
      if (!fecha) {
        return;
      }

      const dia = diaPorFecha.get(fecha.toISOString().slice(0, 10));
      if (!dia) {
        return;
      }

      const delta = obtenerDeltaMovimiento(movimiento);
      if (delta >= 0) {
        dia.entradas += delta;
      } else {
        dia.salidas += Math.abs(delta);
      }
    });

    return dias.map(({ fechaClave, ...dia }) => ({
      ...dia,
      entradas: Math.round(dia.entradas),
      salidas: Math.round(dia.salidas),
    }));
  };

  const calcularDistribucionCategorias = (productos: any[]) => {
    const categorias: { [key: string]: number } = {};
    productos.forEach(p => {
      const cat = p.categoria || 'Sin categoría';
      categorias[cat] = (categorias[cat] || 0) + Number(p.stockActual || 0);
    });

    return Object.entries(categorias).map(([nombre, cantidad], index) => ({
      id: `categoria-${index}`,
      nombre,
      cantidad,
    })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 6);
  };

  const calcularTendenciaMensual = (comandas: any[]) => {
    const hoy = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const fechaMes = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - index), 1);
      const inicioMes = new Date(fechaMes.getFullYear(), fechaMes.getMonth(), 1);
      const finMes = new Date(fechaMes.getFullYear(), fechaMes.getMonth() + 1, 0, 23, 59, 59, 999);

      const comandasMes = comandas.filter((comanda) => {
        const fecha = obtenerFechaComanda(comanda);
        return fecha !== null && fecha >= inicioMes && fecha <= finMes;
      });

      const completadasMes = comandasMes.filter((comanda) => comanda.estado === 'completada' || comanda.estado === 'entregada');

      return {
        id: `mes-${index}`,
        mes: fechaMes.toLocaleDateString('fr-CA', { month: 'short' }),
        comandas: comandasMes.length,
        completadas: completadasMes.length,
      };
    });
  };

  const calcularActividadReciente = (comandas: any[], movimientos: MovimientoExtendido[]) => {
    const ultimos7Dias = [];
    const hoy = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);

      const actividadComandas = comandas.filter((comanda) => {
        const fechaComanda = obtenerFechaComanda(comanda);
        return fechaComanda !== null && fechaComanda >= fecha && fechaComanda <= finDia;
      }).length;

      const actividadMovimientos = movimientos.filter((movimiento) => {
        const fechaMovimiento = obtenerFechaValida(movimiento.fecha);
        return fechaMovimiento !== null && fechaMovimiento >= fecha && fechaMovimiento <= finDia;
      }).length;

      ultimos7Dias.push({
        id: `actividad-${i}`,
        fecha: fecha.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        actividad: actividadComandas + actividadMovimientos,
      });
    }
    
    return ultimos7Dias;
  };

  const COLORS = ['#1a4d7a', '#2d9561', '#FFC107', '#DC3545', '#9C27B0', '#FF9800'];

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in">
      {/* Header professionnel unifié */}
      <ModulePageHeader
        title={`${t('dashboard.title')} — Métriques en Temps Réel`}
        subtitle={`${t('dashboard.lastUpdated')} : ${lastUpdate.toLocaleTimeString('fr-FR')}`}
        icon={<LayoutDashboard className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
        compact
        showExperienceChips={false}
        showContextChips={false}
        actions={(
          <Button
            onClick={cargarMetricas}
            disabled={refreshing}
            className="h-10 rounded-2xl px-4 text-white"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
              boxShadow: `0 10px 24px -18px ${branding.primaryColor}`,
            }}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        )}
      />

      {/* KPIs Principales — grille responsive normalisée */}
      <ModuleStatsGrid defaultLayout="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <ModuleStatCard
          label={t('dashboard.totalInventory')}
          value={formatNumber(metrics.inventario.stockTotal)}
          icon={<Package className="h-5 w-5 text-white" />}
          accentColor="#1a4d7a"
          compact
          showPriorityView={false}
          helper={`${metrics.inventario.totalProductos} produits`}
        />
        <ModuleStatCard
          label="Organismes Actifs"
          value={metrics.organismos.activos}
          icon={<Building className="h-5 w-5 text-white" />}
          accentColor="#2d9561"
          compact
          showPriorityView={false}
          helper={`${metrics.organismos.beneficiariosTotales} bénéficiaires`}
        />
        <ModuleStatCard
          label="Commandes Actives"
          value={metrics.comandas.activas}
          icon={<ClipboardList className="h-5 w-5 text-white" />}
          accentColor="#FFC107"
          valueColor="#FFC107"
          compact
          showPriorityView={false}
          helper={`${metrics.comandas.urgentes} urgentes`}
        />
        <ModuleStatCard
          label="Valeur Estimée"
          value={formatCurrency(metrics.inventario.valorEstimado)}
          icon={<DollarSign className="h-5 w-5 text-white" />}
          accentColor="#9C27B0"
          valueColor="#9C27B0"
          compact
          showPriorityView={false}
          helper="Inventaire total"
        />
      </ModuleStatsGrid>

      {/* Alertas y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Crítico */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #DC354515 0%, #DC354505 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#DC3545' }}>
              <AlertTriangle className="w-5 h-5" />
              Stock Critique
            </h3>
            <Badge variant="destructive">{metrics.inventario.stockBajo}</Badge>
          </div>
          <div className="space-y-3">
            {metrics.inventario.productosCriticos.length > 0 ? (
              metrics.inventario.productosCriticos.map((producto: any, index: number) => (
                <div key={index} className="p-3 bg-white/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-[#333333]">{producto.nombre}</p>
                    <Badge variant="outline" className="text-xs">{producto.stockActual}</Badge>
                  </div>
                  <Progress value={Math.min(100, (Number(producto.stockActual || 0) / Math.max(producto.stockMinimo || 1, 1)) * 100)} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-[#666666] text-center py-4">
                ✅ Aucun produit en stock critique
              </p>
            )}
          </div>
        </motion.div>

        {/* Livraisons Aujourd'hui */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #2d956115 0%, #2d956105 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#2d9561' }}>
              <Truck className="w-5 h-5" />
              Livraisons Aujourd'hui
            </h3>
            <Badge style={{ backgroundColor: '#2d9561' }} className="text-white">{metrics.transporte.rutasHoy}</Badge>
          </div>
          <div className="space-y-3">
            {metrics.transporte.proximasEntregas.length > 0 ? (
              metrics.transporte.proximasEntregas.map((ruta: any, index: number) => (
                <div key={index} className="p-3 bg-white/50 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">Ruta #{ruta.numero}</p>
                    <p className="text-xs text-[#666666]">{ruta.destino}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#666666] text-center py-4">
                📦 Aucune livraison programmée aujourd'hui
              </p>
            )}
          </div>
        </motion.div>

        {/* Activité Récente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #1a4d7a15 0%, #1a4d7a05 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a4d7a' }}>
              <Activity className="w-5 h-5" />
              Activité (7 jours)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData.actividadReciente} id="chart-actividad">
              <defs>
                <linearGradient id="colorActividad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a4d7a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1a4d7a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc30" />
              <XAxis dataKey="fecha" stroke="#666666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666666" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Area key="area-actividad" type="monotone" dataKey="actividad" stroke="#1a4d7a" fillOpacity={1} fill="url(#colorActividad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movimientos Semanales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl bg-white/50"
        >
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}>
            📊 Mouvements Hebdomadaires
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.movimientosSemana} id="chart-movimientos">
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc30" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar key="bar-entradas" dataKey="entradas" fill="#2d9561" name="Entrées" radius={[8, 8, 0, 0]} />
              <Bar key="bar-salidas" dataKey="salidas" fill="#DC3545" name="Sorties" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribución por Categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl bg-white/50"
        >
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}>
            🥫 Distribution par Catégories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.distribucionCategorias}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, percent }: any) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
                nameKey="nombre"
              >
                {chartData.distribucionCategorias.map((entry, index) => (
                  <Cell key={`cell-cat-${entry.id || index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tendencia Mensual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl bg-white/50 lg:col-span-2"
        >
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}>
            📈 Tendance Mensuelle des Commandes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.tendenciaMensual} id="chart-tendencias">
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc30" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                key="line-comandas"
                type="monotone" 
                dataKey="comandas" 
                stroke="#FFC107" 
                strokeWidth={3} 
                name="Commandes Totales"
                dot={{ fill: '#FFC107', r: 6 }}
              />
              <Line 
                key="line-completadas"
                type="monotone" 
                dataKey="completadas" 
                stroke="#2d9561" 
                strokeWidth={3} 
                name="Commandes Complétées"
                dot={{ fill: '#2d9561', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}