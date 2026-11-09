/** Componentes de interface reutilizáveis. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle, BadgeCheck, Blocks, BookOpen, Calculator, CheckCircle2, Code2, Copy, Cpu, Footprints, Gamepad2, Grid3x3,
  Info, Lightbulb, Lock, Repeat, Search, ShieldAlert, Sparkles, Terminal, Trophy, X, XCircle, Zap, type LucideIcon,
} from 'lucide-react';
import { highlightLines } from '../lib/cpp/highlight';

export const ICONS: Record<string, LucideIcon> = {
  cpu: Cpu, lightbulb: Lightbulb, grid: Grid3x3, code: Code2, search: Search, zap: Zap, blocks: Blocks, calculator: Calculator,
  book: BookOpen, repeat: Repeat, gamepad: Gamepad2, footprints: Footprints, terminal: Terminal, sparkles: Sparkles, trophy: Trophy,
};

/* ---------- Janela modal ---------- */
export function Modal({ title, onClose, children, wide, icon }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; icon?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="modal-head">
          {icon}
          <h2>{title}</h2>
          <button className="btn icon ghost" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Caixas de destaque ---------- */
type CalloutKind = 'info' | 'safety' | 'danger' | 'success' | 'tip' | 'demo';
const CALLOUT_ICON: Record<CalloutKind, LucideIcon> = { info: Info, safety: ShieldAlert, danger: AlertTriangle, success: CheckCircle2, tip: Lightbulb, demo: Info };
export function Callout({ kind = 'info', title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const I = CALLOUT_ICON[kind];
  return (
    <div className={`callout ${kind}`} role={kind === 'danger' ? 'alert' : undefined}>
      <I size={20} aria-hidden />
      <div>
        {title && <strong style={{ display: 'block', fontFamily: 'var(--font-head)', marginBottom: 2 }}>{title}</strong>}
        {children}
      </div>
    </div>
  );
}

/** Aviso padrão para recursos que são demonstrações didáticas (não simulação física completa). */
export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <Callout kind="demo">
      {children ?? 'Demonstração didática: a animação ilustra o caminho da corrente. Os valores vêm de um modelo simplificado do circuito, não de uma medição real.'}
    </Callout>
  );
}

export function SafetyBox({ items, title = 'Segurança na bancada' }: { items: string[]; title?: string }) {
  return (
    <Callout kind="safety" title={title}>
      <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
        {items.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </Callout>
  );
}

/* ---------- Barra de progresso ---------- */
export function ProgressBar({ value, max = 100, color, label }: { value: number; max?: number; color?: 'yellow'; label?: string }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <div className={`progress ${color ?? ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- Abas ---------- */
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon?: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={`tab ${value === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Cabeçalho de página ---------- */
export function PageHead({ icon, color, title, subtitle, children }: { icon: ReactNode; color: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div className="ico-badge" style={{ background: color }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* ---------- Bloco de código com destaque ---------- */
export function CodeBlock({ code, highlight = [], errorLines = [], copy = true, maxHeight, onLineClick }: {
  code: string; highlight?: number[]; errorLines?: number[]; copy?: boolean; maxHeight?: number; onLineClick?: (line: number) => void;
}) {
  const lines = highlightLines(code);
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div style={{ position: 'relative' }}>
      {copy && (
        <button className="btn small dark" style={{ position: 'absolute', right: 10, top: 10, zIndex: 2 }} onClick={doCopy} aria-label="Copiar código">
          {copied ? <BadgeCheck size={16} /> : <Copy size={16} />} {copied ? 'Copiado!' : 'Copiar'}
        </button>
      )}
      <div className="code" style={{ maxHeight }}>
        {lines.map((ln, i) => (
          <div
            key={i}
            className={`ln ${highlight.includes(i + 1) ? 'hl' : ''} ${errorLines.includes(i + 1) ? 'err' : ''}`}
            onClick={onLineClick ? () => onLineClick(i + 1) : undefined}
            style={onLineClick ? { cursor: 'pointer' } : undefined}
          >
            <span className="n">{i + 1}</span>
            <span className="t">
              {ln.map((s, j) => (
                <span key={j} className={s.cls}>
                  {s.text}
                </span>
              ))}
              {ln.length === 0 ? ' ' : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Pergunta de múltipla escolha ---------- */
export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explain: string;
  /** dica mostrada depois do primeiro erro */
  hint?: string;
  code?: string;
}

/**
 * Uma pergunta: o estudante escolhe, recebe explicação; se errar, pode tentar de novo.
 * onResult(true) quando acerta.
 */
export function QuestionCard({ question, index, onResult, onWrong, locked }: {
  question: QuizQuestion; index?: number; onResult?: (ok: boolean, tries: number) => void; onWrong?: () => void; locked?: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(locked ? question.correct : null);
  const [wrong, setWrong] = useState<number[]>([]);
  const solved = picked === question.correct;
  const choose = (i: number) => {
    if (solved) return;
    if (i === question.correct) {
      setPicked(i);
      onResult?.(true, wrong.length + 1);
    } else {
      setWrong((w) => (w.includes(i) ? w : [...w, i]));
      setPicked(i);
      onWrong?.();
    }
  };
  return (
    <div className="quiz-q">
      <h4>
        {index !== undefined && <span className="chip" style={{ marginRight: 8 }}>{index + 1}</span>}
        {question.q}
      </h4>
      {question.code && <div className="mb"><CodeBlock code={question.code} copy={false} /></div>}
      <div className="options">
        {question.options.map((o, i) => {
          const isWrong = wrong.includes(i);
          const isRight = solved && i === question.correct;
          return (
            <button key={i} className={`option ${isRight ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} disabled={solved || isWrong} onClick={() => choose(i)}>
              <span className="letter">{isRight ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + i)}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {solved && (
        <div className="feedback ok">
          <strong>Isso mesmo!</strong> {question.explain}
        </div>
      )}
      {!solved && picked !== null && (
        <div className="feedback no">
          <strong>Ainda não.</strong> {question.hint ?? 'Leia de novo com calma e tente outra opção.'}
        </div>
      )}
    </div>
  );
}

/** Lista de perguntas; chama onComplete quando todas forem respondidas corretamente. */
export function Quiz({ questions, onComplete, completed, onWrong }: { questions: QuizQuestion[]; onComplete?: () => void; completed?: boolean; onWrong?: () => void }) {
  const [ok, setOk] = useState<Set<number>>(new Set());
  const total = questions.length;
  const doneCount = completed ? total : ok.size;
  useEffect(() => {
    if (!completed && ok.size === total && total > 0) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok.size]);
  return (
    <div>
      <div className="row mb">
        <span className="chip green">
          <CheckCircle2 size={14} /> {doneCount} de {total} certas
        </span>
        <div style={{ flex: 1, minWidth: 120 }}>
          <ProgressBar value={doneCount} max={total} label="Perguntas respondidas" />
        </div>
      </div>
      {questions.map((q, i) => (
        <QuestionCard key={i} index={i} question={q} locked={completed} onWrong={onWrong} onResult={(r) => r && setOk((s) => new Set(s).add(i))} />
      ))}
    </div>
  );
}

export function LockedNote({ children }: { children: ReactNode }) {
  return (
    <div className="row muted small">
      <Lock size={16} /> {children}
    </div>
  );
}

export function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? <CheckCircle2 size={18} color="var(--green-600)" /> : <XCircle size={18} color="var(--red-500)" />;
}
