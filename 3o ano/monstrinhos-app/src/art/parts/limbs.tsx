import type { PartDef, Tone } from './common';
import { SW } from './common';
import { INK } from '../colors';
import { Stem, heartPathAt, starPathAt } from './head-extras';

// Braços e pernas, LADO ESQUERDO. (0,0) = ombro / quadril.
const st = (t: Tone, w = SW) => ({ stroke: t.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

/** Membro "tubo" com contorno: desenha um traço grosso com borda. */
function Tube({ d, t, w = 18 }: { d: string; t: Tone; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 10} />
      <path d={d} stroke={t.c} strokeWidth={w} />
    </g>
  );
}

export const ARMS: PartDef[] = [
  { id: 'fininho', name: 'Fininho', draw: (t) => <g><Tube d="M6,0 C-20,6 -40,20 -52,36" t={t} w={12} /><circle cx={-56} cy={42} r={14} fill={t.c} {...st(t)} /><circle cx={-44} cy={34} r={6} fill={t.c} {...st(t, 3.5)} /></g> },
  { id: 'gordinho', name: 'Gordinho', draw: (t) => <g><path d="M10,-14 C-30,-16 -62,6 -62,30 C-62,50 -40,52 -32,40 C-24,26 -6,22 10,18Z" fill={t.c} {...st(t)} /><path d="M-56,36 l6,-4 M-48,44 l4,-6" stroke={INK} strokeWidth={3} strokeLinecap="round" /></g> },
  { id: 'garra', name: 'Garras', draw: (t) => <g><Tube d="M6,0 C-20,8 -36,22 -46,38" t={t} w={16} /><path d="M-54,40 l-12,10 M-46,46 l-6,14 M-38,46 l2,14" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d="M-54,40 l-12,10 M-46,46 l-6,14 M-38,46 l2,14" stroke="#fff6e6" strokeWidth={4} strokeLinecap="round" /></g> },
  { id: 'tentaculo', name: 'Tentáculo', draw: (t) => <g><Tube d="M6,0 C-30,-6 -50,20 -40,40 C-32,56 -56,66 -66,56" t={t} w={16} /><circle cx={-38} cy={24} r={3.5} fill={t.l} /><circle cx={-42} cy={44} r={3.5} fill={t.l} /></g> },
  { id: 'nadadeira', name: 'Nadadeira', draw: (t) => <g><path d="M10,-12 C-26,-10 -58,10 -66,40 C-40,40 -14,26 10,14Z" fill={t.c} {...st(t)} /><path d="M-6,-2 L-44,24 M-2,6 L-34,32" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g> },
  { id: 'pinca', name: 'Pinça', draw: (t) => <g><Tube d="M6,0 C-14,6 -30,14 -38,24" t={t} w={14} /><path d="M-36,22 C-60,14 -76,30 -70,48 L-52,40 C-62,34 -56,26 -46,30Z" fill={t.c} {...st(t)} /><path d="M-40,32 C-48,52 -68,62 -74,56 L-56,46Z" fill={t.c} {...st(t)} /></g> },
  { id: 'peludo', name: 'Peludo', draw: (t) => <g><path d="M10,-14 L-8,-18 L-14,-10 L-30,-12 L-34,0 L-50,2 L-52,14 L-66,20 L-60,32 L-64,46 L-48,46 L-40,56 L-30,42 L-16,36 L-12,24 L10,18Z" fill={t.c} {...st(t, 4)} /></g> },
  { id: 'robo', name: 'Robô', draw: (t) => <g><Stem d="M6,0 L-8,6 L-2,14 L-18,18 L-12,26 L-28,30 L-22,38 L-38,40" color="#c9cde0" w={5} /><rect x={-58} y={34} width={22} height={16} rx={4} fill={t.c} {...st(t, 4)} /><path d="M-58,46 l-8,10 M-48,50 l0,12" stroke={INK} strokeWidth={6} strokeLinecap="round" /></g> },
  { id: 'trex', name: 'Bracinho curto', draw: (t) => <g><Tube d="M6,0 C-8,4 -18,10 -22,20" t={t} w={14} /><path d="M-26,24 l-8,6 M-22,28 l-4,8" stroke={INK} strokeWidth={5} strokeLinecap="round" /></g> },
  { id: 'luva', name: 'Com luva', draw: (t) => <g><Tube d="M6,0 C-20,6 -36,18 -44,30" t={t} w={13} /><path d="M-40,26 C-56,18 -76,26 -74,44 C-72,60 -54,64 -44,54 C-38,48 -34,38 -40,26Z" fill="#ffffff" {...st(t)} /><path d="M-66,30 C-72,22 -80,24 -78,34" fill="#ffffff" {...st(t, 4)} /><rect x={-46} y={22} width={12} height={14} rx={5} transform="rotate(-30 -40 29)" fill="#ffffff" {...st(t, 4)} /></g> },
  { id: 'acenando', name: 'Acenando', draw: (t) => <g><Tube d="M6,0 C-24,-6 -42,-24 -46,-50" t={t} w={13} /><path d="M-46,-50 C-60,-58 -62,-76 -50,-80 M-46,-50 C-48,-66 -42,-82 -32,-80 M-46,-50 C-38,-62 -26,-70 -20,-64" fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" /><path d="M-46,-50 C-60,-58 -62,-76 -50,-80 M-46,-50 C-48,-66 -42,-82 -32,-80 M-46,-50 C-38,-62 -26,-70 -20,-64" fill="none" stroke={t.c} strokeWidth={5} strokeLinecap="round" /></g> },
  { id: 'pata', name: 'Patinha', draw: (t) => <g><Tube d="M6,0 C-16,8 -32,20 -42,34" t={t} w={18} /><circle cx={-46} cy={40} r={17} fill={t.c} {...st(t)} /><circle cx={-48} cy={44} r={6} fill={t.l} /><circle cx={-58} cy={34} r={3.5} fill={t.l} /><circle cx={-50} cy={28} r={3.5} fill={t.l} /></g> },
  { id: 'pedra', name: 'De pedra', draw: () => <g><path d="M10,-12 L-14,-16 L-22,4 L4,12Z" fill="#a7a9c4" stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M-20,-4 L-44,0 L-50,22 L-26,24Z" fill="#9396b5" stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M-48,18 L-70,26 L-66,50 L-44,44Z" fill="#a7a9c4" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g> },
  { id: 'galho', name: 'Galho', draw: () => <g><Stem d="M6,0 C-20,6 -38,18 -54,36 M-30,14 C-36,2 -46,-4 -54,-4 M-50,32 C-62,30 -70,36 -74,44" color="#8a5a3c" w={7} /><path d="M-54,-4 C-66,-14 -64,-28 -52,-30 C-46,-18 -48,-10 -54,-4Z" fill="#7ee04a" stroke={INK} strokeWidth={3.5} /></g> },
  { id: 'estrela', name: 'Mão de estrela', draw: (t) => <g><Tube d="M6,0 C-20,8 -36,20 -44,32" t={t} w={12} /><path d={starPathAt(-52, 44, 20)} fill={t.c} {...st(t, 4)} /></g> },
];

export const LEGS: PartDef[] = [
  { id: 'redondinho', name: 'Redondinho', draw: (t) => <g><Tube d="M0,-4 L-4,30" t={t} w={20} /><ellipse cx={-10} cy={42} rx={24} ry={13} fill={t.c} {...st(t)} /></g> },
  { id: 'fininho', name: 'Fininho', draw: (t) => <g><Tube d="M0,-4 L-2,36" t={t} w={9} /><path d="M-26,50 C-26,36 6,34 8,50Z" fill="#ff5c7a" {...st(t)} /></g> },
  { id: 'urso', name: 'Pata de urso', draw: (t) => <g><path d="M-26,-8 L22,-8 L22,34 C22,50 -26,50 -26,34Z" fill={t.c} {...st(t)} /><ellipse cx={-2} cy={40} rx={12} ry={6} fill={t.l} /><circle cx={-16} cy={32} r={3.5} fill={t.l} /><circle cx={12} cy={32} r={3.5} fill={t.l} /></g> },
  { id: 'galinha', name: 'De passarinho', draw: () => <g><Stem d="M0,-4 L-2,38" color="#ffb43c" w={6} /><Stem d="M-2,38 L-20,50 M-2,38 L-4,54 M-2,38 L14,50" color="#ffb43c" w={5} /></g> },
  { id: 'tentaculos', name: 'Tentáculos', draw: (t) => <g><Tube d="M-6,-6 C-8,20 -30,26 -26,44 C-22,56 -8,50 -12,42" t={t} w={14} /><Tube d="M10,-6 C12,20 2,34 10,46" t={t} w={12} /></g> },
  { id: 'rodinha', name: 'Rodinha', draw: (t) => <g><Tube d="M0,-4 L-2,22" t={t} w={10} /><circle cx={-2} cy={38} r={18} fill="#55597a" {...st(t)} /><circle cx={-2} cy={38} r={7} fill="#c9cde0" stroke={INK} strokeWidth={3} /></g> },
  { id: 'mola', name: 'Mola', draw: (t) => <g><Stem d="M0,-4 L-12,4 L10,10 L-12,16 L10,22 L-12,28 L4,34" color="#c9cde0" w={5} /><ellipse cx={-4} cy={44} rx={22} ry={10} fill={t.c} {...st(t)} /></g> },
  { id: 'pezao', name: 'Pezão', draw: (t) => <g><Tube d="M0,-4 L-2,26" t={t} w={18} /><path d="M-50,48 C-54,26 -10,22 14,30 C24,34 22,48 12,50Z" fill={t.c} {...st(t)} /><path d="M-46,40 l4,-4 M-38,40 l4,-5 M-30,40 l4,-5" stroke={INK} strokeWidth={3} strokeLinecap="round" /></g> },
  { id: 'botinha', name: 'Botinha', draw: (t) => <g><Tube d="M0,-4 L-2,20" t={t} w={16} /><path d="M-14,14 H12 V36 C12,40 16,40 20,42 C26,46 22,52 16,52 H-24 C-30,52 -30,42 -24,40 C-16,38 -14,36 -14,34Z" fill="#ffd23f" {...st(t)} /></g> },
  { id: 'dino', name: 'De dinossauro', draw: (t) => <g><path d="M-22,-8 C-30,20 -30,30 -26,40 L14,40 C18,26 18,8 16,-8Z" fill={t.c} {...st(t)} /><path d="M-24,42 l-6,8 M-10,44 l-2,9 M4,44 l2,9" stroke={INK} strokeWidth={7} strokeLinecap="round" /><path d="M-24,42 l-6,8 M-10,44 l-2,9 M4,44 l2,9" stroke="#fff6e6" strokeWidth={3} strokeLinecap="round" /></g> },
  { id: 'pato', name: 'Pé de pato', draw: () => <g><Stem d="M0,-4 L-2,34" color="#ff9a3c" w={7} /><path d="M-2,34 L-30,52 L-18,48 L-10,54 L-2,46 L8,54 L14,48 L26,52Z" fill="#ff9a3c" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g> },
  { id: 'listrado', name: 'Meia listrada', draw: (t) => <g><Tube d="M0,-4 L-2,34" t={{ ...t, c: '#ffffff' }} w={14} /><path d="M-8,4 h13 M-8,14 h13 M-9,24 h13" stroke="#ff5c7a" strokeWidth={6} /><ellipse cx={-8} cy={44} rx={20} ry={11} fill={t.d} {...st(t)} /></g> },
  { id: 'flutua', name: 'Flutuante', single: true, draw: () => <g className="m-float-cloud"><path d="M-60,30 C-76,30 -76,8 -60,8 C-58,-6 -36,-8 -30,2 C-24,-10 0,-12 6,2 C14,-10 38,-8 40,6 C56,4 60,26 46,30Z" fill="#ffffff" stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M-40,40 v8 M0,42 v10 M30,40 v8" stroke="#9bdcff" strokeWidth={4} strokeLinecap="round" opacity={0.8} /></g> },
  { id: 'aranha', name: 'De aranha', draw: (t) => <g><Stem d="M4,-6 C-20,-20 -40,0 -46,40 M0,-2 C-14,-4 -26,14 -26,44 M8,0 C0,10 -6,30 -4,46" color={t.c} w={6} /></g> },
  { id: 'pelucia', name: 'De pelúcia', draw: (t) => <g><path d="M-22,-8 L18,-8 L20,36 L12,44 L4,38 L-4,46 L-12,38 L-20,46 L-26,36Z" fill={t.c} {...st(t, 4)} /></g> },
];

// Caudas: (0,0) = lateral do corpo. Saem para a DIREITA, por trás do corpo.
export const TAILS: PartDef[] = [
  { id: 'gato', name: 'De gato', draw: (t) => <Tube d="M-10,0 C30,10 60,-10 60,-50 C60,-70 76,-80 84,-70" t={t} w={14} /> },
  { id: 'raposa', name: 'De raposa', draw: (t) => <g><path d="M-10,-6 C40,-30 100,-20 108,-70 C122,-40 112,20 50,30 C24,34 4,22 -10,10Z" fill={t.c} {...st(t)} /><path d="M108,-70 C122,-40 116,-10 96,6 C92,-20 100,-46 108,-70Z" fill="#fff8ef" {...st(t, 4)} /></g> },
  { id: 'dragao', name: 'De dragão', draw: (t) => <g><Tube d="M-10,0 C30,20 60,10 70,-20" t={t} w={14} /><path d="M70,-20 L60,-40 L84,-46 L92,-22 Z" fill={t.d} {...st(t, 4)} /></g> },
  { id: 'peixe', name: 'De peixe', draw: (t) => <g><Tube d="M-10,0 C20,4 40,6 54,0" t={t} w={16} /><path d="M50,0 L86,-30 C80,-10 80,10 86,30Z" fill={t.c} {...st(t)} /></g> },
  { id: 'pompom', name: 'Pompom', draw: (t) => <circle cx={10} cy={10} r={20} fill={t.l} {...st(t)} /> },
  { id: 'porquinho', name: 'Enroladinho', draw: (t) => <Tube d="M-6,0 C16,0 26,-14 18,-22 C10,-30 0,-18 12,-10 C24,-2 36,-12 40,-20" t={t} w={7} /> },
  { id: 'escorpiao', name: 'Escorpião', draw: (t) => <g><Tube d="M-8,4 C30,10 54,-10 56,-40 C58,-62 40,-76 26,-70" t={t} w={16} /><path d="M26,-70 L10,-80 L20,-60Z" fill="#fff6e6" {...st(t, 4)} /><path d="M20,6 l4,-10 M42,-6 l8,-6 M54,-28 l10,-2" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g> },
  { id: 'lagarto', name: 'De lagarto', draw: (t) => <path d="M-10,-12 C40,-14 80,0 110,24 C78,22 40,18 -10,14Z" fill={t.c} {...st(t)} /> },
  { id: 'raio', name: 'Raio', draw: () => <path d="M-10,-6 L30,-14 L24,0 L64,-12 L40,10 L46,0 L-6,12Z" fill="#ffd23f" stroke={INK} strokeWidth={4} strokeLinejoin="round" /> },
  { id: 'coracao', name: 'Coração', draw: (t) => <g><Tube d="M-10,0 C24,8 46,-4 54,-28" t={t} w={9} /><path d={heartPathAt(58, -40, 16)} fill="#ff5c7a" {...st(t, 4)} /></g> },
  { id: 'estrela', name: 'Estrela', draw: (t) => <g><Tube d="M-10,0 C24,8 46,-4 54,-26" t={t} w={9} /><path d={starPathAt(58, -42, 20)} fill="#ffd23f" {...st(t, 4)} /></g> },
  { id: 'pavao', name: 'De pavão', draw: (t) => <g>{[-60, -35, -10, 15, 40].map((a, i) => <g key={i} transform={`rotate(${a})`}><path d="M0,0 C20,-6 60,-14 84,0 C60,14 20,6 0,0Z" fill={t.c} {...st(t, 3.5)} /><circle cx={70} cy={0} r={8} fill="#3d8bff" stroke={INK} strokeWidth={3} /><circle cx={70} cy={0} r={3.5} fill="#ffd23f" /></g>)}</g> },
  { id: 'macaco', name: 'De macaco', draw: (t) => <Tube d="M-10,0 C40,0 70,-20 70,-50 C70,-76 40,-80 36,-60 C34,-48 48,-44 52,-54" t={t} w={10} /> },
  { id: 'castor', name: 'De castor', draw: () => <g><path d="M-10,-14 C20,-30 70,-26 80,0 C70,26 20,30 -10,14Z" fill="#8a5a3c" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M10,-10 L60,10 M10,10 L60,-10 M30,-18 L40,18" stroke="#6b432b" strokeWidth={3} /></g> },
  { id: 'dino', name: 'De dinossauro', draw: (t) => <g><path d="M-10,-16 C40,-16 80,0 112,26 C70,24 30,22 -10,18Z" fill={t.c} {...st(t)} /><path d="M10,-16 L18,-32 L28,-15 M40,-12 L50,-26 L58,-9 M68,-4 L78,-16 L84,2" fill={t.d} {...st(t, 4)} /></g> },
  { id: 'chocalho', name: 'Chocalho', draw: (t) => <g><Tube d="M-10,0 C20,4 40,-4 50,-14" t={t} w={12} /><ellipse cx={58} cy={-22} rx={10} ry={8} fill="#ecd3a5" {...st(t, 4)} /><ellipse cx={70} cy={-32} rx={9} ry={7} fill="#ecd3a5" {...st(t, 4)} /><ellipse cx={80} cy={-42} rx={7} ry={6} fill="#ecd3a5" {...st(t, 4)} /></g> },
  { id: 'bola', name: 'Bolinha', draw: (t) => <g><Tube d="M-10,0 C20,4 34,10 46,24" t={t} w={8} /><circle cx={54} cy={34} r={16} fill={t.d} {...st(t)} /></g> },
  { id: 'nuvem', name: 'Nuvem', draw: () => <path d="M-8,10 C-12,-8 8,-20 22,-12 C26,-30 54,-32 60,-14 C78,-20 92,0 80,14 C88,30 64,40 52,30 C42,44 14,40 12,28 C0,32 -10,24 -8,10Z" fill="#ffffff" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> },
  { id: 'sereia', name: 'De sereia', draw: (t) => <g><Tube d="M-10,4 C20,10 40,4 56,-8" t={t} w={14} /><path d="M54,-6 C60,-34 92,-42 100,-40 C90,-28 86,-14 72,-4 C90,-4 104,10 108,22 C92,24 70,16 54,-6Z" fill={t.c} {...st(t, 4)} /></g> },
  { id: 'leao', name: 'De leão', draw: (t) => <g><Tube d="M-10,0 C20,10 50,10 66,-8" t={t} w={8} /><path d="M62,-6 L66,-30 L74,-14 L90,-24 L84,-6 L100,0 L82,8 L88,22 L72,12 L64,24Z" fill={t.d} {...st(t, 4)} /></g> },
];
