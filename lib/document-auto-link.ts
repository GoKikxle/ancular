/**
 * Document → Timeline Auto-Linking
 *
 * When a document is uploaded or attached to a trip, this module finds the
 * most relevant unlinked timeline item and sets its `document_id` field.
 *
 * ── How it works ────────────────────────────────────────────────────────────
 *   1. Only considers timeline items where `document_id IS NULL`.
 *      Items already linked are never overwritten.
 *   2. Each timeline item is scored by summing the weights of all matching
 *      keywords for the document's category (weighted regex matching).
 *   3. Items below MIN_SCORE_THRESHOLD are discarded — only confident matches
 *      produce a link.
 *   4. Among remaining candidates, picks the one with:
 *        a. Highest accumulated keyword score.
 *        b. Upcoming date (event_date >= today) preferred over past/undated.
 *        c. Earliest event_date + time as final tiebreaker.
 *   5. Updates exactly one row in a single conditional UPDATE
 *      (.is("document_id", null)) so a race condition can never overwrite
 *      a link that another request just created.
 *
 * ── Keyword design ───────────────────────────────────────────────────────────
 *   • Pure alphabetic tokens use \b word boundaries to prevent false positives:
 *       "inn"  → \binn\b  — won't match "dinner"
 *       "fly"  → \bfly\b  — won't match "butterfly" or "flyover"
 *       "stay" → \bstay\b — won't match "staying"
 *   • Phrases / hyphenated tokens (e.g. "check-in", "check out") are matched
 *     as literal substrings — the phrase itself is already specific enough.
 *   • "check-in" is deliberately low-weight (1) in the flight table because it
 *     also appears in hotel item titles; high-weight hotel keywords dominate.
 *
 * ── Supported categories ────────────────────────────────────────────────────
 *   flight  → strong: flight, boarding, airport, departure, arrival, airline
 *             medium: depart, terminal, gate, fly, flying
 *             weak:   check-in (to avoid hotel items winning)
 *   hotel   → strong: hotel, hostel, check-in, checkout, accommodation
 *             medium: resort, inn, motel, lodge, villa, bed and breakfast
 *             weak:   stay
 *   booking → strong: reservation, reserved, dinner, restaurant
 *             medium: lunch, brunch, booking, transport, pickup, train, tour,
 *                     excursion, theatre, theater, concert, activity
 *   identity → no linking
 *   other    → no linking
 *
 * ── Architecture upgrade path (OCR / AI) ────────────────────────────────────
 * `findBestAutoLinkTarget` is the single decision boundary.
 * To upgrade to AI/OCR ranking:
 *   1. Accept `extractedText?: string` alongside `items` and `category`.
 *   2. Pass it to an embedding / LLM scorer.
 *   3. Replace or augment `scoreItem` with the AI score.
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
    // ── Medium signals ─────────────────────────────────────────────────────
    kw("depart",    3),
    kw("terminal",  3),
    kw("gate",      2),
    kw("fly",       2),
    kw("flying",    2),
    // ── Weak / shared signal — kept low to avoid matching hotel items ──────
    kw("check-in",  1),
  ],

  hotel: [
    // ── Strong signals ─────────────────────────────────────────────────────
    kw("hotel",           5),
    kw("hostel",          5),
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
    kw("bed and breakfast", 3),
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
    kw("lunch",        3),
    kw("brunch",       3),
    kw("booking",      3),
    kw("transport",    3),
    kw("pickup",       3),
    kw("pick-up",      3),
    kw("train",        3),
    kw("tour",         3),
    kw("excursion",    3),
    kw("theatre",      3),
    kw("theater",      3),
    kw("concert",      3),
    // ── Weak signal ────────────────────────────────────────────────────────
    kw("activity",     2),
  ],

  // identity and other intentionally omitted — no auto-linking for those.
};

/**
 * Minimum score a candidate must reach to be considered a match.
 * Prevents single weak-keyword coincidences (e.g. "stay" alone) from
 * creating a link when no real match exists.
 *
 * Examples at threshold 2:
 *   "stay" alone           → score 1 → rejected  ✓
 *   "check-in" (flight)    → score 1 → rejected  ✓ (avoids hotel items winning for flight docs)
 *   "gate B14" (flight)    → score 2 → accepted  ✓
 *   "flight" alone         → score 5 → accepted  ✓
 *   "hotel check-in"       → score 9 → accepted  ✓
 */
