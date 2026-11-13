import type { ReactNode } from 'react';
import { INK, shade } from '../colors';
import { SW } from './common';

export type EyeKind =
  | 'round' | 'dot' | 'sparkle' | 'sleepy' | 'cat' | 'spiral' | 'star' | 'heart' | 'googly'
  | 'arc' | 'angry' | 'square' | 'lash' | 'alien' | 'oval' | 'bug';

export interface EyeSpot {
  x: number;
  y: number;
  r: number;
  kind: EyeKind;
}
export interface EyeSetDef {
  id: string;
  name: string;
  eyes: EyeSpot[];
}

const pair = (dx: number, y: number, r: number, kind: EyeKind): EyeSpot[] => [
  { x: -dx, y, r, kind },
  { x: dx, y, r, kind },
];

export const EYE_SETS: EyeSetDef[] = [
  { id: 'grandes', name: 'Grandões', eyes: pair(38, 0, 26, 'round') },
  { id: 'bolinhas', name: 'Bolinhas', eyes: pair(34, 4, 11, 'dot') },
  { id: 'ciclope', name: 'Ciclope', eyes: [{ x: 0, y: -2, r: 40, kind: 'round' }] },
  { id: 'tres', name: 'Três olhos', eyes: [{ x: -46, y: 6, r: 19, kind: 'round' }, { x: 0, y: -12, r: 19, kind: 'round' }, { x: 46, y: 6, r: 19, kind: 'round' }] },
  { id: 'brilhantes', name: 'Brilhantes', eyes: pair(38, 0, 28, 'sparkle') },
  { id: 'sonolentos', name: 'Sonolentos', eyes: pair(36, 2, 24, 'sleepy') },
  { id: 'gato', name: 'De gato', eyes: pair(38, 0, 25, 'cat') },
  { id: 'espiral', name: 'Hipnóticos', eyes: pair(37, 0, 24, 'spiral') },
  { id: 'estrela', name: 'Estrelados', eyes: pair(38, 0, 26, 'star') },
  { id: 'coracao', name: 'Apaixonados', eyes: pair(38, 0, 26, 'heart') },
  { id: 'malucos', name: 'Malucos', eyes: [{ x: -40, y: -2, r: 29, kind: 'googly' }, { x: 40, y: 4, r: 20, kind: 'googly' }] },
  { id: 'felizes', name: 'Sorridentes', eyes: pair(36, 2, 20, 'arc') },
  { id: 'bravos', name: 'Bravinhos', eyes: pair(38, 2, 24, 'angry') },
  { id: 'quatro', name: 'Quatro olhos', eyes: [{ x: -54, y: 8, r: 14, kind: 'round' }, { x: -20, y: -8, r: 15, kind: 'round' }, { x: 20, y: -8, r: 15, kind: 'round' }, { x: 54, y: 8, r: 14, kind: 'round' }] },
  { id: 'robo', name: 'Robô', eyes: pair(38, 0, 22, 'square') },
  { id: 'cilios', name: 'Com cílios', eyes: pair(37, 2, 23, 'lash') },
  { id: 'alien', name: 'Alienígena', eyes: pair(40, 0, 30, 'alien') },
  { id: 'ovais', name: 'Ovais', eyes: pair(32, 0, 22, 'oval') },
  { id: 'piscadinha', name: 'Piscadinha', eyes: [{ x: -38, y: 0, r: 26, kind: 'round' }, { x: 38, y: 2, r: 20, kind: 'arc' }] },
  { id: 'inseto', name: 'De inseto', eyes: pair(42, 0, 30, 'bug') },
];

function starPath(cx: number, cy: number, r: number) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
}
function heartPath(cx: number, cy: number, s: number) {
  return `M${cx},${cy + s * 0.9} C${cx - s * 1.4},${cy} ${cx - s * 0.9},${cy - s * 1.1} ${cx},${cy - s * 0.35} C${cx + s * 0.9},${cy - s * 1.1} ${cx + s * 1.4},${cy} ${cx},${cy + s * 0.9}Z`;
}

/** Pálpebra: segmento do círculo acima da corda entre os ângulos a1 e a2 (graus). */
export function lidPath(x: number, y: number, r: number, a1: number, a2: number) {
  const p = (a: number) => [x + r * Math.cos((a * Math.PI) / 180), y + r * Math.sin((a * Math.PI) / 180)].map((v) => v.toFixed(1)).join(',');
  return `M${p(a1)} A${r},${r} 0 0,1 ${p(a2)} Z`;
}

