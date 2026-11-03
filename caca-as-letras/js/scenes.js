/* =========================================================
   CAÇADORES DE LETRAS — Cenários das 30 fases
   Cada cenário é uma composição única em SVG (viewBox 1600x900).
   Os objetos registram esconderijos (spots) onde as letras
   podem aparecer, integradas à paisagem.
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const W = 1600, H = 900;

  function Builder() {
    this.defs = [];
    this.parts = [];
    this.spots = [];
  }
  Builder.prototype.def = function (s) { this.defs.push(s); return this; };
  Builder.prototype.raw = function (s) { this.parts.push(s); return this; };
  Builder.prototype.spot = function (x, y) { this.spots.push({ x, y }); return this; };
  Builder.prototype.add = function (name, x, y, s = 1, o = {}) {
    const p = CDL.P[name];
    this.parts.push(CDL.place(name, x, y, s, o));
    if (!o.noSpot) {
      const sp = typeof p.spots === 'function' ? p.spots(o) : p.spots;
      sp.forEach(([dx, dy]) => this.spots.push({ x: x + dx * s * (o.flip ? -1 : 1), y: y + dy * s }));
    }
    return this;
  };
  Builder.prototype.svg = function () {
    return `<defs>${this.defs.join('')}</defs>${this.parts.join('')}`;
  };

  /* ---------- fundos reutilizáveis (combinados de forma diferente em cada fase) ---------- */
  const grad = (id, stops, vertical = true) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const radial = (id, c1, c2) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;

  function sky(b, top, bottom) {
    b.def(grad('sky', [[0, top], [1, bottom]]));
    b.raw(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
  }
  function hill(b, d, color, op = 1) { b.raw(`<path d="${d}" fill="${color}" opacity="${op}"/>`); }
  function ground(b, y, c1, c2) {
    b.def(grad('gnd', [[0, c1], [1, c2]]));
    b.raw(`<path d="M0 ${y} Q400 ${y - 30} 800 ${y} T1600 ${y} V900 H0Z" fill="url(#gnd)"/>`);
  }
  function stars(b, n, seed, ymax = 420) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = (seed * 97 + i * 211) % W, y = (seed * 53 + i * 137) % ymax;
      s += `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="#fff" opacity="${0.5 + (i % 4) * 0.12}" ${i % 3 === 0 ? 'class="anim-twinkle"' : ''}/>`;
    }
    b.raw(s);
  }
  function water(b, top, bottom) {
    b.def(grad('sea', [[0, top], [1, bottom]]));
    b.raw(`<rect width="${W}" height="${H}" fill="url(#sea)"/>`);
  }
  function rays(b, op = 0.12) {
    let s = '';
    [[200, 120], [520, 90], [900, 140], [1250, 100]].forEach(([x, w]) => (s += `<path d="M${x} 0 L${x + w} 0 L${x + w * 2.2} 900 L${x + w * 0.6} 900Z" fill="#fff" opacity="${op}"/>`));
    b.raw(`<g class="anim-rays">${s}</g>`);
  }
  function seabed(b, y, c1, c2) {
    b.def(grad('sand', [[0, c1], [1, c2]]));
    b.raw(`<path d="M0 ${y} Q200 ${y - 40} 420 ${y - 10} T860 ${y - 20} T1300 ${y - 5} T1600 ${y - 25} V900 H0Z" fill="url(#sand)"/>`);
    b.raw(`<g fill="#000" opacity=".06"><ellipse cx="300" cy="${y + 80}" rx="60" ry="8"/><ellipse cx="900" cy="${y + 120}" rx="80" ry="9"/><ellipse cx="1400" cy="${y + 90}" rx="50" ry="7"/></g>`);
  }
  function farReef(b, color, op = 0.35) {
    hill(b, 'M0 640 Q60 520 120 600 Q180 470 260 590 Q330 500 380 610 Q460 540 520 620 L520 900 H0Z M1080 620 Q1140 500 1200 600 Q1260 470 1340 590 Q1420 520 1480 600 Q1550 520 1600 590 V900 H1080Z', color, op);
  }
  function bubblesField(b, pts) { pts.forEach(([x, y, s]) => b.add('bubbles', x, y, s || 1)); }
  function wall(b, top, bottom, brick = true) {
    b.def(grad('wall', [[0, top], [1, bottom]]));
    b.raw(`<rect width="${W}" height="${H}" fill="url(#wall)"/>`);
    if (brick) {
      b.def(`<pattern id="bricks" width="160" height="80" patternUnits="userSpaceOnUse"><rect width="160" height="80" fill="none"/><path d="M0 40 H160 M0 80 H160 M80 0 V40 M0 40 V80 M160 40 V80" stroke="#000" stroke-opacity=".07" stroke-width="4"/></pattern>`);
      b.raw(`<rect width="${W}" height="${H}" fill="url(#bricks)"/>`);
    }
  }
  function floor(b, y, c1, c2) {
    b.def(`<pattern id="tiles" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="${c1}"/><rect width="60" height="30" fill="${c2}"/><rect x="60" y="30" width="60" height="30" fill="${c2}"/></pattern>`);
    b.raw(`<rect y="${y}" width="${W}" height="${H - y}" fill="url(#tiles)"/><rect y="${y}" width="${W}" height="14" fill="#000" opacity=".15"/>`);
  }
  function vignette(b, color = '#000', op = 0.25) {
    b.def(`<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="${op}"/></radialGradient>`);
    b.raw(`<rect width="${W}" height="${H}" fill="url(#vig)" pointer-events="none"/>`);
  }

  /* =================== MUNDO 1 — FLORESTA DAS LETRAS =================== */
  const S = {};

  S[1] = { name: 'Clareira Ensolarada', build(b) {
    sky(b, '#7FD3FF', '#E3F7FF');
    b.add('sun', 1330, 170, 1);
    b.add('cloud', 330, 160, 1.1); b.add('cloud', 820, 110, 0.8);
    hill(b, 'M0 560 Q300 380 640 540 Q900 420 1200 520 Q1420 430 1600 500 V900 H0Z', '#A8E6A1');
    hill(b, 'M0 640 Q360 520 760 620 Q1100 540 1600 610 V900 H0Z', '#7CCF6E');
    ground(b, 700, '#6CC160', '#4FA548');
    b.add('tree', 190, 700, 1.25); b.add('tree', 1460, 700, 1.1, { c1: '#7ED957', c2: '#55B947' });
    b.add('bush', 560, 720, 0.9, { noSpot: true }); b.add('rock', 1040, 760, 1);
    b.add('flower', 420, 790, 1.1, { color: '#FF6FA5' }); b.add('flower', 470, 800, 0.9, { color: '#FFD23F', noSpot: true });
    b.add('flower', 1200, 800, 1.1, { color: '#7B61FF' });
    b.add('butterfly', 760, 470, 1.1); b.add('bird', 600, 300, 1);
    b.add('grass', 300, 820); b.add('grass', 900, 840); b.add('grass', 1340, 830);
    b.spot(760, 640).spot(880, 380).spot(640, 820);
  } };

  S[2] = { name: 'Noite dos Vaga-lumes', build(b) {
    b.raw('');
    sky(b, '#141B4D', '#3A4FA3');
    stars(b, 40, 2);
    b.add('moon', 1280, 170, 1.1);
    b.add('cloud', 600, 140, 0.9, { color: '#5B6BC0', op: 0.7 });
    hill(b, 'M0 600 Q250 470 520 560 Q800 450 1100 560 Q1380 470 1600 540 V900 H0Z', '#24356F');
    ground(b, 700, '#2E5E4E', '#1E4036');
    b.add('pine', 140, 720, 1.3, { c1: '#1F6B4A', c2: '#174F37' }); b.add('pine', 1480, 720, 1.2, { c1: '#1F6B4A', c2: '#174F37' });
    b.add('tree', 1160, 720, 1, { c1: '#2F7D5A', c2: '#22634A', trunk: '#5D3B22' });
    b.add('owl', 1160, 560, 1);
    b.add('tent', 640, 760, 0.9, { color: '#7B61FF' });
    b.add('campfire', 900, 790, 0.9);
    b.add('rock', 380, 800, 0.9, { color: '#5C6B8A', dark: '#4A5873' });
    [[300, 500], [480, 420], [820, 560], [1000, 470], [1360, 600], [760, 360]].forEach(([x, y]) => b.add('firefly', x, y, 1));
    b.spot(480, 420).spot(1000, 470).spot(300, 600).spot(1360, 470);
  } };

  S[3] = { name: 'Jardim da Casinha', build(b) {
    sky(b, '#9BE1FF', '#F2FBFF');
    b.add('cloud', 260, 140, 1); b.add('cloud', 1200, 120, 1.2);
    hill(b, 'M0 580 Q400 440 800 560 Q1200 460 1600 560 V900 H0Z', '#B4E8A6');
    ground(b, 690, '#86D46F', '#5DB64F');
    b.add('house', 820, 700, 1.25, { wall: '#FFE6B3', roof: '#FF7A59' });
    b.add('fence', 250, 760, 1, { n: 6 }); b.add('fence', 1080, 760, 1, { n: 7 });
    b.add('tree', 130, 700, 1, { fruit: '#FF5A5F' }); b.add('tree', 1460, 690, 1.15);
    b.add('cat', 560, 800, 1, { color: '#FFA94D' });
    b.add('flower', 1150, 820, 1, { color: '#FF6FA5' }); b.add('flower', 1200, 830, 0.8, { color: '#FFD23F', noSpot: true }); b.add('tulip', 1250, 830, 1, { color: '#7B61FF' });
    b.add('butterfly', 380, 420, 0.9, { color: '#4FC3F7', c2: '#B3E5FC' });
    b.spot(360, 600).spot(1300, 560).spot(1000, 420);
  } };

  S[4] = { name: 'Campinho da Floresta', build(b) {
    sky(b, '#6EC9FF', '#D9F3FF');
    b.add('sun', 160, 140, 0.7, { noSpot: true });
    b.add('cloud', 700, 130, 1); b.add('kite', 1150, 230, 1, { color: '#FF5A5F' });
    hill(b, 'M0 540 Q300 450 620 520 Q960 430 1300 520 Q1450 480 1600 500 V900 H0Z', '#9EDC8F');
    b.add('pine', 260, 600, 0.9, { noSpot: true }); b.add('pine', 340, 610, 0.75, { noSpot: true }); b.add('pine', 1380, 600, 0.9, { noSpot: true });
    ground(b, 650, '#7DD36A', '#58B44B');
    b.raw('<path d="M200 880 Q800 600 1400 880" stroke="#fff" stroke-width="8" fill="none" opacity=".5"/>');
    b.add('goal', 800, 690, 1.3);
    b.add('ball', 1020, 820, 1.1, { color: '#3B82F6' });
    b.add('swing', 220, 770, 1);
    b.add('tree', 1440, 760, 1.1, { c1: '#6BCB77', c2: '#4D9E5A' });
    b.add('rabbit', 560, 820, 0.9);
    b.add('bush', 1240, 800, 0.8, { berry: '#E84A5F' });
    b.add('bird', 460, 260, 0.9, { color: '#FFB400' });
    b.spot(450, 420).spot(1250, 420).spot(780, 330);
  } };

  S[5] = { name: 'Vila dos Cogumelos', build(b) {
    sky(b, '#B7A6FF', '#FFE3F1');
    b.add('cloud', 400, 130, 1, { color: '#FFF0FA' }); b.add('cloud', 1250, 170, 0.9, { color: '#FFF0FA' });
    hill(b, 'M0 560 Q300 470 700 540 Q1100 450 1600 540 V900 H0Z', '#A5D99A');
    ground(b, 700, '#8BD17C', '#62B356');
    b.add('mushroomHouse', 380, 740, 1.2, { color: '#E84A5F' });
    b.add('mushroomHouse', 1180, 720, 1, { color: '#7B61FF' });
    b.add('mushroom', 780, 780, 1.1, { color: '#FFB400' }); b.add('mushroom', 860, 800, 0.7, { color: '#FF6FA5' });
    b.add('mushroom', 1460, 820, 0.9, { color: '#E84A5F' });
    b.add('snail', 620, 840, 0.9);
    b.add('flower', 120, 830, 1.1, { color: '#FFD23F' }); b.add('flower', 980, 840, 0.9, { color: '#4FC3F7' });
    b.add('butterfly', 820, 420, 1, { color: '#FFB400', c2: '#FF6FA5' });
    b.add('bee', 1000, 520, 1);
    b.spot(640, 520).spot(1000, 330).spot(150, 560).spot(1450, 520);
  } };

  S[6] = { name: 'Lago dos Patos', build(b) {
    sky(b, '#8FD8FF', '#FFF7E0');
    b.add('sun', 800, 150, 0.6, { noSpot: true });
    b.add('cloud', 300, 120, 0.9); b.add('cloud', 1300, 150, 1);
    hill(b, 'M0 520 Q400 380 800 500 Q1200 400 1600 500 V900 H0Z', '#9AD88B');
    ground(b, 620, '#7CCF6E', '#4FA548');
    b.add('pond', 800, 760, 1, { rx: 520, ry: 110 });
    b.add('duck', 640, 760, 1.1, { water: true }); b.add('duck', 980, 790, 0.9, { water: true, flip: true, color: '#FFF3B0' });
    b.add('lilypad', 450, 790, 1, { flower: true }); b.add('lilypad', 1160, 760, 1); b.add('lilypad', 840, 830, 0.8, { flower: true, noSpot: true });
    b.add('reed', 300, 760, 1); b.add('reed', 1300, 770, 1.1);
    b.add('tree', 140, 640, 1.2); b.add('tree', 1480, 640, 1.1, { c1: '#8ED16B', c2: '#5DAE4A' });
    b.add('frog', 1250, 860, 0.8);
    b.spot(400, 520).spot(1200, 520).spot(820, 600);
  } };

  S[7] = { name: 'Piquenique na Colina', build(b) {
    sky(b, '#87CEFF', '#FFF2D6');
    b.add('cloud', 250, 180, 1.2); b.add('cloud', 980, 120, 0.9); b.add('cloud', 1400, 200, 0.8);
    hill(b, 'M0 600 Q500 330 1000 560 Q1300 470 1600 560 V900 H0Z', '#8ED67E');
    ground(b, 720, '#74C865', '#53A447');
    b.add('tree', 420, 560, 1.5, { fruit: '#FF8C42' });
    b.add('blanket', 900, 780, 1);
    b.add('cake', 820, 770, 0.9);
    b.add('basket', 1010, 780, 0.9);
    b.add('ball', 1300, 830, 0.8, { color: '#FFB400' });
    b.add('squirrel', 200, 820, 1);
    b.add('flower', 600, 840, 1, { color: '#E84A5F' }); b.add('flower', 1460, 820, 1.1, { color: '#7B61FF' });
    b.add('bee', 1130, 560, 1.1); b.add('butterfly', 1250, 420, 0.9);
    b.spot(700, 480).spot(1450, 620).spot(130, 600);
  } };

  S[8] = { name: 'Brejo dos Sapinhos', build(b) {
    sky(b, '#A2E4D8', '#E9FFF5');
    b.add('cloud', 500, 130, 1, { color: '#F4FFFB' });
    hill(b, 'M0 480 Q300 380 700 470 Q1100 370 1600 470 V900 H0Z', '#8FCB9B');
    ground(b, 560, '#6DB37A', '#4E9160');
    b.add('pond', 800, 760, 1, { rx: 700, ry: 160 });
    b.add('lilypad', 300, 740, 1.2, { flower: true }); b.add('lilypad', 620, 810, 1.1); b.add('lilypad', 1000, 720, 1.2, { flower: true }); b.add('lilypad', 1300, 820, 1);
    b.add('frog', 300, 735, 1.1); b.add('frog', 1000, 712, 1, { color: '#8BC34A', flip: true });
    b.add('reed', 120, 640, 1.2); b.add('reed', 1500, 650, 1.3); b.add('reed', 760, 620, 0.9);
    b.add('hollowLog', 1250, 620, 1);
    b.add('tree', 450, 560, 1, { c1: '#7CB66B', c2: '#5A9A4E' });
    b.add('bee', 900, 400, 1); b.add('butterfly', 1450, 330, 0.9, { color: '#3DDC84', c2: '#FFD23F' });
    b.spot(160, 420).spot(700, 330).spot(1150, 330).spot(560, 600);
  } };

  S[9] = { name: 'Trilha do Acampamento', build(b) {
    sky(b, '#FFB86B', '#FFE9C7');
    b.add('sun', 1250, 330, 0.9, { noSpot: true });
    b.add('cloud', 400, 160, 1, { color: '#FFE0EA' });
    hill(b, 'M0 520 L200 300 L380 480 L560 260 L800 500 L1000 330 L1240 520 L1420 360 L1600 500 V900 H0Z', '#B78ACF', 0.7);
    hill(b, 'M0 600 Q400 480 800 590 Q1200 490 1600 590 V900 H0Z', '#8CC37A');
    ground(b, 690, '#79B868', '#5A9850');
    b.raw('<path d="M560 900 Q700 760 760 690 L840 690 Q900 760 1080 900Z" fill="#D7B377"/>');
    b.add('tent', 380, 760, 1.1, { color: '#3DDC84' });
    b.add('campfire', 620, 800, 0.9);
    b.add('backpack', 1060, 800, 1);
    b.add('suitcase', 1200, 820, 0.9, { color: '#7B61FF' });
    b.add('signpost', 900, 700, 1);
    b.add('pine', 1480, 720, 1.2); b.add('pine', 120, 720, 1.1);
    b.add('log', 760, 860, 0.9);
    b.add('rabbit', 1350, 850, 0.8);
    b.spot(300, 480).spot(1120, 460).spot(700, 400);
  } };

  S[10] = { name: 'Cabana ao Entardecer', build(b) {
    sky(b, '#6A5ACD', '#FF9E7A');
    stars(b, 14, 10, 260);
    b.add('fullmoon', 300, 170, 0.8);
    b.add('cloud', 1050, 160, 1, { color: '#FFC1C1', op: 0.7 });
    hill(b, 'M0 560 Q400 420 800 540 Q1200 430 1600 540 V900 H0Z', '#5C4B8A');
    ground(b, 680, '#4C8A5C', '#346746');
    b.add('cabin', 760, 720, 1.25, { glow: true });
    b.add('candle', 1000, 830, 1.2);
    b.add('waterfall', 1420, 720, 0.9);
    b.add('pine', 160, 720, 1.2, { c1: '#2E6B4F', c2: '#22513C' });
    b.add('pine', 1180, 700, 0.9, { c1: '#2E6B4F', c2: '#22513C' });
    b.add('owl', 1180, 560, 0.8, { noSpot: true });
    b.add('rock', 450, 820, 1, { moss: true, color: '#8C93A8' });
    [[520, 520], [980, 470], [1300, 620]].forEach(([x, y]) => b.add('firefly', x, y, 1));
    b.spot(1000, 470).spot(560, 560).spot(1290, 420);
  } };

  /* =================== MUNDO 2 — OCEANO MISTERIOSO =================== */
  S[11] = { name: 'Recife Colorido', build(b) {
    water(b, '#3FC1E8', '#0C6AA8');
    rays(b);
    farReef(b, '#0B5D92');
    seabed(b, 740, '#F6D59A', '#E3B66E');
    b.add('coral', 200, 780, 1.2, { color: '#FF6F91' }); b.add('fanCoral', 420, 790, 1.1, { color: '#B388FF' });
    b.add('brainCoral', 640, 800, 1, { color: '#FFB74D' }); b.add('coral', 1020, 780, 1, { color: '#FFD23F' });
    b.add('fanCoral', 1250, 790, 1.2, { color: '#FF8A65' }); b.add('coral', 1460, 800, 1.1, { color: '#4DD0E1' });
    b.add('fish', 300, 300, 1, { color: '#FF8C42' }); b.add('fish', 380, 360, 0.7, { color: '#FF8C42', noSpot: true }); b.add('fish', 250, 380, 0.6, { color: '#FF8C42', noSpot: true });
    b.add('fish', 1100, 260, 1.1, { color: '#7B61FF', c2: '#B3A6FF', flip: true }); b.add('fish', 820, 460, 0.9, { color: '#FF5A5F', c2: '#FFE066' });
    b.add('starfish', 860, 860, 1); b.add('shell', 1350, 860, 0.9);
    b.add('seaweed', 760, 800, 1.1, { noSpot: true }); b.add('seaweed', 1560, 820, 1.2, { noSpot: true });
    bubblesField(b, [[560, 600], [1180, 500], [90, 520]]);
    b.spot(640, 200).spot(1400, 420).spot(140, 560).spot(950, 620).spot(560, 480);
  } };

  S[12] = { name: 'Navio Naufragado', build(b) {
    water(b, '#2AA7D6', '#0A4C86');
    rays(b, 0.1);
    farReef(b, '#0A4777', 0.4);
    seabed(b, 760, '#E8C88C', '#C99E5E');
    b.add('shipwreck', 820, 800, 1.3);
    b.add('anchor', 220, 820, 1); b.add('chest', 1380, 820, 1, { open: true });
    b.add('seaweed', 420, 830, 1.2); b.add('seaweed', 1180, 840, 1, { color: '#3BAE7E' });
    b.add('octopus', 1500, 640, 0.6, { noSpot: true });
    b.add('fish', 300, 220, 1, { color: '#FFD23F', c2: '#FF8C42' }); b.add('fish', 1250, 300, 0.9, { color: '#4DD0E1', c2: '#E0F7FA', flip: true });
    b.add('fish', 600, 520, 0.8, { color: '#FF6F91', c2: '#FFD1DC' });
    b.add('crab', 640, 870, 0.8);
    b.add('starfish', 1000, 860, 0.9, { color: '#FFB400' });
    b.add('shell', 120, 880, 0.8, { noSpot: true });
    bubblesField(b, [[880, 380], [1460, 500], [520, 700]]);
    b.spot(520, 360).spot(1300, 560).spot(1000, 220).spot(150, 520).spot(1460, 200);
  } };

  S[13] = { name: 'Ilha dos Macacos', build(b) {
    sky(b, '#71D3FF', '#D6F4FF');
    b.add('sun', 1400, 120, 0.6, { noSpot: true });
    b.add('cloud', 300, 110, 0.9); b.add('cloud', 900, 90, 0.7);
    b.def(grad('sea2', [[0, '#3BC7E6'], [1, '#0B6FAE']]));
    b.raw('<rect y="420" width="1600" height="480" fill="url(#sea2)"/><path d="M0 420 q50 -14 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0" fill="#7FE1F5"/>');
    b.raw('<path d="M280 470 Q600 300 980 470Z" fill="#F7D99A"/><path d="M320 470 Q600 340 940 470" fill="#EFC983"/>');
    b.add('palm', 520, 440, 0.8); b.add('palm', 800, 450, 0.65, { flip: true });
    b.add('monkey', 560, 260, 0.7, { noSpot: true }); b.spot(660, 240);
    b.add('monkey', 780, 330, 0.6, { flip: true });
    b.add('boat', 1250, 470, 1);
    b.add('whale', 1100, 720, 0.8);
    b.add('fish', 300, 650, 1, { color: '#FFD23F' }); b.add('fish', 600, 800, 0.9, { color: '#FF5A5F', c2: '#FFD1DC', flip: true });
    b.add('jellyfish', 1450, 680, 0.8);
    b.add('seaweed', 100, 900, 1, { noSpot: true }); b.add('seaweed', 1540, 900, 0.9, { noSpot: true });
    bubblesField(b, [[420, 840], [900, 860]]);
    b.spot(160, 300).spot(1000, 220).spot(800, 600).spot(150, 780).spot(1400, 860);
  } };

  S[14] = { name: 'Praia das Conchas', build(b) {
    sky(b, '#8EDCFF', '#FFF4DA');
    b.add('cloud', 400, 120, 1); b.add('cloud', 1200, 160, 1.1);
    b.def(grad('sea3', [[0, '#2EC4E6'], [1, '#1B8ED1']]));
    b.raw('<rect y="300" width="1600" height="260" fill="url(#sea3)"/><path d="M0 540 Q200 500 400 540 T800 540 T1200 540 T1600 540 V560 H0Z" fill="#fff" opacity=".8"/>');
    b.add('lighthouse', 1460, 420, 0.75);
    b.add('boat', 600, 400, 0.7);
    seabed(b, 560, '#FBE3B0', '#F1C987');
    b.add('sandcastle', 780, 760, 1.2);
    b.add('umbrella', 300, 800, 1.1); b.raw('<g transform="translate(300 800)"><rect x="40" y="-30" width="140" height="30" rx="6" fill="#4FC3F7"/></g>');
    b.add('crab', 1150, 820, 1);
    b.add('shell', 520, 860, 1, { color: '#FFAB91' }); b.add('shell', 1360, 860, 1, { color: '#CE93D8' });
    b.add('starfish', 1000, 870, 1, { color: '#FF7043' }); b.add('starfish', 160, 870, 0.9, { color: '#FFB400' });
    b.add('ball', 1450, 780, 0.9, { color: '#E84A5F' });
    b.add('bird', 900, 200, 1, { color: '#ECEFF1' }); b.add('bird', 980, 240, 0.8, { color: '#ECEFF1' });
    b.spot(160, 420).spot(1000, 420).spot(620, 640).spot(1280, 620);
  } };

  S[15] = { name: 'Floresta de Algas', build(b) {
    water(b, '#1FB59A', '#0B5466');
    rays(b, 0.14);
    seabed(b, 780, '#D9C690', '#B3A06A');
    [[90, 1.6], [260, 2.1], [470, 1.7], [700, 2.3], [930, 1.8], [1150, 2.2], [1360, 1.7], [1540, 2.0]].forEach(([x, h], i) =>
      b.add('seaweed', x, 840, 1, { h: h * 160, color: i % 2 ? '#2E9E6A' : '#3FBF7F', noSpot: i % 2 === 1 }));
    b.add('seahorse', 360, 520, 1); b.add('seahorse', 1260, 440, 0.9, { color: '#FF8A65', flip: true });
    b.add('fish', 820, 300, 1, { color: '#FFE066', c2: '#FFB400' }); b.add('fish', 600, 640, 0.8, { color: '#4FC3F7', c2: '#B3E5FC', flip: true });
    b.add('turtle', 1050, 620, 0.9);
    b.add('starfish', 620, 870, 0.9); b.add('shell', 1440, 870, 0.9);
    b.add('rock', 200, 860, 0.9, { color: '#7A8C8E', moss: true });
    bubblesField(b, [[160, 300], [1000, 220], [1450, 600]]);
    b.spot(1460, 250).spot(560, 200).spot(150, 650).spot(900, 760);
  } };

  S[16] = { name: 'Caverna de Cristais', build(b) {
    water(b, '#3B2F7A', '#120C3A');
    b.raw('<path d="M0 0 H1600 V140 Q1500 220 1400 150 Q1300 260 1180 160 Q1060 240 960 150 Q860 270 740 160 Q620 230 520 140 Q400 250 300 150 Q180 230 0 160Z" fill="#241A55"/>');
    b.raw('<path d="M0 900 V300 Q80 260 120 360 Q160 520 90 900Z M1600 900 V280 Q1520 240 1480 360 Q1440 520 1510 900Z" fill="#241A55"/>');
    seabed(b, 780, '#5E4E9C', '#3B2F7A');
    b.add('crystal', 260, 820, 1.4, { color: '#80DEEA' }); b.add('crystal', 640, 800, 1.1, { color: '#F48FB1' });
    b.add('crystal', 1020, 820, 1.3, { color: '#B388FF' }); b.add('crystal', 1380, 800, 1.2, { color: '#A5D6A7' });
    b.add('lanternfish', 820, 420, 1);
    b.add('jellyfish', 380, 330, 0.9, { color: '#80DEEA' }); b.add('jellyfish', 1240, 300, 1, { color: '#F48FB1' });
    b.add('fish', 600, 580, 0.8, { color: '#4DD0E1', c2: '#E0F7FA' });
    b.add('chest', 1180, 850, 0.8);
    b.add('shell', 460, 870, 0.9, { color: '#CE93D8' });
    stars(b, 20, 16, 700);
    b.spot(160, 260).spot(1440, 220).spot(960, 620).spot(220, 560).spot(1450, 560).spot(820, 220);
  } };

  S[17] = { name: 'Cidade Submarina', build(b) {
    water(b, '#2FA7E0', '#0A3F7A');
    rays(b, 0.1);
    farReef(b, '#0B4E86', 0.45);
    seabed(b, 770, '#E6CC92', '#C9A766');
    b.add('dome', 320, 800, 1.1, { c1: '#FF8A65', c2: '#FFD54F', c3: '#4DB6AC' });
    b.add('dome', 820, 790, 1.4, { c1: '#BA68C8', c2: '#4FC3F7', c3: '#FFB74D' });
    b.add('dome', 1310, 800, 1, { c1: '#81C784', c2: '#FF8A65', c3: '#9575CD' });
    b.add('submarine', 1150, 320, 1);
    b.add('fish', 300, 260, 1, { color: '#FF5A5F', c2: '#FFE066' }); b.add('fish', 600, 420, 0.8, { color: '#3DDC84', c2: '#C8F7DC', flip: true });
    b.add('seahorse', 1520, 560, 0.8);
    b.add('coral', 580, 850, 0.7, { color: '#FF6F91' }); b.add('coral', 1080, 860, 0.7, { color: '#FFD23F' });
    b.add('seaweed', 60, 860, 1, { noSpot: true });
    b.add('starfish', 1500, 870, 0.8);
    bubblesField(b, [[820, 500], [330, 560], [1310, 580]]);
    b.spot(700, 200).spot(140, 470).spot(1450, 160).spot(1000, 560);
    b.spot(450, 700).spot(1200, 700).spot(300, 360).spot(1500, 780);
  } };

  S[18] = { name: 'Baía das Águas-Vivas', build(b) {
    water(b, '#5B8DEF', '#1A2F7A');
    rays(b, 0.08);
    seabed(b, 800, '#C9B6E4', '#9C86C8');
    [[200, 260, '#F48FB1'], [480, 420, '#CE93D8'], [760, 220, '#80DEEA'], [1040, 400, '#FFAB91'], [1320, 250, '#F48FB1'], [1480, 520, '#B39DDB'], [320, 600, '#80DEEA']].forEach(([x, y, c], i) =>
      b.add('jellyfish', x, y, 0.9 + (i % 3) * 0.15, { color: c }));
    b.add('anemone', 300, 860, 1.1, { color: '#FF8A65', base: '#D84315' }); b.add('anemone', 900, 870, 1, { color: '#F06292' });
    b.add('brainCoral', 1200, 860, 1, { color: '#BA68C8' });
    b.add('fish', 900, 620, 0.9, { color: '#FFD23F', c2: '#FF8C42', flip: true });
    b.add('shell', 620, 880, 0.9, { color: '#FFE0B2' }); b.add('starfish', 1450, 880, 0.9, { color: '#FF7043' });
    bubblesField(b, [[640, 700], [1150, 700]]);
    b.spot(620, 130).spot(1180, 150).spot(1200, 640).spot(100, 460).spot(700, 560);
  } };

  S[19] = { name: 'Jardim das Tartarugas', build(b) {
    water(b, '#33C2C9', '#0E5E7A');
    rays(b, 0.12);
    farReef(b, '#0F6A7A', 0.4);
    seabed(b, 760, '#F2DFA8', '#D6BB7A');
    b.add('turtle', 420, 420, 1.2); b.add('turtle', 1150, 300, 0.9, { flip: true });
    b.add('anemone', 180, 820, 1.2); b.add('anemone', 700, 830, 1, { color: '#FFB74D', base: '#E65100' }); b.add('anemone', 1460, 820, 1.1, { color: '#BA68C8', base: '#6A1B9A' });
    b.add('fanCoral', 960, 800, 1.1, { color: '#FF6F91' }); b.add('coral', 1250, 800, 0.9, { color: '#FFD23F' });
    b.add('seahorse', 860, 560, 0.9, { color: '#F06292' });
    b.add('fish', 1400, 520, 0.9, { color: '#7B61FF', c2: '#D1C4FF', flip: true }); b.add('fish', 220, 230, 0.8, { color: '#FF8C42' });
    b.add('crab', 480, 880, 0.8);
    b.add('starfish', 1080, 880, 0.9, { color: '#E84A5F' }); b.add('shell', 1600 - 260, 880, 0.8, { noSpot: true });
    bubblesField(b, [[620, 300], [1300, 650]]);
    b.spot(760, 200).spot(1450, 180).spot(120, 560).spot(620, 640).spot(1000, 600);
    b.spot(300, 700).spot(1250, 600);
  } };

  S[20] = { name: 'Abismo Luminoso', build(b) {
    water(b, '#13235C', '#04081F');
    stars(b, 45, 20, 880);
    seabed(b, 800, '#2A2F5E', '#151836');
    b.add('lanternfish', 400, 380, 1.1); b.add('lanternfish', 1200, 520, 0.9, { flip: true });
    b.add('jellyfish', 800, 250, 1.1, { color: '#80DEEA' }); b.add('jellyfish', 1450, 260, 0.8, { color: '#F48FB1' });
    b.add('crystal', 200, 840, 1, { color: '#4DD0E1' }); b.add('crystal', 1000, 840, 1.1, { color: '#E040FB' });
    b.add('anemone', 620, 860, 1, { color: '#00E5FF', base: '#006064' }); b.add('anemone', 1380, 860, 1, { color: '#FF80AB', base: '#880E4F' });
    b.add('octopus', 820, 760, 0.8, { color: '#7E57C2' });
    b.add('submarine', 300, 620, 0.6);
    b.add('fish', 1100, 340, 0.7, { color: '#00E5FF', c2: '#B2EBF2' });
    b.raw('<circle cx="400" cy="294" r="160" fill="#FFF59D" opacity=".05"/><circle cx="1200" cy="446" r="140" fill="#FFF59D" opacity=".05"/>');
    b.spot(160, 200).spot(1500, 640).spot(600, 600).spot(1180, 720).spot(560, 160);
    b.spot(300, 480).spot(1000, 500).spot(1450, 420).spot(150, 860);
  } };

  /* =================== MUNDO 3 — CASTELO DOS DESAFIOS =================== */
  S[21] = { name: 'Portão do Castelo', build(b) {
    sky(b, '#8FB7FF', '#FFE6F2');
    b.add('cloud', 200, 130, 1); b.add('cloud', 1420, 110, 0.9); b.add('cloud', 820, 90, 0.6, { noSpot: true });
    hill(b, 'M0 600 Q400 500 800 580 Q1200 500 1600 590 V900 H0Z', '#9FD98F');
    b.add('castleWall', 800, 640, 1, { w: 920, h: 240 });
    b.add('tower', 340, 660, 1, { w: 170, h: 420, roof: '#E84A5F', flag: '#FFD23F' });
    b.add('tower', 1260, 660, 1, { w: 170, h: 420, roof: '#3B82F6', flag: '#FF6FA5' });
    b.add('tower', 800, 500, 0.8, { w: 160, h: 240, roof: '#7B61FF', flag: '#3DDC84' });
    b.add('gate', 800, 660, 1);
    b.add('moatWater', 800, 660, 1, { w: 1600, h: 90 });
    b.add('drawbridge', 800, 670, 1.1);
    ground(b, 760, '#7CCF6E', '#56A94A');
    b.add('banner', 560, 560, 0.9, { color: '#E84A5F', emblem: 'crown' }); b.add('banner', 1040, 560, 0.9, { color: '#3B82F6', emblem: 'star' });
    b.add('torch', 670, 560, 0.9); b.add('torch', 930, 560, 0.9);
    b.add('tree', 100, 820, 1, { noSpot: true }); b.add('bush', 1500, 840, 1);
    b.add('flagPole', 160, 820, 0.9, { color: '#7B61FF' });
    b.add('rock', 1200, 860, 0.8); b.add('flower', 420, 870, 1, { color: '#FF6FA5' });
    b.add('bird', 600, 230, 0.9); b.add('bird', 1050, 260, 0.8, { color: '#FFB400' });
    b.spot(1420, 520).spot(500, 240).spot(1500, 300).spot(960, 820).spot(640, 820);
  } };

  S[22] = { name: 'Jardim Real', build(b) {
    sky(b, '#9AD7FF', '#F3FFE9');
    b.add('cloud', 300, 120, 0.9); b.add('cloud', 1300, 140, 1);
    b.add('tower', 1430, 470, 0.6, { w: 140, h: 360, roof: '#E84A5F', noSpot: true });
    b.add('castleWall', 1200, 470, 0.6, { w: 600, h: 200, noSpot: true });
    hill(b, 'M0 500 Q400 430 800 480 Q1200 420 1600 480 V900 H0Z', '#A6DD95');
    ground(b, 600, '#8AD27A', '#5DAF50');
    b.raw('<path d="M650 900 L760 600 H840 L950 900Z" fill="#E9D6A8"/>');
    b.add('fountain', 800, 720, 1.1);
    b.add('hedge', 220, 700, 1); b.add('hedge', 1380, 700, 1); b.add('hedge', 470, 650, 0.8); b.add('hedge', 1130, 650, 0.8);
    b.add('topiary', 100, 860, 0.9); b.add('topiary', 1500, 860, 0.9);
    b.add('statue', 560, 860, 0.9); b.add('statue', 1040, 860, 0.9);
    b.add('flower', 330, 860, 1, { color: '#E84A5F' }); b.add('flower', 1270, 870, 1, { color: '#7B61FF' });
    b.add('tulip', 380, 880, 1, { color: '#FFB400' }); b.add('tulip', 1220, 880, 1, { color: '#FF6FA5' });
    b.add('butterfly', 620, 420, 0.9); b.add('butterfly', 1000, 380, 0.8, { color: '#4FC3F7', c2: '#FFD23F' });
    b.add('bee', 260, 480, 1); b.add('rabbit', 760, 880, 0.7);
    b.spot(800, 300).spot(420, 300).spot(1180, 260).spot(660, 560).spot(940, 560);
    b.spot(150, 560).spot(1450, 560).spot(800, 820);
  } };

  S[23] = { name: 'Salão do Trono', build(b) {
    wall(b, '#7E6FB0', '#4E4285');
    floor(b, 720, '#D9C08A', '#C4A66B');
    b.add('carpet', 800, 820, 1.6, { color: '#C62828' });
    b.add('pillar', 160, 720, 1, { h: 560 }); b.add('pillar', 1440, 720, 1, { h: 560 });
    b.add('archWindow', 420, 450, 1, { w: 120, h: 220, inside: '#9AD7FF' }); b.add('archWindow', 1180, 450, 1, { w: 120, h: 220, inside: '#9AD7FF' });
    b.add('throne', 800, 760, 1);
    b.add('banner', 600, 380, 0.9, { color: '#3B82F6', emblem: 'crown' }); b.add('banner', 1000, 380, 0.9, { color: '#3B82F6', emblem: 'crown' });
    b.add('torch', 290, 470, 0.9); b.add('torch', 1310, 470, 0.9);
    b.add('armor', 330, 850, 0.9); b.add('armor', 1270, 850, 0.9, { flip: true });
    b.add('crown', 800, 870, 0.8);
    b.add('chandelier', 800, 40, 0.9, { noSpot: true });
    b.add('shield', 560, 640, 0.7, { color: '#E84A5F' }); b.add('shield', 1040, 640, 0.7, { color: '#3DDC84' });
    vignette(b);
    b.spot(160, 260).spot(1440, 260).spot(580, 840).spot(1020, 840);
    b.spot(160, 450).spot(1440, 450).spot(420, 300).spot(1180, 300).spot(800, 170).spot(290, 640).spot(1310, 640).spot(470, 760).spot(1130, 760);
  } };

  S[24] = { name: 'Cozinha Real', build(b) {
    wall(b, '#F2C38B', '#C98B4F');
    floor(b, 700, '#B7835A', '#A06F4A');
    b.raw('<path d="M520 120 H1080 V560 H520Z" fill="#5D4037"/><path d="M560 200 H1040 V560 H560Z" fill="#2B1B14"/><path d="M500 100 H1100 V150 H500Z" fill="#8D6E63"/>');
    b.add('cauldron', 800, 560, 1.2);
    b.add('table', 800, 820, 1, { cloth: '#FFB400' });
    b.add('barrel', 180, 760, 1.1); b.add('barrel', 290, 790, 0.9); b.add('crate', 1420, 780, 1.1); b.add('crate', 1300, 800, 0.8);
    b.add('potions', 300, 350, 1); b.add('potions', 1300, 350, 1, { flip: true });
    b.raw('<rect x="190" y="350" width="220" height="12" fill="#8D6E63"/><rect x="1190" y="350" width="220" height="12" fill="#8D6E63"/>');
    b.add('cake', 1150, 690, 0.7);
    b.add('candle', 460, 700, 0.8);
    b.add('basket', 1500, 620, 0.7);
    b.add('cat', 400, 880, 0.7, { color: '#9E9E9E', dark: '#757575' });
    vignette(b, '#3E2723', 0.3);
    b.spot(300, 160).spot(1300, 160).spot(140, 520).spot(1470, 460).spot(800, 300);
    b.spot(420, 600).spot(1180, 580).spot(650, 250).spot(950, 250).spot(150, 850).spot(1520, 880).spot(620, 460).spot(980, 460);
  } };

  S[25] = { name: 'Torre do Mago', build(b) {
    wall(b, '#4A3B8F', '#231A55');
    floor(b, 730, '#6B5BA8', '#5A4B95');
    b.add('archWindow', 800, 480, 1.3, { w: 200, h: 320, inside: '#14204D', stars: true, frame: '#6B5BA8' });
    b.raw('<circle cx="860" cy="200" r="26" fill="#FFF6C9"/>');
    b.add('bookshelf', 220, 730, 1, { w: 240, h: 420, seed: 3 });
    b.add('telescope', 1200, 740, 1);
    b.add('globe', 1450, 760, 0.9);
    b.add('cauldron', 560, 820, 0.8);
    b.add('potions', 1000, 860, 0.9);
    b.add('desk', 1200, 880, 0.8, { noSpot: true });
    b.add('candle', 440, 640, 0.8, { noSpot: true });
    b.add('owl', 1450, 560, 0.8);
    b.add('crystal', 680, 860, 0.5, { color: '#E040FB' });
    stars(b, 18, 25, 700);
    vignette(b, '#000', 0.35);
    b.spot(560, 180).spot(1100, 220).spot(1450, 250).spot(800, 620).spot(400, 400).spot(1000, 560);
    b.spot(120, 800).spot(340, 300).spot(300, 560).spot(1300, 560).spot(1500, 880).spot(700, 720).spot(900, 820).spot(1150, 420).spot(160, 160);
  } };

  S[26] = { name: 'Sala do Tesouro', build(b) {
    wall(b, '#8A6E3F', '#4E3A1C');
    floor(b, 700, '#C9A15A', '#B08A45');
    b.raw('<g opacity=".9"><path d="M0 0 H1600 V90 Q800 160 0 90Z" fill="#3E2B12"/></g>');
    b.add('gems', 800, 820, 2);
    b.add('chest', 420, 800, 1.2, { open: true }); b.add('chest', 1200, 790, 1.1, { open: true });
    b.add('crown', 800, 690, 1.1);
    b.add('armor', 120, 820, 1); b.add('armor', 1480, 820, 1, { flip: true });
    b.add('shield', 360, 420, 0.9, { color: '#E84A5F' }); b.add('shield', 1240, 420, 0.9, { color: '#3B82F6' });
    b.add('torch', 600, 380, 0.9); b.add('torch', 1000, 380, 0.9);
    b.add('portrait', 800, 480, 1.1);
    b.add('barrel', 640, 880, 0.6); b.add('crate', 980, 890, 0.6);
    b.add('web', 0, 0, 1.4, { noSpot: true }); b.add('web', 1600, 0, 1.4, { flip: true, noSpot: true });
    vignette(b, '#000', 0.35);
    b.spot(200, 260).spot(1400, 260).spot(560, 600).spot(1040, 600).spot(260, 620).spot(1340, 620);
    b.spot(800, 300).spot(450, 240).spot(1150, 240).spot(120, 520).spot(1480, 520).spot(420, 880).spot(1200, 880).spot(680, 780).spot(920, 760);
  } };

  S[27] = { name: 'Salão de Banquete', build(b) {
    wall(b, '#A35A6E', '#5E2C46');
    floor(b, 690, '#7B4A33', '#6A3E2B');
    b.add('chandelier', 450, 40, 0.9); b.add('chandelier', 1150, 40, 0.9);
    b.add('banner', 200, 320, 0.9, { color: '#FFB400', emblem: 'shield' }); b.add('banner', 800, 300, 1, { color: '#3DDC84', emblem: 'crown' }); b.add('banner', 1400, 320, 0.9, { color: '#FFB400', emblem: 'shield' });
    b.add('archWindow', 500, 520, 0.8, { w: 120, h: 220, inside: '#FFCF8B' }); b.add('archWindow', 1100, 520, 0.8, { w: 120, h: 220, inside: '#FFCF8B' });
    b.add('table', 500, 820, 1, { cloth: '#FFFFFF' }); b.add('table', 1100, 820, 1, { cloth: '#FFFFFF' });
    b.add('candle', 800, 700, 0.9);
    b.add('barrel', 90, 820, 1); b.add('crate', 1510, 840, 0.9);
    b.add('portrait', 800, 560, 0.8, { bg: '#FFCC80', robe: '#E84A5F' });
    b.add('cat', 300, 890, 0.6, { color: '#424242', dark: '#212121' });
    vignette(b, '#2B0F1E', 0.35);
    b.spot(300, 560).spot(1300, 560).spot(800, 860).spot(120, 120).spot(1480, 120);
    b.spot(300, 720).spot(1300, 720).spot(650, 420).spot(950, 420).spot(500, 200).spot(1100, 200).spot(150, 450).spot(1450, 450);
  } };

  S[28] = { name: 'Ninho do Dragão', build(b) {
    wall(b, '#6F4E37', '#3A2617');
    b.raw('<path d="M0 0 H1600 V120 Q1450 200 1300 130 Q1150 220 1000 140 Q850 230 700 140 Q550 220 400 130 Q250 210 0 140Z" fill="#4A3020"/>');
    seabed(b, 720, '#9C7A54', '#6E5236');
    b.add('dragon', 700, 800, 1.3, { color: '#66BB6A' });
    b.add('gems', 1250, 820, 1.4); b.add('chest', 1450, 860, 0.9, { open: true });
    b.add('torch', 180, 420, 1); b.add('torch', 1420, 420, 1);
    b.add('crystal', 160, 820, 1, { color: '#FF8A65' }); b.add('crystal', 1080, 860, 0.7, { color: '#80DEEA' });
    b.add('rock', 400, 880, 1, { color: '#8D6E63', dark: '#6D4C41' }); b.add('rock', 1500, 700, 0.8, { color: '#8D6E63', dark: '#6D4C41' });
    b.add('shield', 1000, 600, 0.8, { color: '#FFB400' });
    b.add('bat', 500, 250, 1); b.add('bat', 1100, 200, 0.9); b.add('bat', 900, 320, 0.7);
    b.add('crown', 300, 720, 0.8);
    vignette(b, '#000', 0.35);
    b.spot(300, 300).spot(1300, 300).spot(560, 520).spot(1280, 620).spot(760, 220);
    b.spot(100, 560).spot(1500, 560).spot(900, 480).spot(200, 200).spot(1400, 180).spot(650, 320).spot(1000, 780).spot(450, 700).spot(1150, 700);
  } };

  S[29] = { name: 'Telhados ao Luar', build(b) {
    b.raw('');
    sky(b, '#121746', '#4C3F8F');
    stars(b, 50, 29, 520);
    b.add('moon', 1300, 160, 1.1);
    b.add('cloud', 400, 200, 0.8, { color: '#6A5FB0', op: 0.6 });
    b.add('tower', 180, 900, 1, { w: 160, h: 520, roof: '#5E35B1', win: '#FFD66B', flag: '#FFD23F' });
    b.add('tower', 1460, 900, 1, { w: 150, h: 460, roof: '#3949AB', win: '#FFD66B', flag: '#FF6FA5' });
    b.add('tower', 820, 900, 1, { w: 190, h: 360, roof: '#7E57C2', win: '#FFD66B', flag: '#3DDC84' });
    b.add('roofTop', 500, 900, 1.2, { color: '#4527A0' }); b.add('roofTop', 1150, 900, 1.1, { color: '#283593' });
    b.add('castleWall', 500, 790, 0.6, { w: 400, h: 120, color: '#5C5296', noSpot: true });
    b.add('bat', 620, 300, 1); b.add('bat', 1000, 380, 0.8); b.add('bat', 360, 420, 0.7);
    b.add('owl', 1150, 780, 0.8);
    b.add('telescope', 500, 770, 0.6);
    b.add('flagPole', 1000, 800, 0.7, { color: '#FFB400' });
    [[700, 560], [1250, 600]].forEach(([x, y]) => b.add('firefly', x, y, 1));
    b.spot(620, 160).spot(1000, 200).spot(300, 180).spot(1500, 340).spot(650, 640).spot(1000, 560);
    b.spot(180, 600).spot(1460, 620).spot(820, 720).spot(350, 600).spot(1300, 450).spot(800, 330).spot(120, 320).spot(1250, 790);
  } };

  S[30] = { name: 'Grande Biblioteca', build(b) {
    wall(b, '#5C3D6E', '#2E1E3B', false);
    floor(b, 740, '#8D6E63', '#7A5C52');
    b.add('bookshelf', 160, 740, 1, { w: 260, h: 600, seed: 1 });
    b.add('bookshelf', 470, 740, 1, { w: 260, h: 500, seed: 2 });
    b.add('bookshelf', 1130, 740, 1, { w: 260, h: 500, seed: 4 });
    b.add('bookshelf', 1440, 740, 1, { w: 260, h: 600, seed: 5 });
    b.add('archWindow', 800, 520, 1.1, { w: 180, h: 300, inside: '#FFD9A0' });
    b.add('chandelier', 800, 30, 0.8, { noSpot: true });
    b.add('desk', 800, 880, 1);
    b.add('globe', 1010, 760, 0.8);
    b.add('candle', 640, 780, 0.8);
    b.add('stairs', 300, 900, 0.6, { noSpot: true });
    b.add('owl', 800, 220, 0.7, { noSpot: true }); b.spot(870, 300);
    b.add('cat', 1300, 890, 0.6, { color: '#FFA94D' });
    vignette(b, '#000', 0.3);
    b.spot(800, 640).spot(620, 160).spot(980, 160).spot(560, 820).spot(1060, 860);
    b.spot(160, 560).spot(160, 330).spot(470, 480).spot(1130, 480).spot(1440, 330).spot(1440, 560).spot(300, 850).spot(1300, 780).spot(800, 450);
    b.spot(640, 690).spot(960, 690).spot(320, 200).spot(1280, 200).spot(1520, 850).spot(320, 680).spot(1280, 640);
  } };

  CDL.SCENES = S;
  /* =================== BAGUNÇA: muitos objetos espalhados (estilo "Onde está?") =================== */
  const FLOWERS = ['#FF6FA5', '#FFD23F', '#7B61FF', '#E84A5F', '#4FC3F7', '#FF8C42', '#FFFFFF'];
  const FISH = [['#FF8C42', '#FFD23F'], ['#7B61FF', '#B3A6FF'], ['#FF5A5F', '#FFE066'], ['#4DD0E1', '#E0F7FA'], ['#3DDC84', '#C8F7DC'], ['#F06292', '#FFD1DC']];
  const LEAVES = ['#4CAF50', '#66BB6A', '#8BC34A', '#FFB300', '#E65100', '#2E7D32'];
  const CORAL = ['#FF6F91', '#B388FF', '#FFB74D', '#4DD0E1', '#FFD23F', '#FF8A65'];
  const STONE = ['#9AA5B1', '#B0A090', '#8D9AAE', '#C2B8A3'];
  const anyOf = (arr) => (r) => arr[Math.floor(r() * arr.length)];
  const col = anyOf(FLOWERS), leafC = anyOf(LEAVES), coralC = anyOf(CORAL), stoneC = anyOf(STONE);

  // [nome, tipo (ground = no chão | float = no ar/água | wall = na parede), escala mín, escala máx, opções]
  const CLUTTER = {
    1: [
      ['flower', 'ground', 0.5, 0.9, (r) => ({ color: col(r) })], ['flower', 'ground', 0.5, 0.9, (r) => ({ color: col(r) })],
      ['tulip', 'ground', 0.6, 1, (r) => ({ color: col(r) })], ['tulip', 'ground', 0.6, 1, (r) => ({ color: col(r) })],
      ['mushroom', 'ground', 0.3, 0.55, (r) => ({ color: col(r) })], ['bush', 'ground', 0.35, 0.6, (r) => ({ c1: leafC(r), c2: '#3B8E3F', berry: r() < 0.4 ? '#E84A5F' : '' })],
      ['rock', 'ground', 0.3, 0.55, (r) => ({ color: stoneC(r), moss: r() < 0.3 })], ['grass', 'ground', 0.8, 1.4], ['grass', 'ground', 0.8, 1.4],
      ['snail', 'ground', 0.4, 0.6], ['rabbit', 'ground', 0.4, 0.6], ['squirrel', 'ground', 0.4, 0.6], ['frog', 'ground', 0.4, 0.6],
      ['ball', 'ground', 0.35, 0.55, (r) => ({ color: col(r) })], ['basket', 'ground', 0.35, 0.5], ['apple', 'ground', 0.8, 1.2], ['pebble', 'ground', 0.7, 1.3, (r) => ({ color: stoneC(r) })],
      ['leaf', 'ground', 0.8, 1.4, (r) => ({ color: leafC(r), rot: r() * 360 })], ['log', 'ground', 0.3, 0.45], ['backpack', 'ground', 0.4, 0.55],
      ['tree', 'ground', 0.3, 0.5, (r) => ({ c1: leafC(r), c2: '#3E9B4F', fruit: r() < 0.4 ? '#E53935' : '' })], ['pine', 'ground', 0.3, 0.5], ['owl', 'ground', 0.5, 0.7],
      ['butterfly', 'float', 0.5, 0.9, (r) => ({ color: col(r), c2: col(r) })], ['bee', 'float', 0.6, 1], ['bird', 'float', 0.5, 0.8, (r) => ({ color: col(r) })],
      ['leaf', 'float', 0.8, 1.3, (r) => ({ color: leafC(r), rot: r() * 360 })], ['firefly', 'float', 0.8, 1.2], ['kite', 'float', 0.35, 0.5, (r) => ({ color: col(r) })]
    ],
    2: [
      ['fish', 'float', 0.35, 0.7, (r) => { const f = anyOf(FISH)(r); return { color: f[0], c2: f[1], flip: r() < 0.5 }; }],
      ['fish', 'float', 0.35, 0.7, (r) => { const f = anyOf(FISH)(r); return { color: f[0], c2: f[1], flip: r() < 0.5 }; }],
      ['jellyfish', 'float', 0.35, 0.6, (r) => ({ color: coralC(r) })], ['bubbleCluster', 'float', 0.8, 1.4], ['bubbles', 'float', 0.8, 1.3],
      ['seahorse', 'float', 0.35, 0.55, (r) => ({ color: coralC(r) })], ['turtle', 'float', 0.3, 0.45],
      ['shell', 'ground', 0.5, 0.9, (r) => ({ color: coralC(r) })], ['starfish', 'ground', 0.6, 1, (r) => ({ color: coralC(r) })],
      ['coral', 'ground', 0.35, 0.6, (r) => ({ color: coralC(r) })], ['fanCoral', 'ground', 0.35, 0.6, (r) => ({ color: coralC(r) })],
      ['brainCoral', 'ground', 0.35, 0.6, (r) => ({ color: coralC(r) })], ['anemone', 'ground', 0.45, 0.75, (r) => ({ color: coralC(r) })],
      ['weed', 'ground', 0.8, 1.4, (r) => ({ color: r() < 0.5 ? '#2E9E6A' : '#3FBF7F' })], ['crab', 'ground', 0.35, 0.55], ['pebble', 'ground', 0.7, 1.2, (r) => ({ color: stoneC(r) })],
      ['coin', 'ground', 0.8, 1.2], ['crystal', 'ground', 0.25, 0.4, (r) => ({ color: coralC(r) })], ['chest', 'ground', 0.3, 0.4], ['anchor', 'ground', 0.25, 0.35]
    ],
    3: [
      ['barrel', 'ground', 0.35, 0.55], ['crate', 'ground', 0.35, 0.55], ['candle', 'ground', 0.4, 0.7, (r) => ({ color: r() < 0.5 ? '#FFF3E0' : '#F8BBD0' })],
      ['bookStack', 'ground', 0.6, 0.9, (r) => ({ k: Math.floor(r() * 6) })], ['bookStack', 'ground', 0.6, 0.9, (r) => ({ k: Math.floor(r() * 6) })],
      ['coin', 'ground', 0.8, 1.2], ['coin', 'ground', 0.8, 1.2], ['key', 'ground', 0.8, 1.1], ['crown', 'ground', 0.45, 0.65], ['gems', 'ground', 0.4, 0.6],
      ['potions', 'ground', 0.4, 0.55], ['cat', 'ground', 0.35, 0.45, (r) => ({ color: r() < 0.5 ? '#9E9E9E' : '#FFA94D' })], ['pebble', 'ground', 0.7, 1.2, (r) => ({ color: stoneC(r) })],
      ['shield', 'wall', 0.4, 0.6, (r) => ({ color: col(r) })], ['portrait', 'wall', 0.35, 0.5, (r) => ({ bg: col(r), robe: col(r) })],
      ['torch', 'wall', 0.5, 0.7], ['banner', 'wall', 0.35, 0.5, (r) => ({ color: col(r), emblem: ['crown', 'star', 'shield'][Math.floor(r() * 3)] })],
      ['web', 'wall', 0.5, 0.8], ['bat', 'float', 0.5, 0.8], ['bat', 'float', 0.5, 0.8], ['butterfly', 'float', 0.4, 0.6, (r) => ({ color: col(r), c2: col(r) })]
    ]
  };
  const GROUND_Y = { 1: 540, 2: 760, 3: 730, 8: 600, 13: 640, 14: 600, 21: 780, 22: 640, 29: 790 };

  function addClutter(b, n, seed) {
    const world = n <= 10 ? 1 : n <= 20 ? 2 : 3;
    const i = (n - 1) % 10;
    const count = [0, 62, 70, 88][world] + i * 4;
    const r = CDL.rng(n * 3571 + (seed || 0) * 7919 + 99);
    const list = CLUTTER[world];
    const gy = GROUND_Y[n] || GROUND_Y[world];
    const items = [];
    for (let k = 0; k < count; k++) {
      const [name, kind, s0, s1, optFn] = list[Math.floor(r() * list.length)];
      const s = s0 + r() * (s1 - s0);
      const x = 40 + r() * 1520;
      const y = kind === 'ground' ? gy + r() * (880 - gy) : kind === 'wall' ? 130 + r() * (gy - 220) : 90 + r() * (gy - 150);
      const o = optFn ? optFn(r) : {};
      if (o.flip === undefined) o.flip = r() < 0.5;
      items.push({ name, x, y, s, o });
    }
    items.sort((a, c) => a.y - c.y); // profundidade: o que está mais embaixo fica na frente
    let svg = '';
    for (const it of items) {
      svg += CDL.place(it.name, Math.round(it.x), Math.round(it.y), +it.s.toFixed(2), it.o);
      b.spots.push({ x: it.x, y: it.y - 30 * it.s - 10 });
    }
    b.raw(`<g class="clutter">${svg}</g>`);
  }

  CDL.buildScene = function (n, prefix = 's', opts = {}) {
    const def = S[n];
    const b = new Builder();
    def.build(b);
    if (opts.clutter) addClutter(b, n, opts.seed);
    // ids exclusivos por cenário (evita conflito de gradientes entre SVGs)
    const svg = b.svg().replace(/id="([\w-]+)"/g, `id="${prefix}${n}_$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${prefix}${n}_$1)`);
    return { name: def.name, svg, spots: b.spots };
  };
  CDL.SCENE_W = W; CDL.SCENE_H = H;
})();
