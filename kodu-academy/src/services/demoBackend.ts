/**
 * MODO DEMONSTRAÇÃO — os dados ficam apenas neste navegador (localStorage).
 * Serve para conhecer a plataforma antes de configurar o Supabase.
 * Reproduz as mesmas regras do servidor (progressão, critérios, correção dos testes).
 * NÃO use para acompanhar alunos de verdade: outro computador não verá estes dados.
 */
import { PHASES, getPhase } from '../content/phases';
import { QUIZ_KEYS } from '../content/quizKeys';
import { emptyProgress, isUnlocked, missingCriteria, type PhaseProgress, type ProgressMap } from '../lib/progression';
import { gradeQuiz } from '../lib/quiz';
import { messageFor } from './errors';
import {
  AppError,
  type ActivityRow,
  type AttemptRow,
  type AuditRow,
  type Backend,
  type ClassRow,
  type ProgressRow,
  type StudentApi,
  type StudentRow,
  type TeacherApi,
} from './types';

const KEY = 'kodu-academy-demo-v1';
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

interface DemoTeacher {
  email: string;
  displayName: string;
  salt: string;
  hash: string;
}
interface DemoStudent extends StudentRow {
  codeHash: string;
}
interface DemoDb {
  version: 1;
  teacher: DemoTeacher | null;
  classes: ClassRow[];
  students: DemoStudent[];
  progress: ProgressRow[];
  attempts: AttemptRow[];
  activity: ActivityRow[];
  audit: AuditRow[];
  session: { studentId: string | null; teacher: boolean };
  loginFails: string[];
  seq: number;
}

const empty = (): DemoDb => ({
  version: 1,
  teacher: null,
  classes: [],
  students: [],
  progress: [],
  attempts: [],
  activity: [],
  audit: [],
  session: { studentId: null, teacher: false },
  loginFails: [],
  seq: 1,
});

function load(): DemoDb {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const db = JSON.parse(raw) as DemoDb;
    return db.version === 1 ? db : empty();
  } catch {
    return empty();
  }
}
function save(db: DemoDb) {
  localStorage.setItem(KEY, JSON.stringify(db));
}
/** Abre o "banco", aplica a alteração e grava. */
function tx<T>(fn: (db: DemoDb) => T): T {
  const db = load();
  const out = fn(db);
  save(db);
  return out;
}

const now = () => new Date().toISOString();
const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function pbkdf2(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  );
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function randomCode(): string {
  const out: string[] = [];
  const bytes = new Uint8Array(32);
  while (out.length < 8) {
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < 248 && out.length < 8) out.push(ALPHABET[b % 31]);
    }
  }
  return `${out.slice(0, 4).join('')}-${out.slice(4).join('')}`;
}

const fail = (code: string): never => {
  throw new AppError(messageFor(code), code);
};

function progressMapOf(db: DemoDb, studentId: string): ProgressMap {
  const map: ProgressMap = {};
  db.progress.filter((p) => p.studentId === studentId).forEach((p) => (map[p.phaseId] = p));
  return map;
}

function currentStudent(db: DemoDb): DemoStudent {
  const s = db.students.find((x) => x.id === db.session.studentId && x.active);
  if (!s) return fail('not_student');
  return s;
}

/** Equivalente a private.open_phase. */
function openPhase(db: DemoDb, studentId: string, phaseId: number): ProgressRow {
  if (!getPhase(phaseId)) fail('invalid_phase');
  if (!isUnlocked(phaseId, progressMapOf(db, studentId))) fail('phase_locked');
  let row = db.progress.find((p) => p.studentId === studentId && p.phaseId === phaseId);
  if (!row) {
    row = { ...emptyProgress(phaseId), studentId, startedAt: now(), updatedAt: now() };
    db.progress.push(row);
  }
  const st = db.students.find((s) => s.id === studentId);
  if (st) st.lastActivityAt = now();
  return row;
}

const strip = ({ studentId: _s, ...rest }: ProgressRow): PhaseProgress => {
  void _s;
  return { ...rest };
};

