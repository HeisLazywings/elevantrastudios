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
| `NEXT_PUBLIC_SITE_URL` | Canonical origin; defaults to the confirmed `https://elevantrastudios.vercel.app`. Set to a future custom domain and rebuild. |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing contact integration's Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key; never use a service-role key. |
| `RESEND_API_KEY` | Server-only email notification key. |
| `RESEND_FROM_EMAIL` | Optional verified sender, e.g. `Elevantra Studios <hello@your-domain>`. The existing Resend onboarding sender remains the default and is subject to provider restrictions. |
| `CONTENT_PREVIEW` | Local review only: `true` enables ignored private draft files. Keep unset in public deployments. This is a local operator setting, not an authentication system. |

Without Supabase settings, the contact page offers email rather than crashing. With settings, the existing `contact_submissions` insert remains first, followed by the email notification. Configure the table's intended insert policy and provider sender permissions in Supabase/Resend. No schema or credentials for that existing integration are provisioned by this redesign.

## Content

- `lib/insights.ts`: typed articles, section anchors, categories, featured selection, and reading times. Add content here without changing page layouts.
- `lib/projects.ts`: approved public studies, typed sections, status, and optional screenshots. Real screenshots use local `/public` asset paths with accurate dimensions, alt text, and captions. Supplied artwork is explicitly labelled as a design study.
- `/insights/[slug]` and `/work/[slug]`: metadata, shareable URLs, related reading or contents navigation. The sitemap includes public entries and excludes drafts.
- Public URLs use `lib/site.ts`, including canonical tags, Open Graph metadata, robots, sitemap, and structured data. No invented publication dates or performance figures are used.

Private project records live in ignored `.content-drafts/projects.json`, outside Git. An optional array of `Project` records with `visibility: "review"` can be read only while `CONTENT_PREVIEW=true`. Draft routes check the setting at request time, are noindex, and never appear in listings or sitemaps. Fresh clones do not contain these private records. To review locally, start with `CONTENT_PREVIEW=true npm run dev` and visit the draft's known work URL directly. Private client names must not be added to tracked content without approval.

## Publication review

Review the three editorial articles and the DBC Automobiles **Concept Demonstration** study before publication. The demo link is supplied by the owner; no screenshots or measured results are asserted. Approve any future client name, scope, assets, testimonial, or outcome before adding it to public content. Private client drafts require explicit permission to publish. Nothing in this branch merges or deploys automatically.
