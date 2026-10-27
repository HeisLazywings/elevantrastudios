-- Additive replacement of the public browser-write/contact-email workflow.
-- Apply once to the EXISTING project after reviewing the live schema/policies.
-- No existing enquiry is updated/deleted; CMS/Auth objects are not changed.
begin;

do $preflight$
declare
  required_column text;
  column_type text;
begin
  if to_regclass('public.contact_submissions') is null then
    raise exception 'The existing contact_submissions table is required; inspect the project before applying this migration.';
  end if;
  foreach required_column in array array['name','email','company','message'] loop
    select data_type into column_type from information_schema.columns
      where table_schema = 'public' and table_name = 'contact_submissions' and column_name = required_column;
    if column_type is null or column_type not in ('text','character varying') then
      raise exception 'Unsupported existing contact_submissions.% type; review live schema before migration. No changes made.', required_column;
    end if;
  end loop;
  -- Intake supplies the four legacy text fields plus its new columns. An
  -- unrelated mandatory column without a generated/default value would make
  -- every post-migration insert fail; refuse it before altering anything.
  if exists (select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'contact_submissions'
        and column_name not in ('name','email','company','message')
        and is_nullable = 'NO' and column_default is null
        and is_identity = 'NO' and is_generated = 'NEVER') then
    raise exception 'Unsupported required contact_submissions column without a default. Review the live schema before migration; no changes made.';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'contact_submissions'
      and column_name in ('submission_id','budget','submitted_at'))
    or to_regclass('public.contact_notifications') is not null
    or to_regclass('public.contact_intake_limits') is not null then
    raise exception 'Enquiry pipeline objects already exist. Check migration history and preserve existing data; do not rerun.';
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    raise exception 'The existing Supabase service_role is required.';
  end if;
end;
$preflight$;

alter table public.contact_submissions
  add column submission_id uuid,
  add column budget text,
  add column submitted_at timestamptz,
  add constraint contact_submissions_submission_id_key unique (submission_id);

-- New nullable columns leave all historical rows exactly as they were.
create table public.contact_notifications (
  submission_id uuid primary key references public.contact_submissions(submission_id) on delete restrict,
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  state text not null default 'pending' check (state in ('pending','sending','failed','accepted')),
  attempts integer not null default 0 check (attempts between 0 and 3),
  claim_token uuid,
  lease_until timestamptz,
  first_attempt_at timestamptz,
  last_attempt_at timestamptz,
  accepted_at timestamptz,
  provider_message_id text,
  last_error_code text,
  request_payload jsonb,
  created_at timestamptz not null default now(),
  constraint contact_notification_acceptance check (
    (state <> 'accepted') or (provider_message_id is not null and accepted_at is not null)
  )
);
create index contact_notifications_failed_created_idx
  on public.contact_notifications (created_at) where state in ('pending','failed','sending');

-- Only salted fingerprints and short-lived counters; never raw IP addresses.
create table public.contact_intake_limits (
  scope text not null check (scope in ('global','network','email')),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  primary key (scope,fingerprint,window_start)
);
create index contact_intake_limits_expiry_idx on public.contact_intake_limits(window_start);

alter table public.contact_submissions enable row level security;
alter table public.contact_notifications enable row level security;
alter table public.contact_intake_limits enable row level security;
-- Existing contact policies are preserved for audit, but public roles lose table
-- privileges. Public intake must pass through the validated, rate-limited function.
-- No policy or privilege on cms_* / Auth / Storage is touched.
revoke all on public.contact_submissions, public.contact_notifications, public.contact_intake_limits from public, anon, authenticated;
-- Table-level REVOKE does not erase legacy column grants; close those too.
do $column_privileges$
declare c record;
begin
  for c in select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'contact_submissions' loop
    execute format('revoke select (%1$I), insert (%1$I), update (%1$I), references (%1$I) on public.contact_submissions from public, anon, authenticated', c.column_name);
  end loop;
end;
$column_privileges$;

