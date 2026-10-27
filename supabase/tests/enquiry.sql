-- Run only against a disposable/local database with the migration applied:
-- psql -v ON_ERROR_STOP=1 -f supabase/tests/enquiry.sql
-- Everything below rolls back. No provider/HTTP calls or real addresses exist.
begin;
create temporary table enquiry_assertions (passed integer not null);
insert into enquiry_assertions values (0);
create function pg_temp.enquiry_assert(ok boolean,label text)
returns void language plpgsql as $$
begin
  if ok is distinct from true then raise exception 'Assertion failed: %',label; end if;
  update enquiry_assertions set passed = passed + 1;
end;
$$;

select pg_temp.enquiry_assert((select relrowsecurity from pg_class where oid = 'public.contact_submissions'::regclass),'existing enquiries have RLS');
select pg_temp.enquiry_assert((select relrowsecurity from pg_class where oid = 'public.contact_notifications'::regclass),'notification state has RLS');
select pg_temp.enquiry_assert((select relrowsecurity from pg_class where oid = 'public.contact_intake_limits'::regclass),'rate counters have RLS');
select pg_temp.enquiry_assert(not has_table_privilege('anon','public.contact_submissions','INSERT'),'anonymous direct insert is retired');
select pg_temp.enquiry_assert(not has_table_privilege('authenticated','public.contact_submissions','SELECT'),'ordinary auth cannot read enquiries');
select pg_temp.enquiry_assert(not has_column_privilege('anon','public.contact_submissions','name','SELECT'),'legacy column grants are revoked');
select pg_temp.enquiry_assert(not has_table_privilege('anon','public.contact_notifications','SELECT'),'anonymous notification reads forbidden');
select pg_temp.enquiry_assert(not has_table_privilege('authenticated','public.contact_intake_limits','UPDATE'),'ordinary auth cannot tamper with limits');
select pg_temp.enquiry_assert(not has_function_privilege('anon','public.accept_enquiry(uuid,jsonb,text,text,text)','EXECUTE'),'intake RPC unavailable directly to anonymous callers');
select pg_temp.enquiry_assert(not has_function_privilege('authenticated','public.claim_enquiry_notification(uuid,jsonb,uuid)','EXECUTE'),'retry claims require server role');
select pg_temp.enquiry_assert(has_function_privilege('service_role','public.accept_enquiry(uuid,jsonb,text,text,text)','EXECUTE'),'Edge server role may intake');

set local role anon;
do $$ begin
  begin insert into public.contact_submissions(name,email,company,message) values ('Denied','denied@example.invalid','','No');
    raise exception 'anonymous insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin perform * from public.contact_submissions;
    raise exception 'anonymous read unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin perform public.read_enquiry_notification('00000000-0000-4000-8000-000000000001');
    raise exception 'anonymous RPC unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

create temporary table enquiry_results (label text primary key,result jsonb);
-- Real service-role permissions are exercised for initial intake.
set local role service_role;
select public.accept_enquiry('00000000-0000-4000-8000-000000000001',
  '{"name":"Test contact","email":"contact@example.invalid","company":"Fixture","budget":"","message":"Test only"}',
  repeat('1',64),repeat('2',64),repeat('3',64));
reset role;
select pg_temp.enquiry_assert((select count(*) from public.contact_submissions where submission_id = '00000000-0000-4000-8000-000000000001') = 1,'one durable enquiry');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'state') = 'pending','notification starts independently pending');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'received_at') is not null,'receipt has durable timestamp');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'message') = 'Test only','original message and separate budget');
insert into enquiry_results values ('counter-before',(select jsonb_build_object('total',sum(hits)) from public.contact_intake_limits));
insert into enquiry_results values ('duplicate',public.accept_enquiry('00000000-0000-4000-8000-000000000001',
  '{"name":"Test contact","email":"contact@example.invalid","company":"Fixture","budget":"","message":"Test only"}',repeat('1',64),repeat('2',64),repeat('3',64)));
