/**
 * Sistema de Auditoría y Logs del Sistema
 * 
 * Registra todas las acciones importantes realizadas en el sistema
 * para trazabilidad, cumplimiento y análisis.
 */

import type { EventoSistema } from '../types';

const AUDIT_STORAGE_KEY = 'banque_alimentaire_audit_logs';
const MAX_LOGS = 10000; // Máximo de logs almacenados

export type TipoAccion = 
  // Inventario
  | 'inventario.producto.crear'
  | 'inventario.producto.editar'
  | 'inventario.producto.eliminar'
  | 'inventario.entrada.registrar'
  | 'inventario.salida.registrar'
  | 'inventario.ajuste.realizar'
  | 'inventario.transformacion.realizar'
  | 'inventario.conversion.realizar'
  | 'inventario.stock.actualizar'
  // Comandas
  | 'comandas.crear'
  | 'comandas.editar'
  | 'comandas.eliminar'
  | 'comandas.cambiar_estado'
  | 'comandas.aceptar'
  | 'comandas.rechazar'
  | 'comandas.entregar'
  | 'comandas.cancelar'
  | 'comandas.imprimir'
  // Organismos
  | 'organismos.crear'
  | 'organismos.editar'
  | 'organismos.eliminar'
  | 'organismos.activar'
  | 'organismos.desactivar'
  // Transporte
  | 'transporte.ruta.crear'
  | 'transporte.ruta.editar'
  | 'transporte.ruta.eliminar'
  | 'transporte.ruta.iniciar'
  | 'transporte.ruta.completar'
  | 'transporte.ruta.cancelar'
  // Contactos
  | 'contactos.crear'
  | 'contactos.editar'
  | 'contactos.eliminar'
  // Benevoles
  | 'benevoles.crear'
  | 'benevoles.editar'
  | 'benevoles.eliminar'
  | 'benevoles.cambiar_estado'
  | 'benevoles.documento.agregar'
  | 'benevoles.documento.eliminar'
  // Cuisine
  | 'cuisine.receta.crear'
  | 'cuisine.receta.editar'
  | 'cuisine.receta.eliminar'
  | 'cuisine.transformacion.crear'
  | 'cuisine.oferta.aceptar'
  | 'cuisine.oferta.rechazar'
  // Configuración
  | 'configuracion.categoria.crear'
  | 'configuracion.categoria.editar'
  | 'configuracion.categoria.eliminar'
  | 'configuracion.unidad.crear'
  | 'configuracion.unidad.editar'
  | 'configuracion.programa.crear'
  | 'configuracion.programa.editar'
  | 'configuracion.email.configurar'
  // Usuarios
  | 'usuarios.crear'
  | 'usuarios.editar'
  | 'usuarios.eliminar'
  | 'usuarios.login'
  | 'usuarios.logout'
  | 'usuarios.cambiar_password'
  | 'usuarios.cambiar_permisos'
  // Sistema
  | 'sistema.exportar_datos'
  | 'sistema.importar_datos'
  | 'sistema.backup'
  | 'sistema.restaurar'
  | 'sistema.configuracion.cambiar';

export type SeveridadLog = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLog extends EventoSistema {
  // Hereda de EventoSistema
  severidad?: SeveridadLog;
  duracion?: number; // En milisegundos
  exito: boolean;
  datosAntes?: any; // Estado antes del cambio
  datosDespues?: any; // Estado después del cambio
  navegador?: string;
  dispositivoId?: string;
}

export interface FiltrosAudit {
  fechaInicio?: string;
  fechaFin?: string;
  usuario?: string;
  modulo?: string;
  accion?: TipoAccion | string;
  severidad?: SeveridadLog;
  exito?: boolean;
  busqueda?: string;
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Obtener todos los logs de auditoría
 */
export function obtenerLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!data) return [];
    
    const logs = JSON.parse(data);
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    return [];
  }
}

/**
 * Registrar un evento de auditoría
 */
