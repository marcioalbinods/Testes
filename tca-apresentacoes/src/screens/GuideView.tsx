import { useMemo } from 'react';
import { ArrowLeft, FileDown, MessageCircleQuestion } from 'lucide-react';
import type { Deck, ProjectForm } from '../types';
import { buildGuide } from '../engine/guide';
import { layoutDeck } from '../engine/layout';
import { themeById } from '../engine/themes';
import { fixText } from '../engine/text';
import { SlideCanvas } from '../render/SlideView';

export function GuideView({ deck, form, onBack, onDownload, busy }: { deck: Deck; form: ProjectForm; onBack: () => void; onDownload: () => void; busy: boolean }) {
  const guide = useMemo(() => buildGuide(form, deck), [form, deck]);
  const pages = useMemo(() => layoutDeck(deck.slides, themeById(deck.themeId), fixText(form.theme) || 'Nosso tema'), [deck, form.theme]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={20} aria-hidden /> Voltar
        </button>
        <button type="button" className="btn btn-primary" onClick={onDownload} disabled={busy}>
          <FileDown size={20} aria-hidden /> {busy ? 'Preparando…' : 'Baixar guia em PDF'}
        </button>
      </div>
      <header>
        <h1 className="font-display text-[32px] font-extrabold leading-tight">Guia de apresentação do grupo</h1>
        <p className="mt-2 max-w-[65ch] text-muted">Use este guia para estudar. As sugestões usam só o que vocês escreveram: confiram, completem e expliquem com as próprias palavras.</p>
      </header>
      <ul className="card list-disc space-y-1 p-5 pl-10">
        {guide.general.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>

      {guide.sections.map((s, i) => (
        <article key={s.number} className="card grid gap-5 p-5 md:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-2">
            <div className="overflow-hidden rounded-lg border border-line">{pages[i] && <SlideCanvas prims={pages[i]} />}</div>
            {s.presenter && <p className="text-[14px] text-muted">Quem apresenta (sugestão): <strong className="text-ink">{s.presenter}</strong></p>}
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <h2 className="font-display text-[22px] font-extrabold">
              <span className="text-brand">Slide {s.number}</span> · {s.title}
            </h2>
            <GuideItem n={1} title="O que precisamos explicar?">{s.explain}</GuideItem>
            {s.important.length > 0 && (
              <GuideItem n={2} title="Informações mais importantes">
                <ul className="list-disc space-y-1 pl-5">{s.important.map((x, k) => <li key={k}>{x}</li>)}</ul>
              </GuideItem>
            )}
            <GuideItem n={3} title="Como explicar com nossas palavras">
              <ul className="list-disc space-y-1 pl-5">{s.ownWords.map((x, k) => <li key={k}>{x}</li>)}</ul>
            </GuideItem>
            <GuideItem n={4} title="Conceitos que precisamos compreender">
              {s.concepts.length ? (
                <div className="flex flex-wrap gap-2">{s.concepts.map((c) => <span key={c} className="rounded-full bg-sunk px-3 py-1 text-[15px] font-bold">{c}</span>)}</div>
              ) : (
                'Releiam as fontes e anotem as palavras que ainda não entendem bem.'
              )}
            </GuideItem>
            <GuideItem n={5} title="Mensagem principal">
              <p className="rounded-2xl bg-brand/10 p-3 font-bold">{s.message}</p>
            </GuideItem>
          </div>
        </article>
      ))}

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-display text-[28px] font-extrabold">
          <MessageCircleQuestion className="text-violet" aria-hidden /> Perguntas que os professores podem fazer
        </h2>
        <p className="-mt-2 text-muted">Usem as sugestões para estudar, não para decorar.</p>
        {guide.questions.map((q, i) => (
          <details key={i} className="card p-5" open={i < 2}>
            <summary className="cursor-pointer font-display text-[19px] font-extrabold">{q.q}</summary>
            <p className={`mt-3 ${q.hasAnswer ? '' : 'font-bold text-coral'}`}>
              {q.hasAnswer && <span className="block text-[13px] font-bold uppercase tracking-[0.08em] text-violet">Com base no que vocês escreveram</span>}
              {q.answer}
            </p>
            <p className="mt-2 text-[15px] text-muted">
              <strong>Para se preparar:</strong> {q.tip}
            </p>
          </details>
        ))}
      </section>
    </div>
  );
}

function GuideItem({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold uppercase tracking-[0.06em] text-violet">
        {n}. {title}
      </h3>
      <div className="mt-1">{children}</div>
    </div>
  );
}
