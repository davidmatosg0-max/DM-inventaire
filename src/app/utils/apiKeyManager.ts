/**
 * Sistema de gestión de API Keys para Banque Alimentaire PRO
 * Versión: 5.0-PRO
 */

export interface APIKey {
  id: string;
  key: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  isActive: boolean;
  permissions: APIPermission[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    lastMinute: number;
    lastHour: number;
    lastDay: number;
  };
  ipWhitelist?: string[];
}

export type APIPermission = 
  | 'read:inventory'
  | 'write:inventory'
  | 'read:orders'
  | 'write:orders'
  | 'read:organisms'
  | 'write:organisms'
  | 'read:transport'
  | 'write:transport'
  | 'read:reports'
  | 'read:users'
  | 'write:users'
  | 'admin:all';

const STORAGE_KEY = 'banque_api_keys';

/**
 * Genera una API Key segura
 */
export function generateAPIKey(): string {
  const prefix = 'ba_'; // Banque Alimentaire
  const timestamp = Date.now().toString(36);
  const random = Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
  return `${prefix}${timestamp}_${random}`;
}

/**
 * Obtiene todas las API Keys
 */
export function obtenerAPIKeys(): APIKey[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const keys = JSON.parse(stored);
    return keys.map((key: any) => ({
      ...key,
      createdAt: new Date(key.createdAt),
      expiresAt: key.expiresAt ? new Date(key.expiresAt) : undefined,
      lastUsed: key.lastUsed ? new Date(key.lastUsed) : undefined,
    }));
  } catch (error) {
    console.error('Error al obtener API Keys:', error);
    return [];
  }
}

/**
 * Crea una nueva API Key
 */
export function crearAPIKey(data: {
  name: string;
  description: string;
  createdBy: string;
  permissions: APIPermission[];
  expiresInDays?: number;
  rateLimit?: Partial<APIKey['rateLimit']>;
  ipWhitelist?: string[];
}): APIKey {
  const newKey: APIKey = {
    id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    key: generateAPIKey(),
    name: data.name,
    description: data.description,
    createdBy: data.createdBy,
    createdAt: new Date(),
    expiresAt: data.expiresInDays 
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined,
    isActive: true,
    permissions: data.permissions,
    rateLimit: {
      requestsPerMinute: data.rateLimit?.requestsPerMinute || 60,
      requestsPerHour: data.rateLimit?.requestsPerHour || 1000,
      requestsPerDay: data.rateLimit?.requestsPerDay || 10000,
    },
    usage: {
      totalRequests: 0,
      lastMinute: 0,
      lastHour: 0,
      lastDay: 0,
    },
    ipWhitelist: data.ipWhitelist,
  };

  const keys = obtenerAPIKeys();
  keys.push(newKey);
  guardarAPIKeys(keys);
  
  return newKey;
}

/**
 * Valida una API Key
 */
export function validarAPIKey(apiKey: string): {
  isValid: boolean;
  key?: APIKey;
  error?: string;
} {
  const keys = obtenerAPIKeys();
  const key = keys.find(k => k.key === apiKey);

  if (!key) {
    return { isValid: false, error: 'API Key no encontrada' };
  }

  if (!key.isActive) {
    return { isValid: false, error: 'API Key desactivada' };
  }

  if (key.expiresAt && new Date() > key.expiresAt) {
    return { isValid: false, error: 'API Key expirada' };
  }

  return { isValid: true, key };
}

/**
 * Registra uso de API Key
 */
export function registrarUsoAPIKey(apiKey: string): boolean {
  const keys = obtenerAPIKeys();
  const keyIndex = keys.findIndex(k => k.key === apiKey);
  
  if (keyIndex === -1) return false;

  keys[keyIndex].lastUsed = new Date();
  keys[keyIndex].usage.totalRequests++;
  keys[keyIndex].usage.lastMinute++;
  keys[keyIndex].usage.lastHour++;
  keys[keyIndex].usage.lastDay++;

  guardarAPIKeys(keys);
  return true;
}

/**
 * Verifica rate limit
 */
export function verificarRateLimit(apiKey: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const validation = validarAPIKey(apiKey);
  if (!validation.isValid || !validation.key) {
    return { allowed: false, remaining: 0, resetIn: 0 };
  }

  const key = validation.key;
  
  // Verificar límite por minuto
  if (key.usage.lastMinute >= key.rateLimit.requestsPerMinute) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: 60,
    };
  }

  return {
    allowed: true,
    remaining: key.rateLimit.requestsPerMinute - key.usage.lastMinute,
    resetIn: 60,
  };
}

/**
 * Revoca una API Key
 */
export function revocarAPIKey(keyId: string): boolean {
  const keys = obtenerAPIKeys();
  const keyIndex = keys.findIndex(k => k.id === keyId);
  
  if (keyIndex === -1) return false;

  keys[keyIndex].isActive = false;
  guardarAPIKeys(keys);
  return true;
}

/**
 * Elimina una API Key
 */
export function eliminarAPIKey(keyId: string): boolean {
  const keys = obtenerAPIKeys();
  const filtered = keys.filter(k => k.id !== keyId);
  
  if (filtered.length === keys.length) return false;

  guardarAPIKeys(filtered);
  return true;
}

/**
 * Guarda API Keys en localStorage
 */
function guardarAPIKeys(keys: APIKey[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch (error) {
    console.error('Error al guardar API Keys:', error);
  }
}

/**
 * Obtiene estadísticas de uso de API
 */
export function obtenerEstadisticasAPI(): {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  totalRequests: number;
  requestsToday: number;
  topConsumers: Array<{ name: string; requests: number }>;
} {
  const keys = obtenerAPIKeys();
  const now = new Date();

  return {
    totalKeys: keys.length,
    activeKeys: keys.filter(k => k.isActive).length,
    expiredKeys: keys.filter(k => k.expiresAt && k.expiresAt < now).length,
    totalRequests: keys.reduce((sum, k) => sum + k.usage.totalRequests, 0),
    requestsToday: keys.reduce((sum, k) => sum + k.usage.lastDay, 0),
    topConsumers: keys
      .map(k => ({ name: k.name, requests: k.usage.totalRequests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5),
  };
}

/**
 * Exporta documentación de API
 */
export function exportarDocumentacionAPI(): string {
  return JSON.stringify({
    version: '5.0-PRO',
    baseUrl: window.location.origin + '/api/v1',
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      example: 'ba_1234567890_abcdefghijklmnop',
    },
    endpoints: {
      inventory: {
        list: { method: 'GET', path: '/inventory', permission: 'read:inventory' },
        create: { method: 'POST', path: '/inventory', permission: 'write:inventory' },
        update: { method: 'PUT', path: '/inventory/:id', permission: 'write:inventory' },
        delete: { method: 'DELETE', path: '/inventory/:id', permission: 'write:inventory' },
      },
      orders: {
        list: { method: 'GET', path: '/orders', permission: 'read:orders' },
        create: { method: 'POST', path: '/orders', permission: 'write:orders' },
        update: { method: 'PUT', path: '/orders/:id', permission: 'write:orders' },
      },
      organisms: {
        list: { method: 'GET', path: '/organisms', permission: 'read:organisms' },
        create: { method: 'POST', path: '/organisms', permission: 'write:organisms' },
      },
      reports: {
        generate: { method: 'POST', path: '/reports/generate', permission: 'read:reports' },
      },
    },
    rateLimits: {
      default: {
        minute: 60,
        hour: 1000,
        day: 10000,
      },
    },
  }, null, 2);
}
