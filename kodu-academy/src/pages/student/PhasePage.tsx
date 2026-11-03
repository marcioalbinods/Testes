import { Link, useParams } from 'react-router-dom';
import { getPhase, PHASES } from '../../content/phases';
import { MODULES, DIFFICULTY_LABEL } from '../../content/modules';
import { GLOSSARY } from '../../content/glossary';
import { useApp } from '../../state/AppContext';
import { isUnlocked, lockReason, missionPercent } from '../../lib/progression';
import { ProgressBar } from '../../components/ProgressBar';
import { RuleCard, TileLegend } from '../../components/RuleCard';
import { Diagram } from '../../components/Diagrams';
import { Anchor } from '../../components/Anchor';
import { ChecklistSection } from '../../components/phase/ChecklistSection';
import { HintsSection } from '../../components/phase/HintsSection';
import { QuizSection } from '../../components/phase/QuizSection';
import { ReflectionSection } from '../../components/phase/ReflectionSection';
import { CompletionSection } from '../../components/phase/CompletionSection';
import { NotFoundPage } from '../NotFoundPage';
import type { ReactNode } from 'react';

const SECTIONS: [string, string][] = [
  ['antes', 'Antes de começar'],
  ['conceito', 'Conceito'],
  ['resumo', 'Resumo da missão'],
  ['passos', 'Passo a passo'],
  ['regras', 'Regras da fase'],
  ['resultado', 'Resultado esperado'],
  ['checklist', 'Checklist'],
  ['problemas', 'Se não funcionar'],
  ['dicas', 'Dicas'],
  ['teste', 'Teste de aprendizagem'],
  ['reflexao', 'Reflexão'],
  ['desafio', 'Desafio extra'],
  ['concluir', 'Concluir missão'],
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="phase-section card" aria-labelledby={`${id}-t`} tabIndex={-1}>
      <h2 id={`${id}-t`}>{title}</h2>
      {children}
    </section>
  );
}

