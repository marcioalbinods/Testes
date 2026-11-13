import type {
  AdventureState, GameData, HabitatState, IdentityState, LifeState, MonsterState, PartSel,
  ProgressState, SectionKey, SoundState, StoryState,
} from './types';
import { SECTION_KEYS } from './types';

export const part = (id: string, extra: Partial<PartSel> = {}): PartSel => ({ id, color: null, scale: 1, dx: 0, dy: 0, flip: false, rot: 0, ...extra });

export function newMonster(): MonsterState {
  return {
    born: false,
    name: '',
    skin: '#7cc9ff',
    belly: '#e8f7ff',
    texture: 'liso',
    textureColor: '#3d8bff',
    cheeks: true,
    parts: {
      head: part('redonda'),
      body: part('redondo'),
      eyes: part('grandes'),
      mouth: part('sorriso'),
      ears: null,
      horns: null,
      antennae: null,
      spikes: null,
      arms: part('fininho'),
      legs: part('redondinho'),
      tail: null,
      wings: null,
    },
    accessories: [],
    tried: [],
  };
}

export function emptyTrack() {
  return { lanes: [0, 1, 2].map(() => Array.from({ length: 8 }, () => null)), volumes: [0.9, 0.9, 0.9], tempo: 110 };
}

export function newGame(): GameData {
  const life: LifeState = { favoriteAnim: null, tried: [], settings: {}, expressions: [], favoriteExpression: null, dance: { moves: Array.from({ length: 8 }, () => null), music: 'festa', tempo: 1, played: 0 } };
  const sounds: SoundState = {
    favorites: [], triedSounds: [], track: emptyTrack(), trackPlays: 0, signature: null, recordings: [],
    presentation: { done: false, mode: null, text: '', recordingId: null, sounds: [] }, masterVolume: 0.8,
  };
  const identity: IdentityState = {
    traits: [], food: null, foodsTried: [], foodReactions: {}, power: null, powersTried: [], likes: [], dislikes: [], fears: [], habits: [], place: null,
    passport: { nickname: '', age: 7, motto: '', color: '#7340d9', stamped: false, sticker: 'estrela' },
  };
  const habitat: HabitatState = { biome: null, sky: 'dia', weather: 'sol', light: 'nenhuma', objects: [], explored: { interactions: 0, touched: [], visits: 0 }, placedTotal: 0 };
  const adventures: AdventureState = {
    forest: { found: [], keep: null, done: false, surprises: [] },
    friend: { talked: [], solution: null, solutionsTried: [], card: null, done: false },
    bridge: { pieces: [null, null, null, null], solutions: [], tests: 0, done: false },
    storm: { objects: [], monster: { x: 500, y: 500 }, survived: false, savedToHabitat: false, done: false },
    party: { guests: [], decorations: [], music: null, guestAnims: {}, effects: [], done: false, shows: 0 },
  };
  const stories: StoryState = { stories: [], currentId: null, cast: [], mainScene: null };
  const progress: ProgressState = { done: [], stars: {}, achievements: [], seenIntro: [], lastMission: 1 };
  const stamps = Object.fromEntries(SECTION_KEYS.map((k) => [k, 0])) as Record<SectionKey, number>;
  return { v: 1, monster: newMonster(), life, sounds, identity, habitat, adventures, stories, progress, stamps };
}

function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

/** Junta profundamente "base" com "value", mantendo a forma da base (dados antigos ou incompletos). */
function fill<T>(base: T, value: unknown): T {
  if (value === undefined) return base;
  if (base === null) return value as T;
  if (Array.isArray(base)) return (Array.isArray(value) ? value : base) as T;
  if (isObj(base)) {
    if (!isObj(value)) return base;
    const out: Record<string, unknown> = { ...value };
    for (const k of Object.keys(base)) out[k] = fill((base as Record<string, unknown>)[k], value[k]);
    return out as T;
  }
  if (typeof base === typeof value) return value as T;
  return base;
}

/** Garante que os dados vindos do servidor/aparelho tenham todos os campos. */
export function normalizeGame(raw: unknown): GameData {
  const base = newGame();
  if (!isObj(raw) || Object.keys(raw).length === 0) return base;
  const g = fill(base, raw);
  // campos que podem ser nulos (peças opcionais)
  const rawParts = isObj(raw.monster) && isObj((raw.monster as Record<string, unknown>).parts) ? ((raw.monster as Record<string, unknown>).parts as Record<string, unknown>) : {};
  for (const k of Object.keys(base.monster.parts) as (keyof MonsterState['parts'])[]) {
    const v = rawParts[k];
    if (v === null) g.monster.parts[k] = k === 'head' || k === 'body' || k === 'eyes' || k === 'mouth' ? base.monster.parts[k] : null;
    else if (isObj(v) && typeof v.id === 'string') g.monster.parts[k] = { ...part(v.id), ...(v as Partial<PartSel>) };
  }
  if (!Array.isArray(g.life.dance.moves) || g.life.dance.moves.length !== 8) g.life.dance.moves = base.life.dance.moves;
  if (!Array.isArray(g.sounds.track.lanes) || g.sounds.track.lanes.length !== 3) g.sounds.track = emptyTrack();
  if (!Array.isArray(g.adventures.bridge.pieces) || g.adventures.bridge.pieces.length !== 4) g.adventures.bridge.pieces = [null, null, null, null];
  g.progress.done = Array.from(new Set(g.progress.done.filter((n) => Number.isInteger(n) && n >= 1 && n <= 30))).sort((a, b) => a - b);
  return g;
}
