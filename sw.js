// Service Worker pour PWA - Banque Alimentaire
// Version: 1.0.0

const CACHE_NAME = 'banque-alimentaire-v1';
const RUNTIME_CACHE = 'banque-alimentaire-runtime';

// Recursos esenciales para cachear
const ESSENTIAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando recursos esenciales');
        return cache.addAll(ESSENTIAL_RESOURCES.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear recursos:', error);
      })
  );
  
  // Activar inmediatamente el nuevo Service Worker
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Eliminar caches antiguos
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Tomar control de todas las páginas inmediatamente
  self.clients.claim();
});

// Estrategia de fetch: Network First con Cache Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo cachear peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  // Ignorar peticiones de chrome-extension y otras extensiones
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Estrategia: Network First, luego Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar servir desde cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si es una navegación y no hay cache, servir página offline
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // Para otros recursos, retornar respuesta vacía
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Función para sincronizar datos
async function syncData() {
  console.log('[Service Worker] Sincronizando datos...');
  // Aquí se podría implementar la lógica de sincronización
  // Por ejemplo, enviar datos pendientes al servidor
  return Promise.resolve();
}

// Notificaciones Push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificación push recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'banque-alimentaire-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('Banque Alimentaire', options)
  );
});

// Clic en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic en notificación');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
