import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { Btn, IconBtn, Slider, toast } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import type { AnimId, SoundClip, SoundTrack } from '../../game/types';
import { STAGES } from '../../game/missions';
import { SOUNDS, SOUND_CATS, audio, playSound, sfx, soundById } from '../../lib/audio';
import { playRecording } from '../../lib/recorder';
import { emptyTrack } from '../../game/defaults';

const LANE_COLORS = ['#ff8fc7', '#7eeaf6', '#b8ec5a'];

export function clipInfo(id: string, recNames: Record<string, string>) {
  if (id.startsWith('rec:')) return { icon: '🎙️', name: recNames[id.slice(4)] ?? 'Minha voz' };
  const s = soundById(id);
  return s ? { icon: s.icon, name: s.name } : { icon: '❔', name: id };
}

/** Toca a linha do tempo e avisa cada passo. Devolve uma função para parar. */
export function playTrack(track: SoundTrack, getRec: (id: string) => import('../../game/types').Recording | undefined, onStep?: (i: number) => void, onEnd?: () => void, master = 1) {
  const c = audio();
  if (!c) return () => {};
  const stepMs = 60000 / track.tempo / 2;
  const timers: ReturnType<typeof setTimeout>[] = [];
  for (let i = 0; i < 8; i++) {
    timers.push(setTimeout(() => {
      onStep?.(i);
      track.lanes.forEach((lane, li) => {
        const clip = lane[i];
        if (!clip) return;
        const vol = (track.volumes[li] ?? 0.9) * master;
        if (clip.sound.startsWith('rec:')) {
          const r = getRec(clip.sound.slice(4));
          if (r) void playRecording(r, clip.pitch, vol);
        } else playSound(clip.sound, clip.pitch, vol);
      });
    }, i * stepMs));
  }
  timers.push(setTimeout(() => onEnd?.(), 8 * stepMs + 900));
  return () => timers.forEach(clearTimeout);
}

