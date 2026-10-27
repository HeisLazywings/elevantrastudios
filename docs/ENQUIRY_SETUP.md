# Enquiry storage and notification

The website uses **the existing Supabase project**, contact table, Auth and CMS.
There is one sender: `supabase/functions/submit-enquiry`. The browser posts once
to that function; it no longer inserts into a table or requests a second email.
`/api/send-email` returns 410 and does not read Resend credentials.

## What was wrong, and what changes

Previously, the browser inserted `contact_submissions`, then called a Next.js
route. That route read `process.env.RESEND_API_KEY` from the Next.js/Vercel runtime;
a key saved only in Supabase could not configure it. It also defaulted to a Resend
test sender. These are confirmed code behaviours. The deployed Resend domain,
secrets, original contact policies and production email logs have **not** been
inspected: they are configuration to verify, not diagnosed production facts.

The replacement validates and normalizes input, applies database-backed intake
limits, saves the enquiry and a separate notification record in one transaction,
then attempts Resend. No notification failure removes or rolls back an enquiry.
The visitor gets a calm receipt after storage succeeds, including if email fails.
An interrupted response can be retried using the same UUID without saving again.
Changed content under the same UUID returns 409 rather than overwriting a record.

The browser retains its UUID while retrying unchanged details in the current form.
Editing details after a failed attempt creates a new submission. It never retries
in the background. A reload starts a new form, so do not reload an uncertain
submission merely to resend it; use the retained form or the email fallback.

## Storage, privacy and notification states

The migration adds nullable `submission_id`, `budget`, and `submitted_at` columns
to the existing contact table. Historical rows and their values are preserved.
New messages have a separate budget column; old messages retain their original
embedded budget text. A unique receipt UUID is the durable deduplication boundary.
No existing enquiry, CMS row, Auth user or storage object is rewritten or deleted.

`contact_notifications` stores `pending`, `sending`, `failed`, or `accepted`,
attempt count, claim/lease, error code, provider ID, and a private snapshot of the
first provider payload. `accepted` means Resend accepted the request. It does **not**
mean delivered, read, or present in the inbox. There is no fabricated delivery
status and no delivery webhook in this implementation. Check Resend's dashboard
for delivery/bounce events and confirm inbox receipt separately.

Contact records, notification snapshots and limiter counters are private. RLS is
enabled. The migration preserves the old contact policy definitions for audit but
revokes public/anonymous/authenticated table and legacy column grants so direct
browser inserts cannot bypass validation or limits. Only the function's server
credential can execute the new RPCs. CMS/Auth/Storage permissions are untouched.
The private editorial CMS does not gain an enquiry management screen.

## 1. Inspect the existing database before applying the migration

Use the existing project's SQL Editor with database-owner access. Review columns,
defaults, triggers, policies and grants; never paste customer records into chat:

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'contact_submissions'
order by ordinal_position;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'contact_submissions';

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'contact_submissions';

select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'contact_submissions';

select trigger_name, action_timing, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema = 'public' and event_object_table = 'contact_submissions';
```

The repository's old insert establishes four known fields (`name`, `email`,
`company`, `message`); it does not establish the entire live schema or grants.
Read-only OpenAPI introspection with the available public project key returned
401 during implementation, so actual production policy/schema inspection remains
an operator step. Check for other required columns without defaults and for
existing triggers/integrations that depend on direct browser inserts.

Apply **only** `supabase/migrations/20261027000100_enquiry_pipeline.sql` to this
existing project, after the review. It runs transactionally and refuses missing
or incompatible base fields, unexpected required columns without defaults, and
collisions with its new objects. Do not reset the
database, recreate `contact_submissions`, rerun the older CMS migration or blindly
push an unreviewed migration history. If using the CLI, link the existing project
and inspect `supabase migration list --linked` before a targeted migration plan.

Coordinate this cutover: the migration disables the old browser insert path.
During the short transition, the previous site's form can fail and its email
fallback remains available. Deploy the function immediately after the migration,
then deploy the updated website. Do not merge/deploy the frontend while leaving
its required backend unprepared. If rolling back the website, keep the backend
and saved data: the old form requires an explicit reviewed access-policy plan,
not a database reset or blanket public grants.

## 2. Configure Supabase Edge Function Secrets

In **the same Supabase project → Edge Functions → Secrets**, add:

| Name | Required value |
| --- | --- |
| `RESEND_API_KEY` | A new Resend sending API key, scoped to the verified sender domain where supported. |
| `RESEND_FROM_EMAIL` | A valid sender on the domain actually verified in Resend. `Elevantra Studios <enquiries@elevantrastudios.com.ng>` is suitable **only after** that domain is verified. |
| `CONTACT_NOTIFICATION_TO` | `elevantrastudios@gmail.com`, the existing intended business recipient. |
| `ENQUIRY_RETRY_SECRET` | A separate random operator secret of at least 32 characters (for example 32 random bytes encoded as hex), kept in a trusted secret store. It is not a Supabase key or Resend key. |
| `CONTACT_ALLOWED_ORIGINS` | Optional comma-separated exact additional origins. The apex and `https://www.elevantrastudios.com.ng` are already allowed. For local testing add `http://localhost:3000` or the actual dev origin. For previews allow only the specific preview origin. No wildcard. |

