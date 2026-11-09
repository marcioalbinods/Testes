/** Curso de Arduino: lista das 20 missões por nível. */
import { CheckCircle2, Clock, GraduationCap } from 'lucide-react';
import { LEVELS, MISSIONS } from '../data/missions';
import { useProgress } from '../lib/progress';
import { Link } from '../lib/router';
import { PageHead, ProgressBar } from '../components/ui';
import { MissionMap } from '../components/MissionMap';

export function CoursePage() {
  const { state } = useProgress();
  const done = MISSIONS.filter((m) => state.missions[m.id]?.done).length;
  return (
    <div className="stack">
      <PageHead icon={<GraduationCap size={30} />} color="#7c4dff" title="Curso de Arduino — 20 missões" subtitle="Siga a ordem recomendada: cada missão prepara a próxima. Você pode voltar às missões anteriores quando quiser.">
        <div style={{ minWidth: 220 }}>
          <div className="small muted">{done} de 20 concluídas</div>
          <ProgressBar value={done} max={20} label="Missões concluídas" />
        </div>
      </PageHead>
      <MissionMap />
      {LEVELS.map((L) => (
        <section key={L.n}>
          <h2 style={{ color: L.color }}>Nível {L.n} — {L.name}</h2>
          <div className="grid cols-3">
            {MISSIONS.filter((m) => m.level === L.n).map((m) => {
              const p = state.missions[m.id] ?? {};
              return (
                <Link key={m.id} to={`/curso/missao/${m.id}`} className="card module-card">
                  <div className="row between">
                    <span className="chip" style={{ background: L.soft, color: L.color }}>Missão {String(m.n).padStart(2, '0')}</span>
                    {p.done ? <span className="chip green"><CheckCircle2 size={14} /> Concluída</span> : <span className="chip gray"><Clock size={14} /> {m.teacher.minutes} min</span>}
                  </div>
                  <h3><span aria-hidden>{m.icon}</span> {m.title}</h3>
                  <p>{m.objective}</p>
                  <span className="small muted">+{m.xp} XP</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
