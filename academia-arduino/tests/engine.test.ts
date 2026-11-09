import { describe, expect, it } from 'vitest';
import { analyze, defaultPin, digitalReadNode, type BoardState } from '../src/lib/circuit/engine';
import type { Circuit } from '../src/lib/circuit/types';
import { areConnected, connectedHoles, netOf } from '../src/lib/breadboard';
import { legHoles } from '../src/lib/circuit/parts';

const powered = (pins: BoardState['pins'] = {}): BoardState => ({ powered: true, pins });
const out = (value: 0 | 1) => ({ ...defaultPin(), mode: 'OUTPUT' as const, value });

describe('protoboard', () => {
  it('grupos de 5 furos e canal central', () => {
    expect(areConnected('a5', 'e5')).toBe(true);
    expect(areConnected('e5', 'f5')).toBe(false);
    expect(areConnected('a5', 'a6')).toBe(false);
    expect(connectedHoles('c7')).toHaveLength(5);
    expect(connectedHoles('h7').sort()).toEqual(['f7', 'g7', 'h7', 'i7', 'j7'].sort());
  });
  it('trilhos contínuos e interrompidos', () => {
    expect(areConnected('tp-2', 'tp-29')).toBe(true);
    expect(areConnected('tp-2', 'tn-2')).toBe(false);
    expect(areConnected('tp-2', 'bp-2')).toBe(false);
    expect(areConnected('tp-2', 'tp-29', { railsSplit: true })).toBe(false);
    expect(areConnected('tp-2', 'tp-13', { railsSplit: true })).toBe(true);
    expect(connectedHoles('tp-2')).toHaveLength(20);
    expect(netOf('tp-7')).toBeNull();
  });
  it('pernas do LED e do botão', () => {
    expect(legHoles({ id: 'l', kind: 'led', anchor: 'c10', orient: 'h', props: {} })).toEqual({ A: 'c10', K: 'c11' });
    expect(legHoles({ id: 'l', kind: 'led', anchor: 'c10', orient: 'h', flip: true, props: {} })).toEqual({ A: 'c11', K: 'c10' });
    expect(legHoles({ id: 'b', kind: 'button', anchor: 'e10', orient: 'h', props: {} })).toEqual({ '1a': 'e10', '2a': 'e12', '1b': 'f10', '2b': 'f12' });
  });
});

// Circuito clássico: 5V → trilho + → resistor 220 Ω → LED → trilho − → GND
const ledCircuit = (opts: { flip?: boolean; ohms?: number; noResistor?: boolean } = {}): Circuit => ({
  parts: [
    ...(opts.noResistor ? [] : [{ id: 'r1', kind: 'resistor' as const, anchor: 'a5', orient: 'h' as const, props: { ohms: opts.ohms ?? 220 } }]),
    { id: 'l1', kind: 'led', anchor: 'c9', orient: 'h', flip: opts.flip, props: { color: 'red' } },
  ],
  wires: [
    { id: 'w1', a: 'ard:5V', b: 'tp-2', color: 'red' },
    { id: 'w2', a: 'ard:GND1', b: 'tn-3', color: 'black' },
    { id: 'w3', a: opts.noResistor ? 'tp-9' : 'tp-5', b: opts.noResistor ? 'b9' : 'b5', color: 'red' },
    { id: 'w4', a: 'b10', b: 'tn-10', color: 'black' },
  ],
});

describe('motor do circuito', () => {
  it('LED com resistor acende com corrente segura', () => {
    const an = analyze(ledCircuit(), powered());
    const led = an.parts.l1;
    expect(led.current).toBeGreaterThan(0.010);
    expect(led.current).toBeLessThan(0.016);
    expect(led.brightness).toBeGreaterThan(0.5);
    expect(an.ok).toBe(true);
    expect(an.diagnostics).toHaveLength(0);
    // corrente nos fios segue o caminho
    expect(an.wires.find((w) => w.id === 'w1')!.current).toBeGreaterThan(0.01);
  });
  it('LED desligado sem alimentação', () => {
    const an = analyze(ledCircuit(), { powered: false, pins: {} });
    expect(an.parts.l1.brightness).toBe(0);
  });
  it('LED invertido não acende e é diagnosticado', () => {
    const an = analyze(ledCircuit({ flip: true }), powered());
    expect(an.parts.l1.brightness).toBe(0);
    expect(an.diagnostics.map((d) => d.code)).toContain('led-reversed');
  });
  it('LED sem resistor tem corrente perigosa', () => {
    const an = analyze(ledCircuit({ noResistor: true }), powered());
    expect(an.diagnostics.map((d) => d.code)).toContain('led-overcurrent');
  });
  it('curto entre 5V e GND', () => {
    const c: Circuit = { parts: [], wires: [{ id: 'w', a: 'ard:5V', b: 'tp-2', color: 'red' }, { id: 'x', a: 'tp-9', b: 'ard:GND2', color: 'black' }] };
    const an = analyze(c, powered());
    expect(an.diagnostics[0].code).toBe('short-5v');
    expect(an.ok).toBe(false);
  });
  it('LED no pino 13 acende só em HIGH', () => {
    const c: Circuit = {
      parts: [
        { id: 'l', kind: 'led', anchor: 'c10', orient: 'h', props: {} },
        { id: 'r', kind: 'resistor', anchor: 'd11', orient: 'h', props: { ohms: 220 } },
      ],
      wires: [
        { id: 'a', a: 'ard:D13', b: 'a10', color: 'yellow' },
        { id: 'b', a: 'a15', b: 'ard:GND3', color: 'black' },
      ],
    };
    expect(analyze(c, powered({ D13: out(1) })).parts.l.brightness).toBeGreaterThan(0.4);
    expect(analyze(c, powered({ D13: out(0) })).parts.l.brightness).toBe(0);
    expect(analyze(c, powered({ D13: { ...out(1), pwm: 64 } })).parts.l.brightness).toBeLessThan(0.4);
  });
  it('botão com INPUT_PULLUP', () => {
    const mk = (pressed: boolean): Circuit => ({
      parts: [{ id: 'b', kind: 'button', anchor: 'e10', orient: 'h', props: { pressed } }],
      wires: [
        { id: 'a', a: 'ard:D2', b: 'a10', color: 'yellow' },
        { id: 'c', a: 'j12', b: 'ard:GND1', color: 'black' },
      ],
    });
    const pins = { D2: { ...defaultPin(), mode: 'INPUT_PULLUP' as const } };
    expect(digitalReadNode(analyze(mk(false), powered(pins)), 'D2')).toBe(1);
    expect(digitalReadNode(analyze(mk(true), powered(pins)), 'D2')).toBe(0);
    const floatPins = { D2: defaultPin() };
    expect(digitalReadNode(analyze(mk(false), powered(floatPins)), 'D2')).toBeNull();
  });
});
