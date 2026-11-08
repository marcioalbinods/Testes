import { forwardRef, useEffect, useRef, useState, type CSSProperties } from 'react';
import { BULLET_INDENT, FONT_CSS, PX, SH, SW, type Prim } from '../engine/prims';
import { resolveIcon } from './icons';

export const SLIDE_PX_W = Math.round(SW * PX); // 1280
export const SLIDE_PX_H = Math.round(SH * PX); // 720

const pt = (v: number) => (v * PX) / 72;
const hex = (c?: string, a = 1) => {
  if (!c) return 'transparent';
  const n = parseInt(c, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

function PrimEl({ p, i }: { p: Prim; i: number }) {
  switch (p.t) {
    case 'rect':
    case 'ellipse': {
      const st: CSSProperties = {
        position: 'absolute',
        left: p.x * PX,
        top: p.y * PX,
        width: p.w * PX,
        height: p.h * PX,
        background: hex(p.fill, p.alpha ?? 1),
        borderRadius: p.t === 'ellipse' ? '50%' : (p.r ?? 0) * PX,
        border: p.line ? `${pt(p.lineW ?? 1)}px ${p.t === 'rect' && p.dash ? 'dashed' : 'solid'} ${hex(p.line)}` : undefined,
        boxSizing: 'border-box',
        transform: p.rot ? `rotate(${p.rot}deg)` : undefined,
      };
      return <div style={st} />;
    }
    case 'text': {
      const justify = p.valign === 'middle' ? 'center' : p.valign === 'bottom' ? 'flex-end' : 'flex-start';
      return (
        <div
          style={{
            position: 'absolute',
            left: p.x * PX,
            top: p.y * PX,
            width: p.w * PX,
            height: p.h * PX,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: justify,
            fontFamily: FONT_CSS[p.font],
            fontWeight: p.font === 'display' ? 800 : p.bold ? 700 : 400,
            fontSize: pt(p.size),
            lineHeight: p.lineH ?? 1.18,
            color: hex(p.color),
            textAlign: p.align ?? 'left',
            overflow: 'hidden',
            overflowWrap: 'break-word',
            letterSpacing: p.font === 'display' ? '-0.01em' : p.bold && p.size <= 12 ? '0.08em' : undefined,
          }}
        >
          {p.paras.map((q, k) => {
            const size = q.size ? pt(q.size) : undefined;
            const content = q.link ? (
              <a href={q.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                {q.text}
              </a>
            ) : (
              q.text
            );
            return (
              <div
                key={k}
                style={{
                  position: 'relative',
                  paddingLeft: q.bullet ? BULLET_INDENT * PX : 0,
                  marginTop: k ? pt((p.gap ?? 0.35) * (q.size ?? p.size)) : 0,
                  fontSize: size,
                  fontWeight: q.bold ? 700 : undefined,
                  fontStyle: q.italic ? 'italic' : undefined,
                  color: q.color ? hex(q.color) : undefined,
                  letterSpacing: q.bold && (q.size ?? p.size) <= 12 ? '0.02em' : undefined,
                }}
              >
                {q.bullet && (
                  <span aria-hidden style={{ position: 'absolute', left: 2, top: 0, fontWeight: 700 }}>
                    •
                  </span>
                )}
                {content}
              </div>
            );
          })}
        </div>
      );
    }
    case 'icon': {
      const Icon = resolveIcon(p.name);
      return <Icon size={p.s * PX} color={hex(p.color)} strokeWidth={2.1} style={{ position: 'absolute', left: p.x * PX, top: p.y * PX }} aria-hidden />;
    }
    case 'line': {
      const id = `arr-${i}`;
      return (
        <svg width={SLIDE_PX_W} height={SLIDE_PX_H} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden>
          {p.arrow && (
            <defs>
              <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill={hex(p.color)} />
              </marker>
            </defs>
          )}
          <line
            x1={p.x1 * PX}
            y1={p.y1 * PX}
            x2={p.x2 * PX}
            y2={p.y2 * PX}
            stroke={hex(p.color)}
            strokeWidth={pt(p.w)}
            strokeDasharray={p.dash ? '6 6' : undefined}
            markerEnd={p.arrow ? `url(#${id})` : undefined}
          />
        </svg>
      );
    }
    case 'bars': {
      const max = Math.max(...p.data.map((d) => d.value), 0) || 1;
      const rowH = (p.h * PX) / Math.max(p.data.length, 1);
      return (
        <div style={{ position: 'absolute', left: p.x * PX, top: p.y * PX, width: p.w * PX, height: p.h * PX, fontFamily: FONT_CSS.body }}>
          {p.data.map((d, k) => (
            <div key={k} style={{ height: rowH, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: '38%', fontSize: pt(13), lineHeight: 1.15, color: hex(p.ink), textAlign: 'right', overflow: 'hidden', maxHeight: rowH - 6 }}>{d.label}</div>
              <div style={{ flex: 1, height: Math.min(34, rowH * 0.5), background: hex(p.grid, 0.6), borderRadius: 8, position: 'relative' }}>
                <div style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, height: '100%', background: hex(p.color), borderRadius: 8 }} />
              </div>
              <div style={{ width: 92, fontSize: pt(16), fontWeight: 700, color: hex(p.ink) }}>{d.display}</div>
            </div>
          ))}
        </div>
      );
    }
  }
}

/** Um slide em tamanho real (1280×720). */
export const SlideStatic = forwardRef<HTMLDivElement, { prims: Prim[] }>(function SlideStatic({ prims }, ref) {
  return (
    <div ref={ref} style={{ position: 'relative', width: SLIDE_PX_W, height: SLIDE_PX_H, overflow: 'hidden', background: '#fff' }}>
      {prims.map((p, i) => (
        <PrimEl key={i} p={p} i={i} />
      ))}
    </div>
  );
});

/** Um slide redimensionado para caber na largura disponível. */
export function SlideCanvas({ prims, className = '', label }: { prims: Prim[]; className?: string; label?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const scale = w / SLIDE_PX_W;
  return (
    <div ref={box} className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: '16 / 9' }} role="img" aria-label={label}>
      {w > 0 && (
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>
          <SlideStatic prims={prims} />
        </div>
      )}
    </div>
  );
}
