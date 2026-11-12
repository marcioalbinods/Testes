/* =========================================================
   LABIRINTO DOS ALGORITMOS — Avatares de corpo inteiro
   Pessoas e animais desenhados em SVG, com roupas, acessórios,
   bichinhos e fundos. Os itens são comprados com moedas 🪙
   ganhas nas fases (as moedas vêm do progresso: não se perdem
   e não duplicam ao repetir uma fase).
   ========================================================= */
(function (LA) {
  'use strict';

  /* ---------- Paletas ---------- */
  var SKIN = ['#ffe0c7', '#f6c9a0', '#e2a77a', '#c68456', '#9a6038', '#6b3f22'];
  var HAIR_COLORS = ['#2b1d14', '#5a3622', '#9b6233', '#e7c26b', '#d9632b', '#8a8f99', '#e85d9a', '#4c97ff', '#8b5cf6', '#1fc8b5'];
  var CLOTH = ['#4c97ff', '#ff5a5a', '#34c759', '#ffd23f', '#8b5cf6', '#ff6b9a', '#1fc8b5', '#ff9f1c', '#2b2f4a', '#f4f6fb'];
  var FUR = {
    gato: ['#f2a65a', '#8a8f99', '#2f2f38', '#f4efe6', '#c98b4e'],
    cachorro: ['#c98b4e', '#f4e2c4', '#5a3622', '#2f2f38', '#e7c26b'],
    coelho: ['#f4efe6', '#d8c3b0', '#8a8f99', '#f2c6d6', '#5a3622'],
    urso: ['#8a5a36', '#5a3622', '#d9a066', '#f4efe6', '#2f2f38'],
    panda: ['#f7f7f2'],
    raposa: ['#ef7d2d', '#d9632b', '#f4efe6', '#8a8f99'],
    leao: ['#e9b44c', '#d9963a', '#f2d48a']
  };
  LA.AV_PALETTES = { skin: SKIN, hair: HAIR_COLORS, cloth: CLOTH, fur: FUR };

  var BASES = [
    { id: 'pessoa', name: 'Pessoa', icon: '🧒' },
    { id: 'gato', name: 'Gato', icon: '🐱' },
    { id: 'cachorro', name: 'Cachorro', icon: '🐶' },
    { id: 'coelho', name: 'Coelho', icon: '🐰' },
    { id: 'urso', name: 'Urso', icon: '🐻' },
    { id: 'panda', name: 'Panda', icon: '🐼' },
    { id: 'raposa', name: 'Raposa', icon: '🦊' },
    { id: 'leao', name: 'Leão', icon: '🦁' }
  ];
  LA.AV_BASES = BASES;

  /* ---------- Catálogo da loja ----------
     slot: onde o item fica. price 0 = grátis. color: aceita cor. */
  var ITEMS = [
    // cabelo (só pessoas)
    { id: 'cab-curto', slot: 'hair', name: 'Curto', price: 0 },
    { id: 'cab-longo', slot: 'hair', name: 'Longo', price: 0 },
    { id: 'cab-cacheado', slot: 'hair', name: 'Cacheado', price: 0 },
    { id: 'cab-black', slot: 'hair', name: 'Black power', price: 0 },
    { id: 'cab-rabo', slot: 'hair', name: 'Rabo de cavalo', price: 0 },
    { id: 'cab-trancas', slot: 'hair', name: 'Tranças', price: 0 },
    { id: 'cab-coque', slot: 'hair', name: 'Coque', price: 15 },
    { id: 'cab-moicano', slot: 'hair', name: 'Moicano', price: 30 },
    { id: 'cab-espetado', slot: 'hair', name: 'Espetado', price: 25 },
    { id: 'cab-careca', slot: 'hair', name: 'Raspado', price: 0 },
    // parte de cima
    { id: 'top-camiseta', slot: 'top', name: 'Camiseta', price: 0, color: true },
    { id: 'top-listrada', slot: 'top', name: 'Camiseta listrada', price: 20, color: true },
    { id: 'top-regata', slot: 'top', name: 'Regata', price: 15, color: true },
    { id: 'top-moletom', slot: 'top', name: 'Moletom', price: 35, color: true },
    { id: 'top-time', slot: 'top', name: 'Camisa de time', price: 40, color: true },
    { id: 'top-vestido', slot: 'top', name: 'Vestido', price: 40, color: true, dress: true },
    { id: 'top-jaqueta', slot: 'top', name: 'Jaqueta', price: 55, color: true },
    { id: 'top-jaleco', slot: 'top', name: 'Jaleco de cientista', price: 70 },
    { id: 'top-heroi', slot: 'top', name: 'Roupa de super-herói', price: 90, color: true },
    { id: 'top-astronauta', slot: 'top', name: 'Traje de astronauta', price: 120, suit: true },
    // parte de baixo
    { id: 'bot-calca', slot: 'bottom', name: 'Calça', price: 0, color: true },
    { id: 'bot-bermuda', slot: 'bottom', name: 'Bermuda', price: 0, color: true },
    { id: 'bot-saia', slot: 'bottom', name: 'Saia', price: 0, color: true },
    { id: 'bot-jeans', slot: 'bottom', name: 'Calça jeans', price: 20 },
    { id: 'bot-legging', slot: 'bottom', name: 'Legging estampada', price: 25, color: true },
    { id: 'bot-xadrez', slot: 'bottom', name: 'Saia xadrez', price: 30, color: true },
    // calçados
    { id: 'sap-tenis', slot: 'shoes', name: 'Tênis', price: 0, color: true },
    { id: 'sap-sandalia', slot: 'shoes', name: 'Sandália', price: 10, color: true },
    { id: 'sap-botas', slot: 'shoes', name: 'Botas', price: 30, color: true },
    { id: 'sap-led', slot: 'shoes', name: 'Tênis de LED', price: 60 },
    { id: 'sap-patins', slot: 'shoes', name: 'Patins', price: 80, color: true },
    // cabeça
    { id: 'cha-bone', slot: 'hat', name: 'Boné', price: 25, color: true },
    { id: 'cha-laco', slot: 'hat', name: 'Laço', price: 15, color: true },
    { id: 'cha-gorro', slot: 'hat', name: 'Gorro', price: 25, color: true },
    { id: 'cha-festa', slot: 'hat', name: 'Chapéu de festa', price: 20, color: true },
    { id: 'cha-fones', slot: 'hat', name: 'Fones de ouvido', price: 45, color: true },
    { id: 'cha-pirata', slot: 'hat', name: 'Chapéu de pirata', price: 60 },
    { id: 'cha-mago', slot: 'hat', name: 'Chapéu de mago', price: 80, color: true },
    { id: 'cha-coroa', slot: 'hat', name: 'Coroa', price: 150 },
    { id: 'cha-capacete', slot: 'hat', name: 'Capacete espacial', price: 130 },
    // rosto
    { id: 'ocu-redondo', slot: 'glasses', name: 'Óculos redondos', price: 20 },
    { id: 'ocu-sol', slot: 'glasses', name: 'Óculos de sol', price: 35 },
    { id: 'ocu-estrela', slot: 'glasses', name: 'Óculos de estrela', price: 45 },
    { id: 'ocu-visor', slot: 'glasses', name: 'Visor de robô', price: 75 },
    // pescoço
    { id: 'pes-gravata', slot: 'neck', name: 'Gravata borboleta', price: 20, color: true },
    { id: 'pes-cachecol', slot: 'neck', name: 'Cachecol', price: 30, color: true },
    { id: 'pes-medalha', slot: 'neck', name: 'Medalha de ouro', price: 60 },
    // mão
    { id: 'mao-bola', slot: 'hand', name: 'Bola', price: 20 },
    { id: 'mao-livro', slot: 'hand', name: 'Livro', price: 25, color: true },
    { id: 'mao-picole', slot: 'hand', name: 'Picolé', price: 15 },
    { id: 'mao-controle', slot: 'hand', name: 'Controle de videogame', price: 45 },
    { id: 'mao-varinha', slot: 'hand', name: 'Varinha mágica', price: 60 },
    { id: 'mao-sabre', slot: 'hand', name: 'Espada de luz', price: 90, color: true },
    // costas
    { id: 'cos-mochila', slot: 'back', name: 'Mochila', price: 30, color: true },
    { id: 'cos-capa', slot: 'back', name: 'Capa', price: 60, color: true },
    { id: 'cos-asas', slot: 'back', name: 'Asas de anjo', price: 100 },
    { id: 'cos-jetpack', slot: 'back', name: 'Jetpack', price: 130 },
    // bichinho
    { id: 'pet-passaro', slot: 'pet', name: 'Passarinho', price: 50 },
    { id: 'pet-borboleta', slot: 'pet', name: 'Borboleta', price: 40 },
    { id: 'pet-byte', slot: 'pet', name: 'Mini Byte', price: 100 },
    // fundo
    { id: 'fun-floresta', slot: 'bg', name: 'Floresta', price: 30 },
    { id: 'fun-praia', slot: 'bg', name: 'Praia', price: 35 },
    { id: 'fun-cidade', slot: 'bg', name: 'Cidade', price: 35 },
    { id: 'fun-espaco', slot: 'bg', name: 'Espaço', price: 50 },
    { id: 'fun-arcoiris', slot: 'bg', name: 'Arco-íris', price: 60 }
  ];
  var BY_ID = {};
  ITEMS.forEach(function (it) { BY_ID[it.id] = it; });
  LA.AV_ITEMS = ITEMS;
  LA.avItem = function (id) { return BY_ID[id] || null; };

  /* Slots que podem ficar vazios ("nenhum"). */
  var OPTIONAL = { hat: 1, glasses: 1, neck: 1, hand: 1, back: 1, pet: 1, bg: 1 };
  LA.AV_OPTIONAL = OPTIONAL;

  LA.AV_SLOTS = [
    { tab: 'corpo', id: 'base', name: 'Personagem' },
    { tab: 'corpo', id: 'tone', name: 'Cor da pele / pelo' },
    { tab: 'corpo', id: 'hair', name: 'Cabelo', people: true },
    { tab: 'corpo', id: 'hairColor', name: 'Cor do cabelo', people: true },
    { tab: 'roupas', id: 'top', name: 'Parte de cima' },
    { tab: 'roupas', id: 'bottom', name: 'Parte de baixo' },
    { tab: 'roupas', id: 'shoes', name: 'Calçados' },
    { tab: 'acessorios', id: 'hat', name: 'Cabeça' },
    { tab: 'acessorios', id: 'glasses', name: 'Óculos' },
    { tab: 'acessorios', id: 'neck', name: 'Pescoço' },
    { tab: 'acessorios', id: 'hand', name: 'Na mão' },
    { tab: 'acessorios', id: 'back', name: 'Nas costas' },
    { tab: 'extras', id: 'pet', name: 'Bichinho' },
    { tab: 'extras', id: 'bg', name: 'Fundo' }
  ];

  /* ---------- Configuração do avatar ---------- */
  function rnd(n, seed) { return Math.abs(Math.floor(seed)) % n; }
  LA.avatarDefault = function (base, seed) {
    seed = seed == null ? Math.floor(Math.random() * 1000) : seed;
    var hairs = ['cab-curto', 'cab-longo', 'cab-cacheado', 'cab-black', 'cab-rabo', 'cab-trancas'];
    return {
      base: base || 'pessoa',
      tone: rnd(base && base !== 'pessoa' ? (FUR[base] || [0]).length : SKIN.length, seed * 7 + 3),
      hair: hairs[rnd(hairs.length, seed * 3 + 1)],
      hairColor: rnd(5, seed * 5 + 2),
      top: 'top-camiseta', topColor: rnd(8, seed),
      bottom: rnd(2, seed * 11) ? 'bot-calca' : 'bot-bermuda', bottomColor: 8,
      shoes: 'sap-tenis', shoesColor: rnd(8, seed * 13 + 4),
      hat: '', hatColor: 1, glasses: '', neck: '', neckColor: 1, hand: '', handColor: 0, back: '', backColor: 1, pet: '', bg: ''
    };
  };
  var SLOT_KEYS = ['hair', 'top', 'bottom', 'shoes', 'hat', 'glasses', 'neck', 'hand', 'back', 'pet', 'bg'];
  var COLOR_KEYS = ['hairColor', 'topColor', 'bottomColor', 'shoesColor', 'hatColor', 'neckColor', 'handColor', 'backColor'];
  /* Limpa uma configuração vinda do armazenamento ou da internet. */
  LA.avatarClean = function (a, seed) {
    var d = LA.avatarDefault('pessoa', seed || 1);
    if (!a || typeof a !== 'object') return d;
    var out = {};
    out.base = BASES.some(function (b) { return b.id === a.base; }) ? a.base : 'pessoa';
    var toneMax = out.base === 'pessoa' ? SKIN.length : (FUR[out.base] || [0]).length;
    out.tone = Math.max(0, Math.min(toneMax - 1, Math.round(Number(a.tone) || 0)));
    SLOT_KEYS.forEach(function (k) {
      var it = BY_ID[a[k]];
      out[k] = it && it.slot === k ? it.id : (OPTIONAL[k] ? '' : d[k]);
    });
    COLOR_KEYS.forEach(function (k) {
      var max = k === 'hairColor' ? HAIR_COLORS.length : CLOTH.length;
      var v = Math.round(Number(a[k]));
      out[k] = isFinite(v) && v >= 0 && v < max ? v : d[k];
    });
    return out;
  };

  /* ---------- Desenho ----------
     Esqueleto comum (viewBox 0 0 200 300): cabeça em (100,92) r=50,
     tronco 145–212, pernas até 268, pés em y≈276. As roupas servem
     em todos os personagens. */
  function col(list, i) { return list[Math.max(0, Math.min(list.length - 1, i || 0))]; }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function f(c) { return Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k))); }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }

  function bodyColor(a) {
    if (a.base === 'pessoa') return col(SKIN, a.tone);
    if (a.base === 'panda') return '#f7f7f2';
    return col(FUR[a.base] || ['#ccc'], a.tone);
  }
  function limbColor(a) { return a.base === 'panda' ? '#2f2f38' : bodyColor(a); }

  var BG = {
    '': function () { return ''; },
    'fun-floresta': function () {
      return '<rect width="200" height="300" fill="#bdeccb"/><circle cx="160" cy="50" r="22" fill="#fff3a6"/>' +
        '<polygon points="20,210 45,110 70,210" fill="#3fa55b"/><polygon points="130,215 165,95 200,215" fill="#2f8f4e"/><polygon points="-10,220 15,140 40,220" fill="#2f8f4e"/>' +
        '<rect y="230" width="200" height="70" fill="#7cc55c"/>';
    },
    'fun-praia': function () {
      return '<rect width="200" height="300" fill="#9fdcff"/><circle cx="40" cy="55" r="24" fill="#ffe27a"/>' +
        '<rect y="185" width="200" height="45" fill="#3fb6e0"/><path d="M0 190 q25 -8 50 0 t50 0 t50 0 t50 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>' +
        '<rect y="230" width="200" height="70" fill="#f6dc9b"/><path d="M170 230 q4 -60 -6 -95" stroke="#8b5a2b" stroke-width="6" fill="none"/><path d="M164 135 q-26 -8 -40 6 M164 135 q20 -18 38 -4 M164 135 q-4 -20 -24 -26" stroke="#2f9e44" stroke-width="7" fill="none" stroke-linecap="round"/>';
    },
    'fun-cidade': function () {
      return '<rect width="200" height="300" fill="#ffd9b0"/><circle cx="150" cy="70" r="26" fill="#ff9f6b"/>' +
        '<g fill="#7c6fb0"><rect x="0" y="120" width="40" height="120"/><rect x="45" y="90" width="34" height="150"/><rect x="120" y="105" width="38" height="135"/><rect x="162" y="140" width="40" height="100"/></g>' +
        '<g fill="#ffe27a"><rect x="8" y="132" width="8" height="8"/><rect x="24" y="152" width="8" height="8"/><rect x="53" y="104" width="7" height="8"/><rect x="66" y="128" width="7" height="8"/><rect x="128" y="118" width="8" height="8"/><rect x="142" y="146" width="8" height="8"/><rect x="170" y="154" width="8" height="8"/></g>' +
        '<rect y="236" width="200" height="64" fill="#8d93a8"/><rect y="262" width="200" height="4" fill="#fff" opacity=".5"/>';
    },
    'fun-espaco': function () {
      return '<rect width="200" height="300" fill="#1a1440"/><g fill="#fff"><circle cx="20" cy="30" r="1.6"/><circle cx="60" cy="70" r="1.2"/><circle cx="170" cy="40" r="2"/><circle cx="140" cy="120" r="1.2"/><circle cx="30" cy="150" r="1.5"/><circle cx="185" cy="180" r="1.3"/><circle cx="100" cy="20" r="1"/></g>' +
        '<circle cx="160" cy="80" r="20" fill="#ff8c5a"/><ellipse cx="160" cy="80" rx="32" ry="7" fill="none" stroke="#ffd23f" stroke-width="3"/>' +
        '<circle cx="35" cy="95" r="10" fill="#7cf7ff" opacity=".8"/><rect y="240" width="200" height="60" fill="#3d2f78"/><circle cx="50" cy="262" r="8" fill="#2c2160"/><circle cx="150" cy="275" r="11" fill="#2c2160"/>';
    },
    'fun-arcoiris': function () {
      var c = ['#ff5a5a', '#ff9f1c', '#ffd23f', '#34c759', '#4c97ff', '#8b5cf6'], s = '<rect width="200" height="300" fill="#e9f6ff"/>';
      c.forEach(function (k, i) { s += '<path d="M' + (-10 + i * 9) + ' 230 A ' + (110 - i * 9) + ' ' + (110 - i * 9) + ' 0 0 1 ' + (210 - i * 9) + ' 230" stroke="' + k + '" stroke-width="9" fill="none"/>'; });
      return s + '<ellipse cx="30" cy="225" rx="34" ry="16" fill="#fff"/><ellipse cx="172" cy="225" rx="34" ry="16" fill="#fff"/><rect y="236" width="200" height="64" fill="#a6e08a"/>';
    }
  };

  function backItem(a) {
    var c = col(CLOTH, a.backColor);
    switch (a.back) {
      case 'cos-capa': return '<path d="M70 150 Q100 140 130 150 L150 262 Q100 272 50 262 Z" fill="' + c + '"/><path d="M70 150 Q100 140 130 150 L134 168 Q100 160 66 168 Z" fill="' + shade(c, -0.25) + '"/>';
      case 'cos-asas': return '<g fill="#f4f9ff" stroke="#9fb3d6" stroke-width="2.5"><path d="M80 165 C40 120 6 140 10 175 C14 205 50 200 82 185 Z"/><path d="M120 165 C160 120 194 140 190 175 C186 205 150 200 118 185 Z"/></g>' +
        '<g stroke="#9fb3d6" stroke-width="2" fill="none"><path d="M30 160 q20 4 44 14"/><path d="M26 182 q24 0 50 -4"/><path d="M170 160 q-20 4 -44 14"/><path d="M174 182 q-24 0 -50 -4"/></g>';
      case 'cos-jetpack': return '<g><rect x="40" y="146" width="28" height="58" rx="11" fill="#a9b4c9" stroke="#7d89a3" stroke-width="2"/><rect x="132" y="146" width="28" height="58" rx="11" fill="#a9b4c9" stroke="#7d89a3" stroke-width="2"/><rect x="44" y="154" width="20" height="8" rx="3" fill="#ff5a5a"/><rect x="136" y="154" width="20" height="8" rx="3" fill="#ff5a5a"/>' +
        '<path d="M44 204 L54 240 L64 204 Z" fill="#ffb703"/><path d="M49 204 L54 224 L59 204 Z" fill="#fff3a6"/><path d="M136 204 L146 240 L156 204 Z" fill="#ffb703"/><path d="M141 204 L146 224 L151 204 Z" fill="#fff3a6"/></g>';
      case 'cos-mochila': return '<rect x="62" y="150" width="76" height="64" rx="16" fill="' + shade(c, -0.15) + '"/>';
    }
    return '';
  }
  function backStraps(a) {
    if (a.back !== 'cos-mochila') return '';
    var c = shade(col(CLOTH, a.backColor), -0.3);
    return '<path d="M74 148 L80 206" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/><path d="M126 148 L120 206" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>';
  }

  function tail(a) {
    var c = bodyColor(a);
    switch (a.base) {
      case 'gato': return '<path d="M128 200 C160 196 164 160 150 146" stroke="' + c + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
      case 'cachorro': return '<path d="M128 198 C150 192 156 176 152 164" stroke="' + c + '" stroke-width="11" fill="none" stroke-linecap="round"/>';
      case 'coelho': return '<circle cx="132" cy="206" r="11" fill="#fff"/>';
      case 'urso': case 'panda': return '<circle cx="128" cy="206" r="8" fill="' + (a.base === 'panda' ? '#2f2f38' : c) + '"/>';
      case 'raposa': return '<path d="M126 204 C168 210 176 168 160 150 C150 176 140 186 126 190 Z" fill="' + c + '"/><path d="M160 150 C168 160 170 172 166 182 C160 172 158 162 160 150 Z" fill="#fff"/>';
      case 'leao': return '<path d="M128 202 C156 204 162 184 158 170" stroke="' + c + '" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="158" cy="166" r="8" fill="#b8661f"/>';
    }
    return '';
  }

  /* pernas + parte de baixo */
  function legs(a) {
    var lc = limbColor(a), top = BY_ID[a.top] || {}, b = a.bottom, bc = col(CLOTH, a.bottomColor), s = '';
    if (top.suit) {
      return '<rect x="74" y="200" width="24" height="70" rx="10" fill="#eef2f8" stroke="#c9d3e3" stroke-width="2"/><rect x="102" y="200" width="24" height="70" rx="10" fill="#eef2f8" stroke="#c9d3e3" stroke-width="2"/>' +
        '<rect x="74" y="246" width="24" height="7" fill="#ff9f1c"/><rect x="102" y="246" width="24" height="7" fill="#ff9f1c"/>';
    }
    // pele das pernas
    s += '<rect x="76" y="200" width="20" height="70" rx="9" fill="' + lc + '"/><rect x="104" y="200" width="20" height="70" rx="9" fill="' + lc + '"/>';
    if (top.dress) return s;
    switch (b) {
      case 'bot-calca':
        s += '<rect x="73" y="198" width="26" height="70" rx="9" fill="' + bc + '"/><rect x="101" y="198" width="26" height="70" rx="9" fill="' + bc + '"/><rect x="73" y="196" width="54" height="18" rx="6" fill="' + bc + '"/>'; break;
      case 'bot-jeans':
        s += '<rect x="73" y="198" width="26" height="70" rx="9" fill="#3d6fb6"/><rect x="101" y="198" width="26" height="70" rx="9" fill="#3d6fb6"/><rect x="73" y="196" width="54" height="18" rx="6" fill="#3d6fb6"/>' +
          '<g stroke="#9fc1ee" stroke-width="1.5" stroke-dasharray="3 3" fill="none"><path d="M86 214 v52"/><path d="M114 214 v52"/><path d="M76 204 h48"/></g><circle cx="100" cy="203" r="2.4" fill="#e7c26b"/>'; break;
      case 'bot-bermuda':
        s += '<rect x="72" y="196" width="56" height="20" rx="7" fill="' + bc + '"/><rect x="72" y="200" width="27" height="34" rx="8" fill="' + bc + '"/><rect x="101" y="200" width="27" height="34" rx="8" fill="' + bc + '"/>'; break;
      case 'bot-legging':
        s += '<rect x="74" y="198" width="24" height="66" rx="9" fill="' + bc + '"/><rect x="102" y="198" width="24" height="66" rx="9" fill="' + bc + '"/><rect x="74" y="196" width="52" height="16" rx="6" fill="' + bc + '"/>' +
          '<g fill="' + shade(bc, 0.5) + '"><circle cx="82" cy="216" r="3"/><circle cx="91" cy="234" r="3"/><circle cx="82" cy="252" r="3"/><circle cx="110" cy="222" r="3"/><circle cx="119" cy="240" r="3"/><circle cx="110" cy="256" r="3"/></g>'; break;
      case 'bot-saia':
        s += '<path d="M72 196 H128 L138 240 Q100 248 62 240 Z" fill="' + bc + '"/><path d="M72 196 H128 L130 204 H70 Z" fill="' + shade(bc, -0.2) + '"/>'; break;
      case 'bot-xadrez':
        s += '<path d="M72 196 H128 L138 240 Q100 248 62 240 Z" fill="' + bc + '"/>' +
          '<g stroke="' + shade(bc, -0.35) + '" stroke-width="3" opacity=".75"><path d="M86 196 L82 244"/><path d="M100 196 V246"/><path d="M114 196 L118 244"/><path d="M68 214 H132"/><path d="M64 230 H136"/></g>'; break;
    }
    return s;
  }
  function shoes(a) {
    var c = col(CLOTH, a.shoesColor), top = BY_ID[a.top] || {};
    if (top.suit) return '<ellipse cx="86" cy="276" rx="16" ry="9" fill="#a9b4c9"/><ellipse cx="114" cy="276" rx="16" ry="9" fill="#a9b4c9"/>';
    switch (a.shoes) {
      case 'sap-sandalia': return '<ellipse cx="86" cy="277" rx="15" ry="6" fill="' + c + '"/><ellipse cx="114" cy="277" rx="15" ry="6" fill="' + c + '"/><ellipse cx="86" cy="271" rx="10" ry="5" fill="' + limbColor(a) + '"/><ellipse cx="114" cy="271" rx="10" ry="5" fill="' + limbColor(a) + '"/><path d="M78 271 h16 M106 271 h16" stroke="' + shade(c, -0.3) + '" stroke-width="3"/>';
      case 'sap-botas': return '<rect x="74" y="244" width="24" height="30" rx="7" fill="' + c + '"/><rect x="102" y="244" width="24" height="30" rx="7" fill="' + c + '"/><ellipse cx="84" cy="276" rx="16" ry="7" fill="' + shade(c, -0.3) + '"/><ellipse cx="116" cy="276" rx="16" ry="7" fill="' + shade(c, -0.3) + '"/>';
      case 'sap-led': return '<ellipse cx="86" cy="275" rx="16" ry="9" fill="#2b2f4a"/><ellipse cx="114" cy="275" rx="16" ry="9" fill="#2b2f4a"/><rect x="70" y="278" width="32" height="4" rx="2" fill="#64f4ff"/><rect x="98" y="278" width="32" height="4" rx="2" fill="#ff5cf4"/>' +
        '<circle cx="84" cy="271" r="2" fill="#64f4ff"/><circle cx="112" cy="271" r="2" fill="#ff5cf4"/>';
      case 'sap-patins': return '<ellipse cx="86" cy="271" rx="15" ry="9" fill="' + c + '"/><ellipse cx="114" cy="271" rx="15" ry="9" fill="' + c + '"/><rect x="72" y="276" width="30" height="4" rx="2" fill="#8a8f99"/><rect x="100" y="276" width="30" height="4" rx="2" fill="#8a8f99"/>' +
        '<g fill="#ffd23f" stroke="#c99a00" stroke-width="1"><circle cx="76" cy="284" r="4"/><circle cx="86" cy="284" r="4"/><circle cx="96" cy="284" r="4"/><circle cx="104" cy="284" r="4"/><circle cx="114" cy="284" r="4"/><circle cx="124" cy="284" r="4"/></g>';
      default: return '<ellipse cx="86" cy="275" rx="16" ry="9" fill="' + c + '"/><ellipse cx="114" cy="275" rx="16" ry="9" fill="' + c + '"/><rect x="70" y="277" width="32" height="5" rx="2.5" fill="#fff"/><rect x="98" y="277" width="32" height="5" rx="2.5" fill="#fff"/>';
    }
  }

  /* tronco + braços (com mangas da roupa) */
  function torso(a) {
    var top = BY_ID[a.top] || BY_ID['top-camiseta'], c = col(CLOTH, a.topColor), lc = limbColor(a), s = '', sleeve = null, longSleeve = false;
    var torsoPath = 'M72 148 Q100 138 128 148 L132 210 Q100 216 68 210 Z';
    switch (top.id) {
      case 'top-regata':
        s += '<path d="' + torsoPath + '" fill="' + lc + '"/><path d="M80 146 Q100 160 120 146 L130 210 Q100 216 70 210 Z" fill="' + c + '"/>'; break;
      case 'top-listrada':
        s += '<path d="' + torsoPath + '" fill="#fff"/><g fill="' + c + '"><rect x="68" y="156" width="64" height="9"/><rect x="68" y="174" width="64" height="9"/><rect x="68" y="192" width="64" height="9"/></g>'; sleeve = c; break;
      case 'top-moletom':
        s += '<path d="' + torsoPath + '" fill="' + c + '"/><path d="M84 146 Q100 158 116 146" stroke="' + shade(c, -0.3) + '" stroke-width="7" fill="none"/>' +
          '<path d="M86 186 h28 v18 h-28 z" fill="' + shade(c, -0.15) + '"/><path d="M95 152 v14 M105 152 v14" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>'; sleeve = c; longSleeve = true; break;
      case 'top-time':
        s += '<path d="' + torsoPath + '" fill="' + c + '"/><path d="M90 146 L100 158 L110 146" fill="#fff"/><rect x="68" y="196" width="64" height="6" fill="#fff" opacity=".85"/>' +
          '<text x="100" y="190" text-anchor="middle" font-size="24" font-weight="700" font-family="Fredoka,sans-serif" fill="#fff">10</text>'; sleeve = c; break;
      case 'top-vestido':
        s += '<path d="M74 148 Q100 140 126 148 L130 196 Q100 202 70 196 Z" fill="' + c + '"/><path d="M70 194 H130 L146 250 Q100 260 54 250 Z" fill="' + c + '"/>' +
          '<path d="M70 194 H130" stroke="' + shade(c, -0.25) + '" stroke-width="5"/><g fill="' + shade(c, 0.45) + '"><circle cx="80" cy="226" r="4"/><circle cx="100" cy="238" r="4"/><circle cx="120" cy="226" r="4"/><circle cx="92" cy="214" r="3"/><circle cx="110" cy="214" r="3"/></g>'; sleeve = c; break;
      case 'top-jaqueta':
        s += '<path d="' + torsoPath + '" fill="#fff"/><path d="M72 148 Q86 142 92 146 L94 212 Q80 214 68 210 Z" fill="' + c + '"/><path d="M128 148 Q114 142 108 146 L106 212 Q120 214 132 210 Z" fill="' + c + '"/>' +
          '<path d="M92 146 L84 162 L94 168 M108 146 L116 162 L106 168" fill="none" stroke="' + shade(c, -0.3) + '" stroke-width="3"/>'; sleeve = c; longSleeve = true; break;
      case 'top-jaleco':
        s += '<path d="' + torsoPath + '" fill="#8bc6ff"/><path d="M72 148 Q86 142 94 146 L96 222 Q80 224 66 220 Z" fill="#ffffff"/><path d="M128 148 Q114 142 106 146 L104 222 Q120 224 134 220 Z" fill="#ffffff"/>' +
          '<rect x="112" y="166" width="12" height="10" rx="2" fill="#e3ecf8"/><path d="M116 162 v8" stroke="#4c97ff" stroke-width="2"/><path d="M120 162 v8" stroke="#ff5a5a" stroke-width="2"/>'; sleeve = '#ffffff'; longSleeve = true; break;
      case 'top-heroi':
        s += '<path d="' + torsoPath + '" fill="' + c + '"/><polygon points="100,160 106,173 120,174 109,183 113,197 100,189 87,197 91,183 80,174 94,173" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/>' +
          '<rect x="68" y="202" width="64" height="8" fill="' + shade(c, -0.35) + '"/>'; sleeve = c; longSleeve = true; break;
      case 'top-astronauta':
        s += '<path d="' + torsoPath + '" fill="#eef2f8" stroke="#c9d3e3" stroke-width="2"/><rect x="86" y="164" width="28" height="22" rx="5" fill="#2b2f4a"/><circle cx="93" cy="171" r="3" fill="#ff5a5a"/><circle cx="101" cy="171" r="3" fill="#34c759"/><circle cx="109" cy="171" r="3" fill="#ffd23f"/><rect x="90" y="178" width="20" height="4" rx="2" fill="#64f4ff"/>' +
          '<path d="M78 150 q-6 30 0 58" stroke="#4c97ff" stroke-width="4" fill="none"/>'; sleeve = '#eef2f8'; longSleeve = true; break;
      default:
        s += '<path d="' + torsoPath + '" fill="' + c + '"/><path d="M88 146 Q100 156 112 146" stroke="' + shade(c, -0.25) + '" stroke-width="4" fill="none"/>'; sleeve = c;
    }
    // braços
    var arms = '<path d="M72 156 Q62 182 58 210" stroke="' + lc + '" stroke-width="16" stroke-linecap="round" fill="none"/>' +
      '<path d="M128 156 Q138 182 142 210" stroke="' + lc + '" stroke-width="16" stroke-linecap="round" fill="none"/>';
    if (sleeve) {
      arms += longSleeve
        ? '<path d="M72 156 Q62 182 59 204" stroke="' + sleeve + '" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M128 156 Q138 182 141 204" stroke="' + sleeve + '" stroke-width="18" stroke-linecap="round" fill="none"/>'
        : '<path d="M72 154 Q67 166 65 176" stroke="' + sleeve + '" stroke-width="19" stroke-linecap="round" fill="none"/><path d="M128 154 Q133 166 135 176" stroke="' + sleeve + '" stroke-width="19" stroke-linecap="round" fill="none"/>';
    }
    var hands = a.base === 'pessoa'
      ? '<circle cx="57" cy="214" r="9" fill="' + lc + '"/><circle cx="143" cy="214" r="9" fill="' + lc + '"/>'
      : '<circle cx="57" cy="214" r="10" fill="' + lc + '"/><circle cx="143" cy="214" r="10" fill="' + lc + '"/>';
    if (top.id === 'top-astronauta') hands = '<circle cx="57" cy="214" r="10" fill="#a9b4c9"/><circle cx="143" cy="214" r="10" fill="#a9b4c9"/>';
    return arms + s + hands;
  }

  function neckItem(a) {
    var c = col(CLOTH, a.neckColor);
    switch (a.neck) {
      case 'pes-gravata': return '<path d="M100 150 L84 141 L84 159 Z M100 150 L116 141 L116 159 Z" fill="' + c + '"/><circle cx="100" cy="150" r="5" fill="' + shade(c, -0.3) + '"/>';
      case 'pes-cachecol': return '<path d="M74 142 Q100 156 126 142 L128 152 Q100 168 72 152 Z" fill="' + c + '"/><rect x="108" y="150" width="14" height="38" rx="4" fill="' + c + '"/><path d="M110 184 h10" stroke="' + shade(c, 0.5) + '" stroke-width="3"/><path d="M80 148 l4 6 M92 152 l4 6 M106 152 l4 -6 M118 148 l4 -6" stroke="' + shade(c, 0.5) + '" stroke-width="3"/>';
      case 'pes-medalha': return '<path d="M84 142 L100 172 L116 142" stroke="#4c97ff" stroke-width="5" fill="none"/><circle cx="100" cy="178" r="11" fill="#ffd23f" stroke="#e0a800" stroke-width="3"/><text x="100" y="183" text-anchor="middle" font-size="12" font-weight="700" fill="#b37b00" font-family="sans-serif">1</text>';
    }
    return '';
  }

  /* orelhas que ficam atrás da cabeça */
  function earsBack(a) {
    var c = bodyColor(a), inner = '#ffb3c6';
    switch (a.base) {
      case 'pessoa': return '<ellipse cx="51" cy="96" rx="8" ry="11" fill="' + c + '"/><ellipse cx="149" cy="96" rx="8" ry="11" fill="' + c + '"/>';
      case 'gato': return '<path d="M58 70 L64 28 L94 52 Z" fill="' + c + '"/><path d="M142 70 L136 28 L106 52 Z" fill="' + c + '"/><path d="M66 62 L68 38 L86 52 Z" fill="' + inner + '"/><path d="M134 62 L132 38 L114 52 Z" fill="' + inner + '"/>';
      case 'raposa': return '<path d="M56 74 L58 24 L96 52 Z" fill="' + c + '"/><path d="M144 74 L142 24 L104 52 Z" fill="' + c + '"/><path d="M64 64 L64 36 L86 52 Z" fill="#2f2f38"/><path d="M136 64 L136 36 L114 52 Z" fill="#2f2f38"/>';
      case 'coelho': return '<ellipse cx="78" cy="30" rx="13" ry="36" fill="' + c + '" transform="rotate(-10 78 30)"/><ellipse cx="122" cy="30" rx="13" ry="36" fill="' + c + '" transform="rotate(10 122 30)"/>' +
        '<ellipse cx="78" cy="32" rx="6" ry="26" fill="' + inner + '" transform="rotate(-10 78 32)"/><ellipse cx="122" cy="32" rx="6" ry="26" fill="' + inner + '" transform="rotate(10 122 32)"/>';
      case 'urso': return '<circle cx="62" cy="54" r="17" fill="' + c + '"/><circle cx="138" cy="54" r="17" fill="' + c + '"/><circle cx="62" cy="54" r="8" fill="' + shade(c, 0.3) + '"/><circle cx="138" cy="54" r="8" fill="' + shade(c, 0.3) + '"/>';
      case 'panda': return '<circle cx="62" cy="54" r="17" fill="#2f2f38"/><circle cx="138" cy="54" r="17" fill="#2f2f38"/>';
      case 'cachorro': return '';
      case 'leao': {
        var m = '#b8661f', s = '';
        for (var i = 0; i < 14; i++) {
          var ang = i / 14 * Math.PI * 2, x = 100 + Math.cos(ang) * 56, y = 94 + Math.sin(ang) * 56;
          s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="17" fill="' + (i % 2 ? m : shade(m, 0.15)) + '"/>';
        }
        return s + '<circle cx="66" cy="54" r="11" fill="' + c + '"/><circle cx="134" cy="54" r="11" fill="' + c + '"/>';
      }
    }
    return '';
  }
  /* orelhas que caem na frente (cachorro) */
  function earsFront(a) {
    if (a.base !== 'cachorro') return '';
    var c = shade(bodyColor(a), -0.3);
    return '<path d="M58 62 Q40 70 44 110 Q50 124 62 112 Q66 86 70 66 Z" fill="' + c + '"/><path d="M142 62 Q160 70 156 110 Q150 124 138 112 Q134 86 130 66 Z" fill="' + c + '"/>';
  }

  function face(a) {
    var s = '', hc = bodyColor(a);
    var eyeY = 96;
    if (a.base === 'panda') {
      s += '<ellipse cx="80" cy="96" rx="13" ry="16" fill="#2f2f38" transform="rotate(-20 80 96)"/><ellipse cx="120" cy="96" rx="13" ry="16" fill="#2f2f38" transform="rotate(20 120 96)"/>';
    }
    // focinho
    if (a.base !== 'pessoa') {
      var mz = a.base === 'panda' || a.base === 'coelho' ? '#ffffff' : a.base === 'raposa' ? '#ffffff' : shade(hc, 0.45);
      if (a.base === 'raposa') s += '<path d="M54 104 Q74 98 100 112 Q126 98 146 104 Q136 140 100 142 Q64 140 54 104 Z" fill="#fff"/>';
      else s +=  '<ellipse cx="100" cy="116" rx="' + (a.base === 'cachorro' || a.base === 'urso' || a.base === 'leao' ? 24 : 20) + '" ry="16" fill="' + mz + '"/>';
      s += '<ellipse cx="100" cy="108" rx="7" ry="5" fill="#2f2f38"/>';
      s += '<path d="M100 113 v6 M100 119 q-7 6 -12 1 M100 119 q7 6 12 1" stroke="#2f2f38" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
      if (a.base === 'gato' || a.base === 'leao' || a.base === 'raposa') s += '<g stroke="#2f2f38" stroke-width="1.6" opacity=".55"><path d="M78 112 h-20 M78 118 l-18 4 M122 112 h20 M122 118 l18 4"/></g>';
      if (a.base === 'coelho') s += '<rect x="95" y="124" width="10" height="9" rx="2" fill="#fff" stroke="#ddd"/>';
    }
    // olhos
    var ex = a.base === 'pessoa' ? 82 : 80;
    var eyeCol = a.base === 'panda' ? '#ffffff' : '#2b1d14';
    s += '<ellipse cx="' + ex + '" cy="' + eyeY + '" rx="6.5" ry="8" fill="' + eyeCol + '"/><ellipse cx="' + (200 - ex) + '" cy="' + eyeY + '" rx="6.5" ry="8" fill="' + eyeCol + '"/>';
    if (a.base === 'panda') s += '<circle cx="' + ex + '" cy="' + eyeY + '" r="4" fill="#2b1d14"/><circle cx="' + (200 - ex) + '" cy="' + eyeY + '" r="4" fill="#2b1d14"/>';
    s += '<circle cx="' + (ex + 2) + '" cy="' + (eyeY - 3) + '" r="2.4" fill="#fff"/><circle cx="' + (202 - ex) + '" cy="' + (eyeY - 3) + '" r="2.4" fill="#fff"/>';
    // bochechas e boca
    s += '<ellipse cx="' + (a.base === 'pessoa' ? 70 : 66) + '" cy="114" rx="8" ry="5" fill="#ff8fab" opacity=".5"/><ellipse cx="' + (a.base === 'pessoa' ? 130 : 134) + '" cy="114" rx="8" ry="5" fill="#ff8fab" opacity=".5"/>';
    if (a.base === 'pessoa') s += '<path d="M88 116 Q100 128 112 116" stroke="#8a3b2b" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M98 104 q2 4 4 0" stroke="' + shade(hc, -0.25) + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    return s;
  }

  /* cabelo: back = atrás da cabeça, front = franja/topo */
  function hair(a, part) {
    if (a.base !== 'pessoa') return '';
    var c = col(HAIR_COLORS, a.hairColor), d = shade(c, -0.25);
    var top = '<path d="M50 92 Q48 40 100 38 Q152 40 150 92 Q140 66 118 60 Q98 72 70 66 Q56 74 50 92 Z" fill="' + c + '"/>';
    switch (a.hair) {
      case 'cab-careca': return part === 'front' ? '<path d="M54 84 Q58 44 100 42 Q142 44 146 84 Q126 60 100 58 Q74 60 54 84 Z" fill="' + c + '" opacity=".35"/>' : '';
      case 'cab-curto': return part === 'front' ? top : '';
      case 'cab-espetado': return part === 'front'
        ? '<path d="M50 92 L46 56 L62 62 L60 34 L80 48 L86 22 L100 42 L114 22 L120 48 L140 34 L138 62 L154 56 L150 92 Q140 66 118 62 Q98 70 72 64 Q56 72 50 92 Z" fill="' + c + '"/>' : '';
      case 'cab-moicano': return part === 'front'
        ? '<path d="M54 86 Q56 52 100 50 Q144 52 146 86 Q126 68 100 66 Q74 68 54 86 Z" fill="' + c + '" opacity=".35"/><path d="M88 66 L84 30 L96 38 L100 18 L104 38 L116 30 L112 66 Z" fill="' + c + '"/>' : '';
      case 'cab-longo': return part === 'back'
        ? '<path d="M50 90 Q44 40 100 36 Q156 40 150 90 L156 178 Q132 190 120 170 L80 170 Q68 190 44 178 Z" fill="' + d + '"/>'
        : '<path d="M48 104 Q44 38 100 36 Q156 38 152 104 Q146 70 124 58 Q104 74 66 62 Q52 76 48 104 Z" fill="' + c + '"/>';
      case 'cab-cacheado': {
        if (part === 'back') {
          var s = '';
          [[54, 76], [50, 104], [56, 130], [146, 76], [150, 104], [144, 130], [70, 46], [100, 36], [130, 46]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="18" fill="' + d + '"/>'; });
          return s;
        }
        var f = '';
        [[66, 58], [84, 48], [102, 46], [120, 50], [136, 60], [56, 76], [146, 78]].forEach(function (p) { f += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="' + c + '"/>'; });
        return f;
      }
      case 'cab-black': return part === 'back'
        ? '<circle cx="100" cy="74" r="66" fill="' + d + '"/>'
        : '<path d="M50 88 Q52 48 100 46 Q148 48 150 88 Q136 66 100 64 Q64 66 50 88 Z" fill="' + c + '"/>';
      case 'cab-rabo': return part === 'back'
        ? '<path d="M138 60 Q176 70 168 120 Q164 150 150 160 Q158 120 136 84 Z" fill="' + d + '"/><circle cx="142" cy="62" r="7" fill="#ff6b9a"/>'
        : top;
      case 'cab-trancas': return part === 'back'
        ? (function () {
          var s2 = '';
          for (var i = 0; i < 5; i++) { s2 += '<ellipse cx="50" cy="' + (100 + i * 14) + '" rx="8" ry="8" fill="' + d + '"/><ellipse cx="150" cy="' + (100 + i * 14) + '" rx="8" ry="8" fill="' + d + '"/>'; }
          return s2 + '<circle cx="50" cy="172" r="5" fill="#ffd23f"/><circle cx="150" cy="172" r="5" fill="#ffd23f"/>';
        })()
        : '<path d="M50 94 Q46 40 100 38 Q154 40 150 94 Q140 64 100 62 Q60 64 50 94 Z" fill="' + c + '"/><path d="M100 40 V62" stroke="' + d + '" stroke-width="3"/>';
      case 'cab-coque': return part === 'back'
        ? '<circle cx="100" cy="34" r="20" fill="' + d + '"/>'
        : '<path d="M50 90 Q50 44 100 42 Q150 44 150 90 Q138 64 100 62 Q62 64 50 90 Z" fill="' + c + '"/><rect x="88" y="44" width="24" height="6" rx="3" fill="#ff6b9a"/>';
    }
    return part === 'front' ? top : '';
  }

  function glasses(a) {
    switch (a.glasses) {
      case 'ocu-redondo': return '<g fill="rgba(255,255,255,.25)" stroke="#2b2f4a" stroke-width="3.5"><circle cx="80" cy="96" r="13"/><circle cx="120" cy="96" r="13"/></g><path d="M93 96 h14 M67 94 l-15 -4 M133 94 l15 -4" stroke="#2b2f4a" stroke-width="3.5"/>';
      case 'ocu-sol': return '<path d="M62 88 h34 v10 q-2 12 -16 12 q-16 0 -18 -12 Z M104 88 h34 v10 q-2 12 -16 12 q-16 0 -18 -12 Z" fill="#1d2340"/><path d="M96 91 h8 M62 90 l-12 -3 M138 90 l12 -3" stroke="#1d2340" stroke-width="4"/><path d="M68 92 l8 0" stroke="#fff" stroke-width="2.5" opacity=".6"/>';
      case 'ocu-estrela': {
        function star(cx, cy) {
          var p = [];
          for (var i = 0; i < 10; i++) { var r = i % 2 ? 7 : 16, ang = -Math.PI / 2 + i * Math.PI / 5; p.push((cx + Math.cos(ang) * r).toFixed(1) + ',' + (cy + Math.sin(ang) * r).toFixed(1)); }
          return '<polygon points="' + p.join(' ') + '" fill="#ff6b9a" stroke="#c2185b" stroke-width="2.5" opacity=".92"/>';
        }
        return star(80, 96) + star(120, 96) + '<path d="M95 96 h10" stroke="#c2185b" stroke-width="3"/>';
      }
      case 'ocu-visor': return '<rect x="58" y="84" width="84" height="24" rx="12" fill="#0f1a33"/><rect x="66" y="92" width="68" height="8" rx="4" fill="#64f4ff"/><circle cx="56" cy="96" r="5" fill="#a9b4c9"/><circle cx="144" cy="96" r="5" fill="#a9b4c9"/>';
    }
    return '';
  }

  function hat(a) {
    var c = col(CLOTH, a.hatColor);
    switch (a.hat) {
      case 'cha-bone': return '<path d="M52 72 Q54 34 100 32 Q146 34 148 72 Z" fill="' + c + '"/><path d="M100 70 Q150 64 170 76 Q150 84 104 78 Z" fill="' + shade(c, -0.25) + '"/><circle cx="100" cy="34" r="5" fill="' + shade(c, -0.25) + '"/><path d="M100 36 V70" stroke="' + shade(c, -0.15) + '" stroke-width="2"/>';
      case 'cha-gorro': return '<path d="M50 78 Q50 26 100 24 Q150 26 150 78 Z" fill="' + c + '"/><rect x="46" y="68" width="108" height="16" rx="8" fill="' + shade(c, -0.25) + '"/><circle cx="100" cy="22" r="12" fill="#fff"/>' +
        '<g stroke="' + shade(c, 0.3) + '" stroke-width="3"><path d="M70 40 v26 M85 32 v34 M100 30 v36 M115 32 v34 M130 40 v26"/></g>';
      case 'cha-laco': return '<path d="M126 52 L104 40 L106 66 Z M126 52 L148 40 L146 66 Z" fill="' + c + '"/><circle cx="126" cy="53" r="6" fill="' + shade(c, -0.25) + '"/>';
      case 'cha-festa': return '<path d="M74 52 L100 -2 L126 52 Z" fill="' + c + '"/><g fill="#fff"><circle cx="96" cy="20" r="3.5"/><circle cx="108" cy="34" r="3.5"/><circle cx="90" cy="42" r="3.5"/></g><circle cx="100" cy="-2" r="7" fill="#ffd23f"/><rect x="72" y="48" width="56" height="6" rx="3" fill="' + shade(c, -0.25) + '"/>';
      case 'cha-fones': return '<path d="M50 96 Q46 34 100 32 Q154 34 150 96" stroke="#2b2f4a" stroke-width="9" fill="none"/><rect x="38" y="82" width="22" height="34" rx="10" fill="' + c + '"/><rect x="140" y="82" width="22" height="34" rx="10" fill="' + c + '"/>';
      case 'cha-pirata': return '<path d="M40 64 Q100 6 160 64 Q100 50 40 64 Z" fill="#2b2f4a"/><path d="M40 64 Q100 50 160 64 Q100 76 40 64 Z" fill="#1d2340"/><circle cx="100" cy="40" r="8" fill="#fff"/><path d="M92 52 l16 -6 M92 46 l16 6" stroke="#fff" stroke-width="3"/><path d="M42 62 Q100 48 158 62" stroke="#ffd23f" stroke-width="3" fill="none"/>';
      case 'cha-mago': return '<path d="M62 60 L112 -20 L140 60 Z" fill="' + c + '"/><ellipse cx="100" cy="62" rx="58" ry="10" fill="' + shade(c, -0.25) + '"/><g fill="#ffd23f"><circle cx="104" cy="16" r="4"/><circle cx="92" cy="40" r="3"/><circle cx="118" cy="40" r="3.5"/></g>';
      case 'cha-coroa': return '<path d="M64 56 L68 20 L84 38 L100 12 L116 38 L132 20 L136 56 Z" fill="#ffd23f" stroke="#e0a800" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="42" r="6" fill="#ff5a5a"/><circle cx="80" cy="46" r="4" fill="#4c97ff"/><circle cx="120" cy="46" r="4" fill="#34c759"/>';
      case 'cha-capacete': return '<circle cx="100" cy="92" r="66" fill="rgba(180,230,255,.28)" stroke="#eef2f8" stroke-width="7"/><path d="M58 52 Q80 34 104 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><rect x="66" y="148" width="68" height="12" rx="6" fill="#c9d3e3"/>';
    }
    return '';
  }

  function handItem(a) {
    var c = col(CLOTH, a.handColor);
    switch (a.hand) {
      case 'mao-bola': return '<circle cx="152" cy="222" r="17" fill="#fff" stroke="#2b2f4a" stroke-width="2"/><polygon points="152,214 159,219 156,228 148,228 145,219" fill="#2b2f4a"/><path d="M152 205 v9 M168 218 l-9 1 M163 236 l-7 -8 M141 236 l7 -8 M136 218 l9 1" stroke="#2b2f4a" stroke-width="2"/>';
      case 'mao-livro': return '<rect x="134" y="192" width="30" height="38" rx="3" fill="' + c + '" transform="rotate(-8 149 211)"/><rect x="138" y="196" width="22" height="30" fill="#fff" opacity=".9" transform="rotate(-8 149 211)"/><path d="M142 204 h14 M142 210 h14 M142 216 h10" stroke="#c9d3e3" stroke-width="2" transform="rotate(-8 149 211)"/>';
      case 'mao-picole': return '<rect x="146" y="166" width="20" height="36" rx="10" fill="#ff6b9a"/><rect x="146" y="166" width="20" height="12" rx="6" fill="#ffd6e4"/><rect x="153" y="200" width="6" height="18" rx="3" fill="#e2b77a"/>';
      case 'mao-controle': return '<rect x="130" y="204" width="40" height="22" rx="11" fill="#2b2f4a"/><path d="M140 212 v8 M136 216 h8" stroke="#fff" stroke-width="2.5"/><circle cx="158" cy="212" r="3" fill="#ff5a5a"/><circle cx="164" cy="218" r="3" fill="#34c759"/>';
      case 'mao-varinha': return '<path d="M146 222 L176 168" stroke="#5a3622" stroke-width="6" stroke-linecap="round"/><polygon points="178,150 182,162 194,163 185,171 188,183 178,176 168,183 171,171 162,163 174,162" fill="#ffd23f" stroke="#e0a800" stroke-width="1.5"/>' +
        '<g fill="#fff3a6"><circle cx="192" cy="148" r="2.5"/><circle cx="166" cy="150" r="2"/><circle cx="196" cy="178" r="2"/></g>';
      case 'mao-sabre': return '<rect x="143" y="206" width="8" height="22" rx="3" fill="#8a8f99" transform="rotate(20 147 217)"/><path d="M150 208 L182 126" stroke="' + c + '" stroke-width="9" stroke-linecap="round" opacity=".55"/><path d="M150 208 L182 126" stroke="#fff" stroke-width="4" stroke-linecap="round"/>';
    }
    return '';
  }

  function pet(a) {
    switch (a.pet) {
      case 'pet-passaro': return '<g transform="translate(150 132)"><ellipse cx="0" cy="0" rx="16" ry="13" fill="#4cc9f0"/><circle cx="-8" cy="-10" r="10" fill="#4cc9f0"/><circle cx="-11" cy="-12" r="2.5" fill="#1d2340"/><path d="M-19 -9 l-8 3 l8 2 Z" fill="#ffb703"/><path d="M0 -2 q14 -4 18 8 q-12 2 -18 -8" fill="#3a86ff"/><path d="M14 4 l12 -2 l-10 8 Z" fill="#3a86ff"/></g>';
      case 'pet-borboleta': return '<g transform="translate(34 128)"><ellipse cx="-10" cy="-8" rx="12" ry="14" fill="#ff6b9a" transform="rotate(-20)"/><ellipse cx="10" cy="-8" rx="12" ry="14" fill="#ff6b9a" transform="rotate(20)"/><ellipse cx="-8" cy="10" rx="8" ry="10" fill="#ffd23f" transform="rotate(20)"/><ellipse cx="8" cy="10" rx="8" ry="10" fill="#ffd23f" transform="rotate(-20)"/>' +
        '<rect x="-2.5" y="-14" width="5" height="30" rx="2.5" fill="#2b2f4a"/><path d="M0 -14 q-6 -10 -10 -10 M0 -14 q6 -10 10 -10" stroke="#2b2f4a" stroke-width="1.5" fill="none"/></g>';
      case 'pet-byte': return '<g transform="translate(30 236)"><ellipse cx="0" cy="40" rx="18" ry="5" fill="rgba(0,0,0,.15)"/><rect x="-16" y="4" width="32" height="30" rx="8" fill="#f4f7fb" stroke="#d5dbea" stroke-width="2"/><rect x="-18" y="-22" width="36" height="28" rx="9" fill="#f4f7fb" stroke="#d5dbea" stroke-width="2"/>' +
        '<rect x="-13" y="-17" width="26" height="17" rx="5" fill="#0f1a33"/><rect x="-8" y="-13" width="5" height="8" rx="1.5" fill="#64f4ff"/><rect x="3" y="-13" width="5" height="8" rx="1.5" fill="#64f4ff"/><line x1="0" y1="-22" x2="0" y2="-30" stroke="#26304a" stroke-width="2"/><circle cx="0" cy="-31" r="3.5" fill="#ffd23f"/><rect x="-6" y="14" width="12" height="4" rx="2" fill="#1fc8b5"/></g>';
    }
    return '';
  }

  /* SVG completo. opts.crop = 'head' (só rosto, para listas) */
  LA.avatarSVG = function (a, opts) {
    a = LA.avatarClean(a);
    opts = opts || {};
    var hc = bodyColor(a), head = opts.crop === 'head';
    var bg = opts.noBg ? '' : (BG[a.bg] || BG[''])();
    var vb = opts.crop === 'head' ? '28 14 144 144' : '0 0 200 300';
    var headShape = a.base === 'pessoa'
      ? '<ellipse cx="100" cy="94" rx="50" ry="52" fill="' + hc + '"/>'
      : '<ellipse cx="100" cy="94" rx="52" ry="50" fill="' + hc + '"/>';
    var neck = '<rect x="91" y="134" width="18" height="18" rx="6" fill="' + (a.base === 'panda' ? '#2f2f38' : shade(hc, -0.08)) + '"/>';
    var body =
      (opts.crop === 'head' ? '' : '<ellipse cx="100" cy="286" rx="52" ry="8" fill="rgba(0,0,0,.14)"/>') +
      (head ? '' : backItem(a) + tail(a) + legs(a) + shoes(a)) + neck + torso(a) + backStraps(a) + neckItem(a) +
      hair(a, 'back') + earsBack(a) + headShape + earsFront(a) + face(a) + hair(a, 'front') + glasses(a) + hat(a) + (head ? '' : handItem(a) + pet(a));
    var cls = 'avatar-svg' + (opts.cls ? ' ' + opts.cls : '');
    return '<svg class="' + cls + '" viewBox="' + vb + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Avatar">' + bg + '<g class="av-body">' + body + '</g></svg>';
  };

  /* ---------- Moedas ----------
     Ganhas pelo progresso: 10 por fase concluída + 5 por estrela,
     10 por conquista (20 nas especiais). Repetir a fase não duplica:
     só vale a melhor pontuação. Gastas = soma dos itens comprados. */
  LA.coinsEarned = function (p) {
    if (!p) return 0;
    var c = 0;
    for (var k in p.levels) { var r = p.levels[k]; if (r && r.completed) c += 10 + 5 * (r.stars || 0); }
    for (var a in p.achievements) { var ach = LA.achievementById && LA.achievementById(a); c += ach && ach.special ? 20 : 10; }
    return c;
  };
  LA.coinsSpent = function (p) {
    var s = 0;
    if (p && p.inv) for (var id in p.inv) { var it = BY_ID[id]; if (it) s += it.price; }
    return s;
  };
  LA.coins = function (p) { return Math.max(0, LA.coinsEarned(p) - LA.coinsSpent(p)); };
  LA.owns = function (p, id) { var it = BY_ID[id]; return !!it && (it.price === 0 || !!(p && p.inv && p.inv[id])); };
})(globalThis.LA = globalThis.LA || {});
