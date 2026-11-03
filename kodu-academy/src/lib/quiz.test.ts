import { gradeQuiz, seededShuffle } from './quiz';

describe('teste de aprendizagem', () => {
  const key = { q1: 'a', q2: 'b', q3: 'c', q4: 'd' };
  it('corrige e aplica o mínimo de acertos', () => {
    const r = gradeQuiz({ q1: 'a', q2: 'b', q3: 'c', q4: 'x' }, key, 3);
    expect(r).toMatchObject({ score: 3, total: 4, passed: true });
    expect(r.results).toEqual({ q1: true, q2: true, q3: true, q4: false });
    expect(gradeQuiz({ q1: 'a' }, key, 3).passed).toBe(false);
  });
  it('embaralha de forma determinística, sem perder alternativas', () => {
    const items = ['a', 'b', 'c', 'd'];
    const s1 = seededShuffle(items, 'aluno-1');
    expect(seededShuffle(items, 'aluno-1')).toEqual(s1);
    expect([...s1].sort()).toEqual(items);
    const variants = new Set(Array.from({ length: 20 }, (_, i) => seededShuffle(items, `s${i}`).join('')));
    expect(variants.size).toBeGreaterThan(3);
  });
});
