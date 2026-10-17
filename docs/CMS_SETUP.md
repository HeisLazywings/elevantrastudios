# Elevantra Studios: private CMS setup

The CMS extends the studio’s existing Supabase project for Auth, PostgreSQL and private Storage, using the existing Next.js App Router. Visit `/admin` directly; the public navigation and footer do not include administration links. This guide describes operator actions to take after reviewing the code. It does not apply migrations, publish content, deploy to Vercel or establish that a hosted project is ready.

## Existing integration inspected

Repository inspection found `lib/supabase.ts` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `components/ContactForm.tsx` writes `name`, `email`, `company` and `message` (including the selected budget) to `contact_submissions`, then requests `/api/send-email`. That server route uses `RESEND_API_KEY`; this workflow remains in place.

The checked-in application contained no Supabase Auth setup, Storage bucket definitions, database migrations or table policies. No project URL or Supabase key was injected into this cloud machine, so the existing remote tables beyond the referenced contact table, Auth configuration, Storage setup and data have **not** been inspected or verified. Check those in your existing dashboard before applying changes. The new `cms_*` schema, policies and private bucket are additive; existing enquiry tables and records are outside the migration’s scope.

## 1. Prepare the Supabase project

Use the existing Supabase project already configured for the website. Reuse its URL, publishable key and Auth infrastructure. Preserve `contact_submissions`, its records and policies, and the existing email integration. The CMS migration adds separate `cms_*` objects and one private `cms-media` bucket; it does not replace the existing backend.

Before applying the additive migration, back up the existing project and confirm its project reference. Inspect existing tables, Auth settings and Storage buckets in your dashboard. Their remote state was not available to this coding session and has not been verified. No new hosted Supabase project is required or has been created. Test locally or through an existing approved development environment; do not reset the production database.

Apply migrations in filename order. This release contains one migration:

1. [`supabase/migrations/20261017000100_private_cms.sql`](../supabase/migrations/20261017000100_private_cms.sql)

For an initial setup, open the Supabase SQL Editor for the intended project and run the complete migration as the project owner. It creates the administrator allowlist, content/media tables, validators, constraints, triggers, grants, Row Level Security policies and private Storage bucket. Check that the editor reports success. Do not run only selected policy statements, disable RLS, or make the bucket public to work around a failure.

Alternatively, use the Supabase CLI with this repository's migrations directory. If local CLI configuration is absent, run `supabase init` first and review the generated local configuration. Confirm the linked project and review a dry run before applying changes:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push --dry-run
supabase db push
```

The migration is an initial schema creation, not an idempotent script to rerun after a partial manual setup. Resolve any existing `cms_*` name conflict or partial migration before continuing; do not drop existing production objects blindly. Do not run the test SQL as a production migration.

## 2. Configure Auth and create the first administrator

Supabase Auth identity and CMS authorization are separate. An Auth user can sign in only as a CMS administrator after the project owner adds that user's UUID to `public.cms_admins`. The application cannot add users to that allowlist.

In Supabase Authentication settings:

1. Enable email/password sign-in.
2. Preserve existing signup settings if other parts of your backend rely on them. There is no CMS registration page or administrator-registration endpoint, and ordinary Auth users never gain CMS access. If this project has no public signup workflow, you may disable **Allow new users to sign up**; do not disable an existing production workflow merely to add the CMS.
3. Inspect the existing Auth **Site URL**. Use `https://elevantrastudios.vercel.app` for this site when appropriate; preserve any settings needed by existing consumers. Password sign-in here does not depend on an email callback.
4. Preserve existing redirect allowlist entries. Add only the exact origins and paths needed for this site, such as `https://elevantrastudios.vercel.app/admin/login` and, for development, `http://localhost:3000/admin/login`. Add a specific preview URL only when you need it. Avoid a wildcard covering unrelated Vercel projects.
5. Configure appropriate Auth password requirements and rate limits. If using Auth notification emails, configure and verify your own SMTP provider and delivery settings.

For the first account, use **Authentication → Users → Add user → Create new user** in the trusted Supabase Dashboard. Enter your own email and a strong, unique password there, ideally generated and stored in your password manager. Complete or confirm email verification through the trusted dashboard flow as appropriate for your project. Do not send passwords, recovery links or secret keys through chat, put them in SQL scripts, or commit them to GitHub.

Copy that user's UUID from the Users screen. In the project's SQL Editor, run this as the database owner, replacing the example UUID with the actual Auth user UUID:

```sql
insert into public.cms_admins (user_id)
values ('REPLACE-WITH-AUTH-USER-UUID'::uuid)
on conflict (user_id) do nothing;
```

