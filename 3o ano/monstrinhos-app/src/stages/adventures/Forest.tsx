import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell, Zuzu } from '../../components/shell';
import { Btn, Confetti, IconBtn } from '../../components/ui';
import { SceneView } from '../../art/SceneView';
import { MonsterInScene } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { objById } from '../../art/scenery';
import { STAGES } from '../../game/missions';
import { hashNum } from '../../game/catalog';
import { playSound, sfx } from '../../lib/audio';
import { svgPoint } from '../../lib/util';
import { useWalker, DPad, depthScale } from '../habitat/Explore';
import type { SceneObj } from '../../game/types';

export const TREASURES = [
  { id: 'tesouro-pena', name: 'Pena dourada', icon: '🪶' },
  { id: 'tesouro-cristal', name: 'Cristal mágico', icon: '💎' },
  { id: 'chave', name: 'Chave antiga', icon: '🗝️' },
  { id: 'estrela', name: 'Estrela caída', icon: '⭐' },
  { id: 'mapa', name: 'Pedaço de mapa', icon: '🗺️' },
  { id: 'concha', name: 'Concha brilhante', icon: '🐚' },
];
const SURPRISES = [
  { id: 'passaro', text: 'Um passarinho saiu voando!', icon: '🐦', sound: 'piupiu' },
  { id: 'sapo', text: 'Um sapo pulou! Croac!', icon: '🐸', sound: 'croac' },
  { id: 'meia', text: 'Só uma meia velha... eca!', icon: '🧦', sound: 'apito' },
  { id: 'borboletas', text: 'Borboletas coloridas!', icon: '🦋', sound: 'brilho' },
  { id: 'eco', text: 'Ecooo... ecooo...', icon: '🔊', sound: 'vento' },
  { id: 'cocegas', text: 'A árvore sentiu cócegas!', icon: '😆', sound: 'risadinha' },
];

const o = (uid: string, type: string, x: number, y: number, s = 1, extra: Partial<SceneObj> = {}): SceneObj => ({ uid, type, x, y, s, r: 0, flip: false, z: 0, ...extra });
export const FOREST: SceneObj[] = [
  o('t1', 'arvore', 90, 430, 1.1), o('t2', 'pinheiro', 300, 400, 1), o('t3', 'arvore', 560, 405, 0.9, { color: '#3fae4a' }), o('t4', 'pinheiro', 860, 420, 1.2), o('t5', 'arvore', 960, 470, 0.8),
  o('h1', 'arbusto', 180, 470), o('h2', 'pedra', 420, 470, 1.1), o('h3', 'cogumelo-gigante', 700, 455, 0.8), o('h4', 'tronco', 250, 560, 0.9), o('h5', 'arbusto', 620, 560, 1.2, { color: '#3fae4a' }),
  o('h6', 'pedra', 860, 560, 0.9), o('h7', 'arbusto', 480, 590, 0.9), o('h8', 'cogumelo', 120, 590, 1.3), o('h9', 'arbusto', 780, 480, 0.8), o('h10', 'tronco', 960, 590, 0.7),
  o('f1', 'flor', 360, 520), o('f2', 'flor', 540, 500, 1, { color: '#ffd23f' }), o('f3', 'grama', 700, 590), o('f4', 'cogumelo', 340, 590),
];
const SPOTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 't2', 't3'];

