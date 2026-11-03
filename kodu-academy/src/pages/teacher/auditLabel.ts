const LABELS: Record<string, string> = {
  create_student: 'Aluno cadastrado',
  reset_code: 'Novo código gerado',
  update_student: 'Cadastro do aluno alterado',
  delete_student: 'Aluno excluído',
  delete_class: 'Turma excluída',
  unlock_phase: 'Fase liberada manualmente',
  'set_status:completed': 'Fase marcada como concluída',
  'set_status:in_progress': 'Fase reaberta',
  'set_status:reset': 'Progresso da fase zerado',
};
export const auditLabel = (action: string) => LABELS[action] ?? action;
