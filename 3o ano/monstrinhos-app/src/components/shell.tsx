import { useEffect, useState, type ReactNode } from 'react';
import { useGame } from './game';
import { Btn, Confetti, IconBtn, SpeakBtn, Stars, useAutoSpeak } from './ui';
import { MonsterSvg } from '../art/Monster';
import { ZUZU } from '../game/npcs';
import { missionById, STAGES, MISSIONS } from '../game/missions';
import { isDone, isUnlocked } from '../game/progress';
import type { SaveStatus } from '../lib/sync';
import { sfx } from '../lib/audio';

const STATUS: Record<SaveStatus, { text: string; icon: string; cls: string }> = {
  saved: { text: 'Tudo salvo!', icon: '☁️', cls: 'bg-lime' },
  saving: { text: 'Salvando...', icon: '⏳', cls: 'bg-sun-light' },
  pending: { text: 'Salvando...', icon: '⏳', cls: 'bg-sun-light' },
  offline: { text: 'Sem conexão', icon: '📴', cls: 'bg-[#ffd0d0]' },
  reconnecting: { text: 'Reconectando...', icon: '🔄', cls: 'bg-aqua' },
  error: { text: 'Erro ao salvar', icon: '⚠️', cls: 'bg-[#ff9b9b]' },
};

export function SaveIndicator({ compact }: { compact?: boolean }) {
  const { status, store } = useGame();
  const s = STATUS[status];
  const [why, setWhy] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setWhy((v) => !v); if (status === 'error' || status === 'offline') void store.flush(); }}
        data-testid="save-status"
        data-status={status}
        className={`flex h-11 items-center gap-1.5 rounded-full border-[3px] border-ink px-3 text-sm font-bold ${s.cls}`}
        aria-live="polite"
      >
        <span className={status === 'reconnecting' || status === 'saving' || status === 'pending' ? 'anim-spin-slow inline-block' : ''}>{s.icon}</span>
        {!compact && <span className="whitespace-nowrap">{s.text}</span>}
      </button>
      {why && (
        <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border-[3px] border-ink bg-white p-3 text-sm shadow-chunky anim-pop">
          {status === 'saved' && 'Tudo o que vocês criaram está guardado na nuvem.'}
          {(status === 'saving' || status === 'pending') && 'Guardando as últimas mudanças na nuvem...'}
          {status === 'offline' && 'A internet caiu. Pode continuar! Tudo fica guardado neste aparelho e vai para a nuvem quando a internet voltar.'}
          {status === 'reconnecting' && 'Tentando falar com a nuvem de novo...'}
          {status === 'error' && 'Não deu para salvar agora. Seu trabalho continua guardado neste aparelho. Chame o professor se a mensagem não sumir.'}
        </div>
      )}
    </div>
  );
}

/** O guia Zuzu com balão de fala. */
export function Zuzu({ text, size = 96, anim = 'parado', className = '' }: { text?: ReactNode; size?: number; anim?: 'parado' | 'pular' | 'comemorar' | 'dancar'; className?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <div className="shrink-0" style={{ width: size, height: size }}>
        <MonsterSvg m={ZUZU} anim={anim} size={size} title="Zuzu, o ajudante do laboratório" />
      </div>
      {text && (
        <div className="relative mb-3 rounded-3xl border-4 border-ink bg-white px-4 py-3 text-lg font-semibold leading-snug shadow-chunky-sm anim-pop">
          <span className="absolute -left-3 bottom-4 h-5 w-5 rotate-45 border-b-4 border-l-4 border-ink bg-white" aria-hidden />
          {text}
        </div>
      )}
    </div>
  );
}

/**
 * Moldura de toda ferramenta: barra de cima com voltar, missão atual,
 * dica e o botão PRONTO! (que só acende quando a tarefa foi feita).
 */
