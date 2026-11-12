/* =========================================================
   LABIRINTO DOS ALGORITMOS — Avatar e Loja
   Personalização do avatar do grupo. Itens grátis podem ser
   usados na hora; os outros são comprados com moedas 🪙.
   Antes de comprar dá para EXPERIMENTAR o item.
   ========================================================= */
(function (LA) {
  'use strict';
  var UI = LA.UI, $ = UI.$, esc = UI.esc, Store = LA.Store, S = LA.Screens;

  var TABS = [
    { id: 'corpo', label: '🧍 Corpo' },
    { id: 'roupas', label: '👕 Roupas' },
    { id: 'acessorios', label: '🎩 Acessórios' },
    { id: 'extras', label: '🐾 Extras' }
  ];
  var COLOR_OF = { top: 'topColor', bottom: 'bottomColor', shoes: 'shoesColor', hat: 'hatColor', neck: 'neckColor', hand: 'handColor', back: 'backColor' };
  var HEAD_SLOTS = { hat: 1, glasses: 1, hair: 1, hairColor: 1, tone: 1 };

  var A = LA.Shop = { tab: 'roupas', draft: null, trying: null };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  S.avatar = function () {
    var p = Store.player();
    if (!p) { UI.show('players', 'avatar'); return; }
    if (!p.avatar) { p.avatar = LA.avatarDefault('pessoa', p.num); Store.save(); }
    A.draft = clone(p.avatar);
    A.trying = null;
    renderTabs();
    render();
  };
  /* Sair da tela desfaz o que estava só sendo experimentado. */
  A.leave = function () {
    A.trying = null;
    var back = S._avatarBack || 'home';
    S._avatarBack = null;
    UI.show(back);
  };

  function renderTabs() {
    var tabs = $('#av-tabs');
    tabs.innerHTML = TABS.map(function (t) { return '<button type="button" class="tab' + (A.tab === t.id ? ' on' : '') + '" data-tab="' + t.id + '" role="tab">' + t.label + '</button>'; }).join('');
    UI.$$('.tab', tabs).forEach(function (b) {
      b.onclick = function () { LA.sfx('click'); A.tab = b.dataset.tab; renderTabs(); renderShop(); $('#av-sections').scrollTop = 0; };
    });
  }

  function render() { renderPreview(); renderShop(); }

  function renderPreview() {
    var p = Store.player();
    $('#av-coins').innerHTML = '🪙 ' + LA.coins(p) + ' moedas';
    $('#av-stage').innerHTML = LA.avatarSVG(A.draft, { cls: 'idle' });
    $('#av-name').innerHTML = esc(Store.name(p)) + (p.turma ? ' <span class="turma-tag">' + esc(LA.turmaLabel(p.turma)) + '</span>' : '');
    var tryBox = $('#av-try');
    if (!A.trying) { tryBox.hidden = true; tryBox.innerHTML = ''; return; }
    var it = LA.avItem(A.trying), have = LA.coins(p), can = have >= it.price;
    tryBox.hidden = false;
    tryBox.innerHTML = '<div class="try-text">👀 Experimentando: <b>' + esc(it.name) + '</b></div>' +
      '<div class="try-actions"><button type="button" class="btn btn-small" id="btn-try-undo">↩ Desfazer</button>' +
      '<button type="button" class="btn btn-small ' + (can ? 'btn-yellow' : '') + '" id="btn-buy"' + (can ? '' : ' disabled') + '>🛒 Comprar por 🪙 ' + it.price + '</button></div>' +
      (can ? '' : '<div class="try-missing">Faltam 🪙 ' + (it.price - have) + '. Concluam fases e ganhem estrelas para juntar moedas!</div>');
    $('#btn-try-undo').onclick = function () { LA.sfx('click'); undoTry(); render(); };
    $('#btn-buy').onclick = function () { buy(it); };
  }

  function undoTry() {
    if (!A.trying) return;
    var it = LA.avItem(A.trying), saved = Store.player().avatar;
    A.draft[it.slot] = saved[it.slot];
    A.trying = null;
  }

  function buy(it) {
    var r = Store.buy(it.id);
    if (!r.ok) {
      LA.sfx('bump');
      UI.toast('🪙', 'Moedas insuficientes', 'Faltam ' + r.missing + ' moedas.');
      return;
    }
    A.draft[it.slot] = it.id;
    A.trying = null;
    Store.setAvatar(A.draft);
    LA.sfx('unlock'); UI.confetti(40);
    UI.toast('🛍️', 'Compraram: ' + esc(it.name) + '!', 'Já está no avatar de vocês.');
    var stage = $('#av-stage');
    render();
    stage.classList.remove('pop'); void stage.offsetWidth; stage.classList.add('pop');
  }

  /* Aplica uma escolha. Itens pagos ainda não comprados ficam só "experimentando". */
  function choose(slot, value) {
    var p = Store.player();
    undoTry();
    if (slot === 'base') {
      if (A.draft.base !== value) {
        var d = LA.avatarDefault(value, p.num);
        A.draft.base = value; A.draft.tone = value === 'pessoa' ? Math.min(A.draft.tone, LA.AV_PALETTES.skin.length - 1) : d.tone;
        var max = value === 'pessoa' ? LA.AV_PALETTES.skin.length : (LA.AV_PALETTES.fur[value] || [0]).length;
        if (A.draft.tone >= max) A.draft.tone = 0;
      }
    } else if (/Color$/.test(slot) || slot === 'tone') {
      A.draft[slot] = value;
    } else {
      var it = value ? LA.avItem(value) : null;
      if (it && !LA.owns(p, it.id)) {
        A.draft[slot] = it.id; A.trying = it.id;
        LA.sfx('click');
        render();
        return;
      }
      A.draft[slot] = value && A.draft[slot] === value && LA.AV_OPTIONAL[slot] ? '' : value;
    }
    LA.sfx('click');
    Store.setAvatar(A.draft);
    render();
  }

  function renderShop() {
    var p = Store.player(), box = $('#av-sections'), html = '';
    var person = A.draft.base === 'pessoa';
    LA.AV_SLOTS.filter(function (s) { return s.tab === A.tab && (!s.people || person); }).forEach(function (s) {
      html += '<section class="av-sec"><h3>' + esc(s.name) + '</h3>';
      if (s.id === 'base') {
        html += '<div class="av-grid">' + LA.AV_BASES.map(function (b) {
          var cfg = clone(A.draft); cfg.base = b.id;
          if (b.id !== A.draft.base) { var d = LA.avatarDefault(b.id, p.num); cfg.tone = b.id === 'pessoa' ? 0 : d.tone; }
          return tile('base', b.id, b.icon + ' ' + b.name, LA.avatarSVG(cfg, { noBg: true }), A.draft.base === b.id, 'Grátis');
        }).join('') + '</div>';
      } else if (s.id === 'tone') {
        var pal = person ? LA.AV_PALETTES.skin : (LA.AV_PALETTES.fur[A.draft.base] || []);
        html += swatches('tone', pal, A.draft.tone);
      } else if (s.id === 'hairColor') {
        html += swatches('hairColor', LA.AV_PALETTES.hair, A.draft.hairColor);
      } else {
        var items = LA.AV_ITEMS.filter(function (it) { return it.slot === s.id; });
        var tiles = '';
        if (LA.AV_OPTIONAL[s.id]) {
          var none = clone(A.draft); none[s.id] = '';
          tiles += tile(s.id, '', 'Nenhum', preview(none, s.id), !A.draft[s.id], 'Grátis');
        }
        items.forEach(function (it) {
          var cfg = clone(A.draft); cfg[s.id] = it.id;
          var owned = LA.owns(p, it.id);
          var price = it.price === 0 ? 'Grátis' : owned ? '✔ De vocês' : '🪙 ' + it.price;
          tiles += tile(s.id, it.id, it.name, preview(cfg, s.id), A.draft[s.id] === it.id, price, !owned, A.trying === it.id);
        });
        html += '<div class="av-grid">' + tiles + '</div>';
        var ck = COLOR_OF[s.id], cur = LA.avItem(A.draft[s.id]);
        if (ck && cur && cur.color) html += '<div class="color-row"><span>🎨 Cor:</span>' + swatches(ck, LA.AV_PALETTES.cloth, A.draft[ck], true) + '</div>';
      }
      html += '</section>';
    });
    box.innerHTML = html;
    UI.$$('[data-slot]', box).forEach(function (el) {
      el.onclick = function () {
        var v = el.dataset.val;
        choose(el.dataset.slot, el.hasAttribute('data-num') ? Number(v) : v);
      };
    });
  }
  function preview(cfg, slot) {
    return LA.avatarSVG(cfg, { crop: HEAD_SLOTS[slot] ? 'head' : null, noBg: slot !== 'bg' });
  }
  function tile(slot, val, name, svg, on, price, locked, trying) {
    return '<button type="button" class="av-tile' + (on ? ' on' : '') + (locked ? ' locked' : '') + (trying ? ' trying' : '') + '" data-slot="' + slot + '" data-val="' + esc(val) + '" aria-pressed="' + !!on + '">' +
      '<span class="av-thumb">' + svg + '</span><span class="av-tname">' + esc(name) + '</span><span class="av-price' + (locked ? ' paid' : '') + '">' + price + '</span></button>';
  }
  function swatches(slot, pal, cur, inline) {
    return (inline ? '' : '<div class="swatches">') + pal.map(function (c, i) {
      return '<button type="button" class="swatch' + (i === cur ? ' on' : '') + '" data-slot="' + slot + '" data-val="' + i + '" data-num style="background:' + c + '" aria-label="Cor ' + (i + 1) + '"></button>';
    }).join('') + (inline ? '' : '</div>');
  }
})(globalThis.LA = globalThis.LA || {});