export default function SoundLab({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const snd = data.sounds;
  const [cat, setCat] = useState<string>('risadas');
  const [brush, setBrush] = useState<SoundClip>({ sound: 'risada', pitch: 0 });
  const [step, setStep] = useState(-1);
  const [react, setReact] = useState<AnimId>('parado');
  const stopRef = useRef<() => void>(() => {});
  const recNames = Object.fromEntries(snd.recordings.map((r) => [r.id, r.label]));
  const getRec = (id: string) => snd.recordings.find((r) => r.id === id);

  useEffect(() => () => stopRef.current(), []);

  const preview = (clip: SoundClip) => {
    if (clip.sound.startsWith('rec:')) {
      const r = getRec(clip.sound.slice(4));
      if (r) void playRecording(r, clip.pitch);
    } else playSound(clip.sound, clip.pitch);
    const s = soundById(clip.sound);
    setReact(s?.cat === 'risadas' ? 'rir' : s?.cat === 'rugidos' ? 'susto' : s?.cat === 'saltos' ? 'pular' : s?.cat === 'passos' ? 'andar' : 'dancar');
    setTimeout(() => setReact('parado'), 1300);
  };

  const pick = (id: string) => {
    const clip = { sound: id, pitch: brush.pitch };
    setBrush(clip);
    preview(clip);
    if (!snd.triedSounds.includes(id)) update('sounds', (s) => ({ ...s, triedSounds: [...s.triedSounds, id] }));
  };

  const setTrack = (fn: (t: SoundTrack) => SoundTrack) => update('sounds', (s) => ({ ...s, track: fn(s.track) }));

  const toggleCell = (lane: number, i: number) => {
    const cur = snd.track.lanes[lane][i];
    setTrack((t) => {
      const lanes = t.lanes.map((l) => [...l]);
      lanes[lane][i] = cur && cur.sound === brush.sound && cur.pitch === brush.pitch ? null : { ...brush };
      return { ...t, lanes };
    });
    if (!(cur && cur.sound === brush.sound && cur.pitch === brush.pitch)) {
      sfx.place();
    } else sfx.remove();
  };

  const play = () => {
    stopRef.current();
    if (!snd.track.lanes.flat().some(Boolean)) {
      toast('Toque nos quadradinhos para colocar sons!', '👇', 'warn');
      return;
    }
    update('sounds', (s) => ({ ...s, trackPlays: s.trackPlays + 1 }));
    setReact('dancar');
    stopRef.current = playTrack(snd.track, getRec, setStep, () => { setStep(-1); setReact('parado'); }, snd.masterVolume);
  };

  const sounds = cat === 'voz' ? snd.recordings.map((r) => ({ id: `rec:${r.id}`, name: r.label, icon: '🎙️' })) : SOUNDS.filter((s) => s.cat === cat);
  const sig = snd.signature;
  const sigText = !sig ? 'nenhum ainda' : sig.kind === 'track' ? 'a música da linha do tempo' : sig.kind === 'sound' ? clipInfo(sig.id, recNames).name : `gravação: ${recNames[sig.id] ?? 'voz'}`;

  return (
    <ToolShell title="Laboratório de sons" icon="🔊" color={STAGES[1].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-col border-b-4 border-ink bg-cream lg:w-[44%] lg:shrink-0 lg:border-b-0 lg:border-r-4">
          <div className="scroll-x no-scrollbar flex shrink-0 gap-1.5 border-b-4 border-ink bg-white p-2">
            {[...SOUND_CATS, ...(snd.recordings.length ? [{ id: 'voz' as const, name: 'Minha voz', icon: '🎙️' }] : [])].map((c) => (
              <button key={c.id} type="button" onClick={() => { sfx.tap(); setCat(c.id); }} aria-selected={cat === c.id} role="tab" data-testid={`cat-${c.id}`}
                className={`flex min-w-[70px] shrink-0 flex-col items-center rounded-2xl border-[3px] px-2 py-1 text-xs font-bold ${cat === c.id ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`}>
                <span className="text-2xl">{c.icon}</span>{c.name}
              </button>
            ))}
          </div>
          <div className="scroll-y min-h-0 flex-1 p-2">
            <p className="mb-2 font-semibold">Toque para ouvir. O som escolhido vai para a linha do tempo.</p>
            <div className="grid-fill">
              {sounds.map((s) => (
                <button key={s.id} type="button" className="tile" aria-pressed={brush.sound === s.id} onClick={() => pick(s.id)} data-testid={`sound-${s.id}`}>
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs font-bold">{s.name}</span>
                  {snd.favorites.includes(s.id) && <span className="absolute right-1 top-1 text-sm">❤️</span>}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border-[3px] border-ink/20 bg-white p-3">
              <div className="mb-1 flex items-center gap-2 font-bold">
                <span className="text-2xl">{clipInfo(brush.sound, recNames).icon}</span> {clipInfo(brush.sound, recNames).name}
              </div>
              <Slider label="Voz" value={brush.pitch} min={-1} max={1} step={0.1} onChange={(v) => setBrush((b) => ({ ...b, pitch: v }))} left="🐻 grossa" right="🐭 fina" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Btn onClick={() => preview(brush)} icon="▶">Ouvir</Btn>
                <Btn onClick={() => update('sounds', (s) => ({ ...s, favorites: s.favorites.includes(brush.sound) ? s.favorites.filter((x) => x !== brush.sound) : [...s.favorites, brush.sound] }))} icon={snd.favorites.includes(brush.sound) ? '💔' : '❤️'}>
                  {snd.favorites.includes(brush.sound) ? 'Tirar' : 'Favorito'}
                </Btn>
                <Btn variant="sun" onClick={() => { sfx.star(); update('sounds', (s) => ({ ...s, signature: brush.sound.startsWith('rec:') ? { kind: 'recording', id: brush.sound.slice(4) } : { kind: 'sound', id: brush.sound, pitch: brush.pitch } })); toast('Este é o som do monstrinho!', '🔊', 'ok'); }} data-testid="set-signature">🏷️ Som do monstrinho</Btn>
              </div>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col lab-bg">
          <div className="flex min-h-[150px] flex-1 items-center justify-center p-2">
            <div className="h-full max-h-[300px] w-full max-w-[300px]"><MonsterSvg m={data.monster} anim={react} size="100%" /></div>
          </div>
          <div className="shrink-0 border-t-4 border-ink bg-white p-2 sm:p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="mr-auto text-lg font-bold">🎼 Linha do tempo</h2>
              <Btn variant="lime" onClick={play} data-testid="track-play">▶ Tocar</Btn>
              <IconBtn label="Limpar" icon="🗑️" onClick={() => { stopRef.current(); sfx.remove(); setTrack(() => ({ ...emptyTrack(), tempo: snd.track.tempo, volumes: snd.track.volumes })); }} />
              <Btn onClick={() => { sfx.star(); update('sounds', (s) => ({ ...s, signature: { kind: 'track' } })); toast('A música virou o som do monstrinho!', '🎼', 'ok'); }}>🏷️ Usar como som dele</Btn>
            </div>
            <div className="space-y-1.5" data-testid="timeline">
              {snd.track.lanes.map((lane, li) => (
                <div key={li} className="flex items-center gap-1.5">
                  <div className="flex w-20 shrink-0 flex-col items-center sm:w-28">
                    <span className="text-xs font-bold">Linha {li + 1}</span>
                    <input type="range" min={0} max={1} step={0.05} value={snd.track.volumes[li]} aria-label={`Volume da linha ${li + 1}`} className="w-full accent-grape"
                      onChange={(e) => setTrack((t) => ({ ...t, volumes: t.volumes.map((v, j) => (j === li ? Number(e.target.value) : v)) }))} />
                  </div>
                  <div className="grid flex-1 grid-cols-8 gap-1">
                    {lane.map((clip, i) => (
                      <button key={i} type="button" onClick={() => toggleCell(li, i)} data-testid={`cell-${li}-${i}`}
                        className={`flex aspect-square items-center justify-center rounded-xl border-[3px] text-xl transition-transform ${step === i ? 'scale-110 border-ink' : clip ? 'border-ink' : 'border-ink/15'} ${i % 2 ? '' : ''}`}
                        style={{ background: clip ? LANE_COLORS[li] : step === i ? '#fff07a' : i % 4 === 0 ? '#f4efff' : '#fff' }}
                        aria-label={clip ? `${clipInfo(clip.sound, recNames).name} na batida ${i + 1}` : `Batida ${i + 1} vazia`}>
                        {clip ? clipInfo(clip.sound, recNames).icon : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Slider label="Ritmo" value={snd.track.tempo} min={70} max={160} step={5} onChange={(v) => setTrack((t) => ({ ...t, tempo: v }))} left="🐢" right="🐇" />
            </div>
            <p className="mt-1 text-sm font-semibold text-ink/70">Som do monstrinho: <b>{sigText}</b></p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
