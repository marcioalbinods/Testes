import { useState } from 'react';
import type { Phase } from '../../content/types';
import type { PhaseProgress } from '../../lib/progression';
import { useApp } from '../../state/AppContext';

const LEVELS = [
  { title: 'Dica 1 — direção geral', btn: 'Ver dica 1' },
  { title: 'Dica 2 — ferramenta ou conceito', btn: 'Ver dica 2' },
  { title: 'Dica 3 — demonstração orientada', btn: 'Ver dica 3' },
];

export function HintsSection({ phase, progress }: { phase: Phase; progress: PhaseProgress | undefined }) {
  const { backend, updateProgress } = useApp();
  const [shown, setShown] = useState(0);
  const revealed = Math.max(shown, progress?.hintsViewed ?? 0);

  const reveal = async (level: number) => {
    setShown(level);
    try {
      if (backend) updateProgress(await backend.student.logHint(phase.id, level));
    } catch {
      /* a dica é mostrada mesmo se o registro falhar */
    }
  };

  return (
    <div>
      <p className="muted">
        Tente primeiro sozinho e consulte “Se não funcionar”. As dicas abrem uma de cada vez, da mais geral para a mais específica.
      </p>
      {LEVELS.map((l, i) => {
        const level = i + 1;
        if (level <= revealed) {
          return (
            <div key={level} className="hint-box" aria-live="polite">
              <h3>{l.title}</h3>
              <p style={{ margin: 0 }}>{phase.hints[i]}</p>
            </div>
          );
        }
        if (level === revealed + 1) {
          return (
            <button key={level} type="button" className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => reveal(level)}>
              💡 {l.btn}
            </button>
          );
        }
        return null;
      })}
      {revealed === 3 && (
        <p className="small muted" style={{ marginTop: 10 }}>
          Agora execute você mesmo no Kodu, passo a passo. Entender o porquê de cada bloco é o que conta no teste.
        </p>
      )}
    </div>
  );
}
