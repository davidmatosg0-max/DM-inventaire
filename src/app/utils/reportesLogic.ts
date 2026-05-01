/**
 * Lógica de negocio para el módulo de Reportes
 * Genera reportes estadísticos y analíticos del sistema
 */

import { obtenerProductos } from './productStorage';
import { obtenerCategorias } from './categoriaStorage';
import { obtenerComandas } from './comandasLogic';
import { obtenerOrganismos, obtenerEstadisticasOrganismos } from './organismosLogic';
import { obtenerRutas, obtenerVehiculos, obtenerEstadisticasTransporte } from './transporteLogic';
import { obtenerEntradas } from './entradaInventarioStorage';

// ==================== TIPOS DE REPORTES ====================

export interface ReporteInventario {
  totalProductos: number;
  totalStock: number;
  valorTotalInventario: number;
  stockBajo: number;
  productosVencidos: number;
  productosProximosVencer: number;
  porCategoria: {
    categoria: string;
    cantidad: number;
    stock: number;
    valor: number;
  }[];
  topProductos: {
    nombre: string;
    stock: number;
    valor: number;
  }[];
}

export interface ReporteComandas {
  totalComandas: number;
  comandasPendientes: number;
  comandasPreparadas: number;
  comandasEntregadas: number;
  comandasCanceladas: number;
  valorTotalDistribuido: number;
  pesoTotalDistribuido: number;
  organismosAtendidos: number;
  comandasPorMes: {
    mes: string;
    cantidad: number;
    valor: number;
  }[];
  comandasPorOrganismo: {
    organismo: string;
    cantidad: number;
    valor: number;
  }[];
}

export interface ReporteOrganismos {
  totalOrganismos: number;
  organismosActivos: number;
  organismosRegulares: number;
  totalPersonasAtendidas: number;
  porTipo: Record<string, number>;
  porFrecuencia: Record<string, number>;
  porTipoAsistencia: Record<string, number>;
  porCiudad: Record<string, number>;
}

export interface ReporteTransporte {
  totalVehiculos: number;
  vehiculosActivos: number;
  totalRutas: number;
  rutasCompletadas: number;
  kmTotales: number;
  paradasRealizadas: number;
  eficienciaEntrega: number; // Porcentaje de entregas exitosas
  rutasPorMes: {
    mes: string;
    cantidad: number;
    km: number;
  }[];
}

export interface ReporteGeneral {
  inventario: ReporteInventario;
  comandas: ReporteComandas;
  organismos: ReporteOrganismos;
  transporte: ReporteTransporte;
  periodo: {
    inicio: string;
    fin: string;
  };
  generadoEn: string;
}

// ==================== GENERADORES DE REPORTES ====================

export function generarReporteInventario(
  fechaInicio?: string,
  fechaFin?: string
): ReporteInventario {
  const productos = obtenerProductos();
  const categorias = obtenerCategorias();
  const hoy = new Date();
  const en30Dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Calcular totales
  let totalStock = 0;
  let valorTotalInventario = 0;
  let stockBajo = 0;
  let productosVencidos = 0;
  let productosProximosVencer = 0;

  const productosPorCategoria: Record<string, { cantidad: number; stock: number; valor: number }> = {};
  const topProductosArray: Array<{ nombre: string; stock: number; valor: number }> = [];

  productos.forEach(producto => {
    if (!producto.activo) return;

    totalStock += producto.stockActual;

    // Obtener valor monetario de la categoría
    const categoria = categorias.find(c => c.nombre === producto.categoria);
    const valorPorKg = categoria?.valorMonetario || 0;
    const valorProducto = producto.stockActual * valorPorKg;
    valorTotalInventario += valorProducto;

    // Stock bajo
    if (producto.stockActual <= producto.stockMinimo) {
      stockBajo++;
    }

    // Productos vencidos y próximos a vencer
    if (producto.fechaVencimiento) {
      const fechaVenc = new Date(producto.fechaVencimiento);
      if (fechaVenc < hoy) {
        productosVencidos++;
      } else if (fechaVenc <= en30Dias) {
        productosProximosVencer++;
      }
    }

    // Agrupar por categoría
    if (!productosPorCategoria[producto.categoria]) {
      productosPorCategoria[producto.categoria] = { cantidad: 0, stock: 0, valor: 0 };
    }
    productosPorCategoria[producto.categoria].cantidad++;
    productosPorCategoria[producto.categoria].stock += producto.stockActual;
    productosPorCategoria[producto.categoria].valor += valorProducto;

    // Top productos
    topProductosArray.push({
      nombre: producto.nombre,
      stock: producto.stockActual,
      valor: valorProducto,
    });
  });

  // Convertir objeto a array y ordenar
  const porCategoria = Object.entries(productosPorCategoria).map(([categoria, datos]) => ({
    categoria,
    ...datos,
  }));

  // Ordenar top productos por valor
  const topProductos = topProductosArray
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  return {
    totalProductos: productos.filter(p => p.activo).length,
    totalStock: Math.round(totalStock),
    valorTotalInventario: Math.round(valorTotalInventario * 100) / 100,
    stockBajo,
    productosVencidos,
    productosProximosVencer,
    porCategoria,
    topProductos,
  };
}

