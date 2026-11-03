/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// O modo de demonstração (dados só no navegador) é decidido na COMPILAÇÃO:
// se as variáveis do Supabase não existirem, o site é gerado em modo demonstração.
// Assim, o gabarito dos testes só entra no pacote publicado no modo demonstração.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const hasSupabase = Boolean(env.VITE_SUPABASE_URL?.trim() && env.VITE_SUPABASE_ANON_KEY?.trim());
  const isTest = mode === 'test';
  return {
    base: env.VITE_BASE_PATH || './',
    plugins: [react()],
    define: {
      __DEMO_MODE__: JSON.stringify(isTest ? true : !hasSupabase),
    },
    build: { sourcemap: false, chunkSizeWarningLimit: 900 },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    },
  };
});
