import type { ReactNode } from 'react';
import { SceneView, type Actor } from '../../art/SceneView';
import { MonsterInScene } from '../../art/Monster';
import { FACE_PRESETS, NEUTRAL_FACE } from '../../art/faces';
import { BIOMES } from '../../art/scenery';
import { INK } from '../../art/colors';
import { NPCS } from '../../game/npcs';
import { FOREST } from '../adventures/Forest';
import type { Balloon, Frame, GameData, MonsterState, SceneObj, SceneRef, StoryChar } from '../../game/types';
import { uid } from '../../lib/util';

const o = (t: string, x: number, y: number, s = 1, extra: Partial<SceneObj> = {}): SceneObj => ({ uid: `${t}-${x}-${y}`, type: t, x, y, s, r: 0, flip: false, z: -1, ...extra });

/** Cenários prontos (um para cada mundo), para quem não quer usar o habitat. */
const BIOME_DECOR: Record<string, SceneObj[]> = {
  floresta: [o('arvore', 120, 420), o('pinheiro', 880, 410), o('flor', 300, 470), o('arbusto', 700, 450)],
  mar: [o('coral', 150, 470), o('alga', 820, 460), o('estrela-mar', 650, 560), o('peixe', 300, 260)],
  montanhas: [o('pinheiro', 100, 420), o('rochedo', 860, 430), o('grama', 400, 470)],
  deserto: [o('cacto', 140, 440), o('duna', 820, 440), o('camelo', 640, 420, 0.8)],
  espaco: [o('nave', 820, 300), o('cristal-gigante', 140, 450), o('alien', 640, 430, 0.8)],
  ilha: [o('palmeira', 140, 430), o('palmeira', 880, 420, 0.9, { flip: true }), o('estrela-mar', 520, 560)],
  gelo: [o('iglu', 830, 430), o('pinguim', 160, 450), o('pinheiro', 640, 410, 0.8, { color: '#cfe6ff' })],
};

export const ADVENTURE_SCENES = [
  { id: 'floresta-misteriosa', name: 'Floresta misteriosa', icon: '🔎' },
  { id: 'colina', name: 'Colina do Pipoca', icon: '⛰️' },
  { id: 'ponte', name: 'O rio da ponte', icon: '🌉' },
  { id: 'festa', name: 'A festa', icon: '🎉' },
  { id: 'tempestade', name: 'A tempestade', icon: '⛈️' },
];
export const COLOR_SCENES = [
  { id: 'rosa', name: 'Rosa', icon: '🩷', top: '#ffd0e6', bottom: '#ff8fc7' },
  { id: 'ceu', name: 'Azul', icon: '💙', top: '#cdeeff', bottom: '#7cc9ff' },
  { id: 'sol', name: 'Amarelo', icon: '💛', top: '#fff7c2', bottom: '#ffd23f' },
  { id: 'noite', name: 'Noite', icon: '🖤', top: '#231a52', bottom: '#5b3fd1' },
  { id: 'menta', name: 'Verde', icon: '💚', top: '#e3ffef', bottom: '#8ff0c9' },
];

export function sceneName(ref: SceneRef | null) {
  if (!ref) return '—';
  if (ref.kind === 'habitat') return 'Meu habitat';
  if (ref.kind === 'biome') return BIOMES.find((b) => b.id === ref.id)?.name ?? ref.id;
  if (ref.kind === 'aventura') return ADVENTURE_SCENES.find((a) => a.id === ref.id)?.name ?? ref.id;
  return COLOR_SCENES.find((c) => c.id === ref.id)?.name ?? 'Cor';
}

export function resolveScene(ref: SceneRef, g: GameData) {
  const h = g.habitat;
  switch (ref.kind) {
    case 'habitat':
      return { biome: h.biome ?? 'floresta', sky: h.sky, weather: h.weather, light: h.light, objects: h.objects };
    case 'biome': {
      const b = BIOMES.find((x) => x.id === ref.id) ?? BIOMES[0];
      return { biome: b.id, sky: b.sky, weather: 'sol', light: 'nenhuma', objects: BIOME_DECOR[b.id] ?? [] };
    }
    case 'aventura':
      if (ref.id === 'floresta-misteriosa') return { biome: 'floresta', sky: 'entardecer', weather: 'sol', light: 'vagalumes', objects: FOREST.map((x) => ({ ...x, z: -1 })) };
      if (ref.id === 'colina') return { biome: 'montanhas', sky: 'dia', weather: 'nuvens', light: 'nenhuma', objects: [o('pinheiro', 80, 420), o('arvore', 230, 400, 0.8), o('pedra', 640, 470), o('casa', 900, 380, 0.6)] };
      if (ref.id === 'ponte') return { biome: 'ilha', sky: 'dia', weather: 'sol', light: 'nenhuma', objects: [o('rio', 500, 520, 1.6), o('palmeira', 120, 430), o('ponte', 500, 470, 1.2)] };
      if (ref.id === 'festa') return { biome: h.biome ?? 'floresta', sky: 'noite', weather: 'sol', light: 'festa', objects: [...g.adventures.party.decorations.map((x) => ({ ...x, z: -1 })), o('baloes', 120, 440), o('bolo', 880, 470)] };
      return { biome: h.biome ?? 'floresta', sky: 'nublado', weather: 'tempestade', light: 'nenhuma', objects: (g.adventures.storm.objects.length ? g.adventures.storm.objects : h.objects).map((x) => ({ ...x, z: -1 })) };
    default:
      return null;
  }
}

