// Captura a tela do jogo em vários tamanhos (notebook, tablet, celular).
// Uso: node tools/sizes.js <pasta-das-capturas> <número-da-missão>
const { chromium } = require('playwright');
(async () => {
  const [,, OUT, id] = process.argv;
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 768], [768, 1024], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' });
    await ctx.addInitScript(() => localStorage.setItem('mosaicoSecreto.v1', JSON.stringify({ unlockAll: true })));
    const p = await ctx.newPage();
    p.setDefaultTimeout(5000);
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:8765/#/missao/' + id);
    await p.waitForSelector('.cell');
    await p.waitForTimeout(500);
    const pts = await p.$$eval('.cell', (cs) => cs.filter((_, i) => i % 3 === 0).slice(0, 40).map((e) => {
      const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2];
    }));
    for (const [x, y] of pts) await p.mouse.click(x, y);
    await p.waitForTimeout(400);
    const cell = await p.$eval('.cell', (e) => Math.round(e.getBoundingClientRect().width));
    const painted = await p.$$eval('.cell.painted', (c) => c.length);
    console.log(`${w}x${h} quadradinho=${cell}px pintados=${painted}`, errs.join(' '));
    await p.screenshot({ path: `${OUT}/g-${w}.png` });
    await ctx.close();
  }
  await b.close();
})();
