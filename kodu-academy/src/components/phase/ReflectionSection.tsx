import { useEffect, useRef, useState } from 'react';
import type { Phase } from '../../content/types';
import { REFLECTION_MIN, type PhaseProgress } from '../../lib/progression';
import { useApp } from '../../state/AppContext';
import { SaveIndicator, useSaver } from './useSaver';

export function ReflectionSection({ phase, progress, readOnly }: { phase: Phase; progress: PhaseProgress | undefined; readOnly: boolean }) {
  const { backend, updateProgress } = useApp();
  const [text, setText] = useState(progress?.reflection ?? '');
  const saver = useSaver();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lastSaved = useRef(progress?.reflection ?? '');

  useEffect(() => {
    setText(progress?.reflection ?? '');
    lastSaved.current = progress?.reflection ?? '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.id]);

  const save = (value: string) => {
    if (!backend || readOnly || value.trim() === lastSaved.current.trim()) return;
    saver.run(() => backend.student.saveReflection(phase.id, value), (p) => {
      lastSaved.current = p.reflection;
      updateProgress(p);
    });
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const len = text.trim().length;
  return (
    <div>
      <label htmlFor={`reflexao-${phase.id}`}>{phase.reflection.prompt}</label>
      <p className="hint-text" id={`reflexao-guia-${phase.id}`}>
        {phase.reflection.guide} (mínimo {REFLECTION_MIN} caracteres; salva automaticamente)
      </p>
      <textarea
        id={`reflexao-${phase.id}`}
        value={text}
        maxLength={2000}
        readOnly={readOnly}
        aria-describedby={`reflexao-guia-${phase.id} reflexao-cont-${phase.id}`}
        onChange={(e) => {
          setText(e.target.value);
          clearTimeout(timer.current);
          const v = e.target.value;
          timer.current = setTimeout(() => save(v), 1200);
        }}
        onBlur={() => {
          clearTimeout(timer.current);
          save(text);
        }}
      />
      <div className="row small" style={{ marginTop: 4 }}>
        <span id={`reflexao-cont-${phase.id}`} className={len >= REFLECTION_MIN ? '' : 'muted'}>
          {len >= REFLECTION_MIN ? '✓ ' : ''}
          {len} caracteres
        </span>
        <span className="spacer" />
        {!readOnly && <SaveIndicator status={saver.status} error={saver.error} onRetry={() => save(text)} />}
      </div>
    </div>
  );
}
