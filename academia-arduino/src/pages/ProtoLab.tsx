/**
 * Módulo 2 — LABORATÓRIO DA PROTOBOARD
 * A. Exploração dos furos (clique e veja tudo o que está ligado)
 * B. Visualização: vista de cima / ver por dentro / conexões destacadas
 * C. Modo de perguntas (o sistema confere e explica)
 * D. Desafios: escolher os furos certos para montar pequenos circuitos
 */
import { useMemo, useState } from 'react';
import { Check, Eye, Grid3x3, Layers, Lightbulb, RotateCcw, Scan, Shuffle } from 'lucide-react';
import { Breadboard, BreadboardDefs, pathColor, type BBView } from '../svg/Breadboard';
import { PartGraphic, PartsDefs } from '../svg/Parts';
import {
  allHoles, BB_HEIGHT, BB_WIDTH, COLS, connectedHoles, explainHole, holeLabel, netKind, netOf, parseHole, RAIL_COLS, ROWS, type BreadboardConfig,
} from '../lib/breadboard';
import { legHoles } from '../lib/circuit/parts';
import type { PlacedPart } from '../lib/circuit/types';
import { useProgress } from '../lib/progress';
import { Callout, PageHead, Tabs } from '../components/ui';
import { MascotSays } from '../svg/Mascot';
import { ProtoQuiz } from '../components/activities';

type Tab = 'explorar' | 'perguntas' | 'desafios';

export function ProtoLabPage() {
  const [tab, setTab] = useState<Tab>('explorar');
  const [split, setSplit] = useState(false);
  const cfg: BreadboardConfig = { railsSplit: split };
  return (
    <div className="stack">
      <PageHead icon={<Grid3x3 size={30} />} color="#16b862" title="Laboratório da protoboard" subtitle="Os furos da protoboard têm ligações escondidas por dentro. Clique, veja por dentro e descubra quais furos estão conectados." />
      <div className="row between">
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'explorar', label: 'Explorar os furos' }, { id: 'perguntas', label: 'Modo de perguntas' }, { id: 'desafios', label: 'Desafios da protoboard' }]} />
        <label className="row small" style={{ gap: 8, background: '#fff', padding: '8px 12px', borderRadius: 12, border: '1px solid var(--line)' }}>
          <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
          Trilhos interrompidos no meio
        </label>
      </div>
      {split && (
        <Callout kind="info" title="Protoboard com trilhos interrompidos">
          Algumas protoboards (principalmente as maiores) têm os trilhos + e − divididos ao meio: a linha vermelha/azul aparece cortada. Nelas, a metade esquerda do trilho NÃO se liga à direita — é preciso um fio ligando as duas partes.
        </Callout>
      )}
      {tab === 'explorar' && <Explore cfg={cfg} />}
      {tab === 'perguntas' && <Questions cfg={cfg} />}
      {tab === 'desafios' && <Challenges cfg={cfg} />}
    </div>
  );
}

