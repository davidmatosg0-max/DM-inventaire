/**
 * Sistema de gestión de API Keys para Banque Alimentaire PRO
 * Versión: 5.0-PRO
 */

import {
  exportarReporteCSV,
  exportarReporteJSON,
  exportarReportePRSCSV,
  generarReporteComandas,
  generarReporteGeneral,
  generarReporteInventario,
  generarReporteOrganismos,
  generarReportePRS,
  generarReporteTransporte,
} from './reportesLogic';

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
    console.error('Erreur lors de la récupération des clés API :', error);
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
    return { isValid: false, error: 'Clé API introuvable' };
  }

  if (!key.isActive) {
    return { isValid: false, error: 'Clé API désactivée' };
  }

  if (key.expiresAt && new Date() > key.expiresAt) {
    return { isValid: false, error: 'Clé API expirée' };
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
    console.error('Erreur lors de l’enregistrement des clés API :', error);
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

export interface APIRequestOptions {
  apiKey: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, any>;
}

export interface APIResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  rateLimit?: {
    remaining: number;
    resetIn: number;
  };
}

function tienePermisoAPI(key: APIKey, permission: APIPermission): boolean {
  return key.permissions.includes('admin:all') || key.permissions.includes(permission);
}

function normalizarPathAPI(path: string): string {
  return path
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/api\/v1/i, '')
    .split('?')[0] || '/';
}

function respuestaAPI<T>(status: number, data?: T, error?: string, rateLimit?: APIResponse['rateLimit']): APIResponse<T> {
  return {
    ok: status >= 200 && status < 300,
    status,
    data,
    error,
    rateLimit,
  };
}

function extraerFechas(request: APIRequestOptions): { startDate?: string; endDate?: string } {
  return {
    startDate: String(request.query?.startDate || request.body?.startDate || '') || undefined,
    endDate: String(request.query?.endDate || request.body?.endDate || '') || undefined,
  };
}

