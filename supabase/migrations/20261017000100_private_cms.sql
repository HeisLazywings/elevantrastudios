-- CMS authentication uses Supabase Auth, but CMS access is a separate allowlist.
-- First sign the intended user up through a trusted Auth administration flow,
-- then run as the database owner (replace the placeholder UUID):
-- insert into public.cms_admins (user_id) values ('YOUR-AUTH-USER-UUID');
-- No application role can add, update or remove allowlist members.

begin;

-- This migration extends an existing Supabase project. Refuse every collision
-- before making changes, including a bucket created for an unrelated purpose.
-- If this migration has already been applied, do not run it a second time.
do $preflight$
declare
  existing_tables text[];
begin
  if to_regclass('auth.users') is null or to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then
    raise exception 'CMS migration requires the existing Supabase Auth and Storage schemas. No changes were made.';
  end if;
  select array_agg(name) into existing_tables
    from (values ('public.cms_admins'), ('public.cms_entries'), ('public.cms_media')) as candidates(name)
    where to_regclass(name) is not null;
  if existing_tables is not null then
    raise exception 'CMS migration refused existing tables: %. No changes were made. Check migration history; do not rerun an already applied migration or remove existing data.', array_to_string(existing_tables, ', ')
      using errcode = '42P07';
  end if;
  if exists (select 1 from storage.buckets where id = 'cms-media' or name = 'cms-media') then
    raise exception 'CMS migration refused an existing cms-media bucket. Its files and settings were preserved. Review the existing project before applying CMS changes.'
      using errcode = '42P07';
  end if;
end;
$preflight$;

create table public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.cms_admins enable row level security;
revoke all on public.cms_admins from anon, authenticated;
grant select on public.cms_admins to authenticated;
create policy cms_admins_read_self on public.cms_admins
  for select to authenticated using (user_id = (select auth.uid()));

create function public.is_cms_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.cms_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_cms_admin() from public;
grant execute on function public.is_cms_admin() to anon, authenticated;

-- The SQL constraint mirrors the restricted Tiptap format. The application
-- validator additionally strips unknown attributes and bounds aggregate text.
create function public.cms_valid_rich_node(node jsonb, depth integer)
returns boolean language plpgsql immutable set search_path = ''
as $$
declare
  node_type text;
  child jsonb;
  mark jsonb;
  href text;
  seen_mark_types text[] := '{}';
