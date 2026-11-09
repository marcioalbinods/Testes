/** Módulo 6 — Enciclopédia dos componentes: catálogo pesquisável com filtros e páginas individuais. */
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Library, Search, ShieldAlert } from 'lucide-react';
import { CATEGORIES, COMPONENTS, type Category } from '../data/components';
import { ComponentArt, Symbol } from '../svg/ComponentArt';
import { Link } from '../lib/router';
import { useProgress } from '../lib/progress';
import { PageHead } from '../components/ui';

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function EncyclopediaPage({ id }: { id?: string }) {
  if (id) return <ComponentPage id={id} />;
  return <Catalog />;
}

function Catalog() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'Todos'>('Todos');
  const list = useMemo(() => {
    const s = strip(q.trim());
    return COMPONENTS.filter((c) => (cat === 'Todos' || c.cats.includes(cat)) && (!s || strip(`${c.name} ${c.short} ${c.func} ${c.keywords ?? ''}`).includes(s)));
  }, [q, cat]);
  return (
    <div className="stack">
      <PageHead icon={<Library size={30} />} color="#0f9a50" title="Enciclopédia dos componentes" subtitle="Consulte cada componente: para que serve, terminais, como conectar e cuidados." />
      <div className="card row" style={{ padding: 14 }}>
        <label className="row" style={{ flex: 1, minWidth: 240, gap: 8 }}>
          <Search size={18} aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar componente (ex.: LED, sensor, motor)…" style={{ flex: 1 }} aria-label="Buscar componente" />
        </label>
      </div>
      <div className="row" style={{ gap: 6 }}>
        {(['Todos', ...CATEGORIES] as const).map((c) => (
          <button key={c} className={`btn small ${cat === c ? 'on' : 'ghost'}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {list.length === 0 && <div className="empty">Nenhum componente encontrado. Tente outra palavra.</div>}
      <div className="grid cols-4">
        {list.map((c) => (
          <Link key={c.id} to={`/enciclopedia/${c.id}`} className="card comp-card">
            <div className="comp-art"><ComponentArt id={c.id} /></div>
            <h3 style={{ margin: 0 }}>{c.name}</h3>
            <p className="small" style={{ margin: 0, color: 'var(--ink-2)' }}>{c.short}</p>
            <div className="row" style={{ gap: 4 }}>{c.cats.map((x) => <span key={x} className="chip gray">{x}</span>)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ComponentPage({ id }: { id: string }) {
  const c = COMPONENTS.find((x) => x.id === id);
  const { markSeen } = useProgress();
  useEffect(() => { if (c) markSeen('encyclopedia', c.id); }, [c, markSeen]);
  if (!c) return <div className="card center"><h2>Componente não encontrado</h2><Link to="/enciclopedia" className="btn primary">Voltar</Link></div>;
  const i = COMPONENTS.indexOf(c);
  const prev = COMPONENTS[i - 1];
  const next = COMPONENTS[i + 1];
  return (
    <div className="stack">
      <Link to="/enciclopedia" className="small"><ArrowLeft size={16} /> Todos os componentes</Link>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="comp-art big"><ComponentArt id={c.id} labels /></div>
          {c.symbol && (
            <div className="mt">
              <h4>Símbolo no esquema elétrico</h4>
              <div className="comp-art" style={{ height: 100, background: '#fff', border: '1px solid var(--line)' }}><Symbol id={c.id} /></div>
            </div>
          )}
        </div>
        <div className="card stack" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 6 }}>{c.cats.map((x) => <span key={x} className="chip purple">{x}</span>)}</div>
          <h1 style={{ margin: 0 }}>{c.name}</h1>
          <p style={{ fontSize: '1.08rem', margin: 0 }}><strong>Função:</strong> {c.func}</p>
          <div>
            <h3>Terminais</h3>
            <table className="t">
              <tbody>{c.terminals.map((t) => <tr key={t.name}><th style={{ width: '38%' }}>{t.name}</th><td>{t.desc}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="grid cols-3">
        <div className="card"><h3>Como conectar</h3><ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 6 }}>{c.connect.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div className="card" style={{ background: 'var(--yellow-50)', borderColor: 'var(--yellow-300)' }}><h3><ShieldAlert size={20} /> Cuidados</h3><ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 6 }}>{c.care.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div className="card"><h3>Exemplos de uso</h3><ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 6 }}>{c.uses.map((x) => <li key={x}>{x}</li>)}</ul>
          <Link to={c.activity.to} className="btn primary mt">Atividade: {c.activity.label} <ArrowRight size={16} /></Link>
        </div>
      </div>
      <div className="row between">
        {prev ? <Link to={`/enciclopedia/${prev.id}`} className="btn ghost"><ArrowLeft size={16} /> {prev.name}</Link> : <span />}
        {next && <Link to={`/enciclopedia/${next.id}`} className="btn ghost">{next.name} <ArrowRight size={16} /></Link>}
      </div>
    </div>
  );
}
