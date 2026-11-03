/* =========================================================
   CAÇADORES DE LETRAS — Biblioteca de ilustrações (SVG)
   Cada primitiva desenha em coordenadas locais (origem na base
   do objeto, ou no centro para objetos flutuantes) e declara
   "esconderijos" (spots) onde letras podem ser colocadas.
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});

  const P = {};
  const shadow = (rx = 40, ry = 8) => `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="#000" opacity=".13"/>`;

  /* ---------------------- NATUREZA ---------------------- */
  P.tree = {
    spots: [[0, -135]],
    draw: (o) => {
      const a = o.c1 || '#5DBB63', b = o.c2 || '#3E9B4F', t = o.trunk || '#8B5A2B';
      let fr = '';
      if (o.fruit) fr = [[-46, -112], [30, -140], [8, -98], [54, -96], [-22, -160], [-60, -88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${o.fruit}"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="#fff" opacity=".5"/>`).join('');
      return `${shadow(70, 12)}<path d="M-16 0 C-10 -40 -12 -70 -10 -95 L10 -95 C12 -70 10 -40 16 0Z" fill="${t}"/>
      <path d="M-4 -58 L-30 -84" stroke="${t}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="-52" cy="-104" r="46" fill="${b}"/><circle cx="52" cy="-104" r="46" fill="${b}"/>
      <circle cx="0" cy="-152" r="60" fill="${a}"/><circle cx="-34" cy="-118" r="45" fill="${a}"/><circle cx="34" cy="-120" r="45" fill="${a}"/>
      <ellipse cx="-24" cy="-176" rx="24" ry="14" fill="#fff" opacity=".22"/>${fr}`;
    }
  };
  P.pine = {
    spots: [[0, -110]],
    draw: (o) => {
      const a = o.c1 || '#2F8F5B', b = o.c2 || '#24744A';
      return `${shadow(55, 10)}<rect x="-10" y="-34" width="20" height="34" fill="#7A4E2A"/>
      <path d="M0 -230 L52 -150 L32 -150 L68 -88 L42 -88 L80 -30 L-80 -30 L-42 -88 L-68 -88 L-32 -150 L-52 -150Z" fill="${a}"/>
      <path d="M0 -230 L52 -150 L32 -150 L68 -88 L42 -88 L80 -30 L0 -30Z" fill="${b}" opacity=".55"/>
      ${o.snow ? '<path d="M0 -230 L22 -196 L10 -190 L0 -200 L-10 -190 L-22 -196Z" fill="#fff"/>' : ''}`;
    }
  };
  P.bush = {
    spots: [[0, -45]],
    draw: (o) => {
      const a = o.c1 || '#4CAF50', b = o.c2 || '#3B8E3F';
      let berries = '';
      if (o.berry) berries = [[-30, -40], [10, -60], [35, -30], [-8, -28]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${o.berry}"/>`).join('');
      return `${shadow(70, 10)}<circle cx="-38" cy="-30" r="34" fill="${b}"/><circle cx="38" cy="-30" r="34" fill="${b}"/><circle cx="0" cy="-48" r="44" fill="${a}"/><ellipse cx="-14" cy="-70" rx="14" ry="8" fill="#fff" opacity=".2"/>${berries}`;
    }
  };
  P.flower = {
    spots: [[0, -62]],
    draw: (o) => {
      const c = o.color || '#FF6FA5', h = o.h || 60;
      const petals = [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-13" rx="9" ry="14" fill="${c}" transform="rotate(${a})"/>`).join('');
      return `<path d="M0 0 Q-6 ${-h / 2} 0 ${-h}" stroke="#3E9B4F" stroke-width="5" fill="none"/>
      <ellipse cx="-12" cy="${-h / 2}" rx="11" ry="5" fill="#4CAF50" transform="rotate(-30 -12 ${-h / 2})"/>
      <g transform="translate(0 ${-h})">${petals}<circle r="8" fill="#FFD23F"/></g>`;
    }
  };
  P.tulip = {
    spots: [],
    draw: (o) => {
      const c = o.color || '#FF5A5F';
      return `<path d="M0 0 L0 -50" stroke="#3E9B4F" stroke-width="5"/><path d="M-14 -50 L-14 -72 L-7 -64 L0 -76 L7 -64 L14 -72 L14 -50 Q0 -40 -14 -50Z" fill="${c}"/>`;
    }
  };
  P.grass = {
    spots: [],
    draw: (o) => {
      const c = o.color || '#3E9B4F';
      return `<path d="M-20 0 Q-18 -22 -26 -34 Q-10 -18 -8 0Z M-6 0 Q-2 -30 4 -44 Q6 -20 6 0Z M8 0 Q14 -20 26 -30 Q18 -14 20 0Z" fill="${c}"/>`;
    }
  };
  P.mushroom = {
    spots: [[0, -62]],
    draw: (o) => {
      const c = o.color || '#E84A5F';
      return `${shadow(40, 7)}<path d="M-16 0 Q-18 -30 -12 -44 L12 -44 Q18 -30 16 0Z" fill="#FFF3DA"/>
      <path d="M-54 -40 Q-50 -100 0 -102 Q50 -100 54 -40 Q0 -28 -54 -40Z" fill="${c}"/>
      <circle cx="-26" cy="-70" r="9" fill="#fff"/><circle cx="12" cy="-82" r="11" fill="#fff"/><circle cx="32" cy="-56" r="7" fill="#fff"/>`;
    }
  };
  P.mushroomHouse = {
    spots: [[0, -170], [0, -62]],
    draw: (o) => {
      const c = o.color || '#E84A5F';
      return `${shadow(90, 12)}<path d="M-55 0 Q-60 -60 -48 -110 L48 -110 Q60 -60 55 0Z" fill="#FFF0D4"/>
      <path d="M-14 0 L-14 -46 Q0 -60 14 -46 L14 0Z" fill="#A0643A"/><circle cx="8" cy="-24" r="3" fill="#FFD23F"/>
      <circle cx="-30" cy="-80" r="13" fill="#7EC8E3" stroke="#A0643A" stroke-width="5"/>
      <path d="M-115 -100 Q-100 -230 0 -232 Q100 -230 115 -100 Q0 -80 -115 -100Z" fill="${c}"/>
      <circle cx="-56" cy="-150" r="16" fill="#fff"/><circle cx="20" cy="-195" r="18" fill="#fff"/><circle cx="66" cy="-130" r="12" fill="#fff"/>`;
    }
  };
  P.rock = {
    spots: [[0, -38]],
    draw: (o) => {
      const c = o.color || '#9AA5B1', d = o.dark || '#7B8794';
      return `${shadow(62, 9)}<path d="M-62 0 Q-70 -40 -36 -62 Q-6 -84 28 -66 Q66 -50 62 0Z" fill="${c}"/>
      <path d="M10 -62 Q50 -50 54 -4 L62 0 Q66 -50 28 -66Z" fill="${d}"/><ellipse cx="-24" cy="-48" rx="14" ry="7" fill="#fff" opacity=".25"/>
      ${o.moss ? '<path d="M-60 -24 Q-40 -40 -10 -36 Q-30 -20 -62 -12Z" fill="#6BBF59"/>' : ''}`;
    }
  };
  P.cloud = {
    spots: [[0, -8]],
    draw: (o) => {
      const c = o.color || '#FFFFFF';
      return `<g opacity="${o.op || 0.95}"><ellipse cx="0" cy="0" rx="90" ry="34" fill="${c}"/><circle cx="-36" cy="-18" r="34" fill="${c}"/><circle cx="18" cy="-30" r="42" fill="${c}"/><circle cx="56" cy="-8" r="28" fill="${c}"/></g>`;
    }
  };
  P.sun = {
    spots: [[0, 0]],
    draw: (o) => {
      const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-6" y="-118" width="12" height="34" rx="6" fill="#FFC93C" transform="rotate(${i * 30})"/>`).join('');
      return `<g class="anim-spin">${rays}</g><circle r="74" fill="#FFD93D"/><circle cx="-22" cy="-24" r="18" fill="#fff" opacity=".3"/>`;
    }
  };
  P.moon = {
    spots: [[-8, 0]],
    draw: () => `<circle r="96" fill="#FFF6C9" opacity=".12"/><path d="M20 -66 A70 70 0 1 0 60 36 A58 58 0 1 1 20 -66Z" fill="#FFF6C9"/><circle cx="-34" cy="12" r="9" fill="#EADFA8"/><circle cx="-14" cy="40" r="6" fill="#EADFA8"/>`
  };
  P.fullmoon = {
    spots: [[0, 0]],
    draw: () => `<circle r="86" fill="#FFF6C9" opacity=".25"/><circle r="70" fill="#FFF6C9"/><circle cx="-22" cy="-14" r="12" fill="#EADFA8"/><circle cx="20" cy="18" r="16" fill="#EADFA8"/><circle cx="18" cy="-30" r="7" fill="#EADFA8"/>`
  };
  P.star = {
    spots: [],
    draw: (o) => `<path class="anim-twinkle" d="M0 -14 L4 -4 L14 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-14 -4 L-4 -4Z" fill="${o.color || '#FFF3B0'}"/>`
  };
  P.house = {
    spots: [[-48, -92], [0, -205]],
    draw: (o) => {
      const w = o.wall || '#FFE0A3', r = o.roof || '#E84A5F', d = o.door || '#7B4B2A';
      return `${shadow(120, 12)}<rect x="-95" y="-150" width="190" height="150" fill="${w}"/>
      <rect x="-95" y="-150" width="190" height="14" fill="#000" opacity=".06"/>
      <path d="M-120 -146 L0 -250 L120 -146Z" fill="${r}"/><path d="M0 -250 L120 -146 L60 -146Z" fill="#000" opacity=".1"/>
      <rect x="50" y="-238" width="28" height="56" fill="#B35C44"/>
      <rect x="-78" y="-122" width="60" height="58" rx="6" fill="#8FD3FF" stroke="#fff" stroke-width="7"/>
      <path d="M-48 -122 V-64 M-78 -93 H-18" stroke="#fff" stroke-width="5"/>
      <path d="M22 0 V-92 Q52 -116 82 -92 V0Z" fill="${d}"/><circle cx="70" cy="-44" r="5" fill="#FFD23F"/>
      <rect x="-88" y="-60" width="80" height="14" rx="5" fill="#8B5A2B"/><circle cx="-74" cy="-62" r="8" fill="#FF6FA5"/><circle cx="-54" cy="-64" r="8" fill="#FFD23F"/><circle cx="-32" cy="-62" r="8" fill="#FF6FA5"/>`;
    }
  };
  P.cabin = {
    spots: [[-50, -96], [0, -215]],
    draw: (o) => {
      const logs = Array.from({ length: 7 }, (_, i) => `<rect x="-110" y="${-20 * (i + 1)}" width="220" height="18" rx="9" fill="${i % 2 ? '#9C6236' : '#A86B3C'}"/>`).join('');
      const glow = o.glow ? '#FFD66B' : '#8FD3FF';
      return `${shadow(130, 12)}${logs}<path d="M-135 -136 L0 -250 L135 -136Z" fill="${o.roof || '#5B3A29'}"/><path d="M-135 -136 L0 -250 L0 -136Z" fill="#fff" opacity=".07"/>
      <rect x="-82" y="-118" width="64" height="54" rx="4" fill="${glow}" stroke="#5B3A29" stroke-width="7"/><path d="M-50 -118 V-64" stroke="#5B3A29" stroke-width="5"/>
      ${o.glow ? '<circle cx="-50" cy="-91" r="40" fill="#FFD66B" opacity=".25"/>' : ''}
      <rect x="22" y="-104" width="58" height="104" rx="6" fill="#5B3A29"/><circle cx="68" cy="-50" r="5" fill="#FFD23F"/>`;
    }
  };
  P.fence = {
    spots: [],
    draw: (o) => {
      const n = o.n || 6, c = o.color || '#FFFFFF';
      let s = `<rect x="0" y="-52" width="${n * 40}" height="10" fill="${c}"/><rect x="0" y="-26" width="${n * 40}" height="10" fill="${c}"/>`;
      for (let i = 0; i <= n; i++) s += `<path d="M${i * 40 - 8} 0 V-62 L${i * 40} -74 L${i * 40 + 8} -62 V0Z" fill="${c}" stroke="#E2D5C3" stroke-width="2"/>`;
      return s;
    }
  };
  P.signpost = {
    spots: [[0, -96]],
    draw: (o) => `${shadow(30, 6)}<rect x="-6" y="-120" width="12" height="120" fill="#8B5A2B"/><path d="M-60 -120 H50 L70 -100 L50 -80 H-60Z" fill="#C98B4F" stroke="#8B5A2B" stroke-width="4"/>`
  };
  P.pond = {
    spots: [[0, -4]],
    draw: (o) => {
      const rx = o.rx || 220, ry = o.ry || 60;
      return `<ellipse rx="${rx + 14}" ry="${ry + 10}" fill="#8BC34A" opacity=".6"/><ellipse rx="${rx}" ry="${ry}" fill="#4FC3F7"/><ellipse rx="${rx * 0.8}" ry="${ry * 0.65}" fill="#81D4FA"/>
      <path d="M${-rx * 0.5} ${-ry * 0.2} q20 -8 40 0 M${rx * 0.1} ${ry * 0.25} q20 -8 40 0" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>`;
    }
  };
  P.lilypad = {
    spots: [[0, -6]],
    draw: (o) => `<path d="M0 0 m-38 0 a38 16 0 1 0 76 0 a38 16 0 1 0 -76 0Z" fill="#43A047"/><path d="M0 0 L36 -6 L34 4Z" fill="#81D4FA"/>${o.flower ? '<g transform="translate(-6 -8)"><ellipse cx="-8" cy="0" rx="6" ry="10" fill="#F8BBD0" transform="rotate(-30)"/><ellipse cx="8" cy="0" rx="6" ry="10" fill="#F8BBD0" transform="rotate(30)"/><ellipse cx="0" cy="-4" rx="6" ry="11" fill="#F48FB1"/></g>' : ''}`
  };
  P.reed = {
    spots: [],
    draw: () => `<path d="M-10 0 Q-12 -60 -16 -110 M4 0 Q6 -70 10 -130 M16 0 Q22 -40 30 -80" stroke="#558B2F" stroke-width="5" fill="none"/><rect x="-21" y="-140" width="11" height="36" rx="5" fill="#8D5524"/><rect x="5" y="-160" width="11" height="36" rx="5" fill="#8D5524"/>`
  };
  P.log = {
    spots: [[0, -30]],
    draw: () => `${shadow(80, 8)}<rect x="-80" y="-44" width="160" height="44" rx="22" fill="#9C6236"/><ellipse cx="80" cy="-22" rx="14" ry="22" fill="#D7A86E"/><ellipse cx="80" cy="-22" rx="7" ry="12" fill="none" stroke="#9C6236" stroke-width="3"/><path d="M-50 -30 H20 M-30 -14 H40" stroke="#7A4A26" stroke-width="3"/>`
  };
  P.hollowLog = {
    spots: [[-30, -42]],
    draw: () => `${shadow(100, 10)}<rect x="-100" y="-72" width="200" height="72" rx="30" fill="#8D5524"/><ellipse cx="100" cy="-36" rx="22" ry="36" fill="#D7A86E"/><ellipse cx="100" cy="-36" rx="14" ry="26" fill="#3E2412"/><path d="M-70 -54 H30 M-50 -24 H60" stroke="#6D3F1A" stroke-width="4"/><path d="M-80 -70 Q-60 -90 -40 -72" fill="#6BBF59"/>`
  };

  /* ---------------------- ANIMAIS (FLORESTA) ---------------------- */
  P.cat = {
    spots: [[86, -60]],
    draw: (o) => {
      const c = o.color || '#FFA94D', d = o.dark || '#E8892B';
      return `${shadow(46, 8)}<path d="M30 -10 Q80 -10 70 -60" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round" class="anim-tail"/>
      <ellipse cx="0" cy="-34" rx="38" ry="36" fill="${c}"/><ellipse cx="0" cy="-26" rx="22" ry="22" fill="#FFF3E0"/>
      <circle cx="0" cy="-92" r="34" fill="${c}"/><path d="M-30 -110 L-26 -142 L-6 -120Z M30 -110 L26 -142 L6 -120Z" fill="${c}"/><path d="M-25 -116 L-23 -134 L-12 -121Z M25 -116 L23 -134 L12 -121Z" fill="#FFB3C6"/>
      <path d="M-18 -98 h10 M8 -98 h10" stroke="#3B2A20" stroke-width="5" stroke-linecap="round"/>
      <path d="M-4 -84 h8 l-4 5z" fill="#FF6F91"/><path d="M-30 -80 h-18 M-30 -74 h-16 M30 -80 h18 M30 -74 h16" stroke="#3B2A20" stroke-width="2"/>
      <path d="M-14 -112 l6 8 M0 -116 v8 M14 -112 l-6 8" stroke="${d}" stroke-width="4" stroke-linecap="round"/>`;
    }
  };
  P.duck = {
    spots: [[70, -70]],
    draw: (o) => {
      const c = o.color || '#FFE066';
      return `<ellipse cx="0" cy="-26" rx="46" ry="28" fill="${c}"/><path d="M-46 -30 Q-66 -46 -50 -16Z" fill="${c}"/><path d="M-10 -36 Q10 -50 26 -30 Q6 -22 -10 -36Z" fill="#FFD23F" opacity=".7"/>
      <circle cx="26" cy="-64" r="24" fill="${c}"/><path d="M46 -66 L70 -60 L46 -52Z" fill="#FF8C42"/><circle cx="32" cy="-70" r="4" fill="#222"/><circle cx="33" cy="-71" r="1.5" fill="#fff"/>
      ${o.water ? '<path d="M-60 -6 q15 -8 30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>' : ''}`;
    }
  };
  P.frog = {
    spots: [[64, -50]],
    draw: (o) => {
      const c = o.color || '#66BB6A';
      return `${shadow(40, 7)}<ellipse cx="0" cy="-26" rx="40" ry="28" fill="${c}"/><ellipse cx="0" cy="-20" rx="24" ry="16" fill="#C5E1A5"/>
      <circle cx="-20" cy="-54" r="15" fill="${c}"/><circle cx="20" cy="-54" r="15" fill="${c}"/><circle cx="-20" cy="-56" r="8" fill="#fff"/><circle cx="20" cy="-56" r="8" fill="#fff"/><circle cx="-18" cy="-56" r="4" fill="#222"/><circle cx="22" cy="-56" r="4" fill="#222"/>
      <path d="M-16 -34 Q0 -24 16 -34" stroke="#2E7D32" stroke-width="3" fill="none"/><circle cx="-26" cy="-38" r="5" fill="#FF8A80" opacity=".6"/><circle cx="26" cy="-38" r="5" fill="#FF8A80" opacity=".6"/>
      <ellipse cx="-34" cy="-4" rx="16" ry="6" fill="${c}"/><ellipse cx="34" cy="-4" rx="16" ry="6" fill="${c}"/>`;
    }
  };
  P.owl = {
    spots: [[0, -150]],
    draw: () => `<ellipse cx="0" cy="-40" rx="32" ry="40" fill="#8D6E63"/><ellipse cx="0" cy="-30" rx="20" ry="26" fill="#D7CCC8"/>
      <path d="M-30 -70 L-26 -92 L-10 -76Z M30 -70 L26 -92 L10 -76Z" fill="#8D6E63"/><circle cx="-13" cy="-62" r="12" fill="#fff"/><circle cx="13" cy="-62" r="12" fill="#fff"/>
      <circle cx="-13" cy="-62" r="6" fill="#222" class="anim-blink"/><circle cx="13" cy="-62" r="6" fill="#222" class="anim-blink"/><path d="M-5 -50 L5 -50 L0 -42Z" fill="#FFB300"/>
      <path d="M-14 -4 v6 M-8 -4 v6 M8 -4 v6 M14 -4 v6" stroke="#FFB300" stroke-width="4" stroke-linecap="round"/>`
  };
  P.bird = {
    spots: [],
    draw: (o) => {
      const c = o.color || '#4FC3F7';
      return `<g class="anim-bob"><ellipse cx="0" cy="0" rx="22" ry="16" fill="${c}"/><circle cx="16" cy="-12" r="11" fill="${c}"/><path d="M26 -12 L36 -9 L26 -6Z" fill="#FFB300"/><circle cx="19" cy="-14" r="2.6" fill="#222"/><path d="M-6 -4 Q-2 -26 -26 -20Z" fill="#fff" opacity=".7" class="anim-flap"/><path d="M-20 2 L-34 -4 L-32 8Z" fill="${c}"/></g>`;
    }
  };
  P.butterfly = {
    spots: [],
    draw: (o) => {
      const c = o.color || '#FF6FA5', c2 = o.c2 || '#FFD23F';
      return `<g class="anim-flutter"><ellipse cx="-16" cy="-10" rx="16" ry="20" fill="${c}"/><ellipse cx="16" cy="-10" rx="16" ry="20" fill="${c}"/><ellipse cx="-12" cy="14" rx="11" ry="13" fill="${c2}"/><ellipse cx="12" cy="14" rx="11" ry="13" fill="${c2}"/><circle cx="-16" cy="-12" r="6" fill="#fff" opacity=".6"/><circle cx="16" cy="-12" r="6" fill="#fff" opacity=".6"/><rect x="-3" y="-20" width="6" height="40" rx="3" fill="#3B2A20"/><path d="M-2 -20 Q-8 -32 -12 -34 M2 -20 Q8 -32 12 -34" stroke="#3B2A20" stroke-width="2" fill="none"/></g>`;
    }
  };
  P.rabbit = {
    spots: [[70, -60]],
    draw: (o) => {
      const c = o.color || '#F5F5F5';
      return `${shadow(40, 7)}<ellipse cx="0" cy="-30" rx="34" ry="30" fill="${c}"/><circle cx="-30" cy="-22" r="10" fill="#fff"/><circle cx="16" cy="-72" r="24" fill="${c}"/>
      <ellipse cx="6" cy="-118" rx="9" ry="28" fill="${c}"/><ellipse cx="26" cy="-114" rx="9" ry="28" fill="${c}" transform="rotate(14 26 -114)"/><ellipse cx="6" cy="-116" rx="4" ry="20" fill="#FFB3C6"/>
      <circle cx="24" cy="-76" r="4" fill="#222"/><circle cx="38" cy="-66" r="4" fill="#FF8FAB"/>`;
    }
  };
  P.squirrel = {
    spots: [[60, -90]],
    draw: () => `${shadow(30, 6)}<path d="M-12 -10 Q-70 -20 -50 -90 Q-30 -120 -10 -90 Q-40 -60 -12 -30Z" fill="#C46A2E"/><ellipse cx="6" cy="-28" rx="22" ry="26" fill="#E07B39"/><ellipse cx="8" cy="-22" rx="12" ry="16" fill="#FFE0B2"/><circle cx="12" cy="-64" r="17" fill="#E07B39"/><path d="M4 -78 L6 -92 L14 -80Z" fill="#E07B39"/><circle cx="18" cy="-66" r="3" fill="#222"/><circle cx="28" cy="-60" r="3" fill="#5D4037"/><circle cx="24" cy="-36" r="7" fill="#8D6E63"/>`
  };
  P.bee = {
    spots: [],
    draw: () => `<g class="anim-bob"><ellipse cx="-4" cy="-16" rx="10" ry="12" fill="#fff" opacity=".8"/><ellipse cx="8" cy="-16" rx="10" ry="12" fill="#fff" opacity=".8"/><ellipse rx="18" ry="13" fill="#FFD23F"/><path d="M-6 -12 V12 M4 -13 V13" stroke="#333" stroke-width="5"/><circle cx="16" cy="-3" r="2.5" fill="#222"/></g>`
  };
  P.snail = {
    spots: [[0, -80]],
    draw: () => `<path d="M-40 0 H50 Q60 0 56 -14 L40 -14Z" fill="#FFCC80"/><circle cx="0" cy="-32" r="30" fill="#BA68C8"/><path d="M0 -32 m-18 0 a18 18 0 1 1 18 18 a10 10 0 1 1 -10 -10" stroke="#8E24AA" stroke-width="5" fill="none"/><path d="M44 -14 L48 -40 M52 -14 L60 -38" stroke="#FFCC80" stroke-width="4"/><circle cx="48" cy="-42" r="4" fill="#333"/><circle cx="60" cy="-40" r="4" fill="#333"/>`
  };
  P.firefly = {
    spots: [],
    draw: () => `<g class="anim-twinkle"><circle r="14" fill="#FFF59D" opacity=".35"/><circle r="5" fill="#FFF59D"/></g>`
  };

  /* ---------------------- OBJETOS (FLORESTA) ---------------------- */
  P.ball = {
    spots: [[0, -40]],
    draw: (o) => {
      const c = o.color || '#FF5A5F';
      return `${shadow(34, 6)}<circle cx="0" cy="-34" r="34" fill="${c}"/><path d="M-34 -34 Q0 -14 34 -34" stroke="#fff" stroke-width="8" fill="none"/><path d="M0 -68 Q-14 -34 0 0" stroke="#FFD23F" stroke-width="8" fill="none"/><circle cx="-12" cy="-48" r="8" fill="#fff" opacity=".4"/>`;
    }
  };
  P.kite = {
    spots: [[0, 0]],
    draw: (o) => {
      const c = o.color || '#7B61FF';
      return `<g class="anim-bob"><path d="M0 -70 L50 0 L0 80 L-50 0Z" fill="${c}"/><path d="M0 -70 L0 80 M-50 0 L50 0" stroke="#fff" stroke-width="4"/><path d="M0 -70 L50 0 L0 0Z" fill="#fff" opacity=".2"/><path d="M0 80 q-20 30 0 60 q20 30 0 60 q-10 30 10 60" stroke="#555" stroke-width="2" fill="none"/><path d="M0 110 l-12 -6 l0 12z M0 150 l12 -6 l0 12z" fill="#FFD23F"/></g>`;
    }
  };
  P.goal = {
    spots: [[0, -100]],
    draw: () => `<rect x="-130" y="-160" width="260" height="160" fill="none" stroke="#fff" stroke-width="12"/><path d="M-124 -154 L124 -6 M-124 -6 L124 -154 M-80 -154 V-6 M-30 -154 V-6 M20 -154 V-6 M70 -154 V-6 M-124 -110 H124 M-124 -60 H124" stroke="#fff" stroke-width="2" opacity=".5"/>`
  };
  P.swing = {
    spots: [[0, -110]],
    draw: () => `<path d="M-90 0 L-60 -220 L60 -220 L90 0" stroke="#C0392B" stroke-width="12" fill="none"/><g class="anim-swing"><path d="M-30 -218 V-50 M30 -218 V-50" stroke="#795548" stroke-width="4"/><rect x="-40" y="-56" width="80" height="14" rx="5" fill="#FFB300"/></g>`
  };
  P.blanket = {
    spots: [[0, -10]],
    draw: () => {
      let s = '<g transform="scale(1 .45)">';
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) s += `<rect x="${-150 + i * 60}" y="${-150 + j * 60}" width="60" height="60" fill="${(i + j) % 2 ? '#FF5A5F' : '#FFFFFF'}"/>`;
      return s + '</g>';
    }
  };
  P.basket = {
    spots: [[0, -100]],
    draw: () => `${shadow(56, 8)}<path d="M-50 -60 Q0 -150 50 -60" stroke="#8D5524" stroke-width="9" fill="none"/><path d="M-60 -60 H60 L48 0 H-48Z" fill="#D49A5A"/><path d="M-56 -40 H56 M-52 -20 H52 M-30 -60 L-26 0 M0 -60 V0 M30 -60 L26 0" stroke="#A86B3C" stroke-width="4"/><path d="M-60 -60 Q-30 -76 0 -62 Q30 -76 60 -60" fill="#FF5A5F"/><circle cx="-20" cy="-72" r="12" fill="#E53935"/>`
  };
  P.cake = {
    spots: [[0, -150]],
    draw: () => `${shadow(70, 8)}<ellipse cx="0" cy="0" rx="74" ry="12" fill="#E0E0E0"/><rect x="-56" y="-60" width="112" height="56" rx="10" fill="#F8BBD0"/><rect x="-56" y="-60" width="112" height="16" rx="8" fill="#FFF"/><rect x="-40" y="-104" width="80" height="44" rx="8" fill="#CE93D8"/><path d="M-40 -96 q10 12 20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="7" fill="none"/><rect x="-4" y="-130" width="8" height="26" fill="#4FC3F7"/><path d="M0 -146 q-8 8 0 14 q8 -6 0 -14" fill="#FFB300" class="anim-flicker"/><circle cx="-36" cy="-30" r="5" fill="#FF5A5F"/><circle cx="0" cy="-30" r="5" fill="#FFD23F"/><circle cx="36" cy="-30" r="5" fill="#4FC3F7"/>`
  };
  P.tent = {
    spots: [[0, -100]],
    draw: (o) => {
      const c = o.color || '#FF8C42';
      return `${shadow(130, 12)}<path d="M-130 0 L0 -190 L130 0Z" fill="${c}"/><path d="M0 -190 L130 0 L60 0Z" fill="#000" opacity=".12"/><path d="M0 -190 L-30 0 L30 0Z" fill="#5B3A29"/><path d="M0 -190 L-30 0 L-10 0 Z" fill="${c}" opacity=".7"/><path d="M0 -190 L0 -214" stroke="#5B3A29" stroke-width="6"/><path d="M0 -214 L26 -206 L0 -198Z" fill="#FFD23F"/>`;
    }
  };
  P.campfire = {
    spots: [[0, -110]],
    draw: () => `<ellipse cx="0" cy="-30" rx="80" ry="40" fill="#FFB74D" opacity=".18"/><path d="M-50 0 L40 -22 M-40 -22 L50 0" stroke="#6D3F1A" stroke-width="14" stroke-linecap="round"/>
      <g class="anim-flicker"><path d="M-30 -10 Q-40 -50 -10 -80 Q-14 -50 0 -40 Q4 -70 20 -90 Q40 -50 30 -10Z" fill="#FF7043"/><path d="M-16 -10 Q-20 -40 0 -58 Q20 -40 16 -10Z" fill="#FFCA28"/></g>
      ${[[-60, 4], [-30, 8], [10, 8], [44, 4]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="8" fill="#9AA5B1"/>`).join('')}`
  };
  P.backpack = {
    spots: [[0, -60]],
    draw: () => `${shadow(40, 6)}<rect x="-36" y="-90" width="72" height="90" rx="20" fill="#43A047"/><rect x="-26" y="-50" width="52" height="34" rx="8" fill="#2E7D32"/><path d="M-20 -90 Q0 -114 20 -90" stroke="#2E7D32" stroke-width="7" fill="none"/><rect x="-36" y="-72" width="72" height="8" fill="#FFB300"/>`
  };
  P.suitcase = {
    spots: [[0, -60]],
    draw: (o) => {
      const c = o.color || '#E84A5F';
      return `${shadow(60, 7)}<path d="M-20 -96 V-112 H20 V-96" stroke="#5B3A29" stroke-width="8" fill="none"/><rect x="-60" y="-96" width="120" height="96" rx="14" fill="${c}"/><rect x="-60" y="-56" width="120" height="10" fill="#000" opacity=".15"/><rect x="-36" y="-96" width="10" height="96" fill="#FFD23F"/><rect x="26" y="-96" width="10" height="96" fill="#FFD23F"/>`;
    }
  };
  P.candle = {
    spots: [[0, -120]],
    draw: (o) => {
      const c = o.color || '#FFF3E0';
      return `<circle cx="0" cy="-92" r="34" fill="#FFE082" opacity=".3" class="anim-glow"/><rect x="-12" y="-70" width="24" height="70" rx="5" fill="${c}"/><path d="M-12 -62 q6 10 12 0 q6 10 12 0" fill="${c}" stroke="#E0D2B8" stroke-width="2"/><rect x="-2" y="-78" width="4" height="10" fill="#333"/><path class="anim-flicker" d="M0 -100 Q-9 -86 0 -76 Q9 -86 0 -100Z" fill="#FFB300"/><ellipse cx="0" cy="0" rx="22" ry="6" fill="#B0855A"/>`;
    }
  };
  P.boat = {
    spots: [[10, -120]],
    draw: () => `<path d="M-90 -30 H90 L60 0 H-60Z" fill="#C0392B"/><path d="M-90 -30 H90 L84 -22 H-84Z" fill="#fff" opacity=".4"/><rect x="-3" y="-170" width="6" height="140" fill="#6D3F1A"/><path d="M6 -166 L70 -50 H6Z" fill="#fff"/><path d="M-6 -150 L-56 -50 H-6Z" fill="#FFE082"/>`
  };
  P.bridge = {
    spots: [[0, -60]],
    draw: () => {
      let s = '<path d="M-160 0 Q0 -90 160 0" stroke="#8B5A2B" stroke-width="22" fill="none"/>';
      for (let i = -140; i <= 140; i += 40) { const y = -((1 - (i / 160) ** 2) * 45); s += `<path d="M${i} ${y - 6} V${y - 50}" stroke="#6D3F1A" stroke-width="6"/>`; }
      return s + '<path d="M-140 -50 Q0 -140 140 -50" stroke="#6D3F1A" stroke-width="5" fill="none"/>';
    }
  };
  P.waterfall = {
    spots: [[0, -150]],
    draw: () => `<path d="M-70 -320 H70 V-10 H-70Z" fill="#4FC3F7"/><path d="M-50 -320 V-10 M-10 -320 V-10 M30 -320 V-10" stroke="#B3E5FC" stroke-width="8" class="anim-flow" stroke-dasharray="30 20"/><ellipse cx="0" cy="-6" rx="110" ry="24" fill="#B3E5FC"/>`
  };

  /* ---------------------- OCEANO ---------------------- */
  P.fish = {
    spots: [[0, -46]],
    draw: (o) => {
      const c = o.color || '#FF8C42', c2 = o.c2 || '#FFD23F';
      return `<g class="anim-swim"><path d="M-40 0 L-70 -24 L-66 0 L-70 24Z" fill="${c2}"/><ellipse cx="0" cy="0" rx="46" ry="28" fill="${c}"/><path d="M-6 -27 Q8 -46 24 -24Z" fill="${c2}"/><path d="M-10 -26 Q-2 0 -10 26 M8 -26 Q16 0 8 26" stroke="${c2}" stroke-width="7" fill="none" opacity=".8"/><circle cx="26" cy="-6" r="8" fill="#fff"/><circle cx="28" cy="-6" r="4" fill="#222"/><path d="M38 8 q4 2 6 -2" stroke="#222" stroke-width="2" fill="none"/></g>`;
    }
  };
  P.coral = {
    spots: [[0, -110]],
    draw: (o) => {
      const c = o.color || '#FF6F91';
      return `<path d="M0 0 V-60 M0 -60 Q-30 -70 -40 -110 M0 -60 Q30 -80 36 -130 M-20 -80 Q-50 -86 -60 -70 M18 -90 Q50 -90 60 -110 M-36 -100 V-140 M36 -120 Q20 -150 28 -170" stroke="${c}" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="-40" cy="-112" r="9" fill="${c}"/><circle cx="-36" cy="-142" r="9" fill="${c}"/><circle cx="28" cy="-172" r="9" fill="${c}"/><circle cx="60" cy="-112" r="9" fill="${c}"/><circle cx="-60" cy="-70" r="9" fill="${c}"/>`;
    }
  };
  P.fanCoral = {
    spots: [[0, -90]],
    draw: (o) => {
      const c = o.color || '#B388FF';
      let s = `<path d="M0 0 L0 -30" stroke="${c}" stroke-width="12"/><path d="M0 -30 Q-90 -60 -70 -140 Q0 -180 70 -140 Q90 -60 0 -30Z" fill="${c}" opacity=".85"/>`;
      for (let a = -60; a <= 60; a += 20) s += `<path d="M0 -30 L${Math.sin(a * Math.PI / 180) * 80} ${-30 - Math.cos(a * Math.PI / 180) * 120}" stroke="#fff" stroke-width="3" opacity=".35"/>`;
      return s;
    }
  };
  P.brainCoral = {
    spots: [[0, -40]],
    draw: (o) => `<path d="M-70 0 Q-74 -70 0 -76 Q74 -70 70 0Z" fill="${o.color || '#FFB74D'}"/><path d="M-50 -16 q10 -30 24 -6 t24 -10 t24 -6 M-40 -44 q14 -20 26 0 t30 -8" stroke="#E65100" stroke-width="5" fill="none" opacity=".45"/>`
  };
  P.seaweed = {
    spots: [[0, -150]],
    draw: (o) => {
      const c = o.color || '#2E9E6A', h = o.h || 200;
      return `<g class="anim-sway"><path d="M0 0 C-30 ${-h * 0.25} 30 ${-h * 0.45} 0 ${-h * 0.65} C-26 ${-h * 0.8} 14 ${-h * 0.9} 4 ${-h}" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M20 0 C0 ${-h * 0.2} 44 ${-h * 0.4} 24 ${-h * 0.55}" stroke="${c}" stroke-width="11" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
    }
  };
  P.shell = {
    spots: [[0, -46]],
    draw: (o) => {
      const c = o.color || '#FFAB91';
      let s = `${shadow(36, 5)}<path d="M-36 0 Q-40 -50 0 -54 Q40 -50 36 0 Q0 10 -36 0Z" fill="${c}"/>`;
      for (let x = -24; x <= 24; x += 12) s += `<path d="M0 2 L${x} -48" stroke="#fff" stroke-width="3" opacity=".6"/>`;
      return s + `<path d="M-10 4 h20 v8 h-20z" fill="${c}"/>`;
    }
  };
  P.starfish = {
    spots: [[0, -44]],
    draw: (o) => `<path d="M0 -34 L10 -12 L34 -10 L16 6 L22 30 L0 18 L-22 30 L-16 6 L-34 -10 L-10 -12Z" fill="${o.color || '#FF7043'}" stroke="#fff" stroke-width="2" stroke-opacity=".4"/><circle cx="0" cy="-8" r="3" fill="#fff" opacity=".6"/><circle cx="8" cy="0" r="2" fill="#fff" opacity=".6"/><circle cx="-8" cy="2" r="2" fill="#fff" opacity=".6"/>`
  };
  P.chest = {
    spots: [[0, -112]],
    draw: (o) => `${shadow(80, 9)}<rect x="-70" y="-70" width="140" height="70" rx="6" fill="#8D5524"/><path d="M-70 -70 Q-70 -120 0 -120 Q70 -120 70 -70Z" fill="#A0643A"/>${o.open ? '<ellipse cx="0" cy="-74" rx="60" ry="14" fill="#FFD23F"/><circle cx="-20" cy="-84" r="10" fill="#FFE066"/><circle cx="14" cy="-88" r="10" fill="#FFE066"/><path d="M30 -96 l10 -12 l10 12 l-10 10z" fill="#4FC3F7"/>' : ''}<rect x="-70" y="-74" width="140" height="10" fill="#FFB300"/><rect x="-10" y="-84" width="20" height="28" rx="4" fill="#FFD23F"/><rect x="-54" y="-120" width="10" height="120" fill="#FFB300"/><rect x="44" y="-120" width="10" height="120" fill="#FFB300"/>`
  };
  P.anchor = {
    spots: [[0, -150]],
    draw: () => `<circle cx="0" cy="-170" r="18" fill="none" stroke="#607D8B" stroke-width="10"/><rect x="-7" y="-152" width="14" height="140" fill="#607D8B"/><rect x="-40" y="-130" width="80" height="12" rx="6" fill="#607D8B"/><path d="M-70 -50 Q-60 0 0 -10 Q60 0 70 -50" stroke="#607D8B" stroke-width="14" fill="none"/><path d="M-82 -56 L-66 -38 L-56 -60Z M82 -56 L66 -38 L56 -60Z" fill="#607D8B"/>`
  };
  P.jellyfish = {
    spots: [[0, -10]],
    draw: (o) => {
      const c = o.color || '#F48FB1';
      return `<g class="anim-float"><path d="M-46 0 Q-46 -60 0 -60 Q46 -60 46 0 Q36 8 23 0 Q12 8 0 0 Q-12 8 -23 0 Q-36 8 -46 0Z" fill="${c}" opacity=".9"/><ellipse cx="-14" cy="-38" rx="12" ry="7" fill="#fff" opacity=".4"/><path d="M-30 4 q-10 30 4 60 M-10 4 q10 34 -4 74 M10 4 q-10 30 4 66 M30 4 q10 30 -4 56" stroke="${c}" stroke-width="5" fill="none" opacity=".75"/><circle cx="-12" cy="-22" r="3.5" fill="#333"/><circle cx="12" cy="-22" r="3.5" fill="#333"/></g>`;
    }
  };
  P.turtle = {
    spots: [[0, -80]],
    draw: () => `<g class="anim-swim"><ellipse cx="-50" cy="-10" rx="22" ry="10" fill="#81C784" transform="rotate(-30 -50 -10)"/><ellipse cx="44" cy="-14" rx="22" ry="10" fill="#81C784" transform="rotate(30 44 -14)"/><circle cx="70" cy="-30" r="20" fill="#81C784"/><circle cx="78" cy="-34" r="4" fill="#222"/><path d="M-60 -30 Q-56 -90 0 -92 Q56 -90 60 -30Z" fill="#43A047"/><path d="M-30 -36 l10 -30 l20 -6 l20 6 l10 30z" fill="#2E7D32" opacity=".5"/><path d="M-62 -30 H62" stroke="#A5D6A7" stroke-width="8"/></g>`
  };
  P.crab = {
    spots: [[0, -80]],
    draw: () => `${shadow(46, 6)}<ellipse cx="0" cy="-26" rx="40" ry="24" fill="#EF5350"/><path d="M-40 -20 L-60 -6 M-40 -12 L-58 6 M40 -20 L60 -6 M40 -12 L58 6" stroke="#E53935" stroke-width="6" stroke-linecap="round"/><path d="M-30 -40 L-50 -64 M30 -40 L50 -64" stroke="#E53935" stroke-width="6"/><path d="M-60 -76 a14 14 0 1 1 18 6 L-50 -64Z M60 -76 a14 14 0 1 0 -18 6 L50 -64Z" fill="#EF5350"/><path d="M-10 -50 V-60 M10 -50 V-60" stroke="#E53935" stroke-width="4"/><circle cx="-10" cy="-62" r="6" fill="#fff"/><circle cx="10" cy="-62" r="6" fill="#fff"/><circle cx="-10" cy="-62" r="3" fill="#222"/><circle cx="10" cy="-62" r="3" fill="#222"/><path d="M-10 -24 q10 8 20 0" stroke="#B71C1C" stroke-width="3" fill="none"/>`
  };
  P.bubbles = {
    spots: [],
    draw: () => `<g class="anim-rise"><circle cx="0" cy="0" r="10" fill="none" stroke="#E1F5FE" stroke-width="3" opacity=".8"/><circle cx="14" cy="-30" r="7" fill="none" stroke="#E1F5FE" stroke-width="3" opacity=".7"/><circle cx="-6" cy="-56" r="5" fill="none" stroke="#E1F5FE" stroke-width="2" opacity=".6"/></g>`
  };
  P.submarine = {
    spots: [[-30, -6]],
    draw: () => `<g class="anim-float"><ellipse cx="0" cy="0" rx="110" ry="50" fill="#FFCA28"/><rect x="-20" y="-80" width="60" height="40" rx="10" fill="#FFB300"/><rect x="14" y="-110" width="8" height="34" fill="#90A4AE"/><rect x="14" y="-114" width="26" height="8" fill="#90A4AE"/><circle cx="-60" cy="-4" r="16" fill="#4FC3F7" stroke="#FFA000" stroke-width="6"/><circle cx="0" cy="-4" r="16" fill="#4FC3F7" stroke="#FFA000" stroke-width="6"/><circle cx="60" cy="-4" r="16" fill="#4FC3F7" stroke="#FFA000" stroke-width="6"/><path d="M106 -20 L136 -36 V36 L106 20Z" fill="#FFA000"/></g>`
  };
  P.octopus = {
    spots: [[0, -150]],
    draw: (o) => {
      const c = o.color || '#BA68C8';
      let legs = '';
      for (let i = 0; i < 6; i++) { const x = -50 + i * 20; legs += `<path d="M${x} -40 Q${x - 20 + i * 8} -10 ${x - 10 + i * 6} 0" stroke="${c}" stroke-width="14" stroke-linecap="round" fill="none"/>`; }
      return `${legs}<ellipse cx="0" cy="-78" rx="56" ry="54" fill="${c}"/><circle cx="-20" cy="-74" r="11" fill="#fff"/><circle cx="20" cy="-74" r="11" fill="#fff"/><circle cx="-18" cy="-74" r="5" fill="#222"/><circle cx="22" cy="-74" r="5" fill="#222"/><path d="M-12 -52 q12 10 24 0" stroke="#6A1B9A" stroke-width="3" fill="none"/><ellipse cx="-20" cy="-108" rx="14" ry="8" fill="#fff" opacity=".3"/>`;
    }
  };
  P.palm = {
    spots: [[0, -260]],
    draw: () => `${shadow(60, 8)}<path d="M-14 0 Q0 -120 30 -240 L44 -236 Q14 -120 14 0Z" fill="#A1683A"/><path d="M-6 -40 H10 M-2 -90 H16 M8 -140 H24 M16 -190 H32" stroke="#7A4A26" stroke-width="4"/>
      <g transform="translate(36 -240)"><path d="M0 0 Q-80 -50 -150 10 Q-80 -20 0 0Z M0 0 Q80 -60 150 0 Q80 -24 0 0Z M0 0 Q-40 -90 -100 -100 Q-40 -60 0 0Z M0 0 Q40 -100 110 -90 Q40 -60 0 0Z M0 0 Q-10 60 -70 90 Q-20 40 0 0Z" fill="#43A047"/><circle cx="-8" cy="10" r="12" fill="#8D5524"/><circle cx="10" cy="14" r="12" fill="#795548"/></g>`
  };
  P.monkey = {
    spots: [[70, -60]],
    draw: () => `<path d="M30 -20 Q90 -10 80 -70 Q74 -96 60 -80" stroke="#8D5524" stroke-width="8" fill="none"/><ellipse cx="0" cy="-30" rx="30" ry="32" fill="#8D5524"/><ellipse cx="0" cy="-24" rx="18" ry="22" fill="#FFCC80"/><circle cx="0" cy="-86" r="30" fill="#8D5524"/><circle cx="-30" cy="-88" r="12" fill="#FFCC80"/><circle cx="30" cy="-88" r="12" fill="#FFCC80"/><ellipse cx="0" cy="-80" rx="22" ry="20" fill="#FFCC80"/><circle cx="-9" cy="-88" r="4" fill="#222"/><circle cx="9" cy="-88" r="4" fill="#222"/><path d="M-8 -72 q8 7 16 0" stroke="#5D4037" stroke-width="3" fill="none"/>`
  };
  P.seahorse = {
    spots: [[0, -150]],
    draw: (o) => `<g class="anim-float"><path d="M0 0 Q-24 -10 -10 -30 Q10 -50 -6 -80 Q-20 -110 6 -124 Q26 -132 30 -110 L50 -108 L32 -98 Q20 -92 18 -78 Q30 -50 14 -24 Q2 -6 18 6 Q22 20 4 14" fill="${o.color || '#FFB74D'}"/><circle cx="14" cy="-114" r="4" fill="#222"/><path d="M-4 -110 l-10 -6 M-8 -90 l-12 -2 M-6 -70 l-12 2" stroke="${o.color || '#FFB74D'}" stroke-width="5" stroke-linecap="round"/></g>`
  };
  P.whale = {
    spots: [[-40, -10]],
    draw: () => `<g class="anim-float"><path d="M-160 0 Q-160 -90 -20 -90 Q120 -90 140 -20 L200 -60 L190 0 L210 50 L140 20 Q100 70 -40 70 Q-160 70 -160 0Z" fill="#5C9EDB"/><path d="M-150 20 Q-60 70 120 20 Q90 60 -40 64 Q-140 62 -150 20Z" fill="#BBDEFB"/><circle cx="-100" cy="-20" r="9" fill="#222"/><path d="M-130 20 q20 10 40 0" stroke="#2D5F94" stroke-width="4" fill="none"/></g>`
  };
  P.crystal = {
    spots: [[0, -90]],
    draw: (o) => {
      const c = o.color || '#80DEEA';
      return `<path d="M-30 0 L-40 -80 L-20 -120 L0 -80 L-6 0Z" fill="${c}"/><path d="M-6 0 L0 -100 L20 -150 L40 -100 L30 0Z" fill="${c}" opacity=".85"/><path d="M28 0 L40 -60 L58 -80 L70 -50 L60 0Z" fill="${c}" opacity=".7"/><path d="M20 -150 L28 -100 L20 0" stroke="#fff" stroke-width="3" opacity=".5"/><circle cx="20" cy="-150" r="22" fill="#fff" opacity=".2" class="anim-glow"/>`;
    }
  };
  P.dome = {
    spots: [[0, -110]],
    draw: (o) => `${shadow(130, 10)}<path d="M-120 0 Q-120 -170 0 -170 Q120 -170 120 0Z" fill="#B3E5FC" opacity=".45" stroke="#E1F5FE" stroke-width="6"/><rect x="-70" y="-90" width="50" height="90" fill="${o.c1 || '#FF8A65'}"/><rect x="-10" y="-130" width="44" height="130" fill="${o.c2 || '#FFD54F'}"/><rect x="44" y="-70" width="40" height="70" fill="${o.c3 || '#4DB6AC'}"/><rect x="-60" y="-76" width="12" height="12" fill="#FFF59D"/><rect x="0" y="-112" width="12" height="12" fill="#FFF59D"/><rect x="0" y="-80" width="12" height="12" fill="#FFF59D"/><rect x="54" y="-54" width="12" height="12" fill="#FFF59D"/><path d="M-80 -130 Q-40 -160 0 -164" stroke="#fff" stroke-width="6" fill="none" opacity=".6"/>`
  };
  P.anemone = {
    spots: [[0, -80]],
    draw: (o) => {
      const c = o.color || '#F06292';
      let t = '';
      for (let i = -4; i <= 4; i++) t += `<path d="M${i * 8} -20 Q${i * 14} -50 ${i * 16} -70" stroke="${c}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      return `<g class="anim-sway">${t}</g><ellipse cx="0" cy="-12" rx="40" ry="14" fill="${o.base || '#AD1457'}"/>`;
    }
  };
  P.lanternfish = {
    spots: [[0, -60]],
    draw: () => `<g class="anim-swim"><path d="M40 -40 Q60 -80 20 -90" stroke="#90A4AE" stroke-width="4" fill="none"/><circle cx="20" cy="-92" r="10" fill="#FFF59D" class="anim-glow"/><circle cx="20" cy="-92" r="22" fill="#FFF59D" opacity=".25"/><ellipse cx="0" cy="-20" rx="56" ry="36" fill="#455A64"/><path d="M-50 -20 L-84 -46 L-84 6Z" fill="#37474F"/><circle cx="30" cy="-30" r="10" fill="#fff"/><circle cx="32" cy="-30" r="5" fill="#222"/><path d="M30 -6 l6 -6 l6 6 l6 -6 l6 6" stroke="#fff" stroke-width="3" fill="none"/></g>`
  };
  P.shipwreck = {
    spots: [[-80, -140], [100, -60]],
    draw: () => `${shadow(240, 16)}<path d="M-240 -110 L220 -60 L180 0 L-200 0Z" fill="#6D4C41"/><path d="M-230 -100 L210 -54" stroke="#4E342E" stroke-width="8"/><path d="M-190 -60 L180 -20" stroke="#4E342E" stroke-width="6"/>
      <circle cx="-100" cy="-60" r="16" fill="#263238" stroke="#4E342E" stroke-width="6"/><circle cx="0" cy="-50" r="16" fill="#263238" stroke="#4E342E" stroke-width="6"/><circle cx="100" cy="-40" r="16" fill="#263238" stroke="#4E342E" stroke-width="6"/>
      <path d="M-40 -100 L-70 -330" stroke="#5D4037" stroke-width="14"/><path d="M-66 -310 L60 -270 L20 -170 L-50 -190Z" fill="#ECEFF1" opacity=".8"/><path d="M-62 -330 L-30 -320 L-62 -306Z" fill="#E53935"/>`
  };
  P.sandcastle = {
    spots: [[0, -90]],
    draw: () => `${shadow(80, 8)}<rect x="-70" y="-60" width="140" height="60" fill="#F2C57C"/><rect x="-80" y="-110" width="40" height="110" fill="#E8B865"/><rect x="40" y="-110" width="40" height="110" fill="#E8B865"/><rect x="-24" y="-140" width="48" height="80" fill="#E8B865"/><path d="M-80 -110 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 M40 -110 v-10 h10 v10 h10 v-10 h10 v10 h10 v-10 M-24 -140 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10" stroke="#E8B865" stroke-width="10" fill="none"/><path d="M-12 0 V-30 Q0 -44 12 -30 V0Z" fill="#B7843E"/><path d="M0 -150 V-190" stroke="#795548" stroke-width="3"/><path d="M0 -190 L24 -182 L0 -174Z" fill="#E53935"/>`
  };
  P.umbrella = {
    spots: [[0, -170]],
    draw: () => `<path d="M0 0 V-160" stroke="#555" stroke-width="5"/><path d="M-110 -150 Q0 -260 110 -150Z" fill="#FF5A5F"/><path d="M-110 -150 Q-74 -230 0 -236 Q-40 -200 -40 -150Z M40 -150 Q40 -200 0 -236 Q74 -230 110 -150Z" fill="#fff"/>`
  };
  P.lighthouse = {
    spots: [[0, -150]],
    draw: () => `<path d="M-50 0 L-34 -260 H34 L50 0Z" fill="#fff"/><path d="M-46 -60 H46 L44 -100 H-44Z M-40 -160 H40 L38 -200 H-38Z" fill="#E53935"/><rect x="-40" y="-300" width="80" height="40" fill="#FFF59D"/><path d="M-50 -300 L0 -340 L50 -300Z" fill="#E53935"/><path d="M40 -280 L240 -330 L240 -230Z" fill="#FFF59D" opacity=".3" class="anim-glow"/>`
  };

  /* ---------------------- CASTELO ---------------------- */
  P.tower = {
    spots: (o) => [[0, -(o.h || 360) * 0.35], [0, -(o.h || 360) - (o.w || 140) * 0.38]],
    draw: (o) => {
      const w = o.w || 140, h = o.h || 360, c = o.color || '#A79BC8', r = o.roof || '#E84A5F';
      let bricks = '';
      for (let y = -40; y > -h + 20; y -= 46) bricks += `<rect x="${-w / 2 + 14 + ((y / 46) % 2 ? 20 : 0)}" y="${y}" width="34" height="14" rx="4" fill="#000" opacity=".07"/><rect x="${w / 2 - 50}" y="${y - 22}" width="30" height="12" rx="4" fill="#000" opacity=".06"/>`;
      return `${shadow(w * 0.6, 10)}<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${c}"/><rect x="${w / 4}" y="${-h}" width="${w / 4}" height="${h}" fill="#000" opacity=".08"/>${bricks}
      <path d="M${-w / 2 - 16} ${-h} L0 ${-h - w * 0.95} L${w / 2 + 16} ${-h}Z" fill="${r}"/><path d="M0 ${-h - w * 0.95} L${w / 2 + 16} ${-h} L${w / 6} ${-h}Z" fill="#000" opacity=".12"/>
      <path d="M0 ${-h - w * 0.95} V${-h - w * 0.95 - 50}" stroke="#5D4037" stroke-width="5"/><path class="anim-wave" d="M0 ${-h - w * 0.95 - 50} q20 -6 40 4 q-20 8 -40 18Z" fill="${o.flag || '#FFD23F'}"/>
      <path d="M-22 ${-h * 0.62} V${-h * 0.62 - 44} Q0 ${-h * 0.62 - 70} 22 ${-h * 0.62 - 44} V${-h * 0.62}Z" fill="${o.win || '#3D2C6B'}"/>`;
    }
  };
  P.castleWall = {
    spots: [],
    draw: (o) => {
      const w = o.w || 600, h = o.h || 200, c = o.color || '#B8ADD6';
      let s = `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${c}"/>`;
      for (let x = -w / 2; x < w / 2; x += 60) s += `<rect x="${x}" y="${-h - 34}" width="34" height="36" fill="${c}"/>`;
      for (let y = -30; y > -h; y -= 40) for (let x = -w / 2 + (((y / 40) | 0) % 2 ? 0 : 30); x < w / 2 - 40; x += 80) s += `<rect x="${x + 6}" y="${y}" width="58" height="16" rx="5" fill="#000" opacity=".06"/>`;
      return s;
    }
  };
  P.gate = {
    spots: [[0, -190]],
    draw: () => {
      let bars = '';
      for (let x = -70; x <= 70; x += 28) bars += `<path d="M${x} -10 V-200" stroke="#5D4037" stroke-width="8"/>`;
      return `<path d="M-100 0 V-180 Q0 -280 100 -180 V0Z" fill="#3E2723"/>${bars}<path d="M-100 -60 H100 M-100 -130 H100" stroke="#5D4037" stroke-width="8"/><path d="M-100 0 V-180 Q0 -280 100 -180 V0" stroke="#7E6FA8" stroke-width="18" fill="none"/>`;
    }
  };
  P.drawbridge = {
    spots: [],
    draw: () => {
      let p = '';
      for (let x = -100; x < 100; x += 25) p += `<rect x="${x}" y="-6" width="23" height="60" fill="${(x / 25) % 2 ? '#A1683A' : '#8D5524'}"/>`;
      return `<g transform="scale(1 1)">${p}</g><path d="M-100 -6 L-120 -220 M100 -6 L120 -220" stroke="#78909C" stroke-width="5" stroke-dasharray="10 6"/>`;
    }
  };
  P.flagPole = {
    spots: [[50, -230]],
    draw: (o) => `<path d="M0 0 V-260" stroke="#795548" stroke-width="6"/><circle cx="0" cy="-262" r="7" fill="#FFD23F"/><path class="anim-wave" d="M3 -250 Q50 -264 100 -244 Q60 -220 100 -196 Q50 -214 3 -200Z" fill="${o.color || '#E84A5F'}"/>`
  };
  P.banner = {
    spots: [[0, -110]],
    draw: (o) => {
      const c = o.color || '#E84A5F', e = o.emblem || 'crown';
      const em = e === 'crown' ? '<path d="M-24 -92 L-24 -116 L-12 -104 L0 -122 L12 -104 L24 -116 L24 -92Z" fill="#FFD23F"/>' : e === 'star' ? '<path d="M0 -130 L8 -112 L28 -110 L12 -98 L18 -78 L0 -90 L-18 -78 L-12 -98 L-28 -110 L-8 -112Z" fill="#FFD23F"/>' : '<path d="M-20 -126 H20 V-100 Q20 -80 0 -72 Q-20 -80 -20 -100Z" fill="#FFD23F"/>';
      return `<rect x="-56" y="-192" width="112" height="10" rx="5" fill="#8D6E63"/><path d="M-46 -184 H46 V-40 L0 -64 L-46 -40Z" fill="${c}"/><path d="M-46 -184 H46 V-170 H-46Z" fill="#000" opacity=".15"/><path d="M-38 -184 V-52 M38 -184 V-52" stroke="#FFD23F" stroke-width="4" opacity=".7"/>${em}`;
    }
  };
  P.torch = {
    spots: [[0, -96]],
    draw: () => `<circle cx="0" cy="-90" r="60" fill="#FFB74D" opacity=".18" class="anim-glow"/><rect x="-14" y="-18" width="28" height="10" fill="#616161"/><path d="M-12 -60 L12 -60 L6 0 L-6 0Z" fill="#6D4C41"/><path d="M-16 -66 H16 V-56 H-16Z" fill="#9E9E9E"/><g class="anim-flicker"><path d="M-16 -66 Q-22 -100 0 -124 Q4 -100 10 -96 Q22 -100 16 -66Z" fill="#FF7043"/><path d="M-8 -66 Q-10 -88 2 -102 Q12 -86 8 -66Z" fill="#FFCA28"/></g>`
  };
  P.archWindow = {
    spots: [[0, -80]],
    draw: (o) => {
      const w = o.w || 100, h = o.h || 160, inside = o.inside || '#7EC8E3';
      return `<path d="M${-w / 2 - 12} 0 V${-h + w / 2} Q0 ${-h - w * 0.35} ${w / 2 + 12} ${-h + w / 2} V0Z" fill="${o.frame || '#7E6FA8'}"/><path d="M${-w / 2} -6 V${-h + w / 2} Q0 ${-h - w * 0.2} ${w / 2} ${-h + w / 2} V-6Z" fill="${inside}"/>${o.stars ? `<circle cx="${-w / 5}" cy="${-h * 0.6}" r="3" fill="#fff"/><circle cx="${w / 5}" cy="${-h * 0.4}" r="2" fill="#fff"/><circle cx="0" cy="${-h * 0.8}" r="2.5" fill="#fff"/>` : ''}<path d="M0 -6 V${-h - w * 0.15} M${-w / 2} ${-h * 0.45} H${w / 2}" stroke="${o.frame || '#7E6FA8'}" stroke-width="6"/><rect x="${-w / 2 - 18}" y="-6" width="${w + 36}" height="12" rx="4" fill="#8E80B8"/>`;
    }
  };
  P.throne = {
    spots: [[0, -250]],
    draw: () => `${shadow(100, 12)}<path d="M-80 0 V-260 Q-80 -320 0 -330 Q80 -320 80 -260 V0Z" fill="#C62828"/><path d="M-60 -100 V-250 Q-60 -296 0 -304 Q60 -296 60 -250 V-100Z" fill="#E53935"/><path d="M-80 -260 Q-80 -320 0 -330 Q80 -320 80 -260" stroke="#FFD23F" stroke-width="12" fill="none"/>
      <rect x="-100" y="-110" width="200" height="40" rx="12" fill="#FFB300"/><rect x="-100" y="-160" width="34" height="160" rx="10" fill="#FFB300"/><rect x="66" y="-160" width="34" height="160" rx="10" fill="#FFB300"/><circle cx="0" cy="-310" r="12" fill="#4FC3F7"/><circle cx="-83" cy="-170" r="12" fill="#FFD23F"/><circle cx="83" cy="-170" r="12" fill="#FFD23F"/>`
  };
  P.bookshelf = {
    spots: (o) => [[-(o.w || 200) * 0.2, -(o.h || 300) * 0.75], [(o.w || 200) * 0.2, -(o.h || 300) * 0.38]],
    draw: (o) => {
      const w = o.w || 200, h = o.h || 300;
      const cols = ['#E84A5F', '#4FC3F7', '#FFD23F', '#7B61FF', '#3DDC84', '#FF8C42', '#FF6FA5', '#26A69A'];
      let s = `${shadow(w * 0.55, 10)}<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6" fill="#6D4C41"/><rect x="${-w / 2 + 10}" y="${-h + 10}" width="${w - 20}" height="${h - 20}" fill="#4E342E"/>`;
      const shelves = Math.floor((h - 20) / 70);
      let k = (o.seed || 1) * 3;
      for (let i = 0; i < shelves; i++) {
        const y = -h + 10 + (i + 1) * ((h - 20) / shelves);
        s += `<rect x="${-w / 2 + 6}" y="${y - 6}" width="${w - 12}" height="10" fill="#8D6E63"/>`;
        let x = -w / 2 + 14;
        while (x < w / 2 - 30) {
          const bw = 14 + ((k * 7) % 12), bh = 40 + ((k * 13) % 20); k++;
          s += `<rect x="${x}" y="${y - 6 - bh}" width="${bw}" height="${bh}" rx="2" fill="${cols[k % cols.length]}"/><rect x="${x + 2}" y="${y - bh + 2}" width="${bw - 4}" height="4" fill="#fff" opacity=".35"/>`;
          x += bw + 3;
        }
      }
      return s;
    }
  };
  P.barrel = {
    spots: [[0, -60]],
    draw: () => `${shadow(46, 7)}<path d="M-40 0 Q-52 -50 -40 -100 H40 Q52 -50 40 0Z" fill="#A1683A"/><path d="M-44 -24 H44 M-46 -76 H46" stroke="#616161" stroke-width="8"/><path d="M-16 0 Q-22 -50 -16 -100 M16 0 Q22 -50 16 -100" stroke="#7A4A26" stroke-width="3"/><ellipse cx="0" cy="-100" rx="40" ry="8" fill="#8D5524"/>`
  };
  P.crate = {
    spots: [[0, -45]],
    draw: () => `${shadow(50, 7)}<rect x="-46" y="-90" width="92" height="90" fill="#C98B4F"/><rect x="-46" y="-90" width="92" height="90" fill="none" stroke="#8D5524" stroke-width="8"/><path d="M-42 -86 L42 -4 M42 -86 L-42 -4" stroke="#8D5524" stroke-width="7"/>`
  };
  P.chandelier = {
    spots: [[0, 40]],
    draw: () => {
      let c = '';
      for (const x of [-90, -45, 0, 45, 90]) c += `<rect x="${x - 5}" y="${x === 0 ? 34 : 40}" width="10" height="22" fill="#FFF8E1"/><path class="anim-flicker" d="M${x} ${x === 0 ? 18 : 24} q-6 8 0 14 q6 -6 0 -14" fill="#FFB300"/><circle cx="${x}" cy="${x === 0 ? 26 : 32}" r="18" fill="#FFE082" opacity=".3"/>`;
      return `<path d="M0 -200 V40" stroke="#8D6E63" stroke-width="5"/><path d="M-100 60 Q0 110 100 60" stroke="#FFB300" stroke-width="10" fill="none"/>${c}`;
    }
  };
  P.pillar = {
    spots: [],
    draw: (o) => {
      const h = o.h || 500, c = o.color || '#C5BBE0';
      return `<rect x="-40" y="${-h}" width="80" height="${h}" fill="${c}"/><rect x="-54" y="${-h}" width="108" height="30" rx="6" fill="#D8D0EE"/><rect x="-54" y="-30" width="108" height="30" rx="6" fill="#D8D0EE"/><path d="M-20 ${-h + 30} V-30 M0 ${-h + 30} V-30 M20 ${-h + 30} V-30" stroke="#000" opacity=".07" stroke-width="6"/>`;
    }
  };
  P.armor = {
    spots: [[70, -150]],
    draw: () => `${shadow(50, 8)}<rect x="-30" y="-10" width="60" height="10" fill="#616161"/><path d="M-26 -10 V-80 H-6 V-10Z M6 -10 V-80 H26 V-10Z" fill="#B0BEC5"/><path d="M-40 -80 Q-44 -150 0 -156 Q44 -150 40 -80Z" fill="#CFD8DC"/><path d="M-46 -150 Q-60 -130 -50 -100 M46 -150 Q60 -130 50 -100" stroke="#B0BEC5" stroke-width="16" stroke-linecap="round"/>
      <path d="M-26 -160 Q-26 -210 0 -212 Q26 -210 26 -160Z" fill="#CFD8DC"/><rect x="-18" y="-190" width="36" height="8" rx="3" fill="#455A64"/><path d="M0 -212 Q10 -240 30 -236 Q14 -226 4 -212" fill="#E53935"/><path d="M58 -40 V-230" stroke="#8D6E63" stroke-width="6"/><path d="M58 -230 L48 -260 L58 -276 L68 -260Z" fill="#B0BEC5"/>`
  };
  P.shield = {
    spots: [[0, -50]],
    draw: (o) => `<path d="M-46 -100 H46 V-50 Q46 -10 0 6 Q-46 -10 -46 -50Z" fill="${o.color || '#1E88E5'}" stroke="#FFD23F" stroke-width="8"/><path d="M0 -94 V0 M-40 -56 H40" stroke="#FFD23F" stroke-width="6" opacity=".7"/>`
  };
  P.dragon = {
    spots: [[150, -230]],
    draw: (o) => {
      const c = o.color || '#66BB6A', b = o.belly || '#FFF59D';
      return `${shadow(140, 14)}<path d="M-80 -40 Q-200 -30 -230 -110 Q-200 -70 -110 -80Z" fill="${c}"/><path d="M-230 -110 L-260 -120 L-240 -94Z" fill="#FFB300"/>
      <path d="M-30 -110 Q-110 -260 -170 -230 Q-120 -200 -110 -150 Q-150 -180 -170 -150 Q-110 -120 -60 -90Z" fill="${c}" opacity=".75" class="anim-flap"/>
      <ellipse cx="0" cy="-70" rx="100" ry="66" fill="${c}"/><ellipse cx="20" cy="-56" rx="60" ry="44" fill="${b}"/><path d="M-70 -120 l14 -26 l14 22 l14 -28 l14 24 l14 -26 l14 22" fill="${c}" stroke="#FFB300" stroke-width="0"/>
      <ellipse cx="-50" cy="-6" rx="26" ry="12" fill="${c}"/><ellipse cx="50" cy="-6" rx="26" ry="12" fill="${c}"/>
      <path d="M60 -110 Q90 -170 110 -180" stroke="${c}" stroke-width="46" stroke-linecap="round" fill="none"/>
      <ellipse cx="130" cy="-196" rx="56" ry="44" fill="${c}"/><ellipse cx="170" cy="-180" rx="28" ry="22" fill="${c}"/><circle cx="178" cy="-188" r="4" fill="#2E7D32"/><circle cx="188" cy="-178" r="4" fill="#2E7D32"/>
      <path d="M96 -234 L90 -268 L112 -238Z M136 -238 L140 -272 L154 -234Z" fill="#FFB300"/><circle cx="126" cy="-206" r="14" fill="#fff"/><circle cx="130" cy="-206" r="7" fill="#222" class="anim-blink"/>
      <path d="M140 -166 q20 10 40 0" stroke="#2E7D32" stroke-width="4" fill="none"/><circle cx="104" cy="-178" r="9" fill="#FF8A80" opacity=".6"/>`;
    }
  };
  P.cauldron = {
    spots: [[0, -150]],
    draw: () => `<ellipse cx="0" cy="-6" rx="70" ry="14" fill="#FF7043" opacity=".4"/><g class="anim-flicker"><path d="M-40 0 Q-46 -24 -24 -36 Q-20 -14 0 -20 Q10 -40 30 -36 Q44 -20 40 0Z" fill="#FF7043"/></g><path d="M-70 -110 Q-90 -20 0 -24 Q90 -20 70 -110Z" fill="#37474F"/><ellipse cx="0" cy="-110" rx="74" ry="18" fill="#263238"/><ellipse cx="0" cy="-112" rx="62" ry="12" fill="#76FF03"/><g class="anim-rise"><circle cx="-20" cy="-130" r="10" fill="#B2FF59"/><circle cx="16" cy="-146" r="7" fill="#B2FF59"/></g>`
  };
  P.potions = {
    spots: [[0, -90]],
    draw: () => `<rect x="-90" y="-8" width="180" height="10" rx="4" fill="#8D6E63"/><path d="M-70 -8 Q-90 -30 -74 -50 V-70 H-58 V-50 Q-42 -30 -62 -8Z" fill="#E040FB"/><rect x="-76" y="-80" width="20" height="10" fill="#8D6E63"/><path d="M-20 -8 Q-44 -40 -14 -56 V-86 H4 V-56 Q34 -40 10 -8Z" fill="#40C4FF"/><rect x="-16" y="-96" width="24" height="12" fill="#8D6E63"/><rect x="40" y="-60" width="34" height="52" rx="8" fill="#FFD740"/><rect x="48" y="-72" width="18" height="12" fill="#8D6E63"/><circle cx="-6" cy="-30" r="6" fill="#fff" opacity=".5"/>`
  };
  P.clock = {
    spots: [[0, -110]],
    draw: () => `${shadow(46, 8)}<rect x="-40" y="-260" width="80" height="260" rx="10" fill="#8D5524"/><circle cx="0" cy="-200" r="34" fill="#FFF8E1" stroke="#FFB300" stroke-width="6"/><path d="M0 -200 V-224 M0 -200 L16 -192" stroke="#333" stroke-width="4" stroke-linecap="round"/><rect x="-22" y="-150" width="44" height="120" rx="6" fill="#5D4037"/><g class="anim-pendulum"><path d="M0 -146 V-60" stroke="#FFB300" stroke-width="3"/><circle cx="0" cy="-58" r="12" fill="#FFB300"/></g>`
  };
  P.table = {
    spots: [[-80, -150], [80, -140]],
    draw: (o) => `${shadow(180, 12)}<rect x="-200" y="-110" width="400" height="22" rx="8" fill="#8D5524"/><path d="M-200 -98 H200 L190 -70 H-190Z" fill="${o.cloth || '#E84A5F'}"/><path d="M-170 -70 V0 M170 -70 V0" stroke="#6D3F1A" stroke-width="16"/>
      <ellipse cx="-80" cy="-114" rx="56" ry="10" fill="#ECEFF1"/><path d="M-120 -116 Q-80 -170 -40 -116Z" fill="#FF8A65"/><path d="M-90 -150 l-10 -20 M-74 -152 l8 -18" stroke="#FFF" stroke-width="5" stroke-linecap="round"/>
      <path d="M40 -112 V-150 H70 V-112Z" fill="#B0BEC5"/><path d="M100 -112 Q100 -160 140 -160 Q170 -160 160 -112Z" fill="#FFD54F"/><circle cx="125" cy="-138" r="8" fill="#E53935"/>`
  };
  P.carpet = {
    spots: [[0, -10]],
    draw: (o) => `<g transform="scale(1 .3)"><rect x="-260" y="-160" width="520" height="320" rx="20" fill="${o.color || '#C62828'}"/><rect x="-230" y="-130" width="460" height="260" rx="14" fill="none" stroke="#FFD23F" stroke-width="12"/><path d="M0 -90 L80 0 L0 90 L-80 0Z" fill="#FFD23F" opacity=".6"/></g>`
  };
  P.portrait = {
    spots: [[0, -60]],
    draw: (o) => `<rect x="-60" y="-140" width="120" height="140" rx="6" fill="#FFB300"/><rect x="-48" y="-128" width="96" height="116" fill="${o.bg || '#90CAF9'}"/><circle cx="0" cy="-86" r="22" fill="#FFCC80"/><path d="M-22 -100 L-22 -120 L-10 -108 L0 -124 L10 -108 L22 -120 L22 -100Z" fill="#FFD23F"/><path d="M-36 -12 Q-36 -56 0 -58 Q36 -56 36 -12Z" fill="${o.robe || '#7B61FF'}"/>`
  };
  P.crown = {
    spots: [[0, -60]],
    draw: () => `<path d="M-40 0 L-46 -50 L-22 -26 L0 -60 L22 -26 L46 -50 L40 0Z" fill="#FFD23F" stroke="#FFB300" stroke-width="4"/><circle cx="0" cy="-16" r="7" fill="#E53935"/><circle cx="-24" cy="-12" r="5" fill="#4FC3F7"/><circle cx="24" cy="-12" r="5" fill="#3DDC84"/>`
  };
  P.gems = {
    spots: [[0, -70]],
    draw: () => `<path d="M-80 0 Q-70 -50 0 -54 Q70 -50 80 0Z" fill="#FFD23F"/><circle cx="-40" cy="-30" r="12" fill="#FFE066"/><circle cx="20" cy="-40" r="12" fill="#FFE066"/><path d="M-10 -40 l14 -20 l14 20 l-14 14z" fill="#E040FB"/><path d="M36 -26 l10 -16 l12 16 l-12 12z" fill="#40C4FF"/><path d="M-60 -16 l10 -14 l10 14 l-10 10z" fill="#3DDC84"/>`
  };
  P.bat = {
    spots: [],
    draw: () => `<g class="anim-bob"><path d="M0 0 Q-20 -24 -50 -14 Q-40 -4 -44 8 Q-24 0 -14 10Z M0 0 Q20 -24 50 -14 Q40 -4 44 8 Q24 0 14 10Z" fill="#5E35B1"/><ellipse cx="0" cy="0" rx="12" ry="14" fill="#7E57C2"/><path d="M-8 -12 L-10 -22 L-2 -14Z M8 -12 L10 -22 L2 -14Z" fill="#7E57C2"/><circle cx="-4" cy="-2" r="2.5" fill="#fff"/><circle cx="4" cy="-2" r="2.5" fill="#fff"/></g>`
  };
  P.web = {
    spots: [],
    draw: () => `<g stroke="#ECEFF1" stroke-width="2" fill="none" opacity=".6"><path d="M0 0 L100 0 M0 0 L0 100 M0 0 L80 60 M0 0 L50 90 M0 0 L95 30"/><path d="M30 0 Q24 18 26 20 Q16 22 0 30 M60 0 Q50 30 50 38 Q30 46 0 60 M90 0 Q78 40 76 56 Q50 72 0 90"/></g>`
  };
  P.telescope = {
    spots: [[30, -160]],
    draw: () => `<path d="M-40 0 L0 -90 L40 0 M0 -90 V0" stroke="#5D4037" stroke-width="7"/><g transform="translate(0 -100) rotate(-30)"><rect x="-80" y="-18" width="160" height="36" rx="10" fill="#1E88E5"/><rect x="60" y="-24" width="30" height="48" rx="8" fill="#FFB300"/><rect x="-96" y="-12" width="20" height="24" rx="4" fill="#FFB300"/></g>`
  };
  P.globe = {
    spots: [[0, -110]],
    draw: () => `<path d="M-30 0 H30 L10 -30 H-10Z" fill="#8D6E63"/><path d="M0 -30 V-40" stroke="#8D6E63" stroke-width="6"/><circle cx="0" cy="-90" r="50" fill="#4FC3F7"/><path d="M-30 -120 Q-10 -110 -20 -90 Q-40 -80 -40 -100Z M10 -80 Q30 -100 40 -80 Q30 -50 10 -60Z M0 -130 Q20 -136 26 -124 Q10 -118 0 -130Z" fill="#66BB6A"/><path d="M-56 -60 A60 60 0 0 0 40 -40" stroke="#FFB300" stroke-width="5" fill="none"/>`
  };
  P.desk = {
    spots: [[0, -150]],
    draw: () => `${shadow(150, 10)}<rect x="-150" y="-100" width="300" height="18" rx="6" fill="#A1683A"/><rect x="-140" y="-82" width="70" height="82" fill="#8D5524"/><rect x="70" y="-82" width="70" height="82" fill="#8D5524"/><rect x="-60" y="-140" width="60" height="40" rx="4" fill="#ECEFF1" transform="rotate(-8 -30 -120)"/><path d="M20 -100 L40 -150" stroke="#FFF" stroke-width="3"/><path d="M40 -150 Q60 -170 50 -140" fill="#fff"/><rect x="70" y="-130" width="50" height="30" rx="4" fill="#E84A5F"/><rect x="74" y="-150" width="42" height="20" rx="4" fill="#4FC3F7"/>`
  };
  P.stairs = {
    spots: [[0, -150]],
    draw: () => {
      let s = '';
      for (let i = 0; i < 8; i++) s += `<rect x="${-140 + i * 20}" y="${-(i + 1) * 28}" width="${280 - i * 40}" height="28" fill="${i % 2 ? '#B8ADD6' : '#A79BC8'}"/>`;
      return s;
    }
  };
  P.moatWater = {
    spots: [],
    draw: (o) => `<rect x="${-(o.w || 800) / 2}" y="0" width="${o.w || 800}" height="${o.h || 80}" fill="#4FC3F7"/><path d="M${-(o.w || 800) / 2} 20 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" stroke="#B3E5FC" stroke-width="5" fill="none"/>`
  };
  P.hedge = {
    spots: [[0, -80]],
    draw: () => `${shadow(70, 9)}<rect x="-64" y="-110" width="128" height="110" rx="30" fill="#43A047"/><rect x="-64" y="-110" width="128" height="30" rx="15" fill="#66BB6A"/>`
  };
  P.topiary = {
    spots: [[0, -150]],
    draw: () => `${shadow(40, 7)}<rect x="-30" y="-40" width="60" height="40" fill="#E57373"/><rect x="-5" y="-110" width="10" height="70" fill="#795548"/><circle cx="0" cy="-150" r="50" fill="#43A047"/><circle cx="-14" cy="-166" r="14" fill="#66BB6A"/>`
  };
  P.fountain = {
    spots: [[0, -200]],
    draw: () => `${shadow(130, 12)}<ellipse cx="0" cy="-20" rx="130" ry="30" fill="#B0BEC5"/><ellipse cx="0" cy="-28" rx="112" ry="20" fill="#4FC3F7"/><rect x="-14" y="-120" width="28" height="94" fill="#CFD8DC"/><ellipse cx="0" cy="-124" rx="56" ry="14" fill="#B0BEC5"/><path d="M0 -130 Q-40 -200 -70 -40 M0 -130 Q40 -200 70 -40" stroke="#B3E5FC" stroke-width="7" fill="none" class="anim-flow" stroke-dasharray="14 10"/><path d="M0 -130 V-180" stroke="#B3E5FC" stroke-width="7"/>`
  };
  P.statue = {
    spots: [[0, -160]],
    draw: () => `${shadow(60, 8)}<rect x="-50" y="-60" width="100" height="60" fill="#B0BEC5"/><rect x="-60" y="-70" width="120" height="14" fill="#CFD8DC"/><path d="M-30 -70 Q-40 -150 0 -160 Q40 -150 30 -70Z" fill="#CFD8DC"/><circle cx="0" cy="-180" r="26" fill="#CFD8DC"/><path d="M-50 -180 L-30 -200 M50 -180 L30 -200" stroke="#CFD8DC" stroke-width="10" stroke-linecap="round"/>`
  };
  P.roofTop = {
    spots: [[0, -60]],
    draw: (o) => `<path d="M-160 0 L-100 -110 H100 L160 0Z" fill="${o.color || '#5E35B1'}"/><path d="M-130 -30 H130 M-112 -62 H112 M-96 -92 H96" stroke="#000" stroke-width="5" opacity=".15"/><rect x="40" y="-160" width="34" height="60" fill="#8D6E63"/>`
  };

  CDL.P = P;

  /* ---------- montagem ---------- */
  CDL.place = function (name, x, y, s = 1, o = {}) {
    const p = P[name];
    if (!p) throw new Error('Primitiva desconhecida: ' + name);
    const flip = !!o.flip;
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${p.draw(o)}</g>`;
  };
})();
