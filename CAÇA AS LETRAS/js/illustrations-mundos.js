/* =========================================================
   CAÇADORES DE LETRAS — Ilustrações das palavras 31 a 60
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});
  const p = (...a) => CDL.place(...a);
  const grass = '<rect x="10" y="270" width="280" height="16" rx="8" fill="#8BC34A"/>';
  const snow = '<ellipse cx="150" cy="278" rx="140" ry="16" fill="#E3F2FD"/>';
  const night = '<rect x="0" y="0" width="300" height="300" rx="30" fill="#1A237E"/>' + [[40, 40], [250, 60], [80, 250], [260, 230], [150, 30], [30, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('');

  Object.assign(CDL.ILLUSTRATIONS, {
    VACA: () => grass + p('cow', 125, 275, 1.2),
    MILHO: () => `<g transform="translate(150 150) rotate(15)"><ellipse rx="44" ry="100" fill="#FFD54F"/>${[-24, -8, 8, 24].map((x) => `<path d="M${x} -90 V90" stroke="#FFB300" stroke-width="5"/>`).join('')}<path d="M-40 40 Q-80 -60 -10 -120 Q-30 -20 -10 90Z M40 40 Q80 -60 10 -120 Q30 -20 10 90Z" fill="#8BC34A"/></g>`,
    PORCO: () => grass + p('pig', 140, 270, 1.85),
    CAVALO: () => grass + p('horse', 110, 280, 1.2),
    OVELHA: () => grass + p('sheep', 142, 270, 1.85),
    TRATOR: () => grass + p('tractor', 145, 275, 1.25),
    GALINHA: () => grass + p('chicken', 150, 272, 2.45),
    CENOURA: () => `<g transform="translate(160 280) rotate(-20)">${p('carrot', 0, 0, 3.5)}</g>`,
    PINTINHO: () => grass + p('chick', 140, 275, 5),
    ESPANTALHO: () => grass + p('scarecrow', 150, 280, 1.05),
    NAVE: () => night + p('ufo', 150, 140, 1.3),
    TERRA: () => night + p('earth', 150, 150, 1.7),
    COMETA: () => night + p('comet', 220, 120, 0.85),
    ESTRELA: () => night + p('starBig', 150, 150, 2.4),
    PLANETA: () => night + p('planet', 150, 150, 1.05, { color: '#FFCC80', dark: '#F57C00', ring: true }),
    FOGUETE: () => night + p('rocket', 150, 250, 1.05),
    METEORO: () => night + p('asteroid', 110, 170, 1.5, { fire: true, color: '#8D6E63' }),
    MARCIANO: () => `<ellipse cx="150" cy="282" rx="120" ry="14" fill="#D2691E"/>` + p('alien', 150, 280, 1.75),
    UNIVERSO: () => night + '<g transform="translate(150 150)"><ellipse rx="120" ry="50" fill="#7C4DFF" opacity=".35"/><path d="M0 0 C40 -26 100 -14 112 20 M0 0 C-40 26 -100 14 -112 -20" stroke="#E1BEE7" stroke-width="12" fill="none" stroke-linecap="round"/><circle r="26" fill="#FFF8E1"/></g>' + p('planet', 60, 240, 0.35, { color: '#4DD0E1', dark: '#00838F' }) + p('planet', 245, 70, 0.3, { color: '#FF8A80', dark: '#C62828' }),
    ASTRONAUTA: () => night + p('astronaut', 140, 280, 1.4),
    NEVE: () => '<rect x="0" y="0" width="300" height="300" rx="30" fill="#BBDEFB"/>' + [[80, 80, 2], [210, 100, 2.6], [130, 200, 3], [240, 230, 1.6], [50, 230, 1.4]].map(([x, y, s]) => p('snowflake', x, y, s)).join(''),
    FOCA: () => snow + p('seal', 140, 275, 2.4),
    IGLU: () => snow + p('igloo', 150, 275, 1.2),
    LUVA: () => p('mitten', 120, 260, 4, { color: '#E53935' }),
    GORRO: () => p('beanie', 150, 250, 3.4, { color: '#1E88E5' }),
    BALEIA: () => '<rect x="0" y="180" width="300" height="120" rx="20" fill="#4FC3F7"/>' + p('whale', 140, 170, 0.62),
    PINGUIM: () => snow + p('penguin', 150, 275, 2.6),
    SORVETE: () => p('icecream', 150, 280, 2.6, { color: '#F48FB1', c2: '#FFF59D' }),
    MONTANHA: () => '<rect x="0" y="0" width="300" height="300" rx="30" fill="#BBDEFB"/>' + p('mountain', 150, 290, 0.68),
    CACHECOL: () => `<g transform="translate(150 130) scale(1.9)">${CDL.P.scarf.draw({ color: '#E53935' })}</g>`
  });
})();
