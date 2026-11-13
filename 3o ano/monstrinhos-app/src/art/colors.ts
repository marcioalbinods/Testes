// Paleta e utilidades de cor dos monstrinhos.

export const PALETTE: { id: string; name: string; hex: string }[] = [
  { id: 'morango', name: 'Morango', hex: '#ff5c7a' },
  { id: 'chiclete', name: 'Chiclete', hex: '#ff8fc7' },
  { id: 'rosa-bebe', name: 'Rosa-bebê', hex: '#ffc2dd' },
  { id: 'cereja', name: 'Cereja', hex: '#e2304f' },
  { id: 'laranja', name: 'Laranja', hex: '#ff9a3c' },
  { id: 'pessego', name: 'Pêssego', hex: '#ffbf8f' },
  { id: 'abobora', name: 'Abóbora', hex: '#f0702a' },
  { id: 'sol', name: 'Sol', hex: '#ffd23f' },
  { id: 'banana', name: 'Banana', hex: '#fff07a' },
  { id: 'mostarda', name: 'Mostarda', hex: '#e0b12e' },
  { id: 'limao', name: 'Limão', hex: '#b8ec5a' },
  { id: 'grama', name: 'Grama', hex: '#5fd068' },
  { id: 'floresta', name: 'Floresta', hex: '#2fa35a' },
  { id: 'menta', name: 'Menta', hex: '#8ff0c9' },
  { id: 'agua', name: 'Água', hex: '#45d9d0' },
  { id: 'turquesa', name: 'Turquesa', hex: '#1fb5c7' },
  { id: 'ceu', name: 'Céu', hex: '#7cc9ff' },
  { id: 'azul', name: 'Azul', hex: '#3d8bff' },
  { id: 'oceano', name: 'Oceano', hex: '#2d5fd6' },
  { id: 'lavanda', name: 'Lavanda', hex: '#c3a6ff' },
  { id: 'uva', name: 'Uva', hex: '#9b6bff' },
  { id: 'roxo', name: 'Roxo', hex: '#7340d9' },
  { id: 'ameixa', name: 'Ameixa', hex: '#b04fc4' },
  { id: 'chocolate', name: 'Chocolate', hex: '#8a5a3c' },
  { id: 'caramelo', name: 'Caramelo', hex: '#c98a53' },
  { id: 'areia', name: 'Areia', hex: '#ecd3a5' },
  { id: 'nuvem', name: 'Nuvem', hex: '#f6f4ff' },
  { id: 'cinza', name: 'Cinza', hex: '#a7a9c4' },
  { id: 'grafite', name: 'Grafite', hex: '#55597a' },
  { id: 'noite', name: 'Noite', hex: '#2f2a55' },
];

export const INK = '#2b1f4a';

function clamp(n: number, a = 0, b = 255) {
  return Math.max(a, Math.min(b, n));
}

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return [200, 200, 200];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('');
}

/** Mistura a cor com preto (amount > 0 escurece) ou branco (amount < 0 clareia). */
export function shade(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex);
  if (amount >= 0) return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
  const t = -amount;
  return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

export function isDark(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

export function isValidHex(s: unknown): s is string {
  return typeof s === 'string' && /^#[0-9a-fA-F]{6}$/.test(s);
}
