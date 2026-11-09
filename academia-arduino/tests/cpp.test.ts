import { describe, expect, it } from 'vitest';
import { checkCode } from '../src/lib/cpp/check';
import { Simulator } from '../src/lib/sim/simulator';
import type { Circuit } from '../src/lib/circuit/types';

const BLINK = `// Pisca o LED
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`;

const led13: Circuit = {
  parts: [
    { id: 'l', kind: 'led', anchor: 'c10', orient: 'h', props: {} },
    { id: 'r', kind: 'resistor', anchor: 'd11', orient: 'h', props: { ohms: 220 } },
  ],
  wires: [
    { id: 'a', a: 'ard:D13', b: 'a10', color: 'yellow' },
    { id: 'b', a: 'a15', b: 'ard:GND3', color: 'black' },
  ],
};

function run(src: string, circuit: Circuit = { parts: [], wires: [] }) {
  const r = checkCode(src);
  expect(r.errors).toEqual([]);
  const sim = new Simulator(circuit);
  sim.setProgram(r.program);
  sim.setPowered(true);
  return sim;
}
const advance = (sim: Simulator, ms: number) => { for (let t = 0; t < ms; t += 10) sim.step(10); };

describe('verificador de código', () => {
  it('aceita o pisca-pisca', () => {
    const r = checkCode(BLINK);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });
  it('detecta falta de ponto e vírgula com a linha certa', () => {
    const r = checkCode(BLINK.replace('pinMode(13, OUTPUT);', 'pinMode(13, OUTPUT)'));
    expect(r.errors[0].message).toContain('ponto e vírgula');
    expect(r.errors[0].line).toBe(3);
  });
  it('detecta nome errado e sugere correção', () => {
    const r = checkCode(BLINK.replace('digitalWrite(13, HIGH)', 'digitalwrite(13, HIGH)'));
    expect(r.errors[0].message).toContain('digitalwrite');
    expect(r.errors[0].hint).toContain('digitalWrite');
  });
  it('detecta high minúsculo, pinMode esquecido e falta de loop', () => {
    expect(checkCode(BLINK.replace('HIGH', 'high')).errors[0].message).toContain('MAIÚSCULAS');
    expect(checkCode(BLINK.replace('pinMode(13, OUTPUT);', '')).warnings[0].message).toContain('saída');
    expect(checkCode('void setup() {}').errors[0].message).toContain('loop');
    expect(checkCode('void setup() {\n  pinMode(13, OUTPUT);\n\nvoid loop() {}').errors.length).toBe(1);
  });
});

describe('interpretador + simulador', () => {
  it('pisca o LED do pino 13 a cada segundo', () => {
    const sim = run(BLINK, led13);
    advance(sim, 500);
    expect(sim.analysis().parts.l.brightness).toBeGreaterThan(0.4);
    advance(sim, 1000);
    expect(sim.analysis().parts.l.brightness).toBe(0);
    advance(sim, 1000);
    expect(sim.analysis().parts.l.brightness).toBeGreaterThan(0.4);
  });
  it('int de 16 bits, divisão inteira e Serial', () => {
    const sim = run(`
int a = 30000;
void setup() {
  Serial.begin(9600);
  a = a + 10000;
  Serial.println(a);
  Serial.println(7 / 2);
  Serial.println(7 / 2.0);
  long b = 60L * 1000;
  Serial.println(b);
  for (int i = 0; i < 3; i++) { Serial.print(i); }
  Serial.println();
  int v[] = {5, 6, 7};
  Serial.println(v[2] + map(512, 0, 1023, 0, 255));
}
void loop() {}`);
    advance(sim, 50);
    expect(sim.serial.split('\n')).toEqual(['-25536', '3', '3.50', '60000', '012', '134', '']);
  });
  it('erro de execução: posição fora do vetor', () => {
    const sim = run(`int v[3];\nvoid setup() {\n  v[3] = 1;\n}\nvoid loop() {}`);
    advance(sim, 20);
    expect(sim.error?.line).toBe(3);
  });
  it('sensor ultrassônico mede a distância', () => {
    const c: Circuit = {
      parts: [{ id: 'u', kind: 'ultrasonic', anchor: 'a10', orient: 'h', props: { distance: 20 } }],
      wires: [
        { id: '1', a: 'e10', b: 'ard:5V', color: 'red' },
        { id: '2', a: 'e11', b: 'ard:D9', color: 'green' },
        { id: '3', a: 'e12', b: 'ard:D10', color: 'blue' },
        { id: '4', a: 'e13', b: 'ard:GND1', color: 'black' },
      ],
    };
    const sim = run(`
void setup() { Serial.begin(9600); pinMode(9, OUTPUT); pinMode(10, INPUT); }
void loop() {
  digitalWrite(9, LOW); delayMicroseconds(2);
  digitalWrite(9, HIGH); delayMicroseconds(10);
  digitalWrite(9, LOW);
  long d = pulseIn(10, HIGH);
  int cm = d * 0.034 / 2;
  Serial.println(cm);
  delay(100);
}`, c);
    advance(sim, 150);
    expect(sim.serial.split('\n')[0]).toBe('20');
  });
});
