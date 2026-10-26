"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import { contactNavigation, isNavigationActive, mobileNavigation, primaryNavigation, studioNavigation } from "@/lib/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const brandLink = useRef<HTMLAnchorElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const studioButton = useRef<HTMLButtonElement>(null);
  const studioPanel = useRef<HTMLDivElement>(null);
  const studioActive = studioNavigation.some(({ href }) => isNavigationActive(pathname, href));
  const current = (href: string) => isNavigationActive(pathname, href) ? pathname === href ? "page" as const : "location" as const : undefined;

  useEffect(() => { setOpen(false); setStudioOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open && !studioOpen) return;
    const frame = requestAnimationFrame(() => {
      (open ? menuPanel : studioPanel).current?.querySelector<HTMLAnchorElement>("a")?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        setStudioOpen(false);
        (open ? menuButton : studioButton).current?.focus();
      }
      if (open && event.key === "Tab") {
        const links = Array.from(menuPanel.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
        const first = menuButton.current;
        const last = links[links.length - 1];
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
      if (!header.current?.contains(event.target as Node)) {
        if (menuPanel.current?.contains(document.activeElement)) menuButton.current?.focus();
        if (studioPanel.current?.contains(document.activeElement)) studioButton.current?.focus();
        setOpen(false);
        setStudioOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, studioOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onBreakpointChange = () => {
      const mobileFocused = menuPanel.current?.contains(document.activeElement);
      const studioFocused = studioPanel.current?.contains(document.activeElement);
      setOpen(false);
      setStudioOpen(false);
      if (media.matches && mobileFocused) brandLink.current?.focus();
      if (!media.matches && studioFocused) menuButton.current?.focus();
    };
    media.addEventListener("change", onBreakpointChange);
    return () => media.removeEventListener("change", onBreakpointChange);
  }, []);

  return (
    <header ref={header} className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ${scrolled ? "py-3" : "py-4 md:py-5"}`}>
      <div className="container-x">
        <nav aria-label="Primary" className={`flex items-center justify-between gap-2 rounded-xl border p-2 transition-colors duration-300 lg:gap-3 lg:px-3 ${scrolled || open || studioOpen ? "border-white/15 bg-[#0D0D0D]/95" : "border-white/10 bg-[#050505]/80"}`}>
          <Link ref={brandLink} href="/" aria-label="Elevantra Studios — Home" onClick={() => { setOpen(false); setStudioOpen(false); }} className="inline-flex shrink-0">
            <BrandLogo decorative />
          </Link>

          <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
            {primaryNavigation.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={current(link.href)} className={`inline-flex min-h-11 items-center text-sm transition-colors hover:text-gold-light ${current(link.href) ? "text-gold-light" : "text-white/75"}`}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="relative" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setStudioOpen(false);
            }}>
              <button ref={studioButton} type="button" aria-expanded={studioOpen} aria-controls="studio-navigation" onClick={() => setStudioOpen((value) => !value)} onKeyDown={(event) => {
                if (event.key === "ArrowDown") { event.preventDefault(); setStudioOpen(true); }
              }} className={`inline-flex min-h-11 items-center gap-2 text-sm transition-colors hover:text-gold-light ${studioActive || studioOpen ? "text-gold-light" : "text-white/75"}`}>
                Studio <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${studioOpen ? "rotate-180" : ""}`} />
                {studioActive && <span className="sr-only"> (current section)</span>}
              </button>
              <AnimatePresence>
                {studioOpen && (
                  <motion.div ref={studioPanel} id="studio-navigation" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.16 }} className="absolute right-[-2rem] top-full mt-3 w-[340px] rounded-xl border border-white/15 bg-[#111210] p-3">
                    <p className="px-3 pb-2 pt-2 text-[0.6rem] uppercase tracking-[0.22em] text-white/55">How we think & work</p>
                    <ul>
                      {studioNavigation.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} aria-current={current(link.href)} onClick={() => setStudioOpen(false)} className={`block rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.04] ${current(link.href) ? "text-gold-light" : "text-white/85"}`}>
                            <span className="block text-sm">{link.label}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-white/50">{link.description}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          <Link href={contactNavigation.href} className="hidden min-h-11 shrink-0 items-center rounded-full border border-gold/45 px-5 py-2.5 text-sm text-gold-light transition-colors hover:bg-gold/10 lg:inline-flex">
            {contactNavigation.label}
          </Link>
          <button ref={menuButton} type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => { setOpen((value) => !value); setStudioOpen(false); }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-white lg:hidden">
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div ref={menuPanel} id="mobile-navigation" role="navigation" aria-label="Mobile" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="mt-3 max-h-[calc(100dvh-8.5rem)] overflow-y-auto rounded-xl border border-white/15 bg-[#0D0D0D] px-5 py-4 lg:hidden">
              <ul className="divide-y divide-white/[0.06]">
                {mobileNavigation.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={current(link.href)} onClick={() => setOpen(false)} className={`flex min-h-11 items-center py-2 text-sm ${current(link.href) ? "text-gold-light" : "text-white/80"}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={contactNavigation.href} onClick={() => setOpen(false)} className="mt-4 flex min-h-11 items-center justify-center rounded-full border border-gold/45 bg-gold/[0.06] px-4 py-3 text-sm text-gold-light">
                {contactNavigation.label}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
