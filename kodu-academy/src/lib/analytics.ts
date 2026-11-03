import { PHASES, getPhase, requiredChecklistIds } from '../content/phases';
import { currentPhaseId, completedCount, trailPercent, type ProgressMap } from './progression';
import { toCsv, type CsvCell } from './csv';
import type { ActivityRow, AttemptRow, ClassRow, ProgressRow, StudentRow, TeacherData } from '../services/types';

/** Dias sem registrar progresso para considerar o aluno inativo. */
export const INACTIVE_DAYS = 7;
/** Tentativas reprovadas na fase atual para sinalizar "precisa de apoio". */
export const SUPPORT_FAILED_ATTEMPTS = 3;

export type StudentStatus = 'nao_iniciou' | 'avancando' | 'precisa_apoio' | 'inativo' | 'concluiu' | 'desativado';

export const STATUS_LABEL: Record<StudentStatus, string> = {
  nao_iniciou: 'Não iniciou',
  avancando: 'Avançando',
  precisa_apoio: 'Precisa de apoio',
  inativo: 'Sem atividade recente',
  concluiu: 'Concluiu a trilha',
  desativado: 'Desativado',
};

export interface StudentSummary {
  student: StudentRow;
  className: string;
  progress: ProgressMap;
  currentPhase: number;
  completed: number;
  percent: number;
  lastProgressAt: string | null;
  status: StudentStatus;
  failedAttemptsCurrent: number;
  totalAttempts: number;
  hintsLevel3: number;
  /** Fases em que o aluno teve dificuldade (2+ reprovações no teste ou dica 3). */
  difficultPhases: number[];
}

export function groupProgress(rows: ProgressRow[]): Map<string, ProgressMap> {
  const map = new Map<string, ProgressMap>();
  for (const r of rows) {
    const m = map.get(r.studentId) ?? {};
    m[r.phaseId] = r;
    map.set(r.studentId, m);
  }
  return map;
}

const maxDate = (...dates: (string | null | undefined)[]): string | null => {
  const valid = dates.filter((d): d is string => Boolean(d));
  if (!valid.length) return null;
  return valid.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
};

export function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}

export function summarizeStudent(
  student: StudentRow,
  progress: ProgressMap,
  attempts: AttemptRow[],
  className: string,
  now: Date,
): StudentSummary {
  const mine = attempts.filter((a) => a.studentId === student.id);
  const current = currentPhaseId(progress);
  const completed = completedCount(progress);
  const lastProgressAt = maxDate(
    student.lastActivityAt,
    ...Object.values(progress).map((p) => p.updatedAt),
    ...mine.map((a) => a.createdAt),
  );
  const failedAttemptsCurrent = mine.filter((a) => a.phaseId === current && !a.passed).length;
  const currentPassed = progress[current]?.quizPassed ?? false;
  const difficultPhases = PHASES.filter((ph) => {
    const fails = mine.filter((a) => a.phaseId === ph.id && !a.passed).length;
    return fails >= 2 || (progress[ph.id]?.hintsViewed ?? 0) >= 3;
  }).map((ph) => ph.id);

  let status: StudentStatus;
  const idle = daysSince(lastProgressAt, now);
  if (!student.active) status = 'desativado';
  else if (completed >= PHASES.length) status = 'concluiu';
  else if (!student.startedAt && !lastProgressAt) status = 'nao_iniciou';
  else if (failedAttemptsCurrent >= SUPPORT_FAILED_ATTEMPTS && !currentPassed) status = 'precisa_apoio';
  else if (idle !== null && idle >= INACTIVE_DAYS) status = 'inativo';
  else status = 'avancando';

  return {
    student,
    className,
    progress,
    currentPhase: current,
    completed,
    percent: trailPercent(progress),
    lastProgressAt,
    status,
    failedAttemptsCurrent,
    totalAttempts: mine.length,
    hintsLevel3: Object.values(progress).filter((p) => p.hintsViewed >= 3).length,
    difficultPhases,
  };
}

export function summarizeAll(data: TeacherData, now = new Date()): StudentSummary[] {
  const byStudent = groupProgress(data.progress);
  const className = new Map(data.classes.map((c) => [c.id, c.name]));
  return data.students
    .map((s) => summarizeStudent(s, byStudent.get(s.id) ?? {}, data.attempts, className.get(s.classId) ?? '—', now))
    .sort((a, b) => a.className.localeCompare(b.className, 'pt-BR') || a.student.displayName.localeCompare(b.student.displayName, 'pt-BR'));
}

