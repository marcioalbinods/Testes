/**
 * Conta da turma: login do estudante (número + senha) e sincronização do progresso
 * com a planilha do professor (Google Apps Script).
 *
 * O endereço do servidor fica no arquivo config.json, ao lado do index.html:
 *   { "servidorUrl": "https://script.google.com/macros/s/.../exec" }
 * Sem esse endereço, a plataforma funciona como antes: progresso só no navegador.
 */
import { useEffect, useState } from 'react';

export interface Session {
  numero: string;
  nome: string;
  token: string;
  turma: string;
  /** manter conectado depois de fechar o navegador */
  keep: boolean;
}

const SESSION_KEY = 'academia-arduino:sessao';
export const PREFIX = 'academia-arduino:';
export const PROGRESS_SUFFIX = 'progresso:v1';

// Aceita contas pessoais (/macros/s/…) e institucionais (/a/macros/dominio/s/…).
const VALID = /^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]+\/exec$/;
const LOCAL_TEST = /^http:\/\/(?:localhost|127\.0\.0\.1):\d+\/[A-Za-z0-9/_-]*$/;

/* ---------------- sessão ---------------- */
function readSession(): Session | null {
  for (const store of [sessionStorageSafe(), localStorageSafe()]) {
    try {
      const raw = store?.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Session;
        if (s && /^\d{3,6}$/.test(s.numero) && s.token) return s;
      }
    } catch {
      /* armazenamento indisponível */
    }
  }
  return null;
}
function sessionStorageSafe() { try { return window.sessionStorage; } catch { return null; } }
function localStorageSafe() { try { return window.localStorage; } catch { return null; } }

let session: Session | null = typeof window !== 'undefined' ? readSession() : null;

export const currentSession = () => session;

/** Prefixo das chaves de armazenamento do perfil atual ("" = sem conta, só neste navegador). */
export const profilePrefix = () => (session ? `u${session.numero}:` : '');
export const storageKey = (k: string) => `${PREFIX}${profilePrefix()}${k}`;

function writeSession(s: Session | null) {
  for (const store of [sessionStorageSafe(), localStorageSafe()]) {
    try { store?.removeItem(SESSION_KEY); } catch { /* */ }
  }
  if (s) {
    try { (s.keep ? localStorageSafe() : sessionStorageSafe())?.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* */ }
  }
  session = s;
}

/* ---------------- configuração ---------------- */
let configPromise: Promise<string | null> | null = null;

export function loadServerUrl(): Promise<string | null> {
  if (!configPromise) {
    configPromise = (async () => {
      if (!/^https?:$/.test(location.protocol)) return null;
      try {
        const r = await fetch('./config.json', { cache: 'no-store' });
        if (!r.ok) return null;
        const cfg = (await r.json()) as { servidorUrl?: string };
        const url = (cfg.servidorUrl ?? '').trim();
        if (VALID.test(url)) return url;
        if (LOCAL_TEST.test(url) && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return url;
        return null;
      } catch {
        return null;
      }
    })();
  }
  return configPromise;
}

/** Hook: endereço do servidor (null enquanto carrega ou se não estiver configurado). */
export function useServer(): { ready: boolean; url: string | null } {
  const [st, setSt] = useState<{ ready: boolean; url: string | null }>({ ready: false, url: null });
  useEffect(() => {
    let alive = true;
    loadServerUrl().then((url) => alive && setSt({ ready: true, url }));
    return () => { alive = false; };
  }, []);
  return st;
}

/* ---------------- chamadas ao servidor ---------------- */
export class ServerError extends Error {}

async function call<T = Record<string, unknown>>(body: object, timeoutMs = 25000): Promise<T> {
  const url = await loadServerUrl();
  if (!url) throw new ServerError('A conta da turma ainda não foi configurada pelo professor.');
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  try {
    // text/plain evita a "pré-verificação" do navegador, que o Apps Script não aceita
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ app: 'academia-arduino', ...body }), signal: ctrl.signal });
  } catch {
    throw new ServerError('Sem conexão com o servidor da turma. Confira a internet e tente de novo.');
  } finally {
    window.clearTimeout(timer);
  }
  let data: { ok?: boolean; erro?: string } & T;
  try {
    data = await res.json();
  } catch {
    throw new ServerError('O servidor da turma respondeu de um jeito inesperado. Avise o professor.');
  }
  if (!data.ok) throw new ServerError(data.erro || 'Não foi possível completar o pedido.');
  return data;
}

