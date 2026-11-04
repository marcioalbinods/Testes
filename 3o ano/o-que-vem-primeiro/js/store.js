/* O QUE VEM PRIMEIRO? — Progresso salvo só neste aparelho (localStorage).
   Nada de nomes, e-mails ou dados pessoais. */
(function (root) {
  'use strict';
  const KEY = 'oqvp-progresso-v1';
  const fresh = () => ({ v: 1, missions: {}, sound: true, teacher: false, seenHowTo: false });
  let mem = null;
  function load() {
    if (mem) return mem;
    try {
      const raw = root.localStorage.getItem(KEY);
      mem = raw ? Object.assign(fresh(), JSON.parse(raw)) : fresh();
    } catch (e) { mem = fresh(); }
    return mem;
  }
  function save(p) {
    mem = p;
    try { root.localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* navegador sem armazenamento: o jogo continua na memória */ }
  }
  function update(fn) { const p = JSON.parse(JSON.stringify(load())); fn(p); save(p); return p; }
  function reset() { const keepSound = load().sound; mem = null; try { root.localStorage.removeItem(KEY); } catch (e) { /* ok */ } const p = fresh(); p.sound = keepSound; save(p); return p; }
  root.OQVP = root.OQVP || {};
  root.OQVP.store = { load, save, update, reset, KEY };
})(window);
