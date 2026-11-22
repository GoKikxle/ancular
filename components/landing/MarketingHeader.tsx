import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "#features", label: "Product" },
  { href: "#solutions", label: "Solutions" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
];

/**
 * Public header: sticks to the top on white, with the section links in the
 * middle and sign in, talk to us and start free on the right.
 * `base` is "/" on other pages, so the section links lead back to the landing page.
 */
export function MarketingHeader({
  base = "",
  cta = true,
}: {
  base?: string;
  cta?: boolean;
}) {
  return (
    <header className="v3-top">
      <div className="v3-top-inner">
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Sections" className="v3-top-nav">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href.startsWith("/") ? n.href : `${base}${n.href}`}
                className="v3-top-link"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="v3-top-link">
            Sign in
          </Link>
          <a
            href="mailto:hello@ancular.com?subject=Ancular%20for%20our%20events"
            className="lp-btn lp-btn-sm v3-btn-line v3-hide-sm"
          >
            Talk to us
          </a>
          {cta && (
            <Link href="/signup" className="lp-btn lp-btn-ink lp-btn-sm">
              Start free
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
