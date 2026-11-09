/* =========================================================
   CAÇADORES DE LETRAS — Cenários das fases 31 a 60
   Mundo 4: FAZENDA ENCANTADA · Mundo 5: ESPAÇO SIDERAL ·
   Mundo 6: POLO GELADO
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const S = CDL.SCENES;
  const K = CDL.sceneKit;
  const { grad, sky, hill, ground, stars, water, wall, floor, vignette } = K;

  /* ---------- fundos próprios dos novos mundos ---------- */
  function farmBase(b, top, bottom, hills = ['#B5E39A', '#8ED67E'], gnd = ['#86CF6B', '#5FAE4E'], gy = 660) {
    sky(b, top, bottom);
    hill(b, 'M0 560 Q300 420 650 530 Q950 430 1250 520 Q1450 460 1600 500 V900 H0Z', hills[0]);
    hill(b, 'M0 620 Q400 520 800 600 Q1200 520 1600 600 V900 H0Z', hills[1]);
    ground(b, gy, gnd[0], gnd[1]);
  }
  function fields(b, y, color = '#7CB342') {
    let s = '';
    for (let i = 0; i < 6; i++) s += `<path d="M0 ${y + i * 30} Q800 ${y - 20 + i * 30} 1600 ${y + i * 30}" stroke="${color}" stroke-width="6" fill="none" opacity=".45"/>`;
    b.raw(s);
  }
  function spaceBase(b, top, bottom, seed, surface) {
    b.def(grad('space', [[0, top], [1, bottom]]));
    b.raw('<rect width="1600" height="900" fill="url(#space)"/>');
    stars(b, 70, seed, 900);
    if (surface) {
      const [c1, c2, y] = surface;
      b.def(grad('moon', [[0, c1], [1, c2]]));
      b.raw(`<path d="M0 ${y} Q300 ${y - 50} 650 ${y - 10} T1200 ${y - 20} T1600 ${y - 30} V900 H0Z" fill="url(#moon)"/>`);
    }
  }
  function nebula(b, x, y, r, c) {
    b.def(`<radialGradient id="neb${x}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`);
    b.raw(`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#neb${x})"/>`);
  }
  function snowBase(b, top, bottom, gy = 660) {
    sky(b, top, bottom);
    hill(b, `M0 ${gy - 80} Q400 ${gy - 180} 800 ${gy - 90} Q1200 ${gy - 190} 1600 ${gy - 100} V900 H0Z`, '#E3F2FD');
    b.def(grad('snow', [[0, '#FFFFFF'], [1, '#DCEBF7']]));
    b.raw(`<path d="M0 ${gy} Q400 ${gy - 30} 800 ${gy} T1600 ${gy} V900 H0Z" fill="url(#snow)"/>`);
    b.raw(`<g fill="#B3D4E8" opacity=".5"><ellipse cx="300" cy="${gy + 120}" rx="90" ry="10"/><ellipse cx="1000" cy="${gy + 170}" rx="120" ry="12"/><ellipse cx="1400" cy="${gy + 90}" rx="70" ry="8"/></g>`);
  }
  function seaIce(b, y, c1 = '#4FC3F7', c2 = '#0277BD') {
    b.def(grad('icesea', [[0, c1], [1, c2]]));
    b.raw(`<rect y="${y}" width="1600" height="${900 - y}" fill="url(#icesea)"/><path d="M0 ${y} q50 -10 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" fill="#B3E5FC"/>`);
  }
  function snowfall(b, seed, n = 30) {
    for (let i = 0; i < n; i++) b.add('snowflake', (seed * 131 + i * 173) % 1600, (seed * 71 + i * 97) % 560 + 40, 0.5 + (i % 3) * 0.25, { noSpot: true });
  }
  function aurora(b) {
    b.raw(`<g opacity=".55" class="anim-glow"><path d="M0 200 Q300 80 600 180 T1200 160 T1600 120 V260 Q1200 300 800 260 T0 300Z" fill="#69F0AE" opacity=".5"/><path d="M0 140 Q400 40 800 140 T1600 90 V170 Q1200 210 800 190 T0 220Z" fill="#B388FF" opacity=".45"/></g>`);
  }

  /* =================== MUNDO 4 — FAZENDA ENCANTADA =================== */
  S[31] = { name: 'Pasto das Vacas', build(b) {
    farmBase(b, '#7FD3FF', '#E6F7FF');
    b.add('sun', 1360, 150, 0.8); b.add('cloud', 300, 140, 1); b.add('cloud', 850, 110, 0.8);
    b.add('barn', 230, 690, 1.1);
    b.add('fence', 420, 760, 1, { n: 10 });
    b.add('cow', 640, 820, 1.1); b.add('cow', 1000, 780, 0.95, { flip: true }); b.add('cow', 1330, 840, 1.05);
    b.add('tree', 1500, 690, 1.1); b.add('windmill', 1150, 640, 0.6);
    b.add('flower', 500, 870, 1, { color: '#FF6FA5' }); b.add('flower', 1200, 880, 1, { color: '#FFD23F' });
    b.spot(700, 380).spot(420, 520).spot(1000, 500);
  } };
  S[32] = { name: 'Milharal Dourado', build(b) {
    farmBase(b, '#8FD8FF', '#FFF4D0', ['#D8E7A0', '#C4DA7E'], ['#B7CF5E', '#8FAE3E']);
    b.add('sun', 220, 150, 0.9); b.add('cloud', 900, 120, 1);
    for (let i = 0; i < 12; i++) b.add('corn', 80 + i * 130, 700 + (i % 2) * 40, 0.8 + (i % 3) * 0.1, { noSpot: i % 2 === 1 });
    b.add('scarecrow', 820, 820, 1.1);
    for (let i = 0; i < 9; i++) b.add('corn', 40 + i * 190, 880, 0.9, { noSpot: true });
    b.add('bird', 600, 260, 1.2, { color: '#37474F' }); b.add('bird', 1100, 300, 1, { color: '#37474F' }); b.add('bird', 1300, 220, 0.9, { color: '#37474F' });
    b.spot(400, 300).spot(1350, 420).spot(1000, 520);
  } };
  S[33] = { name: 'Chiqueiro Divertido', build(b) {
    farmBase(b, '#A6E1FF', '#F2FBFF');
    b.add('cloud', 400, 130, 1.1); b.add('cloud', 1250, 160, 0.9);
    b.add('barn', 1350, 680, 0.9, { color: '#C0392B' });
    b.raw('<ellipse cx="760" cy="790" rx="420" ry="80" fill="#8D6E63"/><ellipse cx="760" cy="790" rx="360" ry="60" fill="#A1887F"/>');
    b.add('pig', 600, 790, 1.2); b.add('pig', 900, 820, 1, { flip: true }); b.add('pig', 760, 760, 0.8);
    b.add('fence', 120, 760, 1, { n: 7 }); b.add('hay', 1150, 820, 1); b.add('hay', 230, 850, 0.8);
    b.add('tree', 140, 660, 1.1, { fruit: '#FF5A5F' }); b.add('chicken', 1050, 860, 0.9);
    b.spot(600, 420).spot(1000, 420).spot(300, 560);
  } };
  S[34] = { name: 'Haras dos Cavalos', build(b) {
    farmBase(b, '#87CEFF', '#FFEED9');
    b.add('sun', 1400, 130, 0.7); b.add('cloud', 500, 140, 1);
    b.add('windmill', 260, 650, 0.7);
    b.add('fence', 60, 780, 1, { n: 38 });
    b.add('horse', 640, 800, 1.1); b.add('horse', 1080, 820, 1, { flip: true, color: '#5D4037' });
    b.add('barn', 1380, 700, 0.9, { color: '#1E88E5' });
    b.add('hay', 860, 860, 0.9); b.add('well', 420, 860, 0.8); b.add('tree', 950, 650, 0.9);
    b.spot(800, 300).spot(1150, 420).spot(500, 470);
  } };
  S[35] = { name: 'Colina das Ovelhas', build(b) {
    sky(b, '#8BD3FF', '#E9FBFF');
    b.add('cloud', 300, 120, 1.2); b.add('cloud', 1000, 150, 1); b.add('cloud', 1450, 100, 0.7);
    hill(b, 'M0 700 Q400 300 900 520 Q1200 420 1600 560 V900 H0Z', '#8ED67E');
    hill(b, 'M0 780 Q500 640 900 720 Q1300 620 1600 700 V900 H0Z', '#6CC160');
    b.add('sheep', 380, 560, 0.9); b.add('sheep', 620, 600, 1, { flip: true }); b.add('sheep', 900, 720, 1.1); b.add('sheep', 1200, 640, 0.9); b.add('sheep', 1400, 780, 1, { flip: true }); b.add('sheep', 200, 820, 1.1);
    b.add('tree', 1000, 520, 1); b.add('windmill', 1450, 560, 0.5);
    b.spot(500, 300).spot(1250, 360).spot(800, 420);
  } };
  S[36] = { name: 'Celeiro do Trator', build(b) {
    farmBase(b, '#7FD3FF', '#FFF7E0');
    b.add('sun', 200, 140, 0.7); b.add('cloud', 900, 120, 1.1);
    b.add('barn', 900, 700, 1.4);
    b.add('tractor', 420, 820, 1.2); b.add('hay', 1260, 800, 1.1); b.add('hay', 1440, 840, 0.9); b.add('hay', 1350, 730, 0.8);
    b.add('well', 150, 800, 0.9); b.add('chicken', 650, 870, 0.9); b.add('chick', 700, 880, 1);
    b.add('pine', 1500, 640, 1); b.add('pine', 60, 640, 0.9);
    b.spot(400, 380).spot(1300, 420).spot(1150, 560);
  } };
  S[37] = { name: 'Galinheiro', build(b) {
    farmBase(b, '#9BE1FF', '#FFF9E6', ['#C5E8A5', '#A4D88A'], ['#C8B07A', '#A68B55']);
    b.add('cloud', 300, 140, 1); b.add('cloud', 1200, 120, 1);
    b.add('barn', 1200, 680, 0.9, { color: '#FFB300' });
    b.add('fence', 60, 700, 1, { n: 20 });
    [[300, 800], [500, 860], [700, 790], [920, 850], [1450, 830]].forEach(([x, y], i) => b.add('chicken', x, y, 1, { flip: i % 2 === 1, color: i % 2 ? '#FFFFFF' : '#C8834E', tail: i % 2 ? '#FFFFFF' : '#8D5524' }));
    [[400, 870], [600, 880], [820, 880], [1050, 870], [1300, 880]].forEach(([x, y]) => b.add('chick', x, y, 1.2));
    b.add('basket', 1080, 800, 0.8); b.add('corn', 160, 700, 0.8);
    b.spot(600, 420).spot(300, 520).spot(900, 500);
  } };
  S[38] = { name: 'Horta da Vovó', build(b) {
    farmBase(b, '#86D3FF', '#F0FFF2', ['#B9E59D', '#97D37F'], ['#9C7A54', '#7A5C3D']);
    b.add('sun', 1400, 140, 0.8); b.add('cloud', 600, 130, 1);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) b.add('carrot', 150 + i * 150 + row * 30, 720 + row * 60, 1.3, { noSpot: true });
    b.add('pumpkin', 300, 880, 1.2); b.add('pumpkin', 820, 890, 1); b.add('pumpkin', 1350, 880, 1.3);
    b.add('scarecrow', 1100, 700, 0.9); b.add('well', 120, 700, 0.8); b.add('rabbit', 600, 880, 0.8);
    b.add('tree', 1500, 660, 1);
    b.spot(400, 350).spot(800, 450).spot(1300, 420).spot(500, 760).spot(1000, 800);
  } };
  S[39] = { name: 'Lago da Fazenda', build(b) {
    farmBase(b, '#8FD8FF', '#FFF2E0');
    b.add('cloud', 350, 140, 1); b.add('cloud', 1300, 130, 0.9);
    b.add('windmill', 200, 650, 0.7); b.add('barn', 1400, 680, 0.8);
    b.add('pond', 800, 790, 1, { rx: 480, ry: 90 });
    b.add('bridge', 800, 760, 1);
    b.add('duck', 560, 800, 1, { water: true }); b.add('duck', 1040, 820, 0.9, { water: true, flip: true });
    b.add('reed', 340, 800, 1); b.add('reed', 1260, 810, 1);
    b.add('chick', 200, 880, 1.3); b.add('chick', 260, 870, 1.1); b.add('sheep', 1450, 870, 0.8);
    b.spot(800, 380).spot(500, 500).spot(1100, 500);
  } };
  S[40] = { name: 'Festa da Colheita', build(b) {
    farmBase(b, '#FF9E6B', '#FFE3A8', ['#E0B66B', '#C9A05A'], ['#C7A35E', '#9C7A3E']);
    b.add('sun', 800, 540, 1.1); b.add('cloud', 300, 150, 1, { color: '#FFD3B6' }); b.add('cloud', 1300, 120, 0.9, { color: '#FFD3B6' });
    b.add('barn', 260, 700, 1.1, { color: '#B23A2E' });
    b.add('tractor', 1300, 820, 1, { color: '#E53935' });
    b.add('hay', 700, 840, 1.1); b.add('hay', 900, 860, 0.9);
    [[520, 880], [1000, 880], [1100, 860], [600, 870]].forEach(([x, y]) => b.add('pumpkin', x, y, 1));
    b.add('scarecrow', 1500, 700, 0.8); b.add('candle', 820, 760, 0.7); b.add('basket', 450, 880, 0.8);
    b.spot(500, 300).spot(1100, 300).spot(800, 200);
  } };

  /* =================== MUNDO 5 — ESPAÇO SIDERAL =================== */
  S[41] = { name: 'Base de Lançamento', build(b) {
    spaceBase(b, '#1A237E', '#5C6BC0', 41, ['#90A4AE', '#607D8B', 740]);
    b.add('fullmoon', 1350, 160, 0.9);
    b.add('rocket', 800, 760, 1.6);
    b.raw('<path d="M600 760 V420 M600 460 H760 M600 560 H760 M600 660 H760" stroke="#B0BEC5" stroke-width="12"/>');
    b.add('astronaut', 400, 840, 1); b.add('spaceFlag', 1100, 800, 1); b.add('ufo', 300, 250, 0.7);
    b.add('crater', 1300, 860, 1.2); b.add('crater', 200, 880, 1);
    b.spot(1000, 420).spot(500, 350).spot(1250, 600);
  } };
  S[42] = { name: 'Vista da Terra', build(b) {
    spaceBase(b, '#0D1240', '#283593', 42, ['#BDBDBD', '#8D8D8D', 720]);
    b.add('earth', 1150, 280, 2);
    b.add('astronaut', 500, 840, 1.1); b.add('spaceFlag', 760, 790, 1.1);
    b.add('rocket', 250, 760, 0.9); b.add('crater', 1000, 840, 1.4); b.add('crater', 1400, 870, 1);
    b.add('satellite', 400, 230, 0.7);
    b.spot(700, 300).spot(150, 450).spot(1450, 600);
  } };
  S[43] = { name: 'Chuva de Cometas', build(b) {
    spaceBase(b, '#120B3A', '#3F1D6E', 43);
    nebula(b, 400, 400, 300, '#E040FB'); nebula(b, 1200, 500, 280, '#40C4FF');
    [[600, 160], [1300, 260], [900, 420], [400, 560], [1450, 640], [700, 720]].forEach(([x, y], i) => b.add('comet', x, y, 0.6 + (i % 3) * 0.15, { tail: ['#80DEEA', '#FFAB91', '#B39DDB'][i % 3] }));
    b.add('planet', 200, 220, 0.8, { color: '#4DB6AC', dark: '#00796B' }); b.add('planet', 1300, 760, 1, { color: '#FFB74D', dark: '#E65100', ring: true });
    b.add('asteroid', 1000, 800, 0.8);
    b.spot(1100, 140).spot(250, 760).spot(800, 600);
  } };
  S[44] = { name: 'Constelação Brilhante', build(b) {
    spaceBase(b, '#0B0F2E', '#1F2A6B', 44);
    nebula(b, 800, 450, 420, '#7C4DFF');
    const pts = [[300, 200], [520, 300], [700, 220], [900, 380], [1100, 260], [1300, 420], [400, 560], [800, 640], [1200, 700]];
    b.raw(`<path d="M${pts.slice(0, 6).map((p) => p.join(' ')).join(' L')}" stroke="#E8EAF6" stroke-width="3" stroke-dasharray="8 10" fill="none" opacity=".6"/>`);
    pts.forEach(([x, y], i) => b.add('starBig', x, y, 0.6 + (i % 3) * 0.2, { color: ['#FFE066', '#FFF', '#FFD180'][i % 3] }));
    b.add('planet', 1450, 150, 0.7, { color: '#F06292', dark: '#AD1457' }); b.add('ufo', 250, 760, 0.8);
    b.spot(150, 400).spot(1450, 560).spot(600, 820);
  } };
  S[45] = { name: 'Planeta dos Anéis', build(b) {
    spaceBase(b, '#1A0F3D', '#4A2C82', 45);
    b.add('planet', 800, 440, 2.4, { color: '#FFCC80', dark: '#F57C00', ring: true, ringColor: '#FFE0B2' });
    b.add('planet', 220, 200, 0.6, { color: '#90CAF9', dark: '#1565C0' }); b.add('planet', 1400, 720, 0.7, { color: '#A5D6A7', dark: '#2E7D32' });
    b.add('satellite', 1350, 220, 0.8); b.add('satellite', 300, 700, 0.6);
    b.add('asteroid', 1100, 820, 0.6); b.add('comet', 500, 820, 0.5);
    b.spot(800, 140).spot(200, 450).spot(1450, 450);
  } };
  S[46] = { name: 'Estação Espacial', build(b) {
    spaceBase(b, '#101A4A', '#30408F', 46, ['#B0BEC5', '#78909C', 700]);
    b.add('earth', 220, 220, 0.9);
    b.add('dome', 500, 800, 1.1, { c1: '#4DB6AC', c2: '#7986CB', c3: '#FFB74D' }); b.add('dome', 1050, 790, 1.3, { c1: '#F06292', c2: '#4FC3F7', c3: '#AED581' });
    b.add('satellite', 1200, 250, 1.1); b.add('rocket', 1450, 820, 0.8);
    b.add('astronaut', 780, 860, 0.9); b.add('astronaut', 250, 860, 0.8);
    b.spot(700, 300).spot(900, 500).spot(400, 450);
  } };
  S[47] = { name: 'Cinturão de Asteroides', build(b) {
    spaceBase(b, '#0E0A26', '#2B1E5A', 47);
    nebula(b, 1200, 300, 300, '#FF6E40');
    [[200, 200, 1], [450, 330, 0.7], [700, 180, 1.1], [950, 360, 0.8], [1250, 220, 0.9], [1450, 420, 1.2], [300, 600, 1.1], [600, 520, 0.6], [880, 650, 1.3], [1150, 600, 0.7], [1400, 780, 0.9], [150, 820, 0.8]].forEach(([x, y, s], i) =>
      b.add('asteroid', x, y, s, { color: ['#8D8D8D', '#A1887F', '#78909C'][i % 3] }));
    b.add('rocket', 800, 860, 0.7); b.add('comet', 1000, 120, 0.6);
    b.spot(450, 780).spot(1250, 450).spot(650, 380);
  } };
  S[48] = { name: 'Planeta Marciano', build(b) {
    spaceBase(b, '#3E1A2E', '#B5523B', 48, ['#D2691E', '#8B3A1A', 680]);
    b.add('planet', 1300, 180, 0.8, { color: '#FFE0B2', dark: '#FF8A65' }); b.add('planet', 1100, 120, 0.35, { color: '#BCAAA4', dark: '#6D4C41' });
    b.add('alien', 400, 820, 1.1); b.add('alien', 900, 860, 0.9, { color: '#B2FF59' }); b.add('alien', 1350, 820, 1, { color: '#64FFDA' });
    b.add('ufo', 650, 300, 1); b.add('crater', 650, 820, 1.4); b.add('crater', 1150, 870, 1);
    b.add('crystal', 180, 840, 0.8, { color: '#FF80AB' }); b.add('crystal', 1500, 860, 0.7, { color: '#EA80FC' });
    b.spot(300, 400).spot(1000, 450).spot(800, 640);
  } };
  S[49] = { name: 'Galáxia Espiral', build(b) {
    spaceBase(b, '#05061E', '#1B1452', 49);
    b.raw('<g transform="translate(800 440)" opacity=".85"><ellipse rx="360" ry="150" fill="#7C4DFF" opacity=".25"/><path d="M0 0 C120 -80 300 -40 340 60 M0 0 C-120 80 -300 40 -340 -60 M0 0 C80 120 40 220 -60 230 M0 0 C-80 -120 -40 -220 60 -230" stroke="#E1BEE7" stroke-width="26" fill="none" opacity=".55" stroke-linecap="round"/><circle r="70" fill="#FFF8E1" opacity=".85"/><circle r="120" fill="#FFE082" opacity=".25"/></g>');
    b.add('planet', 200, 750, 0.8, { color: '#4DD0E1', dark: '#00838F', ring: true }); b.add('planet', 1400, 200, 0.6, { color: '#FF8A80', dark: '#C62828' });
    [[250, 180], [1350, 700], [1100, 820], [500, 820]].forEach(([x, y]) => b.add('starBig', x, y, 0.6));
    b.add('ufo', 1300, 450, 0.6);
    b.spot(800, 150).spot(300, 450).spot(1050, 650);
  } };
  S[50] = { name: 'Missão Lunar', build(b) {
    spaceBase(b, '#0A0D2B', '#26306B', 50, ['#E0E0E0', '#9E9E9E', 700]);
    b.add('earth', 1250, 200, 1.1); b.add('planet', 300, 160, 0.5, { color: '#FFB74D', dark: '#E65100', ring: true });
    b.add('rocket', 300, 800, 1.2); b.add('astronaut', 650, 820, 1.1); b.add('astronaut', 1100, 860, 0.9);
    b.add('spaceFlag', 860, 780, 1.1); b.add('ufo', 750, 260, 0.8);
    b.add('crater', 1350, 820, 1.5); b.add('crater', 500, 880, 1); b.add('satellite', 1450, 480, 0.6);
    b.spot(950, 420).spot(500, 450).spot(1400, 650);
  } };

  /* =================== MUNDO 6 — POLO GELADO =================== */
  S[51] = { name: 'Vale Nevado', build(b) {
    snowBase(b, '#9CCBFF', '#EAF5FF');
    b.add('mountain', 400, 640, 1); b.add('mountain', 1150, 660, 1.2, { color: '#A3B5DA' });
    b.add('pine', 150, 760, 1.1, { snow: true, c1: '#2E7D5A', c2: '#215E44' }); b.add('pine', 1480, 760, 1.2, { snow: true, c1: '#2E7D5A', c2: '#215E44' });
    b.add('snowman', 800, 860, 1.1); b.add('sled', 1200, 860, 1); b.add('pine', 600, 740, 0.8, { snow: true });
    snowfall(b, 51, 26);
    b.spot(800, 300).spot(1350, 500).spot(300, 520);
  } };
  S[52] = { name: 'Praia das Focas', build(b) {
    sky(b, '#8EC9FF', '#F0F8FF');
    b.add('cloud', 300, 120, 1); b.add('cloud', 1200, 160, 1.1);
    seaIce(b, 460);
    b.add('iceberg', 1300, 520, 1.3); b.add('iceberg', 250, 500, 0.8);
    b.raw('<path d="M100 720 Q500 640 900 700 Q1200 660 1550 740 L1600 900 H0 V760Z" fill="#FAFDFF"/>');
    b.add('seal', 400, 780, 1.4); b.add('seal', 800, 820, 1.2, { flip: true }); b.add('seal', 1200, 790, 1.3);
    b.add('fish', 700, 560, 0.6, { color: '#90A4AE', c2: '#CFD8DC' }); b.add('penguin', 1450, 820, 0.9);
    b.spot(600, 300).spot(1000, 580).spot(200, 860);
  } };
  S[53] = { name: 'Vila dos Iglus', build(b) {
    snowBase(b, '#AFC8FF', '#F2F7FF');
    b.add('mountain', 1200, 560, 0.8, { color: '#B3C3E6' });
    b.add('igloo', 350, 760, 1.2); b.add('igloo', 900, 740, 1); b.add('igloo', 1350, 790, 1.3);
    b.add('penguin', 600, 840, 1); b.add('penguin', 660, 860, 0.8); b.add('penguin', 1100, 870, 0.9);
    b.add('sled', 200, 870, 1); b.add('snowman', 1550, 880, 0.7);
    snowfall(b, 53, 22);
    b.spot(600, 350).spot(1000, 400).spot(250, 450);
  } };
  S[54] = { name: 'Cabana Aconchegante', build(b) {
    wall(b, '#A1683A', '#6D3F1A');
    floor(b, 720, '#8D6E63', '#7A5C52');
    b.add('archWindow', 1150, 520, 1, { w: 180, h: 280, inside: '#DCEBF7', frame: '#5D4037' });
    b.raw('<path d="M300 720 V380 H620 V720Z" fill="#9E9E9E"/><path d="M340 720 V520 Q460 440 580 520 V720Z" fill="#3E2723"/><path d="M280 380 H640 V340 H280Z" fill="#6D4C41"/>');
    b.add('campfire', 460, 720, 1.1);
    b.raw('<path d="M60 200 Q500 260 900 200" stroke="#5D4037" stroke-width="4" fill="none"/>');
    [[160, 228, '#E53935'], [300, 240, '#1E88E5'], [440, 246, '#FFB300'], [580, 242, '#43A047'], [720, 228, '#8E24AA']].forEach(([x, y, c], i) => b.add(i % 2 ? 'mitten' : 'beanie', x, y + 60, 1.2, { color: c }));
    b.add('scarf', 1000, 820, 1.4, { color: '#E53935' }); b.add('bookshelf', 1450, 720, 0.8, { w: 180, h: 300, seed: 6 });
    b.add('cat', 760, 870, 0.8, { color: '#FFA94D' }); b.add('candle', 680, 360, 0.8);
    vignette(b, '#3E2723', 0.3);
    b.spot(1000, 300).spot(150, 520).spot(800, 500);
  } };
  S[55] = { name: 'Lago Congelado', build(b) {
    snowBase(b, '#9ED0FF', '#EEF7FF', 600);
    b.raw('<ellipse cx="800" cy="780" rx="600" ry="110" fill="#B3E5FC"/><ellipse cx="800" cy="780" rx="540" ry="90" fill="#D6F0FF"/><path d="M400 760 L700 800 M900 740 L1200 790 M600 820 L800 800" stroke="#fff" stroke-width="4" opacity=".8"/>');
    b.add('pine', 120, 700, 1.2, { snow: true }); b.add('pine', 1480, 700, 1.1, { snow: true }); b.add('pine', 260, 640, 0.8, { snow: true });
    b.add('penguin', 600, 790, 1.1); b.add('penguin', 980, 800, 1, { flip: true }); b.add('penguin', 800, 760, 0.8);
    b.add('snowman', 1300, 720, 0.9); b.add('mitten', 700, 840, 1.2, { color: '#1E88E5' });
    snowfall(b, 55, 20);
    b.spot(500, 300).spot(1100, 350).spot(800, 480);
  } };
  S[56] = { name: 'Mar das Baleias', build(b) {
    sky(b, '#7FB8F0', '#E6F2FF');
    b.add('cloud', 400, 120, 1); b.add('cloud', 1300, 100, 0.8);
    seaIce(b, 380, '#4FC3F7', '#01579B');
    b.add('iceberg', 200, 420, 1); b.add('iceberg', 1450, 430, 1.2);
    b.add('whale', 700, 620, 1.3); b.add('whale', 1250, 780, 0.8);
    b.add('fish', 300, 700, 0.8, { color: '#90A4AE', c2: '#ECEFF1' }); b.add('fish', 1000, 520, 0.7, { color: '#4DD0E1', c2: '#E0F7FA', flip: true });
    b.add('seal', 1450, 420, 0.7); b.add('jellyfish', 400, 820, 0.6, { color: '#B3E5FC' });
    b.spot(800, 250).spot(400, 500).spot(1100, 650);
  } };
  S[57] = { name: 'Colônia de Pinguins', build(b) {
    snowBase(b, '#A4CFFF', '#F4F9FF', 600);
    b.add('iceberg', 1300, 600, 1.4); b.add('mountain', 300, 560, 0.7);
    [[250, 760, 1], [380, 800, 1.2], [520, 750, 0.9], [650, 830, 1.1], [800, 780, 1], [950, 840, 1.3], [1100, 770, 0.9], [1250, 840, 1.1], [1420, 790, 1], [180, 870, 1.2], [720, 880, 0.9], [1500, 880, 1]].forEach(([x, y, s], i) =>
      b.add('penguin', x, y, s, { flip: i % 2 === 1 }));
    b.add('fish', 900, 650, 0.5, { color: '#90A4AE', c2: '#CFD8DC' });
    snowfall(b, 57, 18);
    b.spot(600, 300).spot(1000, 380).spot(200, 400);
  } };
  S[58] = { name: 'Sorveteria do Polo', build(b) {
    snowBase(b, '#B7D8FF', '#FFF5FA');
    b.raw('<rect x="520" y="440" width="560" height="300" rx="10" fill="#FFFFFF"/><path d="M500 440 H1100 L1060 360 H540Z" fill="#F48FB1"/><path d="M540 360 L580 440 M620 360 L660 440 M700 360 L740 440 M780 360 L820 440 M860 360 L900 440 M940 360 L980 440 M1020 360 L1060 440" stroke="#fff" stroke-width="18"/><rect x="560" y="560" width="480" height="180" fill="#B3E5FC"/>');
    [[620, 640], [720, 640], [820, 640], [920, 640], [1000, 640]].forEach(([x, y], i) => b.add('icecream', x, y, 1.2, { color: ['#F48FB1', '#A5D6A7', '#FFE082', '#CE93D8', '#80DEEA'][i], c2: ['#FFF59D', '#F48FB1', '#BCAAA4', '#FFF', '#FFAB91'][i] }));
    b.add('polarBear', 300, 860, 1); b.add('penguin', 1200, 850, 1); b.add('penguin', 1300, 870, 0.8);
    b.add('umbrella', 1450, 860, 0.9); b.add('snowman', 150, 760, 0.6);
    snowfall(b, 58, 16);
    b.spot(800, 220).spot(300, 500).spot(1300, 500);
  } };
  S[59] = { name: 'Montanha Gigante', build(b) {
    snowBase(b, '#8FC1FF', '#EAF4FF', 700);
    b.add('mountain', 800, 760, 2.1, { color: '#93A7D6' });
    b.add('mountain', 200, 760, 0.8, { color: '#B1C2E4' }); b.add('mountain', 1450, 760, 0.9, { color: '#B1C2E4' });
    b.add('pine', 120, 850, 1, { snow: true }); b.add('pine', 1500, 860, 1.1, { snow: true }); b.add('pine', 400, 860, 0.8, { snow: true });
    b.add('polarBear', 1100, 870, 1); b.add('sled', 700, 880, 1.1); b.add('igloo', 1350, 860, 0.7);
    snowfall(b, 59, 26);
    b.spot(800, 300).spot(500, 500).spot(1150, 520);
  } };
  S[60] = { name: 'Aurora Boreal', build(b) {
    sky(b, '#0B1340', '#2F4A8A');
    stars(b, 50, 60, 500);
    aurora(b);
    b.add('fullmoon', 1380, 140, 0.6);
    b.add('mountain', 300, 680, 0.9, { color: '#3C4E86' }); b.add('mountain', 1200, 680, 1.1, { color: '#465A96' });
    b.def(grad('nsnow', [[0, '#DCE8F7'], [1, '#AFC3E0']]));
    b.raw('<path d="M0 680 Q400 650 800 680 T1600 680 V900 H0Z" fill="url(#nsnow)"/>');
    b.add('igloo', 400, 820, 1.1); b.add('polarBear', 1000, 860, 1); b.add('snowman', 1400, 860, 0.9);
    b.add('penguin', 650, 860, 0.9); b.add('penguin', 720, 880, 0.7);
    b.spot(800, 350).spot(300, 450).spot(1100, 450);
  } };

  /* ---------- objetos espalhados (bagunça) dos novos mundos ---------- */
  const anyOf = (arr) => (r) => arr[Math.floor(r() * arr.length)];
  const FL = anyOf(['#FF6FA5', '#FFD23F', '#7B61FF', '#E84A5F', '#4FC3F7', '#FF8C42', '#FFFFFF']);
  const SPACE = anyOf(['#FF8A65', '#4DB6AC', '#F06292', '#9575CD', '#FFD54F', '#4FC3F7', '#AED581']);
  const ICE = anyOf(['#E53935', '#1E88E5', '#FFB300', '#43A047', '#8E24AA', '#F06292']);
  CDL.CLUTTER[4] = [
    ['flower', 'ground', 0.5, 0.9, (r) => ({ color: FL(r) })], ['tulip', 'ground', 0.6, 1, (r) => ({ color: FL(r) })], ['grass', 'ground', 0.8, 1.4], ['grass', 'ground', 0.8, 1.4],
    ['hay', 'ground', 0.25, 0.4], ['carrot', 'ground', 0.9, 1.3], ['pumpkin', 'ground', 0.4, 0.7], ['chick', 'ground', 0.9, 1.3], ['chick', 'ground', 0.9, 1.3],
    ['chicken', 'ground', 0.5, 0.75, (r) => ({ color: r() < 0.5 ? '#FFFFFF' : '#C8834E' })], ['pig', 'ground', 0.35, 0.5], ['sheep', 'ground', 0.35, 0.5],
    ['apple', 'ground', 0.8, 1.2], ['corn', 'ground', 0.35, 0.5], ['pebble', 'ground', 0.7, 1.2], ['basket', 'ground', 0.3, 0.45], ['leaf', 'ground', 0.8, 1.3, (r) => ({ color: '#8BC34A', rot: r() * 360 })],
    ['mushroom', 'ground', 0.3, 0.5, (r) => ({ color: FL(r) })], ['butterfly', 'float', 0.5, 0.8, (r) => ({ color: FL(r), c2: FL(r) })], ['bee', 'float', 0.6, 1], ['bird', 'float', 0.5, 0.8, (r) => ({ color: FL(r) })]
  ];
  CDL.CLUTTER[5] = [
    ['asteroid', 'float', 0.25, 0.5, (r) => ({ color: anyOf(['#8D8D8D', '#A1887F', '#78909C'])(r) })], ['asteroid', 'float', 0.25, 0.5], ['starBig', 'float', 0.3, 0.55, (r) => ({ color: anyOf(['#FFE066', '#FFFFFF', '#FFD180'])(r) })],
    ['star', 'float', 1, 1.8], ['star', 'float', 1, 1.8], ['planet', 'float', 0.2, 0.4, (r) => ({ color: SPACE(r), dark: '#37474F', ring: r() < 0.4 })], ['satellite', 'float', 0.25, 0.4],
    ['comet', 'float', 0.25, 0.4, (r) => ({ tail: SPACE(r) })], ['ufo', 'float', 0.25, 0.4, (r) => ({ color: SPACE(r) })], ['rocket', 'float', 0.25, 0.4, (r) => ({ fin: SPACE(r) })],
    ['alien', 'ground', 0.4, 0.65, (r) => ({ color: anyOf(['#76FF03', '#64FFDA', '#B2FF59', '#EA80FC'])(r) })], ['astronaut', 'ground', 0.35, 0.55], ['crater', 'ground', 0.5, 0.9],
    ['crystal', 'ground', 0.25, 0.45, (r) => ({ color: SPACE(r) })], ['pebble', 'ground', 0.7, 1.2, (r) => ({ color: anyOf(['#9E9E9E', '#BDBDBD', '#8D6E63'])(r) })], ['spaceFlag', 'ground', 0.35, 0.5]
  ];
  CDL.CLUTTER[6] = [
    ['snowflake', 'float', 0.8, 1.4], ['snowflake', 'float', 0.8, 1.4], ['bird', 'float', 0.5, 0.8, () => ({ color: '#ECEFF1' })],
    ['penguin', 'ground', 0.4, 0.65], ['penguin', 'ground', 0.4, 0.65], ['seal', 'ground', 0.4, 0.6], ['mitten', 'ground', 0.7, 1.1, (r) => ({ color: ICE(r) })], ['beanie', 'ground', 0.6, 0.9, (r) => ({ color: ICE(r) })],
    ['scarf', 'ground', 0.5, 0.8, (r) => ({ color: ICE(r) })], ['icecream', 'ground', 0.6, 0.9, (r) => ({ color: ICE(r), c2: '#FFF59D' })], ['sled', 'ground', 0.35, 0.55], ['iceCrystal', 'ground', 0.5, 0.9],
    ['pebble', 'ground', 0.7, 1.2, (r) => ({ color: anyOf(['#B0BEC5', '#90A4AE', '#CFD8DC'])(r) })], ['pine', 'ground', 0.25, 0.4, () => ({ snow: true })], ['snowman', 'ground', 0.25, 0.4], ['igloo', 'ground', 0.2, 0.3]
  ];
  Object.assign(CDL.GROUND_Y, { 4: 640, 5: 720, 6: 660, 32: 660, 35: 620, 42: 700, 43: 880, 44: 880, 45: 880, 47: 880, 49: 880, 52: 700, 54: 730, 55: 620, 56: 720, 57: 620, 59: 720, 60: 690 });
  Object.assign(CDL.CLUTTER_COUNT, { 4: 90, 5: 92, 6: 96 });
})();
