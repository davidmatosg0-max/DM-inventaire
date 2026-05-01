import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Hook para debouncing de valores
 * Útil para búsquedas y filtros
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
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
 * Hook para throttling de funciones
 * Útil para eventos que se disparan muy frecuentemente
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook para detectar si un componente está montado
 * Evita actualizaciones de estado en componentes desmontados
 */
export function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * Hook para memoización de valores costosos con dependencias
 */
export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

/**
 * Hook para paginación eficiente
 */
export function usePaginacion<T>(items: T[], itemsPorPagina: number = 10) {
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(items.length / itemsPorPagina);

  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return items.slice(inicio, fin);
  }, [items, paginaActual, itemsPorPagina]);

  const irAPagina = useCallback((pagina: number) => {
    setPaginaActual(Math.max(1, Math.min(pagina, totalPaginas)));
  }, [totalPaginas]);

  const siguiente = useCallback(() => {
    irAPagina(paginaActual + 1);
  }, [paginaActual, irAPagina]);

  const anterior = useCallback(() => {
    irAPagina(paginaActual - 1);
  }, [paginaActual, irAPagina]);

  const reset = useCallback(() => {
    setPaginaActual(1);
  }, []);

  return {
    itemsPaginados,
    paginaActual,
    totalPaginas,
    irAPagina,
    siguiente,
    anterior,
    reset,
    hayAnterior: paginaActual > 1,
    haySiguiente: paginaActual < totalPaginas,
  };
}

/**
 * Hook para filtrado y búsqueda optimizada
 */
export function useFiltroOptimizado<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  additionalFilters?: (item: T) => boolean
) {
  const debouncedSearch = useDebounce(searchTerm, 300);

  return useMemo(() => {
    let filtered = items;

    // Aplicar búsqueda
    if (debouncedSearch) {
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(debouncedSearch.toLowerCase());
          }
          return false;
        })
      );
    }

    // Aplicar filtros adicionales
    if (additionalFilters) {
      filtered = filtered.filter(additionalFilters);
    }

    return filtered;
  }, [items, debouncedSearch, searchFields, additionalFilters]);
}

/**
 * Hook para ordenamiento eficiente
 */
export function useOrdenamiento<T>(
  items: T[],
  defaultKey: keyof T,
  defaultDirection: 'asc' | 'desc' = 'asc'
) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  }>({
    key: defaultKey,
    direction: defaultDirection,
  });

  const itemsOrdenados = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [items, sortConfig]);

  const ordenarPor = useCallback((key: keyof T) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  return {
    itemsOrdenados,
    sortConfig,
    ordenarPor,
  };
}

/**
 * Hook para scroll infinito
 */
export function useScrollInfinito(
  callback: () => void,
  hasMore: boolean,
  threshold: number = 100
) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < threshold && hasMore) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, hasMore, threshold]);
}

/**
 * Hook para detección de intersección (lazy loading de imágenes)
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Hook para localStorage con sincronización
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Hook para async data fetching con cache
 */
export function useAsyncData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunction();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error, refetch: fetchFunction };
}

/**
 * Hook para manejar formularios de manera optimizada
 */
export function useFormularioOptimizado<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({} as Record<keyof T, boolean>);
    setErrors({});
  }, [initialValues]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    reset,
    setFieldError,
    setValues,
  };
}
