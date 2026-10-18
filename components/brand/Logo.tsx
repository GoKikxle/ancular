import Link from "next/link";

/** Mark: a resist-dyed dot inside a gold ring, the moment you are found in the crowd. */
export function LogoMark({ size = 28, onIndigo = false }: { size?: number; onIndigo?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="var(--gold)" strokeWidth="3" />
      <circle cx="16" cy="16" r="7" fill={onIndigo ? "#fff" : "var(--indigo)"} />
      <circle cx="16" cy="16" r="2.4" fill={onIndigo ? "var(--indigo)" : "var(--resist)"} />
    </svg>
  );
}

export function Logo({ onIndigo = false, href = "/" }: { onIndigo?: boolean; href?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 ${onIndigo ? "text-white" : "text-indigo"}`}
      aria-label="Ancular home"
    >
      <LogoMark onIndigo={onIndigo} />
      <span className="display text-[1.55rem] leading-none" style={{ fontStretch: "75%" }}>
        ancular
      </span>
    </Link>
  );
}
