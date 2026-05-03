export type PendingQrNavigationTarget = 'inventario' | 'comandas';
export type PendingQrNavigationType = 'producto' | 'comanda';

export interface PendingQrNavigation {
  targetPage: PendingQrNavigationTarget;
  qrType: PendingQrNavigationType;
  rawData: unknown;
  action?: string;
  createdAt: number;
}

const PENDING_QR_NAVIGATION_KEY = 'banqueAlimentaire_pendingQrNavigation';

export function savePendingQrNavigation(payload: Omit<PendingQrNavigation, 'createdAt'>): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(
    PENDING_QR_NAVIGATION_KEY,
    JSON.stringify({
      ...payload,
      createdAt: Date.now(),
    }),
  );
}

export function readPendingQrNavigation(): PendingQrNavigation | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = sessionStorage.getItem(PENDING_QR_NAVIGATION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingQrNavigation;
  } catch {
    sessionStorage.removeItem(PENDING_QR_NAVIGATION_KEY);
    return null;
  }
}

export function clearPendingQrNavigation(): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(PENDING_QR_NAVIGATION_KEY);
}

export function navigateToQrPage(page: PendingQrNavigationTarget): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  window.location.href = url.toString();
}