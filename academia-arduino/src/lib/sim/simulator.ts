/**
 * Simulador didático: junta o circuito da bancada, o motor elétrico e o interpretador de código.
 *
 * Regras simuladas:
 *  - O programa só roda com a placa ligada (USB). Ao ligar, o programa recomeça (como na placa real).
 *  - LEDs, botões, potenciômetro, LDR e buzzer: calculados pelo motor elétrico (engine.ts).
 *  - Servo: gira até o ângulo pedido se estiver alimentado (5 V e GND) e com o sinal no pino do attach().
 *  - HC-SR04: pulseIn() devolve o tempo do eco se o sensor estiver alimentado, o TRIG receber
 *    um pulso e o ECHO estiver ligado ao pino lido. Distância escolhida pelo estudante.
 */
import { nodeToPinNumber, pinNumberToNode } from '../arduino';
import type { Program } from '../cpp/ast';
import { Interpreter, RuntimeError, type Host, type Pause } from '../cpp/interpreter';
import { analogReadNode, analyze, defaultPin, digitalReadNode, type Analysis, type BoardState, type PinState } from '../circuit/engine';
import type { Circuit } from '../circuit/types';

export interface ServoState {
  pin: string;
  target: number;
}

export class Simulator {
  board: BoardState = { powered: false, pins: {} };
  time = 0;
  serial = '';
  error: { line: number; message: string } | null = null;
  currentLine = 0;
  finished = false;
  /** ângulo atual mostrado de cada servo (por id do componente) */
  servoAngles: Record<string, number> = {};
  servos = new Map<string, ServoState>();
  private circuit: Circuit;
  private program: Program | null = null;
  private gen: Generator<Pause, void, void> | null = null;
  private wakeAt = 0;
  private cache: Analysis | null = null;
  private toneEnd: { pin: string; at: number } | null = null;
  private trigPulse = new Map<string, number>();
  private trigHighAt = new Map<string, number>();
  private implicitPullup = new Set<string>();
  private noise = new Map<string, { v: number; at: number }>();
  private wasReset = false;

  constructor(circuit: Circuit) {
    this.circuit = circuit;
  }

  setCircuit(c: Circuit) {
    this.circuit = c;
    this.cache = null;
  }

  setProgram(p: Program | null) {
    this.program = p;
    this.restart();
  }

  hasProgram() {
    return !!this.program;
  }

  setPowered(on: boolean) {
    if (on === this.board.powered) return;
    this.board.powered = on;
    this.restart();
  }

  /** Recomeça o programa do início (como apertar o botão RESET). */
  restart() {
    this.board.pins = {};
    this.time = 0;
    this.wakeAt = 0;
    this.serial = '';
    this.error = null;
    this.finished = false;
    this.servos.clear();
    this.toneEnd = null;
    this.trigPulse.clear();
    this.trigHighAt.clear();
    this.implicitPullup.clear();
    this.cache = null;
    this.gen = this.board.powered && this.program ? new Interpreter(this.program, this.host).run() : null;
  }

  analysis(): Analysis {
    if (!this.cache) {
      this.cache = analyze(this.circuit, this.board, { servoPins: [...this.servos.values()].map((s) => s.pin) });
    }
    return this.cache;
  }

  private pin(node: string): PinState {
    if (!this.board.pins[node]) this.board.pins[node] = defaultPin();
    return this.board.pins[node];
  }

  private nodeOf(n: number): string {
    const node = pinNumberToNode(n);
    if (!node) throw new RuntimeError(this.currentLine, `O pino ${n} não existe no Arduino Uno.`);
    return node;
  }

  private dirty() {
    this.cache = null;
  }

