"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

export default function LoginForm({ nextPath, denied = false }: { nextPath: string; denied?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(denied ? "This account is not authorised for studio administration." : "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), next: nextPath }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Sign in could not be completed.");
        return;
      }
      // The server only returns a validated local admin path.
      router.replace(result.next || "/admin");
      router.refresh();
    } catch {
      setError("Sign in could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-3 w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3.5 text-base text-white focus:border-gold/60 focus:outline-none";
  return (
    <form onSubmit={onSubmit} className="mt-9 space-y-6" aria-busy={loading}>
      <label className="block text-xs uppercase tracking-[0.15em] text-white/65">
        Email address
        <input name="email" type="email" autoComplete="username" maxLength={254} required className={inputClass} />
      </label>
      <label className="block text-xs uppercase tracking-[0.15em] text-white/65">
        Password
        <input name="password" type="password" autoComplete="current-password" maxLength={1024} required className={inputClass} />
      </label>
      {error && <p role="alert" className="rounded-lg border border-gold/25 bg-gold/[0.06] p-4 text-sm leading-relaxed text-gold-light">{error}</p>}
      <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-medium text-black transition hover:brightness-110 disabled:opacity-60">
        {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : null}
        {loading ? "Signing in…" : "Sign in"}
        {!loading && <ArrowRight size={16} aria-hidden="true" />}
      </button>
    </form>
  );
}
