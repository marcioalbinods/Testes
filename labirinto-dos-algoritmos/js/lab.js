/* =========================================================
   LABIRINTO DOS ALGORITMOS — Laboratório de Criação
   Liberado depois das 25 fases (ou no modo demonstração).
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, esc = UI.esc, Store = LA.Store;

  var TOOLS = [
    { ch: '.', icon: '🟩', name: 'Chão' },
    { ch: '#', icon: '🧱', name: 'Parede' },
    { ch: ' ', icon: '🕳️', name: 'Buraco' },
    { ch: 'S', icon: '🤖', name: 'Início' },
    { ch: 'E', icon: '🌀', name: 'Saída' },
    { ch: 'B', icon: '🔋', name: 'Bateria' },
    { ch: 'C', icon: '💎', name: 'Cristal' },
    { ch: 'K', icon: '🔑', name: 'Chave' },
    { ch: 'D', icon: '🚪', name: 'Porta' },
    { ch: 'L', icon: '🔴', name: 'Laser' },
    { ch: 'T', icon: '🔘', name: 'Interruptor' }
  ];
  var DIRS = ['N', 'E', 'S', 'W'];
  var ARROWS = { N: '⬆', E: '➡', S: '⬇', W: '⬅' };
  var THEMES = [['vale', '🌱'], ['floresta', '🌲'], ['fortaleza', '🏰'], ['laboratorio', '🧪'], ['nucleo', '💠']];

  var Lab = LA.Lab = { size: 8, grid: null, tool: '#', dir: 'E', id: null, name: '', theme: 'vale', program: null };

  function blank(n) {
    var g = [];
    for (var y = 0; y < n; y++) {
      var r = [];
      for (var x = 0; x < n; x++) r.push(x === 0 || y === 0 || x === n - 1 || y === n - 1 ? '#' : '.');
      g.push(r);
    }
    g[1][1] = 'S'; g[n - 2][n - 2] = 'E';
    return g;
  }

  Lab.newMaze = function (size) {
    Lab.size = size || Lab.size;
    Lab.grid = blank(Lab.size);
    Lab.dir = 'E'; Lab.id = null; Lab.program = null;
    var n = Store.mazes().length + 1;
    Lab.name = 'Meu labirinto ' + n;
  };

  Lab.render = function () {
    var body = $('#lab-body');
    if (!Store.labUnlocked()) {
      var p = Store.player();
      var done = p ? LA.LEVELS.filter(function (l) { return p.levels[l.id] && p.levels[l.id].completed; }).length : 0;
      body.innerHTML = '<div class="lab-card" style="grid-column:1/-1"><h3>🔒 O Laboratório de Criação abre depois que você concluir as 25 fases.<br><small>Você já concluiu ' + done + ' de 25. Continue a aventura!</small></h3>' +
        '<button class="btn btn-yellow" type="button" id="lab-go-map">🗺️ Ir para o mapa</button></div>';
      $('#lab-go-map').onclick = function () { UI.show('map'); };
      return;
    }
    if (!Lab.grid) Lab.newMaze(8);
    body.innerHTML =
      '<div class="lab-tools"><h3>Ferramentas</h3><div class="tool-grid" id="lab-tools"></div>' +
      '<h3>Tamanho</h3><div class="seg" id="lab-size"></div>' +
      '<h3>Cenário</h3><div class="seg" id="lab-theme"></div></div>' +
      '<div class="lab-center"><div class="lab-msg" id="lab-msg">Toque ou arraste sobre a grade para desenhar. Toque no 🤖 de novo para girar o Byte.</div>' +
      '<div class="lab-grid" id="lab-grid"></div>' +
      '<div class="chips"><button class="btn btn-green btn-xl" type="button" id="lab-test">▶ Testar</button>' +
      '<button class="btn btn-blue" type="button" id="lab-save">💾 Salvar</button>' +
      '<button class="btn" type="button" id="lab-new">✨ Novo</button></div></div>' +
      '<div class="lab-side"><h3>📁 Meus labirintos</h3><p style="margin:0;color:#4a5378;font-size:15px">Salvos só neste aparelho.</p><div class="maze-list" id="maze-list"></div></div>';

    var tb = $('#lab-tools');
    TOOLS.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tool' + (Lab.tool === t.ch ? ' on' : '');
      b.innerHTML = '<span>' + t.icon + '</span>' + t.name;
      b.onclick = function () { LA.sfx('click'); Lab.tool = t.ch; UI.$$('.tool', tb).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); };
      tb.appendChild(b);
    });
    var sz = $('#lab-size');
    [6, 7, 8, 9, 10].forEach(function (n) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = n + '×' + n; b.className = Lab.size === n ? 'on' : '';
      b.onclick = function () {
        if (n === Lab.size) return;
        UI.confirm('Mudar o tamanho?', 'O desenho atual será substituído por uma grade nova de ' + n + '×' + n + '.', 'Mudar', 'Cancelar').then(function (ok) {
          if (!ok) return;
          var keepName = Lab.name, keepId = Lab.id;
          Lab.newMaze(n); Lab.name = keepName; Lab.id = keepId; Lab.render();
        });
      };
      sz.appendChild(b);
    });
    var th = $('#lab-theme');
    THEMES.forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = t[1]; b.className = Lab.theme === t[0] ? 'on' : '';
      b.setAttribute('aria-label', 'Cenário ' + t[0]);
      b.onclick = function () { Lab.theme = t[0]; UI.$$('button', th).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); };
      th.appendChild(b);
    });
    Lab.drawGrid();
    Lab.renderList();
    $('#lab-test').onclick = function () { LA.sfx('click'); Lab.test(); };
    $('#lab-save').onclick = function () { LA.sfx('click'); Lab.save(); };
    $('#lab-new').onclick = function () {
      UI.confirm('Começar um labirinto novo?', 'O desenho que não foi salvo será perdido.', 'Novo', 'Cancelar').then(function (ok) { if (ok) { Lab.newMaze(Lab.size); Lab.render(); } });
    };
  };

  Lab.drawGrid = function () {
    var g = $('#lab-grid');
    var n = Lab.size;
    g.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
    g.innerHTML = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var c = document.createElement('div');
      c.dataset.x = x; c.dataset.y = y;
      g.appendChild(c);
      paintCell(c, Lab.grid[y][x]);
    }
    var painting = false, last = null;
    function at(e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      return el && el.closest && el.closest('.lab-cell');
    }
    g.onpointerdown = function (e) {
      e.preventDefault();
      painting = true; last = null;
      try { g.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
      var c = at(e); if (c) { apply(c, true); last = c; }
    };
    g.onpointermove = function (e) {
      if (!painting) return;
      var c = at(e); if (c && c !== last) { apply(c, false); last = c; }
    };
    g.onpointerup = g.onpointercancel = function () { painting = false; };
  };

  function paintCell(c, ch) {
    c.className = 'lab-cell ' + (ch === '#' ? 'wall' : ch === ' ' ? 'void' : 'floor');
    var t = TOOLS.filter(function (t) { return t.ch === ch; })[0];
    c.textContent = ch === 'S' ? ARROWS[Lab.dir] : (ch === '.' || ch === '#' || ch === ' ') ? '' : (t ? t.icon : '');
    if (ch === 'S') c.textContent = '🤖' + ARROWS[Lab.dir];
  }

  function apply(c, isTap) {
    var x = +c.dataset.x, y = +c.dataset.y;
    var ch = Lab.tool;
    var cur = Lab.grid[y][x];
    if (ch === 'S' && cur === 'S') {
      if (!isTap) return;
      Lab.dir = DIRS[(DIRS.indexOf(Lab.dir) + 1) % 4];
      paintCell(c, 'S');
      return;
    }
    if (ch === 'S' || ch === 'E') {
      // só um início e uma saída
      for (var yy = 0; yy < Lab.size; yy++) for (var xx = 0; xx < Lab.size; xx++) {
        if (Lab.grid[yy][xx] === ch) { Lab.grid[yy][xx] = '.'; paintCell(UI.$('#lab-grid').children[yy * Lab.size + xx], '.'); }
      }
    }
    Lab.grid[y][x] = ch;
    paintCell(c, ch);
    LA.sfx('click');
  }

  Lab.validate = function () {
    var s = 0, e = 0;
    Lab.grid.forEach(function (r) { r.forEach(function (c) { if (c === 'S') s++; if (c === 'E') e++; }); });
    if (!s) return 'Coloque o início do Byte (🤖).';
    if (!e) return 'Coloque a saída (🌀).';
    return null;
  };

  Lab.toLevel = function () {
    var map = Lab.grid.map(function (r) { return r.join(''); });
    var wi = THEMES.map(function (t) { return t[0]; }).indexOf(Lab.theme) + 1;
    return {
      id: 'custom', custom: true, title: Lab.name, world: wi || 1, theme: Lab.theme,
      story: 'Um labirinto criado no Laboratório! Será que o seu algoritmo consegue levar o Byte até a saída?',
      objective: 'Leve o Byte até o portal 🌀.',
      concept: 'Criar desafios também é programar: você pensou no problema e na solução!',
      hints: ['Teste seu labirinto aos poucos.', 'Use todos os blocos que aprendeu: repetição, condições e sensores.', 'Se o laser atrapalhar, coloque um interruptor (🔘) para desligá-lo.'],
      blocks: LA.ALL_BLOCKS, concepts: ['sequence'],
      lasers: { L: {} }, switches: { T: ['L'] },
      variants: [{ dir: Lab.dir, map: map }]
    };
  };

  Lab.test = function () {
    var err = Lab.validate();
    if (err) { $('#lab-msg').textContent = '⚠️ ' + err; LA.sfx('bump'); return; }
    var lvl = Lab.toLevel();
    LA.Game.onCustomLeave = function () { Lab.program = LA.Game.customProgram; };
    LA.Game.open(lvl, { returnTo: 'lab', program: Lab.program, skipIntro: true });
  };

  Lab.save = function () {
    var err = Lab.validate();
    if (err) { $('#lab-msg').textContent = '⚠️ ' + err; LA.sfx('bump'); return; }
    if (LA.Game.level && LA.Game.level.custom && LA.Game.customProgram) Lab.program = LA.Game.customProgram;
    var maze = {
      id: Lab.id || 'm' + Date.now().toString(36), name: Lab.name, size: Lab.size, dir: Lab.dir, theme: Lab.theme,
      map: Lab.grid.map(function (r) { return r.join(''); }), program: Lab.program || null, updated: Date.now()
    };
    Lab.id = maze.id;
    Store.saveMaze(maze);
    var fresh = Store.player() ? LA.checkAchievements(Store.player(), { mazeSaved: true }) : [];
    if (Store.player()) Store.changed(Store.player(), true);
    LA.Game.showAchievementToasts(fresh);
    $('#lab-msg').textContent = '✅ “' + Lab.name + '” salvo neste aparelho!';
    UI.toast('💾', 'Labirinto salvo!', Lab.name);
    Lab.renderList();
  };

  Lab.load = function (m) {
    Lab.id = m.id; Lab.name = m.name; Lab.size = m.map.length; Lab.dir = m.dir || 'E'; Lab.theme = m.theme || 'vale';
    Lab.grid = m.map.map(function (r) { return r.split(''); });
    Lab.program = m.program || null;
    Lab.render();
    $('#lab-msg').textContent = '📂 “' + m.name + '” aberto.';
  };

  Lab.renderList = function () {
    var box = $('#maze-list');
    if (!box) return;
    var list = Store.mazes();
    if (!list.length) { box.innerHTML = '<p style="color:#4a5378;font-size:15px;margin:0">Nenhum labirinto salvo ainda.</p>'; return; }
    box.innerHTML = '';
    list.forEach(function (m) {
      var row = document.createElement('div');
      row.className = 'maze-item';
      row.innerHTML = '<span>' + esc(m.name) + '</span>';
      var open = document.createElement('button'); open.type = 'button'; open.className = 'btn btn-small btn-teal'; open.textContent = 'Abrir';
      open.onclick = function () { LA.sfx('click'); Lab.load(m); };
      var del = document.createElement('button'); del.type = 'button'; del.className = 'btn btn-small btn-danger-soft'; del.textContent = '🗑'; del.setAttribute('aria-label', 'Apagar ' + m.name);
      del.onclick = function () {
        UI.confirm('Apagar labirinto?', 'O labirinto “' + esc(m.name) + '” será apagado deste aparelho.', 'Apagar', 'Cancelar', true).then(function (ok) {
          if (ok) { Store.deleteMaze(m.id); if (Lab.id === m.id) Lab.id = null; Lab.renderList(); }
        });
      };
      row.appendChild(open); row.appendChild(del);
      box.appendChild(row);
    });
  };
})(globalThis.LA = globalThis.LA || {});
