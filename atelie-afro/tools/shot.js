// uso: node shot.js <html> <png> [w] [h]
const { chromium } = require('playwright');
(async () => {
  const [, , html, png, w, h] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +(w || 1200), height: +(h || 900) } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + require('path').resolve(html));
  await p.waitForTimeout(400);
  await p.screenshot({ path: png, fullPage: true });
  if (errs.length) console.log('ERROS:', errs.join('\n'));
  await b.close();
})();
