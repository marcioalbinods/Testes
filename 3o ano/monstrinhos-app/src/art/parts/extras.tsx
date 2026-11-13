import type { ReactNode } from 'react';
import type { PartDef, Tone } from './common';
import { SW } from './common';
import { INK, shade } from '../colors';
import { starPathAt, heartPathAt } from './head-extras';

const st = (t: Tone, w = SW) => ({ stroke: t.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

// Asas: LADO ESQUERDO, (0,0) = costas. Saem para a esquerda e para cima.
export const WINGS: PartDef[] = [
  { id: 'morcego', name: 'De morcego', draw: (t) => <path d="M10,0 C-20,-60 -80,-80 -110,-56 C-96,-46 -96,-34 -100,-22 C-84,-28 -76,-20 -76,-6 C-60,-16 -46,-10 -44,4 C-28,-6 -6,0 10,14Z" fill={t.c} {...st(t)} />, defaultColor: '#55597a' },
  { id: 'passaro', name: 'De passarinho', draw: (t) => <g><path d="M10,4 C-10,-40 -60,-70 -100,-60 C-90,-50 -92,-42 -98,-34 C-84,-32 -84,-24 -90,-16 C-76,-14 -74,-6 -78,2 C-50,4 -20,10 10,16Z" fill={t.c} {...st(t)} /><path d="M-10,-4 C-30,-24 -56,-40 -80,-44 M-14,6 C-36,-6 -56,-14 -72,-14" fill="none" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g>, defaultColor: '#7cc9ff' },
  { id: 'borboleta', name: 'De borboleta', draw: (t) => <g><path d="M10,0 C-20,-80 -110,-90 -100,-30 C-96,-6 -40,0 10,6Z" fill={t.c} {...st(t)} /><path d="M10,8 C-30,10 -86,30 -66,62 C-50,80 -10,40 10,14Z" fill={shade(t.c, 0.15)} {...st(t)} /><circle cx={-60} cy={-40} r={14} fill="#fff" opacity={0.7} /><circle cx={-44} cy={36} r={9} fill="#fff" opacity={0.7} /></g>, defaultColor: '#ff8fc7' },
  { id: 'fada', name: 'De fada', draw: (t) => <g opacity={0.92}><ellipse cx={-50} cy={-40} rx={58} ry={26} transform="rotate(-30 -50 -40)" fill={t.l} {...st(t, 4)} /><ellipse cx={-40} cy={16} rx={40} ry={18} transform="rotate(20 -40 16)" fill={t.l} {...st(t, 4)} /><path d="M0,0 L-80,-60 M0,6 L-66,26" stroke={t.c} strokeWidth={2.5} /></g>, defaultColor: '#8ff0c9' },
  { id: 'anjo', name: 'De anjo', draw: (t) => <path d="M10,0 C0,-50 -50,-80 -96,-70 C-80,-60 -86,-52 -94,-44 C-74,-42 -78,-32 -88,-22 C-66,-22 -68,-10 -76,-2 C-50,2 -20,6 10,14Z" fill={t.c} {...st(t)} />, defaultColor: '#ffffff' },
  { id: 'dragao', name: 'De dragão', draw: (t) => <g><path d="M10,0 L-30,-90 L-50,-40 L-80,-70 L-84,-20 L-116,-30 L-96,10 Q-40,0 10,16Z" fill={t.c} {...st(t)} /><path d="M6,4 L-30,-86 M-4,8 L-78,-66 M-8,10 L-110,-28" stroke={t.d} strokeWidth={4} strokeLinecap="round" /></g> },
  { id: 'mini', name: 'Asinhas', draw: (t) => <path d="M10,0 C-6,-30 -36,-38 -50,-26 C-40,-20 -44,-12 -48,-4 C-30,-4 -10,4 10,10Z" fill={t.c} {...st(t)} />, defaultColor: '#ffffff' },
  { id: 'folha', name: 'De folha', draw: (t) => <g><path d="M10,4 C-20,-30 -70,-60 -110,-50 C-90,-10 -40,20 10,12Z" fill={t.c} {...st(t)} /><path d="M6,6 C-30,-16 -60,-36 -96,-46" fill="none" stroke={t.d} strokeWidth={3} strokeLinecap="round" /></g>, defaultColor: '#5fd068' },
];

// Acessórios. "slot" diz onde encaixar: topo da cabeça, olhos, pescoço ou costas.
export type AccSlot = 'top' | 'eyes' | 'neck' | 'back';
export interface AccessoryDef {
  id: string;
  name: string;
  slot: AccSlot;
  defaultColor: string;
  /** Só aparece depois de uma conquista (tesouros da aventura). */
  unlock?: string;
  draw: (t: Tone) => ReactNode;
}

export const ACCESSORIES: AccessoryDef[] = [
  { id: 'chapeu-festa', name: 'Chapéu de festa', slot: 'top', defaultColor: '#3d8bff', draw: (t) => <g><path d="M-26,6 L0,-70 L26,6Z" fill={t.c} {...st(t)} /><path d="M-17,-20 L17,-20 M-9,-44 L9,-44" stroke="#ffd23f" strokeWidth={6} /><circle cx={0} cy={-74} r={9} fill="#ff5c7a" {...st(t, 4)} /></g> },
  { id: 'cartola', name: 'Cartola', slot: 'top', defaultColor: '#2f2a55', draw: (t) => <g><rect x={-30} y={-60} width={60} height={58} rx={6} fill={t.c} {...st(t)} /><rect x={-30} y={-22} width={60} height={10} fill="#ff5c7a" /><ellipse cx={0} cy={0} rx={50} ry={10} fill={t.c} {...st(t)} /></g> },
  { id: 'coroa', name: 'Coroa', slot: 'top', defaultColor: '#ffd23f', draw: (t) => <g><path d="M-36,4 L-40,-40 L-18,-18 L0,-50 L18,-18 L40,-40 L36,4Z" fill={t.c} {...st(t)} /><circle cx={0} cy={-12} r={6} fill="#ff5c7a" stroke={INK} strokeWidth={3} /><circle cx={-22} cy={-8} r={4.5} fill="#45d9d0" stroke={INK} strokeWidth={3} /><circle cx={22} cy={-8} r={4.5} fill="#45d9d0" stroke={INK} strokeWidth={3} /></g> },
  { id: 'bone', name: 'Boné', slot: 'top', defaultColor: '#ff5c7a', draw: (t) => <g><path d="M-44,6 C-44,-50 44,-50 44,6Z" fill={t.c} {...st(t)} /><path d="M20,2 C40,-6 70,-2 78,8 L30,10Z" fill={shade(t.c, 0.2)} {...st(t)} /><circle cx={0} cy={-38} r={6} fill="#fff" stroke={INK} strokeWidth={3} /></g> },
  { id: 'flor', name: 'Florzinha', slot: 'top', defaultColor: '#ff8fc7', draw: (t) => <g transform="translate(30 -6)">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-14} rx={10} ry={14} transform={`rotate(${a})`} fill={t.c} stroke={INK} strokeWidth={3.5} />)}<circle r={9} fill="#ffd23f" stroke={INK} strokeWidth={3.5} /></g> },
  { id: 'laco', name: 'Laço', slot: 'top', defaultColor: '#ff5c7a', draw: (t) => <g transform="translate(26 -4)"><path d="M0,0 L-34,-20 L-34,20Z M0,0 L34,-20 L34,20Z" fill={t.c} {...st(t, 4.5)} /><circle r={9} fill={shade(t.c, 0.2)} stroke={INK} strokeWidth={4} /></g> },
  { id: 'bruxo', name: 'Chapéu de mago', slot: 'top', defaultColor: '#7340d9', draw: (t) => <g><path d="M-56,6 Q0,-12 56,6 Q0,18 -56,6Z" fill={t.c} {...st(t)} /><path d="M-32,2 C-20,-40 0,-80 30,-92 C14,-70 22,-30 32,2Z" fill={t.c} {...st(t)} /><path d={starPathAt(-2, -36, 10)} fill="#ffd23f" /></g> },
  { id: 'fone', name: 'Fone de ouvido', slot: 'top', defaultColor: '#45d9d0', draw: (t) => <g><path d="M-74,70 C-90,-30 90,-30 74,70" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d="M-74,70 C-90,-30 90,-30 74,70" fill="none" stroke={t.c} strokeWidth={7} strokeLinecap="round" /><rect x={-92} y={52} width={28} height={40} rx={12} fill={t.c} {...st(t)} /><rect x={64} y={52} width={28} height={40} rx={12} fill={t.c} {...st(t)} /></g> },
  { id: 'oculos', name: 'Óculos redondos', slot: 'eyes', defaultColor: '#2f2a55', draw: (t) => <g fill="rgba(255,255,255,0.25)" stroke={t.c} strokeWidth={6}><circle cx={-38} cy={0} r={30} /><circle cx={38} cy={0} r={30} /><path d="M-8,-4 Q0,-12 8,-4" fill="none" /></g> },
  { id: 'oculos-sol', name: 'Óculos escuros', slot: 'eyes', defaultColor: '#2f2a55', draw: (t) => <g><path d="M-74,-14 H-6 C-6,20 -64,26 -72,4Z M6,-14 H74 C72,4 64,26 6,20Z" fill={t.c} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M-6,-10 H6" stroke={INK} strokeWidth={5} /><path d="M-60,-6 l12,0 M18,-6 l12,0" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.6} /></g> },
  { id: 'monoculo', name: 'Monóculo', slot: 'eyes', defaultColor: '#ffd23f', draw: (t) => <g><circle cx={38} cy={0} r={31} fill="rgba(255,255,255,0.2)" stroke={t.c} strokeWidth={6} /><path d="M66,12 C76,40 70,70 60,90" fill="none" stroke={t.c} strokeWidth={3} /></g> },
  { id: 'mascara', name: 'Máscara de herói', slot: 'eyes', defaultColor: '#e2304f', draw: (t) => <path d="M-80,-6 C-60,-30 -20,-24 0,-12 C20,-24 60,-30 80,-6 C70,24 30,30 0,12 C-30,30 -70,24 -80,-6Z M-56,-2 a18,14 0 1,0 36,0 a18,14 0 1,0 -36,0Z M20,-2 a18,14 0 1,0 36,0 a18,14 0 1,0 -36,0Z" fill={t.c} fillRule="evenodd" stroke={INK} strokeWidth={4} strokeLinejoin="round" /> },
  { id: 'gravata', name: 'Gravata-borboleta', slot: 'neck', defaultColor: '#e2304f', draw: (t) => <g><path d="M0,0 L-30,-16 L-30,16Z M0,0 L30,-16 L30,16Z" fill={t.c} {...st(t, 4.5)} /><circle r={8} fill={shade(t.c, 0.2)} stroke={INK} strokeWidth={4} /></g> },
  { id: 'cachecol', name: 'Cachecol', slot: 'neck', defaultColor: '#ff9a3c', draw: (t) => <g><path d="M-70,-10 Q0,20 70,-10 L70,8 Q0,40 -70,8Z" fill={t.c} {...st(t)} /><path d="M30,12 L44,64 L24,66 L16,16Z" fill={t.c} {...st(t)} /><path d="M-40,2 v14 M-10,8 v16 M20,6 v16" stroke={shade(t.c, 0.25)} strokeWidth={5} /></g> },
  { id: 'colar', name: 'Colar de pérolas', slot: 'neck', defaultColor: '#fff6f0', draw: (t) => <g>{Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.15 + (i * 0.7) / 8); return <circle key={i} cx={Math.cos(a) * -64} cy={Math.sin(a) * 26 - 6} r={8} fill={t.c} stroke={INK} strokeWidth={3} />; })}</g> },
  { id: 'medalha', name: 'Estrela de xerife', slot: 'neck', defaultColor: '#ffd23f', draw: (t) => <g transform="translate(-34 40)"><path d={starPathAt(0, 0, 20)} fill={t.c} {...st(t, 4)} /><circle r={5} fill={shade(t.c, 0.2)} /></g> },
  { id: 'coracao', name: 'Broche de coração', slot: 'neck', defaultColor: '#ff5c7a', draw: (t) => <g transform="translate(-34 40)"><path d={heartPathAt(0, 0, 16)} fill={t.c} {...st(t, 4)} /></g> },
  { id: 'capa', name: 'Capa de herói', slot: 'back', defaultColor: '#e2304f', draw: (t) => <path d="M-64,-6 Q0,10 64,-6 C80,60 96,120 110,150 Q0,170 -110,150 C-96,120 -80,60 -64,-6Z" fill={t.c} {...st(t)} /> },
  { id: 'pena-dourada', name: 'Pena dourada', slot: 'top', defaultColor: '#ffd23f', unlock: 'tesouro-pena', draw: (t) => <g transform="translate(28 0) rotate(20)"><path d="M0,0 C-20,-30 -16,-70 0,-96 C16,-70 20,-30 0,0Z" fill={t.c} {...st(t, 4)} /><path d="M0,-4 V-90 M0,-30 l-10,-10 M0,-50 l10,-10 M0,-70 l-8,-8" stroke={shade(t.c, 0.3)} strokeWidth={3} strokeLinecap="round" /></g> },
  { id: 'cristal-magico', name: 'Cristal mágico', slot: 'neck', defaultColor: '#45d9d0', unlock: 'tesouro-cristal', draw: (t) => <g><path d="M-50,-8 Q0,24 50,-8" fill="none" stroke={INK} strokeWidth={4} /><path d="M0,8 L-14,26 L0,52 L14,26Z" fill={t.c} {...st(t, 4)} /><path d="M-6,22 L0,12" stroke="#fff" strokeWidth={3} strokeLinecap="round" /></g> },
];

