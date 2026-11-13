import type { GameData } from './types';
import { MISSIONS, STAGES, missionsOfStage, isLiving } from './missions';

export const TOTAL_MISSIONS = MISSIONS.length;

export function isDone(g: GameData, id: number) {
  return g.progress.done.includes(id);
}

/** A missão está liberada? (as missões abrem uma de cada vez, em ordem) */
export function isUnlocked(g: GameData, id: number) {
  if (id <= 1) return true;
  for (let i = 1; i < id; i++) if (!isDone(g, i)) return false;
  return true;
}

export function nextMission(g: GameData) {
  return MISSIONS.find((m) => !isDone(g, m.id)) ?? null;
}

export function stageDone(g: GameData, stage: number) {
  return missionsOfStage(stage).every((m) => isDone(g, m.id));
}

export function stageUnlocked(g: GameData, stage: number) {
  return stage === 1 || stageDone(g, stage - 1);
}

export function currentStage(g: GameData) {
  const n = nextMission(g);
  return n ? n.stage : STAGES.length;
}

export function progressPct(g: GameData) {
  return Math.round((g.progress.done.length / TOTAL_MISSIONS) * 100);
}

export function totalStars(g: GameData) {
  return Object.values(g.progress.stars).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function missionStars(g: GameData, id: number) {
  const m = MISSIONS.find((x) => x.id === id);
  if (!m) return 0;
  return 1 + Math.max(0, Math.min(2, m.bonus(g)));
}

export function medals(g: GameData) {
  return STAGES.filter((s) => stageDone(g, s.id)).map((s) => s.id);
}

// ---------------------------------------------------------------- Troféus
export interface TrophyDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  test: (g: GameData) => boolean;
}

export const TROPHIES: TrophyDef[] = [
  { id: 'nasceu', name: 'Nasceu!', desc: 'Seu monstrinho nasceu.', icon: '🥚', test: (g) => g.monster.born },
  { id: 'inventor', name: 'Inventores', desc: 'Experimentaram 25 peças diferentes.', icon: '🧩', test: (g) => g.monster.tried.filter((t) => !t.startsWith('color:') && !t.startsWith('tool:')).length >= 25 },
  { id: 'colorista', name: 'Coloristas', desc: 'Usaram 6 cores diferentes.', icon: '🎨', test: (g) => g.monster.tried.filter((t) => t.startsWith('color:')).length >= 6 },
  { id: 'estilista', name: 'Estilistas', desc: 'Usaram 3 acessórios juntos.', icon: '🎩', test: (g) => g.monster.accessories.length >= 3 },
  { id: 'danca', name: 'Astros da dança', desc: 'Coreografia com 8 passos.', icon: '🪩', test: (g) => g.life.dance.moves.every(Boolean) && g.life.dance.played > 0 },
  { id: 'maestro', name: 'Maestros', desc: '12 sons na linha do tempo.', icon: '🎼', test: (g) => g.sounds.track.lanes.flat().filter(Boolean).length >= 12 },
  { id: 'voz', name: 'Voz de ouro', desc: 'Gravaram a própria voz.', icon: '🎙️', test: (g) => g.sounds.recordings.length >= 1 },
  { id: 'coracao', name: 'Coração completo', desc: 'Preencheram toda a personalidade.', icon: '💗', test: (g) => g.identity.traits.length > 0 && !!g.identity.food && !!g.identity.power && g.identity.likes.length > 0 && g.identity.fears.length > 0 && g.identity.habits.length > 0 && !!g.identity.place },
  { id: 'arquiteto', name: 'Arquitetos', desc: '15 elementos no habitat.', icon: '🏗️', test: (g) => g.habitat.objects.length >= 15 },
  { id: 'natureza', name: 'Amigos da natureza', desc: '5 bichinhos no habitat.', icon: '🐸', test: (g) => g.habitat.objects.filter((o) => isLiving(o.type)).length >= 5 },
  { id: 'explorador', name: 'Exploradores', desc: 'Tocaram em 10 coisas do mundo.', icon: '🧭', test: (g) => g.habitat.explored.interactions >= 10 },
  { id: 'tesouros', name: 'Caçadores de tesouros', desc: 'Acharam todos os tesouros.', icon: '💎', test: (g) => g.adventures.forest.found.length >= 6 },
  { id: 'amigo', name: 'Grandes amigos', desc: 'Testaram 2 jeitos de ajudar.', icon: '🤗', test: (g) => g.adventures.friend.solutionsTried.length >= 2 },
  { id: 'engenheiro', name: 'Engenheiros', desc: '3 soluções para a ponte.', icon: '🌉', test: (g) => g.adventures.bridge.solutions.length >= 3 },
  { id: 'abrigo', name: 'Abrigo seguro', desc: 'Protegeram o monstrinho da tempestade.', icon: '☂️', test: (g) => g.adventures.storm.survived },
  { id: 'festa', name: 'Festeiros', desc: 'Festa com 4 convidados.', icon: '🎈', test: (g) => g.adventures.party.done && g.adventures.party.guests.length >= 4 },
  { id: 'escritor', name: 'Escritores', desc: 'Publicaram uma história.', icon: '📚', test: (g) => g.stories.stories.some((s) => s.published) },
  { id: 'cineasta', name: 'Cineastas', desc: 'História com 6 quadros.', icon: '🎬', test: (g) => g.stories.stories.some((s) => s.frames.length >= 6) },
  { id: 'mestre', name: 'Mestres Monstrinhos', desc: 'Completaram as 30 missões!', icon: '👑', test: (g) => g.progress.done.length >= 30 },
];

/** Troféus novos (ainda não registrados) que já foram conquistados. */
export function newTrophies(g: GameData) {
  return TROPHIES.filter((t) => !g.progress.achievements.includes(t.id) && t.test(g));
}
