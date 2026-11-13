import { useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell, Zuzu } from '../../components/shell';
import { Btn, Confetti } from '../../components/ui';
import { SceneView } from '../../art/SceneView';
import { MonsterInScene, MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { STAGES } from '../../game/missions';
import { NPCS } from '../../game/npcs';
import { FOODS, POWERS, STICKERS, itemName } from '../../game/catalog';
import { playSound, sfx } from '../../lib/audio';
import { playSignature } from '../../lib/signature';
import { PowerFx } from '../identity/Power';
import { svgPoint } from '../../lib/util';
import type { AnimId, SceneObj } from '../../game/types';

const face = (id: string) => FACE_PRESETS.find((f) => f.id === id)!.face;
const pipoca = NPCS.find((n) => n.id === 'pipoca')!;
const o = (uid: string, type: string, x: number, y: number, s = 1): SceneObj => ({ uid, type, x, y, s, r: 0, flip: false, z: 0 });
const SCENE: SceneObj[] = [o('a', 'pinheiro', 80, 420), o('b', 'arvore', 230, 400, 0.8), o('c', 'pedra', 640, 470), o('d', 'arbusto', 900, 450), o('e', 'flor', 400, 560), o('f', 'cogumelo', 520, 590), o('g', 'grama', 760, 580)];
const HOME = { x: 930, y: 300 };

const QUESTIONS = [
  { id: 'triste', q: 'Por que você está triste?', a: 'Eu me perdi da minha família... 😢' },
  { id: 'nome', q: 'Qual é o seu nome?', a: 'Eu sou o Pipoca! Sou pequenininho.' },
  { id: 'casa', q: 'Onde fica a sua casa?', a: 'Lá no alto da colina, perto das nuvens!' },
  { id: 'fome', q: 'Você está com fome?', a: 'Um pouquinho... minha barriga ronca!' },
];

type Solution = 'poder' | 'som' | 'lanche' | 'mapa';

export default function LostFriend({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const fr = data.adventures.friend;
  const [step, setStep] = useState<'conversa' | 'ajudar' | 'resultado' | 'cartao' | 'fim'>(fr.done ? 'fim' : fr.talked.length >= 2 ? 'ajudar' : 'conversa');
  const [answer, setAnswer] = useState<string | null>(null);
  const [anim, setAnim] = useState<AnimId>('parado');
  const [pip, setPip] = useState<{ anim: AnimId; face: string; x: number; y: number }>({ anim: 'parado', face: 'triste', x: 700, y: 520 });
  const [fx, setFx] = useState(0);
  const [result, setResult] = useState('');
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const drawing = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [text, setText] = useState(fr.card?.text ?? '');
  const [sticker, setSticker] = useState(fr.card?.sticker ?? 'coracao');
  const [color, setColor] = useState(fr.card?.color ?? '#ffe0ef');
  const [mapMode, setMapMode] = useState(false);
  const power = POWERS.find((p) => p.id === data.identity.power) ?? POWERS[0];
  const food = itemName(FOODS, data.identity.food) ?? FOODS[0];

  const ask = (qid: string) => {
    const q = QUESTIONS.find((x) => x.id === qid)!;
    sfx.tap();
    setAnswer(q.a);
    setPip((p) => ({ ...p, anim: 'parado', face: qid === 'nome' ? 'feliz' : 'triste' }));
    playSound('risadinha', 0.8, 0.5);
    if (!fr.talked.includes(qid)) update('adventures', (a) => ({ ...a, friend: { ...a.friend, talked: [...a.friend.talked, qid] } }));
  };

  const solved = (sol: Solution, msg: string) => {
    setResult(msg);
    setStep('resultado');
    setPip((p) => ({ ...p, anim: 'comemorar', face: 'encantado' }));
    setAnim('comemorar');
    sfx.success();
    update('adventures', (a) => ({ ...a, friend: { ...a.friend, solution: sol, solutionsTried: a.friend.solutionsTried.includes(sol) ? a.friend.solutionsTried : [...a.friend.solutionsTried, sol] } }));
  };

  const help = (sol: Solution) => {
    sfx.select();
    if (sol === 'poder') {
      playSound(power.sound);
      setFx((n) => n + 1);
      setAnim('pular');
      setTimeout(() => solved('poder', `Com o poder "${power.name}", o ${data.monster.name} mostrou o caminho até a colina!`), 2400);
    } else if (sol === 'som') {
      playSignature(data);
      setAnim('rir');
      setTimeout(() => playSound('risadinha', 0.9), 1600);
      setTimeout(() => solved('som', 'A família do Pipoca ouviu o som e respondeu lá de longe!'), 2600);
    } else if (sol === 'lanche') {
      playSound('passinhos');
      setPip((p) => ({ ...p, anim: 'rir', face: 'bobo' }));
      setTimeout(() => solved('lanche', `O Pipoca comeu ${food.name} ${food.icon} e ficou com energia para voltar para casa!`), 1800);
    } else {
      setMapMode(true);
      setPath([]);
    }
  };

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!mapMode || !svgRef.current) return;
    drawing.current = true;
    setPath([svgPoint(svgRef.current, e.clientX, e.clientY)]);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawing.current || !svgRef.current) return;
    const p = svgPoint(svgRef.current, e.clientX, e.clientY);
    setPath((ps) => (ps.length > 400 ? ps : [...ps, p]));
  };
  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const end = path[path.length - 1];
    const startOk = path.length > 0 && Math.hypot(path[0].x - pip.x, path[0].y - pip.y) < 160;
    if (end && Math.hypot(end.x - HOME.x, end.y - HOME.y) < 130 && path.length > 5) {
      setMapMode(false);
      setPip((p) => ({ ...p, x: HOME.x - 20, y: 420 }));
      solved('mapa', startOk ? 'Que mapa incrível! O Pipoca seguiu o caminho até a casa dele!' : 'O mapa chegou na casa! O Pipoca achou o caminho!');
    } else {
      sfx.soft();
      setResult('Quase! Desenhe o caminho até a casinha lá em cima. 🏠');
    }
  };

  const saveCard = () => {
    sfx.success();
    update('adventures', (a) => ({ ...a, friend: { ...a.friend, card: { text: text.trim().slice(0, 80), sticker, color }, done: true } }), { immediate: true });
    setStep('fim');
  };

  const pathD = path.length ? `M${path.map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' L')}` : '';

  return (
    <ToolShell title="O amigo perdido" icon="🤝" color={STAGES[4].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="relative min-h-[260px] flex-1 bg-night">
          <SceneView
            ref={svgRef}
            biome="montanhas"
            sky="dia"
            objects={SCENE}
            onBgDown={onDown}
            onMove={onMove}
            onUp={onUp}
            actors={[
              { key: 'me', y: 520, node: <MonsterInScene m={data.monster} x={260} y={520} h={190} anim={anim} face={step === 'conversa' ? face('curioso') : undefined} /> },
              { key: 'pipoca', y: pip.y, node: <MonsterInScene m={pipoca.m} x={pip.x} y={pip.y} h={140} flip anim={pip.anim} face={face(pip.face)} /> },
            ]}
            overlay={
              <g>
                <g transform={`translate(${HOME.x} ${HOME.y})`} pointerEvents="none">
                  <circle r={60} fill="#fff07a" opacity={0.25} className="sc-twinkle" />
                  <path d="M-40,20 L-40,-20 L0,-50 L40,-20 L40,20Z" fill="#ffd23f" stroke="#2b1f4a" strokeWidth={4} />
                  <rect x={-10} y={-4} width={20} height={24} fill="#8a5a3c" stroke="#2b1f4a" strokeWidth={3} />
                  <text y={-60} textAnchor="middle" fontSize={22} fontWeight={700} fill="#2b1f4a">Casa do Pipoca</text>
                </g>
                {pathD && <path d={pathD} fill="none" stroke="#ff5fa2" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 18" pointerEvents="none" />}
              </g>
            }
          />
          <PowerFx fx={power.fx} run={fx} />
          {answer && step === 'conversa' && (
            <div key={answer} className="pointer-events-none absolute right-[8%] top-[18%] max-w-[46%] rounded-3xl border-4 border-ink bg-white px-4 py-2 text-lg font-bold shadow-chunky anim-pop">{answer}</div>
          )}
          {mapMode && <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-3xl border-4 border-ink bg-sun-light px-4 py-2 text-lg font-bold anim-pop">✏️ Desenhe com o dedo um caminho do Pipoca até a casa dele!</div>}
          {step === 'fim' && <Confetti count={60} />}
        </div>
        <div className="scroll-y min-h-0 border-t-4 border-ink bg-cream p-3 lg:w-[38%] lg:border-l-4 lg:border-t-0">
          {step === 'conversa' && (
            <>
              <Zuzu text="O Pipoca está chorando. Converse com ele para descobrir o que aconteceu!" size={70} />
              <div className="mt-3 grid gap-2">
                {QUESTIONS.map((q) => (
                  <Btn key={q.id} variant={fr.talked.includes(q.id) ? 'white' : 'aqua'} onClick={() => ask(q.id)} data-testid={`ask-${q.id}`}>
                    💬 {q.q} {fr.talked.includes(q.id) && '✔'}
                  </Btn>
                ))}
              </div>
              <Btn variant="lime" big className="mt-3 w-full" disabled={fr.talked.length < 2} onClick={() => setStep('ajudar')} data-testid="to-help">Vamos ajudar! ➜</Btn>
              {fr.talked.length < 2 && <p className="mt-1 text-sm font-semibold text-ink/70">Faça pelo menos 2 perguntas.</p>}
            </>
          )}
          {step === 'ajudar' && (
            <>
              <h2 className="text-xl font-bold">Como o {data.monster.name || 'monstrinho'} pode ajudar?</h2>
              <p className="mb-2 font-semibold text-ink/70">Escolham um jeito. Depois vocês podem testar outros!</p>
              <div className="grid gap-2">
                <Btn variant="sun" onClick={() => help('poder')} data-testid="help-poder">{power.icon} Usar o superpoder ({power.name})</Btn>
                <Btn variant="aqua" onClick={() => help('som')} data-testid="help-som">🔊 Chamar a família com o som dele</Btn>
                <Btn variant="lime" onClick={() => help('lanche')} data-testid="help-lanche">{food.icon} Dar um lanche ({food.name})</Btn>
                <Btn variant="bubble" onClick={() => help('mapa')} data-testid="help-mapa">✏️ Desenhar um mapa</Btn>
              </div>
              {result && <p className="mt-2 rounded-2xl bg-sun-light p-2 font-bold">{result}</p>}
              {fr.solutionsTried.length > 0 && <p className="mt-2 text-sm font-semibold">Jeitos testados: {fr.solutionsTried.length} de 4</p>}
            </>
          )}
          {step === 'resultado' && (
            <>
              <Zuzu text={result} size={70} anim="comemorar" />
              <div className="mt-3 grid gap-2">
                <Btn variant="lime" big onClick={() => setStep('cartao')} data-testid="to-card">💌 Fazer um cartão para o Pipoca</Btn>
                <Btn onClick={() => { setStep('ajudar'); setResult(''); setAnim('parado'); setPip({ anim: 'parado', face: 'triste', x: 700, y: 520 }); }}>🔁 Testar outro jeito de ajudar</Btn>
              </div>
            </>
          )}
          {(step === 'cartao' || step === 'fim') && (
            <>
              <h2 className="mb-2 text-xl font-bold">💌 Cartão para o Pipoca</h2>
              <div className="relative rounded-3xl border-4 border-ink p-4 shadow-chunky" style={{ background: color }} data-testid="card">
                <div className="absolute right-3 top-2 text-4xl">{itemName(STICKERS, sticker)?.icon}</div>
                <div className="mx-auto h-24 w-24"><MonsterSvg m={data.monster} still size="100%" face={face('feliz')} /></div>
                <textarea className="mt-2 w-full resize-none rounded-2xl border-[3px] border-ink/30 bg-white/80 p-2 text-lg font-bold" rows={2} maxLength={80} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem curtinha..." disabled={step === 'fim'} data-testid="card-text" />
                <div className="text-right font-bold">— {data.monster.name}</div>
              </div>
              {step === 'cartao' && (
                <>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STICKERS.map((s) => <button key={s.id} type="button" aria-label={s.name} onClick={() => setSticker(s.id)} className={`h-11 w-11 rounded-xl border-[3px] text-2xl ${sticker === s.id ? 'border-ink bg-sun-light' : 'border-ink/20 bg-white'}`}>{s.icon}</button>)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['#ffe0ef', '#e0f3ff', '#fff3c4', '#e6ffd9', '#efe3ff'].map((c) => <button key={c} type="button" aria-label="Cor do cartão" onClick={() => setColor(c)} className="h-11 w-11 rounded-xl border-[3px]" style={{ background: c, borderColor: color === c ? '#2b1f4a' : '#ddd' }} />)}
                  </div>
                  <Btn variant="lime" big className="mt-3 w-full" disabled={text.trim().length < 2} onClick={saveCard} data-testid="card-send">📮 Entregar o cartão</Btn>
                </>
              )}
              {step === 'fim' && (
                <div className="mt-3 space-y-2">
                  <p className="rounded-2xl bg-lime/40 p-2 font-bold">🎉 O Pipoca voltou para casa e adorou o cartão!</p>
                  <Btn onClick={() => setStep('cartao')}>✏️ Mudar o cartão</Btn>
                  <Btn onClick={() => { setStep('ajudar'); setResult(''); setPip({ anim: 'parado', face: 'triste', x: 700, y: 520 }); }}>🔁 Testar outro jeito de ajudar</Btn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