The UUID is an identifier, not a password. Do not substitute an email address. Repeat the same owner-controlled process when approving another administrator. Signing up or signing in alone never grants CMS access.

### Password recovery and account security

This release provides password sign-in and sign-out. It does not include an invitation callback, a password-setting page, a self-service recovery flow or an in-app MFA challenge. Creating an account with a password through the trusted Supabase Dashboard is the supported initial path. Do not rely on an invitation or password-reset email redirected to `/admin/login` to set a password; that page only accepts an existing password.

Maintain project-owner recovery access. If an administrator loses their password, the project owner should use trusted Supabase Auth administration tooling to update the existing user's password. Supabase documents the server-only [`updateUserById`](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid) operation for this purpose. If administrative tooling requires a secret API key, use it only in an owner-controlled, temporary administrative environment; never add it to this app, browser code, Vercel's app runtime, repository or chat. Review Auth recovery redirect and email settings before introducing a recovery UI.

Enable MFA on the Supabase and Vercel owner/team accounts and protect the associated email account. This does not add MFA enforcement to CMS login; in-app MFA enrollment and challenge handling would be a separate change.

To revoke CMS access immediately, the database owner can remove the membership:

```sql
delete from public.cms_admins
where user_id = 'REPLACE-WITH-AUTH-USER-UUID'::uuid;
```

Every protected page and API checks membership again, so a retained login cookie does not retain CMS authorization. Also revoke Auth sessions and reset or disable the Auth account through trusted Supabase administration when compromise is suspected. Preserve at least one securely recoverable owner account.

## 3. Set local and Vercel configuration

Create an ignored `.env.local` for local development. Put the same applicable settings in **Vercel → Project → Settings → Environment Variables** for the intended deployment environment. Check that Production and Preview point to the intended Supabase project.

| Variable | Value and purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL, such as `https://YOUR-PROJECT-REF.supabase.co`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The project's publishable API key. A legacy anonymous key is also supported through `NEXT_PUBLIC_SUPABASE_ANON_KEY` when the publishable variable is absent. |
| `NEXT_PUBLIC_SITE_URL` | `https://elevantrastudios.vercel.app`, the confirmed canonical production origin. This is also the default. Change it when a custom domain is established. |
| `CMS_CONTENT_ENABLED` | Set to the exact value `true` to make the public website read published CMS content. Keep unset while preparing the migration/import if the existing local editorial content should remain visible. This is a server setting, without a `NEXT_PUBLIC_` prefix. |

The project URL and publishable/anonymous key are intended for public clients. Database and Storage RLS enforce access; these keys do not make someone an administrator. **Never use a `service_role` key, `sb_secret_...` key or database password in a `NEXT_PUBLIC_*` variable. The application does not need a service-role key.**

Keep the existing `RESEND_API_KEY` server-only and preserve `RESEND_FROM_EMAIL` and any existing contact integration settings. The CMS does not replace the contact workflow. Keep the old local `CONTENT_PREVIEW` flag unset in public deployments; authenticated CMS preview is the production draft-review mechanism.

Environment files must stay ignored. Do not paste real values into this guide or commit credentials. Restart the local Next.js process after editing `.env.local`. Changes to `NEXT_PUBLIC_*` values require a new Next.js build because those values can be included in client bundles. On Vercel, changing the activation flag also requires an initial deployment to apply the new environment configuration.

### Activate public CMS content deliberately

Use this sequence for the first rollout:

1. Apply the migration and create the first approved Auth user.
2. Run the new code locally or in an approved review environment with the Supabase settings configured. Keep `CMS_CONTENT_ENABLED` unset while preparing content if you need the existing public local content to remain visible.
3. Sign in, import the starter drafts, review their content and media, and complete the checks below.
4. Publish only content that has received the required review. A database entry marked published is publicly readable through Supabase RLS immediately, even before the website's activation flag is enabled; do not publish a private test entry.
5. Set the production variables, including `CMS_CONTENT_ENABLED=true`, and make the initial Vercel deployment only after code and publication approval. This work does not deploy automatically.

Once activated, ordinary edits, new entries, publishing and unpublishing use Supabase and the Next.js APIs. They require no GitHub commit or Vercel deployment. The application invalidates the affected page/listing/sitemap paths and reads public content without caching it across requests.

With `CMS_CONTENT_ENABLED=true`, an empty CMS produces empty public content lists, and a draft or missing slug returns a public 404. The website never falls back to an older local copy of an unpublished or deleted entry. Local typed articles and projects are the fallback only while the activation flag is unset or not `true`. Keep it enabled after migration; turning it off deliberately restores that local fallback.

## 4. Import, edit and review content

