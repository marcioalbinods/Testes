/* O QUE VEM PRIMEIRO? — Mecânicas de jogo.
   Cada atividade recebe um "ctx" da missão e devolve { el, hint(n), action }.
   ctx: { m, st, say(texto, humor, animação), solved(info), mistake(), sim(ordem), token, sound(nome) } */
(function (root) {
  'use strict';
  const { h, ICON, flip, shake, pop } = root.OQVP.ui;
  const L = root.OQVP.logic;
  const art = root.OQVP.art;

  const REFLECT = [
    'Pense um pouquinho: o que precisamos fazer antes?',
    'Será que podemos realizar essa etapa sem concluir a anterior?',
    'Observe a ordem das ações. Alguma coisa parece estar fora do lugar?'
  ];

  /* ---------- Cartão ilustrado ---------- */
  function cardEl(m, id, o = {}) {
    const c = m.cards[id];
    const el = h('div.card' + (o.mini ? '.mini' : ''), {
      'data-id': id, role: o.role || 'listitem', tabindex: o.focus ? '0' : null,
      'aria-label': c.t
    },
    o.num !== undefined ? h('span.card-num', { 'aria-hidden': 'true' }, String(o.num)) : null,
    h('div.card-art', { html: art.svg(c.art) }),
    h('div.card-text', null, c.t));
    return el;
  }
  const numOf = (el) => el.querySelector('.card-num');

  /* ---------- Arrastar e soltar (mouse, caneta e toque) ---------- */
  function draggable(el, o) {
    let start = null, dragging = false, pid = null;
    const TH = 10;
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('button')) return;
      start = { x: e.clientX, y: e.clientY }; pid = e.pointerId; dragging = false;
      try { el.setPointerCapture(pid); } catch (err) { /* ok */ }
    });
    el.addEventListener('pointermove', (e) => {
      if (!start || e.pointerId !== pid) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) > TH) {
        dragging = true; el.classList.add('dragging'); o.onStart && o.onStart();
      }
      if (dragging) {
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.max(-6, Math.min(6, dx / 20))}deg) scale(1.04)`;
        const t = targetAt(e.clientX, e.clientY);
        document.querySelectorAll('.drop-target').forEach((x) => { if (x !== t) x.classList.remove('drop-target'); });
        if (t) t.classList.add('drop-target');
      }
    });
    const end = (e, cancel) => {
      if (!start || e.pointerId !== pid) return;
      const wasDrag = dragging;
      const t = wasDrag && !cancel ? targetAt(e.clientX, e.clientY) : null;
      start = null; dragging = false;
      el.classList.remove('dragging'); el.style.transform = '';
      document.querySelectorAll('.drop-target').forEach((x) => x.classList.remove('drop-target'));
      if (wasDrag) { if (t) o.onDrop(t); else o.onCancel && o.onCancel(); }
      else if (!cancel) o.onTap && o.onTap();
    };
    el.addEventListener('pointerup', (e) => end(e, false));
    el.addEventListener('pointercancel', (e) => end(e, true));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onTap && o.onTap(); }
      else if (o.onKey) o.onKey(e);
    });
    function targetAt(x, y) {
      const under = document.elementFromPoint(x, y);
      const t = under && under.closest(o.targets);
      return t && t !== el ? t : null;
    }
  }

  /* =========================================================
     MECÂNICA A — ORGANIZE AS ETAPAS (+ F: o robô executa)
     ========================================================= */
  function order(ctx) {
    const { m, st } = ctx;
    let cur = st.startOrder ? st.startOrder.slice() : L.shuffleInvalid(st.ids, m.cards);
    if (st.different && ctx.prevOrder) cur = ctx.prevOrder.slice();
    let selected = null;
    let attempts = 0;
    let showMarks = false;
    const row = h('div.cards-row.order-row', { role: 'list', 'aria-label': 'Cartões para organizar' });
    const el = h('div.activity.act-order', null, row);

    const nodes = {};
    st.ids.forEach((id) => {
      const card = cardEl(m, id, { num: 0, focus: true });
      const left = h('button.arrow.prev', { type: 'button', 'aria-label': 'Mover para antes', html: `<span class="h">${ICON.left}</span><span class="v">${ICON.up}</span>` });
      const right = h('button.arrow.next', { type: 'button', 'aria-label': 'Mover para depois', html: `<span class="h">${ICON.right}</span><span class="v">${ICON.down}</span>` });
      left.addEventListener('click', (e) => { e.stopPropagation(); move(id, -1); });
      right.addEventListener('click', (e) => { e.stopPropagation(); move(id, +1); });
      card.appendChild(h('div.card-arrows', null, left, right));
      draggable(card, {
        targets: '.order-row .card',
        onStart: () => { clearSel(); ctx.sound('pick'); },
        onDrop: (t) => { insertAt(id, cur.indexOf(t.dataset.id)); ctx.sound('drop'); },
        onTap: () => tap(id),
        onKey: (e) => {
          if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); move(id, -1, true); }
          if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); move(id, +1, true); }
        }
      });
      nodes[id] = card;
    });

    function render(animate) {
      const doIt = () => {
        cur.forEach((id, i) => {
          const n = nodes[id];
          row.appendChild(n);
          numOf(n).textContent = i + 1;
          n.setAttribute('aria-label', `Posição ${i + 1}: ${m.cards[id].t}`);
          n.querySelector('.prev').disabled = i === 0;
          n.querySelector('.next').disabled = i === cur.length - 1;
          n.classList.toggle('selected', selected === id);
        });
        markPositions();
      };
      if (animate) flip(row, doIt); else doIt();
      row.style.setProperty('--n', cur.length);
    }
    function markPositions() {
      const ok = showMarks ? L.correctPositions(cur, m.cards) : [];
      cur.forEach((id, i) => nodes[id].classList.toggle('in-place', ok.includes(i)));
    }
    function clearSel() { selected = null; Object.values(nodes).forEach((n) => n.classList.remove('selected')); }
    function tap(id) {
      if (ctx.busy()) return;
      if (selected === null) {
        selected = id; ctx.sound('pick'); render(false);
        ctx.say('Agora toque no cartão que vai trocar de lugar com ele.', 'thinking');
      } else if (selected === id) {
        clearSel(); render(false);
      } else {
        const a = cur.indexOf(selected), b = cur.indexOf(id);
        [cur[a], cur[b]] = [cur[b], cur[a]];
        clearSel(); ctx.sound('drop'); render(true);
        if (talked) ctx.say('Trocou! Continue organizando. Quando estiver pronto, toque em TESTAR.', 'neutral'); else changed();
      }
    }
    function move(id, d, keepFocus) {
      if (ctx.busy()) return;
      const i = cur.indexOf(id), j = i + d;
      if (j < 0 || j >= cur.length) return;
      [cur[i], cur[j]] = [cur[j], cur[i]];
      ctx.sound('tap'); render(true); changed();
      if (keepFocus) nodes[id].focus();
    }
    function insertAt(id, idx) {
      if (ctx.busy() || idx < 0) return;
      cur.splice(cur.indexOf(id), 1); cur.splice(idx, 0, id);
      clearSel(); render(true); changed();
    }
    let talked = false;
    function changed() {
      if (!talked) { talked = true; ctx.say('Isso! Quando achar que está tudo certo, toque em TESTAR para eu executar.', 'neutral'); }
    }

    async function test() {
      if (ctx.busy()) return;
      clearSel(); render(false);
      if (st.different && ctx.prevOrder && L.sameOrder(cur, ctx.prevOrder)) {
        ctx.say('Essa é igual à primeira maneira! Mude a ordem de algumas etapas para criar uma maneira diferente.', 'thinking', 'tilt');
        ctx.sound('oops');
        return;
      }
      const res = await ctx.sim(cur.slice());
      if (res === 'dead') return;
      if (res.ok) {
        const alts = L.validOrders(st.ids, m.cards).length;
        let msg = '';
        if (st.different) msg = `Incrível! Você encontrou outra maneira! Para esta tarefa existem ${alts} sequências corretas.`;
        else if (alts > 1 && m.altMsg) msg = m.altMsg;
        ctx.solved({ order: cur.slice(), msg, bonus: st.bonus });
      } else {
        attempts++;
        ctx.mistake();
        const v = res.violation;
        const needs = m.cards[v.needs].t;
        const q = attempts === 1
          ? `Pense um pouquinho: o que precisamos fazer antes de “${m.cards[v.id].t}”?`
          : `Será que dá para “${m.cards[v.id].t.toLowerCase()}” antes de “${needs.toLowerCase()}”?`;
        showMarks = attempts >= 2;
        render(false);
        ctx.say(`${m.cards[v.id].oops || ''} ${q}${showMarks ? ' Os cartões com ✔ já estão num lugar que funciona.' : ''}`, 'surprised', 'shake');
        nodes[v.id].classList.add('flag'); setTimeout(() => nodes[v.id] && nodes[v.id].classList.remove('flag'), 2400);
      }
    }

    function hint(n) {
      const hs = st.hints || [];
      if (n < hs.length) return hs[n];
      // Ajuda forte: coloca um cartão no lugar certo.
      const target = L.closestValid(cur, m.cards);
      const i = cur.findIndex((id, k) => target[k] !== id);
      if (i === -1) return 'A sua sequência já parece certa! Toque em TESTAR.';
      const id = target[i];
      insertAt(id, i);
      showMarks = true; render(false);
      pop(nodes[id]);
      return `Vou ajudar: “${m.cards[id].t}” fica na posição ${i + 1}. Agora continue você!`;
    }

    render(false);
    return { el, hint, action: { label: 'TESTAR', icon: ICON.play, fn: test }, getOrder: () => cur.slice() };
  }

  /* =========================================================
     MECÂNICAS C e D — QUAL ETAPA FALTA? / O QUE VEM DEPOIS?
     ========================================================= */
  function choice(ctx, kind) {
    const { m, st } = ctx;
    const seq = kind === 'next' ? st.done.concat([st.answer]) : st.seq;
    const blank = kind === 'next' ? st.done.length : st.blank;
    const answer = seq[blank];
    const row = h('div.cards-row.seq-row', { role: 'list', 'aria-label': kind === 'next' ? 'Etapas já feitas' : 'Sequência com uma etapa faltando' });
    let slot = null;
    seq.forEach((id, i) => {
      if (i === blank) {
        slot = h('div.card.slot', { role: 'listitem', 'aria-label': `Espaço vazio na posição ${i + 1}` },
          h('span.card-num', null, String(i + 1)), h('div.slot-q', null, '?'), h('div.card-text', null, kind === 'next' ? 'O que vem depois?' : 'Etapa que falta'));
        row.appendChild(slot);
      } else {
        const c = cardEl(m, id, { num: i + 1 });
        if (kind === 'next') { c.classList.add('done'); c.appendChild(h('span.done-badge', { html: ICON.check, 'aria-label': 'Feito' })); }
        row.appendChild(c);
      }
    });
    const opts = h('div.cards-row.options-row', { role: 'group', 'aria-label': 'Opções de resposta' });
    const optNodes = {};
    const order = shuffle(st.options.slice());
    order.forEach((id) => {
      const c = cardEl(m, id, { role: 'button', focus: true });
      c.classList.add('option');
      draggable(c, { targets: '.card.slot', onTap: () => pick(id), onDrop: () => pick(id), onStart: () => ctx.sound('pick') });
      optNodes[id] = c; opts.appendChild(c);
    });
    row.style.setProperty('--n', seq.length);
    opts.style.setProperty('--n', st.options.length);
    let done = false, tries = 0;
    function pick(id) {
      if (done || ctx.busy() || optNodes[id].classList.contains('tried')) return;
      if (id === answer) {
        done = true;
        const filled = cardEl(m, id, { num: blank + 1 });
        filled.classList.add('filled');
        slot.replaceWith(filled); pop(filled);
        optNodes[id].classList.add('used');
        Object.values(optNodes).forEach((n) => n.setAttribute('aria-disabled', 'true'));
        ctx.sound('good');
        ctx.solved({ msg: kind === 'next' ? 'Isso! Você olhou o que já foi feito para descobrir o próximo passo!' : 'Isso mesmo! Agora a sequência está completa!' });
      } else {
        tries++;
        ctx.mistake();
        optNodes[id].classList.add('tried'); shake(optNodes[id]);
        const why = (st.whyMap && st.whyMap[id]) || m.cards[id].why || REFLECT[tries % 3];
        ctx.say(why + (tries === 1 ? ' Tente outra opção!' : ' Olhe com atenção o antes e o depois.'), 'surprised', 'shake');
      }
    }
    function hint(n) {
      const hs = st.hints || [];
      if (n < hs.length) return hs[n];
      if (n === hs.length && !(st.hints && st.hints.length)) {
        return kind === 'next' ? 'Olhe o último cartão que já foi feito. O que ficou possível depois dele?' : 'Olhe a etapa ANTES e a etapa DEPOIS do espaço vazio. O que liga as duas?';
      }
      const wrong = Object.keys(optNodes).filter((k) => k !== answer && !optNodes[k].classList.contains('tried'));
      if (!wrong.length) return 'Só sobrou uma opção. Toque nela!';
      optNodes[wrong[0]].classList.add('tried');
      return `Vou ajudar: “${m.cards[wrong[0]].t}” não é a resposta. Escolha entre as que sobraram.`;
    }
    const el = h('div.activity.act-choice', null,
      h('p.row-label', null, kind === 'next' ? 'O que já foi feito:' : 'A sequência:'), row,
      h('p.row-label', null, 'Escolha uma opção (toque ou arraste até o ?):'), opts);
    return { el, hint, action: null };
  }

  /* =========================================================
     MECÂNICA B — DESCUBRA O ERRO (troque as duas etapas)
     ========================================================= */
  function fix(ctx) {
    const { m, st } = ctx;
    let cur = st.shown.slice();
    const bad = L.misplacedIndexes(cur, m.cards).map((i) => cur[i]);
    let sel = null, done = false;
    const row = h('div.cards-row.fix-row', { role: 'list', 'aria-label': 'Plano do robô' });
    const nodes = {};
    cur.forEach((id) => {
      const c = cardEl(m, id, { num: 0, focus: true });
      draggable(c, {
        targets: '.fix-row .card', onTap: () => tap(id),
        onDrop: (t) => { sel = id; tap(t.dataset.id); }, onStart: () => ctx.sound('pick')
      });
      nodes[id] = c;
    });
    function render(anim) {
      const doIt = () => cur.forEach((id, i) => {
        row.appendChild(nodes[id]); numOf(nodes[id]).textContent = i + 1;
        nodes[id].classList.toggle('selected', sel === id);
      });
      if (anim) flip(row, doIt); else doIt();
      row.style.setProperty('--n', cur.length);
    }
    function tap(id) {
      if (done || ctx.busy()) return;
      if (sel === null) { sel = id; ctx.sound('pick'); render(false); ctx.say('Agora toque na outra etapa que está trocada.', 'thinking'); return; }
      if (sel === id) { sel = null; render(false); return; }
      const a = cur.indexOf(sel), b = cur.indexOf(id);
      const res = L.swapFixes(cur, a, b, m.cards);
      const first = sel; sel = null;
      if (res.valid) {
        cur = res.order; render(true); done = true;
        ctx.sound('good');
        cur.forEach((x) => nodes[x].classList.add('in-place'));
        ctx.solved({ fixes: 2, order: cur.slice(), msg: 'Você encontrou as duas etapas trocadas e corrigiu o plano!' });
      } else {
        ctx.mistake();
        render(false);
        shake(nodes[first]); shake(nodes[id]);
        const inBad = [first, id].filter((x) => bad.includes(x));
        let msg;
        if (inBad.length === 0) msg = st.okSwapMsg && isAltPair(first, id) ? st.okSwapMsg : 'Essas duas etapas já estão em lugares que funcionam. Procure outras!';
        else msg = `Boa! “${m.cards[inBad[0]].t}” está mesmo fora do lugar. Mas a troca não é com essa outra etapa. Procure o par certo!`;
        ctx.say(msg, 'surprised', 'shake');
      }
    }
    function isAltPair(a, b) { return !(m.cards[a].after || []).includes(b) && !(m.cards[b].after || []).includes(a); }
    function hint(n) {
      const hs = st.hints || [];
      if (n < hs.length) return hs[n];
      const id = bad[n % 2];
      pop(nodes[id]); nodes[id].classList.add('flag'); setTimeout(() => nodes[id].classList.remove('flag'), 2600);
      return `Vou ajudar: o cartão “${m.cards[id].t}” está fora do lugar. Com qual ele deve trocar?`;
    }
    render(false);
    return { el: h('div.activity.act-fix', null, h('p.row-label', null, 'O plano do Pipo (com erro):'), row), hint, action: null };
  }

  /* =========================================================
     AÇÃO DESNECESSÁRIA — qual não faz parte?
     ========================================================= */
  function odd(ctx) {
    const { m, st } = ctx;
    const grid = h('div.cards-row.odd-row', { role: 'group', 'aria-label': 'Ações da lista' });
    const nodes = {};
    let done = false;
    shuffle(st.ids.slice()).forEach((id) => {
      const c = cardEl(m, id, { role: 'button', focus: true });
      c.classList.add('option');
      draggable(c, { targets: '.nothing', onTap: () => pick(id), onDrop: () => {} });
      nodes[id] = c; grid.appendChild(c);
    });
    grid.style.setProperty('--n', st.ids.length);
    function pick(id) {
      if (done || ctx.busy() || nodes[id].classList.contains('needed')) return;
      if (id === st.answer) {
        done = true; nodes[id].classList.add('removed'); ctx.sound('good');
        ctx.solved({ msg: `Isso! “${m.cards[id].t}” não ajuda em nada na trilha. As outras ações são necessárias.` });
      } else {
        ctx.mistake(); shake(nodes[id]); nodes[id].classList.add('needed');
        ctx.say(st.wrongMsg + ` (“${m.cards[id].t}” é necessária.)`, 'surprised', 'shake');
      }
    }
    function hint(n) {
      if (n === 0) return 'Pergunte para cada cartão: isso ajuda a fazer a expedição na trilha?';
      const keep = st.ids.filter((x) => x !== st.answer && !nodes[x].classList.contains('needed'));
      if (!keep.length) return 'Só sobrou uma! Toque nela.';
      keep.slice(0, 2).forEach((x) => nodes[x].classList.add('needed'));
      return 'Vou ajudar: marquei algumas ações que são necessárias. Procure entre as outras!';
    }
    return { el: h('div.activity.act-odd', null, grid), hint, action: null };
  }

  /* =========================================================
     ESCOLHA O PLANO CERTO
     ========================================================= */
  function choose(ctx) {
    const { m, st } = ctx;
    const wrap = h('div.plans', { role: 'group', 'aria-label': 'Planos' });
    const idx = shuffle(st.plans.map((_, i) => i));
    const nodes = {};
    let done = false;
    idx.forEach((pi, k) => {
      const letter = 'ABC'[k];
      const strip = h('div.plan-strip');
      st.plans[pi].forEach((id, j) => {
        if (j) strip.appendChild(h('span.plan-arrow', { html: ICON.right, 'aria-hidden': 'true' }));
        strip.appendChild(cardEl(m, id, { mini: true, num: j + 1 }));
      });
      const btn = h('button.plan', { type: 'button', 'aria-label': `Plano ${letter}: ` + st.plans[pi].map((id) => m.cards[id].t).join(', depois ') },
        h('span.plan-letter', null, letter), strip);
      btn.addEventListener('click', () => pick(pi));
      nodes[pi] = btn; wrap.appendChild(btn);
    });
    function pick(pi) {
      if (done || ctx.busy() || nodes[pi].classList.contains('tried')) return;
      if (pi === st.answer) {
        done = true; nodes[pi].classList.add('right'); ctx.sound('good');
        ctx.solved({ msg: 'Plano perfeito! Primeiro o lixo, depois desmontar, guardar e voltar.' });
      } else {
        ctx.mistake(); nodes[pi].classList.add('tried'); shake(nodes[pi]);
        ctx.say(st.planWhy[pi] + ' Leia os outros planos.', 'surprised', 'shake');
      }
    }
    function hint(n) {
      if (n === 0) return 'Leia cada plano passo a passo. Em algum momento aparece algo impossível ou esquecido?';
      const w = st.plans.map((_, i) => i).filter((i) => i !== st.answer && !nodes[i].classList.contains('tried'));
      if (!w.length) return 'Só sobrou um plano! Toque nele.';
      nodes[w[0]].classList.add('tried');
      return 'Vou ajudar: risquei um plano errado. ' + st.planWhy[w[0]];
    }
    return { el: h('div.activity.act-choose', null, wrap), hint, action: null };
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* =========================================================
     MECÂNICA F — SIMULAÇÃO: o robô executa a sequência
     ========================================================= */
  function simulate(ctx, seq, opts = {}) {
    const { m } = ctx;
    const v = L.firstViolation(seq, m.cards);
    const stop = v ? v.index : seq.length;
    const stage = h('div.sim-stage');
    const caption = h('div.sim-caption', { 'aria-live': 'polite' });
    const strip = h('div.sim-strip');
    seq.forEach((id, i) => strip.appendChild(cardEl(m, id, { mini: true, num: i + 1 })));
    const skip = h('button.btn.small.ghost.sim-skip', { type: 'button', html: `${ICON.go}<span>Pular</span>` });
    const panel = h('div.sim-panel', { role: 'region', 'aria-label': 'O Pipo está executando a sequência' },
      h('div.sim-title', null, opts.title || 'O Pipo está seguindo a sua sequência...'), stage, caption, strip, skip);
    skip.addEventListener('click', () => { ctx.token.skip = true; });
    ctx.token.skip = false;
    return {
      panel,
      run: async () => {
        const T = ctx.speed;
        try {
          for (let i = 0; i <= Math.min(stop, seq.length - 1); i++) {
            const id = seq[i];
            const fail = v && i === stop;
            Array.from(strip.children).forEach((c, k) => { c.classList.toggle('now', k === i); c.classList.toggle('past', k < i); });
            stage.innerHTML = art.svg(m.cards[id].art, 'sim-art');
            stage.className = 'sim-stage' + (fail ? ' fail' : ' play');
            caption.innerHTML = `<b>Passo ${i + 1}:</b> ${m.cards[id].t}`;
            if (fail) {
              stage.appendChild(h('div.sim-oops', null, 'OPS!'));
              Array.from(strip.children)[i].classList.add('bad');
              ctx.robot('surprised', 'shake'); ctx.sound('oops');
              caption.innerHTML = `<b>Passo ${i + 1}:</b> ${m.cards[id].t} — <span class="bad-txt">algo deu errado!</span>`;
              await ctx.wait(ctx.token.skip ? 900 : 1700 * T, true);
              return { ok: false, violation: v };
            }
            ctx.robot(i % 2 ? 'neutral' : 'happy', 'jump'); ctx.sound('step');
            await ctx.wait(1250 * T);
          }
          Array.from(strip.children).forEach((c) => { c.classList.remove('now'); c.classList.add('past'); });
          stage.className = 'sim-stage win';
          stage.appendChild(h('div.sim-done', null, h('span', { html: ICON.check }), 'Tarefa concluída!'));
          ctx.robot('excited', 'dance');
          await ctx.wait(1100 * T, true);
          return { ok: true };
        } catch (e) {
          return 'dead';
        }
      }
    };
  }

  root.OQVP = root.OQVP || {};
  root.OQVP.activities = {
    order, next: (c) => choice(c, 'next'), missing: (c) => choice(c, 'missing'), fix, odd, choose, simulate, cardEl
  };
})(window);
