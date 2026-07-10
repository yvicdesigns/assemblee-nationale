const CACHE = 'an-congo-v3';
const STATIC = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/cms.js',
  '/logo/logo-dark-small.png',
  '/favicon.svg',
  '/pages/deputes.html',
  '/pages/blog.html',
  '/pages/commissions.html',
  '/pages/presidence.html',
  '/pages/bureau.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
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
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
      return cached || network;
    })
  );
});
