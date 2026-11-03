import { supabaseConfigProblems } from '../src/services/supabaseConfig';
import { existsSync, readFileSync } from 'node:fs';


// Usa as variáveis de ambiente, se existirem; senão, o arquivo .env.production (mesma ordem do Vite).
const file: Record<string, string> = {};
if (existsSync('.env.production')) {
  for (const line of readFileSync('.env.production', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
    if (m) file[m[1]] = m[2];
  }
}
const url = process.env.VITE_SUPABASE_URL || file.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || file.VITE_SUPABASE_ANON_KEY;
if (!url && !key) {
  console.log('::warning::Secrets do Supabase ausentes: site publicado em MODO DEMONSTRAÇÃO.');
  process.exit(0);
}
const problems = supabaseConfigProblems(url, key);
if (problems.length) {
  for (const p of problems) console.log(`::error::${p}`);
  console.log('Corrija em Settings > Secrets and variables > Actions e rode a publicação de novo.');
  process.exit(1);
}
console.log('Configuração do Supabase válida: site conectado ao banco (modo real).');
