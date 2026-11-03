import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { useTeacherData } from './TeacherData';
import { useClassFilter } from './useClassFilter';
import { ErrorAlert, Modal, useToast } from '../../components/Feedback';
import { toAppError } from '../../services/errors';
import { downloadText, toCsv } from '../../lib/csv';
import type { CreatedStudent, StudentRow } from '../../services/types';

type Dialog =
  | { kind: 'codes'; title: string; codes: CreatedStudent[]; className: string }
  | { kind: 'rename'; student: StudentRow }
  | { kind: 'move'; student: StudentRow }
  | { kind: 'delete'; student: StudentRow }
  | { kind: 'deleteClass' }
  | { kind: 'renameClass' }
  | null;

export function ManagePage() {
  const { backend } = useApp();
  const { data, reload } = useTeacherData();
  const toast = useToast();
  const [classId, setClassId] = useClassFilter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState(String(new Date().getFullYear()));
  const [names, setNames] = useState('');
  const selected = data.classes.find((c) => c.id === classId) ?? data.classes[0];
  const students = data.students.filter((s) => s.classId === selected?.id);

  async function act(fn: () => Promise<unknown>, okMsg: string) {
    if (!backend) return false;
    setBusy(true);
    setError(null);
    try {
      await fn();
      toast(okMsg, 'ok');
      await reload();
      return true;
    } catch (e) {
      setError(toAppError(e).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function createClass(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return setError('Digite o nome da turma.');
    if (await act(() => backend!.teacher.createClass(newName, newYear || null), 'Turma criada.')) setNewName('');
  }

  async function addStudents(e: FormEvent) {
    e.preventDefault();
    if (!selected || !backend) return;
    const list = names.split('\n').map((n) => n.trim()).filter(Boolean);
    if (!list.length) return setError('Digite pelo menos um nome (um por linha).');
    if (list.length > 100) return setError('Cadastre no máximo 100 alunos por vez.');
    if (list.some((n) => n.length > 60)) return setError('Cada nome pode ter no máximo 60 caracteres.');
    setBusy(true);
    setError(null);
    try {
      const codes = await backend.teacher.createStudents(selected.id, list);
      setNames('');
      setDialog({ kind: 'codes', title: `${codes.length} aluno(s) cadastrado(s)`, codes, className: selected.name });
      await reload();
    } catch (err) {
      setError(toAppError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function resetCode(s: StudentRow) {
    if (!backend || !confirm(`Gerar um novo código para ${s.displayName}? O código antigo deixa de funcionar e as sessões abertas são encerradas. O progresso é mantido.`)) return;
    setBusy(true);
    try {
      const code = await backend.teacher.resetCode(s.id);
      setDialog({ kind: 'codes', title: `Novo código de ${s.displayName}`, codes: [{ id: s.id, displayName: s.displayName, code }], className: selected?.name ?? '' });
      await reload();
    } catch (err) {
      setError(toAppError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ErrorAlert message={error} />
      <div className="grid grid-2">
        <section className="card" aria-labelledby="nova-turma">
          <h2 id="nova-turma">Nova turma</h2>
          <form onSubmit={createClass} className="row" style={{ alignItems: 'end' }}>
            <div className="field" style={{ flex: '2 1 180px', margin: 0 }}>
              <label htmlFor="turma-nome">Nome</label>
              <input id="turma-nome" type="text" maxLength={60} placeholder="Ex.: 7º A" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="field" style={{ flex: '1 1 100px', margin: 0 }}>
              <label htmlFor="turma-ano">Ano letivo</label>
              <input id="turma-ano" type="text" maxLength={20} value={newYear} onChange={(e) => setNewYear(e.target.value)} />
            </div>
            <button className="btn" type="submit" disabled={busy}>Criar</button>
          </form>
        </section>
        <section className="card" aria-labelledby="escolher-turma">
          <h2 id="escolher-turma">Gerenciar turma</h2>
          {data.classes.length === 0 ? (
            <p className="muted">Crie uma turma ao lado.</p>
          ) : (
            <>
              <div className="field">
                <label htmlFor="g-turma">Turma</label>
                <select id="g-turma" value={selected?.id} onChange={(e) => setClassId(e.target.value)}>
                  {data.classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.archived ? ' (arquivada)' : ''}</option>)}
                </select>
              </div>
              <div className="row">
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog({ kind: 'renameClass' })}>Renomear</button>
                <button type="button" className="btn btn-sm btn-ghost" disabled={busy}
                  onClick={() => act(() => backend!.teacher.updateClass(selected!.id, { archived: !selected!.archived }), selected!.archived ? 'Turma reativada.' : 'Turma arquivada.')}>
                  {selected?.archived ? 'Reativar' : 'Arquivar'}
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => setDialog({ kind: 'deleteClass' })}>Excluir turma e dados</button>
              </div>
            </>
          )}
        </section>
      </div>

      {selected && (
        <>
          <section className="card" style={{ marginTop: 16 }} aria-labelledby="add-alunos">
            <h2 id="add-alunos">Cadastrar alunos em {selected.name}</h2>
            <form onSubmit={addStudents}>
              <div className="field">
                <label htmlFor="nomes">Nomes (um por linha)</label>
                <textarea id="nomes" value={names} onChange={(e) => setNames(e.target.value)} placeholder={'Ana S.\nBruno M.\nCarla R.'} aria-describedby="nomes-ajuda" />
                <div id="nomes-ajuda" className="hint-text">
                  Use apenas o necessário para identificar o aluno (ex.: primeiro nome + inicial, ou número de chamada). Não use e-mail nem documentos.
                </div>
              </div>
              <button className="btn" type="submit" disabled={busy}>Cadastrar e gerar códigos</button>
            </form>
          </section>

          <section style={{ marginTop: 16 }} aria-labelledby="lista-alunos">
            <h2 id="lista-alunos">Alunos de {selected.name} ({students.length})</h2>
            {students.length === 0 ? (
              <div className="card muted">Nenhum aluno cadastrado nesta turma.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Aluno</th><th>Situação</th><th>Primeiro acesso</th><th>Ações</th></tr></thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td><Link to={`/professor/aluno/${s.id}`}>{s.displayName}</Link></td>
                        <td>{s.active ? <span className="badge badge-ok">Ativo</span> : <span className="badge badge-locked">Desativado</span>}</td>
                        <td>{s.startedAt ? new Date(s.startedAt).toLocaleDateString('pt-BR') : 'ainda não entrou'}</td>
                        <td>
                          <div className="row" style={{ gap: 6 }}>
                            <button type="button" className="btn btn-sm btn-secondary" disabled={busy} onClick={() => resetCode(s)}>Novo código</button>
                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog({ kind: 'rename', student: s })}>Renomear</button>
                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog({ kind: 'move', student: s })}>Mover</button>
                            <button type="button" className="btn btn-sm btn-ghost" disabled={busy}
                              onClick={() => act(() => backend!.teacher.updateStudent(s.id, { active: !s.active }, s.active ? 'Desativado pelo professor' : 'Reativado pelo professor'), s.active ? 'Aluno desativado.' : 'Aluno reativado.')}>
                              {s.active ? 'Desativar' : 'Reativar'}
                            </button>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => setDialog({ kind: 'delete', student: s })}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {dialog?.kind === 'codes' && <CodesDialog {...dialog} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'rename' && (
        <TextDialog title={`Renomear ${dialog.student.displayName}`} label="Novo nome de exibição" initial={dialog.student.displayName} busy={busy}
          onClose={() => setDialog(null)}
          onSubmit={async (v) => (await act(() => backend!.teacher.updateStudent(dialog.student.id, { displayName: v }, 'Nome alterado'), 'Nome alterado.')) && setDialog(null)} />
      )}
      {dialog?.kind === 'renameClass' && selected && (
        <TextDialog title={`Renomear ${selected.name}`} label="Novo nome da turma" initial={selected.name} busy={busy}
          onClose={() => setDialog(null)}
          onSubmit={async (v) => (await act(() => backend!.teacher.updateClass(selected.id, { name: v }), 'Turma renomeada.')) && setDialog(null)} />
      )}
      {dialog?.kind === 'move' && (
        <Modal title={`Mover ${dialog.student.displayName}`} onClose={() => setDialog(null)}>
          <MoveForm student={dialog.student} classes={data.classes.filter((c) => c.id !== dialog.student.classId)} busy={busy}
            onSubmit={async (cid) => (await act(() => backend!.teacher.updateStudent(dialog.student.id, { classId: cid }, 'Mudança de turma'), 'Aluno movido.')) && setDialog(null)}
            onCancel={() => setDialog(null)} />
        </Modal>
      )}
      {dialog?.kind === 'delete' && (
        <TextDialog danger title={`Excluir ${dialog.student.displayName}?`} label="Motivo da exclusão (fica no histórico, sem o nome do aluno)" initial="" busy={busy}
          note="Isto apaga definitivamente o aluno e todo o progresso, respostas e atividades dele. Para apenas suspender o acesso, use “Desativar”."
          confirmText="Excluir definitivamente"
          onClose={() => setDialog(null)}
          onSubmit={async (v) => (await act(() => backend!.teacher.deleteStudent(dialog.student.id, v), 'Aluno excluído.')) && setDialog(null)} />
      )}
      {dialog?.kind === 'deleteClass' && selected && (
        <TextDialog danger title={`Excluir a turma ${selected.name}?`} label={`Digite o nome da turma (${selected.name}) para confirmar`} initial="" busy={busy}
          note={`Todos os ${students.length} aluno(s) desta turma e seus dados serão apagados definitivamente. Exporte os relatórios antes, se precisar.`}
          confirmText="Excluir turma e dados"
          onClose={() => setDialog(null)}
          onSubmit={async (v) => {
            if (await act(() => backend!.teacher.deleteClass(selected.id, v), 'Turma excluída.')) {
              setClassId('');
              setDialog(null);
            }
          }} />
      )}
    </>
  );
}

function CodesDialog({ title, codes, className, onClose }: { title: string; codes: CreatedStudent[]; className: string; onClose: () => void }) {
  const csv = () => toCsv([['Turma', 'Aluno', 'Código'], ...codes.map((c) => [className, c.displayName, c.code])]);
  return (
    <Modal title={title} onClose={onClose}>
      <div className="alert alert-warn">
        <strong>Anote ou baixe agora:</strong> por segurança, os códigos não podem ser exibidos de novo. Se um aluno perder o código, gere um novo.
      </div>
      <div className="table-wrap">
        <table className="codes-table">
          <thead><tr><th>Aluno</th><th>Código</th></tr></thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id}><td style={{ fontFamily: 'inherit' }}>{c.displayName}</td><td>{c.code}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-secondary" onClick={() => downloadText(`codigos-${className}.csv`, csv())}>Baixar CSV</button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>Imprimir</button>
        <span className="spacer" />
        <button type="button" className="btn" onClick={onClose}>Já guardei os códigos</button>
      </div>
      <p className="small muted">Entregue cada código individualmente. Não exponha a lista em mural ou grupo de mensagens.</p>
    </Modal>
  );
}

function TextDialog(props: {
  title: string; label: string; initial: string; busy: boolean; note?: string; danger?: boolean; confirmText?: string;
  onClose: () => void; onSubmit: (v: string) => void;
}) {
  const [v, setV] = useState(props.initial);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Modal title={props.title} onClose={props.onClose}>
      {props.note && <div className={`alert ${props.danger ? 'alert-error' : 'alert-info'}`}>{props.note}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (v.trim().length < (props.danger ? 3 : 1)) return setErr(props.danger ? 'Preencha este campo (mínimo 3 caracteres).' : 'Preencha este campo.');
          if (v.trim().length > 60 && !props.danger) return setErr('Máximo de 60 caracteres.');
          props.onSubmit(v.trim());
        }}
      >
        <div className="field">
          <label htmlFor="dlg-input">{props.label}</label>
          <input id="dlg-input" type="text" value={v} onChange={(e) => setV(e.target.value)} aria-invalid={Boolean(err)} />
          {err && <div className="hint-text" style={{ color: 'var(--danger)' }}>{err}</div>}
        </div>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={props.onClose}>Cancelar</button>
          <button type="submit" className={`btn ${props.danger ? 'btn-danger' : ''}`} disabled={props.busy}>{props.confirmText ?? 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}

function MoveForm({ student, classes, busy, onSubmit, onCancel }: {
  student: StudentRow; classes: { id: string; name: string }[]; busy: boolean; onSubmit: (classId: string) => void; onCancel: () => void;
}) {
  const [cid, setCid] = useState(classes[0]?.id ?? '');
  if (!classes.length) return <p>Crie outra turma antes de mover {student.displayName}.</p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(cid); }}>
      <div className="field">
        <label htmlFor="mover-para">Mover para</label>
        <select id="mover-para" value={cid} onChange={(e) => setCid(e.target.value)}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <p className="small muted">O progresso do aluno é mantido.</p>
      <div className="row">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn" disabled={busy}>Mover</button>
      </div>
    </form>
  );
}
