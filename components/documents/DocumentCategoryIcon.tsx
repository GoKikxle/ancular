import type { DocumentCategory } from "@/types/document";

const colorClass: Record<DocumentCategory, string> = {
  flight: "text-sky-400/70",
  hotel: "text-violet-400/70",
  identity: "text-amber-400/70",
  booking: "text-emerald-400/70",
  other: "text-white/30",
};

const label: Record<DocumentCategory, string> = {
  flight: "Flight",
  hotel: "Hotel",
  identity: "Identity",
  booking: "Booking",
  other: "Other",
};

export function DocumentCategoryIcon({ category }: { category: DocumentCategory }) {
  return (
    <span className={`flex-shrink-0 ${colorClass[category]}`} title={label[category]}>
      <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true">
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
  );
}

export function categoryLabel(category: DocumentCategory): string {
  return label[category];
}
