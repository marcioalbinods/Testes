import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTeacherData } from './TeacherData';
import { ClassFilter } from './ClassFilter';
import { useClassFilter } from './useClassFilter';
import { classReportCsv, STATUS_LABEL, summarizeAll, type StudentStatus } from '../../lib/analytics';
import { downloadText } from '../../lib/csv';
import { PHASES } from '../../content/phases';
import { phaseState } from '../../lib/progression';

const STATUS_CLASS: Record<StudentStatus, string> = {
  nao_iniciou: 'badge',
  avancando: 'badge badge-ok',
  precisa_apoio: 'badge badge-danger',
  inativo: 'badge badge-warn',
  concluiu: 'badge badge-info',
  desativado: 'badge badge-locked',
};

export function ClassTrackingPage() {
  const { data } = useTeacherData();
  const [classId, setClassId] = useClassFilter();
  const [q, setQ] = useState('');
  const [phase, setPhase] = useState('');
  const [status, setStatus] = useState('');
  const [view, setView] = useState<'tabela' | 'mapa'>('tabela');
  const all = useMemo(() => summarizeAll(data), [data]);
  const rows = all.filter(
    (s) =>
      (!classId || s.student.classId === classId) &&
      (!q || s.student.displayName.toLowerCase().includes(q.toLowerCase())) &&
      (!phase || (phase === 'done' ? s.status === 'concluiu' : String(s.currentPhase) === phase && s.status !== 'concluiu')) &&
      (!status || s.status === status),
  );
  const className = classId ? data.classes.find((c) => c.id === classId)?.name ?? 'turma' : 'todas-as-turmas';

  return (
    <>
      <div className="filters">
        <ClassFilter classes={data.classes} value={classId} onChange={setClassId} />
        <div className="field">
          <label htmlFor="f-nome">Aluno</label>
          <input id="f-nome" type="search" placeholder="Buscar pelo nome" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-fase">Fase atual</label>
          <select id="f-fase" value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="">Todas</option>
            {PHASES.map((p) => <option key={p.id} value={p.id}>Fase {p.id}</option>)}
            <option value="done">Trilha concluída</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-sit">Situação</label>
          <select id="f-sit" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todas</option>
            {(Object.keys(STATUS_LABEL) as StudentStatus[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
          </select>
        </div>
      </div>
      <div className="row no-print" style={{ marginBottom: 12 }}>
        <span className="muted">{rows.length} aluno(s)</span>
        <span className="spacer" />
        <div role="group" aria-label="Modo de visualização" className="row">
          <button type="button" className={`btn btn-sm ${view === 'tabela' ? '' : 'btn-ghost'}`} aria-pressed={view === 'tabela'} onClick={() => setView('tabela')}>Tabela</button>
          <button type="button" className={`btn btn-sm ${view === 'mapa' ? '' : 'btn-ghost'}`} aria-pressed={view === 'mapa'} onClick={() => setView('mapa')}>Mapa de fases</button>
        </div>
        <button type="button" className="btn btn-sm btn-secondary" disabled={!rows.length}
          onClick={() => downloadText(`relatorio-${className}-${new Date().toISOString().slice(0, 10)}.csv`, classReportCsv(rows))}>
          Exportar CSV
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => window.print()}>Imprimir</button>
      </div>

      {rows.length === 0 ? (
        <div className="card muted">Nenhum aluno encontrado com esses filtros.</div>
      ) : view === 'tabela' ? (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Acompanhamento dos alunos</caption>
            <thead>
              <tr>
                <th>Aluno</th><th>Turma</th><th>Fase atual</th><th>Concluídas</th><th>%</th><th>Última atividade</th><th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.student.id}>
                  <td><Link to={`/professor/aluno/${s.student.id}`}>{s.student.displayName}</Link></td>
                  <td>{s.className}</td>
                  <td>{s.status === 'concluiu' ? '—' : s.currentPhase}</td>
                  <td>{s.completed}/20</td>
                  <td>{s.percent}%</td>
                  <td>{s.lastProgressAt ? new Date(s.lastProgressAt).toLocaleDateString('pt-BR') : 'nunca'}</td>
                  <td>
                    <span className={STATUS_CLASS[s.status]}>{STATUS_LABEL[s.status]}</span>
                    {s.difficultPhases.length > 0 && <div className="small muted">dificuldade: fases {s.difficultPhases.join(', ')}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Mapa de fases por aluno: verde concluída, amarela em andamento, azul disponível, cinza bloqueada</caption>
            <thead><tr><th>Aluno</th><th>Fases 1 → 20</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.student.id}>
                  <td style={{ whiteSpace: 'nowrap' }}><Link to={`/professor/aluno/${s.student.id}`}>{s.student.displayName}</Link></td>
                  <td>
                    <div className="heat" aria-label={`${s.completed} fases concluídas`}>
                      {PHASES.map((p) => {
                        const st = phaseState(p.id, s.progress);
                        const cls = st === 'completed' ? 'c' : st === 'in_progress' ? 'p' : st === 'available' ? 'u' : '';
                        return <span key={p.id} className={cls} title={`Fase ${p.id}: ${st}`} />;
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted" style={{ padding: '0 12px' }}>Verde: concluída · Amarelo: em andamento · Azul: disponível · Cinza: bloqueada.</p>
        </div>
      )}
    </>
  );
}
