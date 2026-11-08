// Gera as versões publicáveis a partir do build (dist/index.html):
//  - ../tca/index.html  → página pronta para o GitHub Pages (arquivo único, funciona offline)
//  - dist-artifact/tca.html → conteúdo da página para publicar como Artifact no claude.ai
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
mkdirSync('../tca', { recursive: true });
writeFileSync('../tca/index.html', html);
// config.json guarda o endereço do receptor do professor: nunca sobrescrever um que já existe.
if (!existsSync('../tca/config.json')) copyFileSync('public/config.json', '../tca/config.json');

const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const keep = head
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .trim();
mkdirSync('dist-artifact', { recursive: true });
writeFileSync('dist-artifact/tca.html', keep + '\n' + body.trim() + '\n');
console.log('ok:', (html.length / 1024).toFixed(0) + ' KB');
