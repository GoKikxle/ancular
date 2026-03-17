/**
 * Document → Timeline Auto-Linking
 *
 * When a document is uploaded or attached to a trip, this module finds the
 * most relevant unlinked timeline item and sets its `document_id` field.
 *
 * ── Matching strategy ────────────────────────────────────────────────────────
 *
 *   Priority 1 — Date phase (outer loop, checked in order):
 *     Phase A: items happening today    → most actionable; document likely for now
 *     Phase B: upcoming items           → common case: uploading before a trip
 *     Phase C: undated items            → user hasn't set a date yet; still live
 *     Phase D: past items               → last resort for retrospective uploads
 *
 *   Past completed items are only matched when NO item in phases A–C qualifies.
 *   This prevents a past "Flight to Barcelona" from beating an upcoming flight.
 *
 *   Priority 2 — Keyword score (within each phase):
 *     Each timeline item is scored by summing the weights of all matching
 *     keywords for the document's category. Higher = stronger category match.
 *     Items below MIN_SCORE are discarded.
 *
 *   Priority 3 — Chronological tiebreak (within equal score + phase):
 *     Upcoming: earliest date wins (next nearest flight/hotel).
 *     Past:     most recent date wins (closest retrospective match).
 *     Undated:  earlier time wins.
 *
 * ── Keyword design ───────────────────────────────────────────────────────────
 *   • Pure alphabetic tokens use \b word boundaries — prevents false positives:
 *       "inn"  → \binn\b  — won't match "dinner"
 *       "fly"  → \bfly\b  — won't match "butterfly"
 *       "stay" → \bstay\b — won't match "stayover"
 *   • Phrases / hyphenated tokens (e.g. "check-in", "pick-up") are literal
 *     substrings — the phrase is already specific enough without boundaries.
 *   • "check-in" is weight 1 in flight (shared signal) so hotel items don't
 *     win when matching a flight document.
 *
 * ── Supported categories ────────────────────────────────────────────────────
 *   flight  → strong: flight, boarding, airport, departure, arrival, airline,
 *                     outbound
 *             medium: depart, terminal, gate, fly, flying, takeoff, landing,
 *                     passenger
 *             weak:   check-in (shared with hotel — kept low on purpose)
 *   hotel   → strong: hotel, hostel, check-in, checkout, accommodation,
 *                     airbnb, guesthouse
 *             medium: resort, inn, motel, lodge, villa, bed and breakfast,
 *                     guest house, overnight
 *             weak:   stay
 *   booking → strong: reservation, reserved, dinner, restaurant
 *             medium: lunch, brunch, booking, transport, pickup, train, tour,
 *                     excursion, theatre, theater, concert, spa, table, transfer
 *             weak:   activity, ride, show
 *   identity → no linking
 *   other    → no linking
 *
 * ── Architecture upgrade path (OCR / AI) ────────────────────────────────────
 * `findBestAutoLinkTarget` is the single decision boundary.
 * To upgrade to AI/OCR ranking:
 *   1. Accept `extractedText?: string` alongside `items` and `category`.
 *   2. Pass it to an embedding / LLM scorer.
 *   3. Replace or augment `scoreItem` / `bestInPartition` with the AI score.
 * The async runner (`autoLinkDocumentToTimeline`) stays unchanged.
 */

import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";

// ─── Weighted keyword types and builder ──────────────────────────────────────

type WeightedKeyword = {
  /** Pre-compiled, case-insensitive regex. */
  re: RegExp;
  /** Score contribution when this pattern matches. */
  weight: number;
};

/**
 * Builds a WeightedKeyword from a human-readable string.
 *
 * Pure alphabetic tokens get `\b` word-boundary anchors so they only match
 * whole words. Tokens that contain spaces, hyphens, or other non-word characters
 * are matched as literal phrases — the phrase itself prevents false positives.
 *
 * Examples:
 *   kw("inn",      4) → /\binn\b/i    — matches "inn" but NOT "dinner"
 *   kw("check-in", 4) → /check\-in/i  — phrase match, specific enough
 *   kw("fly",      2) → /\bfly\b/i    — matches "fly" but NOT "butterfly"
 */
