export type PendingEntrepotQuickAction = 'open-scanner' | 'open-new-entry';

const PENDING_ENTREPOT_QUICK_ACTION_KEY = 'dm_pending_entrepot_quick_action';

export function savePendingEntrepotQuickAction(action: PendingEntrepotQuickAction): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(PENDING_ENTREPOT_QUICK_ACTION_KEY, action);
}

export function readPendingEntrepotQuickAction(): PendingEntrepotQuickAction | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const action = window.sessionStorage.getItem(PENDING_ENTREPOT_QUICK_ACTION_KEY);
  if (action === 'open-scanner' || action === 'open-new-entry') {
    return action;
  }

  return null;
}

export function clearPendingEntrepotQuickAction(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(PENDING_ENTREPOT_QUICK_ACTION_KEY);
}