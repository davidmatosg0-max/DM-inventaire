# Sistema de Modo Offline - Mejora #9 Implementada

## 📋 Resumen

Se ha implementado un sistema completo de gestión offline que permite al sistema funcionar sin conexión a Internet, guardando las operaciones en una cola local y sincronizándolas automáticamente cuando se restaura la conexión. Incluye detección de estado, queue de operaciones, almacenamiento IndexedDB, y una interfaz completa de gestión.

## 🎯 Objetivos Completados

### 1. **Detección de Conexión**
- ✅ Hook useOnlineStatus para detectar estado online/offline
- ✅ Eventos de cambio de estado en tiempo real
- ✅ Verificación con ping al servidor (opcional)
- ✅ Registro de últimas conexión/desconexión

### 2. **Queue de Operaciones Offline**
- ✅ Cola de operaciones CRUD pendientes
- ✅ Persistencia en localStorage
- ✅ Sincronización automática al volver online
- ✅ Reintentos automáticos con límite
- ✅ Estadísticas por módulo y tipo

### 3. **Almacenamiento Persistente**
- ✅ Wrapper de IndexedDB
- ✅ Operaciones asíncronas
- ✅ Caché con TTL
- ✅ Múltiples stores por módulo

### 4. **Interfaz de Usuario**
- ✅ Indicador flotante de estado
- ✅ Módulo completo de gestión offline
- ✅ Visualización de operaciones pendientes
- ✅ Sincronización manual
- ✅ Traducciones completas (FR)

## 📁 Archivos Creados

### 1. `/src/hooks/useOnlineStatus.ts` (150+ líneas)

Hook para detectar y monitorear el estado de conexión.

#### Hooks Exportados

```typescript
// Hook básico
export function useOnlineStatus(): {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

// Hook con verificación de ping
export function useOnlineStatusWithPing(): {
  ...useOnlineStatus,
  isPinging: boolean;
  lastPing: Date | null;
  pingSuccess: boolean;
  checkConnectivity: () => Promise<boolean>;
}

// Hook simple
export function useIsOnline(): boolean
```

#### Ejemplo de Uso

```typescript
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function MyComponent() {
  const { isOnline, wasOffline, lastOffline } = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? (
        <span>✅ Conectado</span>
      ) : (
        <span>❌ Sin conexión desde {formatDate(lastOffline)}</span>
      )}
    </div>
  );
}
```

### 2. `/src/hooks/useOfflineQueue.ts` (400+ líneas)

Sistema de cola para gestionar operaciones offline.

#### API Principal

```typescript
export function useOfflineQueue(config?: QueueConfig): {
  // Estado
  queue: QueuedOperation[];
  queueSize: number;
  isSyncing: boolean;
  syncProgress: number;
  isOnline: boolean;
  
  // Métodos
  addToQueue: (type: OperationType, module: string, data: any) => string;
  removeFromQueue: (operationId: string) => void;
  updateOperation: (operationId: string, updates: Partial<QueuedOperation>) => void;
  syncQueue: () => Promise<SyncResult>;
  clearAllQueue: () => void;
  getOperationsByModule: (module: string) => QueuedOperation[];
  getOperationsByType: (type: OperationType) => QueuedOperation[];
  getQueueStats: () => QueueStats;
}
```

#### Tipos de Operaciones

```typescript
export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface QueuedOperation {
  id: string;
  type: OperationType;
  module: string;
  data: any;
  timestamp: Date;
  retries: number;
  error?: string;
}
```

#### Configuración

```typescript
export interface QueueConfig {
  maxRetries?: number;      // Default: 3
  retryDelay?: number;       // Default: 2000ms
  autoSync?: boolean;        // Default: true
}
```

#### Ejemplo de Uso

```typescript
import { useOfflineQueue } from '../hooks/useOfflineQueue';

function InventoryForm() {
  const { addToQueue, isOnline } = useOfflineQueue();
  
  const handleSave = async (product) => {
    if (!isOnline) {
      // Agregar a la queue
      addToQueue('CREATE', 'inventory', product);
      toast.info('Guardado offline - se sincronizará cuando haya conexión');
    } else {
      // Guardar directamente
      await saveProduct(product);
    }
  };
  
  return <form onSubmit={handleSave}>...</form>;
}
```

### 3. `/src/app/utils/offlineStorage.ts` (450+ líneas)

Wrapper de IndexedDB para almacenamiento persistente.

#### Clase Principal

