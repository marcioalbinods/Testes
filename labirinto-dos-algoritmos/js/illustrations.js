/* =========================================================
   LABIRINTO DOS ALGORITMOS — Ilustrações em SVG (low poly)
   Cenários dos mundos no mapa, avatares e o rosto do Byte.
   ========================================================= */
(function (LA) {
  'use strict';
  var ART = LA.ART = {};

  var WORLD_SVG = {
    vale:
      '<svg viewBox="0 0 260 170" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fcfff"/><stop offset="1" stop-color="#e9f8ff"/></linearGradient></defs>' +
      '<rect width="260" height="170" fill="url(#gv)"/><circle cx="210" cy="36" r="18" fill="#ffe27a"/>' +
      '<polygon points="0,120 50,70 95,115 140,60 200,118 260,80 260,170 0,170" fill="#7cc55c"/><polygon points="50,70 72,95 95,115 60,110" fill="#93d46e"/><polygon points="140,60 170,92 200,118 150,108" fill="#93d46e"/>' +
      '<polygon points="0,140 260,128 260,170 0,170" fill="#5fae45"/>' +
      '<polygon points="40,150 50,118 60,150" fill="#2f8f4e"/><rect x="48" y="150" width="4" height="8" fill="#8b5a2b"/>' +
      '<polygon points="200,148 212,110 224,148" fill="#3fa55b"/><rect x="210" y="148" width="4" height="8" fill="#8b5a2b"/>' +
      '<circle cx="100" cy="150" r="4" fill="#ff6b9a"/><circle cx="112" cy="155" r="4" fill="#ffd23f"/><circle cx="160" cy="152" r="4" fill="#fff"/></svg>',
    floresta:
      '<svg viewBox="0 0 260 170" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbf9a"/><stop offset="1" stop-color="#e3f7e0"/></linearGradient></defs>' +
      '<rect width="260" height="170" fill="url(#gf)"/>' +
      '<g fill="#2f8f4e"><polygon points="20,140 45,50 70,140"/><polygon points="80,145 110,40 140,145"/><polygon points="150,140 180,55 210,140"/><polygon points="200,150 230,60 260,150"/></g>' +
      '<g fill="#3fae5e"><polygon points="45,50 58,95 45,90"/><polygon points="110,40 125,95 110,88"/><polygon points="180,55 195,98 180,92"/></g>' +
      '<polygon points="0,150 260,140 260,170 0,170" fill="#bda36c"/><path d="M0 160 Q 130 140 260 160" stroke="#c9b07a" stroke-width="10" fill="none"/>' +
      '<circle cx="70" cy="155" r="7" fill="#e63946"/><rect x="68" y="155" width="4" height="8" fill="#f5f0e1"/><circle cx="190" cy="158" r="6" fill="#ff9f1c"/></svg>',
    fortaleza:
      '<svg viewBox="0 0 260 170" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="gq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb0ff"/><stop offset="1" stop-color="#f3e9ff"/></linearGradient></defs>' +
      '<rect width="260" height="170" fill="url(#gq)"/>' +
      '<rect x="70" y="60" width="120" height="90" fill="#9c917f"/><g fill="#8a7f6d"><rect x="70" y="50" width="18" height="14"/><rect x="100" y="50" width="18" height="14"/><rect x="130" y="50" width="18" height="14"/><rect x="160" y="50" width="18" height="14"/></g>' +
      '<rect x="40" y="40" width="34" height="110" fill="#8a7f6d"/><polygon points="36,40 57,10 78,40" fill="#3a5bd9"/><rect x="186" y="40" width="34" height="110" fill="#8a7f6d"/><polygon points="182,40 203,10 224,40" fill="#e63946"/>' +
      '<path d="M112 150 v-32 a18 18 0 0 1 36 0 v32z" fill="#5b4632"/><rect x="0" y="148" width="260" height="22" fill="#cfc6b5"/>' +
      '<rect x="128" y="22" width="3" height="30" fill="#444"/><polygon points="131,22 152,28 131,34" fill="#ffd23f"/></svg>',
    laboratorio:
      '<svg viewBox="0 0 260 170" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>' +
      '<rect width="260" height="170" fill="url(#gl)"/><rect x="0" y="130" width="260" height="40" fill="#dfe6f0"/>' +
      '<g stroke="#c6d2e3" stroke-width="2"><line x1="0" y1="150" x2="260" y2="150"/><line x1="65" y1="130" x2="55" y2="170"/><line x1="130" y1="130" x2="130" y2="170"/><line x1="195" y1="130" x2="205" y2="170"/></g>' +
      '<rect x="30" y="60" width="44" height="70" rx="20" fill="#9ef0ff" opacity=".7"/><rect x="34" y="90" width="36" height="38" rx="14" fill="#3cff9e"/>' +
      '<rect x="100" y="70" width="70" height="60" fill="#8ea2bf"/><rect x="100" y="92" width="70" height="6" fill="#22d3ee"/><rect x="112" y="78" width="46" height="8" rx="4" fill="#1d2340"/>' +
      '<rect x="190" y="50" width="40" height="80" rx="18" fill="#9ef0ff" opacity=".7"/><rect x="194" y="86" width="32" height="42" rx="12" fill="#ff5cf4"/>' +
      '<circle cx="135" cy="40" r="10" fill="#ffd23f"/><line x1="135" y1="50" x2="135" y2="70" stroke="#5d6b80" stroke-width="4"/></svg>',
    nucleo:
      '<svg viewBox="0 0 260 170" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="gn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140b33"/><stop offset="1" stop-color="#3d1f78"/></linearGradient></defs>' +
      '<rect width="260" height="170" fill="url(#gn)"/>' +
      '<g fill="#fff"><circle cx="30" cy="25" r="1.6"/><circle cx="90" cy="15" r="1.2"/><circle cx="170" cy="30" r="1.6"/><circle cx="235" cy="18" r="1.2"/><circle cx="60" cy="60" r="1"/></g>' +
      '<polygon points="130,25 160,85 130,145 100,85" fill="#7cf7ff" opacity=".85"/><polygon points="130,25 160,85 130,85" fill="#c9fbff"/>' +
      '<polygon points="40,150 55,90 70,150" fill="#ff5cf4" opacity=".8"/><polygon points="190,150 210,80 230,150" fill="#7cf7ff" opacity=".7"/>' +
      '<rect x="0" y="146" width="260" height="24" fill="#251f4b"/><g stroke="#7cf7ff" stroke-width="1.5" opacity=".7"><line x1="0" y1="146" x2="260" y2="146"/><line x1="40" y1="146" x2="20" y2="170"/><line x1="130" y1="146" x2="130" y2="170"/><line x1="220" y1="146" x2="240" y2="170"/></g>' +
      '<circle cx="130" cy="85" r="44" fill="none" stroke="#b06bff" stroke-width="3" stroke-dasharray="8 6"/></svg>'
  };
  ART.world = function (theme) { return WORLD_SVG[theme] || WORLD_SVG.vale; };

  var COLORS = ['#4c97ff', '#ff6b9a', '#1fc8b5', '#ffb703', '#8b5cf6', '#34c759', '#ff7a45', '#00b4d8', '#e05fa8', '#7c8cff'];
  ART.playerColor = function (p) {
    var n = p ? p.num + (p.device ? p.device.charCodeAt(0) : 0) * (p.imported ? 3 : 0) : 0;
    return COLORS[(n - 1 + COLORS.length * 10) % COLORS.length];
  };
  ART.avatar = function (p, size) {
    var c = ART.playerColor(p);
    return '<span class="avatar" style="width:' + (size || 40) + 'px;height:' + (size || 40) + 'px">' +
      '<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="18" fill="' + c + '"/>' +
      '<rect x="14" y="18" width="36" height="26" rx="8" fill="#0f1a33"/><rect x="21" y="25" width="7" height="10" rx="2" fill="#64f4ff"/><rect x="36" y="25" width="7" height="10" rx="2" fill="#64f4ff"/>' +
      '<rect x="27" y="38" width="10" height="2.5" rx="1" fill="#64f4ff"/><line x1="32" y1="4" x2="32" y2="12" stroke="#fff" stroke-width="3"/><circle cx="32" cy="6" r="4" fill="#ffd23f"/>' +
      '<text x="32" y="58" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="sans-serif">' + (p ? p.num : '') + '</text></svg></span>';
  };
  ART.byteFace = function (mood) {
    var eye = mood === 'sad' ? '#ff5a5a' : mood === 'happy' ? '#7dff9b' : '#64f4ff';
    var eh = mood === 'happy' ? 6 : 14;
    return '<svg class="byte-face" viewBox="0 0 100 100"><rect x="12" y="20" width="76" height="62" rx="16" fill="#f4f7fb" stroke="#d5dbea" stroke-width="2"/>' +
      '<rect x="20" y="30" width="60" height="38" rx="10" fill="#0f1a33"/><rect x="31" y="' + (49 - eh / 2) + '" width="10" height="' + eh + '" rx="3" fill="' + eye + '"/>' +
      '<rect x="59" y="' + (49 - eh / 2) + '" width="10" height="' + eh + '" rx="3" fill="' + eye + '"/>' +
      (mood === 'sad' ? '<path d="M40 64 q10 -6 20 0" stroke="' + eye + '" stroke-width="3" fill="none"/>' : '<path d="M40 60 q10 7 20 0" stroke="' + eye + '" stroke-width="3" fill="none"/>') +
      '<rect x="4" y="40" width="10" height="20" rx="4" fill="#1fc8b5"/><rect x="86" y="40" width="10" height="20" rx="4" fill="#1fc8b5"/>' +
      '<line x1="50" y1="20" x2="50" y2="8" stroke="#26304a" stroke-width="3"/><circle cx="50" cy="7" r="6" fill="#ffd23f"/></svg>';
  };
})(globalThis.LA = globalThis.LA || {});
