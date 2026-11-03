/* O QUE VEM PRIMEIRO? — Ilustrações próprias em SVG.
   Todas as cenas usam a mesma área (160 x 120) e o mesmo kit de peças,
   para manter um estilo único: contorno escuro arredondado e cores alegres. */
(function (root) {
  'use strict';

  /* ---------------- Kit básico ---------------- */
  const K = '#2f3150';
  const SKIN = '#f7c9a0';
  const ADULT = '#c98b5f';
  const HAIR = '#5b3a29';
  const WATER = '#6fcdfc';
  const at = (o) => (o ? ' class="o"' : '');
  const R = (x, y, w, h, rx, f, o = true) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${at(o)}/>`;
  const C = (x, y, r, f, o = true) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${at(o)}/>`;
  const E = (x, y, rx, ry, f, o = true) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"${at(o)}/>`;
  const P = (d, f, o = true) => `<path d="${d}" fill="${f}"${at(o)}/>`;
  const S = (d, w = 3, c = K, extra = '') => `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"${extra}/>`;
  const limb = (d, col, w = 9) => S(d, w + 5, K) + S(d, w, col);
  const G = (x, y, inner, s = 1, r = 0) =>
    `<g transform="translate(${x} ${y})${r ? ` rotate(${r})` : ''}${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;
  const op = (inner, o) => `<g opacity="${o}">${inner}</g>`;

  /* ---------------- Fundos (cenários) ---------------- */
  const tiles = S('M0 22H160M0 44H160M0 66H160M32 0V84M64 0V84M96 0V84M128 0V84', 2, '#cbe6fa');
  const BG = {
    bath: R(0, 0, 160, 120, 0, '#e3f4ff', false) + tiles + R(0, 84, 160, 36, 0, '#bfe0f6', false) + S('M0 84H160', 3, '#a7d3ef'),
    kitchen: R(0, 0, 160, 120, 0, '#fff2dd', false) + R(0, 0, 160, 10, 0, '#ffe0b3', false) +
      R(0, 86, 160, 34, 0, '#f3c88e', false) + S('M0 86H160', 3, '#dfa964'),
    garden: R(0, 0, 160, 120, 0, '#dcf3ff', false) + C(140, 18, 11, '#ffd54f', false) +
      P('M0 84 Q40 76 80 82 T160 80 V120 H0Z', '#97da72', false) + P('M0 96 Q50 90 100 96 T160 94 V120 H0Z', '#82cc5d', false),
    room: R(0, 0, 160, 120, 0, '#efe8ff', false) + R(0, 90, 160, 30, 0, '#e9d3ae', false) + S('M0 90H160', 3, '#d4b98d'),
    school: R(0, 0, 160, 120, 0, '#fff5cd', false) + R(0, 92, 160, 28, 0, '#f0dca6', false) + S('M0 92H160', 3, '#dcc283'),
    trail: R(0, 0, 160, 120, 0, '#d6f0ff', false) + C(26, 20, 10, '#ffd54f', false) +
      P('M0 70 Q30 52 64 66 T130 58 T160 62 V120 H0Z', '#b5e59a', false) + P('M0 88 Q50 78 100 88 T160 84 V120 H0Z', '#8fd473', false)
  };

  /* ---------------- Peças ---------------- */
  const sparkle = (x, y, s = 1, c = '#ffcf3a') =>
    G(x, y, P('M0 -9 Q1.5 -1.5 9 0 Q1.5 1.5 0 9 Q-1.5 1.5 -9 0 Q-1.5 -1.5 0 -9Z', c, false), s);
  const drop = (x, y, s = 1, c = WATER) => G(x, y, P('M0 -7 Q6 1 0 6 Q-6 1 0 -7Z', c), s);
  const bubble = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#9fd6f5" stroke-width="2"/>`;
  const motion = (d) => S(d, 2.5, '#8a8fb5');
  const check = (x, y, s = 1) => G(x, y, C(0, 0, 11, '#2fc46b') + S('M-5 0 L-1.5 4 L5.5 -4', 3.5, '#fff'), s);

  // Mão fechada segurando algo. O braço sai para baixo (rotacione para mudar a direção).
  function hand(x, y, r = 0, o = {}) {
    const skin = o.skin || SKIN, sleeve = o.sleeve || '#4f8cff', s = o.s || 1;
    const arm = R(-9, 8, 18, 50, 7, sleeve);
    let palm;
    if (o.open) {
      palm = limb('M-7 -4 V-17', skin, 5) + limb('M-2 -6 V-21', skin, 5) + limb('M3.5 -6 V-21', skin, 5) +
        limb('M8.5 -4 V-16', skin, 5) + limb('M-9 4 L-16 -4', skin, 5) + R(-11, -9, 23, 22, 9, skin);
    } else {
      palm = E(-12, 0, 5, 7, skin) + R(-12, -12, 25, 25, 8, skin) + S('M-4 -12 V-5 M3 -12 V-5', 2);
    }
    return G(x, y, arm + palm, s, r);
  }

  // Cabeça de criança (centro do rosto).
  function head(x, y, o = {}) {
    const skin = o.skin || SKIN, hair = o.hair || HAIR, s = o.s || 1;
    let eyes;
    if (o.eyes === 'closed') eyes = S('M-12 3 Q-8 -1 -4 3 M4 3 Q8 -1 12 3', 2.5);
    else if (o.eyes === 'happy') eyes = S('M-12 4 Q-8 -1 -4 4 M4 4 Q8 -1 12 4', 2.5);
    else eyes = C(-8, 2, 2.8, K, false) + C(8, 2, 2.8, K, false) + C(-7, 1, 0.9, '#fff', false) + C(9, 1, 0.9, '#fff', false);
    const mouths = {
      smile: S('M-7 11 Q0 17 7 11', 2.5),
      open: P('M-7 10 Q0 22 7 10Z', '#c2404f'),
      teeth: P('M-9 9 Q0 23 9 9Z', '#ffffff') + S('M-9 9 H9', 2.5),
      puff: E(0, 13, 3, 2.5, '#c2404f'),
      o: E(0, 13, 3.5, 4.5, '#c2404f'),
      chew: S('M-6 12 Q-3 15 0 12 Q3 15 6 12', 2.5),
      none: ''
    };
    const cheekR = o.mouth === 'puff' ? 6.5 : 3.6;
    const cheeks = C(-13, 9, cheekR, '#ffa3a6', false) + C(13, 9, cheekR, '#ffa3a6', false);
    const hairD = o.longHair
      ? 'M-24 14 Q-28 -26 0 -26 Q28 -26 24 14 Q22 -4 16 -10 Q0 -14 -16 -10 Q-22 -4 -24 14Z'
      : 'M-22 -2 Q-24 -25 0 -26 Q24 -25 22 -2 Q14 -15 0 -14 Q-12 -15 -22 -2Z';
    const cap = o.cap ? P('M-23 -6 Q-22 -27 0 -27 Q22 -27 23 -6Z', o.cap) + P('M8 -9 Q30 -12 38 -4 Q24 -2 8 -4Z', o.cap) : '';
    const inner = C(-22, 4, 4.5, skin) + C(22, 4, 4.5, skin) + C(0, 0, 22, skin) + P(hairD, hair) + cap + eyes + cheeks + (mouths[o.mouth || 'smile']);
    return G(x, y, inner, s);
  }

  // Criança de corpo inteiro (y = chão).
  function kid(x, y, o = {}) {
    const shirt = o.shirt || '#4f8cff', pants = o.pants || '#36406d', s = o.s || 1;
    const legs = o.legs === 'walk'
      ? limb('M-5 -22 L-12 -4', pants, 8) + limb('M5 -22 L12 -4', pants, 8) + E(-13, -2, 7, 4, K) + E(13, -2, 7, 4, K)
      : o.legs === 'jump'
        ? limb('M-6 -22 L-12 -10 L-8 -2', pants, 8) + limb('M6 -22 L12 -10 L8 -2', pants, 8) + E(-8, 0, 7, 4, K) + E(8, 0, 7, 4, K)
        : limb('M-6 -22 V-4', pants, 8) + limb('M6 -22 V-4', pants, 8) + E(-7, -2, 7, 4, K) + E(7, -2, 7, 4, K);
    const armL = o.armL || 'M-12 -44 L-19 -26';
    const armR = o.armR || 'M12 -44 L19 -26';
    const end = (d) => d.trim().split(/[ML]/).filter(Boolean).pop().trim().split(/\s+/).map(Number);
    const [lx, ly] = end(armL), [rx, ry] = end(armR);
    const back = o.back || '';
    const body = back + legs + R(-14, -50, 28, 31, 11, shirt) + (o.chest || '') +
      limb(armL, shirt, 8) + C(lx, ly, 5, SKIN) + limb(armR, shirt, 8) + C(rx, ry, 5, SKIN) +
      head(0, -64, { s: 0.66, mouth: o.mouth, hair: o.hair, cap: o.cap, eyes: o.eyes, longHair: o.longHair }) + (o.front || '');
    return G(x, y, body, s);
  }

  // Adulto (mais alto).
  function adult(x, y, o = {}) {
    const shirt = o.shirt || '#2fb39b', pants = o.pants || '#4b4f7a';
    const legs = limb('M-6 -30 L-11 -4', pants, 9) + limb('M6 -30 L11 -4', pants, 9) + E(-12, -2, 8, 4, K) + E(12, -2, 8, 4, K);
    const body = legs + R(-16, -66, 32, 40, 12, shirt) +
      limb('M-14 -60 L-21 -36', shirt, 9) + C(-21, -35, 5.5, ADULT) + limb(o.armR || 'M14 -60 L22 -38', shirt, 9) +
      C(...(o.handR || [22, -37]), 5.5, ADULT) +
      head(0, -82, { s: 0.7, skin: ADULT, hair: '#2a2233', mouth: 'smile' });
    return G(x, y, body, o.s || 1);
  }

  /* ---- Banheiro ---- */
  const toothbrush = (paste) =>
    R(-44, -4, 70, 9, 4.5, '#4f8cff') + R(20, -7, 26, 12, 5, '#4f8cff') + R(22, -18, 22, 12, 3, '#ffffff') +
    S('M27 -18 V-8 M32 -18 V-8 M37 -18 V-8 M42 -18 V-8', 1.6, '#9fd6f5') +
    (paste ? P('M21 -18 Q24 -27 30 -22 Q34 -29 39 -22 Q44 -27 46 -19 Z', '#ffffff') + S('M25 -21 Q31 -25 37 -21 Q41 -24 44 -20', 2, '#5ec8ff') : '');
  const tube = R(-11, -30, 22, 42, 5, '#ff6b6b') + R(-11, -30, 22, 7, 3, '#ff9b9b') + S('M-5 -10 H5 M-5 -4 H5', 2, '#ffffff') +
    P('M-8 12 H8 L5 20 H-5Z', '#ffffff') + R(-4, 19, 8, 6, 2, '#ffffff');
  const cup = (fill) => P('M-13 -18 H13 L10 18 H-10Z', '#7ad0ff') + (fill ? P('M-11 -8 H11 L9.5 16 H-9.5Z', '#c6ecff', false) : '') +
    S('M-6 -12 V10', 2.5, '#ffffff');
  const sink = (water) =>
    R(0, 84, 160, 36, 0, '#bfe0f6', false) + P('M20 84 H140 Q134 112 80 112 Q26 112 20 84Z', '#ffffff') +
    E(80, 98, 6, 3, '#9fb4c8') + R(94, 34, 12, 50, 5, '#c4cfdc') + R(66, 30, 40, 11, 5, '#c4cfdc') + C(100, 26, 6, '#ff6b6b') +
    (water ? R(68, 41, 9, 44, 4, WATER, false) + S('M70 48 V80', 2, '#ffffff') : '');
  const towel = (x, y, s = 1) => G(x, y, R(-30, -26, 60, 52, 10, '#ffb547') + S('M-30 10 H30 M-30 16 H30', 3, '#ff8f2e') + S('M-20 -26 V-30 M0 -26 V-31 M20 -26 V-30', 2), s);

  /* ---- Sapatos ---- */
  function sneaker(x, y, o = {}) {
    const col = o.col || '#ff5a6e';
    let laces = S('M-14 -6 L-4 -12 M-10 -2 L0 -8 M-6 2 L4 -4', 2.5, '#ffffff');
    if (o.bow) laces += P('M-2 -12 Q-14 -24 -16 -12 Q-10 -8 -2 -12Z', '#ffffff') + P('M-2 -12 Q8 -26 14 -14 Q6 -8 -2 -12Z', '#ffffff') +
      S('M-2 -12 L-10 0 M-2 -12 L6 0', 2.5, '#ffffff', ' class="o2"');
    if (o.loose) laces += S('M-4 -10 Q-18 6 -6 14 Q2 18 -14 22 M0 -8 Q16 4 6 14 Q0 20 14 24', 2.5, '#ffffff');
    const shoe = P('M-30 10 V-8 Q-30 -18 -20 -18 Q-12 -18 -8 -10 Q0 0 16 0 Q32 0 32 10 Z', col) +
      R(-33, 8, 67, 9, 4.5, '#ffffff') + laces;
    return G(x, y, o.flip ? `<g transform="scale(-1 1)">${shoe}</g>` : shoe, o.s || 1);
  }
  const sockLeg = (x, y, s = 1) => G(x, y,
    R(-10, -70, 20, 36, 6, '#36406d') + P('M-9 -38 H9 V-8 Q9 2 20 4 Q30 6 30 12 Q30 18 20 18 H-4 Q-11 18 -11 10 Z', '#ffffff') +
    S('M-9 -30 H9 M-9 -24 H9', 2.5, '#ff8f2e'), s);

  /* ---- Cozinha ---- */
  const bread = (x, y, s = 1, r = 0) => G(x, y,
    P('M-20 18 V-4 Q-28 -6 -27 -15 Q-24 -26 -9 -24 Q0 -30 9 -24 Q24 -26 27 -15 Q28 -6 20 -4 V18 Z', '#e9a24f') +
    P('M-15 14 V-6 Q-22 -8 -21 -14 Q-18 -20 -7 -18 Q0 -23 7 -18 Q18 -20 21 -14 Q22 -8 15 -6 V14 Z', '#ffe6ad', false), s, r);
  const cheese = (x, y, s = 1) => G(x, y, R(-17, -17, 34, 34, 3, '#ffd34d') + C(-6, -5, 3.5, '#f5b82e', false) + C(7, 6, 2.6, '#f5b82e', false) + C(6, -9, 2, '#f5b82e', false), s);
  const tomato = (x, y, s = 1) => G(x, y, C(0, 0, 10, '#ff5f57') + C(0, 0, 6, '#ff8a80', false) + C(-2, -2, 1.3, '#ffe0a0', false) + C(2.5, 1.5, 1.3, '#ffe0a0', false), s);
  const lettuce = (x, y, s = 1) => G(x, y, P('M-22 0 Q-18 -10 -10 -6 Q-6 -14 2 -8 Q8 -15 14 -7 Q22 -10 24 0 Q12 8 0 4 Q-12 8 -22 0Z', '#7ed957'), s);
  function sandwich(x, y, s = 1, open = false) {
    let inner = R(-34, 4, 68, 13, 6, '#e9a24f') + R(-31, 0, 62, 6, 3, '#ff5f57') +
      P('M-30 -2 H30 L24 6 L18 -1 L10 6 L2 -1 L-6 6 L-14 -1 L-22 6Z', '#ffd34d') +
      P('M-34 -4 Q-28 -10 -20 -5 Q-12 -11 -4 -5 Q4 -11 12 -5 Q20 -11 28 -5 Q34 -8 36 -3 Q0 4 -34 -4Z', '#7ed957');
    if (!open) inner += P('M-34 -6 Q-36 -26 0 -26 Q36 -26 34 -6 Z', '#e9a24f') + S('M-20 -16 Q-17 -19 -14 -16 M4 -20 Q7 -23 10 -20', 2, '#ffe6ad');
    return G(x, y, inner, s);
  }
  const plate = (x, y, s = 1) => G(x, y, E(0, 0, 56, 12, '#ffffff') + E(0, -1, 40, 7, '#eaf3ff', false), s);
  const board = (x, y, w = 120) => R(x, y, w, 16, 8, '#c98b4f') + C(x + w - 10, y + 8, 3, '#a8703a', false);
  const knife = (x, y, r = 0) => G(x, y, P('M0 -4 H34 Q40 -4 40 0 L0 4Z', '#dfe7f1') + R(-24, -5, 25, 10, 4, '#5b3a29'), 1, r);
  const apple = (x, y, s = 1, c = '#ff5a5f') => G(x, y, P('M0 -8 Q12 -16 15 -2 Q16 14 4 15 Q0 13 -4 15 Q-16 14 -15 -2 Q-12 -16 0 -8Z', c) +
    S('M0 -8 Q1 -14 4 -17', 2.5) + P('M2 -13 Q9 -19 13 -14 Q8 -9 2 -13Z', '#7ed957'), s);
  const banana = (x, y, s = 1, r = 0) => G(x, y, P('M-22 -8 Q-14 14 14 10 Q24 8 26 -2 Q16 4 2 2 Q-12 0 -18 -12Z', '#ffd84d') + S('M-22 -8 L-20 -13', 3), s, r);
  const grapes = (x, y, s = 1) => G(x, y, C(-6, -4, 6, '#8e5cf0') + C(6, -4, 6, '#8e5cf0') + C(0, 5, 6, '#8e5cf0') + C(-6, 14, 5, '#8e5cf0') + C(6, 14, 5, '#8e5cf0') +
    C(0, 22, 5, '#8e5cf0') + S('M0 -10 V-16', 3) + P('M0 -14 Q8 -20 12 -13 Q6 -10 0 -14Z', '#7ed957'), s);
  const strawberry = (x, y, s = 1) => G(x, y, P('M-12 -6 Q0 -12 12 -6 Q12 10 0 18 Q-12 10 -12 -6Z', '#ff4d6a') +
    P('M-10 -7 L-4 -12 L0 -7 L4 -12 L10 -7 Q0 -2 -10 -7Z', '#56c45a') + C(-4, 2, 1.2, '#ffe28a', false) + C(4, 4, 1.2, '#ffe28a', false) + C(0, 10, 1.2, '#ffe28a', false), s);
  const orange = (x, y, s = 1) => G(x, y, C(0, 0, 14, '#ffa531') + C(-4, -5, 1.2, '#e8851c', false) + C(5, 3, 1.2, '#e8851c', false) + C(-2, 6, 1.2, '#e8851c', false) +
    P('M0 -14 Q6 -22 12 -17 Q6 -12 0 -14Z', '#7ed957'), s);
  const orangeHalf = (x, y, s = 1, r = 0) => G(x, y, C(0, 0, 14, '#ffa531') + C(0, 0, 10.5, '#ffd27a', false) +
    S('M0 -10 V10 M-9 -5 L9 5 M-9 5 L9 -5', 1.6, '#ffa531') + C(0, 0, 2, '#fff2c8', false), s, r);
  const bowl = (x, y, s = 1, fill = true) => G(x, y,
    (fill ? C(-22, -8, 7, '#ff5a5f') + C(-8, -12, 7, '#ffd84d') + C(8, -11, 7, '#8e5cf0') + C(22, -8, 7, '#ff4d6a') + C(0, -6, 6, '#ffa531') : '') +
    P('M-40 -6 H40 Q38 30 0 32 Q-38 30 -40 -6Z', '#5ec8ff') + S('M-30 6 Q0 14 30 6', 2.5, '#ffffff'), s);
  const colander = (x, y, s = 1) => G(x, y, P('M-34 -6 H34 Q30 24 0 26 Q-30 24 -34 -6Z', '#c4cfdc') +
    C(-16, 6, 2, K, false) + C(-4, 9, 2, K, false) + C(8, 9, 2, K, false) + C(20, 5, 2, K, false) + C(2, 18, 2, K, false) + R(-42, -9, 84, 6, 3, '#c4cfdc'), s);
  const faucetTop = (x, w = 46) => R(x - 6, 0, 12, 18, 4, '#c4cfdc') + R(x - w, 14, w + 6, 10, 5, '#c4cfdc') + R(x - w + 1, 22, 10, 6, 2, '#a9b6c6');
  const stream = (x, y1, y2) => R(x - 4, y1, 8, y2 - y1, 4, WATER, false) + S(`M${x - 1} ${y1 + 4} V${y2 - 4}`, 1.6, '#ffffff');
  const glass = (x, y, s = 1, lvl = 1, juice = '#ffa531') => G(x, y,
    (lvl ? P(`M${-12 + 2 * (1 - lvl)} ${18 - 34 * lvl} H${12 - 2 * (1 - lvl)} L10 18 H-10Z`, juice, false) : '') +
    P('M-14 -18 H14 L10 20 H-10Z', 'rgba(210,240,255,.35)') + S('M-8 -12 V12', 2.5, '#ffffff'), s);
  const mug = (x, y, s = 1) => G(x, y, R(-14, -14, 28, 28, 6, '#ff7a59') + S('M14 -6 Q24 -6 24 2 Q24 9 14 8', 4) + S('M14 -6 Q24 -6 24 2 Q24 9 14 8', 1.5, '#ff7a59') +
    S('M-6 -20 Q-9 -26 -6 -31 M2 -20 Q-1 -26 2 -31', 2.5, '#b9a7d8'), s);

  /* ---- Jardim ---- */
  function pot(x, y, o = {}) {
    let inner = P('M-26 -18 H26 L20 22 H-20Z', '#e2794b') + R(-30, -26, 60, 11, 4, '#f08f60');
    if (o.soil) inner += E(0, -24, 25, 4.5, '#7a4b2a', false) + P('M-25 -24 Q0 -32 25 -24 Q0 -20 -25 -24Z', '#8a5a34');
    if (o.mound) inner += P('M-16 -25 Q0 -38 16 -25Z', '#8a5a34');
    if (o.hole) inner += E(0, -25, 7, 2.5, '#3e2414', false);
    return G(x, y, inner, o.s || 1);
  }
  const seed = (x, y, s = 1, r = 0) => G(x, y, P('M0 -7 Q6 -2 4 6 Q0 9 -4 6 Q-6 -2 0 -7Z', '#6b4a2f') + S('M0 -5 V6', 1.4, '#e8d7b5'), s, r);
  const sprout = (x, y, s = 1, sad = false) => G(x, y, sad
    ? S('M0 0 Q2 -10 -2 -16', 3, '#6aa84f') + P('M-2 -16 Q-14 -14 -16 -4 Q-6 -8 -2 -16Z', '#9cbf6d') + P('M-2 -16 Q8 -10 6 0 Q0 -8 -2 -16Z', '#9cbf6d')
    : S('M0 0 V-16', 3, '#3f9d3a') + P('M0 -12 Q-14 -22 -18 -10 Q-8 -6 0 -12Z', '#6ad35b') + P('M0 -14 Q12 -26 18 -14 Q8 -8 0 -14Z', '#6ad35b'), s);
  const wateringCan = (x, y, s = 1, r = 0) => G(x, y,
    S('M-14 -14 Q-2 -30 12 -14', 4) + S('M-14 -14 Q-2 -30 12 -14', 1.5, '#4fb3ff') +
    P('M12 -2 L36 -18 L39 -13 L16 6Z', '#4fb3ff') + R(34, -24, 8, 12, 3, '#3a8fd6', true) +
    R(-20, -14, 36, 30, 7, '#4fb3ff') + S('M-12 -4 H8', 2.5, '#ffffff'), s, r);
  const trowel = (x, y, r = 0, s = 1) => G(x, y, R(-4, 4, 8, 22, 4, '#ffb547') + P('M-10 -24 Q0 -32 10 -24 L8 2 Q0 8 -8 2Z', '#c4cfdc'), s, r);
  const sun = (x, y, s = 1) => G(x, y, S('M0 -22 V-16 M0 16 V22 M-22 0 H-16 M16 0 H22 M-15 -15 L-11 -11 M11 11 L15 15 M-15 15 L-11 11 M11 -11 L15 -15', 3, '#ffb300') +
    C(0, 0, 12, '#ffd54f'), s);
  const calendar = (x, y, s = 1, marks = 3) => {
    let m = '';
    for (let i = 0; i < 6; i++) {
      const cx = -12 + (i % 3) * 12, cy = 0 + Math.floor(i / 3) * 10;
      m += i < marks ? S(`M${cx - 3} ${cy - 3} L${cx + 3} ${cy + 3} M${cx + 3} ${cy - 3} L${cx - 3} ${cy + 3}`, 2, '#ff6b6b') : C(cx, cy, 1.6, '#c3c7de', false);
    }
    return G(x, y, R(-20, -16, 40, 36, 5, '#ffffff') + R(-20, -16, 40, 10, 4, '#ff6b6b') + m, s);
  };
  const magnifier = (x, y, s = 1, r = 0) => G(x, y, R(-4, 10, 8, 22, 4, '#7a5cf0') + C(0, 0, 13, 'rgba(200,236,255,.6)') + S('M-6 -5 Q-3 -9 2 -9', 2.5, '#ffffff'), s, r);
  const fence = (y) => {
    let f = S(`M4 ${y + 6} H156 M4 ${y + 16} H156`, 3, '#b07a45');
    for (let x = 8; x < 160; x += 16) f += P(`M${x - 4} ${y + 22} V${y} L${x} ${y - 5} L${x + 4} ${y} V${y + 22}Z`, '#e7b17a');
    return f;
  };
  const soilBed = (x, y, w, rows = true) => P(`M${x} ${y} Q${x + w / 2} ${y - 10} ${x + w} ${y} V${y + 18} H${x}Z`, '#8a5a34') +
    (rows ? S(`M${x + 10} ${y + 4} Q${x + w / 2} ${y - 2} ${x + w - 10} ${y + 4} M${x + 10} ${y + 12} Q${x + w / 2} ${y + 7} ${x + w - 10} ${y + 12}`, 2.5, '#6b4224') : '');
  const seedPacket = (x, y, s = 1, r = 0) => G(x, y, R(-14, -18, 28, 36, 4, '#fff6d8') + R(-14, -18, 28, 9, 3, '#ff8f2e') +
    P('M-2 -2 L2 -2 L0 12Z', '#ff8f2e') + P('M0 -2 Q-6 -8 -4 -10 Q0 -6 0 -2 Q4 -10 6 -8 Q2 -4 0 -2Z', '#56c45a'), s, r);
  const glove = (x, y, s = 1, r = 0) => G(x, y, limb('M-6 -2 V-14', '#ffd34d', 5) + limb('M0 -4 V-17', '#ffd34d', 5) + limb('M6 -2 V-14', '#ffd34d', 5) +
    limb('M-9 6 L-15 0', '#ffd34d', 5) + R(-10, -6, 21, 24, 7, '#ffd34d') + R(-10, 12, 21, 7, 3, '#ff8f2e'), s, r);
  const rake = (x, y, r = 0, s = 1) => G(x, y, R(-3, -40, 6, 52, 3, '#b07a45') + R(-16, 10, 32, 6, 3, '#c4cfdc') +
    S('M-13 16 V24 M-6 16 V24 M1 16 V24 M8 16 V24 M14 16 V24', 3), s, r);
  const stone = (x, y, s = 1) => G(x, y, P('M-8 4 Q-9 -4 -2 -6 Q8 -7 9 1 Q8 6 0 6 Q-6 7 -8 4Z', '#a9b0c4'), s);

  /* ---- Escola e quarto ---- */
  const book = (x, y, s = 1, col = '#4f8cff', r = 0) => G(x, y, R(-13, -18, 26, 36, 3, col) + R(-13, -18, 6, 36, 2, 'rgba(0,0,0,.18)', false) +
    R(-3, -10, 12, 7, 2, '#ffffff', false), s, r);
  const notebook = (x, y, s = 1, col = '#ff6b8b', r = 0) => G(x, y, R(-13, -18, 26, 36, 3, col) +
    S('M-13 -12 h-3 M-13 -5 h-3 M-13 2 h-3 M-13 9 h-3', 2.5) + R(-4, -9, 12, 6, 2, '#ffffff', false), s, r);
  const bookFlat = (x, y, w, col) => R(x, y, w, 10, 3, col) + R(x + w - 6, y + 2, 4, 6, 1, '#ffffff', false);
  function backpack(x, y, o = {}) {
    const col = o.col || '#ff7a59';
    let inner = S('M-16 -30 Q-16 -44 0 -44 Q16 -44 16 -30', 5) + S('M-16 -30 Q-16 -44 0 -44 Q16 -44 16 -30', 2.5, col) +
      R(-28, -32, 56, 66, 18, col) + R(-18, 6, 36, 22, 8, '#ffa184') + S('M-12 12 H12', 2.5);
    if (o.open) inner += E(0, -26, 21, 7, '#7a2e1f') + (o.inside || '');
    else inner += S('M-22 -16 Q0 -24 22 -16', 2.5) + C(20, -16, 3, '#ffd34d');
    return G(x, y, inner, o.s || 1);
  }
  const pencilCase = (x, y, s = 1, r = 0) => G(x, y,
    R(-6, -16, 5, 12, 1.5, '#ffd34d') + R(1, -18, 5, 12, 1.5, '#2fc46b') + R(8, -15, 5, 10, 1.5, '#ff6b6b') +
    R(-24, -9, 48, 20, 10, '#7a5cf0') + S('M-18 -2 H18', 2.5, '#ffffff') + C(18, -2, 2.6, '#ffd34d'), s, r);
  const pencil = (x, y, s = 1, r = 0, col = '#ffd34d') => G(x, y, R(-20, -4, 32, 8, 2, col) + P('M12 -4 L22 0 L12 4Z', '#f7d9b0') + P('M19 -1.2 L22 0 L19 1.2Z', K, false) +
    R(-24, -4, 6, 8, 2, '#ff9fb0'), s, r);
  const clipboard = (x, y, s = 1, n = 3) => {
    let rows = '';
    for (let i = 0; i < 3; i++) rows += (i < n ? S(`M-12 ${-6 + i * 11} l3 3 l6 -6`, 3, '#2fc46b') : R(-14, -10 + i * 11, 8, 8, 2, '#ffffff')) + S(`M0 ${-6 + i * 11} H14`, 2.5, '#c3c7de');
    return G(x, y, R(-22, -24, 44, 50, 6, '#c98b4f') + R(-18, -18, 36, 40, 3, '#ffffff') + R(-9, -28, 18, 9, 3, '#c4cfdc') + rows, s);
  };
  const block = (x, y, w, h, col) => R(x, y, w, h, 3, col) + R(x + 3, y + 3, w - 6, 4, 2, 'rgba(255,255,255,.45)', false);
  const ball = (x, y, s = 1) => G(x, y, C(0, 0, 12, '#ff6b6b') + S('M-12 0 Q0 -6 12 0 M-12 0 Q0 6 12 0', 2.5, '#ffffff') + S('M0 -12 Q-6 0 0 12', 2.5, '#ffd34d'), s);
  const teddy = (x, y, s = 1) => G(x, y, C(-11, -24, 6, '#c98b4f') + C(11, -24, 6, '#c98b4f') + E(0, 4, 15, 15, '#c98b4f') + C(0, -16, 12, '#c98b4f') +
    E(0, -12, 5, 4, '#f0c99a') + C(-4, -19, 1.6, K, false) + C(4, -19, 1.6, K, false) + C(0, -13, 1.6, K, false) + E(0, 6, 8, 8, '#f0c99a', false), s);
  const toyCar = (x, y, s = 1, r = 0) => G(x, y, P('M-20 4 V-4 Q-20 -8 -14 -8 L-8 -16 H8 L14 -8 Q20 -8 20 -4 V4Z', '#2fb3ff') + R(-6, -14, 12, 6, 2, '#d6f1ff') +
    C(-11, 5, 5, K, false) + C(11, 5, 5, K, false) + C(-11, 5, 2, '#c4cfdc', false) + C(11, 5, 2, '#c4cfdc', false), s, r);
  const toyBox = (x, y, s = 1, open = true, toys = true) => G(x, y,
    (toys ? ball(-12, -22, 0.9) + teddy(10, -26, 0.6) : '') +
    R(-32, -20, 64, 40, 6, '#ffb547') + S('M-32 -6 H32', 2.5, '#e8902a') + C(0, 6, 5, '#ff8f2e') +
    (open ? P('M-32 -20 L-40 -46 L24 -50 L32 -20Z', '#ffc96b') : R(-34, -26, 68, 10, 4, '#ffc96b')), s);
  const bookshelf = (x, y, s = 1, books = 5) => {
    const cols = ['#ff6b6b', '#4f8cff', '#2fc46b', '#ffd34d', '#7a5cf0', '#ff8f2e'];
    let b = '';
    for (let i = 0; i < books; i++) b += R(-30 + i * 10, -38, 9, 30, 2, cols[i % 6]);
    return G(x, y, R(-38, -44, 76, 82, 6, '#c98b4f') + R(-32, -38, 64, 32, 2, '#a8703a', false) + R(-32, 0, 64, 32, 2, '#a8703a', false) + b +
      teddy(12, 24, 0.55) + ball(-18, 22, 0.7), s);
  };
  function bed(x, y, o = {}) {
    const bl = o.blanket || '#7a5cf0';
    let inner = R(-70, -40, 14, 56, 5, '#c98b4f') + R(-62, -6, 132, 18, 6, '#ffffff') + R(-62, 10, 132, 10, 3, '#c98b4f') +
      R(-60, 18, 8, 10, 2, '#a8703a') + R(58, 18, 8, 10, 2, '#a8703a');
    inner += o.messy
      ? P('M-30 -10 Q-10 -24 10 -8 Q30 -22 52 -8 Q64 -4 70 6 L70 12 H-34 Z', bl) + S('M-10 -6 Q10 0 30 -6', 2.5, '#ffffff')
      : R(-36, -12, 106, 22, 6, bl) + S('M-20 -2 H60', 2.5, 'rgba(255,255,255,.6)');
    if (o.pillow !== false) inner += E(-44, -10, 14, 7, '#ffffff');
    return G(x, y, inner, o.s || 1);
  }
  const alarm = (x, y, s = 1, ring = true) => G(x, y, C(-9, -11, 4.5, '#ffd34d') + C(9, -11, 4.5, '#ffd34d') + C(0, 0, 13, '#ff6b6b') + C(0, 0, 9, '#ffffff') +
    S('M0 0 V-6 M0 0 L4 2', 2.5) + S('M-8 13 L-11 17 M8 13 L11 17', 3) +
    (ring ? S('M-20 -14 Q-24 -6 -20 2 M20 -14 Q24 -6 20 2 M-26 -18 Q-31 -6 -26 6 M26 -18 Q31 -6 26 6', 2.5, '#ff8f2e') : ''), s);
  const windowSun = (x, y) => G(x, y, R(-22, -18, 44, 36, 4, '#bfe8ff') + C(8, -4, 8, '#ffd54f', false) + S('M0 -18 V18 M-22 0 H22', 3) + R(-22, -18, 44, 36, 4, 'none'));
  const door = (x, y, open = true) => G(x, y, R(-22, -70, 44, 70, 4, '#a8703a') +
    (open ? R(-18, -66, 36, 66, 2, '#bfe8ff', false) + P('M-18 -66 L4 -72 V-2 L-18 0Z', '#e2a56a') + C(-1, -36, 2.5, '#ffd34d') : C(14, -36, 3, '#ffd34d')));

  /* ---- Expedição ---- */
  const tree = (x, y, s = 1) => G(x, y, R(-4, -6, 8, 18, 3, '#a8703a') + P('M0 -40 L18 -4 H-18Z', '#3fae5a') + P('M0 -50 L14 -22 H-14Z', '#53c46c'), s);
  const map = (x, y, s = 1, r = 0) => G(x, y, P('M-36 -24 L-12 -28 L12 -24 L36 -28 V24 L12 28 L-12 24 L-36 28Z', '#fff3c4') +
    S('M-12 -28 V24 M12 -24 V28', 2, '#e5cf86') + S('M-28 14 Q-18 -2 -4 8 Q8 16 16 0 Q22 -10 26 -14', 3, '#ff6b6b', ' stroke-dasharray="4 5"') +
    S('M22 -18 L30 -10 M30 -18 L22 -10', 3.5, '#ff3d57') + G(-22, -10, P('M0 -8 L6 4 H-6Z', '#3fae5a', false)) + G(-2, -14, P('M0 -8 L6 4 H-6Z', '#3fae5a', false)), s, r);
  const tent = (x, y, s = 1, o = {}) => G(x, y,
    P('M-44 18 L0 -34 L44 18Z', o.col || '#ff8f2e') + P('M0 -34 L-14 18 H14Z', '#ffb547') + S('M0 -34 V18', 2.5) +
    (o.inside || '') + (o.stakes ? S('M-44 18 L-54 24 M44 18 L54 24', 2.5) + R(-57, 20, 5, 10, 1.5, '#a8703a') + R(52, 20, 5, 10, 1.5, '#a8703a') : ''), s);
  const sleepingBag = (x, y, s = 1) => G(x, y, R(-24, -8, 48, 16, 8, '#4f8cff') + E(-20, 0, 8, 6, '#9fc4ff') + S('M-8 -8 V8', 2, '#ffffff'), s);
  const bottle = (x, y, s = 1, r = 0, fill = 1) => G(x, y, R(-9, -18, 18, 34, 6, '#bfe8ff') + (fill ? R(-8, -18 + 34 * (1 - fill) + 2, 16, 34 * fill - 4, 5, '#5ec8ff', false) : '') +
    R(-6, -26, 12, 9, 3, '#2fb39b') + S('M-4 -10 V8', 2, '#ffffff'), s, r);
  const raincoat = (x, y, s = 1, r = 0) => G(x, y, P('M-16 -18 Q0 -26 16 -18 L22 18 H-22Z', '#ffd34d') + P('M-8 -20 Q0 -10 8 -20', '#ffd34d') + S('M0 -12 V16', 2.5) + C(-2, -2, 1.6, K, false) + C(-2, 8, 1.6, K, false), s, r);
  const trashBag = (x, y, s = 1) => G(x, y, P('M-16 -16 Q-22 18 0 20 Q22 18 16 -16 Q8 -10 0 -18 Q-8 -10 -16 -16Z', '#4a5070') + S('M-4 -20 L0 -16 L4 -22', 2.5) + S('M-8 0 Q0 4 8 0', 2, '#7c84aa'), s);
  const can = (x, y, s = 1, r = 0) => G(x, y, R(-7, -11, 14, 22, 3, '#ff6b6b') + R(-7, -4, 14, 8, 1, '#ffffff', false), s, r);
  const signPost = (x, y) => G(x, y, R(-3, -40, 6, 42, 2, '#a8703a') + P('M-24 -46 H18 L28 -38 L18 -30 H-24Z', '#e2a56a') + G(-10, -38, P('M0 -6 L8 6 H-8Z', '#2fb39b')) + S('M2 -38 H16', 2.5));
  const campfire = (x, y, s = 1) => G(x, y, stone(-14, 4) + stone(0, 7) + stone(14, 4) + S('M-12 2 L12 -6 M-12 -6 L12 2', 5, '#a8703a'), s);
  const cap = (x, y, s = 1) => G(x, y, P('M-18 6 Q-18 -16 4 -16 Q22 -16 22 6Z', '#ff6b6b') + P('M14 4 Q36 2 40 10 Q24 12 10 10Z', '#ff6b6b') + C(2, -15, 3, '#ff9b9b'), s);
  const sunscreen = (x, y, s = 1, r = 0) => G(x, y, R(-10, -20, 20, 36, 7, '#ffd34d') + R(-6, -28, 12, 10, 3, '#ff8f2e') + G(0, -2, sun(0, 0, 0.35)), s, r);
  const controller = (x, y, s = 1) => G(x, y, P('M-26 -8 Q-30 -16 -18 -16 H18 Q30 -16 26 -8 L30 10 Q30 18 22 16 L14 6 H-14 L-22 16 Q-30 18 -30 10Z', '#4a5070') +
    S('M-18 -6 V2 M-22 -2 H-14', 3, '#ffffff') + C(14, -6, 2.5, '#ff6b6b', false) + C(20, -1, 2.5, '#2fc46b', false), s);
  const tv = (x, y, s = 1, screen = '') => G(x, y, R(-34, -26, 68, 46, 6, '#4a5070') + R(-29, -21, 58, 36, 3, '#bfe8ff') + screen + S('M-10 20 L-16 30 M10 20 L16 30', 3), s);
  const mallet = (x, y, r = 0) => G(x, y, R(-3, -2, 6, 30, 3, '#ffb547') + R(-12, -12, 24, 12, 4, '#7c84aa'), 1, r);

  /* ---------------- Cenas (uma por ação) ---------------- */
  const A = {};
  const add = (id, bg, svg) => { A[id] = { bg, svg }; };

  /* Missão 1 — Escovando os dentes */
  add('m1_pasta', 'bath', G(68, 80, toothbrush(true)) + G(124, 32, tube, 1, 40) + hand(140, 20, 40, { sleeve: '#ffb547' }) + S('M108 58 Q104 62 102 60', 3, '#5ec8ff') + sparkle(30, 30, 0.9));
  add('m1_escovar', 'bath', head(70, 58, { s: 1.45, mouth: 'teeth', eyes: 'happy' }) + G(118, 86, toothbrush(true), 1, -20) + hand(140, 90, -50, { sleeve: '#ffb547' }) +
    bubble(92, 82, 5) + bubble(100, 72, 4) + bubble(86, 92, 3.5) + bubble(42, 92, 3));
  add('m1_enxaguar', 'bath', head(64, 56, { s: 1.45, mouth: 'puff' }) + G(108, 74, cup(true), 1.1, -18) + hand(118, 92, -30, { sleeve: '#ffb547' }) +
    bubble(92, 44, 3) + bubble(100, 36, 4) + bubble(109, 26, 5) + drop(90, 98, 0.8));

  /* Missão 2 — Lavando as mãos */
  add('m2_molhar', 'bath', sink(true) + hand(58, 76, 30, { open: true }) + hand(98, 78, -30, { open: true, s: 1 }) + drop(46, 56, 0.9) + drop(110, 56, 0.9) + drop(84, 70, 0.7));
  add('m2_sabao', 'bath', sink(false) + G(34, 78, R(-14, -7, 28, 14, 7, '#ff9fd0') + S('M-8 -2 H4', 2, '#ffffff')) +
    hand(70, 66, 35, { open: true }) + hand(92, 64, -35, { open: true }) +
    bubble(62, 42, 6) + bubble(76, 34, 5) + bubble(96, 38, 6.5) + bubble(108, 54, 4.5) + bubble(54, 58, 4) + bubble(84, 48, 3.5));
  add('m2_secar', 'bath', sink(false) + towel(80, 54, 1) + hand(46, 62, 50, { open: true }) + hand(114, 62, -50, { open: true }) + sparkle(30, 26, 0.9) + sparkle(132, 22, 0.7));

  /* Missão 3 — Calçando os sapatos */
  add('m3_pegar', 'room', sneaker(66, 70, { s: 1.05 }) + sneaker(92, 82, { s: 1.05 }) + hand(56, 44, 160, { sleeve: '#2fb39b' }) + sparkle(130, 30, 0.8));
  add('m3_pes', 'room', sneaker(80, 90, { s: 1.2 }) + sockLeg(76, 52, 0.95) + S('M120 24 V48 M114 42 L120 49 L126 42', 3.5, '#ff8f2e'));
  add('m3_amarrar', 'room', R(40, -6, 28, 46, 6, '#36406d') + R(42, 34, 24, 24, 4, '#ffffff') + S('M42 42 H66', 2.5, '#ff8f2e') + sneaker(80, 76, { s: 1.4, bow: true }) + hand(46, 70, 60, { sleeve: '#2fb39b' }) + hand(118, 66, -60, { sleeve: '#2fb39b' }));
  add('m3_caixa', 'room', sneaker(66, 46, { s: 0.8 }) + R(32, 62, 96, 34, 4, '#e2a56a') + R(28, 56, 104, 12, 3, '#f0bd85') +
    P('M118 52 L150 20 L156 26 L126 58Z', '#f0bd85') + S('M80 30 V48 M74 42 L80 49 L86 42', 3.5, '#ff8f2e'));
  add('m3_correr', 'room', sneaker(76, 70, { s: 1.4, loose: true }) + motion('M10 54 H34 M6 66 H28 M14 78 H34') +
    G(132, 30, C(0, 0, 14, '#ff6b6b') + S('M0 -7 V3', 4, '#ffffff') + C(0, 8, 2, '#ffffff', false)));

  /* Missão 4 — Preparando um sanduíche */
  add('m4_fatias', 'kitchen', board(20, 88) + bread(56, 70, 1) + bread(106, 70, 1) + hand(132, 40, 210, { sleeve: '#ff7a59' }));
  add('m4_recheio', 'kitchen', board(20, 88) + bread(80, 66, 1.35) + cheese(78, 64, 0.95) + lettuce(80, 60, 0.9) + tomato(70, 58, 0.8) +
    tomato(118, 28, 0.85) + hand(130, 26, 230, { sleeve: '#ff7a59' }) + S('M100 36 L92 44', 3, '#ff8f2e'));
  add('m4_fechar', 'kitchen', plate(80, 96, 1) + sandwich(80, 74, 1.25) + sparkle(30, 36) + sparkle(130, 30, 0.8));

  /* Missão 5 — Plantando uma semente */
  add('m5_terra', 'garden', pot(80, 82, { soil: true }) + G(112, 36, trowel(0, 0, -120)) + hand(126, 30, -120, { sleeve: '#ffb547' }) +
    C(92, 52, 2.5, '#8a5a34', false) + C(86, 58, 2, '#8a5a34', false) + C(96, 60, 2, '#8a5a34', false));
  add('m5_semente', 'garden', pot(80, 84, { soil: true }) + seed(80, 50, 1.1) + S('M80 60 V70', 2.5, '#6b4a2f', ' stroke-dasharray="3 4"') +
    hand(80, 28, 180, { sleeve: '#ffb547' }));
  add('m5_cobrir', 'garden', pot(98, 84, { soil: true, mound: true }) + wateringCan(46, 40, 1, 25) + drop(84, 46, 0.7) + drop(92, 54, 0.7) + drop(80, 58, 0.7) + drop(96, 40, 0.6));
  add('m5_cuidar', 'garden', pot(70, 84, { soil: true }) + sprout(70, 60, 1.3) + sun(124, 30, 1.1) + calendar(126, 82, 0.8, 3) + S('M100 40 L88 50', 2.5, '#ffb300'));
  add('m5_desenterrar', 'garden', pot(70, 86, { soil: true, hole: true }) + G(70, 40, S('M0 6 Q-4 14 -2 20 M0 6 Q4 14 6 18', 2, '#e8d7b5') + seed(0, 0, 1.2)) +
    hand(70, 18, 180, { sleeve: '#ffb547' }) + G(124, 40, C(0, 0, 13, '#ffffff') + S('M-4 -4 Q-4 -9 0 -9 Q5 -9 5 -4 Q5 0 0 2 V5', 3) + C(0, 9, 1.8, K, false)));
  add('m5_armario', 'garden', R(36, 10, 88, 104, 6, '#3c3f6b') + R(42, 16, 76, 92, 3, '#262844', false) + R(124, 10, 22, 104, 4, '#4f548a') +
    pot(80, 92, { soil: true, s: 0.75 }) + sprout(80, 74, 1, true) + G(104, 32, P('M0 -8 A8 8 0 1 0 6 6 A6 6 0 1 1 0 -8Z', '#ffd54f', false)));

  /* Missão 6 — Organizando a mochila */
  const scheduleSheet = (x, y, s = 1) => {
    const cols = ['#ff6b6b', '#4f8cff', '#2fc46b', '#ffd34d', '#7a5cf0'];
    let g = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) g += R(-32 + c * 16, -12 + r * 14, 13, 10, 2, cols[(r * 2 + c) % 5], false);
    return G(x, y, R(-38, -32, 76, 70, 6, '#ffffff') + R(-38, -32, 76, 14, 5, '#2fb39b') + C(-26, -25, 3, '#ffffff', false) + C(-14, -25, 3, '#ffffff', false) +
      g + R(-34, 2, 70, 14, 4, 'none') + S('M-34 2 H36 V16 H-34Z', 3, '#ff3d57'), s);
  };
  add('m6_consultar', 'school', scheduleSheet(70, 56, 1.05) + magnifier(122, 60, 1.1, -30));
  add('m6_separar', 'school', R(20, 82, 120, 10, 3, '#c98b4f') + bookFlat(36, 72, 60, '#4f8cff') + bookFlat(40, 62, 54, '#2fc46b') + bookFlat(34, 52, 62, '#ff6b8b') +
    notebook(118, 50, 0.9, '#ffd34d', -15) + hand(132, 64, -40, { sleeve: '#2fb39b' }));
  add('m6_colocar', 'school', backpack(80, 80, { open: true }) + book(70, 30, 0.8, '#4f8cff', -12) + notebook(92, 26, 0.8, '#ff6b8b', 12) + S('M80 44 V54 M75 49 L80 55 L85 49', 3, '#ff8f2e'));
  add('m6_estojo', 'school', backpack(64, 80, { open: false }) + pencilCase(118, 56, 0.9, -20) + hand(140, 78, -40, { sleeve: '#2fb39b' }) + S('M100 70 Q90 76 86 84', 3, '#ff8f2e'));
  add('m6_conferir', 'school', backpack(54, 80, { open: false }) + clipboard(116, 58, 1, 3) + sparkle(24, 26, 0.8));

  /* Missão 7 — Salada de frutas */
  add('m7_separar', 'kitchen', apple(34, 74, 1.1) + banana(72, 74, 0.95, -10) + grapes(106, 60, 0.9) + strawberry(136, 74, 1) + orange(62, 44, 0.8) + sparkle(130, 26, 0.7));
  add('m7_lavar', 'kitchen', faucetTop(108) + stream(68, 28, 66) + colander(76, 84, 1) + apple(62, 72, 0.8) + strawberry(86, 72, 0.8) + drop(48, 64, 0.8) + drop(104, 66, 0.7) + drop(56, 50, 0.6));
  add('m7_cortar', 'kitchen', board(14, 90, 132) + banana(56, 82, 0.8, 0) + G(96, 86, E(0, 0, 6, 3.5, '#fff3b0') + E(12, 0, 6, 3.5, '#fff3b0') + E(24, 0, 6, 3.5, '#fff3b0')) +
    knife(72, 66, 20) + hand(56, 56, 110, { skin: ADULT, sleeve: '#4b4f7a', s: 1.2 }));
  add('m7_tigela', 'kitchen', bowl(80, 82, 1) + C(70, 40, 6, '#ff5a5f') + C(86, 30, 6, '#ffd84d') + C(96, 48, 5, '#8e5cf0') + S('M60 52 Q64 58 66 62 M104 54 Q100 58 98 62', 2.5, '#ff8f2e'));
  add('m7_misturar', 'kitchen', bowl(76, 84, 1) + G(108, 48, R(-4, -30, 8, 44, 4, '#c98b4f') + E(0, 18, 9, 7, '#c98b4f'), 1, 35) +
    S('M40 58 Q30 48 40 40 M112 64 Q124 54 116 44', 2.5, '#8a8fb5') + sparkle(136, 30, 0.8) + sparkle(28, 28, 0.7));
  add('m7_comer', 'kitchen', head(70, 58, { s: 1.45, mouth: 'open' }) + G(104, 76, apple(0, 0, 1.6) + C(-14, -6, 8, '#fff2dd', false), 1) + hand(118, 102, -30, { sleeve: '#ff7a59' }) +
    banana(30, 102, 0.6, 20));

  /* Missão 8 — Preparando-se para a escola */
  add('m8_acordar', 'room', windowSun(126, 30) + bed(76, 86, { blanket: '#7a5cf0', pillow: false }) + E(32, 64, 12, 6, '#ffffff') +
    G(44, 64, R(-12, -24, 24, 26, 9, '#ffd34d') + limb('M-9 -20 L-18 -42', '#ffd34d', 7) + C(-18, -44, 4.5, SKIN) + limb('M9 -20 L18 -42', '#ffd34d', 7) + C(18, -44, 4.5, SKIN) +
      head(0, -36, { s: 0.62, mouth: 'o', eyes: 'closed' })) + alarm(132, 72, 0.9));
  add('m8_higiene', 'bath', E(78, 50, 40, 44, '#cdeeff') + E(78, 50, 34, 38, '#e9f8ff', false) + head(76, 56, { s: 1.15, mouth: 'teeth' }) +
    G(102, 76, toothbrush(true), 0.75, -25) + hand(118, 86, -50, { sleeve: '#ffd34d', s: 0.9 }) + bubble(92, 72, 4) + bubble(98, 64, 3) + towel(22, 50, 0.45) + drop(140, 30, 0.8) + drop(146, 44, 0.7));
  const uniform = R(-14, -50, 28, 31, 11, '#ffffff') + P('M-8 -50 L0 -40 L8 -50Z', '#4f8cff', false) + G(6, -34, P('M0 -4 L1.2 -1.2 L4 -1 L1.8 1 L2.5 4 L0 2.4 L-2.5 4 L-1.8 1 L-4 -1 L-1.2 -1.2Z', '#ff8f2e', false));
  add('m8_vestir', 'room', kid(70, 108, { shirt: '#ffffff', chest: uniform, pants: '#3d63c9', armL: 'M-12 -44 L-22 -30', armR: 'M12 -44 L24 -54', mouth: 'smile' }) +
    G(126, 40, S('M0 -18 V-12 M-18 4 L0 -12 L18 4 Z', 3) + S('M-18 4 H18', 3)) + sparkle(130, 80, 0.8));
  add('m8_cafe', 'kitchen', head(80, 52, { s: 1.15, mouth: 'chew' }) + R(10, 80, 140, 12, 5, '#e2a56a') + mug(40, 70, 1) + plate(86, 80, 0.45) +
    G(86, 74, P('M-14 4 Q-14 -6 0 -6 Q14 -6 14 4Z', '#e9a24f')) + banana(128, 72, 0.6, 10));
  add('m8_sair', 'room', door(124, 92) + kid(66, 106, {
    legs: 'walk', shirt: '#ffffff', chest: uniform, pants: '#3d63c9',
    back: R(-20, -54, 40, 36, 12, '#ff7a59'), armR: 'M12 -44 L22 -30', mouth: 'smile'
  }) + S('M20 70 H34 M16 80 H30', 2.5, '#8a8fb5'));

  /* Missão 9 — Construindo uma torre */
  add('m9_separar', 'room', block(14, 70, 30, 20, '#ff6b6b') + block(14, 50, 30, 20, '#ff6b6b') + block(62, 72, 22, 18, '#4f8cff') + block(62, 54, 22, 18, '#4f8cff') +
    block(104, 76, 14, 14, '#2fc46b') + block(122, 76, 14, 14, '#2fc46b') + block(113, 62, 14, 14, '#2fc46b') + sparkle(80, 28, 0.8));
  add('m9_base', 'room', R(30, 76, 100, 12, 4, '#c98b4f') + R(24, 88, 112, 6, 3, '#a8703a') + G(80, 64, R(-24, -6, 48, 12, 4, '#ffd34d') + R(-6, -3, 12, 6, 3, '#9be37a') + S('M0 -3 V3', 1.5)) +
    sparkle(132, 40, 1.1) + sparkle(30, 44, 0.7));
  add('m9_maiores', 'room', R(26, 92, 108, 8, 3, '#c98b4f') + block(30, 70, 34, 22, '#ff6b6b') + block(66, 70, 34, 22, '#ff6b6b') +
    G(118, 36, block(-17, -11, 34, 22, '#ff6b6b')) + hand(138, 40, -70, { sleeve: '#2fb39b' }) + S('M114 58 Q110 64 106 66', 3, '#ff8f2e'));
  add('m9_menores', 'room', R(26, 98, 108, 8, 3, '#c98b4f') + block(34, 76, 34, 22, '#ff6b6b') + block(70, 76, 34, 22, '#ff6b6b') + block(48, 58, 22, 18, '#4f8cff') + block(72, 58, 22, 18, '#4f8cff') +
    block(64, 44, 14, 14, '#2fc46b') + G(96, 26, block(-7, -7, 14, 14, '#2fc46b')) + hand(110, 24, -70, { sleeve: '#2fb39b' }));
  add('m9_verificar', 'room', R(26, 98, 84, 8, 3, '#c98b4f') + block(30, 76, 36, 22, '#ff6b6b') + block(68, 76, 36, 22, '#ff6b6b') + block(42, 58, 26, 18, '#4f8cff') + block(68, 58, 26, 18, '#4f8cff') +
    block(52, 42, 16, 16, '#2fc46b') + block(70, 42, 16, 16, '#2fc46b') + block(61, 26, 16, 16, '#ffd34d') + magnifier(130, 54, 1.1, -25) + sparkle(30, 30, 0.8));

  /* Missão 10 — Organizando o quarto */
  add('m10_recolher', 'room', ball(28, 96, 0.8) + toyCar(132, 98, 0.8) + block(100, 88, 14, 14, '#2fc46b') +
    G(70, 80, P('M-30 -14 H30 L24 18 H-24Z', '#e2a56a') + S('M-24 -4 H24 M-26 6 H26', 2, '#c98b4f') + S('M-22 -14 Q0 -44 22 -14', 4)) +
    teddy(70, 58, 0.55) + hand(118, 54, -60, { sleeve: '#ffb547' }) + G(104, 50, block(-6, -6, 12, 12, '#ffd34d')));
  add('m10_guardar', 'room', bookshelf(122, 52, 0.75, 4) + toyBox(58, 88, 1, true, true) + hand(30, 50, 40, { sleeve: '#ffb547' }) + G(40, 38, toyCar(0, 0, 0.6, 20)));
  add('m10_livros', 'room', bookshelf(70, 66, 1.05, 4) + G(126, 40, book(0, 0, 0.85, '#7a5cf0', -15)) + hand(142, 58, -45, { sleeve: '#ffb547' }) + S('M114 34 Q104 30 100 36', 3, '#ff8f2e'));
  add('m10_cama', 'room', bed(82, 82, { blanket: '#2fb39b' }) + hand(110, 58, -100, { open: true, sleeve: '#ffb547' }) + sparkle(34, 30, 0.9) + sparkle(130, 26, 0.7));
  add('m10_conferir', 'room', bed(54, 92, { blanket: '#2fb39b', s: 0.6 }) + toyBox(48, 62, 0.45, false, false) + bookshelf(86, 52, 0.45, 5) + clipboard(132, 64, 0.9, 3) + sparkle(20, 22, 0.8));
  add('m10_espalhar', 'room', G(80, 96, R(-26, -14, 52, 28, 5, '#ffb547'), 1, 25) + ball(36, 40, 0.8) + teddy(110, 44, 0.55) + toyCar(132, 84, 0.7, -20) + block(54, 20, 14, 14, '#2fc46b') +
    block(28, 76, 14, 14, '#ff6b6b') + motion('M60 54 L48 44 M96 56 L104 50 M98 76 L116 80'));
  add('m10_pular', 'room', bed(80, 96, { messy: true, blanket: '#7a5cf0' }) + kid(84, 66, { legs: 'jump', armL: 'M-12 -44 L-22 -58', armR: 'M12 -44 L22 -58', mouth: 'open', shirt: '#ffb547', s: 0.85 }) +
    motion('M50 70 V56 M118 70 V56'));

  /* Missão 11 — O robô precisa de ajuda (sanduíche) */
  add('m11_lavar', 'bath', sink(true) + hand(60, 74, 32, { open: true }) + hand(98, 76, -32, { open: true }) + bubble(54, 50, 5) + bubble(110, 48, 5.5) + bubble(84, 64, 3.5) + bubble(46, 62, 3));
  add('m11_fechar', 'kitchen', board(20, 92) + sandwich(80, 80, 1.1, true) + G(80, 40, P('M-36 0 Q-38 -20 0 -20 Q38 -20 36 0 Z', '#e9a24f')) + hand(124, 30, 240, { sleeve: '#ff7a59' }) +
    S('M80 52 V60 M75 56 L80 61 L85 56', 3, '#ff8f2e'));
  add('m11_prato', 'kitchen', plate(70, 96, 0.95) + sandwich(70, 76, 1.05) + glass(132, 74, 0.9, 0.7) + sparkle(28, 36, 0.9) + sparkle(110, 30, 0.7));

  /* Missão 12 — Suco de laranja */
  add('m12_lavar', 'kitchen', faucetTop(108) + stream(68, 28, 66) + colander(76, 86, 1) + orange(64, 72, 0.75) + orange(88, 72, 0.75) + drop(48, 64, 0.8) + drop(104, 66, 0.7));
  add('m12_cortar', 'kitchen', board(14, 90, 132) + orangeHalf(46, 80, 0.85) + orangeHalf(78, 80, 0.85) + knife(100, 64, 15) + hand(84, 52, 105, { skin: ADULT, sleeve: '#4b4f7a', s: 1.15 }));
  add('m12_espremer', 'kitchen', G(78, 86, E(0, 6, 38, 10, '#ffffff') + P('M-14 4 Q0 -24 14 4Z', '#ffffff') + E(0, 8, 26, 5, '#ffd27a', false)) +
    G(78, 52, orangeHalf(0, 0, 1, 180)) + hand(78, 24, 180, { sleeve: '#ff7a59' }) + drop(48, 82, 0.7, '#ffb547') + drop(110, 80, 0.7, '#ffb547'));
  add('m12_coar', 'kitchen', glass(70, 82, 1.2, 0.55) + G(70, 50, P('M-20 -4 H20 Q18 14 0 16 Q-18 14 -20 -4Z', '#e9eef5') + S('M-16 2 H16 M-12 8 H12', 1.4, '#9aa6b8') + R(20, -7, 30, 6, 3, '#c4cfdc')) +
    G(106, 22, P('M-16 -10 H14 L18 14 H-16Z', 'rgba(210,240,255,.5)') + R(-14, -2, 30, 15, 2, '#ffa531', false), 1, -35) + S('M88 32 Q80 38 76 44', 4, '#ffa531'));
  add('m12_beber', 'kitchen', head(66, 56, { s: 1.4, eyes: 'happy', mouth: 'none' }) + G(104, 70, glass(0, 0, 1.2, 0.6) + S('M2 -16 L-6 -32 L-18 -34', 3, '#ff6b8b'), 1, -10) +
    hand(118, 96, -20, { sleeve: '#ff7a59' }) + sparkle(130, 26, 0.8));
  add('m12_inteira', 'kitchen', glass(76, 82, 1.3, 0) + orange(76, 48, 1.6) + G(128, 36, C(0, 0, 13, '#ffffff') + S('M-4 -4 Q-4 -9 0 -9 Q5 -9 5 -4 Q5 0 0 2 V5', 3) + C(0, 9, 1.8, K, false)));
  add('m12_plantar', 'garden', soilBed(30, 92, 100, false) + G(80, 88, S('M0 0 V-34', 5, '#a8703a') + C(0, -42, 16, '#53c46c') + C(-12, -34, 10, '#53c46c') + C(12, -34, 10, '#53c46c') + C(6, -36, 3, '#ffa531')) +
    trowel(30, 70, -30) + calendar(132, 40, 0.8, 6));

  /* Missão 13 — A missão da horta */
  add('m13_espaco', 'garden', fence(54) + P('M14 96 Q80 86 146 96 V112 H14Z', '#b98a5a', false) + rake(94, 74, 25) + stone(36, 100) + stone(48, 104, 0.8) + G(130, 100, S('M0 0 L-4 -10 M0 0 L4 -12 M0 0 V-14', 2.5, '#3f9d3a')));
  add('m13_materiais', 'garden', R(10, 96, 140, 14, 4, '#e2a56a', false) + G(28, 74, trowel(0, 0, -15)) + wateringCan(70, 82, 0.9) + glove(112, 82, 0.9, 10) + seedPacket(140, 76, 0.85, 8));
  add('m13_terra', 'garden', soilBed(14, 90, 132) + G(96, 56, R(-3, -30, 6, 40, 3, '#b07a45') + P('M-12 10 H12 V16 H-12Z', '#c4cfdc') + S('M-10 16 V28 M-3 16 V28 M4 16 V28 M10 16 V28', 3), 1, -15) +
    hand(104, 26, 165, { sleeve: '#ffb547' }) + C(50, 88, 2.5, '#6b4224', false) + C(62, 84, 2, '#6b4224', false) + C(76, 86, 2, '#6b4224', false));
  add('m13_plantar', 'garden', soilBed(14, 90, 132) + E(46, 92, 6, 2.5, '#3e2414', false) + E(80, 90, 6, 2.5, '#3e2414', false) + E(114, 92, 6, 2.5, '#3e2414', false) +
    seed(80, 72, 0.8) + hand(80, 46, 180, { sleeve: '#ffb547' }) + seedPacket(130, 52, 0.75, 15));
  add('m13_regar', 'garden', soilBed(14, 92, 132) + wateringCan(64, 42, 1.05, 25) + drop(102, 52, 0.7) + drop(110, 64, 0.7) + drop(96, 70, 0.7) + drop(118, 76, 0.6) + drop(104, 82, 0.6));
  add('m13_acompanhar', 'garden', soilBed(14, 94, 132) + sprout(40, 92, 0.6) + sprout(74, 92, 0.9) + sprout(108, 92, 1.25) + magnifier(134, 46, 1, -20) + calendar(34, 40, 0.75, 4));

  /* Missão 14 — Duas maneiras de resolver */
  add('m14_estojo', 'school', R(14, 90, 132, 10, 3, '#c98b4f') + G(46, 72, R(-14, -12, 28, 24, 5, '#2fb39b') + C(0, 0, 5, '#1f7d6c')) + pencil(80, 62, 1, 180, '#ff6b6b') +
    S('M30 86 Q34 80 38 86 M54 86 Q58 80 62 86', 2.5, '#e2a56a') + pencilCase(116, 74, 0.85));
  add('m14_garrafa', 'kitchen', faucetTop(104, 40) + stream(70, 28, 56) + bottle(70, 76, 1.2, 0, 0.6) + drop(50, 70, 0.7) + drop(94, 66, 0.6));
  add('m14_mochila', 'school', backpack(80, 84, { open: true }) + book(44, 30, 0.7, '#4f8cff', -15) + pencilCase(84, 22, 0.6, 0) + bottle(122, 32, 0.7, 15) +
    S('M54 46 L64 56 M84 36 V48 M112 48 L100 58', 3, '#ff8f2e'));
  add('m14_fechar', 'school', kid(80, 108, { shirt: '#ffffff', chest: uniform, pants: '#3d63c9', back: R(-22, -56, 44, 40, 14, '#ff7a59'),
    front: S('M-11 -48 V-24 M11 -48 V-24', 4, '#c25e08'), mouth: 'smile', armR: 'M12 -44 L22 -28' }) + sparkle(128, 40, 1.1) + sparkle(34, 56, 0.7));

  /* Missão 15 — O grande desafio da lógica */
  add('x_destino', 'trail', map(76, 64, 1.25, -4) + magnifier(134, 82, 0.9, -30));
  add('x_tempo', 'room', tv(80, 56, 1.15, G(-6, -4, sun(0, 0, 0.5) + P('M2 6 Q2 -2 10 -2 Q14 -8 20 -4 Q26 -4 26 4 Q26 10 18 10 H6 Q2 10 2 6Z', '#ffffff')) +
    drop(14, 14, 0.4) + drop(22, 15, 0.4)) + G(138, 40, R(-4, -18, 8, 30, 4, '#ffffff') + C(0, 14, 7, '#ff6b6b') + R(-1.5, -6, 3, 18, 1.5, '#ff6b6b', false)));
  add('x_mochila', 'trail', backpack(80, 88, { open: true, col: '#2fb39b' }) + bottle(44, 36, 0.7, -20) + G(82, 30, sandwich(0, 0, 0.45)) + raincoat(120, 36, 0.7, 15) +
    S('M54 52 L64 62 M82 42 V54 M110 54 L100 64', 3, '#ff8f2e'));
  add('x_protetor', 'trail', head(70, 62, { s: 1.35, cap: '#ff6b6b' }) + S('M48 70 l6 -2 M90 70 l6 -2 M66 82 l8 0', 3, '#ffffff') + sunscreen(126, 76, 1, 15) + sun(132, 22, 0.8));
  add('x_trilha', 'trail', tree(20, 70, 0.9) + tree(146, 66, 1) + P('M40 120 Q70 90 90 80 Q110 70 150 72 L150 80 Q112 80 96 90 Q78 102 70 120Z', '#e8d2a0', false) +
    adult(108, 96, { s: 0.75, shirt: '#2fb39b' }) + kid(74, 108, { s: 0.75, legs: 'walk', back: R(-20, -54, 40, 34, 12, '#ff7a59'), cap: '#ff6b6b', armR: 'M12 -44 L24 -42' }) +
    G(96, 76, map(0, 0, 0.3)));
  add('x_chegar', 'trail', tree(18, 72, 0.9) + tree(144, 70, 0.9) + signPost(52, 96) + campfire(104, 100, 1) + G(120, 52, P('M0 -14 V10 M0 -14 L16 -8 L0 -2', '#ff6b6b')) + sparkle(84, 34, 0.8));
  add('x_videogame', 'room', tv(84, 48, 1, G(0, -2, C(-8, 0, 6, '#ff6b6b', false) + P('M4 -6 L14 0 L4 6Z', '#2fc46b', false))) + controller(70, 96, 0.9) + S('M70 84 Q90 70 112 82', 2.5));
  add('x_lugar', 'trail', E(80, 100, 56, 12, '#d9c48a', false) + stone(118, 72, 1) + G(132, 62, S('M-8 0 L8 -6', 4, '#a8703a')) + hand(122, 50, -40, { sleeve: '#2fb39b' }) + sparkle(40, 52, 1.1) + sparkle(60, 80, 0.6));
  add('x_lona', 'trail', P('M22 98 L66 78 L140 86 L100 110Z', '#ff8f2e') + S('M44 88 L120 98 M66 78 L100 110', 2.5, '#ffb547') + hand(32, 82, 40, { sleeve: '#2fb39b' }) + hand(140, 78, -40, { sleeve: '#2fb39b' }));
  add('x_varetas', 'trail', P('M30 104 Q80 60 130 104Z', '#ffb547') + S('M30 104 Q80 30 130 104', 4, '#4a5070') + S('M48 104 Q80 46 112 104', 4, '#4a5070') +
    hand(80, 34, 180, { sleeve: '#2fb39b' }) + S('M136 60 V44 M130 50 L136 43 L142 50', 3, '#ff8f2e'));
  add('x_estacas', 'trail', tent(78, 84, 1.05) + R(126, 92, 6, 16, 2, '#a8703a') + S('M126 104 L102 102', 2.5) + mallet(140, 64, -40) + S('M118 82 l4 -4 M134 82 l-2 -6', 2.5, '#ffb300'));
  add('x_saco', 'trail', tent(80, 82, 1.15, { stakes: true, inside: G(0, 8, sleepingBag(0, 0, 0.45)) }) + G(130, 92, R(-6, -10, 12, 18, 4, '#ffd34d') + R(-4, -14, 8, 4, 2, '#4a5070')) + sparkle(130, 28, 0.8));
  add('x_lixo', 'trail', trashBag(110, 86, 1.25) + can(56, 96, 0.9, 70) + G(40, 92, bottle(0, 0, 0.6, -80, 0)) + hand(76, 64, 150, { sleeve: '#2fb39b' }) + G(74, 82, can(0, 0, 0.8, 20)));
  add('x_desmontar', 'trail', P('M30 102 Q60 80 80 88 Q104 78 132 102Z', '#ff8f2e') + S('M40 76 L110 60', 4, '#4a5070') + S('M44 84 L118 70', 4, '#4a5070') + hand(122, 56, -60, { sleeve: '#2fb39b' }) + R(18, 100, 6, 14, 2, '#a8703a') + R(30, 104, 6, 12, 2, '#a8703a'));
  add('x_guardar', 'trail', backpack(56, 88, { open: true, col: '#2fb39b' }) + G(110, 52, R(-26, -12, 52, 24, 12, '#ff8f2e') + S('M-12 -12 V12 M8 -12 V12', 2.5, '#ffb547'), 1, -25) +
    S('M90 74 Q80 76 74 70', 3, '#ff8f2e'));
  add('x_voltar', 'trail', G(136, 66, P('M-14 0 L0 -14 L14 0 V14 H-14Z', '#ffffff') + P('M-18 2 L0 -18 L18 2', '#ff6b6b') + R(-4, 4, 8, 10, 1, '#a8703a')) +
    P('M10 120 Q40 96 80 88 Q110 80 130 80 L134 86 Q112 88 90 96 Q60 108 46 120Z', '#e8d2a0', false) + tree(24, 66, 0.8) +
    kid(56, 108, { s: 0.72, legs: 'walk', back: R(-20, -54, 40, 34, 12, '#2fb39b'), cap: '#ff6b6b' }) + adult(92, 98, { s: 0.7 }));

  /* ---------------- Saída ---------------- */
  function svg(id, extraClass) {
    const a = A[id];
    if (!a) return '';
    return `<svg class="art ${extraClass || ''}" viewBox="0 0 160 120" role="img" aria-hidden="true" focusable="false">${BG[a.bg]}${a.svg}</svg>`;
  }

  const api = { svg, has: (id) => !!A[id], ids: () => Object.keys(A), parts: { sparkle, check, G, C, P, S, R, E, sun, tree, head } };
  root.OQVP = root.OQVP || {};
  root.OQVP.art = api;
})(typeof window !== 'undefined' ? window : globalThis);
