import { Plus, ShieldCheck, Sun, Sunset, Trash2, UsersRound } from 'lucide-react';
import { CLASS_OPTIONS, uid } from '../data/constants';
import { Field, Section, StepIntro, TextInput, Toggle } from '../components/ui';
import type { StepProps } from './types';

export function Step1({ form, update, errors }: StepProps) {
  const setMember = (id: string, name: string) => update({ members: form.members.map((m) => (m.id === id ? { ...m, name } : m)) });
  const addMember = () => {
    const id = uid();
    update({ members: [...form.members, { id, name: '' }] });
    setTimeout(() => document.getElementById('member-' + id)?.focus(), 30);
  };
  const removeMember = (id: string) => update({ members: form.members.length > 1 ? form.members.filter((m) => m.id !== id) : [{ id: uid(), name: '' }] });

  return (
    <div className="flex flex-col gap-6">
      <StepIntro icon={UsersRound} step={1} title="Vamos construir a apresentação do nosso TCA?" text="Antes de começarmos, precisamos conhecer o grupo e identificar o trabalho que vocês estão desenvolvendo." />

      <div className="enter flex items-start gap-3 rounded-[22px] border border-mint/30 bg-mint/10 p-4 text-[15px]">
        <ShieldCheck className="mt-0.5 shrink-0 text-mint" size={22} aria-hidden />
        <p>
          <strong>Seus dados ficam só neste aparelho.</strong> Nada é enviado para a internet e não é preciso fazer cadastro. O preenchimento é salvo automaticamente neste navegador. Antes de limpar os dados do navegador ou trocar de dispositivo, baixem os arquivos (slides, guia ou uma cópia do trabalho).
        </p>
      </div>

      <Section>
        <Field id="school" number={1} label="Nome da escola" required error={errors.school}>
          <TextInput id="school" value={form.school} onChange={(v) => update({ school: v })} placeholder="Ex.: E.E. Professora Maria da Silva" invalid={!!errors.school} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="grade" number={2} label="Ano/série" required>
            <TextInput id="grade" value={form.grade} onChange={(v) => update({ grade: v })} />
          </Field>
          <Field id="className" number={3} label="Turma" required error={errors.className} hint="Toque em uma opção ou escreva.">
            <div className="flex flex-wrap gap-2">
              {CLASS_OPTIONS.map((c) => (
                <Toggle key={c} pressed={form.className === c} onClick={() => update({ className: c })} className="px-3">
                  {c}
                </Toggle>
              ))}
            </div>
            <TextInput id="className" value={form.className} onChange={(v) => update({ className: v })} placeholder="Ou escreva: 8º G, 8º ano 2..." invalid={!!errors.className} />
          </Field>
        </div>
        <Field id="period" number={4} label="Período" required error={errors.period}>
          <div className="grid grid-cols-2 gap-3" id="period">
            {(['Manhã', 'Tarde'] as const).map((p) => (
              <Toggle key={p} pressed={form.period === p} onClick={() => update({ period: p })} className="inline-flex min-h-[56px] items-center justify-center gap-2 text-[18px]">
                {p === 'Manhã' ? <Sun size={22} aria-hidden /> : <Sunset size={22} aria-hidden />} {p}
              </Toggle>
            ))}
          </div>
        </Field>
        <Field id="groupName" number={5} label="Nome do grupo" hint="Se o grupo tiver um nome criativo, ele aparece na capa.">
          <TextInput id="groupName" value={form.groupName} onChange={(v) => update({ groupName: v })} placeholder="Ex.: Os Investigadores" />
        </Field>
      </Section>

      <Section title="6. Integrantes do grupo" icon={UsersRound}>
        <p className="-mt-3 text-[15px] text-muted">Escrevam o nome completo de cada integrante. Não há limite de pessoas.</p>
        <ol className="flex flex-col gap-3">
          {form.members.map((m, i) => (
            <li key={m.id} className="flex items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 font-display font-extrabold text-brand">{i + 1}</span>
              <label htmlFor={'member-' + m.id} className="sr-only">
                Nome completo do integrante {i + 1}
              </label>
              <input
                id={'member-' + m.id}
                className="field min-w-0 flex-1"
                value={m.name}
                placeholder="Nome completo"
                autoComplete="off"
                onChange={(e) => setMember(m.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMember();
                  }
                }}
              />
              <button type="button" className="btn btn-danger h-12 w-12 shrink-0 p-0" onClick={() => removeMember(m.id)} aria-label={`Remover integrante ${i + 1}`}>
                <Trash2 size={20} aria-hidden />
              </button>
            </li>
          ))}
        </ol>
        {errors.members && <p className="font-bold text-danger" role="alert">{errors.members}</p>}
        <button type="button" className="btn btn-soft self-start" onClick={addMember}>
          <Plus size={20} aria-hidden /> Adicionar integrante
        </button>
      </Section>
    </div>
  );
}
