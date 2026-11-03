/* =========================================================
   LABIRINTO DOS ALGORITMOS — Armazenamento local
   Tudo fica NO PRÓPRIO APARELHO (localStorage). Nada é enviado
   para a internet. Jogadores são genéricos: “Jogador 1”, “Jogador 2”…
   ========================================================= */
(function (LA) {
  'use strict';

  var KEY = 'labirinto-algoritmos:v1';
  var KEY_PROG = 'labirinto-algoritmos:programas:v1';
  var KEY_MAZES = 'labirinto-algoritmos:labirintos:v1';
  var FORMAT = 1;

  var memory = {}; // reserva caso o localStorage esteja bloqueado
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return memory[k] || null; } }
  function lsSet(k, v) {
    try { window.localStorage.setItem(k, v); return true; }
    catch (e) { memory[k] = v; return false; }
  }

  function randomCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  function defaults() {
    return {
      format: FORMAT,
      device: randomCode(),
      current: null,
      nextNum: 1,
      players: {},
      settings: { sound: true, speed: 1, quality: 'auto', reduceMotion: false, demo: false, editorScale: 1 },
      created: Date.now()
    };
  }

  function newPlayerRecord(num, device, imported) {
    return {
      id: (imported ? device + '-' : 'p') + num,
      num: num, device: device, imported: !!imported,
      created: Date.now(), updated: Date.now(),
      levels: {}, achievements: {},
      stats: { runs: 0, wins: 0, items: 0, attempts: {} },
      last: null
    };
  }

  /* ---------- Validação (dados corrompidos ou antigos) ---------- */
  function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }

  function cleanLevelRec(r) {
    if (!isObj(r)) return null;
    var best = Math.max(0, Math.min(100, Math.round(num(r.best, 0))));
    return {
      best: best,
      stars: Math.max(0, Math.min(3, Math.round(num(r.stars, 0)))),
      completed: !!r.completed,
      bestEff: Math.max(0, Math.min(20, num(r.bestEff, 0))),
      blocks: num(r.blocks, 0),
      sig: typeof r.sig === 'string' ? r.sig.slice(0, 400) : '',
      updated: num(r.updated, Date.now())
    };
  }
  function cleanPlayer(p, fallbackDevice) {
    if (!isObj(p)) return null;
    var n = Math.max(1, Math.round(num(p.num, 1)));
    var out = newPlayerRecord(n, typeof p.device === 'string' ? p.device.slice(0, 12) : fallbackDevice, !!p.imported);
    if (typeof p.id === 'string') out.id = p.id.slice(0, 40);
    out.created = num(p.created, Date.now());
    out.updated = num(p.updated, Date.now());
    if (isObj(p.levels)) for (var k in p.levels) {
      if (!LA.levelById(k)) continue;
      var r = cleanLevelRec(p.levels[k]); if (r) out.levels[k] = r;
    }
    if (isObj(p.achievements)) for (var a in p.achievements) if (LA.achievementById(a)) out.achievements[a] = num(p.achievements[a], Date.now());
    if (isObj(p.stats)) {
      out.stats.runs = num(p.stats.runs, 0); out.stats.wins = num(p.stats.wins, 0); out.stats.items = num(p.stats.items, 0);
      if (isObj(p.stats.attempts)) for (var t in p.stats.attempts) out.stats.attempts[t] = num(p.stats.attempts[t], 0);
    }
    if (p.last != null && LA.levelById(p.last)) out.last = p.last;
    return out;
  }
  function validate(d) {
    if (!isObj(d)) throw new Error('formato inválido');
    var out = defaults();
    if (typeof d.device === 'string' && /^[A-Z0-9]{3,8}$/.test(d.device)) out.device = d.device;
    out.nextNum = Math.max(1, Math.round(num(d.nextNum, 1)));
    if (isObj(d.settings)) {
      var s = d.settings;
      out.settings.sound = s.sound !== false;
      out.settings.speed = [0.5, 1, 2, 3].indexOf(num(s.speed, 1)) >= 0 ? num(s.speed, 1) : 1;
      out.settings.quality = ['auto', 'alta', 'leve'].indexOf(s.quality) >= 0 ? s.quality : 'auto';
      out.settings.reduceMotion = !!s.reduceMotion;
      out.settings.demo = !!s.demo;
      out.settings.editorScale = [0.8, 1, 1.25].indexOf(num(s.editorScale, 1)) >= 0 ? num(s.editorScale, 1) : 1;
    }
    if (isObj(d.players)) for (var id in d.players) {
      var p = cleanPlayer(d.players[id], out.device);
      if (p) { out.players[p.id] = p; if (!p.imported) out.nextNum = Math.max(out.nextNum, p.num + 1); }
    }
    if (d.current && out.players[d.current]) out.current = d.current;
    return out;
  }

  /* ---------- Carregar e salvar ---------- */
  var data = null;
  var Store = LA.Store = {
    warning: null,
    load: function () {
      var raw = lsGet(KEY);
      if (!raw) { data = defaults(); Store.save(); return data; }
      try { data = validate(JSON.parse(raw)); }
      catch (e) {
        lsSet(KEY + ':corrompido:' + Date.now(), raw);
        data = defaults();
        Store.warning = 'Os dados salvos estavam danificados e foram reiniciados. Uma cópia foi guardada para segurança.';
      }
      Store.save();
      return data;
    },
    save: function () { if (data) lsSet(KEY, JSON.stringify(data)); },
    get data() { return data; },
    get settings() { return data.settings; },
    get device() { return data.device; },

    /* ---------- Jogadores ---------- */
    players: function () { return Object.keys(data.players).map(function (k) { return data.players[k]; }); },
    localPlayers: function () { return Store.players().filter(function (p) { return !p.imported; }).sort(function (a, b) { return a.num - b.num; }); },
    player: function () { return data.current ? data.players[data.current] : null; },
    newPlayer: function () {
      var p = newPlayerRecord(data.nextNum++, data.device, false);
      data.players[p.id] = p;
      data.current = p.id;
      Store.save();
      return p;
    },
    ensurePlayer: function () { return Store.player() || Store.localPlayers()[0] && Store.setPlayer(Store.localPlayers()[0].id) || Store.newPlayer(); },
    setPlayer: function (id) { if (data.players[id]) { data.current = id; Store.save(); } return data.players[id]; },
    label: function (p) {
      if (!p) return '';
      return 'Jogador ' + p.num + (p.imported || p.device !== data.device ? ' · aparelho ' + p.device : '');
    },
    removePlayer: function (id) {
      delete data.players[id];
      var progs = Store._programs(); delete progs[id]; lsSet(KEY_PROG, JSON.stringify(progs));
      if (data.current === id) data.current = null;
      Store.save();
    },

    /* ---------- Progresso ---------- */
    isUnlocked: function (levelId, p) {
      p = p || Store.player();
      if (data.settings.demo) return true;
      var id = Number(levelId);
      if (id === 1) return true;
      var prev = p && p.levels[id - 1];
      return !!(prev && prev.completed);
    },
    worldUnlocked: function (w, p) { return Store.isUnlocked(LA.levelsOfWorld(w)[0].id, p); },
    nextLevel: function (p) {
      p = p || Store.player();
      for (var i = 0; i < LA.LEVELS.length; i++) {
        var l = LA.LEVELS[i];
        if (!(p && p.levels[l.id] && p.levels[l.id].completed)) return l;
      }
      return null;
    },
    labUnlocked: function (p) {
      p = p || Store.player();
      return data.settings.demo || !!(p && LA.LEVELS.every(function (l) { return p.levels[l.id] && p.levels[l.id].completed; }));
    },
    noteAttempt: function (levelId) {
      var p = Store.player(); if (!p) return 0;
      p.stats.runs++;
      p.stats.attempts[levelId] = (p.stats.attempts[levelId] || 0) + 1;
      p.last = levelId; p.updated = Date.now();
      Store.save();
      return p.stats.attempts[levelId];
    },
    /* Registra um resultado. Só substitui se for MELHOR (não duplica). */
    recordResult: function (levelId, score, sig, itemsCollected) {
      var p = Store.player(); if (!p) return null;
      var prev = p.levels[levelId] || null;
      var out = { improved: false, first: !prev || !prev.completed, prevBest: prev ? prev.best : 0, differentSolution: false };
      if (score.completed) {
        p.stats.wins++;
        p.stats.items += itemsCollected || 0;
        out.differentSolution = !!(prev && prev.completed && prev.sig && sig && prev.sig !== sig);
        if (!prev || score.total > prev.best) {
          out.improved = !!prev && prev.completed;
          p.levels[levelId] = {
            best: score.total, stars: score.stars, completed: true,
            bestEff: Math.max(score.parts.efficiency, prev ? prev.bestEff : 0),
            blocks: score.blocks, sig: sig || '', updated: Date.now()
          };
        } else {
          prev.bestEff = Math.max(prev.bestEff || 0, score.parts.efficiency);
          if (!prev.sig) prev.sig = sig || '';
        }
      }
      p.updated = Date.now();
      Store.save();
      return out;
    },
    totals: function (p, levels) {
      var t = { score: 0, stars: 0, done: 0, worlds: 0, achievements: Object.keys(p.achievements).length };
      (levels || LA.LEVELS).forEach(function (l) {
        var r = p.levels[l.id];
        if (r) { t.score += r.best; t.stars += r.stars; if (r.completed) t.done++; }
      });
      // mundos desbloqueados pelo próprio progresso (o modo demonstração não conta)
      t.worlds = 1;
      for (var w = 2; w <= 5; w++) {
        var prevDone = LA.levelsOfWorld(w - 1).every(function (l) { return p.levels[l.id] && p.levels[l.id].completed; });
        var firstDone = p.levels[LA.levelsOfWorld(w - 1)[4].id];
        if (prevDone || (firstDone && firstDone.completed)) t.worlds++;
      }
      return t;
    },
    resetPlayer: function (id) {
      var p = data.players[id]; if (!p) return;
      p.levels = {}; p.achievements = {}; p.stats = { runs: 0, wins: 0, items: 0, attempts: {} }; p.last = null;
      var progs = Store._programs(); delete progs[id]; lsSet(KEY_PROG, JSON.stringify(progs));
      Store.save();
    },
    resetAll: function () {
      var keepSettings = data.settings, dev = data.device;
      data = defaults(); data.settings = keepSettings; data.device = dev;
      lsSet(KEY_PROG, '{}');
      Store.save();
    },

    /* ---------- Programas salvos (blocos de cada fase) ---------- */
    _programs: function () {
      try { var o = JSON.parse(lsGet(KEY_PROG) || '{}'); return isObj(o) ? o : {}; } catch (e) { return {}; }
    },
    saveProgram: function (levelId, json) {
      var p = Store.player(); if (!p) return;
      var all = Store._programs();
      all[p.id] = all[p.id] || {};
      all[p.id][levelId] = json;
      lsSet(KEY_PROG, JSON.stringify(all));
    },
    loadProgram: function (levelId) {
      var p = Store.player(); if (!p) return null;
      var all = Store._programs();
      return all[p.id] && all[p.id][levelId] || null;
    },

    /* ---------- Labirintos do Laboratório de Criação ---------- */
    mazes: function () {
      try { var a = JSON.parse(lsGet(KEY_MAZES) || '[]'); return Array.isArray(a) ? a.filter(function (m) { return isObj(m) && Array.isArray(m.map); }) : []; } catch (e) { return []; }
    },
    saveMaze: function (maze) {
      var list = Store.mazes();
      var i = list.findIndex(function (m) { return m.id === maze.id; });
      if (i >= 0) list[i] = maze; else list.push(maze);
      lsSet(KEY_MAZES, JSON.stringify(list));
      return maze;
    },
    deleteMaze: function (id) {
      lsSet(KEY_MAZES, JSON.stringify(Store.mazes().filter(function (m) { return m.id !== id; })));
    },

    /* ---------- Exportar ---------- */
    exportObject: function () {
      return {
        app: 'labirinto-dos-algoritmos', format: FORMAT, exportedAt: new Date().toISOString(), device: data.device,
        players: Store.players().map(function (p) {
          return { num: p.num, device: p.device, imported: p.device !== data.device, levels: p.levels, achievements: p.achievements, stats: { runs: p.stats.runs, wins: p.stats.wins, items: p.stats.items } };
        })
      };
    },
    exportJSON: function () { return JSON.stringify(Store.exportObject(), null, 2); },
    exportCSV: function () {
      var rows = [['tipo', 'aparelho', 'jogador', 'fase', 'mundo', 'titulo', 'pontos', 'estrelas', 'concluida', 'conquista']];
      Store.players().forEach(function (p) {
        LA.LEVELS.forEach(function (l) {
          var r = p.levels[l.id];
          if (r) rows.push(['fase', p.device, p.num, l.id, l.world, l.title, r.best, r.stars, r.completed ? 'sim' : 'nao', '']);
        });
        Object.keys(p.achievements).forEach(function (a) { rows.push(['conquista', p.device, p.num, '', '', '', '', '', '', a]); });
      });
      return '﻿' + rows.map(function (r) {
        return r.map(function (c) { c = String(c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';');
      }).join('\r\n');
    },

    /* ---------- Importar (junta resultados, sem internet) ---------- */
    parseCSV: function (text) {
      text = text.replace(/^﻿/, '');
      var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
      if (!lines.length) throw new Error('arquivo vazio');
      var sep = lines[0].indexOf(';') >= 0 ? ';' : ',';
      function split(line) {
        var out = [], cur = '', q = false;
        for (var i = 0; i < line.length; i++) {
          var ch = line[i];
          if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
          else if (ch === '"') q = true; else if (ch === sep) { out.push(cur); cur = ''; } else cur += ch;
        }
        out.push(cur); return out;
      }
      var head = split(lines[0]).map(function (h) { return h.trim().toLowerCase(); });
      var col = function (n) { return head.indexOf(n); };
      if (col('aparelho') < 0 || col('jogador') < 0) throw new Error('colunas “aparelho” e “jogador” não encontradas');
      var players = {};
      lines.slice(1).forEach(function (line) {
        var c = split(line);
        var dev = (c[col('aparelho')] || '').trim().toUpperCase(), n = parseInt(c[col('jogador')], 10);
        if (!dev || !n) return;
        var k = dev + ':' + n;
        var p = players[k] = players[k] || { num: n, device: dev, levels: {}, achievements: {} };
        var tipo = col('tipo') >= 0 ? c[col('tipo')] : 'fase';
        if (tipo === 'conquista') { var a = c[col('conquista')]; if (a) p.achievements[a.trim()] = Date.now(); return; }
        var fase = parseInt(c[col('fase')], 10);
        if (!LA.levelById(fase)) return;
        p.levels[fase] = { best: num(c[col('pontos')], 0), stars: num(c[col('estrelas')], 0), completed: /^s/i.test(c[col('concluida')] || ''), updated: Date.now() };
      });
      return { app: 'labirinto-dos-algoritmos', format: FORMAT, players: Object.keys(players).map(function (k) { return players[k]; }) };
    },
    importText: function (text, filename) {
      var obj;
      var trimmed = String(text || '').trim();
      if (/\.csv$/i.test(filename || '') || (trimmed && trimmed[0] !== '{')) obj = Store.parseCSV(trimmed);
      else {
        try { obj = JSON.parse(trimmed); } catch (e) { throw new Error('o arquivo não é um JSON válido'); }
      }
      if (!isObj(obj) || obj.app !== 'labirinto-dos-algoritmos' || !Array.isArray(obj.players)) throw new Error('este arquivo não é do Labirinto dos Algoritmos');
      if (num(obj.format, 1) > FORMAT) throw new Error('arquivo de uma versão mais nova do jogo');
      var added = 0, merged = 0;
      obj.players.forEach(function (raw) {
        var p = cleanPlayer(raw, String(raw && raw.device || 'XXXX'));
        if (!p) return;
        p.device = String(raw.device || obj.device || 'XXXX').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'XXXX';
        var mine = p.device === data.device;
        p.imported = !mine;
        p.id = mine ? 'p' + p.num : p.device + '-' + p.num;
        var cur = data.players[p.id];
        if (!cur) {
          data.players[p.id] = p; added++;
          if (mine) data.nextNum = Math.max(data.nextNum, p.num + 1);
          return;
        }
        merged++;
        for (var k in p.levels) {
          var a = cur.levels[k], b = p.levels[k];
          if (!a || b.best > a.best) cur.levels[k] = b;
          else { a.completed = a.completed || b.completed; a.stars = Math.max(a.stars, b.stars); }
        }
        for (var ac in p.achievements) if (!cur.achievements[ac]) cur.achievements[ac] = p.achievements[ac];
        cur.stats.runs = Math.max(cur.stats.runs, p.stats.runs);
        cur.stats.wins = Math.max(cur.stats.wins, p.stats.wins);
        cur.stats.items = Math.max(cur.stats.items, p.stats.items);
        cur.updated = Date.now();
      });
      Store.save();
      return { added: added, merged: merged };
    }
  };
})(globalThis.LA = globalThis.LA || {});
