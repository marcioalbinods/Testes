import type { ProjectForm } from '../types';

export type Errors = Record<string, string>;

const empty = (s: string) => !s.trim();

export function validateStep(step: number, f: ProjectForm): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (empty(f.school)) e.school = 'Escreva o nome da escola.';
    if (empty(f.className)) e.className = 'Escolha ou escreva a turma.';
    if (!f.period) e.period = 'Escolha o período.';
    if (!f.members.some((m) => m.name.trim())) e.members = 'Adicione pelo menos um integrante.';
  }
  if (step === 2) {
    if (empty(f.theme)) e.theme = 'Escreva o tema do TCA.';
    if (empty(f.problem)) e.problem = 'Explique o problema que vocês vão investigar.';
    if (empty(f.whyChosen)) e.whyChosen = 'Contem por que escolheram esse tema.';
    if (empty(f.whyImportant)) e.whyImportant = 'Expliquem por que o assunto é importante.';
  }
  if (step === 3) {
    if (!f.discoveries.some((d) => d.text.trim())) e.discoveries = 'Adicione pelo menos uma descoberta.';
    if (empty(f.conclusion)) e.conclusion = 'Escrevam a principal conclusão do grupo até agora.';
  }
  if (step === 4) {
    if (!f.sources.some((s) => s.site.trim() || s.title.trim())) e.sources = 'Registre pelo menos uma fonte com o nome do site, livro ou instituição.';
  }
  if (step === 5) {
    if (empty(f.intervention)) e.intervention = 'Descrevam a intervenção que o grupo propõe.';
    if (empty(f.objective)) e.objective = 'Qual é o principal objetivo da intervenção?';
    if (empty(f.audience)) e.audience = 'Quem vocês querem alcançar?';
    if (!f.media.length) e.media = 'Escolham pelo menos uma mídia.';
    if (f.media.includes('outra') && empty(f.otherMedia)) e.otherMedia = 'Escrevam qual é a outra mídia.';
  }
  return e;
}

export function pendingSteps(f: ProjectForm): { step: number; errors: string[] }[] {
  return [1, 2, 3, 4, 5]
    .map((step) => ({ step, errors: Object.values(validateStep(step, f)) }))
    .filter((p) => p.errors.length);
}
