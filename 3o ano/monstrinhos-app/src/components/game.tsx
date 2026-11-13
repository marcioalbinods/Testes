import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { GameData, SectionKey } from '../game/types';
import type { ProjectStore, SaveStatus } from '../lib/sync';
import { device } from '../lib/sync';
import { MISSIONS, missionById, type ToolId } from '../game/missions';
import { isDone, missionStars, newTrophies, stageDone, TROPHIES, type TrophyDef } from '../game/progress';
import { sfx } from '../lib/audio';
import { toast } from './ui';

export type Route =
  | { name: 'map' }
  | { name: 'tool'; tool: ToolId; mission: number | null; focus?: string }
  | { name: 'trophies' }
  | { name: 'exhibition' };

export interface Celebration {
  missionId: number;
  stars: number;
  medal: number | null;
  trophies: TrophyDef[];
  first: boolean;
}

interface Ctx {
  store: ProjectStore;
  data: GameData;
  status: SaveStatus;
  allowRecordings: boolean;
  route: Route;
  go: (r: Route) => void;
  update: <K extends SectionKey>(key: K, fn: (prev: GameData[K]) => GameData[K], opts?: { immediate?: boolean }) => void;
  completeMission: (id: number) => void;
  celebration: Celebration | null;
  closeCelebration: () => void;
  openMission: (id: number) => void;
}

const GameContext = createContext<Ctx | null>(null);

export function useGame() {
  const c = useContext(GameContext);
  if (!c) throw new Error('useGame fora do GameProvider');
  return c;
}

export function GameProvider({ store, allowRecordings, children }: { store: ProjectStore; allowRecordings: boolean; children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.data,
  );
  const status = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.status,
  );
  const [route, setRoute] = useState<Route>({ name: 'map' });
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const trophyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback<Ctx['update']>((k, fn, o) => {
    store.update(k, fn, o);
    device.touch();
  }, [store]);

  // Troféus conquistados aparecem como aviso (sem atrapalhar).
  useEffect(() => {
    if (trophyTimer.current) clearTimeout(trophyTimer.current);
    trophyTimer.current = setTimeout(() => {
      const fresh = newTrophies(store.data);
      if (!fresh.length || celebration) return;
      store.update('progress', (p) => ({ ...p, achievements: Array.from(new Set([...p.achievements, ...fresh.map((t) => t.id)])) }));
      fresh.forEach((t, i) => setTimeout(() => { sfx.star(); toast(`Novo troféu: ${t.name}!`, t.icon, 'ok'); }, i * 900));
    }, 900);
  }, [snapshot, store, celebration]);

  const completeMission = useCallback((id: number) => {
    const g = store.data;
    const m = missionById(id);
    if (!m || !m.check(g)) return;
    const first = !isDone(g, id);
    const stars = Math.max(missionStars(g, id), g.progress.stars[String(id)] ?? 0);
    const wasStageDone = stageDone(g, m.stage);
    store.update('progress', (p) => ({
      ...p,
      done: Array.from(new Set([...p.done, id])).sort((a, b) => a - b),
      stars: { ...p.stars, [String(id)]: stars },
      lastMission: Math.max(p.lastMission, id),
    }), { immediate: true });
    const after = store.data;
    const medal = !wasStageDone && stageDone(after, m.stage) ? m.stage : null;
    const trophies = newTrophies(after);
    if (trophies.length) store.update('progress', (p) => ({ ...p, achievements: Array.from(new Set([...p.achievements, ...trophies.map((t) => t.id)])) }), { immediate: true });
    device.touch();
    sfx.success();
    setCelebration({ missionId: id, stars, medal, trophies, first });
  }, [store]);

  const openMission = useCallback((id: number) => {
    const m = missionById(id);
    if (!m) return;
    sfx.whoosh();
    setRoute({ name: 'tool', tool: m.tool, mission: id, focus: m.focus });
  }, []);

  const go = useCallback((r: Route) => {
    sfx.whoosh();
    setRoute(r);
  }, []);

  const value: Ctx = {
    store, data: snapshot, status, allowRecordings, route, go, update, completeMission,
    celebration, closeCelebration: () => setCelebration(null), openMission,
  };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const ALL_TROPHIES = TROPHIES;
export const ALL_MISSIONS = MISSIONS;
