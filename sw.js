const CACHE = 'aura-v6';
const STATIC = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
const CDN_CACHE = 'aura-cdn-v1';
const CDN_URLS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(()=>{}),
    caches.open(CDN_CACHE).then(c => c.addAll(CDN_URLS)).catch(()=>{})
  ]));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE && k !== CDN_CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (e.request.method !== 'GET') return;

  // HTML — toujours réseau d'abord
  if (url.endsWith('.html') || url.endsWith('/') || url.includes('/?')) {
    e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')));
    return;
  }

  // React CDN — cache d'abord (ne change jamais)
  if (url.includes('unpkg.com')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      caches.open(CDN_CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    })));
    return;
  }

  // Images Unsplash — cache 7 jours
  if (url.includes('unsplash.com')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => new Response('', {status: 404}))));
    return;
  }

  // Supabase API — toujours réseau
  if (url.includes('supabase.co')) return;

  // Autres — réseau avec fallback cache
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('push', e => {
  let data = { title: '✦ Aura', body: 'Nouvelle notification' };
  try { data = e.data ? e.data.json() : data; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title || '✦ Aura', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
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
