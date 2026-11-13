import type { GameData, ProgressState, SectionKey, SoundState } from './types';
import { SECTION_KEYS } from './types';

function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const stars: Record<string, number> = { ...b.stars };
  for (const [k, v] of Object.entries(a.stars)) stars[k] = Math.max(stars[k] ?? 0, v);
  return {
    done: Array.from(new Set([...a.done, ...b.done])).sort((x, y) => x - y),
    stars,
    achievements: Array.from(new Set([...a.achievements, ...b.achievements])),
    seenIntro: Array.from(new Set([...a.seenIntro, ...b.seenIntro])),
    lastMission: Math.max(a.lastMission, b.lastMission),
  };
}

/**
 * Junta a versão do aparelho (local) com a versão mais nova do servidor.
 * - Partes que o aparelho NÃO alterou: fica a versão do servidor.
 * - Partes alteradas no aparelho: fica a mais recente (pelo carimbo de tempo).
 * - Progresso: soma tudo (missões concluídas nunca se perdem).
 */
export function mergeGame(local: GameData, server: GameData, dirty: Iterable<SectionKey>): GameData {
  const d = new Set(dirty);
  const out = { ...server, stamps: { ...server.stamps } } as GameData;
  for (const k of SECTION_KEYS) {
    if (k === 'progress') continue;
    if (d.has(k) && (local.stamps[k] ?? 0) >= (server.stamps[k] ?? 0)) {
      (out as unknown as Record<string, unknown>)[k] = local[k];
      out.stamps[k] = local.stamps[k];
    }
  }
  out.progress = mergeProgress(local.progress, server.progress);
  out.stamps.progress = Math.max(local.stamps.progress ?? 0, server.stamps.progress ?? 0);
  // gravações nunca somem por causa de uma junção
  const recs = new Map<string, SoundState['recordings'][number]>();
  for (const r of [...server.sounds.recordings, ...local.sounds.recordings]) {
    const prev = recs.get(r.id);
    recs.set(r.id, prev && prev.path && !r.path ? prev : r);
  }
  out.sounds = { ...out.sounds, recordings: Array.from(recs.values()) };
  return out;
}

// ---------------------------------------------------------------------
// Junção de 3 vias (base sincronizada × aparelho × servidor), campo a campo.
// - O que só um lado mudou, prevalece.
// - Listas com "uid"/"id" (objetos do habitat, histórias, quadros...) são
//   juntadas item a item: nada criado em outro aparelho se perde.
// - Se os dois lados mudaram o MESMO campo, fica a mudança deste aparelho.
// ---------------------------------------------------------------------
type J = unknown;
const isPlain = (x: J): x is Record<string, J> => !!x && typeof x === 'object' && !Array.isArray(x);
export function deepEqual(a: J, b: J): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as J[];
    return a.length === bb.length && a.every((x, i) => deepEqual(x, bb[i]));
  }
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  return ka.length === kb.length && ka.every((k) => deepEqual((a as Record<string, J>)[k], (b as Record<string, J>)[k]));
}
const keyOf = (x: J): string | null => (isPlain(x) ? (typeof x.uid === 'string' ? `u:${x.uid}` : typeof x.id === 'string' ? `i:${x.id}` : null) : null);

function mergeArrays(base: J[] | undefined, local: J[], server: J[]): J[] {
  const keyed = [...local, ...server].length > 0 && [...local, ...server].every((x) => keyOf(x) !== null);
  if (keyed) {
    const bm = new Map((base ?? []).map((x) => [keyOf(x)!, x]));
    const lm = new Map(local.map((x) => [keyOf(x)!, x]));
    const sm = new Map(server.map((x) => [keyOf(x)!, x]));
    const out: J[] = [];
    const seen = new Set<string>();
    const order = [...local.map((x) => keyOf(x)!), ...server.map((x) => keyOf(x)!)];
    for (const k of order) {
      if (seen.has(k)) continue;
      seen.add(k);
      const inL = lm.has(k);
      const inS = sm.has(k);
      const inB = bm.has(k);
      if (inL && inS) out.push(merge3(bm.get(k), lm.get(k), sm.get(k)));
      else if (inL && !inS) {
        if (!inB || !deepEqual(bm.get(k), lm.get(k))) out.push(lm.get(k)); // novo aqui, ou mudou aqui
      } else if (!inL && inS) {
        if (!inB || !deepEqual(bm.get(k), sm.get(k))) out.push(sm.get(k)); // novo lá, ou mudou lá
      }
    }
    return out;
  }
  if (base && base.length === local.length && local.length === server.length) {
    return local.map((x, i) => merge3(base[i], x, server[i]));
  }
  const prim = [...local, ...server].every((x) => x === null || typeof x !== 'object');
  if (prim && base) {
    const removed = new Set(base.filter((x) => !local.includes(x) || !server.includes(x)));
    const out: J[] = [];
    for (const x of [...local, ...server]) if (!removed.has(x) && !out.includes(x)) out.push(x);
    return out;
  }
  return local;
}

export function merge3(base: J, local: J, server: J): J {
  if (deepEqual(local, server)) return local;
  if (base !== undefined && deepEqual(local, base)) return server;
  if (base !== undefined && deepEqual(server, base)) return local;
  if (isPlain(local) && isPlain(server)) {
    const b = isPlain(base) ? base : {};
    const out: Record<string, J> = {};
    for (const k of new Set([...Object.keys(local), ...Object.keys(server)])) {
      const v = merge3(b[k], local[k], server[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  if (Array.isArray(local) && Array.isArray(server)) return mergeArrays(Array.isArray(base) ? base : undefined, local, server);
  return local;
}

/** Junção completa do jogo: 3 vias quando há base; senão, por partes. */
export function mergeWithBase(base: GameData | null, local: GameData, server: GameData, dirty: Iterable<SectionKey>): GameData {
  if (!base) return mergeGame(local, server, dirty);
  const out = { ...(merge3(base, local, server) as GameData) };
  out.stamps = { ...out.stamps };
  out.progress = mergeProgress(local.progress, server.progress);
  for (const k of SECTION_KEYS) out.stamps[k] = Math.max(local.stamps[k] ?? 0, server.stamps[k] ?? 0);
  return out;
}
