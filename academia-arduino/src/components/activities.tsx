/** Atividades interativas reutilizáveis (missões, jogos e escola de programação). */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, GripVertical, RotateCcw, Shuffle } from 'lucide-react';
import { ArduinoUnoSvg, type BoardPartId } from '../svg/ArduinoUno';
import { BreadboardSvg } from '../svg/Breadboard';
import { connectedHoles, holeLabel, netOf } from '../lib/breadboard';
import { partInfo } from '../data/arduinoParts';
import { highlightLines } from '../lib/cpp/highlight';
import { MascotSays } from '../svg/Mascot';

/* ================= Encontre a parte no Arduino ================= */
export function ArduinoFind({ targets, onDone, done }: { targets: { part: BoardPartId; prompt: string; explain: string }[]; onDone: () => void; done?: boolean }) {
  const [i, setI] = useState(done ? targets.length : 0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [flash, setFlash] = useState<BoardPartId | null>(null);
  const [wrongs, setWrongs] = useState(0);
  const cur = targets[i];
  const click = (id: BoardPartId) => {
    if (!cur) return;
    if (id === cur.part || (cur.part === 'digital' && id === 'digital')) {
      setMsg({ ok: true, text: `Isso! ${cur.explain}` });
      setFlash(id);
      setWrongs(0);
      const ni = i + 1;
      setI(ni);
      if (ni === targets.length) onDone();
    } else {
      setWrongs((w) => w + 1);
      setMsg({ ok: false, text: `Esse é: ${partInfo(id).name}. ${wrongs >= 1 ? 'Dica: olhe a parte piscando em amarelo.' : 'Tente outra parte!'}` });
      setFlash(null);
    }
  };
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="proto-stage">
        <ArduinoUnoSvg onPart={click} highlightPart={cur && wrongs >= 2 ? cur.part : flash} />
      </div>
      <div className="stack">
        <div className="row"><span className="chip purple">{Math.min(i, targets.length)} de {targets.length}</span></div>
        {cur ? (
          <MascotSays mood="think"><strong>{cur.prompt}</strong><br /><span className="small muted">Clique na parte certa da placa.</span></MascotSays>
        ) : (
          <MascotSays mood="party"><strong>Você encontrou todas as partes!</strong></MascotSays>
        )}
        {msg && <div className={`feedback ${msg.ok ? 'ok' : 'no'}`}>{msg.text}</div>}
        {!cur && <button className="btn ghost small" onClick={() => { setI(0); setMsg(null); setFlash(null); }}><RotateCcw size={16} /> Fazer de novo</button>}
      </div>
    </div>
  );
}

