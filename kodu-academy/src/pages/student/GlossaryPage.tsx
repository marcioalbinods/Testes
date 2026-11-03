import { useState } from 'react';
import { GLOSSARY } from '../../content/glossary';
import { PHASES } from '../../content/phases';
import { useApp } from '../../state/AppContext';
import { isUnlocked } from '../../lib/progression';

export function GlossaryPage() {
  const { progress } = useApp();
  const [q, setQ] = useState('');
  const maxUnlocked = Math.max(...PHASES.filter((p) => isUnlocked(p.id, progress)).map((p) => p.id));
  const terms = [...GLOSSARY].sort((a, b) => a.phase - b.phase);
  const filtered = terms.filter((t) => (t.term + ' ' + t.definition).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="narrow" style={{ margin: '0 auto' }}>
      <h1>Glossário</h1>
      <p className="muted">Os termos aparecem conforme você avança na trilha.</p>
      <div className="field">
        <label htmlFor="busca">Buscar termo</label>
        <input id="busca" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <dl>
        {filtered.map((t) =>
          t.phase <= maxUnlocked ? (
            <div key={t.id} className="card" style={{ marginBottom: 10 }}>
              <dt style={{ fontWeight: 800 }}>
                {t.term} <span className="badge">fase {t.phase}</span>
              </dt>
              <dd style={{ margin: '6px 0 0' }}>
                {t.definition}
                {t.example && <div className="small muted">Exemplo: {t.example}</div>}
              </dd>
            </div>
          ) : (
            <div key={t.id} className="card" style={{ marginBottom: 10, background: 'var(--surface-2)' }}>
              <dt>🔒 Termo da fase {t.phase}</dt>
              <dd style={{ margin: 0 }} className="small muted">Disponível quando a fase {t.phase} for liberada.</dd>
            </div>
          ),
        )}
      </dl>
    </div>
  );
}
