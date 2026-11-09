/**
 * Progresso do estudante — salvo SOMENTE no navegador (localStorage).
 * Nenhum dado é enviado para servidores. Não há nomes, e-mails ou identificação.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ACHIEVEMENTS, levelFor, type AchievementCtx } from '../data/achievements';

const KEY = 'academia-arduino:progresso:v1';

export interface MissionProgress {
  quiz?: boolean;
  activity?: boolean;
  done?: boolean;
  challenge?: boolean;
}

export interface ProgressState {
  version: 1;
  xp: number;
  missions: Record<string, MissionProgress>;
  badges: string[];
  /** contadores de exploração e atividades */
  counters: Record<string, number>;
  /** conjuntos (itens vistos: partes do Arduino, componentes da enciclopédia...) */
  seen: Record<string, string[]>;
  /** melhor pontuação de cada jogo */
  games: Record<string, { best: number; plays: number }>;
  /** marcas de "já ganhou XP por isso" */
  rewarded: string[];
}

const fresh = (): ProgressState => ({ version: 1, xp: 0, missions: {}, badges: [], counters: {}, seen: {}, games: {}, rewarded: [] });

function load(): ProgressState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fresh();
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return fresh();
    return { ...fresh(), ...data };
  } catch {
    return fresh();
  }
}

function save(s: ProgressState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Armazenamento indisponível (modo anônimo ou bloqueado): o progresso vale só nesta visita.
  }
}

export interface Toast {
  id: number;
  kind: 'xp' | 'badge' | 'info';
  title: string;
  text?: string;
}

interface ProgressApi {
  state: ProgressState;
  /** Dá XP uma única vez para a chave informada. */
  reward: (key: string, xp: number, label?: string) => void;
  updateMission: (id: string, patch: MissionProgress) => void;
  bump: (counter: string, by?: number) => void;
  markSeen: (set: string, item: string) => void;
  recordGame: (id: string, score: number) => void;
  reset: () => void;
  toasts: Toast[];
  notify: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
  storageOk: boolean;
}

const Ctx = createContext<ProgressApi | null>(null);

function storageAvailable() {
  try {
    const k = '__teste__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);
  const storageOk = useMemo(storageAvailable, []);

  const notify = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastId.current++;
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((x) => x.id !== id)), []);

  /** Aplica uma mudança, verifica conquistas e salva. */
  const apply = useCallback(
    (fn: (s: ProgressState) => ProgressState, xpLabel?: string) => {
      setState((prev) => {
        let next = fn(prev);
        if (next === prev) return prev;
        const gained = next.xp - prev.xp;
        // conquistas
        const ctx: AchievementCtx = next;
        const newBadges = ACHIEVEMENTS.filter((a) => !next.badges.includes(a.id) && a.test(ctx));
        if (newBadges.length) {
          next = { ...next, badges: [...next.badges, ...newBadges.map((b) => b.id)], xp: next.xp + newBadges.length * 50 };
          window.setTimeout(() => newBadges.forEach((b) => notify({ kind: 'badge', title: `Conquista: ${b.name}`, text: `${b.description} (+50 XP)` })), 0);
        }
        if (gained > 0) {
          const before = levelFor(prev.xp);
          const after = levelFor(next.xp);
          window.setTimeout(() => {
            notify({ kind: 'xp', title: `+${gained} XP`, text: xpLabel });
            if (after.index > before.index) notify({ kind: 'badge', title: `Novo nível: ${after.name}!`, text: 'Continue assim, inventor!' });
          }, 0);
        }
        save(next);
        return next;
      });
    },
    [notify],
  );

  const reward = useCallback(
    (key: string, xp: number, label?: string) =>
      apply((s) => (s.rewarded.includes(key) ? s : { ...s, xp: s.xp + xp, rewarded: [...s.rewarded, key] }), label),
    [apply],
  );
  const updateMission = useCallback(
    (id: string, patch: MissionProgress) =>
      apply((s) => {
        const cur = s.missions[id] ?? {};
        const merged = { ...cur, ...patch };
        if (JSON.stringify(cur) === JSON.stringify(merged)) return s;
        return { ...s, missions: { ...s.missions, [id]: merged } };
      }),
    [apply],
  );
  const bump = useCallback((counter: string, by = 1) => apply((s) => ({ ...s, counters: { ...s.counters, [counter]: (s.counters[counter] ?? 0) + by } })), [apply]);
  const markSeen = useCallback(
    (set: string, item: string) =>
      apply((s) => {
        const cur = s.seen[set] ?? [];
        if (cur.includes(item)) return s;
        return { ...s, seen: { ...s.seen, [set]: [...cur, item] } };
      }),
    [apply],
  );
  const recordGame = useCallback(
    (id: string, score: number) =>
      apply((s) => {
        const g = s.games[id] ?? { best: 0, plays: 0 };
        return { ...s, games: { ...s.games, [id]: { best: Math.max(g.best, score), plays: g.plays + 1 } } };
      }),
    [apply],
  );
  const reset = useCallback(() => {
    const f = fresh();
    try {
      // apaga também os programas salvos pelo estudante
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('academia-arduino:'))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* sem armazenamento */
    }
    save(f);
    setState(f);
    notify({ kind: 'info', title: 'Progresso reiniciado', text: 'Tudo começou de novo neste navegador.' });
  }, [notify]);

  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === KEY) setState(load());
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  const api = useMemo(
    () => ({ state, reward, updateMission, bump, markSeen, recordGame, reset, toasts, notify, dismiss, storageOk }),
    [state, reward, updateMission, bump, markSeen, recordGame, reset, toasts, notify, dismiss, storageOk],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProgress fora do ProgressProvider');
  return c;
}

/** Guarda um valor no navegador (programas do editor, blocos...). */
export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const full = `academia-arduino:${key}`;
  const [v, setV] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(full);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (nv: T | ((p: T) => T)) => {
      setV((prev) => {
        const val = typeof nv === 'function' ? (nv as (p: T) => T)(prev) : nv;
        try {
          window.localStorage.setItem(full, JSON.stringify(val));
        } catch {
          /* sem armazenamento */
        }
        return val;
      });
    },
    [full],
  );
  return [v, set];
}
