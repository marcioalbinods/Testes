import type { PhaseProgress } from '../lib/progression';
import type { ActivityRow, AttemptRow, AuditRow, ClassRow, ProgressRow, StudentProfile, StudentRow } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = Record<string, any>;

export const mapProgress = (r: Raw): PhaseProgress => ({
  phaseId: Number(r.phase_id),
  status: r.status === 'completed' ? 'completed' : 'in_progress',
  checklist: r.checklist ?? [],
  reviewed: Boolean(r.reviewed),
  reflection: r.reflection ?? '',
  quizPassed: Boolean(r.quiz_passed),
  quizBestScore: Number(r.quiz_best_score ?? 0),
  quizAttempts: Number(r.quiz_attempts ?? 0),
  hintsViewed: Number(r.hints_viewed ?? 0),
  manuallyUnlocked: Boolean(r.manually_unlocked),
  completedByTeacher: Boolean(r.completed_by_teacher),
  startedAt: r.started_at ?? null,
  completedAt: r.completed_at ?? null,
  updatedAt: r.updated_at ?? null,
});

export const mapProgressRow = (r: Raw): ProgressRow => ({ ...mapProgress(r), studentId: r.student_id });

export const mapProfile = (r: Raw): StudentProfile => ({
  id: r.id,
  displayName: r.display_name,
  classId: r.class_id,
  className: r.class_name,
  startedAt: r.started_at ?? null,
});

export const mapClass = (r: Raw): ClassRow => ({
  id: r.id,
  name: r.name,
  schoolYear: r.school_year ?? null,
  archived: Boolean(r.archived),
  createdAt: r.created_at,
});

export const mapStudent = (r: Raw): StudentRow => ({
  id: r.id,
  classId: r.class_id,
  displayName: r.display_name,
  active: Boolean(r.active),
  startedAt: r.started_at ?? null,
  lastActivityAt: r.last_activity_at ?? null,
  createdAt: r.created_at,
});

export const mapAttempt = (r: Raw): AttemptRow => ({
  id: Number(r.id),
  studentId: r.student_id,
  phaseId: Number(r.phase_id),
  answers: r.answers ?? {},
  results: r.results ?? {},
  score: Number(r.score),
  total: Number(r.total),
  passed: Boolean(r.passed),
  createdAt: r.created_at,
});

export const mapActivity = (r: Raw): ActivityRow => ({
  id: Number(r.id),
  studentId: r.student_id,
  phaseId: r.phase_id === null || r.phase_id === undefined ? null : Number(r.phase_id),
  kind: r.kind,
  detail: r.detail ?? {},
  createdAt: r.created_at,
});

export const mapAudit = (r: Raw): AuditRow => ({
  id: Number(r.id),
  studentId: r.student_id ?? null,
  classId: r.class_id ?? null,
  phaseId: r.phase_id === null || r.phase_id === undefined ? null : Number(r.phase_id),
  action: r.action,
  reason: r.reason ?? null,
  before: r.before ?? null,
  after: r.after ?? null,
  createdAt: r.created_at,
});
