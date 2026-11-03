/* =========================================================
   LABIRINTO DOS ALGORITMOS — Motor lógico (grade determinística)
   Não depende de navegador: funciona também no Node (testes).
   Cada ação (avançar, virar, esperar) gasta 1 "tempo" (tick).
   ========================================================= */
(function (LA) {
  'use strict';

  var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N, L, S, O
  var DIR_INDEX = { N: 0, E: 1, S: 2, W: 3 };
  var DIR_NAMES = ['norte', 'leste', 'sul', 'oeste'];
  LA.DIRS = DIRS;
  LA.DIR_INDEX = DIR_INDEX;

  var ITEM_NAMES = { battery: 'bateria', crystal: 'cristal', key: 'chave' };
  LA.ITEM_NAMES = ITEM_NAMES;

  function key(x, y) { return x + ',' + y; }

  /* Converte o mapa de texto em uma grade de casas. */
  function parseMap(rows) {
    var h = rows.length, w = 0, i;
    for (i = 0; i < h; i++) w = Math.max(w, rows[i].length);
    var cells = [], items = {}, start = null, exit = null, doors = {}, lasers = {}, switches = {};
    for (var y = 0; y < h; y++) {
      var row = [];
      for (var x = 0; x < w; x++) {
        var ch = rows[y][x] || ' ';
        var t = 'floor';
        switch (ch) {
          case '#': t = 'wall'; break;
          case ' ': t = 'void'; break;
          case '|': t = 'rail'; break;
          case 'S': start = { x: x, y: y }; break;
          case 'E': exit = { x: x, y: y }; t = 'exit'; break;
          case 'B': items[key(x, y)] = 'battery'; break;
          case 'C': items[key(x, y)] = 'crystal'; break;
          case 'K': items[key(x, y)] = 'key'; break;
          case 'D': doors[key(x, y)] = { x: x, y: y, open: false }; t = 'door'; break;
          case 'L': case 'M': case 'N': lasers[key(x, y)] = { x: x, y: y, group: ch }; break;
          case 'T': case 'U': case 'V': switches[key(x, y)] = { x: x, y: y, id: ch, on: false }; break;
          case '.': break;
          default: break;
        }
        row.push(t);
      }
      cells.push(row);
    }
    return { w: w, h: h, cells: cells, items: items, start: start, exit: exit, doors: doors, lasers: lasers, switches: switches };
  }
  LA.parseMap = parseMap;

  /* ---------- Mundo ---------- */
  function World(level, variantIndex) {
    var v = level.variants[variantIndex || 0];
    var m = parseMap(v.map);
    if (!m.start) throw new Error('Mapa sem início (S)');
    if (!m.exit) throw new Error('Mapa sem saída (E)');
    this.level = level;
    this.variantIndex = variantIndex || 0;
    this.w = m.w; this.h = m.h; this.cells = m.cells;
    this.items = m.items; this.doors = m.doors; this.lasers = m.lasers; this.switches = m.switches;
    this.start = m.start; this.exit = m.exit;
    this.x = m.start.x; this.y = m.start.y;
    this.dir = DIR_INDEX[v.dir || 'E'];
    this.startDir = this.dir;
    this.tick = 0;
    this.keys = 0;
    this.collected = { battery: 0, crystal: 0, key: 0 };
    this.totals = { battery: 0, crystal: 0, key: 0 };
    for (var k in this.items) this.totals[this.items[k]]++;
    this.vars = {};
    this.energy = level.energy ? level.energy.start : null;
    this.maxEnergy = level.energy ? level.energy.start : null;
    this.minEnergy = this.energy;
    this.actions = 0;
    this.moves = 0;
    this.waits = 0;
    this.bumps = 0;
    this.won = false;
    this.failed = null;

    // grupos de laser
    var cfg = level.lasers || {};
    this.laserGroups = {};
    for (var lk in this.lasers) {
      var g = this.lasers[lk].group;
      if (!this.laserGroups[g]) {
        var gc = cfg[g] || {};
        this.laserGroups[g] = { enabled: gc.enabled !== false, blink: gc.blink || null, offset: gc.offset || 0 };
      }
    }
    this.switchCfg = level.switches || {};

    // drones (vai e volta pelo caminho)
    this.drones = (level.drones || []).map(function (d) {
      return { path: d.path, i: d.start || 0, step: 1, x: d.path[d.start || 0][0], y: d.path[d.start || 0][1] };
    });

    // perseguidor (segue o rastro do Byte)
    if (level.chaser) {
      var tr = level.chaser.trail;
      // a fila termina na casa inicial do Byte: o vírus anda pelo mesmo rastro, sem pular casas
      var q = tr.slice(1).map(function (p) { return [p[0], p[1]]; });
      q.push([m.start.x, m.start.y]);
      this.chaser = { x: tr[0][0], y: tr[0][1], queue: q };
    } else this.chaser = null;

    // névoa
    this.fog = !!level.fog;
    this.revealed = {};
    this.reveal();
  }

  World.prototype.inside = function (x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; };
  World.prototype.cell = function (x, y) { return this.inside(x, y) ? this.cells[y][x] : 'void'; };

  World.prototype.laserActive = function (x, y, t) {
    var l = this.lasers[key(x, y)];
    if (!l) return false;
    var g = this.laserGroups[l.group];
    if (!g || !g.enabled) return false;
    if (!g.blink) return true;
    var tt = (t == null ? this.tick : t) + g.offset;
    var period = g.blink[0] + g.blink[1];
    return (tt % period) < g.blink[0];
  };
  World.prototype.droneAt = function (x, y) {
    for (var i = 0; i < this.drones.length; i++) if (this.drones[i].x === x && this.drones[i].y === y) return true;
    return false;
  };

  /* Byte consegue andar nesta casa? (sem considerar perigos) */
  World.prototype.walkable = function (x, y) {
    var c = this.cell(x, y);
    if (c === 'wall' || c === 'void' || c === 'rail') return false;
    if (c === 'door') { var d = this.doors[key(x, y)]; return d.open || this.keys > 0; }
    return true;
  };
  World.prototype.ahead = function (turn) {
    var d = (this.dir + (turn || 0) + 4) % 4;
    return { x: this.x + DIRS[d][0], y: this.y + DIRS[d][1] };
  };
  World.prototype.allBatteries = function () { return this.collected.battery >= this.totals.battery; };
  World.prototype.goalOpen = function () { return !this.level.requireBatteries || this.allBatteries(); };

  /* ---------- Sensores ---------- */
  World.prototype.sense = function (sensor, arg) {
    var a = this.ahead(0), c, it;
    switch (sensor) {
      case 'wall': // obstáculo à frente (parede, buraco, trilho, porta trancada sem chave)
        return !this.walkable(a.x, a.y);
      case 'path': {
        var turn = arg === 'left' ? -1 : arg === 'right' ? 1 : 0;
        var p = this.ahead(turn);
        return this.walkable(p.x, p.y);
      }
      case 'laser': return this.laserActive(a.x, a.y);
      case 'danger': return this.laserActive(a.x, a.y) || this.droneAt(a.x, a.y);
      case 'door':
        c = this.cell(a.x, a.y);
        return c === 'door' && !this.doors[key(a.x, a.y)].open;
      case 'key': return this.keys > 0;
      case 'item':
        it = this.items[key(a.x, a.y)];
        return arg ? it === arg : !!it;
      case 'goal': return this.x === this.exit.x && this.y === this.exit.y;
    }
    return false;
  };
  World.prototype.compare = function (a, op, b) {
    if (op === '<') return a < b;
    if (op === '>') return a > b;
    if (op === '<=') return a <= b;
    if (op === '>=') return a >= b;
    if (op === '!=') return a !== b;
    return a === b;
  };
  World.prototype.getVar = function (name) { return this.vars[name] == null ? 0 : this.vars[name]; };

  /* ---------- Avanço do tempo ---------- */
  World.prototype.advance = function (ev, from) {
    this.tick++;
    this.actions++;
    // drones
    var self = this;
    this.drones.forEach(function (d) {
      if (d.path.length < 2) return;
      var ni = d.i + d.step;
      if (ni < 0 || ni >= d.path.length) { d.step = -d.step; ni = d.i + d.step; }
      d.i = ni; d.x = d.path[ni][0]; d.y = d.path[ni][1];
    });
    ev.drones = this.drones.map(function (d) { return { x: d.x, y: d.y }; });
    // lasers (estado após o tempo passar)
    ev.lasers = this.laserSnapshot();
    // perseguidor
    if (this.chaser && !this.failed && !this.won) {
      var ch = this.chaser;
      var prev = { x: ch.x, y: ch.y };
      ch.queue.push([this.x, this.y]);
      var nxt = ch.queue.shift();
      ch.x = nxt[0]; ch.y = nxt[1];
      ev.chaser = { x: ch.x, y: ch.y };
      var swapped = from && prev.x === this.x && prev.y === this.y && ch.x === from.x && ch.y === from.y;
      if ((ch.x === this.x && ch.y === this.y) || swapped) {
        this.fail(ev, 'caught', 'O vírus perseguidor alcançou o Byte! Evite ficar parado ou dar meia-volta.');
      }
    }
    this.reveal();
    ev.tick = this.tick;
  };

  World.prototype.laserSnapshot = function () {
    var out = {};
    for (var k in this.lasers) out[k] = this.laserActive(this.lasers[k].x, this.lasers[k].y);
    return out;
  };

  World.prototype.reveal = function () {
    if (!this.fog) return;
    for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 2) this.revealed[key(this.x + dx, this.y + dy)] = true;
    }
  };

  World.prototype.fail = function (ev, reason, msg) {
    this.failed = { reason: reason, msg: msg };
    ev.fail = this.failed;
  };

  /* ---------- Ações ---------- */
  World.prototype.forward = function () {
    var ev = { kind: 'move', from: { x: this.x, y: this.y }, dir: this.dir, to: null, msgs: [] };
    if (this.failed || this.won) return ev;
    var a = this.ahead(0);
    var c = this.cell(a.x, a.y);
    if (this.energy != null && this.energy <= 0) {
      ev.kind = 'noenergy';
      this.fail(ev, 'energy', 'A energia do Byte acabou! Planeje um caminho que passe pelas baterias.');
      return ev;
    }
    if (c === 'wall' || c === 'rail') {
      ev.kind = 'bump'; this.bumps++;
      this.fail(ev, 'wall', 'Byte bateu em uma parede! Confira para onde ele estava virado.');
      return ev;
    }
    if (c === 'void') {
      ev.kind = 'fall'; ev.to = a;
      this.x = a.x; this.y = a.y;
      this.fail(ev, 'void', 'Byte caiu da plataforma! Ele só pode andar sobre o chão.');
      return ev;
    }
    if (c === 'door') {
      var d = this.doors[key(a.x, a.y)];
      if (!d.open) {
        if (this.keys > 0) {
          d.open = true; this.keys--; ev.doorOpened = { x: a.x, y: a.y };
          ev.msgs.push('A chave abriu a porta! 🔓');
        } else {
          ev.kind = 'bump'; this.bumps++;
          this.fail(ev, 'door', 'A porta está trancada! Byte precisa de uma chave 🔑 para abrir.');
          return ev;
        }
      }
    }
    if (this.laserActive(a.x, a.y)) {
      ev.kind = 'zap'; ev.to = a;
      this.x = a.x; this.y = a.y;
      this.fail(ev, 'laser', 'Zzzap! Byte andou para dentro de um laser ligado. Espere ele desligar!');
      return ev;
    }
    if (this.droneAt(a.x, a.y)) {
      ev.kind = 'drone'; ev.to = a;
      this.fail(ev, 'drone', 'Byte trombou no drone de segurança! Espere o drone sair da frente.');
      return ev;
    }
    // move
    var from = { x: this.x, y: this.y };
    this.x = a.x; this.y = a.y; ev.to = { x: a.x, y: a.y };
    this.moves++;
    if (this.energy != null) { this.energy--; }
    // itens
    var k = key(a.x, a.y);
    var it = this.items[k];
    if (it) {
      delete this.items[k];
      this.collected[it]++;
      ev.collected = { type: it, x: a.x, y: a.y };
      if (it === 'key') { this.keys++; ev.msgs.push('Byte pegou uma chave! 🔑'); }
      if (it === 'battery') {
        ev.msgs.push('Bateria coletada! 🔋');
        if (this.energy != null) { this.energy += this.level.energy.battery; this.maxEnergy = Math.max(this.maxEnergy, this.energy); }
      }
      if (it === 'crystal') ev.msgs.push('Cristal coletado! 💎');
    }
    // interruptor
    var sw = this.switches[k];
    if (sw) {
      sw.on = !sw.on;
      var groups = this.switchCfg[sw.id] || [];
      var self = this;
      groups.forEach(function (g) { if (self.laserGroups[g]) self.laserGroups[g].enabled = !self.laserGroups[g].enabled; });
      ev.switched = { x: a.x, y: a.y, on: sw.on };
      ev.msgs.push('Byte apertou o interruptor! Lasers mudaram. ⚡');
    }
    if (this.energy != null) { this.minEnergy = Math.min(this.minEnergy, this.energy); ev.energy = this.energy; }
    // chegou ao portal?
    if (a.x === this.exit.x && a.y === this.exit.y) this.checkGoal(ev);
    this.advance(ev, from);
    return ev;
  };

  World.prototype.checkGoal = function (ev) {
    if (!this.goalOpen()) {
      var falta = this.totals.battery - this.collected.battery;
      this.fail(ev, 'locked', 'O portal está sem energia! Faltam ' + falta + ' bateria' + (falta > 1 ? 's' : '') + ' 🔋.');
      return;
    }
    var pv = this.level.portalVar;
    if (pv) {
      var val = this.getVar(pv);
      if (!(pv in this.vars)) {
        this.fail(ev, 'portalvar', 'O portal perguntou: “Quantos cristais?”. Mas a variável “' + pv + '” não foi criada!');
        return;
      }
      if (val !== this.collected.crystal) {
        this.fail(ev, 'portalvar', 'O portal conferiu: a variável “' + pv + '” vale ' + val + ', mas Byte coletou ' + this.collected.crystal + ' cristais. Corrija a contagem!');
        return;
      }
    }
    this.won = true;
    ev.win = true;
  };

  World.prototype.turn = function (side) {
    var ev = { kind: 'turn', side: side, from: { x: this.x, y: this.y }, fromDir: this.dir, msgs: [] };
    if (this.failed || this.won) return ev;
    this.dir = (this.dir + (side === 'left' ? 3 : 1)) % 4;
    ev.dir = this.dir;
    this.advance(ev, { x: this.x, y: this.y });
    return ev;
  };

  World.prototype.wait = function () {
    var ev = { kind: 'wait', from: { x: this.x, y: this.y }, msgs: [] };
    if (this.failed || this.won) return ev;
    this.waits++;
    this.advance(ev, { x: this.x, y: this.y });
    return ev;
  };

  World.prototype.dirName = function () { return DIR_NAMES[this.dir]; };

  LA.World = World;
  LA.cellKey = key;
})(globalThis.LA = globalThis.LA || {});
