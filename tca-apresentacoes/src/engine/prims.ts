// Elementos gráficos básicos de um slide, em polegadas (slide 16:9 = 13,333 × 7,5).
// O mesmo desenho é usado na prévia (HTML), no PowerPoint e no PDF.

export const SW = 13.333;
export const SH = 7.5;
export const PX = 96; // pixels por polegada na prévia

export interface Para {
  text: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bullet?: boolean;
  link?: string;
  size?: number;
}

export type FontRole = 'display' | 'body';

export type Prim =
  | { t: 'rect'; x: number; y: number; w: number; h: number; fill?: string; alpha?: number; r?: number; line?: string; lineW?: number; dash?: boolean; rot?: number }
  | { t: 'ellipse'; x: number; y: number; w: number; h: number; fill?: string; alpha?: number; line?: string; lineW?: number; rot?: number }
  | {
      t: 'text';
      x: number;
      y: number;
      w: number;
      h: number;
      paras: Para[];
      size: number;
      color: string;
      font: FontRole;
      bold?: boolean;
      align?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
      lineH?: number;
      gap?: number;
      /** Marca o texto de referência: o PDF cria um link clicável sobre ele. */
      href?: string;
    }
  | { t: 'icon'; x: number; y: number; s: number; name: string; color: string }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; color: string; w: number; dash?: boolean; arrow?: boolean }
  | { t: 'bars'; x: number; y: number; w: number; h: number; data: { label: string; value: number; display: string }[]; color: string; ink: string; muted: string; grid: string };

export const BULLET_INDENT = 0.28; // polegadas
export const FONT_CSS: Record<FontRole, string> = {
  display: '"Bricolage Grotesque", "Trebuchet MS", sans-serif',
  body: '"Atkinson Hyperlegible", Verdana, sans-serif',
};
export const PPTX_FONT: Record<FontRole, string> = { display: 'Trebuchet MS', body: 'Calibri' };

// ---------- Medição de texto para escolher o tamanho de fonte ----------

let ctx: CanvasRenderingContext2D | null | undefined;
function getCtx() {
  if (ctx !== undefined) return ctx;
  try {
    ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  } catch {
    ctx = null;
  }
  return ctx;
}

function textWidth(text: string, font: FontRole, bold: boolean, px: number): number {
  const c = getCtx();
  if (c) {
    c.font = `${font === 'display' ? 800 : bold ? 700 : 400} ${px}px ${FONT_CSS[font]}`;
    return c.measureText(text).width;
  }
  return text.length * px * (font === 'display' ? 0.58 : 0.54);
}

function countLines(text: string, font: FontRole, bold: boolean, px: number, maxW: number): number {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  let lines = 1;
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (textWidth(test, font, bold, px) > maxW && cur) {
      lines++;
      cur = w;
    } else cur = test;
  }
  return lines;
}

/** Altura (polegadas) que um bloco de texto ocupa num determinado tamanho. */
export function textHeight(p: Extract<Prim, { t: 'text' }>, size: number): number {
  const lineH = p.lineH ?? 1.18;
  const gap = p.gap ?? 0.35;
  let total = 0;
  p.paras.forEach((para, i) => {
    const s = para.size ? para.size * (size / p.size) : size;
    const px = (s * PX) / 72;
    const w = (p.w - (para.bullet ? BULLET_INDENT : 0)) * PX * 0.96; // pequena folga
    const lines = countLines(para.text, p.font, !!(para.bold || p.bold), px, w);
    total += (lines * px * lineH) / PX;
    if (i < p.paras.length - 1) total += (gap * s) / 72;
  });
  return total;
}

/** Reduz o tamanho da fonte até o texto caber na caixa. */
export function fit<T extends Extract<Prim, { t: 'text' }>>(p: T, min = 12): T {
  let size = p.size;
  while (size > min && textHeight(p, size) > p.h) size -= 1;
  if (size === p.size) return p;
  const ratio = size / p.size;
  return { ...p, size, paras: p.paras.map((q) => (q.size ? { ...q, size: Math.round(q.size * ratio) } : q)) };
}

/** Altura que o texto realmente ocupa (para empilhar elementos). */
export const usedHeight = (p: Extract<Prim, { t: 'text' }>) => Math.min(p.h, textHeight(p, p.size));