export function registrarAuditLog(log: Omit<AuditLog, 'id' | 'fecha'>): string {
  try {
    const logs = obtenerLogs();
    
    const nuevoLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fecha: new Date().toISOString(),
      ...log,
      navegador: obtenerInfoNavegador(),
      dispositivoId: obtenerDispositivoId()
    };
    
    // Agregar al inicio del array
    logs.unshift(nuevoLog);
    
    // Mantener solo los últimos MAX_LOGS
    const logsLimitados = logs.slice(0, MAX_LOGS);
    
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logsLimitados));
    
    return nuevoLog.id;
  } catch (error) {
    console.error('Error al registrar log de auditoría:', error);
    return '';
  }
}

/**
 * Registrar una acción del sistema
 */
export function registrarAccion(
  accion: TipoAccion,
  usuario: string,
  detalles?: any,
  options?: {
    datosAntes?: any;
    datosDespues?: any;
    exito?: boolean;
    severidad?: SeveridadLog;
    duracion?: number;
  }
): string {
  const modulo = accion.split('.')[0];
  
  return registrarAuditLog({
    tipo: 'accion',
    usuario,
    modulo,
    accion,
    detalles,
    exito: options?.exito ?? true,
    severidad: options?.severidad ?? 'info',
    duracion: options?.duracion,
    datosAntes: options?.datosAntes,
    datosDespues: options?.datosDespues
  });
}

/**
 * Registrar un error del sistema
 */
export function registrarError(
  modulo: string,
  accion: string,
  error: Error | string,
  usuario: string,
  detalles?: any
): string {
  const errorMsg = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  return registrarAuditLog({
    tipo: 'error',
    usuario,
    modulo,
    accion,
    detalles: {
      ...detalles,
      error: errorMsg,
      stack: errorStack
    },
    exito: false,
    severidad: 'error'
  });
}

/**
 * Filtrar logs de auditoría
 */
export function filtrarLogs(filtros: FiltrosAudit): AuditLog[] {
  let logs = obtenerLogs();
  
  // Filtrar por fecha de inicio
  if (filtros.fechaInicio) {
    const fechaInicio = new Date(filtros.fechaInicio).getTime();
    logs = logs.filter(log => new Date(log.fecha).getTime() >= fechaInicio);
  }
  
  // Filtrar por fecha de fin
  if (filtros.fechaFin) {
    const fechaFin = new Date(filtros.fechaFin).getTime();
    logs = logs.filter(log => new Date(log.fecha).getTime() <= fechaFin);
  }
  
  // Filtrar por usuario
  if (filtros.usuario) {
    logs = logs.filter(log => 
      log.usuario.toLowerCase().includes(filtros.usuario!.toLowerCase())
    );
  }
  
  // Filtrar por módulo
  if (filtros.modulo) {
    logs = logs.filter(log => log.modulo === filtros.modulo);
  }
  
  // Filtrar por acción
  if (filtros.accion) {
    logs = logs.filter(log => log.accion === filtros.accion);
  }
  
  // Filtrar por severidad
  if (filtros.severidad) {
    logs = logs.filter(log => log.severidad === filtros.severidad);
  }
  
  // Filtrar por éxito
  if (filtros.exito !== undefined) {
    logs = logs.filter(log => log.exito === filtros.exito);
  }
  
  // Búsqueda general
  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase();
    logs = logs.filter(log => 
      log.usuario.toLowerCase().includes(busqueda) ||
      log.modulo.toLowerCase().includes(busqueda) ||
      log.accion.toLowerCase().includes(busqueda) ||
      JSON.stringify(log.detalles).toLowerCase().includes(busqueda)
    );
  }
  
  return logs;
}

/**
 * Obtener logs de un usuario específico
 */
export function obtenerLogsPorUsuario(usuario: string): AuditLog[] {
  return filtrarLogs({ usuario });
}

/**
 * Obtener logs de un módulo específico
 */
export function obtenerLogsPorModulo(modulo: string): AuditLog[] {
  return filtrarLogs({ modulo });
}

/**
 * Obtener logs del día actual
 */
export function obtenerLogsHoy(): AuditLog[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return filtrarLogs({
    fechaInicio: hoy.toISOString()
  });
}

/**
 * Obtener logs de la última semana
 */
