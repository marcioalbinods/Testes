import { MonsterSvg } from '../art/Monster';
import { SLOTS, SLOT_ORDER } from '../art/parts';
import { newMonster, part } from '../game/defaults';
import { NPCS, ZUZU } from '../game/npcs';
import { FACE_PRESETS } from '../art/faces';
import type { AnimId, MonsterState, SlotKey } from '../game/types';

// Página de conferência visual (somente em desenvolvimento).
export default function Gallery() {
  const anim = (new URLSearchParams(location.search).get('anim') || 'parado') as AnimId;
  const still = !new URLSearchParams(location.search).get('anim');
  const base = newMonster();
  const variants: { label: string; m: MonsterState }[] = [];
  for (const slot of SLOT_ORDER) {
    for (const it of SLOTS[slot].items) {
      const m: MonsterState = JSON.parse(JSON.stringify(base));
      if (slot === 'tail' || slot === 'wings') m.parts.arms = null;
      (m.parts as Record<SlotKey, unknown>)[slot] = part(it.id);
      variants.push({ label: `${SLOTS[slot].name}: ${it.name}`, m });
    }
  }
  return (
    <div style={{ background: '#fff7e8', padding: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[ZUZU, ...NPCS.map((n) => n.m)].map((m, i) => (
          <div key={'n' + i} style={{ width: 150, textAlign: 'center', fontSize: 12 }}><MonsterSvg m={m} still={still} anim={anim} size={150} />{m.name}</div>
        ))}
        {FACE_PRESETS.map((fp) => (
          <div key={fp.id} style={{ width: 150, textAlign: 'center', fontSize: 12 }}><MonsterSvg m={NPCS[0].m} face={fp.face} still size={150} />{fp.name}</div>
        ))}
        {variants.map((v, i) => (
          <div key={i} style={{ width: 150, textAlign: 'center', fontSize: 12 }}><MonsterSvg m={v.m} still={still} anim={anim} size={150} />{v.label}</div>
        ))}
      </div>
    </div>
  );
}
