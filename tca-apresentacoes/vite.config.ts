import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Gera um único arquivo HTML (com fontes, estilos e scripts embutidos).
// Assim o site funciona offline e não depende de nenhum servidor externo.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 4000 },
});