/* ====================== A + B: exploração ====================== */
function Explore({ cfg }: { cfg: BreadboardConfig }) {
  const [view, setView] = useState<BBView>('top');
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const { markSeen } = useProgress();
  const focus = sel ?? hover;
  const net = focus ? netOf(focus, cfg) : null;
  const holes = focus ? connectedHoles(focus, cfg) : [];
  const kind = net ? netKind(net) : null;

  const click = (id: string) => {
    setSel(id === sel ? null : id);
    markSeen('protoHoles', netOf(id, cfg)!);
  };

  return (
    <div className="split wide-left">
      <div className="card">
        <div className="row between mb">
          <div className="tabs" role="group" aria-label="Visão da protoboard">
            <button className={`tab ${view === 'top' ? 'active' : ''}`} onClick={() => setView('top')}><Eye size={16} /> Visão superior</button>
            <button className={`tab ${view === 'inside' ? 'active' : ''}`} onClick={() => setView('inside')}><Scan size={16} /> Ver por dentro</button>
            <button className={`tab ${view === 'paths' ? 'active' : ''}`} onClick={() => setView('paths')}><Layers size={16} /> Conexões destacadas</button>
          </div>
          {sel && <button className="btn small ghost" onClick={() => setSel(null)}><RotateCcw size={16} /> Limpar</button>}
        </div>
        <div className="proto-stage">
          <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className="svg-fluid" role="img" aria-label="Protoboard interativa">
            <BreadboardDefs />
            <Breadboard cfg={cfg} view={view} litNets={net ? [net] : []} highlight={focus ? [focus] : []} onHole={click} onHoleEnter={setHover} />
          </svg>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>
          {view === 'inside' ? 'Por dentro: as tiras de metal ligam os furos. Repare que nenhuma tira atravessa o canal central.' : view === 'paths' ? 'Cada cor é um caminho elétrico separado. Furos da mesma cor e da mesma tira estão ligados.' : 'Toque (ou passe o mouse) em um furo para ver quais outros furos estão ligados a ele.'}
        </p>
      </div>
      <div className="info-panel" aria-live="polite">
        {focus && net ? (
          <>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: 5, background: pathColor(net) }} />
              <h3 style={{ margin: 0 }}>{holeLabel(focus)}</h3>
            </div>
            <p style={{ marginTop: 10 }}>{explainHole(focus, cfg)}</p>
            <p className="small"><strong>{holes.length} furos</strong> ligados neste caminho{kind === 'positive' ? ' — use para o 5V (+).' : kind === 'negative' ? ' — use para o GND (−).' : '.'}</p>
            {kind === 'strip' && <p className="small muted">Furos ligados: {holes.map((h) => h).join(', ')}</p>}
            {!sel && <p className="small muted">Toque no furo para fixar a seleção.</p>}
          </>
        ) : (
          <>
            <h3>Como a protoboard é ligada?</h3>
            <ul style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 6 }}>
              <li><strong style={{ color: '#ff8a8a' }}>Trilho +</strong> e <strong style={{ color: '#8ab4ff' }}>trilho −</strong>: ligados ao longo da placa.</li>
              <li><strong>Grupos de 5</strong>: a–e de cada coluna; f–j de cada coluna.</li>
              <li><strong>Canal central</strong>: separa as duas metades. Não há ligação entre e e f.</li>
            </ul>
            <p className="small muted" style={{ marginTop: 10 }}>Toque em qualquer furo para começar.</p>
          </>
        )}
      </div>
    </div>
  );
}

/* ====================== C: modo de perguntas ====================== */
const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: readonly T[]) => a[rnd(a.length)];

function randomPair(cfg: BreadboardConfig) {
  const types = ['sameGroup', 'neighbor', 'channel', 'rail', 'railVs', 'sameRow'];
  const t = pick(types);
  const c = 1 + rnd(COLS);
  const top = Math.random() < 0.5;
  const rows = top ? ROWS.slice(0, 5) : ROWS.slice(5);
  let a = '', b = '';
  switch (t) {
    case 'sameGroup': { const r1 = pick(rows); let r2 = pick(rows); while (r2 === r1) r2 = pick(rows); a = `${r1}${c}`; b = `${r2}${c}`; break; }
    case 'neighbor': { const r = pick(rows); a = `${r}${c}`; b = `${r}${c < COLS ? c + 1 : c - 1}`; break; }
    case 'channel': a = `e${c}`; b = `f${c}`; break;
    case 'rail': { const r = pick(['tp', 'tn', 'bp', 'bn']); a = `${r}-${pick(RAIL_COLS)}`; b = `${r}-${pick(RAIL_COLS)}`; while (b === a) b = `${r}-${pick(RAIL_COLS)}`; break; }
    case 'railVs': { const col = pick(RAIL_COLS); a = `tp-${col}`; b = `tn-${col}`; break; }
    default: { const r = pick(rows); a = `${r}${c}`; b = `${r}${((c + 2 + rnd(5)) % COLS) + 1}`; }
  }
  const connected = netOf(a, cfg) === netOf(b, cfg);
  return { a, b, connected, explain: pairExplain(a, b, connected) };
}

