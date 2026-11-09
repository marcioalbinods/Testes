/** Página de uma missão: todas as etapas, da introdução à conclusão. */
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Code2, Flag, HelpCircle, Lightbulb, Package, PlayCircle, Target, Wrench } from 'lucide-react';
import { MISSIONS, LEVELS } from '../data/missions';
import type { Mission } from '../data/missionTypes';
import { useLocalState, useProgress } from '../lib/progress';
import { Link, navigate } from '../lib/router';
import { Callout, CodeBlock, Quiz, SafetyBox } from '../components/ui';
import { DemoPlayer } from '../components/DemoPlayer';
import { Bench } from '../components/Bench';
import { ArduinoFind, CodeFill, CodeOrder, ProtoQuiz } from '../components/activities';
import { ArduinoUnoSvg } from '../svg/ArduinoUno';
import { BreadboardSvg } from '../svg/Breadboard';
import { MascotSays } from '../svg/Mascot';
import type { Circuit } from '../lib/circuit/types';
import type { CheckResult } from '../lib/circuit/checks';
import { Presentation } from '../components/Presentation';

export function MissionPage({ id }: { id: string }) {
  const m = MISSIONS.find((x) => x.id === id);
  if (!m)
    return (
      <div className="card center">
        <h2>Missão não encontrada</h2>
        <Link to="/curso" className="btn primary">Ver as missões</Link>
      </div>
    );
  return <MissionView key={m.id} m={m} />;
}

