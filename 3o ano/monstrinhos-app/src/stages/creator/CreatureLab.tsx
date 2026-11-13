import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../components/game';
import { ToolShell } from '../../components/shell';
import { Btn, IconBtn, Palette, toast } from '../../components/ui';
import { MonsterSvg, MONSTER_VIEWBOX } from '../../art/Monster';
import { SLOTS, ACCESSORIES, TEXTURES } from '../../art/parts';
import { PALETTE } from '../../art/colors';
import { part } from '../../game/defaults';
import type { AccSel, MonsterState, PartSel, SlotKey } from '../../game/types';
import { STAGES } from '../../game/missions';
import { sfx } from '../../lib/audio';
import Birth from './Birth';

type Tab = SlotKey | 'colors' | 'acc';
const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'head', name: 'Cabeça', icon: '🟣' },
  { id: 'eyes', name: 'Olhos', icon: '👀' },
  { id: 'mouth', name: 'Boca', icon: '👄' },
  { id: 'body', name: 'Corpo', icon: '🫃' },
  { id: 'arms', name: 'Braços', icon: '💪' },
  { id: 'legs', name: 'Pernas', icon: '🦵' },
  { id: 'ears', name: 'Orelhas', icon: '👂' },
  { id: 'horns', name: 'Chifres', icon: '🦄' },
  { id: 'antennae', name: 'Antenas', icon: '📡' },
  { id: 'spikes', name: 'Espinhos', icon: '🦔' },
  { id: 'tail', name: 'Cauda', icon: '🦎' },
  { id: 'wings', name: 'Asas', icon: '🦋' },
  { id: 'colors', name: 'Cores', icon: '🎨' },
  { id: 'acc', name: 'Enfeites', icon: '🎩' },
];

const clone = (m: MonsterState): MonsterState => JSON.parse(JSON.stringify(m));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const HEAD_VIEW = '60 20 280 280';

const Thumb = memo(function Thumb({ m, zoom }: { m: MonsterState; zoom: boolean }) {
  return <MonsterSvg m={m} still size="100%" viewBox={zoom ? HEAD_VIEW : undefined} />;
});

const NAMES = ['Bolinho', 'Zigzag', 'Fofucho', 'Pipoquinha', 'Tonico', 'Lulu', 'Bubu', 'Ziriguidum', 'Nhoque', 'Pitoco', 'Tatá', 'Bilu', 'Cometa', 'Jujuba', 'Trovão', 'Mimosa', 'Gogó', 'Pirulito', 'Babalu', 'Xodó', 'Faísca', 'Biscoito', 'Tutu', 'Bombom'];

export function randomName() {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
}

function randomMonster(base: MonsterState): MonsterState {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const m = clone(base);
  const color = pick(PALETTE).hex;
  m.skin = color;
  m.belly = Math.random() < 0.7 ? pick(PALETTE).hex : null;
  m.texture = Math.random() < 0.5 ? 'liso' : pick(TEXTURES).id;
  m.textureColor = pick(PALETTE).hex;
  for (const slot of Object.keys(SLOTS) as SlotKey[]) {
    const info = SLOTS[slot];
    if (info.optional && Math.random() < (slot === 'arms' || slot === 'legs' ? 0.1 : 0.55)) m.parts[slot] = null;
    else m.parts[slot] = part(pick(info.items).id, { color: slot === 'eyes' ? pick(PALETTE).hex : null });
  }
  return m;
}

