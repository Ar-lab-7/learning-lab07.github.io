
// Service Worker for Learning Lab PWA

const CACHE_NAME = 'learning-lab-v1.0.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/favicon.ico'
];

const RUNTIME_CACHE_NAME = 'learning-lab-runtime';

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network with cache update
self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension') ||
      event.request.url.includes('extension') ||
      !(event.request.url.startsWith('http'))) {
    return;
  }

  // For HTML navigation requests - network first with cache fallback
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/');
            });
        })
    );
    return;
  }

  // For other requests - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update the cache
            const cachePromise = caches.open(RUNTIME_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            return cachePromise;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // Return fallback content or error page
            return new Response('Network error', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });

        // Return the cached response or wait for network
        return cachedResponse || fetchPromise;
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from Learning Lab',
      icon: '/pwa-icon-192.png',
      badge: '/badge-icon.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Learning Lab Notification', 
        options
      )
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Open the target URL when notification is clicked
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle background sync for offline content
self.addEventListener('sync', event => {
  if (event.tag === 'sync-blogs') {
    event.waitUntil(syncBlogs());
  }
});

// Function to sync blogs when online
async function syncBlogs() {
  try {
    // Get the data from IndexedDB or localStorage
    const offlinePosts = await getOfflineData();
    
    // Send the data to your server/API
    for (const post of offlinePosts) {
      await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      });
      
      // Remove from offline storage after successful sync
      await removeOfflineData(post.id);
    }
    
    // Show a notification that sync is complete
    self.registration.showNotification('Learning Lab', {
      body: 'Your content has been synchronized successfully!',
      icon: '/pwa-icon-192.png'
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Helper function to get offline data
async function getOfflineData() {
  return JSON.parse(localStorage.getItem('offlineBlogs') || '[]');
}

// Helper function to remove synced offline data
async function removeOfflineData(id) {
  const offlineBlogs = JSON.parse(localStorage.getItem('offlineBlogs') || '[]');
  const updatedBlogs = offlineBlogs.filter(blog => blog.id !== id);
  localStorage.setItem('offlineBlogs', JSON.stringify(updatedBlogs));
}
