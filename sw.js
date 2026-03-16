const CACHE = 'aura-v5';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.endsWith('.html') || e.request.url.endsWith('/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Handle real push notifications from server
self.addEventListener('push', e => {
  let data = { title: '✦ Aura', body: 'Nouvelle notification' };
  try { data = e.data ? e.data.json() : data; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title || '✦ Aura', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data,
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow('/');
  }));
});
