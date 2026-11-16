/* ATELIÊ AFRO — cenários detalhados (céu, chão, casa, interiores, molduras). */
(function (AA) {
  'use strict';
  const A = AA.A, O = AA.O, f = A.f, R = A.R, L = A.L;
  const D2R = Math.PI / 180;
  let seed = 1;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  O.seed = (n) => { seed = n || 1; };

  /* ---------- céu ---------- */
  O.sunRich = (x, y, r) => {
    let s = '';
    for (let i = 0; i < 16; i++) s += R(A.petalD(x, y, r * (i % 2 ? 1.55 : 1.9), r * (i % 2 ? 0.16 : 0.22), i * 22.5, r * 0.95));
    s += A.circ(x, y, r) + A.ring(x, y, r * 0.82, r * 0.7);
    s += A.L(`M${f(x - r * 0.38)},${f(y - r * 0.12)}q${f(r * 0.13)},${f(-r * 0.14)} ${f(r * 0.26)},0M${f(x + r * 0.12)},${f(y - r * 0.12)}q${f(r * 0.13)},${f(-r * 0.14)} ${f(r * 0.26)},0M${f(x - r * 0.3)},${f(y + r * 0.2)}q${f(r * 0.3)},${f(r * 0.28)} ${f(r * 0.6)},0`, 2.6);
    return s;
  };
  O.cloudRich = (x, y, w) => R(A.cloudD(x, y, w * 0.5, w * 0.26, 10, 0.45, 0.2)) +
    A.L(`M${f(x - w * 0.28)},${f(y + w * 0.05)}q${f(w * 0.08)},${f(-w * 0.1)} ${f(w * 0.16)},0M${f(x + w * 0.05)},${f(y - w * 0.04)}q${f(w * 0.08)},${f(-w * 0.1)} ${f(w * 0.16)},0`, 2);
  O.birdsV = (pts) => pts.map(([x, y, s]) => A.L(`M${f(x - 12 * s)},${f(y - 4 * s)}q${f(6 * s)},${f(-6 * s)} ${f(12 * s)},${f(4 * s)}q${f(6 * s)},${f(-10 * s)} ${f(12 * s)},${f(-4 * s)}`, 2.4)).join('');
  O.rainbowArc = (cx, cy, r, n, w) => {
    let s = '';
    for (let i = 0; i < n; i++) { const r1 = r - i * w, r2 = r1 - w; s += R(`M${f(cx - r1)},${f(cy)}A${r1},${r1} 0 0,1 ${f(cx + r1)},${f(cy)}L${f(cx + r2)},${f(cy)}A${r2},${r2} 0 0,0 ${f(cx - r2)},${f(cy)}Z`); }
    return s;
  };

  /* ---------- chão e natureza ---------- */
  O.tuft = (x, y, s) => R(`M${f(x - 12 * s)},${f(y)}L${f(x - 10 * s)},${f(y - 14 * s)}L${f(x - 4 * s)},${f(y - 4 * s)}L${f(x)},${f(y - 20 * s)}L${f(x + 4 * s)},${f(y - 4 * s)}L${f(x + 10 * s)},${f(y - 15 * s)}L${f(x + 12 * s)},${f(y)}Z`);
  O.smallFlower = (x, y, r, n) => R(A.ribbonD([[x, y + r * 3.2], [x, y]], 3, 3, false, false)) + A.leaf(x, y + r * 2.4, x + r * 1.6, y + r * 1.4, r * 0.5, undefined, false) + A.flower(x, y, r, n || 5);
  O.stone = (x, y, w) => R(A.smoothD([[x - w / 2, y], [x - w * 0.35, y - w * 0.35], [x + w * 0.1, y - w * 0.45], [x + w / 2, y - w * 0.1], [x + w * 0.4, y + 2]], true, 0.2));
  O.meadow = (y, x0, x1, n, sd) => {
    O.seed(sd || 7);
    x0 = x0 == null ? 20 : x0; x1 = x1 == null ? 580 : x1;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i + 0.5) / n) * (x1 - x0) + (rnd() - 0.5) * 20, yy = y + rnd() * 36;
      const t = i % 3;
      if (t === 0) s += O.tuft(x, yy, 0.8 + rnd() * 0.5);
      else if (t === 1) s += O.smallFlower(x, yy - 14, 7 + rnd() * 4, 5 + (i % 2));
      else s += O.stone(x, yy, 18 + rnd() * 12);
    }
    return s;
  };
  O.treeRich = (x, y, s, fruits) => A.G(x, y, s, () => {
    let t = R('M-18,0Q-10,-50 -12,-90Q-34,-104 -46,-122L-36,-128Q-18,-110 -6,-104L-4,-136L10,-136L10,-104Q24,-118 40,-132L48,-124Q30,-104 14,-92Q12,-50 20,0Z');
    t += A.Lt('M-4,-20q4,-10 0,-24M6,-50q-4,-10 0,-20M-8,-70q6,-6 4,-14', 0.6);
    [[-60, -150, 48, 38], [55, -155, 50, 40], [0, -200, 62, 46], [-30, -120, 40, 26], [32, -118, 40, 26]].forEach(([cx, cy, w, h], i) => { t += R(A.cloudD(cx, cy, w, h, 9, 0.4, i * 0.3)); });
    t += A.Lt('M-70,-160q10,-8 20,0M40,-170q10,-8 20,0M-10,-210q10,-8 20,0M-20,-130q8,-6 16,0', 0.6);
    if (fruits !== false) [[-40, -170], [30, -185], [70, -140], [-75, -130], [10, -150], [-15, -215]].forEach(([fx, fy]) => { t += A.circ(fx, fy, 9) + A.Lt(`M${fx},${fy - 9}l3,-6`, 0.6); });
    return t;
  });
  O.bushRich = (x, y, w) => R(A.cloudD(x, y, w / 2, w / 3.2, 10, 0.45, 0.5)) + A.flower(x - w * 0.2, y - w * 0.05, w * 0.08, 5) + A.flower(x + w * 0.18, y - w * 0.1, w * 0.07, 5) + A.flower(x, y + w * 0.08, w * 0.06, 5);
  O.fence = (y, x0, x1, h) => {
    let s = R(A.dRect(x0, y - h * 0.7, x1 - x0, 10, 3)) + R(A.dRect(x0, y - h * 0.3, x1 - x0, 10, 3));
    for (let x = x0 + 4; x < x1 - 10; x += 34) s += R(`M${x},${y}L${x},${y - h + 8}L${x + 9},${y - h}L${x + 18},${y - h + 8}L${x + 18},${y}Z`);
    return s;
  };
  O.path = (x, y0, w0, w1, y1) => {
    let s = R(`M${x - w0},${y0}L${x - w1},${y1}L${x + w1},${y1}L${x + w0},${y0}Z`);
    for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6, yy = y0 + (y1 - y0) * t, ww = w0 + (w1 - w0) * t; s += A.ell(x + (i % 2 ? -ww * 0.35 : ww * 0.35), yy, ww * 0.3, 5 + t * 6); }
    return s;
  };
  O.houseRich = (x, y, s) => A.G(x, y, s, () => {
    let t = A.rect(40, -175, 22, 50, 2) + A.rect(36, -180, 30, 10, 2);
    t += A.rect(-90, -110, 180, 110, 2);
    for (let i = 0; i < 5; i++) t += A.Lt(`M-90,${-90 + i * 20}L90,${-90 + i * 20}`, 0.35);
    t += A.poly([[-108, -104], [0, -180], [108, -104]]);
    for (let i = 1; i < 4; i++) { const yy = -180 + i * 19; const hw = 108 * (i * 19) / 76; t += A.Lt(`M${f(-hw)},${yy}L${f(hw)},${yy}`, 0.5); }
    t += A.circ(0, -135, 14) + A.Lt('M0,-149L0,-121M-14,-135L14,-135', 0.5);
    t += A.rect(-18, -66, 36, 66, 4) + A.circ(10, -32, 3.5) + A.rect(-12, -58, 24, 20, 3);
    [[-62, -84], [62, -84]].forEach(([wx, wy]) => {
      t += A.rect(wx - 22, wy - 18, 44, 36, 3) + A.L(`M${wx},${wy - 18}L${wx},${wy + 18}M${wx - 22},${wy}L${wx + 22},${wy}`, 2);
      t += A.rect(wx - 26, wy + 18, 52, 8, 2) + A.flower(wx - 12, wy + 14, 6, 5) + A.flower(wx + 12, wy + 14, 6, 5);
    });
    t += A.rect(-26, -4, 52, 8, 2);
    return t;
  });

  /* ---------- interiores ---------- */
  O.wallpaper = (y0, y1, type) => {
    let s = '';
    if (type === 'stripes') for (let x = 4; x < 600; x += 50) s += A.rect(x, y0, 25, y1 - y0, 0);
    else if (type === 'dots') { s += A.rect(4, y0, 592, y1 - y0, 0); for (let y = y0 + 25; y < y1; y += 50) for (let x = 25 + ((y / 50) % 2) * 25; x < 600; x += 50) s += A.circ(x, y, 7); }
    else if (type === 'diamond') { s += A.rect(4, y0, 592, y1 - y0, 0); for (let y = y0; y < y1 + 30; y += 60) for (let x = 0; x < 640; x += 60) s += A.poly(A.ngonPts(x + ((y - y0) / 60 % 2) * 30, y, 22, 4, 0)); }
    else if (type === 'leaves') { s += A.rect(4, y0, 592, y1 - y0, 0); for (let y = y0 + 30; y < y1; y += 70) for (let x = 35 + ((y / 70) % 2) * 40; x < 600; x += 80) s += A.leaf(x - 14, y + 12, x + 14, y - 12, 9, undefined, true); }
    return O.clip(A.dRect(4, y0, 592, y1 - y0, 0), s) + A.L(`M4,${y1}L596,${y1}`);
  };
  O.planks = (y, h) => {
    let s = '';
    const rows = 3, rh = (h || (596 - y)) / rows;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * 70;
      for (let x = -off; x < 600; x += 140) s += A.rect(x, y + r * rh, 140, rh, 0) + A.Lt(`M${x + 30},${f(y + r * rh + rh * 0.5)}q20,-6 40,0`, 0.4);
    }
    return O.clipCanvas(O.clip(A.dRect(4, y, 592, 600 - y, 0), s));
  };
  O.window = (x, y, w, h, view) => {
    let s = A.rect(x - 8, y - 8, w + 16, h + 16, 6) + A.rect(x, y, w, h, 3);
    if (view) s += O.clip(A.dRect(x, y, w, h, 3), view);
    s += A.rect(x + w / 2 - 4, y, 8, h, 2) + A.rect(x, y + h / 2 - 4, w, 8, 2);
    // cortinas com dobras e laços
    [[-1, x - 4], [1, x + w + 4]].forEach(([sd, cx]) => {
      const c = `M${cx},${y - 14}L${cx - sd * 46},${y - 14}Q${cx - sd * 30},${y + h * 0.4} ${cx - sd * 52},${y + h + 20}L${cx - sd * 18},${y + h + 20}Q${cx - sd * 4},${y + h * 0.55} ${cx},${y - 14}Z`;
      s += R(c) + A.Lt(`M${cx - sd * 24},${y - 10}Q${cx - sd * 16},${y + h * 0.4} ${cx - sd * 32},${y + h + 16}`, 0.5);
      s += A.ell(cx - sd * 26, y + h * 0.48, 10, 7);
    });
    s += A.rect(x - 60, y - 22, w + 120, 10, 5) + A.circ(x - 62, y - 17, 8) + A.circ(x + w + 62, y - 17, 8);
    s += A.rect(x - 14, y + h + 8, w + 28, 12, 4);
    return s;
  };
  O.potPlant = (x, y, s) => A.G(x, y, s, () => {
    let t = '';
    [[-60, -130], [-20, -150], [20, -150], [60, -130], [-80, -80], [80, -80]].forEach(([lx, ly]) => { t += A.leaf(0, -50, lx, ly, 16); });
    t += R('M-38,-50L38,-50L30,10L-30,10Z') + A.rect(-44, -60, 88, 14, 4);
    for (let i = 0; i < 5; i++) t += A.poly([[-28 + i * 14, -36], [-21 + i * 14, -22], [-14 + i * 14, -36]]);
    t += A.Lt('M-34,-14L34,-14', 0.6);
    return t;
  });
  O.rug = (cx, cy, rx, ry) => {
    let s = '';
    for (let i = -10; i <= 10; i++) s += A.Lt(`M${f(cx + i * rx / 10.5)},${f(cy + ry * Math.sqrt(Math.max(0, 1 - (i / 10.5) ** 2)) - 2)}l0,10`, 0.6);
    s += A.ell(cx, cy, rx, ry) + A.ell(cx, cy, rx * 0.78, ry * 0.75) + A.ell(cx, cy, rx * 0.5, ry * 0.48);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; s += A.poly(A.ngonPts(cx + Math.cos(a) * rx * 0.64, cy + Math.sin(a) * ry * 0.62, 7, 4, 0)); }
    return s;
  };
  O.shelf = (x, y, w) => {
    let s = A.rect(x, y, w, 12, 3) + R(`M${x + 10},${y + 12}l10,16l4,-16Z`) + R(`M${x + w - 24},${y + 12}l10,16l4,-16Z`);
    let bx = x + 8;
    [14, 18, 12, 20, 16].forEach((bw, i) => { const bh = 34 + (i % 3) * 8; s += A.rect(bx, y - bh, bw, bh, 2) + A.Lt(`M${bx + 2},${y - bh + 8}l${bw - 4},0`, 0.4); bx += bw + 2; });
    s += R(`M${bx + 4},${y}l26,-30l6,5l-24,25Z`);
    return s;
  };
  O.frameArt = (x, y, w, h, inner) => A.rect(x - 10, y - 10, w + 20, h + 20, 4) + A.rect(x, y, w, h, 2) + (inner ? O.clip(A.dRect(x, y, w, h, 2), inner) : '');
  O.lampFloor = (x, y) => A.rect(x - 30, y - 6, 60, 10, 4) + A.rect(x - 4, y - 200, 8, 196, 3) + R(`M${x - 40},${y - 200}L${x + 40},${y - 200}L${x + 26},${y - 260}L${x - 26},${y - 260}Z`) + A.Lt(`M${x - 34},${y - 222}L${x + 34},${y - 222}`, 0.5);

  /* ---------- molduras da página ---------- */
  O.borderDots = (inset, n) => {
    let s = '';
    const step = (600 - inset * 2) / n;
    for (let i = 0; i <= n; i++) { const p = inset + i * step; s += A.circ(p, inset, 7) + A.circ(p, 600 - inset, 7); if (i && i < n) s += A.circ(inset, p, 7) + A.circ(600 - inset, p, 7); }
    return s;
  };
  O.cornerFlowers = () => [[30, 30], [570, 30], [30, 570], [570, 570]].map(([x, y]) => A.flower(x, y, 20, 6)).join('');
  O.zigzagBand = (y, h, k) => {
    let d = `M4,${y}`;
    for (let x = 4; x < 596; x += 30) d += `L${x + 15},${y - h}L${x + 30},${y}`;
    return O.clipCanvas(R(d + `L596,${y + h}L4,${y + h}Z`, k));
  };
})(window.AA);
