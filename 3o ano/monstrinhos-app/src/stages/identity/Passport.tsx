import { useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { Btn, IconBtn } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FOODS, PLACES, POWERS, STICKERS, TRAITS, itemName } from '../../game/catalog';
import { STAGES } from '../../game/missions';
import { BIOMES } from '../../art/scenery';
import { sfx } from '../../lib/audio';
import { playSignature, signatureLabel } from '../../lib/signature';
import { soundById } from '../../lib/audio';
import type { GameData } from '../../game/types';

const COVERS = ['#7340d9', '#e2304f', '#2d5fd6', '#2fa35a', '#f0702a', '#b04fc4'];

/** O passaporte (também aparece na exposição e no painel do professor). */
export function PassportCard({ g, names, stampAnim }: { g: GameData; names?: string; stampAnim?: boolean }) {
  const idn = g.identity;
  const p = idn.passport;
  const sig = g.sounds.signature;
  const sigName = sig?.kind === 'sound' ? soundById(sig.id)?.name ?? 'Som' : signatureLabel(g);
  const habitat = BIOMES.find((b) => b.id === g.habitat.biome)?.name ?? itemName(PLACES, idn.place)?.name ?? '—';
  const sticker = itemName(STICKERS, p.sticker)?.icon ?? '⭐';
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex gap-2 border-b-2 border-dashed border-ink/15 py-1">
      <span className="w-28 shrink-0 text-sm font-bold uppercase tracking-wide text-ink/60">{k}</span>
      <span className="font-bold">{v}</span>
    </div>
  );
  return (
    <div className="print-area relative mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border-4 border-ink shadow-chunky" style={{ background: p.color }} data-testid="passport">
      <div className="flex items-center justify-between px-5 py-3 text-white">
        <div className="text-2xl font-bold tracking-widest" style={{ textShadow: '0 2px 0 #2b1f4a' }}>PASSAPORTE DO MONSTRINHO</div>
        <div className="text-4xl">{sticker}</div>
      </div>
      <div className="m-2 mt-0 grid gap-4 rounded-[22px] bg-cream p-4 sm:grid-cols-[220px_1fr]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(115,64,217,0.04) 0 10px, transparent 10px 20px)' }}>
        <div className="flex flex-col items-center">
          <div className="h-56 w-48 rounded-2xl border-4 border-ink bg-white p-1">
            <MonsterSvg m={g.monster} still size="100%" />
          </div>
          <div className="mt-2 text-center text-2xl font-bold">{g.monster.name || 'Sem nome'}</div>
          {p.nickname && <div className="text-center text-base font-semibold text-ink/70">“{p.nickname}”</div>}
        </div>
        <div className="min-w-0">
          <Row k="Idade" v={`${p.age} anos-monstro`} />
          <Row k="Personalidade" v={idn.traits.length ? idn.traits.map((t) => `${itemName(TRAITS, t)?.icon} ${itemName(TRAITS, t)?.name}`).join('  ') : '—'} />
          <Row k="Habilidade" v={idn.power ? `${itemName(POWERS, idn.power)?.icon} ${itemName(POWERS, idn.power)?.name}` : '—'} />
          <Row k="Alimentação" v={idn.food ? `${itemName(FOODS, idn.food)?.icon} ${itemName(FOODS, idn.food)?.name}` : '—'} />
          <Row k="Som" v={<span>🔊 {sigName}</span>} />
          <Row k="Habitat" v={habitat} />
          {p.motto && <Row k="Lema" v={`“${p.motto}”`} />}
          {names && <Row k="Criado por" v={names} />}
        </div>
      </div>
      {p.stamped && (
        <div className={`pointer-events-none absolute bottom-6 right-6 rotate-[-14deg] rounded-2xl border-[6px] border-[#e2304f] px-4 py-1 text-3xl font-bold tracking-widest text-[#e2304f] opacity-85 ${stampAnim ? 'anim-star' : ''}`} style={{ background: 'rgba(255,255,255,0.6)' }}>
          APROVADO!
        </div>
      )}
    </div>
  );
}

export default function Passport({ missionId }: { missionId: number | null }) {
  const { data, update, store } = useGame();
  const p = data.identity.passport;
  const [justStamped, setJustStamped] = useState(false);
  const set = (patch: Partial<typeof p>) => update('identity', (s) => ({ ...s, passport: { ...s.passport, ...patch } }));
  return (
    <ToolShell title="Passaporte" icon="🪪" color={STAGES[2].color} missionId={missionId}>
      <div className="scroll-y h-full bg-[radial-gradient(circle_at_50%_0%,#fff7e8,#ffd9a8)] p-3 sm:p-5">
        <PassportCard g={data} names={`${store.info.student1} e ${store.info.student2}`} stampAnim={justStamped} />
        <div className="no-print mx-auto mt-4 grid max-w-3xl gap-3 md:grid-cols-2">
          <div className="panel space-y-3 p-3">
            <label className="block">
              <span className="font-bold">Apelido</span>
              <input className="field mt-1 !min-h-[52px]" maxLength={20} value={p.nickname} onChange={(e) => set({ nickname: e.target.value })} placeholder="Ex.: Bolinha" data-testid="pp-nick" />
            </label>
            <label className="block">
              <span className="font-bold">Lema (uma frase curtinha)</span>
              <input className="field mt-1 !min-h-[52px]" maxLength={50} value={p.motto} onChange={(e) => set({ motto: e.target.value })} placeholder="Ex.: Amizade é tudo!" data-testid="pp-motto" />
            </label>
            <div className="flex items-center gap-2">
              <span className="font-bold">Idade:</span>
              <IconBtn label="Menos" icon="➖" onClick={() => set({ age: Math.max(1, p.age - 1) })} />
              <span className="w-16 text-center text-2xl font-bold">{p.age}</span>
              <IconBtn label="Mais" icon="➕" onClick={() => set({ age: Math.min(999, p.age + 1) })} />
              <span className="text-sm font-semibold">anos-monstro</span>
            </div>
          </div>
          <div className="panel space-y-3 p-3">
            <div>
              <div className="mb-1 font-bold">Cor da capa</div>
              <div className="flex flex-wrap gap-2">
                {COVERS.map((c) => (
                  <button key={c} type="button" aria-label={`Capa ${c}`} onClick={() => { sfx.select(); set({ color: c }); }} className="h-12 w-12 rounded-xl border-4" style={{ background: c, borderColor: p.color === c ? '#2b1f4a' : 'transparent' }} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 font-bold">Adesivo</div>
              <div className="flex flex-wrap gap-2">
                {STICKERS.map((s) => (
                  <button key={s.id} type="button" aria-label={s.name} onClick={() => { sfx.select(); set({ sticker: s.id }); }} className={`h-12 w-12 rounded-xl border-[3px] text-2xl ${p.sticker === s.id ? 'border-ink bg-sun-light' : 'border-ink/20 bg-white'}`}>{s.icon}</button>
                ))}
              </div>
            </div>
            <Btn onClick={() => playSignature(data)} icon="🔊">Ouvir o som dele</Btn>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Btn variant="bubble" big className="flex-1" onClick={() => { sfx.stamp(); setJustStamped(true); set({ stamped: true }); }} data-testid="pp-stamp">🔴 Carimbar!</Btn>
            <Btn big onClick={() => window.print()} icon="🖨️">Imprimir</Btn>
          </div>
          <p className="text-sm font-semibold text-ink/70 md:col-span-2">Para mudar personalidade, comida, poder ou gostos, voltem às missões da etapa 3 pelo mapa. O passaporte se atualiza sozinho!</p>
        </div>
      </div>
    </ToolShell>
  );
}