function makeStudentApi(): StudentApi {
  return {
    async restore() {
      const db = load();
      const s = db.students.find((x) => x.id === db.session.studentId && x.active);
      if (!s) return null;
      const c = db.classes.find((x) => x.id === s.classId);
      return { id: s.id, displayName: s.displayName, classId: s.classId, className: c?.name ?? '', startedAt: s.startedAt };
    },
    async login(code) {
      const hash = await sha256(normalize(code));
      return tx((db) => {
        if (db.session.teacher) fail('teacher_account');
        const cutoff = Date.now() - 15 * 60_000;
        db.loginFails = db.loginFails.filter((t) => new Date(t).getTime() > cutoff);
        if (db.loginFails.length >= 8) fail('too_many_attempts');
        const s = db.students.find((x) => x.codeHash === hash);
        if (!s || !s.active || normalize(code).length !== 8) {
          db.loginFails.push(now());
          save(db);
          fail('invalid_code');
        }
        const st = s as DemoStudent;
        st.startedAt = st.startedAt ?? now();
        st.lastActivityAt = now();
        db.session.studentId = st.id;
        db.activity.unshift({ id: db.seq++, studentId: st.id, phaseId: null, kind: 'login', detail: {}, createdAt: now() });
        const c = db.classes.find((x) => x.id === st.classId);
        return { id: st.id, displayName: st.displayName, classId: st.classId, className: c?.name ?? '', startedAt: st.startedAt };
      });
    },
    async logout() {
      tx((db) => {
        db.session.studentId = null;
      });
    },
    async loadProgress() {
      const db = load();
      const s = currentStudent(db);
      const map: ProgressMap = {};
      db.progress.filter((p) => p.studentId === s.id).forEach((p) => (map[p.phaseId] = strip(p)));
      return map;
    },
    async saveChecklist(phaseId, items) {
      return tx((db) => {
        const s = currentStudent(db);
        const row = openPhase(db, s.id, phaseId);
        if (row.status === 'completed') fail('phase_completed');
        const allowed = getPhase(phaseId)!.checklist.map((c) => c.id);
        row.checklist = [...new Set(items)].filter((i) => allowed.includes(i)).sort();
        row.updatedAt = now();
        return strip(row);
      });
    },
    async setReviewed(phaseId, value) {
      return tx((db) => {
        const s = currentStudent(db);
        const row = openPhase(db, s.id, phaseId);
        if (row.status !== 'completed') {
          row.reviewed = value;
          row.updatedAt = now();
        }
        return strip(row);
      });
    },
    async saveReflection(phaseId, text) {
      if (text.length > 2000) fail('reflection_too_long');
      return tx((db) => {
        const s = currentStudent(db);
        const row = openPhase(db, s.id, phaseId);
        if (row.status === 'completed') fail('phase_completed');
        row.reflection = text.trim();
        row.updatedAt = now();
        return strip(row);
      });
    },
    async logHint(phaseId, level) {
      if (level < 1 || level > 3) fail('invalid_hint_level');
      return tx((db) => {
        const s = currentStudent(db);
        const row = openPhase(db, s.id, phaseId);
        if (level > row.hintsViewed) {
          row.hintsViewed = level;
          row.updatedAt = now();
          db.activity.unshift({ id: db.seq++, studentId: s.id, phaseId, kind: 'hint', detail: { level }, createdAt: now() });
        }
        return strip(row);
      });
    },
    async submitQuiz(phaseId, answers) {
      return tx((db) => {
        const s = currentStudent(db);
        const row = openPhase(db, s.id, phaseId);
        const recent = db.attempts.filter(
          (a) => a.studentId === s.id && a.phaseId === phaseId && Date.now() - new Date(a.createdAt).getTime() < 10 * 60_000,
        );
        if (recent.length >= 10) fail('quiz_cooldown');
        const phase = getPhase(phaseId)!;
        const key = QUIZ_KEYS[phaseId] ?? {};
        const result = gradeQuiz(answers, key, phase.quizPassMin);
        const kept = Object.fromEntries(Object.entries(answers).filter(([k]) => k in key));
        db.attempts.push({
          id: db.seq++,
          studentId: s.id,
          phaseId,
          answers: kept,
          results: result.results,
          score: result.score,
          total: result.total,
          passed: result.passed,
          createdAt: now(),
        });
        if (row.status !== 'completed') {
          row.quizAttempts += 1;
          row.quizBestScore = Math.max(row.quizBestScore, result.score);
          row.quizPassed = row.quizPassed || result.passed;
          row.updatedAt = now();
        }
        db.activity.unshift({
          id: db.seq++,
          studentId: s.id,
          phaseId,
          kind: 'quiz',
          detail: { score: result.score, total: result.total, passed: result.passed },
          createdAt: now(),
        });
        return result;
      });
    },
    async completePhase(phaseId) {
      return tx((db) => {
        const s = currentStudent(db);
        const row = openPhase(db, s.id, phaseId);
        if (row.status === 'completed') return { ok: true, missing: [], progress: strip(row) };
        const missing = missingCriteria(getPhase(phaseId)!, row);
        if (missing.length) return { ok: false, missing, progress: strip(row) };
        row.status = 'completed';
        row.completedAt = now();
        row.updatedAt = now();
        db.activity.unshift({ id: db.seq++, studentId: s.id, phaseId, kind: 'complete', detail: {}, createdAt: now() });
        return { ok: true, missing: [], progress: strip(row) };
      });
    },
  };
}

