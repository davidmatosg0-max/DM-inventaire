/**
 * Módulo de Gestión de Performance
 * 
 * Panel completo para analizar y optimizar el rendimiento
 * de la aplicación.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Zap,
  Cpu,
  HardDrive,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import {
  usePerformance,
  formatBytes,
  getFPSColor,
  getMemoryColor,
  performanceManager,
  type ComponentMetrics
} from '../../hooks/usePerformance';

export function PerformanceModule() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [componentMetrics, setComponentMetrics] = useState<ComponentMetrics[]>([]);
  const metrics = usePerformance('PerformanceModule');

  // Actualizar métricas cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setComponentMetrics(performanceManager.getAllMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const globalStats = performanceManager.getGlobalStats();
  const slowestComponents = performanceManager.getTopSlowestComponents(10);

  // Exportar reporte
  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      globalStats,
      currentMetrics: metrics,
      componentMetrics,
      slowestComponents
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(t('performance.reportExported', 'Reporte exportado'));
  };

  // Limpiar métricas
  const handleClearMetrics = () => {
    if (window.confirm(t('performance.confirmClear', '¿Limpiar todas las métricas?'))) {
      performanceManager.reset();
      setComponentMetrics([]);
      toast.success(t('performance.metricsCleared', 'Métricas limpiadas'));
    }
  };

  // Calcular recomendaciones
  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];

    if (metrics.fps < 30) {
      recommendations.push('FPS bajo: Considere reducir la complejidad de los componentes');
    }

    if (metrics.memory && metrics.memory.usedPercentage > 80) {
      recommendations.push('Alto uso de memoria: Verifique memory leaks y optimice caché');
    }

    if (globalStats.slowRenderPercentage > 20) {
      recommendations.push('Muchos renders lentos: Use React.memo y memoización');
    }

    if (componentMetrics.length > 50) {
      recommendations.push('Muchos componentes: Considere lazy loading y code splitting');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance óptima - Sin recomendaciones');
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Contenedor principal */}
      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl text-white shadow-lg">
                    <Activity className="w-8 h-8" />
                  </div>
                  {t('performance.title', 'Performance')}
                </h1>
                <p className="text-gray-600">
                  {t('performance.subtitle', 'Análisis y optimización del rendimiento')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('performance.export', 'Exportar')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearMetrics}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('performance.clear', 'Limpiar')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">FPS</p>
                  <p className={`text-3xl font-bold ${getFPSColor(metrics.fps)}`}>
                    {metrics.fps}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('performance.renderTime', 'Render Time')}
                  </p>
                  <p className="text-3xl font-bold text-[#1a4d7a]">
                    {metrics.lastRenderTime.toFixed(1)}
                    <span className="text-sm ml-1">ms</span>
                  </p>
                </div>
                <Cpu className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('performance.memory', 'Memory')}
                  </p>
                  <p className={`text-3xl font-bold ${
                    metrics.memory ? getMemoryColor(metrics.memory.usedPercentage) : ''
                  }`}>
                    {metrics.memory
                      ? `${metrics.memory.usedPercentage.toFixed(0)}%`
                      : 'N/A'
                    }
                  </p>
                </div>
                <HardDrive className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('performance.components', 'Components')}
                  </p>
                  <p className="text-3xl font-bold text-[#2d9561]">
                    {globalStats.totalComponents}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl">
            <TabsList className="grid grid-cols-4 w-full p-1 bg-gray-100/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {t('performance.overview', 'Vista General')}
              </TabsTrigger>
              <TabsTrigger value="components" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('performance.components', 'Componentes')}
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                {t('performance.memory', 'Memoria')}
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('performance.recommendations', 'Recomendaciones')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Vista General */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#1a4d7a]" />
                    {t('performance.globalStats', 'Estadísticas Globales')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t('performance.totalRenders', 'Total Renders')}
                    </span>
                    <Badge variant="outline">{globalStats.totalRenders}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t('performance.slowRenders', 'Renders Lentos')}
                    </span>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {globalStats.totalSlowRenders}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {t('performance.slowRenderPercentage', 'Porcentaje de Renders Lentos')}
                      </span>
                      <span className="font-medium">
                        {globalStats.slowRenderPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={globalStats.slowRenderPercentage} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t('performance.totalComponents', 'Total Componentes')}
                    </span>
                    <Badge variant="outline">{globalStats.totalComponents}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#2d9561]" />
                    {t('performance.currentMetrics', 'Métricas Actuales')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">FPS</span>
                    <span className={`font-bold text-2xl ${getFPSColor(metrics.fps)}`}>
                      {metrics.fps}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t('performance.lastRender', 'Último Render')}
                    </span>
                    <span className="font-medium">
                      {metrics.lastRenderTime.toFixed(2)}ms
                    </span>
                  </div>

                  {metrics.memory && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {t('performance.memoryUsage', 'Uso de Memoria')}
                          </span>
                          <span className={`font-medium ${getMemoryColor(metrics.memory.usedPercentage)}`}>
                            {metrics.memory.usedPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={metrics.memory.usedPercentage} />
                      </div>

                      <div className="text-sm text-gray-600">
                        {formatBytes(metrics.memory.usedJSHeapSize)} / {formatBytes(metrics.memory.jsHeapSizeLimit)}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Componentes */}
          <TabsContent value="components">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#1a4d7a]" />
                  {t('performance.slowestComponents', 'Componentes Más Lentos')}
                </CardTitle>
                <CardDescription>
                  {t('performance.slowestComponentsDesc', 'Componentes ordenados por tiempo promedio de render')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {slowestComponents.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {slowestComponents.map((comp, index) => (
                        <div
                          key={comp.name}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-[#1a4d7a] text-white">
                                #{index + 1}
                              </Badge>
                              <span className="font-medium">{comp.name}</span>
                            </div>
                            <span className="text-lg font-bold text-yellow-600">
                              {comp.averageRenderTime.toFixed(2)}ms
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Renders</p>
                              <p className="font-medium">{comp.renderCount}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Time</p>
                              <p className="font-medium">
                                {comp.totalRenderTime.toFixed(2)}ms
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Slow Renders</p>
                              <p className="font-medium text-red-600">
                                {comp.slowRenders}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    {t('performance.noComponentData', 'Sin datos de componentes')}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Memoria */}
          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#1a4d7a]" />
                  {t('performance.memoryAnalysis', 'Análisis de Memoria')}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {metrics.memory ? (
                  <div className="space-y-6">
                    {/* Gráfico de uso */}
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">
                          {t('performance.heapUsage', 'Uso de Heap')}
                        </span>
                        <span className={`text-2xl font-bold ${getMemoryColor(metrics.memory.usedPercentage)}`}>
                          {metrics.memory.usedPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.memory.usedPercentage} className="h-4" />
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">
                          {t('performance.used', 'Usado')}
                        </p>
                        <p className="text-xl font-bold">
                          {formatBytes(metrics.memory.usedJSHeapSize)}
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">
                          {t('performance.total', 'Total')}
                        </p>
                        <p className="text-xl font-bold">
                          {formatBytes(metrics.memory.totalJSHeapSize)}
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">
                          {t('performance.limit', 'Límite')}
                        </p>
                        <p className="text-xl font-bold">
                          {formatBytes(metrics.memory.jsHeapSizeLimit)}
                        </p>
                      </div>
                    </div>

                    {/* Recomendaciones de memoria */}
                    {metrics.memory.usedPercentage > 80 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-900 mb-1">
                              {t('performance.highMemoryUsage', 'Alto Uso de Memoria')}
                            </p>
                            <p className="text-sm text-red-700">
                              {t('performance.memoryRecommendation', 'Considere limpiar caché, cerrar componentes no usados, o verificar memory leaks.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    {t('performance.memoryNotAvailable', 'Información de memoria no disponible en este navegador')}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Recomendaciones */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2d9561]" />
                  {t('performance.optimizationTips', 'Consejos de Optimización')}
                </CardTitle>
                <CardDescription>
                  {t('performance.tipsDesc', 'Recomendaciones basadas en las métricas actuales')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg flex items-start gap-3 ${
                        recommendation.includes('óptima')
                          ? 'bg-green-50 border-green-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      {recommendation.includes('óptima') ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={
                        recommendation.includes('óptima')
                          ? 'text-green-900'
                          : 'text-amber-900'
                      }>
                        {recommendation}
                      </p>
                    </div>
                  ))}

                  {/* Mejores prácticas */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      {t('performance.bestPractices', 'Mejores Prácticas')}
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Usar React.memo para componentes que no cambian frecuentemente</li>
                      <li>• Implementar lazy loading para componentes pesados</li>
                      <li>• Usar virtualización para listas largas</li>
                      <li>• Optimizar imágenes y assets</li>
                      <li>• Implementar code splitting en las rutas</li>
                      <li>• Usar debounce/throttle en búsquedas y eventos</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PerformanceModule;
