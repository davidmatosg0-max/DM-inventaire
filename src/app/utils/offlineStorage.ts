/**
 * Utilidades de Almacenamiento Offline con IndexedDB
 * 
 * Proporciona una interfaz simple para almacenar y recuperar
 * datos en IndexedDB para uso offline.
 */

// ==================== TIPOS ====================

export interface StorageConfig {
  dbName: string;
  version: number;
  stores: string[];
}

export interface StoredItem<T = any> {
  id: string;
  data: T;
  timestamp: Date;
  module: string;
}

// ==================== CONFIGURACIÓN ====================

const DEFAULT_CONFIG: StorageConfig = {
  dbName: 'BanqueAlimentaireDB',
  version: 1,
  stores: [
    'inventory',
    'orders',
    'organisms',
    'contacts',
    'transport',
    'users',
    'settings',
    'cache'
  ]
};

// ==================== CLASE PRINCIPAL ====================

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private config: StorageConfig;
  private initPromise: Promise<IDBDatabase> | null = null;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Inicializar base de datos
   */
  private async init(): Promise<IDBDatabase> {
    // Si ya hay una inicialización en progreso, retornarla
    if (this.initPromise) {
      return this.initPromise;
    }

    // Si ya está inicializada, retornarla
    if (this.db) {
      return Promise.resolve(this.db);
    }

    // Crear nueva inicialización
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        reject(new Error('Error al abrir IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear object stores si no existen
        for (const storeName of this.config.stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Guardar item
   */
  async set<T>(store: string, id: string, data: T, module: string = store): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);

      const item: StoredItem<T> = {
        id,
        data,
        timestamp: new Date(),
        module
      };

      const request = objectStore.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Error al guardar item'));
    });
  }

  /**
   * Obtener item
   */
  async get<T>(store: string, id: string): Promise<T | null> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(id);

      request.onsuccess = () => {
        const item = request.result as StoredItem<T> | undefined;
        resolve(item ? item.data : null);
      };

      request.onerror = () => reject(new Error('Error al obtener item'));
    });
  }

  /**
   * Obtener todos los items
   */
  async getAll<T>(store: string): Promise<StoredItem<T>[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result as StoredItem<T>[]);
      };

      request.onerror = () => reject(new Error('Error al obtener items'));
    });
  }

  /**
   * Eliminar item
   */
  async delete(store: string, id: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Error al eliminar item'));
    });
  }

  /**
   * Limpiar store completo
   */
  async clear(store: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Error al limpiar store'));
    });
  }

  /**
   * Contar items en store
   */
  async count(store: string): Promise<number> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Error al contar items'));
    });
  }

  /**
   * Obtener todas las keys
   */
  async keys(store: string): Promise<string[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAllKeys();

      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(new Error('Error al obtener keys'));
    });
  }

  /**
   * Verificar si existe un item
   */
  async has(store: string, id: string): Promise<boolean> {
    try {
      const item = await this.get(store, id);
      return item !== null;
    } catch {
      return false;
    }
  }

  /**
   * Guardar múltiples items
   */
  async setMany<T>(
    store: string,
    items: Array<{ id: string; data: T }>,
    module: string = store
  ): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);

      let completed = 0;
      const total = items.length;

      items.forEach((item) => {
        const storedItem: StoredItem<T> = {
          id: item.id,
          data: item.data,
          timestamp: new Date(),
          module
        };

        const request = objectStore.put(storedItem);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => {
          reject(new Error('Error al guardar items'));
        };
      });
    });
  }

  /**
   * Eliminar múltiples items
   */
  async deleteMany(store: string, ids: string[]): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);

      let completed = 0;
      const total = ids.length;

      ids.forEach((id) => {
        const request = objectStore.delete(id);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => {
          reject(new Error('Error al eliminar items'));
        };
      });
    });
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats(): Promise<{
    stores: Record<string, number>;
    total: number;
  }> {
    const stats: Record<string, number> = {};
    let total = 0;

    for (const store of this.config.stores) {
      const count = await this.count(store);
      stats[store] = count;
      total += count;
    }

    return { stores: stats, total };
  }

  /**
   * Cerrar conexión
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  /**
   * Eliminar base de datos completa
   */
  static async deleteDatabase(dbName: string = DEFAULT_CONFIG.dbName): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Error al eliminar base de datos'));
    });
  }
}

// ==================== INSTANCIA SINGLETON ====================

let instance: OfflineStorage | null = null;

/**
 * Obtener instancia singleton de OfflineStorage
 */
export function getOfflineStorage(): OfflineStorage {
  if (!instance) {
    instance = new OfflineStorage();
  }
  return instance;
}

// ==================== HELPERS ====================

/**
 * Caché simple para datos
 */
export class DataCache<T = any> {
  private storage: OfflineStorage;
  private storeName: string;
  private ttl: number; // Time to live en milisegundos

  constructor(storeName: string = 'cache', ttl: number = 3600000) {
    this.storage = getOfflineStorage();
    this.storeName = storeName;
    this.ttl = ttl;
  }

  /**
   * Guardar en caché
   */
  async set(key: string, data: T): Promise<void> {
    await this.storage.set(this.storeName, key, data);
  }

  /**
   * Obtener de caché
   */
  async get(key: string): Promise<T | null> {
    try {
      const items = await this.storage.getAll<T>(this.storeName);
      const item = items.find(i => i.id === key);

      if (!item) return null;

      // Verificar TTL
      const age = Date.now() - item.timestamp.getTime();
      if (age > this.ttl) {
        // Caché expirado
        await this.storage.delete(this.storeName, key);
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  }

  /**
   * Eliminar de caché
   */
  async delete(key: string): Promise<void> {
    await this.storage.delete(this.storeName, key);
  }

  /**
   * Limpiar caché
   */
  async clear(): Promise<void> {
    await this.storage.clear(this.storeName);
  }

  /**
   * Limpiar caché expirado
   */
  async clearExpired(): Promise<number> {
    const items = await this.storage.getAll<T>(this.storeName);
    let cleared = 0;

    for (const item of items) {
      const age = Date.now() - item.timestamp.getTime();
      if (age > this.ttl) {
        await this.storage.delete(this.storeName, item.id);
        cleared++;
      }
    }

    return cleared;
  }
}

// Exportar clase y funciones principales
export { OfflineStorage };
export default getOfflineStorage;
