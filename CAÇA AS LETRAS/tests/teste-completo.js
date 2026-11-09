/* =========================================================
   CAÇADORES DE LETRAS — Teste automatizado completo
   Joga as 60 fases, testa letras repetidas, distratoras,
   dicas, cronômetro, salvamento, perfis, painel do professor
   e responsividade.

   Uso (precisa de Node.js e Playwright):
     cd "CAÇA AS LETRAS"
     python3 -m http.server 8765      (em outro terminal)
     node tests/teste-completo.js
   ========================================================= */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.URL || 'http://localhost:8765/index.html';
const OUT = process.env.OUT || path.join(__dirname, 'resultados');
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log('  ✔ ' + msg);
  else { failures++; console.log('  ✘ FALHOU: ' + msg); }
};

async function waitOverlay(page, id) {
  await page.waitForSelector('#' + id + '.open', { timeout: 15000 });
  await page.waitForTimeout(350);
}

async function playCurrentLevel(page, opts = {}) {
  await waitOverlay(page, 'ov-intro');
  const word = (await page.textContent('#intro-word')).trim();
  await page.click('[data-action="start-level"]');
  await page.waitForTimeout(300);

  // verifica as letras da fase
  const letters = await page.$$eval('#letters-layer .letter', (els) => els.map((e) => ({ ch: e.dataset.ch, target: e.dataset.target === '1' })));
  const targets = letters.filter((l) => l.target).map((l) => l.ch).sort().join('');
  const distract = letters.filter((l) => !l.target);
  ok(targets === word.split('').sort().join(''), `${word}: todas as letras da palavra existem no cenário (inclusive repetidas)`);
  ok(distract.length > 0 && distract.every((d) => !word.includes(d.ch)), `${word}: ${distract.length} letras distratoras presentes`);

  // letras visíveis, dentro do cenário, sem sobreposição e com área de toque confortável
  const boxes = await page.$$eval('#letters-layer .letter .hit', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  const sc = await page.$eval('#scene', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const scale = Math.min(sc.w / 1600, sc.h / 900);
  const ox = sc.x + (sc.w - 1600 * scale) / 2, oy = sc.y + (sc.h - 900 * scale) / 2;
  const inside = boxes.every((b) => b.x >= ox - 2 && b.y >= oy - 2 && b.x + b.w <= ox + 1600 * scale + 2 && b.y + b.h <= oy + 900 * scale + 2);
  ok(inside, `${word}: todas as letras dentro da área visível do cenário`);
  ok(Math.min(...boxes.map((b) => b.w)) >= 44, `${word}: área de toque das letras ≥ 44px (${Math.round(Math.min(...boxes.map((b) => b.w)))}px)`);
  const glyphs = await page.$$eval('#letters-layer .letter .glyph', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  let overlap = 0;
  for (let i = 0; i < glyphs.length; i++) for (let j = i + 1; j < glyphs.length; j++) {
    const a = glyphs[i], b = glyphs[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) overlap++;
  }
  ok(overlap === 0, `${word}: nenhuma letra sobreposta a outra`);
  ok(Math.min(...glyphs.map((g) => g.h)) >= 24, `${word}: letras com tamanho legível (${Math.round(Math.min(...glyphs.map((g) => g.h)))}px)`);

  // toca em uma distratora
  if (opts.wrong) {
    await page.click('#letters-layer .letter[data-target="0"]');
    await page.waitForTimeout(250);
    const fb = await page.textContent('#feedback');
    ok(/Essa não/.test(fb), `${word}: letra errada mostra mensagem amigável`);
    const filled = await page.$$eval('#slots .slot.filled', (e) => e.length);
    ok(filled === 0, `${word}: letra errada não é adicionada à palavra`);
    await page.waitForTimeout(650);
  }

  // dicas progressivas
  if (opts.hints) {
    await page.click('#btn-hint');
    ok(await page.$('#hint-layer .hint-region') !== null, `${word}: dica 1 mostra a região aproximada`);
    await page.click('#btn-hint');
    ok(await page.$('#hint-layer .hint-sparkle') !== null && await page.$('.letter.wiggle') !== null, `${word}: dica 2 mostra animação perto da letra`);
    await page.click('#btn-hint');
    ok(await page.$('#hint-layer .hint-spot') !== null && await page.$('.letter.spot') !== null, `${word}: dica 3 destaca a letra`);
    const spotCh = await page.$eval('.letter.spot', (e) => e.dataset.ch);
    ok(spotCh === word[0], `${word}: dica aponta a próxima letra (${spotCh})`);
  }

  // coleta as letras em ordem
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const sel = `#letters-layer .letter[data-target="1"][data-ch="${ch}"]:not(.collected)`;
    await page.click(sel);
    await page.waitForTimeout(120);
    if (opts.duplicateCheck && i === 0) {
      // tenta tocar de novo na letra já coletada
      const collectedId = await page.$eval('#letters-layer .letter.collected', (e) => e.dataset.id);
      await page.$eval(`.letter[data-id="${collectedId}"]`, (e) => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      await page.waitForTimeout(800);
      const filledNow = await page.$$eval('#slots .slot.filled', (e) => e.length);
      ok(filledNow === 1, `${word}: a mesma letra não pode ser coletada duas vezes`);
    }
  }
  await waitOverlay(page, 'ov-complete');
  const cw = (await page.textContent('#complete-word')).trim();
  ok(cw === word, `${word}: palavra formada corretamente e missão concluída`);
  const slots = await page.$$eval('#slots .slot', (els) => els.map((e) => e.textContent.trim()).join(''));
  ok(slots === word, `${word}: área de coleta mostra ${slots}`);
  ok(await page.$('#complete-art svg') !== null, `${word}: ilustração da palavra exibida`);
  await page.waitForTimeout(1500);
  const stars = await page.$$eval('#complete-stars .star.on', (e) => e.length);
  ok(stars >= 1 && stars <= 3, `${word}: recebeu ${stars} estrela(s)`);
  return { word, stars };
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  console.log('\n== Tela inicial ==');
  await page.goto(URL);
  await page.waitForTimeout(800);
  for (const a of ['play', 'continue', 'worlds', 'settings', 'teacher']) ok(await page.$(`#screen-home [data-action="${a}"]`) !== null, 'botão ' + a + ' presente');
  await page.screenshot({ path: path.join(OUT, '01-inicio.png') });

  console.log('\n== Criar perfil ==');
  await page.click('[data-action="play"]');
  await page.fill('#profile-name', 'Ana');
  await page.click('#avatar-grid .avatar-opt:nth-child(3)');
  await page.click('#profile-form button[type="submit"]');

  console.log('\n== Cronômetro ==');
  await waitOverlay(page, 'ov-intro');
  await page.click('[data-action="start-level"]');
  await page.waitForTimeout(2300);
  const t1 = await page.textContent('#timer-level');
  ok(t1 === '00:02', 'cronômetro da fase conta segundos (' + t1 + ')');
  // simula a aba ficar oculta por 1 minuto: o tempo é calculado por timestamps
  await page.evaluate(() => { window.__realNow = Date.now; Date.now = () => window.__realNow.call(Date) + 60000; });
  await page.waitForTimeout(400);
  const t2 = await page.textContent('#timer-level');
  ok(t2 === '01:02', 'cronômetro usa timestamps e continua correto após troca de aba (' + t2 + ')');
  await page.evaluate(() => { Date.now = window.__realNow; });
  // pausa e reinicia a fase
  await page.click('[data-action="pause"]');
  await waitOverlay(page, 'ov-pause');
  const tp = await page.textContent('#timer-level');
  await page.waitForTimeout(1200);
  ok(tp === (await page.textContent('#timer-level')), 'cronômetro para durante a pausa');
  await page.click('[data-action="restart"]');

  console.log('\n== Jogando as 60 fases ==');
  const results = [];
  for (let n = 1; n <= 60; n++) {
    console.log(`\n-- Fase ${n} --`);
    if (n === 4) await page.setViewportSize({ width: 1024, height: 768 }); // iPad
    if (n === 12) await page.setViewportSize({ width: 1280, height: 800 }); // tablet Android
    if (n === 22) await page.setViewportSize({ width: 1920, height: 1080 }); // desktop
    if (n === 27) await page.setViewportSize({ width: 1366, height: 768 }); // notebook
    if (n === 35) await page.setViewportSize({ width: 1024, height: 768 }); // iPad
    if (n === 45) await page.setViewportSize({ width: 1280, height: 800 }); // tablet Android
    if (n === 55) await page.setViewportSize({ width: 1366, height: 768 }); // notebook
    const r = await playCurrentLevel(page, { wrong: n % 3 === 1, hints: [1, 15, 25, 35, 45, 55].includes(n), duplicateCheck: n === 5 || n === 51 });
    results.push(r);
    if (n % 10 === 1 || n === 60) await page.screenshot({ path: path.join(OUT, `fase-${String(n).padStart(2, '0')}-concluida.png`) });
    if (n === 3) {
      console.log('\n== Salvamento do progresso (recarregar página) ==');
      await page.reload();
      await page.waitForTimeout(800);
      const chip = await page.textContent('.chip-name');
      ok(/ANA/.test(chip), 'perfil continua selecionado após recarregar (' + chip + ')');
      const cont = await page.textContent('[data-action="continue"]');
      ok(/MISSÃO 04/.test(cont), 'botão CONTINUAR aponta para a missão 04');
      await page.click('[data-action="continue"]');
      continue;
    }
    await page.click('#btn-next');
    if (n % 10 === 0) {
      await waitOverlay(page, 'ov-world');
      ok(true, 'recompensa especial do mundo ' + (n / 10) + ' exibida');
      await page.screenshot({ path: path.join(OUT, `mundo-${n / 10}-recompensa.png`) });
      await page.click('#btn-world-continue');
      if (n < 60) {
        await page.waitForSelector('#screen-map.active');
        ok(true, 'mapa do próximo mundo aberto');
        await page.screenshot({ path: path.join(OUT, `mapa-mundo-${n / 10 + 1}.png`) });
        await page.click(`.level-node[data-level="${n + 1}"]`, { force: true });
      }
    }
  }

  console.log('\n== Tela final ==');
  await waitOverlay(page, 'ov-final');
  const ft = await page.textContent('.final-title');
  ok(ft.includes('VOCÊ É UM VERDADEIRO CAÇADOR DE LETRAS!'), 'tela final de celebração');
  await page.screenshot({ path: path.join(OUT, 'final.png') });
  await page.click('[data-action="final-close"]');
  await page.waitForSelector('#screen-worlds.active');
  await page.screenshot({ path: path.join(OUT, 'mundos.png') });

  console.log('\n== Troca de perfis ==');
  await page.click('#screen-worlds [data-action="home"]');
  await page.click('.profile-chip');
  await page.click('.profile-card.new');
  await page.fill('#profile-name', 'Beto');
  await page.click('#profile-form button[type="submit"]');
  await page.waitForSelector('#screen-home.active');
  ok(/BETO/.test(await page.textContent('.chip-name')), 'novo perfil BETO selecionado');
  await page.click('[data-action="play"]');
  await page.click('.profile-card.current');
  await waitOverlay(page, 'ov-intro');
  ok((await page.textContent('#intro-mission')).includes('01'), 'novo perfil começa na missão 01');
  await page.click('[data-action="intro-map"]');
  await page.waitForSelector('#screen-map.active');
  ok(await page.$$eval('.level-node.locked', (e) => e.length) === 9, 'novo perfil tem fases 2–10 bloqueadas');
  await page.click('#screen-map [data-action="worlds"]');
  await page.click('#screen-worlds [data-action="home"]');
  await page.click('.profile-chip');
  const cards = await page.$$('.profile-card:not(.new)');
  ok(cards.length === 2, 'dois perfis cadastrados');
  await cards[0].click();
  await page.waitForSelector('#screen-home.active');
  ok(/ANA · ★/.test(await page.textContent('.chip-name')), 'voltou ao perfil ANA com o progresso preservado');

  console.log('\n== Painel do professor ==');
  await page.click('[data-action="teacher"]');
  for (const k of '0000') await page.click(`.key[data-k="${k}"]`);
  ok(/incorreto/.test(await page.textContent('#pin-error')), 'PIN errado é recusado');
  await page.waitForTimeout(1300);
  for (const k of '0694') await page.click(`.key[data-k="${k}"]`);
  await page.waitForSelector('.t-cards');
  ok((await page.$$('.t-card')).length === 2, 'painel lista os 2 perfis');
  await page.screenshot({ path: path.join(OUT, 'professor-lista.png') });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-t="csv-all"]')]);
  const csvPath = path.join(OUT, 'resultados.csv');
  await dl.saveAs(csvPath);
  const csv = fs.readFileSync(csvPath, 'utf8');
  ok(csv.includes('CACHECOL') && csv.split('\n').length >= 122, 'CSV exportado com as 60 fases de cada perfil');
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-t="csv-history"]')]);
  await dl2.saveAs(path.join(OUT, 'historico.csv'));
  ok(fs.readFileSync(path.join(OUT, 'historico.csv'), 'utf8').includes('Concluída'), 'CSV de histórico exportado');
  await page.click('.t-card:first-child [data-t="detail"]');
  await page.waitForSelector('.t-table');
  const rows = await page.$$eval('.t-detail .t-table', (t) => t[0].tBodies[0].rows.length);
  ok(rows === 60, 'detalhe mostra as 60 fases');
  ok(/60<\/b>fases concluídas/.test(await page.innerHTML('.t-grid.wide')), 'detalhe mostra 60 fases concluídas');
  await page.screenshot({ path: path.join(OUT, 'professor-detalhe.png'), fullPage: false });
  // novo perfil pelo painel
  await page.click('[data-t="list"]');
  await page.click('[data-t="new"]');
  await page.fill('#t-new-name', 'Turma A 07');
  await page.click('[data-t="new-save"]');
  ok((await page.$$('.t-card')).length === 3, 'professor criou um novo perfil');
  // liberar fases e reiniciar progresso do Beto
  const cardsT = await page.$$('.t-card');
  await (await cardsT[1].$('[data-t="detail"]')).click();
  await page.click('[data-t="unlock"]');
  ok(/BLOQUEAR FASES/.test(await page.textContent('[data-t="unlock"]')), 'liberar todas as fases funciona');
  await page.click('[data-t="reset"]');
  await waitOverlay(page, 'ov-confirm');
  await page.click('[data-action="confirm-yes"]');
  await page.waitForTimeout(300);
  ok(/0<\/b>fases concluídas/.test(await page.innerHTML('.t-grid.wide')), 'reiniciar progresso funciona');
  await page.click('[data-action="teacher-exit"]');

  console.log('\n== Configurações ==');
  await page.click('[data-action="settings"]');
  await page.click('[data-set="sound"]');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cacadores-de-letras:v1')).settings.sound);
  ok(saved === false, 'som desligado e salvo');
  await page.click('[data-set="sound"]');
  await page.click('#screen-settings [data-action="home"]');

  console.log('\n== Responsividade ==');
  await page.click('.profile-chip');
  await (await page.$$('.profile-card:not(.new)'))[1].click(); // BETO (progresso reiniciado)
  await page.waitForSelector('#screen-home.active');
  for (const [w, h, name] of [[1024, 768, 'ipad-paisagem'], [1180, 820, 'ipad-air'], [1280, 800, 'tablet-android'], [1366, 768, 'notebook'], [1920, 1080, 'desktop'], [800, 1280, 'tablet-retrato']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, `inicio-${name}.png`) });
    const hs = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
    ok(hs.sw <= hs.iw, `${name}: tela inicial sem rolagem horizontal`);
    await page.click('[data-action="continue"]');
    await waitOverlay(page, 'ov-intro');
    if (await page.$('#ov-rotate.open')) await page.click('[data-action="rotate-ok"]');
    await page.click('[data-action="start-level"]');
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      const bb = document.querySelector('.bottom-bar').getBoundingClientRect();
      const hint = document.querySelector('#btn-hint').getBoundingClientRect();
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, bottom: bb.bottom, ih: innerHeight, hintH: hint.height };
    });
    ok(m.sw <= m.iw && m.bottom <= m.ih + 1, `${name} ${w}x${h}: tela de jogo cabe sem rolagem`);
    ok(m.hintH >= 56, `${name}: botão de dica grande (${Math.round(m.hintH)}px)`);
    await page.screenshot({ path: path.join(OUT, `responsivo-${name}.png`) });
    await page.click('[data-action="pause"]');
    await waitOverlay(page, 'ov-pause');
    await page.click('[data-action="pause-home"]');
    await page.waitForSelector('#screen-home.active');
  }

  console.log('\n== Console ==');
  ok(errors.length === 0, 'nenhum erro no console' + (errors.length ? ': ' + errors.join(' | ') : ''));

  console.log('\nEstrelas por fase: ' + results.map((r) => r.word + '=' + r.stars).join(', '));
  console.log(failures ? `\n${failures} verificação(ões) falharam.` : '\nTODOS OS TESTES PASSARAM ✅');
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
