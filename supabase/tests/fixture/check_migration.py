"""Check additive CMS migration safety on an explicitly chosen disposable DB.

Run through scripts/test-cms-db.sh, which owns a fresh disposable container.

The container needs PostgreSQL 17, pgTAP's SQL extension files, and cluster roles
anon/authenticated. This creates uniquely named temporary databases and removes
only those databases. It never resets the container's existing databases and
does not connect to a hosted Supabase project. The standard Supabase regression
suite remains `supabase test db`.
"""

from pathlib import Path
import re
import subprocess
import sys
import uuid


ROOT = Path(__file__).resolve().parents[3]
MIGRATION = (ROOT / "supabase/migrations/20261017000100_private_cms.sql").read_text()
REGRESSION = (ROOT / "supabase/tests/cms.sql").read_text()
FIXTURE = """
create schema auth;
create schema storage;
create schema extensions;
create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create table storage.buckets(id text primary key, name text not null,
  public boolean not null default false, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id), name text not null, unique(bucket_id,name));
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant select on storage.objects to anon;
grant select,insert,update,delete on storage.objects to authenticated;
create table public.existing_contact_fixture(id integer primary key, message text not null);
insert into public.existing_contact_fixture values (1, 'Pre-existing contact');
insert into auth.users values
  ('33333333-3333-4333-8333-333333333333', 'existing-user@example.invalid');
insert into storage.buckets values
  ('preexisting-assets', 'preexisting-assets', true, 12345, array['application/pdf']);
"""
SENTINELS = """select jsonb_build_object(
  'contacts', (select jsonb_agg(to_jsonb(row)) from public.existing_contact_fixture row),
  'auth', (select jsonb_agg(to_jsonb(row)) from auth.users row
    where id='33333333-3333-4333-8333-333333333333'),
  'assets', (select to_jsonb(bucket) from storage.buckets bucket where id='preexisting-assets')
)::text;"""


def main(container):
    created = []

    def sql(database, statement, succeeds=True):
        result = subprocess.run(
            ["docker", "exec", "-i", container, "psql", "-U", "postgres", "-d", database,
             "-v", "ON_ERROR_STOP=1", "-At"],
            input=statement, text=True, capture_output=True, check=False,
        )
        if succeeds and result.returncode:
            raise RuntimeError(result.stderr)
        return result

    def output(database, query):
        return sql(database, query).stdout.strip()

    def database(label):
        name = "cms_fixture_" + label + "_" + uuid.uuid4().hex[:10]
        sql("postgres", 'create database "' + name + '";')
        created.append(name)
        sql(name, FIXTURE)
        return name

    def refuses(name, message):
        result = sql(name, MIGRATION, succeeds=False)
        assert result.returncode and message in result.stderr, result.stderr

    try:
        name = database("bucket")
        sql(name, "insert into storage.buckets values ('cms-media','cms-media',true,54321,array['application/pdf']);")
        query = "select to_jsonb(bucket)::text from storage.buckets bucket where id='cms-media';"
        before, sentinels = output(name, query), output(name, SENTINELS)
        refuses(name, "refused an existing cms-media bucket")
        assert output(name, query) == before
        assert output(name, "select count(*) from pg_tables where schemaname='public' and tablename like 'cms_%';") == "0"
        assert output(name, SENTINELS) == sentinels
        print("PASS: bucket collision preserves files/settings and existing contact/Auth/Storage data")

        name = database("table")
        sql(name, "create table public.cms_entries(existing_value text); insert into public.cms_entries values('Existing content');")
        sentinels = output(name, SENTINELS)
        refuses(name, "refused existing tables")
        assert output(name, "select existing_value from public.cms_entries;") == "Existing content"
        assert output(name, "select count(*) from pg_tables where schemaname='public' and tablename in ('cms_admins','cms_media');") == "0"
        assert output(name, "select count(*) from storage.buckets where id='cms-media';") == "0"
        assert output(name, SENTINELS) == sentinels
        print("PASS: table collision preserves rows and creates no partial CMS objects")

        name = database("rollback")
        sql(name, "create function public.is_cms_admin() returns boolean language sql as $$ select false; $$;")
        sentinels = output(name, SENTINELS)
        refuses(name, "already exists")
        assert output(name, "select count(*) from pg_tables where schemaname='public' and tablename like 'cms_%';") == "0"
        assert output(name, "select public.is_cms_admin();") == "f"
        assert output(name, SENTINELS) == sentinels
        print("PASS: a later collision rolls back every prior migration write")

        name = database("fresh")
        sentinels = output(name, SENTINELS)
        sql(name, MIGRATION)
        assert output(name, SENTINELS) == sentinels
        result = sql(name, REGRESSION)
        assert "not ok" not in result.stdout and "1..44" in result.stdout
        assert len(re.findall(r"^ok \d+", result.stdout, re.M)) == 44
        print("PASS: fresh additive migration preserves existing data; 44 pgTAP checks pass")
        query = "select jsonb_agg(to_jsonb(bucket) order by id)::text from storage.buckets bucket;"
        before = output(name, query)
        refuses(name, "refused existing tables")
        assert output(name, query) == before and output(name, SENTINELS) == sentinels
        print("PASS: already-applied migration refuses a second run before writes")
    finally:
        for name in created:
            sql("postgres", 'drop database "' + name + '" with (force);')


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Pass the name of the disposable PostgreSQL Docker fixture container.")
    main(sys.argv[1])
