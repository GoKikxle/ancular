"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "#privacy", label: "Privacy" },
];

/**
 * Landing header: logo on the left, a floating dark capsule for the sections in
 * the middle, sign in and create-account on the right. Turns solid once you scroll.
 * `base` is "/" on other pages, so the section links lead back to the landing page.
 */
export function MarketingHeader({ base = "", cta = true }: { base?: string; cta?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="lp-header" data-scrolled={scrolled}>
      <div className="flex items-center gap-2">
        <Logo />
        <span className="rounded-full bg-fill px-[7px] py-[3px] text-[11px] font-semibold leading-none text-ink-2">Beta</span>
      </div>

      <nav aria-label="Sections" className="lp-capsule">
        {NAV.map((n) => (
          <a key={n.href} href={n.href.startsWith("/") ? n.href : `${base}${n.href}`} className="lp-capsule-link">
            {n.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        <Link href="/login" className={`nav-link ${cta ? "hidden sm:inline-flex" : ""}`}>
          Sign in
        </Link>
        {cta && (
          <Link href="/signup" className="btn btn-primary btn-pill btn-sm !px-4">
            Start free
          </Link>
        )}
      </div>
    </header>
  );
}
