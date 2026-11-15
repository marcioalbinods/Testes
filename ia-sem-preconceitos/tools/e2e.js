/* Teste de ponta a ponta: joga as 6 missões completas no navegador (Playwright).
   Uso: node tools/serve.js 8765 &  depois  node tools/e2e.js [largura] [altura] [pastaDeCapturas]
   Inclui respostas erradas propositais para testar feedback, nova tentativa e pontuação. */
const { chromium } = require('playwright');
const W = +process.argv[2] || 1024, H = +process.argv[3] || 768, SHOTS = process.argv[4] || null;
const URL = 'http://localhost:8765/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  let shotN = 0;
  const shot = async (name, full) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${String(++shotN).padStart(2, '0')}-${name}.png`, fullPage: !!full }); };
  const wait = (ms) => page.waitForTimeout(ms);
  const log = (...a) => console.log(...a);
  let failsSeen = 0;

  async function center(sel) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2, b };
  }
  // Arrasta com o mouse quando origem e destino cabem juntos na tela; senão usa "tocar e tocar".
  async function drag(src, dst, dstClickSel) {
    const s = page.locator(src).first(), d = page.locator(dst).first();
    await s.scrollIntoViewIfNeeded();
    let sb = await s.boundingBox(), db = await d.boundingBox();
    const inView = (b) => b && b.y >= 90 && b.y + b.height <= H - 90 && b.x >= 0 && b.x + b.width <= W; // evita a barra fixa e o rodapé fixo
    if (inView(sb) && inView(db)) {
      await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
      await page.mouse.down();
      await page.mouse.move(sb.x + sb.width / 2 + 12, sb.y + sb.height / 2 + 6, { steps: 3 });
      await page.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 8 });
      await page.mouse.up();
    } else {
      await s.click();
      await page.locator(dstClickSel || dst).first().click();
    }
    await wait(60);
  }
  async function verify() { await page.click('.btn-check'); await wait(250); }
  async function expectFail() {
    await page.waitForSelector('.fail-modal', { timeout: 3000 });
    failsSeen++;
    await page.click('.fail-modal .btn-primary'); await wait(250);
  }
  async function okStep() {
    await page.waitForSelector('.ok-modal', { timeout: 5000 });
    await page.click('.ok-modal .btn-primary'); await wait(350);
  }
  async function closeModals() {
    for (let k = 0; k < 4; k++) {
      const lv = await page.$('.levelup .btn-primary');
      if (lv) { await lv.click(); await wait(300); continue; }
      break;
    }
  }

  const G = async () => page.evaluate(() => window.GAME);

  /* ---------- Resolvedores por mecânica ---------- */
  const solve = {
    async generate(s, opt) {
      await page.click('text=Enviar comando');
      await page.waitForSelector('.gen-card', { timeout: 8000 }); await wait(900);
      const cards = await page.$$('.gen-card');
      for (let i = 0; i < 6; i++) { await cards[i].click(); await wait(120); }
      await page.waitForSelector('.pattern-panel:not(.hidden)', { timeout: 4000 }); await wait(300);
      await shot('m1-generate', true);
      if (opt.wrong) { // marca uma conclusão errada primeiro
        const bad = s.patterns.options.findIndex((o) => !o.ok);
        await page.click(`.mech-generate .chip[data-i="${bad}"]`); await verify(); await expectFail();
        await page.click(`.mech-generate .chip[data-i="${bad}"]`);
      }
      for (let i = 0; i < s.patterns.options.length; i++) if (s.patterns.options[i].ok) await page.click(`.mech-generate .chip[data-i="${i}"]`);
      await verify();
    },
    async choice(s, opt) {
      if (opt.wrong) { const bad = s.options.findIndex((o) => !o.ok); await page.click(`.option[data-i="${bad}"]`); await verify(); await expectFail(); }
      await page.click(`.option[data-i="${s.options.findIndex((o) => o.ok)}"]`); await verify();
    },
    async multi(s, opt) {
      if (opt.wrong) { const bad = s.options.findIndex((o) => !o.ok); if (!s.exact) { await page.click(`.mech-multi .chip[data-i="${bad}"]`); await verify(); await expectFail(); await page.click(`.mech-multi .chip[data-i="${bad}"]`); } }
      for (let i = 0; i < s.options.length; i++) if (s.options[i].ok) await page.click(`.mech-multi .chip[data-i="${i}"]`);
      await verify();
    },
    async sort(s, opt) {
      const cards = s.cards.slice();
      if (opt.wrong) { // coloca todos menos 1 certos e 1 errado
        for (const c of cards) await drag(`.scard[data-id="${c.id}"]`, `.sort-bin[data-zone="${c.id === cards[0].id ? (c.bin === 'est' ? 'div' : 'est') : c.bin}"]`, `.sort-bin[data-zone="${c.id === cards[0].id ? (c.bin === 'est' ? 'div' : 'est') : c.bin}"] .bin-head`);
        await shot('m1-sort', true);
        await verify(); await expectFail();
        await drag(`.scard[data-id="${cards[0].id}"]`, `.sort-bin[data-zone="${cards[0].bin}"]`, `.sort-bin[data-zone="${cards[0].bin}"] .bin-head`);
      } else for (const c of cards) await drag(`.scard[data-id="${c.id}"]`, `.sort-bin[data-zone="${c.bin}"]`, `.sort-bin[data-zone="${c.bin}"] .bin-head`);
      await verify();
    },
    async hypothesis(s, opt) {
      if (opt.wrong) { const bad = s.hypotheses.find((x) => !x.ok); await page.click(`.hyp-card[data-h="${bad.id}"]`); await verify(); await expectFail(); await page.click(`.hyp-card[data-h="${bad.id}"]`); }
      for (const x of s.hypotheses) if (x.ok) await page.click(`.hyp-card[data-h="${x.id}"]`);
      await verify(); await wait(400);
      for (const x of s.hypotheses) if (x.ok) await drag(`.ev-card[data-ev="${x.ev}"]`, `.hyp-slot[data-h="${x.id}"]`);
      await shot('m1-hypothesis', true);
      await verify();
    },
    async builder(s, opt) {
      const sol = ['p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p14', 'p15', 'p1', 'p3'];
      if (opt.wrong) {
        const bad = ['p16', 'p17', 'p1', 'p2', 'p4', 'p5', 'p19', 'p3', 'p13', 'p20'];
        for (let i = 0; i < bad.length; i++) await drag(`.pcard[data-id="${bad[i]}"]`, `.b-slot[data-slot="${i}"]`);
        await shot('m2-builder-wrong', true);
        await verify(); await expectFail();
        for (let i = 0; i < sol.length; i++) await drag(`.pcard[data-id="${sol[i]}"]`, `.b-slot[data-slot="${i}"]`);
      } else for (let i = 0; i < sol.length; i++) await drag(`.pcard[data-id="${sol[i]}"]`, `.b-slot[data-slot="${i}"]`);
      await shot('m2-builder-ok', true);
      await verify();
    },
    async compare(s, opt) {
      if (opt.wrong) { // troca BETA e GAMA
        await drag('.label-chip[data-l="low"]', '.base-drop[data-b="alfa"]');
        await drag('.label-chip[data-l="best"]', '.base-drop[data-b="beta"]');
        await drag('.label-chip[data-l="mid"]', '.base-drop[data-b="gama"]');
        await verify(); await expectFail();
      }
      for (const b of s.bases) await drag(`.label-chip[data-l="${b.answer}"]`, `.base-drop[data-b="${b.id}"]`);
      await shot('m2-compare', true);
      await verify();
    },
    async expand(s, opt) {
      if (opt.wrong) { await page.click('.cand[data-id="c8"]'); await page.click('.cand[data-id="c7"]'); await verify(); await expectFail(); await page.click('.cand[data-id="c8"]'); await page.click('.cand[data-id="c7"]'); }
      for (const id of ['c1', 'c2', 'c3', 'c4', 'c5', 'c10']) await page.click(`.cand[data-id="${id}"]`);
      await shot('m2-expand', true);
      await verify();
    },
    async evidence(s) {
      for (const f of s.files) {
        await page.click(`.file-card[data-f="${f.id}"]`); await page.waitForSelector('.file-modal');
        if (f === s.files[0]) await shot('evidence-file');
        await page.click('.file-modal .btn-primary'); await wait(250);
      }
      await shot('evidence-board', true);
      await verify();
    },
    async sequence(s, opt) {
      const ids = s.items.map((x) => x.id);
      if (opt.wrong) { await verify(); const f = await page.$('.fail-modal'); if (f) { failsSeen++; await page.click('.fail-modal .btn-primary'); await wait(200); } }
      for (let i = 0; i < ids.length; i++) {
        for (let guard = 0; guard < 10; guard++) {
          const order = await page.$$eval('.seq-item', (els) => els.map((e) => e.getAttribute('data-id')));
          const j = order.indexOf(ids[i]);
          if (j === i) break;
          await page.click(`.seq-item[data-id="${ids[i]}"] button[aria-label="Subir"]`); await wait(40);
        }
      }
      await verify();
    },
    async highlight(s, opt) {
      if (opt.wrong) { await page.click('.cv-field[data-f="exp"]'); await verify(); await expectFail(); await page.click('.cv-field[data-f="exp"]'); }
      for (const f of s.answer) await page.click(`.cv-field[data-f="${f}"]`);
      await shot('m3-highlight', true);
      await verify();
    },
    async pairs(s, opt) {
      if (opt.wrong) {
        await page.click('.prof[data-id="ana"]'); await page.click('.prof[data-id="marina"]');
        await page.click('.prof[data-id="luana"]'); await page.click('.prof[data-id="pedro"]');
        await page.click('.prof[data-id="diego"]'); await page.click('.prof[data-id="rafael"]');
        await page.click('.prof[data-id="bia"]'); await page.click('.prof[data-id="caio"]');
        await verify(); await expectFail();
        await verify(); await expectFail(); // 2ª vez trava os certos
        const unpaired = await page.$$eval('.prof:not(.locked)', (e) => e.map((x) => x.getAttribute('data-id')));
        for (const id of unpaired) if (await page.$(`.prof.paired[data-id="${id}"]`)) await page.click(`.prof[data-id="${id}"]`);
      }
      for (const [a, b] of s.pairs) { if (await page.$(`.prof.locked[data-id="${a}"]`)) continue; await page.click(`.prof[data-id="${a}"]`); await page.click(`.prof[data-id="${b}"]`); }
      await shot('m3-pairs', true);
      await verify();
    },
    async datafix(s, opt) {
      for (const r of s.rows) {
        const tool = opt.wrong && r === s.rows[0] ? 'ok' : r.tool;
        await drag(`.tools .tool-chip[data-t="${tool}"]`, `.df-slot[data-r="${r.id}"]`);
      }
      await shot('datafix', true);
      if (opt.wrong) { await verify(); await expectFail(); await drag(`.tools .tool-chip[data-t="${s.rows[0].tool}"]`, `.df-slot[data-r="${s.rows[0].id}"]`); }
      await verify();
    },
    async rules(s, opt) {
      for (const r of s.rules) {
        if (!r.bad) continue;
        await page.click(`.rule[data-r="${r.id}"] .flag-btn`);
        const k = opt.wrong && r === s.rules.find((x) => x.bad) ? r.options.findIndex((o) => !o.ok) : r.options.findIndex((o) => o.ok);
        await page.click(`.rule[data-r="${r.id}"] .ro[data-k="${k}"]`);
      }
      await shot('rules', true);
      if (opt.wrong) {
        await verify(); await expectFail();
        const r = s.rules.find((x) => x.bad);
        await page.click(`.rule[data-r="${r.id}"] .ro[data-k="${r.options.findIndex((o) => o.ok)}"]`);
      }
      await verify();
    },
    async chart(s, opt) {
      if (s.run) { await page.click('.run-btn'); await wait(1900); } else await wait(400);
      if (opt.wrong) { const bad = s.data.find((d) => !s.pick.includes(d.label)); await page.click(`.ch-group[data-l="${bad.label}"]`); await verify(); await expectFail(); if (s.multi) await page.click(`.ch-group[data-l="${bad.label}"]`); }
      for (const l of s.pick) await page.click(`.ch-group[data-l="${l}"]`);
      await wait(600); await shot('chart');
      await verify();
    },
    async number(s, opt) {
      if (opt.wrong) { await page.fill('.num-input', String(s.answer + 3)); await verify(); await expectFail(); }
      await page.fill('.num-input', String(s.answer)); await verify();
    },
    async conveyor(s, opt) {
      for (const c of s.cases) {
        if (opt.wrong && c === s.cases[0]) { await page.click('.verdict.ok'); await page.click('.conv-confirm .btn'); await expectFail(); }
        if (c.ok) await page.click('.verdict.ok');
        else { await page.click('.verdict.fail'); await page.click(`.conv-tags .chip[data-t="${c.tags[0]}"]`); }
        if (c === s.cases[1]) await shot('m5-conveyor', true);
        await page.click('.conv-confirm .btn'); await page.waitForSelector('.mini-ok'); await page.click('.mini-ok .btn-primary'); await wait(250);
      }
    },
    async decision(s, opt) {
      if (opt.wrong) { await page.click('.dec-opt >> nth=0'); await wait(200); await shot('m5-decision-bad'); await page.click('text=Voltar no tempo'); await wait(200); }
      await page.click('.dec-opt >> nth=2'); await wait(250);
      await page.click('.dec-opt >> nth=1'); await wait(250);
      await page.click('.dec-opt >> nth=0'); await wait(300);
      await shot('m5-decision-end');
      await page.click('text=Concluir reunião');
    },
    async twins(s, opt) {
      for (const t of s.tests) { await page.click(`.tw-row:nth-child(${s.tests.indexOf(t) + 1}) .btn-ghost`); }
      await wait(1200);
      for (let i = 0; i < s.tests.length; i++) {
        const t = s.tests[i]; const pass = opt.wrong && i === 2 ? true : t.pass;
        await page.click(`.tw-row:nth-child(${i + 1}) .verdict.${pass ? 'ok' : 'fail'}`);
      }
      await shot('m6-twins', true);
      if (opt.wrong) { await verify(); await expectFail(); await page.click('.tw-row:nth-child(3) .verdict.fail'); }
      await verify();
    },
    async write(s, opt) {
      if (opt.wrong) { await page.fill('.write-area', 'Eu acho que a IA precisa melhorar bastante porque ela está errada em muitas coisas importantes.'); await verify(); await expectFail(); }
      await page.fill('.write-area', 'O problema da RUMO é o viés: meninas, estudantes negros, indígenas e de escola pública recebem recomendações estereotipadas. Vou revisar a base de dados, remover os critérios de gênero, CEP e tipo de escola, testar com perfis gêmeos e monitorar sempre os resultados por grupo, com transparência.');
      await shot('m6-write', true);
      await verify();
    }
  };

  /* ---------- Fluxo ---------- */
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await wait(600);
  await shot('title');
  await page.click('text=Iniciar missão'); await wait(1200);
  await shot('intro-1');
  for (let i = 0; i < 30 && await page.$('.intro-next'); i++) { await page.click('.intro-next'); await wait(350); if (i === 3) await shot('intro-orbit'); if (i === 7) await shot('intro-core'); }
  await page.waitForSelector('.name-input', { timeout: 5000 });
  await page.fill('.name-input', 'Dupla Teste');
  await page.click('.av-opt[title="Black power"]'); await page.click('.swatch[title="Tom 9"]');
  await shot('create');
  await page.click('text=Entrar na NEXUS LAB'); await wait(600);
  await page.click('.dlg-skip'); await wait(200); await page.click('.dlg-next'); await wait(150); await page.click('.dlg-next'); await wait(600);
  await shot('hq-start');

  const game = await G();
  for (let mi = 0; mi < game.missions.length; mi++) {
    const m = game.missions[mi];
    log(`Missão ${m.num}: ${m.title}`);
    await page.click(`.map-node >> nth=${mi}`); await wait(500);
    if (await page.$('.dlg-skip:not(.hidden)')) { await page.click('.dlg-skip'); await wait(150); await page.click('.dlg-next'); await wait(150); await page.click('.dlg-next'); await wait(400); }
    if (mi === 0) await shot('briefing');
    await page.click('.brief-ch .btn-xl'); await wait(500);
    for (let ci = 0; ci < m.challenges.length; ci++) {
      const ch = m.challenges[ci];
      log(`  Desafio ${ci + 1}: ${ch.title}`);
      for (let si = 0; si < ch.steps.length; si++) {
        const s = ch.steps[si];
        const wrong = (mi + ci + si) % 2 === 0; // metade das etapas com um erro proposital
        if (si === 0) await shot(`m${m.num}c${ci + 1}`);
        await solve[s.type](s, { wrong });
        if (s.type === 'decision') { await okStep(); continue; }
        await okStep();
      }
      await page.waitForSelector('.done-modal', { timeout: 5000 });
      if (ci === 0) await shot(`m${m.num}-challenge-done`);
      await page.click('.done-modal .btn-primary'); await wait(500);
      await closeModals(); await wait(400);
    }
    await page.waitForSelector('.mission-done', { timeout: 5000 }); await wait(1500);
    await shot(`m${m.num}-mission-done`, true);
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('nexuslab-ia-justa-v1')));
    log(`  ✔ concluída · XP total ${state.xp} · missão ${state.missions[m.id].score}/${state.missions[m.id].max} · medalha ${state.missions[m.id].medalTier}`);
    if (mi < 5) {
      await page.click('.md-actions .btn'); await wait(600);
      if (mi === 1) { // testa salvar e continuar
        await page.reload(); await wait(700);
        await page.click('text=Continuar'); await wait(600);
        const open = await page.$$eval('.map-node.st-open', (e) => e.length);
        log(`  ↻ recarregado: missões abertas no mapa = ${open}`);
      }
      if (mi === 2) await shot('hq-mid');
    } else {
      await page.click('.md-actions .btn'); await wait(800);
      await shot('final-eval', true);
      await page.click('text=Ir para a cerimônia'); await wait(4500);
      await shot('graduation', true);
    }
  }
  // Menu do professor
  await page.keyboard.press('Control+Shift+P'); await wait(300);
  await page.fill('.pin-input', '2040'); await page.keyboard.press('Enter'); await wait(400);
  await shot('teacher', true);
  const teacherOk = await page.$('.teacher');
  await page.click('.modal .modal-foot .btn-primary'); await wait(300);
  // Conquistas e inspirações
  await page.click('.hud-btn[aria-label="Medalhas e conquistas"]'); await wait(400); await shot('trophies'); await page.click('.modal .modal-foot .btn-primary'); await wait(300);
  await page.click('.hud-btn[aria-label="Arquivo de inspirações"]'); await wait(400); await shot('inspirations'); await page.click('.modal .modal-foot .btn-primary'); await wait(300);
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('nexuslab-ia-justa-v1')));
  log('\nRESULTADO');
  log(`XP: ${st.xp} · conquistas: ${Object.keys(st.achievements).join(', ')}`);
  log(`Inspirações: ${st.inspirations.length} · formado: ${st.graduated} · menu professor: ${!!teacherOk} · erros propositais vistos: ${failsSeen}`);
  log(`Missões: ${Object.entries(st.missions).map(([k, v]) => `${k}:${v.status}/${v.medalTier}`).join(' ')}`);
  log(errors.length ? 'ERROS NO NAVEGADOR:\n' + errors.join('\n') : 'Nenhum erro de JavaScript.');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error('FALHA:', e); process.exit(2); });
