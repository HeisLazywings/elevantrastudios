#!/usr/bin/env bash
set -euo pipefail

# This is an isolated PostgreSQL policy/migration test. It never accepts a hosted
# database URL or reuses an existing container. No host ports are published.
# Auth/Storage schemas are fixtures; their real HTTP services are not tested.
task_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
task_image='postgres:17-bookworm@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826'
task_container_id=''
task_log_dir="$(mktemp -d)"

cleanup() {
  if [[ -n "$task_container_id" ]]; then
    docker rm -f "$task_container_id" > /dev/null 2>&1 || true
  fi
  rm -rf "$task_log_dir"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

for task_command in docker python3; do
  if ! command -v "$task_command" > /dev/null; then
    echo "Required test tool is unavailable: $task_command" >&2
    exit 1
  fi
done

task_container_name="elevantra-cms-fixture-$(python3 -c 'import uuid; print(uuid.uuid4().hex[:12])')"
echo 'Preparing a new isolated PostgreSQL 17 fixture (no host ports).'
if ! docker pull "$task_image" > "$task_log_dir/image.log" 2>&1; then
  cat "$task_log_dir/image.log" >&2
  exit 1
fi
task_container_id="$(docker run --rm -d --name "$task_container_name" \
  --label com.elevantra.test-fixture=cms \
  -e POSTGRES_HOST_AUTH_METHOD=trust "$task_image")"

task_ready=false
for ((task_attempt = 0; task_attempt < 60; task_attempt++)); do
  if docker exec "$task_container_id" pg_isready -U postgres > /dev/null 2>&1; then
    task_ready=true
    break
  fi
  sleep 1
done
if [[ "$task_ready" != true ]]; then
  echo 'The disposable PostgreSQL fixture did not become ready.' >&2
  exit 1
fi

# pgTAP is a pure SQL extension. Extract Debian's signed-repository package
# without installing its PostgreSQL 15 server dependency, then load the SQL into
# PostgreSQL 17. Package checksums, repository signatures and TLS remain enabled.
# The image's unrelated PGDG repository is unnecessary for these Debian files.
if ! docker exec "$task_container_id" sh -ec '
  rm -f /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
  cd /tmp
  apt-get download postgresql-15-pgtap
  for task_package in /tmp/postgresql-15-pgtap_*.deb; do
    dpkg-deb -x "$task_package" /tmp/pgtap-package
  done
  cp /tmp/pgtap-package/usr/share/postgresql/15/extension/pgtap* /usr/share/postgresql/17/extension/
' > "$task_log_dir/pgtap.log" 2>&1; then
  cat "$task_log_dir/pgtap.log" >&2
  exit 1
fi

docker exec -i "$task_container_id" psql -U postgres -v ON_ERROR_STOP=1 -q <<'SQL'
create role anon nologin;
create role authenticated nologin;
SQL

python3 "$task_repo_root/supabase/tests/fixture/check_migration.py" "$task_container_id"
echo 'Passed: 44 database assertions and 5 migration-safety scenarios.'
echo 'Hosted Supabase Auth and Storage HTTP flows require separate configured-project verification.'
