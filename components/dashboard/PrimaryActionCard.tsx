"use client";

import { motion } from "framer-motion";
import type { PrimaryActionView } from "@/lib/timeline-view-model";

/**
 * Primary action hero card — the first thing a user reads on the trip page.
 *
 * Answers three questions at a glance:
 *   1. What do I need to do next?  (title)
 *   2. When is it happening?       (time badge)
 *   3. What document do I need?    (View documents CTA → scrolls to #documents)
 *
 * Data model: uses existing DB fields repurposed for display —
 *   title  → event name / main heading
 *   note   → shown as route / venue / context (subtitle)
 *   time   → prominent timestamp badge
 *   document_label → pill chip (backed by future schema column)
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

  // CTA: scroll to documents when available, otherwise to the timeline
  const ctaHref = hasDocuments ? "#documents" : "#timeline";
  const ctaLabel = hasDocuments
    ? "View documents"
    : fromTimeline
    ? "See itinerary"
    : "Go to timeline";

  return (
    <section className="mb-4 rounded-3xl bg-sky-500 px-5 py-5">
      {/* ── Top row: section label + time badge ──────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-950/50">
          {label}
        </p>

        {time && (
          <span className="flex-shrink-0 rounded-full bg-sky-950/[0.09] px-3 py-1 font-mono text-[13px] font-semibold tabular-nums tracking-wide text-sky-950/70">
            {time}
          </span>
        )}
      </div>

      {/* ── Title ──────────────────────────────────────────────────────────── */}
      <h3 className="mt-2.5 text-[22px] font-semibold leading-snug tracking-[-0.02em] text-sky-950">
        {title}
      </h3>

      {/* ── Subtitle: note repurposed as route / venue context ─────────────── */}
      {subtitle && (
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-sky-950/58">
          {subtitle}
        </p>
      )}

      {/* ── Document label chip ─────────────────────────────────────────────
           Backed by the optional `document_label` column in timeline_items.
           Renders only when the column is populated (future schema extension). */}
      {documentLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-950/[0.09] px-2.5 py-1 text-[11px] font-medium text-sky-950/55">
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

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <div className="mt-4">
        <motion.a
          href={ctaHref}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-950/90 px-4 py-2.5 text-[13px] font-medium text-white"
        >
          {ctaLabel}
          {/* Arrow direction: down for documents, right for timeline */}
          {hasDocuments ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 2v8M3 7.5l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 6h7M6.5 3l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </motion.a>
      </div>
    </section>
  );
}
