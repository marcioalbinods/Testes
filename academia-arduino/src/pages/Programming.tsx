/** Módulo 5 — Escola de programação: comandos, blocos, editor e "O que acontece se...?". */
import { useState } from 'react';
import { Blocks, BookOpen, Code2, HelpCircle, PenLine } from 'lucide-react';
import { COMMANDS, type CommandInfo } from '../data/commands';
import { navigate } from '../lib/router';
import { useProgress } from '../lib/progress';
import { CodeBlock, PageHead, QuestionCard, Tabs } from '../components/ui';
import { BlockEditor } from '../components/BlockEditor';
import { CodeEditor } from '../components/CodeEditor';
import { WhatIf } from '../components/WhatIf';
import { CodeFill } from '../components/activities';

type Tab = 'comandos' | 'blocos' | 'editor' | 'exercicios' | 'e-se';

export const FILL_EXERCISES: { title: string; template: string }[] = [
  { title: 'Pisca-pisca', template: 'void [[setup]]() {\n  pinMode(13, [[OUTPUT]]);\n}\n\nvoid [[loop]]() {\n  digitalWrite(13, [[HIGH]]);\n  delay(1000);\n  digitalWrite(13, [[LOW]]);\n  delay(1000);\n}' },
  { title: 'Botão com INPUT_PULLUP', template: 'void setup() {\n  pinMode(2, [[INPUT_PULLUP]]);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  if ([[digitalRead]](2) [[==]] LOW) {\n    digitalWrite(13, HIGH);\n  } [[else]] {\n    digitalWrite(13, LOW);\n  }\n}' },
  { title: 'Ler o potenciômetro', template: 'void setup() {\n  Serial.[[begin]](9600);\n}\n\nvoid loop() {\n  int valor = [[analogRead]](A0);\n  Serial.println([[valor]]);\n  delay(200);\n}' },
  { title: 'Repetir 5 vezes', template: 'void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i < [[5]]; i[[++|+=1]]) {\n    digitalWrite(13, HIGH);\n    delay(200);\n    digitalWrite(13, LOW);\n    delay(200);\n  }\n  delay(2000);\n}' },
  { title: 'Tocar uma nota', template: 'void setup() {\n  pinMode(8, OUTPUT);\n}\n\nvoid loop() {\n  [[tone]](8, 440);\n  delay(300);\n  [[noTone]](8);\n  delay(700);\n}' },
];

export function ProgrammingPage({ tab: routeTab }: { tab?: string }) {
  const tab: Tab = (['comandos', 'blocos', 'editor', 'exercicios', 'e-se'] as Tab[]).includes(routeTab as Tab) ? (routeTab as Tab) : 'comandos';
  return (
    <div className="stack">
      <PageHead icon={<Code2 size={30} />} color="#2453d6" title="Escola de programação" subtitle="Aprenda os comandos do Arduino, programe com blocos, escreva código de verdade e descubra o que acontece quando você muda os valores." />
      <Tabs
        value={tab}
        onChange={(t) => navigate(`/programacao/${t}`)}
        tabs={[
          { id: 'comandos', label: 'Aprenda os comandos', icon: <BookOpen size={16} /> },
          { id: 'blocos', label: 'Programação por blocos', icon: <Blocks size={16} /> },
          { id: 'editor', label: 'Editor de código', icon: <Code2 size={16} /> },
          { id: 'exercicios', label: 'Complete o código', icon: <PenLine size={16} /> },
          { id: 'e-se', label: 'O que acontece se…?', icon: <HelpCircle size={16} /> },
        ]}
      />
      {tab === 'comandos' && <Commands />}
      {tab === 'blocos' && <BlockEditor />}
      {tab === 'editor' && <CodeEditor />}
      {tab === 'exercicios' && <FillExercises />}
      {tab === 'e-se' && <WhatIf />}
    </div>
  );
}

function Commands() {
  const [id, setId] = useState(COMMANDS[0].id);
  const c = COMMANDS.find((x) => x.id === id)!;
  const groups = [...new Set(COMMANDS.map((x) => x.group))];
  const { markSeen } = useProgress();
  return (
    <div className="split side-left">
      <nav className="card" aria-label="Comandos" style={{ padding: 12 }}>
        {groups.map((g) => (
          <div key={g} style={{ marginBottom: 10 }}>
            <div className="small muted" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, marginBottom: 4 }}>{g}</div>
            <div className="row" style={{ gap: 6 }}>
              {COMMANDS.filter((x) => x.group === g).map((x) => (
                <button key={x.id} className={`btn small ${x.id === id ? 'on' : 'ghost'}`} style={{ fontFamily: 'var(--font-code)' }} onClick={() => { setId(x.id); markSeen('commands', x.id); }}>{x.name}</button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <CommandDetail key={c.id} c={c} />
    </div>
  );
}

function CommandDetail({ c }: { c: CommandInfo }) {
  const { reward, bump } = useProgress();
  return (
    <article className="card stack" style={{ gap: 12 }}>
      <div className="row"><span className="chip purple">{c.group}</span></div>
      <h2 style={{ fontFamily: 'var(--font-code)', margin: 0 }}>{c.name}</h2>
      <p style={{ fontSize: '1.08rem', margin: 0 }}>{c.explain}</p>
      <div className="grid cols-2">
        <div><h4>Sintaxe (como se escreve)</h4><CodeBlock code={c.syntax} copy={false} /></div>
        <div><h4>Exemplo</h4><CodeBlock code={c.example} /></div>
      </div>
      <div className="callout tip"><strong>Situação prática:</strong>&nbsp;{c.situation}</div>
      <div>
        <h4>Exercício</h4>
        <QuestionCard question={c.exercise} onResult={(ok) => ok && reward(`cmd:${c.id}`, 5)} onWrong={() => bump('retries')} />
      </div>
    </article>
  );
}

function FillExercises() {
  const [i, setI] = useState(0);
  const { reward, bump } = useProgress();
  const ex = FILL_EXERCISES[i];
  return (
    <div className="stack">
      <p>Partes do código estão faltando. Complete as lacunas e clique em <strong>Conferir</strong>. Atenção às letras maiúsculas!</p>
      <div className="row" style={{ gap: 6 }}>
        {FILL_EXERCISES.map((e, k) => <button key={e.title} className={`btn small ${k === i ? 'on' : 'ghost'}`} onClick={() => setI(k)}>{k + 1}. {e.title}</button>)}
      </div>
      <div className="card">
        <h3>{ex.title}</h3>
        <CodeFill key={i} template={ex.template} onDone={() => reward(`fill:${i}`, 15, 'Código completo!')} onWrong={() => bump('retries')} />
      </div>
    </div>
  );
}
