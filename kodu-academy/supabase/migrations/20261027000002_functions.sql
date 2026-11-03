-- =====================================================================
-- Kodu Academy — funções do servidor
-- Toda escrita de alunos passa por estas funções, que validam as regras
-- de progressão. Os clientes NÃO têm permissão de INSERT/UPDATE diretos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funções auxiliares de identidade (usadas nas políticas RLS)
-- ---------------------------------------------------------------------
create or replace function public.is_teacher()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.teachers where id = auth.uid());
$$;

create or replace function public.current_student_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select s.student_id
  from public.student_sessions s
  join public.students st on st.id = s.student_id
  where s.auth_user_id = auth.uid() and st.active;
$$;

create or replace function public.teacher_owns_class(p_class uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.classes c where c.id = p_class and c.teacher_id = auth.uid());
$$;

create or replace function public.teacher_owns_student(p_student uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.students st
    join public.classes c on c.id = st.class_id
    where st.id = p_student and c.teacher_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- Códigos de acesso
-- ---------------------------------------------------------------------
create or replace function private.normalize_code(p text)
returns text
language sql immutable
as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function private.hash_code(p text)
returns text
language sql stable security definer
set search_path = private, extensions
as $$
  select encode(
    extensions.hmac(private.normalize_code(p), (select value from private.settings where key = 'code_pepper'), 'sha256'),
    'hex'
  );
$$;

-- Gera um código como "K7MP-4XQA" (sem letras/números ambíguos: I, L, O, 0, 1).
create or replace function private.generate_code()
returns text
language plpgsql volatile
set search_path = private, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  n constant int := 31;
  result text := '';
  b int;
begin
  while char_length(result) < 8 loop
    b := get_byte(extensions.gen_random_bytes(1), 0);
    if b < 248 then -- 248 = 31 * 8: evita viés de módulo
      result := result || substr(alphabet, (b % n) + 1, 1);
    end if;
  end loop;
  return substr(result, 1, 4) || '-' || substr(result, 5, 4);
end;
$$;

create or replace function private.new_unique_code(out code text, out code_hash text)
language plpgsql volatile
set search_path = public, private
as $$
begin
  loop
    code := private.generate_code();
    code_hash := private.hash_code(code);
    exit when not exists (select 1 from public.students s where s.code_hash = new_unique_code.code_hash);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Regras de progressão (espelhadas em src/lib/progression.ts)
-- ---------------------------------------------------------------------
create or replace function private.phase_unlocked(p_student uuid, p_phase int)
returns boolean
language sql stable
set search_path = public
as $$
  select p_phase = 1
    or exists (select 1 from public.phase_progress
               where student_id = p_student and phase_id = p_phase - 1 and status = 'completed')
    or exists (select 1 from public.phase_progress
               where student_id = p_student and phase_id = p_phase and (manually_unlocked or status = 'completed'));
$$;

create or replace function private.require_student()
returns uuid
language plpgsql stable
set search_path = public
as $$
declare
  v uuid := public.current_student_id();
begin
  if v is null then
    raise exception 'not_student' using errcode = '42501', hint = 'Entre novamente com o seu código.';
  end if;
  return v;
end;
$$;

create or replace function private.require_teacher()
returns uuid
language plpgsql stable
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_teacher() then
    raise exception 'not_teacher' using errcode = '42501';
  end if;
  return auth.uid();
end;
$$;

-- Garante que a linha de progresso existe e que a fase está liberada.
create or replace function private.open_phase(p_student uuid, p_phase int)
returns public.phase_progress
language plpgsql volatile
set search_path = public, private
as $$
declare
  r public.phase_progress;
begin
  if not exists (select 1 from public.phases where id = p_phase) then
    raise exception 'invalid_phase' using errcode = '22023';
  end if;
  if not private.phase_unlocked(p_student, p_phase) then
    raise exception 'phase_locked' using errcode = '42501';
  end if;
  insert into public.phase_progress (student_id, phase_id)
  values (p_student, p_phase)
  on conflict (student_id, phase_id) do nothing;
  select * into r from public.phase_progress where student_id = p_student and phase_id = p_phase for update;
  update public.students set last_activity_at = now() where id = p_student;
  return r;
end;
$$;

create or replace function private.progress_json(r public.phase_progress)
returns json
language sql stable
as $$
  select json_build_object(
    'phase_id', r.phase_id, 'status', r.status, 'checklist', r.checklist,
    'reviewed', r.reviewed, 'reflection', r.reflection, 'quiz_passed', r.quiz_passed,
    'quiz_best_score', r.quiz_best_score, 'quiz_attempts', r.quiz_attempts,
    'hints_viewed', r.hints_viewed, 'manually_unlocked', r.manually_unlocked,
    'completed_by_teacher', r.completed_by_teacher, 'started_at', r.started_at,
    'completed_at', r.completed_at, 'updated_at', r.updated_at
  );
$$;

-- ---------------------------------------------------------------------
-- ALUNO: entrar, sair e consultar o próprio perfil
-- ---------------------------------------------------------------------
create or replace function public.student_login(p_code text)
returns json
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_uid uuid := auth.uid();
  v_recent_fail int;
  v_global_fail int;
  v_student public.students;
  v_class public.classes;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  if public.is_teacher() then
    return json_build_object('ok', false, 'error', 'teacher_account');
  end if;

  select count(*) into v_recent_fail from public.login_attempts
   where auth_user_id = v_uid and not success and created_at > now() - interval '15 minutes';
  select count(*) into v_global_fail from public.login_attempts
   where not success and created_at > now() - interval '1 minute';
  if v_recent_fail >= 8 or v_global_fail >= 300 then
    return json_build_object('ok', false, 'error', 'too_many_attempts');
  end if;

  select * into v_student from public.students where code_hash = private.hash_code(p_code);
  if not found or not v_student.active or char_length(private.normalize_code(p_code)) <> 8 then
    insert into public.login_attempts (auth_user_id, success) values (v_uid, false);
    return json_build_object('ok', false, 'error', 'invalid_code');
  end if;

  insert into public.login_attempts (auth_user_id, success) values (v_uid, true);
  delete from public.login_attempts where created_at < now() - interval '2 days';

  insert into public.student_sessions (auth_user_id, student_id)
  values (v_uid, v_student.id)
  on conflict (auth_user_id) do update set student_id = excluded.student_id, last_seen_at = now();

  update public.students
     set started_at = coalesce(started_at, now()), last_activity_at = now()
   where id = v_student.id
   returning * into v_student;

  insert into public.activity_log (student_id, kind) values (v_student.id, 'login');

  select * into v_class from public.classes where id = v_student.class_id;
  return json_build_object('ok', true, 'student', json_build_object(
    'id', v_student.id, 'display_name', v_student.display_name,
    'class_id', v_class.id, 'class_name', v_class.name, 'started_at', v_student.started_at));
end;
$$;

create or replace function public.student_me()
returns json
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_id uuid := public.current_student_id();
  r record;
begin
  if v_id is null then
    return null;
  end if;
  select st.id, st.display_name, st.started_at, c.id as class_id, c.name as class_name
    into r
    from public.students st join public.classes c on c.id = st.class_id
   where st.id = v_id;
  return json_build_object('id', r.id, 'display_name', r.display_name, 'class_id', r.class_id,
                           'class_name', r.class_name, 'started_at', r.started_at);
end;
$$;

create or replace function public.student_logout()
returns void
language sql volatile security definer
set search_path = public
as $$
  delete from public.student_sessions where auth_user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- ALUNO: registrar progresso
-- ---------------------------------------------------------------------
create or replace function public.save_checklist(p_phase int, p_items text[])
returns json
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_student uuid := private.require_student();
  r public.phase_progress;
  v_valid text[];
  v_allowed text[];
begin
  r := private.open_phase(v_student, p_phase);
  if r.status = 'completed' then
    raise exception 'phase_completed' using errcode = '42501';
  end if;
  select checklist_ids into v_allowed from public.phases where id = p_phase;
  select coalesce(array_agg(distinct i order by i), '{}') into v_valid
    from unnest(coalesce(p_items, '{}')) as i
   where i = any (v_allowed);
  update public.phase_progress
     set checklist = v_valid, updated_at = now()
   where student_id = v_student and phase_id = p_phase
   returning * into r;
  return private.progress_json(r);
end;
$$;

create or replace function public.set_reviewed(p_phase int, p_value boolean)
returns json
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_student uuid := private.require_student();
  r public.phase_progress;
begin
  r := private.open_phase(v_student, p_phase);
  if r.status = 'completed' then
    return private.progress_json(r);
  end if;
  update public.phase_progress set reviewed = coalesce(p_value, false), updated_at = now()
   where student_id = v_student and phase_id = p_phase returning * into r;
  return private.progress_json(r);
end;
$$;

create or replace function public.save_reflection(p_phase int, p_text text)
returns json
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_student uuid := private.require_student();
  r public.phase_progress;
begin
  if char_length(coalesce(p_text, '')) > 2000 then
    raise exception 'reflection_too_long' using errcode = '22001';
  end if;
  r := private.open_phase(v_student, p_phase);
  if r.status = 'completed' then
    raise exception 'phase_completed' using errcode = '42501';
  end if;
  update public.phase_progress set reflection = btrim(coalesce(p_text, '')), updated_at = now()
   where student_id = v_student and phase_id = p_phase returning * into r;
  return private.progress_json(r);
end;
$$;

create or replace function public.log_hint(p_phase int, p_level int)
returns json
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_student uuid := private.require_student();
  r public.phase_progress;
begin
  if p_level not between 1 and 3 then
    raise exception 'invalid_hint_level' using errcode = '22023';
  end if;
  r := private.open_phase(v_student, p_phase);
  if p_level > r.hints_viewed then
    update public.phase_progress set hints_viewed = p_level, updated_at = now()
     where student_id = v_student and phase_id = p_phase returning * into r;
    insert into public.activity_log (student_id, phase_id, kind, detail)
    values (v_student, p_phase, 'hint', json_build_object('level', p_level)::jsonb);
  end if;
  return private.progress_json(r);
end;
$$;

create or replace function public.submit_quiz(p_phase int, p_answers jsonb)
returns json
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_student uuid := private.require_student();
  r public.phase_progress;
  v_results jsonb := '{}'::jsonb;
  v_score int := 0;
  v_total int := 0;
  v_pass_min int;
  v_passed boolean;
  v_recent int;
  k record;
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'invalid_answers' using errcode = '22023';
  end if;
  r := private.open_phase(v_student, p_phase);

  select count(*) into v_recent from public.quiz_attempts
   where student_id = v_student and phase_id = p_phase and created_at > now() - interval '10 minutes';
  if v_recent >= 10 then
    raise exception 'quiz_cooldown' using errcode = 'P0001', hint = 'Revise o conteúdo antes de tentar de novo.';
  end if;

  for k in select question_id, correct_option from public.quiz_keys where phase_id = p_phase loop
    v_total := v_total + 1;
    if (p_answers ->> k.question_id) = k.correct_option then
      v_score := v_score + 1;
      v_results := v_results || jsonb_build_object(k.question_id, true);
    else
      v_results := v_results || jsonb_build_object(k.question_id, false);
    end if;
  end loop;

  select quiz_pass_min into v_pass_min from public.phases where id = p_phase;
  v_passed := v_total > 0 and v_score >= v_pass_min;

  -- Guarda só as respostas às perguntas existentes.
  insert into public.quiz_attempts (student_id, phase_id, answers, results, score, total, passed)
  values (
    v_student, p_phase,
    coalesce((select jsonb_object_agg(key, value) from jsonb_each(p_answers)
               where key in (select question_id from public.quiz_keys where phase_id = p_phase)), '{}'::jsonb),
    v_results, v_score, v_total, v_passed
  );

  if r.status <> 'completed' then
    update public.phase_progress
       set quiz_attempts = quiz_attempts + 1,
           quiz_best_score = greatest(quiz_best_score, v_score),
           quiz_passed = quiz_passed or v_passed,
           updated_at = now()
     where student_id = v_student and phase_id = p_phase;
  end if;

  insert into public.activity_log (student_id, phase_id, kind, detail)
  values (v_student, p_phase, 'quiz', json_build_object('score', v_score, 'total', v_total, 'passed', v_passed)::jsonb);

  return json_build_object('score', v_score, 'total', v_total, 'passed', v_passed,
                           'pass_min', v_pass_min, 'results', v_results);
end;
$$;

create or replace function private.missing_criteria(r public.phase_progress)
returns text[]
language sql stable
set search_path = public
as $$
  select array_remove(array[
    case when not (select required_ids <@ r.checklist from public.phases where id = r.phase_id) then 'checklist' end,
    case when not r.quiz_passed then 'quiz' end,
    case when char_length(btrim(r.reflection)) < 20 then 'reflection' end,
    case when not r.reviewed then 'review' end
  ], null);
$$;

create or replace function public.complete_phase(p_phase int)
returns json
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_student uuid := private.require_student();
  r public.phase_progress;
  v_missing text[];
begin
  r := private.open_phase(v_student, p_phase);
  if r.status = 'completed' then
    return json_build_object('ok', true, 'missing', '{}'::text[], 'progress', private.progress_json(r));
  end if;
  v_missing := private.missing_criteria(r);
  if array_length(v_missing, 1) > 0 then
    return json_build_object('ok', false, 'missing', v_missing, 'progress', private.progress_json(r));
  end if;
  update public.phase_progress set status = 'completed', completed_at = now(), updated_at = now()
   where student_id = v_student and phase_id = p_phase returning * into r;
  insert into public.activity_log (student_id, phase_id, kind) values (v_student, p_phase, 'complete');
  return json_build_object('ok', true, 'missing', '{}'::text[], 'progress', private.progress_json(r));
end;
$$;

-- ---------------------------------------------------------------------
-- PROFESSOR: alunos e códigos
-- ---------------------------------------------------------------------
create or replace function public.create_students(p_class uuid, p_names text[])
returns table (id uuid, display_name text, code text)
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_teacher uuid := private.require_teacher();
  v_name text;
  v_code record;
  v_id uuid;
begin
  if not public.teacher_owns_class(p_class) then
    raise exception 'class_not_found' using errcode = '42501';
  end if;
  if coalesce(array_length(p_names, 1), 0) = 0 or array_length(p_names, 1) > 100 then
    raise exception 'invalid_name_list' using errcode = '22023', hint = 'Envie de 1 a 100 nomes por vez.';
  end if;
  foreach v_name in array p_names loop
    v_name := btrim(v_name);
    if char_length(v_name) between 1 and 60 then
      v_code := private.new_unique_code();
      insert into public.students (class_id, display_name, code_hash)
      values (p_class, v_name, v_code.code_hash)
      returning students.id into v_id;
      insert into public.audit_log (teacher_id, student_id, class_id, action)
      values (v_teacher, v_id, p_class, 'create_student');
      id := v_id; display_name := v_name; code := v_code.code;
      return next;
    end if;
  end loop;
end;
$$;

create or replace function public.reset_student_code(p_student uuid)
returns text
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_teacher uuid := private.require_teacher();
  v_code record;
begin
  if not public.teacher_owns_student(p_student) then
    raise exception 'student_not_found' using errcode = '42501';
  end if;
  v_code := private.new_unique_code();
  update public.students set code_hash = v_code.code_hash where id = p_student;
  -- Encerra as sessões abertas com o código antigo.
  delete from public.student_sessions where student_id = p_student;
  insert into public.audit_log (teacher_id, student_id, action) values (v_teacher, p_student, 'reset_code');
  return v_code.code;
end;
$$;

create or replace function public.teacher_update_student(
  p_student uuid, p_display_name text, p_active boolean, p_class uuid, p_reason text default null)
returns void
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_teacher uuid := private.require_teacher();
  v_before public.students;
begin
  if not public.teacher_owns_student(p_student) then
    raise exception 'student_not_found' using errcode = '42501';
  end if;
  if p_class is not null and not public.teacher_owns_class(p_class) then
    raise exception 'class_not_found' using errcode = '42501';
  end if;
  if p_display_name is not null and char_length(btrim(p_display_name)) not between 1 and 60 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  select * into v_before from public.students where id = p_student;
  update public.students
     set display_name = coalesce(btrim(p_display_name), display_name),
         active = coalesce(p_active, active),
         class_id = coalesce(p_class, class_id)
   where id = p_student;
  if p_active is not null and p_active = false then
    delete from public.student_sessions where student_id = p_student;
  end if;
  insert into public.audit_log (teacher_id, student_id, class_id, action, reason, before, after)
  values (v_teacher, p_student, coalesce(p_class, v_before.class_id), 'update_student', p_reason,
          jsonb_build_object('active', v_before.active, 'class_id', v_before.class_id,
                             'name_changed', p_display_name is not null and btrim(p_display_name) <> v_before.display_name),
          jsonb_build_object('active', coalesce(p_active, v_before.active), 'class_id', coalesce(p_class, v_before.class_id)));
end;
$$;

create or replace function public.teacher_delete_student(p_student uuid, p_reason text)
returns void
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_teacher uuid := private.require_teacher();
  v_class uuid;
begin
  if not public.teacher_owns_student(p_student) then
    raise exception 'student_not_found' using errcode = '42501';
  end if;
  select class_id into v_class from public.students where id = p_student;
  delete from public.students where id = p_student; -- remove em cascata progresso, tentativas e sessões
  insert into public.audit_log (teacher_id, student_id, class_id, action, reason)
  values (v_teacher, p_student, v_class, 'delete_student', p_reason);
end;
$$;

create or replace function public.teacher_delete_class(p_class uuid, p_confirm_name text)
returns void
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_teacher uuid := private.require_teacher();
  v_name text;
  v_count int;
begin
  select name into v_name from public.classes where id = p_class and teacher_id = v_teacher;
  if v_name is null then
    raise exception 'class_not_found' using errcode = '42501';
  end if;
  if btrim(coalesce(p_confirm_name, '')) <> v_name then
    raise exception 'confirm_name_mismatch' using errcode = '22023';
  end if;
  select count(*) into v_count from public.students where class_id = p_class;
  delete from public.classes where id = p_class;
  insert into public.audit_log (teacher_id, class_id, action, after)
  values (v_teacher, p_class, 'delete_class', jsonb_build_object('students_deleted', v_count));
end;
$$;

-- ---------------------------------------------------------------------
-- PROFESSOR: intervenções no progresso (sempre com histórico)
-- ---------------------------------------------------------------------
create or replace function public.teacher_unlock_phase(p_student uuid, p_phase int, p_reason text)
returns void
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_teacher uuid := private.require_teacher();
  v_before public.phase_progress;
begin
  if not public.teacher_owns_student(p_student) then
    raise exception 'student_not_found' using errcode = '42501';
  end if;
  if not exists (select 1 from public.phases where id = p_phase) then
    raise exception 'invalid_phase' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  select * into v_before from public.phase_progress where student_id = p_student and phase_id = p_phase;
  insert into public.phase_progress (student_id, phase_id, manually_unlocked)
  values (p_student, p_phase, true)
  on conflict (student_id, phase_id) do update set manually_unlocked = true, updated_at = now();
  insert into public.audit_log (teacher_id, student_id, phase_id, action, reason, before, after)
  values (v_teacher, p_student, p_phase, 'unlock_phase', btrim(p_reason),
          case when v_before is null then null else to_jsonb(v_before) end,
          jsonb_build_object('manually_unlocked', true));
end;
$$;

create or replace function public.teacher_set_phase_status(p_student uuid, p_phase int, p_status text, p_reason text)
returns void
language plpgsql volatile security definer
set search_path = public, private
as $$
declare
  v_teacher uuid := private.require_teacher();
  v_before public.phase_progress;
  v_after public.phase_progress;
begin
  if not public.teacher_owns_student(p_student) then
    raise exception 'student_not_found' using errcode = '42501';
  end if;
  if p_status not in ('completed', 'in_progress', 'reset') then
    raise exception 'invalid_status' using errcode = '22023';
  end if;
  if not exists (select 1 from public.phases where id = p_phase) then
    raise exception 'invalid_phase' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  select * into v_before from public.phase_progress where student_id = p_student and phase_id = p_phase;

  if p_status = 'reset' then
    delete from public.phase_progress where student_id = p_student and phase_id = p_phase;
  elsif p_status = 'completed' then
    insert into public.phase_progress (student_id, phase_id, status, completed_at, completed_by_teacher)
    values (p_student, p_phase, 'completed', now(), true)
    on conflict (student_id, phase_id) do update
      set status = 'completed', completed_at = coalesce(phase_progress.completed_at, now()),
          completed_by_teacher = true, updated_at = now();
  else
    insert into public.phase_progress (student_id, phase_id, manually_unlocked)
    values (p_student, p_phase, true)
    on conflict (student_id, phase_id) do update
      set status = 'in_progress', completed_at = null, completed_by_teacher = false, updated_at = now();
  end if;

  select * into v_after from public.phase_progress where student_id = p_student and phase_id = p_phase;
  insert into public.audit_log (teacher_id, student_id, phase_id, action, reason, before, after)
  values (v_teacher, p_student, p_phase, 'set_status:' || p_status, btrim(p_reason),
          case when v_before is null then null else to_jsonb(v_before) end,
          case when v_after is null then null else to_jsonb(v_after) end);
end;
$$;

-- ---------------------------------------------------------------------
-- ADMINISTRAÇÃO (somente pelo SQL Editor do Supabase; nunca pelo site)
-- Uso: select private.promote_to_teacher('professor@escola.br', 'Prof. Nome');
-- ---------------------------------------------------------------------
create or replace function private.promote_to_teacher(p_email text, p_display_name text)
returns uuid
language plpgsql volatile security definer
set search_path = public, auth
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users
   where lower(email) = lower(btrim(p_email)) and coalesce(is_anonymous, false) = false;
  if v_id is null then
    raise exception 'Usuário % não encontrado. Crie-o antes em Authentication > Users.', p_email;
  end if;
  insert into public.teachers (id, display_name) values (v_id, btrim(p_display_name))
  on conflict (id) do update set display_name = excluded.display_name;
  return v_id;
end;
$$;
