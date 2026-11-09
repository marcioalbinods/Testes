/** Módulo 7 — Jogos e desafios. Cada jogo tem instruções, feedback imediato, tentativas, dicas, pontuação local e reinício. */
import { useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Gamepad2, Lightbulb, RotateCcw, Trophy } from 'lucide-react';
import { DETECTIVE, GAMES, LOGIC, ORDER_PUZZLES, PREDICT, type GameMeta } from '../data/games';
import { COMPONENTS } from '../data/components';
import { Link } from '../lib/router';
import { useProgress } from '../lib/progress';
import { Callout, CodeBlock, PageHead } from '../components/ui';
import { Bench } from '../components/Bench';
import { CodeOrder } from '../components/activities';
import { ComponentArt } from '../svg/ComponentArt';
import { Breadboard, BreadboardDefs } from '../svg/Breadboard';
import { PartGraphic, PartsDefs } from '../svg/Parts';
import { BB_HEIGHT, BB_WIDTH, holeLabel, parseHole } from '../lib/breadboard';
import { legHoles } from '../lib/circuit/parts';
import { CHALLENGES } from './ProtoLab';
import { MascotSays } from '../svg/Mascot';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export function GamesPage({ id }: { id?: string }) {
  const game = GAMES.find((g) => g.id === id);
  if (game) return <GameShell meta={game} />;
  return <GameList />;
}

