/* =========================================================
   CAÇADORES DE LETRAS — Mundos, fases e distribuição das letras
   Para trocar uma palavra, altere o campo "word" abaixo.
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});

  CDL.WORLDS = [
    {
      id: 1, name: 'FLORESTA DAS LETRAS', short: 'Floresta', level: 'Fácil',
      first: 1, last: 10, color: '#3DBE5A', dark: '#1F7A3A', bg: 'linear-gradient(160deg,#9BE38B,#3DBE5A)',
      medal: 'MEDALHA DA FLORESTA', reward: 'Você explorou toda a Floresta das Letras!'
    },
    {
      id: 2, name: 'OCEANO MISTERIOSO', short: 'Oceano', level: 'Médio',
      first: 11, last: 20, color: '#1E9BE0', dark: '#0B4F86', bg: 'linear-gradient(160deg,#7FDBFF,#1E7FD0)',
      medal: 'MEDALHA DO OCEANO', reward: 'Você desvendou os segredos do Oceano Misterioso!'
    },
    {
      id: 3, name: 'CASTELO DOS DESAFIOS', short: 'Castelo', level: 'Difícil',
      first: 21, last: 30, color: '#8A5CF6', dark: '#4B2A99', bg: 'linear-gradient(160deg,#C9B3FF,#7B4FE0)',
      medal: 'COROA DO CASTELO', reward: 'Você venceu todos os desafios do Castelo!'
    }
  ];

  // distractors = quantidade de letras "distratoras" (que não fazem parte da palavra)
  const RAW = [
    // MUNDO 1 — FLORESTA DAS LETRAS (fácil)
    ['SOL', 3], ['LUA', 3], ['GATO', 3], ['BOLA', 4], ['CASA', 4],
    ['PATO', 4], ['BOLO', 5], ['SAPO', 5], ['MALA', 5], ['VELA', 6],
    // MUNDO 2 — OCEANO MISTERIOSO (intermediário)
    ['ESCOLA', 5], ['JANELA', 5], ['MACACO', 6], ['SAPATO', 6], ['BANANA', 6],
    ['CAMISA', 7], ['BONECA', 7], ['PIPOCA', 7], ['GIRASSOL', 7], ['FLORESTA', 8],
    // MUNDO 3 — CASTELO DOS DESAFIOS (difícil)
    ['ELEFANTE', 8], ['BORBOLETA', 8], ['DINOSSAURO', 9], ['CHOCOLATE', 9], ['BICICLETA', 9],
    ['ABACAXI', 10], ['TELEFONE', 10], ['GELADEIRA', 10], ['PASSARINHO', 11], ['BIBLIOTECA', 12]
  ];

  CDL.LEVELS = RAW.map(([word, distractors], i) => {
    const n = i + 1;
    const world = n <= 10 ? 1 : n <= 20 ? 2 : 3;
    return { n, word, distractors, world };
  });

  // Aparência das letras por mundo (tamanho em unidades do cenário 1600x900)
  CDL.LETTER_STYLE = {
    1: { size: 96, rot: 6, minDist: 175, halo: true, deco: 0 },
    2: { size: 86, rot: 12, minDist: 150, halo: false, deco: 0 },
    3: { size: 80, rot: 16, minDist: 135, halo: false, deco: 0.45 }
  };

  CDL.LETTER_COLORS = ['#FF4D6D', '#FF9F1C', '#2EC4B6', '#7B61FF', '#FF5DA2', '#21B35B', '#1E88E5', '#F15BB5', '#E36414', '#0FA3B1'];

  // Gerador pseudoaleatório com semente (resultado reproduzível)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  CDL.rng = rng;
  function shuffle(arr, r) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const ALPHA = 'ABCDEFGHIJLMNOPQRSTUVXZ'.split(''); // alfabeto usado nos distratores (sem K, W, Y)

  /**
   * Gera a disposição das letras de uma fase.
   * Retorna as letras com posição, cor, rotação e se fazem parte da palavra.
   */
  CDL.layoutLevel = function (n, seed) {
    const lvl = CDL.LEVELS[n - 1];
    const style = CDL.LETTER_STYLE[lvl.world];
    const r = rng(n * 7919 + (seed || 0) * 104729 + 17);
    const scene = CDL.buildScene(n);

    // letras necessárias: cada ocorrência da palavra + distratoras
    const wordLetters = lvl.word.split('');
    const pool = ALPHA.filter((c) => !wordLetters.includes(c));
    shuffle(pool, r);
    const distract = [];
    for (let i = 0; i < lvl.distractors; i++) distract.push(pool[i % pool.length]);
    const total = wordLetters.length + distract.length;

    // escolhe esconderijos bem distribuídos
    // margem para que a letra (e sua área de toque) fique inteira dentro do cenário
    const m = Math.ceil(style.size * 0.8) + 6;
    const BOUNDS = { x0: m, x1: 1600 - m, y0: m, y1: 900 - m };
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const seen = new Set();
    const cand = scene.spots
      .map((p) => ({ x: Math.round(clamp(p.x, BOUNDS.x0, BOUNDS.x1)), y: Math.round(clamp(p.y, BOUNDS.y0, BOUNDS.y1)) }))
      .filter((p) => { const k = p.x + ',' + p.y; if (seen.has(k)) return false; seen.add(k); return true; });
    let chosen = [];
    let minD = style.minDist;
    while (minD >= 100) {
      chosen = [];
      for (const p of shuffle(cand.slice(), r)) {
        if (chosen.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= minD)) chosen.push(p);
        if (chosen.length === total) break;
      }
      if (chosen.length === total) break;
      minD -= 10;
    }
    // segurança: completa com pontos livres caso o cenário tenha poucos esconderijos
    if (chosen.length < total) {
      const grid = [];
      for (let gx = BOUNDS.x0 + 40; gx <= BOUNDS.x1 - 40; gx += 120) for (let gy = BOUNDS.y0 + 40; gy <= BOUNDS.y1 - 20; gy += 110) grid.push({ x: gx, y: gy });
      for (const p of shuffle(grid, r)) {
        if (chosen.length >= total) break;
        if (chosen.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= 110)) chosen.push(p);
      }
    }
    shuffle(chosen, r);

    const all = wordLetters.map((ch, i) => ({ ch, target: true, slot: i })).concat(distract.map((ch) => ({ ch, target: false, slot: -1 })));
    shuffle(all, r);
    const colors = shuffle(CDL.LETTER_COLORS.slice(), r);
    const letters = all.map((l, i) => ({
      id: 'L' + i,
      ch: l.ch,
      target: l.target,
      x: chosen[i].x,
      y: chosen[i].y,
      rot: Math.round((r() * 2 - 1) * style.rot),
      color: colors[i % colors.length],
      deco: r() < style.deco ? 1 + Math.floor(r() * 3) : 0
    }));
    return { level: lvl, scene, letters, style };
  };
})();
