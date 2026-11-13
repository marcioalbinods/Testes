// Configuração do Supabase: vem do arquivo .env (na hora de gerar o site)
// ou do arquivo config.json publicado ao lado do index.html.
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

let cached: AppConfig | null = null;

function valid(c: Partial<AppConfig> | null | undefined): c is AppConfig {
  return !!c && typeof c.supabaseUrl === 'string' && /^https?:\/\//.test(c.supabaseUrl) && typeof c.supabaseAnonKey === 'string' && c.supabaseAnonKey.length > 20;
}

/** Recusa chaves secretas por engano (service_role nunca pode ir para o navegador). */
export function looksSecret(key: string) {
  if (key.startsWith('sb_secret_')) return true;
  try {
    const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

export async function loadConfig(): Promise<AppConfig | null> {
  if (cached) return cached;
  const env = { supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string, supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string };
  let cfg: AppConfig | null = valid(env) ? env : null;
  if (!cfg) {
    try {
      const r = await fetch('./config.json', { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        if (valid(j)) cfg = { supabaseUrl: j.supabaseUrl.replace(/\/+$/, ''), supabaseAnonKey: j.supabaseAnonKey };
      }
    } catch {
      /* sem config.json */
    }
  }
  if (cfg && looksSecret(cfg.supabaseAnonKey)) {
    console.error('A chave configurada é SECRETA (service_role). Use a chave pública "anon".');
    return null;
  }
  cached = cfg;
  return cfg;
}
