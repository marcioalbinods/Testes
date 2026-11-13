import { useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { toast } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { TRAITS } from '../../game/catalog';
import { STAGES } from '../../game/missions';
import { sfx } from '../../lib/audio';

export default function Traits({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const traits = data.identity.traits;
  const [last, setLast] = useState<string | null>(traits[traits.length - 1] ?? null);
  const t = TRAITS.find((x) => x.id === last);
  const toggle = (id: string) => {
    if (traits.includes(id)) {
      sfx.remove();
      update('identity', (s) => ({ ...s, traits: s.traits.filter((x) => x !== id) }));
      return;
    }
    if (traits.length >= 3) {
      toast('Escolham no máximo 3. Toque num para tirar.', '💖', 'warn');
      return;
    }
    sfx.select();
    setLast(id);
    update('identity', (s) => ({ ...s, traits: [...s.traits, id] }));
  };
  return (
    <ToolShell title="Personalidade" icon="💖" color={STAGES[2].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <LabStage tone="sun" className="min-h-[240px] flex-1">
          <div className="absolute inset-0 p-4">
            <MonsterSvg m={data.monster} anim={t?.anim ?? 'parado'} face={t ? FACE_PRESETS.find((f) => f.id === t.face)?.face : undefined} size="100%" />
          </div>
          {t && <div key={t.id} className="absolute left-1/2 top-3 -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-center text-lg font-bold shadow-chunky anim-pop">{t.icon} {t.name}: {t.desc}</div>}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {traits.map((id) => <span key={id} className="chip bg-sun-light text-lg">{TRAITS.find((x) => x.id === id)?.icon} {TRAITS.find((x) => x.id === id)?.name}</span>)}
          </div>
        </LabStage>
        <div className="scroll-y min-h-0 border-t-4 border-ink bg-cream p-3 md:w-[50%] md:border-l-4 md:border-t-0">
          <h2 className="mb-2 text-xl font-bold">Como é o jeito do {data.monster.name || 'monstrinho'}? (até 3)</h2>
          <div className="grid-fill-lg">
            {TRAITS.map((x) => (
              <button key={x.id} type="button" className="tile !py-3" aria-pressed={traits.includes(x.id)} onClick={() => toggle(x.id)} data-testid={`trait-${x.id}`}>
                <span className="text-4xl">{x.icon}</span>
                <span className="text-lg font-bold">{x.name}</span>
                <span className="text-xs text-ink/70">{x.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