/* ================= Os furos estão conectados? ================= */
export function ProtoQuiz({ items, onDone, done, railsSplit = false }: { items: { a: string; b: string; connected: boolean; explain: string }[]; onDone: () => void; done?: boolean; railsSplit?: boolean }) {
  const [i, setI] = useState(done ? items.length : 0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const cur = items[i];
  const cfg = { railsSplit };
  const choose = (v: boolean) => {
    if (answer !== null || !cur) return;
    setAnswer(v);
    if (v === cur.connected) setScore((s) => s + 1);
  };
  const next = () => {
    if (answer !== cur.connected) { setAnswer(null); return; } // errou: tenta de novo
    const ni = i + 1;
    setI(ni);
    setAnswer(null);
    if (ni === items.length) onDone();
  };
  if (!cur)
    return (
      <div className="stack">
        <MascotSays mood="party"><strong>Muito bem!</strong> Você já entende como a protoboard é ligada por dentro.</MascotSays>
        <button className="btn ghost small" style={{ width: 'fit-content' }} onClick={() => { setI(0); setScore(0); }}><RotateCcw size={16} /> Fazer de novo</button>
      </div>
    );
  const revealed = answer !== null;
  const lit = revealed ? [netOf(cur.a, cfg)!, netOf(cur.b, cfg)!] : [];
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="proto-stage">
        <BreadboardSvg cfg={cfg} highlight={[cur.a, cur.b]} litNets={lit} holeFill={{ [cur.a]: '#ffd43b', [cur.b]: '#ffd43b' }} view={revealed ? 'inside' : 'top'} />
      </div>
      <div className="stack">
        <span className="chip purple" style={{ width: 'fit-content' }}>Pergunta {i + 1} de {items.length} · acertos: {score}</span>
        <h3>Os furos <code>{holeLabel(cur.a).replace('furo ', '')}</code> e <code>{holeLabel(cur.b).replace('furo ', '')}</code> estão ligados por dentro?</h3>
        <div className="row">
          <button className={`btn ${revealed && cur.connected ? 'success' : ''}`} onClick={() => choose(true)} disabled={revealed}>Sim, estão ligados</button>
          <button className={`btn ${revealed && !cur.connected ? 'success' : ''}`} onClick={() => choose(false)} disabled={revealed}>Não estão ligados</button>
        </div>
        {revealed && (
          <div className={`feedback ${answer === cur.connected ? 'ok' : 'no'}`}>
            <strong>{answer === cur.connected ? 'Acertou!' : 'Não é isso.'}</strong> {cur.explain} Veja na imagem as tiras de metal por dentro.
          </div>
        )}
        {revealed && <button className="btn primary" style={{ width: 'fit-content' }} onClick={next}>{answer === cur.connected ? 'Próxima' : 'Tentar de novo'}</button>}
      </div>
    </div>
  );
}

/* ================= Organize o código ================= */
function shuffled<T>(arr: T[], seed = Date.now()): T[] {
  const a = [...arr];
  let s = seed % 2147483647;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function CodeOrder({ lines, onDone, onWrong }: { lines: string[]; onDone?: () => void; onWrong?: () => void }) {
  const items = useMemo(() => lines.map((t, i) => ({ id: i, t })), [lines]);
  const fresh = () => {
    let s = shuffled(items);
    for (let k = 0; k < 5 && s.every((x, i) => x.t === items[i].t); k++) s = shuffled(items, Date.now() + k * 7);
    return s;
  };
  const [order, setOrder] = useState(fresh);
  const [result, setResult] = useState<boolean[] | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOrder(fresh()); setResult(null); }, [items]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const o = [...order];
    const [x] = o.splice(from, 1);
    o.splice(to, 0, x);
    setOrder(o);
    setResult(null);
  };
  const check = () => {
    const r = order.map((x, i) => x.t === lines[i]);
    setResult(r);
    if (r.every(Boolean)) onDone?.();
    else onWrong?.();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragIdx === null || !listRef.current) return;
    const els = [...listRef.current.querySelectorAll('[data-idx]')] as HTMLElement[];
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom) setOverIdx(Number(el.dataset.idx));
    }
  };
  const endDrag = () => {
    if (dragIdx !== null && overIdx !== null) move(dragIdx, overIdx);
    setDragIdx(null);
    setOverIdx(null);
  };
  const allOk = result?.every(Boolean);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="sortable" ref={listRef} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
        {order.map((x, i) => (
          <div
            key={x.id}
            data-idx={i}
            className={`sort-item ${dragIdx === i ? 'dragging' : ''} ${overIdx === i && dragIdx !== i ? 'over' : ''} ${result ? (result[i] ? 'ok' : 'no') : ''}`}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
              setDragIdx(i);
            }}
          >
            <GripVertical size={18} className="handle" aria-hidden />
            <code style={{ flex: 1 }}>
              {highlightLines(x.t)[0].map((s, j) => <span key={j} className={s.cls}>{s.text}</span>)}
            </code>
            <button className="btn" onClick={() => move(i, i - 1)} aria-label="Subir linha" disabled={i === 0}><ArrowUp size={16} /></button>
            <button className="btn" onClick={() => move(i, i + 1)} aria-label="Descer linha" disabled={i === order.length - 1}><ArrowDown size={16} /></button>
          </div>
        ))}
      </div>
      <div className="row">
        <button className="btn primary" onClick={check}><Check size={18} /> Conferir a ordem</button>
        <button className="btn ghost" onClick={() => { setOrder(fresh()); setResult(null); }}><Shuffle size={16} /> Embaralhar de novo</button>
      </div>
      {result && (
        <div className={`feedback ${allOk ? 'ok' : 'no'}`}>
          {allOk ? <><strong>Perfeito!</strong> O programa está na ordem certa.</> : <><strong>Ainda não.</strong> As linhas com borda vermelha estão fora do lugar. Lembre: setup() vem antes do loop(), e cada bloco termina com {'"}"'}.</>}
        </div>
      )}
    </div>
  );
}