// Texturas (desenhos na pele). Usadas como <pattern> dentro do SVG.
export interface TextureDef {
  id: string;
  name: string;
  pattern?: (color: string) => ReactNode; // conteúdo de um ladrilho 40x40
  size?: number;
}
export const TEXTURES: TextureDef[] = [
  { id: 'liso', name: 'Lisinho' },
  { id: 'bolinhas', name: 'Bolinhas', pattern: (c) => <><circle cx={10} cy={10} r={6} fill={c} /><circle cx={30} cy={30} r={6} fill={c} /></> },
  { id: 'listras', name: 'Listras', pattern: (c) => <rect x={0} y={0} width={40} height={13} fill={c} /> },
  { id: 'manchas', name: 'Manchas', size: 90, pattern: (c) => <><path d="M10,14 C20,0 40,6 36,20 C34,34 14,34 10,14Z" fill={c} /><path d="M56,50 C70,40 86,52 80,66 C74,80 50,72 56,50Z" fill={c} /><path d="M16,62 C22,56 32,60 28,70 C24,78 12,72 16,62Z" fill={c} /></> },
  { id: 'estrelinhas', name: 'Estrelinhas', size: 50, pattern: (c) => <><path d={starPathAt(12, 12, 8)} fill={c} /><path d={starPathAt(36, 36, 6)} fill={c} /></> },
  { id: 'escamas', name: 'Escamas', size: 30, pattern: (c) => <><path d="M0,15 A15,15 0 0,0 30,15" fill="none" stroke={c} strokeWidth={3} /><path d="M-15,30 A15,15 0 0,0 15,30 M15,30 A15,15 0 0,0 45,30" fill="none" stroke={c} strokeWidth={3} /></> },
  { id: 'xadrez', name: 'Xadrez', pattern: (c) => <><rect x={0} y={0} width={20} height={20} fill={c} opacity={0.7} /><rect x={20} y={20} width={20} height={20} fill={c} opacity={0.7} /></> },
  { id: 'coracoes', name: 'Coraçõezinhos', size: 50, pattern: (c) => <><path d={heartPathAt(14, 14, 8)} fill={c} /><path d={heartPathAt(38, 38, 6)} fill={c} /></> },
  { id: 'pintinhas', name: 'Pintinhas', size: 24, pattern: (c) => <><circle cx={5} cy={6} r={2.4} fill={c} /><circle cx={17} cy={16} r={2} fill={c} /><circle cx={9} cy={20} r={1.6} fill={c} /></> },
  { id: 'zigue', name: 'Zigue-zague', size: 40, pattern: (c) => <path d="M0,20 L10,10 L20,20 L30,10 L40,20" fill="none" stroke={c} strokeWidth={5} strokeLinejoin="round" /> },
  { id: 'degrade', name: 'Degradê' },
];
