export default function NotFound() {
  return (
    <section className="grid min-h-[80svh] place-items-center px-6 pt-32 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-gold">404</p>
        <h1 className="heading-display mt-4 text-5xl md:text-7xl">
          Page not found.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-white/65">
          The page you are looking for may have moved or no longer exists.
        </p>
        <a
          href="/"
          className="mt-10 inline-flex rounded-full bg-gold-gradient px-7 py-3 text-sm text-black"
        >
          Return home
        </a>
      </div>
    </section>
  );
}
