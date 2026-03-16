/**
 * Timeline View-Model Helpers
 *
 * Pure functions — no DB calls. Transforms raw DbTimelineItem[] into
 * display-ready shapes for the trip detail page.
 *
 * All UI derivation logic lives here so page components stay thin.
 */

import type { DbTimelineItem } from "@/lib/timeline-items";

// ─── Primary action ────────────────────────────────────────────────────────────

/**
 * The data shape consumed by PrimaryActionCard.
 *
 * Derived purely from the first timeline item (or trip fallback copy).
 * Maps the existing DB fields — time, title, note — to display roles:
 *   title    → the event name / main heading
 *   subtitle → the note field repurposed as route / venue / context
 *   time     → shown as a prominent timestamp badge
 *
 * States:
 *   fromTimeline: true  → first real timeline item (active state)
 *   fromTimeline: false, isEmpty: false → trip-level fallback copy (guidance state)
 *   isEmpty: true       → no timeline items AND no fallback copy (empty state)
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
   * True when there are no timeline items AND the trip has no meaningful fallback
   * copy set. The card renders a dedicated empty-state prompt in this case rather
   * than an active hero with a blank title.
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
 *   1. First timeline item (sorted by time ASC, sort_order ASC NULLS LAST)
 *   2. Trip-level fallback (next_action_title / next_action_description)
 *   3. Empty state — when neither source has content
 */
export function buildPrimaryActionView(
  items: DbTimelineItem[],
  fallback: TripFallback,
  hasDocuments: boolean
): PrimaryActionView {
  const first = items[0];

  // ── State 1: real timeline item ──────────────────────────────────────────────
  if (first) {
    return {
      title: first.title,
      subtitle: first.note,
      time: first.time,
      documentLabel: first.document_label ?? null,
      fromTimeline: true,
      hasDocuments,
      isEmpty: false,
    };
  }

  const fallbackTitle = fallback.nextActionTitle?.trim() ?? "";
  const fallbackSubtitle = fallback.nextActionDescription?.trim() ?? "";

  // ── State 3: empty — no timeline items, no fallback copy ─────────────────────
  // Guards against blank-title sky-blue hero after all items are deleted.
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

// ─── Timeline grouping ─────────────────────────────────────────────────────────

/**
 * Returns true when a group divider should appear BEFORE the item at `index`.
 *
 * Groups:
 *   index 0          → (no divider — it's the primary action)
 *   index 1          → "Up next"   divider
 *   index 3          → "Later"     divider
 *   index 2 and 4+   → no divider
 */
export function shouldShowGroupDivider(index: number): false | "upcoming" | "later" {
  if (index === 1) return "upcoming";
  if (index === 3) return "later";
  return false;
}

export const GROUP_DIVIDER_LABELS: Record<"upcoming" | "later", string> = {
  upcoming: "Up next",
  later: "Later",
};
