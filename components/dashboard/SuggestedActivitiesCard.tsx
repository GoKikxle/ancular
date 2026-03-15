/**
 * Placeholder for the AI-powered activity suggestions feature.
 * Replace `PLACEHOLDER_SUGGESTIONS` with real data once the
 * activity/recommendation API is integrated.
 */

type SuggestedActivitiesCardProps = {
  tripTitle: string;
};

const PLACEHOLDER_SUGGESTIONS = [
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
        <path d="M6.5 4v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
    label: "Top local experiences",
    detail: "Curated picks near your destination",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M2 10h9M3.5 10V6.5M6.5 10V4M9.5 10V7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
    label: "Restaurant recommendations",
    detail: "Dining spots tailored to your trip",
  },
  {
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path
          d="M6.5 1.5C4.015 1.5 2 3.515 2 6c0 3.485 4.5 7 4.5 7S11 9.485 11 6c0-2.485-2.015-4.5-4.5-4.5Z"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <circle cx="6.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.0" />
      </svg>
    ),
    label: "Getting around",
    detail: "Transport and navigation tips",
  },
] as const;

export function SuggestedActivitiesCard({ tripTitle }: SuggestedActivitiesCardProps) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
            Suggested for You
          </p>
          <p className="mt-0.5 text-[12px] text-white/25">{tripTitle}</p>
        </div>
        <span className="flex-shrink-0 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-white/28">
          Coming soon
        </span>
      </div>

      {/* Suggestion rows */}
      <ul className="space-y-3">
        {PLACEHOLDER_SUGGESTIONS.map((s) => (
          <li
            key={s.label}
            className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3"
          >
            <span className="mt-[1px] flex-shrink-0 text-white/25">{s.icon}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white/50">{s.label}</p>
              <p className="mt-0.5 text-[12px] text-white/28">{s.detail}</p>
            </div>
            <span className="ml-auto flex-shrink-0 self-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] text-white/18">
        Smart suggestions powered by AI — coming in a future update.
      </p>
    </div>
  );
}
