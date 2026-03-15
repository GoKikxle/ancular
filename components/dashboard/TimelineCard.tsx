import { Fragment } from "react";
import { shouldShowGroupDivider, GROUP_DIVIDER_LABELS } from "@/lib/timeline-view-model";

export type TimelineItem = {
  time: string;
  title: string;
  note: string;
  /** Physical location or gate info. TODO: backed by `location` column in timeline_items */
  location?: string | null;
  /** Label for an associated document (e.g. "Boarding Pass"). TODO: backed by `document_label` column */
  document_label?: string | null;
};

type TimelineCardProps = {
  items: TimelineItem[];
};

export function TimelineCard({ items }: TimelineCardProps) {
  if (items.length === 0) return null;

  return (
    // Note: id="timeline" lives on the page wrapper div in page.tsx, not here.
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5">
      <p className="mb-5 text-[11px] uppercase tracking-[0.1em] text-white/35">
        Itinerary
      </p>

      <div className="relative">
        {/* Vertical connector line — runs behind all items */}
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/[0.07]" />

        <div>
          {items.map((item, i) => {
            const divider = shouldShowGroupDivider(i);

            // Items at index 3+ are in the "Later" group — step down their
            // visual weight so the hierarchy current → next → later reads clearly.
            const isLater = i >= 3;

            return (
              <Fragment key={`${item.time}-${item.title}-${i}`}>
                {/* ── Group divider ───────────────────────────────────────────
                     Injected before index 1 ("Up next") and index 3 ("Later").
                     More visible than before (text-white/32, line bg-white/[0.09])
                     so the groups actually register on mobile. */}
                {divider && (
                  <div
                    className={`flex items-center gap-3 pl-[31px] ${
                      i > 0 ? "mb-4 mt-6" : "mb-4"
                    }`}
                  >
                    <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/32">
                      {GROUP_DIVIDER_LABELS[divider]}
                    </span>
                    <div className="h-px flex-1 bg-white/[0.09]" />
                  </div>
                )}

                {/* ── Timeline item ──────────────────────────────────────────── */}
                <div
                  className={`flex gap-4 ${i > 0 && !divider ? "mt-6" : i > 0 ? "" : ""}`}
                >
                  {/* Dot — filled solid sky-blue for item 0 (active/current),
                       outlined + smaller opacity for upcoming, more muted for later. */}
                  <div className="relative z-10 mt-[3px] flex-shrink-0">
                    <div
                      className={`h-[15px] w-[15px] rounded-full border-2 ${
                        i === 0
                          ? "border-sky-400 bg-sky-400" // solid fill → clearly active
                          : isLater
                          ? "border-white/[0.12] bg-[#0a0a0a]" // dimmed for later
                          : "border-white/[0.22] bg-[#0a0a0a]" // standard upcoming
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 pb-1">
                    {/* Time — slightly larger than before so it's the first
                         thing scanned per row. Active item time is vivid. */}
                    <p
                      className={`text-[12px] font-medium tabular-nums ${
                        i === 0
                          ? "text-sky-400"
                          : isLater
                          ? "text-white/28"
                          : "text-sky-400/60"
                      }`}
                    >
                      {item.time}
                    </p>

                    <h3
                      className={`mt-0.5 font-semibold tracking-[-0.01em] ${
                        i === 0
                          ? "text-[16px] text-white" // active: slightly larger, full white
                          : isLater
                          ? "text-[14px] text-white/55" // later: stepped down
                          : "text-[15px] text-white/90" // upcoming: near-full
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`mt-1 text-[13px] leading-relaxed ${
                        isLater ? "text-white/30" : "text-white/45"
                      }`}
                    >
                      {item.note}
                    </p>

                    {item.location && (
                      <p className="mt-1.5 text-[12px] text-white/28">
                        <span className="mr-1 text-white/18">at</span>
                        {item.location}
                      </p>
                    )}

                    {item.document_label && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/38">
                        {item.document_label}
                      </span>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
