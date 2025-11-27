const CACHE_NAME = 'greenhive-v2'; // Mudei para v2 para forçar atualização
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/state-and-handlers.js',
  '/ui-components.js',
  '/firebase-config.js',
  '/manifest.json',        // Importante cachear o manifesto
  '/assets/favicon.png',   // <--- ADICIONE
  '/assets/icon-192.png',  // <--- ADICIONE
  '/assets/icon-512.png'   // <--- ADICIONE
];

// Instalação do Service Worker e Cache dos arquivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Intercepta as requisições: Se tiver no cache, usa o cache. Se não, busca na rede.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Atualização do Service Worker (Limpa caches antigos)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});