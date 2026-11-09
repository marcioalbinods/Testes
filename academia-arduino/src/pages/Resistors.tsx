/** Calculadora de resistores: código de cores, exercícios e resistor para LED (Lei de Ohm). */
import { useMemo, useState } from 'react';
import { Calculator, Check, RefreshCw } from 'lucide-react';
import { BAND_COLORS, bandsToOhms, colorById, formatOhmsLong, ledResistor, ohmsToBands } from '../lib/resistor';
import { Callout, PageHead, Tabs } from '../components/ui';
import { useProgress } from '../lib/progress';

function ResistorDrawing({ bands }: { bands: string[] }) {
  const five = bands.length === 5;
  const pos = five ? [-28, -17, -6, 5, 26] : [-26, -14, -2, 22];
  return (
    <svg viewBox="-80 -22 160 44" className="svg-fluid" style={{ maxWidth: 520, margin: '0 auto' }} role="img" aria-label={`Resistor com faixas ${bands.map((b) => colorById(b).name).join(', ')}`}>
      <line x1="-78" y1="0" x2="78" y2="0" stroke="#b9bfca" strokeWidth="3" strokeLinecap="round" />
      <path d="M-46 -12 q-8 0 -8 12 q0 12 8 12 h4 q4 -3 10 -3 h64 q6 0 10 3 h4 q8 0 8 -12 q0 -12 -8 -12 h-4 q-4 3 -10 3 h-64 q-6 0 -10 -3 z" fill="#e8cf9c" stroke="#b49a63" />
      {bands.map((b, i) => (
        <rect key={i} x={pos[i] - 3} y={i === 0 || i === bands.length - 1 ? -12 : -9} width="6" height={i === 0 || i === bands.length - 1 ? 24 : 18} fill={colorById(b).hex} stroke="rgba(0,0,0,.15)" />
      ))}
    </svg>
  );
}

const DIGITS = BAND_COLORS.filter((c) => c.digit !== null);
const MULTS = BAND_COLORS.filter((c) => c.multiplier !== null);
const TOLS = BAND_COLORS.filter((c) => c.tolerance !== null);

export function ResistorsPage() {
  const [tab, setTab] = useState<'cores' | 'exercicios' | 'led'>('cores');
  return (
    <div className="stack">
      <PageHead icon={<Calculator size={30} />} color="#0f9a50" title="Calculadora de resistores" subtitle="Descubra o valor de um resistor pelas cores, treine com exercícios e calcule o resistor certo para um LED." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'cores', label: 'Código de cores' }, { id: 'exercicios', label: 'Exercícios' }, { id: 'led', label: 'Resistor para LED' }]} />
      {tab === 'cores' && <ColorCalc />}
      {tab === 'exercicios' && <Exercises />}
      {tab === 'led' && <LedCalc />}
    </div>
  );
}

