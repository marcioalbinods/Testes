const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '../assets/icons/icon.svg'), 'utf8');
  const b = await chromium.launch();
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<style>body{margin:0}</style>${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}`);
    await p.screenshot({ path: path.join(__dirname, `../assets/icons/icon-${s}.png`), omitBackground: true });
  }
  await b.close();
})();