```typescript
class OfflineStorage {
  // Operaciones básicas
  async set<T>(store: string, id: string, data: T): Promise<void>
  async get<T>(store: string, id: string): Promise<T | null>
  async getAll<T>(store: string): Promise<StoredItem<T>[]>
  async delete(store: string, id: string): Promise<void>
  async clear(store: string): Promise<void>
  
  // Operaciones masivas
  async setMany<T>(store: string, items: Array<{id: string; data: T}>): Promise<void>
  async deleteMany(store: string, ids: string[]): Promise<void>
  
  // Utilidades
  async count(store: string): Promise<number>
  async keys(store: string): Promise<string[]>
  async has(store: string, id: string): Promise<boolean>
  async getStorageStats(): Promise<StorageStats>
  
  // Gestión
  close(): void
  static async deleteDatabase(dbName?: string): Promise<void>
}
```

#### Singleton

```typescript
import { getOfflineStorage } from '../utils/offlineStorage';

const storage = getOfflineStorage();

// Guardar
await storage.set('inventory', 'prod_123', productData);

// Obtener
const product = await storage.get('inventory', 'prod_123');

// Obtener todos
const allProducts = await storage.getAll('inventory');

// Eliminar
await storage.delete('inventory', 'prod_123');
```

#### Caché con TTL

```typescript
import { DataCache } from '../utils/offlineStorage';

// Crear caché con TTL de 1 hora
const cache = new DataCache('products', 3600000);

// Guardar
await cache.set('featured_products', productsArray);

// Obtener (null si expiró)
const products = await cache.get('featured_products');

// Limpiar expirados
const cleared = await cache.clearExpired();
```

#### Stores Configurados

- `inventory` - Productos
- `orders` - Pedidos
- `organisms` - Organismos
- `contacts` - Contactos
- `transport` - Transporte
- `users` - Usuarios
- `settings` - Configuración
- `cache` - Caché general

### 4. `/src/app/components/offline/OfflineIndicator.tsx` (250+ líneas)

Indicador flotante del estado de conexión.

#### Características

- Badge flotante en esquina inferior derecha
- Muestra estado online/offline
- Contador de operaciones pendientes
- Panel de detalles expandible
- Botón de sincronización manual
- Estadísticas visuales

#### Uso

```typescript
import { OfflineIndicator } from './components/offline/OfflineIndicator';

function App() {
  return (
    <div>
      {/* Tu aplicación */}
      <OfflineIndicator />
    </div>
  );
}
```

#### Apariencia

```
┌─────────────────────┐
│ 🌐 En Línea     [3] │  ← Badge flotante
└─────────────────────┘

Al hacer clic:
┌──────────────────────────────┐
│ Estado de Conexión: En Línea │
├──────────────────────────────┤
│ Estado: Conectado            │
│ Última conexión: Hace 2 min  │
├──────────────────────────────┤
│ Operaciones Pendientes: 3    │
│ ┌─────┬─────┬──────┐        │
│ │ ➕ 1 │ ✏️ 1 │ 🗑️ 1 │       │
│ └─────┴─────┴──────┘        │
│                              │
│ • Crear en inventory         │
│ • Actualizar en orders       │
│ • Eliminar en organisms      │
│                              │
│ [Sincronizar Ahora]          │
└──────────────────────────────┘
```

### 5. `/src/app/components/offline/OfflineModule.tsx` (600+ líneas)

Módulo completo de gestión offline.

#### Estructura

**3 Tabs:**
1. **Cola** - Lista de operaciones pendientes
2. **Estado** - Estado de conexión y estadísticas
3. **Configuración** - Opciones de sincronización

#### Tab 1: Cola de Operaciones

```
┌───────────────────────────────────────┐
│ Operaciones Pendientes            [3] │
├───────────────────────────────────────┤
│ ┌─────────────────────────────────┐   │
│ │ ➕ Crear en inventory           │   │
│ │ Hace 5 minutos                 │   │
│ └─────────────────────────────────┘   │
│                                       │
│ ┌─────────────────────────────────┐   │
│ │ ✏️ Actualizar en orders        │   │
│ │ Hace 3 minutos                 │   │
│ └─────────────────────────────────┘   │
│                                       │
│ [Sincronizar Ahora] [Limpiar Todo]   │
└───────────────────────────────────────┘
```

#### Tab 2: Estado

```
┌───────────────────────────────────────┐
│ Estado de Conexión                     │
├───────────────────────────────────────┤
│ Estado Actual: ✅ Conectado           │
│ Última conexión: 23/02/2026 14:30     │
│                                        │
│ Operaciones por Módulo:                │
│ • inventory: 5 operaciones             │
│ • orders: 3 operaciones                │
│ • organisms: 1 operación               │
└───────────────────────────────────────┘
```

