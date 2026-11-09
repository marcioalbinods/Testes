/* =========================================================
   CAÇADORES DE LETRAS — Ilustrações dos mundos 4, 5 e 6
   (Fazenda Encantada, Espaço Sideral e Polo Gelado)
   Mesma convenção de art.js: origem na base do objeto
   (ou no centro para objetos flutuantes).
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const P = CDL.P;
  const shadow = (rx = 40, ry = 8) => `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="#000" opacity=".13"/>`;

  /* ---------------------- FAZENDA ---------------------- */
  P.barn = {
    spots: [[0, -150], [-75, -70]],
    draw: (o) => {
      const c = o.color || '#D84343';
      return `${shadow(140, 14)}<rect x="-120" y="-150" width="240" height="150" fill="${c}"/>
      <path d="M-140 -146 L-90 -230 L90 -230 L140 -146Z" fill="#8E2C2C"/><path d="M-120 -150 L-80 -214 L80 -214 L120 -150Z" fill="${c}"/>
      <rect x="-24" y="-200" width="48" height="36" fill="#FFF3E0"/><path d="M-24 -182 H24 M0 -200 V-164" stroke="#8E2C2C" stroke-width="4"/>
      <rect x="-50" y="-100" width="100" height="100" fill="#FFF3E0"/><rect x="-42" y="-92" width="84" height="92" fill="${c}"/>
      <path d="M-42 -92 L42 0 M42 -92 L-42 0" stroke="#FFF3E0" stroke-width="8"/>
      <rect x="-100" y="-120" width="34" height="30" fill="#FFF3E0"/><rect x="66" y="-120" width="34" height="30" fill="#FFF3E0"/>
      <path d="M-120 -150 V0 M120 -150 V0" stroke="#FFF3E0" stroke-width="8"/>`;
    }
  };
  P.cow = {
    spots: [[90, -100]],
    draw: () => `${shadow(70, 10)}<rect x="-56" y="-46" width="14" height="46" rx="6" fill="#F5F5F5"/><rect x="-30" y="-46" width="14" height="46" rx="6" fill="#EEEEEE"/><rect x="24" y="-46" width="14" height="46" rx="6" fill="#F5F5F5"/><rect x="46" y="-46" width="14" height="46" rx="6" fill="#EEEEEE"/>
      <path d="M-62 -66 Q-90 -60 -84 -30" stroke="#F5F5F5" stroke-width="6" fill="none"/>
      <ellipse cx="0" cy="-70" rx="70" ry="40" fill="#FAFAFA"/><path d="M-40 -100 Q-10 -96 -14 -70 Q-30 -56 -50 -70Z M20 -90 Q44 -96 46 -66 Q30 -54 16 -66Z M-20 -48 Q0 -40 8 -50 Q-6 -62 -20 -48Z" fill="#3E2723"/>
      <ellipse cx="0" cy="-36" rx="16" ry="9" fill="#F8BBD0"/>
      <g transform="translate(78 -92)"><ellipse cx="0" cy="0" rx="26" ry="30" fill="#FAFAFA"/><ellipse cx="0" cy="20" rx="20" ry="14" fill="#F8BBD0"/><circle cx="-6" cy="22" r="3" fill="#8D6E63"/><circle cx="6" cy="22" r="3" fill="#8D6E63"/>
      <circle cx="-10" cy="-4" r="4.5" fill="#222"/><circle cx="10" cy="-4" r="4.5" fill="#222"/><path d="M-20 -24 Q-30 -40 -22 -42 M20 -24 Q30 -40 22 -42" stroke="#E0C097" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="-30" cy="-12" rx="12" ry="6" fill="#3E2723"/><ellipse cx="30" cy="-12" rx="12" ry="6" fill="#FAFAFA"/></g>`
  };
  P.pig = {
    spots: [[70, -70]],
    draw: () => `${shadow(54, 8)}<rect x="-40" y="-30" width="13" height="30" rx="5" fill="#F48FB1"/><rect x="-16" y="-30" width="13" height="30" rx="5" fill="#F06292"/><rect x="14" y="-30" width="13" height="30" rx="5" fill="#F48FB1"/><rect x="34" y="-30" width="13" height="30" rx="5" fill="#F06292"/>
      <path d="M-52 -50 q-14 -6 -10 -16 q6 -6 10 2" stroke="#F48FB1" stroke-width="4" fill="none"/>
      <ellipse cx="0" cy="-48" rx="52" ry="32" fill="#F8BBD0"/><circle cx="46" cy="-62" r="26" fill="#F8BBD0"/><path d="M30 -84 L34 -100 L46 -86Z M54 -86 L64 -100 L66 -82Z" fill="#F48FB1"/>
      <ellipse cx="64" cy="-56" rx="13" ry="10" fill="#F48FB1"/><circle cx="60" cy="-56" r="2.5" fill="#AD1457"/><circle cx="68" cy="-56" r="2.5" fill="#AD1457"/><circle cx="44" cy="-70" r="3.5" fill="#222"/>`
  };
  P.chicken = {
    spots: [[50, -70]],
    draw: (o) => `${shadow(30, 6)}<path d="M-6 -14 V0 M8 -14 V0" stroke="#FFB300" stroke-width="4"/><path d="M-28 -50 Q-50 -70 -36 -86 Q-30 -64 -20 -60Z" fill="${o.tail || '#FFFFFF'}"/>
      <ellipse cx="0" cy="-34" rx="30" ry="24" fill="${o.color || '#FFFFFF'}"/><path d="M-12 -34 Q4 -46 16 -30 Q0 -22 -12 -34Z" fill="#000" opacity=".08"/>
      <circle cx="20" cy="-62" r="16" fill="${o.color || '#FFFFFF'}"/><path d="M12 -78 q4 -10 8 -2 q4 -10 8 0 q4 -6 4 4Z" fill="#E53935"/><path d="M34 -64 L46 -60 L34 -56Z" fill="#FFB300"/><path d="M30 -52 q4 8 -2 10" fill="#E53935"/><circle cx="24" cy="-66" r="3" fill="#222"/>`
  };
  P.chick = {
    spots: [],
    draw: () => `${shadow(18, 4)}<path d="M-4 -6 V0 M5 -6 V0" stroke="#FF8F00" stroke-width="3"/><ellipse cx="0" cy="-16" rx="16" ry="13" fill="#FFE066"/><circle cx="10" cy="-30" r="10" fill="#FFE066"/><path d="M19 -31 L26 -29 L19 -26Z" fill="#FF8F00"/><circle cx="12" cy="-32" r="2" fill="#222"/><path d="M-8 -18 Q0 -26 6 -16" stroke="#FFC107" stroke-width="3" fill="none"/>`
  };
  P.horse = {
    spots: [[100, -150]],
    draw: (o) => {
      const c = o.color || '#A1683A', d = '#6D3F1A';
      return `${shadow(70, 10)}<rect x="-54" y="-60" width="13" height="60" rx="5" fill="${c}"/><rect x="-30" y="-60" width="13" height="60" rx="5" fill="${d}"/><rect x="28" y="-60" width="13" height="60" rx="5" fill="${c}"/><rect x="48" y="-60" width="13" height="60" rx="5" fill="${d}"/>
      <path d="M-62 -90 Q-96 -80 -88 -30 Q-80 -60 -64 -70" fill="${d}"/>
      <ellipse cx="0" cy="-84" rx="68" ry="34" fill="${c}"/><path d="M44 -100 Q60 -150 74 -168 L104 -150 Q86 -120 74 -84Z" fill="${c}"/>
      <path d="M70 -172 Q110 -170 124 -142 Q128 -130 116 -126 Q96 -132 86 -138Z" fill="${c}"/><circle cx="96" cy="-152" r="4.5" fill="#222"/><path d="M78 -178 L80 -194 L90 -176Z" fill="${c}"/>
      <path d="M70 -172 Q50 -150 44 -100 Q54 -140 64 -150 Q56 -120 50 -96" stroke="${d}" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="118" cy="-134" r="3" fill="${d}"/>`;
    }
  };
  P.sheep = {
    spots: [[72, -76]],
    draw: () => `${shadow(54, 8)}<rect x="-30" y="-30" width="10" height="30" rx="4" fill="#424242"/><rect x="-10" y="-30" width="10" height="30" rx="4" fill="#424242"/><rect x="14" y="-30" width="10" height="30" rx="4" fill="#424242"/><rect x="32" y="-30" width="10" height="30" rx="4" fill="#424242"/>
      ${[[-34, -52], [-10, -64], [14, -66], [36, -54], [-24, -36], [6, -38], [30, -36], [-40, -40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#FAFAFA"/>`).join('')}
      <ellipse cx="58" cy="-62" rx="18" ry="22" fill="#424242"/><ellipse cx="44" cy="-74" rx="12" ry="6" fill="#424242" transform="rotate(-30 44 -74)"/><circle cx="54" cy="-66" r="3" fill="#fff"/><circle cx="64" cy="-66" r="3" fill="#fff"/><circle cx="56" cy="-82" r="10" fill="#FAFAFA"/>`
  };
  P.tractor = {
    spots: [[0, -170]],
    draw: (o) => {
      const c = o.color || '#43A047';
      return `${shadow(110, 12)}<rect x="-60" y="-130" width="80" height="80" rx="6" fill="${c}"/><rect x="-50" y="-120" width="60" height="44" rx="4" fill="#B3E5FC"/>
      <rect x="10" y="-90" width="100" height="50" rx="8" fill="${c}"/><rect x="80" y="-130" width="10" height="44" fill="#616161"/><rect x="-70" y="-136" width="100" height="10" rx="4" fill="#2E7D32"/>
      <circle cx="-40" cy="-46" r="46" fill="#333"/><circle cx="-40" cy="-46" r="22" fill="#FFB300"/><circle cx="80" cy="-24" r="24" fill="#333"/><circle cx="80" cy="-24" r="11" fill="#FFB300"/>
      <path d="M-40 -92 V0 M-86 -46 H6" stroke="#222" stroke-width="5" stroke-dasharray="8 10" opacity=".6"/>`;
    }
  };
  P.hay = {
    spots: [[0, -50]],
    draw: () => `${shadow(70, 9)}<rect x="-70" y="-80" width="140" height="80" rx="30" fill="#F2C94C"/><ellipse cx="-56" cy="-40" rx="16" ry="40" fill="#E0B13A"/><path d="M-30 -70 Q0 -60 40 -72 M-34 -40 Q0 -30 50 -44 M-30 -14 Q10 -6 50 -16" stroke="#C99A2E" stroke-width="4" fill="none"/>`
  };
  P.corn = {
    spots: [[0, -110]],
    draw: () => `<path d="M0 0 V-170" stroke="#7CB342" stroke-width="8"/><path d="M0 -40 Q-50 -60 -60 -100 Q-30 -80 0 -70Z M0 -80 Q50 -100 56 -140 Q30 -116 0 -110Z M0 -130 Q-34 -150 -40 -180 Q-14 -160 0 -156Z" fill="#8BC34A"/>
      <g transform="translate(10 -108) rotate(20)"><ellipse rx="14" ry="34" fill="#FFD54F"/><path d="M-8 -26 V26 M0 -32 V32 M8 -26 V26" stroke="#FFB300" stroke-width="3"/><path d="M-14 10 Q-20 -30 0 -38 Q-10 -10 -4 30Z" fill="#9CCC65"/></g>`
  };
  P.carrot = {
    spots: [],
    draw: () => `<path d="M-10 -40 L10 -40 L2 0 L-2 0Z" fill="#FF8C42"/><path d="M-6 -30 H4 M-4 -18 H3" stroke="#E65100" stroke-width="2"/><path d="M0 -40 L-10 -58 M0 -40 L0 -62 M0 -40 L10 -58" stroke="#43A047" stroke-width="5" stroke-linecap="round"/>`
  };
  P.pumpkin = {
    spots: [[0, -40]],
    draw: () => `${shadow(46, 7)}<ellipse cx="-20" cy="-30" rx="24" ry="30" fill="#FB8C00"/><ellipse cx="20" cy="-30" rx="24" ry="30" fill="#FB8C00"/><ellipse cx="0" cy="-30" rx="24" ry="32" fill="#FFA726"/><path d="M0 -60 Q2 -74 10 -78" stroke="#6D4C41" stroke-width="6" fill="none"/><path d="M6 -70 Q20 -84 30 -70" fill="#66BB6A"/>`
  };
  P.scarecrow = {
    spots: [[0, -210], [80, -150]],
    draw: () => `${shadow(40, 7)}<path d="M0 0 V-240 M-90 -170 H90" stroke="#8D6E63" stroke-width="10"/><path d="M-60 -180 H60 L50 -90 H-50Z" fill="#1E88E5"/><path d="M-60 -180 H60 L56 -150 H-56Z" fill="#E53935"/><path d="M-90 -170 l-10 10 M-90 -170 l-12 -4 M90 -170 l10 10 M90 -170 l12 -4" stroke="#F2C94C" stroke-width="5"/>
      <path d="M-50 -90 L-40 -60 M0 -90 V-56 M50 -90 L40 -60" stroke="#F2C94C" stroke-width="5"/><circle cx="0" cy="-206" r="28" fill="#E8D5A3"/><circle cx="-10" cy="-210" r="4" fill="#333"/><circle cx="10" cy="-210" r="4" fill="#333"/><path d="M-12 -196 Q0 -188 12 -196" stroke="#333" stroke-width="3" fill="none"/>
      <ellipse cx="0" cy="-230" rx="46" ry="8" fill="#A1683A"/><path d="M-24 -232 Q-22 -262 0 -262 Q22 -262 24 -232Z" fill="#A1683A"/>`
  };
  P.windmill = {
    spots: [[0, -150], [0, -320]],
    draw: () => `${shadow(70, 10)}<path d="M-56 0 L-30 -260 H30 L56 0Z" fill="#F5F5F5"/><path d="M10 0 L30 -260 H30 L56 0Z" fill="#000" opacity=".07"/><path d="M-16 0 V-50 Q0 -64 16 -50 V0Z" fill="#8D6E63"/><rect x="-14" y="-170" width="28" height="30" fill="#90CAF9"/>
      <path d="M-40 -260 L0 -300 L40 -260Z" fill="#D84343"/>
      <g transform="translate(0 -270)"><g class="anim-spin">${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a})"><rect x="-8" y="-150" width="16" height="140" fill="#A1683A"/><rect x="8" y="-146" width="34" height="110" fill="#FFF8E1" stroke="#A1683A" stroke-width="3"/></g>`).join('')}<circle r="14" fill="#6D4C41"/></g></g>`
  };
  P.well = {
    spots: [[0, -130]],
    draw: () => `${shadow(60, 8)}<rect x="-50" y="-60" width="100" height="60" rx="8" fill="#9AA5B1"/><path d="M-50 -40 H50 M-50 -20 H50 M-20 -60 V-40 M20 -40 V-20 M-10 -20 V0" stroke="#7B8794" stroke-width="4"/>
      <path d="M-40 -60 V-130 M40 -60 V-130" stroke="#8D6E63" stroke-width="8"/><path d="M-60 -126 L0 -170 L60 -126Z" fill="#D84343"/><path d="M0 -130 V-90" stroke="#555" stroke-width="3"/><rect x="-10" y="-92" width="20" height="18" rx="3" fill="#8D6E63"/>`
  };

  /* ---------------------- ESPAÇO ---------------------- */
  P.planet = {
    spots: [[0, 0]],
    draw: (o) => {
      const c = o.color || '#FF8A65', d = o.dark || '#E64A19';
      const ring = o.ring ? `<ellipse rx="120" ry="24" fill="none" stroke="${o.ringColor || '#FFE082'}" stroke-width="12" transform="rotate(-18)"/>` : '';
      const ringFront = o.ring ? `<path d="M-114 22 A120 24 0 0 0 114 -22" fill="none" stroke="${o.ringColor || '#FFE082'}" stroke-width="12" transform="rotate(-18)"/>` : '';
      return `${ring}<circle r="70" fill="${c}"/><path d="M-66 -20 Q0 -6 66 -24 M-70 10 Q0 26 70 6 M-58 40 Q0 54 56 36" stroke="${d}" stroke-width="10" fill="none" opacity=".45"/><circle cx="-24" cy="-26" r="16" fill="#fff" opacity=".2"/>${ringFront}`;
    }
  };
  P.earth = {
    spots: [[0, 0]],
    draw: () => `<circle r="72" fill="#42A5F5"/><path d="M-40 -50 Q-10 -60 0 -40 Q-20 -20 -40 -26 Q-60 -30 -40 -50Z M10 -10 Q40 -24 56 0 Q50 30 24 40 Q0 30 10 -10Z M-60 20 Q-40 14 -30 34 Q-40 50 -56 40Z" fill="#66BB6A"/><circle cx="-24" cy="-30" r="20" fill="#fff" opacity=".15"/><path d="M-50 -60 Q-20 -70 10 -66" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/>`
  };
  P.rocket = {
    spots: [[0, -130]],
    draw: (o) => `<g class="anim-flicker"><path d="M-18 0 Q0 60 18 0Z" fill="#FF7043"/><path d="M-9 0 Q0 34 9 0Z" fill="#FFCA28"/></g>
      <path d="M-40 -20 L-70 10 L-40 -50Z M40 -20 L70 10 L40 -50Z" fill="${o.fin || '#E53935'}"/><path d="M-40 0 V-150 Q0 -230 40 -150 V0Z" fill="#ECEFF1"/><path d="M-40 -150 Q0 -230 40 -150 Q0 -170 -40 -150Z" fill="${o.fin || '#E53935'}"/>
      <circle cx="0" cy="-110" r="18" fill="#4FC3F7" stroke="#90A4AE" stroke-width="6"/><circle cx="-6" cy="-116" r="5" fill="#fff" opacity=".7"/><rect x="-40" y="-40" width="80" height="12" fill="${o.fin || '#E53935'}"/><path d="M-14 0 V-30 M14 0 V-30" stroke="#B0BEC5" stroke-width="5"/>`
  };
  P.alien = {
    spots: [[60, -90]],
    draw: (o) => {
      const c = o.color || '#76FF03';
      return `${shadow(30, 6)}<path d="M-14 -40 L-18 0 M14 -40 L18 0" stroke="${c}" stroke-width="10" stroke-linecap="round"/><ellipse cx="0" cy="-50" rx="24" ry="22" fill="${c}"/><circle cx="0" cy="-92" r="30" fill="${c}"/>
      <path d="M-12 -118 L-22 -140 M12 -118 L22 -140" stroke="${c}" stroke-width="5"/><circle cx="-22" cy="-142" r="6" fill="#FFEB3B"/><circle cx="22" cy="-142" r="6" fill="#FFEB3B"/>
      <ellipse cx="-11" cy="-94" rx="9" ry="12" fill="#212121"/><ellipse cx="11" cy="-94" rx="9" ry="12" fill="#212121"/><circle cx="-8" cy="-98" r="3" fill="#fff"/><circle cx="14" cy="-98" r="3" fill="#fff"/><path d="M-8 -76 Q0 -70 8 -76" stroke="#33691E" stroke-width="3" fill="none"/>`;
    }
  };
  P.astronaut = {
    spots: [[76, -110]],
    draw: () => `${shadow(40, 7)}<rect x="-26" y="-50" width="20" height="50" rx="8" fill="#ECEFF1"/><rect x="6" y="-50" width="20" height="50" rx="8" fill="#ECEFF1"/><rect x="-46" y="-108" width="22" height="50" rx="10" fill="#CFD8DC"/>
      <rect x="-32" y="-112" width="64" height="70" rx="20" fill="#FAFAFA"/><rect x="-14" y="-96" width="28" height="20" rx="4" fill="#90A4AE"/><circle cx="-6" cy="-86" r="3" fill="#E53935"/><circle cx="6" cy="-86" r="3" fill="#4CAF50"/>
      <path d="M32 -100 Q56 -110 60 -136" stroke="#FAFAFA" stroke-width="20" stroke-linecap="round" fill="none"/>
      <circle cx="0" cy="-140" r="36" fill="#FAFAFA"/><ellipse cx="4" cy="-140" rx="26" ry="22" fill="#263238"/><path d="M-10 -152 Q0 -158 12 -152" stroke="#80DEEA" stroke-width="5" fill="none" stroke-linecap="round"/>`
  };
  P.ufo = {
    spots: [[0, -14]],
    draw: (o) => `<g class="anim-float"><path d="M-40 30 L-70 110 L70 110 L40 30Z" fill="#FFF59D" opacity=".18"/><ellipse cx="0" cy="-10" rx="44" ry="40" fill="#B3E5FC" opacity=".85"/><circle cx="0" cy="-18" r="16" fill="${o.alien || '#76FF03'}"/><circle cx="-5" cy="-20" r="4" fill="#222"/><circle cx="5" cy="-20" r="4" fill="#222"/>
      <ellipse cx="0" cy="12" rx="100" ry="28" fill="${o.color || '#9575CD'}"/><ellipse cx="0" cy="6" rx="100" ry="16" fill="#fff" opacity=".2"/>${[-70, -35, 0, 35, 70].map((x, i) => `<circle cx="${x}" cy="16" r="7" fill="${['#FFEB3B', '#FF5252', '#69F0AE'][i % 3]}" class="anim-twinkle"/>`).join('')}</g>`
  };
  P.satellite = {
    spots: [[0, 0]],
    draw: () => `<g class="anim-float"><rect x="-120" y="-24" width="80" height="48" fill="#1E88E5" stroke="#90CAF9" stroke-width="4"/><rect x="40" y="-24" width="80" height="48" fill="#1E88E5" stroke="#90CAF9" stroke-width="4"/><path d="M-100 -24 V24 M-80 -24 V24 M-60 -24 V24 M60 -24 V24 M80 -24 V24 M100 -24 V24" stroke="#90CAF9" stroke-width="2"/>
      <rect x="-40" y="-8" width="80" height="16" fill="#90A4AE"/><rect x="-26" y="-34" width="52" height="68" rx="8" fill="#FFCA28"/><path d="M0 -34 V-60" stroke="#B0BEC5" stroke-width="4"/><circle cx="0" cy="-62" r="7" fill="#FF5252"/></g>`
  };
  P.comet = {
    spots: [[0, 0]],
    draw: (o) => `<path d="M0 -26 Q-150 -40 -260 0 Q-150 40 0 26Z" fill="${o.tail || '#80DEEA'}" opacity=".45"/><path d="M0 -14 Q-110 -20 -190 0 Q-110 20 0 14Z" fill="#E0F7FA" opacity=".7"/><circle r="30" fill="#E0F7FA"/><circle r="20" fill="#fff"/>`
  };
  P.asteroid = {
    spots: [[0, 0]],
    draw: (o) => `<path d="M-50 -10 Q-56 -44 -20 -50 Q10 -66 40 -40 Q62 -12 44 22 Q20 52 -14 44 Q-50 34 -50 -10Z" fill="${o.color || '#8D8D8D'}"/><circle cx="-14" cy="-14" r="12" fill="#000" opacity=".18"/><circle cx="20" cy="10" r="8" fill="#000" opacity=".18"/><circle cx="16" cy="-30" r="6" fill="#000" opacity=".18"/>${o.fire ? '<path d="M44 -30 Q120 -60 170 -50 Q110 -20 50 20Z" fill="#FF7043" opacity=".7"/>' : ''}`
  };
  P.crater = {
    spots: [],
    draw: () => `<ellipse rx="60" ry="16" fill="#000" opacity=".2"/><ellipse cy="-3" rx="48" ry="10" fill="#000" opacity=".15"/><path d="M-60 0 Q0 -26 60 0" stroke="#fff" stroke-opacity=".25" stroke-width="5" fill="none"/>`
  };
  P.spaceFlag = {
    spots: [[50, -110]],
    draw: () => `<path d="M0 0 V-140" stroke="#B0BEC5" stroke-width="5"/><rect x="3" y="-140" width="80" height="50" fill="#FFD23F"/><path d="M30 -128 L36 -114 L50 -114 L39 -106 L43 -94 L30 -102 L17 -94 L21 -106 L10 -114 L24 -114Z" fill="#E53935"/>`
  };
  P.starBig = {
    spots: [[0, 0]],
    draw: (o) => `<path class="anim-twinkle" d="M0 -50 L14 -16 L50 -14 L22 8 L32 44 L0 24 L-32 44 L-22 8 L-50 -14 L-14 -16Z" fill="${o.color || '#FFE066'}" stroke="#FFB300" stroke-width="4"/>`
  };

  /* ---------------------- GELO ---------------------- */
  P.igloo = {
    spots: [[0, -100]],
    draw: () => `${shadow(120, 12)}<path d="M-110 0 Q-110 -130 0 -130 Q110 -130 110 0Z" fill="#FAFDFF"/><path d="M-108 -30 H108 M-96 -64 H96 M-70 -98 H70 M-60 0 V-30 M10 0 V-30 M70 -30 V-64 M-20 -30 V-64 M-40 -64 V-98 M30 -64 V-98" stroke="#B3D4E8" stroke-width="4"/>
      <path d="M-36 0 V-40 Q0 -76 36 -40 V0Z" fill="#FAFDFF" stroke="#B3D4E8" stroke-width="4"/><path d="M-24 0 V-34 Q0 -58 24 -34 V0Z" fill="#455A64"/>`
  };
  P.penguin = {
    spots: [[56, -70]],
    draw: () => `${shadow(30, 6)}<ellipse cx="-10" cy="-2" rx="10" ry="5" fill="#FF8F00"/><ellipse cx="10" cy="-2" rx="10" ry="5" fill="#FF8F00"/><ellipse cx="0" cy="-44" rx="30" ry="42" fill="#263238"/><ellipse cx="0" cy="-36" rx="20" ry="32" fill="#FAFAFA"/>
      <path d="M-28 -60 Q-44 -40 -34 -20 M28 -60 Q44 -40 34 -20" stroke="#263238" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-8" cy="-66" r="4" fill="#fff"/><circle cx="8" cy="-66" r="4" fill="#fff"/><circle cx="-8" cy="-66" r="2" fill="#222"/><circle cx="8" cy="-66" r="2" fill="#222"/><path d="M-6 -58 L6 -58 L0 -50Z" fill="#FF8F00"/>`
  };
  P.snowman = {
    spots: [[0, -190], [76, -90]],
    draw: () => `${shadow(60, 9)}<circle cx="0" cy="-50" r="50" fill="#FAFDFF" stroke="#B3CDE0" stroke-width="3"/><circle cx="0" cy="-130" r="38" fill="#FAFDFF" stroke="#B3CDE0" stroke-width="3"/><circle cx="0" cy="-196" r="28" fill="#FAFDFF" stroke="#B3CDE0" stroke-width="3"/>
      <path d="M-36 -130 L-80 -160 M36 -130 L80 -164" stroke="#6D4C41" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-140" r="4" fill="#333"/><circle cx="0" cy="-122" r="4" fill="#333"/><circle cx="0" cy="-60" r="4" fill="#333"/>
      <path d="M-26 -166 Q0 -152 26 -166 L26 -156 Q0 -142 -26 -156Z" fill="#E53935"/><path d="M14 -160 L22 -128 L32 -130 L24 -160Z" fill="#E53935"/>
      <circle cx="-9" cy="-202" r="3.5" fill="#333"/><circle cx="9" cy="-202" r="3.5" fill="#333"/><path d="M0 -194 L22 -190 L0 -186Z" fill="#FF8C42"/>
      <rect x="-24" y="-246" width="48" height="30" fill="#37474F"/><rect x="-34" y="-220" width="68" height="8" fill="#37474F"/><rect x="-24" y="-228" width="48" height="6" fill="#E53935"/>`
  };
  P.polarBear = {
    spots: [[100, -100]],
    draw: () => `${shadow(70, 10)}<rect x="-54" y="-44" width="22" height="44" rx="10" fill="#F5F5F5" stroke="#9FB3C8" stroke-width="3"/><rect x="-24" y="-44" width="22" height="44" rx="10" fill="#E0E0E0" stroke="#9FB3C8" stroke-width="3"/><rect x="24" y="-44" width="22" height="44" rx="10" fill="#F5F5F5" stroke="#9FB3C8" stroke-width="3"/><rect x="50" y="-44" width="20" height="44" rx="10" fill="#E0E0E0" stroke="#9FB3C8" stroke-width="3"/>
      <ellipse cx="0" cy="-66" rx="74" ry="40" fill="#FAFAFA" stroke="#9FB3C8" stroke-width="3"/><circle cx="78" cy="-82" r="28" fill="#FAFAFA" stroke="#9FB3C8" stroke-width="3"/><circle cx="66" cy="-106" r="9" fill="#FAFAFA" stroke="#9FB3C8" stroke-width="3"/><circle cx="88" cy="-108" r="9" fill="#FAFAFA" stroke="#9FB3C8" stroke-width="3"/>
      <ellipse cx="96" cy="-74" rx="14" ry="10" fill="#EEEEEE"/><circle cx="104" cy="-76" r="5" fill="#222"/><circle cx="82" cy="-88" r="3.5" fill="#222"/>`
  };
  P.seal = {
    spots: [[60, -50]],
    draw: () => `${shadow(54, 7)}<path d="M-60 -8 Q-80 -20 -78 -2 Q-64 6 -50 -2Z" fill="#78909C"/><path d="M-56 0 Q-50 -40 10 -44 Q46 -46 50 -20 Q50 0 30 0Z" fill="#90A4AE"/><circle cx="40" cy="-46" r="22" fill="#90A4AE"/>
      <circle cx="34" cy="-50" r="3.5" fill="#222"/><circle cx="48" cy="-50" r="3.5" fill="#222"/><ellipse cx="44" cy="-38" rx="8" ry="5" fill="#B0BEC5"/><circle cx="44" cy="-40" r="2.5" fill="#333"/><path d="M0 -6 Q-10 4 -20 0" stroke="#78909C" stroke-width="8" stroke-linecap="round" fill="none"/>`
  };
  P.iceberg = {
    spots: [[0, -110]],
    draw: () => `<path d="M-110 0 L-80 -90 L-40 -120 L-10 -200 L30 -130 L70 -150 L110 0Z" fill="#FAFDFF"/><path d="M-10 -200 L30 -130 L70 -150 L110 0 L20 0Z" fill="#B3E5FC"/><path d="M-120 0 H120 L100 30 H-100Z" fill="#81D4FA" opacity=".7"/>`
  };
  P.sled = {
    spots: [[0, -40]],
    draw: () => `${shadow(60, 6)}<path d="M-60 -4 H60 Q80 -4 76 -20" stroke="#78909C" stroke-width="5" fill="none"/><path d="M-40 -4 V-20 M30 -4 V-20" stroke="#78909C" stroke-width="5"/><rect x="-60" y="-34" width="120" height="16" rx="6" fill="#E53935"/><path d="M-50 -26 H50" stroke="#FFCDD2" stroke-width="3"/>`
  };
  P.snowflake = {
    spots: [],
    draw: (o) => `<g class="anim-twinkle" stroke="${o.color || '#FFFFFF'}" stroke-width="4" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M0 -20 V20 M-6 -14 L0 -8 L6 -14 M-6 14 L0 8 L6 14" transform="rotate(${a})"/>`).join('')}</g>`
  };
  P.mitten = {
    spots: [],
    draw: (o) => `<path d="M-16 0 V-40 Q-16 -60 2 -60 Q20 -60 20 -40 V-30 Q30 -40 34 -30 Q36 -20 20 -10 V0Z" fill="${o.color || '#E53935'}"/><rect x="-18" y="-4" width="40" height="12" rx="4" fill="#FAFAFA"/>`
  };
  P.beanie = {
    spots: [],
    draw: (o) => `<path d="M-34 0 Q-34 -50 0 -52 Q34 -50 34 0Z" fill="${o.color || '#1E88E5'}"/><rect x="-38" y="-12" width="76" height="16" rx="6" fill="#FAFAFA"/><path d="M-20 -40 V-10 M0 -48 V-10 M20 -40 V-10" stroke="#fff" stroke-opacity=".3" stroke-width="5"/><circle cx="0" cy="-58" r="12" fill="#FAFAFA"/>`
  };
  P.scarf = {
    spots: [],
    draw: (o) => `<path d="M-60 -30 Q0 -10 60 -30 L60 -14 Q0 6 -60 -14Z" fill="${o.color || '#E53935'}"/><path d="M30 -16 L40 30 L58 28 L50 -22Z" fill="${o.color || '#E53935'}"/><path d="M-40 -24 V-10 M-10 -18 V-4 M20 -20 V-8" stroke="#fff" stroke-opacity=".5" stroke-width="5"/><path d="M42 30 V40 M48 30 V40 M54 28 V38" stroke="${o.color || '#E53935'}" stroke-width="3"/>`
  };
  P.icecream = {
    spots: [],
    draw: (o) => `<path d="M-18 -40 L0 0 L18 -40Z" fill="#E0A45A"/><path d="M-12 -32 L8 -8 M4 -38 L12 -24" stroke="#B77B3A" stroke-width="3"/><circle cx="0" cy="-50" r="20" fill="${o.color || '#F48FB1'}"/><circle cx="0" cy="-74" r="16" fill="${o.c2 || '#FFF59D'}"/><circle cx="4" cy="-90" r="5" fill="#E53935"/>`
  };
  P.mountain = {
    spots: [[0, -260]],
    draw: (o) => `<path d="M-260 0 L-40 -360 Q0 -400 40 -360 L260 0Z" fill="${o.color || '#90A4C8'}"/><path d="M-40 -360 Q0 -400 40 -360 L96 -270 L60 -280 L30 -250 L0 -284 L-34 -252 L-70 -280 L-96 -260Z" fill="#FAFDFF"/><path d="M0 -380 L260 0 L120 0Z" fill="#000" opacity=".08"/>`
  };
  P.iceCrystal = {
    spots: [],
    draw: () => `<path d="M-12 0 L-18 -50 L0 -80 L18 -50 L12 0Z" fill="#B3E5FC" stroke="#E1F5FE" stroke-width="3"/><path d="M0 -80 V0" stroke="#fff" stroke-width="2" opacity=".7"/>`
  };
})();
