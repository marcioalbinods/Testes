import type { ReactNode } from 'react';
import type { PartDef, Tone } from './common';
import { SW, smoothClosed } from './common';
import { INK, shade } from '../colors';

// Orelhas, chifres, antenas e espinhos (presos à cabeça).
// Coordenadas locais do LADO ESQUERDO: (0,0) = ponto de encaixe.

const st = (t: Tone, w = SW) => ({ stroke: t.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

/** Traço grosso com contorno (para galhos, antenas e molas). */
function Stem({ d, color, w = 9 }: { d: string; color: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 6} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
}
function star(cx: number, cy: number, r: number) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.48;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return d + 'Z';
}
function heart(cx: number, cy: number, s: number) {
  return `M${cx},${cy + s * 0.9} C${cx - s * 1.4},${cy} ${cx - s * 0.9},${cy - s * 1.1} ${cx},${cy - s * 0.35} C${cx + s * 0.9},${cy - s * 1.1} ${cx + s * 1.4},${cy} ${cx},${cy + s * 0.9}Z`;
}
export { star as starPathAt, heart as heartPathAt, Stem };

export const EARS: PartDef[] = [
  { id: 'urso', name: 'De urso', draw: (t) => <g><circle cx={-10} cy={-16} r={27} fill={t.c} {...st(t)} /><circle cx={-12} cy={-18} r={14} fill={t.l} /></g> },
  { id: 'gato', name: 'De gato', draw: (t) => <g><path d="M-34,16 L-30,-50 L20,-2Z" fill={t.c} {...st(t)} /><path d="M-24,4 L-24,-32 L4,-4Z" fill={t.l} /></g> },
  { id: 'coelho', name: 'De coelho', draw: (t) => <g transform="rotate(-14)"><ellipse cx={-6} cy={-58} rx={18} ry={54} fill={t.c} {...st(t)} /><ellipse cx={-6} cy={-58} rx={8} ry={38} fill={t.l} /></g> },
  { id: 'elfo', name: 'De elfo', draw: (t) => <g><path d="M12,-12 C-20,-30 -56,-56 -74,-62 C-58,-30 -32,0 8,16Z" fill={t.c} {...st(t)} /><path d="M2,-4 C-20,-18 -40,-36 -54,-44 C-40,-24 -24,-8 0,6Z" fill={t.d} opacity={0.5} /></g> },
  { id: 'rato', name: 'De ratinho', draw: (t) => <g><circle cx={-22} cy={-20} r={38} fill={t.c} {...st(t)} /><circle cx={-24} cy={-22} r={24} fill={t.l} /></g> },
  { id: 'morcego', name: 'De morcego', draw: (t) => <g><path d="M14,-2 L-6,-74 L-22,-44 L-52,-56 L-34,8Z" fill={t.c} {...st(t)} /><path d="M2,-8 L-8,-50 L-24,-28 L-26,0Z" fill={t.d} opacity={0.45} /></g> },
  { id: 'cachorro', name: 'De cachorro', draw: (t) => <path d="M12,-16 C-30,-26 -56,10 -46,58 C-38,74 -20,62 -16,42 C-12,22 0,12 12,8Z" fill={t.d} {...st(t)} /> },
  { id: 'barbatana', name: 'Barbatana', draw: (t) => <g><path d="M10,-16 C-20,-42 -62,-32 -68,-10 L-54,-4 L-62,8 L-46,10 L-50,26 C-22,28 0,18 10,10Z" fill={t.c} {...st(t)} /><path d="M0,-6 L-50,-14 M0,0 L-46,6 M0,6 L-38,20" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g> },
  { id: 'folha', name: 'De folha', draw: (t) => <g><path d="M10,2 C-22,-8 -52,-50 -62,-84 C-30,-74 -4,-42 10,2Z" fill={t.c} {...st(t)} /><path d="M6,-4 C-14,-24 -34,-50 -52,-74" fill="none" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g>, defaultColor: '#5fd068' },
  { id: 'cone', name: 'Pontuda', draw: (t) => <path d="M-16,8 L-26,-66 L12,-2Z" fill={t.c} {...st(t)} /> },
  { id: 'caracol', name: 'Caracol', draw: (t) => <g><circle cx={-22} cy={-12} r={30} fill={t.c} {...st(t)} /><path d="M-22,-12 m0,-3 a3,3 0 1,1 -3,3 a8,8 0 1,1 10,-8 a14,14 0 1,1 -18,16" fill="none" stroke={t.d} strokeWidth={4} strokeLinecap="round" /></g> },
  { id: 'peninha', name: 'De penas', draw: (t) => <path d="M10,-4 C-10,-42 -50,-52 -66,-38 C-52,-32 -54,-24 -60,-14 C-46,-12 -48,-4 -52,4 C-32,8 -10,8 10,8Z" fill={t.c} {...st(t)} /> },
  { id: 'tufo', name: 'Com tufinho', draw: (t) => <g><path d="M-30,14 L-26,-48 L18,-2Z" fill={t.c} {...st(t)} /><path d="M-26,-48 l-6,-18 M-26,-48 l4,-20 M-26,-48 l-14,-12" stroke={INK} strokeWidth={4} strokeLinecap="round" /></g> },
  { id: 'raposa', name: 'De raposa', draw: (t) => <g><path d="M-44,20 L-36,-60 L24,-6Z" fill={t.c} {...st(t)} /><path d="M-32,8 L-30,-36 L4,-6Z" fill="#fff8ef" /></g> },
  { id: 'concha', name: 'Concha', draw: (t) => <g transform="rotate(-20)"><path d="M10,6 C-30,10 -64,-20 -52,-54 C-30,-72 6,-50 10,6Z" fill={t.c} {...st(t)} /><path d="M6,0 L-44,-46 M6,0 L-26,-58 M6,0 L-54,-24" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g> },
];

const IVORY = '#fff1d0';
export const HORNS: PartDef[] = [
  { id: 'curvo', name: 'Curvinho', draw: (t) => <g><path d="M-8,6 C-14,-30 -32,-52 -56,-58 C-38,-42 -28,-20 12,4Z" fill={t.c} {...st(t)} /><path d="M-12,-14 l10,-4 M-20,-30 l10,-6" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g>, defaultColor: IVORY },
  { id: 'unicornio', name: 'Unicórnio', single: true, draw: (t) => <g><path d="M-16,8 L0,-78 L16,8Z" fill={t.c} {...st(t)} /><path d="M-11,-12 L9,-4 M-8,-32 L6,-26 M-4,-52 L4,-48" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g>, defaultColor: '#ffd8f0' },
  { id: 'cervo', name: 'Galhadas', draw: (t) => <Stem d="M0,4 C-6,-24 -22,-44 -30,-70 M-12,-30 C-28,-34 -40,-44 -46,-56 M-24,-54 C-14,-60 -8,-70 -6,-80" color={t.c} w={8} />, defaultColor: '#a8754e' },
  { id: 'carneiro', name: 'De carneiro', draw: (t) => <g><Stem d="M8,0 C-10,-30 -60,-30 -60,4 C-60,30 -24,34 -22,10 C-20,-4 -38,-6 -40,6" color={t.c} w={12} /></g>, defaultColor: '#e8d2a8' },
  { id: 'touro', name: 'De touro', draw: (t) => <path d="M10,2 C-20,-2 -48,-16 -56,-54 C-36,-36 -22,-32 2,-20Z" fill={t.c} {...st(t)} />, defaultColor: IVORY },
  { id: 'chifrinho', name: 'Chifrinho', draw: (t) => <path d="M-12,6 L-6,-28 L10,4Z" fill={t.c} {...st(t)} />, defaultColor: IVORY },
  { id: 'diabinho', name: 'Diabinho', draw: (t) => <path d="M-12,6 C-14,-14 -6,-32 8,-44 C2,-28 6,-14 14,4Z" fill={t.c} {...st(t)} />, defaultColor: '#ff5c7a' },
  { id: 'rinoceronte', name: 'Rinoceronte', single: true, draw: (t) => <path d="M-18,10 C-16,-20 -4,-48 16,-68 C8,-42 14,-14 20,10Z" fill={t.c} {...st(t)} />, defaultColor: IVORY },
  { id: 'cristal', name: 'Cristal', draw: (t) => <g><path d="M-12,8 L-20,-26 L-4,-56 L12,-28 L8,8Z" fill={t.c} {...st(t)} /><path d="M-4,-56 L-2,6 M-20,-26 L12,-28" stroke={t.l} strokeWidth={3} strokeLinecap="round" opacity={0.9} /></g>, defaultColor: '#8fe6ff' },
  { id: 'cogumelo', name: 'Cogumelo', draw: (t) => <g><rect x={-7} y={-26} width={14} height={32} rx={6} fill="#fff6e6" {...st(t)} /><path d="M-30,-22 C-30,-50 30,-50 30,-22Z" fill={t.c} {...st(t)} /><circle cx={-12} cy={-34} r={5} fill="#fff" /><circle cx={8} cy={-38} r={4} fill="#fff" /></g>, defaultColor: '#ff5c7a' },
  { id: 'raio', name: 'Raio', draw: (t) => <path d="M-4,8 L-18,-24 L-6,-24 L-14,-60 L12,-20 L0,-20 L10,8Z" fill={t.c} {...st(t)} />, defaultColor: '#ffd23f' },
  { id: 'estrela', name: 'Estrelinha', draw: (t) => <g><Stem d="M0,4 C-2,-12 -6,-24 -10,-34" color={shade(t.c, 0.3)} w={5} /><path d={star(-12, -46, 17)} fill={t.c} {...st(t, 4)} /></g>, defaultColor: '#ffd23f' },
  { id: 'lua', name: 'Lua', draw: (t) => <g><Stem d="M0,4 C0,-10 -4,-22 -8,-30" color={shade(t.c, 0.3)} w={5} /><path d="M-2,-60 A18,18 0 1,0 -2,-28 A13,13 0 1,1 -2,-60Z" fill={t.c} {...st(t, 4)} /></g>, defaultColor: '#fff07a' },
  { id: 'coroa-espinhos', name: 'Triplo', single: true, draw: (t) => <path d="M-34,8 L-30,-34 L-14,-10 L0,-50 L14,-10 L30,-34 L34,8Z" fill={t.c} {...st(t)} />, defaultColor: '#c3a6ff' },
  { id: 'galho', name: 'Galhinho', draw: (t) => <g><Stem d="M0,4 C-4,-20 -14,-36 -20,-54" color="#8a5a3c" w={7} /><path d="M-16,-40 C-34,-50 -50,-44 -54,-30 C-38,-26 -24,-30 -16,-40Z" fill={t.c} {...st(t, 4)} /></g>, defaultColor: '#5fd068' },
];

export const ANTENNAE: PartDef[] = [
  { id: 'bolinha', name: 'Bolinha', draw: (t, x) => <g><Stem d="M0,4 C0,-24 -12,-44 -16,-60" color={t.c} w={6} /><circle cx={-16} cy={-66} r={12} fill={x?.accent ?? '#ffd23f'} {...st(t, 4)} /></g> },
  { id: 'estrela', name: 'Estrela', draw: (t, x) => <g><Stem d="M0,4 C0,-24 -12,-44 -16,-58" color={t.c} w={6} /><path d={star(-17, -70, 17)} fill={x?.accent ?? '#ffd23f'} {...st(t, 4)} /></g> },
  { id: 'coracao', name: 'Coração', draw: (t, x) => <g><Stem d="M0,4 C0,-24 -12,-44 -16,-58" color={t.c} w={6} /><path d={heart(-17, -70, 14)} fill={x?.accent ?? '#ff5c7a'} {...st(t, 4)} /></g> },
  { id: 'mola', name: 'Molinha', draw: (t, x) => <g><Stem d="M0,4 L-10,-8 L6,-18 L-10,-28 L6,-38 L-10,-48 L-4,-56" color={t.c} w={5} /><circle cx={-4} cy={-64} r={11} fill={x?.accent ?? '#7cc9ff'} {...st(t, 4)} /></g> },
  { id: 'borboleta', name: 'Enroladinha', draw: (t) => <Stem d="M0,4 C0,-30 -20,-56 -40,-62 C-52,-64 -56,-50 -46,-46 C-40,-44 -38,-52 -42,-54" color={t.c} w={6} /> },
  { id: 'luz', name: 'Lâmpada', draw: (t, x) => <g><Stem d="M0,4 C0,-20 -6,-40 -8,-52" color={t.c} w={6} /><circle className="m-glow" cx={-8} cy={-66} r={22} fill={x?.accent ?? '#fff07a'} opacity={0.35} /><circle cx={-8} cy={-66} r={13} fill={x?.accent ?? '#fff07a'} {...st(t, 4)} /></g> },
  { id: 'olho', name: 'Olhinho', draw: (t, x) => <g><Stem d="M0,4 C0,-24 -10,-42 -14,-54" color={t.c} w={7} /><circle cx={-14} cy={-68} r={16} fill="#fff" {...st(t, 4)} /><circle cx={-12} cy={-67} r={8} fill={x?.accent ?? '#3d8bff'} /><circle cx={-12} cy={-67} r={4} fill={INK} /></g> },
  { id: 'folhinha', name: 'Folhinha', draw: (t) => <g><Stem d="M0,4 C0,-20 -6,-36 -10,-46" color="#5fa34a" w={5} /><path d="M-10,-46 C-36,-52 -44,-76 -34,-88 C-14,-80 -4,-64 -10,-46Z" fill="#7ee04a" {...st(t, 4)} /></g> },
];

// Espinhos: (0,0) = topo da cabeça, centro. Desenhados por trás da cabeça.
function row(n: number, spread: number, fn: (x: number, y: number, i: number) => ReactNode) {
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? 0 : -spread + (i * 2 * spread) / (n - 1);
    const y = (x * x) / 150;
    out.push(<g key={i}>{fn(x, y, i)}</g>);
  }
  return out;
}
export const SPIKES: PartDef[] = [
  { id: 'espinhos', name: 'Espinhos', single: true, draw: (t) => <g>{row(5, 64, (x, y) => <path d={`M${x - 16},${y + 14} L${x},${y - 30} L${x + 16},${y + 14}Z`} fill={t.c} {...st(t, 4)} />)}</g>, defaultColor: '#ffd23f' },
  { id: 'cristas', name: 'Cristas', single: true, draw: (t) => <g>{row(4, 50, (x, y) => <path d={`M${x - 18},${y + 14} A18,22 0 0,1 ${x + 18},${y + 14}Z`} fill={t.c} {...st(t, 4)} />)}</g>, defaultColor: '#ff8fc7' },
  { id: 'cristais', name: 'Cristais', single: true, draw: (t) => <g>{row(3, 40, (x, y, i) => <path d={`M${x - 12},${y + 14} L${x - 8},${y - 22 - (i === 1 ? 14 : 0)} L${x + 4},${y - 34 - (i === 1 ? 14 : 0)} L${x + 12},${y + 14}Z`} fill={t.c} {...st(t, 4)} />)}</g>, defaultColor: '#8fe6ff' },
  { id: 'moicano', name: 'Topete', single: true, draw: (t) => <path d={smoothClosed([[-30, 18], [-26, -20], [-8, -46], [12, -58], [6, -34], [26, -40], [22, -14], [34, 18]])} fill={t.c} {...st(t, 4)} />, defaultColor: '#ff5c7a' },
  { id: 'pelos', name: 'Cabelinho', single: true, draw: (t) => <g>{row(9, 70, (x, y, i) => <path d={`M${x - 8},${y + 14} L${x + (i % 2 ? 6 : -6)},${y - 22} L${x + 8},${y + 14}Z`} fill={t.c} {...st(t, 3.5)} />)}</g> },
  { id: 'placas', name: 'Placas', single: true, draw: (t) => <g>{row(3, 46, (x, y, i) => <path d={`M${x - 16},${y + 16} L${x - 18},${y - 10} L${x},${y - 32 - (i === 1 ? 10 : 0)} L${x + 18},${y - 10} L${x + 16},${y + 16}Z`} fill={t.c} {...st(t, 4)} />)}</g>, defaultColor: '#b8ec5a' },
];
