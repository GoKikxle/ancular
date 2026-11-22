import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
];

/**
 * Public header: a thin black beta strip, then a quiet top bar that scrolls away
 * with the page.
 * `base` is "/" on other pages, so the section links lead back to the landing page.
 */
export function MarketingHeader({ base = "", cta = true }: { base?: string; cta?: boolean }) {

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

    </>
  );
}
