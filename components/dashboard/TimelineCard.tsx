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
    // Note: id="timeline" lives on the page wrapper div, not here, to avoid duplicate IDs.
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

            return (
              <Fragment key={`${item.time}-${item.title}-${i}`}>
                {/* ── Group divider ──────────────────────────────────────────
                     Injected before index 1 ("Up next") and index 3 ("Later").
                     Aligned to start at the content column (past the dot). */}
                {divider && (
                  <div className={`flex items-center gap-3 pl-[31px] ${i > 0 ? "mt-5 mb-4" : "mb-4"}`}>
                    <span className="flex-shrink-0 text-[10px] uppercase tracking-[0.1em] text-white/22">
                      {GROUP_DIVIDER_LABELS[divider]}
                    </span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                )}

                {/* ── Timeline item ─────────────────────────────────────────── */}
                <div className={`flex gap-4 ${i > 0 && !divider ? "mt-6" : i > 0 ? "" : ""}`}>
                  {/* Dot — sky-blue for the first (active) item, muted for the rest */}
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

                    {item.location && (
                      <p className="mt-1.5 text-[12px] text-white/30">
                        <span className="mr-1 text-white/20">Location</span>
                        {item.location}
                      </p>
                    )}

                    {item.document_label && (
                      <p className="mt-1 text-[12px] text-white/30">
                        <span className="mr-1 text-white/20">Doc</span>
                        {item.document_label}
                      </p>
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
