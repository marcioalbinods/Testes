/** Espaço do professor: guia, missões com respostas, códigos, dificuldades comuns e modo de apresentação. */
import { useState } from 'react';
import { ArrowLeft, BookOpenCheck, Clock, MonitorPlay, Package, Presentation as PresIcon, Printer, ShieldCheck } from 'lucide-react';
import { LEVELS, MISSIONS } from '../data/missions';
import type { Mission } from '../data/missionTypes';
import { Link } from '../lib/router';
import { Callout, CodeBlock, PageHead, Tabs } from '../components/ui';
import { Presentation } from '../components/Presentation';
import { GOLDEN_RULES } from './Central';
import { CHALLENGES } from './ProtoLab';
import { ClassPanel } from '../components/ClassPanel';

export function TeacherPage({ sub, id }: { sub?: string; id?: string }) {
  if (sub === 'missao' && id) {
    const m = MISSIONS.find((x) => x.id === id);
    if (m) return <TeacherMission m={m} />;
  }
  return <TeacherHome />;
}

const KIT = [
  ['Arduino Uno R3 + cabo USB', '1 por dupla'],
  ['Protoboard de 400 ou 830 pontos', '1 por dupla'],
  ['Jumpers macho-macho (cores variadas)', '20 por dupla'],
  ['LEDs (vermelho, amarelo, verde, azul, branco)', '6 por dupla'],
  ['Resistores 220 Ω (ou 330 Ω)', '6 por dupla'],
  ['Resistores 100 Ω e 10 kΩ', '2 de cada por dupla'],
  ['Push buttons 6×6 mm', '2 por dupla'],
  ['Buzzer passivo', '1 por dupla'],
  ['Potenciômetro 10 kΩ', '1 por dupla'],
  ['LDR', '1 por dupla'],
  ['Micro servo SG90', '1 por dupla'],
  ['Sensor ultrassônico HC-SR04', '1 por dupla'],
  ['Computador ou notebook com Arduino IDE', '1 por dupla'],
];

