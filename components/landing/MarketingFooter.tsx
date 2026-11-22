import Link from "next/link";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";

/** Footer for the public pages: one line and the links, the company line, then the oversized wordmark. */
export function MarketingFooter() {
  return (
    <footer className="lp-footer v3-footer">
      <div className="v3-wrap flex flex-col gap-6 pb-8 pt-16 md:flex-row md:items-center md:justify-between">
        <p className="v3-foot-line">Private photo finding for events everywhere.</p>
        <nav aria-label="Footer" className="v3-foot-links">
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
          <CookieSettingsLink />
          <a href="mailto:hello@ancular.com">hello@ancular.com</a>
          <Link href="/login">Sign in</Link>
        </nav>
      </div>
      <div className="v3-wrap">
        <p className="lp-legal">
          © {new Date().getFullYear()} Halvane Ltd. Ancular is a trading name of Halvane Ltd, a company registered in
          England and Wales. 167-169 Great Portland Street, London, W1W 5PF. ICO registration ZC297871.
        </p>
      </div>
      <p className="lp-wordmark" aria-hidden="true">
        ancular
      </p>
    </footer>
  );
}
