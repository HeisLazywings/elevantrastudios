-- Run with `supabase test db`. All fixtures roll back; no credentials are used.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
grant usage on schema extensions to anon, authenticated;
select plan(44);

select has_table('public', 'cms_admins', 'CMS allowlist exists');
select has_table('public', 'cms_entries', 'CMS content exists');
select has_table('public', 'cms_media', 'CMS media metadata exists');
select is((select public from storage.buckets where id = 'cms-media'), false, 'CMS bucket is private');
select is((select file_size_limit from storage.buckets where id = 'cms-media'), 4194304::bigint, 'Storage upload cap matches the 4 MiB API limit');

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'cms-admin@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'cms-outsider@example.invalid');
insert into public.cms_admins (user_id) values ('11111111-1111-4111-8111-111111111111');

insert into public.cms_entries (id, kind, status, slug, title, details) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'article', 'published', 'public-article', 'Public article', '{}'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'article', 'draft', 'draft-article', 'Draft article', '{}'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'client', 'draft', 'private-client', 'Private client', '{}'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'case-study', 'published', 'concept-study', 'Concept study', '{"designation":"Concept Demonstration"}'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'case-study', 'draft', 'client-study', 'Client study', '{"designation":"Client engagement"}');

insert into public.cms_media (id, entry_id, storage_path, filename, mime_type, size_bytes) values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1/dddddddd-dddd-4ddd-8ddd-ddddddddddd1.png', 'public.png', 'image/png', 100),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2/dddddddd-dddd-4ddd-8ddd-ddddddddddd2.png', 'draft.png', 'image/png', 100),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd3', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1/dddddddd-dddd-4ddd-8ddd-ddddddddddd3.png', 'unused.png', 'image/png', 100);

update public.cms_entries set cover_media_id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
  body = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Unused media UUID dddddddd-dddd-4ddd-8ddd-ddddddddddd3 is only ordinary text."}]}]}'
  where slug = 'public-article';

