"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowUpRight, Files, ImageIcon, LogOut } from "lucide-react";
import "./admin.css";
import BrandLogo from "@/components/BrandLogo";

export default function AdminShell({ children, email }: { children: ReactNode; email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not sign out. Please try again.");
      router.replace("/admin/login");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign out.");
      setSigningOut(false);
    }
  }

  return (
    <div className="cms-root">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-black focus:p-4 focus:text-white">Skip to content</a>
      <header className="cms-header">
        <div className="cms-header-inner">
          <Link href="/admin" className="cms-brand" aria-label="Elevantra Studios dashboard">
            <BrandLogo variant="symbol" decorative />
            <span className="cms-brand-name">Elevantra Studios<span>Private editorial desk</span></span>
          </Link>
          <nav className="cms-nav" aria-label="Administration">
            <Link href="/admin" aria-current={pathname === "/admin" || pathname.startsWith("/admin/entries") ? "page" : undefined}><Files size={15} aria-hidden="true" /> Content</Link>
            <Link href="/admin/media" aria-current={pathname === "/admin/media" ? "page" : undefined}><ImageIcon size={15} aria-hidden="true" /> Media library</Link>
          </nav>
          <div className="cms-user">
            <span className="cms-user-email">{email}</span>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="cms-button cms-button-secondary cms-button-small">View site <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></Link>
            <button type="button" className="cms-button cms-button-secondary cms-button-small" onClick={signOut} disabled={signingOut}><LogOut size={14} aria-hidden="true" /><span>{signingOut ? "Signing out…" : "Sign out"}</span></button>
          </div>
        </div>
      </header>
      <main id="admin-main" className="cms-main">
        {error && <p role="alert" className="cms-alert">{error}</p>}
        {children}
      </main>
    </div>
  );
}
