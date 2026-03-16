/**
 * Timeline View-Model Helpers
 *
 * Pure functions — no DB calls. Transforms raw DbTimelineItem[] into
 * display-ready shapes for the trip detail page.
 *
 * All UI derivation logic lives here so page components stay thin.
 */

import type { DbTimelineItem } from "@/lib/timeline-items";

// ─── Item state ────────────────────────────────────────────────────────────────

export type ItemState = "completed" | "current" | "upcoming";

/**
 * Parses the first "ends HH:MM" occurrence from the packed note string.
 * The note format is: "Route · ends HH:MM · free text" — all optional.
 */
function parseEndTime(note: string): string | null {
  const m = note.match(/ends\s+(\d{1,2}:\d{2})/);
  return m ? m[1] : null;
}

/**
 * Builds a local-time Date from an ISO date string ("YYYY-MM-DD") and a
 * 24-hour time string ("HH:MM"). Avoids UTC-midnight timezone shifts.
 */
function toLocalDateTime(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}

/**
 * Computes the display state of a timeline item relative to `now`.
 *
 *   completed  →  event_end  < now
 *   current    →  event_start ≤ now ≤ event_end
 *   upcoming   →  event_start > now
 *
 * Items without event_date are treated as "upcoming" (legacy rows without a date).
 * Default event duration when no "ends HH:MM" is found in the note: 60 minutes.
 */
export function computeItemState(
  item: Pick<DbTimelineItem, "event_date" | "time" | "note">,
  now: Date = new Date()
): ItemState {
  if (!item.event_date) return "upcoming";

  const start = toLocalDateTime(item.event_date, item.time);

  const endTimeStr = parseEndTime(item.note ?? "");
  const end = endTimeStr
    ? toLocalDateTime(item.event_date, endTimeStr)
    : new Date(start.getTime() + 60 * 60 * 1000); // default: +1 hour

  if (now > end) return "completed";
  if (now >= start) return "current";
  return "upcoming";
}

// ─── Group labels ──────────────────────────────────────────────────────────────

/**
 * Returns the group label to display BEFORE item[index], or null.
 *
 * For mixed-state timelines (completed + current + upcoming), labels are
 * driven by state transitions:
 *   * → current   → "Happening now"
 *   * → upcoming  → "Up next"
 *   3rd+ upcoming → "Later"
 *
 * For homogeneous upcoming-only timelines (no completed/current items),
 * falls back to the original index-based behavior so the timeline still
 * reads well when the trip hasn't started yet.
 */
export function getGroupLabel(
  index: number,
  states: ItemState[]
): string | null {
  if (index === 0) return null;

  const state = states[index];
  const prev = states[index - 1];
  const hasCurrent = states.some((s) => s === "current");
  const hasCompleted = states.some((s) => s === "completed");

  // Transition into the current block
  if (state === "current" && prev !== "current") return "Happening now";

  // First upcoming after non-upcoming (state transition)
  if (state === "upcoming" && prev !== "upcoming") return "Up next";

  // Homogeneous upcoming timeline — preserve original index-based labels
  if (!hasCurrent && !hasCompleted) {
    if (index === 1) return "Up next";
    if (index === 3) return "Later";
    return null;
  }

  // Mixed timeline: "Later" appears exactly once, at the 3rd upcoming item
  if (state === "upcoming" && prev === "upcoming") {
    const countBefore = states.slice(0, index).filter((s) => s === "upcoming").length;
    if (countBefore === 2) return "Later";
  }

  return null;
}

// ─── Primary action ────────────────────────────────────────────────────────────

/**
 * The data shape consumed by PrimaryActionCard.
 *
 * Derived from the most relevant timeline item (current → upcoming → fallback).
 * Completed items are intentionally skipped so the hero never shows stale info.
 *
 * States:
 *   fromTimeline: true, isEmpty: false → real timeline item (active state)
 *   fromTimeline: false, isEmpty: false → trip-level fallback copy (guidance)
 *   isEmpty: true → no timeline items AND no fallback copy (empty state)
 */
export type PrimaryActionView = {
  title: string;
  /** Derived from `note` — the route, venue, or contextual description. */
  subtitle: string;
  /** Raw time string from the timeline item, e.g. "09:00". */
  time: string | null;
  /**
   * Label for an associated document, e.g. "Boarding pass".
   * Backed by the optional `document_label` column — null until the column exists.
   */
  documentLabel: string | null;
  /** True when built from a real timeline item (vs. trip-level fallback copy). */
  fromTimeline: boolean;
  /** True when the trip has at least one document attached. */
  hasDocuments: boolean;
  /**
   * True when there are no usable timeline items AND the trip has no fallback
   * copy. The card renders a muted placeholder rather than a blank hero.
   */
  isEmpty: boolean;
};

type TripFallback = {
  nextActionTitle: string;
  nextActionDescription: string;
};

/**
 * Builds the PrimaryActionView for a trip.
 *
 * Priority:
 *   1. The first "current" timeline item (something happening right now)
 *   2. The first "upcoming" timeline item (the next thing to do)
 *   3. Trip-level fallback copy (next_action_title / next_action_description)
 *   4. Empty state — when no source has meaningful content
 *
 * Completed items are skipped entirely — the hero should never show something
 * that already happened.
 */
export function buildPrimaryActionView(
  items: DbTimelineItem[],
  fallback: TripFallback,
  hasDocuments: boolean
): PrimaryActionView {
  // Server-side "now" — acceptable approximation; any timezone delta is <1 day.
  const now = new Date();

  const primaryItem =
    items.find((item) => computeItemState(item, now) === "current") ??
    items.find((item) => computeItemState(item, now) === "upcoming") ??
    null;

  // ── State 1: real timeline item ──────────────────────────────────────────────
  if (primaryItem) {
    return {
      title: primaryItem.title,
      subtitle: primaryItem.note,
      time: primaryItem.time,
      documentLabel: primaryItem.document_label ?? null,
      fromTimeline: true,
      hasDocuments,
      isEmpty: false,
    };
  }

  const fallbackTitle = fallback.nextActionTitle?.trim() ?? "";
  const fallbackSubtitle = fallback.nextActionDescription?.trim() ?? "";

  // ── State 3: empty — no usable items, no fallback copy ───────────────────────
  if (!fallbackTitle) {
    return {
      title: "",
      subtitle: "",
      time: null,
      documentLabel: null,
      fromTimeline: false,
      hasDocuments,
      isEmpty: true,
    };
  }

  // ── State 2: trip-level fallback ─────────────────────────────────────────────
  return {
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
    time: null,
    documentLabel: null,
    fromTimeline: false,
    hasDocuments,
    isEmpty: false,
  };
}

// ─── Legacy exports (kept for any external callers) ───────────────────────────

/** @deprecated Use getGroupLabel instead. */
export function shouldShowGroupDivider(index: number): false | "upcoming" | "later" {
  if (index === 1) return "upcoming";
  if (index === 3) return "later";
  return false;
}

/** @deprecated Use getGroupLabel instead. */
export const GROUP_DIVIDER_LABELS: Record<"upcoming" | "later", string> = {
  upcoming: "Up next",
  later: "Later",
};
