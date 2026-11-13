import type { GameData, ProjectInfo, SectionKey } from '../game/types';
import { normalizeGame } from '../game/defaults';
import { mergeWithBase } from '../game/merge';
import { currentStage, nextMission, progressPct, totalStars } from '../game/progress';
import * as api from './api';
import { idb, ls } from './idb';

// =====================================================================
// SALVAMENTO AUTOMÁTICO NA NUVEM
//
// * Cada alteração é guardada NA HORA no aparelho (localStorage).
// * Depois de uma pausa (debounce) é enviada ao Supabase.
// * Sem internet: fica guardada no aparelho e é enviada quando voltar.
// * Conflito de versão: junta as mudanças (nunca apaga o que é mais novo).
// =====================================================================

export type SaveStatus = 'saved' | 'saving' | 'pending' | 'offline' | 'reconnecting' | 'error';

interface LocalCopy {
  info: ProjectInfo;
  data: GameData;
  version: number;
  epoch: number;
  dirty: SectionKey[];
  /** Último estado confirmado pelo servidor (base para juntar versões). */
  base?: GameData;
  /** Depois de sincronizar, este aparelho deve sair do projeto (troca de dupla). */
  leaveAfterSync?: boolean;
  savedAt: number;
}

const KEY = (id: string) => `monstrinhos:proj:${id}`;
const DEBOUNCE = 1500;

export function readLocal(id: string) {
  return ls.get<LocalCopy>(KEY(id));
}
export function hasPendingChanges(id: string) {
  const c = readLocal(id);
  return !!c && c.dirty.length > 0;
}

function metaOf(g: GameData): api.SaveMeta {
  const n = nextMission(g);
  return { stage: currentStage(g), mission: n ? n.id : 31, done: g.progress.done, progress: progressPct(g), stars: totalStars(g) };
}

type Listener = () => void;

export class ProjectStore {
  info: ProjectInfo;
  data: GameData;
  version: number;
  epoch: number;
  dirty = new Set<SectionKey>();
  /** Último estado igual ao do servidor. */
  base: GameData | null = null;
  status: SaveStatus = 'saved';
  lastError = '';
  /** Mensagem especial (ex.: o professor reiniciou o projeto). */
  notice: 'reset' | 'forbidden' | null = null;
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private saving = false;
  private again = false;
  private retryMs = 2000;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(info: ProjectInfo, data: GameData, version: number, epoch: number, dirty: SectionKey[] = [], base: GameData | null = null) {
    this.info = info;
    this.data = data;
    this.base = base ?? (dirty.length ? null : data);
    this.version = version;
    this.epoch = epoch;
    dirty.forEach((d) => this.dirty.add(d));
    if (this.dirty.size) this.status = navigator.onLine ? 'pending' : 'offline';
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
    document.addEventListener('visibilitychange', this.onHide);
    window.addEventListener('pagehide', this.onHide);
  }

  /** Cria a partir do que veio do servidor, juntando com uma cópia local mais nova (se houver). */
  static fromServer(p: api.ProjectPayload): ProjectStore {
    const { data: raw, ...info } = p;
    const server = normalizeGame(raw);
    const local = readLocal(info.id);
    if (local && local.epoch === info.epoch && local.dirty.length > 0) {
      // havia mudanças locais não enviadas: junta com a versão do servidor
      const merged = mergeWithBase(local.base ? normalizeGame(local.base) : null, normalizeGame(local.data), server, local.dirty);
      const s = new ProjectStore(info, merged, info.version, info.epoch, local.dirty, server);
      s.persist();
      s.schedule(300); // envia logo o que estava pendente
      return s;
    }
    const s = new ProjectStore(info, server, info.version, info.epoch);
    s.persist();
    return s;
  }

