/** Central de aprendizagem: progresso, níveis, conquistas, mapa e reinício do progresso. */
import { useState } from 'react';
import { Map as MapIcon, RotateCcw, ShieldCheck, Trophy } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { ACHIEVEMENTS, LEVEL_NAMES, levelFor } from '../data/achievements';
import { LEVELS, MISSIONS } from '../data/missions';
import { GAMES } from '../data/games';
import { ICONS, Modal, PageHead, ProgressBar } from '../components/ui';
import { MissionMap } from '../components/MissionMap';
import { MascotSays } from '../svg/Mascot';
import { Link } from '../lib/router';
import { MODULES } from './Home';

export const GOLDEN_RULES = [
  'Desligue o cabo USB antes de montar ou mudar qualquer ligação.',
  'Fio vermelho para o 5V, fio preto para o GND.',
  'Nunca ligue o 5V direto no GND (curto-circuito).',
  'Todo LED precisa de um resistor.',
  'Motores nunca são ligados direto nos pinos digitais.',
  'Com fonte externa, o GND da fonte vai junto com o GND do Arduino.',
  'Nada de tomada da parede! Só USB ou baterias com o professor.',
  'Confira a montagem com um colega antes de ligar.',
];

export function CentralPage() {
  const { state, reset } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const lvl = levelFor(state.xp);
  const done = MISSIONS.filter((m) => state.missions[m.id]?.done).length;

  return (
    <div className="stack">
      <PageHead icon={<MapIcon size={30} />} color="linear-gradient(135deg,#3a6cf4,#7c4dff)" title="Central de aprendizagem" subtitle="Acompanhe sua evolução: missões, XP, nível e conquistas. Errar e tentar de novo também conta pontos!" />

      <div className="grid cols-2">
        <div className="card">
          <h2>Nível: {lvl.name}</h2>
          <div className="row" style={{ gap: 24, marginBottom: 10 }}>
            <div className="stat"><b>{state.xp}</b><span className="muted small">XP total</span></div>
            <div className="stat"><b>{done}/20</b><span className="muted small">missões</span></div>
            <div className="stat"><b>{state.badges.length}/{ACHIEVEMENTS.length}</b><span className="muted small">conquistas</span></div>
          </div>
          <ProgressBar value={state.xp - lvl.min} max={(lvl.next ?? state.xp + 1) - lvl.min} label="Progresso do nível" />
          <p className="small muted" style={{ marginTop: 6 }}>{lvl.next ? `Faltam ${lvl.next - state.xp} XP para o próximo nível.` : 'Você chegou ao nível máximo!'}</p>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {LEVEL_NAMES.map((n, i) => (
              <span key={n} className={`chip ${i <= lvl.index ? 'purple' : 'gray'}`}>{i + 1}. {n}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Missões por nível</h2>
          <div className="grid" style={{ gap: 10 }}>
            {LEVELS.map((L) => {
              const c = MISSIONS.filter((m) => m.level === L.n && state.missions[m.id]?.done).length;
              return (
                <div key={L.n}>
                  <div className="row between small"><strong>Nível {L.n} · {L.name}</strong><span>{c}/5</span></div>
                  <ProgressBar value={c} max={5} label={`Nível ${L.n}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section>
        <h2>Mapa de missões</h2>
        <MissionMap />
      </section>

      <section className="card">
        <div className="card-title"><Trophy size={22} color="var(--yellow-500)" /><h2>Medalhas e conquistas</h2></div>
        <div className="grid cols-3">
          {ACHIEVEMENTS.map((a) => {
            const got = state.badges.includes(a.id);
            const I = ICONS[a.icon] ?? Trophy;
            return (
              <div key={a.id} className={`badge ${got ? '' : 'locked'}`}>
                <div className="medal" style={{ background: a.color, color: a.color }}><I size={24} color="#fff" /></div>
                <div>
                  <h4>{a.name} {got && '✓'}</h4>
                  <p>{got ? a.description : `Como conseguir: ${a.how}`}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid cols-2">
        <section className="card">
          <h2>Meus jogos</h2>
          <table className="t">
            <thead><tr><th>Jogo</th><th>Recorde</th><th>Partidas</th></tr></thead>
            <tbody>
              {GAMES.map((g) => (
                <tr key={g.id}><td><Link to={`/jogos/${g.id}`}>{g.emoji} {g.title}</Link></td><td>{state.games[g.id]?.best ?? '—'}</td><td>{state.games[g.id]?.plays ?? 0}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card">
          <div className="card-title"><ShieldCheck size={22} color="var(--green-600)" /><h2>Regras de ouro da bancada</h2></div>
          <ul className="list-check">
            {GOLDEN_RULES.map((r) => <li key={r}><ShieldCheck size={18} />{r}</li>)}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2>Atalhos</h2>
        <div className="row">
          {MODULES.map((m) => <Link key={m.to} to={m.to} className="btn ghost small">{m.title}</Link>)}
          <Link to="/glossario" className="btn ghost small">Glossário</Link>
          <Link to="/resistores" className="btn ghost small">Calculadora de resistores</Link>
        </div>
      </section>

      <section className="card tinted">
        <div className="row between">
          <MascotSays mood="think" size={64}>
            Seu progresso fica guardado somente <strong>neste navegador</strong>. Ninguém recebe seus dados. Se outra pessoa for usar este computador, ela pode reiniciar o progresso.
          </MascotSays>
          <button className="btn danger" onClick={() => setConfirm(true)}><RotateCcw size={18} /> Reiniciar progresso</button>
        </div>
      </section>

      {confirm && (
        <Modal title="Reiniciar o progresso?" onClose={() => setConfirm(false)}>
          <p>Isso apaga, <strong>somente neste navegador</strong>, as missões concluídas, o XP, as conquistas, os recordes dos jogos e os programas salvos. Não dá para desfazer.</p>
          <div className="row">
            <button className="btn danger" onClick={() => { reset(); setConfirm(false); }}>Sim, apagar e começar de novo</button>
            <button className="btn ghost" onClick={() => setConfirm(false)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
