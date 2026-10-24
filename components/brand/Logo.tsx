import Link from "next/link";

/*
  The Ancular mark: a small half-round and a rounded body with a lens in it.
  Read as a camera, or as a padlock on its side with a lens for a keyhole:
  private photos. Line version for the header; solid version for icons and
  anything smaller than about 20px.
*/

export function LogoMark({ size = 18, solid = false }: { size?: number; solid?: boolean }) {
  const width = Math.round((size * 28) / 24);
  if (solid) {
    return (
      <svg width={width} height={size} viewBox="3 0 28 24" fill="currentColor" aria-hidden="true">
        <path d="M10.5 6A6 6 0 0 0 10.5 18Z" />
        <path fillRule="evenodd" d="M12 2H20A10 10 0 0 1 20 22H12ZM24 12A4.5 4.5 0 1 0 15 12A4.5 4.5 0 1 0 24 12Z" />
        <circle cx="19.5" cy="12" r="2" />
      </svg>
    );
  }
  // Thicker line at small sizes so it doesn't fade out.
  const stroke = size <= 16 ? 2.6 : size <= 22 ? 2.4 : 2;
  return (
    <svg
      width={width}
      height={size}
      viewBox="4 0 28 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2H20A10 10 0 0 1 20 22H12ZM12 6A6 6 0 0 0 12 18" />
      <circle cx="19.5" cy="12" r="3.5" />
    </svg>
  );
}

/** Wordmark, sized like swipe.hex's: 17px bold next to the mark. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-[7px] text-ink" aria-label="Ancular home">
      <LogoMark />
      <span className="text-[17px] font-bold leading-none tracking-[-0.03em]">ancular</span>
    </Link>
  );
}
