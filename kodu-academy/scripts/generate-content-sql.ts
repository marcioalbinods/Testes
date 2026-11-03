import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { buildContentSql, CONTENT_SQL_PATH } from './content-sql';
import { validateContent } from '../src/content/validate';
import { PHASES } from '../src/content/phases';
import { QUIZ_KEYS } from '../src/content/quizKeys';

const problems = validateContent(PHASES, QUIZ_KEYS);
if (problems.length) {
  console.error('Conteúdo com problemas:\n' + problems.join('\n'));
  process.exit(1);
}
writeFileSync(CONTENT_SQL_PATH, buildContentSql());
console.log(`Gerado ${CONTENT_SQL_PATH} (${PHASES.length} fases).`);

// Arquivo único para colar no SQL Editor do Supabase (todas as migrações, em ordem).
const dir = 'supabase/migrations';
const all = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  .map((f) => `-- ===== ${f} =====\n` + readFileSync(`${dir}/${f}`, 'utf8')).join('\n');
writeFileSync('supabase/setup-completo.sql',
  '-- Kodu Academy: configuração completa do banco. Cole TUDO no SQL Editor do Supabase e clique em Run.\n' +
  '-- Execute apenas uma vez em um projeto novo.\n\n' + all);
console.log('Gerado supabase/setup-completo.sql');
