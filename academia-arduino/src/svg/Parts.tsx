/**
 * Desenhos dos componentes da bancada (vista de cima), posicionados pelas pernas.
 */
import { LED_COLORS } from '../lib/circuit/parts';
import type { PlacedPart } from '../lib/circuit/types';
import { colorById, ohmsToBands } from '../lib/resistor';

type P = { x: number; y: number };

export interface PartVisualState {
  brightness?: number;
  sound?: boolean;
  servoAngle?: number;
  selected?: boolean;
  problem?: boolean;
  ghost?: boolean;
  flow?: boolean;
}

export function PartGraphic({ part, legs, st, bbBottom }: { part: PlacedPart; legs: Record<string, P>; st: PartVisualState; bbBottom: number }) {
  const sel = st.selected ? <SelectRing legs={Object.values(legs)} /> : null;
  const prob = st.problem ? <SelectRing legs={Object.values(legs)} color="#e5484d" dashed /> : null;
  const op = st.ghost ? 0.55 : 1;
  let body: JSX.Element | null = null;
  switch (part.kind) {
    case 'led': body = <Led a={legs.A} k={legs.K} color={part.props.color ?? 'red'} b={st.brightness ?? 0} />; break;
    case 'resistor': body = <Resistor a={legs['1']} b={legs['2']} ohms={part.props.ohms ?? 220} />; break;
    case 'button': body = <Button legs={legs} pressed={!!part.props.pressed} />; break;
    case 'buzzer': body = <Buzzer p={legs.P} n={legs.N} sound={!!st.sound} />; break;
    case 'pot': body = <Pot a={legs['1']} w={legs.W} c={legs['3']} pos={part.props.pos ?? 0.5} />; break;
    case 'ldr': body = <Ldr a={legs['1']} b={legs['2']} light={part.props.light ?? 0.5} />; break;
    case 'servo': body = <Servo g={legs.GND} v={legs.VCC} s={legs.SIG} angle={st.servoAngle ?? 90} bottom={bbBottom} />; break;
    case 'ultrasonic': body = <Sonar legs={legs} distance={part.props.distance ?? 50} />; break;
  }
  return (
    <g opacity={op} className="part">
      {prob}
      {body}
      {sel}
    </g>
  );
}

function SelectRing({ legs, color = '#ffb800', dashed }: { legs: P[]; color?: string; dashed?: boolean }) {
  const xs = legs.map((l) => l.x);
  const ys = legs.map((l) => l.y);
  const x0 = Math.min(...xs) - 9;
  const y0 = Math.min(...ys) - 14;
  return (
    <rect x={x0} y={y0} width={Math.max(...xs) - x0 + 9} height={Math.max(...ys) - y0 + 9} rx="6" fill="none" stroke={color} strokeWidth="1.8" strokeDasharray={dashed ? '4 3' : undefined} className="pulse-stroke" pointerEvents="none" />
  );
}

const legLine = (from: P, to: P, key?: string) => <line key={key} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#b9bfca" strokeWidth="1.6" strokeLinecap="round" />;
const pinDot = (p: P, key?: string) => <rect key={key} x={p.x - 1.6} y={p.y - 1.6} width="3.2" height="3.2" fill="#8d95a5" />;

/* ---------------- LED ---------------- */
export function Led({ a, k, color, b }: { a: P; k: P; color: keyof typeof LED_COLORS; b: number }) {
  const c = LED_COLORS[color];
  const vertical = Math.abs(a.x - k.x) < 1;
  const mid = { x: (a.x + k.x) / 2, y: (a.y + k.y) / 2 };
  const body = vertical ? { x: mid.x + 9, y: mid.y } : { x: mid.x, y: mid.y - 9 };
  // a perna longa (ânodo) tem uma "dobra"
  const knee = vertical ? { x: a.x + 4, y: a.y + 2 } : { x: a.x + 2, y: a.y - 4 };
  return (
    <g>
      <polyline points={`${a.x},${a.y} ${knee.x},${knee.y} ${body.x - (vertical ? 3 : 2)},${body.y - (vertical ? 2 : -3)}`} fill="none" stroke="#b9bfca" strokeWidth="1.6" strokeLinejoin="round" />
      {legLine(k, { x: body.x + (vertical ? -3 : 2), y: body.y + (vertical ? 2 : 3) })}
      {b > 0 && <circle cx={body.x} cy={body.y} r={10 + b * 9} fill={c.glow} opacity={0.25 + b * 0.45} filter="url(#glow-blur)" />}
      <circle cx={body.x} cy={body.y} r="6.4" fill={c.fill} stroke="rgba(0,0,0,.35)" strokeWidth=".8" opacity={b > 0 ? 1 : 0.88} />
      {/* lado chato = cátodo */}
      {vertical ? (
        <line x1={body.x - 5} y1={body.y + 4.6} x2={body.x + 5} y2={body.y + 4.6} stroke="rgba(0,0,0,.45)" strokeWidth="1.4" />
      ) : (
        <line x1={body.x + 4.6} y1={body.y - 5} x2={body.x + 4.6} y2={body.y + 5} stroke="rgba(0,0,0,.45)" strokeWidth="1.4" />
      )}
      <circle cx={body.x - 2} cy={body.y - 2} r="2" fill="#fff" opacity={0.55 + b * 0.4} />
      {b > 0.6 && <circle cx={body.x} cy={body.y} r="3" fill="#fff" opacity={b - 0.4} />}
      {pinDot(a)}
      {pinDot(k)}
    </g>
  );
}

