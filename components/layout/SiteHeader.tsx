import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Top bar, laid out like swipe.hex: logo left, small nav in the middle,
 * one black action on the right. 49px tall with a hairline under it.
 */
export function SiteHeader({
  logoHref = "/",
  nav,
  action,
}: {
  logoHref?: string;
  nav?: { href: string; label: string; current?: boolean }[];
  action?: React.ReactNode;
}) {
  return (
    <header className="site-header">
      <div className="flex h-full items-center justify-between gap-4 px-3 sm:px-4">
        <Logo href={logoHref} />
        {nav && nav.length > 0 && (
          <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link" aria-current={item.current ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">{action}</div>
      </div>
    </header>
  );
}

/** Round initials button that opens account settings. */
export function AccountButton({ name, href = "/settings" }: { name: string; href?: string }) {
  const initials =
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?";
  return (
    <Link
      href={href}
      aria-label="Your account"
      className="grid h-8 w-8 place-items-center rounded-full bg-fill text-[11px] font-semibold text-ink-2 hover:bg-[var(--fill-hover)]"
    >
      {initials}
    </Link>
  );
}
