import { useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { toast } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { FEARS, HABITS, LIKES, PLACES, type Item } from '../../game/catalog';
import { STAGES } from '../../game/missions';
import { playSound, sfx } from '../../lib/audio';
import type { IdentityState } from '../../game/types';

type Key = 'likes' | 'dislikes' | 'fears' | 'habits' | 'place';
const TABS: { id: Key; name: string; icon: string; list: Item[]; face: string; max: number; sound: string }[] = [
  { id: 'likes', name: 'Gosta de', icon: '💚', list: LIKES, face: 'apaixonado', max: 4, sound: 'risadinha' },
  { id: 'dislikes', name: 'Não gosta', icon: '💔', list: LIKES, face: 'bravo', max: 3, sound: 'rosnado' },
  { id: 'fears', name: 'Medos imaginários', icon: '👻', list: FEARS, face: 'assustado', max: 3, sound: 'apito' },
  { id: 'habits', name: 'Hábitos', icon: '🔁', list: HABITS, face: 'feliz', max: 3, sound: 'magia' },
  { id: 'place', name: 'Lugar favorito', icon: '📍', list: PLACES, face: 'encantado', max: 1, sound: 'brilho' },
];

export default function Likes({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const idn = data.identity;
  const [tab, setTab] = useState<Key>('likes');
  const [flash, setFlash] = useState<string | null>(null);
  const t = TABS.find((x) => x.id === tab)!;
  const values = (k: Key): string[] => (k === 'place' ? (idn.place ? [idn.place] : []) : (idn[k] as string[]));

  const toggle = (item: Item) => {
    const cur = values(tab);
    if (tab === 'place') {
      sfx.select();
      update('identity', (s) => ({ ...s, place: s.place === item.id ? null : item.id }));
    } else if (cur.includes(item.id)) {
      sfx.remove();
      update('identity', (s) => ({ ...s, [tab]: (s[tab] as string[]).filter((x) => x !== item.id) }) as IdentityState);
      return;
    } else {
      if (cur.length >= t.max) { toast(`Até ${t.max} aqui. Toque num para tirar.`, t.icon, 'warn'); return; }
      if (tab === 'likes' && idn.dislikes.includes(item.id)) { toast('Ele não gosta disso! Tire de "Não gosta" primeiro.', '🤔', 'warn'); return; }
      if (tab === 'dislikes' && idn.likes.includes(item.id)) { toast('Ele gosta disso! Tire de "Gosta de" primeiro.', '🤔', 'warn'); return; }
      sfx.select();
      update('identity', (s) => ({ ...s, [tab]: [...(s[tab] as string[]), item.id] }) as IdentityState);
    }
    playSound(t.sound, 0, 0.6);
    setFlash(`${item.icon} ${item.name}`);
  };

  return (
    <ToolShell title="Gostos e medos" icon="🌈" color={STAGES[2].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <LabStage className="min-h-[220px] flex-1">
          <div className="absolute inset-0 p-4">
            <MonsterSvg m={data.monster} anim={tab === 'fears' && flash ? 'susto' : flash ? 'pular' : 'parado'} face={flash ? FACE_PRESETS.find((f) => f.id === t.face)?.face : undefined} size="100%" />
          </div>
          {flash && <div key={flash + tab} className="absolute left-1/2 top-3 -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-lg font-bold shadow-chunky anim-pop">{t.icon} {t.name}: {flash}</div>}
        </LabStage>
        <div className="flex min-h-0 flex-col border-t-4 border-ink bg-cream md:w-[52%] md:border-l-4 md:border-t-0">
          <div className="scroll-x no-scrollbar flex shrink-0 gap-1.5 border-b-4 border-ink bg-white p-2">
            {TABS.map((x) => (
              <button key={x.id} type="button" onClick={() => { sfx.tap(); setTab(x.id); setFlash(null); }} aria-selected={tab === x.id} role="tab" data-testid={`ltab-${x.id}`}
                className={`flex min-w-[92px] shrink-0 flex-col items-center rounded-2xl border-[3px] px-2 py-1 text-xs font-bold ${tab === x.id ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`}>
                <span className="text-2xl">{x.icon}</span>{x.name}
                <span className="text-[10px] text-ink/60">{values(x.id).length}/{x.max}</span>
              </button>
            ))}
          </div>
          <div className="scroll-y min-h-0 flex-1 p-3">
            <div className="grid-fill">
              {t.list.map((it) => (
                <button key={it.id} type="button" className="tile" aria-pressed={values(tab).includes(it.id)} onClick={() => toggle(it)} data-testid={`like-${tab}-${it.id}`}>
                  <span className="text-3xl">{it.icon}</span>
                  <span className="text-xs font-bold">{it.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
