// Modelo de dados do jogo. Tudo isto é salvo na nuvem (coluna "data" do
// projeto) e também no aparelho, para funcionar sem internet.

export type Turma = '3A' | '3B' | '3C';
export const TURMAS: { id: Turma; label: string }[] = [
  { id: '3A', label: '3º ano A' },
  { id: '3B', label: '3º ano B' },
  { id: '3C', label: '3º ano C' },
];

// ----------------------------------------------------------- Monstrinho
export type SlotKey = 'body' | 'head' | 'eyes' | 'mouth' | 'ears' | 'horns' | 'antennae' | 'spikes' | 'arms' | 'legs' | 'tail' | 'wings';

export interface PartSel {
  id: string;
  color: string | null; // null = usa a cor da pele (ou a cor padrão da peça)
  scale: number; // 0.6 .. 1.5
  dx: number; // para peças em par: afastamento; para peças únicas: deslocamento horizontal
  dy: number;
  flip: boolean;
  rot: number; // graus
}

export interface AccSel {
  id: string;
  color: string | null;
  scale: number;
  dx: number;
  dy: number;
}

export interface MonsterState {
  born: boolean;
  name: string;
  skin: string;
  belly: string | null;
  texture: string;
  textureColor: string;
  cheeks: boolean;
  parts: Record<SlotKey, PartSel | null>;
  accessories: AccSel[];
  /** Peças diferentes já experimentadas (para conquistas). */
  tried: string[];
}

// ----------------------------------------------------------- Rosto / expressões
export type BrowId = 'nenhuma' | 'normal' | 'triste' | 'brava' | 'surpresa' | 'curiosa' | 'preocupada';
export type EyeMod = 'normal' | 'fechados' | 'sonolentos' | 'coracoes' | 'estrelas' | 'piscando' | 'arregalados' | 'espirais';
export type MouthMod = 'normal' | 'triste' | 'reto' | 'aberto';
export type FaceExtra = 'nenhum' | 'lagrima' | 'gota' | 'zzz' | 'coracoes' | 'exclamacao' | 'interrogacao' | 'brilhos' | 'notas';

export interface FaceSpec {
  brows: BrowId;
  eyes: EyeMod;
  mouth: string | null; // id de outra boca, ou null = a boca do monstrinho
  mouthMod: MouthMod;
  blush: boolean;
  extra: FaceExtra;
  lookX: number; // -1..1
  lookY: number;
}

export interface CustomExpression {
  id: string;
  name: string;
  face: FaceSpec;
}

// ----------------------------------------------------------- Animações
export type AnimId = 'parado' | 'andar' | 'correr' | 'pular' | 'dancar' | 'comemorar' | 'dormir' | 'susto' | 'rir';
export interface AnimSetting {
  speed: number; // 0.6 .. 1.8
  size: number; // 0.5 .. 1.6
}
export type DanceMove = 'balanco' | 'pulinho' | 'giro' | 'bracos' | 'remexe' | 'agachadinho' | 'estrela' | 'cabeca';

export interface LifeState {
  favoriteAnim: AnimId | null;
  tried: AnimId[];
  settings: Partial<Record<AnimId, AnimSetting>>;
  expressions: CustomExpression[];
  favoriteExpression: string | null; // id de expressão pronta ou personalizada
  dance: { moves: (DanceMove | null)[]; music: string; tempo: number; played: number };
}

// ----------------------------------------------------------- Sons
export interface SoundClip {
  sound: string; // id do som ("rec:<id>" para gravações)
  pitch: number; // -1 .. 1
}
export interface SoundTrack {
  lanes: (SoundClip | null)[][]; // 3 linhas × 8 passos
  volumes: number[]; // 0..1 por linha
  tempo: number; // batidas por minuto
}
export interface Recording {
  id: string;
  label: string;
  path: string | null; // caminho no Storage do Supabase (quando enviado)
  duration: number;
  createdAt: number;
  mime: string;
}
export type SignatureSound = { kind: 'sound'; id: string; pitch: number } | { kind: 'track' } | { kind: 'recording'; id: string };

export interface SoundState {
  favorites: string[];
  triedSounds: string[];
  track: SoundTrack;
  trackPlays: number;
  signature: SignatureSound | null;
  recordings: Recording[];
  presentation: { done: boolean; mode: 'voz' | 'sons' | null; text: string; recordingId: string | null; sounds: string[] };
  masterVolume: number;
}

