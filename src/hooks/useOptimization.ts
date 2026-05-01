/**
 * Hooks de Optimización de Performance
 * 
 * Proporciona herramientas para optimizar el rendimiento
 * de la aplicación mediante debounce, throttle y memoización.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ==================== DEBOUNCE ====================

/**
 * Hook para debounce de valores
 * Útil para búsquedas y filtros
 * 
 * @example
 * const searchTerm = useDebounce(inputValue, 500);
 * useEffect(() => {
 *   // Búsqueda con searchTerm debounced
 * }, [searchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para debounce de funciones
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback(
 *   (query) => fetchResults(query),
 *   500
 * );
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// ==================== THROTTLE ====================

/**
 * Hook para throttle de funciones
 * Útil para eventos de scroll y resize
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('Scrolling...');
 * }, 100);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, delay - (now - lastRan.current));
      }
    },
    [callback, delay]
  );
}

// ==================== LAZY STATE ====================

/**
 * Hook para estado lazy
 * Solo se calcula cuando es necesario
 * 
 * @example
 * const expensiveValue = useLazyState(() => computeExpensiveValue(), [dep]);
 */
export function useLazyState<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// ==================== PREVIOUS VALUE ====================

/**
 * Hook para obtener el valor anterior
 * Útil para comparaciones
 * 
 * @example
 * const previousCount = usePrevious(count);
 * if (count > previousCount) {
 *   console.log('Incrementó');
 * }
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ==================== MOUNTED ====================

/**
 * Hook para verificar si el componente está montado
 * Previene actualizaciones de estado en componentes desmontados
 * 
 * @example
 * const isMounted = useIsMounted();
 * 
 * const fetchData = async () => {
 *   const data = await api.fetch();
 *   if (isMounted()) {
 *     setState(data);
 *   }
 * };
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}

// ==================== UPDATE EFFECT ====================

/**
 * Hook que solo ejecuta el effect en updates, no en mount
 * 
 * @example
 * useUpdateEffect(() => {
 *   console.log('Count changed:', count);
 * }, [count]);
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
}

// ==================== INTERVAL ====================

/**
 * Hook para setInterval declarativo
 * 
 * @example
 * useInterval(() => {
 *   setCount(c => c + 1);
 * }, 1000);
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

// ==================== MEDIA QUERY ====================

/**
 * Hook para media queries
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ==================== LOCAL STORAGE ====================

/**
 * Hook para localStorage con sync
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// ==================== WINDOW SIZE ====================

/**
 * Hook para tamaño de ventana con throttle
 * 
 * @example
 * const { width, height } = useWindowSize();
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}

// ==================== SCROLL POSITION ====================

/**
 * Hook para posición de scroll con throttle
 * 
 * @example
 * const { x, y } = useScrollPosition();
 */
export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setPosition({
            x: window.scrollX,
            y: window.scrollY
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

// ==================== ASYNC ====================

/**
 * Hook para manejar operaciones asíncronas
 * 
 * @example
 * const { data, loading, error } = useAsync(() => fetchData(), []);
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useIsMounted();

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      if (isMounted()) {
        setData(result);
      }
    } catch (err) {
      if (isMounted()) {
        setError(err as Error);
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, execute };
}

// ==================== EXPORTACIONES ====================

export default {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useLazyState,
  usePrevious,
  useIsMounted,
  useUpdateEffect,
  useInterval,
  useMediaQuery,
  useLocalStorage,
  useWindowSize,
  useScrollPosition,
  useAsync
};
