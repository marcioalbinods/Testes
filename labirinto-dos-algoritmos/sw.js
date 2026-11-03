/* LABIRINTO DOS ALGORITMOS — Service worker: guarda os arquivos para jogar sem internet. */
const CACHE = 'labirinto-algoritmos-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/base.css', './css/screens.css', './css/game.css', './css/responsive.css',
  './vendor/three.min.js', './vendor/blockly/blockly_compressed.js', './vendor/blockly/msg/pt-br.js',
  './vendor/blockly/media/sprites.png', './vendor/blockly/media/sprites.svg', './vendor/blockly/media/1x1.gif',
  './vendor/blockly/media/delete-icon.svg', './vendor/blockly/media/dropdown-arrow.svg', './vendor/blockly/media/foldout-icon.svg',
  './vendor/blockly/media/handclosed.cur', './vendor/blockly/media/handdelete.cur', './vendor/blockly/media/handopen.cur',
  './vendor/blockly/media/resize-handle.svg', './vendor/blockly/media/click.mp3', './vendor/blockly/media/delete.mp3', './vendor/blockly/media/disconnect.mp3',
  './js/levels.js', './js/engine.js', './js/interpreter.js', './js/scoring.js', './js/achievements.js', './js/storage.js',
  './js/audio.js', './js/byte3d.js', './js/scene3d.js', './js/blocks.js', './js/ui.js', './js/illustrations.js',
  './js/game.js', './js/ranking.js', './js/lab.js', './js/screens.js', './js/app.js',
  './assets/fonts/fredoka.woff2', './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('labirinto-algoritmos-') && k !== CACHE).map((k) => caches.delete(k))))
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
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
