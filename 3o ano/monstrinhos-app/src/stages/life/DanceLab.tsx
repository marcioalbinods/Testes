import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { Btn, IconBtn, toast } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import type { DanceMove } from '../../game/types';
import { STAGES } from '../../game/missions';
import { MUSICS, MusicPlayer, sfx } from '../../lib/audio';
import { FACE_PRESETS } from '../../art/faces';

export const MOVES: { id: DanceMove; name: string; icon: string }[] = [
  { id: 'balanco', name: 'Balanço', icon: '〰️' },
  { id: 'pulinho', name: 'Pulinho', icon: '⬆️' },
  { id: 'giro', name: 'Giro', icon: '🔄' },
  { id: 'bracos', name: 'Braços pra cima', icon: '🙌' },
  { id: 'remexe', name: 'Remexe', icon: '🌀' },
  { id: 'agachadinho', name: 'Agachadinho', icon: '⬇️' },
  { id: 'estrela', name: 'Estrela', icon: '⭐' },
  { id: 'cabeca', name: 'Cabeça', icon: '🤘' },
];
const TEMPOS = [
  { v: 0.8, name: 'Devagar', icon: '🐢' },
  { v: 1, name: 'Normal', icon: '🚶' },
  { v: 1.25, name: 'Rápido', icon: '🐇' },
];

export default function DanceLab({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const dance = data.life.dance;
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(-1);
  const player = useRef(new MusicPlayer());

  useEffect(() => () => player.current.stop(), []);

  const setMoves = (moves: (DanceMove | null)[]) => update('life', (l) => ({ ...l, dance: { ...l.dance, moves } }));
  const addMove = (mv: DanceMove) => {
    const idx = dance.moves.findIndex((x) => !x);
    if (idx < 0) {
      toast('A coreografia está cheia! Toque num passo para tirar.', '💃', 'warn');
      return;
    }
    sfx.place();
    const next = [...dance.moves];
    next[idx] = mv;
    setMoves(next);
  };

  const play = () => {
    if (playing) {
      player.current.stop();
      setPlaying(false);
      setBeat(-1);
      return;
    }
    const used = dance.moves.filter(Boolean);
    if (!used.length) {
      toast('Coloque passos na coreografia primeiro!', '👇', 'warn');
      return;
    }
    setPlaying(true);
    update('life', (l) => ({ ...l, dance: { ...l.dance, played: l.dance.played + 1 } }));
    // cada passo dura 4 colcheias (2 batidas); a coreografia toca 2 vezes
    const total = 8 * 4 * 2;
    player.current.onBeat = (s) => {
      const slot = Math.floor(s / 4) % 8;
      setTimeout(() => setBeat(slot), 0);
      if (s >= total) {
        setTimeout(() => {
          player.current.stop();
          setPlaying(false);
          setBeat(-1);
          sfx.star();
        }, 0);
      }
    };
    player.current.start(dance.music, dance.tempo);
  };

  // passo atual: pula os espaços vazios
  const current = beat >= 0 ? dance.moves[beat] ?? dance.moves.find(Boolean) ?? null : null;
  const happy = FACE_PRESETS.find((f) => f.id === 'feliz')!.face;

  return (
    <ToolShell title="Pista de dança" icon="💃" color={STAGES[1].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <LabStage tone={playing ? 'disco' : 'lab'} className="min-h-[240px] flex-1">
          <div className="absolute inset-0 p-4">
            <MonsterSvg m={data.monster} anim={playing ? 'dancar' : 'parado'} dance={playing ? current : null} face={playing ? happy : undefined} setting={{ speed: dance.tempo, size: 1 }} size="100%" />
          </div>
          {playing && current && (
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border-[3px] border-ink bg-sun px-4 py-1 text-xl font-bold anim-pop" key={beat}>
              {MOVES.find((m) => m.id === current)?.icon} {MOVES.find((m) => m.id === current)?.name}
            </div>
          )}
        </LabStage>
        <div className="scroll-y flex min-h-0 flex-col gap-3 border-t-4 border-ink bg-cream p-3 md:w-[48%] md:border-l-4 md:border-t-0">
          <section>
            <h2 className="mb-1 text-lg font-bold">1. Toque nos passos para montar a coreografia</h2>
            <div className="grid grid-cols-4 gap-2">
              {MOVES.map((m) => (
                <button key={m.id} type="button" className="tile" onClick={() => addMove(m.id)} data-testid={`move-${m.id}`} disabled={playing}>
                  <span className="text-3xl">{m.icon}</span>
                  <span className="text-xs font-bold">{m.name}</span>
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-bold">2. Sua coreografia ({dance.moves.filter(Boolean).length}/8)</h2>
              <IconBtn label="Limpar tudo" icon="🗑️" onClick={() => { sfx.remove(); setMoves(Array(8).fill(null)); }} disabled={playing} className="!min-h-[44px] !w-11 !min-w-[44px]" />
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {dance.moves.map((mv, i) => {
                const d = MOVES.find((m) => m.id === mv);
                return (
                  <button key={i} type="button" disabled={playing} onClick={() => { if (!mv) return; sfx.remove(); const n = [...dance.moves]; n[i] = null; setMoves(n); }}
                    className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-[3px] ${beat === i ? 'border-ink bg-sun scale-110' : mv ? 'border-ink bg-white' : 'border-dashed border-ink/30 bg-white/60'} transition-transform`}
                    aria-label={d ? `Passo ${i + 1}: ${d.name} (toque para tirar)` : `Passo ${i + 1} vazio`} data-testid={`slot-${i}`}>
                    <span className="text-2xl">{d?.icon ?? i + 1}</span>
                    {d && <span className="text-[10px] font-bold leading-none">{d.name}</span>}
                  </button>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className="mb-1 text-lg font-bold">3. Música e ritmo</h2>
            <div className="grid grid-cols-3 gap-2">
              {MUSICS.map((mu) => (
                <button key={mu.id} type="button" className="tile" aria-pressed={dance.music === mu.id} disabled={playing} onClick={() => { sfx.select(); update('life', (l) => ({ ...l, dance: { ...l.dance, music: mu.id } })); }}>
                  <span className="text-2xl">{mu.icon}</span>
                  <span className="text-xs font-bold">{mu.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TEMPOS.map((t) => (
                <button key={t.v} type="button" className="tile" aria-pressed={dance.tempo === t.v} disabled={playing} onClick={() => { sfx.select(); update('life', (l) => ({ ...l, dance: { ...l.dance, tempo: t.v } })); }}>
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-bold">{t.name}</span>
                </button>
              ))}
            </div>
          </section>
          <Btn variant={playing ? 'bubble' : 'lime'} big onClick={play} data-testid="dance-play">{playing ? '⏹ Parar' : '💃 DANÇAR!'}</Btn>
        </div>
      </div>
    </ToolShell>
  );
}
