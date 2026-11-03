-- =====================================================================
-- Kodu Academy — esquema do banco de dados (Supabase / PostgreSQL)
-- Coleta mínima de dados: nome de exibição, turma, código (só o hash),
-- datas e progresso. Nenhum e-mail, CPF, telefone ou foto de aluno.
-- =====================================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Esquema privado: não é exposto pela API do Supabase.
create schema if not exists private;
revoke all on schema private from public;

-- Segredo usado para "temperar" o hash dos códigos de acesso dos alunos.
create table if not exists private.settings (
  key text primary key,
  value text not null
);
insert into private.settings (key, value)
values ('code_pepper', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Professores (vinculados a usuários do Supabase Auth)
-- ---------------------------------------------------------------------
create table public.teachers (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Turmas
-- ---------------------------------------------------------------------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references public.teachers (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  school_year text check (school_year is null or char_length(school_year) <= 20),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (teacher_id, name)
);
create index classes_teacher_idx on public.classes (teacher_id);

-- ---------------------------------------------------------------------
-- Alunos (sem e-mail; o código de acesso é guardado apenas como hash)
-- ---------------------------------------------------------------------
create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  code_hash text not null unique,
  active boolean not null default true,
  started_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now()
);
create index students_class_idx on public.students (class_id);

-- Sessões: liga um usuário anônimo do Supabase Auth (um por navegador/dispositivo)
-- ao aluno que digitou o código. Permite continuar em vários computadores.
create table public.student_sessions (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index student_sessions_student_idx on public.student_sessions (student_id);

-- Tentativas de login (limite contra adivinhação de códigos)
create table public.login_attempts (
  id bigint generated always as identity primary key,
  auth_user_id uuid not null,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index login_attempts_user_idx on public.login_attempts (auth_user_id, created_at);
create index login_attempts_time_idx on public.login_attempts (created_at);

-- ---------------------------------------------------------------------
-- Conteúdo: metadados das fases e gabarito (gerados a partir de src/content)
-- ---------------------------------------------------------------------
create table public.phases (
  id smallint primary key check (id between 1 and 99),
  module smallint not null,
  title text not null,
  checklist_ids text[] not null,
  required_ids text[] not null,
  quiz_question_ids text[] not null,
  quiz_pass_min smallint not null
);

create table public.quiz_keys (
  phase_id smallint not null references public.phases (id) on delete cascade,
  question_id text not null,
  correct_option text not null,
  primary key (phase_id, question_id)
);

-- ---------------------------------------------------------------------
-- Progresso
-- ---------------------------------------------------------------------
create table public.phase_progress (
  student_id uuid not null references public.students (id) on delete cascade,
  phase_id smallint not null references public.phases (id),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  checklist text[] not null default '{}',
  reviewed boolean not null default false,
  reflection text not null default '' check (char_length(reflection) <= 2000),
  quiz_passed boolean not null default false,
  quiz_best_score smallint not null default 0,
  quiz_attempts integer not null default 0,
  hints_viewed smallint not null default 0 check (hints_viewed between 0 and 3),
  manually_unlocked boolean not null default false,
  completed_by_teacher boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, phase_id)
);

create table public.quiz_attempts (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students (id) on delete cascade,
  phase_id smallint not null references public.phases (id),
  answers jsonb not null,
  results jsonb not null,
  score smallint not null,
  total smallint not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);
create index quiz_attempts_student_idx on public.quiz_attempts (student_id, phase_id, created_at);

create table public.activity_log (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students (id) on delete cascade,
  phase_id smallint,
  kind text not null check (kind in ('login', 'hint', 'quiz', 'complete')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_log_student_idx on public.activity_log (student_id, created_at desc);

-- Histórico de alterações administrativas feitas por professores.
-- student_id não tem chave estrangeira para que o histórico sobreviva à
-- exclusão do aluno — mas nenhum dado pessoal é guardado aqui.
create table public.audit_log (
  id bigint generated always as identity primary key,
  teacher_id uuid references public.teachers (id) on delete set null,
  student_id uuid,
  class_id uuid,
  phase_id smallint,
  action text not null,
  reason text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_teacher_idx on public.audit_log (teacher_id, created_at desc);
create index audit_log_student_idx on public.audit_log (student_id);
