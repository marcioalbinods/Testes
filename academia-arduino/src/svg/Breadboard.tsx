/**
 * Protoboard de 400 pontos em SVG, com três visões:
 *  - 'top'    : vista de cima (como a peça real)
 *  - 'inside' : "Ver por dentro" — mostra as tiras metálicas internas
 *  - 'paths'  : conexões destacadas com cores diferentes para cada caminho elétrico
 */
import { memo } from 'react';
import {
  allHoles, BB_HEIGHT, BB_WIDTH, CHANNEL_Y, colX, COLS, netOf, RAIL_COLS, RAIL_SPLIT_COL, ROWS, type BreadboardConfig, type HoleInfo,
} from '../lib/breadboard';

export type BBView = 'top' | 'inside' | 'paths';

export interface BreadboardProps {
  x?: number;
  y?: number;
  cfg: BreadboardConfig;
  view?: BBView;
  /** furos com anel de destaque */
  highlight?: string[];
  /** caminhos (nets) iluminados */
  litNets?: string[];
  /** cor de preenchimento de alguns furos (respostas, seleção) */
  holeFill?: Record<string, string>;
  /** cor de cada caminho (ex.: tensão) */
  netColors?: Record<string, string>;
  onHole?: (id: string) => void;
  onHoleDown?: (id: string, e: React.PointerEvent) => void;
  onHoleEnter?: (id: string | null) => void;
  /** mostrar letras e números */
  labels?: boolean;
  /** desativa os alvos de toque (quando outro modo está ativo) */
  interactive?: boolean;
}

const STRIP_COLORS = ['#7c4dff', '#16b862', '#f5b800', '#3a6cf4', '#f76b15', '#0ea5a5'];
const RAIL_COLOR: Record<string, string> = { tp: '#e5484d', bp: '#e5484d', tn: '#2f6bff', bn: '#2f6bff' };
const ROW_Y_OF = (row: string) => allHoles().find((h) => h.row === row)!.y;

/** Cor didática de cada caminho na visão "conexões destacadas". */
export function pathColor(net: string): string {
  if (net.startsWith('rail:')) return RAIL_COLOR[net.split(':')[1]];
  const col = Number(/\d+/.exec(net)![0]);
  const bottom = net.includes(':B');
  return STRIP_COLORS[(col + (bottom ? 3 : 0)) % STRIP_COLORS.length];
}

