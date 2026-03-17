"use client";

import { motion } from "framer-motion";
import type { PrimaryActionView } from "@/lib/timeline-view-model";

// ─── Date formatter ─────────────────────────────────────────────────────────
// Build a local-time Date from "YYYY-MM-DD" (no UTC midnight shift).
// Returns a compact string like "Mon 15 Apr".
function formatEventDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.5h8M7.5 3.5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="11" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 4.5h6M3 7h6M3 9.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Primary action hero card — the first thing a user reads on the trip page.
 *
 * Three rendering states driven by PrimaryActionView:
 *
 *   1. Active   (fromTimeline: true)
 *      First real timeline item (current or next upcoming). Sky-blue hero with
 *      date+time badge, title, subtitle. CTA is "View file" → #documents when
 *      trip has attached documents, or a muted "See timeline" otherwise.
 *
 *   2. Guidance (fromTimeline: false, isEmpty: false)
 *      No timeline items, but the trip has fallback copy. Sky-blue hero with
 *      trip info and an "Add action" CTA pointing at the timeline.
 *
 *   3. Empty    (isEmpty: true)
 *      No timeline items AND no fallback copy. Muted placeholder card so the
 *      hero slot never shows a blank sky-blue card with an empty title.
 */
export function PrimaryActionCard({
  title,
  subtitle,
  time,
  eventDate,
  documentLabel,
  fromTimeline,
  hasDocuments,
  isEmpty,
}: PrimaryActionView) {

  // ── State 3: empty ──────────────────────────────────────────────────────────
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
          <ArrowRightIcon />
        </motion.a>
      </section>
    );
  }

  // ── States 1 & 2: active or guidance ────────────────────────────────────────

  const label = fromTimeline ? "Next action" : "Up next";

  // CTA logic:
  //   real timeline item + documents exist  → "View file"   → #documents
  //   real timeline item + no documents     → "See timeline" → #timeline
  //   guidance fallback (no items)          → "Add action"   → #timeline
  const showViewFile = fromTimeline && hasDocuments;
  const ctaHref = showViewFile ? "#documents" : "#timeline";
  const ctaLabel = showViewFile
    ? "View file"
    : fromTimeline
    ? "See timeline"
    : "Add action";

  return (
    <section className="mb-4 rounded-3xl bg-sky-500 px-5 pb-5 pt-5">

      {/* ── Row 1: section label + date/time badges ──────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-950/45">
          {label}
        </p>

        {/* Date chip + time badge — grouped so they read as one timestamp */}
        {(eventDate || time) && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {eventDate && (
              <span className="rounded-full bg-sky-950/[0.10] px-2.5 py-1 text-[11px] font-medium text-sky-950/55">
                {formatEventDate(eventDate)}
              </span>
            )}
            {time && (
              <span className="rounded-full bg-sky-950/[0.16] px-3 py-1 font-mono text-[14px] font-bold tabular-nums tracking-tight text-sky-950/80">
                {time}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Row 2: title ────────────────────────────────────────────────────── */}
      <h3 className="mt-3 text-[25px] font-semibold leading-tight tracking-[-0.025em] text-sky-950">
        {title}
      </h3>

      {/* ── Row 3: subtitle — route / venue / context ───────────────────────── */}
      {subtitle && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-sky-950/50">
          {subtitle}
        </p>
      )}

      {/* ── Row 4: document label chip (when document_label column exists) ───── */}
      {documentLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-950/[0.10] px-2.5 py-1 text-[11px] font-medium text-sky-950/60">
          <FileIcon />
          {documentLabel}
        </span>
      )}

      {/* ── Row 5: CTA ──────────────────────────────────────────────────────── */}
      <motion.a
        href={ctaHref}
        whileTap={{ scale: 0.97 }}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-semibold ${
          showViewFile
            ? "bg-sky-950/90 text-white"
            : "bg-sky-950/[0.13] text-sky-950/70"
        }`}
      >
        {showViewFile && <FileIcon />}
        {ctaLabel}
        {!showViewFile && <ArrowRightIcon />}
      </motion.a>

    </section>
  );
}
