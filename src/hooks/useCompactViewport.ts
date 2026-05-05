import { useEffect, useRef, useState, type DependencyList } from 'react';

type CompactViewportContext = {
  width: number;
  height: number;
  isCompact: boolean;
};

type CompactViewportState = {
  isCompactViewport: boolean;
  viewportZoom: number;
};

type UseCompactViewportOptions = {
  compactWidth?: number;
  compactHeight?: number;
  deps?: DependencyList;
  resolveZoom: (context: CompactViewportContext) => number;
};

function buildViewportState(
  compactWidth: number,
  compactHeight: number,
  resolveZoom: (context: CompactViewportContext) => number,
): CompactViewportState {
  if (typeof window === 'undefined') {
    return {
      isCompactViewport: false,
      viewportZoom: 1,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isCompact = width < compactWidth || height < compactHeight;
  const zoom = resolveZoom({ width, height, isCompact });

  return {
    isCompactViewport: isCompact,
    viewportZoom: Number.isFinite(zoom) && zoom > 0 ? zoom : 1,
  };
}

export function useCompactViewport({
  compactWidth = 1100,
  compactHeight = 760,
  deps = [],
  resolveZoom,
}: UseCompactViewportOptions): CompactViewportState {
  const resolveZoomRef = useRef(resolveZoom);
  resolveZoomRef.current = resolveZoom;

  const [state, setState] = useState<CompactViewportState>(() =>
    buildViewportState(compactWidth, compactHeight, resolveZoom)
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateViewport = () => {
      setState(buildViewportState(compactWidth, compactHeight, resolveZoomRef.current));
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, [compactWidth, compactHeight, ...deps]);

  return state;
}