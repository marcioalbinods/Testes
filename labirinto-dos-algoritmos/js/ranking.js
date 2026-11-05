/* =========================================================
   LABIRINTO DOS ALGORITMOS — Ranking LOCAL (só deste aparelho)
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, esc = UI.esc, Store = LA.Store;

  var R = LA.Ranking = { tab: 'geral', world: 1, level: 1 };

  R.rows = function () {
    var players = Store.players();
    var rows = players.map(function (p) {
      var levels = LA.LEVELS;
      if (R.tab === 'mundo') levels = LA.levelsOfWorld(R.world);
      if (R.tab === 'fase') levels = [LA.levelById(R.level)];
      var t = Store.totals(p, levels);
      var all = Store.totals(p);
      return { p: p, score: t.score, stars: t.stars, done: t.done, worlds: all.worlds, ach: all.achievements };
    });
    if (R.tab === 'conquistas') {
      rows = rows.filter(function (r) { return r.ach > 0; });
      rows.sort(function (a, b) { return b.ach - a.ach || b.score - a.score; });
    } else {
      rows = rows.filter(function (r) { return r.score > 0 || r.done > 0; });
      rows.sort(function (a, b) { return b.score - a.score || b.stars - a.stars || b.done - a.done || a.p.num - b.p.num; });
    }
    return rows;
  };

  R.render = function () {
    UI.$$('#rank-tabs .tab').forEach(function (t) { t.classList.toggle('on', t.dataset.tab === R.tab); t.setAttribute('aria-selected', t.dataset.tab === R.tab); });
    var f = $('#rank-filter');
    f.innerHTML = '';
    if (R.tab === 'mundo') {
      LA.WORLDS.forEach(function (w) {
        f.appendChild(chip(w.emoji + ' ' + w.short, R.world === w.id, function () { R.world = w.id; R.render(); }));
      });
    } else if (R.tab === 'fase') {
      LA.LEVELS.forEach(function (l) {
        f.appendChild(chip(String(l.id), R.level === l.id, function () { R.level = l.id; R.render(); }));
      });
    }
    var rows = R.rows();
    var me = Store.player();
    var pod = $('#podium');
    var table = $('#rank-table');
    if (!rows.length) {
      pod.innerHTML = '<div class="empty-state">🏁 Ainda não há resultados ' + (R.tab === 'conquistas' ? 'de conquistas' : 'aqui') + ' neste aparelho.<br>Jogue algumas fases e volte!</div>';
      table.innerHTML = '';
      return;
    }
    var metric = function (r) { return R.tab === 'conquistas' ? r.ach + ' 🏅' : r.score + ' pts'; };
    // pódio: 2º, 1º, 3º
    var order = [1, 0, 2];
    var heights = { 0: 170, 1: 125, 2: 95 };
    var medals = ['🥇', '🥈', '🥉'];
    pod.innerHTML = order.map(function (i) {
      var r = rows[i];
      if (!r) return '<div class="pod" style="visibility:hidden"></div>';
      return '<div class="pod p' + (i + 1) + '">' + LA.ART.avatar(r.p, 64) +
        '<div class="pname">' + esc(Store.label(r.p)) + '</div><div class="pscore">' + metric(r) + ' · ' + r.stars + '★</div>' +
        '<div class="pod-bar" data-h="' + heights[i] + '">' + medals[i] + '</div></div>';
    }).join('');
    requestAnimationFrame(function () { setTimeout(function () { UI.$$('.pod-bar', pod).forEach(function (b) { b.style.height = b.dataset.h + 'px'; }); }, 30); });

    var head = R.tab === 'conquistas'
      ? '<tr><th>#</th><th>Jogador</th><th>Conquistas</th><th>Pontos</th><th>Estrelas</th></tr>'
      : '<tr><th>#</th><th>Jogador</th><th>Pontos</th><th>Fases concluídas</th><th>Estrelas</th><th>Mundos</th></tr>';
    var maxDone = R.tab === 'mundo' ? 5 : R.tab === 'fase' ? 1 : 25;
    table.innerHTML = '<thead>' + head + '</thead><tbody>' + rows.map(function (r, i) {
      var who = '<div class="rank-who">' + LA.ART.avatar(r.p, 36) + esc(Store.name(r.p)) +
        (r.p.device !== Store.device ? '<span class="tag-imp">aparelho ' + esc(r.p.device) + '</span>' : '') + '</div>';
      var pos = i < 3 ? medals[i] : (i + 1) + 'º';
      var cls = me && r.p.id === me.id ? ' class="me"' : '';
      var style = ' style="animation-delay:' + Math.min(i, 12) * 0.05 + 's"';
      if (R.tab === 'conquistas') return '<tr' + cls + style + '><td>' + pos + '</td><td>' + who + '</td><td>' + r.ach + ' de ' + LA.ACHIEVEMENTS.length + '</td><td>' + r.score + '</td><td>' + r.stars + ' ★</td></tr>';
      return '<tr' + cls + style + '><td>' + pos + '</td><td>' + who + '</td><td><b>' + r.score + '</b></td><td>' + r.done + ' de ' + maxDone + '</td><td>' + r.stars + ' ★</td><td>' + r.worlds + ' de 5</td></tr>';
    }).join('') + '</tbody>';
  };

  function chip(label, on, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip' + (on ? ' on' : ''); b.textContent = label;
    b.onclick = function () { LA.sfx('click'); fn(); };
    return b;
  }

  R.init = function () {
    UI.$$('#rank-tabs .tab').forEach(function (t) {
      t.onclick = function () { LA.sfx('click'); R.tab = t.dataset.tab; R.render(); };
    });
  };

  /* ---------- Exportar / Importar ---------- */
  R.exportDialog = function () {
    return UI.modal({
      title: '📤 Exportar resultados',
      html: '<p>Salve um arquivo com os resultados <b>deste aparelho</b>. Depois você pode levar o arquivo (pendrive, e-mail, Google Drive…) e importar em outro aparelho para reunir tudo.</p>' +
        '<p style="font-size:15px">O arquivo contém apenas números de jogador genéricos, pontos e estrelas. Nenhum nome ou dado pessoal.</p>',
      buttons: [
        { label: '📄 Planilha (CSV)', value: 'csv', cls: 'btn-teal' },
        { label: '💾 Arquivo do jogo (JSON)', value: 'json', cls: 'btn-blue' }
      ]
    }).then(function (v) {
      var stamp = new Date().toISOString().slice(0, 10);
      if (v === 'json') UI.download('labirinto-resultados-' + Store.device + '-' + stamp + '.json', Store.exportJSON(), 'application/json');
      if (v === 'csv') UI.download('labirinto-resultados-' + Store.device + '-' + stamp + '.csv', Store.exportCSV(), 'text/csv;charset=utf-8');
      if (v) UI.toast('📤', 'Arquivo gerado!', 'Procure na pasta de downloads.');
    });
  };
  R.importDialog = function () {
    return UI.modal({
      title: '📥 Importar resultados',
      html: '<p>Escolha um arquivo <b>.json</b> ou <b>.csv</b> exportado pelo Labirinto dos Algoritmos em outro aparelho.</p>' +
        '<p>Os jogadores de outros aparelhos aparecem no ranking com o código do aparelho (ex.: “Jogador 2 · aparelho K7MP”). Se um resultado já existir, fica valendo o <b>melhor</b>.</p>',
      buttons: [{ label: 'Cancelar', value: false }, { label: '📂 Escolher arquivo', value: true, cls: 'btn-green' }]
    }).then(function (ok) {
      if (!ok) return;
      return UI.pickFile().then(function (f) {
        if (!f) return;
        try {
          var r = Store.importText(f.text, f.name);
          UI.alert('✅ Importação concluída', 'Jogadores novos: <b>' + r.added + '</b>. Jogadores atualizados: <b>' + r.merged + '</b>.');
          if (UI.current === 'ranking') R.render();
        } catch (e) {
          UI.alert('😕 Não foi possível importar', 'Motivo: ' + esc(e.message) + '. Confira se o arquivo foi exportado por este jogo.');
        }
      });
    });
  };
})(globalThis.LA = globalThis.LA || {});
