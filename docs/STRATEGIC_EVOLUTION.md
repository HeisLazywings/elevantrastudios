# Commercial systems positioning: implementation map

This is an incremental frontend and content change to the existing Next.js App Router site. It retains TypeScript, Tailwind, Inter/Fraunces, Framer Motion, the current contact pipeline, and the Supabase CMS.

## Three new pages

- `/commercial-challenges`: distinguishes commercial activity from value, examines five possible breakdowns, separates symptoms from hypotheses, and explains evidence, impact, priority and feasibility. Examples are hypothetical rather than diagnoses.
- `/approach`: explains four stages of commercial reasoning, possible outputs, proportionate recommendations, agreed responsibilities and optional further work. It retains the existing six-stage engineering delivery rhythm as the implementation framework within an agreed engagement.
- `/who-we-work-with`: explains client-fit characteristics and the initial automotive exploration, with conditional examples of other business contexts. It links to work and articles returned by the existing published-content queries.

These are the only new major content pages. The Apple touch icon is a technical image route.

## Existing presentation

- Home keeps its hero, positioning, capabilities, work, working standards, process, editorial, technology and final-contact sections. The narrative now begins with the business objective; technical tools appear later in the page. A compact customer-journey diagram complements the existing sections.
- About retains the founder's existing biography and personal channels, and distinguishes the current practice from a future institutional ambition and 20-year perspective.
- Services groups existing technical delivery under four capabilities. Websites, landing pages, portfolios, catalogues, e-commerce, CMS work, performance, SEO and optional support remain represented.
- Contact changes labels and supporting copy. Field names, budget options, the `contact_submissions` insert, email notification sequence, real success/error handling and contact details are preserved.
- Navigation uses a desktop Studio disclosure and a mobile menu to expose the new pages without adding eight competing header links. Footer grouping and active states follow shared route definitions. Public navigation contains no admin or login links.
- Existing editorial and project content is preserved. No client record is edited, published, unpublished or deleted by this implementation. The approved published Azan case study remains managed by the existing CMS.

## Shared components and identity

`PageIntro`, `StrategyCTA`, `CommercialJourney` and the homepage journey preview reuse the established type, colours, spacing utilities and reduced-motion-aware Reveal component. There is no new UI framework or production dependency.

The supplied Keystone ink masters are preserved byte-for-byte on cream plates. The horizontal original serves the header and sharing image; the stacked original serves the footer. Icon geometry is extracted directly from the supplied symbol. [Brand assignments](BRAND_ASSETS.md) document proportions, clear space and the absence of a separately supplied reverse or micro master.

New page metadata and the sitemap use the existing URL helper. Its configurable default now reflects the confirmed `https://www.elevantrastudios.com.ng` origin; environment-variable names are unchanged.

The existing analytics integration now filters admin, API and preview/draft URLs, removes public query/hash data and disables analytics in explicit content-preview mode. Existing public analytics is retained.

## Preserved boundaries

No database migration, table change, policy change, storage change, authentication change, production secret update or deployment-platform change is required. The CMS shell's only visual change replaces its old generic letter badge with the exact Keystone symbol.

Current capabilities and intended methods are described separately from delivered evidence. No new client counts, sales figures, testimonials, corporate partnerships, company-history claims or sector-wide track records are introduced. Future institutional intelligence and repeatable methods are ambitions to be earned.

Review the positioning and logo application in the pull request before merging. No automatic merge or production deployment is part of this implementation.

## Verification

Executed against the feature branch:

- `npm ci --cache /workspace/.npm-cache --no-audit --no-fund`: passed with the existing lockfile.
- `npm run typecheck`: passed.
- `npm test`: 22 tests passed. This includes the existing content, delivery framework, CMS validation and authorization tests, plus focused analytics/privacy and navigation tests.
- `npm run build`: passed after the final frontend/accessibility fixes.
- `git diff --check`: passed.
- `npm run lint`: failed because the existing command calls `next lint`, removed in Next.js 16. This pre-existing tooling limitation remains documented; this change adds no lint framework or production dependency.

The production build was started locally with the existing public Supabase integration and `CMS_CONTENT_ENABLED=true`. This allowed read-only checks against the existing published content, including Azan and the published editorial article. No CMS records or production settings were changed.

Browser and HTTP verification:

- All three new pages rendered at 360, 390, 768, 1024 and 1440 px with no browser page errors. Header and footer branding remained proportional with no horizontal overflow at those widths.
- Desktop Studio disclosure, active states, keyboard entry/exit, Escape, outside click, mobile focus trap, route-close and focus restoration across the 1024 px breakpoint passed. Timing-controlled checks waited for the existing transition to finish.
- Axe-core WCAG A/AA checks on Home, the three new pages, About, Services and Contact at 360 and 1440 px: zero violations after correcting secondary-label contrast and founder-link accessible names. No clipped main headings or horizontal overflow were detected. This is a scoped automated check, not a complete accessibility certification.
- Three contact scenarios passed using browser request interception: stored and notified; storage rejected without a success state; stored with email unavailable and an appropriate fallback. Field names and payload order were checked. No real enquiries or email notifications were sent.
- Seven pages passed heading, description, canonical, Open Graph, indexability and internal-link/anchor checks across 13 distinct internal destinations. Sitemap checks confirmed the three new routes and the published Azan study, with no admin paths.
- Sixteen read-only public/private checks passed: admin redirects and anonymous API rejection, no public navigation on admin login, unknown content/media rejection, published work/article/media access and sitemap boundaries. Known private record IDs were not available, so no direct private-record or authenticated admin-write test was performed. Existing publication-query and RLS code is unchanged.
- Favicon, 180 × 180 Apple icon and 1200 × 630 Open Graph image rendered successfully. Uploaded SVG masters were verified byte-for-byte against the committed originals.

No production merge or deployment was performed. Review the positioning and proposed logo applications in the pull request. No new Supabase migrations, secrets or Vercel configuration are required; existing integration settings remain in use.
