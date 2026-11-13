import type { ReactNode } from 'react';
import { INK } from '../colors';

// Bocas em coordenadas locais: (0,0) = centro da boca.
// "c" é a cor da língua/lábios (escolhida pela dupla).
const IN = '#6b1d3c'; // fundo da boca
const W = '#ffffff';
const s = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const s3 = { ...s, strokeWidth: 3 };

export interface MouthDef {
  id: string;
  name: string;
  draw: (c: string) => ReactNode;
  defaultColor?: string;
}

export const MOUTHS: MouthDef[] = [
  { id: 'sorriso', name: 'Sorriso', draw: () => <path d="M-30,-6 Q0,26 30,-6" fill="none" {...s} /> },
  {
    id: 'sorrisao', name: 'Sorrisão', draw: (c) => (
      <g>
        <path d="M-38,-10 Q0,-4 38,-10 Q34,34 0,36 Q-34,34 -38,-10Z" fill={IN} {...s} />
        <path d="M-18,24 Q0,12 18,24 Q10,34 0,34 Q-10,34 -18,24Z" fill={c} />
        <path d="M-34,-8 Q0,-3 34,-8 L32,2 Q0,6 -32,2Z" fill={W} />
      </g>
    ),
  },
  {
    id: 'dentucinho', name: 'Dentucinho', draw: () => (
      <g>
        <path d="M-30,-6 Q0,20 30,-6" fill="none" {...s} />
        <path d="M-12,4 h11 v14 q0,4 -4,4 h-3 q-4,0 -4,-4Z M1,4 h11 v14 q0,4 -4,4 h-3 q-4,0 -4,-4Z" fill={W} {...s3} />
      </g>
    ),
  },
  {
    id: 'presas', name: 'Presinhas', draw: () => (
      <g>
        <path d="M-32,-8 Q0,22 32,-8" fill="none" {...s} />
        <path d="M-22,0 l6,16 l6,-12Z M22,0 l-6,16 l-6,-12Z" fill={W} {...s3} />
      </g>
    ),
  },
  {
    id: 'oh', name: 'Ohhh!', draw: (c) => (
      <g>
        <ellipse cx={0} cy={4} rx={16} ry={20} fill={IN} {...s} />
        <ellipse cx={0} cy={14} rx={9} ry={6} fill={c} />
      </g>
    ),
  },
  { id: 'gatinho', name: 'Gatinho', draw: () => <path d="M-26,-2 Q-13,14 0,0 Q13,14 26,-2" fill="none" {...s} /> },
  {
    id: 'zigue', name: 'Zigue-zague', draw: () => (
      <g>
        <path d="M-40,-10 Q0,0 40,-10 Q30,30 0,30 Q-30,30 -40,-10Z" fill={IN} {...s} />
        <path d="M-36,-7 L-27,6 L-18,-4 L-9,8 L0,-3 L9,8 L18,-4 L27,6 L36,-7 Q0,1 -36,-7Z" fill={W} {...s3} />
        <path d="M-26,26 L-18,16 L-9,26 L0,15 L9,26 L18,16 L26,26 Q0,32 -26,26Z" fill={W} {...s3} />
      </g>
    ),
  },
  { id: 'torto', name: 'Sorriso torto', draw: () => <path d="M-30,6 Q-5,10 14,0 Q26,-6 32,-14" fill="none" {...s} /> },
  {
    id: 'lingua', name: 'Língua de fora', draw: (c) => (
      <g>
        <path d="M-12,4 Q-14,32 0,34 Q14,32 12,4Z" fill={c} {...s} />
        <path d="M0,10 V24" stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
        <path d="M-32,-6 Q0,16 32,-6" fill="none" {...s} />
      </g>
    ),
    defaultColor: '#ff7a9a',
  },
  {
    id: 'bico', name: 'Biquinho', draw: (c) => (
      <g>
        <path d="M-28,0 Q0,-14 28,0 Q0,10 -28,0Z" fill={c} {...s} />
        <path d="M-24,4 Q0,26 24,4 Q0,10 -24,4Z" fill={c} {...s} />
      </g>
    ),
    defaultColor: '#ffb43c',
  },
  {
    id: 'sapo', name: 'Bocão de sapo', draw: (c) => (
      <g>
        <path d="M-56,-8 Q0,6 56,-8 Q40,30 0,30 Q-40,30 -56,-8Z" fill={IN} {...s} />
        <path d="M-26,24 Q0,10 26,24 Q12,30 0,30 Q-12,30 -26,24Z" fill={c} />
      </g>
    ),
  },
  {
    id: 'bigode', name: 'Bigodudo', draw: () => (
      <g>
        <path d="M-22,10 Q0,26 22,10" fill="none" {...s} />
        <path d="M0,-4 C-10,-14 -30,-14 -44,0 C-30,-2 -18,4 0,4 C18,4 30,-2 44,0 C30,-14 10,-14 0,-4Z" fill="#5a3a2a" {...s3} />
      </g>
    ),
  },
  {
    id: 'janelinha', name: 'Janelinha', draw: (c) => (
      <g>
        <path d="M-34,-8 Q0,-2 34,-8 Q28,28 0,28 Q-28,28 -34,-8Z" fill={IN} {...s} />
        <path d="M-26,-6 h18 v12 q0,3 -3,3 h-12 q-3,0 -3,-3Z M8,-6 h18 v12 q0,3 -3,3 h-12 q-3,0 -3,-3Z" fill={W} {...s3} />
        <path d="M-14,22 Q0,14 14,22 Q0,28 -14,22Z" fill={c} />
      </g>
    ),
  },
  {
    id: 'monstro', name: 'Dentes de monstro', draw: () => (
      <g>
        <path d="M-44,-10 Q0,4 44,-10 Q36,32 0,32 Q-36,32 -44,-10Z" fill={IN} {...s} />
        <path d="M-40,-8 L-32,10 L-24,-4 L-16,14 L-8,-2 L0,16 L8,-2 L16,14 L24,-4 L32,10 L40,-8 Q0,4 -40,-8Z" fill={W} {...s3} />
      </g>
    ),
  },
  { id: 'timido', name: 'Tímido', draw: () => <path d="M-12,0 Q0,9 12,0" fill="none" {...s} /> },
  {
    id: 'risada', name: 'Risadão', draw: (c) => (
      <g>
        <path d="M-40,-12 H40 Q40,34 0,34 Q-40,34 -40,-12Z" fill={IN} {...s} />
        <path d="M-36,-10 H36 V-2 H-36Z" fill={W} />
        <path d="M-20,26 Q0,10 20,26 Q10,34 0,34 Q-10,34 -20,26Z" fill={c} />
      </g>
    ),
  },
  {
    id: 'vampiro', name: 'Vampirinho', draw: () => (
      <g>
        <path d="M-30,-4 Q0,12 30,-4" fill="none" {...s} />
        <path d="M-16,3 l4,14 l5,-11Z M16,3 l-4,14 l-5,-11Z" fill={W} {...s3} />
      </g>
    ),
  },
  {
    id: 'beijinho', name: 'Beijinho', draw: (c) => (
      <g>
        <path d="M0,-4 C-6,-14 -22,-10 -18,0 C-22,10 -6,14 0,4 C6,14 22,10 18,0 C22,-10 6,-14 0,-4Z" fill={c} {...s} />
      </g>
    ),
    defaultColor: '#ff5c7a',
  },
  {
    id: 'assobio', name: 'Assobio', draw: () => (
      <g>
        <circle cx={6} cy={2} r={8} fill={IN} {...s} />
        <path d="M22,-10 q6,-4 10,0 M26,-20 q6,-4 10,0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'megaboca', name: 'Megaboca', draw: (c) => (
      <g>
        <path d="M-60,-14 Q0,0 60,-14 Q50,46 0,46 Q-50,46 -60,-14Z" fill={IN} {...s} />
        <path d="M-56,-12 L-46,4 L-36,-6 L-26,8 L-16,-4 L-6,10 L4,-4 L14,8 L24,-4 L34,6 L44,-6 L54,2 L56,-12 Q0,0 -56,-12Z" fill={W} {...s3} />
        <path d="M-28,38 Q0,18 28,38 Q14,46 0,46 Q-14,46 -28,38Z" fill={c} />
      </g>
    ),
  },
];

/** Boca de surpresa usada pela expressão "surpreso". */
export const MOUTH_SURPRISE = MOUTHS.find((m) => m.id === 'oh')!;
export const MOUTH_LAUGH = MOUTHS.find((m) => m.id === 'risada')!;
export const MOUTH_TONGUE = MOUTHS.find((m) => m.id === 'lingua')!;
export const MOUTH_SMALL = MOUTHS.find((m) => m.id === 'timido')!;
