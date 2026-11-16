/* COLEÇÃO 10 — NOSSO DIA A DIA */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const FEET = { kid: 262, adult: 345 };
  const at = (o, x, ground, s, flip) => P.put(o, x, ground - (o.age ? FEET.adult : FEET.kid) * s, s, flip);
  const espelho = (x, y, w, h) => A.rect(x - 10, y - 10, w + 20, h + 20, 30) + A.rect(x, y, w, h, 22) + L(`M${x + 20},${y + 30}l30,-14M${x + 20},${y + 54}l50,-24`, 2.4);
  const fruta = {
    banana: (x, y, r) => R(`M${x - r},${y}Q${x},${y + r * 1.1} ${x + r},${y - r * 0.4}Q${x},${y + r * 0.5} ${x - r},${y}Z`),
    laranja: (x, y, r) => A.circ(x, y, r) + A.leaf(x, y - r, x + r * 0.8, y - r * 1.5, r * 0.25, undefined, false),
    melancia: (x, y, r) => R(`M${x - r},${y}A${r},${r} 0 0,0 ${x + r},${y}Z`) + R(`M${x - r * 0.82},${y}A${r * 0.82},${r * 0.82} 0 0,0 ${x + r * 0.82},${y}Z`) + A.dot(x - r * 0.3, y + r * 0.3, 3) + A.dot(x + r * 0.2, y + r * 0.4, 3) + A.dot(x, y + r * 0.2, 3),
    abacaxi: (x, y, r) => A.ell(x, y, r * 0.75, r) + A.Lt(`M${x - r * 0.6},${y - r * 0.4}l${r * 1.2},${r * 0.8}M${x + r * 0.6},${y - r * 0.4}l${-r * 1.2},${r * 0.8}`, 0.5) + R(`M${x - r * 0.4},${y - r * 0.9}L${x - r * 0.5},${y - r * 1.7}L${x},${y - r * 1.1}L${x + r * 0.5},${y - r * 1.7}L${x + r * 0.4},${y - r * 0.9}Z`)
  };

  // 1. Salão de beleza (trançando o cabelo)
  AA.add(10, 1, 'Salão de tranças', () => {
    let s = O.wallpaper(4, 430, 'stripes') + O.planks(430);
    s += espelho(70, 70, 140, 180) + espelho(390, 70, 140, 180);
    s += O.shelf(230, 120, 140) + O.potPlant(560, 430, 0.55) + O.frameArt(250, 190, 100, 70, A.flower(300, 225, 22, 6));
    // cadeira
    s += A.rect(200, 300, 200, 200, 30) + A.rect(170, 420, 260, 50, 20) + A.rect(285, 470, 30, 90, 6) + A.ell(300, 565, 90, 16);
    s += at({ hair: 'boxbraids', nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, edges: true, lower: 'dress', print: 'heart', arms: { l: [20, -40], r: [20, -40] } }, 300, 470, 0.72).svg;
    s += A.rect(170, 420, 260, 50, 20);
    s += at({ age: 'adult', hair: 'turban', rx: 41, ry: 52, nose: 'broad', mouth: 'grin', lashes: true, earrings: 'big', lower: 'pants', print: 'diamond', arms: { l: [60, 130], r: [30, -40] } }, 470, 595, 0.72).svg;
    s += A.rect(40, 470, 100, 20, 6) + A.rect(50, 490, 12, 100, 3) + A.rect(118, 490, 12, 100, 3) + A.rect(60, 440, 26, 30, 6) + A.rect(96, 446, 22, 24, 6) + A.ell(73, 440, 13, 4);
    return s;
  });

  // 2. Barbearia
  AA.add(10, 2, 'Barbearia', () => {
    let s = O.wallpaper(4, 430, 'diamond') + O.planks(430);
    s += espelho(200, 60, 200, 170);
    // poste de barbearia
    s += A.rect(50, 70, 50, 20, 6) + A.rect(55, 90, 40, 180, 4) + A.rect(50, 270, 50, 20, 6);
    s += O.clip(A.dRect(55, 90, 40, 180, 4), (() => { let t = ''; for (let i = -2; i < 9; i++) t += A.poly([[55, 90 + i * 30], [95, 70 + i * 30], [95, 85 + i * 30], [55, 105 + i * 30]]); return t; })());
    s += A.rect(450, 120, 110, 12, 3) + A.rect(460, 80, 26, 40, 5) + A.rect(494, 90, 22, 30, 5) + A.rect(524, 74, 20, 46, 5);
    s += A.rect(190, 300, 220, 190, 30) + A.rect(285, 490, 30, 70, 6) + A.ell(300, 565, 90, 16);
    s += at({ hair: 'fade', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'stripes', arms: { l: [20, -40], r: [20, -40] } }, 300, 470, 0.72).svg;
    s += R('M210,400Q300,350 390,400L410,500L190,500Z');
    const b = at({ age: 'adult', hair: 'short', beard: 'full', rx: 43, ry: 54, jaw: 0.85, nose: 'broad', mouth: 'smile', lower: 'pants', print: 'pocket', arms: { l: [70, 140], r: [20, 10] } }, 480, 595, 0.72);
    s += b.svg;
    s += A.G(b.hands.l[0] - 10, b.hands.l[1] - 6, 1, () => A.rect(-12, -30, 24, 40, 6) + A.rect(-14, -40, 28, 12, 3) + A.Lt('M-14,-34l28,0M-14,-30l28,0', 0.5), { rot: -30 });
    return s;
  });

  // 3. Cozinhando com a vovó
  AA.add(10, 3, 'Cozinhando com a vovó', () => {
    let s = O.wallpaper(4, 380, 'dots');
    s += O.window(220, 60, 160, 120, O.sunRich(300, 120, 22) + O.cloudRich(260, 85, 60));
    s += O.shelf(20, 110, 130) + O.shelf(450, 110, 130);
    // fogão e panela
    const avo = P.put({ age: 'elder', elder: true, glasses: true, hair: 'wrap', rx: 42, ry: 52, nose: 'broad', mouth: 'grin', eyes: 'happy', lower: 'dress', print: 'flower', sleeve: 'long', arms: { l: [20, -60], r: [40, -80] } }, 140, 190, 0.78);
    const neta = P.put({ hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'open', lashes: true, edges: true, lower: 'dress', print: 'heart', arms: { l: [40, -80], r: [20, -10] } }, 465, 215, 0.78);
    s += avo.svg + neta.svg;
    s += A.rect(50, 330, 500, 260, 6);
    for (let i = 0; i < 4; i++) s += A.rect(70 + i * 120, 360, 100, 90, 8) + A.circ(120 + i * 120, 405, 8);
    s += A.rect(70, 480, 460, 90, 8) + A.rect(40, 300, 520, 30, 8);
    s += A.G(90, 0, 1, () => R('M150,300L150,250Q150,230 170,230L250,230Q270,230 270,250L270,300Z') + A.rect(140, 222, 140, 14, 6) + A.rect(196, 208, 28, 16, 6) + A.rect(110, 250, 40, 10, 4) + A.rect(270, 250, 40, 10, 4) + L('M180,200q-8,-14 0,-28M210,195q-8,-14 0,-28M240,200q-8,-14 0,-28', 2.4));
    s += A.rect(460, 268, 90, 32, 10) + fruta.laranja(480, 255, 14) + fruta.banana(520, 260, 20) + R(A.ribbonD([[290, 214], [310, 150]], 7, 7, true, true)) + A.ell(312, 142, 14, 10);
    return s;
  });

  // 4. Feira de frutas
  AA.add(10, 4, 'Feira de frutas', () => {
    let s = O.cloudRich(120, 60, 120) + O.sunRich(520, 60, 26);
    // toldo listrado
    s += A.rect(40, 130, 520, 20, 4);
    for (let i = 0; i < 10; i++) s += R(`M${40 + i * 52},150L${92 + i * 52},150L${92 + i * 52},190Q${66 + i * 52},210 ${40 + i * 52},190Z`);
    s += A.rect(50, 150, 14, 300, 3) + A.rect(536, 150, 14, 300, 3);
    s += P.put({ age: 'adult', hair: 'headband', rx: 41, ry: 52, nose: 'wide', mouth: 'grin', lashes: true, earrings: 'hoop', lower: 'dress', print: 'band', arms: { l: [70, 140], r: [70, 140] } }, 300, 250, 0.62).svg;
    s += A.rect(30, 400, 540, 30, 8) + A.rect(40, 430, 520, 160, 6);
    for (let i = 0; i < 4; i++) s += A.rect(60 + i * 125, 450, 110, 120, 8);
    // caixotes de frutas
    s += A.rect(70, 350, 140, 50, 6) + A.rect(230, 350, 140, 50, 6) + A.rect(390, 350, 140, 50, 6);
    [[95, 340], [125, 335], [155, 340], [185, 345], [110, 318], [140, 318], [170, 320]].forEach(([x, y]) => { s += fruta.laranja(x, y, 15); });
    s += fruta.melancia(300, 330, 46) + fruta.banana(260, 345, 26) + fruta.banana(340, 345, 26);
    s += fruta.abacaxi(430, 320, 22) + fruta.abacaxi(490, 325, 20);
    s += A.L('M80,240l-10,30M520,240l10,30', 2);
    return s;
  });

  // 5. Horta comunitária
  AA.add(10, 5, 'Horta comunitária', () => {
    let s = O.sunRich(520, 60, 28) + O.cloudRich(140, 60, 130) + O.fence(330, 4, 596, 40);
    s += O.ground(330);
    for (let r = 0; r < 2; r++) {
      const y = 370 + r * 110;
      s += A.rect(30 + r * 20, y, 540 - r * 40, 60, 14);
      for (let i = 0; i < 7; i++) {
        const x = 70 + r * 20 + i * 72;
        if ((i + r) % 2) s += A.leaf(x, y + 10, x - 26, y - 40, 14) + A.leaf(x, y + 10, x + 26, y - 40, 14) + A.leaf(x, y + 10, x, y - 50, 14);
        else s += R(`M${x - 12},${y + 10}Q${x},${y + 50} ${x + 12},${y + 10}Z`) + A.leaf(x, y + 10, x - 20, y - 36, 10) + A.leaf(x, y + 10, x + 20, y - 36, 10);
      }
    }
    const k = at({ hair: 'locs', locLen: 1.2, nose: 'broad', mouth: 'grin', lower: 'pants', print: 'pocket', arms: { l: [30, -30], r: [60, 30] } }, 140, 590, 0.6);
    s += k.svg;
    s += A.G(k.hands.r[0] + 30, k.hands.r[1] + 10, 1, () => R('M-30,-20L30,-20L20,30L-20,30Z') + R(A.ribbonD([[30, -10], [56, 10]], 10, 6, false, true)) + A.Lt('M-26,-10L26,-10', 0.5));
    s += at({ age: 'elder', elder: true, hair: 'shortafro', rx: 42, ry: 52, nose: 'broad', mouth: 'smile', beard: 'short', lower: 'pants', print: 'band', arms: { l: [20, 6], r: [60, -20] } }, 470, 590, 0.6).svg;
    s += O.treeRich(560, 330, 0.5);
    return s;
  });

  // 6. Biblioteca
  AA.add(10, 6, 'Biblioteca', () => {
    let s = O.planks(470);
    for (let c = 0; c < 2; c++) {
      const x = 20 + c * 400;
      s += A.rect(x, 40, 160, 430, 6);
      for (let r = 0; r < 4; r++) {
        const y = 140 + r * 100;
        s += A.rect(x + 8, y, 144, 10, 2);
        let bx = x + 12;
        [16, 20, 14, 22, 18, 16, 20].forEach((bw, i) => { if (bx + bw > x + 150) return; const bh = 60 + ((i + r) % 3) * 12; s += A.rect(bx, y - bh, bw, bh, 2) + A.Lt(`M${bx + 2},${y - bh + 10}l${bw - 4},0M${bx + 2},${y - 12}l${bw - 4},0`, 0.4); bx += bw + 2; });
      }
    }
    s += O.window(220, 60, 160, 120, O.cloudRich(300, 110, 90));
    s += O.rug(300, 530, 150, 40);
    s += at({ hair: 'beads', nose: 'round', mouth: 'smile', eyes: 'down', lashes: true, edges: true, lower: 'dress', print: 'star', arms: { l: [20, -60], r: [20, -60] } }, 250, 560, 0.7).svg + O.book(250, 410, 46, 46, 0);
    s += at({ hair: 'hightop', glasses: true, nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'sun', arms: { l: [20, -60], r: [20, -60] } }, 370, 560, 0.7).svg + O.book(370, 410, 46, 46, 0);
    return s;
  });

  // 7. Dia de praia
  AA.add(10, 7, 'Dia de praia', () => {
    let s = O.sunRich(90, 70, 32) + O.cloudRich(360, 60, 130) + O.birdsV([[240, 90, 1], [470, 110, 0.9]]);
    s += A.rect(4, 200, 592, 130, 0);
    let ondas = '';
    for (let i = 0; i < 4; i++) { let d = `M4,${220 + i * 28}`; for (let x = 4; x < 600; x += 40) d += 'q10,-8 20,0t20,0'; ondas += d; }
    s += L(ondas, 2);
    s += O.clipCanvas(R('M-10,320Q150,300 300,320T610,320L610,610L-10,610Z'));
    s += O.palm(540, 520, 1.0);
    // guarda-sol e toalha
    s += R(A.ribbonD([[180, 560], [200, 300]], 8, 8, true, true));
    s += R('M80,330Q200,220 330,300Z');
    for (let i = 1; i < 5; i++) s += A.Lt(`M200,300L${80 + i * 50},${330 - i * 6}`, 0.6);
    s += A.rect(260, 500, 200, 70, 8);
    for (let i = 0; i < 5; i++) s += A.rect(260 + i * 40, 500, 20, 70, 0);
    s += at({ hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'sun', barefoot: true, arms: { l: [120, 150], r: [30, 10] } }, 380, 520, 0.62).svg;
    s += O.ball(480, 470, 26);
    [[60, 560], [130, 470], [560, 580]].forEach(([x, y]) => { s += A.star(x, y, 16, 7, 5, 10); });
    s += R('M440,560Q460,540 480,560Q460,580 440,560Z');
    return s;
  });

  // 8. Festa de aniversário
  AA.add(10, 8, 'Festa de aniversário', () => {
    let s = O.wallpaper(4, 430, 'dots') + O.bunting(4, 30, 596, 30, 10, 18) + O.balloon(60, 160, 30, 70) + O.balloon(120, 130, 26, 70) + O.balloon(540, 150, 30, 70) + O.balloon(480, 125, 26, 70);
    s += O.planks(430);
    s += at({ hair: 'puffs', puffSize: 0.85, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, edges: true, lower: 'dress', print: 'star', headTop: (rx, ry) => A.poly([[-rx * 0.4, -ry * 0.95], [rx * 0.1, -ry * 2.0], [rx * 0.5, -ry * 0.9]]) + A.circ(rx * 0.1, -ry * 2.05, rx * 0.13) + A.Lt(`M${-rx * 0.25},${-ry * 1.2}l${rx * 0.6},0M${-rx * 0.05},${-ry * 1.55}l${rx * 0.3},0`, 0.6), arms: { l: [150, 170], r: [150, 170] } }, 300, 330, 0.62).svg;
    s += at({ hair: 'short', nose: 'broad', mouth: 'grin', lower: 'shorts', print: 'stripes', arms: { l: [20, 6], r: [40, 20] } }, 120, 380, 0.55).svg;
    s += at({ hair: 'cornrows', rows: 5, nose: 'wide', mouth: 'grin', lashes: true, lower: 'skirt', print: 'heart', arms: { l: [40, 20], r: [20, 6] } }, 480, 380, 0.55).svg;
    // mesa e bolo
    s += R('M40,400L560,400L540,590L60,590Z') + O.clip('M40,400L560,400L540,590L60,590Z', (() => { let t = ''; for (let i = 0; i < 12; i++) t += R(`M${40 + i * 44},400l22,30l22,-30Z`); return t; })());
    s += A.ell(300, 395, 120, 16) + A.rect(200, 320, 200, 70, 10) + A.rect(230, 270, 140, 56, 10);
    s += O.clip(A.dRect(200, 320, 200, 70, 10), (() => { let t = ''; for (let i = 0; i < 9; i++) t += A.circ(212 + i * 22, 322, 12); return t; })());
    for (let i = 0; i < 5; i++) s += A.rect(250 + i * 25, 236, 8, 34, 2) + R(`M${254 + i * 25},218q-7,10 0,18q7,-8 0,-18Z`);
    s += O.confetti([[180, 200, 's', 10], [420, 200, 's', 10], [300, 120, 'h', 12]]);
    return s;
  });

  // 9. Ônibus escolar
  AA.add(10, 9, 'A caminho da escola', () => {
    let s = O.sunRich(520, 60, 28) + O.cloudRich(130, 60, 130) + O.treeRich(70, 360, 0.55) + O.treeRich(540, 360, 0.55);
    s += O.ground(360) + A.rect(4, 470, 592, 120, 0);
    for (let i = 0; i < 6; i++) s += A.rect(20 + i * 100, 525, 60, 10, 3);
    const bx = 300, by = 450;
    s += A.rect(bx - 230, by - 170, 450, 150, 24) + A.rect(bx + 200, by - 90, 50, 70, 14);
    for (let i = 0; i < 5; i++) s += A.rect(bx - 210 + i * 80, by - 150, 64, 56, 8);
    s += A.rect(bx + 168, by - 150, 44, 110, 6) + A.L(`M${bx + 190},${by - 150}l0,110`);
    s += A.rect(bx - 230, by - 80, 450, 16, 0) + A.circ(bx + 238, by - 60, 10) + A.rect(bx - 240, by - 40, 30, 14, 4);
    s += A.ring(bx - 140, by - 10, 42, 18) + A.circ(bx - 140, by - 10, 18) + A.ring(bx + 140, by - 10, 42, 18) + A.circ(bx + 140, by - 10, 18);
    [[bx - 178, 'puffs'], [bx - 98, 'short'], [bx - 18, 'beads'], [bx + 62, 'locs']].forEach(([x, h], i) => { s += O.clip(A.dRect(x - 32, by - 150, 64, 56, 8), A.G(x, by - 110, 0.45, () => P.head({ hair: h, puffSize: 0.7, locLen: 1, nose: 'wide', mouth: 'grin', lashes: i % 2 === 0 }))); });
    s += at({ hair: 'boxbraids', nose: 'round', mouth: 'grin', lashes: true, lower: 'skirt', print: 'flower', arms: { l: [20, 6], r: [130, 160] } }, 540, 590, 0.42).svg;
    return s;
  });

  // 10. Hora de dormir
  AA.add(10, 10, 'Hora de dormir', () => {
    let s = A.rect(4, 4, 592, 436, 0);
    for (let i = 0; i < 14; i++) s += A.star(30 + (i * 83) % 560, 40 + ((i * 47) % 380), 9, 4, 5, i * 7);
    s += O.window(380, 60, 150, 140, A.rect(380, 60, 150, 140, 0) + O.moon(450, 120, 30) + A.star(500, 90, 10, 4, 5) + A.star(410, 170, 8, 3.5, 5));
    s += O.planks(440);
    // cama
    s += A.rect(40, 250, 40, 300, 10) + A.rect(80, 300, 400, 30, 8) + A.rect(80, 330, 420, 150, 14) + A.rect(500, 330, 40, 220, 10);
    s += A.rect(100, 290, 130, 60, 26);
    s += O.clip(A.dRect(80, 330, 420, 150, 14), (() => { let t = A.rect(80, 380, 420, 100, 0); for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) t += A.poly(A.ngonPts(120 + i * 70, 410 + j * 40, 16, 4, 0)); return t; })());
    s += A.G(165, 300, 0.75, () => P.head({ hair: 'puffs', puffSize: 0.75, eyes: 'happy', nose: 'round', mouth: 'smile', lashes: true }));
    s += A.G(400, 330, 0.7, () => A.circ(0, -40, 34) + A.circ(-26, -68, 13) + A.circ(26, -68, 13) + A.ell(0, -28, 14, 10) + A.dot(-12, -46, 4) + A.dot(12, -46, 4) + A.dot(0, -30, 4) + A.ell(0, 20, 40, 34));
    s += A.rect(540, 380, 50, 60, 6) + R('M545,380L585,380L575,330L555,330Z');
    s += A.L('M240,260q10,-10 20,0q10,-10 20,0M270,230q8,-8 16,0q8,-8 16,0', 2.4);
    s += O.rug(300, 560, 200, 30);
    return s;
  });
})(window.AA);
