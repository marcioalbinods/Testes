import { useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { LabStage } from '../../components/LabStage';
import { Btn, IconBtn, toast } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS, NEUTRAL_FACE } from '../../art/faces';
import { MOUTHS } from '../../art/parts';
import type { BrowId, EyeMod, FaceExtra, FaceSpec, MouthMod } from '../../game/types';
import { STAGES } from '../../game/missions';
import { sfx } from '../../lib/audio';
import { uid } from '../../lib/util';

const BROWS: { id: BrowId; name: string; icon: string }[] = [
  { id: 'nenhuma', name: 'Sem', icon: '➖' },
  { id: 'normal', name: 'Normal', icon: '🙂' },
  { id: 'triste', name: 'Triste', icon: '🥺' },
  { id: 'brava', name: 'Brava', icon: '😠' },
  { id: 'surpresa', name: 'Surpresa', icon: '😲' },
  { id: 'curiosa', name: 'Curiosa', icon: '🤨' },
  { id: 'preocupada', name: 'Preocupada', icon: '😟' },
];
const EYES: { id: EyeMod; name: string; icon: string }[] = [
  { id: 'normal', name: 'Normais', icon: '👀' },
  { id: 'arregalados', name: 'Arregalados', icon: '😳' },
  { id: 'fechados', name: 'Fechadinhos', icon: '😊' },
  { id: 'sonolentos', name: 'Com sono', icon: '😪' },
  { id: 'piscando', name: 'Piscando', icon: '😉' },
  { id: 'coracoes', name: 'Corações', icon: '😍' },
  { id: 'estrelas', name: 'Estrelas', icon: '🤩' },
  { id: 'espirais', name: 'Tontos', icon: '😵‍💫' },
];
const MOUTH_MODS: { id: MouthMod; name: string; icon: string }[] = [
  { id: 'normal', name: 'Normal', icon: '🙂' },
  { id: 'triste', name: 'Virada', icon: '🙁' },
  { id: 'reto', name: 'Achatada', icon: '😐' },
  { id: 'aberto', name: 'Aberta', icon: '😮' },
];
const EXTRAS: { id: FaceExtra; name: string; icon: string }[] = [
  { id: 'nenhum', name: 'Nada', icon: '➖' },
  { id: 'lagrima', name: 'Lágrima', icon: '💧' },
  { id: 'gota', name: 'Suor', icon: '😅' },
  { id: 'zzz', name: 'Zzz', icon: '💤' },
  { id: 'coracoes', name: 'Corações', icon: '💕' },
  { id: 'exclamacao', name: 'Exclamação', icon: '❗' },
  { id: 'interrogacao', name: 'Dúvida', icon: '❓' },
  { id: 'brilhos', name: 'Brilhos', icon: '✨' },
  { id: 'notas', name: 'Música', icon: '🎵' },
];
const LOOKS: [number, number][] = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const ARROWS = ['↖', '⬆', '↗', '⬅', '•', '➡', '↙', '⬇', '↘'];

