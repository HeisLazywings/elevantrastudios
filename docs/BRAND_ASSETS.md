# Keystone asset assignments

The user selected Direction 02 — The Keystone. Two ink originals were supplied;
no approved reverse, full-colour, or standalone icon files were supplied.

## Original artwork

- `public/brand/keystone-horizontal-ink.svg`: byte-for-byte copy of the uploaded
  `Horizontal_Ink (1).svg`, including its 1460 × 352 viewBox and existing clear space.
  Used in the public header and root Open Graph image on a restrained cream plate.
  Header rendered width is 200 px below 360 px, 216 px on mobile, 228 px from the small breakpoint,
  and 248 px from desktop. The aspect ratio is always preserved.
- `public/brand/keystone-stacked-ink.svg`: byte-for-byte copy of the uploaded
  `Primary_Stacked_Ink.svg`, including its 1000 × 540 viewBox and clear space.
  Used in the footer at 300 px wide, with a max-width safeguard for narrow containers.
- Both use the original ink colour `#172329`. The surrounding plate is `#F3EFE6`.
  The plate supplies contrast against the site's existing dark foundation; no
  recolouring, CSS filters, glow, texture, metallic treatment, or shadow is applied
  to the artwork.

These are proposed application assignments of the supplied artwork, not new logo
variants or a claim that additional brand standards were approved.

## Symbol adaptation for small applications

`public/brand/keystone-symbol-ink.svg`, `app/icon.svg`, and `app/apple-icon.tsx`
reuse the exact three symbol paths from the supplied originals. The wordmark is
omitted at icon sizes. The symbol's 216 × 180 geometry remains intact, with equal
horizontal clear space and optical vertical centring inside a square. The favicon
and Apple icon add the same cream background for legibility. This is an extracted
symbol adaptation, not newly drawn geometry or a proposed colour reversal.
The same extracted symbol replaces the generic `E.` badge in the existing private
CMS shell; its authentication, navigation, and editorial operations are unchanged.

`components/BrandLogo.tsx` provides the shared original-artwork presentation and
exports the unchanged symbol paths for the Apple icon. No dark-background reverse
variant has been fabricated. Revisit assignments if an approved reverse or compact
asset is supplied later.

## Metadata and privacy

The root Open Graph image uses the original horizontal artwork and the studio's
Commercial Systems & Digital Growth positioning. It does not add client logos,
results, endorsements, or unverified claims.

`NEXT_PUBLIC_SITE_URL` retains its existing name and override behaviour. Its default
is the user's confirmed canonical domain, `https://www.elevantrastudios.com.ng`.

Existing Vercel analytics remains for public pages. The client-side `beforeSend`
policy drops admin, API, preview, and draft URLs, rejects private/token query flags,
and removes query strings and fragments from public URLs. Explicit
`CONTENT_PREVIEW=true` disables the analytics component entirely. These changes
add no scripts or dependencies and do not change CMS authorization or publication.
