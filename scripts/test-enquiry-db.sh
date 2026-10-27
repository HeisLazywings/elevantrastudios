#!/usr/bin/env bash
set -euo pipefail

# This runner ONLY creates its own disposable PostgreSQL fixture. It never
# accepts a database URL, publishes ports or connects the container to a network.
task_repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
task_image='postgres:17-bookworm@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826'
task_container_id=''
task_log_dir="$(mktemp -d)"
task_docker="$(command -v docker || true)"
if [[ -z "$task_docker" && -x /usr/local/bin/docker ]]; then task_docker='/usr/local/bin/docker'; fi
cleanup() {
  if [[ -n "$task_container_id" ]]; then
    "$task_docker" rm -f "$task_container_id" > /dev/null 2>&1 || true
  fi
  rm -rf "$task_log_dir"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
if [[ -z "$task_docker" ]] || ! command -v python3 > /dev/null; then
  echo 'Required tools are Docker and python3.' >&2
  exit 1
fi
# Fetch only if the exact pinned image is not already available locally.
if ! "$task_docker" image inspect "$task_image" > /dev/null 2>&1; then
  if ! "$task_docker" pull "$task_image" > "$task_log_dir/image.log" 2>&1; then
    cat "$task_log_dir/image.log" >&2
    exit 1
  fi
fi
task_container_name="elevantra-enquiry-fixture-$(python3 -c 'import uuid; print(uuid.uuid4().hex[:12])')"
echo 'Preparing isolated PostgreSQL 17 enquiry fixture (network disabled, no ports).'
task_container_id="$("$task_docker" run --rm -d --network none --name "$task_container_name" \
  --label com.elevantra.test-fixture=enquiry \
  -e POSTGRES_HOST_AUTH_METHOD=trust "$task_image")"
task_ready=false
for ((task_attempt=0; task_attempt<30; task_attempt++)); do
  if "$task_docker" exec "$task_container_id" pg_isready -U postgres > /dev/null 2>&1; then
    task_ready=true
    break
  fi
  sleep 1
done
if [[ "$task_ready" != true ]]; then
  echo 'The disposable database did not become ready.' >&2
  exit 1
fi
for task_file in \
  supabase/tests/fixture/enquiry-base.sql \
  supabase/migrations/20261027000100_enquiry_pipeline.sql \
  supabase/tests/enquiry.sql; do
  if ! "$task_docker" exec -i "$task_container_id" psql -U postgres -v ON_ERROR_STOP=1 -q \
    < "$task_repo_root/$task_file" > "$task_log_dir/sql.log" 2>&1; then
    cat "$task_log_dir/sql.log" >&2
    exit 1
  fi
done
# The SQL suite uses transactional assertions, with no pgTAP download needed.
rg 'enquiry database assertions passed' "$task_log_dir/sql.log" 2>/dev/null \
  || python3 -c 'import sys; print(next(line.strip() for line in open(sys.argv[1]) if "enquiry database assertions passed" in line))' "$task_log_dir/sql.log"
python3 "$task_repo_root/supabase/tests/fixture/check-enquiry-concurrency.py" "$task_container_name" "$task_docker"
echo 'Passed: database/privacy assertions, concurrent intake/claim limits, historical preservation and atomic migration refusal.'
echo 'Hosted Supabase schema/configuration and real Resend delivery require separate configured-project verification.'
