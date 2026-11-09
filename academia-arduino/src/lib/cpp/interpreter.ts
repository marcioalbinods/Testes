/**
 * Interpretador do subconjunto de C++ do Arduino.
 *
 * Executa o programa passo a passo usando geradores (function*): quando o código chama
 * delay(), o interpretador "pausa" e devolve o controle ao simulador, que avança o relógio.
 *
 * Fidelidade: os tipos seguem o Arduino Uno (int de 16 bits, long de 32 bits, float de 32 bits),
 * incluindo divisão inteira e estouro (overflow) de int.
 */
import type { Expr, FuncDecl, NumKind, Program, Stmt, TypeRef } from './ast';
import { CONSTANTS } from './builtins';

export interface Host {
  pinMode(pin: number, mode: number): void;
  digitalWrite(pin: number, value: number): void;
  digitalRead(pin: number): number;
  analogRead(pin: number): number;
  analogWrite(pin: number, value: number): void;
  tone(pin: number, freq: number, duration?: number): void;
  noTone(pin: number): void;
  /** duração do pulso em µs (0 = tempo esgotado) */
  pulseIn(pin: number, level: number, timeoutUs: number): number;
  millis(): number;
  micros(): number;
  serialBegin(baud: number): void;
  serialWrite(text: string): void;
  servoAttach(obj: string, pin: number): void;
  servoWrite(obj: string, angle: number): void;
  servoRead(obj: string): number;
  servoDetach(obj: string): void;
  random(): number;
  /** linha atual sendo executada (para destacar no editor) */
  onLine?(line: number): void;
}

export type Pause = { t: 'delay'; ms: number } | { t: 'yield' };

export class RuntimeError extends Error {
  constructor(public line: number, message: string) {
    super(message);
  }
}

interface Val { v: number; t: NumKind; s?: string }
type Slot = { kind: NumKind; v: number; isConst: boolean; s?: string } | { kind: NumKind; arr: number[]; isConst: boolean } | { obj: string; cls: string };

const RANK: Record<NumKind, number> = { bool: 0, byte: 0, int: 1, uint: 2, long: 3, ulong: 4, float: 5, string: 6, void: -1, object: -1 };
const promote = (a: NumKind, b: NumKind): NumKind => {
  const r = Math.max(RANK[a], RANK[b], 1);
  return (['bool', 'int', 'uint', 'long', 'ulong', 'float', 'string'] as NumKind[])[r];
};

export function wrap(v: number, k: NumKind): number {
  if (!isFinite(v)) return k === 'float' ? v : 0;
  switch (k) {
    case 'float': return Math.fround(v);
    case 'bool': return v ? 1 : 0;
    case 'byte': return ((Math.trunc(v) % 256) + 256) % 256;
    case 'int': { const x = ((Math.trunc(v) % 65536) + 65536) % 65536; return x >= 32768 ? x - 65536 : x; }
    case 'uint': return ((Math.trunc(v) % 65536) + 65536) % 65536;
    case 'long': { const x = ((Math.trunc(v) % 4294967296) + 4294967296) % 4294967296; return x >= 2147483648 ? x - 4294967296 : x; }
    case 'ulong': return ((Math.trunc(v) % 4294967296) + 4294967296) % 4294967296;
    default: return v;
  }
}

class Return { constructor(public value: Val) {} }
class Break {}
class Continue {}

const STEP_BUDGET = 3000;

export class Interpreter {
  private globals = new Map<string, Slot>();
  private frames: Map<string, Slot>[][] = [];
  private steps = 0;
  constructor(private prog: Program, private host: Host) {}

  /** Gerador principal: variáveis globais, setup() uma vez e loop() para sempre. */
  *run(): Generator<Pause, void, void> {
    for (const g of this.prog.globals) yield* this.declare(this.globals, g.name, g.type, g.init, g.initList, g.line);
    yield* this.callUser(this.prog.funcs.setup, []);
    const loop = this.prog.funcs.loop;
    for (;;) {
      yield* this.callUser(loop, []);
      yield { t: 'yield' };
    }
  }

