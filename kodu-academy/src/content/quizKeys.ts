/**
 * GABARITO dos testes de aprendizagem.
 *
 * Este arquivo NÃO é importado pela interface no modo Supabase: o gabarito
 * vai para o banco (tabela quiz_keys, sem acesso para alunos) através do script
 * `npm run gen:sql`, e a correção acontece no servidor.
 * No modo demonstração (sem banco), ele é carregado para corrigir localmente.
 *
 * Formato: { [idDaFase]: { [idDaPergunta]: idDaAlternativaCorreta } }
 */
export const QUIZ_KEYS: Record<number, Record<string, string>> = {
  1: { q1: 'b', q2: 'a', q3: 'b', q4: 'c' },
  2: { q1: 'a', q2: 'c', q3: 'b', q4: 'a' },
  3: { q1: 'b', q2: 'a', q3: 'c', q4: 'b' },
  4: { q1: 'b', q2: 'c', q3: 'a', q4: 'a' },
  5: { q1: 'b', q2: 'b', q3: 'a', q4: 'b' },
  6: { q1: 'a', q2: 'b', q3: 'b', q4: 'b' },
  7: { q1: 'b', q2: 'c', q3: 'b', q4: 'a' },
  8: { q1: 'b', q2: 'b', q3: 'b', q4: 'b' },
  9: { q1: 'b', q2: 'b', q3: 'b', q4: 'c' },
  10: { q1: 'a', q2: 'b', q3: 'a', q4: 'b' },
  11: { q1: 'a', q2: 'b', q3: 'c', q4: 'a' },
  12: { q1: 'a', q2: 'c', q3: 'b', q4: 'a' },
  13: { q1: 'b', q2: 'b', q3: 'a', q4: 'b' },
  14: { q1: 'a', q2: 'b', q3: 'b', q4: 'b' },
  15: { q1: 'b', q2: 'a', q3: 'a', q4: 'b' },
  16: { q1: 'b', q2: 'b', q3: 'b', q4: 'a' },
  17: { q1: 'b', q2: 'c', q3: 'b', q4: 'a' },
  18: { q1: 'b', q2: 'b', q3: 'b', q4: 'c' },
  19: { q1: 'b', q2: 'b', q3: 'b', q4: 'a' },
  20: { q1: 'b', q2: 'a', q3: 'a', q4: 'b', q5: 'b' },
};
