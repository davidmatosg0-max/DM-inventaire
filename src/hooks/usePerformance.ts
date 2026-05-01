/**
 * Hook de Monitoreo de Performance
 * 
 * Proporciona métricas de rendimiento en tiempo real
 * y herramientas para detectar problemas de performance.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ==================== TIPOS ====================

export interface PerformanceMetrics {
  fps: number;
  memory: MemoryMetrics | null;
  renderTime: number;
  renderCount: number;
  slowRenders: number;
  lastRenderTime: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercentage: number;
}

export interface ComponentMetrics {
  name: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
}

// ==================== CONSTANTES ====================

const SLOW_RENDER_THRESHOLD = 16; // ms (60 FPS)
const FPS_UPDATE_INTERVAL = 1000; // ms
const MEMORY_UPDATE_INTERVAL = 2000; // ms

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook para monitorear performance del componente
 * 
 * @example
 * const metrics = usePerformance('MyComponent');
 * console.log('FPS:', metrics.fps);
 * console.log('Render time:', metrics.renderTime);
 */
export function usePerformance(componentName?: string): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: null,
    renderTime: 0,
    renderCount: 0,
    slowRenders: 0,
    lastRenderTime: 0
  });

  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef(0);
  const slowRendersRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);

  // Medir tiempo de render
  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    renderCountRef.current++;

    if (renderTime > SLOW_RENDER_THRESHOLD) {
      slowRendersRef.current++;
      
      if (componentName) {
        console.warn(
          `⚠️ Render lento en ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    }

    setMetrics(prev => ({
      ...prev,
      renderTime,
      renderCount: renderCountRef.current,
      slowRenders: slowRendersRef.current,
      lastRenderTime: renderTime
    }));
  });

  // Iniciar medición antes del render
  renderStartRef.current = performance.now();

  // Medir FPS
  useEffect(() => {
    let animationFrameId: number;
    let fpsIntervalId: NodeJS.Timeout;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      
      if (delta > 0) {
        const currentFPS = 1000 / delta;
        fpsRef.current = Math.round(currentFPS);
      }
      
      frameCountRef.current++;
      lastFrameTimeRef.current = now;
      
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    // Actualizar FPS en el estado cada segundo
    fpsIntervalId = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        fps: fpsRef.current
      }));
    }, FPS_UPDATE_INTERVAL);

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(fpsIntervalId);
    };
  }, []);

  // Medir memoria
  useEffect(() => {
    if (!('memory' in performance)) {
      return;
    }

    const updateMemory = () => {
      const memory = (performance as any).memory;
      
      if (memory) {
        const usedPercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        setMetrics(prev => ({
          ...prev,
          memory: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usedPercentage
          }
        }));

        // Advertir si el uso de memoria es alto
        if (usedPercentage > 90) {
          console.warn(`⚠️ Alto uso de memoria: ${usedPercentage.toFixed(1)}%`);
        }
      }
    };

    const intervalId = setInterval(updateMemory, MEMORY_UPDATE_INTERVAL);
    updateMemory();

    return () => clearInterval(intervalId);
  }, []);

  return metrics;
}

// ==================== HOOK DE RENDER TRACKING ====================

/**
 * Hook para rastrear renders de un componente
 * Solo en desarrollo
 * 
 * @example
 * useRenderTracking('MyComponent', { prop1, prop2 });
 */
export function useRenderTracking(
  componentName: string,
  props?: Record<string, any>
): void {
  const renderCount = useRef(0);
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    renderCount.current++;

    if (process.env.NODE_ENV === 'development') {
      console.group(`🔄 ${componentName} rendered (${renderCount.current})`);

      if (props && previousProps.current) {
        const changedProps: string[] = [];

        Object.keys(props).forEach(key => {
          if (props[key] !== previousProps.current?.[key]) {
            changedProps.push(key);
          }
        });

        if (changedProps.length > 0) {
          console.log('Props changed:', changedProps);
          changedProps.forEach(key => {
            console.log(
              `  ${key}:`,
              previousProps.current?.[key],
              '→',
              props[key]
            );
          });
        } else {
          console.warn('⚠️ Render without prop changes!');
        }
      }

      console.groupEnd();
    }

    previousProps.current = props;
  });
}

// ==================== HOOK DE EXPENSIVE CALCULATION ====================

/**
 * Hook para medir cálculos costosos
 * 
 * @example
 * const result = useExpensiveCalculation(
 *   () => computeExpensiveValue(data),
 *   [data],
 *   'ExpensiveCalculation'
 * );
 */
export function useExpensiveCalculation<T>(
  calculate: () => T,
  deps: React.DependencyList,
  name: string = 'Calculation'
): T {
  const [value, setValue] = useState<T>(() => {
    const start = performance.now();
    const result = calculate();
    const duration = performance.now() - start;

    if (duration > SLOW_RENDER_THRESHOLD) {
      console.warn(`⚠️ Cálculo lento: ${name} tomó ${duration.toFixed(2)}ms`);
    }

    return result;
  });

  useEffect(() => {
    const start = performance.now();
    const result = calculate();
    const duration = performance.now() - start;

    if (duration > SLOW_RENDER_THRESHOLD) {
      console.warn(`⚠️ Cálculo lento: ${name} tomó ${duration.toFixed(2)}ms`);
    }

    setValue(result);
  }, deps);

  return value;
}

// ==================== GESTIÓN GLOBAL DE MÉTRICAS ====================

class PerformanceManager {
  private static instance: PerformanceManager;
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private globalRenderCount = 0;
  private globalSlowRenders = 0;

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  recordRender(
    componentName: string,
    renderTime: number
  ): void {
    this.globalRenderCount++;

    if (renderTime > SLOW_RENDER_THRESHOLD) {
      this.globalSlowRenders++;
    }

    const existing = this.componentMetrics.get(componentName);

    if (existing) {
      const newRenderCount = existing.renderCount + 1;
      const newTotalTime = existing.totalRenderTime + renderTime;
      
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: newRenderCount,
        totalRenderTime: newTotalTime,
        averageRenderTime: newTotalTime / newRenderCount,
        slowRenders: renderTime > SLOW_RENDER_THRESHOLD
          ? existing.slowRenders + 1
          : existing.slowRenders
      });
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        slowRenders: renderTime > SLOW_RENDER_THRESHOLD ? 1 : 0
      });
    }
  }

  getComponentMetrics(componentName: string): ComponentMetrics | null {
    return this.componentMetrics.get(componentName) || null;
  }

  getAllMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }

  getTopSlowestComponents(limit: number = 10): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
  }

  getGlobalStats() {
    return {
      totalComponents: this.componentMetrics.size,
      totalRenders: this.globalRenderCount,
      totalSlowRenders: this.globalSlowRenders,
      slowRenderPercentage: this.globalRenderCount > 0
        ? (this.globalSlowRenders / this.globalRenderCount) * 100
        : 0
    };
  }

  reset(): void {
    this.componentMetrics.clear();
    this.globalRenderCount = 0;
    this.globalSlowRenders = 0;
  }

  printReport(): void {
    console.group('📊 Performance Report');
    
    const stats = this.getGlobalStats();
    console.log('Global Stats:', stats);
    
    console.log('\nTop 10 Slowest Components:');
    const slowest = this.getTopSlowestComponents(10);
    console.table(slowest);
    
    console.groupEnd();
  }
}

export const performanceManager = PerformanceManager.getInstance();

// ==================== HOOK PARA TRACKING CON MANAGER ====================

/**
 * Hook para registrar métricas en el manager global
 * 
 * @example
 * usePerformanceTracking('MyComponent');
 */
export function usePerformanceTracking(componentName: string): void {
  const renderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    performanceManager.recordRender(componentName, renderTime);
  });

  renderStart.current = performance.now();
}

// ==================== UTILIDADES ====================

/**
 * Formatear bytes a formato legible
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Obtener color según FPS
 */
export function getFPSColor(fps: number): string {
  if (fps >= 55) return 'text-green-600';
  if (fps >= 30) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Obtener color según uso de memoria
 */
export function getMemoryColor(percentage: number): string {
  if (percentage < 50) return 'text-green-600';
  if (percentage < 80) return 'text-yellow-600';
  return 'text-red-600';
}

// ==================== EXPORTACIONES ====================

export default {
  usePerformance,
  useRenderTracking,
  useExpensiveCalculation,
  usePerformanceTracking,
  performanceManager,
  formatBytes,
  getFPSColor,
  getMemoryColor
};
