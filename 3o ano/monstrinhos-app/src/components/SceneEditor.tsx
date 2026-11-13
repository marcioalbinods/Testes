import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE } from 'react';
import type { SceneObj } from '../game/types';
import { objById, OBJECTS, GROUND_Y, type ObjCat } from '../art/scenery';
import { svgPoint, uid, clamp } from '../lib/util';
import { sfx } from '../lib/audio';
import { IconBtn, Palette, toast } from './ui';

export const MAX_OBJECTS = 60;

/**
 * Lógica de edição de cenário (arrastar, redimensionar, girar, duplicar,
 * excluir, camadas, desfazer). Usada no habitat, na tempestade e na festa.
 */
export function useSceneEditing(initial: SceneObj[], onCommit: (objs: SceneObj[]) => void, opts: { max?: number } = {}) {
  const max = opts.max ?? MAX_OBJECTS;
  const [objs, setObjs] = useState<SceneObj[]>(initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<SceneObj[][]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ uid: string; dx: number; dy: number; start: SceneObj[]; moved: boolean } | null>(null);
  const objsRef = useRef(objs);
  objsRef.current = objs;

  // dados externos mudaram (ex.: outro aparelho)
  const lastInitial = useRef(initial);
  useEffect(() => {
    if (initial !== lastInitial.current && !drag.current) {
      lastInitial.current = initial;
      setObjs(initial);
    }
  }, [initial]);

  const commit = useCallback((next: SceneObj[], record = true) => {
    if (record) setHistory((h) => [...h.slice(-39), objsRef.current]);
    setObjs(next);
    lastInitial.current = next;
    onCommit(next);
  }, [onCommit]);

  const add = useCallback((type: string, x = 380 + Math.random() * 240, y = GROUND_Y + 60 + Math.random() * 120) => {
    if (objsRef.current.length >= max) {
      toast(`Cabem até ${max} coisas. Apague alguma para colocar mais.`, '📦', 'warn');
      return null;
    }
    const def = objById(type);
    const o: SceneObj = { uid: uid(), type, x: clamp(x, 30, 970), y: clamp(y, 60, 598), s: 1, r: 0, flip: false, z: 0, color: def?.colorable ? null : undefined };
    sfx.place();
    commit([...objsRef.current, o]);
    setSelected(o.uid);
    return o;
  }, [commit, max]);

  const addAtClient = useCallback((type: string, cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return add(type);
    const r = svg.getBoundingClientRect();
    if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null;
    const p = svgPoint(svg, cx, cy);
    return add(type, p.x, p.y);
  }, [add]);

  const onObjDown = useCallback((id: string, e: RPE<SVGGElement>) => {
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const p = svgPoint(svg, e.clientX, e.clientY);
    const o = objsRef.current.find((x) => x.uid === id);
    if (!o) return;
    setSelected(id);
    sfx.tap();
    drag.current = { uid: id, dx: p.x - o.x, dy: p.y - o.y, start: objsRef.current, moved: false };
  }, []);

  const onMove = useCallback((e: RPE<SVGSVGElement>) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const p = svgPoint(svg, e.clientX, e.clientY);
    d.moved = true;
    setObjs((list) => list.map((o) => (o.uid === d.uid ? { ...o, x: clamp(p.x - d.dx, 10, 990), y: clamp(p.y - d.dy, 40, 600) } : o)));
  }, []);

  const onUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (d && d.moved) {
      setHistory((h) => [...h.slice(-39), d.start]);
      lastInitial.current = objsRef.current;
      onCommit(objsRef.current);
      sfx.place();
    }
  }, [onCommit]);

  const onBgDown = useCallback(() => setSelected(null), []);

  const edit = (fn: (o: SceneObj) => SceneObj) => {
    if (!selected) return;
    commit(objsRef.current.map((o) => (o.uid === selected ? fn(o) : o)));
  };
  const sel = objs.find((o) => o.uid === selected) ?? null;
  const zs = objs.map((o) => o.z);
  const actions = {
    dup: () => {
      if (!sel) return;
      if (objs.length >= max) return toast(`Cabem até ${max} coisas.`, '📦', 'warn');
      const c = { ...sel, uid: uid(), x: clamp(sel.x + 40, 10, 990), y: clamp(sel.y + 10, 40, 600) };
      sfx.place();
      commit([...objs, c]);
      setSelected(c.uid);
    },
    del: () => {
      if (!sel) return;
      sfx.remove();
      commit(objs.filter((o) => o.uid !== sel.uid));
      setSelected(null);
    },
    rot: (d: number) => edit((o) => ({ ...o, r: ((o.r + d + 540) % 360) - 180 })),
    scale: (d: number) => edit((o) => ({ ...o, s: clamp(+(o.s + d).toFixed(2), 0.4, 2.2) })),
    flip: () => edit((o) => ({ ...o, flip: !o.flip })),
    front: () => edit((o) => ({ ...o, z: Math.min(9, Math.max(...zs) + 1) })),
    back: () => edit((o) => ({ ...o, z: Math.max(-9, Math.min(...zs) - 1) })),
    color: (c: string | null) => edit((o) => ({ ...o, color: c })),
  };
  const undo = () => {
    if (!history.length) return;
    sfx.tap();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    commit(prev, false);
  };

  return { objs, setObjs, selected, setSelected, sel, svgRef, onObjDown, onMove, onUp, onBgDown, add, addAtClient, actions, undo, canUndo: history.length > 0, commit };
}

