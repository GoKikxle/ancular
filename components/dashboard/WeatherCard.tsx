type WeatherCardProps = {
  summary: string;
  note: string;
};

export function WeatherCard({ summary, note }: WeatherCardProps) {
  if (!summary) return null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Weather
      </p>
      <p className="text-[26px] font-semibold tracking-[-0.02em]">{summary}</p>
      {note && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{note}</p>
      )}
    </div>
  );
}