Open `https://elevantrastudios.vercel.app/admin/login` or the corresponding development URL. After signing in with an approved account, `/admin` opens the content desk.

**Import website drafts** copies the three existing editorial articles and the DBC Automobiles concept study into PostgreSQL as private drafts. It is an explicit, repeatable action: existing entries with the same content kind and slug are preserved. It does not publish anything, overwrite edited entries, copy private local draft files or import a private client name.

The private client engagement is intentionally absent from tracked starter data. Create its case study manually in the dashboard as a **Client engagement**, leave it in **Private draft** status, and leave publication permission unconfirmed. Do not add private prospect conversations, unapproved deliverables, screenshots, testimonials, project outcomes or performance figures. Only publish a named client profile or client case study after permission for the name, details and assets has been confirmed. The database rejects publication of those client entries without the explicit approval field, but that field records an administrator's decision; it cannot establish permission for you.

Create and manage these content kinds:

| Content | Public listing | Public entry URL |
| --- | --- | --- |
| Editorial article | `/insights` | `/insights/[slug]` |
| Case study | `/work` | `/work/[slug]` |
| Resource | `/resources` | `/resources/[slug]` |
| Approved client profile | `/clients` | `/clients/[slug]` |

Each entry has a lowercase hyphenated slug, title, summary, metadata, category and publication status. Slugs must be unique within a content kind. Articles also support editorial details; case studies support their designation, focus, status and narrative; resources support downloads or external links; approved clients support an engagement summary and logo.

Use the editor for headings, paragraphs, bold/italic text, lists, quotes, links and uploaded images. For a case study, use a clear sequence of context, challenge, discovery, strategy, solution, screenshots, outcomes and project status. Describe design intent or evaluation questions where results have not been measured. DBC Automobiles must remain explicitly labelled **Concept Demonstration**; its demo URL is `https://dbcautomobiles.vercel.app/`.

Save a new entry as a private draft before uploading media. **Preview saved** opens `/admin/preview/[id]` and shows the last saved version; save edits before refreshing the preview. Preview requires an approved administrator session on the server. There are no public preview tokens, secret query strings or public draft URLs. Sharing the preview URL does not give a signed-out reader access.

**Publish entry** makes an approved entry public. **Save changes** on an already published entry immediately updates its public content. Use **Unpublish** when withdrawing an entry; it becomes a private draft. SEO canonicals, Open Graph metadata and the sitemap use the configured production origin and published content. Admin pages have noindex metadata and are excluded by the crawler rules; authentication is the actual access control.

## 5. Media library and deletion

The migration creates the **private** `cms-media` Supabase Storage bucket. Leave it private. Accepted uploads are JPEG, PNG, WebP, GIF and PDF, up to **4 MiB per file**. This keeps verified multipart uploads below Vercel's request-body limit. The server checks the upload's declared MIME type, filename extension and file signature. SVG, HTML and arbitrary executable uploads are rejected. Compress or resize larger screenshots before uploading, and add useful alternative text to meaningful images.

Media belongs to a specific content entry. Uploads on a draft remain private. An uploaded file on a published entry also stays private until that exact media record is referenced as the entry's cover, body image, resource download or client logo. An ordinary mention of a media UUID in text does not publish it. Cover, body and logo references must be images owned by the same entry; resources can attach an approved uploaded download. Upload a separate copy when using an image in a different entry.

Images and downloads are served through `/api/media/[id]`. The route checks public access with a stateless anonymous Supabase client; draft access additionally requires a verified administrator session. Storage RLS checks publication and attachment again. Responses use private/no-store caching, images are served with their allowed MIME type, and PDFs download as attachments. The application does not issue signed media URLs or route private files through Next.js's image cache.

Unpublishing withdraws the entry and its attached media from anonymous readers on the next request, without a deployment. Previously downloaded copies cannot be recalled. Unpublishing a client entry also removes it from public listings and the sitemap.

Uploaded bytes are immutable. To replace an image, upload a new file and change the saved entry reference. To delete media or an entry:

1. Remove the media's cover/body/download/logo references from the entry and save. Unpublish first when appropriate.
2. Delete its files from the media library. The database rejects deletion while a file is still referenced.
3. Delete the entry after all of its media records have been removed. Entry deletion is permanent and checked against the version last loaded in the editor.

Database metadata and Storage use separate services. If a Storage deletion fails, the API attempts to restore a retryable media record and reports the failure. If that restoration also fails, an unmapped object remains private and the response requests manual cleanup. Use the Supabase Storage dashboard as the project owner to investigate a reported orphan; do not make the bucket public or remove RLS to recover it.

## 6. Validate before using the hosted CMS

