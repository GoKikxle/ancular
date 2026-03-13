type TimelineCardProps = {
  items: {
    time: string;
    title: string;
    note: string;
  }[];
};

export function TimelineCard({ items }: TimelineCardProps) {
  return (
    <section
      id="timeline"
      className="rounded-3xl border border-white/10 bg-white/5 p-4"
    >
      <p className="text-xs uppercase tracking-wide text-white/50">
        Timeline
      </p>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.time}-${item.title}`}
            className="rounded-2xl border border-white/10 bg-black/10 p-3"
          >
            <p className="text-xs text-sky-300">{item.time}</p>
            <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-white/70">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}