  private *declare(scope: Map<string, Slot>, name: string, type: TypeRef, init: Expr | undefined, initList: Expr[] | undefined, line: number): Generator<Pause, void, void> {
    if (type.kind === 'object') {
      scope.set(name, { obj: name, cls: type.cls ?? '' });
      return;
    }
    if (type.array !== undefined) {
      const size = type.array ?? initList?.length ?? 0;
      const arr = new Array(size).fill(0);
      if (initList) {
        if (initList.length > size) throw new RuntimeError(line, `O vetor ${name} tem mais valores do que o tamanho informado.`);
        for (let i = 0; i < initList.length; i++) arr[i] = wrap((yield* this.eval(initList[i])).v, type.kind);
      }
      scope.set(name, { kind: type.kind, arr, isConst: !!type.isConst });
      return;
    }
    let v = 0;
    let s: string | undefined;
    if (init) {
      const r = yield* this.eval(init);
      v = r.v;
      s = r.s;
    }
    scope.set(name, { kind: type.kind, v: type.kind === 'string' ? 0 : wrap(v, type.kind), isConst: !!type.isConst, s: type.kind === 'string' ? s ?? String(v) : undefined });
  }

  private lookup(name: string, line: number): Slot {
    const frame = this.frames[this.frames.length - 1];
    if (frame) for (let i = frame.length - 1; i >= 0; i--) { const s = frame[i].get(name); if (s) return s; }
    const g = this.globals.get(name);
    if (g) return g;
    throw new RuntimeError(line, `A variável "${name}" não existe.`);
  }

  private *callUser(f: FuncDecl, args: Val[]): Generator<Pause, Val, void> {
    if (this.frames.length > 60) throw new RuntimeError(f.line, `A função ${f.name}() chamou a si mesma vezes demais.`);
    const scope = new Map<string, Slot>();
    f.params.forEach((p, i) => scope.set(p.name, { kind: p.type.kind, v: wrap(args[i]?.v ?? 0, p.type.kind), isConst: false }));
    this.frames.push([scope]);
    try {
      yield* this.exec(f.body);
    } catch (e) {
      if (e instanceof Return) return this.coerce(e.value, f.ret.kind);
      throw e;
    } finally {
      this.frames.pop();
    }
    return { v: 0, t: 'int' };
  }

  private coerce(v: Val, k: NumKind): Val {
    if (k === 'void' || k === 'string') return v;
    return { v: wrap(v.v, k), t: k };
  }

  private *tick(line: number): Generator<Pause, void, void> {
    this.host.onLine?.(line);
    if (++this.steps >= STEP_BUDGET) {
      this.steps = 0;
      yield { t: 'yield' };
    }
  }

  private *exec(s: Stmt): Generator<Pause, void, void> {
    switch (s.k) {
      case 'block': {
        const frame = this.frames[this.frames.length - 1];
        frame.push(new Map());
        try {
          for (const st of s.body) yield* this.exec(st);
        } finally {
          frame.pop();
        }
        return;
      }
      case 'decl': {
        yield* this.tick(s.line);
        const frame = this.frames[this.frames.length - 1];
        for (const d of s.decls) yield* this.declare(frame[frame.length - 1], d.name, d.type, d.init, d.initList, d.line);
        return;
      }
      case 'expr':
        yield* this.tick(s.line);
        yield* this.eval(s.e);
        return;
      case 'if':
        yield* this.tick(s.line);
        if ((yield* this.eval(s.c)).v) yield* this.exec(s.then);
        else if (s.else) yield* this.exec(s.else);
        return;
      case 'while':
        for (;;) {
          yield* this.tick(s.line);
          if (!(yield* this.eval(s.c)).v) break;
          try { yield* this.exec(s.body); } catch (e) { if (e instanceof Break) break; if (!(e instanceof Continue)) throw e; }
        }
        return;
      case 'do':
        for (;;) {
          yield* this.tick(s.line);
          try { yield* this.exec(s.body); } catch (e) { if (e instanceof Break) break; if (!(e instanceof Continue)) throw e; }
          if (!(yield* this.eval(s.c)).v) break;
        }
        return;
      case 'for': {
        const frame = this.frames[this.frames.length - 1];
        frame.push(new Map());
        try {
          if (s.init) yield* this.exec(s.init);
          for (;;) {
            yield* this.tick(s.line);
            if (s.c && !(yield* this.eval(s.c)).v) break;
            try { yield* this.exec(s.body); } catch (e) { if (e instanceof Break) break; if (!(e instanceof Continue)) throw e; }
            if (s.step) yield* this.eval(s.step);
          }
        } finally {
          frame.pop();
        }
        return;
      }
      case 'return':
        yield* this.tick(s.line);
        throw new Return(s.e ? yield* this.eval(s.e) : { v: 0, t: 'void' });
      case 'break': throw new Break();
      case 'continue': throw new Continue();
      case 'empty': return;
    }
  }