// ----------------------------------------------------------- Identidade
export interface IdentityState {
  traits: string[];
  food: string | null;
  foodsTried: string[];
  foodReactions: Record<string, 'amei' | 'eca'>;
  power: string | null;
  powersTried: string[];
  likes: string[];
  dislikes: string[];
  fears: string[];
  habits: string[];
  place: string | null;
  passport: { nickname: string; age: number; motto: string; color: string; stamped: boolean; sticker: string };
}

// ----------------------------------------------------------- Habitat
export interface SceneObj {
  uid: string;
  type: string;
  x: number; // 0..1000
  y: number; // 0..600 (base do objeto)
  s: number; // escala
  r: number; // rotação (graus)
  flip: boolean;
  z: number; // camada
  color?: string | null;
}
export interface HabitatState {
  biome: string | null;
  sky: string;
  weather: string;
  light: string;
  objects: SceneObj[];
  explored: { interactions: number; touched: string[]; visits: number };
  placedTotal: number;
}

// ----------------------------------------------------------- Aventuras
export interface AdventureState {
  forest: { found: string[]; keep: string | null; done: boolean; surprises: string[] };
  friend: { talked: string[]; solution: string | null; solutionsTried: string[]; card: { text: string; sticker: string; color: string } | null; done: boolean };
  bridge: { pieces: (string | null)[]; solutions: string[]; tests: number; done: boolean };
  storm: { objects: SceneObj[]; monster: { x: number; y: number }; survived: boolean; savedToHabitat: boolean; done: boolean };
  party: { guests: string[]; decorations: SceneObj[]; music: string | null; guestAnims: Record<string, DanceMove>; effects: string[]; done: boolean; shows: number };
}

// ----------------------------------------------------------- Histórias
export type SceneRef =
  | { kind: 'habitat' }
  | { kind: 'biome'; id: string }
  | { kind: 'aventura'; id: string }
  | { kind: 'cor'; id: string };

export interface StoryChar {
  uid: string;
  who: string; // 'eu' ou id de outro monstrinho
  x: number; // 0..1000
  y: number; // 0..600 (pés)
  s: number;
  flip: boolean;
  face: string; // id de expressão
  anim: AnimId;
}
export interface Balloon {
  uid: string;
  kind: 'fala' | 'pensamento' | 'grito' | 'legenda';
  text: string;
  x: number;
  y: number;
  tail: 'esquerda' | 'direita' | 'nenhuma';
}
export interface Frame {
  uid: string;
  scene: SceneRef;
  chars: StoryChar[];
  balloons: Balloon[];
  caption: string;
  sound: string | null;
  narration: string | null; // id de gravação
  duration: number; // segundos
  transition: 'aparecer' | 'deslizar' | 'zoom' | 'virar';
}
export interface Story {
  id: string;
  title: string;
  frames: Frame[];
  published: boolean;
  publishedAt: number | null;
  views: number;
}
export interface StoryState {
  stories: Story[];
  currentId: string | null;
  cast: string[];
  mainScene: SceneRef | null;
}

// ----------------------------------------------------------- Progresso
export interface ProgressState {
  done: number[];
  stars: Record<string, number>;
  achievements: string[];
  seenIntro: number[];
  lastMission: number;
}

// ----------------------------------------------------------- Projeto
export const SECTION_KEYS = ['monster', 'life', 'sounds', 'identity', 'habitat', 'adventures', 'stories', 'progress'] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export interface GameData {
  v: 1;
  monster: MonsterState;
  life: LifeState;
  sounds: SoundState;
  identity: IdentityState;
  habitat: HabitatState;
  adventures: AdventureState;
  stories: StoryState;
  progress: ProgressState;
  /** Quando cada parte foi alterada pela última vez (para juntar versões). */
  stamps: Record<SectionKey, number>;
}

export interface ProjectInfo {
  id: string;
  turma: Turma;
  student1: string;
  student2: string;
  created_at: string;
  last_access_at: string;
  updated_at: string;
  version: number;
  epoch: number;
  current_stage: number;
  current_mission: number;
  missions_done: number[];
  progress: number;
  stars: number;
  completed_at: string | null;
}
