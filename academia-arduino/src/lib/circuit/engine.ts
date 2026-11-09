/**
 * Motor da simulação didática de circuitos.
 *
 * O que ele faz (e o que NÃO faz):
 *  - Resolve o circuito em corrente contínua por análise nodal (Leis de Kirchhoff e de Ohm).
 *  - Componentes são modelos simplificados: resistores ideais, LED como diodo com tensão
 *    de condução fixa, pinos do Arduino como fontes de 5 V / 0 V com pequena resistência interna.
 *  - Não simula capacitâncias, indutâncias, aquecimento, ruído ou o tempo de chaveamento.
 *  - Buzzer, servo e sensor ultrassônico seguem regras simples (ver comentários).
 *
 * É uma simulação EDUCATIVA: serve para mostrar se a montagem funciona e por quê.
 */
import { netOf } from '../breadboard';
import { ARDUINO_UNO, getPin, nodeToPinNumber } from '../arduino';
import { LED_COLORS, legHoles, PART_DEFS, partLabel } from './parts';
import type { Circuit, Endpoint, PlacedPart } from './types';
import { boardPinOf, isBoardEndpoint } from './types';

export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';

export interface PinState {
  mode: PinMode;
  /** nível lógico escrito com digitalWrite */
  value: 0 | 1;
  /** analogWrite (0–255) — null quando não está usando PWM */
  pwm: number | null;
  /** frequência de tone() em Hz — null quando sem som */
  tone: number | null;
}

export const defaultPin = (): PinState => ({ mode: 'INPUT', value: 0, pwm: null, tone: null });

export interface BoardState {
  /** Placa ligada (cabo USB conectado). */
  powered: boolean;
  /** Estado de cada pino, pelo nó ("D13", "A0" ...). */
  pins: Record<string, PinState>;
}

export const GND = 'GND';
const GMIN = 1e-9;
const R_WIRE = 0.01;
const R_PIN = 25; // resistência interna aproximada de um pino de saída do ATmega328P
const R_5V = 0.05;
const R_3V3 = 1;
const R_PULLUP = 35000;
const LED_RS = 15;
const R_BUZZER = 1000;
const R_SERVO = 100;
const R_SONAR = 333;

/** Converte a ponta de um fio ou uma perna para o nó elétrico. */
export function endpointNode(e: Endpoint, railsSplit = false): string | null {
  if (isBoardEndpoint(e)) {
    const p = getPin(boardPinOf(e));
    return p ? p.node : null;
  }
  return netOf(e, { railsSplit });
}

