import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTeacherData } from './TeacherData';
import { ClassFilter } from './ClassFilter';
import { useClassFilter } from './useClassFilter';
import { filterTeacherData, INACTIVE_DAYS, overview, phaseStats, questionStats, daysSince } from '../../lib/analytics';
import { PHASES } from '../../content/phases';

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);

export function OverviewPage() {
  const { data } = useTeacherData();
  const [classId, setClassId] = useClassFilter();
  const filtered = useMemo(() => filterTeacherData(data, classId || null), [data, classId]);
  const ov = useMemo(() => overview(filtered), [filtered]);
  const hardest = useMemo(
    () => phaseStats(filtered).filter((s) => s.studentsWithAttempts >= 2).sort((a, b) => b.difficulty - a.difficulty).slice(0, 5),
    [filtered],
  );
  const questions = useMemo(() => questionStats(filtered.attempts).slice(0, 5), [filtered]);
  const maxCount = Math.max(1, ...ov.distribution.map((d) => d.count));

  if (data.classes.length === 0) {
    return (
      <div className="card">
        <h2>Bem-vindo(a)!</h2>
        <p>Comece criando uma turma e cadastrando os alunos. Os códigos de acesso são gerados automaticamente.</p>
        <Link className="btn" to="/professor/gestao">Criar a primeira turma</Link>
      </div>
    );
  }

  return (
    <>
      <div className="filters" style={{ maxWidth: 360 }}>
        <ClassFilter classes={data.classes} value={classId} onChange={setClassId} />
      </div>
      <div className="grid grid-4">
        <div className="kpi"><div className="value">{ov.totalStudents}</div><div className="label">alunos cadastrados</div></div>
        <div className="kpi"><div className="value">{ov.totalClasses}</div><div className="label">turmas ativas</div></div>
        <div className="kpi"><div className="value">{ov.recentlyActive}</div><div className="label">ativos nos últimos {INACTIVE_DAYS} dias</div></div>
        <div className="kpi"><div className="value">{ov.avgTrailPercent}%</div><div className="label">conclusão média da trilha</div></div>
        <div className="kpi"><div className="value">{ov.finished}</div><div className="label">concluíram as 20 fases</div></div>
        <div className="kpi"><div className="value">{ov.notStarted}</div><div className="label">ainda não entraram</div></div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card" aria-labelledby="dist">
          <h2 id="dist">Distribuição dos alunos por fase atual</h2>
          {ov.distribution.every((d) => d.count === 0) ? (
            <p className="muted">Ainda não há alunos com progresso registrado.</p>
          ) : (
            <div className="bars" role="table" aria-label="Alunos por fase atual">
              {ov.distribution.map((d) => (
                <div className="bar-row" key={d.phaseId} role="row">
                  <span role="rowheader">Fase {d.phaseId}</span>
                  <span className="bar" role="cell" aria-label={`${d.count} alunos`}>
                    <span style={{ width: `${(d.count / maxCount) * 100}%` }} />
                  </span>
                  <span role="cell">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="stack">
          <section className="card" aria-labelledby="apoio">
            <h2 id="apoio">Precisam de apoio</h2>
            <p className="small muted">3 ou mais reprovações no teste da fase atual, sem aprovação.</p>
            {ov.needSupport.length === 0 ? (
              <p className="muted">Ninguém nesta situação agora.</p>
            ) : (
              <ul>
                {ov.needSupport.map((s) => (
                  <li key={s.student.id}>
                    <Link to={`/professor/aluno/${s.student.id}`}>{s.student.displayName}</Link> — {s.className}, fase {s.currentPhase} (
                    {s.failedAttemptsCurrent} reprovações)
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card" aria-labelledby="inativos">
            <h2 id="inativos">Sem progresso há {INACTIVE_DAYS}+ dias</h2>
            {ov.inactive.length === 0 ? (
              <p className="muted">Nenhum aluno inativo (ou ainda não há dados suficientes).</p>
            ) : (
              <ul>
                {ov.inactive.map((s) => (
                  <li key={s.student.id}>
                    <Link to={`/professor/aluno/${s.student.id}`}>{s.student.displayName}</Link> — {s.className}, fase {s.currentPhase}, há{' '}
                    {daysSince(s.lastProgressAt, new Date())} dias
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card" aria-labelledby="dificeis">
          <h2 id="dificeis">Fases com maior dificuldade</h2>
          {hardest.length === 0 ? (
            <p className="muted">Dados insuficientes: é preciso que pelo menos 2 alunos tenham feito o teste de uma fase.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Fase</th><th>Aprovação na 1ª tentativa</th><th>Tentativas (média)</th><th>Conclusão</th></tr>
                </thead>
                <tbody>
                  {hardest.map((s) => (
                    <tr key={s.phaseId}>
                      <td>{s.phaseId}. {PHASES[s.phaseId - 1].title}</td>
                      <td>{pct(s.firstTryPassRate)}</td>
                      <td>{s.avgAttempts?.toFixed(1) ?? '—'}</td>
                      <td>{pct(s.completionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link to="/professor/fases" className="small">Ver todas as fases →</Link>
        </section>
        <section className="card" aria-labelledby="perguntas">
          <h2 id="perguntas">Conteúdos para retomar</h2>
          <p className="small muted">Perguntas com mais erros (mínimo de 3 respostas).</p>
          {questions.length === 0 ? (
            <p className="muted">Ainda não há respostas suficientes.</p>
          ) : (
            <ol>
              {questions.map((q) => (
                <li key={`${q.phaseId}-${q.questionId}`}>
                  <strong>Fase {q.phaseId}:</strong> {q.prompt} <span className="badge badge-danger">{pct(q.errorRate)} de erro</span>{' '}
                  <span className="small muted">({q.answered} respostas)</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
