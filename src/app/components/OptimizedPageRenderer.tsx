import React, { Suspense, memo, useRef, useEffect } from 'react';

interface OptimizedPageRendererProps {
  pageId: string;
  children: React.ReactNode;
}

function PageLoadingState() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-[#666666]">
      Chargement...
    </div>
  );
}

/**
 * Renderer optimisé qui garde les pages montées mais cachées
 * pour éviter les re-montages coûteux lors des changements de page
 */
export const OptimizedPageRenderer = memo(function OptimizedPageRenderer({
  pageId,
  children
}: OptimizedPageRendererProps) {
  const mountedPagesRef = useRef<Set<string>>(new Set());
  const previousPageRef = useRef<string>(pageId);

  useEffect(() => {
    mountedPagesRef.current.add(pageId);
    previousPageRef.current = pageId;
  }, [pageId]);

  return (
    <Suspense fallback={<PageLoadingState />}>
      {children}
    </Suspense>
  );
});

interface CachedPageContainerProps {
  pageId: string;
  isActive: boolean;
  children: React.ReactNode;
}

/**
 * Contenedor que mantiene las páginas montadas pero ocultas
 * usando display:none en lugar de desmontar
 */
export const CachedPageContainer = memo(function CachedPageContainer({
  pageId,
  isActive,
  children
}: CachedPageContainerProps) {
  return (
    <div
      data-page-id={pageId}
      style={{
        display: isActive ? 'block' : 'none',
        width: '100%',
        height: '100%'
      }}
    >
      {children}
    </div>
  );
});
