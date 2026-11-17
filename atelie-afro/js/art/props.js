/* ATELIÊ AFRO — objetos, cenários e enfeites reutilizáveis (todos em regiões fechadas). */
(function (AA) {
  'use strict';
  const A = AA.A, f = A.f, R = A.R, L = A.L;
  const O = {};
  const D2R = Math.PI / 180;

  /* ---------- fundo e molduras ---------- */
  O.bg = () => R(A.dRect(4, 4, 592, 592, 22), 'bg');
  O.clipCanvas = (inner) => {
    const id = A.uid();
    return `<defs><clipPath id="${id}"><path d="${A.dRect(4, 4, 592, 592, 22)}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`;
  };
  O.clip = (d, inner) => {
    const id = A.uid();
    return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">${inner}</g>`;
  };
  // raios de sol (fatias) a partir de um centro
  O.rays = (cx, cy, n, r, startDeg) => {
    let s = '';
    for (let i = 0; i < n; i += 2) {
      const a1 = ((startDeg || 0) + (i * 360) / n) * D2R, a2 = ((startDeg || 0) + ((i + 1) * 360) / n) * D2R;
      s += A.poly([[cx, cy], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r], [cx + Math.cos(a2) * r, cy + Math.sin(a2) * r]], 'bg2');
    }
    return O.clipCanvas(s);
  };
  // borda de triângulos (inspirada em tecidos)
  O.triBorder = (size, inset) => {
    inset = inset || 4;
    let s = '';
    const n = Math.floor(592 / size);
    const st = 592 / n;
    for (let i = 0; i < n; i++) {
      const x = 4 + i * st;
      s += A.poly([[x, inset], [x + st, inset], [x + st / 2, inset + size * 0.8]], 'bg2');
      s += A.poly([[x, 600 - inset], [x + st, 600 - inset], [x + st / 2, 600 - inset - size * 0.8]], 'bg2');
      s += A.poly([[inset, x], [inset, x + st], [inset + size * 0.8, x + st / 2]], 'bg3');
      s += A.poly([[600 - inset, x], [600 - inset, x + st], [600 - inset - size * 0.8, x + st / 2]], 'bg3');
    }
    return O.clipCanvas(s);
  };
  O.confetti = (pts) => pts.map(([x, y, t, r], i) => {
    r = r || 9;
    if (t === 's') return A.star(x, y, r * 1.3, r * 0.55, 5, i * 13);
    if (t === 'h') return A.heart(x, y, r);
    if (t === 'c') return A.circ(x, y, r);
    if (t === 't') return A.poly(A.ngonPts(x, y, r * 1.2, 3, i * 20));
    if (t === 'd') return A.poly(A.ngonPts(x, y, r * 1.2, 4, 0));
    if (t === 'p') return A.sparkle(x, y, r * 1.5);
    return A.circ(x, y, r);
  }).join('');

  /* ---------- natureza ---------- */
  O.sun = (x, y, r, n) => {
    n = n || 12;
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i * 360) / n;
      s += R(A.petalD(x, y, r * 1.75, r * 0.2, a, r * 0.9), 'sun2');
    }
    return s + A.circ(x, y, r, 'sun');
  };
  O.sunFace = (x, y, r) => O.sun(x, y, r) +
    L(`M${f(x - r * 0.42)},${f(y - r * 0.1)}q${f(r * 0.12)},${f(-r * 0.15)} ${f(r * 0.24)},0M${f(x + r * 0.18)},${f(y - r * 0.1)}q${f(r * 0.12)},${f(-r * 0.15)} ${f(r * 0.24)},0M${f(x - r * 0.35)},${f(y + r * 0.25)}q${f(r * 0.35)},${f(r * 0.3)} ${f(r * 0.7)},0`);
  O.cloud = (x, y, w) => R(A.cloudD(x, y, w * 0.5, w * 0.26, 9, 0.45, 0.2), 'cloud');
  O.moon = (x, y, r, k) => R(`M${f(x + r * 0.3)},${f(y - r)}A${f(r)},${f(r)} 0 1,0 ${f(x + r * 0.3)},${f(y + r)}A${f(r * 0.8)},${f(r * 0.8)} 0 1,1 ${f(x + r * 0.3)},${f(y - r)}Z`, k || 'moon');
  O.hills = (y, amp, k) => {
    const pts = [[-10, 610]];
    for (let x = -10; x <= 610; x += 40) pts.push([x, y + Math.sin(x / 90) * amp]);
    pts.push([610, 610]);
    return O.clipCanvas(R(A.smoothD(pts, true, 0.1), k || 'ground'));
  };
  O.ground = (y, k) => O.clipCanvas(R(A.dPoly([[-10, y], [610, y], [610, 610], [-10, 610]]), k || 'ground'));
  O.grass = (x, y, w) => {
    let d = `M${f(x)},${f(y)}`;
    const n = Math.max(3, Math.round(w / 14));
    for (let i = 0; i < n; i++) {
      const x0 = x + (i * w) / n;
      d += `L${f(x0 + w / n / 2)},${f(y - 14 - (i % 2) * 6)}L${f(x0 + w / n)},${f(y)}`;
    }
    return R(d + 'Z', 'grass');
  };
  O.tree = (x, y, s) => A.G(x, y, s, () =>
    R('M-14,0L-10,-80Q-30,-95 -38,-110L-30,-114Q-14,-100 -4,-96L0,-120L10,-118L8,-94Q22,-104 34,-118L42,-112Q26,-92 12,-80L16,0Z', 'trunk') +
    R(A.cloudD(0, -150, 80, 62, 13, 0.4, 0.1), 'leaf') +
    A.circ(-30, -150, 9, 'fruit') + A.circ(25, -170, 9, 'fruit') + A.circ(30, -125, 9, 'fruit'));
  O.palm = (x, y, s) => A.G(x, y, s, () => {
    let t = R('M-10,0Q-2,-80 10,-160L22,-158Q10,-80 10,0Z', 'trunk');
    for (let i = 0; i < 5; i++) t += A.Lt(`M${-8 + i * 1.5},${-30 - i * 28}l18,-4`, 0.6);
    [-150, -110, -60, -20, 25].forEach((a) => { t += A.R(A.petalD(16, -160, 95, 20, a), 'leaf'); });
    return t + A.circ(10, -150, 9, 'fruit') + A.circ(24, -148, 9, 'fruit');
  });
  O.bush = (x, y, w) => R(A.cloudD(x, y, w / 2, w / 3.2, 9, 0.4, 0.5), 'leaf');
  O.flowerStem = (x, y, h, r, n) => R(A.ribbonD([[x, y], [x + 6, y - h / 2], [x, y - h]], 6, 5, false, false), 'stem') +
    A.leaf(x + 3, y - h * 0.35, x + 34, y - h * 0.55, 11, 'leaf') + A.leaf(x + 1, y - h * 0.55, x - 30, y - h * 0.72, 10, 'leaf') + A.flower(x, y - h, r, n || 6, 'petal', 'center');
  O.bird = (x, y, s, flip) => A.G(x, y, s, () =>
    R('M-34,4Q-30,-26 0,-26Q30,-26 36,-4Q40,10 28,22Q4,34 -20,24Z', 'bird') +
    R('M-6,-6Q8,-40 34,-46Q24,-14 10,6Z', 'wing') +
    A.circ(30, -22, 16, 'bird') + R('M44,-26L62,-20L44,-14Z', 'beak') + A.dot(34, -25, 3) +
    R('M-32,6L-62,-10L-58,10L-66,24L-30,16Z', 'tail') + A.Lt('M-4,30l-4,14M6,30l2,14', 0.8), { flip });
  O.butterfly = (x, y, s, rot) => A.G(x, y, s, () =>
    R(A.smoothD([[0, -6], [-22, -46], [-58, -48], [-62, -14], [-30, 4]], true, 0.2), 'wing') +
    R(A.smoothD([[0, -6], [22, -46], [58, -48], [62, -14], [30, 4]], true, 0.2), 'wing') +
    R(A.smoothD([[0, 4], [-30, 8], [-48, 34], [-26, 48], [-6, 26]], true, 0.2), 'wing2') +
    R(A.smoothD([[0, 4], [30, 8], [48, 34], [26, 48], [6, 26]], true, 0.2), 'wing2') +
    A.circ(-36, -26, 9, 'dot') + A.circ(36, -26, 9, 'dot') + A.circ(-26, 28, 6, 'dot') + A.circ(26, 28, 6, 'dot') +
    A.ell(0, 6, 6, 30, 'body') + A.circ(0, -28, 8, 'body') + A.Lt('M-3,-34Q-10,-50 -18,-54M3,-34Q10,-50 18,-54', 0.8) + A.dot(-18, -54, 3) + A.dot(18, -54, 3), { rot });

  /* ---------- festa ---------- */
  O.bunting = (x1, y1, x2, y2, n, sag) => {
    sag = sag == null ? 30 : sag;
    let s = L(`M${f(x1)},${f(y1)}Q${f((x1 + x2) / 2)},${f((y1 + y2) / 2 + sag * 2)} ${f(x2)},${f(y2)}`);
    const pt = (t) => {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag * 2;
      return [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2];
    };
    for (let i = 0; i < n; i++) {
      const a = pt((i + 0.1) / n), b = pt((i + 0.9) / n), c = pt((i + 0.5) / n);
      s += A.poly([a, b, [c[0], c[1] + 40]], 'flag');
    }
    return s;
  };
  O.balloon = (x, y, r, len) => L(`M${f(x)},${f(y + r * 1.15)}q-8,${f(len / 2)} 4,${f(len)}`) + R(`M${f(x)},${f(y + r * 1.18)}C${f(x - r * 1.4)},${f(y + r * 0.5)} ${f(x - r)},${f(y - r * 1.2)} ${f(x)},${f(y - r * 1.15)}C${f(x + r)},${f(y - r * 1.2)} ${f(x + r * 1.4)},${f(y + r * 0.5)} ${f(x)},${f(y + r * 1.18)}Z`, 'balloon') + A.poly([[x - 6, y + r * 1.32], [x + 6, y + r * 1.32], [x, y + r * 1.1]], 'balloon');
  O.notes = (x, y, s) => A.G(x, y, s, () =>
    L('M0,0L0,-44M34,-10L34,-54') + A.ell(-8, 2, 11, 8, 'note') + A.ell(26, -8, 11, 8, 'note') + R('M0,-44L34,-54L34,-42L0,-32Z', 'note'));
  O.note1 = (x, y, s) => A.G(x, y, s, () => L('M10,0L10,-46Q22,-40 26,-28') + A.ell(0, 2, 12, 9, 'note'));

  /* ---------- pipas ---------- */
  O.kite = (x, y, s, rot, tailTo) => {
    let t = A.G(x, y, s, () => {
      let k = A.poly([[0, -60], [-44, -6], [0, 0]], 'kite') + A.poly([[0, -60], [44, -6], [0, 0]], 'kite2') +
        A.poly([[-44, -6], [0, 0], [0, 60]], 'kite2') + A.poly([[44, -6], [0, 0], [0, 60]], 'kite');
      k += L('M0,60Q-20,100 6,130Q30,160 0,200');
      [[-6, 100], [12, 150], [-2, 192]].forEach(([bx, by]) => {
        k += A.poly([[bx, by], [bx - 16, by - 9], [bx - 16, by + 9]], 'bow') + A.poly([[bx, by], [bx + 16, by - 9], [bx + 16, by + 9]], 'bow2');
      });
      return k;
    }, { rot });
    if (tailTo) t = L(`M${f(x)},${f(y + 2 * s)}Q${f((x + tailTo[0]) / 2 + 40)},${f((y + tailTo[1]) / 2 + 30)} ${f(tailTo[0])},${f(tailTo[1])}`, 2) + t;
    return t;
  };

  /* ---------- instrumentos afro-brasileiros ---------- */
  O.berimbau = (xb, yb, xt, yt, s) => {
    // verga (arco de madeira) de baixo (xb,yb) para cima (xt,yt), corda, cabaça
    s = s || 1;
    const mx = (xb + xt) / 2, my = (yb + yt) / 2;
    const dx = xt - xb, dy = yt - yb, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const bend = len * 0.09;
    const verga = A.ribbonD([[xb, yb], [mx + nx * bend, my + ny * bend], [xt, yt]], 9 * s, 7 * s, true, true);
    let out = R(verga, 'wood') + L(`M${f(xb + nx * 2)},${f(yb + ny * 2)}L${f(xt + nx * 2)},${f(yt + ny * 2)}`, 2);
    // cabaça perto da base
    const cx = xb + dx * 0.16 - nx * 22 * s, cy = yb + dy * 0.16 - ny * 22 * s;
    out += A.circ(cx, cy, 26 * s, 'gourd') + A.ring(cx - nx * 10 * s, cy - ny * 10 * s, 14 * s, 8 * s, 'gourd2');
    out += L(`M${f(cx + nx * 18 * s)},${f(cy + ny * 18 * s)}L${f(xb + dx * 0.16 + nx * 3)},${f(yb + dy * 0.16 + ny * 3)}`, 2);
    return out;
  };
  O.caxixi = (x, y, s, rot) => A.G(x, y, s, () =>
    R('M-20,10Q-26,-20 -6,-40L6,-40Q26,-20 20,10Z', 'basket') + A.ell(0, 10, 20, 7, 'basket2') + R('M-6,-40Q-8,-58 0,-62Q8,-58 6,-40Z', 'basket2') +
    A.Lt('M-18,-8L18,-8M-14,-24L14,-24M-8,-36L-16,6M8,-36L16,6M0,-38L0,4', 0.6), { rot });
  O.atabaque = (x, y, s) => A.G(x, y, s, () => {
    let t = R('M-62,-180L62,-180L48,0L-48,0Z', 'drum');
    t += R('M-48,0L48,0L42,30L-42,30Z', 'drum2');
    t += A.ell(0, -180, 62, 15, 'skin2');
    t += R(A.dRect(-66, -164, 132, 18, 6), 'band');
    t += R(A.dRect(-56, -60, 112, 16, 6), 'band');
    // cordas em zigue-zague
    let zz = '';
    for (let i = 0; i < 8; i++) {
      const xa = -54 + i * 15, xb2 = xa + 7.5;
      zz += `M${f(xa)},-146L${f(xb2 * 0.88)},-62`;
      zz += `M${f(xb2 * 0.88)},-62L${f(xa + 15)},-146`;
    }
    t += A.Lt(zz, 0.7);
    t += A.Lt('M-30,-44L-26,-4M0,-44L0,-4M30,-44L26,-4', 0.6);
    return t;
  });
  O.pandeiro = (x, y, r, rot) => A.G(x, y, 1, () => {
    let t = A.ring(0, 0, r, r * 0.8, 'frame') + A.circ(0, 0, r * 0.8, 'skin2');
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 + 30) * D2R;
      t += A.R(A.dRect(-r * 0.16, -r * 0.08, r * 0.32, r * 0.16, 3), 'metal', ` transform="translate(${f(Math.cos(a) * r * 0.9)},${f(Math.sin(a) * r * 0.9)}) rotate(${f(i * 60 + 120)})"`);
    }
    return t;
  }, { rot });
  O.agogo = (x, y, s, rot) => A.G(x, y, s, () =>
    R(A.ribbonD([[-30, -48], [-32, -86], [0, -100], [30, -88], [30, -66]], 7, 7, true, true), 'wood') +
    R(A.smoothD([[-36, -50], [-24, -50], [-12, 30], [-30, 36], [-48, 30]], true, 0.12), 'metal') + A.ell(-30, 30, 18, 6, 'metal') +
    R(A.smoothD([[24, -68], [36, -68], [46, 20], [30, 25], [14, 20]], true, 0.12), 'metal2') + A.ell(30, 20, 16, 5, 'metal2'), { rot });
  O.recoReco = (x, y, s, rot) => A.G(x, y, s, () => {
    let t = A.rect(-14, -70, 28, 140, 12, 'wood');
    for (let i = -56; i < 60; i += 10) t += A.Lt(`M-12,${i}L12,${i}`, 0.6);
    return t;
  }, { rot });
  O.alfaia = (x, y, s) => A.G(x, y, s, () => {
    let t = R('M-70,-60L70,-60L70,60L-70,60Z', 'drum') + A.ell(0, -60, 70, 18, 'skin2') + A.R(A.dEll(0, 60, 70, 18), 'drum2');
    t += A.R(A.dRect(-74, -54, 148, 14, 6), 'band') + A.R(A.dRect(-74, 50, 148, 14, 6), 'band');
    let zz = '';
    for (let i = 0; i < 7; i++) { const xa = -66 + i * 20; zz += `M${xa},-40L${xa + 10},50L${xa + 20},-40`; }
    return t + A.Lt(zz, 0.7);
  });
  O.surdo = (x, y, s) => A.G(x, y, s, () => {
    let t = A.rect(-58, -50, 116, 100, 4, 'drum') + A.ell(0, -50, 58, 14, 'skin2');
    for (let i = 0; i < 6; i++) t += A.rect(-56 + i * 21, -36, 8, 72, 3, 'metal');
    return t + A.ell(0, 50, 58, 14, 'drum2');
  });
  O.tamborim = (x, y, r, rot) => A.G(x, y, 1, () => A.ring(0, 0, r, r * 0.82, 'frame') + A.circ(0, 0, r * 0.82, 'skin2'), { rot });
  O.xequere = (x, y, s, rot) => A.G(x, y, s, () => {
    let t = R(A.smoothD([[0, -70], [26, -56], [44, -10], [40, 34], [0, 60], [-40, 34], [-44, -10], [-26, -56]], true, 0.18), 'gourd');
    t += A.rect(-10, -86, 20, 22, 6, 'gourd2');
    [[-20, -30], [8, -38], [28, -12], [-30, 4], [0, -6], [24, 20], [-16, 30], [8, 40], [-34, -16]].forEach(([bx, by]) => { t += A.circ(bx, by, 6, 'bead'); });
    t += A.Lt('M-20,-30L8,-38L28,-12L24,20L8,40L-16,30L-30,4L-34,-16L-20,-30M0,-6L-20,-30M0,-6L28,-12M0,-6L-16,30M0,-6L24,20', 0.45);
    return t;
  }, { rot });
  O.cavaquinho = (x, y, s, rot) => A.G(x, y, s, () =>
    R(A.smoothD([[0, -20], [30, -30], [42, 6], [34, 46], [0, 56], [-34, 46], [-42, 6], [-30, -30]], true, 0.2), 'wood') +
    A.circ(0, 4, 13, 'hole') + A.rect(-8, -130, 16, 112, 4, 'wood2') + A.rect(-11, -158, 22, 30, 6, 'wood') +
    A.rect(-16, 26, 32, 8, 3, 'wood2') + A.Lt('M-3,-150L-3,30M3,-150L3,30', 0.4), { rot });
  O.violao = (x, y, s, rot) => A.G(x, y, s, () =>
    R(A.smoothD([[0, -40], [34, -50], [50, -14], [38, 14], [58, 50], [44, 88], [0, 100], [-44, 88], [-58, 50], [-38, 14], [-50, -14], [-34, -50]], true, 0.18), 'wood') +
    A.circ(0, 18, 17, 'hole') + A.rect(-9, -180, 18, 150, 4, 'wood2') + A.rect(-13, -214, 26, 38, 7, 'wood') +
    A.rect(-20, 56, 40, 10, 3, 'wood2') + A.Lt('M-4,-205L-4,60M0,-205L0,60M4,-205L4,60', 0.4), { rot });
  O.drumstick = (x1, y1, x2, y2) => R(A.ribbonD([[x1, y1], [x2, y2]], 6, 6, true, true), 'wood') + A.circ(x2, y2, 6, 'wood2');
  O.mallet = (x1, y1, x2, y2) => R(A.ribbonD([[x1, y1], [x2, y2]], 6, 6, true, true), 'wood') + A.circ(x2, y2, 11, 'wood2');

  /* ---------- escola e profissões ---------- */
  O.book = (x, y, w, h, rot) => A.G(x, y, 1, () =>
    R(`M0,0Q${f(-w * 0.5)},${f(-h * 0.12)} ${f(-w)},0L${f(-w)},${f(h)}Q${f(-w * 0.5)},${f(h * 0.88)} 0,${f(h)}Z`, 'page') +
    R(`M0,0Q${f(w * 0.5)},${f(-h * 0.12)} ${f(w)},0L${f(w)},${f(h)}Q${f(w * 0.5)},${f(h * 0.88)} 0,${f(h)}Z`, 'page') +
    R(`M${f(-w - 6)},${f(h * 0.06)}L${f(-w - 6)},${f(h + 8)}Q0,${f(h + 2)} ${f(w + 6)},${f(h + 8)}L${f(w + 6)},${f(h * 0.06)}L${f(w)},${f(h * 0.06)}L${f(w)},${f(h)}Q0,${f(h * 0.95)} ${f(-w)},${f(h)}L${f(-w)},${f(h * 0.06)}Z`, 'cover') +
    A.Lt(`M${f(-w * 0.8)},${f(h * 0.25)}L${f(-w * 0.2)},${f(h * 0.25)}M${f(-w * 0.8)},${f(h * 0.45)}L${f(-w * 0.2)},${f(h * 0.45)}M${f(-w * 0.8)},${f(h * 0.65)}L${f(-w * 0.3)},${f(h * 0.65)}M${f(w * 0.2)},${f(h * 0.25)}L${f(w * 0.8)},${f(h * 0.25)}M${f(w * 0.2)},${f(h * 0.45)}L${f(w * 0.8)},${f(h * 0.45)}`, 0.5), { rot });
  O.closedBook = (x, y, w, h, rot) => A.G(x, y, 1, () => A.rect(-w / 2, -h / 2, w, h, 4, 'cover') + A.rect(-w / 2 + 6, -h / 2 + 6, w - 12, h * 0.35, 3, 'cover2') + A.rect(w / 2 - 8, -h / 2 + 2, 6, h - 4, 2, 'page'), { rot });
  O.pencil = (x, y, len, rot) => A.G(x, y, 1, () => A.rect(-len / 2, -7, len * 0.82, 14, 2, 'pencil') + A.poly([[len * 0.32, -7], [len / 2, 0], [len * 0.32, 7]], 'wood') + A.poly([[len * 0.45, -2.5], [len / 2, 0], [len * 0.45, 2.5]], 'lead') + A.rect(-len / 2 - 10, -7, 12, 14, 4, 'eraser'), { rot });
  O.table = (x, y, w, h) => A.rect(x - w / 2, y, w, 18, 6, 'table') + A.rect(x - w / 2 + 14, y + 18, 16, h, 3, 'table2') + A.rect(x + w / 2 - 30, y + 18, 16, h, 3, 'table2');
  O.board = (x, y, w, h, content) => A.rect(x - w / 2 - 10, y - 10, w + 20, h + 20, 8, 'frame') + A.rect(x - w / 2, y, w, h, 4, 'board') + (content || '');
  O.globe = (x, y, r) => R(`M${f(x - r * 0.6)},${f(y + r * 1.5)}L${f(x + r * 0.6)},${f(y + r * 1.5)}L${f(x + r * 0.3)},${f(y + r * 1.25)}L${f(x - r * 0.3)},${f(y + r * 1.25)}Z`, 'stand') + A.rect(x - 4, y + r, 8, r * 0.3, 2, 'stand') + A.circ(x, y, r, 'sea') +
    R(A.smoothD([[x - r * 0.5, y - r * 0.6], [x - r * 0.1, y - r * 0.7], [x, y - r * 0.2], [x - r * 0.3, y + r * 0.3], [x - r * 0.6, y]], true, 0.2), 'land') +
    R(A.smoothD([[x + r * 0.2, y + r * 0.1], [x + r * 0.6, y - r * 0.2], [x + r * 0.7, y + r * 0.3], [x + r * 0.3, y + r * 0.7]], true, 0.2), 'land');
  O.flask = (x, y, s, k) => A.G(x, y, s, () => R('M-12,-60L12,-60L12,-24L44,40Q48,52 36,52L-36,52Q-48,52 -44,40L-12,-24Z', 'glass') +
    R('M-30,14L30,14L44,40Q48,52 36,52L-36,52Q-48,52 -44,40Z', k || 'liquid') + A.rect(-16, -70, 32, 12, 4, 'cork') + A.circ(-10, 34, 5, 'bubble') + A.circ(12, 26, 4, 'bubble'));
  O.tube = (x, y, s, k) => A.G(x, y, s, () => R('M-10,-50L10,-50L10,30Q10,44 0,44Q-10,44 -10,30Z', 'glass') + R('M-10,0L10,0L10,30Q10,44 0,44Q-10,44 -10,30Z', k || 'liquid2') + A.rect(-13, -56, 26, 8, 3, 'cork'));
  O.microscope = (x, y, s) => A.G(x, y, s, () =>
    A.rect(-50, 50, 100, 18, 6, 'metal') + R('M-10,50L-10,10Q-36,0 -36,-30L-22,-30Q-22,-6 6,0L6,50Z', 'metal2') +
    A.rect(-40, 12, 60, 10, 3, 'metal') + R(A.ribbonD([[-30, -24], [-6, -78]], 24, 20, false, false), 'metal') + A.rect(-26, -96, 30, 16, 4, 'metal2') + A.circ(-16, -18, 9, 'metal2'));
  O.rocket = (x, y, s, rot) => A.G(x, y, s, () =>
    R('M-30,60L-62,100L-58,40L-30,10Z', 'fin') + R('M30,60L62,100L58,40L30,10Z', 'fin') +
    R('M0,-120Q44,-70 34,70L-34,70Q-44,-70 0,-120Z', 'rocket') + R('M0,-120Q22,-96 28,-70L-28,-70Q-22,-96 0,-120Z', 'tip') +
    A.ring(0, -20, 22, 14, 'frame') + A.circ(0, -20, 14, 'window') + A.rect(-30, 40, 60, 14, 4, 'band') +
    R('M-22,70L22,70Q24,110 0,140Q-24,110 -22,70Z', 'fire') + R('M-10,70L10,70Q12,94 0,112Q-12,94 -10,70Z', 'fire2'), { rot });
  O.planet = (x, y, r, rot) => A.G(x, y, 1, () =>
    R(`M${f(-r * 1.7)},0A${f(r * 1.7)},${f(r * 0.45)} 0 0,1 ${f(r * 1.7)},0L${f(r * 1.2)},0A${f(r * 1.2)},${f(r * 0.25)} 0 0,0 ${f(-r * 1.2)},0Z`, 'ring') +
    A.circ(0, 0, r, 'planet') + R(`M${f(-r * 0.96)},${f(-r * 0.3)}Q0,${f(-r * 0.12)} ${f(r * 0.96)},${f(-r * 0.3)}L${f(r * 0.99)},${f(-r * 0.12)}Q0,${f(r * 0.06)} ${f(-r * 0.99)},${f(-r * 0.12)}Z`, 'planet2') +
    R(`M${f(-r * 1.7)},0A${f(r * 1.7)},${f(r * 0.45)} 0 0,0 ${f(r * 1.7)},0L${f(r * 1.2)},0A${f(r * 1.2)},${f(r * 0.25)} 0 0,1 ${f(-r * 1.2)},0Z`, 'ring'), { rot });
  O.stethoscope = (x, y, s) => A.G(x, y, s, () => L('M-26,-50Q-30,0 0,20Q30,0 26,-50', 4) + L('M0,20L0,50Q0,70 20,70', 4) + A.ring(30, 70, 12, 5, 'metal') + A.circ(-26, -52, 5, 'metal2') + A.circ(26, -52, 5, 'metal2'));
  O.clipboard = (x, y, w, h, rot) => A.G(x, y, 1, () => A.rect(-w / 2, -h / 2, w, h, 6, 'board2') + A.rect(-w / 2 + 8, -h / 2 + 14, w - 16, h - 22, 3, 'page') + A.rect(-w * 0.22, -h / 2 - 6, w * 0.44, 18, 5, 'metal') +
    A.Lt(`M${f(-w / 2 + 16)},${f(-h / 2 + 34)}l${f(w - 32)},0M${f(-w / 2 + 16)},${f(-h / 2 + 50)}l${f(w - 32)},0M${f(-w / 2 + 16)},${f(-h / 2 + 66)}l${f(w - 44)},0`, 0.5) + A.heart(0, h * 0.25, 9, 'heart'), { rot });
  O.hardhat = (x, y, s) => A.G(x, y, s, () => R('M-48,0Q-48,-46 0,-50Q48,-46 48,0Z', 'helmet') + A.rect(-60, -6, 120, 14, 6, 'helmet2') + A.rect(-8, -50, 16, 44, 5, 'helmet2'));
  O.gear = (x, y, r, n, k) => {
    const pts = [];
    n = n || 8;
    for (let i = 0; i < n * 4; i++) {
      const a = (i / (n * 4)) * Math.PI * 2;
      const rr = (i % 4 < 2) ? r : r * 0.78;
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    return A.R(A.dPoly(pts) + A.dCirc(x, y, r * 0.32), k || 'gear', ' fill-rule="evenodd"');
  };
  O.easel = (x, y, s, canvasInner) => A.G(x, y, s, () =>
    R('M-50,160L-24,-120L-14,-120L-38,160Z', 'wood') + R('M50,160L24,-120L14,-120L38,160Z', 'wood') + R('M-4,160L-4,-130L4,-130L4,160Z', 'wood2') +
    A.rect(-70, 60, 140, 12, 4, 'wood2') + A.rect(-80, -110, 160, 170, 4, 'canvas') + (canvasInner || ''));
  O.palette = (x, y, s, rot) => A.G(x, y, s, () =>
    R(A.smoothD([[-60, -10], [-40, -42], [10, -48], [56, -24], [60, 16], [30, 40], [0, 30], [-10, 44], [-40, 40], [-62, 20]], true, 0.18) + A.dEll(-34, 18, 10, 8), 'palette', ' fill-rule="evenodd"') +
    A.circ(-30, -18, 9, 'paint1') + A.circ(-2, -28, 9, 'paint2') + A.circ(28, -20, 9, 'paint3') + A.circ(38, 8, 9, 'paint4') + A.circ(14, 14, 8, 'paint5'), { rot });
  O.brush = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
    const m = [x1 + ux * l * 0.72, y1 + uy * l * 0.72];
    return R(A.ribbonD([[x1, y1], m], 8, 9, false, true), 'wood') + R(A.ribbonD([m, [m[0] + ux * l * 0.08, m[1] + uy * l * 0.08]], 11, 11, false, false), 'metal') +
      R(A.ribbonD([[m[0] + ux * l * 0.08, m[1] + uy * l * 0.08], [x2, y2]], 12, 2, true, false), 'paint1');
  };
  O.trophy = (x, y, s) => A.G(x, y, s, () =>
    R('M-34,-60L34,-60Q34,0 0,10Q-34,0 -34,-60Z', 'gold') + A.ringE(-40, -40, 18, 20, 10, 12, 'gold2') + A.ringE(40, -40, 18, 20, 10, 12, 'gold2') +
    A.rect(-8, 8, 16, 26, 3, 'gold2') + A.rect(-30, 32, 60, 22, 4, 'base') + A.star(0, -32, 14, 6, 5, 0, 'star'));
  O.medal = (x, y, s) => A.G(x, y, s, () => A.poly([[-20, -70], [-4, -70], [8, -12], [-8, -12]], 'ribbon') + A.poly([[20, -70], [4, -70], [-8, -12], [8, -12]], 'ribbon2') + A.circ(0, 6, 22, 'gold') + A.star(0, 6, 13, 6, 5, 0, 'star'));
  O.ball = (x, y, r) => A.circ(x, y, r, 'ball') + R(A.dPoly(A.ngonPts(x, y, r * 0.36, 5, 0)), 'ball2') + A.Lt(A.ngonPts(x, y, r * 0.36, 5, 0).map(([px, py]) => `M${f(px)},${f(py)}L${f(x + (px - x) * 2.7)},${f(y + (py - y) * 2.7)}`).join(''), 0.6);
  O.plane = (x, y, s, rot) => A.G(x, y, s, () =>
    R('M-20,-8L-60,-70L-40,-74L20,-8Z', 'wing') + R('M-20,8L-60,70L-40,74L20,8Z', 'wing') +
    R('M-120,-14Q-40,-22 80,-16Q120,-12 128,0Q120,12 80,16Q-40,22 -120,14Z', 'plane') +
    R('M-120,-14L-138,-50L-118,-50L-96,-16Z', 'wing2') + R('M90,-14Q112,-12 120,-4L92,-4Z', 'window') +
    A.circ(-60, 0, 6, 'window') + A.circ(-36, 0, 6, 'window') + A.circ(-12, 0, 6, 'window') + A.circ(12, 0, 6, 'window') + A.circ(36, 0, 6, 'window'), { rot });
  O.house = (x, y, s) => A.G(x, y, s, () => A.rect(-60, -70, 120, 70, 2, 'wall') + A.poly([[-76, -66], [0, -130], [76, -66]], 'roof') + A.rect(-14, -44, 28, 44, 4, 'door') + A.rect(-48, -56, 24, 22, 3, 'window') + A.rect(24, -56, 24, 22, 3, 'window'));
  O.headphones = (x, y, s) => A.G(x, y, s, () => R(A.ribbonD([[-40, 10], [-40, -36], [0, -52], [40, -36], [40, 10]], 9, 9, true, true), 'acc') + A.rect(-52, -4, 22, 34, 9, 'acc2') + A.rect(30, -4, 22, 34, 9, 'acc2'));
  O.sparkles = (pts) => pts.map(([x, y, r]) => A.sparkle(x, y, r || 12)).join('');

  AA.O = O;
})(window.AA);
