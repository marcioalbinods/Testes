import { AppError } from './types';

const MESSAGES: Record<string, string> = {
  invalid_code: 'Código não encontrado. Confira as letras e números com o seu professor.',
  too_many_attempts: 'Muitas tentativas erradas. Aguarde 15 minutos e tente de novo, ou peça ajuda ao professor.',
  teacher_account: 'Este navegador está conectado como professor. Saia da área do professor antes de entrar como aluno.',
  not_authenticated: 'Não foi possível iniciar a sessão. Recarregue a página e tente de novo.',
  not_student: 'Sua sessão terminou. Entre novamente com o seu código.',
  not_teacher: 'Esta ação é exclusiva do professor.',
  phase_locked: 'Esta fase ainda está bloqueada. Conclua a fase anterior primeiro.',
  phase_completed: 'Esta fase já foi concluída e não pode mais ser alterada.',
  quiz_cooldown: 'Você fez muitas tentativas seguidas. Revise o conteúdo da fase e tente de novo em alguns minutos.',
  reflection_too_long: 'A reflexão pode ter no máximo 2000 caracteres.',
  invalid_phase: 'Fase inválida.',
  class_not_found: 'Turma não encontrada.',
  student_not_found: 'Aluno não encontrado.',
  reason_required: 'Escreva o motivo da alteração (pelo menos 3 caracteres).',
  confirm_name_mismatch: 'O nome digitado não confere com o nome da turma.',
  invalid_name: 'Nome inválido (use de 1 a 60 caracteres).',
  invalid_name_list: 'Envie de 1 a 100 nomes por vez.',
  invalid_credentials: 'E-mail ou senha incorretos.',
  not_teacher_account: 'Esta conta não tem acesso de professor. Peça ao administrador para liberar o acesso.',
  anonymous_disabled:
    'O acesso de alunos ainda não foi habilitado no servidor (login anônimo desativado no Supabase). Avise o professor.',
  email_not_confirmed:
    'Este e-mail ainda não foi confirmado no Supabase. Em Authentication → Users, confirme o usuário (ou recrie marcando "Auto Confirm User").',
  network: 'Sem conexão com o servidor. Verifique a internet e tente de novo — nada do que você já salvou foi perdido.',
  duplicate_class: 'Já existe uma turma com esse nome.',
};

export function messageFor(code: string): string {
  return MESSAGES[code] ?? 'Algo deu errado. Tente de novo em instantes.';
}

/** Converte qualquer erro (Supabase, rede, código) em AppError com mensagem em português. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  const e = err as { message?: string; code?: string; status?: number; name?: string };
  const msg = e?.message ?? String(err);
  if (/Failed to fetch|NetworkError|network|fetch failed|Load failed/i.test(msg)) return new AppError(messageFor('network'), 'network');
  if (/Invalid login credentials/i.test(msg)) return new AppError(messageFor('invalid_credentials'), 'invalid_credentials');
  if (/Email not confirmed/i.test(msg)) return new AppError(messageFor('email_not_confirmed'), 'email_not_confirmed');
  if (/Anonymous sign-ins are disabled/i.test(msg)) return new AppError(messageFor('anonymous_disabled'), 'anonymous_disabled');
  if (e?.code === '23505') return new AppError(messageFor('duplicate_class'), 'duplicate_class');
  for (const code of Object.keys(MESSAGES)) {
    if (msg.includes(code)) return new AppError(messageFor(code), code);
  }
  return new AppError(messageFor('unknown'), 'unknown');
}
