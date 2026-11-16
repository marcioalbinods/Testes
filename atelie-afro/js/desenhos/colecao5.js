/* COLEÇÃO 5 — SONHOS, TALENTOS E POSSIBILIDADES */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const FEET = { kid: 262, adult: 345 };
  const at = (o, x, ground, s, flip) => P.put(o, x, ground - (o.age ? FEET.adult : FEET.kid) * s, s, flip);
  // jaleco: lapelas e bolsos
  const coat = ({ sy, wy, ww }) => R(`M-14,${sy + 4}L-34,${sy + 70}L-6,${wy + 20}L-14,${sy + 4}Z`) + R(`M14,${sy + 4}L34,${sy + 70}L6,${wy + 20}L14,${sy + 4}Z`) +
    A.rect(-ww + 6, wy - 30, 26, 22, 4) + A.rect(ww - 32, wy - 30, 26, 22, 4) + A.L(`M0,${sy + 40}L0,${wy + 80}`) + A.circ(0, wy - 10, 4) + A.circ(0, wy + 20, 4);

  // 1. Menina cientista no laboratório
  AA.add(5, 1, 'Cientista', () => {
    let s = A.rect(30, 90, 220, 14, 4) + A.rect(30, 190, 220, 14, 4);
    s += O.flask(70, 62, 0.45) + O.tube(120, 70, 0.5) + O.flask(180, 62, 0.45);
    s += O.closedBook(60, 162, 22, 46) + O.closedBook(86, 160, 22, 50) + O.flask(170, 162, 0.45) + O.tube(220, 170, 0.45);
    s += A.rect(380, 50, 180, 140, 10) + A.L('M400,170L430,120L460,145L500,80L540,110');
    s += A.circ(430, 120, 6) + A.circ(500, 80, 6);
    const g = at({ hair: 'puff1', glasses: true, nose: 'round', mouth: 'grin', lashes: true, lower: 'dress', skirtLen: 70, pantsUnder: true, sleeve: 'long', topDeco: coat, arms: { l: [25, -10], r: [60, 140] } }, 240, 560, 0.95);
    s += g.svg;
    s += O.flask(g.hands.r[0] + 6, g.hands.r[1] - 40, 0.75) + A.circ(g.hands.r[0], g.hands.r[1], 10);
    s += A.circ(g.hands.r[0] + 20, g.hands.r[1] - 120, 10) + A.circ(g.hands.r[0] - 4, g.hands.r[1] - 150, 7) + A.circ(g.hands.r[0] + 26, g.hands.r[1] - 175, 12);
    // bancada
    s += A.rect(380, 420, 210, 22, 6) + A.rect(395, 442, 180, 150, 6) + A.rect(410, 470, 70, 50, 6) + A.rect(490, 470, 70, 50, 6);
    s += O.microscope(450, 352, 0.75) + O.flask(540, 380, 0.55) + O.tube(400, 390, 0.5);
    s += O.ground(585);
    return s;
  });

  // 2. Menino astronauta
  AA.add(5, 2, 'Astronauta', () => {
    let s = O.planet(470, 110, 50, -15) + A.circ(110, 90, 36) + A.circ(98, 80, 8) + A.circ(124, 100, 6);
    [[60, 220, 12], [250, 60, 14], [560, 270, 12], [330, 150, 8], [40, 400, 10], [560, 420, 9]].forEach(([x, y, r], i) => { s += A.star(x, y, r, r * 0.45, 5, i * 15); });
    s += O.rocket(510, 330, 0.75, 20);
    s += O.clipCanvas(R(A.smoothD([[-10, 520], [120, 490], [300, 505], [470, 480], [620, 500], [620, 620], [-10, 620]], true, 0.12)) + A.ell(150, 545, 34, 10) + A.ell(430, 560, 24, 8) + A.ell(300, 590, 40, 10));
    const helmet = (rx, ry) => A.ring(0, 4, rx * 1.62, rx * 1.36) + A.rect(-rx * 0.5, ry * 1.1, rx, ry * 0.25, 6);
    const suit = ({ sy, wy }) => A.rect(-30, sy + 30, 60, 44, 8) + A.circ(-14, sy + 52, 7) + A.circ(10, sy + 52, 7) + A.rect(-40, wy - 8, 80, 14, 4);
    const a = at({ hair: 'short', nose: 'broad', mouth: 'grin', eyes: 'open', lower: 'pants', sleeve: 'long', topDeco: suit, headTop: helmet,
      behindBody: A.rect(-52, 50, 104, 110, 18) + A.circ(0, 4, 46 * 1.36), arms: { l: [130, 160], r: [30, 10] }, legs: { l: [12, 4], r: [10, 2] } }, 260, 560, 0.95);
    s += a.svg;
    // bandeira
    s += A.rect(a.hands.r[0] - 4, a.hands.r[1] - 180, 8, 220, 3) + R(`M${a.hands.r[0] + 4},${a.hands.r[1] - 180}L${a.hands.r[0] + 90},${a.hands.r[1] - 180}L${a.hands.r[0] + 70},${a.hands.r[1] - 150}L${a.hands.r[0] + 90},${a.hands.r[1] - 120}L${a.hands.r[0] + 4},${a.hands.r[1] - 120}Z`) + A.star(a.hands.r[0] + 40, a.hands.r[1] - 150, 16, 7, 5, 0) + A.circ(a.hands.r[0], a.hands.r[1], 11);
    return s;
  });

  // 3. Mulher médica
  AA.add(5, 3, 'Médica', () => {
    let s = A.rect(60, 50, 160, 160, 20) + A.rect(115, 80, 50, 100, 6) + A.rect(90, 105, 100, 50, 6);
    s += A.rect(380, 60, 180, 120, 10) + A.L('M395,120L430,120L445,90L465,150L480,110L490,120L545,120');
    s += A.heart(470, 470, 30) + A.heart(110, 470, 24);
    s += O.ground(560);
    const d = at({ age: 'adult', hair: 'boxbraids', rx: 41, ry: 52, narrow: 0.14, nose: 'wide', mouth: 'grin', lashes: true, earrings: 'stud', lower: 'dress', skirtLen: 90, pantsUnder: true, sleeve: 'long', topDeco: coat, arms: { l: [20, -10], r: [30, -70] } }, 300, 585, 0.95);
    s += d.svg;
    s += O.stethoscope(300, 345, 0.8);
    s += O.clipboard(d.hands.r[0] - 30, d.hands.r[1] - 10, 70, 90, -8) + A.circ(d.hands.r[0], d.hands.r[1], 11);
    return s;
  });

  // 4. Homem professor
  AA.add(5, 4, 'Professor', () => {
    let s = O.board(200, 50, 330, 230, L('M70,130l20,-70l20,70M78,105l24,0M132,60l0,70M132,60q34,0 34,17q0,17 -34,17q38,0 38,18q0,18 -38,18M230,70q-24,-14 -40,4q-14,24 4,50q18,10 36,-6') + L('M70,200l14,-10l0,50M110,195q10,-14 24,-4q8,10 -6,22l-18,18l28,0M160,192q20,-12 28,2q4,12 -12,16q20,2 16,18q-8,16 -32,4') + A.circ(300, 220, 26) + A.poly([[250, 260], [280, 220], [310, 260]]));
    s += A.rect(70, 300, 200, 14, 4);
    s += O.ground(520);
    const p = at({ age: 'adult', hair: 'shortafro', glasses: true, rx: 43, ry: 54, jaw: 0.85, nose: 'broad', mouth: 'grin', beard: 'short', lower: 'pants', sleeve: 'long', topDeco: ({ sy, wy }) => A.poly([[-8, sy + 4], [8, sy + 4], [12, wy - 30], [0, wy - 10], [-12, wy - 30]]) , arms: { l: [120, 120], r: [20, -20] } }, 430, 585, 0.92);
    s += p.svg;
    s += R(A.ribbonD([p.hands.l, [p.hands.l[0] - 90, p.hands.l[1] - 60]], 8, 6, true, true)) + A.circ(p.hands.l[0], p.hands.l[1], 11);
    s += O.closedBook(p.hands.r[0] - 6, p.hands.r[1] - 10, 30, 50, 10) + A.circ(p.hands.r[0], p.hands.r[1], 11);
    s += A.rect(40, 450, 200, 20, 6) + A.rect(55, 470, 20, 110, 4) + A.rect(205, 470, 20, 110, 4) + O.globe(100, 395, 34) + O.closedBook(180, 430, 60, 22) + R('M195,400Q178,380 196,372Q214,362 220,380Q226,398 205,410Q200,412 195,400Z') + A.leaf(204, 372, 220, 352, 7);
    return s;
  });

  // 5. Menina engenheira
  AA.add(5, 5, 'Engenheira', () => {
    // guindaste e prédio
    let s = A.rect(380, 150, 150, 330, 6);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) s += A.rect(400 + c * 70, 180 + r * 70, 45, 45, 4);
    s += R('M90,480L90,70L104,70L104,480Z') + R('M60,70L330,70L330,86L60,86Z') + A.L('M104,86L60,70M104,120L90,86M90,140L104,120M104,180L90,160M90,200L104,180') + A.rect(280, 190, 40, 30, 4);
    s += A.L('M300,86L300,190') + A.rect(80, 460, 40, 20, 4);
    s += O.gear(510, 80, 40, 9) + O.gear(565, 140, 24, 7);
    s += O.ground(480);
    const e = at({ hair: 'beads', nose: 'round', mouth: 'grin', lashes: true, lower: 'pants', sleeve: 'short', headTop: (rx, ry) => A.G(0, -ry * 0.55, rx / 50, () => R('M-58,0Q-58,-56 0,-62Q58,-56 58,0Z') + A.rect(-70, -6, 140, 16, 7) + A.rect(-9, -62, 18, 56, 6)),
      topDeco: ({ sy, wy, ww }) => R(`M${-ww - 5},${sy + 10}L${-ww + 22},${sy + 10}L${-ww + 22},${wy}L${-ww - 5},${wy}Z`) + R(`M${ww + 5},${sy + 10}L${ww - 22},${sy + 10}L${ww - 22},${wy}L${ww + 5},${wy}Z`), arms: { l: [30, -60], r: [70, 120] } }, 230, 585, 1.0);
    s += e.svg;
    // planta (projeto) enrolada e chave
    s += A.G(e.hands.l[0] + 10, e.hands.l[1] - 10, 1, () => A.rect(-60, -16, 120, 32, 14) + A.ell(60, 0, 10, 16) + A.L('M-40,-8l70,0M-40,8l50,0'), { rot: -20 });
    s += A.circ(e.hands.l[0], e.hands.l[1], 11);
    s += R(A.ribbonD([[e.hands.r[0], e.hands.r[1]], [e.hands.r[0] + 50, e.hands.r[1] - 60]], 10, 10, true, true)) + A.ring(e.hands.r[0] + 58, e.hands.r[1] - 70, 18, 8) + A.circ(e.hands.r[0], e.hands.r[1], 11);
    return s;
  });

  // 6. Mulher artista pintora
  AA.add(5, 6, 'Pintora', () => {
    let s = O.confetti([[50, 60, 'c', 14], [100, 40, 'c', 8], [550, 60, 'c', 14], [500, 36, 'c', 8]]);
    s += O.ground(520);
    s += O.easel(420, 310, 1.05, A.G(0, 0, 1, () => O.sun(-30, -40, 24, 10) + R('M-80,60L-80,10Q-40,-10 0,10Q40,30 80,0L80,60Z') + A.flower(30, 20, 16, 5) + A.circ(-50, 10, 8)));
    const p = at({ age: 'adult', hair: 'headband', rx: 41, ry: 52, narrow: 0.14, nose: 'broad', mouth: 'grin', lashes: true, earrings: 'hoop', lower: 'pants', sleeve: 'short', topDeco: ({ sy, wy, ww }) => R(`M${-ww + 4},${sy + 46}L${ww - 4},${sy + 46}L${ww + 8},${wy + 4}L${-ww - 8},${wy + 4}Z`) + A.rect(-18, sy + 70, 36, 30, 6) + R(A.ribbonD([[-20, sy + 46], [-30, sy + 8], [-14, sy]], 6, 6, false, false)) + R(A.ribbonD([[20, sy + 46], [30, sy + 8], [14, sy]], 6, 6, false, false)), arms: { l: [20, -40], r: [80, 120] } }, 190, 585, 0.95);
    s += p.svg;
    s += O.palette(p.hands.l[0] + 10, p.hands.l[1] - 6, 0.85, -20) + A.circ(p.hands.l[0], p.hands.l[1], 11);
    s += O.brush(p.hands.r[0] - 10, p.hands.r[1] + 20, p.hands.r[0] + 40, p.hands.r[1] - 50) + A.circ(p.hands.r[0], p.hands.r[1], 11);
    s += A.rect(470, 530, 40, 50, 6) + A.rect(520, 545, 40, 35, 6) + A.ell(490, 530, 20, 6) + A.ell(540, 545, 20, 6);
    return s;
  });

  // 7. Menino músico
  AA.add(5, 7, 'Músico', () => {
    let s = '';
    s += O.clipCanvas(A.poly([[90, 0], [160, 0], [300, 460], [240, 460]]) + A.poly([[440, 0], [510, 0], [360, 460], [300, 460]]));
    s += A.ell(300, 520, 260, 60) + O.notes(90, 200, 1.2) + O.note1(510, 220, 1.3) + O.notes(470, 400, 0.9) + O.note1(100, 420, 1.1);
    s += A.star(60, 60, 16, 7, 5) + A.star(540, 60, 16, 7, 5);
    const m = at({ hair: 'locs', locLen: 1.2, nose: 'broad', mouth: 'open', eyes: 'happy', lower: 'pants', sleeve: 'short', arms: { l: [50, -40], r: [40, -90] } }, 300, 560, 1.05);
    s += m.svg;
    s += O.violao(300 + 5, 410, 0.85, 62);
    s += A.circ(m.hands.l[0], m.hands.l[1], 12) + A.circ(m.hands.r[0], m.hands.r[1], 12);
    return s;
  });

  // 8. Menina atleta
  AA.add(5, 8, 'Atleta', () => {
    let s = O.cloud(110, 70, 130) + O.sun(520, 70, 32, 12);
    s += A.rect(4, 300, 592, 296, 0);
    for (let i = 0; i < 4; i++) s += A.L(`M4,${360 + i * 60}L596,${360 + i * 60}`);
    s += A.rect(60, 120, 480, 30, 6) + A.rect(80, 150, 440, 150, 0);
    for (let i = 0; i < 8; i++) s += A.circ(110 + i * 55, 200, 14) + A.circ(110 + i * 55, 250, 14);
    s += A.rect(520, 250, 14, 300, 4);
    s += R('M534,300L590,300L590,340L534,340Z');
    const a = at({ hair: 'cornrows', rows: 5, nose: 'wide', mouth: 'grin', lashes: true, lower: 'shorts', sleeve: 'none', socks: true, topDeco: ({ sy }) => A.rect(-26, sy + 26, 52, 36, 6), arms: { l: [60, 100], r: [130, 80] }, legs: { l: [50, 10], r: [70, 130] } }, 280, 560, 1.0);
    s += a.svg;
    s += O.medal(150, 500, 0.9) + O.trophy(450, 520, 0.9);
    return s;
  });

  // 9. Mulher piloto de avião
  AA.add(5, 9, 'Piloto de avião', () => {
    let s = O.cloud(90, 70, 130) + O.cloud(320, 50, 100) + O.cloud(520, 280, 120) + O.cloud(80, 330, 110);
    s += O.plane(380, 150, 0.95, -12);
    s += O.ground(500) + A.L('M4,540L596,540');
    for (let i = 0; i < 6; i++) s += A.rect(20 + i * 100, 560, 60, 10, 3);
    const cap = (rx, ry) => R(`M${f(-rx * 1.1)},${f(-ry * 0.55)}Q${f(-rx * 1.0)},${f(-ry * 1.3)} 0,${f(-ry * 1.35)}Q${f(rx * 1.0)},${f(-ry * 1.3)} ${f(rx * 1.1)},${f(-ry * 0.55)}Z`) +
      R(`M${f(-rx * 0.95)},${f(-ry * 0.58)}Q0,${f(-ry * 0.4)} ${f(rx * 0.95)},${f(-ry * 0.58)}Q0,${f(-ry * 0.2)} ${f(-rx * 0.95)},${f(-ry * 0.58)}Z`) + A.rect(-rx * 1.1, -ry * 0.72, rx * 2.2, ry * 0.16, 4) + A.star(0, -ry * 1.0, rx * 0.2, rx * 0.09, 5, 0);
    const uniform = ({ sy, wy, ww }) => R(`M-14,${sy + 4}L0,${sy + 40}L14,${sy + 4}Z`) + R(`M-2,${sy + 30}L2,${sy + 30}L6,${wy - 20}L0,${wy}L-6,${wy - 20}Z`) + A.rect(-ww + 8, sy + 30, 26, 10, 3) + A.circ(-12, wy - 10, 4) + A.circ(-12, wy + 16, 4);
    const p = at({ age: 'adult', hair: 'bun', rx: 41, ry: 52, narrow: 0.12, nose: 'wide', mouth: 'grin', lashes: true, earrings: 'stud', lower: 'pants', sleeve: 'long', headTop: cap, topDeco: uniform, arms: { l: [15, 0], r: [140, 160] } }, 220, 590, 0.9);
    s += p.svg;
    s += A.rect(320, 430, 70, 90, 10) + A.rect(340, 410, 30, 24, 8) + A.circ(335, 525, 8) + A.circ(375, 525, 8);
    return s;
  });

  // 10. Crianças imaginando o futuro
  AA.add(5, 10, 'Imaginando o futuro', () => {
    let s = R(A.cloudD(300, 170, 270, 145, 18, 0.35, 0.1));
    s += A.circ(200, 335, 16) + A.circ(178, 362, 10);
    // ícones de profissões dentro do balão
    s += O.rocket(150, 160, 0.42, 20) + A.G(250, 110, 0.6, () => O.stethoscope(0, 0, 1)) + O.palette(360, 110, 0.55, -10) + O.gear(450, 170, 30, 8) + O.ball(300, 225, 24) + O.closedBook(210, 235, 50, 34, -8) + O.note1(395, 245, 0.8) + O.flask(470, 255, 0.35) + A.G(220, 175, 0.35, () => R('M-58,0Q-58,-56 0,-62Q58,-56 58,0Z') + A.rect(-70, -6, 140, 16, 7));
    s += O.ground(470);
    s += at({ hair: 'puffs', puffSize: 0.85, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'dress', look: 1, arms: { l: [150, 175], r: [20, 6] } }, 115, 592, 0.72).svg;
    s += at({ hair: 'hightop', nose: 'broad', mouth: 'grin', lower: 'shorts', arms: { l: [30, 150], r: [20, 6] } }, 300, 592, 0.72).svg;
    s += at({ hair: 'boxbraids', nose: 'wide', mouth: 'grin', lashes: true, lower: 'skirt', arms: { l: [20, 6], r: [150, 175] } }, 485, 592, 0.72).svg;
    s += O.sparkles([[60, 60, 14], [560, 330, 14], [560, 60, 12]]);
    return s;
  });
})(window.AA);
