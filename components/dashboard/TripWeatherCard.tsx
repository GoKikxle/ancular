import Link from "next/link";
import { classifyDestination } from "@/lib/trip-destination";

type TripWeatherCardProps = {
  destination?: string | null;
  summary: string | null;
  note: string | null;
  /** href to the trip edit page — used for the "add destination" CTA. */
  editHref: string;
};

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M15 8a4 4 0 00-7.87-.9A3.5 3.5 0 105 15h10a3 3 0 000-6z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
 * Three destination-driven states:
 *
 *   missing   — no destination set.
 *               Prompt: "Add a destination to enable weather and trip insights"
 *               CTA: link to edit trip.
 *
 *   weak      — destination too short or too generic (e.g. "trip", "home").
 *               Prompt: "Add a more specific destination (e.g. Barcelona, Spain)…"
 *               CTA: link to edit trip.
 *
 *   valid     — destination looks like a real place.
 *               • If weather_summary is set: show real summary + note.
 *               • Otherwise: show a named placeholder for this destination.
 *
 * Backward-compat rule: if destination is null but weather_summary exists
 * (seeded/legacy trips), the real weather data is still shown.
 */
export function TripWeatherCard({
  destination,
  summary,
  note,
  editHref,
}: TripWeatherCardProps) {
  const strength = classifyDestination(destination);

  // Backward-compat: seeded trips may have weather data but no destination yet.
  // In that case, show the data rather than the missing-destination prompt.
  const hasLegacyWeather = !destination && summary;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Weather
      </p>

      {/* ── State: real weather data (valid destination OR legacy seeded data) ── */}
      {(strength === "valid" || hasLegacyWeather) && summary ? (
        <div>
          <p className="text-[26px] font-semibold tracking-[-0.02em]">{summary}</p>
          {note && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{note}</p>
          )}
        </div>

      ) : strength === "valid" ? (
        // ── Valid destination but no live data yet ──────────────────────────────
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <CloudIcon className="text-white/25" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-white/55">
              {destination}
            </p>
            <p className="mt-0.5 text-[12px] text-white/30">
              Live forecast coming soon
            </p>
          </div>
        </div>

      ) : strength === "weak" ? (
        // ── Weak / ambiguous destination ────────────────────────────────────────
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
              <CloudIcon className="text-white/20" />
            </div>
            <div>
              <p className="text-[13px] font-medium leading-snug text-white/50">
                Add a more specific destination
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-white/30">
                Try something like &ldquo;Barcelona, Spain&rdquo; or &ldquo;Tokyo, Japan&rdquo; to
                see weather updates.
              </p>
            </div>
          </div>
          <Link
            href={editHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.05] px-3 py-2 text-[12px] font-medium text-white/45 transition-colors hover:border-white/[0.18] hover:text-white/70"
          >
            <PencilIcon />
            Edit destination
          </Link>
        </div>

      ) : (
        // ── Missing destination ─────────────────────────────────────────────────
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
              <CloudIcon className="text-white/15" />
            </div>
            <div>
              <p className="text-[13px] font-medium leading-snug text-white/45">
                Add a destination
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-white/28">
                Set a destination to enable weather forecasts and trip insights.
              </p>
            </div>
          </div>
          <Link
            href={editHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.05] px-3 py-2 text-[12px] font-medium text-white/45 transition-colors hover:border-white/[0.18] hover:text-white/70"
          >
            <PencilIcon />
            Add destination
          </Link>
        </div>
      )}
    </div>
  );
}
