/** Página inicial: apresentação, mapa de aprendizagem, módulos, progresso, laboratórios, desafios e conquistas. */
import { ArrowRight, BookOpen, Calculator, CircuitBoard, Code2, Cpu, Gamepad2, GraduationCap, Grid3x3, Library, Map as MapIcon, Presentation, Rocket, Trophy } from 'lucide-react';
import { Link, navigate } from '../lib/router';
import { currentSession } from '../lib/cloud';
import { useProgress } from '../lib/progress';
import { MISSIONS } from '../data/missions';
import { ACHIEVEMENTS, levelFor } from '../data/achievements';
import { Mascot } from '../svg/Mascot';
import { ProgressBar, ICONS } from '../components/ui';
import { MissionMap } from '../components/MissionMap';
import { GAMES } from '../data/games';
import { LoginInvite } from '../components/Account';

export function nextMission(done: (id: string) => boolean) {
  return MISSIONS.find((m) => !done(m.id)) ?? null;
}

export const MODULES = [
  { to: '/central', icon: <MapIcon size={26} />, color: '#3a6cf4', title: 'Central de aprendizagem', text: 'Seu progresso, mapa das missões e conquistas.' },
  { to: '/curso', icon: <GraduationCap size={26} />, color: '#7c4dff', title: 'Curso de Arduino', text: '20 missões em 4 níveis, do zero ao projeto final.' },
  { to: '/protoboard', icon: <Grid3x3 size={26} />, color: '#16b862', title: 'Laboratório de protoboard', text: 'Descubra como os furos são ligados por dentro.' },
  { to: '/circuitos', icon: <CircuitBoard size={26} />, color: '#f76b15', title: 'Laboratório de circuitos', text: 'Monte, ligue e veja o caminho da eletricidade.' },
  { to: '/programacao', icon: <Code2 size={26} />, color: '#2453d6', title: 'Escola de programação', text: 'Comandos, blocos, editor e "o que acontece se…?"' },
  { to: '/enciclopedia', icon: <Library size={26} />, color: '#0f9a50', title: 'Enciclopédia', text: '16 componentes com terminais, ligação e cuidados.' },
  { to: '/jogos', icon: <Gamepad2 size={26} />, color: '#d6456b', title: 'Jogos e desafios', text: 'Detetive de circuitos, organize o código e mais.' },
  { to: '/professor', icon: <Presentation size={26} />, color: '#5524c9', title: 'Espaço do professor', text: 'Guia, respostas e modo de apresentação.' },
];

