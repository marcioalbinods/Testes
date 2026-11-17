/* COLEÇÃO 1 — NOSSOS CABELOS, NOSSA BELEZA */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const bust = (o, x, y, s, extra) => A.G(x, y, s, () => P.bust(Object.assign({ bottom: (604 - y) / s }, o)) + (extra ? extra() : ''));

  // 1. Menina com black power volumoso e flores
  AA.add(1, 1, 'Black power com flores', () => {
    let s = O.rays(300, 230, 24, 520, 4) + O.cornerFlowers() + A.leaf(60, 110, 110, 70, 16) + A.leaf(540, 110, 490, 70, 16);
    s += bust({ hair: 'afro', afroSize: 1.04, rx: 50, ry: 55, nose: 'wide', mouth: 'lips', lashes: true, earrings: 'stud', neckline: 'round',
      deco: (rx, ry, sy) => { let t = ''; for (let i = -4; i <= 4; i++) t += A.poly([[i * 30 - 15, sy + 70], [i * 30 + 15, sy + 70], [i * 30, sy + 46]]); return t + A.rect(-140, sy + 70, 280, 12, 0); } }, 300, 262, 1.55, () => {
      let t = '';
      [[-72, -62, 17], [-38, -98, 15], [4, -110, 13], [52, -92, 16], [80, -50, 13]].forEach(([x, y, r], i) => {
        if (i % 2) t += A.leaf(x + r * 0.7, y + r * 0.5, x + r * 2.1, y + r * 1.0, r * 0.45);
        t += A.flower(x, y, r, i % 2 ? 6 : 5);
      });
      return t;
    });
    s += O.sparkles([[70, 80, 16], [530, 90, 14], [60, 420, 12], [545, 430, 14]]);
    return s;
  });

  // 2. Menino com cabelo crespo curto
  AA.add(1, 2, 'Crespo curtinho', () => {
    let s = O.wallpaper(4, 596, 'diamond') + A.circ(300, 290, 240) + A.ring(300, 290, 240, 205);
    for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180; s += A.circ(300 + Math.cos(a) * 222, 290 + Math.sin(a) * 222, 6); }
    s += O.confetti([[70, 70, 's', 12], [530, 70, 's', 12], [60, 520, 'c', 10], [540, 520, 'c', 10], [150, 560, 't', 10], [450, 560, 't', 10]]);
    s += bust({ hair: 'short', design: true, rx: 52, ry: 57, jaw: 0.85, narrow: 0.05, nose: 'broad', mouth: 'grin', neckline: 'collar',
      deco: (rx, ry, sy) => { let t = ''; for (let i = 0; i < 4; i++) t += A.rect(-200, sy + 60 + i * 40, 400, 18, 0); return t; } }, 300, 250, 1.6);
    return s;
  });

  // 3. Menina com tranças nagô
  AA.add(1, 3, 'Tranças nagô', () => {
    let s = O.wallpaper(4, 596, 'dots') + A.rect(60, 60, 480, 540, 30) + O.confetti([[80, 90, 'h', 18], [520, 100, 'h', 16], [90, 330, 'p', 14], [515, 320, 'p', 14], [140, 190, 'c', 9], [460, 200, 'c', 9], [75, 470, 'h', 14], [530, 470, 'h', 14]]);
    s += bust({ hair: 'cornrows', rows: 7, rx: 47, ry: 57, jaw: 1, narrow: 0.14, nose: 'round', mouth: 'lips', eyes: 'happy', lashes: true, earrings: 'hoop', neckline: 'round',
      deco: (rx, ry, sy) => A.heart(0, sy + 105, 34) + A.heart(-78, sy + 70, 14) + A.heart(78, sy + 70, 14) }, 300, 250, 1.55);
    return s;
  });

  // 4. Menino com dreadlocks
  AA.add(1, 4, 'Dreadlocks', () => {
    let s = O.triBorder(46);
    s += A.rect(70, 70, 460, 470, 220) + A.rect(96, 96, 408, 420, 200);
    for (let i = 0; i < 10; i++) s += A.poly(A.ngonPts(120 + i * 40, 560, 10, 4, 0));
    s += bust({ hair: 'locs', locLen: 2.0, rx: 49, ry: 58, jaw: 0.9, narrow: 0.1, nose: 'wide', mouth: 'smile', neckline: 'v',
      deco: (rx, ry, sy) => A.star(0, sy + 100, 44, 20, 5, 0) + A.circ(-90, sy + 150, 12) + A.circ(90, sy + 150, 12) }, 300, 248, 1.5);
    return s;
  });

  // 5. Menina com box braids e acessórios coloridos
  AA.add(1, 5, 'Box braids', () => {
    let s = '';
    [250, 205, 160].forEach((r) => { s += R(`M${300 - r},430A${r},${r} 0 0,1 ${300 + r},430Z`); });
    s += O.cloudRich(90, 420, 140) + O.cloudRich(510, 420, 140) + O.cloudRich(110, 120, 110) + O.cloudRich(490, 140, 100) + O.birdsV([[200, 70, 1], [400, 60, 1]]);
    s += bust({ hair: 'boxbraids', rx: 47, ry: 56, jaw: 0.95, narrow: 0.12, nose: 'wide', mouth: 'grin', lashes: true, earrings: 'stud', neckline: 'round',
      deco: (rx, ry, sy) => A.heart(0, sy + 95, 30) }, 300, 250, 1.45);
    s += O.sparkles([[70, 70, 14], [530, 70, 14]]);
    return s;
  });

  // 6. Menina com dois coques afro
  AA.add(1, 6, 'Dois coques afro', () => {
    let s = O.wallpaper(4, 596, 'stripes') + A.circ(300, 300, 250) + O.confetti([[60, 60, 'c', 26], [160, 40, 'c', 14], [540, 60, 'c', 26], [450, 40, 'c', 14], [40, 280, 'c', 18], [560, 280, 'c', 18], [80, 520, 'c', 24], [520, 520, 'c', 24]]);
    s += bust({ hair: 'puffs', puffSize: 1.05, rx: 51, ry: 54, jaw: 1, narrow: 0.06, nose: 'round', mouth: 'grin', eyes: 'open', lashes: true, freckles: true, neckline: 'round',
      deco: (rx, ry, sy) => A.flower(-60, sy + 90, 22, 5) + A.flower(55, sy + 120, 26, 6) + A.flower(0, sy + 60, 14, 5) }, 300, 278, 1.5);
    return s;
  });

  // 7. Mulher com turbante e brincos grandes
  AA.add(1, 7, 'Turbante e brincos', () => {
    let pat = '';
    for (let y = -30; y < 640; y += 60) {
      for (let x = -30; x < 640; x += 60) {
        const off = (Math.round(y / 60) % 2) * 30;
        pat += A.poly([[x + off, y - 26], [x + off + 26, y], [x + off, y + 26], [x + off - 26, y]]);
      }
    }
    let s = O.clipCanvas(pat);
    s += bust({ hair: 'turban', rx: 45, ry: 57, jaw: 0.92, narrow: 0.16, nose: 'broad', mouth: 'lips', lipFull: 1.15, lashes: true, earrings: 'big', necklace: true, neckline: 'v', shoulder: 2.4,
      deco: (rx, ry, sy) => { let t = ''; for (let i = -3; i <= 3; i++) t += A.circ(i * 34, sy + 150, 9); return t + A.rect(-200, sy + 125, 400, 10, 0); } }, 300, 300, 1.45);
    return s;
  });

  // 8. Menino com cabelo crespo volumoso
  AA.add(1, 8, 'Crespo volumoso', () => {
    let s = O.zigzagBand(560, 20) + O.zigzagBand(40, -20) + O.rainbowArc(300, 560, 290, 4, 22) + O.confetti([[70, 90, 't', 16], [530, 100, 't', 16], [100, 240, 'd', 12], [500, 240, 'd', 12], [60, 400, 's', 14], [540, 400, 's', 14], [140, 520, 'c', 10], [460, 520, 'c', 10]]);
    s += bust({ hair: 'hightop', rx: 50, ry: 58, jaw: 0.82, narrow: 0.04, nose: 'broad', mouth: 'lips', eyes: 'open', neckline: 'round',
      deco: (rx, ry, sy) => A.poly([[10, sy + 40], [-36, sy + 115], [-4, sy + 115], [-20, sy + 175], [34, sy + 92], [2, sy + 92], [22, sy + 40]]) }, 300, 300, 1.42, () => O.headphones(0, 132, 1.25));
    return s;
  });

  // 9. Menina com tranças enfeitadas com miçangas
  AA.add(1, 9, 'Tranças com miçangas', () => {
    let s = O.sunRich(80, 80, 40) + O.cloudRich(470, 80, 130) + O.birdsV([[260, 60, 1], [300, 80, 0.8]]) + O.hills(500, 12) + O.meadow(530, 120, 480, 8, 21);
    s += O.flowerStem(70, 600, 230, 34) + O.flowerStem(530, 600, 260, 38, 7);
    s += bust({ hair: 'beads', rx: 48, ry: 55, jaw: 0.95, narrow: 0.1, nose: 'wide', mouth: 'grin', eyes: 'happy', lashes: true, neckline: 'collar',
      deco: (rx, ry, sy) => { let t = ''; for (let i = -3; i <= 3; i++) for (let j = 0; j < 3; j++) t += A.circ(i * 40 + (j % 2) * 20, sy + 70 + j * 44, 8); return t; } }, 300, 265, 1.5);
    return s;
  });

  // 10. Grupo de crianças com diferentes penteados
  AA.add(1, 10, 'Turma dos penteados', () => {
    let s = O.wallpaper(4, 596, 'leaves') + O.bunting(10, 30, 590, 30, 9, 22) + O.balloon(50, 140, 26, 60) + O.balloon(550, 140, 26, 60);
    s += bust({ hair: 'locs', locLen: 1.4, rx: 48, ry: 56, nose: 'wide', mouth: 'smile', neckline: 'v' }, 190, 225, 0.82);
    s += bust({ hair: 'puffs', puffSize: 0.9, rx: 50, ry: 54, nose: 'round', mouth: 'grin', lashes: true, neckline: 'round' }, 410, 225, 0.82);
    s += bust({ hair: 'twists', rx: 50, ry: 57, jaw: 0.85, nose: 'broad', mouth: 'grin', neckline: 'collar' }, 100, 395, 0.82);
    s += bust({ hair: 'headband', rx: 47, ry: 56, narrow: 0.14, nose: 'wide', mouth: 'lips', lashes: true, earrings: 'stud', neckline: 'round' }, 300, 400, 0.84);
    s += bust({ hair: 'fade', rx: 51, ry: 58, jaw: 0.8, nose: 'broad', mouth: 'smile', eyes: 'happy', neckline: 'round' }, 500, 395, 0.82);
    return s;
  });
})(window.AA);
