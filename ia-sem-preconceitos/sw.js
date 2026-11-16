/* TREINANDO UMA IA SEM PRECONCEITOS — Service worker: guarda os arquivos para jogar sem internet. */
const CACHE = 'nexuslab-ia-justa-v2';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/data.js', './js/art.js', './js/audio.js', './js/engine.js', './js/cloud.js', './js/mechanics.js', './js/app.js',
  './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/fonts/orbitron-latin-500-normal.woff2', './assets/fonts/orbitron-latin-700-normal.woff2', './assets/fonts/orbitron-latin-900-normal.woff2',
  './assets/fonts/exo-2-latin-400-normal.woff2', './assets/fonts/exo-2-latin-400-italic.woff2', './assets/fonts/exo-2-latin-600-normal.woff2', './assets/fonts/exo-2-latin-700-normal.woff2'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (para receber atualizações); sem internet, usa o que está guardado.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
