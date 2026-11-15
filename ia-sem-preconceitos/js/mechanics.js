/* =====================================================================
   MECÂNICAS DE JOGO — cada tipo de etapa é um componente.
   Assinatura: MECH[tipo](step, ctx) -> { el, check?() }
   ctx: setCheck(bool,label?), ok({text,html}), fail({msgs,title}),
        countError(), errors(), sfx(nome), name, registerDossier(files), addClue(t)
   ===================================================================== */
(function () {
  'use strict';
  const { h, shuffle, esc, norm, makeDraggable, makeDropZone, sleep } = ENGINE;
  const { person, icon } = ART;

  const CAT_COLORS = {
    'Homem': '#3b82f6', 'Mulher': '#ec4899', 'Não binária': '#f59e0b', 'Homens': '#3b82f6', 'Mulheres': '#ec4899', 'Não binárias': '#f59e0b',
    'Branca': '#cbd5e1', 'Preta': '#7c3aed', 'Parda': '#fb923c', 'Amarela': '#facc15', 'Indígena': '#10b981', 'Outras': '#64748b',
    '18-29': '#22d3ee', '30-59': '#3b82f6', '60+': '#8b5cf6', '40+': '#6366f1', '18-39': '#22d3ee'
  };
  const colorOf = (k, i) => CAT_COLORS[k] || ['#22d3ee', '#8b5cf6', '#f472b6', '#facc15', '#34d399', '#fb923c', '#60a5fa'][i % 7];

  function countBy(list, dim) {
    const m = {};
    list.forEach((x) => { const v = dim === 'def' ? (x.def ? 'Com deficiência' : 'Sem deficiência') : x[dim]; m[v] = (m[v] || 0) + 1; });
    return m;
  }
  function stackBar(counts, total) {
    const keys = Object.keys(counts);
    return h('div', { class: 'stack' }, keys.map((k, i) => h('div', {
      class: 'stack-seg', title: `${k}: ${counts[k]}`,
      style: { width: (counts[k] / total * 100) + '%', background: colorOf(k, i) }
    })));
  }
  function stackLegend(counts, total) {
    return h('div', { class: 'legend' }, Object.keys(counts).map((k, i) =>
      h('span', { class: 'lg' }, h('i', { style: { background: colorOf(k, i) } }), `${k} ${Math.round(counts[k] / total * 100)}%`)));
  }
  function evalCriterion(list, c) {
    const total = list.length;
    if (c.noIssue) { const bad = list.filter((x) => x.issue).length; return { ok: bad === 0, detail: bad ? `${bad} com problema` : 'Tudo certo' }; }
    if (c.minTrue) { const n = list.filter((x) => x.def).length; return { ok: n >= c.minTrue, detail: `${n} pessoa(s)` }; }
    const counts = countBy(list, c.dim);
    const cats = Object.keys(counts).length;
    const maxShare = total ? Math.max(...Object.values(counts)) / total : 0;
    let ok = total > 0;
    if (c.minCats && cats < c.minCats) ok = false;
    if (c.maxShare && maxShare > c.maxShare + 1e-9) ok = false;
    return { ok, counts, cats, maxShare, detail: `${cats} categoria(s) · maior ${Math.round(maxShare * 100)}%` };
  }
  function feedbackLevel(ctx) { return ctx.errors() + 1; } // 1 = primeira tentativa errada

  function profileCard(p, extra) {
    return h('div', { class: 'pcard' + (p.blur ? ' blurred' : ''), 'data-id': p.id },
      h('div', { class: 'pc-img', html: person(p.spec, { label: p.name }) }),
      h('div', { class: 'pc-body' },
        h('div', { class: 'pc-name' }, p.name), h('div', { class: 'pc-prof' }, p.prof),
        h('div', { class: 'pc-tags' },
          h('span', null, p.genero), h('span', null, p.raca), h('span', null, p.idade), p.regiao ? h('span', null, p.regiao) : null,
          p.def ? h('span', { class: 'def' }, '♿ ' + p.def) : null),
        h('div', { class: 'pc-q ' + (p.issue ? 'bad' : 'good') }, p.issue ? '⚠ Qualidade: ' + p.issue : '✓ Qualidade: boa'),
        extra || null));
  }

  const MECH = {};

  /* ============ 1. GERAR IMAGENS + ESCANEAR + PADRÕES ============ */
  MECH.generate = function (step, ctx) {
    const meta = step.results.map((spec, i) => {
      const p = ART.parse(spec);
      return { i, spec, genero: p.g === 'm' ? 'Homem' : p.g === 'f' ? 'Mulher' : 'Não binária', idade: p.a === 'y' ? '20-35' : p.a === 'a' ? '36-50' : '51+', tom: p.s, def: p.acc.includes('wheelchair') || p.acc.includes('hearing') };
    });
    const scanned = new Set();
    const selected = new Set();
    let phase = 'idle';
    const consoleEl = h('div', { class: 'console' }, h('span', { class: 'c-prompt' }, 'NEXUS> '), h('span', { class: 'c-text' }), h('span', { class: 'caret' }));
    const sendBtn = h('button', { class: 'btn btn-primary', onclick: send }, icon('play'), ' Enviar comando');
    const grid = h('div', { class: 'gen-grid' });
    const counter = h('div', { class: 'scan-counter hidden' });
    const panel = h('div', { class: 'pattern-panel hidden' });
    const chips = h('div', { class: 'chips hidden' });
    const el = h('div', { class: 'mech-generate' },
      h('div', { class: 'gen-top' }, consoleEl, sendBtn), h('div', { class: 'proc hidden' }, h('div', { class: 'proc-bar' }), h('span', null, 'Processando padrões aprendidos…')),
      counter, grid, panel, chips);

    async function send() {
      if (phase !== 'idle') return;
      phase = 'typing'; sendBtn.disabled = true;
      const t = consoleEl.querySelector('.c-text');
      for (const ch of step.prompt) { t.textContent += ch; ctx.sfx('type'); await sleep(ENGINE.reducedMotion() ? 0 : 28); }
      const proc = el.querySelector('.proc'); proc.classList.remove('hidden'); ctx.sfx('scan');
      await sleep(1400); proc.classList.add('hidden'); sendBtn.classList.add('hidden');
      meta.forEach((m, k) => {
        const card = h('button', { class: 'gen-card', 'data-i': m.i, style: { animationDelay: (k * 70) + 'ms' }, 'aria-label': 'Imagem gerada ' + (k + 1) + '. Toque para escanear.' },
          h('div', { class: 'gen-img', html: person(m.spec, { bg: '#1e3a5f' }) }), h('div', { class: 'scanline' }), h('div', { class: 'gen-meta' }));
        card.addEventListener('click', () => scan(card, m));
        grid.appendChild(card);
      });
      phase = 'scan'; counter.classList.remove('hidden'); updCounter();
    }
    function updCounter() { counter.innerHTML = `${icon('search')} Imagens escaneadas: <b>${scanned.size}</b> / ${step.scanRequired} necessárias`; }
    function scan(card, m) {
      if (scanned.has(m.i)) return;
      scanned.add(m.i); card.classList.add('scanning'); ctx.sfx('scan');
      setTimeout(() => {
        card.classList.remove('scanning'); card.classList.add('scanned');
        card.querySelector('.gen-meta').innerHTML = `<span>${m.genero}</span><span>${m.idade} anos</span><span>Tom ${m.tom}</span><span>${m.def ? 'Com deficiência' : 'Sem deficiência visível'}</span>`;
      }, 650);
      updCounter();
      if (scanned.size === step.scanRequired) setTimeout(openPanel, 800);
    }
    function openPanel() {
      ctx.sfx('unlock');
      const total = meta.length;
      const dims = [
        ['Gênero representado', countBy(meta, 'genero')],
        ['Idade aparente', countBy(meta, 'idade')],
        ['Tom de pele (escala de 10 tons do gerador)', meta.reduce((a, m) => { const k = m.tom <= 3 ? 'Tons 1-3' : m.tom <= 6 ? 'Tons 4-6' : 'Tons 7-10'; a[k] = (a[k] || 0) + 1; return a; }, { 'Tons 1-3': 0, 'Tons 4-6': 0, 'Tons 7-10': 0 })],
        ['Pessoas com deficiência', countBy(meta, 'def')]
      ];
      panel.innerHTML = '';
      panel.appendChild(h('h4', null, icon('chart'), ' Painel de Padrões — análise das 12 imagens'));
      const g = h('div', { class: 'pp-grid' });
      dims.forEach(([label, counts]) => {
        g.appendChild(h('div', { class: 'pp-dim' }, h('div', { class: 'pp-label' }, label),
          Object.keys(counts).map((k) => h('div', { class: 'hbar' }, h('span', { class: 'hb-k' }, k), h('div', { class: 'hb-track' }, h('div', { class: 'hb-fill', style: { width: (counts[k] / total * 100) + '%' } })), h('span', { class: 'hb-v' }, counts[k])))));
      });
      panel.appendChild(g);
      panel.appendChild(h('p', { class: 'small muted' }, 'A escala de tons de pele descreve a cor nas imagens geradas. Ela não é o mesmo que cor/raça, que deve ser sempre autodeclarada pelas pessoas.'));
      panel.classList.remove('hidden');
      chips.innerHTML = '';
      chips.appendChild(h('p', { class: 'q' }, step.patterns.q));
      shuffle(step.patterns.options.map((o, i) => Object.assign({ i }, o))).forEach((o) => {
        const c = h('button', { class: 'chip', 'data-i': o.i, 'aria-pressed': 'false' }, h('span', { class: 'box' }), o.t);
        c.addEventListener('click', () => { c.classList.toggle('on'); c.classList.remove('wrong'); c.setAttribute('aria-pressed', c.classList.contains('on')); if (c.classList.contains('on')) selected.add(o.i); else selected.delete(o.i); ctx.sfx('click'); ctx.setCheck(selected.size > 0); });
        chips.appendChild(c);
      });
      chips.classList.remove('hidden');
      phase = 'patterns';
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function check() {
      const opts = step.patterns.options;
      const wrong = [...selected].filter((i) => !opts[i].ok);
      const missing = opts.filter((o, i) => o.ok && !selected.has(i)).length;
      if (!wrong.length && !missing) return ctx.ok({});
      wrong.forEach((i) => chips.querySelector(`[data-i="${i}"]`).classList.add('wrong'));
      const msgs = wrong.map((i) => `<b>“${esc(opts[i].t)}”</b> — ${esc(opts[i].why)}`);
      if (missing) msgs.push(`Ainda falta marcar <b>${missing}</b> padrão(ões) que o painel confirma.`);
      ctx.fail({ msgs });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 2. ESCOLHA ÚNICA (com explicação) ============ */
  MECH.choice = function (step, ctx) {
    let sel = null;
    const opts = shuffle(step.options.map((o, i) => Object.assign({ i }, o)));
    const list = h('div', { class: 'options' });
    opts.forEach((o, k) => {
      const b = h('button', { class: 'option', 'data-i': o.i, role: 'radio', 'aria-checked': 'false' }, h('span', { class: 'opt-letter' }, 'ABCDE'[k]), h('span', { class: 'opt-t' }, o.t));
      b.addEventListener('click', () => {
        list.querySelectorAll('.option').forEach((x) => { x.classList.remove('on'); x.setAttribute('aria-checked', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-checked', 'true'); sel = o; ctx.sfx('click'); ctx.setCheck(true);
      });
      list.appendChild(b);
    });
    const el = h('div', { class: 'mech-choice' }, step.html ? h('div', { class: 'doc', html: step.html }) : null, h('p', { class: 'q big' }, step.q), list);
    function check() {
      if (!sel) return;
      if (sel.ok) return ctx.ok({ text: sel.why });
      list.querySelector(`[data-i="${sel.i}"]`).classList.add('wrong');
      ctx.fail({ msgs: [esc(sel.why)] });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 3. MÚLTIPLA SELEÇÃO ============ */
  MECH.multi = function (step, ctx) {
    const sel = new Set();
    const wrap = h('div', { class: 'chips big' });
    shuffle(step.options.map((o, i) => Object.assign({ i }, o))).forEach((o) => {
      const c = h('button', { class: 'chip', 'data-i': o.i, 'aria-pressed': 'false' }, h('span', { class: 'box' }), o.t);
      c.addEventListener('click', () => {
        c.classList.toggle('on'); c.classList.remove('wrong'); c.setAttribute('aria-pressed', c.classList.contains('on'));
        if (c.classList.contains('on')) sel.add(o.i); else sel.delete(o.i);
        ctx.sfx('click'); ctx.setCheck(step.exact ? sel.size === step.exact : sel.size > 0);
      });
      wrap.appendChild(c);
    });
    const el = h('div', { class: 'mech-multi' }, step.html ? h('div', { class: 'doc', html: step.html }) : null, h('p', { class: 'q big' }, step.q),
      step.exact ? h('p', { class: 'small muted' }, `Escolha exatamente ${step.exact}.`) : null, wrap);
    function check() {
      const wrong = [...sel].filter((i) => !step.options[i].ok);
      const missing = step.options.filter((o, i) => o.ok && !sel.has(i)).length;
      if (!wrong.length && !missing) return ctx.ok({});
      wrong.forEach((i) => wrap.querySelector(`[data-i="${i}"]`).classList.add('wrong'));
      const msgs = wrong.map((i) => `<b>“${esc(step.options[i].t)}”</b> — ${esc(step.options[i].why || 'Essa opção não se apoia nas evidências.')}`);
      if (missing && !step.exact) msgs.push(`Ainda ${missing === 1 ? 'falta' : 'faltam'} <b>${missing}</b> resposta(s) correta(s) para marcar.`);
      ctx.fail({ msgs });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 4. CLASSIFICAR CARTÕES EM CATEGORIAS ============ */
  MECH.sort = function (step, ctx) {
    const place = {}; // cardId -> binId
    const pool = h('div', { class: 'sort-pool', 'data-zone': 'pool' });
    const bins = step.bins.map((b) => h('div', { class: 'sort-bin ' + (b.cls || ''), 'data-zone': b.id },
      h('div', { class: 'bin-head' }, icon(b.icon), ' ', b.label), h('div', { class: 'bin-body' })));
    const cards = {};
    shuffle(step.cards).forEach((c) => {
      const el = h('div', { class: 'scard', 'data-id': c.id },
        c.people ? h('div', { class: 'sc-people' }, c.people.map((s) => h('div', { class: 'sc-face', html: person(s) })))
          : h('div', { class: 'sc-people sc-icon' }, icon(c.icon || 'alert'), h('span', null, 'Imagens omitidas')),
        h('div', { class: 'sc-text' }, h('div', { class: 'sc-req' }, 'Pedido: “' + c.req + '”'), h('div', { class: 'sc-res' }, c.res)));
      cards[c.id] = el;
      pool.appendChild(el);
      makeDraggable(el, { data: c.id, zones: '.sort-bin, .sort-pool', onDrop: (z, id) => move(id, z) });
    });
    [pool, ...bins].forEach(makeDropZone);
    function move(id, zone) {
      const zid = zone.getAttribute('data-zone');
      const target = zid === 'pool' ? pool : zone.querySelector('.bin-body');
      cards[id].classList.remove('wrong');
      target.appendChild(cards[id]);
      if (zid === 'pool') delete place[id]; else place[id] = zid;
      ctx.sfx('drop');
      ctx.setCheck(Object.keys(place).length === step.cards.length);
    }
    const el = h('div', { class: 'mech-sort' }, h('div', { class: 'bins' }, bins), h('div', { class: 'pool-label' }, 'Resultados para classificar'), pool,
      step.footer ? h('p', { class: 'note' }, step.footer) : null);
    function check() {
      const wrong = step.cards.filter((c) => place[c.id] !== c.bin);
      if (!wrong.length) return ctx.ok({ html: `<p>${esc(step.success || '')}</p><p class="highlight-msg">${icon('sparkles')} Qualquer pessoa pode exercer qualquer profissão, independentemente de raça, gênero, idade, deficiência ou origem social.</p>` });
      const lvl = feedbackLevel(ctx);
      if (lvl === 1) return ctx.fail({ msgs: [`<b>${wrong.length}</b> cartão(ões) estão na categoria errada.`, 'Para cada cartão, pergunte: o resultado mostra só UM tipo de pessoa para aquela profissão? Isso limita quem “pode” exercê-la?'] });
      wrong.forEach((c) => cards[c.id].classList.add('wrong'));
      ctx.fail({ msgs: wrong.slice(0, 3).map((c) => `<b>“${esc(c.req)}”</b> — ${esc(c.why)}`).concat(wrong.length > 3 ? [`…e mais ${wrong.length - 3}. Os cartões marcados em vermelho precisam ser revistos.`] : ['Os cartões marcados em vermelho precisam ser revistos.']) });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 5. QUADRO DE HIPÓTESES + EVIDÊNCIAS ============ */
  MECH.hypothesis = function (step, ctx) {
    let phase = 1;
    const sel = new Set();
    const links = {}; // hypId -> evId
    const evWrap = h('div', { class: 'ev-row' });
    step.evidence.forEach((e) => {
      const card = h('div', { class: 'ev-card', 'data-ev': e.id }, h('div', { class: 'ev-pin' }), h('div', { class: 'ev-icon' }, icon(e.icon)), h('div', null, h('b', null, e.title), h('p', null, e.text)));
      evWrap.appendChild(card);
    });
    const hypWrap = h('div', { class: 'hyp-grid' });
    const hyps = {};
    shuffle(step.hypotheses).forEach((hy) => {
      const slot = h('div', { class: 'hyp-slot hidden', 'data-h': hy.id }, h('span', { class: 'muted' }, 'Solte aqui a evidência'));
      const card = h('div', { class: 'hyp-card', 'data-h': hy.id }, h('div', { class: 'hyp-t' }, h('span', { class: 'box' }), hy.t), slot);
      card.addEventListener('click', (e) => {
        if (phase !== 1) return;
        card.classList.toggle('on'); card.classList.remove('wrong');
        if (card.classList.contains('on')) sel.add(hy.id); else sel.delete(hy.id);
        ctx.sfx('click'); ctx.setCheck(sel.size > 0);
      });
      hyps[hy.id] = { card, slot, data: hy };
      hypWrap.appendChild(card);
    });
    const phaseLabel = h('div', { class: 'phase-label' }, h('span', { class: 'phase-n' }, 'Fase 1'), ' Selecione as hipóteses mais adequadas.');
    const el = h('div', { class: 'mech-hyp' }, h('div', { class: 'board-title' }, icon('folder'), ' Evidências na mesa'), evWrap, phaseLabel, hypWrap);

    function startPhase2() {
      phase = 2;
      phaseLabel.innerHTML = '<span class="phase-n">Fase 2</span> Arraste cada evidência (ou toque nela e depois na hipótese) para a hipótese que ela comprova.';
      Object.values(hyps).forEach(({ card, slot, data }) => {
        if (!sel.has(data.id)) card.classList.add('dim'); else { slot.classList.remove('hidden'); makeDropZone(slot); card.classList.add('locked'); }
      });
      evWrap.querySelectorAll('.ev-card').forEach((c) => {
        c.classList.add('pinnable');
        makeDraggable(c, { data: c.getAttribute('data-ev'), zones: '.hyp-slot:not(.hidden)', onDrop: (z, ev) => link(z.getAttribute('data-h'), ev) });
      });
      ctx.setCheck(false);
    }
    function link(hid, ev) {
      Object.keys(links).forEach((k) => { if (links[k] === ev) { delete links[k]; render(k); } });
      links[hid] = ev; render(hid); ctx.sfx('drop');
      ctx.setCheck(Object.keys(links).length === sel.size);
    }
    function render(hid) {
      const { slot } = hyps[hid];
      slot.classList.remove('wrong');
      const ev = step.evidence.find((e) => e.id === links[hid]);
      slot.innerHTML = ev ? `<span class="linked">${icon('link')} ${esc(ev.title)}</span>` : '<span class="muted">Solte aqui a evidência</span>';
    }
    function check() {
      if (phase === 1) {
        const wrong = [...sel].filter((id) => !hyps[id].data.ok);
        const missing = step.hypotheses.filter((x) => x.ok && !sel.has(x.id)).length;
        if (!wrong.length && !missing) { ctx.sfx('success'); ctx.toast('Hipóteses corretas! Agora conecte as evidências.'); startPhase2(); return; }
        wrong.forEach((id) => hyps[id].card.classList.add('wrong'));
        const msgs = wrong.map((id) => `<b>“${esc(hyps[id].data.t)}”</b> — ${esc(hyps[id].data.why)}`);
        if (missing) msgs.push(`Ainda ${missing === 1 ? 'falta' : 'faltam'} <b>${missing}</b> hipótese(s) adequada(s).`);
        return ctx.fail({ msgs });
      }
      const wrongL = [...sel].filter((id) => links[id] !== hyps[id].data.ev);
      if (!wrongL.length) {
        const html = '<ul class="explain">' + step.hypotheses.map((x) => `<li class="${x.ok ? 'ok' : 'no'}">${x.ok ? '✔' : '✖'} <b>${esc(x.t)}</b><br>${esc(x.why)}</li>`).join('') + '</ul>';
        return ctx.ok({ html });
      }
      if (feedbackLevel(ctx) > 1) wrongL.forEach((id) => hyps[id].slot.classList.add('wrong'));
      ctx.fail({ msgs: [`<b>${wrongL.length}</b> conexão(ões) não combinam.`, 'Leia de novo cada evidência: ela fala de dados, de uma decisão da equipe ou da história?'] });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 6. MONTAR BASE DE DADOS (arrastar para espaços) ============ */
  MECH.builder = function (step, ctx) {
    const inBase = new Array(step.slots).fill(null);
    const cards = {};
    const pool = h('div', { class: 'b-pool', 'data-zone': 'pool' });
    const slotsWrap = h('div', { class: 'b-slots' });
    const slots = [];
    for (let i = 0; i < step.slots; i++) {
      const s = h('div', { class: 'b-slot', 'data-slot': i }, h('span', { class: 'slot-n' }, i + 1));
      slots.push(s); slotsWrap.appendChild(s); makeDropZone(s);
    }
    makeDropZone(pool);
    shuffle(step.pool).forEach((p) => {
      const c = profileCard(p);
      c.classList.add('mini');
      cards[p.id] = c; pool.appendChild(c);
      makeDraggable(c, { data: p.id, zones: '.b-slot, .b-pool', onDrop: (z, id) => drop(z, id) });
    });
    const meters = h('div', { class: 'meters' });
    const countEl = h('div', { class: 'b-count' });
    function drop(z, id) {
      const from = inBase.indexOf(id);
      if (z.classList.contains('b-pool')) { if (from >= 0) inBase[from] = null; }
      else {
        const to = +z.getAttribute('data-slot');
        const occupant = inBase[to];
        if (from >= 0) inBase[from] = occupant; else if (occupant) { /* volta para o pool */ }
        inBase[to] = id;
      }
      ctx.sfx('drop'); render();
    }
    function render() {
      step.pool.forEach((p) => { if (!inBase.includes(p.id) && cards[p.id].parentElement !== pool) pool.appendChild(cards[p.id]); });
      inBase.forEach((id, i) => {
        const s = slots[i];
        const cur = s.querySelector('.pcard');
        if (id && cur !== cards[id]) { if (cur) pool.appendChild(cur); s.appendChild(cards[id]); }
        if (!id && cur) pool.appendChild(cur);
        s.classList.toggle('filled', !!id);
      });
      // reordena o pool na ordem original embaralhada
      const list = selectedList();
      countEl.innerHTML = `${icon('db')} Base: <b>${list.length}</b> / ${step.slots} exemplos`;
      meters.innerHTML = '';
      step.criteria.forEach((c) => {
        const r = evalCriterion(list, c);
        meters.appendChild(h('div', { class: 'meter ' + (list.length && r.ok ? 'ok' : 'no') },
          h('div', { class: 'm-head' }, h('span', { class: 'm-ico' }, icon(list.length && r.ok ? 'check' : 'alert')), h('b', null, c.label), h('span', { class: 'm-detail' }, list.length ? r.detail : '—')),
          r.counts && list.length ? stackBar(r.counts, list.length) : h('div', { class: 'stack empty' }),
          h('div', { class: 'm-help' }, c.help)));
      });
      ctx.setCheck(list.length === step.slots);
    }
    function selectedList() { return inBase.filter(Boolean).map((id) => step.pool.find((p) => p.id === id)); }
    const el = h('div', { class: 'mech-builder' },
      h('div', { class: 'b-left' }, h('div', { class: 'pane-title' }, icon('users'), ' Exemplos disponíveis (20)'), pool),
      h('div', { class: 'b-right' }, h('div', { class: 'pane-title' }, icon('db'), ' Nova base “Profissões”'), countEl, slotsWrap, h('div', { class: 'pane-title' }, icon('chart'), ' Medidores de diversidade'), meters));
    function check() {
      const list = selectedList();
      const bad = list.filter((p) => p.issue);
      const unmet = step.criteria.filter((c) => !evalCriterion(list, c).ok);
      if (!bad.length && !unmet.length) return ctx.ok({ text: 'Base aprovada! Ela é diversa e todos os exemplos têm boa qualidade.' });
      const msgs = [];
      bad.forEach((p) => msgs.push(`<b>${esc(p.name)}</b> — ${esc(p.issue)} Exemplos com problemas de qualidade ou rótulos errados ensinam coisas erradas à IA.`));
      unmet.forEach((c) => msgs.push(`<b>${esc(c.label)}</b>: ${esc(c.help)}`));
      if (feedbackLevel(ctx) > 1) bad.forEach((p) => cards[p.id].classList.add('wrong'));
      ctx.fail({ msgs });
    }
    render();
    return { el, check };
  };

  /* ============ 7. COMPARAR CONJUNTOS DE DADOS ============ */
  MECH.compare = function (step, ctx) {
    const assign = {}; // baseId -> labelId
    const labelsWrap = h('div', { class: 'labels-pool', 'data-zone': 'pool' });
    const chips = {};
    step.labels.forEach((l) => {
      const c = h('div', { class: 'label-chip', 'data-l': l.id }, icon('tag'), ' ', l.t);
      chips[l.id] = c; labelsWrap.appendChild(c);
      makeDraggable(c, { data: l.id, zones: '.base-drop, .labels-pool', onDrop: (z, lid) => put(z, lid) });
    });
    makeDropZone(labelsWrap);
    const panels = {};
    const basesWrap = h('div', { class: 'bases' });
    step.bases.forEach((b) => {
      const drop = h('div', { class: 'base-drop', 'data-b': b.id }, h('span', { class: 'muted' }, 'Solte a etiqueta aqui'));
      makeDropZone(drop);
      const comp = h('div', { class: 'base-comp' }, b.comp.map(([dim, parts]) => {
        const counts = {}; parts.forEach(([k, v]) => { counts[k] = v; });
        return h('div', { class: 'bc-dim' }, h('div', { class: 'bc-label' }, dim), stackBar(counts, 100), stackLegend(counts, 100));
      }));
      const panel = h('div', { class: 'base-panel', 'data-b': b.id },
        h('div', { class: 'bp-head' }, icon('db'), h('b', null, b.name), h('span', { class: 'muted' }, '1.000 imagens')),
        h('div', { class: 'bp-samples' }, b.samples.map((s) => h('div', { class: 'bp-face', html: person(s) }))),
        comp,
        h('div', { class: 'bp-ficha' }, h('div', { class: 'bc-label' }, 'Ficha técnica'), h('ul', null, b.ficha.map((f) => h('li', { class: f.startsWith('⚠') ? 'warn' : '' }, f)))),
        drop);
      panels[b.id] = { panel, drop };
      basesWrap.appendChild(panel);
    });
    function put(z, lid) {
      Object.keys(assign).forEach((k) => { if (assign[k] === lid) delete assign[k]; });
      if (z.classList.contains('base-drop')) {
        const bid = z.getAttribute('data-b');
        if (assign[bid]) labelsWrap.appendChild(chips[assign[bid]]);
        assign[bid] = lid; z.innerHTML = ''; z.appendChild(chips[lid]); z.classList.remove('wrong');
      } else labelsWrap.appendChild(chips[lid]);
      step.bases.forEach((b) => { const d = panels[b.id].drop; if (!assign[b.id] && !d.querySelector('.label-chip')) d.innerHTML = '<span class="muted">Solte a etiqueta aqui</span>'; });
      ctx.sfx('drop'); ctx.setCheck(Object.keys(assign).length === step.bases.length);
    }
    const el = h('div', { class: 'mech-compare' }, h('div', { class: 'pane-title' }, icon('tag'), ' Etiquetas'), labelsWrap, basesWrap);
    function check() {
      const wrong = step.bases.filter((b) => assign[b.id] !== b.answer);
      if (!wrong.length) return ctx.ok({});
      const lvl = feedbackLevel(ctx);
      if (lvl === 1) return ctx.fail({ msgs: [`<b>${wrong.length}</b> base(s) com a etiqueta errada.`, 'Olhe os gráficos E a ficha técnica de cada base. Números equilibrados são suficientes?'] });
      const tip = { low: 'veja os gráficos: um único grupo domina a base.', mid: 'os números são equilibrados, mas leia os alertas ⚠ da ficha técnica.', best: 'números equilibrados e ficha técnica sem alertas, com consentimento e cor/raça autodeclarada.' };
      wrong.forEach((b) => panels[b.id].drop.classList.add('wrong'));
      ctx.fail({ msgs: wrong.map((b) => `<b>${esc(b.name)}</b>: ${tip[b.answer]}`) });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 8. AMPLIAR BASE COM ORÇAMENTO (antes/depois) ============ */
  MECH.expand = function (step, ctx) {
    const added = new Set();
    const goalsEl = h('div', { class: 'goals' });
    const before = h('div', { class: 'ba-panel' });
    const after = h('div', { class: 'ba-panel after' });
    const budgetEl = h('div', { class: 'budget' });
    const cat = h('div', { class: 'catalog' });
    step.candidates.forEach((c) => {
      const card = h('button', { class: 'cand' + (c.blur ? ' blurred' : ''), 'data-id': c.id, 'aria-pressed': 'false' },
        h('div', { class: 'cand-img', html: person(c.spec) }),
        h('div', { class: 'cand-b' }, h('b', null, 'Rótulo: ' + c.name), h('div', { class: 'pc-tags' }, h('span', null, c.genero), h('span', null, c.raca), h('span', null, c.idade), c.def ? h('span', { class: 'def' }, '♿ ' + c.def) : null),
          h('div', { class: 'pc-q ' + (c.issue ? 'bad' : 'good') }, c.issue ? '⚠ ' + c.issue : '✓ Qualidade: boa')),
        h('span', { class: 'cand-add' }, icon('plus')));
      card.addEventListener('click', () => {
        if (added.has(c.id)) { added.delete(c.id); card.classList.remove('on'); card.setAttribute('aria-pressed', 'false'); ctx.sfx('click'); }
        else {
          if (added.size >= step.budget) { ctx.toast(`Orçamento esgotado: no máximo ${step.budget} novos exemplos. Remova um para trocar.`); ctx.sfx('error'); return; }
          added.add(c.id); card.classList.add('on'); card.setAttribute('aria-pressed', 'true'); ctx.sfx('drop');
        }
        card.classList.remove('wrong'); render();
      });
      cat.appendChild(card);
    });
    function list() { return step.base.concat(step.candidates.filter((c) => added.has(c.id))); }
    function panelHTML(target, lst, title) {
      target.innerHTML = '';
      target.appendChild(h('div', { class: 'ba-title' }, title, h('span', { class: 'muted' }, ` · ${lst.length} exemplos`)));
      [['genero', 'Gênero'], ['raca', 'Cor/raça'], ['idade', 'Idade']].forEach(([d, lab]) => {
        const counts = countBy(lst, d);
        target.appendChild(h('div', { class: 'bc-dim' }, h('div', { class: 'bc-label' }, lab), stackBar(counts, lst.length), stackLegend(counts, lst.length)));
      });
      const nd = lst.filter((x) => x.def).length;
      target.appendChild(h('div', { class: 'bc-label' }, `Pessoas com deficiência: ${nd}`));
    }
    function render() {
      panelHTML(after, list(), 'DEPOIS');
      budgetEl.innerHTML = `${icon('plus')} Novos exemplos: <b>${added.size}</b> / ${step.budget}`;
      goalsEl.innerHTML = '';
      step.goals.forEach((g) => {
        const r = evalCriterion(list(), g);
        goalsEl.appendChild(h('div', { class: 'goal ' + (r.ok ? 'ok' : 'no') }, icon(r.ok ? 'check' : 'x'), ' ', g.label));
      });
      ctx.setCheck(added.size > 0);
    }
    panelHTML(before, step.base, 'ANTES');
    const el = h('div', { class: 'mech-expand' },
      h('div', { class: 'ex-top' }, h('div', null, h('div', { class: 'pane-title' }, icon('flag'), ' Metas da base revisada'), goalsEl), h('div', { class: 'ba' }, before, h('div', { class: 'ba-arrow' }, icon('arrowR')), after)),
      h('div', { class: 'pane-title' }, icon('users'), ' Catálogo de novos exemplos ', budgetEl), cat);
    function check() {
      const lst = list();
      const bad = step.candidates.filter((c) => added.has(c.id) && c.issue);
      const unmet = step.goals.filter((g) => !evalCriterion(lst, g).ok && !g.noIssue);
      if (!bad.length && !unmet.length) return ctx.ok({ html: `<p>Metas cumpridas! Compare os gráficos ANTES e DEPOIS: a base ficou muito mais representativa.</p><p class="highlight-msg">${icon('alert')} Atenção: diversidade nos dados melhora a IA, mas sozinha não elimina todos os vieses.</p>` });
      const msgs = bad.map((c) => `<b>${esc(c.name)}</b> — ${esc(c.issue)} Esse exemplo atrapalharia o aprendizado.`);
      unmet.forEach((g) => msgs.push(`Meta não cumprida: <b>${esc(g.label)}</b>.`));
      if (feedbackLevel(ctx) > 1) bad.forEach((c) => cat.querySelector(`[data-id="${c.id}"]`).classList.add('wrong'));
      ctx.fail({ msgs });
    }
    render();
    return { el, check };
  };

  /* ============ 9. DOSSIÊ DE EVIDÊNCIAS ============ */
  MECH.evidence = function (step, ctx) {
    const opened = new Set();
    const notebook = h('ol', { class: 'notebook-list' });
    const grid = h('div', { class: 'files' });
    ctx.registerDossier(step.files);
    step.files.forEach((f, i) => {
      const b = h('button', { class: 'file-card kind-' + f.kind, 'data-f': f.id },
        h('div', { class: 'fc-tab' }, 'ARQ-' + String(i + 1).padStart(2, '0')), h('div', { class: 'fc-ico' }, icon(f.icon)), h('div', { class: 'fc-title' }, f.title), h('div', { class: 'fc-status' }, 'Não lido'));
      b.addEventListener('click', () => openFile(f, b));
      grid.appendChild(b);
    });
    function openFile(f, b) {
      ctx.sfx('whoosh');
      UI.modal({
        title: f.title, cls: 'file-modal', icon: f.icon,
        html: `<div class="file-body">${f.html}</div><div class="clue-box">${icon('search')} <b>Pista:</b> ${esc(f.clue)}</div>`,
        buttons: [{ label: opened.has(f.id) ? 'Fechar' : 'Registrar pista no caderno', primary: true }],
        onClose: () => {
          if (!opened.has(f.id)) {
            opened.add(f.id); b.classList.add('read'); b.querySelector('.fc-status').textContent = '✔ Pista registrada';
            notebook.appendChild(h('li', { class: 'new' }, f.clue)); ctx.addClue(f.clue); ctx.sfx('xp');
            prog.innerHTML = `${opened.size} / ${step.files.length} arquivos analisados`;
            if (opened.size === step.files.length) { ctx.setCheck(true, 'Concluir análise'); ctx.award('explorador'); }
          }
        }
      });
    }
    const prog = h('div', { class: 'ev-prog' }, `0 / ${step.files.length} arquivos analisados`);
    const el = h('div', { class: 'mech-evidence' },
      h('div', { class: 'ev-main' }, h('div', { class: 'pane-title' }, icon('folder'), ' Arquivos do caso ', prog), grid, h('p', { class: 'small muted' }, window.GAME.simNote)),
      h('div', { class: 'notebook' }, h('div', { class: 'nb-title' }, icon('book'), ' Caderno de investigação'), notebook, h('div', { class: 'nb-empty muted small' }, 'As pistas aparecem aqui.')));
    function check() { if (opened.size === step.files.length) ctx.ok({}); }
    ctx.setCheck(false, 'Concluir análise');
    return { el, check };
  };

  /* ============ 10. ORGANIZAR SEQUÊNCIA ============ */
  MECH.sequence = function (step, ctx) {
    let order = shuffle(step.items.map((x) => x.id));
    if (order.join() === step.items.map((x) => x.id).join()) order = order.slice().reverse();
    const locked = new Set();
    const list = h('ol', { class: 'seq' });
    function render() {
      list.innerHTML = '';
      order.forEach((id, i) => {
        const it = step.items.find((x) => x.id === id);
        const li = h('li', { class: 'seq-item' + (locked.has(id) ? ' locked' : ''), 'data-id': id },
          h('span', { class: 'seq-n' }, i + 1), h('span', { class: 'seq-grip', 'aria-hidden': 'true' }, '⠿'), h('span', { class: 'seq-t' }, it.t),
          h('span', { class: 'seq-btns' },
            h('button', { class: 'icon-btn', 'aria-label': 'Subir', disabled: i === 0 || locked.has(id), onclick: (e) => { e.stopPropagation(); mv(i, i - 1); } }, '▲'),
            h('button', { class: 'icon-btn', 'aria-label': 'Descer', disabled: i === order.length - 1 || locked.has(id), onclick: (e) => { e.stopPropagation(); mv(i, i + 1); } }, '▼')));
        list.appendChild(li);
        makeDropZone(li);
        if (!locked.has(id)) makeDraggable(li, { data: id, zones: '.seq-item', onDrop: (z, did) => { const to = order.indexOf(z.getAttribute('data-id')); const from = order.indexOf(did); if (from !== to && !locked.has(order[to])) mv(from, to); } });
      });
    }
    function mv(from, to) {
      if (to < 0 || to >= order.length || locked.has(order[to])) return;
      const [x] = order.splice(from, 1); order.splice(to, 0, x); ctx.sfx('drop'); render();
    }
    const el = h('div', { class: 'mech-seq' }, h('p', { class: 'q big' }, step.q), h('p', { class: 'small muted' }, 'Arraste os itens ou use as setas ▲▼ para mudar a ordem.'), list);
    function check() {
      const right = step.items.map((x) => x.id);
      const correct = order.filter((id, i) => right[i] === id).length;
      if (correct === order.length) return ctx.ok({});
      const lvl = feedbackLevel(ctx);
      if (lvl >= 2) { order.forEach((id, i) => { if (right[i] === id) locked.add(id); }); render(); }
      ctx.fail({ msgs: [`<b>${correct}</b> de ${order.length} etapas estão na posição certa.` + (lvl >= 2 ? ' As etapas certas foram travadas em verde.' : ''), 'Pense: o que precisa acontecer ANTES para que a próxima etapa seja possível?'] });
    }
    render();
    ctx.setCheck(true);
    return { el, check };
  };

  /* ============ 11. MARCA-TEXTO EM DOCUMENTOS ============ */
  MECH.highlight = function (step, ctx) {
    const marked = new Set();
    const docs = h('div', { class: 'docs' });
    step.docs.forEach((d) => {
      docs.appendChild(h('div', { class: 'cv' },
        h('div', { class: 'cv-head' }, h('div', { class: 'cv-photo', html: person(d.spec) }), h('div', null, h('div', { class: 'cv-title' }, d.title), h('div', { class: 'cv-score ' + (d.score >= 70 ? 'hi' : 'lo') }, 'Nota da IA: ', h('b', null, d.score), '/100'))),
        d.fields.map((f) => {
          const row = h('button', { class: 'cv-field', 'data-f': f.id, 'aria-pressed': 'false' }, h('span', { class: 'cv-l' }, f.label), h('span', { class: 'cv-v' }, f.value));
          row.addEventListener('click', () => toggle(f.id));
          return row;
        })));
    });
    function toggle(id) {
      if (marked.has(id)) marked.delete(id); else marked.add(id);
      docs.querySelectorAll(`[data-f="${id}"]`).forEach((r) => { r.classList.toggle('on', marked.has(id)); r.classList.remove('wrong'); r.setAttribute('aria-pressed', marked.has(id)); });
      ctx.sfx('click'); ctx.setCheck(marked.size > 0);
    }
    const el = h('div', { class: 'mech-highlight' }, h('p', { class: 'small muted' }, icon('hand'), ' Toque em um campo para marcá-lo com o marca-texto (ele é marcado nos dois currículos).'), docs);
    function check() {
      const wrong = [...marked].filter((id) => !step.answer.includes(id));
      const missing = step.answer.filter((id) => !marked.has(id)).length;
      if (!wrong.length && !missing) return ctx.ok({});
      wrong.forEach((id) => docs.querySelectorAll(`[data-f="${id}"]`).forEach((r) => r.classList.add('wrong')));
      const msgs = wrong.map((id) => esc(step.why[id] || 'Esse campo é igual nos dois currículos.'));
      if (missing) msgs.push(`Ainda ${missing === 1 ? 'falta' : 'faltam'} <b>${missing}</b> campo(s) diferente(s) para marcar.`);
      ctx.fail({ msgs });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 12. ENCONTRAR PARES (perfis gêmeos) ============ */
  MECH.pairs = function (step, ctx) {
    const COLORS = ['#22d3ee', '#f472b6', '#facc15', '#34d399', '#a78bfa', '#fb923c'];
    let pairs = []; // [[a,b]]
    const locked = new Set();
    let pending = null;
    const cards = {};
    const grid = h('div', { class: 'pairs-grid' });
    shuffle(step.profiles).forEach((p) => {
      const c = h('button', { class: 'prof', 'data-id': p.id },
        h('div', { class: 'prof-top' }, h('div', { class: 'prof-img', html: person(p.spec) }), h('div', null, h('b', null, p.name), h('div', { class: 'small muted' }, p.info))),
        h('table', { class: 'notas' }, h('tr', null, h('th', null, 'Mat'), h('th', null, 'Port'), h('th', null, 'Ciên')), h('tr', null, p.notas.map((n) => h('td', null, String(n).replace('.', ','))))),
        h('div', { class: 'prof-int' }, h('span', { class: 'muted' }, 'Interesses: '), p.interesses),
        h('div', { class: 'prof-rec' }, icon('cpu'), ' IA recomenda: ', h('b', null, p.rec)),
        h('span', { class: 'pair-badge' }));
      c.addEventListener('click', () => tap(p.id));
      cards[p.id] = c; grid.appendChild(c);
    });
    const status = h('div', { class: 'pairs-status' });
    function pairOf(id) { return pairs.findIndex((pr) => pr.includes(id)); }
    function tap(id) {
      if (locked.has(id)) return;
      const pi = pairOf(id);
      if (pi >= 0) { pairs.splice(pi, 1); ctx.sfx('click'); render(); return; }
      if (pending === id) { pending = null; render(); return; }
      if (pending) { pairs.push([pending, id]); pending = null; ctx.sfx('drop'); }
      else { pending = id; ctx.sfx('select'); }
      render();
    }
    function render() {
      Object.keys(cards).forEach((id) => {
        const c = cards[id], pi = pairOf(id), b = c.querySelector('.pair-badge');
        c.classList.toggle('pending', pending === id);
        c.classList.toggle('paired', pi >= 0);
        c.classList.toggle('locked', locked.has(id));
        c.classList.remove('wrong');
        c.style.setProperty('--pc', pi >= 0 ? COLORS[pi % COLORS.length] : 'transparent');
        b.textContent = pi >= 0 ? 'Par ' + (pi + 1) : '';
      });
      status.innerHTML = `${icon('link')} Pares formados: <b>${pairs.length}</b> / ${step.pairs.length}`;
      ctx.setCheck(pairs.length === step.pairs.length);
    }
    const isRight = (pr) => step.pairs.some((sp) => sp.includes(pr[0]) && sp.includes(pr[1]));
    const el = h('div', { class: 'mech-pairs' }, status, grid);
    function check() {
      const right = pairs.filter(isRight);
      if (right.length === step.pairs.length) return ctx.ok({});
      const lvl = feedbackLevel(ctx);
      if (lvl >= 2) {
        right.forEach((pr) => pr.forEach((id) => locked.add(id)));
        pairs = pairs.filter((pr) => isRight(pr));
        render();
      }
      ctx.fail({ msgs: [`<b>${right.length}</b> de ${step.pairs.length} pares estão corretos.` + (lvl >= 2 ? ' Os pares corretos foram travados; refaça os outros.' : ''), 'Gêmeos têm exatamente as mesmas notas e os mesmos interesses. Compare número por número.'] });
    }
    render();
    return { el, check };
  };

  /* ============ 13. CORRIGIR DADOS (arrastar ferramentas para linhas) ============ */
  MECH.datafix = function (step, ctx) {
    const assign = {};
    const palette = h('div', { class: 'tools' });
    step.tools.forEach((t) => {
      const c = h('div', { class: 'tool-chip tool-' + t.id, 'data-t': t.id }, icon(t.icon), ' ', t.label);
      palette.appendChild(c);
      makeDraggable(c, { data: t.id, zones: '.df-slot', onDrop: (z, tid) => set(z.getAttribute('data-r'), tid) });
    });
    const rowsEl = h('div', { class: 'df-rows' });
    const slots = {};
    step.rows.forEach((r, i) => {
      const slot = h('div', { class: 'df-slot', 'data-r': r.id }, h('span', { class: 'muted' }, 'Solte uma ferramenta'));
      makeDropZone(slot); slots[r.id] = slot;
      rowsEl.appendChild(h('div', { class: 'df-row', 'data-r': r.id },
        h('span', { class: 'df-n' }, '#' + String(i + 1).padStart(2, '0')),
        r.spec ? h('div', { class: 'df-img' + (r.blur ? ' blurred' : ''), html: person(r.spec) }) : h('div', { class: 'df-img df-ico' }, icon(r.icon || 'db')),
        h('div', { class: 'df-text' }, r.text), slot));
    });
    function set(rid, tid) {
      assign[rid] = tid;
      const t = step.tools.find((x) => x.id === tid);
      slots[rid].innerHTML = ''; slots[rid].classList.remove('wrong');
      slots[rid].appendChild(h('span', { class: 'tool-chip small tool-' + tid }, icon(t.icon), ' ', t.label));
      slots[rid].classList.add('set');
      ctx.sfx('drop'); ctx.setCheck(Object.keys(assign).length === step.rows.length);
    }
    const el = h('div', { class: 'mech-datafix' }, h('div', { class: 'pane-title' }, icon('wrench'), ' Ferramentas'), palette, rowsEl);
    function check() {
      const wrong = step.rows.filter((r) => assign[r.id] !== r.tool);
      if (!wrong.length) return ctx.ok({});
      const lvl = feedbackLevel(ctx);
      if (lvl === 1) return ctx.fail({ msgs: [`<b>${wrong.length}</b> linha(s) com a ação errada.`, 'Para cada linha, pergunte: o problema é o rótulo, a falta de exemplos, uma cópia repetida, a qualidade da imagem — ou não há problema?'] });
      wrong.forEach((r) => slots[r.id].classList.add('wrong'));
      ctx.fail({ msgs: wrong.slice(0, 3).map((r) => `<b>${esc(r.text)}</b> — ${esc(r.why)}`) });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 14. EDITOR DE REGRAS DO ALGORITMO ============ */
  MECH.rules = function (step, ctx) {
    const st = {}; // id -> { flagged, choice }
    const wrap = h('div', { class: 'rules' });
    const items = {};
    step.rules.forEach((r, i) => {
      st[r.id] = { flagged: false, choice: null };
      const opts = h('div', { class: 'rule-opts hidden' }, h('div', { class: 'ro-title' }, icon('refresh'), ' Substituir por:'));
      (r.options || [{ t: 'Remover esta regra.', ok: false, why: r.why }]).forEach((o, k) => {
        const b = h('button', { class: 'ro', 'data-k': k }, h('span', { class: 'radio' }), o.t);
        b.addEventListener('click', () => { st[r.id].choice = k; opts.querySelectorAll('.ro').forEach((x) => x.classList.toggle('on', x === b)); b.classList.remove('wrong'); ctx.sfx('click'); upd(); });
        opts.appendChild(b);
      });
      const flag = h('button', { class: 'flag-btn', 'aria-pressed': 'false' }, icon('alert'), ' Problemática');
      flag.addEventListener('click', () => {
        st[r.id].flagged = !st[r.id].flagged; st[r.id].choice = null;
        flag.classList.toggle('on', st[r.id].flagged); flag.setAttribute('aria-pressed', st[r.id].flagged);
        item.classList.toggle('flagged', st[r.id].flagged); item.classList.remove('wrong');
        opts.classList.toggle('hidden', !st[r.id].flagged); opts.querySelectorAll('.ro').forEach((x) => x.classList.remove('on', 'wrong'));
        ctx.sfx('click'); upd();
      });
      const item = h('div', { class: 'rule', 'data-r': r.id }, h('div', { class: 'rule-line' }, h('span', { class: 'ln' }, String(i + 1).padStart(2, '0')), h('code', null, r.code), flag), opts);
      items[r.id] = item; wrap.appendChild(item);
    });
    function upd() {
      const flagged = Object.values(st).filter((x) => x.flagged);
      ctx.setCheck(flagged.length > 0 && flagged.every((x) => x.choice != null));
    }
    const el = h('div', { class: 'mech-rules' }, h('div', { class: 'code-head' }, h('span', { class: 'dot r' }), h('span', { class: 'dot y' }), h('span', { class: 'dot g' }), ' regras_de_pontuacao.alg'), wrap);
    function check() {
      const msgs = [];
      const flaggedGood = step.rules.filter((r) => !r.bad && st[r.id].flagged);
      const missedBad = step.rules.filter((r) => r.bad && !st[r.id].flagged);
      const badChoice = step.rules.filter((r) => r.bad && st[r.id].flagged && !r.options[st[r.id].choice].ok);
      if (!flaggedGood.length && !missedBad.length && !badChoice.length) {
        return ctx.ok({ html: '<ul class="explain">' + step.rules.map((r) => `<li class="${r.bad ? 'no' : 'ok'}">${r.bad ? '✎' : '✔'} <code>${esc(r.code)}</code><br>${esc(r.why)}</li>`).join('') + '</ul>' });
      }
      flaggedGood.forEach((r) => { items[r.id].classList.add('wrong'); msgs.push(`<code>${esc(r.code)}</code> — ${esc(r.why)}`); });
      badChoice.forEach((r) => { const o = r.options[st[r.id].choice]; items[r.id].querySelector(`.ro[data-k="${st[r.id].choice}"]`).classList.add('wrong'); msgs.push(`Substituição inadequada: <b>“${esc(o.t)}”</b> — ${esc(o.why)}`); });
      if (missedBad.length) msgs.push(`Ainda ${missedBad.length === 1 ? 'há' : 'há'} <b>${missedBad.length}</b> regra(s) problemática(s) sem correção.`);
      ctx.fail({ msgs });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 15. GRÁFICO (executar + tocar nas barras) ============ */
  MECH.chart = function (step, ctx) {
    const sel = new Set();
    const max = Math.max(100, ...step.data.flatMap((d) => d.v));
    const scale = step.data.every((d) => d.v.every((v) => v <= 20)) ? 20 : max;
    const chart = h('div', { class: 'chart' + (step.series.length > 1 ? ' two' : '') });
    const grid = h('div', { class: 'ch-grid' }, [0, 0.25, 0.5, 0.75, 1].map((f) => h('div', { class: 'gl', style: { bottom: (f * 100) + '%' } }, h('span', null, Math.round(scale * f) + '%'))));
    const bars = h('div', { class: 'ch-bars' });
    if (step.line) grid.appendChild(h('div', { class: 'gl ref', style: { bottom: (step.line / scale * 100) + '%' } }, h('span', null, step.line + '% (referência)')));
    step.data.forEach((d) => {
      const g = h('button', { class: 'ch-group' + (d.avg ? ' avg' : ''), 'data-l': d.label, disabled: true },
        h('div', { class: 'ch-cols' }, d.v.map((v, si) => h('div', { class: 'ch-col s' + si, 'data-h': v / scale * 100 }, h('span', { class: 'ch-val' }, v + '%')))),
        h('div', { class: 'ch-label' }, d.label));
      g.addEventListener('click', () => {
        if (step.multi) { if (sel.has(d.label)) sel.delete(d.label); else sel.add(d.label); }
        else { sel.clear(); sel.add(d.label); }
        bars.querySelectorAll('.ch-group').forEach((x) => { x.classList.toggle('on', sel.has(x.getAttribute('data-l'))); x.classList.remove('wrong'); });
        ctx.sfx('click'); ctx.setCheck(sel.size > 0);
      });
      bars.appendChild(g);
    });
    chart.appendChild(grid); chart.appendChild(bars);
    const legend = step.series.length > 1 ? h('div', { class: 'legend' }, step.series.map((s, i) => h('span', { class: 'lg' }, h('i', { class: 'sw s' + i }), s))) : null;
    const qEl = h('p', { class: 'q big hidden' }, step.q);
    const runBtn = step.run ? h('button', { class: 'btn btn-primary run-btn' }, icon('play'), ' ', step.run) : null;
    const proc = h('div', { class: 'proc hidden' }, h('div', { class: 'proc-bar' }), h('span', null, 'Processando currículos simulados…'));
    const el = h('div', { class: 'mech-chart' }, runBtn, proc, h('div', { class: 'chart-wrap' + (step.run ? ' hidden' : '') }, legend, chart), qEl);
    function reveal() {
      el.querySelector('.chart-wrap').classList.remove('hidden');
      requestAnimationFrame(() => setTimeout(() => {
        chart.querySelectorAll('.ch-col').forEach((c, i) => { c.style.transitionDelay = (i * 60) + 'ms'; c.style.height = c.getAttribute('data-h') + '%'; });
      }, 30));
      bars.querySelectorAll('.ch-group').forEach((g) => { g.disabled = false; });
      qEl.classList.remove('hidden');
    }
    if (runBtn) runBtn.addEventListener('click', async () => {
      runBtn.disabled = true; proc.classList.remove('hidden'); ctx.sfx('scan');
      await sleep(1500); proc.classList.add('hidden'); runBtn.classList.add('hidden'); ctx.sfx('unlock'); reveal();
    });
    else setTimeout(reveal, 50);
    function check() {
      const want = new Set(step.pick);
      const wrong = [...sel].filter((l) => !want.has(l));
      const missing = step.pick.filter((l) => !sel.has(l)).length;
      if (!wrong.length && !missing) return ctx.ok({});
      wrong.forEach((l) => bars.querySelector(`[data-l="${CSS.escape(l)}"]`).classList.add('wrong'));
      const msgs = wrong.map((l) => (step.why && step.why[l]) ? `<b>${esc(l)}</b> — ${esc(step.why[l])}` : `<b>${esc(l)}</b> não responde à pergunta. Compare a altura das barras.`);
      if (missing) msgs.push(`Ainda ${missing === 1 ? 'falta' : 'faltam'} <b>${missing}</b> grupo(s).`);
      ctx.fail({ msgs });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 16. RESPOSTA NUMÉRICA ============ */
  MECH.number = function (step, ctx) {
    const input = h('input', { type: 'text', inputmode: 'decimal', class: 'num-input', 'aria-label': 'Resposta', autocomplete: 'off', maxlength: 8 });
    input.addEventListener('input', () => { input.classList.remove('wrong'); ctx.setCheck(input.value.trim() !== ''); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) check(); });
    const el = h('div', { class: 'mech-number' }, step.html ? h('div', { class: 'doc', html: step.html }) : null, h('p', { class: 'q big' }, step.q),
      h('div', { class: 'num-row' }, input, h('span', { class: 'num-unit' }, step.unit || '')),
      h('div', { class: 'calc-tip small muted' }, icon('bulb'), ' Você pode usar papel ou a calculadora.'));
    function check() {
      const v = parseFloat(input.value.replace(',', '.').replace(/[^\d.\-]/g, ''));
      if (!isNaN(v) && Math.abs(v - step.answer) <= (step.tolerance || 0.01)) return ctx.ok({});
      input.classList.add('wrong');
      ctx.fail({ msgs: [isNaN(v) ? 'Digite um número.' : `<b>${esc(input.value)}</b> não é o resultado certo. Confira os números da pergunta e refaça a conta.`] });
    }
    ctx.setCheck(false);
    setTimeout(() => { try { input.focus({ preventScroll: true }); } catch (e) { /* */ } }, 300);
    return { el, check };
  };

  /* ============ 17. ESTEIRA DE TESTES (um caso por vez) ============ */
  MECH.conveyor = function (step, ctx) {
    let idx = 0, caseErr = 0;
    const stage = h('div', { class: 'conv-stage' });
    const track = h('div', { class: 'conv-track' }, step.cases.map((c, i) => h('span', { class: 'conv-dot', 'data-i': i })));
    const el = h('div', { class: 'mech-conveyor' }, track, stage);
    function render() {
      track.querySelectorAll('.conv-dot').forEach((d, i) => { d.classList.toggle('done', i < idx); d.classList.toggle('cur', i === idx); });
      if (idx >= step.cases.length) return;
      const c = step.cases[idx];
      let verdict = null; const tags = new Set();
      const tagWrap = h('div', { class: 'conv-tags hidden' }, h('p', { class: 'small' }, 'Que tipo de falha? (pode marcar mais de um)'),
        step.tags.map((t) => { const b = h('button', { class: 'chip sm', 'data-t': t.id }, h('span', { class: 'box' }), t.t); b.addEventListener('click', () => { b.classList.toggle('on'); if (b.classList.contains('on')) tags.add(t.id); else tags.delete(t.id); ctx.sfx('click'); confirm.disabled = !tags.size; }); return b; }));
      const okB = h('button', { class: 'verdict ok' }, icon('check'), ' Adequado');
      const failB = h('button', { class: 'verdict fail' }, icon('alert'), ' Falha de viés');
      const confirm = h('button', { class: 'btn btn-primary', disabled: true }, 'Confirmar análise');
      okB.addEventListener('click', () => { verdict = 'ok'; okB.classList.add('on'); failB.classList.remove('on'); tagWrap.classList.add('hidden'); confirm.disabled = false; ctx.sfx('click'); });
      failB.addEventListener('click', () => { verdict = 'fail'; failB.classList.add('on'); okB.classList.remove('on'); tagWrap.classList.remove('hidden'); confirm.disabled = !tags.size; ctx.sfx('click'); });
      confirm.addEventListener('click', () => judge(c, verdict, tags));
      stage.innerHTML = '';
      stage.appendChild(h('div', { class: 'conv-case slide-in' },
        h('div', { class: 'conv-head' }, h('span', { class: 'conv-n' }, `TESTE ${idx + 1}/${step.cases.length}`), h('span', { class: 'conv-tool' }, icon('cpu'), ' ', c.tool)),
        h('div', { class: 'conv-io' }, h('div', { class: 'io in' }, h('span', { class: 'io-l' }, 'ENTRADA'), c.input), h('div', { class: 'io out' }, h('span', { class: 'io-l' }, 'SAÍDA DA IA'), c.output)),
        h('div', { class: 'conv-actions' }, okB, failB), tagWrap, h('div', { class: 'conv-confirm' }, confirm)));
    }
    function judge(c, verdict, tags) {
      let right;
      if (c.ok) right = verdict === 'ok';
      else right = verdict === 'fail' && [...tags].some((t) => c.tags.includes(t)) && [...tags].every((t) => c.tags.includes(t));
      if (right) {
        ctx.sfx('success');
        UI.modal({ title: c.ok ? 'Resultado adequado ✔' : 'Falha encontrada ✔', cls: 'mini-ok', html: `<p>${esc(c.why)}</p>`, buttons: [{ label: idx + 1 < step.cases.length ? 'Próximo teste' : 'Concluir testes', primary: true }], onClose: () => { idx++; caseErr = 0; if (idx >= step.cases.length) ctx.ok({}); else render(); } });
        return;
      }
      caseErr++;
      let msg;
      if (caseErr >= 2) msg = esc(c.why);
      else if (c.ok) msg = 'Releia a saída: ela trata alguém de forma diferente ou estereotipada? Ou é um resultado diverso e respeitoso?';
      else if (verdict === 'ok') msg = 'Olhe de novo: esse resultado trata algum grupo de forma diferente, estereotipada ou excludente?';
      else msg = 'Existe uma falha, sim — mas confira o tipo. Que grupo está sendo prejudicado nesse teste?';
      ctx.fail({ msgs: [msg] });
    }
    ctx.hideCheck();
    render();
    return { el };
  };

  /* ============ 18. DECISÕES COM CONSEQUÊNCIAS ============ */
  MECH.decision = function (step, ctx) {
    const stage = h('div', { class: 'dec-stage' });
    const trail = h('div', { class: 'dec-trail' });
    const el = h('div', { class: 'mech-decision' }, trail, stage);
    let path = [];
    function show(id) {
      const n = step.nodes[id];
      stage.innerHTML = '';
      if (n.final) {
        ctx.sfx('unlock');
        stage.appendChild(h('div', { class: 'ending good' }, h('div', { class: 'end-kicker' }, 'FINAL ALCANÇADO'), h('h3', null, n.headline), h('p', null, n.text),
          h('button', { class: 'btn btn-primary', onclick: () => ctx.ok({}) }, icon('check'), ' Concluir reunião')));
        return;
      }
      trail.innerHTML = '';
      Object.keys(step.nodes).filter((k) => !step.nodes[k].final).forEach((k, i) => trail.appendChild(h('span', { class: 'dt ' + (k === id ? 'cur' : path.includes(k) ? 'done' : '') }, 'Decisão ' + (i + 1))));
      stage.appendChild(h('div', { class: 'dec-node slide-in' },
        h('div', { class: 'dec-room' }, icon('users'), ' Sala de reuniões · NEXUS LAB'),
        h('p', { class: 'dec-q' }, n.text),
        h('div', { class: 'dec-opts' }, n.options.map((o, i) => h('button', { class: 'dec-opt', onclick: () => choose(id, o) }, h('span', { class: 'opt-letter' }, 'ABC'[i]), o.t)))));
    }
    function choose(id, o) {
      ctx.sfx('whoosh');
      if (o.next) { path.push(id); if (!step.nodes[o.next].final) ctx.toast('Decisão registrada.'); show(o.next); return; }
      ctx.countError();
      ctx.sfx('glitch');
      stage.innerHTML = '';
      stage.appendChild(h('div', { class: 'ending bad slide-in' },
        h('div', { class: 'end-kicker' }, icon('timeline'), ' SIMULAÇÃO DO FUTURO'), h('h3', null, o.end.headline), h('p', null, o.end.text),
        h('div', { class: 'end-why' }, icon('bulb'), ' ', o.end.why),
        h('button', { class: 'btn btn-primary', onclick: () => { ctx.sfx('whoosh'); show(id); } }, icon('refresh'), ' Voltar no tempo e decidir de novo')));
    }
    ctx.hideCheck();
    show(step.start);
    return { el };
  };

  /* ============ 19. TESTE DE PERFIS GÊMEOS ============ */
  MECH.twins = function (step, ctx) {
    const ran = new Set(); const marks = {};
    const list = h('div', { class: 'twins' });
    const rows = {};
    step.tests.forEach((t) => {
      const res = h('div', { class: 'tw-res hidden' });
      const runB = h('button', { class: 'btn btn-ghost' }, icon('play'), ' Rodar teste');
      const passB = h('button', { class: 'verdict ok sm' }, icon('check'), ' Passou');
      const failB = h('button', { class: 'verdict fail sm' }, icon('x'), ' Falhou');
      const markRow = h('div', { class: 'tw-mark hidden' }, passB, failB);
      passB.addEventListener('click', () => { marks[t.id] = true; passB.classList.add('on'); failB.classList.remove('on'); row.classList.remove('wrong'); ctx.sfx('click'); upd(); });
      failB.addEventListener('click', () => { marks[t.id] = false; failB.classList.add('on'); passB.classList.remove('on'); row.classList.remove('wrong'); ctx.sfx('click'); upd(); });
      runB.addEventListener('click', async () => {
        runB.disabled = true; runB.innerHTML = '<span class="spinner"></span> Rodando…'; ctx.sfx('scan');
        await sleep(900);
        runB.classList.add('hidden');
        res.innerHTML = '';
        res.appendChild(h('div', { class: 'tw-pair' },
          h('div', { class: 'tw-side' }, h('span', { class: 'tw-tag' }, t.label + ': ' + t.a), h('div', { class: 'tw-out' }, t.ra)),
          h('div', { class: 'tw-vs' }, 'vs'),
          h('div', { class: 'tw-side' }, h('span', { class: 'tw-tag' }, t.label + ': ' + t.b), h('div', { class: 'tw-out' }, t.rb))));
        res.classList.remove('hidden'); markRow.classList.remove('hidden'); ran.add(t.id); upd();
      });
      const row = h('div', { class: 'tw-row' }, h('div', { class: 'tw-head' }, h('b', null, 'Teste: muda só ', h('u', null, t.label)), runB), res, markRow);
      rows[t.id] = row; list.appendChild(row);
    });
    function upd() { ctx.setCheck(ran.size === step.tests.length && Object.keys(marks).length === step.tests.length); }
    const el = h('div', { class: 'mech-twins' },
      h('div', { class: 'tw-base' }, h('div', { class: 'tw-img', html: person(step.base) }), h('div', null, h('b', null, 'Perfil base (fictício)'), h('p', { class: 'small' }, 'Notas 9 em Matemática e Ciências · interesses: programação e robótica'))),
      list);
    function check() {
      const wrong = step.tests.filter((t) => marks[t.id] !== t.pass);
      if (!wrong.length) return ctx.ok({ text: 'Análise correta! O teste do tipo de escola falhou: a recomendação muda quando só a escola muda.' });
      if (feedbackLevel(ctx) > 1) wrong.forEach((t) => rows[t.id].classList.add('wrong'));
      ctx.fail({ msgs: [`<b>${wrong.length}</b> teste(s) com a marcação errada.`, 'Um teste PASSA quando as duas recomendações são idênticas. Se mudar qualquer coisa, ele FALHA.'] });
    }
    ctx.setCheck(false);
    return { el, check };
  };

  /* ============ 20. JUSTIFICATIVA ESCRITA ============ */
  MECH.write = function (step, ctx) {
    const st = ENGINE.state;
    const ta = h('textarea', { class: 'write-area', rows: 6, maxlength: 900, placeholder: 'Escreva aqui a sua solução…', 'aria-label': 'Sua justificativa' });
    ta.value = st.finalDraft || '';
    const counter = h('div', { class: 'write-count' });
    const live = h('div', { class: 'rubric-live' });
    function upd() {
      const n = ta.value.trim().length;
      counter.textContent = `${n} caracteres (mínimo ${step.min})`;
      counter.classList.toggle('ok', n >= step.min);
      st.finalDraft = ta.value; ENGINE.save();
      const ev = ENGINE.evaluateText(ta.value, step.rubric);
      live.innerHTML = '';
      ev.res.forEach((r) => live.appendChild(h('div', { class: 'rl' }, h('span', null, r.label), h('span', { class: 'stars' }, '★'.repeat(r.score) + '☆'.repeat(3 - r.score)))));
      ctx.setCheck(n >= step.min);
    }
    ta.addEventListener('input', upd);
    const el = h('div', { class: 'mech-write' }, h('p', { class: 'q big' }, step.q),
      h('div', { class: 'write-guide' }, h('span', { class: 'small muted' }, 'Roteiro:'), step.guide.map((g) => h('span', { class: 'guide-chip' }, g))),
      ta, h('div', { class: 'write-foot' }, counter, h('div', null, h('span', { class: 'small muted' }, 'Medidor de critérios (estimativa): '), live)));
    function check() {
      const text = ta.value.trim();
      const ev = ENGINE.evaluateText(text, step.rubric);
      const covered = ev.res.filter((r) => r.score >= 1).length;
      if (text.length >= step.min && covered >= 2) {
        st.finalText = text; st.finalEval = ev; ENGINE.save();
        if (ev.res.every((r) => r.score >= 2)) ctx.award('argumento');
        const html = '<div class="rubric">' + ev.res.map((r) => `<div class="rb"><div class="rb-h"><b>${r.label}</b><span class="stars">${'★'.repeat(r.score)}${'☆'.repeat(3 - r.score)}</span></div><div class="small muted">${esc(r.desc)}</div></div>`).join('') + '</div><p class="small muted">A avaliação automática é uma estimativa. Seu professor ou sua professora pode ler a sua justificativa completa.</p>';
        return ctx.ok({ html });
      }
      const msgs = [];
      ev.res.filter((r) => r.score === 0).forEach((r) => msgs.push(`<b>${r.label}</b>: ${esc(r.desc)} Sua justificativa ainda não fala sobre isso.`));
      ctx.fail({ msgs: msgs.length ? msgs : ['Desenvolva um pouco mais a sua justificativa.'] });
    }
    upd();
    return { el, check };
  };

  window.MECH = MECH;
})();
