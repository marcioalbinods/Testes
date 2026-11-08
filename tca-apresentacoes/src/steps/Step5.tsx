import { Check, HandHeart, Megaphone } from 'lucide-react';
import { MEDIA_OPTIONS } from '../data/constants';
import { Field, Section, StepIntro, TextArea, TextInput } from '../components/ui';
import { mediaIcon } from '../render/icons';
import type { MediaId } from '../types';
import type { StepProps } from './types';

export function Step5({ form, update, errors }: StepProps) {
  const toggle = (id: MediaId) => update({ media: form.media.includes(id) ? form.media.filter((m) => m !== id) : [...form.media, id] });
  const n = form.media.length;
  const ela = n > 1 ? 'essas mídias' : 'essa mídia';
  return (
    <div className="flex flex-col gap-6">
      <StepIntro
        icon={HandHeart}
        step={5}
        color="violet"
        title="Como podemos contribuir para transformar essa realidade?"
        text="Pesquisar é importante, mas também precisamos pensar no que podemos fazer diante do problema que investigamos. Que ações poderiam ajudar a conscientizar as pessoas ou contribuir para solucionar, diminuir ou enfrentar esse problema?"
      />
      <div className="enter rounded-[22px] bg-violet/10 p-4 text-[15px] font-bold text-violet">Esta é uma das etapas mais importantes do projeto. Pensem juntos e com calma!</div>

      <Section>
        <Field id="change" number={1} label="O que vocês gostariam de mudar ou melhorar em relação ao problema pesquisado?">
          <TextArea id="change" value={form.change} onChange={(v) => update({ change: v })} placeholder="Ex.: Queremos que os moradores saibam onde descartar eletrônicos." />
        </Field>
        <Field id="intervention" number={2} label="Qual intervenção o grupo propõe?" required error={errors.intervention} help={['Que ação o grupo pode realmente fazer na escola ou na comunidade?', 'Descrevam a ação em uma ou duas frases.']}>
          <TextArea id="intervention" value={form.intervention} onChange={(v) => update({ intervention: v })} invalid={!!errors.intervention} placeholder="Ex.: Uma campanha na escola com cartazes e um ponto de coleta de pilhas e celulares velhos." />
        </Field>
        <Field id="objective" number={3} label="Qual é o principal objetivo dessa intervenção?" required error={errors.objective}>
          <TextArea id="objective" rows={3} minWords={8} value={form.objective} onChange={(v) => update({ objective: v })} invalid={!!errors.objective} placeholder="Ex.: Conscientizar as famílias sobre o descarte correto." />
        </Field>
        <Field id="audience" number={4} label="Quem vocês desejam alcançar com essa ação?" required error={errors.audience}>
          <TextInput id="audience" value={form.audience} onChange={(v) => update({ audience: v })} invalid={!!errors.audience} placeholder="Ex.: Estudantes da escola e suas famílias" />
        </Field>
        <Field id="how" number={5} label="Como pretendem realizar essa intervenção?" hint="Escrevam as etapas na ordem em que vão acontecer (uma por linha)." help={['Primeiro… Depois… Por fim…', 'Quem faz cada parte? Quando?']}>
          <TextArea id="how" rows={5} value={form.how} onChange={(v) => update({ how: v })} placeholder={'Ex.:\nPesquisar os pontos de coleta da cidade\nCriar os cartazes\nInstalar a caixa de coleta na entrada da escola'} />
        </Field>
        <Field id="resources" number={6} label="Quais recursos seriam necessários?" hint="Separem com vírgulas.">
          <TextArea id="resources" rows={2} minWords={4} value={form.resources} onChange={(v) => update({ resources: v })} placeholder="Ex.: Cartolinas, caixa de papelão, celular para fotos, autorização da direção" />
        </Field>
        <Field id="results" number={7} label="Que resultados vocês esperam alcançar?">
          <TextArea id="results" rows={3} value={form.results} onChange={(v) => update({ results: v })} placeholder="Ex.: Recolher pelo menos 100 pilhas e ensinar as famílias a descartar corretamente." />
        </Field>
      </Section>

      <Section title="Pensando nas diferentes mídias" icon={Megaphone}>
        <p className="-mt-3 text-[15px] text-muted">Escolham uma ou mais formas de levar a mensagem ao público. Uma intervenção pode combinar várias mídias.</p>
        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Mídias da intervenção">
          {MEDIA_OPTIONS.map((m) => {
            const Icon = mediaIcon(m.icon);
            const on = form.media.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(m.id)}
                className={`relative flex min-h-[92px] items-start gap-3 rounded-[18px] border-2 p-4 text-left transition-all ${on ? 'border-brand bg-brand/10 shadow-[0_8px_24px_-16px_rgb(var(--brand))]' : 'border-line bg-surface hover:border-brand/50'}`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${on ? 'bg-brand text-brand-ink' : 'bg-sunk text-brand'}`}>
                  <Icon size={22} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{m.name}</span>
                  <span className="block text-[14px] leading-snug text-muted">{m.examples}</span>
                </span>
                {on && <Check className="absolute right-3 top-3 text-brand" size={20} aria-hidden />}
              </button>
            );
          })}
        </div>
        {errors.media && <p className="font-bold text-danger" role="alert">{errors.media}</p>}
        {form.media.includes('outra') && (
          <Field id="otherMedia" label="Qual outra mídia ou ação?" required error={errors.otherMedia}>
            <TextInput id="otherMedia" value={form.otherMedia} onChange={(v) => update({ otherMedia: v })} invalid={!!errors.otherMedia} placeholder="Ex.: Aplicativo, horta comunitária, música…" />
          </Field>
        )}
      </Section>

      {n > 0 && (
        <Section title={`Sobre ${ela}`} icon={Megaphone}>
          <Field id="mediaWhy" number={1} label={`Por que ${ela} ${n > 1 ? 'são adequadas' : 'é adequada'} para abordar o problema?`}>
            <TextArea id="mediaWhy" rows={3} value={form.mediaWhy} onChange={(v) => update({ mediaWhy: v })} placeholder="Ex.: Os estudantes passam muito tempo nas redes sociais e prestam atenção em vídeos curtos." />
          </Field>
          <Field id="mediaHow" number={2} label={`Como ${n > 1 ? 'elas serão utilizadas' : 'ela será utilizada'}?`}>
            <TextArea id="mediaHow" rows={3} value={form.mediaHow} onChange={(v) => update({ mediaHow: v })} placeholder="Ex.: Vamos colar os cartazes nos corredores e postar vídeos de 1 minuto no perfil da escola." />
          </Field>
          <Field id="mediaMessage" number={3} label="Qual mensagem queremos transmitir ao público?">
            <TextArea id="mediaMessage" rows={2} minWords={6} value={form.mediaMessage} onChange={(v) => update({ mediaMessage: v })} placeholder="Ex.: Lixo eletrônico não é lixo comum: descarte no lugar certo!" />
          </Field>
          <Field id="mediaResult" number={4} label="Que resultado esperamos alcançar?">
            <TextArea id="mediaResult" rows={2} minWords={6} value={form.mediaResult} onChange={(v) => update({ mediaResult: v })} placeholder="Ex.: Que mais famílias tragam seus eletrônicos para o ponto de coleta." />
          </Field>
        </Section>
      )}
    </div>
  );
}
