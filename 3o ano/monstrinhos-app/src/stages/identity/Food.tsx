import { useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { Btn } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { FOODS, hashNum } from '../../game/catalog';
import { STAGES } from '../../game/missions';
import { playSound, sfx } from '../../lib/audio';

export default function Food({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const id = data.identity;
  const [current, setCurrent] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'chew' | 'react'>('idle');
  const [drag, setDrag] = useState<{ food: string; x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const reactionOf = (food: string) => id.foodReactions[food] ?? (hashNum(`${data.monster.name}:${food}`) % 10 < 6 ? 'amei' : 'eca');

  const feed = (food: string) => {
    setCurrent(food);
    setPhase('chew');
    playSound('passinhos', 0.6, 0.7);
    setTimeout(() => {
      const r = reactionOf(food);
      setPhase('react');
      if (r === 'amei') { playSound('risadinha', 0.2); sfx.star(); } else playSound('rosnado', 0.4, 0.6);
      update('identity', (s) => ({ ...s, foodsTried: s.foodsTried.includes(food) ? s.foodsTried : [...s.foodsTried, food], foodReactions: { ...s.foodReactions, [food]: r } }));
    }, 1300);
  };

  const onDown = (food: string, e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDrag({ food, x: e.clientX, y: e.clientY });
  };
  const onMove = (e: React.PointerEvent) => drag && setDrag({ ...drag, x: e.clientX, y: e.clientY });
  const onUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const r = stageRef.current?.getBoundingClientRect();
    const inside = r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    const f = drag.food;
    setDrag(null);
    if (inside) feed(f);
  };

  const react = current ? reactionOf(current) : null;
  const face = phase === 'chew' ? FACE_PRESETS.find((f) => f.id === 'bobo')!.face : phase === 'react' ? FACE_PRESETS.find((f) => f.id === (react === 'amei' ? 'apaixonado' : 'tonto'))!.face : undefined;
  const cur = FOODS.find((f) => f.id === current);

  return (
    <ToolShell title="Hora do lanche" icon="🍕" color={STAGES[2].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row" onPointerMove={onMove} onPointerUp={onUp} style={{ touchAction: drag ? 'none' : undefined }}>
        <div ref={stageRef} className="relative min-h-[240px] flex-1" data-testid="food-stage">
          <div className="absolute inset-0"><LabStage tone="sun" className="h-full w-full">
            <div className="absolute inset-0 p-4">
              <MonsterSvg m={data.monster} anim={phase === 'react' ? (react === 'amei' ? 'comemorar' : 'susto') : phase === 'chew' ? 'rir' : 'parado'} face={face} size="100%" />
            </div>
            {cur && phase !== 'idle' && (
              <div key={current + phase} className="absolute left-1/2 top-3 -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-xl font-bold shadow-chunky anim-pop">
                {phase === 'chew' ? `Nhac, nhac... ${cur.icon}` : react === 'amei' ? `Hummm! Amei ${cur.name}! 😋` : `Eca! ${cur.name} não! 🤢`}
              </div>
            )}
            {!current && <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-lg font-bold">Arraste uma comida até aqui! 👇</div>}
          </LabStage></div>
        </div>
        <div className="scroll-y min-h-0 border-t-4 border-ink bg-cream p-3 md:w-[46%] md:border-l-4 md:border-t-0">
          <h2 className="mb-2 text-lg font-bold">Arraste (ou toque) para dar ao monstrinho</h2>
          <div className="grid-fill-sm">
            {FOODS.map((f) => {
              const r = id.foodReactions[f.id];
              return (
                <button key={f.id} type="button" className="tile touch-none" onPointerDown={(e) => onDown(f.id, e)} onClick={() => phase !== 'chew' && feed(f.id)} aria-pressed={id.food === f.id} data-testid={`food-${f.id}`}>
                  <span className="text-4xl">{f.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">{f.name}</span>
                  {r && <span className="absolute right-0.5 top-0.5 text-base">{r === 'amei' ? '😋' : '🤢'}</span>}
                </button>
              );
            })}
          </div>
          {current && phase === 'react' && (
            <Btn variant={id.food === current ? 'white' : 'sun'} big className="mt-3 w-full" onClick={() => { sfx.star(); update('identity', (s) => ({ ...s, food: current })); }} data-testid="food-favorite">
              {id.food === current ? `⭐ ${cur?.name} é a favorita!` : `⭐ ${cur?.name} é a comida favorita!`}
            </Btn>
          )}
          <p className="mt-2 text-sm font-semibold text-ink/70">Provou {id.foodsTried.length} comidas. Favorita: <b>{FOODS.find((f) => f.id === id.food)?.name ?? '—'}</b></p>
        </div>
      </div>
      {drag && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 text-6xl drop-shadow-lg" style={{ left: drag.x, top: drag.y }}>
          {FOODS.find((f) => f.id === drag.food)?.icon}
        </div>
      )}
    </ToolShell>
  );
}
