/**
 * BANCADA VIRTUAL — Arduino Uno + protoboard + componentes + jumpers.
 *
 * Interações (mouse, caneta ou toque):
 *  - Escolha um componente na caixa de peças e toque em um furo para colocá-lo.
 *  - Arraste um componente para mudá-lo de lugar.
 *  - Ferramenta "Fio": toque em um furo/pino e depois em outro (ou arraste de um ao outro).
 *  - Toque em um fio ou componente para selecionar; use "Remover" ou a tecla Delete.
 *  - Ligue o cabo USB para alimentar a placa e rodar o programa.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Cable, Check, Eraser, FlipHorizontal2, Hand, Minus, MousePointer2, Play, Plus, Power, RotateCw, Trash2, Undo2, Volume2, VolumeX, Zap, AlertTriangle, Activity,
} from 'lucide-react';
import { ARDUINO_UNO, getPin, pinLabel } from '../lib/arduino';
import { allHoles, BB_HEIGHT, holeLabel, netOf, parseHole, type BreadboardConfig } from '../lib/breadboard';
import { LED_COLORS, legHoles, PART_DEFS, partLabel, placementError, formatOhms } from '../lib/circuit/parts';
import { ma, type Analysis } from '../lib/circuit/engine';
import { runRules, type CheckResult, type Rule } from '../lib/circuit/checks';
import type { Circuit, Endpoint, LedColor, PartKind, PlacedPart, Wire, WireColor } from '../lib/circuit/types';
import { checkCode } from '../lib/cpp/check';
import { Simulator } from '../lib/sim/simulator';
import { ArduinoDefs, ArduinoGroup } from '../svg/ArduinoUno';
import { Breadboard, BreadboardDefs } from '../svg/Breadboard';
import { PartGraphic, PartsDefs } from '../svg/Parts';
import { CodeBlock } from './ui';
import { useProgress } from '../lib/progress';

export const AX = 8;
export const AY = 64;
export const BX = 312;
export const BY = 72;
const VIEW = { x: -14, y: 0, w: 664, h: 336 };

export const WIRE_HEX: Record<WireColor, string> = {
  red: '#e03131', black: '#2b2b33', blue: '#2f6bff', green: '#16a34a', yellow: '#f2b600', orange: '#f76b15', white: '#e9ecef', purple: '#8b5cf6',
};
const WIRE_NAMES: Record<WireColor, string> = { red: 'vermelho', black: 'preto', blue: 'azul', green: 'verde', yellow: 'amarelo', orange: 'laranja', white: 'branco', purple: 'roxo' };

export const PALETTE_INFO: Record<PartKind, { label: string; emoji: string }> = {
  led: { label: 'LED', emoji: '💡' },
  resistor: { label: 'Resistor', emoji: '〰️' },
  button: { label: 'Botão', emoji: '🔘' },
  buzzer: { label: 'Buzzer', emoji: '🔊' },
  pot: { label: 'Potenciômetro', emoji: '🎚️' },
  ldr: { label: 'LDR (luz)', emoji: '☀️' },
  servo: { label: 'Servo motor', emoji: '⚙️' },
  ultrasonic: { label: 'Ultrassônico', emoji: '📡' },
};

export interface BenchProgram {
  id: string;
  title: string;
  code: string;
}

export interface BenchProps {
  circuit: Circuit;
  onChange?: (c: Circuit) => void;
  editable?: boolean;
  palette?: PartKind[];
  programs?: BenchProgram[];
  rules?: Rule[];
  onCheck?: (r: CheckResult) => void;
  /** ids visíveis (demonstração passo a passo) */
  visibleIds?: string[] | null;
  /** ids destacados (passo atual) */
  highlightIds?: string[];
  /** liga a visão "caminho da eletricidade" ao abrir */
  defaultFlow?: boolean;
  /** começa com a placa ligada */
  autoPower?: boolean;
  /** esconde painéis laterais (modo apresentação) */
  bare?: boolean;
  zoom?: number;
  showCode?: boolean;
}

type Tool = { t: 'select' } | { t: 'wire' } | { t: 'erase' } | { t: 'place'; kind: PartKind };
type Sel = { t: 'part'; id: string } | { t: 'wire'; id: string } | null;
type Pt = { x: number; y: number };