export function HomePage() {
  const { state } = useProgress();
  const doneCount = MISSIONS.filter((m) => state.missions[m.id]?.done).length;
  const next = nextMission((id) => !!state.missions[id]?.done);
  const lvl = levelFor(state.xp);
  const started = doneCount > 0 || state.xp > 0;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className="hero">
        <div>
          <span className="chip yellow" style={{ marginBottom: 12 }}>Laboratório de invenções</span>
          <h1>ACADEMIA DE ARDUINO</h1>
          <div className="sub">Aprenda, conecte, programe e invente!</div>
          <p>
            Aqui você descobre como funciona a placa Arduino, monta circuitos na protoboard, programa LEDs, sons, motores e sensores — e entende <strong>por que</strong> cada coisa funciona.
          </p>
          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn big" onClick={() => navigate(next ? `/curso/missao/${next.id}` : '/curso')}>
              <Rocket size={20} /> {started ? (next ? `Continuar: Missão ${String(next.n).padStart(2, '0')}` : 'Rever o curso') : 'Começar a aprender'}
            </button>
            <Link to="/circuitos" className="btn ghost big">Ir para a bancada</Link>
          </div>
        </div>
        <div className="hero-art">
          <Mascot size={210} mood="happy" />
        </div>
      </section>

      <LoginInvite />

      <section className="grid cols-2">
        <div className="card">
          <div className="card-title"><Trophy size={22} color="var(--yellow-500)" /><h2>Meu progresso</h2></div>
          <div className="row" style={{ gap: 28, marginBottom: 12 }}>
            <div className="stat"><b>{doneCount}/20</b><span className="muted small">missões</span></div>
            <div className="stat"><b>{state.xp}</b><span className="muted small">XP</span></div>
            <div className="stat"><b>{state.badges.length}</b><span className="muted small">conquistas</span></div>
          </div>
          <div className="small muted" style={{ marginBottom: 4 }}>Nível: <strong style={{ color: 'var(--purple-700)' }}>{lvl.name}</strong></div>
          <ProgressBar value={state.xp - lvl.min} max={(lvl.next ?? state.xp + 1) - lvl.min} label="Progresso do nível" />
          <p className="small muted mt">{currentSession() ? `Salvo na conta nº ${currentSession()!.numero} da turma ${currentSession()!.turma}.` : 'Sem conta, tudo fica salvo só neste navegador.'}</p>
        </div>
        <div className="card">
          <div className="card-title"><BookOpen size={22} color="var(--blue-600)" /><h2>Como funciona</h2></div>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 6 }}>
            <li>Siga as <strong>missões</strong> em ordem: cada uma ensina uma coisa nova.</li>
            <li>Veja a <strong>demonstração</strong> e monte na bancada de verdade, passo a passo.</li>
            <li>Teste na <strong>bancada virtual</strong>, responda às perguntas e conclua.</li>
            <li>Ganhe <strong>XP e medalhas</strong> pelo seu esforço!</li>
          </ol>
        </div>
      </section>

      <section>
        <div className="row between mb">
          <h2 style={{ margin: 0 }}>Mapa de aprendizagem</h2>
          <Link to="/curso" className="btn small ghost">Ver todas as missões <ArrowRight size={16} /></Link>
        </div>
        <MissionMap compact />
      </section>

      <section>
        <h2>Módulos da Academia</h2>
        <div className="grid cols-4">
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to} className="card module-card">
              <div className="mc-ico" style={{ background: m.color }}>{m.icon}</div>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
              <span className="go">Abrir <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid cols-2">
        <div className="card">
          <div className="card-title"><CircuitBoard size={22} color="var(--orange-500)" /><h2>Laboratórios interativos</h2></div>
          <div className="grid" style={{ gap: 10 }}>
            <LabLink to="/arduino" icon={<Cpu size={20} />} title="Arduino interativo" text="Clique nas partes da placa e explore os pinos." />
            <LabLink to="/protoboard" icon={<Grid3x3 size={20} />} title="Laboratório da protoboard" text="Veja por dentro e teste as conexões." />
            <LabLink to="/circuitos/monte" icon={<CircuitBoard size={20} />} title="Monte seu circuito" text="Bancada virtual com verificação da montagem." />
            <LabLink to="/circuitos/caminho" icon={<Rocket size={20} />} title="Caminho da eletricidade" text="Animação da corrente em circuitos abertos e fechados." />
            <LabLink to="/resistores" icon={<Calculator size={20} />} title="Calculadora de resistores" text="Cores das faixas e resistor para LED." />
          </div>
        </div>
        <div className="card">
          <div className="card-title"><Gamepad2 size={22} color="#d6456b" /><h2>Área de desafios</h2></div>
          <div className="grid" style={{ gap: 10 }}>
            {GAMES.map((g) => (
              <LabLink key={g.id} to={`/jogos/${g.id}`} icon={<span style={{ fontSize: 20 }}>{g.emoji}</span>} title={g.title} text={`${g.short}${state.games[g.id] ? ` · recorde: ${state.games[g.id].best}` : ''}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="row between mb">
          <div className="card-title" style={{ margin: 0 }}><Trophy size={22} color="var(--yellow-500)" /><h2>Conquistas</h2></div>
          <Link to="/central" className="btn small ghost">Ver todas <ArrowRight size={16} /></Link>
        </div>
        <div className="grid cols-4">
          {ACHIEVEMENTS.slice(0, 8).map((a) => {
            const got = state.badges.includes(a.id);
            const I = ICONS[a.icon] ?? Trophy;
            return (
              <div key={a.id} className={`badge ${got ? '' : 'locked'}`}>
                <div className="medal" style={{ background: a.color, color: a.color }}><I size={24} color="#fff" /></div>
                <div>
                  <h4>{a.name}</h4>
                  <p>{got ? a.description : a.how}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function LabLink({ to, icon, title, text }: { to: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="row" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 14, padding: '10px 12px', gap: 12, flexWrap: 'nowrap' }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--blue-50)', color: 'var(--blue-700)', display: 'grid', placeItems: 'center', flex: '0 0 38px' }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <strong style={{ fontFamily: 'var(--font-head)' }}>{title}</strong>
        <span className="small muted" style={{ display: 'block' }}>{text}</span>
      </span>
      <ArrowRight size={18} color="var(--blue-600)" />
    </Link>
  );
}