  private host: Host = {
    pinMode: (n, mode) => {
      const node = this.nodeOf(n);
      const p = this.pin(node);
      p.mode = mode === 1 ? 'OUTPUT' : mode === 2 ? 'INPUT_PULLUP' : 'INPUT';
      this.implicitPullup.delete(node);
      if (p.mode !== 'OUTPUT') { p.pwm = null; p.tone = null; }
      this.dirty();
    },
    digitalWrite: (n, v) => {
      const node = this.nodeOf(n);
      const p = this.pin(node);
      if (p.mode === 'OUTPUT') {
        p.value = v ? 1 : 0;
        p.pwm = null;
      } else {
        // Comportamento real do Arduino: digitalWrite(HIGH) em um pino de entrada liga o pull-up interno.
        p.mode = v ? 'INPUT_PULLUP' : 'INPUT';
        if (v) this.implicitPullup.add(node);
      }
      const t = this.time * 1000;
      if (v) this.trigHighAt.set(node, t);
      else if (this.trigHighAt.has(node)) {
        this.trigPulse.set(node, t);
        this.trigHighAt.delete(node);
      }
      this.dirty();
    },
    digitalRead: (n) => {
      const node = this.nodeOf(n);
      const p = this.pin(node);
      if (p.mode === 'OUTPUT') return p.value;
      const r = digitalReadNode(this.analysis(), node);
      return r ?? this.noisy(node);
    },
    analogRead: (n) => {
      const node = this.nodeOf(n);
      const r = analogReadNode(this.analysis(), node);
      if (r === null) return Math.round(300 + this.noisy(node) * 300 + Math.sin(this.time / 300) * 80);
      return r;
    },
    analogWrite: (n, v) => {
      const node = this.nodeOf(n);
      const p = this.pin(node);
      p.mode = 'OUTPUT'; // o analogWrite já configura o pino como saída
      p.tone = null;
      if (v <= 0) { p.pwm = null; p.value = 0; }
      else if (v >= 255) { p.pwm = null; p.value = 1; }
      else p.pwm = v;
      this.dirty();
    },
    tone: (n, freq, duration) => {
      const node = this.nodeOf(n);
      // O Uno só toca um tone() por vez.
      const playing = Object.entries(this.board.pins).find(([k, st]) => st.tone !== null && k !== node);
      if (playing) return;
      const p = this.pin(node);
      p.mode = 'OUTPUT';
      p.tone = freq;
      p.pwm = null;
      this.toneEnd = duration ? { pin: node, at: this.time + duration } : null;
      this.dirty();
    },
    noTone: (n) => {
      const node = this.nodeOf(n);
      const p = this.pin(node);
      p.tone = null;
      p.value = 0;
      if (this.toneEnd?.pin === node) this.toneEnd = null;
      this.dirty();
    },
    pulseIn: (n, level) => {
      const node = this.nodeOf(n);
      if (!level) return 0;
      const an = this.analysis();
      for (const part of this.circuit.parts) {
        if (part.kind !== 'ultrasonic') continue;
        const res = an.parts[part.id];
        if (!res?.powered) continue;
        const echo = res.legs.find((l) => l.key === 'ECHO');
        const trig = res.legs.find((l) => l.key === 'TRIG');
        if (!echo || !trig || !an.connected(echo.node, node)) continue;
        const now = this.time * 1000;
        const triggered = [...this.trigPulse.entries()].some(([pin, at]) => now - at < 100000 && an.connected(pin, trig.node));
        if (!triggered) return 0;
        const dist = part.props.distance ?? 50;
        if (dist > 400 || dist < 2) return 38000; // fora do alcance: o HC-SR04 devolve um pulso longo
        return Math.ceil((dist * 2) / 0.034); // velocidade do som ≈ 0,034 cm/µs (ida e volta)
      }
      return 0;
    },
    millis: () => this.time,
    micros: () => this.time * 1000,
    serialBegin: () => {},
    serialWrite: (text) => {
      this.serial += text;
      if (this.serial.length > 6000) this.serial = this.serial.slice(-5000);
    },
    servoAttach: (obj, n) => {
      const node = this.nodeOf(n);
      this.servos.set(obj, { pin: node, target: this.servos.get(obj)?.target ?? 90 });
      this.dirty();
    },
    servoWrite: (obj, angle) => {
      const s = this.servos.get(obj);
      if (s) s.target = angle;
    },
    servoRead: (obj) => this.servos.get(obj)?.target ?? 90,
    servoDetach: (obj) => {
      this.servos.delete(obj);
      this.dirty();
    },
    random: () => Math.random(),
    onLine: (line) => (this.currentLine = line),
  };

  /** Entrada flutuando: valor imprevisível que muda de vez em quando. */
  private noisy(node: string): 0 | 1 {
    const cur = this.noise.get(node);
    if (!cur || this.time - cur.at > 150 + Math.random() * 400) {
      const v = Math.random() < 0.5 ? 0 : 1;
      this.noise.set(node, { v, at: this.time });
      return v as 0 | 1;
    }
    return cur.v as 0 | 1;
  }

  /** Avança a simulação em `dt` milissegundos de tempo real. */
  step(dt: number) {
    this.updateServos(dt);
    if (!this.board.powered || !this.gen || this.error || this.finished) return;
    // Botão RESET: com o pino RESET em nível baixo o programa fica parado e recomeça ao soltar.
    const vReset = this.analysis().voltages.RESET;
    if (vReset !== undefined && vReset < 1) {
      this.wasReset = true;
      this.board.pins = {};
      this.dirty();
      return;
    }
    if (this.wasReset) {
      this.wasReset = false;
      this.restart();
      return;
    }
    const target = this.time + Math.min(dt, 100);
    let guard = 0;
    try {
      while (guard++ < 600) {
        if (this.toneEnd && this.toneEnd.at <= Math.max(this.time, this.wakeAt)) {
          const p = this.board.pins[this.toneEnd.pin];
          if (p) { p.tone = null; p.value = 0; }
          this.toneEnd = null;
          this.dirty();
        }
        if (this.wakeAt > target) break;
        this.time = Math.max(this.time, this.wakeAt);
        const r = this.gen.next();
        if (r.done) { this.finished = true; break; }
        this.wakeAt = this.time + (r.value.t === 'delay' ? r.value.ms : 0.02);
      }
      this.time = Math.max(this.time, target);
    } catch (e) {
      if (e instanceof RuntimeError) this.error = { line: e.line, message: e.message };
      else this.error = { line: this.currentLine, message: 'Erro inesperado ao executar o programa.' };
    }
  }

  private updateServos(dt: number) {
    const an = this.analysis();
    for (const part of this.circuit.parts) {
      if (part.kind !== 'servo') continue;
      const res = an.parts[part.id];
      const sig = res?.legs.find((l) => l.key === 'SIG');
      let target: number | null = null;
      if (res?.powered && sig && this.board.powered) {
        for (const s of this.servos.values()) if (an.connected(s.pin, sig.node)) target = s.target;
      }
      const cur = this.servoAngles[part.id] ?? 90;
      if (target === null) continue;
      const maxStep = (dt / 100) * 60; // ~0,1 s para girar 60° (como um SG90)
      const diff = target - cur;
      this.servoAngles[part.id] = Math.abs(diff) <= maxStep ? target : cur + Math.sign(diff) * maxStep;
    }
  }

  /** Pino (número) para mostrar no painel, a partir do nó. */
  static pinName(node: string) {
    const n = nodeToPinNumber(node);
    if (n === null) return node;
    return n >= 14 ? `A${n - 14}` : String(n);
  }
}
