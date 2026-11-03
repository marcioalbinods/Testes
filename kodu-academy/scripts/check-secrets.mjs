// Falha se o site compilado contiver uma chave SECRETA do Supabase.
// Procura valores reais de chave (não apenas o texto "sb_secret_" que a biblioteca usa internamente).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
const walk = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : files.push(join(d, f))));
walk(process.argv[2] ?? 'dist');

const problems = [];
for (const f of files.filter((x) => /\.(js|html|css|json|txt|map)$/.test(x))) {
  const text = readFileSync(f, 'utf8');
  if (/sb_secret_[A-Za-z0-9_-]{16,}/.test(text)) problems.push(`${f}: chave sb_secret_ encontrada`);
  for (const jwt of text.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g) ?? []) {
    try {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
      if (payload.role && payload.role !== 'anon') problems.push(`${f}: chave JWT com papel "${payload.role}"`);
    } catch {
      /* não é um JWT válido */
    }
  }
}
if (problems.length) {
  console.error('CHAVE SECRETA NO SITE! Use apenas a chave pública (anon/publishable).\n' + problems.join('\n'));
  process.exit(1);
}
console.log(`OK: nenhuma chave secreta em ${files.length} arquivos.`);
