/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'dreamwell-v1';
const RUNTIME_CACHE = 'dreamwell-runtime';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // For audio files and external resources, try network first, then cache
    if (request.url.includes('freesound.org') || request.url.includes('.mp3')) {
      event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
    }
    return;
  }

  // For same-origin requests
  if (request.method === 'GET') {
    // Cache-first strategy for static assets
    if (
      request.url.includes('.js') ||
      request.url.includes('.css') ||
      request.url.includes('.png') ||
      request.url.includes('.jpg') ||
      request.url.includes('.svg') ||
      request.url.includes('.woff') ||
      request.url.includes('.woff2')
    ) {
      event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    }
    // Network-first strategy for HTML and API calls
    else {
      event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
    }
  }
});

// Cache-first strategy: check cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache-first fetch failed:', error);
    // Return a fallback offline page if available
    const cache = await caches.open(cacheName);
    const fallback = await cache.match('/index.html');
    return fallback || new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Network-first strategy: try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, checking cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }

    console.error('[Service Worker] No cache available for:', request.url);
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
