/* O QUE VEM PRIMEIRO? — Inicialização e navegação entre telas. */
(function (root) {
  'use strict';
  const O = root.OQVP;
  const appEl = document.getElementById('app');

  const app = {
    current: null,
    show(screenEl) {
      O.ui.closeOverlays();
      appEl.replaceChildren(screenEl);
      screenEl.classList.add('enter');
      const h1 = screenEl.querySelector('h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); try { h1.focus({ preventScroll: true }); } catch (e) { /* ok */ } }
      window.scrollTo(0, 0);
    },
    go(name, arg) {
      if (name !== 'mission') O.mission.stopAll();
      O.ui.stopSpeak();
      app.current = name;
      if (name === 'mission') {
        const p = O.store.load();
        if (!O.logic.isUnlocked(p, arg, p.teacher)) { O.screens.map(app); return; }
        O.mission.start(app, arg);
      } else if (name === 'ending' && !O.logic.isDone(O.store.load(), 15)) {
        O.screens.map(app);
      } else if (O.screens[name]) {
        O.screens[name](app);
      } else {
        O.screens.home(app);
      }
    }
  };

  O.audio.setOn(O.store.load().sound !== false);

  // Atalho para professores: abrir com ?professor mostra a área do professor.
  O.screens.home(app);
  if (/[?&]professor\b/.test(location.search)) O.screens.teacherGate(app);

  // Funciona sem internet depois da primeira visita (somente quando aberto por http/https).
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  root.OQVP.app = app;
})(window);
