import { Link } from 'react-router-dom';
import { MODULES, DIFFICULTY_LABEL } from '../../content/modules';
import { PHASES } from '../../content/phases';
import { useApp } from '../../state/AppContext';
import { completedCount, lockReason, missionPercent, phaseState, resumePhaseId, trailPercent, type PhaseState } from '../../lib/progression';
import { ProgressBar } from '../../components/ProgressBar';
import { ErrorAlert } from '../../components/Feedback';
import { useEffect, useState } from 'react';
import { toAppError } from '../../services/errors';

const STATE_BADGE: Record<PhaseState, { text: string; cls: string }> = {
  locked: { text: '🔒 Bloqueada', cls: 'badge badge-locked' },
  available: { text: 'Disponível', cls: 'badge badge-info' },
  in_progress: { text: 'Em andamento', cls: 'badge badge-warn' },
  completed: { text: '✓ Concluída', cls: 'badge badge-ok' },
};

export function TrailPage() {
  const { student, progress, reloadProgress } = useApp();
  const [error, setError] = useState<string | null>(null);
  const load = () => reloadProgress().then(() => setError(null)).catch((e) => setError(toAppError(e).message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const resume = resumePhaseId(progress);
  const done = completedCount(progress);
  return (
    <>
      <h1>Minha trilha</h1>
      <ErrorAlert message={error} onRetry={load} />
      <div className="card">
        <div className="row">
          <div style={{ flex: '1 1 280px' }}>
            <ProgressBar value={trailPercent(progress)} label={`${done} de ${PHASES.length} fases concluídas`} />
          </div>
          {resume ? (
            <Link className="btn" to={`/fase/${resume}`}>
              {progress[resume] ? 'Continuar' : 'Começar'} a fase {resume}
            </Link>
          ) : (
            <Link className="btn btn-ok" to="/conquistas">Trilha concluída! Ver conquistas</Link>
          )}
        </div>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {student?.displayName} · Turma {student?.className}. Todas as fases aparecem aqui; as bloqueadas mostram o que falta para liberar.
        </p>
      </div>

      {MODULES.map((m) => (
        <section key={m.id} className="module-block" aria-labelledby={`mod-${m.id}`}>
          <div className="module-head">
            <span className="module-dot" style={{ background: m.color }} aria-hidden="true" />
            <h2 id={`mod-${m.id}`} style={{ margin: 0 }}>
              Módulo {m.id} — {m.title}
            </h2>
          </div>
          <p className="muted" style={{ margin: '4px 0 0' }}>{m.description}</p>
          <div className="phase-grid">
            {PHASES.filter((p) => p.module === m.id).map((p) => {
              const st = phaseState(p.id, progress);
              const pct = missionPercent(p, progress[p.id]);
              const inner = (
                <>
                  <span className="num">Fase {p.id} · {DIFFICULTY_LABEL[p.difficulty]}</span>
                  <h3>{p.title}</h3>
                  <span className="small muted">{p.estimatedMinutes[0]}–{p.estimatedMinutes[1]} min (estimativa)</span>
                  {st === 'locked' ? (
                    <span className="small">{lockReason(p.id)}</span>
                  ) : (
                    st !== 'completed' && <ProgressBar value={pct} label="Missão" />
                  )}
                  <div className="state">
                    <span className={STATE_BADGE[st].cls}>{STATE_BADGE[st].text}</span>
                    {progress[p.id]?.manuallyUnlocked && st !== 'completed' && <span className="badge">Liberada pelo professor</span>}
                  </div>
                </>
              );
              return st === 'locked' ? (
                <div key={p.id} className="phase-card locked" style={{ borderTopColor: m.color }} aria-label={`Fase ${p.id}: ${p.title}. Bloqueada.`}>
                  {inner}
                </div>
              ) : (
                <Link key={p.id} to={`/fase/${p.id}`} className={`phase-card ${st}`} style={{ borderTopColor: m.color }}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
