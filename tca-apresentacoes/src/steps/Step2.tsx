import { MapPin, Telescope } from 'lucide-react';
import { SCOPE_OPTIONS } from '../data/constants';
import { Field, Section, StepIntro, TextArea, TextInput, Toggle } from '../components/ui';
import type { StepProps } from './types';

export function Step2({ form, update, errors }: StepProps) {
  const toggleScope = (s: string) => update({ whereScope: form.whereScope.includes(s) ? form.whereScope.filter((x) => x !== s) : [...form.whereScope, s] });
  return (
    <div className="flex flex-col gap-6">
      <StepIntro icon={Telescope} step={2} color="violet" title="Sobre o que estamos pesquisando?" text="Agora vamos apresentar o tema escolhido pelo grupo e explicar por que ele merece nossa atenção." />
      <Section>
        <Field id="theme" number={1} label="Qual é o tema do TCA?" required error={errors.theme} hint="Uma frase curta, como o título de um assunto.">
          <TextInput id="theme" value={form.theme} onChange={(v) => update({ theme: v })} placeholder="Ex.: O descarte de lixo eletrônico no nosso bairro" invalid={!!errors.theme} />
        </Field>
        <Field id="workTitle" label="Título criativo do trabalho" hint="Se quiserem, criem um título chamativo para a capa. Se ficar vazio, usamos o tema.">
          <TextInput id="workTitle" value={form.workTitle} onChange={(v) => update({ workTitle: v })} placeholder="Ex.: Lixo que não some: o caminho do nosso celular velho" />
        </Field>
        <Field
          id="problem"
          number={2}
          label="Qual problema ou situação vocês pretendem investigar?"
          required
          error={errors.problem}
          help={['O que está errado ou preocupa vocês nesse tema?', 'Tente escrever como uma pergunta: “Por que…?”, “Como…?”, “O que acontece quando…?”', 'Um bom problema é específico: fala de um lugar, de um grupo de pessoas ou de uma situação.']}
        >
          <TextArea id="problem" value={form.problem} onChange={(v) => update({ problem: v })} invalid={!!errors.problem} placeholder="Ex.: Muitas famílias do bairro jogam pilhas e celulares velhos no lixo comum, porque não sabem onde descartar." />
        </Field>
        <Field id="whyChosen" number={3} label="Por que vocês escolheram esse tema?" required error={errors.whyChosen} help={['Alguém do grupo viveu ou viu essa situação?', 'O tema apareceu em alguma notícia ou aula?', 'O que deixou vocês curiosos?']}>
          <TextArea id="whyChosen" value={form.whyChosen} onChange={(v) => update({ whyChosen: v })} invalid={!!errors.whyChosen} placeholder="Ex.: Percebemos que na nossa rua sempre tem lixo eletrônico jogado na calçada." />
        </Field>
        <Field id="whyImportant" number={4} label="Por que esse assunto é importante para a sociedade?" required error={errors.whyImportant} help={['O que acontece com as pessoas, com o ambiente ou com a cidade se nada mudar?', 'Esse problema afeta muita gente?']}>
          <TextArea id="whyImportant" value={form.whyImportant} onChange={(v) => update({ whyImportant: v })} invalid={!!errors.whyImportant} placeholder="Ex.: O lixo eletrônico tem metais pesados que contaminam o solo e a água." />
        </Field>
        <Field id="affected" number={5} label="Quem são as pessoas ou grupos mais afetados por esse problema?" help={['Pensem em idade, lugar onde vivem, profissão, condição social…', 'Separem os grupos com vírgulas.']}>
          <TextArea id="affected" rows={3} minWords={6} value={form.affected} onChange={(v) => update({ affected: v })} placeholder="Ex.: Catadores de recicláveis, moradores perto de lixões, crianças." />
        </Field>
      </Section>
      <Section title="6. Onde esse problema acontece?" icon={MapPin}>
        <p className="-mt-3 text-[15px] text-muted">Podem marcar mais de uma opção.</p>
        <div className="flex flex-wrap gap-2">
          {SCOPE_OPTIONS.map((s) => (
            <Toggle key={s} pressed={form.whereScope.includes(s)} onClick={() => toggleScope(s)}>
              {s}
            </Toggle>
          ))}
        </div>
        <Field id="whereDetail" label="Quer explicar melhor onde acontece?">
          <TextArea id="whereDetail" rows={2} minWords={6} value={form.whereDetail} onChange={(v) => update({ whereDetail: v })} placeholder="Ex.: Principalmente nas ruas perto da feira e no terreno atrás da escola." />
        </Field>
      </Section>
    </div>
  );
}