const MIN_SCORE = 2;

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateItem = {
  id: string;
  title: string;
  note: string;
  event_date: string | null;
  time: string;
};

// ─── Pure matching logic ──────────────────────────────────────────────────────

/**
 * Accumulates the weights of all matching keywords found in the item's
 * concatenated title + note text.
 */
function scoreItem(item: CandidateItem, keywords: WeightedKeyword[]): number {
  const text = `${item.title} ${item.note}`.toLowerCase();
  return keywords.reduce(
    (sum, { re, weight }) => sum + (re.test(text) ? weight : 0),
    0
  );
}

/**
 * Pure function — given a list of candidate (unlinked) timeline items and a
 * document category, returns the ID of the best item to link, or null if no
 * confident match is found.
 *
 * Selection order:
 *   1. Filter to items that reach MIN_SCORE (discards weak coincidences).
 *   2. Sort by accumulated keyword score, highest first.
 *   3. Tiebreak: upcoming items (event_date >= today) before past / undated.
 *   4. Tiebreak: earliest event_date (nulls last), then earliest time.
 *
 * Exported for unit-testing; the async runner below is what callers use.
 */
export function findBestAutoLinkTarget(
  items: CandidateItem[],
  category: DocumentCategory
): string | null {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords || keywords.length === 0) return null;

  // Score every item and drop those below the confidence threshold.
  const scored = items
    .map((item) => ({ item, score: scoreItem(item, keywords) }))
    .filter(({ score }) => score >= MIN_SCORE);

  if (scored.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  scored.sort((a, b) => {
    // 1. Higher accumulated score first (most keyword matches / strongest match).
    if (b.score !== a.score) return b.score - a.score;

    // 2. Upcoming items preferred — they represent the next actionable thing.
    //    "upcoming" = event_date is set AND is on or after today.
    const aDate = a.item.event_date;
    const bDate = b.item.event_date;
    const aUpcoming = aDate != null && aDate >= today;
    const bUpcoming = bDate != null && bDate >= today;
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;

    // 3. Among equally-ranked upcoming (or equally past/undated), prefer earliest date.
    //    Null dates sort last — we prefer dated items for higher confidence.
    if (aDate !== bDate) {
      if (aDate == null) return 1;
      if (bDate == null) return -1;
      return aDate < bDate ? -1 : 1;
    }

    // 4. Same date: prefer the earlier time slot.
    return a.item.time < b.item.time ? -1 : 1;
  });

  return scored[0].item.id;
}

// ─── Async runner ─────────────────────────────────────────────────────────────

/**
 * Fetches all unlinked timeline items for the trip, runs the heuristic matcher,
 * and writes `document_id` onto the best candidate.
 *
 * Design guarantees:
 *   - Only items with `document_id IS NULL` are considered — no overwrite.
 *   - The UPDATE also guards with `.is("document_id", null)` so a concurrent
 *     request cannot overwrite a link that was just set.
 *   - All errors are logged but non-fatal; the caller always gets a boolean.
 *
 * @param tripId      The trip whose timeline is searched.
 * @param documentId  The newly attached/uploaded document's UUID.
 * @param category    Document category used to select the keyword set.
 * @returns { linked: true }  when a row was updated,
 *          { linked: false } when no match was found or an error occurred.
 */
export async function autoLinkDocumentToTimeline(
  tripId: string,
  documentId: string,
  category: DocumentCategory
): Promise<{ linked: boolean }> {
  // Fast-exit for categories that have no keyword table (identity, other).
  if (!(category in CATEGORY_KEYWORDS)) return { linked: false };

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
    return { linked: false };
  }

  const candidates: CandidateItem[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "",
    note: (row.note as string) ?? "",
    event_date: (row.event_date as string | null) ?? null,
    time: (row.time as string) ?? "00:00",
  }));

  const bestId = findBestAutoLinkTarget(candidates, category);
  if (!bestId) return { linked: false };

  // Conditional update: the `.is("document_id", null)` clause means the write
  // is a no-op if another request already linked this item. Zero rows affected
  // returns linked: false, which is accurate — we didn't link anything.
  const { data: updated, error: updateError } = await supabase
    .from("timeline_items")
    .update({ document_id: documentId })
    .eq("id", bestId)
    .is("document_id", null)
    .select("id");

  if (updateError) {
    console.error("[document-auto-link] Link update failed:", updateError.message);
    return { linked: false };
  }

  return { linked: (updated?.length ?? 0) > 0 };
}
