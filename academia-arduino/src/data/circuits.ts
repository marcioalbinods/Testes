/**
 * Circuitos de referência das missões e demonstrações.
 * Todos são conferidos automaticamente pelos testes (tests/missions.test.ts):
 * as regras de cada atividade precisam aprovar o circuito, e o programa da missão
 * precisa produzir o comportamento esperado no simulador.
 */
import type { Circuit, LedColor, PlacedPart, Wire, WireColor } from '../lib/circuit/types';

const w = (id: string, a: string, b: string, color: WireColor): Wire => ({ id, a, b, color });

interface Group { parts: PlacedPart[]; wires: Wire[] }

/** GND da placa (barra de cima) ligado ao trilho negativo de cima. */
const GND_TOP: Wire = w('gt', 'ard:GND3', 'tn-2', 'black');
/** 5V e GND ligados aos trilhos de baixo. */
const RAILS_BOTTOM: Wire[] = [w('p5', 'ard:5V', 'bp-2', 'red'), w('pg', 'ard:GND1', 'bn-3', 'black')];

/**
 * LED + resistor de 220 Ω controlados por um pino (metade de cima da protoboard).
 * pino → a{c} ; resistor b{c}–b{c+4} ; LED ânodo c{c+4}, cátodo c{c+5} ; d{c+5} → trilho −
 */
function ledGroup(prefix: string, pin: string, c: number, color: LedColor, railCol: number, wireColor: WireColor = 'yellow'): Group {
  return {
    parts: [
      { id: `${prefix}r`, kind: 'resistor', anchor: `b${c}`, orient: 'h', props: { ohms: 220 } },
      { id: `${prefix}l`, kind: 'led', anchor: `c${c + 4}`, orient: 'h', props: { color } },
    ],
    wires: [w(`${prefix}w1`, `ard:${pin}`, `a${c}`, wireColor), w(`${prefix}w2`, `d${c + 5}`, `tn-${railCol}`, 'black')],
  };
}

const merge = (...gs: (Group | Wire | Wire[] | PlacedPart)[]): Circuit => {
  const c: Circuit = { parts: [], wires: [] };
  for (const g of gs) {
    if (Array.isArray(g)) c.wires.push(...g);
    else if ('parts' in g) { c.parts.push(...g.parts); c.wires.push(...g.wires); }
    else if ('kind' in g) c.parts.push(g);
    else c.wires.push(g);
  }
  return c;
};

const BUTTON_D2 = (col: number, gndRail: number): Group => ({
  parts: [{ id: 'bt', kind: 'button', anchor: `e${col}`, orient: 'h', props: { pressed: false } }],
  wires: [w('bw1', 'ard:D2', `a${col}`, 'blue'), w('bw2', `a${col + 2}`, `tn-${gndRail}`, 'black')],
});

const SERVO_BOTTOM = (col: number, pin: string): Group => ({
  parts: [{ id: 'sv', kind: 'servo', anchor: `h${col}`, orient: 'h', props: {} }],
  wires: [w('sw1', `j${col}`, `bn-${railNear(col)}`, 'black'), w('sw2', `j${col + 1}`, `bp-${railNear(col + 1)}`, 'red'), w('sw3', `j${col + 2}`, `ard:${pin}`, 'orange')],
});

const SONAR = (col: number): Group => ({
  parts: [{ id: 'us', kind: 'ultrasonic', anchor: `a${col}`, orient: 'h', props: { distance: 40 } }],
  wires: [
    w('uw1', `e${col}`, 'ard:5V', 'red'),
    w('uw2', `e${col + 1}`, 'ard:D9', 'green'),
    w('uw3', `e${col + 2}`, 'ard:D10', 'blue'),
    w('uw4', `e${col + 3}`, `tn-${railNear(col + 3)}`, 'black'),
  ],
});

/** coluna de trilho mais próxima */
function railNear(col: number) {
  const cols = [2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29];
  return cols.reduce((b, c) => (Math.abs(c - col) < Math.abs(b - col) ? c : b), cols[0]);
}

export const C_RAILS: Circuit = merge(RAILS_BOTTOM);

export const C_LED_RAILS: Circuit = merge(
  RAILS_BOTTOM,
  { id: 'r1', kind: 'resistor', anchor: 'g5', orient: 'h', props: { ohms: 220 } },
  { id: 'l1', kind: 'led', anchor: 'h9', orient: 'h', props: { color: 'red' } },
  w('w3', 'bp-5', 'j5', 'red'),
  w('w4', 'j10', 'bn-10', 'black'),
);

/** Montagem da Missão 05 com dois erros: LED invertido e cátodo sem ligação ao GND. */
export const C_LED_FAULTY: Circuit = {
  parts: C_LED_RAILS.parts.map((p) => (p.id === 'l1' ? { ...p, flip: true } : p)),
  wires: C_LED_RAILS.wires.filter((x) => x.id !== 'w4'),
};

export const C_BLINK13: Circuit = merge(GND_TOP, ledGroup('a', 'D13', 2, 'red', 6));
export const C_TWO_LEDS: Circuit = merge(GND_TOP, ledGroup('a', 'D13', 2, 'red', 6), ledGroup('b', 'D12', 11, 'green', 13, 'green'));
export const C_TRAFFIC: Circuit = merge(
  GND_TOP,
  ledGroup('a', 'D13', 2, 'red', 6, 'red'),
  ledGroup('b', 'D12', 11, 'yellow', 13, 'yellow'),
  ledGroup('c', 'D11', 20, 'green', 25, 'green'),
);
export const C_BUTTON: Circuit = merge(GND_TOP, ledGroup('a', 'D13', 2, 'red', 6), BUTTON_D2(20, 22));
export const C_PORTEIRO: Circuit = merge(GND_TOP, ledGroup('a', 'D13', 2, 'red', 6, 'red'), ledGroup('b', 'D12', 11, 'green', 13, 'green'), BUTTON_D2(20, 22));

