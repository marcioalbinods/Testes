import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppConfig } from './config';
import type { ProjectInfo, Turma } from '../game/types';

// Integração com o Supabase (jogo dos estudantes).
// Os estudantes entram com um usuário ANÔNIMO (sem e-mail) e só enxergam
// os projetos que criaram ou recuperaram com o código.

let client: SupabaseClient | null = null;

export function initClient(cfg: AppConfig) {
  if (!client) {
    client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'monstrinhos-auth', detectSessionInUrl: false },
    });
  }
  return client;
}

export function sb() {
  if (!client) throw new Error('Supabase não configurado');
  return client;
}

export class NetworkError extends Error {}

function isNetwork(e: unknown) {
  const msg = String((e as { message?: string })?.message ?? e);
  return /fetch|network|Failed to|Load failed|timeout|ECONN|offline/i.test(msg);
}

async function call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  let res;
  try {
    res = await sb().rpc(fn, args);
  } catch (e) {
    throw new NetworkError(String(e));
  }
  if (res.error) {
    if (isNetwork(res.error) || res.status === 0) throw new NetworkError(res.error.message);
    throw new Error(res.error.message);
  }
  return res.data as T;
}

/** Garante que este aparelho tenha uma sessão (anônima) no Supabase. */
export async function ensureSession() {
  const { data } = await sb().auth.getSession();
  if (data.session) return data.session;
  let r;
  try {
    r = await sb().auth.signInAnonymously();
  } catch (e) {
    throw new NetworkError(String(e));
  }
  if (r.error) {
    if (isNetwork(r.error) || r.error.status === 0) throw new NetworkError(r.error.message);
    throw new Error(r.error.message);
  }
  return r.data.session;
}

export type ProjectPayload = ProjectInfo & { data: unknown };

export type CreateResult =
  | { status: 'created'; code: string; project: ProjectPayload }
  | { status: 'exists' }
  | { status: 'blocked'; wait_seconds: number }
  | { status: 'error'; message: string };

export async function createProject(turma: Turma, s1: string, s2: string, force: boolean) {
  await ensureSession();
  return call<CreateResult>('create_project', { p_turma: turma, p_student1: s1, p_student2: s2, p_force: force });
}

export type RecoverResult =
  | { status: 'ok'; project: ProjectPayload }
  | { status: 'invalid'; remaining: number }
  | { status: 'blocked'; wait_seconds: number }
  | { status: 'error'; message: string };

export async function recoverProject(code: string) {
  await ensureSession();
  return call<RecoverResult>('recover_project', { p_code: code });
}

export type LoadResult = { status: 'ok'; project: ProjectPayload } | { status: 'forbidden' } | { status: 'not_found' };

export async function loadProject(id: string) {
  await ensureSession();
  return call<LoadResult>('load_project', { p_id: id });
}

export type SaveResult =
  | { status: 'ok'; version: number; updated_at: string }
  | { status: 'conflict'; project: ProjectPayload }
  | { status: 'forbidden' }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

export interface SaveMeta {
  stage: number;
  mission: number;
  done: number[];
  progress: number;
  stars: number;
}

export async function saveProject(id: string, baseVersion: number, epoch: number, data: unknown, meta: SaveMeta) {
  await ensureSession();
  return call<SaveResult>('save_project', {
    p_id: id,
    p_base_version: baseVersion,
    p_epoch: epoch,
    p_data: data,
    p_current_stage: meta.stage,
    p_current_mission: meta.mission,
    p_missions_done: meta.done,
    p_progress: meta.progress,
    p_stars: meta.stars,
  });
}

export async function leaveProject(id: string) {
  await ensureSession();
  return call<{ status: string }>('leave_project', { p_id: id });
}

export async function getMyCode(id: string) {
  const r = await call<{ status: string; code?: string }>('get_my_code', { p_id: id });
  return r.code ?? null;
}

export async function getProjectSettings(id: string) {
  const r = await call<{ status: string; allow_recordings?: boolean }>('get_project_settings', { p_id: id });
  return { allowRecordings: !!r.allow_recordings };
}

// ------------------------------------------------------------ Gravações
export const BUCKET = 'gravacoes';

export async function uploadRecording(projectId: string, recId: string, blob: Blob, mime: string) {
  const ext = mime.includes('ogg') ? 'ogg' : mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac') ? 'm4a' : mime.includes('wav') ? 'wav' : 'webm';
  const path = `${projectId}/${recId}.${ext}`;
  const clean = mime.split(';')[0] || 'audio/webm';
  let r;
  try {
    r = await sb().storage.from(BUCKET).upload(path, blob, { contentType: clean, upsert: true });
  } catch (e) {
    throw new NetworkError(String(e));
  }
  if (r.error) {
    if (isNetwork(r.error)) throw new NetworkError(r.error.message);
    throw new Error(r.error.message);
  }
  return path;
}

/** O painel do professor usa o próprio cliente (login do professor) para ouvir gravações. */
let storageOverride: SupabaseClient | null = null;
export function setStorageClient(c: SupabaseClient | null) {
  storageOverride = c;
}

export async function downloadRecording(path: string) {
  const r = await (storageOverride ?? sb()).storage.from(BUCKET).download(path);
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

export async function deleteRecording(path: string) {
  await sb().storage.from(BUCKET).remove([path]);
}
