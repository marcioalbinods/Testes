/**
 * Módulo 3 — LABORATÓRIO DE CIRCUITOS
 *  - Monte seu circuito: atividades com verificação da topologia
 *  - Caminho da eletricidade: demonstrações com animação da corrente
 *  - Simulador didático: bancada livre que roda programas
 */
import { useMemo, useState } from 'react';
import { CircuitBoard, FlaskConical, Info, Zap } from 'lucide-react';
import { Bench, type BenchProgram } from '../components/Bench';
import { Callout, PageHead, Tabs } from '../components/ui';
import { MISSIONS } from '../data/missions';
import { C_BLINK13, C_FLOW_SWITCH, C_FLOW_TWO, C_LED_RAILS } from '../data/circuits';
import { useLocalState } from '../lib/progress';
import { navigate } from '../lib/router';
import type { Circuit } from '../lib/circuit/types';
import type { Mission } from '../data/missionTypes';
import { MascotSays } from '../svg/Mascot';

type Tab = 'monte' | 'caminho' | 'simulador';

export function CircuitLabPage({ tab: routeTab }: { tab?: string }) {
  const tab: Tab = routeTab === 'caminho' || routeTab === 'simulador' ? routeTab : 'monte';
  return (
    <div className="stack">
      <PageHead icon={<CircuitBoard size={30} />} color="#f76b15" title="Laboratório de circuitos" subtitle="Monte circuitos na bancada virtual, veja o caminho da eletricidade e teste programas no simulador didático." />
      <Tabs
        value={tab}
        onChange={(t) => navigate(`/circuitos/${t}`)}
        tabs={[
          { id: 'monte', label: 'Monte seu circuito', icon: <CircuitBoard size={16} /> },
          { id: 'caminho', label: 'Caminho da eletricidade', icon: <Zap size={16} /> },
          { id: 'simulador', label: 'Simulador livre', icon: <FlaskConical size={16} /> },
        ]}
      />
      {tab === 'monte' && <BuildTab />}
      {tab === 'caminho' && <FlowTab />}
      {tab === 'simulador' && <SimulatorTab />}
    </div>
  );
}

const BUILD_MISSIONS = MISSIONS.filter((m) => m.activity.type === 'build');

function BuildTab() {
  const [id, setId] = useLocalState<string>('lab:atividade', BUILD_MISSIONS[0].id);
  const m = BUILD_MISSIONS.find((x) => x.id === id) ?? BUILD_MISSIONS[0];
  return (
    <div className="stack">
      <div className="card">
        <h3>Escolha uma atividade de montagem</h3>
        <div className="row" style={{ gap: 6 }}>
          {BUILD_MISSIONS.map((x) => (
            <button key={x.id} className={`btn small ${x.id === m.id ? 'on' : 'ghost'}`} onClick={() => setId(x.id)}>
              <span aria-hidden>{x.icon}</span> {String(x.n).padStart(2, '0')} · {x.title}
            </button>
          ))}
        </div>
      </div>
      <LabActivity key={m.id} m={m} />
    </div>
  );
}

function LabActivity({ m }: { m: Mission }) {
  const a = m.activity as Extract<Mission['activity'], { type: 'build' }>;
  const [circuit, setCircuit] = useLocalState<Circuit>(`lab:montagem:${m.id}`, a.start);
  const programs = useMemo<BenchProgram[]>(() => (m.code ? [{ id: m.id, title: `Programa da Missão ${String(m.n).padStart(2, '0')}`, code: m.code }] : []), [m]);
  return (
    <div className="stack">
      <MascotSays mood="think"><strong>{a.intro}</strong></MascotSays>
      <Bench circuit={circuit} onChange={setCircuit} palette={a.palette.length ? a.palette : undefined} rules={a.rules} programs={programs} />
      <div className="row">
        <button className="btn ghost small" onClick={() => setCircuit(a.start)}>Recomeçar</button>
        <button className="btn ghost small" onClick={() => navigate(`/curso/missao/${m.id}`)}>Abrir a Missão {String(m.n).padStart(2, '0')}</button>
      </div>
      <Callout kind="tip" title="Dica">{a.hint}</Callout>
    </div>
  );
}

const FLOW_DEMOS: { id: string; title: string; text: string[]; circuit: Circuit; code?: string }[] = [
  {
    id: 'botao', title: 'Circuito aberto e fechado',
    text: [
      'Ligue o USB. O LED está apagado: o botão está solto e o caminho está INTERROMPIDO. Isso é um circuito aberto.',
      'Agora segure o botão (toque e mantenha). O caminho se completa e a corrente circula: circuito fechado! O LED acende.',
    ],
    circuit: C_FLOW_SWITCH,
  },
  {
    id: 'serie', title: 'LED com resistor',
    text: [
      'A corrente sai do 5V, passa pelo resistor, pelo LED (do ânodo para o cátodo) e volta ao GND.',
      'Selecione o resistor ou o LED para ver a corrente e a tensão medidas na simulação. Repare que a mesma corrente passa pelos dois: eles estão em série.',
    ],
    circuit: C_LED_RAILS,
  },
  {
    id: 'paralelo', title: 'Dois caminhos (paralelo)',
    text: [
      'Aqui há dois caminhos lado a lado, cada um com seu resistor e seu LED. A corrente da placa se divide entre eles.',
      'Compare as correntes: o LED azul precisa de mais tensão para acender, então recebe um pouco menos de corrente.',
    ],
    circuit: C_FLOW_TWO,
  },
  {
    id: 'pisca', title: 'Corrente controlada pelo programa',
    text: [
      'Agora quem fornece a energia é o pino 13. Quando o programa escreve HIGH, a corrente sai do pino; com LOW, ela para.',
      'Observe o caminho aparecer e desaparecer no ritmo do delay().',
    ],
    circuit: C_BLINK13,
    code: MISSIONS[6].code,
  },
];