  private assignTo(target: Expr, value: number, line: number, str?: string): Val {
    if (target.k === 'id') {
      const slot = this.lookup(target.name, line);
      if ('obj' in slot || 'arr' in slot) throw new RuntimeError(line, `Não é possível guardar um número em "${target.name}".`);
      if (slot.isConst) throw new RuntimeError(line, `"${target.name}" é constante.`);
      if (slot.kind === 'string') { slot.s = str ?? String(value); return { v: 0, t: 'string', s: slot.s }; }
      slot.v = wrap(value, slot.kind);
      return { v: slot.v, t: slot.kind };
    }
    if (target.k === 'index') throw new RuntimeError(line, 'interno');
    throw new RuntimeError(line, 'Só é possível guardar valores em variáveis.');
  }

  private *arraySlot(e: Expr & { k: 'index' }): Generator<Pause, { arr: number[]; i: number; kind: NumKind }, void> {
    if (e.arr.k !== 'id') throw new RuntimeError(e.line, 'Vetor inválido.');
    const slot = this.lookup(e.arr.name, e.line);
    if (!('arr' in slot)) throw new RuntimeError(e.line, `"${e.arr.name}" não é um vetor.`);
    const i = (yield* this.eval(e.index)).v;
    if (i < 0 || i >= slot.arr.length)
      throw new RuntimeError(e.line, `Posição ${i} fora do vetor ${e.arr.name} (que vai de 0 a ${slot.arr.length - 1}).`);
    return { arr: slot.arr, i, kind: slot.kind };
  }

  private *eval(e: Expr): Generator<Pause, Val, void> {
    switch (e.k) {
      case 'num': return { v: e.v, t: e.type };
      case 'str': return { v: 0, t: 'string', s: e.v };
      case 'id': {
        if (e.name in CONSTANTS) return { v: CONSTANTS[e.name].v, t: 'int' };
        const slot = this.lookup(e.name, e.line);
        if ('obj' in slot) throw new RuntimeError(e.line, `"${e.name}" é um objeto, não um número.`);
        if ('arr' in slot) throw new RuntimeError(e.line, `"${e.name}" é um vetor: use ${e.name}[posição].`);
        if (slot.kind === 'string') return { v: 0, t: 'string', s: slot.s ?? '' };
        return { v: slot.v, t: slot.kind };
      }
      case 'index': {
        const { arr, i, kind } = yield* this.arraySlot(e);
        return { v: arr[i], t: kind };
      }
      case 'cast': {
        const a = yield* this.eval(e.a);
        return { v: wrap(a.v, e.to), t: e.to };
      }
      case 'cond': {
        const c = yield* this.eval(e.c);
        return c.v ? yield* this.eval(e.a) : yield* this.eval(e.b);
      }
      case 'un': {
        const a = yield* this.eval(e.a);
        if (e.op === '!') return { v: a.v ? 0 : 1, t: 'bool' };
        const t = promote(a.t, 'int');
        if (e.op === '-') return { v: wrap(-a.v, t), t };
        if (e.op === '~') return { v: wrap(~a.v, t), t };
        return { v: a.v, t };
      }
      case 'pre': case 'post': {
        const delta = e.op === '++' ? 1 : -1;
        if (e.a.k === 'index') {
          const { arr, i, kind } = yield* this.arraySlot(e.a);
          const old = arr[i];
          arr[i] = wrap(old + delta, kind);
          return { v: e.k === 'pre' ? arr[i] : old, t: kind };
        }
        const old = yield* this.eval(e.a);
        const nv = this.assignTo(e.a, old.v + delta, e.line);
        return e.k === 'pre' ? nv : old;
      }
      case 'assign': {
        const rhs = yield* this.eval(e.value);
        let value = rhs.v;
        let str = rhs.s;
        if (e.op !== '=') {
          const cur = e.target.k === 'index' ? yield* this.eval(e.target) : yield* this.eval(e.target);
          const r = this.binop(e.op.slice(0, -1), cur, rhs, e.line);
          value = r.v;
          str = r.s;
        }
        if (e.target.k === 'index') {
          const { arr, i, kind } = yield* this.arraySlot(e.target);
          arr[i] = wrap(value, kind);
          return { v: arr[i], t: kind };
        }
        return this.assignTo(e.target, value, e.line, str);
      }
      case 'bin': {
        if (e.op === '&&') {
          const a = yield* this.eval(e.a);
          if (!a.v) return { v: 0, t: 'bool' };
          return { v: (yield* this.eval(e.b)).v ? 1 : 0, t: 'bool' };
        }
        if (e.op === '||') {
          const a = yield* this.eval(e.a);
          if (a.v) return { v: 1, t: 'bool' };
          return { v: (yield* this.eval(e.b)).v ? 1 : 0, t: 'bool' };
        }
        const a = yield* this.eval(e.a);
        const b = yield* this.eval(e.b);
        return this.binop(e.op, a, b, e.line);
      }
      case 'call': return yield* this.call(e);
      case 'method': return yield* this.method(e);
    }
  }

