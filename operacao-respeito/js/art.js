/* =========================================================
   OPERAÇÃO RESPEITO — Arte vetorial própria (SVG gerado em JS)
   Personagens diversos, logotipo, ícones e ilustrações.
   Nenhuma imagem externa é necessária.
   ========================================================= */
(function () {
  'use strict';

  const SKIN = {
    s1: '#3a2118', s2: '#5a3522', s3: '#7a4a2c', s4: '#9c6540',
    s5: '#c08a5e', s6: '#dcae84', s7: '#f0cfae'
  };
  const HAIR = { black: '#17100d', dark: '#2b1a12', brown: '#5a3820', auburn: '#8a3b1e', blond: '#c9a25a', copper: '#a5552a' };

  let uid = 0;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ---------- Cabelos (atrás da cabeça) ---------- */
  function hairBack(type, c) {
    const d = shade(c, -12);
    switch (type) {
      case 'afro':
        return `<circle cx="50" cy="38" r="30" fill="${c}"/>
          <circle cx="30" cy="30" r="12" fill="${d}" opacity=".35"/><circle cx="68" cy="26" r="10" fill="${d}" opacity=".3"/>`;
      case 'puff':
        return `<circle cx="50" cy="13" r="14" fill="${c}"/><circle cx="45" cy="10" r="5" fill="${d}" opacity=".4"/>`;
      case 'twopuffs':
        return `<circle cx="27" cy="22" r="12" fill="${c}"/><circle cx="73" cy="22" r="12" fill="${c}"/>`;
      case 'braids': {
        let s = '';
        for (let i = 0; i < 6; i++) {
          const x = 27 + i * 3.4, x2 = 73 - i * 3.4;
          s += `<rect x="${x - 1.8}" y="38" width="3.6" height="${44 - i * 2}" rx="1.8" fill="${i % 2 ? d : c}"/>`;
          s += `<rect x="${x2 - 1.8}" y="38" width="3.6" height="${44 - i * 2}" rx="1.8" fill="${i % 2 ? d : c}"/>`;
        }
        return s + `<circle cx="28" cy="81" r="2" fill="#f5b83d"/><circle cx="72" cy="81" r="2" fill="#f5b83d"/>`;
      }
      case 'locs': {
        let s = '';
        for (let i = 0; i < 5; i++) {
          s += `<rect x="${26 + i * 4}" y="36" width="4.4" height="${36 - i * 3}" rx="2.2" fill="${i % 2 ? d : c}"/>`;
          s += `<rect x="${69.6 - i * 4}" y="36" width="4.4" height="${36 - i * 3}" rx="2.2" fill="${i % 2 ? d : c}"/>`;
        }
        return s;
      }
      case 'curly':
        return `<g fill="${c}">
          <circle cx="32" cy="36" r="11"/><circle cx="68" cy="36" r="11"/><circle cx="30" cy="50" r="9"/><circle cx="70" cy="50" r="9"/>
          <circle cx="33" cy="62" r="7"/><circle cx="67" cy="62" r="7"/><circle cx="40" cy="24" r="11"/><circle cx="60" cy="24" r="11"/><circle cx="50" cy="21" r="11"/></g>`;
      case 'long':
        return `<path d="M30 40 Q28 24 50 22 Q72 24 70 40 L72 76 Q60 80 50 78 Q40 80 28 76 Z" fill="${c}"/>`;
      case 'bob':
        return `<path d="M30 42 Q28 22 50 22 Q72 22 70 42 L70 60 Q62 64 50 62 Q38 64 30 60 Z" fill="${c}"/>`;
      case 'hijab':
        return `<path d="M27 50 Q26 20 50 19 Q74 20 73 50 L78 86 L22 86 Z" fill="${c}"/>`;
      default:
        return '';
    }
  }

  /* ---------- Cabelos (frente) ---------- */
  function hairFront(type, c) {
    const d = shade(c, 18);
    switch (type) {
      case 'afro':
      case 'puff':
      case 'twopuffs':
        return `<path d="M33 44 Q32 25 50 25 Q68 25 67 44 Q61 33 50 33 Q39 33 33 44 Z" fill="${c}"/>`;
      case 'braids':
      case 'locs':
        return `<path d="M33 45 Q31 24 50 24 Q69 24 67 45 Q63 32 50 31 Q37 32 33 45 Z" fill="${c}"/>
          <path d="M40 27 L40 33 M46 25 L46 32 M52 25 L52 32 M58 26 L58 33" stroke="${d}" stroke-width="1.2" opacity=".6"/>`;
      case 'curly':
        return `<g fill="${c}"><circle cx="38" cy="31" r="7"/><circle cx="46" cy="28" r="7"/><circle cx="54" cy="28" r="7"/><circle cx="62" cy="31" r="7"/><circle cx="34" cy="38" r="5"/><circle cx="66" cy="38" r="5"/></g>`;
      case 'long':
      case 'bob':
        return `<path d="M32 46 Q30 23 52 23 Q70 24 68 46 Q64 32 48 31 Q42 36 32 46 Z" fill="${c}"/>`;
      case 'short':
        return `<path d="M33 42 Q32 24 50 24 Q68 24 67 42 Q66 34 60 31 Q50 28 40 31 Q34 34 33 42 Z" fill="${c}"/>`;
      case 'buzz':
        return `<path d="M33.5 41 Q33 26 50 26 Q67 26 66.5 41 Q62 31 50 31 Q38 31 33.5 41 Z" fill="${c}" opacity=".92"/>`;
      case 'twists':
        return `<path d="M33.5 41 Q33 28 50 28 Q67 28 66.5 41 Q62 33 50 33 Q38 33 33.5 41 Z" fill="${c}"/>
          <g fill="${c}"><circle cx="38" cy="25" r="4.5"/><circle cx="45" cy="22" r="4.5"/><circle cx="52" cy="21" r="4.5"/><circle cx="59" cy="23" r="4.5"/><circle cx="64" cy="28" r="4"/><circle cx="35" cy="30" r="4"/></g>`;
      case 'hijab':
        return `<path d="M31 50 Q30 24 50 24 Q70 24 69 50 Q66 34 50 33 Q34 34 31 50 Z" fill="${c}"/>`;
      default:
        return '';
    }
  }

  /**
   * Avatar em busto. opts: skin, hair, hairColor, shirt, bg, glasses, earrings, expr ('smile'|'neutral'|'think'|'sad'|'wow')
   */
  function avatar(o = {}) {
    const skin = SKIN[o.skin] || o.skin || SKIN.s3;
    const hc = HAIR[o.hairColor] || o.hairColor || HAIR.black;
    const shirt = o.shirt || '#7c3aed';
    const hair = o.hair || 'short';
    const id = 'av' + (++uid);
    const skinD = shade(skin, -22);
    const expr = o.expr || 'smile';
    let mouth;
    if (expr === 'smile') mouth = `<path d="M44 57 Q50 62 56 57" stroke="#3b1d14" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    else if (expr === 'big') mouth = `<path d="M43 56 Q50 64 57 56 Z" fill="#fff" stroke="#3b1d14" stroke-width="1.6" stroke-linejoin="round"/>`;
    else if (expr === 'sad') mouth = `<path d="M45 59 Q50 55.5 55 59" stroke="#3b1d14" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    else if (expr === 'wow') mouth = `<ellipse cx="50" cy="58" rx="3" ry="3.6" fill="#3b1d14"/>`;
    else if (expr === 'think') mouth = `<path d="M45 58 L55 57" stroke="#3b1d14" stroke-width="2" stroke-linecap="round"/>`;
    else mouth = `<path d="M45 58 Q50 59.5 55 58" stroke="#3b1d14" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const brows = expr === 'sad'
      ? `<path d="M39 41 L46 39.5 M54 39.5 L61 41" stroke="${hc === HAIR.blond ? '#7a5a2a' : '#1a100c'}" stroke-width="1.8" stroke-linecap="round"/>`
      : expr === 'think'
        ? `<path d="M39 40 L46 41 M54 39 L61 38" stroke="#1a100c" stroke-width="1.8" stroke-linecap="round"/>`
        : `<path d="M39 40 Q42.5 38 46 40 M54 40 Q57.5 38 61 40" stroke="${hc === HAIR.blond ? '#7a5a2a' : '#1a100c'}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    const glasses = o.glasses ? `<g fill="none" stroke="#f8fafc" stroke-width="1.6" opacity=".95"><rect x="37" y="42.5" width="11" height="8" rx="3"/><rect x="52" y="42.5" width="11" height="8" rx="3"/><path d="M48 46 L52 46"/></g>` : '';
    const earrings = o.earrings ? `<circle cx="32.5" cy="54" r="2.2" fill="#f5b83d"/><circle cx="67.5" cy="54" r="2.2" fill="#f5b83d"/>` : '';
    const bg = o.bg === false ? '' : `<circle cx="50" cy="50" r="50" fill="${o.bg || 'url(#' + id + 'g)'}"/>`;
    const collar = o.collar === false ? '' : `<path d="M42 72 L50 80 L58 72" fill="none" stroke="${shade(shirt, 40)}" stroke-width="2"/>`;
    return `<svg viewBox="0 0 100 100" class="${o.cls || 'avatar'}" aria-hidden="true" focusable="false">
      <defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1f5c"/><stop offset="1" stop-color="#11183a"/></linearGradient>
      <clipPath id="${id}c"><circle cx="50" cy="50" r="50"/></clipPath></defs>
      ${bg}
      <g clip-path="url(#${id}c)">
        ${hairBack(hair, hc)}
        <rect x="43" y="60" width="14" height="16" rx="5" fill="${skinD}"/>
        <path d="M18 104 Q18 74 50 72 Q82 74 82 104 Z" fill="${shirt}"/>
        ${collar}
        <ellipse cx="32.5" cy="48" rx="3.2" ry="4.5" fill="${skinD}"/><ellipse cx="67.5" cy="48" rx="3.2" ry="4.5" fill="${skinD}"/>
        <ellipse cx="50" cy="46" rx="17" ry="19.5" fill="${skin}"/>
        ${hairFront(hair, hc)}
        ${brows}
        <ellipse cx="43" cy="46.5" rx="2.3" ry="2.7" fill="#1a100c"/><ellipse cx="57" cy="46.5" rx="2.3" ry="2.7" fill="#1a100c"/>
        <circle cx="43.8" cy="45.6" r=".8" fill="#fff"/><circle cx="57.8" cy="45.6" r=".8" fill="#fff"/>
        <path d="M48.5 50 Q50 53.5 51.5 50" stroke="${skinD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <ellipse cx="39" cy="53" rx="3" ry="1.8" fill="#ff7a59" opacity=".18"/><ellipse cx="61" cy="53" rx="3" ry="1.8" fill="#ff7a59" opacity=".18"/>
        ${mouth}${glasses}${earrings}
      </g>
    </svg>`;
  }

  /* ---------- Elenco de personagens (todos fictícios) ---------- */
  const CAST = {
    ayana:   { skin: 's2', hair: 'locs', hairColor: 'black', shirt: '#f97316', earrings: true, glasses: true },   // Diretora da Agência
    malu:    { skin: 's3', hair: 'afro', hairColor: 'black', shirt: '#a855f7', earrings: true },
    bento:   { skin: 's1', hair: 'twists', hairColor: 'black', shirt: '#0ea5e9' },
    lia:     { skin: 's6', hair: 'long', hairColor: 'brown', shirt: '#22c55e' },
    davi:    { skin: 's7', hair: 'short', hairColor: 'blond', shirt: '#64748b' },
    nina:    { skin: 's2', hair: 'braids', hairColor: 'black', shirt: '#eab308', earrings: true },
    kaua:    { skin: 's4', hair: 'short', hairColor: 'black', shirt: '#ef4444' },
    yasmin:  { skin: 's5', hair: 'hijab', hairColor: '#4c1d95', shirt: '#4c1d95' },
    joao:    { skin: 's3', hair: 'buzz', hairColor: 'black', shirt: '#14b8a6', glasses: true },
    bia:     { skin: 's5', hair: 'curly', hairColor: 'dark', shirt: '#ec4899' },
    theo:    { skin: 's6', hair: 'short', hairColor: 'brown', shirt: '#334155' },
    rute:    { skin: 's1', hair: 'puff', hairColor: 'black', shirt: '#6366f1', glasses: true, earrings: true },
    gabi:    { skin: 's4', hair: 'twopuffs', hairColor: 'dark', shirt: '#f43f5e' },
    caio:    { skin: 's7', hair: 'bob', hairColor: 'auburn', shirt: '#0f766e' },
    anon:    { skin: 's6', hair: 'buzz', hairColor: 'dark', shirt: '#475569' },
    anon2:   { skin: 's5', hair: 'short', hairColor: 'black', shirt: '#57534e' }
  };

  const AGENT_OPTIONS = [
    { skin: 's2', hair: 'afro', hairColor: 'black', shirt: '#7c3aed', earrings: true },
    { skin: 's1', hair: 'twists', hairColor: 'black', shirt: '#f97316' },
    { skin: 's4', hair: 'braids', hairColor: 'dark', shirt: '#0ea5e9' },
    { skin: 's6', hair: 'long', hairColor: 'brown', shirt: '#22c55e' },
    { skin: 's3', hair: 'buzz', hairColor: 'black', shirt: '#eab308', glasses: true },
    { skin: 's5', hair: 'curly', hairColor: 'dark', shirt: '#ec4899' },
    { skin: 's7', hair: 'short', hairColor: 'copper', shirt: '#14b8a6' },
    { skin: 's5', hair: 'hijab', hairColor: '#1e3a8a', shirt: '#1e3a8a' },
    { skin: 's1', hair: 'puff', hairColor: 'black', shirt: '#ef4444', glasses: true }
  ];

  function face(name, extra = {}) {
    return avatar(Object.assign({}, CAST[name] || CAST.anon, extra));
  }

  /* ---------- Logotipo ---------- */
  function logo(size = 160) {
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" class="logo-svg" role="img" aria-label="Logotipo da Operação Respeito">
      <defs>
        <linearGradient id="lgShield" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>
        <linearGradient id="lgRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#f97316"/></linearGradient>
        <radialGradient id="lgLens" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#3b82f6" stop-opacity=".55"/><stop offset="1" stop-color="#0b1026" stop-opacity=".9"/></radialGradient>
        <filter id="lgGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M100 10 L170 36 V96 C170 140 140 170 100 188 C60 170 30 140 30 96 V36 Z" fill="url(#lgShield)" stroke="#a78bfa" stroke-width="3"/>
      <g stroke="#a78bfa" stroke-width="2" opacity=".5" fill="none">
        <path d="M44 60 H64 L72 68"/><path d="M156 60 H136 L128 68"/><path d="M44 130 H60"/><path d="M156 130 H140"/>
        <circle cx="44" cy="60" r="3" fill="#a78bfa"/><circle cx="156" cy="60" r="3" fill="#a78bfa"/>
      </g>
      <circle cx="92" cy="92" r="40" fill="url(#lgLens)" stroke="url(#lgRing)" stroke-width="9" filter="url(#lgGlow)"/>
      <path d="M121 121 L150 150" stroke="url(#lgRing)" stroke-width="14" stroke-linecap="round"/>
      <g transform="translate(92 92)">
        <path d="M0 14 C-22 0 -18 -18 -8 -18 C-3 -18 0 -14 0 -11 C0 -14 3 -18 8 -18 C18 -18 22 0 0 14 Z" fill="#fbbf24"/>
        <g fill="none" stroke="#fde68a" stroke-width="1.4" opacity=".55">
          <path d="M-26 6 Q0 -40 26 6"/><path d="M-30 14 Q0 -50 30 14"/>
        </g>
      </g>
      <g fill="#22c55e"><circle cx="100" cy="176" r="0"/></g>
    </svg>`;
  }

  /* ---------- Ícones das operações ---------- */
  const OP_ICONS = {
    1: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="27" cy="27" r="16" fill="none" stroke="currentColor" stroke-width="5"/><path d="M39 39 L54 54" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M20 27 h14 M27 20 v14" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/></svg>`,
    2: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="10" width="48" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M8 40 L24 28 L34 36 L42 30 L56 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="44" cy="20" r="4" fill="#fbbf24"/><rect x="18" y="52" width="28" height="5" rx="2.5" fill="currentColor" opacity=".6"/></svg>`,
    3: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6 L32 58" stroke="currentColor" stroke-width="4"/><path d="M32 14 H52 L58 21 L52 28 H32 Z" fill="currentColor" opacity=".85"/><path d="M32 32 H12 L6 39 L12 46 H32 Z" fill="#fbbf24"/></svg>`,
    4: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 26 Q32 8 56 26 Q52 46 32 50 Q12 46 8 26 Z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="22" cy="28" r="5" fill="currentColor"/><circle cx="42" cy="28" r="5" fill="currentColor"/><path d="M40 52 L52 60" stroke="#fbbf24" stroke-width="5" stroke-linecap="round"/></svg>`,
    5: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="4"/><path d="M10 32 H54 M32 10 C20 22 20 42 32 54 C44 42 44 22 32 10" fill="none" stroke="currentColor" stroke-width="3"/><path d="M32 44 C22 36 24 26 29 26 C31 26 32 28 32 29 C32 28 33 26 35 26 C40 26 42 36 32 44 Z" fill="#fbbf24"/></svg>`
  };

  /* ---------- Medalhas ---------- */
  function medal(kind, locked) {
    const palette = {
      first:  ['#f97316', '#fbbf24', '🔍'],
      memes:  ['#a855f7', '#f0abfc', '🖼️'],
      empatia:['#ec4899', '#fda4af', '🤝'],
      cidad:  ['#0ea5e9', '#7dd3fc', '🛡️'],
      transf: ['#22c55e', '#bbf7d0', '🌍'],
      perfect:['#eab308', '#fef08a', '⭐'],
      leitor: ['#6366f1', '#c7d2fe', '📚']
    }[kind] || ['#64748b', '#cbd5e1', '?'];
    const [a, b, emoji] = locked ? ['#334155', '#475569', '🔒'] : palette;
    const id = 'md' + (++uid);
    return `<svg viewBox="0 0 100 120" class="medal-svg" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>
      <path d="M30 4 L44 40 L34 44 L20 8 Z" fill="${locked ? '#1e293b' : '#7c3aed'}"/><path d="M70 4 L56 40 L66 44 L80 8 Z" fill="${locked ? '#1e293b' : '#f97316'}"/>
      <circle cx="50" cy="74" r="38" fill="url(#${id})"/>
      <circle cx="50" cy="74" r="30" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="50" y="86" font-size="32" text-anchor="middle">${emoji}</text>
    </svg>`;
  }

  /* ---------- Ilustração da tela inicial ---------- */
  function heroScene() {
    const people = [
      { o: { skin: 's2', hair: 'afro', hairColor: 'black', shirt: '#a855f7', earrings: true, expr: 'big' }, x: 0, y: 26, s: 1, dev: 'phone' },
      { o: { skin: 's6', hair: 'long', hairColor: 'brown', shirt: '#22c55e' }, x: 104, y: 6, s: 0.92, dev: 'tablet' },
      { o: { skin: 's1', hair: 'twists', hairColor: 'black', shirt: '#f97316', glasses: true, expr: 'big' }, x: 196, y: 0, s: 1.06, dev: 'laptop' },
      { o: { skin: 's4', hair: 'braids', hairColor: 'dark', shirt: '#0ea5e9', earrings: true }, x: 300, y: 10, s: 0.94, dev: 'phone' },
      { o: { skin: 's5', hair: 'curly', hairColor: 'dark', shirt: '#ec4899', expr: 'big' }, x: 392, y: 30, s: 0.98, dev: 'tablet' }
    ];
    const dev = (t) => {
      if (t === 'phone') return `<g transform="translate(58 92) rotate(-8)"><rect width="30" height="50" rx="6" fill="#0b1026" stroke="#fbbf24" stroke-width="2.5"/><rect x="4" y="6" width="22" height="34" rx="2" fill="#312e81"/><path d="M8 16 h14 M8 22 h10 M8 28 h12" stroke="#a5b4fc" stroke-width="2.5" stroke-linecap="round"/><circle cx="15" cy="45" r="2" fill="#fbbf24"/></g>`;
      if (t === 'tablet') return `<g transform="translate(46 100) rotate(6)"><rect width="56" height="40" rx="6" fill="#0b1026" stroke="#a78bfa" stroke-width="2.5"/><rect x="5" y="5" width="46" height="30" rx="2" fill="#1e1b4b"/><circle cx="18" cy="17" r="6" fill="#f97316"/><path d="M28 14 h18 M28 21 h12 M10 29 h36" stroke="#c4b5fd" stroke-width="2.5" stroke-linecap="round"/></g>`;
      return `<g transform="translate(30 108)"><path d="M6 0 H86 V44 H6 Z" fill="#0b1026" stroke="#fbbf24" stroke-width="2.5"/><rect x="11" y="5" width="70" height="34" fill="#1e1b4b"/><path d="M0 44 H92 L86 52 H6 Z" fill="#334155"/><path d="M20 14 h26 M20 22 h40 M20 30 h18" stroke="#fde68a" stroke-width="2.5" stroke-linecap="round"/><circle cx="66" cy="16" r="5" fill="#22c55e"/></g>`;
    };
    let g = '';
    people.forEach((p) => {
      g += `<g transform="translate(${p.x} ${p.y}) scale(${p.s})">
        <g transform="translate(0 0)"><svg x="0" y="0" width="150" height="150" viewBox="0 0 100 100">${avatar(Object.assign({ bg: false, cls: 'hero-av' }, p.o)).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg></g>
        ${dev(p.dev)}
      </g>`;
    });
    // ícones flutuantes da rede
    const bubbles = `
      <g class="float f1"><rect x="20" y="0" width="70" height="30" rx="15" fill="#1e1b4b" stroke="#a78bfa"/><text x="55" y="21" font-size="16" text-anchor="middle" fill="#fff">💬 ❤️</text></g>
      <g class="float f2"><rect x="250" y="-26" width="86" height="30" rx="15" fill="#1e1b4b" stroke="#fbbf24"/><text x="293" y="-5" font-size="15" text-anchor="middle" fill="#fde68a">#Respeito</text></g>
      <g class="float f3"><rect x="430" y="-4" width="64" height="30" rx="15" fill="#1e1b4b" stroke="#22c55e"/><text x="462" y="17" font-size="16" text-anchor="middle" fill="#bbf7d0">✔ 🛡️</text></g>`;
    return `<svg viewBox="-10 -40 560 230" class="hero-svg" role="img" aria-label="Adolescentes de diferentes tons de pele e tipos de cabelo usando celular, tablet e notebook">
      <defs><radialGradient id="heroGlow" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#7c3aed" stop-opacity=".45"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="270" cy="120" rx="290" ry="110" fill="url(#heroGlow)"/>
      <g stroke="#a78bfa" stroke-opacity=".25" fill="none" stroke-width="1.5">
        <path d="M60 60 Q160 -10 270 50 T490 60"/><path d="M40 120 Q270 60 520 120"/>
      </g>
      ${bubbles}
      ${g}
    </svg>`;
  }

  /* ---------- "Fotos" ilustrativas para as publicações ---------- */
  function photo(kind, cap) {
    const id = 'ph' + (++uid);
    const frame = (inner, bgA = '#4c1d95', bgB = '#f97316') => `<svg viewBox="0 0 320 200" class="post-photo" role="img" aria-label="Ilustração da publicação">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient></defs>
      <rect width="320" height="200" fill="url(#${id})"/>${inner}</svg>`;
    const embed = (o, x, y, s) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 100 100">${avatar(Object.assign({ bg: false }, o)).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>`;
    switch (kind) {
      case 'selfie-crespo':
        return frame(`<circle cx="260" cy="40" r="22" fill="#fde68a" opacity=".6"/>
          <g fill="#fff" opacity=".25"><circle cx="40" cy="40" r="4"/><circle cx="70" cy="22" r="3"/><circle cx="290" cy="150" r="5"/></g>
          ${embed({ skin: 's2', hair: 'afro', hairColor: 'black', shirt: '#fbbf24', earrings: true, expr: 'big' }, 80, 10, 190)}
          <text x="20" y="186" font-size="15" fill="#fff" font-weight="700">${cap || '✨ meu crespo, minha coroa'}</text>`, '#7c3aed', '#f97316');
      case 'equipe-empresa': {
        const t = ['s6', 's7', 's6', 's7', 's6'];
        const h = ['short', 'long', 'bob', 'short', 'long'];
        const hc = ['brown', 'blond', 'auburn', 'blond', 'brown'];
        let s = '';
        t.forEach((sk, i) => { s += embed({ skin: sk, hair: h[i], hairColor: hc[i], shirt: '#334155', expr: 'smile' }, 8 + i * 61, 46, 84); });
        return frame(`<rect x="0" y="150" width="320" height="50" fill="#0f172a" opacity=".55"/><text x="160" y="32" font-size="16" fill="#fff" text-anchor="middle" font-weight="700">Nossa equipe de liderança 2026</text>${s}<text x="160" y="182" font-size="13" fill="#cbd5e1" text-anchor="middle">Vértice Tech • empresa fictícia</text>`, '#1e3a8a', '#0f172a');
      }
      case 'turma-diversa': {
        const list = [
          { skin: 's1', hair: 'twists', shirt: '#f97316' }, { skin: 's6', hair: 'long', hairColor: 'brown', shirt: '#22c55e' },
          { skin: 's3', hair: 'braids', shirt: '#a855f7', earrings: true }, { skin: 's5', hair: 'curly', hairColor: 'dark', shirt: '#0ea5e9' },
          { skin: 's2', hair: 'puff', shirt: '#eab308' }
        ];
        let s = ''; list.forEach((o, i) => { s += embed(Object.assign({ expr: 'big' }, o), 6 + i * 62, 50, 86); });
        return frame(`<text x="160" y="34" font-size="17" fill="#fff" text-anchor="middle" font-weight="800">🏆 Feira de Ciências — 1º lugar!</text>${s}`, '#0f766e', '#7c3aed');
      }
      case 'trancas':
        return frame(`${embed({ skin: 's1', hair: 'braids', hairColor: 'black', shirt: '#f43f5e', earrings: true, expr: 'big' }, 70, 8, 190)}
          <text x="20" y="186" font-size="15" fill="#fff" font-weight="700">${cap || 'Tranças novas pra entrevista 💼'}</text>`, '#1e1b4b', '#f43f5e');
      case 'black-power':
        return frame(`${embed({ skin: 's3', hair: 'afro', hairColor: 'black', shirt: '#0ea5e9', glasses: true, expr: 'big' }, 70, 8, 190)}
          <text x="20" y="186" font-size="15" fill="#fff" font-weight="700">${cap || 'Apresentação na feira hoje 🎓'}</text>`, '#0c4a6e', '#7c3aed');
      case 'festa':
        return frame(`<g fill="#fbbf24" opacity=".8"><circle cx="30" cy="30" r="5"/><circle cx="290" cy="34" r="5"/><circle cx="160" cy="20" r="4"/></g>
          ${embed({ skin: 's4', hair: 'curly', hairColor: 'dark', shirt: '#ec4899', expr: 'big' }, 20, 40, 150)}
          ${embed({ skin: 's1', hair: 'twopuffs', hairColor: 'black', shirt: '#22c55e', expr: 'big' }, 150, 40, 150)}`, '#4c1d95', '#be185d');
      case 'ciencia':
        return frame(`${embed({ skin: 's1', hair: 'puff', hairColor: 'black', shirt: '#6366f1', glasses: true, earrings: true, expr: 'big' }, 18, 20, 170)}
          <g transform="translate(200 50)"><rect width="100" height="100" rx="12" fill="#0b1026" opacity=".75"/><path d="M50 18 v26 l-20 36 h40 l-20 -36" fill="none" stroke="#fde68a" stroke-width="4" stroke-linejoin="round"/><circle cx="44" cy="70" r="4" fill="#22c55e"/><circle cx="56" cy="64" r="3" fill="#22c55e"/></g>`, '#1e3a8a', '#0f766e');
      case 'ia-teste':
        return frame(`<g transform="translate(20 20)"><rect width="280" height="160" rx="12" fill="#0b1026" opacity=".85"/>
          <text x="16" y="30" font-size="14" fill="#a5b4fc" font-family="monospace">FotoMágica IA v2 — teste interno</text>
          <rect x="16" y="44" width="120" height="96" rx="8" fill="#312e81"/><text x="76" y="98" font-size="13" fill="#fff" text-anchor="middle">pedido:</text><text x="76" y="116" font-size="12" fill="#fde68a" text-anchor="middle">"cientista"</text>
          <rect x="146" y="44" width="118" height="96" rx="8" fill="#7c2d12"/><text x="205" y="88" font-size="12" fill="#fff" text-anchor="middle">resultados:</text><text x="205" y="108" font-size="12" fill="#fed7aa" text-anchor="middle">pouca</text><text x="205" y="124" font-size="12" fill="#fed7aa" text-anchor="middle">diversidade ⚠</text></g>`, '#1e1b4b', '#0f172a');
      default:
        return frame(`<text x="160" y="105" font-size="18" fill="#fff" text-anchor="middle">Imagem</text>`);
    }
  }

  /* ---------- Evidência ocultada (memes) ---------- */
  function censored(desc, caption) {
    return `<div class="censored" role="img" aria-label="Conteúdo ocultado pela Agência. Descrição: ${desc.replace(/"/g, '&quot;')}">
      <div class="censored-bars"></div>
      <div class="censored-tag">🔒 CONTEÚDO OCULTADO PELA AGÊNCIA</div>
      <div class="censored-desc"><strong>Descrição da evidência:</strong> ${desc}</div>
      ${caption ? `<div class="censored-cap">Legenda original: <em>“${caption}”</em></div>` : ''}
    </div>`;
  }

  window.ART = { avatar, face, CAST, AGENT_OPTIONS, logo, OP_ICONS, medal, heroScene, photo, censored, SKIN };
})();