begin
  if depth > 12 or jsonb_typeof(node) is distinct from 'object' then return false; end if;
  node_type := node ->> 'type';
  if node_type = 'text' then
    if jsonb_typeof(node -> 'text') is distinct from 'string'
      or length(node ->> 'text') not between 1 and 20000
      or node ? 'content' then return false; end if;
    if node ? 'marks' then
      if jsonb_typeof(node -> 'marks') is distinct from 'array' or jsonb_array_length(node -> 'marks') > 3 then return false; end if;
      for mark in select value from jsonb_array_elements(node -> 'marks') loop
        if mark ->> 'type' not in ('bold', 'italic', 'link') or mark ->> 'type' is null then return false; end if;
        if mark ->> 'type' = any(seen_mark_types) then return false; end if;
        seen_mark_types := array_append(seen_mark_types, mark ->> 'type');
        if mark ->> 'type' = 'link' then
          href := mark #>> '{attrs,href}';
          if href is null or length(href) > 2000 or href !~* '^(https?://|mailto:|tel:)' or href ~ '[[:space:][:cntrl:]]' then return false; end if;
        end if;
      end loop;
    end if;
    return true;
  end if;
  if node_type = 'image' then
    return coalesce(
      jsonb_typeof(node -> 'attrs') = 'object'
      and (node #>> '{attrs,mediaId}') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      and jsonb_typeof(node #> '{attrs,alt}') = 'string'
      and length(node #>> '{attrs,alt}') <= 500
      and jsonb_typeof(node #> '{attrs,caption}') = 'string'
      and length(node #>> '{attrs,caption}') <= 1000
      and not (node ? 'content'), false);
  end if;
  if node_type is null or node_type not in ('paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'listItem') then return false; end if;
  if node_type = 'heading' and coalesce(node #>> '{attrs,level}', '') not in ('2', '3') then return false; end if;
  if node_type = 'orderedList' and node #> '{attrs,start}' is not null then
    if jsonb_typeof(node #> '{attrs,start}') is distinct from 'number'
      or (node #>> '{attrs,start}') !~ '^[0-9]+$' then return false; end if;
    if (node #>> '{attrs,start}')::numeric not between 1 and 10000 then return false; end if;
  end if;
  if node -> 'content' is null then return node_type in ('paragraph', 'heading'); end if;
  if jsonb_typeof(node -> 'content') is distinct from 'array' then return false; end if;
  if node_type not in ('paragraph', 'heading') and jsonb_array_length(node -> 'content') = 0 then return false; end if;
  if node_type = 'listItem' and coalesce(node #>> '{content,0,type}', '') <> 'paragraph' then return false; end if;
  for child in select value from jsonb_array_elements(node -> 'content') loop
    if not public.cms_valid_rich_node(child, depth + 1) then return false; end if;
    if node_type in ('paragraph', 'heading') and child ->> 'type' <> 'text' then return false; end if;
    if node_type in ('bulletList', 'orderedList') and child ->> 'type' <> 'listItem' then return false; end if;
    if node_type = 'listItem' and child ->> 'type' not in ('paragraph', 'bulletList', 'orderedList', 'blockquote') then return false; end if;
    if node_type = 'blockquote' and child ->> 'type' in ('text', 'listItem') then return false; end if;
  end loop;
  return true;
end;
$$;

create function public.cms_valid_document(document jsonb)
returns boolean language plpgsql immutable set search_path = ''
as $$
declare
  node jsonb;
  total_nodes integer;
  total_text bigint;
begin
  if jsonb_typeof(document) is distinct from 'object'
    or document ->> 'type' is distinct from 'doc'
    or jsonb_typeof(document -> 'content') is distinct from 'array'
    or octet_length(document::text) > 500000 then return false; end if;
  for node in select value from jsonb_array_elements(document -> 'content') loop
    if node ->> 'type' in ('text', 'listItem') or not public.cms_valid_rich_node(node, 2) then return false; end if;
  end loop;
  with recursive nodes(value) as (
    select document
    union all
    select children.value from nodes
    cross join lateral jsonb_array_elements(coalesce(nodes.value -> 'content', '[]'::jsonb)) children
  ) select count(*), coalesce(sum(case when value ->> 'type' = 'text' then length(value ->> 'text') else 0 end), 0)
    into total_nodes, total_text from nodes;
  return total_nodes <= 2000 and total_text <= 120000;
end;
$$;

revoke all on function public.cms_valid_rich_node(jsonb, integer), public.cms_valid_document(jsonb) from public;
grant execute on function public.cms_valid_rich_node(jsonb, integer), public.cms_valid_document(jsonb) to authenticated;

create table public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('article', 'case-study', 'resource', 'client')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  slug text not null check (length(slug) between 1 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) between 1 and 300),
  summary text not null default '' check (length(summary) <= 1000),
  seo_title text not null default '' check (length(seo_title) <= 300),
  seo_description text not null default '' check (length(seo_description) <= 500),
  category text not null default '' check (length(category) <= 100),
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  featured boolean not null default false,
  publication_approved boolean not null default false,
  body jsonb not null default '{"type":"doc","content":[]}'::jsonb check (public.cms_valid_document(body)),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 200000),
  cover_media_id uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  constraint cms_entries_kind_slug_key unique (kind, slug),
  constraint cms_case_study_designation check (kind <> 'case-study' or coalesce(details ->> 'designation' in ('Concept Demonstration', 'Client engagement', 'Studio project'), false)),
  constraint cms_client_publication_approval check (status <> 'published' or publication_approved or (kind <> 'client' and not (kind = 'case-study' and details ->> 'designation' = 'Client engagement')))
);

create index cms_entries_publication_idx on public.cms_entries (kind, status, published_at desc);
create index cms_entries_featured_idx on public.cms_entries (featured) where status = 'published';

create table public.cms_media (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.cms_entries(id) on delete restrict,
  storage_path text not null unique,
  filename text not null check (length(filename) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf')),
  size_bytes integer not null check (size_bytes between 1 and 4194304),
  alt text not null default '' check (length(alt) <= 500),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint cms_media_scoped_path check (
    storage_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif|pdf)$'
    and split_part(storage_path, '/', 1) = entry_id::text
    and split_part(split_part(storage_path, '/', 2), '.', 1) = id::text
  ),
  constraint cms_media_mime_extension check (
    (mime_type = 'image/jpeg' and storage_path ~ '\.(jpg|jpeg)$')
    or (mime_type = 'image/png' and storage_path ~ '\.png$')
    or (mime_type = 'image/webp' and storage_path ~ '\.webp$')
    or (mime_type = 'image/gif' and storage_path ~ '\.gif$')
    or (mime_type = 'application/pdf' and storage_path ~ '\.pdf$')
  )
);

create index cms_media_entry_idx on public.cms_media(entry_id);
alter table public.cms_entries add constraint cms_entries_cover_media_fk foreign key (cover_media_id) references public.cms_media(id) on delete restrict;

-- An unused upload on a live entry is still private. Public reads require an
-- exact published-content reference, never a substring match against JSON text.
create function public.cms_entry_uses_media(entry public.cms_entries, media_id uuid)
returns boolean language sql immutable set search_path = ''
as $$
  select coalesce(
    (entry).cover_media_id = media_id
    or ((entry).kind = 'resource' and (entry).details ->> 'downloadMediaId' = media_id::text)
    or ((entry).kind = 'client' and (entry).details ->> 'logoMediaId' = media_id::text)
    or jsonb_path_exists((entry).body, '$.** ? (@.type == "image" && @.attrs.mediaId == $id)', jsonb_build_object('id', media_id::text)),
    false
  );
$$;
revoke all on function public.cms_entry_uses_media(public.cms_entries, uuid) from public;
grant execute on function public.cms_entry_uses_media(public.cms_entries, uuid) to anon, authenticated;

create function public.cms_touch_entry()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.id := old.id;
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
    new.published_at := now();
  end if;
  if new.status = 'draft' then new.published_at := null; end if;
  return new;
end;
$$;
create trigger cms_entries_touch before insert or update on public.cms_entries for each row execute function public.cms_touch_entry();

-- References are entry-scoped. Updating an entry locks its media references;
-- deleting media locks the owning entry, so concurrent edits cannot leave a
-- published document pointing at an asset that was deleted in another request.
create function public.cms_validate_entry_media()
returns trigger language plpgsql set search_path = ''
as $$
declare
  media_id uuid;
  media_ids uuid[] := '{}';
  image_ids uuid[] := '{}';
  media_mime text;
  node jsonb;
begin
  if new.cover_media_id is not null then
    media_ids := array_append(media_ids, new.cover_media_id);
    image_ids := array_append(image_ids, new.cover_media_id);
  end if;
  for node in select value from jsonb_path_query(new.body, '$.** ? (@.type == "image")') as nodes(value) loop
    begin media_id := (node #>> '{attrs,mediaId}')::uuid;
    exception when invalid_text_representation then raise exception 'Invalid body media reference' using errcode = '23514'; end;
    media_ids := array_append(media_ids, media_id);
    image_ids := array_append(image_ids, media_id);
  end loop;
  if new.details ->> 'downloadMediaId' is not null and new.details ->> 'downloadMediaId' <> '' then
    begin media_id := (new.details ->> 'downloadMediaId')::uuid;
    exception when invalid_text_representation then raise exception 'Invalid download media reference' using errcode = '23514'; end;
    media_ids := array_append(media_ids, media_id);
  end if;
  if new.details ->> 'logoMediaId' is not null and new.details ->> 'logoMediaId' <> '' then
    begin media_id := (new.details ->> 'logoMediaId')::uuid;
    exception when invalid_text_representation then raise exception 'Invalid logo media reference' using errcode = '23514'; end;
    media_ids := array_append(media_ids, media_id);
    image_ids := array_append(image_ids, media_id);
  end if;
  foreach media_id in array media_ids loop
    select mime_type into media_mime from public.cms_media where id = media_id and entry_id = new.id for key share;
    if not found then raise exception 'Media must belong to the entry being edited' using errcode = '23503'; end if;
    if media_id = any(image_ids) and media_mime not like 'image/%' then raise exception 'Cover, logo and body images must use image media' using errcode = '23514'; end if;
  end loop;
  return new;
end;
$$;
create trigger cms_entries_validate_media before insert or update on public.cms_entries for each row execute function public.cms_validate_entry_media();

create function public.cms_protect_media()
returns trigger language plpgsql set search_path = ''
as $$
declare
  parent public.cms_entries;
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.entry_id <> old.entry_id or new.storage_path <> old.storage_path or new.mime_type <> old.mime_type or new.size_bytes <> old.size_bytes then
      raise exception 'Media identity and uploaded file attributes are immutable' using errcode = '23514';
    end if;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    return new;
  end if;
  select * into parent from public.cms_entries where id = old.entry_id for update;
  if found and public.cms_entry_uses_media(parent, old.id) then
    raise exception 'Remove this media from the entry before deleting it' using errcode = '23503';
  end if;
  return old;
end;
$$;
create trigger cms_media_protect before update or delete on public.cms_media for each row execute function public.cms_protect_media();

revoke all on function public.cms_touch_entry(), public.cms_validate_entry_media(), public.cms_protect_media() from public;

alter table public.cms_entries enable row level security;
alter table public.cms_media enable row level security;
revoke all on public.cms_entries, public.cms_media from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.cms_entries, public.cms_media to anon;
grant select, insert, update, delete on public.cms_entries, public.cms_media to authenticated;

create policy cms_entries_public_read on public.cms_entries
  for select to anon, authenticated using (
    status = 'published' and (
      publication_approved or (kind <> 'client' and not (kind = 'case-study' and details ->> 'designation' = 'Client engagement'))
    )
  );
create policy cms_entries_admin_all on public.cms_entries
  for all to authenticated using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));
create policy cms_media_public_read on public.cms_media
  for select to anon, authenticated using (exists (
    select 1 from public.cms_entries entry where entry.id = entry_id and entry.status = 'published'
      and (entry.publication_approved or (entry.kind <> 'client' and not (entry.kind = 'case-study' and entry.details ->> 'designation' = 'Client engagement')))
      and public.cms_entry_uses_media(entry, cms_media.id)
  ));
create policy cms_media_admin_all on public.cms_media
  for all to authenticated using ((select public.is_cms_admin())) with check ((select public.is_cms_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', false, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);

create policy cms_storage_public_read on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'cms-media' and exists (
      select 1 from public.cms_media media join public.cms_entries entry on entry.id = media.entry_id
      where media.storage_path = name and entry.status = 'published'
        and (entry.publication_approved or (entry.kind <> 'client' and not (entry.kind = 'case-study' and entry.details ->> 'designation' = 'Client engagement')))
        and public.cms_entry_uses_media(entry, media.id)
    )
  );
create policy cms_storage_admin_read on storage.objects
  for select to authenticated using (bucket_id = 'cms-media' and (select public.is_cms_admin()));
create policy cms_storage_admin_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'cms-media' and (select public.is_cms_admin())
    and exists (select 1 from public.cms_media media where media.storage_path = name)
  );
-- Files are immutable: replace an image by uploading a new object and updating
-- the entry reference. No UPDATE policy means an existing object cannot change
-- its contents while keeping the same reviewed identity.
create policy cms_storage_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'cms-media' and (select public.is_cms_admin()));

comment on table public.cms_admins is 'Database-owner-managed CMS allowlist. Supabase Auth registration alone never grants CMS access.';
comment on table public.cms_entries is 'Structured content. Public API readers see only published entries with required publication permission.';
comment on table public.cms_media is 'Private-bucket media metadata. Anonymous access depends on the parent entry remaining publicly eligible.';

commit;
