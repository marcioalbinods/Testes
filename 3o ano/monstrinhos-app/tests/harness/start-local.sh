#!/usr/bin/env bash
# Sobe o ambiente LOCAL de testes (não é necessário para usar o jogo):
#   - PostgreSQL real do Supabase (imagem supabase/postgres)
#   - Storage real do Supabase (imagem supabase/storage-api)
#   - ponte de teste (Auth + REST) em http://127.0.0.1:54321
# Uso: bash tests/harness/start-local.sh
set -e
cd "$(dirname "$0")/../.."
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

docker network create sbnet >/dev/null 2>&1 || true
if ! docker ps --format '{{.Names}}' | grep -q '^sbdb$'; then
  docker start sbdb >/dev/null 2>&1 || docker run -d --name sbdb --network sbnet -e POSTGRES_PASSWORD=postgres -p 54322:5432 supabase/postgres:17.11.0.018 >/dev/null
fi
for i in $(seq 1 60); do PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -c 'select 1' >/dev/null 2>&1 && break; sleep 1; done
PGPASSWORD=postgres psql -q -h 127.0.0.1 -p 54322 -U supabase_admin -d postgres -c "alter role supabase_storage_admin with password 'postgres';" >/dev/null

if ! docker ps --format '{{.Names}}' | grep -q '^sbstorage$'; then
  docker start sbstorage >/dev/null 2>&1 || docker run -d --name sbstorage --network sbnet -p 54325:5000 \
    -e ANON_KEY=x -e SERVICE_KEY=x -e AUTH_JWT_SECRET=$JWT_SECRET -e PGRST_JWT_SECRET=$JWT_SECRET \
    -e DATABASE_URL=postgres://supabase_storage_admin:postgres@sbdb:5432/postgres -e FILE_SIZE_LIMIT=52428800 \
    -e STORAGE_BACKEND=file -e FILE_STORAGE_BACKEND_PATH=/var/lib/storage -e TENANT_ID=stub -e REGION=stub \
    -e GLOBAL_S3_BUCKET=stub -e ENABLE_IMAGE_TRANSFORMATION=false -e DB_INSTALL_ROLES=false supabase/storage-api:v1.90.1 >/dev/null
fi
for i in $(seq 1 60); do curl -s -o /dev/null http://127.0.0.1:54325/status && break; sleep 1; done

PGPASSWORD=postgres psql -q -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 54322 -U supabase_admin -d postgres -f tests/harness/prep-auth.sql 2>&1 | grep -v NOTICE || true
PGPASSWORD=postgres psql -q -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/migrations/20261112000000_monstrinhos.sql 2>&1 | grep -v NOTICE || true
echo "Banco e Storage prontos. Inicie a ponte: node tests/harness/gateway.mjs"
