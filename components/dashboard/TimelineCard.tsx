type TimelineItem = {
  time: string;
  title: string;
  note: string;
};

type TimelineCardProps = {
  items: TimelineItem[];
};

export function TimelineCard({ items }: TimelineCardProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="timeline"
      className="mb-4 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5"
    >
      <p className="mb-5 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Timeline
      </p>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/[0.07]" />

        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={`${item.time}-${item.title}`} className="flex gap-4">
              {/* Dot */}
              <div className="relative z-10 mt-[3px] flex-shrink-0">
                <div
                  className={`h-[15px] w-[15px] rounded-full border-2 ${
                    i === 0
                      ? "border-sky-400 bg-sky-400/20"
                      : "border-white/[0.18] bg-[#0a0a0a]"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 pb-1">
                <p className="text-[11px] font-medium text-sky-400/75">
                  {item.time}
                </p>
                <h3 className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-white/45">
                  {item.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
