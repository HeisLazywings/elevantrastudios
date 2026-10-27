# Elevantra Studios

Next.js 16 App Router, TypeScript, Tailwind CSS, and Framer Motion. The studio site shares its dark/gold visual system with an editorial publication and reusable project studies.

## Development

Use Node.js 24 and npm 11. Each cloud task is already isolated; use this checkout without creating a worktree unless requested.

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm start
```

The existing `npm run lint` script references `next lint`, removed in Next.js 16; lint tooling is a separate follow-up. Inter and Fraunces are self-hosted with their licenses in `public/fonts`.

## Configuration

Set variables in `.env.local` locally and in Vercel project settings. Never commit credentials.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin; defaults to `https://www.elevantrastudios.com.ng`. Override and rebuild if the production domain changes. |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing contact integration's Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key; never use a service-role key. |
| `CONTENT_PREVIEW` | Local review only: `true` enables ignored private draft files. Keep unset in public deployments. This is a local operator setting, not an authentication system. |

Without Supabase settings, the contact page offers email rather than crashing. The form makes one anonymous request to the Supabase `submit-enquiry` Edge Function. That function validates and durably saves the enquiry before attempting notification. Resend credentials belong in **Supabase Edge Function Secrets**, not Vercel or public environment variables. The old `/api/send-email` endpoint is retired.

Follow [the enquiry deployment guide](docs/ENQUIRY_SETUP.md) for the additive migration, required secrets, verified sender, protected retries and a controlled delivery test. Deploying the website does **not** deploy the database migration or Edge Function; prepare the backend first.

## Content

The public site positions the studio around commercial objectives and practical digital systems. The three strategy pages are `/commercial-challenges`, `/approach`, and `/who-we-work-with`; they complement the existing Services, Work, About and editorial routes. See [the implementation map](docs/STRATEGIC_EVOLUTION.md) and [Keystone asset assignments](docs/BRAND_ASSETS.md).

- `lib/insights.ts`: typed articles, section anchors, categories, featured selection, and reading times. Add content here without changing page layouts.
- `lib/projects.ts`: approved public studies, typed sections, status, and optional screenshots. Real screenshots use local `/public` asset paths with accurate dimensions, alt text, and captions. Supplied artwork is explicitly labelled as a design study.
- `/insights/[slug]` and `/work/[slug]`: metadata, shareable URLs, related reading or contents navigation. The sitemap includes public entries and excludes drafts.
- Public URLs use `lib/site.ts`, including canonical tags, Open Graph metadata, robots, sitemap, and structured data. No invented publication dates or performance figures are used.

Private project records remain in ignored `.content-drafts/projects.json`, outside Git. Fresh clones do not contain these private records. In this CMS branch they are not served through public work routes; create their entries as private drafts through the authenticated dashboard. Never add private client names to tracked seed data.

## Private CMS

This branch adds a separate Supabase-backed administration system at `/admin` with password login at `/admin/login`. Public navigation has no administration links. Follow [the CMS setup guide](docs/CMS_SETUP.md) to apply migrations, create your own Auth user, and add its UUID to the database-owner-managed administrator allowlist.

The CMS manages articles, case studies, resources, approved client profiles, and private media. Publishing uses live database reads and path invalidation. Set `CMS_CONTENT_ENABLED=true` after configuration and initial draft review to switch the public site from typed local content to published CMS records. Once enabled, unpublishing or deleting an entry removes it publicly without falling back to its local original. No new commit or deployment is required for subsequent content edits.

In the CMS branch, private content previews exist only at authenticated `/admin/preview/[id]` URLs. The earlier local `CONTENT_PREVIEW` flag no longer enables public work draft routes. The ignored private draft file remains outside Git; enter approved details through the dashboard as a private draft. Never add private client names to seed data.

## Publication review

Review the three editorial articles and the DBC Automobiles **Concept Demonstration** study before publication. The demo link is supplied by the owner; no screenshots or measured results are asserted. Approve any future client name, scope, assets, testimonial, or outcome before adding it to public content. Private client drafts require explicit permission to publish. Nothing in this branch merges or deploys automatically.
