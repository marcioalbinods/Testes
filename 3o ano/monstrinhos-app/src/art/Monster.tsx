import { memo, useId, type CSSProperties, type ReactNode } from 'react';
import type { AnimId, AnimSetting, DanceMove, FaceSpec, MonsterState, PartSel, SlotKey } from '../game/types';
import { INK, shade, isValidHex } from './colors';
import { tone, type PartDef } from './parts/common';
import { HEADS, type HeadDef } from './parts/heads';
import { BODIES, type BodyDef } from './parts/bodies';
import { EYE_SETS, Eye, lidPath, type EyeSpot } from './parts/eyes';
import { MOUTHS } from './parts/mouths';
import { EARS, HORNS, ANTENNAE, SPIKES, starPathAt, heartPathAt } from './parts/head-extras';
import { ARMS, LEGS, TAILS } from './parts/limbs';
import { WINGS, ACCESSORIES, TEXTURES } from './parts/extras';
import { SLOTS } from './parts';
import { NEUTRAL_FACE } from './faces';

export const MONSTER_VIEWBOX = { x: -40, y: -70, w: 480, h: 550 };
const VB = `${MONSTER_VIEWBOX.x} ${MONSTER_VIEWBOX.y} ${MONSTER_VIEWBOX.w} ${MONSTER_VIEWBOX.h}`;

const byId = <T extends { id: string }>(list: T[], id: string | undefined, fallback = 0): T => list.find((x) => x.id === id) ?? list[fallback];

function partColor(slot: SlotKey, sel: PartSel, skin: string, def?: { defaultColor?: string }) {
  if (sel.color && isValidHex(sel.color)) return sel.color;
  if (def?.defaultColor) return def.defaultColor;
  return SLOTS[slot].skinByDefault ? skin : SLOTS[slot].defaultColor;
}

export interface Layout {
  head: HeadDef;
  body: BodyDef;
  headDy: number; // deslocamento vertical da cabeça para encaixar no corpo
  headScale: number;
  bodyScale: number;
  foot: number; // y do chão (pés)
  /** Converte um ponto do corpo considerando a escala do corpo. */
  bp: (x: number, y: number) => [number, number];
  /** Converte um ponto da cabeça para o espaço do monstrinho. */
  hp: (x: number, y: number) => [number, number];
}

export function layoutOf(m: MonsterState): Layout {
  const headSel = m.parts.head!;
  const bodySel = m.parts.body!;
  const head = byId(HEADS, headSel?.id);
  const body = byId(BODIES, bodySel?.id);
  const bodyScale = bodySel?.scale ?? 1;
  const headScale = headSel?.scale ?? 1;
  const bb = body.a.bottom;
  const bp = (x: number, y: number): [number, number] => [200 + (x - 200) * bodyScale, bb - (bb - y) * bodyScale];
  const bodyTop = bp(200, body.a.top)[1];
  const headDy = bodyTop + 24 - head.a.bottom + (headSel?.dy ?? 0);
  const hx = headSel?.dx ?? 0;
  const hp = (x: number, y: number): [number, number] => [200 + hx + (x - 200) * headScale, head.a.bottom + headDy - (head.a.bottom - y) * headScale];
  const legs = m.parts.legs;
  const legDef = legs ? byId(LEGS, legs.id) : null;
  let foot = bb + 2;
  if (legs && legDef) {
    foot = legDef.single ? bb + 46 * legs.scale : bp(200, body.a.hipY)[1] + legs.dy + 52 * legs.scale;
  }
  return { head, body, headDy, headScale, bodyScale, foot, bp, hp };
}

/** Altura dos pés (para posicionar o monstrinho em cenários). */
export function monsterFootY(m: MonsterState) {
  return layoutOf(m).foot;
}