/* ---------------- Resistor ---------------- */
export function Resistor({ a, b, ohms }: { a: P; b: P; ohms: number }) {
  const bands = ohmsToBands(ohms);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return (
    <g>
      {legLine(a, b)}
      <g transform={`translate(${mid.x} ${mid.y}) rotate(${ang})`}>
        <rect x="-12" y="-4" width="24" height="8" rx="3.6" fill="#e8cf9c" stroke="#b49a63" strokeWidth=".6" />
        {bands.map((id, i) => (
          <rect key={i} x={-8 + i * 4.4 + (i === 3 ? 2.6 : 0)} y="-4" width="2.2" height="8" fill={colorById(id).hex} />
        ))}
      </g>
      {pinDot(a)}
      {pinDot(b)}
    </g>
  );
}

/* ---------------- Botão ---------------- */
export function Button({ legs, pressed }: { legs: Record<string, P>; pressed: boolean }) {
  const xs = [legs['1a'].x, legs['2a'].x];
  const cx = (xs[0] + xs[1]) / 2;
  const cy = (legs['1a'].y + legs['1b'].y) / 2;
  return (
    <g>
      {Object.entries(legs).map(([k, p]) => legLine(p, { x: p.x + (p.x < cx ? 3 : -3), y: p.y + (p.y < cy ? 4 : -4) }, k))}
      <rect x={cx - 11} y={cy - 11} width="22" height="22" rx="3" fill="#2b2f3a" stroke="#14161c" />
      <rect x={cx - 9} y={cy - 9} width="18" height="18" rx="2" fill="#c3c8d2" />
      <circle cx={cx} cy={cy} r={pressed ? 5.4 : 6.2} fill={pressed ? '#7a2a2a' : '#c0392b'} stroke="#5d1a1a" strokeWidth="1" />
      {!pressed && <circle cx={cx - 1.8} cy={cy - 1.8} r="1.8" fill="#fff" opacity=".45" />}
      {Object.entries(legs).map(([k, p]) => pinDot(p, k))}
    </g>
  );
}

/* ---------------- Buzzer ---------------- */
export function Buzzer({ p, n, sound }: { p: P; n: P; sound: boolean }) {
  const cx = (p.x + n.x) / 2;
  const cy = (p.y + n.y) / 2;
  return (
    <g>
      {legLine(p, { x: cx - 6, y: cy })}
      {legLine(n, { x: cx + 6, y: cy })}
      {sound && (
        <g stroke="#7c4dff" strokeWidth="1.4" fill="none" opacity=".8">
          <circle cx={cx} cy={cy} r="17" className="sound-wave" />
          <circle cx={cx} cy={cy} r="22" className="sound-wave d2" />
        </g>
      )}
      <circle cx={cx} cy={cy} r="13" fill="#1f2128" stroke="#000" />
      <circle cx={cx} cy={cy} r="9" fill="#2c2f38" />
      <circle cx={cx} cy={cy} r="2.4" fill="#0b0c10" />
      <text x={cx - 9} y={cy - 6} fontSize="6" fill="#fff" fontWeight="700">+</text>
      {pinDot(p)}
      {pinDot(n)}
    </g>
  );
}

/* ---------------- Potenciômetro ---------------- */
export function Pot({ a, w, c, pos }: { a: P; w: P; c: P; pos: number }) {
  const cx = w.x;
  const cy = w.y - 13;
  const ang = -135 + pos * 270;
  return (
    <g>
      {[a, w, c].map((p, i) => legLine(p, { x: p.x, y: cy + 6 }, String(i)))}
      <rect x={a.x - 6} y={cy - 9} width={c.x - a.x + 12} height="17" rx="3" fill="#2f5fd0" stroke="#1d3c8a" />
      <circle cx={cx} cy={cy} r="8" fill="#e6e9f0" stroke="#8a93a5" />
      <g transform={`rotate(${ang} ${cx} ${cy})`}>
        <rect x={cx - 1.2} y={cy - 7.5} width="2.4" height="7" rx="1" fill="#3a4152" />
      </g>
      {[a, w, c].map((p, i) => pinDot(p, String(i)))}
    </g>
  );
}

