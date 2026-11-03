-- =====================================================================
-- Kodu Academy — permissões e Row Level Security (RLS)
-- Princípio: negar tudo e liberar apenas o mínimo necessário.
-- =====================================================================

-- RLS ligado em todas as tabelas públicas
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.student_sessions enable row level security;
alter table public.login_attempts enable row level security;
alter table public.phases enable row level security;
alter table public.quiz_keys enable row level security;
alter table public.phase_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.activity_log enable row level security;
alter table public.audit_log enable row level security;

-- O Supabase concede privilégios amplos por padrão a anon/authenticated.
-- Retiramos tudo e concedemos de volta só o necessário.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on schema private from anon, authenticated;

-- Leitura (sempre filtrada pelas políticas abaixo)
grant select on public.teachers to authenticated;
grant select on public.classes to authenticated;
grant select (id, class_id, display_name, active, started_at, last_activity_at, created_at)
  on public.students to authenticated;            -- code_hash NUNCA é legível
grant select on public.phases to authenticated;
grant select on public.phase_progress to authenticated;
grant select on public.quiz_attempts to authenticated;
grant select on public.activity_log to authenticated;
grant select on public.audit_log to authenticated;
-- quiz_keys, student_sessions e login_attempts: nenhum acesso direto.

-- Escrita direta permitida apenas para turmas (criar/editar), pelo professor dono.
grant insert (name, school_year) on public.classes to authenticated;
grant update (name, school_year, archived) on public.classes to authenticated;

-- Funções chamáveis pelo site (todas validam quem está chamando)
grant execute on function public.is_teacher() to authenticated;
grant execute on function public.current_student_id() to authenticated;
grant execute on function public.teacher_owns_class(uuid) to authenticated;
grant execute on function public.teacher_owns_student(uuid) to authenticated;
grant execute on function public.student_login(text) to authenticated;
grant execute on function public.student_me() to authenticated;
grant execute on function public.student_logout() to authenticated;
grant execute on function public.save_checklist(int, text[]) to authenticated;
grant execute on function public.set_reviewed(int, boolean) to authenticated;
grant execute on function public.save_reflection(int, text) to authenticated;
grant execute on function public.log_hint(int, int) to authenticated;
grant execute on function public.submit_quiz(int, jsonb) to authenticated;
grant execute on function public.complete_phase(int) to authenticated;
grant execute on function public.create_students(uuid, text[]) to authenticated;
grant execute on function public.reset_student_code(uuid) to authenticated;
grant execute on function public.teacher_update_student(uuid, text, boolean, uuid, text) to authenticated;
grant execute on function public.teacher_delete_student(uuid, text) to authenticated;
grant execute on function public.teacher_delete_class(uuid, text) to authenticated;
grant execute on function public.teacher_unlock_phase(uuid, int, text) to authenticated;
grant execute on function public.teacher_set_phase_status(uuid, int, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- Políticas
-- ---------------------------------------------------------------------

-- Professor vê apenas o próprio cadastro.
create policy teachers_self on public.teachers
  for select to authenticated using (id = auth.uid());

-- Turmas: professor dono vê/cria/edita; aluno vê apenas a própria turma.
create policy classes_teacher_select on public.classes
  for select to authenticated using (teacher_id = auth.uid());
create policy classes_student_select on public.classes
  for select to authenticated
  using (id = (select st.class_id from public.students st where st.id = public.current_student_id()));
create policy classes_teacher_insert on public.classes
  for insert to authenticated with check (teacher_id = auth.uid() and public.is_teacher());
create policy classes_teacher_update on public.classes
  for update to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- Alunos: professor dono da turma vê; o aluno vê somente a si mesmo.
create policy students_teacher_select on public.students
  for select to authenticated using (public.teacher_owns_class(class_id));
create policy students_self_select on public.students
  for select to authenticated using (id = public.current_student_id());

-- Conteúdo público das fases (metadados, sem gabarito).
create policy phases_read on public.phases
  for select to authenticated using (true);

-- Progresso, tentativas e atividades: o próprio aluno ou o professor da turma.
create policy progress_read on public.phase_progress
  for select to authenticated
  using (student_id = public.current_student_id() or public.teacher_owns_student(student_id));
create policy attempts_read on public.quiz_attempts
  for select to authenticated
  using (student_id = public.current_student_id() or public.teacher_owns_student(student_id));
create policy activity_read on public.activity_log
  for select to authenticated
  using (student_id = public.current_student_id() or public.teacher_owns_student(student_id));

-- Histórico administrativo: somente o professor autor.
create policy audit_read on public.audit_log
  for select to authenticated using (teacher_id = auth.uid());
