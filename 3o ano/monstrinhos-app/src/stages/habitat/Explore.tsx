import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { IconBtn } from '../../components/ui';
import { SceneView } from '../../art/SceneView';
import { MonsterInScene } from '../../art/Monster';
import { objById, GROUND_Y } from '../../art/scenery';
import { STAGES } from '../../game/missions';
import { playSound, sfx } from '../../lib/audio';
import { playSignature } from '../../lib/signature';
import { svgPoint, clamp } from '../../lib/util';
import type { AnimId, SceneObj } from '../../game/types';

const POP: Record<string, string> = { shake: 'Shhh!', jump: 'Boing!', splash: 'Tchibum!', glow: 'Uau!', spin: 'Wheee!', none: 'Oi!' };
const SPEED = 260; // unidades por segundo

/** Escala pela profundidade: mais embaixo = mais perto = maior. */
export const depthScale = (y: number) => 0.75 + ((y - GROUND_Y) / 220) * 0.5;

/** Movimentação do monstrinho em um cenário (teclado, botões e toque). */
export function useWalker(start: { x: number; y: number }, bounds = { minX: 40, maxX: 960, minY: GROUND_Y + 20, maxY: 585 }) {
  const [pos, setPos] = useState(start);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [moving, setMoving] = useState(false);
  const keys = useRef(new Set<string>());
  const target = useRef<{ x: number; y: number; done?: () => void } | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      let vx = 0;
      let vy = 0;
      const k = keys.current;
      if (k.has('left')) vx -= 1;
      if (k.has('right')) vx += 1;
      if (k.has('up')) vy -= 1;
      if (k.has('down')) vy += 1;
      if (vx || vy) target.current = null;
      if (!vx && !vy && target.current) {
        const dx = target.current.x - posRef.current.x;
        const dy = target.current.y - posRef.current.y;
        const d = Math.hypot(dx, dy);
        if (d < 8) {
          const done = target.current.done;
          target.current = null;
          done?.();
        } else {
          vx = dx / d;
          vy = dy / d;
        }
      }
      if (vx || vy) {
        const n = Math.hypot(vx, vy);
        const nx = clamp(posRef.current.x + (vx / n) * SPEED * dt, bounds.minX, bounds.maxX);
        const ny = clamp(posRef.current.y + (vy / n) * SPEED * 0.6 * dt, bounds.minY, bounds.maxY);
        if (vx) setFacing(vx > 0 ? 1 : -1);
        setPos({ x: nx, y: ny });
        setMoving(true);
      } else setMoving(false);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const map: Record<string, string> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      const m = map[e.key];
      if (m) {
        e.preventDefault();
        keys.current.add(m);
      }
    };
    const up = (e: KeyboardEvent) => {
      const m = map[e.key];
      if (m) keys.current.delete(m);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    const blur = () => keys.current.clear();
    window.addEventListener('blur', blur);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [bounds.maxX, bounds.maxY, bounds.minX, bounds.minY]);

  const press = (dir: string, on: boolean) => {
    if (on) keys.current.add(dir);
    else keys.current.delete(dir);
  };
  const walkTo = (x: number, y: number, done?: () => void) => {
    target.current = { x: clamp(x, bounds.minX, bounds.maxX), y: clamp(y, bounds.minY, bounds.maxY), done };
  };
  return { pos, setPos, facing, moving, press, walkTo };
}

/** Controles na tela (tablet). */
export function DPad({ press, extra }: { press: (d: string, on: boolean) => void; extra?: React.ReactNode }) {
  const B = ({ d, icon, label }: { d: string; icon: string; label: string }) => (
    <button
      type="button"
      aria-label={label}
      className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-ink bg-white/90 text-2xl font-bold shadow-chunky-sm active:translate-y-1 active:bg-sun"
      onPointerDown={(e) => { e.preventDefault(); (e.target as Element).setPointerCapture?.(e.pointerId); press(d, true); }}
      onPointerUp={() => press(d, false)}
      onPointerCancel={() => press(d, false)}
      onPointerLeave={() => press(d, false)}
      onContextMenu={(e) => e.preventDefault()}
      data-testid={`dpad-${d}`}
    >
      {icon}
    </button>
  );
  return (
    <div className="pointer-events-auto flex items-end gap-3">
      <div className="grid grid-cols-3 gap-1">
        <span />
        <B d="up" icon="▲" label="Para cima" />
        <span />
        <B d="left" icon="◀" label="Para a esquerda" />
        <span />
        <B d="right" icon="▶" label="Para a direita" />
        <span />
        <B d="down" icon="▼" label="Para baixo" />
        <span />
      </div>
      {extra}
    </div>
  );
}