let uid = 0;
const newId = (p: string) => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`;

/** Posição de uma ponta (furo ou pino da placa) no desenho da bancada. */
export function endpointPos(e: Endpoint): Pt | null {
  if (e.startsWith('ard:')) {
    const p = getPin(e.slice(4));
    return p ? { x: AX + p.x, y: AY + p.y } : null;
  }
  const h = parseHole(e);
  return h ? { x: BX + h.x, y: BY + h.y } : null;
}

export function wirePath(a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dist = Math.hypot(dx, b.y - a.y);
  const lift = Math.min(36, 6 + dist * 0.18);
  return `M${a.x} ${a.y} C ${a.x + dx * 0.2} ${a.y - lift}, ${b.x - dx * 0.2} ${b.y - lift}, ${b.x} ${b.y}`;
}

const CONNECT_POINTS: { id: Endpoint; x: number; y: number }[] = [
  ...ARDUINO_UNO.pins.filter((p) => p.id !== 'NC').map((p) => ({ id: `ard:${p.id}`, x: AX + p.x, y: AY + p.y })),
  ...allHoles().map((h) => ({ id: h.id, x: BX + h.x, y: BY + h.y })),
];

function nearestPoint(p: Pt, radius = 7, onlyHoles = false) {
  let best: (typeof CONNECT_POINTS)[number] | null = null;
  let bd = radius * radius;
  for (const c of CONNECT_POINTS) {
    if (onlyHoles && c.id.startsWith('ard:')) continue;
    const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

function nearestTerminal(p: Pt) {
  const n = nearestPoint(p, 9, true);
  return n && parseHole(n.id)?.kind === 'terminal' ? n.id : null;
}

const endpointName = (e: Endpoint) => (e.startsWith('ard:') ? pinLabel(e.slice(4)) : holeLabel(e));

/** Cor didática da tensão de um caminho: vermelho perto de 5 V, azul perto de 0 V. */
function voltageColor(v: number) {
  if (v > 4.2) return '#ff4d4f';
  if (v < 0.3) return '#2f6bff';
  if (v > 2.5) return '#ff9f43';
  return '#a259ff';
}

export function Bench({
  circuit, onChange, editable = true, palette, programs = [], rules, onCheck, visibleIds = null, highlightIds = [], defaultFlow = false,
  autoPower = false, bare = false, zoom: zoomProp, showCode = true,
}: BenchProps) {
  const { bump } = useProgress();
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<Simulator | null>(null);
  if (!simRef.current) simRef.current = new Simulator(circuit);
  const sim = simRef.current;

  const [tool, setTool] = useState<Tool>({ t: 'select' });
  const [sel, setSel] = useState<Sel>(null);
  const [wireColor, setWireColor] = useState<WireColor>('red');
  const [pending, setPending] = useState<Endpoint | null>(null);
  const [pointer, setPointer] = useState<Pt | null>(null);
  const [drag, setDrag] = useState<{ kind: 'part'; id: string; start: Pt; anchor: Pt; moved: boolean } | { kind: 'wireEnd'; id: string; end: 'a' | 'b' } | null>(null);
  const [powered, setPowered] = useState(autoPower);
  const [flow, setFlow] = useState(defaultFlow);
  const [electrons, setElectrons] = useState(false);
  const [muted, setMuted] = useState(false);
  const [zoom, setZoom] = useState(zoomProp ?? 1);
  const [history, setHistory] = useState<Circuit[]>([]);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [failCount, setFailCount] = useState(0);
  const [programId, setProgramId] = useState<string>(programs[0]?.id ?? '');
  const [, setFrame] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  /** interações "com as mãos" que não mudam a montagem: apertar botão, girar potenciômetro, luz, distância */
  const [live, setLive] = useState<Record<string, PlacedPart['props']>>({});

  useEffect(() => { if (zoomProp) setZoom(zoomProp); }, [zoomProp]);
  useEffect(() => { setFlow(defaultFlow); }, [defaultFlow]);

  // circuito visível (demonstração passo a passo)
  const shown: Circuit = useMemo(() => {
    const base = visibleIds ? { ...circuit, parts: circuit.parts.filter((p) => visibleIds.includes(p.id)), wires: circuit.wires.filter((w) => visibleIds.includes(w.id)) } : circuit;
    if (!Object.keys(live).length) return base;
    return { ...base, parts: base.parts.map((p) => (live[p.id] ? { ...p, props: { ...p.props, ...live[p.id] } } : p)) };
  }, [circuit, visibleIds, live]);
  const setLiveProp = (id: string, props: PlacedPart['props']) => setLive((l) => ({ ...l, [id]: { ...l[id], ...props } }));

  useEffect(() => { sim.setCircuit(shown); setFrame((f) => f + 1); }, [shown, sim]);

  // programa
  const program = programs.find((p) => p.id === programId) ?? null;
  const compiled = useMemo(() => (program ? checkCode(program.code) : null), [program]);
  useEffect(() => {
    sim.setProgram(compiled?.program ?? null);
    setFrame((f) => f + 1);
  }, [compiled, sim]);
  useEffect(() => { if (programs.length && !programs.find((p) => p.id === programId)) setProgramId(programs[0].id); }, [programs, programId]);

  useEffect(() => { sim.setPowered(powered); setFrame((f) => f + 1); }, [powered, sim]);
  useEffect(() => { setPowered(autoPower); }, [autoPower]);

  // laço de animação
  useEffect(() => {
    if (!powered) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = t - last;
      last = t;
      sim.step(dt);
      setFrame((f) => (f + 1) % 1e9);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [powered, sim]);

  const an: Analysis = sim.analysis();

  // som do buzzer (Web Audio)
  const audioRef = useRef<{ ctx: AudioContext; osc: OscillatorNode | null; gain: GainNode } | null>(null);
  const soundFreq = Object.values(an.parts).find((p) => p.sound)?.sound ?? null;
  useEffect(() => {
    const want = !muted && powered && soundFreq ? soundFreq : null;
    try {
      if (want) {
        if (!audioRef.current) {
          const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AC();
          const gain = ctx.createGain();
          gain.gain.value = 0.04;
          gain.connect(ctx.destination);
          audioRef.current = { ctx, osc: null, gain };
        }
        const a = audioRef.current;
        if (!a.osc) {
          a.osc = a.ctx.createOscillator();
          a.osc.type = 'square';
          a.osc.connect(a.gain);
          a.osc.start();
        }
        a.osc.frequency.setValueAtTime(want, a.ctx.currentTime);
      } else if (audioRef.current?.osc) {
        audioRef.current.osc.stop();
        audioRef.current.osc.disconnect();
        audioRef.current.osc = null;
      }
    } catch {
      /* áudio indisponível neste navegador */
    }
  }, [soundFreq, muted, powered]);
  useEffect(() => () => { try { audioRef.current?.osc?.stop(); audioRef.current?.ctx.close(); } catch { /* */ } }, []);

  /* ---------------- edição ---------------- */
  const commit = useCallback(
    (next: Circuit) => {
      if (!onChange) return;
      setHistory((h) => [...h.slice(-40), circuit]);
      onChange(next);
      setCheck(null);
    },
    [circuit, onChange],
  );
  const guardPower = () => {
    if (powered) {
      setPowered(false);
      setMsg('Na bancada de verdade: desligue o cabo USB antes de mexer nas conexões! Desligamos para você.');
      window.setTimeout(() => setMsg(null), 5000);
    }
  };
  const undo = () => {
    setHistory((h) => {
      if (!h.length || !onChange) return h;
      onChange(h[h.length - 1]);
      return h.slice(0, -1);
    });
    setSel(null);
  };
  const removeSel = () => {
    if (!sel) return;
    guardPower();
    if (sel.t === 'part') commit({ ...circuit, parts: circuit.parts.filter((p) => p.id !== sel.id) });
    else commit({ ...circuit, wires: circuit.wires.filter((w) => w.id !== sel.id) });
    setSel(null);
  };
  const updatePart = (id: string, patch: Partial<PlacedPart>, live = false) => {
    const next = { ...circuit, parts: circuit.parts.map((p) => (p.id === id ? { ...p, ...patch, props: { ...p.props, ...(patch.props ?? {}) } } : p)) };
    if (live && onChange) onChange(next);
    else commit(next);
  };

  const toSvg = (e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const r = pt.matrixTransform(m.inverse());
    return { x: r.x, y: r.y };
  };

  const ghost: PlacedPart | null = useMemo(() => {
    if (!pointer) return null;
    if (tool.t === 'place') {
      const h = nearestTerminal(pointer);
      if (!h) return null;
      const p = parseHole(h)!;
      const anchor = tool.kind === 'button' ? `e${p.col}` : h;
      return { id: '__ghost', kind: tool.kind, anchor, orient: 'h', props: defaultProps(tool.kind) };
    }
    if (drag?.kind === 'part' && drag.moved) {
      const part = circuit.parts.find((p) => p.id === drag.id);
      if (!part) return null;
      const target = { x: drag.anchor.x + pointer.x - drag.start.x, y: drag.anchor.y + pointer.y - drag.start.y };
      const h = nearestTerminal(target);
      if (!h) return null;
      const anchor = part.kind === 'button' ? `e${parseHole(h)!.col}` : h;
      return { ...part, id: '__ghost', anchor };
    }
    return null;
  }, [pointer, tool, drag, circuit.parts]);

  const onPointerMove = (e: React.PointerEvent) => setPointer(toSvg(e));

  const onPointerDown = (e: React.PointerEvent) => {
    if (!editable) return;
    const p = toSvg(e);
    setPointer(p);
    if (tool.t === 'wire') {
      const n = nearestPoint(p);
      if (!n) { setPending(null); return; }
      if (!pending) { setPending(n.id); return; }
      if (n.id !== pending) addWire(pending, n.id);
      setPending(null);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!editable) return;
    const p = toSvg(e);
    if (drag?.kind === 'part') {
      const part = circuit.parts.find((x) => x.id === drag.id);
      if (part && drag.moved && ghost) {
        const err = placementError(ghost);
        if (err) flash(err);
        else if (ghost.anchor !== part.anchor) { guardPower(); updatePart(part.id, { anchor: ghost.anchor }); }
      }
      if (!drag.moved) setSel({ t: 'part', id: drag.id });
      setDrag(null);
      return;
    }
    if (drag?.kind === 'wireEnd') {
      const n = nearestPoint(p);
      if (n) {
        guardPower();
        commit({ ...circuit, wires: circuit.wires.map((w) => (w.id === drag.id ? { ...w, [drag.end]: n.id } : w)) });
      }
      setDrag(null);
      return;
    }
    if (tool.t === 'wire' && pending) {
      const n = nearestPoint(p);
      if (n && n.id !== pending) {
        addWire(pending, n.id);
        setPending(null);
      }
      return;
    }
    if (tool.t === 'place' && ghost) {
      const err = placementError(ghost);
      if (err) { flash(err); return; }
      const occupied = occupiedBy(ghost);
      if (occupied) { flash(`Esse furo já está ocupado por ${occupied}. Escolha outro lugar.`); return; }
      guardPower();
      const id = newId(ghost.kind[0]);
      commit({ ...circuit, parts: [...circuit.parts, { ...ghost, id }] });
      setSel({ t: 'part', id });
      setTool({ t: 'select' });
    }
  };

  const occupiedBy = (part: PlacedPart) => {
    const holes = Object.values(legHoles(part) ?? {});
    for (const other of circuit.parts) {
      if (other.id === part.id) continue;
      const oh = Object.values(legHoles(other) ?? {});
      if (holes.some((h) => oh.includes(h))) return partLabel(other);
    }
    return null;
  };

  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 4000);
  };

  const addWire = (a: Endpoint, b: Endpoint) => {
    if (circuit.wires.some((w) => (w.a === a && w.b === b) || (w.a === b && w.b === a))) { flash('Já existe um fio ligando esses dois pontos.'); return; }
    guardPower();
    const id = newId('w');
    commit({ ...circuit, wires: [...circuit.wires, { id, a, b, color: wireColor }] });
  };

  const onPartDown = (part: PlacedPart, e: React.PointerEvent) => {
    e.stopPropagation();
    if (part.kind === 'button' && powered) {
      setLiveProp(part.id, { pressed: true });
      const up = () => {
        setLiveProp(part.id, { pressed: false });
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      };
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      return;
    }
    if (!editable) {
      setSel({ t: 'part', id: part.id });
      return;
    }
    if (tool.t === 'erase') {
      guardPower();
      commit({ ...circuit, parts: circuit.parts.filter((p) => p.id !== part.id) });
      return;
    }
    if (tool.t !== 'select') return;
    const p = toSvg(e);
    const legs = legHoles(part);
    const first = legs ? parseHole(Object.values(legs)[0]) : null;
    if (!first) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ kind: 'part', id: part.id, start: p, anchor: { x: BX + first.x, y: BY + first.y }, moved: false });
  };
  // marca "arrastou" quando o ponteiro se move o suficiente
  useEffect(() => {
    if (drag?.kind === 'part' && !drag.moved && pointer && Math.hypot(pointer.x - drag.start.x, pointer.y - drag.start.y) > 4) setDrag({ ...drag, moved: true });
  }, [pointer, drag]);

  const onWireDown = (w: Wire, e: React.PointerEvent) => {
    e.stopPropagation();
    if (!editable) return;
    if (tool.t === 'erase') {
      guardPower();
      commit({ ...circuit, wires: circuit.wires.filter((x) => x.id !== w.id) });
      return;
    }
    if (tool.t === 'select') setSel({ t: 'wire', id: w.id });
  };

  // teclado
  useEffect(() => {
    if (!editable) return;
    const on = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeSel(); }
      if (e.key === 'Escape') { setPending(null); setTool({ t: 'select' }); setSel(null); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  /* ---------------- verificação ---------------- */
  const doCheck = () => {
    if (!rules) return;
    const r = runRules(circuit, rules);
    setCheck(r);
    if (r.ok) {
      bump('circuitsOk');
      if (failCount > 0) bump('retries');
    } else setFailCount((n) => n + 1);
    onCheck?.(r);
  };

  /* ---------------- desenho ---------------- */
  const problemIds = new Set<string>([...(check?.problems.flatMap((p) => p.highlight) ?? []), ...(powered ? an.diagnostics.filter((d) => d.severity === 'danger').flatMap((d) => d.highlight) : [])]);
  const hlSet = new Set(highlightIds);
  const bbCfg: BreadboardConfig = { railsSplit: !!circuit.railsSplit };
  const usedPins = shown.wires.flatMap((w) => [w.a, w.b]).filter((x) => x.startsWith('ard:')).map((x) => x.slice(4));

  const netColors: Record<string, string> = {};
  if (flow && powered) {
    const seen = new Set<string>();
    for (const w of shown.wires) for (const e of [w.a, w.b]) if (!e.startsWith('ard:')) seen.add(netOf(e, bbCfg)!);
    for (const p of shown.parts) for (const h of Object.values(legHoles(p) ?? {})) seen.add(netOf(h, bbCfg)!);
    for (const n of seen) if (!an.floating(n)) netColors[n] = voltageColor(an.voltages[n] ?? 0);
  }

  const flowing = powered && (an.supplyCurrent > 0.0003 || Object.values(an.pinCurrents).some((i) => Math.abs(i) > 0.0003));
  const ledL = (() => {
    const st = sim.board.pins.D13;
    if (!powered || !st || st.mode !== 'OUTPUT') return 0;
    return st.pwm !== null ? st.pwm / 255 : st.value;
  })();

  const highlightHoles = [
    ...(pending && !pending.startsWith('ard:') ? [pending] : []),
    ...[...problemIds, ...hlSet].filter((id) => parseHole(id)),
  ];
  const highlightPins = [
    ...(pending?.startsWith('ard:') ? [pending.slice(4)] : []),
    ...[...problemIds, ...hlSet].filter((x) => x.startsWith('ard:')).map((x) => x.slice(4)),
  ];
  const hoverPoint = editable && tool.t === 'wire' && pointer ? nearestPoint(pointer) : null;

  const selPart = sel?.t === 'part' ? shown.parts.find((p) => p.id === sel.id) ?? null : null;
  const selWire = sel?.t === 'wire' ? circuit.wires.find((w) => w.id === sel.id) ?? null : null;
  const pal = palette ?? (Object.keys(PART_DEFS) as PartKind[]);
  const cursor = tool.t === 'wire' ? 'crosshair' : tool.t === 'place' ? 'copy' : tool.t === 'erase' ? 'not-allowed' : 'default';

  const stage = (
    <div className="bench-stage" style={{ overflow: zoom > 1 ? 'auto' : 'hidden' }}>
      <svg
        ref={svgRef}
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        style={{ width: `${zoom * 100}%`, cursor, touchAction: editable && (tool.t !== 'select' || drag) ? 'none' : 'pan-x pan-y' }}
        className="bench-svg"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setPointer(null)}
        role="application"
        aria-label="Bancada virtual com Arduino e protoboard"
      >
        <ArduinoDefs />
        <BreadboardDefs />
        <PartsDefs />
        <ArduinoGroup x={AX} y={AY} powered={powered} ledL={ledL} tx={powered && sim.serial.length > 0 && Math.floor(sim.time / 120) % 2 === 0} highlightPins={highlightPins} usedPins={usedPins} />
        <Breadboard x={BX} y={BY} cfg={bbCfg} highlight={highlightHoles} netColors={netColors} interactive={false} />
        {/* componentes */}
        <g transform={`translate(${BX} ${BY})`}>
          {shown.parts.map((part) => {
            const legs = legHoles(part);
            if (!legs) return null;
            const pos = Object.fromEntries(Object.entries(legs).map(([k, h]) => [k, parseHole(h)!]));
            const res = an.parts[part.id];
            const isDragging = drag?.kind === 'part' && drag.id === part.id && drag.moved;
            return (
              <g key={part.id} onPointerDown={(e) => onPartDown(part, e)} style={{ cursor: editable || part.kind === 'button' ? 'grab' : 'default', touchAction: editable || part.kind === 'button' ? 'none' : undefined }} opacity={isDragging ? 0.35 : 1} data-part={part.id}>
                <PartGraphic
                  part={part}
                  legs={pos}
                  bbBottom={BB_HEIGHT}
                  st={{
                    brightness: powered ? res?.brightness : 0,
                    sound: powered && !!res?.sound,
                    servoAngle: sim.servoAngles[part.id],
                    selected: sel?.t === 'part' && sel.id === part.id || hlSet.has(part.id),
                    problem: problemIds.has(part.id),
                  }}
                />
                {flow && powered && res && Math.abs(res.current) > 0.0003 && <PartFlowMark legs={Object.values(pos)} electrons={electrons} />}
              </g>
            );
          })}
          {ghost && (
            <g pointerEvents="none">
              <PartGraphic part={ghost} legs={Object.fromEntries(Object.entries(legHoles(ghost) ?? {}).map(([k, h]) => [k, parseHole(h)!]))} st={{ ghost: true }} bbBottom={BB_HEIGHT} />
            </g>
          )}
        </g>
        {/* fios */}
        {shown.wires.map((w) => {
          const a = endpointPos(w.a);
          const b = endpointPos(w.b);
          if (!a || !b) return null;
          const d = wirePath(a, b);
          const flowI = an.wires.find((x) => x.id === w.id)?.current ?? 0;
          const isSel = sel?.t === 'wire' && sel.id === w.id;
          const isProb = problemIds.has(w.id);
          const isHl = hlSet.has(w.id);
          const moving = flow && powered && Math.abs(flowI) > 0.0003;
          const forward = electrons ? flowI < 0 : flowI > 0;
          return (
            <g key={w.id} data-wire={w.id}>
              <path d={d} stroke="transparent" strokeWidth="12" fill="none" onPointerDown={(e) => onWireDown(w, e)} style={{ cursor: 'pointer' }} />
              {(isSel || isProb || isHl) && <path d={d} stroke={isProb ? '#e5484d' : '#ffd43b'} strokeWidth="7" fill="none" opacity=".55" strokeLinecap="round" pointerEvents="none" className={isHl ? 'pulse-stroke' : undefined} />}
              <path d={d} stroke="rgba(0,0,0,.35)" strokeWidth="3.8" fill="none" strokeLinecap="round" pointerEvents="none" />
              <path d={d} stroke={WIRE_HEX[w.color]} strokeWidth="2.6" fill="none" strokeLinecap="round" pointerEvents="none" />
              {moving && (
                <path
                  d={forward ? d : reversePath(a, b)}
                  stroke={electrons ? '#7fd3ff' : '#ffe14d'}
                  strokeWidth="2.2"
                  fill="none"
                  strokeDasharray="1.5 7"
                  strokeLinecap="round"
                  className="flow-dash"
                  style={{ animationDuration: `${Math.max(0.35, 1.6 - Math.log10(Math.abs(flowI) * 1000 + 1) * 0.6)}s` }}
                  pointerEvents="none"
                />
              )}
              <rect x={a.x - 2} y={a.y - 2} width="4" height="4" fill="#555" pointerEvents="none" />
              <rect x={b.x - 2} y={b.y - 2} width="4" height="4" fill="#555" pointerEvents="none" />
              {isSel && editable && (
                <>
                  {(['a', 'b'] as const).map((end) => {
                    const p = end === 'a' ? a : b;
                    return (
                      <circle
                        key={end}
                        cx={p.x}
                        cy={p.y}
                        r="5.5"
                        fill="#ffd43b"
                        stroke="#1d2550"
                        strokeWidth="1.4"
                        style={{ cursor: 'move', touchAction: 'none' }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          (e.target as Element).setPointerCapture?.(e.pointerId);
                          setDrag({ kind: 'wireEnd', id: w.id, end });
                        }}
                      />
                    );
                  })}
                </>
              )}
            </g>
          );
        })}
        {/* fio sendo puxado */}
        {pending && pointer && (() => {
          const a = endpointPos(pending);
          if (!a) return null;
          const b = hoverPoint ? { x: hoverPoint.x, y: hoverPoint.y } : pointer;
          return <path d={wirePath(a, b)} stroke={WIRE_HEX[wireColor]} strokeWidth="2.6" strokeDasharray="5 4" fill="none" pointerEvents="none" opacity=".85" />;
        })()}
        {drag?.kind === 'wireEnd' && pointer && (() => {
          const w = circuit.wires.find((x) => x.id === drag.id);
          if (!w) return null;
          const other = endpointPos(drag.end === 'a' ? w.b : w.a);
          if (!other) return null;
          return <path d={wirePath(other, pointer)} stroke={WIRE_HEX[w.color]} strokeWidth="2.6" strokeDasharray="5 4" fill="none" pointerEvents="none" />;
        })()}
        {hoverPoint && <circle cx={hoverPoint.x} cy={hoverPoint.y} r="5" fill="none" stroke="#7c4dff" strokeWidth="1.8" pointerEvents="none" />}
      </svg>
    </div>
  );

  if (bare) return <div className="bench bare">{stage}</div>;

  const pinState = Object.entries(sim.board.pins).filter(([, s]) => s.mode === 'OUTPUT' || s.mode === 'INPUT_PULLUP');

  return (
    <div className="bench">
      {/* barra de ferramentas */}
      <div className="bench-toolbar">
        {editable && (
          <>
            <div className="tool-group" role="group" aria-label="Ferramentas">
              <button className={`btn small ${tool.t === 'select' ? 'on' : 'ghost'}`} onClick={() => { setTool({ t: 'select' }); setPending(null); }} title="Selecionar e arrastar">
                <MousePointer2 size={16} /> Mover
              </button>
              <button className={`btn small ${tool.t === 'wire' ? 'on' : 'ghost'}`} onClick={() => { setTool({ t: 'wire' }); setSel(null); }} title="Criar fios (jumpers)">
                <Cable size={16} /> Fio
              </button>
              <button className={`btn small ${tool.t === 'erase' ? 'on' : 'ghost'}`} onClick={() => { setTool({ t: 'erase' }); setSel(null); setPending(null); }} title="Apagar peças e fios">
                <Eraser size={16} /> Apagar
              </button>
              <button className="btn small ghost" onClick={undo} disabled={!history.length} title="Desfazer (Ctrl+Z)">
                <Undo2 size={16} /> Desfazer
              </button>
            </div>
            {tool.t === 'wire' && (
              <div className="tool-group" role="group" aria-label="Cor do fio">
                {(Object.keys(WIRE_HEX) as WireColor[]).map((c) => (
                  <button key={c} className={`swatch ${wireColor === c ? 'on' : ''}`} style={{ background: WIRE_HEX[c] }} onClick={() => setWireColor(c)} aria-label={`Fio ${WIRE_NAMES[c]}`} title={`Fio ${WIRE_NAMES[c]}`} />
                ))}
              </div>
            )}
          </>
        )}
        <div className="spacer" />
        <div className="tool-group">
          <button className="btn small ghost icon" onClick={() => setZoom((z) => Math.max(1, +(z - 0.3).toFixed(1)))} aria-label="Diminuir zoom" disabled={zoom <= 1}><Minus size={16} /></button>
          <button className="btn small ghost icon" onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.3).toFixed(1)))} aria-label="Aumentar zoom"><Plus size={16} /></button>
        </div>
        <button className={`btn small ${flow ? 'warn' : 'ghost'}`} onClick={() => setFlow((f) => !f)} title="Mostrar o caminho da eletricidade">
          <Zap size={16} /> Caminho da eletricidade
        </button>
        <button className={`btn small ${powered ? 'success' : 'dark'}`} onClick={() => setPowered((p) => !p)} aria-pressed={powered}>
          <Power size={16} /> {powered ? 'USB ligado' : 'Ligar USB'}
        </button>
      </div>

      {editable && (
        <div className="bench-palette" role="group" aria-label="Caixa de peças">
          {pal.map((k) => (
            <button key={k} className={`piece ${tool.t === 'place' && tool.kind === k ? 'on' : ''}`} onClick={() => { setTool({ t: 'place', kind: k }); setSel(null); setPending(null); }}>
              <span aria-hidden>{PALETTE_INFO[k].emoji}</span> {PALETTE_INFO[k].label}
            </button>
          ))}
        </div>
      )}

      {editable && (
        <div className="bench-hint" aria-live="polite">
          {msg ? (
            <span className="warn-text"><AlertTriangle size={16} /> {msg}</span>
          ) : tool.t === 'place' ? (
            <span>Toque em um furo da protoboard para colocar: <strong>{PALETTE_INFO[tool.kind].label}</strong>{tool.kind === 'button' ? ' (ele fica sobre o canal central)' : ''}.</span>
          ) : tool.t === 'wire' ? (
            <span>{pending ? <>Agora toque no outro ponto. Começo: <strong>{endpointName(pending)}</strong></> : 'Toque em um furo ou pino da placa para começar o fio.'}</span>
          ) : tool.t === 'erase' ? (
            <span>Toque em um fio ou componente para apagar.</span>
          ) : (
            <span><Hand size={14} /> Arraste os componentes para mudar de lugar. Toque em uma peça ou fio para ver opções.{powered ? ' Com a placa ligada, toque no botão para apertá-lo.' : ''}</span>
          )}
        </div>
      )}
      {!editable && msg && <div className="bench-hint"><span className="warn-text">{msg}</span></div>}

      <div className="bench-body">
        {stage}
        <aside className="bench-side">
          {/* estado do circuito */}
          <div className={`circuit-status ${!powered ? 'off' : flowing ? 'on' : 'open'}`}>
            <Activity size={18} />
            <div>
              <strong>{!powered ? 'Placa desligada' : flowing ? 'Circuito fechado' : 'Circuito aberto'}</strong>
              <div className="small">
                {!powered ? 'Ligue o cabo USB para alimentar.' : flowing ? `A corrente circula. A placa fornece ${ma(an.supplyCurrent + Object.values(an.pinCurrents).filter((i) => i > 0).reduce((s, i) => s + i, 0))}.` : 'Não há caminho completo do + até o GND.'}
              </div>
            </div>
          </div>
          {powered && an.diagnostics.length > 0 && (
            <div className="diag-list">
              {an.diagnostics.slice(0, 4).map((d, i) => (
                <div key={i} className={`diag ${d.severity}`}>
                  <strong>{d.message}</strong>
                  {d.fix && <div className="small">{d.fix}</div>}
                </div>
              ))}
            </div>
          )}
          {flow && (
            <div className="legend small">
              <div><span className="lg-dot" style={{ background: electrons ? '#7fd3ff' : '#ffe14d' }} /> {electrons ? 'Elétrons: saem do − e vão para o +' : 'Corrente convencional: do + para o −'}</div>
              <div><span className="lg-bar" style={{ background: '#ff4d4f' }} /> perto de 5 V (alimentação)</div>
              <div><span className="lg-bar" style={{ background: '#a259ff' }} /> tensão intermediária</div>
              <div><span className="lg-bar" style={{ background: '#2f6bff' }} /> perto de 0 V (GND)</div>
              <label className="row small" style={{ gap: 6, marginTop: 4 }}>
                <input type="checkbox" checked={electrons} onChange={(e) => setElectrons(e.target.checked)} /> Mostrar o movimento dos elétrons
              </label>
              <div className="muted" style={{ marginTop: 4 }}>Demonstração didática baseada em um modelo simplificado do circuito.</div>
            </div>
          )}

          {/* inspetor */}
          {selPart && (
            <PartInspector
              part={selPart}
              an={an}
              powered={powered}
              editable={editable}
              onLive={(props) => setLiveProp(selPart.id, props)}
              onUpdate={(patch) => { guardPower(); setLive((l) => { const n = { ...l }; delete n[selPart.id]; return n; }); updatePart(selPart.id, patch); }}
              onRemove={removeSel}
            />
          )}
          {selWire && (
            <div className="inspector">
              <h4>Fio {WIRE_NAMES[selWire.color]}</h4>
              <p className="small">De <strong>{endpointName(selWire.a)}</strong><br />até <strong>{endpointName(selWire.b)}</strong></p>
              {editable && (
                <>
                  <div className="row" style={{ gap: 6 }}>
                    {(Object.keys(WIRE_HEX) as WireColor[]).map((c) => (
                      <button key={c} className={`swatch ${selWire.color === c ? 'on' : ''}`} style={{ background: WIRE_HEX[c] }} onClick={() => commit({ ...circuit, wires: circuit.wires.map((w) => (w.id === selWire.id ? { ...w, color: c } : w)) })} aria-label={`Cor ${WIRE_NAMES[c]}`} />
                    ))}
                  </div>
                  <p className="small muted">Arraste as bolinhas amarelas para mudar as pontas do fio.</p>
                  <button className="btn small danger" onClick={removeSel}><Trash2 size={16} /> Remover fio</button>
                </>
              )}
            </div>
          )}
          {!selPart && !selWire && (
            <div className="inspector muted small">{editable ? 'Toque em um componente ou fio para ver detalhes e medições.' : 'Toque em um componente para ver detalhes e medições. Com a placa ligada, toque no botão para apertá-lo.'}</div>
          )}

          {/* verificação */}
          {rules && editable && (
            <div className="check-box">
              <button className="btn primary" onClick={doCheck} style={{ width: '100%' }}>
                <Check size={18} /> Verificar montagem
              </button>
              {check && (
                <div className={`check-result ${check.ok ? 'ok' : 'no'}`} aria-live="polite">
                  {check.ok ? <strong>Montagem correta! 🎉</strong> : <strong>Quase lá! Veja o que corrigir:</strong>}
                  {check.passed.length > 0 && (
                    <ul className="passed">
                      {check.passed.map((p) => <li key={p}>✓ {p}</li>)}
                    </ul>
                  )}
                  {check.problems.length > 0 && (
                    <ul className="problems">
                      {check.problems.map((p) => (
                        <li key={p.message}>
                          <strong>{p.message}</strong>
                          {p.fix && <div>{p.fix}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {pinState.length > 0 && powered && (
            <div className="pin-states small">
              <strong>Pinos em uso</strong>
              <div className="row" style={{ gap: 6, marginTop: 6 }}>
                {pinState.map(([node, s]) => (
                  <span key={node} className={`chip ${s.mode === 'OUTPUT' ? (s.value || s.pwm || s.tone ? 'yellow' : 'gray') : 'green'}`}>
                    {Simulator.pinName(node)}: {s.mode === 'OUTPUT' ? (s.tone ? `tone ${s.tone} Hz` : s.pwm !== null ? `PWM ${s.pwm}` : s.value ? 'HIGH' : 'LOW') : 'entrada'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* programa */}
      {programs.length > 0 && showCode && (
        <div className="bench-program">
          <div className="row between">
            <div className="row">
              <strong style={{ fontFamily: 'var(--font-head)' }}>Programa carregado na placa:</strong>
              {programs.length > 1 ? (
                <select value={programId} onChange={(e) => setProgramId(e.target.value)} aria-label="Escolher programa">
                  {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              ) : (
                <span className="chip purple">{programs[0].title}</span>
              )}
            </div>
            <div className="row">
              {soundFreq !== null && powered && <span className="chip purple">♪ {Math.round(soundFreq)} Hz</span>}
              <button className="btn small ghost" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Ligar som' : 'Desligar som'}>
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />} {muted ? 'Som desligado' : 'Som ligado'}
              </button>
              <button className="btn small" onClick={() => { sim.restart(); setFrame((f) => f + 1); }} disabled={!powered}>
                <RotateCw size={16} /> Reiniciar (RESET)
              </button>
              {!powered && (
                <button className="btn small success" onClick={() => setPowered(true)}>
                  <Play size={16} /> Enviar e rodar
                </button>
              )}
            </div>
          </div>
          {compiled && compiled.errors.length > 0 && (
            <div className="diag danger mt">O programa tem erros e não pode rodar: {compiled.errors[0].message} (linha {compiled.errors[0].line})</div>
          )}
          {sim.error && <div className="diag danger mt">Erro ao executar (linha {sim.error.line}): {sim.error.message}</div>}
          <div className="program-grid mt">
            <CodeBlock code={program?.code ?? ''} highlight={powered && !sim.error ? [sim.currentLine] : []} errorLines={sim.error ? [sim.error.line] : []} maxHeight={320} />
            <div className="serial">
              <div className="serial-head">Monitor Serial</div>
              <pre aria-live="off">{sim.serial ? sim.serial.split('\n').slice(-14).join('\n') : powered ? '(nada recebido)' : '(placa desligada)'}</pre>
              <div className="small muted" style={{ padding: '6px 10px' }}>Tempo desde que ligou: {(sim.time / 1000).toFixed(1).replace('.', ',')} s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function reversePath(a: Pt, b: Pt) {
  return wirePath(b, a);
}

function PartFlowMark({ legs, electrons }: { legs: { x: number; y: number }[]; electrons: boolean }) {
  const xs = legs.map((l) => l.x);
  const ys = legs.map((l) => l.y);
  return <rect x={Math.min(...xs) - 6} y={Math.min(...ys) - 14} width={Math.max(...xs) - Math.min(...xs) + 12} height={Math.max(...ys) - Math.min(...ys) + 20} rx="6" fill="none" stroke={electrons ? '#7fd3ff' : '#ffe14d'} strokeWidth="1.4" strokeDasharray="2 4" className="flow-dash" pointerEvents="none" />;
}

export function defaultProps(kind: PartKind): PlacedPart['props'] {
  switch (kind) {
    case 'led': return { color: 'red' };
    case 'resistor': return { ohms: 220 };
    case 'pot': return { pos: 0.5 };
    case 'ldr': return { light: 0.7 };
    case 'ultrasonic': return { distance: 50 };
    case 'button': return { pressed: false };
    default: return {};
  }
}

const RESISTOR_VALUES = [100, 220, 330, 1000, 10000];

function PartInspector({ part, an, powered, editable, onUpdate, onLive, onRemove }: {
  part: PlacedPart; an: Analysis; powered: boolean; editable: boolean; onUpdate: (p: Partial<PlacedPart>) => void; onLive: (p: PlacedPart['props']) => void; onRemove: () => void;
}) {
  const def = PART_DEFS[part.kind];
  const res = an.parts[part.id];
  const legs = legHoles(part) ?? {};
  const v = (k: string) => an.voltages[netOf(legs[k], { railsSplit: false }) ?? ''] ?? 0;
  return (
    <div className="inspector">
      <h4>{partLabel(part)}</h4>
      <ul className="legs small">
        {def.legs.map((l) => (
          <li key={l.key}>{l.name}: <strong>{legs[l.key] ? holeLabel(legs[l.key]).replace('furo ', '') : '—'}</strong></li>
        ))}
      </ul>
      {powered && res && (part.kind === 'led' || part.kind === 'resistor' || part.kind === 'buzzer' || part.kind === 'ldr') && (
        <div className="meter small">
          <span>🔎 Medição (simulada):</span>
          <span>corrente {ma(res.current)}</span>
          <span>tensão {(Math.abs(v(def.legs[0].key) - v(def.legs[def.legs.length - 1].key))).toFixed(2).replace('.', ',')} V</span>
        </div>
      )}
      {part.kind === 'led' && (
        <label className="field small">Cor do LED
          <select value={part.props.color ?? 'red'} onChange={(e) => onUpdate({ props: { color: e.target.value as LedColor } })} disabled={!editable}>
            {(Object.keys(LED_COLORS) as LedColor[]).map((c) => <option key={c} value={c}>{LED_COLORS[c].name}</option>)}
          </select>
        </label>
      )}
      {part.kind === 'resistor' && (
        <label className="field small">Valor
          <select value={part.props.ohms ?? 220} onChange={(e) => onUpdate({ props: { ohms: Number(e.target.value) } })} disabled={!editable}>
            {RESISTOR_VALUES.map((r) => <option key={r} value={r}>{formatOhms(r)}</option>)}
          </select>
        </label>
      )}
      {part.kind === 'pot' && (
        <label className="field small">Girar o botão do potenciômetro
          <input type="range" min={0} max={1} step={0.01} value={part.props.pos ?? 0.5} onChange={(e) => onLive({ pos: Number(e.target.value) })} />
        </label>
      )}
      {part.kind === 'ldr' && (
        <label className="field small">Luz sobre o LDR: {Math.round((part.props.light ?? 0.5) * 100)}%
          <input type="range" min={0} max={1} step={0.01} value={part.props.light ?? 0.5} onChange={(e) => onLive({ light: Number(e.target.value) })} />
        </label>
      )}
      {part.kind === 'ultrasonic' && (
        <label className="field small">Distância do objeto: {part.props.distance ?? 50} cm
          <input type="range" min={2} max={300} step={1} value={part.props.distance ?? 50} onChange={(e) => onLive({ distance: Number(e.target.value) })} />
        </label>
      )}
      {part.kind === 'button' && (
        <button
          className={`btn small ${part.props.pressed ? 'warn' : ''}`}
          onPointerDown={() => onLive({ pressed: true })}
          onPointerUp={() => onLive({ pressed: false })}
          onPointerLeave={() => part.props.pressed && onLive({ pressed: false })}
          onPointerCancel={() => onLive({ pressed: false })}
        >
          {part.props.pressed ? 'Apertado!' : 'Segure para apertar'}
        </button>
      )}
      {editable && (
        <div className="row" style={{ gap: 6, marginTop: 8 }}>
          {def.rotatable && <button className="btn small ghost" onClick={() => onUpdate({ orient: part.orient === 'h' ? 'v' : 'h' })}><RotateCw size={15} /> Girar</button>}
          {def.flippable && <button className="btn small ghost" onClick={() => onUpdate({ flip: !part.flip })}><FlipHorizontal2 size={15} /> Inverter pernas</button>}
          <button className="btn small danger" onClick={onRemove}><Trash2 size={15} /> Remover</button>
        </div>
      )}
      {res && res.problems.length > 0 && powered && <p className="small" style={{ color: 'var(--red-600)', marginTop: 6 }}>Atenção: {res.problems.join(', ')}.</p>}
    </div>
  );
}

export { pinLabel };
