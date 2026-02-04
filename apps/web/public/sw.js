/**
 * Minimal Service Worker - Offline Page Only
 * 
 * This service worker ONLY caches the offline page.
 * All other requests go directly to the network with no caching.
 */

const OFFLINE_PAGE = '/offline';
const CACHE_NAME = 'offline-v1';

// Install: cache only the offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_PAGE))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-only, fallback to offline page for navigation requests
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_PAGE))
    );
  }
  // All other requests (API, assets, etc.) go directly to network - no SW involvement
});
