-- Disposable PostgreSQL fixture, NOT a production bootstrap/migration.
-- Models the required legacy contact columns, existing records and permissive
-- historical grants. The production table's actual policies need operator review.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon,authenticated,service_role;

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  created_at timestamptz default now()
);
alter table public.contact_submissions enable row level security;
grant insert on public.contact_submissions to anon,authenticated;
-- A legacy column grant is deliberate: table-level REVOKE alone is insufficient.
grant select (name) on public.contact_submissions to anon;
create policy old_public_insert on public.contact_submissions
  for insert to anon,authenticated with check(true);
insert into public.contact_submissions(name,email,company,message)
  values ('Historical test only','legacy@example.invalid','Fixture','Historical message');

-- Unrelated policy sentinel: the enquiry migration must leave it alone.
create table public.cms_fixture (id int);
alter table public.cms_fixture enable row level security;
create policy preserved_cms on public.cms_fixture for select to anon using(true);