#### Tab 3: Configuración

```
┌───────────────────────────────────────┐
│ Configuración Offline                  │
├───────────────────────────────────────┤
│ Sincronización Automática         [✓] │
│ Sincronizar automáticamente cuando     │
│ se restaure la conexión                │
│                                        │
│ ℹ️ Las operaciones offline se guardan │
│ localmente y se sincronizarán cuando   │
│ vuelva la conexión.                    │
└───────────────────────────────────────┘
```

## 💡 Ejemplos de Uso Completos

### Ejemplo 1: Operación CRUD con Soporte Offline

```typescript
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useIsOnline } from '../hooks/useOnlineStatus';

function ProductForm() {
  const { addToQueue } = useOfflineQueue();
  const isOnline = useIsOnline();
  
  const handleCreateProduct = async (productData) => {
    if (!isOnline) {
      // Modo offline: agregar a la queue
      const queueId = addToQueue('CREATE', 'inventory', productData);
      
      // También guardar en IndexedDB para acceso inmediato
      await storage.set('inventory', productData.id, productData);
      
      toast.success('Producto guardado offline', {
        description: 'Se sincronizará automáticamente'
      });
    } else {
      // Modo online: enviar al servidor
      await fetch('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      
      toast.success('Producto creado');
    }
  };
  
  return <form onSubmit={handleCreateProduct}>...</form>;
}
```

### Ejemplo 2: Cargar Datos con Fallback Offline

```typescript
import { getOfflineStorage } from '../utils/offlineStorage';
import { useIsOnline } from '../hooks/useOnlineStatus';

function ProductList() {
  const [products, setProducts] = useState([]);
  const isOnline = useIsOnline();
  const storage = getOfflineStorage();
  
  useEffect(() => {
    loadProducts();
  }, [isOnline]);
  
  const loadProducts = async () => {
    if (isOnline) {
      // Intentar cargar desde servidor
      try {
        const response = await fetch('/api/inventory');
        const data = await response.json();
        
        // Guardar en caché local
        await storage.setMany('inventory', 
          data.map(p => ({ id: p.id, data: p }))
        );
        
        setProducts(data);
      } catch (error) {
        // Si falla, cargar desde caché
        await loadFromCache();
      }
    } else {
      // Modo offline: cargar desde caché
      await loadFromCache();
    }
  };
  
  const loadFromCache = async () => {
    const cached = await storage.getAll('inventory');
    setProducts(cached.map(item => item.data));
  };
  
  return (
    <div>
      {!isOnline && (
        <Alert>
          📡 Mostrando datos en caché - Sin conexión
        </Alert>
      )}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Ejemplo 3: Sincronización Manual

```typescript
import { useOfflineQueue } from '../hooks/useOfflineQueue';

function SyncButton() {
  const { syncQueue, queueSize, isSyncing, syncProgress } = useOfflineQueue();
  
  const handleSync = async () => {
    const result = await syncQueue();
    
    console.log(`✅ ${result.success} operaciones sincronizadas`);
    console.log(`❌ ${result.failed} operaciones fallidas`);
    
    if (result.errors.length > 0) {
      console.error('Errores:', result.errors);
    }
  };
  
  return (
    <Button onClick={handleSync} disabled={isSyncing || queueSize === 0}>
      {isSyncing ? (
        <>
          <RefreshCw className="animate-spin" />
          Sincronizando {syncProgress}%
        </>
      ) : (
        <>
          <RefreshCw />
          Sincronizar {queueSize} operaciones
        </>
      )}
    </Button>
  );
}
```

### Ejemplo 4: Caché con Expiración

```typescript
import { DataCache } from '../utils/offlineStorage';

// Crear caché con TTL de 30 minutos
const productsCache = new DataCache('products', 1800000);

async function loadFeaturedProducts() {
  // Intentar obtener de caché
  let products = await productsCache.get('featured');
  
  if (products) {
    console.log('✅ Cargado desde caché');
    return products;
  }
  
  // Si no está en caché o expiró, cargar desde API
  const response = await fetch('/api/products/featured');
  products = await response.json();
  
  // Guardar en caché
  await productsCache.set('featured', products);
  
  return products;
}