function pairExplain(a: string, b: string, connected: boolean) {
  const ha = parseHole(a)!;
  const hb = parseHole(b)!;
  if (ha.kind === 'rail' && hb.kind === 'rail') {
    if (ha.row !== hb.row) return 'São trilhos diferentes: cada trilho é uma tira de metal separada.';
    return connected ? 'Os dois furos estão no mesmo trilho, que vai de uma ponta à outra.' : 'Nesta protoboard o trilho é interrompido no meio: as duas metades não se ligam.';
  }
  if (ha.kind !== hb.kind) return 'Um furo é do trilho e o outro é do miolo: só ficam ligados se você colocar um fio.';
  if (ha.col !== hb.col) return `Colunas diferentes (${ha.col} e ${hb.col}) pertencem a grupos diferentes. Furos da mesma LINHA (mesma letra) não se ligam.`;
  if (connected) return `Mesma coluna (${ha.col}) e mesma metade da protoboard: fazem parte do mesmo grupo de 5.`;
  return 'Estão na mesma coluna, mas em metades diferentes: o canal central separa os dois.';
}

function makeFiveQuestion(cfg: BreadboardConfig) {
  const c = 1 + rnd(COLS);
  const kind = pick(['group', 'row', 'cross']);
  let holes: string[] = [];
  if (kind === 'group') holes = (Math.random() < 0.5 ? ROWS.slice(0, 5) : ROWS.slice(5)).map((r) => `${r}${c}`);
  else if (kind === 'row') { const r = pick(ROWS); const s = Math.max(1, Math.min(COLS - 4, c)); holes = [0, 1, 2, 3, 4].map((k) => `${r}${s + k}`); }
  else holes = ['c', 'd', 'e', 'f', 'g'].map((r) => `${r}${c}`);
  const nets = new Set(holes.map((h) => netOf(h, cfg)));
  const yes = nets.size === 1;
  const explain = kind === 'group' ? 'Sim! Os 5 furos estão na mesma coluna e na mesma metade: uma única tira de metal os liga.' : kind === 'row' ? 'Não. Estes furos estão na mesma LINHA (letra), mas cada coluna tem sua própria tira de metal.' : 'Não. Os furos atravessam o canal central: c, d, e ficam em uma tira e f, g em outra.';
  return { holes, yes, explain };
}

function Questions({ cfg }: { cfg: BreadboardConfig }) {
  const [kind, setKind] = useState<'pares' | 'cinco' | 'canal' | 'led' | 'mesma'>('pares');
  const [seed, setSeed] = useState(0);
  const pairs = useMemo(() => Array.from({ length: 6 }, () => randomPair(cfg)), [seed, cfg.railsSplit]);
  const { reward, bump } = useProgress();
  return (
    <div className="stack">
      <Tabs
        value={kind}
        onChange={setKind}
        tabs={[
          { id: 'pares', label: 'Estes furos estão conectados?' },
          { id: 'cinco', label: 'Mesmo grupo de 5?' },
          { id: 'canal', label: 'O canal central' },
          { id: 'led', label: 'Onde colocar o LED?' },
          { id: 'mesma', label: 'Pernas na mesma linha?' },
        ]}
      />
      <div className="card">
        {kind === 'pares' && (
          <>
            <div className="row between mb">
              <h3 style={{ margin: 0 }}>Estes dois furos estão conectados?</h3>
              <button className="btn small ghost" onClick={() => setSeed((s) => s + 1)}><Shuffle size={16} /> Novas perguntas</button>
            </div>
            <ProtoQuiz key={`${seed}-${cfg.railsSplit}`} items={pairs} railsSplit={cfg.railsSplit} onDone={() => { reward('proto:pairs', 30, 'Perguntas da protoboard'); }} />
          </>
        )}
        {kind === 'cinco' && <FiveQuestion cfg={cfg} onWrong={() => bump('retries')} />}
        {kind === 'canal' && <ChannelQuestion cfg={cfg} />}
        {kind === 'led' && <LedPlacement cfg={cfg} onWrong={() => bump('retries')} />}
        {kind === 'mesma' && <SameLine cfg={cfg} />}
      </div>
    </div>
  );
}

