import { useEffect, useState } from 'react';
import type { Phase } from '../../content/types';
import type { PhaseProgress } from '../../lib/progression';
import { useApp } from '../../state/AppContext';
import { useToast } from '../Feedback';
import { encourage } from '../../lib/encouragement';
import { SaveIndicator, useSaver } from './useSaver';
import { ProgressBar } from '../ProgressBar';

export function ChecklistSection({ phase, progress, readOnly }: { phase: Phase; progress: PhaseProgress | undefined; readOnly: boolean }) {
  const { backend, updateProgress } = useApp();
  const toast = useToast();
  const [items, setItems] = useState<string[]>(progress?.checklist ?? []);
  const saver = useSaver();
  useEffect(() => {
    setItems(progress?.checklist ?? []);
    // Sincroniza só quando a fase muda ou o servidor devolve outro estado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.id, (progress?.checklist ?? []).join('|')]);

  const save = (next: string[]) =>
    backend && saver.run(() => backend.student.saveChecklist(phase.id, next), updateProgress);

  const toggle = (id: string, checked: boolean) => {
    const next = checked ? [...new Set([...items, id])] : items.filter((x) => x !== id);
    setItems(next);
    if (checked) toast(encourage.check(next.length), 'ok');
    save(next);
  };

  const required = phase.checklist.filter((c) => c.required);
  const doneReq = required.filter((c) => items.includes(c.id)).length;
  return (
    <>
      <ProgressBar value={(doneReq / Math.max(required.length, 1)) * 100} label={`${doneReq} de ${required.length} itens obrigatórios`} />
      <ul className="checklist" style={{ marginTop: 12 }}>
        {phase.checklist.map((c) => {
          const checked = items.includes(c.id);
          return (
            <li key={c.id}>
              <label>
                <input type="checkbox" checked={checked} disabled={readOnly} onChange={(e) => toggle(c.id, e.target.checked)} />
                <span className={checked ? 'done' : undefined}>
                  {c.text} {!c.required && <span className="badge">opcional</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 8 }}>
        {readOnly ? (
          <span className="small muted">Fase concluída: o checklist fica guardado como registro.</span>
        ) : (
          <SaveIndicator status={saver.status} error={saver.error} onRetry={() => save(items)} />
        )}
      </div>
    </>
  );
}
