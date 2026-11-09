/**
 * Ferramenta D — "O que acontece se...?"
 * O estudante muda um valor do código, faz uma previsão e depois vê o resultado,
 * executado de verdade pelo interpretador no simulador.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { checkCode } from '../lib/cpp/check';
import { Simulator } from '../lib/sim/simulator';
import { C_BLINK13, C_BUZZER, C_PROJ_LUZ } from '../data/circuits';
import type { Circuit } from '../lib/circuit/types';
import { CodeBlock } from './ui';
import { useProgress } from '../lib/progress';

interface Scenario {
  id: string;
  title: string;
  label: string;
  values: string[];
  code: (v: string) => string;
  circuit: Circuit;
  part: string;
  question: string;
  options: string[];
  correct: (v: string) => number;
  explain: (v: string) => string;
  sound?: boolean;
}

const blink = (d: string) => `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(${d});\n  digitalWrite(13, LOW);\n  delay(${d});\n}`;

export const SCENARIOS: Scenario[] = [
  {
    id: 'delay', title: 'Mudando o delay', label: 'Valor do delay (ms)', values: ['100', '500', '1000', '2000'],
    code: blink, circuit: C_BLINK13, part: 'al',
    question: 'O que vai acontecer com o LED?',
    options: ['Pisca muito rápido: 5 vezes por segundo', 'Pisca 1 vez por segundo', 'Pisca devagar: 1 vez a cada 2 segundos', 'Pisca bem devagar: 1 vez a cada 4 segundos'],
    correct: (v) => ['100', '500', '1000', '2000'].indexOf(v),
    explain: (v) => `Com delay(${v}), o LED fica ${v} ms aceso e ${v} ms apagado. Uma piscada completa dura ${Number(v) * 2} ms = ${String((Number(v) * 2) / 1000).replace('.', ',')} s. Quanto MAIOR o delay, mais DEVAGAR o LED pisca.`,
  },
  {
    id: 'high', title: 'HIGH ou LOW no setup', label: 'Valor escrito no setup()', values: ['HIGH', 'LOW'],
    code: (v) => `void setup() {\n  pinMode(13, OUTPUT);\n  digitalWrite(13, ${v});\n}\n\nvoid loop() {\n  // vazio\n}`,
    circuit: C_BLINK13, part: 'al',
    question: 'O loop está vazio. O que acontece com o LED?',
    options: ['Fica aceso o tempo todo', 'Fica apagado o tempo todo', 'Fica piscando'],
    correct: (v) => (v === 'HIGH' ? 0 : 1),
    explain: (v) => `O setup() roda uma vez e deixa o pino em ${v}. Como o loop está vazio, nada muda depois: o LED fica ${v === 'HIGH' ? 'aceso' : 'apagado'} para sempre.`,
  },
  {
    id: 'pinmode', title: 'Esquecendo o pinMode', label: 'O programa tem pinMode?', values: ['com pinMode', 'sem pinMode'],
    code: (v) => `void setup() {\n${v === 'com pinMode' ? '  pinMode(13, OUTPUT);\n' : '  // pinMode(13, OUTPUT);  <- esquecido!\n'}}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}`,
    circuit: C_BLINK13, part: 'al',
    question: 'Como o LED vai piscar?',
    options: ['Normalmente, com brilho forte', 'Bem fraquinho, quase apagado', 'O LED queima'],
    correct: (v) => (v === 'com pinMode' ? 0 : 1),
    explain: (v) => (v === 'com pinMode' ? 'Com o pinMode(13, OUTPUT) o pino fornece corrente suficiente e o LED pisca com brilho normal.' : 'Sem o pinMode, o pino continua como ENTRADA. O digitalWrite(HIGH) só liga um resistor interno muito grande (pull-up): passa uma corrente minúscula e o LED quase não acende. É um erro muito comum!'),
  },
  {
    id: 'tone', title: 'Frequência do som', label: 'Frequência no tone() (Hz)', values: ['262', '523', '1047'],
    code: (v) => `void setup() {\n  pinMode(8, OUTPUT);\n}\n\nvoid loop() {\n  tone(8, ${v});\n  delay(500);\n  noTone(8);\n  delay(500);\n}`,
    circuit: C_BUZZER, part: 'bz', sound: true,
    question: 'Como vai ser o som?',
    options: ['Grave (mais "grosso")', 'Médio', 'Agudo (mais "fino")'],
    correct: (v) => ['262', '523', '1047'].indexOf(v),
    explain: (v) => `${v} Hz significa ${v} vibrações por segundo. Quanto maior a frequência, mais agudo o som. 262 Hz é o Dó; 523 Hz é o Dó uma oitava acima (o dobro); 1047 Hz, mais uma oitava.`,
  },
  {
    id: 'for', title: 'Quantas repetições?', label: 'Número no for', values: ['2', '3', '5'],
    code: (v) => `void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  for (int i = 0; i < ${v}; i++) {\n    digitalWrite(13, HIGH);\n    delay(200);\n    digitalWrite(13, LOW);\n    delay(200);\n  }\n  delay(1500);   // pausa\n}`,
    circuit: C_BLINK13, part: 'al',
    question: 'Quantas piscadas o LED dá antes de cada pausa?',
    options: ['2', '3', '5', '10'],
    correct: (v) => ['2', '3', '5'].indexOf(v),
    explain: (v) => `O for começa com i = 0 e repete enquanto i < ${v}: i vale ${Array.from({ length: Number(v) }, (_, k) => k).join(', ')}. São ${v} repetições, então ${v} piscadas.`,
  },
  {
    id: 'pwm', title: 'Brilho com analogWrite', label: 'Valor do analogWrite (0–255)', values: ['0', '64', '128', '255'],
    code: (v) => `void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(9, ${v});\n}`,
    circuit: C_PROJ_LUZ, part: 'al',
    question: 'Como fica o brilho do LED no pino 9?',
    options: ['Apagado', 'Fraco', 'Médio', 'Máximo'],
    correct: (v) => ['0', '64', '128', '255'].indexOf(v),
    explain: (v) => `analogWrite(9, ${v}) deixa o pino ligado ${Math.round((Number(v) / 255) * 100)}% do tempo (PWM). O olho percebe isso como ${['nenhum brilho', 'um brilho fraco', 'um brilho médio', 'o brilho máximo'][['0', '64', '128', '255'].indexOf(v)]}.`,
  },
];

/** Roda um código no simulador e mostra o LED ou o buzzer com um gráfico do tempo. */
export function MiniSim({ code, circuit, part, sound }: { code: string; circuit: Circuit; part: string; sound?: boolean }) {
  const [, setF] = useState(0);
  const [muted, setMuted] = useState(false);
  const simRef = useRef<Simulator | null>(null);
  const hist = useRef<number[]>([]);
  const audio = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);
  useEffect(() => {
    const r = checkCode(code);
    const s = new Simulator(circuit);
    s.setProgram(r.program);
    s.setPowered(true);
    simRef.current = s;
    hist.current = [];
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      s.step(t - last);
      last = t;
      const p = s.analysis().parts[part];
      hist.current.push(sound ? (p?.sound ? 1 : 0) : p?.brightness ?? 0);
      if (hist.current.length > 240) hist.current.shift();
      setF((f) => (f + 1) % 1e9);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [code, circuit, part, sound]);
  const s = simRef.current;
  const res = s?.analysis().parts[part];
  const b = res?.brightness ?? 0;
  const freq = res?.sound ?? null;
  useEffect(() => {
    if (!sound) return;
    try {
      if (freq && !muted) {
        if (!audio.current) {
          const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AC();
          const gain = ctx.createGain();
          gain.gain.value = 0.04;
          gain.connect(ctx.destination);
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.connect(gain);
          osc.start();
          audio.current = { ctx, osc, gain };
        }
        audio.current.gain.gain.setValueAtTime(0.04, audio.current.ctx.currentTime);
        audio.current.osc.frequency.setValueAtTime(freq, audio.current.ctx.currentTime);
      } else if (audio.current) audio.current.gain.gain.setValueAtTime(0, audio.current.ctx.currentTime);
    } catch { /* sem áudio */ }
  }, [freq, muted, sound]);
  useEffect(() => () => { try { audio.current?.osc.stop(); audio.current?.ctx.close(); } catch { /* */ } }, []);
  const pts = hist.current.map((v, i) => `${i * 2},${46 - v * 40}`).join(' ');
  return (
    <div className="card tinted" style={{ padding: 14 }}>
      <div className="row" style={{ flexWrap: 'nowrap', gap: 16 }}>
        <svg width="90" height="90" viewBox="-45 -45 90 90" aria-label={sound ? 'Buzzer' : `LED com brilho ${Math.round(b * 100)}%`}>
          {sound ? (
            <g>
              {freq && <circle r="40" fill="none" stroke="#7c4dff" strokeWidth="3" className="sound-wave" />}
              <circle r="30" fill="#1f2128" />
              <circle r="20" fill="#2c2f38" />
              <circle r="5" fill="#0b0c10" />
            </g>
          ) : (
            <g>
              {b > 0 && <circle r={24 + b * 18} fill="#ff5a5a" opacity={0.25 + b * 0.5} filter="url(#wb)" />}
              <defs><filter id="wb"><feGaussianBlur stdDeviation="6" /></filter></defs>
              <circle r="22" fill={b > 0 ? '#ff4040' : '#b83a3a'} opacity={0.6 + b * 0.4} stroke="rgba(0,0,0,.3)" />
              <circle cx="-7" cy="-7" r="6" fill="#fff" opacity={0.4 + b * 0.5} />
            </g>
          )}
        </svg>
        <div style={{ flex: 1 }}>
          <div className="small muted">{sound ? (freq ? `Tocando ${freq} Hz` : 'Silêncio') : `Brilho: ${Math.round(b * 100)}%`} · tempo: {((s?.time ?? 0) / 1000).toFixed(1).replace('.', ',')} s</div>
          <svg viewBox="0 0 480 50" style={{ width: '100%', height: 60, background: '#141a33', borderRadius: 10 }} preserveAspectRatio="none" aria-hidden>
            <polyline points={pts} fill="none" stroke={sound ? '#a78bfa' : '#ffd43b'} strokeWidth="2" />
          </svg>
          <div className="small muted">Gráfico dos últimos 4 segundos ({sound ? 'som ligado/desligado' : 'brilho do LED'}).</div>
        </div>
        {sound && <button className="btn small ghost" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Ligar som' : 'Desligar som'}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>}
      </div>
    </div>
  );
}

export function WhatIf() {
  const [sid, setSid] = useState(SCENARIOS[0].id);
  const sc = SCENARIOS.find((x) => x.id === sid)!;
  const [value, setValue] = useState(sc.values[0]);
  const [pick, setPick] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const { reward, bump } = useProgress();
  useEffect(() => { setValue(sc.values[Math.min(1, sc.values.length - 1)]); setPick(null); setShow(false); }, [sid]);
  const code = useMemo(() => sc.code(value), [sc, value]);
  const correct = sc.correct(value);
  return (
    <div className="stack">
      <div className="row" style={{ gap: 6 }}>
        {SCENARIOS.map((x) => <button key={x.id} className={`btn small ${x.id === sid ? 'on' : 'ghost'}`} onClick={() => setSid(x.id)}>{x.title}</button>)}
      </div>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="stack" style={{ gap: 10 }}>
          <label className="field">{sc.label}
            <div className="row" style={{ gap: 6 }}>
              {sc.values.map((v) => (
                <button key={v} className={`btn small ${v === value ? 'on' : 'ghost'}`} onClick={() => { setValue(v); setPick(null); setShow(false); }}>{v}</button>
              ))}
            </div>
          </label>
          <CodeBlock code={code} copy={false} />
        </div>
        <div className="stack" style={{ gap: 10 }}>
          <h3>1) Faça sua previsão: {sc.question}</h3>
          <div className="options">
            {sc.options.map((o, i) => (
              <button key={i} className={`option ${pick !== null && i === correct ? 'correct' : ''} ${pick === i && i !== correct ? 'wrong' : ''}`} disabled={pick !== null} onClick={() => { setPick(i); if (i === correct) reward(`whatif:${sc.id}:${value}`, 10, 'Previsão certa!'); else bump('retries'); }}>
                <span className="letter">{String.fromCharCode(65 + i)}</span>{o}
              </button>
            ))}
          </div>
          {pick !== null && (
            <>
              <div className={`feedback ${pick === correct ? 'ok' : 'no'}`}><strong>{pick === correct ? 'Previsão certa!' : 'Não foi bem isso.'}</strong> {sc.explain(value)}</div>
              <h3>2) Veja o resultado</h3>
              {!show ? (
                <button className="btn success" style={{ width: 'fit-content' }} onClick={() => setShow(true)}><Play size={18} /> Rodar o código</button>
              ) : (
                <MiniSim key={code} code={code} circuit={sc.circuit} part={sc.part} sound={sc.sound} />
              )}
              <button className="btn ghost small" style={{ width: 'fit-content' }} onClick={() => { setPick(null); setShow(false); }}><RotateCcw size={16} /> Prever de novo</button>
            </>
          )}
          <p className="small muted">O resultado é produzido executando o código no simulador didático da plataforma.</p>
        </div>
      </div>
    </div>
  );
}
