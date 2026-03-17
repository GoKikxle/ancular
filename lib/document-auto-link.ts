/**
 * Document → Timeline Auto-Linking
 *
 * When a document is uploaded or attached to a trip, this module finds the
 * most relevant unlinked timeline item and sets its `document_id` field.
 *
 * ── How it works ────────────────────────────────────────────────────────────
 *   1. Only considers timeline items where `document_id IS NULL`.
 *      Items already linked are never overwritten.
 *   2. Matches by checking whether the item's title or note contains any
 *      keyword associated with the document category.
 *   3. Among multiple candidates, picks the one with:
 *        a. Highest keyword-match score (more keywords = more relevant).
 *        b. Earliest upcoming date (event_date >= today) as tiebreaker.
 *        c. Earliest event_date + time overall as final tiebreaker.
 *   4. Updates exactly one row in a single conditional UPDATE
 *      (.is("document_id", null)) so a race condition can never overwrite
 *      a link that another request just created.
 *
 * ── Supported categories ────────────────────────────────────────────────────
 *   flight   → keywords: flight, boarding, airport, departure, arrival, fly
 *   hotel    → keywords: hotel, check-in, checkout, accommodation, stay, inn
 *   booking  → keywords: reservation, booking, dinner, restaurant, transport,
 *              pickup, pick-up, train, reserved
 *   identity → no linking (identity docs are not action-specific)
 *   other    → no linking
 *
 * ── Architecture upgrade path (OCR / AI) ────────────────────────────────────
 * `findBestAutoLinkTarget` is the only decision boundary.
 * To upgrade:
 *   1. Accept `extractedText?: string` alongside `items` and `category`.
 *   2. Pass it to an AI ranker / embedding similarity scorer.
 *   3. Replace or augment keyword scoring with the AI score.
 * The async runner (`autoLinkDocumentToTimeline`) stays unchanged.
 */

import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";

// ─── Keyword table ────────────────────────────────────────────────────────────

/**
 * Keywords used to score relevance between a document category and a timeline
 * item's text. Each keyword is tested with `String.includes()` (case-insensitive).
 *
 * The order within each array matters only for readability; all keywords are
 * checked independently and scores accumulate.
 */
const CATEGORY_KEYWORDS: Partial<Record<DocumentCategory, readonly string[]>> = {
  flight: [
    "flight", "boarding", "airport",
    "departure", "arrival", "fly", "airline",
    "check-in",
  ],
  hotel: [
    "hotel", "check-in", "checkout", "check out",
    "accommodation", "stay", "inn", "resort",
  ],
  booking: [
    "reservation", "booking", "dinner", "restaurant",
    "transport", "pickup", "pick-up", "train", "reserved",
  ],
  // identity and other intentionally omitted — no auto-linking for those.
};

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateItem = {
  id: string;
  title: string;
  note: string;
  event_date: string | null;
  time: string;
};

// ─── Pure matching logic ──────────────────────────────────────────────────────

/** Returns the number of category keywords found in the item's title + note. */
function scoreItem(item: CandidateItem, keywords: readonly string[]): number {
  const text = `${item.title} ${item.note}`.toLowerCase();
  return keywords.filter((kw) => text.includes(kw)).length;
}

/**
 * Pure function — given a list of candidate (unlinked) timeline items and a
 * document category, returns the ID of the best item to link, or null if no
 * match is found.
 *
 * Exported for unit-testing; the async runner below is what callers use.
 */
export function findBestAutoLinkTarget(
  items: CandidateItem[],
  category: DocumentCategory
): string | null {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords || keywords.length === 0) return null;

  // Score each item; discard non-matches.
  const scored = items
    .map((item) => ({ item, score: scoreItem(item, keywords) }))
    .filter(({ score }) => score > 0);

  if (scored.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  scored.sort((a, b) => {
    // 1. Higher keyword score first.
    if (b.score !== a.score) return b.score - a.score;

    // 2. Upcoming items (event_date >= today) before past/undated items.
    const aDate = a.item.event_date;
    const bDate = b.item.event_date;
    const aUpcoming = aDate != null && aDate >= today;
    const bUpcoming = bDate != null && bDate >= today;
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;

    // 3. Earlier date first (nulls last).
    if (aDate !== bDate) {
      if (aDate == null) return 1;
      if (bDate == null) return -1;
      return aDate < bDate ? -1 : 1;
    }

    // 4. Earlier time first.
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
  // Fast-exit for categories that never auto-link.
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords || keywords.length === 0) return { linked: false };

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