export default function Explore({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const h = data.habitat;
  const svgRef = useRef<SVGSVGElement>(null);
  const w = useWalker({ x: 500, y: 500 });
  const [reacting, setReacting] = useState<Record<string, number>>({});
  const [pops, setPops] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [action, setAction] = useState<AnimId | null>(null);
  const cooldown = useRef<Record<string, number>>({});

  useEffect(() => {
    update('habitat', (s) => ({ ...s, explored: { ...s.explored, visits: s.explored.visits + 1 } }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const interact = useCallback((o: SceneObj, wait = 700) => {
    const def = objById(o.type);
    if (!def) return;
    const now = Date.now();
    if (now - (cooldown.current[o.uid] ?? 0) < wait) return;
    cooldown.current[o.uid] = now;
    playSound(def.sound, 0, 0.8);
    setReacting((r) => ({ ...r, [o.uid]: (r[o.uid] ?? 0) + 1 }));
    const id = now + Math.random();
    setPops((p) => [...p.slice(-4), { id, x: o.x, y: o.y - def.h * o.s - 20, text: POP[def.react] }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1200);
    update('habitat', (s) => ({ ...s, explored: { ...s.explored, interactions: s.explored.interactions + 1, touched: s.explored.touched.includes(o.type) ? s.explored.touched : [...s.explored.touched, o.type] } }));
  }, [update]);

  // encostar em objetos também faz eles reagirem
  useEffect(() => {
    for (const o of h.objects) {
      const def = objById(o.type);
      if (!def) continue;
      if (Math.abs(o.x - w.pos.x) < (def.w * o.s) / 2 + 20 && Math.abs(o.y - w.pos.y) < 40 && w.moving) interact(o, 4000);
    }
  }, [w.pos, w.moving, h.objects, interact]);

  const tapObj = (uid: string) => {
    const o = h.objects.find((x) => x.uid === uid);
    if (!o) return;
    sfx.tap();
    const dir = o.x > w.pos.x ? -1 : 1;
    w.walkTo(o.x + dir * ((objById(o.type)?.w ?? 80) * o.s * 0.5 + 30), Math.max(o.y, GROUND_Y + 30), () => interact(o));
  };
  const tapBg = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const p = svgPoint(svgRef.current, e.clientX, e.clientY);
    w.walkTo(p.x, p.y);
  };
  const doAction = (a: AnimId) => {
    setAction(a);
    if (a === 'pular') playSound('boing');
    else playSignature(data);
    setTimeout(() => setAction(null), 1400);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === ' ') { e.preventDefault(); doAction('pular'); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const anim: AnimId = action ?? (w.moving ? 'andar' : 'parado');
  const size = 150 * depthScale(w.pos.y);

  return (
    <ToolShell title="Explorar meu mundo" icon="🧭" color={STAGES[3].color} missionId={missionId}>
      <div className="relative h-full bg-night" data-testid="explore-scene">
        <SceneView
          ref={svgRef}
          biome={h.biome}
          sky={h.sky}
          weather={h.weather}
          light={h.light}
          objects={h.objects}
          reacting={reacting}
          onObjDown={(uid, e) => { e.stopPropagation(); tapObj(uid); }}
          onBgDown={tapBg}
          actors={[{ key: 'me', y: w.pos.y, node: <MonsterInScene m={data.monster} x={w.pos.x} y={w.pos.y} h={size} flip={w.facing < 0} anim={anim} /> }]}
          overlay={pops.map((p) => (
            <text key={p.id} x={p.x} y={p.y} textAnchor="middle" fontSize={34} fontWeight={700} fill="#fff" stroke="#2b1f4a" strokeWidth={6} paintOrder="stroke" className="m-float-up" style={{ animation: 'm-float-up 1.2s ease-out forwards' }}>{p.text}</text>
          ))}
        />
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between">
          <DPad press={w.press} />
          <div className="pointer-events-auto flex flex-col gap-2">
            <IconBtn label="Pular (espaço)" icon="🦘" variant="sun" onClick={() => doAction('pular')} data-testid="act-jump" />
            <IconBtn label="Fazer o som dele" icon="🔊" variant="aqua" onClick={() => doAction(data.life.favoriteAnim ?? 'comemorar')} />
          </div>
        </div>
        <div className="pointer-events-none absolute left-2 top-2 rounded-2xl border-[3px] border-ink bg-white/90 px-3 py-1 text-sm font-bold">
          👆 Toque nas coisas · ⌨️ setas para andar · Tocou em {h.explored.interactions}
        </div>
      </div>
    </ToolShell>
  );
}
