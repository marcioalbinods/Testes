import type { AnimId, FaceSpec } from '../game/types';

export const NEUTRAL_FACE: FaceSpec = { brows: 'nenhuma', eyes: 'normal', mouth: null, mouthMod: 'normal', blush: false, extra: 'nenhum', lookX: 0, lookY: 0 };

export interface FacePreset {
  id: string;
  name: string;
  icon: string;
  face: FaceSpec;
}

const f = (p: Partial<FaceSpec>): FaceSpec => ({ ...NEUTRAL_FACE, ...p });

export const FACE_PRESETS: FacePreset[] = [
  { id: 'normal', name: 'Do meu jeito', icon: '🙂', face: f({}) },
  { id: 'feliz', name: 'Feliz', icon: '😊', face: f({ brows: 'normal', blush: true }) },
  { id: 'rindo', name: 'Rindo', icon: '😆', face: f({ eyes: 'fechados', mouth: 'risada', blush: true, extra: 'notas' }) },
  { id: 'triste', name: 'Triste', icon: '😢', face: f({ brows: 'triste', mouthMod: 'triste', extra: 'lagrima', lookY: 0.6 }) },
  { id: 'surpreso', name: 'Surpreso', icon: '😮', face: f({ brows: 'surpresa', eyes: 'arregalados', mouth: 'oh', extra: 'exclamacao' }) },
  { id: 'bravo', name: 'Bravo', icon: '😠', face: f({ brows: 'brava', mouthMod: 'reto' }) },
  { id: 'sonolento', name: 'Com sono', icon: '😴', face: f({ eyes: 'sonolentos', mouth: 'timido', extra: 'zzz' }) },
  { id: 'apaixonado', name: 'Apaixonado', icon: '😍', face: f({ eyes: 'coracoes', blush: true, extra: 'coracoes' }) },
  { id: 'bobo', name: 'Bobinho', icon: '😜', face: f({ eyes: 'piscando', mouth: 'lingua', blush: true }) },
  { id: 'assustado', name: 'Assustado', icon: '😱', face: f({ brows: 'preocupada', eyes: 'arregalados', mouth: 'oh', extra: 'gota' }) },
  { id: 'curioso', name: 'Curioso', icon: '🤔', face: f({ brows: 'curiosa', extra: 'interrogacao', lookX: 0.7, lookY: -0.4 }) },
  { id: 'encantado', name: 'Encantado', icon: '🤩', face: f({ eyes: 'estrelas', brows: 'surpresa', blush: true, extra: 'brilhos' }) },
  { id: 'tonto', name: 'Tontinho', icon: '😵', face: f({ eyes: 'espirais', mouthMod: 'aberto', extra: 'brilhos' }) },
];

export const ANIM_DEFAULT_FACE: Partial<Record<AnimId, string>> = {
  dormir: 'sonolento',
  susto: 'assustado',
  rir: 'rindo',
  comemorar: 'encantado',
  dancar: 'feliz',
  correr: 'feliz',
};
