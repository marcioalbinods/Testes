/* O QUE VEM PRIMEIRO? — Utilidades de tela: elementos, ícones, medalhas, sobreposições e confete. */
(function (root) {
  'use strict';
  const doc = root.document;

  // Cria elementos: h('div.card#id', {attrs}, filhos...)
  function h(sel, attrs, ...kids) {
    const m = sel.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = doc.createElement((m && m[1]) || 'div');
    if (m && m[2]) m[2].replace(/([.#])([\w-]+)/g, (_, t, v) => { if (t === '.') el.classList.add(v); else el.id = v; });
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    kids.flat().forEach((k) => { if (k === null || k === undefined || k === false) return; el.append(k.nodeType ? k : doc.createTextNode(String(k))); });
    return el;
  }

  /* ---------- Ícones ---------- */
  const ic = (d, extra = '') => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</g></svg>`;
  const ICON = {
    map: ic('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'),
    home: ic('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    pause: ic('<path d="M8 5v14M16 5v14"/>'),
    play: ic('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
    restart: ic('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/>'),
    bulb: ic('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
    soundOn: ic('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    soundOff: ic('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/>'),
    speak: ic('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>'),
    check: ic('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    close: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
    lock: ic('<rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    left: ic('<path d="M15 5l-7 7 7 7"/>'),
    right: ic('<path d="M9 5l7 7-7 7"/>'),
    up: ic('<path d="M5 15l7-7 7 7"/>'),
    down: ic('<path d="M5 9l7 7 7-7"/>'),
    star: ic('<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" fill="currentColor"/>', 'stroke-width="1.5"'),
    trophy: ic('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/>'),
    help: ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/>'),
    teacher: ic('<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>'),
    go: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    flag: ic('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    swap: ic('<path d="M7 7h12l-3-3M17 17H5l3 3"/>'),
    hand: ic('<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11M12 10V4.5a1.5 1.5 0 0 1 3 0V11M15 10.5V6.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 15a1.6 1.6 0 0 1 2.5-2L9 16V11"/>'),
    trash: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>')
  };

  /* ---------- Medalhas ---------- */
  function medalSVG(id, locked) {
    const g = locked ? 'grayscale' : '';
    const ribbon = (c1, c2) => `<path d="M30 6 L44 46 L56 40 L42 2Z" fill="${c1}" stroke="#2f3150" stroke-width="3" stroke-linejoin="round"/><path d="M70 6 L56 46 L44 40 L58 2Z" fill="${c2}" stroke="#2f3150" stroke-width="3" stroke-linejoin="round"/>`;
    const star = (cx, cy, r, f) => {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r; const a = -Math.PI / 2 + i * Math.PI / 5;
        d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
      }
      return `<path d="${d}Z" fill="${f}" stroke="#2f3150" stroke-width="3" stroke-linejoin="round"/>`;
    };
    let body = '';
    if (id === 'aprendiz') {
      body = star(50, 56, 40, '#ffd34d') + star(50, 58, 18, '#17b59a') + '<path d="M28 34 Q34 26 42 26" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>';
    } else if (id === 'organizador') {
      body = ribbon('#ff8f2e', '#ffb547') + '<circle cx="50" cy="66" r="28" fill="#ffd34d" stroke="#2f3150" stroke-width="3"/><circle cx="50" cy="66" r="19" fill="#ff8f2e" stroke="#2f3150" stroke-width="2.5"/>' +
        '<path d="M40 60h20M40 67h20M40 74h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>';
    } else if (id === 'investigador') {
      body = '<path d="M26 18h48v22a24 24 0 0 1-48 0z" fill="#b39cff" stroke="#2f3150" stroke-width="3"/>' +
        '<path d="M26 24H14a12 12 0 0 0 14 16M74 24h12a12 12 0 0 1-14 16" fill="none" stroke="#2f3150" stroke-width="4"/>' +
        '<path d="M44 62h12v14H44z" fill="#ffd34d" stroke="#2f3150" stroke-width="3"/><rect x="32" y="76" width="36" height="12" rx="4" fill="#7a5cf0" stroke="#2f3150" stroke-width="3"/>' +
        '<circle cx="48" cy="36" r="9" fill="#eaf6ff" stroke="#2f3150" stroke-width="3"/><path d="M54 42l7 7" stroke="#2f3150" stroke-width="4" stroke-linecap="round"/>';
    } else {
      body = ribbon('#7a5cf0', '#17b59a') + '<circle cx="50" cy="64" r="32" fill="#ffd34d" stroke="#2f3150" stroke-width="3"/><circle cx="50" cy="64" r="24" fill="#ffe788" stroke="#e0a400" stroke-width="2.5"/>' +
        star(50, 64, 17, '#ff8f2e') + '<path d="M26 98 Q50 90 74 98" stroke="#2f3150" stroke-width="0" fill="none"/>';
    }
    return `<svg class="medal-svg ${g}" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
  }

  /* ---------- Sobreposições (janelas) ---------- */
  function overlay(content, opts = {}) {
    const box = h('div.overlay' + (opts.cls ? '.' + opts.cls : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.label || 'Janela' },
      h('div.overlay-card', null, content));
    doc.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('show'));
    const first = box.querySelector('[data-focus]') || box.querySelector('button');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
    const close = () => { box.classList.remove('show'); setTimeout(() => box.remove(), 220); };
    box.close = close;
    return box;
  }
  function closeOverlays() { doc.querySelectorAll('.overlay').forEach((o) => o.remove()); }

  /* ---------- Confete ---------- */
  function confetti(n = 70) {
    if (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) n = 14;
    const layer = h('div.confetti', { 'aria-hidden': 'true' });
    const cols = ['#ff8f2e', '#17b59a', '#7a5cf0', '#ffd34d', '#ff6b8b', '#4f8cff'];
    for (let i = 0; i < n; i++) {
      const p = h('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = cols[i % cols.length];
      p.style.animationDelay = (Math.random() * 0.7) + 's';
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      p.style.setProperty('--x', (Math.random() * 200 - 100) + 'px');
      p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      if (i % 3 === 0) p.style.borderRadius = '50%';
      layer.appendChild(p);
    }
    doc.body.appendChild(layer);
    setTimeout(() => layer.remove(), 4200);
  }

  /* ---------- Leitura em voz alta (se o aparelho tiver voz em português) ---------- */
  function speak(text) {
    try {
      const synth = root.speechSynthesis;
      if (!synth) return false;
      synth.cancel();
      const u = new root.SpeechSynthesisUtterance(text.replace(/[“”"]/g, ''));
      u.lang = 'pt-BR'; u.rate = 0.95; u.pitch = 1.1;
      const v = synth.getVoices().find((x) => /pt[-_]BR/i.test(x.lang)) || synth.getVoices().find((x) => /^pt/i.test(x.lang));
      if (v) u.voice = v;
      synth.speak(u);
      return true;
    } catch (e) { return false; }
  }
  function stopSpeak() { try { root.speechSynthesis && root.speechSynthesis.cancel(); } catch (e) { /* ok */ } }
  const canSpeak = () => !!root.speechSynthesis;

  /* ---------- Animação FLIP (cartões deslizando para o novo lugar) ---------- */
  function flip(container, mutate) {
    const kids = Array.from(container.children);
    const before = new Map(kids.map((k) => [k, k.getBoundingClientRect()]));
    mutate();
    if (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    Array.from(container.children).forEach((k) => {
      const a = before.get(k); if (!a) return;
      const b = k.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if ((dx || dy) && k.animate) k.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }

  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  function pop(el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

  root.OQVP = root.OQVP || {};
  root.OQVP.ui = { h, ICON, medalSVG, overlay, closeOverlays, confetti, speak, stopSpeak, canSpeak, flip, shake, pop };
})(window);
