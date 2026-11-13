-- =====================================================================
-- MONSTRINHOS! – O Laboratório das Criaturas Fantásticas
-- Banco de dados completo (Supabase / PostgreSQL)
--
-- Como usar: no painel do Supabase, abra "SQL Editor" → "New query",
-- cole TODO este arquivo e clique em "Run". Pode rodar de novo sem
-- problema (o script é idempotente).
--
-- Resumo da segurança:
--   * Estudantes não têm conta pessoal: cada aparelho entra com um
--     usuário ANÔNIMO do Supabase Auth (sem e-mail, sem senha).
--   * Um usuário anônimo só enxerga um projeto depois de criá-lo ou de
--     digitar o código de recuperação correto (tabela project_members).
--   * O código de recuperação é guardado como hash (SHA-256) para busca;
--     o texto do código fica numa tabela que SOMENTE professores leem.
--   * Tentativas erradas de código são limitadas por aparelho e por rede.
--   * Escritas acontecem só por funções (RPC) que conferem permissão.
--   * Professores são usuários do Supabase Auth cadastrados na tabela
--     public.teachers (veja o final deste arquivo).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------------------

create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  turma            text not null check (turma in ('3A', '3B', '3C')),
  student1         text not null check (char_length(student1) between 1 and 24),
  student2         text not null check (char_length(student2) between 1 and 24),
  names_key        text not null,
  code_hash        text not null unique,
  created_at       timestamptz not null default now(),
  last_access_at   timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  version          integer not null default 1,
  epoch            integer not null default 1,
  current_stage    integer not null default 1 check (current_stage between 1 and 6),
  current_mission  integer not null default 1 check (current_mission between 1 and 31),
  missions_done    integer[] not null default '{}',
  progress         integer not null default 0 check (progress between 0 and 100),
  stars            integer not null default 0 check (stars >= 0),
  completed_at     timestamptz,
  data             jsonb not null default '{}'::jsonb
);
create index if not exists projects_turma_idx on public.projects (turma);
create index if not exists projects_names_idx on public.projects (turma, names_key);

-- Código legível (somente professores conseguem ler esta tabela).
create table if not exists public.project_codes (
  project_id uuid primary key references public.projects (id) on delete cascade,
  code       text not null
);

-- Quais usuários (aparelhos) podem abrir cada projeto.
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index if not exists project_members_user_idx on public.project_members (user_id);

-- Professores autorizados.
create table if not exists public.teachers (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text,
  created_at timestamptz not null default now()
);

-- Regras de cada turma (por exemplo: gravação de voz permitida?).
create table if not exists public.class_settings (
  turma            text primary key check (turma in ('3A', '3B', '3C')),
  allow_recordings boolean not null default false,
  updated_at       timestamptz not null default now()
);
insert into public.class_settings (turma) values ('3A'), ('3B'), ('3C')
on conflict (turma) do nothing;

-- Cópias de segurança automáticas (no máximo 1 a cada 20 minutos por projeto).
create table if not exists public.project_snapshots (
  id         bigserial primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  version    integer not null,
  progress   integer not null,
  data       jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists project_snapshots_project_idx on public.project_snapshots (project_id, created_at desc);

-- Projetos anteriores guardados quando o professor reinicia uma dupla/turma.
create table if not exists public.project_archive (
  id          bigserial primary key,
  project_id  uuid,
  turma       text not null,
  student1    text not null,
  student2    text not null,
  progress    integer not null,
  stars       integer not null,
  data        jsonb not null,
  reason      text not null,
  created_at  timestamptz not null,
  archived_at timestamptz not null default now()
);
create index if not exists project_archive_turma_idx on public.project_archive (turma, archived_at desc);

-- Registro de tentativas (limite de tentativas do código).
create table if not exists public.auth_attempts (
  id      bigserial primary key,
  key     text not null,
  kind    text not null,
  success boolean not null,
  at      timestamptz not null default now()
);
create index if not exists auth_attempts_key_idx on public.auth_attempts (key, kind, at desc);

-- ---------------------------------------------------------------------
-- FUNÇÕES AUXILIARES
-- ---------------------------------------------------------------------

create or replace function public.is_teacher()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.teachers t where t.user_id = auth.uid());
$$;