select pg_temp.enquiry_assert((select result->>'kind' from enquiry_results where label = 'duplicate') = 'existing','repeat receipt is idempotent');
select pg_temp.enquiry_assert((select sum(hits) from public.contact_intake_limits) = (select (result->>'total')::integer from enquiry_results where label = 'counter-before'),'duplicate consumes no quota');
select pg_temp.enquiry_assert(public.accept_enquiry('00000000-0000-4000-8000-000000000001',
  '{"name":"Changed","email":"contact@example.invalid","company":"Fixture","budget":"","message":"Changed"}',repeat('4',64),repeat('2',64),repeat('3',64))->>'kind' = 'conflict','same receipt with changed input conflicts');
select pg_temp.enquiry_assert((select count(*) from public.contact_submissions where submission_id = '00000000-0000-4000-8000-000000000001') = 1,'conflict preserves original enquiry');

-- Missing credentials do not use provider attempts or delete the enquiry.
select pg_temp.enquiry_assert(public.fail_enquiry_configuration('00000000-0000-4000-8000-000000000001','missing_resend_key'),'missing key failure recorded');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'state') = 'failed','configuration failure state');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'attempts')::integer = 0,'configuration failure preserves retry allowance');

insert into enquiry_results values ('claim1',public.claim_enquiry_notification('00000000-0000-4000-8000-000000000001',
  '{"from":"Studio <test@example.invalid>","to":["inbox@example.invalid"],"subject":"Test","text":"Immutable snapshot"}',
  '10000000-0000-4000-8000-000000000001'));
select pg_temp.enquiry_assert((select result->>'kind' from enquiry_results where label = 'claim1') = 'claimed','failed notification can claim after key fixed');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'attempts')::integer = 1,'provider attempt counted once');
select pg_temp.enquiry_assert(public.claim_enquiry_notification('00000000-0000-4000-8000-000000000001','{}','10000000-0000-4000-8000-000000000002')->>'kind' = 'busy','concurrent claim blocked by lease');
select pg_temp.enquiry_assert(not public.finish_enquiry_notification('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','accepted','incorrect-token',null),'wrong claim cannot finalize');
select pg_temp.enquiry_assert(public.finish_enquiry_notification('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','failed',null,'provider_timeout'),'timeout recorded without deleting receipt');
insert into enquiry_results values ('claim2',public.claim_enquiry_notification('00000000-0000-4000-8000-000000000001','{"text":"changed configuration must not change snapshot"}','10000000-0000-4000-8000-000000000002'));
select pg_temp.enquiry_assert((select result->'request_payload'->>'text' from enquiry_results where label = 'claim2') = 'Immutable snapshot','retry reuses immutable provider payload');
select pg_temp.enquiry_assert(public.finish_enquiry_notification('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','accepted','fixture-provider-id',null),'provider acceptance recorded');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'provider_message_id') = 'fixture-provider-id','provider message ID persists');
select pg_temp.enquiry_assert((public.read_enquiry_notification('00000000-0000-4000-8000-000000000001')->>'state') = 'accepted','acceptance not mislabeled delivered');
select pg_temp.enquiry_assert(public.claim_enquiry_notification('00000000-0000-4000-8000-000000000001','{}','10000000-0000-4000-8000-000000000003')->>'kind' = 'accepted','accepted message cannot send again');
select pg_temp.enquiry_assert(not public.fail_enquiry_configuration('00000000-0000-4000-8000-000000000001','missing_resend_key'),'later config checks cannot overwrite acceptance');

