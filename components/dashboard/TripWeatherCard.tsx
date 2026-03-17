import Link from "next/link";

type TripWeatherCardProps = {
  destination?: string | null;
  summary: string | null;
  note: string | null;
  /** href to the trip edit page — used for the "add destination" CTA. */
  editHref: string;
};

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7.8 1.2a1.13 1.13 0 011.6 1.6L3.6 8.6 1 9.5 1.9 7 7.8 1.2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Weather section on the trip detail page.
 *
 * Three states (in priority order):
 *
 *   1. weather_summary exists → show real weather content (summary + note)
 *   2. destination exists    → destination-aware fallback:
 *      summary: "Destination set: Barcelona, Spain"
 *      note: "Live weather integration coming soon"
 *   3. no destination       → empty state:
 *      summary: "Weather unavailable"
 *      note: "Add a destination to enable weather updates"
 *      + CTA link to edit trip
 *
 * Same card layout for all three states — consistent dark premium styling.
 */
export function TripWeatherCard({
  destination,
  summary,
  note,
  editHref,
}: TripWeatherCardProps) {
  const hasDestination = Boolean(destination?.trim());
  const hasRealWeather = Boolean(summary?.trim());

  const displaySummary = hasRealWeather
    ? summary!
    : hasDestination
    ? `Destination set: ${destination!.trim()}`
    : "Weather unavailable";

  const displayNote = hasRealWeather
    ? note ?? null
    : hasDestination
    ? "Live weather integration coming soon"
    : "Add a destination to enable weather updates";

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Weather
      </p>

      <div>
        <p className="text-[26px] font-semibold tracking-[-0.02em]">{displaySummary}</p>
        {displayNote && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{displayNote}</p>
        )}

        {/* CTA only when no destination — prompt user to add one */}
        {!hasDestination && (
          <Link
            href={editHref}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.05] px-3 py-2 text-[12px] font-medium text-white/45 transition-colors hover:border-white/[0.18] hover:text-white/70"
          >
            <PencilIcon />
            Add destination
          </Link>
        )}
      </div>
    </div>
  );
}
