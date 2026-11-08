import { useMemo } from 'react';
import { CircleAlert, FileDown, Palette, Pencil, Presentation, Printer, Rocket } from 'lucide-react';
import { MEDIA_OPTIONS, mediaName, STEPS } from '../data/constants';
import { Badge, StepIntro } from '../components/ui';
import { buildReferences } from '../engine/references';
import { THEMES } from '../engine/themes';
import { autoTheme } from '../engine/buildDeck';
import { pendingSteps } from '../state/validation';
import { canPrint } from '../lib/save';
import type { ProjectForm } from '../types';

interface Props {
  form: ProjectForm;
  themeChoice: string;
  onTheme: (id: string) => void;
  onEdit: (step: number) => void;
  onGenerate: () => void;
  onSummaryPdf: () => void;
  deckEdited: boolean;
  busy: boolean;
}

export function Step6({ form, themeChoice, onTheme, onEdit, onGenerate, onSummaryPdf, deckEdited, busy }: Props) {
  const pending = pendingSteps(form);
  const auto = useMemo(() => autoTheme(form), [form]);
  const chosen = themeChoice || auto;
  const members = form.members.map((m) => m.name.trim()).filter(Boolean);
  const refs = buildReferences(form.sources);

  const blocks: { step: number; items: [string, string | string[]][] }[] = [
    { step: 1, items: [['Escola', form.school], ['Turma', [form.grade, form.className, form.period].filter(Boolean).join(' · ')], ['Grupo', form.groupName], ['Integrantes', members]] },
    { step: 2, items: [['Tema', form.theme], ['Título', form.workTitle], ['Problema', form.problem], ['Por que escolhemos', form.whyChosen], ['Importância', form.whyImportant], ['Quem é afetado', form.affected], ['Onde', [...form.whereScope, form.whereDetail].filter(Boolean).join(' · ')]] },
    { step: 3, items: [['Descobertas', form.discoveries.map((d) => d.text)], ['Causas', form.causes], ['Consequências', form.consequences], ['Dados', [form.dataText, ...form.dataPoints.map((d) => `${d.value}${d.unit === '%' ? '%' : ' ' + d.unit} — ${d.label}`)].filter((x) => x.trim())], ['Mais surpreendente', form.surprising], ['Aprendemos', form.learned], ['Conclusão', form.conclusion]] },
    { step: 4, items: [['Referências', refs.map((r) => r.text + (r.needsCheck.length ? `  (conferir: ${r.needsCheck.join(', ')})` : ''))]] },
    { step: 5, items: [['Mudança desejada', form.change], ['Intervenção', form.intervention], ['Objetivo', form.objective], ['Público', form.audience], ['Como', form.how], ['Recursos', form.resources], ['Resultados', form.results], ['Mídias', form.media.map((m) => (m === 'outra' ? mediaName(m, form.otherMedia) : MEDIA_OPTIONS.find((o) => o.id === m)?.name ?? m))], ['Mensagem', form.mediaMessage]] },
  ];

  return (
    <div className="flex flex-col gap-6">
      <StepIntro icon={Presentation} step={6} color="mint" title="Nossa pesquisa está pronta para virar uma apresentação!" text="Confiram o resumo. Se algo estiver faltando ou errado, toquem em “Editar” para voltar à etapa. Depois, é só gerar a apresentação." />

      {pending.length > 0 && (
        <div className="card enter border-coral/40 p-5" role="alert">
          <h2 className="flex items-center gap-2 font-display text-[20px] font-extrabold text-coral">
            <CircleAlert aria-hidden /> Ainda faltam algumas respostas obrigatórias
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {pending.map((p) => (
              <li key={p.step} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-coral/10 p-3">
                <span>
                  <strong>Etapa {p.step}:</strong> {p.errors.join(' ')}
                </span>
                <button type="button" className="btn btn-ghost" onClick={() => onEdit(p.step)}>
                  Ir para a etapa {p.step}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {blocks.map((b) => (
          <section key={b.step} className="card enter p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-[20px] font-extrabold">
                <span className="text-brand">Etapa {b.step}</span> · {STEPS[b.step - 1].short}
              </h2>
              <button type="button" className="btn btn-ghost no-print" onClick={() => onEdit(b.step)}>
                <Pencil size={18} aria-hidden /> Editar
              </button>
            </div>
            <dl className="mt-3 grid gap-3">
              {b.items.map(([k, v]) => {
                const empty = Array.isArray(v) ? !v.length : !v.trim();
                return (
                  <div key={k} className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
                    <dt className="text-[14px] font-bold uppercase tracking-[0.06em] text-muted">{k}</dt>
                    <dd className="min-w-0 break-words">
                      {empty ? (
                        <span className="text-muted">Não preenchido</span>
                      ) : Array.isArray(v) ? (
                        <ul className="list-disc space-y-1 pl-5">{v.map((x, i) => <li key={i}>{x}</li>)}</ul>
                      ) : (
                        <span className="whitespace-pre-wrap">{v}</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>

      <section className="card enter no-print p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-[20px] font-extrabold">
          <Palette className="text-violet" aria-hidden /> Estilo visual dos slides
        </h2>
        <p className="mt-1 text-[15px] text-muted">Escolhemos um estilo combinando com o tema de vocês. Se quiserem, troquem.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <button key={t.id} type="button" aria-pressed={chosen === t.id} onClick={() => onTheme(t.id)} className={`flex items-center gap-3 rounded-[18px] border-2 p-3 text-left ${chosen === t.id ? 'border-brand bg-brand/10' : 'border-line bg-surface hover:border-brand/50'}`}>
              <span className="flex h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-line" style={{ background: '#' + t.bg }} aria-hidden>
                <span className="m-auto flex gap-1">
                  {[t.accent, t.accent2, t.accent3].map((c) => (
                    <span key={c} className="h-4 w-4 rounded-full" style={{ background: '#' + c }} />
                  ))}
                </span>
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-1.5 font-bold">
                  {t.name} {t.id === auto && <Badge tone="mint">sugerido</Badge>}
                </span>
                <span className="block text-[13px] leading-snug text-muted">{t.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="no-print flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" onClick={onSummaryPdf}>
          <FileDown size={20} aria-hidden /> Baixar resumo da pesquisa (PDF)
        </button>
        {canPrint() && (
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            <Printer size={20} aria-hidden /> Imprimir resumo
          </button>
        )}
      </div>

      <div className="no-print card enter flex flex-col items-center gap-3 border-brand/30 bg-gradient-to-br from-brand/10 to-violet/10 p-6 text-center">
        {deckEdited && <p className="text-[15px] font-bold text-coral">Atenção: gerar de novo substitui as mudanças que vocês fizeram direto nos slides.</p>}
        <button type="button" className="btn btn-primary min-h-[64px] px-8 text-[19px] tracking-[0.03em]" disabled={pending.length > 0 || busy} onClick={onGenerate}>
          <Rocket size={24} aria-hidden /> {busy ? 'GERANDO…' : 'GERAR APRESENTAÇÃO DO TCA'}
        </button>
        {pending.length > 0 && <p className="text-[15px] text-muted">Completem as respostas obrigatórias para liberar o botão.</p>}
      </div>
    </div>
  );
}
