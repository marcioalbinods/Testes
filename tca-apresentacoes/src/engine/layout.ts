// Composição visual de cada tipo de slide (posições em polegadas).
import type { SlideData } from '../types';
import { fieldList, fieldText } from './buildDeck';
import { fit, Para, Prim, SH, SW, usedHeight } from './prims';
import type { SlideTheme } from './themes';

type TextPrim = Extract<Prim, { t: 'text' }>;
type TextOpts = Omit<TextPrim, 't' | 'paras' | 'font' | 'color' | 'size'> & Partial<Pick<TextPrim, 'font' | 'color' | 'size'>> & { min?: number };

const M = 0.6; // margem lateral
const CW = SW - 2 * M; // largura útil

export interface LayoutCtx {
  th: SlideTheme;
  index: number;
  total: number;
  themeLabel: string;
}

function mk(th: SlideTheme) {
  const text = (content: string | Para[], o: TextOpts): TextPrim => {
    const paras = typeof content === 'string' ? [{ text: content }] : content;
    const { min = 12, ...rest } = o;
    return fit({ t: 'text', font: 'body', color: th.ink, size: 20, ...rest, paras }, min);
  };
  const bullets = (items: string[], o: TextOpts): TextPrim => text(items.map((t) => ({ text: t, bullet: true })), { gap: 0.45, ...o });
  const label = (s: string, x: number, y: number, w: number, color = th.accent): TextPrim =>
    text(s.toUpperCase(), { x, y, w, h: 0.32, size: 12, bold: true, color, min: 9 });
  const card = (x: number, y: number, w: number, h: number, fill = th.surface, line: string | undefined = th.line): Prim => ({ t: 'rect', x, y, w, h, fill, r: 0.16, line, lineW: line ? 0.75 : undefined });
  const missing = (msg: string, x: number, y: number, w: number, h: number): Prim[] => [
    { t: 'rect', x, y, w, h, fill: th.accent3, alpha: 0.1, r: 0.14, line: th.accent3, lineW: 1.25, dash: true },
    { t: 'icon', x: x + 0.25, y: y + Math.min(0.25, h / 2 - 0.2), s: 0.4, name: 'alert', color: th.accent3 },
    text([{ text: 'Precisamos complementar a pesquisa', bold: true, size: 14 }, { text: msg }], {
      x: x + 0.8, y: y + 0.15, w: w - 1.0, h: h - 0.3, size: 13, color: th.ink, valign: h < 1.4 ? 'middle' : 'top', gap: 0.2, min: 10,
    }),
  ];
  return { text, bullets, label, card, missing };
}

// ---------------- Elementos decorativos por tema ----------------

