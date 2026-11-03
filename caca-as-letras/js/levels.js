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

  // Segundo número = quantidade de letras "distratoras" (que não fazem parte da palavra).
  // Quanto mais distratoras, mais difícil a busca.
  const RAW = [
    // MUNDO 1 — FLORESTA DAS LETRAS (fácil)
    ['SOL', 7], ['LUA', 7], ['GATO', 8], ['BOLA', 8], ['CASA', 9],
    ['PATO', 9], ['BOLO', 10], ['SAPO', 10], ['MALA', 11], ['VELA', 11],
    // MUNDO 2 — OCEANO MISTERIOSO (intermediário)
    ['ESCOLA', 11], ['JANELA', 11], ['MACACO', 12], ['SAPATO', 12], ['BANANA', 13],
    ['CAMISA', 13], ['BONECA', 14], ['PIPOCA', 14], ['GIRASSOL', 15], ['FLORESTA', 15],
    // MUNDO 3 — CASTELO DOS DESAFIOS (difícil)
    ['ELEFANTE', 15], ['BORBOLETA', 16], ['DINOSSAURO', 16], ['CHOCOLATE', 17], ['BICICLETA', 17],
    ['ABACAXI', 18], ['TELEFONE', 18], ['GELADEIRA', 18], ['PASSARINHO', 19], ['BIBLIOTECA', 19]
  ];

  CDL.LEVELS = RAW.map(([word, distractors], i) => {
    const n = i + 1;
    const world = n <= 10 ? 1 : n <= 20 ? 2 : 3;
    return { n, word, distractors, world };
  });

  // Aparência das letras por mundo (tamanho em unidades do cenário 1600x900).
  // rot = inclinação máxima; cover = chance de a letra ficar parcialmente coberta
  // (folhas, bolhas, teias); outline = espessura do contorno claro.
  CDL.LETTER_STYLE = {
    1: { size: 74, rot: 22, minDist: 125, cover: 0.35, outline: 5, deco: 0 },
    2: { size: 66, rot: 32, minDist: 112, cover: 0.5, outline: 4, deco: 0 },
    3: { size: 60, rot: 40, minDist: 100, cover: 0.6, outline: 3, deco: 0.3 }
  };

  // Cores usadas nas telas de missão (peças da palavra)
  CDL.LETTER_COLORS = ['#FF4D6D', '#FF9F1C', '#2EC4B6', '#7B61FF', '#FF5DA2', '#21B35B', '#1E88E5', '#F15BB5', '#E36414', '#0FA3B1'];
  // Cores de camuflagem das letras em cada mundo (parecidas com os objetos do cenário)
  CDL.CAMO_COLORS = {
    1: ['#4CAF50', '#66BB6A', '#8BC34A', '#FF6FA5', '#FFD23F', '#E84A5F', '#8D5524', '#7B61FF', '#FF8C42', '#4FC3F7'],
    2: ['#FF6F91', '#B388FF', '#FFB74D', '#4DD0E1', '#FFD23F', '#FF8A65', '#3FBF7F', '#2E9E6A', '#7B61FF', '#FF5A5F'],
    3: ['#E84A5F', '#FFD23F', '#FFB400', '#7B61FF', '#3B82F6', '#A1683A', '#C98B4F', '#B388FF', '#3DDC84', '#FF6FA5']
  };
  CDL.COVERS = { 1: ['leafCluster', 'leafCluster', 'grass'], 2: ['bubbleCluster', 'weed', 'bubbleCluster'], 3: ['web', 'leafCluster', 'bubbleCluster'] };

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
    const scene = CDL.buildScene(n, 's', { clutter: true, seed });

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
    const floorD = Math.round(style.size * 1.75); // distância mínima para nunca sobrepor letras
    let minD = Math.max(style.minDist, floorD + 20);
    while (minD >= floorD) {
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
        if (chosen.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= floorD)) chosen.push(p);
      }
    }
    shuffle(chosen, r);

    const all = wordLetters.map((ch, i) => ({ ch, target: true, slot: i })).concat(distract.map((ch) => ({ ch, target: false, slot: -1 })));
    shuffle(all, r);
    const colors = shuffle(CDL.CAMO_COLORS[lvl.world].slice(), r);
    const covers = CDL.COVERS[lvl.world];
    const letters = all.map((l, i) => ({
      id: 'L' + i,
      ch: l.ch,
      target: l.target,
      x: chosen[i].x,
      y: chosen[i].y,
      rot: Math.round((r() * 2 - 1) * style.rot),
      color: colors[i % colors.length],
      deco: r() < style.deco ? 1 + Math.floor(r() * 3) : 0,
      // cobertura parcial: um objeto sobre um dos cantos da letra (nunca a esconde inteira)
      cover: r() < style.cover ? (() => {
        const a = r() * Math.PI * 2;
        const d = style.size * (0.38 + r() * 0.12);
        return { name: covers[Math.floor(r() * covers.length)], dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d + style.size * 0.25), s: +(style.size / 95 + r() * 0.15).toFixed(2), rot: Math.round(r() * 360), color: CDL.CAMO_COLORS[lvl.world][Math.floor(r() * 4)] };
      })() : null
    }));
    return { level: lvl, scene, letters, style };
  };
})();
