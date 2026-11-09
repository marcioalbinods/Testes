/**
 * Ferramenta B — Programação por blocos (inspirada no Scratch).
 * Arraste blocos da paleta para "Iniciar programa" ou "Repetir para sempre".
 * Blocos podem ser reorganizados (arrastar), aninhados (Se / Repetir) e removidos (× ou arrastando de volta à paleta).
 * Toque rápido em um bloco da paleta = adiciona no fim do "Repetir para sempre".
 */
import { useEffect, useMemo, useState } from 'react';
import { Play, Trash2, X } from 'lucide-react';
import {
  BLOCK_DEFS, BLOCK_EXAMPLES, countBlocks, explainProgram, generateCode, LED_PINS, newBlock, VAR_NAMES, type Block, type BlockProgram, type BlockType, type Cond,
} from '../lib/blocks';
import { useLocalState, useProgress } from '../lib/progress';
import { CodeBlock } from './ui';
import { Bench } from './Bench';
import { C_BLOCKS } from '../data/circuits';

type Path = string; // 'setup' | 'loop' | `${id}:body` | `${id}:else`
type DragSrc = { kind: 'palette'; type: BlockType } | { kind: 'move'; id: string };

const PALETTE: BlockType[] = ['ledOn', 'ledOff', 'wait', 'readButton', 'if', 'repeat', 'setVar', 'changeVar', 'print', 'tone', 'noTone'];

function findList(p: BlockProgram, path: Path): Block[] | null {
  if (path === 'setup') return p.setup;
  if (path === 'loop') return p.loop;
  const [id, which] = path.split(':');
  let found: Block[] | null = null;
  const visit = (list: Block[]) => {
    for (const b of list) {
      if (b.id === id) found = which === 'else' ? (b.elseBody ??= []) : (b.body ??= []);
      visit(b.body ?? []);
      visit(b.elseBody ?? []);
    }
  };
  visit(p.setup);
  visit(p.loop);
  return found;
}

const clone = (p: BlockProgram): BlockProgram => JSON.parse(JSON.stringify(p));

function removeBlock(p: BlockProgram, id: string): Block | null {
  let removed: Block | null = null;
  const visit = (list: Block[]) => {
    const i = list.findIndex((b) => b.id === id);
    if (i >= 0) { removed = list.splice(i, 1)[0]; return; }
    for (const b of list) { visit(b.body ?? []); visit(b.elseBody ?? []); }
  };
  visit(p.setup);
  if (!removed) visit(p.loop);
  return removed;
}

function descendantIds(b: Block): Set<string> {
  const s = new Set<string>([b.id]);
  const visit = (list: Block[]) => list.forEach((x) => { s.add(x.id); visit(x.body ?? []); visit(x.elseBody ?? []); });
  visit(b.body ?? []);
  visit(b.elseBody ?? []);
  return s;
}

function findBlock(p: BlockProgram, id: string): Block | null {
  let f: Block | null = null;
  const visit = (list: Block[]) => list.forEach((b) => { if (b.id === id) f = b; visit(b.body ?? []); visit(b.elseBody ?? []); });
  visit(p.setup);
  visit(p.loop);
  return f;
}