export function obtenerLogsUltimaSemana(): AuditLog[] {
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  
  return filtrarLogs({
    fechaInicio: hace7Dias.toISOString()
  });
}

/**
 * Obtener logs de errores
 */
export function obtenerLogsErrores(): AuditLog[] {
  return filtrarLogs({ exito: false });
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

/**
 * Obtener estadísticas de logs
 */
export function obtenerEstadisticasLogs(logs?: AuditLog[]) {
  const logsParaAnalizar = logs || obtenerLogs();
  
  const totalLogs = logsParaAnalizar.length;
  const logsExitosos = logsParaAnalizar.filter(l => l.exito).length;
  const logsErrores = logsParaAnalizar.filter(l => !l.exito).length;
  
  // Logs por módulo
  const logsPorModulo: Record<string, number> = {};
  logsParaAnalizar.forEach(log => {
    logsPorModulo[log.modulo] = (logsPorModulo[log.modulo] || 0) + 1;
  });
  
  // Logs por usuario
  const logsPorUsuario: Record<string, number> = {};
  logsParaAnalizar.forEach(log => {
    logsPorUsuario[log.usuario] = (logsPorUsuario[log.usuario] || 0) + 1;
  });
  
  // Logs por severidad
  const logsPorSeveridad: Record<string, number> = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0
  };
  logsParaAnalizar.forEach(log => {
    if (log.severidad) {
      logsPorSeveridad[log.severidad]++;
    }
  });
  
  // Logs por día
  const logsPorDia: Record<string, number> = {};
  logsParaAnalizar.forEach(log => {
    const fecha = new Date(log.fecha).toISOString().split('T')[0];
    logsPorDia[fecha] = (logsPorDia[fecha] || 0) + 1;
  });
  
  return {
    totalLogs,
    logsExitosos,
    logsErrores,
    tasaExito: totalLogs > 0 ? (logsExitosos / totalLogs) * 100 : 0,
    logsPorModulo,
    logsPorUsuario,
    logsPorSeveridad,
    logsPorDia
  };
}

/**
 * Obtener usuarios más activos
 */
export function obtenerUsuariosMasActivos(limite: number = 10): Array<{usuario: string, acciones: number}> {
  const logs = obtenerLogs();
  const contador: Record<string, number> = {};
  
  logs.forEach(log => {
    contador[log.usuario] = (contador[log.usuario] || 0) + 1;
  });
  
  return Object.entries(contador)
    .map(([usuario, acciones]) => ({ usuario, acciones }))
    .sort((a, b) => b.acciones - a.acciones)
    .slice(0, limite);
}

/**
 * Obtener módulos más utilizados
 */
export function obtenerModulosMasUtilizados(limite: number = 10): Array<{modulo: string, acciones: number}> {
  const logs = obtenerLogs();
  const contador: Record<string, number> = {};
  
  logs.forEach(log => {
    contador[log.modulo] = (contador[log.modulo] || 0) + 1;
  });
  
  return Object.entries(contador)
    .map(([modulo, acciones]) => ({ modulo, acciones }))
    .sort((a, b) => b.acciones - a.acciones)
    .slice(0, limite);
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

/**
 * Exportar logs a CSV
 */
export function exportarLogsCSV(logs?: AuditLog[]): string {
  const logsParaExportar = logs || obtenerLogs();
  
  // Encabezados
  const headers = [
    'ID',
    'Fecha',
    'Usuario',
    'Módulo',
    'Acción',
    'Tipo',
    'Éxito',
    'Severidad',
    'Duración (ms)',
    'Detalles',
    'IP',
    'Navegador'
  ];
  
  // Convertir logs a filas CSV
  const rows = logsParaExportar.map(log => [
    log.id,
    log.fecha,
    log.usuario,
    log.modulo,
    log.accion,
    log.tipo,
    log.exito ? 'Sí' : 'No',
    log.severidad || 'info',
    log.duracion || '',
    JSON.stringify(log.detalles || {}),
    log.ip || '',
    log.navegador || ''
  ]);
  
  // Construir CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Exportar logs a JSON
 */
export function exportarLogsJSON(logs?: AuditLog[]): string {
  const logsParaExportar = logs || obtenerLogs();
  return JSON.stringify(logsParaExportar, null, 2);
}

/**
 * Descargar logs como archivo
 */
export function descargarLogs(formato: 'csv' | 'json' = 'csv', logs?: AuditLog[]) {
  const contenido = formato === 'csv' 
    ? exportarLogsCSV(logs)
    : exportarLogsJSON(logs);
  
  const blob = new Blob([contenido], { 
    type: formato === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' 
  });
  
  const fecha = new Date().toISOString().split('T')[0];
  const nombreArchivo = `audit_logs_${fecha}.${formato}`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

// ============================================================================
// LIMPIEZA Y MANTENIMIENTO
// ============================================================================

/**
 * Limpiar logs antiguos (más de X días)
 */
export function limpiarLogsAntiguos(dias: number = 90): number {
  const logs = obtenerLogs();
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - dias);
  
  const logsActualizados = logs.filter(log => 
    new Date(log.fecha).getTime() > fechaLimite.getTime()
  );
  
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logsActualizados));
  
  return logs.length - logsActualizados.length;
}

