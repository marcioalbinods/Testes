import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { ErrorAlert, Loading } from '../../components/Feedback';
import { toAppError } from '../../services/errors';

export function formatCode(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

export function StudentLoginPage() {
  const { backend, student, setStudent, reloadProgress, studentLoading, teacher } = useApp();
  const { bootError } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };

  if (studentLoading) return <Loading />;
  if (student) return <Navigate to={loc.state?.from ?? '/trilha'} replace />;

  const valid = code.replace('-', '').length === 8;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) {
      setError('O código tem 8 letras e números, no formato XXXX-XXXX.');
      return;
    }
    if (!backend) return;
    setBusy(true);
    setError(null);
    try {
      const profile = await backend.student.login(code);
      setStudent(profile);
      await reloadProgress().catch(() => undefined);
      nav(loc.state?.from ?? '/trilha', { replace: true });
    } catch (err) {
      setError(toAppError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="narrow" style={{ margin: '24px auto', maxWidth: 520 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Área do aluno</h1>
        {teacher && (
          <div className="alert alert-warn">Este navegador está com o painel do professor aberto. Para entrar como aluno, saia do painel antes.</div>
        )}
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="codigo">Seu código de acesso</label>
            <input
              id="codigo"
              className="code-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(formatCode(e.target.value))}
              aria-invalid={Boolean(error)}
              aria-describedby="codigo-ajuda codigo-erro"
            />
            <div id="codigo-ajuda" className="hint-text">
              O professor entrega um código para cada aluno. Ele não diferencia maiúsculas de minúsculas.
            </div>
          </div>
          <div id="codigo-erro">
            <ErrorAlert message={error ?? bootError} />
          </div>
          <button className="btn btn-block" type="submit" disabled={busy || !backend}>
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="small muted" style={{ marginTop: 16 }}>
          Em computador compartilhado, clique em <strong>Sair</strong> no fim da aula. Não compartilhe seu código: ele é como uma senha.
          Esqueceu? Peça um novo ao professor — seu progresso não se perde.
        </p>
        <p className="small">
          <Link to="/privacidade">Como seus dados são protegidos</Link>
        </p>
      </div>
    </div>
  );
}
