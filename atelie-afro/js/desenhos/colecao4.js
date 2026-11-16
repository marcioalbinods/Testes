/* COLEÇÃO 4 — ARTE, ESTAMPAS E NATUREZA */
(function (AA) {
  'use strict';
  const A = AA.A, O = AA.O, f = A.f, R = A.R, L = A.L;
  const D2R = Math.PI / 180;
  const polar = (cx, cy, r, deg) => [cx + Math.cos(deg * D2R) * r, cy + Math.sin(deg * D2R) * r];

  // anel de pétalas
  const petalRing = (cx, cy, n, r0, len, w, off) => {
    let s = '';
    for (let i = 0; i < n; i++) s += R(A.petalD(cx, cy, r0 + len, w, (i * 360) / n + (off || 0), r0));
    return s;
  };
  // anel de triângulos (dentes)
  const toothRing = (cx, cy, n, r1, r2, off) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i * 360) / n + (off || 0), b = ((i + 1) * 360) / n + (off || 0);
      s += A.poly([polar(cx, cy, r1, a), polar(cx, cy, r1, b), polar(cx, cy, r2, (a + b) / 2)]);
    }
    return s;
  };
  // anel dividido em segmentos
  const segRing = (cx, cy, n, r1, r2, off) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i * 360) / n + (off || 0), b = ((i + 1) * 360) / n + (off || 0);
      const p1 = polar(cx, cy, r1, a), p2 = polar(cx, cy, r2, a), p3 = polar(cx, cy, r2, b), p4 = polar(cx, cy, r1, b);
      s += R(`M${f(p1[0])},${f(p1[1])}L${f(p2[0])},${f(p2[1])}A${r2},${r2} 0 0,1 ${f(p3[0])},${f(p3[1])}L${f(p4[0])},${f(p4[1])}A${r1},${r1} 0 0,0 ${f(p1[0])},${f(p1[1])}Z`);
    }
    return s;
  };

  // 1. Mandala geométrica
  AA.add(4, 1, 'Mandala', () => {
    const c = 300;
    let s = '';
    // cantos
    [[0, 0], [600, 0], [0, 600], [600, 600]].forEach(([x, y]) => { s += O.clipCanvas(A.circ(x, y, 110) + A.circ(x, y, 70) + A.circ(x, y, 34)); });
    s += A.circ(c, c, 282);
    s += toothRing(c, c, 36, 252, 282);
    s += A.circ(c, c, 252);
    s += petalRing(c, c, 12, 150, 100, 34, 15);
    s += petalRing(c, c, 12, 150, 66, 18, 15);
    for (let i = 0; i < 12; i++) { const p = polar(c, c, 230, i * 30 + 15 + 15); s += A.circ(p[0], p[1], 12); }
    s += A.circ(c, c, 152);
    s += segRing(c, c, 24, 124, 152, 0);
    s += A.circ(c, c, 124);
    s += toothRing(c, c, 16, 70, 124, 0);
    for (let i = 0; i < 16; i++) { const p = polar(c, c, 102, i * 22.5 + 11.25); s += A.poly(A.ngonPts(p[0], p[1], 9, 4, i * 22.5)); }
    s += A.circ(c, c, 70);
    s += petalRing(c, c, 8, 18, 50, 16, 22.5);
    s += A.circ(c, c, 22) + A.star(c, c, 15, 7, 8, 0);
    return s;
  });

  // 2. Flores e folhas em composição ornamental
  AA.add(4, 2, 'Jardim ornamental', () => {
    let s = A.rect(24, 24, 552, 552, 30) + A.rect(50, 50, 500, 500, 20);
    const sym = (fn) => fn(1) + fn(-1);
    s += sym((k) => R(A.ribbonD([[300, 520], [300 + k * 60, 420], [300 + k * 170, 380], [300 + k * 210, 260]], 10, 6, true, false)));
    s += sym((k) => A.leaf(300 + k * 60, 430, 300 + k * 150, 470, 26) + A.leaf(300 + k * 150, 380, 300 + k * 140, 300, 22) + A.leaf(300 + k * 200, 300, 300 + k * 250, 340, 18));
    s += sym((k) => A.flower(300 + k * 210, 250, 40, 7) + A.flower(300 + k * 200, 450, 26, 5) + A.flower(300 + k * 110, 150, 24, 6));
    s += R(A.ribbonD([[300, 520], [300, 280]], 12, 10, false, false));
    s += A.leaf(300, 400, 220, 340, 28) + A.leaf(300, 400, 380, 340, 28);
    // flor central em camadas
    s += petalRing(300, 210, 10, 30, 90, 30, 0) + petalRing(300, 210, 10, 26, 56, 20, 18) + A.circ(300, 210, 34) + A.circ(300, 210, 16);
    s += A.leaf(300, 540, 200, 556, 12) + A.leaf(300, 540, 400, 556, 12);
    [[90, 90], [510, 90], [90, 510], [510, 510]].forEach(([x, y]) => { s += A.flower(x, y, 20, 5); });
    return s;
  });

  // 3. Pássaros entre flores
  AA.add(4, 3, 'Pássaros e flores', () => {
    let s = O.sun(520, 80, 34, 12) + O.cloud(130, 80, 130);
    s += R(A.ribbonD([[0, 330], [150, 300], [300, 330], [460, 290], [600, 300]], 22, 14, false, false));
    s += R(A.ribbonD([[220, 318], [260, 250], [320, 220]], 10, 6, true, false)) + R(A.ribbonD([[430, 300], [480, 380], [540, 420]], 10, 6, true, false));
    [[60, 290, 120, 250], [160, 330, 200, 380], [360, 330, 400, 380], [520, 290, 560, 240], [300, 230, 330, 180]].forEach(([a, b, c, d]) => { s += A.leaf(a, b, c, d, 16); });
    [[100, 320, 26], [250, 340, 22], [330, 215, 24], [470, 330, 20], [545, 425, 24]].forEach(([x, y, r], i) => { s += A.flower(x, y, r, 5 + (i % 3)); });
    s += O.bird(170, 250, 1.0) + O.bird(430, 240, 1.0, true) + O.bird(290, 470, 0.9);
    s += R(A.ribbonD([[220, 520], [300, 510], [380, 520]], 10, 10, true, true));
    s += O.flowerStem(80, 600, 150, 26) + O.flowerStem(520, 600, 160, 28, 7);
    return s;
  });

  // 4. Elefante em composição artística
  AA.add(4, 4, 'Elefante enfeitado', () => {
    let s = O.sun(300, 110, 60, 16);
    s += O.ground(470) + O.grass(20, 470, 100) + O.grass(480, 470, 100);
    s += O.palm(80, 470, 0.8) + O.bush(520, 460, 110);
    s += A.G(310, 340, 1, () => {
      let e = '';
      // pernas de trás
      e += A.rect(70, 40, 46, 120, 18) + A.rect(-110, 40, 46, 120, 18);
      e += R(A.ribbonD([[150, -10], [180, 30], [175, 70]], 8, 5, false, false)) + R(A.cloudD(175, 78, 8, 10, 6, 0.4, 0));
      // corpo
      e += A.ell(10, -10, 160, 110);
      // manta enfeitada
      const blanket = 'M-80,-108Q20,-130 110,-100L120,40Q20,60 -90,40Z';
      e += R(blanket);
      e += O.clip(blanket, (() => {
        let t = '';
        for (let i = 0; i < 6; i++) t += A.poly([[-90 + i * 36, 40], [-72 + i * 36, 10], [-54 + i * 36, 40]]);
        t += A.rect(-100, -20, 230, 18, 0);
        for (let i = 0; i < 5; i++) t += A.poly(A.ngonPts(-60 + i * 40, -60, 16, 4, 0));
        for (let i = 0; i < 5; i++) t += A.circ(-60 + i * 40, -60, 5);
        return t;
      })());
      // pernas da frente
      e += A.rect(-60, 50, 50, 120, 18) + A.rect(30, 50, 50, 120, 18);
      e += A.ell(-35, 166, 26, 9) + A.ell(55, 166, 26, 9);
      // cabeça e tromba
      e += R(A.ribbonD([[-170, 0], [-205, 70], [-200, 130], [-170, 150]], 50, 24, true, false));
      e += A.circ(-160, -40, 70);
      for (let i = 0; i < 4; i++) e += A.Lt(`M${-196 - i * 1},${50 + i * 22}q12,6 24,0`, 0.6);
      e += R('M-140,30Q-120,60 -100,64Q-110,40 -126,26Z');
      // orelha com estampa
      e += R(A.smoothD([[-118, -100], [-60, -112], [-36, -50], [-50, 30], [-104, 34], [-96, -30]], true, 0.18));
      e += A.circ(-72, -40, 18) + A.ring(-72, -40, 32, 18);
      e += A.dot(-185, -55, 7) + A.W(A.dCirc(-182, -58, 2.4)) + A.L('M-200,-80q14,-12 30,-6', 3);
      e += R('M-205,-110Q-160,-150 -120,-108Q-160,-124 -205,-110Z');
      return e;
    });
    s += O.butterfly(500, 280, 0.6, 15);
    return s;
  });

  // 5. Girafa com padrões geométricos
  AA.add(4, 5, 'Girafa geométrica', () => {
    let s = O.sun(90, 80, 38, 14) + O.cloud(250, 70, 130);
    s += O.ground(500);
    // acácia
    s += R('M90,500L100,330L70,290L82,284L108,316L120,270L132,272L124,330L160,300L168,310L124,350L116,500Z');
    s += R('M10,300Q40,240 120,250Q200,240 230,290Q200,320 120,310Q40,325 10,300Z');
    s += A.G(330, 80, 0.88, () => {
      const body = 'M-130,310Q-150,290 -120,270Q-40,250 60,262Q90,262 100,236L80,90Q74,70 86,62L116,60Q128,70 124,92L150,250Q160,300 110,330Q0,350 -110,340Q-140,336 -130,310Z';
      let g = '';
      // pernas
      [[-110, 330], [-70, 334], [40, 332], [80, 326]].forEach(([x, y]) => { g += A.rect(x - 13, y - 10, 26, 168, 10); g += A.rect(x - 15, y + 150, 30, 16, 5); });
      g += R(A.ribbonD([[-126, 300], [-160, 340], [-166, 390]], 7, 4, false, false)) + R(A.cloudD(-166, 398, 8, 12, 6, 0.4, 0));
      g += R(body);
      g += O.clip(body, (() => {
        let t = '';
        const spots = [[-100, 300], [-60, 290], [-20, 300], [20, 290], [60, 300], [-80, 325], [-40, 325], [0, 322], [40, 322], [100, 290], [96, 120], [104, 170], [112, 215], [-110, 278], [128, 255]];
        spots.forEach(([x, y], i) => { t += A.poly(A.ngonPts(x, y, 15, 6, i * 13)); });
        return t;
      })());
      // cabeça
      g += R('M78,70Q70,40 86,26L110,10Q150,0 168,24Q176,40 160,48L120,64Q100,80 78,70Z');
      g += A.rect(92, -14, 8, 30, 4) + A.rect(110, -16, 8, 30, 4) + A.circ(96, -16, 8) + A.circ(114, -18, 8);
      g += R('M86,30Q60,14 66,2Q84,10 94,24Z');
      g += A.dot(122, 26, 5) + A.W(A.dCirc(124, 24, 1.6)) + A.dot(160, 32, 2.4) + A.L('M142,50q8,4 16,-2', 2.6);
      return g;
    });
    s += O.grass(200, 500, 90) + O.grass(470, 500, 90);
    return s;
  });

  // 6. Composição de tecidos e estampas
  AA.add(4, 6, 'Colcha de estampas', () => {
    let s = '';
    const cells = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push([20 + c * 188, 20 + r * 188]);
    const W = 184;
    const fills = [
      // faixas com blocos (inspiração em tecelagem de faixas)
      (x, y) => { let t = ''; for (let i = 0; i < 4; i++) { t += A.rect(x, y + i * 46, W, 46, 0); for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) t += A.rect(x + j * 46 + 8, y + i * 46 + 8, 30, 30, 0); } return t; },
      // círculos concêntricos (estampa de tecido estampado)
      (x, y) => { let t = A.rect(x, y, W, W, 0); [[46, 46], [138, 46], [46, 138], [138, 138]].forEach(([a, b]) => { t += A.circ(x + a, y + b, 40) + A.circ(x + a, y + b, 26) + A.circ(x + a, y + b, 12); }); return t; },
      // zigue-zague
      (x, y) => { let t = A.rect(x, y, W, W, 0); for (let i = 0; i < 4; i++) { let d = `M${x},${y + 20 + i * 44}`; for (let j = 0; j < 4; j++) d += `l23,-16l23,16`; d += `l0,22`; for (let j = 0; j < 4; j++) d += `l-23,-16l-23,16`; t += R(d + 'Z'); } return t; },
      // losangos
      (x, y) => { let t = A.rect(x, y, W, W, 0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) t += A.poly(A.ngonPts(x + 31 + j * 61, y + 31 + i * 61, 28, 4, 0)) + A.poly(A.ngonPts(x + 31 + j * 61, y + 31 + i * 61, 12, 4, 0)); return t; },
      // flor central
      (x, y) => A.rect(x, y, W, W, 0) + petalRing(x + 92, y + 92, 8, 20, 64, 22, 0) + A.circ(x + 92, y + 92, 22) + A.circ(x + 20, y + 20, 12) + A.circ(x + 164, y + 20, 12) + A.circ(x + 20, y + 164, 12) + A.circ(x + 164, y + 164, 12),
      // marcas de pontos e cruzes (inspiração em tecidos pintados à mão)
      (x, y) => { let t = A.rect(x, y, W, W, 0); for (let i = 0; i < 3; i++) t += A.rect(x + 8, y + 10 + i * 60, W - 16, 44, 10); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) t += A.circ(x + 30 + j * 42, y + 32 + i * 60, 8); return t; },
      // triângulos
      (x, y) => { let t = ''; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const a = x + j * 46, b = y + i * 46; t += A.poly([[a, b], [a + 46, b], [a, b + 46]]) + A.poly([[a + 46, b], [a + 46, b + 46], [a, b + 46]]); } return t; },
      // sol e meias-luas
      (x, y) => { let t = A.rect(x, y, W, W, 0) + A.circ(x + 92, y + 92, 44); for (let i = 0; i < 8; i++) t += R(A.petalD(x + 92, y + 92, 88, 12, i * 45, 50)); return t; },
      // xadrez com círculos
      (x, y) => { let t = ''; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { t += A.rect(x + j * 61.3, y + i * 61.3, 61.3, 61.3, 0); if ((i + j) % 2 === 0) t += A.circ(x + j * 61.3 + 30.6, y + i * 61.3 + 30.6, 18); } return t; }
    ];
    cells.forEach(([x, y], i) => { s += O.clip(A.dRect(x, y, W, W, 0), fills[i](x, y)); s += L(A.dRect(x, y, W, W, 0)); });
    return s;
  });

  // 7. Sol, lua e estrelas
  AA.add(4, 7, 'Sol, lua e estrelas', () => {
    let s = O.clipCanvas(A.poly([[600, 0], [600, 600], [0, 600]]));
    // sol enfeitado
    s += petalRing(190, 200, 16, 92, 70, 18, 0) + toothRing(190, 200, 16, 92, 130, 11.25) + A.circ(190, 200, 92) + A.circ(190, 200, 62);
    s += A.L('M160,190q10,-10 20,0M200,190q10,-10 20,0M165,225q25,20 50,0');
    // lua com estampa
    const cr = (cx, cy, r, ox, oy, r2) => {
      // lua crescente = círculo (cx,cy,r) menos círculo (ox,oy,r2)
      const d = Math.hypot(ox - cx, oy - cy), a = (r * r - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(r * r - a * a);
      const ux = (ox - cx) / d, uy = (oy - cy) / d;
      const px = cx + ux * a, py = cy + uy * a;
      const p1 = [px - uy * h, py + ux * h], p2 = [px + uy * h, py - ux * h];
      return `M${f(p1[0])},${f(p1[1])}A${r},${r} 0 1,1 ${f(p2[0])},${f(p2[1])}A${r2},${r2} 0 0,0 ${f(p1[0])},${f(p1[1])}Z`;
    };
    const moon = cr(420, 440, 125, 480, 400, 110);
    s += R(moon);
    s += O.clip(moon, A.circ(330, 420, 16) + A.circ(340, 490, 13) + A.circ(395, 545, 14) + A.poly(A.ngonPts(360, 350, 12, 4, 0)) + A.poly(A.ngonPts(318, 455, 9, 4, 0)) + A.poly(A.ngonPts(365, 520, 10, 4, 0)));
    s += A.L('M352,452q10,8 20,0');
    [[430, 90, 30], [540, 170, 22], [520, 60, 14], [70, 420, 20], [130, 520, 28], [240, 460, 16], [560, 300, 16], [350, 160, 18], [80, 330, 12], [260, 560, 14]].forEach(([x, y, r], i) => { s += A.star(x, y, r, r * 0.45, i % 3 === 0 ? 6 : 5, i * 10); });
    return s;
  });

  // 8. Vasos com flores e elementos geométricos
  AA.add(4, 8, 'Vasos de flores', () => {
    let s = A.rect(4, 470, 592, 130, 0);
    for (let i = 0; i < 12; i++) s += A.poly([[4 + i * 49.3, 470], [53 + i * 49.3, 470], [28 + i * 49.3, 500]]);
    const vase = (cx, base, w, h, shape, deco) => {
      let d;
      if (shape === 0) d = `M${cx - w * 0.3},${base - h}L${cx + w * 0.3},${base - h}Q${cx + w * 0.25},${base - h * 0.8} ${cx + w * 0.5},${base - h * 0.5}Q${cx + w * 0.6},${base - h * 0.15} ${cx + w * 0.35},${base}L${cx - w * 0.35},${base}Q${cx - w * 0.6},${base - h * 0.15} ${cx - w * 0.5},${base - h * 0.5}Q${cx - w * 0.25},${base - h * 0.8} ${cx - w * 0.3},${base - h}Z`;
      else if (shape === 1) d = `M${cx - w * 0.5},${base - h}L${cx + w * 0.5},${base - h}L${cx + w * 0.35},${base}L${cx - w * 0.35},${base}Z`;
      else d = `M${cx - w * 0.2},${base - h}L${cx + w * 0.2},${base - h}Q${cx + w * 0.2},${base - h * 0.75} ${cx + w * 0.5},${base - h * 0.4}Q${cx + w * 0.55},${base} ${cx},${base}Q${cx - w * 0.55},${base} ${cx - w * 0.5},${base - h * 0.4}Q${cx - w * 0.2},${base - h * 0.75} ${cx - w * 0.2},${base - h}Z`;
      return { d, svg: R(d) + O.clip(d, deco(cx, base, w, h)) + A.rect(cx - w * 0.36, base - h - 12, w * 0.72, 16, 6) };
    };
    const stems = (cx, top, list) => list.map(([dx, dy, r, n], i) => R(A.ribbonD([[cx + dx * 0.15, top], [cx + dx * 0.6, top + dy * 0.5], [cx + dx, top + dy]], 6, 5, false, false)) + (i % 2 ? A.leaf(cx + dx * 0.5, top + dy * 0.45, cx + dx * 0.5 + (dx >= 0 ? 34 : -34), top + dy * 0.6, 11) : '') + A.flower(cx + dx, top + dy, r, n)).join('');
    const v1 = vase(140, 470, 150, 190, 0, (cx, b, w, h) => { let t = ''; for (let i = 0; i < 7; i++) t += A.poly([[cx - 80 + i * 24, b - h * 0.55], [cx - 68 + i * 24, b - h * 0.4], [cx - 56 + i * 24, b - h * 0.55]]); return t + A.rect(cx - 90, b - h * 0.32, 180, 14, 0) + A.rect(cx - 90, b - h * 0.68, 180, 10, 0); });
    const v2 = vase(310, 470, 130, 240, 2, (cx, b, w, h) => { let t = ''; for (let i = 0; i < 4; i++) t += A.circ(cx - 45 + i * 30, b - h * 0.32, 10); return t + A.rect(cx - 80, b - h * 0.55, 160, 20, 0) + A.rect(cx - 80, b - h * 0.18, 160, 12, 0); });
    const v3 = vase(475, 470, 140, 160, 1, (cx, b, w, h) => { let t = ''; for (let i = 0; i < 5; i++) t += A.poly(A.ngonPts(cx - 52 + i * 26, b - h * 0.5, 12, 4, 0)); return t + A.rect(cx - 80, b - h * 0.25, 160, 12, 0) + A.rect(cx - 80, b - h * 0.78, 160, 12, 0); });
    s += stems(140, 280, [[-50, -120, 26, 6], [10, -170, 30, 5], [60, -100, 24, 7]]);
    s += stems(310, 230, [[-40, -110, 24, 5], [30, -150, 30, 8]]);
    s += stems(475, 310, [[-55, -100, 24, 5], [0, -150, 28, 6], [55, -110, 22, 5]]);
    s += v1.svg + v2.svg + v3.svg;
    s += O.sparkles([[40, 60, 14], [560, 60, 14]]);
    return s;
  });

  // 9. Borboletas e flores
  AA.add(4, 9, 'Borboletas', () => {
    let s = O.cloud(110, 70, 140) + O.cloud(480, 60, 120);
    s += O.hills(500, 14);
    s += O.flowerStem(80, 600, 170, 30) + O.flowerStem(210, 600, 120, 26, 5) + O.flowerStem(400, 600, 140, 28, 7) + O.flowerStem(530, 600, 190, 32);
    s += O.butterfly(170, 230, 1.6, -12) + O.butterfly(430, 200, 1.3, 15) + O.butterfly(310, 400, 1.0, 0);
    s += A.L('M120,330q20,-20 40,0t40,0M380,300q20,-20 40,0', 2);
    return s;
  });

  // 10. Grande composição artística
  AA.add(4, 10, 'Paisagem geométrica', () => {
    let s = O.sun(300, 120, 50, 14);
    // montanhas com faixas
    const m1 = 'M-10,420L130,200L280,420Z', m2 = 'M200,420L380,170L560,420Z', m3 = 'M430,420L560,260L620,330L620,420Z';
    let mt = '';
    [m1, m2, m3].forEach((d, i) => { mt += R(d); mt += O.clip(d, (() => { let t = ''; for (let k = 0; k < 4; k++) { const y = 260 + k * 45 - (i === 1 ? 30 : 0); let zz = `M-20,${y}`; for (let x = -20; x < 640; x += 40) zz += `l20,-16l20,16`; zz += `L640,${y + 18}`; for (let x = 640; x > -20; x -= 40) zz += `l-20,-16l-20,16`; t += R(zz + 'Z'); } return t; })()); });
    s += O.clipCanvas(mt);
    // rio
    s += O.ground(420);
    s += R('M260,420Q330,470 250,520Q170,570 260,610L380,610Q300,570 370,520Q440,470 340,420Z');
    s += A.L('M280,470q15,-8 30,0M270,540q15,-8 30,0M320,500q15,-8 30,0', 2);
    // baobá
    s += R('M450,560Q470,480 465,420Q440,400 420,370L436,362Q458,388 470,396L466,340L482,338L486,390Q506,370 520,350L534,358Q510,392 496,420Q490,480 510,560Z');
    s += R(A.cloudD(410, 340, 48, 28, 8, 0.4, 0)) + R(A.cloudD(478, 315, 52, 30, 8, 0.4, 0)) + R(A.cloudD(545, 340, 46, 26, 8, 0.4, 0));
    s += O.bird(150, 110, 0.5) + O.bird(470, 90, 0.45, true);
    s += A.flower(80, 500, 24, 6) + A.flower(150, 550, 18, 5) + A.flower(560, 590, 18, 5) + A.leaf(60, 540, 20, 500, 12) + A.leaf(170, 520, 200, 490, 10);
    s += O.butterfly(190, 470, 0.45, 10);
    return s;
  });
})(window.AA);