function motif(th: SlideTheme, variant: 'cover' | 'corner'): Prim[] {
  const P: Prim[] = [];
  const a = th.accent, b = th.accent2, c = th.accent3;
  if (variant === 'corner') {
    const x0 = SW - 1.75;
    switch (th.motif) {
      case 'leaves':
        P.push({ t: 'ellipse', x: x0 + 0.5, y: -0.25, w: 1.5, h: 0.7, fill: a, alpha: 0.85, rot: -35 });
        P.push({ t: 'ellipse', x: x0 + 0.1, y: 0.35, w: 1.1, h: 0.5, fill: b, alpha: 0.85, rot: -35 });
        break;
      case 'circuit':
        P.push({ t: 'line', x1: x0, y1: 0.45, x2: SW, y2: 0.45, color: a, w: 1.5 });
        P.push({ t: 'line', x1: x0 + 0.6, y1: 0.45, x2: x0 + 0.6, y2: 1.05, color: b, w: 1.5 });
        P.push({ t: 'ellipse', x: x0 - 0.09, y: 0.36, w: 0.18, h: 0.18, fill: a });
        P.push({ t: 'ellipse', x: x0 + 0.51, y: 1.0, w: 0.18, h: 0.18, fill: b });
        break;
      case 'cross':
        P.push({ t: 'rect', x: x0 + 0.85, y: 0.3, w: 0.22, h: 0.8, fill: a, r: 0.04 });
        P.push({ t: 'rect', x: x0 + 0.56, y: 0.59, w: 0.8, h: 0.22, fill: a, r: 0.04 });
        P.push({ t: 'ellipse', x: x0 + 0.1, y: 0.3, w: 0.32, h: 0.32, fill: undefined, line: b, lineW: 2 });
        break;
      case 'bands':
        P.push({ t: 'rect', x: 0, y: 0, w: SW, h: 0.12, fill: a });
        break;
      case 'people':
        [a, b, c, th.line].forEach((col, i) => P.push({ t: 'ellipse', x: x0 + 0.15 + i * 0.36, y: 0.45, w: 0.26, h: 0.26, fill: col }));
        break;
      case 'books':
        [0.75, 0.95, 0.6].forEach((h, i) => P.push({ t: 'rect', x: x0 + 0.6 + i * 0.3, y: 1.15 - h, w: 0.24, h, fill: [a, b, c][i], r: 0.04 }));
        break;
      default:
        P.push({ t: 'ellipse', x: SW - 1.2, y: -0.6, w: 1.6, h: 1.6, fill: b, alpha: 0.18 });
        P.push({ t: 'ellipse', x: SW - 0.9, y: 0.2, w: 0.7, h: 0.7, fill: c, alpha: 0.85 });
    }
    return P;
  }
  // Capa: composição grande à direita (de x = 8,6 até a borda)
  const L = 8.7;
  switch (th.motif) {
    case 'leaves': {
      const leaves: [number, number, number, number, string, number][] = [
        [L + 0.6, 0.6, 3.6, 1.6, a, -38], [L + 1.8, 1.9, 3.4, 1.5, b, -38], [L + 0.2, 3.0, 3.2, 1.4, a, -38],
        [L + 1.5, 4.3, 3.6, 1.5, b, -38], [L + 2.6, 5.6, 2.4, 1.0, c, -38],
      ];
      leaves.forEach(([x, y, w, h, f, r], i) => P.push({ t: 'ellipse', x, y, w, h, fill: f, alpha: i % 2 ? 0.8 : 0.92, rot: r }));
      P.push({ t: 'ellipse', x: L + 0.3, y: 5.9, w: 0.5, h: 0.5, fill: c });
      break;
    }
    case 'circuit': {
      const rows = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0];
      rows.forEach((y, i) => {
        const x1 = L + 0.4 + (i % 3) * 0.6;
        P.push({ t: 'line', x1, y1: y, x2: SW, y2: y, color: i % 2 ? b : a, w: 2 });
        P.push({ t: 'ellipse', x: x1 - 0.12, y: y - 0.12, w: 0.24, h: 0.24, fill: i % 2 ? b : a });
        if (i < rows.length - 1) P.push({ t: 'line', x1: x1 + 1.2, y1: y, x2: x1 + 1.2, y2: y + 1, color: c, w: 1.25 });
      });
      P.push({ t: 'rect', x: L + 1.9, y: 2.6, w: 2.0, h: 2.0, fill: th.surface, r: 0.25, line: a, lineW: 2 });
      P.push({ t: 'icon', x: L + 2.4, y: 3.1, s: 1.0, name: 'cpu', color: a });
      break;
    }
    case 'cross': {
      P.push({ t: 'ellipse', x: L + 0.6, y: 1.1, w: 4.2, h: 4.2, fill: a, alpha: 0.12 });
      P.push({ t: 'rect', x: L + 2.25, y: 1.95, w: 0.9, h: 2.5, fill: a, r: 0.12 });
      P.push({ t: 'rect', x: L + 1.45, y: 2.75, w: 2.5, h: 0.9, fill: a, r: 0.12 });
      P.push({ t: 'ellipse', x: L + 3.6, y: 4.7, w: 0.9, h: 0.9, fill: b, alpha: 0.9 });
      P.push({ t: 'ellipse', x: L + 0.6, y: 5.6, w: 0.55, h: 0.55, fill: undefined, line: c, lineW: 3 });
      break;
    }
    case 'bands': {
      [a, th.accent2, th.line].forEach((col, i) => P.push({ t: 'rect', x: L + 1.2 + i * 0.9, y: 0, w: 0.55, h: SH, fill: col, alpha: i === 0 ? 0.9 : 0.5 }));
      break;
    }
    case 'people': {
      const cols = 6, rows = 7, s = 0.42, gx = 0.66;
      for (let r = 0; r < rows; r++)
        for (let k = 0; k < cols; k++) {
          const idx = r * cols + k;
          const col = idx % 7 === 0 ? c : idx % 3 === 0 ? b : idx % 5 === 0 ? a : th.line;
          P.push({ t: 'ellipse', x: L + 0.5 + k * gx, y: 0.75 + r * 0.9, w: s, h: s, fill: col });
        }
      break;
    }
    case 'books': {
      const spines: [number, string][] = [[3.4, a], [4.2, b], [2.9, c], [3.8, a], [4.6, th.line], [3.2, b]];
      spines.forEach(([h, col], i) => P.push({ t: 'rect', x: L + 0.7 + i * 0.68, y: 6.4 - h, w: 0.56, h, fill: col, r: 0.06 }));
      P.push({ t: 'rect', x: L + 0.4, y: 6.4, w: 4.4, h: 0.12, fill: th.ink, alpha: 0.6 });
      break;
    }
    default: {
      P.push({ t: 'ellipse', x: L + 0.4, y: 0.7, w: 4.2, h: 4.2, fill: a, alpha: 0.9 });
      P.push({ t: 'ellipse', x: L + 2.1, y: 3.1, w: 3.2, h: 3.2, fill: b, alpha: 0.85 });
      P.push({ t: 'ellipse', x: L + 1.0, y: 5.1, w: 1.3, h: 1.3, fill: c, alpha: 0.95 });
    }
  }
  return P;
}

