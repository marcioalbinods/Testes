/* =========================================================
   LABIRINTO DOS ALGORITMOS — Ranking: da turma (online) ou deste aparelho
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, esc = UI.esc, Store = LA.Store;

  var R = LA.Ranking = { tab: 'geral', world: 1, level: 1, source: null, loading: false, error: null, fresh: {} };
  /* Ao abrir a tela, busca de novo os grupos da turma. */
  R.show = function () { R.fresh = {}; R.render(); };

  /* De onde vêm os grupos: 'local' (este aparelho) ou uma turma (online). */
  function sources() { return LA.Cloud.enabled() ? LA.Cloud.turmas.slice() : []; }
  function playersOfSource() {
    if (R.source === 'local') return Store.players();
    var me = Store.player();
    var list = (LA.Cloud.cached(R.source) || []).map(LA.Screens.cloudPseudo);
    // o grupo atual usa a cópia deste aparelho (pode ter algo que ainda não subiu)
    if (me && me.cloud && me.turma === R.source) {
      var found = false;
      list = list.map(function (q) { if (q.cloudCode === me.cloud.code) { found = true; return me; } return q; });
      if (!found) list.push(me);
    }
    return list;
  }
  function isMe(p) {
    var me = Store.player();
    return !!me && (p.id === me.id || (!!p.cloudCode && !!me.cloud && me.cloud.code === p.cloudCode));
  }

  R.rows = function () {
    var players = playersOfSource();
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
    var me0 = Store.player(), srcs = sources();
    if (!R.source || (R.source !== 'local' && srcs.indexOf(R.source) < 0)) R.source = me0 && me0.turma && srcs.indexOf(me0.turma) >= 0 ? me0.turma : srcs[0] || 'local';
    var sc = $('#rank-source');
    sc.innerHTML = '';
    if (srcs.length) {
      srcs.forEach(function (t) { sc.appendChild(chip('☁️ Turma ' + LA.turmaLabel(t), R.source === t, function () { R.source = t; R.load(); })); });
      sc.appendChild(chip('📍 Este aparelho', R.source === 'local', function () { R.source = 'local'; R.render(); }));
    }
    var banner = $('#rank-banner');
    if (R.source === 'local') banner.innerHTML = '📍 <b>Ranking deste aparelho.</b> ' + (srcs.length ? 'Mostra só os grupos que jogaram aqui.' : 'Cada tablet ou computador tem o seu. Para juntar resultados de vários aparelhos, use <b>Exportar</b> em cada um e <b>Importar</b> no aparelho do professor.');
    else if (R.error) banner.innerHTML = '⚠️ ' + esc(R.error);
    else banner.innerHTML = '☁️ <b>Ranking da turma ' + esc(LA.turmaLabel(R.source)) + '</b>, com os grupos de todos os aparelhos.' + (R.loading ? ' 🔄 Atualizando…' : '');
    if (R.source !== 'local' && !R.fresh[R.source] && !R.loading && !R.error) { R.load(); return; }
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
    var pod = $('#podium');
    var table = $('#rank-table');
    if (!rows.length) {
      pod.innerHTML = '<div class="empty-state">' + (R.loading ? '🔄 Carregando os grupos da turma…' : '🏁 Ainda não há resultados ' + (R.tab === 'conquistas' ? 'de conquistas' : 'aqui') + (R.source === 'local' ? ' neste aparelho' : '') + '.<br>Joguem algumas fases e voltem!') + '</div>';
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
        '<div class="pname">' + esc(Store.name(r.p)) + '</div><div class="pscore">' + metric(r) + ' · ' + r.stars + '★</div>' +
        '<div class="pod-bar" data-h="' + heights[i] + '">' + medals[i] + '</div></div>';
    }).join('');
    requestAnimationFrame(function () { setTimeout(function () { UI.$$('.pod-bar', pod).forEach(function (b) { b.style.height = b.dataset.h + 'px'; }); }, 30); });

    var head = R.tab === 'conquistas'
      ? '<tr><th>#</th><th>Jogador</th><th>Conquistas</th><th>Pontos</th><th>Estrelas</th></tr>'
      : '<tr><th>#</th><th>Jogador</th><th>Pontos</th><th>Fases concluídas</th><th>Estrelas</th><th>Mundos</th></tr>';
    var maxDone = R.tab === 'mundo' ? 5 : R.tab === 'fase' ? 1 : 25;
    table.innerHTML = '<thead>' + head + '</thead><tbody>' + rows.map(function (r, i) {
      var who = '<div class="rank-who">' + LA.ART.avatar(r.p, 36) + esc(Store.name(r.p)) +
        (R.source === 'local' && r.p.device !== Store.device ? '<span class="tag-imp">aparelho ' + esc(r.p.device) + '</span>' : '') +
        (R.source === 'local' && r.p.turma ? '<span class="tag-imp">' + esc(LA.turmaLabel(r.p.turma)) + '</span>' : '') + '</div>';
      var pos = i < 3 ? medals[i] : (i + 1) + 'º';
      var cls = isMe(r.p) ? ' class="me"' : '';
      var style = ' style="animation-delay:' + Math.min(i, 12) * 0.05 + 's"';
      if (R.tab === 'conquistas') return '<tr' + cls + style + '><td>' + pos + '</td><td>' + who + '</td><td>' + r.ach + ' de ' + LA.ACHIEVEMENTS.length + '</td><td>' + r.score + '</td><td>' + r.stars + ' ★</td></tr>';
      return '<tr' + cls + style + '><td>' + pos + '</td><td>' + who + '</td><td><b>' + r.score + '</b></td><td>' + r.done + ' de ' + maxDone + '</td><td>' + r.stars + ' ★</td><td>' + r.worlds + ' de 5</td></tr>';
    }).join('') + '</tbody>';
  };

  /* Busca os grupos da turma no servidor. */
  R.load = function () {
    var t = R.source;
    R.loading = true; R.error = null; R.fresh[t] = 1; R.render();
    LA.Cloud.flush().then(function () { return LA.Cloud.turma(t, true); }).then(function () {
      R.loading = false; if (UI.current === 'ranking' && R.source === t) R.render();
    }, function (e) {
      R.loading = false; R.error = (e.offline ? 'Sem internet: não deu para carregar o ranking da turma. Toque em “📍 Este aparelho” para ver o ranking local.' : e.message);
      if (UI.current === 'ranking' && R.source === t) R.render();
      R.error = null;
    });
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
        '<p style="font-size:15px">O arquivo contém a turma, o primeiro nome dos integrantes de cada grupo, pontos, estrelas e conquistas. A senha de figuras não vai no arquivo.</p>',
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
