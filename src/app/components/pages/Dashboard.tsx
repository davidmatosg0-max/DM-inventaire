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
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { obtenerMovimientos, type MovimientoExtendido } from '../../utils/movimientoStorage';
import { 
  obtenerProductosActivos, 
  type ProductoCreado 
} from '../../utils/productStorage';
import type { Comanda } from '../../types';

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

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

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

  return (
    <div className="min-h-screen relative">
      {/* Fondo degradado fijo con glassmorphism */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 50%, ${branding.primaryColor}08 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: `radial-gradient(circle, ${branding.secondaryColor} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${branding.primaryColor} 0%, transparent 70%)`,
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 sm:gap-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}>
                <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="truncate">{t('dashboard.title')} - Entrepôt</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] mt-1">{t('dashboard.viewOverview') || 'Vue d\'ensemble du système de la Banque Alimentaire'}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <VerificacionesRecientes />
              <EntradaDonAchat />
            </div>
          </div>
        </div>

        {/* Stats Cards - Modernizadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Inventario */}
          <div className="card-glass rounded-xl sm:rounded-2xl p-4 sm:p-5 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: '#1a4d7a' }}>
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1a4d7a 0%, #16426a 100%)' }}
              >
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <p className="text-xs sm:text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              {t('dashboard.totalInventory')}
            </p>
            <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#1a4d7a', fontFamily: 'Montserrat, sans-serif' }}>
              {formatLargeNumber(stockTotal)}
            </div>
            <div className="badge-primary text-xs">
              {totalProductos} {t('dashboard.differentProducts')}
            </div>
          </div>

          {/* Card 2: Organismos */}
          <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4" style={{ borderLeftColor: '#2d9561' }}>
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2d9561 0%, #268650 100%)' }}
              >
                <Building className="w-6 h-6 text-white" />
              </div>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              {t('dashboard.activeOrganisms')}
            </p>
            <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#2d9561', fontFamily: 'Montserrat, sans-serif' }}>
              {organismosActivos}
            </div>
            <div className="badge-secondary text-xs">
              {t('organisms.totalBeneficiaries')}: {stats.personasAtendidas}
            </div>
          </div>

          {/* Card 3: Comandas */}
          <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4 border-l-[#FFC107]">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)' }}
              >
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              {t('dashboard.activeOrders')}
            </p>
            <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#FFC107', fontFamily: 'Montserrat, sans-serif' }}>
              {comandasPendientes}
            </div>
            <div className="badge-warning text-xs">
              {t('dashboard.inPreparationAndPending') || 'En preparación y pendientes'}
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4 border-l-[#7E57C2]">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #7E57C2 0%, #6A4BB8 100%)' }}
              >
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-[#7E57C2]" />
            </div>
            <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              Commandes acceptées
            </p>
            <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#7E57C2', fontFamily: 'Montserrat, sans-serif' }}>
              {comandasAceptadas}
            </div>
            <div className="text-xs font-medium text-[#7E57C2] bg-purple-50 rounded-full px-3 py-1 inline-flex">
              En attente de préparation
            </div>
          </div>

          {/* Card 4: Stock Bajo */}
          <div className="card-glass rounded-2xl p-5 hover-lift cursor-pointer border-l-4 border-l-[#DC3545]">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #DC3545 0%, #C82333 100%)' }}
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
            </div>
            <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              {t('inventory.stockAlert')}
            </p>
            <div className="font-bold mb-1" style={{ fontSize: '2rem', color: '#DC3545', fontFamily: 'Montserrat, sans-serif' }}>
              {stats.stockBajo}
            </div>
            <div className="badge-danger text-xs">
              {t('inventory.lowStock')}
            </div>
          </div>
        </div>

        {/* Alerta de Comandas Urgentes */}
        <AlertaComandasUrgentes />

        {/* Alertas Inteligentes - NUEVO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <AlertasInteligentes />
          
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                📊 {t('dashboard.quickSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-[#1E73BE]" />
                    <span className="text-sm font-medium">{t('dashboard.totalProducts')}</span>
                  </div>
                  <span className="text-xl font-bold text-[#1E73BE]">{stats.totalProductos}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-[#4CAF50]" />
                    <span className="text-sm font-medium">{t('dashboard.activeOrganisms')}</span>
                  </div>
                  <span className="text-xl font-bold text-[#4CAF50]">{stats.organismosActivos}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-[#FFC107]" />
                    <span className="text-sm font-medium">{t('dashboard.pendingOrders')}</span>
                  </div>
                  <span className="text-xl font-bold text-[#FFC107]">{stats.comandasPendientes}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-[#7E57C2]" />
                    <span className="text-sm font-medium">Commandes acceptées</span>
                  </div>
                  <span className="text-xl font-bold text-[#7E57C2]">{stats.comandasAceptadas}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
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

          <Card>
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

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Productos con stock bajo */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {t('dashboard.lowStockProducts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productosStockBajo.length === 0 ? (
                  <p className="text-center text-[#666666] py-4">{t('dashboard.noLowStockProducts')}</p>
                ) : (
                  productosStockBajo.map((producto) => (
                    <div key={producto.id} className="flex items-center justify-between p-3 bg-[#FFF3CD] rounded-lg">
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

          {/* Comandas recientes */}
          <Card>
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
                    <div key={comanda.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {comanda.numero}
                        </p>
                        <p className="text-sm text-[#666666]">{organismo?.nombre}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#666666]" />
                        <span className="text-sm text-[#666666]">{comanda.fecha}</span>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium ml-3"
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
      </div>
    </div>
  );
}