Code checks and local database checks do not prove that a hosted Supabase project has the right Auth, email, keys or Storage service configuration. Complete this checklist against the intended project before treating setup as complete. Use disposable content without client information and remove it afterwards.

- [ ] Run `npm ci`, `npm run typecheck`, `npm test` and `npm run build` with the intended non-secret configuration. Review any failures instead of bypassing checks.
- [ ] Verify the migration and private bucket exist, RLS is enabled, and existing Auth/signup workflows remain intact. CMS membership must require the owner-managed allowlist regardless of signup settings.
- [ ] In a signed-out browser, `/admin` and `/admin/preview/[id]` redirect to login. Admin APIs reject unauthenticated calls; foreign-origin mutations are rejected. Admin responses are private/no-store and noindex.
- [ ] Create a disposable Auth user without a `cms_admins` row. It cannot access drafts, upload media or perform content mutations; registration alone grants no write permission.
- [ ] Sign in with the allowlisted owner. Confirm `/api/admin/me` succeeds and draft creation, saving, authenticated preview, editing and media upload work using real Supabase persistence.
- [ ] Try two entries of the same kind and slug. The second save returns a conflict (`409`) without overwriting the first. The same slug in a different kind is allowed.
- [ ] Open one entry in two tabs. Save tab A, then save or delete from the older tab B. The stale mutation returns `409`; copy unsaved edits and reload instead of silently overwriting tab A.
- [ ] Upload an allowed image and a PDF. Reject a file above the size limit, an SVG and a file whose extension/type/signature do not agree. Check saved alt text and authenticated media previews.
- [ ] Keep one entry as a draft. Its public slug and its media URL fail for a signed-out reader, and it is absent from listings and the sitemap. An approved admin can preview it.
- [ ] On a published disposable entry, confirm an unreferenced upload remains inaccessible when signed out. Attach the image/download and save; the exact attached file becomes accessible. A file belonging to another entry cannot be attached.
- [ ] Publish approved disposable content and verify its public URL, canonical metadata, listing and sitemap. Edit its title/body and confirm the next public request updates without a Git commit or deployment.
- [ ] Unpublish it and request the public URL and media URL in a signed-out browser again. Both become inaccessible; listings and sitemap exclude it. Confirm the local fallback has not revived it while `CMS_CONTENT_ENABLED=true`.
- [ ] Confirm a client profile or a Client engagement case study cannot publish without its permission field. Leave all real unapproved client material private.
- [ ] Remove saved media references, delete media, and delete the disposable entry. Referenced-media deletion is rejected. Confirm sign-out removes access and removing the allowlist row revokes an otherwise valid account.
- [ ] Check the dashboard and rich-text editor with a keyboard and on a mobile viewport. Confirm the public contact workflow still behaves as before.

The repository includes application validation tests and [`supabase/tests/cms.sql`](../supabase/tests/cms.sql), a rollback-only pgTAP suite covering schema, authorization, published/draft visibility, client permission, media scoping and deletion constraints. On a configured, running local Supabase stack with the migration applied, run:

```bash
supabase test db
```

For a reproducible isolated database fixture, run `npm run test:db` with Docker available. It creates a new disposable container without published ports, runs the SQL suite and collision-preservation checks, and removes only that container. It never accepts or connects to your existing project database URL.

During implementation, the migration was applied to a real PostgreSQL 17 fixture and all **44 pgTAP assertions passed**, including the Storage object policies. That fixture supplied minimal Auth/Storage schemas and roles; it did not run the Supabase Auth or Storage HTTP services. This evidence does not verify hosted sessions, password delivery, uploads/downloads through the hosted service or Vercel cookies. Hosted end-to-end checks above remain necessary after the operator supplies project settings and creates the administrator. Do not put real credentials into test files.

## 7. Maintain the system

Back up both PostgreSQL content and Storage objects; database backups alone do not back up the file bytes in Storage. Use your Supabase plan's backup/PITR capabilities as appropriate, keep private copies of essential media, and test recovery in an isolated local or already approved recovery environment. Review approved administrators periodically and revoke access when responsibilities change.

If login reports unavailable, check project URL/key configuration, Supabase project status, the applied migration and network access to the project's Supabase hostname. If an account is forbidden, verify its exact Auth UUID against `cms_admins`. A valid login without an allowlist row is insufficient. If uploads fail, check the private bucket's size/MIME settings and policies before changing application code. For `409` saves, reload the newest entry; for referenced-media conflicts, remove and save references before deletion.

When moving to a custom domain, update `NEXT_PUBLIC_SITE_URL`, Supabase Site URL and exact allowed redirects, then rebuild/redeploy the reviewed application configuration. Ordinary editorial changes continue through the dashboard without deployments.