export function ToolShell({ title, icon, color, children, missionId, onBack, extra }: { title: string; icon: string; color: string; children: ReactNode; missionId: number | null; onBack?: () => void; extra?: ReactNode }) {
  const { data, completeMission, go } = useGame();
  const m = missionId ? missionById(missionId) : null;
  const ready = m ? m.check(data) : false;
  const done = m ? isDone(data, m.id) : false;
  const [intro, setIntro] = useState(!!m && !data.progress.done.includes(m.id));
  useAutoSpeak(intro && m ? `${m.intro} ${m.task}` : null);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (ready && !done) {
      setPulse(true);
      sfx.select();
    }
  }, [ready, done]);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b-4 border-ink px-2 py-2 sm:px-3" style={{ background: color }}>
        <IconBtn label="Voltar ao mapa" icon="🗺️" onClick={onBack ?? (() => go({ name: 'map' }))} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>{m ? m.icon : icon}</span>
            <h1 className="truncate text-xl font-bold text-white sm:text-2xl" style={{ textShadow: '0 2px 0 #2b1f4a' }}>{m ? `Missão ${m.id}: ${m.title}` : title}</h1>
          </div>
          {m && (
            <p className="flex items-center gap-1 truncate text-sm font-bold text-white/95 sm:text-base" style={{ textShadow: '0 1px 0 #2b1f4a' }}>
              {ready ? '✅ Muito bem! Toque em PRONTO quando quiser.' : `👉 ${m.task}`}
            </p>
          )}
        </div>
        {extra}
        <SaveIndicator compact />
        {m && (
          <Btn
            variant={ready ? 'lime' : 'white'}
            disabled={!ready}
            className={`${pulse && ready && !done ? 'anim-pulse' : ''} !min-h-[52px] !px-3 sm:!px-5`}
            onClick={() => completeMission(m.id)}
            data-testid="mission-done"
            title={ready ? 'Concluir missão' : m.need}
            sound="none"
          >
            <span className="text-2xl">{done ? '⭐' : '✔'}</span>
            <span className="hidden sm:inline">{done ? 'Concluir de novo' : 'PRONTO!'}</span>
          </Btn>
        )}
      </header>
      <div className="relative min-h-0 flex-1">{children}</div>
      {intro && m && (
        <div className="absolute inset-0 z-40 flex items-end justify-center bg-night/55 p-3 anim-fade sm:items-center" onClick={() => setIntro(false)}>
          <div className="panel w-full max-w-xl bg-cream p-4 anim-pop" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-grape">
              {STAGES[m.stage - 1].icon} Etapa {m.stage} · Missão {m.id} de 30
            </div>
            <Zuzu text={m.intro} size={110} anim="pular" />
            <div className="mt-3 flex items-center gap-3 rounded-2xl border-4 border-dashed border-grape bg-white p-3">
              <span className="text-4xl" aria-hidden>{m.icon}</span>
              <p className="flex-1 text-xl font-bold">{m.task}</p>
              <SpeakBtn text={`${m.intro} ${m.task}`} />
            </div>
            <Btn variant="sun" big className="mt-4 w-full" onClick={() => setIntro(false)} data-testid="mission-start">Vamos lá! 🚀</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tela de comemoração quando uma missão é concluída. */
export function CelebrationOverlay() {
  const { celebration, closeCelebration, data, openMission, go } = useGame();
  if (!celebration) return null;
  const m = missionById(celebration.missionId)!;
  const next = MISSIONS.find((x) => x.id === m.id + 1);
  const nextOpen = next && isUnlocked(data, next.id) && !isDone(data, next.id);
  const stage = STAGES[m.stage - 1];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-night/70 p-3 anim-fade">
      <Confetti count={celebration.medal ? 140 : 70} />
      <div className="panel relative w-full max-w-md bg-cream p-5 text-center anim-pop" data-testid="celebration">
        <div className="text-sm font-bold uppercase tracking-wide text-grape">Missão {m.id} concluída</div>
        <h2 className="title-game mt-1 text-4xl">INCRÍVEL!</h2>
        <div className="my-3 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="anim-star" style={{ animationDelay: `${0.2 + i * 0.25}s` }}>
              <Stars n={i < celebration.stars ? 1 : 0} max={1} size={64} />
            </span>
          ))}
        </div>
        <p className="text-lg font-semibold">{celebration.stars === 3 ? 'Três estrelas! Vocês experimentaram muito!' : celebration.stars === 2 ? 'Muito criativo! Quer tentar mais coisas depois?' : 'Missão cumprida! Dá para voltar e caprichar quando quiser.'}</p>
        {celebration.medal && (
          <div className="mt-4 rounded-3xl border-4 border-ink p-3 anim-pop" style={{ background: stage.color, animationDelay: '0.9s' }}>
            <div className="text-5xl">🏅</div>
            <div className="text-xl font-bold text-white" style={{ textShadow: '0 2px 0 #2b1f4a' }}>Medalha: {stage.name}!</div>
            {celebration.medal < 6 && <div className="font-bold text-white">Nova etapa liberada! 🔓</div>}
          </div>
        )}
        {celebration.trophies.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {celebration.trophies.map((t) => (
              <span key={t.id} className="chip bg-sun-light text-base">{t.icon} {t.name}</span>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-col gap-3">
          {nextOpen && next && (
            <Btn variant="lime" big onClick={() => { closeCelebration(); openMission(next.id); }} data-testid="next-mission">
              Próxima missão ➜
            </Btn>
          )}
          <Btn variant="white" onClick={() => { closeCelebration(); go({ name: 'map' }); }} data-testid="back-map">Voltar ao mapa 🗺️</Btn>
          <Btn variant="ghost" onClick={closeCelebration}>Continuar criando aqui</Btn>
        </div>
      </div>
    </div>
  );
}