create or replace function public.is_member(p_project uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.project_members m
    where m.project_id = p_project and m.user_id = auth.uid()
  );
$$;

create or replace function public.safe_uuid(p text)
returns uuid
language plpgsql immutable set search_path = ''
as $$
begin
  return p::uuid;
exception when others then
  return null;
end;
$$;

-- Normaliza um código digitado: maiúsculas, sem espaços nem traços.
create or replace function public.normalize_code(p text)
returns text
language sql immutable set search_path = ''
as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function public.hash_code(p text)
returns text
language sql immutable set search_path = ''
as $$
  select encode(extensions.digest(public.normalize_code(p), 'sha256'), 'hex');
$$;

-- Alfabeto sem caracteres confusos (sem O, 0, I, 1 e L).
create or replace function public.generate_code()
returns text
language plpgsql volatile set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(8);
  result text := '';
  i int;
begin
  for i in 0..7 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
    if i = 3 then result := result || '-'; end if;
  end loop;
  return result;
end;
$$;

-- Nome: só o primeiro nome (pode ser composto, como "Ana Clara").
create or replace function public.clean_name(p text)
returns text
language sql immutable set search_path = ''
as $$
  select initcap(lower(regexp_replace(btrim(coalesce(p, '')), '\s+', ' ', 'g')));
$$;

create or replace function public.valid_name(p text)
returns boolean
language sql immutable set search_path = ''
as $$
  select p ~ '^[A-Za-zÀ-ÖØ-öø-ÿ''-]{2,14}( [A-Za-zÀ-ÖØ-öø-ÿ''-]{2,14})?$'
     and char_length(p) <= 24;
$$;

create or replace function public.names_key(a text, b text)
returns text
language sql immutable set search_path = ''
as $$
  select string_agg(n, '+' order by n)
  from unnest(array[lower(public.clean_name(a)), lower(public.clean_name(b))]) as n;
$$;

-- IP do pedido (o Supabase repassa os cabeçalhos HTTP para o banco).
create or replace function public.request_ip()
returns text
language plpgsql stable set search_path = ''
as $$
declare
  h json;
  ip text;
begin
  begin
    h := current_setting('request.headers', true)::json;
  exception when others then
    h := null;
  end;
  if h is null then return 'desconhecido'; end if;
  ip := coalesce(h ->> 'cf-connecting-ip', split_part(h ->> 'x-forwarded-for', ',', 1), h ->> 'x-real-ip');
  return coalesce(nullif(btrim(ip), ''), 'desconhecido');
end;
$$;

-- Quantas tentativas (com ou sem sucesso) existem numa janela de tempo.
create or replace function public.count_attempts(p_key text, p_kind text, p_window interval, p_only_fail boolean)
returns integer
language sql stable security definer set search_path = ''
as $$
  select count(*)::int from public.auth_attempts a
  where a.key = p_key and a.kind = p_kind and a.at > now() - p_window
    and (not p_only_fail or a.success = false);
$$;

create or replace function public.project_public(p public.projects)
returns jsonb
language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id, 'turma', p.turma, 'student1', p.student1, 'student2', p.student2,
    'created_at', p.created_at, 'last_access_at', p.last_access_at, 'updated_at', p.updated_at,
    'version', p.version, 'epoch', p.epoch, 'current_stage', p.current_stage,
    'current_mission', p.current_mission, 'missions_done', to_jsonb(p.missions_done),
    'progress', p.progress, 'stars', p.stars, 'completed_at', p.completed_at, 'data', p.data
  );
$$;

-- ---------------------------------------------------------------------
-- FUNÇÕES DO JOGO (chamadas pelo navegador dos estudantes)
-- ---------------------------------------------------------------------

-- Cria o projeto da dupla. Se já existir uma dupla com os mesmos nomes na
-- mesma turma, devolve status "exists" (para não duplicar), a menos que
-- p_force = true ("somos outra dupla com os mesmos nomes").
create or replace function public.create_project(p_turma text, p_student1 text, p_student2 text, p_force boolean default false)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  s1 text := public.clean_name(p_student1);
  s2 text := public.clean_name(p_student2);
  k text;
  new_code text;
  new_hash text;
  proj public.projects;
  tries int := 0;