function kw(keyword: string, weight: number): WeightedKeyword {
  const isPlainWord = /^[a-z]+$/i.test(keyword);
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = isPlainWord
    ? new RegExp(`\\b${escaped}\\b`, "i")
    : new RegExp(escaped, "i");
  return { re, weight };
}

// ─── Keyword tables ───────────────────────────────────────────────────────────

/**
 * Per-category keyword tables. Weights reflect confidence that a keyword
 * uniquely identifies that action type in a travel context.
 *
 * Cross-contamination note:
 *   "check-in" appears in BOTH flight (weight 1) and hotel (weight 4) tables.
 *   For a hotel doc, a timeline item titled "Hotel check-in" scores 5+4 = 9.
 *   For a flight doc, the same item scores only 1 — any flight-specific item
 *   ("Flight to X", "Boarding pass") will outscore it at weight 5.
 */
const CATEGORY_KEYWORDS: Partial<Record<DocumentCategory, WeightedKeyword[]>> = {
  flight: [
    // ── Strong signals ─────────────────────────────────────────────────────
    kw("flight",    5),
    kw("boarding",  5),
    kw("airport",   4),
    kw("departure", 4),
    kw("arrival",   4),
    kw("airline",   4),
    kw("outbound",  4),  // "Outbound flight", "outbound journey"
    // ── Medium signals ─────────────────────────────────────────────────────
    kw("depart",    3),
    kw("terminal",  3),
    kw("takeoff",   3),  // "Takeoff at 14:30"
    kw("landing",   3),  // "Landing at 16:00"
    kw("passenger", 3),  // "Passenger details"
    kw("gate",      2),
    kw("fly",       2),
    kw("flying",    2),
    // ── Weak / shared signal — kept at 1 so hotel items never win ──────────
    kw("check-in",  1),
  ],

  hotel: [
    // ── Strong signals ─────────────────────────────────────────────────────
    kw("hotel",           5),
    kw("hostel",          5),
    kw("airbnb",          5),  // extremely common accommodation type
    kw("guesthouse",      5),
    kw("check-in",        4),
    kw("check in",        4),
    kw("checkout",        4),
    kw("check-out",       4),
    kw("check out",       4),
    kw("accommodation",   4),
    // ── Medium signals ─────────────────────────────────────────────────────
    kw("resort",          3),
    kw("inn",             3),   // \binn\b — safe, won't match "dinner"
    kw("motel",           3),
    kw("lodge",           3),
    kw("villa",           3),
    kw("guest house",     3),
    kw("bed and breakfast", 3),
    kw("overnight",       2),   // "overnight stay", "overnight at hotel"
    // ── Weak signal ────────────────────────────────────────────────────────
    kw("stay",            1),   // \bstay\b — common but ambiguous
  ],

  booking: [
    // ── Strong signals ─────────────────────────────────────────────────────
    kw("reservation",  5),
    kw("reserved",     4),
    kw("dinner",       4),
    kw("restaurant",   4),
    // ── Medium signals ─────────────────────────────────────────────────────
    kw("table",        3),  // "Table for 2", "table reservation" (\btable\b — safe)
    kw("lunch",        3),
    kw("brunch",       3),
    kw("booking",      3),
    kw("spa",          3),  // "Spa booking", "spa treatment"
    kw("transport",    3),
    kw("transfer",     3),  // "Airport transfer", "hotel transfer"
    kw("pickup",       3),
    kw("pick-up",      3),
    kw("train",        3),
    kw("tour",         3),
    kw("excursion",    3),
    kw("theatre",      3),
    kw("theater",      3),
    kw("concert",      3),
    // ── Weak signals ───────────────────────────────────────────────────────
    kw("activity",     2),
    kw("show",         2),  // \bshow\b — "West End show" (won't match "shower")
    kw("ride",         2),  // "Uber ride", "cab ride"
  ],

  // identity and other intentionally omitted — no auto-linking for those.
};

/**
 * Minimum confidence score a candidate must reach to be considered a match.
 * Prevents single weak-keyword coincidences from producing a link.
 *
 * Score examples:
 *   "stay" alone              → 1  → rejected  ✓
 *   "check-in" (flight doc)   → 1  → rejected  ✓  (avoids hotel items winning)
 *   "show tonight"            → 2  → accepted  ✓  (weak booking signal)
 *   "gate B14"  (flight doc)  → 2  → accepted  ✓
 *   "Flight to Barcelona"     → 5  → accepted  ✓
 *   "Hotel check-in"          → 9  → accepted  ✓
 *   "Airbnb check-in"         → 9  → accepted  ✓
 */
