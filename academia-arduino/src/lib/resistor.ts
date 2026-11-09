/** Código de cores dos resistores e cálculo do resistor para LED. */

export interface BandColor {
  id: string;
  name: string;
  hex: string;
  digit: number | null;
  multiplier: number | null;
  tolerance: number | null;
}

export const BAND_COLORS: BandColor[] = [
  { id: 'black', name: 'preto', hex: '#1b1b1b', digit: 0, multiplier: 1, tolerance: null },
  { id: 'brown', name: 'marrom', hex: '#7a4a24', digit: 1, multiplier: 10, tolerance: 1 },
  { id: 'red', name: 'vermelho', hex: '#d62f2f', digit: 2, multiplier: 100, tolerance: 2 },
  { id: 'orange', name: 'laranja', hex: '#f07c12', digit: 3, multiplier: 1e3, tolerance: null },
  { id: 'yellow', name: 'amarelo', hex: '#f5d10c', digit: 4, multiplier: 1e4, tolerance: null },
  { id: 'green', name: 'verde', hex: '#1f9d4a', digit: 5, multiplier: 1e5, tolerance: 0.5 },
  { id: 'blue', name: 'azul', hex: '#2357d6', digit: 6, multiplier: 1e6, tolerance: 0.25 },
  { id: 'violet', name: 'violeta', hex: '#8a3fd1', digit: 7, multiplier: 1e7, tolerance: 0.1 },
  { id: 'gray', name: 'cinza', hex: '#8c8c8c', digit: 8, multiplier: null, tolerance: 0.05 },
  { id: 'white', name: 'branco', hex: '#f4f4f4', digit: 9, multiplier: null, tolerance: null },
  { id: 'gold', name: 'dourado', hex: '#c9a227', digit: null, multiplier: 0.1, tolerance: 5 },
  { id: 'silver', name: 'prateado', hex: '#b8bcc4', digit: null, multiplier: 0.01, tolerance: 10 },
];

export const colorById = (id: string) => BAND_COLORS.find((c) => c.id === id)!;

/** Valor de um resistor de 4 faixas (2 dígitos + multiplicador + tolerância) ou 5 faixas (3 dígitos). */
export function bandsToOhms(bands: string[]): number {
  const n = bands.length === 5 ? 3 : 2;
  let v = 0;
  for (let i = 0; i < n; i++) v = v * 10 + (colorById(bands[i]).digit ?? 0);
  return roundSig(v * (colorById(bands[n]).multiplier ?? 1));
}

/** Converte ohms para as 4 faixas (2 algarismos significativos + multiplicador + dourado 5%). */
export function ohmsToBands(ohms: number): string[] {
  if (ohms <= 0) return ['black', 'black', 'black', 'gold'];
  let exp = Math.floor(Math.log10(ohms)) - 1;
  let sig = Math.round(ohms / Math.pow(10, exp));
  if (sig >= 100) { sig = Math.round(sig / 10); exp++; }
  const d1 = Math.floor(sig / 10);
  const d2 = sig % 10;
  const mult = BAND_COLORS.find((c) => c.multiplier !== null && Math.abs(Math.log10(c.multiplier) - exp) < 1e-9);
  const digit = (d: number) => BAND_COLORS.find((c) => c.digit === d)!.id;
  return [digit(d1), digit(d2), mult ? mult.id : 'black', 'gold'];
}

export function formatOhmsLong(r: number): string {
  if (r >= 1e6) return `${fmt(r / 1e6)} MΩ`;
  if (r >= 1e3) return `${fmt(r / 1e3)} kΩ`;
  return `${fmt(r)} Ω`;
}
const fmt = (v: number) => String(roundSig(v)).replace('.', ',');
const roundSig = (v: number) => Math.round(v * 1000) / 1000;

/** Série comercial E12 (valores fáceis de encontrar). */
export const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

/** Próximo valor comercial E12 maior ou igual ao valor calculado (mais seguro para o LED). */
export function nextE12(r: number): number {
  if (r <= 0) return 0;
  const decade = Math.pow(10, Math.floor(Math.log10(r)));
  for (const m of E12) {
    const v = Math.round(m * decade * 1000) / 1000;
    if (v >= r - 1e-9) return v;
  }
  return Math.round(10 * decade);
}

export interface LedCalc {
  ok: boolean;
  error?: string;
  r: number;
  commercial: number;
  realCurrent: number;
  power: number;
  warnings: string[];
}

/** R = (Vfonte − Vled) / I */
export function ledResistor(vs: number, vf: number, mA: number): LedCalc {
  const warnings: string[] = [];
  if (!(vs > 0) || !(vf > 0) || !(mA > 0)) return { ok: false, error: 'Preencha todos os valores com números maiores que zero.', r: 0, commercial: 0, realCurrent: 0, power: 0, warnings };
  if (vs > 12) warnings.push('Nesta plataforma trabalhamos com até 12 V. Tensões altas podem ser perigosas: peça ajuda ao professor.');
  if (vf >= vs) return { ok: false, error: 'A tensão da fonte precisa ser maior que a tensão do LED, senão ele não acende.', r: 0, commercial: 0, realCurrent: 0, power: 0, warnings };
  const i = mA / 1000;
  const r = (vs - vf) / i;
  const commercial = nextE12(r);
  const realCurrent = (vs - vf) / commercial;
  const power = (vs - vf) * realCurrent;
  if (mA > 20) warnings.push('Corrente acima de 20 mA: é o limite recomendado para um pino do Arduino e para a maioria dos LEDs comuns. Use 10 a 15 mA.');
  if (mA > 40) warnings.push('Acima de 40 mA o pino do Arduino pode ser danificado!');
  if (power > 0.25) warnings.push('A potência passa de 1/4 W: seria preciso um resistor mais forte. Diminua a corrente.');
  return { ok: true, r, commercial, realCurrent, power, warnings };
}
