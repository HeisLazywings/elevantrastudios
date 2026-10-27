# Logo, enquiry and architectural refinement review

Baseline: `872901f` (`main`, including PR #5). Screenshots use the local production
build at the same 1,000px viewport height; 390px represents mobile and 1,440px
desktop. No client/customer details are entered. Before images were captured
before changing the implementation; after images are from the finished build.

| Screen | Before | After |
| --- | --- | --- |
| Homepage, desktop | [Before](before-home-1440.png) | [After](after-home-1440.png) |
| Homepage, mobile | [Before](before-home-390.png) | [After](after-home-390.png) |
| Contact, desktop | [Before](before-contact-1440.png) | [After](after-contact-1440.png) |
| Contact, mobile | [Before](before-contact-390.png) | [After](after-contact-390.png) |

The header's rectangle came from `BrandLogo`'s cream wrapper, not the transparent
SVG. Separate light files change only the original ink artwork's colour to
`#F3EFE6`. The original files, geometry, type, proportions, clear space and image
sizing are preserved. Image and wrapper backgrounds are transparent. All shared
consumers are on dark surfaces, including the private CMS shell. The Open Graph
image uses the same treatment; standalone favicon/Apple icon backgrounds remain
appropriate for browser/OS contrast. See [brand assignments](../../BRAND_ASSETS.md).

## Visual placement

The hero has one cropped, static silhouette in the vacant lower band, below the
headline/CTAs. A smaller missing-piece connection uses the empty area beneath
the business-first column, without adding a new block or moving the text. The
existing journey has quiet handoff connectors; labels and sequence are unchanged.
Only this homepage instance opts into those connectors. No illustration is added
to case-study images, navigation or form fields.

- [Business-first placement](after-business-1440.png)
- [Journey placement](after-journey-1440.png)

The family consists of sparse tapered planes and short connections, with low
warm-grey opacity and selective muted gold. Black, typography and whitespace
remain dominant. Absolute positioning reserves the existing layout; masking and
clipping keep artwork peripheral. Decoration is static, `aria-hidden`, and
`pointer-events:none`; the desktop compositions disappear on narrow viewports.
The existing section order, copy and layout proportions are preserved. No raster
artwork, new animation runtime or dependency is introduced.

During reduced-motion testing, an existing server/client mismatch was found in
Hero/Reveal initial styles. Initial values are now deterministic; the existing
reduced-motion CSS exposes the content immediately without transforms. Normal
motion retains its existing behaviour. Final browser checks found no hydration
or JavaScript errors in either mode.

## Enquiry behaviour

One anonymous request reaches Supabase `submit-enquiry`; it validates, durably
stores, then attempts email. The unique receipt and private immutable email
snapshot support safe retries. Notification state is separate: provider
acceptance is recorded with its message ID, never described as inbox delivery.
The form confirms durable receipt even when notification fails, retains details
on save/unknown failures, prevents simultaneous duplicate sends and preserves an
accessible email fallback. The old Next.js sending endpoint is retired (410).

See [the complete backend setup and cutover guide](../../ENQUIRY_SETUP.md).
**The Supabase migration, secrets and function are a separate deployment from the
website. They have not been applied to production by this change.**

## Verification

- `npm run build` and `npm run typecheck` passed.
- `npm test`: 45 passed, including 17 mocked backend and 6 client transport tests.
- `deno check supabase/functions/submit-enquiry/index.ts` passed independently of
  Next.js; no remote runtime dependency is needed.
- `bash scripts/test-enquiry-db.sh`: 80 PostgreSQL assertions, 3 unsupported-schema
  scenarios, migration reapplication refusal, and parallel duplicate/rate/claim
  checks passed in an isolated PostgreSQL 17 container with networking disabled.
  Twenty-four duplicate callers stored one enquiry; sixteen concurrent claims
  produced one active notification attempt.
- Eight intercepted form browser scenarios passed, covering durable receipt,
  failed storage, double submits, unknown/timeout retries, changed details,
  invalid input and rate limits. All provider failure testing was mocked.
- Homepage/contact/approach layouts checked at 360, 390, 768 and 1,440px. All
  logos loaded with transparent backgrounds. No horizontal overflow or observed
  load layout shift (sampled CLS 0). This is a local sample, not a field performance
  guarantee. SVG decoration source is about 1.6KB, with no new scripts or packages.
- Scoped axe WCAG 2/2.1 A/AA scans: homepage and approach at all four widths, plus
  contact initial/error/success states at 360 and 1,440px; zero violations. These
  automated scans do not replace a full assistive-technology audit.
- Normal and reduced-motion navigation checks passed: sticky placement, mobile
  focus loop, visible keyboard focus, Escape restoration and outside-click close.
- Anonymous admin API remains 401; `/admin` redirects to login. Existing Azan
  case study and external link render; sitemap excludes admin URLs. Open Graph
  renders; retired email endpoint returns 410.
- `git diff --check` passed. Original ink SVGs remain unchanged.
- Existing `npm run lint` remains unavailable: its `next lint` command was removed
  in Next.js 16 and exits with an invalid `/lint` project path. No lint tooling
  replacement is included in this refinement.

No production database writes, migrations, configuration edits or real email
sends were performed. Production contact schema/policies could not be inspected
with the available public introspection access (401); the migration must be
reviewed against the real schema. Verified Resend sender, deployed function,
provider acceptance/delivery and inbox receipt still need the controlled test
in the setup guide. A passing website build does not establish any of those.
