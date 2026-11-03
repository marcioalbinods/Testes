/* =========================================================
   CAÇADORES DE LETRAS — Personagem: LUPA, a raposa exploradora
   ========================================================= */
(function () {
  'use strict';
  const CDL = (window.CDL = window.CDL || {});

  CDL.CHARACTER_NAME = 'LUPA';

  CDL.characterSVG = function (extraClass = '') {
    return `<svg class="lupa ${extraClass}" viewBox="0 -8 240 258" aria-label="Lupa, a raposa exploradora" role="img">
  <g class="lupa-body">
    <!-- cauda -->
    <g class="lupa-tail"><path d="M150 200 Q215 190 205 120 Q200 95 182 108 Q192 160 140 178Z" fill="#FF8A3D"/><path d="M205 120 Q200 95 182 108 Q186 122 198 134Z" fill="#FFF3E0"/></g>
    <!-- corpo -->
    <ellipse cx="110" cy="196" rx="52" ry="46" fill="#FF8A3D"/>
    <ellipse cx="110" cy="206" rx="32" ry="32" fill="#FFF3E0"/>
    <!-- mochila -->
    <path d="M62 170 Q58 210 76 226 L70 168Z" fill="#8D5524"/>
    <!-- pés -->
    <ellipse cx="86" cy="240" rx="20" ry="10" fill="#5D3A1A"/><ellipse cx="134" cy="240" rx="20" ry="10" fill="#5D3A1A"/>
    <!-- lenço -->
    <path d="M70 150 Q110 172 150 150 L146 166 Q110 186 74 166Z" fill="#2EC4B6"/><path d="M118 168 L138 200 L112 186Z" fill="#26A69A"/>
    <!-- braço com lupa -->
    <g class="lupa-arm">
      <path d="M150 180 Q176 170 184 146" stroke="#FF8A3D" stroke-width="18" stroke-linecap="round" fill="none"/>
      <path d="M186 140 L200 112" stroke="#8D5524" stroke-width="9" stroke-linecap="round"/>
      <circle cx="206" cy="94" r="22" fill="#BDEBFF" fill-opacity=".55" stroke="#FFB400" stroke-width="7"/>
      <path d="M196 86 q6 -6 14 -4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M70 180 Q54 196 66 214" stroke="#FF8A3D" stroke-width="16" stroke-linecap="round" fill="none"/>
  </g>
  <g class="lupa-head">
    <!-- orelhas -->
    <path d="M52 70 L40 6 L96 46Z" fill="#FF8A3D"/><path d="M56 60 L50 22 L84 46Z" fill="#5D3A1A"/>
    <path d="M168 70 L180 6 L124 46Z" fill="#FF8A3D"/><path d="M164 60 L170 22 L136 46Z" fill="#5D3A1A"/>
    <!-- cabeça -->
    <path d="M30 96 Q34 40 110 38 Q186 40 190 96 Q186 150 110 156 Q34 150 30 96Z" fill="#FF8A3D"/>
    <path d="M44 108 Q70 104 110 150 Q150 104 176 108 Q170 150 110 158 Q50 150 44 108Z" fill="#FFF3E0"/>
    <!-- chapéu de explorador -->
    <ellipse cx="110" cy="50" rx="86" ry="16" fill="#C8A26A"/>
    <path d="M52 50 Q56 0 110 -2 Q164 0 168 50Z" fill="#E2BF85"/>
    <path d="M54 40 Q110 52 166 40 L168 50 Q110 62 52 50Z" fill="#8D5524"/>
    <circle cx="146" cy="44" r="7" fill="#FFD23F"/>
    <!-- olhos -->
    <g class="lupa-eyes-open">
      <ellipse cx="82" cy="94" rx="11" ry="14" fill="#2B1B10"/><ellipse cx="138" cy="94" rx="11" ry="14" fill="#2B1B10"/>
      <circle cx="86" cy="88" r="4.5" fill="#fff"/><circle cx="142" cy="88" r="4.5" fill="#fff"/>
    </g>
    <g class="lupa-eyes-happy">
      <path d="M70 96 Q82 80 94 96" stroke="#2B1B10" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M126 96 Q138 80 150 96" stroke="#2B1B10" stroke-width="6" fill="none" stroke-linecap="round"/>
    </g>
    <!-- bochechas -->
    <circle cx="62" cy="118" r="10" fill="#FF6F91" opacity=".45"/><circle cx="158" cy="118" r="10" fill="#FF6F91" opacity=".45"/>
    <!-- focinho e boca -->
    <ellipse cx="110" cy="118" rx="12" ry="9" fill="#2B1B10"/><ellipse cx="106" cy="115" rx="4" ry="2.5" fill="#fff" opacity=".6"/>
    <g class="lupa-mouth-closed"><path d="M96 132 Q110 144 124 132" stroke="#2B1B10" stroke-width="5" fill="none" stroke-linecap="round"/></g>
    <g class="lupa-mouth-open"><path d="M96 130 Q110 156 124 130Z" fill="#7A2E2E"/><path d="M102 140 Q110 150 118 140" fill="#FF8FA3"/></g>
  </g>
</svg>`;
  };
})();