// Limpiar periódicamente caché expirado
setInterval(async () => {
  const cleared = await productsCache.clearExpired();
  console.log(`🧹 ${cleared} items expirados eliminados`);
}, 3600000); // Cada hora
```

### Ejemplo 5: Integración Completa

```typescript
// App.tsx
import { OfflineIndicator } from './components/offline/OfflineIndicator';
import { useOfflineQueue } from './hooks/useOfflineQueue';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function App() {
  const { isOnline } = useOnlineStatus();
  const { queueSize } = useOfflineQueue({
    maxRetries: 3,
    retryDelay: 2000,
    autoSync: true
  });
  
  return (
    <div>
      {/* Indicador flotante */}
      <OfflineIndicator />
      
      {/* Banner de estado */}
      {!isOnline && (
        <div className="bg-amber-100 p-2 text-center">
          ⚠️ Sin conexión - {queueSize} operaciones pendientes
        </div>
      )}
      
      {/* Tu aplicación */}
      <Routes />
    </div>
  );
}
```

## 🔐 Características de Seguridad

### Persistencia Local

- Datos almacenados en IndexedDB (no expiran al cerrar navegador)
- localStorage para queue de sincronización
- Aislamiento por dominio

### Manejo de Errores

```typescript
// Reintentos automáticos
const config = {
  maxRetries: 3,         // Máximo 3 intentos
  retryDelay: 2000      // 2 segundos entre intentos
};

// Operaciones fallidas marcadas
operation.retries >= maxRetries  // No se reintenta más
```

### Validación de Datos

```typescript
// Verificar integridad al sincronizar
if (operation.retries >= maxRetries) {
  // Marcar como fallido
  console.warn(`Operación ${operation.id} alcanzó límite de reintentos`);
  continue;
}
```

## 📊 Estadísticas y Monitoreo

```typescript
const stats = getQueueStats();

console.log({
  total: stats.total,                    // Total de operaciones
  byType: stats.byType,                  // { CREATE: 5, UPDATE: 3, DELETE: 1 }
  byModule: stats.byModule,              // { inventory: 4, orders: 5 }
  oldestOperation: stats.oldestOperation, // Date
  failedOperations: stats.failedOperations // 2
});

// Estadísticas de almacenamiento
const storageStats = await storage.getStorageStats();
console.log({
  stores: storageStats.stores,  // { inventory: 150, orders: 75, ... }
  total: storageStats.total     // 225
});
```

## 🎨 Diseño e Interfaz

### Badge Flotante

```css
/* Verde cuando online */
bg-green-500 hover:bg-green-600

/* Rojo cuando offline */
bg-red-500 hover:bg-red-600 animate-pulse
```

### Glassmorphism Consistente

```css
backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl
```

## 🌐 Traducciones

Traducciones completas agregadas en francés (`fr-new.json`):

- Estados de conexión
- Operaciones pendientes
- Sincronización
- Configuración offline
- Mensajes de error y éxito

## 📈 Progreso Total del Plan

**9/10 mejoras completadas (90%)**

1. ✅ Sistema de Notificaciones/Alertas
2. ✅ Dashboard Mejorado con Métricas
3. ✅ Búsqueda Global (Ctrl+K)
4. ✅ Tipos TypeScript Específicos
5. ✅ Sistema de Auditoría
6. ✅ Internacionalización Completa
7. ✅ Exportación Avanzada de Reportes
8. ✅ Sistema de Backup/Restauración
9. ✅ **Modo Offline** ← **RECIÉN COMPLETADO**
10. ⏳ Optimización de Performance

## 🎉 Conclusión

El sistema de modo offline implementado proporciona:

1. ✅ **Detección Automática**: Monitoreo del estado de conexión en tiempo real
2. ✅ **Queue de Operaciones**: Cola persistente con sincronización automática
3. ✅ **Almacenamiento Local**: IndexedDB para datos persistentes con caché TTL
4. ✅ **Sincronización Inteligente**: Reintentos automáticos con límites
5. ✅ **Interfaz Completa**: Indicador flotante y módulo de gestión
6. ✅ **Estadísticas Detalladas**: Por módulo, tipo y estado
7. ✅ **Traducciones**: Soporte multiidioma
8. ✅ **Diseño Consistente**: Glassmorphism en toda la interfaz

Este sistema permite que la aplicación Banque Alimentaire funcione completamente offline, guardando todas las operaciones localmente y sincronizándolas automáticamente cuando se restaura la conexión, mejorando significativamente la disponibilidad y confiabilidad del sistema.

**Estado**: ✅ Implementado y Funcional  
**Próxima Mejora**: Optimización de Performance (Mejora #10)

---

*Última actualización: Febrero 23, 2026*
*Sistema implementado con soporte completo offline y sincronización automática*
