/* O QUE VEM PRIMEIRO? — Pipo, o robô ajudante.
   Expressões: neutro, feliz, pensativo, surpreso e animado. */
(function (root) {
  'use strict';
  const K = '#2f3150';
  const EYE = '#5ef0e0';

  const faces = {
    neutral: `<circle cx="-15" cy="-4" r="7" fill="${EYE}"/><circle cx="15" cy="-4" r="7" fill="${EYE}"/>
      <circle cx="-13" cy="-6" r="2.2" fill="#fff"/><circle cx="17" cy="-6" r="2.2" fill="#fff"/>
      <path d="M-9 10 Q0 16 9 10" stroke="${EYE}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    happy: `<path d="M-23 -1 Q-15 -13 -7 -1" stroke="${EYE}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M7 -1 Q15 -13 23 -1" stroke="${EYE}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M-12 7 Q0 22 12 7 Z" fill="${EYE}"/>
      <circle cx="-25" cy="9" r="4.5" fill="#ff8fb1" opacity=".75"/><circle cx="25" cy="9" r="4.5" fill="#ff8fb1" opacity=".75"/>`,
    thinking: `<circle cx="-13" cy="-8" r="6" fill="${EYE}"/><circle cx="17" cy="-8" r="6" fill="${EYE}"/>
      <circle cx="-11" cy="-10" r="2" fill="#fff"/><circle cx="19" cy="-10" r="2" fill="#fff"/>
      <path d="M-6 11 Q2 8 10 11" stroke="${EYE}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    surprised: `<circle cx="-15" cy="-5" r="9" fill="${EYE}"/><circle cx="15" cy="-5" r="9" fill="${EYE}"/>
      <circle cx="-15" cy="-5" r="3.5" fill="${K}"/><circle cx="15" cy="-5" r="3.5" fill="${K}"/>
      <ellipse cx="0" cy="12" rx="5" ry="6" fill="${EYE}"/>`,
    excited: `<path d="M-15 -14 L-12 -7 L-5 -6 L-10 -1 L-9 6 L-15 2 L-21 6 L-20 -1 L-25 -6 L-18 -7Z" fill="#ffe066"/>
      <path d="M15 -14 L18 -7 L25 -6 L20 -1 L21 6 L15 2 L9 6 L10 -1 L5 -6 L12 -7Z" fill="#ffe066"/>
      <path d="M-13 8 Q0 26 13 8 Z" fill="${EYE}"/>`
  };

  function svg(mood) {
    const m = faces[mood] ? mood : 'neutral';
    const armsUp = m === 'excited';
    const thinking = m === 'thinking';
    const armL = armsUp
      ? '<path d="M-38 30 L-58 0" stroke="#2f3150" stroke-width="14" stroke-linecap="round"/><path d="M-38 30 L-58 0" stroke="#c9d3ea" stroke-width="8" stroke-linecap="round"/><circle cx="-60" cy="-3" r="9" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>'
      : '<path d="M-38 30 L-52 58" stroke="#2f3150" stroke-width="14" stroke-linecap="round"/><path d="M-38 30 L-52 58" stroke="#c9d3ea" stroke-width="8" stroke-linecap="round"/><circle cx="-53" cy="61" r="9" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>';
    const armR = armsUp
      ? '<path d="M38 30 L58 0" stroke="#2f3150" stroke-width="14" stroke-linecap="round"/><path d="M38 30 L58 0" stroke="#c9d3ea" stroke-width="8" stroke-linecap="round"/><circle cx="60" cy="-3" r="9" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>'
      : thinking
        ? '<path d="M38 30 L44 10 L26 -2" stroke="#2f3150" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M38 30 L44 10 L26 -2" stroke="#c9d3ea" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="24" cy="-4" r="9" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>'
        : '<path d="M38 30 L52 58" stroke="#2f3150" stroke-width="14" stroke-linecap="round"/><path d="M38 30 L52 58" stroke="#c9d3ea" stroke-width="8" stroke-linecap="round"/><circle cx="53" cy="61" r="9" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>';
    const extra = thinking
      ? '<circle cx="62" cy="-78" r="5" fill="#fff" stroke="#2f3150" stroke-width="3"/><circle cx="74" cy="-94" r="7" fill="#fff" stroke="#2f3150" stroke-width="3"/>'
      : m === 'surprised'
        ? '<path d="M-62 -70 L-54 -60 M-66 -50 L-56 -48 M62 -70 L54 -60 M66 -50 L56 -48" stroke="#ff8a3d" stroke-width="4" stroke-linecap="round"/>'
        : '';
    return `<svg class="pipo-svg mood-${m}" viewBox="-80 -110 160 210" role="img" aria-label="Pipo, o robô">
      <ellipse cx="0" cy="94" rx="44" ry="7" fill="rgba(47,49,80,.18)"/>
      <g class="pipo-body">
        ${armL}${armR}
        <rect x="-16" y="70" width="12" height="18" rx="5" fill="#9aa6c8" stroke="#2f3150" stroke-width="3.5"/>
        <rect x="4" y="70" width="12" height="18" rx="5" fill="#9aa6c8" stroke="#2f3150" stroke-width="3.5"/>
        <rect x="-24" y="84" width="22" height="10" rx="5" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>
        <rect x="2" y="84" width="22" height="10" rx="5" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>
        <rect x="-38" y="16" width="76" height="60" rx="20" fill="#eef3ff" stroke="#2f3150" stroke-width="3.5"/>
        <rect x="-18" y="30" width="36" height="28" rx="9" fill="#19b5a5" stroke="#2f3150" stroke-width="3"/>
        <path class="pipo-heart" d="M0 52 Q-12 44 -10 37 Q-7 31 0 37 Q7 31 10 37 Q12 44 0 52Z" fill="#ff6b8b"/>
        <rect x="-10" y="8" width="20" height="12" rx="3" fill="#9aa6c8" stroke="#2f3150" stroke-width="3"/>
        <g class="pipo-head">
          <path d="M0 -62 V-80" stroke="#2f3150" stroke-width="4" stroke-linecap="round"/>
          <circle class="pipo-antenna" cx="0" cy="-84" r="8" fill="#ffd34d" stroke="#2f3150" stroke-width="3.5"/>
          <rect x="-58" y="-36" width="12" height="26" rx="5" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>
          <rect x="46" y="-36" width="12" height="26" rx="5" fill="#ff8a3d" stroke="#2f3150" stroke-width="3.5"/>
          <rect x="-50" y="-64" width="100" height="74" rx="26" fill="#eef3ff" stroke="#2f3150" stroke-width="3.5"/>
          <rect x="-40" y="-52" width="80" height="52" rx="18" fill="#26294a"/>
          <g transform="translate(0 -24)">${faces[m]}</g>
          <path d="M-36 -58 Q-20 -64 -6 -60" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
        </g>
        ${extra}
      </g>
    </svg>`;
  }

  // Controla um Pipo dentro de um elemento: humor + animação curta.
  function mount(el, mood) {
    let current = null;
    const api = {
      set(m, anim) {
        if (m !== current) { el.innerHTML = svg(m); current = m; }
        if (anim) {
          el.classList.remove('anim-jump', 'anim-shake', 'anim-tilt', 'anim-dance');
          void el.offsetWidth;
          el.classList.add('anim-' + anim);
        }
        return api;
      },
      get mood() { return current; }
    };
    el.classList.add('pipo');
    api.set(mood || 'neutral');
    return api;
  }

  root.OQVP = root.OQVP || {};
  root.OQVP.robot = { svg, mount };
})(typeof window !== 'undefined' ? window : globalThis);