/* ---------------- União de conjuntos (para saber o que está ligado a quê) ---------------- */
class UF {
  parent = new Map<string, string>();
  find(a: string): string {
    if (!this.parent.has(a)) this.parent.set(a, a);
    let r = a;
    while (this.parent.get(r) !== r) r = this.parent.get(r)!;
    let x = a;
    while (this.parent.get(x) !== r) {
      const n = this.parent.get(x)!;
      this.parent.set(x, r);
      x = n;
    }
    return r;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
  same(a: string, b: string) {
    return this.find(a) === this.find(b);
  }
}

/* ---------------- Elementos elétricos ---------------- */
type Elem =
  | { t: 'R'; a: string; b: string; r: number; owner: string; role?: string }
  | { t: 'D'; a: string; k: string; vf: number; owner: string; on: boolean }
  | { t: 'S'; n: string; v: number; r: number; owner: string };

export interface LegInfo {
  key: string;
  hole: string;
  node: string;
}

export interface PartResult {
  id: string;
  label: string;
  legs: LegInfo[];
  /** corrente principal (A). Positiva = sentido "natural" do componente (ex.: ânodo→cátodo). */
  current: number;
  /** LED: brilho 0–1 */
  brightness?: number;
  /** buzzer: frequência tocando (Hz) */
  sound?: number | null;
  /** servo: ligado e recebendo sinal */
  servoOk?: boolean;
  /** sensor ultrassônico alimentado */
  powered?: boolean;
  /** problemas encontrados neste componente */
  problems: string[];
}

export type Severity = 'danger' | 'warning' | 'info';

export interface Diagnostic {
  severity: Severity;
  message: string;
  /** como corrigir */
  fix?: string;
  /** ids de componentes, fios ou furos para destacar */
  highlight: string[];
  code: string;
}

export interface WireFlow {
  id: string;
  /** corrente de a → b (A) */
  current: number;
}

export interface Analysis {
  ok: boolean;
  voltages: Record<string, number>;
  parts: Record<string, PartResult>;
  wires: WireFlow[];
  diagnostics: Diagnostic[];
  /** corrente fornecida pelo pino 5V (A) */
  supplyCurrent: number;
  /** corrente em cada pino de saída (A, positiva = saindo do pino) */
  pinCurrents: Record<string, number>;
  /** nó elétrico de cada furo/pino ligado por fios (para destacar caminhos) */
  conn: (node: string) => string;
  /** O nó está ligado (por fios ou pela protoboard) ao outro? */
  connected: (a: string, b: string) => boolean;
  /** Nó flutuando (sem caminho para 5V, GND ou um pino de saída)? */
  floating: (node: string) => boolean;
}

/** Tensão em um nó (0 se o nó não existe). */
export const voltageAt = (an: Analysis, node: string) => an.voltages[node] ?? 0;

interface BuildResult {
  elems: Elem[];
  partLegs: Record<string, LegInfo[]>;
  uf: UF;
  wireElems: Record<string, Elem>;
}

function build(circuit: Circuit, board: BoardState, overrides: Record<string, 0 | 1> = {}): BuildResult {
  const split = !!circuit.railsSplit;
  const elems: Elem[] = [];
  const uf = new UF();
  const partLegs: Record<string, LegInfo[]> = {};
  const wireElems: Record<string, Elem> = {};
  uf.find(GND);

  for (const w of circuit.wires) {
    const a = endpointNode(w.a, split);
    const b = endpointNode(w.b, split);
    if (!a || !b) continue;
    uf.union(a, b);
    const e: Elem = { t: 'R', a, b, r: R_WIRE, owner: w.id, role: 'wire' };
    elems.push(e);
    wireElems[w.id] = e;
  }

  for (const p of circuit.parts) {
    const holes = legHoles(p);
    if (!holes) continue;
    const legs: LegInfo[] = Object.entries(holes).map(([key, hole]) => ({ key, hole, node: netOf(hole, { railsSplit: split })! }));
    partLegs[p.id] = legs;
    const n = (k: string) => legs.find((l) => l.key === k)!.node;
    switch (p.kind) {
      case 'resistor':
        elems.push({ t: 'R', a: n('1'), b: n('2'), r: Math.max(1, p.props.ohms ?? 220), owner: p.id });
        break;
      case 'led':
        elems.push({ t: 'D', a: n('A'), k: n('K'), vf: LED_COLORS[p.props.color ?? 'red'].vf, owner: p.id, on: true });
        break;
      case 'button': {
        // pernas do mesmo lado do canal são sempre ligadas internamente
        elems.push({ t: 'R', a: n('1a'), b: n('1b'), r: R_WIRE, owner: p.id, role: 'inner1' });
        elems.push({ t: 'R', a: n('2a'), b: n('2b'), r: R_WIRE, owner: p.id, role: 'inner2' });
        uf.union(n('1a'), n('1b'));
        uf.union(n('2a'), n('2b'));
        if (p.props.pressed) {
          elems.push({ t: 'R', a: n('1a'), b: n('2a'), r: 0.02, owner: p.id, role: 'contact' });
          uf.union(n('1a'), n('2a'));
        }
        break;
      }
      case 'buzzer':
        elems.push({ t: 'R', a: n('P'), b: n('N'), r: R_BUZZER, owner: p.id });
        break;
      case 'pot': {
        const pos = clamp(p.props.pos ?? 0.5, 0, 1);
        elems.push({ t: 'R', a: n('1'), b: n('W'), r: 1 + pos * 10000, owner: p.id, role: 'pot1' });
        elems.push({ t: 'R', a: n('W'), b: n('3'), r: 1 + (1 - pos) * 10000, owner: p.id, role: 'pot2' });
        break;
      }
      case 'ldr':
        elems.push({ t: 'R', a: n('1'), b: n('2'), r: ldrResistance(p.props.light ?? 0.5), owner: p.id });
        break;
      case 'servo':
        elems.push({ t: 'R', a: n('VCC'), b: n('GND'), r: R_SERVO, owner: p.id });
        break;
      case 'ultrasonic':
        elems.push({ t: 'R', a: n('VCC'), b: n('GND'), r: R_SONAR, owner: p.id });
        // o pino ECHO é uma saída do sensor (fica em nível baixo entre as medições)
        elems.push({ t: 'S', n: n('ECHO'), v: 0, r: 1000, owner: `${p.id}:echo` });
        break;
    }
  }

  if (board.powered) {
    elems.push({ t: 'S', n: '5V', v: 5, r: R_5V, owner: 'board:5V' });
    elems.push({ t: 'S', n: '3V3', v: 3.3, r: R_3V3, owner: 'board:3V3' });
    elems.push({ t: 'S', n: 'IOREF', v: 5, r: 10, owner: 'board:IOREF' });
    elems.push({ t: 'R', a: 'RESET', b: '5V', r: 10000, owner: 'board:RESET' });
    for (const [node, st] of Object.entries(board.pins)) {
      if (st.mode === 'OUTPUT') {
        const v = node in overrides ? overrides[node] : effectiveLevel(node, st);
        elems.push({ t: 'S', n: node, v: v ? 5 : 0, r: R_PIN, owner: `pin:${node}` });
      } else if (st.mode === 'INPUT_PULLUP') {
        elems.push({ t: 'R', a: node, b: '5V', r: R_PULLUP, owner: `pullup:${node}` });
      }
    }
  }
  return { elems, partLegs, uf, wireElems };
}

/** Nível usado para calcular o circuito: PWM e tone são calculados nos dois níveis e depois combinados. */
function effectiveLevel(node: string, st: PinState): 0 | 1 {
  if (st.tone !== null) return 1;
  if (st.pwm !== null) return pwmIsReal(node) ? (st.pwm > 0 ? 1 : 0) : st.pwm >= 128 ? 1 : 0;
  return st.value;
}

/** analogWrite só gera PWM de verdade nos pinos 3, 5, 6, 9, 10 e 11 do Uno. */
export function pwmIsReal(node: string) {
  const n = nodeToPinNumber(node);
  return n !== null && ARDUINO_UNO.pwmPins.includes(n);
}

export function ldrResistance(light: number) {
  // escuro ≈ 1 MΩ, luz ambiente ≈ 10 kΩ, muito claro ≈ 1 kΩ (escala logarítmica)
  const l = clamp(light, 0, 1);
  return Math.pow(10, 6 - 3 * l);
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ---------------- Solução numérica ---------------- */
interface Solution {
  v: Record<string, number>;
  elemCurrent: Map<Elem, number>;
}

function solve(elems: Elem[]): Solution {
  const nodes = new Set<string>();
  for (const e of elems) {
    if (e.t === 'R') { nodes.add(e.a); nodes.add(e.b); }
    else if (e.t === 'D') { nodes.add(e.a); nodes.add(e.k); }
    else nodes.add(e.n);
  }
  nodes.delete(GND);
  const list = [...nodes];
  const idx = new Map(list.map((n, i) => [n, i]));
  const N = list.length;

  const voltagesFor = (): Record<string, number> => {
    const G = Array.from({ length: N }, () => new Float64Array(N));
    const I = new Float64Array(N);
    for (let i = 0; i < N; i++) G[i][i] += GMIN;
    const stampG = (a: string, b: string, g: number) => {
      const ia = idx.get(a);
      const ib = idx.get(b);
      if (ia !== undefined) G[ia][ia] += g;
      if (ib !== undefined) G[ib][ib] += g;
      if (ia !== undefined && ib !== undefined) { G[ia][ib] -= g; G[ib][ia] -= g; }
    };
    const inject = (n: string, i: number) => {
      const k = idx.get(n);
      if (k !== undefined) I[k] += i;
    };
    for (const e of elems) {
      if (e.t === 'R') stampG(e.a, e.b, 1 / e.r);
      else if (e.t === 'S') { stampG(e.n, GND, 1 / e.r); inject(e.n, e.v / e.r); }
      else if (e.on) {
        const g = 1 / LED_RS;
        stampG(e.a, e.k, g);
        inject(e.a, g * e.vf);
        inject(e.k, -g * e.vf);
      } else stampG(e.a, e.k, GMIN);
    }
    const x = gauss(G, I);
    const v: Record<string, number> = { [GND]: 0 };
    list.forEach((n, i) => (v[n] = x[i]));
    return v;
  };

  const diodes = elems.filter((e): e is Extract<Elem, { t: 'D' }> => e.t === 'D');
  let v = voltagesFor();
  for (let iter = 0; iter < 40; iter++) {
    let changed = false;
    for (const d of diodes) {
      const vd = (v[d.a] ?? 0) - (v[d.k] ?? 0);
      if (d.on && vd < d.vf - 1e-9) { d.on = false; changed = true; }
      else if (!d.on && vd > d.vf + 1e-9) { d.on = true; changed = true; }
    }
    if (!changed) break;
    v = voltagesFor();
  }

  const elemCurrent = new Map<Elem, number>();
  for (const e of elems) {
    if (e.t === 'R') elemCurrent.set(e, ((v[e.a] ?? 0) - (v[e.b] ?? 0)) / e.r);
    else if (e.t === 'D') elemCurrent.set(e, e.on ? ((v[e.a] ?? 0) - (v[e.k] ?? 0) - e.vf) / LED_RS : 0);
    else elemCurrent.set(e, (e.v - (v[e.n] ?? 0)) / e.r); // corrente saindo da fonte
  }
  return { v, elemCurrent };
}

/** Eliminação de Gauss com pivotamento parcial. */
function gauss(A: Float64Array[], b: Float64Array): Float64Array {
  const n = b.length;
  const M = A.map((row) => Float64Array.from(row));
  const x = Float64Array.from(b);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-300) continue;
    if (p !== c) { [M[p], M[c]] = [M[c], M[p]]; [x[p], x[c]] = [x[c], x[p]]; }
    const piv = M[c][c];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / piv;
      if (f === 0) continue;
      const Mr = M[r];
      const Mc = M[c];
      for (let k = c; k < n; k++) Mr[k] -= f * Mc[k];
      x[r] -= f * x[c];
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = x[r];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = Math.abs(M[r][r]) < 1e-300 ? 0 : s / M[r][r];
  }
  return x;
}

