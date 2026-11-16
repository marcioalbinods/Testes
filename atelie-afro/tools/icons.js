// gera os ícones PNG a partir do SVG
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  for (const n of [192, 512]) {
    const p = await b.newPage({ viewport: { width: n, height: n } });
    await p.goto('file://' + path.resolve(__dirname, '../assets/icons/icon.svg'));
    await p.screenshot({ path: path.resolve(__dirname, `../assets/icons/icon-${n}.png`), omitBackground: true });
    await p.close();
  }
  await b.close();
})();
