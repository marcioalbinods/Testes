/** Conta do estudante: botão "Entrar", janela de login e indicador de salvamento na turma. */
import { useState, type FormEvent } from 'react';
import { CloudOff, CloudUpload, LogIn, LogOut, UserRound, CheckCircle2, AlertTriangle } from 'lucide-react';
import { currentSession, login, logout, useServer, useSyncState } from '../lib/cloud';
import { Modal } from './ui';
import { Mascot } from '../svg/Mascot';

export function LoginModal({ onClose }: { onClose: () => void }) {
  const [numero, setNumero] = useState('');
  const [senha, setSenha] = useState('');
  const [keep, setKeep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!numero.trim() || !senha.trim()) { setErro('Digite o seu número de acesso e a sua senha.'); return; }
    setBusy(true);
    setErro('');
    try {
      await login(numero, senha, keep);
      window.location.reload();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
      setBusy(false);
    }
  };
  return (
    <Modal title="Entrar na turma Robótica" onClose={onClose} icon={<Mascot size={44} />}>
      <form onSubmit={submit} className="stack" style={{ gap: 12 }}>
        <p className="muted" style={{ margin: 0 }}>Use o número de acesso e a senha que o professor entregou. Assim você continua de onde parou, em qualquer computador.</p>
        <label className="field">Número de acesso
          <input type="text" inputMode="numeric" autoComplete="username" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="ex.: 1001" maxLength={8} autoFocus />
        </label>
        <label className="field">Senha
          <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="ex.: gato427" maxLength={30} autoCapitalize="off" />
        </label>
        <label className="row small" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} style={{ marginTop: 3 }} />
          <span>Continuar conectado depois de fechar o navegador <span className="muted">(só marque no SEU computador ou tablet, nunca nos computadores da escola)</span></span>
        </label>
        {erro && <div className="feedback no" role="alert">{erro}</div>}
        <div className="row">
          <button className="btn primary" type="submit" disabled={busy}><LogIn size={18} /> {busy ? 'Entrando…' : 'Entrar'}</button>
          <button className="btn ghost" type="button" onClick={onClose}>Usar sem conta</button>
        </div>
        <p className="small muted" style={{ margin: 0 }}>Esqueceu a senha? Peça ao professor uma senha nova.</p>
      </form>
    </Modal>
  );
}

/** Botão na barra superior: "Entrar" ou o nome do estudante com o estado do salvamento. */
export function AccountButton() {
  const { url } = useServer();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const sync = useSyncState();
  const s = currentSession();
  if (!url && !s) return null;
  if (!s)
    return (
      <>
        <button className="btn small primary" onClick={() => setOpen(true)}><LogIn size={16} /> Entrar</button>
        {open && <LoginModal onClose={() => setOpen(false)} />}
      </>
    );
  const icon = sync.state === 'saving' || sync.state === 'pending' ? <CloudUpload size={16} /> : sync.state === 'offline' ? <CloudOff size={16} /> : sync.state === 'expired' || sync.state === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />;
  const label = sync.state === 'saving' || sync.state === 'pending' ? 'Salvando…' : sync.state === 'offline' ? 'Sem conexão' : sync.state === 'expired' ? 'Entre de novo' : 'Salvo na turma';
  return (
    <div style={{ position: 'relative' }}>
      <button className={`btn small ${sync.state === 'expired' ? 'warn' : 'ghost'}`} onClick={() => setMenu((m) => !m)} aria-expanded={menu} title={sync.message || label}>
        <UserRound size={16} /> <span className="acc-name">{s.nome} · nº {s.numero}</span> <span className="acc-sync" aria-label={label}>{icon}</span>
      </button>
      {menu && (
        <div className="acc-menu card" role="menu">
          <strong>{s.nome}</strong>
          <span className="small muted">Número {s.numero} · turma {s.turma}</span>
          <span className="small">{icon} {label}</span>
          {sync.message && <span className="small muted">{sync.message}</span>}
          {sync.state === 'expired' ? (
            <button className="btn small primary" onClick={async () => { await logout(); setMenu(false); setOpen(true); }}><LogIn size={16} /> Entrar de novo</button>
          ) : null}
          <button className="btn small ghost" onClick={async () => { await logout(); window.location.reload(); }}><LogOut size={16} /> Sair da conta</button>
        </div>
      )}
      {open && <LoginModal onClose={() => setOpen(false)} />}
    </div>
  );
}

/** Cartão da página inicial convidando a entrar com a conta da turma. */
export function LoginInvite() {
  const { url } = useServer();
  const [open, setOpen] = useState(false);
  const s = currentSession();
  if (!url || s) return null;
  return (
    <section className="card row between" style={{ background: 'linear-gradient(135deg, var(--purple-50), var(--blue-50))', borderColor: 'var(--purple-100)' }}>
      <div className="row" style={{ flexWrap: 'nowrap', flex: 1, minWidth: 260 }}>
        <Mascot size={64} mood="wow" />
        <div>
          <h3 style={{ margin: 0 }}>Você é da turma Robótica?</h3>
          <p style={{ margin: 0 }} className="muted">Entre com seu número e senha para salvar seu progresso e continuar em qualquer computador.</p>
        </div>
      </div>
      <button className="btn primary" onClick={() => setOpen(true)}><LogIn size={18} /> Entrar com número e senha</button>
      {open && <LoginModal onClose={() => setOpen(false)} />}
    </section>
  );
}