function BreadboardImpl({
  x = 0, y = 0, cfg, view = 'top', highlight = [], litNets = [], holeFill = {}, netColors = {}, onHole, onHoleDown, onHoleEnter, labels = true, interactive = true,
}: BreadboardProps) {
  const holes = allHoles();
  const inside = view === 'inside';
  const paths = view === 'paths';
  const yTop = ROW_Y_OF('a');
  const yE = ROW_Y_OF('e');
  const yF = ROW_Y_OF('f');
  const yJ = ROW_Y_OF('j');
  const railY = { tp: ROW_Y_OF('tp'), tn: ROW_Y_OF('tn'), bn: ROW_Y_OF('bn'), bp: ROW_Y_OF('bp') };
  const lit = new Set(litNets);

  /** tiras metálicas (ou faixas coloridas) para cada caminho */
  const strips: { net: string; x: number; y: number; w: number; h: number }[] = [];
  for (let c = 1; c <= COLS; c++) {
    strips.push({ net: `strip:T${c}`, x: colX(c) - 3.2, y: yTop - 3.6, w: 6.4, h: yE - yTop + 7.2 });
    strips.push({ net: `strip:B${c}`, x: colX(c) - 3.2, y: yF - 3.6, w: 6.4, h: yJ - yF + 7.2 });
  }
  for (const r of ['tp', 'tn', 'bp', 'bn'] as const) {
    const y0 = railY[r] - 3.4;
    const first = colX(RAIL_COLS[0]) - 4;
    const last = colX(RAIL_COLS[RAIL_COLS.length - 1]) + 4;
    if (cfg.railsSplit) {
      const midL = colX(RAIL_COLS.filter((c) => c <= RAIL_SPLIT_COL).slice(-1)[0]) + 4;
      const midR = colX(RAIL_COLS.filter((c) => c > RAIL_SPLIT_COL)[0]) - 4;
      strips.push({ net: `rail:${r}:L`, x: first, y: y0, w: midL - first, h: 6.8 });
      strips.push({ net: `rail:${r}:R`, x: midR, y: y0, w: last - midR, h: 6.8 });
    } else strips.push({ net: `rail:${r}`, x: first, y: y0, w: last - first, h: 6.8 });
  }

  const railLine = (r: 'tp' | 'tn' | 'bp' | 'bn', offset: number) => {
    const yy = railY[r] + offset;
    const c = RAIL_COLOR[r];
    if (!cfg.railsSplit) return <line x1={14} x2={BB_WIDTH - 14} y1={yy} y2={yy} stroke={c} strokeWidth="1.3" />;
    const mid = colX(RAIL_SPLIT_COL) + 12;
    return (
      <g>
        <line x1={14} x2={mid - 10} y1={yy} y2={yy} stroke={c} strokeWidth="1.3" />
        <line x1={mid + 10} x2={BB_WIDTH - 14} y1={yy} y2={yy} stroke={c} strokeWidth="1.3" />
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y})`} className="breadboard">
      <rect x="2" y="4" width={BB_WIDTH} height={BB_HEIGHT} rx="8" fill="#9aa5c0" opacity=".35" />
      <rect x="0" y="0" width={BB_WIDTH} height={BB_HEIGHT} rx="8" fill={inside ? '#f6f1e3' : '#fbfaf5'} stroke="#d8d3c2" strokeWidth="1.2" />
      {!inside && <rect x="0" y="0" width={BB_WIDTH} height={BB_HEIGHT} rx="8" fill="url(#bb-shade)" />}
      {/* canal central */}
      <rect x="6" y={CHANNEL_Y - 5} width={BB_WIDTH - 12} height="10" rx="3" fill={inside ? '#e8e0c8' : '#ece8da'} stroke="#d6d0bd" strokeWidth=".8" />
      {inside && <text x={BB_WIDTH / 2} y={CHANNEL_Y + 2.5} textAnchor="middle" fontSize="6" fill="#9a8f6c" fontFamily="var(--font-head)">canal central — sem ligação</text>}
      {/* linhas coloridas dos trilhos */}
      {railLine('tp', -6)}
      {railLine('tn', 6)}
      {railLine('bn', -6)}
      {railLine('bp', 6)}
      {labels && (
        <g fontFamily="var(--font-head)" fontWeight="700" fontSize="8">
          <text x="6" y={railY.tp + 3} fill="#e5484d">+</text>
          <text x="6" y={railY.tn + 3} fill="#2f6bff">−</text>
          <text x={BB_WIDTH - 11} y={railY.tp + 3} fill="#e5484d">+</text>
          <text x={BB_WIDTH - 11} y={railY.tn + 3} fill="#2f6bff">−</text>
          <text x="6" y={railY.bn + 3} fill="#2f6bff">−</text>
          <text x="6" y={railY.bp + 3} fill="#e5484d">+</text>
          <text x={BB_WIDTH - 11} y={railY.bn + 3} fill="#2f6bff">−</text>
          <text x={BB_WIDTH - 11} y={railY.bp + 3} fill="#e5484d">+</text>
        </g>
      )}
      {labels && (
        <g fontFamily="var(--font-code)" fontSize="5" fill="#9b9480" textAnchor="middle">
          {ROWS.map((r) => (
            <g key={r}>
              <text x="8" y={ROW_Y_OF(r) + 2}>{r}</text>
              <text x={BB_WIDTH - 8} y={ROW_Y_OF(r) + 2}>{r}</text>
            </g>
          ))}
          {Array.from({ length: COLS }, (_, i) => i + 1)
            .filter((c) => c === 1 || c % 5 === 0)
            .map((c) => (
              <g key={c}>
                <text x={colX(c)} y={yTop - 7}>{c}</text>
                <text x={colX(c)} y={yJ + 11}>{c}</text>
              </g>
            ))}
        </g>
      )}
      {/* tiras internas / caminhos coloridos */}
      {(inside || paths) &&
        strips.map((s) => {
          const color = paths ? pathColor(s.net) : '#b9c0cc';
          return (
            <rect
              key={s.net}
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx="2.5"
              fill={inside ? 'url(#bb-metal)' : color}
              opacity={inside ? 1 : 0.32}
              stroke={inside ? '#8a93a5' : color}
              strokeWidth={inside ? 0.8 : 0.6}
            />
          );
        })}
      {/* caminhos com tensão (laboratório de circuitos) */}
      {strips
        .filter((s) => netColors[s.net])
        .map((s) => (
          <rect key={`v-${s.net}`} x={s.x} y={s.y} width={s.w} height={s.h} rx="2.5" fill={netColors[s.net]} opacity=".38" pointerEvents="none" />
        ))}
      {/* caminhos iluminados (furo clicado) */}
      {strips
        .filter((s) => lit.has(s.net))
        .map((s) => (
          <rect key={`l-${s.net}`} x={s.x - 1.5} y={s.y - 1.5} width={s.w + 3} height={s.h + 3} rx="3.5" fill={pathColor(s.net)} opacity=".45" stroke={pathColor(s.net)} strokeWidth="1.6" className="lit-path" pointerEvents="none" />
        ))}
      {/* furos */}
      {holes.map((h) => (
        <Hole key={h.id} h={h} fill={holeFill[h.id]} inside={inside} />
      ))}
      {highlight.map((id) => {
        const h = holes.find((x) => x.id === id);
        if (!h) return null;
        return <rect key={`hl-${id}`} x={h.x - 5} y={h.y - 5} width="10" height="10" rx="3" fill="none" stroke="#ffb800" strokeWidth="2" className="pulse-stroke" pointerEvents="none" />;
      })}
      {/* alvos de toque (área inteira de cada furo) */}
      {interactive && (onHole || onHoleDown || onHoleEnter) && (
        <g>
          {holes.map((h) => (
            <rect
              key={`t-${h.id}`}
              data-hole={h.id}
              x={h.x - 5}
              y={h.y - 5}
              width="10"
              height="10"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={onHole ? () => onHole(h.id) : undefined}
              onPointerDown={onHoleDown ? (e) => onHoleDown(h.id, e) : undefined}
              onPointerEnter={onHoleEnter ? () => onHoleEnter(h.id) : undefined}
              onPointerLeave={onHoleEnter ? () => onHoleEnter(null) : undefined}
            >
              <title>{h.kind === 'rail' ? `${h.row === 'tp' || h.row === 'bp' ? 'trilho +' : 'trilho −'} · coluna ${h.col}` : `${h.row}${h.col}`}</title>
            </rect>
          ))}
        </g>
      )}
    </g>
  );
}

const Hole = memo(function Hole({ h, fill, inside }: { h: HoleInfo; fill?: string; inside: boolean }) {
  return (
    <g pointerEvents="none">
      {fill && <rect x={h.x - 4.2} y={h.y - 4.2} width="8.4" height="8.4" rx="2" fill={fill} />}
      <rect x={h.x - 2.1} y={h.y - 2.1} width="4.2" height="4.2" rx=".8" fill={inside ? '#5d6475' : '#2c2a24'} opacity={inside ? 0.55 : 0.9} />
    </g>
  );
});

export const Breadboard = memo(BreadboardImpl);

export function BreadboardDefs() {
  return (
    <defs>
      <linearGradient id="bb-shade" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".6" />
        <stop offset="1" stopColor="#e8e3d2" stopOpacity=".5" />
      </linearGradient>
      <linearGradient id="bb-metal" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#d9dee8" />
        <stop offset=".5" stopColor="#f4f6fa" />
        <stop offset="1" stopColor="#aeb6c6" />
      </linearGradient>
    </defs>
  );
}

/** Protoboard sozinha em um SVG próprio. */
export function BreadboardSvg(props: BreadboardProps & { className?: string }) {
  return (
    <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className={props.className ?? 'svg-fluid'} role="img" aria-label="Protoboard">
      <BreadboardDefs />
      <Breadboard {...props} />
    </svg>
  );
}

export { netOf };