begin
  if uid is null then
    return jsonb_build_object('status', 'error', 'message', 'not_authenticated');
  end if;
  if p_turma not in ('3A', '3B', '3C') then
    return jsonb_build_object('status', 'error', 'message', 'invalid_class');
  end if;
  if not public.valid_name(s1) or not public.valid_name(s2) then
    return jsonb_build_object('status', 'error', 'message', 'invalid_name');
  end if;
  if lower(s1) = lower(s2) then
    return jsonb_build_object('status', 'error', 'message', 'same_name');
  end if;

  -- Limite de criação: 12 por aparelho e 200 por rede a cada hora.
  if public.count_attempts('uid:' || uid::text, 'create', interval '1 hour', false) >= 12
     or public.count_attempts('ip:' || public.request_ip(), 'create', interval '1 hour', false) >= 200 then
    return jsonb_build_object('status', 'blocked', 'wait_seconds', 600);
  end if;

  k := public.names_key(s1, s2);
  if not coalesce(p_force, false) and exists (
    select 1 from public.projects p where p.turma = p_turma and p.names_key = k
  ) then
    return jsonb_build_object('status', 'exists');
  end if;

  loop
    new_code := public.generate_code();
    new_hash := public.hash_code(new_code);
    exit when not exists (select 1 from public.projects p where p.code_hash = new_hash);
    tries := tries + 1;
    if tries > 20 then raise exception 'could not generate code'; end if;
  end loop;

  insert into public.projects (turma, student1, student2, names_key, code_hash)
  values (p_turma, s1, s2, k, new_hash)
  returning * into proj;

  insert into public.project_codes (project_id, code) values (proj.id, new_code);
  insert into public.project_members (project_id, user_id) values (proj.id, uid);
  insert into public.auth_attempts (key, kind, success) values ('uid:' || uid::text, 'create', true);
  insert into public.auth_attempts (key, kind, success) values ('ip:' || public.request_ip(), 'create', true);

  return jsonb_build_object('status', 'created', 'code', new_code, 'project', public.project_public(proj));
end;
$$;

-- Recupera o projeto pelo código. Limites: 6 erros por aparelho em 10 min,
-- 40 erros por rede em 10 min (a escola inteira costuma usar a mesma rede).
create or replace function public.recover_project(p_code text)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  ip text := public.request_ip();
  fails_uid int;
  fails_ip int;
  proj public.projects;
begin
  if uid is null then
    return jsonb_build_object('status', 'error', 'message', 'not_authenticated');
  end if;

  fails_uid := public.count_attempts('uid:' || uid::text, 'recover', interval '10 minutes', true);
  fails_ip := public.count_attempts('ip:' || ip, 'recover', interval '10 minutes', true);
  if fails_uid >= 6 or fails_ip >= 40 then
    return jsonb_build_object('status', 'blocked', 'wait_seconds', 600);
  end if;

  if char_length(public.normalize_code(p_code)) <> 8 then
    insert into public.auth_attempts (key, kind, success) values ('uid:' || uid::text, 'recover', false);
    insert into public.auth_attempts (key, kind, success) values ('ip:' || ip, 'recover', false);
    return jsonb_build_object('status', 'invalid', 'remaining', greatest(0, 5 - fails_uid));
  end if;

  select * into proj from public.projects p where p.code_hash = public.hash_code(p_code);
  if not found then
    insert into public.auth_attempts (key, kind, success) values ('uid:' || uid::text, 'recover', false);
    insert into public.auth_attempts (key, kind, success) values ('ip:' || ip, 'recover', false);
    return jsonb_build_object('status', 'invalid', 'remaining', greatest(0, 5 - fails_uid));
  end if;

  insert into public.project_members (project_id, user_id) values (proj.id, uid)
  on conflict do nothing;
  update public.projects set last_access_at = now() where id = proj.id returning * into proj;
  insert into public.auth_attempts (key, kind, success) values ('uid:' || uid::text, 'recover', true);

  return jsonb_build_object('status', 'ok', 'project', public.project_public(proj));
end;
$$;

-- Carrega o projeto (só para quem é membro) e marca o último acesso.
create or replace function public.load_project(p_id uuid)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  proj public.projects;
begin
  if not public.is_member(p_id) then
    return jsonb_build_object('status', 'forbidden');
  end if;
  update public.projects set last_access_at = now() where id = p_id returning * into proj;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object('status', 'ok', 'project', public.project_public(proj));
