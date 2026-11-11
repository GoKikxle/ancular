import Link from "next/link";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";

/** Footer for the public pages: small links, then the oversized wordmark. */
export function MarketingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap flex flex-col gap-4 pb-6 pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-meta">Ancular. For events everywhere. ICO registration ZC297871.</p>
        <nav className="-mx-2 flex">
          <Link href="/privacy" className="nav-link">
            Privacy
          </Link>
          <CookieSettingsLink className="nav-link" />
          <Link href="/login" className="nav-link">
            Sign in
          </Link>
        </nav>
      </div>
      <p className="lp-wordmark" aria-hidden="true">
        ancular
      </p>
    </footer>
  );
}
