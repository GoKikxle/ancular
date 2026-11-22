"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
];

/**
 * Public header: a thin black beta strip, then a quiet top bar that scrolls away
 * with the page. Once you're past the first screen a small floating dock rises at
 * the bottom with the logo, sign in and start free, so the way in is always a tap away.
 * `base` is "/" on other pages, so the section links lead back to the landing page.
 */
export function MarketingHeader({ base = "", cta = true }: { base?: string; cta?: boolean }) {
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const on = () => setDocked(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <div className="lp-strip">
        <span>
          You&apos;re early. Ancular is in beta<span className="hidden sm:inline">, help shape what it becomes</span>.
        </span>
        <a href="mailto:hello@ancular.com?subject=Ancular%20feedback" className="lp-strip-link">
          Tell us your thoughts
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M3 9l6-6M4 3h5v5" />
          </svg>
        </a>
      </div>

      <header className="lp-top">
        <Logo />
        <nav aria-label="Sections" className="lp-top-nav">
          {NAV.map((n) => (
            <a key={n.href} href={n.href.startsWith("/") ? n.href : `${base}${n.href}`} className="lp-top-link">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/login" className="lp-top-link">
            Sign in
          </Link>
          {cta && (
            <Link href="/signup" className="lp-btn lp-btn-ink lp-btn-sm">
              Start free
            </Link>
          )}
        </div>
      </header>

      <div className="lp-dock" data-show={docked}>
        <Logo />
        <div className="flex items-center gap-1">
          <Link href="/login" className="lp-dock-link">
            Sign in
          </Link>
          <Link href="/signup" className="lp-btn lp-btn-purple lp-btn-sm">
            Start free
          </Link>
        </div>
      </div>
    </>
  );
}
