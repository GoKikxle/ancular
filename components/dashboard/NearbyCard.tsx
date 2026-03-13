type NearbyCardProps = {
  items: string[];
};

export function NearbyCard({ items }: NearbyCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-3.5 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Nearby
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[14px] text-white/60">
            <span className="flex-shrink-0 text-white/22">
              <svg
                width="11"
                height="13"
                viewBox="0 0 11 13"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5.5 1C3.015 1 1 3.015 1 5.5C1 8.985 5.5 13 5.5 13C5.5 13 10 8.985 10 5.5C10 3.015 7.985 1 5.5 1Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="5.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
