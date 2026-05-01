/**
 * Utilidades de Performance
 * 
 * Funciones y helpers para optimizar el rendimiento
 * de la aplicación.
 */

import React from 'react';

// ==================== MEMOIZATION ====================

/**
 * Cache simple para funciones
 */
export class FunctionCache<T extends (...args: any[]) => any> {
  private cache = new Map<string, ReturnType<T>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(fn: T, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const result = fn(...args);
    
    // Limpiar si excede el tamaño máximo
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, result);
    return result;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Crear función memoizada
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  maxSize: number = 100
): T {
  const cache = new FunctionCache<T>(maxSize);
  return ((...args: Parameters<T>) => cache.get(fn, ...args)) as T;
}

// ==================== LAZY LOADING ====================

/**
 * Crear componente lazy con retry
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries: number = 3
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        
        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Failed to load component');
  });
}

// ==================== BATCHING ====================

/**
 * Agrupar múltiples updates en uno solo
 */
export class BatchProcessor<T> {
  private batch: T[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private processor: (batch: T[]) => void;
  private delay: number;

  constructor(processor: (batch: T[]) => void, delay: number = 100) {
    this.processor = processor;
    this.delay = delay;
  }

  add(item: T): void {
    this.batch.push(item);

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  flush(): void {
    if (this.batch.length > 0) {
      this.processor([...this.batch]);
      this.batch = [];
    }
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

// ==================== IMAGE OPTIMIZATION ====================

/**
 * Lazy loading de imágenes
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images = new WeakMap<HTMLImageElement, string>();

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = this.images.get(img);
              
              if (src) {
                img.src = src;
                this.observer?.unobserve(img);
                this.images.delete(img);
              }
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );
    }
  }

  observe(img: HTMLImageElement, src: string): void {
    if (this.observer) {
      this.images.set(img, src);
      this.observer.observe(img);
    } else {
      // Fallback si no hay IntersectionObserver
      img.src = src;
    }
  }

  disconnect(): void {
    this.observer?.disconnect();
  }
}

export const lazyImageLoader = new LazyImageLoader();

// ==================== PERFORMANCE MARKS ====================

/**
 * Marcar inicio de medición
 */
export function markStart(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`);
  }
}

/**
 * Marcar fin y medir duración
 */
export function markEnd(name: string): number | null {
  if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
    performance.mark(`${name}-end`);
    
    try {
      const measure = performance.measure(
        name,
        `${name}-start`,
        `${name}-end`
      );
      
      return measure.duration;
    } catch (error) {
      return null;
    }
  }
  
  return null;
}

/**
 * Limpiar marcas
 */
export function clearMarks(name?: string): void {
  if (typeof performance !== 'undefined') {
    if (name) {
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    } else {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// ==================== RAF QUEUE ====================

/**
 * Cola de animación con requestAnimationFrame
 */
export class RAFQueue {
  private queue: Array<() => void> = [];
  private running = false;

  add(callback: () => void): void {
    this.queue.push(callback);
    
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(() => this.process());
    }
  }

  private process(): void {
    const callbacks = [...this.queue];
    this.queue = [];
    
    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in RAF callback:', error);
      }
    });
    
    if (this.queue.length > 0) {
      requestAnimationFrame(() => this.process());
    } else {
      this.running = false;
    }
  }

  clear(): void {
    this.queue = [];
    this.running = false;
  }
}

export const rafQueue = new RAFQueue();

// ==================== WEB VITALS ====================

/**
 * Medir Web Vitals (FCP, LCP, FID, CLS)
 */
export interface WebVitals {
  fcp: number | null;  // First Contentful Paint
  lcp: number | null;  // Largest Contentful Paint
  fid: number | null;  // First Input Delay
  cls: number | null;  // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export function measureWebVitals(): Promise<WebVitals> {
  return new Promise((resolve) => {
    const vitals: WebVitals = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null
    };

    // TTFB
    if (performance.timing) {
      vitals.ttfb = performance.timing.responseStart - performance.timing.requestStart;
    }

    // Performance Observer para las demás métricas
    if ('PerformanceObserver' in window) {
      try {
        // FCP
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
              fcpObserver.disconnect();
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            vitals.fid = (entry as any).processingStart - entry.startTime;
            fidObserver.disconnect();
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              vitals.cls = clsValue;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Resolver después de 10 segundos
        setTimeout(() => {
          fcpObserver.disconnect();
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          resolve(vitals);
        }, 10000);
      } catch (error) {
        resolve(vitals);
      }
    } else {
      resolve(vitals);
    }
  });
}

// ==================== BUNDLE SIZE ====================

/**
 * Estimar tamaño de bundle cargado
 */
export function estimateBundleSize(): number {
  if (!performance.getEntriesByType) return 0;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources
    .filter(r => r.name.endsWith('.js') || r.name.endsWith('.css'))
    .reduce((total, r) => total + (r.transferSize || 0), 0);
}

// ==================== MEMORY ====================

/**
 * Obtener información de memoria (Chrome only)
 */
export function getMemoryInfo(): {
  used: number;
  total: number;
  limit: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };
  }
  return null;
}

/**
 * Sugerir garbage collection (Chrome only, dev tools abiertos)
 */
export function suggestGC(): void {
  if ('gc' in window && typeof (window as any).gc === 'function') {
    (window as any).gc();
    console.log('🗑️ Garbage collection sugerida');
  }
}

// ==================== EXPORTACIONES ====================

export default {
  FunctionCache,
  memoize,
  lazyWithRetry,
  BatchProcessor,
  LazyImageLoader,
  lazyImageLoader,
  markStart,
  markEnd,
  clearMarks,
  RAFQueue,
  rafQueue,
  measureWebVitals,
  estimateBundleSize,
  getMemoryInfo,
  suggestGC
};
