"""Concurrency checks for the runner-owned disposable database only."""
import concurrent.futures,json,pathlib,subprocess,sys
if len(sys.argv) != 3:
 raise SystemExit('Usage: check-enquiry-concurrency.py CONTAINER DOCKER_BIN')
CONTAINER=sys.argv[1]
DOCKER=sys.argv[2]
if not CONTAINER.startswith('elevantra-enquiry-fixture-'):
 raise SystemExit('Refusing a container that is not an enquiry fixture')
REPO=pathlib.Path(__file__).resolve().parents[3]
def sql(query,database='postgres'):
 result=subprocess.run([DOCKER,'exec','-i',CONTAINER,'psql','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1','-Atq'],input=query,text=True,capture_output=True,check=True)
 return result.stdout.strip()
# The legacy fixture existed before migration, including legacy column permissions.
legacy=sql("select json_build_object('legacy_preserved',count(*)=1 and bool_and(submission_id is null and budget is null and submitted_at is null and message='Historical message'),'cms_policy_preserved',exists(select 1 from pg_policies where tablename='cms_fixture' and policyname='preserved_cms'),'old_contact_policy_preserved',exists(select 1 from pg_policies where tablename='contact_submissions' and policyname='old_public_insert')) from public.contact_submissions where email='legacy@example.invalid';")
assert all(json.loads(legacy).values()),legacy
# Overlapping callers with one receipt produce exactly one saved row/counter.
receipt='60000000-0000-4000-8000-000000000001'
payload=''''{"name":"Concurrent fixture","email":"concurrent@example.invalid","company":"","budget":"","message":"Test"}' '''.strip()
query=f"select public.accept_enquiry('{receipt}',{payload},repeat('a',64),repeat('b',64),repeat('c',64))->>'kind';"
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 results=list(pool.map(lambda _:sql(query),range(24)))
assert results.count('created')==1 and results.count('existing')==23,results
assert sql(f"select count(*) from public.contact_submissions where submission_id='{receipt}';")=='1'
assert sql("select sum(hits) from public.contact_intake_limits;")=='3'
# A burst with different IDs and addresses cannot overshoot the shared network cap.
sql('delete from public.contact_intake_limits;')
def rate(i):
 return sql(f"select public.accept_enquiry('70000000-0000-4000-8000-{i:012d}',{payload},md5('{i}')||md5('{i}'),repeat('d',64),md5('email{i}')||md5('email{i}'))->>'kind';")
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 rates=list(pool.map(rate,range(1,25)))
assert rates.count('created')==5 and rates.count('limited')==19,rates
# Concurrent notification claims can create one provider attempt only.
claim=f"select public.claim_enquiry_notification('{receipt}','{{\"text\":\"stable\"}}',gen_random_uuid())->>'kind';"
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 claims=list(pool.map(lambda _:sql(claim),range(16)))
assert claims.count('claimed')==1 and claims.count('busy')==15,claims
# Reapplying is explicitly refused and rolls back without touching prior records.
with open(REPO/'supabase/migrations/20261027000100_enquiry_pipeline.sql') as f: migration=f.read()
repeat=subprocess.run([DOCKER,'exec','-i',CONTAINER,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-q'],input=migration,text=True,capture_output=True)
assert repeat.returncode != 0 and 'already exist' in repeat.stderr,repeat.stderr
assert sql(f"select count(*) from public.contact_submissions where submission_id='{receipt}';")=='1'
# Unsupported required columns and collisions fail BEFORE schema modification.
negative_scenarios=[
 ('required_column','name text,email text,company text,message text,unknown_required text not null','Unsupported required'),
 ('wrong_type','name integer,email text,company text,message text','Unsupported existing'),
 ('collision','name text,email text,company text,message text,budget text','already exist'),
]
for name,columns,expected in negative_scenarios:
 database='enquiry_negative_'+name
 sql('create database '+database+';')
 sql('create table public.contact_submissions ('+columns+');',database)
 before=sql("select array_agg(column_name order by ordinal_position)::text from information_schema.columns where table_schema='public' and table_name='contact_submissions';",database)
 refused=subprocess.run([DOCKER,'exec','-i',CONTAINER,'psql','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1','-q'],input=migration,text=True,capture_output=True)
 assert refused.returncode != 0 and expected in refused.stderr,(name,refused.stderr)
 after=sql("select array_agg(column_name order by ordinal_position)::text from information_schema.columns where table_schema='public' and table_name='contact_submissions';",database)
 assert before==after,(name,before,after)
 assert sql("select to_regclass('public.contact_notifications') is null;",database)=='t'
print(json.dumps({'negative_schema_scenarios':len(negative_scenarios),'database':'disposable PostgreSQL17','legacy_and_cms_preserved':True,'repeat_requests':{'callers':24,'created':1,'existing':23},'concurrent_network_limit':{'callers':24,'accepted':5,'limited':19},'concurrent_notification_claims':{'callers':16,'claimed':1,'busy':15},'reapplication_refused_atomically':True},indent=2))
