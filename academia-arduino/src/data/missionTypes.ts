/** Estrutura de dados das missões (separada da interface visual). */
import type { QuizQuestion } from '../components/ui';
import type { Rule } from '../lib/circuit/checks';
import type { Circuit, PartKind } from '../lib/circuit/types';
import type { BoardPartId } from '../svg/ArduinoUno';

export interface BuildStep {
  text: string;
  /** ids das peças/fios que aparecem neste passo */
  add: string[];
  tip?: string;
}

export type Activity =
  | { type: 'arduino-find'; intro: string; targets: { part: BoardPartId; prompt: string; explain: string }[] }
  | { type: 'proto-quiz'; intro: string; items: { a: string; b: string; connected: boolean; explain: string }[] }
  | { type: 'build'; intro: string; start: Circuit; palette: PartKind[]; rules: Rule[]; hint: string }
  | { type: 'code-order'; intro: string; lines: string[] }
  | { type: 'code-fill'; intro: string; template: string }
  | { type: 'project'; intro: string };

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  materials: string[];
  circuit: Circuit;
  code: string;
  rules: Rule[];
  palette: PartKind[];
}

export interface Mission {
  n: number;
  id: string;
  level: 1 | 2 | 3 | 4;
  title: string;
  icon: string;
  objective: string;
  goals: string[];
  intro: string[];
  /** cartões com ideias-chave (no máximo 3, para não sobrecarregar) */
  ideas?: { title: string; text: string }[];
  materials: { item: string; qty: string }[];
  safety: string[];
  circuit?: Circuit;
  steps?: BuildStep[];
  code?: string;
  codeExplain?: { code: string; text: string }[];
  activity: Activity;
  quiz: QuizQuestion[];
  challenge: { text: string; hint: string; solution: string; solutionCode?: string };
  teacher: { minutes: number; tips: string[]; difficulties: string[] };
  xp: number;
  projects?: ProjectIdea[];
}

export const LEVELS = [
  { n: 1, name: 'Primeiros passos', desc: 'Conheça a placa, a protoboard e monte o primeiro circuito.', color: '#16b862', soft: '#ebfbf1' },
  { n: 2, name: 'Primeiros comandos', desc: 'Programe o Arduino para piscar LEDs e ler botões.', color: '#3a6cf4', soft: '#eef4ff' },
  { n: 3, name: 'Inventando soluções', desc: 'Variáveis, decisões, sons, potenciômetro e sensor de luz.', color: '#7c4dff', soft: '#f4f0ff' },
  { n: 4, name: 'Engenheiros do futuro', desc: 'Repetições, servo motor, sensor ultrassônico e projeto final.', color: '#f5b800', soft: '#fffbe6' },
] as const;
