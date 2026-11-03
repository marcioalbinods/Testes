import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useApp } from '../state/AppContext';
import { useOnline } from '../lib/useOnline';

export function Layout({ children }: { children: ReactNode }) {
  const { backend, bootError, student, teacher, logoutStudent, logoutTeacher } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const online = useOnline();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  // Move o foco para o conteúdo principal ao trocar de página (leitores de tela),
  // exceto no primeiro carregamento, para o "Pular para o conteúdo" ser o primeiro Tab.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  }, [loc.pathname]);

  return (
    <>
      <a className="skip-link" href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus(); }}>
        Pular para o conteúdo
      </a>
      {backend?.mode === 'demo' && (
        <aside className="banner banner-demo" aria-label="Aviso do modo demonstração">
          <div className="container">
            <strong>Modo demonstração.</strong>
            <span>
              Os dados ficam só neste navegador e não são compartilhados com o professor. Para uso real em sala, o professor precisa
              configurar o banco de dados (veja <Link to="/como-usar#professor">Como usar</Link>).
            </span>
          </div>
        </aside>
      )}
      {bootError && (
        <aside className="banner banner-offline" role="alert">
          <div className="container">
            <strong>Não foi possível conectar ao servidor.</strong> <span>{bootError}</span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => window.location.reload()}>Tentar de novo</button>
          </div>
        </aside>
      )}
      {!online && (
        <aside className="banner banner-offline" role="alert">
          <div className="container">Sem conexão com a internet. O que você fizer agora pode não ser salvo — aguarde a conexão voltar.</div>
        </aside>
      )}
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand">
            <Logo />
            <span>
              Kodu Academy
              <small>Trilha de programação de jogos</small>
            </span>
          </Link>
          <button type="button" className="btn btn-ghost btn-sm menu-toggle" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
            Menu
          </button>
          <nav id="menu" className={`nav ${open ? 'open' : ''}`} aria-label="Principal">
            <NavLink to="/" end>Início</NavLink>
            {student && <NavLink to="/trilha">Minha trilha</NavLink>}
            {student && <NavLink to="/conquistas">Conquistas</NavLink>}
            {student && <NavLink to="/glossario">Glossário</NavLink>}
            {teacher && <NavLink to="/professor">Painel do professor</NavLink>}
            <NavLink to="/como-usar">Como usar</NavLink>
            {student && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={async () => { await logoutStudent(); nav('/'); }}>
                Sair ({student.displayName})
              </button>
            )}
            {teacher && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={async () => { await logoutTeacher(); nav('/'); }}>
                Sair do painel
              </button>
            )}
          </nav>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} style={{ outline: 'none' }}>
        <div className="container">{children}</div>
      </main>
      <footer className="site-footer">
        <div className="container">
          <span>Kodu Academy — plataforma educacional independente, sem publicidade e sem rastreamento.</span>
          <span>
            <Link to="/privacidade">Privacidade e dados</Link> · <Link to="/como-usar">Ajuda</Link>
          </span>
          <span className="small">
            Kodu Game Lab é um software gratuito originalmente criado pela Microsoft Research. Esta plataforma não é afiliada à Microsoft.
          </span>
        </div>
      </footer>
    </>
  );
}
