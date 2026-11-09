/** Mapa das 20 missões, organizado pelos 4 níveis. */
import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { LEVELS, MISSIONS } from '../data/missions';
import { navigate } from '../lib/router';
import { useProgress } from '../lib/progress';
import { Modal } from './ui';
import type { Mission } from '../data/missionTypes';

export function MissionMap({ compact }: { compact?: boolean }) {
  const { state } = useProgress();
  const [ask, setAsk] = useState<Mission | null>(null);
  const done = (id: string) => !!state.missions[id]?.done;
  const nextIdx = MISSIONS.findIndex((m) => !done(m.id));

  const open = (m: Mission, i: number) => {
    // progressão recomendada: missões depois da próxima pedem confirmação
    if (nextIdx !== -1 && i > nextIdx) setAsk(m);
    else navigate(`/curso/missao/${m.id}`);
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      {LEVELS.map((L) => {
        const ms = MISSIONS.filter((m) => m.level === L.n);
        const count = ms.filter((m) => done(m.id)).length;
        return (
          <div key={L.n} className="map-level" style={{ background: L.soft, border: `2px solid ${L.color}22` }}>
            <h3>
              <span className="chip" style={{ background: L.color, color: '#fff' }}>Nível {L.n}</span>
              {L.name}
              <span className="chip gray" style={{ marginLeft: 'auto' }}>{count}/5</span>
            </h3>
            {!compact && <p className="small muted" style={{ marginTop: -4 }}>{L.desc}</p>}
            <div className="map-path">
              {ms.map((m, j) => {
                const i = MISSIONS.indexOf(m);
                const isDone = done(m.id);
                const isNext = i === nextIdx;
                const locked = nextIdx !== -1 && i > nextIdx;
                return (
                  <div key={m.id} className="row" style={{ gap: 14, flexWrap: 'nowrap' }}>
                    <button
                      className={`map-node ${isDone ? 'done' : ''} ${isNext ? 'next' : ''} ${locked ? 'locked' : ''}`}
                      onClick={() => open(m, i)}
                      style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0 }}
                      aria-label={`Missão ${m.n}: ${m.title}${isDone ? ' (concluída)' : locked ? ' (recomendado fazer as anteriores)' : ''}`}
                    >
                      <span className="dot" style={{ background: L.color }}>
                        {isDone ? <Check size={28} strokeWidth={3} /> : locked ? <Lock size={22} /> : <span aria-hidden>{m.icon}</span>}
                      </span>
                      <span>{String(m.n).padStart(2, '0')} · {m.title}</span>
                    </button>
                    {j < ms.length - 1 && <span className="map-link" aria-hidden />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {ask && (
        <Modal title="Missão mais à frente" onClose={() => setAsk(null)}>
          <p>
            A ordem recomendada é fazer primeiro a <strong>Missão {String(MISSIONS[nextIdx].n).padStart(2, '0')} — {MISSIONS[nextIdx].title}</strong>. Cada missão usa o que você aprendeu nas anteriores.
          </p>
          <div className="row">
            <button className="btn primary" onClick={() => { setAsk(null); navigate(`/curso/missao/${MISSIONS[nextIdx].id}`); }}>Ir para a missão recomendada</button>
            <button className="btn ghost" onClick={() => { const m = ask; setAsk(null); navigate(`/curso/missao/${m.id}`); }}>Abrir mesmo assim</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
