import Link from "next/link";
import { contact } from "@/lib/data";
import { Github, Instagram, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-bg-secondary/40">
      <div className="container-x py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link
              href="/"
              className="font-display text-xl tracking-[0.25em]"
            >
              ELEVANTA
            </Link>
            <p className="mt-6 max-w-sm text-sm text-white/60">
              Digital Experiences That Elevate Businesses.
            </p>
            <div className="mt-8 flex gap-3">
              {[
                {
                icon: Linkedin,
                 href: "https://www.linkedin.com/in/ahmed-abdulsalam-a91449366",
                label: "LinkedIn",
                 },
                 {
                 icon: Instagram,
                href: "https://www.instagram.com/datguylazywings",
                label: "Instagram",
                  },
                ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                 rel="noopener noreferrer"
                  aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:border-gold/40 hover:bg-gold/10 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-white/40">
              Navigate
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/services" className="hover:text-white">Services</Link></li>
              <li><Link href="/work" className="hover:text-white">Work</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-white/40">
              Contact
            </h3>
            <ul className="space-y-4 text-sm text-white/80">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="group inline-flex items-center gap-3 hover:text-white"
                >
                  <Mail size={16} className="text-gold" />
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="group inline-flex items-center gap-3 hover:text-white"
                >
                  <Phone size={16} className="text-gold" />
                  {contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Elevanta Studio. All rights reserved.</p>
          <p>Crafted with care in Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