export function charMonster(who: string, g: GameData): MonsterState {
  if (who === 'eu') return g.monster;
  return NPCS.find((n) => n.id === who)?.m ?? g.monster;
}
export function charName(who: string, g: GameData) {
  if (who === 'eu') return g.monster.name || 'Meu monstrinho';
  return NPCS.find((n) => n.id === who)?.name ?? who;
}
export function faceById(id: string, g: GameData) {
  return FACE_PRESETS.find((f) => f.id === id)?.face ?? g.life.expressions.find((e) => e.id === id)?.face ?? NEUTRAL_FACE;
}

// ------------------------------------------------------------------ balões
export function wrap(text: string, max = 18) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 5);
}

export function BalloonArt({ b, shownChars, selected, onDown }: { b: Balloon; shownChars?: number; selected?: boolean; onDown?: (e: React.PointerEvent<SVGGElement>) => void }) {
  const text = shownChars === undefined ? b.text : b.text.slice(0, shownChars);
  const lines = wrap(b.text || ' ', b.kind === 'legenda' ? 34 : 18);
  const shown = wrap(text || ' ', b.kind === 'legenda' ? 34 : 18);
  const fs = b.kind === 'grito' ? 30 : 26;
  const w = Math.max(120, Math.max(...lines.map((l) => l.length)) * fs * 0.56 + 44);
  const hgt = lines.length * fs * 1.15 + 34;
  const x = b.x - w / 2;
  const y = b.y - hgt / 2;
  const tailX = b.tail === 'esquerda' ? b.x - w * 0.25 : b.x + w * 0.25;
  let shape: ReactNode;
  if (b.kind === 'pensamento') {
    shape = (
      <g>
        <rect x={x} y={y} width={w} height={hgt} rx={hgt / 2} fill="#fff" stroke={INK} strokeWidth={4} />
        {b.tail !== 'nenhuma' && <><circle cx={tailX} cy={y + hgt + 14} r={10} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={tailX + (b.tail === 'esquerda' ? -14 : 14)} cy={y + hgt + 36} r={6} fill="#fff" stroke={INK} strokeWidth={3} /></>}
      </g>
    );
  } else if (b.kind === 'grito') {
    const pts: string[] = [];
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = i % 2 ? 1 : 1.16;
      pts.push(`${(b.x + Math.cos(a) * (w / 2 + 8) * r).toFixed(0)},${(b.y + Math.sin(a) * (hgt / 2 + 8) * r).toFixed(0)}`);
    }
    shape = <polygon points={pts.join(' ')} fill="#fff07a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
  } else if (b.kind === 'legenda') {
    shape = <rect x={x} y={y} width={w} height={hgt} rx={8} fill="#fff7c2" stroke={INK} strokeWidth={4} />;
  } else {
    shape = (
      <g>
        {b.tail !== 'nenhuma' && <path d={`M${tailX - 14},${y + hgt - 4} L${tailX + (b.tail === 'esquerda' ? -24 : 24)},${y + hgt + 34} L${tailX + 14},${y + hgt - 4}Z`} fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />}
        <rect x={x} y={y} width={w} height={hgt} rx={22} fill="#fff" stroke={INK} strokeWidth={4} />
        {b.tail !== 'nenhuma' && <rect x={tailX - 12} y={y + hgt - 8} width={24} height={8} fill="#fff" />}
      </g>
    );
  }
  return (
    <g onPointerDown={onDown} style={{ cursor: onDown ? 'grab' : undefined }} data-balloon={b.uid}>
      {shape}
      {selected && <rect x={x - 8} y={y - 8} width={w + 16} height={hgt + 16} rx={20} fill="none" stroke="#ffc93c" strokeWidth={4} strokeDasharray="12 8" />}
      <text x={b.x} y={y + 24 + fs * 0.75} textAnchor="middle" fontSize={fs} fontWeight={700} fill={INK} fontFamily="Fredoka, sans-serif">
        {shown.map((l, i) => <tspan key={i} x={b.x} dy={i === 0 ? 0 : fs * 1.15}>{l}</tspan>)}
      </text>
    </g>
  );
}

