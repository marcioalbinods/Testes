/* COLEÇÃO 9 — REIS, RAINHAS E HERÓIS (contos e imaginação) */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const FEET = { kid: 262, adult: 345 };
  const at = (o, x, ground, s, flip) => P.put(o, x, ground - (o.age ? FEET.adult : FEET.kid) * s, s, flip);
  const crown = (rx, ry, big) => {
    const k = big || 1;
    let t = A.poly([[-rx * 0.85, -ry * 0.8], [-rx * 0.95, -ry * (1.5 * k)], [-rx * 0.5, -ry * 1.12], [-rx * 0.25, -ry * (1.65 * k)], [0, -ry * 1.15], [rx * 0.25, -ry * (1.65 * k)], [rx * 0.5, -ry * 1.12], [rx * 0.95, -ry * (1.5 * k)], [rx * 0.85, -ry * 0.8]]);
    t += A.rect(-rx * 0.9, -ry * 0.95, rx * 1.8, ry * 0.24, 4);
    [-0.6, -0.2, 0.2, 0.6].forEach((u, i) => { t += i % 2 ? A.ell(u * rx, -ry * 0.83, rx * 0.08, ry * 0.07) : A.poly(A.ngonPts(u * rx, -ry * 0.83, rx * 0.09, 4, 0)); });
    [[-0.95, 1.5], [-0.25, 1.65], [0.25, 1.65], [0.95, 1.5]].forEach(([u, v]) => { t += A.circ(u * rx, -ry * v * k, rx * 0.08); });
    return t;
  };
  const castle = (x, y, s) => A.G(x, y, s, () => {
    let t = A.rect(-120, -140, 240, 140, 2);
    [[-160, 60], [100, 60]].forEach(([tx, w]) => { t += A.rect(tx, -200, w, 200, 2) + A.poly([[tx - 10, -200], [tx + w / 2, -280], [tx + w + 10, -200]]) + A.rect(tx + w / 2 - 2, -310, 4, 32, 1) + A.poly([[tx + w / 2 + 2, -310], [tx + w / 2 + 30, -300], [tx + w / 2 + 2, -290]]) + A.rect(tx + 18, -160, 24, 34, 10); });
    for (let i = 0; i < 6; i++) t += A.rect(-120 + i * 42, -158, 26, 20, 2);
    t += R('M-30,0L-30,-60Q0,-90 30,-60L30,0Z') + A.L('M0,-80L0,0', 2) + A.rect(-80, -110, 30, 40, 12) + A.rect(50, -110, 30, 40, 12);
    for (let i = 0; i < 4; i++) t += A.Lt(`M-120,${-30 - i * 28}L-40,${-30 - i * 28}M40,${-30 - i * 28}L120,${-30 - i * 28}`, 0.4);
    return t;
  });
  const cape = (adult, len) => {
    const sy = 51, sw = adult ? 48 : 40, wy = sy + (adult ? 125 : 88), L2 = len || (adult ? 230 : 170);
    return R(`M${-sw + 6},${sy}L${-sw - 60},${sy + L2}Q0,${sy + L2 + 30} ${sw + 60},${sy + L2}L${sw - 6},${sy}Z`) + A.Lt(`M${-sw - 20},${sy + L2 * 0.5}L${-sw - 40},${sy + L2}M${sw + 20},${sy + L2 * 0.5}L${sw + 40},${sy + L2}`, 0.5);
  };
  const mask = (rx, ry) => {
    const ex = 0.38 * rx, ey = 0.04 * ry;
    return A.R(A.smoothD([[-rx * 0.98, ey - 4], [-rx * 0.7, ey - ry * 0.3], [0, ey - ry * 0.2], [rx * 0.7, ey - ry * 0.3], [rx * 0.98, ey - 4], [rx * 0.7, ey + ry * 0.28], [0, ey + ry * 0.1], [-rx * 0.7, ey + ry * 0.28]], true, 0.16) + A.dEll(-ex, ey, rx * 0.26, ry * 0.15) + A.dEll(ex, ey, rx * 0.26, ry * 0.15), '', ' fill-rule="evenodd"');
  };
  const emblem = ({ sy }) => A.circ(0, sy + 46, 26) + A.star(0, sy + 46, 20, 9, 5, 0) + A.rect(-40, sy + 90, 80, 14, 0);
  const starsBg = (n, sd) => { O.seed(sd); let s = ''; for (let i = 0; i < n; i++) s += A.star(30 + ((i * 137) % 540), 30 + ((i * 89) % 260), 8 + (i % 3) * 4, 4 + (i % 3) * 2, 5, i * 9); return s; };

  // 1. Rainha
  AA.add(9, 1, 'A rainha', () => {
    let s = O.wallpaper(4, 596, 'diamond') + A.R(`M80,600L80,200Q80,60 300,40Q520,60 520,200L520,600Z`);
    s += O.clip('M80,600L80,200Q80,60 300,40Q520,60 520,200L520,600Z', O.rays(300, 260, 30, 500, 0));
    s += A.G(300, 250, 1.4, () => P.bust({ hair: 'afro', afroSize: 0.85, rx: 46, ry: 57, narrow: 0.14, nose: 'broad', mouth: 'lips', lipFull: 1.15, lashes: true, earrings: 'big', necklace: true, neckline: 'v', shoulder: 2.4, bottom: (604 - 250) / 1.4,
      deco: (rx, ry, sy) => { let t = A.rect(-200, sy + 110, 400, 20, 0); for (let i = -5; i <= 5; i++) t += A.poly(A.ngonPts(i * 30, sy + 120, 9, 4, 0)) + A.circ(i * 30 + 15, sy + 160, 7); return t; },
      headTop: (rx, ry) => A.G(0, -ry * 0.62, 1, () => crown(rx * 1.1, ry * 1.0, 1.15)) }));
    return s;
  });

  // 2. Rei com manto
  AA.add(9, 2, 'O rei', () => {
    let s = O.wallpaper(4, 460, 'stripes') + O.planks(460);
    // trono
    s += R('M150,470L150,130Q300,40 450,130L450,470Z') + R('M180,450L180,160Q300,90 420,160L420,450Z') + A.circ(300, 120, 22) + A.star(300, 120, 14, 6, 5, 0);
    s += A.rect(120, 420, 360, 50, 10) + A.rect(130, 470, 30, 100, 6) + A.rect(440, 470, 30, 100, 6);
    s += O.rug(300, 560, 250, 36);
    const r = at({ age: 'adult', hair: 'short', beard: 'full', rx: 43, ry: 54, jaw: 0.85, nose: 'broad', mouth: 'smile', lower: 'pants', sleeve: 'long', print: 'band', headTop: (rx, ry) => crown(rx, ry), behindBody: cape(true, 250), arms: { l: [20, -20], r: [40, 60] } }, 300, 560, 0.92);
    s += r.svg;
    s += R(A.ribbonD([[r.hands.r[0], r.hands.r[1] + 60], [r.hands.r[0] + 10, r.hands.r[1] - 120]], 10, 10, true, true)) + A.circ(r.hands.r[0] + 10, r.hands.r[1] - 130, 18) + A.star(r.hands.r[0] + 10, r.hands.r[1] - 130, 11, 5, 5, 0) + P.fist(r.hands.r[0], r.hands.r[1], 12);
    return s;
  });

  // 3. Princesa e o castelo
  AA.add(9, 3, 'Princesa do castelo', () => {
    let s = O.cloudRich(110, 70, 130) + O.sunRich(520, 70, 28) + O.rainbowArc(300, 380, 280, 4, 18);
    s += castle(300, 390, 1.05);
    s += O.ground(390) + O.path(300, 600, 130, 40, 390) + O.meadow(400, 20, 200, 6, 201) + O.meadow(400, 400, 580, 6, 203);
    s += at({ hair: 'boxbraids', nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, edges: true, lower: 'dress', skirtLen: 90, print: 'diamond', headTop: (rx, ry) => crown(rx * 0.7, ry * 0.7, 0.9), arms: { l: [30, 20], r: [140, 160] } }, 150, 595, 0.72).svg;
    s += O.butterfly(470, 470, 0.55, 15) + O.bushRich(500, 560, 120);
    return s;
  });

  // 4. Super-heroína voando
  AA.add(9, 4, 'Super-heroína', () => {
    let s = O.cloudRich(110, 80, 130) + O.cloudRich(480, 150, 120) + O.sunRich(520, 60, 26);
    // cidade
    let city = '';
    [[20, 380, 70], [100, 320, 80], [190, 400, 60], [260, 300, 90], [360, 360, 70], [440, 280, 80], [530, 350, 66]].forEach(([x, y, w]) => {
      city += A.rect(x, y, w, 600 - y, 2);
      for (let r = y + 20; r < 560; r += 40) for (let c = x + 12; c < x + w - 16; c += 24) city += A.rect(c, r, 12, 18, 2);
    });
    s += O.clipCanvas(city);
    s += A.G(300, 220, 0.85, () => P.figure({ hair: 'puff1', nose: 'wide', mouth: 'grin', lashes: true, edges: true, lower: 'skirt', skirtLen: 40, pantsUnder: true, sleeve: 'long', topDeco: emblem, headTop: mask, behindBody: cape(false, 200), arms: { l: [170, 180], r: [100, 70] }, legs: { l: [10, 0], r: [20, 30] } }).svg, { rot: -70 });
    s += L('M90,330l-50,10M100,360l-60,30M110,300l-50,-6', 3);
    return s;
  });

  // 5. Super-herói com capa
  AA.add(9, 5, 'Super-herói', () => {
    let s = O.rays(300, 260, 32, 600, 0);
    s += A.circ(300, 300, 200);
    s += O.ground(520) + O.zigzagBand(530, 18);
    s += at({ hair: 'hightop', nose: 'broad', mouth: 'grin', lower: 'pants', sleeve: 'long', topDeco: emblem, headTop: mask, belt: true, behindBody: cape(false, 190), arms: { l: [40, -60], r: [40, -60] }, legs: { l: [12, 2], r: [12, 2] } }, 300, 560, 1.05).svg;
    s += O.confetti([[70, 80, 's', 16], [530, 80, 's', 16], [80, 440, 'p', 14], [520, 440, 'p', 14]]);
    return s;
  });

  // 6. Sereia
  AA.add(9, 6, 'Sereia', () => {
    let s = '';
    for (let i = 0; i < 5; i++) { let d = `M4,${70 + i * 110}`; for (let x = 4; x < 600; x += 60) d += 'q15,-12 30,0t30,0'; s += L(d, 2); }
    // corais e algas
    s += R('M40,600Q30,500 60,440Q70,500 80,600Z') + R('M80,600Q100,480 130,470Q120,540 110,600Z') + R('M480,600L490,520L470,480L496,500L506,440L520,500L546,470L526,530L536,600Z');
    s += A.ell(300, 590, 300, 40);
    const m = P.put({ hair: 'afro', afroSize: 0.95, nose: 'wide', mouth: 'grin', lashes: true, edges: true, lower: 'shorts', sleeve: 'none', print: 'pocket', topDeco: ({ sy, ww }) => A.R(`M-60,${sy + 70}Q0,${sy + 40} 60,${sy + 70}L60,400L-60,400Z`) + A.circ(-16, sy + 40, 14) + A.circ(16, sy + 40, 14), earrings: 'stud', arms: { l: [120, 150], r: [60, -40] } }, 300, 170, 0.95);
    s += m.svg;
    // cauda com escamas
    const tl = 'M262,300L338,300Q350,400 330,450Q310,500 360,530L330,550Q280,520 270,460Q250,400 262,300Z';
    s += R(tl);
    s += O.clip(tl, (() => { let t = ''; for (let r = 0; r < 10; r++) for (let c = 0; c < 6; c++) t += R(`M${250 + c * 20 + (r % 2) * 10},${300 + r * 24}a10,10 0 0,0 20,0Z`); return t; })());
    s += R('M330,548Q380,520 420,560Q380,560 360,590Q340,570 330,548Z') + R('M330,548Q290,560 270,600Q310,590 336,570Z');
    [[120, 200], [470, 250], [520, 120]].forEach(([x, y], i) => { s += A.G(x, y, 0.5, () => R('M-40,0Q0,-30 40,0Q0,30 -40,0Z') + R('M-38,0L-60,-16L-60,16Z') + A.dot(24, -4, 4), { flip: i % 2 === 0 }); });
    [[180, 110], [420, 380], [100, 380]].forEach(([x, y]) => { s += A.circ(x, y, 12) + A.circ(x + 12, y - 22, 8); });
    s += A.star(200, 560, 20, 9, 5, 10) + A.R('M420,560a24,24 0 0,1 48,0Z') + A.Lt('M444,536l0,24M430,542l8,18M458,542l-8,18', 0.6);
    return s;
  });

  // 7. Contadora de histórias sob o baobá
  AA.add(9, 7, 'A contadora de histórias', () => {
    let s = O.sunRich(520, 60, 28) + O.cloudRich(120, 60, 120);
    s += O.hills(380, 10);
    // baobá grande
    s += R('M220,420Q240,330 236,250Q200,220 170,190L184,180Q214,206 240,218L236,150L262,148L266,214Q300,180 330,160L344,172Q300,210 280,250Q276,330 300,420Z');
    s += R(A.cloudD(150, 160, 70, 40, 9, 0.4, 0)) + R(A.cloudD(250, 120, 80, 46, 10, 0.4, 0.3)) + R(A.cloudD(360, 150, 70, 40, 9, 0.4, 0.1));
    s += A.Lt('M250,300q6,-20 0,-40M270,360q-6,-20 0,-40', 0.6);
    s += O.ground(420) + O.meadow(425, 380, 590, 7, 205);
    const g = at({ age: 'elder', elder: true, hair: 'turban', rx: 42, ry: 52, nose: 'broad', mouth: 'open', earrings: 'big', lower: 'dress', print: 'band', sleeve: 'long', arms: { l: [60, 120], r: [90, 140] } }, 440, 560, 0.62);
    s += g.svg;
    [[110, 'puffs'], [200, 'short'], [290, 'beads']].forEach(([x, h], i) => { s += P.put({ hair: h, puffSize: 0.75, nose: i % 2 ? 'broad' : 'round', mouth: 'grin', look: 1, lashes: i !== 1, lower: 'shorts', print: 'auto', arms: { l: [20, -60], r: [20, -60] } }, x, 470, 0.55).svg; });
    s += A.rect(40, 520, 340, 76, 14) + A.Lt('M60,540l300,0M60,560l300,0', 0.5);
    s += A.L('M400,330q20,-30 50,-20M380,300q30,-40 70,-30', 2.4);
    s += A.star(380, 230, 12, 5, 5, 0) + A.heart(420, 210, 10) + A.star(460, 250, 9, 4, 5, 20);
    return s;
  });

  // 8. Dragão amigo
  AA.add(9, 8, 'O dragão amigo', () => {
    let s = O.cloudRich(110, 70, 130) + O.cloudRich(470, 60, 120) + O.hills(420, 16) + O.meadow(450, 20, 580, 12, 207);
    s += A.G(370, 330, 1.0, () => {
      let t = '';
      // cauda com espinhos
      t += R('M60,140Q180,160 200,60Q206,30 190,10Q200,50 170,90Q140,130 60,110Z');
      for (let i = 0; i < 4; i++) t += A.poly([[110 + i * 22, 132 - i * 12], [120 + i * 24, 108 - i * 18], [128 + i * 22, 128 - i * 14]]);
      // asa
      t += R('M10,-20L120,-150L130,-90L170,-110L150,-40L180,-40L100,20Z') + A.Lt('M120,-150L60,0M170,-110L80,10M180,-40L90,20', 0.6);
      // corpo e barriga
      t += A.ell(0, 60, 110, 100) + R('M-60,10Q0,-10 40,20Q60,90 20,150Q-30,160 -70,120Q-90,60 -60,10Z');
      for (let i = 0; i < 5; i++) t += A.Lt(`M${-70 + i * 4},${30 + i * 25}q${40},${10} ${80 - i * 6},0`, 0.6);
      // pernas
      t += A.ell(-60, 150, 34, 22) + A.ell(50, 150, 34, 22) + A.Lt('M-80,165l0,-8M-62,168l0,-8M30,165l0,-8M48,168l0,-8', 0.6);
      // pescoço e cabeça
      t += R('M-60,0Q-80,-60 -100,-100L-60,-120Q-40,-60 -20,-10Z');
      t += A.ell(-110, -140, 60, 46) + A.ell(-160, -125, 34, 26);
      t += A.dot(-176, -132, 4) + A.dot(-160, -134, 4) + A.L('M-182,-110q20,12 40,0', 3);
      t += A.circ(-100, -160, 16) + A.dot(-96, -160, 7) + A.W(A.dCirc(-93, -163, 2.5));
      t += A.poly([[-90, -184], [-80, -224], [-70, -180]]) + A.poly([[-120, -184], [-118, -228], [-104, -186]]);
      for (let i = 0; i < 4; i++) t += A.poly([[-60 + i * 16, -110 + i * 26], [-40 + i * 16, -120 + i * 26], [-46 + i * 16, -96 + i * 26]]);
      // fumacinha de flores
      t += A.circ(-215, -140, 12) + A.circ(-240, -150, 16) + A.flower(-270, -160, 16, 5);
      return t;
    });
    s += at({ hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'star', arms: { l: [20, 6], r: [110, 120] } }, 110, 595, 0.75).svg;
    return s;
  });

  // 9. Fada com asas
  AA.add(9, 9, 'A fada', () => {
    let s = starsBg(10, 3) + O.moon(520, 80, 30);
    s += O.ground(460) + O.meadow(470, 20, 580, 10, 209);
    const cog = (x, y, sc) => A.G(x, y, sc, () => A.rect(-14, -40, 28, 44, 6) + R('M-60,-40Q-60,-100 0,-104Q60,-100 60,-40Z') + A.circ(-30, -70, 10) + A.circ(10, -86, 8) + A.circ(30, -60, 12));
    s += cog(90, 560, 1.1) + cog(520, 580, 0.9) + cog(160, 590, 0.6);
    const wings = R('M0,80Q-120,-20 -150,60Q-130,140 -10,110Z') + R('M0,80Q120,-20 150,60Q130,140 10,110Z') + R('M0,110Q-100,140 -100,200Q-50,210 -4,130Z') + R('M0,110Q100,140 100,200Q50,210 4,130Z') + A.circ(-90, 60, 14) + A.circ(90, 60, 14) + A.circ(-60, 170, 10) + A.circ(60, 170, 10);
    const fx = at({ hair: 'puffs', puffSize: 0.85, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, edges: true, lower: 'dress', skirtLen: 80, print: 'flower', behindBody: wings, headTop: (rx, ry) => A.flower(0, -ry * 1.05, rx * 0.25, 6), arms: { l: [20, 8], r: [100, 140] } }, 300, 560, 0.95);
    s += fx.svg;
    const h = fx.hands.r;
    s += R(A.ribbonD([[h[0] - 10, h[1] + 30], [h[0] + 40, h[1] - 70]], 6, 6, true, true)) + A.star(h[0] + 46, h[1] - 84, 24, 10, 5, 10) + P.fist(h[0], h[1], 10);
    s += A.sparkle(h[0] + 90, h[1] - 120, 12) + A.sparkle(h[0] + 110, h[1] - 60, 9) + A.sparkle(h[0] + 60, h[1] - 150, 8);
    return s;
  });

  // 10. Balão de ar quente entre as estrelas
  AA.add(9, 10, 'Viagem de balão', () => {
    let s = starsBg(14, 5) + O.moon(90, 90, 34) + O.cloudRich(480, 470, 160) + O.cloudRich(110, 520, 140) + O.planet(520, 110, 30, 10);
    const bx = 300, by = 230;
    const env = `M${bx},${by - 190}C${bx + 170},${by - 190} ${bx + 170},${by + 40} ${bx + 40},${by + 130}L${bx - 40},${by + 130}C${bx - 170},${by + 40} ${bx - 170},${by - 190} ${bx},${by - 190}Z`;
    s += R(env);
    s += O.clip(env, (() => { let t = ''; for (let i = -4; i < 4; i++) t += A.R(`M${bx},${by - 200}Q${bx + i * 50},${by - 40} ${bx + i * 12},${by + 140}L${bx + (i + 1) * 12},${by + 140}Q${bx + (i + 1) * 50},${by - 40} ${bx},${by - 200}Z`); t += A.rect(bx - 200, by - 30, 400, 34, 0); for (let i = 0; i < 9; i++) t += A.poly(A.ngonPts(bx - 160 + i * 40, by - 13, 12, 4, 0)); return t; })());
    s += L(`M${bx - 40},${by + 130}L${bx - 50},${by + 190}M${bx + 40},${by + 130}L${bx + 50},${by + 190}M${bx - 14},${by + 132}L${bx - 18},${by + 190}M${bx + 14},${by + 132}L${bx + 18},${by + 190}`, 2.4);
    s += A.G(bx - 40, by + 190, 0.5, () => P.head({ hair: 'puffs', puffSize: 0.7, nose: 'round', mouth: 'grin', lashes: true })) + A.G(bx + 38, by + 186, 0.5, () => P.head({ hair: 'short', nose: 'broad', mouth: 'grin', eyes: 'happy' }));
    s += R(`M${bx - 70},${by + 200}L${bx + 70},${by + 200}L${bx + 56},${by + 270}L${bx - 56},${by + 270}Z`) + A.rect(bx - 76, by + 194, 152, 14, 5);
    s += A.Lt(`M${bx - 66},${by + 225}L${bx + 66},${by + 225}M${bx - 62},${by + 248}L${bx + 62},${by + 248}M${bx - 30},${by + 208}L${bx - 26},${by + 270}M${bx},${by + 208}L${bx},${by + 270}M${bx + 30},${by + 208}L${bx + 26},${by + 270}`, 0.5);
    return s;
  });
})(window.AA);
