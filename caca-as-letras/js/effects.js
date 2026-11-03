/* =========================================================
   CAÇADORES DE LETRAS — Efeitos visuais (confetes, estrelas,
   medalhas, avisos e transições)
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const COLORS = ['#FF5A5F', '#FFD23F', '#2DBE60', '#2196F3', '#B388FF', '#FF9F1C', '#FF6FA5'];

  const reduced = () => document.body.classList.contains('reduced-motion');

  CDL.fx = {
    confetti(amount = 90) {
      const layer = document.getElementById('confetti');
      if (!layer) return;
      const n = reduced() ? Math.round(amount / 4) : amount;
      for (let i = 0; i < n; i++) {
        const c = document.createElement('i');
        c.className = 'confetto';
        c.style.left = Math.random() * 100 + '%';
        c.style.background = COLORS[i % COLORS.length];
        c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
        c.style.setProperty('--r', (Math.random() * 1080 - 540) + 'deg');
        c.style.animationDuration = 2.4 + Math.random() * 2 + 's';
        c.style.animationDelay = Math.random() * 0.8 + 's';
        if (i % 3 === 0) { c.style.borderRadius = '50%'; c.style.width = c.style.height = '12px'; }
        layer.appendChild(c);
        setTimeout(() => c.remove(), 5500);
      }
    },
    burst(x, y, n = 14) {
      const layer = document.getElementById('confetti');
      if (!layer || reduced()) return;
      for (let i = 0; i < n; i++) {
        const f = document.createElement('i');
        f.className = 'firework';
        const a = (i / n) * Math.PI * 2;
        const d = 50 + Math.random() * 40;
        f.style.left = x + 'px';
        f.style.top = y + 'px';
        f.style.background = COLORS[i % COLORS.length];
        f.style.setProperty('--dx', Math.cos(a) * d + 'px');
        f.style.setProperty('--dy', Math.sin(a) * d + 'px');
        layer.appendChild(f);
        setTimeout(() => f.remove(), 1100);
      }
    },
    toast(msg, ms = 2600) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._h);
      t._h = setTimeout(() => t.classList.remove('show'), ms);
    },
    transition(cb) {
      const el = document.getElementById('transition');
      if (!el || reduced()) { cb && cb(); return; }
      el.classList.remove('run');
      void el.offsetWidth;
      el.classList.add('run');
      setTimeout(() => cb && cb(), 420);
      setTimeout(() => el.classList.remove('run'), 950);
    }
  };

  CDL.starSVG = () => `<svg class="star" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 L62 36 L95 38 L69 59 L78 92 L50 74 L22 92 L31 59 L5 38 L38 36Z" fill="#FFD23F" stroke="#E0A100" stroke-width="5" stroke-linejoin="round"/><path d="M50 18 L58 38 L80 40" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/></svg>`;

  CDL.medalSVG = function (world) {
    const W = CDL.WORLDS[world - 1];
    const icon = world === 1
      ? CDL.place('tree', 100, 148, 0.42, { noSpot: true })
      : world === 2
        ? CDL.place('fish', 100, 118, 0.85, { color: '#FF8C42', noSpot: true })
        : CDL.place('crown', 100, 136, 1.15, { noSpot: true });
    return `<svg viewBox="0 0 200 240"><path d="M60 0 L100 70 L140 0 L170 0 L120 90 L80 90 L30 0Z" fill="${W.color}"/><path d="M60 0 L100 70 L80 90 L30 0Z" fill="#000" opacity=".15"/>
      <circle cx="100" cy="140" r="86" fill="#FFB400"/><circle cx="100" cy="140" r="72" fill="#FFD23F"/><circle cx="100" cy="140" r="62" fill="${W.color}"/>
      ${icon}<path d="M44 110 Q60 80 92 76" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".5"/></svg>`;
  };

  CDL.trophySVG = () => `<svg viewBox="0 0 200 220"><path d="M40 30 H160 V80 Q160 140 100 150 Q40 140 40 80Z" fill="#FFD23F"/><path d="M40 40 Q0 40 10 80 Q20 110 50 110" stroke="#FFB400" stroke-width="12" fill="none"/><path d="M160 40 Q200 40 190 80 Q180 110 150 110" stroke="#FFB400" stroke-width="12" fill="none"/>
    <rect x="88" y="148" width="24" height="30" fill="#FFB400"/><rect x="56" y="176" width="88" height="30" rx="8" fill="#8D5524"/><rect x="66" y="184" width="68" height="14" rx="4" fill="#FFD23F"/>
    <path d="M100 52 L108 72 L130 74 L113 88 L119 110 L100 98 L81 110 L87 88 L70 74 L92 72Z" fill="#fff"/><path d="M56 44 Q60 90 80 120" stroke="#fff" stroke-width="7" fill="none" opacity=".4" stroke-linecap="round"/></svg>`;
})();