function FiveQuestion({ cfg, onWrong }: { cfg: BreadboardConfig; onWrong: () => void }) {
  const [q, setQ] = useState(() => makeFiveQuestion(cfg));
  const [ans, setAns] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const answer = (v: boolean) => {
    if (ans !== null) return;
    setAns(v);
    if (v === q.yes) setScore((s) => s + 1);
    else onWrong();
  };
  const fill = Object.fromEntries(q.holes.map((h) => [h, '#ffd43b']));
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="proto-stage">
        <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className="svg-fluid">
          <BreadboardDefs />
          <Breadboard cfg={cfg} view={ans !== null ? 'inside' : 'top'} holeFill={fill} litNets={ans !== null ? [...new Set(q.holes.map((h) => netOf(h, cfg)!))] : []} />
        </svg>
      </div>
      <div className="stack">
        <span className="chip purple" style={{ width: 'fit-content' }}>Acertos: {score}</span>
        <h3>Estes 5 furos amarelos pertencem ao mesmo grupo (estão todos ligados)?</h3>
        <div className="row">
          <button className="btn" disabled={ans !== null} onClick={() => answer(true)}>Sim</button>
          <button className="btn" disabled={ans !== null} onClick={() => answer(false)}>Não</button>
        </div>
        {ans !== null && <div className={`feedback ${ans === q.yes ? 'ok' : 'no'}`}><strong>{ans === q.yes ? 'Acertou!' : 'Não é isso.'}</strong> {q.explain}</div>}
        {ans !== null && <button className="btn primary" style={{ width: 'fit-content' }} onClick={() => { setQ(makeFiveQuestion(cfg)); setAns(null); }}>Próxima</button>}
      </div>
    </div>
  );
}

function ChannelQuestion({ cfg }: { cfg: BreadboardConfig }) {
  const [ans, setAns] = useState<boolean | null>(null);
  const col = 14;
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="proto-stage">
        <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className="svg-fluid">
          <BreadboardDefs />
          <Breadboard cfg={cfg} view={ans !== null ? 'inside' : 'top'} highlight={[`e${col}`, `f${col}`]} litNets={ans !== null ? [`strip:T${col}`, `strip:B${col}`] : []} />
        </svg>
      </div>
      <div className="stack">
        <h3>Os dois lados do canal central estão conectados? (furos e{col} e f{col})</h3>
        <div className="row">
          <button className="btn" disabled={ans !== null} onClick={() => setAns(true)}>Sim</button>
          <button className="btn" disabled={ans !== null} onClick={() => setAns(false)}>Não</button>
        </div>
        {ans !== null && (
          <div className={`feedback ${ans === false ? 'ok' : 'no'}`}>
            <strong>{ans === false ? 'Isso mesmo!' : 'Não.'}</strong> O canal central não tem metal por baixo. As tiras de cima (a–e) e de baixo (f–j) ficam separadas. Por isso os componentes de 4 pernas, como o botão e os chips, são colocados "em cima" do canal: cada lado fica em um caminho diferente.
          </div>
        )}
        {ans !== null && <button className="btn ghost small" style={{ width: 'fit-content' }} onClick={() => setAns(null)}>Responder de novo</button>}
      </div>
    </div>
  );
}

