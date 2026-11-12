/* =========================================================
   LABIRINTO DOS ALGORITMOS — Tela da fase
   Liga o editor de blocos (Blockly), o interpretador e a cena 3D.
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, esc = UI.esc;
  var Blockly = globalThis.Blockly;

  var SPEEDS = [0.5, 1, 2, 3];
  var SPEED_LABEL = { 0.5: '🐢 0.5x', 1: '🚶 1x', 2: '🏃 2x', 3: '🚀 3x' };

  var Game = LA.Game = {
    level: null, world: null, ws: null, scene: null,
    running: false, paused: false, stopReq: false, previewIndex: 0,
    hintIndex: 0, saveTimer: 0
  };

  function sleep(ms) { return Game.scene && Game.scene.ok ? Game.scene.wait(ms) : new Promise(function (r) { setTimeout(r, ms); }); }
  function speed() { return LA.Store.settings.speed || 1; }

  /* ---------- Inicialização (uma vez) ---------- */
  Game.init = function (scene) {
    Game.scene = scene;
    $('#btn-run').onclick = function () { LA.sfx('click'); Game.run(); };
    $('#btn-pause').onclick = function () { LA.sfx('click'); Game.togglePause(); };
    $('#btn-stop').onclick = function () { LA.sfx('click'); Game.stop(); };
    $('#btn-reset').onclick = function () { LA.sfx('click'); Game.resetStage(); };
    $('#btn-clear').onclick = function () { LA.sfx('click'); Game.clearBlocks(); };
    $('#btn-speed').onclick = function () {
      var s = LA.Store.settings, i = SPEEDS.indexOf(s.speed);
      s.speed = SPEEDS[(i + 1) % SPEEDS.length]; LA.Store.save();
      Game.applySpeed();
    };
    $('#btn-hint').onclick = function () { LA.sfx('click'); Game.showHint(); };
    $('#btn-info').onclick = function () { LA.sfx('click'); Game.showIntro(); };
    $('#game-back').onclick = function () { LA.sfx('click'); Game.leave(); };
    $('#cam-rotate').onclick = function () { scene.rotateView(1); };
    $('#cam-in').onclick = function () { scene.zoom(1.2); };
    $('#cam-out').onclick = function () { scene.zoom(1 / 1.2); };
    $('#stage-expand').onclick = function () {
      $('#game-body').classList.toggle('stage-big');
      setTimeout(function () { scene.resize(); if (Game.ws) Blockly.svgResize(Game.ws); }, 30);
    };
    UI.$$('#pane-switch [data-pane]').forEach(function (b) {
      b.onclick = function () { Game.setPane(b.dataset.pane); };
    });
    Game.applySpeed();
  };

  Game.setPane = function (p) {
    $('#game-body').dataset.pane = p;
    UI.$$('#pane-switch [data-pane]').forEach(function (b) { b.classList.toggle('on', b.dataset.pane === p); });
    setTimeout(function () { Game.scene.resize(); if (Game.ws) Blockly.svgResize(Game.ws); }, 30);
  };

  Game.applySpeed = function () {
    var s = speed();
    $('#btn-speed').textContent = SPEED_LABEL[s] || '🚶 1x';
    if (Game.scene) Game.scene.speed = s;
  };

  /* ---------- Blockly ---------- */
  function ensureWorkspace() {
    if (Game.ws) return Game.ws;
    LA.defineBlocks();
    var theme = Blockly.Theme.defineTheme('labirinto', {
      base: Blockly.Themes.Classic,
      componentStyles: {
        workspaceBackgroundColour: '#fbfcff', toolboxBackgroundColour: '#f3f5ff', toolboxForegroundColour: '#1d2340',
        flyoutBackgroundColour: '#e9ecfb', flyoutForegroundColour: '#1d2340', flyoutOpacity: 0.97,
        scrollbarColour: '#b9c1dc', scrollbarOpacity: 0.85, insertionMarkerColour: '#000000', insertionMarkerOpacity: 0.25
      },
      fontStyle: { family: 'Fredoka, Nunito, sans-serif', weight: '600', size: 13 },
      startHats: true
    });
    var touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var scale = (touch ? 1.05 : 0.95) * (LA.Store.settings.editorScale || 1);
    Game.ws = Blockly.inject($('#blockly'), {
      toolbox: LA.buildToolbox(['forward']),
      renderer: 'zelos',
      theme: theme,
      media: 'vendor/blockly/media/',
      sounds: false,
      trashcan: true,
      comments: false,
      disable: false,
      collapse: false,
      oneBasedIndex: true,
      zoom: { controls: true, wheel: true, startScale: scale, maxScale: 2, minScale: 0.4, scaleSpeed: 1.15, pinch: true },
      move: { scrollbars: { horizontal: true, vertical: true }, drag: true, wheel: false },
      grid: { spacing: 26, length: 3, colour: '#e3e8f6', snap: true }
    });
    Game.ws.addChangeListener(Blockly.Events.disableOrphans);
    Game.ws.addChangeListener(function (e) {
      if (e.isUiEvent) return;
      Game.updateBlockCount();
      if (Game.running) return;
      clearTimeout(Game.saveTimer);
      Game.saveTimer = setTimeout(Game.saveProgram, 350);
    });
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () { if (Game.ws) Blockly.svgResize(Game.ws); }).observe($('.blockly-host'));
    }
    return Game.ws;
  }

  Game.saveProgram = function () {
    if (!Game.level || !Game.ws) return;
    var json = Blockly.serialization.workspaces.save(Game.ws);
    if (Game.level.custom) { Game.customProgram = json; return; }
    LA.Store.saveProgram(Game.level.id, json);
  };

  function ensureStart(ws) {
    var s = ws.getTopBlocks(false).filter(function (b) { return b.type === 'la_start'; });
    if (!s.length) {
      var b = ws.newBlock('la_start');
      b.initSvg(); b.render(); b.moveBy(30, 30);
      b.setDeletable(false);
    } else s.forEach(function (b) { b.setDeletable(false); });
  }

  Game.loadAst = function (ast) {
    var ws = Game.ws;
    Blockly.Events.disable();
    try {
      ws.clear();
      Blockly.serialization.workspaces.load(LA.astToBlocklyJson(ast), ws);
    } finally { Blockly.Events.enable(); }
    ensureStart(ws);
    Game.updateBlockCount();
    Game.saveProgram();
  };

  /* Destaque bem visível do bloco que está sendo executado */
  var lit = null;
  Game.highlight = function (id) {
    if (lit) { var old = Game.ws.getBlockById(lit); if (old && old.getSvgRoot()) old.getSvgRoot().classList.remove('la-running'); }
    lit = id || null;
    try { Game.ws.highlightBlock(lit); } catch (e) { /* ok */ }
    if (!lit) return;
    var b = Game.ws.getBlockById(lit);
    if (b && b.getSvgRoot()) b.getSvgRoot().classList.add('la-running');
  };

  Game.updateBlockCount = function () {
    if (!Game.ws || !Game.level) return;
    var n = LA.workspaceBlockCount(Game.ws);
    var el = $('#blocks-count');
    var max = Game.level.maxBlocks;
    el.textContent = max ? 'Blocos: ' + n + ' de ' + max : 'Blocos: ' + n;
    el.classList.toggle('limit', !!max && n === max);
    el.classList.toggle('over', !!max && n > max);
  };

  /* ---------- Abrir uma fase ---------- */
  Game.open = function (level, opts) {
    opts = opts || {};
    Game.level = level;
    Game.previewIndex = 0;
    Game.hintIndex = 0;
    Game.running = false; Game.paused = false; Game.stopReq = false;
    Game.returnTo = opts.returnTo || (level.custom ? 'lab' : 'map');
    UI.show('game');
    var world = LA.WORLDS[(level.world || 1) - 1];
    $('#game-world').textContent = level.custom ? '🧩 Laboratório de Criação' : world.emoji + ' Mundo ' + world.id + ' · Fase ' + level.id + ' de 25';
    $('#game-level-title').textContent = level.title;
    $('#game-objective').innerHTML = '🎯 ' + esc(level.objective);
    var scene = Game.scene;
    scene.leaveHome();
    scene.attach($('#stage'));
    $('#no-webgl').hidden = scene.ok;
    if (!scene.ok) $('#stage').classList.add('no3d');
    scene.zoomFactor = 1;
    var ws = ensureWorkspace();
    ws.updateToolbox(LA.buildToolbox(level.blocks || LA.ALL_BLOCKS));
    ws.options.maxBlocks = level.maxBlocks ? level.maxBlocks + 1 : Infinity;
    Blockly.Events.disable();
    try {
      ws.clear();
      var saved = level.custom ? opts.program : LA.Store.loadProgram(level.id);
      if (saved) {
        try { Blockly.serialization.workspaces.load(saved, ws); } catch (e) { ws.clear(); }
      } else if (level.startProgram) {
        Blockly.serialization.workspaces.load(LA.astToBlocklyJson(level.startProgram), ws);
      }
    } finally { Blockly.Events.enable(); }
    ensureStart(ws);
    setTimeout(function () { Blockly.svgResize(ws); scene.resize(); }, 60);
    Game.updateBlockCount();
    Game.setPane('editor');
    if (window.matchMedia('(max-width: 600px) and (orientation: portrait)').matches) Game.setPane('stage');
    Game.buildTabs();
    Game.preview(0);
    Game.clearLog();
    Game.log('🤖 Byte está pronto! Monte o algoritmo e aperte ▶ Executar.');
    Game.setControls();
    if (!opts.skipIntro) Game.showIntro();
  };

  Game.preview = function (i) {
    Game.previewIndex = i;
    var w = new LA.World(Game.level, i);
    Game.world = w;
    Game.scene.buildLevel(Game.level, w, { theme: Game.level.theme });
    Game.updateHud(w);
    UI.$$('#variant-tabs button').forEach(function (b, k) { b.classList.toggle('on', k === i); });
  };

  Game.buildTabs = function () {
    var box = $('#variant-tabs');
    box.innerHTML = '';
    var n = Game.level.variants.length;
    if (n < 2) return;
    for (var i = 0; i < n; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'Mapa ' + (i + 1);
      b.onclick = (function (k) { return function () { if (!Game.running) { LA.sfx('click'); Game.preview(k); } }; })(i);
      box.appendChild(b);
    }
  };

  /* ---------- HUD ---------- */
  Game.updateHud = function (w, bump) {
    var h = [];
    h.push('<span class="hud-chip">⏱ ' + w.tick + '</span>');
    if (w.totals.battery) h.push('<span class="hud-chip' + (bump === 'battery' ? ' bump' : '') + '">🔋 ' + w.collected.battery + '/' + w.totals.battery + '</span>');
    if (w.totals.crystal) h.push('<span class="hud-chip' + (bump === 'crystal' ? ' bump' : '') + '">💎 ' + w.collected.crystal + '/' + w.totals.crystal + '</span>');
    if (w.totals.key || Object.keys(w.doors).length) h.push('<span class="hud-chip' + (bump === 'key' ? ' bump' : '') + '">🔑 ' + w.keys + '</span>');
    if (w.energy != null) {
      var pct = Math.max(0, Math.min(100, w.energy / Math.max(w.maxEnergy, w.level.energy.start, 1) * 100));
      h.push('<span class="hud-chip' + (w.energy <= 1 ? ' warn' : '') + '">⚡ <span class="energy-bar"><i style="width:' + pct + '%"></i></span> ' + w.energy + '</span>');
    }
    Object.keys(w.vars).forEach(function (k) { h.push('<span class="hud-chip var">📦 ' + esc(k) + ' = ' + w.vars[k] + '</span>'); });
    if (w.chaser) h.push('<span class="hud-chip warn">🦠 perseguidor</span>');
    if (w.fog) h.push('<span class="hud-chip">🌫️ névoa</span>');
    if (w.level.portalVar) h.push('<span class="hud-chip">🌀 pede “' + esc(w.level.portalVar) + '”</span>');
    $('#hud').innerHTML = h.join('');
  };

  /* ---------- Mensagens ---------- */
  Game.clearLog = function () { $('#log').innerHTML = ''; };
  Game.log = function (text, cls) {
    var box = $('#log');
    var d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = text;
    box.appendChild(d);
    while (box.children.length > 40) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  };
  var bubbleTimer = 0;
  Game.bubble = function (text, cls, ms) {
    var b = $('#bubble');
    b.textContent = text;
    b.className = 'bubble' + (cls ? ' ' + cls : '');
    b.hidden = false;
    Game.placeBubble();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { b.hidden = true; }, ms || 2200);
  };
  Game.placeBubble = function () {
    var b = $('#bubble');
    if (b.hidden) return;
    var p = Game.scene.byteScreenPos();
    var st = $('#stage');
    if (!p) { b.style.left = '50%'; b.style.top = '40%'; return; }
    b.style.left = Math.max(90, Math.min(st.clientWidth - 90, p.x)) + 'px';
    b.style.top = Math.max(70, p.y) + 'px';
  };
  Game.banner = function (title, sub, ms) {
    var b = $('#stage-banner');
    b.innerHTML = esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '');
    b.hidden = false;
    clearTimeout(b._t);
    b._t = setTimeout(function () { b.hidden = true; }, ms || 1200);
  };

  /* ---------- Controles ---------- */
  Game.setControls = function () {
    var run = $('#btn-run');
    run.classList.toggle('running', Game.running && !Game.paused);
    run.innerHTML = Game.running ? (Game.paused ? '▶ Continuar' : '⏳ Executando') : '▶ Executar';
    run.disabled = Game.running && !Game.paused;
    $('#btn-pause').disabled = !Game.running;
    $('#btn-pause').innerHTML = Game.paused ? '▶<span class="lbl"> Continuar</span>' : '⏸️<span class="lbl"> Pausar</span>';
    $('#btn-stop').disabled = !Game.running;
    $('#btn-clear').disabled = Game.running;
    $('#editor-lock').hidden = !Game.running || Game.paused;
    UI.$$('#variant-tabs button').forEach(function (b) { b.disabled = Game.running; });
  };
  Game.togglePause = function () {
    if (!Game.running) return;
    Game.paused = !Game.paused;
    if (!Game.paused && Game._resume) { var r = Game._resume; Game._resume = null; r(); }
    if (Game.paused) Game.log('⏸️ Pausado. Observe o bloco destacado.', 'cond');
    Game.setControls();
  };
  function pauseGate() {
    if (!Game.paused) return Promise.resolve();
    return new Promise(function (r) { Game._resume = r; });
  }
  Game.stop = function () {
    if (!Game.running) return;
    Game.stopReq = true;
    Game.paused = false;
    if (Game._resume) { var r = Game._resume; Game._resume = null; r(); }
    Game.scene.finishTweens();
  };
  Game.resetStage = function () {
    if (Game.running) { Game.stop(); return; }
    if (Game.ws) Game.highlight(null);
    UI.$$('#variant-tabs button').forEach(function (b) { b.classList.remove('ok', 'bad'); });
    Game.preview(Game.previewIndex);
    Game.log('↺ Fase reiniciada. Byte voltou ao início.');
  };
  Game.clearBlocks = function () {
    if (Game.running) return;
    UI.confirm('Limpar a programação?', 'Todos os blocos serão apagados (menos o “quando iniciar”).', 'Sim, limpar', 'Não', true).then(function (ok) {
      if (!ok) return;
      Game.ws.clear(); ensureStart(Game.ws); Game.updateBlockCount(); Game.saveProgram();
      Game.log('🗑 Programação apagada. Comece de novo!');
    });
  };

  Game.leave = function () {
    if (Game.running) Game.stop();
    Game.saveProgram();
    UI.closeAllModals();
    setTimeout(function () {
      if (Game.returnTo === 'lab') UI.show('lab'); else UI.show('map');
    }, Game.running ? 80 : 0);
  };

  /* ---------- Execução ---------- */
  Game.run = async function () {
    if (Game.running) { if (Game.paused) Game.togglePause(); return; }
    LA.unlockAudio();
    var parsed = LA.workspaceToAst(Game.ws);
    var ast = parsed.ast;
    if (!ast.length) {
      Game.bubble('Arraste blocos e encaixe embaixo de “▶ quando iniciar”!', 'bad', 3000);
      Game.log('⚠️ Nenhum bloco encaixado no “quando iniciar”.', 'bad');
      LA.sfx('bump');
      if ($('#game-body').dataset.pane === 'stage' && window.matchMedia('(max-width: 600px) and (orientation: portrait)').matches) Game.setPane('editor');
      return;
    }
    var level = Game.level;
    Game.running = true; Game.paused = false; Game.stopReq = false;
    Game.setControls();
    Game.saveProgram();
    if (window.matchMedia('(max-width: 600px) and (orientation: portrait)').matches) Game.setPane('stage');
    Game.clearLog();
    Game.log('▶ Executando o algoritmo (' + LA.countBlocks(ast) + ' blocos)…');
    var attempts = level.custom ? 0 : LA.Store.noteAttempt(level.id);
    var n = level.variants.length;
    var results = [];
    UI.$$('#variant-tabs button').forEach(function (b) { b.classList.remove('ok', 'bad'); });
    try {
      for (var vi = 0; vi < n; vi++) {
        Game.preview(vi);
        var world = Game.world;
        if (n > 1) {
          Game.banner('Teste ' + (vi + 1) + ' de ' + n, vi > 0 ? 'O labirinto mudou!' : 'O mesmo programa precisa vencer todos os mapas', 1100);
          await sleep(1000 / speed());
        }
        var end = null;
        // Simulação instantânea: se o programa entra em laço infinito,
        // mostramos só alguns passos e avisamos logo (sem esperar minutos).
        var pre = LA.runAll(ast, level, vi);
        var loopy = pre.end && pre.end.reason === 'loop';
        var idle = 0;
        var gen = LA.run(ast, world);
        while (true) {
          if (Game.stopReq) break;
          await pauseGate();
          if (Game.stopReq) break;
          var step = gen.next();
          if (step.done) break;
          var ev = step.value;
          if (ev.type === 'end') { end = ev; break; }
          if (loopy) {
            if (ev.type === 'action') idle = 0; else idle++;
            if (world.actions >= 16 || idle >= 10) {
              world.failed = { reason: 'loop', msg: pre.end.msg };
              end = { type: 'end', result: 'fail', reason: 'loop', msg: pre.end.msg };
              Game.log('⚠️ ' + pre.end.msg, 'bad');
              break;
            }
          }
          await handleEvent(ev, world);
        }
        if (Game.stopReq) break;
        results.push({ world: world, end: end });
        var tab = UI.$$('#variant-tabs button')[vi];
        if (tab) tab.classList.add(world.won ? 'ok' : 'bad');
        if (!world.won) break;
        if (vi < n - 1) { Game.log('✅ Mapa ' + (vi + 1) + ' vencido!', 'good'); await sleep(600 / speed()); }
      }
    } catch (err) {
      console.error(err);
      Game.log('⚠️ Erro inesperado: ' + err.message, 'bad');
    }
    Game.highlight(null);
    var stopped = Game.stopReq;
    Game.running = false; Game.paused = false; Game.stopReq = false;
    Game.setControls();
    if (stopped) {
      Game.log('⏹️ Execução interrompida.', 'bad');
      Game.preview(Game.previewIndex);
      return;
    }
    var won = results.length === n && results.every(function (r) { return r.world.won; });
    if (won) await Game.victory(ast, results, attempts);
    else await Game.failure(results[results.length - 1], attempts);
  };

  async function handleEvent(ev, world) {
    var s = speed();
    switch (ev.type) {
      case 'highlight':
        Game.highlight(ev.id);
        return;
      case 'loop':
        Game.highlight(ev.id);
        if (ev.total) Game.log('🔁 Repetição ' + ev.iteration + ' de ' + ev.total);
        await sleep(140 / s);
        return;
      case 'cond':
        Game.highlight(ev.id);
        Game.log((ev.value ? '✔ Verdadeiro: ' : '✖ Falso: ') + ev.text, 'cond');
        Game.bubble((ev.value ? '✔ ' : '✖ ') + ev.text + '?', ev.value ? 'good' : '', 1000 / s + 400);
        LA.sfx('cond');
        await sleep(420 / s);
        return;
      case 'var':
        Game.highlight(ev.id);
        Game.log('📦 ' + ev.text, 'var');
        Game.bubble('📦 ' + ev.name + ' = ' + ev.value, '', 1200);
        Game.updateHud(world);
        await sleep(420 / s);
        return;
      case 'stop':
        Game.log('⏹️ Bloco PARAR: fim do programa.');
        return;
      case 'action': {
        var e = ev.ev;
        var snd = { move: 'step', turn: 'turn', wait: 'wait', bump: 'bump', fall: 'fail', zap: 'zap', drone: 'bump', noenergy: 'fail' }[e.kind];
        if (snd) LA.sfx(snd);
        if (e.doorOpened) LA.sfx('door');
        var p = Game.scene.animateEvent(e, world);
        var tick = setInterval(Game.placeBubble, 60);
        await p;
        clearInterval(tick);
        if (e.collected) LA.sfx('collect');
        if (e.switched) LA.sfx('switch');
        Game.updateHud(world, e.collected && e.collected.type);
        if (e.kind === 'move' && !e.msgs.length && !e.fail) Game.log('⬆ Byte avançou para a casa (' + (e.to.x + 1) + ', ' + (e.to.y + 1) + ').');
        if (e.kind === 'turn') Game.log((e.side === 'left' ? '↺' : '↻') + ' Byte virou para o ' + world.dirName() + '.');
        if (e.kind === 'wait') Game.log('⏳ Byte esperou.');
        e.msgs.forEach(function (m) { Game.log(m, 'good'); Game.bubble(m, 'good', 1400); });
        if (e.fail) {
          Game.log('⚠️ ' + e.fail.msg, 'bad');
          Game.bubble(shortFail(e.fail.reason), 'bad', 2600);
        }
        if (e.win) { Game.log('🌀 Byte chegou ao portal!', 'good'); }
        return;
      }
    }
  }
  function shortFail(r) {
    return { wall: 'Ai! Uma parede!', door: 'Porta trancada! 🔒', void: 'Socorro, caí!', laser: 'Zzzap! Laser!', drone: 'Ops, o drone!', caught: 'O vírus me pegou!', energy: 'Sem energia… 🪫', locked: 'Portal sem energia!', portalvar: 'Contagem errada!' }[r] || 'Ops!';
  }

  /* ---------- Resultado ---------- */
  Game.failure = async function (res, attempts) {
    var end = res && res.end;
    var msg = end && end.msg || 'Algo não saiu como esperado.';
    LA.sfx('fail');
    if (Game.scene.byte.state !== 'defeat') Game.scene.showError();
    if (end && end.result === 'incomplete') Game.bubble('Cheguei ao fim do programa… mas não no portal!', 'bad', 3000);
    var hint = Game.level.hints && Game.level.hints[Math.min(Game.level.hints.length - 1, Math.floor((attempts || 1) / 2))];
    var n = Game.level.variants.length;
    var where = n > 1 && res ? '<p><b>Mapa ' + (res.world.variantIndex + 1) + ' de ' + n + '</b></p>' : '';
    var v = await UI.modal({
      cls: 'fail-box',
      html: LA.ART.byteFace('sad') .replace('class="byte-face"', 'class="byte-face" style="width:90px;height:90px"') +
        '<h3>Quase lá! Vamos tentar de novo?</h3>' + where + '<p>' + esc(msg) + '</p>' +
        (hint ? '<div class="intro-box">💡 <b>Dica:</b> ' + esc(hint) + '</div>' : '') +
        '<p style="font-size:15px">Errar faz parte de programar. Não há perda de pontos por tentativa!</p>',
      buttons: [
        { label: '👀 Ver o labirinto', value: 'look' },
        { label: '🔁 Tentar de novo', value: 'retry', cls: 'btn-green' }
      ]
    });
    if (v === 'retry') Game.resetStage();
  };

  Game.victory = async function (ast, results, attempts) {
    var level = Game.level;
    LA.sfx('win');
    var celebrate = Game.scene.celebrate();
    UI.confetti(60);
    if (level.custom) {
      var fresh0 = LA.checkAchievements(LA.Store.player(), { customWon: true });
      LA.Store.changed(LA.Store.player(), true);
      showAchievementToasts(fresh0);
      await celebrate;
      await UI.modal({
        cls: 'victory', title: '🎉 Seu labirinto funciona!',
        html: '<p>Byte escapou do labirinto “' + esc(level.title) + '” usando ' + LA.countBlocks(ast) + ' blocos.</p><p>Desafie um colega a resolver com menos blocos!</p>',
        buttons: [{ label: '🧩 Voltar ao Laboratório', value: 'lab', cls: 'btn-purple' }, { label: '🔁 Jogar de novo', value: 'again', cls: 'btn-green' }]
      }).then(function (v) { if (v === 'lab') Game.leave(); else Game.resetStage(); });
      return;
    }
    var score = LA.score(level, ast, results);
    var sig = LA.astSignature(ast);
    var items = results.reduce(function (a, r) { return a + r.world.collected.battery + r.world.collected.crystal; }, 0);
    var player = LA.Store.player();
    var wasWorldDone = LA.levelsOfWorld(level.world).every(function (l) { return player.levels[l.id] && player.levels[l.id].completed; });
    var wasAllDone = LA.LEVELS.every(function (l) { return player.levels[l.id] && player.levels[l.id].completed; });
    var coinsBefore = LA.coinsEarned(player);
    var rec = LA.Store.recordResult(level.id, score, sig, items);
    var fresh = LA.checkAchievements(player, { info: score.info, won: true, attempts: attempts, differentSolution: rec.differentSolution });
    LA.Store.changed(player, true);
    var coinsGained = LA.coinsEarned(player) - coinsBefore;
    await celebrate;

    var nextL = LA.levelById(level.id + 1);
    var best = player.levels[level.id];
    var recordTxt = rec.first ? '🆕 Primeira vez concluída!' : rec.improved ? '📈 Você melhorou! Antes: ' + rec.prevBest + ' pontos' : '🏅 Sua melhor pontuação: ' + best.best + ' pontos';
    var parts = [
      ['✅ Conclusão', score.parts.completion, 40], ['⚡ Eficiência', score.parts.efficiency, 20],
      ['🧠 Conceito', score.parts.concept, 15], ['💎 Itens', score.parts.items, 15], ['⭐ Regra da fase', score.parts.rule, 10]
    ];
    var html = '<div class="big-stars">' + [0, 1, 2].map(function (i) {
      return '<span class="star' + (i < score.stars ? ' on' : '') + '" style="animation-delay:' + (0.2 + i * 0.25) + 's">★</span>';
    }).join('') + '</div>' +
      '<div class="score-total"><span id="score-count">0</span><small> / 100 pontos</small></div>' +
      '<div class="record">' + recordTxt + '</div>' +
      (coinsGained > 0 ? '<div class="coin-gain">' + LA.ART.avatar(player, 44) + '<span>+' + coinsGained + ' 🪙 moedas para a loja!</span><small>Total: 🪙 ' + LA.coins(player) + '</small></div>' : '') +
      '<div class="score-parts">' + parts.map(function (p) {
        return '<div class="score-part"><span>' + p[0] + '</span><span class="bar"><i data-w="' + (p[1] / p[2] * 100) + '"></i></span><b>' + p[1] + '/' + p[2] + '</b></div>';
      }).join('') + '</div>' +
      (score.notes.length ? '<ul class="notes">' + score.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="learned"><b>📘 Você aprendeu:</b><p>' + esc(level.concept) + '</p></div>' +
      (fresh.length ? '<div class="new-ach">' + fresh.map(function (a) { return '<span>' + a.icon + ' ' + esc(a.name) + '</span>'; }).join('') + '</div>' : '') +
      (nextL ? '<div class="next-card">➡️ <b>Próxima:</b> Fase ' + nextL.id + ' — ' + esc(nextL.title) + (nextL.world !== level.world ? ' <b>(novo mundo: ' + esc(LA.WORLDS[nextL.world - 1].name) + '!)</b>' : '') + '</div>' : '');
    var buttons = [{ label: '🗺️ Mapa', value: 'map' }, { label: '🔁 Melhorar', value: 'again' }];
    if (nextL) buttons.push({ label: '▶ Próxima fase', value: 'next', cls: 'btn-green', id: 'btn-next-level' });
    var choice = await UI.modal({
      cls: 'victory', title: '🎉 Fase concluída!', html: html, buttons: buttons, closeValue: 'again',
      onOpen: function (box) {
        for (var i = 0; i < score.stars; i++) setTimeout(function (k) { return function () { LA.sfx('star', k); }; }(i), 250 + i * 250);
        setTimeout(function () { UI.$$('.score-part .bar i', box).forEach(function (b) { b.style.width = b.dataset.w + '%'; }); }, 100);
        var c = UI.$('#score-count', box), t0 = performance.now();
        (function tick() {
          var k = Math.min(1, (performance.now() - t0) / 900);
          c.textContent = Math.round(score.total * k);
          if (k < 1) requestAnimationFrame(tick);
        })();
      }
    });
    showAchievementToasts(fresh.filter(function (a) { return !a.special; }));
    // mundo concluído / jogo concluído
    var nowWorldDone = LA.levelsOfWorld(level.world).every(function (l) { return player.levels[l.id] && player.levels[l.id].completed; });
    var nowAllDone = LA.LEVELS.every(function (l) { return player.levels[l.id] && player.levels[l.id].completed; });
    if (!wasAllDone && nowAllDone) { await LA.Screens.finalCelebration(); choice = 'map'; }
    else if (!wasWorldDone && nowWorldDone) await LA.Screens.worldComplete(level.world);
    if (choice === 'next' && nextL) Game.open(nextL);
    else if (choice === 'map') Game.leave();
    else Game.resetStage();
  };

  function showAchievementToasts(list) {
    list.forEach(function (a, i) {
      setTimeout(function () { LA.sfx('unlock'); UI.toast(a.icon, 'Conquista desbloqueada!', a.name); }, i * 700);
    });
  }
  Game.showAchievementToasts = showAchievementToasts;

  /* ---------- Introdução e dicas ---------- */
  Game.showIntro = function () {
    var l = Game.level;
    if (!l) return;
    var nb = (l.newBlocks || []).map(function (k) {
      var info = LA.BLOCK_INFO[k];
      return info ? '<span class="mini-block" style="background:' + LA.BLOCK_COLORS[info.cat] + '">' + esc(info.name) + '</span>' : '';
    }).join('');
    var vars = l.variants.length > 1 ? '<div class="intro-box">🗺️ Seu programa será testado em <b>' + l.variants.length + ' mapas diferentes</b>' + (l.fog ? ' escondidos pela névoa' : '') + '. Use as abas “Mapa 1, Mapa 2…” para olhar.</div>' : '';
    var extra = '';
    if (l.energy) extra += '<div class="intro-box">⚡ Energia inicial: <b>' + l.energy.start + '</b>. Cada passo gasta 1. Cada bateria dá +' + l.energy.battery + '.</div>';
    if (l.requireBatteries) extra += '<div class="intro-box">🔋 O portal só liga depois de coletar <b>todas as baterias</b>.</div>';
    if (l.portalVar) extra += '<div class="intro-box">🌀 O portal confere a variável <b>“' + esc(l.portalVar) + '”</b>: ela precisa ser igual ao número de cristais coletados.</div>';
    if (l.maxBlocks) extra += '<div class="intro-box">🧱 Limite: no máximo <b>' + l.maxBlocks + ' blocos</b>.</div>';
    if (l.id === 1) extra += '<div class="intro-box">👆 <b>Como fazer:</b> toque em <b>Movimento</b>, arraste o bloco <b>⬆ avançar</b> e encaixe embaixo de <b>▶ quando iniciar</b>. Depois aperte <b>▶ Executar</b>.</div>';
    if (l.startProgram) extra += '<div class="intro-box">🐞 O programa já está montado, mas tem erros. Execute e corrija!</div>';
    UI.modal({
      title: (l.custom ? '🧩 ' : 'Fase ' + l.id + ' · ') + esc(l.title),
      html: '<div class="intro-head">' + LA.ART.byteFace('happy') + '<p class="intro-story">' + esc(l.story || '') + '</p></div>' +
        '<div class="intro-box">🎯 <b>Missão:</b> ' + esc(l.objective) + '</div>' + vars + extra +
        (l.rule && !l.custom ? '<div class="intro-box">⭐ <b>Desafio extra (10 pontos):</b> ' + esc(l.rule.text) + '</div>' : '') +
        (nb ? '<div class="intro-box">✨ <b>Blocos novos:</b><div class="new-blocks">' + nb + '</div></div>' : ''),
      buttons: [{ label: '🚀 Vamos lá!', value: true, cls: 'btn-green', id: 'btn-intro-go' }]
    });
  };

  Game.showHint = function () {
    var l = Game.level;
    var hints = l.hints || ['Pense em cada passo do Byte, um de cada vez.'];
    var shown = Math.min(hints.length, Game.hintIndex + 1);
    function render() {
      return hints.slice(0, shown).map(function (h, i) { return '<div class="intro-box">💡 <b>Dica ' + (i + 1) + ':</b> ' + esc(h) + '</div>'; }).join('');
    }
    var buttons = [];
    if (l.startProgram) buttons.push({ label: '🐞 Restaurar código com erros', value: 'restore' });
    if (LA.Store.settings.demo && l.solution) buttons.push({ label: '👩‍🏫 Ver solução (professor)', value: 'solution', cls: 'btn-purple' });
    buttons.push({ label: 'Mais uma dica', value: 'more', keep: true, id: 'btn-more-hint', onClick: function () {
      if (shown < hints.length) { shown++; Game.hintIndex = shown - 1; UI.$('#hint-list').innerHTML = render(); }
      if (shown >= hints.length) UI.$('#btn-more-hint').disabled = true;
    } });
    buttons.push({ label: 'Entendi!', value: 'ok', cls: 'btn-green' });
    UI.modal({
      title: '💡 Dicas', html: '<div id="hint-list">' + render() + '</div>', buttons: buttons,
      onOpen: function () { if (shown >= hints.length) UI.$('#btn-more-hint').disabled = true; }
    }).then(function (v) {
      Game.hintIndex = Math.max(Game.hintIndex, shown - 1);
      if (v === 'restore') Game.loadAst(l.startProgram);
      if (v === 'solution') Game.loadAst(l.solution);
    });
  };

  /* ---------- Ganchos para testes automáticos ---------- */
  LA.debug = {
    loadAst: function (ast) { Game.loadAst(ast); },
    loadSolution: function () { Game.loadAst(Game.level.solution); },
    state: function () { return { running: Game.running, level: Game.level && Game.level.id, won: Game.world && Game.world.won }; }
  };
})(globalThis.LA = globalThis.LA || {});
