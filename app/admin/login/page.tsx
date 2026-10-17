import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession, safeAdminPath } from "@/lib/cms/auth";
import LoginForm from "./LoginForm";
import SetupRequired from "../setup-required";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeAdminPath(params.next);
  const session = await getAdminSession();
  if (session.status === "authenticated") redirect(nextPath);
  if (session.status === "unavailable") return <SetupRequired />;

  return (
    <div className="px-5 py-8 sm:px-8 sm:py-12">
      <header className="mx-auto max-w-md border-b border-white/10 pb-7">
        <Link href="/" className="font-display text-xl tracking-[0.12em]">ELEVANTRA <span className="text-white/50">STUDIOS</span></Link>
      </header>
      <section className="mx-auto max-w-md py-10 sm:py-12">
        <p className="text-xs uppercase tracking-[0.24em] text-gold-light">Private access</p>
        <h1 className="mt-6 font-display text-5xl leading-tight">Welcome back.</h1>
        <p className="mt-5 leading-relaxed text-white/60">
          Sign in with your approved studio account to manage articles, projects, and media.
        </p>
        <LoginForm nextPath={nextPath} denied={session.status === "forbidden" || params.reason === "forbidden"} />
        <p className="mt-8 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/40">
          Access is by invitation. There is no public account registration.
        </p>
      </section>
    </div>
  );
}
