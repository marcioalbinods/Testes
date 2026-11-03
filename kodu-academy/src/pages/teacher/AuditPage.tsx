import { Link } from 'react-router-dom';
import { useTeacherData } from './TeacherData';
import { auditLabel } from './auditLabel';

export function AuditPage() {
  const { data } = useTeacherData();
  const names = new Map(data.students.map((s) => [s.id, s.displayName]));
  const classes = new Map(data.classes.map((c) => [c.id, c.name]));
  return (
    <>
      <p className="muted">Registro das alterações administrativas feitas por você (liberações, mudanças de status, códigos, exclusões).</p>
      {data.audit.length === 0 ? (
        <div className="card muted">Nenhuma alteração registrada ainda.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>Ação</th><th>Aluno / turma</th><th>Fase</th><th>Motivo</th></tr></thead>
            <tbody>
              {data.audit.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.createdAt).toLocaleString('pt-BR')}</td>
                  <td>{auditLabel(a.action)}</td>
                  <td>
                    {a.studentId && names.has(a.studentId) ? (
                      <Link to={`/professor/aluno/${a.studentId}`}>{names.get(a.studentId)}</Link>
                    ) : a.studentId ? (
                      <span className="muted">aluno excluído</span>
                    ) : (
                      classes.get(a.classId ?? '') ?? <span className="muted">—</span>
                    )}
                  </td>
                  <td>{a.phaseId ?? '—'}</td>
                  <td>{a.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