// ------------------------------------------------------------------ quadro
export function FrameView({ frame, g, selected, onCharDown, onBalloonDown, onBgDown, onMove, onUp, svgRef, typing, still }: {
  frame: Frame;
  g: GameData;
  selected?: string | null;
  onCharDown?: (uid: string, e: React.PointerEvent<SVGGElement>) => void;
  onBalloonDown?: (uid: string, e: React.PointerEvent<SVGGElement>) => void;
  onBgDown?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onUp?: (e: React.PointerEvent<SVGSVGElement>) => void;
  svgRef?: React.Ref<SVGSVGElement>;
  typing?: number; // caracteres visíveis (player)
  still?: boolean;
}) {
  const sc = resolveScene(frame.scene, g);
  const actors: Actor[] = frame.chars.map((c: StoryChar) => ({
    key: c.uid,
    y: c.y,
    z: 2,
    node: (
      <g onPointerDown={onCharDown ? (e) => onCharDown(c.uid, e) : undefined} style={{ cursor: onCharDown ? 'grab' : undefined }} data-char={c.uid}>
        <rect x={c.x - 70 * c.s} y={c.y - 200 * c.s} width={140 * c.s} height={200 * c.s} fill="transparent" />
        <MonsterInScene m={charMonster(c.who, g)} x={c.x} y={c.y} h={230 * c.s} flip={c.flip} anim={still ? 'parado' : c.anim} still={still} face={faceById(c.face, g)} />
        {selected === c.uid && <rect x={c.x - 80 * c.s} y={c.y - 215 * c.s} width={160 * c.s} height={225 * c.s} rx={16} fill="none" stroke="#ffc93c" strokeWidth={4} strokeDasharray="12 8" />}
      </g>
    ),
  }));
  let budget = typing ?? Infinity;
  const balloons = frame.balloons.map((b) => {
    const n = Math.max(0, Math.min(b.text.length, budget));
    budget -= b.text.length;
    if (typing !== undefined && n <= 0) return null;
    return <BalloonArt key={b.uid} b={b} shownChars={typing === undefined ? undefined : n} selected={selected === b.uid} onDown={onBalloonDown ? (e) => onBalloonDown(b.uid, e) : undefined} />;
  });
  const caption = frame.caption.trim() ? (
    <g pointerEvents="none">
      <rect x={20} y={540} width={960} height={50} rx={12} fill="#fff7c2" stroke={INK} strokeWidth={4} opacity={0.95} />
      <text x={500} y={575} textAnchor="middle" fontSize={28} fontWeight={700} fill={INK} fontFamily="Fredoka, sans-serif">{frame.caption.slice(0, 70)}</text>
    </g>
  ) : null;
  if (!sc) {
    const c = COLOR_SCENES.find((x) => frame.scene.kind === 'cor' && x.id === frame.scene.id) ?? COLOR_SCENES[0];
    return (
      <svg ref={svgRef} viewBox="0 0 1000 600" className="sc block h-full w-full touch-none select-none" onPointerDown={onBgDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <defs><linearGradient id={`cg-${c.id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={c.top} /><stop offset="1" stopColor={c.bottom} /></linearGradient></defs>
        <rect width={1000} height={600} fill={`url(#cg-${c.id})`} />
        <ellipse cx={500} cy={590} rx={520} ry={70} fill="#fff" opacity={0.25} />
        {[...actors].sort((a, b) => a.y - b.y).map((a) => <g key={a.key}>{a.node}</g>)}
        {balloons}
        {caption}
      </svg>
    );
  }
  return (
    <SceneView
      ref={svgRef}
      biome={sc.biome}
      sky={sc.sky}
      weather={sc.weather}
      light={sc.light}
      objects={sc.objects}
      actors={actors}
      onBgDown={onBgDown}
      onMove={onMove}
      onUp={onUp}
      overlay={<g>{balloons}{caption}</g>}
    />
  );
}

export function newFrame(scene: SceneRef, cast: string[]): Frame {
  const chars: StoryChar[] = cast.slice(0, 2).map((who, i) => ({ uid: uid(), who, x: i === 0 ? 330 : 680, y: 540, s: 1, flip: i === 1, face: 'feliz', anim: 'parado' }));
  return { uid: uid(), scene, chars, balloons: [], caption: '', sound: null, narration: null, duration: 4, transition: 'aparecer' };
}
