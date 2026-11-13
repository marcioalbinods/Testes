import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell, Zuzu } from '../../components/shell';
import { Btn, Confetti, Confirm } from '../../components/ui';
import { SceneView } from '../../art/SceneView';
import { MonsterInScene } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { objById, GROUND_Y } from '../../art/scenery';
import { ObjCatalog, ObjToolbar, useSceneEditing } from '../../components/SceneEditor';
import { STAGES } from '../../game/missions';
import { playSound, sfx } from '../../lib/audio';
import { svgPoint, clamp } from '../../lib/util';
import { depthScale } from '../habitat/Explore';
import type { SceneObj } from '../../game/types';

const SHELTERS = ['guarda-chuva', 'barraca', 'folha-gigante', 'cobertor', 'muro-pedras', 'casa', 'cabana', 'iglu', 'caverna', 'castelo', 'arvore', 'pinheiro', 'palmeira', 'cogumelo-gigante'];
const face = (id: string) => FACE_PRESETS.find((f) => f.id === id)!.face;

export function shelterFor(objs: SceneObj[], m: { x: number; y: number }) {
  return objs.find((o) => {
    if (!SHELTERS.includes(o.type)) return false;
    const def = objById(o.type)!;
    const half = (def.w * o.s) / 2;
    return Math.abs(m.x - o.x) < half && m.y > o.y - 70 && m.y < o.y + 50;
  });
}

