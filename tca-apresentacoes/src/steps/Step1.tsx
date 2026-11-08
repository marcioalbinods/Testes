import { Plus, School, ShieldCheck, Sun, Sunset, Trash2, UsersRound } from 'lucide-react';
import { CLASS_OPTIONS, SCHOOL_NAME, uid } from '../data/constants';
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
        <div className="flex flex-col gap-1">
          <p className="text-[17px] font-bold">
            <span className="font-display text-brand">1.</span> Escola
          </p>
          <p className="flex min-h-[52px] items-center gap-2 rounded-[14px] bg-sunk px-4 text-[17px] font-bold" id="school">
            <School size={20} className="text-brand" aria-hidden /> {SCHOOL_NAME}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="grade" number={2} label="Ano/série" required>
            <TextInput id="grade" value={form.grade} onChange={(v) => update({ grade: v })} />
          </Field>
          <Field id="className" number={3} label="Turma" required error={errors.className} hint="Toque na turma do grupo.">
            <div className="grid grid-cols-3 gap-2" id="className">
              {CLASS_OPTIONS.map((c) => (
                <Toggle key={c} pressed={form.className === c} onClick={() => update({ className: c })} className="px-2 text-[18px]">
                  {c}
                </Toggle>
              ))}
            </div>
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
        <Field id="advisor" number={5} label="Prof. Orientador" required error={errors.advisor} hint="Professor ou professora que orienta o grupo no TCA.">
          <TextInput id="advisor" value={form.advisor} onChange={(v) => update({ advisor: v })} placeholder="Ex.: Prof.ª Ana Souza" invalid={!!errors.advisor} />
        </Field>
        <Field id="groupName" number={6} label="Nome do grupo" hint="Se o grupo tiver um nome criativo, ele aparece na capa.">
          <TextInput id="groupName" value={form.groupName} onChange={(v) => update({ groupName: v })} placeholder="Ex.: Os Investigadores" />
        </Field>
      </Section>

      <Section title="7. Integrantes do grupo" icon={UsersRound}>
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
