/* MOSAICO SECRETO — Telas e regras do jogo. */
(function () {
  'use strict';
  const { COLORS, WORLDS, MISSIONS } = window.MOSAICO_DATA;
  const { build, drawThumb, rasterize } = window.MOSAICO;
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');
  const TOTAL = MISSIONS.length;

  /* ================= progresso salvo no navegador ================= */
  const KEY = 'mosaicoSecreto.v1';
  const DEFAULT_SETTINGS = { sound: true, voice: true, voiceCell: false, drag: true, names: true };
  let S = { done: {}, partial: {}, unlockAll: false, settings: Object.assign({}, DEFAULT_SETTINGS) };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      S.done = raw.done || {};
      S.partial = raw.partial || {};
      S.unlockAll = !!raw.unlockAll;
      S.settings = Object.assign({}, DEFAULT_SETTINGS, raw.settings || {});
    }
  } catch (e) { /* navegador sem armazenamento: joga sem salvar */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } }
  function applySettings() { Sfx.setSound(S.settings.sound); Sfx.setVoice(S.settings.voice); }
  applySettings();

  const isDone = (id) => !!S.done[id];
  const isUnlocked = (id) => S.unlockAll || id === 1 || isDone(id) || isDone(id - 1);
  const worldUnlocked = (w) => isUnlocked((w - 1) * 10 + 1);
  const worldDone = (w) => MISSIONS.filter((m) => m.world === w && isDone(m.id)).length;
  const totalDone = () => MISSIONS.filter((m) => isDone(m.id)).length;
  function nextPlayable() {
    const m = MISSIONS.find((x) => !isDone(x.id) && isUnlocked(x.id));
    return m ? m.id : null;
  }
  function partialSet(id) {
    const bits = S.partial[id];
    const set = new Set();
    if (typeof bits === 'string') for (let i = 0; i < bits.length; i++) if (bits[i] === '1') set.add(i);
    return set;
  }

  /* ================= utilidades ================= */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const W = (id) => WORLDS[id - 1];
  function worldVars(w) {
    return `--c1:${w.colors[0]};--c2:${w.colors[1]};--deep:${w.deep}`;
  }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  const withArticle = (m) => (m.art === 'a' ? 'A ' : 'O ') + m.name;

  function mascot(color, cls) {
    return `<svg class="mascot ${cls || ''}" viewBox="0 0 100 112" aria-hidden="true"><g class="body">
      <rect x="24" y="92" width="18" height="14" rx="7" fill="#2D2B38"/><rect x="58" y="92" width="18" height="14" rx="7" fill="#2D2B38"/>
      <rect x="8" y="10" width="84" height="84" rx="22" fill="${color}"/>
      <rect x="8" y="10" width="84" height="84" rx="22" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="5"/>
      <rect x="18" y="18" width="24" height="10" rx="5" fill="#fff" opacity=".45"/>
      <ellipse cx="34" cy="48" rx="10" ry="12" fill="#fff"/><ellipse cx="66" cy="48" rx="10" ry="12" fill="#fff"/>
      <circle cx="36" cy="50" r="6" fill="#2D2B38"/><circle cx="68" cy="50" r="6" fill="#2D2B38"/>
      <circle cx="38" cy="47" r="2" fill="#fff"/><circle cx="70" cy="47" r="2" fill="#fff"/>
      <rect class="lid" x="22" y="35" width="24" height="26" rx="10" fill="${color}"/><rect class="lid" x="54" y="35" width="24" height="26" rx="10" fill="${color}"/>
      <circle cx="22" cy="66" r="6" fill="#FF6FA8" opacity=".55"/><circle cx="78" cy="66" r="6" fill="#FF6FA8" opacity=".55"/>
      <path d="M38 68 Q50 80 62 68" stroke="#2D2B38" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g></svg>`;
  }
  const SVG_SOUND_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const SVG_SOUND_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // Quadradinhos coloridos flutuando no fundo
  (function deco() {
    const box = document.getElementById('deco');
    const cols = ['#FF8A1A', '#FF5FA2', '#8A4FD8', '#2FB24A', '#2F6FE0', '#FFD43B', '#E8392F', '#9EDCFF'];
    let html = '';
    for (let i = 0; i < 16; i++) {
      const s = 18 + Math.random() * 34;
      html += `<span style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${s}px;height:${s}px;background:${cols[i % cols.length]};--t:${6 + Math.random() * 6}s;--r0:${Math.random() * 40 - 20}deg;--r1:${Math.random() * 60 - 30}deg;animation-delay:-${Math.random() * 6}s"></span>`;
    }
    box.innerHTML = html;
  })();

  /* ================= avisos e janelas ================= */
  let toastTimer = null;
  function toast(text, color) {
    clearTimeout(toastTimer);
    toastRoot.innerHTML = `<div class="toast">${mascot(color || '#8A4FD8', 'jump')}<span>${esc(text)}</span></div>`;
    toastTimer = setTimeout(() => {
      const t = toastRoot.firstElementChild; if (!t) return;
      t.classList.add('out'); setTimeout(() => { toastRoot.innerHTML = ''; }, 320);
    }, 2200);
  }
  function openModal(html, onMount) {
    modalRoot.innerHTML = `<div class="modal-back" role="dialog" aria-modal="true"><div class="modal">${html}</div></div>`;
    const back = modalRoot.firstElementChild;
    back.addEventListener('click', (e) => { if (e.target === back) closeModal(); });
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    back._off = () => document.removeEventListener('keydown', onKey);
    if (onMount) onMount(back.firstElementChild);
    const f = back.querySelector('input, button'); if (f) f.focus();
  }
  function closeModal() {
    const back = modalRoot.firstElementChild;
    if (back && back._off) back._off();
    modalRoot.innerHTML = '';
  }

  /* ================= confete ================= */
  const confCanvas = document.getElementById('confetti');
  let confAnim = null;
  function confetti(ms) {
    const c = confCanvas, g = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = ['#FF8A1A', '#FF5FA2', '#8A4FD8', '#2FB24A', '#2F6FE0', '#FFD43B', '#E8392F'];
    const parts = [];
    for (let i = 0; i < 160; i++) {
      parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .6, s: 8 + Math.random() * 10,
        vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[i % cols.length] });
    }
    const end = performance.now() + (ms || 3500);
    cancelAnimationFrame(confAnim);
    (function frame(t) {
      g.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += 0.03;
        if (t < end && p.y > innerHeight + 20) { p.y = -20; p.x = Math.random() * innerWidth; p.vy = 2 + Math.random() * 3; }
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
        g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .8); g.restore();
      });
      if (t < end + 3000) confAnim = requestAnimationFrame(frame); else g.clearRect(0, 0, innerWidth, innerHeight);
    })(performance.now());
  }
  function stopConfetti() { cancelAnimationFrame(confAnim); confCanvas.getContext('2d').clearRect(0, 0, confCanvas.width, confCanvas.height); }

  /* ================= roteador ================= */
  let cleanup = null;
  let teacherOK = false;
  function render() {
    if (cleanup) { try { cleanup(); } catch (e) { /* ignora */ } cleanup = null; }
    closeModal();
    stopConfetti();
    clearTimeout(toastTimer); toastRoot.innerHTML = '';
    if (window.speechSynthesis) speechSynthesis.cancel();
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const [route, arg] = parts;
    const n = parseInt(arg, 10);
    window.scrollTo(0, 0);
    if (route === 'mapa') return screenMap();
    if (route === 'mundo' && n >= 1 && n <= WORLDS.length) return screenWorld(n);
    if (route === 'missao' && n >= 1 && n <= TOTAL) {
      if (!isUnlocked(n) && !teacherOK) return go('#/mundo/' + MISSIONS[n - 1].world);
      return screenGame(n);
    }
    if (route === 'concluida' && n >= 1 && n <= TOTAL && isDone(n)) return screenDone(n);
    if (route === 'galeria') return screenGallery();
    if (route === 'professor') { if (teacherOK) return screenTeacher(); go('#/'); return teacherGate(); }
    return screenHome();
  }
  window.addEventListener('hashchange', render);
  // primeiro toque libera o som do navegador
  document.addEventListener('pointerdown', () => Sfx.unlock(), { once: true });
  // som de clique nos botões
  document.addEventListener('click', (e) => { if (e.target.closest('.btn, .icon-btn, .world, .mission, .g-item.known')) Sfx.click(); });

  /* ================= 1. TELA INICIAL ================= */
  function screenHome() {
    const done = totalDone();
    const letters = 'MOSAICO'.split('');
    const tileCols = ['#E8392F', '#FF8A1A', '#FFD43B', '#2FB24A', '#2F6FE0', '#8A4FD8', '#FF5FA2'];
    app.innerHTML = `
      <section class="screen home kid">
        <button class="teacher-link" id="btnTeacher" aria-label="Menu do professor">🎓 MENU DO PROFESSOR</button>
        <h1 class="logo" aria-label="Mosaico Secreto">
          <span class="logo-tiles">${letters.map((l, i) => `<span style="background:${tileCols[i]};animation-delay:${i * .15}s">${l}</span>`).join('')}</span>
          <span class="logo-ribbon">SECRETO</span>
        </h1>
        <p class="subtitle">O DESAFIO DAS LETRAS E CORES!</p>
        <div class="home-stage">
          ${mascot('#2F6FE0')}
          <div class="demo-board" id="demo" aria-hidden="true"></div>
          ${mascot('#FF5FA2')}
        </div>
        <div class="home-buttons">
          <button class="btn btn-big btn-green" id="btnPlay"><span class="ico">▶</span> JOGAR</button>
          <button class="btn btn-purple" id="btnGallery"><span class="ico">🖼️</span> MINHAS DESCOBERTAS</button>
        </div>
        <p class="home-progress">⭐ ${done} DE ${TOTAL} DESENHOS DESCOBERTOS</p>
      </section>`;
    document.getElementById('btnPlay').onclick = () => go('#/mapa');
    document.getElementById('btnGallery').onclick = () => go('#/galeria');
    document.getElementById('btnTeacher').onclick = teacherGate;
    cleanup = demoMosaic(document.getElementById('demo'));
  }

  // Mosaico de demonstração que se pinta sozinho (coração)
  function demoMosaic(box) {
    const N = 8;
    const heart = { bg: 'celeste', layers: [
      ['c', 'vermelho', 32, 38, 19], ['c', 'vermelho', 68, 38, 19], ['p', 'vermelho', [14, 46, 86, 46, 50, 90]],
      ['px', 'branco', 28, 32]
    ] };
    const grid = rasterize(heart, N);
    const L = { celeste: 'A', vermelho: 'B', branco: 'C' };
    box.innerHTML = grid.map((c) => `<i style="--c:${COLORS[c].hex}">${L[c]}</i>`).join('');
    const cells = Array.from(box.children);
    let order = [], k = 0, timer;
    function reset() { cells.forEach((c) => c.classList.remove('on')); order = cells.map((_, i) => i).sort(() => Math.random() - .5); k = 0; }
    function step() {
      if (k < order.length) { cells[order[k++]].classList.add('on'); timer = setTimeout(step, 110); }
      else timer = setTimeout(() => { reset(); step(); }, 2600);
    }
    reset(); timer = setTimeout(step, 600);
    return () => clearTimeout(timer);
  }

  /* ================= 2. MAPA DOS MUNDOS ================= */
  function screenMap() {
    app.innerHTML = `
      <section class="screen kid">
        <header class="topbar">
          <button class="icon-btn" id="back" aria-label="Voltar para o início">🏠</button>
          <h1>MAPA DOS MUNDOS</h1>
          <button class="icon-btn" id="gal" aria-label="Minhas descobertas">🖼️</button>
        </header>
        <div class="map-wrap" id="mapWrap">
          <svg class="map-path" id="mapPath" aria-hidden="true"><path d=""/></svg>
          <div class="worlds">
            ${WORLDS.map((w) => {
              const done = worldDone(w.id), un = worldUnlocked(w.id);
              return `<button class="world ${un ? '' : 'locked'} ${done === 10 ? 'complete' : ''}" data-w="${w.id}" style="${worldVars(w)}"
                aria-label="Mundo ${w.id}: ${w.name}. ${un ? done + ' de 10 missões concluídas' : 'bloqueado'}">
                <span class="wnum">MUNDO ${w.id}</span>
                <span class="wicon">${w.icon}</span>
                <span class="wname">${w.name}</span>
                <span class="wstars">${'★'.repeat(w.stars)}${'☆'.repeat(5 - w.stars)}</span>
                <span class="wprog"><span style="width:${done * 10}%"></span></span>
                <span class="wcount">${un ? done + ' / 10' : '🔒'}</span>
              </button>`;
            }).join('')}
          </div>
          <div class="map-guide">${mascot('#FF8A1A')}<div class="bubble" id="guide">${guideText()}</div></div>
        </div>
      </section>`;
    document.getElementById('back').onclick = () => go('#/');
    document.getElementById('gal').onclick = () => go('#/galeria');
    app.querySelectorAll('.world').forEach((b) => {
      b.onclick = () => {
        const w = +b.dataset.w;
        if (!worldUnlocked(w)) {
          Sfx.locked();
          toast('TERMINE O MUNDO ' + (w - 1) + ' PRIMEIRO!', '#9BA5B3');
          Sfx.speak('Este mundo ainda está trancado. Termine o mundo ' + (w - 1) + ' primeiro!');
          return;
        }
        go('#/mundo/' + w);
      };
    });
    const draw = () => drawMapPath();
    requestAnimationFrame(draw);
    window.addEventListener('resize', draw);
    cleanup = () => window.removeEventListener('resize', draw);
  }
  function guideText() {
    const d = totalDone();
    if (d === 0) return 'OLÁ! ESCOLHA O MUNDO 1 PARA COMEÇAR A AVENTURA!';
    if (d === TOTAL) return 'UAU! VOCÊ DESCOBRIU TODOS OS 50 DESENHOS!';
    return 'VOCÊ JÁ DESCOBRIU ' + d + ' DESENHOS! VAMOS CONTINUAR?';
  }
  function drawMapPath() {
    const wrap = document.getElementById('mapWrap'), svg = document.getElementById('mapPath');
    if (!wrap || !svg) return;
    const r0 = wrap.getBoundingClientRect();
    const pts = Array.from(wrap.querySelectorAll('.world .wicon')).map((el) => {
      const r = el.getBoundingClientRect();
      return [r.left - r0.left + r.width / 2, r.top - r0.top + r.height / 2];
    });
    let d = '';
    pts.forEach((p, i) => {
      if (!i) { d = `M${p[0]},${p[1]}`; return; }
      const q = pts[i - 1], mx = (q[0] + p[0]) / 2, my = (q[1] + p[1]) / 2;
      d += ` Q${q[0] + (p[1] - q[1]) * .2 + (mx - q[0])},${my - 40} ${p[0]},${p[1]}`;
    });
    svg.setAttribute('viewBox', `0 0 ${r0.width} ${r0.height}`);
    svg.firstElementChild.setAttribute('d', d);
  }

  /* ================= 3. SELEÇÃO DAS MISSÕES ================= */
  function screenWorld(wid) {
    const w = W(wid);
    if (!worldUnlocked(wid)) return go('#/mapa');
    const list = MISSIONS.filter((m) => m.world === wid);
    const next = nextPlayable();
    app.innerHTML = `
      <section class="screen kid" style="${worldVars(w)}">
        <header class="topbar">
          <button class="icon-btn" id="back" aria-label="Voltar para o mapa">🗺️</button>
          <h1>ESCOLHA UMA MISSÃO</h1>
          <button class="icon-btn" id="home" aria-label="Início">🏠</button>
        </header>
        <div class="world-banner">
          <span class="wicon">${w.icon}</span>
          <div>
            <h2>MUNDO ${w.id} — ${w.name}</h2>
            <p><span class="wstars">${'★'.repeat(w.stars)}${'☆'.repeat(5 - w.stars)}</span> ${w.level} · GRADE ${w.size} × ${w.size} · ${w.size * w.size} QUADRADINHOS</p>
          </div>
        </div>
        <div class="missions">
          ${list.map((m) => {
            const done = isDone(m.id), un = isUnlocked(m.id), part = !done && S.partial[m.id];
            const cls = done ? 'done' : un ? (m.id === next ? 'current' : '') : 'locked';
            const state = done ? '✔ DESCOBERTO!' : un ? (part ? 'CONTINUAR' : 'JOGAR') : 'TRANCADA';
            return `<button class="mission ${cls}" data-id="${m.id}" aria-label="Missão ${m.id}${done ? ': ' + m.name : ''}. ${state}">
              <span class="mnum">${pad(m.id)}</span>
              ${done ? '<span class="check">✓</span>' : ''}
              <span class="mart">${done || part ? '<canvas></canvas>' : un ? '<span class="q">?</span>' : '<span class="lock">🔒</span>'}</span>
              <span class="mlabel">${done ? m.name : 'MISSÃO ' + pad(m.id)}</span>
              <span class="mstate">${state}</span>
            </button>`;
          }).join('')}
        </div>
        <nav class="world-nav">
          ${wid > 1 ? `<button class="btn btn-white btn-small" id="prevW">◀ MUNDO ${wid - 1}</button>` : '<span></span>'}
          ${wid < WORLDS.length ? `<button class="btn btn-white btn-small" id="nextW">MUNDO ${wid + 1} ▶</button>` : ''}
        </nav>
      </section>`;
    app.querySelectorAll('.mission').forEach((b) => {
      const id = +b.dataset.id;
      const cv = b.querySelector('canvas');
      if (cv) drawThumb(cv, id, { width: 160, painted: isDone(id) ? null : partialSet(id) });
      b.onclick = () => {
        if (!isUnlocked(id)) { Sfx.locked(); toast('TERMINE A MISSÃO ' + pad(id - 1) + ' PRIMEIRO!', '#9BA5B3'); return; }
        go('#/missao/' + id);
      };
    });
    document.getElementById('back').onclick = () => go('#/mapa');
    document.getElementById('home').onclick = () => go('#/');
    const p = document.getElementById('prevW'), n = document.getElementById('nextW');
    if (p) p.onclick = () => go('#/mundo/' + (wid - 1));
    if (n) n.onclick = () => {
      if (!worldUnlocked(wid + 1)) { Sfx.locked(); toast('TERMINE ESTE MUNDO PRIMEIRO!', '#9BA5B3'); return; }
      go('#/mundo/' + (wid + 1));
    };
  }

  /* ================= 4. EXECUÇÃO DO MOSAICO ================= */
  function screenGame(id) {
    const m = build(id), w = W(m.world), N = m.size;
    const painted = isDone(id) ? new Set() : partialSet(id);
    if (isDone(id)) delete S.partial[id];
    const left = {};
    m.legend.forEach((l) => { left[l.letter] = l.total; });
    painted.forEach((i) => { left[m.cells[i].letter]--; });
    const legendIndex = {};
    m.legend.forEach((l, i) => { legendIndex[l.letter] = i; });
    const t0 = Date.now() - ((S.partial[id + '_t']) || 0);

    app.innerHTML = `
      <section class="screen game kid ${S.settings.names ? '' : 'hide-names'}" style="${worldVars(w)}">
        <header class="game-top">
          <button class="icon-btn" id="back" aria-label="Voltar para as missões">◀</button>
          <div class="mission-tag">MISSÃO ${pad(id)}</div>
          <div class="progress" aria-label="Progresso"><div class="bar"><span id="bar"></span></div><b id="pct">0%</b></div>
          <button class="icon-btn" id="find" aria-label="Onde falta pintar?">🔍</button>
          <button class="icon-btn ${S.settings.sound ? '' : 'off'}" id="snd" aria-label="Ligar ou desligar o som">${S.settings.sound ? SVG_SOUND_ON : SVG_SOUND_OFF}</button>
        </header>
        <div class="legend" id="legend" aria-label="Legenda: cada letra tem a sua cor">
          ${m.legend.map((l) => `
            <button class="chip" data-letter="${l.letter}" style="--c:${l.hex}" aria-label="Letra ${l.letter}: ${l.name}">
              <span class="pair"><span class="let">${l.letter}</span><span class="eq">=</span><span class="sw"></span></span>
              <span class="cname">${l.name}</span><span class="left">${left[l.letter]}</span>
            </button>`).join('')}
        </div>
        <div class="board-wrap" id="wrap">
          <div class="board ${N >= 14 ? 'small' : ''} ${S.settings.drag ? '' : 'pan'}" id="board" style="--n:${N}" tabindex="0" role="grid"
            aria-label="Mosaico com ${N * N} quadradinhos. Use as setas e a tecla Enter para pintar.">
            ${m.cells.map((c, i) => painted.has(i)
              ? `<div class="cell painted" data-i="${i}" style="--c:${c.hex}">${c.letter}</div>`
              : `<div class="cell" data-i="${i}" style="--c:${c.hex}">${c.letter}</div>`).join('')}
          </div>
        </div>
        <div class="zoom">
          <button class="icon-btn" id="zin" aria-label="Aumentar">+</button>
          <button class="icon-btn" id="zout" aria-label="Diminuir">−</button>
        </div>
      </section>`;

    const board = document.getElementById('board'), wrap = document.getElementById('wrap');
    const cells = Array.from(board.children);
    const chips = {};
    app.querySelectorAll('.chip').forEach((c) => { chips[c.dataset.letter] = c; });
    let zoom = 1, finished = false, saveTimer = null, milestone = Math.floor(painted.size / m.total * 4);

    function fit() {
      const pad2 = 22, gap = 3;
      const avail = Math.min(wrap.clientWidth, wrap.clientHeight) - pad2 - 6;
      let size = Math.floor((avail - gap * (N - 1)) / N);
      size = Math.max(16, Math.min(size, 64));
      board.style.setProperty('--cell', Math.round(size * zoom) + 'px');
    }
    function updateChip(letter) {
      const c = chips[letter]; if (!c) return;
      c.querySelector('.left').textContent = left[letter] > 0 ? left[letter] : '✓';
      c.classList.toggle('complete', left[letter] <= 0);
    }
    function updateProgress() {
      const p = Math.round(painted.size / m.total * 100);
      document.getElementById('bar').style.width = p + '%';
      document.getElementById('pct').textContent = p + '%';
    }
    m.legend.forEach((l) => updateChip(l.letter));
    updateProgress();

    function persist() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        if (finished) return;
        let bits = '';
        for (let i = 0; i < m.total; i++) bits += painted.has(i) ? '1' : '0';
        S.partial[id] = bits; S.partial[id + '_t'] = Date.now() - t0;
        save();
      }, 300);
    }

    function paint(i) {
      if (finished || painted.has(i)) return;
      const cell = m.cells[i], el = cells[i];
      painted.add(i);
      el.classList.add('painted'); el.classList.remove('hint');
      left[cell.letter]--;
      updateChip(cell.letter); updateProgress();
      Sfx.pop(legendIndex[cell.letter]);
      if (S.settings.voiceCell) Sfx.speak(cell.letter);
      if (left[cell.letter] === 0) {
        const ch = chips[cell.letter];
        ch.classList.remove('pop'); void ch.offsetWidth; ch.classList.add('pop');
        setTimeout(() => Sfx.chime(), 120);
      }
      const ms = Math.floor(painted.size / m.total * 4);
      if (ms > milestone && painted.size < m.total) {
        milestone = ms;
        const msg = ['', 'MUITO BEM!', 'METADE! CONTINUE!', 'QUASE LÁ!'][ms];
        if (msg) { toast(msg, w.deep); Sfx.speak(msg.toLowerCase()); }
      }
      if (painted.size === m.total) finish();
      else persist();
    }

    function finish() {
      finished = true;
      clearTimeout(saveTimer);
      const ms = Date.now() - t0;
      delete S.partial[id]; delete S.partial[id + '_t'];
      const firstTime = !isDone(id);
      const prev = S.done[id];
      S.done[id] = { date: new Date().toISOString().slice(0, 10), ms: ms, times: (prev && prev.times || 0) + 1, first: firstTime };
      save();
      board.classList.add('done');
      Sfx.fanfare();
      confetti(2500);
      setTimeout(() => go('#/concluida/' + id), 1700);
    }

    /* toque, mouse e arrastar */
    let down = false;
    const cellAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      return el && el.classList && el.classList.contains('cell') && board.contains(el) ? +el.dataset.i : -1;
    };
    function onDown(e) {
      const i = cellAt(e.clientX, e.clientY);
      if (i < 0) return;
      down = true;
      paint(i);
      if (S.settings.drag && board.setPointerCapture) { try { board.setPointerCapture(e.pointerId); } catch (er) { /* ignora */ } }
    }
    function onMove(e) {
      if (!down || !S.settings.drag) return;
      const i = cellAt(e.clientX, e.clientY);
      if (i >= 0) paint(i);
    }
    const onUp = () => { down = false; };
    board.addEventListener('pointerdown', onDown);
    board.addEventListener('pointermove', onMove);
    board.addEventListener('pointerup', onUp);
    board.addEventListener('pointercancel', onUp);
    board.addEventListener('contextmenu', (e) => e.preventDefault());

    /* teclado: setas + Enter/Espaço */
    let cur = 0;
    board.addEventListener('keydown', (e) => {
      const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: N, ArrowUp: -N };
      if (moves[e.key] !== undefined) {
        e.preventDefault();
        cells[cur].classList.remove('kbd');
        const nx = cur + moves[e.key];
        if (nx >= 0 && nx < m.total && !(Math.abs(moves[e.key]) === 1 && Math.floor(nx / N) !== Math.floor(cur / N))) cur = nx;
        cells[cur].classList.add('kbd');
        cells[cur].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); cells[cur].classList.add('kbd'); paint(cur);
      }
    });
    board.addEventListener('focus', () => { if (board.matches(':focus-visible')) cells[cur].classList.add('kbd'); });
    board.addEventListener('blur', () => cells[cur].classList.remove('kbd'));

    /* legenda: mostra onde está a letra */
    function hint(letter) {
      const hex = m.legend[legendIndex[letter]].hex;
      cells.forEach((c, i) => {
        c.classList.remove('hint');
        if (!painted.has(i) && (!letter || m.cells[i].letter === letter)) {
          c.style.setProperty('--hc', letter ? hex : '#FF5FA2');
          void c.offsetWidth; c.classList.add('hint');
        }
      });
      setTimeout(() => cells.forEach((c) => c.classList.remove('hint')), 2900);
    }
    app.querySelectorAll('.chip').forEach((c) => {
      c.onclick = () => {
        const l = m.legend[legendIndex[c.dataset.letter]];
        Sfx.speak('Letra ' + l.letter + ': ' + l.name.toLowerCase().replace('-', ' '));
        if (left[l.letter] > 0) hint(l.letter);
        else toast('A LETRA ' + l.letter + ' JÁ ESTÁ TODA PINTADA!', l.hex);
      };
    });
    document.getElementById('find').onclick = () => {
      const rest = m.total - painted.size;
      if (!rest) return;
      cells.forEach((c, i) => {
        c.classList.remove('hint');
        if (!painted.has(i)) { c.style.setProperty('--hc', '#FF5FA2'); void c.offsetWidth; c.classList.add('hint'); }
      });
      setTimeout(() => cells.forEach((c) => c.classList.remove('hint')), 2900);
      const txt = rest === 1 ? 'FALTA 1 QUADRADINHO!' : 'FALTAM ' + rest + ' QUADRADINHOS!';
      toast(txt, w.deep); Sfx.speak(txt.toLowerCase());
    };
    document.getElementById('snd').onclick = (e) => {
      S.settings.sound = !S.settings.sound; S.settings.voice = S.settings.sound; save(); applySettings();
      const b = e.currentTarget; b.classList.toggle('off', !S.settings.sound);
      b.innerHTML = S.settings.sound ? SVG_SOUND_ON : SVG_SOUND_OFF;
    };
    document.getElementById('back').onclick = () => { persistNow(); go('#/mundo/' + m.world); };
    document.getElementById('zin').onclick = () => { zoom = Math.min(2.5, zoom + .25); fit(); };
    document.getElementById('zout').onclick = () => { zoom = Math.max(.5, zoom - .25); fit(); };
    function persistNow() {
      if (finished || !painted.size) return;
      clearTimeout(saveTimer);
      let bits = '';
      for (let i = 0; i < m.total; i++) bits += painted.has(i) ? '1' : '0';
      S.partial[id] = bits; S.partial[id + '_t'] = Date.now() - t0; save();
    }

    fit();
    window.addEventListener('resize', fit);
    cleanup = () => { window.removeEventListener('resize', fit); persistNow(); };
    if (!painted.size) {
      setTimeout(() => Sfx.speak('Toque nos quadradinhos e descubra o desenho secreto!'), 400);
    }
  }

  /* ================= 5. MISSÃO CONCLUÍDA ================= */
  function screenDone(id) {
    const m = build(id), mi = MISSIONS[id - 1], w = W(m.world), rec = S.done[id] || {};
    const next = id < TOTAL ? id + 1 : null;
    const worldComplete = worldDone(m.world) === 10 && m.index === 9;
    const all = totalDone() === TOTAL && id === TOTAL;
    const mins = Math.max(1, Math.round((rec.ms || 0) / 60000));
    app.innerHTML = `
      <section class="screen done-screen kid" style="${worldVars(w)}">
        <h2 class="done-title">MISSÃO CONCLUÍDA!</h2>
        <div class="reveal">
          ${mascot('#2F6FE0', 'jump')}
          <div class="reveal-card"><canvas id="big"></canvas></div>
          ${mascot('#FF5FA2', 'jump')}
        </div>
        <p class="found">VOCÊ DESCOBRIU: <b>${esc(withArticle(mi))}</b>!</p>
        <div class="stars" aria-label="Três estrelas"><span>⭐</span><span>⭐</span><span>⭐</span></div>
        <div class="done-stats">
          <span>🟪 ${m.total} QUADRADINHOS PINTADOS</span>
          <span>🎨 ${m.legend.length} CORES</span>
          <span>⏱️ ${mins} MIN</span>
        </div>
        ${all ? '<div class="special">🏆 VOCÊ COMPLETOU AS 50 MISSÕES! 🏆</div>'
          : worldComplete ? `<div class="special">🏆 MUNDO ${w.id} COMPLETO! ${m.world < 5 ? 'O MUNDO ' + (m.world + 1) + ' ESTÁ ABERTO!' : ''}</div>` : ''}
        <div class="done-buttons">
          ${next ? '<button class="btn btn-big btn-green" id="next">PRÓXIMA ▶</button>' : ''}
          <button class="btn btn-blue" id="again">🔁 JOGAR DE NOVO</button>
          <button class="btn btn-purple" id="gal">🖼️ MINHAS DESCOBERTAS</button>
          <button class="btn btn-white" id="map">🗺️ MAPA</button>
        </div>
      </section>`;
    drawThumb(document.getElementById('big'), id, { px: Math.ceil(360 / m.size) });
    confetti(3500);
    Sfx.cheer();
    setTimeout(() => Sfx.speak('Parabéns! Você descobriu ' + withArticle(mi).toLowerCase() + '!'), 600);
    const nb = document.getElementById('next');
    if (nb) nb.onclick = () => go(MISSIONS[next - 1].world !== m.world ? '#/mundo/' + MISSIONS[next - 1].world : '#/missao/' + next);
    document.getElementById('again').onclick = () => go('#/missao/' + id);
    document.getElementById('gal').onclick = () => go('#/galeria');
    document.getElementById('map').onclick = () => go('#/mapa');
  }

  /* ================= 6. GALERIA ================= */
  function screenGallery() {
    const d = totalDone();
    app.innerHTML = `
      <section class="screen kid">
        <header class="topbar">
          <button class="icon-btn" id="back" aria-label="Voltar para o início">🏠</button>
          <h1>MINHAS DESCOBERTAS</h1>
          <button class="icon-btn" id="map" aria-label="Mapa dos mundos">🗺️</button>
        </header>
        <div class="gallery">
          <p class="gallery-count">⭐ ${d} DE ${TOTAL} DESENHOS DESCOBERTOS
            <span class="bar" style="display:block"><span style="width:${d / TOTAL * 100}%"></span></span></p>
          ${WORLDS.map((w) => `
            <section class="g-world" style="${worldVars(w)}">
              <h3><span>${w.icon}</span> MUNDO ${w.id} — ${w.name} <small>${worldDone(w.id)} / 10</small></h3>
              <div class="g-grid">
                ${MISSIONS.filter((m) => m.world === w.id).map((m) => isDone(m.id)
                  ? `<button class="g-item known" data-id="${m.id}" aria-label="${m.name}"><canvas></canvas><span>${m.name}</span></button>`
                  : `<div class="g-item unknown" aria-label="Desenho ainda secreto"><div class="q">?</div><span>MISSÃO ${pad(m.id)}</span></div>`).join('')}
              </div>
            </section>`).join('')}
        </div>
      </section>`;
    app.querySelectorAll('.g-item.known').forEach((b) => {
      const id = +b.dataset.id;
      drawThumb(b.querySelector('canvas'), id, { width: 120 });
      b.onclick = () => showDrawing(id);
    });
    document.getElementById('back').onclick = () => go('#/');
    document.getElementById('map').onclick = () => go('#/mapa');
  }
  function showDrawing(id) {
    const mi = MISSIONS[id - 1];
    openModal(`
      <h2 class="kid">${esc(mi.name)}</h2>
      <canvas id="mBig"></canvas>
      <p class="kid" style="font-weight:600;color:#5D5A72">MISSÃO ${pad(id)} · MUNDO ${mi.world} — ${W(mi.world).name}</p>
      <div class="row kid">
        <button class="btn btn-blue btn-small" id="mSay">🔊 OUVIR</button>
        <button class="btn btn-green btn-small" id="mPlay">🔁 PINTAR DE NOVO</button>
        <button class="btn btn-white btn-small" id="mClose">FECHAR</button>
      </div>`, () => {
      drawThumb(document.getElementById('mBig'), id, { px: Math.ceil(380 / mi.size) });
      document.getElementById('mSay').onclick = () => Sfx.speak(withArticle(mi).toLowerCase());
      document.getElementById('mPlay').onclick = () => { closeModal(); go('#/missao/' + id); };
      document.getElementById('mClose').onclick = closeModal;
    });
    Sfx.speak(withArticle(mi).toLowerCase());
  }

  /* ================= 7. MENU DO PROFESSOR ================= */
  function teacherGate() {
    const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
    openModal(`
      <div class="gate">
        <h2>🎓 Menu do Professor</h2>
        <p>Área para adultos. Para entrar, responda:</p>
        <div class="q">${a} × ${b} = ?</div>
        <input id="gIn" inputmode="numeric" autocomplete="off" aria-label="Resposta">
        <div class="err" id="gErr"></div>
        <div class="row">
          <button class="btn btn-green btn-small" id="gOk">Entrar</button>
          <button class="btn btn-white btn-small" id="gNo">Cancelar</button>
        </div>
      </div>`, () => {
      const inp = document.getElementById('gIn');
      const ok = () => {
        if (parseInt(inp.value, 10) === a * b) { teacherOK = true; closeModal(); go('#/professor'); }
        else { document.getElementById('gErr').textContent = 'Resposta incorreta. Tente de novo.'; inp.value = ''; inp.focus(); }
      };
      document.getElementById('gOk').onclick = ok;
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
      document.getElementById('gNo').onclick = closeModal;
    });
  }

  function screenTeacher() {
    const opts = [
      ['sound', 'Sons do jogo', 'Efeitos sonoros ao pintar e ao concluir.'],
      ['voice', 'Voz do jogo', 'Lê a letra e a cor ao tocar na legenda, e o nome do desenho no final.'],
      ['voiceCell', 'Falar a letra a cada quadradinho', 'Reforça o nome da letra a cada toque (indicado para quem está começando).'],
      ['drag', 'Pintar arrastando o dedo', 'Desligado: cada quadradinho precisa de um toque separado (mais treino de coordenação motora fina).'],
      ['names', 'Mostrar o nome das cores na legenda', 'Desligado: a legenda mostra só a letra e a cor.']
    ];
    app.innerHTML = `
      <section class="screen">
        <header class="topbar">
          <button class="icon-btn" id="back" aria-label="Voltar para o início">🏠</button>
          <h1>🎓 Menu do Professor</h1>
          <span style="width:60px"></span>
        </header>
        <div class="teacher">
          <div class="t-card">
            <h2>📊 Progresso neste navegador</h2>
            <div class="t-stats">
              ${WORLDS.map((w) => `<div><b>${worldDone(w.id)}/10</b>Mundo ${w.id}</div>`).join('')}
            </div>
            <p><b>${totalDone()} de ${TOTAL}</b> missões concluídas. O progresso fica salvo somente neste navegador (não há login nem envio de dados).</p>
            <div class="t-actions">
              <button class="btn btn-small ${S.unlockAll ? 'btn-white' : 'btn-green'}" id="tUnlock">${S.unlockAll ? '🔒 Voltar a liberar em ordem' : '🔓 Liberar todas as missões'}</button>
              <button class="btn btn-small btn-pink" id="tReset">🗑️ Reiniciar progresso</button>
            </div>
          </div>

          <div class="t-grid2">
            <div class="t-card">
              <h2>⚙️ Configurações</h2>
              ${opts.map((o) => `
                <label class="toggle-row"><span>${o[1]}<small>${o[2]}</small></span>
                  <span class="switch"><input type="checkbox" data-opt="${o[0]}" ${S.settings[o[0]] ? 'checked' : ''}><i></i></span></label>`).join('')}
            </div>
            <div class="t-card">
              <h2>🖨️ Atividades para imprimir</h2>
              <p>Imprima o mosaico para as crianças pintarem com lápis de cor, ou o gabarito colorido.</p>
              <select class="t-select" id="tSel" aria-label="Escolha a missão">
                ${MISSIONS.map((m) => `<option value="${m.id}">Missão ${pad(m.id)} — ${m.name} (${m.size}×${m.size})</option>`).join('')}
              </select>
              <div class="t-actions">
                <button class="btn btn-small btn-blue" id="tPrint">🖨️ Imprimir atividade</button>
                <button class="btn btn-small btn-white" id="tKey">🎨 Imprimir gabarito</button>
              </div>
              <p style="margin-top:14px">Ou imprima um mundo inteiro (10 folhas):</p>
              <div class="t-actions">
                ${WORLDS.map((w) => `<button class="btn btn-small btn-white" data-printw="${w.id}">${w.icon} Mundo ${w.id}</button>`).join('')}
              </div>
            </div>
          </div>

          <div class="t-card">
            <h2>📚 Orientações pedagógicas</h2>
            <p><b>Público:</b> 1º ano do Ensino Fundamental (6 e 7 anos), aulas de Educação Digital.</p>
            <p><b>Objetivos:</b></p>
            <ul>
              <li>Reconhecer e identificar as letras do alfabeto (sempre em CAIXA ALTA).</li>
              <li>Associar letras e cores, consultando a legenda.</li>
              <li>Desenvolver atenção, concentração e discriminação visual.</li>
              <li>Exercitar a coordenação motora fina (toque preciso em alvos pequenos) e a percepção espacial.</li>
              <li>Persistir até concluir um desafio e reconhecer imagens e formas.</li>
            </ul>
            <p><b>Como funciona:</b> cada quadradinho mostra uma letra. A legenda no alto diz a cor de cada letra. Ao tocar no quadradinho, ele é pintado automaticamente com a cor da sua letra — não é preciso escolher pincel nem cor. Quando todos estão pintados, aparece o desenho secreto.</p>
            <p><b>Progressão:</b></p>
            <ul>
              ${WORLDS.map((w) => `<li>Mundo ${w.id} — ${w.name}: grade ${w.size}×${w.size} (${w.size * w.size} quadradinhos), ${w.level.toLowerCase()}.</li>`).join('')}
            </ul>
            <p><b>Sugestão de aula (30 a 40 min):</b></p>
            <ol>
              <li>Mostre a tela do jogo no projetor e leia a legenda com a turma: “A letra A é VERMELHO”.</li>
              <li>Pinte alguns quadradinhos juntos, pedindo que as crianças digam a letra antes do toque.</li>
              <li>Deixe as crianças jogarem em duplas, alternando quem toca.</li>
              <li>Antes de terminar, pergunte: “O que vocês acham que é o desenho?”.</li>
              <li>Ao final, visitem a galeria “Minhas descobertas” e conversem sobre os desenhos.</li>
            </ol>
            <p><b>Dicas:</b> tocar em uma cor da legenda faz piscar os quadradinhos daquela letra e a voz diz a letra e a cor. A lupa 🔍 mostra onde ainda falta pintar. Os botões + e − aumentam ou diminuem a grade. Também dá para jogar com o teclado (setas e Enter).</p>
            <p><b>Privacidade:</b> o jogo não tem cadastro, não pede nome e não envia nenhuma informação para a internet.</p>
          </div>

          <div class="t-card">
            <h2>🗝️ Gabarito: as 50 imagens</h2>
            <div class="key-grid" id="keyGrid">
              ${MISSIONS.map((m) => {
                const b = build(m.id);
                return `<div class="key-item"><canvas data-id="${m.id}"></canvas>
                  <b>${pad(m.id)}. ${m.name}</b>
                  <span class="mini">${b.size}×${b.size} · ${b.legend.length} cores · ${b.legend.map((l) => l.letter).join(' ')}</span>
                  <div class="acts"><button data-play="${m.id}">▶ Jogar</button><button data-print="${m.id}">🖨️ Imprimir</button></div></div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </section>`;

    app.querySelectorAll('#keyGrid canvas').forEach((c) => drawThumb(c, +c.dataset.id, { width: 140 }));
    document.getElementById('back').onclick = () => go('#/');
    app.querySelectorAll('[data-opt]').forEach((inp) => {
      inp.onchange = () => { S.settings[inp.dataset.opt] = inp.checked; save(); applySettings(); };
    });
    document.getElementById('tUnlock').onclick = () => { S.unlockAll = !S.unlockAll; save(); screenTeacher(); };
    document.getElementById('tReset').onclick = () => {
      openModal(`<h2>Reiniciar progresso?</h2><p>Todas as missões concluídas e os desenhos da galeria deste navegador serão apagados. As configurações são mantidas.</p>
        <div class="row"><button class="btn btn-pink btn-small" id="rYes">Sim, apagar</button><button class="btn btn-white btn-small" id="rNo">Cancelar</button></div>`, () => {
        document.getElementById('rYes').onclick = () => { S.done = {}; S.partial = {}; S.unlockAll = false; save(); closeModal(); screenTeacher(); toast('PROGRESSO REINICIADO', '#FF5FA2'); };
        document.getElementById('rNo').onclick = closeModal;
      });
    };
    const sel = document.getElementById('tSel');
    document.getElementById('tPrint').onclick = () => printSheets([+sel.value], false);
    document.getElementById('tKey').onclick = () => printSheets([+sel.value], true);
    app.querySelectorAll('[data-printw]').forEach((b) => {
      b.onclick = () => printSheets(MISSIONS.filter((m) => m.world === +b.dataset.printw).map((m) => m.id), false);
    });
    app.querySelectorAll('[data-play]').forEach((b) => { b.onclick = () => go('#/missao/' + b.dataset.play); });
    app.querySelectorAll('[data-print]').forEach((b) => { b.onclick = () => printSheets([+b.dataset.print], false); });
  }

  /* ---------- impressão ---------- */
  function printSheets(ids, colored) {
    const area = document.getElementById('print-area');
    area.innerHTML = ids.map((id) => {
      const m = build(id), N = m.size;
      const cellMm = Math.min(16, Math.floor(180 / N * 10) / 10);
      const font = (cellMm * 0.55 * 2.83).toFixed(1); // mm → pt
      let rows = '';
      for (let r = 0; r < N; r++) {
        rows += '<tr>';
        for (let c = 0; c < N; c++) {
          const cell = m.cells[r * N + c];
          rows += colored
            ? `<td style="width:${cellMm}mm;height:${cellMm}mm;background:${cell.hex}"></td>`
            : `<td style="width:${cellMm}mm;height:${cellMm}mm;font-size:${font}pt">${cell.letter}</td>`;
        }
        rows += '</tr>';
      }
      return `<section class="sheet">
        <h1>MOSAICO SECRETO — MISSÃO ${pad(id)}${colored ? ' — GABARITO: ' + esc(m.name) : ''}</h1>
        ${colored ? '' : '<div class="who"><span>NOME: ______________________________</span><span>DATA: ____/____/______</span></div>'}
        <p class="ins">${colored ? 'IMAGEM SECRETA' : 'PINTE CADA QUADRADINHO COM A COR DA SUA LETRA E DESCUBRA O DESENHO SECRETO!'}</p>
        <div class="leg">${m.legend.map((l) => `<span>${l.letter} = <i style="background:${l.hex}"></i> ${l.name}</span>`).join('')}</div>
        <table>${rows}</table>
      </section>`;
    }).join('');
    setTimeout(() => { window.print(); }, 60);
  }
  window.addEventListener('afterprint', () => { document.getElementById('print-area').innerHTML = ''; });

  /* ---------- iniciar ---------- */
  render();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
})();
