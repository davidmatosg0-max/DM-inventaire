import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de loading personalizado
 */
export function LoadingFallback({ mensaje = 'Cargando...' }: { mensaje?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <Loader2 className="w-12 h-12 text-[#1E73BE] animate-spin mb-4" />
      <p className="text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
        {mensaje}
      </p>
    </div>
  );
}

/**
 * Loading para páginas completas
 */
export function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F4F4]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <Loader2 className="w-16 h-16 text-[#1E73BE] animate-spin mx-auto mb-4" />
        <h2
          className="text-xl text-[#333333] mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
        >
          Cargando módulo...
        </h2>
        <p className="text-[#666666] text-sm">Por favor espera un momento</p>
      </div>
    </div>
  );
}

/**
 * HOC para lazy loading con fallback personalizado
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * HOC para lazy loading de páginas
 */
export function lazyLoadPage<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return lazyLoadComponent(importFunc, <PageLoadingFallback />);
}

// ===== COMPONENTES LAZY CARGADOS =====

// Páginas principales (ejemplo de uso)
export const LazyDashboard = lazy(() =>
  import('../components/pages/Dashboard').then((module) => ({ default: module.Dashboard }))
);

export const LazyInventario = lazy(() =>
  import('../components/pages/Inventario').then((module) => ({ default: module.Inventario }))
);

export const LazyComandas = lazy(() =>
  import('../components/pages/Comandas').then((module) => ({ default: module.Comandas }))
);

export const LazyOrganismos = lazy(() =>
  import('../components/pages/Organismos').then((module) => ({ default: module.Organismos }))
);

export const LazyTransporte = lazy(() =>
  import('../components/pages/Transporte').then((module) => ({ default: module.Transporte }))
);

export const LazyReportes = lazy(() =>
  import('../components/pages/Reportes').then((module) => ({ default: module.Reportes }))
);

export const LazyUsuarios = lazy(() =>
  import('../components/pages/Usuarios').then((module) => ({ default: module.Usuarios }))
);

export const LazyUsuariosInternos = lazy(() =>
  import('../components/pages/UsuariosInternos').then((module) => ({
    default: module.UsuariosInternos,
  }))
);

export const LazyIDDigital = lazy(() =>
  import('../components/pages/IDDigital').then((module) => ({ default: module.IDDigital }))
);

export const LazyConfiguracion = lazy(() =>
  import('../components/pages/Configuracion').then((module) => ({
    default: module.Configuracion,
  }))
);

export const LazyEtiquetas = lazy(() =>
  import('../components/pages/Etiquetas').then((module) => ({ default: module.Etiquetas }))
);

export const LazyPanelMarca = lazy(() =>
  import('../components/pages/PanelMarca').then((module) => ({ default: module.PanelMarca }))
);

/**
 * Wrapper para lazy components con Suspense
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return <Suspense fallback={fallback || <LoadingFallback />}>{children}</Suspense>;
}