The hosted function reads Supabase's built-in `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` at runtime. Do not add an elevated key to a `NEXT_PUBLIC_*`
variable, frontend file, response or log. Do not paste secrets into chat. Use the
Supabase Secrets UI or a protected ignored file with `supabase secrets set
--env-file /secure/path/enquiry.env --project-ref EXISTING_PROJECT_REF`; do not
put key values in shell arguments or commit that file.

No key configured only in Vercel can configure this function. Conversely, the
frontend deployment does not need `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`CONTACT_NOTIFICATION_TO`, or the retry secret. Old unused Vercel Resend variables
can be removed after cutover through the normal configuration review.

There is no `onboarding@resend.dev` fallback: missing/invalid sender configuration
records a notification failure while keeping the enquiry. Sender DNS verification
is an operator/provider fact; source code cannot guarantee a domain is verified.
Visitor email is validated and used only as Reply-To, never as From or To. Email
HTML escapes visitor content and the plain-text version includes all fields,
receipt ID and server receipt timestamp.

## 3. Deploy the function, then the website

Management API activation requires a Supabase access token for this existing
project with database read/write, Edge Functions Write (`edge_functions_write`)
and Edge Function Secrets Write (`edge_functions_secrets_write`), plus their
read permissions. A token that can inspect the project can still be denied
deployment or secret updates. Store `SUPABASE_ACCESS_TOKEN` only in the trusted
deployment environment's Secrets, allowing `api.supabase.com`; never enter it in
chat or a public environment variable. A Resend sending key does not grant
Supabase management access.

From the repository root with authorized Supabase CLI access:

```bash
supabase functions deploy submit-enquiry --project-ref EXISTING_PROJECT_REF
```

`supabase/config.toml` sets `[functions.submit-enquiry] verify_jwt = false`.
Preserve that configuration. Publishable `sb_publishable_*` keys are not JWTs.
Anonymous website visitors send the project public key in the `apikey` header;
no customer account or browser Authorization JWT is required. The protected
operator path separately checks its own bearer secret in the handler.

The function's dependency graph is contained within `supabase/functions`,
including the public-only shared contract. It uses Web APIs/Deno and no remote
package imports. The Next.js build excludes the Deno entry; `deno check` verifies
it independently. Follow the current Supabase [function auth guidance](https://supabase.com/docs/guides/functions/auth)
and [deployment guidance](https://supabase.com/docs/guides/functions/deploy).

CORS handles OPTIONS and allows POST, `content-type`, `apikey`, `authorization`,
and `x-client-info` only for exact configured origins. CORS is browser policy,
not authentication: non-browser clients can call public intake, so the server
also validates, limits, and bounds requests. Operator calls need the secret even
from an allowed origin. No wildcard origin or cookie-based intake is used.

Vercel retains the existing public Supabase URL/key and canonical origin settings.
After the migration and function are ready, merge/deploy the website through the
normal PR workflow. **A successful Vercel build does not deploy this function or
apply its migration.** Until backend access/setup is complete, delivery remains
unverified and the new frontend must not be described as a production repair.

## Abuse controls and retry limits

- JSON body limited to 24,576 streamed bytes and a 3-second read deadline.
- Names 120, email 254, company 200, message 5,000 characters; budgets use the
  existing options. Unknown fields, malformed mailboxes, header injection and a
  filled honeypot are rejected before saving.
- Atomic fixed database windows: 5 new submissions/network/15 minutes,
  3/email/hour, 30 globally/hour. Network/email fingerprints are HMACs; raw IPs
  are not stored. Old counters are removed in small batches after two days.
- Forwarded IP headers are advisory, not an authentication boundary. Global and
  email limits still apply when network headers are forged; repeated valid UUID
  replays return their existing receipt without sending another notification.
- At most 3 provider attempts; a 60-second database lease prevents concurrent
  sends. Resend has an 8-second request deadline; database RPCs have 5 seconds.
- Resend's `Idempotency-Key` is `elevantra-enquiry/RECEIPT_UUID`, with the same
  private immutable JSON payload on retries. The database refuses retries
  23 hours after the first attempt, inside Resend's 24-hour retention window.
  An accepted notification is never sent again by this workflow.

Fixed-window boundaries can allow brief bursts, and the shared cap can temporarily
limit legitimate visitors during abuse. This is proportionate protection for a
low-volume studio, not a bot-proof guarantee. No automatic queue, scheduler or
infinite retry loop is added.

## Protected status and retry

From a trusted terminal, load the public project URL/key and
`ENQUIRY_RETRY_SECRET` from a secure environment (never Vercel public variables).
The helper avoids putting secrets in command arguments or output:

```bash
node scripts/enquiry-operator.mjs status RECEIPT_UUID
node scripts/enquiry-operator.mjs retry RECEIPT_UUID
```

These POST to the same function with `{action:'status'|'retry',submissionId}` and
`Authorization: Bearer ENQUIRY_RETRY_SECRET`. Public submit requests cannot choose
provider settings or obtain notification state. Status returns receipt/time,
state, attempt count, error code and provider ID, with no name, email or message.
Retries read the existing enquiry; they never insert another one.

The same protected endpoint accepts the strict body `{action:'readiness'}` before
or after the database migration. This read-only probe checks configuration inside
the Edge runtime and calls Resend's domains API; it never accesses an enquiry or
sends an email. It returns only configuration booleans and a domain verification
result, never credentials, secret digests, sender/recipient values or raw provider
errors. A verified result must match the exact `elevantrastudios.com.ng` domain.
If a sending-only key cannot list domains, `access_denied` means verification is
unknown: confirm **Resend → Domains → elevantrastudios.com.ng → Verified** rather
than treating the added domain or its visible DNS records as proof. An incomplete
API page or unavailable provider also remains unknown. The existing terminal
helper handles receipt status/retry; use an authorized server-side HTTP client
with the same operator bearer secret for the readiness request.

After a notification is accepted, the protected body
`{action:'delivery-status',submissionId:RECEIPT_UUID}` reads Resend's current event
for the provider message ID already attached to that receipt. Callers cannot
supply a different provider ID. This action never sends, retries or updates an
enquiry/notification; it returns only the receipt, stored provider ID and an
allowlisted event such as `sent`, `delivered`, `bounced` or `delivery_delayed`.
Unknown or mismatched provider responses remain unverified, and an `access_denied`
result means the sending key cannot inspect delivery: check that stored ID in the
Resend dashboard. Provider `delivered` is still separate from the business owner's
confirmation that the message is visible in the intended inbox. Use the same
authorized server-side HTTP client/operator bearer secret for this request.

If status says `busy`, wait for the 60-second lease before trying status again.
If `exhausted` or `expired`, inspect Resend using the receipt/provider ID before
any manual action. Do not change the receipt or idempotency key to force an
uncertain email through; that can create a duplicate. A historical enquiry with
no receipt/notification record is intentionally not retried by this new endpoint.

## Controlled production delivery test

Only after the migration, function, verified sender and website deployment:

1. Open the canonical contact page signed out. Submit exactly one enquiry named
   `TEST — Elevantra enquiry integration`, with your monitored reply address and
   a message identifying it as an authorized operational test, not a client lead.
2. Confirm the visitor sees receipt only after durable storage. In the SQL Editor,
   find that labelled row, note its `submission_id`, and verify one matching
   notification row. Do not share customer rows or secrets.
3. Run protected `status RECEIPT_UUID`. `accepted` plus a provider ID proves Resend
   accepted the email, not delivery. Check that ID in Resend for delivery/bounce
   status through protected `delivery-status` or the dashboard. Verify Reply-To,
   all fields, receipt and timestamp in the email.
4. Confirm the message actually reached the business inbox (and check spam). If
   access to that inbox is unavailable, ask the owner to confirm receipt; report
   that separately from provider acceptance.
5. A repeated request with the same UUID and normalized fields should return the
   same receipt, one enquiry and no additional email attempt. Failure scenarios
   should stay mocked; do not break production credentials or bombard the inbox.

Implementation testing uses mocked providers and isolated databases. No real
production enquiry or email is sent by those tests. Production migration,
function deployment, Resend acceptance, delivery events and actual inbox receipt
must each be reported according to observed evidence, never inferred from a build.
