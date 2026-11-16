/* ATELIÊ AFRO — núcleo de desenho vetorial.
 * Gera trechos de SVG. Cada região colorível é um <path class="r"> fechado.
 * Linhas de detalhe (class "l") e pontos pretos (class "k") não recebem toque.
 */
window.AA = window.AA || {};
(function (AA) {
  'use strict';
  const A = {};
  const f = (n) => Math.round(n * 10) / 10;
  A.f = f;

  /* ---------- cores opcionais (só usadas nas ilustrações já coloridas da tela inicial) ---------- */
  A.colors = null; // objeto {tipo: cor} ativo durante a construção
  const fillAttr = (k) => (A.colors && k && A.colors[k] ? ` style="fill:${A.colors[k]}"` : '');

  /* ---------- emissores ---------- */
  A.R = (d, k, extra) => `<path class="r" d="${d}"${fillAttr(k)}${extra || ''}/>`;
  A.L = (d, w) => `<path class="l" d="${d}"${w ? ` stroke-width="${f(w)}"` : ''}/>`;
  A.K = (d) => `<path class="k" d="${d}"/>`;
  A.W = (d) => `<path class="w" d="${d}"/>`;

  /* ---------- geometria em "d" ---------- */
  A.dCirc = (cx, cy, r) => `M${f(cx - r)},${f(cy)}a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0Z`;
  A.dEll = (cx, cy, rx, ry) => `M${f(cx - rx)},${f(cy)}a${f(rx)},${f(ry)} 0 1,0 ${f(2 * rx)},0a${f(rx)},${f(ry)} 0 1,0 ${f(-2 * rx)},0Z`;
  A.dRect = (x, y, w, h, r) => {
    r = Math.min(r || 0, w / 2, h / 2);
    if (!r) return `M${f(x)},${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
    return `M${f(x + r)},${f(y)}h${f(w - 2 * r)}a${f(r)},${f(r)} 0 0 1 ${f(r)},${f(r)}v${f(h - 2 * r)}a${f(r)},${f(r)} 0 0 1 ${f(-r)},${f(r)}h${f(-(w - 2 * r))}a${f(r)},${f(r)} 0 0 1 ${f(-r)},${f(-r)}v${f(-(h - 2 * r))}a${f(r)},${f(r)} 0 0 1 ${f(r)},${f(-r)}Z`;
  };
  A.dPoly = (pts, open) => 'M' + pts.map((p) => f(p[0]) + ',' + f(p[1])).join('L') + (open ? '' : 'Z');

  A.circ = (cx, cy, r, k) => A.R(A.dCirc(cx, cy, r), k);
  A.ell = (cx, cy, rx, ry, k) => A.R(A.dEll(cx, cy, rx, ry), k);
  A.rect = (x, y, w, h, r, k) => A.R(A.dRect(x, y, w, h, r), k);
  A.poly = (pts, k) => A.R(A.dPoly(pts), k);
  A.ring = (cx, cy, r1, r2, k) => A.R(A.dCirc(cx, cy, r1) + A.dCirc(cx, cy, r2), k, ' fill-rule="evenodd"');
  A.ringE = (cx, cy, rx1, ry1, rx2, ry2, k) => A.R(A.dEll(cx, cy, rx1, ry1) + A.dEll(cx, cy, rx2, ry2), k, ' fill-rule="evenodd"');
  A.dot = (cx, cy, r) => A.K(A.dCirc(cx, cy, r));

  /* rotação de pontos */
  A.rot = (pts, cx, cy, deg) => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
  };

  /* estrela */
  A.starPts = (cx, cy, ro, ri, n, rotDeg) => {
    const pts = [], r0 = ((rotDeg || 0) - 90) * Math.PI / 180;
    for (let i = 0; i < n * 2; i++) {
      const a = r0 + (i * Math.PI) / n, r = i % 2 ? ri : ro;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  };
  A.star = (cx, cy, ro, ri, n, rotDeg, k) => A.poly(A.starPts(cx, cy, ro, ri || ro * 0.45, n || 5, rotDeg), k);
  A.dStarRound = (cx, cy, ro, ri, n, rotDeg) => A.smoothD(A.starPts(cx, cy, ro, ri, n, rotDeg), true, 0.18);

  /* polígono regular */
  A.ngonPts = (cx, cy, r, n, rotDeg) => {
    const pts = [], r0 = ((rotDeg || 0) - 90) * Math.PI / 180;
    for (let i = 0; i < n; i++) pts.push([cx + r * Math.cos(r0 + (i * 2 * Math.PI) / n), cy + r * Math.sin(r0 + (i * 2 * Math.PI) / n)]);
    return pts;
  };

  /* ---------- curvas suaves (Catmull-Rom) ---------- */
  A.smoothD = (pts, closed, tension) => {
    const t = tension == null ? 1 / 6 : tension;
    const n = pts.length;
    if (n < 3) return A.dPoly(pts, !closed);
    const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
      const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
      d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
    }
    return d + (closed ? 'Z' : '');
  };
  A.smooth = (pts, k) => A.R(A.smoothD(pts, true), k);

  /* amostra densa de uma curva Catmull-Rom (para cálculos de deslocamento) */
  A.sample = (pts, per) => {
    per = per || 8;
    const out = [], n = pts.length;
    const P = (i) => pts[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < n - 1; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let j = 0; j < per; j++) {
        const t = j / per, t2 = t * t, t3 = t2 * t;
        const q = (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
        out.push([q(0), q(1)]);
      }
    }
    out.push(pts[n - 1]);
    return out;
  };

  /* fita/mecha: contorno fechado de largura variável ao longo de uma curva */
  A.ribbonPts = (pts, w0, w1, capEnd, capStart) => {
    const s = A.sample(pts, 10);
    const L = [], Rr = [];
    const n = s.length;
    for (let i = 0; i < n; i++) {
      const a = s[Math.max(0, i - 1)], b = s[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
      L.push([s[i][0] - dy * w, s[i][1] + dx * w]);
      Rr.push([s[i][0] + dy * w, s[i][1] - dx * w]);
    }
    const capPts = (c, from, to, steps) => {
      const out = [];
      const a0 = Math.atan2(from[1] - c[1], from[0] - c[0]);
      const r = Math.hypot(from[0] - c[0], from[1] - c[1]);
      for (let j = 1; j < steps; j++) {
        const a = a0 - (Math.PI * j) / steps;
        out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
      }
      return out;
    };
    let poly = L.slice();
    if (capEnd !== false) poly = poly.concat(capPts(s[n - 1], L[n - 1], Rr[n - 1], 9));
    poly = poly.concat(Rr.slice().reverse());
    if (capStart) poly = poly.concat(capPts(s[0], Rr[0], L[0], 9));
    return poly;
  };
  A.ribbonD = (pts, w0, w1, capEnd, capStart) => A.dPoly(A.ribbonPts(pts, w0, w1 == null ? w0 : w1, capEnd, capStart));
  A.ribbon = (pts, w0, w1, k, capEnd, capStart) => A.R(A.ribbonD(pts, w0, w1, capEnd, capStart), k);

  /* cápsula reta (membros) */
  A.capsuleD = (x1, y1, x2, y2, w1, w2) => A.ribbonD([[x1, y1], [x2, y2]], w1, w2 == null ? w1 : w2, true, true);

  /* contorno ondulado / nuvem / cabelo crespo */
  A.cloudPts = (cx, cy, rx, ry, n, bump, phase, rotDeg) => {
    const pts = [];
    const ph = phase || 0;
    for (let i = 0; i < n; i++) {
      const a = ph + (i * 2 * Math.PI) / n;
      pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    }
    return rotDeg ? A.rot(pts, cx, cy, rotDeg) : pts;
  };
  A.cloudD = (cx, cy, rx, ry, n, bump, phase, rotDeg) => {
    const pts = A.cloudPts(cx, cy, rx, ry, n, bump, phase, rotDeg);
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      const ox = mx - cx, oy = my - cy, ol = Math.hypot(ox, oy) || 1;
      const seg = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const b = seg * (bump == null ? 0.6 : bump);
      d += `Q${f(mx + (ox / ol) * b)},${f(my + (oy / ol) * b)} ${f(q[0])},${f(q[1])}`;
    }
    return d + 'Z';
  };
  A.cloud = (cx, cy, rx, ry, n, bump, k, phase) => A.R(A.cloudD(cx, cy, rx, ry, n, bump, phase), k);

  /* pétalas (gota) apontando para um ângulo */
  A.petalD = (cx, cy, len, w, deg, inner) => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const P = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
    const i0 = inner || 0;
    const p0 = P(i0, 0), p1 = P(len, 0);
    const c1 = P(i0 + len * 0.25, -w), c2 = P(len * 0.95, -w * 0.9), c3 = P(len * 0.95, w * 0.9), c4 = P(i0 + len * 0.25, w);
    return `M${f(p0[0])},${f(p0[1])}C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p1[0])},${f(p1[1])}C${f(c3[0])},${f(c3[1])} ${f(c4[0])},${f(c4[1])} ${f(p0[0])},${f(p0[1])}Z`;
  };
  A.petal = (cx, cy, len, w, deg, k, inner) => A.R(A.petalD(cx, cy, len, w, deg, inner), k);

  /* folha */
  A.leafD = (x1, y1, x2, y2, w) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    return `M${f(x1)},${f(y1)}Q${f(mx + nx * w)},${f(my + ny * w)} ${f(x2)},${f(y2)}Q${f(mx - nx * w)},${f(my - ny * w)} ${f(x1)},${f(y1)}Z`;
  };
  A.leaf = (x1, y1, x2, y2, w, k, vein) => A.R(A.leafD(x1, y1, x2, y2, w), k) + (vein === false ? '' : A.L(`M${f(x1 + (x2 - x1) * 0.12)},${f(y1 + (y2 - y1) * 0.12)}L${f(x1 + (x2 - x1) * 0.8)},${f(y1 + (y2 - y1) * 0.8)}`, 2));

  /* ---------- grupos com escala (mantém a espessura das linhas legível) ---------- */
  A.swStack = [3.4];
  A.sw = () => A.swStack[A.swStack.length - 1];
  A.G = (x, y, s, fn, opt) => {
    opt = opt || {};
    const base = opt.sw || 3.4;
    const screen = s < 0.55 ? base * 0.78 : s < 0.8 ? base * 0.9 : base;
    const sw = screen / s;
    A.swStack.push(sw);
    const inner = fn();
    A.swStack.pop();
    const flip = opt.flip ? ' scale(-1,1)' : '';
    const r = opt.rot ? ` rotate(${opt.rot})` : '';
    return `<g transform="translate(${f(x)},${f(y)}) scale(${s})${flip}${r}" stroke-width="${f(sw)}">${inner}</g>`;
  };
  /* linha fina proporcional ao grupo atual */
  A.Lt = (d, mult) => A.L(d, A.sw() * (mult || 0.6));

  /* ---------- recortes (para cabelo por cima da testa) ---------- */
  A.idPrefix = 'd';
  A.idCount = 0;
  A.uid = () => `${A.idPrefix}-${++A.idCount}`;
  A.clipHole = (holeD) => {
    const id = A.uid();
    return { id, def: `<clipPath id="${id}"><path clip-rule="evenodd" d="M-3000,-3000h6000v6000h-6000Z${holeD}"/></clipPath>` };
  };

  /* fundo: pequenos enfeites espalhados */
  A.sparkle = (x, y, r, k) => A.R(`M${f(x)},${f(y - r)}Q${f(x + r * 0.18)},${f(y - r * 0.18)} ${f(x + r)},${f(y)}Q${f(x + r * 0.18)},${f(y + r * 0.18)} ${f(x)},${f(y + r)}Q${f(x - r * 0.18)},${f(y + r * 0.18)} ${f(x - r)},${f(y)}Q${f(x - r * 0.18)},${f(y - r * 0.18)} ${f(x)},${f(y - r)}Z`, k);
  A.heartD = (x, y, s) => `M${f(x)},${f(y + s * 0.9)}C${f(x - s * 1.4)},${f(y - s * 0.1)} ${f(x - s * 0.7)},${f(y - s * 1.1)} ${f(x)},${f(y - s * 0.4)}C${f(x + s * 0.7)},${f(y - s * 1.1)} ${f(x + s * 1.4)},${f(y - s * 0.1)} ${f(x)},${f(y + s * 0.9)}Z`;
  A.heart = (x, y, s, k) => A.R(A.heartD(x, y, s), k);

  /* flor simples de pétalas */
  A.flower = (x, y, r, n, k1, k2) => {
    n = n || 5;
    let s = '';
    for (let i = 0; i < n; i++) s += A.R(A.dEll(0, 0, r * 0.42, r * 0.62).replace(/^M/, 'M'), k1, ` transform="translate(${f(x)},${f(y)}) rotate(${f((360 / n) * i)}) translate(0,${f(-r * 0.58)})"`);
    return s + A.circ(x, y, r * 0.38, k2);
  };

  /* SVG final */
  A.svg = (inner, vb) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb || '0 0 600 600'}" class="aa-art" stroke-width="3.4">${A.STYLE}${inner}</svg>`;
  A.STYLE = '<style>.aa-art .r{fill:#fff;stroke:#1d1d1f;stroke-linejoin:round;stroke-linecap:round}.aa-art .l{fill:none;stroke:#1d1d1f;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.aa-art .k{fill:#1d1d1f;stroke:none;pointer-events:none}.aa-art .w{fill:#fff;stroke:none;pointer-events:none}</style>';

  AA.A = A;
})(window.AA);