export default function Forest({ missionId }: { missionId: number | null }) {
  const { data, update, store, go } = useGame();
  const fs = data.adventures.forest;
  const svgRef = useRef<SVGSVGElement>(null);
  const w = useWalker({ x: 150, y: 450 });
  const [reacting, setReacting] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ text: string; icon: string } | null>({ text: 'Toque nos arbustos, pedras e troncos para procurar!', icon: '🔎' });
  const [hint, setHint] = useState<string | null>(null);
  const [searched, setSearched] = useState<string[]>([]);
  const [party, setParty] = useState(false);

  // Cada dupla tem tesouros em lugares diferentes.
  const hidden = useMemo(() => {
    const seed = hashNum(store.info.id);
    const spots = [...SPOTS].sort((a, b) => hashNum(a + seed) - hashNum(b + seed));
    return Object.fromEntries(TREASURES.map((t, i) => [spots[i], t.id])) as Record<string, string>;
  }, [store.info.id]);

  const allFound = TREASURES.every((t) => fs.found.includes(t.id));
  useEffect(() => {
    if (allFound && !fs.done) {
      setParty(true);
      sfx.success();
    }
  }, [allFound, fs.done]);

  const search = (uid: string) => {
    const obj = FOREST.find((x) => x.uid === uid);
    if (!obj) return;
    const def = objById(obj.type)!;
    sfx.tap();
    w.walkTo(obj.x + (obj.x > w.pos.x ? -1 : 1) * (def.w * obj.s * 0.5 + 24), Math.max(obj.y, 440), () => {
      setReacting((r) => ({ ...r, [uid]: (r[uid] ?? 0) + 1 }));
      const t = hidden[uid];
      if (t && !fs.found.includes(t)) {
        const tr = TREASURES.find((x) => x.id === t)!;
        playSound('magia');
        sfx.star();
        setMsg({ text: `Achou: ${tr.name}!`, icon: tr.icon });
        update('adventures', (a) => ({ ...a, forest: { ...a.forest, found: [...a.forest.found, t] } }));
      } else if (t) {
        setMsg({ text: 'Aqui vocês já acharam um tesouro!', icon: '✅' });
      } else {
        const sp = SURPRISES[hashNum(uid + searched.length) % SURPRISES.length];
        playSound(sp.sound);
        setMsg({ text: sp.text, icon: sp.icon });
        if (!fs.surprises.includes(sp.id)) update('adventures', (a) => ({ ...a, forest: { ...a.forest, surprises: [...a.forest.surprises, sp.id] } }));
      }
      setSearched((s) => (s.includes(uid) ? s : [...s, uid]));
    });
  };

  const giveHint = () => {
    const spot = Object.keys(hidden).find((k) => !fs.found.includes(hidden[k]));
    if (!spot) return;
    sfx.select();
    setHint(spot);
    setMsg({ text: 'Olhem onde está brilhando forte!', icon: '💡' });
    setTimeout(() => setHint(null), 3500);
  };

  const finish = (keep: string) => {
    sfx.success();
    update('adventures', (a) => ({ ...a, forest: { ...a.forest, keep, done: true } }), { immediate: true });
    if (keep === 'enfeite') {
      update('monster', (m) => (m.accessories.some((x) => x.id === 'pena-dourada') || m.accessories.length >= 4 ? m : { ...m, accessories: [...m.accessories, { id: 'pena-dourada', color: null, scale: 1, dx: 0, dy: 0 }] }));
    }
    if (keep === 'bau') {
      update('habitat', (h) => (h.objects.some((x) => x.type === 'bau') || h.objects.length >= 60 ? h : { ...h, objects: [...h.objects, { uid: 'bau-tesouro', type: 'bau', x: 520, y: 520, s: 1, r: 0, flip: false, z: 0 }] }));
    }
    setParty(false);
  };

  const sparkles = Object.keys(hidden).filter((k) => !fs.found.includes(hidden[k]));
  const size = 150 * depthScale(w.pos.y);

  return (
    <ToolShell title="A floresta misteriosa" icon="🔎" color={STAGES[4].color} missionId={missionId}>
      <div className="relative h-full bg-night">
        <SceneView
          ref={svgRef}
          biome="floresta"
          sky="entardecer"
          light="vagalumes"
          objects={FOREST}
          reacting={reacting}
          onObjDown={(uid, e) => { e.stopPropagation(); search(uid); }}
          onBgDown={(e) => { if (svgRef.current) { const p = svgPoint(svgRef.current, e.clientX, e.clientY); w.walkTo(p.x, p.y); } }}
          actors={[{ key: 'me', y: w.pos.y, node: <MonsterInScene m={data.monster} x={w.pos.x} y={w.pos.y} h={size} flip={w.facing < 0} anim={w.moving ? 'andar' : 'parado'} face={FACE_PRESETS.find((f) => f.id === 'curioso')!.face} /> }]}
          overlay={
            <g pointerEvents="none">
              {sparkles.map((k, i) => {
                const ob = FOREST.find((x) => x.uid === k)!;
                const def = objById(ob.type)!;
                const big = hint === k;
                return (
                  <g key={k} transform={`translate(${ob.x} ${ob.y - def.h * ob.s - 6})`} data-spot={k} data-hint={big ? 'sim' : undefined}>
                    {big && <circle r={46} fill="none" stroke="#fff07a" strokeWidth={6} className="sc-twinkle" />}
                    <text textAnchor="middle" fontSize={big ? 42 : 22} className="sc-twinkle" style={{ animationDelay: `${i * 0.7}s`, animationDuration: big ? '0.6s' : '3.2s' }}>✨</text>
                  </g>
                );
              })}
            </g>
          }
        />
        {msg && (
          <div key={msg.text} className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-lg font-bold shadow-chunky anim-pop" data-testid="forest-msg">
            {msg.icon} {msg.text}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
          <DPad press={w.press} />
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className="flex gap-1 rounded-2xl border-[3px] border-ink bg-white/90 p-1.5" aria-label="Tesouros" data-testid="treasures">
              {TREASURES.map((t) => (
                <span key={t.id} className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${fs.found.includes(t.id) ? 'bg-sun-light anim-pop' : 'bg-ink/10 grayscale opacity-40'}`} title={t.name}>{t.icon}</span>
              ))}
            </div>
            <IconBtn label="Pedir uma pista" icon="💡" variant="sun" onClick={giveHint} data-testid="hint" />
          </div>
        </div>
        {party && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-night/60 p-3">
            <Confetti count={90} />
            <div className="panel w-full max-w-lg bg-cream p-5 anim-pop">
              <Zuzu text="Vocês acharam os 6 tesouros! O que vão fazer com eles?" size={90} anim="comemorar" />
              <div className="mt-4 grid gap-2">
                <Btn variant="sun" onClick={() => finish('enfeite')} data-testid="keep-enfeite">🪶 Usar a pena dourada como enfeite do {data.monster.name}</Btn>
                <Btn variant="aqua" onClick={() => finish('bau')} data-testid="keep-bau">🧰 Guardar tudo num baú no habitat</Btn>
                <Btn variant="lime" onClick={() => finish('presente')} data-testid="keep-presente">🎁 Dar de presente para os amigos</Btn>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink/70">O cristal e a pena também aparecem nos enfeites do laboratório!</p>
            </div>
          </div>
        )}
        {fs.done && !party && allFound && (
          <div className="absolute right-2 top-14 z-20">
            <Btn variant="white" onClick={() => go({ name: 'tool', tool: 'criatura', mission: null, focus: 'acc' })}>🎩 Ver enfeites novos</Btn>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