function placed(sel: PartSel, x: number, y: number, mirror: boolean, children: ReactNode, key?: string, cls?: string, origin?: [number, number]) {
  const sx = sel.scale * (sel.flip ? -1 : 1);
  const inner = (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${sel.rot}) scale(${sx} ${sel.scale})`}>{children}</g>
  );
  const style: CSSProperties | undefined = origin ? { transformOrigin: `${origin[0].toFixed(1)}px ${origin[1].toFixed(1)}px` } : undefined;
  return (
    <g key={key} className={cls} style={style}>
      {mirror ? <g transform={`translate(${(2 * x).toFixed(1)} 0) scale(-1 1)`}>{inner}</g> : inner}
    </g>
  );
}

/** Peça em par: desenha esquerda e espelha para a direita. */
function pairParts(def: PartDef, sel: PartSel, color: string, accent: string, lx: number, y: number, cls: string, center = 200) {
  const t = tone(color);
  const art = def.draw(t, { accent });
  if (def.single) return placed(sel, center + sel.dx, y + sel.dy, false, art, cls, cls, [center + sel.dx, y + sel.dy]);
  const left = center - lx - sel.dx;
  const right = center + lx + sel.dx;
  return (
    <g>
      {placed(sel, left, y + sel.dy, false, art, cls + '-l', cls + '-l', [left, y + sel.dy])}
      {placed(sel, right, y + sel.dy, true, art, cls + '-r', cls + '-r', [right, y + sel.dy])}
    </g>
  );
}

function Brows({ eyes, brows, ox, oy, s }: { eyes: EyeSpot[]; brows: FaceSpec['brows']; ox: number; oy: number; s: number }) {
  if (brows === 'nenhuma') return null;
  return (
    <g fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round">
      {eyes.map((e, i) => {
        const side = e.x < 0 ? -1 : e.x > 0 ? 1 : 0;
        const x = ox + e.x * s;
        const y = oy + (e.y - e.r - 12) * s;
        const w = Math.max(14, e.r * 0.9) * s;
        let d = `M${x - w},${y} Q${x},${y - 8} ${x + w},${y}`;
        if (brows === 'triste' || brows === 'preocupada') {
          // ponta de dentro levantada
          const inner = side <= 0 ? x + w : x - w;
          const outer = side <= 0 ? x - w : x + w;
          d = `M${outer},${y + 4} Q${x},${y} ${inner},${y - 10}`;
          if (brows === 'preocupada') d += ` M${outer},${y - 8} l0,0`;
        } else if (brows === 'brava') {
          const inner = side <= 0 ? x + w : x - w;
          const outer = side <= 0 ? x - w : x + w;
          d = `M${outer},${y - 8} L${inner},${y + 6}`;
        } else if (brows === 'surpresa') {
          d = `M${x - w},${y - 6} Q${x},${y - 20} ${x + w},${y - 6}`;
        } else if (brows === 'curiosa') {
          d = i === eyes.length - 1 ? `M${x - w},${y - 8} Q${x},${y - 22} ${x + w},${y - 10}` : `M${x - w},${y + 2} L${x + w},${y + 2}`;
        }
        return <path key={i} d={d} />;
      })}
    </g>
  );
}

function FaceExtraArt({ extra, x, y, w }: { extra: FaceSpec['extra']; x: number; y: number; w: number }) {
  switch (extra) {
    case 'lagrima':
      return <path className="m-tear" d={`M${x - w * 0.42},${y + 10} q-9,16 0,22 q9,-6 0,-22Z`} fill="#7cc9ff" stroke={INK} strokeWidth={3} />;
    case 'gota':
      return <path className="m-sweat" d={`M${x + w * 0.62},${y - 40} q-12,20 0,28 q12,-8 0,-28Z`} fill="#bfe8ff" stroke={INK} strokeWidth={3} />;
    case 'zzz':
      return (
        <g className="m-zzz" fill="#ffffff" stroke={INK} strokeWidth={2.5} fontWeight={700} fontFamily="Fredoka, sans-serif">
          <text x={x + w * 0.55} y={y - 50} fontSize={30}>Z</text>
          <text x={x + w * 0.75} y={y - 80} fontSize={24}>z</text>
          <text x={x + w * 0.9} y={y - 104} fontSize={18}>z</text>
        </g>
      );
    case 'coracoes':
      return (
        <g className="m-float-up">
          <path d={heartPathAt(x - w * 0.7, y - 70, 12)} fill="#ff5c7a" stroke={INK} strokeWidth={3} />
          <path d={heartPathAt(x + w * 0.72, y - 90, 9)} fill="#ff8fc7" stroke={INK} strokeWidth={3} />
        </g>
      );
    case 'exclamacao':
      return <text className="m-pop" x={x + w * 0.6} y={y - 60} fontSize={56} fontWeight={700} fill="#ffd23f" stroke={INK} strokeWidth={3} fontFamily="Fredoka, sans-serif">!</text>;
    case 'interrogacao':
      return <text className="m-pop" x={x + w * 0.6} y={y - 60} fontSize={52} fontWeight={700} fill="#7cc9ff" stroke={INK} strokeWidth={3} fontFamily="Fredoka, sans-serif">?</text>;
    case 'brilhos':
      return (
        <g className="m-twinkle" fill="#ffd23f" stroke={INK} strokeWidth={2.5}>
          <path d={starPathAt(x - w * 0.8, y - 60, 12)} />
          <path d={starPathAt(x + w * 0.85, y - 30, 10)} />
          <path d={starPathAt(x + w * 0.4, y - 100, 8)} />
        </g>
      );
    case 'notas':
      return (
        <g className="m-float-up" fill={INK} fontSize={34} fontFamily="sans-serif">
          <text x={x + w * 0.62} y={y - 60}>♪</text>
          <text x={x - w * 0.85} y={y - 76}>♫</text>
        </g>
      );
    default:
      return null;
  }
}

export interface MonsterProps {
  m: MonsterState;
  anim?: AnimId;
  dance?: DanceMove | null;
  face?: FaceSpec;
  setting?: AnimSetting;
  /** Sem animação (miniaturas, impressão). */
  still?: boolean;
  /** Destaca uma peça no editor. */
  highlight?: SlotKey | null;
  className?: string;
  title?: string;
}

function MonsterGroup({ m, anim = 'parado', dance = null, face = NEUTRAL_FACE, setting, still, highlight }: MonsterProps) {
  const rawId = useId();
  const uid = 'm' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const L = layoutOf(m);
  const { head, body, bp, hp } = L;
  const skin = isValidHex(m.skin) ? m.skin : '#7cc9ff';
  const T = tone(skin);
  const p = m.parts;
  const texture = byId(TEXTURES, m.texture);
  const texColor = isValidHex(m.textureColor) ? m.textureColor : shade(skin, 0.25);

  const headSel = p.head!;
  const headTransform = `translate(${headSel.dx.toFixed(1)} ${L.headDy.toFixed(1)}) translate(200 ${head.a.bottom}) scale(${L.headScale}) translate(-200 ${-head.a.bottom})`;
  const bodyTransform = `translate(200 ${body.a.bottom}) scale(${L.bodyScale}) translate(-200 ${-body.a.bottom})`;
  const [, headMidY] = hp(200, (head.a.top + head.a.bottom) / 2);

  // ---- olhos e boca (no espaço da cabeça) ----
  const eyesSel = p.eyes!;
  const eyeSet = byId(EYE_SETS, eyesSel.id);
  const iris = partColor('eyes', eyesSel, skin);
  const mouthSel = p.mouth!;
  const mouthDef = face.mouth ? byId(MOUTHS, face.mouth) : byId(MOUTHS, mouthSel.id);
  const mouthColor = partColor('mouth', mouthSel, skin, byId(MOUTHS, mouthSel.id));
  const eyeOx = 200 + eyesSel.dx;
  const eyeOy = head.a.eyeY + eyesSel.dy;
  const es = eyesSel.scale;
  const eyesArt = eyeSet.eyes.map((e, i) => {
    let kind = e.kind;
    const side = e.x < 0 ? -1 : 1;
    if (face.eyes === 'fechados') kind = 'arc';
    if (face.eyes === 'piscando' && i === eyeSet.eyes.length - 1) kind = 'arc';
    if (face.eyes === 'coracoes') kind = 'heart';
    if (face.eyes === 'estrelas') kind = 'star';
    if (face.eyes === 'espirais') kind = 'spiral';
    const r = face.eyes === 'arregalados' ? e.r * 1.18 : e.r;
    const ex = { ...e, kind, r };
    const flipX = eyesSel.flip ? -1 : 1;
    return (
      <g key={i} className="m-eye" style={{ transformOrigin: `${eyeOx + e.x * es * flipX}px ${eyeOy + e.y * es}px` }}>
        <g transform={`translate(${eyeOx} ${eyeOy}) scale(${es * flipX} ${es})`}>
          <Eye e={ex} iris={face.eyes === 'coracoes' ? '#ff5c7a' : face.eyes === 'estrelas' ? '#ffd23f' : iris} skin={skin} lx={face.lookX * flipX} ly={face.lookY} side={side * flipX} />
          {face.eyes === 'sonolentos' && kind !== 'arc' && <path d={lidPath(e.x, e.y, r + 1, 180, 360)} fill={skin} stroke={INK} strokeWidth={4} />}
        </g>
      </g>
    );
  });
  let mouthTransform = `translate(${200 + mouthSel.dx} ${head.a.mouthY + mouthSel.dy}) scale(${mouthSel.scale * (mouthSel.flip ? -1 : 1)} ${mouthSel.scale})`;
  if (face.mouthMod === 'triste') mouthTransform += ' translate(0 10) scale(1 -1)';
  if (face.mouthMod === 'reto') mouthTransform += ' scale(1 0.45)';
  if (face.mouthMod === 'aberto') mouthTransform += ' scale(1.1 1.35)';

  const blush = m.cheeks || face.blush;
  const cheekY = (head.a.eyeY + head.a.mouthY) / 2 + 8;
  const cheekX = Math.min(head.a.earX + 6, 70);

  // ---- peças da cabeça ----
  const headBack: ReactNode[] = [];
  if (p.ears) {
    const d = byId(EARS, p.ears.id);
    headBack.push(<g key="ears">{pairParts(d, p.ears, partColor('ears', p.ears, skin, d), skin, head.a.earX, head.a.earY, 'm-ear')}</g>);
  }
  if (p.horns) {
    const d = byId(HORNS, p.horns.id);
    headBack.push(<g key="horns">{pairParts(d, p.horns, partColor('horns', p.horns, skin, d), skin, head.a.hornX, d.single ? head.a.top + 8 : head.a.hornY, 'm-horn')}</g>);
  }
  if (p.antennae) {
    const d = byId(ANTENNAE, p.antennae.id);
    headBack.push(<g key="ant">{pairParts(d, p.antennae, partColor('antennae', p.antennae, skin, d), p.antennae.color && isValidHex(p.antennae.color) ? shade(p.antennae.color, -0.3) : '#ffd23f', head.a.hornX + 10, head.a.hornY + 4, 'm-ant')}</g>);
  }
  if (p.spikes) {
    const d = byId(SPIKES, p.spikes.id);
    headBack.unshift(<g key="spk">{pairParts(d, p.spikes, partColor('spikes', p.spikes, skin, d), skin, 0, head.a.top + 10, 'm-spikes')}</g>);
  }

  const accs = m.accessories.map((a, i) => {
    const d = ACCESSORIES.find((x) => x.id === a.id);
    if (!d) return null;
    const t = tone(a.color && isValidHex(a.color) ? a.color : d.defaultColor);
    const x = 200;
    let y = head.a.top + 8;
    if (d.slot === 'eyes') y = head.a.eyeY + eyesSel.dy;
    return { d, node: <g key={a.id + i} transform={`translate(${x + a.dx} ${y + a.dy}) scale(${a.scale})`}>{d.draw(t)}</g> };
  });
  const accHead = accs.filter((a) => a && (a.d.slot === 'top' || a.d.slot === 'eyes')).map((a) => a!.node);
  const neckY = bp(200, body.a.top)[1] + 8;
  const accNeck = m.accessories.map((a, i) => {
    const d = ACCESSORIES.find((x) => x.id === a.id);
    if (!d || d.slot !== 'neck') return null;
    const t = tone(a.color && isValidHex(a.color) ? a.color : d.defaultColor);
    return <g key={'n' + i} transform={`translate(${200 + a.dx} ${neckY + a.dy}) scale(${a.scale})`}>{d.draw(t)}</g>;
  });
  const accBack = m.accessories.map((a, i) => {
    const d = ACCESSORIES.find((x) => x.id === a.id);
    if (!d || d.slot !== 'back') return null;
    const t = tone(a.color && isValidHex(a.color) ? a.color : d.defaultColor);
    return <g key={'b' + i} transform={`translate(${200 + a.dx} ${neckY + a.dy}) scale(${a.scale})`}>{d.draw(t)}</g>;
  });

  // ---- corpo e membros ----
  const [shX, shY] = bp(200 + body.a.shoulderX, body.a.shoulderY);
  const [hipX, hipY] = bp(200 + body.a.hipX, body.a.hipY);
  const [tailX, tailY] = bp(200 + body.a.tailX, body.a.tailY);
  const [, wingY] = bp(200, body.a.wingY);

  const arms = p.arms ? pairParts(byId(ARMS, p.arms.id), p.arms, partColor('arms', p.arms, skin, byId(ARMS, p.arms.id)), skin, shX - 200 - 6, shY, 'm-arm') : null;
  const legDef = p.legs ? byId(LEGS, p.legs.id) : null;
  const legs = p.legs && legDef ? pairParts(legDef, p.legs, partColor('legs', p.legs, skin, legDef), skin, hipX - 200, legDef.single ? bp(200, body.a.bottom)[1] + 4 : hipY, 'm-leg') : null;
  let tail: ReactNode = null;
  if (p.tail) {
    const d = byId(TAILS, p.tail.id);
    const sel = p.tail;
    const c = partColor('tail', sel, skin, d);
    const x = tailX - 10 + sel.dx;
    const y = tailY + sel.dy;
    const art = d.draw(tone(c));
    const inner = <g transform={`translate(${x} ${y}) rotate(${sel.rot}) scale(${sel.scale} ${sel.scale})`}>{art}</g>;
    tail = (
      <g className="m-tail" style={{ transformOrigin: `${sel.flip ? 400 - x : x}px ${y}px` }}>
        {sel.flip ? <g transform="translate(400 0) scale(-1 1)">{inner}</g> : inner}
      </g>
    );
  }
  const wings = p.wings ? pairParts(byId(WINGS, p.wings.id), p.wings, partColor('wings', p.wings, skin, byId(WINGS, p.wings.id)), skin, Math.max(40, shX - 200 - 16), wingY, 'm-wing') : null;

  const hl = (slot: SlotKey) => (highlight === slot ? 'm-hl' : undefined);
  const spd = setting?.speed ?? 1;
  const amp = setting?.size ?? 1;
  const rootClass = ['m-root', still ? 'm-still' : '', dance ? `dm-${dance}` : `an-${anim}`].join(' ');
  const shadowW = Math.max(70, 90 * L.bodyScale);

  const texPattern = texture.pattern ? (
    <pattern id={`${uid}-tex`} width={texture.size ?? 40} height={texture.size ?? 40} patternUnits="userSpaceOnUse">
      {texture.pattern(texColor)}
    </pattern>
  ) : null;
  const texFill = texture.id === 'degrade' ? `url(#${uid}-grad)` : texture.pattern ? `url(#${uid}-tex)` : null;

  return (
    <g className={rootClass} style={{ ['--spd' as string]: spd, ['--amp' as string]: amp } as CSSProperties}>
      <defs>
        {texPattern}
        <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={texColor} stopOpacity={0} />
          <stop offset="1" stopColor={texColor} stopOpacity={0.85} />
        </linearGradient>
        <clipPath id={`${uid}-hclip`}>
          <path d={head.d} />
        </clipPath>
        <clipPath id={`${uid}-bclip`}>
          <path d={body.d} />
        </clipPath>
      </defs>
      <ellipse className="m-shadow" cx={200} cy={L.foot + 2} rx={shadowW} ry={13} fill="#1d1640" opacity={0.18} style={{ transformOrigin: `200px ${L.foot + 2}px` }} />
      <g className="m-jump" style={{ transformOrigin: `200px ${L.foot}px` }}>
        <g className="m-bob" style={{ transformOrigin: `200px ${L.foot}px` }}>
          <g className={hl('wings')}>{wings}</g>
          {accBack}
          <g className={hl('tail')}>{tail}</g>
          <g className={hl('legs')}>{legs}</g>
          <g className={['m-body', hl('body')].filter(Boolean).join(' ')} transform={bodyTransform}>
            <path d={body.d} fill={skin} stroke={INK} strokeWidth={5 / L.bodyScale} strokeLinejoin="round" />
            <g clipPath={`url(#${uid}-bclip)`}>
              {texFill && <path d={body.d} fill={texFill} opacity={0.9} />}
              {m.belly && isValidHex(m.belly) && (
                <ellipse cx={body.a.belly.cx} cy={body.a.belly.cy} rx={body.a.belly.rx} ry={body.a.belly.ry} fill={m.belly} stroke={INK} strokeWidth={3} strokeOpacity={0.35} />
              )}
              <ellipse cx={240} cy={body.a.bottom + 10} rx={130} ry={50} fill={T.d} opacity={0.35} />
              <ellipse cx={160} cy={body.a.top + 30} rx={26} ry={14} fill="#ffffff" opacity={0.35} transform={`rotate(-25 160 ${body.a.top + 30})`} />
            </g>
            <path d={body.d} fill="none" stroke={INK} strokeWidth={5 / L.bodyScale} strokeLinejoin="round" />
          </g>
          <g className={hl('arms')}>{arms}</g>
          {accNeck}
          <g className="m-head" style={{ transformOrigin: `${200 + headSel.dx}px ${hp(200, head.a.bottom)[1]}px` }}>
            <g transform={headTransform}>
              <g className={[hl('ears'), hl('horns'), hl('antennae'), hl('spikes')].filter(Boolean).join(' ') || undefined}>{headBack}</g>
              <g className={hl('head')}>
                <path d={head.d} fill={skin} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                <g clipPath={`url(#${uid}-hclip)`}>
                  {texFill && <path d={head.d} fill={texFill} opacity={0.9} />}
                  <ellipse cx={250} cy={head.a.bottom + 20} rx={150} ry={60} fill={T.d} opacity={0.3} />
                  <ellipse cx={150} cy={head.a.top + 34} rx={30} ry={16} fill="#ffffff" opacity={0.4} transform={`rotate(-30 150 ${head.a.top + 34})`} />
                </g>
                {head.lines && <path d={head.lines} fill="none" stroke={T.d} strokeWidth={4} strokeLinecap="round" />}
                <path d={head.d} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              </g>
              {blush && (
                <g fill="#ff7aa8" opacity={0.55}>
                  <ellipse cx={200 - cheekX} cy={cheekY} rx={16} ry={10} />
                  <ellipse cx={200 + cheekX} cy={cheekY} rx={16} ry={10} />
                </g>
              )}
              <g className={['m-eyes', hl('eyes')].filter(Boolean).join(' ')}>{eyesArt}</g>
              <Brows eyes={eyeSet.eyes} brows={face.brows} ox={eyeOx} oy={eyeOy} s={es} />
              <g className={['m-mouth', hl('mouth')].filter(Boolean).join(' ')} style={{ transformOrigin: `${200 + mouthSel.dx}px ${head.a.mouthY + mouthSel.dy}px` }}>
                <g transform={mouthTransform}>{mouthDef.draw(mouthColor)}</g>
              </g>
              {accHead}
            </g>
          </g>
          <FaceExtraArt extra={face.extra} x={200 + headSel.dx} y={headMidY} w={110 * L.headScale} />
        </g>
      </g>
      <title>{m.name || 'Monstrinho'}</title>
    </g>
  );
}

const MemoGroup = memo(MonsterGroup);

/** Monstrinho num <svg> próprio. */
export function MonsterSvg(props: MonsterProps & { size?: number | string; style?: CSSProperties; viewBox?: string }) {
  const { size = '100%', style, className, title, viewBox, ...rest } = props;
  return (
    <svg
      viewBox={viewBox ?? VB}
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible', ...style }}
      role="img"
      aria-label={title ?? (props.m.name ? `Monstrinho ${props.m.name}` : 'Monstrinho')}
    >
      <MemoGroup {...rest} />
    </svg>
  );
}

/**
 * Monstrinho dentro de outro SVG (cenários). (x, y) = posição dos pés,
 * h = altura desejada em unidades do cenário.
 */
export function MonsterInScene({ x, y, h, flip, ...props }: MonsterProps & { x: number; y: number; h: number; flip?: boolean }) {
  const L = layoutOf(props.m);
  const scale = h / MONSTER_VIEWBOX.h;
  const w = MONSTER_VIEWBOX.w * scale;
  // ponto (200, foot) do monstrinho deve cair em (x, y)
  const left = x - (200 - MONSTER_VIEWBOX.x) * scale;
  const top = y - (L.foot - MONSTER_VIEWBOX.y) * scale;
  return (
    <g transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      <svg x={left} y={top} width={w} height={h} viewBox={VB} overflow="visible">
        <MemoGroup {...props} />
      </svg>
    </g>
  );
}
