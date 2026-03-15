"use client";

import { motion } from "framer-motion";
import type { PrimaryActionView } from "@/lib/timeline-view-model";

/**
 * Primary action hero card — the first thing a user reads on the trip page.
 *
 * Layout priority (top → bottom):
 *   1. Label ("Next action") + time badge  ← anchor fact: when
 *   2. Title                               ← what
 *   3. Subtitle (note as context)          ← where / route
 *   4. Document label chip (future field)  ← which document
 *   5. CTA                                 ← action
 */
export function PrimaryActionCard({
  title,
  subtitle,
  time,
  documentLabel,
  fromTimeline,
  hasDocuments,
}: PrimaryActionView) {
  const label = fromTimeline ? "Next action" : "Up next";

  const ctaHref = hasDocuments ? "#documents" : "#timeline";
  const ctaLabel = hasDocuments
    ? "View documents"
    : fromTimeline
    ? "See itinerary"
    : "Go to timeline";

  return (
    <section className="mb-4 rounded-3xl bg-sky-500 px-5 pb-5 pt-5">
      {/* ── Row 1: section label + time badge ────────────────────────────────
           The time badge is the highest-confidence fact on the card.
           Larger, darker, tabular-nums mono so it reads instantly. */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-950/45">
          {label}
        </p>

        {time && (
          <span className="flex-shrink-0 rounded-full bg-sky-950/[0.14] px-3.5 py-1.5 font-mono text-[15px] font-bold tabular-nums tracking-tight text-sky-950/80">
            {time}
          </span>
        )}
      </div>

      {/* ── Row 2: title — the main event name ───────────────────────────────
           Larger than before. Tight tracking mirrors the trip header style. */}
      <h3 className="mt-3 text-[25px] font-semibold leading-tight tracking-[-0.025em] text-sky-950">
        {title}
      </h3>

      {/* ── Row 3: subtitle — note repurposed as route / venue / context ─────
           Clearly muted relative to the title so hierarchy is unambiguous. */}
      {subtitle && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-sky-950/50">
          {subtitle}
        </p>
      )}

      {/* ── Row 4: document label chip ────────────────────────────────────────
           Backed by the optional `document_label` column in timeline_items.
           Renders only when the column is populated (future schema). */}
      {documentLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-950/[0.10] px-2.5 py-1 text-[11px] font-medium text-sky-950/60">
          <svg
            width="9"
            height="11"
            viewBox="0 0 9 11"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="0.5"
              y="0.5"
              width="8"
              height="10"
              rx="1"
              stroke="currentColor"
              strokeWidth="0.9"
            />
            <path
              d="M2 3.5h5M2 5.5h5M2 7.5h3"
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </svg>
          {documentLabel}
        </span>
      )}

      {/* ── Row 5: CTA ───────────────────────────────────────────────────────
           Full-width on mobile for a reliable touch target.
           Arrow direction: ↓ for documents (scroll down), → for timeline. */}
      <motion.a
        href={ctaHref}
        whileTap={{ scale: 0.97 }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-950/90 py-3 text-[14px] font-semibold text-white"
      >
        {ctaLabel}
        {hasDocuments ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6.5 2v9M3.5 8l3 3.5 3-3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 6.5h8M7.5 3.5l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </motion.a>
    </section>
  );
}
