import { Fragment, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { useTeacherData } from './TeacherData';
import { PHASES, requiredChecklistIds } from '../../content/phases';
import { activityLabel, classNameOf, groupProgress, questionStats, STATUS_LABEL, studentReportCsv, summarizeStudent } from '../../lib/analytics';
import { phaseState, isUnlocked } from '../../lib/progression';
import { downloadText } from '../../lib/csv';
import { ProgressBar } from '../../components/ProgressBar';
import { ErrorAlert, Modal, useToast } from '../../components/Feedback';
import { toAppError } from '../../services/errors';
import { auditLabel } from './auditLabel';

type Action = { kind: 'unlock' | 'completed' | 'in_progress' | 'reset'; phaseId: number } | null;

const ACTION_TEXT = {
  unlock: { title: 'Liberar fase', btn: 'Liberar', note: 'O aluno poderá fazer esta fase mesmo sem concluir a anterior.' },
  completed: { title: 'Marcar fase como concluída', btn: 'Marcar concluída', note: 'Use quando o aluno demonstrou o domínio de outra forma (ex.: apresentação em aula). Fica registrado como “concluída pelo professor”.' },
  in_progress: { title: 'Reabrir fase', btn: 'Reabrir', note: 'A fase volta a “em andamento”. As próximas fases podem ficar bloqueadas até a nova conclusão.' },
  reset: { title: 'Zerar progresso da fase', btn: 'Zerar', note: 'Apaga checklist, reflexão e status desta fase (as tentativas de teste continuam no histórico).' },
};

const STATE_TEXT = { locked: 'Bloqueada', available: 'Disponível', in_progress: 'Em andamento', completed: 'Concluída' } as const;

export function StudentDetailPage() {
  const { id } = useParams();
  const { backend } = useApp();
  const { data, reload } = useTeacherData();
  const toast = useToast();
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const student = data.students.find((s) => s.id === id);
  const progress = useMemo(() => (student ? groupProgress(data.progress).get(student.id) ?? {} : {}), [data, student]);
  const attempts = useMemo(() => data.attempts.filter((a) => a.studentId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [data, id]);
  const activity = useMemo(() => data.activity.filter((a) => a.studentId === id).slice(0, 60), [data, id]);
  const audit = useMemo(() => data.audit.filter((a) => a.studentId === id), [data, id]);
  if (!student) {
    return (
      <div className="card">
        Aluno não encontrado. <Link to="/professor/turma">Voltar</Link>
      </div>
    );
  }
  const className = classNameOf(data.classes, student.classId);
  const summary = summarizeStudent(student, progress, data.attempts, className, new Date());
  const wrongQuestions = questionStats(attempts, 1).filter((q) => q.wrong > 0).slice(0, 8);

  async function doAction() {
    if (!action || !backend) return;
    if (reason.trim().length < 3) return setError('Escreva o motivo (mínimo 3 caracteres). Ele fica registrado no histórico.');
    setBusy(true);
    setError(null);
    try {
      if (action.kind === 'unlock') await backend.teacher.unlockPhase(student!.id, action.phaseId, reason);
      else await backend.teacher.setPhaseStatus(student!.id, action.phaseId, action.kind, reason);
      toast('Alteração registrada.', 'ok');
      setAction(null);
      setReason('');
      await reload();
    } catch (e) {
      setError(toAppError(e).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="no-print"><Link to="/professor/turma">← Voltar ao acompanhamento</Link></p>
      <section className="card">
        <div className="row">
          <div>
            <h2 style={{ margin: 0 }}>{student.displayName}</h2>
            <div className="muted">Turma {className} · {student.active ? 'ativo' : 'desativado'}</div>
          </div>
          <span className="spacer" />
          <button type="button" className="btn btn-sm btn-secondary no-print"
            onClick={() => downloadText(`relatorio-${student.displayName}-${new Date().toISOString().slice(0, 10)}.csv`, studentReportCsv(student, className, progress, data.attempts))}>
            Exportar CSV
          </button>
          <button type="button" className="btn btn-sm btn-ghost no-print" onClick={() => window.print()}>Imprimir relatório</button>
        </div>
        <div className="grid grid-4" style={{ marginTop: 16 }}>
          <div className="kpi"><div className="value">{summary.status === 'concluiu' ? '✓' : summary.currentPhase}</div><div className="label">fase atual</div></div>
          <div className="kpi"><div className="value">{summary.completed}/20</div><div className="label">fases concluídas</div></div>
          <div className="kpi"><div className="value">{summary.totalAttempts}</div><div className="label">tentativas de teste</div></div>
          <div className="kpi"><div className="value" style={{ fontSize: '1.1rem' }}>{STATUS_LABEL[summary.status]}</div><div className="label">situação</div></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={summary.percent} label="Progresso na trilha" />
        </div>
        <p className="small muted">
          Início: {student.startedAt ? new Date(student.startedAt).toLocaleDateString('pt-BR') : 'ainda não entrou'} · Último progresso:{' '}
          {summary.lastProgressAt ? new Date(summary.lastProgressAt).toLocaleString('pt-BR') : '—'}
        </p>
      </section>

      <section className="card">
        <h2>Dificuldades identificadas</h2>
        {summary.difficultPhases.length === 0 && wrongQuestions.length === 0 ? (
          <p className="muted">Nenhuma dificuldade registrada pelas atividades de verificação até agora.</p>
        ) : (
          <>
            {summary.difficultPhases.length > 0 && (
              <p>Fases com 2+ reprovações no teste ou uso da dica 3: <strong>{summary.difficultPhases.join(', ')}</strong></p>
            )}
            {wrongQuestions.length > 0 && (
              <ul>
                {wrongQuestions.map((q) => (
                  <li key={`${q.phaseId}-${q.questionId}`}>
                    Fase {q.phaseId}: “{q.prompt}” — errou {q.wrong} de {q.answered} vez(es)
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="card">
        <h2>Fases</h2>
        <ErrorAlert message={error && !action ? error : null} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fase</th><th>Situação</th><th>Checklist</th><th>Teste</th><th>Dica máx.</th><th>Concluída em</th><th className="no-print">Ações</th></tr>
            </thead>
            <tbody>
              {PHASES.map((ph) => {
                const p = progress[ph.id];
                const st = phaseState(ph.id, progress);
                const req = requiredChecklistIds(ph);
                const done = p ? req.filter((x) => p.checklist.includes(x)).length : 0;
                const tries = attempts.filter((a) => a.phaseId === ph.id).length;
                return (
                  <Fragment key={ph.id}>
                    <tr>
                      <td>
                        <button type="button" className="linklike" aria-expanded={open === ph.id} onClick={() => setOpen(open === ph.id ? null : ph.id)}>
                          {ph.id}. {ph.title}
                        </button>
                      </td>
                      <td>
                        {STATE_TEXT[st]}
                        {p?.manuallyUnlocked && <div className="small muted">liberada pelo professor</div>}
                        {p?.completedByTeacher && <div className="small muted">concluída pelo professor</div>}
                      </td>
                      <td>{p ? `${done}/${req.length}` : '—'}</td>
                      <td>{p ? `${p.quizPassed ? '✓ aprovado' : 'não aprovado'} · melhor ${p.quizBestScore}/${ph.quiz.length} · ${tries} tent.` : '—'}</td>
                      <td>{p?.hintsViewed ?? 0}</td>
                      <td>{p?.completedAt ? new Date(p.completedAt).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="no-print">
                        <div className="row" style={{ gap: 4 }}>
                          {!isUnlocked(ph.id, progress) && (
                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setAction({ kind: 'unlock', phaseId: ph.id })}>Liberar</button>
                          )}
                          {st !== 'completed' && (
                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAction({ kind: 'completed', phaseId: ph.id })}>Marcar concluída</button>
                          )}
                          {st === 'completed' && (
                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAction({ kind: 'in_progress', phaseId: ph.id })}>Reabrir</button>
                          )}
                          {p && (
                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAction({ kind: 'reset', phaseId: ph.id })}>Zerar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {open === ph.id && (
                      <tr>
                        <td colSpan={7} style={{ background: 'var(--surface-2)' }}>
                          <div className="grid grid-2">
                            <div>
                              <strong>Checklist</strong>
                              <ul className="small">
                                {ph.checklist.map((c) => (
                                  <li key={c.id}>
                                    {p?.checklist.includes(c.id) ? '☑' : '☐'} {c.text} {!c.required && <em>(opcional)</em>}
                                  </li>
                                ))}
                              </ul>
                              <strong>Reflexão</strong>
                              <p className="small">{p?.reflection ? p.reflection : <span className="muted">não escrita</span>}</p>
                              <p className="small">Revisão confirmada: {p?.reviewed ? 'sim' : 'não'}</p>
                            </div>
                            <div>
                              <strong>Respostas aos testes</strong>
                              {attempts.filter((a) => a.phaseId === ph.id).length === 0 ? (
                                <p className="small muted">Nenhuma tentativa.</p>
                              ) : (
                                attempts.filter((a) => a.phaseId === ph.id).map((a) => (
                                  <div key={a.id} className="small" style={{ marginBottom: 10 }}>
                                    <div>
                                      {new Date(a.createdAt).toLocaleString('pt-BR')} — <strong>{a.score}/{a.total}</strong> {a.passed ? '(aprovado)' : '(não aprovado)'}
                                    </div>
                                    <ul style={{ margin: 0 }}>
                                      {ph.quiz.map((q) => {
                                        const chosen = q.options.find((o) => o.id === a.answers[q.id]);
                                        return (
                                          <li key={q.id}>
                                            {a.results[q.id] ? '✓' : '✗'} {q.prompt} — <em>{chosen?.text ?? 'sem resposta'}</em>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted">Clique no nome da fase para ver checklist, reflexão e respostas.</p>
      </section>

      <div className="grid grid-2">
        <section className="card">
          <h2>Histórico de evolução</h2>
          {activity.length === 0 ? (
            <p className="muted">Sem atividades registradas.</p>
          ) : (
            <ul className="small">
              {activity.map((a) => (
                <li key={a.id}>
                  {new Date(a.createdAt).toLocaleString('pt-BR')} — {activityLabel(a)}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2>Alterações administrativas</h2>
          {audit.length === 0 ? (
            <p className="muted">Nenhuma alteração feita pelo professor.</p>
          ) : (
            <ul className="small">
              {audit.map((a) => (
                <li key={a.id}>
                  {new Date(a.createdAt).toLocaleString('pt-BR')} — {auditLabel(a.action)}
                  {a.phaseId ? ` (fase ${a.phaseId})` : ''}
                  {a.reason ? ` — motivo: ${a.reason}` : ''}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {action && (
        <Modal title={`${ACTION_TEXT[action.kind].title} ${action.phaseId}`} onClose={() => { setAction(null); setError(null); }}>
          <p>{ACTION_TEXT[action.kind].note}</p>
          <form onSubmit={(e) => { e.preventDefault(); doAction(); }}>
            <div className="field">
              <label htmlFor="motivo">Motivo (obrigatório, fica no histórico)</label>
              <input id="motivo" type="text" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />
            </div>
            <ErrorAlert message={error} />
            <div className="row">
              <button type="button" className="btn btn-ghost" onClick={() => { setAction(null); setError(null); }}>Cancelar</button>
              <button type="submit" className="btn" disabled={busy}>{ACTION_TEXT[action.kind].btn}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
