/**
 * Modelo da placa Arduino Uno R3.
 *
 * As coordenadas usam 10 unidades = 0,1 polegada (2,54 mm). A placa mede
 * 270 × 210 unidades (68,6 mm × 53,3 mm), com a porta USB à esquerda,
 * a barra de pinos digitais em cima e as barras de energia/analógicos embaixo.
 *
 * Para adaptar a outro modelo de placa, crie outro objeto `BoardModel`
 * com seus próprios pinos e partes; o restante da plataforma usa apenas
 * esta interface.
 */

export type PinGroup = 'digital' | 'analog' | 'power' | 'gnd' | 'other';

export interface BoardPin {
  /** Identificador interno (ex.: "D13", "A0", "5V", "GND1"). */
  id: string;
  /** Texto impresso na placa. */
  label: string;
  group: PinGroup;
  x: number;
  y: number;
  /** Nó elétrico (pinos GND são todos o mesmo nó; SDA = A4 e SCL = A5 no Uno R3). */
  node: string;
  pwm?: boolean;
}

export interface BoardModel {
  id: string;
  name: string;
  width: number;
  height: number;
  pins: BoardPin[];
  /** Número de pinos digitais que o programa pode usar diretamente. */
  digitalCount: number;
  pwmPins: number[];
}

const TOP_Y = 10;
const BOTTOM_Y = 200;

const topPins: [string, string, PinGroup, string, boolean?][] = [
  ['SCL', 'SCL', 'other', 'A5'],
  ['SDA', 'SDA', 'other', 'A4'],
  ['AREF', 'AREF', 'other', 'AREF'],
  ['GND3', 'GND', 'gnd', 'GND'],
  ['D13', '13', 'digital', 'D13'],
  ['D12', '12', 'digital', 'D12'],
  ['D11', '~11', 'digital', 'D11', true],
  ['D10', '~10', 'digital', 'D10', true],
  ['D9', '~9', 'digital', 'D9', true],
  ['D8', '8', 'digital', 'D8'],
];
const topPins2: [string, string, PinGroup, string, boolean?][] = [
  ['D7', '7', 'digital', 'D7'],
  ['D6', '~6', 'digital', 'D6', true],
  ['D5', '~5', 'digital', 'D5', true],
  ['D4', '4', 'digital', 'D4'],
  ['D3', '~3', 'digital', 'D3', true],
  ['D2', '2', 'digital', 'D2'],
  ['D1', 'TX→1', 'digital', 'D1'],
  ['D0', 'RX←0', 'digital', 'D0'],
];
const powerPins: [string, string, PinGroup, string][] = [
  ['NC', '', 'other', 'NC'],
  ['IOREF', 'IOREF', 'other', 'IOREF'],
  ['RESET', 'RESET', 'other', 'RESET'],
  ['3V3', '3.3V', 'power', '3V3'],
  ['5V', '5V', 'power', '5V'],
  ['GND1', 'GND', 'gnd', 'GND'],
  ['GND2', 'GND', 'gnd', 'GND'],
  ['VIN', 'VIN', 'power', 'VIN'],
];
const analogPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

function buildUnoPins(): BoardPin[] {
  const pins: BoardPin[] = [];
  topPins.forEach(([id, label, group, node, pwm], i) =>
    pins.push({ id, label, group, node, pwm, x: 82 + i * 10, y: TOP_Y }),
  );
  topPins2.forEach(([id, label, group, node, pwm], i) =>
    pins.push({ id, label, group, node, pwm, x: 188 + i * 10, y: TOP_Y }),
  );
  powerPins.forEach(([id, label, group, node], i) =>
    pins.push({ id, label, group, node, x: 110 + i * 10, y: BOTTOM_Y }),
  );
  analogPins.forEach((id, i) => pins.push({ id, label: id, group: 'analog', node: id, x: 200 + i * 10, y: BOTTOM_Y }));
  return pins;
}

export const ARDUINO_UNO: BoardModel = {
  id: 'uno-r3',
  name: 'Arduino Uno R3',
  width: 270,
  height: 210,
  pins: buildUnoPins(),
  digitalCount: 14,
  pwmPins: [3, 5, 6, 9, 10, 11],
};

export const getPin = (id: string, board: BoardModel = ARDUINO_UNO) => board.pins.find((p) => p.id === id);

/**
 * Converte o número usado no programa (13, A0 = 14 ...) para o nó elétrico.
 * No Arduino Uno: A0 = 14, A1 = 15 ... A5 = 19.
 */
export function pinNumberToNode(n: number): string | null {
  if (n >= 0 && n <= 13) return `D${n}`;
  if (n >= 14 && n <= 19) return `A${n - 14}`;
  return null;
}

export function nodeToPinNumber(node: string): number | null {
  const d = /^D(\d+)$/.exec(node);
  if (d) return Number(d[1]);
  const a = /^A(\d)$/.exec(node);
  if (a) return 14 + Number(a[1]);
  return null;
}

/** Nome amigável de um pino da placa (ex.: "pino digital 13"). */
export function pinLabel(id: string): string {
  const p = getPin(id);
  if (!p) return id;
  if (p.group === 'digital') return `pino digital ${p.id.slice(1)}${p.pwm ? ' (PWM ~)' : ''}`;
  if (p.group === 'analog') return `pino analógico ${p.id}`;
  if (p.group === 'gnd') return 'pino GND';
  if (p.id === '3V3') return 'pino 3.3V';
  return `pino ${p.label || p.id}`;
}
