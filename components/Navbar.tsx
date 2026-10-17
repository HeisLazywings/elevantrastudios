"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      menuPanel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    });

    const close = () => {
      setOpen(false);
      menuButton.current?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "Tab") {
        const items = [menuButton.current, ...Array.from(menuPanel.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])].filter(Boolean) as HTMLElement[];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const media = window.matchMedia("(min-width: 768px)");
    const onBreakpointChange = () => {
      if (media.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    media.addEventListener("change", onBreakpointChange);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      media.removeEventListener("change", onBreakpointChange);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={header}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="container-x">
        <nav
          aria-label="Primary"
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled
              ? "glass-strong shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
              : "bg-transparent"
          }`}
        >
          <Link
            href="/"
            aria-label="Elevantra Studios — Home"
            className="flex flex-none flex-col gap-1 text-white"
          >
            <span className="font-display text-lg leading-none tracking-[0.17em] lg:text-xl">ELEVANTRA</span>
            <span className="text-[0.5rem] leading-none tracking-[0.44em] text-white/55">STUDIOS</span>
          </Link>

          <ul className="hidden items-center gap-5 md:flex lg:gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? (pathname === l.href ? "page" : "location") : undefined}
                  className={`group relative py-3 text-sm transition-colors hover:text-white ${isActive(l.href) ? "text-gold-light" : "text-white/70"}`}
                >
                  {l.label}
                  <span aria-hidden="true" className={`absolute bottom-1 left-0 h-px bg-gold-gradient transition-all duration-300 group-hover:w-full ${isActive(l.href) ? "w-full" : "w-0"}`} />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            className="hidden flex-none rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-white transition-all hover:border-gold/60 hover:bg-gold/10 lg:inline-flex"
          >
            Start A Project
          </Link>

          <button
            ref={menuButton}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuPanel}
              id="mobile-navigation"
              role="navigation"
              aria-label="Mobile"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-strong mt-3 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl p-5 md:hidden"
            >
              <ul className="flex flex-col gap-4">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? (pathname === l.href ? "page" : "location") : undefined}
                      onClick={() => setOpen(false)}
                      className={`block py-2 ${isActive(l.href) ? "text-gold-light" : "text-white/80"}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm"
                  >
                    Start A Project
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
