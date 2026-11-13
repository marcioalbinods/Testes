import { useState } from 'react';
import { useGame } from '../components/game';
import { Btn } from '../components/ui';
import { MonsterSvg } from '../art/Monster';
import { SceneView } from '../art/SceneView';
import { PassportCard } from '../stages/identity/Passport';
import { FrameView } from '../stages/story/storyArt';
import StoryPlayer from '../stages/story/StoryPlayer';
import { TREASURES } from '../stages/adventures/Forest';
import { NPCS } from '../game/npcs';
import { STICKERS, itemName } from '../game/catalog';
import { playSignature } from '../lib/signature';
import type { GameData, Story } from '../game/types';

/** Exposição privada da dupla (só a dupla e o professor veem). */
export function ExhibitionContent({ g, names, onPlay }: { g: GameData; names: string; onPlay: (s: Story) => void }) {
  const adv = g.adventures;
  return (
    <div className="space-y-4">
      <section className="panel flex flex-col items-center gap-4 p-4 sm:flex-row">
        <div className="h-56 w-56 shrink-0"><MonsterSvg m={g.monster} anim={g.life.favoriteAnim ?? 'parado'} size="100%" /></div>
        <div>
          <h2 className="text-3xl font-bold">{g.monster.name || 'Monstrinho sem nome'}</h2>
          <p className="font-semibold">Criado por {names}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Btn onClick={() => playSignature(g)} icon="🔊">Ouvir o som dele</Btn>
          </div>
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-2xl font-bold">🪪 Passaporte</h2>
        <PassportCard g={g} names={names} />
      </section>
      {g.habitat.biome && (
        <section className="panel overflow-hidden p-0">
          <h2 className="p-3 text-2xl font-bold">🏝️ Habitat</h2>
          <div className="aspect-[5/3] w-full bg-night">
            <SceneView biome={g.habitat.biome} sky={g.habitat.sky} weather={g.habitat.weather} light={g.habitat.light} objects={g.habitat.objects} />
          </div>
        </section>
      )}
      <section className="panel p-4">
        <h2 className="mb-2 text-2xl font-bold">🗺️ Memórias das aventuras</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-cream p-3"><b>🔎 Floresta:</b> {adv.forest.found.length}/6 tesouros {TREASURES.filter((t) => adv.forest.found.includes(t.id)).map((t) => t.icon).join(' ')}</div>
          <div className="rounded-2xl bg-cream p-3"><b>🤝 Amigo perdido:</b> {adv.friend.done ? `ajudou o Pipoca (${adv.friend.solutionsTried.length} jeito(s))` : 'ainda não'} {adv.friend.card && <span className="block italic">“{adv.friend.card.text}” {itemName(STICKERS, adv.friend.card.sticker)?.icon}</span>}</div>
          <div className="rounded-2xl bg-cream p-3"><b>🌉 Ponte:</b> {adv.bridge.solutions.length} solução(ões) descoberta(s)</div>
          <div className="rounded-2xl bg-cream p-3"><b>⛈️ Tempestade:</b> {adv.storm.survived ? 'monstrinho protegido! ☂️' : 'ainda não'}</div>
          <div className="rounded-2xl bg-cream p-3 sm:col-span-2"><b>🎉 Festa:</b> {adv.party.done ? `convidados: ${adv.party.guests.map((id) => NPCS.find((n) => n.id === id)?.name).join(', ')}` : 'ainda não'}</div>
        </div>
      </section>
      <section className="panel p-4">
        <h2 className="mb-2 text-2xl font-bold">🎬 Histórias</h2>
        {g.stories.stories.length === 0 && <p className="font-semibold">Ainda não há histórias.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {g.stories.stories.map((s, i) => (
            <div key={s.id} className="overflow-hidden rounded-2xl border-[3px] border-ink bg-white">
              <div className="aspect-[5/3] w-full">{s.frames[0] && <FrameView frame={s.frames[0]} g={g} still />}</div>
              <div className="flex items-center gap-2 p-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{s.title || `História ${i + 1}`}</div>
                  <div className="text-sm">{s.frames.length} quadros · {s.published ? '✔ publicada' : 'rascunho'}</div>
                </div>
                <Btn variant="sun" onClick={() => onPlay(s)} data-testid={`play-story-${i}`}>▶ Assistir</Btn>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Exhibition() {
  const { data, go, store } = useGame();
  const [play, setPlay] = useState<Story | null>(null);
  const names = `${store.info.student1} e ${store.info.student2}`;
  return (
    <div className="scroll-y h-full bg-[radial-gradient(circle_at_50%_0%,#e3fbff,#7eeaf6_60%,#32b8e5)] p-3 sm:p-5" data-testid="exhibition">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h1 className="title-game text-4xl sm:text-5xl">🖼️ EXPOSIÇÃO</h1>
            <p className="font-bold">Exposição privada de {names}. 🔒 Só a dupla e o professor podem ver.</p>
          </div>
          <Btn onClick={() => go({ name: 'map' })}>🗺️ Mapa</Btn>
        </div>
        <ExhibitionContent g={data} names={names} onPlay={setPlay} />
      </div>
      {play && <StoryPlayer story={play} g={data} credits={names} onClose={() => setPlay(null)} />}
    </div>
  );
}