/** O estudante escolhe dois furos para as pernas do LED. */
function LedPlacement({ cfg, onWrong }: { cfg: BreadboardConfig; onWrong: () => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const click = (id: string) => {
    setResult(null);
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 2 ? [s[1], id] : [...s, id]));
  };
  const check = () => {
    if (sel.length < 2) { setResult({ ok: false, text: 'Escolha dois furos: um para cada perna do LED.' }); return; }
    const [a, b] = sel;
    const ha = parseHole(a)!;
    const hb = parseHole(b)!;
    let r: { ok: boolean; text: string };
    if (netOf(a, cfg) === netOf(b, cfg)) r = { ok: false, text: 'Os dois furos estão ligados entre si! As duas pernas ficariam no mesmo caminho e a corrente passaria pelo metal, não pelo LED. Ele não acenderia.' };
    else if (ha.kind === 'rail' && hb.kind === 'rail') r = { ok: false, text: 'Ligar o LED direto entre os trilhos + e − deixaria o LED sem resistor. Coloque as pernas no miolo e use um resistor.' };
    else if (Math.abs(ha.x - hb.x) + Math.abs(ha.y - hb.y) > 31) r = { ok: false, text: 'Os furos estão longe demais para as perninhas do LED. Escolha furos próximos (um ao lado do outro).' };
    else r = { ok: true, text: `Muito bem! As pernas ficam em caminhos diferentes (${holeLabel(a)} e ${holeLabel(b)}). Agora cada perna pode ser ligada a uma parte diferente do circuito.` };
    setResult(r);
    if (!r.ok) onWrong();
  };
  const fill = Object.fromEntries(sel.map((h, i) => [h, i === 0 ? '#ef4444' : '#2f6bff']));
  const lit = sel.map((h) => netOf(h, cfg)!);
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="proto-stage">
        <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className="svg-fluid">
          <BreadboardDefs />
          <Breadboard cfg={cfg} holeFill={fill} litNets={lit} onHole={click} />
        </svg>
      </div>
      <div className="stack">
        <h3>Onde devo colocar as pernas de um LED?</h3>
        <p>Toque em dois furos: o primeiro (vermelho) para a perna longa e o segundo (azul) para a perna curta.</p>
        <div className="row">
          <button className="btn primary" onClick={check}><Check size={18} /> Conferir</button>
          <button className="btn ghost" onClick={() => { setSel([]); setResult(null); }}><RotateCcw size={16} /> Limpar</button>
        </div>
        {result && <div className={`feedback ${result.ok ? 'ok' : 'no'}`}>{result.text}</div>}
      </div>
    </div>
  );
}

function SameLine({ cfg }: { cfg: BreadboardConfig }) {
  const [ans, setAns] = useState<boolean | null>(null);
  const led: PlacedPart = { id: 'x', kind: 'led', anchor: 'b10', orient: 'v', props: { color: 'red' } };
  const legs = legHoles(led)!;
  const pos = Object.fromEntries(Object.entries(legs).map(([k, h]) => [k, parseHole(h)!]));
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="proto-stage">
        <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className="svg-fluid">
          <BreadboardDefs />
          <PartsDefs />
          <Breadboard cfg={cfg} view={ans !== null ? 'inside' : 'top'} litNets={ans !== null ? ['strip:T10'] : []} />
          <PartGraphic part={led} legs={pos} st={{ brightness: 0, problem: ans !== null }} bbBottom={BB_HEIGHT} />
        </svg>
      </div>
      <div className="stack">
        <h3>Posso colocar as duas pernas do LED no mesmo grupo de 5 furos (a mesma tira)?</h3>
        <p className="small muted">Na imagem, as pernas estão em b10 e c10.</p>
        <div className="row">
          <button className="btn" disabled={ans !== null} onClick={() => setAns(true)}>Sim, pode</button>
          <button className="btn" disabled={ans !== null} onClick={() => setAns(false)}>Não pode</button>
        </div>
        {ans !== null && (
          <div className={`feedback ${ans === false ? 'ok' : 'no'}`}>
            <strong>{ans === false ? 'Correto: não pode!' : 'Na verdade, não pode.'}</strong> b10 e c10 estão na mesma tira de metal. A eletricidade vai pelo caminho mais fácil — o metal — e não passa pelo LED. Dizemos que o LED está "em curto". Ele não acende. Coloque cada perna em uma coluna diferente.
          </div>
        )}
        {ans !== null && <button className="btn ghost small" style={{ width: 'fit-content' }} onClick={() => setAns(null)}>Responder de novo</button>}
      </div>
    </div>
  );
}

