/* COLEÇÃO 8 — MANDALAS E ESTAMPAS (padrões variados, sem sugerir uma única arte africana) */
(function (AA) {
  'use strict';
  const A = AA.A, O = AA.O, f = A.f, R = A.R, L = A.L;
  const D2R = Math.PI / 180;
  const pol = (r, a) => [300 + Math.cos(a * D2R) * r, 300 + Math.sin(a * D2R) * r];
  const petals = (n, r0, len, w, off, cx, cy) => { let s = ''; for (let i = 0; i < n; i++) s += R(A.petalD(cx || 300, cy || 300, r0 + len, w, (i * 360) / n + (off || 0), r0)); return s; };
  const teeth = (n, r1, r2, off) => { let s = ''; for (let i = 0; i < n; i++) { const a = (i * 360) / n + (off || 0), b = ((i + 1) * 360) / n + (off || 0); s += A.poly([pol(r1, a), pol(r1, b), pol(r2, (a + b) / 2)]); } return s; };
  const seg = (n, r1, r2, off) => { let s = ''; for (let i = 0; i < n; i++) { const a = (i * 360) / n + (off || 0), b = ((i + 1) * 360) / n + (off || 0); const p1 = pol(r1, a), p2 = pol(r2, a), p3 = pol(r2, b), p4 = pol(r1, b); s += R(`M${f(p1[0])},${f(p1[1])}L${f(p2[0])},${f(p2[1])}A${r2},${r2} 0 0,1 ${f(p3[0])},${f(p3[1])}L${f(p4[0])},${f(p4[1])}A${r1},${r1} 0 0,0 ${f(p1[0])},${f(p1[1])}Z`); } return s; };
  const dots = (n, r, rr, off) => { let s = ''; for (let i = 0; i < n; i++) { const p = pol(r, (i * 360) / n + (off || 0)); s += A.circ(p[0], p[1], rr); } return s; };
  const diamonds = (n, r, rr, off) => { let s = ''; for (let i = 0; i < n; i++) { const a = (i * 360) / n + (off || 0), p = pol(r, a); s += A.poly(A.ngonPts(p[0], p[1], rr, 4, a)); } return s; };
  const scallop = (n, r, bump) => R(A.cloudD(300, 300, r, r, n, bump || 0.35, 0));
  const corners = () => [[0, 0], [600, 0], [0, 600], [600, 600]].map(([x, y]) => O.clipCanvas(A.circ(x, y, 120) + A.circ(x, y, 90) + A.circ(x, y, 56) + A.circ(x, y, 26))).join('');

  // 1. Mandala de flores
  AA.add(8, 1, 'Mandala de flores', () => {
    let s = corners();
    s += scallop(32, 288, 0.3) + A.circ(300, 300, 270) + petals(24, 210, 60, 14, 0) + A.circ(300, 300, 212);
    s += seg(32, 186, 212, 0) + A.circ(300, 300, 186);
    s += petals(12, 90, 96, 40, 15) + petals(12, 90, 64, 22, 15) + petals(12, 90, 34, 10, 15) + dots(12, 170, 10, 0);
    s += A.circ(300, 300, 92) + petals(16, 40, 50, 12, 0) + A.circ(300, 300, 42) + petals(8, 8, 32, 10, 22.5) + A.circ(300, 300, 10);
    return s;
  });

  // 2. Mandala estrela
  AA.add(8, 2, 'Mandala estrela', () => {
    let s = O.clipCanvas(A.poly(A.starPts(300, 300, 420, 300, 12, 0)));
    s += A.circ(300, 300, 284) + teeth(48, 262, 284) + A.circ(300, 300, 262);
    s += A.poly(A.starPts(300, 300, 258, 150, 12, 0)) + A.poly(A.starPts(300, 300, 220, 150, 12, 15));
    s += diamonds(12, 236, 14, -90 + 15) + A.circ(300, 300, 150) + seg(24, 124, 150, 0) + A.circ(300, 300, 124);
    s += A.poly(A.starPts(300, 300, 122, 60, 8, 0)) + A.poly(A.starPts(300, 300, 96, 50, 8, 22.5)) + A.circ(300, 300, 48) + A.poly(A.starPts(300, 300, 44, 18, 6, 0)) + A.circ(300, 300, 12);
    return s;
  });

  // 3. Mandala do sol
  AA.add(8, 3, 'Mandala do sol', () => {
    let s = O.rays(300, 300, 48, 600, 0);
    s += petals(24, 200, 92, 18, 0) + petals(24, 200, 70, 12, 7.5);
    s += A.circ(300, 300, 200) + A.circ(300, 300, 180) + dots(30, 190, 5, 0);
    s += seg(12, 140, 180, 0) + A.circ(300, 300, 140);
    s += petals(18, 80, 58, 14, 0) + A.circ(300, 300, 82);
    s += A.circ(300, 300, 66) + L('M262,290q12,-12 24,0M314,290q12,-12 24,0M268,322q32,26 64,0', 3.4) + A.circ(270, 312, 7) + A.circ(330, 312, 7);
    return s;
  });

  // 4. Mandala de corações
  AA.add(8, 4, 'Mandala de corações', () => {
    let s = '';
    for (let i = 0; i < 16; i++) { const p = pol(262, i * 22.5); s += A.R(A.heartD(0, 0, 22), '', ` transform="translate(${f(p[0])},${f(p[1])}) rotate(${i * 22.5 + 90})"`); }
    s += A.circ(300, 300, 236) + seg(36, 210, 236, 0) + A.circ(300, 300, 210);
    for (let i = 0; i < 8; i++) { const p = pol(150, i * 45); s += A.R(A.heartD(0, 0, 46), '', ` transform="translate(${f(p[0])},${f(p[1])}) rotate(${i * 45 + 90})"`) + A.R(A.heartD(0, 0, 22), '', ` transform="translate(${f(p[0])},${f(p[1])}) rotate(${i * 45 + 90})"`); }
    s += diamonds(8, 160, 14, 22.5);
    s += A.circ(300, 300, 86) + petals(10, 30, 52, 14, 0) + A.circ(300, 300, 32) + A.heart(300, 302, 18);
    [[60, 60], [540, 60], [60, 540], [540, 540]].forEach(([x, y]) => { s += A.heart(x, y, 30) + A.heart(x, y, 14); });
    return s;
  });

  // 5. Borboleta simétrica
  AA.add(8, 5, 'Borboleta estampada', () => {
    let s = O.cornerFlowers() + O.borderDots(20, 14);
    const wing = (k) => {
      const up = A.smoothD([[300, 280], [300 + k * 60, 120], [300 + k * 200, 70], [300 + k * 260, 150], [300 + k * 230, 270], [300 + k * 80, 300]], true, 0.18);
      const lo = A.smoothD([[300, 310], [300 + k * 90, 320], [300 + k * 220, 380], [300 + k * 200, 500], [300 + k * 100, 520], [300 + k * 30, 420]], true, 0.18);
      let t = R(up) + R(lo);
      t += O.clip(up, A.R(A.smoothD([[300, 285], [300 + k * 80, 150], [300 + k * 190, 110], [300 + k * 220, 170], [300 + k * 190, 250], [300 + k * 80, 285]], true, 0.18)) + A.circ(300 + k * 180, 160, 30) + A.circ(300 + k * 180, 160, 14) + A.circ(300 + k * 110, 230, 18) + A.circ(300 + k * 240, 230, 12) + A.circ(300 + k * 130, 130, 10));
      t += O.clip(lo, A.R(A.smoothD([[300, 318], [300 + k * 90, 340], [300 + k * 180, 400], [300 + k * 160, 470], [300 + k * 90, 480], [300 + k * 45, 410]], true, 0.18)) + A.circ(300 + k * 130, 420, 24) + A.circ(300 + k * 130, 420, 10) + A.poly(A.ngonPts(300 + k * 180, 470, 14, 4, 0)) + A.circ(300 + k * 70, 370, 9));
      return t;
    };
    s += wing(-1) + wing(1);
    s += A.ell(300, 330, 18, 150) + A.circ(300, 170, 26);
    for (let i = 0; i < 7; i++) s += A.L(`M284,${220 + i * 30}q16,8 32,0`, 2.2);
    s += A.L('M290,148Q270,90 240,70M310,148Q330,90 360,70') + A.circ(240, 70, 10) + A.circ(360, 70, 10) + A.dot(290, 168, 4) + A.dot(310, 168, 4);
    return s;
  });

  // 6. Azulejos geométricos
  AA.add(8, 6, 'Azulejos', () => {
    let s = '';
    const W = 148;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const x = 4 + c * W, y = 4 + r * W, cx = x + W / 2, cy = y + W / 2;
      let t = A.rect(x, y, W, W, 0);
      t += A.poly([[x, y], [x + 40, y], [x, y + 40]]) + A.poly([[x + W, y], [x + W - 40, y], [x + W, y + 40]]) + A.poly([[x, y + W], [x + 40, y + W], [x, y + W - 40]]) + A.poly([[x + W, y + W], [x + W - 40, y + W], [x + W, y + W - 40]]);
      t += A.poly(A.ngonPts(cx, cy, 56, 4, 0)) + A.circ(cx, cy, 30);
      for (let i = 0; i < 8; i++) t += A.R(A.petalD(cx, cy, 28, 7, i * 45, 6));
      t += A.circ(cx, cy, 7);
      s += O.clip(A.dRect(x, y, W, W, 0), t);
    }
    return O.clipCanvas(s);
  });

  // 7. Tecido de faixas e blocos
  AA.add(8, 7, 'Tecido de faixas', () => {
    let s = '';
    for (let c = 0; c < 6; c++) {
      const x = 4 + c * 98.7;
      let t = A.rect(x, 4, 98.7, 592, 0);
      for (let r = 0; r < 8; r++) {
        const y = 4 + r * 74;
        const k = (r + c) % 4;
        if (k === 0) { t += A.rect(x + 8, y + 8, 82, 58, 0) + A.rect(x + 28, y + 22, 42, 30, 0); }
        else if (k === 1) { for (let i = 0; i < 4; i++) t += A.rect(x, y + 6 + i * 17, 98.7, 9, 0); }
        else if (k === 2) { t += A.poly([[x, y], [x + 49, y + 37], [x, y + 74]]) + A.poly([[x + 98.7, y], [x + 49, y + 37], [x + 98.7, y + 74]]) + A.poly(A.ngonPts(x + 49, y + 37, 14, 4, 0)); }
        else { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) t += A.rect(x + 8 + i * 30, y + 8 + j * 32, 22, 24, 0); }
      }
      s += O.clip(A.dRect(x, 4, 98.7, 592, 0), t);
    }
    return O.clipCanvas(s);
  });

  // 8. Peixes estampados
  AA.add(8, 8, 'Cardume estampado', () => {
    let s = '';
    for (let i = 0; i < 6; i++) { let d = `M4,${80 + i * 95}`; for (let x = 4; x < 600; x += 50) d += `q12.5,-14 25,0t25,0`; s += L(d, 2.2); }
    const fish = (x, y, sc, flip) => A.G(x, y, sc, () => {
      const body = 'M-80,0Q-30,-60 50,-30Q80,-16 90,0Q80,16 50,30Q-30,60 -80,0Z';
      let t = R('M-78,0L-130,-44L-118,0L-130,44Z') + R(body);
      t += O.clip(body, A.R('M20,-60Q0,0 20,60L200,60L200,-60Z') + A.rect(-40, -60, 14, 120, 0) + A.rect(-14, -60, 14, 120, 0) + A.circ(-50, -12, 8) + A.circ(-56, 14, 7));
      t += R('M-20,-40Q0,-80 30,-34Z') + R('M-10,40Q10,70 26,32Z') + A.circ(58, -6, 10) + A.dot(60, -6, 5) + L('M80,10q-6,6 -12,4', 2.6);
      return t;
    }, { flip });
    s += fish(170, 140, 1.0) + fish(430, 230, 0.85, true) + fish(200, 360, 0.9, true) + fish(440, 470, 1.0) + fish(130, 520, 0.6);
    [[330, 90], [70, 260], [540, 360], [320, 560], [560, 120]].forEach(([x, y]) => { s += A.circ(x, y, 12) + A.circ(x + 14, y - 22, 8) + A.circ(x + 4, y - 40, 5); });
    s += R('M260,600Q240,520 270,460Q290,520 280,600Z') + R('M290,600Q300,500 330,470Q320,540 310,600Z');
    return s;
  });

  // 9. Mandala de folhas
  AA.add(8, 9, 'Mandala de folhas', () => {
    let s = corners();
    for (let i = 0; i < 16; i++) { const a = i * 22.5, p1 = pol(170, a), p2 = pol(285, a); s += A.leaf(p1[0], p1[1], p2[0], p2[1], 26); }
    for (let i = 0; i < 16; i++) { const a = i * 22.5 + 11.25, p1 = pol(180, a), p2 = pol(240, a); s += A.leaf(p1[0], p1[1], p2[0], p2[1], 12, undefined, false); }
    s += A.circ(300, 300, 172) + seg(16, 148, 172, 0) + A.circ(300, 300, 148);
    for (let i = 0; i < 8; i++) { const a = i * 45, p1 = pol(50, a), p2 = pol(140, a); s += A.leaf(p1[0], p1[1], p2[0], p2[1], 30); }
    s += dots(8, 115, 10, 22.5) + A.circ(300, 300, 52) + petals(8, 12, 38, 12, 0) + A.circ(300, 300, 14);
    return s;
  });

  // 10. Triângulos e losangos
  AA.add(8, 10, 'Caleidoscópio', () => {
    let s = '';
    const h = 60, w = 69.3;
    for (let r = -1; r < 11; r++) for (let c = -1; c < 10; c++) {
      const x = c * w + (r % 2 ? w / 2 : 0), y = r * h;
      s += A.poly([[x, y], [x + w, y], [x + w / 2, y + h]]) + A.poly([[x + w / 2, y + h], [x + w, y], [x + w * 1.5, y + h]]);
    }
    s = O.clipCanvas(s);
    s += A.circ(300, 300, 190) + A.circ(300, 300, 170) + teeth(24, 120, 170, 0) + A.circ(300, 300, 120) + diamonds(12, 95, 16, 0) + A.circ(300, 300, 70) + A.poly(A.starPts(300, 300, 66, 30, 6, 0)) + A.circ(300, 300, 22);
    return s;
  });
})(window.AA);