function MissionView({ m }: { m: Mission }) {
  const { state, updateMission, reward, bump } = useProgress();
  const prog = state.missions[m.id] ?? {};
  const level = LEVELS[m.level - 1];
  const idx = MISSIONS.indexOf(m);
  const prev = MISSIONS[idx - 1];
  const next = MISSIONS[idx + 1];
  const [showSolution, setShowSolution] = useState(false);
  const [present, setPresent] = useState(false);

  const activityDone = !!prog.activity;
  const quizDone = !!prog.quiz;
  const canFinish = activityDone && quizDone;

  const onActivity = () => {
    if (!prog.activity) {
      updateMission(m.id, { activity: true });
      reward(`activity:${m.id}`, 30, 'Atividade prática concluída');
    }
  };
  const onQuiz = () => {
    if (!prog.quiz) {
      updateMission(m.id, { quiz: true });
      reward(`quiz:${m.id}`, 20, 'Perguntas respondidas');
    }
  };
  const finish = () => {
    updateMission(m.id, { done: true });
    reward(`mission:${m.id}`, m.xp, `Missão ${String(m.n).padStart(2, '0')} concluída!`);
  };

  const sections = [
    { id: 'objetivo', label: 'Objetivo', icon: <Target size={16} /> },
    { id: 'introducao', label: 'Introdução', icon: <Lightbulb size={16} /> },
    { id: 'materiais', label: 'Materiais e segurança', icon: <Package size={16} /> },
    ...(m.circuit && m.steps ? [{ id: 'montagem', label: 'Demonstração e montagem', icon: <Wrench size={16} /> }] : []),
    ...(m.code ? [{ id: 'programa', label: 'Programação', icon: <Code2 size={16} /> }] : []),
    { id: 'atividade', label: 'Atividade prática', icon: <PlayCircle size={16} />, ok: activityDone },
    { id: 'perguntas', label: 'Perguntas', icon: <HelpCircle size={16} />, ok: quizDone },
    { id: 'desafio', label: 'Desafio final', icon: <Flag size={16} /> },
    { id: 'concluir', label: 'Concluir missão', icon: <CheckCircle2 size={16} />, ok: prog.done },
  ];

  return (
    <div className="mission-layout">
      <nav className="mission-nav" aria-label="Etapas da missão">
        <Link to="/curso" className="small"><ArrowLeft size={16} /> Todas as missões</Link>
        {sections.map((s, i) => (
          <a key={s.id} href={`#/curso/missao/${m.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }} className={s.ok ? 'ok' : ''}>
            <span className="num">{s.ok ? '✓' : i + 1}</span>
            {s.label}
          </a>
        ))}
      </nav>

      <div className="stack" style={{ minWidth: 0 }}>
        <header className="card" style={{ background: `linear-gradient(135deg, ${level.soft}, #fff)` }}>
          <div className="row">
            <span className="chip" style={{ background: level.color, color: '#fff' }}>Nível {m.level} · {level.name}</span>
            <span className="chip gray">Missão {String(m.n).padStart(2, '0')} de 20</span>
            <span className="chip yellow">+{m.xp} XP</span>
            {prog.done && <span className="chip green"><CheckCircle2 size={14} /> Concluída</span>}
          </div>
          <h1 style={{ marginTop: 10 }}><span aria-hidden>{m.icon}</span> {m.title}</h1>
          <section id="objetivo" className="section-anchor">
            <p style={{ fontSize: '1.1rem' }}><strong>Objetivo:</strong> {m.objective}</p>
            <ul className="list-check">
              {m.goals.map((g) => <li key={g}><CheckCircle2 size={18} />{g}</li>)}
            </ul>
          </section>
        </header>

        <section id="introducao" className="card section-anchor">
          <h2><Lightbulb size={22} color="var(--yellow-500)" /> Para começar</h2>
          {m.intro.map((p, i) => <p key={i}>{p}</p>)}
          {m.ideas && (
            <div className="grid cols-3 mt">
              {m.ideas.map((it) => (
                <div key={it.title} className="card flat tinted" style={{ padding: 14 }}>
                  <h4 style={{ fontFamily: 'var(--font-code)', color: 'var(--purple-700)' }}>{it.title}</h4>
                  <p className="small" style={{ margin: 0 }}>{it.text}</p>
                </div>
              ))}
            </div>
          )}
          {m.n === 1 && <div className="proto-stage mt" style={{ maxWidth: 640 }}><ArduinoUnoSvg colorPins /></div>}
          {m.n === 2 && <div className="proto-stage mt"><BreadboardSvg cfg={{ railsSplit: false }} view="paths" /><p className="small muted center" style={{ margin: '6px 0 0' }}>Cada cor mostra um caminho elétrico diferente. Explore mais no <Link to="/protoboard">Laboratório da protoboard</Link>.</p></div>}
        </section>

        <section id="materiais" className="card section-anchor">
          <h2><Package size={22} color="var(--purple-600)" /> Materiais</h2>
          <div className="materials">
            {m.materials.map((x) => (
              <div key={x.item} className="material"><span className="qty">{x.qty}</span><span>{x.item}</span></div>
            ))}
          </div>
          <div className="mt"><SafetyBox items={m.safety} /></div>
        </section>

        {m.circuit && m.steps && (
          <section id="montagem" className="card section-anchor">
            <h2><Wrench size={22} color="var(--blue-600)" /> Demonstração e passo a passo da montagem</h2>
            <p className="muted">Avance os passos e monte junto na sua bancada. A parte nova de cada passo pisca em amarelo.</p>
            <DemoPlayer circuit={m.circuit} steps={m.steps} code={m.code} title={`Missão ${String(m.n).padStart(2, '0')}`} onPresent={() => setPresent(true)} />
          </section>
        )}

        {m.code && (
          <section id="programa" className="card section-anchor">
            <h2><Code2 size={22} color="var(--blue-600)" /> Programação</h2>
            <p>Este é o código completo. Copie e cole no Arduino IDE, clique em ✔ para verificar e em ➜ para enviar à placa.</p>
            <CodeBlock code={m.code} />
            {m.codeExplain && (
              <>
                <h3 className="mt">Entendendo o código</h3>
                <div className="explain-list">
                  {m.codeExplain.map((e) => (
                    <div key={e.code} className="explain-item">
                      <pre>{e.code}</pre>
                      <div>{e.text}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <section id="atividade" className="card section-anchor">
          <h2><PlayCircle size={22} color="var(--green-600)" /> Atividade prática {activityDone && <span className="chip green"><CheckCircle2 size={14} /> feita</span>}</h2>
          <p>{m.activity.intro}</p>
          <ActivityView m={m} done={activityDone} onDone={onActivity} onWrong={() => bump('retries')} />
        </section>

        <section id="perguntas" className="card section-anchor">
          <h2><HelpCircle size={22} color="var(--purple-600)" /> Perguntas de compreensão {quizDone && <span className="chip green"><CheckCircle2 size={14} /> feitas</span>}</h2>
          <p className="muted">Responda todas. Se errar, leia a dica e tente de novo — errar faz parte de aprender!</p>
          <Quiz questions={m.quiz} completed={quizDone} onComplete={onQuiz} onWrong={() => bump('retries')} />
        </section>

        <section id="desafio" className="card section-anchor">
          <h2><Flag size={22} color="var(--orange-500)" /> Desafio final</h2>
          <MascotSays mood="wow"><strong>{m.challenge.text}</strong></MascotSays>
          <Callout kind="tip" title="Dica">{m.challenge.hint}</Callout>
          <div className="row mt">
            {!showSolution ? (
              <button className="btn ghost" onClick={() => setShowSolution(true)}>Já tentei — mostrar uma solução</button>
            ) : (
              <button className="btn ghost" onClick={() => setShowSolution(false)}>Esconder a solução</button>
            )}
            {!prog.challenge && (
              <button className="btn warn" onClick={() => { updateMission(m.id, { challenge: true }); reward(`challenge:${m.id}`, 20, 'Desafio realizado'); }}>
                Fiz o desafio! (+20 XP)
              </button>
            )}
            {prog.challenge && <span className="chip green"><CheckCircle2 size={14} /> Desafio feito</span>}
          </div>
          {showSolution && (
            <div className="stack mt">
              <Callout kind="success" title="Uma solução possível">{m.challenge.solution}</Callout>
              {m.challenge.solutionCode && <CodeBlock code={m.challenge.solutionCode} />}
            </div>
          )}
        </section>

        <section id="concluir" className="section-anchor">
          <div className="complete-box">
            {prog.done ? (
              <>
                <MascotSays mood="party"><strong>Missão concluída! Parabéns!</strong></MascotSays>
                <div className="row mt" style={{ justifyContent: 'center' }}>
                  {next ? <button className="btn primary big" onClick={() => navigate(`/curso/missao/${next.id}`)}>Próxima: Missão {String(next.n).padStart(2, '0')} <ArrowRight size={18} /></button> : <Link to="/central" className="btn primary big">Ver minhas conquistas</Link>}
                </div>
              </>
            ) : (
              <>
                <h2>Concluir a missão</h2>
                <div className="row" style={{ justifyContent: 'center', marginBottom: 12 }}>
                  <span className={`chip ${activityDone ? 'green' : 'gray'}`}>{activityDone ? '✓' : '○'} Atividade prática</span>
                  <span className={`chip ${quizDone ? 'green' : 'gray'}`}>{quizDone ? '✓' : '○'} Perguntas</span>
                </div>
                <button className="btn success big" disabled={!canFinish} onClick={finish}>
                  <CheckCircle2 size={20} /> Concluir missão (+{m.xp} XP)
                </button>
                {!canFinish && <p className="small muted mt">Para concluir, faça a atividade prática e responda todas as perguntas.</p>}
              </>
            )}
          </div>
          <div className="row between mt">
            {prev ? <Link to={`/curso/missao/${prev.id}`} className="btn ghost"><ArrowLeft size={16} /> Missão {String(prev.n).padStart(2, '0')}</Link> : <span />}
            {next && <Link to={`/curso/missao/${next.id}`} className="btn ghost">Missão {String(next.n).padStart(2, '0')} <ArrowRight size={16} /></Link>}
          </div>
        </section>
      </div>
      {present && m.circuit && m.steps && <Presentation mission={m} onClose={() => setPresent(false)} />}
    </div>
  );
}

function ActivityView({ m, done, onDone, onWrong }: { m: Mission; done: boolean; onDone: () => void; onWrong: () => void }) {
  const a = m.activity;
  switch (a.type) {
    case 'arduino-find':
      return <ArduinoFind targets={a.targets} onDone={onDone} done={done} />;
    case 'proto-quiz':
      return <ProtoQuiz items={a.items} onDone={onDone} done={done} />;
    case 'code-order':
      return (
        <div className="stack">
          <CodeOrder lines={a.lines} onDone={onDone} onWrong={onWrong} />
          {m.code && <RunCode m={m} />}
        </div>
      );
    case 'code-fill':
      return (
        <div className="stack">
          <CodeFill template={a.template} onDone={onDone} onWrong={onWrong} />
          {m.code && m.circuit && <RunCode m={m} />}
        </div>
      );
    case 'build':
      return <BuildActivity m={m} done={done} onDone={onDone} />;
    case 'project':
      return <ProjectActivity m={m} done={done} onDone={onDone} />;
  }
}

/** Mostra o programa da missão rodando no simulador (circuito pronto). */
function RunCode({ m }: { m: Mission }) {
  const [open, setOpen] = useState(false);
  const programs = useMemo(() => [{ id: m.id, title: `Programa da Missão ${String(m.n).padStart(2, '0')}`, code: m.code! }], [m]);
  if (!open) return <button className="btn ghost" style={{ width: 'fit-content' }} onClick={() => setOpen(true)}><PlayCircle size={18} /> Ver o programa rodando no simulador</button>;
  return <Bench circuit={m.circuit ?? { parts: [], wires: [] }} editable={false} programs={programs} />;
}

function BuildActivity({ m, done, onDone }: { m: Mission; done: boolean; onDone: () => void }) {
  const a = m.activity as Extract<Mission['activity'], { type: 'build' }>;
  const [circuit, setCircuit] = useLocalState<Circuit>(`montagem:${m.id}`, a.start);
  const [tries, setTries] = useState(0);
  const programs = useMemo(() => (m.code ? [{ id: m.id, title: `Programa da Missão ${String(m.n).padStart(2, '0')}`, code: m.code }] : []), [m]);
  const onCheck = (r: CheckResult) => {
    if (r.ok) onDone();
    else setTries((t) => t + 1);
  };
  return (
    <div className="stack">
      {done && <Callout kind="success">Você já concluiu esta montagem. Pode continuar testando à vontade!</Callout>}
      <Bench circuit={circuit} onChange={setCircuit} palette={a.palette} rules={a.rules} onCheck={onCheck} programs={programs} />
      <div className="row">
        <button className="btn ghost small" onClick={() => setCircuit(a.start)}>Recomeçar a montagem</button>
        {tries >= 2 && <Callout kind="tip" title="Dica do Faísca">{a.hint}</Callout>}
      </div>
    </div>
  );
}

function ProjectActivity({ m, done, onDone }: { m: Mission; done: boolean; onDone: () => void }) {
  const projects = m.projects ?? [];
  const [pid, setPid] = useLocalState<string>('projeto-final:escolha', projects[0]?.id ?? '');
  const p = projects.find((x) => x.id === pid) ?? projects[0];
  return (
    <div className="stack">
      <div className="grid cols-3">
        {projects.map((x) => (
          <button key={x.id} className="card module-card" style={{ textAlign: 'left', cursor: 'pointer', border: x.id === p.id ? '3px solid var(--purple-500)' : undefined }} onClick={() => setPid(x.id)} aria-pressed={x.id === p.id}>
            <h3>{x.title}</h3>
            <p>{x.description}</p>
            <span className="small muted">{x.materials.join(' · ')}</span>
          </button>
        ))}
      </div>
      <Callout kind="info" title="Planejamento">
        <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>
          <li>Qual problema o projeto resolve?</li>
          <li>Quais são as entradas (sensores, botões) e as saídas (LEDs, buzzer, motor)?</li>
          <li>Em quais pinos cada componente vai ser ligado?</li>
          <li>Escreva a lógica em português: "SE... ENTÃO...".</li>
        </ol>
      </Callout>
      <ProjectBench key={p.id} p={p} onDone={onDone} />
      {done && <Callout kind="success">Projeto verificado! Agora prepare a apresentação (veja o desafio final).</Callout>}
    </div>
  );
}

function ProjectBench({ p, onDone }: { p: NonNullable<Mission['projects']>[number]; onDone: () => void }) {
  const [circuit, setCircuit] = useLocalState<Circuit>(`projeto-final:${p.id}`, { parts: [], wires: [] });
  const [showRef, setShowRef] = useState(false);
  const [code, setCode] = useLocalState<string>(`projeto-final:codigo:${p.id}`, p.code);
  const programs = useMemo(() => [{ id: 'meu', title: 'Meu programa do projeto', code }, { id: 'ref', title: 'Programa sugerido', code: p.code }], [code, p.code]);
  const refPrograms = useMemo(() => [{ id: 'ref', title: 'Programa sugerido', code: p.code }], [p.code]);
  return (
    <div className="stack">
      <div className="row">
        <button className="btn ghost" onClick={() => setShowRef((s) => !s)}><ClipboardList size={18} /> {showRef ? 'Esconder' : 'Ver'} a montagem sugerida</button>
        <button className="btn ghost small" onClick={() => setCircuit({ parts: [], wires: [] })}>Limpar minha bancada</button>
        <button className="btn ghost small" onClick={() => setCircuit(p.circuit)}>Começar a partir da montagem sugerida</button>
      </div>
      {showRef && <Bench circuit={p.circuit} editable={false} programs={refPrograms} />}
      <h3>Minha bancada — {p.title}</h3>
      <Bench circuit={circuit} onChange={setCircuit} palette={p.palette} rules={p.rules} programs={programs} onCheck={(r) => r.ok && onDone()} />
      <details>
        <summary className="btn ghost small" style={{ width: 'fit-content' }}>Editar o meu programa do projeto</summary>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} style={{ width: '100%', minHeight: 320, fontFamily: 'var(--font-code)', marginTop: 8 }} aria-label="Código do projeto" />
        <div className="row">
          <button className="btn ghost small" onClick={() => setCode(p.code)}>Voltar ao programa sugerido</button>
        </div>
        <p className="small muted">Para um editor com cores e verificação de erros, use a <Link to="/programacao/editor">Escola de programação</Link>.</p>
      </details>
    </div>
  );
}