/* ---------------- estudante ---------------- */
interface LoginResult {
  numero: string;
  nome: string;
  turma: string;
  token: string;
  progresso: { updatedAt?: number } | null;
  trabalhos: Record<string, string> | null;
  atualizadoEm: number;
}

/** Entra na conta: baixa o progresso salvo e passa a usar o perfil do estudante neste navegador. */
export async function login(numero: string, senha: string, keep: boolean) {
  const n = numero.replace(/\D/g, '');
  const r = await call<LoginResult>({ acao: 'entrar', numero: n, senha });
  const s: Session = { numero: r.numero, nome: r.nome, token: r.token, turma: r.turma, keep };
  applyRemote(s.numero, r);
  writeSession(s);
  return s;
}

function localUpdatedAt(numero: string) {
  try {
    const raw = localStorageSafe()?.getItem(`${PREFIX}u${numero}:${PROGRESS_SUFFIX}`);
    return raw ? Number(JSON.parse(raw).updatedAt) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Guarda neste navegador a versão do servidor, se ela for mais nova que a daqui.
 * Devolve 'remote' (usou a do servidor), 'local' (a daqui é mais nova) ou 'same'.
 */
function applyRemote(numero: string, r: { progresso: { updatedAt?: number } | null; trabalhos: Record<string, string> | null; atualizadoEm: number }) {
  const ls = localStorageSafe();
  const localUpdated = localUpdatedAt(numero);
  const remoteUpdated = r.atualizadoEm || Number(r.progresso?.updatedAt) || 0;
  if (!r.progresso) return localUpdated ? 'local' : 'same';
  if (remoteUpdated === localUpdated) return 'same';
  if (remoteUpdated < localUpdated) return 'local';
  try {
    ls?.setItem(`${PREFIX}u${numero}:${PROGRESS_SUFFIX}`, JSON.stringify(r.progresso));
    for (const [k, v] of Object.entries(r.trabalhos ?? {})) {
      if (k.startsWith(`u${numero}:`) && typeof v === 'string') ls?.setItem(PREFIX + k, v);
    }
  } catch { /* */ }
  return 'remote';
}

let startup: Promise<'remote' | 'local' | 'same' | 'error'> | null = null;

/**
 * Ao abrir o site com uma conta já conectada: busca a versão do servidor.
 * 'remote' = havia uma versão mais nova (de outro aparelho) e ela foi guardada aqui: recarregue a página.
 */
export function refreshFromServer() {
  if (!session) return Promise.resolve('same' as const);
  if (!startup) {
    const s = session;
    startup = call<LoginResult>({ acao: 'carregar', numero: s.numero, token: s.token })
      .then((r) => {
        const res = applyRemote(s.numero, r);
        if (res === 'local') { dirty = true; void flushSync(); }
        if (r.nome && r.nome !== s.nome) writeSession({ ...s, nome: r.nome });
        return res;
      })
      .catch((e) => {
        if (e instanceof Error && e.message === 'SESSAO_EXPIRADA') setSync('expired', 'Sua sessão terminou (você entrou em outro aparelho?). Entre de novo para salvar na turma.');
        else setSync('offline', 'Sem conexão: o progresso está guardado neste computador e será enviado quando a internet voltar.');
        return 'error' as const;
      });
  }
  return startup;
}

/** Sai da conta neste navegador (o progresso continua salvo na planilha). */
export async function logout() {
  await flushSync();
  const s = session;
  writeSession(null);
  if (s) call({ acao: 'sair', numero: s.numero, token: s.token }, 8000).catch(() => {});
}

/* ---------------- sincronização ---------------- */
export type SyncState = 'idle' | 'pending' | 'saving' | 'saved' | 'offline' | 'expired' | 'error';
let syncState: SyncState = 'idle';
let syncMessage = '';
const listeners = new Set<() => void>();
let timer: number | null = null;
let retryTimer: number | null = null;
let inflight: Promise<void> | null = null;
let dirty = false;

function setSync(s: SyncState, msg = '') {
  syncState = s;
  syncMessage = msg;
  listeners.forEach((l) => l());
}

export function useSyncState() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return { state: syncState, message: syncMessage };
}

function collect() {
  if (!session) return null;
  const ls = localStorageSafe();
  if (!ls) return null;
  const prefix = `${PREFIX}u${session.numero}:`;
  let progresso: unknown = null;
  const trabalhos: Record<string, string> = {};
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (!k || !k.startsWith(prefix)) continue;
    const v = ls.getItem(k) ?? '';
    if (k === prefix + PROGRESS_SUFFIX) {
      try { progresso = JSON.parse(v); } catch { /* */ }
    } else trabalhos[k.slice(PREFIX.length)] = v;
  }
  if (!progresso) return null;
  return { progresso, trabalhos, atualizadoEm: Number((progresso as { updatedAt?: number }).updatedAt) || Date.now() };
}

