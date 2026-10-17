import Link from "next/link";

export default function SetupRequired() {
  return (
    <div className="px-5 py-12 sm:px-8 sm:py-20">
      <section className="mx-auto max-w-xl rounded-2xl border border-gold/25 bg-gold/[0.04] p-7 sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-light">Private workspace</p>
        <h1 className="mt-5 font-display text-4xl leading-tight">Administration is not ready yet.</h1>
        <p className="mt-5 leading-relaxed text-white/65">
          Complete the Supabase connection, database setup, and administrator access
          before signing in. If setup is complete, the service may be temporarily unavailable.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/55">
          Use the repository&rsquo;s CMS setup guide. Credentials belong in your secure
          environment settings.
        </p>
        <Link href="/" className="mt-7 inline-flex min-h-11 items-center text-sm text-gold-light underline underline-offset-4">
          Return to the studio
        </Link>
      </section>
    </div>
  );
}
