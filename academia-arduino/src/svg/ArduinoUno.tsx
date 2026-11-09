/**
 * Ilustração do Arduino Uno R3 em SVG (vista de cima, USB à esquerda).
 * Pode ser usada sozinha (<ArduinoUnoSvg/>) ou dentro de outro desenho (<ArduinoGroup/>).
 */
import type { ReactNode } from 'react';
import { ARDUINO_UNO, type BoardPin } from '../lib/arduino';

export type BoardPartId =
  | 'micro' | 'usb' | 'jack' | 'digital' | 'analog' | 'gnd' | '5v' | '3v3' | 'reset-pin' | 'reset-btn' | 'leds' | 'vin';

/** Regiões clicáveis das partes da placa. */
export const PART_REGIONS: Record<BoardPartId, { x: number; y: number; w: number; h: number; rx?: number }[]> = {
  micro: [{ x: 114, y: 120, w: 140, h: 40 }],
  usb: [{ x: -16, y: 26, w: 64, h: 54 }],
  jack: [{ x: -10, y: 148, w: 60, h: 50 }],
  digital: [{ x: 117, y: 3, w: 60, h: 14 }, { x: 183, y: 3, w: 80, h: 14 }],
  analog: [{ x: 195, y: 193, w: 60, h: 14 }],
  gnd: [{ x: 107, y: 3, w: 10, h: 14 }, { x: 155, y: 193, w: 20, h: 14 }],
  '5v': [{ x: 145, y: 193, w: 10, h: 14 }],
  '3v3': [{ x: 135, y: 193, w: 10, h: 14 }],
  'reset-pin': [{ x: 125, y: 193, w: 10, h: 14 }],
  'reset-btn': [{ x: 12, y: 4, w: 22, h: 20 }],
  leds: [{ x: 112, y: 30, w: 26, h: 34 }, { x: 224, y: 48, w: 24, h: 16 }],
  vin: [{ x: 175, y: 193, w: 10, h: 14 }],
};

const GROUP_COLOR: Record<string, string> = {
  digital: '#3a6cf4',
  analog: '#16b862',
  power: '#e5484d',
  gnd: '#2b2f3a',
  other: '#8a93ad',
};

export interface ArduinoGroupProps {
  x?: number;
  y?: number;
  /** destaca uma parte da placa */
  highlightPart?: BoardPartId | null;
  onPart?: (id: BoardPartId) => void;
  /** pinos clicáveis */
  onPin?: (pin: BoardPin) => void;
  onPinDown?: (pin: BoardPin, e: React.PointerEvent) => void;
  highlightPins?: string[];
  /** colore os pinos por tipo (entrada/saída/energia) */
  colorPins?: boolean;
  /** placa ligada (LED ON aceso) */
  powered?: boolean;
  /** LED L (pino 13) aceso */
  ledL?: number;
  /** LED TX piscando (dados no Serial) */
  tx?: boolean;
  showLabels?: boolean;
  /** pinos com fios conectados */
  usedPins?: string[];
  children?: ReactNode;
}