create function public.accept_enquiry(
  p_submission_id uuid, p_payload jsonb, p_payload_hash text,
  p_network_hash text, p_email_hash text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  existing_hash text;
  existing_received timestamptz;
  received timestamptz := clock_timestamp();
  bucket timestamptz;
  hit_count integer;
begin
  if p_submission_id is null or jsonb_typeof(p_payload) is distinct from 'object'
    or p_payload_hash is null or p_payload_hash !~ '^[0-9a-f]{64}$'
    or p_network_hash is null or p_network_hash !~ '^[0-9a-f]{64}$'
    or p_email_hash is null or p_email_hash !~ '^[0-9a-f]{64}$'
    or jsonb_typeof(p_payload->'name') is distinct from 'string'
    or jsonb_typeof(p_payload->'email') is distinct from 'string'
    or jsonb_typeof(p_payload->'company') is distinct from 'string'
    or jsonb_typeof(p_payload->'budget') is distinct from 'string'
    or jsonb_typeof(p_payload->'message') is distinct from 'string'
    or length(p_payload->>'name') not between 1 and 120
    or length(p_payload->>'email') not between 3 and 254
    or length(p_payload->>'company') > 200
    or length(p_payload->>'budget') > 100
    or length(p_payload->>'message') not between 1 and 5000 then
    raise exception 'Invalid normalized enquiry payload' using errcode = '22023';
  end if;
  -- Serialize one receipt even before its row exists. The UNIQUE constraint is
  -- the durable backstop; retries do not create another enquiry or consume quota.
  perform pg_advisory_xact_lock(hashtextextended(p_submission_id::text, 0));
  select n.payload_hash, s.submitted_at into existing_hash, existing_received
    from public.contact_notifications n join public.contact_submissions s using (submission_id)
    where n.submission_id = p_submission_id;
  if found then
    return jsonb_build_object('kind',case when existing_hash = p_payload_hash then 'existing' else 'conflict' end,
      'receipt_id',p_submission_id,'received_at',existing_received);
  end if;

  -- Opportunistic bounded cleanup never touches enquiries or notification history.
  delete from public.contact_intake_limits where ctid in (
    select ctid from public.contact_intake_limits where window_start < received - interval '2 days'
      order by window_start limit 100
  );
  -- Shared cap bounds total email-spend attempts even when client network headers
  -- are spoofed or addresses rotate. This low-volume studio accepts 30/hour.
  bucket := to_timestamp(floor(extract(epoch from received) / 3600) * 3600);
  insert into public.contact_intake_limits as limits(scope,fingerprint,window_start,hits)
    values ('global',repeat('0',64),bucket,1)
    on conflict (scope,fingerprint,window_start) do update set hits = limits.hits + 1 where limits.hits < 30
    returning hits into hit_count;
  if hit_count is null then return jsonb_build_object('kind','limited'); end if;

  bucket := to_timestamp(floor(extract(epoch from received) / 900) * 900);
  hit_count := null;
  insert into public.contact_intake_limits as limits(scope,fingerprint,window_start,hits)
    values ('network',p_network_hash,bucket,1)
    on conflict (scope,fingerprint,window_start) do update set hits = limits.hits + 1 where limits.hits < 5
    returning hits into hit_count;
  if hit_count is null then return jsonb_build_object('kind','limited'); end if;

  bucket := to_timestamp(floor(extract(epoch from received) / 3600) * 3600);
  hit_count := null;
  insert into public.contact_intake_limits as limits(scope,fingerprint,window_start,hits)
    values ('email',p_email_hash,bucket,1)
    on conflict (scope,fingerprint,window_start) do update set hits = limits.hits + 1 where limits.hits < 3
    returning hits into hit_count;
  if hit_count is null then return jsonb_build_object('kind','limited'); end if;

  insert into public.contact_submissions(submission_id,name,email,company,budget,message,submitted_at)
    values (p_submission_id,p_payload->>'name',p_payload->>'email',p_payload->>'company',p_payload->>'budget',p_payload->>'message',received);
  insert into public.contact_notifications(submission_id,payload_hash,created_at)
    values (p_submission_id,p_payload_hash,received);
  return jsonb_build_object('kind','created','receipt_id',p_submission_id,'received_at',received);
end;
$$;

create function public.read_enquiry_notification(p_submission_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('receipt_id',s.submission_id,'received_at',s.submitted_at,
    'name',s.name,'email',s.email,'company',s.company,'budget',s.budget,'message',s.message,
    'state',n.state,'attempts',n.attempts,'provider_message_id',n.provider_message_id,
    'last_error_code',n.last_error_code,'request_payload',n.request_payload,
    'first_attempt_at',n.first_attempt_at,'last_attempt_at',n.last_attempt_at,'accepted_at',n.accepted_at)
  from public.contact_submissions s join public.contact_notifications n using (submission_id)
  where s.submission_id = p_submission_id;
$$;

create function public.claim_enquiry_notification(p_submission_id uuid,p_payload jsonb,p_claim_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  notification public.contact_notifications%rowtype;
  claimed_at timestamptz := clock_timestamp();
begin
  if p_claim_token is null or jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception 'A claim token and provider payload are required' using errcode = '22023';
  end if;
  select * into notification from public.contact_notifications where submission_id = p_submission_id for update;
  if not found then return jsonb_build_object('kind','missing'); end if;
  if notification.state = 'accepted' then return jsonb_build_object('kind','accepted'); end if;
  if notification.state = 'sending' and notification.lease_until > claimed_at then
    return jsonb_build_object('kind','busy');
  end if;
  if notification.attempts >= 3 then return jsonb_build_object('kind','exhausted'); end if;
  -- Resend retains idempotency keys for 24h. Stop before that boundary instead of
  -- risking a second message after an ambiguous timeout or lost DB update.
  if notification.first_attempt_at is not null and notification.first_attempt_at <= claimed_at - interval '23 hours' then
    return jsonb_build_object('kind','expired');
  end if;
  update public.contact_notifications set state = 'sending',attempts = attempts + 1,
    claim_token = p_claim_token,lease_until = claimed_at + interval '60 seconds',
    first_attempt_at = coalesce(first_attempt_at,claimed_at),last_attempt_at = claimed_at,
    request_payload = coalesce(request_payload,p_payload),last_error_code = null
    where submission_id = p_submission_id;
  return public.read_enquiry_notification(p_submission_id) || jsonb_build_object('kind','claimed');
end;
$$;

create function public.finish_enquiry_notification(
  p_submission_id uuid,p_claim_token uuid,p_state text,p_provider_message_id text,p_error_code text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if p_state is null or p_state not in ('accepted','failed')
    or (p_state = 'accepted' and (p_provider_message_id is null or length(p_provider_message_id) not between 1 and 200))
    or (p_error_code is not null and (length(p_error_code) > 80 or p_error_code !~ '^[a-z0-9_]+$')) then
    raise exception 'Invalid notification result' using errcode = '22023';
  end if;
  update public.contact_notifications set state = p_state,
    provider_message_id = case when p_state = 'accepted' then p_provider_message_id else null end,
    accepted_at = case when p_state = 'accepted' then clock_timestamp() else null end,
    last_error_code = case when p_state = 'failed' then p_error_code else null end,
    lease_until = null,claim_token = null
    where submission_id = p_submission_id and claim_token = p_claim_token and state = 'sending';
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

create function public.fail_enquiry_configuration(p_submission_id uuid,p_error_code text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if p_error_code is null or length(p_error_code) > 80 or p_error_code !~ '^[a-z0-9_]+$' then
    raise exception 'Invalid configuration error code' using errcode = '22023';
  end if;
  update public.contact_notifications set state = 'failed',last_error_code = p_error_code
    where submission_id = p_submission_id and state in ('pending','failed');
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

-- PostgREST exposes these names, but only the Edge Function's server credential
-- can execute them. A browser publishable/anonymous key never grants execution.
revoke all on function public.accept_enquiry(uuid,jsonb,text,text,text) from public,anon,authenticated;
revoke all on function public.read_enquiry_notification(uuid) from public,anon,authenticated;
revoke all on function public.claim_enquiry_notification(uuid,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.finish_enquiry_notification(uuid,uuid,text,text,text) from public,anon,authenticated;
revoke all on function public.fail_enquiry_configuration(uuid,text) from public,anon,authenticated;
grant execute on function public.accept_enquiry(uuid,jsonb,text,text,text) to service_role;
grant execute on function public.read_enquiry_notification(uuid) to service_role;
grant execute on function public.claim_enquiry_notification(uuid,jsonb,uuid) to service_role;
grant execute on function public.finish_enquiry_notification(uuid,uuid,text,text,text) to service_role;
grant execute on function public.fail_enquiry_configuration(uuid,text) to service_role;

comment on column public.contact_submissions.submission_id is 'Client-generated UUID receipt; NULL on historical enquiries. Immutable identity for idempotent intake.';
comment on table public.contact_notifications is 'Private notification attempts. accepted means provider acceptance, never proof of inbox delivery.';
comment on column public.contact_notifications.request_payload is 'Immutable first-attempt Resend JSON for safe retries under the same idempotency key.';

commit;
