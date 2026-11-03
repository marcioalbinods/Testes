import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ProgressMap } from '../lib/progression';
import type { QuizResult } from '../lib/quiz';
import { toAppError, messageFor } from './errors';
import { mapActivity, mapAttempt, mapAudit, mapClass, mapProfile, mapProgress, mapProgressRow, mapStudent } from './mappers';
import { AppError, type Backend, type StudentApi, type TeacherApi, type TeacherProfile } from './types';

const PROGRESS_COLS =
  'student_id, phase_id, status, checklist, reviewed, reflection, quiz_passed, quiz_best_score, quiz_attempts, hints_viewed, manually_unlocked, completed_by_teacher, started_at, completed_at, updated_at';
const STUDENT_COLS = 'id, class_id, display_name, active, started_at, last_activity_at, created_at';

/** Executa uma chamada do Supabase e converte erros em mensagens em português. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run<T = any>(p: PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  let res: { data: unknown; error: unknown };
  try {
    res = await p;
  } catch (err) {
    throw toAppError(err);
  }
  if (res.error) throw toAppError(res.error);
  return res.data as T;
}

/** Lê todas as linhas de uma consulta, página por página (o Supabase limita a 1000 por vez). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAll<T = any>(build: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const size = 1000;
  const out: T[] = [];
  for (let from = 0; ; from += size) {
    const rows = (await run<T[] | null>(build(from, from + size - 1))) ?? [];
    out.push(...rows);
    if (rows.length < size) break;
  }
  return out;
}

function makeStudentApi(db: SupabaseClient): StudentApi {
  const rpcProgress = async (fn: string, args: Record<string, unknown>) => mapProgress(await run(db.rpc(fn, args)));
  return {
    async restore() {
      const { data } = await db.auth.getSession();
      if (!data.session) return null;
      const me = await run(db.rpc('student_me'));
      return me ? mapProfile(me) : null;
    },
    async login(code) {
      const { data } = await db.auth.getSession();
      if (!data.session) {
        const r = await db.auth.signInAnonymously();
        if (r.error) throw toAppError(r.error);
      }
      const res = await run<{ ok: boolean; error?: string; student?: Record<string, unknown> }>(
        db.rpc('student_login', { p_code: code }),
      );
      if (!res.ok || !res.student) throw new AppError(messageFor(res.error ?? 'unknown'), res.error ?? 'unknown');
      return mapProfile(res.student);
    },
    async logout() {
      try {
        await run(db.rpc('student_logout'));
      } finally {
        await db.auth.signOut();
      }
    },
    async loadProgress() {
      const rows = await run(db.from('phase_progress').select(PROGRESS_COLS).order('phase_id'));
      const map: ProgressMap = {};
      (rows ?? []).forEach((r: Record<string, unknown>) => {
        const p = mapProgress(r);
        map[p.phaseId] = p;
      });
      return map;
    },
    saveChecklist: (phaseId, items) => rpcProgress('save_checklist', { p_phase: phaseId, p_items: items }),
    setReviewed: (phaseId, value) => rpcProgress('set_reviewed', { p_phase: phaseId, p_value: value }),
    saveReflection: (phaseId, text) => rpcProgress('save_reflection', { p_phase: phaseId, p_text: text }),
    logHint: (phaseId, level) => rpcProgress('log_hint', { p_phase: phaseId, p_level: level }),
    async submitQuiz(phaseId, answers) {
      const r = await run<{ score: number; total: number; passed: boolean; pass_min: number; results: Record<string, boolean> }>(
        db.rpc('submit_quiz', { p_phase: phaseId, p_answers: answers }),
      );
      const result: QuizResult = { score: r.score, total: r.total, passed: r.passed, passMin: r.pass_min, results: r.results };
      return result;
    },
    async completePhase(phaseId) {
      const r = await run<{ ok: boolean; missing: string[]; progress: Record<string, unknown> }>(
        db.rpc('complete_phase', { p_phase: phaseId }),
      );
      return { ok: r.ok, missing: r.missing ?? [], progress: mapProgress(r.progress) };
    },
  };
}

function makeTeacherApi(db: SupabaseClient): TeacherApi {
  const profile = async (): Promise<TeacherProfile | null> => {
    const { data } = await db.auth.getSession();
    const user = data.session?.user;
    if (!user || user.is_anonymous) return null;
    const row = await run(db.from('teachers').select('id, display_name').eq('id', user.id).maybeSingle());
    if (!row) return null;
    return { id: row.id, displayName: row.display_name, email: user.email ?? '' };
  };
  return {
    restore: profile,
    async signIn(email, password) {
      const r = await db.auth.signInWithPassword({ email: email.trim(), password });
      if (r.error) throw toAppError(r.error);
      const p = await profile();
      if (!p) {
        await db.auth.signOut();
        throw new AppError(messageFor('not_teacher_account'), 'not_teacher_account');
      }
      return p;
    },
    async signOut() {
      await db.auth.signOut();
    },
    async loadData() {
      const [classes, students, progress, attempts, activity, audit] = await Promise.all([
        fetchAll((a, b) => db.from('classes').select('id, name, school_year, archived, created_at').order('name').range(a, b)),
        fetchAll((a, b) => db.from('students').select(STUDENT_COLS).order('display_name').range(a, b)),
        fetchAll((a, b) => db.from('phase_progress').select(PROGRESS_COLS).order('student_id').order('phase_id').range(a, b)),
        fetchAll((a, b) =>
          db.from('quiz_attempts').select('id, student_id, phase_id, answers, results, score, total, passed, created_at').order('id').range(a, b),
        ),
        fetchAll((a, b) =>
          db.from('activity_log').select('id, student_id, phase_id, kind, detail, created_at').order('id', { ascending: false }).range(a, b),
        ),
        fetchAll((a, b) =>
          db.from('audit_log').select('id, student_id, class_id, phase_id, action, reason, before, after, created_at').order('id', { ascending: false }).range(a, b),
        ),
      ]);
      return {
        classes: classes.map(mapClass),
        students: students.map(mapStudent),
        progress: progress.map(mapProgressRow),
        attempts: attempts.map(mapAttempt),
        activity: activity.map(mapActivity),
        audit: audit.map(mapAudit),
      };
    },
    async createClass(name, schoolYear) {
      await run(db.from('classes').insert({ name: name.trim(), school_year: schoolYear?.trim() || null }));
    },
    async updateClass(id, patch) {
      const body: Record<string, unknown> = {};
      if (patch.name !== undefined) body.name = patch.name.trim();
      if (patch.schoolYear !== undefined) body.school_year = patch.schoolYear;
      if (patch.archived !== undefined) body.archived = patch.archived;
      await run(db.from('classes').update(body).eq('id', id));
    },
    async deleteClass(id, confirmName) {
      await run(db.rpc('teacher_delete_class', { p_class: id, p_confirm_name: confirmName }));
    },
    async createStudents(classId, names) {
      const rows = await run<{ id: string; display_name: string; code: string }[]>(
        db.rpc('create_students', { p_class: classId, p_names: names }),
      );
      return (rows ?? []).map((r) => ({ id: r.id, displayName: r.display_name, code: r.code }));
    },
    async resetCode(studentId) {
      return run<string>(db.rpc('reset_student_code', { p_student: studentId }));
    },
    async updateStudent(studentId, patch, reason) {
      await run(
        db.rpc('teacher_update_student', {
          p_student: studentId,
          p_display_name: patch.displayName ?? null,
          p_active: patch.active ?? null,
          p_class: patch.classId ?? null,
          p_reason: reason ?? null,
        }),
      );
    },
    async deleteStudent(studentId, reason) {
      await run(db.rpc('teacher_delete_student', { p_student: studentId, p_reason: reason }));
    },
    async unlockPhase(studentId, phaseId, reason) {
      await run(db.rpc('teacher_unlock_phase', { p_student: studentId, p_phase: phaseId, p_reason: reason }));
    },
    async setPhaseStatus(studentId, phaseId, status, reason) {
      await run(db.rpc('teacher_set_phase_status', { p_student: studentId, p_phase: phaseId, p_status: status, p_reason: reason }));
    },
  };
}

export function createSupabaseBackend(url: string, anonKey: string): Backend {
  // Dois clientes com armazenamentos separados: a sessão do aluno e a do professor
  // não se sobrepõem no mesmo navegador.
  const studentDb = createClient(url, anonKey, {
    auth: { storageKey: 'kodu-academy-aluno', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  const teacherDb = createClient(url, anonKey, {
    auth: { storageKey: 'kodu-academy-professor', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return { mode: 'supabase', student: makeStudentApi(studentDb), teacher: makeTeacherApi(teacherDb) };
}
