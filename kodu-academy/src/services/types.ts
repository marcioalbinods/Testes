import type { PhaseProgress, ProgressMap } from '../lib/progression';
import type { QuizResult } from '../lib/quiz';

export type BackendMode = 'supabase' | 'demo';

export interface StudentProfile {
  id: string;
  displayName: string;
  classId: string;
  className: string;
  startedAt: string | null;
}

export interface TeacherProfile {
  id: string;
  displayName: string;
  email: string;
}

export interface ClassRow {
  id: string;
  name: string;
  schoolYear: string | null;
  archived: boolean;
  createdAt: string;
}

export interface StudentRow {
  id: string;
  classId: string;
  displayName: string;
  active: boolean;
  startedAt: string | null;
  lastActivityAt: string | null;
  createdAt: string;
}

export interface ProgressRow extends PhaseProgress {
  studentId: string;
}

export interface AttemptRow {
  id: number;
  studentId: string;
  phaseId: number;
  answers: Record<string, string>;
  results: Record<string, boolean>;
  score: number;
  total: number;
  passed: boolean;
  createdAt: string;
}

export interface ActivityRow {
  id: number;
  studentId: string;
  phaseId: number | null;
  kind: 'login' | 'hint' | 'quiz' | 'complete';
  detail: Record<string, unknown>;
  createdAt: string;
}

export interface AuditRow {
  id: number;
  studentId: string | null;
  classId: string | null;
  phaseId: number | null;
  action: string;
  reason: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface TeacherData {
  classes: ClassRow[];
  students: StudentRow[];
  progress: ProgressRow[];
  attempts: AttemptRow[];
  activity: ActivityRow[];
  audit: AuditRow[];
}

export interface CreatedStudent {
  id: string;
  displayName: string;
  code: string;
}

export interface CompleteResult {
  ok: boolean;
  missing: string[];
  progress: PhaseProgress;
}

export interface StudentApi {
  restore(): Promise<StudentProfile | null>;
  login(code: string): Promise<StudentProfile>;
  logout(): Promise<void>;
  loadProgress(): Promise<ProgressMap>;
  saveChecklist(phaseId: number, items: string[]): Promise<PhaseProgress>;
  setReviewed(phaseId: number, value: boolean): Promise<PhaseProgress>;
  saveReflection(phaseId: number, text: string): Promise<PhaseProgress>;
  logHint(phaseId: number, level: number): Promise<PhaseProgress>;
  submitQuiz(phaseId: number, answers: Record<string, string>): Promise<QuizResult>;
  completePhase(phaseId: number): Promise<CompleteResult>;
}

export interface TeacherApi {
  restore(): Promise<TeacherProfile | null>;
  signIn(email: string, password: string): Promise<TeacherProfile>;
  signOut(): Promise<void>;
  loadData(): Promise<TeacherData>;
  createClass(name: string, schoolYear: string | null): Promise<void>;
  updateClass(id: string, patch: { name?: string; schoolYear?: string | null; archived?: boolean }): Promise<void>;
  deleteClass(id: string, confirmName: string): Promise<void>;
  createStudents(classId: string, names: string[]): Promise<CreatedStudent[]>;
  resetCode(studentId: string): Promise<string>;
  updateStudent(
    studentId: string,
    patch: { displayName?: string; active?: boolean; classId?: string },
    reason?: string,
  ): Promise<void>;
  deleteStudent(studentId: string, reason: string): Promise<void>;
  unlockPhase(studentId: string, phaseId: number, reason: string): Promise<void>;
  setPhaseStatus(studentId: string, phaseId: number, status: 'completed' | 'in_progress' | 'reset', reason: string): Promise<void>;
}

export interface Backend {
  mode: BackendMode;
  student: StudentApi;
  teacher: TeacherApi;
}

/** Erro com mensagem já traduzida para o usuário. */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'unknown',
  ) {
    super(message);
    this.name = 'AppError';
  }
}
