/* =========================================================
   CAÇADORES DE LETRAS — Perfis e progresso (LocalStorage)
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const CFG = window.CDL_CONFIG || {};
  const KEY = CFG.storageKey || 'cacadores-de-letras:v1';
  const TOTAL = 30;

  CDL.AVATARS = [
    { id: 'raposa', label: 'Raposa', emoji: '🦊' }, { id: 'coruja', label: 'Coruja', emoji: '🦉' },
    { id: 'tartaruga', label: 'Tartaruga', emoji: '🐢' }, { id: 'leao', label: 'Leão', emoji: '🦁' },
    { id: 'polvo', label: 'Polvo', emoji: '🐙' }, { id: 'dragao', label: 'Dragão', emoji: '🐲' },
    { id: 'gato', label: 'Gato', emoji: '🐱' }, { id: 'sapo', label: 'Sapo', emoji: '🐸' },
    { id: 'panda', label: 'Panda', emoji: '🐼' }, { id: 'unicornio', label: 'Unicórnio', emoji: '🦄' },
    { id: 'peixe', label: 'Peixe', emoji: '🐠' }, { id: 'abelha', label: 'Abelha', emoji: '🐝' }
  ];

  function blank() {
    return {
      version: 1,
      settings: { sound: true, voice: true, volume: CFG.defaultVolume != null ? CFG.defaultVolume : 0.6, reducedMotion: false },
      currentProfile: null,
      profiles: []
    };
  }

  let data = blank();
  let storageOk = true;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.profiles)) data = Object.assign(blank(), parsed, { settings: Object.assign(blank().settings, parsed.settings || {}) });
      }
    } catch (e) {
      storageOk = false;
    }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      storageOk = true;
    } catch (e) {
      storageOk = false;
    }
  }

  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  const Progress = {
    get storageOk() { return storageOk; },
    load, save,
    get settings() { return data.settings; },
    setSetting(k, v) { data.settings[k] = v; save(); },

    /* ---------- perfis ---------- */
    profiles() { return data.profiles; },
    current() { return data.profiles.find((p) => p.id === data.currentProfile) || null; },
    get(id) { return data.profiles.find((p) => p.id === id) || null; },
    select(id) { if (this.get(id)) { data.currentProfile = id; save(); } },
    create(name, avatar) {
      const clean = String(name || '').replace(/[<>&"]/g, '').trim().slice(0, 20).toLocaleUpperCase('pt-BR');
      const p = {
        id: uid(),
        name: clean || 'EXPLORADOR ' + (data.profiles.length + 1),
        avatar: avatar || 'raposa',
        createdAt: new Date().toISOString(),
        unlockedAll: false,
        totalTimeMs: 0,
        levels: {},
        worldsCelebrated: [],
        finalCelebrated: false,
        history: []
      };
      data.profiles.push(p);
      data.currentProfile = p.id;
      save();
      return p;
    },
    rename(id, name) { const p = this.get(id); if (p) { p.name = String(name).replace(/[<>&"]/g, '').trim().slice(0, 20).toLocaleUpperCase('pt-BR') || p.name; save(); } },
    remove(id) {
      data.profiles = data.profiles.filter((p) => p.id !== id);
      if (data.currentProfile === id) data.currentProfile = data.profiles[0] ? data.profiles[0].id : null;
      save();
    },
    reset(id) {
      const p = this.get(id);
      if (!p) return;
      p.levels = {}; p.totalTimeMs = 0; p.history = []; p.worldsCelebrated = []; p.finalCelebrated = false; p.unlockedAll = false;
      save();
    },
    setUnlockAll(id, v) { const p = this.get(id); if (p) { p.unlockedAll = !!v; save(); } },

    /* ---------- progresso ---------- */
    levelInfo(p, n) { return (p && p.levels[n]) || null; },
    isCompleted(p, n) { const l = this.levelInfo(p, n); return !!(l && l.completed); },
    isUnlocked(p, n) {
      if (!p) return n === 1;
      if (n === 1 || p.unlockedAll) return true;
      return this.isCompleted(p, n - 1) || this.isCompleted(p, n);
    },
    completedCount(p) { return p ? Object.values(p.levels).filter((l) => l.completed).length : 0; },
    starsTotal(p) { return p ? Object.values(p.levels).reduce((a, l) => a + (l.bestStars || 0), 0) : 0; },
    nextLevel(p) {
      for (let n = 1; n <= TOTAL; n++) if (!this.isCompleted(p, n)) return n;
      return null;
    },
    worldComplete(p, w) {
      const W = CDL.WORLDS[w - 1];
      for (let n = W.first; n <= W.last; n++) if (!this.isCompleted(p, n)) return false;
      return true;
    },
    allComplete(p) { return this.completedCount(p) === TOTAL; },

    /** Registra uma tentativa (concluída ou abandonada). */
    recordAttempt(p, n, att) {
      if (!p) return null;
      const entry = {
        level: n,
        word: CDL.LEVELS[n - 1].word,
        date: new Date().toISOString(),
        timeMs: Math.round(att.timeMs),
        hints: att.hints,
        errors: att.errors,
        stars: att.stars || 0,
        completed: !!att.completed,
        inOrder: !!att.inOrder
      };
      const l = p.levels[n] || (p.levels[n] = { completed: false, bestStars: 0, bestTimeMs: null, lastTimeMs: null, plays: 0, completions: 0, hints: 0, errors: 0 });
      l.plays += 1;
      l.hints += entry.hints;
      l.errors += entry.errors;
      if (entry.completed) {
        const first = !l.completed;
        l.completed = true;
        l.completions += 1;
        l.lastTimeMs = entry.timeMs;
        l.bestTimeMs = l.bestTimeMs == null ? entry.timeMs : Math.min(l.bestTimeMs, entry.timeMs);
        l.bestStars = Math.max(l.bestStars, entry.stars);
        if (first) { l.firstTimeMs = entry.timeMs; l.firstHints = entry.hints; l.firstErrors = entry.errors; l.firstDate = entry.date; }
      }
      p.totalTimeMs = (p.totalTimeMs || 0) + entry.timeMs;
      p.history.push(entry);
      if (p.history.length > 600) p.history.splice(0, p.history.length - 600);
      save();
      return entry;
    },

    /* ---------- exportação ---------- */
    toCSV(profiles) {
      const esc = (v) => {
        const s = v == null ? '' : String(v);
        return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const rows = [['Perfil', 'Fase', 'Mundo', 'Palavra', 'Concluída', 'Estrelas (melhor)', 'Melhor tempo', 'Último tempo', 'Tempo total na fase', 'Tentativas', 'Dicas (total)', 'Erros (total)', 'Data da 1ª conclusão']];
      profiles.forEach((p) => {
        CDL.LEVELS.forEach((lv) => {
          const l = p.levels[lv.n];
          const timeInLevel = p.history.filter((h) => h.level === lv.n).reduce((a, h) => a + h.timeMs, 0);
          rows.push([
            p.name, lv.n, CDL.WORLDS[lv.world - 1].short, lv.word,
            l && l.completed ? 'Sim' : 'Não',
            l ? l.bestStars : 0,
            l && l.bestTimeMs != null ? CDL.formatTime(l.bestTimeMs) : '',
            l && l.lastTimeMs != null ? CDL.formatTime(l.lastTimeMs) : '',
            timeInLevel ? CDL.formatTime(timeInLevel) : '',
            l ? l.plays : 0,
            l ? l.hints : 0,
            l ? l.errors : 0,
            l && l.firstDate ? new Date(l.firstDate).toLocaleString('pt-BR') : ''
          ]);
        });
        rows.push([p.name, 'TOTAL', '', '', this.completedCount(p) + '/30', this.starsTotal(p) + '/90', '', '', CDL.formatTime(p.totalTimeMs), '', '', '', '']);
      });
      return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n');
    },
    historyCSV(profiles) {
      const rows = [['Perfil', 'Data', 'Fase', 'Palavra', 'Situação', 'Tempo', 'Dicas', 'Erros', 'Estrelas', 'Coletou em ordem']];
      profiles.forEach((p) => p.history.forEach((h) => rows.push([p.name, new Date(h.date).toLocaleString('pt-BR'), h.level, h.word, h.completed ? 'Concluída' : 'Interrompida', CDL.formatTime(h.timeMs), h.hints, h.errors, h.stars, h.inOrder ? 'Sim' : 'Não'])));
      return '﻿' + rows.map((r) => r.map((v) => (/[;"\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v)).join(';')).join('\r\n');
    }
  };

  load();
  CDL.Progress = Progress;
})();
