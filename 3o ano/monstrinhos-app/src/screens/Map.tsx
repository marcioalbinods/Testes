import { useState } from 'react';
import { useGame } from '../components/game';
import { Btn, Modal, Stars } from '../components/ui';
import { Zuzu } from '../components/shell';
import { MonsterSvg } from '../art/Monster';
import { MISSIONS, STAGES, missionsOfStage, type ToolId } from '../game/missions';
import { isDone, isUnlocked, nextMission, stageDone, stageUnlocked } from '../game/progress';
import { sfx } from '../lib/audio';

const ISLANDS = [
  { x: 15, y: 30 },
  { x: 41, y: 20 },
  { x: 68, y: 27 },
  { x: 85, y: 64 },
  { x: 57, y: 74 },
  { x: 25, y: 71 },
];

const FREE_TOOLS: Record<number, { tool: ToolId; name: string; icon: string; after: number }[]> = {
  1: [{ tool: 'criatura', name: 'Laboratório de criação', icon: '🧪', after: 1 }],
  2: [
    { tool: 'animacao', name: 'Movimentos', icon: '🏃', after: 6 },
    { tool: 'expressoes', name: 'Expressões', icon: '😜', after: 7 },
    { tool: 'danca', name: 'Dança', icon: '💃', after: 8 },
    { tool: 'sons', name: 'Laboratório de sons', icon: '🔊', after: 9 },
    { tool: 'apresentacao', name: 'Apresentação', icon: '🎤', after: 10 },
  ],
  3: [
    { tool: 'personalidade', name: 'Personalidade', icon: '💖', after: 11 },
    { tool: 'comida', name: 'Comidas', icon: '🍕', after: 12 },
    { tool: 'poder', name: 'Superpoder', icon: '⚡', after: 13 },
    { tool: 'gostos', name: 'Gostos e medos', icon: '🌈', after: 14 },
    { tool: 'passaporte', name: 'Passaporte', icon: '🪪', after: 15 },
  ],
  4: [
    { tool: 'habitat', name: 'Editor de habitat', icon: '🏝️', after: 16 },
    { tool: 'explorar', name: 'Explorar meu mundo', icon: '🧭', after: 20 },
  ],
  5: [
    { tool: 'floresta', name: 'Floresta misteriosa', icon: '🔎', after: 21 },
    { tool: 'amigo', name: 'O amigo perdido', icon: '🤝', after: 22 },
    { tool: 'ponte', name: 'A ponte quebrada', icon: '🌉', after: 23 },
    { tool: 'tempestade', name: 'A grande tempestade', icon: '⛈️', after: 24 },
    { tool: 'festa', name: 'A festa', icon: '🎉', after: 25 },
  ],
  6: [{ tool: 'historia', name: 'Estúdio de histórias', icon: '🎬', after: 26 }],
};

function IslandArt({ color, dark, locked }: { color: string; dark: string; locked: boolean }) {
  return (
    <svg viewBox="0 0 200 130" className="absolute inset-0 h-full w-full" aria-hidden>
      <ellipse cx={100} cy={96} rx={96} ry={30} fill="#1d6fb0" opacity={0.35} />
      <path d="M10,86 C10,50 50,26 100,26 C150,26 190,50 190,86 C190,104 150,112 100,112 C50,112 10,104 10,86Z" fill={locked ? '#9fa3c4' : '#f6dca0'} stroke="#2b1f4a" strokeWidth={5} />
      <path d="M22,78 C22,48 56,32 100,32 C144,32 178,48 178,78 C178,92 144,98 100,98 C56,98 22,92 22,78Z" fill={locked ? '#b9bcd8' : color} />
      <path d="M22,78 C22,92 56,98 100,98 C144,98 178,92 178,78 C170,88 140,92 100,92 C60,92 30,88 22,78Z" fill={locked ? '#8f93b8' : dark} opacity={0.6} />
      {!locked && (
        <g opacity={0.9}>
          <circle cx={46} cy={58} r={9} fill="#fff" opacity={0.35} />
          <circle cx={150} cy={52} r={6} fill="#fff" opacity={0.35} />
        </g>
      )}
    </svg>
  );
}