/* ====================== D: desafios ====================== */
export interface Challenge {
  id: string;
  title: string;
  text: string;
  parts: PlacedPart[];
  /** quantos furos escolher e o nome de cada um */
  picks: string[];
  check: (holes: string[], cfg: BreadboardConfig) => { ok: boolean; text: string };
  hint1: string;
  /** caminhos para destacar na dica forte */
  hint2: (cfg: BreadboardConfig) => string[];
}

const N = (h: string, cfg: BreadboardConfig) => netOf(h, cfg)!;

export const CHALLENGES: Challenge[] = [
  {
    id: 'serie', title: 'Resistor em série com o LED',
    text: 'O LED já está na protoboard: perna longa (ânodo) em c12 e perna curta (cátodo) em c13. Escolha os 2 furos do resistor para que ele fique EM SÉRIE com o ânodo do LED.',
    parts: [{ id: 'l', kind: 'led', anchor: 'c12', orient: 'h', props: { color: 'red' } }],
    picks: ['perna 1 do resistor', 'perna 2 do resistor'],
    check: (h, cfg) => {
      const [a, b] = h;
      if (N(a, cfg) === N(b, cfg)) return { ok: false, text: 'As duas pernas do resistor estão no mesmo grupo: ele ficaria em curto, sem efeito.' };
      const nets = [N(a, cfg), N(b, cfg)];
      if (nets.includes(N('c13', cfg))) return { ok: false, text: 'Uma perna do resistor está no grupo do cátodo (coluna 13). Para esta montagem, ligue o resistor ao ÂNODO (coluna 12, a–e).' };
      if (!nets.includes(N('c12', cfg))) return { ok: false, text: 'Nenhuma perna do resistor está no grupo do ânodo (furos a12 a e12). Assim ele não fica ligado ao LED.' };
      return { ok: true, text: 'Perfeito! Uma perna do resistor está no mesmo grupo do ânodo e a outra em um grupo livre, onde chegará o fio do 5V. Resistor e LED estão em série: a corrente passa por um e depois pelo outro.' };
    },
    hint1: 'Uma perna do resistor precisa ficar no mesmo grupo de 5 da perna longa do LED (coluna 12, linhas a–e).',
    hint2: () => ['strip:T12'],
  },
  {
    id: 'gnd', title: 'Ligue o cátodo ao GND',
    text: 'Agora escolha onde colocar as pontas de um fio para ligar o cátodo do LED (c13) ao trilho negativo (−).',
    parts: [
      { id: 'l', kind: 'led', anchor: 'c12', orient: 'h', props: { color: 'red' } },
      { id: 'r', kind: 'resistor', anchor: 'b8', orient: 'h', props: { ohms: 220 } },
    ],
    picks: ['ponta 1 do fio', 'ponta 2 do fio'],
    check: (h, cfg) => {
      const nets = h.map((x) => N(x, cfg));
      const cat = N('c13', cfg);
      const neg = nets.find((n) => netKind(n) === 'negative');
      if (nets.some((n) => netKind(n) === 'positive')) return { ok: false, text: 'Uma ponta está no trilho POSITIVO (+, vermelho). O cátodo vai para o NEGATIVO (−, azul).' };
      if (!nets.includes(cat)) return { ok: false, text: 'Nenhuma ponta está no grupo do cátodo (coluna 13, linhas a–e).' };
      if (!neg) return { ok: false, text: 'A outra ponta precisa ir para um furo do trilho negativo (linha azul).' };
      return { ok: true, text: 'Isso! O fio liga o cátodo ao trilho −. Quando o trilho − estiver ligado ao GND da placa, o caminho da corrente estará completo.' };
    },
    hint1: 'Uma ponta em qualquer furo livre da coluna 13 (a, b, d ou e). A outra no trilho com a linha azul.',
    hint2: (cfg) => ['strip:T13', cfg.railsSplit ? 'rail:tn:L' : 'rail:tn'],
  },
  {
    id: 'botao', title: 'Ligações do botão',
    text: 'O botão está sobre o canal central (pernas em e15, e17, f15 e f17). Escolha um furo para o fio do PINO 2 e outro para o fio do GND, de forma que apertar o botão ligue um ao outro.',
    parts: [{ id: 'b', kind: 'button', anchor: 'e15', orient: 'h', props: {} }],
    picks: ['fio do pino 2', 'fio do GND'],
    check: (h, cfg) => {
      const [p, g] = h.map((x) => N(x, cfg));
      const side1 = [N('e15', cfg), N('f15', cfg)];
      const side2 = [N('e17', cfg), N('f17', cfg)];
      const inS1 = (n: string) => side1.includes(n);
      const inS2 = (n: string) => side2.includes(n);
      if (!(inS1(p) || inS2(p))) return { ok: false, text: 'O fio do pino 2 não está ligado a nenhuma perna do botão. Use um furo das colunas 15 ou 17.' };
      if (!(inS1(g) || inS2(g))) return { ok: false, text: 'O fio do GND não está ligado a nenhuma perna do botão.' };
      if ((inS1(p) && inS1(g)) || (inS2(p) && inS2(g))) return { ok: false, text: 'Pino e GND estão do MESMO lado do botão: eles já estariam ligados mesmo sem apertar (as pernas de cada lado são ligadas por dentro).' };
      return { ok: true, text: 'Muito bem! O pino ficou de um lado e o GND do outro. Só quando o botão é apertado os dois lados se ligam.' };
    },
    hint1: 'As pernas da coluna 15 (em cima e embaixo) são sempre ligadas entre si; o mesmo vale para a coluna 17. Use uma coluna para o pino e a outra para o GND.',
    hint2: () => ['strip:T15', 'strip:B15'],
  },
  {
    id: 'alimentar', title: 'Alimente o LED do outro lado',
    text: 'O LED está na metade de baixo: ânodo em h20 e cátodo em h21. Escolha os furos do resistor para ligar o trilho POSITIVO de baixo ao ânodo.',
    parts: [{ id: 'l', kind: 'led', anchor: 'h20', orient: 'h', props: { color: 'green' } }],
    picks: ['perna 1 do resistor', 'perna 2 do resistor'],
    check: (h, cfg) => {
      const nets = h.map((x) => N(x, cfg));
      if (nets[0] === nets[1]) return { ok: false, text: 'As duas pernas estão no mesmo caminho: o resistor ficaria em curto.' };
      if (!nets.includes(N('h20', cfg))) return { ok: false, text: 'Uma perna precisa estar no grupo do ânodo: coluna 20, linhas f–j.' };
      if (!nets.some((n) => n.startsWith('rail:bp'))) return { ok: false, text: nets.some((n) => n.startsWith('rail:tp')) ? 'O trilho + de CIMA não chega aqui sem um fio. Use o trilho + de baixo.' : 'A outra perna precisa ir ao trilho positivo de baixo (linha vermelha).' };
      return { ok: true, text: 'Excelente! O resistor liga o + ao ânodo. Repare que o canal central não importa aqui: tudo está na metade de baixo.' };
    },
    hint1: 'Uma perna no trilho + de baixo (linha vermelha da borda de baixo) e a outra em f20, g20, i20 ou j20.',
    hint2: (cfg) => ['strip:B20', cfg.railsSplit ? 'rail:bp:R' : 'rail:bp'],
  },
];

