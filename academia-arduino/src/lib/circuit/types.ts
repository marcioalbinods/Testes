/**
 * Tipos da bancada virtual: componentes colocados na protoboard e fios (jumpers).
 */

export type PartKind = 'led' | 'resistor' | 'button' | 'buzzer' | 'pot' | 'ldr' | 'servo' | 'ultrasonic';

export type LedColor = 'red' | 'yellow' | 'green' | 'blue' | 'white';

export interface PartProps {
  color?: LedColor;
  /** Resistência em ohms (resistor). */
  ohms?: number;
  /** Posição do potenciômetro (0 a 1). */
  pos?: number;
  /** Luz no LDR (0 = escuro, 1 = muito claro). */
  light?: number;
  /** Distância do objeto ao sensor ultrassônico, em cm. */
  distance?: number;
  /** Botão pressionado. */
  pressed?: boolean;
}

export interface PlacedPart {
  id: string;
  kind: PartKind;
  /** Furo onde fica a primeira perna (ex.: "e10"). */
  anchor: string;
  /** 'h' = pernas para a direita; 'v' = pernas para baixo. */
  orient: 'h' | 'v';
  /** Inverte a ordem das pernas (ex.: LED virado ao contrário). */
  flip?: boolean;
  props: PartProps;
}

/** Ponta de um fio: um furo da protoboard ("a12", "tp-9") ou um pino da placa ("ard:D13"). */
export type Endpoint = string;

export type WireColor = 'red' | 'black' | 'blue' | 'green' | 'yellow' | 'orange' | 'white' | 'purple';

export interface Wire {
  id: string;
  a: Endpoint;
  b: Endpoint;
  color: WireColor;
}

export interface Circuit {
  parts: PlacedPart[];
  wires: Wire[];
  /** Trilhos interrompidos no meio. */
  railsSplit?: boolean;
}

export const emptyCircuit = (): Circuit => ({ parts: [], wires: [] });

export const isBoardEndpoint = (e: Endpoint) => e.startsWith('ard:');
export const boardPinOf = (e: Endpoint) => e.slice(4);
