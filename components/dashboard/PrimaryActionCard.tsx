"use client";

import { motion } from "framer-motion";
import type { PrimaryActionView } from "@/lib/timeline-view-model";

/**
 * Primary action hero card — the first thing a user reads on the trip page.
 *
 * Three rendering states driven by PrimaryActionView:
 *
 *   1. Active   (fromTimeline: true)
 *      First real timeline item. Sky-blue hero with time badge, title, subtitle.
 *
 *   2. Guidance (fromTimeline: false, isEmpty: false)
 *      No timeline items but the trip has fallback copy. Sky-blue hero with trip
 *      info. CTA says "Add action" to guide the user toward building a timeline.
 *
 *   3. Empty    (isEmpty: true)
 *      No timeline items AND no fallback copy — renders after all items are deleted
 *      on a trip with no next_action_title set. Muted placeholder card so the hero
 *      slot never shows a blank sky-blue card with an empty title.
 */
export function PrimaryActionCard({
  title,
  subtitle,
  time,
  documentLabel,
  fromTimeline,
  hasDocuments,
  isEmpty,
}: PrimaryActionView) {
  // ── State 3: empty ────────────────────────────────────────────────────────────
  // Muted placeholder — communicates "nothing here yet" without a broken hero.
  if (isEmpty) {
    return (
      <section className="mb-4 rounded-3xl border border-dashed border-white/[0.10] bg-white/[0.03] px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/25">
          No actions yet
        </p>
        <p className="mt-2 text-[15px] font-medium leading-snug text-white/35">
          Add your first booking to start building your timeline.
        </p>
        <motion.a
          href="#timeline"
          whileTap={{ scale: 0.97 }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.05] py-3 text-[14px] font-semibold text-white/45"
        >
          Add first action
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
        </motion.a>
      </section>
    );
  }

  // ── States 1 & 2: active or guidance ─────────────────────────────────────────

  const label = fromTimeline ? "Next action" : "Up next";

  // CTA destination: documents (if attached) → timeline (to add/view actions)
  const ctaHref = hasDocuments ? "#documents" : "#timeline";

  // CTA label:
  //   documents exist          → "View documents"
  //   real timeline item       → "See itinerary"
  //   fallback copy, no items  → "Add action" (more direct than "Go to timeline")
  const ctaLabel = hasDocuments
    ? "View documents"
    : fromTimeline
    ? "See itinerary"
    : "Add action";

  return (
    <section className="mb-4 rounded-3xl bg-sky-500 px-5 pb-5 pt-5">
      {/* ── Row 1: section label + time badge ──────────────────────────────────── */}
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

      {/* ── Row 2: title ───────────────────────────────────────────────────────── */}
      <h3 className="mt-3 text-[25px] font-semibold leading-tight tracking-[-0.025em] text-sky-950">
        {title}
      </h3>

      {/* ── Row 3: subtitle — note as route / venue / context ──────────────────── */}
      {subtitle && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-sky-950/50">
          {subtitle}
        </p>
      )}

      {/* ── Row 4: document label chip (future schema field) ───────────────────── */}
      {documentLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-950/[0.10] px-2.5 py-1 text-[11px] font-medium text-sky-950/60">
          <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="0.9" />
            <path d="M2 3.5h5M2 5.5h5M2 7.5h3" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
          </svg>
          {documentLabel}
        </span>
      )}

      {/* ── Row 5: CTA ─────────────────────────────────────────────────────────── */}
      <motion.a
        href={ctaHref}
        whileTap={{ scale: 0.97 }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-950/90 py-3 text-[14px] font-semibold text-white"
      >
        {ctaLabel}
        {hasDocuments ? (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M6.5 2v9M3.5 8l3 3.5 3-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </motion.a>
    </section>
  );
}
