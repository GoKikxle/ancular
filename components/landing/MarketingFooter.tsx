import Link from "next/link";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";
import { IconDot } from "./PixelIcon";

/** Footer for the public pages: the colour dots, small links, then the oversized wordmark. */
export function MarketingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap flex flex-col gap-8 pb-8 pt-16 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex -space-x-2">
            <IconDot name="camera" color="var(--c-purple)" size={40} />
            <IconDot name="heart" color="var(--c-pink)" size={40} />
            <IconDot name="smile" color="var(--c-yellow)" size={40} />
            <IconDot name="lock" color="var(--c-mint)" size={40} />
          </div>
          <p className="mt-5 max-w-xs text-[15px] leading-[1.45] text-ink-3">
            Private photo finding for events everywhere.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
          <Link href="/pricing" className="lp-foot-link">
            Pricing
          </Link>
          <Link href="/privacy" className="lp-foot-link">
            Privacy
          </Link>
          <CookieSettingsLink className="lp-foot-link" />
          <a href="mailto:hello@ancular.com" className="lp-foot-link">
            hello@ancular.com
          </a>
          <Link href="/login" className="lp-foot-link">
            Sign in
          </Link>
        </nav>
      </div>
      <div className="lp-wrap">
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
