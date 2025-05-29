    // sw.js - Basic Service Worker

    const CACHE_NAME = 'quick-notes-local-v1';
    // List of files to cache. Adjust index.html if your main file has a different name.
    const urlsToCache = [
      './', // Represents the root directory, often resolves to index.html
      './index.html', // Or your specific HTML file name
      // Add paths to your CSS and JS files if they are separate
      // e.g., './style.css', './app.js'
      // For this example, Tailwind is via CDN, so we won't cache it here.
      // Also, not caching icons explicitly here, but browser might cache them.
    ];

    // Install event: opens the cache and adds core app files to it.
    self.addEventListener('install', event => {
      console.log('Service Worker: Installing...');
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            console.log('Service Worker: Caching app shell');
            return cache.addAll(urlsToCache);
          })
          .then(() => {
            console.log('Service Worker: App shell cached successfully');
            return self.skipWaiting(); // Force the waiting service worker to become the active service worker.
          })
          .catch(error => {
            console.error('Service Worker: Caching failed', error);
          })
      );
    });

    // Activate event: clean up old caches.
    self.addEventListener('activate', event => {
      console.log('Service Worker: Activating...');
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME) {
                console.log('Service Worker: Deleting old cache', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        }).then(() => {
            console.log('Service Worker: Activated successfully');
            return self.clients.claim(); // Take control of all open clients without a reload.
        })
      );
    });

    // Fetch event: serve assets from cache if available, otherwise fetch from network.
    self.addEventListener('fetch', event => {
      // We only want to cache GET requests.
      if (event.request.method !== 'GET') {
        return;
      }

      event.respondWith(
        caches.match(event.request)
          .then(response => {
            if (response) {
              // Serve from cache
              // console.log('Service Worker: Serving from cache', event.request.url);
              return response;
            }
            // Not in cache, fetch from network
            // console.log('Service Worker: Fetching from network', event.request.url);
            return fetch(event.request).then(
                networkResponse => {
                    // Optionally, cache new requests dynamically if needed
                    // For this basic setup, we primarily rely on the install-time cache.
                    return networkResponse;
                }
            ).catch(error => {
                console.error('Service Worker: Fetch failed', error);
                // You could return a custom offline page here if you have one cached.
            });
          })
      );
    });
    
