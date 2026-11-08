import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, CircleAlert, Lightbulb, type LucideIcon } from 'lucide-react';
import { wordCount } from '../engine/text';

export function Badge({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'violet' | 'coral' | 'mint' | 'muted' }) {
  const map = {
    brand: 'bg-brand/10 text-brand',
    violet: 'bg-violet/10 text-violet',
    coral: 'bg-coral/10 text-coral',
    mint: 'bg-mint/10 text-mint',
    muted: 'bg-sunk text-muted',
  } as const;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-bold ${map[tone]}`}>{children}</span>;
}

interface FieldProps {
  id: string;
  label: string;
  number?: number;
  required?: boolean;
  hint?: string;
  error?: string;
  help?: string[];
  children: ReactNode;
}

export function Field({ id, label, number, required, hint, error, help, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2" data-field={id}>
      <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[17px] font-bold leading-snug">
        {number !== undefined && <span className="font-display text-brand">{number}.</span>}
        <span className="min-w-0 flex-1">{label}</span>
        {required ? <Badge tone="violet">obrigatório</Badge> : <Badge tone="muted">opcional</Badge>}
      </label>
      {hint && <p className="-mt-1 text-[15px] text-muted">{hint}</p>}
      {children}
      {help && <Help items={help} />}
      {error && (
        <p className="flex items-center gap-1.5 text-[15px] font-bold text-danger" role="alert">
          <CircleAlert size={18} aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

function Help({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button type="button" className="inline-flex min-h-[40px] items-center gap-1.5 text-[15px] font-bold text-brand" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <Lightbulb size={18} aria-hidden /> Precisa de ajuda para responder?
        <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <ul id={id} className="enter mt-1 list-disc space-y-1 rounded-2xl bg-sunk px-8 py-3 text-[15px]">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TextArea({ id, value, onChange, placeholder, rows = 4, invalid, minWords = 12 }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; invalid?: boolean; minWords?: number }) {
  const n = wordCount(value);
  const state = n === 0 ? '' : n < minWords / 2 ? 'Escreva um pouco mais' : n < minWords ? 'Quase lá' : 'Ótimo!';
  return (
    <div className="flex flex-col gap-1">
      <textarea id={id} className="field" rows={rows} value={value} placeholder={placeholder} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} />
      {n > 0 && (
        <div className="flex items-center justify-end gap-2 text-[13px] text-muted" aria-live="polite">
          <span className={`h-1.5 w-16 overflow-hidden rounded-full bg-sunk`}>
            <span className={`block h-full rounded-full ${n >= minWords ? 'bg-mint' : 'bg-sun'}`} style={{ width: `${Math.min(100, (n / minWords) * 100)}%` }} />
          </span>
          {n} {n === 1 ? 'palavra' : 'palavras'} · {state}
        </div>
      )}
    </div>
  );
}

export function TextInput({ id, value, onChange, placeholder, invalid, type = 'text', autoComplete = 'off' }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean; type?: string; autoComplete?: string }) {
  return <input id={id} type={type} className="field" value={value} placeholder={placeholder} aria-invalid={invalid || undefined} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />;
}

export function StepIntro({ icon: Icon, step, title, text, color = 'brand' }: { icon: LucideIcon; step: number; title: string; text: string; color?: 'brand' | 'violet' | 'coral' | 'mint' }) {
  const bg = { brand: 'bg-brand', violet: 'bg-violet', coral: 'bg-coral', mint: 'bg-mint' }[color];
  return (
    <header className="enter flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] ${bg} text-white shadow-lg`}>
        <Icon size={32} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">Etapa {step} de 6</p>
        <h1 className="mt-1 font-display text-[30px] font-extrabold leading-[1.1] sm:text-[38px]">{title}</h1>
        <p className="mt-3 max-w-[62ch] text-[17px] text-muted">{text}</p>
      </div>
    </header>
  );
}

export function Section({ title, children, icon: Icon, note }: { title?: string; children: ReactNode; icon?: LucideIcon; note?: ReactNode }) {
  return (
    <section className="card enter flex flex-col gap-6 p-5 sm:p-7">
      {title && (
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sunk text-brand">
              <Icon size={22} aria-hidden />
            </span>
          )}
          <h2 className="font-display text-[22px] font-extrabold">{title}</h2>
        </div>
      )}
      {note}
      {children}
    </section>
  );
}

export function Toggle({ pressed, onClick, children, className = '' }: { pressed: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-[48px] rounded-2xl border-2 px-4 py-2 text-[16px] font-bold transition-colors ${pressed ? 'border-brand bg-brand/10 text-brand' : 'border-line bg-surface hover:border-brand/50'} ${className}`}
    >
      {children}
    </button>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="card enter w-full max-w-lg rounded-b-none p-6 sm:rounded-b-[22px]" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-[24px] font-extrabold">{title}</h2>
        <div className="mt-3 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
