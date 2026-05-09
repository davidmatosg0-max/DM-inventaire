import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
const APP_STORAGE_TABLE = 'app_storage';

export const CRITICAL_REMOTE_STORAGE_KEYS = [
  'organismos_banco_alimentos',
  'banco_alimentos_productos',
  'banco_alimentos_entradas_inventario',
  'banco_alimentos_movimientos',
  'banco_alimentos_comandas',
] as const;

type CriticalStorageKey = typeof CRITICAL_REMOTE_STORAGE_KEYS[number];

const pendingSyncTimers = new Map<string, number>();

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function isCriticalStorageKey(storageKey: string): storageKey is CriticalStorageKey {
  return CRITICAL_REMOTE_STORAGE_KEYS.includes(storageKey as CriticalStorageKey);
}

export function isCloudPersistenceEnabled(): boolean {
  return isSupabaseConfigured();
}

export async function hydrateCriticalStorageFromCloud(): Promise<void> {
  if (!hasWindowStorage()) {
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  try {
    const { data, error } = await client
      .from(APP_STORAGE_TABLE)
      .select('storage_key, payload')
      .in('storage_key', [...CRITICAL_REMOTE_STORAGE_KEYS]);

    if (error) {
      console.warn('No se pudo hidratar almacenamiento remoto:', error.message);
      return;
    }

    for (const row of data || []) {
      if (!row?.storage_key || typeof row.payload === 'undefined') {
        continue;
      }

      localStorage.setItem(row.storage_key, JSON.stringify(row.payload));
    }
  } catch (error) {
    console.warn('Error al cargar datos remotos:', error);
  }
}

async function syncStorageKeyNow(storageKey: CriticalStorageKey): Promise<void> {
  if (!hasWindowStorage()) {
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  try {
    const rawValue = localStorage.getItem(storageKey);

    if (rawValue === null) {
      const { error } = await client
        .from(APP_STORAGE_TABLE)
        .delete()
        .eq('storage_key', storageKey);

      if (error) {
        console.warn(`No se pudo eliminar ${storageKey} de Supabase:`, error.message);
      }
      return;
    }

    const payload = JSON.parse(rawValue);
    const { error } = await client
      .from(APP_STORAGE_TABLE)
      .upsert(
        {
          storage_key: storageKey,
          payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'storage_key' }
      );

    if (error) {
      console.warn(`No se pudo sincronizar ${storageKey} con Supabase:`, error.message);
    }
  } catch (error) {
    console.warn(`Error al sincronizar ${storageKey} con Supabase:`, error);
  }
}

export function queueStorageSync(storageKey: string): void {
  if (!isCloudPersistenceEnabled() || !hasWindowStorage() || !isCriticalStorageKey(storageKey)) {
    return;
  }

  const existingTimer = pendingSyncTimers.get(storageKey);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const nextTimer = window.setTimeout(() => {
    pendingSyncTimers.delete(storageKey);
    void syncStorageKeyNow(storageKey);
  }, 250);

  pendingSyncTimers.set(storageKey, nextTimer);
}