// ---------------- Moldura comum ----------------

function chrome(ctx: LayoutCtx, s: SlideData, eyebrow: string, titleX = M, titleW = CW - 1.4): Prim[] {
  const { th } = ctx;
  const { text } = mk(th);
  return [
    { t: 'rect', x: 0, y: 0, w: SW, h: SH, fill: th.bg },
    ...motif(th, 'corner'),
    text(eyebrow.toUpperCase(), { x: titleX, y: 0.38, w: titleW, h: 0.3, size: 12, bold: true, color: th.accent, min: 9 }),
    text(s.title, { x: titleX, y: 0.66, w: titleW, h: 0.85, size: 32, font: 'display', min: 22, valign: 'top' }),
    ...footer(ctx),
  ];
}

function footer(ctx: LayoutCtx): Prim[] {
  const { th } = ctx;
  const { text } = mk(th);
  return [
    text('TCA · ' + ctx.themeLabel, { x: M, y: 7.02, w: 9, h: 0.3, size: 10, color: th.muted, min: 8 }),
    text(`${ctx.index + 1} / ${ctx.total}`, { x: SW - M - 1.5, y: 7.02, w: 1.5, h: 0.3, size: 10, color: th.muted, align: 'right' }),
  ];
}

// ---------------- Slides ----------------

const two = (n: number) => String(n).padStart(2, '0');

