/**
 * Componente Visor de Logs de Auditoría
 * 
 * Permite visualizar, filtrar, buscar y exportar logs de auditoría
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  User,
  Activity,
  Clock,
  FileText,
  BarChart3,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  obtenerLogs,
  filtrarLogs,
  descargarLogs,
  limpiarLogsAntiguos,
  obtenerEstadisticasLogs,
  obtenerUsuariosMasActivos,
  obtenerModulosMasUtilizados,
  obtenerTamañoLogs,
  type AuditLog,
  type FiltrosAudit
} from '../../utils/auditStorage';
import { toast } from 'sonner';

export function AuditLogViewer() {
  const { t } = useTranslation();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsFiltrados, setLogsFiltrados] = useState<AuditLog[]>([]);
  const [cargando, setCargando] = useState(true);
  const [logSeleccionado, setLogSeleccionado] = useState<AuditLog | null>(null);
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);
  const [expandido, setExpandido] = useState<string | null>(null);
  
  // Filtros
  const [filtros, setFiltros] = useState<FiltrosAudit>({});
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState('todos');
  const [severidadFiltro, setSeveridadFiltro] = useState('todos');
  const [exitoFiltro, setExitoFiltro] = useState('todos');
  
  // Estadísticas
  const estadisticas = useMemo(() => {
    return obtenerEstadisticasLogs(logsFiltrados);
  }, [logsFiltrados]);
  
  const usuariosActivos = useMemo(() => {
    return obtenerUsuariosMasActivos(5);
  }, [logs]);
  
  const modulosPopulares = useMemo(() => {
    return obtenerModulosMasUtilizados(5);
  }, [logs]);
  
  const tamañoStorage = useMemo(() => {
    return obtenerTamañoLogs();
  }, [logs]);
  
  // Cargar logs
  useEffect(() => {
    cargarLogs();
  }, []);
  
  // Aplicar filtros
  useEffect(() => {
    aplicarFiltros();
  }, [logs, filtros, busqueda, fechaInicio, fechaFin, moduloFiltro, severidadFiltro, exitoFiltro]);
  
  const cargarLogs = () => {
    setCargando(true);
    try {
      const logsData = obtenerLogs();
      setLogs(logsData);
    } catch (error) {
      console.error('Error al cargar logs:', error);
      toast.error('Error al cargar los logs de auditoría');
    } finally {
      setCargando(false);
    }
  };
  
  const aplicarFiltros = () => {
    const filtrosActualizados: FiltrosAudit = {
      busqueda: busqueda || undefined,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      modulo: moduloFiltro !== 'todos' ? moduloFiltro : undefined,
      severidad: severidadFiltro !== 'todos' ? (severidadFiltro as any) : undefined,
      exito: exitoFiltro !== 'todos' ? exitoFiltro === 'si' : undefined
    };
    
    const resultado = filtrarLogs(filtrosActualizados);
    setLogsFiltrados(resultado);
  };
  
  const limpiarFiltros = () => {
    setBusqueda('');
    setFechaInicio('');
    setFechaFin('');
    setModuloFiltro('todos');
    setSeveridadFiltro('todos');
    setExitoFiltro('todos');
  };
  
  const handleExportarCSV = () => {
    descargarLogs('csv', logsFiltrados);
    toast.success(`${logsFiltrados.length} logs exportados a CSV`);
  };
  
  const handleExportarJSON = () => {
    descargarLogs('json', logsFiltrados);
    toast.success(`${logsFiltrados.length} logs exportados a JSON`);
  };
  
  const handleLimpiarAntiguos = () => {
    const eliminados = limpiarLogsAntiguos(90);
    toast.success(`${eliminados} logs antiguos eliminados`);
    cargarLogs();
  };
  
  const handleVerDetalle = (log: AuditLog) => {
    setLogSeleccionado(log);
    setDialogDetalleOpen(true);
  };
  
  const toggleExpandir = (logId: string) => {
    setExpandido(expandido === logId ? null : logId);
  };
  
  const obtenerIconoSeveridad = (severidad?: string) => {
    switch (severidad) {
      case 'critical':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };
  
  const obtenerColorSeveridad = (severidad?: string) => {
    switch (severidad) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };
  
  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const obtenerModulosUnicos = () => {
    const modulos = new Set(logs.map(log => log.modulo));
    return Array.from(modulos).sort();
  };
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1a4d7a]">
              {t('audit.title', 'Registros de Auditoría')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('audit.subtitle', 'Trazabilidad completa del sistema')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarLogs}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('audit.refresh', 'Actualizar')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarJSON}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            JSON
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="w-4 h-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {t('audit.statistics', 'Estadísticas')}
          </TabsTrigger>
        </TabsList>
        
        {/* Tab de Logs */}
        <TabsContent value="logs" className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Logs</p>
                    <p className="text-2xl font-bold text-[#1a4d7a]">
                      {estadisticas.totalLogs.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Exitosos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {estadisticas.logsExitosos.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Errores</p>
                    <p className="text-2xl font-bold text-red-600">
                      {estadisticas.logsErrores.toLocaleString()}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasa Éxito</p>
                    <p className="text-2xl font-bold text-[#2d9561]">
                      {estadisticas.tasaExito.toFixed(1)}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {t('audit.filters', 'Filtros')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="col-span-full">
                  <Label>{t('audit.search', 'Buscar')}</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t('audit.searchPlaceholder', 'Buscar en logs...')}
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Fecha Inicio */}
                <div>
                  <Label>{t('audit.dateFrom', 'Desde')}</Label>
                  <Input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                {/* Fecha Fin */}
                <div>
                  <Label>{t('audit.dateTo', 'Hasta')}</Label>
                  <Input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                {/* Módulo */}
                <div>
                  <Label>{t('audit.module', 'Módulo')}</Label>
                  <Select value={moduloFiltro} onValueChange={setModuloFiltro}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {obtenerModulosUnicos().map(modulo => (
                        <SelectItem key={modulo} value={modulo}>
                          {modulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Severidad */}
                <div>
                  <Label>{t('audit.severity', 'Severidad')}</Label>
                  <Select value={severidadFiltro} onValueChange={setSeveridadFiltro}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Advertencia</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarFiltros}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('audit.clearFilters', 'Limpiar Filtros')}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabla de Logs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('audit.recentLogs', 'Registros Recientes')} ({logsFiltrados.length})
                </CardTitle>
                
                <Badge variant="outline" className="gap-2">
                  <Clock className="w-3 h-3" />
                  {tamañoStorage.mb} MB
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {logsFiltrados.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        obtenerColorSeveridad(log.severidad)
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {obtenerIconoSeveridad(log.severidad)}
                            
                            <Badge variant="outline" className="text-xs">
                              {log.modulo}
                            </Badge>
                            
                            <span className="text-sm font-medium">
                              {log.accion}
                            </span>
                            
                            {log.exito ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.usuario}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatearFecha(log.fecha)}
                            </div>
                            
                            {log.duracion && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {log.duracion}ms
                              </div>
                            )}
                          </div>
                          
                          {expandido === log.id && log.detalles && (
                            <div className="mt-3 p-3 bg-white/50 rounded border text-xs">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.detalles, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpandir(log.id)}
                          >
                            {expandido === log.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerDetalle(log)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {logsFiltrados.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('audit.noLogs', 'No se encontraron registros')}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de Estadísticas */}
        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Usuarios Más Activos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('audit.mostActiveUsers', 'Usuarios Más Activos')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usuariosActivos.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a4d7a] text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{item.usuario}</span>
                      </div>
                      <Badge>{item.acciones} acciones</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Módulos Más Utilizados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t('audit.mostUsedModules', 'Módulos Más Utilizados')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modulosPopulares.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2d9561] text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{item.modulo}</span>
                      </div>
                      <Badge>{item.acciones} acciones</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5" />
                {t('audit.systemInfo', 'Información del Sistema')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total de Logs Almacenados</p>
                  <p className="text-2xl font-bold text-[#1a4d7a]">
                    {tamañoStorage.logs.toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Espacio Utilizado</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tamañoStorage.mb} MB
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Logs por Día (promedio)</p>
                  <p className="text-2xl font-bold text-[#2d9561]">
                    {Object.keys(estadisticas.logsPorDia).length > 0
                      ? Math.round(estadisticas.totalLogs / Object.keys(estadisticas.logsPorDia).length)
                      : 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleLimpiarAntiguos}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('audit.cleanOldLogs', 'Limpiar Logs Antiguos (>90 días)')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog Detalle de Log */}
      <Dialog open={dialogDetalleOpen} onOpenChange={setDialogDetalleOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" aria-describedby="detalle-log-description">
          <DialogHeader>
            <DialogTitle>Detalle del Log</DialogTitle>
            <DialogDescription id="detalle-log-description">
              Información completa del registro de auditoría
            </DialogDescription>
          </DialogHeader>
          
          {logSeleccionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">ID</Label>
                  <p className="font-mono text-sm">{logSeleccionado.id}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Fecha</Label>
                  <p className="text-sm">{formatearFecha(logSeleccionado.fecha)}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Usuario</Label>
                  <p className="text-sm font-medium">{logSeleccionado.usuario}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Módulo</Label>
                  <Badge>{logSeleccionado.modulo}</Badge>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Acción</Label>
                  <p className="text-sm">{logSeleccionado.accion}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Estado</Label>
                  {logSeleccionado.exito ? (
                    <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Error</Badge>
                  )}
                </div>
                
                {logSeleccionado.duracion && (
                  <div>
                    <Label className="text-xs text-gray-500">Duración</Label>
                    <p className="text-sm">{logSeleccionado.duracion} ms</p>
                  </div>
                )}
                
                {logSeleccionado.navegador && (
                  <div>
                    <Label className="text-xs text-gray-500">Navegador</Label>
                    <p className="text-sm">{logSeleccionado.navegador}</p>
                  </div>
                )}
              </div>
              
              {logSeleccionado.detalles && (
                <div>
                  <Label className="text-xs text-gray-500">Detalles</Label>
                  <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(logSeleccionado.detalles, null, 2)}
                  </pre>
                </div>
              )}
              
              {logSeleccionado.datosAntes && (
                <div>
                  <Label className="text-xs text-gray-500">Estado Anterior</Label>
                  <pre className="mt-2 p-4 bg-yellow-50 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(logSeleccionado.datosAntes, null, 2)}
                  </pre>
                </div>
              )}
              
              {logSeleccionado.datosDespues && (
                <div>
                  <Label className="text-xs text-gray-500">Estado Posterior</Label>
                  <pre className="mt-2 p-4 bg-green-50 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(logSeleccionado.datosDespues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