end;
$$;

-- Salva o projeto com controle de versão (concorrência otimista).
-- Se a versão do aparelho for antiga, devolve "conflict" com a versão do
-- servidor, e o aparelho junta as mudanças antes de tentar de novo.
create or replace function public.save_project(
  p_id uuid,
  p_base_version integer,
  p_epoch integer,
  p_data jsonb,
  p_current_stage integer,
  p_current_mission integer,
  p_missions_done integer[],
  p_progress integer,
  p_stars integer
)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  proj public.projects;
  last_snap timestamptz;
  done_all boolean;
begin
  if not public.is_member(p_id) then
    return jsonb_build_object('status', 'forbidden');
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    return jsonb_build_object('status', 'error', 'message', 'invalid_data');
  end if;
  if pg_column_size(p_data) > 1500000 then
    return jsonb_build_object('status', 'error', 'message', 'too_large');
  end if;

  select * into proj from public.projects where id = p_id for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if proj.epoch <> p_epoch or proj.version <> p_base_version then
    return jsonb_build_object('status', 'conflict', 'project', public.project_public(proj));
  end if;

  -- Cópia de segurança do estado anterior (no máximo a cada 20 minutos).
  select max(created_at) into last_snap from public.project_snapshots where project_id = p_id;
  if proj.progress > 0 and (last_snap is null or last_snap < now() - interval '20 minutes') then
    insert into public.project_snapshots (project_id, version, progress, data)
    values (p_id, proj.version, proj.progress, proj.data);
    delete from public.project_snapshots s
    where s.project_id = p_id
      and s.id not in (
        select s2.id from public.project_snapshots s2
        where s2.project_id = p_id order by s2.created_at desc limit 30
      );
  end if;

  done_all := coalesce(array_length(p_missions_done, 1), 0) >= 30;

  update public.projects set
    data = p_data,
    version = proj.version + 1,
    updated_at = now(),
    last_access_at = now(),
    current_stage = least(6, greatest(1, coalesce(p_current_stage, 1))),
    current_mission = least(31, greatest(1, coalesce(p_current_mission, 1))),
    missions_done = coalesce((select array_agg(distinct m order by m) from unnest(p_missions_done) m where m between 1 and 30), '{}'),
    progress = least(100, greatest(0, coalesce(p_progress, 0))),
    stars = greatest(0, coalesce(p_stars, 0)),
    completed_at = case when done_all then coalesce(proj.completed_at, now()) else null end
  where id = p_id
  returning * into proj;

  return jsonb_build_object('status', 'ok', 'version', proj.version, 'updated_at', proj.updated_at);
end;
$$;

-- O aparelho deixa de ter acesso ao projeto (botão "Trocar de dupla").
create or replace function public.leave_project(p_id uuid)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
begin
  delete from public.project_members where project_id = p_id and user_id = auth.uid();
  return jsonb_build_object('status', 'ok');
end;
$$;

