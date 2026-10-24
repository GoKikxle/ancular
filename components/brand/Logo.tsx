import Link from "next/link";

/** Mark: a dot inside a ring, someone found in the crowd. Monochrome, drawn in the current text colour. */
export function LogoMark({ size = 18 }: { size?: number; onIndigo?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="10" cy="10" r="3.5" fill="currentColor" />
    </svg>
  );
}

/** Wordmark, sized like swipe.hex's: 17px bold next to an 18px mark. */
export function Logo({ onIndigo = false, href = "/" }: { onIndigo?: boolean; href?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-[7px] ${onIndigo ? "text-white" : "text-ink"}`}
      aria-label="Ancular home"
    >
      <LogoMark />
      <span className="text-[17px] font-bold leading-none tracking-[-0.03em]">ancular</span>
    </Link>
  );
}