/* ---------------- LDR ---------------- */
export function Ldr({ a, b, light }: { a: P; b: P; light: number }) {
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const vertical = Math.abs(a.x - b.x) < 1;
  const body = vertical ? { x: cx + 9, y: cy } : { x: cx, y: cy - 9 };
  return (
    <g>
      {legLine(a, { x: body.x - (vertical ? 0 : 3), y: body.y + (vertical ? -3 : 0) })}
      {legLine(b, { x: body.x + (vertical ? 0 : 3), y: body.y + (vertical ? 3 : 0) })}
      <circle cx={body.x} cy={body.y} r={11 + light * 6} fill="#fff6c2" opacity={light * 0.6} />
      <circle cx={body.x} cy={body.y} r="6.5" fill="#f3e3c4" stroke="#b39260" strokeWidth=".8" />
      <path d={`M${body.x - 4} ${body.y - 3} h8 M${body.x + 4} ${body.y - 3} v2 h-8 v2 h8 v2 h-8`} stroke="#c0392b" strokeWidth="1" fill="none" />
      {pinDot(a)}
      {pinDot(b)}
    </g>
  );
}

/* ---------------- Servo ---------------- */
export function Servo({ g, v, s, angle, bottom }: { g: P; v: P; s: P; angle: number; bottom: number }) {
  const bx = v.x;
  const by = bottom + 36;
  const wires: [P, string][] = [[g, '#6b3d1f'], [v, '#d62f2f'], [s, '#f08a12']];
  return (
    <g>
      {wires.map(([p, c], i) => (
        <path key={i} d={`M${p.x} ${p.y} C ${p.x} ${p.y + 30}, ${bx - 4 + i * 4} ${by - 40}, ${bx - 4 + i * 4} ${by - 12}`} stroke={c} strokeWidth="2" fill="none" />
      ))}
      <rect x={g.x - 4} y={g.y - 4} width={s.x - g.x + 8} height="8" rx="1.5" fill="#1b1d24" />
      {[g, v, s].map((p, i) => pinDot(p, String(i)))}
      <rect x={bx - 26} y={by - 12} width="52" height="26" rx="3" fill="#2f6bff" stroke="#163c9a" />
      <rect x={bx - 34} y={by - 4} width="68" height="8" rx="2" fill="#2459d8" stroke="#163c9a" />
      <text x={bx - 20} y={by + 10} fontSize="5" fill="#cfe0ff" fontFamily="var(--font-head)">SERVO</text>
      <circle cx={bx + 12} cy={by} r="7" fill="#e9ecf3" stroke="#8a93a5" />
      <g transform={`rotate(${180 - angle} ${bx + 12} ${by})`} className="servo-horn">
        <path d={`M${bx + 12} ${by - 3} L${bx + 34} ${by - 1.6} a1.6 1.6 0 0 1 0 3.2 L${bx + 12} ${by + 3} z`} fill="#fff" stroke="#8a93a5" strokeWidth=".8" />
      </g>
      <circle cx={bx + 12} cy={by} r="2" fill="#8a93a5" />
      <text x={bx - 20} y={by - 15} fontSize="6" fill="var(--ink-2)" fontFamily="var(--font-code)">{Math.round(angle)}°</text>
    </g>
  );
}

/* ---------------- Sensor ultrassônico ---------------- */
export function Sonar({ legs, distance }: { legs: Record<string, P>; distance: number }) {
  const ps = [legs.VCC, legs.TRIG, legs.ECHO, legs.GND];
  const cx = (ps[0].x + ps[3].x) / 2;
  const top = -48;
  const names = ['VCC', 'Trig', 'Echo', 'GND'];
  return (
    <g>
      {ps.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y} x2={cx - 15 + i * 10} y2={top + 40} stroke="#b9bfca" strokeWidth="1.6" />
          {pinDot(p)}
        </g>
      ))}
      <rect x={cx - 45} y={top} width="90" height="40" rx="3" fill="#2a64d6" stroke="#173f94" />
      {[-22, 22].map((dx) => (
        <g key={dx}>
          <circle cx={cx + dx} cy={top + 18} r="14" fill="#d9dde6" stroke="#8d95a5" />
          <circle cx={cx + dx} cy={top + 18} r="10" fill="#3a3f4c" />
          <circle cx={cx + dx} cy={top + 18} r="9" fill="url(#mesh)" />
        </g>
      ))}
      <text x={cx} y={top + 7} fontSize="5" fill="#fff" textAnchor="middle" fontFamily="var(--font-head)">HC-SR04</text>
      {names.map((n, i) => (
        <text key={n} x={cx - 15 + i * 10} y={top + 38} fontSize="3.4" fill="#fff" textAnchor="middle">{n}</text>
      ))}
      <g className="sonar-waves" stroke="#7c4dff" strokeWidth="1.2" fill="none" opacity=".7">
        <path d={`M${cx - 30} ${top - 6} q30 -12 60 0`} />
        <path d={`M${cx - 24} ${top - 12} q24 -10 48 0`} className="d2" />
      </g>
      <text x={cx} y={top - 20} fontSize="7" fill="var(--purple-700)" textAnchor="middle" fontFamily="var(--font-head)" fontWeight="700">
        objeto a {distance} cm
      </text>
    </g>
  );
}

/** Filtros e gradientes usados pelos componentes. */
export function PartsDefs() {
  return (
    <defs>
      <filter id="glow-blur" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
      <pattern id="mesh" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
        <rect width="2.4" height="2.4" fill="#8d95a5" />
        <circle cx="1.2" cy="1.2" r=".7" fill="#4a505e" />
      </pattern>
    </defs>
  );
}
