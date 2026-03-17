import Link from "next/link";
import type { LiveWeatherResult } from "@/lib/weather";

type TripWeatherCardProps = {
  weatherResult: LiveWeatherResult;
  destination?: string | null;
  /** href to the trip edit page — used for the "add destination" CTA when no destination. */
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
 * Live weather via Open-Meteo when destination exists and geocode + fetch succeed.
 *
 * States:
 *   - Live data     → summary (e.g. "18°C · Partly cloudy") + note
 *   - No destination → "Weather unavailable" + "Add a destination..." + CTA
 *   - Geocode/fetch failed → "Weather unavailable for this destination"
 *
 * Same card layout for all states — consistent dark premium styling.
 * No trip editing actions inside the card — only a link to edit when destination is missing.
 */
export function TripWeatherCard({
  weatherResult,
  destination,
  editHref,
}: TripWeatherCardProps) {
  const hasDestination = Boolean(destination?.trim());

  const displaySummary =
    weatherResult.ok === true
      ? weatherResult.summary
      : weatherResult.reason === "no_destination"
      ? "Weather unavailable"
      : "Weather unavailable for this destination";

  const displayNote =
    weatherResult.ok === true
      ? weatherResult.note
      : weatherResult.reason === "no_destination"
      ? "Add a destination to enable weather updates"
      : null;

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

        {/* CTA only when no destination — link to edit page to add one */}
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