  /** Abre só com a cópia do aparelho (sem internet). */
  static fromLocal(id: string): ProjectStore | null {
    const c = readLocal(id);
    if (!c) return null;
    const s = new ProjectStore(c.info, normalizeGame(c.data), c.version, c.epoch, c.dirty, c.base ? normalizeGame(c.base) : null);
    if (c.dirty.length) s.schedule(1000);
    return s;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private emit() {
    this.listeners.forEach((l) => l());
  }

  private persist() {
    const copy: LocalCopy = { info: this.info, data: this.data, version: this.version, epoch: this.epoch, dirty: Array.from(this.dirty), base: this.dirty.size && this.base ? this.base : undefined, savedAt: Date.now() };
    if (!ls.set(KEY(this.info.id), copy)) {
      // sem espaço no localStorage: guarda no IndexedDB como reserva
      void idb.set(KEY(this.info.id), copy);
    }
  }

  /** Altera uma parte do jogo. "immediate" salva logo (ex.: missão concluída). */
  update<K extends SectionKey>(key: K, fn: (prev: GameData[K]) => GameData[K], opts: { immediate?: boolean } = {}) {
    if (this.destroyed) return;
    const next = fn(this.data[key]);
    if (next === this.data[key]) return;
    this.data = { ...this.data, [key]: next, stamps: { ...this.data.stamps, [key]: Math.max(Date.now(), (this.data.stamps[key] ?? 0) + 1) } };
    this.dirty.add(key);
    this.persist();
    if (this.status !== 'offline' && this.status !== 'error') this.status = 'pending';
    this.emit();
    this.schedule(opts.immediate ? 50 : DEBOUNCE);
  }

  schedule(ms: number) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, ms);
  }

  private onOnline = () => {
    this.status = 'reconnecting';
    this.emit();
    this.retryMs = 2000;
    void this.flush();
  };
  private onOffline = () => {
    if (this.dirty.size) this.status = 'offline';
    else this.status = 'offline';
    this.emit();
  };
  private onHide = () => {
    if (document.visibilityState === 'hidden' || !document.visibilityState) {
      this.persist();
      if (this.dirty.size) void this.flush();
    }
  };

  /** Envia as mudanças para a nuvem. */
  async flush(): Promise<boolean> {
    if (this.destroyed && !this.dirty.size) return true;
    if (this.saving) {
      this.again = true;
      return false;
    }
    await this.uploadPendingRecordings();
    if (!this.dirty.size) {
      if (this.status !== 'offline' || navigator.onLine) this.status = 'saved';
      this.emit();
      return true;
    }
    if (!navigator.onLine) {
      this.status = 'offline';
      this.emit();
      return false;
    }
    this.saving = true;
    if (this.status !== 'reconnecting') this.status = 'saving';
    this.emit();
    let ok = false;
    try {
      for (let attempt = 0; attempt < 4; attempt++) {
        const snapshot = this.data;
        const sent = new Set(this.dirty);
        const res = await api.saveProject(this.info.id, this.version, this.epoch, snapshot, metaOf(snapshot));
        if (res.status === 'ok') {
          this.version = res.version;
          this.base = snapshot;
          for (const k of sent) if (this.data.stamps[k] === snapshot.stamps[k]) this.dirty.delete(k);
          const m = metaOf(snapshot);
          this.info = { ...this.info, version: res.version, updated_at: res.updated_at, progress: m.progress, stars: m.stars, missions_done: m.done, current_stage: m.stage, current_mission: m.mission };
          ok = true;
          break;
        }
        if (res.status === 'conflict') {
          const server = res.project;
          if (server.epoch !== this.epoch) {
            // o professor reiniciou o projeto: vale a versão do servidor
            this.data = normalizeGame(server.data);
            this.base = this.data;
            this.dirty.clear();
            this.epoch = server.epoch;
            this.version = server.version;
            const { data: _d, ...info } = server;
            void _d;
            this.info = info;
            this.notice = 'reset';
            ok = true;
            break;
          }
          const serverData = normalizeGame(server.data);
          this.data = mergeWithBase(this.base, this.data, serverData, new Set([...this.dirty, ...sent]));
          this.base = serverData;
          this.version = server.version;
          for (const k of sent) this.dirty.add(k);
          continue;
        }
        if (res.status === 'forbidden' || res.status === 'not_found') {
          this.notice = 'forbidden';
          this.status = 'error';
          this.lastError = 'Este aparelho não tem mais acesso a este projeto.';
          break;
        }
        this.status = 'error';
        this.lastError = 'message' in res ? res.message : 'Erro ao salvar';
        break;
      }
    } catch (e) {
      ok = false;
      this.status = navigator.onLine ? 'reconnecting' : 'offline';
      this.lastError = String(e);
      if (!(e instanceof api.NetworkError)) this.status = 'error';
    } finally {
      this.saving = false;
    }
    this.persist();
    if (ok) {
      this.retryMs = 2000;
      this.status = this.dirty.size ? 'pending' : 'saved';
      this.emit();
      if (this.again || this.dirty.size) {
        this.again = false;
        this.schedule(300);
      }
      return true;
    }
    this.emit();
    if (this.notice !== 'forbidden') {
      // tenta de novo, cada vez esperando um pouco mais (até 30 s)
      if (this.retryTimer) clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => {
        if (navigator.onLine) {
          this.status = 'reconnecting';
          this.emit();
        }
        void this.flush();
      }, this.retryMs);
      this.retryMs = Math.min(30000, this.retryMs * 2);
    }
    return false;
  }

  // ------------------------------------------------------ gravações
  async uploadPendingRecordings() {
    const recs = this.data.sounds.recordings.filter((r) => !r.path);
    if (!recs.length || !navigator.onLine) return;
    for (const r of recs) {
      const blob = await idb.get<Blob>(`rec:${r.id}`);
      if (!blob) continue;
      try {
        const path = await api.uploadRecording(this.info.id, r.id, blob, r.mime);
        this.update('sounds', (s) => ({ ...s, recordings: s.recordings.map((x) => (x.id === r.id ? { ...x, path } : x)) }));
      } catch {
        // tenta de novo no próximo salvamento
      }
    }
  }

  /** Para de ouvir eventos; tenta salvar o que falta. */
  async close(opts: { leave?: boolean } = {}) {
    if (this.timer) clearTimeout(this.timer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    const ok = await this.flush().catch(() => false);
    this.destroyed = true;
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
    document.removeEventListener('visibilitychange', this.onHide);
    window.removeEventListener('pagehide', this.onHide);
    if (opts.leave) {
      if (ok && !this.dirty.size) {
        try {
          await api.leaveProject(this.info.id);
          ls.del(KEY(this.info.id));
          return;
        } catch {
          /* sem internet: marca para sair depois */
        }
      }
      const c = readLocal(this.info.id);
      if (c) ls.set(KEY(this.info.id), { ...c, leaveAfterSync: true });
    }
  }
}

