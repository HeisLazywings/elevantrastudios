import Link from "next/link";
import { contact, socialLinks } from "@/lib/data";
import { Instagram, Mail, Music2, Phone } from "lucide-react";
import { siteName } from "@/lib/site";
import BrandLogo from "@/components/BrandLogo";
import { contactNavigation, libraryNavigation, primaryNavigation, studioNavigation } from "@/lib/navigation";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-bg-secondary/40">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" aria-label="Elevantra Studios — Home" className="inline-flex max-w-full">
              <BrandLogo variant="stacked" decorative />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">
              Commercial Systems &amp; Digital Growth Studio. Understand the business.
              Identify what matters. Build what is justified.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: Instagram, href: socialLinks.instagram, label: "Instagram" },
                { icon: Music2, href: socialLinks.tiktok, label: "TikTok" },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in new tab)`} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold/40 hover:text-gold-light">
                  <Icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer studio" className="lg:col-span-3">
            <h2 className="mb-5 text-xs uppercase tracking-[0.22em] text-white/55">Studio</h2>
            <ul className="space-y-3 text-sm text-white/70">
              {studioNavigation.map((link) => <li key={link.href}><Link href={link.href} className="inline-flex min-h-6 hover:text-gold-light">{link.label}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Footer explore" className="lg:col-span-2">
            <h2 className="mb-5 text-xs uppercase tracking-[0.22em] text-white/55">Explore</h2>
            <ul className="space-y-3 text-sm text-white/70">
              {[...primaryNavigation, ...libraryNavigation].map((link) => <li key={link.href}><Link href={link.href} className="inline-flex min-h-6 hover:text-gold-light">{link.label}</Link></li>)}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-3">
            <h2 className="mb-5 text-xs uppercase tracking-[0.22em] text-white/55">Start a conversation</h2>
            <Link href={contactNavigation.href} className="inline-flex min-h-11 items-center border-b border-gold/40 text-sm text-gold-light hover:border-gold-light">{contactNavigation.label}</Link>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              <li><a href={`mailto:${contact.email}`} className="inline-flex min-h-6 items-start gap-3 break-all hover:text-white"><Mail size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />{contact.email}</a></li>
              <li><a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex min-h-6 items-center gap-3 hover:text-white"><Phone size={16} className="shrink-0 text-gold" aria-hidden="true" />{contact.phone}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs leading-relaxed text-white/55">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p>Based in Nigeria. Built with a long-term view.</p>
        </div>
      </div>
    </footer>
  );
}