/* ================= Complete o código ================= */
const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

export function CodeFill({ template, onDone, onWrong }: { template: string; onDone?: () => void; onWrong?: () => void }) {
  const parts = useMemo(() => {
    const out: ({ t: 'text'; v: string } | { t: 'blank'; answers: string[]; i: number })[] = [];
    let last = 0;
    let n = 0;
    const re = /\[\[([^\]]+)\]\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(template))) {
      out.push({ t: 'text', v: template.slice(last, m.index) });
      out.push({ t: 'blank', answers: m[1].split('|'), i: n++ });
      last = m.index + m[0].length;
    }
    out.push({ t: 'text', v: template.slice(last) });
    return out;
  }, [template]);
  const blanks = parts.filter((p): p is { t: 'blank'; answers: string[]; i: number } => p.t === 'blank');
  const [vals, setVals] = useState<string[]>(() => blanks.map(() => ''));
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const [tries, setTries] = useState(0);
  useEffect(() => { setVals(blanks.map(() => '')); setChecked(null); setTries(0); }, [template]);
  const check = () => {
    const r = blanks.map((b, k) => b.answers.some((a) => norm(a) === norm(vals[k])));
    setChecked(r);
    setTries((t) => t + 1);
    if (r.every(Boolean)) onDone?.();
    else onWrong?.();
  };
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="fill-code">
        {parts.map((p, k) =>
          p.t === 'text' ? (
            <span key={k}>
              {highlightLines(p.v).map((ln, li) => (
                <span key={li}>
                  {li > 0 && '\n'}
                  {ln.map((s, j) => <span key={j} className={s.cls}>{s.text}</span>)}
                </span>
              ))}
            </span>
          ) : (
            <input
              key={k}
              aria-label={`Lacuna ${p.i + 1}`}
              value={vals[p.i]}
              size={Math.max(4, p.answers[0].length + 1)}
              className={checked ? (checked[p.i] ? 'ok' : 'no') : ''}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => { const v = [...vals]; v[p.i] = e.target.value; setVals(v); setChecked(null); }}
            />
          ),
        )}
      </div>
      <div className="row">
        <button className="btn primary" onClick={check}><Check size={18} /> Conferir</button>
        {tries >= 2 && checked && !checked.every(Boolean) && (
          <button className="btn ghost" onClick={() => setVals(blanks.map((b, k) => (checked[k] ? vals[k] : b.answers[0])))}>Mostrar as respostas que faltam</button>
        )}
      </div>
      {checked && (
        <div className={`feedback ${checked.every(Boolean) ? 'ok' : 'no'}`}>
          {checked.every(Boolean) ? <><strong>Tudo certo!</strong> O código está completo.</> : <><strong>Confira as lacunas em vermelho.</strong> Atenção às letras maiúsculas e minúsculas no código real do Arduino.</>}
        </div>
      )}
    </div>
  );
}

/** Mostra os furos conectados a um furo (usado em explicações). */
export function connectedText(id: string) {
  return connectedHoles(id).map((h) => holeLabel(h).replace('furo ', '')).join(', ');
}
