/* COLEÇÃO 2 — NOSSA GENTE, NOSSAS HISTÓRIAS */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const put = P.put;
  const FEET = { kid: 262, adult: 345 };
  const at = (o, x, ground, s, flip) => put(o, x, ground - (o.age ? FEET.adult : FEET.kid) * s, s, flip);

  // 1. Família reunida
  AA.add(2, 1, 'Família reunida', () => {
    let s = O.sunRich(525, 75, 34) + O.cloudRich(120, 70, 150) + O.cloudRich(330, 50, 110) + O.birdsV([[250, 120, 1], [285, 105, 0.8]]);
    s += O.hills(400, 10, 'ground');
    s += O.treeRich(70, 420, 0.75) + O.houseRich(300, 400, 0.95) + O.bushRich(520, 400, 110);
    s += O.fence(430, 4, 596, 46);
    s += O.ground(470);
    s += O.path(300, 600, 120, 60, 470);
    s += O.meadow(480, 20, 200, 6, 3) + O.meadow(480, 410, 580, 6, 9);
    s += at({ age: 'adult', hair: 'short', beard: 'short', rx: 43, ry: 54, jaw: 0.8, nose: 'broad', mouth: 'smile', lower: 'pants', sleeve: 'short', print: 'pocket', arms: { l: [8, 4], r: [22, -10] } }, 150, 585, 0.78).svg;
    s += at({ age: 'adult', hair: 'bun', rx: 41, ry: 52, narrow: 0.14, nose: 'wide', mouth: 'lips', lashes: true, edges: true, earrings: 'hoop', lower: 'dress', print: 'flower', arms: { l: [22, -10], r: [8, 4] } }, 450, 585, 0.78).svg;
    s += at({ hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, lower: 'skirt', print: 'heart', arms: { l: [30, 20], r: [40, 60] } }, 245, 592, 0.68).svg;
    s += at({ hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'star', arms: { l: [40, 60], r: [30, 20] } }, 355, 592, 0.66).svg;
    return s;
  });

  // 2. Avó abraçando a neta
  AA.add(2, 2, 'Abraço da vovó', () => {
    let s = O.wallpaper(4, 400, 'leaves');
    s += O.window(380, 70, 150, 150, O.sunRich(450, 150, 26) + O.cloudRich(420, 100, 70));
    s += O.frameArt(60, 60, 110, 90, A.heart(115, 105, 26)) + O.shelf(50, 250, 150);
    s += O.planks(400);
    s += O.rug(300, 530, 270, 55);
    s += O.potPlant(545, 430, 0.6);
    const avo = P.putSplit({ age: 'elder', elder: true, glasses: true, hair: 'wrap', rx: 42, ry: 52, jaw: 0.95, narrow: 0.1, nose: 'broad', mouth: 'lips', eyes: 'happy', earrings: 'stud', lower: 'dress', skirtLen: 120, sleeve: 'long', print: 'dots', arms: { l: [10, 0], r: [62, -60] } }, 240, 245, 1.0);
    s += avo.svg;
    s += at({ hair: 'cornrows', rows: 5, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, edges: true, lower: 'dress', print: 'rainbow', arms: { l: [150, 175], r: [20, 10] } }, 400, 590, 0.95).svg;
    s += avo.arms;
    s += A.heart(320, 200, 16) + A.heart(345, 170, 10);
    return s;
  });

  // 3. Pai brincando com o filho
  AA.add(2, 3, 'Brincando com o papai', () => {
    let s = O.cloudRich(100, 90, 140) + O.cloudRich(470, 150, 110) + O.sunRich(525, 65, 30) + O.birdsV([[220, 70, 1], [250, 90, 0.8]]);
    s += O.hills(450, 18);
    s += O.treeRich(85, 520, 0.9) + O.bushRich(540, 470, 120);
    s += O.meadow(500, 20, 580, 12, 4);
    s += O.ball(505, 552, 30);
    const pai = at({ age: 'adult', hair: 'locs', locLen: 1.5, rx: 43, ry: 54, jaw: 0.85, nose: 'broad', mouth: 'grin', beard: 'short', lower: 'pants', print: 'band', arms: { l: [150, 172], r: [150, 172] } }, 300, 595, 0.86);
    const hy = (pai.hands.l[1] + pai.hands.r[1]) / 2;
    s += put({ hair: 'short', design: true, nose: 'wide', mouth: 'grin', eyes: 'happy', lower: 'shorts', print: 'star', arms: { l: [120, 140], r: [120, 140] }, legs: { l: [30, 40], r: [30, 40] } }, 300, hy - 130 * 0.62, 0.62).svg;
    s += pai.svg;
    s += O.sparkles([[170, 150, 12], [430, 130, 12]]);
    return s;
  });

  // 4. Mãe contando história para duas crianças
  AA.add(2, 4, 'Hora da história', () => {
    let s = O.wallpaper(4, 430, 'stripes');
    s += O.window(380, 60, 150, 130, A.rect(380, 60, 150, 130, 0) + O.moon(440, 110, 22) + A.star(500, 95, 12, 5, 5) + A.star(490, 155, 8, 3.6, 5) + A.star(410, 165, 7, 3, 5));
    s += O.shelf(40, 110, 170) + O.frameArt(70, 160, 90, 70, O.sunRich(115, 195, 16));
    s += O.lampFloor(560, 470);
    s += O.planks(470);
    s += A.rect(40, 300, 520, 170, 50);
    s += L('M80,330q20,30 0,60M520,330q-20,30 0,60');
    const mae = put({ age: 'adult', hair: 'afro', afroSize: 0.75, rx: 41, ry: 52, narrow: 0.14, nose: 'wide', mouth: 'open', lashes: true, earrings: 'hoop', lower: 'dress', sleeve: 'long', print: 'diamond', arms: { l: [18, -70], r: [18, -70] } }, 300, 250, 0.82);
    s += mae.svg;
    s += put({ hair: 'puff1', nose: 'round', mouth: 'grin', look: 1, lashes: true, edges: true, lower: 'dress', print: 'heart', arms: { l: [8, 4], r: [10, -40] } }, 135, 325, 0.72).svg;
    s += put({ hair: 'hightop', nose: 'broad', mouth: 'grin', look: -1, eyes: 'open', lower: 'shorts', print: 'sun', arms: { l: [10, -40], r: [8, 4] } }, 465, 325, 0.72).svg;
    const bx = (mae.hands.l[0] + mae.hands.r[0]) / 2, by = Math.min(mae.hands.l[1], mae.hands.r[1]) - 30;
    s += O.book(bx, by, 52, 58, 0);
    s += A.rect(40, 430, 520, 115, 30) + A.rect(20, 360, 70, 185, 30) + A.rect(510, 360, 70, 185, 30);
    s += A.rect(110, 410, 90, 50, 18) + A.rect(400, 410, 90, 50, 18) + A.Lt('M130,425l50,20M420,425l50,20', 0.5);
    s += L('M213,440L213,520M387,440L387,520');
    s += A.rect(70, 545, 30, 18, 6) + A.rect(500, 545, 30, 18, 6);
    return s;
  });

  // 5. Grupo de amigos brincando (pular corda)
  AA.add(2, 5, 'Pular corda', () => {
    let s = O.sunRich(80, 75, 32) + O.cloudRich(450, 70, 150) + O.cloudRich(260, 55, 90) + O.birdsV([[350, 140, 1]]);
    s += O.hills(400, 12) + O.treeRich(540, 430, 0.6) + O.fence(440, 4, 420, 40);
    s += O.ground(450);
    s += O.meadow(460, 20, 580, 10, 11);
    const a = at({ hair: 'boxbraids', nose: 'wide', mouth: 'grin', lashes: true, edges: true, lower: 'skirt', print: 'flower', arms: { l: [10, 6], r: [80, 60] } }, 90, 580, 0.62);
    const b = at({ hair: 'fade', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'stripes', arms: { l: [80, 60], r: [10, 6] } }, 510, 580, 0.62);
    const c = at({ hair: 'puffs', puffSize: 0.85, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'dress', print: 'dots', arms: { l: [120, 150], r: [120, 150] }, legs: { l: [35, -20], r: [35, -20] } }, 300, 515, 0.62);
    const h1 = a.hands.r, h2 = b.hands.l;
    s += A.R(A.ribbonD([h1, [300, 585], h2], 7, 7, true, true), 'rope');
    s += a.svg + b.svg + c.svg;
    s += A.R(A.ribbonD([[h1[0] - 4, h1[1] - 10], [h1[0] + 6, h1[1] + 14]], 12, 12, true, true)) + A.R(A.ribbonD([[h2[0] + 4, h2[1] - 10], [h2[0] - 6, h2[1] + 14]], 12, 12, true, true));
    s += L('M250,500q-12,-8 -20,-20M350,500q12,-8 20,-20M240,540q-14,0 -24,-8M360,540q14,0 24,-8', 2.4);
    return s;
  });

  // 6. Crianças soltando pipas
  AA.add(2, 6, 'Soltando pipas', () => {
    let s = O.cloudRich(300, 80, 150) + O.cloudRich(80, 250, 100) + O.cloudRich(530, 290, 90) + O.sunRich(540, 60, 28) + O.birdsV([[230, 60, 1], [370, 190, 0.9]]);
    s += O.hills(440, 22) + O.palm(565, 600, 0.75) + O.houseRich(80, 455, 0.5);
    s += O.meadow(500, 20, 520, 10, 6);
    const a = at({ hair: 'locs', locLen: 1.3, nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'sun', arms: { l: [20, 10], r: [150, 165] }, legs: { l: [12, 4], r: [4, 2] } }, 180, 588, 0.7);
    const b = at({ hair: 'beads', nose: 'round', mouth: 'grin', lashes: true, edges: true, lower: 'skirt', print: 'heart', arms: { l: [150, 165], r: [25, 15] } }, 400, 588, 0.7);
    s += O.kite(130, 110, 0.8, -15, a.hands.r) + O.kite(470, 130, 0.85, 12, b.hands.l);
    s += a.svg + b.svg;
    return s;
  });

  // 7. Brincando de roda (ciranda)
  AA.add(2, 7, 'Ciranda', () => {
    let s = O.bunting(4, 40, 596, 40, 10, 14) + O.cloudRich(110, 150, 110) + O.cloudRich(490, 150, 110) + O.sunRich(300, 130, 28);
    s += O.treeRich(40, 390, 0.55, false) + O.treeRich(565, 390, 0.55, false);
    s += O.ground(380);
    s += A.ell(300, 455, 275, 85) + A.ell(300, 455, 240, 66);
    s += O.meadow(540, 10, 590, 8, 13);
    const back = [
      { hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, lower: 'dress', print: 'flower' },
      { hair: 'short', nose: 'broad', mouth: 'grin', eyes: 'happy', lower: 'shorts', print: 'star' },
      { hair: 'headband', nose: 'wide', mouth: 'grin', lashes: true, lower: 'skirt', print: 'heart' }
    ];
    const front = [
      { hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'stripes' },
      { hair: 'cornrows', rows: 5, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, edges: true, lower: 'dress', print: 'dots' },
      { hair: 'hightop', nose: 'wide', mouth: 'grin', lower: 'shorts', print: 'band' }
    ];
    const armsOut = { l: [78, 88], r: [78, 88] };
    back.forEach((o, i) => { s += at(Object.assign({ arms: armsOut }, o), 150 + i * 150, 470, 0.66).svg; });
    front.forEach((o, i) => { s += at(Object.assign({ arms: armsOut }, o), 105 + i * 195, 592, 0.74).svg; });
    return s;
  });

  // 8. Meninas sorrindo e abraçadas
  AA.add(2, 8, 'Amigas abraçadas', () => {
    let s = O.rays(300, 330, 28, 600, 0);
    s += A.circ(300, 330, 235) + A.ring(300, 330, 235, 215);
    s += O.confetti([[60, 60, 'h', 20], [540, 60, 'h', 20], [300, 40, 's', 14], [50, 300, 'p', 14], [550, 300, 'p', 14], [70, 520, 's', 12], [530, 520, 's', 12]]);
    const a = P.putSplit({ hair: 'afro', afroSize: 0.95, nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'skirt', earrings: 'stud', print: 'heart', arms: { l: [12, 6], r: [112, 100] } }, 228, 250, 1.05);
    const b = P.putSplit({ hair: 'boxbraids', nose: 'round', mouth: 'grin', lashes: true, edges: true, lower: 'dress', print: 'star', arms: { l: [60, 40], r: [12, 6] } }, 378, 250, 1.05);
    s += b.arms + a.svg + b.svg + a.arms;
    return s;
  });

  // 9. Crianças estudando juntas
  AA.add(2, 9, 'Estudando juntos', () => {
    let s = O.wallpaper(4, 400, 'dots');
    s += O.board(300, 40, 360, 170, L('M160,140l20,-70l20,70M168,115l24,0M222,70l0,70M222,70q34,0 34,17q0,17 -34,17q38,0 38,18q0,18 -38,18M320,80q-24,-14 -40,4q-14,24 4,50q18,10 36,-6') + O.sun(420, 105, 22, 10) + A.R(A.dRect(400, 165, 50, 12, 3)));
    s += A.rect(30, 70, 70, 300, 6) + A.rect(30, 140, 70, 10, 2) + A.rect(30, 230, 70, 10, 2);
    s += O.closedBook(48, 120, 16, 40) + O.closedBook(68, 118, 16, 44) + O.closedBook(48, 210, 16, 40) + O.closedBook(72, 212, 18, 36) + O.globe(66, 300, 22);
    s += O.potPlant(545, 370, 0.55) + O.frameArt(500, 90, 70, 90, A.flower(535, 135, 22, 6));
    const k1 = put({ hair: 'beads', nose: 'round', mouth: 'smile', eyes: 'down', lashes: true, edges: true, lower: 'dress', print: 'flower', arms: { l: [10, -60], r: [20, -40] } }, 175, 290, 0.75);
    const k2 = put({ hair: 'short', design: true, nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'rainbow', arms: { l: [30, 140], r: [15, -50] } }, 300, 270, 0.75);
    const k3 = put({ hair: 'puff1', nose: 'wide', mouth: 'lips', eyes: 'down', lashes: true, lower: 'dress', print: 'star', arms: { l: [20, -40], r: [10, -60] } }, 425, 290, 0.75);
    s += k1.svg + k2.svg + k3.svg;
    s += A.rect(70, 420, 460, 30, 10) + A.rect(90, 440, 420, 130, 6) + A.rect(110, 470, 170, 80, 6) + A.rect(320, 470, 170, 80, 6) + A.circ(195, 510, 7) + A.circ(405, 510, 7);
    s += O.book(190, 380, 46, 38, -6) + O.book(415, 382, 46, 38, 6) + O.pencil(300, 408, 90, -8) + O.closedBook(300, 375, 60, 26);
    s += A.rect(495, 385, 26, 36, 4) + O.pencil(500, 380, 50, -80) + O.pencil(514, 382, 46, -100);
    s += O.planks(570, 30);
    return s;
  });

  // 10. Retrato do grupo de crianças
  AA.add(2, 10, 'Retrato da turma', () => {
    let s = A.rect(30, 40, 540, 520, 20) + A.rect(62, 72, 476, 456, 8);
    [[30, 40], [570, 40], [30, 560], [570, 560]].forEach(([x, y]) => { s += A.circ(x, y, 26) + A.star(x, y, 15, 7, 4, 45); });
    for (let i = 0; i < 6; i++) { s += A.poly(A.ngonPts(150 + i * 60, 56, 8, 4, 0)) + A.poly(A.ngonPts(150 + i * 60, 544, 8, 4, 0)); }
    for (let i = 0; i < 6; i++) { s += A.circ(46, 150 + i * 60, 6) + A.circ(554, 150 + i * 60, 6); }
    let inner = O.rays(300, 300, 32, 500, 0) + O.bunting(62, 90, 538, 90, 8, 10);
    const kids = [
      [{ hair: 'shortafro', nose: 'broad', mouth: 'grin', neckline: 'round', print: 'star' }, 165, 215],
      [{ hair: 'puffs', puffSize: 0.85, nose: 'round', mouth: 'lips', lashes: true, freckles: true, edges: true, neckline: 'collar', print: 'heart' }, 300, 205],
      [{ hair: 'locs', locLen: 1.3, nose: 'wide', mouth: 'smile', neckline: 'v', print: 'band' }, 435, 215],
      [{ hair: 'beads', nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, neckline: 'round', print: 'flower' }, 165, 395],
      [{ hair: 'fade', glasses: true, nose: 'broad', mouth: 'grin', neckline: 'collar', print: 'pocket' }, 300, 385],
      [{ hair: 'boxbraids', nose: 'round', mouth: 'grin', lashes: true, earrings: 'stud', neckline: 'round', print: 'rainbow' }, 435, 395]
    ];
    kids.forEach(([o, x, y]) => { inner += A.G(x, y, 0.72, () => P.bust(Object.assign({ bottom: (540 - y) / 0.72 }, o))); });
    s += O.clip(A.dRect(62, 72, 476, 456, 8), inner);
    return s;
  });
})(window.AA);