function Challenges({ cfg }: { cfg: BreadboardConfig }) {
  const [ci, setCi] = useState(0);
  const ch = CHALLENGES[ci];
  const [sel, setSel] = useState<string[]>([]);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const [fails, setFails] = useState(0);
  const { state, bump, markSeen, reward } = useProgress();
  const doneList = state.seen.protoChallenges ?? [];
  const occupied = new Set(ch.parts.flatMap((p) => Object.values(legHoles(p) ?? {})));

  const reset = (i: number) => { setCi(i); setSel([]); setRes(null); setFails(0); };
  const click = (id: string) => {
    if (occupied.has(id)) { setRes({ ok: false, text: `O ${holeLabel(id)} já está ocupado por uma perna de componente.` }); return; }
    setRes(null);
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= ch.picks.length ? [...s.slice(1), id] : [...s, id]));
  };
  const check = () => {
    if (sel.length < ch.picks.length) { setRes({ ok: false, text: `Escolha ${ch.picks.length} furos.` }); return; }
    const r = ch.check(sel, cfg);
    setRes(r);
    if (r.ok) {
      if (!doneList.includes(ch.id)) {
        markSeen('protoChallenges', ch.id);
        bump('protoChallenges');
        reward(`proto:challenge:${ch.id}`, 25, `Desafio: ${ch.title}`);
        if (fails > 0) bump('retries');
      }
    } else setFails((f) => f + 1);
  };
  const colors = ['#ff9f1c', '#7c4dff', '#16b862'];
  const fill = Object.fromEntries(sel.map((h, i) => [h, colors[i]]));
  return (
    <div className="split side-left">
      <div className="card">
        <h3>Desafios</h3>
        <div className="grid" style={{ gap: 6 }}>
          {CHALLENGES.map((c, i) => (
            <button key={c.id} className={`option ${i === ci ? 'correct' : ''}`} style={{ minHeight: 44 }} onClick={() => reset(i)}>
              <span className="letter">{doneList.includes(c.id) ? '✓' : i + 1}</span>
              <span>{c.title}</span>
            </button>
          ))}
        </div>
        <p className="small muted mt">{doneList.length} de {CHALLENGES.length} concluídos</p>
      </div>
      <div className="card">
        <h3>{ch.title}</h3>
        <MascotSays mood="think" size={60}>{ch.text}</MascotSays>
        <div className="row mt" style={{ gap: 6 }}>
          {ch.picks.map((p, i) => (
            <span key={p} className="chip" style={{ background: sel[i] ? colors[i] : '#eef1f7', color: sel[i] ? '#fff' : 'var(--ink-3)' }}>
              {i + 1}. {p}: {sel[i] ? holeLabel(sel[i]).replace('furo ', '') : '—'}
            </span>
          ))}
        </div>
        <div className="proto-stage mt">
          <svg viewBox={`-6 -6 ${BB_WIDTH + 12} ${BB_HEIGHT + 14}`} className="svg-fluid" aria-label="Protoboard do desafio">
            <BreadboardDefs />
            <PartsDefs />
            <Breadboard cfg={cfg} holeFill={fill} litNets={fails >= 2 ? ch.hint2(cfg) : []} onHole={click} />
            {ch.parts.map((p) => (
              <g key={p.id} pointerEvents="none">
                <PartGraphic part={p} legs={Object.fromEntries(Object.entries(legHoles(p)!).map(([k, h]) => [k, parseHole(h)!]))} st={{}} bbBottom={BB_HEIGHT} />
              </g>
            ))}
          </svg>
        </div>
        <div className="row mt">
          <button className="btn primary" onClick={check}><Check size={18} /> Verificar</button>
          <button className="btn ghost" onClick={() => { setSel([]); setRes(null); }}><RotateCcw size={16} /> Limpar</button>
          {res?.ok && ci < CHALLENGES.length - 1 && <button className="btn success" onClick={() => reset(ci + 1)}>Próximo desafio</button>}
        </div>
        {res && <div className={`feedback ${res.ok ? 'ok' : 'no'}`}>{res.text}</div>}
        {!res?.ok && fails >= 1 && <div className="mt"><Callout kind="tip" title={fails >= 2 ? 'Dica forte (caminho destacado)' : 'Dica'}><Lightbulb size={14} /> {ch.hint1}</Callout></div>}
      </div>
    </div>
  );
}

export { allHoles };
