import { PHASES, TOTAL_PHASES, requiredChecklistIds } from './phases';
import { QUIZ_KEYS } from './quizKeys';
import { validateContent } from './validate';
import { MODULES } from './modules';
import { GLOSSARY } from './glossary';

describe('conteúdo pedagógico', () => {
  it('tem exatamente 20 fases numeradas de 1 a 20', () => {
    expect(TOTAL_PHASES).toBe(20);
    expect(PHASES.map((p) => p.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('organiza 5 módulos com 4 fases cada', () => {
    expect(MODULES).toHaveLength(5);
    for (const m of MODULES) expect(PHASES.filter((p) => p.module === m.id)).toHaveLength(4);
  });

  it('passa em todas as verificações de completude e coerência', () => {
    expect(validateContent(PHASES, QUIZ_KEYS)).toEqual([]);
  });

  it('tem os 20 elementos obrigatórios em cada fase', () => {
    for (const p of PHASES) {
      expect(p.title && p.difficulty && p.objective && p.expectedResult && p.extraChallenge).toBeTruthy();
      expect(p.skills.length).toBeGreaterThan(1);
      expect(p.estimatedMinutes[0]).toBeLessThanOrEqual(p.estimatedMinutes[1]);
      expect(p.materials.length).toBeGreaterThan(0);
      expect(p.concept.paragraphs.length).toBeGreaterThan(0);
      expect(p.steps.length).toBeGreaterThanOrEqual(5);
      expect(p.steps.filter((s) => s.where).length).toBeGreaterThanOrEqual(Math.ceil(p.steps.length / 2));
      expect(requiredChecklistIds(p).length).toBeGreaterThanOrEqual(3);
      expect(p.hints).toHaveLength(3);
      expect(p.troubleshooting.length).toBeGreaterThanOrEqual(3);
      expect(p.quiz.length).toBeGreaterThanOrEqual(4);
      expect(p.completionCriteria.length).toBeGreaterThanOrEqual(3);
      expect(p.reflection.prompt.length).toBeGreaterThan(10);
    }
  });

  it('segue a progressão de dificuldade', () => {
    const diff = (id: number) => PHASES[id - 1].difficulty;
    [1, 2, 3, 4].forEach((id) => expect(diff(id)).toBe('facil'));
    [9, 10, 11, 12].forEach((id) => expect(diff(id)).not.toBe('facil'));
    [14, 15, 16, 17, 18, 19, 20].forEach((id) => expect(diff(id)).toBe('dificil'));
  });

  it('as fases de programação (4 a 17) mostram regras WHEN/DO', () => {
    for (const p of PHASES.filter((x) => x.id >= 4 && x.id <= 17 && x.id !== 9)) {
      const hasRules = p.rules.length > 0 || p.steps.some((s) => s.rules);
      expect(hasRules, `fase ${p.id}`).toBe(true);
    }
  });

  it('o glossário apresenta os termos de forma progressiva', () => {
    const ids = new Set(PHASES.flatMap((p) => p.glossary));
    for (const g of GLOSSARY) expect(ids.has(g.id), g.id).toBe(true);
    for (const p of PHASES) for (const gid of p.glossary) expect(GLOSSARY.find((g) => g.id === gid)!.phase).toBe(p.id);
  });

  it('as perguntas têm alternativas variadas (a resposta certa não é sempre a mesma letra)', () => {
    const letters = new Set(Object.values(QUIZ_KEYS).flatMap((k) => Object.values(k)));
    expect(letters.size).toBeGreaterThanOrEqual(3);
  });
});