  private binop(op: string, a: Val, b: Val, line: number): Val {
    if (a.t === 'string' || b.t === 'string') {
      if (op === '+') return { v: 0, t: 'string', s: valText(a) + valText(b) };
      if (op === '==') return { v: valText(a) === valText(b) ? 1 : 0, t: 'bool' };
      if (op === '!=') return { v: valText(a) !== valText(b) ? 1 : 0, t: 'bool' };
      throw new RuntimeError(line, `Não é possível usar "${op}" com textos.`);
    }
    const t = promote(a.t, b.t);
    const isF = t === 'float';
    switch (op) {
      case '+': return { v: wrap(a.v + b.v, t), t };
      case '-': return { v: wrap(a.v - b.v, t), t };
      case '*': return { v: wrap(a.v * b.v, t), t };
      case '/':
        if (b.v === 0) {
          if (isF) return { v: a.v === 0 ? NaN : a.v > 0 ? Infinity : -Infinity, t };
          throw new RuntimeError(line, 'Divisão por zero! Um número inteiro não pode ser dividido por 0.');
        }
        return { v: wrap(isF ? a.v / b.v : Math.trunc(a.v / b.v), t), t };
      case '%':
        if (isF) throw new RuntimeError(line, 'O operador % (resto) só funciona com números inteiros.');
        if (b.v === 0) throw new RuntimeError(line, 'Divisão por zero no operador %.');
        return { v: wrap(a.v % b.v, t), t };
      case '==': return { v: a.v === b.v ? 1 : 0, t: 'bool' };
      case '!=': return { v: a.v !== b.v ? 1 : 0, t: 'bool' };
      case '<': return { v: a.v < b.v ? 1 : 0, t: 'bool' };
      case '>': return { v: a.v > b.v ? 1 : 0, t: 'bool' };
      case '<=': return { v: a.v <= b.v ? 1 : 0, t: 'bool' };
      case '>=': return { v: a.v >= b.v ? 1 : 0, t: 'bool' };
      case '&': return { v: wrap(a.v & b.v, t), t };
      case '|': return { v: wrap(a.v | b.v, t), t };
      case '^': return { v: wrap(a.v ^ b.v, t), t };
      case '<<': return { v: wrap(a.v * Math.pow(2, b.v), t), t };
      case '>>': return { v: wrap(Math.floor(a.v / Math.pow(2, b.v)), t), t };
    }
    throw new RuntimeError(line, `Operador "${op}" não suportado.`);
  }

  private *args(list: Expr[]): Generator<Pause, Val[], void> {
    const out: Val[] = [];
    for (const a of list) out.push(yield* this.eval(a));
    return out;
  }

