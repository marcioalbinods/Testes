/* =========================================================
   MISSÃO RESPEITO — Atividades interativas
   Cada atividade recebe um "ctx" com:
   root, m (missão), w (mundo), mistake(), feedback(), done(), state, save()
   ========================================================= */
(function () {
  'use strict';
  const { $, $$, el, esc, shuffle, shuffleNot, dragTap, SFX, modal, confetti, toast } = window.CORE;
  const { portrait, figure, BG, icon, iconInner, rodaArt, posterArt, PEOPLE } = window.ART;
  const { BIOS, POSTER, CHARACTERS } = window.GAME;

  const OK = '✅', NO = '❌';

  function bar(ctx, hint, counter) {
    return el(`<div class="act-bar"><span class="hint">${hint}</span>${counter ? `<span class="counter" aria-live="polite">${counter}</span>` : ''}</div>`);
  }

  /* ============ 1. CLASSIFICAR (arrastar para caixas) ============ */
  function classify(ctx) {
    const d = ctx.m.data;
    const items = shuffle(d.items.map((x, i) => Object.assign({ idx: i }, x)));
    let left = items.length, sel = null;
    const top = bar(ctx, 'Arraste o cartão para a caixa certa, ou toque no cartão e depois na caixa.', `Faltam: ${left}`);
    const pool = el('<div class="pool" aria-label="Itens para classificar"></div>');
    const bins = el(`<div class="bins" style="grid-template-columns:repeat(auto-fit,minmax(${d.bins.length > 2 ? 190 : 260}px,1fr))"></div>`);
    d.bins.forEach(b => {
      const bn = el(`<button class="bin ${b.cls || ''}" data-bin="${b.id}" aria-label="Caixa ${esc(b.label)}"><span class="bh"><span class="e">${b.icon}</span>${esc(b.label)}</span><span class="items"></span></button>`);
      bn.addEventListener('click', () => { if (sel) place(sel, b.id); else ctx.feedback('info', 'Primeiro toque em um item, depois na caixa.'); });
      bins.appendChild(bn);
    });
    const counter = $('.counter', top);
    function place(chip, binId) {
      const it = items[+chip.dataset.k];
      if (it.a === binId) {
        SFX.play('ok');
        chip.remove();
        $(`[data-bin="${binId}"] .items`, bins).appendChild(el(`<span class="chip placed ok">✔ ${esc(it.t)}</span>`));
        left--; counter.textContent = `Faltam: ${left}`;
        ctx.feedback('ok', `<b>Muito bem!</b> ${esc(it.why)}`);
        sel = null;
        if (left === 0) setTimeout(() => ctx.done(), 900);
      } else {
        SFX.play('bad'); ctx.mistake();
        chip.classList.remove('sel'); sel = null;
        chip.classList.add('shake'); setTimeout(() => chip.classList.remove('shake'), 450);
        const bl = d.bins.find(b => b.id === binId).label;
        ctx.feedback('bad', `<b>Ainda não.</b> Esse item não vai em "${esc(bl)}". Pense de novo: ${esc(it.why)}`);
      }
    }
    items.forEach((it, k) => {
      const chip = el(`<button class="chip" data-k="${k}">${esc(it.t)}</button>`);
      dragTap(chip, {
        targetSel: '.bin',
        canStart: () => !chip.classList.contains('placed'),
        onDrop: (t) => place(chip, t.dataset.bin),
        onTap: () => {
          SFX.play('click');
          $$('.chip.sel', pool).forEach(c => c.classList.remove('sel'));
          sel = chip; chip.classList.add('sel');
        }
      });
      pool.appendChild(chip);
    });
    ctx.root.append(top, pool, bins);
  }

  /* ============ 2. CENA DE INVESTIGAÇÃO ============ */
  function scene(ctx) {
    const d = ctx.m.data;
    let found = 0;
    const top = bar(ctx, 'Toque em cada grupo e diga o que você observa.', `Encontradas: 0 de ${d.need}`);
    const counter = $('.counter', top);
    const sc = el(`<div class="scene"><div class="scene-bg">${BG[d.bg]()}</div><div class="spots"></div></div>`);
    const spots = $('.spots', sc);
    d.spots.forEach((s, i) => {
      const kids = s.kids.map(k => figure(k[0], k[1], k[2])).join('');
      const sp = el(`<button class="spot" aria-label="Grupo ${i + 1}: ${esc(s.text)}"><span class="kids">${kids}</span><span class="txt">${esc(s.text)}</span><span class="mark">🔍 Investigar</span></button>`);
      sp.addEventListener('click', async () => {
        if (sp.dataset.done) return;
        SFX.play('click');
        const ans = await modal(`<h3>🔍 O que você observa?</h3>
          <div class="row center" style="justify-content:center">${s.kids.map(k => `<span style="width:90px">${figure(k[0], k[1], k[2])}</span>`).join('')}</div>
          <p style="font-size:1.15rem;text-align:center"><b>${esc(s.text)}</b></p>`,
          [{ label: '🚩 Discriminação', cls: 'danger', value: 'bad' }, { label: '💚 Respeito', cls: 'go', value: 'ok' }, { label: 'Voltar', cls: 'small', value: null }]);
        if (!ans) return;
        const right = (ans === 'bad') === s.bad;
        sp.dataset.done = '1';
        sp.classList.add(s.bad ? 'found-bad' : 'found-ok');
        $('.mark', sp).textContent = s.bad ? '🚩 Discriminação' : '💚 Respeito';
        if (s.bad) { found++; counter.textContent = `Encontradas: ${found} de ${d.need}`; }
        if (right) { SFX.play('ok'); ctx.feedback('ok', `<b>Isso mesmo!</b> ${esc(s.why)}`); }
        else { SFX.play('bad'); ctx.mistake(); ctx.feedback('bad', `<b>Olhe de novo:</b> ${s.bad ? 'aqui há discriminação.' : 'aqui há respeito.'} ${esc(s.why)}`); }
        if (found >= d.need) setTimeout(() => ctx.done(), 1400);
      });
      spots.appendChild(sp);
    });
    ctx.root.append(top, sc);
  }

  /* ============ 3. SEMÁFORO ============ */
  function traffic(ctx) {
    const items = shuffle(ctx.m.data.items);
    let i = 0;
    const top = bar(ctx, 'Leia a situação e aperte a cor certa do semáforo.', '');
    const counter = el(`<span class="counter"></span>`); top.appendChild(counter);
    const wrap = el(`<div class="traffic">
      <div class="card tcard" aria-live="polite"></div>
      <div class="tlight">
        <button class="tbtn green" data-a="ok"><span class="e">🟢</span>Brincadeira respeitosa</button>
        <button class="tbtn red" data-a="bad"><span class="e">🔴</span>Ofensa / racismo</button>
      </div></div>`);
    const card = $('.tcard', wrap);
    let locked = false;
    function show() {
      locked = false;
      counter.textContent = `${i + 1} de ${items.length}`;
      card.textContent = items[i].t;
      card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
      $$('.tbtn', wrap).forEach(b => b.disabled = false);
    }
    $$('.tbtn', wrap).forEach(b => b.addEventListener('click', () => {
      if (locked) return;
      locked = true;
      $$('.tbtn', wrap).forEach(x => x.disabled = true);
      const it = items[i];
      const right = b.dataset.a === it.a;
      const label = it.a === 'ok' ? '🟢 Brincadeira respeitosa' : '🔴 Ofensa / racismo';
      if (right) SFX.play('ok'); else { SFX.play('bad'); ctx.mistake(); }
      const last = i === items.length - 1;
      ctx.feedback(right ? 'ok' : 'bad', `<b>${right ? 'Acertou!' : 'Pense de novo.'} Resposta: ${label}.</b> ${esc(it.why)}`, {
        button: last ? 'Concluir ✔' : 'Próxima ➜',
        onButton: () => { if (last) ctx.done(); else { i++; ctx.feedback(null); show(); } }
      });
    }));
    ctx.root.append(top, wrap);
    show();
  }

  /* ============ 4. CONSERTE A CENA ============ */
  function fixit(ctx) {
    const items = ctx.m.data.items;
    let i = 0;
    const top = bar(ctx, 'Escolha a atitude que conserta a situação.', '');
    const counter = el('<span class="counter"></span>'); top.appendChild(counter);
    const stage = el('<div class="stage"><div class="scene-bg"></div><div class="chars"></div></div>');
    const narr = el('<div class="narr card"></div>');
    const choices = el('<div class="choices"></div>');
    function draw(it, fixed) {
      $('.scene-bg', stage).innerHTML = BG[it.bg]();
      const others = it.others.map(o => figure(o, fixed ? 'thinking' : 'smile', fixed ? 'down' : 'point')).join('');
      $('.chars', stage).innerHTML = others + figure(it.victim, fixed ? 'happy' : 'sad', fixed ? 'wave' : 'down', { cls: 'enter' }) + (fixed ? figure('lucia', 'happy', 'up', { cls: 'enter' }) : '');
    }
    function show() {
      const it = items[i];
      counter.textContent = `Cena ${i + 1} de ${items.length}`;
      draw(it, false);
      narr.innerHTML = `<p style="margin:0">${esc(it.t)}</p><span class="ask">Qual atitude ajuda?</span>`;
      choices.innerHTML = '';
      shuffle(it.options).forEach(op => {
        const b = el(`<button class="choice"><span class="ce">👉</span><span>${esc(op.t)}</span></button>`);
        b.addEventListener('click', () => {
          if (b.disabled) return;
          if (op.ok) {
            SFX.play('ok');
            draw(it, true);
            $$('.choice', choices).forEach(x => x.disabled = true);
            b.style.background = 'var(--ok-bg)';
            const last = i === items.length - 1;
            ctx.feedback('ok', `<b>Cena consertada!</b> ${esc(op.why)}`, { button: last ? 'Concluir ✔' : 'Próxima cena ➜', onButton: () => { if (last) ctx.done(); else { i++; ctx.feedback(null); show(); } } });
          } else {
            SFX.play('bad'); ctx.mistake();
            b.disabled = true; b.classList.add('tried', 'shake');
            ctx.feedback('bad', `<b>Essa atitude não conserta a cena.</b> ${esc(op.why)} Tente outra.`);
          }
        });
        choices.appendChild(b);
      });
    }
    ctx.root.append(top, stage, narr, choices);
    show();
  }

  /* ============ 5. JOGO DA MEMÓRIA ============ */
  function memory(ctx) {
    const d = ctx.m.data;
    const cards = [];
    d.pairs.forEach((p, k) => {
      if (d.portraits) {
        cards.push({ k, html: `${portrait(p.person, 'smile')}<span>${esc(BIOS[p.person].name)}</span>`, label: BIOS[p.person].name });
        cards.push({ k, html: `${icon(p.icon)}<span>${esc(p.name)}</span>`, label: p.name });
      } else {
        cards.push({ k, html: icon(p.icon), label: 'Figura: ' + p.name });
        cards.push({ k, html: `<span style="font-size:1.25em">${esc(p.name)}</span>`, label: p.name });
      }
    });
    const deck = shuffle(cards);
    let open = [], matched = 0, busy = false;
    const found = new Set();
    // PDF só no jogo da memória da cultura (Missão 6), não no de personalidades (Missão 19)
    const withPdf = !d.portraits;
    const top = bar(ctx, 'Vire duas cartas e encontre os pares.', `Pares: 0 de ${d.pairs.length}`);
    const counter = $('.counter', top);
    const grid = el('<div class="memory"></div>');
    deck.forEach((c, idx) => {
      const b = el(`<button class="mcard" aria-label="Carta ${idx + 1}, virada para baixo"><span class="in"><span class="face back">?</span><span class="face front">${c.html}</span></span></button>`);
      b.addEventListener('click', () => {
        if (busy || b.classList.contains('flip') || b.classList.contains('done')) return;
        SFX.play('flip');
        b.classList.add('flip'); b.setAttribute('aria-label', c.label);
        open.push({ b, c });
        if (open.length === 2) {
          busy = true;
          const [a, z] = open;
          if (a.c.k === z.c.k) {
            setTimeout(() => {
              a.b.classList.add('done'); z.b.classList.add('done');
              matched++; counter.textContent = `Pares: ${matched} de ${d.pairs.length}`;
              SFX.play('ok');
              found.add(a.c.k);
              open = []; busy = false;
              if (withPdf) pdf.disabled = false;
              if (withPdf && matched === d.pairs.length) {
                SFX.play('win');
                ctx.feedback('ok', `<b>Todos os pares encontrados!</b> ${esc(d.pairs[a.c.k].name)}: ${esc(d.pairs[a.c.k].fact)} Se quiser, baixe o PDF antes de concluir.`, { button: 'Concluir ✔', onButton: () => ctx.done({ thresholds: [5, 10] }) });
              } else {
                ctx.feedback('ok', `<b>Par encontrado: ${esc(d.pairs[a.c.k].name)}!</b> ${esc(d.pairs[a.c.k].fact)}`);
                if (matched === d.pairs.length) setTimeout(() => ctx.done({ thresholds: [5, 10] }), 1200);
              }
            }, 450);
          } else {
            ctx.mistake();
            setTimeout(() => {
              a.b.classList.remove('flip'); z.b.classList.remove('flip');
              a.b.setAttribute('aria-label', 'Carta virada para baixo'); z.b.setAttribute('aria-label', 'Carta virada para baixo');
              open = []; busy = false;
            }, 1000);
          }
        }
      });
      grid.appendChild(b);
    });
    const pdfRow = el('<div class="row center" style="margin-top:14px"><button class="btn pdf" disabled>📄 Baixar PDF da memória</button></div>');
    const pdf = $('.pdf', pdfRow);
    pdf.addEventListener('click', async () => {
      if (pdf.disabled || !found.size) return;
      SFX.play('click');
      pdf.disabled = true;
      try {
        await svgToPDF(memorySVG(d.pairs, found), 1200, 1600, 'memoria-da-cultura-missao-respeito.pdf', 'Memoria da cultura - Missao Respeito');
        toast('PDF da memória salvo! Procure na pasta de downloads.');
      } catch (e) { toast(PDF_FAIL, 4000); }
      pdf.disabled = false;
    });
    ctx.root.append(top, grid);
    if (withPdf) ctx.root.appendChild(pdfRow);
  }

  /* Pares encontrados no jogo da memória da cultura (SVG em pé, 1200×1600) para o PDF */
  function memorySVG(pairs, found) {
    const W = 1200, H = 1600, cw = 500, ch = 340;
    const cards = pairs.map((p, i) => {
      const x = 80 + (i % 2) * 540, y = 262 + Math.floor(i / 2) * 372;
      if (!found.has(i)) {
        return `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="26" fill="#FFFBF2" stroke="#c7bfd8" stroke-width="4" stroke-dasharray="14 10"/>
          <text x="${x + cw / 2}" y="${y + 170}" text-anchor="middle" font-size="90" font-weight="700" fill="#d6d0e2">?</text>
          <text x="${x + cw / 2}" y="${y + 250}" text-anchor="middle" font-size="26" fill="#a39bb8">Par ainda não encontrado</text>`;
      }
      const fl = wrapText(p.fact, 34);
      return `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="26" fill="#fff" stroke="#2B2140" stroke-width="4"/>
        <rect x="${x}" y="${y}" width="${cw}" height="14" rx="7" fill="#FF8A3D"/>
        <rect x="${x + 26}" y="${y + 34}" width="120" height="120" rx="22" fill="#FFF1D6" stroke="#2B2140" stroke-width="3"/>
        <g transform="translate(${x + 36},${y + 44}) scale(1.5625)">${iconInner(p.icon)}</g>
        <text x="${x + 170}" y="${y + 110}" font-size="44" font-weight="700" fill="#2B2140">${esc(p.name)}</text>
        ${fl.slice(0, 5).map((l, k) => `<text x="${x + 28}" y="${y + 200 + k * 30}" font-size="24" fill="#4d4466">${esc(l)}</text>`).join('')}`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif">
      {{FONT}}
      <rect width="${W}" height="${H}" fill="#FFF8EC"/>
      <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="34" fill="#fff" stroke="#2B2140" stroke-width="6"/>
      <rect x="20" y="20" width="${W - 40}" height="200" rx="34" fill="#FF8A3D"/>
      <rect x="20" y="180" width="${W - 40}" height="40" fill="#FF8A3D"/>
      <line x1="20" y1="220" x2="${W - 20}" y2="220" stroke="#2B2140" stroke-width="5"/>
      <text x="${W / 2}" y="120" text-anchor="middle" font-size="62" font-weight="700" fill="#fff">Memória da cultura</text>
      <text x="${W / 2}" y="184" text-anchor="middle" font-size="34" font-weight="500" fill="#2B2140">Missão 6 · Nossa História, Nossa Cultura</text>
      ${cards}
      <text x="${W / 2}" y="${H - 52}" text-anchor="middle" font-size="26" fill="#4d4466">Missão Respeito · Uma escola sem racismo</text>
    </svg>`;
  }

  /* ============ 6. LIGAR (associação) ============ */
  const TAGC = ['#14A098', '#FF8A3D', '#6A4CE0', '#FF5C8A', '#3D8BFF', '#E9A23B', '#2BB673', '#C0392B'];
  function matchGame(ctx, left, right, onEnd) {
    let selL = null, selR = null, done = 0;
    const top = bar(ctx, 'Toque em um item da esquerda e depois na descrição certa.', `Ligados: 0 de ${left.length}`);
    const counter = $('.counter', top);
    const wrap = el('<div class="match"><div class="col L"></div><div class="col R"></div></div>');
    const L = $('.L', wrap), R = $('.R', wrap);
    function check() {
      if (!selL || !selR) return;
      const a = selL, b = selR;
      selL = selR = null;
      a.classList.remove('sel'); b.classList.remove('sel');
      if (a.dataset.id === b.dataset.id) {
        const c = TAGC[done % TAGC.length];
        done++;
        [a, b].forEach(x => { x.classList.add('done'); x.disabled = true; x.insertAdjacentHTML('afterbegin', `<span class="tagn" style="background:${c}">${done}</span>`); });
        counter.textContent = `Ligados: ${done} de ${left.length}`;
        SFX.play('ok');
        ctx.feedback('ok', `<b>Ligação certa!</b> ${esc(a.dataset.name)}: ${esc(b.dataset.text)}`);
        if (done === left.length) setTimeout(onEnd, 1000);
      } else {
        SFX.play('bad'); ctx.mistake();
        [a, b].forEach(x => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 450); });
        ctx.feedback('bad', `<b>Essa ligação não combina.</b> Leia a descrição de novo com calma e tente outra vez.`);
      }
    }
    left.forEach(it => {
      const b = el(`<button class="mitem" data-id="${it.id}" data-name="${esc(it.t)}"><span class="mi">${it.media}</span><span>${esc(it.t)}</span></button>`);
      b.addEventListener('click', () => { if (b.disabled) return; SFX.play('click'); $$('.mitem.sel', L).forEach(x => x.classList.remove('sel')); selL = b; b.classList.add('sel'); check(); });
      L.appendChild(b);
    });
    shuffleNot(right, r => r.every((x, i) => x.id === left[i].id)).forEach(it => {
      const b = el(`<button class="mitem" data-id="${it.id}" data-text="${esc(it.t)}"><span>${esc(it.t)}</span></button>`);
      b.addEventListener('click', () => { if (b.disabled) return; SFX.play('click'); $$('.mitem.sel', R).forEach(x => x.classList.remove('sel')); selR = b; b.classList.add('sel'); check(); });
      R.appendChild(b);
    });
    ctx.root.append(top, wrap);
  }
  function match(ctx) {
    const d = ctx.m.data;
    matchGame(ctx, d.left.map(x => ({ id: x.id, t: x.t, media: icon(x.icon) })), d.right, () => ctx.done());
  }

  /* ============ 7. QUEBRA-CABEÇA + SÍLABAS ============ */
  function puzzle(ctx) {
    const d = ctx.m.data, n = d.size, N = n * n, art = rodaArt(), cell = 300 / n;
    let order = shuffleNot([...Array(N).keys()], r => r.every((v, i) => v === i));
    let sel = null, wordsDone = 0;
    const pdfRow = el('<div class="row center" style="margin-top:14px"><button class="btn pdf">📄 Baixar PDF do quebra-cabeça</button></div>');
    const pdf = $('.pdf', pdfRow);
    pdf.addEventListener('click', async () => {
      if (pdf.disabled) return;
      SFX.play('click');
      pdf.disabled = true;
      try {
        await svgToPDF(puzzleSVG(d, wordsDone), 1200, 1600, 'quebra-cabeca-da-roda-missao-respeito.pdf', 'Quebra-cabeca da roda - Missao Respeito');
        toast('PDF do quebra-cabeça salvo! Procure na pasta de downloads.');
      } catch (e) { toast(PDF_FAIL, 4000); }
      pdf.disabled = false;
    });
    const top = bar(ctx, 'Parte 1: toque em duas peças para trocá-las de lugar.', 'Peças certas: 0');
    const counter = $('.counter', top);
    const row = el('<div class="row" style="justify-content:center;align-items:flex-start;gap:20px"></div>');
    const ref = el(`<div><div class="ref"><svg viewBox="0 0 300 300">${art}</svg></div><p class="note center">Modelo</p></div>`);
    const grid = el(`<div class="puzzle" style="grid-template-columns:repeat(${n},1fr)"></div>`);
    row.append(grid, ref);
    function draw() {
      grid.innerHTML = '';
      let right = 0;
      order.forEach((piece, pos) => {
        if (piece === pos) right++;
        const px = (piece % n) * cell, py = Math.floor(piece / n) * cell;
        const t = el(`<button class="ptile ${sel === pos ? 'sel' : ''}" aria-label="Peça na posição ${pos + 1}${piece === pos ? ', no lugar certo' : ''}"><svg viewBox="${px} ${py} ${cell} ${cell}" preserveAspectRatio="none">${art}</svg></button>`);
        t.addEventListener('click', () => {
          if (grid.classList.contains('solved')) return;
          if (sel === null) { sel = pos; SFX.play('click'); draw(); return; }
          if (sel === pos) { sel = null; draw(); return; }
          [order[sel], order[pos]] = [order[pos], order[sel]];
          sel = null; SFX.play('flip');
          draw();
          if (order.every((v, i) => v === i)) solved();
        });
        grid.appendChild(t);
      });
      counter.textContent = `Peças certas: ${right} de ${N}`;
    }
    function solved() {
      grid.classList.add('solved');
      SFX.play('win'); confetti(40);
      ctx.root.appendChild(pdfRow);
      ctx.feedback('ok', `<b>Imagem completa!</b> ${esc(d.facts)}`, { button: 'Parte 2: palavras ➜', onButton: () => { ctx.feedback(null); words(); } });
    }
    function words() {
      ctx.root.innerHTML = '';
      let wi = 0;
      const top2 = bar(ctx, 'Parte 2: toque nas sílabas na ordem certa para formar a palavra.', '');
      const c2 = el('<span class="counter"></span>'); top2.appendChild(c2);
      const box = el('<div class="card center"></div>');
      ctx.root.append(top2, box, pdfRow);
      function showWord() {
        const w = d.words[wi];
        c2.textContent = `Palavra ${wi + 1} de ${d.words.length}`;
        let pos = 0;
        box.innerHTML = `<p style="font-size:1.2rem"><b>Pista:</b> ${esc(w.clue)}</p><div class="syl-word">${w.w.map(() => '<span class="syl-slot"></span>').join('')}</div><div class="syl-pool"></div>`;
        const pool = $('.syl-pool', box), slots = $$('.syl-slot', box);
        shuffleNot(w.w.map((s, k) => ({ s, k })), r => r.every((x, i) => x.k === i)).forEach(x => {
          const b = el(`<button class="btn syl">${esc(x.s)}</button>`);
          b.addEventListener('click', () => {
            if (b.disabled) return;
            if (x.s === w.w[pos]) {
              SFX.play('click');
              slots[pos].textContent = x.s; slots[pos].classList.add('filled');
              b.disabled = true; b.style.visibility = 'hidden';
              pos++;
              if (pos === w.w.length) {
                SFX.play('ok');
                wordsDone = wi + 1;
                const last = wi === d.words.length - 1;
                ctx.feedback('ok', `<b>${esc(w.w.join(''))}!</b> ${esc(w.clue)}`, { button: last ? 'Concluir ✔' : 'Próxima palavra ➜', onButton: () => { ctx.feedback(null); if (last) ctx.done(); else { wi++; showWord(); } } });
              }
            } else {
              SFX.play('bad'); ctx.mistake(0.5);
              b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 450);
              ctx.feedback('bad', `Essa sílaba não vem agora. Leia a pista e pense no som da palavra.`);
            }
          });
          pool.appendChild(b);
        });
      }
      showWord();
    }
    ctx.root.append(top, row);
    draw();
  }

  /* Quebra-cabeça montado + palavras (SVG em pé, 1200×1600) para o PDF */
  function puzzleSVG(d, wordsDone) {
    const W = 1200, H = 1600;
    const factLines = wrapText(d.facts, 50);
    const cards = d.words.map((w, i) => {
      const x = 80 + (i % 2) * 540, y = 1150 + Math.floor(i / 2) * 190, cw = 500, ch = 170;
      const done = i < wordsDone;
      let word;
      if (done) {
        word = `<text x="${x + cw / 2}" y="${y + 66}" text-anchor="middle" font-size="50" font-weight="700" fill="#6A4CE0">${esc(w.w.join(''))}</text>`;
      } else {
        const bw = 64, gap = 12, tot = w.w.length * bw + (w.w.length - 1) * gap, bx = x + (cw - tot) / 2;
        word = w.w.map((_, k) => `<rect x="${bx + k * (bw + gap)}" y="${y + 22}" width="${bw}" height="56" rx="10" fill="#fff" stroke="#2B2140" stroke-width="3" stroke-dasharray="8 6"/>`).join('');
      }
      const cl = wrapText(w.clue, 42);
      return `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="22" fill="${done ? '#F4F0FF' : '#FFFBF2'}" stroke="#2B2140" stroke-width="4"/>
        ${word}
        ${cl.slice(0, 3).map((l, k) => `<text x="${x + cw / 2}" y="${y + 110 + k * 26}" text-anchor="middle" font-size="22" fill="#4d4466">${esc(l)}</text>`).join('')}`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif">
      {{FONT}}
      <rect width="${W}" height="${H}" fill="#FFF8EC"/>
      <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="34" fill="#fff" stroke="#2B2140" stroke-width="6"/>
      <rect x="20" y="20" width="${W - 40}" height="200" rx="34" fill="#6A4CE0"/>
      <rect x="20" y="180" width="${W - 40}" height="40" fill="#6A4CE0"/>
      <line x1="20" y1="220" x2="${W - 20}" y2="220" stroke="#2B2140" stroke-width="5"/>
      <text x="${W / 2}" y="120" text-anchor="middle" font-size="62" font-weight="700" fill="#fff">Quebra-cabeça da roda</text>
      <text x="${W / 2}" y="184" text-anchor="middle" font-size="34" font-weight="500" fill="#FFE08A">Missão 8 · Nossa História, Nossa Cultura</text>
      <rect x="${W / 2 - 316}" y="254" width="632" height="632" rx="26" fill="#2B2140"/>
      <svg x="${W / 2 - 300}" y="270" width="600" height="600" viewBox="0 0 300 300">${rodaArt()}</svg>
      ${factLines.map((l, k) => `<text x="${W / 2}" y="${950 + k * 42}" text-anchor="middle" font-size="32" font-weight="600" fill="#2B2140">${esc(l)}</text>`).join('')}
      <text x="${W / 2}" y="1120" text-anchor="middle" font-size="40" font-weight="700" fill="#FF8A3D">Palavras da nossa cultura</text>
      ${cards}
      <text x="${W / 2}" y="${H - 52}" text-anchor="middle" font-size="26" fill="#4d4466">Missão Respeito · Uma escola sem racismo</text>
    </svg>`;
  }

  /* ============ 8. LINHA DO TEMPO ============ */
  function order(ctx) {
    const items = ctx.m.data.items;
    let next = 0;
    const top = bar(ctx, 'Toque no acontecimento mais antigo que ainda falta. Dica: olhe os anos!', `0 de ${items.length}`);
    const counter = $('.counter', top);
    const wrap = el('<div class="timeline"><div><h3>🕰️ Linha do tempo</h3><div class="tl-slots"></div></div><div><h3>🗂️ Acontecimentos</h3><div class="tl-cards"></div></div></div>');
    const slots = $('.tl-slots', wrap), cards = $('.tl-cards', wrap);
    items.forEach(() => slots.appendChild(el('<div class="tl-slot"><span class="note">...</span></div>')));
    shuffleNot(items.map((x, k) => Object.assign({ k }, x)), r => r.every((x, i) => x.k === i)).forEach(it => {
      const b = el(`<button class="tl-card"><span class="y">${esc(it.y)}</span><span>${esc(it.t)}</span></button>`);
      b.addEventListener('click', () => {
        if (it.k === next) {
          SFX.play('ok');
          const s = slots.children[next];
          s.classList.add('filled');
          s.innerHTML = `<span class="y">${esc(it.y)}</span><span>${esc(it.t)}</span>`;
          b.classList.add('used');
          next++; counter.textContent = `${next} de ${items.length}`;
          pdf.disabled = false;
          if (next === items.length) {
            SFX.play('win');
            ctx.feedback('ok', `<b>Linha do tempo completa!</b> ${esc(it.y)}: ${esc(it.t)} Se quiser, baixe o PDF antes de concluir.`, { button: 'Concluir ✔', onButton: () => ctx.done() });
          } else {
            ctx.feedback('ok', `<b>${esc(it.y)}:</b> ${esc(it.t)}`);
          }
        } else {
          SFX.play('bad'); ctx.mistake();
          b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 450);
          ctx.feedback('bad', `<b>Ainda não.</b> Procure o acontecimento mais antigo entre os que sobraram. "Anos 1600" vem antes de 1888, que vem antes de 1931...`);
        }
      });
      cards.appendChild(b);
    });
    const pdfRow = el('<div class="row center" style="margin-top:14px"><button class="btn pdf" disabled>📄 Baixar PDF da linha do tempo</button></div>');
    const pdf = $('.pdf', pdfRow);
    pdf.addEventListener('click', async () => {
      if (pdf.disabled || !next) return;
      SFX.play('click');
      pdf.disabled = true;
      try {
        await svgToPDF(timelineSVG(items, next), 1200, 1600, 'linha-do-tempo-missao-respeito.pdf', 'Linha do tempo - Missao Respeito');
        toast('PDF da linha do tempo salvo! Procure na pasta de downloads.');
      } catch (e) { toast(PDF_FAIL, 4000); }
      pdf.disabled = false;
    });
    ctx.root.append(top, wrap, pdfRow);
  }

  /* Linha do tempo (SVG em pé, 1200×1600) para o PDF. "placed" = quantos acontecimentos já foram colocados. */
  function timelineSVG(items, placed) {
    const W = 1200, H = 1600, top = 290, step = (H - top - 170) / items.length, lineX = 170;
    const colors = ['#8B5A3C', '#14A098', '#6A4CE0', '#FF5C8A', '#FF8A3D', '#3D8BFF', '#E9A23B'];
    const rows = items.map((it, i) => {
      const y = top + i * step, cy = y + step / 2 - 8, c = colors[i % colors.length];
      if (i >= placed) {
        return `<circle cx="${lineX}" cy="${cy}" r="18" fill="#fff" stroke="#c7bfd8" stroke-width="5"/>
          <rect x="230" y="${y + 6}" width="${W - 300}" height="${step - 28}" rx="22" fill="none" stroke="#c7bfd8" stroke-width="4" stroke-dasharray="14 10"/>
          <text x="270" y="${cy + 12}" font-size="34" fill="#a39bb8">...</text>`;
      }
      const lines = wrapText(it.t, 38);
      const ty = cy - (lines.length - 1) * 19 + 12;
      return `<circle cx="${lineX}" cy="${cy}" r="22" fill="${c}" stroke="#2B2140" stroke-width="5"/>
        <rect x="230" y="${y + 6}" width="${W - 300}" height="${step - 28}" rx="22" fill="#fff" stroke="#2B2140" stroke-width="4"/>
        <rect x="230" y="${y + 6}" width="18" height="${step - 28}" rx="9" fill="${c}"/>
        <rect x="270" y="${cy - 30}" width="196" height="60" rx="16" fill="#2B2140"/>
        <text x="368" y="${cy + 12}" text-anchor="middle" font-size="32" font-weight="700" fill="#fff">${esc(it.y)}</text>
        ${lines.map((l, k) => `<text x="490" y="${ty + k * 38}" font-size="30" font-weight="500" fill="#2B2140">${esc(l)}</text>`).join('')}`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif">
      {{FONT}}
      <rect width="${W}" height="${H}" fill="#FFF8EC"/>
      <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="34" fill="#fff" stroke="#2B2140" stroke-width="6"/>
      <rect x="20" y="20" width="${W - 40}" height="210" rx="34" fill="#FF8A3D"/>
      <rect x="20" y="190" width="${W - 40}" height="40" fill="#FF8A3D"/>
      <line x1="20" y1="230" x2="${W - 20}" y2="230" stroke="#2B2140" stroke-width="5"/>
      <text x="${W / 2}" y="118" text-anchor="middle" font-size="60" font-weight="700" fill="#fff">Linha do tempo</text>
      <text x="${W / 2}" y="186" text-anchor="middle" font-size="36" font-weight="600" fill="#2B2140">da luta e da criação do povo negro no Brasil</text>
      <rect x="${lineX - 6}" y="${top}" width="12" height="${items.length * step - 30}" rx="6" fill="#FFC531"/>
      ${rows}
      <text x="${W / 2}" y="${H - 70}" text-anchor="middle" font-size="28" fill="#4d4466">Missão Respeito · Mundo 2: Nossa História, Nossa Cultura</text>
    </svg>`;
  }

  /* ============ 9. HISTÓRIA COM DECISÕES ============ */
  function story(ctx) {
    const nodes = ctx.m.data.nodes;
    const keys = Object.keys(nodes);
    const stage = el('<div class="stage"><div class="scene-bg"></div><div class="chars"></div></div>');
    const steps = el(`<div class="story-steps" aria-hidden="true">${keys.map(() => '<i></i>').join('')}</div>`);
    const top = el('<div class="act-bar"><span class="hint">Leia, pense e escolha. Cada escolha tem uma consequência.</span></div>');
    top.appendChild(steps);
    const narr = el('<div class="narr card" aria-live="polite"></div>');
    const area = el('<div></div>');
    function setChars(list, enter) {
      $('.chars', stage).innerHTML = list.map(c => figure(c[0], c[1], c[2], { cls: enter ? 'enter' : '' })).join('');
    }
    function go(key) {
      const n = nodes[key];
      const idx = keys.indexOf(key);
      $$('i', steps).forEach((d, i) => d.classList.toggle('on', i <= idx));
      $('.scene-bg', stage).innerHTML = BG[n.bg]();
      setChars(n.chars, true);
      area.innerHTML = '';
      if (n.final) {
        narr.innerHTML = `<p style="margin:0">🌟 ${esc(n.text)}</p>`;
        SFX.play('win');
        const b = el('<div class="row center" style="margin-top:14px"><button class="btn go big">Concluir a história ✔</button></div>');
        $('button', b).addEventListener('click', () => ctx.done());
        area.appendChild(b);
        return;
      }
      narr.innerHTML = `<p style="margin:0">${esc(n.text)}</p><span class="ask">${esc(n.ask)}</span>`;
      const ch = el('<div class="choices"></div>');
      n.choices.forEach(c => {
        const b = el(`<button class="choice"><span class="ce">${c.icon}</span><span>${esc(c.t)}</span></button>`);
        b.addEventListener('click', () => choose(n, c, b, ch));
        ch.appendChild(b);
      });
      area.appendChild(ch);
    }
    function choose(n, c, btn, ch) {
      if (btn.disabled) return;
      $$('.choice', ch).forEach(x => x.disabled = true);
      const good = c.q !== 'bad';
      if (good) SFX.play('ok'); else { SFX.play('bad'); ctx.mistake(); }
      if (c.chars) setChars(c.chars, true);
      else if (!good) setChars(n.chars.map(x => [x[0], x === n.chars[1] ? 'sad' : x[1], x[2]]), false);
      const badge = c.q === 'best' ? '<span class="badge best">🌟 Ótima escolha!</span>' : c.q === 'good' ? '<span class="badge good">👍 Boa escolha!</span>' : '<span class="badge bad">🤔 Pense de novo</span>';
      const res = el(`<div class="result card" aria-live="polite">${badge}
        <p><b>O que aconteceu:</b> ${esc(c.res)}</p>
        <div class="why"><b>Por quê?</b> ${esc(c.why)}</div>
        <div class="row center" style="margin-top:12px"></div></div>`);
      const r = $('.row', res);
      if (good) {
        const b = el('<button class="btn go">Continuar ➜</button>');
        b.addEventListener('click', () => { SFX.play('click'); go(c.next); window.scrollTo({ top: 0, behavior: 'smooth' }); });
        r.appendChild(b);
      } else {
        const b = el('<button class="btn primary">↩ Tentar outra escolha</button>');
        b.addEventListener('click', () => {
          SFX.play('click');
          res.remove();
          setChars(n.chars, false);
          $$('.choice', ch).forEach(x => { if (!x.classList.contains('tried')) x.disabled = false; });
          btn.classList.add('tried'); btn.disabled = true;
        });
        r.appendChild(b);
      }
      area.appendChild(res);
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    ctx.root.append(top, stage, narr, area);
    go('start');
  }

  /* ============ 10. BIOGRAFIAS + LIGAR ============ */
  function bioCard(id) {
    const b = BIOS[id];
    return `<div class="bio" style="--pc:${b.color}">
      <div class="pic">${portrait(id, 'smile')}<span class="badge-ico">${icon(b.icon)}</span></div>
      <div><h3>${esc(b.name)}</h3><div class="years">${esc(b.years)}</div><span class="area">${esc(b.area)}</span>
      <ul>${b.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div></div>`;
  }
  function bios(ctx) {
    const d = ctx.m.data;
    let i = 0, seen = new Set([0]);
    const top = bar(ctx, 'Leia os cartões. Depois de ver todos, comece o desafio.', '');
    const counter = el('<span class="counter"></span>'); top.appendChild(counter);
    const card = el('<div class="card" aria-live="polite"></div>');
    const nav = el(`<div class="bio-nav"><button class="btn prev">⬅ Anterior</button><span class="dots">${d.people.map(() => '<i></i>').join('')}</span><button class="btn primary next">Próximo ➡</button></div>`);
    const note = el('<p class="note center" style="margin-top:10px">As ilustrações são representações artísticas, criadas para este jogo.</p>');
    const goBtn = el('<div class="row center" style="margin-top:12px"><button class="btn go big" disabled>🔗 Ir para o desafio</button></div>');
    function show() {
      card.innerHTML = bioCard(d.people[i]);
      counter.textContent = `Cartão ${i + 1} de ${d.people.length}`;
      $$('.dots i', nav).forEach((x, k) => x.classList.toggle('on', k === i));
      $('.prev', nav).disabled = i === 0;
      $('.next', nav).disabled = i === d.people.length - 1;
      $('button', goBtn).disabled = seen.size < d.people.length;
    }
    $('.prev', nav).addEventListener('click', () => { if (i > 0) { i--; SFX.play('flip'); show(); } });
    $('.next', nav).addEventListener('click', () => { if (i < d.people.length - 1) { i++; seen.add(i); SFX.play('flip'); show(); } });
    $('button', goBtn).addEventListener('click', () => {
      SFX.play('click');
      ctx.root.innerHTML = '';
      ctx.feedback(null);
      matchGame(ctx, d.people.map(id => ({ id, t: BIOS[id].name, media: portrait(id, 'smile') })), d.match, () => ctx.done());
    });
    ctx.root.append(top, card, nav, goBtn, note);
    show();
  }

  /* ============ 11. QUEM SOU EU? ============ */
  function whoami(ctx) {
    const ord = ctx.m.data.order;
    const all = Object.keys(BIOS);
    let r = 0;
    const top = bar(ctx, 'Leia a pista e toque na personalidade certa.', '');
    const counter = el('<span class="counter"></span>'); top.appendChild(counter);
    const box = el('<div class="card"></div>');
    ctx.root.append(top, box);
    function round() {
      const id = ord[r], b = BIOS[id];
      let shown = 1, solved = false;
      counter.textContent = `Rodada ${r + 1} de ${ord.length}`;
      box.innerHTML = `<h3>🕵️ Quem sou eu?</h3><div class="who-clues"></div>
        <div class="row" style="margin-top:10px"><button class="btn small more">➕ Mais uma pista</button></div>
        <div class="who-grid"></div>`;
      const clues = $('.who-clues', box), more = $('.more', box);
      const addClue = () => { clues.appendChild(el(`<div class="clue">Pista ${shown}: ${esc(b.clues[shown - 1])}</div>`)); more.disabled = shown >= b.clues.length; };
      addClue();
      more.addEventListener('click', () => { if (shown < b.clues.length && !solved) { shown++; ctx.mistake(0.5); SFX.play('flip'); addClue(); } });
      const grid = $('.who-grid', box);
      all.forEach(pid => {
        const o = el(`<button class="who-opt">${portrait(pid, 'smile')}<span>${esc(BIOS[pid].name)}</span></button>`);
        o.addEventListener('click', () => {
          if (solved || o.disabled) return;
          if (pid === id) {
            solved = true;
            o.classList.add('right'); SFX.play('ok');
            more.disabled = true;
            const last = r === ord.length - 1;
            ctx.feedback('ok', `<b>Isso! Eu sou ${esc(b.name)}.</b> ${esc(b.facts[b.facts.length - 1])}`, { button: last ? 'Concluir ✔' : 'Próxima rodada ➜', onButton: () => { ctx.feedback(null); if (last) ctx.done({ thresholds: [2, 5] }); else { r++; round(); } } });
          } else {
            SFX.play('bad'); ctx.mistake();
            o.classList.add('wrong'); o.disabled = true;
            if (shown < b.clues.length) { shown++; addClue(); }
            ctx.feedback('bad', `Não é ${esc(BIOS[pid].name)}. Leia ${shown > 1 ? 'a nova pista' : 'a pista'} com atenção.`);
          }
        });
        grid.appendChild(o);
      });
    }
    round();
  }

  /* ============ 12. COMPLETAR LACUNAS ============ */
  function fillblank(ctx) {
    const d = ctx.m.data;
    let left = d.sentences.length, sel = null;
    const top = bar(ctx, 'Arraste a palavra para o espaço, ou toque na palavra e depois no espaço.', `Faltam: ${left}`);
    const counter = $('.counter', top);
    const list = el('<div class="fills"></div>');
    const sents = shuffle(d.sentences.map((s, k) => Object.assign({ k }, s)));
    sents.forEach(s => {
      const [a, b] = s.b.split('___');
      const row = el(`<div class="fill">${s.p ? portrait(s.p, 'smile') : '<span style="font-size:1.8rem">💬</span>'}<span>${esc(a)}<button class="blank" data-k="${s.k}" aria-label="Espaço para completar">?</button>${esc(b)}</span></div>`);
      const blank = $('.blank', row);
      blank.addEventListener('click', () => { if (sel) put(sel, blank); else ctx.feedback('info', 'Primeiro toque em uma palavra do banco, depois no espaço.'); });
      list.appendChild(row);
    });
    const bank = el('<div class="word-bank" aria-label="Banco de palavras"></div>');
    function put(chip, blank) {
      if (blank.classList.contains('filled')) return;
      const s = d.sentences[+blank.dataset.k];
      if (chip.dataset.w === s.a) {
        SFX.play('ok');
        blank.textContent = s.a; blank.classList.add('filled'); blank.disabled = true;
        chip.remove(); sel = null;
        left--; counter.textContent = `Faltam: ${left}`;
        ctx.feedback('ok', `<b>Certo!</b> "${esc(s.b.replace('___', s.a))}"`);
        if (left === 0) setTimeout(() => ctx.done(), 1100);
      } else {
        SFX.play('bad'); ctx.mistake();
        chip.classList.remove('sel'); sel = null;
        [chip, blank].forEach(x => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 450); });
        ctx.feedback('bad', `<b>"${esc(chip.dataset.w)}"</b> não completa essa frase. Leia a frase inteira e tente outra palavra.`);
      }
    }
    shuffle(d.sentences.map(s => s.a).concat(d.extra || [])).forEach(w => {
      const c = el(`<button class="chip" data-w="${esc(w)}">${esc(w)}</button>`);
      dragTap(c, {
        targetSel: '.blank:not(.filled)',
        onDrop: (t) => put(c, t),
        onTap: () => { SFX.play('click'); $$('.chip.sel', bank).forEach(x => x.classList.remove('sel')); sel = c; c.classList.add('sel'); }
      });
      bank.appendChild(c);
    });
    ctx.root.append(top, list, bank);
  }

  /* ============ 13. FRASES QUE TRANSFORMAM ============ */
  function sentences(ctx) {
    const items = ctx.m.data.items;
    let i = 0;
    const made = [];
    const top = bar(ctx, 'Escolha o final que completa a frase com respeito.', '');
    const counter = el('<span class="counter"></span>'); top.appendChild(counter);
    const box = el('<div class="card"></div>');
    ctx.root.append(top, box);
    function show() {
      const it = items[i];
      counter.textContent = `Frase ${i + 1} de ${items.length}`;
      box.innerHTML = `<div class="sentence">${esc(it.s)} <span class="end">______</span></div><div class="endings"></div>`;
      const en = $('.endings', box);
      it.o.forEach(o => {
        const b = el(`<button class="choice ending"><span class="ce">✍️</span><span>${esc(o.t)}</span></button>`);
        b.addEventListener('click', () => {
          if (b.disabled) return;
          if (o.ok) {
            SFX.play('ok');
            const full = it.s.replace(/\.\.\.$/, '') + ' ' + o.t;
            made.push(full);
            $('.end', box).textContent = o.t;
            $$('.ending', en).forEach(x => x.disabled = true);
            b.style.background = 'var(--ok-bg)';
            const last = i === items.length - 1;
            ctx.feedback('ok', `<b>Frase criada!</b> Ela foi para o seu Caderno de Frases. 📒`, { button: last ? 'Ver meu caderno ➜' : 'Próxima frase ➜', onButton: () => { ctx.feedback(null); if (last) notebook(); else { i++; show(); } } });
          } else {
            SFX.play('bad'); ctx.mistake();
            b.disabled = true; b.classList.add('tried', 'shake');
            ctx.feedback('bad', `<b>Esse final não combate o racismo.</b> ${esc(o.why)}`);
          }
        });
        en.appendChild(b);
      });
    }
    function notebook() {
      const st = ctx.state;
      made.forEach(p => { if (!st.phrases.includes(p)) st.phrases.push(p); });
      ctx.save();
      box.innerHTML = `<div class="notebook"><h3>📒 Meu Caderno de Frases</h3><ol>${made.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div>
        <h3 style="margin-top:16px">✏️ Quer escrever a sua própria frase? (opcional)</h3>
        <p class="note">Não escreva nomes de pessoas. A frase fica salva só neste aparelho e pode ir para o cartaz final.</p>
        <textarea maxlength="90" rows="2" placeholder="Ex.: Na nossa turma, todo mundo é respeitado."></textarea>
        <div class="row center" style="margin-top:12px"><button class="btn big pdf">📄 Baixar PDF do caderno</button><button class="btn go big">Concluir ✔</button></div>`;
      const ta = $('textarea', box);
      ta.value = st.customPhrase || '';
      const pdf = $('.pdf', box);
      pdf.addEventListener('click', async () => {
        SFX.play('click');
        st.customPhrase = ta.value.trim().slice(0, 90);
        ctx.save();
        pdf.disabled = true;
        try {
          await svgToPDF(notebookSVG(made, st.customPhrase), 1200, 1600, 'caderno-de-frases-missao-respeito.pdf', 'Caderno de Frases - Missao Respeito');
          toast('PDF do caderno salvo! Procure na pasta de downloads.');
        } catch (e) { toast(PDF_FAIL, 4000); }
        pdf.disabled = false;
      });
      $('.btn.go', box).addEventListener('click', () => {
        st.customPhrase = ta.value.trim().slice(0, 90);
        ctx.save();
        ctx.done();
      });
    }
    show();
  }

  /* Página do Caderno de Frases (SVG em pé, 1200×1600) para o PDF */
  function notebookSVG(phrases, custom) {
    const W = 1200, H = 1600, L = 64, top = 330, x = 190, maxChars = 40;
    const rows = [];
    phrases.forEach((p, i) => wrapText(p, maxChars).forEach((l, k) => rows.push({ t: l, n: k === 0 ? `${i + 1}.` : '', b: false })));
    if (custom) {
      rows.push({ t: '', n: '' });
      rows.push({ t: 'Minha frase:', n: '★', b: true, c: '#6A4CE0' });
      wrapText(custom, maxChars).forEach(l => rows.push({ t: l, n: '', b: true }));
    }
    const nLines = 16;
    let lines = '';
    for (let i = 0; i < nLines; i++) lines += `<line x1="70" y1="${top + i * L + 18}" x2="${W - 70}" y2="${top + i * L + 18}" stroke="#BFD7FF" stroke-width="3"/>`;
    const text = rows.slice(0, nLines).map((r, i) => {
      const y = top + i * L;
      return (r.n ? `<text x="${x - 16}" y="${y}" text-anchor="end" font-size="38" font-weight="700" fill="#FF5C8A">${esc(r.n)}</text>` : '') +
        `<text x="${x}" y="${y}" font-size="40" font-weight="${r.b ? 700 : 600}" fill="${r.c || '#2B2140'}">${esc(r.t)}</text>`;
    }).join('');
    const holes = Array.from({ length: 12 }, (_, i) => `<circle cx="56" cy="${150 + i * 118}" r="16" fill="#FFF8EC" stroke="#2B2140" stroke-width="3"/>`).join('');
    const crew = ['luna', 'ayo', 'kiara', 'kaua', 'mei', 'theo'];
    const faces = crew.map((k, i) => portrait(k, 'happy').replace('<svg ', `<svg x="${W / 2 - 3 * 116 + i * 116 + 8}" y="${H - 250}" width="100" height="108" `)).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif">
      {{FONT}}
      <rect width="${W}" height="${H}" fill="#FFF8EC"/>
      <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="34" fill="#fff" stroke="#2B2140" stroke-width="6"/>
      ${holes}
      <rect x="20" y="20" width="${W - 40}" height="200" rx="34" fill="#FFC531"/>
      <rect x="20" y="180" width="${W - 40}" height="40" fill="#FFC531"/>
      <line x1="20" y1="220" x2="${W - 20}" y2="220" stroke="#2B2140" stroke-width="5"/>
      <text x="${W / 2}" y="118" text-anchor="middle" font-size="68" font-weight="700" fill="#2B2140">Meu Caderno de Frases</text>
      <text x="${W / 2}" y="182" text-anchor="middle" font-size="32" font-weight="500" fill="#2B2140">Frases para uma escola sem racismo</text>
      <line x1="${x - 60}" y1="236" x2="${x - 60}" y2="${H - 290}" stroke="#FF8A9A" stroke-width="3"/>
      ${lines}${text}
      ${faces}
      <text x="${W / 2}" y="${H - 80}" text-anchor="middle" font-size="28" fill="#4d4466">Missão Respeito · Uma escola sem racismo</text>
    </svg>`;
  }

  /* ============ 14. MURAL ============ */
  function mural(ctx) {
    const d = ctx.m.data;
    let pinnedN = 0, sel = null;
    const pinnedTexts = [];
    const top = bar(ctx, 'Arraste para o mural só as mensagens que combatem o racismo.', `No mural: 0 de ${d.need}`);
    const counter = $('.counter', top);
    const wrap = el('<div class="mural-area"><div class="notes"></div><button class="board" aria-label="Mural da escola"><h3>🏫 Mural: Escola sem Racismo</h3><div class="pinned"></div></button></div>');
    const notes = $('.notes', wrap), board = $('.board', wrap), pinned = $('.pinned', wrap);
    board.addEventListener('click', (e) => { if (e.target.closest('.note-card')) return; if (sel) pin(sel); else ctx.feedback('info', 'Primeiro toque em uma mensagem, depois no mural.'); });
    function pin(card) {
      const it = d.items[+card.dataset.k];
      card.classList.remove('sel'); sel = null;
      if (it.ok) {
        SFX.play('ok');
        const pc = el(`<span class="note-card">${esc(it.t)}</span>`);
        pc.style.setProperty('--r', (Math.random() * 6 - 3).toFixed(1) + 'deg');
        card.remove();
        pinned.appendChild(pc);
        pinnedTexts.push(it.t);
        pinnedN++; counter.textContent = `No mural: ${pinnedN} de ${d.need}`;
        pdf.disabled = false;
        if (pinnedN === d.need) {
          SFX.play('win');
          ctx.feedback('ok', `<b>Mural completo!</b> Todas as mensagens que combatem o racismo estão no mural. Se quiser, baixe o PDF antes de concluir.`, { button: 'Concluir ✔', onButton: () => ctx.done() });
        } else {
          ctx.feedback('ok', `<b>Ótima mensagem!</b> "${esc(it.t)}" foi para o mural.`);
        }
      } else {
        SFX.play('bad'); ctx.mistake();
        card.classList.add('rejected', 'shake'); card.disabled = true;
        ctx.feedback('bad', `<b>Essa mensagem não ajuda.</b> ${esc(it.why)}`);
      }
    }
    shuffle(d.items.map((x, k) => Object.assign({ k }, x))).forEach(it => {
      const c = el(`<button class="note-card" data-k="${it.k}">${esc(it.t)}</button>`);
      dragTap(c, {
        targetSel: '.board',
        canStart: () => !c.disabled,
        onDrop: () => pin(c),
        onTap: () => { if (c.disabled) return; SFX.play('click'); $$('.note-card.sel', notes).forEach(x => x.classList.remove('sel')); sel = c; c.classList.add('sel'); }
      });
      notes.appendChild(c);
    });
    const pdfRow = el('<div class="row center" style="margin-top:14px"><button class="btn pdf" disabled>📄 Baixar PDF do mural</button></div>');
    const pdf = $('.pdf', pdfRow);
    pdf.addEventListener('click', async () => {
      if (pdf.disabled || !pinnedTexts.length) return;
      SFX.play('click');
      pdf.disabled = true;
      try {
        await svgToPDF(muralSVG(pinnedTexts), 1600, 1131, 'mural-coletivo-missao-respeito.pdf', 'Mural coletivo - Missao Respeito');
        toast('PDF do mural salvo! Procure na pasta de downloads.');
      } catch (e) { toast(PDF_FAIL, 4000); }
      pdf.disabled = false;
    });
    ctx.root.append(top, wrap, pdfRow);
  }

  /* Mural coletivo (SVG deitado, 1600×1131) para o PDF */
  function muralSVG(texts) {
    const W = 1600, H = 1131;
    const colors = ['#FFF6B0', '#CDEBFF', '#FFD6E5'];
    const cols = 3, nw = 420, nh = 300, gx = 50, gy = 60;
    const x0 = (W - (cols * nw + (cols - 1) * gx)) / 2, y0 = 270;
    const notes = texts.slice(0, 9).map((t, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = x0 + c * (nw + gx), y = y0 + r * (nh + gy);
      const rot = [-2.5, 1.8, -1.2, 2.2, -1.8, 1.4, -2, 2.4, -1.4][i];
      const lines = wrapText(t, 18);
      const ty = y + nh / 2 - (lines.length - 1) * 24 + 14;
      return `<g transform="rotate(${rot} ${x + nw / 2} ${y + nh / 2})">
        <rect x="${x + 6}" y="${y + 10}" width="${nw}" height="${nh}" rx="14" fill="#000" opacity=".18"/>
        <rect x="${x}" y="${y}" width="${nw}" height="${nh}" rx="14" fill="${colors[i % 3]}" stroke="#2B2140" stroke-width="5"/>
        ${lines.map((l, k) => `<text x="${x + nw / 2}" y="${ty + k * 48}" text-anchor="middle" font-size="38" font-weight="700" fill="#2B2140">${esc(l)}</text>`).join('')}
        <circle cx="${x + nw / 2}" cy="${y + 8}" r="16" fill="#E53950" stroke="#2B2140" stroke-width="3"/><circle cx="${x + nw / 2 - 5}" cy="${y + 3}" r="5" fill="#fff" opacity=".7"/>
      </g>`;
    }).join('');
    let dots = '';
    for (let yy = 120; yy < H - 60; yy += 34) for (let xx = 60 + (yy % 68 ? 17 : 0); xx < W - 60; xx += 34) dots += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="#b67c4b"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif">
      {{FONT}}
      <rect width="${W}" height="${H}" fill="#8B5A3C"/>
      <rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="20" fill="#C98D5A" stroke="#5e3a22" stroke-width="6"/>
      ${dots}
      <rect x="${W / 2 - 430}" y="80" width="860" height="110" rx="22" fill="#FF5C8A" stroke="#2B2140" stroke-width="6"/>
      <text x="${W / 2}" y="153" text-anchor="middle" font-size="56" font-weight="700" fill="#fff">Mural: Escola sem Racismo</text>
      ${notes}
      <rect x="${W / 2 - 330}" y="${H - 104}" width="660" height="50" rx="25" fill="#fff" opacity=".9"/>
      <text x="${W / 2}" y="${H - 70}" text-anchor="middle" font-size="28" fill="#2B2140">Missão Respeito · Mural coletivo da turma</text>
    </svg>`;
  }

  /* ============ 15. ESTÚDIO DE CARTAZ ============ */
  function wrapText(t, max) {
    const words = String(t).split(/\s+/); const lines = []; let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur);
    return lines;
  }
  function frameSVG(id, col) {
    let s = '';
    const pts = [];
    for (let x = 30; x <= 570; x += 60) { pts.push([x, 22]); pts.push([x, 778]); }
    for (let y = 82; y <= 718; y += 60) { pts.push([22, y]); pts.push([578, y]); }
    const cols = ['#FF5C8A', '#FFC531', '#14A098', '#6A4CE0', '#FF8A3D'];
    switch (id) {
      case 'stars': pts.forEach(([x, y], i) => s += `<path transform="translate(${x - 14},${y - 14}) scale(.44)" d="M32 4 L40 23 L60 24 L44 37 L50 58 L32 46 L14 58 L20 37 L4 24 L24 23Z" fill="${cols[i % 5]}"/>`); break;
      case 'hearts': pts.forEach(([x, y], i) => s += `<path transform="translate(${x - 13},${y - 13}) scale(.42)" d="M32 56 Q4 36 8 18 Q14 4 32 16 Q50 4 56 18 Q60 36 32 56Z" fill="${cols[(i + 2) % 5]}"/>`); break;
      case 'dots': pts.forEach(([x, y], i) => s += `<circle cx="${x}" cy="${y}" r="11" fill="${cols[i % 5]}"/>`); break;
      case 'stripes': cols.forEach((c, i) => { s += `<rect x="0" y="${i * 9}" width="600" height="9" fill="${c}"/><rect x="0" y="${755 + i * 9}" width="600" height="9" fill="${c}"/>`; }); break;
    }
    return s;
  }
  function posterSVG(p, opts = {}) {
    const col = POSTER.colors.find(c => c.id === p.color) || POSTER.colors[0];
    const tl = wrapText(p.title || 'Escolha um título', 17);
    const ts = tl.length > 3 ? 38 : 46;
    const title = tl.map((l, i) => `<text x="300" y="${92 + i * (ts + 6)}" text-anchor="middle" font-size="${ts}" font-weight="700" fill="${col.ink}">${esc(l)}</text>`).join('');
    const artY = 92 + tl.length * (ts + 6) + 10;
    const art = p.art ? `<g transform="translate(66,${artY}) scale(1.8)">${posterArt(p.art)}</g>` : `<rect x="90" y="${artY + 10}" width="420" height="190" rx="20" fill="none" stroke="${col.ink}" stroke-width="4" stroke-dasharray="12 10" opacity=".4"/><text x="300" y="${artY + 115}" text-anchor="middle" font-size="26" fill="${col.ink}" opacity=".5">Escolha uma ilustração</text>`;
    const pl = wrapText(p.phrase || 'Escolha uma mensagem', 26);
    const pY = 540, pH = Math.max(120, 40 + pl.length * 40);
    const phrase = `<rect x="50" y="${pY}" width="500" height="${pH}" rx="24" fill="#fff" stroke="${col.accent}" stroke-width="6"/>` +
      pl.map((l, i) => `<text x="300" y="${pY + pH / 2 + 11 + (i - (pl.length - 1) / 2) * 40}" text-anchor="middle" font-size="31" font-weight="600" fill="#2B2140">${esc(l)}</text>`).join('');
    const stickers = (p.stickers || []).map((s, i) => `<g class="stk ${opts.active === i ? 'active' : ''}" data-i="${i}" transform="translate(${s.x},${s.y}) scale(${s.s})"><rect class="selbox" x="-4" y="-4" width="72" height="72" rx="10" fill="none" stroke="#3D8BFF" stroke-width="4" stroke-dasharray="8 6" style="display:${opts.active === i ? 'block' : 'none'}"/>${iconInner(s.n)}</g>`).join('');
    return `<svg class="poster-svg" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" font-family="Fredoka, 'Arial Rounded MT Bold', Arial, sans-serif" role="img" aria-label="Cartaz: ${esc(p.title || '')}">
      ${opts.fontStyle || ''}
      <rect width="600" height="800" fill="${col.bg}"/>
      ${frameSVG(p.frame, col)}
      ${title}${art}${phrase}
      <text x="300" y="${p.frame === 'stripes' ? 742 : 748}" text-anchor="middle" font-size="18" fill="${col.ink}" opacity=".75">Missão Respeito • Uma escola sem racismo</text>
      <g class="stickers">${stickers}</g>
    </svg>`;
  }

  let fontDataCache = null;
  async function fontCSS() {
    if (fontDataCache !== null) return fontDataCache;
    try {
      const r = await fetch('assets/fonts/fredoka.woff2');
      const buf = await r.arrayBuffer();
      let bin = ''; const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      fontDataCache = `<style>@font-face{font-family:'Fredoka';src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2');font-weight:300 700;}</style>`;
    } catch (e) { fontDataCache = ''; }
    return fontDataCache;
  }
  /* Desenha um SVG (texto) num canvas. O SVG deve conter {{FONT}} onde entra a fonte. */
  async function svgToCanvas(svgText, w, h) {
    const style = await fontCSS();
    const svg = svgText.replace('{{FONT}}', style);
    const img = new Image();
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    return cv;
  }
  function saveHref(href, name) {
    const a = document.createElement('a');
    a.download = name; a.href = href;
    document.body.appendChild(a); a.click(); a.remove();
  }
  async function svgToPNG(svgText, w, h, name) {
    const cv = await svgToCanvas(svgText, w, h);
    saveHref(cv.toDataURL('image/png'), name);
  }
  function posterForExport(p) {
    return posterSVG(p, { fontStyle: '{{FONT}}' }).replace('class="poster-svg"', 'width="1200" height="1600"');
  }
  function downloadPNG(p, name) {
    return svgToPNG(posterForExport(p), 1200, 1600, name);
  }

  /* PDF de uma página A4 com a imagem (JPEG) centralizada. Feito sem bibliotecas externas. */
  function jpegToPDF(jpegBytes, imgW, imgH, title) {
    const enc = new TextEncoder();
    // A4: em pé para imagens verticais (cartazes), deitada para horizontais (certificado)
    const land = imgW > imgH;
    const pageW = land ? 841.89 : 595.28, pageH = land ? 595.28 : 841.89, margin = land ? 24 : 36;
    const scale = Math.min((pageW - 2 * margin) / imgW, (pageH - 2 * margin) / imgH);
    const dw = +(imgW * scale).toFixed(2), dh = +(imgH * scale).toFixed(2);
    const dx = +((pageW - dw) / 2).toFixed(2), dy = +((pageH - dh) / 2).toFixed(2);
    const content = `q ${dw} 0 0 ${dh} ${dx} ${dy} cm /Im0 Do Q`;
    const parts = [];
    let size = 0;
    const offsets = [];
    const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); size += b.length; };
    const obj = (n, body) => { offsets[n] = size; push(`${n} 0 obj\n${body}\nendobj\n`); };
    push(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10])); // %PDF-1.4 + marcador binário
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    offsets[4] = size;
    push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    push(jpegBytes);
    push('\nendstream\nendobj\n');
    obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    obj(6, `<< /Title (${title}) /Producer (Missao Respeito) >>`);
    const xref = size;
    let x = 'xref\n0 7\n0000000000 65535 f \n';
    for (let i = 1; i <= 6; i++) x += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    push(x + 'trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(parts, { type: 'application/pdf' });
  }
  /* Converte um SVG (texto, com {{FONT}}) em PDF A4 e baixa o arquivo. */
  async function svgToPDF(svgText, w, h, name, title) {
    const cv = await svgToCanvas(svgText, w, h);
    const b64 = cv.toDataURL('image/jpeg', 0.92).split(',')[1];
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = jpegToPDF(bytes, w, h, title || 'Missao Respeito');
    const url = URL.createObjectURL(blob);
    saveHref(url, name);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function downloadPDF(p, name, title) {
    return svgToPDF(posterForExport(p), 1200, 1600, name, title || 'Cartaz - Missao Respeito');
  }
  const PDF_FAIL = 'Não foi possível criar o PDF neste navegador. Use "Imprimir" e escolha "Salvar como PDF".';
  function printPoster(p) {
    const holder = el(`<div class="print-target" style="display:none">${posterSVG(p)}</div>`);
    document.getElementById('app').appendChild(holder);
    document.body.classList.add('print-poster');
    const after = () => { document.body.classList.remove('print-poster'); holder.remove(); window.removeEventListener('afterprint', after); };
    window.addEventListener('afterprint', after);
    setTimeout(() => { window.print(); setTimeout(after, 1500); }, 50);
  }

  function pdfButton(btn, p, mode = 'campaign') {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      SFX.play('click');
      btn.disabled = true;
      try {
        if (mode === 'campaign') await downloadPDF(p, 'cartaz-campanha-missao-respeito.pdf', 'Cartaz da campanha - Missao Respeito');
        else await downloadPDF(p, 'cartaz-missao-respeito.pdf', 'Cartaz da Oficina - Missao Respeito');
        toast('PDF do cartaz salvo! Procure na pasta de downloads.'); }
      catch (e) { toast(PDF_FAIL, 4000); }
      btn.disabled = false;
    });
  }

  /* Estúdio reutilizável. mode: 'workshop' (m23) ou 'campaign' (m25) */
  function studio(ctx, mode, onFinish) {
    const st = ctx.state;
    const key = mode === 'campaign' ? 'campaign' : 'workshop';
    const titles = mode === 'campaign' ? null : ctx.m.data.titles;
    const p = Object.assign({ color: null, frame: 'none', art: null, title: mode === 'campaign' ? ctx.m.data.title : null, phrase: null, stickers: [] }, st.posters[key] || {});
    if (mode === 'campaign') p.title = ctx.m.data.title;
    let active = -1;
    const phrases = Array.from(new Set(POSTER.phrases.concat(st.phrases || []).concat(st.customPhrase ? [st.customPhrase] : [])));
    const wrap = el(`<div class="poster-studio"><div class="poster-box"><div class="pv"></div>
      <div class="row center no-print" style="margin-top:10px"><button class="btn small rm" disabled>🗑️ Remover adesivo</button><button class="btn small up" disabled>➕</button><button class="btn small dn" disabled>➖</button></div></div>
      <div class="tools"></div></div>`);
    const pv = $('.pv', wrap), tools = $('.tools', wrap);
    const checks = el('<div class="checklist" aria-live="polite"></div>');
    function reqs() {
      const r = [];
      if (titles) r.push(['Título', !!p.title]);
      r.push(['Cor', !!p.color], ['Ilustração', !!p.art], ['Mensagem', !!p.phrase]);
      if (mode === 'campaign') r.push(['Elemento gráfico', p.frame !== 'none' || p.stickers.length > 0]);
      else r.push([`${ctx.m.data.minStickers} adesivos`, p.stickers.length >= ctx.m.data.minStickers]);
      return r;
    }
    function render() {
      pv.innerHTML = posterSVG(p, { active });
      const svg = $('svg', pv);
      bindStickers(svg);
      const r = reqs();
      checks.innerHTML = r.map(([n, ok]) => `<span class="${ok ? 'ok' : ''}">${ok ? '✅' : '⬜'} ${n}</span>`).join('');
      finishBtn.disabled = !r.every(x => x[1]);
      $('.rm', wrap).disabled = $('.up', wrap).disabled = $('.dn', wrap).disabled = active < 0;
      st.posters[key] = p; ctx.save();
    }
    function bindStickers(svg) {
      const toSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
      $$('.stk', svg).forEach(g => {
        g.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          const i = +g.dataset.i; const s = p.stickers[i];
          active = i;
          const start = toSvg(e), ox = s.x, oy = s.y;
          $$('.stk .selbox', svg).forEach(b => b.style.display = 'none');
          $('.selbox', g).style.display = 'block';
          $('.rm', wrap).disabled = $('.up', wrap).disabled = $('.dn', wrap).disabled = false;
          const move = (ev) => {
            const q = toSvg(ev);
            s.x = Math.max(-20, Math.min(560, ox + q.x - start.x));
            s.y = Math.max(-20, Math.min(760, oy + q.y - start.y));
            g.setAttribute('transform', `translate(${s.x},${s.y}) scale(${s.s})`);
          };
          const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); st.posters[key] = p; ctx.save(); };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
        });
      });
    }
    $('.rm', wrap).addEventListener('click', () => { if (active >= 0) { p.stickers.splice(active, 1); active = -1; SFX.play('click'); render(); } });
    $('.up', wrap).addEventListener('click', () => { if (active >= 0) { p.stickers[active].s = Math.min(2.2, p.stickers[active].s + .2); render(); } });
    $('.dn', wrap).addEventListener('click', () => { if (active >= 0) { p.stickers[active].s = Math.max(.5, p.stickers[active].s - .2); render(); } });

    function section(title, inner) {
      const s = el(`<div class="tool card"><h4>${title}</h4><div class="opts"></div></div>`);
      inner($('.opts', s)); tools.appendChild(s); return s;
    }
    if (titles) section('🔤 1. Título', box => {
      titles.forEach(t => {
        const b = el(`<button class="opt">${esc(t.t)}</button>`);
        if (p.title === t.t) b.classList.add('on');
        b.addEventListener('click', () => {
          if (!t.ok) { SFX.play('bad'); ctx.mistake(); b.classList.add('no', 'shake'); b.disabled = true; ctx.feedback('bad', `<b>Esse título não serve.</b> ${esc(t.why)}`); return; }
          SFX.play('click'); p.title = t.t; $$('.opt', box).forEach(x => x.classList.remove('on')); b.classList.add('on'); render();
        });
        box.appendChild(b);
      });
    });
    else tools.appendChild(el(`<div class="tool card"><h4>🔤 Título da campanha</h4><b>${esc(p.title)}</b></div>`));
    section('🎨 Cor de fundo', box => {
      POSTER.colors.forEach(c => {
        const b = el(`<button class="swatch" style="background:${c.bg}" aria-label="Cor ${c.name}" title="${c.name}"></button>`);
        if (p.color === c.id) b.classList.add('on');
        b.addEventListener('click', () => { SFX.play('click'); p.color = c.id; $$('.swatch', box).forEach(x => x.classList.remove('on')); b.classList.add('on'); render(); });
        box.appendChild(b);
      });
    });
    section('🖼️ Ilustração', box => {
      POSTER.arts.forEach(a => {
        const b = el(`<button class="opt">${esc(a.name)}</button>`);
        if (p.art === a.id) b.classList.add('on');
        b.addEventListener('click', () => { SFX.play('click'); p.art = a.id; $$('.opt', box).forEach(x => x.classList.remove('on')); b.classList.add('on'); render(); });
        box.appendChild(b);
      });
    });
    section('💬 Mensagem', box => {
      phrases.forEach(t => {
        const b = el(`<button class="opt">${esc(t)}</button>`);
        if (p.phrase === t) b.classList.add('on');
        b.addEventListener('click', () => { SFX.play('click'); p.phrase = t; $$('.opt', box).forEach(x => x.classList.remove('on')); b.classList.add('on'); render(); });
        box.appendChild(b);
      });
    });
    section('🔲 Moldura', box => {
      POSTER.frames.forEach(f => {
        const b = el(`<button class="opt">${esc(f.name)}</button>`);
        if (p.frame === f.id) b.classList.add('on');
        b.addEventListener('click', () => { SFX.play('click'); p.frame = f.id; $$('.opt', box).forEach(x => x.classList.remove('on')); b.classList.add('on'); render(); });
        box.appendChild(b);
      });
    });
    section('⭐ Adesivos <small style="font-weight:500">(toque para colocar, arraste no cartaz para mover)</small>', box => {
      POSTER.stickers.forEach(n => {
        const b = el(`<button class="stk-btn" aria-label="Adesivo ${n}">${icon(n)}</button>`);
        b.addEventListener('click', () => {
          if (p.stickers.length >= 14) { toast('Já tem muitos adesivos! Remova algum para colocar outro.'); return; }
          SFX.play('star');
          p.stickers.push({ n, x: 60 + Math.round(Math.random() * 420), y: 300 + Math.round(Math.random() * 200), s: 1 });
          active = p.stickers.length - 1; render();
        });
        box.appendChild(b);
      });
    });
    const finishRow = el(`<div class="card"><h4 style="margin:0 0 8px">📋 Lista do cartaz</h4></div>`);
    finishRow.appendChild(checks);
    const actions = el(`<div class="row" style="margin-top:12px"><button class="btn small pr">🖨️ Imprimir</button><button class="btn small dl">💾 Salvar imagem</button><button class="btn small pdf">📄 Baixar PDF</button><span class="spacer"></span></div>`);
    const finishBtn = el(`<button class="btn go">${mode === 'campaign' ? 'Revisar campanha ➜' : 'Terminar cartaz ✔'}</button>`);
    actions.appendChild(finishBtn);
    finishRow.appendChild(actions);
    tools.insertBefore(finishRow, tools.firstChild);
    $('.pr', actions).addEventListener('click', () => printPoster(p));
    $('.dl', actions).addEventListener('click', () => downloadPNG(p, mode === 'campaign' ? 'cartaz-campanha-missao-respeito.png' : 'cartaz-missao-respeito.png').catch(() => toast('Não foi possível salvar a imagem neste navegador. Use "Imprimir".')));
    pdfButton($('.pdf', actions), p, mode);
    finishBtn.addEventListener('click', () => { if (!finishBtn.disabled) { SFX.play('ok'); onFinish(p); } });
    ctx.root.appendChild(wrap);
    render();
    return { posterSVG };
  }

  function poster(ctx) {
    ctx.root.appendChild(bar(ctx, 'Siga a lista: título, cor, ilustração, mensagem e adesivos.', ''));
    studio(ctx, 'workshop', () => ctx.done());
  }

  /* ============ 16. CAMPANHA FINAL ============ */
  function campaign(ctx) {
    const d = ctx.m.data, st = ctx.state;
    const stepsBar = el('<div class="steps-bar"><span>1. Ações</span><span>2. Cartaz</span><span>3. Lançamento</span></div>');
    const body = el('<div></div>');
    ctx.root.append(stepsBar, body);
    const setStep = (n) => $$('span', stepsBar).forEach((s, i) => s.classList.toggle('on', i === n));
    const chosen = new Set();
    function step1() {
      setStep(0); body.innerHTML = '';
      body.appendChild(bar(ctx, `Escolha pelo menos ${d.minGood} ações que ajudam a combater o racismo.`, ''));
      const grid = el('<div class="actions-grid"></div>');
      const next = el(`<div class="row center" style="margin-top:16px"><button class="btn go big" disabled>Próximo: montar o cartaz ➜</button></div>`);
      d.actions.forEach((a, k) => {
        const b = el(`<button class="action" aria-pressed="false"><span class="ae">${a.icon}</span><span>${esc(a.t)}</span></button>`);
        b.addEventListener('click', () => {
          if (b.disabled) return;
          if (a.ok) {
            if (chosen.has(k)) { chosen.delete(k); b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); SFX.play('click'); }
            else { chosen.add(k); b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); SFX.play('ok'); ctx.feedback('ok', `<b>Boa ação!</b> "${esc(a.t)}" entrou na campanha.`); }
          } else {
            SFX.play('bad'); ctx.mistake();
            b.classList.add('no', 'shake'); b.disabled = true;
            ctx.feedback('bad', `<b>Essa ação não ajuda.</b> ${esc(a.why)}`);
          }
          $('button', next).disabled = chosen.size < d.minGood;
        });
        grid.appendChild(b);
      });
      $('button', next).addEventListener('click', () => { st.campaign = [...chosen].map(k => d.actions[k].t); ctx.save(); ctx.feedback(null); step2(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      body.append(grid, next);
    }
    function step2() {
      setStep(1); body.innerHTML = '';
      const sub = { root: body, m: ctx.m, state: st, save: ctx.save, mistake: ctx.mistake, feedback: ctx.feedback };
      body.appendChild(bar(ctx, 'Monte o cartaz oficial: escolha frase, cores, ilustração e elementos gráficos.', ''));
      studio(sub, 'campaign', (p) => { ctx.feedback(null); step3(p); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    function step3(p) {
      setStep(2); body.innerHTML = '';
      const v = el(`<div class="poster-studio"><div class="poster-box">${posterSVG(p)}</div>
        <div class="card"><h3>📣 Plano da campanha</h3><p><b>${esc(d.title)}</b></p>
        <ol>${(st.campaign || []).map(a => `<li>${esc(a)}</li>`).join('')}</ol>
        <p class="note">Converse com a professora ou o professor sobre como colocar essas ações em prática na escola!</p>
        <div class="row"><button class="btn small back">⬅ Voltar ao cartaz</button><button class="btn small pr">🖨️ Imprimir</button><button class="btn small dl">💾 Salvar imagem</button><button class="btn small pdf">📄 Baixar PDF</button></div>
        <div class="row center" style="margin-top:16px"><button class="btn go big launch">🚀 Lançar a campanha!</button></div></div></div>`);
      $('.back', v).addEventListener('click', step2);
      $('.pr', v).addEventListener('click', () => printPoster(p));
      $('.dl', v).addEventListener('click', () => downloadPNG(p, 'cartaz-campanha-missao-respeito.png').catch(() => toast('Não foi possível salvar a imagem neste navegador. Use "Imprimir".')));
      pdfButton($('.pdf', v), p);
      $('.launch', v).addEventListener('click', () => ctx.done());
      body.appendChild(v);
    }
    step1();
  }

  window.ACT = { classify, scene, traffic, fixit, memory, match, puzzle, order, story, bios, whoami, fillblank, sentences, mural, poster, campaign, posterSVG, printPoster, bioCard, svgToPNG, svgToPDF };
})();
