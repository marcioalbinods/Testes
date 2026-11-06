/* Teste completo no navegador: joga as 15 missões pela interface (toque, arraste, setas e teclado),
   confere pontuação, desbloqueio, medalhas, progresso salvo, pausa, modo professor,
   tamanhos de tela e erros de execução.
   Rodar (precisa do Playwright):  node tests/teste-completo.js
   Capturas de tela vão para tests/capturas/ */
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(__dirname, 'capturas');
fs.mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      let f = decodeURIComponent(req.url.split('?')[0]);
      if (f.endsWith('/')) f += 'index.html';
      const file = path.join(ROOT, f);
      if (!file.startsWith(ROOT) || !fs.existsSync(file)) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(rsp);
    }).listen(0, () => res(srv));
  });
}

let fails = 0, oks = 0;
const ok = (cond, msg) => { if (cond) oks++; else { fails++; console.error('  FALHOU:', msg); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const srv = await serve();
  const URL = `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch();
  const errors = [];
  const watch = (p) => {
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  };

  async function newPage(viewport, touch) {
    const ctx = await browser.newContext({ viewport, hasTouch: !!touch, isMobile: false });
    await ctx.addInitScript(() => { window.OQVP_SPEED = 0.04; });
    const p = await ctx.newPage(); watch(p);
    await p.goto(URL);
    return p;
  }

  const bubble = (p) => p.textContent('.bubble-text');
  const waitNext = (p) => p.waitForFunction(() => !document.querySelector('.sim-panel') && /PRÓXIMO DESAFIO|CONCLUIR MISSÃO/.test(document.querySelector('.actions .action').textContent), null, { timeout: 30000 });
  const waitIdle = async (p) => { await p.waitForFunction(() => !document.querySelector('.sim-panel')); await sleep(60); };

  // Toca no cartão (pointerdown/up sem mover).
  async function tapCard(p, sel) { await p.click(sel); await sleep(40); }

  // Arraste com mouse.
  async function dragMouse(p, fromSel, toSel) {
    const a = await p.locator(fromSel).boundingBox(); const b = await p.locator(toSel).boundingBox();
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 3);
    await p.mouse.down();
    for (let i = 1; i <= 8; i++) await p.mouse.move(a.x + a.width / 2 + (b.x - a.x) * i / 8, a.y + a.height / 3 + (b.y - a.y) * i / 8);
    await p.mouse.up(); await sleep(80);
  }
  // Arraste com o dedo (eventos de toque reais via CDP).
  async function dragTouch(p, fromSel, toSel) {
    const cdp = await p.context().newCDPSession(p);
    const a = await p.locator(fromSel).boundingBox(); const b = await p.locator(toSel).boundingBox();
    const x0 = a.x + a.width / 2, y0 = a.y + a.height / 3, x1 = b.x + b.width / 2, y1 = b.y + b.height / 3;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 10, y: y0 + (y1 - y0) * i / 10 }] });
      await sleep(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(100);
  }

  const domOrder = (p, row) => p.$$eval(`${row} .card`, (els) => els.map((e) => e.dataset.id));

  // Organiza a fileira até "target" trocando cartões por toque.
  async function arrangeByTaps(p, row, target) {
    for (let i = 0; i < target.length; i++) {
      const cur = await domOrder(p, row);
      if (cur[i] === target[i]) continue;
      await tapCard(p, `${row} .card[data-id="${cur[i]}"] .card-text`);
      await tapCard(p, `${row} .card[data-id="${target[i]}"] .card-text`);
    }
  }
  // Organiza usando as setas ◀ ▶.
  async function arrangeByArrows(p, row, target) {
    for (let i = 0; i < target.length; i++) {
      let cur = await domOrder(p, row);
      while (cur.indexOf(target[i]) > i) {
        await p.click(`${row} .card[data-id="${target[i]}"] .arrow.prev`); await sleep(30);
        cur = await domOrder(p, row);
      }
    }
  }

  async function info(p, n) {
    return p.evaluate((n) => {
      const m = OQVP.data.mission(n);
      return { m: JSON.parse(JSON.stringify(m)) };
    }, n);
  }

  async function stageOrder(p, n, st, mode, prev) {
    const row = '.order-row';
    const start = await domOrder(p, row);
    const target = await p.evaluate(({ n, st, start, prev }) => {
      const m = OQVP.data.mission(n);
      if (st.different) return OQVP.logic.validOrders(st.ids, m.cards).find((v) => !OQVP.logic.sameOrder(v, prev));
      return OQVP.logic.closestValid(start, m.cards);
    }, { n, st, start, prev });
    if (mode === 'wrong-first') {
      ok(!(await p.evaluate(({ n, start }) => OQVP.logic.isValidOrder(start, OQVP.data.mission(n).cards), { n, start })), `M${n}: começa embaralhado`);
      await p.click('.actions .action');
      await p.waitForFunction(() => /Pense|Será/.test(document.querySelector('.bubble-text').textContent));
      await waitIdle(p);
      const b = await bubble(p);
      ok(/Pense|Será/.test(b), `M${n}: feedback com pergunta depois do erro ("${b.slice(0, 60)}...")`);
      ok((await p.getAttribute('.pipo-svg', 'class')).includes('surprised'), `M${n}: Pipo surpreso ao errar`);
      await p.click('.actions .hint');
      ok((await bubble(p)).length > 10, `M${n}: dica aparece`);
      await arrangeByTaps(p, row, target);
    } else if (mode === 'drag-mouse' || mode === 'drag-touch') {
      for (let i = 0; i < target.length; i++) {
        const cur = await domOrder(p, row);
        if (cur[i] === target[i]) continue;
        const fn = mode === 'drag-mouse' ? dragMouse : dragTouch;
        await fn(p, `${row} .card[data-id="${target[i]}"]`, `${row} .card[data-id="${cur[i]}"]`);
      }
    } else if (mode === 'arrows') {
      await arrangeByArrows(p, row, target);
    } else if (mode === 'keyboard') {
      for (let i = 0; i < target.length; i++) {
        let cur = await domOrder(p, row);
        await p.focus(`${row} .card[data-id="${target[i]}"]`);
        while (cur.indexOf(target[i]) > i) { await p.keyboard.press('ArrowLeft'); await sleep(30); cur = await domOrder(p, row); }
      }
    } else if (st.different) {
      // primeiro tenta a mesma ordem: deve ser recusada
      await p.click('.actions .action'); await sleep(60);
      ok(/igual/.test(await bubble(p)), `M${n}: recusa repetir a mesma maneira`);
      await arrangeByTaps(p, row, target);
    } else {
      await arrangeByTaps(p, row, target);
    }
    const now = await domOrder(p, row);
    ok(JSON.stringify(now) === JSON.stringify(target), `M${n}: cartões ficaram na ordem desejada (${mode || 'toque'})`);
    await p.click('.actions .action');
    await waitNext(p);
    return now;
  }

  async function playMission(p, n, plan) {
    await p.click(`[data-mission="${n}"]`);
    await p.waitForSelector('.intro-ov');
    ok((await p.textContent('.intro h2')).length > 3, `M${n}: introdução`);
    await p.click('.intro .btn.go');
    await p.waitForSelector('.intro-ov', { state: 'detached' });
    const { m } = await info(p, n);
    let prev = null;
    for (let si = 0; si < m.stages.length; si++) {
      const st = m.stages[si];
      await p.waitForSelector(`.board-${st.type}`);
      if (st.type === 'order') prev = await stageOrder(p, n, st, plan.modes && plan.modes[si], prev);
      else if (st.type === 'next' || st.type === 'missing') {
        const answer = st.type === 'next' ? st.answer : st.seq[st.blank];
        if (plan.wrongChoice) {
          const wrong = st.options.find((o) => o !== answer);
          await p.click(`.options-row .card[data-id="${wrong}"]`);
          ok((await p.getAttribute(`.options-row .card[data-id="${wrong}"]`, 'class')).includes('tried'), `M${n}: opção errada marcada`);
          ok((await bubble(p)).length > 20, `M${n}: explicação da opção errada`);
        }
        if (plan.dragChoice) await dragMouse(p, `.options-row .card[data-id="${answer}"]`, '.card.slot');
        else await p.click(`.options-row .card[data-id="${answer}"]`);
        await p.waitForSelector('.card.filled');
      } else if (st.type === 'fix') {
        const pair = await p.evaluate(({ n, st }) => {
          const m = OQVP.data.mission(n);
          for (let i = 0; i < st.shown.length; i++) for (let j = i + 1; j < st.shown.length; j++) if (OQVP.logic.swapFixes(st.shown, i, j, m.cards).valid) return [st.shown[i], st.shown[j]];
        }, { n, st });
        if (plan.wrongFix) {
          const good = st.shown.filter((x) => !pair.includes(x));
          await tapCard(p, `.fix-row .card[data-id="${good[0]}"]`); await tapCard(p, `.fix-row .card[data-id="${good[1]}"]`);
          ok(/lugares que funcionam|qualquer ordem/.test(await bubble(p)), `M${n}: aviso de troca sem erro`);
        }
        await tapCard(p, `.fix-row .card[data-id="${pair[0]}"]`); await tapCard(p, `.fix-row .card[data-id="${pair[1]}"]`);
        await p.waitForSelector('.fix-row .card.in-place');
      } else if (st.type === 'odd') {
        await p.click(`.odd-row .card[data-id="${st.answer}"]`);
        await p.waitForSelector('.card.removed');
      } else if (st.type === 'choose') {
        const label = 'Plano';
        const btns = await p.$$('.plan');
        const want = st.plans[st.answer].map((id) => m.cards[id].t).join(', depois ');
        for (const b of btns) { if ((await b.getAttribute('aria-label')).endsWith(want)) { await b.click(); break; } }
        await p.waitForSelector('.plan.right');
        ok(!!label, 'plano');
      }
      await p.waitForFunction(() => /PRÓXIMO DESAFIO|CONCLUIR MISSÃO/.test(document.querySelector('.actions .action').textContent));
      await p.click('.actions .action');
    }
    await p.waitForSelector('.result-ov', { timeout: 30000 });
    const total = Number(await p.textContent('.score-list li.total b'));
    const stars = await p.$$eval('.rstar.on', (e) => e.length);
    if (plan.expect !== undefined) ok(total === plan.expect, `M${n}: pontuação ${total} (esperado ${plan.expect})`);
    if (plan.stars !== undefined) ok(stars === plan.stars, `M${n}: ${stars} estrelas (esperado ${plan.stars})`);
    return { total, stars };
  }

  async function backToMap(p) {
    await p.click('.result-ov .btn:has-text("MAPA")');
    for (let k = 0; k < 3; k++) {
      await sleep(250);
      if (await p.$('.medal-ov .btn')) { await p.click('.medal-ov .btn'); } else break;
    }
    await p.waitForSelector('.map-screen');
  }

  /* ================== 1. Jogo completo num tablet deitado (toque) ================== */
  console.log('1) Jogando as 15 missões (tablet 1024x768, toque)...');
  const p = await newPage({ width: 1024, height: 768 }, true);
  for (const id of ['#btn-jogar', '#btn-como', '#btn-conquistas']) ok(!!(await p.$(id)), `botão ${id}`);
  await p.screenshot({ path: path.join(SHOTS, '01-inicio.png') });
  await p.click('#btn-jogar'); await p.waitForSelector('.map-screen');
  ok((await p.$$('.node.locked')).length === 14, 'só a missão 1 liberada no começo');
  await p.click('[data-mission="2"]'); await sleep(200);
  ok(!!(await p.$('.map-screen')) && !!(await p.$('.toast')), 'missão bloqueada não abre');
  // tentar abrir a missão 15 direto pelo código não funciona sem ter liberado
  await p.evaluate(() => OQVP.app.go('mission', 15)); await sleep(200);
  ok(!!(await p.$('.map-screen')), 'missão 15 não abre sem passar pelas anteriores');
  await p.screenshot({ path: path.join(SHOTS, '02-mapa.png') });

  const plans = {
    1: { modes: ['wrong-first'], expect: 100, stars: 2 },     // 1 erro + 1 dica
    2: { modes: ['drag-mouse'], expect: 150, stars: 3 },
    3: { wrongChoice: true, expect: 130, stars: 2 },          // 2 opções erradas (uma em cada pergunta)
    4: { modes: ['drag-touch'], expect: 150, stars: 3 },
    5: { modes: ['arrows'], expect: 150, stars: 3 },
    6: { modes: ['keyboard'], expect: 150, stars: 3 },
    7: { dragChoice: true, expect: 150, stars: 3 },
    8: { expect: 150, stars: 3 },
    9: { expect: 150, stars: 3 },
    10: { expect: 150, stars: 3 },
    11: { expect: 200, stars: 3 },                            // +50 investigador
    12: { expect: 150, stars: 3 },
    13: { expect: 150, stars: 3 },
    14: { modes: [null, 'same-first'], expect: 180, stars: 3 },  // +30 outra maneira
    15: { wrongFix: true, expect: 180, stars: 2 }             // 1 erro, +50 investigador
  };
  let expectedTotal = 0;
  for (let n = 1; n <= 15; n++) {
    if (n === 14) plans[14].modes = [null, null];
    const r = await playMission(p, n, plans[n]);
    expectedTotal += plans[n].expect;
    if (n === 13) await sleep(500), await p.screenshot({ path: path.join(SHOTS, '05-resultado.png') });
    if (n === 15) {
      await p.click('.result-ov .btn.go');
      for (let k = 0; k < 3; k++) { await sleep(250); if (await p.$('.medal-ov .btn')) await p.click('.medal-ov .btn'); }
      await p.waitForSelector('.end-screen');
      ok((await p.textContent('.end-body h1')).includes('Mestre da Lógica'), 'tela de encerramento');
      await sleep(400);
      await p.screenshot({ path: path.join(SHOTS, '06-encerramento.png') });
    } else {
      await backToMap(p);
      ok(!(await p.getAttribute(`[data-mission="${n + 1}"]`, 'class')).includes('locked'), `missão ${n + 1} liberada após concluir a ${n}`);
      if (n < 14) ok((await p.getAttribute(`[data-mission="${n + 2}"]`, 'class')).includes('locked'), `missão ${n + 2} continua bloqueada`);
    }
    process.stdout.write(`   missão ${n}: ${r.total} pts, ${r.stars} estrelas\n`);
  }
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('oqvp-progresso-v1')));
  const tot = await p.evaluate(() => OQVP.logic.totals(OQVP.store.load()));
  ok(tot.done === 15, '15 missões salvas');
  ok(tot.points === expectedTotal, `pontuação total ${tot.points} (esperado ${expectedTotal})`);
  ok(Object.keys(saved.missions).length === 15, 'localStorage com 15 missões');
  ok(!JSON.stringify(saved).match(/nome|email|e-mail/i), 'nenhum dado pessoal salvo');

  /* ================== 2. Progresso preservado após recarregar ================== */
  console.log('2) Recarregando a página...');
  await p.reload(); await p.click('#btn-conquistas'); await p.waitForSelector('.ach-screen');
  ok((await p.textContent('.stats')).includes('15/15'), 'conquistas mostram 15/15 depois de recarregar');
  ok((await p.$$('.medal-card.got')).length === 4, '4 medalhas conquistadas');
  await p.screenshot({ path: path.join(SHOTS, '07-conquistas.png'), fullPage: true });

  // Jogar de novo mantém a melhor pontuação
  await p.click('.ach-screen .btn.small'); await p.waitForSelector('.map-screen');
  await playMission(p, 2, { modes: ['wrong-first'] });
  await backToMap(p);
  ok((await p.evaluate(() => OQVP.store.load().missions[2].best)) === 150, 'jogar de novo mantém a melhor pontuação');

  /* ================== 3. Pausa, reinício, voltar ao mapa ================== */
  console.log('3) Pausa, reiniciar e voltar ao mapa...');
  await p.click('[data-mission="13"]'); await p.click('.intro .btn.go'); await p.waitForSelector('.order-row');
  await p.click('.topbar [aria-label="Pausar"]'); await p.waitForSelector('.pause-ov');
  ok(true, 'pausa abre');
  await p.click('.pause-ov .btn:has-text("SOM")');
  ok((await p.textContent('.pause-ov .btn:has-text("SOM")')).includes('DESLIGADO'), 'botão de som funciona');
  await p.click('.pause-ov .btn:has-text("SOM")');
  await p.click('.pause-ov .btn:has-text("CONTINUAR")'); await sleep(250);
  await p.click('.topbar [aria-label="Reiniciar a missão"]'); await p.waitForSelector('.confirm-ov');
  await p.click('.confirm-ov .btn.primary'); await p.waitForSelector('.intro-ov');
  ok(true, 'reiniciar volta para a introdução');
  await p.click('.intro .btn.go'); await p.waitForSelector('.order-row');
  await p.click('.topbar [aria-label="Voltar ao mapa"]'); await p.waitForSelector('.map-screen');
  ok(true, 'voltar ao mapa');
  // pausa no meio da simulação congela o robô
  await p.click('[data-mission="13"]'); await p.click('.intro .btn.go'); await p.waitForSelector('.order-row');
  await p.evaluate(() => { window.OQVP_SPEED = 1; });
  await p.click('.actions .action'); await p.waitForSelector('.sim-panel');
  await p.click('.topbar [aria-label="Pausar"]');
  const cap1 = await p.textContent('.sim-caption'); await sleep(1600);
  ok(cap1 === await p.textContent('.sim-caption'), 'simulação para durante a pausa');
  await p.click('.pause-ov .btn:has-text("VOLTAR AO MAPA")'); await p.waitForSelector('.map-screen');
  await p.close();

  /* ================== 4. Área do professor ================== */
  console.log('4) Área do professor...');
  const t = await newPage({ width: 1366, height: 768 });
  await t.click('#btn-como'); await t.waitForSelector('.howto-screen');
  await sleep(300);
  await t.screenshot({ path: path.join(SHOTS, '08-como-jogar.png'), fullPage: true });
  await t.click('.howto-screen .icon-btn'); await t.waitForSelector('.home-screen');
  const typePin = async (pin) => { for (const d of pin) await t.click(`.pin-key[aria-label="${d}"]`); };
  const openPanel = async () => {
    await t.click('.teacher-home'); await t.waitForSelector('.teacher-gate');
    await typePin('3030'); await t.waitForSelector('.teacher-panel');
  };
  const goHome = async () => { await t.click('.map-top .icon-btn[aria-label="Tela inicial"]'); await t.waitForSelector('.home-screen'); };
  ok(!!(await t.$('.teacher-home')), 'botão do professor na tela inicial');
  await t.click('.teacher-home'); await t.waitForSelector('.teacher-gate');
  await typePin('1111');
  ok((await t.textContent('.pin-msg')).includes('incorreto'), 'PIN errado recusado');
  await typePin('3030'); await t.waitForSelector('.teacher-panel');
  ok((await t.$$('.tmission')).length === 15, 'painel mostra as 15 missões dos 3 níveis');
  await sleep(300);
  await t.screenshot({ path: path.join(SHOTS, '09-professor.png') });

  // abre a missão 15 direto, sem ter liberado nada
  await t.click('[data-preview="15"]'); await t.waitForSelector('.intro-ov');
  ok((await t.textContent('.intro h2')).includes('grande desafio'), 'professor abre a missão 15 bloqueada');
  ok(!!(await t.$('.mission-screen .teacher-badge')), 'aviso de modo professor na missão');
  await t.click('.intro .btn.go'); await t.waitForSelector('.odd-row');
  await t.click('.topbar [aria-label="Voltar ao mapa"]'); await t.waitForSelector('.map-screen');
  ok((await t.$$('.node.locked')).length === 14, 'o mapa do aluno continua bloqueado');

  // joga a missão 4 pelo painel: o resultado não é salvo
  await goHome(); await openPanel();
  await t.click('[data-preview="4"]'); await t.click('.intro .btn.go'); await t.waitForSelector('.order-row');
  await arrangeByTaps(t, '.order-row', ['fatias', 'recheio', 'fechar']);
  await t.click('.actions .action'); await waitNext(t); await t.click('.actions .action');
  await t.waitForSelector('.result-ov');
  ok(!!(await t.$('.teacher-note')), 'resultado avisa que não foi salvo');
  ok((await t.evaluate(() => OQVP.logic.totals(OQVP.store.load()).done)) === 0, 'missão do professor não conta para o aluno');
  await t.click('.result-ov .btn:has-text("MAPA")'); await t.waitForSelector('.map-screen');

  // liberar o mapa inteiro
  await goHome(); await openPanel();
  await t.click('[data-act="unlock"]');
  await t.click('.teacher-panel .btn:has-text("IR PARA O MAPA")'); await t.waitForSelector('.map-screen');
  ok((await t.$$('.node.locked')).length === 0, 'mapa liberado abre todas as missões');
  ok(!!(await t.$('.teacher-badge')), 'aviso de mapa liberado');

  // novo aluno: apaga tudo
  await t.evaluate(() => OQVP.store.update((p) => { p.missions = { 1: { done: true, best: 150, stars: 3 }, 2: { done: true, best: 150, stars: 3 } }; }));
  await t.click('.teacher-badge'); await t.waitForSelector('.teacher-gate');
  await typePin('3030'); await t.waitForSelector('.teacher-panel');
  await t.click('[data-act="reset"]'); await t.waitForSelector('.reset-confirm');
  ok((await t.textContent('.reset-confirm')).includes('2 missões'), 'confirmação mostra o que será apagado');
  await t.click('.reset-confirm .btn.ghost'); await sleep(250);
  ok((await t.evaluate(() => OQVP.logic.totals(OQVP.store.load()).done)) === 2, 'cancelar não apaga nada');
  await t.click('[data-act="reset"]'); await t.waitForSelector('.reset-confirm');
  await t.click('[data-act="confirm-reset"]'); await t.waitForSelector('.home-screen');
  const after = await t.evaluate(() => ({ ...OQVP.logic.totals(OQVP.store.load()), teacher: OQVP.store.load().teacher }));
  ok(after.done === 0 && after.points === 0 && !after.teacher, 'novo aluno: progresso e mapa liberado apagados');
  ok(!!(await t.$('.toast')), 'aviso de progresso apagado');
  await t.reload(); await t.click('#btn-jogar'); await t.waitForSelector('.map-screen');
  ok((await t.$$('.node.locked')).length === 14, 'depois de recarregar, só a missão 1 está liberada');

  /* ================== 5. Tamanhos de tela ================== */
  console.log('5) Tamanhos de tela...');
  const sizes = [['notebook', 1366, 768, false], ['tablet-deitado', 1024, 768, true], ['tablet-em-pe', 768, 1024, true], ['ipad-pro', 1180, 820, true], ['celular', 390, 844, true]];
  for (const [name, w, hh, touch] of sizes) {
    const q = await newPage({ width: w, height: hh }, touch);
    await q.evaluate(() => { OQVP.store.update((p) => { p.teacher = true; }); });
    for (const [n, label] of [[13, 'ordenar'], [12, 'falta'], [15, 'final']]) {
      await q.evaluate((n) => OQVP.app.go('mission', n), n);
      await q.waitForSelector('.intro-ov');
      if (n === 13) { await sleep(400); await q.screenshot({ path: path.join(SHOTS, `${name}-intro.png`) }); }
      await q.click('.intro .btn.go'); await q.waitForSelector('.board .activity'); await sleep(300);
      if (n === 15) { // avança até o desafio 4 (planos)
        await q.click('.odd-row .card[data-id="videogame"]'); await q.click('.actions .action');
        await q.waitForSelector('.order-row');
        const s = await q.evaluate(() => OQVP.data.mission(15).stages[1].ids);
        await arrangeByTaps(q, '.order-row', s);
        await q.click('.actions .action'); await waitNext(q); await q.click('.actions .action');
        await tapCard(q, '.fix-row .card[data-id="saco"]'); await tapCard(q, '.fix-row .card[data-id="lugar"]');
        await q.waitForSelector('.fix-row .card.in-place'); await q.click('.actions .action'); await q.waitForSelector('.plans');
      }
      const overflow = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(overflow <= 1, `${name}/${label}: sem rolagem horizontal (${overflow}px)`);
      const small = await q.$$eval('button, .card.option, .order-row .card', (els) => els.filter((e) => e.offsetParent && (e.getBoundingClientRect().height < 40 || e.getBoundingClientRect().width < 40)).map((e) => e.className));
      ok(small.length === 0, `${name}/${label}: áreas de toque ≥ 40px (${small.slice(0, 3)})`);
      await q.screenshot({ path: path.join(SHOTS, `${name}-${label}.png`) });
    }
    // simulação
    await q.evaluate(() => { window.OQVP_SPEED = 1; OQVP.app.go('mission', 8); });
    await q.click('.intro .btn.go'); await q.waitForSelector('.order-row');
    await q.click('.actions .action'); await q.waitForSelector('.sim-panel'); await sleep(700);
    await q.screenshot({ path: path.join(SHOTS, `${name}-simulacao.png`) });
    await q.evaluate(() => OQVP.app.go('map')); await sleep(200);
    await q.screenshot({ path: path.join(SHOTS, `${name}-mapa.png`) });
    await q.context().close();
  }

  /* ================== 6. Ilustrações e botões ================== */
  const missingArt = await t.evaluate(() => OQVP.data.MISSIONS.flatMap((m) => Object.values(m.cards).map((c) => c.art).concat(m.icon)).filter((a) => !OQVP.art.has(a)));
  ok(missingArt.length === 0, `todas as ilustrações existem (${missingArt})`);

  await t.context().close();
  await browser.close();
  srv.close();
  ok(errors.length === 0, `nenhum erro no navegador: ${errors.slice(0, 5).join(' | ')}`);
  console.log(`\n${oks} verificações OK, ${fails} falhas. Capturas em tests/capturas/`);
  process.exitCode = fails ? 1 : 0;
})().catch((e) => { console.error(e); process.exit(1); });
