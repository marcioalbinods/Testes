import { useMemo } from 'react';
import { useTeacherData } from './TeacherData';
import { ClassFilter } from './ClassFilter';
import { useClassFilter } from './useClassFilter';
import { filterTeacherData, phaseStats, phaseStatsCsv, questionStats } from '../../lib/analytics';
import { downloadText } from '../../lib/csv';

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);

export function PhaseStatsPage() {
  const { data } = useTeacherData();
  const [classId, setClassId] = useClassFilter();
  const filtered = useMemo(() => filterTeacherData(data, classId || null), [data, classId]);
  const stats = useMemo(() => phaseStats(filtered), [filtered]);
  const questions = useMemo(() => questionStats(filtered.attempts, 1), [filtered]);
  return (
    <>
      <div className="row">
        <div style={{ minWidth: 260 }}>
          <ClassFilter classes={data.classes} value={classId} onChange={setClassId} />
        </div>
        <span className="spacer" />
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => downloadText(`fases-${new Date().toISOString().slice(0, 10)}.csv`, phaseStatsCsv(stats))}>
          Exportar CSV
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Fase</th><th>Chegaram</th><th>Concluíram</th><th>Taxa de conclusão</th><th>Tentativas (média)</th><th>Aprovação 1ª tentativa</th><th>Usaram dica 3</th></tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.phaseId}>
                <td>{s.phaseId}. {s.title}</td>
                <td>{s.reached}</td>
                <td>{s.completed}</td>
                <td>{pct(s.completionRate)}</td>
                <td>{s.avgAttempts?.toFixed(1) ?? '—'}</td>
                <td>{pct(s.firstTryPassRate)}</td>
                <td>{s.hintsLevel3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Perguntas por taxa de erro</h2>
      {questions.length === 0 ? (
        <p className="muted">Ainda não há respostas registradas.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Fase</th><th>Pergunta</th><th>Respostas</th><th>Erros</th></tr></thead>
            <tbody>
              {questions.map((q) => (
                <tr key={`${q.phaseId}-${q.questionId}`}>
                  <td>{q.phaseId}</td><td>{q.prompt}</td><td>{q.answered}</td><td>{pct(q.errorRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