-- Independent receipt exercises crash recovery and finite retry/idempotency TTL.
select public.accept_enquiry('00000000-0000-4000-8000-000000000002','{"name":"Second test","email":"second@example.invalid","company":"","budget":"","message":"Second"}',repeat('5',64),repeat('6',64),repeat('7',64));
select public.claim_enquiry_notification('00000000-0000-4000-8000-000000000002','{"text":"second"}','20000000-0000-4000-8000-000000000001');
update public.contact_notifications set lease_until = now() - interval '1 second' where submission_id = '00000000-0000-4000-8000-000000000002';
select pg_temp.enquiry_assert(public.claim_enquiry_notification('00000000-0000-4000-8000-000000000002','{"text":"second changed"}','20000000-0000-4000-8000-000000000002')->>'kind' = 'claimed','stale lease recovers ambiguous attempt');
select pg_temp.enquiry_assert(not public.finish_enquiry_notification('00000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','accepted','late-old-attempt',null),'superseded attempt cannot overwrite current state');
select public.finish_enquiry_notification('00000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','failed',null,'provider_rejected');
update public.contact_notifications set first_attempt_at = now() - interval '23 hours 1 minute' where submission_id = '00000000-0000-4000-8000-000000000002';
select pg_temp.enquiry_assert(public.claim_enquiry_notification('00000000-0000-4000-8000-000000000002','{}','20000000-0000-4000-8000-000000000003')->>'kind' = 'expired','retries stop before Resend 24h key expiry');
update public.contact_notifications set first_attempt_at = now() - interval '1 minute' where submission_id = '00000000-0000-4000-8000-000000000002';
select public.claim_enquiry_notification('00000000-0000-4000-8000-000000000002','{}','20000000-0000-4000-8000-000000000003');
select public.finish_enquiry_notification('00000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','failed',null,'provider_rejected');
select pg_temp.enquiry_assert(public.claim_enquiry_notification('00000000-0000-4000-8000-000000000002','{}','20000000-0000-4000-8000-000000000004')->>'kind' = 'exhausted','provider attempts bounded at three');
select pg_temp.enquiry_assert((select count(*) from public.contact_submissions where submission_id = '00000000-0000-4000-8000-000000000002') = 1,'failed exhausted notification retains one enquiry');
select pg_temp.enquiry_assert(public.claim_enquiry_notification('00000000-0000-4000-8000-000000000099','{}','20000000-0000-4000-8000-000000000004')->>'kind' = 'missing','missing receipt cannot notify');

-- Dedicated counters so live fixture state cannot affect tests; rolled back.
delete from public.contact_intake_limits;
do $$
declare i integer; result jsonb;
begin
  for i in 1..4 loop
    result := public.accept_enquiry(('30000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
      '{"name":"Rate test","email":"limit@example.invalid","company":"","budget":"","message":"Test"}',
      md5(i::text)||md5(i::text),md5(('network'||i)::text)||md5(('network'||i)::text),repeat('8',64));
    perform pg_temp.enquiry_assert(result->>'kind' = case when i <= 3 then 'created' else 'limited' end,'per-email hourly cap '||i);
  end loop;
end $$;
delete from public.contact_intake_limits;
do $$
declare i integer; result jsonb;
begin
  for i in 1..6 loop
    result := public.accept_enquiry(('40000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
      '{"name":"Rate test","email":"limit@example.invalid","company":"","budget":"","message":"Test"}',
      md5(i::text)||md5(i::text),repeat('9',64),md5(('email'||i)::text)||md5(('email'||i)::text));
    perform pg_temp.enquiry_assert(result->>'kind' = case when i <= 5 then 'created' else 'limited' end,'per-network 15-minute cap '||i);
  end loop;
end $$;
delete from public.contact_intake_limits;
do $$
declare i integer; result jsonb;
begin
  for i in 1..31 loop
    result := public.accept_enquiry(('50000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
      '{"name":"Global rate test","email":"global@example.invalid","company":"","budget":"","message":"Test"}',
      md5(i::text)||md5(i::text),md5(('global-network'||i)::text)||md5(('global-network'||i)::text),md5(('global-email'||i)::text)||md5(('global-email'||i)::text));
    perform pg_temp.enquiry_assert(result->>'kind' = case when i <= 30 then 'created' else 'limited' end,'global hourly cap '||i);
  end loop;
end $$;
select passed || ' enquiry database assertions passed; all changes roll back.' as result from enquiry_assertions;
rollback;
