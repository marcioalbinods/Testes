/** Demonstração passo a passo da montagem (somente leitura), sincronizada com a lista de passos. */
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Maximize2 } from 'lucide-react';
import { Bench } from './Bench';
import type { BuildStep } from '../data/missionTypes';
import type { Circuit } from '../lib/circuit/types';
import { Callout } from './ui';

export function DemoPlayer({ circuit, steps, code, title, onPresent }: { circuit: Circuit; steps: BuildStep[]; code?: string; title: string; onPresent?: () => void }) {
  // passo "steps.length" = montagem completa e ligada
  const [i, setI] = useState(0);
  const total = steps.length + 1;
  const final = i === steps.length;
  const visible = useMemo(() => (final ? null : steps.slice(0, i + 1).flatMap((s) => s.add)), [i, steps, final]);
  const programs = useMemo(() => (code ? [{ id: 'demo', title, code }] : []), [code, title]);
  useEffect(() => setI(0), [circuit]);

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="row between">
        <div className="row">
          <button className="btn small" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}><ChevronLeft size={16} /> Voltar</button>
          <span className="chip purple">Passo {i + 1} de {total}</span>
          <button className="btn small primary" onClick={() => setI((x) => Math.min(total - 1, x + 1))} disabled={final}>Avançar <ChevronRight size={16} /></button>
        </div>
        <div className="row">
          <button className="btn small ghost" onClick={() => setI(steps.length)}><Eye size={16} /> Ver montagem completa</button>
          {onPresent && <button className="btn small ghost" onClick={onPresent}><Maximize2 size={16} /> Tela cheia</button>}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
        <ol className="step-list">
          {steps.map((s, k) => (
            <li key={k} className={`${k === i ? 'active' : ''} ${k < i || final ? 'past' : ''}`} onClick={() => setI(k)}>
              <div>
                {s.text}
                {s.tip && k === i && <div className="small" style={{ color: 'var(--purple-700)', marginTop: 4 }}>💡 {s.tip}</div>}
              </div>
            </li>
          ))}
          <li className={final ? 'active' : ''} onClick={() => setI(steps.length)}>
            <div>
              <strong>Confira tudo, ligue o cabo USB e observe!</strong>
              {final && <div className="small" style={{ marginTop: 4 }}>A demonstração abaixo está com a placa ligada{code ? ' e o programa rodando' : ''}. Ative "Caminho da eletricidade" para ver a corrente.</div>}
            </div>
          </li>
        </ol>
        <Bench circuit={circuit} editable={false} visibleIds={visible} highlightIds={final ? [] : steps[i].add} programs={final ? programs : []} autoPower={final} />
      </div>
      <Callout kind="demo">Esta é uma demonstração ilustrativa da montagem. Na bancada real, faça cada passo com o cabo USB desligado.</Callout>
    </div>
  );
}
