/* =====================================================================
   TREINANDO UMA IA SEM PRECONCEITOS — Arte vetorial própria (SVG)
   Gera retratos ilustrados, o núcleo da NEXUS AI, ícones e medalhas.
   Nenhuma imagem externa é usada.
   ===================================================================== */
(function () {
  'use strict';

  let uid = 0;
  const nid = (p) => p + '-' + (++uid);

  // Escala de 10 tons de pele usada pelo gerador fictício (não é classificação de raça).
  const SKIN = ['#f6e1d3', '#efd0b8', '#e6bc98', '#d9a77c', '#c68c5f', '#a86f45', '#8a5534', '#6e4128', '#533020', '#3b2219'];
  const HAIR = {
    black: '#1d1714', darkbrown: '#2f1d13', brown: '#5a3820', blond: '#d8b36a', red: '#a3482b',
    gray: '#a3a8b3', white: '#e8eaee', purple: '#7c3aed', blue: '#2563eb', pink: '#db2777', teal: '#0d9488'
  };
  const OUTFITS = ['labcoat', 'suit', 'scrubs', 'vest', 'astronaut', 'chef', 'hoodie', 'tshirt', 'cardigan', 'pilot', 'apron', 'jacket'];
  const HAIRSTYLES = ['short', 'buzz', 'bald', 'afro', 'curly', 'long', 'bob', 'bun', 'ponytail', 'braids', 'locs', 'hijab'];
  const OUTFIT_COLOR = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

  function shade(hex, amt) {
    // amt < 0 escurece, > 0 clareia
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* --- Interpretação de uma descrição compacta: "s7 f a afro black labcoat glasses" --- */
  function parse(spec) {
    if (typeof spec === 'object') return Object.assign({ s: 4, g: 'f', a: 'a', h: 'short', hc: null, o: 'tshirt', oc: null, acc: [] }, spec);
    const p = { s: 4, g: 'f', a: 'a', h: 'short', hc: null, o: 'tshirt', oc: null, acc: [], bg: null };
    String(spec).split(/\s+/).filter(Boolean).forEach((t) => {
      if (/^s\d+$/.test(t)) p.s = Math.min(10, Math.max(1, +t.slice(1)));
      else if (t === 'f' || t === 'm' || t === 'n') p.g = t;
      else if (t === 'y' || t === 'a' || t === 'o') p.a = t;
      else if (HAIRSTYLES.includes(t)) p.h = t;
      else if (HAIR[t]) p.hc = t;
      else if (OUTFITS.includes(t)) p.o = t;
      else if (/^c\d$/.test(t)) p.oc = OUTFIT_COLOR[+t.slice(1) % OUTFIT_COLOR.length];
      else if (/^bg#/.test(t)) p.bg = t.slice(2);
      else p.acc.push(t);
    });
    return p;
  }

  function hairBack(p, hc) {
    const d = shade(hc, -0.25);
    switch (p.h) {
      case 'afro':
        return `<g fill="${hc}"><circle cx="50" cy="38" r="24"/><circle cx="31" cy="44" r="10"/><circle cx="69" cy="44" r="10"/></g>`;
      case 'curly':
        return `<g fill="${hc}">${[[34, 34], [42, 26], [52, 24], [61, 28], [67, 37], [33, 46], [67, 48], [36, 56], [64, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8"/>`).join('')}</g>`;
      case 'long':
        return `<path fill="${hc}" d="M31,44 C30,25 42,21 50,21 C60,21 70,26 69,44 L71,80 C64,84 36,84 29,80 Z"/>`;
      case 'bob':
        return `<path fill="${hc}" d="M31,46 C29,25 42,21 50,21 C59,21 71,25 69,46 L69,62 C63,65 37,65 31,62 Z"/>`;
      case 'braids':
        return `<g><path fill="${hc}" d="M31,44 C30,25 42,21 50,21 C60,21 70,26 69,44 L71,84 L29,84 Z"/>` +
          [34, 39, 61, 66].map((x) => `<path stroke="${d}" stroke-width="1.3" fill="none" d="M${x},50 l0,32" stroke-dasharray="3 1.6"/>`).join('') + '</g>';
      case 'locs':
        return `<g fill="${hc}"><path d="M31,44 C30,25 42,21 50,21 C60,21 70,26 69,44 L69,50 L31,50 Z"/>` +
          [30, 35, 40, 60, 65, 70].map((x, i) => `<rect x="${x - 2.6}" y="40" width="5.2" height="${34 + (i % 3) * 5}" rx="2.6"/>`).join('') + '</g>';
      case 'ponytail':
        return `<path fill="${hc}" d="M64,32 C78,34 80,52 74,68 C72,58 70,48 63,42 Z"/>`;
      case 'bun':
        return `<circle cx="50" cy="20" r="8" fill="${hc}"/>`;
      default: return '';
    }
  }

  function hairFront(p, hc) {
    switch (p.h) {
      case 'short':
        return `<path fill="${hc}" d="M34.5,43 C32.5,26 43,22 51,22.5 C62,23 68,30 65.5,43 C63.5,35 59,31 53,30.5 C45,30 38.5,34 34.5,43 Z"/>`;
      case 'buzz':
        return `<path fill="${hc}" opacity=".85" d="M35,40 C35,28 43,25 50,25 C58,25 65,28 65,40 C62,33 57,30.5 50,30.5 C43,30.5 38,33 35,40 Z"/>`;
      case 'afro':
        return `<path fill="${hc}" d="M35,40 C36,30 43,27 50,27 C57,27 64,30 65,40 C61,34 56,32.5 50,32.5 C44,32.5 39,34 35,40 Z"/>`;
      case 'curly':
        return `<g fill="${hc}"><circle cx="40" cy="32" r="6"/><circle cx="48" cy="29" r="6"/><circle cx="56" cy="30" r="6"/><circle cx="62" cy="35" r="5"/><circle cx="36" cy="38" r="4.5"/></g>`;
      case 'long': case 'bob': case 'braids':
        return `<path fill="${hc}" d="M34.5,45 C33,27 44,23 51,23.5 C61,24 67,30 65.5,45 C64,36 58,30 47,31 C41,32 37,37 34.5,45 Z"/>`;
      case 'locs':
        return `<path fill="${hc}" d="M34.5,44 C33,27 44,23 51,23.5 C61,24 67,30 65.5,44 C62,35 57,31 50,31 C43,31 38,35 34.5,44 Z"/>`;
      case 'bun': case 'ponytail':
        return `<path fill="${hc}" d="M35,42 C34,27 44,24 50,24 C57,24 66,27 65,42 C62,34 57,30.5 50,30.5 C43,30.5 38,34 35,42 Z"/>`;
      default: return '';
    }
  }

  function outfit(p, skin) {
    const c = p.oc || '#3b82f6';
    const body = (fill) => `<path fill="${fill}" d="M12,101 C12,82 28,72 50,72 C72,72 88,82 88,101 Z"/>`;
    switch (p.o) {
      case 'labcoat':
        return body('#eef2f7') + `<path fill="${c}" d="M41,72.5 L50,88 L59,72.5 Z"/><path stroke="#b8c2d0" stroke-width="1.2" fill="none" d="M41,72.5 L46,92 M59,72.5 L54,92 M50,88 L50,101"/><rect x="62" y="86" width="9" height="7" rx="1" fill="none" stroke="#b8c2d0" stroke-width="1"/><rect x="65" y="82.5" width="1.6" height="7" fill="#2563eb"/>`;
      case 'suit':
        return body('#1f2937') + `<path fill="#f8fafc" d="M42,72.5 L50,86 L58,72.5 Z"/><path fill="${p.oc || '#b91c1c'}" d="M48.6,76 L51.4,76 L52.6,90 L50,93 L47.4,90 Z"/><path stroke="#374151" stroke-width="1.4" fill="none" d="M42,72.5 L47,90 M58,72.5 L53,90"/>`;
      case 'scrubs':
        return body(p.oc || '#14b8a6') + `<path fill="${shade(p.oc || '#14b8a6', -0.25)}" d="M42,72.5 L50,84 L58,72.5 Z"/><rect x="60" y="85" width="10" height="7" rx="1.5" fill="none" stroke="${shade(p.oc || '#14b8a6', -0.3)}" stroke-width="1"/>`;
      case 'vest':
        return body(p.oc || '#475569') + `<path fill="#f97316" d="M24,84 C30,76 37,73 42,72.5 L46,101 L28,101 Z M76,84 C70,76 63,73 58,72.5 L54,101 L72,101 Z"/><path stroke="#fde68a" stroke-width="2.2" d="M30,90 L45,90 M55,90 L70,90"/>`;
      case 'astronaut':
        return body('#e5e7eb') + `<path fill="none" stroke="#9ca3af" stroke-width="4" d="M33,77 C40,73 60,73 67,77"/><rect x="61" y="84" width="9" height="6" rx="1" fill="#2563eb"/><circle cx="36" cy="88" r="3.4" fill="#ef4444"/><path stroke="#cbd5e1" stroke-width="1" d="M50,80 L50,101"/>`;
      case 'chef':
        return body('#f8fafc') + `<g fill="#94a3b8"><circle cx="45" cy="82" r="1.3"/><circle cx="45" cy="89" r="1.3"/><circle cx="45" cy="96" r="1.3"/><circle cx="55" cy="82" r="1.3"/><circle cx="55" cy="89" r="1.3"/><circle cx="55" cy="96" r="1.3"/></g><path fill="${p.oc || '#ef4444'}" d="M42,72.5 L50,78 L58,72.5 L58,75 L50,80.5 L42,75 Z"/>`;
      case 'hoodie':
        return `<path fill="${shade(c, -0.2)}" d="M34,72 C36,64 64,64 66,72 L60,78 L40,78 Z"/>` + body(c) + `<path stroke="#f8fafc" stroke-width="1.2" d="M46,76 L45,88 M54,76 L55,88"/><path fill="${shade(c, -0.15)}" d="M38,92 L62,92 L60,101 L40,101 Z"/>`;
      case 'cardigan':
        return body(p.oc || '#8b5cf6') + `<path fill="#f1f5f9" d="M42,72.5 L50,86 L58,72.5 Z"/><path fill="#f1f5f9" d="M46,86 L54,86 L54,101 L46,101 Z"/><g fill="${shade(p.oc || '#8b5cf6', -0.3)}"><circle cx="50" cy="91" r="1"/><circle cx="50" cy="96" r="1"/></g>`;
      case 'pilot':
        return body('#1e3a8a') + `<path fill="#f8fafc" d="M42,72.5 L50,84 L58,72.5 Z"/><path fill="#1f2937" d="M49,76 L51,76 L52,86 L50,88 L48,86 Z"/><path stroke="#fbbf24" stroke-width="2" d="M20,84 L30,80 M80,84 L70,80"/><rect x="58" y="86" width="9" height="3" fill="#fbbf24"/>`;
      case 'apron':
        return body(p.oc || '#0ea5e9') + `<path fill="#fafafa" d="M38,78 L62,78 L64,101 L36,101 Z"/><path stroke="#fafafa" stroke-width="1.6" d="M38,78 L42,72.5 M62,78 L58,72.5"/>`;
      case 'jacket':
        return body(p.oc || '#334155') + `<path fill="${shade(p.oc || '#334155', 0.5)}" d="M43,72.5 L50,80 L57,72.5 Z"/><path stroke="${shade(p.oc || '#334155', -0.35)}" stroke-width="1.5" d="M50,80 L50,101"/><path fill="${shade(p.oc || '#334155', -0.2)}" d="M41,72.5 L36,80 L44,86 Z M59,72.5 L64,80 L56,86 Z"/>`;
      default: // tshirt
        return body(c) + `<path fill="none" stroke="${shade(c, -0.3)}" stroke-width="1.6" d="M42,72.6 C45,77 55,77 58,72.6"/>`;
    }
  }

  function hats(p) {
    if (p.o === 'vest' || p.acc.includes('hardhat')) return `<path fill="#facc15" d="M31,36 C31,21 69,21 69,36 Z"/><rect x="28" y="34" width="44" height="4.5" rx="2" fill="#eab308"/><rect x="48" y="22" width="4" height="12" rx="1.5" fill="#fde047"/>`;
    if (p.o === 'chef') return `<path fill="#ffffff" stroke="#e2e8f0" d="M36,30 C30,22 36,12 44,15 C46,8 56,8 58,15 C66,12 71,22 64,30 L63,33 L37,33 Z"/>`;
    if (p.o === 'pilot') return `<path fill="#1e3a8a" d="M33,33 C33,22 67,22 67,33 Z"/><rect x="30" y="31" width="40" height="4" rx="2" fill="#172554"/><rect x="46" y="25" width="8" height="4" rx="1" fill="#fbbf24"/>`;
    return '';
  }

  function face(p, skin) {
    const dk = shade(skin, -0.32);
    const brow = p.hc ? HAIR[p.hc] : HAIR.black;
    const old = p.a === 'o';
    let s = '';
    s += `<ellipse cx="43.5" cy="45" rx="1.7" ry="2.1" fill="#1a1414"/><ellipse cx="56.5" cy="45" rx="1.7" ry="2.1" fill="#1a1414"/>`;
    s += `<circle cx="44.1" cy="44.3" r=".55" fill="#fff"/><circle cx="57.1" cy="44.3" r=".55" fill="#fff"/>`;
    s += `<path stroke="${shade(brow, old ? 0.2 : 0)}" stroke-width="1.5" stroke-linecap="round" fill="none" d="M40.5,40.6 Q43.5,39 46.5,40.4 M53.5,40.4 Q56.5,39 59.5,40.6"/>`;
    s += `<path stroke="${dk}" stroke-width="1.2" stroke-linecap="round" fill="none" d="M50,46 Q48.2,50.6 50.6,51.2"/>`;
    s += `<path stroke="#6b2f2f" stroke-width="1.5" stroke-linecap="round" fill="none" d="M45.5,55 Q50,58.6 54.5,55"/>`;
    s += `<ellipse cx="40.5" cy="51" rx="2.6" ry="1.6" fill="#f472b6" opacity=".18"/><ellipse cx="59.5" cy="51" rx="2.6" ry="1.6" fill="#f472b6" opacity=".18"/>`;
    if (old) s += `<path stroke="${dk}" stroke-width=".8" fill="none" opacity=".7" d="M38.6,46.5 l-2,1 M61.4,46.5 l2,1 M44,35.2 Q50,34 56,35.2 M45.5,59.5 Q50,61 54.5,59.5"/>`;
    return s;
  }

  function accessories(p, hc) {
    let s = '';
    const A = p.acc;
    if (A.includes('beard')) s += `<path fill="${hc}" d="M35.5,47 C36,61 43,66.5 50,66.5 C57,66.5 64,61 64.5,47 C62,53 58,55 54,54 Q50,53 46,54 C42,55 38,53 35.5,47 Z"/><path fill="${hc}" d="M44,52.6 Q50,50 56,52.6 Q50,54.6 44,52.6 Z"/>`;
    else if (A.includes('mustache')) s += `<path fill="${hc}" d="M44,53 Q50,50 56,53 Q50,55 44,53 Z"/>`;
    if (A.includes('glasses')) s += `<g fill="rgba(255,255,255,.18)" stroke="#111827" stroke-width="1.3"><rect x="38" y="41" width="10.5" height="8" rx="3"/><rect x="51.5" y="41" width="10.5" height="8" rx="3"/></g><path stroke="#111827" stroke-width="1.3" d="M48.5,44.5 L51.5,44.5"/>`;
    if (A.includes('earrings')) s += `<circle cx="34.6" cy="53" r="1.6" fill="#fbbf24"/><circle cx="65.4" cy="53" r="1.6" fill="#fbbf24"/>`;
    if (A.includes('hearing')) s += `<path fill="#60a5fa" stroke="#1d4ed8" stroke-width=".6" d="M65,41 C69,41 69,49 66,50 L65.6,47 C66.8,46 66.8,43.5 65,43.5 Z"/>`;
    if (A.includes('headset')) s += `<path stroke="#111827" stroke-width="3" fill="none" d="M32,46 C30,22 70,22 68,46"/><rect x="28.5" y="42" width="6" height="10" rx="2.5" fill="#22d3ee"/><rect x="65.5" y="42" width="6" height="10" rx="2.5" fill="#22d3ee"/><path stroke="#111827" stroke-width="1.4" fill="none" d="M31,51 Q34,60 43,58"/>`;
    return s;
  }

  function wheelchairBadge() {
    return `<g transform="translate(73,4)"><circle cx="11" cy="11" r="11" fill="#1d4ed8" stroke="#fff" stroke-width="1.4"/>` +
      `<g fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><circle cx="10" cy="5.5" r="1.4" fill="#fff" stroke="none"/><path d="M10,8 L10,12.5 L14.5,12.5 L16,17"/><path d="M8.2,10.5 A4.6,4.6 0 1 0 14,16"/></g></g>`;
  }

  function person(spec, opts) {
    opts = opts || {};
    const p = parse(spec);
    const skin = SKIN[(p.s || 4) - 1];
    const hcExplicit = !!p.hc;
    const hc = HAIR[p.hc || (p.a === 'o' ? 'gray' : 'black')];
    p.hc = p.hc || (p.a === 'o' ? 'gray' : 'black');
    const id = nid('pp');
    const bg = opts.bg || p.bg;
    const bgA = bg || '#1e293b', bgB = bg ? shade(bg, -0.35) : '#312e81';
    let s = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="portrait" role="img" aria-label="${opts.label ? esc(opts.label) : 'Ilustração de pessoa fictícia'}">`;
    s += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/></linearGradient><clipPath id="${id}c"><rect width="100" height="100" rx="${opts.round ? 50 : 14}"/></clipPath></defs>`;
    s += `<g clip-path="url(#${id}c)"><rect width="100" height="100" fill="url(#${id}g)"/>`;
    s += `<g opacity=".16" stroke="#a5f3fc" stroke-width=".6" fill="none"><path d="M0,20 L18,20 L24,14 L40,14"/><path d="M100,30 L82,30 L76,24 L64,24"/><circle cx="40" cy="14" r="1.4"/><circle cx="64" cy="24" r="1.4"/></g>`;
    if (p.h === 'hijab') {
      const hj = hcExplicit ? (p.hc === 'black' ? '#27272a' : hc) : p.oc ? shade(p.oc, 0.15) : '#7c3aed';
      s += outfit(p, skin);
      s += `<path fill="${hj}" d="M27,46 C26,22 40,17 50,17 C60,17 74,22 73,46 C73,60 70,72 80,82 L20,82 C30,72 27,60 27,46 Z"/>`;
      s += `<ellipse cx="50" cy="46" rx="14.6" ry="17.6" fill="${skin}"/>`;
      s += `<path fill="${shade(hj, -0.18)}" d="M34,37 C38,27 62,27 66,37 C61,31 39,31 34,37 Z"/>`;
      s += face(p, skin);
    } else {
      s += hairBack(p, hc);
      s += outfit(p, skin);
      s += `<path fill="${shade(skin, -0.12)}" d="M43.5,56 L56.5,56 L57.5,73.5 C53,76 47,76 42.5,73.5 Z"/>`;
      s += `<ellipse cx="34.6" cy="46.5" rx="3.2" ry="4.6" fill="${shade(skin, -0.08)}"/><ellipse cx="65.4" cy="46.5" rx="3.2" ry="4.6" fill="${shade(skin, -0.08)}"/>`;
      s += `<ellipse cx="50" cy="44.5" rx="15.6" ry="18.6" fill="${skin}"/>`;
      s += face(p, skin);
      s += hairFront(p, hc);
    }
    s += accessories(p, hc);
    s += hats(p);
    if (p.acc.includes('wheelchair')) s += wheelchairBadge();
    s += `</g></svg>`;
    return s;
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* --- Núcleo holográfico da NEXUS AI --- */
  function nexusCore(state) {
    const id = nid('nx');
    const col = state === 'glitch' ? ['#f43f5e', '#e879f9'] : state === 'fixed' ? ['#34d399', '#22d3ee'] : ['#22d3ee', '#8b5cf6'];
    return `<svg viewBox="0 0 200 200" class="nexus-core ${state || ''}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><radialGradient id="${id}r"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${col[0]}"/><stop offset=".7" stop-color="${col[1]}" stop-opacity=".55"/><stop offset="1" stop-color="${col[1]}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" stop-color="${col[0]}"/><stop offset="1" stop-color="${col[1]}"/></linearGradient></defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke="url(#${id}l)" stroke-width="1" opacity=".35"/>
      <g class="ring r1"><circle cx="100" cy="100" r="80" fill="none" stroke="url(#${id}l)" stroke-width="2.5" stroke-dasharray="30 12 6 12"/></g>
      <g class="ring r2"><circle cx="100" cy="100" r="64" fill="none" stroke="${col[0]}" stroke-width="1.5" stroke-dasharray="4 8" opacity=".8"/></g>
      <g class="ring r3"><path d="M100,30 A70,70 0 0 1 170,100" fill="none" stroke="${col[1]}" stroke-width="4" stroke-linecap="round"/><path d="M100,170 A70,70 0 0 1 30,100" fill="none" stroke="${col[1]}" stroke-width="4" stroke-linecap="round"/></g>
      <circle class="core-glow" cx="100" cy="100" r="50" fill="url(#${id}r)"/>
      <g class="eye"><ellipse cx="100" cy="100" rx="26" ry="15" fill="#020617" stroke="${col[0]}" stroke-width="2"/><circle cx="100" cy="100" r="9" fill="${col[0]}"/><circle cx="103" cy="97" r="3" fill="#fff"/></g>
    </svg>`;
  }

  /* --- Ícones (traço) --- */
  const ICONS = {
    flask: 'M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.3 21.5h11.4a2 2 0 0 0 1.8-3L14 9V3M7 15h10',
    db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.6-4.6',
    wrench: 'M14.7 6.3a4 4 0 0 0 5 5L22 9a6 6 0 0 1-8-8l-2.3 2.3zM14.7 6.3L4 17a2.1 2.1 0 0 0 3 3l10.7-10.7',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M8.5 12l2.5 2.5 4.5-5',
    star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
    lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
    check: 'M5 12.5l4.5 4.5L19 7',
    x: 'M6 6l12 12M18 6L6 18',
    sound: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
    mute: 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6',
    music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3',
    medal: 'M8 3l4 7 4-7M12 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 13.5l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z',
    trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4',
    home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    arrowR: 'M5 12h14M13 6l6 6-6 6',
    arrowL: 'M19 12H5M11 6l-6 6 6 6',
    refresh: 'M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7.5v.5',
    alert: 'M12 3L2 20h20zM12 10v4.5M12 17.5v.5',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
    folder: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
    chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
    play: 'M7 4l13 8-13 8z',
    cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
    eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    scale: 'M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0zM12 3l-1 4h2z',
    grad: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6',
    sparkles: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6',
    print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    exit: 'M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
    hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 16l-1.5-3a1.5 1.5 0 0 1 2.6-1.5L8 15',
    tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
    heart: 'M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z',
    globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2c3 3.3 3 16.7 0 20M12 2c-3 3.3-3 16.7 0 20',
    rocket: 'M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 4.5-9 13-9 0 8.5-5 12-9 13zM15 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    game: 'M6 9h4M8 7v4M15 9.5h.01M18 8h.01M2 15V9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v6a3 3 0 0 1-5.4 1.8L15 15H9l-1.6 1.8A3 3 0 0 1 2 15z',
    book: 'M4 4h6a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h7z',
    timeline: 'M12 3v18M6 7h6M12 12h6M6 17h6'
  };
  function icon(name, cls) {
    const d = ICONS[name] || ICONS.info;
    return `<svg class="ico ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  /* --- Medalhas --- */
  const TIER = { ouro: ['#fde68a', '#f59e0b', '#92400e'], prata: ['#f1f5f9', '#94a3b8', '#334155'], bronze: ['#fed7aa', '#c2410c', '#7c2d12'], bloqueada: ['#334155', '#1e293b', '#0f172a'] };
  function medal(iconName, tier, color) {
    const t = TIER[tier] || TIER.ouro;
    const id = nid('md');
    const rib = tier === 'bloqueada' ? '#1e293b' : (color || '#8b5cf6');
    return `<svg viewBox="0 0 100 120" class="medal-svg ${tier}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t[0]}"/><stop offset=".55" stop-color="${t[1]}"/><stop offset="1" stop-color="${t[2]}"/></linearGradient></defs>
      <path d="M30,0 L46,40 L34,46 L18,6 Z" fill="${rib}"/><path d="M70,0 L54,40 L66,46 L82,6 Z" fill="${shade(rib.length === 7 ? rib : '#8b5cf6', -0.3)}"/>
      <polygon points="50,34 81,52 81,88 50,106 19,88 19,52" fill="url(#${id})" stroke="${t[2]}" stroke-width="2"/>
      <polygon points="50,42 74,56 74,84 50,98 26,84 26,56" fill="none" stroke="${t[0]}" stroke-width="1.5" opacity=".8"/>
      <g transform="translate(35,55) scale(1.25)" color="${tier === 'bloqueada' ? '#475569' : t[2]}">${icon(tier === 'bloqueada' ? 'lock' : iconName).replace('<svg ', '<svg width="24" height="24" ')}</g>
    </svg>`;
  }

  /* --- Cenas da abertura --- */
  function sceneCity() {
    let b = '';
    const xs = [0, 60, 100, 170, 210, 280, 330, 400, 450, 520, 570, 640, 690, 760];
    xs.forEach((x, i) => {
      const h = 80 + ((i * 37) % 140);
      b += `<rect x="${x}" y="${300 - h}" width="${40 + (i % 3) * 10}" height="${h}" fill="url(#cityg)"/>`;
      for (let k = 0; k < 6; k++) if ((i + k) % 3) b += `<rect class="win" style="animation-delay:${(i * k) % 7 * 0.4}s" x="${x + 8 + (k % 2) * 16}" y="${310 - h + 12 + Math.floor(k / 2) * 22}" width="6" height="8" fill="#67e8f9"/>`;
    });
    return `<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" class="scene-svg" aria-hidden="true">
      <defs><linearGradient id="cityg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#312e81"/><stop offset="1" stop-color="#0b1026"/></linearGradient></defs>
      <g class="holo-lines" stroke="#22d3ee" stroke-width="1" opacity=".35" fill="none"><path d="M0,120 Q200,60 400,120 T800,120"/><path d="M0,90 Q200,150 400,90 T800,90"/></g>
      ${b}<rect y="296" width="800" height="4" fill="#22d3ee" opacity=".5"/></svg>`;
  }

  function sceneOrbit() {
    const items = [['Empregos', 'users'], ['Recomendações', 'star'], ['Imagens', 'eye'], ['Informações', 'db'], ['Decisões', 'scale'], ['Saúde', 'heart']];
    return `<div class="orbit">${items.map((it, i) => `<div class="orbit-item" style="--i:${i}">${icon(it[1])}<span>${it[0]}</span></div>`).join('')}<div class="orbit-center">IA</div></div>`;
  }

  window.ART = { person, nexusCore, icon, medal, sceneCity, sceneOrbit, SKIN, HAIR, HAIRSTYLES, OUTFITS, OUTFIT_COLOR, shade, parse };
})();