/* ---------------- Análise completa ---------------- */

export interface AnalyzeOptions {
  /** nós dos pinos que estão enviando sinal para servos (servo.attach) */
  servoPins?: string[];
}

/**
 * Analisa o circuito com o estado atual da placa.
 * PWM e tone(): o circuito é calculado com o pino em nível alto e em nível baixo;
 * o brilho do LED é a média ponderada pelo ciclo de trabalho (duty cycle).
 */
export function analyze(circuit: Circuit, board: BoardState, opts: AnalyzeOptions = {}): Analysis {
  const base = build(circuit, board);
  const sol = solve(base.elems);

  // Pinos com sinal variável (PWM real ou tone): calcula também com o pino em nível baixo.
  const varying = Object.entries(board.pins).filter(
    ([node, st]) => board.powered && st.mode === 'OUTPUT' && (st.tone !== null || (st.pwm !== null && pwmIsReal(node) && st.pwm > 0 && st.pwm < 255)),
  );
  const lowSols = varying.map(([node, st]) => {
    const b = build(circuit, board, { [node]: 0 });
    const duty = st.tone !== null ? 0.5 : (st.pwm ?? 0) / 255;
    return { node, duty, tone: st.tone, sol: solve(b.elems), elems: b.elems };
  });

  const elemCurrentById = (s: Solution, elemsList: Elem[], owner: string, role?: string) => {
    const e = elemsList.find((x) => x.owner === owner && (role === undefined || (x.t === 'R' && x.role === role)));
    return e ? s.elemCurrent.get(e) ?? 0 : 0;
  };

  const uf = base.uf;
  const conn = (n: string) => uf.find(n);
  const connected = (a: string, b: string) => uf.same(a, b);

  // Nós "ancorados": alcançáveis a partir de GND ou de uma fonte, atravessando elementos condutores.
  const adj = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  };
  const anchors: string[] = [GND];
  for (const e of base.elems) {
    if (e.t === 'R') link(e.a, e.b);
    else if (e.t === 'D' && e.on) link(e.a, e.k);
    else if (e.t === 'S') anchors.push(e.n);
  }
  const anchored = new Set<string>();
  const stack = [...anchors];
  while (stack.length) {
    const n = stack.pop()!;
    if (anchored.has(n)) continue;
    anchored.add(n);
    for (const m of adj.get(n) ?? []) if (!anchored.has(m)) stack.push(m);
  }
  const floating = (n: string) => !anchored.has(n);

  const diagnostics: Diagnostic[] = [];
  const parts: Record<string, PartResult> = {};
  const V = (n: string) => sol.v[n] ?? 0;

  for (const p of circuit.parts) {
    const legs = base.partLegs[p.id];
    const res: PartResult = { id: p.id, label: partLabel(p), legs: legs ?? [], current: 0, problems: [] };
    parts[p.id] = res;
    if (!legs) continue;
    const n = (k: string) => legs.find((l) => l.key === k)!.node;
    const hole = (k: string) => legs.find((l) => l.key === k)!.hole;
    switch (p.kind) {
      case 'led': {
        const i = elemCurrentById(sol, base.elems, p.id);
        let b = brightnessOf(i);
        for (const ls of lowSols) {
          const il = elemCurrentById(ls.sol, ls.elems, p.id);
          b = b - (1 - ls.duty) * (b - brightnessOf(il));
        }
        res.current = i;
        res.brightness = clamp(b, 0, 1);
        if (connected(n('A'), n('K'))) {
          res.problems.push('pernas ligadas juntas');
          diagnostics.push({
            severity: 'warning', code: 'led-same-net', highlight: [p.id, hole('A'), hole('K')],
            message: `As duas pernas do ${res.label} estão ligadas ao mesmo caminho elétrico.`,
            fix: 'Cada perna do LED precisa ficar em um grupo de furos diferente. Gire o LED ou mude-o de lugar.',
          });
        } else if (board.powered && V(n('K')) - V(n('A')) > 1.2) {
          res.problems.push('invertido');
          diagnostics.push({
            severity: 'warning', code: 'led-reversed', highlight: [p.id],
            message: `O ${res.label} está invertido: o cátodo (perna curta) está do lado positivo.`,
            fix: 'Vire o LED: a perna longa (ânodo, +) vai para o lado do pino/5V e a perna curta (cátodo, −) vai para o lado do GND.',
          });
        }
        if (i > 0.03) {
          res.problems.push('corrente alta');
          diagnostics.push({
            severity: 'danger', code: 'led-overcurrent', highlight: [p.id],
            message: `Corrente muito alta no ${res.label} (${ma(i)}). Na vida real ele poderia queimar!`,
            fix: 'Coloque um resistor (220 Ω ou 330 Ω) em série com o LED para limitar a corrente.',
          });
        }
        break;
      }
      case 'resistor': {
        res.current = elemCurrentById(sol, base.elems, p.id);
        if (connected(n('1'), n('2'))) {
          res.problems.push('em curto');
          diagnostics.push({
            severity: 'warning', code: 'resistor-shorted', highlight: [p.id, hole('1'), hole('2')],
            message: `As duas pernas do ${res.label} estão no mesmo caminho elétrico, então ele não limita a corrente.`,
            fix: 'Coloque cada perna do resistor em um grupo de furos diferente.',
          });
        }
        break;
      }
      case 'button':
        res.current = Math.abs(elemCurrentById(sol, base.elems, p.id, 'contact'));
        break;
      case 'buzzer': {
        const vHigh = V(n('P')) - V(n('N'));
        res.current = elemCurrentById(sol, base.elems, p.id);
        let sound: number | null = null;
        for (const ls of lowSols) {
          if (ls.tone === null) continue;
          const vLow = (ls.sol.v[n('P')] ?? 0) - (ls.sol.v[n('N')] ?? 0);
          if (Math.abs(vHigh - vLow) > 2) sound = ls.tone;
        }
        res.sound = sound;
        if (board.powered && Math.abs(vHigh) > 2 && sound === null) {
          res.problems.push('tensão fixa');
          diagnostics.push({
            severity: 'info', code: 'buzzer-dc', highlight: [p.id],
            message: 'O buzzer passivo está recebendo tensão fixa, por isso fica em silêncio.',
            fix: 'O buzzer passivo precisa de um sinal que liga e desliga muito rápido: use tone(pino, frequência).',
          });
        }
        break;
      }
      case 'pot':
        res.current = elemCurrentById(sol, base.elems, p.id, 'pot1');
        break;
      case 'ldr':
        res.current = elemCurrentById(sol, base.elems, p.id);
        break;
      case 'servo': {
        const vcc = V(n('VCC')) - V(n('GND'));
        res.current = elemCurrentById(sol, base.elems, p.id);
        res.powered = vcc > 4.3;
        res.servoOk = res.powered && (opts.servoPins ?? []).some((pin) => connected(pin, n('SIG')));
        const vccPin = digitalPinIn(conn(n('VCC')), uf);
        if (vccPin) {
          res.problems.push('alimentado por pino digital');
          diagnostics.push({
            severity: 'danger', code: 'motor-on-pin', highlight: [p.id],
            message: 'O fio vermelho do servo está ligado a um pino digital. Motores não podem ser alimentados pelos pinos digitais!',
            fix: 'Ligue o fio vermelho ao 5V (ou a uma fonte externa com GND comum) e o fio laranja ao pino de sinal.',
          });
        } else if (board.powered && !res.powered) {
          res.problems.push('sem alimentação');
        }
        break;
      }
      case 'ultrasonic': {
        res.current = elemCurrentById(sol, base.elems, p.id);
        res.powered = V(n('VCC')) - V(n('GND')) > 4.3;
        break;
      }
    }
  }

  // Fontes: curto-circuito e sobrecarga dos pinos
  const pinCurrents: Record<string, number> = {};
  let supplyCurrent = 0;
  for (const e of base.elems) {
    if (e.t !== 'S') continue;
    const i = sol.elemCurrent.get(e) ?? 0;
    if (e.owner === 'board:5V') supplyCurrent = i;
    if (e.owner.startsWith('pin:')) pinCurrents[e.n] = i;
  }
  if (supplyCurrent > 1) {
    diagnostics.unshift({
      severity: 'danger', code: 'short-5v', highlight: shortPath(circuit, base, sol, '5V'),
      message: 'CURTO-CIRCUITO! O 5V está ligado direto ao GND, sem nenhum componente no caminho.',
      fix: 'Desligue a USB imediatamente e retire o fio que liga o positivo direto ao negativo.',
    });
  }
  const i33 = currentOf(base.elems, sol, 'board:3V3');
  if (i33 > 0.15) {
    diagnostics.unshift({
      severity: 'danger', code: 'short-3v3', highlight: shortPath(circuit, base, sol, '3V3'),
      message: 'CURTO-CIRCUITO no pino 3.3V! Ele está ligado direto ao GND ou a outro pino.',
      fix: 'Desligue a USB e retire a ligação direta do 3.3V.',
    });
  }
  for (const [node, i] of Object.entries(pinCurrents)) {
    const label = pinLabelFromNode(node);
    let worst = Math.abs(i);
    for (const ls of lowSols) {
      const e = ls.elems.find((x) => x.t === 'S' && x.owner === `pin:${node}`);
      if (e) worst = Math.max(worst, Math.abs(ls.sol.elemCurrent.get(e) ?? 0));
    }
    if (worst > 0.04) {
      diagnostics.unshift({
        severity: 'danger', code: 'pin-overload', highlight: [`ard:${node}`, ...shortPath(circuit, base, sol, node)],
        message: `O ${label} está fornecendo ${ma(worst)}. O limite máximo é 40 mA: o pino pode ser danificado!`,
        fix: 'Verifique se o pino não está ligado direto ao GND/5V e se existe resistor em série.',
      });
    } else if (worst > 0.021) {
      diagnostics.push({
        severity: 'warning', code: 'pin-high-current', highlight: [`ard:${node}`],
        message: `O ${label} está fornecendo ${ma(worst)}, acima dos 20 mA recomendados.`,
        fix: 'Use um resistor maior para diminuir a corrente.',
      });
    }
  }

  // Entradas flutuando
  for (const [node, st] of Object.entries(board.pins)) {
    if (st.mode !== 'INPUT' || !board.powered) continue;
    const used = circuit.wires.some((w) => [w.a, w.b].some((e) => isBoardEndpoint(e) && getPin(boardPinOf(e))?.node === node));
    if (used && floating(node)) {
      diagnostics.push({
        severity: 'info', code: 'floating-input', highlight: [`ard:${node}`],
        message: `O ${pinLabelFromNode(node)} é uma entrada "flutuando": a leitura pode mudar sozinha.`,
        fix: 'Use INPUT_PULLUP no pinMode ou um resistor para manter a entrada em um nível definido.',
      });
    }
  }

  const wires: WireFlow[] = circuit.wires.map((w) => {
    const e = base.wireElems[w.id];
    const i = e ? sol.elemCurrent.get(e) ?? 0 : 0;
    return { id: w.id, current: i };
  });

  const ok = !diagnostics.some((d) => d.severity === 'danger');
  return { ok, voltages: sol.v, parts, wires, diagnostics, supplyCurrent, pinCurrents, conn, connected, floating };
}

