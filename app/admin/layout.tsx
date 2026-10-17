import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Studio Administration", template: "%s | Elevantra Studios Admin" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
};

// Login shares this shell. Each protected page and API performs its own auth check.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#090a0b]">{children}</div>;
}
