import { useCallback, useRef, useState } from 'react';
import { toAppError } from '../../services/errors';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Executa salvamentos em sequência; só o resultado mais recente é aplicado.
 * Em falha, mantém o estado local e expõe a mensagem para "Tentar de novo".
 */
export function useSaver() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);
  const run = useCallback(async <T,>(fn: () => Promise<T>, apply: (v: T) => void) => {
    const id = ++seq.current;
    setStatus('saving');
    setError(null);
    try {
      const v = await fn();
      if (id === seq.current) {
        apply(v);
        setStatus('saved');
      }
      return true;
    } catch (e) {
      if (id === seq.current) {
        setStatus('error');
        setError(toAppError(e).message);
      }
      return false;
    }
  }, []);
  return { status, error, run };
}

export function SaveIndicator({ status, error, onRetry }: { status: SaveStatus; error: string | null; onRetry?: () => void }) {
  if (status === 'idle') return null;
  if (status === 'saving') return <span className="save-status" role="status">Salvando…</span>;
  if (status === 'saved') return <span className="save-status" role="status">✓ Salvo</span>;
  return (
    <span className="save-status error" role="alert">
      Não foi salvo. {error}{' '}
      {onRetry && (
        <button type="button" className="linklike" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </span>
  );
}
