import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { Btn, Confetti, toast } from '../../components/ui';
import { SceneView } from '../../art/SceneView';
import { MonsterInScene, MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { ObjCatalog, ObjToolbar, useSceneEditing } from '../../components/SceneEditor';
import { STAGES } from '../../game/missions';
import { NPCS } from '../../game/npcs';
import { MUSICS, MusicPlayer, SOUNDS, playSound, sfx } from '../../lib/audio';
import { MOVES } from '../life/DanceLab';
import type { DanceMove, SceneObj } from '../../game/types';

type Tab = 'convidados' | 'decorar' | 'musica' | 'dancas' | 'efeitos';
const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'convidados', name: 'Convidados', icon: '💌' },
  { id: 'decorar', name: 'Decorar', icon: '🎈' },
  { id: 'musica', name: 'Música', icon: '🎵' },
  { id: 'dancas', name: 'Danças', icon: '💃' },
  { id: 'efeitos', name: 'Efeitos', icon: '🔊' },
];
const EFFECTS = ['palmas', 'pop', 'buzina', 'apito', 'tambor', 'magia', 'risada', 'boing'];
const happy = FACE_PRESETS.find((f) => f.id === 'feliz')!.face;
const star = FACE_PRESETS.find((f) => f.id === 'encantado')!.face;

