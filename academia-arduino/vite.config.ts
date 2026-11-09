/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Gera um único arquivo HTML com fontes, estilos e scripts embutidos.
// Assim o site funciona no GitHub Pages (em qualquer pasta) e até offline.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 4000, assetsInlineLimit: 100000000 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
