/* =========================================================
   MISSÃO RESPEITO — Ilustrações (SVG gerado por código)
   Personagens, retratos, cenários e ícones.
   ========================================================= */
(function () {
  'use strict';

  let uid = 0;
  const nid = (p) => p + '_' + (++uid);

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ---------------- Pessoas ---------------- */
  const PEOPLE = {
    // Personagens principais (crianças guias)
    ayo:   { name: 'Ayo',   skin: '#6B4226', hair: 'afro',       hairColor: '#1b1210', shirt: '#FFC531', pants: '#2F4B7C' },
    kiara: { name: 'Kiara', skin: '#8D5524', hair: 'braids',     hairColor: '#1b1210', shirt: '#FF8A3D', pants: '#6A4CE0', beads: ['#FF5C8A', '#FFC531', '#14A098'] },
    luna:  { name: 'Luna',  skin: '#F8D9C4', hair: 'wavy',       hairColor: '#A0522D', shirt: '#9B6BFF', pants: '#3D5A80', glasses: true, freckles: true },
    kaua:  { name: 'Kauã',  skin: '#C68A5A', hair: 'straight',   hairColor: '#15100e', shirt: '#2BB673', pants: '#5B4636' },
    mei:   { name: 'Mei',   skin: '#F3CFAE', hair: 'bob',        hairColor: '#15100e', shirt: '#3D8BFF', pants: '#2B2140', clip: '#FF5C8A' },
    theo:  { name: 'Theo',  skin: '#B07848', hair: 'curlyShort', hairColor: '#2e1c10', shirt: '#EF4E4E', pants: '#34495E', wheelchair: true },
    lucia: { name: 'Professora Lúcia', skin: '#5C3A21', hair: 'turban', turban: ['#E94F37', '#F6AE2D', '#14A098'], shirt: '#14A098', pants: '#2B2140', adult: true, earrings: true },
    // Colegas de turma
    rafa:  { name: 'Rafa',  skin: '#E8B48C', hair: 'short',      hairColor: '#3B2416', shirt: '#7B61FF', pants: '#2F3E46' },
    bia:   { name: 'Bia',   skin: '#F6D2B8', hair: 'ponytail',   hairColor: '#C9962E', shirt: '#FF6FA8', pants: '#3D5A80' },
    leo:   { name: 'Léo',   skin: '#C68642', hair: 'short',      hairColor: '#1b1210', shirt: '#00A6A6', pants: '#3B3B58' },
    davi:  { name: 'Davi',  skin: '#F1C27D', hair: 'spiky',      hairColor: '#6B3E1F', shirt: '#4C6EF5', pants: '#3B3B58' },
    nina:  { name: 'Nina',  skin: '#7A4A2A', hair: 'puffs',      hairColor: '#1b1210', shirt: '#F59F00', pants: '#5C4B8A' },
    ninaTurban: { name: 'Nina', skin: '#7A4A2A', hair: 'turban', turban: ['#6A4CE0', '#FFC531', '#FF5C8A'], shirt: '#F59F00', pants: '#5C4B8A' },
    caio:  { name: 'Caio',  skin: '#F6D2B8', hair: 'short',      hairColor: '#B5532A', shirt: '#12B886', pants: '#2F3E46', freckles: true },
    sara:  { name: 'Sara',  skin: '#A0673C', hair: 'curlyLong',  hairColor: '#24150c', shirt: '#E64980', pants: '#364FC7' },
    pedro: { name: 'Pedro', skin: '#E0AC69', hair: 'short',      hairColor: '#24150c', shirt: '#868E96', pants: '#343A40', older: true },
    gui:   { name: 'Gui',   skin: '#F6D2B8', hair: 'spiky',      hairColor: '#1b1210', shirt: '#495057', pants: '#212529', older: true },

    // Personalidades (representações artísticas, não retratos fiéis)
    machado:   { name: 'Machado de Assis', skin: '#A86F45', hair: 'sidePart', hairColor: '#2a2a2a', beard: '#2a2a2a', glasses: 'round', shirt: '#2B2140', collar: '#ffffff', adult: true },
    carolina:  { name: 'Carolina Maria de Jesus', skin: '#5A3622', hair: 'scarf', scarf: '#F4F1EA', scarfStripe: '#7FB3D5', shirt: '#7FB3D5', adult: true },
    conceicao: { name: 'Conceição Evaristo', skin: '#5C3A21', hair: 'curlyGray', hairColor: '#d9d4cc', glasses: 'round', shirt: '#C0392B', adult: true, earrings: true },
    zumbi:     { name: 'Zumbi dos Palmares', skin: '#4A2C1A', hair: 'afroShort', hairColor: '#120c08', headband: '#E9A23B', shirt: '#8B5A2B', adult: true },
    dandara:   { name: 'Dandara dos Palmares', skin: '#56331E', hair: 'wrapHigh', turban: ['#F2B134', '#C0392B', '#F2B134'], shirt: '#C0392B', adult: true, earrings: true },
    milton:    { name: 'Milton Santos', skin: '#4E2F1C', hair: 'shortGray', hairColor: '#9a948c', glasses: 'square', shirt: '#34495E', collar: '#ffffff', adult: true },
    antonieta: { name: 'Antonieta de Barros', skin: '#5E3A22', hair: 'bun', hairColor: '#120c08', shirt: '#6C3483', collar: '#ffffff', adult: true, earrings: true },
    lelia:     { name: 'Lélia Gonzalez', skin: '#5A3622', hair: 'afro', hairColor: '#120c08', glasses: 'round', shirt: '#E67E22', adult: true, earrings: true }
  };

  /* ---------------- Cabelos ---------------- */
  function hairLayers(p) {
    const c = p.hairColor || '#1b1210';
    const d = shade(c, 25);
    let back = '', front = '';
    switch (p.hair) {
      case 'afro':
        back = `<circle cx="60" cy="50" r="45" fill="${c}"/><circle cx="40" cy="30" r="10" fill="${d}" opacity=".35"/><circle cx="82" cy="40" r="8" fill="${d}" opacity=".3"/>`;
        front = `<path d="M28 56 Q28 24 60 22 Q92 24 92 56 Q86 38 60 36 Q34 38 28 56Z" fill="${c}"/>`;
        break;
      case 'afroShort':
        back = `<ellipse cx="60" cy="44" rx="36" ry="30" fill="${c}"/>`;
        front = `<path d="M28 54 Q28 22 60 20 Q92 22 92 54 Q86 38 60 37 Q34 38 28 54Z" fill="${c}"/>`;
        break;
      case 'braids': {
        const beads = p.beads || ['#FF5C8A', '#FFC531', '#14A098'];
        let br = '';
        [22, 31, 89, 98].forEach((x, i) => {
          br += `<rect x="${x - 4}" y="40" width="8" height="${i % 2 ? 66 : 74}" rx="4" fill="${c}"/>`;
          for (let y = 50; y < (i % 2 ? 100 : 108); y += 9) br += `<path d="M${x - 4} ${y} L${x + 4} ${y + 4}" stroke="${d}" stroke-width="1.5"/>`;
          br += `<circle cx="${x}" cy="${i % 2 ? 108 : 116}" r="4.5" fill="${beads[i % beads.length]}"/>`;
        });
        back = `<ellipse cx="60" cy="46" rx="38" ry="32" fill="${c}"/>${br}`;
        front = `<path d="M27 58 Q26 22 60 20 Q94 22 93 58 Q88 36 62 34 L60 40 L58 34 Q32 36 27 58Z" fill="${c}"/>
                 <path d="M60 22 L60 38" stroke="${d}" stroke-width="2"/>`;
        break;
      }
      case 'wavy':
        back = `<path d="M24 60 Q18 96 30 114 Q42 108 44 96 L76 96 Q78 108 90 114 Q102 96 96 60 Q96 18 60 18 Q24 18 24 60Z" fill="${c}"/>`;
        front = `<path d="M28 58 Q30 22 62 22 Q92 24 93 58 Q84 40 70 40 Q58 46 44 40 Q34 44 28 58Z" fill="${c}"/>`;
        break;
      case 'straight':
        back = `<path d="M27 70 Q24 22 60 20 Q96 22 93 70 Z" fill="${c}"/>`;
        front = `<path d="M28 52 Q30 22 60 21 Q90 22 92 52 L84 50 L80 54 L72 50 L66 54 L58 50 L52 54 L44 50 L38 54 L32 50Z" fill="${c}"/>`;
        break;
      case 'bob':
        back = `<path d="M24 86 Q18 24 60 20 Q102 24 96 86 Q90 92 84 86 L84 70 L36 70 L36 86 Q30 92 24 86Z" fill="${c}"/>`;
        front = `<path d="M29 54 Q30 24 60 23 Q90 24 91 54 Q76 46 60 47 Q44 46 29 54Z" fill="${c}"/>` +
          (p.clip ? `<rect x="72" y="34" width="14" height="6" rx="3" fill="${p.clip}" transform="rotate(-20 79 37)"/>` : '');
        break;
      case 'curlyShort': {
        let curls = '';
        const pts = [[32, 44], [38, 34], [47, 27], [57, 24], [67, 24], [77, 28], [85, 35], [89, 45], [42, 40], [52, 33], [64, 32], [76, 36]];
        pts.forEach(([x, y]) => curls += `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/>`);
        back = '';
        front = curls + `<circle cx="50" cy="28" r="3" fill="${d}" opacity=".5"/><circle cx="72" cy="30" r="3" fill="${d}" opacity=".5"/>`;
        break;
      }
      case 'curlyLong': {
        let curls = '';
        for (let i = 0; i < 9; i++) {
          curls += `<circle cx="${24 + (i % 2) * 4}" cy="${44 + i * 7}" r="9" fill="${c}"/><circle cx="${96 - (i % 2) * 4}" cy="${44 + i * 7}" r="9" fill="${c}"/>`;
        }
        back = `<ellipse cx="60" cy="48" rx="40" ry="34" fill="${c}"/>` + curls;
        front = `<path d="M28 56 Q28 22 60 21 Q92 22 92 56 Q86 36 72 38 Q66 32 60 38 Q52 32 46 38 Q34 38 28 56Z" fill="${c}"/>`;
        break;
      }
      case 'puffs':
        back = `<circle cx="26" cy="30" r="18" fill="${c}"/><circle cx="94" cy="30" r="18" fill="${c}"/>`;
        front = `<path d="M28 54 Q28 24 60 22 Q92 24 92 54 Q86 38 60 37 Q34 38 28 54Z" fill="${c}"/>
                 <rect x="34" y="34" width="10" height="6" rx="3" fill="#FFC531" transform="rotate(-35 39 37)"/><rect x="76" y="34" width="10" height="6" rx="3" fill="#FFC531" transform="rotate(35 81 37)"/>`;
        break;
      case 'short':
        front = `<path d="M29 52 Q28 22 60 21 Q92 22 91 52 Q88 36 74 34 Q60 40 48 34 Q34 36 29 52Z" fill="${c}"/>`;
        break;
      case 'spiky':
        front = `<path d="M29 54 Q28 30 34 24 L38 14 L44 22 L50 12 L56 21 L62 11 L68 21 L74 13 L78 23 L86 18 Q92 30 91 54 Q86 36 60 36 Q36 36 29 54Z" fill="${c}"/>`;
        break;
      case 'ponytail':
        back = `<ellipse cx="96" cy="58" rx="12" ry="26" fill="${c}" transform="rotate(-15 96 58)"/>`;
        front = `<path d="M29 54 Q28 22 60 21 Q92 22 91 54 Q84 36 60 36 Q38 38 29 54Z" fill="${c}"/><circle cx="90" cy="38" r="5" fill="#FF5C8A"/>`;
        break;
      case 'sidePart':
        front = `<path d="M29 54 Q28 22 60 20 Q92 22 91 54 Q88 34 50 34 L46 30 Q36 36 29 54Z" fill="${c}"/>`;
        break;
      case 'shortGray':
        front = `<path d="M29 52 Q29 26 60 24 Q91 26 91 52 Q88 38 60 36 Q32 38 29 52Z" fill="${c}"/>`;
        break;
      case 'curlyGray': {
        let curls = '';
        [[30, 46], [34, 34], [44, 26], [56, 22], [68, 22], [80, 27], [88, 36], [92, 48], [26, 58], [94, 60]].forEach(([x, y]) => curls += `<circle cx="${x}" cy="${y}" r="10" fill="${c}"/>`);
        back = curls;
        front = `<path d="M30 52 Q30 26 60 25 Q90 26 90 52 Q84 38 60 38 Q36 38 30 52Z" fill="${c}"/>`;
        break;
      }
      case 'bun':
        back = `<circle cx="60" cy="18" r="14" fill="${c}"/>`;
        front = `<path d="M29 56 Q28 24 60 23 Q92 24 91 56 Q88 40 62 36 Q36 38 29 56Z" fill="${c}"/>`;
        break;
      case 'turban': {
        const t = p.turban || ['#E94F37', '#F6AE2D', '#14A098'];
        front = `<path d="M24 54 Q20 4 60 4 Q100 4 96 54 Q80 40 60 40 Q40 40 24 54Z" fill="${t[0]}"/>
                 <path d="M28 44 Q40 16 70 12 Q88 14 94 34 Q76 22 56 28 Q38 34 28 44Z" fill="${t[1]}"/>
                 <path d="M36 50 Q50 30 82 30 Q90 36 92 46 Q72 36 52 44Z" fill="${t[2]}"/>
                 <circle cx="44" cy="22" r="3" fill="#fff" opacity=".7"/><circle cx="76" cy="20" r="3" fill="#fff" opacity=".7"/><circle cx="62" cy="34" r="2.5" fill="#fff" opacity=".7"/>
                 <ellipse cx="70" cy="8" rx="13" ry="8" fill="${t[1]}"/>`;
        break;
      }
      case 'wrapHigh': {
        const t = p.turban || ['#F2B134', '#C0392B', '#F2B134'];
        front = `<path d="M26 54 Q22 0 60 -2 Q98 0 94 54 Q80 40 60 40 Q40 40 26 54Z" fill="${t[0]}"/>
                 <path d="M28 46 Q34 20 60 16 Q86 20 92 46 Q76 32 60 32 Q44 32 28 46Z" fill="${t[1]}"/>
                 <path d="M40 10 L80 10" stroke="${t[1]}" stroke-width="5" stroke-linecap="round"/>`;
        break;
      }
      case 'scarf': {
        const s = p.scarf || '#F4F1EA', st = p.scarfStripe || '#7FB3D5';
        front = `<path d="M25 58 Q22 12 60 10 Q98 12 95 58 Q84 38 60 38 Q36 38 25 58Z" fill="${s}"/>
                 <path d="M30 40 Q60 20 90 40" stroke="${st}" stroke-width="4" fill="none"/>
                 <path d="M28 50 Q60 28 92 50" stroke="${st}" stroke-width="3" fill="none" opacity=".7"/>
                 <path d="M86 20 Q100 10 102 24 Q96 28 88 26Z" fill="${s}"/>`;
        break;
      }
    }
    return { back, front };
  }

  /* ---------------- Cabeça ---------------- */
  function headSVG(p, mood) {
    const s = p.skin, sd = shade(s, -22);
    const h = hairLayers(p);
    const ry = p.adult ? 34 : 32;
    let eyes = '', brows = '', mouth = '';
    const eyeY = 62;
    const eye = (x) => {
      if (mood === 'closed' || mood === 'laugh') return `<path d="M${x - 5} ${eyeY} Q${x} ${eyeY - 5} ${x + 5} ${eyeY}" stroke="#2a1a12" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      const r = mood === 'surprised' ? 5.5 : 4.4;
      return `<ellipse cx="${x}" cy="${eyeY}" rx="${r - 0.6}" ry="${r}" fill="#2a1a12"/><circle cx="${x + 1.4}" cy="${eyeY - 1.6}" r="1.4" fill="#fff"/>`;
    };
    eyes = eye(48) + eye(72);
    const bc = p.hairColor && !p.hair.includes('Gray') ? p.hairColor : '#2a1a12';
    if (mood === 'sad' || mood === 'worried') {
      brows = `<path d="M42 52 Q46 49 53 51" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round" transform="rotate(10 48 51)"/><path d="M67 51 Q74 49 78 52" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round" transform="rotate(-10 72 51)"/>`;
    } else if (mood === 'angry') {
      brows = `<path d="M42 50 L54 54" stroke="${bc}" stroke-width="2.8" stroke-linecap="round"/><path d="M78 50 L66 54" stroke="${bc}" stroke-width="2.8" stroke-linecap="round"/>`;
    } else if (mood === 'thinking') {
      brows = `<path d="M42 52 Q48 48 54 52" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M66 48 Q72 45 78 49" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    } else {
      brows = `<path d="M42 52 Q48 48 54 51" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M66 51 Q72 48 78 52" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    }
    switch (mood) {
      case 'happy':
      case 'laugh':
        mouth = `<path d="M47 76 Q60 92 73 76 Z" fill="#6b1f2a"/><path d="M49 77 Q60 80 71 77 L70 79 Q60 82 50 79Z" fill="#fff"/><path d="M53 84 Q60 88 67 84 Q60 82 53 84Z" fill="#ff8a9a"/>`;
        break;
      case 'sad':
        mouth = `<path d="M50 84 Q60 76 70 84" stroke="#6b1f2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        break;
      case 'worried':
        mouth = `<path d="M50 82 Q55 78 60 82 Q65 86 70 82" stroke="#6b1f2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        break;
      case 'surprised':
        mouth = `<ellipse cx="60" cy="81" rx="5" ry="6.5" fill="#6b1f2a"/>`;
        break;
      case 'angry':
        mouth = `<path d="M50 83 Q60 78 70 83" stroke="#6b1f2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        break;
      case 'thinking':
        mouth = `<path d="M52 81 L68 79" stroke="#6b1f2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        break;
      default:
        mouth = `<path d="M49 77 Q60 87 71 77" stroke="#6b1f2a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    const cheeks = mood === 'sad' || mood === 'angry' ? '' :
      `<ellipse cx="40" cy="74" rx="6" ry="4" fill="#ff7b8a" opacity=".28"/><ellipse cx="80" cy="74" rx="6" ry="4" fill="#ff7b8a" opacity=".28"/>`;
    let extras = '';
    if (p.freckles) extras += [[40, 68], [44, 71], [37, 72], [80, 68], [76, 71], [83, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${shade(s, -60)}"/>`).join('');
    if (p.beard) extras += `<path d="M34 72 Q36 100 60 102 Q84 100 86 72 Q80 90 60 90 Q40 90 34 72Z" fill="${p.beard}"/><path d="M48 76 Q60 72 72 76 Q60 80 48 76Z" fill="${p.beard}"/>`;
    if (p.glasses) {
      const g = p.glasses === 'square'
        ? `<rect x="38" y="54" width="20" height="16" rx="4" fill="#fff" fill-opacity=".15" stroke="#2a2a2a" stroke-width="2.4"/><rect x="62" y="54" width="20" height="16" rx="4" fill="#fff" fill-opacity=".15" stroke="#2a2a2a" stroke-width="2.4"/>`
        : `<circle cx="48" cy="62" r="10" fill="#fff" fill-opacity=".15" stroke="#3a2a6a" stroke-width="2.4"/><circle cx="72" cy="62" r="10" fill="#fff" fill-opacity=".15" stroke="#3a2a6a" stroke-width="2.4"/>`;
      extras += g + `<path d="M58 61 Q60 59 62 61" stroke="#3a2a6a" stroke-width="2.2" fill="none"/>`;
    }
    if (p.headband) extras += `<path d="M28 46 Q60 34 92 46 L92 52 Q60 40 28 52Z" fill="${p.headband}"/>`;
    const earrings = p.earrings ? `<circle cx="30" cy="76" r="3.6" fill="#FFC531" stroke="#c98d00" stroke-width="1"/><circle cx="90" cy="76" r="3.6" fill="#FFC531" stroke="#c98d00" stroke-width="1"/>` : '';
    return `
      <g class="hair-back">${h.back}</g>
      <circle cx="30" cy="64" r="7" fill="${s}"/><circle cx="90" cy="64" r="7" fill="${s}"/>
      <circle cx="30" cy="64" r="3.5" fill="${sd}" opacity=".5"/><circle cx="90" cy="64" r="3.5" fill="${sd}" opacity=".5"/>
      <ellipse cx="60" cy="62" rx="30" ry="${ry}" fill="${s}"/>
      ${cheeks}${eyes}${brows}
      <path d="M57 68 Q60 72 63 68" stroke="${sd}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${mouth}${extras}${earrings}
      <g class="hair-front">${h.front}</g>`;
  }

  /* Retrato de busto (diálogos, cartões) */
  function portrait(id, mood = 'smile', opts = {}) {
    const p = typeof id === 'string' ? PEOPLE[id] : id;
    if (!p) return '';
    const bg = opts.bg ? `<circle cx="60" cy="66" r="60" fill="${opts.bg}"/>` : '';
    const shirt = p.shirt || '#888';
    const collar = p.collar ? `<path d="M48 104 L60 118 L72 104 L66 100 L60 108 L54 100Z" fill="${p.collar}"/>` : '';
    const clip = opts.bg ? `<clipPath id="${opts.clipId = nid('pc')}"><circle cx="60" cy="66" r="60"/></clipPath>` : '';
    return `<svg viewBox="0 0 120 130" class="portrait" role="img" aria-label="${p.name}" xmlns="http://www.w3.org/2000/svg">
      ${clip}${bg}
      <g ${opts.bg ? `clip-path="url(#${opts.clipId})"` : ''}>
        <path d="M14 134 Q16 104 60 100 Q104 104 106 134Z" fill="${shirt}"/>
        <rect x="52" y="88" width="16" height="16" rx="6" fill="${shade(p.skin, -14)}"/>
        ${collar}
        <g transform="translate(0,-4)">${headSVG(p, mood)}</g>
      </g>
    </svg>`;
  }

  /* Corpo inteiro (cenas) */
  function figure(id, mood = 'smile', pose = 'down', opts = {}) {
    const p = typeof id === 'string' ? PEOPLE[id] : id;
    if (!p) return '';
    const s = p.skin, shirt = p.shirt, pants = p.pants || '#34495E';
    const scale = p.older ? 1.08 : 1;
    let arms = '';
    const arm = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${shirt}" stroke-width="14" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="7" fill="${s}"/>`;
    switch (pose) {
      case 'wave': arms = arm(38, 108, 28, 146) + arm(82, 108, 100, 72); break;
      case 'point': arms = arm(38, 108, 28, 146) + arm(82, 108, 112, 112); break;
      case 'pointL': arms = arm(38, 108, 8, 112) + arm(82, 108, 92, 146); break;
      case 'cross': arms = `<path d="M38 108 Q40 132 76 126" stroke="${shade(shirt, -18)}" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M82 108 Q80 132 44 126" stroke="${shirt}" stroke-width="14" stroke-linecap="round" fill="none"/>`; break;
      case 'hug': arms = arm(38, 108, 6, 122) + arm(82, 108, 114, 122); break;
      case 'up': arms = arm(38, 108, 18, 72) + arm(82, 108, 102, 72); break;
      case 'hold': arms = arm(38, 108, 48, 132) + arm(82, 108, 72, 132); break;
      default: arms = arm(38, 108, 30, 148) + arm(82, 108, 90, 148);
    }
    let lower;
    if (p.wheelchair) {
      lower = `
        <path d="M40 150 L84 150 L84 160 L40 160Z" fill="${pants}"/>
        <path d="M78 152 L96 152 L98 186" stroke="${pants}" stroke-width="13" stroke-linecap="round" fill="none"/>
        <ellipse cx="102" cy="190" rx="8" ry="4" fill="#2b2140"/>
        <circle cx="54" cy="182" r="32" fill="none" stroke="#4a4a68" stroke-width="6"/>
        <circle cx="54" cy="182" r="24" fill="none" stroke="#9aa0c3" stroke-width="2"/>
        <circle cx="54" cy="182" r="4" fill="#4a4a68"/>
        <path d="M54 158 L54 206 M30 182 L78 182" stroke="#9aa0c3" stroke-width="1.6"/>
        <circle cx="100" cy="208" r="7" fill="none" stroke="#4a4a68" stroke-width="4"/>
        <path d="M28 100 L28 150 L92 150 L100 200" stroke="#4a4a68" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    } else {
      lower = `
        <rect x="42" y="148" width="16" height="52" rx="7" fill="${pants}"/>
        <rect x="62" y="148" width="16" height="52" rx="7" fill="${pants}"/>
        <ellipse cx="48" cy="204" rx="13" ry="7" fill="#2b2140"/>
        <ellipse cx="74" cy="204" rx="13" ry="7" fill="#2b2140"/>`;
    }
    const body = `<path d="M36 104 Q36 96 48 96 L72 96 Q84 96 84 104 L86 156 L34 156Z" fill="${shirt}"/>
      ${p.collar ? `<path d="M50 96 L60 108 L70 96Z" fill="${p.collar}"/>` : ''}`;
    const shadow = `<ellipse cx="60" cy="212" rx="40" ry="7" fill="#000" opacity=".12"/>`;
    return `<svg viewBox="-8 -12 136 232" class="figure ${opts.cls || ''}" role="img" aria-label="${p.name}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${60 - 60 * scale},${(1 - scale) * 200}) scale(${scale})">
      ${shadow}${lower}${body}${arms}
      <rect x="53" y="76" width="14" height="24" rx="5" fill="${shade(s, -14)}"/>
      <g transform="translate(5,-14) scale(.92)">${headSVG(p, mood)}</g>
      ${opts.prop || ''}
      </g>
    </svg>`;
  }

  /* ---------------- Cenários ---------------- */
  const BG = {
    recreio: () => `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="skyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED8FF"/><stop offset="1" stop-color="#DDF3FF"/></linearGradient></defs>
      <rect width="1000" height="600" fill="url(#skyR)"/>
      <circle cx="870" cy="90" r="50" fill="#FFD54A"/><circle cx="870" cy="90" r="70" fill="#FFD54A" opacity=".25"/>
      <g fill="#fff" opacity=".9"><ellipse cx="180" cy="90" rx="70" ry="26"/><ellipse cx="230" cy="74" rx="46" ry="30"/><ellipse cx="560" cy="60" rx="60" ry="22"/><ellipse cx="600" cy="48" rx="36" ry="24"/></g>
      <rect x="300" y="150" width="420" height="200" rx="8" fill="#FFB86B"/><path d="M280 160 L510 70 L740 160Z" fill="#E8613C"/>
      <g fill="#BDE7FF" stroke="#fff" stroke-width="5"><rect x="340" y="190" width="70" height="60" rx="6"/><rect x="440" y="190" width="70" height="60" rx="6"/><rect x="610" y="190" width="70" height="60" rx="6"/></g>
      <rect x="530" y="250" width="60" height="100" rx="6" fill="#8B5A3C"/>
      <text x="510" y="135" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="26" font-weight="700" fill="#fff">ESCOLA</text>
      <path d="M0 340 Q250 300 500 330 Q750 360 1000 320 L1000 600 L0 600Z" fill="#7FD17A"/>
      <path d="M0 420 Q300 390 600 420 Q820 440 1000 410 L1000 600 L0 600Z" fill="#62C25E"/>
      <rect x="110" y="200" width="26" height="150" fill="#8B5A3C"/><circle cx="123" cy="190" r="70" fill="#3FAE4A"/><circle cx="80" cy="220" r="44" fill="#4CBB57"/><circle cx="165" cy="215" r="46" fill="#4CBB57"/>
      <g stroke="#fff" stroke-width="4" fill="none" opacity=".7"><rect x="780" y="440" width="50" height="50"/><rect x="830" y="440" width="50" height="50"/><rect x="805" y="390" width="50" height="50"/></g>
      <g>${[80, 200, 320, 440, 560, 680, 800, 920].map((x, i) => `<path d="M${x - 60} 20 Q${x} 50 ${x + 60} 20" stroke="#fff" stroke-width="2" fill="none"/><path d="M${x - 14} 32 L${x + 14} 32 L${x} 58Z" fill="${['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0'][i % 4]}"/>`).join('')}</g>
    </svg>`,
    sala: () => `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="600" fill="#FFE9C7"/>
      <rect y="420" width="1000" height="180" fill="#E4B57E"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<rect x="${i * 100}" y="420" width="100" height="180" fill="${i % 2 ? '#DDA96E' : '#E4B57E'}"/>`).join('')}
      <rect x="250" y="70" width="500" height="230" rx="10" fill="#2E6B4F" stroke="#9C6B3E" stroke-width="14"/>
      <text x="500" y="160" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="44" fill="#fff" opacity=".92">Bom dia, turma!</text>
      <text x="500" y="225" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="28" fill="#FFE08A" opacity=".9">Aqui todo mundo aprende junto</text>
      <rect x="50" y="90" width="150" height="180" rx="8" fill="#BDE7FF" stroke="#fff" stroke-width="10"/><path d="M125 90 L125 270 M50 180 L200 180" stroke="#fff" stroke-width="8"/>
      <rect x="800" y="90" width="150" height="180" rx="8" fill="#BDE7FF" stroke="#fff" stroke-width="10"/><path d="M875 90 L875 270 M800 180 L950 180" stroke="#fff" stroke-width="8"/>
      ${'ABCDEFGHIJ'.split('').map((l, i) => `<rect x="${60 + i * 90}" y="18" width="56" height="40" rx="8" fill="${['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0', '#FF8A3D'][i % 5]}"/><text x="${88 + i * 90}" y="47" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="26" font-weight="700" fill="#fff">${l}</text>`).join('')}
      <rect x="60" y="330" width="180" height="20" rx="6" fill="#B07A4A"/><rect x="760" y="330" width="180" height="20" rx="6" fill="#B07A4A"/>
    </svg>`,
    arte: () => `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="600" fill="#E9F4FF"/>
      <rect y="430" width="1000" height="170" fill="#C9D6E8"/>
      ${[[90, 90, '#FF5C8A'], [260, 120, '#FFC531'], [800, 80, '#14A098'], [640, 110, '#6A4CE0']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="120" height="90" rx="6" fill="#fff" stroke="#8B5A3C" stroke-width="6"/><circle cx="${x + 40}" cy="${y + 45}" r="22" fill="${c}"/><rect x="${x + 64}" y="${y + 26}" width="36" height="40" rx="6" fill="${c}" opacity=".5"/>`).join('')}
      <g transform="translate(430,140)"><path d="M0 260 L70 0 L140 260" stroke="#8B5A3C" stroke-width="10" fill="none"/><rect x="10" y="40" width="120" height="150" rx="6" fill="#fff" stroke="#8B5A3C" stroke-width="6"/>
      ${['#5A3420', '#7A4A2A', '#A0673C', '#C68642', '#E8B48C', '#F6D2B8'].map((c, i) => `<circle cx="${34 + (i % 3) * 36}" cy="${84 + Math.floor(i / 3) * 50}" r="15" fill="${c}"/>`).join('')}</g>
      ${['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0', '#FF8A3D'].map((c, i) => `<rect x="${60 + i * 34}" y="380" width="22" height="50" rx="6" fill="${c}"/>`).join('')}
    </svg>`,
    patio: () => `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="600" fill="#FFF1D6"/>
      <rect y="360" width="1000" height="240" fill="#F2C48D"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${i * 200} 360 L${i * 200 + 100} 600" stroke="#E7B275" stroke-width="3"/>`).join('')}
      <rect x="60" y="80" width="880" height="200" rx="16" fill="#FFD9A0"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${100 + i * 120}" y="110" width="80" height="140" rx="40" fill="#BDE7FF" stroke="#fff" stroke-width="6"/>`).join('')}
      <g>${[100, 220, 340, 460, 580, 700, 820, 940].map((x, i) => `<path d="M${x - 60} 30 Q${x} 60 ${x + 60} 30" stroke="#8B5A3C" stroke-width="2" fill="none"/><path d="M${x - 14} 42 L${x + 14} 42 L${x} 68Z" fill="${['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0', '#FF8A3D'][i % 5]}"/>`).join('')}</g>
    </svg>`,
    saida: () => `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="600" fill="#FFD7B5"/>
      <rect width="1000" height="300" fill="#FFC8A2"/>
      <circle cx="160" cy="110" r="56" fill="#FFB347"/>
      <rect x="0" y="210" width="1000" height="150" fill="#E8D5C4"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<rect x="${i * 100}" y="200" width="12" height="170" fill="#6C757D"/>`).join('')}
      <rect x="0" y="200" width="1000" height="12" fill="#6C757D"/><rect x="0" y="280" width="1000" height="8" fill="#6C757D"/>
      <rect x="380" y="150" width="240" height="60" rx="10" fill="#14A098"/><text x="500" y="192" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="32" font-weight="700" fill="#fff">SAÍDA</text>
      <rect y="380" width="1000" height="220" fill="#B9B9C7"/><rect y="370" width="1000" height="22" fill="#D7D7E0"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${60 + i * 220}" y="480" width="110" height="14" rx="6" fill="#fff" opacity=".8"/>`).join('')}
      <rect x="840" y="240" width="20" height="150" fill="#8B5A3C"/><circle cx="850" cy="220" r="60" fill="#4CBB57"/>
    </svg>`,
    biblioteca: () => `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="600" fill="#F6EAD7"/>
      <rect y="440" width="1000" height="160" fill="#C99A6B"/>
      ${[0, 1, 2].map(r => `<rect x="40" y="${60 + r * 120}" width="920" height="14" fill="#8B5A3C"/>` +
        Array.from({ length: 30 }, (_, i) => `<rect x="${50 + i * 30}" y="${60 + r * 120 - 70 - ((i * 7 + r * 3) % 20)}" width="24" height="${70 + ((i * 7 + r * 3) % 20)}" rx="3" fill="${['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0', '#FF8A3D', '#3D8BFF'][(i + r) % 6]}"/>`).join('')).join('')}
    </svg>`
  };

  /* ---------------- Ícones ---------------- */
  const I = {
    berimbau: `<svg viewBox="0 0 64 64"><path d="M20 6 Q48 30 22 58" stroke="#8B5A3C" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M20 6 L22 58" stroke="#555" stroke-width="1.5"/><circle cx="30" cy="48" r="10" fill="#E9A23B" stroke="#8B5A3C" stroke-width="2"/><ellipse cx="27" cy="48" rx="4" ry="6" fill="#7a4a1a"/></svg>`,
    atabaque: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="12" rx="16" ry="6" fill="#F4E1C1" stroke="#8B5A3C" stroke-width="2"/><path d="M16 12 L20 58 L44 58 L48 12" fill="#B5651D" stroke="#8B5A3C" stroke-width="2"/><path d="M18 24 L46 24 M19 40 L45 40" stroke="#5B3A1A" stroke-width="2.5"/><path d="M22 12 L26 58 M42 12 L38 58" stroke="#F2C14E" stroke-width="2"/></svg>`,
    pandeiro: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#F4E1C1" stroke="#C0392B" stroke-width="6"/>${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="${32 + 24 * Math.cos(a * Math.PI / 180)}" cy="${32 + 24 * Math.sin(a * Math.PI / 180)}" r="4" fill="#F2C14E" stroke="#8a6a10" stroke-width="1"/>`).join('')}</svg>`,
    agogo: `<svg viewBox="0 0 64 64"><path d="M14 44 L22 14 L30 44Z" fill="#C9CED6" stroke="#6C757D" stroke-width="2"/><path d="M34 50 L42 22 L50 50Z" fill="#DEE2E6" stroke="#6C757D" stroke-width="2"/><path d="M22 14 Q32 2 42 22" stroke="#6C757D" stroke-width="3" fill="none"/><path d="M8 58 L20 48" stroke="#8B5A3C" stroke-width="3" stroke-linecap="round"/></svg>`,
    acaraje: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="46" rx="26" ry="8" fill="#fff" stroke="#ccc" stroke-width="2"/><ellipse cx="32" cy="36" rx="20" ry="14" fill="#D9822B"/><path d="M14 34 Q32 28 50 34 Q32 42 14 34Z" fill="#F2C14E"/><circle cx="26" cy="33" r="3" fill="#E74C3C"/><circle cx="36" cy="32" r="3" fill="#E74C3C"/><path d="M22 36 Q32 40 42 35" stroke="#2BB673" stroke-width="2" fill="none"/></svg>`,
    abayomi: `<svg viewBox="0 0 64 64"><circle cx="32" cy="14" r="9" fill="#2a1a12"/><path d="M24 10 Q32 0 40 10" fill="#FF5C8A"/><path d="M20 26 L44 26 L50 58 L14 58Z" fill="#FF8A3D"/><path d="M20 28 L8 40 M44 28 L56 40" stroke="#2a1a12" stroke-width="5" stroke-linecap="round"/><path d="M18 44 L46 44" stroke="#FFC531" stroke-width="4"/><path d="M28 24 L36 24 L32 30Z" fill="#2a1a12"/></svg>`,
    crown: `<svg viewBox="0 0 64 64"><path d="M8 48 L12 18 L24 34 L32 12 L40 34 L52 18 L56 48Z" fill="#FFC531" stroke="#C98D00" stroke-width="2.5" stroke-linejoin="round"/><rect x="8" y="48" width="48" height="8" rx="3" fill="#E9A23B"/><circle cx="32" cy="38" r="4" fill="#E74C3C"/><circle cx="20" cy="40" r="3" fill="#14A098"/><circle cx="44" cy="40" r="3" fill="#6A4CE0"/></svg>`,
    fire: `<svg viewBox="0 0 64 64"><path d="M32 6 Q44 22 42 32 Q48 28 48 20 Q58 34 52 46 Q46 58 32 58 Q16 58 12 44 Q10 32 22 22 Q22 32 28 34 Q24 18 32 6Z" fill="#FF8A3D"/><path d="M32 30 Q40 40 38 48 Q34 54 30 52 Q24 48 28 40Z" fill="#FFC531"/><path d="M14 60 L50 54 M14 54 L50 60" stroke="#8B5A3C" stroke-width="4" stroke-linecap="round"/></svg>`,
    book: `<svg viewBox="0 0 64 64"><path d="M6 14 Q20 8 32 14 L32 56 Q20 50 6 56Z" fill="#3D8BFF"/><path d="M58 14 Q44 8 32 14 L32 56 Q44 50 58 56Z" fill="#6A4CE0"/><path d="M12 22 L26 20 M12 30 L26 28 M12 38 L26 36 M38 20 L52 22 M38 28 L52 30 M38 36 L52 38" stroke="#fff" stroke-width="2" opacity=".8"/></svg>`,
    globe: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#3D8BFF"/><path d="M18 18 Q26 16 28 24 Q22 30 26 36 Q20 40 14 34 Q10 26 18 18Z M36 12 Q46 14 50 22 Q44 26 40 22 Q34 22 36 12Z M34 38 Q44 34 50 40 Q46 52 38 54 Q36 46 34 38Z" fill="#2BB673"/><ellipse cx="32" cy="32" rx="26" ry="26" fill="none" stroke="#fff" stroke-width="1.5" opacity=".5"/><path d="M6 32 L58 32 M32 6 Q16 32 32 58 Q48 32 32 6" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/></svg>`,
    school: `<svg viewBox="0 0 64 64"><path d="M6 26 L32 8 L58 26Z" fill="#E8613C"/><rect x="10" y="26" width="44" height="30" fill="#FFB86B"/><rect x="27" y="38" width="10" height="18" fill="#8B5A3C"/><rect x="15" y="32" width="8" height="8" fill="#BDE7FF"/><rect x="41" y="32" width="8" height="8" fill="#BDE7FF"/><path d="M32 8 L32 0 L40 3 L32 6" fill="#14A098"/></svg>`,
    pen: `<svg viewBox="0 0 64 64"><path d="M48 6 Q60 8 56 20 Q44 40 22 52 L14 54 L16 46 Q30 22 48 6Z" fill="#F4E1C1" stroke="#8B5A3C" stroke-width="2"/><path d="M20 48 Q36 30 50 12" stroke="#8B5A3C" stroke-width="1.5" fill="none"/><path d="M8 60 Q20 56 30 60" stroke="#2B2140" stroke-width="2" fill="none"/></svg>`,
    quilombo: `<svg viewBox="0 0 64 64"><path d="M2 56 Q32 30 62 56Z" fill="#62C25E"/><path d="M10 40 L20 28 L30 40Z" fill="#C9962E"/><rect x="12" y="40" width="16" height="12" fill="#B5651D"/><path d="M34 36 L46 22 L58 36Z" fill="#C9962E"/><rect x="36" y="36" width="20" height="14" fill="#B5651D"/><rect x="42" y="42" width="6" height="8" fill="#5B3A1A"/><circle cx="50" cy="10" r="6" fill="#FFC531"/></svg>`,
    star: `<svg viewBox="0 0 64 64"><path d="M32 4 L40 23 L60 24 L44 37 L50 58 L32 46 L14 58 L20 37 L4 24 L24 23Z" fill="#FFC531" stroke="#C98D00" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    heart: `<svg viewBox="0 0 64 64"><path d="M32 56 Q4 36 8 18 Q14 4 32 16 Q50 4 56 18 Q60 36 32 56Z" fill="#FF5C8A"/><ellipse cx="20" cy="20" rx="5" ry="3" fill="#fff" opacity=".5" transform="rotate(-30 20 20)"/></svg>`,
    hands: `<svg viewBox="0 0 64 64"><path d="M4 40 Q12 30 22 32 L34 34 Q38 36 34 40 L24 40" fill="#C68642" stroke="#7a4a1a" stroke-width="1.5"/><path d="M60 40 Q52 30 42 32 L30 34 Q26 36 30 40 L40 40" fill="#6B4226" stroke="#3a220f" stroke-width="1.5"/><path d="M24 40 Q32 48 40 40" fill="#F1C27D" stroke="#a07a40" stroke-width="1.5"/><path d="M32 6 Q26 0 22 6 Q20 12 32 20 Q44 12 42 6 Q38 0 32 6Z" fill="#FF5C8A"/></svg>`,
    scroll: `<svg viewBox="0 0 64 64"><rect x="14" y="10" width="36" height="44" rx="3" fill="#F4E1C1" stroke="#B08850" stroke-width="2"/><ellipse cx="14" cy="32" rx="5" ry="22" fill="#E2C792" stroke="#B08850" stroke-width="2"/><ellipse cx="50" cy="32" rx="5" ry="22" fill="#E2C792" stroke="#B08850" stroke-width="2"/><path d="M22 20 L42 20 M22 28 L42 28 M22 36 L38 36 M22 44 L40 44" stroke="#8B5A3C" stroke-width="2"/></svg>`,
    anvil: `<svg viewBox="0 0 64 64"><path d="M8 24 L50 24 Q58 24 58 30 L44 32 L40 42 L24 42 L20 32 Q8 32 8 24Z" fill="#6C757D"/><rect x="20" y="42" width="24" height="6" fill="#495057"/><rect x="14" y="48" width="36" height="8" rx="2" fill="#343A40"/><path d="M40 6 L52 18" stroke="#8B5A3C" stroke-width="4" stroke-linecap="round"/><rect x="44" y="2" width="14" height="8" rx="2" fill="#495057" transform="rotate(45 51 6)"/><circle cx="30" cy="16" r="2" fill="#FF8A3D"/><circle cx="24" cy="12" r="1.5" fill="#FFC531"/></svg>`,
    pyramid: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#FFE8B0"/><path d="M4 54 L28 16 L52 54Z" fill="#E9A23B"/><path d="M28 16 L52 54 L40 54Z" fill="#C98D00"/><path d="M36 54 L50 32 L62 54Z" fill="#E9A23B"/><circle cx="50" cy="12" r="6" fill="#FF8A3D"/></svg>`,
    music: `<svg viewBox="0 0 64 64"><path d="M24 46 L24 12 L54 6 L54 40" stroke="#6A4CE0" stroke-width="5" fill="none" stroke-linejoin="round"/><ellipse cx="18" cy="48" rx="9" ry="7" fill="#6A4CE0"/><ellipse cx="48" cy="42" rx="9" ry="7" fill="#6A4CE0"/></svg>`,
    words: `<svg viewBox="0 0 64 64"><path d="M6 10 L58 10 Q60 10 60 14 L60 40 Q60 44 56 44 L24 44 L12 56 L14 44 L8 44 Q4 44 4 40 L4 14 Q4 10 8 10Z" fill="#14A098"/><path d="M14 22 L50 22 M14 32 L40 32" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
    palm: `<svg viewBox="0 0 64 64"><path d="M32 60 Q30 40 34 24" stroke="#8B5A3C" stroke-width="5" fill="none"/><path d="M34 24 Q20 10 4 18 Q20 16 34 24 Q30 6 14 4 Q30 10 34 24 Q42 6 58 8 Q42 12 34 24 Q50 14 62 26 Q48 20 34 24Z" fill="#2BB673"/><circle cx="31" cy="28" r="3.5" fill="#E74C3C"/><circle cx="37" cy="28" r="3.5" fill="#FF8A3D"/><circle cx="34" cy="32" r="3.5" fill="#E74C3C"/></svg>`,
    okra: `<svg viewBox="0 0 64 64"><path d="M20 10 Q14 30 26 56 Q40 40 30 12Z" fill="#2BB673" stroke="#1d7d4f" stroke-width="2"/><path d="M38 14 Q36 34 50 54 Q58 34 46 12Z" fill="#3CC47C" stroke="#1d7d4f" stroke-width="2"/><path d="M24 6 L30 12 M42 8 L46 12" stroke="#1d7d4f" stroke-width="3" stroke-linecap="round"/></svg>`,
    capoeira: `<svg viewBox="0 0 64 64"><circle cx="20" cy="12" r="6" fill="#6B4226"/><path d="M20 18 L22 36 L10 52 M22 36 L34 48 M20 24 L8 18 M20 24 L32 22" stroke="#FFC531" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="46" cy="24" r="6" fill="#8D5524"/><path d="M46 30 L44 44 L54 58 M44 44 L36 58 M46 34 L56 28 M46 34 L36 40" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M46 30 L44 44 L54 58 M44 44 L36 58 M46 34 L56 28 M46 34 L36 40" stroke="#14A098" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
    braids: `<svg viewBox="0 0 64 64"><circle cx="32" cy="26" r="16" fill="#2a1a12"/><ellipse cx="32" cy="30" rx="11" ry="13" fill="#8D5524"/>${[14, 20, 44, 50].map((x, i) => `<rect x="${x - 3}" y="22" width="6" height="34" rx="3" fill="#2a1a12"/><circle cx="${x}" cy="58" r="3" fill="${['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0'][i]}"/>`).join('')}</svg>`,
    turbante: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="42" rx="14" ry="16" fill="#6B4226"/><path d="M14 38 Q10 6 32 6 Q54 6 50 38 Q40 28 32 28 Q24 28 14 38Z" fill="#E94F37"/><path d="M16 30 Q24 12 40 10 Q50 14 50 26 Q38 18 28 22 Q20 26 16 30Z" fill="#F6AE2D"/><ellipse cx="38" cy="6" rx="8" ry="5" fill="#14A098"/></svg>`,
    mic: `<svg viewBox="0 0 64 64"><rect x="22" y="4" width="20" height="32" rx="10" fill="#6A4CE0"/><path d="M14 28 Q14 46 32 46 Q50 46 50 28" stroke="#2B2140" stroke-width="4" fill="none"/><path d="M32 46 L32 58 M22 58 L42 58" stroke="#2B2140" stroke-width="4" stroke-linecap="round"/></svg>`,
    vote: `<svg viewBox="0 0 64 64"><rect x="10" y="28" width="44" height="30" rx="4" fill="#3D8BFF"/><rect x="18" y="24" width="28" height="6" rx="2" fill="#2B2140"/><rect x="22" y="6" width="20" height="24" rx="2" fill="#fff" stroke="#999" stroke-width="2"/><path d="M26 18 L31 23 L40 12" stroke="#2BB673" stroke-width="3" fill="none"/></svg>`,
    teacher: `<svg viewBox="0 0 64 64"><rect x="4" y="8" width="40" height="28" rx="3" fill="#2E6B4F" stroke="#9C6B3E" stroke-width="3"/><path d="M10 18 L30 18 M10 26 L24 26" stroke="#fff" stroke-width="2.5"/><circle cx="48" cy="30" r="8" fill="#5C3A21"/><path d="M38 60 Q40 42 48 42 Q56 42 58 60Z" fill="#14A098"/><path d="M42 24 Q42 16 48 16 Q56 16 56 26 Q50 20 42 24Z" fill="#E94F37"/></svg>`,
    magnifier: `<svg viewBox="0 0 64 64"><circle cx="26" cy="26" r="17" fill="#BDE7FF" stroke="#2B2140" stroke-width="6"/><path d="M38 38 L56 56" stroke="#8B5A3C" stroke-width="9" stroke-linecap="round"/><path d="M17 20 Q20 14 27 13" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    compass: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#fff" stroke="#2B2140" stroke-width="3"/><path d="M32 6 L38 26 L58 32 L38 38 L32 58 L26 38 L6 32 L26 26Z" fill="#FF8A3D"/><circle cx="32" cy="32" r="6" fill="#FFC531"/></svg>`,
    poster: `<svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="54" rx="4" fill="#fff" stroke="#FF5C8A" stroke-width="4"/><rect x="16" y="12" width="32" height="8" rx="2" fill="#FF8A3D"/><circle cx="32" cy="34" r="8" fill="#14A098"/><path d="M18 50 L46 50" stroke="#6A4CE0" stroke-width="4" stroke-linecap="round"/></svg>`
  };

  function icon(name, cls = '') {
    const s = I[name];
    if (!s) return '';
    return s.replace('<svg ', `<svg class="ico ${cls}" aria-hidden="true" focusable="false" `);
  }

  /* Ilustração do quebra-cabeça: roda de capoeira */
  function rodaArt() {
    const kids = ['ayo', 'kiara', 'kaua', 'luna', 'mei', 'theo', 'nina', 'leo'];
    let ring = '';
    kids.forEach((k, i) => {
      const a = (i / kids.length) * Math.PI * 2 - Math.PI / 2;
      const x = 150 + Math.cos(a) * 112, y = 160 + Math.sin(a) * 100;
      ring += `<g transform="translate(${x - 26},${y - 28}) scale(.44)">${headSVG(PEOPLE[k], 'happy')}</g>`;
    });
    return `<rect width="300" height="300" fill="#FFE08A"/>
      <circle cx="150" cy="160" r="150" fill="#FFB86B"/>
      <circle cx="150" cy="160" r="84" fill="#F2C48D" stroke="#8B5A3C" stroke-width="4" stroke-dasharray="10 8"/>
      <g transform="translate(92,108) scale(1.0)">${I.berimbau.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g>
      <g transform="translate(150,104) scale(.95)">${I.atabaque.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g>
      <g transform="translate(118,156) scale(.95)">${I.capoeira.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g>
      ${ring}
      <rect x="40" y="6" width="220" height="34" rx="17" fill="#6A4CE0"/>
      <text x="150" y="30" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="19" font-weight="700" fill="#fff">RODA DE CAPOEIRA</text>`;
  }

  /* Ilustrações para cartazes (grupos de crianças) */
  function posterArt(kind) {
    const g = (id, x, y, s = .5, mood = 'happy') => `<g transform="translate(${x},${y}) scale(${s})">${headSVG(PEOPLE[id], mood)}</g>`;
    switch (kind) {
      case 'turma':
        return g('ayo', 0, 10) + g('kiara', 50, 0) + g('luna', 100, 10) + g('kaua', 150, 0) + g('mei', 200, 10);
      case 'roda':
        return g('theo', 10, 20, .42) + g('nina', 60, 4, .42) + g('leo', 110, 20, .42) + g('sara', 160, 4, .42) + g('caio', 210, 20, .42);
      case 'maos':
        return ['kiara', 'kaua', 'luna', 'ayo', 'mei'].map((k, i) => figure(k, 'happy', 'hug').replace('<svg ', `<svg x="${i * 48}" y="-6" width="70" height="124" `)).join('');
      case 'livros':
        return `<g transform="translate(40,-6) scale(1.6)">${I.book.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g><g transform="translate(150,-6) scale(1.6)">${I.globe.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g>`;
      case 'musica':
        return `<g transform="translate(20,0) scale(1.4)">${I.berimbau.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g><g transform="translate(100,0) scale(1.4)">${I.atabaque.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g><g transform="translate(180,0) scale(1.4)">${I.pandeiro.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g>`;
      case 'coracao':
        return `<g transform="translate(80,-10) scale(1.7)">${I.heart.replace('<svg viewBox="0 0 64 64">', '<g>').replace('</svg>', '</g>')}</g>` + g('ayo', 0, 20, .42) + g('mei', 200, 20, .42);
    }
    return '';
  }

  function iconInner(name) {
    const s = I[name] || '';
    return s.replace(/^<svg viewBox="0 0 64 64">/, '<g>').replace(/<\/svg>$/, '</g>');
  }

  window.ART = { PEOPLE, portrait, figure, headSVG, BG, icon, iconInner, rodaArt, posterArt, shade };
})();