function FlowTab() {
  const [id, setId] = useState(FLOW_DEMOS[0].id);
  const d = FLOW_DEMOS.find((x) => x.id === id)!;
  const programs = useMemo(() => (d.code ? [{ id: d.id, title: 'Pisca-pisca (pino 13)', code: d.code }] : []), [d]);
  return (
    <div className="stack">
      <div className="row" style={{ gap: 6 }}>
        {FLOW_DEMOS.map((x) => (
          <button key={x.id} className={`btn small ${x.id === id ? 'on' : 'ghost'}`} onClick={() => setId(x.id)}>{x.title}</button>
        ))}
      </div>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3>{d.title}</h3>
          {d.text.map((t, i) => <p key={i}>{t}</p>)}
        </div>
        <div className="card tinted">
          <h3>Corrente e elétrons</h3>
          <p className="small">As bolinhas <strong style={{ color: '#c99700' }}>amarelas</strong> mostram a <strong>corrente convencional</strong>: por combinação, dizemos que ela sai do positivo (+) e vai para o negativo (−).</p>
          <p className="small">Os <strong>elétrons</strong>, que são as partículas que realmente se movem nos fios, andam no sentido contrário: do − para o +. Marque "Mostrar o movimento dos elétrons" para ver.</p>
          <p className="small muted" style={{ margin: 0 }}>As cores dos furos mostram a tensão: vermelho perto de 5 V, azul perto de 0 V (GND).</p>
        </div>
      </div>
      <Bench key={d.id} circuit={d.circuit} editable={false} defaultFlow programs={programs} />
      <Callout kind="demo">
        Demonstração didática: as bolinhas ilustram o sentido e a intensidade aproximada da corrente, calculadas por um modelo simplificado do circuito (não é uma medição real nem uma simulação física completa).
      </Callout>
    </div>
  );
}

function SimulatorTab() {
  const [circuit, setCircuit] = useLocalState<Circuit>('simulador:circuito', C_BLINK13);
  const [editorCode] = useLocalState<string>('editor:codigo', '');
  const [blocksCode] = useLocalState<string>('blocos:codigo', '');
  const [load, setLoad] = useState('');
  const programs = useMemo<BenchProgram[]>(() => {
    const list: BenchProgram[] = [];
    if (editorCode.trim()) list.push({ id: 'editor', title: 'Meu código (Editor)', code: editorCode });
    if (blocksCode.trim()) list.push({ id: 'blocos', title: 'Meu programa de blocos', code: blocksCode });
    for (const m of MISSIONS) if (m.code) list.push({ id: m.id, title: `Missão ${String(m.n).padStart(2, '0')} — ${m.title}`, code: m.code });
    for (const p of MISSIONS[19].projects ?? []) list.push({ id: `p-${p.id}`, title: `Projeto: ${p.title}`, code: p.code });
    // começa pelo pisca-pisca
    const blink = list.findIndex((p) => p.id === 'm7');
    if (blink > 0 && !editorCode.trim() && !blocksCode.trim()) list.unshift(...list.splice(blink, 1));
    return list;
  }, [editorCode, blocksCode]);
  const circuits = MISSIONS.filter((m) => m.circuit);
  return (
    <div className="stack">
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Callout kind="info" title="O que este simulador faz">
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            <li>Calcula o circuito com um <strong>modelo simplificado de corrente contínua</strong> (Lei de Ohm e Leis de Kirchhoff): resistores ideais e LEDs com tensão de condução fixa.</li>
            <li>Executa o programa (um conjunto de comandos do Arduino) linha por linha.</li>
            <li>Simula com regras: LEDs, botões, buzzer passivo, potenciômetro, LDR, servo e sensor ultrassônico.</li>
            <li><strong>Não</strong> simula aquecimento, ruído, capacitores, motores DC nem outros componentes.</li>
          </ul>
        </Callout>
        <div className="card">
          <h3>Começar a partir de uma montagem</h3>
          <div className="row">
            <select value={load} onChange={(e) => setLoad(e.target.value)} aria-label="Montagem para carregar">
              <option value="">Escolha uma montagem…</option>
              {circuits.map((m) => <option key={m.id} value={m.id}>Missão {String(m.n).padStart(2, '0')} — {m.title}</option>)}
              {(MISSIONS[19].projects ?? []).map((p) => <option key={p.id} value={`p-${p.id}`}>Projeto: {p.title}</option>)}
            </select>
            <button className="btn small" disabled={!load} onClick={() => {
              const m = circuits.find((x) => x.id === load);
              const p = (MISSIONS[19].projects ?? []).find((x) => `p-${x.id}` === load);
              setCircuit(m?.circuit ?? p?.circuit ?? circuit);
            }}>Carregar</button>
            <button className="btn small ghost" onClick={() => setCircuit({ parts: [], wires: [] })}>Bancada vazia</button>
          </div>
          <p className="small muted" style={{ marginBottom: 0 }}><Info size={14} /> Escolha o programa abaixo da bancada. Os programas que você criar no Editor ou com os Blocos também aparecem aqui.</p>
        </div>
      </div>
      <Bench circuit={circuit} onChange={setCircuit} programs={programs} />
    </div>
  );
}
