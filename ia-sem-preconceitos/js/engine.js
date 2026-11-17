/* =====================================================================
   Motor do jogo: estado, salvamento (localStorage), XP, níveis,
   medalhas, conquistas e utilitários (DOM, arrastar e soltar).
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'nexuslab-ia-justa-v1';
  const HIST = 'nexuslab-ia-justa-historico';
  const G = window.GAME;

  /* ------------------------- Utilitários ------------------------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat(Infinity).forEach((c) => {
      if (c == null || c === false) return;
      if (c instanceof Node) el.appendChild(c);
      else if (typeof c === 'string' && c.startsWith('<svg')) { const t = document.createElement('template'); t.innerHTML = c; el.appendChild(t.content); }
      else el.appendChild(document.createTextNode(String(c)));
    });
    return el;
  }
  function shuffle(a, seed) {
    const r = a.slice();
    let s = seed || Math.floor(Math.random() * 1e9);
    const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function fmt(n) { return Math.round(n).toLocaleString('pt-BR'); }
  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------- Estado --------------------------- */
  function fresh() {
    return {
      v: 1,
      player: null, // { name, avatar }
      xp: 0,
      missions: {}, // id -> { status:'locked'|'open'|'done', score, max, errors, hints, completedAt, medalTier }
      challenges: {}, // id -> { xp, max, errors, hints, recovered, done }
      current: null, // { mission, challenge }
      achievements: {},
      inspirations: [],
      corrected: 0,
      finalText: '',
      finalEval: null,
      settings: { sfx: true, music: false },
      startedAt: null, lastPlayed: null, playSeconds: 0,
      introSeen: false, graduated: false,
      cloud: null, updated: 0, finalConcept: ''
    };
  }
  let S = fresh();

  function storageOK() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch (e) { return false; } }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); if (d && d.v === 1) S = Object.assign(fresh(), d); }
    } catch (e) { S = fresh(); }
    ensureMissions();
    return S;
  }
  // save(true): grava só no aparelho, sem marcar mudança para o salvamento online
  function save(quiet) {
    S.lastPlayed = new Date().toISOString();
    if (!quiet) S.updated = Date.now();
    let ok = true;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { ok = false; }
    if (!quiet && window.CLOUD && S.cloud) CLOUD.schedule();
    return ok;
  }
  // recebe o progresso salvo online (ao entrar numa dupla)
  function adopt(estado, cloud, updated) {
    const st = S.settings;
    S = Object.assign(fresh(), estado || {});
    S.settings = st; S.cloud = cloud; S.updated = updated || Date.now();
    ensureMissions();
    save(true);
  }
  function hasSave() { try { const r = localStorage.getItem(KEY); if (!r) return false; const d = JSON.parse(r); return !!(d && d.player); } catch (e) { return false; } }
  // keepIdentity: recomeça o progresso mas mantém a dupla (nome, avatar e salvamento online)
  function reset(keepSettings, keepIdentity) {
    const st = S.settings, pl = S.player, cl = S.cloud;
    S = fresh(); if (keepSettings) S.settings = st;
    if (keepIdentity && pl) { S.player = pl; S.cloud = cl; S.introSeen = true; S.startedAt = new Date().toISOString(); }
    ensureMissions();
    try { localStorage.removeItem(KEY); } catch (e) { /* */ }
    save();
  }
  function ensureMissions() {
    G.missions.forEach((m, i) => {
      if (!S.missions[m.id]) S.missions[m.id] = { status: i === 0 ? 'open' : 'locked', score: 0, max: 0, errors: 0, hints: 0 };
    });
  }
  function missionMax(m) { return m.challenges.reduce((a, c) => a + c.xp + c.steps.reduce((b, s) => b + (s.bonus || 0), 0), 0); }

  /* ---------------------- Níveis e progresso ---------------------- */
  function level(xp) {
    xp = xp == null ? S.xp : xp;
    let idx = 0;
    G.levels.forEach((l, i) => { if (xp >= l.xp) idx = i; });
    const cur = G.levels[idx], nxt = G.levels[idx + 1];
    return { idx, num: idx + 1, title: cur.title, from: cur.xp, to: nxt ? nxt.xp : cur.xp, pct: nxt ? (xp - cur.xp) / (nxt.xp - cur.xp) : 1, max: !nxt };
  }
  function progress() {
    const total = G.missions.reduce((a, m) => a + m.challenges.length, 0);
    const done = G.missions.reduce((a, m) => a + m.challenges.filter((c) => S.challenges[c.id] && S.challenges[c.id].done).length, 0);
    return { total, done, pct: total ? done / total : 0 };
  }
  function medalTier(score, max) { const p = max ? score / max : 0; return p >= 0.9 ? 'ouro' : p >= 0.7 ? 'prata' : 'bronze'; }

  /* ---------------------- Pontuação de desafios ---------------------- */
  // result = { errors, hints, bonus, recovered }
  function scoreChallenge(ch, result) {
    const base = ch.xp;
    const factor = Math.max(0.5, 1 - 0.12 * result.errors);
    const baseXp = Math.round(base * factor);
    const hintCost = Math.min(result.hints * 5, 20);
    const recovery = Math.min(result.recovered * 10, 30);
    const total = Math.max(10, baseXp + result.bonus + recovery - hintCost);
    return { baseXp, bonus: result.bonus, recovery, hintCost, total };
  }

  function completeChallenge(mission, ch, result) {
    const prev = S.challenges[ch.id];
    const sc = scoreChallenge(ch, result);
    const max = ch.xp + ch.steps.reduce((b, s) => b + (s.bonus || 0), 0);
    const levelBefore = level().idx;
    let gained = sc.total;
    if (prev && prev.done) gained = Math.max(0, sc.total - prev.xp); // repetir só soma se melhorar
    const best = prev && prev.done ? Math.max(prev.xp, sc.total) : sc.total;
    S.challenges[ch.id] = { xp: best, max, errors: result.errors, hints: result.hints, recovered: result.recovered, done: true, at: new Date().toISOString() };
    S.xp += gained;
    S.corrected += result.recovered;
    const unlocked = [];
    if (result.recovered > 0) unlocked.push(...award('errar'));
    if (S.corrected >= 10) unlocked.push(...award('persistencia'));
    // pontuação da missão
    const ms = S.missions[mission.id];
    ms.score = mission.challenges.reduce((a, c) => a + (S.challenges[c.id] && S.challenges[c.id].done ? S.challenges[c.id].xp : 0), 0);
    ms.max = missionMax(mission);
    ms.errors = mission.challenges.reduce((a, c) => a + (S.challenges[c.id] ? S.challenges[c.id].errors || 0 : 0), 0);
    ms.hints = mission.challenges.reduce((a, c) => a + (S.challenges[c.id] ? S.challenges[c.id].hints || 0 : 0), 0);
    save();
    return { sc, gained, levelUp: level().idx > levelBefore ? level() : null, unlocked };
  }

  function completeMission(mission) {
    const ms = S.missions[mission.id];
    const first = ms.status !== 'done';
    ms.status = 'done';
    ms.completedAt = ms.completedAt || new Date().toISOString();
    ms.medalTier = medalTier(ms.score, ms.max);
    const unlocked = [];
    const idx = G.missions.indexOf(mission);
    const next = G.missions[idx + 1];
    let nextUnlocked = null;
    if (next && S.missions[next.id].status === 'locked') { S.missions[next.id].status = 'open'; nextUnlocked = next; }
    const newInsp = [];
    (mission.inspirations || []).forEach((id) => { if (!S.inspirations.includes(id)) { S.inspirations.push(id); newInsp.push(id); } });
    if (ms.errors === 0) unlocked.push(...award('impecavel'));
    if (ms.hints === 0) unlocked.push(...award('autonomia'));
    if (G.missions.filter((m) => S.missions[m.id].status === 'done').length >= 3) unlocked.push(...award('metade'));
    if (S.inspirations.length >= G.inspirations.length) unlocked.push(...award('inspiracao'));
    if (G.missions.every((m) => S.missions[m.id].status === 'done')) { unlocked.push(...award('formatura')); S.graduated = true; }
    S.current = null;
    save();
    return { first, tier: ms.medalTier, nextUnlocked, newInsp, unlocked };
  }

  function award(id) {
    if (S.achievements[id]) return [];
    S.achievements[id] = new Date().toISOString();
    save();
    const a = G.achievements.find((x) => x.id === id);
    return a ? [a] : [];
  }

  /* ----------------------- Avaliação da escrita ----------------------- */
  function evaluateText(text, rubric) {
    const t = norm(text);
    const words = t.split(/\s+/).filter(Boolean).length;
    const res = rubric.map((r) => {
      const hits = r.terms.filter((term) => t.includes(term));
      const uniq = [...new Set(hits.map((x) => x.slice(0, 5)))];
      const score = Math.min(3, uniq.length);
      return { id: r.id, label: r.label, desc: r.desc, score, hits: uniq.length };
    });
    return { words, chars: text.trim().length, res };
  }

  /* --------------------------- Histórico --------------------------- */
  function summary() {
    const lv = level();
    return {
      name: S.player ? S.player.name : '—', xp: S.xp, level: lv.title, progress: Math.round(progress().pct * 100),
      missions: G.missions.map((m) => ({ id: m.id, num: m.num, title: m.title, status: S.missions[m.id].status, score: S.missions[m.id].score, max: S.missions[m.id].max || missionMax(m), errors: S.missions[m.id].errors, hints: S.missions[m.id].hints, tier: S.missions[m.id].medalTier })),
      achievements: Object.keys(S.achievements).length, finalText: S.finalText, finalEval: S.finalEval,
      startedAt: S.startedAt, lastPlayed: S.lastPlayed, playSeconds: S.playSeconds, graduated: S.graduated
    };
  }
  function history() { try { return JSON.parse(localStorage.getItem(HIST) || '[]'); } catch (e) { return []; } }
  function archive() {
    if (!S.player) return;
    const list = history(); list.unshift(Object.assign({ archivedAt: new Date().toISOString() }, summary()));
    try { localStorage.setItem(HIST, JSON.stringify(list.slice(0, 60))); } catch (e) { /* */ }
  }
  function clearAll() { try { localStorage.removeItem(KEY); localStorage.removeItem(HIST); } catch (e) { /* */ } S = fresh(); ensureMissions(); save(); }

  /* --------------------- Arrastar e soltar (toque + mouse) ---------------------
     makeDraggable(el, { data, onDrop(zoneEl, data), zones: selector, onTap(el) })
     Também funciona por "tocar e tocar": selecione o item e depois a área.   */
  let tapSelected = null; let tapCfg = null;
  function clearTap() { if (tapSelected) tapSelected.classList.remove('tap-selected'); tapSelected = null; tapCfg = null; document.body.classList.remove('tap-mode'); }
  function makeDraggable(el, cfg) {
    el.classList.add('draggable');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    let start = null, ghost = null, moved = false, over = null, pid = null;
    const zones = () => Array.from(document.querySelectorAll(cfg.zones));
    function zoneAt(x, y) {
      if (ghost) ghost.style.display = 'none';
      const target = document.elementFromPoint(x, y);
      if (ghost) ghost.style.display = '';
      if (!target) return null;
      const z = target.closest(cfg.zones);
      return z && zones().includes(z) ? z : null;
    }
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (el.classList.contains('disabled')) return;
      const ctl = e.target.closest && e.target.closest('button, input, textarea, select, a');
      if (ctl && ctl !== el && el.contains(ctl)) return; // botões dentro do item continuam clicáveis
      start = { x: e.clientX, y: e.clientY }; moved = false; pid = e.pointerId;
      try { el.setPointerCapture(pid); } catch (er) { /* */ }
    });
    el.addEventListener('pointermove', (e) => {
      if (!start || e.pointerId !== pid) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) > 8) {
        moved = true; clearTap();
        const r = el.getBoundingClientRect();
        ghost = el.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.removeAttribute('id');
        ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
        ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
        ghost._ox = start.x - r.left; ghost._oy = start.y - r.top;
        document.body.appendChild(ghost); el.classList.add('dragging');
        document.body.classList.add('is-dragging');
        window.AUDIO && AUDIO.play('select');
      }
      if (moved && ghost) {
        ghost.style.left = (e.clientX - ghost._ox) + 'px'; ghost.style.top = (e.clientY - ghost._oy) + 'px';
        const z = zoneAt(e.clientX, e.clientY);
        if (z !== over) { if (over) over.classList.remove('drop-over'); over = z; if (over) over.classList.add('drop-over'); }
      }
    });
    function end(e) {
      if (!start || (e && e.pointerId !== pid)) return;
      try { el.releasePointerCapture(pid); } catch (er) { /* */ }
      if (moved) {
        const z = e ? zoneAt(e.clientX, e.clientY) : null;
        if (over) over.classList.remove('drop-over');
        if (ghost) ghost.remove(); ghost = null; el.classList.remove('dragging'); document.body.classList.remove('is-dragging');
        if (z) cfg.onDrop(z, cfg.data, el);
      } else if (e && e.type === 'pointerup') {
        // toque simples: seleciona para "tocar e tocar"
        if (tapSelected === el) { clearTap(); }
        else { clearTap(); tapSelected = el; tapCfg = cfg; el.classList.add('tap-selected'); document.body.classList.add('tap-mode'); window.AUDIO && AUDIO.play('select'); }
        if (cfg.onTap) cfg.onTap(el);
      }
      start = null; over = null; moved = false;
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', (e) => { if (ghost) ghost.remove(); ghost = null; el.classList.remove('dragging'); document.body.classList.remove('is-dragging'); if (over) over.classList.remove('drop-over'); start = null; moved = false; });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (tapSelected === el) clearTap(); else { clearTap(); tapSelected = el; tapCfg = cfg; el.classList.add('tap-selected'); document.body.classList.add('tap-mode'); } } });
  }
  function makeDropZone(zone) {
    zone.classList.add('drop-zone');
    if (!zone.hasAttribute('tabindex')) zone.setAttribute('tabindex', '0');
    const go = (e) => {
      if (!tapSelected || !tapCfg) return;
      if (!zone.matches(tapCfg.zones)) return;
      if (e && e.target && e.target.closest && e.target.closest('.draggable')) return; // toque em um item: seleção, não destino
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const cfg = tapCfg, el = tapSelected; clearTap();
      cfg.onDrop(zone, cfg.data, el);
    };
    zone.addEventListener('click', go);
    zone.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && tapSelected) go(e); });
  }

  window.ENGINE = {
    get state() { return S; }, load, save, adopt, hasSave, reset, storageOK, level, progress, medalTier, missionMax,
    completeChallenge, completeMission, award, scoreChallenge, evaluateText, summary, history, archive, clearAll,
    h, shuffle, norm, esc, fmt, sleep, reducedMotion, makeDraggable, makeDropZone, clearTap
  };
})();
