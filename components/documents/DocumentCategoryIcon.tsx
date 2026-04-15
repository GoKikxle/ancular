import type { DocumentCategory } from "@/types/document";

const colorClass: Record<DocumentCategory, string> = {
  flight: "text-sky-400/70",
  hotel: "text-violet-400/70",
  identity: "text-amber-400/70",
  booking: "text-emerald-400/70",
  other: "text-white/30",
};

/** Restrained accents on light surfaces (Vault, etc.) */
const colorClassOnLight: Record<DocumentCategory, string> = {
  flight: "text-sky-700/75 dark:text-sky-400/80",
  hotel: "text-violet-700/75 dark:text-violet-400/80",
  identity: "text-amber-800/75 dark:text-amber-400/80",
  booking: "text-emerald-800/75 dark:text-emerald-400/80",
  other: "text-[#9A9A9A] dark:text-white/35",
};

const label: Record<DocumentCategory, string> = {
  flight: "Flight",
  hotel: "Hotel",
  identity: "Identity",
  booking: "Booking",
  other: "Other",
};

export function DocumentCategoryIcon({
  category,
  variant = "default",
}: {
  category: DocumentCategory;
  /** `onLight` — softer contrast for light-mode cards */
  variant?: "default" | "onLight";
}) {
  const palette = variant === "onLight" ? colorClassOnLight : colorClass;
  return (
    <span className={`flex-shrink-0 ${palette[category]}`} title={label[category]}>
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
