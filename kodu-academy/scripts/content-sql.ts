import { PHASES } from '../src/content/phases';
import { QUIZ_KEYS } from '../src/content/quizKeys';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (xs: string[]) => `array[${xs.map(q).join(', ')}]::text[]`;

/** Gera o SQL que sincroniza a tabela phases e o gabarito (quiz_keys) com src/content. */
export function buildContentSql(): string {
  const lines: string[] = [
    '-- ARQUIVO GERADO AUTOMATICAMENTE por `npm run gen:sql` a partir de src/content.',
    '-- Não edite à mão. Depois de mudar as fases, rode o comando de novo e aplique no Supabase.',
    'begin;',
  ];
  for (const p of PHASES) {
    lines.push(
      `insert into public.phases (id, module, title, checklist_ids, required_ids, quiz_question_ids, quiz_pass_min) values (` +
        `${p.id}, ${p.module}, ${q(p.title)}, ${arr(p.checklist.map((c) => c.id))}, ` +
        `${arr(p.checklist.filter((c) => c.required).map((c) => c.id))}, ${arr(p.quiz.map((x) => x.id))}, ${p.quizPassMin})` +
        ` on conflict (id) do update set module = excluded.module, title = excluded.title, checklist_ids = excluded.checklist_ids,` +
        ` required_ids = excluded.required_ids, quiz_question_ids = excluded.quiz_question_ids, quiz_pass_min = excluded.quiz_pass_min;`,
    );
  }
  lines.push(`delete from public.quiz_keys where phase_id between 1 and 99;`);
  for (const p of PHASES) {
    for (const question of p.quiz) {
      lines.push(
        `insert into public.quiz_keys (phase_id, question_id, correct_option) values (${p.id}, ${q(question.id)}, ${q(QUIZ_KEYS[p.id][question.id])});`,
      );
    }
  }
  lines.push('commit;', '');
  return lines.join('\n');
}

export const CONTENT_SQL_PATH = 'supabase/migrations/20261027000004_content.sql';