  private *call(e: Expr & { k: 'call' }): Generator<Pause, Val, void> {
    const user = this.prog.funcs[e.name];
    const args = yield* this.args(e.args);
    if (user) return yield* this.callUser(user, args);
    const n = (i: number) => args[i]?.v ?? 0;
    const h = this.host;
    const VOID: Val = { v: 0, t: 'void' };
    const checkPin = (p: number) => {
      if (!Number.isInteger(p) || p < 0 || p > 19) throw new RuntimeError(e.line, `O pino ${p} não existe no Arduino Uno.`);
    };
    switch (e.name) {
      case 'pinMode': checkPin(n(0)); h.pinMode(n(0), n(1)); return VOID;
      case 'digitalWrite': checkPin(n(0)); h.digitalWrite(n(0), n(1) ? 1 : 0); return VOID;
      case 'digitalRead': checkPin(n(0)); return { v: h.digitalRead(n(0)), t: 'int' };
      case 'analogRead': {
        let p = n(0);
        if (p >= 0 && p <= 5) p += 14;
        if (p < 14 || p > 19) throw new RuntimeError(e.line, 'analogRead só funciona nos pinos A0 a A5.');
        return { v: h.analogRead(p), t: 'int' };
      }
      case 'analogWrite': checkPin(n(0)); h.analogWrite(n(0), Math.max(0, Math.min(255, Math.trunc(n(1))))); return VOID;
      case 'delay': {
        const ms = wrap(n(0), 'ulong');
        if (ms > 0) yield { t: 'delay', ms };
        return VOID;
      }
      case 'delayMicroseconds': {
        const us = wrap(n(0), 'uint');
        if (us > 0) yield { t: 'delay', ms: us / 1000 };
        return VOID;
      }
      case 'millis': return { v: wrap(Math.floor(h.millis()), 'ulong'), t: 'ulong' };
      case 'micros': return { v: wrap(Math.floor(h.micros()), 'ulong'), t: 'ulong' };
      case 'tone': checkPin(n(0)); h.tone(n(0), Math.max(31, n(1)), args.length > 2 ? n(2) : undefined); return VOID;
      case 'noTone': checkPin(n(0)); h.noTone(n(0)); return VOID;
      case 'pulseIn': {
        checkPin(n(0));
        const timeout = args.length > 2 ? n(2) : 1000000;
        const d = h.pulseIn(n(0), n(1), timeout);
        yield { t: 'delay', ms: (d > 0 ? d : timeout) / 1000 };
        return { v: wrap(d, 'ulong'), t: 'ulong' };
      }
      case 'map': {
        const [x, a, b, c, d] = [n(0), n(1), n(2), n(3), n(4)];
        if (b - a === 0) throw new RuntimeError(e.line, 'No map, os dois primeiros limites não podem ser iguais.');
        return { v: wrap(Math.trunc(((x - a) * (d - c)) / (b - a)) + c, 'long'), t: 'long' };
      }
      case 'constrain': {
        const t = promote(promote(args[0].t, args[1].t), args[2].t);
        return { v: Math.min(Math.max(n(0), n(1)), n(2)), t };
      }
      case 'min': return { v: Math.min(n(0), n(1)), t: promote(args[0].t, args[1].t) };
      case 'max': return { v: Math.max(n(0), n(1)), t: promote(args[0].t, args[1].t) };
      case 'abs': return { v: Math.abs(n(0)), t: promote(args[0].t, 'int') };
      case 'random': {
        const [lo, hi] = args.length === 1 ? [0, n(0)] : [n(0), n(1)];
        if (hi <= lo) return { v: lo, t: 'long' };
        return { v: lo + Math.floor(h.random() * (hi - lo)), t: 'long' };
      }
      case 'randomSeed': return VOID;
      case 'sqrt': return { v: Math.fround(Math.sqrt(n(0))), t: 'float' };
      case 'pow': return { v: Math.fround(Math.pow(n(0), n(1))), t: 'float' };
    }
    throw new RuntimeError(e.line, `O comando "${e.name}" não existe.`);
  }

  private *method(e: Expr & { k: 'method' }): Generator<Pause, Val, void> {
    const args = yield* this.args(e.args);
    const VOID: Val = { v: 0, t: 'void' };
    if (e.obj === 'Serial') {
      switch (e.name) {
        case 'begin': this.host.serialBegin(args[0]?.v ?? 9600); return VOID;
        case 'print': this.host.serialWrite(printable(args[0], args[1])); return VOID;
        case 'println': this.host.serialWrite((args[0] ? printable(args[0], args[1]) : '') + '\n'); return VOID;
        case 'available': return { v: 0, t: 'int' };
        case 'read': return { v: -1, t: 'int' };
      }
    }
    const slot = this.lookup(e.obj, e.line);
    if (!('obj' in slot)) throw new RuntimeError(e.line, `"${e.obj}" não é um objeto.`);
    if (slot.cls === 'Servo') {
      switch (e.name) {
        case 'attach': this.host.servoAttach(e.obj, args[0].v); return VOID;
        case 'write': this.host.servoWrite(e.obj, Math.max(0, Math.min(180, Math.trunc(args[0].v)))); return VOID;
        case 'read': return { v: this.host.servoRead(e.obj), t: 'int' };
        case 'detach': this.host.servoDetach(e.obj); return VOID;
        case 'attached': return { v: 1, t: 'bool' };
      }
    }
    throw new RuntimeError(e.line, `${e.obj}.${e.name}() não é suportado.`);
  }
}

function valText(v: Val): string {
  if (v.t === 'string') return v.s ?? '';
  if (v.t === 'float') return v.v.toFixed(2);
  return String(v.v);
}

function printable(v: Val, fmt?: Val): string {
  if (v.t === 'float') {
    const digits = fmt ? Math.max(0, Math.min(8, fmt.v)) : 2;
    if (!isFinite(v.v)) return isNaN(v.v) ? 'nan' : 'inf';
    return v.v.toFixed(digits);
  }
  if (v.t === 'string') return v.s ?? '';
  return String(v.v);
}
