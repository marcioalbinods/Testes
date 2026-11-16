/* COLEÇÃO 2 — NOSSA GENTE, NOSSAS HISTÓRIAS */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const put = P.put;
  // altura dos pés (coordenada local) para posicionar figuras pelo chão
  const FEET = { kid: 262, adult: 345 };
  const at = (o, x, ground, s, flip) => put(o, x, ground - (o.age ? FEET.adult : FEET.kid) * s, s, flip);

  // 1. Família reunida
  AA.add(2, 1, 'Família reunida', () => {
    let s = O.sun(520, 80, 38) + O.cloud(130, 80, 150) + O.cloud(330, 60, 110);
    s += O.house(300, 330, 1.25);
    s += O.ground(470) + O.grass(20, 470, 110) + O.grass(470, 470, 110);
    s += at({ age: 'adult', hair: 'short', beard: 'short', rx: 43, ry: 54, jaw: 0.8, nose: 'broad', mouth: 'smile', lower: 'pants', sleeve: 'short', arms: { l: [8, 4], r: [22, -10] } }, 160, 580, 0.8).svg;
    s += at({ age: 'adult', hair: 'bun', rx: 41, ry: 52, narrow: 0.14, nose: 'wide', mouth: 'lips', lashes: true, earrings: 'hoop', lower: 'dress', arms: { l: [22, -10], r: [8, 4] } }, 440, 580, 0.8).svg;
    s += at({ hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, lower: 'skirt', arms: { l: [30, 20], r: [40, 60] } }, 245, 585, 0.68).svg;
    s += at({ hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'shorts', arms: { l: [40, 60], r: [30, 20] } }, 355, 585, 0.66).svg;
    return s;
  });

  // 2. Avó abraçando a neta
  AA.add(2, 2, 'Abraço da vovó', () => {
    let s = A.heart(300, 250, 230);
    s += O.confetti([[70, 80, 'h', 16], [530, 80, 'h', 16], [80, 470, 'p', 12], [520, 470, 'p', 12]]);
    s += O.ground(540);
    const avo = P.putSplit({ age: 'elder', elder: true, glasses: true, hair: 'wrap', rx: 42, ry: 52, jaw: 0.95, narrow: 0.1, nose: 'broad', mouth: 'lips', eyes: 'happy', earrings: 'stud', lower: 'dress', skirtLen: 120, sleeve: 'long', necklace: true, arms: { l: [10, 0], r: [62, -60] } }, 235, 590 - 345 * 1.0 + 0, 1.0);
    s += avo.svg;
    s += at({ hair: 'cornrows', rows: 5, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'dress', arms: { l: [150, 175], r: [20, 10] } }, 400, 590, 0.95).svg;
    s += avo.arms;
    return s;
  });

  // 3. Pai brincando com o filho
  AA.add(2, 3, 'Brincando com o papai', () => {
    let s = O.cloud(100, 90, 140) + O.cloud(500, 140, 120) + O.sun(520, 60, 30, 10);
    s += O.hills(470, 18);
    s += O.tree(80, 520, 0.9);
    s += O.ball(500, 548, 30);
    const pai = at({ age: 'adult', hair: 'locs', locLen: 1.5, rx: 43, ry: 54, jaw: 0.85, nose: 'broad', mouth: 'grin', beard: 'short', lower: 'pants', arms: { l: [150, 172], r: [150, 172] } }, 300, 590, 0.86);
    // menino no alto, voando de "aviãozinho"
    const hy = (pai.hands.l[1] + pai.hands.r[1]) / 2;
    s += put({ hair: 'short', design: true, nose: 'wide', mouth: 'grin', eyes: 'happy', lower: 'shorts', arms: { l: [120, 140], r: [120, 140] }, legs: { l: [30, 40], r: [30, 40] } }, 300, hy - 130 * 0.62, 0.62).svg;
    s += pai.svg;
    s += O.sparkles([[170, 130, 12], [430, 120, 12]]);
    return s;
  });

  // 4. Mãe contando história para duas crianças
  AA.add(2, 4, 'Hora da história', () => {
    let s = A.rect(380, 50, 170, 150, 8) + A.rect(392, 62, 70, 126, 3) + A.rect(468, 62, 70, 126, 3);
    s += O.moon(445, 110, 22) + A.star(505, 95, 12, 5, 5) + A.star(490, 150, 8, 3.6, 5);
    s += A.rect(40, 70, 130, 16, 4) + O.closedBook(65, 52, 22, 36) + O.closedBook(92, 50, 20, 40) + O.closedBook(118, 54, 22, 32) + A.circ(150, 50, 18);
    // sofá (encosto)
    s += A.rect(40, 300, 520, 170, 50);
    const mae = put({ age: 'adult', hair: 'afro', afroSize: 0.75, rx: 41, ry: 52, narrow: 0.14, nose: 'wide', mouth: 'open', lashes: true, earrings: 'hoop', lower: 'dress', sleeve: 'long', arms: { l: [18, -70], r: [18, -70] } }, 300, 250, 0.82);
    s += mae.svg;
    s += put({ hair: 'puff1', nose: 'round', mouth: 'grin', look: 1, lashes: true, lower: 'dress', arms: { l: [8, 4], r: [10, -40] } }, 135, 325, 0.72).svg;
    s += put({ hair: 'hightop', nose: 'broad', mouth: 'grin', look: -1, eyes: 'open', lower: 'shorts', arms: { l: [10, -40], r: [8, 4] } }, 465, 325, 0.72).svg;
    const bx = (mae.hands.l[0] + mae.hands.r[0]) / 2, by = Math.min(mae.hands.l[1], mae.hands.r[1]) - 30;
    s += O.book(bx, by, 52, 58, 0);
    // assento do sofá e braços
    s += A.rect(40, 430, 520, 115, 30) + A.rect(20, 360, 70, 185, 30) + A.rect(510, 360, 70, 185, 30);
    s += L('M213,440L213,500M387,440L387,500');
    s += A.rect(70, 545, 30, 18, 6) + A.rect(500, 545, 30, 18, 6);
    s += O.ground(560);
    return s;
  });

  // 5. Grupo de amigos brincando (pular corda)
  AA.add(2, 5, 'Pular corda', () => {
    let s = O.sun(80, 80, 34) + O.cloud(460, 80, 150) + O.cloud(260, 60, 90);
    s += O.ground(450) + O.bush(560, 450, 120);
    const a = at({ hair: 'boxbraids', nose: 'wide', mouth: 'grin', lashes: true, lower: 'skirt', arms: { l: [10, 6], r: [80, 60] } }, 90, 575, 0.62);
    const b = at({ hair: 'fade', nose: 'broad', mouth: 'grin', lower: 'shorts', arms: { l: [80, 60], r: [10, 6] } }, 510, 575, 0.62);
    const c = at({ hair: 'puffs', puffSize: 0.85, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'dress', arms: { l: [120, 150], r: [120, 150] }, legs: { l: [35, -20], r: [35, -20] } }, 300, 510, 0.62);
    // corda passando por baixo da menina que pula
    const h1 = a.hands.r, h2 = b.hands.l;
    s += A.R(A.ribbonD([h1, [300, 580], h2], 7, 7, true, true), 'rope');
    s += a.svg + b.svg + c.svg;
    s += A.R(A.ribbonD([[h1[0] - 4, h1[1] - 10], [h1[0] + 6, h1[1] + 14]], 12, 12, true, true), 'handle') + A.R(A.ribbonD([[h2[0] + 4, h2[1] - 10], [h2[0] - 6, h2[1] + 14]], 12, 12, true, true), 'handle');
    s += O.confetti([[220, 160, 's', 10], [380, 160, 's', 10]]);
    return s;
  });

  // 6. Crianças soltando pipas
  AA.add(2, 6, 'Soltando pipas', () => {
    let s = O.cloud(300, 80, 150) + O.cloud(80, 260, 100) + O.cloud(530, 290, 90);
    s += O.hills(470, 22) + O.palm(560, 600, 0.75);
    const a = at({ hair: 'locs', locLen: 1.3, nose: 'broad', mouth: 'grin', lower: 'shorts', arms: { l: [20, 10], r: [150, 165] }, legs: { l: [12, 4], r: [4, 2] } }, 180, 585, 0.7);
    const b = at({ hair: 'beads', nose: 'round', mouth: 'grin', lashes: true, lower: 'skirt', arms: { l: [150, 165], r: [25, 15] } }, 400, 585, 0.7);
    s += O.kite(130, 110, 0.8, -15, a.hands.r) + O.kite(470, 130, 0.85, 12, b.hands.l);
    s += a.svg + b.svg;
    s += L('M230,60q10,-10 20,0q10,-10 20,0M350,180q8,-8 16,0q8,-8 16,0');
    return s;
  });

  // 7. Brincando de roda (ciranda)
  AA.add(2, 7, 'Ciranda', () => {
    let s = O.bunting(4, 40, 596, 40, 10, 14) + O.cloud(110, 150, 110) + O.cloud(490, 150, 110);
    s += O.ground(380);
    s += A.ell(300, 450, 270, 80);
    const back = [
      { hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, lower: 'dress' },
      { hair: 'short', nose: 'broad', mouth: 'grin', eyes: 'happy', lower: 'shorts' },
      { hair: 'headband', nose: 'wide', mouth: 'grin', lashes: true, lower: 'skirt' }
    ];
    const front = [
      { hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'shorts' },
      { hair: 'cornrows', rows: 5, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'dress' },
      { hair: 'hightop', nose: 'wide', mouth: 'grin', lower: 'shorts' }
    ];
    const armsOut = { l: [78, 88], r: [78, 88] };
    back.forEach((o, i) => { s += at(Object.assign({ arms: armsOut }, o), 150 + i * 150, 470, 0.66).svg; });
    front.forEach((o, i) => { s += at(Object.assign({ arms: armsOut }, o), 105 + i * 195, 592, 0.74).svg; });
    return s;
  });

  // 8. Meninas sorrindo e abraçadas
  AA.add(2, 8, 'Amigas abraçadas', () => {
    let s = O.confetti([[70, 70, 'h', 20], [530, 70, 'h', 20], [300, 50, 's', 14], [60, 300, 'p', 14], [540, 300, 'p', 14], [140, 180, 'c', 9], [460, 180, 'c', 9]]);
    s += A.circ(300, 330, 230);
    const a = P.putSplit({ hair: 'afro', afroSize: 0.95, nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'skirt', earrings: 'stud', arms: { l: [12, 6], r: [112, 100] } }, 228, 250, 1.05);
    const b = P.putSplit({ hair: 'boxbraids', nose: 'round', mouth: 'grin', lashes: true, lower: 'dress', arms: { l: [60, 40], r: [12, 6] } }, 378, 250, 1.05);
    s += b.arms + a.svg + b.svg + a.arms;
    return s;
  });

  // 9. Crianças estudando juntas
  AA.add(2, 9, 'Estudando juntos', () => {
    let s = O.board(300, 40, 360, 170, L('M160,140l20,-70l20,70M168,115l24,0M222,70l0,70M222,70q34,0 34,17q0,17 -34,17q38,0 38,18q0,18 -38,18M320,80q-24,-14 -40,4q-14,24 4,50q18,10 36,-6') + O.sun(420, 105, 22, 10) + A.R(A.dRect(400, 165, 50, 12, 3)));
    s += A.rect(30, 70, 70, 300, 6) + A.rect(30, 140, 70, 10, 2) + A.rect(30, 230, 70, 10, 2);
    s += O.closedBook(48, 120, 16, 40) + O.closedBook(68, 118, 16, 44) + O.closedBook(48, 210, 16, 40) + O.closedBook(72, 212, 18, 36) + O.globe(66, 300, 22);
    s += A.rect(510, 260, 60, 110, 8) + O.bush(540, 250, 90);
    const k1 = put({ hair: 'beads', nose: 'round', mouth: 'smile', eyes: 'down', lashes: true, lower: 'dress', arms: { l: [10, -60], r: [20, -40] } }, 175, 290, 0.75);
    const k2 = put({ hair: 'short', design: true, nose: 'broad', mouth: 'grin', lower: 'shorts', arms: { l: [30, 140], r: [15, -50] } }, 300, 270, 0.75);
    const k3 = put({ hair: 'puff1', nose: 'wide', mouth: 'lips', eyes: 'down', lashes: true, lower: 'dress', arms: { l: [20, -40], r: [10, -60] } }, 425, 290, 0.75);
    s += k1.svg + k2.svg + k3.svg;
    s += A.rect(70, 420, 460, 30, 10) + A.rect(90, 440, 420, 130, 6) + A.rect(110, 470, 170, 80, 6) + A.rect(320, 470, 170, 80, 6) + A.circ(195, 510, 7) + A.circ(405, 510, 7);
    s += O.book(190, 380, 46, 38, -6) + O.book(415, 382, 46, 38, 6) + O.pencil(300, 408, 90, -8) + O.closedBook(300, 375, 60, 26);
    s += O.ground(580);
    return s;
  });

  // 10. Retrato do grupo de crianças
  AA.add(2, 10, 'Retrato da turma', () => {
    let s = A.rect(30, 40, 540, 520, 20) + A.rect(62, 72, 476, 456, 8);
    [[30, 40], [570, 40], [30, 560], [570, 560]].forEach(([x, y]) => { s += A.circ(x, y, 26) + A.star(x, y, 15, 7, 4, 45); });
    for (let i = 0; i < 6; i++) { s += A.circ(150 + i * 60, 56, 7) + A.circ(150 + i * 60, 544, 7); }
    let inner = '';
    const kids = [
      [{ hair: 'shortafro', nose: 'broad', mouth: 'grin', neckline: 'round' }, 165, 205],
      [{ hair: 'puffs', puffSize: 0.85, nose: 'round', mouth: 'lips', lashes: true, freckles: true, neckline: 'collar' }, 300, 195],
      [{ hair: 'locs', locLen: 1.3, nose: 'wide', mouth: 'smile', neckline: 'v' }, 435, 205],
      [{ hair: 'beads', nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, neckline: 'round' }, 165, 390],
      [{ hair: 'fade', glasses: true, nose: 'broad', mouth: 'grin', neckline: 'collar' }, 300, 380],
      [{ hair: 'boxbraids', nose: 'round', mouth: 'grin', lashes: true, earrings: 'stud', neckline: 'round' }, 435, 390]
    ];
    kids.forEach(([o, x, y]) => { inner += A.G(x, y, 0.72, () => P.bust(Object.assign({ bottom: (540 - y) / 0.72 }, o))); });
    s += O.clip(A.dRect(62, 72, 476, 456, 8), inner);
    return s;
  });
})(window.AA);