export function generarReporteComandas(
  fechaInicio?: string,
  fechaFin?: string
): ReporteComandas {
  let comandas = obtenerComandas();

  // Filtrar por fecha si se proporciona
  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    comandas = comandas.filter(c => {
      const fecha = new Date(c.fecha);
      return fecha >= inicio && fecha <= fin;
    });
  }

  // Calcular totales
  const totalComandas = comandas.length;
  const comandasPendientes = comandas.filter(c => c.estado === 'pendiente').length;
  const comandasPreparadas = comandas.filter(c => c.estado === 'preparada').length;
  const comandasEntregadas = comandas.filter(c => c.estado === 'entregada').length;
  const comandasCanceladas = comandas.filter(c => c.estado === 'cancelada').length;

  const valorTotalDistribuido = comandas
    .filter(c => c.estado !== 'cancelada')
    .reduce((sum, c) => sum + c.totalValorMonetario, 0);

  const pesoTotalDistribuido = comandas
    .filter(c => c.estado !== 'cancelada')
    .reduce((sum, c) => sum + c.totalPeso, 0);

  const organismosUnicos = new Set(comandas.map(c => c.organismoId));
  const organismosAtendidos = organismosUnicos.size;

  // Comandas por mes
  const comandasPorMesMap: Record<string, { cantidad: number; valor: number }> = {};
  comandas.forEach(c => {
    const fecha = new Date(c.fecha);
    const mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!comandasPorMesMap[mes]) {
      comandasPorMesMap[mes] = { cantidad: 0, valor: 0 };
    }
    comandasPorMesMap[mes].cantidad++;
    if (c.estado !== 'cancelada') {
      comandasPorMesMap[mes].valor += c.totalValorMonetario;
    }
  });

  const comandasPorMes = Object.entries(comandasPorMesMap).map(([mes, datos]) => ({
    mes,
    ...datos,
  }));

  // Comandas por organismo
  const comandasPorOrganismoMap: Record<string, { cantidad: number; valor: number }> = {};
  comandas.forEach(c => {
    if (!comandasPorOrganismoMap[c.organismoNombre]) {
      comandasPorOrganismoMap[c.organismoNombre] = { cantidad: 0, valor: 0 };
    }
    comandasPorOrganismoMap[c.organismoNombre].cantidad++;
    if (c.estado !== 'cancelada') {
      comandasPorOrganismoMap[c.organismoNombre].valor += c.totalValorMonetario;
    }
  });

  const comandasPorOrganismo = Object.entries(comandasPorOrganismoMap)
    .map(([organismo, datos]) => ({
      organismo,
      ...datos,
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  return {
    totalComandas,
    comandasPendientes,
    comandasPreparadas,
    comandasEntregadas,
    comandasCanceladas,
    valorTotalDistribuido: Math.round(valorTotalDistribuido * 100) / 100,
    pesoTotalDistribuido: Math.round(pesoTotalDistribuido * 100) / 100,
    organismosAtendidos,
    comandasPorMes,
    comandasPorOrganismo,
  };
}

export function generarReporteOrganismos(): ReporteOrganismos {
  const stats = obtenerEstadisticasOrganismos();
  
  return {
    totalOrganismos: stats.total,
    organismosActivos: stats.activos,
    organismosRegulares: stats.regulares,
    totalPersonasAtendidas: stats.totalPersonasAtendidas,
    porTipo: stats.porTipo,
    porFrecuencia: stats.porFrecuencia,
    porTipoAsistencia: stats.porTipoAsistencia,
    porCiudad: stats.porCiudad,
  };
}

export function generarReporteTransporte(
  fechaInicio?: string,
  fechaFin?: string
): ReporteTransporte {
  const stats = obtenerEstadisticasTransporte();
  let rutas = obtenerRutas();

  // Filtrar por fecha si se proporciona
  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    rutas = rutas.filter(r => {
      const fecha = new Date(r.fecha);
      return fecha >= inicio && fecha <= fin;
    });
  }

  // Calcular paradas realizadas y eficiencia
  let paradasTotales = 0;
  let paradasEntregadas = 0;

  rutas.forEach(r => {
    paradasTotales += r.paradas.length;
    paradasEntregadas += r.paradas.filter(p => p.estado === 'entregado').length;
  });

  const eficienciaEntrega = paradasTotales > 0 
    ? Math.round((paradasEntregadas / paradasTotales) * 100) 
    : 0;

  // Rutas por mes
  const rutasPorMesMap: Record<string, { cantidad: number; km: number }> = {};
  rutas.forEach(r => {
    const fecha = new Date(r.fecha);
    const mes = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!rutasPorMesMap[mes]) {
      rutasPorMesMap[mes] = { cantidad: 0, km: 0 };
    }
    rutasPorMesMap[mes].cantidad++;
    if (r.kmFin && r.kmInicio) {
      rutasPorMesMap[mes].km += (r.kmFin - r.kmInicio);
    }
  });

  const rutasPorMes = Object.entries(rutasPorMesMap).map(([mes, datos]) => ({
    mes,
    ...datos,
  }));

  return {
    totalVehiculos: stats.totalVehiculos,
    vehiculosActivos: stats.vehiculosDisponibles + stats.vehiculosEnRuta,
    totalRutas: rutas.length,
    rutasCompletadas: rutas.filter(r => r.estado === 'completada').length,
    kmTotales: stats.kmTotales,
    paradasRealizadas: paradasEntregadas,
    eficienciaEntrega,
    rutasPorMes,
  };
}

