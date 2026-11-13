import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell, Zuzu } from '../../components/shell';
import { Btn, Confetti, toast } from '../../components/ui';
import { MonsterInScene } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { INK } from '../../art/colors';
import { STAGES } from '../../game/missions';
import { POWERS } from '../../game/catalog';
import { playSound, sfx } from '../../lib/audio';
import { useTween } from '../../lib/util';
import type { AnimId, FaceSpec } from '../../game/types';

// O rio tem 4 espaços entre os penhascos (x de 300 a 700).
const SLOT_X = [350, 450, 550, 650];
const CLIFF_Y = 360;
export const PIECES = [
  { id: 'tabua', name: 'Tábua', icon: '🪵', solid: true },
  { id: 'tronco', name: 'Tronco', icon: '🌲', solid: true },
  { id: 'pedra', name: 'Pedra grande', icon: '🪨', solid: true },
  { id: 'caixa', name: 'Caixa', icon: '📦', solid: true },
  { id: 'folha', name: 'Folha', icon: '🍃', solid: false },
  { id: 'cogumelo', name: 'Cogumelo saltitante', icon: '🍄', solid: false },
  { id: 'balao', name: 'Balões', icon: '🎈', solid: false },
  { id: 'cipo', name: 'Cipó', icon: '🌿', solid: false },
];
const SOLUTION_NAMES: Record<string, string> = { ponte: 'Ponte de objetos', pulo: 'Supersalto no cogumelo', voo: 'Voo de balões', cipo: 'Balanço no cipó', poder: 'Superpoder', asas: 'Voar com as asas' };

function PieceArt({ id }: { id: string }) {
  switch (id) {
    case 'tabua': return <rect x={-50} y={-14} width={100} height={18} rx={4} fill="#c98a53" stroke={INK} strokeWidth={4} />;
    case 'tronco': return <g><rect x={-50} y={-22} width={100} height={26} rx={13} fill="#a8754e" stroke={INK} strokeWidth={4} /><ellipse cx={50} cy={-9} rx={7} ry={13} fill="#e0b98a" stroke={INK} strokeWidth={3} /></g>;
    case 'pedra': return <path d="M-48,40 C-54,-10 -30,-22 0,-22 C30,-22 54,-10 48,40Z" fill="#a7a9c4" stroke={INK} strokeWidth={4} />;
    case 'caixa': return <g><rect x={-40} y={-30} width={80} height={70} fill="#e0b060" stroke={INK} strokeWidth={4} /><path d="M-40,-30 L40,40 M40,-30 L-40,40" stroke="#b07a30" strokeWidth={4} /></g>;
    case 'folha': return <path d="M-50,0 C-30,-30 30,-30 50,0 C30,12 -30,12 -50,0Z" fill="#5fd068" stroke={INK} strokeWidth={4} />;
    case 'cogumelo': return <g><rect x={-10} y={-30} width={20} height={34} rx={6} fill="#fff6e6" stroke={INK} strokeWidth={4} /><path d="M-38,-26 C-38,-66 38,-66 38,-26Z" fill="#ff5c7a" stroke={INK} strokeWidth={4} /><circle cx={-12} cy={-44} r={6} fill="#fff" /></g>;
    case 'balao': return <g><path d="M0,0 V-50" stroke={INK} strokeWidth={2} /><ellipse cx={-14} cy={-70} rx={16} ry={20} fill="#ff5c7a" stroke={INK} strokeWidth={3} /><ellipse cx={12} cy={-78} rx={16} ry={20} fill="#3d8bff" stroke={INK} strokeWidth={3} /></g>;
    case 'cipo': return <path d="M0,-200 C-10,-140 10,-90 0,-30" fill="none" stroke="#3fae4a" strokeWidth={10} strokeLinecap="round" />;
    default: return null;
  }
}

type Run = { phase: 'idle' | 'walk' | 'fall' | 'win'; x: number; y: number; anim: AnimId; face?: FaceSpec };

