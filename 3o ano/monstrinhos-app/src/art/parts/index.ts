import type { SlotKey } from '../../game/types';
import { HEADS } from './heads';
import { BODIES } from './bodies';
import { EYE_SETS } from './eyes';
import { MOUTHS } from './mouths';
import { EARS, HORNS, ANTENNAE, SPIKES } from './head-extras';
import { ARMS, LEGS, TAILS } from './limbs';
import { WINGS, ACCESSORIES, TEXTURES } from './extras';

export { HEADS, BODIES, EYE_SETS, MOUTHS, EARS, HORNS, ANTENNAE, SPIKES, ARMS, LEGS, TAILS, WINGS, ACCESSORIES, TEXTURES };

export interface SlotInfo {
  key: SlotKey;
  name: string;
  /** Pode ficar sem esta peça? */
  optional: boolean;
  /** Peça em par (esquerda e direita)? */
  paired: boolean;
  items: { id: string; name: string; single?: boolean; defaultColor?: string }[];
  /** Usa a cor da pele quando nenhuma cor é escolhida. */
  skinByDefault: boolean;
  defaultColor: string;
}

export const SLOTS: Record<SlotKey, SlotInfo> = {
  head: { key: 'head', name: 'Cabeça', optional: false, paired: false, items: HEADS, skinByDefault: true, defaultColor: '#7cc9ff' },
  body: { key: 'body', name: 'Corpo', optional: false, paired: false, items: BODIES, skinByDefault: true, defaultColor: '#7cc9ff' },
  eyes: { key: 'eyes', name: 'Olhos', optional: false, paired: false, items: EYE_SETS, skinByDefault: false, defaultColor: '#3d8bff' },
  mouth: { key: 'mouth', name: 'Boca', optional: false, paired: false, items: MOUTHS, skinByDefault: false, defaultColor: '#ff7a9a' },
  ears: { key: 'ears', name: 'Orelhas', optional: true, paired: true, items: EARS, skinByDefault: true, defaultColor: '#7cc9ff' },
  horns: { key: 'horns', name: 'Chifres', optional: true, paired: true, items: HORNS, skinByDefault: false, defaultColor: '#fff1d0' },
  antennae: { key: 'antennae', name: 'Antenas', optional: true, paired: true, items: ANTENNAE, skinByDefault: true, defaultColor: '#7cc9ff' },
  spikes: { key: 'spikes', name: 'Espinhos', optional: true, paired: false, items: SPIKES, skinByDefault: false, defaultColor: '#ffd23f' },
  arms: { key: 'arms', name: 'Braços', optional: true, paired: true, items: ARMS, skinByDefault: true, defaultColor: '#7cc9ff' },
  legs: { key: 'legs', name: 'Pernas', optional: true, paired: true, items: LEGS, skinByDefault: true, defaultColor: '#7cc9ff' },
  tail: { key: 'tail', name: 'Cauda', optional: true, paired: false, items: TAILS, skinByDefault: true, defaultColor: '#7cc9ff' },
  wings: { key: 'wings', name: 'Asas', optional: true, paired: true, items: WINGS, skinByDefault: true, defaultColor: '#ffffff' },
};

export const SLOT_ORDER: SlotKey[] = ['head', 'eyes', 'mouth', 'body', 'arms', 'legs', 'ears', 'horns', 'antennae', 'spikes', 'tail', 'wings'];

export function findItem(slot: SlotKey, id: string) {
  return SLOTS[slot].items.find((i) => i.id === id);
}