function Row<T extends { id: string; name: string; icon: string }>({ title, items, value, onPick, testid }: { title: string; items: T[]; value: string; onPick: (id: T['id']) => void; testid: string }) {
  return (
    <section>
      <h3 className="mb-1 font-bold">{title}</h3>
      <div className="scroll-x no-scrollbar flex gap-2 pb-1">
        {items.map((it) => (
          <button key={it.id} type="button" className="tile min-w-[78px] shrink-0" aria-pressed={value === it.id} onClick={() => { sfx.select(); onPick(it.id); }} data-testid={`${testid}-${it.id}`}>
            <span className="text-2xl">{it.icon}</span>
            <span className="text-xs">{it.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function ExpressionLab({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const [face, setFace] = useState<FaceSpec>({ ...NEUTRAL_FACE, brows: 'normal' });
  const [name, setName] = useState('');
  const set = (p: Partial<FaceSpec>) => setFace((f) => ({ ...f, ...p }));
  const saved = data.life.expressions;

  const save = () => {
    const n = name.trim() || `Cara ${saved.length + 1}`;
    if (saved.length >= 12) {
      toast('Já são 12 expressões! Apague uma para guardar outra.', '📦', 'warn');
      return;
    }
    sfx.star();
    update('life', (l) => ({ ...l, expressions: [...l.expressions, { id: uid(), name: n.slice(0, 20), face }], favoriteExpression: l.favoriteExpression ?? null }));
    toast(`Expressão "${n}" guardada!`, '😜', 'ok');
    setName('');
  };

  return (
    <ToolShell title="Expressões" icon="😜" color={STAGES[1].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        <div className="flex min-h-0 flex-col md:w-[42%] md:shrink-0">
          <LabStage className="min-h-[220px] flex-1">
            <div className="absolute inset-0 p-2">
              <MonsterSvg m={data.monster} face={face} size="100%" viewBox="40 -10 320 360" />
            </div>
          </LabStage>
          <div className="flex shrink-0 flex-wrap gap-2 border-t-4 border-ink bg-white p-2">
            <input className="field !min-h-[52px] flex-1 !text-lg" placeholder="Nome da expressão" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} data-testid="expr-name" />
            <Btn variant="lime" onClick={save} data-testid="expr-save">💾 Guardar</Btn>
          </div>
        </div>
        <div className="scroll-y min-h-0 flex-1 space-y-3 border-t-4 border-ink bg-cream p-3 md:border-l-4 md:border-t-0">
          <section>
            <h3 className="mb-1 font-bold">Comece por uma cara pronta (ou invente!)</h3>
            <div className="scroll-x no-scrollbar flex gap-2 pb-1">
              {FACE_PRESETS.map((p) => (
                <button key={p.id} type="button" className="tile min-w-[78px] shrink-0" onClick={() => { sfx.select(); setFace(p.face); setName(p.name); }} data-testid={`preset-${p.id}`}>
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-xs">{p.name}</span>
                </button>
              ))}
            </div>
          </section>
          <Row title="Sobrancelhas" items={BROWS} value={face.brows} onPick={(id) => set({ brows: id })} testid="brow" />
          <Row title="Olhos" items={EYES} value={face.eyes} onPick={(id) => set({ eyes: id })} testid="eyes" />
          <section>
            <h3 className="mb-1 font-bold">Boca</h3>
            <div className="scroll-x no-scrollbar flex gap-2 pb-1">
              <button type="button" className="tile min-w-[78px] shrink-0" aria-pressed={face.mouth === null} onClick={() => set({ mouth: null })}>
                <span className="text-2xl">⭐</span><span className="text-xs">A minha</span>
              </button>
              {MOUTHS.map((m) => (
                <button key={m.id} type="button" className="tile min-w-[78px] shrink-0 !p-0" aria-pressed={face.mouth === m.id} onClick={() => { sfx.select(); set({ mouth: m.id }); }} title={m.name}>
                  <svg viewBox="-64 -30 128 84" className="h-10 w-16" aria-hidden><g>{m.draw(m.defaultColor ?? '#ff7a9a')}</g></svg>
                  <span className="text-[11px]">{m.name}</span>
                </button>
              ))}
            </div>
          </section>
          <Row title="Jeito da boca" items={MOUTH_MODS} value={face.mouthMod} onPick={(id) => set({ mouthMod: id })} testid="mmod" />
          <Row title="Efeito" items={EXTRAS} value={face.extra} onPick={(id) => set({ extra: id })} testid="extra" />
          <div className="flex flex-wrap items-start gap-4">
            <section>
              <h3 className="mb-1 font-bold">Olhar para...</h3>
              <div className="grid grid-cols-3 gap-1">
                {LOOKS.map(([x, y], i) => (
                  <button key={i} type="button" className={`h-12 w-12 rounded-xl border-[3px] text-xl font-bold ${face.lookX === x * 0.8 && face.lookY === y * 0.8 ? 'border-ink bg-sun' : 'border-ink/20 bg-white'}`} onClick={() => { sfx.tap(); set({ lookX: x * 0.8, lookY: y * 0.8 }); }} aria-label={`Olhar ${ARROWS[i]}`}>
                    {ARROWS[i]}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-1 font-bold">Bochechas</h3>
              <Btn variant={face.blush ? 'bubble' : 'white'} onClick={() => set({ blush: !face.blush })}>{face.blush ? '😊 Rosadas' : 'Normais'}</Btn>
            </section>
          </div>
          {saved.length > 0 && (
            <section className="rounded-2xl border-[3px] border-ink/20 bg-white p-3">
              <h3 className="mb-2 font-bold">Expressões guardadas ({saved.length})</h3>
              <div className="flex flex-wrap gap-2">
                {saved.map((e) => (
                  <div key={e.id} className="flex items-center gap-1 rounded-2xl border-[3px] border-ink bg-cream p-1 pr-2">
                    <button type="button" className="flex items-center gap-1" onClick={() => { sfx.select(); setFace(e.face); setName(e.name); }}>
                      <span className="h-12 w-12"><MonsterSvg m={data.monster} face={e.face} still size="100%" viewBox="60 20 280 280" /></span>
                      <span className="font-bold">{e.name}</span>
                    </button>
                    <IconBtn label="Favorita" icon={data.life.favoriteExpression === e.id ? '⭐' : '☆'} className="!min-h-[40px] !w-10 !min-w-[40px]" onClick={() => update('life', (l) => ({ ...l, favoriteExpression: e.id }))} />
                    <IconBtn label="Apagar" icon="🗑️" className="!min-h-[40px] !w-10 !min-w-[40px]" onClick={() => { sfx.remove(); update('life', (l) => ({ ...l, expressions: l.expressions.filter((x) => x.id !== e.id) })); }} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
