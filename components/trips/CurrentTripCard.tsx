type CurrentTripCardProps = {
  title: string;
  dates: string;
  travelers: string;
  status: string;
};

export function CurrentTripCard({
  title,
  dates,
  travelers,
  status,
}: CurrentTripCardProps) {
  return (
    <section className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">
            Current Trip
          </p>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
          {status}
        </span>
      </div>

      <p className="text-sm text-white/70">
        {dates} • {travelers}
      </p>
    </section>
  );
}