function requireTeacher(db: DemoDb) {
  if (!db.session.teacher || !db.teacher) fail('not_teacher');
}
function ownStudent(db: DemoDb, id: string): DemoStudent {
  const s = db.students.find((x) => x.id === id);
  if (!s) return fail('student_not_found');
  return s;
}
function audit(db: DemoDb, a: Omit<AuditRow, 'id' | 'createdAt'>) {
  db.audit.unshift({ ...a, id: db.seq++, createdAt: now() });
}

function makeTeacherApi(): TeacherApi {
  return {
    async restore() {
      const db = load();
      if (!db.session.teacher || !db.teacher) return null;
      return { id: 'demo-teacher', displayName: db.teacher.displayName, email: db.teacher.email };
    },
    async signIn(email, password) {
      const db = load();
      const mail = email.trim().toLowerCase();
      if (!mail || password.length < 6) fail('invalid_credentials');
      if (!db.teacher) {
        // Primeiro acesso na demonstração: a conta local é criada com estes dados.
        const salt = uuid();
        db.teacher = { email: mail, displayName: 'Professor(a) — demonstração', salt, hash: await pbkdf2(password, salt) };
      } else if (db.teacher.email !== mail || (await pbkdf2(password, db.teacher.salt)) !== db.teacher.hash) {
        fail('invalid_credentials');
      }
      db.session.teacher = true;
      db.session.studentId = null;
      save(db);
      return { id: 'demo-teacher', displayName: db.teacher!.displayName, email: db.teacher!.email };
    },
    async signOut() {
      tx((db) => {
        db.session.teacher = false;
      });
    },
    async loadData() {
      const db = load();
      requireTeacher(db);
      return {
        classes: [...db.classes].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
        students: db.students.map(({ codeHash: _c, ...s }) => {
          void _c;
          return s;
        }),
        progress: db.progress,
        attempts: db.attempts,
        activity: db.activity,
        audit: db.audit,
      };
    },
    async createClass(name, schoolYear) {
      tx((db) => {
        requireTeacher(db);
        const n = name.trim();
        if (!n || n.length > 60) fail('invalid_name');
        if (db.classes.some((c) => c.name === n)) fail('duplicate_class');
        db.classes.push({ id: uuid(), name: n, schoolYear: schoolYear?.trim() || null, archived: false, createdAt: now() });
      });
    },
    async updateClass(id, patch) {
      tx((db) => {
        requireTeacher(db);
        const c = db.classes.find((x) => x.id === id);
        if (!c) return fail('class_not_found');
        if (patch.name !== undefined) {
          const n = patch.name.trim();
          if (!n || n.length > 60) fail('invalid_name');
          if (db.classes.some((x) => x.id !== id && x.name === n)) fail('duplicate_class');
          c.name = n;
        }
        if (patch.schoolYear !== undefined) c.schoolYear = patch.schoolYear;
        if (patch.archived !== undefined) c.archived = patch.archived;
      });
    },
    async deleteClass(id, confirmName) {
      tx((db) => {
        requireTeacher(db);
        const c = db.classes.find((x) => x.id === id);
        if (!c) return fail('class_not_found');
        if (confirmName.trim() !== c.name) fail('confirm_name_mismatch');
        const ids = new Set(db.students.filter((s) => s.classId === id).map((s) => s.id));
        db.students = db.students.filter((s) => !ids.has(s.id));
        db.progress = db.progress.filter((p) => !ids.has(p.studentId));
        db.attempts = db.attempts.filter((p) => !ids.has(p.studentId));
        db.activity = db.activity.filter((p) => !ids.has(p.studentId));
        db.classes = db.classes.filter((x) => x.id !== id);
        audit(db, { studentId: null, classId: id, phaseId: null, action: 'delete_class', reason: null, before: null, after: { students_deleted: ids.size } });
      });
    },
    async createStudents(classId, names) {
      const db = load();
      requireTeacher(db);
      if (!db.classes.some((c) => c.id === classId)) fail('class_not_found');
      if (names.length === 0 || names.length > 100) fail('invalid_name_list');
      const created = [];
      for (const raw of names) {
        const name = raw.trim();
        if (!name || name.length > 60) continue;
        let code = randomCode();
        let hash = await sha256(normalize(code));
        while (db.students.some((s) => s.codeHash === hash)) {
          code = randomCode();
          hash = await sha256(normalize(code));
        }
        const id = uuid();
        db.students.push({ id, classId, displayName: name, active: true, startedAt: null, lastActivityAt: null, createdAt: now(), codeHash: hash });
        audit(db, { studentId: id, classId, phaseId: null, action: 'create_student', reason: null, before: null, after: null });
        created.push({ id, displayName: name, code });
      }
      save(db);
      return created;
    },
    async resetCode(studentId) {
      const db = load();
      requireTeacher(db);
      const s = ownStudent(db, studentId);
      let code = randomCode();
      let hash = await sha256(normalize(code));
      while (db.students.some((x) => x.codeHash === hash)) {
        code = randomCode();
        hash = await sha256(normalize(code));
      }
      s.codeHash = hash;
      if (db.session.studentId === studentId) db.session.studentId = null;
      audit(db, { studentId, classId: s.classId, phaseId: null, action: 'reset_code', reason: null, before: null, after: null });
      save(db);
      return code;
    },
    async updateStudent(studentId, patch, reason) {
      tx((db) => {
        requireTeacher(db);
        const s = ownStudent(db, studentId);
        const before = { active: s.active, class_id: s.classId };
        if (patch.displayName !== undefined) {
          const n = patch.displayName.trim();
          if (!n || n.length > 60) fail('invalid_name');
          s.displayName = n;
        }
        if (patch.classId !== undefined) {
          if (!db.classes.some((c) => c.id === patch.classId)) fail('class_not_found');
          s.classId = patch.classId;
        }
        if (patch.active !== undefined) {
          s.active = patch.active;
          if (!patch.active && db.session.studentId === studentId) db.session.studentId = null;
        }
        audit(db, {
          studentId, classId: s.classId, phaseId: null, action: 'update_student', reason: reason ?? null,
          before, after: { active: s.active, class_id: s.classId },
        });
      });
    },
    async deleteStudent(studentId, reason) {
      tx((db) => {
        requireTeacher(db);
        const s = ownStudent(db, studentId);
        db.students = db.students.filter((x) => x.id !== studentId);
        db.progress = db.progress.filter((p) => p.studentId !== studentId);
        db.attempts = db.attempts.filter((p) => p.studentId !== studentId);
        db.activity = db.activity.filter((p) => p.studentId !== studentId);
        if (db.session.studentId === studentId) db.session.studentId = null;
        audit(db, { studentId, classId: s.classId, phaseId: null, action: 'delete_student', reason, before: null, after: null });
      });
    },
    async unlockPhase(studentId, phaseId, reason) {
      tx((db) => {
        requireTeacher(db);
        ownStudent(db, studentId);
        if (!getPhase(phaseId)) fail('invalid_phase');
        if (reason.trim().length < 3) fail('reason_required');
        let row = db.progress.find((p) => p.studentId === studentId && p.phaseId === phaseId);
        const before = row ? { ...row } : null;
        if (!row) {
          row = { ...emptyProgress(phaseId), studentId, startedAt: now() };
          db.progress.push(row);
        }
        row.manuallyUnlocked = true;
        row.updatedAt = now();
        audit(db, { studentId, classId: null, phaseId, action: 'unlock_phase', reason: reason.trim(), before, after: { manually_unlocked: true } });
      });
    },
    async setPhaseStatus(studentId, phaseId, status, reason) {
      tx((db) => {
        requireTeacher(db);
        ownStudent(db, studentId);
        if (!getPhase(phaseId)) fail('invalid_phase');
        if (reason.trim().length < 3) fail('reason_required');
        const idx = db.progress.findIndex((p) => p.studentId === studentId && p.phaseId === phaseId);
        const before = idx >= 0 ? { ...db.progress[idx] } : null;
        let after: ProgressRow | null = null;
        if (status === 'reset') {
          if (idx >= 0) db.progress.splice(idx, 1);
        } else {
          let row = idx >= 0 ? db.progress[idx] : null;
          if (!row) {
            row = { ...emptyProgress(phaseId), studentId, startedAt: now() };
            db.progress.push(row);
          }
          if (status === 'completed') {
            row.status = 'completed';
            row.completedAt = row.completedAt ?? now();
            row.completedByTeacher = true;
          } else {
            row.status = 'in_progress';
            row.completedAt = null;
            row.completedByTeacher = false;
            row.manuallyUnlocked = true;
          }
          row.updatedAt = now();
          after = { ...row };
        }
        audit(db, {
          studentId, classId: null, phaseId, action: `set_status:${status}`, reason: reason.trim(),
          before: before as unknown as Record<string, unknown> | null,
          after: after as unknown as Record<string, unknown> | null,
        });
      });
    },
  };
}

export function createDemoBackend(): Backend {
  return { mode: 'demo', student: makeStudentApi(), teacher: makeTeacherApi() };
}

/** Apaga todos os dados de demonstração deste navegador. */
export function clearDemoData() {
  localStorage.removeItem(KEY);
}

export const DEMO_TOTAL_PHASES = PHASES.length;
