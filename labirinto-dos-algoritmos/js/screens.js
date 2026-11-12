/* =========================================================
   LABIRINTO DOS ALGORITMOS — Telas: início, jogadores, mapa,
   conquistas, como jogar, configurações e celebrações.
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, esc = UI.esc, Store = LA.Store;
  var S = LA.Screens = {};

  /* Início, grupos e senha de figuras: veja groups.js. Avatar e loja: shop.js. */
  S.afterPick = function () {
    var dest = S._afterPick;
    if (dest === 'continue') return S.continueGame();
    if (dest === 'home') return UI.show('home');
    var p = Store.player();
    if (dest === 'map' && p && !Object.keys(p.levels).length && !p.last) { LA.Game.open(LA.levelById(1)); return; }
    UI.show(dest);
  };
  S.continueGame = function () {
    var p = Store.player();
    if (!p) { UI.show('players', 'continue'); return; }
    var next = Store.nextLevel(p);
    if (!next) { UI.show('map'); return; }
    LA.Game.open(next);
  };

  /* ---------- Mapa dos mundos ---------- */
  S.map = function () {
    var p = Store.player();
    if (!p) { UI.show('players', 'map'); return; }
    var body = $('#map-body');
    var tot = Store.totals(p);
    $('#map-summary').innerHTML = '<span class="player-chip" style="cursor:default">' + LA.ART.avatar(p, 34) + ' ' + esc(Store.name(p)) + ' · ⭐ ' + tot.stars + '/75 · ' + tot.score + ' pts</span>';
    var next = Store.nextLevel(p);
    body.innerHTML = '';
    LA.WORLDS.forEach(function (w) {
      var levels = LA.levelsOfWorld(w.id);
      var unlocked = Store.worldUnlocked(w.id, p);
      var t = Store.totals(p, levels);
      var card = document.createElement('div');
      card.className = 'world-card' + (unlocked ? '' : ' locked');
      card.innerHTML = '<div class="world-art">' + LA.ART.world(w.theme) + (unlocked ? '' : '<div class="world-lock">🔒 Conclua o mundo anterior</div>') + '</div>' +
        '<div class="world-info"><h3><span class="wnum">Mundo ' + w.id + '</span>' + w.emoji + ' ' + esc(w.name) + '</h3>' +
        '<p>' + esc(w.desc) + '</p>' +
        '<div class="world-meta"><span>🎓 ' + esc(w.goal) + '</span><span>⭐ ' + t.stars + '/15</span><span>✅ ' + t.done + '/5</span>' + (t.done === 5 ? '<span>🏅 Mundo concluído!</span>' : '') + '</div>' +
        '<div class="level-path"></div></div>';
      var path = card.querySelector('.level-path');
      levels.forEach(function (l, i) {
        if (i) { var dot = document.createElement('span'); dot.className = 'path-dot'; path.appendChild(dot); }
        var r = p.levels[l.id];
        var open = Store.isUnlocked(l.id, p);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'level-node' + (r && r.completed ? ' done' : '') + (!open ? ' locked' : '') + (next && next.id === l.id && open ? ' next' : '');
        b.setAttribute('aria-label', 'Fase ' + l.id + ': ' + l.title + (open ? '' : ' (bloqueada)'));
        b.dataset.level = l.id;
        b.innerHTML = open ? '<span class="n">' + l.id + '</span>' + UI.stars(r ? r.stars : 0) : '<span class="lock">🔒</span><span style="font-size:13px">' + l.id + '</span>';
        b.title = l.title;
        b.onclick = function () {
          if (!open) { LA.sfx('bump'); UI.toast('🔒', 'Fase bloqueada', 'Conclua a fase ' + (l.id - 1) + ' primeiro.'); return; }
          LA.sfx('click'); LA.Game.open(l);
        };
        path.appendChild(b);
      });
      body.appendChild(card);
    });
    var lab = document.createElement('div');
    lab.className = 'lab-card';
    lab.innerHTML = '<h3>🧩 Laboratório de Criação<br><small style="font-weight:400;font-size:16px">' + (Store.labUnlocked() ? 'Crie e teste seus próprios labirintos!' : 'Libera depois das 25 fases.') + '</small></h3>';
    var lb = document.createElement('button');
    lb.className = 'btn btn-yellow'; lb.type = 'button'; lb.textContent = Store.labUnlocked() ? 'Abrir' : '🔒 Bloqueado';
    lb.onclick = function () { UI.show('lab'); };
    lab.appendChild(lb);
    body.appendChild(lab);
    // rola até o mundo atual
    if (next) {
      var node = body.querySelector('[data-level="' + next.id + '"]');
      if (node && next.world > 1) setTimeout(function () { node.closest('.world-card').scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 120);
    }
  };

  /* ---------- Conquistas ---------- */
  S.achievements = function () {
    var p = Store.player();
    if (!p) { UI.show('players', 'achievements'); return; }
    var got = Object.keys(p.achievements).length;
    $('#ach-summary').innerHTML = '<span class="player-chip" style="cursor:default">' + LA.ART.avatar(p, 34) + ' ' + esc(Store.name(p)) + ' · 🏅 ' + got + '/' + LA.ACHIEVEMENTS.length + '</span>';
    $('#ach-grid').innerHTML = LA.ACHIEVEMENTS.map(function (a) {
      var when = p.achievements[a.id];
      return '<div class="ach' + (when ? '' : ' locked') + (a.special ? ' special' : '') + '"><div class="ai">' + a.icon + '</div><div><h4>' + esc(a.name) + '</h4><p>' + esc(a.desc) + '</p>' +
        (when ? '<div class="when">✔ Conquistada em ' + UI.fmtDate(when) + '</div>' : '') + '</div></div>';
    }).join('');
  };

  /* ---------- Como jogar ---------- */
  S.howto = function () {
    var C = LA.BLOCK_COLORS;
    function mb(t, c) { return '<span class="mini-block" style="background:' + c + '">' + t + '</span>'; }
    $('#howto-body').innerHTML =
      '<div class="howto-grid">' +
      card(1, '🎯 A missão', '<p>O robô <b>Byte</b> está preso em labirintos. Você monta um <b>algoritmo</b> (uma sequência de ordens) com blocos para levá-lo até o <b>portal 🌀</b>.</p>') +
      card(2, '🧩 Monte os blocos', '<p>Abra uma categoria (Movimento, Repetição…), <b>arraste</b> um bloco e <b>encaixe</b> embaixo de ' + mb('▶ quando iniciar', C.control) + '.</p><p>Para apagar, arraste o bloco de volta para a lista ou para a lixeira 🗑.</p>') +
      card(3, '▶ Execute', '<p>Aperte <b>▶ Executar</b>. O bloco que está rodando fica <b>destacado</b> e o Byte se move no labirinto 3D.</p><p>Use ⏸️ <b>Pausar</b> para observar e ⏹️ <b>Parar</b> para corrigir.</p>') +
      card(4, '⭐ Pontos e estrelas', '<ul><li>40 pontos: concluir a fase</li><li>20: eficiência (poucos blocos)</li><li>15: usar o conceito da fase</li><li>15: coletar os itens</li><li>10: desafio extra da fase</li></ul><p>Errar <b>não</b> tira pontos! Vale sempre a sua melhor pontuação.</p>') +
      '</div>' +
      '<h2 class="section">📚 Os blocos</h2><div class="howto-grid">' +
      card('🚶', 'Movimento', '<p>' + mb('⬆ avançar', C.move) + mb('↺ virar à esquerda', C.move) + mb('↻ virar à direita', C.move) + '</p><p>Virar muda só a direção. A setinha amarela no chão mostra para onde o Byte está olhando.</p>') +
      card('🔁', 'Repetição', '<p>' + mb('🔁 repetir 4 vezes', C.loop) + mb('🔁 repetir até chegar ao portal', C.loop) + '</p><p>Coloque blocos <b>dentro</b> da “boca” do repetir para executá-los várias vezes.</p>') +
      card('❓', 'Condições e sensores', '<p>' + mb('❓ se … então', C.cond) + mb('senão', C.cond) + mb('🧱 obstáculo à frente?', C.sensor) + mb('👣 caminho à esquerda?', C.sensor) + '</p><p>Os sensores respondem <b>sim</b> ou <b>não</b>. O SE escolhe o que fazer.</p>') +
      card('📦', 'Variáveis', '<p>' + mb('📦 criar variável cristais com valor 0', C.vars) + mb('➕ adicionar 1 a cristais', C.vars) + '</p><p>Uma variável é uma caixinha com nome que guarda um número.</p>') +
      card('⏳', 'Controle', '<p>' + mb('⏳ esperar', C.control) + mb('⏹️ parar', C.control) + '</p><p>Esperar deixa o tempo passar (lasers piscam, drones se movem).</p>') +
      card('⚠️', 'Perigos', '<ul><li>🧱 Paredes: Byte bate e para.</li><li>🕳️ Buracos: Byte cai!</li><li>🔴 Lasers: não entre quando estiverem ligados.</li><li>🚁 Drones e 🦠 vírus: fique atento ao tempo.</li><li>🚪 Portas: precisam de chave 🔑.</li></ul>') +
      '</div>' +
      '<h2 class="section">📱 Dicas para tablet</h2><div class="howto-grid">' +
      card('👆', 'Toque e arraste', '<p>Toque em uma categoria, segure um bloco e arraste. Use os botões ➕ ➖ do editor para aumentar os blocos.</p><p>Em celulares em pé, use as abas <b>🧭 Labirinto</b> e <b>🧩 Blocos</b>.</p>') +
      card('🔄', 'Câmera', '<p>Use 🔄 para girar o labirinto e ➕ ➖ para aproximar. O botão ⛶ deixa o labirinto maior.</p>') +
      card('👥', 'Grupos e turmas', '<p>Escolham a <b>turma</b>, criem o grupo com o primeiro nome de cada integrante e uma <b>senha de 3 figuras</b>. ' + (LA.Cloud.enabled() ? 'O progresso fica salvo <b>online</b>: em outra aula, em qualquer aparelho, toquem no grupo e usem a senha.' : 'O progresso fica salvo neste aparelho.') + '</p>') +
      card('🪙', 'Moedas e avatar', '<p>Cada fase concluída dá <b>10 moedas</b>, mais <b>5 por estrela</b>. Conquistas também dão moedas. Usem as moedas em <b>👕 Avatar e Loja</b> para comprar roupas, chapéus, bichinhos e fundos.</p>') +
      '</div>';
    function card(n, title, html) {
      return '<div class="howto-card"><h3><span class="num">' + n + '</span>' + title + '</h3>' + html + '</div>';
    }
  };

  /* ---------- Configurações ---------- */
  S.settings = function () {
    var st = Store.settings;
    var p = Store.player();
    var body = $('#settings-body');
    body.innerHTML =
      '<div class="set-card"><h3>🔊 Som e animação</h3>' +
      row('Efeitos sonoros', toggle('sound', st.sound)) +
      row('Reduzir animações', toggle('reduceMotion', st.reduceMotion)) +
      row('Velocidade do Byte', seg('speed', [[0.5, '🐢'], [1, '🚶'], [2, '🏃'], [3, '🚀']], st.speed)) + '</div>' +
      '<div class="set-card"><h3>🖥️ Tela</h3>' +
      row('Qualidade gráfica', seg('quality', [['auto', 'Automática'], ['alta', 'Alta'], ['leve', 'Leve']], st.quality)) +
      '<p>Use “Leve” em tablets mais simples se o jogo ficar lento.</p>' +
      row('Tamanho dos blocos', seg('editorScale', [[0.8, 'P'], [1, 'M'], [1.25, 'G']], st.editorScale)) + '</div>' +
      groupCard(p) +
      '<div class="set-card"><h3>💾 Resultados</h3><p>Exporte para guardar ou juntar resultados de vários aparelhos (arquivo JSON ou planilha CSV).</p>' +
      '<button class="btn btn-teal" type="button" data-action="export">📤 Exportar resultados</button>' +
      '<button class="btn" type="button" data-action="import">📥 Importar resultados</button>' +
      '<button class="btn btn-danger-soft" type="button" id="set-reset-all">🧨 Apagar TODOS os dados deste aparelho</button></div>' +
      '<div class="set-card"><h3>👩‍🏫 Professor</h3><p>O <b>modo demonstração</b> libera todas as fases e o Laboratório, e mostra o botão “Ver solução” nas dicas. Para ativar ou desativar, <b>segure o botão por 3 segundos</b>.</p>' +
      '<button class="btn ' + (st.demo ? 'btn-purple' : '') + '" type="button" id="set-demo">' + (st.demo ? '✅ Modo demonstração LIGADO' : '🎓 Modo demonstração desligado') + '</button>' +
      '<p style="font-size:14px">Código deste aparelho: <b>' + esc(Store.device) + '</b> (aparece nos arquivos exportados).</p></div>' +
      '<div class="set-card"><h3>🔒 Privacidade</h3><p>' + (LA.Cloud.enabled()
        ? 'O jogo pede só a turma, o <b>primeiro nome</b> dos integrantes e uma senha de figuras. Esses dados e o progresso ficam numa planilha do Google Drive da escola (do professor) e neste aparelho. Não pede e-mail nem dados pessoais.'
        : 'O jogo pede só a turma e o primeiro nome dos integrantes. Tudo fica no armazenamento local deste aparelho: nada é enviado para a internet.') + '</p>' +
      '<p style="font-size:14px">Labirinto dos Algoritmos · usa Three.js (MIT) e Blockly (Apache 2.0), guardados no próprio jogo.</p></div>';

    function row(label, ctrl) { return '<div class="set-row"><span>' + label + '</span>' + ctrl + '</div>'; }
    function toggle(k, on) { return '<button class="toggle' + (on ? ' on' : '') + '" type="button" data-toggle="' + k + '" role="switch" aria-checked="' + on + '" aria-label="' + k + '"></button>'; }
    function seg(k, opts, val) {
      return '<span class="seg">' + opts.map(function (o) { return '<button type="button" data-seg="' + k + '" data-val="' + o[0] + '" class="' + (String(o[0]) === String(val) ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</span>';
    }
    UI.$$('[data-toggle]', body).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.toggle; st[k] = !st[k]; Store.save();
        b.classList.toggle('on', st[k]); b.setAttribute('aria-checked', st[k]);
        LA.app.applySettings(); LA.sfx('click');
      };
    });
    UI.$$('[data-seg]', body).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.seg, v = b.dataset.val;
        st[k] = isNaN(Number(v)) ? v : Number(v); Store.save();
        UI.$$('[data-seg="' + k + '"]', body).forEach(function (x) { x.classList.toggle('on', x === b); });
        LA.app.applySettings(); LA.sfx('click');
        if (k === 'editorScale' && LA.Game.ws) LA.Game.ws.setScale((('ontouchstart' in window) ? 1.05 : 0.95) * st.editorScale);
      };
    });
    $('#set-switch').onclick = function () { UI.show('players', 'home'); };
    if ($('#set-rename')) $('#set-rename').onclick = function () { S.editMembers(p).then(function () { S.settings(); }); };
    if ($('#set-logout')) $('#set-logout').onclick = function () {
      UI.confirm('Sair do grupo?', 'O progresso continua salvo' + (p.cloud ? ' online' : ' neste aparelho') + '. Para voltar, escolham o grupo e usem a senha de figuras.', 'Sair', 'Cancelar').then(function (ok) {
        if (!ok) return;
        if (LA.Cloud.needsSync(p)) LA.Cloud.flush();
        Store.logout(); UI.toast('👋', 'Até a próxima!'); UI.show('home');
      });
    };
    if ($('#set-sync')) $('#set-sync').onclick = function () {
      var b = this; b.disabled = true; b.textContent = '🔄 Salvando…';
      if (p.cloud && p.cloud.expired) { b.disabled = false; S.enterGroup(p, null); return; }
      LA.Cloud.flush().then(function () { S.settingsSync(); });
    };
    S.settingsSync();
    if ($('#set-reset-me')) $('#set-reset-me').onclick = function () {
      UI.confirm('Reiniciar o progresso?', esc(Store.name(p)) + ' vai perder fases, estrelas, conquistas, moedas e itens comprados' + (p.cloud ? ' (também online)' : '') + '. Isso não pode ser desfeito.', 'Sim, reiniciar', 'Cancelar', true).then(function (ok) {
        if (ok) { Store.resetPlayer(p.id); UI.toast('↺', 'Progresso reiniciado', esc(Store.name(p))); S.settings(); }
      });
    };
    $('#set-reset-all').onclick = function () {
      UI.confirm('Apagar TODOS os dados?', 'Todos os jogadores, pontuações e conquistas deste aparelho serão apagados. Dica: exporte os resultados antes!', 'Apagar tudo', 'Cancelar', true).then(function (ok) {
        if (!ok) return;
        return UI.confirm('Tem certeza mesmo?', 'Esta é a última confirmação.', 'Sim, apagar', 'Não', true).then(function (ok2) {
          if (ok2) { Store.resetAll(); UI.toast('🧨', 'Dados apagados'); S.settings(); }
        });
      });
    };
    UI.holdButton($('#set-demo'), 3000, function () {
      st.demo = !st.demo; Store.save(); LA.sfx('unlock');
      LA.app.applySettings();
      UI.toast('👩‍🏫', st.demo ? 'Modo demonstração ligado' : 'Modo demonstração desligado', st.demo ? 'Todas as fases liberadas neste aparelho.' : 'As fases voltam a seguir o progresso.');
      S.settings();
    });
  };

  /* Cartão do grupo nas Configurações. */
  function groupCard(p) {
    if (!p) return '<div class="set-card"><h3>👥 Grupo</h3><p>Nenhum grupo escolhido.</p><button class="btn btn-blue" type="button" id="set-switch">👥 Escolher o grupo</button></div>';
    return '<div class="set-card"><h3>👥 Grupo</h3>' +
      '<div class="set-group">' + LA.ART.avatar(p, 56) + '<div><b>' + esc(Store.name(p)) + '</b><br>' +
      (p.turma ? 'Turma ' + esc(LA.turmaLabel(p.turma)) : 'Sem turma') + (p.cloud ? ' · grupo nº ' + esc(p.cloud.code) : '') + '</div></div>' +
      (p.secret ? '<p>🔑 Senha de figuras: <span class="secret-inline">' + p.secret.split(' ').map(LA.figureIcon).join(' ') + '</span></p>' : '') +
      '<p id="set-sync-status"></p>' +
      (LA.Cloud.enabled() && (p.turma || p.cloud) ? '<button class="btn btn-teal" type="button" id="set-sync">☁️ Salvar online agora</button>' : '') +
      (p.turma ? '<button class="btn" type="button" id="set-rename">✏️ Integrantes do grupo</button>' : '') +
      '<button class="btn btn-blue" type="button" id="set-switch">🔁 Trocar de grupo</button>' +
      '<button class="btn" type="button" id="set-logout">🚪 Sair do grupo</button>' +
      '<button class="btn btn-danger-soft" type="button" id="set-reset-me">↺ Reiniciar progresso do grupo</button></div>';
  }
  S.settingsSync = function () {
    var el = $('#set-sync-status'), p = Store.player();
    if (!el || !p) return;
    var st = LA.Cloud.status(p);
    el.innerHTML = st.icon + ' ' + esc(st.text) + (LA.Cloud.lastError && st.cls === 'warn' && LA.Cloud.online ? '<br><small>' + esc(LA.Cloud.lastError) + '</small>' : '');
    var b = $('#set-sync');
    if (b) { b.disabled = false; b.textContent = p.cloud && p.cloud.expired ? '🔑 Entrar de novo para salvar' : '☁️ Salvar online agora'; }
  };

  /* ---------- Celebrações ---------- */
  S.worldComplete = function (w) {
    var world = LA.WORLDS[w - 1];
    var a = LA.achievementById('mundo' + w);
    var next = LA.WORLDS[w];
    LA.sfx('unlock'); UI.confetti(90);
    return UI.modal({
      cls: 'victory', title: '🏆 Mundo ' + w + ' concluído!',
      html: '<div style="font-size:84px">' + (a ? a.icon : world.emoji) + '</div>' +
        '<p><b>Conquista especial:</b> ' + esc(a ? a.name : '') + '</p>' +
        '<p>Você dominou: <b>' + esc(world.goal) + '</b>.</p>' +
        (next ? '<div class="next-card">🔓 Novo mundo liberado: <b>' + next.emoji + ' ' + esc(next.name) + '</b></div>' : ''),
      buttons: [{ label: 'Incrível! 🎉', value: true, cls: 'btn-green' }]
    });
  };
  S.finalCelebration = function () {
    var p = Store.player();
    var t = Store.totals(p);
    LA.sfx('win'); UI.confetti(160);
    setTimeout(function () { UI.confetti(120); }, 1200);
    return UI.modal({
      cls: 'victory', wide: true, title: '🎆 BYTE ESTÁ LIVRE! 🎆',
      html: '<div style="display:flex;justify-content:center">' + LA.ART.byteFace('happy').replace('class="byte-face"', 'class="byte-face" style="width:140px;height:140px"') + '</div>' +
        '<p style="font-size:22px">Você concluiu as <b>25 fases</b> do Labirinto dos Algoritmos!</p>' +
        '<p>' + esc(Store.name(p)) + ' juntou <b>' + t.score + ' pontos</b> e <b>' + t.stars + ' estrelas</b>.</p>' +
        '<div class="learned"><b>📘 Agora você sabe:</b><p>Sequência · Repetição · Laços aninhados · Condições SE/SENÃO · Sensores · Variáveis · Depuração · Otimização</p></div>' +
        '<div class="next-card">🧩 <b>Laboratório de Criação liberado!</b> Crie seus próprios labirintos e desafie os colegas.</div>',
      buttons: [{ label: '🧩 Ir para o Laboratório', value: 'lab', cls: 'btn-purple' }, { label: '🏆 Ver ranking', value: 'rank', cls: 'btn-yellow' }]
    }).then(function (v) {
      if (v === 'lab') setTimeout(function () { UI.show('lab'); }, 50);
      if (v === 'rank') setTimeout(function () { UI.show('ranking'); }, 50);
    });
  };
})(globalThis.LA = globalThis.LA || {});
