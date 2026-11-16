/* ATELIÊ AFRO — construtor de pessoas (rostos, cabelos afro, corpos e poses).
 * Coordenadas-base: centro da cabeça em (0,0). Tudo é desenhado em regiões fechadas.
 */
(function (AA) {
  'use strict';
  const A = AA.A, f = A.f;
  const P = {};
  const R = A.R, L = A.L;
  const D2R = Math.PI / 180;

  /* ================= ROSTO ================= */
  // pontos do contorno do rosto. jaw<1 deixa o queixo mais quadrado; narrow afina a mandíbula.
  P.facePts = (rx, ry, jaw, narrow, n) => {
    n = n || 72;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const c = Math.cos(t), s = Math.sin(t);
      if (s <= 0) pts.push([rx * c, ry * s]);
      else {
        const p = jaw || 1;
        const x = rx * Math.sign(c) * Math.pow(Math.abs(c), p) * (1 - (narrow || 0) * s * s);
        pts.push([x, ry * Math.pow(s, 1)]);
      }
    }
    return pts;
  };

  // linha do cabelo: da têmpora esquerda à direita
  P.hairlinePts = (rx, ry, h) => {
    const yT = h.yT == null ? -ry * 0.08 : h.yT;
    const yC = h.yC == null ? -ry * 0.55 : h.yC;
    const xt = rx * Math.sqrt(Math.max(0, 1 - (yT / ry) * (yT / ry)));
    const pts = [];
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const u = -1 + (2 * i) / N;
      let y = yC + (yT - yC) * Math.pow(Math.abs(u), h.pow || 2.2);
      if (h.peak) y += h.peak * Math.max(0, 1 - Math.abs(u) * 5);
      if (h.scallop) y += h.scallop * Math.abs(Math.sin(u * Math.PI * (h.waves || 5)));
      if (h.part != null) y -= h.partDepth ? h.partDepth * Math.max(0, 1 - Math.abs(u - h.part) * 9) : 0;
      pts.push([u * xt, y]);
    }
    return { pts, xt, yT, yC };
  };

  // buraco (área do rosto abaixo da linha do cabelo) para recortar o cabelo
  P.holeD = (rx, ry, jaw, narrow, hl) => {
    const k = 1 + 1.8 / rx;
    const face = P.facePts(rx * k, ry * (1 + 1.8 / ry), jaw, narrow, 144);
    const tT = Math.asin(Math.max(-1, Math.min(1, hl.yT / ry)));
    const lower = face.filter((p, i) => {
      const t = (i / 144) * Math.PI * 2;
      const tt = t > Math.PI * 1.5 ? t - Math.PI * 2 : t;
      return tt >= tT && tt <= Math.PI - tT;
    });
    // ordena por ângulo do lado direito → esquerdo passando pelo queixo
    lower.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
    const pts = lower.concat(hl.pts.slice());
    return A.dPoly(pts);
  };

  const eyesD = (o, rx, ry) => {
    const sc = rx / 50;
    const ex = (o.eyeGap || 0.38) * rx, ey = (o.eyeY || 0.04) * ry;
    const w = 12 * sc * (o.eyeW || 1), h = 7.5 * sc * (o.eyeH || 1);
    let s = '';
    const brow = (cx, side) => {
      const by = ey - 19 * sc - (o.browUp || 0) * sc;
      const tilt = (o.browTilt || 0) * sc * side;
      if (A.sw() > 3.6) return L(`M${f(cx - 11 * sc)},${f(by + 3 * sc + tilt * side)}Q${f(cx)},${f(by - 4 * sc)} ${f(cx + 11 * sc)},${f(by + 2 * sc - tilt * side)}`, A.sw() * 0.95);
      const a = [cx - side * 11 * sc, by + 2.5 * sc + tilt], b = [cx + side * 1 * sc, by - 3 * sc], c = [cx + side * 12 * sc, by + 2 * sc - tilt];
      return A.ribbon(side > 0 ? [a, b, c] : [c, b, a].map((p) => p), 4.6 * sc, 2 * sc, 'hair', true, true);
    };
    [-1, 1].forEach((side) => {
      const cx = side * ex;
      if (o.eyes === 'happy') {
        s += L(`M${f(cx - w)},${f(ey + 2 * sc)}Q${f(cx)},${f(ey - h * 1.5)} ${f(cx + w)},${f(ey + 2 * sc)}`, A.sw() * 1.25);
        if (o.lashes) s += L(`M${f(cx + side * w * 0.9)},${f(ey - 0.5 * sc)}l${f(side * 5 * sc)},${f(-4 * sc)}`, A.sw() * 0.9);
      } else if (o.eyes === 'wink' && side === 1) {
        s += L(`M${f(cx - w)},${f(ey + 1 * sc)}Q${f(cx)},${f(ey - h * 1.3)} ${f(cx + w)},${f(ey + 1 * sc)}`, A.sw() * 1.25);
      } else {
        const lookY = o.eyes === 'down' ? 2.2 * sc : 0;
        const lookX = (o.look || 0) * 3 * sc;
        s += R(`M${f(cx - w)},${f(ey)}Q${f(cx)},${f(ey - h * 1.75)} ${f(cx + w)},${f(ey)}Q${f(cx)},${f(ey + h * 1.25)} ${f(cx - w)},${f(ey)}Z`, 'eye');
        s += A.circ(cx + lookX, ey - 0.6 * sc + lookY, 5.6 * sc, 'iris');
        s += A.dot(cx + lookX, ey - 0.6 * sc + lookY, 2.6 * sc);
        s += A.W(A.dCirc(cx + lookX + 1.7 * sc, ey - 2.4 * sc + lookY, 1.3 * sc));
        s += L(`M${f(cx - w - 1 * sc)},${f(ey + 0.5 * sc)}Q${f(cx)},${f(ey - h * 1.95)} ${f(cx + w + 1 * sc)},${f(ey + 0.5 * sc)}`, A.sw() * 1.3);
        if (o.lashes) s += L(`M${f(cx + side * (w + 0.5 * sc))},${f(ey - 0.5 * sc)}l${f(side * 5 * sc)},${f(-4.5 * sc)}M${f(cx + side * (w - 4 * sc))},${f(ey - h * 1.05)}l${f(side * 4 * sc)},${f(-5 * sc)}M${f(cx + side * (w - 9 * sc))},${f(ey - h * 1.3)}l${f(side * 2.5 * sc)},${f(-5 * sc)}`, A.sw() * 0.85);
        // pálpebra e linha de baixo (só quando o rosto é grande)
        if (A.sw() <= 3.6) s += A.Lt(`M${f(cx - w * 0.75)},${f(ey - h * 1.55)}Q${f(cx)},${f(ey - h * 2.45)} ${f(cx + w * 0.8)},${f(ey - h * 1.5)}`, 0.42);
        if (A.sw() <= 3.6) s += A.Lt(`M${f(cx - w * 0.45)},${f(ey + h * 1.05)}Q${f(cx)},${f(ey + h * 1.35)} ${f(cx + w * 0.45)},${f(ey + h * 1.05)}`, 0.35);
      }
      if (o.brows !== false) s += brow(cx, side);
    });
    return s;
  };

  const noseD = (o, rx, ry) => {
    const sc = rx / 50, y = (o.noseY || 0.36) * ry;
    const t = o.nose || 'wide';
    const wd = { wide: 13, broad: 15.5, round: 10, small: 8 }[t] || 12;
    const w = wd * sc, h = 7 * sc;
    let s = L(`M${f(-w * 0.55)},${f(y - h)}Q${f(-w * 1.15)},${f(y + h * 0.15)} ${f(-w * 0.6)},${f(y + h * 0.75)}Q${f(-w * 0.25)},${f(y + h * 1.05)} 0,${f(y + h * 0.65)}Q${f(w * 0.25)},${f(y + h * 1.05)} ${f(w * 0.6)},${f(y + h * 0.75)}Q${f(w * 1.15)},${f(y + h * 0.15)} ${f(w * 0.55)},${f(y - h)}`, A.sw() * 0.95);
    if (t !== 'small') s += L(`M${f(-w * 0.32)},${f(y + h * 0.35)}q${f(-1.5 * sc)},${f(2 * sc)} 0,${f(2.6 * sc)}M${f(w * 0.32)},${f(y + h * 0.35)}q${f(1.5 * sc)},${f(2 * sc)} 0,${f(2.6 * sc)}`, A.sw() * 0.75);
    return s;
  };

  const mouthD = (o, rx, ry) => {
    const sc = rx / 50, y = (o.mouthY || 0.66) * ry;
    const t = o.mouth || 'lips';
    const w = (o.mouthW || 1) * 17 * sc;
    if (t === 'smile') {
      return L(`M${f(-w)},${f(y - 2 * sc)}Q0,${f(y + 10 * sc)} ${f(w)},${f(y - 2 * sc)}`, A.sw() * 1.1) +
        L(`M${f(-w - 3 * sc)},${f(y - 4 * sc)}q${f(2 * sc)},${f(2 * sc)} ${f(4 * sc)},${f(1 * sc)}M${f(w + 3 * sc)},${f(y - 4 * sc)}q${f(-2 * sc)},${f(2 * sc)} ${f(-4 * sc)},${f(1 * sc)}`, A.sw() * 0.8);
    }
    if (t === 'grin') {
      const top = `M${f(-w - 2 * sc)},${f(y - 4 * sc)}Q0,${f(y + 1 * sc)} ${f(w + 2 * sc)},${f(y - 4 * sc)}`;
      return R(`${top}Q${f(w * 0.8)},${f(y + 15 * sc)} 0,${f(y + 15 * sc)}Q${f(-w * 0.8)},${f(y + 15 * sc)} ${f(-w - 2 * sc)},${f(y - 4 * sc)}Z`, 'mouth') +
        R(`M${f(-w + 1 * sc)},${f(y - 2.2 * sc)}Q0,${f(y + 2.5 * sc)} ${f(w - 1 * sc)},${f(y - 2.2 * sc)}L${f(w - 3 * sc)},${f(y + 3 * sc)}Q0,${f(y + 6.5 * sc)} ${f(-w + 3 * sc)},${f(y + 3 * sc)}Z`, 'teeth') +
        R(`M${f(-w * 0.45)},${f(y + 12.6 * sc)}Q0,${f(y + 6 * sc)} ${f(w * 0.45)},${f(y + 12.6 * sc)}Q0,${f(y + 15.4 * sc)} ${f(-w * 0.45)},${f(y + 12.6 * sc)}Z`, 'tongue');
    }
    if (t === 'open') { // cantando / falando
      return R(`M${f(-w * 0.6)},${f(y)}Q${f(-w * 0.6)},${f(y - 6 * sc)} 0,${f(y - 6 * sc)}Q${f(w * 0.6)},${f(y - 6 * sc)} ${f(w * 0.6)},${f(y)}Q${f(w * 0.6)},${f(y + 11 * sc)} 0,${f(y + 11 * sc)}Q${f(-w * 0.6)},${f(y + 11 * sc)} ${f(-w * 0.6)},${f(y)}Z`, 'mouth') +
        R(`M${f(-w * 0.35)},${f(y + 7 * sc)}Q0,${f(y + 2 * sc)} ${f(w * 0.35)},${f(y + 7 * sc)}Q0,${f(y + 10.5 * sc)} ${f(-w * 0.35)},${f(y + 7 * sc)}Z`, 'tongue');
    }
    // lábios cheios sorrindo (lábio superior + inferior)
    const lw = w * 1.02, up = 5 * sc * (o.lipFull || 1), lo = 8 * sc * (o.lipFull || 1), cu = 3 * sc;
    const mid = `M${f(-lw)},${f(y - cu)}Q0,${f(y + 4 * sc)} ${f(lw)},${f(y - cu)}`;
    const upper = `M${f(-lw)},${f(y - cu)}Q${f(-lw * 0.55)},${f(y - up - 1 * sc)} ${f(-lw * 0.2)},${f(y - up)}Q0,${f(y - up + 2.2 * sc)} ${f(lw * 0.2)},${f(y - up)}Q${f(lw * 0.55)},${f(y - up - 1 * sc)} ${f(lw)},${f(y - cu)}Q0,${f(y + 4 * sc)} ${f(-lw)},${f(y - cu)}Z`;
    const lower = `${mid}Q${f(lw * 0.6)},${f(y + lo + 1 * sc)} 0,${f(y + lo + 1.5 * sc)}Q${f(-lw * 0.6)},${f(y + lo + 1 * sc)} ${f(-lw)},${f(y - cu)}Z`;
    return R(lower, 'lip') + R(upper, 'lip2');
  };

  /* ================= CABELOS =================
   * Cada estilo devolve { behind, over, acc, hl } — behind: atrás do rosto; over: por cima (recortado); acc: enfeites.
   */
  const H = {};
  P.H = H;
  const ellUpper = (cx, cy, rx, ry, yBase, bumps, amp, n) => {
    // metade superior de elipse (de esquerda para direita) fechada na base
    const pts = [];
    n = n || 60;
    for (let i = 0; i <= n; i++) {
      const t = Math.PI + (i / n) * Math.PI;
      let r = 1;
      if (bumps) r += amp * Math.abs(Math.sin((i / n) * Math.PI * bumps));
      pts.push([cx + rx * r * Math.cos(t), cy + ry * r * Math.sin(t)]);
    }
    pts.unshift([pts[0][0], yBase]);
    pts.push([pts[pts.length - 1][0], yBase]);
    return pts;
  };
  const texCurls = (pts, r) => pts.map(([x, y], i) => A.Lt(`M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1,1 ${f(r * 1.4)},${f(r * 0.9)}`, 0.55)).join('');
  // espalha pontos (determinístico) dentro de uma elipse
  P.scatter = (cx, cy, rx, ry, n, seed, test) => {
    const out = [];
    let s = seed || 7;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let tries = 0;
    while (out.length < n && tries < n * 40) {
      tries++;
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
      const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
      if (test && !test(x, y)) continue;
      if (out.some((p) => Math.hypot(p[0] - x, p[1] - y) < Math.min(rx, ry) * 0.22)) continue;
      out.push([x, y]);
    }
    return out;
  };

  // black power volumoso
  H.afro = (o, rx, ry) => {
    const sz = o.afroSize || 1;
    const hl = P.hairlinePts(rx, ry, { yT: ry * 0.05, yC: -ry * 0.52, scallop: -3, waves: 6 });
    const cy = -ry * 0.32, arx = rx * 1.78 * sz, ary = ry * 1.42 * sz;
    const d = A.cloudD(0, cy, arx, ary, 22, 0.32, 0.2);
    const tex = texCurls(P.scatter(0, cy, arx * 0.88, ary * 0.88, 34, 11, (x, y) => !(Math.abs(x) < rx * 1.05 && y > -ry * 0.75)), 6 * rx / 50);
    return { over: R(d, 'hair') + tex, hl, hideEars: true };
  };
  // crespo curto
  H.short = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.12, yC: -ry * 0.62, pow: 2.6 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.07, ry * 0.98, -ry * 0.02, 18, 0.035, 72);
    const tex = texCurls(P.scatter(0, -ry * 0.72, rx * 0.85, ry * 0.3, 16, 3), 4 * rx / 50);
    let design = '';
    if (o.design) design = A.Lt(`M${f(-rx * 0.95)},${f(-ry * 0.35)}Q${f(-rx * 0.7)},${f(-ry * 0.62)} ${f(-rx * 0.35)},${f(-ry * 0.78)}`, 0.8);
    return { over: R(A.smoothD(pts, true, 0.12), 'hair') + tex + design, hl };
  };
  // crespo volumoso alto (high top)
  H.hightop = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.1, yC: -ry * 0.6, pow: 3 });
    const top = -ry * 2.05, w = rx * 1.1;
    const pts = [[-w * 0.98, -ry * 0.02], [-w * 1.04, -ry * 0.7], [-w * 1.1, -ry * 1.4], [-w * 0.9, top + 8], [-w * 0.3, top - 4], [w * 0.3, top - 4], [w * 0.9, top + 8], [w * 1.1, -ry * 1.4], [w * 1.04, -ry * 0.7], [w * 0.98, -ry * 0.02]];
    let d = A.smoothD(pts, true, 0.16);
    const tex = texCurls(P.scatter(0, -ry * 1.3, rx * 0.9, ry * 0.65, 22, 5), 5 * rx / 50);
    // laterais raspadinhas
    const fade = A.Lt(`M${f(-w * 0.98)},${f(-ry * 0.35)}Q${f(-w * 0.7)},${f(-ry * 0.25)} ${f(-w * 0.62)},${f(-ry * 0.1)}M${f(w * 0.98)},${f(-ry * 0.35)}Q${f(w * 0.7)},${f(-ry * 0.25)} ${f(w * 0.62)},${f(-ry * 0.1)}`, 0.7);
    return { over: R(d, 'hair') + tex + fade, hl };
  };
  // tranças nagô (fileiras independentes)
  H.cornrows = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.12, yC: -ry * 0.6, pow: 2.4 });
    const N = o.rows || 6;
    const dome = []; // contorno do topo, da esquerda para a direita
    for (let i = 0; i <= 60; i++) {
      const t = Math.PI + (i / 60) * Math.PI;
      dome.push([rx * 1.06 * Math.cos(t), -ry * 0.12 + ry * 1.0 * Math.sin(t)]);
    }
    let regions = '', tex = '';
    const H0 = (i) => hl.pts[Math.round((i / N) * (hl.pts.length - 1))];
    const E0 = (i) => dome[Math.round((i / N) * 60)];
    const divider = (i) => {
      const a = H0(i), b = E0(i);
      const c = [(a[0] + b[0]) / 2 * 0.75, (a[1] + b[1]) / 2 - ry * 0.05];
      const pts = [];
      for (let j = 0; j <= 14; j++) {
        const t = j / 14;
        pts.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]);
      }
      return pts;
    };
    for (let i = 0; i < N; i++) {
      const d1 = divider(i), d2 = divider(i + 1);
      const i1 = Math.round((i / N) * 60), i2 = Math.round(((i + 1) / N) * 60);
      const h1 = Math.round((i / N) * (hl.pts.length - 1)), h2 = Math.round(((i + 1) / N) * (hl.pts.length - 1));
      const pts = d1.concat(dome.slice(i1 + 1, i2), d2.slice().reverse(), hl.pts.slice(h1 + 1, h2).reverse());
      regions += R(A.dPoly(pts), 'hair');
      // textura trançada: "V"s ao longo do centro
      for (let j = 2; j <= 12; j += 2) {
        const p = [(d1[j][0] + d2[j][0]) / 2, (d1[j][1] + d2[j][1]) / 2];
        const q = [(d1[j + 1][0] + d2[j + 1][0]) / 2, (d1[j + 1][1] + d2[j + 1][1]) / 2];
        const w = Math.hypot(d1[j][0] - d2[j][0], d1[j][1] - d2[j][1]) * 0.32;
        const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
        const nx = -dy / l * w, ny = dx / l * w;
        tex += A.Lt(`M${f(p[0] + nx)},${f(p[1] + ny)}L${f(q[0])},${f(q[1])}L${f(p[0] - nx)},${f(p[1] - ny)}`, 0.5);
      }
    }
    // duas tranças longas caindo atrás dos ombros
    let behind = '';
    [-1, 1].forEach((side) => {
      const x0 = side * rx * 0.92, y0 = ry * 0.1;
      behind += P.braidChain([[x0, y0], [x0 + side * rx * 0.25, ry * 0.9], [x0 + side * rx * 0.35, ry * 1.9]], 13 * rx / 50, 9, 'hair2');
      behind += A.ell(x0 + side * rx * 0.35, ry * 1.9 + 14 * rx / 50, 9 * rx / 50, 8 * rx / 50, 'acc');
    });
    return { behind, over: regions + tex, hl };
  };
  // trança em gomos (cada gomo é uma região)
  P.braidChain = (pts, w, n, k) => {
    const s = A.sample(pts, 20);
    let out = '';
    for (let i = n - 1; i >= 0; i--) {
      const idx = Math.round((i / n) * (s.length - 1)), idx2 = Math.round(((i + 1) / n) * (s.length - 1));
      const p = s[idx], q = s[Math.min(idx2, s.length - 1)];
      const cx = (p[0] + q[0]) / 2, cy = (p[1] + q[1]) / 2;
      const ang = Math.atan2(q[1] - p[1], q[0] - p[0]) / D2R;
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const ww = w * (1 - 0.25 * (i / n));
      out += R(A.petalD(cx - Math.cos(ang * D2R) * len * 0.75, cy - Math.sin(ang * D2R) * len * 0.75, len * 1.5, ww * 0.55, ang + (i % 2 ? 12 : -12)), k || 'hair');
    }
    return out;
  };
  // dreadlocks
  H.locs = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.1, yC: -ry * 0.58, pow: 2.4 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.12, ry * 1.05, -ry * 0.02, 0, 0, 60);
    let over = R(A.smoothD(pts, true, 0.12), 'hair');
    // divisões das mechas no topo
    for (let i = 1; i < 7; i++) {
      const t = Math.PI + (i / 7) * Math.PI;
      const x = rx * 1.1 * Math.cos(t), y = -ry * 0.12 + ry * 1.03 * Math.sin(t);
      const h = hl.pts[Math.round((i / 7) * (hl.pts.length - 1))];
      over += A.Lt(`M${f(h[0])},${f(h[1])}Q${f((h[0] + x) / 2 * 0.85)},${f((h[1] + y) / 2)} ${f(x)},${f(y)}`, 0.6);
    }
    const len = o.locLen || 1.9;
    let behind = '';
    const N = 9;
    [-1, 1].forEach((side) => {
      for (let i = 0; i < N; i++) {
        const t = Math.PI * (side < 0 ? 1.02 + i * 0.055 : 1.98 - i * 0.055);
        const x0 = rx * 1.05 * Math.cos(t), y0 = -ry * 0.12 + ry * 1.0 * Math.sin(t);
        const out = rx * (1.12 + 0.05 * (i % 3) + i * 0.035);
        const yEnd = ry * (len - 0.1 * (i % 4));
        const pts = [[x0, y0], [side * out, ry * 0.15], [side * (out + rx * 0.06 * ((i % 2) ? 1 : -0.5)), yEnd * 0.65], [side * (out - rx * 0.05 + i * 2), yEnd]];
        behind += A.ribbon(pts, 18 * rx / 50, 15 * rx / 50, 'hair', true, true);
        const m = A.sample(pts, 6);
        [Math.round(m.length * 0.45), Math.round(m.length * 0.7)].forEach((j) => {
          const p = m[j];
          behind += A.Lt(`M${f(p[0] - 6 * rx / 50)},${f(p[1] - 3)}q${f(6 * rx / 50)},${f(5)} ${f(12 * rx / 50)},0`, 0.5);
        });
        if (i === 2 || i === 6) {
          const p = m[Math.round(m.length * 0.58)];
          behind += A.rect(p[0] - 10.5 * rx / 50, p[1] - 6 * rx / 50, 21 * rx / 50, 12 * rx / 50, 3, 'acc');
        }
      }
    });
    const front = '';
    return { behind, over, acc: front, hl, hideEars: false };
  };
  // box braids longas
  H.boxbraids = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.1, yC: -ry * 0.6, pow: 2.5, part: 0, partDepth: 4 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.1, ry * 1.04, -ry * 0.02, 0, 0, 60);
    let grid = '';
    // partes quadradinhas
    for (let i = 1; i < 6; i++) {
      const x = -rx + (i * 2 * rx) / 6;
      grid += A.Lt(`M${f(x * 0.85)},${f(-ry * 0.55 - Math.abs(x) * 0.05)}L${f(x)},${f(-ry * 1.05 + Math.abs(x) * 0.35)}`, 0.45);
    }
    grid += A.Lt(`M${f(-rx * 0.95)},${f(-ry * 0.82)}Q0,${f(-ry * 1.0)} ${f(rx * 0.95)},${f(-ry * 0.82)}`, 0.45);
    let behind = '';
    const n = 6;
    [-1, 1].forEach((side) => {
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x0 = side * rx * (0.55 + 0.55 * t), y0 = -ry * (0.75 - 0.75 * t);
        const yEnd = ry * (2.3 + 0.12 * (i % 3));
        const xEnd = side * rx * (1.0 + 0.62 * t);
        const bp = [[x0, y0], [side * (Math.abs(x0) + rx * 0.35), ry * 0.2], [xEnd * 0.97, ry * 1.1], [xEnd, yEnd]];
        behind += A.ribbon(bp, 15 * rx / 50, 12 * rx / 50, 'hair', true, true);
        const sm = A.sample(bp, 12);
        for (let j = 8; j < sm.length - 4; j += 3) {
          const [xx, y] = sm[j];
          if (y < ry * 0.3) continue;
          behind += A.Lt(`M${f(xx - 5 * rx / 50)},${f(y)}l${f(5 * rx / 50)},${f(4 * rx / 50)}l${f(5 * rx / 50)},${f(-4 * rx / 50)}`, 0.45);
        }
        if (i % 2 === 0) behind += A.rect(xEnd - 9 * rx / 50, yEnd - 26 * rx / 50, 18 * rx / 50, 9 * rx / 50, 3, 'acc');
        behind += A.circ(xEnd, yEnd + 10 * rx / 50, 7.5 * rx / 50, 'acc2');
      }
    });
    // tiara
    const band = [];
    for (let i = 0; i <= 20; i++) {
      const t = Math.PI * 1.08 + (i / 20) * Math.PI * 0.84;
      band.push([rx * 1.0 * Math.cos(t), -ry * 0.35 + ry * 0.68 * Math.sin(t)]);
    }
    const acc = A.ribbon(band, 13 * rx / 50, 13 * rx / 50, 'acc3', true, true) +
      A.star(band[10][0], band[10][1] - 2, 15 * rx / 50, 7 * rx / 50, 5, 0, 'acc4') +
      A.star(band[4][0], band[4][1], 10 * rx / 50, 4.6 * rx / 50, 5, -20, 'acc4') +
      A.star(band[16][0], band[16][1], 10 * rx / 50, 4.6 * rx / 50, 5, 20, 'acc4');
    return { behind, over: R(A.smoothD(pts, true, 0.12), 'hair') + grid, acc, hl, hideEars: true };
  };
  // dois coques afro (puffs)
  H.puffs = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.12, yC: -ry * 0.58, pow: 2.4, scallop: -2, waves: 7 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.06, ry * 0.98, -ry * 0.02, 0, 0, 60);
    const mid = Math.floor(pts.length / 2);
    const left = pts.slice(0, mid + 1).concat([[0, -ry * 0.5]]);
    const right = [[0, -ry * 0.5]].concat(pts.slice(mid));
    const pr = ry * 0.62 * (o.puffSize || 1);
    let behind = '';
    [-1, 1].forEach((side) => {
      const cx = side * rx * 1.02, cy = -ry * 1.02;
      behind += R(A.cloudD(cx, cy, pr * 1.05, pr, 15, 0.3, 0.3), 'hair2');
      behind += texCurls(P.scatter(cx, cy, pr * 0.65, pr * 0.6, 5, side > 0 ? 3 : 9), 5 * rx / 50);
    });
    let acc = '';
    [-1, 1].forEach((side) => {
      const cx = side * rx * 0.72, cy = -ry * 0.84;
      acc += R(A.dEll(0, 0, 13 * rx / 50, 20 * rx / 50), 'acc', ` transform="translate(${f(cx)},${f(cy)}) rotate(${side * 50})"`);
      acc += A.circ(cx, cy, 6 * rx / 50, 'acc2');
    });
    return { behind: '', back2: behind, over: R(A.dPoly(left), 'hair') + R(A.dPoly(right), 'hair'), acc, hl };
  };
  // tranças com miçangas (até o queixo)
  H.beads = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.12, yC: -ry * 0.62, pow: 2.4, part: 0, partDepth: 3 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.08, ry * 1.02, -ry * 0.02, 0, 0, 60);
    let tex = '';
    for (let i = 1; i < 8; i++) {
      const t = Math.PI + (i / 8) * Math.PI;
      const x = rx * 1.06 * Math.cos(t), y = -ry * 0.12 + ry * 1.0 * Math.sin(t);
      const h = hl.pts[Math.round((i / 8) * (hl.pts.length - 1))];
      tex += A.Lt(`M${f(h[0])},${f(h[1])}L${f(x)},${f(y)}`, 0.55);
    }
    let behind = '';
    const ends = [];
    const n = 4;
    [-1, 1].forEach((side) => {
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x0 = side * rx * (0.65 + 0.45 * t), y0 = -ry * (0.75 - 0.65 * t);
        const xe = side * rx * (0.98 + 0.7 * t), ye = ry * (0.75 + 0.3 * ((i + (side > 0 ? 1 : 0)) % 3) + 0.25 * t);
        behind += A.ribbon([[x0, y0], [side * (Math.abs(x0) + rx * 0.3), ry * 0.0], [xe, ye]], 13 * rx / 50, 11 * rx / 50, 'hair', false, true);
        behind += A.Lt(`M${f(xe - 4)},${f(ye - 22)}l4,4l4,-4M${f(xe - 4)},${f(ye - 36)}l4,4l4,-4`, 0.45);
        ends.push([xe, ye, i]);
      }
    });
    let beadsS = '';
    ends.forEach(([x, y, i]) => {
      const sc = rx / 50;
      beadsS += A.ell(x, y + 7 * sc, 7.5 * sc, 7 * sc, 'acc');
      beadsS += A.rect(x - 5.5 * sc, y + 13 * sc, 11 * sc, 12 * sc, 4 * sc, 'acc2');
      beadsS += A.circ(x, y + 31 * sc, 7.5 * sc - (i % 2) * 1.5 * sc, 'acc3');
    });
    return { behind: behind + beadsS, over: R(A.smoothD(pts, true, 0.12), 'hair') + tex, hl, hideEars: true };
  };
  // cachinhos / twists curtos
  H.twists = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.12, yC: -ry * 0.6, pow: 2.5 });
    const pts = ellUpper(0, -ry * 0.18, rx * 1.15, ry * 1.12, -ry * 0.02, 0, 0, 40);
    let d = A.smoothD(pts, true, 0.1);
    let over = R(d, 'hair');
    // pequenas molinhas: cada uma uma regiãozinha arredondada sobre o contorno
    let twists = '';
    for (let i = 0; i <= 12; i++) {
      const t = Math.PI * 1.02 + (i / 12) * Math.PI * 0.96;
      const x = rx * 1.12 * Math.cos(t), y = -ry * 0.18 + ry * 1.1 * Math.sin(t);
      twists += A.ell(x, y, 9 * rx / 50, 11 * rx / 50, 'hair2');
      twists += A.Lt(`M${f(x - 5 * rx / 50)},${f(y - 3)}q${f(5 * rx / 50)},${f(4)} ${f(10 * rx / 50)},0M${f(x - 5 * rx / 50)},${f(y + 4)}q${f(5 * rx / 50)},${f(4)} ${f(10 * rx / 50)},0`, 0.45);
    }
    return { over: twists + over + texCurls(P.scatter(0, -ry * 0.75, rx * 0.7, ry * 0.25, 6, 13), 4 * rx / 50), hl };
  };
  // careca / raspado bem rente
  H.bald = (o, rx, ry) => ({ over: '', hl: null, extra: A.Lt(`M${f(-rx * 0.6)},${f(-ry * 0.7)}q${f(rx * 0.2)},${f(-ry * 0.12)} ${f(rx * 0.4)},${f(-ry * 0.15)}`, 0.5) });
  // fade baixinho (linha do cabelo marcada)
  H.fade = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.15, yC: -ry * 0.65, pow: 4 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.035, ry * 0.94, -ry * 0.05, 0, 0, 50);
    return { over: R(A.smoothD(pts, true, 0.12), 'hair') + A.Lt(`M${f(-rx * 0.3)},${f(-ry * 0.82)}l${f(rx * 0.12)},${f(-ry * 0.06)}M${f(rx * 0.1)},${f(-ry * 0.85)}l${f(rx * 0.12)},${f(-ry * 0.04)}`, 0.5), hl };
  };
  // afro curtinho arredondado (adultos, avós)
  H.shortafro = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: ry * 0.0, yC: -ry * 0.55, pow: 2.2, scallop: -2.5, waves: 6 });
    const d = A.cloudD(0, -ry * 0.38, rx * 1.28, ry * 0.95, 20, 0.3, 0.1);
    return { over: R(d, 'hair') + texCurls(P.scatter(0, -ry * 0.9, rx * 0.95, ry * 0.4, 16, 21), 4.2 * rx / 50), hl, hideEars: false };
  };
  // coque alto (adultas)
  H.bun = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.1, yC: -ry * 0.55, pow: 2.4 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.05, ry * 0.98, -ry * 0.02, 0, 0, 50);
    const behind2 = R(A.cloudD(0, -ry * 1.25, rx * 0.62, ry * 0.45, 14, 0.3, 0), 'hair2') + texCurls([[-rx * 0.2, -ry * 1.3], [rx * 0.2, -ry * 1.2]], 4.5 * rx / 50);
    const acc = A.rect(-rx * 0.45, -ry * 1.0, rx * 0.9, ry * 0.18, 6, 'acc');
    return { back2: behind2, over: R(A.smoothD(pts, true, 0.12), 'hair') + A.Lt(`M${f(-rx * 0.6)},${f(-ry * 0.62)}Q0,${f(-ry * 1.0)} ${f(rx * 0.6)},${f(-ry * 0.62)}`, 0.5), acc, hl };
  };
  // cabelo preso com faixa (lenço/faixa larga) e cachos
  H.headband = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.05, yC: -ry * 0.5, pow: 2.2 });
    const d = A.cloudD(0, -ry * 0.62, rx * 1.4, ry * 0.95, 18, 0.32, 0.15);
    const band = [];
    for (let i = 0; i <= 20; i++) {
      const t = Math.PI * 1.05 + (i / 20) * Math.PI * 0.9;
      band.push([rx * 1.04 * Math.cos(t), -ry * 0.25 + ry * 0.62 * Math.sin(t)]);
    }
    const acc = A.ribbon(band, 22 * rx / 50, 22 * rx / 50, 'acc', true, true) +
      R(A.petalD(rx * 0.55, -ry * 0.82, rx * 0.5, rx * 0.2, -40), 'acc') + R(A.petalD(rx * 0.55, -ry * 0.82, rx * 0.5, rx * 0.2, -100), 'acc') + A.circ(rx * 0.55, -ry * 0.82, 7 * rx / 50, 'acc2');
    return { over: R(d, 'hair') + texCurls(P.scatter(0, -ry * 1.15, rx * 0.9, ry * 0.25, 7, 4), 5 * rx / 50), acc, hl, hideEars: true };
  };
  // turbante / torço
  H.turban = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.1, yC: -ry * 0.45, pow: 2.2 });
    const k1 = 'acc', k2 = 'acc2', k3 = 'acc3';
    let over = '';
    // volume de trás
    over += R(A.smoothD([[-rx * 1.15, -ry * 0.05], [-rx * 1.35, -ry * 0.9], [-rx * 0.9, -ry * 1.75], [0, -ry * 2.05], [rx * 0.95, -ry * 1.8], [rx * 1.35, -ry * 0.95], [rx * 1.15, -ry * 0.05], [0, -ry * 0.3]], true, 0.17), k1);
    // dobras
    over += R(A.smoothD([[-rx * 1.12, -ry * 0.1], [-rx * 1.05, -ry * 0.75], [-rx * 0.3, -ry * 1.35], [rx * 0.7, -ry * 1.55], [rx * 1.2, -ry * 1.25], [rx * 0.6, -ry * 1.1], [-rx * 0.2, -ry * 0.75], [-rx * 0.7, -ry * 0.25]], true, 0.17), k2);
    over += R(A.smoothD([[rx * 1.14, -ry * 0.1], [rx * 1.1, -ry * 0.75], [rx * 0.4, -ry * 1.05], [-rx * 0.6, -ry * 1.5], [-rx * 1.0, -ry * 1.3], [-rx * 0.2, -ry * 0.95], [rx * 0.4, -ry * 0.6], [rx * 0.75, -ry * 0.2]], true, 0.17), k3);
    // laço/nó no alto
    over += R(A.smoothD([[-rx * 0.1, -ry * 1.6], [-rx * 0.75, -ry * 2.2], [-rx * 0.35, -ry * 2.45], [rx * 0.05, -ry * 1.95]], true, 0.2), k2);
    over += R(A.smoothD([[rx * 0.05, -ry * 1.6], [rx * 0.8, -ry * 2.15], [rx * 0.45, -ry * 2.45], [-rx * 0.05, -ry * 1.95]], true, 0.2), k3);
    over += A.circ(0, -ry * 1.72, 11 * rx / 50, k1);
    // estampas geométricas (triângulos e pontos)
    for (let i = 0; i < 5; i++) {
      const x = -rx * 0.95 + i * rx * 0.25, y = -ry * 0.55 - i * ry * 0.17;
      over += A.Lt(A.dCirc(x, y, 4 * rx / 50), 0.5);
    }
    over += A.Lt(`M${f(rx * 0.25)},${f(-ry * 1.38)}l${f(rx * 0.12)},${f(-ry * 0.12)}l${f(rx * 0.12)},${f(ry * 0.1)}l${f(rx * 0.12)},${f(-ry * 0.12)}l${f(rx * 0.12)},${f(ry * 0.1)}`, 0.6);
    return { over, hl, hideEars: false };
  };
  // ondas curtas (adulto)
  H.waves = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.15, yC: -ry * 0.62, pow: 3.2 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.04, ry * 0.95, -ry * 0.05, 0, 0, 50);
    let tex = '';
    for (let i = 0; i < 3; i++) tex += A.Lt(`M${f(-rx * 0.7 + i * 6)},${f(-ry * (0.72 + i * 0.1))}q${f(rx * 0.18)},${f(-ry * 0.08)} ${f(rx * 0.35)},0t${f(rx * 0.35)},0t${f(rx * 0.35)},0`, 0.5);
    return { over: R(A.smoothD(pts, true, 0.12), 'hair') + tex, hl };
  };
  // rabo de cavalo crespo alto (puff único)
  H.puff1 = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.1, yC: -ry * 0.58, pow: 2.4 });
    const pts = ellUpper(0, -ry * 0.12, rx * 1.05, ry * 0.98, -ry * 0.02, 0, 0, 50);
    const back2 = R(A.cloudD(0, -ry * 1.45, rx * 1.05, ry * 0.65, 18, 0.32, 0.3), 'hair2') + texCurls(P.scatter(0, -ry * 1.5, rx * 0.65, ry * 0.35, 6, 17), 5 * rx / 50);
    let tex = '';
    for (let i = 1; i < 6; i++) {
      const x = -rx * 0.9 + i * rx * 0.3;
      tex += A.Lt(`M${f(x)},${f(-ry * 0.58 + Math.abs(x) * 0.15)}Q${f(x * 0.5)},${f(-ry * 0.85)} 0,${f(-ry * 1.0)}`, 0.45);
    }
    const acc = A.ellRot ? '' : R(A.dRect(-rx * 0.38, -ry * 1.1, rx * 0.76, ry * 0.2, 7), 'acc');
    return { back2, over: R(A.smoothD(pts, true, 0.12), 'hair') + tex, acc, hl };
  };
  // cabelo grisalho preso com lenço (avó)
  H.wrap = (o, rx, ry) => {
    const hl = P.hairlinePts(rx, ry, { yT: -ry * 0.05, yC: -ry * 0.45, pow: 2.2, scallop: -2, waves: 6 });
    const d = A.cloudD(0, -ry * 0.35, rx * 1.2, ry * 0.85, 18, 0.3, 0.1);
    const scarf = A.smooth([[-rx * 1.12, -ry * 0.45], [-rx * 0.9, -ry * 1.2], [0, -ry * 1.5], [rx * 0.9, -ry * 1.2], [rx * 1.12, -ry * 0.45], [rx * 0.5, -ry * 0.85], [-rx * 0.5, -ry * 0.85]], 'acc') +
      R(A.petalD(rx * 0.95, -ry * 0.95, rx * 0.5, rx * 0.2, -30), 'acc2') + R(A.petalD(rx * 0.95, -ry * 0.95, rx * 0.45, rx * 0.18, 30), 'acc2') + A.circ(rx * 0.95, -ry * 0.95, 7 * rx / 50, 'acc');
    return { over: R(d, 'hair') + texCurls([[-rx * 0.8, -ry * 0.4], [rx * 0.8, -ry * 0.45]], 4 * rx / 50), acc: scarf, hl };
  };

  /* ================= CABEÇA COMPLETA ================= */
  P.head = (o) => {
    o = o || {};
    const rx = o.rx || 50, ry = o.ry || 56;
    const jaw = o.jaw || 0.95, narrow = o.narrow == null ? 0.08 : o.narrow;
    const prevColors = A.colors;
    if (o.paint) A.colors = o.paint;
    const hs = (H[o.hair || 'short'] || H.short)(o, rx, ry);
    let s = '';
    if (hs.back2) s += hs.back2;
    if (hs.behind) s += hs.behind;
    // orelhas
    const showEars = o.ears !== false && !hs.hideEars;
    const earY = ry * 0.12;
    if (showEars) {
      [-1, 1].forEach((side) => {
        const ex = side * rx * 0.98;
        s += A.ell(ex, earY, rx * 0.17, ry * 0.21, 'skin');
        s += A.Lt(`M${f(ex - side * rx * 0.02)},${f(earY - ry * 0.1)}q${f(side * rx * 0.08)},${f(ry * 0.08)} 0,${f(ry * 0.18)}`, 0.55);
      });
    }
    // rosto
    s += R(A.smoothD(P.facePts(rx, ry, jaw, narrow, 48), true, 0.16), 'skin');
    // detalhes de idade
    if (o.elder) {
      s += A.Lt(`M${f(-rx * 0.62)},${f(ry * 0.42)}q${f(rx * 0.1)},${f(ry * 0.22)} ${f(rx * 0.22)},${f(ry * 0.28)}M${f(rx * 0.62)},${f(ry * 0.42)}q${f(-rx * 0.1)},${f(ry * 0.22)} ${f(-rx * 0.22)},${f(ry * 0.28)}`, 0.55);
      s += A.Lt(`M${f(-rx * 0.62)},${f(ry * 0.0)}l${f(-rx * 0.1)},${f(ry * 0.04)}M${f(rx * 0.62)},${f(ry * 0.0)}l${f(rx * 0.1)},${f(ry * 0.04)}`, 0.5);
    }
    if (o.freckles) P.scatter(0, ry * 0.24, rx * 0.55, ry * 0.08, 8, 5).forEach(([x, y]) => { if (Math.abs(x) > rx * 0.2) s += A.dot(x, y, 1.3 * rx / 50); });
    if (o.beard) {
      const by = ry * 0.36;
      const b = o.beard === 'full'
        ? A.smoothD([[-rx * 0.99, ry * 0.12], [-rx * 0.9, ry * 0.6], [-rx * 0.4, ry * 1.05], [0, ry * 1.12], [rx * 0.4, ry * 1.05], [rx * 0.9, ry * 0.6], [rx * 0.99, ry * 0.12], [rx * 0.78, ry * 0.45], [rx * 0.35, by + ry * 0.12], [0, by + ry * 0.08], [-rx * 0.35, by + ry * 0.12], [-rx * 0.78, ry * 0.45]], true, 0.14)
        : A.smoothD([[-rx * 0.6, ry * 0.62], [-rx * 0.35, ry * 0.98], [0, ry * 1.06], [rx * 0.35, ry * 0.98], [rx * 0.6, ry * 0.62], [rx * 0.3, ry * 0.85], [0, ry * 0.88], [-rx * 0.3, ry * 0.85]], true, 0.16);
      s += R(b, 'hair');
      // bigode
      s += R(A.smoothD([[-rx * 0.38, ry * 0.6], [-rx * 0.2, ry * 0.5], [0, ry * 0.53], [rx * 0.2, ry * 0.5], [rx * 0.38, ry * 0.6], [rx * 0.15, ry * 0.58], [0, ry * 0.6], [-rx * 0.15, ry * 0.58]], true, 0.15), 'hair');
    }
    s += eyesD(o, rx, ry) + noseD(o, rx, ry);
    if (!o.beard || o.beard === 'goatee' || true) s += mouthD(Object.assign({ mouthY: o.beard ? 0.7 : o.mouthY }, o, o.beard ? { mouthY: 0.72, mouthW: 0.85 } : {}), rx, ry);
    // bochechas (sorriso)
    if ((o.mouth === 'grin' || o.eyes === 'happy' || o.mouth === 'lips') && A.sw() <= 3.6) {
      s += A.Lt(`M${f(-rx * 0.62)},${f(ry * 0.36)}q${f(rx * 0.07)},${f(ry * 0.07)} ${f(rx * 0.16)},${f(ry * 0.05)}M${f(rx * 0.62)},${f(ry * 0.36)}q${f(-rx * 0.07)},${f(ry * 0.07)} ${f(-rx * 0.16)},${f(ry * 0.05)}`, 0.45);
    }
    // cabelo por cima (recortado no rosto)
    if (hs.over) {
      if (hs.hl) {
        const clip = A.clipHole(P.holeD(rx, ry, jaw, narrow, hs.hl));
        s += `<defs>${clip.def}</defs><g clip-path="url(#${clip.id})">${hs.over}</g>`;
        s += A.L(A.smoothD(hs.hl.pts.filter((p, i) => i % 2 === 0), false, 0.16));
        // "baby hair" desenhado nas têmporas
        if (o.edges) {
          [0.16, 0.84].forEach((u) => {
            const p = hs.hl.pts[Math.round(u * (hs.hl.pts.length - 1))], k = u < 0.5 ? 1 : -1, q = rx * 0.1;
            s += A.Lt(`M${f(p[0])},${f(p[1])}q${f(k * q * 0.2)},${f(q * 0.9)} ${f(k * q)},${f(q * 0.7)}q${f(k * q * 0.6)},${f(-q * 0.2)} ${f(k * q * 0.2)},${f(-q * 0.6)}q${f(-k * q * 0.4)},${f(q * 0.1)} ${f(-k * q * 0.1)},${f(q * 0.45)}`, 0.5);
          });
        }
      } else s += hs.over;
    }
    if (hs.extra) s += hs.extra;
    if (hs.acc) s += hs.acc;
    if (o.headTop) s += o.headTop(rx, ry);
    // brincos
    if (o.earrings && (showEars || o.earrings === 'hoop' || o.earrings === 'big')) {
      [-1, 1].forEach((side) => {
        const ex = side * rx * 1.0, ey = earY + ry * 0.2;
        if (o.earrings === 'hoop') s += A.ring(ex, ey + rx * 0.3, rx * 0.3, rx * 0.21, 'acc4');
        else if (o.earrings === 'big') {
          s += A.circ(ex, ey + 2, rx * 0.08, 'acc4');
          s += A.poly([[ex, ey + rx * 0.12], [ex - rx * 0.22, ey + rx * 0.62], [ex + rx * 0.22, ey + rx * 0.62]], 'acc5');
          s += A.poly([[ex, ey + rx * 0.32], [ex - rx * 0.1, ey + rx * 0.55], [ex + rx * 0.1, ey + rx * 0.55]], 'acc4');
        } else s += A.circ(ex, ey, rx * 0.07, 'acc4');
      });
    }
    if (o.glasses) {
      const ex = (o.eyeGap || 0.38) * rx, ey = (o.eyeY || 0.04) * ry, gr = rx * 0.25;
      s += A.R(A.dCirc(-ex, ey, gr) + A.dCirc(-ex, ey, gr * 0.78), 'acc5', ' fill-rule="evenodd"');
      s += A.R(A.dCirc(ex, ey, gr) + A.dCirc(ex, ey, gr * 0.78), 'acc5', ' fill-rule="evenodd"');
      s += L(`M${f(-ex + gr)},${f(ey - 2)}Q0,${f(ey - 8)} ${f(ex - gr)},${f(ey - 2)}`);
    }
    A.colors = prevColors;
    return s;
  };

  /* ================= ESTAMPAS DE ROUPA ================= */
  const PRINTS = ['star', 'heart', 'stripes', 'dots', 'sun', 'flower', 'band', 'rainbow', 'diamond', 'pocket'];
  let printSeq = 0;
  P.print = (kind, cx, cy, sz, W) => {
    const k = kind === 'auto' || !kind ? PRINTS[(printSeq++) % PRINTS.length] : kind;
    let t = '';
    if (k === 'star') t += A.star(cx, cy, sz, sz * 0.45, 5, 0, 'top2') + A.star(cx - sz * 1.4, cy + sz * 0.7, sz * 0.35, sz * 0.16, 5, 10, 'top2') + A.star(cx + sz * 1.4, cy - sz * 0.5, sz * 0.3, sz * 0.14, 5, -10, 'top2');
    else if (k === 'heart') t += A.heart(cx, cy, sz * 0.95, 'top2') + A.heart(cx - sz * 1.35, cy - sz * 0.6, sz * 0.32, 'top2') + A.heart(cx + sz * 1.35, cy + sz * 0.5, sz * 0.32, 'top2');
    else if (k === 'stripes') for (let i = -2; i <= 3; i++) t += A.rect(-W, cy + i * sz * 0.9, W * 2, sz * 0.42, 0, i % 2 ? 'top2' : 'acc3');
    else if (k === 'dots') for (let i = -4; i <= 4; i++) for (let j = -3; j <= 4; j++) t += A.circ(i * sz * 0.8 + (j % 2) * sz * 0.4, cy + j * sz * 0.75, sz * 0.17, 'top2');
    else if (k === 'sun') { for (let i = 0; i < 10; i++) t += A.R(A.petalD(cx, cy, sz * 1.15, sz * 0.18, i * 36, sz * 0.62), 'top2'); t += A.circ(cx, cy, sz * 0.55, 'acc3'); }
    else if (k === 'flower') t += A.flower(cx, cy, sz * 0.9, 6) + A.flower(cx - sz * 1.4, cy + sz * 0.9, sz * 0.45, 5) + A.flower(cx + sz * 1.3, cy - sz * 0.7, sz * 0.4, 5);
    else if (k === 'band') { t += A.rect(-W, cy - sz * 0.55, W * 2, sz * 1.1, 0, 'top2'); for (let i = -6; i <= 6; i++) t += A.poly([[i * sz * 0.7, cy + sz * 0.45], [i * sz * 0.7 + sz * 0.35, cy - sz * 0.4], [i * sz * 0.7 + sz * 0.7, cy + sz * 0.45]], 'acc3'); }
    else if (k === 'rainbow') { [1.2, 0.9, 0.6].forEach((r, i) => { t += A.R(`M${f(cx - sz * r)},${f(cy + sz * 0.5)}A${f(sz * r)},${f(sz * r)} 0 0,1 ${f(cx + sz * r)},${f(cy + sz * 0.5)}L${f(cx + sz * (r - 0.3))},${f(cy + sz * 0.5)}A${f(sz * (r - 0.3))},${f(sz * (r - 0.3))} 0 0,0 ${f(cx - sz * (r - 0.3))},${f(cy + sz * 0.5)}Z`, ['top2', 'acc3', 'acc'][i]); }); t += A.R(A.cloudD(cx - sz * 1.0, cy + sz * 0.55, sz * 0.38, sz * 0.2, 6, 0.4, 0), 'acc') + A.R(A.cloudD(cx + sz * 1.0, cy + sz * 0.55, sz * 0.38, sz * 0.2, 6, 0.4, 0), 'acc'); }
    else if (k === 'diamond') { for (let i = -3; i <= 3; i++) t += A.poly(A.ngonPts(i * sz * 0.85, cy, sz * 0.38, 4, 0), i % 2 ? 'top2' : 'acc3'); t += A.Lt(`M${-W},${f(cy - sz * 0.55)}L${W},${f(cy - sz * 0.55)}M${-W},${f(cy + sz * 0.55)}L${W},${f(cy + sz * 0.55)}`, 0.6); }
    else if (k === 'pocket') t += A.R(`M${f(cx - sz * 1.4)},${f(cy - sz * 0.6)}h${f(sz * 1.1)}v${f(sz * 0.9)}q0,${f(sz * 0.35)} ${f(-sz * 0.35)},${f(sz * 0.35)}h${f(-sz * 0.4)}q${f(-sz * 0.35)},0 ${f(-sz * 0.35)},${f(-sz * 0.35)}Z`, 'top2') + A.Lt(`M${f(cx - sz * 1.4)},${f(cy - sz * 0.35)}h${f(sz * 1.1)}`, 0.5) + A.star(cx + sz * 0.8, cy + sz * 0.2, sz * 0.55, sz * 0.25, 5, 0, 'acc3');
    return t;
  };
  // punho fechado (segurando objetos)
  P.fist = (x, y, r, k) => A.circ(x, y, r, k || 'skin') + A.Lt(`M${f(x - r * 0.55)},${f(y - r * 0.25)}q${f(r * 0.25)},${f(r * 0.2)} 0,${f(r * 0.45)}M${f(x - r * 0.1)},${f(y - r * 0.4)}q${f(r * 0.25)},${f(r * 0.25)} 0,${f(r * 0.55)}M${f(x + r * 0.35)},${f(y - r * 0.3)}q${f(r * 0.22)},${f(r * 0.2)} 0,${f(r * 0.45)}`, 0.45);
  // mão aberta com polegar e dedos, orientada pelo antebraço
  P.hand = (hd, el, side, r) => {
    let dx = hd[0] - el[0], dy = hd[1] - el[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l; dy /= l;
    const px = -dy, py = dx;
    const sg = (px * -side > 0) ? 1 : -1; // polegar para o lado do corpo
    const c = [hd[0] + dx * r * 0.25, hd[1] + dy * r * 0.25];
    const ang = Math.atan2(dy, dx) / D2R;
    const tb = [c[0] + px * sg * r * 0.55, c[1] + py * sg * r * 0.55];
    let t = A.R(A.petalD(tb[0] - dx * r * 0.2, tb[1] - dy * r * 0.2, r * 1.05, r * 0.36, ang + sg * 48), 'skin');
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const ax = Math.cos(a) * r * (Math.cos(a) > 0 ? 1.12 : 0.92), ay = Math.sin(a) * r * 0.86;
      pts.push([c[0] + dx * ax + px * ay, c[1] + dy * ax + py * ay]);
    }
    t += A.R(A.smoothD(pts, true, 0.16), 'skin');
    let fl = '';
    [-0.42, 0, 0.42].forEach((o) => {
      const a = [c[0] + dx * r * 0.45 + px * o * r, c[1] + dy * r * 0.45 + py * o * r];
      const b = [c[0] + dx * r * 1.02 + px * o * r * 0.9, c[1] + dy * r * 1.02 + py * o * r * 0.9];
      fl += `M${f(a[0])},${f(a[1])}L${f(b[0])},${f(b[1])}`;
    });
    return t + A.Lt(fl, 0.45);
  };

  /* ================= BUSTO (retratos) ================= */
  P.bust = (o) => {
    const rx = o.rx || 50, ry = o.ry || 56;
    const prev = A.colors;
    if (o.paint) A.colors = o.paint;
    const nw = rx * 0.34, sy = ry * 1.35, sw = rx * (o.shoulder || 2.25), B = o.bottom || ry * 3.3;
    let s = '';
    s += A.rect(-nw, ry * 0.55, nw * 2, sy - ry * 0.45, 6, 'skin');
    s += A.Lt(`M${f(-nw * 0.6)},${f(ry * 1.0)}q${f(nw * 0.6)},${f(ry * 0.12)} ${f(nw * 1.2)},0`, 0.4);
    const nl = o.neckline || 'round';
    const neckDepth = nl === 'v' ? ry * 0.55 : ry * 0.25;
    const shirt = `M${f(-sw)},${f(B)}L${f(-sw)},${f(sy + ry * 0.65)}C${f(-sw)},${f(sy + ry * 0.1)} ${f(-sw * 0.62)},${f(sy - ry * 0.05)} ${f(-nw - rx * 0.12)},${f(sy - ry * 0.12)}` +
      (nl === 'v' ? `L0,${f(sy + neckDepth)}L${f(nw + rx * 0.12)},${f(sy - ry * 0.12)}` : `Q0,${f(sy + neckDepth)} ${f(nw + rx * 0.12)},${f(sy - ry * 0.12)}`) +
      `C${f(sw * 0.62)},${f(sy - ry * 0.05)} ${f(sw)},${f(sy + ry * 0.1)} ${f(sw)},${f(sy + ry * 0.65)}L${f(sw)},${f(B)}Z`;
    s += R(shirt, 'top');
    const cl = A.uid();
    const inner = (o.deco ? o.deco(rx, ry, sy, sw, B) : P.print(o.print || 'auto', 0, sy + ry * 1.25, ry * 0.42, sw)) +
      // costuras dos ombros e mangas
      A.Lt(`M${f(-sw * 0.66)},${f(sy + ry * 0.02)}Q${f(-sw * 0.8)},${f(sy + ry * 0.6)} ${f(-sw * 0.78)},${f(B)}M${f(sw * 0.66)},${f(sy + ry * 0.02)}Q${f(sw * 0.8)},${f(sy + ry * 0.6)} ${f(sw * 0.78)},${f(B)}`, 0.55) +
      A.Lt(`M${f(-sw * 0.55)},${f(sy + ry * 0.9)}q${f(rx * 0.08)},${f(ry * 0.2)} ${f(rx * 0.02)},${f(ry * 0.45)}M${f(sw * 0.55)},${f(sy + ry * 0.9)}q${f(-rx * 0.08)},${f(ry * 0.2)} ${f(-rx * 0.02)},${f(ry * 0.45)}`, 0.4);
    s += `<defs><clipPath id="${cl}"><path d="${shirt}"/></clipPath></defs><g clip-path="url(#${cl})">${inner}</g>`;
    // gola
    if (nl === 'round') s += A.ribbon([[-nw - rx * 0.12, sy - ry * 0.12], [0, sy + neckDepth - ry * 0.02], [nw + rx * 0.12, sy - ry * 0.12]], ry * 0.13, ry * 0.13, 'top2', true, true);
    if (nl === 'v') s += A.ribbon([[-nw - rx * 0.12, sy - ry * 0.12], [0, sy + neckDepth], [nw + rx * 0.12, sy - ry * 0.12]], ry * 0.1, ry * 0.1, 'top2', true, true);
    if (nl === 'collar') {
      s += R(`M${f(-nw - rx * 0.1)},${f(sy - ry * 0.14)}L${f(-rx * 0.08)},${f(sy + ry * 0.3)}L${f(-rx * 0.62)},${f(sy + ry * 0.32)}Z`, 'top2');
      s += R(`M${f(nw + rx * 0.1)},${f(sy - ry * 0.14)}L${f(rx * 0.08)},${f(sy + ry * 0.3)}L${f(rx * 0.62)},${f(sy + ry * 0.32)}Z`, 'top2');
      s += A.Lt(`M0,${f(sy + ry * 0.3)}L0,${f(B)}`, 0.5);
      for (let i = 0; i < 3; i++) s += A.circ(0, sy + ry * (0.45 + i * 0.32), rx * 0.06, 'acc');
    }
    if (o.necklace) {
      for (let i = 0; i < 9; i++) {
        const t = -1 + (2 * i) / 8;
        s += A.circ(t * (nw + rx * 0.05), ry * 1.05 + (1 - t * t) * ry * 0.32, rx * (i === 4 ? 0.1 : 0.07), i % 2 ? 'acc2' : 'acc');
      }
    }
    A.colors = prev;
    return s + P.head(o);
  };

  /* ================= CORPO INTEIRO ================= */
  // ângulos em graus: 0 = para baixo, 90 = para o lado de fora, 180 = para cima, negativo = cruzando o corpo
  const limbEnd = (x, y, len, deg, side) => [x + Math.sin(deg * D2R) * len * side, y + Math.cos(deg * D2R) * len];
  const along = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  P.figure = (o) => {
    o = o || {};
    const prev = A.colors;
    if (o.paint) A.colors = o.paint;
    const adult = o.age === 'adult' || o.age === 'elder';
    const rx = o.rx || (adult ? 42 : 46), ry = o.ry || 52;
    const sy = ry * 0.98, sw = (adult ? 48 : 40) * (o.wide || 1), ww = (adult ? 38 : 33) * (o.wide || 1);
    const wy = sy + (adult ? 125 : 88);
    const hy = wy + (adult ? 10 : 8), hx = adult ? 18 : 15;
    const ua = (adult ? 66 : 46), fa = (adult ? 60 : 42);
    const th = (adult ? 72 : 50), sh = (adult ? 70 : 48);
    const arms = o.arms || {}, legs = o.legs || {};
    const la = arms.l || [12, 8], ra = arms.r || [12, 8];
    const ll = legs.l || [4, 2], rl = legs.r || [4, 2];
    const lower = o.lower || 'shorts';
    const sleeve = o.sleeve || 'short';
    let legsS = '', torsoS = '', armsS = '';
    const hands = {}, feet = {};
    const legCloth = lower === 'pants' || o.pantsUnder;
    const lw0 = adult ? 31 : 28, lw1 = adult ? 23 : 21;
    // pernas e sapatos
    [['l', -1, ll], ['r', 1, rl]].forEach(([n, side, a]) => {
      const hip = [side * hx, hy];
      const knee = limbEnd(hip[0], hip[1], th, a[0], side);
      const foot = limbEnd(knee[0], knee[1], sh, a[1], side);
      feet[n] = foot;
      legsS += R(A.ribbonD([hip, knee, foot], lw0, lw1, true, true), legCloth ? 'bottom' : 'skin');
      if (legCloth) {
        legsS += A.Lt(`M${f(knee[0] - 5)},${f(knee[1] - 4)}q5,5 10,0`, 0.5);
        const c0 = along(foot, knee, 0.22);
        legsS += R(A.ribbonD([c0, along(foot, knee, -0.02)], lw1 + 5, lw1 + 5, false, false), 'bottom2');
      } else {
        legsS += A.Lt(`M${f(knee[0] - 4)},${f(knee[1])}q4,3 8,0`, 0.45);
        if (o.socks !== false && !o.barefoot) legsS += R(A.ribbonD([along(foot, knee, 0.3), foot], lw1 + 2, lw1 + 2, false, false), 'acc3');
      }
      const d = side, fx = foot[0], fy = foot[1] + 2;
      if (o.barefoot) {
        legsS += R(A.smoothD([[fx - d * 10, fy - 3], [fx + d * 6, fy - 4], [fx + d * 20, fy + 4], [fx + d * 17, fy + 11], [fx - d * 10, fy + 10]], true, 0.18), 'skin');
        legsS += A.Lt(`M${f(fx + d * 13)},${f(fy + 3)}l0,5M${f(fx + d * 17)},${f(fy + 4)}l0,5`, 0.4);
      } else {
        // tênis: cabedal, sola, biqueira e cadarço
        legsS += R(A.smoothD([[fx - d * 14, fy - 6], [fx + d * 4, fy - 9], [fx + d * 24, fy + 2], [fx + d * 24, fy + 11], [fx - d * 15, fy + 11]], true, 0.18), 'shoe');
        legsS += R(A.ribbonD([[fx - d * 15, fy + 13], [fx + d * 25, fy + 13]], 7, 7, true, true), 'shoe2');
        legsS += A.Lt(`M${f(fx + d * 12)},${f(fy - 3)}q${f(d * 7)},${f(4)} ${f(d * 10)},${f(12)}M${f(fx - d * 2)},${f(fy - 6)}l${f(d * 8)},${f(5)}M${f(fx + d * 3)},${f(fy - 8)}l${f(d * 2)},${f(8)}`, 0.5);
      }
    });
    // roupa de baixo
    let lowerS = '';
    const crotch = hy + (adult ? 30 : 22);
    if (lower === 'shorts' || lower === 'pants') {
      lowerS += R(`M${f(-ww)},${f(wy - 6)}L${f(ww)},${f(wy - 6)}L${f(ww + 4)},${f(crotch)}L${f(4)},${f(crotch)}L0,${f(hy + 6)}L${f(-4)},${f(crotch)}L${f(-ww - 4)},${f(crotch)}Z`, 'bottom');
      lowerS += A.rect(-ww - 1, wy - 8, ww * 2 + 2, 12, 3, 'bottom2');
      lowerS += A.Lt(`M${f(-ww + 8)},${f(wy - 7)}l0,11M${f(ww - 8)},${f(wy - 7)}l0,11M0,${f(wy + 4)}L0,${f(hy + 4)}M${f(-ww + 2)},${f(wy + 6)}q${f(ww * 0.4)},${f(4)} ${f(ww * 0.5)},${f(16)}M${f(ww - 2)},${f(wy + 6)}q${f(-ww * 0.4)},${f(4)} ${f(-ww * 0.5)},${f(16)}`, 0.45);
      lowerS += A.circ(0, wy - 2, 3.2, 'acc');
      if (lower === 'shorts') {
        [-1, 1].forEach((side) => {
          const hip = [side * hx, hy];
          const a = side < 0 ? ll : rl;
          const k = limbEnd(hip[0], hip[1], th * 0.6, a[0], side);
          const k2 = limbEnd(hip[0], hip[1], th * 0.47, a[0], side);
          lowerS = R(A.ribbonD([[hip[0], hip[1] - 6], k], adult ? 40 : 36, adult ? 38 : 34, false, true), 'bottom') + R(A.ribbonD([k2, k], adult ? 39 : 35, adult ? 38 : 34, false, false), 'bottom2') + lowerS;
        });
      }
    } else if (lower === 'skirt') {
      const sl = o.skirtLen || (adult ? 95 : 52);
      const sk = `M${f(-ww)},${f(wy - 6)}L${f(ww)},${f(wy - 6)}Q${f(ww + 14)},${f(wy + sl * 0.5)} ${f(ww + sl * 0.5)},${f(wy + sl)}Q0,${f(wy + sl + 10)} ${f(-ww - sl * 0.5)},${f(wy + sl)}Q${f(-ww - 14)},${f(wy + sl * 0.5)} ${f(-ww)},${f(wy - 6)}Z`;
      lowerS += R(sk, 'bottom');
      const c2 = A.uid();
      let skd = A.R(`M-300,${f(wy + sl - 10)}Q0,${f(wy + sl)} 300,${f(wy + sl - 10)}L300,${f(wy + sl + 40)}L-300,${f(wy + sl + 40)}Z`, 'bottom2');
      for (let i = -3; i <= 3; i++) if (i) skd += A.Lt(`M${f(i * ww * 0.22)},${f(wy + 6)}L${f(i * ww * 0.36)},${f(wy + sl - 14)}`, 0.45);
      for (let i = -4; i <= 4; i++) skd += A.circ(i * (ww + sl * 0.4) / 4.4, wy + sl * 0.55, 3.5, 'acc3');
      lowerS += `<defs><clipPath id="${c2}"><path d="${sk}"/></clipPath></defs><g clip-path="url(#${c2})">${skd}</g>`;
      lowerS += A.rect(-ww - 1, wy - 8, ww * 2 + 2, 11, 3, 'bottom2');
    }
    // tronco
    const nw = rx * 0.32;
    const sl = o.skirtLen || (adult ? 110 : 62);
    const torso = (lower === 'dress')
      ? `M${f(-nw - 4)},${f(sy - 6)}Q${f(-sw + 6)},${f(sy - 4)} ${f(-sw)},${f(sy + 14)}L${f(-ww)},${f(wy - 8)}Q${f(-ww - 10)},${f(wy + sl * 0.5)} ${f(-ww - sl * 0.55)},${f(wy + sl)}Q0,${f(wy + sl + 12)} ${f(ww + sl * 0.55)},${f(wy + sl)}Q${f(ww + 10)},${f(wy + sl * 0.5)} ${f(ww)},${f(wy - 8)}L${f(sw)},${f(sy + 14)}Q${f(sw - 6)},${f(sy - 4)} ${f(nw + 4)},${f(sy - 6)}Q0,${f(sy + 14)} ${f(-nw - 4)},${f(sy - 6)}Z`
      : `M${f(-nw - 4)},${f(sy - 6)}Q${f(-sw + 6)},${f(sy - 4)} ${f(-sw)},${f(sy + 14)}L${f(-ww - 2)},${f(wy + 4)}Q0,${f(wy + 9)} ${f(ww + 2)},${f(wy + 4)}L${f(sw)},${f(sy + 14)}Q${f(sw - 6)},${f(sy - 4)} ${f(nw + 4)},${f(sy - 6)}Q0,${f(sy + 14)} ${f(-nw - 4)},${f(sy - 6)}Z`;
    torsoS += A.rect(-nw, ry * 0.6, nw * 2, sy - ry * 0.55, 5, 'skin');
    torsoS += R(torso, 'top');
    const cl = A.uid();
    let td = o.topDeco ? o.topDeco({ sy, sw, ww, wy, nw, adult }) : P.print(o.print || 'auto', 0, sy + (wy - sy) * 0.45, adult ? 18 : 15, sw + 10);
    if (lower === 'dress') {
      td += A.R(`M-300,${f(wy + sl - 12)}Q0,${f(wy + sl + 2)} 300,${f(wy + sl - 12)}L300,${f(wy + sl + 40)}L-300,${f(wy + sl + 40)}Z`, 'top2');
      for (let i = -3; i <= 3; i++) if (i) td += A.Lt(`M${f(i * ww * 0.25)},${f(wy + 8)}L${f(i * ww * 0.45)},${f(wy + sl - 16)}`, 0.45);
    }
    td += A.Lt(`M${f(-sw + 6)},${f(sy + 30)}q6,10 4,22M${f(sw - 6)},${f(sy + 30)}q-6,10 -4,22`, 0.45);
    if (lower !== 'dress') td += A.Lt(`M${f(-ww)},${f(wy - 4)}Q0,${f(wy + 1)} ${f(ww)},${f(wy - 4)}`, 0.4);
    torsoS += `<defs><clipPath id="${cl}"><path d="${torso}"/></clipPath></defs><g clip-path="url(#${cl})">${td}</g>`;
    // gola
    torsoS += A.ribbon([[-nw - 4, sy - 6], [0, sy + 8], [nw + 4, sy - 6]], 6, 6, 'top2', true, true);
    if (lower === 'dress') torsoS += A.ribbon([[-ww - 2, wy - 6], [0, wy - 2], [ww + 2, wy - 6]], 10, 10, 'acc2', true, true) + A.R(A.petalD(ww - 8, wy - 4, 22, 8, 30), 'acc2') + A.R(A.petalD(ww - 8, wy - 4, 22, 8, 150), 'acc2') + A.circ(ww - 8, wy - 4, 5, 'acc2');
    if (o.belt) torsoS += A.rect(-ww - 2, wy - 8, ww * 2 + 4, 12, 3, 'acc') + A.rect(-7, wy - 10, 14, 16, 3, 'acc2');
    // braços com manga, punho e mão
    [['l', -1, la], ['r', 1, ra]].forEach(([n, side, a]) => {
      const sh0 = [side * (sw - 11), sy + 16];
      const el = limbEnd(sh0[0], sh0[1], ua, a[0], side);
      const hd = limbEnd(el[0], el[1], fa, a[1], side);
      hands[n] = hd;
      const longS = sleeve === 'long';
      let arm = '';
      const aw0 = adult ? 25 : 22, aw1 = adult ? 19 : 17;
      const wrist = along(hd, el, 0.12);
      arm += R(A.ribbonD([sh0, el, wrist], aw0, aw1, true, true), longS ? 'top' : 'skin');
      if (sleeve === 'short') {
        const m = along(sh0, el, 0.55), m2 = along(sh0, el, 0.42);
        arm += R(A.ribbonD([[sh0[0] - side * 2, sh0[1] - 4], m], aw0 + 9, aw0 + 7, false, true), 'top');
        arm += R(A.ribbonD([m2, m], aw0 + 8, aw0 + 7, false, false), 'top2');
      } else if (longS) {
        arm += A.Lt(`M${f(el[0] - 6)},${f(el[1] - 3)}q6,6 12,0`, 0.45);
        arm += R(A.ribbonD([along(wrist, el, 0.2), wrist], aw1 + 5, aw1 + 5, false, false), 'top2');
      } else arm += A.Lt(`M${f(el[0] - 4)},${f(el[1])}q4,3 8,0`, 0.4);
      if (o.bracelet) arm += R(A.ribbonD([along(hd, el, 0.2), along(hd, el, 0.3)], aw1 + 4, aw1 + 4, false, false), 'acc2');
      arm += P.hand(hd, el, side, adult ? 11.5 : 10.5);
      armsS += arm;
    });
    if (o.cape) torsoS = o.cape + torsoS;
    const headS = P.head(o);
    let out = (o.behindBody || '') + legsS + lowerS + torsoS;
    if (o.armsOver) out += headS;
    else out += armsS + headS;
    A.colors = prev;
    return { svg: out, arms: o.armsOver ? armsS : '', hands, feet, sy, wy };
  };

  // posiciona uma figura no desenho e devolve as mãos/pés em coordenadas globais
  P.put = (o, x, y, s, flip) => {
    let fig;
    const svg = A.G(x, y, s, () => { fig = P.figure(o); return fig.svg + fig.arms; }, { flip });
    const g = (p) => [x + p[0] * s * (flip ? -1 : 1), y + p[1] * s];
    const hands = flip ? { l: g(fig.hands.r), r: g(fig.hands.l) } : { l: g(fig.hands.l), r: g(fig.hands.r) };
    return { svg, hands, feet: { l: g(fig.feet.l), r: g(fig.feet.r) } };
  };
  // separa braços para desenhar por cima de outra figura (abraços)
  P.putSplit = (o, x, y, s, flip) => {
    let fig;
    o = Object.assign({}, o, { armsOver: true });
    const svg = A.G(x, y, s, () => { fig = P.figure(o); return fig.svg; }, { flip });
    const arms = A.G(x, y, s, () => { const fg = P.figure(o); return fg.arms; }, { flip });
    const g = (p) => [x + p[0] * s * (flip ? -1 : 1), y + p[1] * s];
    return { svg, arms, hands: { l: g(fig.hands.l), r: g(fig.hands.r) } };
  };
  P.putBust = (o, x, y, s) => A.G(x, y, s, () => P.bust(o));
  P.putHead = (o, x, y, s) => A.G(x, y, s, () => P.head(o));

  AA.P = P;
})(window.AA);
