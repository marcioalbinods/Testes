import { Link } from 'react-router-dom';
import { MODULES } from '../../content/modules';
import { PHASES } from '../../content/phases';
import { useApp } from '../../state/AppContext';
import { completedCount, earnedSkills, trailPercent } from '../../lib/progression';
import { ProgressBar } from '../../components/ProgressBar';

const BADGES = [
  'Explorador do Kodu',
  'Programador de interações',
  'Construtor de jogos',
  'Caçador de bugs',
  'Autor de jogos',
];

export function AchievementsPage() {
  const { progress } = useApp();
  const skills = earnedSkills(progress);
  const done = completedCount(progress);
  const quizTotals = Object.values(progress).reduce(
    (acc, p) => ({ attempts: acc.attempts + p.quizAttempts, passed: acc.passed + (p.quizPassed ? 1 : 0) }),
    { attempts: 0, passed: 0 },
  );
  return (
    <>
      <h1>Conquistas e habilidades</h1>
      <div className="grid grid-4">
        <div className="kpi"><div className="value">{done}</div><div className="label">fases concluídas de {PHASES.length}</div></div>
        <div className="kpi"><div className="value">{trailPercent(progress)}%</div><div className="label">da trilha</div></div>
        <div className="kpi"><div className="value">{quizTotals.passed}</div><div className="label">testes aprovados</div></div>
        <div className="kpi"><div className="value">{skills.length}</div><div className="label">habilidades desenvolvidas</div></div>
      </div>

      <h2>Emblemas dos módulos</h2>
      <div className="grid grid-3">
        {MODULES.map((m, i) => {
          const phases = PHASES.filter((p) => p.module === m.id);
          const doneHere = phases.filter((p) => progress[p.id]?.status === 'completed').length;
          const earned = doneHere === phases.length;
          return (
            <div key={m.id} className="card" style={{ borderTop: `6px solid ${m.color}`, opacity: earned ? 1 : 0.85 }}>
              <h3>{earned ? '🏅' : '◻️'} {BADGES[i]}</h3>
              <p className="small muted">Módulo {m.id}: {m.title}</p>
              <ProgressBar value={(doneHere / phases.length) * 100} label={`${doneHere}/${phases.length} fases`} />
            </div>
          );
        })}
      </div>

      <h2>Habilidades que você já desenvolveu</h2>
      {skills.length === 0 ? (
        <div className="card">
          Conclua a primeira fase para começar sua lista de habilidades. <Link to="/trilha">Ir para a trilha</Link>
        </div>
      ) : (
        <div className="card">
          <ul>
            {skills.map((s, i) => (
              <li key={i}>
                {s.skill} <span className="muted small">(fase {s.phaseId})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