function currentOf(elems: Elem[], sol: Solution, owner: string) {
  const e = elems.find((x) => x.owner === owner);
  return e ? sol.elemCurrent.get(e) ?? 0 : 0;
}

/** Fios com corrente muito alta — usados para destacar o caminho do curto. */
function shortPath(circuit: Circuit, base: BuildResult, sol: Solution, _from: string): string[] {
  const ids: string[] = [];
  for (const w of circuit.wires) {
    const e = base.wireElems[w.id];
    if (e && Math.abs(sol.elemCurrent.get(e) ?? 0) > 0.04) ids.push(w.id);
  }
  return ids;
}

function digitalPinIn(root: string, uf: UF): string | null {
  for (let n = 0; n <= 13; n++) if (uf.find(`D${n}`) === root && uf.parent.has(`D${n}`)) return `D${n}`;
  return null;
}

function pinLabelFromNode(node: string) {
  if (/^D\d+$/.test(node)) return `pino digital ${node.slice(1)}`;
  if (/^A\d$/.test(node)) return `pino ${node}`;
  return `pino ${node}`;
}

export function brightnessOf(i: number) {
  if (i < 0.00005) return 0;
  if (i < 0.0005) return 0.06; // brilho bem fraquinho (ex.: só o resistor interno de pull-up)
  return clamp(0.15 + (i / 0.015) * 0.85, 0, 1);
}

export const ma = (i: number) => `${(Math.abs(i) * 1000).toFixed(Math.abs(i) < 0.01 ? 1 : 0).replace('.', ',')} mA`;

/** Leitura digital de um pino de entrada (HIGH/LOW) ou null quando flutuando. */
export function digitalReadNode(an: Analysis, node: string): 0 | 1 | null {
  if (an.floating(node)) return null;
  const v = voltageAt(an, node);
  if (v >= 3) return 1;
  if (v <= 1.5) return 0;
  return v > 2.25 ? 1 : 0;
}

/** Leitura analógica (0–1023) de um pino. */
export function analogReadNode(an: Analysis, node: string): number | null {
  if (an.floating(node)) return null;
  return Math.round(clamp(voltageAt(an, node), 0, 5) / 5 * 1023);
}

/** Lista de pernas de cada componente (para desenhar e destacar). */
export function partLegList(p: PlacedPart): { key: string; name: string; hole: string }[] {
  const holes = legHoles(p);
  if (!holes) return [];
  return PART_DEFS[p.kind].legs.map((l) => ({ key: l.key, name: l.name, hole: holes[l.key] }));
}
