/* =========================================================
   MISSÃO RESPEITO — Núcleo: salvamento, sons e utilidades
   Nenhum dado pessoal é coletado. O progresso fica apenas
   neste navegador (localStorage).
   ========================================================= */
(function () {
  'use strict';

  const KEY = 'missaoRespeito.v1';
  const DEFAULT = () => ({ v: 1, missions: {}, phrases: [], customPhrase: '', posters: {}, campaign: [], celebrated: {}, finished: false, sound: true, unlockAll: false });

  let memoryFallback = null;
  const Store = {
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return DEFAULT();
        const d = JSON.parse(raw);
        return Object.assign(DEFAULT(), d && typeof d === 'object' ? d : {});
      } catch (e) {
        return memoryFallback ? JSON.parse(memoryFallback) : DEFAULT();
      }
    },
    save(state) {
      const s = JSON.stringify(state);
      memoryFallback = s;
      try { localStorage.setItem(KEY, s); return true; } catch (e) { return false; }
    },
    wipe() {
      memoryFallback = null;
      try { localStorage.removeItem(KEY); } catch (e) { /* sem acesso */ }
    }
  };

  /* ---------- Sons (opcionais: o jogo não depende de áudio) ---------- */
  let actx = null;
  function ac() {
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { actx = new C(); } catch (e) { return null; }
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  }
  function tone(freq, start, dur, type = 'sine', vol = 0.18) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  const SFX = {
    enabled: true,
    play(name) {
      if (!this.enabled) return;
      try {
        switch (name) {
          case 'ok': tone(660, 0, .15, 'triangle'); tone(990, .1, .25, 'triangle'); break;
          case 'bad': tone(260, 0, .18, 'sine', .14); tone(200, .14, .26, 'sine', .12); break;
          case 'click': tone(520, 0, .06, 'square', .05); break;
          case 'flip': tone(440, 0, .07, 'triangle', .08); break;
          case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .3, 'triangle', .16)); break;
          case 'star': tone(880, 0, .12, 'triangle', .14); tone(1320, .08, .2, 'triangle', .1); break;
        }
      } catch (e) { /* áudio indisponível */ }
    }
  };

  /* ---------- Utilidades ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }
  function shuffleNot(a, eq) {
    if (a.length < 2) return a.slice();
    let r, tries = 0;
    do { r = shuffle(a); tries++; } while (tries < 30 && eq(r));
    return r;
  }

  function stars(n, total = 3) {
    let s = '';
    for (let i = 0; i < total; i++) s += `<span class="s ${i < n ? 'on' : ''}" aria-hidden="true">★</span>`;
    return `<span class="stars" role="img" aria-label="${n} de ${total} estrelas">${s}</span>`;
  }

  function confetti(n = 80) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0', '#FF8A3D', '#3D8BFF', '#2BB673'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = (2 + Math.random() * 2.5) + 's';
      c.style.animationDelay = (Math.random() * .6) + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      if (i % 3 === 0) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5500);
    }
  }

  function toast(msg, ms = 2600) {
    document.querySelectorAll('.toast').forEach(o => o.remove());
    const t = el(`<div class="toast" role="status">${esc(msg)}</div>`);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  }

  /* Janela modal acessível. buttons: [{label, cls, value}] */
  function modal(html, buttons = [{ label: 'OK', cls: 'primary', value: true }], opts = {}) {
    return new Promise(resolve => {
      const last = document.activeElement;
      const back = el(`<div class="modal-back" role="dialog" aria-modal="true">
        <div class="modal card">${html}<div class="row center modal-btns" style="margin-top:16px"></div></div></div>`);
      const box = $('.modal-btns', back);
      const close = (v) => {
        back.remove();
        document.removeEventListener('keydown', onKey);
        if (last && last.focus) try { last.focus(); } catch (e) { /* ok */ }
        resolve(v);
      };
      buttons.forEach(b => {
        const btn = el(`<button class="btn ${b.cls || ''}">${b.label}</button>`);
        btn.addEventListener('click', () => { SFX.play('click'); close(b.value); });
        box.appendChild(btn);
      });
      const onKey = (e) => { if (e.key === 'Escape' && opts.escape !== false) close(opts.escValue === undefined ? null : opts.escValue); };
      document.addEventListener('keydown', onKey);
      document.body.appendChild(back);
      const f = $('.modal-btns .btn', back);
      if (f) f.focus();
    });
  }

  /*
   * Arrastar-e-soltar que funciona com mouse e toque,
   * e com alternativa de "tocar para selecionar".
   */
  function dragTap(node, { targetSel, onDrop, onTap, canStart }) {
    let sx = 0, sy = 0, pid = null, dragging = false, ghost = null, over = null, justDragged = false;
    const targetAt = (x, y) => {
      const e = document.elementFromPoint(x, y);
      return e ? e.closest(targetSel) : null;
    };
    const cleanup = () => {
      if (ghost) ghost.remove();
      ghost = null;
      node.style.opacity = '';
      document.body.classList.remove('dragging');
      if (over) over.classList.remove('hover');
      over = null;
      dragging = false;
      pid = null;
    };
    node.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (canStart && !canStart()) return;
      sx = e.clientX; sy = e.clientY; pid = e.pointerId; dragging = false;
      try { node.setPointerCapture(pid); } catch (er) { /* ok */ }
    });
    node.addEventListener('pointermove', (e) => {
      if (pid !== e.pointerId) return;
      if (!dragging && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) {
        dragging = true;
        ghost = node.cloneNode(true);
        ghost.classList.add('ghost');
        ghost.classList.remove('sel');
        ghost.style.width = node.offsetWidth + 'px';
        document.body.appendChild(ghost);
        node.style.opacity = '.35';
        document.body.classList.add('dragging');
        try { window.getSelection().removeAllRanges(); } catch (er) { /* ok */ }
      }
      if (dragging) {
        e.preventDefault();
        ghost.style.left = (e.clientX - node.offsetWidth / 2) + 'px';
        ghost.style.top = (e.clientY - 24) + 'px';
        const t = targetAt(e.clientX, e.clientY);
        if (t !== over) {
          if (over) over.classList.remove('hover');
          over = t;
          if (over) over.classList.add('hover');
        }
      }
    });
    node.addEventListener('pointerup', (e) => {
      if (pid !== e.pointerId) return;
      if (dragging) {
        const t = targetAt(e.clientX, e.clientY);
        justDragged = true;
        setTimeout(() => { justDragged = false; }, 50);
        cleanup();
        if (t) onDrop(t);
      } else {
        pid = null;
      }
    });
    node.addEventListener('pointercancel', cleanup);
    node.addEventListener('lostpointercapture', () => { if (dragging) cleanup(); });
    node.addEventListener('click', (e) => {
      if (justDragged) { e.preventDefault(); return; }
      if (canStart && !canStart()) return;
      onTap && onTap();
    });
  }

  window.CORE = { Store, SFX, $, $$, el, esc, shuffle, shuffleNot, stars, confetti, toast, modal, dragTap };
})();
