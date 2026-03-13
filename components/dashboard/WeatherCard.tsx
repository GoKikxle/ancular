type WeatherCardProps = {
  summary: string;
  note: string;
};

export function WeatherCard({ summary, note }: WeatherCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-white/50">Weather</p>
      <h3 className="mt-2 text-2xl font-semibold">{summary}</h3>
      <p className="mt-1 text-sm text-white/70">{note}</p>
    </div>
  );
}