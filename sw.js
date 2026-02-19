const CACHE_NAME = 'ramadan-pro-v3'; // Upgraded cache version
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Install & Cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the new offline worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching offline files...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate & Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages right away
});

// 3. Smart Fetching (Offline Fallback)
self.addEventListener('fetch', (event) => {
  // We DO NOT want the offline worker to interfere with live API calls.
  // Our HTML file already has a smart offline fallback for the prayer times!
  if (event.request.url.includes('api.aladhan.com') || event.request.url.includes('api.alquran.cloud')) {
    return; // Let it pass through normally
  }

  // For everything else (HTML, CSS, Images), use the cache!
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return the cached file, OR try to download it if we don't have it
      return cachedResponse || fetch(event.request);
    }).catch(() => {
      // If the internet is off and we can't find the file, just return the main app
      return caches.match('./index.html');
    })
  );
});
