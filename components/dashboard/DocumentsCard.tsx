type DocumentsCardProps = {
  items: string[];
};

export function DocumentsCard({ items }: DocumentsCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-3.5 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Documents
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[14px] text-white/60">
            <span className="flex-shrink-0 text-white/22">
              <svg
                width="13"
                height="14"
                viewBox="0 0 13 14"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="1"
                  width="10"
                  height="12"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M4 5h5M4 7.5h5M4 10h3"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