/**
 * Sincroniza em segundo plano projetos que ficaram com mudanças no aparelho
 * (por exemplo, a dupla trocou de aparelho sem internet).
 */
export async function syncBackground(exceptId?: string) {
  if (!navigator.onLine) return;
  for (const key of ls.keys('monstrinhos:proj:')) {
    const c = ls.get<LocalCopy>(key);
    if (!c || c.info.id === exceptId) continue;
    if (!c.dirty.length && !c.leaveAfterSync) continue;
    try {
      const store = new ProjectStore(c.info, normalizeGame(c.data), c.version, c.epoch, c.dirty, c.base ? normalizeGame(c.base) : null);
      await store.close({ leave: !!c.leaveAfterSync });
    } catch {
      /* tenta outra hora */
    }
  }
}

// ------------------------------------------------------------ Aparelho
// Lembra qual dupla usou este aparelho por último.
export interface DeviceRecord {
  projectId: string;
  turma: string;
  student1: string;
  student2: string;
  lastActive: number;
  codeHash: string | null;
}
const DEVICE = 'monstrinhos:device';
export const SESSION_HOURS = 3;

export const device = {
  get: () => ls.get<DeviceRecord>(DEVICE),
  set: (r: DeviceRecord) => ls.set(DEVICE, r),
  touch() {
    const r = ls.get<DeviceRecord>(DEVICE);
    if (r) ls.set(DEVICE, { ...r, lastActive: Date.now() });
  },
  clear: () => ls.del(DEVICE),
  isStale(r: DeviceRecord) {
    return Date.now() - r.lastActive > SESSION_HOURS * 3600 * 1000;
  },
};

export async function hashCode(code: string) {
  const norm = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('monstrinhos:' + norm));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

export function forgetLocalProject(id: string) {
  ls.del(KEY(id));
}
