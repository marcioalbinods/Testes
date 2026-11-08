import { useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, Palette } from 'lucide-react';
import type { Deck, ProjectForm, SlideData, SlideField } from '../types';
import { layoutDeck, layoutSlide } from '../engine/layout';
import { THEMES, themeById } from '../engine/themes';
import { fixText } from '../engine/text';
import { SlideCanvas } from '../render/SlideView';

interface Props {
  deck: Deck;
  form: ProjectForm;
  onChange: (d: Deck) => void;
  onBack: () => void;
}

export function SlideEditor({ deck, form, onChange, onBack }: Props) {
  const [sel, setSel] = useState(0);
  const th = themeById(deck.themeId);
  const label = fixText(form.theme) || 'Nosso tema';
  const slide = deck.slides[Math.min(sel, deck.slides.length - 1)];
  const visible = deck.slides.filter((s) => !s.hidden);
  const thumbs = useMemo(() => layoutDeck(deck.slides.map((s) => ({ ...s, hidden: false })), th, label), [deck, th, label]);
  const vIndex = visible.indexOf(slide);
  const prims = useMemo(
    () => layoutSlide(slide, { th, index: vIndex >= 0 ? vIndex : 0, total: visible.length, themeLabel: label }),
    [slide, th, vIndex, visible.length, label],
  );

  const patchSlide = (patch: Partial<SlideData>) => onChange({ ...deck, slides: deck.slides.map((s) => (s.id === slide.id ? { ...s, ...patch } : s)) });
  const patchField = (key: string, value: SlideField['value']) => patchSlide({ fields: slide.fields.map((f) => (f.key === key ? { ...f, value, missing: (Array.isArray(value) ? value.length : value.trim()) ? undefined : f.missing } : f)) });
  const move = (dir: -1 | 1) => {
    const i = deck.slides.indexOf(slide);
    const j = i + dir;
    if (j < 1 || j >= deck.slides.length) return; // a capa fica sempre em primeiro
    const arr = [...deck.slides];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange({ ...deck, slides: arr });
    setSel(j);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={20} aria-hidden /> Voltar para a apresentação
        </button>
        <label className="flex items-center gap-2 font-bold">
          <Palette size={20} className="text-violet" aria-hidden /> Estilo
          <select className="field min-h-[48px] w-auto py-2" value={deck.themeId} onChange={(e) => onChange({ ...deck, themeId: e.target.value })}>
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <h1 className="font-display text-[30px] font-extrabold">Editar os slides</h1>
      <p className="-mt-3 max-w-[65ch] text-muted">Toquem em um slide para mudar os textos. Cada linha de uma lista vira um tópico. Lembrem: poucos tópicos e frases curtas ajudam na apresentação.</p>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Slides" className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[78vh] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
          {deck.slides.map((s, k) => (
            <button key={s.id} type="button" onClick={() => setSel(k)} aria-current={k === sel} className={`w-40 shrink-0 rounded-xl border-2 p-1.5 text-left lg:w-full ${k === sel ? 'border-brand bg-brand/10' : 'border-line bg-surface'} ${s.hidden ? 'opacity-50' : ''}`}>
              <SlideCanvas prims={thumbs[k]} />
              <span className="mt-1 block truncate px-1 text-[13px] font-bold">
                {k + 1}. {s.title} {s.hidden ? '(oculto)' : ''}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          <div className={`overflow-hidden rounded-xl border border-line shadow-sm ${slide.hidden ? 'opacity-50' : ''}`}>
            <SlideCanvas prims={prims} label={`Prévia do slide ${slide.title}`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => move(-1)} disabled={deck.slides.indexOf(slide) <= 1}>
              <ArrowUp size={18} aria-hidden /> Mover para antes
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => move(1)} disabled={deck.slides.indexOf(slide) === 0 || deck.slides.indexOf(slide) === deck.slides.length - 1}>
              <ArrowDown size={18} aria-hidden /> Mover para depois
            </button>
            {slide.kind !== 'cover' && (
              <button type="button" className="btn btn-ghost" onClick={() => patchSlide({ hidden: !slide.hidden })}>
                {slide.hidden ? <Eye size={18} aria-hidden /> : <EyeOff size={18} aria-hidden />} {slide.hidden ? 'Mostrar este slide' : 'Ocultar este slide'}
              </button>
            )}
          </div>

          <section className="card flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="ed-title" className="font-bold">Título do slide</label>
              <input id="ed-title" className="field" value={slide.title} onChange={(e) => patchSlide({ title: e.target.value })} />
            </div>
            {slide.fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-2">
                <label htmlFor={'ed-' + f.key} className="font-bold">
                  {f.label} {f.type === 'list' && <span className="font-normal text-muted">(um tópico por linha)</span>}
                </label>
                <textarea
                  id={'ed-' + f.key}
                  className="field"
                  rows={f.type === 'list' ? Math.max(3, (f.value as string[]).length + 1) : 3}
                  value={Array.isArray(f.value) ? f.value.join('\n') : f.value}
                  onChange={(e) => patchField(f.key, f.type === 'list' ? e.target.value.split('\n') : e.target.value)}
                  onBlur={(e) => f.type === 'list' && patchField(f.key, e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))}
                />
                {f.missing && <p className="text-[14px] font-bold text-coral">Vazio: {f.missing}</p>}
              </div>
            ))}
            {slide.kind === 'references' && (
              <div className="flex flex-col gap-3">
                <p className="font-bold">Referências</p>
                {(slide.refs ?? []).map((r, k) => (
                  <div key={k} className="flex flex-col gap-1">
                    <label htmlFor={'ref-' + k} className="text-[14px] font-bold text-muted">Referência {k + 1}</label>
                    <textarea id={'ref-' + k} className="field" rows={3} value={r.text} onChange={(e) => patchSlide({ refs: (slide.refs ?? []).map((x, j) => (j === k ? { ...x, text: e.target.value } : x)) })} />
                  </div>
                ))}
                <p className="text-[14px] text-muted">Para incluir ou corrigir links e autores, editem as fontes na Etapa 4 e gerem a apresentação de novo.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
