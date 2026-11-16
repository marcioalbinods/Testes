/* COLEÇÃO 3 — CULTURA AFRO-BRASILEIRA */
(function (AA) {
  'use strict';
  const A = AA.A, P = AA.P, O = AA.O, f = A.f, R = A.R, L = A.L;
  const FEET = { kid: 262, adult: 345 };
  const at = (o, x, ground, s, flip) => P.put(o, x, ground - (o.age ? FEET.adult : FEET.kid) * s, s, flip);

  // enfeites de cabeça
  const crown = (rx, ry) => A.poly([[-rx * 0.8, -ry * 0.78], [-rx * 0.9, -ry * 1.55], [-rx * 0.45, -ry * 1.15], [0, -ry * 1.7], [rx * 0.45, -ry * 1.15], [rx * 0.9, -ry * 1.55], [rx * 0.8, -ry * 0.78]]) +
    A.rect(-rx * 0.85, -ry * 0.92, rx * 1.7, ry * 0.22, 4) + A.circ(0, -ry * 1.7, rx * 0.1) + A.circ(-rx * 0.9, -ry * 1.55, rx * 0.08) + A.circ(rx * 0.9, -ry * 1.55, rx * 0.08) + A.ell(0, -ry * 0.81, rx * 0.1, ry * 0.07);
  const ribbonHat = (rx, ry) => {
    let t = '';
    [-1.05, -0.85, 0.85, 1.05].forEach((u, i) => {
      t += A.R(A.ribbonD([[u * rx * 0.95, -ry * 0.85], [u * rx * 1.3, -ry * 0.1], [u * rx * 1.4, ry * (0.7 + (i % 2) * 0.35)]], rx * 0.17, rx * 0.13, false, false));
    });
    t += R(`M${f(-rx * 1.0)},${f(-ry * 0.75)}L${f(-rx * 0.75)},${f(-ry * 1.85)}Q0,${f(-ry * 2.05)} ${f(rx * 0.75)},${f(-ry * 1.85)}L${f(rx * 1.0)},${f(-ry * 0.75)}Z`);
    t += A.ell(0, -ry * 0.78, rx * 1.3, ry * 0.16);
    t += A.circ(0, -ry * 1.35, rx * 0.18) + A.poly(A.ngonPts(-rx * 0.5, -ry * 1.3, rx * 0.13, 4, 0)) + A.poly(A.ngonPts(rx * 0.5, -ry * 1.3, rx * 0.13, 4, 0));
    t += A.flower(0, -ry * 1.95, rx * 0.28, 6);
    return t;
  };
  const headwrap = (rx, ry) => R(A.smoothD([[-rx * 1.08, -ry * 0.3], [-rx * 1.15, -ry * 1.05], [-rx * 0.4, -ry * 1.55], [rx * 0.6, -ry * 1.5], [rx * 1.15, -ry * 1.0], [rx * 1.08, -ry * 0.3], [0, -ry * 0.55]], true, 0.17)) +
    R(A.smoothD([[-rx * 0.6, -ry * 0.9], [rx * 0.1, -ry * 1.45], [rx * 0.95, -ry * 1.05], [rx * 0.3, -ry * 0.75]], true, 0.2)) +
    R(A.petalD(rx * 0.85, -ry * 1.25, rx * 0.65, rx * 0.24, -45)) + R(A.petalD(rx * 0.85, -ry * 1.25, rx * 0.6, rx * 0.22, 15));

  // 1. Crianças praticando capoeira
  AA.add(3, 1, 'Capoeira', () => {
    let s = O.sunRich(300, 70, 32) + O.palm(70, 470, 0.95) + O.palm(540, 470, 0.85);
    s += O.cloudRich(150, 90, 120) + O.cloudRich(470, 110, 110) + O.birdsV([[230, 140, 1], [400, 60, 0.8]]);
    s += O.ground(440) + A.ell(300, 520, 270, 60) + A.ell(300, 520, 230, 44) + O.meadow(450, 20, 580, 10, 31);
    s += at({ age: 'adult', hair: 'short', rx: 42, ry: 52, nose: 'broad', mouth: 'open', beard: 'short', lower: 'pants', barefoot: true, belt: true, print: 'band', arms: { l: [20, 4], r: [45, -100] } }, 545, 470, 0.42).svg + O.berimbau(512, 460, 495, 300, 0.6);
    const cord = { belt: true, barefoot: true, lower: 'pants', sleeve: 'short' };
    s += at(Object.assign({ hair: 'cornrows', rows: 5, nose: 'wide', mouth: 'smile', arms: { l: [120, 100], r: [40, -60] }, legs: { l: [8, 0], r: [110, 95] } }, cord), 200, 560, 0.85).svg;
    s += at(Object.assign({ hair: 'short', nose: 'broad', mouth: 'grin', eyes: 'open', arms: { l: [140, 160], r: [60, -40] }, legs: { l: [50, 10], r: [30, 60] } }, cord), 420, 560, 0.8).svg;
    s += O.notes(520, 210, 0.9) + O.note1(90, 230, 1);
    return s;
  });

  // 2. Pessoa tocando berimbau
  AA.add(3, 2, 'Berimbau', () => {
    let s = O.rays(300, 280, 20, 600, 0);
    s += O.ground(520) + O.zigzagBand(530, 16) + O.meadow(545, 20, 580, 8, 17);
    const m = at({ age: 'adult', hair: 'short', rx: 43, ry: 54, jaw: 0.85, nose: 'broad', mouth: 'open', beard: 'short', lower: 'pants', barefoot: true, belt: true, sleeve: 'short', arms: { l: [22, 4], r: [45, -110] } }, 330, 595, 1.1);
    s += m.svg;
    const hl = m.hands.l, hr = m.hands.r;
    s += O.berimbau(hl[0] + 4, hl[1] + 40, hl[0] - 40, hl[1] - 380, 1.1);
    s += P.fist(hl[0], hl[1], 13);
    s += O.caxixi(hr[0] + 6, hr[1] + 26, 0.7, 10) + O.drumstick(hr[0] + 4, hr[1] + 4, hr[0] - 40, hr[1] - 30);
    s += P.fist(hr[0], hr[1], 13);
    s += O.notes(500, 170, 1) + O.note1(470, 330, 1.1) + O.note1(110, 360, 1);
    return s;
  });

  // 3. Atabaques e outros instrumentos de percussão
  AA.add(3, 3, 'Atabaques', () => {
    let s = '';
    for (let i = 0; i < 6; i++) s += A.rect(4 + i * 99, 4, 99, 380, 0);
    for (let i = 0; i < 6; i++) s += A.poly([[4 + i * 99, 4], [103 + i * 99, 4], [53 + i * 99, 60]]);
    s += O.planks(380) + O.rug(300, 520, 285, 70);
    s += O.atabaque(150, 520, 1.0) + O.atabaque(450, 525, 1.1) + O.atabaque(300, 545, 1.35);
    s += O.pandeiro(95, 545, 42, -10) + O.agogo(520, 550, 0.8, -15);
    return s;
  });

  // 4. Roda de samba
  AA.add(3, 4, 'Roda de samba', () => {
    let s = O.wallpaper(4, 380, 'diamond') + O.bunting(4, 30, 596, 30, 10, 14) + O.frameArt(250, 120, 100, 70, O.note1(300, 175, 1)) ;
    s += A.rect(4, 380, 592, 220, 0);
    for (let i = 0; i < 10; i++) s += A.rect(4 + i * 59.2, 380, 59.2, 30, 0);
    // pandeirista
    const a = at({ age: 'adult', hair: 'waves', beard: 'short', rx: 42, ry: 52, nose: 'broad', mouth: 'open', lower: 'pants', sleeve: 'short', arms: { l: [30, -60], r: [40, -10] } }, 110, 560, 0.72);
    s += a.svg + O.pandeiro(a.hands.l[0] + 5, a.hands.l[1] - 12, 34, 0) + P.fist(a.hands.l[0], a.hands.l[1], 9);
    // cavaquinho
    const b = at({ age: 'adult', hair: 'shortafro', rx: 42, ry: 52, nose: 'wide', mouth: 'smile', eyes: 'happy', lower: 'pants', sleeve: 'short', arms: { l: [25, -80], r: [30, -60] } }, 470, 560, 0.72);
    s += b.svg + O.cavaquinho(470, 410, 0.75, 60) + P.fist(b.hands.r[0], b.hands.r[1], 9);
    // dançarina no centro
    s += at({ age: 'adult', hair: 'afro', afroSize: 0.8, rx: 41, ry: 52, narrow: 0.14, nose: 'wide', mouth: 'grin', lashes: true, earrings: 'hoop', lower: 'dress', skirtLen: 90, arms: { l: [130, 160], r: [70, 20] }, legs: { l: [12, 2], r: [25, 40] } }, 300, 575, 0.82).svg;
    // mesa com surdo
    s += O.notes(270, 120, 0.8) + O.note1(390, 100, 0.9);
    return s;
  });

  // 5. Maracatu
  AA.add(3, 5, 'Maracatu', () => {
    let s = O.sunRich(80, 70, 30) + O.bunting(150, 10, 596, 40, 7, 12);
    s += O.ground(450) + O.meadow(460, 20, 580, 9, 41) + O.houseRich(520, 450, 0.45) + O.cloudRich(420, 140, 90);
    // rainha com coroa e vestido rodado, sob a sombrinha
    const q = at({ age: 'adult', hair: 'bun', rx: 41, ry: 52, narrow: 0.14, nose: 'wide', mouth: 'lips', lashes: true, earrings: 'big', lower: 'dress', skirtLen: 150, sleeve: 'long', headTop: crown, arms: { l: [30, 60], r: [70, 150] },
      topDeco: ({ wy }) => { let t = ''; for (let i = 0; i < 4; i++) t += R(A.dRect(-200, wy + 20 + i * 36, 400, 18, 0)); return t; } }, 210, 580, 0.78);
    // sombrinha (pálio)
    const ux = q.hands.r[0], uy = 110;
    let umb = R(`M${ux - 150},${uy + 40}Q${ux},${uy - 110} ${ux + 150},${uy + 40}Z`);
    for (let i = 0; i < 6; i++) umb += A.Lt(`M${ux},${uy - 35}L${ux - 150 + i * 60},${uy + 40}`, 0.6);
    for (let i = 0; i < 10; i++) umb += R(`M${ux - 150 + i * 30},${uy + 40}l15,22l15,-22Z`);
    s += umb + A.circ(ux, uy - 40, 10);
    // tocador de alfaia
    const d = at({ hair: 'twists', nose: 'broad', mouth: 'grin', lower: 'pants', sleeve: 'short', headTop: (rx, ry) => R(A.dRect(-rx * 1.1, -ry * 0.95, rx * 2.2, ry * 0.3, 8)), arms: { l: [40, -40], r: [60, 140] } }, 450, 580, 0.78);
    s += d.svg;
    s += O.alfaia(450, 492, 0.62) + O.mallet(d.hands.r[0], d.hands.r[1], d.hands.r[0] - 30, d.hands.r[1] + 60) + P.fist(d.hands.r[0], d.hands.r[1], 9);
    s += q.svg;
    s += R(A.ribbonD([[ux, uy - 30], [ux, q.hands.r[1] + 170]], 8, 8, true, true));
    s += P.fist(q.hands.r[0], q.hands.r[1], 10);
    return s;
  });

  // 6. Baiana com vestimentas tradicionais
  AA.add(3, 6, 'Baiana', () => {
    let s = O.wallpaper(4, 460, 'leaves') + O.bunting(4, 30, 596, 30, 9, 16) + O.planks(460) + O.rug(300, 560, 250, 40);
    s += O.flowerStem(60, 600, 220, 30) + O.flowerStem(545, 600, 240, 32, 7);
    const b = at({ age: 'adult', hair: 'bald', ears: true, rx: 43, ry: 53, narrow: 0.12, nose: 'broad', mouth: 'lips', lipFull: 1.15, eyes: 'happy', lashes: true, earrings: 'big', lower: 'dress', skirtLen: 170, sleeve: 'short', headTop: headwrap, bracelet: true,
      wide: 1.1, arms: { l: [35, 20], r: [35, 20] },
      topDeco: ({ wy, sy }) => {
        let t = '';
        // camadas da saia rodada com renda
        for (let i = 0; i < 4; i++) {
          const y = wy + 30 + i * 42;
          t += R(A.dRect(-300, y, 600, 22, 0));
          let sc = `M-300,${y + 22}`;
          for (let x = -300; x < 300; x += 22) sc += `q11,14 22,0`;
          t += A.Lt(sc, 0.6);
        }
        // pano da costa (faixa no peito)
        t += R(`M-80,${sy + 40}L80,${sy + 40}L80,${sy + 82}L-80,${sy + 82}Z`);
        for (let x = -70; x <= 70; x += 28) t += A.poly(A.ngonPts(x, sy + 61, 9, 4, 0));
        return t;
      } }, 300, 590, 0.86);
    s += b.svg;
    // colares de contas
    let col = '';
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < 11; i++) {
        const t = -1 + (2 * i) / 10;
        col += A.circ(300 + t * (24 + k * 9), 343 + (1 - t * t) * (22 + k * 16), 4.5 + (k === 2 && i === 5 ? 3 : 0));
      }
    }
    s += col;
    return s;
  });

  // 7. Congada
  AA.add(3, 7, 'Congada', () => {
    let s = O.bunting(4, 24, 596, 24, 11, 12);
    s += O.ground(470) + O.meadow(480, 220, 580, 7, 23) + O.cloudRich(330, 90, 110) + O.cloudRich(500, 120, 90);
    // estandarte
    const flag = A.rect(70, 70, 12, 420, 4) + R('M82,80L210,80L210,220L146,250L82,220Z') + A.star(146, 150, 34, 15, 8) + A.circ(76, 64, 12);
    s += flag;
    s += at({ age: 'adult', hair: 'short', rx: 42, ry: 52, nose: 'broad', mouth: 'smile', beard: 'short', lower: 'pants', sleeve: 'long', headTop: crown, arms: { l: [25, 10], r: [30, 60] } }, 290, 585, 0.72).svg;
    const t = at({ hair: 'hightop', nose: 'wide', mouth: 'grin', lower: 'pants', sleeve: 'short', headTop: ribbonHat, arms: { l: [40, -30], r: [70, 150] } }, 470, 585, 0.72);
    s += t.svg;
    // caixa (tambor)
    s += A.G(470, 450, 0.7, () => A.rect(-60, -40, 120, 80, 6) + A.ell(0, -40, 60, 14) + A.Lt('M-55,-30L-30,30L-5,-30L20,30L45,-30', 0.7) + A.ell(0, 40, 60, 14));
    s += O.drumstick(t.hands.r[0], t.hands.r[1], t.hands.r[0] - 30, t.hands.r[1] + 50) + P.fist(t.hands.r[0], t.hands.r[1], 8);
    s += at({ hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, lower: 'dress', skirtLen: 70, headTop: ribbonHat, arms: { l: [120, 150], r: [120, 150] } }, 140, 590, 0.65).svg;
    return s;
  });

  // 8. Crianças dançando ao som de tambores
  AA.add(3, 8, 'Dança dos tambores', () => {
    let s = O.notes(90, 100, 1) + O.note1(300, 70, 1.1) + O.notes(470, 90, 0.9) + O.confetti([[200, 130, 'p', 10], [400, 140, 'p', 10]]);
    s += O.ground(400) + O.treeRich(60, 420, 0.6) + O.treeRich(545, 420, 0.6) + O.meadow(410, 150, 450, 6, 51);
    const dr = at({ age: 'adult', hair: 'bun', rx: 41, ry: 52, narrow: 0.12, nose: 'wide', mouth: 'grin', lashes: true, earrings: 'hoop', lower: 'skirt', sleeve: 'short', arms: { l: [30, -30], r: [30, -30] } }, 300, 540, 0.8);
    s += dr.svg + O.atabaque(300, 590, 0.92);
    s += P.fist(dr.hands.l[0], dr.hands.l[1], 10) + P.fist(dr.hands.r[0], dr.hands.r[1], 10);
    s += at({ hair: 'beads', nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'dress', skirtLen: 64, arms: { l: [150, 170], r: [100, 140] }, legs: { l: [10, 0], r: [40, 70] } }, 105, 590, 0.82).svg;
    s += at({ hair: 'locs', locLen: 1.3, nose: 'broad', mouth: 'grin', lower: 'shorts', arms: { l: [100, 140], r: [150, 170] }, legs: { l: [40, 70], r: [10, 0] } }, 495, 590, 0.82).svg;
    return s;
  });

  // 9. Instrumentos musicais afro-brasileiros reunidos
  AA.add(3, 9, 'Instrumentos reunidos', () => {
    let s = '';
    for (let i = 0; i < 5; i++) s += A.ring(300, 300, 290 - i * 52, 264 - i * 52);
    s += O.berimbau(110, 560, 170, 50, 1);
    s += O.pandeiro(300, 160, 70, 0);
    s += O.agogo(470, 170, 1.2, 20);
    s += O.xequere(430, 410, 1.2, -15);
    s += O.recoReco(250, 410, 0.95, 70);
    s += O.caxixi(330, 520, 1.1, 0) + O.caxixi(400, 535, 0.9, 20);
    s += O.tamborim(530, 520, 40, 0);
    return s;
  });

  // 10. Festa cultural
  AA.add(3, 10, 'Festa cultural', () => {
    let s = O.bunting(4, 30, 300, 30, 6, 14) + O.bunting(300, 30, 596, 30, 6, 14) + O.balloon(80, 120, 26, 60) + O.balloon(520, 120, 26, 60);
    s += O.ground(440) + O.meadow(450, 20, 580, 10, 61) + O.cloudRich(300, 150, 100);
    const people = [
      [{ age: 'adult', hair: 'turban', rx: 41, ry: 52, nose: 'broad', mouth: 'grin', lashes: true, earrings: 'big', lower: 'dress', skirtLen: 100, arms: { l: [140, 170], r: [120, 150] }, legs: { l: [10, 0], r: [10, 0] } }, 120, 585, 0.62],
      [{ age: 'adult', hair: 'locs', locLen: 1.4, rx: 42, ry: 52, nose: 'wide', mouth: 'grin', beard: 'short', lower: 'pants', arms: { l: [120, 140], r: [150, 170] }, legs: { l: [30, 50], r: [5, 0] } }, 300, 585, 0.62],
      [{ age: 'adult', hair: 'boxbraids', rx: 41, ry: 52, nose: 'round', mouth: 'grin', eyes: 'happy', lashes: true, lower: 'skirt', arms: { l: [150, 170], r: [140, 160] }, legs: { l: [5, 0], r: [25, 45] } }, 480, 585, 0.62]
    ];
    people.forEach(([o, x, g, sc]) => { s += at(o, x, g, sc).svg; });
    s += at({ hair: 'puffs', puffSize: 0.8, nose: 'round', mouth: 'grin', lashes: true, lower: 'dress', arms: { l: [130, 150], r: [130, 150] } }, 210, 595, 0.5).svg;
    s += at({ hair: 'fade', nose: 'broad', mouth: 'grin', lower: 'shorts', arms: { l: [130, 150], r: [130, 150] } }, 390, 595, 0.5).svg;
    s += O.confetti([[200, 120, 's', 10], [400, 120, 's', 10], [300, 90, 'h', 12], [40, 300, 'c', 8], [560, 300, 'c', 8]]);
    return s;
  });
})(window.AA);
