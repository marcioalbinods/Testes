// Capturas da interface para conferência: node tools/ui.js <largura> <altura> <prefixo-dos-arquivos>
// (precisa de um servidor local: python3 -m http.server 8765)
const { chromium } = require('playwright');
(async () => {
  const [, , w, h, pre] = process.argv;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8765/');
  await p.waitForTimeout(600);
  await p.screenshot({ path: pre + '-1inicio.png' });
  await p.click('#btn-galeria');
  await p.waitForTimeout(500);
  await p.screenshot({ path: pre + '-2galeria.png' });
  await p.click('.cartao-abrir');
  await p.waitForTimeout(600);
  // pinta várias regiões tocando no centro de cada uma
  const pts = await p.evaluate(() => {
    const regs = Array.from(document.querySelectorAll('#papel .r'));
    const out = [];
    for (let i = 0; i < regs.length; i += Math.max(1, Math.floor(regs.length / 25))) {
      const r = regs[i].getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const el = document.elementFromPoint(x, y);
      if (el === regs[i]) out.push([x, y]);
    }
    return out;
  });
  const cores = await p.$$('.cor');
  for (let k = 0; k < pts.length; k++) {
    await cores[(k * 7) % cores.length].tap();
    await p.touchscreen.tap(pts[k][0], pts[k][1]);
  }
  await p.waitForTimeout(400);
  await p.screenshot({ path: pre + '-3pintura.png' });
  const n = await p.evaluate(() => Object.keys(AA.Pintura.fills).length);
  console.log('regioes pintadas:', n, 'de', pts.length, 'toques');
  if (errs.length) console.log('ERROS:', errs.join('\n'));
  await b.close();
})();