export function BlockEditor() {
  const [prog, setProg] = useLocalState<BlockProgram>('blocos:programa', BLOCK_EXAMPLES[0].make());
  const [, setSavedCode] = useLocalState<string>('blocos:codigo', '');
  const [drag, setDrag] = useState<{ src: DragSrc; x: number; y: number; moved: boolean; label: string } | null>(null);
  const [over, setOver] = useState<{ path: Path; index: number } | null>(null);
  const [run, setRun] = useState(false);
  const { reward, bump, state } = useProgress();
  const code = useMemo(() => generateCode(prog), [prog]);
  const explanation = useMemo(() => explainProgram(prog), [prog]);
  const total = countBlocks(prog.setup) + countBlocks(prog.loop);
  const programs = useMemo(() => [{ id: 'blocos', title: 'Programa dos blocos', code }], [code]);

  useEffect(() => { setSavedCode(code); }, [code, setSavedCode]);
  useEffect(() => {
    if (total >= 5 && !state.rewarded.includes('blocks:5')) {
      bump('blocksProgram');
      reward('blocks:5', 30, 'Primeiro programa com blocos!');
    }
  }, [total, state.rewarded, bump, reward]);

  const update = (fn: (p: BlockProgram) => void) => setProg((p0) => { const p = clone(p0); fn(p); return p; });

  // localizar alvo de soltura
  const dropTarget = (x: number, y: number): { path: Path; index: number } | 'trash' | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    if (el.closest('[data-trash]')) return 'trash';
    const list = el.closest('[data-list]') as HTMLElement | null;
    if (!list) return null;
    const path = list.dataset.list!;
    const kids = [...list.children].filter((c) => (c as HTMLElement).dataset.blk) as HTMLElement[];
    let index = kids.length;
    for (let i = 0; i < kids.length; i++) {
      const r = kids[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) { index = i; break; }
    }
    return { path, index };
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const moved = drag.moved || Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6;
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, moved } : d));
      const t = dropTarget(e.clientX, e.clientY);
      setOver(t && t !== 'trash' ? t : null);
    };
    const up = (e: PointerEvent) => {
      const t = dropTarget(e.clientX, e.clientY);
      const d = drag;
      setDrag(null);
      setOver(null);
      if (!d.moved) {
        if (d.src.kind === 'palette') { const t2 = d.src.type; update((p) => p.loop.push(newBlock(t2))); }
        return;
      }
      if (t === 'trash') {
        if (d.src.kind === 'move') { const id = d.src.id; update((p) => { removeBlock(p, id); }); }
        return;
      }
      if (!t) return;
      update((p) => {
        let blk: Block | null;
        if (d.src.kind === 'palette') blk = newBlock(d.src.type);
        else {
          const existing = findBlock(p, d.src.id);
          if (!existing) return;
          // não pode soltar um bloco dentro dele mesmo
          const inner = descendantIds(existing);
          if (inner.has(t.path.split(':')[0])) return;
          // ajustar o índice quando o bloco é movido dentro da mesma lista
          const sameListIdx = (findList(p, t.path) ?? []).findIndex((b) => b.id === existing.id);
          blk = removeBlock(p, existing.id);
          if (sameListIdx >= 0 && sameListIdx < t.index) t.index -= 1;
        }
        const list = findList(p, t.path);
        if (blk && list) list.splice(Math.min(t.index, list.length), 0, blk);
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  });

  const startDrag = (src: DragSrc, e: React.PointerEvent, label: string) => {
    const tag = (e.target as HTMLElement).tagName;
    if (['SELECT', 'INPUT', 'OPTION', 'BUTTON'].includes(tag) || (e.target as HTMLElement).closest('button.x')) return;
    e.preventDefault();
    setDrag({ src, x: e.clientX, y: e.clientY, moved: false, label });
  };

  const setField = (id: string, patch: Partial<Block>) => update((p) => { const b = findBlock(p, id); if (b) Object.assign(b, patch); });
  const setCond = (id: string, patch: Partial<Cond>) => update((p) => { const b = findBlock(p, id); if (b?.cond) Object.assign(b.cond, patch); });

  const renderList = (list: Block[], path: Path, empty: string) => (
    <div className={`blk-list ${over?.path === path ? 'over' : ''}`} data-list={path}>
      {list.map((b, i) => (
        <div key={b.id} data-blk="1">
          {over?.path === path && over.index === i && drag?.moved && <div className="blk-drop-hint">soltar aqui</div>}
          {renderBlock(b)}
        </div>
      ))}
      {over?.path === path && over.index >= list.length && drag?.moved && <div className="blk-drop-hint">soltar aqui</div>}
      {!list.length && !(over?.path === path) && <div className="blk-drop-hint">{empty}</div>}
    </div>
  );

  const pinSelect = (b: Block, pins: number[], field: 'pin' = 'pin') => (
    <select value={b[field]} onChange={(e) => setField(b.id, { [field]: Number(e.target.value) })} aria-label="Pino">
      {pins.map((p) => <option key={p} value={p}>pino {p}</option>)}
    </select>
  );
  const varSelect = (value: string | undefined, on: (v: string) => void) => (
    <select value={value} onChange={(e) => on(e.target.value)} aria-label="Variável">
      {VAR_NAMES.map((v) => <option key={v} value={v}>{v}</option>)}
    </select>
  );

  const renderBlock = (b: Block): JSX.Element => {
    const def = BLOCK_DEFS[b.type];
    const del = <button className="x" onClick={() => update((p) => { removeBlock(p, b.id); })} aria-label="Remover bloco"><X size={14} /></button>;
    const head = (content: JSX.Element) => (
      <div className={`blk c-${def.cat}`} onPointerDown={(e) => startDrag({ kind: 'move', id: b.id }, e, def.label)} style={{ opacity: drag?.src.kind === 'move' && drag.src.id === b.id && drag.moved ? 0.4 : 1 }}>
        {content}
        {del}
      </div>
    );
    switch (b.type) {
      case 'ledOn': return head(<>💡 Acender LED do {pinSelect(b, LED_PINS)}</>);
      case 'ledOff': return head(<>⚫ Apagar LED do {pinSelect(b, LED_PINS)}</>);
      case 'wait':
        return head(<>⏱️ Esperar <input type="number" min={0} max={60000} step={100} value={b.ms} onChange={(e) => setField(b.id, { ms: Math.max(0, Math.min(60000, Number(e.target.value) || 0)) })} aria-label="Milissegundos" /> ms</>);
      case 'readButton': return head(<>🔘 Ler botão do {pinSelect(b, [2, 3, 4, 7])} e guardar em {varSelect(b.name, (v) => setField(b.id, { name: v }))}</>);
      case 'setVar': return head(<>📦 Definir {varSelect(b.name, (v) => setField(b.id, { name: v }))} = <input type="number" value={b.value} onChange={(e) => setField(b.id, { value: Number(e.target.value) || 0 })} aria-label="Valor" /></>);
      case 'changeVar': return head(<>➕ Somar <input type="number" value={b.value} onChange={(e) => setField(b.id, { value: Number(e.target.value) || 0 })} aria-label="Valor" /> em {varSelect(b.name, (v) => setField(b.id, { name: v }))}</>);
      case 'print': return head(<>🖥️ Mostrar {varSelect(b.name, (v) => setField(b.id, { name: v }))} no Serial</>);
      case 'tone':
        return head(<>🎵 Tocar <input type="number" min={31} max={5000} value={b.freq} onChange={(e) => setField(b.id, { freq: Math.max(31, Math.min(5000, Number(e.target.value) || 440)) })} aria-label="Frequência" /> Hz no pino 8</>);
      case 'noTone': return head(<>🔇 Parar som do pino 8</>);
      case 'repeat':
        return (
          <div className="blk-c c-control">
            {head(<>🔁 Repetir <input type="number" min={1} max={100} value={b.times} onChange={(e) => setField(b.id, { times: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })} aria-label="Vezes" /> vezes</>)}
            <div className="blk-slot">{renderList(b.body ?? [], `${b.id}:body`, 'arraste blocos para cá')}</div>
            <div className="blk-foot" />
          </div>
        );
      case 'if': {
        const c = b.cond!;
        return (
          <div className="blk-c c-control">
            {head(
              <>
                ❓ Se
                <select value={c.kind} onChange={(e) => setCond(b.id, e.target.value === 'button' ? { kind: 'button', pin: 2 } : { kind: 'var', name: 'contador', op: '>', value: 5 })} aria-label="Tipo de condição">
                  <option value="button">botão apertado</option>
                  <option value="var">variável…</option>
                </select>
                {c.kind === 'button' ? (
                  <select value={c.pin} onChange={(e) => setCond(b.id, { pin: Number(e.target.value) })} aria-label="Pino do botão">{[2, 3, 4, 7].map((p) => <option key={p} value={p}>no pino {p}</option>)}</select>
                ) : (
                  <>
                    {varSelect(c.name, (v) => setCond(b.id, { name: v }))}
                    <select value={c.op} onChange={(e) => setCond(b.id, { op: e.target.value as Cond['op'] })} aria-label="Comparação">
                      {['==', '!=', '<', '>', '<=', '>='].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input type="number" value={c.value} onChange={(e) => setCond(b.id, { value: Number(e.target.value) || 0 })} aria-label="Valor" />
                  </>
                )}
                então
              </>,
            )}
            <div className="blk-slot">{renderList(b.body ?? [], `${b.id}:body`, 'faça isto')}</div>
            <div className="blk c-control" style={{ boxShadow: 'none', minHeight: 30, cursor: 'default' }}>senão</div>
            <div className="blk-slot">{renderList(b.elseBody ?? [], `${b.id}:else`, 'senão, faça isto (opcional)')}</div>
            <div className="blk-foot" />
          </div>
        );
      }
    }
  };

  return (
    <div className="stack">
      <div className="row">
        <strong style={{ fontFamily: 'var(--font-head)' }}>Exemplos:</strong>
        {BLOCK_EXAMPLES.map((ex) => (
          <button key={ex.id} className="btn small ghost" onClick={() => setProg(ex.make())}>{ex.title}</button>
        ))}
        <button className="btn small danger" onClick={() => setProg({ setup: [], loop: [] })}><Trash2 size={14} /> Limpar tudo</button>
      </div>
      <div className="blocks-layout">
        <div className="card block-palette" data-trash="1" style={{ padding: 12 }}>
          <strong style={{ fontFamily: 'var(--font-head)' }}>Blocos</strong>
          <span className="small muted">Arraste para a área de programação. Toque para adicionar no fim.</span>
          {PALETTE.map((t) => (
            <div key={t} className={`blk c-${BLOCK_DEFS[t].cat}`} onPointerDown={(e) => startDrag({ kind: 'palette', type: t }, e, BLOCK_DEFS[t].label)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && update((p) => p.loop.push(newBlock(t)))}>
              {BLOCK_DEFS[t].label}
            </div>
          ))}
          <span className="small muted">🗑️ Solte um bloco aqui para apagá-lo.</span>
        </div>
        <div className="workspace">
          <div className="blk-c c-event" style={{ marginBottom: 14 }}>
            <div className="blk c-event" style={{ cursor: 'default' }}>🚩 Iniciar programa <span className="small" style={{ opacity: 0.85 }}>(roda 1 vez)</span></div>
            <div className="blk-slot">{renderList(prog.setup, 'setup', 'arraste blocos para cá')}</div>
            <div className="blk-foot" />
          </div>
          <div className="blk-c c-event">
            <div className="blk c-event" style={{ cursor: 'default' }}>🔄 Repetir para sempre</div>
            <div className="blk-slot">{renderList(prog.loop, 'loop', 'arraste blocos para cá')}</div>
            <div className="blk-foot" />
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>{total} blocos</p>
        </div>
        <div className="blocks-out stack" style={{ gap: 10 }}>
          <div className="card" style={{ padding: 14 }}>
            <h4>O que o programa faz</h4>
            <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{explanation.join('\n')}</div>
          </div>
          <div>
            <h4>Código Arduino gerado</h4>
            <CodeBlock code={code} maxHeight={360} />
          </div>
        </div>
      </div>
      <div className="row">
        <button className={`btn ${run ? 'ghost' : 'success'}`} onClick={() => setRun((r) => !r)}><Play size={18} /> {run ? 'Esconder a bancada' : 'Testar na bancada virtual'}</button>
        <span className="small muted">Montagem de teste: LEDs nos pinos 11 (verde), 12 (amarelo) e 13 (vermelho), botão no pino 2 e buzzer no pino 8.</span>
      </div>
      {run && <Bench circuit={C_BLOCKS} editable={false} programs={programs} autoPower />}
      {drag?.moved && (
        <div className="drag-ghost blk c-control" style={{ left: drag.x + 8, top: drag.y + 8 }}>{drag.label}</div>
      )}
    </div>
  );
}
