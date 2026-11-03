/* O QUE VEM PRIMEIRO? — Service worker: guarda os arquivos para jogar sem internet. */
const CACHE = 'oqvp-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/logic.js', './js/data.js', './js/art.js', './js/robot.js', './js/audio.js', './js/store.js',
  './js/ui.js', './js/activities.js', './js/mission.js', './js/screens.js', './js/app.js',
  './assets/fonts/fredoka.woff2', './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('oqvp-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Rede primeiro (para receber atualizações); sem internet, usa a cópia guardada.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
