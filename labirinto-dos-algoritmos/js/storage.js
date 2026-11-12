/* =========================================================
   LABIRINTO DOS ALGORITMOS — Armazenamento local
   Tudo fica no aparelho (localStorage). Os grupos de uma turma
   também são enviados ao servidor da escola quando ele está
   configurado (veja cloud.js); sem servidor, nada sai do aparelho.
   ========================================================= */
(function (LA) {
  'use strict';

  var KEY = 'labirinto-algoritmos:v1';
  var KEY_PROG = 'labirinto-algoritmos:programas:v1';
  var KEY_MAZES = 'labirinto-algoritmos:labirintos:v1';
  var FORMAT = 2;
  var TURMA_RE = /^[0-9][A-Z]{1,2}$/;

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
      num: num, device: device, imported: !!imported, name: '',
      created: Date.now(), updated: Date.now(),
      levels: {}, achievements: {},
      stats: { runs: 0, wins: 0, items: 0, attempts: {} },
      last: null,
      turma: '', members: [], secret: '', avatar: null, inv: {}, cloud: null, resetAt: 0
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
    out.name = cleanName(p.name);
    out.turma = cleanTurma(p.turma);
    out.members = cleanMembers(p.members);
    out.secret = cleanSecret(p.secret);
    out.avatar = p.avatar ? LA.avatarClean(p.avatar, out.num) : null;
    if (isObj(p.inv)) for (var it in p.inv) { var item = LA.avItem(it); if (item && item.price > 0) out.inv[it] = 1; }
    if (isObj(p.cloud) && /^\d{3,6}$/.test(String(p.cloud.code))) {
      out.cloud = { code: String(p.cloud.code), token: typeof p.cloud.token === 'string' ? p.cloud.token.slice(0, 80) : '', syncedAt: num(p.cloud.syncedAt, 0), expired: !!p.cloud.expired };
    }
    out.resetAt = num(p.resetAt, 0);
    return out;
  }
  function cleanTurma(t) { t = String(t || '').toUpperCase().replace(/[^0-9A-Z]/g, ''); return TURMA_RE.test(t) ? t : ''; }
  function cleanMembers(list) {
    if (!Array.isArray(list)) return [];
    var out = [];
    list.forEach(function (n) { n = cleanName(String(n || '').replace(/,/g, ' ')); if (n && out.length < 6) out.push(n); });
    return out;
  }
  function cleanSecret(s) {
    var l = String(s || '').toLowerCase().split(/[\s,]+/).filter(function (x) { return LA.FIGURE_IDS.indexOf(x) >= 0; });
    return l.length === 3 ? l.join(' ') : '';
  }
  LA.cleanTurma = cleanTurma;
  LA.cleanMembers = cleanMembers;
  /* Figuras da senha do grupo (sem teclado). */
  LA.FIGURES = [
    { id: 'cachorro', icon: '🐶' }, { id: 'gato', icon: '🐱' }, { id: 'leao', icon: '🦁' }, { id: 'sapo', icon: '🐸' },
    { id: 'macaco', icon: '🐵' }, { id: 'unicornio', icon: '🦄' }, { id: 'maca', icon: '🍎' }, { id: 'pizza', icon: '🍕' },
    { id: 'bola', icon: '⚽' }, { id: 'foguete', icon: '🚀' }, { id: 'estrela', icon: '⭐' }, { id: 'arco-iris', icon: '🌈' }
  ];
  LA.FIGURE_IDS = LA.FIGURES.map(function (f) { return f.id; });
  LA.figureIcon = function (id) { var f = LA.FIGURES.filter(function (x) { return x.id === id; })[0]; return f ? f.icon : '?'; };
  LA.turmaLabel = function (t) { return t ? t.replace(/^(\d)/, '$1º ') : ''; };
  /* Nome opcional digitado pelo estudante: só texto simples, até 20 letras. */
  function cleanName(n) {
    if (typeof n !== 'string') return '';
    return n.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  }
  LA.cleanName = cleanName;
  // evita que a planilha interprete o nome como fórmula
  function csvSafe(n) { n = n || ''; return /^[=+\-@]/.test(n) ? "'" + n : n; }
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
    out.lastTurma = cleanTurma(d.lastTurma);
    return out;
  }

  /* Junta a cópia do servidor (b) com a deste aparelho (a), sem perder progresso.
     Se um dos lados reiniciou o progresso depois da última mudança do outro, vale o reiniciado. */
  function mergeInto(a, b) {
    var aOld = (a.updated || 0) < (b.resetAt || 0), bOld = (b.updated || 0) < (a.resetAt || 0);
    var newer = (b.updated || 0) >= (a.updated || 0) ? b : a;
    if (aOld) { copyAll(a, b); return; }
    if (!bOld) {
      for (var k in b.levels) {
        var x = a.levels[k], y = b.levels[k];
        if (!x || y.best > x.best) a.levels[k] = y;
        else { x.completed = x.completed || y.completed; x.stars = Math.max(x.stars, y.stars); x.bestEff = Math.max(x.bestEff || 0, y.bestEff || 0); }
      }
      for (var ac in b.achievements) if (!a.achievements[ac]) a.achievements[ac] = b.achievements[ac];
      for (var it in b.inv) a.inv[it] = 1;
      a.stats.runs = Math.max(a.stats.runs, b.stats.runs);
      a.stats.wins = Math.max(a.stats.wins, b.stats.wins);
      a.stats.items = Math.max(a.stats.items, b.stats.items);
      for (var t in b.stats.attempts) a.stats.attempts[t] = Math.max(a.stats.attempts[t] || 0, b.stats.attempts[t]);
    }
    if (newer === b) { if (b.avatar) a.avatar = b.avatar; if (b.last) a.last = b.last; }
    a.resetAt = Math.max(a.resetAt || 0, b.resetAt || 0);
    a.updated = Math.max(a.updated || 0, b.updated || 0);
  }
  function copyAll(a, b) {
    ['levels', 'achievements', 'stats', 'last', 'avatar', 'inv', 'resetAt', 'updated'].forEach(function (k) { a[k] = b[k]; });
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
    /* Nome do jogador: o que ele digitou ou “Jogador N”. */
    name: function (p) {
      if (!p) return '';
      if (p.members && p.members.length) {
        var m = p.members;
        return m.length === 1 ? m[0] : m.slice(0, -1).join(', ') + ' e ' + m[m.length - 1];
      }
      return p.name || 'Jogador ' + p.num;
    },
    setName: function (id, name) {
      var p = data.players[id]; if (!p) return null;
      p.name = cleanName(name); p.updated = Date.now();
      Store.save();
      return p;
    },
    label: function (p) {
      if (!p) return '';
      return Store.name(p) + (p.turma ? ' · ' + LA.turmaLabel(p.turma) : '') + (p.imported || p.device !== data.device ? ' · aparelho ' + p.device : '');
    },
    /* Grava e avisa o salvamento online (urgent = enviar logo). */
    changed: function (p, urgent) {
      p = p || Store.player();
      if (p) p.updated = Math.max(Date.now(), (p.updated || 0) + 1);
      Store.save();
      if (LA.Cloud) LA.Cloud.schedule(!!urgent);
    },
    logout: function () { data.current = null; Store.save(); },
    get lastTurma() { return data.lastTurma || ''; },
    set lastTurma(t) { data.lastTurma = cleanTurma(t); Store.save(); },

    /* ---------- Grupos (turma + integrantes + senha de figuras) ---------- */
    newGroup: function (opts) {
      var p = newPlayerRecord(data.nextNum++, data.device, false);
      p.turma = cleanTurma(opts.turma);
      p.members = cleanMembers(opts.members);
      p.secret = cleanSecret(opts.secret);
      p.avatar = LA.avatarClean(opts.avatar || LA.avatarDefault('pessoa', p.num), p.num);
      data.players[p.id] = p;
      data.current = p.id;
      data.lastTurma = p.turma;
      Store.save();
      return p;
    },
    setGroupInfo: function (id, turma, members) {
      var p = data.players[id]; if (!p) return null;
      var m = cleanMembers(members);
      if (m.length) p.members = m;
      if (cleanTurma(turma) && !p.cloud) p.turma = cleanTurma(turma);
      Store.changed(p, true);
      return p;
    },
    completeGroup: function (id, opts) {
      var p = data.players[id]; if (!p) return null;
      p.turma = cleanTurma(opts.turma); p.members = cleanMembers(opts.members); p.secret = cleanSecret(opts.secret);
      if (!p.avatar) p.avatar = LA.avatarClean(opts.avatar || LA.avatarDefault('pessoa', p.num), p.num);
      Store.changed(p, true);
      return p;
    },
    checkSecret: function (p, secret) { return !!p && !!p.secret && p.secret === cleanSecret(secret); },
    findByCode: function (code) {
      return Store.localPlayers().filter(function (p) { return p.cloud && p.cloud.code === String(code); })[0] || null;
    },
    /* Recebe um grupo vindo do servidor (ao entrar) e junta com a cópia deste aparelho. */
    adoptCloudGroup: function (res, secret) {
      var code = String(res.codigo);
      var p = Store.findByCode(code);
      if (!p) {
        p = newPlayerRecord(data.nextNum++, data.device, false);
        p.updated = 0;
        data.players[p.id] = p;
      }
      var remote = res.progresso && isObj(res.progresso) ? cleanPlayer(Object.assign({}, res.progresso, { num: p.num, device: p.device }), p.device) : null;
      if (remote) {
        remote.updated = num(res.progresso.updated, num(res.atualizadoEm, 0));
        remote.resetAt = num(res.progresso.resetAt, 0);
        mergeInto(p, remote);
      }
      p.turma = cleanTurma(res.turma) || p.turma;
      if (Array.isArray(res.integrantes) && res.integrantes.length) p.members = cleanMembers(res.integrantes);
      p.secret = cleanSecret(secret) || p.secret;
      if (!p.avatar) p.avatar = LA.avatarDefault('pessoa', p.num);
      // programas (blocos) salvos online: completa o que faltar neste aparelho
      if (isObj(res.programas)) {
        var all = Store._programs(); all[p.id] = all[p.id] || {};
        for (var k in res.programas) if (!all[p.id][k] && LA.levelById(k)) all[p.id][k] = res.programas[k];
        lsSet(KEY_PROG, JSON.stringify(all));
      }
      var serverNewer = !remote || remote.updated >= p.updated;
      p.cloud = { code: code, token: res.token, syncedAt: serverNewer ? p.updated : 0, expired: false };
      data.current = p.id;
      data.lastTurma = p.turma;
      Store.save();
      if (!serverNewer && LA.Cloud) LA.Cloud.schedule(true);
      return p;
    },

    /* ---------- Avatar e loja ---------- */
    setAvatar: function (cfg) {
      var p = Store.player(); if (!p) return null;
      p.avatar = LA.avatarClean(cfg, p.num);
      Store.changed(p, true);
      return p.avatar;
    },
    buy: function (itemId) {
      var p = Store.player(), it = LA.avItem(itemId);
      if (!p || !it) return { ok: false, reason: 'item' };
      if (LA.owns(p, itemId)) return { ok: true, already: true };
      var have = LA.coins(p);
      if (have < it.price) return { ok: false, reason: 'coins', missing: it.price - have };
      p.inv[itemId] = 1;
      Store.changed(p, true);
      return { ok: true };
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
      p.last = levelId;
      Store.changed(p, false);
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
      Store.changed(p, !!score.completed);
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
      // moedas voltam a zero: itens comprados também saem
      p.inv = {};
      if (p.avatar) {
        var a = p.avatar;
        ['hair', 'top', 'bottom', 'shoes', 'hat', 'glasses', 'neck', 'hand', 'back', 'pet', 'bg'].forEach(function (k) {
          if (a[k] && !LA.owns(p, a[k])) a[k] = LA.AV_OPTIONAL[k] ? '' : LA.avatarDefault('pessoa', p.num)[k];
        });
      }
      p.resetAt = Date.now();
      var progs = Store._programs(); delete progs[id]; lsSet(KEY_PROG, JSON.stringify(progs));
      Store.changed(p, true);
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
      if (p.cloud || p.turma) Store.changed(p, false);
    },
    /* Programas enviados ao servidor: as fases não concluídas e a última jogada. */
    programsOf: function (id) {
      var p = data.players[id], mine = Store._programs()[id] || {}, out = {};
      for (var k in mine) {
        var r = p && p.levels[k];
        if (!r || !r.completed || String(p.last) === String(k)) out[k] = mine[k];
      }
      return out;
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
          return { num: p.num, name: p.name || '', turma: p.turma || '', members: p.members || [], avatar: p.avatar, inv: p.inv, device: p.device, imported: p.device !== data.device, levels: p.levels, achievements: p.achievements, stats: { runs: p.stats.runs, wins: p.stats.wins, items: p.stats.items } };
        })
      };
    },
    exportJSON: function () { return JSON.stringify(Store.exportObject(), null, 2); },
    exportCSV: function () {
      var rows = [['tipo', 'aparelho', 'jogador', 'fase', 'mundo', 'titulo', 'pontos', 'estrelas', 'concluida', 'conquista', 'nome', 'turma', 'integrantes']];
      Store.players().forEach(function (p) {
        var t = LA.turmaLabel(p.turma), m = csvSafe((p.members || []).join(', '));
        LA.LEVELS.forEach(function (l) {
          var r = p.levels[l.id];
          if (r) rows.push(['fase', p.device, p.num, l.id, l.world, l.title, r.best, r.stars, r.completed ? 'sim' : 'nao', '', csvSafe(p.name), t, m]);
        });
        Object.keys(p.achievements).forEach(function (a) { rows.push(['conquista', p.device, p.num, '', '', '', '', '', '', a, csvSafe(p.name), t, m]); });
        if (!Object.keys(p.levels).length && !Object.keys(p.achievements).length && (p.name || m)) rows.push(['jogador', p.device, p.num, '', '', '', '', '', '', '', csvSafe(p.name), t, m]);
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
        if (col('nome') >= 0 && c[col('nome')]) p.name = c[col('nome')].replace(/^'/, '');
        if (col('turma') >= 0 && c[col('turma')]) p.turma = c[col('turma')];
        if (col('integrantes') >= 0 && c[col('integrantes')]) p.members = c[col('integrantes')].replace(/^'/, '').split(',');
        var tipo = col('tipo') >= 0 ? c[col('tipo')] : 'fase';
        if (tipo === 'jogador') return;
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
        if (p.name && !cur.name) cur.name = p.name;
        if (p.turma && !cur.turma) cur.turma = p.turma;
        if (p.members.length && !cur.members.length) cur.members = p.members;
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