function GameList() {
  const { state } = useProgress();
  return (
    <div className="stack">
      <PageHead icon={<Gamepad2 size={30} />} color="#d6456b" title="Jogos e desafios" subtitle="Jogos curtos para treinar o que você aprendeu. Os recordes ficam só no seu navegador — o objetivo é superar você mesmo!" />
      <div className="grid cols-3">
        {GAMES.map((g) => (
          <Link key={g.id} to={`/jogos/${g.id}`} className="card module-card">
            <div style={{ fontSize: 44 }} aria-hidden>{g.emoji}</div>
            <h3>{g.title}</h3>
            <p>{g.short}</p>
            <span className="small muted">{state.games[g.id] ? `Seu recorde: ${state.games[g.id].best} · ${state.games[g.id].plays} partida(s)` : 'Ainda não jogado'}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface GameApi {
  score: number;
  add: (pts: number) => void;
  finish: () => void;
}

function GameShell({ meta }: { meta: GameMeta }) {
  const [round, setRound] = useState(0); // força reinício
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const { recordGame, state, reward } = useProgress();
  const best = state.games[meta.id]?.best ?? 0;
  const api: GameApi = {
    score,
    add: (p) => setScore((s) => s + p),
    finish: () => {
      setOver(true);
      recordGame(meta.id, score);
      reward(`game:${meta.id}`, 30, `Você completou: ${meta.title}`);
    },
  };
  const restart = () => { setRound((r) => r + 1); setScore(0); setOver(false); };
  let body: ReactNode;
  switch (meta.id) {
    case 'detetive': body = <Detective key={round} api={api} />; break;
    case 'onde-conectar': body = <WhereConnect key={round} api={api} />; break;
    case 'organize': body = <Organize key={round} api={api} />; break;
    case 'componente': body = <WhichComponent key={round} api={api} />; break;
    case 'preveja': body = <QuizGame key={round} api={api} items={PREDICT} code />; break;
    case 'logica': body = <QuizGame key={round} api={api} items={LOGIC} />; break;
  }
  return (
    <div className="stack">
      <Link to="/jogos" className="small"><ArrowLeft size={16} /> Todos os jogos</Link>
      <div className="game-head">
        <span style={{ fontSize: 40 }} aria-hidden>{meta.emoji}</span>
        <h1 style={{ margin: 0, flex: 1 }}>{meta.title}</h1>
        <span className="score-pill"><Trophy size={16} /> {score} pontos</span>
        <span className="chip gray">Recorde: {Math.max(best, over ? score : 0)}</span>
        <button className="btn ghost small" onClick={restart}><RotateCcw size={16} /> Reiniciar</button>
      </div>
      <Callout kind="info" title="Como jogar">
        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{meta.instructions.map((i) => <li key={i}>{i}</li>)}</ul>
      </Callout>
      {over ? (
        <div className="complete-box">
          <MascotSays mood="party"><strong>Fim de jogo! Você fez {score} pontos.</strong> {score >= best ? 'Novo recorde pessoal!' : `Seu recorde é ${best}. Tente de novo!`}</MascotSays>
          <div className="row mt" style={{ justifyContent: 'center' }}>
            <button className="btn primary" onClick={restart}><RotateCcw size={16} /> Jogar de novo</button>
            <Link to="/jogos" className="btn ghost">Outros jogos</Link>
          </div>
        </div>
      ) : (
        body
      )}
    </div>
  );
}

function Progress({ i, n }: { i: number; n: number }) {
  return <span className="chip purple">Rodada {Math.min(i + 1, n)} de {n}</span>;
}

/* ----------- 1. Detetive de circuitos ----------- */
function Detective({ api }: { api: GameApi }) {
  const cases = useMemo(() => shuffle(DETECTIVE), []);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [hints, setHints] = useState(0);
  const { bump } = useProgress();
  const c = cases[i];
  const options = useMemo(() => c.options.map((o, k) => ({ o, k })).sort(() => Math.random() - 0.5), [c]);
  const pick = (k: number) => {
    if (solved || wrong.includes(k)) return;
    if (k === c.correct) {
      setSolved(true);
      api.add(wrong.length === 0 ? 2 : wrong.length === 1 ? 1 : 0);
      if (wrong.length) bump('retries');
    } else setWrong((w) => [...w, k]);
  };
  const next = () => {
    if (i + 1 >= cases.length) { api.finish(); return; }
    setI(i + 1); setWrong([]); setSolved(false); setHints(0);
  };
  return (
    <div className="stack">
      <div className="row"><Progress i={i} n={cases.length} /><span className="small muted">Qual é o erro desta montagem?</span></div>
      <div className="card" style={{ padding: 10 }}>
        <Bench circuit={c.circuit} editable={false} bare highlightIds={hints >= 2 || solved ? c.zone : []} />
      </div>
      <div className="grid cols-2">
        {options.map(({ o, k }) => (
          <button key={k} className={`option ${solved && k === c.correct ? 'correct' : ''} ${wrong.includes(k) ? 'wrong' : ''}`} onClick={() => pick(k)} disabled={solved || wrong.includes(k)}>
            <span className="letter">{solved && k === c.correct ? '✓' : wrong.includes(k) ? '✗' : '?'}</span>{o}
          </button>
        ))}
      </div>
      {!solved && (
        <div className="row">
          <button className="btn ghost small" onClick={() => setHints((h) => Math.min(2, h + 1))} disabled={hints >= 2}><Lightbulb size={16} /> Dica {hints < 2 ? `(${hints + 1}/2)` : ''}</button>
          {hints >= 1 && <span className="small">💡 {c.hints[0]}</span>}
          {hints >= 2 && <span className="small">🔦 {c.hints[1]}</span>}
        </div>
      )}
      {wrong.length > 0 && !solved && <div className="feedback no">Ainda não é esse o problema. Observe de novo!</div>}
      {solved && (
        <>
          <div className="feedback ok"><strong>Caso resolvido!</strong> {c.explain}</div>
          <button className="btn primary" style={{ width: 'fit-content' }} onClick={next}>{i + 1 >= cases.length ? 'Ver resultado' : 'Próximo caso'}</button>
        </>
      )}
    </div>
  );
}

/* ----------- 2. Onde devo conectar? ----------- */
function WhereConnect({ api }: { api: GameApi }) {
  const [i, setI] = useState(0);
  const ch = CHALLENGES[i];
  const [sel, setSel] = useState<string[]>([]);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const [fails, setFails] = useState(0);
  const occupied = new Set(ch.parts.flatMap((p) => Object.values(legHoles(p) ?? {})));
  const cfg = { railsSplit: false };
  const click = (id: string) => {
    if (res?.ok) return;
    if (occupied.has(id)) { setRes({ ok: false, text: 'Esse furo já tem uma perna de componente.' }); return; }
    setRes(null);
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= ch.picks.length ? [...s.slice(1), id] : [...s, id]));
  };
  const check = () => {
    if (sel.length < ch.picks.length) { setRes({ ok: false, text: `Escolha ${ch.picks.length} furos.` }); return; }
    const r = ch.check(sel, cfg);
    setRes(r);
    if (r.ok) api.add(fails === 0 ? 3 : 1);
    else setFails((f) => f + 1);
  };
  const next = () => {
    if (i + 1 >= CHALLENGES.length) { api.finish(); return; }
    setI(i + 1); setSel([]); setRes(null); setFails(0);
  };
  const colors = ['#ff9f1c', '#7c4dff'];
  return (
    <div className="stack">
      <div className="row"><Progress i={i} n={CHALLENGES.length} /><strong>{ch.title}</strong></div>
      <MascotSays mood="think" size={60}>{ch.text}</MascotSays>
      <div className="row" style={{ gap: 6 }}>
        {ch.picks.map((p, k) => <span key={p} className="chip" style={{ background: sel[k] ? colors[k] : '#eef1f7', color: sel[k] ? '#fff' : 'var(--ink-3)' }}>{p}: {sel[k] ? holeLabel(sel[k]).replace('furo ', '') : '—'}</span>)}
      </div>
      <div className="proto-stage">
        <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className="svg-fluid">
          <BreadboardDefs />
          <PartsDefs />
          <Breadboard cfg={cfg} holeFill={Object.fromEntries(sel.map((h, k) => [h, colors[k]]))} litNets={fails >= 2 ? ch.hint2(cfg) : []} onHole={click} />
          {ch.parts.map((p) => (
            <g key={p.id} pointerEvents="none"><PartGraphic part={p} legs={Object.fromEntries(Object.entries(legHoles(p)!).map(([k, h]) => [k, parseHole(h)!]))} st={{}} bbBottom={BB_HEIGHT} /></g>
          ))}
        </svg>
      </div>
      <div className="row">
        {!res?.ok && <button className="btn primary" onClick={check}>Verificar</button>}
        {!res?.ok && <button className="btn ghost" onClick={() => { setSel([]); setRes(null); }}>Limpar</button>}
        {res?.ok && <button className="btn primary" onClick={next}>{i + 1 >= CHALLENGES.length ? 'Ver resultado' : 'Próximo'}</button>}
      </div>
      {res && <div className={`feedback ${res.ok ? 'ok' : 'no'}`}>{res.text}</div>}
      {!res?.ok && fails >= 1 && <Callout kind="tip" title={fails >= 2 ? 'Dica forte: o caminho certo está destacado' : 'Dica'}>{ch.hint1}</Callout>}
    </div>
  );
}

/* ----------- 3. Organize o código ----------- */
function Organize({ api }: { api: GameApi }) {
  const [i, setI] = useState(0);
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);
  const p = ORDER_PUZZLES[i];
  const next = () => {
    if (i + 1 >= ORDER_PUZZLES.length) { api.finish(); return; }
    setI(i + 1); setTries(0); setDone(false);
  };
  return (
    <div className="stack">
      <div className="row"><Progress i={i} n={ORDER_PUZZLES.length} /><strong>{p.title}</strong>{tries > 0 && !done && <span className="small muted">Tentativas: {tries}</span>}</div>
      {tries >= 2 && !done && <Callout kind="tip" title="Dica">A primeira linha é sempre a que abre o bloco (com {'"{"'}). {p.lines[0].startsWith('#') ? 'O #include vem antes de tudo.' : ''} Instruções que configuram (pinMode) vêm antes das que agem.</Callout>}
      <CodeOrder key={i} lines={p.lines} onWrong={() => setTries((t) => t + 1)} onDone={() => { if (!done) { setDone(true); api.add(tries === 0 ? 3 : 1); } }} />
      {done && <button className="btn primary" style={{ width: 'fit-content' }} onClick={next}>{i + 1 >= ORDER_PUZZLES.length ? 'Ver resultado' : 'Próximo código'}</button>}
    </div>
  );
}

/* ----------- 4. Qual é o componente? ----------- */
function WhichComponent({ api }: { api: GameApi }) {
  const rounds = useMemo(() => shuffle(COMPONENTS).slice(0, 8), []);
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<'name' | 'func' | 'done'>('name');
  const [wrong, setWrong] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const c = rounds[i];
  const nameOpts = useMemo(() => shuffle([c, ...shuffle(COMPONENTS.filter((x) => x.id !== c.id)).slice(0, 3)]), [c]);
  const funcOpts = useMemo(() => shuffle([c, ...shuffle(COMPONENTS.filter((x) => x.id !== c.id)).slice(0, 2)]), [c]);
  const choose = (id: string) => {
    if (wrong.includes(id)) return;
    if (id === c.id) {
      if (wrong.length === 0) api.add(1);
      setWrong([]);
      setStage(stage === 'name' ? 'func' : 'done');
    } else setWrong((w) => [...w, id]);
  };
  const next = () => {
    if (i + 1 >= rounds.length) { api.finish(); return; }
    setI(i + 1); setStage('name'); setWrong([]); setHint(false);
  };
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="card">
        <Progress i={i} n={rounds.length} />
        <div className="comp-art big mt" style={{ filter: stage === 'name' ? (hint ? 'brightness(0.15) contrast(1.4)' : 'brightness(0)') : 'none', transition: 'filter .4s' }}>
          <ComponentArt id={c.id} />
        </div>
        {stage === 'name' && (
          <button className="btn ghost small mt" onClick={() => setHint(true)} disabled={hint}><Lightbulb size={16} /> Dica: clarear um pouco</button>
        )}
      </div>
      <div className="stack">
        {stage === 'name' && (
          <>
            <h3>Que componente é este?</h3>
            <div className="options">
              {nameOpts.map((o) => <button key={o.id} className={`option ${wrong.includes(o.id) ? 'wrong' : ''}`} onClick={() => choose(o.id)} disabled={wrong.includes(o.id)}><span className="letter">?</span>{o.name}</button>)}
            </div>
          </>
        )}
        {stage === 'func' && (
          <>
            <div className="feedback ok">Isso! É: <strong>{c.name}</strong>.</div>
            <h3>Para que serve?</h3>
            <div className="options">
              {funcOpts.map((o) => <button key={o.id} className={`option ${wrong.includes(o.id) ? 'wrong' : ''}`} onClick={() => choose(o.id)} disabled={wrong.includes(o.id)}><span className="letter">?</span>{o.short}</button>)}
            </div>
          </>
        )}
        {stage === 'done' && (
          <>
            <div className="feedback ok"><strong>{c.name}:</strong> {c.func}</div>
            <div className="row">
              <button className="btn primary" onClick={next}>{i + 1 >= rounds.length ? 'Ver resultado' : 'Próximo'}</button>
              <Link to={`/enciclopedia/${c.id}`} className="btn ghost small">Ver na enciclopédia</Link>
            </div>
          </>
        )}
        {wrong.length > 0 && stage !== 'done' && <div className="feedback no">Não é esse. Tente outra opção!</div>}
      </div>
    </div>
  );
}

/* ----------- 5 e 6. Preveja o resultado / Desafio de lógica ----------- */
function QuizGame({ api, items, code }: { api: GameApi; items: { code?: string; q: string; options: string[]; correct: number; explain: string; hint: string }[]; code?: boolean }) {
  const list = useMemo(() => shuffle(items), [items]);
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const it = list[i];
  const pick = (k: number) => {
    if (solved || wrong.includes(k)) return;
    if (k === it.correct) { setSolved(true); api.add(wrong.length === 0 ? 2 : wrong.length === 1 ? 1 : 0); }
    else setWrong((w) => [...w, k]);
  };
  const next = () => {
    if (i + 1 >= list.length) { api.finish(); return; }
    setI(i + 1); setWrong([]); setSolved(false);
  };
  return (
    <div className={code ? 'grid cols-2' : 'stack'} style={{ alignItems: 'start' }}>
      {code && it.code && <CodeBlock code={it.code} copy={false} />}
      <div className="stack">
        <div className="row"><Progress i={i} n={list.length} /></div>
        <h3>{it.q}</h3>
        <div className="options">
          {it.options.map((o, k) => (
            <button key={k} className={`option ${solved && k === it.correct ? 'correct' : ''} ${wrong.includes(k) ? 'wrong' : ''}`} onClick={() => pick(k)} disabled={solved || wrong.includes(k)}>
              <span className="letter">{String.fromCharCode(65 + k)}</span>{o}
            </button>
          ))}
        </div>
        {wrong.length > 0 && !solved && <div className="feedback no"><strong>Dica:</strong> {it.hint}{wrong.length >= 2 ? ' Elimine as opções que não fazem sentido.' : ''}</div>}
        {solved && (
          <>
            <div className="feedback ok"><strong>Correto!</strong> {it.explain}</div>
            <button className="btn primary" style={{ width: 'fit-content' }} onClick={next}>{i + 1 >= list.length ? 'Ver resultado' : 'Próxima'}</button>
          </>
        )}
      </div>
    </div>
  );
}
