/* ATELIÊ AFRO — paleta com 44 cores organizadas por grupos. */
(function (AA) {
  'use strict';
  AA.PALETA = [
    { grupo: 'vermelhos e rosas', cores: ['#D32F2F', '#F44336', '#FF4F8B', '#FF9EC4', '#C2185B'] },
    { grupo: 'laranjas e amarelos', cores: ['#FF7A00', '#FFB347', '#FFC21A', '#FFE45C', '#FFF4A8', '#E8A317'] },
    { grupo: 'verdes', cores: ['#1B7F3B', '#43A047', '#9CD45B', '#00A896', '#556B2F'] },
    { grupo: 'azuis', cores: ['#0D3B8C', '#1E7BE0', '#64B5F6', '#BDE3FF', '#00ACC1'] },
    { grupo: 'roxos', cores: ['#4A148C', '#8E24AA', '#B97CE0', '#E3C8F5'] },
    { grupo: 'marrons e terrosos', cores: ['#4E2A1E', '#8B5A2B', '#C1440E', '#D4A373'] },
    { grupo: 'tons de pele', pele: true, cores: ['#FAD9C3', '#F1C27D', '#E0AC69', '#C68642', '#A86B3C', '#8D5524', '#6E4026', '#5A3825', '#3D2314', '#2A1810'] },
    { grupo: 'preto, branco e cinzas', cores: ['#1D1D1F', '#5F6368', '#9E9E9E', '#E0E0E0', '#FFFFFF'] }
  ];
  AA.TODAS_CORES = AA.PALETA.reduce((a, g) => a.concat(g.cores), []);
})(window.AA);
