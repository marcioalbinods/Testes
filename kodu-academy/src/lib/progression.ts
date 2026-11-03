import type { Phase } from '../content/types';
import { PHASES, requiredChecklistIds } from '../content/phases';

/** Mínimo de caracteres para a reflexão (igual ao servidor). */
export const REFLECTION_MIN = 20;

export interface PhaseProgress {
  phaseId: number;
  status: 'in_progress' | 'completed';
  checklist: string[];
  reviewed: boolean;
  reflection: string;
  quizPassed: boolean;
  quizBestScore: number;
  quizAttempts: number;
  hintsViewed: number;
  manuallyUnlocked: boolean;
  completedByTeacher: boolean;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
}

export type ProgressMap = Record<number, PhaseProgress>;
export type PhaseState = 'locked' | 'available' | 'in_progress' | 'completed';
export type Criterion = 'checklist' | 'quiz' | 'reflection' | 'review';

export const CRITERION_LABEL: Record<Criterion, string> = {
  checklist: 'Marcar todos os itens obrigatórios do checklist',
  quiz: 'Ser aprovado no teste de aprendizagem',
  reflection: `Escrever a reflexão (pelo menos ${REFLECTION_MIN} caracteres)`,
  review: 'Confirmar que revisou as instruções',
};

export function emptyProgress(phaseId: number): PhaseProgress {
  return {
    phaseId,
    status: 'in_progress',
    checklist: [],
    reviewed: false,
    reflection: '',
    quizPassed: false,
    quizBestScore: 0,
    quizAttempts: 0,
    hintsViewed: 0,
    manuallyUnlocked: false,
    completedByTeacher: false,
    startedAt: null,
    completedAt: null,
    updatedAt: null,
  };
}

/** Mesma regra de private.phase_unlocked no banco. */
export function isUnlocked(phaseId: number, progress: ProgressMap): boolean {
  if (phaseId === 1) return true;
  if (progress[phaseId - 1]?.status === 'completed') return true;
  const own = progress[phaseId];
  return Boolean(own && (own.manuallyUnlocked || own.status === 'completed'));
}

export function phaseState(phaseId: number, progress: ProgressMap): PhaseState {
  const p = progress[phaseId];
  if (p?.status === 'completed') return 'completed';
  if (!isUnlocked(phaseId, progress)) return 'locked';
  if (p && (p.checklist.length > 0 || p.quizAttempts > 0 || p.reflection || p.reviewed)) return 'in_progress';
  return 'available';
}

/** Mesma regra de private.missing_criteria no banco. */
export function missingCriteria(phase: Phase, p: PhaseProgress | undefined): Criterion[] {
  const prog = p ?? emptyProgress(phase.id);
  const missing: Criterion[] = [];
  if (!requiredChecklistIds(phase).every((id) => prog.checklist.includes(id))) missing.push('checklist');
  if (!prog.quizPassed) missing.push('quiz');
  if (prog.reflection.trim().length < REFLECTION_MIN) missing.push('reflection');
  if (!prog.reviewed) missing.push('review');
  return missing;
}

/** Percentual da missão (0–100) para a barra de progresso da fase. */
export function missionPercent(phase: Phase, p: PhaseProgress | undefined): number {
  if (p?.status === 'completed') return 100;
  const prog = p ?? emptyProgress(phase.id);
  const req = requiredChecklistIds(phase);
  const doneReq = req.filter((id) => prog.checklist.includes(id)).length;
  const checklistPart = req.length ? (doneReq / req.length) * 55 : 55;
  const quizPart = prog.quizPassed ? 25 : 0;
  const reflectionPart = Math.min(prog.reflection.trim().length / REFLECTION_MIN, 1) * 10;
  const reviewPart = prog.reviewed ? 10 : 0;
  // Só chega a 100% quando a fase é concluída de fato.
  return Math.min(99, Math.round(checklistPart + quizPart + reflectionPart + reviewPart));
}

export function completedCount(progress: ProgressMap): number {
  return Object.values(progress).filter((p) => p.status === 'completed').length;
}

export function trailPercent(progress: ProgressMap, total = PHASES.length): number {
  return Math.round((completedCount(progress) / total) * 100);
}

/** Fase para "continuar de onde parou": a primeira liberada e não concluída. */
export function resumePhaseId(progress: ProgressMap): number | null {
  const next = PHASES.find((ph) => isUnlocked(ph.id, progress) && progress[ph.id]?.status !== 'completed');
  return next ? next.id : null;
}

/** Fase "atual" para relatórios: a de maior número liberada e não concluída. */
export function currentPhaseId(progress: ProgressMap): number {
  const resume = resumePhaseId(progress);
  return resume ?? PHASES.length;
}

/** Texto explicando por que uma fase está bloqueada. */
export function lockReason(phaseId: number): string {
  return `Conclua a fase ${phaseId - 1} para liberar (ou peça ao professor uma liberação manual).`;
}

/** Habilidades desenvolvidas: soma das habilidades das fases concluídas. */
export function earnedSkills(progress: ProgressMap): { phaseId: number; skill: string }[] {
  return PHASES.filter((ph) => progress[ph.id]?.status === 'completed').flatMap((ph) =>
    ph.skills.map((skill) => ({ phaseId: ph.id, skill })),
  );
}
