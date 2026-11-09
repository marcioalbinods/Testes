// Copia o site gerado (um único index.html) para a pasta ../arduino, publicada pelo GitHub Pages.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../dist/index.html');
const destDir = resolve(here, '../../arduino');
mkdirSync(destDir, { recursive: true });
copyFileSync(src, resolve(destDir, 'index.html'));
console.log('Publicado em', resolve(destDir, 'index.html'));
