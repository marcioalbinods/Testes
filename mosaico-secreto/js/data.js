/* MOSAICO SECRETO — Cores, mundos e os 50 desenhos.
 *
 * Cada desenho é feito de formas simples (círculos, retângulos, polígonos...)
 * num espaço de 0 a 100. O motor (engine.js) transforma as formas numa grade
 * de quadradinhos do tamanho da missão e dá uma letra para cada cor.
 *
 * Formas: ['c', cor, cx, cy, r]            círculo
 *         ['e', cor, cx, cy, rx, ry, giro]  elipse (giro em graus)
 *         ['r', cor, x, y, largura, altura] retângulo
 *         ['rr', cor, x, y, l, a, raio]     retângulo arredondado
 *         ['p', cor, [x,y, x,y, ...]]       polígono
 *         ['l', cor, x1, y1, x2, y2, esp]   linha grossa
 *         ['ring', cor, cx, cy, rFora, rDentro]
 *         ['star', cor, cx, cy, rFora, rDentro, pontas, giro]
 *         ['px', cor, x, y]                 um quadradinho exato (olhos, sementes)
 * Um objeto no final ({ w: 3 }) dá mais peso à forma na hora de escolher a cor.
 */
(function () {
  'use strict';

  const COLORS = {
    vermelho:    { name: 'VERMELHO',     hex: '#E8392F' },
    azul:        { name: 'AZUL',         hex: '#2F6FE0' },
    amarelo:     { name: 'AMARELO',      hex: '#FFD43B' },
    verde:       { name: 'VERDE',        hex: '#2FB24A' },
    laranja:     { name: 'LARANJA',      hex: '#FF8A1A' },
    roxo:        { name: 'ROXO',         hex: '#8A4FD8' },
    rosa:        { name: 'ROSA',         hex: '#FF9EC9' },
    rosaEscuro:  { name: 'ROSA-ESCURO',  hex: '#E5468C' },
    marrom:      { name: 'MARROM',       hex: '#8B5A2B' },
    preto:       { name: 'PRETO',        hex: '#2D2B38' },
    branco:      { name: 'BRANCO',       hex: '#FFFFFF' },
    cinza:       { name: 'CINZA',        hex: '#9BA5B3' },
    celeste:     { name: 'AZUL-CLARO',   hex: '#9EDCFF' },
    azulEscuro:  { name: 'AZUL-ESCURO',  hex: '#1F2F7A' },
    lima:        { name: 'VERDE-CLARO',  hex: '#A9E15F' },
    verdeEscuro: { name: 'VERDE-ESCURO', hex: '#1C7A3A' },
    bege:        { name: 'BEGE',         hex: '#F4D3A3' },
    lilas:       { name: 'LILÁS',        hex: '#CDA8F7' }
  };

  const WORLDS = [
    { id: 1, name: 'FAZENDA ENCANTADA', icon: '🐔', size: 10, stars: 1, level: 'MUITO FÁCIL',
      colors: ['#FFE08A', '#FFB84D'], deep: '#C86B00', deco: ['🌻', '🐄', '🌾', '🐷'],
      pool: 'AEIOUBCDLMP', text: 'Animais e coisas da fazenda.' },
    { id: 2, name: 'FUNDO DO MAR', icon: '🐠', size: 12, stars: 2, level: 'FÁCIL',
      colors: ['#8FE3FF', '#3D9BFF'], deep: '#1557B0', deco: ['🫧', '🐚', '🐟', '🌊'],
      pool: 'AEIOUBCDFGLMNPRST', text: 'Bichos e tesouros do oceano.' },
    { id: 3, name: 'JARDIM DAS FRUTAS', icon: '🍓', size: 14, stars: 3, level: 'MÉDIO',
      colors: ['#C8F59A', '#5CCB5F'], deep: '#23803A', deco: ['🍎', '🍌', '🍇', '🌼'],
      pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', text: 'Frutas gostosas e coloridas.' },
    { id: 4, name: 'AVENTURA SOBRE RODAS', icon: '🚗', size: 16, stars: 4, level: 'DIFÍCIL',
      colors: ['#FFC2A8', '#FF6B6B'], deep: '#B8323A', deco: ['🚦', '✈️', '🚲', '⛵'],
      pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', text: 'Carros, aviões, barcos e muito mais.' },
    { id: 5, name: 'MUNDO DA IMAGINAÇÃO', icon: '🏰', size: 18, stars: 5, level: 'DESAFIO',
      colors: ['#E4C6FF', '#9B6BFF'], deep: '#5B2DB8', deco: ['⭐', '🌈', '🍄', '🦋'],
      pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', text: 'Castelos, estrelas e sonhos.' }
  ];

  /* ---------- pequenos ajudantes para montar formas ---------- */
  const rad = (d) => d * Math.PI / 180;
  // pontos de um arco (ângulo 0 = direita, 90 = para baixo)
  function arc(cx, cy, r, a0, a1, n) {
    const pts = []; n = n || 14;
    for (let i = 0; i <= n; i++) {
      const a = rad(a0 + (a1 - a0) * i / n);
      pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    return pts;
  }
  // nuvem branca (ou de outra cor)
  function cloud(color, x, y, s) {
    s = s || 1;
    return [
      ['c', color, x, y, 7 * s], ['c', color, x + 8 * s, y - 3 * s, 8 * s],
      ['c', color, x + 16 * s, y, 7 * s], ['r', color, x, y - 1 * s, 16 * s, 7 * s]
    ];
  }
  // sorriso: arco grosso
  function smile(color, cx, cy, r, t) {
    const out = arc(cx, cy, r + t / 2, 20, 160, 10);
    const inn = arc(cx, cy, r - t / 2, 160, 20, 10);
    return ['p', color, out.concat(inn)];
  }

  /* ---------- os 50 desenhos ---------- */
  // d(nome, artigo, fundo, formas)
  const D = [];
  function d(name, art, bg, layers) { D.push({ name: name, art: art, bg: bg, layers: layers }); }

  /* ===== MUNDO 1 — FAZENDA ENCANTADA (10 × 10) ===== */
  d('GALINHA', 'a', 'celeste', [
    ['r', 'lima', 0, 88, 100, 12],
    ['p', 'branco', [8, 30, 32, 46, 26, 66, 6, 56]],
    ['e', 'branco', 46, 60, 32, 24],
    ['c', 'branco', 68, 34, 15],
    ['c', 'vermelho', 62, 17, 6], ['c', 'vermelho', 72, 15, 6],
    ['p', 'amarelo', [80, 30, 97, 37, 80, 44]],
    ['c', 'vermelho', 80, 50, 5],
    ['r', 'amarelo', 36, 80, 7, 16], ['r', 'amarelo', 56, 80, 7, 16],
    ['px', 'preto', 71, 32]
  ]);
  d('VACA', 'a', 'lima', [
    ['e', 'branco', 14, 30, 13, 7, -15], ['e', 'branco', 86, 30, 13, 7, 15],
    ['p', 'bege', [24, 22, 18, 4, 32, 18]], ['p', 'bege', [76, 22, 82, 4, 68, 18]],
    ['rr', 'branco', 22, 16, 56, 70, 18],
    ['c', 'preto', 28, 26, 11], ['c', 'preto', 74, 34, 9],
    ['e', 'rosa', 50, 74, 26, 15],
    ['px', 'preto', 35, 45], ['px', 'preto', 65, 45],
    ['px', 'preto', 41, 75], ['px', 'preto', 59, 75]
  ]);
  d('PORQUINHO', 'o', 'celeste', [
    ['r', 'lima', 0, 90, 100, 10],
    ['p', 'rosaEscuro', [16, 36, 18, 6, 44, 24]], ['p', 'rosaEscuro', [84, 36, 82, 6, 56, 24]],
    ['c', 'rosa', 50, 56, 36],
    ['e', 'rosaEscuro', 50, 66, 18, 12],
    ['px', 'preto', 45, 65], ['px', 'preto', 55, 65],
    ['px', 'preto', 35, 45], ['px', 'preto', 65, 45]
  ]);
  d('CAVALO', 'o', 'celeste', [
    ['r', 'lima', 0, 90, 100, 10],
    ['p', 'marrom', [30, 100, 38, 44, 58, 20, 72, 28, 66, 60, 64, 100]],
    ['e', 'marrom', 72, 52, 16, 13, -20],
    ['p', 'marrom', [54, 24, 58, 2, 68, 22]],
    ['p', 'preto', [38, 44, 58, 20, 50, 12, 30, 30, 22, 100, 32, 100]],
    ['e', 'bege', 80, 60, 9, 7, -20],
    ['px', 'preto', 64, 34], ['px', 'preto', 84, 56]
  ]);
  d('OVELHA', 'a', 'celeste', [
    ['r', 'lima', 0, 84, 100, 16],
    ['r', 'preto', 32, 64, 8, 28], ['r', 'preto', 58, 64, 8, 28],
    ['c', 'branco', 30, 50, 15], ['c', 'branco', 50, 40, 17], ['c', 'branco', 68, 48, 15],
    ['c', 'branco', 40, 62, 16], ['c', 'branco', 60, 62, 15],
    ['e', 'preto', 82, 44, 11, 15],
    ['px', 'branco', 85, 41]
  ]);
  d('PATINHO', 'o', 'celeste', [
    ['r', 'azul', 0, 76, 100, 24],
    ['e', 'amarelo', 44, 66, 32, 17],
    ['p', 'amarelo', [12, 60, 4, 44, 24, 54]],
    ['c', 'amarelo', 66, 36, 16],
    ['e', 'laranja', 86, 42, 11, 5],
    ['e', 'laranja', 40, 64, 14, 7, -10],
    ['px', 'preto', 71, 32]
  ]);
  d('COELHINHO', 'o', 'lima', [
    ['e', 'branco', 36, 28, 9, 26], ['e', 'branco', 64, 28, 9, 26],
    ['e', 'rosa', 36, 30, 4, 17], ['e', 'rosa', 64, 30, 4, 17],
    ['c', 'branco', 50, 66, 27],
    ['px', 'preto', 40, 60], ['px', 'preto', 60, 60],
    ['px', 'rosa', 50, 72]
  ]);
  d('PINTINHO', 'o', 'celeste', [
    ['r', 'lima', 0, 86, 100, 14],
    ['c', 'amarelo', 50, 48, 30],
    ['p', 'amarelo', [42, 18, 46, 6, 52, 18]],
    ['p', 'laranja', [42, 50, 58, 50, 50, 62]],
    ['px', 'preto', 38, 40], ['px', 'preto', 62, 40],
    ['p', 'branco', [14, 62, 24, 72, 34, 62, 44, 72, 54, 62, 64, 72, 74, 62, 84, 72, 88, 62, 84, 90, 18, 90]]
  ]);
  d('CELEIRO', 'o', 'celeste', [
    ['r', 'verde', 0, 84, 100, 16],
    ['r', 'vermelho', 16, 42, 68, 46],
    ['p', 'marrom', [6, 46, 50, 8, 94, 46]],
    ['r', 'branco', 36, 58, 28, 30],
    ['r', 'vermelho', 44, 66, 12, 22],
    ['r', 'branco', 44, 24, 12, 12]
  ]);
  d('TRATOR', 'o', 'celeste', [
    ['r', 'lima', 0, 90, 100, 10],
    ['r', 'preto', 74, 20, 6, 24],
    ['r', 'verde', 18, 10, 40, 34], ['r', 'branco', 26, 18, 24, 18],
    ['r', 'verde', 18, 42, 76, 20],
    ['c', 'preto', 32, 72, 21], ['c', 'amarelo', 32, 72, 8],
    ['c', 'preto', 80, 78, 15], ['c', 'amarelo', 80, 78, 5]
  ]);

  /* ===== MUNDO 2 — FUNDO DO MAR (12 × 12) ===== */
  d('PEIXE', 'o', 'azul', [
    ['c', 'celeste', 82, 18, 5], ['c', 'celeste', 90, 8, 3.5], ['c', 'celeste', 14, 84, 4],
    ['p', 'laranja', [64, 50, 94, 24, 94, 76]],
    ['e', 'laranja', 44, 50, 32, 22],
    ['e', 'branco', 36, 50, 5, 21], ['e', 'branco', 58, 50, 5, 18],
    ['p', 'amarelo', [36, 30, 50, 18, 58, 32]],
    ['c', 'branco', 22, 44, 6], ['px', 'preto', 22, 44]
  ]);
  d('TUBARÃO', 'o', 'azul', [
    ['r', 'bege', 0, 88, 100, 12],
    ['p', 'cinza', [36, 42, 52, 12, 62, 42]],
    ['p', 'cinza', [76, 50, 98, 24, 92, 52, 98, 80]],
    ['e', 'cinza', 46, 52, 38, 17],
    ['e', 'branco', 40, 60, 28, 8],
    ['p', 'cinza', [44, 62, 58, 62, 50, 80]],
    ['px', 'preto', 22, 46],
    ['p', 'branco', [12, 58, 16, 54, 20, 58, 24, 54, 28, 58, 26, 62, 14, 62]]
  ]);
  d('BALEIA', 'a', 'celeste', [
    ['r', 'azulEscuro', 0, 80, 100, 20],
    ['l', 'branco', 40, 40, 40, 20, 6],
    ['c', 'branco', 30, 16, 7], ['c', 'branco', 50, 16, 7],
    ['p', 'azul', [74, 58, 98, 34, 92, 60, 98, 82]],
    ['e', 'azul', 44, 62, 36, 22],
    ['e', 'branco', 40, 74, 26, 9],
    ['px', 'preto', 24, 56]
  ]);
  d('POLVO', 'o', 'azul', [
    ['l', 'roxo', 30, 52, 12, 86, 10], ['l', 'roxo', 42, 56, 34, 94, 10],
    ['l', 'roxo', 58, 56, 66, 94, 10], ['l', 'roxo', 70, 52, 88, 86, 10],
    ['e', 'roxo', 50, 38, 28, 26],
    ['c', 'branco', 39, 40, 8], ['c', 'branco', 61, 40, 8],
    ['px', 'preto', 39, 42], ['px', 'preto', 61, 42],
    ['c', 'rosa', 50, 20, 4], ['c', 'rosa', 36, 26, 3], ['c', 'rosa', 64, 26, 3]
  ]);
  d('TARTARUGA-MARINHA', 'a', 'azul', [
    ['e', 'lima', 22, 32, 18, 9, -35], ['e', 'lima', 78, 32, 18, 9, 35],
    ['e', 'lima', 26, 76, 13, 8, 35], ['e', 'lima', 74, 76, 13, 8, -35],
    ['p', 'lima', [42, 80, 58, 80, 50, 96]],
    ['c', 'lima', 50, 14, 12],
    ['c', 'marrom', 50, 52, 31],
    ['c', 'verde', 50, 52, 25],
    ['star', 'verdeEscuro', 50, 52, 13, 11, 6, 0]
  ]);
  d('ESTRELA-DO-MAR', 'a', 'azul', [
    ['r', 'bege', 0, 72, 100, 28],
    ['star', 'laranja', 50, 52, 46, 20, 5, -90],
    ['px', 'amarelo', 50, 22], ['px', 'amarelo', 24, 46], ['px', 'amarelo', 76, 46],
    ['px', 'amarelo', 32, 76], ['px', 'amarelo', 68, 76],
    ['px', 'preto', 40, 50], ['px', 'preto', 60, 50]
  ]);
  d('CARANGUEJO', 'o', 'celeste', [
    ['r', 'bege', 0, 82, 100, 18],
    ['l', 'vermelho', 28, 66, 8, 84, 6], ['l', 'vermelho', 30, 72, 16, 92, 6],
    ['l', 'vermelho', 72, 66, 92, 84, 6], ['l', 'vermelho', 70, 72, 84, 92, 6],
    ['l', 'vermelho', 30, 56, 18, 38, 8], ['l', 'vermelho', 70, 56, 82, 38, 8],
    ['c', 'vermelho', 16, 28, 13], ['c', 'vermelho', 84, 28, 13],
    ['p', 'celeste', [16, 28, 8, 10, 24, 12]], ['p', 'celeste', [84, 28, 76, 12, 92, 10]],
    ['l', 'vermelho', 42, 50, 40, 32, 5], ['l', 'vermelho', 58, 50, 60, 32, 5],
    ['e', 'vermelho', 50, 62, 28, 18],
    ['c', 'branco', 40, 28, 7], ['c', 'branco', 60, 28, 7],
    ['px', 'preto', 40, 28], ['px', 'preto', 60, 28]
  ]);
  d('CAVALO-MARINHO', 'o', 'azul', [
    ['l', 'verde', 10, 100, 14, 62, 6], ['l', 'verde', 14, 62, 8, 34, 6],
    ['l', 'verde', 90, 100, 86, 70, 6],
    ['e', 'laranja', 32, 50, 8, 13],
    ['p', 'laranja', [38, 12, 42, 0, 48, 10, 54, 0, 58, 12]],
    ['c', 'amarelo', 48, 20, 12],
    ['l', 'amarelo', 54, 24, 80, 30, 9],
    ['e', 'amarelo', 44, 36, 9, 10],
    ['e', 'amarelo', 50, 56, 17, 19],
    ['l', 'amarelo', 46, 70, 38, 84, 10],
    ['l', 'amarelo', 38, 84, 48, 94, 8],
    ['c', 'amarelo', 56, 86, 7],
    ['c', 'azul', 54, 84, 2.5],
    ['l', 'laranja', 52, 48, 66, 48, 3], ['l', 'laranja', 52, 58, 66, 58, 3], ['l', 'laranja', 50, 67, 62, 67, 3],
    ['px', 'preto', 50, 18]
  ]);
  d('SUBMARINO', 'o', 'azul', [
    ['c', 'celeste', 86, 16, 4], ['c', 'celeste', 92, 30, 3], ['c', 'celeste', 80, 6, 3],
    ['l', 'cinza', 48, 12, 48, 30, 5], ['l', 'cinza', 48, 12, 60, 12, 5],
    ['rr', 'amarelo', 30, 26, 28, 22, 5],
    ['p', 'laranja', [80, 58, 94, 42, 94, 74]],
    ['e', 'amarelo', 46, 58, 38, 18],
    ['c', 'cinza', 26, 58, 8], ['c', 'celeste', 26, 58, 5],
    ['c', 'cinza', 46, 58, 8], ['c', 'celeste', 46, 58, 5],
    ['c', 'cinza', 66, 58, 8], ['c', 'celeste', 66, 58, 5]
  ]);
  d('CONCHA', 'a', 'azul', [
    ['r', 'bege', 0, 80, 100, 20],
    ...(function () {
      const out = [], n = 7, a0 = 195, a1 = 345;
      for (let k = 0; k < n; k++) {
        const pts = [50, 80].concat(arc(50, 80, 48, a0 + (a1 - a0) * k / n, a0 + (a1 - a0) * (k + 1) / n, 4));
        out.push(['p', k % 2 ? 'rosaEscuro' : 'rosa', pts]);
      }
      return out;
    })(),
    ['p', 'rosaEscuro', [36, 72, 64, 72, 58, 90, 42, 90]],
    ['c', 'branco', 86, 90, 5]
  ]);

  /* ===== MUNDO 3 — JARDIM DAS FRUTAS (14 × 14) ===== */
  d('MAÇÃ', 'a', 'celeste', [
    ['r', 'bege', 0, 88, 100, 12],
    ['c', 'vermelho', 37, 58, 27], ['c', 'vermelho', 63, 58, 27],
    ['e', 'vermelho', 50, 70, 32, 20],
    ['c', 'celeste', 50, 30, 5],
    ['l', 'marrom', 50, 36, 54, 12, 5],
    ['e', 'verde', 68, 18, 13, 6, -25],
    ['e', 'branco', 32, 50, 4, 9, 20]
  ]);
  d('BANANA', 'a', 'celeste', [
    ['r', 'bege', 0, 88, 100, 12],
    ['p', 'amarelo', arc(50, 14, 64, 26, 154, 18).concat(arc(50, -12, 62, 154, 26, 18))],
    ['p', 'laranja', arc(50, 14, 64, 52, 128, 12).concat(arc(50, 12, 58, 128, 52, 12))],
    ['l', 'verde', 96, 46, 99, 28, 7],
    ['c', 'marrom', 6, 46, 5]
  ]);
  d('MORANGO', 'o', 'celeste', [
    ['e', 'vermelho', 50, 46, 32, 22],
    ['p', 'vermelho', [20, 48, 80, 48, 62, 82, 50, 92, 38, 82]],
    ['star', 'verde', 50, 26, 22, 8, 5, 90],
    ['l', 'verdeEscuro', 50, 22, 54, 4, 5],
    ['px', 'amarelo', 34, 44], ['px', 'amarelo', 50, 42], ['px', 'amarelo', 66, 44],
    ['px', 'amarelo', 42, 58], ['px', 'amarelo', 58, 58],
    ['px', 'amarelo', 30, 56], ['px', 'amarelo', 70, 56],
    ['px', 'amarelo', 50, 70], ['px', 'amarelo', 40, 74], ['px', 'amarelo', 60, 74]
  ]);
  d('UVA', 'a', 'celeste', [
    ['l', 'marrom', 50, 18, 54, 4, 5],
    ['e', 'verde', 70, 14, 15, 8, -15],
    ['c', 'roxo', 32, 30, 10], ['c', 'lilas', 50, 28, 10], ['c', 'roxo', 68, 30, 10],
    ['c', 'lilas', 40, 46, 10], ['c', 'roxo', 60, 46, 10],
    ['c', 'lilas', 24, 46, 8], ['c', 'lilas', 76, 46, 8],
    ['c', 'roxo', 32, 62, 10], ['c', 'lilas', 50, 62, 10], ['c', 'roxo', 68, 62, 10],
    ['c', 'lilas', 40, 77, 10], ['c', 'roxo', 60, 77, 10],
    ['c', 'roxo', 50, 90, 9],
    ['px', 'branco', 30, 28], ['px', 'branco', 66, 28], ['px', 'branco', 58, 44], ['px', 'branco', 30, 60], ['px', 'branco', 66, 60], ['px', 'branco', 58, 75]
  ]);
  d('MELANCIA', 'a', 'celeste', [
    ['r', 'bege', 0, 86, 100, 14],
    ['c', 'verdeEscuro', 50, 30, 50],
    ['c', 'lima', 50, 30, 44],
    ['c', 'vermelho', 50, 30, 38],
    ['r', 'celeste', 0, 0, 100, 30],
    ['px', 'preto', 32, 40], ['px', 'preto', 50, 40], ['px', 'preto', 68, 40],
    ['px', 'preto', 40, 52], ['px', 'preto', 60, 52], ['px', 'preto', 50, 62]
  ]);
  d('ABACAXI', 'o', 'celeste', [
    ['p', 'verde', [50, 40, 26, 4, 44, 22, 50, 0, 56, 22, 74, 4]],
    ['p', 'verdeEscuro', [50, 40, 12, 18, 42, 30]], ['p', 'verdeEscuro', [50, 40, 88, 18, 58, 30]],
    ['e', 'amarelo', 50, 68, 30, 30],
    ...(function () {
      const out = [];
      for (let y = 46; y <= 90; y += 11) for (let x = 26; x <= 74; x += 11) {
        const xx = x + ((y - 46) / 11 % 2 ? 5.5 : 0);
        if (((xx - 50) / 27) ** 2 + ((y - 68) / 27) ** 2 <= 1) out.push(['px', 'laranja', xx, y]);
      }
      return out;
    })()
  ]);
  d('LARANJA', 'a', 'celeste', [
    ['r', 'bege', 0, 88, 100, 12],
    ['c', 'laranja', 50, 56, 34],
    ['l', 'marrom', 50, 26, 50, 14, 5],
    ['e', 'verde', 64, 16, 13, 6, -20],
    ['e', 'amarelo', 36, 44, 6, 9, 30],
    ['px', 'amarelo', 62, 66], ['px', 'amarelo', 46, 74], ['px', 'amarelo', 70, 50]
  ]);
  d('PERA', 'a', 'celeste', [
    ['r', 'bege', 0, 90, 100, 10],
    ['c', 'lima', 50, 66, 26],
    ['c', 'lima', 50, 38, 16],
    ['p', 'lima', [34, 40, 66, 40, 76, 62, 24, 62]],
    ['l', 'marrom', 50, 24, 54, 8, 5],
    ['e', 'verde', 66, 14, 12, 6, -20],
    ['e', 'amarelo', 38, 60, 5, 9, 15]
  ]);
  d('CEREJA', 'a', 'celeste', [
    ['l', 'marrom', 26, 62, 52, 16, 6, { w: 3 }], ['l', 'marrom', 74, 60, 52, 16, 6, { w: 3 }],
    ['e', 'verde', 68, 16, 14, 7, -20],
    ['l', 'verdeEscuro', 54, 16, 80, 14, 2],
    ['c', 'vermelho', 25, 74, 16], ['c', 'vermelho', 75, 72, 16],
    ['px', 'branco', 20, 68], ['px', 'branco', 70, 66]
  ]);
  d('LIMÃO', 'o', 'celeste', [
    ['r', 'bege', 0, 90, 100, 10],
    ['e', 'verde', 38, 44, 30, 22, -20],
    ['e', 'verdeEscuro', 54, 18, 10, 5, -30],
    ['c', 'verde', 70, 72, 21],
    ['c', 'lima', 70, 72, 16],
    ['l', 'branco', 70, 58, 70, 86, 2.5], ['l', 'branco', 56, 72, 84, 72, 2.5],
    ['l', 'branco', 60, 62, 80, 82, 2.5], ['l', 'branco', 80, 62, 60, 82, 2.5],
    ['e', 'lima', 28, 38, 6, 4, -20]
  ]);

  /* ===== MUNDO 4 — AVENTURA SOBRE RODAS (16 × 16) ===== */
  d('CARRO', 'o', 'celeste', [
    ['c', 'amarelo', 12, 12, 8],
    ['r', 'cinza', 0, 80, 100, 20],
    ['r', 'branco', 6, 90, 14, 3], ['r', 'branco', 42, 90, 14, 3], ['r', 'branco', 78, 90, 14, 3],
    ['p', 'vermelho', [24, 50, 34, 28, 66, 28, 80, 50]],
    ['rr', 'vermelho', 8, 46, 84, 24, 8],
    ['p', 'celeste', [32, 48, 39, 33, 49, 33, 49, 48]],
    ['p', 'celeste', [54, 48, 54, 33, 63, 33, 73, 48]],
    ['r', 'amarelo', 86, 52, 6, 6],
    ['c', 'preto', 28, 72, 11], ['c', 'cinza', 28, 72, 4],
    ['c', 'preto', 72, 72, 11], ['c', 'cinza', 72, 72, 4]
  ]);
  d('ÔNIBUS', 'o', 'celeste', [
    ['r', 'cinza', 0, 84, 100, 16],
    ['rr', 'amarelo', 4, 28, 92, 50, 7],
    ['r', 'laranja', 4, 60, 92, 6],
    ['r', 'azul', 10, 36, 14, 16], ['r', 'azul', 28, 36, 14, 16], ['r', 'azul', 46, 36, 14, 16],
    ['r', 'azul', 66, 36, 12, 34],
    ['r', 'azul', 82, 36, 12, 16],
    ['r', 'branco', 88, 64, 6, 6],
    ['c', 'preto', 24, 80, 10], ['c', 'cinza', 24, 80, 4],
    ['c', 'preto', 78, 80, 10], ['c', 'cinza', 78, 80, 4]
  ]);
  d('BICICLETA', 'a', 'celeste', [
    ['r', 'lima', 0, 86, 100, 14],
    ['ring', 'preto', 24, 66, 19, 13], ['ring', 'preto', 76, 66, 19, 13],
    ['px', 'cinza', 24, 66], ['px', 'cinza', 76, 66],
    ['l', 'vermelho', 24, 66, 48, 66, 5, { w: 2 }], ['l', 'vermelho', 48, 66, 40, 38, 5, { w: 2 }],
    ['l', 'vermelho', 40, 38, 70, 38, 5, { w: 2 }], ['l', 'vermelho', 48, 66, 70, 38, 5, { w: 2 }],
    ['l', 'vermelho', 24, 66, 40, 38, 5, { w: 2 }], ['l', 'vermelho', 70, 38, 76, 66, 5, { w: 2 }],
    ['l', 'cinza', 40, 38, 38, 28, 4], ['e', 'marrom', 36, 26, 9, 4],
    ['l', 'preto', 70, 38, 68, 24, 4], ['l', 'preto', 62, 24, 76, 22, 5]
  ]);
  d('AVIÃO', 'o', 'celeste', [
    ['c', 'amarelo', 88, 12, 8],
    ...cloud('branco', 6, 16, 1), ...cloud('branco', 64, 88, 1.1),
    ['p', 'cinza', [46, 44, 62, 44, 42, 20, 32, 20]],
    ['p', 'vermelho', [8, 52, 4, 20, 18, 20, 32, 44]],
    ['e', 'branco', 50, 52, 44, 13],
    ['e', 'vermelho', 50, 60, 40, 3],
    ['p', 'cinza', [40, 56, 64, 56, 40, 86, 28, 86]],
    ['e', 'azul', 85, 47, 6, 4],
    ['px', 'azul', 26, 49], ['px', 'azul', 38, 49], ['px', 'azul', 50, 49], ['px', 'azul', 62, 49], ['px', 'azul', 72, 49]
  ]);
  d('FOGUETE', 'o', 'azulEscuro', [
    ['px', 'amarelo', 10, 10], ['px', 'amarelo', 86, 20], ['px', 'amarelo', 16, 60], ['px', 'amarelo', 88, 70], ['px', 'amarelo', 70, 6],
    ['p', 'laranja', [38, 74, 62, 74, 50, 100]],
    ['p', 'amarelo', [43, 74, 57, 74, 50, 90]],
    ['p', 'vermelho', [36, 52, 20, 76, 36, 74]], ['p', 'vermelho', [64, 52, 80, 76, 64, 74]],
    ['rr', 'branco', 36, 28, 28, 48, 6],
    ['p', 'vermelho', [36, 32, 50, 4, 64, 32]],
    ['c', 'cinza', 50, 46, 9], ['c', 'celeste', 50, 46, 6],
    ['r', 'vermelho', 46, 60, 8, 16]
  ]);
  d('TREM', 'o', 'celeste', [
    ['c', 'branco', 30, 22, 6], ['c', 'branco', 40, 12, 8], ['c', 'branco', 54, 8, 6],
    ['r', 'cinza', 0, 86, 100, 5],
    ['r', 'preto', 26, 28, 9, 20],
    ['r', 'azul', 12, 46, 52, 26],
    ['r', 'vermelho', 62, 30, 28, 42],
    ['r', 'preto', 58, 24, 36, 6],
    ['r', 'amarelo', 68, 36, 16, 14],
    ['p', 'preto', [12, 66, 12, 82, 2, 82]],
    ['r', 'amarelo', 12, 52, 4, 6],
    ['c', 'preto', 26, 76, 9], ['c', 'preto', 48, 76, 9], ['c', 'preto', 76, 74, 11],
    ['px', 'cinza', 26, 76], ['px', 'cinza', 48, 76], ['px', 'cinza', 76, 74]
  ]);
  d('BARCO', 'o', 'celeste', [
    ['c', 'amarelo', 84, 14, 9],
    ['r', 'azul', 0, 74, 100, 26],
    ['l', 'marrom', 50, 10, 50, 66, 4],
    ['p', 'vermelho', [52, 10, 70, 15, 52, 20]],
    ['p', 'branco', [46, 20, 46, 62, 14, 62]],
    ['p', 'branco', [54, 26, 54, 62, 80, 62]],
    ['p', 'marrom', [10, 64, 90, 64, 78, 80, 22, 80]],
    ['l', 'branco', 6, 90, 22, 90, 3], ['l', 'branco', 44, 94, 60, 94, 3], ['l', 'branco', 76, 88, 92, 88, 3]
  ]);
  d('HELICÓPTERO', 'o', 'celeste', [
    ...cloud('branco', 6, 72, 1), ...cloud('branco', 70, 84, 1),
    ['l', 'preto', 10, 22, 80, 22, 4], ['l', 'preto', 44, 22, 44, 34, 4],
    ['r', 'vermelho', 58, 46, 32, 7],
    ['l', 'preto', 90, 36, 90, 60, 3],
    ['e', 'vermelho', 42, 52, 24, 18],
    ['p', 'azul', [42, 36, 58, 42, 60, 56, 42, 56]],
    ['l', 'preto', 30, 70, 30, 78, 3], ['l', 'preto', 54, 70, 54, 78, 3],
    ['l', 'cinza', 18, 80, 66, 80, 4]
  ]);
  d('CAMINHÃO', 'o', 'celeste', [
    ['r', 'cinza', 0, 84, 100, 16],
    ['r', 'branco', 8, 92, 14, 3], ['r', 'branco', 44, 92, 14, 3], ['r', 'branco', 80, 92, 14, 3],
    ['r', 'laranja', 4, 26, 60, 48],
    ['l', 'amarelo', 10, 40, 58, 40, 3], ['l', 'amarelo', 10, 58, 58, 58, 3],
    ['p', 'azul', [66, 36, 84, 36, 96, 56, 96, 74, 66, 74]],
    ['p', 'celeste', [72, 42, 82, 42, 90, 56, 72, 56]],
    ['r', 'amarelo', 92, 62, 4, 6],
    ['c', 'preto', 20, 78, 9], ['c', 'preto', 46, 78, 9], ['c', 'preto', 80, 78, 9],
    ['px', 'cinza', 20, 78], ['px', 'cinza', 46, 78], ['px', 'cinza', 80, 78]
  ]);
  d('BALÃO', 'o', 'celeste', [
    ...cloud('branco', 4, 82, 1), ...cloud('branco', 72, 20, 1),
    ['l', 'marrom', 36, 68, 42, 82, 2.5], ['l', 'marrom', 64, 68, 58, 82, 2.5],
    ['p', 'laranja', [30, 60, 70, 60, 62, 70, 38, 70]],
    ['e', 'azul', 50, 36, 30, 30],
    ['e', 'amarelo', 50, 36, 19, 30],
    ['e', 'vermelho', 50, 36, 8, 30],
    ['rr', 'marrom', 40, 80, 20, 14, 3]
  ]);

  /* ===== MUNDO 5 — MUNDO DA IMAGINAÇÃO (18 × 18) ===== */
  d('CASTELO', 'o', 'celeste', [
    ...cloud('branco', 30, 10, 0.9),
    ['r', 'verde', 0, 86, 100, 14],
    ['l', 'preto', 16, 4, 16, 14, 2], ['p', 'vermelho', [17, 4, 26, 7, 17, 10]],
    ['l', 'preto', 84, 4, 84, 14, 2], ['p', 'vermelho', [85, 4, 94, 7, 85, 10]],
    ['r', 'cinza', 18, 46, 64, 42],
    ['r', 'cinza', 20, 40, 7, 8], ['r', 'cinza', 33, 40, 7, 8], ['r', 'cinza', 60, 40, 7, 8], ['r', 'cinza', 73, 40, 7, 8],
    ['r', 'cinza', 38, 28, 24, 20],
    ['p', 'azul', [35, 30, 50, 8, 65, 30]],
    ['r', 'cinza', 4, 32, 22, 56], ['r', 'cinza', 74, 32, 22, 56],
    ['p', 'azul', [1, 34, 15, 12, 29, 34]], ['p', 'azul', [71, 34, 85, 12, 99, 34]],
    ['rr', 'marrom', 40, 62, 20, 26, 9],
    ['r', 'amarelo', 12, 46, 6, 9], ['r', 'amarelo', 82, 46, 6, 9], ['r', 'amarelo', 47, 34, 6, 8]
  ]);
  d('ARCO-ÍRIS', 'o', 'celeste', [
    ['c', 'amarelo', 86, 14, 8],
    ['ring', 'vermelho', 50, 82, 48, 41],
    ['ring', 'laranja', 50, 82, 41, 35],
    ['ring', 'amarelo', 50, 82, 35, 29],
    ['ring', 'verde', 50, 82, 29, 23],
    ['ring', 'azul', 50, 82, 23, 17],
    ['ring', 'roxo', 50, 82, 17, 11],
    ['r', 'celeste', 0, 82, 100, 18],
    ['c', 'branco', 8, 84, 10], ['c', 'branco', 20, 80, 11], ['c', 'branco', 30, 88, 8], ['r', 'branco', 0, 86, 34, 14],
    ['c', 'branco', 70, 88, 8], ['c', 'branco', 80, 80, 11], ['c', 'branco', 92, 84, 10], ['r', 'branco', 66, 86, 34, 14]
  ]);
  d('SOL', 'o', 'celeste', [
    ...cloud('branco', 4, 86, 1), ...cloud('branco', 74, 90, 1),
    ['star', 'laranja', 50, 48, 46, 28, 12, 0],
    ['c', 'amarelo', 50, 48, 29],
    smile('vermelho', 50, 50, 14, 4),
    ['e', 'preto', 40, 42, 3, 5], ['e', 'preto', 60, 42, 3, 5],
    ['c', 'rosa', 32, 54, 4.5], ['c', 'rosa', 68, 54, 4.5]
  ]);
  d('LUA', 'a', 'azulEscuro', [
    ['px', 'branco', 70, 10], ['px', 'branco', 90, 40], ['px', 'branco', 10, 8], ['px', 'branco', 60, 60], ['px', 'branco', 6, 70],
    ['star', 'amarelo', 76, 26, 9, 4, 5, -90], ['star', 'amarelo', 84, 58, 6, 2.6, 5, -90],
    ['c', 'amarelo', 44, 48, 36],
    ['c', 'azulEscuro', 64, 38, 31],
    ['l', 'preto', 22, 44, 30, 47, 3],
    ['c', 'rosa', 26, 58, 4],
    ['c', 'laranja', 20, 30, 3], ['c', 'laranja', 36, 76, 3.5],
    ['c', 'lilas', 56, 90, 9], ['c', 'lilas', 70, 84, 12], ['c', 'lilas', 86, 90, 9], ['r', 'lilas', 48, 90, 50, 10]
  ]);
  d('ESTRELA', 'a', 'roxo', [
    ['star', 'branco', 14, 16, 8, 3, 4, 0], ['star', 'branco', 86, 84, 8, 3, 4, 0],
    ['px', 'celeste', 86, 14], ['px', 'celeste', 10, 80], ['px', 'celeste', 50, 96],
    ['star', 'laranja', 50, 54, 48, 23, 5, -90],
    ['star', 'amarelo', 50, 54, 41, 19, 5, -90],
    ['e', 'preto', 43, 52, 2.6, 4.5], ['e', 'preto', 57, 52, 2.6, 4.5],
    smile('preto', 50, 58, 7, 3),
    ['c', 'rosa', 36, 62, 3.5], ['c', 'rosa', 64, 62, 3.5]
  ]);
  d('FOGUETE MÁGICO', 'o', 'azulEscuro', [
    ['px', 'amarelo', 10, 10], ['px', 'amarelo', 12, 46], ['px', 'amarelo', 90, 52], ['px', 'amarelo', 12, 82], ['px', 'amarelo', 88, 86],
    ['star', 'branco', 24, 24, 8, 3, 4, 0], ['star', 'branco', 84, 70, 6, 2.5, 4, 0],
    ['c', 'verde', 82, 20, 11],
    ['l', 'amarelo', 64, 28, 99, 13, 3],
    ['r', 'vermelho', 39, 66, 8, 34], ['r', 'amarelo', 47, 66, 8, 34], ['r', 'verde', 55, 66, 8, 34],
    ['p', 'rosa', [34, 46, 18, 76, 36, 70]], ['p', 'rosa', [66, 46, 82, 76, 64, 70]],
    ['e', 'roxo', 50, 44, 18, 30],
    ['p', 'rosa', [36, 22, 50, 2, 64, 22]],
    ['c', 'branco', 50, 40, 11], ['c', 'celeste', 50, 40, 7.5],
    ['r', 'rosa', 40, 68, 20, 5]
  ]);
  d('COGUMELO', 'o', 'celeste', [
    ['e', 'vermelho', 50, 48, 42, 34],
    ['r', 'celeste', 0, 48, 100, 40],
    ['r', 'verde', 0, 86, 100, 14],
    ['e', 'bege', 50, 48, 30, 5],
    ['rr', 'bege', 34, 46, 32, 42, 10],
    ['c', 'branco', 28, 34, 6], ['c', 'branco', 52, 22, 7], ['c', 'branco', 74, 34, 6], ['c', 'branco', 14, 44, 3.5], ['c', 'branco', 86, 44, 3.5],
    ['px', 'preto', 44, 62], ['px', 'preto', 56, 62],
    ['px', 'rosa', 39, 69], ['px', 'rosa', 61, 69],
    ['l', 'verde', 12, 86, 12, 74, 2.5], ['c', 'amarelo', 12, 72, 4],
    ['l', 'verde', 88, 86, 88, 76, 2.5], ['c', 'amarelo', 88, 74, 4]
  ]);
  d('BORBOLETA', 'a', 'celeste', [
    ['r', 'lima', 0, 88, 100, 12],
    ['e', 'laranja', 28, 34, 24, 19, -25], ['e', 'laranja', 72, 34, 24, 19, 25],
    ['e', 'amarelo', 32, 66, 17, 14, 25], ['e', 'amarelo', 68, 66, 17, 14, -25],
    ['c', 'azul', 26, 32, 8], ['c', 'azul', 74, 32, 8],
    ['c', 'roxo', 32, 68, 6], ['c', 'roxo', 68, 68, 6],
    ['px', 'branco', 14, 24], ['px', 'branco', 86, 24], ['px', 'branco', 20, 46], ['px', 'branco', 80, 46],
    ['e', 'preto', 50, 54, 4.5, 26],
    ['c', 'preto', 50, 26, 6],
    ['l', 'preto', 48, 22, 38, 6, 2.5], ['l', 'preto', 52, 22, 62, 6, 2.5]
  ]);
  d('ROBÔ', 'o', 'amarelo', [
    ['l', 'cinza', 50, 6, 50, 18, 3], ['c', 'vermelho', 50, 6, 5],
    ['r', 'azul', 20, 24, 8, 14], ['r', 'azul', 72, 24, 8, 14],
    ['rr', 'cinza', 26, 16, 48, 32, 6],
    ['c', 'branco', 40, 30, 7.5], ['c', 'branco', 60, 30, 7.5],
    ['px', 'preto', 40, 30], ['px', 'preto', 60, 30],
    ['r', 'preto', 40, 40, 20, 4],
    ['r', 'preto', 44, 48, 12, 4],
    ['l', 'cinza', 26, 58, 12, 74, 6], ['l', 'cinza', 74, 58, 88, 74, 6],
    ['c', 'cinza', 11, 76, 5], ['c', 'cinza', 89, 76, 5],
    ['rr', 'azul', 24, 52, 52, 32, 6],
    ['rr', 'cinza', 34, 58, 32, 20, 3],
    ['c', 'vermelho', 43, 68, 4], ['c', 'verde', 57, 68, 4],
    ['r', 'cinza', 32, 84, 12, 8], ['r', 'cinza', 56, 84, 12, 8],
    ['r', 'preto', 28, 92, 18, 6], ['r', 'preto', 54, 92, 18, 6]
  ]);
  d('CASINHA', 'a', 'celeste', [
    ['c', 'amarelo', 86, 13, 9],
    ['c', 'branco', 72, 12, 4], ['c', 'branco', 66, 4, 5],
    ['r', 'marrom', 64, 14, 9, 22],
    ['r', 'verde', 0, 84, 100, 16],
    ['r', 'amarelo', 20, 46, 60, 40],
    ['p', 'vermelho', [10, 50, 50, 14, 90, 50]],
    ['rr', 'marrom', 42, 60, 16, 26, 6],
    ['r', 'branco', 24, 56, 14, 14], ['r', 'azul', 26, 58, 10, 10],
    ['r', 'branco', 62, 56, 14, 14], ['r', 'azul', 64, 58, 10, 10],
    ['r', 'branco', 46, 30, 8, 8],
    ['px', 'rosa', 8, 86], ['px', 'rosa', 22, 90], ['px', 'rosa', 86, 88], ['px', 'rosa', 96, 92]
  ]);

  // Monta a lista final de missões (id 1..50)
  const MISSIONS = D.map(function (dr, i) {
    const world = WORLDS[Math.floor(i / 10)];
    return {
      id: i + 1,
      index: i % 10,
      world: world.id,
      name: dr.name,
      art: dr.art,
      bg: dr.bg,
      layers: dr.layers,
      size: world.size
    };
  });

  window.MOSAICO_DATA = { COLORS: COLORS, WORLDS: WORLDS, MISSIONS: MISSIONS };
})();
