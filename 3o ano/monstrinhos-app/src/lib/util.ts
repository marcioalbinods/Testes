import { useEffect, useRef, useState } from 'react';

/** Identificador curto e aleatório. */
export function uid() {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 12);
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Converte a posição do dedo/mouse em coordenadas de um <svg> com viewBox. */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = pt.matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}


/** Move suavemente um ponto até o alvo (animações das aventuras). */
export function useTween(x: number, y: number, ms = 450) {
  const [pos, setPos] = useState({ x, y });
  const cur = useRef({ x, y });
  useEffect(() => {
    const from = { ...cur.current };
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cur.current = { x: from.x + (x - from.x) * e, y: from.y + (y - from.y) * e };
      setPos(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [x, y, ms]);
  return pos;
}
