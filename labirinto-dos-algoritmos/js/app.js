/* =========================================================
   LABIRINTO DOS ALGORITMOS — Inicialização
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, Store = LA.Store, S = LA.Screens;
  var app = LA.app = {};

  app.applySettings = function () {
    var st = Store.settings;
    document.body.classList.toggle('reduce-motion', !!st.reduceMotion);
    if (app.scene) {
      app.scene.setQuality(st.quality);
      app.scene.reduceMotion = !!st.reduceMotion;
    }
    LA.Game.applySpeed();
    var badge = $('#demo-badge');
    if (st.demo && !badge) {
      badge = document.createElement('div'); badge.id = 'demo-badge'; badge.className = 'demo-badge';
      badge.textContent = '👩‍🏫 Modo demonstração';
      document.body.appendChild(badge);
    } else if (!st.demo && badge) badge.remove();
  };

  function boot() {
    Store.load();
    app.scene = new LA.Scene3D();
    app.scene.quality = Store.settings.quality;
    if (app.scene.ok) { app.scene.quality = 'auto'; app.scene.setQuality(Store.settings.quality); }
    LA.Game.init(app.scene);
    LA.Ranking.init();
    app.applySettings();

    UI.onShow('home', function () { S.home(); });
    UI.onShow('players', function (arg) { S.players(arg); });
    UI.onShow('map', function () { S.map(); });
    UI.onShow('ranking', function () { LA.Ranking.show(); });
    UI.onShow('achievements', function () { S.achievements(); });
    UI.onShow('howto', function () { S.howto(); });
    UI.onShow('settings', function () { S.settings(); });
    UI.onShow('avatar', function (arg, prev) { if (prev && prev !== 'avatar') S._avatarBack = prev === 'game' ? 'map' : prev; S.avatar(); });
    UI.onShow('lab', function (arg, prev) {
      if (prev === 'game' && LA.Game.level && LA.Game.level.custom) LA.Lab.program = LA.Game.customProgram || LA.Lab.program;
      LA.Lab.render();
    });

    document.addEventListener('click', function (e) {
      var go = e.target.closest('[data-go]');
      if (go) { LA.sfx('click'); UI.show(go.dataset.go); return; }
      var act = e.target.closest('[data-action]');
      if (!act) return;
      LA.sfx('click');
      switch (act.dataset.action) {
        case 'play': UI.show('players', 'map'); break;
        case 'continue': S.continueGame(); break;
        case 'lab': UI.show('lab'); break;
        case 'avatar': UI.show('avatar'); break;
        case 'export': LA.Ranking.exportDialog(); break;
        case 'import': LA.Ranking.importDialog(); break;
      }
    });
    $('#avatar-back').onclick = function () { LA.sfx('click'); LA.Shop.leave(); };

    // primeiro toque libera o áudio (exigência dos navegadores)
    var unlock = function () { LA.unlockAudio(); window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);
    // evita zoom acidental por gesto no iPad fora do editor
    document.addEventListener('gesturestart', function (e) { if (!e.target.closest || !e.target.closest('.blocklySvg')) e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && UI.hasModal()) { var c = document.querySelector('.modal-close'); if (c) c.click(); }
    });

    UI.show('home');
    // salvamento online (se o professor configurou o servidor em config.json)
    LA.Cloud.init().then(function (on) {
      if (!on) return;
      if (UI.current === 'home') S.home();
      if (UI.current === 'players') S.players();
      LA.Cloud.flush();
    });
    if (Store.warning) UI.alert('⚠️ Aviso', Store.warning);
    if (!app.scene.ok) UI.toast('😕', '3D indisponível', 'O navegador não abriu o WebGL. Atualize o navegador.', 6000);

    // PWA: guarda os arquivos para jogar sem internet (só funciona em http/https)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sem modo offline */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(globalThis.LA = globalThis.LA || {});
