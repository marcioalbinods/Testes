import { useMemo, useState } from 'react';
import { BookOpenCheck, ChevronLeft, ChevronRight, CircleAlert, FileText, MonitorPlay, Pencil, PartyPopper, Presentation, SquarePen } from 'lucide-react';
import type { Deck, ProjectForm } from '../types';
import { layoutDeck } from '../engine/layout';
import { themeById } from '../engine/themes';
import { fixText } from '../engine/text';
import { SlideCanvas } from '../render/SlideView';

export type DownloadKind = 'pptx' | 'pdf' | 'guide' | 'summary' | 'backup';

interface Props {
  deck: Deck;
  form: ProjectForm;
  busy: string | null;
  onDownload: (k: DownloadKind) => void;
  onEditResearch: () => void;
  onEditSlides: () => void;
  onGuide: () => void;
}

export function FinalScreen({ deck, form, busy, onDownload, onEditResearch, onEditSlides, onGuide }: Props) {
  const th = themeById(deck.themeId);
  const pages = useMemo(() => layoutDeck(deck.slides, th, fixText(form.theme) || 'Nosso tema'), [deck, th, form.theme]);
  const visible = deck.slides.filter((s) => !s.hidden);
  const [cur, setCur] = useState(0);
  const i = Math.min(cur, pages.length - 1);
  const group = form.groupName.trim() || form.members.map((m) => m.name.trim()).filter(Boolean).slice(0, 3).join(', ');

  return (
    <div className="flex flex-col gap-6">
      <header className="enter flex flex-col items-start gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-mint text-white shadow-lg">
          <PartyPopper size={32} aria-hidden />
        </span>
        <h1 className="font-display text-[32px] font-extrabold leading-[1.1] sm:text-[42px]">Parabéns! Nossa apresentação do TCA está pronta!</h1>
      </header>

      <dl className="enter grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ['Slides', String(visible.length)],
          ['Grupo', group || '—'],
          ['Tema', fixText(form.theme) || '—'],
        ].map(([k, v]) => (
          <div key={k} className="card min-w-0 p-4">
            <dt className="text-[13px] font-bold uppercase tracking-[0.1em] text-muted">{k}</dt>
            <dd className={`mt-1 break-words font-display font-extrabold ${k === 'Slides' ? 'text-[34px] text-brand' : 'text-[19px] leading-snug'}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="card enter flex flex-col gap-4 p-3 sm:p-5" aria-label="Prévia dos slides">
        <div className="overflow-hidden rounded-xl border border-line shadow-sm">
          {pages[i] && <SlideCanvas prims={pages[i]} label={`Slide ${i + 1}: ${visible[i]?.title}`} />}
        </div>
        <div className="flex items-center justify-between gap-2">
          <button type="button" className="btn btn-ghost h-12 w-12 p-0" onClick={() => setCur(Math.max(0, i - 1))} disabled={i === 0} aria-label="Slide anterior">
            <ChevronLeft aria-hidden />
          </button>
          <p className="min-w-0 truncate text-center font-bold" aria-live="polite">
            {i + 1} / {pages.length} · {visible[i]?.title}
          </p>
          <button type="button" className="btn btn-ghost h-12 w-12 p-0" onClick={() => setCur(Math.min(pages.length - 1, i + 1))} disabled={i === pages.length - 1} aria-label="Próximo slide">
            <ChevronRight aria-hidden />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {pages.map((p, k) => (
            <button key={k} type="button" onClick={() => setCur(k)} className={`w-36 shrink-0 overflow-hidden rounded-lg border-2 ${k === i ? 'border-brand' : 'border-transparent opacity-80 hover:opacity-100'}`} aria-label={`Ver slide ${k + 1}`} aria-current={k === i}>
              <SlideCanvas prims={p} />
            </button>
          ))}
        </div>
      </section>

      {deck.warnings.length > 0 && (
        <section className="card enter border-coral/40 p-5">
          <h2 className="flex items-center gap-2 font-display text-[20px] font-extrabold text-coral">
            <CircleAlert aria-hidden /> Pontos para complementar antes da apresentação
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-[15px]">
            {deck.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="mt-2 text-[14px] text-muted">Nos slides, esses pontos aparecem em caixas tracejadas. Nada foi inventado para preencher os espaços.</p>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Baixar arquivos">
        <DlButton icon={Presentation} title="Baixar PowerPoint" sub=".pptx editável, com notas do orador" onClick={() => onDownload('pptx')} busy={busy === 'pptx'} primary />
        <DlButton icon={FileText} title="Baixar PDF" sub="Slides prontos para projetar" onClick={() => onDownload('pdf')} busy={busy === 'pdf'} />
        <DlButton icon={BookOpenCheck} title="Baixar guia de apresentação" sub="PDF para estudar em grupo" onClick={() => onDownload('guide')} busy={busy === 'guide'} />
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" onClick={onGuide}>
          <MonitorPlay size={20} aria-hidden /> Ver guia na tela
        </button>
        <button type="button" className="btn btn-ghost" onClick={onEditSlides}>
          <SquarePen size={20} aria-hidden /> Editar os slides
        </button>
        <button type="button" className="btn btn-ghost" onClick={onEditResearch}>
          <Pencil size={20} aria-hidden /> Editar a pesquisa
        </button>
      </div>

      <blockquote className="card enter border-violet/30 bg-violet/10 p-6 text-[18px] font-bold leading-relaxed text-ink">
        Agora é hora de estudar, conversar com seu grupo e se preparar para apresentar suas descobertas aos professores. Lembre-se: mais importante do que ler os slides é compreender o assunto e conseguir explicar o que vocês aprenderam!
      </blockquote>
    </div>
  );
}

function DlButton({ icon: Icon, title, sub, onClick, busy, primary }: { icon: typeof FileText; title: string; sub: string; onClick: () => void; busy: boolean; primary?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={busy} className={`flex min-h-[88px] items-center gap-3 rounded-[20px] border-2 p-4 text-left transition-transform active:scale-[0.98] disabled:opacity-60 ${primary ? 'border-brand bg-brand text-brand-ink' : 'border-line bg-surface hover:border-brand/50'}`}>
      <Icon size={30} aria-hidden className="shrink-0" />
      <span className="min-w-0">
        <span className="block font-bold">{busy ? 'Preparando…' : title}</span>
        <span className={`block text-[14px] ${primary ? 'opacity-85' : 'text-muted'}`}>{sub}</span>
      </span>
    </button>
  );
}