export const MIN_SCORE = 2;

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateItem = {
  id: string;
  title: string;
  note: string;
  event_date: string | null;
  time: string;
};

/**
 * Internal result from `findBestAutoLinkTarget`.
 * Carries the matched item's id, display title, and accumulated score so
 * callers can surface contextual success messages and future confidence UX.
 */
type MatchResult = {
  id: string;
  title: string;
  /** Accumulated keyword score — higher means stronger category signal match. */
  score: number;
};

/**
 * Return type of `autoLinkDocumentToTimeline`.
 * Exported so server actions and client components can use it as a shared type.
 */
export type AutoLinkResult = {
  /** True when the DB row was successfully updated with document_id. */
  linked: boolean;
  /**
   * Display title of the timeline item that was linked.
   * Null when `linked` is false.
   * Use this in success messages: "Uploaded and linked to [linkedItemTitle]."
   */
  linkedItemTitle: string | null;
  /**
   * Accumulated confidence score of the winning match.
   * 0 when no match was found or an error occurred.
   * Exposed for future UX (e.g. "high confidence" vs "suggested" badges).
   */
  confidence: number;
};

// ─── Pure matching logic ──────────────────────────────────────────────────────

/**
 * Accumulates the weights of all matching keywords found in the item's
 * concatenated title + note text (case-insensitive).
 */
function scoreItem(item: CandidateItem, keywords: WeightedKeyword[]): number {
  const text = `${item.title} ${item.note}`.toLowerCase();
  return keywords.reduce(
    (sum, { re, weight }) => sum + (re.test(text) ? weight : 0),
    0
  );
}

/**
 * Within a pre-filtered partition of items, returns the highest-scoring
 * match at or above MIN_SCORE, or null if none qualify.
 *
 * Sort within partition: score desc → dated before undated → earlier date →
 * earlier time. The partition itself controls date-phase preference; this
 * function only cares about ranking within that group.
 */
function bestInPartition(
  partition: CandidateItem[],
  keywords: WeightedKeyword[]
): MatchResult | null {
  const scored = partition
    .map((item) => ({ item, score: scoreItem(item, keywords) }))
    .filter(({ score }) => score >= MIN_SCORE);

  if (scored.length === 0) return null;

  scored.sort((a, b) => {
    // 1. Higher score first.
    if (b.score !== a.score) return b.score - a.score;
    // 2. Dated items before undated (more confident match).
    const aDate = a.item.event_date;
    const bDate = b.item.event_date;
    if (aDate !== bDate) {
      if (aDate == null) return 1;
      if (bDate == null) return -1;
      return aDate < bDate ? -1 : 1;
    }
    // 3. Earlier time slot.
    return a.item.time < b.item.time ? -1 : 1;
  });

  const w = scored[0];
  return { id: w.item.id, title: w.item.title, score: w.score };
}

/**
 * Pure function — given a list of candidate (unlinked) timeline items and a
 * document category, returns the best match, or null if no confident match.
 *
 * Matching priority
 * ─────────────────
 * 1. Date phase  (outer priority — checked in order, stopping at first hit)
 *
 *    Phase A — today's items:   document most likely relates to today's action.
 *    Phase B — upcoming items:  most common case — uploading before the trip.
 *                               Sorted by earliest date first so the next
 *                               nearest flight/hotel/booking wins.
 *    Phase C — undated items:   user hasn't set a date; still live/actionable.
 *    Phase D — past items:      last resort for retrospective uploads only.
 *                               Sorted by most-recent date first.
 *
 *    Past items are ONLY reached when phases A–C produce no qualified match.
 *    This prevents a completed "Flight to Barcelona" (past) from beating an
 *    upcoming "Fly to New York" when uploading a new boarding pass.
 *
 * 2. Keyword score  (within each phase — higher accumulated weight wins)
 *    Only items scoring ≥ MIN_SCORE are considered.
 *
 * 3. Chronological tiebreak  (within equal score inside a phase)
 *    Upcoming: earliest date → Undated: earlier time → Past: most-recent date.
 *
 * Exact document title is NOT a signal — matching is purely category-driven
 * so variations in how the user names the document never affect linking.
 *
 * Exported for unit-testing; the async runner below is what callers use.
 */
