/**
 * Quiet structural studies drawn from the Keystone's tapered planes.
 * These are peripheral decoration; the adjacent words carry the meaning.
 */
export function HeroStructure() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 560 420"
      fill="none"
      className="hero-structure pointer-events-none absolute hidden select-none lg:block"
    >
      <path d="M118 94H192L100 420H26Z" fill="#F3EFE6" fillOpacity=".024" />
      <path d="M118 94H192L100 420H26Z M334 94H408L500 420H426Z" stroke="#F3EFE6" strokeOpacity=".065" />
      <path d="M0 362H136 M362 362H560 M155 60V112 M370 60V112" stroke="#F3EFE6" strokeOpacity=".045" />
      <path d="M214 94H312L297 228H229Z" fill="#C8A45D" fillOpacity=".04" stroke="#C8A45D" strokeOpacity=".13" />
      <path d="M192 94H214 M312 94H334" stroke="#C8A45D" strokeOpacity=".13" />
    </svg>
  );
}

export function MissingConnection() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 440 76"
      fill="none"
      className="business-structure pointer-events-none absolute hidden select-none xl:block"
    >
      <path d="M0 53H151L161 19H187 M253 19H279L289 53H440" stroke="#F3EFE6" strokeOpacity=".08" />
      <path d="M150 69H290 M168 6V65 M272 6V65" stroke="#F3EFE6" strokeOpacity=".045" />
      <path d="M198 10H242L237 53H203Z" fill="#C8A45D" fillOpacity=".04" stroke="#C8A45D" strokeOpacity=".15" />
      <path d="M187 19H198 M242 19H253" stroke="#C8A45D" strokeOpacity=".15" />
    </svg>
  );
}
