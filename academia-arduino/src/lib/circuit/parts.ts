/**
 * Definição das pernas (terminais) de cada componente da bancada.
 * As posições são deslocamentos em furos a partir do furo âncora.
 */
import { offsetHole, parseHole } from '../breadboard';
import type { LedColor, PartKind, PlacedPart } from './types';

export interface LegDef {
  key: string;
  name: string;
  /** deslocamento ao longo do componente (colunas na horizontal, linhas na vertical) */
  along: number;
  /** deslocamento transversal (usado pelo botão, que atravessa o canal) */
  across?: number;
}

export interface PartDef {
  kind: PartKind;
  name: string;
  legs: LegDef[];
  /** Pode girar (horizontal/vertical)? */
  rotatable: boolean;
  /** Pode inverter a ordem das pernas? */
  flippable: boolean;
}

export const PART_DEFS: Record<PartKind, PartDef> = {
  led: {
    kind: 'led',
    name: 'LED',
    legs: [
      { key: 'A', name: 'ânodo (+, perna longa)', along: 0 },
      { key: 'K', name: 'cátodo (−, perna curta)', along: 1 },
    ],
    rotatable: true,
    flippable: true,
  },
  resistor: {
    kind: 'resistor',
    name: 'Resistor',
    legs: [
      { key: '1', name: 'terminal 1', along: 0 },
      { key: '2', name: 'terminal 2', along: 4 },
    ],
    rotatable: true,
    flippable: false,
  },
  button: {
    kind: 'button',
    name: 'Botão (push button)',
    // O botão de 4 pernas atravessa o canal central.
    // As pernas 1a/1b (mesma coluna, lados opostos do canal) são sempre ligadas;
    // 2a/2b também. Ao apertar, o lado 1 se liga ao lado 2.
    legs: [
      { key: '1a', name: 'perna 1 (cima)', along: 0, across: 0 },
      { key: '2a', name: 'perna 2 (cima)', along: 2, across: 0 },
      { key: '1b', name: 'perna 1 (baixo)', along: 0, across: 1 },
      { key: '2b', name: 'perna 2 (baixo)', along: 2, across: 1 },
    ],
    rotatable: false,
    flippable: false,
  },
  buzzer: {
    kind: 'buzzer',
    name: 'Buzzer passivo',
    legs: [
      { key: 'P', name: 'positivo (+)', along: 0 },
      { key: 'N', name: 'negativo (−)', along: 3 },
    ],
    rotatable: true,
    flippable: true,
  },
  pot: {
    kind: 'pot',
    name: 'Potenciômetro',
    legs: [
      { key: '1', name: 'extremidade 1', along: 0 },
      { key: 'W', name: 'cursor (meio)', along: 2 },
      { key: '3', name: 'extremidade 2', along: 4 },
    ],
    rotatable: false,
    flippable: false,
  },
  ldr: {
    kind: 'ldr',
    name: 'LDR (sensor de luz)',
    legs: [
      { key: '1', name: 'terminal 1', along: 0 },
      { key: '2', name: 'terminal 2', along: 2 },
    ],
    rotatable: true,
    flippable: false,
  },
  servo: {
    kind: 'servo',
    name: 'Servo motor',
    legs: [
      { key: 'GND', name: 'fio marrom (GND)', along: 0 },
      { key: 'VCC', name: 'fio vermelho (5V)', along: 1 },
      { key: 'SIG', name: 'fio laranja (sinal)', along: 2 },
    ],
    rotatable: false,
    flippable: false,
  },
  ultrasonic: {
    kind: 'ultrasonic',
    name: 'Sensor ultrassônico HC-SR04',
    legs: [
      { key: 'VCC', name: 'VCC (5V)', along: 0 },
      { key: 'TRIG', name: 'TRIG (disparo)', along: 1 },
      { key: 'ECHO', name: 'ECHO (eco)', along: 2 },
      { key: 'GND', name: 'GND', along: 3 },
    ],
    rotatable: false,
    flippable: false,
  },
};

export const LED_COLORS: Record<LedColor, { name: string; fill: string; glow: string; vf: number }> = {
  red: { name: 'vermelho', fill: '#ef4444', glow: '#ff5a5a', vf: 1.9 },
  yellow: { name: 'amarelo', fill: '#facc15', glow: '#ffe14d', vf: 2.0 },
  green: { name: 'verde', fill: '#22c55e', glow: '#4dff88', vf: 2.1 },
  blue: { name: 'azul', fill: '#3b82f6', glow: '#6ab0ff', vf: 2.9 },
  white: { name: 'branco', fill: '#e5e7eb', glow: '#ffffff', vf: 2.9 },
};

/** Furo de cada perna do componente. null se alguma perna cair fora da protoboard. */
export function legHoles(p: PlacedPart): Record<string, string> | null {
  const def = PART_DEFS[p.kind];
  const n = def.legs.length;
  const out: Record<string, string> = {};
  for (let i = 0; i < n; i++) {
    const leg = def.legs[i];
    // Inverter = o primeiro terminal vai para a posição do último, e vice-versa.
    const src = p.flip && def.flippable ? def.legs[n - 1 - i] : leg;
    const along = src.along;
    const across = leg.across ?? 0;
    const h =
      p.orient === 'v' && def.rotatable
        ? offsetHole(p.anchor, across, along)
        : offsetHole(p.anchor, along, across);
    if (!h) return null;
    out[leg.key] = h;
  }
  return out;
}

/** Verifica se o componente cabe na posição (botão deve ficar sobre o canal central). */
export function placementError(p: PlacedPart): string | null {
  const a = parseHole(p.anchor);
  if (!a || a.kind !== 'terminal') return 'Coloque o componente nos furos do miolo da protoboard (linhas a até j).';
  if (p.kind === 'button' && a.row !== 'e')
    return 'O botão deve ficar sobre o canal central: duas pernas na linha e e duas na linha f.';
  if (!legHoles(p)) return 'O componente ficaria para fora da protoboard. Escolha outro furo.';
  return null;
}

export function partLabel(p: PlacedPart): string {
  const def = PART_DEFS[p.kind];
  if (p.kind === 'led') return `LED ${LED_COLORS[p.props.color ?? 'red'].name}`;
  if (p.kind === 'resistor') return `Resistor de ${formatOhms(p.props.ohms ?? 220)}`;
  return def.name;
}

export function formatOhms(r: number): string {
  if (r >= 1e6) return `${trim(r / 1e6)} MΩ`;
  if (r >= 1e3) return `${trim(r / 1e3)} kΩ`;
  return `${trim(r)} Ω`;
}
const trim = (v: number) => (Math.round(v * 100) / 100).toString().replace('.', ',');