/**
 * Obtener tamaño del almacenamiento de logs
 */
export function obtenerTamañoLogs(): { bytes: number, mb: number, logs: number } {
  const logs = obtenerLogs();
  const data = localStorage.getItem(AUDIT_STORAGE_KEY) || '';
  const bytes = new Blob([data]).size;
  const mb = bytes / (1024 * 1024);
  
  return {
    bytes,
    mb: Math.round(mb * 100) / 100,
    logs: logs.length
  };
}

/**
 * Limpiar todos los logs (con confirmación)
 */
export function limpiarTodosLogs(): void {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
}

// ============================================================================
// UTILIDADES PRIVADAS
// ============================================================================

function obtenerInfoNavegador(): string {
  const ua = navigator.userAgent;
  let navegador = 'Desconocido';
  
  if (ua.includes('Firefox')) navegador = 'Firefox';
  else if (ua.includes('Chrome')) navegador = 'Chrome';
  else if (ua.includes('Safari')) navegador = 'Safari';
  else if (ua.includes('Edge')) navegador = 'Edge';
  else if (ua.includes('Opera')) navegador = 'Opera';
  
  return navegador;
}

function obtenerDispositivoId(): string {
  // Generar o recuperar un ID único del dispositivo
  const key = 'dispositivo_id';
  let id = localStorage.getItem(key);
  
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, id);
  }
  
  return id;
}

// ============================================================================
// HELPERS PARA ACCIONES COMUNES
// ============================================================================

export const AuditHelper = {
  // Inventario
  productoCreado: (usuario: string, producto: any) =>
    registrarAccion('inventario.producto.crear', usuario, { productoId: producto.id, nombre: producto.nombre }),
  
  productoEditado: (usuario: string, producto: any, cambios: any) =>
    registrarAccion('inventario.producto.editar', usuario, { productoId: producto.id, cambios }, { datosAntes: cambios.antes, datosDespues: cambios.despues }),
  
  entradaRegistrada: (usuario: string, entrada: any) =>
    registrarAccion('inventario.entrada.registrar', usuario, { productoId: entrada.productoId, cantidad: entrada.cantidad }),
  
  // Comandas
  comandaCreada: (usuario: string, comanda: any) =>
    registrarAccion('comandas.crear', usuario, { comandaId: comanda.id, numero: comanda.numero, organismoId: comanda.organismoId }),
  
  comandaEntregada: (usuario: string, comanda: any) =>
    registrarAccion('comandas.entregar', usuario, { comandaId: comanda.id, numero: comanda.numero }),
  
  // Usuarios
  loginExitoso: (usuario: string) =>
    registrarAccion('usuarios.login', usuario, { timestamp: new Date().toISOString() }),
  
  loginFallido: (usuario: string, razon: string) =>
    registrarError('usuarios', 'usuarios.login', razon, usuario, { timestamp: new Date().toISOString() }),
  
  // Sistema
  datosExportados: (usuario: string, tipo: string) =>
    registrarAccion('sistema.exportar_datos', usuario, { tipo, timestamp: new Date().toISOString() })
};
