import { useCallback, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { Btn } from '../../components/ui';
import { SceneView } from '../../art/SceneView';
import { BIOMES, SKIES, WEATHERS, LIGHTS, type ObjCat } from '../../art/scenery';
import { ObjCatalog, ObjToolbar, useSceneEditing } from '../../components/SceneEditor';
import type { SceneObj } from '../../game/types';
import { STAGES } from '../../game/missions';
import { isDone, isUnlocked } from '../../game/progress';
import { sfx } from '../../lib/audio';

type Tab = 'mundo' | ObjCat;
const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'mundo', name: 'Mundo e céu', icon: '🌍' },
  { id: 'natureza', name: 'Natureza', icon: '🌳' },
  { id: 'agua', name: 'Água', icon: '💧' },
  { id: 'construcoes', name: 'Casas', icon: '🏠' },
  { id: 'enfeites', name: 'Enfeites', icon: '🌸' },
  { id: 'vivos', name: 'Bichinhos', icon: '🐰' },
];
const FOCUS: Record<string, Tab> = { mundo: 'mundo', natureza: 'natureza', enfeites: 'enfeites', vivos: 'vivos' };

function Choice({ items, value, onPick, testid }: { items: { id: string; name: string; icon: string }[]; value: string | null; onPick: (id: string) => void; testid: string }) {
  return (
    <div className="grid-fill">
      {items.map((it) => (
        <button key={it.id} type="button" className="tile" aria-pressed={value === it.id} onClick={() => { sfx.select(); onPick(it.id); }} data-testid={`${testid}-${it.id}`}>
          <span className="text-3xl">{it.icon}</span>
          <span className="text-xs font-bold">{it.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function HabitatEditor({ missionId, focus }: { missionId: number | null; focus?: string }) {
  const { data, update, go } = useGame();
  const h = data.habitat;
  const [tab, setTab] = useState<Tab>(FOCUS[focus ?? ''] ?? (h.biome ? 'natureza' : 'mundo'));
  const onCommit = useCallback((objs: SceneObj[]) => update('habitat', (s) => ({ ...s, objects: objs, placedTotal: Math.max(s.placedTotal, objs.length) })), [update]);
  const ed = useSceneEditing(h.objects, onCommit);
  const set = (p: Partial<typeof h>) => update('habitat', (s) => ({ ...s, ...p }));
  const canExplore = !!h.biome && h.objects.length > 0;
  const exploreMission = isUnlocked(data, 20) && !isDone(data, 20) ? 20 : null;

  return (
    <ToolShell title="Construa seu habitat" icon="🏝️" color={STAGES[3].color} missionId={missionId}
      extra={<Btn variant="sun" className="hidden !min-h-[52px] lg:inline-flex" disabled={!canExplore} onClick={() => go({ name: 'tool', tool: 'explorar', mission: exploreMission })} data-testid="explore-top">🧭 EXPLORAR!</Btn>}>
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-col lg:w-[62%] lg:shrink-0">
          <div className="relative min-h-[200px] flex-1 bg-night" data-testid="habitat-scene">
            <SceneView
              ref={ed.svgRef}
              biome={h.biome}
              sky={h.sky}
              weather={h.weather}
              light={h.light}
              objects={ed.objs}
              selected={ed.selected}
              onObjDown={ed.onObjDown}
              onBgDown={ed.onBgDown}
              onMove={ed.onMove}
              onUp={ed.onUp}
              ghost
            />
            {!h.biome && (
              <div className="absolute inset-0 flex items-center justify-center bg-night/50 p-4">
                <div className="panel max-w-sm p-4 text-center text-lg font-bold anim-pop">👉 Primeiro, escolha o mundo onde o {data.monster.name || 'monstrinho'} vai morar!</div>
              </div>
            )}
          </div>
          <ObjToolbar ed={ed} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col border-t-4 border-ink bg-cream lg:border-l-4 lg:border-t-0">
          <div className="scroll-x no-scrollbar flex shrink-0 gap-1.5 border-b-4 border-ink bg-white p-2">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => { sfx.tap(); setTab(t.id); }} data-testid={`htab-${t.id}`} disabled={t.id !== 'mundo' && !h.biome}
                className={`flex min-w-[76px] shrink-0 flex-col items-center rounded-2xl border-[3px] px-2 py-1 text-xs font-bold disabled:opacity-40 ${tab === t.id ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`}>
                <span className="text-2xl">{t.icon}</span>{t.name}
              </button>
            ))}
          </div>
          <div className="scroll-y min-h-0 flex-1 space-y-3 p-2 sm:p-3">
            {tab === 'mundo' ? (
              <>
                <section>
                  <h3 className="mb-1 font-bold">Mundo</h3>
                  <Choice items={BIOMES} value={h.biome} testid="biome" onPick={(id) => { const b = BIOMES.find((x) => x.id === id)!; set({ biome: id, sky: h.biome ? h.sky : b.sky }); }} />
                </section>
                <section>
                  <h3 className="mb-1 font-bold">Céu</h3>
                  <Choice items={SKIES} value={h.sky} testid="sky" onPick={(id) => set({ sky: id })} />
                </section>
                <section>
                  <h3 className="mb-1 font-bold">Clima</h3>
                  <Choice items={WEATHERS} value={h.weather} testid="weather" onPick={(id) => set({ weather: id })} />
                </section>
                <section>
                  <h3 className="mb-1 font-bold">Efeitos de luz</h3>
                  <Choice items={LIGHTS} value={h.light} testid="light" onPick={(id) => set({ light: id })} />
                </section>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">Toque para colocar ou arraste até o cenário. Depois arraste no cenário para mudar de lugar.</p>
                <ObjCatalog cat={tab} ed={ed} />
              </>
            )}
            <p className="text-sm font-semibold text-ink/70">Objetos no habitat: {ed.objs.length}</p>
          </div>
          <div className="shrink-0 border-t-4 border-ink bg-white p-2">
            <Btn variant="sun" big className="w-full" disabled={!canExplore} onClick={() => go({ name: 'tool', tool: 'explorar', mission: exploreMission })} data-testid="explore">🧭 EXPLORAR MEU MUNDO!</Btn>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