function ColorCalc() {
  const [five, setFive] = useState(false);
  const [bands, setBands] = useState(['red', 'red', 'brown', 'gold']);
  const shown = bands;
  const set = (i: number, id: string) => setBands((b) => b.map((x, k) => (k === i ? id : x)));
  const toggle = (v: boolean) => {
    setFive(v);
    setBands(v ? ['brown', 'black', 'black', 'brown', 'brown'] : ['red', 'red', 'brown', 'gold']);
  };
  const value = bandsToOhms(shown);
  const tol = colorById(shown[shown.length - 1]).tolerance;
  const nd = five ? 3 : 2;
  const cols = five ? ['1º algarismo', '2º algarismo', '3º algarismo', 'Multiplicador', 'Tolerância'] : ['1º algarismo', '2º algarismo', 'Multiplicador', 'Tolerância'];
  const lists = five ? [DIGITS, DIGITS, DIGITS, MULTS, TOLS] : [DIGITS, DIGITS, MULTS, TOLS];
  const digitsStr = shown.slice(0, nd).map((b) => colorById(b).digit).join('');
  const mult = colorById(shown[nd]).multiplier!;
  return (
    <div className="stack">
      <div className="card">
        <div className="row between">
          <div className="tabs">
            <button className={`tab ${!five ? 'active' : ''}`} onClick={() => toggle(false)}>4 faixas</button>
            <button className={`tab ${five ? 'active' : ''}`} onClick={() => toggle(true)}>5 faixas</button>
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 700, color: 'var(--purple-700)' }}>{formatOhmsLong(value)} <span style={{ fontSize: '1rem', color: 'var(--ink-3)' }}>± {String(tol).replace('.', ',')}%</span></div>
        </div>
        <ResistorDrawing bands={shown} />
        <Callout kind="info" title="Como ler">
          {digitsStr.split('').join(' e ')} formam o número <strong>{Number(digitsStr)}</strong>; o multiplicador ({colorById(shown[nd]).name}) vale ×{String(mult).replace('.', ',')}. Então: {Number(digitsStr)} × {String(mult).replace('.', ',')} = <strong>{formatOhmsLong(value)}</strong>. A última faixa (tolerância) diz quanto o valor real pode variar: ±{String(tol).replace('.', ',')}%.
          A faixa de tolerância (dourada ou prateada) fica mais afastada: comece a ler pelo outro lado.
        </Callout>
      </div>
      <div className="band-picker">
        {cols.map((name, i) => (
          <div key={name} className="card band-col" style={{ padding: 10 }}>
            <strong className="small" style={{ fontFamily: 'var(--font-head)' }}>{name}</strong>
            {lists[i].map((c) => (
              <button key={c.id} className={`band-btn ${shown[i] === c.id ? 'on' : ''}`} onClick={() => set(i, c.id)}>
                <span className="sw" style={{ background: c.hex }} />
                {c.name}
                <span className="muted small" style={{ marginLeft: 'auto' }}>
                  {i < nd ? c.digit : i === nd ? `×${c.multiplier! >= 1000 ? formatOhmsLong(c.multiplier!).replace(' Ω', '') : String(c.multiplier).replace('.', ',')}` : `±${String(c.tolerance).replace('.', ',')}%`}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const EX_VALUES = [100, 150, 220, 330, 470, 680, 1000, 2200, 4700, 10000, 22000, 47000, 100000];

function Exercises() {
  const { bump, reward, state } = useProgress();
  const make = () => {
    const v = EX_VALUES[Math.floor(Math.random() * EX_VALUES.length)];
    const opts = new Set([v]);
    while (opts.size < 4) opts.add(EX_VALUES[Math.floor(Math.random() * EX_VALUES.length)]);
    return { v, opts: [...opts].sort(() => Math.random() - 0.5) };
  };
  const [ex, setEx] = useState(make);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const bands = useMemo(() => ohmsToBands(ex.v), [ex]);
  const choose = (o: number) => {
    if (pick !== null) return;
    setPick(o);
    if (o === ex.v) {
      setScore((s) => s + 1);
      bump('resistorOk');
      reward(`resistor:${(state.counters.resistorOk ?? 0) + 1}`, 5);
    } else bump('retries');
  };
  return (
    <div className="card stack">
      <div className="row between">
        <h3 style={{ margin: 0 }}>Qual é o valor deste resistor?</h3>
        <span className="score-pill">Acertos: {score}</span>
      </div>
      <ResistorDrawing bands={bands} />
      <p className="small muted center">Cores: {bands.map((b) => colorById(b).name).join(' · ')}</p>
      <div className="grid cols-4">
        {ex.opts.map((o) => (
          <button key={o} className={`option ${pick !== null && o === ex.v ? 'correct' : ''} ${pick === o && o !== ex.v ? 'wrong' : ''}`} onClick={() => choose(o)} disabled={pick !== null}>
            <span className="letter">Ω</span>{formatOhmsLong(o)}
          </button>
        ))}
      </div>
      {pick !== null && (
        <div className={`feedback ${pick === ex.v ? 'ok' : 'no'}`}>
          {pick === ex.v ? 'Acertou! ' : 'Quase! '}
          {colorById(bands[0]).name} ({colorById(bands[0]).digit}), {colorById(bands[1]).name} ({colorById(bands[1]).digit}) e multiplicador {colorById(bands[2]).name} (×{String(colorById(bands[2]).multiplier).replace('.', ',')}) = {formatOhmsLong(ex.v)}.
        </div>
      )}
      {pick !== null && <button className="btn primary" style={{ width: 'fit-content' }} onClick={() => { setEx(make()); setPick(null); }}><RefreshCw size={16} /> Próximo</button>}
    </div>
  );
}

function LedCalc() {
  const [vs, setVs] = useState('5');
  const [vf, setVf] = useState('2');
  const [ma, setMa] = useState('15');
  const num = (s: string) => Number(s.replace(',', '.'));
  const r = ledResistor(num(vs), num(vf), num(ma));
  const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="card stack">
        <h3>Informe os valores</h3>
        <label className="field">Tensão da alimentação (V)
          <input type="text" inputMode="decimal" value={vs} onChange={(e) => setVs(e.target.value)} />
          <span className="small muted" style={{ fontWeight: 400 }}>Pino do Arduino ou 5V: 5 V.</span>
        </label>
        <label className="field">Tensão aproximada do LED (V)
          <select value={vf} onChange={(e) => setVf(e.target.value)}>
            <option value="2">Vermelho ≈ 2,0 V</option>
            <option value="2.1">Amarelo ≈ 2,1 V</option>
            <option value="2.2">Verde ≈ 2,2 V</option>
            <option value="3">Azul ≈ 3,0 V</option>
            <option value="3.1">Branco ≈ 3,1 V</option>
          </select>
          <span className="small muted" style={{ fontWeight: 400 }}>Os valores exatos variam: veja a folha de dados (datasheet) do LED.</span>
        </label>
        <label className="field">Corrente desejada (mA)
          <input type="text" inputMode="decimal" value={ma} onChange={(e) => setMa(e.target.value)} />
          <span className="small muted" style={{ fontWeight: 400 }}>Recomendado: 10 a 15 mA (máximo 20 mA por pino).</span>
        </label>
      </div>
      <div className="card stack">
        <h3>Resultado</h3>
        {!r.ok ? (
          <Callout kind="danger">{r.error}</Callout>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 700, color: 'var(--purple-700)' }}>
              Use {formatOhmsLong(r.commercial)}
            </div>
            <ResistorDrawing bands={ohmsToBands(r.commercial)} />
            <ol className="stack" style={{ gap: 6, paddingLeft: 20 }}>
              <li><strong>Lei de Ohm:</strong> R = V ÷ I.</li>
              <li><strong>Tensão que sobra para o resistor:</strong> {fmt(num(vs), 1)} V − {fmt(num(vf), 1)} V = {fmt(num(vs) - num(vf))} V.</li>
              <li><strong>Corrente:</strong> {fmt(num(ma), 1)} mA = {fmt(num(ma) / 1000, 3)} A.</li>
              <li><strong>Resistência:</strong> {fmt(num(vs) - num(vf))} V ÷ {fmt(num(ma) / 1000, 3)} A = <strong>{fmt(r.r, 1)} Ω</strong>.</li>
              <li><strong>Valor comercial:</strong> escolhemos o próximo valor que existe nas lojas, para cima (mais seguro): <strong>{formatOhmsLong(r.commercial)}</strong>.</li>
              <li>Com {formatOhmsLong(r.commercial)}, a corrente fica em cerca de <strong>{fmt(r.realCurrent * 1000, 1)} mA</strong> e o resistor dissipa {fmt(r.power * 1000, 0)} mW.</li>
            </ol>
            {r.warnings.map((w) => <Callout key={w} kind="safety">{w}</Callout>)}
            <Callout kind="safety" title="Limites do Arduino Uno">Cada pino: até 20 mA recomendados (40 mA é o limite absoluto, que NÃO deve ser atingido). Soma de todos os pinos: até cerca de 200 mA.</Callout>
          </>
        )}
        <button className="btn ghost small" onClick={() => { setVs('5'); setVf('2'); setMa('15'); }}><Check size={16} /> Valores típicos</button>
      </div>
    </div>
  );
}
