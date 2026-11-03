import { useMemo, useState, type FormEvent } from 'react';
import type { Phase } from '../../content/types';
import type { PhaseProgress } from '../../lib/progression';
import { seededShuffle, type QuizResult } from '../../lib/quiz';
import { useApp } from '../../state/AppContext';
import { toAppError } from '../../services/errors';
import { encourage } from '../../lib/encouragement';
import { ErrorAlert, useToast } from '../Feedback';

export function QuizSection({ phase, progress }: { phase: Phase; progress: PhaseProgress | undefined }) {
  const { backend, student, reloadProgress } = useApp();
  const toast = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0);

  // Alternativas embaralhadas por aluno e por tentativa (evita decorar posições).
  const questions = useMemo(
    () =>
      phase.quiz.map((q) => ({
        ...q,
        options: seededShuffle(q.options, `${student?.id ?? 'x'}-${phase.id}-${q.id}-${round}`),
      })),
    [phase, student?.id, round],
  );
  const unanswered = phase.quiz.filter((q) => !answers[q.id]).length;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (unanswered > 0) {
      setError(`Responda todas as perguntas (faltam ${unanswered}).`);
      return;
    }
    if (!backend) return;
    setBusy(true);
    setError(null);
    try {
      const r = await backend.student.submitQuiz(phase.id, answers);
      setResult(r);
      toast(r.passed ? encourage.quizPass(r.score) : encourage.quizFail(r.score), r.passed ? 'ok' : 'info');
      await reloadProgress().catch(() => undefined);
    } catch (err) {
      setError(toAppError(err).message);
    } finally {
      setBusy(false);
    }
  }

  const retry = () => {
    setAnswers({});
    setResult(null);
    setRound((r) => r + 1);
  };

  return (
    <form onSubmit={submit} noValidate>
      {progress?.quizPassed && !result && (
        <div className="alert alert-ok">
          Você já foi aprovado neste teste (melhor nota: {progress.quizBestScore}/{phase.quiz.length}). Pode refazer para praticar.
        </div>
      )}
      <p className="muted">
        {phase.quiz.length} perguntas · aprovação com pelo menos {phase.quizPassMin} acertos. A correção é feita pelo sistema e as tentativas
        ficam registradas para o professor.
      </p>
      {questions.map((q, i) => {
        const r = result?.results[q.id];
        return (
          <fieldset key={q.id} className="quiz-q" disabled={Boolean(result) || busy}>
            <legend>
              {i + 1}. {q.prompt}
            </legend>
            {q.options.map((o) => (
              <label key={o.id} className="option">
                <input
                  type="radio"
                  name={`${phase.id}-${q.id}-${round}`}
                  value={o.id}
                  checked={answers[q.id] === o.id}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                />
                <span>{o.text}</span>
              </label>
            ))}
            {result && (
              <div className={`q-result ${r ? 'right' : 'wrong'}`} role="note">
                <strong>{r ? '✓ Correto.' : '✗ Ainda não.'}</strong> {q.explanation}
              </div>
            )}
          </fieldset>
        );
      })}
      <ErrorAlert message={error} />
      {result ? (
        <div className={`alert ${result.passed ? 'alert-ok' : 'alert-warn'}`} role="status">
          <strong>
            {result.score} de {result.total} acertos — {result.passed ? 'aprovado!' : `ainda não aprovado (mínimo ${result.passMin}).`}
          </strong>
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
              {result.passed ? 'Refazer para praticar' : 'Revisar e tentar de novo'}
            </button>
          </div>
        </div>
      ) : (
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Corrigindo…' : 'Enviar respostas'}
        </button>
      )}
    </form>
  );
}
