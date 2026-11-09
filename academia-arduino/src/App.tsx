/** Estrutura geral: menu lateral, barra superior, rotas e notificações. */
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import {
  Award, BookOpen, Calculator, CircuitBoard, Code2, Cpu, Gamepad2, GraduationCap, Grid3x3, Home, Library, Map as MapIcon, Menu, Presentation, Zap,
} from 'lucide-react';
import { Link, useRoute } from './lib/router';
import { useProgress } from './lib/progress';
import { levelFor } from './data/achievements';
import { Mascot } from './svg/Mascot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/Home';
import { CentralPage } from './pages/Central';
import { CoursePage } from './pages/Course';
import { MissionPage } from './pages/Mission';
import { ArduinoPage } from './pages/ArduinoModule';
import { ProtoLabPage } from './pages/ProtoLab';
import { CircuitLabPage } from './pages/CircuitLab';
import { EncyclopediaPage } from './pages/Encyclopedia';
import { GlossaryPage } from './pages/Glossary';
import { ResistorsPage } from './pages/Resistors';
import { GamesPage } from './pages/Games';
import { TeacherPage } from './pages/Teacher';

const ProgrammingPage = lazy(() => import('./pages/Programming').then((m) => ({ default: m.ProgrammingPage })));

interface NavItem { to: string; label: string; icon: ReactNode; match: string }
const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Aprender',
    items: [
      { to: '/', label: 'Início', icon: <Home size={18} />, match: '' },
      { to: '/central', label: 'Central de aprendizagem', icon: <MapIcon size={18} />, match: 'central' },
      { to: '/curso', label: 'Curso de Arduino', icon: <GraduationCap size={18} />, match: 'curso' },
    ],
  },
  {
    group: 'Laboratórios',
    items: [
      { to: '/arduino', label: 'Conheça o Arduino', icon: <Cpu size={18} />, match: 'arduino' },
      { to: '/protoboard', label: 'Laboratório de protoboard', icon: <Grid3x3 size={18} />, match: 'protoboard' },
      { to: '/circuitos', label: 'Laboratório de circuitos', icon: <CircuitBoard size={18} />, match: 'circuitos' },
      { to: '/programacao', label: 'Escola de programação', icon: <Code2 size={18} />, match: 'programacao' },
    ],
  },
  {
    group: 'Consultar e jogar',
    items: [
      { to: '/enciclopedia', label: 'Enciclopédia', icon: <Library size={18} />, match: 'enciclopedia' },
      { to: '/resistores', label: 'Calculadora de resistores', icon: <Calculator size={18} />, match: 'resistores' },
      { to: '/glossario', label: 'Glossário', icon: <BookOpen size={18} />, match: 'glossario' },
      { to: '/jogos', label: 'Jogos e desafios', icon: <Gamepad2 size={18} />, match: 'jogos' },
    ],
  },
  { group: 'Professor', items: [{ to: '/professor', label: 'Espaço do professor', icon: <Presentation size={18} />, match: 'professor' }] },
];

const TITLES: Record<string, string> = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.match, i.label])));

export default function App() {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const { state, toasts, dismiss, storageOk } = useProgress();
  const lvl = levelFor(state.xp);
  const section = route[0] ?? '';

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [route.join('/')]);

  useEffect(() => {
    document.title = `${TITLES[section] && section ? TITLES[section] + ' · ' : ''}Academia de Arduino`;
  }, [section]);

  let page: ReactNode;
  switch (section) {
    case '': page = <HomePage />; break;
    case 'central': page = <CentralPage />; break;
    case 'curso': page = route[1] === 'missao' && route[2] ? <MissionPage id={route[2]} /> : <CoursePage />; break;
    case 'arduino': page = <ArduinoPage />; break;
    case 'protoboard': page = <ProtoLabPage />; break;
    case 'circuitos': page = <CircuitLabPage tab={route[1]} />; break;
    case 'programacao': page = <ProgrammingPage tab={route[1]} />; break;
    case 'enciclopedia': page = <EncyclopediaPage id={route[1]} />; break;
    case 'resistores': page = <ResistorsPage />; break;
    case 'glossario': page = <GlossaryPage />; break;
    case 'jogos': page = <GamesPage id={route[1]} />; break;
    case 'professor': page = <TeacherPage sub={route[1]} id={route[2]} />; break;
    default: page = <NotFound />;
  }
  const wide = ['circuitos', 'programacao', 'protoboard'].includes(section) || (section === 'curso' && route[1] === 'missao');

  return (
    <div className="app">
      <nav className={`sidebar ${open ? 'open' : ''}`} aria-label="Menu principal">
        <Link to="/" className="brand">
          <Mascot size={48} />
          <span className="brand-name">
            ACADEMIA DE ARDUINO
            <small>Aprenda, conecte, programe e invente!</small>
          </span>
        </Link>
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="nav-group">{g.group}</div>
            {g.items.map((i) => (
              <Link key={i.to} to={i.to} className={`nav-link ${section === i.match ? 'active' : ''}`} aria-current={section === i.match ? 'page' : undefined}>
                <span className="nav-ico">{i.icon}</span>
                {i.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="sidebar-foot">
          <Link to="/central" className="nav-link" style={{ background: 'rgba(255,255,255,.06)' }}>
            <span className="nav-ico"><Award size={18} /></span>
            <span style={{ lineHeight: 1.2 }}>
              {lvl.name}
              <small style={{ display: 'block', fontWeight: 400, color: '#b8c2ff' }}>{state.xp} XP · {state.badges.length} conquistas</small>
            </span>
          </Link>
        </div>
      </nav>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="btn icon ghost menu-btn" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <div className="crumbs">{section ? TITLES[section] ?? 'Academia de Arduino' : 'Academia de Arduino'}</div>
          <Link to="/central" className="chip yellow" style={{ textDecoration: 'none' }} aria-label={`Nível ${lvl.name}, ${state.xp} pontos de experiência`}>
            <Zap size={14} /> {state.xp} XP
          </Link>
        </header>
        {!storageOk && (
          <div className="callout safety" style={{ margin: '12px 24px 0' }}>
            Este navegador está bloqueando o armazenamento local: o progresso vale só enquanto a página estiver aberta.
          </div>
        )}
        <main className={`content ${wide ? 'wide' : ''}`} id="conteudo">
          <ErrorBoundary key={route.join('/')}>
            <Suspense fallback={<div className="empty">Carregando…</div>}>{page}</Suspense>
          </ErrorBoundary>
        </main>
        <footer className="footer">
          Academia de Arduino · Academia do Arduino do Prof. Márcio · Sem cadastro: o progresso fica salvo somente neste navegador.
        </footer>
      </div>
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind === 'badge' ? 'badge' : ''}`} onClick={() => dismiss(t.id)} role="status">
            <span style={{ fontSize: 26 }}>{t.kind === 'badge' ? '🏅' : t.kind === 'xp' ? '⚡' : 'ℹ️'}</span>
            <div>
              <strong>{t.title}</strong>
              {t.text && <div className="small">{t.text}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="card center" style={{ padding: 40 }}>
      <Mascot size={110} mood="think" />
      <h2>Página não encontrada</h2>
      <p>Esse caminho não existe na Academia.</p>
      <Link to="/" className="btn primary">Voltar ao início</Link>
    </div>
  );
}