export function findBestAutoLinkTarget(
  items: CandidateItem[],
  category: DocumentCategory
): MatchResult | null {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords || keywords.length === 0) return null;
  if (items.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  // ── Partition items by date phase ────────────────────────────────────────
  // Pre-sorting within each partition so ties inside bestInPartition are
  // already in the correct direction for that phase.

  const todayItems = items.filter(
    (i) => i.event_date != null && i.event_date === today
  );

  const upcomingItems = items
    .filter((i) => i.event_date != null && i.event_date > today)
    .sort((a, b) => a.event_date!.localeCompare(b.event_date!)); // nearest first

  const undatedItems = items.filter((i) => i.event_date == null);

  const pastItems = items
    .filter((i) => i.event_date != null && i.event_date < today)
    .sort((a, b) => b.event_date!.localeCompare(a.event_date!)); // most-recent first

  // ── Four-phase match — stops at the first phase that yields a result ─────
  return (
    bestInPartition(todayItems, keywords) ??
    bestInPartition(upcomingItems, keywords) ??
    bestInPartition(undatedItems, keywords) ??
    bestInPartition(pastItems, keywords) ??
    null
  );
}

// ─── Async runner ─────────────────────────────────────────────────────────────

/**
 * Fetches all unlinked timeline items for the trip, runs the confidence-based
 * heuristic matcher, and writes `document_id` onto the best candidate.
 *
 * Design guarantees:
 *   - Only items with `document_id IS NULL` are candidates — no overwrite.
 *   - The UPDATE uses `.is("document_id", null)` as a conditional guard so a
 *     concurrent request cannot overwrite a link that was just set.
 *   - All errors are logged but non-fatal; the caller always gets a result.
 *   - Does NOT create new timeline items — if no confident match exists the
 *     document is left attached to the trip but unlinked to any action.
 *
 * @param tripId      The trip whose timeline is searched.
 * @param documentId  The newly attached/uploaded document's UUID.
 * @param category    Document category used to select the keyword set.
 * @returns AutoLinkResult with linked, linkedItemTitle, and confidence fields.
 */
export async function autoLinkDocumentToTimeline(
  tripId: string,
  documentId: string,
  category: DocumentCategory
): Promise<AutoLinkResult> {
  const noMatch: AutoLinkResult = { linked: false, linkedItemTitle: null, confidence: 0 };

  // Fast-exit for categories that have no keyword table (identity, other).
  if (!(category in CATEGORY_KEYWORDS)) return noMatch;

  const supabase = await createClient();

  // Fetch only unlinked items — already-linked items are never candidates.
  const { data: rows, error: fetchError } = await supabase
    .from("timeline_items")
    .select("id, title, note, event_date, time")
    .eq("trip_id", tripId)
    .is("document_id", null)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("time", { ascending: true });

  if (fetchError) {
    console.error("[document-auto-link] Fetch failed:", fetchError.message);
    return noMatch;
  }

  const candidates: CandidateItem[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "",
    note: (row.note as string) ?? "",
    event_date: (row.event_date as string | null) ?? null,
    time: (row.time as string) ?? "00:00",
  }));

  const match = findBestAutoLinkTarget(candidates, category);
  if (!match) return noMatch;

  // Conditional UPDATE — `.is("document_id", null)` ensures the write is a
  // no-op if a concurrent request already linked this item.
  // `.select("id, title")` returns the updated row in a single round-trip so
  // we can confirm the update succeeded and surface the item title to the UI.
  const { data: updated, error: updateError } = await supabase
    .from("timeline_items")
    .update({ document_id: documentId })
    .eq("id", match.id)
    .is("document_id", null)
    .select("id, title");

  if (updateError) {
    console.error("[document-auto-link] Link update failed:", updateError.message);
    return noMatch;
  }

  if (!updated || updated.length === 0) {
    // Race condition: another request linked this item between our fetch and update.
    return noMatch;
  }

  return {
    linked: true,
    linkedItemTitle: (updated[0].title as string) ?? match.title,
    confidence: match.score,
  };
}