export function ArduinoGroup({
  x = 0, y = 0, highlightPart, onPart, onPin, onPinDown, highlightPins = [], colorPins, powered, ledL = 0, tx, showLabels = true, usedPins = [],
}: ArduinoGroupProps) {
  const pins = ARDUINO_UNO.pins;
  const partProps = (id: BoardPartId) =>
    onPart
      ? { onClick: () => onPart(id), style: { cursor: 'pointer' }, role: 'button', 'aria-label': id, tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onPart(id) }
      : {};
  return (
    <g transform={`translate(${x} ${y})`} className="arduino">
      {/* sombra */}
      <path d={BOARD_PATH} fill="#0a3a40" opacity=".25" transform="translate(3 4)" />
      {/* placa */}
      <path d={BOARD_PATH} fill="#00878f" stroke="#006169" strokeWidth="1.5" />
      <path d={BOARD_PATH} fill="url(#ard-sheen)" opacity=".35" />
      {/* trilhas decorativas */}
      <g stroke="#0a9ba3" strokeWidth="1" fill="none" opacity=".8">
        <path d="M60 90 h40 l10 10 h30" />
        <path d="M60 100 h30 l12 12 h20" />
        <path d="M150 60 v30 l-10 10" />
        <path d="M170 60 v40" />
        <path d="M200 30 v24 l10 10 h20" />
      </g>
      {/* furos de fixação */}
      {[[15, 196], [66, 8], [256, 8], [256, 186]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="5.2" fill="#e8d18a" />
          <circle cx={cx} cy={cy} r="3.2" fill="#0d2224" />
        </g>
      ))}
      {/* USB */}
      <g {...partProps('usb')}>
        <rect x="-16" y="28" width="62" height="50" rx="3" fill="#cfd5df" stroke="#8c95a8" />
        <rect x="-16" y="34" width="20" height="38" fill="#aeb6c6" />
        <rect x="-12" y="40" width="12" height="26" rx="2" fill="#5c6478" />
        <rect x="4" y="30" width="40" height="46" fill="url(#ard-metal)" opacity=".6" />
      </g>
      {/* conector de alimentação */}
      <g {...partProps('jack')}>
        <rect x="-10" y="150" width="58" height="46" rx="4" fill="#1d1f26" stroke="#000" />
        <circle cx="4" cy="173" r="11" fill="#33363f" />
        <circle cx="4" cy="173" r="4" fill="#bdbdbd" />
      </g>
      {/* regulador e capacitores */}
      <rect x="56" y="148" width="22" height="16" rx="2" fill="#262830" />
      <rect x="58" y="164" width="18" height="6" fill="#9aa3b5" />
      <circle cx="74" cy="122" r="9" fill="#c7cfdc" stroke="#7d8597" />
      <circle cx="74" cy="122" r="5" fill="#a1aabb" />
      <circle cx="52" cy="122" r="9" fill="#c7cfdc" stroke="#7d8597" />
      <circle cx="52" cy="122" r="5" fill="#a1aabb" />
      {/* ATmega16U2 (conversor USB) */}
      <rect x="64" y="40" width="22" height="22" rx="2" fill="#20222a" transform="rotate(45 75 51)" />
      {/* cristal */}
      <rect x="92" y="112" width="20" height="9" rx="4.5" fill="#d7dbe3" stroke="#8b93a7" />
      {/* botão de reset */}
      <g {...partProps('reset-btn')}>
        <rect x="13" y="5" width="20" height="18" rx="2" fill="#c9ced8" stroke="#7d8597" />
        <circle cx="23" cy="14" r="5.5" fill="#e5484d" stroke="#9c2227" />
      </g>
      {/* ICSP */}
      <g>
        {[0, 1, 2].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={250 + j * 8} y={64 + i * 8} width="7" height="7" fill="#15171c" />))}
        {showLabels && <text x="248" y="96" className="ard-txt" fontSize="5">ICSP</text>}
      </g>
      {/* LEDs */}
      <g {...partProps('leds')}>
        <LedSmd x={118} y={36} on={ledL} color="#ffcc33" label="L" showLabel={showLabels} />
        <LedSmd x={118} y={46} on={tx ? 1 : 0} color="#ffcc33" label="TX" showLabel={showLabels} />
        <LedSmd x={118} y={56} on={0} color="#ffcc33" label="RX" showLabel={showLabels} />
        <LedSmd x={232} y={56} on={powered ? 1 : 0} color="#5dff6a" label="ON" showLabel={showLabels} />
      </g>
      {/* microcontrolador ATmega328P */}
      <g {...partProps('micro')}>
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i}>
            <rect x={122 + i * 9.4} y={121} width="4" height="5" fill="#c0c6d2" />
            <rect x={122 + i * 9.4} y={154} width="4" height="5" fill="#c0c6d2" />
          </g>
        ))}
        <rect x="116" y="125" width="136" height="30" rx="2" fill="#1b1d24" stroke="#000" />
        <circle cx="122" cy="140" r="3" fill="#2c2f38" />
        {showLabels && <text x="184" y="143" textAnchor="middle" fill="#9aa1b5" fontSize="7" fontFamily="var(--font-code)">ATMEGA328P</text>}
      </g>
      {/* textos da placa */}
      {showLabels && (
        <g className="ard-txt">
          <text x="182" y="88" fontSize="17" fontWeight="700" textAnchor="middle" fontFamily="var(--font-head)">UNO</text>
          <text x="182" y="101" fontSize="7" textAnchor="middle" letterSpacing="1">ARDUINO</text>
          <text x="190" y="36" fontSize="5.5" textAnchor="middle">DIGITAL (PWM ~)</text>
          <text x="145" y="172" fontSize="5.5" textAnchor="middle">POWER</text>
          <text x="225" y="172" fontSize="5.5" textAnchor="middle">ANALOG IN</text>
        </g>
      )}
      {/* barras de pinos */}
      <rect x="77" y="4" width="104" height="12" rx="1.5" fill="#15171c" />
      <rect x="183" y="4" width="80" height="12" rx="1.5" fill="#15171c" />
      <rect x="105" y="194" width="80" height="12" rx="1.5" fill="#15171c" />
      <rect x="195" y="194" width="60" height="12" rx="1.5" fill="#15171c" />
      {pins.map((p) => {
        const hl = highlightPins.includes(p.id);
        const used = usedPins.includes(p.id);
        const col = GROUP_COLOR[p.group];
        const top = p.y < 100;
        return (
          <g
            key={p.id}
            data-pin={p.id}
            onClick={onPin ? () => onPin(p) : undefined}
            onPointerDown={onPinDown ? (e) => onPinDown(p, e) : undefined}
            style={onPin || onPinDown ? { cursor: 'pointer' } : undefined}
          >
            {colorPins && p.id !== 'NC' && <rect x={p.x - 4.6} y={p.y - 4.6} width="9.2" height="9.2" rx="2" fill={col} opacity=".9" />}
            {p.pwm && colorPins && <rect x={p.x - 4.6} y={p.y - 4.6} width="9.2" height="9.2" rx="2" fill="none" stroke="#c9a8ff" strokeWidth="1.4" />}
            <rect x={p.x - 2.2} y={p.y - 2.2} width="4.4" height="4.4" fill={used ? '#6b7280' : '#050608'} stroke="#d4af37" strokeWidth=".7" />
            {hl && (
              <rect x={p.x - 6} y={p.y - 6} width="12" height="12" rx="3" fill="none" stroke="#ffd43b" strokeWidth="2.2" className="pulse-stroke" />
            )}
            {showLabels && p.label && (
              <text
                x={top ? p.x + 1.4 : p.x + 1.4}
                y={top ? p.y + 7 : p.y - 7}
                fontSize="4"
                textAnchor={top ? 'end' : 'start'}
                className="ard-txt"
                transform={`rotate(-90 ${p.x + 1.4} ${top ? p.y + 7 : p.y - 7})`}
              >
                {p.label}
              </text>
            )}
            {(onPin || onPinDown) && <rect x={p.x - 5} y={p.y - 6} width="10" height="12" fill="transparent" />}
          </g>
        );
      })}
      {/* destaque de parte */}
      {highlightPart &&
        PART_REGIONS[highlightPart].map((r, i) => (
          <rect key={i} x={r.x - 2} y={r.y - 2} width={r.w + 4} height={r.h + 4} rx="5" fill="rgba(255,212,59,.18)" stroke="#ffd43b" strokeWidth="2.5" className="pulse-stroke" pointerEvents="none" />
        ))}
      {/* áreas clicáveis transparentes para os grupos de pinos */}
      {onPart &&
        (['digital', 'analog', 'gnd', '5v', '3v3', 'reset-pin', 'vin'] as BoardPartId[]).map((id) =>
          PART_REGIONS[id].map((r, i) => <rect key={`${id}${i}`} x={r.x} y={r.y} width={r.w} height={r.h} fill="transparent" {...partProps(id)} />),
        )}
    </g>
  );
}

