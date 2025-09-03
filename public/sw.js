// Cache configuration
const CACHE_NAME = 'assetflow-pwa-cache-v3';
const STATIC_CACHE = CACHE_NAME + '-static';
const IMAGES_CACHE = CACHE_NAME + '-images';
const FONTS_CACHE = CACHE_NAME + '-fonts';
const OFFLINE_URL = '/offline.html';

// Resources to precache
const STATIC_CACHE_URLS = [
  '/',
  '/scan',
  '/reports',
  '/login',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes that should be cached
const API_CACHE_PATTERNS = [
  /\/api\//,
];

// File types for different caches
const STATIC_PATTERNS = [
  /\.(?:css|js)$/,
  /\/_next\/static\//,
];

const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|gif|svg|webp|avif)$/,
];

const FONT_PATTERNS = [
  /\.(?:woff|woff2|ttf|eot)$/,
];

// Installation: Cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      caches.open(IMAGES_CACHE),
      caches.open(FONTS_CACHE),
    ])
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activation: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const validCaches = [STATIC_CACHE, IMAGES_CACHE, FONTS_CACHE];
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch: Implement different caching strategies for different resource types
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE)
              .then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page for failed API calls
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle images with cache-first strategy (long-term cache)
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(IMAGES_CACHE)
        .then(cache => cache.match(event.request))
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(IMAGES_CACHE)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }

  // Handle fonts with cache-first strategy (long-term cache)
  if (FONT_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(FONTS_CACHE)
        .then(cache => cache.match(event.request))
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(FONTS_CACHE)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }

  // Handle static resources (CSS, JS, Next.js static files) with cache-first strategy
  if (STATIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then(cache => cache.match(event.request))
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }

  // Handle navigation requests and other resources
  event.respondWith(
    caches.open(STATIC_CACHE)
      .then(cache => cache.match(event.request))
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) {
              return response;
            }

            // Cache successful responses
            const responseClone = response.clone();
            caches.open(STATIC_CACHE)
              .then((cache) => cache.put(event.request, responseClone));

            return response;
          })
          .catch(() => {
            // Network failed, return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('', { status: 404 });
          });
      })
  );
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
