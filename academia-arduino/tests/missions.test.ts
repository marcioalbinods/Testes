import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../src/data/missions';
import { runRules } from '../src/lib/circuit/checks';
import { analyze } from '../src/lib/circuit/engine';
import { checkCode } from '../src/lib/cpp/check';
import { legHoles, placementError } from '../src/lib/circuit/parts';
import { Simulator } from '../src/lib/sim/simulator';
import type { Circuit } from '../src/lib/circuit/types';
import * as C from '../src/data/circuits';

function sim(code: string, circuit: Circuit) {
  const r = checkCode(code);
  expect(r.errors, code).toEqual([]);
  const s = new Simulator(circuit);
  s.setProgram(r.program);
  s.setPowered(true);
  return s;
}
const run = (s: Simulator, ms: number) => { for (let t = 0; t < ms; t += 5) s.step(5); };
const lit = (s: Simulator, id: string) => (s.analysis().parts[id]?.brightness ?? 0) > 0.3;
const fillTemplate = (t: string) => t.replace(/\[\[([^\]]+)\]\]/g, (_, a: string) => a.split('|')[0]);

function noOverlap(c: Circuit) {
  const used = new Map<string, string>();
  for (const p of c.parts) {
    expect(placementError(p), p.id).toBeNull();
    for (const h of Object.values(legHoles(p)!)) {
      expect(used.has(h), `${p.id} usa ${h}, já ocupado por ${used.get(h)}`).toBe(false);
      used.set(h, p.id);
    }
  }
}

describe('estrutura das 20 missões', () => {
  it('tem 20 missões numeradas e completas', () => {
    expect(MISSIONS).toHaveLength(20);
    MISSIONS.forEach((m, i) => {
      expect(m.n).toBe(i + 1);
      expect(m.quiz.length).toBeGreaterThanOrEqual(2);
      m.quiz.forEach((q) => expect(q.correct).toBeLessThan(q.options.length));
      expect(m.materials.length).toBeGreaterThan(0);
      expect(m.safety.length).toBeGreaterThan(0);
      expect(m.challenge.text.length).toBeGreaterThan(10);
      if (m.steps) for (const st of m.steps) for (const id of st.add) {
        expect(m.circuit!.parts.some((p) => p.id === id) || m.circuit!.wires.some((w) => w.id === id), `${m.id}: ${id}`).toBe(true);
      }
      if (m.steps) {
        const added = new Set(m.steps.flatMap((s) => s.add));
        for (const p of m.circuit!.parts) expect(added.has(p.id), `${m.id}: peça ${p.id} sem passo`).toBe(true);
        for (const w of m.circuit!.wires) expect(added.has(w.id), `${m.id}: fio ${w.id} sem passo`).toBe(true);
      }
    });
  });
  it('todos os códigos compilam sem erros nem avisos', () => {
    for (const m of MISSIONS) {
      for (const code of [m.code, m.challenge.solutionCode, ...(m.projects ?? []).map((p) => p.code)]) {
        if (!code) continue;
        const r = checkCode(code);
        expect(r.errors, `${m.id}\n${code}`).toEqual([]);
        expect(r.warnings, `${m.id}\n${code}`).toEqual([]);
      }
      if (m.activity.type === 'code-fill') expect(checkCode(fillTemplate(m.activity.template)).errors).toEqual([]);
    }
  });
  it('circuitos de referência passam nas regras das atividades e não têm perigos', () => {
    for (const m of MISSIONS) {
      if (m.circuit) {
        noOverlap(m.circuit);
        const an = analyze(m.circuit, { powered: true, pins: {} });
        expect(an.diagnostics.filter((d) => d.severity === 'danger'), m.id).toEqual([]);
      }
      if (m.activity.type === 'build') {
        const r = runRules(m.circuit!, m.activity.rules);
        expect(r.problems, m.id).toEqual([]);
        // a montagem inicial ainda não pode estar pronta
        expect(runRules(m.activity.start, m.activity.rules).ok, `${m.id}: começa pronta`).toBe(false);
      }
      for (const p of m.projects ?? []) {
        noOverlap(p.circuit);
        expect(runRules(p.circuit, p.rules).problems, p.id).toEqual([]);
      }
    }
  });
});

const M = (n: number) => MISSIONS[n - 1];

