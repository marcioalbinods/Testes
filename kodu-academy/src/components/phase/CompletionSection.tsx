import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Phase } from '../../content/types';
import { CRITERION_LABEL, missingCriteria, type Criterion, type PhaseProgress } from '../../lib/progression';
import { PHASES } from '../../content/phases';
import { useApp } from '../../state/AppContext';
import { toAppError } from '../../services/errors';
import { encourage } from '../../lib/encouragement';
import { ErrorAlert, useToast } from '../Feedback';
import { scrollToId } from '../Anchor';
import { SaveIndicator, useSaver } from './useSaver';

const TARGET: Record<Criterion, string> = { checklist: 'checklist', quiz: 'teste', reflection: 'reflexao', review: 'revisao' };

export function CompletionSection({ phase, progress }: { phase: Phase; progress: PhaseProgress | undefined }) {
  const { backend, updateProgress, reloadProgress } = useApp();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const saver = useSaver();
  const missing = missingCriteria(phase, progress);
  const completed = progress?.status === 'completed';
  const next = PHASES.find((p) => p.id === phase.id + 1);

  const setReviewed = (v: boolean) =>
    backend && saver.run(() => backend.student.setReviewed(phase.id, v), updateProgress);

  async function complete() {
    if (!backend) return;
    setBusy(true);
    setError(null);
    try {
      const r = await backend.student.completePhase(phase.id);
      updateProgress(r.progress);
      if (r.ok) {
        setJustCompleted(true);
        toast(encourage.complete(phase.id), 'ok');
        await reloadProgress().catch(() => undefined);
      } else {
        setError('Ainda faltam critérios: ' + r.missing.map((m) => CRITERION_LABEL[m as Criterion] ?? m).join('; ') + '.');
      }
    } catch (e) {
      setError(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  }

  if (completed) {
    return (
      <div className={`celebrate ${justCompleted ? 'pop' : ''}`} role="status">
        <div className="big" aria-hidden="true">🏆</div>
        <h3 style={{ marginTop: 4 }}>Missão {phase.id} concluída!</h3>
        <p>
          {progress?.completedByTeacher ? 'Concluída pelo professor. ' : ''}
          Você desenvolveu: {phase.skills.join('; ')}.
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          {next ? (
            <Link className="btn btn-ok" to={`/fase/${next.id}`}>
              Ir para a fase {next.id}: {next.title} →
            </Link>
          ) : (
            <Link className="btn btn-ok" to="/conquistas">Ver minhas conquistas →</Link>
          )}
          <Link className="btn btn-ghost" to="/trilha">Voltar à trilha</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>Critérios para concluir</h3>
      <ul className="criteria">
        {(['checklist', 'quiz', 'reflection', 'review'] as Criterion[]).map((c) => {
          const met = !missing.includes(c);
          return (
            <li key={c} className={met ? 'met' : 'unmet'}>
              <span className="icon" aria-hidden="true">{met ? '✓' : '·'}</span>
              <span>
                {CRITERION_LABEL[c]} <span className="sr-only">{met ? '(cumprido)' : '(pendente)'}</span>
              </span>
              {!met && c !== 'review' && (
                <button type="button" className="linklike small" style={{ marginLeft: 'auto' }} onClick={() => scrollToId(TARGET[c])}>
                  ir até lá
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div id="revisao" className="card" style={{ marginTop: 16, background: 'var(--surface-2)' }}>
        <h3>Revisão rápida antes de concluir</h3>
        <p className="small">Confira se fez cada passo e se o seu mundo no Kodu está como no resultado esperado:</p>
        <ol className="small">
          {phase.steps.map((s, i) => (
            <li key={i}>{s.title}</li>
          ))}
        </ol>
        <p className="small"><strong>Resultado esperado:</strong> {phase.expectedResult}</p>
        <label className="row" style={{ fontWeight: 600, gap: 10 }}>
          <input
            type="checkbox"
            style={{ width: 24, height: 24, accentColor: 'var(--ok)' }}
            checked={Boolean(progress?.reviewed)}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          Revisei as instruções, testei no Kodu e salvei meu mundo.
        </label>
        <SaveIndicator status={saver.status} error={saver.error} />
      </div>

      <ErrorAlert message={error} />
      <button type="button" className="btn btn-ok" style={{ marginTop: 16 }} onClick={complete} disabled={busy || missing.length > 0}>
        {busy ? 'Verificando…' : 'Concluir missão'}
      </button>
      {missing.length > 0 && (
        <p className="small muted">O botão fica disponível quando os {missing.length === 1 ? 'critério pendente for cumprido' : `${missing.length} critérios pendentes forem cumpridos`}.</p>
      )}
    </div>
  );
}