export default function MapScreen() {
  const { data, openMission, go } = useGame();
  const [panel, setPanel] = useState<number | null>(null);
  const next = nextMission(data);
  const allDone = !next;

  return (
    <div className="relative h-full w-full overflow-y-auto" style={{ background: 'radial-gradient(circle at 50% 40%, #6fd3ff 0%, #2f9be0 55%, #1d6fb0 100%)' }}>
      {/* ondas */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" aria-hidden>
        <defs>
          <pattern id="waves" width="80" height="40" patternUnits="userSpaceOnUse">
            <path d="M0,20 Q20,8 40,20 T80,20" fill="none" stroke="#fff" strokeWidth="3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" />
      </svg>
      <div className="relative mx-auto w-full max-w-[1200px] px-2 pb-6 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <Zuzu
            size={70}
            text={allDone ? 'Vocês completaram as 30 missões! Podem continuar criando à vontade!' : next ? <>Próxima missão: <b>{next.title}</b></> : null}
            className="max-w-xl"
          />
          {next && (
            <Btn variant="sun" big className="shrink-0 anim-pulse" onClick={() => openMission(next.id)} data-testid="play-next">
              ▶ Jogar
            </Btn>
          )}
        </div>
        <div className="relative w-full" style={{ aspectRatio: '12 / 7' }}>
          {/* caminho entre as ilhas */}
          <svg viewBox="0 0 1200 700" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={`M${ISLANDS.map((p) => `${p.x * 12},${p.y * 7}`).join(' L')}`} fill="none" stroke="#fff" strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" opacity={0.85} />
          </svg>
          {STAGES.map((st, i) => {
            const pos = ISLANDS[i];
            const unlocked = stageUnlocked(data, st.id);
            const done = stageDone(data, st.id);
            const ms = missionsOfStage(st.id);
            const here = next?.stage === st.id;
            return (
              <div key={st.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: '22%' }}>
                {here && (
                  <div className="pointer-events-none absolute left-[52%] -top-[30%] z-10 w-[40%] anim-float" aria-hidden>
                    <MonsterSvg m={data.monster} anim="pular" size="100%" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { sfx.select(); setPanel(st.id); }}
                  className={`relative block w-full transition-transform active:scale-95 ${unlocked ? '' : 'grayscale-[0.4]'}`}
                  style={{ aspectRatio: '200 / 130' }}
                  aria-label={`Etapa ${st.id}: ${st.name}${unlocked ? '' : ' (trancada)'}`}
                  data-testid={`island-${st.id}`}
                >
                  <IslandArt color={st.color} dark={st.dark} locked={!unlocked} />
                  <span className="absolute inset-x-0 top-[22%] text-center text-[clamp(1.4rem,3.6vw,3rem)] leading-none">{unlocked ? st.icon : '🔒'}</span>
                  {done && <span className="absolute right-[6%] top-[4%] text-[clamp(1.2rem,3vw,2.4rem)] anim-pop">🏅</span>}
                </button>
                <div className="mt-1 text-center">
                  <span className="inline-block rounded-full border-[3px] border-ink bg-white px-2 py-0.5 text-[clamp(0.7rem,1.4vw,1rem)] font-bold leading-tight shadow-chunky-sm">
                    {st.id}. {st.short}
                  </span>
                </div>
                <div className="mt-1 flex justify-center gap-[3%]">
                  {ms.map((m) => {
                    const d = isDone(data, m.id);
                    const u = isUnlocked(data, m.id);
                    const isNext = next?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!u}
                        onClick={() => openMission(m.id)}
                        data-testid={`mission-${m.id}`}
                        aria-label={`Missão ${m.id}: ${m.title}${d ? ' (concluída)' : u ? '' : ' (trancada)'}`}
                        title={m.title}
                        className={`flex aspect-square w-[18%] min-w-[30px] items-center justify-center rounded-full border-[3px] border-ink text-[clamp(0.7rem,1.3vw,1rem)] font-bold shadow-chunky-sm transition-transform active:scale-90 ${d ? 'bg-sun' : u ? 'bg-white' : 'bg-white/50 text-ink/40'} ${isNext ? 'anim-pulse ring-4 ring-white' : ''}`}
                      >
                        {d ? '★' : u ? m.id : '•'}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Btn variant="sun" onClick={() => go({ name: 'trophies' })} icon="🏆" data-testid="open-trophies">Conquistas</Btn>
          <Btn variant="aqua" onClick={() => go({ name: 'exhibition' })} icon="🖼️" data-testid="open-exhibition">Exposição da dupla</Btn>
        </div>
      </div>

      <Modal open={panel !== null} onClose={() => setPanel(null)} title={panel ? `${STAGES[panel - 1].icon} Etapa ${panel}: ${STAGES[panel - 1].name}` : ''} wide>
        {panel && (
          <div>
            <p className="mb-3 text-lg font-semibold">{STAGES[panel - 1].goal}</p>
            {!stageUnlocked(data, panel) && <p className="mb-3 rounded-2xl bg-sun-light p-3 text-lg font-bold">🔒 Termine a etapa {panel - 1} para abrir esta ilha!</p>}
            <div className="grid gap-2">
              {missionsOfStage(panel).map((m) => {
                const d = isDone(data, m.id);
                const u = isUnlocked(data, m.id);
                return (
                  <div key={m.id} className={`flex items-center gap-3 rounded-2xl border-[3px] p-2 ${u ? 'border-ink bg-white' : 'border-ink/20 bg-white/60'}`}>
                    <span className="text-3xl">{u ? m.icon : '🔒'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">Missão {m.id}: {m.title}</div>
                      {d ? <Stars n={data.progress.stars[String(m.id)] ?? 1} size={22} /> : <div className="text-sm text-ink/70">{u ? m.task : 'Ainda trancada'}</div>}
                    </div>
                    {u && (
                      <Btn variant={d ? 'white' : 'lime'} onClick={() => { setPanel(null); openMission(m.id); }}>
                        {d ? 'Refazer' : 'Jogar'}
                      </Btn>
                    )}
                  </div>
                );
              })}
            </div>
            {FREE_TOOLS[panel].some((t) => isDone(data, t.after)) && (
              <>
                <h3 className="mb-2 mt-4 text-lg font-bold">🛠️ Criar à vontade (sem missão)</h3>
                <div className="flex flex-wrap gap-2">
                  {FREE_TOOLS[panel].filter((t) => isDone(data, t.after)).map((t) => (
                    <Btn key={t.tool} variant="aqua" onClick={() => { setPanel(null); go({ name: 'tool', tool: t.tool, mission: null }); }} icon={t.icon} data-testid={`free-${t.tool}`}>
                      {t.name}
                    </Btn>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export { MISSIONS };