export default function Bridge({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const br = data.adventures.bridge;
  const [pieces, setPieces] = useState<(string | null)[]>(br.pieces);
  const [brush, setBrush] = useState<string>('tabua');
  const [run, setRun] = useState<Run>({ phase: 'idle', x: 180, y: CLIFF_Y, anim: 'parado' });
  const [say, setSay] = useState('Coloquem objetos no rio e toquem em TESTAR!');
  const [win, setWin] = useState(false);
  const shown = useTween(run.x, run.y, 440);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  const hasWings = !!data.monster.parts.wings;
  const power = POWERS.find((p) => p.id === data.identity.power);
  const powerHelps = power && ['voar', 'superpulo', 'teleporte'].includes(power.id);

  const place = (i: number) => {
    if (run.phase !== 'idle') return;
    const next = [...pieces];
    if (next[i] === brush) next[i] = null;
    else next[i] = brush;
    sfx.place();
    setPieces(next);
    update('adventures', (a) => ({ ...a, bridge: { ...a.bridge, pieces: next } }));
  };

  const succeed = (kind: string, msg: string) => {
    later(0, () => {
      setRun((r) => ({ ...r, phase: 'win', anim: 'comemorar', face: FACE_PRESETS.find((f) => f.id === 'encantado')!.face }));
      setSay(msg);
      setWin(true);
      sfx.success();
      update('adventures', (a) => ({ ...a, bridge: { ...a.bridge, done: true, solutions: a.bridge.solutions.includes(kind) ? a.bridge.solutions : [...a.bridge.solutions, kind] } }), { immediate: true });
      if (!br.solutions.includes(kind) && br.solutions.length >= 1) toast(`Nova solução: ${SOLUTION_NAMES[kind]}!`, '💡', 'ok');
    });
  };
  const fail = (x: number, msg: string) => {
    setRun({ phase: 'fall', x, y: 520, anim: 'susto', face: FACE_PRESETS.find((f) => f.id === 'assustado')!.face });
    playSound('splash');
    setSay(msg);
    later(1800, () => {
      setRun({ phase: 'idle', x: 180, y: CLIFF_Y, anim: 'parado' });
      setSay('Tudo bem! Vamos tentar outra combinação? 💪');
    });
  };

  const test = (special?: 'poder' | 'asas') => {
    if (run.phase !== 'idle') return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setWin(false);
    update('adventures', (a) => ({ ...a, bridge: { ...a.bridge, tests: a.bridge.tests + 1 } }));
    setRun({ phase: 'walk', x: 180, y: CLIFF_Y, anim: 'andar' });
    playSound('passos', 0, 0.6);
    if (special) {
      later(400, () => { setRun((r) => ({ ...r, x: 500, y: 200, anim: special === 'asas' ? 'pular' : 'comemorar' })); playSound(special === 'asas' ? 'vento' : power?.sound ?? 'magia'); });
      later(1600, () => { setRun((r) => ({ ...r, x: 820, y: CLIFF_Y })); });
      succeed(special, special === 'asas' ? 'As asas do monstrinho funcionaram! Voou por cima do rio!' : `Usou o superpoder ${power?.name}! Que ideia!`);
      return;
    }
    // soluções especiais com objetos
    if (pieces[0] === 'cogumelo') {
      later(500, () => { setRun((r) => ({ ...r, x: 350, anim: 'pular' })); playSound('boing'); });
      later(900, () => setRun((r) => ({ ...r, x: 600, y: 160 })));
      later(1700, () => setRun((r) => ({ ...r, x: 820, y: CLIFF_Y })));
      later(2300, () => succeed('pulo', 'BOING! O cogumelo jogou o monstrinho para o outro lado!'));
      return;
    }
    const balloonAt = pieces.indexOf('balao');
    if (balloonAt >= 0) {
      later(500, () => { setRun((r) => ({ ...r, x: SLOT_X[balloonAt], y: 230, anim: 'comemorar' })); playSound('pop'); });
      later(1500, () => setRun((r) => ({ ...r, x: 820, y: 230 })));
      later(2300, () => setRun((r) => ({ ...r, y: CLIFF_Y })));
      later(2700, () => succeed('voo', 'Os balões levaram o monstrinho voando!'));
      return;
    }
    const vineAt = pieces.findIndex((p, i) => p === 'cipo' && (i === 1 || i === 2));
    if (vineAt >= 0) {
      later(500, () => { setRun((r) => ({ ...r, x: 300 })); playSound('vento'); });
      later(1000, () => setRun((r) => ({ ...r, x: SLOT_X[vineAt], y: 300 })));
      later(1600, () => setRun((r) => ({ ...r, x: 820, y: CLIFF_Y })));
      later(2100, () => succeed('cipo', 'Uhuuul! Atravessou se balançando no cipó!'));
      return;
    }
    // ponte: anda espaço por espaço
    let t = 400;
    for (let i = 0; i < 4; i++) {
      const p = pieces[i];
      const def = PIECES.find((x) => x.id === p);
      const x = SLOT_X[i];
      if (!def || !def.solid) {
        later(t, () => fail(x, !p ? 'Tchibum! Faltou um pedaço da ponte!' : p === 'folha' ? 'A folha não aguentou o peso! Tchibum!' : `Ops! ${def?.name} sozinho não segura. Tchibum!`));
        return;
      }
      later(t, () => { setRun((r) => ({ ...r, x })); playSound('passinhos', 0, 0.5); });
      t += 450;
    }
    later(t, () => setRun((r) => ({ ...r, x: 820 })));
    later(t + 500, () => succeed('ponte', 'A ponte aguentou! O monstrinho atravessou!'));
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setWin(false);
    setRun({ phase: 'idle', x: 180, y: CLIFF_Y, anim: 'parado' });
    setSay('Que tal tentar outra solução?');
  };

  return (
    <ToolShell title="A ponte quebrada" icon="🌉" color={STAGES[4].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="relative min-h-[260px] flex-1" style={{ background: 'linear-gradient(#7fd3ff, #d8f4ff)' }}>
          <svg viewBox="0 0 1000 600" className="h-full w-full" preserveAspectRatio="xMidYMid meet" data-testid="bridge-scene">
            <rect x={0} y={0} width={1000} height={600} fill="url(#brsky)" />
            <defs><linearGradient id="brsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6fd3ff" /><stop offset="1" stopColor="#d8f4ff" /></linearGradient></defs>
            <circle cx={880} cy={90} r={46} fill="#ffd23f" stroke={INK} strokeWidth={4} />
            <rect x={280} y={420} width={440} height={180} fill="#2fb3e0" />
            <path d="M280,440 Q330,428 380,440 T480,440 T580,440 T680,440 T720,440" fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="30 24" className="sc-flow" />
            <path d="M0,360 L300,360 L320,600 L0,600Z" fill="#8fcf6a" stroke={INK} strokeWidth={5} />
            <path d="M700,360 L1000,360 L1000,600 L680,600Z" fill="#8fcf6a" stroke={INK} strokeWidth={5} />
            <path d="M0,360 L300,360 L304,390 L0,390Z M700,360 L1000,360 L1000,390 L696,390Z" fill="#69c25a" />
            {SLOT_X.map((x, i) => (
              <g key={i} onClick={() => place(i)} style={{ cursor: 'pointer' }} data-testid={`slot-${i}`}>
                <rect x={x - 50} y={CLIFF_Y - 70} width={100} height={170} fill="transparent" />
                {!pieces[i] && <rect x={x - 46} y={CLIFF_Y - 10} width={92} height={30} rx={10} fill="#fff" opacity={0.5} stroke={INK} strokeWidth={3} strokeDasharray="8 8" />}
                {!pieces[i] && <text x={x} y={CLIFF_Y + 12} textAnchor="middle" fontSize={22} fontWeight={700} fill={INK} opacity={0.6}>{i + 1}</text>}
                {pieces[i] && <g transform={`translate(${x} ${CLIFF_Y + (pieces[i] === 'pedra' || pieces[i] === 'caixa' ? 20 : 8)})`}><PieceArt id={pieces[i]!} /></g>}
              </g>
            ))}
            <text x={820} y={250} textAnchor="middle" fontSize={56}>🏁</text>
            <MonsterInScene m={data.monster} x={shown.x} y={shown.y} h={160} anim={run.anim} face={run.face} />
          </svg>
          <div className="pointer-events-none absolute left-1/2 top-2 max-w-[90%] -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-center text-lg font-bold shadow-chunky" data-testid="bridge-say">{say}</div>
          {win && <Confetti count={60} />}
        </div>
        <div className="scroll-y min-h-0 border-t-4 border-ink bg-cream p-3 lg:w-[36%] lg:border-l-4 lg:border-t-0">
          <h2 className="mb-1 text-lg font-bold">1. Escolha um objeto</h2>
          <div className="grid-fill-sm">
            {PIECES.map((p) => (
              <button key={p.id} type="button" className="tile" aria-pressed={brush === p.id} onClick={() => { sfx.select(); setBrush(p.id); }} data-testid={`piece-${p.id}`}>
                <span className="text-3xl">{p.icon}</span>
                <span className="text-[11px] font-bold leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
          <h2 className="mb-1 mt-3 text-lg font-bold">2. Toque nos espaços do rio (1 a 4)</h2>
          <div className="flex gap-2">
            <Btn variant="lime" big className="flex-1" onClick={() => test()} disabled={run.phase !== 'idle'} data-testid="bridge-test">▶ TESTAR</Btn>
            <Btn onClick={() => { const e = [null, null, null, null]; setPieces(e); update('adventures', (a) => ({ ...a, bridge: { ...a.bridge, pieces: e } })); reset(); }}>🗑️</Btn>
          </div>
          {(hasWings || powerHelps) && (
            <div className="mt-3 rounded-2xl border-[3px] border-dashed border-grape bg-white p-2">
              <p className="mb-2 text-sm font-bold">💡 Ideia: usem o que vocês criaram!</p>
              <div className="flex flex-wrap gap-2">
                {hasWings && <Btn variant="aqua" onClick={() => test('asas')} disabled={run.phase !== 'idle'} data-testid="bridge-wings">🦋 Voar com as asas</Btn>}
                {powerHelps && <Btn variant="sun" onClick={() => test('poder')} disabled={run.phase !== 'idle'}>{power!.icon} {power!.name}</Btn>}
              </div>
            </div>
          )}
          {win && <Btn className="mt-3 w-full" onClick={reset}>🔁 Testar outra solução</Btn>}
          <div className="mt-3 rounded-2xl bg-white p-2">
            <Zuzu size={56} text={<span className="text-base">Soluções descobertas: <b>{br.solutions.length}</b>{br.solutions.length > 0 && <> ({br.solutions.map((s) => SOLUTION_NAMES[s]).join(', ')})</>}. Existem várias!</span>} />
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
