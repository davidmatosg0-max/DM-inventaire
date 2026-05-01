/**
 * Componente de Lista Virtualizada
 * 
 * Renderiza solo los items visibles en pantalla para optimizar
 * el rendimiento con listas grandes.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useScrollPosition, useWindowSize, useThrottle } from '../../hooks/useOptimization';

// ==================== TIPOS ====================

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

// ==================== COMPONENTE ====================

/**
 * Lista virtualizada que solo renderiza items visibles
 * 
 * @example
 * <VirtualList
 *   items={products}
 *   itemHeight={80}
 *   renderItem={(product) => <ProductCard product={product} />}
 *   overscan={3}
 * />
 */
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const { height: windowHeight } = useWindowSize();

  // Calcular items visibles
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    setVisibleRange({ start: startIndex, end: endIndex });

    // Detectar fin de lista
    if (onEndReached) {
      const scrollHeight = container.scrollHeight;
      const scrollPercentage = (scrollTop + containerHeight) / scrollHeight;
      
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [items.length, itemHeight, overscan, onEndReached, endReachedThreshold]);

  // Throttle del scroll
  const handleScroll = useThrottle(calculateVisibleRange, 50);

  // Recalcular cuando cambian las dependencias
  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange, windowHeight]);

  // Items visibles
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  // Altura total del contenedor
  const totalHeight = items.length * itemHeight;

  // Offset del primer item visible
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== VARIANTE GRID ====================

export interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  columns: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
}

/**
 * Grid virtualizado
 * 
 * @example
 * <VirtualGrid
 *   items={products}
 *   itemWidth={200}
 *   itemHeight={250}
 *   columns={4}
 *   renderItem={(product) => <ProductCard product={product} />}
 * />
 */
export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  columns,
  renderItem,
  gap = 16,
  overscan = 2,
  className = ''
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const { height: windowHeight } = useWindowSize();

  // Calcular número de filas
  const rows = Math.ceil(items.length / columns);
  const rowHeight = itemHeight + gap;

  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      rows,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    const startIndex = startRow * columns;
    const endIndex = Math.min(items.length, endRow * columns);

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [items.length, rowHeight, rows, columns, overscan]);

  const handleScroll = useThrottle(calculateVisibleRange, 50);

  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange, windowHeight]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = rows * rowHeight;
  const startRow = Math.floor(visibleRange.start / columns);
  const offsetY = startRow * rowHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
            gap: `${gap}px`
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={visibleRange.start + index}>
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== INFINITE SCROLL ====================

export interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  className?: string;
  loader?: React.ReactNode;
}

/**
 * Lista con scroll infinito
 * 
 * @example
 * <InfiniteScroll
 *   items={products}
 *   renderItem={(product) => <ProductCard product={product} />}
 *   loadMore={fetchMoreProducts}
 *   hasMore={hasMore}
 *   loading={loading}
 * />
 */
export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading = false,
  threshold = 0.8,
  className = '',
  loader
}: InfiniteScrollProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useThrottle(() => {
    if (!containerRef.current || !hasMore || loading || loadingRef.current) {
      return;
    }

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const containerHeight = container.clientHeight;

    const scrollPercentage = (scrollTop + containerHeight) / scrollHeight;

    if (scrollPercentage >= threshold) {
      loadingRef.current = true;
      loadMore().finally(() => {
        loadingRef.current = false;
      });
    }
  }, 100);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
      
      {loading && (
        <div className="p-4 text-center">
          {loader || (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#1a4d7a] border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Chargement...</span>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="p-4 text-center text-gray-500">
          Fin de la liste
        </div>
      )}
    </div>
  );
}

// ==================== EXPORTACIONES ====================

export default VirtualList;
