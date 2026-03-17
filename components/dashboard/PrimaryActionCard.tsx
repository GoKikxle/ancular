"use client";

import { motion } from "framer-motion";
import type { PrimaryActionView } from "@/lib/timeline-view-model";

// ─── Date formatter ─────────────────────────────────────────────────────────
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
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
      <rect x="0.6" y="0.6" width="11.8" height="13.8" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 5h6M3.5 7.5h6M3.5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** ↗ External link indicator — signals the file opens in a new tab. */
function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M5.5 3H3a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 1.5H11m0 0v2.5m0-2.5L6.5 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Primary action hero card — the first thing a user reads on the trip page.
 *
 * Three rendering states:
 *
 *   1. Active   (fromTimeline: true)
 *      First real timeline item (current or next upcoming). Sky-blue hero.
 *      CTA: "Open document" opens the linked file in a new tab when fileUrl
 *           is set — full-contrast dark button with ↗ external indicator.
 *           Falls back to "See timeline" with no fake file CTA when unlinked.
 *
 *   2. Guidance (fromTimeline: false, isEmpty: false)
 *      No timeline items but the trip has fallback copy. "Add action" CTA.
 *
 *   3. Empty    (isEmpty: true)
 *      No timeline items AND no fallback copy. Muted placeholder card.
 *
 * fileUrl — signed URL for the linked document. When present the "Open
 * document" button is the full-contrast primary CTA. When absent no file
 * CTA is shown.
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
  fileUrl,
}: PrimaryActionView & { fileUrl?: string | null }) {

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
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.05] py-3.5 text-[14px] font-semibold text-white/45"
        >
          Add first action
          <ArrowRightIcon />
        </motion.a>
      </section>
    );
  }

  // ── States 1 & 2: active or guidance ────────────────────────────────────────

  const label = fromTimeline ? "Next action" : "Up next";
  const showViewFile = fromTimeline && !!fileUrl;

  // Unused by current CTA logic — kept for potential future use.
  void hasDocuments;

  return (
    <section className="mb-4 rounded-3xl bg-sky-500 px-5 pb-5 pt-5">

      {/* ── Row 1: section label + date/time badges ──────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-950/45">
          {label}
        </p>

        {(eventDate || time) && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {eventDate && (
              <span className="rounded-full bg-sky-950/[0.10] px-2.5 py-1 text-[11px] font-medium text-sky-950/55">
                {formatEventDate(eventDate)}
              </span>
            )}
            {time && (
              <span className="rounded-full bg-sky-950/[0.18] px-3 py-1 font-mono text-[14px] font-bold tabular-nums tracking-tight text-sky-950/85">
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

      {/* ── Row 3: subtitle ─────────────────────────────────────────────────── */}
      {subtitle && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-sky-950/50">
          {subtitle}
        </p>
      )}

      {/* ── Row 4: document label chip ──────────────────────────────────────── */}
      {documentLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-950/[0.10] px-2.5 py-1 text-[11px] font-medium text-sky-950/60">
          <FileIcon />
          {documentLabel}
        </span>
      )}

      {/* ── Row 5: CTA ──────────────────────────────────────────────────────── */}
      {showViewFile ? (
        // Full-contrast "Open document" button — high-confidence CTA.
        // ↗ external icon on the right makes it clear the file opens in a new tab.
        <motion.a
          href={fileUrl!}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-sky-950 px-5 py-4 text-[15px] font-semibold text-white"
        >
          <span className="flex items-center gap-2.5">
            <FileIcon />
            Open document
          </span>
          <ExternalIcon />
        </motion.a>
      ) : fromTimeline ? (
        // Real item but no linked document — secondary CTA.
        <motion.a
          href="#timeline"
          whileTap={{ scale: 0.97 }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-950/[0.13] py-3.5 text-[14px] font-semibold text-sky-950/70"
        >
          See timeline
          <ArrowRightIcon />
        </motion.a>
      ) : (
        // Guidance fallback — no real timeline item.
        <motion.a
          href="#timeline"
          whileTap={{ scale: 0.97 }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-950/[0.13] py-3.5 text-[14px] font-semibold text-sky-950/70"
        >
          Add action
          <ArrowRightIcon />
        </motion.a>
      )}

    </section>
  );
}
