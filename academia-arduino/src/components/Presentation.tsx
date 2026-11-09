/**
 * Modo de apresentação em tela cheia, para o professor projetar na sala.
 * Permite avançar/voltar etapas, destacar conexões, ampliar, mostrar/esconder explicações e códigos.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Code2, Eye, EyeOff, Minus, Plus, Power, Sparkles, X, Zap } from 'lucide-react';
import type { Mission } from '../data/missionTypes';
import { Bench } from './Bench';
import { CodeBlock } from './ui';

export function Presentation({ mission: m, onClose }: { mission: Mission; onClose: () => void }) {
  const steps = m.steps ?? [];
  const [i, setI] = useState(0);
  const [showText, setShowText] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [highlight, setHighlight] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [power, setPower] = useState(false);
  const [flow, setFlow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const final = i >= steps.length;
  const visible = useMemo(() => (final ? null : steps.slice(0, i + 1).flatMap((s) => s.add)), [i, steps, final]);
  const programs = useMemo(() => (m.code && (final || power) ? [{ id: m.id, title: m.title, code: m.code }] : []), [m, final, power]);

  useEffect(() => {
    try { ref.current?.requestFullscreen?.().catch(() => {}); } catch { /* tela cheia indisponível */ }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); setI((x) => Math.min(steps.length, x + 1)); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch { /* */ }
    };
  }, [onClose, steps.length]);

  useEffect(() => { if (final) setPower(true); }, [final]);

  return (
    <div className="present" ref={ref} role="dialog" aria-label={`Apresentação: ${m.title}`}>
      <div className="present-top">
        <strong style={{ fontFamily: 'var(--font-head)', fontSize: '1.15rem' }}>Missão {String(m.n).padStart(2, '0')} — {m.title}</strong>
        <span className="chip purple">Passo {Math.min(i + 1, steps.length + 1)} de {steps.length + 1}</span>
        <div className="spacer" />
        <button className="btn small ghost" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}><ChevronLeft size={18} /> Voltar</button>
        <button className="btn small primary" onClick={() => setI((x) => Math.min(steps.length, x + 1))} disabled={final}>Avançar <ChevronRight size={18} /></button>
        <button className={`btn small ${highlight ? 'warn' : 'ghost'}`} onClick={() => setHighlight((h) => !h)}><Sparkles size={16} /> Destacar conexões</button>
        <button className="btn small ghost icon" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} aria-label="Diminuir"><Minus size={16} /></button>
        <button className="btn small ghost icon" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Ampliar"><Plus size={16} /></button>
        <button className={`btn small ${showText ? 'on' : 'ghost'}`} onClick={() => setShowText((s) => !s)}>{showText ? <Eye size={16} /> : <EyeOff size={16} />} Explicações</button>
        {m.code && <button className={`btn small ${showCode ? 'on' : 'ghost'}`} onClick={() => setShowCode((s) => !s)}><Code2 size={16} /> Código</button>}
        <button className={`btn small ${power ? 'success' : 'ghost'}`} onClick={() => setPower((p) => !p)}><Power size={16} /> {power ? 'Ligado' : 'Ligar'}</button>
        <button className={`btn small ${flow ? 'warn' : 'ghost'}`} onClick={() => setFlow((f) => !f)}><Zap size={16} /> Corrente</button>
        <button className="btn small ghost icon" onClick={onClose} aria-label="Sair da apresentação"><X size={18} /></button>
      </div>
      <div className="present-main">
        <div className="present-stage">
          <div style={{ width: '100%' }}>
            <Bench
              circuit={m.circuit!}
              editable={false}
              bare
              zoom={zoom}
              visibleIds={visible}
              highlightIds={highlight && !final ? steps[i].add : []}
              programs={programs}
              autoPower={power}
              defaultFlow={flow}
            />
          </div>
        </div>
        {(showText || showCode) && (
          <aside className="present-side">
            {showText && (
              <>
                <h2>{final ? 'Ligue e observe!' : `Passo ${i + 1}`}</h2>
                <p>{final ? 'Confira todas as ligações, ligue o cabo USB e observe o funcionamento.' : steps[i].text}</p>
                {!final && steps[i].tip && <p style={{ color: 'var(--yellow-300)' }}>💡 {steps[i].tip}</p>}
              </>
            )}
            {showCode && m.code && <CodeBlock code={m.code} copy={false} />}
          </aside>
        )}
      </div>
    </div>
  );
}
