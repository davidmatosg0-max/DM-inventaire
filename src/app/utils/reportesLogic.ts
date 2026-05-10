/**
 * Lógica de negocio para el módulo de Reportes
 * Genera reportes estadísticos y analíticos del sistema
 */

import { obtenerProductos } from './productStorage';
import { obtenerCategorias } from './categoriaStorage';
import { obtenerComandas } from './comandaStorage';
import { getStoredBrandingPrintConfig } from './brandingPrint';
import { obtenerOrganismos, obtenerEstadisticasOrganismos } from './organismosLogic';
import { obtenerRutas, obtenerVehiculos, obtenerEstadisticasTransporte } from './transporteLogic';
import { obtenerEntradas, type EntradaInventario } from './entradaInventarioStorage';

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
  comandasConfirmadas: number;
  comandasEnPreparacion: number;
  comandasCompletadas: number;
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

export interface ReportePRS {
  resumen: {
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstimado: number;
    donadoresUnicos: number;
    productosUnicos: number;
    organismosUnicos: number;
    participantesPRSUnicos: number;
  };
  porOrganismo: Array<{
    organismoId: string;
    organismoNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstimado: number;
  }>;
  porDonador: Array<{
    donadorId: string;
    donadorNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstimado: number;
  }>;
  porProducto: Array<{
    productoId: string;
    productoNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstimado: number;
  }>;
  porMes: Array<{
    mes: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstimado: number;
  }>;
  detalles: Array<{
    id: string;
    fecha: string;
    organismoId: string;
    organismoNombre: string;
    donadorId: string;
    donadorNombre: string;
    participantePRSId: string;
    participantePRSNombre: string;
    productoId: string;
    productoNombre: string;
    cantidad: number;
    unidad: string;
    pesoTotal: number;
    valorTotalEstimado: number;
  }>;
  periodo: {
    inicio: string;
    fin: string;
  };
  generadoEn: string;
}

function esComandaAnulada(estado?: string): boolean {
  return estado === 'anulada' || estado === 'cancelada';
}

function esComandaEnPreparacion(estado?: string): boolean {
  return estado === 'confirmada' || estado === 'en_preparacion' || estado === 'preparada';
}

function obtenerValorTotalComanda(comanda: any): number {
  if (typeof comanda?.totalValorMonetario === 'number') {
    return comanda.totalValorMonetario;
  }

  if (typeof comanda?.valorTotal === 'number') {
    return comanda.valorTotal;
  }

  if (Array.isArray(comanda?.items)) {
    return comanda.items.reduce((sum: number, item: any) => {
      const cantidad = Number(item?.cantidad || 0);
      const valorUnitario = Number(item?.valorUnitario || 0);
      return sum + (cantidad * valorUnitario);
    }, 0);
  }

  if (Array.isArray(comanda?.productos)) {
    return comanda.productos.reduce((sum: number, item: any) => {
      const valorLinea = typeof item?.valorMonetario === 'number'
        ? item.valorMonetario
        : Number(item?.cantidad || 0) * Number(item?.valorUnitario || 0);
      return sum + valorLinea;
    }, 0);
  }

  return 0;
}

function obtenerPesoTotalComanda(comanda: any): number {
  if (typeof comanda?.totalPeso === 'number') {
    return comanda.totalPeso;
  }

  if (typeof comanda?.pesoTotal === 'number') {
    return comanda.pesoTotal;
  }

  if (Array.isArray(comanda?.items)) {
    return comanda.items.reduce((sum: number, item: any) => {
      const cantidad = Number(item?.cantidad || 0);
      const peso = Number(item?.peso || 0);
      return sum + (cantidad * peso);
    }, 0);
  }

  if (Array.isArray(comanda?.productos)) {
    return comanda.productos.reduce((sum: number, item: any) => {
      const cantidad = Number(item?.cantidad || 0);
      const peso = Number(item?.peso || 0);
      return sum + (cantidad * peso);
    }, 0);
  }

  return 0;
}

