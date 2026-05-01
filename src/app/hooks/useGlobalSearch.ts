import { useEffect, useState, useCallback } from 'react';
import { obtenerProductos } from '../utils/productStorage';
import { obtenerComandas } from '../utils/comandaStorage';
import { obtenerOrganismos } from '../utils/organismosStorage';
import { obtenerRutas } from '../utils/transporteLogic';
import { obtenerContactosDepartamento } from '../utils/contactosDepartamentoStorage';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: 'productos' | 'comandas' | 'organismos' | 'transporte' | 'contactos';
  icon?: string;
  data?: any;
  route?: string;
}

interface UseGlobalSearchOptions {
  minChars?: number;
  debounceMs?: number;
  maxResults?: number;
}

/**
 * Hook para búsqueda global en todo el sistema
 */
export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const {
    minChars = 2,
    debounceMs = 300,
    maxResults = 50,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Función de búsqueda en productos
  const searchProducts = useCallback((searchQuery: string): SearchResult[] => {
    const productos = obtenerProductos();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return productos
      .filter((producto) => {
        const nombre = producto.nombre?.toLowerCase() || '';
        const categoria = producto.categoria?.toLowerCase() || '';
        const barcode = producto.codigoBarras?.toLowerCase() || '';
        
        return (
          nombre.includes(normalizedQuery) ||
          categoria.includes(normalizedQuery) ||
          barcode.includes(normalizedQuery)
        );
      })
      .map((producto) => {
        // Construir información detallada del producto
        const stock = producto.stock || 0;
        const unidad = producto.unidad || 'unités';
        const temperatura = producto.temperatura || 'N/A';
        const peso = producto.peso ? `${producto.peso} kg` : '';
        
        const description = peso 
          ? `Stock: ${stock} ${unidad} • ${temperatura} • ${peso}`
          : `Stock: ${stock} ${unidad} • ${temperatura}`;
        
        return {
          id: `producto-${producto.id}`,
          title: producto.nombre,
          subtitle: producto.categoria || 'Sin categoría',
          description,
          category: 'productos' as const,
          icon: '📦',
          data: producto,
          route: 'inventario',
        };
      })
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en comandas
  const searchOrders = useCallback((searchQuery: string): SearchResult[] => {
    const comandas = obtenerComandas();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return comandas
      .filter((comanda) => {
        const numero = comanda.numero?.toLowerCase() || '';
        const organismo = comanda.nombreOrganismo?.toLowerCase() || '';
        const estado = comanda.estado?.toLowerCase() || '';
        
        return (
          numero.includes(normalizedQuery) ||
          organismo.includes(normalizedQuery) ||
          estado.includes(normalizedQuery)
        );
      })
      .map((comanda) => {
        // Construir información detallada de la comanda
        const fecha = comanda.fecha 
          ? new Date(comanda.fecha).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })
          : 'N/A';
        
        const totalProductos = comanda.productos?.length || 0;
        const estadoLabel = comanda.estado || 'Pendiente';
        
        const description = `État: ${estadoLabel} • ${fecha} • ${totalProductos} produit${totalProductos !== 1 ? 's' : ''}`;
        
        return {
          id: `comanda-${comanda.id}`,
          title: `Commande #${comanda.numero}`,
          subtitle: comanda.nombreOrganismo || 'Organisme non défini',
          description,
          category: 'comandas' as const,
          icon: '📋',
          data: comanda,
          route: 'comandas',
        };
      })
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en organismos
  const searchOrganisms = useCallback((searchQuery: string): SearchResult[] => {
    const organismos = obtenerOrganismos();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return organismos
      .filter((organismo) => {
        const nombre = organismo.nombre?.toLowerCase() || '';
        const tipo = organismo.tipo?.toLowerCase() || '';
        const responsable = organismo.responsable?.toLowerCase() || '';
        const ciudad = organismo.ciudad?.toLowerCase() || '';
        const telefono = organismo.telefono?.toLowerCase() || '';
        const email = organismo.email?.toLowerCase() || '';
        
        return (
          nombre.includes(normalizedQuery) ||
          tipo.includes(normalizedQuery) ||
          responsable.includes(normalizedQuery) ||
          ciudad.includes(normalizedQuery) ||
          telefono.includes(normalizedQuery) ||
          email.includes(normalizedQuery)
        );
      })
      .map((organismo) => {
        // Construir información detallada del organismo
        const responsable = organismo.responsable || 'N/A';
        const ciudad = organismo.ciudad || 'N/A';
        const beneficiarios = organismo.beneficiarios || 0;
        const telefono = organismo.telefono || '';
        
        const description = telefono
          ? `${responsable} • ${ciudad} • ${beneficiarios} bénéficiaires • ${telefono}`
          : `${responsable} • ${ciudad} • ${beneficiarios} bénéficiaires`;
        
        return {
          id: `organismo-${organismo.id}`,
          title: organismo.nombre,
          subtitle: organismo.tipo || 'Type non défini',
          description,
          category: 'organismos' as const,
          icon: '🏢',
          data: organismo,
          route: 'organismos',
        };
      })
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en transporte
  const searchTransport = useCallback((searchQuery: string): SearchResult[] => {
    const rutas = obtenerRutas();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return rutas
      .filter((ruta) => {
        const numero = ruta.numero?.toLowerCase() || '';
        const conductor = ruta.conductor?.toLowerCase() || '';
        const destino = ruta.destino?.toLowerCase() || '';
        const vehiculo = ruta.vehiculo?.toLowerCase() || '';
        const estado = ruta.estado?.toLowerCase() || '';
        
        return (
          numero.includes(normalizedQuery) ||
          conductor.includes(normalizedQuery) ||
          destino.includes(normalizedQuery) ||
          vehiculo.includes(normalizedQuery) ||
          estado.includes(normalizedQuery)
        );
      })
      .map((ruta) => {
        // Construir información detallada de la ruta
        const conductor = ruta.conductor || 'N/A';
        const vehiculo = ruta.vehiculo || 'N/A';
        const estado = ruta.estado || 'Planifiée';
        const fecha = ruta.fecha 
          ? new Date(ruta.fecha).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: 'short' 
            })
          : '';
        
        const description = fecha
          ? `${conductor} • ${vehiculo} • ${estado} • ${fecha}`
          : `${conductor} • ${vehiculo} • ${estado}`;
        
        return {
          id: `ruta-${ruta.id}`,
          title: `Route #${ruta.numero}`,
          subtitle: ruta.destino || 'Destination non définie',
          description,
          category: 'transporte' as const,
          icon: '🚛',
          data: ruta,
          route: 'transporte',
        };
      })
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Función de búsqueda en contactos
  const searchContacts = useCallback((searchQuery: string): SearchResult[] => {
    const contactos = obtenerContactosDepartamento();
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return contactos
      .filter((contacto) => {
        // Los contactos usan 'nombre' y 'apellido' como campos principales
        const nombreCompleto = `${contacto.nombre || ''} ${contacto.apellido || ''}`.toLowerCase();
        const email = contacto.email?.toLowerCase() || '';
        const telefono = contacto.telefono?.toLowerCase() || '';
        const cargo = contacto.cargo?.toLowerCase() || '';
        const nombreEmpresa = contacto.nombreEmpresa?.toLowerCase() || '';
        const numeroArchivo = contacto.numeroArchivo?.toLowerCase() || '';
        
        return (
          nombreCompleto.includes(normalizedQuery) ||
          email.includes(normalizedQuery) ||
          telefono.includes(normalizedQuery) ||
          cargo.includes(normalizedQuery) ||
          nombreEmpresa.includes(normalizedQuery) ||
          numeroArchivo.includes(normalizedQuery)
        );
      })
      .map((contacto) => {
        // Construir el título mostrando el nombre completo
        const nombreCompleto = `${contacto.nombre || ''} ${contacto.apellido || ''}`.trim();
        const title = nombreCompleto || contacto.nombreEmpresa || 'Contact';
        
        // Construir subtitle mostrando número de archivo y cargo
        const numeroArchivo = contacto.numeroArchivo || '';
        const cargo = contacto.cargo || contacto.tipo || 'Contact';
        const subtitle = numeroArchivo ? `${numeroArchivo} • ${cargo}` : cargo;
        
        // Construir description con email y teléfono
        const email = contacto.email || 'N/A';
        const telefono = contacto.telefono || 'N/A';
        const description = `${email} • ${telefono}`;
        
        return {
          id: `contacto-${contacto.id}`,
          title,
          subtitle,
          description,
          category: 'contactos' as const,
          icon: '👤',
          data: contacto,
          route: 'contactos-almacen',
        };
      })
      .slice(0, Math.floor(maxResults / 5));
  }, [maxResults]);

  // Ejecutar búsqueda
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minChars) {
        setResults([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);

      try {
        // Ejecutar todas las búsquedas en paralelo
        const [productos, comandas, organismos, transporte, contactos] = await Promise.all([
          Promise.resolve(searchProducts(searchQuery)),
          Promise.resolve(searchOrders(searchQuery)),
          Promise.resolve(searchOrganisms(searchQuery)),
          Promise.resolve(searchTransport(searchQuery)),
          Promise.resolve(searchContacts(searchQuery)),
        ]);

        const allResults = [
          ...productos,
          ...comandas,
          ...organismos,
          ...transporte,
          ...contactos,
        ];

        // Ordenar por relevancia (puedes mejorar esto con un algoritmo de scoring)
        const sortedResults = allResults.sort((a, b) => {
          // Priorizar coincidencias exactas en el título
          const aExact = a.title.toLowerCase() === searchQuery.toLowerCase();
          const bExact = b.title.toLowerCase() === searchQuery.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          // Priorizar coincidencias al inicio del título
          const aStarts = a.title.toLowerCase().startsWith(searchQuery.toLowerCase());
          const bStarts = b.title.toLowerCase().startsWith(searchQuery.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;

          return 0;
        });

        setResults(sortedResults.slice(0, maxResults));
        setTotalResults(sortedResults.length);
      } catch (error) {
        console.error('Error en búsqueda global:', error);
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    [minChars, maxResults, searchProducts, searchOrders, searchOrganisms, searchTransport, searchContacts]
  );

  // Debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, performSearch]);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
  }, []);

  // Agrupar resultados por categoría
  const resultsByCategory = useCallback(() => {
    const grouped: Record<string, SearchResult[]> = {
      productos: [],
      comandas: [],
      organismos: [],
      transporte: [],
      contactos: [],
    };

    results.forEach((result) => {
      grouped[result.category].push(result);
    });

    return grouped;
  }, [results]);

  return {
    query,
    setQuery,
    results,
    loading,
    totalResults,
    clearSearch,
    resultsByCategory: resultsByCategory(),
  };
}

/**
 * Hook para gestionar el shortcut Ctrl+K / Cmd+K
 */
export function useSearchShortcut(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detectar Ctrl+K (Windows/Linux) o Cmd+K (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        callback();
      }

      // También ESC para cerrar
      if (event.key === 'Escape') {
        // Manejar en el componente
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}