import { PHASES } from '../content/phases';
import {
  emptyProgress, isUnlocked, missingCriteria, missionPercent, phaseState, resumePhaseId, trailPercent, type ProgressMap,
} from './progression';

const done = (id: number) => ({ ...emptyProgress(id), status: 'completed' as const });

describe('regras de progressão', () => {
  it('libera só a fase 1 no início', () => {
    expect(isUnlocked(1, {})).toBe(true);
    expect(isUnlocked(2, {})).toBe(false);
    expect(phaseState(2, {})).toBe('locked');
    expect(resumePhaseId({})).toBe(1);
  });

  it('libera a próxima fase quando a anterior é concluída', () => {
    const m: ProgressMap = { 1: done(1) };
    expect(isUnlocked(2, m)).toBe(true);
    expect(isUnlocked(3, m)).toBe(false);
    expect(phaseState(1, m)).toBe('completed');
    expect(phaseState(2, m)).toBe('available');
    expect(resumePhaseId(m)).toBe(2);
  });

  it('respeita a liberação manual do professor', () => {
    const m: ProgressMap = { 5: { ...emptyProgress(5), manuallyUnlocked: true } };
    expect(isUnlocked(5, m)).toBe(true);
    expect(isUnlocked(6, m)).toBe(false);
  });

  it('não considera um clique em "concluído" como domínio: exige os 4 critérios', () => {
    const phase = PHASES[0];
    expect(missingCriteria(phase, undefined)).toEqual(['checklist', 'quiz', 'reflection', 'review']);
    const p = {
      ...emptyProgress(1),
      checklist: phase.checklist.filter((c) => c.required).map((c) => c.id),
      quizPassed: true,
      reflection: 'Aprendi a criar e salvar um mundo.',
      reviewed: true,
    };
    expect(missingCriteria(phase, p)).toEqual([]);
    expect(missingCriteria(phase, { ...p, reflection: 'curta' })).toEqual(['reflection']);
    expect(missingCriteria(phase, { ...p, checklist: p.checklist.slice(1) })).toEqual(['checklist']);
  });

  it('itens opcionais não são exigidos', () => {
    const phase = PHASES[0];
    const onlyRequired = phase.checklist.filter((c) => c.required).map((c) => c.id);
    expect(missingCriteria(phase, { ...emptyProgress(1), checklist: onlyRequired })).not.toContain('checklist');
  });

  it('calcula o percentual da missão e só mostra 100% na conclusão', () => {
    const phase = PHASES[0];
    expect(missionPercent(phase, undefined)).toBe(0);
    const all = {
      ...emptyProgress(1),
      checklist: phase.checklist.map((c) => c.id),
      quizPassed: true,
      reflection: 'Uma reflexão completa e longa.',
      reviewed: true,
    };
    expect(missionPercent(phase, all)).toBe(99);
    expect(missionPercent(phase, { ...all, status: 'completed' })).toBe(100);
  });

  it('calcula o percentual da trilha', () => {
    const m: ProgressMap = {};
    for (let i = 1; i <= 5; i++) m[i] = done(i);
    expect(trailPercent(m)).toBe(25);
    expect(resumePhaseId(m)).toBe(6);
  });
});
