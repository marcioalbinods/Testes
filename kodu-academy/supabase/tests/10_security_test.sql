-- Testes de segurança e de regras de progressão.
-- Cada bloco troca de "usuário" ajustando o papel (role) e o identificador do JWT,
-- como o Supabase faz em cada requisição.
\set QUIET on
set client_min_messages = notice;

create schema t;
grant usage on schema t to anon, authenticated;
create table t.codes (who text primary key, student_id uuid, code text);
grant select, insert, update on t.codes to authenticated;

create function t.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'FALHOU: %', msg; end if;
  raise notice 'ok - %', msg;
end $$;

create function t.throws(stmt text, expected text, msg text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if expected is null or sqlerrm ilike '%' || expected || '%' then
      raise notice 'ok - % (erro: %)', msg, sqlerrm;
      return;
    end if;
    raise exception 'FALHOU: % (erro inesperado: %)', msg, sqlerrm;
  end;
  raise exception 'FALHOU: % (deveria ter dado erro)', msg;
end $$;
grant execute on all functions in schema t to anon, authenticated;

-- Usuários do Auth: 2 professores, 3 navegadores anônimos de alunos
insert into auth.users (id, email, is_anonymous) values
  ('a0000000-0000-0000-0000-00000000000a', 'prof.a@escola.br', false),
  ('b0000000-0000-0000-0000-00000000000b', 'prof.b@escola.br', false),
  ('10000000-0000-0000-0000-000000000001', null, true),
  ('20000000-0000-0000-0000-000000000002', null, true),
  ('30000000-0000-0000-0000-000000000003', null, true),
  ('40000000-0000-0000-0000-000000000004', null, true);

select private.promote_to_teacher('prof.a@escola.br', 'Prof. A');
select private.promote_to_teacher('PROF.B@escola.br', 'Prof. B');
select t.throws($$select private.promote_to_teacher('nao-existe@escola.br', 'X')$$, 'não encontrado', 'promover e-mail inexistente falha');

-- ================= Professor A cria turma e alunos =================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', false);
select t.ok(public.is_teacher(), 'professor A é reconhecido como professor');
insert into public.classes (name, school_year) values ('7º A', '2026');
select t.ok((select teacher_id from public.classes where name = '7º A') = auth.uid(), 'turma criada com teacher_id = professor A');
insert into t.codes (who, student_id, code)
  select case display_name when 'Ana' then 's1' else 's2' end, id, code
  from public.create_students((select id from public.classes where name = '7º A'), array['Ana', 'Bruno', '   ']);
select t.ok((select count(*) from t.codes) = 2, 'create_students ignora nomes vazios e cria 2 alunos');
select t.ok((select code from t.codes where who = 's1') ~ '^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$', 'código no formato XXXX-XXXX sem caracteres ambíguos');
select t.throws($$select code_hash from public.students$$, 'permission denied', 'professor não lê code_hash');
select t.throws($$insert into public.students (class_id, display_name, code_hash) values (gen_random_uuid(), 'x', 'y')$$, 'permission denied', 'inserção direta em students é negada');
select t.throws($$select * from public.quiz_keys$$, 'permission denied', 'professor não lê gabarito diretamente');
reset role;

-- ================= Professor B não vê nada do professor A =================
set role authenticated;
select set_config('request.jwt.claim.sub', 'b0000000-0000-0000-0000-00000000000b', false);
select t.ok((select count(*) from public.classes) = 0, 'professor B não vê turmas do A');
select t.ok((select count(*) from public.students) = 0, 'professor B não vê alunos do A');
select t.throws(format($$select * from public.create_students(%L, array['Intruso'])$$,
  (select id from public.classes limit 1)), null, 'professor B não cria aluno na turma do A');
reset role;
-- (consulta como superusuário para obter ids usados abaixo)
create temp table ids as select (select id from public.classes where name = '7º A') as class_a;
grant select on ids to authenticated;
set role authenticated;
select set_config('request.jwt.claim.sub', 'b0000000-0000-0000-0000-00000000000b', false);
select t.throws(format($$select * from public.create_students(%L, array['Intruso'])$$, (select class_a from ids)),
  'class_not_found', 'professor B não cria aluno na turma do A (id conhecido)');
select t.throws(format($$select public.reset_student_code(%L)$$, (select student_id from t.codes where who = 's1')),
  'student_not_found', 'professor B não redefine código de aluno do A');
select t.throws(format($$select public.teacher_unlock_phase(%L, 5, 'teste')$$, (select student_id from t.codes where who = 's1')),
  'student_not_found', 'professor B não libera fase de aluno do A');
update public.classes set name = 'hack' where id = (select class_a from ids);
reset role;
select t.ok((select name from public.classes where name = '7º A') is not null, 'turma do A não foi alterada pelo B');

-- ================= Visitante sem login (anon) =================
set role anon;
select t.throws($$select public.student_login('AAAA-BBBB')$$, 'permission denied', 'anon não chama funções');
select t.throws($$select * from public.phase_progress$$, 'permission denied', 'anon não lê progresso');
reset role;

-- ================= Aluno 1 entra (navegador 1) =================
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', false);
select t.ok((public.student_login('ZZZZ-ZZZZ') ->> 'error') = 'invalid_code', 'código errado é recusado');
select t.ok((public.student_login(lower(replace((select code from t.codes where who = 's1'), '-', ' '))) ->> 'ok')::boolean,
  'login aceita o código com minúsculas e espaços');
select t.ok((public.student_me() ->> 'display_name') = 'Ana', 'student_me devolve o próprio perfil');
select t.ok((select count(*) from public.students) = 1, 'aluno vê somente a si mesmo');
select t.ok((select count(*) from public.classes) = 1, 'aluno vê somente a própria turma');
select t.throws($$select code_hash from public.students$$, 'permission denied', 'aluno não lê code_hash');
select t.throws($$select * from public.quiz_keys$$, 'permission denied', 'aluno não lê o gabarito');
select t.throws($$select * from public.student_sessions$$, 'permission denied', 'aluno não lê sessões');
select t.ok((select count(*) from public.audit_log) = 0, 'aluno não vê histórico administrativo');

-- Progressão
select t.throws($$select public.save_checklist(2, array['x'])$$, 'phase_locked', 'fase 2 bloqueada antes de concluir a 1');
select t.ok((public.save_checklist(1, array['abrir', 'item-falso', 'abrir']) -> 'checklist')::jsonb = '["abrir"]'::jsonb,
  'checklist filtra itens inválidos e duplicados');
select t.throws($$insert into public.phase_progress (student_id, phase_id, status) values (public.current_student_id(), 1, 'completed')$$,
  'permission denied', 'aluno não insere progresso diretamente');
select t.throws($$update public.phase_progress set status = 'completed'$$, 'permission denied', 'aluno não altera progresso diretamente');
select t.ok((public.complete_phase(1) ->> 'ok')::boolean = false, 'concluir sem cumprir critérios é recusado');
select t.ok((public.complete_phase(1) -> 'missing')::jsonb @> '["checklist","quiz","reflection","review"]'::jsonb, 'lista todos os critérios faltantes');
select t.ok((public.submit_quiz(1, '{"q1":"a","q2":"b","q3":"a","q4":"a"}') ->> 'passed')::boolean = false, 'teste com respostas erradas reprova');
select t.ok((public.submit_quiz(1, '{"q1":"b","q2":"a","q3":"b","q4":"a","extra":"z"}') ->> 'score')::int = 3, 'correção no servidor: 3 de 4');
select t.ok((select quiz_passed and quiz_attempts = 2 and quiz_best_score = 3 from public.phase_progress where phase_id = 1), 'tentativas e melhor nota registradas');
select t.ok((select not (answers ? 'extra') from public.quiz_attempts order by id desc limit 1), 'respostas extras não são guardadas');
select public.save_checklist(1, array['abrir','jogar-exemplo','esc','ferramentas','novo','salvar','reabrir']);
select public.save_reflection(1, 'curta');
select public.set_reviewed(1, true);
select t.ok((public.complete_phase(1) -> 'missing')::jsonb = '["reflection"]'::jsonb, 'reflexão curta impede a conclusão');
select public.save_reflection(1, 'Joguei um mundo de corrida e quero criar um jogo de coleta.');
select t.ok((public.complete_phase(1) ->> 'ok')::boolean, 'fase 1 concluída com todos os critérios');
select t.throws($$select public.save_checklist(1, array['abrir'])$$, 'phase_completed', 'fase concluída não pode ser editada');
select t.ok((public.save_checklist(2, array['camera-mover']) ->> 'phase_id')::int = 2, 'fase 2 liberada após concluir a 1');
select t.throws($$select public.save_checklist(3, array['kodu'])$$, 'phase_locked', 'fase 3 continua bloqueada');
select public.log_hint(2, 2);
select public.log_hint(2, 1);
select t.ok((select hints_viewed from public.phase_progress where phase_id = 2) = 2, 'nível máximo de dica registrado');
select t.throws($$select public.log_hint(2, 7)$$, 'invalid_hint_level', 'nível de dica inválido é recusado');
select t.throws($$select public.create_students((select class_id from public.students limit 1), array['x'])$$, 'not_teacher', 'aluno não cria alunos');
select t.throws($$select private.generate_code()$$, 'permission denied', 'aluno não acessa o esquema privado');
reset role;

-- ================= Aluno 2 (navegador 2) não vê o aluno 1 =================
set role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', false);
select t.ok(public.student_me() is null, 'navegador sem login de aluno não tem perfil');
select t.ok((select count(*) from public.phase_progress) = 0, 'sem login, nenhum progresso visível');
select t.ok((public.student_login((select code from t.codes where who = 's2')) ->> 'ok')::boolean, 'aluno 2 entra');
select t.ok((select count(*) from public.phase_progress) = 0, 'aluno 2 não vê progresso do aluno 1');
select t.ok((select count(*) from public.quiz_attempts) = 0, 'aluno 2 não vê tentativas do aluno 1');
select t.ok((select count(*) from public.activity_log where student_id <> public.current_student_id()) = 0, 'aluno 2 não vê atividades do aluno 1');
select t.ok((select count(*) from public.students) = 1, 'aluno 2 vê só o próprio cadastro');
reset role;

-- ================= Aluno 1 em outro computador (navegador 3) =================
set role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', false);
select public.student_login((select code from t.codes where who = 's1'));
select t.ok((select count(*) from public.phase_progress where status = 'completed') = 1, 'progresso recuperado em outro dispositivo');
reset role;

-- ================= Professor A acompanha e intervém =================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', false);
select t.ok((select count(*) from public.students) = 2, 'professor A vê os 2 alunos');
select t.ok((select count(*) from public.phase_progress) = 2, 'professor A vê o progresso dos alunos');
select t.ok((select count(*) from public.quiz_attempts) = 2, 'professor A vê as tentativas');
select public.teacher_unlock_phase((select student_id from t.codes where who = 's2'), 5, 'Aluno já domina o conteúdo');
select t.throws(format($$select public.teacher_unlock_phase(%L, 6, '')$$, (select student_id from t.codes where who = 's2')), 'reason_required', 'liberação exige justificativa');
select t.ok((select count(*) from public.audit_log where action = 'unlock_phase') = 1, 'liberação manual registrada no histórico');
select public.teacher_set_phase_status((select student_id from t.codes where who = 's1'), 1, 'in_progress', 'Rever o conteúdo');
select t.ok((select status from public.phase_progress where phase_id = 1 and student_id = (select student_id from t.codes where who = 's1')) = 'in_progress',
  'professor reabre fase');
select t.ok((select before ->> 'status' from public.audit_log where action = 'set_status:in_progress') = 'completed', 'histórico guarda o estado anterior');
select public.teacher_set_phase_status((select student_id from t.codes where who = 's1'), 1, 'completed', 'Validado em aula');
select t.ok((select completed_by_teacher from public.phase_progress where phase_id = 1 and student_id = (select student_id from t.codes where who = 's1')),
  'conclusão pelo professor fica marcada');
update t.codes set code = public.reset_student_code(student_id) where who = 's1';
select t.ok((select count(*) from public.audit_log where action = 'reset_code') = 1, 'redefinição de código registrada');
reset role;

-- Liberação manual funciona para o aluno 2
set role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', false);
select t.ok((public.save_checklist(5, array['see-apple']) ->> 'phase_id')::int = 5, 'aluno 2 acessa a fase 5 liberada manualmente');
select t.throws($$select public.save_checklist(6, array['setas'])$$, 'phase_locked', 'fase 6 continua bloqueada para o aluno 2');
reset role;

-- Código antigo do aluno 1 deixa de valer e as sessões são encerradas
set role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000003', false);
select t.ok(public.current_student_id() is null, 'sessões antigas encerradas após redefinir código');
select t.ok((public.student_login((select code from t.codes where who = 's1')) ->> 'ok')::boolean, 'novo código funciona');
reset role;

-- ================= Limite de tentativas =================
set role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-0000-0000-000000000004', false);
select public.student_login('AAAA-AAA' || g) from generate_series(1, 8) g;
select t.ok((public.student_login((select code from t.codes where who = 's2')) ->> 'error') = 'too_many_attempts',
  'após 8 erros, mesmo o código certo é bloqueado temporariamente');
reset role;

-- ================= Desativar e excluir =================
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', false);
select public.teacher_update_student((select student_id from t.codes where who = 's2'), null, false, null, 'Transferido');
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', false);
select t.ok(public.current_student_id() is null, 'aluno desativado perde o acesso');
select t.ok((public.student_login((select code from t.codes where who = 's2')) ->> 'error') = 'invalid_code', 'aluno desativado não entra');
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', false);
select public.teacher_delete_student((select student_id from t.codes where who = 's2'), 'Pedido da família');
select t.ok((select count(*) from public.students) = 1, 'aluno excluído');
select t.ok((select count(*) from public.phase_progress where student_id = (select student_id from t.codes where who = 's2')) = 0, 'progresso excluído junto');
select t.ok((select count(*) from public.audit_log where action = 'delete_student' and after is null) = 1, 'exclusão registrada sem dados pessoais');
select t.throws(format($$select public.teacher_delete_class(%L, 'nome errado')$$, (select class_a from ids)), 'confirm_name_mismatch', 'excluir turma exige confirmar o nome');
reset role;

select t.ok((select count(*) from pg_tables where schemaname = 'public' and not rowsecurity) = 0, 'RLS ligado em todas as tabelas públicas');
select t.ok(not exists (
  select 1 from information_schema.role_table_grants
  where grantee in ('anon') and table_schema = 'public'), 'anon não tem nenhum privilégio em tabelas');
\echo 'Todos os testes de segurança passaram.'
