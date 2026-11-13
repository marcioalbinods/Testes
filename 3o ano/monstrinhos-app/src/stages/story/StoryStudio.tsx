import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell, Zuzu } from '../../components/shell';
import { Btn, Confetti, Confirm, IconBtn, Modal, toast } from '../../components/ui';
import { MonsterSvg } from '../../art/Monster';
import { FACE_PRESETS } from '../../art/faces';
import { BIOMES } from '../../art/scenery';
import { NPCS } from '../../game/npcs';
import { STAGES } from '../../game/missions';
import { SOUNDS, playSound, sfx } from '../../lib/audio';
import { playRecording } from '../../lib/recorder';
import { svgPoint, uid, clamp } from '../../lib/util';
import { ANIMS } from '../life/AnimationLab';
import { Recorder } from '../life/Presentation';
import type { Balloon, Frame, SceneRef, Story, StoryChar } from '../../game/types';
import { ADVENTURE_SCENES, COLOR_SCENES, FrameView, charName, newFrame, sceneName } from './storyArt';
import StoryPlayer from './StoryPlayer';

type Panel = 'cenario' | 'elenco' | 'personagem' | 'falas' | 'som' | 'tempo';
const PANELS: { id: Panel; name: string; icon: string }[] = [
  { id: 'cenario', name: 'Cenário', icon: '🖼️' },
  { id: 'elenco', name: 'Elenco', icon: '🎭' },
  { id: 'personagem', name: 'Personagens', icon: '🧍' },
  { id: 'falas', name: 'Falas', icon: '💬' },
  { id: 'som', name: 'Som', icon: '🔊' },
  { id: 'tempo', name: 'Tempo', icon: '⏱️' },
];
const FOCUS: Record<string, Panel> = { cenario: 'cenario', elenco: 'elenco', quadros: 'personagem', publicar: 'falas' };
const TRANSITIONS: { id: Frame['transition']; name: string; icon: string }[] = [
  { id: 'aparecer', name: 'Aparecer', icon: '🌫️' },
  { id: 'deslizar', name: 'Deslizar', icon: '➡️' },
  { id: 'zoom', name: 'Zoom', icon: '🔍' },
  { id: 'virar', name: 'Virar página', icon: '📖' },
];
const STARTERS = ['Era uma vez...', 'Um dia,', 'De repente,', 'Então,', 'No final,', 'E viveram felizes!'];

