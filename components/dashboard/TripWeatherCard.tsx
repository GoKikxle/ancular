type TripWeatherCardProps = {
  summary: string | null;
  note: string | null;
};

export function TripWeatherCard({ summary, note }: TripWeatherCardProps) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Weather
      </p>

      {summary ? (
        <div>
          <p className="text-[26px] font-semibold tracking-[-0.02em]">{summary}</p>
          {note && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{note}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M13 7a3.5 3.5 0 00-6.95-.5A3 3 0 104.5 13H13a2.5 2.5 0 000-5z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
                className="text-white/20"
              />
            </svg>
          </div>
          <div>
            <p className="text-[14px] text-white/40">Weather data coming soon</p>
            <p className="mt-0.5 text-[12px] text-white/22">
              Live forecast will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
