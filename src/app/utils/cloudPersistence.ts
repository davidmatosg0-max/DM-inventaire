import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
const APP_STORAGE_TABLE = 'app_storage';

export const CRITICAL_REMOTE_STORAGE_KEYS = [
  'organismos_banco_alimentos',
  'banco_alimentos_productos',
  'banco_alimentos_entradas_inventario',
  'banco_alimentos_movimientos',
  'banco_alimentos_comandas',
  'banco_alimentos_categorias',
  'banco_alimentos_unidades',
  'bancoAlimentos_programasEntrada',
  'banco_alimentos_dechets_compostage',
  'banco_alimentos_dechets_compostage_categories',
  'banco_alimentos_dechets_compostage_types',
  'banque_alimentaire_usuarios',
  'banque_alimentaire_roles_personnalises',
  'departamentos_banco_alimentos',
  'contactos_departamentos',
  'banqueAlimentaire_contactosDepartamento',
  'banque_alimentaire_support_config',
  'inventario_cocina',
  'movimientos_cocina',
  'recetas_cocina',
  'transformaciones_cocina',
  'ofertas_sistema',
  'mensajes_contacto',
  'demandes_organismes',
  'personas_responsables',
  'registroActividades',
  'villes_quartiers_adresses',
  'zonasAlmacen',
  'banqueAlimentaire_benevoles',
  'banque_alimentaire_tipos_documento',
  'banque_alimentaire_tipos_documento_predefined',
  'banque_alimentaire_tipos_contacto_personalizados',
  'idiomas_personalizados',
  'banque_alimentaire_transporte_ui_vehiculos',
  'banque_alimentaire_transporte_ui_rutas',
  'banque_alimentaire_transporte_ui_choferes',
  'banco_alimentos_vehiculos',
  'banco_alimentos_rutas',
  'banco_alimentos_choferes',
  'comptoir_custom_aid_types',
  'comptoir_aid_requests',
  'comptoir_beneficiaries',
  'comptoir_distributions',
  'comptoir_appointments',
  'communication_interne_messages',
  'communication_interne_notifications',
  'communication_interne_drafts',
  'communication_interne_templates',
  'communication_interne_presence',
  'communication_interne_signal',
] as const;

const REMOTE_STORAGE_KEY_SET = new Set<string>(CRITICAL_REMOTE_STORAGE_KEYS);

const INCLUDED_PREFIXES = [
  'banco_alimentos_',
  'bancoAlimentos_',
  'banque_alimentaire_',
  'banqueAlimentaire_',
  'comptoir_',
  'communication_interne_',
  'demandes_',
];

const INCLUDED_EXACT_KEYS = new Set<string>([
  ...CRITICAL_REMOTE_STORAGE_KEYS,
  'contactos_departamentos',
  'departamentos_banco_alimentos',
  'email_config_banco_alimentos',
  'inventario_cocina',
  'movimientos_cocina',
  'ofertas_sistema',
  'personas_responsables',
  'registroActividades',
  'recetas_cocina',
  'transformaciones_cocina',
  'villes_quartiers_adresses',
  'zonasAlmacen',
  'tareasPersonalizadas',
]);

const EXCLUDED_PREFIXES = [
  'alerta_',
  'backup_',
  'backup_emergencia_',
  'ba_backup_',
  'sb-',
];

const EXCLUDED_EXACT_KEYS = new Set<string>([
  'app_logo_preview',
  'authTimestamp',
  'autoBackupConfig',
  'backup_restaurado',
  'backup_restaurado_fecha',
  'comandas-tab-activo',
  'data_version',
  'datos_ejemplo_inicializados',
  'dispositivo_id',
  'isAuthenticated',
  'limpieza_completa_ejecutada',
  'limpieza_completa_fecha',
  'migracion_costco_flags',
  'migracion_programas_entrada_v2',
  'proteccion_contador',
  'proteccion_datos_activa',
  'sistema_con_datos_reales',
  'storedBackups',
  'usuario_sesion_banco_alimentos',
  'banque_auth_tokens',
  'banque_refresh_tokens',
  'banqueAlimentaire_pendingQrNavigation',
  'dm_pending_entrepot_quick_action',
]);

const pendingSyncTimers = new Map<string, number>();
let cloudPersistenceInitialized = false;

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function isPersistedBusinessStorageKey(storageKey: string): boolean {
  if (!storageKey || EXCLUDED_EXACT_KEYS.has(storageKey)) {
    return false;
  }

  if (EXCLUDED_PREFIXES.some((prefix) => storageKey.startsWith(prefix))) {
    return false;
  }

  if (INCLUDED_EXACT_KEYS.has(storageKey) || REMOTE_STORAGE_KEY_SET.has(storageKey)) {
    return true;
  }

  return INCLUDED_PREFIXES.some((prefix) => storageKey.startsWith(prefix));
}

function shouldHydrateRemoteValue(localValue: string | null): boolean {
  if (localValue === null) {
    return true;
  }

  const normalized = localValue.trim();
  return normalized === '' || normalized === 'null' || normalized === '[]' || normalized === '{}';
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
      .select('storage_key, payload');

    if (error) {
      console.warn('Impossible d’hydrater le stockage distant :', error.message);
      return;
    }

    for (const row of data || []) {
      if (!row?.storage_key || typeof row.payload === 'undefined') {
        continue;
      }

      if (!isPersistedBusinessStorageKey(row.storage_key)) {
        continue;
      }

      const serializedPayload = JSON.stringify(row.payload);
      const localValue = localStorage.getItem(row.storage_key);

      if (shouldHydrateRemoteValue(localValue)) {
        localStorage.setItem(row.storage_key, serializedPayload);
        continue;
      }

      if (localValue !== serializedPayload) {
        queueStorageSync(row.storage_key);
      }
    }

    for (const storageKey of Object.keys(localStorage)) {
      if (isPersistedBusinessStorageKey(storageKey)) {
        queueStorageSync(storageKey);
      }
    }
  } catch (error) {
    console.warn('Erreur lors du chargement des données distantes :', error);
  }
}

async function syncStorageKeyNow(storageKey: string): Promise<void> {
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
        console.warn(`Impossible de supprimer ${storageKey} de Supabase :`, error.message);
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
  if (!isCloudPersistenceEnabled() || !hasWindowStorage() || !isPersistedBusinessStorageKey(storageKey)) {
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

export function initializeCloudPersistence(): void {
  if (!isCloudPersistenceEnabled() || !hasWindowStorage() || cloudPersistenceInitialized) {
    return;
  }

  cloudPersistenceInitialized = true;

  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = function(storageKey: string, value: string) {
    originalSetItem(storageKey, value);
    queueStorageSync(storageKey);
  };

  localStorage.removeItem = function(storageKey: string) {
    const previousValue = localStorage.getItem(storageKey);
    originalRemoveItem(storageKey);

    if (previousValue !== null || isPersistedBusinessStorageKey(storageKey)) {
      queueStorageSync(storageKey);
    }
  };

  const flushPendingSyncs = () => {
    for (const [storageKey, timerId] of pendingSyncTimers.entries()) {
      window.clearTimeout(timerId);
      pendingSyncTimers.delete(storageKey);
      void syncStorageKeyNow(storageKey);
    }
  };

  window.addEventListener('pagehide', flushPendingSyncs);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingSyncs();
    }
  });
}