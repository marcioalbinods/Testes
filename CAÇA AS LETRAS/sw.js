/* CAÇADORES DE LETRAS — Service worker: guarda os arquivos para jogar sem internet. */
const CACHE = 'cacadores-de-letras-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/style.css', './css/game.css', './css/responsive.css',
  './js/config.js', './js/art.js', './js/scenes.js', './js/levels.js', './js/illustrations.js', './js/character.js',
  './js/audio.js', './js/timer.js', './js/progress.js', './js/effects.js', './js/game.js', './js/teacher-panel.js', './js/app.js',
  './assets/fonts/fredoka.woff2', './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Rede primeiro (para receber atualizações); se estiver sem internet, usa o cache.
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
