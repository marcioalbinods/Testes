import { useEffect } from 'react';
import { BookMarked, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { uid } from '../data/constants';
import { Badge, Section, StepIntro } from '../components/ui';
import { normalizeLink, reliability, RELIABILITY_LABEL } from '../engine/references';
import type { Source } from '../types';
import type { StepProps } from './types';

const PRIORITY = ['Sites de instituições públicas (.gov.br)', 'Universidades (.edu.br, USP, Fiocruz…)', 'Organizações reconhecidas (UNICEF, WWF…)', 'Artigos científicos e pesquisas', 'Organizações internacionais (ONU, OMS…)', 'Veículos jornalísticos confiáveis'];

const newSource = (): Source => ({ id: uid(), site: '', title: '', link: '', author: '', accessDate: '', found: '' });

export function Step4({ form, update, errors }: StepProps) {
  const set = (id: string, patch: Partial<Source>) => update({ sources: form.sources.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const add = () => {
    const s = newSource();
    update({ sources: [...form.sources, s] });
    setTimeout(() => document.getElementById('src-site-' + s.id)?.focus(), 30);
  };
  useEffect(() => {
    if (!form.sources.length) update({ sources: [newSource()] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sources = form.sources;

  return (
    <div className="flex flex-col gap-6">
      <StepIntro icon={BookMarked} step={4} color="mint" title="De onde vieram nossas informações?" text="Uma boa pesquisa precisa apresentar fontes confiáveis. Vamos registrar os materiais e sites que consultamos." />

      <div className="card enter grid gap-4 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <ShieldCheck className="text-mint" size={30} aria-hidden />
        <div>
          <h2 className="font-display text-[20px] font-extrabold">Deem preferência a:</h2>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-2">
            {PRIORITY.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-mint" aria-hidden>✓</span> {p}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[15px] text-muted">
            Escrevam só o que vocês realmente consultaram. Se não souberem o autor ou o link, deixem em branco: a referência aparece com um aviso “conferir”. Nunca inventem dados de uma fonte.
          </p>
        </div>
      </div>

      {sources.map((s, i) => {
        const rel = s.site || s.link ? reliability(s) : null;
        const badLink = s.link.trim() && !normalizeLink(s.link).ok;
        return (
          <Section key={s.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-[22px] font-extrabold">Fonte {i + 1}</h2>
              <button type="button" className="btn btn-danger" onClick={() => update({ sources: form.sources.filter((x) => x.id !== s.id) })}>
                <Trash2 size={18} aria-hidden /> Excluir fonte
              </button>
            </div>
            {rel && <Badge tone={rel === 'institucional' ? 'mint' : rel === 'jornalistico' ? 'brand' : rel === 'atencao' ? 'coral' : 'muted'}>{RELIABILITY_LABEL[rel]}</Badge>}
            <div className="grid gap-5 sm:grid-cols-2">
              <SrcField id={'src-site-' + s.id} n={1} label="Nome do site, instituição, livro ou publicação" value={s.site} onChange={(v) => set(s.id, { site: v })} placeholder="Ex.: IBGE, Agência Brasil, livro “…”" />
              <SrcField id={'src-title-' + s.id} n={2} label="Título da matéria, artigo ou material" value={s.title} onChange={(v) => set(s.id, { title: v })} placeholder="Ex.: Brasil gera 2,4 milhões de toneladas de lixo eletrônico" />
              <SrcField id={'src-link-' + s.id} n={3} label="Link ou endereço eletrônico (se houver)" value={s.link} onChange={(v) => set(s.id, { link: v })} placeholder="https://…" type="url" error={badLink ? 'Confira o link: copie o endereço completo do navegador.' : undefined} />
              <SrcField id={'src-author-' + s.id} n={4} label="Autor ou instituição responsável (se souber)" value={s.author} onChange={(v) => set(s.id, { author: v })} placeholder="Ex.: Fundação Oswaldo Cruz" />
              <SrcField id={'src-date-' + s.id} label="Quando vocês acessaram? (se lembrarem)" value={s.accessDate} onChange={(v) => set(s.id, { accessDate: v })} placeholder="Ex.: 10 out. 2026" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={'src-found-' + s.id} className="font-bold">
                <span className="font-display text-brand">5.</span> O que encontramos nessa fonte?
              </label>
              <textarea id={'src-found-' + s.id} className="field" rows={3} value={s.found} onChange={(e) => set(s.id, { found: e.target.value })} placeholder="Ex.: Dados sobre a quantidade de lixo eletrônico e onde descartar." />
            </div>
          </Section>
        );
      })}

      {errors.sources && <p className="font-bold text-danger" role="alert">{errors.sources}</p>}
      <button type="button" className="btn btn-primary self-start" onClick={add}>
        <Plus size={20} aria-hidden /> {form.sources.length ? 'Adicionar outra fonte' : 'Adicionar fonte'}
      </button>
    </div>
  );
}

function SrcField({ id, n, label, value, onChange, placeholder, type = 'text', error }: { id: string; n?: number; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="font-bold leading-snug">
        {n && <span className="font-display text-brand">{n}. </span>}
        {label}
      </label>
      <input id={id} className="field" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} autoComplete="off" aria-invalid={!!error || undefined} />
      {error && <p className="text-[14px] font-bold text-coral">{error}</p>}
    </div>
  );
}
