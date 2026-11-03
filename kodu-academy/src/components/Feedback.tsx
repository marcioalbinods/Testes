import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export function Loading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" /> {text}
    </div>
  );
}

export function ErrorAlert({ message, onRetry }: { message: string | null | undefined; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <div className="alert alert-error" role="alert">
      <div className="row">
        <span>{message}</span>
        {onRetry && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={onRetry}>
            Tentar de novo
          </button>
        )}
      </div>
    </div>
  );
}

type ToastKind = 'ok' | 'error' | 'info';
interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
}
const ToastCtx = createContext<(text: string, kind?: ToastKind) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(1);
  const push = useCallback((text: string, kind: ToastKind = 'info') => {
    const id = seq.current++;
    setToasts((t) => [...t.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/** Janela modal acessível (foco inicial, Esc fecha, foco volta ao botão de origem). */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('input, textarea, select, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('input, textarea, select, button, a[href]')].filter(
          (el) => !el.hasAttribute('disabled'),
        );
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose]);
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgb(10 15 30 / 55%)', display: 'grid', placeItems: 'center', zIndex: 50, padding: 16 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="card" style={{ width: 'min(560px, 100%)', maxHeight: '90vh', overflow: 'auto' }}>
        <h2 id="modal-title" style={{ marginTop: 0 }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