export function layoutSlide(s: SlideData, ctx: LayoutCtx): Prim[] {
  const { th } = ctx;
  const u = mk(th);
  const eyebrow = two(ctx.index + 1);
  switch (s.kind) {
    case 'cover': {
      const subtitle = fieldText(s, 'subtitle');
      const members = fieldList(s, 'members');
      const group = fieldText(s, 'group');
      const info = fieldText(s, 'info');
      const P: Prim[] = [{ t: 'rect', x: 0, y: 0, w: SW, h: SH, fill: th.bg }, ...motif(th, 'cover')];
      P.push({ t: 'rect', x: 0.75, y: 0.75, w: 4.7, h: 0.46, fill: th.accent, alpha: 0.14, r: 0.23 });
      P.push(u.text('Trabalho Colaborativo de Autoria'.toUpperCase(), { x: 0.75, y: 0.83, w: 4.7, h: 0.3, size: 11, bold: true, color: th.accent, align: 'center' }));
      P.push(u.text(s.title, { x: 0.75, y: 1.45, w: 7.7, h: 2.55, size: 54, font: 'display', valign: 'bottom', min: 26, lineH: 1.05 }));
      if (subtitle) P.push(u.text(subtitle, { x: 0.75, y: 4.15, w: 7.5, h: 0.9, size: 20, color: th.muted, min: 13 }));
      P.push({ t: 'rect', x: 0.75, y: 5.18, w: 1.1, h: 0.07, fill: th.accent3 });
      P.push(u.label(group ? `Grupo ${group.replace(/^grupo\s+/i, '')} · Integrantes` : 'Integrantes', 0.75, 5.4, 7.6, th.muted));
      if (members.length) P.push(u.text(members.join('  ·  '), { x: 0.75, y: 5.72, w: 7.7, h: 0.8, size: 17, bold: true, min: 11 }));
      else P.push(...u.missing('Adicionem os nomes dos integrantes.', 0.75, 5.72, 7.0, 0.7));
      if (info) P.push(u.text(info, { x: 0.75, y: 6.62, w: 7.7, h: 0.4, size: 13, color: th.muted, min: 10 }));
      return P;
    }

    case 'theme': {
      const theme = fieldText(s, 'theme');
      const context = fieldList(s, 'context');
      const why = fieldList(s, 'why');
      const P: Prim[] = [{ t: 'rect', x: 0, y: 0, w: SW, h: SH, fill: th.bg }];
      P.push({ t: 'rect', x: 0, y: 0, w: 4.7, h: SH, fill: th.accent });
      P.push({ t: 'ellipse', x: 2.6, y: 5.3, w: 3.2, h: 3.2, fill: th.onAccent, alpha: 0.1 });
      P.push({ t: 'ellipse', x: -0.8, y: -0.8, w: 2.2, h: 2.2, fill: th.onAccent, alpha: 0.08 });
      P.push({ t: 'icon', x: 0.6, y: 0.75, s: 0.6, name: 'compass', color: th.onAccent });
      P.push(u.text(`${eyebrow} · NOSSO TEMA`, { x: 0.6, y: 1.55, w: 3.6, h: 0.3, size: 12, bold: true, color: th.onAccent, min: 9 }));
      if (theme) P.push(u.text(theme, { x: 0.6, y: 1.95, w: 3.6, h: 4.3, size: 40, font: 'display', color: th.onAccent, min: 20, lineH: 1.08 }));
      else P.push(...u.missing('Escrevam qual é o tema.', 0.5, 2.0, 3.7, 1.4));
      const X = 5.25, W = SW - X - M;
      P.push(...motif(th, 'corner'));
      P.push(u.text(s.title, { x: X, y: 0.62, w: W - 1.3, h: 0.85, size: 32, font: 'display', min: 22 }));
      P.push(u.label('Contextualização', X, 1.7, W));
      if (context.length) P.push(u.bullets(context, { x: X, y: 2.08, w: W, h: 2.3, size: 20, min: 13 }));
      else P.push(...u.missing(s.fields.find((f) => f.key === 'context')?.missing ?? '', X, 2.08, W, 1.2));
      P.push(u.card(X, 4.6, W, 2.15, th.sunk, undefined));
      P.push({ t: 'icon', x: X + 0.3, y: 4.85, s: 0.42, name: 'heart', color: th.accent3 });
      P.push(u.label('Por que escolhemos este tema', X + 0.85, 4.9, W - 1.1, th.ink));
      if (why.length) P.push(u.bullets(why, { x: X + 0.85, y: 5.28, w: W - 1.15, h: 1.3, size: 17, min: 11 }));
      else P.push(u.text(s.fields.find((f) => f.key === 'why')?.missing ?? '', { x: X + 0.85, y: 5.28, w: W - 1.15, h: 1.2, size: 14, color: th.accent3 }));
      P.push(...footer(ctx).map((p) => (p.t === 'text' && p.x < 1 ? { ...p, x: X } : p)));
      return P;
    }

    case 'problem': {
      const problem = fieldText(s, 'problem');
      const where = fieldList(s, 'where');
      const affected = fieldList(s, 'affected');
      const P = chrome(ctx, s, `${eyebrow} · O que investigamos`);
      P.push(u.card(M, 1.72, CW, 1.95, th.sunk, undefined));
      P.push({ t: 'ellipse', x: M + 0.35, y: 2.27, w: 0.85, h: 0.85, fill: th.accent });
      P.push({ t: 'icon', x: M + 0.55, y: 2.47, s: 0.45, name: 'search', color: th.onAccent });
      if (problem) P.push(u.text(problem, { x: M + 1.5, y: 1.9, w: CW - 1.85, h: 1.6, size: 26, font: 'display', valign: 'middle', min: 16, lineH: 1.12 }));
      else P.push(...u.missing('Descrevam o problema que vão investigar.', M + 1.5, 2.05, CW - 1.9, 1.3));
      const cw = (CW - 0.3) / 2, y = 3.95, h = 2.8;
      ([['Onde acontece', 'map', where, 'where'], ['Quem é afetado', 'users', affected, 'affected']] as const).forEach(([lab, icon, items, key], i) => {
        const x = M + i * (cw + 0.3);
        P.push(u.card(x, y, cw, h));
        P.push({ t: 'icon', x: x + 0.3, y: y + 0.3, s: 0.42, name: icon, color: i ? th.accent3 : th.accent2 });
        P.push(u.label(lab, x + 0.85, y + 0.35, cw - 1.1, th.ink));
        if (items.length) P.push(u.bullets(items, { x: x + 0.35, y: y + 0.85, w: cw - 0.65, h: h - 1.05, size: 19, min: 12 }));
        else P.push(...u.missing(s.fields.find((f) => f.key === key)?.missing ?? '', x + 0.3, y + 0.9, cw - 0.6, 1.4));
      });
      return P;
    }

    case 'discoveries': {
      const items = fieldList(s, 'items');
      const highlights = fieldList(s, 'highlights');
      const P = chrome(ctx, s, `${eyebrow} · Resultados da pesquisa`);
      let X = M, W = CW;
      const Y = 1.75, H = 5.0;
      if (highlights.length) {
        const hw = 3.85, n = Math.min(2, highlights.length), gap = 0.22;
        const hh = (H - gap * (n - 1)) / n;
        highlights.slice(0, 2).forEach((hl, i) => {
          const [value, ...rest] = hl.split(/\s+—\s+/);
          const y = Y + i * (hh + gap);
          const fill = i ? th.accent2 : th.accent;
          const ink = i && !th.dark ? th.ink : th.onAccent;
          P.push({ t: 'rect', x: X, y, w: hw, h: hh, fill, r: 0.2 });
          P.push(u.text(value, { x: X + 0.3, y: y + 0.25, w: hw - 0.6, h: Math.min(1.2, hh * 0.45), size: 46, font: 'display', color: ink, min: 22, valign: 'bottom' }));
          P.push(u.text(rest.join(' — ') || ' ', { x: X + 0.3, y: y + 0.3 + Math.min(1.2, hh * 0.45), w: hw - 0.6, h: hh - 0.55 - Math.min(1.2, hh * 0.45), size: 15, color: ink, min: 10 }));
        });
        X = M + hw + 0.3;
        W = CW - hw - 0.3;
      }
      if (!items.length) {
        P.push(...u.missing(s.fields[0].missing ?? 'Adicionem descobertas da pesquisa.', X, Y, W, 1.5));
        return P;
      }
      const n = items.length;
      const wide = W > 10;
      const cols = wide ? (n === 3 ? 3 : n === 1 ? 1 : 2) : 1;
      const rows = Math.ceil(n / cols);
      const gap = 0.22;
      const cw = (W - gap * (cols - 1)) / cols;
      const ch = Math.min(wide ? 2.4 : 1.45, (H - gap * (rows - 1)) / rows);
      const icons = ['lightbulb', 'search', 'book', 'sparkles'];
      items.forEach((it, i) => {
        const x = X + (i % cols) * (cw + gap);
        const y = Y + Math.floor(i / cols) * (ch + gap);
        P.push(u.card(x, y, cw, ch));
        P.push({ t: 'ellipse', x: x + 0.25, y: y + 0.25, w: 0.56, h: 0.56, fill: th.accent, alpha: 0.14 });
        P.push({ t: 'icon', x: x + 0.37, y: y + 0.37, s: 0.32, name: icons[i % icons.length], color: th.accent });
        P.push(u.text(it, { x: x + 1.0, y: y + 0.2, w: cw - 1.25, h: ch - 0.4, size: wide && cols < 3 ? 21 : 19, valign: 'middle', min: 11 }));
      });
      return P;
    }

    case 'data': {
      const note = fieldText(s, 'note');
      const P = chrome(ctx, s, `${eyebrow} · Dados da pesquisa`);
      const data = s.chart ?? [];
      if (s.chartUnit && s.chartUnit !== '%') P.push(u.text('Valores em ' + s.chartUnit, { x: M, y: 1.68, w: 8, h: 0.3, size: 12, color: th.muted }));
      P.push(u.card(M, 2.0, 8.55, 4.75));
      P.push({ t: 'bars', x: M + 0.3, y: 2.25, w: 7.95, h: 4.25, data, color: th.accent, ink: th.ink, muted: th.muted, grid: th.line });
      const x = M + 8.85, w = CW - 8.85;
      P.push(u.card(x, 2.0, w, 4.75, th.sunk, undefined));
      P.push({ t: 'icon', x: x + 0.3, y: 2.3, s: 0.45, name: 'chart', color: th.accent });
      P.push(u.label('De onde vieram os dados', x + 0.3, 2.95, w - 0.6, th.ink));
      P.push(u.text(note, { x: x + 0.3, y: 3.35, w: w - 0.6, h: 3.2, size: 15, color: th.muted, min: 10 }));
      return P;
    }

    case 'causes': {
      const causes = fieldList(s, 'causes');
      const cons = fieldList(s, 'consequences');
      const P = chrome(ctx, s, `${eyebrow} · Entendendo o problema`);
      const colW = 5.45, Y = 2.25, H = 4.5;
      const col = (items: string[], x: number, lab: string, color: string, key: string) => {
        P.push({ t: 'rect', x, y: 1.72, w: 0.14, h: 0.36, fill: color, r: 0.04 });
        P.push(u.label(lab, x + 0.28, 1.76, colW - 0.3, th.ink));
        if (!items.length) {
          P.push(...u.missing(s.fields.find((f) => f.key === key)?.missing ?? '', x, Y, colW, 1.4));
          return;
        }
        const gap = 0.18;
        const h = Math.min(1.25, (H - gap * (items.length - 1)) / items.length);
        items.forEach((it, i) => {
          const y = Y + i * (h + gap);
          P.push({ t: 'rect', x, y, w: colW, h, fill: color, alpha: 0.12, r: 0.14 });
          P.push({ t: 'rect', x, y, w: 0.1, h, fill: color, r: 0.05 });
          P.push(u.text(it, { x: x + 0.35, y: y + 0.1, w: colW - 0.55, h: h - 0.2, size: 18, valign: 'middle', min: 11 }));
        });
      };
      col(causes, M, 'Causas', th.accent3, 'causes');
      col(cons, SW - M - colW, 'Consequências', th.accent, 'consequences');
      const cx = SW / 2;
      P.push({ t: 'line', x1: M + colW + 0.12, y1: 4.5, x2: SW - M - colW - 0.12, y2: 4.5, color: th.muted, w: 2, arrow: true });
      P.push({ t: 'ellipse', x: cx - 0.42, y: 4.08, w: 0.84, h: 0.84, fill: th.bg, line: th.muted, lineW: 1.5 });
      P.push({ t: 'icon', x: cx - 0.22, y: 4.28, s: 0.44, name: 'arrow', color: th.ink });
      P.push(u.text('levam a', { x: cx - 0.6, y: 5.0, w: 1.2, h: 0.3, size: 11, color: th.muted, align: 'center' }));
      return P;
    }

    case 'reflection': {
      const conclusion = fieldText(s, 'conclusion');
      const surprising = fieldList(s, 'surprising');
      const P = chrome(ctx, s, `${eyebrow} · Nossa reflexão`);
      P.push(u.card(M, 1.72, CW, 2.7, th.sunk, undefined));
      P.push(u.text('“', { x: M + 0.25, y: 1.55, w: 1.2, h: 1.6, size: 120, font: 'display', color: th.accent, min: 60, lineH: 1 }));
      if (conclusion) P.push(u.text(conclusion, { x: M + 1.4, y: 1.95, w: CW - 1.9, h: 2.25, size: 28, font: 'display', valign: 'middle', min: 16, lineH: 1.12 }));
      else P.push(...u.missing('Escrevam a principal conclusão do grupo.', M + 1.4, 2.4, CW - 2, 1.2));
      P.push({ t: 'icon', x: M, y: 4.66, s: 0.36, name: 'sparkles', color: th.accent3 });
      P.push(u.label('O que mais chamou a atenção', M + 0.5, 4.68, 8, th.ink));
      if (surprising.length) {
        const n = surprising.length, gap = 0.25, w = (CW - gap * (n - 1)) / n;
        surprising.forEach((it, i) => {
          const x = M + i * (w + gap);
          P.push(u.card(x, 5.12, w, 1.65));
          P.push(u.text(it, { x: x + 0.3, y: 5.25, w: w - 0.6, h: 1.4, size: n === 1 ? 20 : 17, valign: 'middle', min: 10 }));
        });
      } else P.push(...u.missing('Contem o que mais surpreendeu o grupo durante a pesquisa.', M, 5.12, CW, 1.1));
      return P;
    }

    case 'intervention': {
      const proposal = fieldText(s, 'proposal');
      const P = chrome(ctx, s, `${eyebrow} · Nossa ação`);
      P.push({ t: 'rect', x: M, y: 1.72, w: CW, h: 2.05, fill: th.accent, r: 0.22 });
      P.push({ t: 'ellipse', x: SW - M - 2.2, y: 1.95, w: 3.0, h: 3.0, fill: th.onAccent, alpha: 0.08 });
      P.push({ t: 'icon', x: M + 0.4, y: 2.38, s: 0.75, name: 'megaphone', color: th.onAccent });
      P.push(u.text('NOSSA PROPOSTA', { x: M + 1.5, y: 1.9, w: 6, h: 0.3, size: 12, bold: true, color: th.onAccent }));
      if (proposal) P.push(u.text(proposal, { x: M + 1.5, y: 2.22, w: CW - 1.9, h: 1.4, size: 26, font: 'display', color: th.onAccent, valign: 'middle', min: 15, lineH: 1.1 }));
      else P.push(u.text('Descrevam a intervenção que o grupo propõe (Etapa 5).', { x: M + 1.5, y: 2.3, w: CW - 2, h: 1, size: 18, color: th.onAccent }));
      const cards = ([['Objetivo', 'target', 'objective'], ['Público', 'users', 'audience'], ['O que queremos mudar', 'sparkles', 'change']] as const)
        .map(([lab, icon, key]) => ({ lab, icon, key, v: fieldText(s, key) }))
        .filter((c) => c.v || c.key !== 'change');
      const gap = 0.28, w = (CW - gap * (cards.length - 1)) / cards.length, y = 4.05, h = 2.7;
      const colors = [th.accent2, th.accent3, th.accent];
      cards.forEach((c, i) => {
        const x = M + i * (w + gap);
        P.push(u.card(x, y, w, h));
        P.push({ t: 'ellipse', x: x + 0.3, y: y + 0.3, w: 0.62, h: 0.62, fill: colors[i], alpha: 0.18 });
        P.push({ t: 'icon', x: x + 0.43, y: y + 0.43, s: 0.36, name: c.icon, color: colors[i] });
        P.push(u.label(c.lab, x + 1.1, y + 0.45, w - 1.3, th.ink));
        if (c.v) P.push(u.text(c.v, { x: x + 0.3, y: y + 1.1, w: w - 0.6, h: h - 1.3, size: 18, min: 11 }));
        else P.push(u.text(s.fields.find((f) => f.key === c.key)?.missing ?? 'Complementem.', { x: x + 0.3, y: y + 1.1, w: w - 0.6, h: 1, size: 14, color: th.accent3 }));
      });
      return P;
    }

    case 'practice': {
      const media = fieldList(s, 'media');
      const strategy = fieldList(s, 'strategy');
      const steps = fieldList(s, 'steps');
      const resources = fieldList(s, 'resources');
      const results = fieldList(s, 'results');
      const P = chrome(ctx, s, `${eyebrow} · Plano de ação`);
      // Coluna das mídias
      const lw = 4.55, Y = 1.72, H = 5.03;
      P.push(u.card(M, Y, lw, H, th.sunk, undefined));
      P.push(u.label('Mídias escolhidas', M + 0.3, Y + 0.25, lw - 0.6, th.ink));
      let cx = M + 0.3, cy = Y + 0.68;
      if (media.length) {
        media.forEach((m) => {
          const chip = u.text(m, { x: 0, y: 0, w: 3.6, h: 0.3, size: 14, bold: true, min: 10 });
          const est = Math.min(lw - 0.6, 0.75 + m.length * 0.105);
          if (cx + est > M + lw - 0.3) {
            cx = M + 0.3;
            cy += 0.58;
          }
          P.push({ t: 'rect', x: cx, y: cy, w: est, h: 0.46, fill: th.surface, r: 0.23, line: th.line, lineW: 0.75 });
          P.push({ t: 'icon', x: cx + 0.14, y: cy + 0.1, s: 0.26, name: 'media:' + m, color: th.accent });
          P.push({ ...chip, x: cx + 0.47, y: cy + 0.08, w: est - 0.55 });
          cx += est + 0.14;
        });
        cy += 0.75;
      } else {
        P.push(...u.missing('Escolham as mídias na Etapa 5.', M + 0.2, cy, lw - 0.4, 1));
        cy += 1.2;
      }
      const resH = resources.length ? 1.25 : 0;
      if (strategy.length) {
        P.push(u.label('Estratégia de comunicação', M + 0.3, cy, lw - 0.6, th.accent));
        P.push(u.bullets(strategy, { x: M + 0.3, y: cy + 0.38, w: lw - 0.6, h: Y + H - cy - 0.55 - resH, size: 15, min: 10, gap: 0.25 }));
      }
      if (resources.length) {
        const ry = Y + H - resH;
        P.push({ t: 'line', x1: M + 0.3, y1: ry - 0.08, x2: M + lw - 0.3, y2: ry - 0.08, color: th.line, w: 1 });
        P.push({ t: 'icon', x: M + 0.3, y: ry + 0.06, s: 0.28, name: 'tool', color: th.accent3 });
        P.push(u.label('Recursos', M + 0.68, ry + 0.06, lw - 1, th.ink));
        P.push(u.text(resources.join('  ·  '), { x: M + 0.3, y: ry + 0.42, w: lw - 0.6, h: resH - 0.55, size: 14, min: 9 }));
      }
      // Etapas
      const X = M + lw + 0.35, W = CW - lw - 0.35;
      P.push(u.label('Etapas de realização', X, Y + 0.05, W, th.ink));
      const sy = Y + 0.5, sh = 2.75;
      if (steps.length) {
        const n = steps.length, rowH = Math.min(0.95, sh / n);
        P.push({ t: 'line', x1: X + 0.25, y1: sy + rowH / 2, x2: X + 0.25, y2: sy + rowH * (n - 0.5), color: th.line, w: 2 });
        steps.forEach((st, i) => {
          const y = sy + i * rowH;
          P.push({ t: 'ellipse', x: X, y: y + rowH / 2 - 0.25, w: 0.5, h: 0.5, fill: th.accent });
          P.push(u.text(String(i + 1), { x: X, y: y + rowH / 2 - 0.2, w: 0.5, h: 0.4, size: 15, bold: true, color: th.onAccent, align: 'center', valign: 'middle' }));
          P.push(u.text(st, { x: X + 0.75, y: y + 0.05, w: W - 0.75, h: rowH - 0.1, size: 17, valign: 'middle', min: 10 }));
        });
      } else P.push(...u.missing('Expliquem como vão realizar a intervenção.', X, sy, W, 1.2));
      // Resultados esperados
      const by = Y + 3.4, bh = H - 3.4;
      P.push(u.card(X, by, W, bh));
      P.push({ t: 'icon', x: X + 0.25, y: by + 0.2, s: 0.3, name: 'flag', color: th.accent3 });
      P.push(u.label('Resultados esperados', X + 0.65, by + 0.2, W - 0.9, th.ink));
      if (results.length) P.push(u.bullets(results, { x: X + 0.25, y: by + 0.6, w: W - 0.5, h: bh - 0.75, size: 16, min: 10, gap: 0.25 }));
      else P.push(u.text('Que resultados vocês esperam? (Etapa 5)', { x: X + 0.25, y: by + 0.6, w: W - 0.5, h: 0.6, size: 13, color: th.accent3 }));
      return P;
    }

    case 'final': {
      const message = fieldText(s, 'message');
      const learned = fieldList(s, 'learned');
      const act = fieldList(s, 'act');
      const thanks = fieldText(s, 'thanks');
      const P = chrome(ctx, s, `${eyebrow} · Para concluir`);
      if (message) {
        const t = u.text(message, { x: 1.3, y: 1.75, w: SW - 2.6, h: 1.9, size: 34, font: 'display', align: 'center', valign: 'middle', min: 18, lineH: 1.1 });
        P.push(t);
        const hUsed = usedHeight(t);
        P.push({ t: 'rect', x: SW / 2 - 0.6, y: Math.min(3.75, 1.75 + (1.9 + hUsed) / 2 + 0.15), w: 1.2, h: 0.07, fill: th.accent3 });
      } else P.push(...u.missing('Qual é a mensagem principal do grupo?', M, 1.9, CW, 1.2));
      const boxes = [
        { lab: 'O que aprendemos', items: learned, icon: 'book', key: 'learned' },
        ...(act.length ? [{ lab: 'Por que é importante agir', items: act, icon: 'hand', key: 'act' }] : []),
      ];
      const gap = 0.3, w = (CW - gap * (boxes.length - 1)) / boxes.length, y = 4.0, h = 2.05;
      boxes.forEach((b, i) => {
        const x = M + i * (w + gap);
        P.push(u.card(x, y, w, h, i ? th.sunk : th.surface, i ? undefined : th.line));
        P.push({ t: 'icon', x: x + 0.3, y: y + 0.25, s: 0.36, name: b.icon, color: i ? th.accent3 : th.accent });
        P.push(u.label(b.lab, x + 0.8, y + 0.28, w - 1.1, th.ink));
        if (b.items.length) P.push(u.bullets(b.items, { x: x + 0.3, y: y + 0.72, w: w - 0.6, h: h - 0.9, size: 16, min: 10, gap: 0.25 }));
        else P.push(u.text(s.fields.find((f) => f.key === b.key)?.missing ?? '', { x: x + 0.3, y: y + 0.75, w: w - 0.6, h: 0.8, size: 14, color: th.accent3 }));
      });
      if (thanks) P.push(u.text(thanks, { x: M, y: 6.25, w: CW, h: 0.55, size: 20, font: 'display', color: th.accent, align: 'center', valign: 'middle', min: 11 }));
      return P;
    }

    case 'references': {
      const refs = s.refs ?? [];
      const P = chrome(ctx, s, `${eyebrow} · Onde pesquisamos`);
      if (!refs.length) {
        P.push(...u.missing('Registrem as fontes consultadas na Etapa 4. Nunca inventem referências.', M, 1.9, CW, 1.3));
        return P;
      }
      let y = 1.8;
      const avail = 6.85 - y;
      const per = avail / refs.length;
      refs.forEach((r, i) => {
        const paras: Para[] = [{ text: r.text }];
        if (r.needsCheck.length) paras.push({ text: 'Conferir: falta ' + r.needsCheck.join(', ') + '.', color: th.accent3, size: 12, bold: true });
        const t = u.text(paras, { x: M + 0.65, y, w: CW - 0.65, h: per - 0.12, size: 15, min: 9, gap: 0.15, href: r.link });
        if (r.link) t.paras[0] = { ...t.paras[0], link: r.link, color: th.link };
        P.push({ t: 'ellipse', x: M, y: y + 0.02, w: 0.4, h: 0.4, fill: th.accent, alpha: 0.15 });
        P.push(u.text(String(i + 1), { x: M, y: y + 0.07, w: 0.4, h: 0.3, size: 12, bold: true, color: th.accent, align: 'center' }));
        P.push(t);
        y += Math.max(0.55, usedHeight(t) + 0.28);
      });
      return P;
    }
  }
}

export function layoutDeck(slides: SlideData[], th: SlideTheme, themeLabel: string): Prim[][] {
  const visible = slides.filter((s) => !s.hidden);
  return visible.map((s, i) => layoutSlide(s, { th, index: i, total: visible.length, themeLabel }));
}