export interface PhaseStat {
  phaseId: number;
  title: string;
  reached: number;
  completed: number;
  completionRate: number | null;
  studentsWithAttempts: number;
  avgAttempts: number | null;
  firstTryPassRate: number | null;
  hintsLevel3: number;
  /** Índice 0–1: quanto maior, mais difícil (para ordenar). */
  difficulty: number;
}

export function phaseStats(data: TeacherData): PhaseStat[] {
  const activeIds = new Set(data.students.filter((s) => s.active).map((s) => s.id));
  const progress = data.progress.filter((p) => activeIds.has(p.studentId));
  const attempts = data.attempts.filter((a) => activeIds.has(a.studentId));
  return PHASES.map((ph) => {
    const rows = progress.filter((p) => p.phaseId === ph.id);
    const reached = rows.length;
    const completed = rows.filter((r) => r.status === 'completed').length;
    const att = attempts.filter((a) => a.phaseId === ph.id);
    const byStudent = new Map<string, AttemptRow[]>();
    att.forEach((a) => byStudent.set(a.studentId, [...(byStudent.get(a.studentId) ?? []), a]));
    const firstTries = [...byStudent.values()].map(
      (list) => list.sort((x, y) => x.createdAt.localeCompare(y.createdAt))[0],
    );
    const studentsWithAttempts = byStudent.size;
    const avgAttempts = studentsWithAttempts ? att.length / studentsWithAttempts : null;
    const firstTryPassRate = firstTries.length ? firstTries.filter((a) => a.passed).length / firstTries.length : null;
    const hintsLevel3 = rows.filter((r) => r.hintsViewed >= 3).length;
    const completionRate = reached ? completed / reached : null;
    const difficulty =
      (firstTryPassRate === null ? 0 : 1 - firstTryPassRate) * 0.5 +
      (avgAttempts === null ? 0 : Math.min((avgAttempts - 1) / 3, 1)) * 0.3 +
      (reached ? hintsLevel3 / reached : 0) * 0.2;
    return {
      phaseId: ph.id,
      title: ph.title,
      reached,
      completed,
      completionRate,
      studentsWithAttempts,
      avgAttempts,
      firstTryPassRate,
      hintsLevel3,
      difficulty,
    };
  });
}

export interface QuestionStat {
  phaseId: number;
  questionId: string;
  prompt: string;
  answered: number;
  wrong: number;
  errorRate: number;
}

/** Perguntas mais erradas — indicam conteúdos a retomar com a turma. */
export function questionStats(attempts: AttemptRow[], minAnswers = 3): QuestionStat[] {
  const acc = new Map<string, { answered: number; wrong: number }>();
  for (const a of attempts) {
    for (const [qid, ok] of Object.entries(a.results)) {
      const k = `${a.phaseId}:${qid}`;
      const cur = acc.get(k) ?? { answered: 0, wrong: 0 };
      cur.answered++;
      if (!ok) cur.wrong++;
      acc.set(k, cur);
    }
  }
  return [...acc.entries()]
    .map(([k, v]) => {
      const [phaseId, questionId] = k.split(':');
      const q = getPhase(Number(phaseId))?.quiz.find((x) => x.id === questionId);
      return {
        phaseId: Number(phaseId),
        questionId,
        prompt: q?.prompt ?? questionId,
        answered: v.answered,
        wrong: v.wrong,
        errorRate: v.wrong / v.answered,
      };
    })
    .filter((s) => s.answered >= minAnswers)
    .sort((a, b) => b.errorRate - a.errorRate || b.answered - a.answered);
}

export interface Overview {
  totalStudents: number;
  activeStudents: number;
  totalClasses: number;
  recentlyActive: number;
  avgTrailPercent: number;
  distribution: { phaseId: number; count: number }[];
  finished: number;
  inactive: StudentSummary[];
  needSupport: StudentSummary[];
  notStarted: number;
}

export function overview(data: TeacherData, now = new Date()): Overview {
  const summaries = summarizeAll(data, now).filter((s) => s.student.active);
  const distribution = PHASES.map((ph) => ({
    phaseId: ph.id,
    count: summaries.filter((s) => s.status !== 'concluiu' && s.currentPhase === ph.id && s.status !== 'nao_iniciou').length,
  }));
  return {
    totalStudents: data.students.length,
    activeStudents: summaries.length,
    totalClasses: data.classes.filter((c) => !c.archived).length,
    recentlyActive: summaries.filter((s) => {
      const d = daysSince(s.lastProgressAt, now);
      return d !== null && d < INACTIVE_DAYS;
    }).length,
    avgTrailPercent: summaries.length ? Math.round(summaries.reduce((t, s) => t + s.percent, 0) / summaries.length) : 0,
    distribution,
    finished: summaries.filter((s) => s.status === 'concluiu').length,
    inactive: summaries.filter((s) => s.status === 'inativo'),
    needSupport: summaries.filter((s) => s.status === 'precisa_apoio'),
    notStarted: summaries.filter((s) => s.status === 'nao_iniciou').length,
  };
}