export const C_BUZZER: Circuit = merge(
  GND_TOP,
  w('zw1', 'ard:D8', 'a5', 'purple'),
  { id: 'zr', kind: 'resistor', anchor: 'b5', orient: 'h', props: { ohms: 100 } },
  { id: 'bz', kind: 'buzzer', anchor: 'c9', orient: 'h', props: {} },
  w('zw2', 'd12', 'tn-12', 'black'),
);

export const C_POT: Circuit = merge(
  GND_TOP,
  ledGroup('a', 'D9', 2, 'red', 6),
  RAILS_BOTTOM,
  { id: 'pt', kind: 'pot', anchor: 'h20', orient: 'h', props: { pos: 0.5 } },
  w('pw1', 'j20', 'bp-20', 'red'),
  w('pw2', 'j24', 'bn-25', 'black'),
  w('pw3', 'j22', 'ard:A0', 'green'),
);

const LDR_DIVIDER = (): Group => ({
  parts: [
    { id: 'ld', kind: 'ldr', anchor: 'h20', orient: 'h', props: { light: 0.7 } },
    { id: 'lr', kind: 'resistor', anchor: 'i22', orient: 'h', props: { ohms: 10000 } },
  ],
  wires: [w('lw1', 'j20', 'bp-20', 'red'), w('lw2', 'g22', 'ard:A0', 'green'), w('lw3', 'j26', 'bn-26', 'black')],
});

export const C_LDR: Circuit = merge(GND_TOP, ledGroup('a', 'D13', 2, 'red', 6), RAILS_BOTTOM, LDR_DIVIDER());
export const C_SERVO: Circuit = merge(RAILS_BOTTOM, SERVO_BOTTOM(20, 'D9'));
export const C_CANCELA: Circuit = merge(RAILS_BOTTOM, SERVO_BOTTOM(20, 'D9'), GND_TOP, BUTTON_D2(5, 6));
export const C_SONAR: Circuit = merge(GND_TOP, ledGroup('a', 'D13', 2, 'red', 6), SONAR(20));

export const C_PROJ_LUZ: Circuit = merge(GND_TOP, ledGroup('a', 'D9', 2, 'white', 6), RAILS_BOTTOM, LDR_DIVIDER());
export const C_PROJ_ALARME: Circuit = merge(
  GND_TOP,
  ledGroup('a', 'D13', 2, 'red', 6),
  SONAR(20),
  w('pg', 'ard:GND1', 'bn-3', 'black'),
  w('zw1', 'ard:D8', 'f5', 'purple'),
  { id: 'zr', kind: 'resistor', anchor: 'g5', orient: 'h', props: { ohms: 100 } },
  { id: 'bz', kind: 'buzzer', anchor: 'h9', orient: 'h', props: {} },
  w('zw2', 'j12', 'bn-12', 'black'),
);
export const C_PROJ_CANCELA: Circuit = merge(GND_TOP, SONAR(20), RAILS_BOTTOM, SERVO_BOTTOM(5, 'D6'));

/** Circuito simples para o "Caminho da eletricidade": LED + resistor + botão alimentados pelos trilhos. */
export const C_FLOW_SWITCH: Circuit = merge(
  RAILS_BOTTOM,
  w('w3', 'bp-5', 'j5', 'red'),
  { id: 'r1', kind: 'resistor', anchor: 'g5', orient: 'h', props: { ohms: 220 } },
  { id: 'bt', kind: 'button', anchor: 'e9', orient: 'h', props: { pressed: false } },
  { id: 'l1', kind: 'led', anchor: 'c11', orient: 'h', props: { color: 'green' } },
  w('w5', 'a12', 'tn-12', 'black'),
  w('w6', 'tn-2', 'bn-2', 'black'),
);

export const C_FLOW_TWO: Circuit = merge(
  RAILS_BOTTOM,
  w('w3', 'bp-5', 'j5', 'red'),
  { id: 'r1', kind: 'resistor', anchor: 'g5', orient: 'h', props: { ohms: 330 } },
  { id: 'l1', kind: 'led', anchor: 'h9', orient: 'h', props: { color: 'yellow' } },
  w('w4', 'j10', 'bn-10', 'black'),
  w('w7', 'bp-18', 'j18', 'red'),
  { id: 'r2', kind: 'resistor', anchor: 'g18', orient: 'h', props: { ohms: 220 } },
  { id: 'l2', kind: 'led', anchor: 'h22', orient: 'h', props: { color: 'blue' } },
  w('w8', 'j23', 'bn-25', 'black'),
);

/** Montagem de teste da programação por blocos: LEDs nos pinos 11, 12 e 13, botão no pino 2 e buzzer no pino 8. */
export const C_BLOCKS: Circuit = merge(
  C_TRAFFIC,
  BUTTON_D2(27, 29),
  w('pg', 'ard:GND1', 'bn-3', 'black'),
  w('zw1', 'ard:D8', 'f5', 'purple'),
  { id: 'zr', kind: 'resistor', anchor: 'g5', orient: 'h', props: { ohms: 100 } },
  { id: 'bz', kind: 'buzzer', anchor: 'h9', orient: 'h', props: {} },
  w('zw2', 'j12', 'bn-12', 'black'),
);