export type SceneEditing = ReturnType<typeof useSceneEditing>;

/** Barra de ferramentas do objeto selecionado. */
export function ObjToolbar({ ed, extra }: { ed: SceneEditing; extra?: React.ReactNode }) {
  const def = ed.sel ? objById(ed.sel.type) : null;
  const [colors, setColors] = useState(false);
  const on = !!ed.sel;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 border-t-4 border-ink bg-white/95 p-1.5">
      <span className="hidden px-1 text-sm font-bold sm:inline">{def ? `${def.icon} ${def.name}` : 'Toque num objeto'}</span>
      <IconBtn label="Desfazer" icon="↩️" onClick={ed.undo} disabled={!ed.canUndo} data-testid="scene-undo" />
      <IconBtn label="Diminuir" icon="➖" onClick={() => ed.actions.scale(-0.15)} disabled={!on} data-testid="obj-smaller" />
      <IconBtn label="Aumentar" icon="➕" onClick={() => ed.actions.scale(0.15)} disabled={!on} data-testid="obj-bigger" />
      <IconBtn label="Girar" icon="🔄" onClick={() => ed.actions.rot(15)} disabled={!on} data-testid="obj-rotate" />
      <IconBtn label="Espelhar" icon="🪞" onClick={ed.actions.flip} disabled={!on} />
      <IconBtn label="Duplicar" icon="⧉" onClick={ed.actions.dup} disabled={!on} data-testid="obj-dup" />
      <IconBtn label="Trazer para a frente" icon="⬆️" onClick={ed.actions.front} disabled={!on} data-testid="obj-front" />
      <IconBtn label="Mandar para trás" icon="⬇️" onClick={ed.actions.back} disabled={!on} data-testid="obj-back" />
      {def?.colorable && <IconBtn label="Cor" icon="🎨" onClick={() => setColors((v) => !v)} />}
      <IconBtn label="Excluir" icon="🗑️" variant="bubble" onClick={ed.actions.del} disabled={!on} data-testid="obj-del" />
      {extra}
      {colors && def?.colorable && ed.sel && (
        <div className="w-full p-1">
          <Palette value={ed.sel.color ?? null} allowNone onPick={(c) => ed.actions.color(c)} />
        </div>
      )}
    </div>
  );
}

/** Catálogo de objetos: tocar adiciona; arrastar solta no lugar. */
export function ObjCatalog({ cat, ed, cats, filter }: { cat: ObjCat | ObjCat[]; ed: SceneEditing; cats?: never; filter?: (id: string) => boolean }) {
  const [ghost, setGhostState] = useState<{ type: string; x: number; y: number; moved: boolean } | null>(null);
  const ghostRef = useRef(ghost);
  const edRef = useRef(ed);
  edRef.current = ed;
  const list = OBJECTS.filter((o) => (Array.isArray(cat) ? cat.includes(o.cat) : o.cat === cat) && (!filter || filter(o.id)));
  void cats;
  // Os ouvintes são registrados já no toque (funciona mesmo com toques bem rápidos).
  const begin = (type: string, e: React.PointerEvent) => {
    e.preventDefault();
    const g0 = { type, x: e.clientX, y: e.clientY, moved: false };
    ghostRef.current = g0;
    setGhostState(g0);
    const mv = (ev: PointerEvent) => {
      const g = ghostRef.current;
      if (!g) return;
      const n = { ...g, x: ev.clientX, y: ev.clientY, moved: g.moved || Math.hypot(ev.clientX - g0.x, ev.clientY - g0.y) > 8 };
      ghostRef.current = n;
      setGhostState(n);
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const g = ghostRef.current;
      ghostRef.current = null;
      setGhostState(null);
      if (!g || ev.type === 'pointercancel') return;
      if (g.moved) edRef.current.addAtClient(g.type, ev.clientX, ev.clientY);
      else edRef.current.add(g.type);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };
  return (
    <>
      <div className="grid-fill">
        {list.map((o) => (
          <button
            key={o.id}
            type="button"
            className="tile touch-none !p-1"
            onPointerDown={(e) => begin(o.id, e)}
            data-testid={`obj-${o.id}`}
            aria-label={`Colocar ${o.name}`}
          >
            <svg viewBox={`${-o.w / 2 - 10} ${-o.h - 10} ${o.w + 20} ${o.h + 20}`} className="h-12 w-full" aria-hidden>{o.draw()}</svg>
            <span className="text-[11px] font-bold leading-tight">{o.name}</span>
          </button>
        ))}
      </div>
      {ghost && ghost.moved && (
        <div className="pointer-events-none fixed z-50 h-20 w-20 -translate-x-1/2 -translate-y-3/4 opacity-80" style={{ left: ghost.x, top: ghost.y }}>
          {(() => { const o = objById(ghost.type)!; return <svg viewBox={`${-o.w / 2 - 10} ${-o.h - 10} ${o.w + 20} ${o.h + 20}`} className="h-full w-full">{o.draw()}</svg>; })()}
        </div>
      )}
    </>
  );
}