export function PhasePage() {
  const { id } = useParams();
  const phase = getPhase(Number(id));
  const { progress } = useApp();
  if (!phase) return <NotFoundPage />;
  const mod = MODULES.find((m) => m.id === phase.module)!;
  const p = progress[phase.id];
  const unlocked = isUnlocked(phase.id, progress);
  const completed = p?.status === 'completed';
  const prev = PHASES.find((x) => x.id === phase.id - 1);
  const next = PHASES.find((x) => x.id === phase.id + 1);
  const terms = GLOSSARY.filter((g) => phase.glossary.includes(g.id));
  const hasRules = phase.rules.length > 0;

  const header = (
    <header className="card phase-header" style={{ borderLeftColor: mod.color }}>
      <div className="meta-row">
        <span>Módulo {mod.id} · {mod.title}</span>
      </div>
      <h1 style={{ marginTop: 6 }}>
        Fase {phase.id}: {phase.title}
      </h1>
      <div className="meta-row">
        <span className="badge">{DIFFICULTY_LABEL[phase.difficulty]}</span>
        <span>⏱ {phase.estimatedMinutes[0]}–{phase.estimatedMinutes[1]} min (estimativa)</span>
        {completed && <span className="badge badge-ok">✓ Concluída</span>}
        {p?.manuallyUnlocked && !completed && <span className="badge">Liberada pelo professor</span>}
      </div>
      {unlocked && (
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={missionPercent(phase, p)} label="Progresso da missão" />
        </div>
      )}
    </header>
  );

  if (!unlocked) {
    return (
      <div className="narrow" style={{ margin: '0 auto' }}>
        {header}
        <div className="card" role="status">
          <h2>🔒 Fase bloqueada</h2>
          <p>{lockReason(phase.id)}</p>
          <p className="muted">Objetivo desta fase: {phase.objective}</p>
          <div className="row">
            {prev && <Link className="btn" to={`/fase/${prev.id}`}>Ir para a fase {prev.id}</Link>}
            <Link className="btn btn-ghost" to="/trilha">Ver a trilha</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {header}
      <div className="phase-layout" style={{ marginTop: 20 }}>
        <nav className="phase-nav" aria-label="Seções da fase">
          <ol>
            {SECTIONS.filter(([sid]) => sid !== 'regras' || hasRules).map(([sid, label]) => (
              <li key={sid}>
                <Anchor to={sid}>{label}</Anchor>
              </li>
            ))}
          </ol>
        </nav>

        <div>
          <Section id="antes" title="Antes de começar">
            <p><strong>Objetivo de aprendizagem:</strong> {phase.objective}</p>
            <div className="grid grid-2">
              <div>
                <h3>Habilidades que você vai desenvolver</h3>
                <ul>{phase.skills.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
              <div>
                <h3>Materiais e recursos</h3>
                <ul>{phase.materials.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            </div>
            <p>
              <strong>Pré-requisitos:</strong>{' '}
              {phase.prerequisites.length === 0
                ? 'nenhum — esta é a primeira fase.'
                : phase.prerequisites.map((r, i) => (
                    <span key={r}>
                      {i > 0 && ', '}
                      <Link to={`/fase/${r}`}>fase {r} ({getPhase(r)?.title})</Link>
                    </span>
                  ))}
            </p>
            <p className="alert alert-info" style={{ margin: 0 }}>
              <strong>Seu projeto:</strong> {phase.projectLink}
            </p>
            {phase.versionNotes && (
              <div className="alert alert-warn">
                <strong>Diferenças entre versões do Kodu:</strong>
                <ul style={{ margin: '4px 0 0' }}>{phase.versionNotes.map((n) => <li key={n}>{n}</li>)}</ul>
              </div>
            )}
          </Section>

          <Section id="conceito" title={`Conceito: ${phase.concept.title}`}>
            {phase.concept.paragraphs.map((t) => <p key={t}>{t}</p>)}
            {phase.concept.example && <p className="alert alert-info">Exemplo: {phase.concept.example}</p>}
            {phase.diagrams?.map((d) => <Diagram key={d} id={d} />)}
            {terms.length > 0 && (
              <>
                <h3>Novos termos</h3>
                <dl>
                  {terms.map((t) => (
                    <div key={t.id} style={{ marginBottom: 8 }}>
                      <dt style={{ fontWeight: 700 }}>{t.term}</dt>
                      <dd style={{ margin: 0 }}>{t.definition}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </Section>

          <Section id="resumo" title="Resumo da missão">
            <div className="quad">
              <div>
                <h3>O que fazer</h3>
                <p style={{ margin: 0 }}>{phase.objective}</p>
              </div>
              <div>
                <h3>Como verificar</h3>
                <p style={{ margin: 0 }}>{phase.expectedResult}</p>
              </div>
              <div>
                <h3>Se não funcionar</h3>
                <p style={{ margin: 0 }}>
                  Veja <Anchor to="problemas">os erros comuns</Anchor> e depois <Anchor to="dicas">as dicas</Anchor>, uma de cada vez.
                </p>
              </div>
              <div>
                <h3>O que compreender antes de avançar</h3>
                <ul style={{ margin: 0, paddingLeft: 18 }}>{phase.guidingQuestions.map((q) => <li key={q}>{q}</li>)}</ul>
              </div>
            </div>
          </Section>

          <Section id="passos" title="Passo a passo no Kodu">
            {phase.steps.some((s) => s.rules) && <TileLegend />}
            <ol className="steps" style={{ marginTop: 12 }}>
              {phase.steps.map((s, i) => (
                <li key={i}>
                  <h3>{s.title}</h3>
                  <p style={{ margin: '0 0 6px' }}>{s.detail}</p>
                  {s.where && (
                    <div className="where">
                      <strong>Onde:</strong> <span>{s.where}</span>
                    </div>
                  )}
                  {s.rules && <RuleCard data={s.rules} />}
                  {s.check && (
                    <div className="check">
                      <span aria-hidden="true">✔</span> <span>Confira: {s.check}</span>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Section>

          {hasRules && (
            <Section id="regras" title="Regras de programação desta fase">
              <p className="muted">Como fica o programa ao final da fase. Leia cada linha como uma frase: QUANDO … FAÇA ….</p>
              <TileLegend />
              {phase.rules.map((r, i) => <RuleCard key={i} data={r} />)}
            </Section>
          )}

          <Section id="resultado" title="Resultado esperado">
            <p>{phase.expectedResult}</p>
          </Section>

          <Section id="checklist" title="Checklist da missão">
            <ChecklistSection phase={phase} progress={p} readOnly={completed} />
          </Section>

          <Section id="problemas" title="Se não funcionar, tente isto">
            {phase.troubleshooting.map((t) => (
              <details key={t.problem} className="trouble">
                <summary>{t.problem}</summary>
                <div>{t.solution}</div>
              </details>
            ))}
          </Section>

          <Section id="dicas" title="Dicas">
            <HintsSection phase={phase} progress={p} />
          </Section>

          <Section id="teste" title="Teste de aprendizagem">
            <QuizSection phase={phase} progress={p} />
          </Section>

          <Section id="reflexao" title="Reflexão">
            <ReflectionSection phase={phase} progress={p} readOnly={completed} />
          </Section>

          <Section id="desafio" title="Desafio extra (opcional)">
            <p>{phase.extraChallenge}</p>
            <p className="small muted">Para quem terminar antes. Não conta para a conclusão da fase.</p>
          </Section>

          <Section id="concluir" title="Concluir missão">
            <p className="small muted">Critérios definidos para esta fase: {phase.completionCriteria.join('; ')}.</p>
            <CompletionSection phase={phase} progress={p} />
          </Section>

          <nav className="row" style={{ marginTop: 24 }} aria-label="Navegação entre fases">
            {prev ? <Link className="btn btn-ghost" to={`/fase/${prev.id}`}>← Fase {prev.id}</Link> : <span />}
            <span className="spacer" />
            {next &&
              (completed || isUnlocked(next.id, progress) ? (
                <Link className="btn" to={`/fase/${next.id}`}>Fase {next.id} →</Link>
              ) : (
                <span className="small muted">Conclua esta missão para liberar a fase {next.id}.</span>
              ))}
          </nav>
        </div>
      </div>
    </>
  );
}
