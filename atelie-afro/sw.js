/* ATELIÊ AFRO — service worker: guarda todos os arquivos para funcionar sem internet. */
const CACHE = 'atelie-afro-v2';
const ARQUIVOS = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/icones.js', './js/art/core.js', './js/art/people.js', './js/art/props.js', './js/art/scenery.js',
  './js/desenhos/registro.js', './js/desenhos/colecao1.js', './js/desenhos/colecao2.js', './js/desenhos/colecao3.js', './js/desenhos/colecao4.js', './js/desenhos/colecao5.js', './js/desenhos/colecao6.js', './js/desenhos/colecao7.js', './js/desenhos/colecao8.js', './js/desenhos/colecao9.js', './js/desenhos/colecao10.js',
  './js/paleta.js', './js/salvar.js', './js/som.js', './js/pintura.js', './js/galeria.js', './js/app.js',
  './assets/fonts/fredoka.woff2', './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.indexOf('atelie-afro-') === 0 && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (recebe atualizações); sem internet, usa o que está guardado.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