export function generarReporteGeneral(
  fechaInicio?: string,
  fechaFin?: string
): ReporteGeneral {
  return {
    inventario: generarReporteInventario(fechaInicio, fechaFin),
    comandas: generarReporteComandas(fechaInicio, fechaFin),
    organismos: generarReporteOrganismos(),
    transporte: generarReporteTransporte(fechaInicio, fechaFin),
    periodo: {
      inicio: fechaInicio || 'Inicio de registros',
      fin: fechaFin || 'Hoy',
    },
    generadoEn: new Date().toISOString(),
  };
}

// ==================== EXPORTACIÓN ====================

export function exportarReporteJSON(reporte: any): string {
  return JSON.stringify(reporte, null, 2);
}

export function exportarReporteCSV(reporte: ReporteGeneral): string {
  const lineas: string[] = [];
  
  // Header
  lineas.push('REPORTE GENERAL - BANCO DE ALIMENTOS');
  lineas.push(`Periodo: ${reporte.periodo.inicio} - ${reporte.periodo.fin}`);
  lineas.push(`Generado: ${new Date(reporte.generadoEn).toLocaleString()}`);
  lineas.push('');

  // Inventario
  lineas.push('=== INVENTARIO ===');
  lineas.push(`Total Productos,${reporte.inventario.totalProductos}`);
  lineas.push(`Total Stock,${reporte.inventario.totalStock}`);
  lineas.push(`Valor Total,${reporte.inventario.valorTotalInventario}`);
  lineas.push(`Stock Bajo,${reporte.inventario.stockBajo}`);
  lineas.push(`Productos Vencidos,${reporte.inventario.productosVencidos}`);
  lineas.push('');

  // Comandas
  lineas.push('=== COMANDAS ===');
  lineas.push(`Total Comandas,${reporte.comandas.totalComandas}`);
  lineas.push(`Pendientes,${reporte.comandas.comandasPendientes}`);
  lineas.push(`Preparadas,${reporte.comandas.comandasPreparadas}`);
  lineas.push(`Entregadas,${reporte.comandas.comandasEntregadas}`);
  lineas.push(`Canceladas,${reporte.comandas.comandasCanceladas}`);
  lineas.push(`Valor Total Distribuido,${reporte.comandas.valorTotalDistribuido}`);
  lineas.push('');

  // Organismos
  lineas.push('=== ORGANISMOS ===');
  lineas.push(`Total Organismos,${reporte.organismos.totalOrganismos}`);
  lineas.push(`Organismos Activos,${reporte.organismos.organismosActivos}`);
  lineas.push(`Organismos Regulares,${reporte.organismos.organismosRegulares}`);
  lineas.push(`Total Personas Atendidas,${reporte.organismos.totalPersonasAtendidas}`);
  lineas.push('');

  // Transporte
  lineas.push('=== TRANSPORTE ===');
  lineas.push(`Total Vehículos,${reporte.transporte.totalVehiculos}`);
  lineas.push(`Total Rutas,${reporte.transporte.totalRutas}`);
  lineas.push(`Rutas Completadas,${reporte.transporte.rutasCompletadas}`);
  lineas.push(`Km Totales,${reporte.transporte.kmTotales}`);
  lineas.push(`Eficiencia Entrega,${reporte.transporte.eficienciaEntrega}%`);

  return lineas.join('\n');
}

