import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { CookieSettingsLink } from "@/components/consent/CookieConsent";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-page flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="t-meta flex items-center gap-2">
          <span className="text-ink">
            <LogoMark size={14} solid />
          </span>
          Ancular. For events everywhere.
        </div>
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
    </footer>
  );
}
