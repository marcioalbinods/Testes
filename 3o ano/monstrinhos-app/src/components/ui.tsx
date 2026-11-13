import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { sfx, speak, getPrefs } from '../lib/audio';
import { PALETTE } from '../art/colors';

type Variant = 'sun' | 'lime' | 'bubble' | 'aqua' | 'grape' | 'white' | 'ghost';

export function Btn({ variant = 'white', big, icon, className = '', children, sound = 'tap', onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; big?: boolean; icon?: ReactNode; sound?: 'tap' | 'select' | 'none' }) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} ${big ? 'btn-big' : ''} ${className}`}
      onClick={(e) => {
        if (sound === 'tap') sfx.tap();
        else if (sound === 'select') sfx.select();
        onClick?.(e);
      }}
      {...rest}
    >
      {icon && <span aria-hidden className="text-[1.3em] leading-none">{icon}</span>}
      {children}
    </button>
  );
}

export function IconBtn({ label, icon, variant = 'white', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: ReactNode; variant?: Variant }) {
  return (
    <Btn variant={variant} className={`btn-icon ${className}`} aria-label={label} title={label} {...rest}>
      <span aria-hidden className="text-2xl leading-none">{icon}</span>
    </Btn>
  );
}

export function Modal({ open, onClose, children, title, wide, tone = 'white' }: { open: boolean; onClose?: () => void; children: ReactNode; title?: ReactNode; wide?: boolean; tone?: 'white' | 'cream' }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/60 p-3 anim-fade" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" className={`panel anim-pop max-h-[92vh] w-full overflow-y-auto p-5 ${wide ? 'max-w-3xl' : 'max-w-lg'} ${tone === 'cream' ? 'bg-cream' : ''}`}>
        {(title || onClose) && (
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold leading-tight">{title}</h2>
            {onClose && <IconBtn label="Fechar" icon="✖" onClick={onClose} className="!min-h-[48px] !w-12 !min-w-[48px] shrink-0" />}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Janela de confirmação (usada antes de apagar ou reiniciar). */
export function Confirm({ open, title, text, yes = 'Sim', no = 'Não', danger, onYes, onNo }: { open: boolean; title: string; text: ReactNode; yes?: string; no?: string; danger?: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <Modal open={open} onClose={onNo} title={title}>
      <div className="mb-5 text-lg">{text}</div>
      <div className="flex flex-wrap justify-end gap-3">
        <Btn onClick={onNo}>{no}</Btn>
        <Btn variant={danger ? 'bubble' : 'lime'} onClick={onYes}>{yes}</Btn>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- avisos rápidos
type ToastItem = { id: number; text: string; icon?: string; kind?: 'ok' | 'info' | 'warn' };
let pushToast: ((t: Omit<ToastItem, 'id'>) => void) | null = null;
export function toast(text: string, icon?: string, kind: ToastItem['kind'] = 'info') {
  pushToast?.({ text, icon, kind });
}
export function Toasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    let n = 0;
    pushToast = (t) => {
      const id = ++n;
      setItems((s) => [...s.slice(-2), { ...t, id }]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3200);
    };
    return () => {
      pushToast = null;
    };
  }, []);
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-3" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`anim-rise flex items-center gap-2 rounded-2xl border-4 border-ink px-4 py-2 text-lg font-bold shadow-chunky ${t.kind === 'ok' ? 'bg-lime' : t.kind === 'warn' ? 'bg-sun' : 'bg-white'}`}>
          {t.icon && <span className="text-2xl">{t.icon}</span>}
          {t.text}
        </div>
      ))}
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------- confete
export function Confetti({ count = 80, colors = ['#ff5fa2', '#ffc93c', '#7ee04a', '#32d1e5', '#9b6bff', '#ff8a3d'] }: { count?: number; colors?: string[] }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2 + Math.random() * 1.8,
        dx: (Math.random() - 0.5) * 200,
        rot: (Math.random() - 0.5) * 1440,
        color: colors[i % colors.length],
        round: Math.random() < 0.3,
      })),
    [count, colors],
  );
  return createPortal(
    <div aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${p.left}%`, background: p.color, borderRadius: p.round ? 999 : 3, ['--delay' as string]: `${p.delay}s`, ['--dur' as string]: `${p.dur}s`, ['--dx' as string]: `${p.dx}px`, ['--rot' as string]: `${p.rot}deg` }}
        />
      ))}
    </div>,
    document.body,
  );
}

