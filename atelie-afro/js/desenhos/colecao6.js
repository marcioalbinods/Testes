/* COLEÇÃO 6 — BRINCADEIRAS DE CRIANÇA */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const FEET = { kid: 262, adult: 345 };
  const at = (o, x, ground, s, flip) => P.put(o, x, ground - (o.age ? FEET.adult : FEET.kid) * s, s, flip);
  const ceu = (sd) => O.sunRich(530, 70, 30) + O.cloudRich(120, 70, 140) + O.cloudRich(340, 55, 100) + O.birdsV([[240, 120, 1], [270, 105, 0.8]]);
  const bolha = (x, y, r) => A.circ(x, y, r) + L(`M${f(x - r * 0.55)},${f(y - r * 0.2)}Q${f(x - r * 0.5)},${f(y - r * 0.55)} ${f(x - r * 0.15)},${f(y - r * 0.6)}`, 2.4);

  // 1. Amarelinha
  AA.add(6, 1, 'Amarelinha', () => {
    let s = ceu() + O.treeRich(70, 330, 0.6) + O.houseRich(500, 330, 0.55) + O.fence(330, 150, 420, 34);
    s += O.ground(330);
    // casas da amarelinha em perspectiva
    const box = (x, y, w, h) => A.poly([[x - w / 2, y], [x + w / 2, y], [x + w / 2 + 6, y + h], [x - w / 2 - 6, y + h]]);
    s += R('M260,350Q300,320 340,350L346,372L254,372Z');
    s += box(300, 372, 80, 38) + box(256, 410, 88, 42) + box(344, 410, 88, 42) + box(300, 452, 100, 44) + box(250, 496, 104, 46) + box(350, 496, 104, 46) + box(300, 542, 116, 54);
    [[300, 391, 1], [256, 431, 2], [344, 431, 3], [300, 474, 4], [250, 519, 5], [350, 519, 6], [300, 569, 7]].forEach(([x, y, n]) => { for (let i = 0; i < n; i++) s += A.dot(x - (n - 1) * 5 + i * 10, y, 3.5); });
    s += O.stone(300, 520, 22);
    s += at({ hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, edges: true, lower: 'skirt', print: 'flower', arms: { l: [110, 120], r: [110, 120] }, legs: { l: [4, 2], r: [70, 140] } }, 300, 470, 0.62).svg;
    s += at({ hair: 'short', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'star', arms: { l: [20, 8], r: [60, 20] } }, 90, 590, 0.62).svg;
    s += at({ hair: 'beads', nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'dress', print: 'dots', arms: { l: [60, 20], r: [20, 8] } }, 510, 590, 0.62).svg;
    s += O.meadow(345, 4, 220, 5, 101);
    return s;
  });

  // 2. Bolhas de sabão
  AA.add(6, 2, 'Bolhas de sabão', () => {
    let s = O.sunRich(80, 70, 28) + O.cloudRich(470, 60, 120);
    s += O.hills(470, 14) + O.meadow(500, 20, 580, 12, 103);
    const g = at({ hair: 'afro', afroSize: 0.9, nose: 'wide', mouth: 'open', lashes: true, edges: true, lower: 'dress', print: 'rainbow', arms: { l: [20, 6], r: [40, -100] } }, 230, 590, 0.95);
    s += g.svg;
    const h = g.hands.r;
    s += R(A.ribbonD([h, [h[0] + 40, h[1] - 60]], 6, 6, true, true)) + A.ring(h[0] + 48, h[1] - 74, 18, 12) + P.fist(h[0], h[1], 11);
    s += A.rect(g.hands.l[0] - 16, g.hands.l[1] - 6, 32, 44, 8) + A.rect(g.hands.l[0] - 10, g.hands.l[1] - 16, 20, 12, 4) + P.fist(g.hands.l[0], g.hands.l[1], 11);
    [[380, 160, 40], [460, 240, 28], [350, 280, 20], [520, 150, 22], [430, 360, 34], [540, 330, 18], [300, 120, 16], [470, 450, 22], [250, 230, 14], [560, 470, 14]].forEach(([x, y, r]) => { s += bolha(x, y, r); });
    s += O.butterfly(100, 300, 0.5, -10);
    return s;
  });

  // 3. Futebol
  AA.add(6, 3, 'Futebol', () => {
    let s = O.cloudRich(110, 60, 120) + O.cloudRich(460, 50, 110) + O.birdsV([[300, 60, 1]]);
    s += A.rect(4, 150, 592, 30, 0);
    for (let i = 0; i < 12; i++) s += A.circ(30 + i * 49, 165, 9);
    s += A.rect(4, 180, 592, 420, 0);
    for (let i = 0; i < 6; i++) s += A.rect(4 + i * 98.7, 180, 49.3, 420, 0);
    s += L('M4,420L596,420') + A.L('M240,420a60,30 0 0,0 120,0');
    // gol com rede
    s += A.rect(380, 200, 200, 130, 4) + A.rect(392, 212, 176, 118, 0);
    let rede = '';
    for (let x = 392; x < 568; x += 16) rede += `M${x},212L${x},330`;
    for (let y = 212; y < 330; y += 16) rede += `M392,${y}L568,${y}`;
    s += A.Lt(rede, 0.35);
    const k = at({ hair: 'hightop', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'stripes', arms: { l: [70, 40], r: [50, -20] }, legs: { l: [6, 2], r: [60, 30] } }, 170, 560, 0.85);
    s += k.svg + O.ball(k.feet.r[0] + 50, k.feet.r[1] - 10, 26);
    s += at({ hair: 'cornrows', rows: 5, nose: 'round', mouth: 'grin', lashes: true, lower: 'shorts', print: 'band', arms: { l: [140, 160], r: [140, 160] }, legs: { l: [20, 10], r: [20, 10] } }, 475, 450, 0.55).svg;
    s += L('M260,510q20,-10 30,-30M250,540q24,-4 40,-20', 2.4);
    return s;
  });

  // 4. Bicicleta
  AA.add(6, 4, 'Passeio de bicicleta', () => {
    let s = ceu() + O.hills(380, 16) + O.treeRich(530, 400, 0.6) + O.houseRich(110, 390, 0.5);
    s += O.ground(420) + O.path(300, 600, 300, 120, 420);
    const wheel = (x, y, r) => { let t = A.ring(x, y, r, r - 12); t += A.circ(x, y, r - 12); let sp = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sp += `M${f(x)},${f(y)}L${f(x + Math.cos(a) * (r - 12))},${f(y + Math.sin(a) * (r - 12))}`; } return t + L(sp, 1.6) + A.circ(x, y, 7); };
    const bx = 300, by = 520;
    s += wheel(bx - 120, by, 62) + wheel(bx + 120, by, 62);
    s += R(A.ribbonD([[bx - 120, by], [bx - 20, by - 10], [bx + 90, by - 100], [bx - 50, by - 100], [bx - 20, by - 10]], 12, 12, true, true));
    s += R(A.ribbonD([[bx + 120, by], [bx + 90, by - 100], [bx + 80, by - 140]], 12, 12, true, true));
    s += R(A.ribbonD([[bx + 50, by - 150], [bx + 110, by - 140]], 12, 12, true, true));
    s += R(A.ribbonD([[bx - 60, by - 100], [bx - 70, by - 120]], 10, 10, true, true)) + A.ell(bx - 70, by - 128, 34, 11);
    s += A.circ(bx - 20, by - 10, 16) + A.rect(bx + 80, by - 132, 40, 26, 6);
    s += at({ hair: 'boxbraids', nose: 'wide', mouth: 'grin', lashes: true, edges: true, lower: 'pants', print: 'heart', arms: { l: [20, 8], r: [40, -30] } }, 110, 595, 0.6).svg;
    s += at({ hair: 'locs', locLen: 1.2, nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'sun', arms: { l: [120, 150], r: [20, 6] } }, 520, 595, 0.6).svg;
    return s;
  });

  // 5. Bambolê
  AA.add(6, 5, 'Bambolê', () => {
    let s = O.bunting(4, 30, 596, 30, 10, 14) + O.cloudRich(110, 120, 110) + O.cloudRich(490, 120, 110);
    s += O.ground(420) + O.meadow(430, 20, 580, 10, 105);
    const g = at({ hair: 'headband', nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'skirt', print: 'star', arms: { l: [130, 160], r: [130, 160] } }, 300, 580, 1.0);
    s += R(A.dEll(300, 455, 120, 30) + A.dEll(300, 455, 108, 22), '', ' fill-rule="evenodd"');
    s += g.svg;
    s += O.clip('M0,455L600,455L600,600L0,600Z', R(A.dEll(300, 455, 120, 30) + A.dEll(300, 455, 108, 22), '', ' fill-rule="evenodd"'));
    s += L('M150,430q-20,10 -30,30M450,430q20,10 30,30M160,480q-14,6 -24,4M440,480q14,6 24,4', 2.4);
    s += A.ring(90, 520, 50, 40) + A.ring(510, 530, 46, 36);
    return s;
  });

  // 6. Esconde-esconde
  AA.add(6, 6, 'Esconde-esconde', () => {
    let s = ceu() + O.hills(400, 14);
    s += O.meadow(460, 20, 580, 12, 107);
    s += at({ hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'pocket', eyes: 'happy', arms: { l: [150, 175], r: [150, 175] } }, 110, 590, 0.65).svg;
    s += A.L('M70,250l-14,-14M150,250l14,-14M110,236l0,-20', 2.6);
    s += at({ hair: 'puff1', nose: 'round', mouth: 'smile', lashes: true, lower: 'dress', print: 'heart', look: -1, arms: { l: [20, 6], r: [20, 6] } }, 390, 590, 0.75).svg;
    s += O.treeRich(390, 600, 1.15, true);
    s += O.bushRich(520, 560, 130);
    return s;
  });

  // 7. Pião e bolinhas de gude
  AA.add(6, 7, 'Pião e bolinhas', () => {
    let s = O.wallpaper(4, 300, 'diamond') + O.planks(300);
    s += A.ell(300, 470, 260, 90) + A.ell(300, 470, 226, 70);
    const piao = (x, y, sc, rot) => A.G(x, y, sc, () => R('M-40,-30Q0,-60 40,-30L4,40L-4,40Z') + A.ell(0, -32, 40, 12) + A.rect(-6, -66, 12, 30, 4) + A.rect(-38, -24, 76, 10, 3) + R('M-4,40L4,40L0,58Z') + A.Lt('M-30,-6L30,-6M-20,12L20,12', 0.6), { rot });
    s += piao(260, 440, 1.3, -10) + piao(420, 420, 0.9, 12);
    s += L('M230,500q-20,6 -40,-4M300,505q20,6 40,-4', 2.4);
    [[150, 480], [180, 500], [380, 500], [420, 520], [460, 485], [340, 530], [210, 530]].forEach(([x, y], i) => { s += A.circ(x, y, 13) + R(`M${x - 6},${y - 2}q6,-10 12,0q-6,8 -12,0Z`); });
    s += at({ hair: 'fade', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'sun', arms: { l: [40, -30], r: [70, 60] } }, 110, 400, 0.55).svg;
    s += at({ hair: 'cornrows', rows: 5, nose: 'wide', mouth: 'grin', lashes: true, lower: 'skirt', print: 'flower', arms: { l: [70, 60], r: [40, -30] } }, 500, 400, 0.55).svg;
    s += O.window(240, 60, 120, 110, O.sunRich(300, 115, 22));
    return s;
  });

  // 8. Balanço no parque
  AA.add(6, 8, 'Balanço', () => {
    let s = ceu() + O.hills(450, 12) + O.meadow(480, 20, 580, 12, 109);
    // estrutura do balanço
    s += R(A.ribbonD([[70, 590], [130, 170]], 16, 16, true, true)) + R(A.ribbonD([[190, 590], [130, 170]], 16, 16, true, true));
    s += R(A.ribbonD([[410, 590], [470, 170]], 16, 16, true, true)) + R(A.ribbonD([[530, 590], [470, 170]], 16, 16, true, true));
    s += A.rect(110, 158, 380, 22, 8);
    const k = at({ hair: 'boxbraids', nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, edges: true, lower: 'dress', print: 'rainbow', arms: { l: [165, 175], r: [165, 175] }, legs: { l: [30, 10], r: [30, 10] } }, 300, 590, 0.75);
    s += L(`M240,180L${f(k.hands.l[0])},${f(k.hands.l[1])}L240,440M360,180L${f(k.hands.r[0])},${f(k.hands.r[1])}L360,440`, 3);
    s += k.svg;
    s += A.rect(222, 430, 156, 20, 6);
    s += L('M170,300q-20,0 -34,10M430,300q20,0 34,10', 2.4);
    return s;
  });

  // 9. Peteca
  AA.add(6, 9, 'Peteca', () => {
    let s = ceu() + O.palm(60, 470, 0.8) + O.palm(550, 460, 0.75);
    s += O.ground(460) + O.meadow(470, 20, 580, 10, 111);
    const pet = (x, y, sc, rot) => A.G(x, y, sc, () => {
      let t = '';
      [-40, -20, 0, 20, 40].forEach((a) => { t += R(A.petalD(0, 0, 80, 12, -90 + a)); });
      return t + R('M-22,0Q-26,30 0,34Q26,30 22,0Z') + A.rect(-24, -6, 48, 12, 5);
    }, { rot });
    s += pet(300, 190, 1.0, 12);
    s += L('M260,260q-20,20 -30,50M340,250q20,20 34,46', 2.4);
    s += at({ hair: 'shortafro', nose: 'broad', mouth: 'open', lower: 'shorts', print: 'band', arms: { l: [20, 8], r: [150, 140] } }, 160, 590, 0.75).svg;
    s += at({ hair: 'puffs', puffSize: 0.85, nose: 'wide', mouth: 'grin', lashes: true, lower: 'skirt', print: 'dots', arms: { l: [150, 140], r: [20, 8] } }, 440, 590, 0.75).svg;
    return s;
  });

  // 10. Castelo de areia na praia
  AA.add(6, 10, 'Castelo de areia', () => {
    let s = O.sunRich(520, 70, 32) + O.cloudRich(130, 70, 130) + O.birdsV([[300, 80, 1], [340, 100, 0.8]]);
    s += A.rect(4, 200, 592, 120, 0);
    let ondas = '';
    for (let i = 0; i < 4; i++) { let d = `M4,${220 + i * 26}`; for (let x = 4; x < 600; x += 40) d += 'q10,-8 20,0t20,0'; ondas += d; }
    s += L(ondas, 2);
    s += O.clipCanvas(R('M-10,300Q150,280 300,300T610,300L610,610L-10,610Z'));
    // barco ao longe
    s += R('M420,236L500,236L486,252L434,252Z') + A.rect(458, 190, 4, 46, 2) + A.poly([[462, 192], [496, 230], [462, 230]]);
    // castelo
    const cx = 330, cy = 520;
    s += A.rect(cx - 110, cy - 90, 220, 90, 4) + A.rect(cx - 140, cy - 140, 60, 140, 4) + A.rect(cx + 80, cy - 140, 60, 140, 4) + A.rect(cx - 40, cy - 170, 80, 80, 4);
    [[cx - 140, cy - 140, 60], [cx + 80, cy - 140, 60], [cx - 40, cy - 170, 80]].forEach(([x, y, w]) => { for (let i = 0; i < 3; i++) s += A.rect(x + i * (w / 3) + 2, y - 14, w / 3 - 8, 16, 2); });
    s += R(`M${cx - 18},${cy}L${cx - 18},${cy - 40}Q${cx},${cy - 60} ${cx + 18},${cy - 40}L${cx + 18},${cy}Z`) + A.rect(cx - 6, cy - 150, 12, 26, 3) + A.rect(cx - 2, cy - 230, 4, 64, 2) + A.poly([[cx + 2, cy - 230], [cx + 40, cy - 216], [cx + 2, cy - 202]]);
    s += A.circ(cx - 110, cy - 100, 8) + A.circ(cx + 110, cy - 100, 8) + A.circ(cx - 60, cy - 50, 8) + A.circ(cx + 60, cy - 50, 8);
    // balde e pá
    s += R('M480,520L540,520L532,580L488,580Z') + A.rect(474, 512, 72, 12, 5) + L('M484,520Q510,480 536,520', 3);
    s += R(A.ribbonD([[560, 590], [580, 500]], 7, 7, true, true)) + R('M566,520l20,-34l14,40Z');
    s += at({ hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, lower: 'dress', print: 'flower', barefoot: true, arms: { l: [20, 8], r: [70, 40] } }, 100, 595, 0.62).svg;
    [[60, 340], [200, 580], [450, 600]].forEach(([x, y]) => { s += A.star(x, y, 18, 8, 5, 10); });
    s += R('M180,350Q200,330 220,350Q200,370 180,350Z') + R('M560,370q14,-20 28,0q-14,20 -28,0Z');
    return s;
  });
})(window.AA);
