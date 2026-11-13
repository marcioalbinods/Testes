import { forwardRef, type ReactNode, type PointerEvent as RPE } from 'react';
import { BIOMES, SKIES, Lights, Weather, objById, GROUND_Y } from './scenery';
import type { SceneObj } from '../game/types';
import { INK } from './colors';

export interface Actor {
  key: string;
  y: number;
  z?: number;
  node: ReactNode;
}

export interface SceneProps {
  biome: string | null;
  sky: string;
  weather?: string;
  light?: string;
  objects: SceneObj[];
  actors?: Actor[];
  selected?: string | null;
  reacting?: Record<string, number>;
  onObjDown?: (uid: string, e: RPE<SVGGElement>) => void;
  onBgDown?: (e: RPE<SVGSVGElement>) => void;
  onMove?: (e: RPE<SVGSVGElement>) => void;
  onUp?: (e: RPE<SVGSVGElement>) => void;
  overlay?: ReactNode;
  className?: string;
  /** Mostra a área "chão" destacada (editor). */
  ghost?: boolean;
  title?: string;
}

const REACT_CLASS: Record<string, string> = { shake: 'sc-react', jump: 'sc-react-jump', splash: 'sc-react', glow: 'sc-react-jump', spin: 'sc-react', none: '' };

export function SceneObject({ o, selected, reactKey, onDown }: { o: SceneObj; selected?: boolean; reactKey?: number; onDown?: (uid: string, e: RPE<SVGGElement>) => void }) {
  const def = objById(o.type);
  if (!def) return null;
  const sx = o.s * (o.flip ? -1 : 1);
  const aliveCls = def.alive === 'sway' ? 'sc-sway' : def.alive === 'swayfast' ? 'sc-sway-fast' : def.alive === 'bob' ? 'sc-bob' : '';
  return (
    <g
      transform={`translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) rotate(${o.r}) scale(${sx} ${o.s})`}
      onPointerDown={onDown ? (e) => onDown(o.uid, e) : undefined}
      style={{ cursor: onDown ? 'pointer' : undefined }}
      data-obj={o.uid}
      data-type={o.type}
    >
      <rect x={-def.w / 2 - 8} y={-def.h - 8} width={def.w + 16} height={def.h + 16} fill="transparent" />
      <g className={aliveCls} style={{ animationDelay: `${(o.x % 7) * -0.4}s` }}>
        <g key={reactKey} className={reactKey ? REACT_CLASS[def.react] : undefined}>
          {def.draw(o.color ?? undefined)}
        </g>
      </g>
      {selected && (
        <rect x={-def.w / 2 - 10} y={-def.h - 10} width={def.w + 20} height={def.h + 20} rx={14} fill="none" stroke="#ffc93c" strokeWidth={5 / Math.abs(o.s)} strokeDasharray={`${14 / Math.abs(o.s)} ${8 / Math.abs(o.s)}`} />
      )}
    </g>
  );
}

/** Desenha um cenário completo em 1000 x 600. */
export const SceneView = forwardRef<SVGSVGElement, SceneProps>(function SceneView(
  { biome, sky, weather = 'sol', light = 'nenhuma', objects, actors = [], selected, reacting = {}, onObjDown, onBgDown, onMove, onUp, overlay, className, ghost, title },
  ref,
) {
  const b = BIOMES.find((x) => x.id === biome) ?? BIOMES[0];
  const sk = SKIES.find((x) => x.id === sky) ?? SKIES.find((x) => x.id === b.sky) ?? SKIES[0];
  const items: { key: string; order: number; node: ReactNode }[] = [];
  for (const o of objects) items.push({ key: o.uid, order: o.z * 10000 + o.y, node: <SceneObject key={o.uid} o={o} selected={selected === o.uid} reactKey={reacting[o.uid]} onDown={onObjDown} /> });
  for (const a of actors) items.push({ key: a.key, order: (a.z ?? 0) * 10000 + a.y, node: <g key={a.key}>{a.node}</g> });
  items.sort((p, q) => p.order - q.order);
  const gid = `sky-${sk.id}`;
  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 600"
      className={`sc block h-full w-full touch-none select-none ${className ?? ''}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={onBgDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="img"
      aria-label={title ?? `Cenário: ${b.name}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sk.top} />
          <stop offset="1" stopColor={sk.bottom} />
        </linearGradient>
        <linearGradient id={`ground-${b.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={b.ground} />
          <stop offset="1" stopColor={b.ground} stopOpacity={0.85} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1000} height={600} fill={`url(#${gid})`} />
      {sk.deco?.()}
      {b.back()}
      <path d={`M0,${GROUND_Y} C200,${GROUND_Y - 14} 400,${GROUND_Y + 10} 600,${GROUND_Y - 6} C800,${GROUND_Y - 18} 900,${GROUND_Y} 1000,${GROUND_Y - 8} L1000,600 L0,600Z`} fill={`url(#ground-${b.id})`} stroke={INK} strokeWidth={4} />
      {ghost && <rect x={0} y={GROUND_Y} width={1000} height={220} fill="#fff" opacity={0.06} />}
      {b.underwater && <rect x={0} y={0} width={1000} height={600} fill="#1fb5c7" opacity={0.08} />}
      {items.map((i) => i.node)}
      <g pointerEvents="none">
        <Weather id={weather} />
        <Lights id={light} />
      </g>
      {sk.dark && light === 'nenhuma' && <rect x={0} y={0} width={1000} height={600} fill="#120c33" opacity={0.18} pointerEvents="none" />}
      {overlay}
    </svg>
  );
});