/** Pede para salvar na planilha daqui a pouco (junta várias mudanças em um envio). */
export function scheduleSync() {
  if (!session) return;
  dirty = true;
  if (syncState !== 'expired') setSync('pending');
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => { timer = null; void flushSync(); }, 2500);
}

export async function flushSync(): Promise<void> {
  if (!session || !dirty) return inflight ?? undefined;
  // não envia nada antes de conferir se o servidor tem uma versão mais nova
  if (startup) { const r = await startup; if (r === 'remote') return; }
  if (syncState === 'expired') return;
  if (inflight) {
    await inflight;
    if (!dirty) return;
  }
  const payload = collect();
  if (!payload) return;
  const s = session;
  dirty = false;
  setSync('saving');
  inflight = (async () => {
    try {
      await call({ acao: 'salvar', numero: s.numero, token: s.token, ...payload });
      setSync(dirty ? 'pending' : 'saved');
    } catch (e) {
      dirty = true;
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'SESSAO_EXPIRADA') setSync('expired', 'Sua sessão terminou (você entrou em outro aparelho?). Entre de novo para salvar na turma.');
      else {
        setSync('offline', 'Sem conexão: o progresso está guardado neste computador e será enviado assim que a internet voltar.');
        if (retryTimer) window.clearTimeout(retryTimer);
        retryTimer = window.setTimeout(() => void flushSync(), 30000);
      }
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { if (dirty) void flushSync(); });
  // ao fechar a página, tenta mandar o que faltou
  window.addEventListener('pagehide', () => {
    if (!session || !dirty) return;
    const payload = collect();
    void loadServerUrl().then((url) => {
      if (!url || !payload || !session) return;
      try {
        navigator.sendBeacon(url, new Blob([JSON.stringify({ app: 'academia-arduino', acao: 'salvar', numero: session.numero, token: session.token, ...payload })], { type: 'text/plain;charset=utf-8' }));
      } catch { /* */ }
    });
  });
}

/* ---------------- professor ---------------- */
export interface StudentRow {
  numero: string;
  nome: string;
  turma: string;
  cadastradoEm: string;
  ultimoAcesso: string;
  xp: number;
  concluidas: number;
  atual: string;
  conquistas: number;
  progresso: {
    xp?: number;
    missions?: Record<string, { quiz?: boolean; activity?: boolean; done?: boolean; challenge?: boolean }>;
    badges?: string[];
    games?: Record<string, { best: number; plays: number }>;
    counters?: Record<string, number>;
  } | null;
}

export const teacher = {
  entrar: (senha: string) => call<{ turma: string }>({ acao: 'prof-entrar', senhaProfessor: senha }),
  listar: (senha: string) => call<{ turma: string; planilha: string; estudantes: StudentRow[] }>({ acao: 'prof-listar', senhaProfessor: senha }),
  cadastrar: (senha: string, nomes: string[]) => call<{ criados: { numero: string; nome: string; senha: string }[] }>({ acao: 'prof-cadastrar', senhaProfessor: senha, nomes }, 60000),
  novaSenha: (senha: string, numero: string) => call<{ numero: string; nome: string; senha: string }>({ acao: 'prof-nova-senha', senhaProfessor: senha, numero }),
  remover: (senha: string, numero: string) => call({ acao: 'prof-remover', senhaProfessor: senha, numero }),
  renomear: (senha: string, numero: string, nome: string) => call({ acao: 'prof-renomear', senhaProfessor: senha, numero, nome }),
};