describe('programas das missões funcionam no simulador', () => {
  it('M07 pisca', () => {
    const s = sim(M(7).code!, M(7).circuit!);
    run(s, 500); expect(lit(s, 'al')).toBe(true);
    run(s, 1000); expect(lit(s, 'al')).toBe(false);
  });
  it('M08 alterna', () => {
    const s = sim(M(8).code!, M(8).circuit!);
    run(s, 250); expect([lit(s, 'al'), lit(s, 'bl')]).toEqual([true, false]);
    run(s, 500); expect([lit(s, 'al'), lit(s, 'bl')]).toEqual([false, true]);
  });
  it('M09 semáforo verde → amarelo → vermelho', () => {
    const s = sim(M(9).code!, M(9).circuit!);
    run(s, 1000); expect([lit(s, 'cl'), lit(s, 'bl'), lit(s, 'al')]).toEqual([true, false, false]);
    run(s, 3800); expect([lit(s, 'cl'), lit(s, 'bl'), lit(s, 'al')]).toEqual([false, true, false]);
    run(s, 1500); expect([lit(s, 'cl'), lit(s, 'bl'), lit(s, 'al')]).toEqual([false, false, true]);
  });
  it('M10 botão: LED copia a leitura', () => {
    const c = M(10).circuit!;
    const s = sim(M(10).code!, c);
    run(s, 50); expect(lit(s, 'al')).toBe(true);
    s.setCircuit({ ...c, parts: c.parts.map((p) => (p.id === 'bt' ? { ...p, props: { pressed: true } } : p)) });
    run(s, 50); expect(lit(s, 'al')).toBe(false);
  });
  it('M10 desafio: só acende apertado', () => {
    const c = M(10).circuit!;
    const s = sim(M(10).challenge.solutionCode!, c);
    run(s, 50); expect(lit(s, 'al')).toBe(false);
    s.setCircuit({ ...c, parts: c.parts.map((p) => (p.id === 'bt' ? { ...p, props: { pressed: true } } : p)) });
    run(s, 50); expect(lit(s, 'al')).toBe(true);
  });
  it('M11 contador no Serial', () => {
    const s = sim(M(11).code!, M(11).circuit!);
    run(s, 2100);
    expect(s.serial).toContain('Piscadas: 1\nPiscadas: 2\nPiscadas: 3');
  });
  it('M12 porteiro', () => {
    const c = M(12).circuit!;
    const s = sim(M(12).code!, c);
    run(s, 50); expect([lit(s, 'al'), lit(s, 'bl')]).toEqual([true, false]);
    s.setCircuit({ ...c, parts: c.parts.map((p) => (p.id === 'bt' ? { ...p, props: { pressed: true } } : p)) });
    run(s, 50); expect([lit(s, 'al'), lit(s, 'bl')]).toEqual([false, true]);
  });
  it('M13 buzzer toca notas', () => {
    const s = sim(M(13).code!, M(13).circuit!);
    run(s, 100); expect(s.analysis().parts.bz.sound).toBe(262);
    run(s, 400); expect(s.analysis().parts.bz.sound).toBe(294);
    run(s, 900); expect(s.analysis().parts.bz.sound).toBeNull();
  });
  it('M14 potenciômetro controla o brilho', () => {
    const c = M(14).circuit!;
    const at = (pos: number) => {
      const cc = { ...c, parts: c.parts.map((p) => (p.id === 'pt' ? { ...p, props: { pos } } : p)) };
      const s = sim(M(14).code!, cc);
      run(s, 100);
      return s.analysis().parts.al.brightness ?? 0;
    };
    expect(at(0.95)).toBeLessThan(0.15);
    expect(at(0.5)).toBeGreaterThan(at(0.9));
    expect(at(0.02)).toBeGreaterThan(0.7);
  });
  it('M15 desafio: luz acende no escuro', () => {
    const c = M(15).circuit!;
    const at = (light: number) => {
      const s = sim(M(15).challenge.solutionCode!, { ...c, parts: c.parts.map((p) => (p.id === 'ld' ? { ...p, props: { light } } : p)) });
      run(s, 300);
      return lit(s, 'al');
    };
    expect(at(0.05)).toBe(true);
    expect(at(0.9)).toBe(false);
  });
  it('M16 for percorre 11, 12, 13', () => {
    const s = sim(M(16).code!, M(16).circuit!);
    run(s, 150); expect([lit(s, 'cl'), lit(s, 'bl'), lit(s, 'al')]).toEqual([true, false, false]);
    run(s, 300); expect([lit(s, 'cl'), lit(s, 'bl'), lit(s, 'al')]).toEqual([false, true, false]);
    run(s, 300); expect([lit(s, 'cl'), lit(s, 'bl'), lit(s, 'al')]).toEqual([false, false, true]);
    run(s, 250); expect([lit(s, "cl"), lit(s, "bl"), lit(s, "al")]).toEqual([true, true, true]);
  });
  it('M17 servo vai a 0, 90 e 180', () => {
    const s = sim(M(17).code!, M(17).circuit!);
    run(s, 900); expect(s.servoAngles.sv).toBe(0);
    run(s, 1000); expect(s.servoAngles.sv).toBe(90);
    run(s, 1000); expect(s.servoAngles.sv).toBe(180);
  });
  it('M18 cancela abre com o botão', () => {
    const c = M(18).circuit!;
    const s = sim(M(18).code!, c);
    run(s, 500); expect(s.servoAngles.sv).toBe(0);
    s.setCircuit({ ...c, parts: c.parts.map((p) => (p.id === 'bt' ? { ...p, props: { pressed: true } } : p)) });
    run(s, 600); expect(s.servoAngles.sv).toBe(90);
  });
  it('M19 mede distância e acende LED perto', () => {
    const c = M(19).circuit!;
    const at = (distance: number) => {
      const s = sim(M(19).code!, { ...c, parts: c.parts.map((p) => (p.id === 'us' ? { ...p, props: { distance } } : p)) });
      run(s, 300);
      return { serial: s.serial, led: lit(s, 'al') };
    };
    const near = at(12);
    expect(near.serial).toContain('Distancia: 12 cm');
    expect(near.led).toBe(true);
    expect(at(80).led).toBe(false);
  });
  it('M20 projetos funcionam', () => {
    const [luz, alarme, cancela] = M(20).projects!;
    // luz: escuro = brilho alto
    const dark = sim(luz.code, { ...luz.circuit, parts: luz.circuit.parts.map((p) => (p.id === 'ld' ? { ...p, props: { light: 0.05 } } : p)) });
    run(dark, 200);
    expect(dark.analysis().parts.al.brightness).toBeGreaterThan(0.5);
    // alarme: objeto perto toca
    const al = sim(alarme.code, { ...alarme.circuit, parts: alarme.circuit.parts.map((p) => (p.id === 'us' ? { ...p, props: { distance: 10 } } : p)) });
    let sounded = false;
    for (let t = 0; t < 600; t += 5) { al.step(5); if (al.analysis().parts.bz.sound) sounded = true; }
    expect(sounded).toBe(true);
    // cancela: carro perto abre
    const ca = sim(cancela.code, { ...cancela.circuit, parts: cancela.circuit.parts.map((p) => (p.id === 'us' ? { ...p, props: { distance: 8 } } : p)) });
    run(ca, 800);
    expect(ca.servoAngles.sv).toBe(90);
  });
  it('M05: montagem com defeito mostra os dois erros', () => {
    const r = runRules(C.C_LED_FAULTY, [{ type: 'ledPowered' }]);
    expect(r.ok).toBe(false);
  });
  it('circuitos extras de demonstração', () => {
    const an = analyze(C.C_FLOW_TWO, { powered: true, pins: {} });
    expect(an.parts.l1.brightness).toBeGreaterThan(0.4);
    expect(an.parts.l2.brightness).toBeGreaterThan(0.3);
    const sw = (pressed: boolean) => analyze({ ...C.C_FLOW_SWITCH, parts: C.C_FLOW_SWITCH.parts.map((p) => (p.id === 'bt' ? { ...p, props: { pressed } } : p)) }, { powered: true, pins: {} });
    expect(sw(false).parts.l1.brightness).toBe(0);
    expect(sw(true).parts.l1.brightness).toBeGreaterThan(0.4);
  });
});

describe('montagem dos blocos', () => {
  it('C_BLOCKS: LEDs 11-13, botão 2 e buzzer 8', () => {
    noOverlap(C.C_BLOCKS);
    const r = runRules(C.C_BLOCKS, [
      { type: 'ledPin', pin: 'D13', color: 'red' }, { type: 'ledPin', pin: 'D12', color: 'yellow' }, { type: 'ledPin', pin: 'D11', color: 'green' },
      { type: 'buttonPin', pin: 'D2' }, { type: 'buzzerPin', pin: 'D8' },
    ]);
    expect(r.problems).toEqual([]);
  });
});

import { DETECTIVE } from '../src/data/games';
describe('detetive de circuitos', () => {
  it('cada caso tem mesmo um defeito', () => {
    for (const d of DETECTIVE) {
      noOverlap(d.circuit);
      const rules = d.id === 'botao-mesmo-lado' ? [{ type: 'buttonPin' as const, pin: 'D2' }] : [{ type: 'ledPowered' as const }];
      const r = runRules(d.circuit, rules);
      expect(r.ok, d.id).toBe(false);
      expect(d.correct).toBeLessThan(d.options.length);
    }
  });
});
