# Keystone asset assignments

The user selected Direction 02 — The Keystone and supplied two ink originals.
The refinement request explicitly approves separate light variants made by changing
artwork colour only. The geometry, wordmark, proportions and clear space remain
unchanged.

## Original artwork and approved light variants

- `public/brand/keystone-horizontal-ink.svg`: byte-for-byte copy of the uploaded
  `Horizontal_Ink (1).svg`, including its 1460 × 352 viewBox and existing clear space.
- `public/brand/keystone-stacked-ink.svg`: byte-for-byte copy of the uploaded
  `Primary_Stacked_Ink.svg`, including its 1000 × 540 viewBox and clear space.
- `public/brand/keystone-horizontal-light.svg` and
  `public/brand/keystone-stacked-light.svg` retain every element, path, transform,
  dimension and spacing from their ink counterparts. The only change is the
  artwork fill from ink `#172329` to the existing warm off-white `#F3EFE6`.
- Both original and light SVGs have transparent backgrounds. There are no filters,
  CSS blend modes, image inversion, shadows, glows or redrawn letterforms.

`components/BrandLogo.tsx` selects the variant and tone. Its `light` default serves
all current consumers on dark surfaces: the public header, public footer and
private CMS shell. Both the wrapper and image are transparent. Use `tone="ink"`
when a future consumer has a light surface; the component adds no background plate.

The public header uses the horizontal light asset at the existing rendered widths:
200 px below 360 px, 216 px on mobile, 228 px from the small breakpoint and 248 px
from desktop. The footer uses the stacked light asset at 300 px wide, constrained
to its available container. Explicit intrinsic dimensions, automatic height and
max-width safeguards retain the aspect ratio and layout stability. The masters'
internal clear space is preserved rather than cropped.

## Symbol adaptation for small applications

`public/brand/keystone-symbol-ink.svg`, `app/icon.svg`, and `app/apple-icon.tsx`
reuse the exact three symbol paths from the supplied originals. The wordmark is
omitted at icon sizes. The symbol's 216 × 180 geometry remains intact, with equal
horizontal clear space and optical vertical centring inside a square.

`public/brand/keystone-symbol-light.svg` is the same extracted symbol with only its
fill changed to `#F3EFE6`. The private CMS header uses this transparent light
symbol against its dark surface. Its authentication, navigation and editorial
operations are unchanged. The shared component continues to export the same
symbol paths for the Apple icon.

The favicon and Apple icon retain their cream backgrounds and ink symbols for
legibility across browser and operating-system surfaces. These self-contained
icons are separate from the transparent public page logos.

## Metadata and privacy

The root Open Graph image uses the horizontal light artwork directly on its dark
surface, with the studio's Commercial Systems & Digital Growth positioning. It
does not add client logos, results, endorsements or unverified claims. Structured
data keeps the original ink asset URL as the organisation logo reference.

`NEXT_PUBLIC_SITE_URL` retains its existing name and override behaviour. Its default
is the user's confirmed canonical domain, `https://www.elevantrastudios.com.ng`.

Existing Vercel analytics remains for public pages. The client-side `beforeSend`
policy drops admin, API, preview and draft URLs, rejects private/token query flags,
and removes query strings and fragments from public URLs. Explicit
`CONTENT_PREVIEW=true` disables the analytics component entirely. The logo changes
add no scripts or dependencies and do not change CMS authorization or publication.
