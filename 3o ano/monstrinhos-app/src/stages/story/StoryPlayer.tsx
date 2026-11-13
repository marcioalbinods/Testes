import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GameData, Story } from '../../game/types';
import { FrameView } from './storyArt';
import { Btn, IconBtn } from '../../components/ui';
import { playSound, sfx, stopSpeech } from '../../lib/audio';
import { playRecording } from '../../lib/recorder';
import { MonsterSvg } from '../../art/Monster';

const TRANS: Record<string, string> = {
  aparecer: 'anim-fade',
  deslizar: 'story-slide',
  zoom: 'story-zoom',
  virar: 'story-flip',
};

/** Reproduz a história em tela cheia: quadros, transições, falas e sons. */
export default function StoryPlayer({ story, g, credits, onClose }: { story: Story; g: GameData; credits: string; onClose: () => void }) {
  const [i, setI] = useState(-1); // -1 = capa
  const [typing, setTyping] = useState(0);
  const [paused, setPaused] = useState(false);
  const [end, setEnd] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);
  const frames = story.frames;

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    if (typer.current) clearInterval(typer.current);
  };
  useEffect(() => () => { clear(); stopSpeech(); }, []);

  useEffect(() => {
    clear();
    if (paused) return;
    if (i === -1) {
      sfx.unlock();
      timer.current = setTimeout(() => setI(0), 2400);
      return;
    }
    if (end) return;
    const f = frames[i];
    if (!f) {
      setEnd(true);
      sfx.success();
      return;
    }
    setTyping(0);
    if (f.sound) playSound(f.sound);
    let extra = 0;
    const rec = f.narration ? g.sounds.recordings.find((r) => r.id === f.narration) : null;
    if (rec) {
      extra = rec.duration;
      void playRecording(rec);
    }
    const total = f.balloons.reduce((a, b) => a + b.text.length, 0);
    typer.current = setInterval(() => setTyping((t) => (t >= total ? t : t + 1)), 45);
    const ms = Math.max(f.duration * 1000, total * 45 + 1500, extra * 1000 + 600);
    timer.current = setTimeout(() => setI((n) => n + 1), ms);
  }, [i, paused, end]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (d: number) => {
    clear();
    setEnd(false);
    setI((n) => Math.max(0, Math.min(frames.length, n + d)));
  };
  const restart = () => {
    clear();
    setEnd(false);
    setPaused(false);
    setI(-1);
  };

  const f = i >= 0 && i < frames.length ? frames[i] : null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-black" data-testid="story-player">
      <style>{`
        @keyframes story-slide { from { transform: translateX(60%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes story-zoom { from { transform: scale(1.6); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes story-flip { from { transform: perspective(900px) rotateY(80deg); opacity: 0; } to { transform: none; opacity: 1; } }
        .story-slide { animation: story-slide 0.6s ease-out both; }
        .story-zoom { animation: story-zoom 0.7s ease-out both; }
        .story-flip { animation: story-flip 0.7s ease-out both; transform-origin: left center; }
      `}</style>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {i === -1 && (
          <div className="flex flex-col items-center text-center anim-pop">
            <div className="h-56 w-56"><MonsterSvg m={g.monster} anim="comemorar" size="100%" /></div>
            <h1 className="title-game mt-2 text-5xl" style={{ color: '#ffc93c' }}>{story.title || 'Minha história'}</h1>
            <p className="mt-2 text-xl font-bold text-white">Uma história de {credits}</p>
          </div>
        )}
        {f && (
          <div key={i} className={`h-full w-full ${TRANS[f.transition] ?? 'anim-fade'}`}>
            <FrameView frame={f} g={g} typing={typing} />
          </div>
        )}
        {end && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-night/85 p-4 text-center anim-fade">
            <h2 className="title-game text-6xl" style={{ color: '#ffc93c' }}>FIM!</h2>
            <p className="mt-2 text-2xl font-bold text-white">{story.title || 'Minha história'}</p>
            <p className="text-lg font-semibold text-white/80">Criado por {credits} · Estrela: {g.monster.name}</p>
            <div className="mt-5 flex gap-3">
              <Btn variant="sun" big onClick={restart}>🔁 Ver de novo</Btn>
              <Btn variant="white" big onClick={onClose} data-testid="player-close-end">✔ Fechar</Btn>
            </div>
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-center gap-2 bg-night p-2">
        <IconBtn label="Quadro anterior" icon="⏮️" onClick={() => go(-1)} disabled={i <= 0} />
        <IconBtn label={paused ? 'Continuar' : 'Pausar'} icon={paused ? '▶️' : '⏸️'} onClick={() => setPaused((p) => !p)} />
        <IconBtn label="Próximo quadro" icon="⏭️" onClick={() => go(1)} disabled={end} />
        <div className="mx-2 flex gap-1">
          {frames.map((_, k) => <span key={k} className={`h-3 w-6 rounded-full ${k === i ? 'bg-sun' : k < i ? 'bg-white/70' : 'bg-white/25'}`} />)}
        </div>
        <IconBtn label="Fechar" icon="✖" onClick={onClose} data-testid="player-close" />
      </div>
    </div>,
    document.body,
  );
}