function obtenerNombreOrganismoComanda(comanda: any): string {
  return comanda?.nombreOrganismo || comanda?.organismoNombre || 'Sin organismo';
}

function esEntradaPRS(entrada: EntradaInventario): boolean {
  const codigo = String(entrada.programaCodigo || '').trim().toLowerCase();
  const nombre = String(entrada.programaNombre || '').trim().toLowerCase();

  return codigo === 'prs'
    || nombre.includes('prs')
    || nombre.includes('ramassage de surplus')
    || nombre.includes('recuperation en supermarches')
    || nombre.includes('récupération en supermarchés');
}

function calcularValorEntrada(entrada: EntradaInventario): number {
  if (typeof entrada.valorTotal === 'number') {
    return entrada.valorTotal;
  }

  if (typeof entrada.valorUnitario === 'number') {
    return entrada.valorUnitario * entrada.cantidad;
  }

  return 0;
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
  const comandasConfirmadas = comandas.filter(c => c.estado === 'confirmada').length;
  const comandasEnPreparacion = comandas.filter(c => c.estado === 'en_preparacion' || c.estado === 'preparada').length;
  const comandasCompletadas = comandas.filter(c => c.estado === 'completada').length;
  const comandasPreparadas = comandas.filter(c => esComandaEnPreparacion(c.estado) || c.estado === 'completada').length;
  const comandasEntregadas = comandas.filter(c => c.estado === 'entregada').length;
  const comandasCanceladas = comandas.filter(c => esComandaAnulada(c.estado)).length;

  const valorTotalDistribuido = comandas
    .filter(c => !esComandaAnulada(c.estado))
    .reduce((sum, c) => sum + obtenerValorTotalComanda(c), 0);

  const pesoTotalDistribuido = comandas
    .filter(c => !esComandaAnulada(c.estado))
    .reduce((sum, c) => sum + obtenerPesoTotalComanda(c), 0);

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
    if (!esComandaAnulada(c.estado)) {
      comandasPorMesMap[mes].valor += obtenerValorTotalComanda(c);
    }
  });

  const comandasPorMes = Object.entries(comandasPorMesMap).map(([mes, datos]) => ({
    mes,
    ...datos,
  }));

  // Comandas por organismo
  const comandasPorOrganismoMap: Record<string, { cantidad: number; valor: number }> = {};
  comandas.forEach(c => {
    const nombreOrganismo = obtenerNombreOrganismoComanda(c);

    if (!comandasPorOrganismoMap[nombreOrganismo]) {
      comandasPorOrganismoMap[nombreOrganismo] = { cantidad: 0, valor: 0 };
    }
    comandasPorOrganismoMap[nombreOrganismo].cantidad++;
    if (!esComandaAnulada(c.estado)) {
      comandasPorOrganismoMap[nombreOrganismo].valor += obtenerValorTotalComanda(c);
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
    comandasConfirmadas,
    comandasEnPreparacion,
    comandasCompletadas,
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

export function generarReportePRS(
  fechaInicio?: string,
  fechaFin?: string,
  filtros?: {
    organismoId?: string;
    participantPRSId?: string;
    donorId?: string;
  }
): ReportePRS {
  let entradas = obtenerEntradas().filter((entrada) => entrada.activo && esEntradaPRS(entrada));
  const organismos = new Map(obtenerOrganismos().map((organismo) => [organismo.id, organismo.nombre]));

  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    entradas = entradas.filter((entrada) => {
      const fecha = new Date(entrada.fecha);
      return fecha >= inicio && fecha <= fin;
    });
  }

  if (filtros?.organismoId) {
    entradas = entradas.filter((entrada) => entrada.organismoId === filtros.organismoId);
  }

  if (filtros?.participantPRSId) {
    entradas = entradas.filter((entrada) => entrada.participantePRSId === filtros.participantPRSId);
  }

  if (filtros?.donorId) {
    entradas = entradas.filter((entrada) => entrada.donadorId === filtros.donorId);
  }

  const porOrganismoMap = new Map<string, ReportePRS['porOrganismo'][number]>();
  const porDonadorMap = new Map<string, ReportePRS['porDonador'][number]>();
  const porProductoMap = new Map<string, ReportePRS['porProducto'][number]>();
  const porMesMap = new Map<string, ReportePRS['porMes'][number]>();

  const donadoresUnicos = new Set<string>();
  const productosUnicos = new Set<string>();
  const organismosUnicos = new Set<string>();
  const participantesPRSUnicos = new Set<string>();

  const detalles = entradas
    .map((entrada) => {
      const organismoId = entrada.organismoId || '';
      const organismoNombre = entrada.registradoPor || organismos.get(organismoId) || 'Sin organismo';
      const valorTotalEstimado = calcularValorEntrada(entrada);
      const mes = `${new Date(entrada.fecha).getFullYear()}-${String(new Date(entrada.fecha).getMonth() + 1).padStart(2, '0')}`;

      donadoresUnicos.add(entrada.donadorId || entrada.donadorNombre);
      productosUnicos.add(entrada.productoId || entrada.nombreProducto);
      organismosUnicos.add(organismoId || organismoNombre);

      if (entrada.participantePRSId || entrada.participantePRSNombre) {
        participantesPRSUnicos.add(entrada.participantePRSId || entrada.participantePRSNombre || '');
      }

      const organismoActual = porOrganismoMap.get(organismoId || organismoNombre) || {
        organismoId,
        organismoNombre,
        totalEntradas: 0,
        totalCantidad: 0,
        totalPesoKg: 0,
        valorTotalEstimado: 0,
      };
      organismoActual.totalEntradas += 1;
      organismoActual.totalCantidad += entrada.cantidad;
      organismoActual.totalPesoKg += entrada.pesoTotal || 0;
      organismoActual.valorTotalEstimado += valorTotalEstimado;
      porOrganismoMap.set(organismoId || organismoNombre, organismoActual);

      const donadorActual = porDonadorMap.get(entrada.donadorId || entrada.donadorNombre) || {
        donadorId: entrada.donadorId || '',
        donadorNombre: entrada.donadorNombre || 'Sin donador',
        totalEntradas: 0,
        totalCantidad: 0,
        totalPesoKg: 0,
        valorTotalEstimado: 0,
      };
      donadorActual.totalEntradas += 1;
      donadorActual.totalCantidad += entrada.cantidad;
      donadorActual.totalPesoKg += entrada.pesoTotal || 0;
      donadorActual.valorTotalEstimado += valorTotalEstimado;
      porDonadorMap.set(entrada.donadorId || entrada.donadorNombre, donadorActual);

      const productoActual = porProductoMap.get(entrada.productoId || entrada.nombreProducto) || {
        productoId: entrada.productoId || '',
        productoNombre: entrada.nombreProducto || 'Sin producto',
        totalEntradas: 0,
        totalCantidad: 0,
        totalPesoKg: 0,
        valorTotalEstimado: 0,
      };
      productoActual.totalEntradas += 1;
      productoActual.totalCantidad += entrada.cantidad;
      productoActual.totalPesoKg += entrada.pesoTotal || 0;
      productoActual.valorTotalEstimado += valorTotalEstimado;
      porProductoMap.set(entrada.productoId || entrada.nombreProducto, productoActual);

      const mesActual = porMesMap.get(mes) || {
        mes,
        totalEntradas: 0,
        totalCantidad: 0,
        totalPesoKg: 0,
        valorTotalEstimado: 0,
      };
      mesActual.totalEntradas += 1;
      mesActual.totalCantidad += entrada.cantidad;
      mesActual.totalPesoKg += entrada.pesoTotal || 0;
      mesActual.valorTotalEstimado += valorTotalEstimado;
      porMesMap.set(mes, mesActual);

      return {
        id: entrada.id,
        fecha: entrada.fecha,
        organismoId,
        organismoNombre,
        donadorId: entrada.donadorId || '',
        donadorNombre: entrada.donadorNombre || 'Sin donador',
        participantePRSId: entrada.participantePRSId || '',
        participantePRSNombre: entrada.participantePRSNombre || '',
        productoId: entrada.productoId || '',
        productoNombre: entrada.nombreProducto || 'Sin producto',
        cantidad: entrada.cantidad,
        unidad: entrada.unidad,
        pesoTotal: entrada.pesoTotal || 0,
        valorTotalEstimado,
      };
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return {
    resumen: {
      totalEntradas: entradas.length,
      totalCantidad: entradas.reduce((total, entrada) => total + entrada.cantidad, 0),
      totalPesoKg: entradas.reduce((total, entrada) => total + (entrada.pesoTotal || 0), 0),
      valorTotalEstimado: entradas.reduce((total, entrada) => total + calcularValorEntrada(entrada), 0),
      donadoresUnicos: donadoresUnicos.size,
      productosUnicos: productosUnicos.size,
      organismosUnicos: organismosUnicos.size,
      participantesPRSUnicos: participantesPRSUnicos.size,
    },
    porOrganismo: Array.from(porOrganismoMap.values()).sort((a, b) => b.valorTotalEstimado - a.valorTotalEstimado),
    porDonador: Array.from(porDonadorMap.values()).sort((a, b) => b.valorTotalEstimado - a.valorTotalEstimado),
    porProducto: Array.from(porProductoMap.values()).sort((a, b) => b.valorTotalEstimado - a.valorTotalEstimado),
    porMes: Array.from(porMesMap.values()).sort((a, b) => a.mes.localeCompare(b.mes)),
    detalles,
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
  const systemName = getStoredBrandingPrintConfig().systemName;
  
  // Header
  lineas.push(`REPORTE GENERAL - ${systemName.toUpperCase()}`);
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
  lineas.push(`Confirmadas,${reporte.comandas.comandasConfirmadas}`);
  lineas.push(`En preparacion,${reporte.comandas.comandasEnPreparacion}`);
  lineas.push(`Completadas,${reporte.comandas.comandasCompletadas}`);
  lineas.push(`Entregadas,${reporte.comandas.comandasEntregadas}`);
  lineas.push(`Anuladas,${reporte.comandas.comandasCanceladas}`);
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

export function exportarReportePRSCSV(reporte: ReportePRS): string {
  const lineas: string[] = [];
  const systemName = getStoredBrandingPrintConfig().systemName;

  lineas.push(`REPORTE PRS - ${systemName.toUpperCase()}`);
  lineas.push(`Periodo,${reporte.periodo.inicio} - ${reporte.periodo.fin}`);
  lineas.push(`Generado,${new Date(reporte.generadoEn).toLocaleString()}`);
  lineas.push('');
  lineas.push('=== RESUMEN ===');
  lineas.push(`Total Entradas,${reporte.resumen.totalEntradas}`);
  lineas.push(`Total Cantidad,${reporte.resumen.totalCantidad}`);
  lineas.push(`Total Peso Kg,${reporte.resumen.totalPesoKg}`);
  lineas.push(`Valor Total Estimado,${reporte.resumen.valorTotalEstimado}`);
  lineas.push(`Donadores Unicos,${reporte.resumen.donadoresUnicos}`);
  lineas.push(`Productos Unicos,${reporte.resumen.productosUnicos}`);
  lineas.push(`Organismos Unicos,${reporte.resumen.organismosUnicos}`);
  lineas.push('');
  lineas.push('=== DETALLES ===');
  lineas.push('Fecha,Organismo,Donador,Participante PRS,Producto,Cantidad,Unidad,Peso Kg,Valor Estimado');

  reporte.detalles.forEach((detalle) => {
    lineas.push([
      detalle.fecha,
      detalle.organismoNombre,
      detalle.donadorNombre,
      detalle.participantePRSNombre,
      detalle.productoNombre,
      detalle.cantidad,
      detalle.unidad,
      detalle.pesoTotal,
      detalle.valorTotalEstimado,
    ].join(','));
  });

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