function LedSmd({ x, y, on, color, label, showLabel }: { x: number; y: number; on: number; color: string; label: string; showLabel: boolean }) {
  return (
    <g>
      {on > 0 && <circle cx={x} cy={y} r={7} fill={color} opacity={0.35 * on} filter="url(#ard-blur)" />}
      <rect x={x - 3.5} y={y - 2} width="7" height="4" rx="1" fill={on > 0 ? color : '#f1efe4'} stroke="#b9b39a" strokeWidth=".5" />
      {showLabel && <text x={x + 6} y={y + 2} fontSize="4.6" className="ard-txt">{label}</text>}
    </g>
  );
}

const BOARD_PATH =
  'M4 0 H262 a6 6 0 0 1 6 6 V12 l2 4 V196 l-6 8 a6 6 0 0 1 -6 6 H4 a4 4 0 0 1 -4 -4 V4 a4 4 0 0 1 4 -4 Z';

/** Definições (gradientes e filtros) usadas pela placa. Inclua uma vez por SVG. */
export function ArduinoDefs() {
  return (
    <defs>
      <linearGradient id="ard-sheen" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".5" />
        <stop offset=".5" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ard-metal" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#8890a0" />
      </linearGradient>
      <filter id="ard-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" />
      </filter>
    </defs>
  );
}

export function ArduinoUnoSvg(props: ArduinoGroupProps & { className?: string; title?: string }) {
  return (
    <svg viewBox="-22 -6 298 222" className={props.className ?? 'svg-fluid'} role="img" aria-label={props.title ?? 'Placa Arduino Uno'}>
      <ArduinoDefs />
      <ArduinoGroup {...props} />
    </svg>
  );
}