export function Bubbles({ n = 14 }: { n?: number }) {
  const list = useMemo(() => Array.from({ length: n }, () => ({ left: Math.random() * 100, size: 14 + Math.random() * 46, dur: 8 + Math.random() * 10, delay: -Math.random() * 15 })), [n]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {list.map((b, i) => (
        <span key={i} className="bubble" style={{ left: `${b.left}%`, width: b.size, height: b.size, ['--dur' as string]: `${b.dur}s`, ['--delay' as string]: `${b.delay}s` }} />
      ))}
    </div>
  );
}

export function Stars({ n, max = 3, size = 28 }: { n: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} de ${max} estrelas`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17l-6 3.4 1.3-6.7-5-4.7 6.8-.8z" fill={i < n ? '#ffc93c' : '#e6e0f5'} stroke="#2b1f4a" strokeWidth={1.8} strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

/** Paleta de cores grandes (boa para o dedo). */
export function Palette({ value, onPick, allowNone, noneLabel = 'Original' }: { value: string | null; onPick: (hex: string | null) => void; allowNone?: boolean; noneLabel?: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="listbox" aria-label="Cores">
      {allowNone && (
        <button
          type="button"
          role="option"
          aria-selected={value === null}
          onClick={() => { sfx.select(); onPick(null); }}
          className={`flex h-12 min-w-[48px] items-center justify-center rounded-full border-4 px-2 text-xs font-bold ${value === null ? 'border-ink bg-sun-light' : 'border-ink/20 bg-white'}`}
        >
          {noneLabel}
        </button>
      )}
      {PALETTE.map((c) => (
        <button
          key={c.id}
          type="button"
          role="option"
          aria-selected={value?.toLowerCase() === c.hex}
          aria-label={c.name}
          title={c.name}
          onClick={() => { sfx.select(); onPick(c.hex); }}
          className="h-12 w-12 rounded-full border-4 transition-transform active:scale-90"
          style={{ background: c.hex, borderColor: value?.toLowerCase() === c.hex ? '#2b1f4a' : 'rgba(43,31,74,0.18)', boxShadow: value?.toLowerCase() === c.hex ? '0 0 0 3px #ffc93c' : undefined }}
        />
      ))}
    </div>
  );
}

/** Botão de alto-falante: lê o texto em voz alta. */
export function SpeakBtn({ text, className = '' }: { text: string; className?: string }) {
  return (
    <button type="button" aria-label="Ouvir" title="Ouvir" onClick={() => speak(text, true)} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-aqua text-xl shadow-chunky-sm active:translate-y-0.5 ${className}`}>
      🔊
    </button>
  );
}

export function useAutoSpeak(text: string | null | undefined) {
  useEffect(() => {
    if (text && getPrefs().voice) speak(text);
  }, [text]);
}

/** Grade de opções grandes com ícone. */
export function OptionGrid<T extends { id: string; name: string; icon?: string }>({ items, selected, onPick, cols = 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6', render }: { items: T[]; selected: (id: string) => boolean; onPick: (item: T) => void; cols?: string; render?: (item: T) => ReactNode }) {
  return (
    <div className={`grid gap-2 ${cols}`}>
      {items.map((it) => (
        <button key={it.id} type="button" className="tile" aria-pressed={selected(it.id)} onClick={() => { sfx.select(); onPick(it); }}>
          {render ? render(it) : (
            <>
              {it.icon && <span className="text-3xl leading-none">{it.icon}</span>}
              <span className="mt-1 text-sm leading-tight">{it.name}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 0.05, onChange, left, right }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; left?: ReactNode; right?: ReactNode }) {
  return (
    <label className="flex w-full items-center gap-3 font-bold">
      <span className="w-24 shrink-0 text-sm">{label}</span>
      {left && <span className="text-xl">{left}</span>}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-10 w-full accent-grape" aria-label={label} />
      {right && <span className="text-xl">{right}</span>}
    </label>
  );
}