export default function StoryStudio({ missionId, focus }: { missionId: number | null; focus?: string }) {
  const { data, update, store, allowRecordings } = useGame();
  const st = data.stories;
  const story: Story | undefined = st.stories.find((s) => s.id === st.currentId) ?? st.stories[0];
  const [fi, setFi] = useState(0);
  const [panel, setPanel] = useState<Panel>(FOCUS[focus ?? ''] ?? (story ? 'personagem' : 'cenario'));
  const [sel, setSel] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ kind: 'char' | 'balloon'; uid: string; dx: number; dy: number } | null>(null);
  const [live, setLive] = useState<Frame | null>(null);

  const frames = story?.frames ?? [];
  const frame = live ?? frames[Math.min(fi, frames.length - 1)];
  useEffect(() => { if (fi > frames.length - 1) setFi(Math.max(0, frames.length - 1)); }, [frames.length, fi]);

  const setStory = (fn: (s: Story) => Story, opts?: { immediate?: boolean }) => {
    if (!story) return;
    update('stories', (s) => ({ ...s, stories: s.stories.map((x) => (x.id === story.id ? fn(x) : x)) }), opts);
  };
  const setFrame = (fn: (f: Frame) => Frame) => setStory((s) => ({ ...s, frames: s.frames.map((f, i) => (i === fi ? fn(f) : f)) }));

  const cast = st.cast.length ? st.cast : ['eu'];

  // ---------- cenário principal (cria a história se ainda não existir)
  const chooseMain = (ref: SceneRef) => {
    sfx.select();
    if (!story) {
      const c = st.cast.length ? st.cast : ['eu'];
      const s: Story = { id: uid(), title: '', frames: [0, 1, 2, 3].map(() => newFrame(ref, c)), published: false, publishedAt: null, views: 0 };
      update('stories', (x) => ({ ...x, mainScene: ref, stories: [...x.stories, s], currentId: s.id }));
      setFi(0);
      return;
    }
    update('stories', (x) => ({ ...x, mainScene: ref }));
    setFrame((f) => ({ ...f, scene: ref }));
  };
  const applyToAll = () => {
    if (!frame) return;
    sfx.select();
    setStory((s) => ({ ...s, frames: s.frames.map((f) => ({ ...f, scene: frame.scene })) }));
    toast('Cenário usado em todos os quadros!', '🖼️', 'ok');
  };

  // ---------- elenco
  const toggleCast = (who: string) => {
    if (who === 'eu' && st.cast.includes('eu') && st.cast.length === 1) return;
    sfx.select();
    update('stories', (x) => {
      const base = x.cast.length ? x.cast : ['eu'];
      return { ...x, cast: base.includes(who) ? base.filter((c) => c !== who) : [...base, who].slice(0, 6) };
    });
  };

  // ---------- personagens no quadro
  const addChar = (who: string) => {
    if (!frame) return;
    if (frame.chars.length >= 4) return toast('Até 4 personagens por quadro.', '🧍', 'warn');
    const c: StoryChar = { uid: uid(), who, x: 200 + ((frame.chars.length * 230) % 640), y: 540, s: 1, flip: frame.chars.length % 2 === 1, face: 'feliz', anim: 'parado' };
    sfx.place();
    setFrame((f) => ({ ...f, chars: [...f.chars, c] }));
    setSel(c.uid);
  };
  const selChar = frame?.chars.find((c) => c.uid === sel) ?? null;
  const selBalloon = frame?.balloons.find((b) => b.uid === sel) ?? null;
  const editChar = (fn: (c: StoryChar) => StoryChar) => setFrame((f) => ({ ...f, chars: f.chars.map((c) => (c.uid === sel ? fn(c) : c)) }));
  const editBalloon = (fn: (b: Balloon) => Balloon) => setFrame((f) => ({ ...f, balloons: f.balloons.map((b) => (b.uid === sel ? fn(b) : b)) }));

  const addBalloon = (kind: Balloon['kind']) => {
    if (!frame) return;
    if (frame.balloons.length >= 4) return toast('Até 4 balões por quadro.', '💬', 'warn');
    const target = selChar ?? frame.chars[frame.balloons.length % Math.max(1, frame.chars.length)];
    const b: Balloon = { uid: uid(), kind, text: '', x: kind === 'legenda' ? 500 : clamp((target?.x ?? 500) + 40, 160, 840), y: kind === 'legenda' ? 60 : clamp((target?.y ?? 540) - 290 * (target?.s ?? 1), 70, 400), tail: kind === 'legenda' ? 'nenhuma' : (target?.x ?? 500) > 500 ? 'direita' : 'esquerda' };
    sfx.place();
    setFrame((f) => ({ ...f, balloons: [...f.balloons, b] }));
    setSel(b.uid);
    setPanel('falas');
  };

  // ---------- arrastar no quadro
  const onCharDown = (id: string, e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    if (!svgRef.current || !frame) return;
    const c = frame.chars.find((x) => x.uid === id)!;
    const p = svgPoint(svgRef.current, e.clientX, e.clientY);
    drag.current = { kind: 'char', uid: id, dx: p.x - c.x, dy: p.y - c.y };
    setSel(id);
    setPanel('personagem');
    sfx.tap();
  };
  const onBalloonDown = (id: string, e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    if (!svgRef.current || !frame) return;
    const b = frame.balloons.find((x) => x.uid === id)!;
    const p = svgPoint(svgRef.current, e.clientX, e.clientY);
    drag.current = { kind: 'balloon', uid: id, dx: p.x - b.x, dy: p.y - b.y };
    setSel(id);
    setPanel('falas');
    sfx.tap();
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || !svgRef.current || !frame) return;
    const p = svgPoint(svgRef.current, e.clientX, e.clientY);
    const base = live ?? frame;
    if (d.kind === 'char') setLive({ ...base, chars: base.chars.map((c) => (c.uid === d.uid ? { ...c, x: clamp(p.x - d.dx, 40, 960), y: clamp(p.y - d.dy, 300, 600) } : c)) });
    else setLive({ ...base, balloons: base.balloons.map((b) => (b.uid === d.uid ? { ...b, x: clamp(p.x - d.dx, 80, 920), y: clamp(p.y - d.dy, 40, 560) } : b)) });
  };
  const onUp = () => {
    if (drag.current && live) {
      const l = live;
      setStory((s) => ({ ...s, frames: s.frames.map((f, i) => (i === fi ? l : f)) }));
      sfx.place();
    }
    drag.current = null;
    setLive(null);
  };

  // ---------- quadros
  const addFrameAfter = () => {
    if (!story) return;
    if (frames.length >= 10) return toast('Até 10 quadros.', '🎞️', 'warn');
    const nf = { ...newFrame(frame?.scene ?? st.mainScene ?? { kind: 'habitat' }, cast), chars: (frame?.chars ?? []).map((c) => ({ ...c, uid: uid() })) };
    sfx.place();
    setStory((s) => ({ ...s, frames: [...s.frames.slice(0, fi + 1), nf, ...s.frames.slice(fi + 1)] }));
    setFi(fi + 1);
  };
  const delFrame = () => {
    setConfirmDel(false);
    if (frames.length <= 4) return toast('A história precisa de pelo menos 4 quadros.', '🎞️', 'warn');
    sfx.remove();
    setStory((s) => ({ ...s, frames: s.frames.filter((_, i) => i !== fi) }));
    setFi(Math.max(0, fi - 1));
  };
  const moveFrame = (d: number) => {
    const j = fi + d;
    if (j < 0 || j >= frames.length) return;
    sfx.tap();
    setStory((s) => {
      const f = [...s.frames];
      [f[fi], f[j]] = [f[j], f[fi]];
      return { ...s, frames: f };
    });
    setFi(j);
  };

  const publish = (title: string) => {
    if (!story) return;
    setStory((s) => ({ ...s, title: title.trim().slice(0, 40), published: true, publishedAt: s.publishedAt ?? Date.now() }), { immediate: true });
    setPublishOpen(false);
    setCelebrate(true);
    sfx.success();
    setTimeout(() => setCelebrate(false), 3500);
  };

  const newStory = () => {
    const s: Story = { id: uid(), title: '', frames: [0, 1, 2, 3].map(() => newFrame(st.mainScene ?? { kind: 'habitat' }, cast)), published: false, publishedAt: null, views: 0 };
    if (st.stories.length >= 5) return toast('Até 5 histórias. Que tal melhorar uma delas?', '📚', 'warn');
    update('stories', (x) => ({ ...x, stories: [...x.stories, s], currentId: s.id }));
    setFi(0);
    sfx.whoosh();
  };

  const recNames = useMemo(() => Object.fromEntries(data.sounds.recordings.map((r) => [r.id, r])), [data.sounds.recordings]);

  // ------------------------------------------------------------------ sem história ainda
  if (!story) {
    return (
      <ToolShell title="Estúdio de histórias" icon="🎬" color={STAGES[5].color} missionId={missionId}>
        <div className="scroll-y h-full bg-[radial-gradient(circle_at_50%_0%,#fff7c2,#ffd27a)] p-4">
          <Zuzu text="Bem-vindos ao estúdio! Escolham onde a história vai acontecer." size={90} className="mx-auto max-w-2xl" />
          <ScenePicker current={null} onPick={chooseMain} hasHabitat={!!data.habitat.biome} />
        </div>
      </ToolShell>
    );
  }

  return (
    <ToolShell title="Estúdio de histórias" icon="🎬" color={STAGES[5].color} missionId={missionId}
      extra={<Btn variant="sun" className="hidden !min-h-[52px] lg:inline-flex" onClick={() => setPlaying(true)} data-testid="watch-top">▶ ASSISTIR</Btn>}>
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-col lg:w-[64%] lg:shrink-0">
          <div className="flex shrink-0 items-center gap-2 border-b-4 border-ink bg-white px-2 py-1.5">
            <input className="field !min-h-[44px] flex-1 !text-lg" maxLength={40} placeholder="Título da história" value={story.title} onChange={(e) => setStory((s) => ({ ...s, title: e.target.value }))} data-testid="story-title" />
            {st.stories.length > 1 && (
              <select className="h-11 rounded-xl border-[3px] border-ink bg-white px-2 font-bold" value={story.id} onChange={(e) => { update('stories', (x) => ({ ...x, currentId: e.target.value })); setFi(0); }} aria-label="Escolher história">
                {st.stories.map((s, i) => <option key={s.id} value={s.id}>{s.title || `História ${i + 1}`}</option>)}
              </select>
            )}
            <IconBtn label="Nova história" icon="📄" onClick={newStory} className="!min-h-[44px] !w-11 !min-w-[44px]" />
            {story.published && <span className="chip bg-lime">✔ Publicada</span>}
          </div>
          <div className="relative min-h-[220px] flex-1 bg-night" data-testid="frame-canvas">
            {frame && (
              <FrameView frame={frame} g={data} selected={sel} svgRef={svgRef} onCharDown={onCharDown} onBalloonDown={onBalloonDown} onBgDown={() => setSel(null)} onMove={onMove} onUp={onUp} />
            )}
            <div className="pointer-events-none absolute left-2 top-2 rounded-full border-[3px] border-ink bg-white px-3 py-0.5 text-sm font-bold">Quadro {fi + 1} de {frames.length}</div>
          </div>
          {/* tira de quadros */}
          <div className="shrink-0 border-t-4 border-ink bg-[#2b1f4a] p-2">
            <div className="scroll-x flex items-center gap-2" data-testid="filmstrip">
              {frames.map((f, i) => (
                <button key={f.uid} type="button" onClick={() => { sfx.tap(); setFi(i); setSel(null); }} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-4 ${i === fi ? 'border-sun' : 'border-white/30'}`} aria-label={`Quadro ${i + 1}`} data-testid={`frame-${i}`}>
                  <FrameView frame={f} g={data} still />
                  <span className="absolute left-0.5 top-0.5 rounded bg-white/90 px-1 text-xs font-bold">{i + 1}</span>
                </button>
              ))}
              <button type="button" onClick={addFrameAfter} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-dashed border-white/60 text-3xl text-white" aria-label="Adicionar quadro" data-testid="add-frame">＋</button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <IconBtn label="Mover quadro para a esquerda" icon="⬅️" onClick={() => moveFrame(-1)} disabled={fi === 0} className="!min-h-[44px] !w-11 !min-w-[44px]" />
              <IconBtn label="Mover quadro para a direita" icon="➡️" onClick={() => moveFrame(1)} disabled={fi >= frames.length - 1} className="!min-h-[44px] !w-11 !min-w-[44px]" />
              <IconBtn label="Apagar quadro" icon="🗑️" onClick={() => setConfirmDel(true)} className="!min-h-[44px] !w-11 !min-w-[44px]" />
              <Btn variant="sun" className="!min-h-[44px]" onClick={() => setPlaying(true)} data-testid="watch">▶ ASSISTIR À MINHA HISTÓRIA!</Btn>
              <Btn variant="lime" className={`!min-h-[44px] ${focus === 'publicar' && !story.published ? 'anim-pulse' : ''}`} onClick={() => setPublishOpen(true)} data-testid="publish-open">🏆 PUBLICAR</Btn>
            </div>
          </div>
        </div>

        {/* painel */}
        <div className="flex min-h-0 flex-1 flex-col border-t-4 border-ink bg-cream lg:border-l-4 lg:border-t-0">
          <div className="scroll-x no-scrollbar flex shrink-0 gap-1.5 border-b-4 border-ink bg-white p-2">
            {PANELS.map((p) => (
              <button key={p.id} type="button" role="tab" aria-selected={panel === p.id} onClick={() => { sfx.tap(); setPanel(p.id); }} data-testid={`spanel-${p.id}`}
                className={`flex min-w-[70px] shrink-0 flex-col items-center rounded-2xl border-[3px] px-2 py-1 text-xs font-bold ${panel === p.id ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`}>
                <span className="text-2xl">{p.icon}</span>{p.name}
              </button>
            ))}
          </div>
          <div className="scroll-y min-h-0 flex-1 space-y-3 p-3">
            {panel === 'cenario' && frame && (
              <>
                <p className="font-bold">Cenário do quadro {fi + 1}: {sceneName(frame.scene)}</p>
                <ScenePicker current={frame.scene} onPick={chooseMain} hasHabitat={!!data.habitat.biome} compact />
                <Btn onClick={applyToAll}>🖼️ Usar este cenário em todos os quadros</Btn>
              </>
            )}
            {panel === 'elenco' && (
              <>
                <p className="font-bold">Quem participa da história? (escolham 2 ou mais)</p>
                <div className="grid-fill-lg">
                  {[{ id: 'eu', name: data.monster.name || 'Meu monstrinho', m: data.monster, desc: 'A estrela!' }, ...NPCS.map((n) => ({ id: n.id, name: n.name, m: n.m, desc: n.desc }))].map((c) => (
                    <button key={c.id} type="button" className="tile" aria-pressed={cast.includes(c.id)} onClick={() => toggleCast(c.id)} data-testid={`cast-${c.id}`}>
                      <div className="h-20 w-20"><MonsterSvg m={c.m} still size="100%" /></div>
                      <span className="font-bold">{c.name}</span>
                      <span className="text-[11px] text-ink/60">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {panel === 'personagem' && frame && (
              <>
                <div>
                  <p className="mb-1 font-bold">Colocar no quadro {fi + 1}:</p>
                  <div className="flex flex-wrap gap-2">
                    {cast.map((who) => (
                      <button key={who} type="button" className="tile w-24" onClick={() => addChar(who)} data-testid={`addchar-${who}`}>
                        <div className="h-14 w-14"><MonsterSvg m={who === 'eu' ? data.monster : NPCS.find((n) => n.id === who)!.m} still size="100%" /></div>
                        <span className="text-xs font-bold">{charName(who, data)}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink/70">Arraste os personagens no quadro. Toque num deles para mudar.</p>
                </div>
                {selChar ? (
                  <div className="space-y-2 rounded-2xl border-[3px] border-ink/20 bg-white p-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <b className="mr-auto">{charName(selChar.who, data)}</b>
                      <IconBtn label="Menor" icon="➖" onClick={() => editChar((c) => ({ ...c, s: clamp(+(c.s - 0.15).toFixed(2), 0.5, 1.8) }))} className="!min-h-[44px] !w-11 !min-w-[44px]" />
                      <IconBtn label="Maior" icon="➕" onClick={() => editChar((c) => ({ ...c, s: clamp(+(c.s + 0.15).toFixed(2), 0.5, 1.8) }))} className="!min-h-[44px] !w-11 !min-w-[44px]" />
                      <IconBtn label="Virar" icon="🪞" onClick={() => editChar((c) => ({ ...c, flip: !c.flip }))} className="!min-h-[44px] !w-11 !min-w-[44px]" />
                      <IconBtn label="Falar" icon="💬" onClick={() => addBalloon('fala')} className="!min-h-[44px] !w-11 !min-w-[44px]" />
                      <IconBtn label="Tirar do quadro" icon="🗑️" variant="bubble" onClick={() => { sfx.remove(); setFrame((f) => ({ ...f, chars: f.chars.filter((c) => c.uid !== sel) })); setSel(null); }} className="!min-h-[44px] !w-11 !min-w-[44px]" />
                    </div>
                    <p className="text-sm font-bold">Expressão</p>
                    <div className="scroll-x no-scrollbar flex gap-1.5 pb-1">
                      {[...FACE_PRESETS.map((f) => ({ id: f.id, name: f.name, icon: f.icon })), ...data.life.expressions.map((e) => ({ id: e.id, name: e.name, icon: '⭐' }))].map((f) => (
                        <button key={f.id} type="button" className="tile min-w-[70px] shrink-0" aria-pressed={selChar.face === f.id} onClick={() => { sfx.tap(); editChar((c) => ({ ...c, face: f.id })); }}>
                          <span className="text-2xl">{f.icon}</span><span className="text-[10px]">{f.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm font-bold">Movimento</p>
                    <div className="scroll-x no-scrollbar flex gap-1.5 pb-1">
                      {ANIMS.map((a) => (
                        <button key={a.id} type="button" className="tile min-w-[70px] shrink-0" aria-pressed={selChar.anim === a.id} onClick={() => { sfx.tap(); editChar((c) => ({ ...c, anim: a.id })); }}>
                          <span className="text-2xl">{a.icon}</span><span className="text-[10px]">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="rounded-2xl bg-white p-2 text-sm font-semibold">👆 Toque num personagem no quadro para escolher expressão e movimento.</p>
                )}
              </>
            )}
            {panel === 'falas' && frame && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Btn onClick={() => addBalloon('fala')} data-testid="add-fala">💬 Fala</Btn>
                  <Btn onClick={() => addBalloon('pensamento')}>💭 Pensamento</Btn>
                  <Btn onClick={() => addBalloon('grito')}>📢 Grito</Btn>
                  <Btn onClick={() => addBalloon('legenda')}>📜 Quadrinho de texto</Btn>
                </div>
                {selBalloon && (
                  <div className="space-y-2 rounded-2xl border-[3px] border-ink/20 bg-white p-2">
                    <textarea className="field !min-h-[70px] py-2 !text-lg" maxLength={60} value={selBalloon.text} onChange={(e) => editBalloon((b) => ({ ...b, text: e.target.value }))} placeholder="Escreva a fala (curtinha!)" autoFocus data-testid="balloon-text" />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-bold">Ponta:</span>
                      {(['esquerda', 'direita', 'nenhuma'] as const).map((t) => (
                        <button key={t} type="button" className={`h-10 rounded-xl border-[3px] px-3 text-sm font-bold ${selBalloon.tail === t ? 'border-ink bg-sun' : 'border-ink/20 bg-cream'}`} onClick={() => editBalloon((b) => ({ ...b, tail: t }))}>{t === 'esquerda' ? '↙' : t === 'direita' ? '↘' : '—'}</button>
                      ))}
                      <IconBtn label="Apagar balão" icon="🗑️" variant="bubble" className="ml-auto !min-h-[44px] !w-11 !min-w-[44px]" onClick={() => { sfx.remove(); setFrame((f) => ({ ...f, balloons: f.balloons.filter((b) => b.uid !== sel) })); setSel(null); }} />
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border-[3px] border-ink/20 bg-white p-2">
                  <p className="mb-1 font-bold">Texto do narrador (embaixo do quadro)</p>
                  <input className="field !min-h-[48px] !text-lg" maxLength={70} value={frame.caption} onChange={(e) => setFrame((f) => ({ ...f, caption: e.target.value }))} placeholder="Era uma vez..." data-testid="caption" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {STARTERS.map((s) => <button key={s} type="button" className="chip !text-xs" onClick={() => setFrame((f) => ({ ...f, caption: (f.caption ? f.caption + ' ' : '') + s }))}>+ {s}</button>)}
                  </div>
                </div>
              </>
            )}
            {panel === 'som' && frame && (
              <>
                <p className="font-bold">Efeito sonoro do quadro {fi + 1}</p>
                <div className="grid-fill-sm">
                  <button type="button" className="tile" aria-pressed={!frame.sound} onClick={() => setFrame((f) => ({ ...f, sound: null }))}><span className="text-2xl">🔇</span><span className="text-xs">Nenhum</span></button>
                  {SOUNDS.map((s) => (
                    <button key={s.id} type="button" className="tile" aria-pressed={frame.sound === s.id} onClick={() => { playSound(s.id); setFrame((f) => ({ ...f, sound: s.id })); }} data-testid={`fsound-${s.id}`}>
                      <span className="text-2xl">{s.icon}</span><span className="text-[11px] font-bold">{s.name}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl border-[3px] border-ink/20 bg-white p-2">
                  <p className="mb-1 font-bold">🎙️ Narração com a nossa voz</p>
                  {allowRecordings ? (
                    <>
                      <Recorder label={`Narração quadro ${fi + 1}`} maxSeconds={15} onSaved={(r) => setFrame((f) => ({ ...f, narration: r.id }))} />
                      {frame.narration && recNames[frame.narration] && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="flex-1 font-bold">Narração gravada {recNames[frame.narration].path ? '☁️' : '📱'}</span>
                          <IconBtn label="Ouvir" icon="▶" onClick={() => void playRecording(recNames[frame.narration!])} />
                          <IconBtn label="Tirar" icon="🗑️" onClick={() => setFrame((f) => ({ ...f, narration: null }))} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-semibold">🔒 A gravação de voz está desligada pela escola. Usem os efeitos sonoros!</p>
                  )}
                </div>
              </>
            )}
            {panel === 'tempo' && frame && (
              <>
                <p className="font-bold">Quanto tempo o quadro {fi + 1} fica na tela?</p>
                <div className="flex items-center gap-2">
                  <IconBtn label="Menos tempo" icon="➖" onClick={() => setFrame((f) => ({ ...f, duration: Math.max(2, f.duration - 1) }))} />
                  <span className="w-24 text-center text-2xl font-bold">{frame.duration} s</span>
                  <IconBtn label="Mais tempo" icon="➕" onClick={() => setFrame((f) => ({ ...f, duration: Math.min(10, f.duration + 1) }))} />
                </div>
                <p className="font-bold">Transição para este quadro</p>
                <div className="grid-fill">
                  {TRANSITIONS.map((t) => (
                    <button key={t.id} type="button" className="tile" aria-pressed={frame.transition === t.id} onClick={() => { sfx.select(); setFrame((f) => ({ ...f, transition: t.id })); }}>
                      <span className="text-2xl">{t.icon}</span><span className="text-xs font-bold">{t.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {playing && (
        <StoryPlayer story={story} g={data} credits={`${store.info.student1} e ${store.info.student2}`} onClose={() => { setPlaying(false); setStory((s) => ({ ...s, views: s.views + 1 })); }} />
      )}
      <PublishModal open={publishOpen} story={story} onClose={() => setPublishOpen(false)} onPublish={publish} />
      <Confirm open={confirmDel} title="Apagar quadro?" text={`O quadro ${fi + 1} vai ser apagado.`} yes="Apagar" danger onYes={delFrame} onNo={() => setConfirmDel(false)} />
      {celebrate && <Confetti count={120} />}
    </ToolShell>
  );
}

function ScenePicker({ current, onPick, hasHabitat, compact }: { current: SceneRef | null; onPick: (r: SceneRef) => void; hasHabitat: boolean; compact?: boolean }) {
  const is = (r: SceneRef) => !!current && JSON.stringify(current) === JSON.stringify(r);
  const Tile = ({ r, icon, name, testid }: { r: SceneRef; icon: string; name: string; testid: string }) => (
    <button type="button" className="tile" aria-pressed={is(r)} onClick={() => onPick(r)} data-testid={testid}>
      <span className="text-3xl">{icon}</span>
      <span className="text-xs font-bold">{name}</span>
    </button>
  );
  return (
    <div className={`mx-auto space-y-3 ${compact ? '' : 'mt-4 max-w-3xl'}`}>
      {hasHabitat && (
        <section>
          <h3 className="mb-1 font-bold">⭐ Criado por vocês</h3>
          <div className="grid-fill"><Tile r={{ kind: 'habitat' }} icon="🏝️" name="Meu habitat" testid="scene-habitat" /></div>
        </section>
      )}
      <section>
        <h3 className="mb-1 font-bold">🗺️ Lugares das aventuras</h3>
        <div className="grid-fill">{ADVENTURE_SCENES.map((a) => <Tile key={a.id} r={{ kind: 'aventura', id: a.id }} icon={a.icon} name={a.name} testid={`scene-av-${a.id}`} />)}</div>
      </section>
      <section>
        <h3 className="mb-1 font-bold">🌍 Mundos</h3>
        <div className="grid-fill">{BIOMES.map((b) => <Tile key={b.id} r={{ kind: 'biome', id: b.id }} icon={b.icon} name={b.name} testid={`scene-biome-${b.id}`} />)}</div>
      </section>
      <section>
        <h3 className="mb-1 font-bold">🎨 Fundo colorido</h3>
        <div className="grid-fill">{COLOR_SCENES.map((c) => <Tile key={c.id} r={{ kind: 'cor', id: c.id }} icon={c.icon} name={c.name} testid={`scene-cor-${c.id}`} />)}</div>
      </section>
    </div>
  );
}

function PublishModal({ open, story, onClose, onPublish }: { open: boolean; story: Story; onClose: () => void; onPublish: (title: string) => void }) {
  const [title, setTitle] = useState(story.title);
  useEffect(() => { if (open) setTitle(story.title); }, [open, story.title]);
  const empty = story.frames.filter((f) => !f.chars.length && !f.balloons.some((b) => b.text.trim()) && !f.caption.trim()).length;
  return (
    <Modal open={open} onClose={onClose} title="🏆 Publicar na exposição da dupla">
      <p className="mb-2 text-lg">A história vai para a <b>exposição privada</b> de vocês. Só a dupla e o professor podem ver.</p>
      <label className="block font-bold">Título
        <input className="field mt-1" maxLength={40} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: A grande aventura do Bolinho" data-testid="publish-title" />
      </label>
      {empty > 0 && <p className="mt-2 rounded-2xl bg-sun-light p-2 font-bold">Atenção: {empty} quadro(s) ainda vazio(s). Pode publicar assim mesmo ou caprichar mais!</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Btn onClick={onClose}>Voltar</Btn>
        <Btn variant="lime" disabled={title.trim().length < 2} onClick={() => onPublish(title)} data-testid="publish-ok">🏆 Publicar</Btn>
      </div>
    </Modal>
  );
}
