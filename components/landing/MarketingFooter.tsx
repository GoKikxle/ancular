import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";

/** Footer for the public pages: link columns, the company line, then the oversized wordmark. */
export function MarketingFooter() {
  return (
    <footer className="lp-footer v3-footer">
      <div className="v3-wrap grid gap-10 pb-12 pt-20 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="v3-small mt-4 max-w-xs">
            Private photo delivery for events, matched to every guest.
          </p>
        </div>
        <nav aria-label="Product" className="v3-foot-col">
          <p className="v3-caps">Product</p>
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <nav aria-label="Company" className="v3-foot-col">
          <p className="v3-caps">Company</p>
          <a href="mailto:hello@ancular.com">hello@ancular.com</a>
          <Link href="/privacy">Privacy</Link>
          <CookieSettingsLink className="text-left" />
        </nav>
        <nav aria-label="Account" className="v3-foot-col">
          <p className="v3-caps">Account</p>
          <Link href="/login">Sign in</Link>
          <Link href="/signup">Start free</Link>
        </nav>
      </div>
      <div className="v3-wrap">
        <p className="lp-legal">
          © {new Date().getFullYear()} Halvane Ltd. Ancular is a trading name of
          Halvane Ltd, a company registered in England and Wales. 167-169 Great
          Portland Street, London, W1W 5PF. ICO registration ZC297871.
        </p>
      </div>
      <p className="lp-wordmark" aria-hidden="true">
        ancular
      </p>
    </footer>
  );
}