export default function Party({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const pt = data.adventures.party;
  const [tab, setTab] = useState<Tab>('convidados');
  const [show, setShow] = useState(false);
  const [beat, setBeat] = useState(0);
  const player = useRef(new MusicPlayer());
  const preview = useRef(new MusicPlayer());
  const onCommit = useCallback((objs: SceneObj[]) => update('adventures', (a) => ({ ...a, party: { ...a.party, decorations: objs } })), [update]);
  const ed = useSceneEditing(pt.decorations, onCommit, { max: 30 });
  useEffect(() => () => { player.current.stop(); preview.current.stop(); }, []);

  const set = (p: Partial<typeof pt>) => update('adventures', (a) => ({ ...a, party: { ...a.party, ...p } }));
  const toggleGuest = (id: string) => {
    if (pt.guests.includes(id)) { sfx.remove(); set({ guests: pt.guests.filter((g) => g !== id) }); }
    else if (pt.guests.length >= 5) toast('Até 5 convidados!', '💌', 'warn');
    else { sfx.select(); playSound('risadinha', 0.5, 0.5); set({ guests: [...pt.guests, id] }); }
  };

  const guests = pt.guests.map((id) => NPCS.find((n) => n.id === id)).filter(Boolean) as typeof NPCS;
  const ready = guests.length >= 1 && !!pt.music;
  const slots = [500, 330, 670, 180, 820, 90];
  const guestY = (i: number) => 540 - (i % 2) * 30;

  const start = () => {
    if (!ready) return;
    preview.current.stop();
    sfx.whoosh();
    setShow(true);
    setBeat(0);
    player.current.onBeat = (s) => {
      setTimeout(() => setBeat(s), 0);
      if (s % 16 === 8 && pt.effects.length) playSound(pt.effects[(s / 16) % pt.effects.length | 0], 0, 0.7);
      if (s >= 16 * 6) setTimeout(stop, 0);
    };
    player.current.start(pt.music!, 1);
    set({ shows: pt.shows + 1, done: true });
  };
  const stop = () => {
    player.current.stop();
    setShow(false);
    sfx.success();
  };

  const moveOf = (id: string): DanceMove => pt.guestAnims[id] ?? 'balanco';
  const hostMove: DanceMove = data.life.dance.moves.filter(Boolean)[Math.floor(beat / 8) % Math.max(1, data.life.dance.moves.filter(Boolean).length)] ?? 'pulinho';

  const actors = [
    { key: 'host', y: 560, z: 5, node: <MonsterInScene m={data.monster} x={slots[0]} y={560} h={200} anim={show ? 'dancar' : 'parado'} dance={show ? hostMove : null} face={show ? star : happy} /> },
    ...guests.map((g, i) => ({ key: g.id, y: guestY(i + 1), z: 5, node: <MonsterInScene m={g.m} x={slots[i + 1]} y={guestY(i + 1)} h={150} flip={slots[i + 1] > 500} anim={show ? 'dancar' : 'parado'} dance={show ? moveOf(g.id) : null} face={happy} /> })),
  ];

  return (
    <ToolShell title="A festa dos monstrinhos" icon="🎉" color={STAGES[4].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-col lg:w-[62%] lg:shrink-0">
          <div className="relative min-h-[240px] flex-1 bg-night" data-testid="party-scene">
            <SceneView
              ref={ed.svgRef}
              biome={data.habitat.biome ?? 'floresta'}
              sky={show ? 'noite' : 'entardecer'}
              light={show ? 'festa' : 'nenhuma'}
              objects={ed.objs}
              selected={show ? null : ed.selected}
              onObjDown={show ? undefined : ed.onObjDown}
              onBgDown={ed.onBgDown}
              onMove={ed.onMove}
              onUp={ed.onUp}
              actors={actors}
            />
            {show && (
              <>
                <Confetti count={100} />
                <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 title-game text-4xl anim-wiggle" style={{ color: '#ffc93c' }}>FESTA!</div>
                <Btn variant="white" className="absolute bottom-3 right-3" onClick={stop} data-testid="party-stop">⏹ Terminar a festa</Btn>
              </>
            )}
          </div>
          {!show && tab === 'decorar' && <ObjToolbar ed={ed} />}
        </div>
        <div className="flex min-h-0 flex-1 flex-col border-t-4 border-ink bg-cream lg:border-l-4 lg:border-t-0">
          <div className="scroll-x no-scrollbar flex shrink-0 gap-1.5 border-b-4 border-ink bg-white p-2">
            {TABS.map((t, i) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => { sfx.tap(); setTab(t.id); }} data-testid={`ptab-${t.id}`}
                className={`flex min-w-[78px] shrink-0 flex-col items-center rounded-2xl border-[3px] px-2 py-1 text-xs font-bold ${tab === t.id ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`}>
                <span className="text-2xl">{t.icon}</span>{i + 1}. {t.name}
              </button>
            ))}
          </div>
          <div className="scroll-y min-h-0 flex-1 p-3">
            {tab === 'convidados' && (
              <>
                <p className="mb-2 font-bold">Quem vocês vão convidar? (até 5)</p>
                <div className="grid-fill-lg">
                  {NPCS.map((n) => (
                    <button key={n.id} type="button" className="tile" aria-pressed={pt.guests.includes(n.id)} onClick={() => toggleGuest(n.id)} data-testid={`guest-${n.id}`}>
                      <div className="h-20 w-20"><MonsterSvg m={n.m} still size="100%" /></div>
                      <span className="font-bold">{n.name}</span>
                      <span className="text-[11px] text-ink/70">{n.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {tab === 'decorar' && (
              <>
                <p className="mb-2 text-sm font-semibold">Toque ou arraste para enfeitar a festa.</p>
                <ObjCatalog cat={['festa']} ed={ed} />
                <h3 className="mb-1 mt-3 font-bold">Mais enfeites</h3>
                <ObjCatalog cat="enfeites" ed={ed} filter={(id) => ['bandeirinhas', 'lanterna', 'estrela-deco', 'flor', 'banco'].includes(id)} />
              </>
            )}
            {tab === 'musica' && (
              <div className="grid-fill">
                {MUSICS.map((m) => (
                  <button key={m.id} type="button" className="tile" aria-pressed={pt.music === m.id} onClick={() => { sfx.select(); set({ music: m.id }); preview.current.start(m.id); setTimeout(() => preview.current.stop(), 3000); }} data-testid={`pmusic-${m.id}`}>
                    <span className="text-3xl">{m.icon}</span>
                    <span className="text-sm font-bold">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
            {tab === 'dancas' && (
              <div className="space-y-2">
                {guests.length === 0 && <p className="font-bold">Convide alguém primeiro! 💌</p>}
                {guests.map((g) => (
                  <div key={g.id} className="flex items-center gap-2 rounded-2xl border-[3px] border-ink/20 bg-white p-2">
                    <div className="h-14 w-14 shrink-0"><MonsterSvg m={g.m} anim="dancar" dance={moveOf(g.id)} size="100%" /></div>
                    <span className="w-16 font-bold">{g.name}</span>
                    <div className="scroll-x no-scrollbar flex gap-1">
                      {MOVES.map((mv) => (
                        <button key={mv.id} type="button" title={mv.name} aria-label={mv.name} onClick={() => { sfx.tap(); set({ guestAnims: { ...pt.guestAnims, [g.id]: mv.id } }); }}
                          className={`h-11 w-11 shrink-0 rounded-xl border-[3px] text-xl ${moveOf(g.id) === mv.id ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`}>{mv.icon}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-sm font-semibold text-ink/70">O {data.monster.name} dança a coreografia que vocês criaram na etapa 2!</p>
              </div>
            )}
            {tab === 'efeitos' && (
              <>
                <p className="mb-2 font-bold">Efeitos sonoros da festa (até 4)</p>
                <div className="grid-fill-sm">
                  {EFFECTS.map((id) => {
                    const s = SOUNDS.find((x) => x.id === id)!;
                    const on = pt.effects.includes(id);
                    return (
                      <button key={id} type="button" className="tile" aria-pressed={on} onClick={() => { playSound(id); set({ effects: on ? pt.effects.filter((x) => x !== id) : pt.effects.length < 4 ? [...pt.effects, id] : pt.effects }); }} data-testid={`peffect-${id}`}>
                        <span className="text-3xl">{s.icon}</span>
                        <span className="text-xs font-bold">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="shrink-0 border-t-4 border-ink bg-white p-2">
            <Btn variant="sun" big className={`w-full ${ready && !show ? 'shine' : ''}`} disabled={!ready || show} onClick={start} data-testid="party-start">🎉 COMEÇAR A FESTA!</Btn>
            {!ready && <p className="mt-1 text-center text-sm font-semibold text-ink/70">Convide alguém e escolha a música.</p>}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