export default function Storm({ missionId }: { missionId: number | null }) {
  const { data, update } = useGame();
  const st = data.adventures.storm;
  const h = data.habitat;
  const start = st.objects.length ? st.objects : h.objects;
  const onCommit = useCallback((objs: SceneObj[]) => update('adventures', (a) => ({ ...a, storm: { ...a.storm, objects: objs } })), [update]);
  const ed = useSceneEditing(start, onCommit);
  const [mpos, setMpos] = useState(st.monster ?? { x: 500, y: 500 });
  const [phase, setPhase] = useState<'prep' | 'storm' | 'result'>('prep');
  const [safe, setSafe] = useState(false);
  const [askSave, setAskSave] = useState(false);
  const dragM = useRef<{ dx: number; dy: number } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const shelter = shelterFor(ed.objs, mpos);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragM.current && ed.svgRef.current) {
      const p = svgPoint(ed.svgRef.current, e.clientX, e.clientY);
      setMpos({ x: clamp(p.x - dragM.current.dx, 40, 960), y: clamp(p.y - dragM.current.dy, GROUND_Y + 20, 590) });
      return;
    }
    ed.onMove(e);
  };
  const onUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragM.current) {
      dragM.current = null;
      sfx.place();
      update('adventures', (a) => ({ ...a, storm: { ...a.storm, monster: mpos } }));
      return;
    }
    void e;
    ed.onUp();
  };

  const storm = () => {
    sfx.whoosh();
    setPhase('storm');
    playSound('vento');
    timers.current.push(setTimeout(() => playSound('tambor', -0.8), 1200));
    timers.current.push(setTimeout(() => playSound('splash', -0.5, 0.5), 2200));
    timers.current.push(setTimeout(() => playSound('tambor', -1), 3200));
    const ok = !!shelter;
    timers.current.push(setTimeout(() => {
      setSafe(ok);
      setPhase('result');
      if (ok) {
        sfx.success();
        update('adventures', (a) => ({ ...a, storm: { ...a.storm, objects: ed.objs, monster: mpos, survived: true, done: true } }), { immediate: true });
      } else sfx.soft();
    }, 5200));
  };

  const saveToHabitat = () => {
    setAskSave(false);
    sfx.star();
    update('habitat', (hh) => ({ ...hh, objects: ed.objs.slice(0, 60) }));
    update('adventures', (a) => ({ ...a, storm: { ...a.storm, savedToHabitat: true } }), { immediate: true });
  };

  const weather = phase === 'prep' ? 'nuvens' : phase === 'storm' ? 'tempestade' : safe ? 'sol' : 'chuva';
  const sky = phase === 'prep' ? 'nublado' : phase === 'storm' ? 'noite' : safe ? 'arco' : 'nublado';
  const mFace = phase === 'storm' ? (shelter ? face('sonolento') : face('assustado')) : phase === 'result' ? (safe ? face('encantado') : face('triste')) : face('curioso');
  const size = 150 * depthScale(mpos.y);

  return (
    <ToolShell title="A grande tempestade" icon="⛈️" color={STAGES[4].color} missionId={missionId}>
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-col lg:w-[64%] lg:shrink-0">
          <div className="relative min-h-[240px] flex-1 bg-night" data-testid="storm-scene">
            <SceneView
              ref={ed.svgRef}
              biome={h.biome ?? 'floresta'}
              sky={sky}
              weather={weather}
              objects={ed.objs}
              selected={phase === 'prep' ? ed.selected : null}
              onObjDown={phase === 'prep' ? ed.onObjDown : undefined}
              onBgDown={ed.onBgDown}
              onMove={onMove}
              onUp={onUp}
              actors={[{
                key: 'me', y: mpos.y + (shelter ? -1 : 0), z: 0,
                node: (
                  <g onPointerDown={(e) => { if (phase !== 'prep' || !ed.svgRef.current) return; e.stopPropagation(); const p = svgPoint(ed.svgRef.current, e.clientX, e.clientY); dragM.current = { dx: p.x - mpos.x, dy: p.y - mpos.y }; sfx.tap(); }} style={{ cursor: phase === 'prep' ? 'grab' : undefined }} data-testid="storm-monster">
                    <rect x={mpos.x - size * 0.3} y={mpos.y - size * 0.9} width={size * 0.6} height={size * 0.9} fill="transparent" />
                    <MonsterInScene m={data.monster} x={mpos.x} y={mpos.y} h={size} anim={phase === 'storm' && !shelter ? 'susto' : phase === 'result' && safe ? 'comemorar' : 'parado'} face={mFace} />
                    {phase === 'storm' && !shelter && <text x={mpos.x + 30} y={mpos.y - size * 0.8} fontSize={30}>💧</text>}
                  </g>
                ),
              }]}
            />
            <div className="pointer-events-none absolute left-1/2 top-2 max-w-[92%] -translate-x-1/2 rounded-3xl border-4 border-ink bg-white px-4 py-2 text-center text-lg font-bold shadow-chunky" data-testid="storm-say">
              {phase === 'prep' && (shelter ? `✅ O ${data.monster.name} está protegido: ${objById(shelter.type)?.name}!` : '☁️ Vem tempestade! Arraste o monstrinho para um abrigo ou construa um.')}
              {phase === 'storm' && '⛈️ Trovões! Chuva forte!'}
              {phase === 'result' && (safe ? '🌈 Passou! O abrigo funcionou e ele ficou sequinho!' : '💧 Ele se molhou! Vamos fazer um abrigo melhor?')}
            </div>
            {phase === 'result' && safe && <Confetti count={60} />}
          </div>
          {phase === 'prep' && <ObjToolbar ed={ed} />}
        </div>
        <div className="scroll-y min-h-0 flex-1 border-t-4 border-ink bg-cream p-3 lg:border-l-4 lg:border-t-0">
          {phase === 'prep' && (
            <>
              <Zuzu size={64} text="Mude o habitat para proteger o monstrinho! Coloquem abrigos e arrastem ele para baixo de um." />
              <h3 className="mb-1 mt-3 font-bold">🛖 Abrigos</h3>
              <ObjCatalog cat="abrigo" ed={ed} />
              <h3 className="mb-1 mt-3 font-bold">🏠 Casas e cavernas</h3>
              <ObjCatalog cat="construcoes" ed={ed} filter={(id) => ['casa', 'cabana', 'iglu', 'caverna', 'castelo'].includes(id)} />
              <Btn variant="bubble" big className="mt-3 w-full" onClick={storm} data-testid="storm-go">⛈️ Chamar a tempestade!</Btn>
            </>
          )}
          {phase === 'storm' && <Zuzu size={80} anim="pular" text="Segura firme! A tempestade está passando..." />}
          {phase === 'result' && (
            <div className="space-y-3">
              <Zuzu size={80} anim={safe ? 'comemorar' : 'parado'} text={safe ? 'Vocês protegeram o monstrinho! Que abrigo criativo!' : 'Sem problema! Tentem colocar o monstrinho debaixo de um abrigo.'} />
              <Btn variant="aqua" className="w-full" onClick={() => setPhase('prep')} data-testid="storm-again">🔁 Mudar o abrigo e tentar de novo</Btn>
              {safe && !st.savedToHabitat && <Btn variant="sun" className="w-full" onClick={() => setAskSave(true)} data-testid="storm-save">🏝️ Guardar este abrigo no meu habitat</Btn>}
              {st.savedToHabitat && <p className="rounded-2xl bg-lime/40 p-2 font-bold">✔ O abrigo agora faz parte do habitat!</p>}
            </div>
          )}
        </div>
      </div>
      <Confirm open={askSave} title="Guardar no habitat?" text="O habitat vai ficar igual a este cenário, com os abrigos novos." yes="Sim, guardar" no="Não" onNo={() => setAskSave(false)} onYes={saveToHabitat} />
    </ToolShell>
  );
}
