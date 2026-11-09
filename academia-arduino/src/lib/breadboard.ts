/**
 * Modelo da protoboard de 400 pontos (meia protoboard).
 *
 * Organização (vista de cima):
 *  - 30 colunas numeradas de 1 a 30.
 *  - Metade de cima: linhas a, b, c, d, e.   Metade de baixo: linhas f, g, h, i, j.
 *  - Entre as metades fica o CANAL CENTRAL, que NÃO tem ligação elétrica.
 *  - Em cada coluna, os 5 furos a–e estão ligados entre si (um "grupo de 5").
 *    O mesmo vale para f–j. Os grupos de cima e de baixo NÃO se ligam.
 *  - Trilhos de alimentação: dois em cima (tp = positivo, tn = negativo) e
 *    dois embaixo (bp = positivo, bn = negativo). Cada trilho é ligado ao longo
 *    de toda a placa, a não ser em protoboards com trilho interrompido no meio
 *    (opção `railsSplit`).
 *
 * Os furos dos trilhos vêm em blocos de 5 (apenas visual) e há um espaço maior
 * no meio, onde algumas protoboards interrompem o trilho.
 */

export const COLS = 30;
export const ROWS_TOP = ['a', 'b', 'c', 'd', 'e'] as const;
export const ROWS_BOTTOM = ['f', 'g', 'h', 'i', 'j'] as const;
export const ROWS = [...ROWS_TOP, ...ROWS_BOTTOM] as const;
export type Row = (typeof ROWS)[number];

export type RailId = 'tp' | 'tn' | 'bp' | 'bn';
export const RAILS: RailId[] = ['tp', 'tn', 'bp', 'bn'];

/** Colunas que possuem furos nos trilhos (blocos de 5, espaço maior no meio). */
export const RAIL_COLS: number[] = [
  2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29,
];
/** Divisão dos trilhos interrompidos: colunas até 15 = lado esquerdo. */
export const RAIL_SPLIT_COL = 15;

export interface BreadboardConfig {
  /** true = trilhos interrompidos no meio (metade esquerda separada da direita). */
  railsSplit: boolean;
}

export const DEFAULT_BB: BreadboardConfig = { railsSplit: false };

/** Espaçamento entre furos (0,1 polegada = 2,54 mm) em unidades do desenho. */
export const PITCH = 10;

/** Posição (x, y) de cada linha da protoboard no desenho. */
const ROW_Y: Record<string, number> = {
  tp: 14, tn: 24,
  a: 44, b: 54, c: 64, d: 74, e: 84,
  f: 110, g: 120, h: 130, i: 140, j: 150,
  bn: 170, bp: 180,
};
export const BB_WIDTH = 330;
export const BB_HEIGHT = 194;
export const CHANNEL_Y = 97;

export const colX = (col: number) => 20 + (col - 1) * PITCH;

export interface HoleInfo {
  id: string;
  kind: 'terminal' | 'rail';
  row: Row | RailId;
  col: number;
  x: number;
  y: number;
}

const isRow = (s: string): s is Row => (ROWS as readonly string[]).includes(s);

/** Converte um id de furo ("a12", "tp-9") em informações. Retorna null se inválido. */
export function parseHole(id: string): HoleInfo | null {
  const rail = /^(tp|tn|bp|bn)-(\d{1,2})$/.exec(id);
  if (rail) {
    const col = Number(rail[2]);
    if (!RAIL_COLS.includes(col)) return null;
    const r = rail[1] as RailId;
    return { id, kind: 'rail', row: r, col, x: colX(col), y: ROW_Y[r] };
  }
  const t = /^([a-j])(\d{1,2})$/.exec(id);
  if (t) {
    const col = Number(t[2]);
    if (col < 1 || col > COLS || !isRow(t[1])) return null;
    return { id, kind: 'terminal', row: t[1], col, x: colX(col), y: ROW_Y[t[1]] };
  }
  return null;
}

export const holeId = (row: Row, col: number) => `${row}${col}`;
export const railHoleId = (rail: RailId, col: number) => `${rail}-${col}`;

let cachedAll: HoleInfo[] | null = null;
/** Todos os furos da protoboard (400 furos). */
export function allHoles(): HoleInfo[] {
  if (cachedAll) return cachedAll;
  const list: HoleInfo[] = [];
  for (const r of RAILS.slice(0, 2)) for (const c of RAIL_COLS) list.push(parseHole(railHoleId(r, c))!);
  for (const r of ROWS) for (let c = 1; c <= COLS; c++) list.push(parseHole(holeId(r, c))!);
  for (const r of RAILS.slice(2)) for (const c of RAIL_COLS) list.push(parseHole(railHoleId(r, c))!);
  cachedAll = list;
  return list;
}

