/** Normaliza e valida a configuração do Supabase. As mensagens nunca exibem os valores. */
export function normalizeSupabaseUrl(raw: string | undefined): string {
  return (raw ?? '').trim().replace(/\/+$/, '').replace(/\/(rest|auth)\/v1$/, '');
}

export function supabaseConfigProblems(rawUrl: string | undefined, rawKey: string | undefined): string[] {
  const url = normalizeSupabaseUrl(rawUrl);
  const key = (rawKey ?? '').trim();
  const problems: string[] = [];
  if (!url) problems.push('VITE_SUPABASE_URL está vazio.');
  else if (/^(sb_|eyJ)/.test(url)) problems.push('VITE_SUPABASE_URL contém uma chave, não o endereço. Os dois valores parecem trocados.');
  else if (url.includes('supabase.com/dashboard')) problems.push('VITE_SUPABASE_URL é o endereço do painel. Use a "Project URL" (https://xxxx.supabase.co).');
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(url)) problems.push('VITE_SUPABASE_URL não está no formato https://xxxx.supabase.co.');
  if (!key) problems.push('VITE_SUPABASE_ANON_KEY está vazio.');
  else if (/^https?:/i.test(key)) problems.push('VITE_SUPABASE_ANON_KEY contém um endereço, não a chave. Os dois valores parecem trocados.');
  else if (key.startsWith('sb_secret_')) problems.push('VITE_SUPABASE_ANON_KEY é uma chave SECRETA. Use a chave publishable/anon.');
  else if (!/^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.test(key))
    problems.push('VITE_SUPABASE_ANON_KEY não parece uma chave pública do Supabase (deve começar com sb_publishable_ ou eyJ, sem espaços).');
  return problems;
}
