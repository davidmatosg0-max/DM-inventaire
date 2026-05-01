/**
 * Monitor de Performance Flotante
 * 
 * Panel flotante que muestra métricas de performance en tiempo real.
 * Solo se muestra en desarrollo o cuando se activa.
 */

import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  usePerformance,
  formatBytes,
  getFPSColor,
  getMemoryColor,
  performanceManager
} from '../../hooks/usePerformance';

export interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  alwaysShow?: boolean;
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  alwaysShow = false
}: PerformanceMonitorProps) {
  const [isOpen, setIsOpen] = useState(alwaysShow);
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = usePerformance('PerformanceMonitor');

  // No mostrar si no está habilitado
  if (!enabled && !alwaysShow) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const globalStats = performanceManager.getGlobalStats();
  const slowestComponents = performanceManager.getTopSlowestComponents(5);

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {!isOpen ? (
        // Botón minimizado
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          title="Abrir Performance Monitor"
        >
          <Activity className="w-5 h-5" />
        </button>
      ) : (
        // Panel completo
        <div className="bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden min-w-[280px]">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-sm">Performance</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="p-4 space-y-3">
            {/* FPS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">FPS</span>
              </div>
              <span className={`font-bold text-lg ${getFPSColor(metrics.fps)}`}>
                {metrics.fps}
              </span>
            </div>

            {/* Render Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Render</span>
              </div>
              <span className="text-sm">
                {metrics.lastRenderTime.toFixed(2)}ms
              </span>
            </div>

            {/* Memoria */}
            {metrics.memory && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400">Memory</span>
                  </div>
                  <span className={`text-sm ${getMemoryColor(metrics.memory.usedPercentage)}`}>
                    {metrics.memory.usedPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatBytes(metrics.memory.usedJSHeapSize)} / {formatBytes(metrics.memory.jsHeapSizeLimit)}
                </div>
                
                {/* Barra de progreso */}
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      metrics.memory.usedPercentage < 50
                        ? 'bg-green-500'
                        : metrics.memory.usedPercentage < 80
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.memory.usedPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Renders */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Renders</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-800 text-white border-gray-600">
                  {metrics.renderCount}
                </Badge>
                {metrics.slowRenders > 0 && (
                  <Badge variant="outline" className="bg-red-900 text-red-200 border-red-700">
                    {metrics.slowRenders} slow
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats globales */}
            {isExpanded && (
              <>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-semibold">Global Stats</span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Components</span>
                      <span>{globalStats.totalComponents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Renders</span>
                      <span>{globalStats.totalRenders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Slow Renders</span>
                      <span className="text-red-400">
                        {globalStats.totalSlowRenders} ({globalStats.slowRenderPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Componentes más lentos */}
                {slowestComponents.length > 0 && (
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="text-xs font-semibold mb-2">
                      Slowest Components
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {slowestComponents.map((comp, index) => (
                        <div
                          key={comp.name}
                          className="flex items-center justify-between text-xs p-1 hover:bg-gray-800 rounded"
                        >
                          <span className="text-gray-400 truncate flex-1">
                            {index + 1}. {comp.name}
                          </span>
                          <span className="text-yellow-400 ml-2">
                            {comp.averageRenderTime.toFixed(2)}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      performanceManager.printReport();
                      console.log('📊 Performance report printed to console');
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600 text-xs"
                  >
                    Print Report
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Footer con advertencias */}
          {(metrics.fps < 30 || (metrics.memory && metrics.memory.usedPercentage > 80)) && (
            <div className="bg-red-900/30 border-t border-red-800 px-4 py-2">
              <div className="flex items-center gap-2 text-xs text-red-200">
                <Activity className="w-3 h-3" />
                {metrics.fps < 30 && <span>Low FPS detected</span>}
                {metrics.memory && metrics.memory.usedPercentage > 80 && (
                  <span>High memory usage</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== HOOK PARA HABILITAR/DESHABILITAR ====================

/**
 * Hook para controlar el monitor de performance
 */
export function usePerformanceMonitor() {
  const [enabled, setEnabled] = useState(false);

  // Atajos de teclado
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Shift + P para toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setEnabled(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { enabled, setEnabled };
}

export default PerformanceMonitor;
