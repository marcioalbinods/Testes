import type { ReactNode } from 'react';
import { INK, shade } from '../colors';

export const SW = 5; // espessura do contorno

/** Cores derivadas de uma cor principal. */
export interface Tone {
  c: string; // principal
  d: string; // sombra
  l: string; // brilho
  ink: string;
}
export function tone(c: string): Tone {
  return { c, d: shade(c, 0.22), l: shade(c, -0.45), ink: INK };
}

/** Definição de uma peça desenhada em coordenadas locais (0,0 = ponto de encaixe). */
export interface PartDef {
  id: string;
  name: string;
  /** Desenha o lado esquerdo (ou a peça inteira, se única). */
  draw: (t: Tone, extra?: { accent: string }) => ReactNode;
  /** Peça única no centro (ex.: chifre de unicórnio). */
  single?: boolean;
  /** Cor padrão quando a peça não usa a cor do corpo. */
  defaultColor?: string;
}

/** Caminho suave e fechado que passa pelos pontos (Catmull-Rom → Bézier). */
export function smoothClosed(points: [number, number][]) {
  const n = points.length;
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

/** Forma "fofa" com ondulações (nuvem, flor, estrela macia). */
export function blobPath(cx: number, cy: number, rx: number, ry: number, bumps: number, amp: number, phase = -Math.PI / 2) {
  const pts: [number, number][] = [];
  const steps = bumps * 4;
  for (let i = 0; i < steps; i++) {
    const a = phase + (i / steps) * Math.PI * 2;
    const k = 1 + amp * Math.cos(bumps * (a - phase));
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smoothClosed(pts);
}

export function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
  return `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0Z`;
}

export function roundRectPath(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y}Z`;
}

/** Forma com contorno e preenchimento. */
export function Shape({ d, t, sw = SW, fill }: { d: string; t: Tone; sw?: number; fill?: string }) {
  return <path d={d} fill={fill ?? t.c} stroke={t.ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />;
}

export const stroke = (t: Tone, w = SW) => ({ stroke: t.ink, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
