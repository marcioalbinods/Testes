const { chromium } = require('playwright');
(async () => {
  const [,, url, out, w, h, full] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w || 1400, height: +h || 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(800);
  await p.screenshot({ path: out, fullPage: full !== '0' });
  if (errs.length) console.log('ERROS:', errs.join('\n'));
  await b.close();
})();
