import { useEffect, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { Btn, Slider } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS, ANIM_DEFAULT_FACE } from '../../art/faces';
import type { AnimId } from '../../game/types';
import { STAGES } from '../../game/missions';
import { playSound, sfx } from '../../lib/audio';

export const ANIMS: { id: AnimId; name: string; icon: string; sound?: string }[] = [
  { id: 'parado', name: 'Respirando', icon: '😌' },
  { id: 'andar', name: 'Caminhada', icon: '🚶', sound: 'passos' },
  { id: 'correr', name: 'Corrida', icon: '🏃', sound: 'passinhos' },
  { id: 'pular', name: 'Pulo', icon: '🦘', sound: 'boing' },
  { id: 'dancar', name: 'Dança', icon: '💃', sound: 'tambor' },
  { id: 'comemorar', name: 'Comemoração', icon: '🥳', sound: 'palmas' },
  { id: 'dormir', name: 'Sono', icon: '😴', sound: 'brisa' },
  { id: 'susto', name: 'Susto', icon: '😱', sound: 'apito' },
  { id: 'rir', name: 'Risada', icon: '😂', sound: 'risada' },
];

export function faceFor(anim: AnimId) {
  const id = ANIM_DEFAULT_FACE[anim];
  return id ? FACE_PRESETS.find((f) => f.id === id)?.face : undefined;
}

export default function AnimationLab({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const life = data.life;
  const [anim, setAnim] = useState<AnimId>(life.favoriteAnim ?? 'andar');
  const setting = life.settings[anim] ?? { speed: 1, size: 1 };

  useEffect(() => {
    const a = ANIMS.find((x) => x.id === anim);
    if (a?.sound) playSound(a.sound);
  }, [anim]);

  const choose = (id: AnimId) => {
    sfx.select();
    setAnim(id);
    if (!life.tried.includes(id)) update('life', (l) => ({ ...l, tried: [...l.tried, id] }));
  };
  const setSetting = (patch: Partial<{ speed: number; size: number }>) =>
    update('life', (l) => ({ ...l, settings: { ...l.settings, [anim]: { ...(l.settings[anim] ?? { speed: 1, size: 1 }), ...patch } } }));

  return (
    <ToolShell title="Laboratório de animação" icon="🏃" color={STAGES[1].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <LabStage className="min-h-[260px] flex-1 md:flex-[1.2]">
          <div className="absolute inset-0 p-4">
            <MonsterSvg m={data.monster} anim={anim} setting={setting} face={faceFor(anim)} size="100%" />
          </div>
          <div className="absolute left-3 top-3 rounded-full border-[3px] border-ink bg-white px-3 py-1 text-lg font-bold">
            {ANIMS.find((a) => a.id === anim)?.icon} {ANIMS.find((a) => a.id === anim)?.name}
          </div>
          {life.favoriteAnim === anim && <div className="absolute right-3 top-3 rounded-full border-[3px] border-ink bg-sun px-3 py-1 text-lg font-bold">⭐ Favorito</div>}
        </LabStage>
        <div className="scroll-y flex min-h-0 flex-col gap-3 border-t-4 border-ink bg-cream p-3 md:w-[46%] md:border-l-4 md:border-t-0">
          <h2 className="text-xl font-bold">Escolha um movimento</h2>
          <div className="grid grid-cols-3 gap-2">
            {ANIMS.map((a) => (
              <button key={a.id} type="button" className="tile" aria-pressed={anim === a.id} onClick={() => choose(a.id)} data-testid={`anim-${a.id}`}>
                <span className="text-4xl">{a.icon}</span>
                <span className="text-sm font-bold">{a.name}</span>
                {life.favoriteAnim === a.id && <span className="absolute right-1 top-1">⭐</span>}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border-[3px] border-ink/20 bg-white p-3">
            <h3 className="mb-1 font-bold">Personalize o movimento</h3>
            <Slider label="Velocidade" value={setting.speed} min={0.5} max={1.8} onChange={(v) => setSetting({ speed: v })} left="🐢" right="🐇" />
            <Slider label="Tamanho" value={setting.size} min={0.4} max={1.6} onChange={(v) => setSetting({ size: v })} left="🤏" right="🙌" />
            <Btn className="mt-1" onClick={() => setSetting({ speed: 1, size: 1 })}>↺ Normal</Btn>
          </div>
          <Btn variant={life.favoriteAnim === anim ? 'white' : 'sun'} big onClick={() => { sfx.star(); update('life', (l) => ({ ...l, favoriteAnim: anim, tried: l.tried.includes(anim) ? l.tried : [...l.tried, anim] })); }} data-testid="anim-favorite">
            {life.favoriteAnim === anim ? '⭐ Este é o favorito!' : '⭐ Escolher como favorito'}
          </Btn>
          <p className="text-sm font-semibold text-ink/70">Movimentos testados: {life.tried.length} de {ANIMS.length}</p>
        </div>
      </div>
    </ToolShell>
  );
}