export default function CreatureLab({ missionId, focus }: { missionId: number | null; focus?: string }) {
  const { data, update } = useGame();
  const [tab, setTab] = useState<Tab>((focus as Tab) || 'head');
  const [m, setM] = useState<MonsterState>(() => clone(data.monster));
  const [past, setPast] = useState<MonsterState[]>([]);
  const [future, setFuture] = useState<MonsterState[]>([]);
  const [accSel, setAccSel] = useState<number>(-1);
  const [birth, setBirth] = useState(false);
  const [preview, setPreview] = useState<'parado' | 'dancar' | 'andar'>('parado');
  const stage = STAGES[0];

  // Mantém sincronizado se os dados mudarem por fora (outro aparelho, conflito).
  const lastSaved = useRef(data.monster);
  useEffect(() => {
    if (data.monster !== lastSaved.current) {
      lastSaved.current = data.monster;
      setM(clone(data.monster));
    }
  }, [data.monster]);

  const commit = useCallback((next: MonsterState, record = true) => {
    if (record) {
      setPast((p) => [...p.slice(-49), m]);
      setFuture([]);
    }
    setM(next);
    update('monster', () => {
      lastSaved.current = next;
      return next;
    });
  }, [m, update]);

  const addTried = (mm: MonsterState, ...keys: string[]) => {
    for (const k of keys) if (!mm.tried.includes(k)) mm.tried.push(k);
  };

  const slot: SlotKey | null = tab !== 'colors' && tab !== 'acc' ? tab : null;
  const sel: PartSel | null = slot ? m.parts[slot] : null;

  const choosePart = (s: SlotKey, id: string | null) => {
    const next = clone(m);
    if (id === null) next.parts[s] = null;
    else {
      const prev = next.parts[s];
      next.parts[s] = prev ? { ...prev, id } : part(id);
      addTried(next, `${s}:${id}`);
    }
    sfx.select();
    commit(next);
  };

  const editSel = (fn: (p: PartSel) => PartSel, tool?: string) => {
    if (!slot || !m.parts[slot]) return;
    const next = clone(m);
    next.parts[slot] = fn(next.parts[slot]!);
    if (tool) addTried(next, `tool:${tool}`);
    commit(next);
  };
  const editAcc = (fn: (a: AccSel) => AccSel, tool?: string) => {
    if (accSel < 0 || !m.accessories[accSel]) return;
    const next = clone(m);
    next.accessories[accSel] = fn(next.accessories[accSel]);
    if (tool) addTried(next, `tool:${tool}`);
    commit(next);
  };

  const undo = () => {
    if (!past.length) return;
    sfx.tap();
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [m, ...f]);
    commit(prev, false);
  };
  const redo = () => {
    if (!future.length) return;
    sfx.tap();
    const nx = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, m]);
    commit(nx, false);
  };

  // atalhos de teclado (notebook)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      const step = e.shiftKey ? 10 : 4;
      const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (mv) {
        e.preventDefault();
        if (tab === 'acc') editAcc((a) => ({ ...a, dx: clamp(a.dx + mv[0], -90, 90), dy: clamp(a.dy + mv[1], -90, 90) }), 'move');
        else editSel((p) => ({ ...p, dx: clamp(p.dx + mv[0], -80, 80), dy: clamp(p.dy + mv[1], -80, 80) }), 'move');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // ---------- arrastar no palco ----------
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; start: MonsterState; side: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (!(slot && sel) && !(tab === 'acc' && accSel >= 0)) return;
    const r = stageRef.current!.getBoundingClientRect();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: m, side: e.clientX < r.left + r.width / 2 ? -1 : 1 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const r = stageRef.current!.getBoundingClientRect();
    const k = MONSTER_VIEWBOX.w / Math.min(r.width, r.height * (MONSTER_VIEWBOX.w / MONSTER_VIEWBOX.h));
    const dx = (e.clientX - d.x) * k;
    const dy = (e.clientY - d.y) * k;
    const next = clone(d.start);
    if (tab === 'acc') {
      const a = next.accessories[accSel];
      if (!a) return;
      a.dx = clamp(a.dx + dx, -90, 90);
      a.dy = clamp(a.dy + dy, -90, 90);
    } else if (slot && next.parts[slot]) {
      const p = next.parts[slot]!;
      const paired = SLOTS[slot].paired && !SLOTS[slot].items.find((i) => i.id === p.id)?.single;
      p.dx = clamp(p.dx + (paired ? dx * d.side : dx), -80, 80);
      p.dy = clamp(p.dy + dy, -80, 80);
    }
    setM(next);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const moved = JSON.stringify(d.start) !== JSON.stringify(m);
    if (moved) {
      const next = clone(m);
      addTried(next, 'tool:move');
      setPast((p) => [...p.slice(-49), d.start]);
      setFuture([]);
      commit(next, false);
      sfx.place();
    }
  };

  // ---------- miniaturas do catálogo ----------
  const thumbs = useMemo(() => {
    if (!slot) return [];
    return SLOTS[slot].items.map((it) => {
      const t = clone(m);
      const prev = t.parts[slot];
      t.parts[slot] = prev ? { ...prev, id: it.id } : part(it.id);
      return { id: it.id, name: it.name, m: t };
    });
  }, [slot, m]);

  const zoom = slot === 'eyes' || slot === 'mouth';
  const info = slot ? SLOTS[slot] : null;

  const tools = (slot && sel) || (tab === 'acc' && accSel >= 0 && m.accessories[accSel]);

  return (
    <ToolShell title="Laboratório de Criação" icon="🧪" color={stage.color} missionId={missionId}
      extra={!m.born ? (
        <Btn variant="sun" className="hidden !min-h-[52px] md:inline-flex" onClick={() => setBirth(true)} data-testid="create-monster-top">🥚 CRIAR!</Btn>
      ) : null}>
      <div className="flex h-full min-h-0 flex-col lab-bg md:flex-row">
        {/* palco */}
        <div className="flex min-h-0 flex-col md:w-[44%] md:shrink-0 md:border-r-4 md:border-ink">
          <div
            ref={stageRef}
            className="relative min-h-[220px] flex-1 touch-none select-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            data-testid="monster-stage"
            style={{ cursor: tools ? 'grab' : 'default' }}
          >
            <div className="absolute inset-x-[8%] bottom-[6%] h-[10%] rounded-[50%] bg-grape/15" aria-hidden />
            <MonsterSvg m={m} anim={preview} highlight={slot} size="100%" style={{ position: 'absolute', inset: 0 }} />
            {tools && (
              <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/90 px-3 py-1 text-sm font-bold shadow">✋ Arraste para mover</div>
            )}
            {m.born && <div className="absolute right-2 top-2 rounded-full border-[3px] border-ink bg-sun-light px-3 py-1 text-lg font-bold">{m.name}</div>}
          </div>
          {/* ferramentas */}
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 border-t-4 border-ink bg-white/80 p-2">
            <IconBtn label="Desfazer" icon="↩️" onClick={undo} disabled={!past.length} data-testid="undo" />
            <IconBtn label="Refazer" icon="↪️" onClick={redo} disabled={!future.length} data-testid="redo" />
            <IconBtn label="Diminuir" icon="➖" disabled={!tools} onClick={() => (tab === 'acc' ? editAcc((a) => ({ ...a, scale: clamp(+(a.scale - 0.1).toFixed(2), 0.5, 1.8) }), 'size') : editSel((p) => ({ ...p, scale: clamp(+(p.scale - 0.1).toFixed(2), 0.6, 1.5) }), 'size'))} data-testid="smaller" />
            <IconBtn label="Aumentar" icon="➕" disabled={!tools} onClick={() => (tab === 'acc' ? editAcc((a) => ({ ...a, scale: clamp(+(a.scale + 0.1).toFixed(2), 0.5, 1.8) }), 'size') : editSel((p) => ({ ...p, scale: clamp(+(p.scale + 0.1).toFixed(2), 0.6, 1.5) }), 'size'))} data-testid="bigger" />
            <IconBtn label="Girar" icon="🔄" disabled={!(slot && sel) || slot === 'head' || slot === 'body'} onClick={() => editSel((p) => ({ ...p, rot: ((p.rot + 15 + 45) % 90) - 45 }), 'rotate')} data-testid="rotate" />
            <IconBtn label="Espelhar" icon="🪞" disabled={!(slot && sel) || slot === 'head' || slot === 'body'} onClick={() => editSel((p) => ({ ...p, flip: !p.flip }), 'flip')} data-testid="flip" />
            <IconBtn label="Voltar ao lugar" icon="🎯" disabled={!tools} onClick={() => (tab === 'acc' ? editAcc((a) => ({ ...a, dx: 0, dy: 0, scale: 1 })) : editSel((p) => ({ ...p, dx: 0, dy: 0, rot: 0, scale: 1, flip: false })))} />
            <IconBtn label={preview === 'parado' ? 'Ver dançando' : 'Parar'} icon={preview === 'parado' ? '💃' : '⏸️'} onClick={() => setPreview((p) => (p === 'parado' ? 'dancar' : 'parado'))} />
            <IconBtn label="Surpresa!" icon="🎲" onClick={() => { const r = randomMonster(m); addTried(r, ...(Object.keys(r.parts) as SlotKey[]).filter((k) => r.parts[k]).map((k) => `${k}:${r.parts[k]!.id}`)); sfx.whoosh(); commit(r); toast('Que combinação maluca!', '🎲'); }} data-testid="random" />
          </div>
          <div className="shrink-0 bg-white/80 px-2 pb-2">
            <Btn variant={m.born ? 'aqua' : 'sun'} big className={`w-full ${!m.born ? 'shine' : ''}`} onClick={() => setBirth(true)} data-testid="create-monster">
              {m.born ? `✏️ Mudar o nome (${m.name})` : '🥚 CRIAR MEU MONSTRINHO!'}
            </Btn>
          </div>
        </div>

        {/* catálogo */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="scroll-x no-scrollbar flex shrink-0 gap-1.5 border-b-4 border-ink bg-white p-2" role="tablist">
            {TABS.map((t) => {
              const has = t.id !== 'colors' && t.id !== 'acc' ? !!m.parts[t.id as SlotKey] : true;
              return (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => { sfx.tap(); setTab(t.id); setAccSel(-1); }} data-testid={`tab-${t.id}`}
                  className={`flex min-w-[72px] shrink-0 flex-col items-center rounded-2xl border-[3px] px-2 py-1 text-xs font-bold ${tab === t.id ? 'border-ink bg-sun shadow-chunky-sm' : 'border-ink/20 bg-cream'}`}>
                  <span className="text-2xl leading-tight">{t.icon}</span>
                  <span>{t.name}</span>
                  {!has && <span className="text-[10px] text-ink/50">sem</span>}
                </button>
              );
            })}
          </div>
          <div className="scroll-y min-h-0 flex-1 p-2 sm:p-3">
            {slot && info && (
              <>
                <div className="grid-fill-lg">
                  {info.optional && (
                    <button type="button" className="tile aspect-square" aria-pressed={!m.parts[slot]} onClick={() => choosePart(slot, null)} data-testid={`part-${slot}-none`}>
                      <span className="text-3xl">🚫</span>
                      <span className="text-sm">Sem {info.name.toLowerCase()}</span>
                    </button>
                  )}
                  {thumbs.map((t) => (
                    <button key={t.id} type="button" className="tile aspect-square !p-0.5" aria-pressed={m.parts[slot]?.id === t.id} onClick={() => choosePart(slot, t.id)} data-testid={`part-${slot}-${t.id}`} title={t.name}>
                      <div className="h-[80%] w-full"><Thumb m={t.m} zoom={zoom} /></div>
                      <span className="relative z-10 rounded bg-white/85 px-1 text-[11px] leading-tight sm:text-xs">{t.name}</span>
                    </button>
                  ))}
                </div>
                {sel && (
                  <div className="mt-3 rounded-2xl border-[3px] border-ink/20 bg-white p-3">
                    <div className="mb-2 font-bold">🎨 Cor {slot === 'eyes' ? 'dos olhos' : slot === 'mouth' ? 'da língua' : `de ${info.name.toLowerCase()}`}</div>
                    <Palette value={sel.color} allowNone noneLabel={info.skinByDefault ? 'Pele' : 'Original'} onPick={(c) => { const next = clone(m); next.parts[slot]!.color = c; if (c) addTried(next, `color:${c}`); commit(next); }} />
                  </div>
                )}
              </>
            )}
            {tab === 'colors' && (
              <div className="space-y-3">
                <section className="rounded-2xl border-[3px] border-ink/20 bg-white p-3">
                  <h3 className="mb-2 text-lg font-bold">Cor da pele</h3>
                  <Palette value={m.skin} onPick={(c) => { if (!c) return; const n = clone(m); n.skin = c; addTried(n, `color:${c}`); commit(n); }} />
                </section>
                <section className="rounded-2xl border-[3px] border-ink/20 bg-white p-3">
                  <h3 className="mb-2 text-lg font-bold">Barriga</h3>
                  <Palette value={m.belly} allowNone noneLabel="Sem" onPick={(c) => { const n = clone(m); n.belly = c; if (c) addTried(n, `color:${c}`); commit(n); }} />
                </section>
                <section className="rounded-2xl border-[3px] border-ink/20 bg-white p-3">
                  <h3 className="mb-2 text-lg font-bold">Textura da pele</h3>
                  <div className="grid-fill">
                    {TEXTURES.map((tx) => (
                      <button key={tx.id} type="button" className="tile aspect-square !p-0.5" aria-pressed={m.texture === tx.id} onClick={() => { const n = clone(m); n.texture = tx.id; addTried(n, `texture:${tx.id}`); sfx.select(); commit(n); }} data-testid={`texture-${tx.id}`}>
                        <div className="h-[78%] w-full"><Thumb m={{ ...m, texture: tx.id }} zoom /></div>
                        <span className="text-xs">{tx.name}</span>
                      </button>
                    ))}
                  </div>
                  {m.texture !== 'liso' && (
                    <div className="mt-3">
                      <div className="mb-2 font-bold">Cor da textura</div>
                      <Palette value={m.textureColor} onPick={(c) => { if (!c) return; const n = clone(m); n.textureColor = c; addTried(n, `color:${c}`); commit(n); }} />
                    </div>
                  )}
                </section>
                <section className="flex items-center justify-between rounded-2xl border-[3px] border-ink/20 bg-white p-3">
                  <h3 className="text-lg font-bold">Bochechas rosadas</h3>
                  <Btn variant={m.cheeks ? 'lime' : 'white'} onClick={() => { const n = clone(m); n.cheeks = !n.cheeks; commit(n); }}>{m.cheeks ? 'Sim 😊' : 'Não'}</Btn>
                </section>
              </div>
            )}
            {tab === 'acc' && (
              <div>
                <p className="mb-2 font-semibold">Toque para colocar ou tirar (até 4). Toque no ✋ para mexer.</p>
                <div className="grid-fill-lg">
                  {ACCESSORIES.filter((a) => !a.unlock || data.adventures.forest.keep === a.unlock || data.adventures.forest.found.includes(a.unlock)).map((a) => {
                    const idx = m.accessories.findIndex((x) => x.id === a.id);
                    const on = idx >= 0;
                    return (
                      <div key={a.id} className="relative">
                        <button type="button" className="tile aspect-square w-full !p-0.5" aria-pressed={on} data-testid={`acc-${a.id}`}
                          onClick={() => {
                            const n = clone(m);
                            if (on) { n.accessories.splice(idx, 1); setAccSel(-1); sfx.remove(); }
                            else {
                              if (n.accessories.length >= 4) { toast('Máximo de 4 enfeites. Tire um primeiro!', '🎩', 'warn'); return; }
                              n.accessories.push({ id: a.id, color: null, scale: 1, dx: 0, dy: 0 });
                              addTried(n, `acc:${a.id}`);
                              setAccSel(n.accessories.length - 1);
                              sfx.select();
                            }
                            commit(n);
                          }}>
                          <div className="h-[78%] w-full"><Thumb m={{ ...m, accessories: [{ id: a.id, color: null, scale: 1, dx: 0, dy: 0 }] }} zoom={a.slot !== 'back' && a.slot !== 'neck'} /></div>
                          <span className="relative z-10 rounded bg-white/85 px-1 text-[11px] leading-tight sm:text-xs">{a.unlock ? '💎 ' : ''}{a.name}</span>
                        </button>
                        {on && (
                          <button type="button" aria-label={`Mexer em ${a.name}`} onClick={() => { sfx.tap(); setAccSel(idx); }} className={`absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-ink text-lg ${accSel === idx ? 'bg-sun' : 'bg-white'}`}>✋</button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {accSel >= 0 && m.accessories[accSel] && (
                  <div className="mt-3 rounded-2xl border-[3px] border-ink/20 bg-white p-3">
                    <div className="mb-2 font-bold">Cor do enfeite</div>
                    <Palette value={m.accessories[accSel].color} allowNone onPick={(c) => editAcc((a) => ({ ...a, color: c }))} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {birth && (
        <Birth
          m={m}
          onDone={(name) => {
            const n = clone(m);
            n.born = true;
            n.name = name;
            setBirth(false);
            commit(n);
          }}
          onClose={() => setBirth(false)}
        />
      )}
    </ToolShell>
  );
}
