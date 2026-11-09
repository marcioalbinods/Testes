// Teste de ponta a ponta: percorre as telas e joga missões.
// Uso: python3 -m http.server 8765 (na pasta mosaico-secreto) e depois
//      node tools/e2e.js <pasta-das-capturas> [largura] [altura]
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +process.argv[3] || 1366, height: +process.argv[4] || 768 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const base = 'http://localhost:8765/';
  await p.goto(base); await p.waitForTimeout(1200);
  await p.screenshot({ path: OUT + '/1-home.png' });
  await p.click('#btnPlay'); await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + '/2-mapa.png', fullPage: true });
  await p.click('.world[data-w="1"]'); await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + '/3-mundo.png', fullPage: true });
  await p.click('.mission[data-id="1"]'); await p.waitForTimeout(600);
  const n = await p.$$eval('.cell', c => c.length);
  for (let i = 0; i < n / 2; i++) await p.click(`.cell[data-i="${i}"]`);
  await p.click('.chip'); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/4-jogo.png' });
  await p.click('#back'); await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/3b-mundo-parcial.png' });
  await p.click('.mission[data-id="1"]'); await p.waitForTimeout(500);
  const left = await p.$$eval('.cell:not(.painted)', c => c.length);
  console.log('células restantes após retomar:', left, 'de', n);
  const cells = await p.$$('.cell:not(.painted)');
  for (const c of cells) { if (await c.evaluate(e => !e.classList.contains('painted'))) await c.click(); }
  await p.waitForTimeout(2600);
  console.log('rota após terminar:', await p.evaluate(() => location.hash));
  await p.screenshot({ path: OUT + '/5-concluida.png' });
  await p.goto(base + '#/galeria'); await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/6-galeria.png', fullPage: true });
  await p.goto(base + '#/'); await p.waitForTimeout(400);
  await p.click('#btnTeacher');
  const q = await p.$eval('.gate .q', e => e.textContent);
  const [a, bb] = q.match(/\d+/g).map(Number);
  await p.fill('#gIn', String(a * bb)); await p.click('#gOk'); await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + '/7-professor.png', fullPage: true });
  await p.click('#tUnlock'); await p.waitForTimeout(300);
  await p.goto(base + '#/missao/50'); await p.waitForTimeout(700);
  await p.screenshot({ path: OUT + '/8-jogo50.png' });
  const r0 = await p.$eval('.cell[data-i="0"]', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width]; });
  await p.mouse.move(r0[0], r0[1]); await p.mouse.down();
  for (let k = 1; k < 18; k++) await p.mouse.move(r0[0] + k * (r0[2] + 3), r0[1], { steps: 2 });
  await p.mouse.up();
  console.log('pintadas arrastando:', await p.$$eval('.cell.painted', c => c.length));
  console.log('ERROS:', errs.length ? errs.join('\n') : 'nenhum');
  await b.close();
})();