// ==================== GRÁFICOS ====================

export function obtenerDatosGraficoInventarioPorCategoria() {
  const reporte = generarReporteInventario();
  return reporte.porCategoria.map(c => ({
    name: c.categoria,
    value: c.stock,
    valor: c.valor,
  }));
}

export function obtenerDatosGraficoComandasPorMes(meses: number = 6) {
  const comandas = obtenerComandas();
  const hoy = new Date();
  const datos: Array<{ mes: string; cantidad: number; valor: number }> = [];

  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mesStr = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
    const mesInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const mesFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

    const comandasMes = comandas.filter(c => {
      const fechaComanda = new Date(c.fecha);
      return fechaComanda >= mesInicio && fechaComanda <= mesFin;
    });

    const valorMes = comandasMes
      .filter(c => c.estado !== 'cancelada')
      .reduce((sum, c) => sum + c.totalValorMonetario, 0);

    datos.push({
      mes: mesStr,
      cantidad: comandasMes.length,
      valor: Math.round(valorMes),
    });
  }

  return datos;
}

export function obtenerDatosGraficoOrganismosPorTipo() {
  const reporte = generarReporteOrganismos();
  return Object.entries(reporte.porTipo).map(([tipo, cantidad]) => ({
    name: tipo,
    value: cantidad,
  }));
}

export function obtenerDatosGraficoDistribucionFrecuencia() {
  const reporte = generarReporteOrganismos();
  return Object.entries(reporte.porFrecuencia).map(([frecuencia, cantidad]) => ({
    name: frecuencia,
    value: cantidad,
  }));
}

// ==================== ALERTAS Y NOTIFICACIONES ====================

export function obtenerAlertasInventario() {
  const reporte = generarReporteInventario();
  const alertas: Array<{ tipo: 'warning' | 'error' | 'info'; mensaje: string }> = [];

  if (reporte.stockBajo > 0) {
    alertas.push({
      tipo: 'warning',
      mensaje: `${reporte.stockBajo} productos con stock bajo`,
    });
  }

  if (reporte.productosVencidos > 0) {
    alertas.push({
      tipo: 'error',
      mensaje: `${reporte.productosVencidos} productos vencidos`,
    });
  }

  if (reporte.productosProximosVencer > 0) {
    alertas.push({
      tipo: 'warning',
      mensaje: `${reporte.productosProximosVencer} productos próximos a vencer (30 días)`,
    });
  }

  return alertas;
}