/** Desenha um olho. "iris" é a cor escolhida; lx/ly deslocam a pupila (olhar). */
export function Eye({ e, iris, skin, lx = 0, ly = 0, side }: { e: EyeSpot; iris: string; skin: string; lx?: number; ly?: number; side: number }): ReactNode {
  const { x, y, r } = e;
  const px = x + lx * r * 0.28;
  const py = y + ly * r * 0.28;
  const white = '#ffffff';
  const sw = Math.max(3, Math.min(SW, r * 0.22));
  switch (e.kind) {
    case 'dot':
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={INK} />
          <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.32} fill={white} />
        </g>
      );
    case 'arc':
      return <path d={`M${x - r},${y + r * 0.3} Q${x},${y - r * 1.1} ${x + r},${y + r * 0.3}`} fill="none" stroke={INK} strokeWidth={sw + 1} strokeLinecap="round" />;
    case 'alien':
      return (
        <g transform={`rotate(${side * -18} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx={r * 0.72} ry={r} fill={shade(iris, 0.75)} stroke={INK} strokeWidth={sw} />
          <ellipse cx={x - r * 0.2} cy={y - r * 0.4} rx={r * 0.2} ry={r * 0.28} fill={white} opacity={0.9} />
        </g>
      );
    case 'bug':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={r * 0.85} ry={r} fill={shade(iris, 0.35)} stroke={INK} strokeWidth={sw} />
          <path d={`M${x - r * 0.5},${y} H${x + r * 0.5} M${x},${y - r * 0.7} V${y + r * 0.7}`} stroke={shade(iris, 0.55)} strokeWidth={2} opacity={0.6} />
          <circle cx={x - r * 0.3} cy={y - r * 0.4} r={r * 0.22} fill={white} />
          <circle cx={x + r * 0.25} cy={y + r * 0.3} r={r * 0.1} fill={white} />
        </g>
      );
    case 'square':
      return (
        <g>
          <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.3} fill={white} stroke={INK} strokeWidth={sw} />
          <rect x={px - r * 0.45} y={py - r * 0.45} width={r * 0.9} height={r * 0.9} rx={r * 0.15} fill={iris} />
          <rect x={px - r * 0.2} y={py - r * 0.2} width={r * 0.4} height={r * 0.4} fill={INK} />
          <rect x={x - r * 0.75} y={y - r * 0.75} width={r * 0.3} height={r * 0.3} fill={white} />
        </g>
      );
    case 'oval':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={r * 0.72} ry={r * 1.15} fill={white} stroke={INK} strokeWidth={sw} />
          <ellipse cx={px} cy={py + r * 0.15} rx={r * 0.46} ry={r * 0.7} fill={iris} />
          <ellipse cx={px} cy={py + r * 0.2} rx={r * 0.26} ry={r * 0.42} fill={INK} />
          <circle cx={px - r * 0.18} cy={py - r * 0.25} r={r * 0.16} fill={white} />
        </g>
      );
    default:
      break;
  }
  // olhos com parte branca
  const lid = e.kind === 'sleepy' || e.kind === 'angry';
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={white} stroke={INK} strokeWidth={sw} />
      {e.kind === 'cat' ? (
        <g>
          <circle cx={px} cy={py} r={r * 0.68} fill={iris} />
          <ellipse cx={px} cy={py} rx={r * 0.16} ry={r * 0.55} fill={INK} />
        </g>
      ) : e.kind === 'spiral' ? (
        <path
          d={`M${x},${y} m0,-2 a2,2 0 1,1 -2,2 a5,5 0 1,1 6,-5 a9,9 0 1,1 -12,9 a13,13 0 1,1 18,-13`}
          transform={`translate(${x} ${y}) scale(${r / 22}) translate(${-x} ${-y})`}
          fill="none" stroke={iris === '#ffffff' ? INK : shade(iris, 0.3)} strokeWidth={3} strokeLinecap="round"
        />
      ) : e.kind === 'star' ? (
        <path d={starPath(px, py, r * 0.62)} fill={iris} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      ) : e.kind === 'heart' ? (
        <path d={heartPath(px, py, r * 0.5)} fill={iris} stroke={INK} strokeWidth={2} />
      ) : e.kind === 'googly' ? (
        <circle cx={x + (lx || 0.35) * r * 0.42} cy={y + (ly || 0.3) * r * 0.42} r={r * 0.48} fill={INK} />
      ) : (
        <g>
          <circle cx={px} cy={py} r={r * (e.kind === 'sparkle' ? 0.74 : 0.6)} fill={iris} />
          <circle cx={px} cy={py} r={r * (e.kind === 'sparkle' ? 0.42 : 0.34)} fill={INK} />
        </g>
      )}
      {e.kind !== 'spiral' && e.kind !== 'googly' && (
        <circle cx={px - r * 0.28} cy={py - r * 0.3} r={r * (e.kind === 'sparkle' ? 0.24 : 0.18)} fill={white} />
      )}
      {e.kind === 'sparkle' && <circle cx={px + r * 0.28} cy={py + r * 0.25} r={r * 0.11} fill={white} />}
      {lid && (
        <path
          d={e.kind === 'sleepy' ? lidPath(x, y, r + 1, 180, 360) : side < 0 ? lidPath(x, y, r + 1, 212, 352) : lidPath(x, y, r + 1, 188, 328)}
          fill={skin}
          stroke={INK}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      )}
      {e.kind === 'lash' && (
        <path
          d={`M${x - r * 0.8},${y - r * 0.6} l${-r * 0.35},${-r * 0.45} M${x - r * 0.2},${y - r * 0.95} l${-r * 0.1},${-r * 0.5} M${x + r * 0.45},${y - r * 0.85} l${r * 0.2},${-r * 0.5}`}
          transform={side > 0 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}
          stroke={INK} strokeWidth={3.5} strokeLinecap="round"
        />
      )}
    </g>
  );
}
