import { AppError, type Backend } from './types';
import { normalizeSupabaseUrl, supabaseConfigProblems } from './supabaseConfig';

let instance: Promise<Backend> | null = null;

/**
 * Carrega o backend uma única vez.
 * __DEMO_MODE__ é definido na compilação (vite.config.ts): quando o Supabase está configurado,
 * o código de demonstração (e o gabarito dos testes) nem entra no pacote publicado.
 */
export function getBackend(): Promise<Backend> {
  if (!instance) {
    instance = (async () => {
      if (__DEMO_MODE__) {
        const m = await import('./demoBackend');
        return m.createDemoBackend();
      }
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const problems = supabaseConfigProblems(url, key);
      if (problems.length) {
        throw new AppError('Configuração do servidor incorreta. Avise o professor. Detalhe técnico: ' + problems.join(' '), 'config');
      }
      const m = await import('./supabaseBackend');
      return m.createSupabaseBackend(normalizeSupabaseUrl(url), key!.trim());
    })();
  }
  return instance;
}

/** Usado nos testes para trocar o backend. */
export function setBackendForTests(b: Backend | null) {
  instance = b ? Promise.resolve(b) : null;
}
