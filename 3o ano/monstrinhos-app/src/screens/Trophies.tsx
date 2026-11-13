import { useGame } from '../components/game';
import { Btn, Stars } from '../components/ui';
import { MISSIONS, STAGES, missionsOfStage } from '../game/missions';
import { TROPHIES, medals, progressPct, stageDone, totalStars } from '../game/progress';

/** Sala de conquistas: estrelas, medalhas e troféus (sem ranking entre duplas). */
export default function Trophies() {
  const { data, go } = useGame();
  const med = medals(data);
  return (
    <div className="scroll-y h-full bg-[radial-gradient(circle_at_50%_0%,#fff7c2,#ffc93c_60%,#ff9a3c)] p-3 sm:p-5" data-testid="trophies">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="title-game text-4xl sm:text-5xl">🏆 CONQUISTAS</h1>
          <Btn onClick={() => go({ name: 'map' })}>🗺️ Mapa</Btn>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="panel p-4 text-center"><div className="text-5xl">⭐</div><div className="text-3xl font-bold">{totalStars(data)}</div><div className="font-semibold">estrelas de criatividade</div></div>
          <div className="panel p-4 text-center"><div className="text-5xl">🏅</div><div className="text-3xl font-bold">{med.length} / 6</div><div className="font-semibold">medalhas de etapa</div></div>
          <div className="panel p-4 text-center"><div className="text-5xl">📈</div><div className="text-3xl font-bold">{progressPct(data)}%</div><div className="font-semibold">da jornada</div></div>
        </div>
        <section className="panel p-4">
          <h2 className="mb-3 text-2xl font-bold">🏅 Medalhas</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s) => {
              const done = stageDone(data, s.id);
              const ms = missionsOfStage(s.id);
              const count = ms.filter((m) => data.progress.done.includes(m.id)).length;
              return (
                <div key={s.id} className={`flex items-center gap-3 rounded-2xl border-[3px] p-3 ${done ? 'border-ink' : 'border-ink/20 opacity-70'}`} style={{ background: done ? s.color + '33' : '#fff' }}>
                  <span className={`text-5xl ${done ? 'anim-float' : 'grayscale'}`}>{done ? '🏅' : '⚪'}</span>
                  <div>
                    <div className="font-bold">{s.icon} {s.name}</div>
                    <div className="text-sm font-semibold">{count} de 5 missões</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel p-4">
          <h2 className="mb-3 text-2xl font-bold">🏆 Troféus ({data.progress.achievements.length} de {TROPHIES.length})</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TROPHIES.map((t) => {
              const got = data.progress.achievements.includes(t.id) || t.test(data);
              return (
                <div key={t.id} className={`flex items-center gap-3 rounded-2xl border-[3px] p-2 ${got ? 'border-ink bg-sun-light' : 'border-dashed border-ink/25 bg-white'}`} data-testid={`trophy-${t.id}`}>
                  <span className={`text-4xl ${got ? '' : 'opacity-30 grayscale'}`}>{got ? t.icon : '🔒'}</span>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm">{t.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel p-4">
          <h2 className="mb-3 text-2xl font-bold">⭐ Estrelas por missão</h2>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {MISSIONS.map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-xl bg-cream px-2 py-1">
                <span className="w-7 text-center font-bold">{m.id}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.icon} {m.title}</span>
                <Stars n={data.progress.stars[String(m.id)] ?? 0} size={18} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm font-semibold text-ink/70">As estrelas valorizam experimentar e caprichar. Dá para voltar e ganhar mais!</p>
        </section>
      </div>
    </div>
  );
}
