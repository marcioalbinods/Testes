/* ATELIÊ AFRO — registro das coleções e dos desenhos. */
(function (AA) {
  'use strict';
  AA.COLECOES = [
    { n: 1, nome: 'Nossos cabelos, nossa beleza', curto: 'Cabelos', cor: '#FF5FA2', icone: '💇🏾‍♀️' },
    { n: 2, nome: 'Nossa gente, nossas histórias', curto: 'Nossa gente', cor: '#FF8A1A', icone: '👨🏿‍👩🏾‍👧🏽' },
    { n: 3, nome: 'Cultura afro-brasileira', curto: 'Cultura', cor: '#8A4FD8', icone: '🥁' },
    { n: 4, nome: 'Arte, estampas e natureza', curto: 'Arte e natureza', cor: '#21A366', icone: '🦋' },
    { n: 5, nome: 'Sonhos, talentos e possibilidades', curto: 'Sonhos', cor: '#2F7BE0', icone: '🚀' },
    { n: 6, nome: 'Brincadeiras de criança', curto: 'Brincadeiras', cor: '#E8A317', icone: '🪁' },
    { n: 7, nome: 'Bichos do Brasil e da África', curto: 'Bichos', cor: '#C1440E', icone: '🦁' },
    { n: 8, nome: 'Mandalas e estampas', curto: 'Mandalas', cor: '#00A896', icone: '🌀' },
    { n: 9, nome: 'Reis, rainhas e heróis', curto: 'Heróis', cor: '#B04BE0', icone: '👑' },
    { n: 10, nome: 'Nosso dia a dia', curto: 'Dia a dia', cor: '#FF4F8B', icone: '🏡' }
  ];
  AA.DESENHOS = [];
  AA.add = (col, n, titulo, fn) => {
    AA.DESENHOS.push({ id: `c${col}-${String(n).padStart(2, '0')}`, col, n, titulo, fn });
  };
  const cache = {};
  AA.svgDe = (d) => {
    if (cache[d.id]) return cache[d.id];
    const A = AA.A;
    A.idPrefix = d.id;
    A.idCount = 0;
    A.colors = null;
    A.swStack = [3.4];
    cache[d.id] = A.svg(AA.O.bg() + d.fn());
    return cache[d.id];
  };
})(window.AA);
