/* MOSAICO SECRETO — Motor: transforma um desenho em grade de letras e cores. */
(function () {
  'use strict';
  const { COLORS, WORLDS, MISSIONS } = window.MOSAICO_DATA;

  /* ---------- geometria ---------- */
  function rot(x, y, cx, cy, deg) {
    if (!deg) return [x, y];
    const a = -deg * Math.PI / 180, dx = x - cx, dy = y - cy;
    return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
  }
  function inPoly(pts, x, y) {
    let inside = false;
    for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
      const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function starPts(cx, cy, ro, ri, n, deg) {
    const pts = [];
    for (let k = 0; k < n * 2; k++) {
      const r = k % 2 ? ri : ro, a = (deg + k * 180 / n) * Math.PI / 180;
      pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    return pts;
  }
  function segDist(x, y, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy;
    let t = L ? ((x - x1) * dx + (y - y1) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t * dx - x, py = y1 + t * dy - y;
    return Math.sqrt(px * px + py * py);
  }

  // Prepara a forma uma vez: devolve { color, w, test(x,y) }
  function compile(layer) {
    const t = layer[0], col = layer[1];
    let opts = layer[layer.length - 1];
    if (!opts || typeof opts !== 'object' || Array.isArray(opts)) opts = {};
    const a = layer;
    let test;
    switch (t) {
      case 'c': test = (x, y) => (x - a[2]) ** 2 + (y - a[3]) ** 2 <= a[4] * a[4]; break;
      case 'e': test = (x, y) => {
        const p = rot(x, y, a[2], a[3], typeof a[6] === 'number' ? a[6] : 0);
        return ((p[0] - a[2]) / a[4]) ** 2 + ((p[1] - a[3]) / a[5]) ** 2 <= 1;
      }; break;
      case 'r': test = (x, y) => x >= a[2] && x < a[2] + a[4] && y >= a[3] && y < a[3] + a[5]; break;
      case 'rr': test = (x, y) => {
        const r = a[6], x0 = a[2], y0 = a[3], x1 = x0 + a[4], y1 = y0 + a[5];
        if (x < x0 || x >= x1 || y < y0 || y >= y1) return false;
        const cx = Math.max(x0 + r, Math.min(x1 - r, x)), cy = Math.max(y0 + r, Math.min(y1 - r, y));
        return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
      }; break;
      case 'p': { const pts = a[2]; test = (x, y) => inPoly(pts, x, y); break; }
      case 'star': { const pts = starPts(a[2], a[3], a[4], a[5], a[6], a[7] || 0); test = (x, y) => inPoly(pts, x, y); break; }
      case 'l': test = (x, y) => segDist(x, y, a[2], a[3], a[4], a[5]) <= a[6] / 2; break;
      case 'ring': test = (x, y) => { const d2 = (x - a[2]) ** 2 + (y - a[3]) ** 2; return d2 <= a[4] * a[4] && d2 >= a[5] * a[5]; }; break;
      default: test = () => false;
    }
    return { type: t, color: col, w: opts.w || 1, test: test, x: a[2], y: a[3] };
  }

  /* ---------- rasterização ---------- */
  const SUB = 5; // amostras por lado em cada quadradinho
  function rasterize(mission, N) {
    N = N || mission.size;
    const layers = mission.layers.map(compile);
    const shapes = layers.filter((l) => l.type !== 'px');
    const grid = new Array(N * N);
    const cell = 100 / N;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const votes = {};
        for (let sy = 0; sy < SUB; sy++) {
          for (let sx = 0; sx < SUB; sx++) {
            const x = (c + (sx + 0.5) / SUB) * cell, y = (r + (sy + 0.5) / SUB) * cell;
            let color = mission.bg, w = 1;
            for (let k = shapes.length - 1; k >= 0; k--) {
              if (shapes[k].test(x, y)) { color = shapes[k].color; w = shapes[k].w; break; }
            }
            votes[color] = (votes[color] || 0) + w;
          }
        }
        let best = mission.bg, bv = -1;
        for (const k in votes) if (votes[k] > bv) { bv = votes[k]; best = k; }
        grid[r * N + c] = best;
      }
    }
    layers.filter((l) => l.type === 'px').forEach((p) => {
      const c = Math.min(N - 1, Math.max(0, Math.floor(p.x / cell)));
      const r = Math.min(N - 1, Math.max(0, Math.floor(p.y / cell)));
      grid[r * N + c] = p.color;
    });
    return grid;
  }

  /* ---------- letras ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pickLetters(mission, count) {
    if (mission.id === 1) return 'ABCDEFGH'.slice(0, count).split('');
    const world = WORLDS[mission.world - 1];
    const pool = world.pool.split('');
    const rand = rng(mission.id * 7919 + 13);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return pool.slice(0, count).sort();
  }

  const cache = {};
  // Monta a missão pronta: grade de cores, letras e legenda.
  function build(id) {
    if (cache[id]) return cache[id];
    const m = MISSIONS[id - 1];
    const N = m.size;
    const colors = rasterize(m, N);
    const counts = {};
    colors.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
    const used = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const letters = pickLetters(m, used.length);
    // embaralha a ligação cor↔letra de forma fixa (a mesma sempre)
    const rand = rng(m.id * 31 + 7);
    const order = used.slice();
    if (m.id !== 1) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const t = order[i]; order[i] = order[j]; order[j] = t;
      }
    }
    const colorToLetter = {};
    order.forEach((c, i) => { colorToLetter[c] = letters[i]; });
    const legend = order.map((c) => ({
      letter: colorToLetter[c], key: c, name: COLORS[c].name, hex: COLORS[c].hex, total: counts[c]
    })).sort((a, b) => a.letter < b.letter ? -1 : 1);
    const cells = colors.map((c) => ({ color: c, letter: colorToLetter[c], hex: COLORS[c].hex }));
    const out = {
      id: m.id, name: m.name, art: m.art, world: m.world, index: m.index, size: N,
      total: N * N, cells: cells, legend: legend,
      stars: WORLDS[m.world - 1].stars, level: WORLDS[m.world - 1].level
    };
    cache[id] = out;
    return out;
  }

  // Desenha a imagem pronta num <canvas> (miniaturas da galeria e do professor)
  function drawThumb(canvas, id, opts) {
    opts = opts || {};
    const mm = build(id), N = mm.size;
    const px = opts.px || Math.max(2, Math.floor((opts.width || 120) / N));
    canvas.width = N * px; canvas.height = N * px;
    const g = canvas.getContext('2d');
    const painted = opts.painted; // Set de índices (miniatura parcial)
    mm.cells.forEach((cell, i) => {
      const x = (i % N) * px, y = Math.floor(i / N) * px;
      if (!painted || painted.has(i)) {
        g.fillStyle = cell.hex; g.fillRect(x, y, px, px);
      } else {
        g.fillStyle = (Math.floor(i / N) + i) % 2 ? '#EEF0F8' : '#E3E7F3'; g.fillRect(x, y, px, px);
      }
      if (opts.gridLines && px >= 6) {
        g.strokeStyle = 'rgba(0,0,0,.08)'; g.strokeRect(x + .5, y + .5, px - 1, px - 1);
      }
    });
    return canvas;
  }

  window.MOSAICO = { build: build, drawThumb: drawThumb, rasterize: rasterize };
})();
