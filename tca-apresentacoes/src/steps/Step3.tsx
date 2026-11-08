import { useState } from 'react';
import { ChartColumnBig, Check, Lightbulb, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { uid } from '../data/constants';
import { Badge, Field, Section, StepIntro, TextArea } from '../components/ui';
import { DUP_THRESHOLD, similarity } from '../engine/text';
import type { DataPoint } from '../types';
import type { StepProps } from './types';

const UNITS = ['%', 'pessoas', 'casos', 'toneladas', 'reais', 'anos', ''];

export function Step3({ form, update, errors }: StepProps) {
  const [draft, setDraft] = useState('');
  const [similarTo, setSimilarTo] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const findSimilar = (text: string, skipId?: string) => form.discoveries.findIndex((d) => d.id !== skipId && similarity(d.text, text) >= DUP_THRESHOLD);

  const add = (force = false) => {
    const t = draft.trim();
    if (!t) return;
    const s = findSimilar(t);
    if (s >= 0 && !force) {
      setSimilarTo(s);
      return;
    }
    update({ discoveries: [...form.discoveries, { id: uid(), text: t }] });
    setDraft('');
    setSimilarTo(null);
    document.getElementById('discovery-draft')?.focus();
  };

  const saveEdit = () => {
    if (!editing) return;
    update({ discoveries: form.discoveries.map((d) => (d.id === editing ? { ...d, text: editText } : d)).filter((d) => d.text.trim()) });
    setEditing(null);
  };

  const setPoint = (id: string, patch: Partial<DataPoint>) => update({ dataPoints: form.dataPoints.map((d) => (d.id === id ? { ...d, ...patch } : d)) });

  return (
    <div className="flex flex-col gap-6">
      <StepIntro icon={Search} step={3} color="coral" title="Hora de compartilhar nossas descobertas!" text="Agora é o momento de organizar o que vocês descobriram durante as pesquisas. Pensem nas informações mais importantes e nas descobertas que ajudam a compreender o problema." />

      <Section title="1. O que vocês descobriram sobre o tema?" icon={Lightbulb}>
        <p className="-mt-3 text-[15px] text-muted">
          Escrevam <strong>uma descoberta por vez</strong> e toquem em “Adicionar descoberta”. Frases curtas funcionam melhor. O site organiza tudo em tópicos e avisa quando duas descobertas parecem repetidas.
        </p>
        {form.discoveries.length > 0 && (
          <ol className="flex flex-col gap-3">
            {form.discoveries.map((d, i) => {
              const dup = form.discoveries.findIndex((o, j) => j < i && similarity(o.text, d.text) >= DUP_THRESHOLD);
              return (
                <li key={d.id} className="enter rounded-[18px] border-2 border-line bg-surface p-4">
                  {editing === d.id ? (
                    <div className="flex flex-col gap-3">
                      <label htmlFor={'edit-' + d.id} className="sr-only">
                        Editar descoberta {i + 1}
                      </label>
                      <textarea id={'edit-' + d.id} className="field" rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn btn-primary" onClick={saveEdit}>
                          <Check size={18} aria-hidden /> Salvar
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                          <X size={18} aria-hidden /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/10 font-display font-extrabold text-coral">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap break-words">{d.text}</p>
                        {dup >= 0 && (
                          <p className="mt-1">
                            <Badge tone="coral">Parecida com a descoberta {dup + 1}: nos slides elas viram um tópico só</Badge>
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" className="btn btn-ghost h-11 w-11 p-0" aria-label={`Editar descoberta ${i + 1}`} onClick={() => { setEditing(d.id); setEditText(d.text); }}>
                          <Pencil size={18} aria-hidden />
                        </button>
                        <button type="button" className="btn btn-danger h-11 w-11 p-0" aria-label={`Excluir descoberta ${i + 1}`} onClick={() => update({ discoveries: form.discoveries.filter((x) => x.id !== d.id) })}>
                          <Trash2 size={18} aria-hidden />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <div className="flex flex-col gap-3 rounded-[18px] bg-sunk p-4">
          <label htmlFor="discovery-draft" className="font-bold">
            Nova descoberta {form.discoveries.length ? `(nº ${form.discoveries.length + 1})` : ''}
          </label>
          <textarea id="discovery-draft" className="field" rows={3} value={draft} placeholder="Ex.: Segundo o IBGE, só 3% do lixo eletrônico do Brasil é reciclado." onChange={(e) => { setDraft(e.target.value); setSimilarTo(null); }} aria-invalid={!!errors.discoveries || undefined} />
          {similarTo !== null && (
            <div className="enter rounded-2xl border-2 border-coral/40 bg-surface p-3 text-[15px]" role="alert">
              <p>
                Essa descoberta parece repetir a <strong>descoberta {similarTo + 1}</strong>: “{form.discoveries[similarTo]?.text.slice(0, 120)}”. Quer adicionar mesmo assim?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="btn btn-soft" onClick={() => add(true)}>Adicionar mesmo assim</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setSimilarTo(null); setEditing(form.discoveries[similarTo].id); setEditText(form.discoveries[similarTo].text + ' ' + draft); setDraft(''); }}>
                  Juntar com a descoberta {similarTo + 1}
                </button>
              </div>
            </div>
          )}
          <button type="button" className="btn btn-primary self-start" onClick={() => add()} disabled={!draft.trim()}>
            <Plus size={20} aria-hidden /> Adicionar descoberta
          </button>
        </div>
        {errors.discoveries && <p className="font-bold text-danger" role="alert">{errors.discoveries}</p>}
      </Section>

      <Section>
        <Field id="causes" number={2} label="Quais são as principais causas do problema?" help={['Por que o problema acontece?', 'Separem as causas com vírgulas ou escrevam uma por linha.']}>
          <TextArea id="causes" value={form.causes} onChange={(v) => update({ causes: v })} placeholder="Ex.: Falta de pontos de coleta, falta de informação, consumo exagerado de eletrônicos." />
        </Field>
        <Field id="consequences" number={3} label="Quais são as consequências desse problema?" help={['O que esse problema provoca nas pessoas, no ambiente ou na cidade?']}>
          <TextArea id="consequences" value={form.consequences} onChange={(v) => update({ consequences: v })} placeholder="Ex.: Contaminação do solo e da água, doenças, desperdício de materiais que poderiam ser reaproveitados." />
        </Field>
      </Section>

      <Section title="4. Dados, estatísticas e pesquisas" icon={ChartColumnBig}>
        <p className="-mt-3 text-[15px] text-muted">Existem números que ajudam a compreender a situação? Registrem só dados que encontraram em fontes. Com dois números ou mais, o site cria um gráfico.</p>
        <Field id="dataText" label="Escrevam os dados ou pesquisas que encontraram">
          <TextArea id="dataText" rows={3} value={form.dataText} onChange={(v) => update({ dataText: v })} placeholder="Ex.: Uma pesquisa da ONU de 2024 mostrou que o mundo produziu 62 milhões de toneladas de lixo eletrônico." />
        </Field>
        <div className="flex flex-col gap-3">
          <p className="font-bold">Números para o gráfico</p>
          {form.dataPoints.map((d, i) => (
            <div key={d.id} className="enter grid gap-3 rounded-[18px] border-2 border-line p-4 sm:grid-cols-[110px_130px_1fr]">
              <div>
                <label className="text-[14px] font-bold text-muted" htmlFor={'dv-' + d.id}>Valor</label>
                <input id={'dv-' + d.id} className="field" inputMode="decimal" value={d.value} placeholder="Ex.: 45" onChange={(e) => setPoint(d.id, { value: e.target.value })} />
              </div>
              <div>
                <label className="text-[14px] font-bold text-muted" htmlFor={'du-' + d.id}>Unidade</label>
                <input id={'du-' + d.id} className="field" list="units" value={d.unit} placeholder="%" onChange={(e) => setPoint(d.id, { unit: e.target.value })} />
              </div>
              <div>
                <label className="text-[14px] font-bold text-muted" htmlFor={'dl-' + d.id}>O que esse número mostra?</label>
                <input id={'dl-' + d.id} className="field" value={d.label} placeholder="Ex.: dos jovens já usaram celular até de madrugada" onChange={(e) => setPoint(d.id, { label: e.target.value })} />
              </div>
              <div className="sm:col-span-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label className="text-[14px] font-bold text-muted" htmlFor={'do-' + d.id}>Onde encontraram esse dado?</label>
                  <input id={'do-' + d.id} className="field" value={d.origin} placeholder="Ex.: Pesquisa TIC Kids Online 2023" onChange={(e) => setPoint(d.id, { origin: e.target.value })} />
                </div>
                <button type="button" className="btn btn-danger" onClick={() => update({ dataPoints: form.dataPoints.filter((x) => x.id !== d.id) })} aria-label={`Remover número ${i + 1}`}>
                  <Trash2 size={18} aria-hidden /> Remover
                </button>
              </div>
            </div>
          ))}
          <datalist id="units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
          <button type="button" className="btn btn-soft self-start" onClick={() => update({ dataPoints: [...form.dataPoints, { id: uid(), value: '', unit: '%', label: '', origin: '' }] })}>
            <Plus size={20} aria-hidden /> Adicionar número
          </button>
        </div>
      </Section>

      <Section>
        <Field id="surprising" number={5} label="Quais informações vocês consideram mais surpreendentes ou importantes?">
          <TextArea id="surprising" value={form.surprising} onChange={(v) => update({ surprising: v })} placeholder="Ex.: Ficamos surpresos ao saber que um celular tem ouro e prata dentro." />
        </Field>
        <Field id="learned" number={6} label="O que vocês aprenderam durante a pesquisa que não sabiam antes?">
          <TextArea id="learned" value={form.learned} onChange={(v) => update({ learned: v })} placeholder="Ex.: Aprendemos que existem leis sobre o descarte de eletrônicos." />
        </Field>
        <Field id="conclusion" number={7} label="Qual é a principal conclusão a que o grupo chegou até agora?" required error={errors.conclusion} help={['Depois de tudo o que pesquisaram, o que vocês pensam sobre o problema?', 'Lembrem: se for uma opinião ou hipótese, escrevam “acreditamos que…”.']}>
          <TextArea id="conclusion" value={form.conclusion} onChange={(v) => update({ conclusion: v })} invalid={!!errors.conclusion} placeholder="Ex.: Concluímos que o problema não é só falta de lixeiras, mas falta de informação." />
        </Field>
      </Section>
    </div>
  );
}