-- A dupla pode rever o próprio código.
create or replace function public.get_my_code(p_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  c text;
begin
  if not public.is_member(p_id) then
    return jsonb_build_object('status', 'forbidden');
  end if;
  select code into c from public.project_codes where project_id = p_id;
  return jsonb_build_object('status', 'ok', 'code', c);
end;
$$;

-- ---------------------------------------------------------------------
-- FUNÇÕES DO PROFESSOR (todas conferem public.is_teacher())
-- ---------------------------------------------------------------------

create or replace function public.teacher_reset_project(p_id uuid)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  proj public.projects;
begin
  if not public.is_teacher() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  select * into proj from public.projects where id = p_id for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  if proj.progress > 0 or proj.data <> '{}'::jsonb then
    insert into public.project_archive (project_id, turma, student1, student2, progress, stars, data, reason, created_at)
    values (proj.id, proj.turma, proj.student1, proj.student2, proj.progress, proj.stars, proj.data, 'reinício', proj.created_at);
  end if;
  update public.projects set
    data = '{}'::jsonb, version = proj.version + 1, epoch = proj.epoch + 1,
    current_stage = 1, current_mission = 1, missions_done = '{}', progress = 0, stars = 0,
    completed_at = null, updated_at = now()
  where id = p_id;
  delete from public.project_snapshots where project_id = p_id;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- Reinicia SOMENTE os projetos da turma informada.
create or replace function public.teacher_reset_class(p_turma text)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  r record;
  n int := 0;
begin
  if not public.is_teacher() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  if p_turma not in ('3A', '3B', '3C') then
    return jsonb_build_object('status', 'error', 'message', 'invalid_class');
  end if;
  for r in select id from public.projects where turma = p_turma loop
    perform public.teacher_reset_project(r.id);
    n := n + 1;
  end loop;
  return jsonb_build_object('status', 'ok', 'count', n);
end;
$$;

-- Apaga as criações (sem guardar cópia) mas mantém a dupla e o código.
create or replace function public.teacher_clear_project(p_id uuid)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
begin
  if not public.is_teacher() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  update public.projects set
    data = '{}'::jsonb, version = version + 1, epoch = epoch + 1,
    current_stage = 1, current_mission = 1, missions_done = '{}', progress = 0, stars = 0,
    completed_at = null, updated_at = now()
  where id = p_id;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  delete from public.project_snapshots where project_id = p_id;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- Exclui a dupla inteira (nomes, código, criações e cópias).
create or replace function public.teacher_delete_project(p_id uuid)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
begin
  if not public.is_teacher() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  delete from public.projects where id = p_id;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object('status', 'ok');
end;
$$;

create or replace function public.teacher_delete_archive(p_id bigint)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
begin
  if not public.is_teacher() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  delete from public.project_archive where id = p_id;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- Restaura uma cópia de segurança automática.
create or replace function public.teacher_restore_snapshot(p_snapshot bigint)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  s public.project_snapshots;
begin
  if not public.is_teacher() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  select * into s from public.project_snapshots where id = p_snapshot;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  update public.projects set
    data = s.data, version = version + 1, epoch = epoch + 1, progress = s.progress,
    missions_done = coalesce((
      select array_agg((m)::int order by (m)::int)
      from jsonb_array_elements_text(coalesce(s.data -> 'progress' -> 'done', '[]'::jsonb)) m
    ), '{}'),
    updated_at = now()
  where id = s.project_id;
  return jsonb_build_object('status', 'ok');
end;
$$;

create or replace function public.teacher_set_class_setting(p_turma text, p_allow_recordings boolean)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
begin
  if not public.is_teacher() then
    return jsonb_build_object('status', 'forbidden');
  end if;
  update public.class_settings set allow_recordings = p_allow_recordings, updated_at = now()
  where turma = p_turma;
  return jsonb_build_object('status', 'ok');
end;
$$;

-- Configuração da turma do projeto (a dupla só vê a própria turma).
create or replace function public.get_project_settings(p_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  allow boolean;
begin
  if not (public.is_member(p_id) or public.is_teacher()) then
    return jsonb_build_object('status', 'forbidden');
  end if;
  select cs.allow_recordings into allow
  from public.projects p join public.class_settings cs on cs.turma = p.turma
  where p.id = p_id;
  return jsonb_build_object('status', 'ok', 'allow_recordings', coalesce(allow, false));
end;
$$;

-- Usado pelas políticas do Storage: este usuário pode gravar áudio neste projeto?
create or replace function public.can_upload_recording(p_project uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.is_member(p_project) and exists (
    select 1 from public.projects p join public.class_settings cs on cs.turma = p.turma
    where p.id = p_project and cs.allow_recordings
  );
$$;

-- Limpeza do registro de tentativas antigas.
create or replace function public.cleanup_attempts()
returns void
language sql volatile security definer set search_path = ''
as $$
  delete from public.auth_attempts where at < now() - interval '2 days';
$$;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.projects          enable row level security;
alter table public.project_codes     enable row level security;
alter table public.project_members   enable row level security;
alter table public.teachers          enable row level security;
alter table public.class_settings    enable row level security;
alter table public.project_snapshots enable row level security;
alter table public.project_archive   enable row level security;
alter table public.auth_attempts     enable row level security;

-- Ninguém escreve direto nas tabelas pelo navegador: só pelas funções acima.
revoke all on public.projects, public.project_codes, public.project_members, public.teachers,
  public.class_settings, public.project_snapshots, public.project_archive, public.auth_attempts
  from anon, authenticated;
revoke all on sequence public.project_snapshots_id_seq, public.project_archive_id_seq, public.auth_attempts_id_seq
  from anon, authenticated;

grant select on public.projects, public.project_codes, public.project_members, public.teachers,
  public.class_settings, public.project_snapshots, public.project_archive
  to authenticated;

drop policy if exists "membros e professores leem projetos" on public.projects;
create policy "membros e professores leem projetos" on public.projects
  for select to authenticated
  using (public.is_member(id) or public.is_teacher());

drop policy if exists "somente professores leem codigos" on public.project_codes;
create policy "somente professores leem codigos" on public.project_codes
  for select to authenticated
  using (public.is_teacher());

drop policy if exists "cada um ve os proprios vinculos" on public.project_members;
create policy "cada um ve os proprios vinculos" on public.project_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_teacher());

drop policy if exists "professor ve o proprio cadastro" on public.teachers;
create policy "professor ve o proprio cadastro" on public.teachers
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "professores leem regras das turmas" on public.class_settings;
create policy "professores leem regras das turmas" on public.class_settings
  for select to authenticated
  using (public.is_teacher());

drop policy if exists "professores leem copias" on public.project_snapshots;
create policy "professores leem copias" on public.project_snapshots
  for select to authenticated
  using (public.is_teacher());

drop policy if exists "professores leem arquivo" on public.project_archive;
create policy "professores leem arquivo" on public.project_archive
  for select to authenticated
  using (public.is_teacher());

-- auth_attempts: nenhuma política = ninguém lê nem escreve pelo navegador.

-- Permissões de execução das funções.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.create_project(text, text, text, boolean),
  public.recover_project(text),
  public.load_project(uuid),
  public.save_project(uuid, integer, integer, jsonb, integer, integer, integer[], integer, integer),
  public.leave_project(uuid),
  public.get_my_code(uuid),
  public.get_project_settings(uuid),
  public.is_teacher(),
  public.is_member(uuid),
  public.can_upload_recording(uuid),
  public.safe_uuid(text),
  public.teacher_reset_project(uuid),
  public.teacher_reset_class(text),
  public.teacher_clear_project(uuid),
  public.teacher_delete_project(uuid),
  public.teacher_delete_archive(bigint),
  public.teacher_restore_snapshot(bigint),
  public.teacher_set_class_setting(text, boolean)
to authenticated;

-- ---------------------------------------------------------------------
-- STORAGE: gravações de voz (bucket PRIVADO)
-- Caminho dos arquivos: <id do projeto>/<nome do arquivo>
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gravacoes', 'gravacoes', false, 3145728,
        array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "monstrinhos: dupla envia gravacao" on storage.objects;
create policy "monstrinhos: dupla envia gravacao" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'gravacoes'
    and public.can_upload_recording(public.safe_uuid((storage.foldername(name))[1]))
  );

drop policy if exists "monstrinhos: dupla e professor ouvem gravacao" on storage.objects;
create policy "monstrinhos: dupla e professor ouvem gravacao" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'gravacoes'
    and (public.is_member(public.safe_uuid((storage.foldername(name))[1])) or public.is_teacher())
  );

drop policy if exists "monstrinhos: dupla atualiza gravacao" on storage.objects;
create policy "monstrinhos: dupla atualiza gravacao" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'gravacoes'
    and public.can_upload_recording(public.safe_uuid((storage.foldername(name))[1]))
  );

drop policy if exists "monstrinhos: dupla e professor apagam gravacao" on storage.objects;
create policy "monstrinhos: dupla e professor apagam gravacao" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'gravacoes'
    and (public.is_member(public.safe_uuid((storage.foldername(name))[1])) or public.is_teacher())
  );

-- =====================================================================
-- CADASTRAR UM PROFESSOR (rode depois de criar o usuário em
-- Authentication → Users → Add user, com e-mail e senha):
--
--   insert into public.teachers (user_id, name)
--   select id, 'Prof. Márcio' from auth.users where email = 'SEU-EMAIL@exemplo.com'
--   on conflict do nothing;
-- =====================================================================
