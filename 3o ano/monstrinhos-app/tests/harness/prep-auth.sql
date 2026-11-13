-- Apenas para o ambiente de TESTE local: completa o esquema "auth" como no
-- Supabase real (no Supabase hospedado isso já existe).
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim', true), ''), nullif(current_setting('request.jwt.claims', true), ''))::jsonb
$$;
alter table auth.users add column if not exists is_anonymous boolean not null default false;
grant usage on schema auth to authenticated, anon;
-- Versões atuais (iguais às do Supabase hospedado):
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid
$$;
create or replace function auth.role() returns text language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'))::text
$$;