export function ejecutarSolicitudAPI(request: APIRequestOptions): APIResponse<unknown> {
  const validation = validarAPIKey(request.apiKey);

  if (!validation.isValid || !validation.key) {
    return respuestaAPI(401, undefined, validation.error || 'API Key inválida');
  }

  const rateLimit = verificarRateLimit(request.apiKey);
  if (!rateLimit.allowed) {
    return respuestaAPI(429, undefined, 'Rate limit excedido', {
      remaining: rateLimit.remaining,
      resetIn: rateLimit.resetIn,
    });
  }

  const path = normalizarPathAPI(request.path);
  const permission: APIPermission = 'read:reports';

  if (!tienePermisoAPI(validation.key, permission)) {
    return respuestaAPI(403, undefined, 'Permiso insuficiente', {
      remaining: rateLimit.remaining,
      resetIn: rateLimit.resetIn,
    });
  }

  const { startDate, endDate } = extraerFechas(request);
  const format = String(request.query?.format || request.body?.format || 'json').toLowerCase();

  const serializarReporte = (type: string, payload: unknown): APIResponse<unknown> => {
    registrarUsoAPIKey(request.apiKey);

    if (format === 'json') {
      return respuestaAPI(200, payload, undefined, {
        remaining: rateLimit.remaining - 1,
        resetIn: rateLimit.resetIn,
      });
    }

    if (format === 'csv') {
      if (type === 'general') {
        return respuestaAPI(200, exportarReporteCSV(payload as ReturnType<typeof generarReporteGeneral>), undefined, {
          remaining: rateLimit.remaining - 1,
          resetIn: rateLimit.resetIn,
        });
      }

      if (type === 'prs') {
        return respuestaAPI(200, exportarReportePRSCSV(payload as ReturnType<typeof generarReportePRS>), undefined, {
          remaining: rateLimit.remaining - 1,
          resetIn: rateLimit.resetIn,
        });
      }

      return respuestaAPI(400, undefined, `Formato CSV no soportado para el reporte ${type}`, {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
    }

    return respuestaAPI(400, undefined, `Formato no soportado: ${format}`, {
      remaining: rateLimit.remaining,
      resetIn: rateLimit.resetIn,
    });
  };

  if (request.method === 'GET' && path === '/reports/types') {
    registrarUsoAPIKey(request.apiKey);

    return respuestaAPI(200, {
      types: ['inventory', 'comandas', 'organisms', 'transport', 'general', 'prs'],
    }, undefined, {
      remaining: rateLimit.remaining - 1,
      resetIn: rateLimit.resetIn,
    });
  }

  if (request.method === 'GET' && path === '/reports/prs') {
    const reporte = generarReportePRS(startDate, endDate, {
      organismoId: request.query?.organismId ? String(request.query.organismId) : undefined,
      participantPRSId: request.query?.participantPRSId ? String(request.query.participantPRSId) : undefined,
      donorId: request.query?.donorId ? String(request.query.donorId) : undefined,
    });

    return serializarReporte('prs', reporte);
  }

  if (request.method === 'POST' && path === '/reports/generate') {
    const type = String(request.body?.type || '').toLowerCase();

    switch (type) {
      case 'inventory':
        return serializarReporte(type, generarReporteInventario(startDate, endDate));
      case 'comandas':
        return serializarReporte(type, generarReporteComandas(startDate, endDate));
      case 'organisms':
        return serializarReporte(type, generarReporteOrganismos());
      case 'transport':
        return serializarReporte(type, generarReporteTransporte(startDate, endDate));
      case 'general':
        return serializarReporte(type, generarReporteGeneral(startDate, endDate));
      case 'prs':
        return serializarReporte(type, generarReportePRS(startDate, endDate, {
          organismoId: request.body?.filters?.organismId ? String(request.body.filters.organismId) : undefined,
          participantPRSId: request.body?.filters?.participantPRSId ? String(request.body.filters.participantPRSId) : undefined,
          donorId: request.body?.filters?.donorId ? String(request.body.filters.donorId) : undefined,
        }));
      default:
        return respuestaAPI(400, undefined, `Tipo de reporte no soportado: ${type || 'vacío'}`, {
          remaining: rateLimit.remaining,
          resetIn: rateLimit.resetIn,
        });
    }
  }

  return respuestaAPI(404, undefined, `Endpoint no implementado: ${request.method} ${path}`, {
    remaining: rateLimit.remaining,
    resetIn: rateLimit.resetIn,
  });
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
        listTypes: {
          method: 'GET',
          path: '/reports/types',
          permission: 'read:reports',
          description: 'Lista los tipos de reportes disponibles en la API.',
          response: {
            types: ['inventory', 'comandas', 'organisms', 'transport', 'general', 'prs'],
          },
        },
        generate: {
          method: 'POST',
          path: '/reports/generate',
          permission: 'read:reports',
          description: 'Genera un reporte bajo demanda, incluyendo el reporte PRS.',
          requestBody: {
            type: 'inventory | comandas | organisms | transport | general | prs',
            startDate: 'YYYY-MM-DD (opcional)',
            endDate: 'YYYY-MM-DD (opcional)',
            format: 'json | csv (opcional)',
            filters: {
              organismId: 'string (opcional)',
              participantPRSId: 'string (opcional)',
              donorId: 'string (opcional)',
            },
          },
        },
        prs: {
          method: 'GET',
          path: '/reports/prs',
          permission: 'read:reports',
          description: 'Devuelve el reporte del Programa PRS usando entradas con programaCodigo PRS y relaciones con participante PRS.',
          query: {
            startDate: 'YYYY-MM-DD (opcional)',
            endDate: 'YYYY-MM-DD (opcional)',
            organismId: 'string (opcional)',
            participantPRSId: 'string (opcional)',
            donorId: 'string (opcional)',
          },
          response: {
            summary: {
              totalEntries: 'number',
              totalQuantity: 'number',
              totalWeightKg: 'number',
              totalEstimatedValue: 'number',
              uniqueDonors: 'number',
              uniqueProducts: 'number',
              uniqueOrganisms: 'number',
            },
            byOrganism: [
              {
                organismId: 'string',
                organismName: 'string',
                totalEntries: 'number',
                totalQuantity: 'number',
                totalWeightKg: 'number',
              },
            ],
            byDonor: [
              {
                donorId: 'string',
                donorName: 'string',
                totalEntries: 'number',
                totalQuantity: 'number',
                totalWeightKg: 'number',
              },
            ],
            byProduct: [
              {
                productId: 'string',
                productName: 'string',
                totalEntries: 'number',
                totalQuantity: 'number',
                totalWeightKg: 'number',
              },
            ],
          },
        },
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
