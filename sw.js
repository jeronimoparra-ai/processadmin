/**
 * ProcessAdmin Service Worker
 * PWA with Cache API for offline support
 * Version: 1.0.0
 */

const CACHE_NAME = 'processadmin-v1.0.0';
const ASSET_VERSION = 'v1.0.0';

// Resources to precache - all local resources
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  
  // CSS files
  '/assets/tokens.css',
  '/css/styles.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/utilities.css',
  '/css/academic.css',
  
  // Source files - all JS modules
  '/src/state/persistence.js',
  '/src/state/store.js',
  '/src/config/index.js',
  '/src/utils/helpers.js',
  '/src/components/icons/icons.js',
  '/src/components/layout/header.js',
  '/src/components/layout/sidebar.js',
  '/src/components/ui/uiComponents.js',
  '/src/services/storage.js',
  '/src/services/apa.js',
  '/src/services/apa7.js',
  '/src/services/apaRules.js',
  '/src/services/docxExport.js',
  '/src/services/academicValidator.js',
  '/src/features/panel.js',
  '/src/features/redactor.js',
  '/src/features/apa.js',
  '/src/features/rubrica.js',
  '/src/features/checklist.js',
  '/src/features/organizador.js',
  '/src/features/historial.js',
  '/src/features/legal.js',
  '/src/features/acerca.js',
  '/src/features/exportador.js',
  '/src/features/academico/domain.js',
  '/src/features/academico/planner.js',
  '/src/features/academico/library.js',
  '/src/features/academico/studio.js',
  '/src/features/academico/review.js',
  '/src/features/academico/publishing.js',
  '/src/app/main.js',
  
  // Vendor files
  '/assets/vendor/chart-4.4.8.umd.js',
  
  // Assets
  '/assets/formato-ejemplo.json',
  '/assets/word-template-ejemplo.docx',
  
  // Icons
  '/assets/icons/redactor.svg',
  '/assets/icons/validation.svg',
  '/assets/icons/review.svg',
  '/assets/icons/panel.svg',
  '/assets/icons/ideas.svg',
  '/assets/icons/export-word.svg',
  '/assets/icons/apa.svg',
  '/assets/icons/achievement.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  
  // Other HTML
  '/og-image.html',
  
  // Manifest
  '/manifest.json'
];

// Runtime cache for external resources (CDN fallback)
const RUNTIME_CACHE = 'processadmin-runtime-' + ASSET_VERSION;

// External resources that should be cached for offline use
const EXTERNAL_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2',
  'https://fonts.gstatic.com'
];

/**
 * Add version query string to local resources for cache busting
 */
function addVersionToUrl(url) {
  const urlObj = new URL(url, self.location.origin);
  
  // Don't add version to external URLs or already versioned URLs
  if (urlObj.hostname !== self.location.hostname || urlObj.search.includes('v=')) {
    return url;
  }
  
  // Add version query parameter
  urlObj.searchParams.set('v', ASSET_VERSION);
  return urlObj.toString();
}

/**
 * Precache all resources
 */
async function precache() {
  const cache = await caches.open(CACHE_NAME);
  
  console.log('[SW] Precaching resources...');
  
  // Precache all local resources
  const precachePromises = PRECACHE_RESOURCES.map(async (url) => {
    try {
      const versionedUrl = addVersionToUrl(url);
      const response = await fetch(versionedUrl, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        // Cache both the versioned and non-versioned URLs
        await cache.put(url, response.clone());
        if (versionedUrl !== url) {
          await cache.put(versionedUrl, response.clone());
        }
        console.log(`[SW] Cached: ${url}`);
      } else {
        console.warn(`[SW] Failed to cache ${url}: ${response.status}`);
      }
    } catch (error) {
      console.error(`[SW] Error caching ${url}:`, error);
    }
  });
  
  await Promise.all(precachePromises);
  console.log('[SW] Precaching complete');
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
  const cacheKeys = await caches.keys();
  const currentCacheNames = [CACHE_NAME, RUNTIME_CACHE];
  
  for (const cacheName of cacheKeys) {
    if (!currentCacheNames.includes(cacheName)) {
      console.log(`[SW] Deleting old cache: ${cacheName}`);
      await caches.delete(cacheName);
    }
  }
}

/**
 * Handle install event - precache resources
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      precache(),
      self.skipWaiting() // Force the waiting service worker to become active
    ])
  );
});

/**
 * Handle activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      clients.claim() // Take control of all clients immediately
    ])
  );
});

/**
 * Handle fetch event - serve from cache with cache-first strategy for local resources
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip non-local resources (except external resources we want to cache)
  if (url.hostname !== self.location.hostname && 
      !EXTERNAL_RESOURCES.some(resource => url.href.startsWith(resource) || new URL(resource).hostname === url.hostname)) {
    return;
  }
  
  // Check if this is a local resource
  const isLocalResource = url.hostname === self.location.hostname ||
    PRECACHE_RESOURCES.includes(url.pathname) ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/assets/');
  
  event.respondWith(
    (async () => {
      // Try to serve from cache first
      const cache = await caches.open(CACHE_NAME);
      let cachedResponse = await cache.match(event.request);
      
      // If not found, try without query parameters
      if (!cachedResponse) {
        const cleanUrl = new URL(event.request.url);
        cleanUrl.search = '';
        cachedResponse = await cache.match(cleanUrl.toString());
      }
      
      // If we have a cached response, return it
      if (cachedResponse) {
        console.log(`[SW] Serving from cache: ${event.request.url}`);
        return cachedResponse;
      }
      
      // Otherwise, fetch from network
      try {
        const response = await fetch(event.request);
        
        // Cache successful responses for local resources
        if (isLocalResource && response.ok) {
          console.log(`[SW] Caching on-the-fly: ${event.request.url}`);
          cache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        console.error(`[SW] Fetch failed for ${event.request.url}:`, error);
        
        // Try to return a fallback for HTML requests
        if (event.request.headers.get('Accept') && 
            event.request.headers.get('Accept').includes('text/html')) {
          return cache.match('/index.html');
        }
        
        // Return offline page or error
        return new Response(null, {
          status: 503,
          statusText: 'Service Unavailable - Offline'
        });
      }
    })()
  );
});

/**
 * Handle message event for controlled updates
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received skip waiting message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    console.log('[SW] Received update cache message');
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.add(event.data.url);
      })
    );
  }
});

/**
 * Background sync for failed requests
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'failed-requests') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const failedRequests = await cache.match('/failed-requests');
        
        if (failedRequests) {
          const requests = await failedRequests.json();
          for (const req of requests) {
            try {
              const response = await fetch(req.url, req.options);
              if (response.ok) {
                cache.put(req.url, response.clone());
              }
            } catch (error) {
              console.error(`[SW] Failed to sync ${req.url}:`, error);
            }
          }
        }
      })()
    );
  }
});

/**
 * Handle push notifications (optional)
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ProcessAdmin', {
      body: data.body || 'Nueva notificación',
      icon: '/assets/icons/icon-192.png',
      data: data.url ? { url: data.url } : {}
    })
  );
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker loaded');
