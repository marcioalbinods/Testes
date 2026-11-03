#!/usr/bin/env bash
# Testa as migrações SQL e as regras de segurança (RLS) em um PostgreSQL local temporário.
# Requer PostgreSQL 15+ instalado (initdb, pg_ctl, psql).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
DATA="$(mktemp -d)"
PORT="${PGPORT_TEST:-54329}"
RUN_AS=()
if [ "$(id -u)" = "0" ]; then RUN_AS=(sudo -u postgres); chown postgres "$DATA"; fi
cleanup() { "${RUN_AS[@]}" "$PGBIN/pg_ctl" -D "$DATA" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DATA"; }
trap cleanup EXIT
"${RUN_AS[@]}" "$PGBIN/initdb" -D "$DATA" -U postgres -A trust >/dev/null
"${RUN_AS[@]}" "$PGBIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp -c listen_addresses=''" -l "$DATA/log" start >/dev/null
for i in $(seq 1 30); do "$PGBIN/pg_isready" -h /tmp -p "$PORT" >/dev/null 2>&1 && break; sleep 0.3; done
PSQL=("$PGBIN/psql" -h /tmp -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X -t -A -o /dev/null)
"${PSQL[@]}" -f "$ROOT/supabase/tests/00_supabase_shim.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "Aplicando $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done
for f in "$ROOT"/supabase/tests/[1-9]*.sql; do
  echo "Executando $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done
echo "OK: migrações e testes de segurança do banco passaram."