insert into storage.objects(bucket_id, name) values
  ('cms-media', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1/dddddddd-dddd-4ddd-8ddd-ddddddddddd1.png'),
  ('cms-media', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2/dddddddd-dddd-4ddd-8ddd-ddddddddddd2.png'),
  ('cms-media', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1/dddddddd-dddd-4ddd-8ddd-ddddddddddd3.png');

select throws_ok($$update public.cms_entries set status = 'published' where slug = 'private-client'$$, '23514', null, 'Client profiles require publication approval');
select throws_ok($$update public.cms_entries set status = 'published' where slug = 'client-study'$$, '23514', null, 'Client case studies require publication approval');
select throws_ok($$insert into public.cms_entries(kind, slug, title, body) values ('article', 'unsafe-document', 'Unsafe', '{"type":"doc","content":[{"type":"html","text":"<script>bad()</script>"}]}')$$, '23514', null, 'Arbitrary HTML nodes are rejected');
select throws_ok($$insert into public.cms_entries(kind, slug, title, body) values ('article', 'unsafe-link', 'Unsafe', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Link","marks":[{"type":"link","attrs":{"href":"javascript:alert(1)"}}]}]}]}')$$, '23514', null, 'Unsafe URL schemes are rejected');
select throws_ok($$update public.cms_entries set cover_media_id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd2' where slug = 'public-article'$$, '23503', null, 'Cover media cannot be borrowed from another entry');
select throws_ok($$insert into public.cms_media(id,entry_id,storage_path,filename,mime_type,size_bytes) values ('dddddddd-dddd-4ddd-8ddd-ddddddddddd4','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1/dddddddd-dddd-4ddd-8ddd-ddddddddddd4.png','large.png','image/png',4194305)$$, '23514', null, 'Media metadata cannot exceed the 4 MiB upload cap');

set local role anon;
select is((select count(*)::integer from public.cms_entries), 2, 'Anonymous readers see only published eligible entries');
select is((select count(*)::integer from public.cms_media), 1, 'Anonymous readers cannot see draft media');
select is((select count(*)::integer from public.cms_media where id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd3'), 0, 'Unreferenced uploads on published entries stay private, even when their UUID occurs in text');
select is((select count(*)::integer from storage.objects where bucket_id = 'cms-media'), 1, 'Storage RLS exposes only referenced published objects');
select is((select count(*)::integer from storage.objects where name like '%dddddddd-dddd-4ddd-8ddd-ddddddddddd3%'), 0, 'Unused objects remain private in storage too');
-- Permission checks use throws_ok instead of querying a table anon cannot read.
select throws_ok($$select * from public.cms_admins$$, '42501', null, 'Anonymous readers cannot inspect the allowlist');
select throws_ok($$insert into public.cms_entries(kind, slug, title) values ('article', 'anon-write', 'Denied')$$, '42501', null, 'Anonymous writes are denied');
reset role;

select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
set local role authenticated;
select is(public.is_cms_admin(), false, 'Auth registration alone does not grant CMS access');
select is((select count(*)::integer from public.cms_entries), 2, 'Unapproved signed-in readers still see public content only');
select throws_ok($$insert into public.cms_entries(kind, slug, title) values ('article', 'outsider-write', 'Denied')$$, '42501', null, 'Unapproved users cannot create entries');
select throws_ok($$insert into public.cms_admins(user_id) values ('22222222-2222-4222-8222-222222222222')$$, '42501', null, 'Unapproved users cannot register themselves as admins');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('cms-media','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1/dddddddd-dddd-4ddd-8ddd-ddddddddddd4.png')$$, '42501', null, 'Unapproved users cannot upload objects');
select is((select count(*)::integer from public.cms_admins), 0, 'Unapproved users cannot inspect approved identities');
reset role;

select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
set local role authenticated;
select is(public.is_cms_admin(), true, 'Allowlisted user is an admin');
select is((select count(*)::integer from public.cms_entries), 5, 'Admins can read drafts');
select is((select count(*)::integer from public.cms_media), 3, 'Admins can read draft and unreferenced media');
select is((select count(*)::integer from storage.objects where bucket_id = 'cms-media'), 3, 'Admins can read draft and unused storage objects');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('cms-media','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1/dddddddd-dddd-4ddd-8ddd-ddddddddddd4.png')$$, '42501', null, 'Even admins must create scoped metadata before upload');
with changed as (update storage.objects set name = name where name like '%dddddddd-dddd-4ddd-8ddd-ddddddddddd1%' returning 1)
  select is(count(*)::integer, 0, 'Uploaded objects cannot be overwritten through UPDATE') from changed;
select lives_ok($$insert into public.cms_entries(kind, slug, title) values ('resource', 'admin-resource', 'Admin resource')$$, 'Admins can create entries');
select lives_ok($$update public.cms_entries set title = 'Edited resource' where slug = 'admin-resource'$$, 'Admins can update entries');
select lives_ok($$delete from public.cms_entries where slug = 'admin-resource'$$, 'Admins can delete entries without media');
select throws_ok($$insert into public.cms_entries(kind, slug, title) values ('article', 'public-article', 'Duplicate')$$, '23505', null, 'Slugs are unique within a content kind');
select lives_ok($$update public.cms_entries set cover_media_id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1' where slug = 'public-article'$$, 'Admins can attach owned image media');
select throws_ok($$delete from public.cms_media where id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1'$$, '23503', null, 'Referenced media cannot be deleted');
select lives_ok($$delete from public.cms_media where id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd3'$$, 'Unused metadata can be deleted');
select lives_ok($$delete from storage.objects where name like '%dddddddd-dddd-4ddd-8ddd-ddddddddddd3%'$$, 'Admin storage cleanup works after metadata deletion');
select throws_ok($$delete from public.cms_entries where slug = 'draft-article'$$, '23503', null, 'Entries with media cannot be deleted before cleanup');
select lives_ok($$update public.cms_entries set publication_approved = true, status = 'published' where slug = 'private-client'$$, 'Approved client profiles can be published');
select lives_ok($$update public.cms_entries set status = 'draft' where slug = 'public-article'$$, 'Published entries can be returned to draft');
reset role;

set local role anon;
select is((select count(*)::integer from public.cms_media), 0, 'Unpublishing immediately hides associated media metadata');
select is((select count(*)::integer from storage.objects where bucket_id = 'cms-media'), 0, 'Unpublishing immediately hides associated storage objects');
select is((select count(*)::integer from public.cms_entries where slug = 'private-client'), 1, 'Approved published client profile is publicly readable');
reset role;

select * from finish();
rollback;
