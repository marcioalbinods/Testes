import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { ErrorAlert, Loading } from '../../components/Feedback';
import { toAppError } from '../../services/errors';

export function TeacherLoginPage() {
  const { backend, teacher, setTeacher, teacherLoading, student } = useApp();
  const { bootError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };

  if (teacherLoading) return <Loading />;
  if (teacher) return <Navigate to={loc.state?.from ?? '/professor'} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const fe: typeof fieldErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) fe.email = 'Digite um e-mail válido.';
    if (password.length < 6) fe.password = 'A senha tem pelo menos 6 caracteres.';
    setFieldErrors(fe);
    if (Object.keys(fe).length || !backend) return;
    setBusy(true);
    setError(null);
    try {
      setTeacher(await backend.teacher.signIn(email, password));
      nav(loc.state?.from ?? '/professor', { replace: true });
    } catch (err) {
      setError(toAppError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ margin: '24px auto', maxWidth: 520 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Área do professor</h1>
        {backend?.mode === 'demo' && (
          <div className="alert alert-warn">
            <strong>Demonstração:</strong> no primeiro acesso, o e-mail e a senha digitados criam uma conta de teste que existe só neste
            navegador. Não use sua senha real.
          </div>
        )}
        {student && <div className="alert alert-info">Há um aluno conectado neste navegador. As duas sessões ficam separadas.</div>}
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-erro' : undefined} />
            {fieldErrors.email && <div id="email-erro" className="hint-text" style={{ color: 'var(--danger)' }}>{fieldErrors.email}</div>}
          </div>
          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'senha-erro' : undefined} />
            {fieldErrors.password && <div id="senha-erro" className="hint-text" style={{ color: 'var(--danger)' }}>{fieldErrors.password}</div>}
          </div>
          <ErrorAlert message={error ?? bootError} />
          <button className="btn btn-block" type="submit" disabled={busy || !backend}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="small muted" style={{ marginTop: 16 }}>
          Contas de professor são criadas pelo administrador no Supabase (não há cadastro público). Esqueceu a senha? Peça ao administrador
          para redefini-la em Authentication → Users.
        </p>
      </div>
    </div>
  );
}