function TeacherHome() {
  const [tab, setTab] = useState<'turma' | 'guia' | 'missoes' | 'respostas' | 'dicas'>('turma');
  const totalMin = MISSIONS.reduce((s, m) => s + m.teacher.minutes, 0);
  return (
    <div className="stack">
      <PageHead icon={<PresIcon size={30} />} color="#5524c9" title="Espaço do professor" subtitle="Cadastre a turma Robótica, acompanhe o progresso de cada estudante e encontre guia, objetivos, materiais, códigos, respostas e modo de apresentação.">
        <button className="btn ghost no-print" onClick={() => window.print()}><Printer size={16} /> Imprimir esta página</button>
      </PageHead>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'turma', label: 'Turma Robótica' }, { id: 'guia', label: 'Guia do professor' }, { id: 'missoes', label: 'As 20 missões' }, { id: 'respostas', label: 'Respostas dos desafios' }, { id: 'dicas', label: 'Dificuldades e dicas' }]} />

      {tab === 'turma' && <ClassPanel />}

      {tab === 'guia' && (
        <div className="stack">
          <div className="grid cols-2">
            <div className="card">
              <h2><BookOpenCheck size={22} /> Como organizar as aulas</h2>
              <ol style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
                <li><strong>Abertura (5–10 min):</strong> apresente o desafio da missão com uma situação do cotidiano.</li>
                <li><strong>Demonstração (10 min):</strong> use o modo de apresentação para mostrar a montagem passo a passo.</li>
                <li><strong>Montagem em duplas (15–20 min):</strong> um estudante lê o passo, o outro monta. Revezem a cada missão.</li>
                <li><strong>Teste e depuração (10 min):</strong> verificação na bancada virtual antes de ligar a placa real.</li>
                <li><strong>Fechamento (5–10 min):</strong> perguntas de compreensão e desafio final.</li>
              </ol>
              <p className="small muted">Tempo total estimado do curso: cerca de {Math.round(totalMin / 50)} aulas de 50 minutos ({totalMin} minutos).</p>
            </div>
            <div className="card">
              <h2><ShieldCheck size={22} /> Regras de ouro (combine com a turma)</h2>
              <ul className="list-check">{GOLDEN_RULES.map((r) => <li key={r}><ShieldCheck size={18} />{r}</li>)}</ul>
            </div>
          </div>
          <div className="card">
            <h2><Clock size={22} /> Planejamento por nível</h2>
            <table className="t">
              <thead><tr><th>Nível</th><th>Missões</th><th>Foco</th><th>Tempo estimado</th></tr></thead>
              <tbody>
                {LEVELS.map((L) => {
                  const ms = MISSIONS.filter((m) => m.level === L.n);
                  return <tr key={L.n}><td><strong>{L.n}. {L.name}</strong></td><td>{ms[0].n}–{ms[ms.length - 1].n}</td><td>{L.desc}</td><td>{ms.reduce((s, m) => s + m.teacher.minutes, 0)} min</td></tr>;
                })}
              </tbody>
            </table>
          </div>
          <div className="grid cols-2">
            <div className="card">
              <h2><Package size={22} /> Materiais necessários (kit por dupla)</h2>
              <table className="t"><tbody>{KIT.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody></table>
            </div>
            <div className="card">
              <h2>Orientações pedagógicas</h2>
              <ul style={{ paddingLeft: 18, display: 'grid', gap: 6 }}>
                <li>Um conceito novo por vez. Cada missão foi pensada para isso.</li>
                <li>Peça previsões antes de ligar: "o que vai acontecer?". Depois, compare com o resultado.</li>
                <li>Valorize o erro como parte do processo: a plataforma dá XP pela persistência.</li>
                <li>Use a bancada virtual para planejar e a física para construir.</li>
                <li>Peça que expliquem o caminho da corrente com o dedo antes de ligar o USB.</li>
                <li>A gamificação é individual: não há ranking nem comparação entre estudantes.</li>
                <li>O progresso fica no navegador de cada computador. Em computadores compartilhados, use "Reiniciar progresso" na Central de aprendizagem.</li>
              </ul>
              <Callout kind="info">Para projetar uma missão: abra a missão, vá até "Demonstração e montagem" e clique em <strong>Tela cheia</strong> — ou use o botão "Apresentar" na aba "As 20 missões".</Callout>
            </div>
          </div>
        </div>
      )}

      {tab === 'missoes' && (
        <div className="stack">
          {LEVELS.map((L) => (
            <div key={L.n} className="card">
              <h2 style={{ color: L.color }}>Nível {L.n} — {L.name}</h2>
              <table className="t">
                <thead><tr><th>Missão</th><th>Objetivo</th><th>Tempo</th><th></th></tr></thead>
                <tbody>
                  {MISSIONS.filter((m) => m.level === L.n).map((m) => (
                    <tr key={m.id}>
                      <td><strong>{String(m.n).padStart(2, '0')} · {m.title}</strong></td>
                      <td>{m.objective}</td>
                      <td>{m.teacher.minutes} min</td>
                      <td style={{ whiteSpace: 'nowrap' }}><Link to={`/professor/missao/${m.id}`} className="btn small">Detalhes</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {tab === 'respostas' && (
        <div className="stack">
          {MISSIONS.map((m) => (
            <details key={m.id} className="card">
              <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-head)', fontWeight: 700 }}>Missão {String(m.n).padStart(2, '0')} — {m.title}</summary>
              <Answers m={m} />
            </details>
          ))}
          <div className="card">
            <h3>Laboratório da protoboard — desafios</h3>
            <ul>{CHALLENGES.map((c) => <li key={c.id}><strong>{c.title}:</strong> {c.hint1}</li>)}</ul>
          </div>
        </div>
      )}

      {tab === 'dicas' && (
        <div className="grid cols-2">
          {MISSIONS.map((m) => (
            <div key={m.id} className="card">
              <h3>{String(m.n).padStart(2, '0')} · {m.title}</h3>
              <h4 style={{ color: 'var(--red-600)' }}>Dificuldades comuns</h4>
              <ul style={{ paddingLeft: 18 }}>{m.teacher.difficulties.map((d) => <li key={d}>{d}</li>)}</ul>
              <h4 style={{ color: 'var(--green-700)' }}>Como ajudar</h4>
              <ul style={{ paddingLeft: 18 }}>{m.teacher.tips.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Answers({ m }: { m: Mission }) {
  return (
    <div className="stack mt">
      <h4>Perguntas de compreensão</h4>
      <ol style={{ paddingLeft: 20, display: 'grid', gap: 4 }}>
        {m.quiz.map((q) => <li key={q.q}>{q.q} — <strong>{q.options[q.correct]}</strong></li>)}
      </ol>
      <h4>Atividade prática</h4>
      <p style={{ margin: 0 }}>{m.activity.intro}</p>
      {m.activity.type === 'build' && <p className="small muted" style={{ margin: 0 }}>Dica para o estudante: {m.activity.hint}</p>}
      <h4>Desafio final</h4>
      <p style={{ margin: 0 }}>{m.challenge.text}</p>
      <Callout kind="success" title="Resposta / solução">{m.challenge.solution}</Callout>
      {m.challenge.solutionCode && <CodeBlock code={m.challenge.solutionCode} />}
    </div>
  );
}

function TeacherMission({ m }: { m: Mission }) {
  const [present, setPresent] = useState(false);
  return (
    <div className="stack">
      <Link to="/professor" className="small"><ArrowLeft size={16} /> Espaço do professor</Link>
      <div className="page-head">
        <h1 style={{ margin: 0, flex: 1 }}>Missão {String(m.n).padStart(2, '0')} — {m.title}</h1>
        {m.circuit && m.steps && <button className="btn primary" onClick={() => setPresent(true)}><MonitorPlay size={18} /> Apresentar em tela cheia</button>}
        <Link to={`/curso/missao/${m.id}`} className="btn ghost">Abrir como estudante</Link>
      </div>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>Objetivos de aprendizagem</h3>
          <p><strong>{m.objective}</strong></p>
          <ul>{m.goals.map((g) => <li key={g}>{g}</li>)}</ul>
          <p className="small muted">Tempo estimado: {m.teacher.minutes} minutos.</p>
          <h3>Materiais</h3>
          <ul>{m.materials.map((x) => <li key={x.item}>{x.qty} × {x.item}</li>)}</ul>
          <h3>Segurança</h3>
          <ul>{m.safety.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="card">
          <h3>Dificuldades comuns</h3>
          <ul>{m.teacher.difficulties.map((d) => <li key={d}>{d}</li>)}</ul>
          <h3>Dicas para ajudar os estudantes</h3>
          <ul>{m.teacher.tips.map((d) => <li key={d}>{d}</li>)}</ul>
          {m.steps && (
            <>
              <h3>Passo a passo da montagem</h3>
              <ol>{m.steps.map((s) => <li key={s.text}>{s.text}</li>)}</ol>
            </>
          )}
        </div>
      </div>
      {m.code && (
        <div className="card">
          <h3>Código completo</h3>
          <CodeBlock code={m.code} />
        </div>
      )}
      <div className="card">
        <h3>Respostas</h3>
        <Answers m={m} />
      </div>
      {present && <Presentation mission={m} onClose={() => setPresent(false)} />}
    </div>
  );
}
