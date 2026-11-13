import { useMemo, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { Btn } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { POWERS } from '../../game/catalog';
import { STAGES } from '../../game/missions';
import { playSound, sfx } from '../../lib/audio';
import type { AnimId } from '../../game/types';

/** Efeito visual de um superpoder (usado também nas aventuras). */
export function PowerFx({ fx, run }: { fx: string; run: number }) {
  const parts = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ l: (i * 61) % 100, d: (i % 6) * 0.15, s: 0.8 + ((i * 7) % 5) / 6 })), []);
  if (!run) return null;
  const rain = (icons: string[]) => parts.map((p, i) => (
    <span key={`${run}-${i}`} className="absolute top-0 text-3xl" style={{ left: `${p.l}%`, animation: `confetti-fall ${2 + p.s}s linear ${p.d}s forwards`, ['--dx' as string]: '20px', ['--rot' as string]: '180deg' }}>{icons[i % icons.length]}</span>
  ));
  const rise = (icons: string[]) => parts.map((p, i) => (
    <span key={`${run}-${i}`} className="absolute bottom-0 text-3xl" style={{ left: `${p.l}%`, animation: `bubble-up ${3 + p.s}s ease-out ${p.d}s forwards` }}>{icons[i % icons.length]}</span>
  ));
  return (
    <div key={run} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {fx === 'bolhas' && rise(['🫧', '⚪', '🫧'])}
      {fx === 'doces' && rain(['🍬', '🍭', '🍫', '🧁'])}
      {fx === 'gelo' && rain(['❄️', '❄️', '🧊'])}
      {fx === 'fogos' && parts.slice(0, 8).map((p, i) => <span key={`${run}-${i}`} className="absolute text-5xl anim-star" style={{ left: `${p.l}%`, top: `${(i * 23) % 50}%`, animationDelay: `${i * 0.25}s` }}>🎆</span>)}
      {fx === 'plantas' && parts.slice(0, 10).map((p, i) => <span key={`${run}-${i}`} className="absolute bottom-[8%] text-4xl anim-star" style={{ left: `${p.l}%`, animationDelay: `${i * 0.15}s` }}>{['🌻', '🌷', '🌼', '🌱'][i % 4]}</span>)}
      {fx === 'brilhar' && <div className="absolute inset-0 anim-fade" style={{ background: 'radial-gradient(circle at 50% 55%, rgba(255,255,160,0.9), rgba(35,26,82,0.85) 60%)' }} />}
      {fx === 'brilhar' && rise(['✨', '⭐'])}
      {fx === 'voar' && rise(['☁️', '💨'])}
      {fx === 'forca' && <span className="absolute left-1/2 top-[6%] -translate-x-1/2 text-7xl anim-float">🪨</span>}
      {fx === 'cores' && <div className="absolute inset-0 opacity-40 anim-fade" style={{ background: 'linear-gradient(90deg,#ff5c7a,#ffd23f,#5fd068,#3d8bff,#9b6bff)' }} />}
      {fx === 'teleporte' && <span className="absolute left-[15%] top-[30%] text-6xl anim-star">🌀</span>}
    </div>
  );
}

export function powerStyle(fx: string, active: boolean): { anim: AnimId; style: React.CSSProperties } {
  if (!active) return { anim: 'parado', style: {} };
  switch (fx) {
    case 'voar': return { anim: 'parado', style: { animation: 'float-y 1.2s ease-in-out infinite', transform: 'translateY(-14%)' } };
    case 'invisivel': return { anim: 'parado', style: { animation: 'm-twinkle 0.8s ease-in-out infinite', opacity: 0.35 } };
    case 'superpulo': return { anim: 'pular', style: {} };
    case 'teleporte': return { anim: 'parado', style: { transform: 'translateX(25%) scale(0.85)', transition: 'transform 0.2s' } };
    case 'cores': return { anim: 'dancar', style: { animation: 'spin-slow 3s linear infinite', filter: 'hue-rotate(180deg)' } };
    case 'forca': return { anim: 'comemorar', style: {} };
    case 'brilhar': return { anim: 'parado', style: { filter: 'drop-shadow(0 0 24px #fff07a) brightness(1.15)' } };
    default: return { anim: 'comemorar', style: {} };
  }
}

export default function Power({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const id = data.identity;
  const [sel, setSel] = useState<string>(id.power ?? 'voar');
  const [run, setRun] = useState(0);
  const [active, setActive] = useState(false);
  const p = POWERS.find((x) => x.id === sel)!;
  const test = (pid: string) => {
    setSel(pid);
    const pw = POWERS.find((x) => x.id === pid)!;
    playSound(pw.sound);
    setRun((r) => r + 1);
    setActive(true);
    setTimeout(() => setActive(false), 3200);
    if (!id.powersTried.includes(pid)) update('identity', (s) => ({ ...s, powersTried: [...s.powersTried, pid] }));
  };
  const ps = powerStyle(p.fx, active);
  return (
    <ToolShell title="Superpoder" icon="⚡" color={STAGES[2].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <LabStage tone={p.fx === 'brilhar' && active ? 'night' : 'lab'} className="min-h-[240px] flex-1">
          <div className="absolute inset-0 p-4" style={ps.style}>
            <MonsterSvg m={data.monster} anim={ps.anim} face={active ? FACE_PRESETS.find((f) => f.id === 'encantado')!.face : undefined} size="100%" />
          </div>
          <PowerFx fx={p.fx} run={active ? run : 0} />
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-lg font-bold shadow-chunky">{p.icon} {p.name}: {p.desc}</div>
        </LabStage>
        <div className="scroll-y min-h-0 border-t-4 border-ink bg-cream p-3 md:w-[46%] md:border-l-4 md:border-t-0">
          <h2 className="mb-2 text-lg font-bold">Toque para testar um poder</h2>
          <div className="grid-fill">
            {POWERS.map((x) => (
              <button key={x.id} type="button" className="tile" aria-pressed={sel === x.id} onClick={() => test(x.id)} data-testid={`power-${x.id}`}>
                <span className="text-3xl">{x.icon}</span>
                <span className="text-xs font-bold">{x.name}</span>
                {id.power === x.id && <span className="absolute right-1 top-1">⭐</span>}
                {id.powersTried.includes(x.id) && id.power !== x.id && <span className="absolute right-1 top-1 text-xs">✔</span>}
              </button>
            ))}
          </div>
          <Btn variant={id.power === sel ? 'white' : 'sun'} big className="mt-3 w-full" onClick={() => { sfx.star(); update('identity', (s) => ({ ...s, power: sel, powersTried: s.powersTried.includes(sel) ? s.powersTried : [...s.powersTried, sel] })); }} data-testid="power-choose">
            {id.power === sel ? `⭐ ${p.name} é o superpoder!` : `⚡ Escolher ${p.name}`}
          </Btn>
        </div>
      </div>
    </ToolShell>
  );
}