export function filterTeacherData(data: TeacherData, classId: string | null): TeacherData {
  if (!classId) return data;
  const ids = new Set(data.students.filter((s) => s.classId === classId).map((s) => s.id));
  return {
    ...data,
    classes: data.classes.filter((c) => c.id === classId),
    students: data.students.filter((s) => ids.has(s.id)),
    progress: data.progress.filter((p) => ids.has(p.studentId)),
    attempts: data.attempts.filter((a) => ids.has(a.studentId)),
    activity: data.activity.filter((a) => ids.has(a.studentId)),
  };
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString('pt-BR') : '');
const pct = (v: number | null) => (v === null ? '' : `${Math.round(v * 100)}%`);

export function classReportCsv(summaries: StudentSummary[]): string {
  const header: CsvCell[] = [
    'Turma', 'Aluno', 'Situação', 'Fase atual', 'Fases concluídas', '% da trilha',
    'Última atividade', 'Tentativas de teste', 'Reprovações na fase atual', 'Fases com dica 3', 'Fases com dificuldade',
  ];
  const rows = summaries.map((s) => [
    s.className, s.student.displayName, STATUS_LABEL[s.status], s.status === 'concluiu' ? 'Trilha concluída' : s.currentPhase,
    s.completed, s.percent, fmtDate(s.lastProgressAt), s.totalAttempts, s.failedAttemptsCurrent, s.hintsLevel3,
    s.difficultPhases.join(', '),
  ]);
  return toCsv([header, ...rows]);
}

export function studentReportCsv(
  student: StudentRow,
  className: string,
  progress: ProgressMap,
  attempts: AttemptRow[],
): string {
  const header: CsvCell[] = [
    'Turma', 'Aluno', 'Fase', 'Título', 'Situação', 'Checklist obrigatório', 'Teste aprovado', 'Melhor nota',
    'Tentativas', 'Nível máximo de dica', 'Reflexão', 'Liberada pelo professor', 'Concluída pelo professor', 'Concluída em',
  ];
  const rows = PHASES.map((ph) => {
    const p = progress[ph.id];
    const req = requiredChecklistIds(ph);
    const done = p ? req.filter((id) => p.checklist.includes(id)).length : 0;
    const tries = attempts.filter((a) => a.studentId === student.id && a.phaseId === ph.id).length;
    return [
      className, student.displayName, ph.id, ph.title,
      p ? (p.status === 'completed' ? 'Concluída' : 'Em andamento') : 'Não iniciada',
      `${done}/${req.length}`, p?.quizPassed ?? false, p ? `${p.quizBestScore}/${ph.quiz.length}` : '',
      tries, p?.hintsViewed ?? 0, p?.reflection ?? '', p?.manuallyUnlocked ?? false, p?.completedByTeacher ?? false,
      fmtDate(p?.completedAt ?? null),
    ];
  });
  return toCsv([header, ...rows]);
}

export function phaseStatsCsv(stats: PhaseStat[]): string {
  const header: CsvCell[] = ['Fase', 'Título', 'Alunos que chegaram', 'Concluíram', 'Taxa de conclusão', 'Média de tentativas', 'Aprovação na 1ª tentativa', 'Usaram dica 3'];
  return toCsv([
    header,
    ...stats.map((s) => [s.phaseId, s.title, s.reached, s.completed, pct(s.completionRate),
      s.avgAttempts === null ? '' : s.avgAttempts.toFixed(1), pct(s.firstTryPassRate), s.hintsLevel3]),
  ]);
}

export function activityLabel(a: ActivityRow): string {
  switch (a.kind) {
    case 'login':
      return 'Entrou na plataforma';
    case 'hint':
      return `Consultou a dica ${String(a.detail.level ?? '')} da fase ${a.phaseId}`;
    case 'quiz':
      return `Teste da fase ${a.phaseId}: ${String(a.detail.score)}/${String(a.detail.total)} ${a.detail.passed ? '(aprovado)' : '(não aprovado)'}`;
    case 'complete':
      return `Concluiu a fase ${a.phaseId}`;
    default:
      return a.kind;
  }
}

export function classNameOf(classes: ClassRow[], id: string): string {
  return classes.find((c) => c.id === id)?.name ?? '—';
}
