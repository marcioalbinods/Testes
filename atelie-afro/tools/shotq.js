// node shotq.js "col=1&from=1&to=6" out.png [w]
const { chromium } = require('playwright');
(async () => {
  const [, , q, png, w] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +(w || 1500), height: 600 } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto('file://' + __dirname + '/preview.html?' + q);
  await p.waitForTimeout(300);
  await p.screenshot({ path: png, fullPage: true });
  await b.close();
})();
