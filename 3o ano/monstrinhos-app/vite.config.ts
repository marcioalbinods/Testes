import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O jogo é publicado como site estático na pasta "../monstrinhos"
// (GitHub Pages). Todos os caminhos são relativos.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: '../monstrinhos', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
  server: { host: true },
});