/**
 * Identificador da ligação interna (o "caminho metálico") de um furo.
 * Dois furos estão eletricamente conectados pela protoboard
 * se e somente se tiverem o mesmo identificador.
 */
export function netOf(id: string, cfg: BreadboardConfig = DEFAULT_BB): string | null {
  const h = parseHole(id);
  if (!h) return null;
  if (h.kind === 'rail') {
    if (!cfg.railsSplit) return `rail:${h.row}`;
    return `rail:${h.row}:${h.col <= RAIL_SPLIT_COL ? 'L' : 'R'}`;
  }
  const top = (ROWS_TOP as readonly string[]).includes(h.row);
  return `strip:${top ? 'T' : 'B'}${h.col}`;
}

/** Todos os furos ligados internamente ao furo informado (inclui o próprio furo). */
export function connectedHoles(id: string, cfg: BreadboardConfig = DEFAULT_BB): string[] {
  const n = netOf(id, cfg);
  if (!n) return [];
  return allHoles().filter((h) => netOf(h.id, cfg) === n).map((h) => h.id);
}

export const areConnected = (a: string, b: string, cfg: BreadboardConfig = DEFAULT_BB) => {
  const na = netOf(a, cfg);
  return na !== null && na === netOf(b, cfg);
};

export type NetKind = 'positive' | 'negative' | 'strip';

export function netKind(net: string): NetKind {
  if (net.startsWith('rail:tp') || net.startsWith('rail:bp')) return 'positive';
  if (net.startsWith('rail:tn') || net.startsWith('rail:bn')) return 'negative';
  return 'strip';
}

const RAIL_NAMES: Record<RailId, string> = {
  tp: 'trilho positivo (+) de cima',
  tn: 'trilho negativo (−) de cima',
  bp: 'trilho positivo (+) de baixo',
  bn: 'trilho negativo (−) de baixo',
};

/** Nome amigável de um furo, por exemplo "furo a12" ou "trilho + de cima". */
export function holeLabel(id: string): string {
  const h = parseHole(id);
  if (!h) return id;
  if (h.kind === 'rail') return `${RAIL_NAMES[h.row as RailId]} (coluna ${h.col})`;
  return `furo ${h.row}${h.col}`;
}

/** Explicação, em linguagem simples, do que está ligado a um furo. */
export function explainHole(id: string, cfg: BreadboardConfig = DEFAULT_BB): string {
  const h = parseHole(id);
  if (!h) return '';
  if (h.kind === 'rail') {
    const base = `Este furo faz parte do ${RAIL_NAMES[h.row as RailId]}. O trilho é uma tira de metal comprida`;
    if (!cfg.railsSplit) return `${base} que liga todos os furos da mesma fileira, de uma ponta à outra da protoboard.`;
    const side = h.col <= RAIL_SPLIT_COL ? 'esquerda' : 'direita';
    return `${base}. Nesta protoboard o trilho é interrompido no meio: este furo só se liga aos furos da metade ${side}.`;
  }
  const top = (ROWS_TOP as readonly string[]).includes(h.row);
  return top
    ? `Este furo está ligado aos outros 4 furos da coluna ${h.col} na metade de cima (a, b, c, d, e). Ele NÃO se liga à metade de baixo, por causa do canal central.`
    : `Este furo está ligado aos outros 4 furos da coluna ${h.col} na metade de baixo (f, g, h, i, j). Ele NÃO se liga à metade de cima, por causa do canal central.`;
}

/** Posição de um furo (coordenadas locais do desenho da protoboard). */
export function holePos(id: string): { x: number; y: number } | null {
  const h = parseHole(id);
  return h ? { x: h.x, y: h.y } : null;
}

/** Desloca um furo do miolo em colunas e linhas (atravessando o canal). null se sair da placa. */
export function offsetHole(id: string, dCol: number, dRow: number): string | null {
  const h = parseHole(id);
  if (!h || h.kind !== 'terminal') return null;
  const ri = ROWS.indexOf(h.row as Row) + dRow;
  const c = h.col + dCol;
  if (ri < 0 || ri >= ROWS.length || c < 1 || c > COLS) return null;
  return holeId(ROWS[ri], c);
}
