// Service Worker for Afficixo PWA
// Optimized for fast splash screen and app loading

const CACHE_NAME = 'afficixo-v1';
const ASSETS_CACHE = 'afficixo-assets-v1';
const RUNTIME_CACHE = 'afficixo-runtime-v1';

// Assets to cache immediately (critical for fast startup)
const CRITICAL_ASSETS = [
  '/',
  '/site.webmanifest',
  '/splash-screen.html',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).then(() => {
        self.skipWaiting();
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        }).catch(() => {
          // Return offline page if available
          return caches.match('/');
        });
      })
    );
    return;
  }

  // Handle API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Handle other requests - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const cacheName = url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2)$/) 
            ? ASSETS_CACHE 
            : RUNTIME_CACHE;
          
          caches.open(cacheName).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Return a placeholder or cached response
        if (request.destination === 'image') {
          return caches.match('/web-app-manifest-192x192.png');
        }
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-user-data') {
    event.waitUntil(
      // Sync user data when connection is restored
      fetch('/api/sync', { method: 'POST' })
        .catch(() => Promise.resolve())
    );
  }
});

// Push notifications support
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/web-app-manifest-192x192.png',
    badge: '/web-app-manifest-192x192.png',
    tag: 'afficixo-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('Afficixo', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if necessary
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
