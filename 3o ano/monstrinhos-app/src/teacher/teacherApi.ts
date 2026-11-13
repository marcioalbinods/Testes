import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppConfig } from '../lib/config';
import { BUCKET, setStorageClient } from '../lib/api';
import type { Turma } from '../game/types';

// Cliente separado para o professor (não mistura com a sessão anônima dos estudantes).
let tc: SupabaseClient | null = null;
export function teacherClient(cfg: AppConfig) {
  if (!tc) {
    tc = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'monstrinhos-professor-auth', detectSessionInUrl: false },
    });
    setStorageClient(tc);
  }
  return tc;
}
const c = () => {
  if (!tc) throw new Error('cliente do professor não iniciado');
  return tc;
};

export interface ProjectRow {
  id: string;
  turma: Turma;
  student1: string;
  student2: string;
  created_at: string;
  last_access_at: string;
  updated_at: string;
  current_stage: number;
  current_mission: number;
  missions_done: number[];
  progress: number;
  stars: number;
  completed_at: string | null;
  version: number;
  data?: unknown;
}
export interface ArchiveRow {
  id: number;
  project_id: string | null;
  turma: Turma;
  student1: string;
  student2: string;
  progress: number;
  stars: number;
  data: unknown;
  reason: string;
  created_at: string;
  archived_at: string;
}
export interface SnapshotRow {
  id: number;
  project_id: string;
  version: number;
  progress: number;
  created_at: string;
  data: unknown;
}

function check<T>(r: { data: T | null; error: { message: string } | null }) {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export async function signIn(email: string, password: string) {
  const r = await c().auth.signInWithPassword({ email, password });
  if (r.error) throw new Error(r.error.message);
  return r.data.session;
}
export async function signOut() {
  await c().auth.signOut();
}
export async function currentSession() {
  return (await c().auth.getSession()).data.session;
}
export async function isTeacher() {
  const r = await c().rpc('is_teacher');
  if (r.error) return false;
  return r.data === true;
}

const LIST_COLS = 'id,turma,student1,student2,created_at,last_access_at,updated_at,current_stage,current_mission,missions_done,progress,stars,completed_at,version';

export async function listProjects(withData = false) {
  const cols: string = withData ? `${LIST_COLS},data` : LIST_COLS;
  const r = await c().from('projects').select(cols).order('turma').order('student1');
  return check<ProjectRow[]>(r as unknown as { data: ProjectRow[] | null; error: { message: string } | null });
}
export async function getProject(id: string) {
  return check<ProjectRow>(await c().from('projects').select('*').eq('id', id).single());
}
export async function listCodes() {
  const rows = check<{ project_id: string; code: string }[]>(await c().from('project_codes').select('project_id,code'));
  return Object.fromEntries(rows.map((r) => [r.project_id, r.code])) as Record<string, string>;
}
export async function listArchive() {
  return check<ArchiveRow[]>(await c().from('project_archive').select('*').order('archived_at', { ascending: false }));
}
export async function listSnapshots(projectId: string) {
  return check<SnapshotRow[]>(await c().from('project_snapshots').select('*').eq('project_id', projectId).order('created_at', { ascending: false }));
}
export async function classSettings() {
  const rows = check<{ turma: Turma; allow_recordings: boolean }[]>(await c().from('class_settings').select('turma,allow_recordings'));
  return Object.fromEntries(rows.map((r) => [r.turma, r.allow_recordings])) as Record<Turma, boolean>;
}

async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await c().rpc(fn, args);
  if (r.error) throw new Error(r.error.message);
  const d = r.data as { status: string; message?: string };
  if (d.status !== 'ok') throw new Error(d.message ?? d.status);
  return d;
}

/** Apaga as gravações de áudio de um projeto (Storage). */
export async function removeRecordings(projectId: string) {
  const list = await c().storage.from(BUCKET).list(projectId, { limit: 1000 });
  if (list.error || !list.data?.length) return;
  await c().storage.from(BUCKET).remove(list.data.map((f) => `${projectId}/${f.name}`));
}

export const resetProject = (id: string) => rpc('teacher_reset_project', { p_id: id });
export const resetClass = (turma: Turma) => rpc('teacher_reset_class', { p_turma: turma });
export async function clearProject(id: string) {
  await removeRecordings(id);
  return rpc('teacher_clear_project', { p_id: id });
}
export async function deleteProject(id: string) {
  await removeRecordings(id);
  return rpc('teacher_delete_project', { p_id: id });
}
export const deleteArchive = (id: number) => rpc('teacher_delete_archive', { p_id: id });
export const restoreSnapshot = (id: number) => rpc('teacher_restore_snapshot', { p_snapshot: id });
export const setRecordings = (turma: Turma, allow: boolean) => rpc('teacher_set_class_setting', { p_turma: turma, p_allow_recordings: allow });
