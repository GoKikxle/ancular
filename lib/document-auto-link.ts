/**
 * Document → Timeline Auto-Linking
 *
 * Finds the most relevant unlinked timeline item for a newly uploaded or
 * attached document and sets its `document_id` field.
 *
 * ── Confidence scoring model (0 – 100) ──────────────────────────────────────
 *
 *   Component         Range   Notes
 *   ──────────────    ─────   ─────────────────────────────────────────────────
 *   Category base      30     Always awarded for passing the category filter.
 *                             Document label is irrelevant — only category counts.
 *   Keyword match    0 – 40   min(rawKeywordScore × 8, 40).  Raw score is the
 *                             sum of weights of all keywords that appear in the
 *                             timeline item's title + note text.
 *   Date proximity   0 – 20   How soon the item's event_date is relative to
 *                             today (see dateProximityPts below).
 *   Title overlap    0 – 10   Bonus if the document title shares a meaningful
 *                             word (> 3 chars, non-stop-word) with the item.
 *   ──────────────    ─────
 *   Total              100
 *
 *   AUTO_LINK_THRESHOLD = 70
 *     ≥ 70  → document is auto-linked to that timeline item
 *     < 70  → document is attached to the trip only (no link, no new item)
 *
 * ── Date proximity points ────────────────────────────────────────────────────
 *
 *   Today              20    Document most likely relates to today's action
 *   Upcoming ≤ 7 d     15    Very near — linking is highly actionable
 *   Upcoming ≤ 30 d    10    Within the trip window
 *   Upcoming > 30 d     5    Further out but still future
 *   Undated             3    No date set yet; still live/actionable
 *   Past                0    Completed — never blocks a future match from winning
 *
 * ── Keyword design ───────────────────────────────────────────────────────────
 *   • Pure alphabetic tokens get \b word boundaries:
 *       "inn"  → /\binn\b/  — won't match "dinner"
 *       "fly"  → /\bfly\b/  — won't match "butterfly"
 *       "stay" → /\bstay\b/ — won't match "stayover"
 *   • Phrases / hyphenated tokens ("check-in", "pick-up") are literal — the
 *     phrase is specific enough without boundaries.
 *   • "check-in" is weight 1 in the flight table (shared with hotel) so that a
 *     hotel "check-in" item never wins over a genuine flight item.
 *
 * ── Supported categories ────────────────────────────────────────────────────
 *   flight  → strong (5): flight, boarding, airport, departure, arrival,
 *                         airline, outbound
 *             medium (3-4): depart, terminal, takeoff, landing, passenger,
 *                           gate, fly, flying
 *             weak   (1): check-in (shared with hotel — deliberately low)
 *   hotel   → strong (5): hotel, hostel, airbnb, guesthouse
 *             strong (4): check-in, check in, checkout, check-out, check out,
 *                         accommodation
 *             medium (2-3): resort, inn, motel, lodge, villa, guest house,
 *                           bed and breakfast, overnight
 *             weak   (1): stay
 *   booking → strong (4-5): reservation, reserved, dinner, restaurant
 *             medium (3-4): table, lunch, brunch, booking, spa, transport,
 *                           transfer, pickup, pick-up, train, tour, excursion,
 *                           theatre, theater, concert
 *             weak   (2): activity, show, ride
 *   identity → no linking
 *   other    → no linking
 *
 * ── Architecture upgrade path (OCR / AI) ────────────────────────────────────
 * `findBestAutoLinkTarget` is the single decision boundary.
 * To upgrade:
 *   1. Accept `extractedText?: string` alongside `items`, `category`, `docTitle`.
 *   2. Add an AI/embedding scorer that returns an additional score component.
 *   3. Blend it into the existing component sum (e.g. aiScore * 0-20).
 * The async runner (`autoLinkDocumentToTimeline`) stays unchanged.
 */

import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";

// ─── Scoring constants ────────────────────────────────────────────────────────

const CATEGORY_BASE     = 30;   // points for passing the category filter
const MAX_KEYWORD_PTS   = 40;   // keyword points cap
const KEYWORD_MULT      = 8;    // raw keyword score × this = keyword points (capped)
const MAX_DATE_PTS      = 20;   // date proximity cap
const TITLE_BONUS_PTS   = 10;   // bonus for doc-title ↔ item-title word overlap

/** Score must reach this value for the document to be auto-linked. */
export const AUTO_LINK_THRESHOLD = 70;

// ─── Weighted keyword types and builder ──────────────────────────────────────

type WeightedKeyword = {
  /** Pre-compiled, case-insensitive regex. */
  re: RegExp;
  /** Score contribution when this pattern matches. */
  weight: number;
  /** Human-readable name used in the `reason` string. */
  label: string;
};

/**
 * Builds a WeightedKeyword.
 * Pure alphabetic tokens get `\b` anchors; phrases are matched literally.
 */
function kw(keyword: string, weight: number): WeightedKeyword {
  const isPlainWord = /^[a-z]+$/i.test(keyword);
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = isPlainWord
    ? new RegExp(`\\b${escaped}\\b`, "i")
    : new RegExp(escaped, "i");
  return { re, weight, label: keyword };
}

// ─── Keyword tables ───────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Partial<Record<DocumentCategory, WeightedKeyword[]>> = {
  flight: [
    // Strong (5)
    kw("flight",    5),
    kw("boarding",  5),
    kw("airport",   5),
    // Strong (4)
    kw("departure", 4),
    kw("arrival",   4),
    kw("airline",   4),
    kw("outbound",  4),
    // Medium (3-4)
    kw("depart",    3),
    kw("terminal",  3),
    kw("takeoff",   3),
    kw("landing",   3),
    kw("passenger", 3),
    kw("fly",       4),     // "Fly to Rome" should match — bumped from 2
    kw("flying",    4),     // same
    kw("gate",      2),
    // Weak / shared — low weight prevents hotel "check-in" items winning
    kw("check-in",  1),
  ],

  hotel: [
    // Strong (5)
    kw("hotel",           5),
    kw("hostel",          5),
    kw("airbnb",          5),
    kw("guesthouse",      5),
    // Strong (4)
    kw("check-in",        4),
    kw("check in",        4),
    kw("checkout",        4),
    kw("check-out",       4),
    kw("check out",       4),
    kw("accommodation",   4),
    // Medium (3)
    kw("resort",          3),
    kw("inn",             3),    // \binn\b — safe, won't match "dinner"
    kw("motel",           3),
    kw("lodge",           3),
    kw("villa",           3),
    kw("guest house",     3),
    kw("bed and breakfast", 3),
    // Medium (2)
    kw("overnight",       2),
    // Weak (1) — ambiguous; acts as a tiny tiebreaker only
    kw("stay",            1),
  ],

  booking: [
    // Strong (5)
    kw("reservation",  5),
    // Strong (4)
    kw("reserved",     4),
    kw("dinner",       4),
    kw("restaurant",   4),
    kw("pickup",       4),     // "Pickup from hotel" — bumped from 3
    kw("pick-up",      4),
    kw("train",        4),     // "Train to London" — bumped from 3
    // Medium (3)
    kw("table",        3),     // "Table for 2", \btable\b won't match "timetable"
    kw("lunch",        3),
    kw("brunch",       3),
    kw("booking",      3),
    kw("spa",          3),
    kw("transport",    3),
    kw("transfer",     3),
    kw("tour",         3),
    kw("excursion",    3),
    kw("theatre",      3),
    kw("theater",      3),
    kw("concert",      3),
    // Weak (2)
    kw("activity",     2),
    kw("show",         2),     // \bshow\b won't match "shower"
    kw("ride",         2),
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

/** Internal result from `findBestAutoLinkTarget`. */
type MatchResult = {
  id: string;
  title: string;
  score: number;
  reason: string;
};

/**
 * Return type of `autoLinkDocumentToTimeline`.
 * Exported so server actions can forward the fields to UI components.
 */
export type AutoLinkResult = {
  /** True when a confident match was found and document_id was written. */
  matched: boolean;
  /** 0 – 100 confidence score of the best candidate. 0 if no match. */
  score: number;
  /** UUID of the linked timeline item. Null when matched is false. */
  timelineItemId: string | null;
  /**
   * Display title of the linked timeline item.
   * Use this in success messages: "Uploaded and linked to [linkedItemTitle]."
   */
  linkedItemTitle: string | null;
  /**
   * Human-readable explanation of the result.
   * E.g. "score 85 · keywords: flight · upcoming in 3 days"
   *      "score 45 below threshold 70"
   *      "no unlinked timeline items found"
   */
  reason: string;
};

// ─── Scoring helpers ──────────────────────────────────────────────────────────

/**
 * Returns 0 – MAX_DATE_PTS based on how far the event is from today.
 * Past items always return 0 so they never beat upcoming items at equal score.
 */
function dateProximityPts(eventDate: string | null, today: string): number {
  if (eventDate == null)     return 3;           // undated — slight nudge
  if (eventDate < today)     return 0;           // past — no boost
  if (eventDate === today)   return MAX_DATE_PTS; // today — maximum urgency
  const msPerDay = 86_400_000;
  const daysAway = Math.round((Date.parse(eventDate) - Date.parse(today)) / msPerDay);
  if (daysAway <= 7)         return 15;
  if (daysAway <= 30)        return 10;
  return 5;
}

/** Stop words excluded from title-overlap bonus scoring. */
const STOP_WORDS = new Set([
  "to", "at", "for", "and", "the", "in", "on", "from", "with",
  "via", "of", "a", "an", "my", "our", "its", "by", "up", "out",
]);

/**
 * Returns TITLE_BONUS_PTS if the document title shares at least one meaningful
 * word (> 3 chars, non-stop-word) with the timeline item's title + note.
 * Returns 0 otherwise.
 *
 * This is an additive bonus only — it never drives the decision on its own.
 */
function titleOverlapBonus(itemText: string, docTitle: string): number {
  if (!docTitle) return 0;
  const meaningful = (s: string): string[] =>
    s.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  const itemWords = new Set(meaningful(itemText));
  return meaningful(docTitle).some((w) => itemWords.has(w)) ? TITLE_BONUS_PTS : 0;
}

// ─── Core matcher ─────────────────────────────────────────────────────────────

/**
 * Scores a single candidate item against the keyword set and date/title signals.
 * Returns `{ score, reason, matchedLabels }`.
 */
function scoreCandidate(
  item: CandidateItem,
  keywords: WeightedKeyword[],
  docTitle: string,
  today: string
): { score: number; reason: string } {
  const itemText = `${item.title} ${item.note}`;
  const itemTextLower = itemText.toLowerCase();

  // ── Keyword component ─────────────────────────────────────────────────────
  const matchedLabels: string[] = [];
  let rawKw = 0;
  for (const { re, weight, label } of keywords) {
    if (re.test(itemTextLower)) {
      rawKw += weight;
      matchedLabels.push(label);
    }
  }
  const keywordPts = Math.min(rawKw * KEYWORD_MULT, MAX_KEYWORD_PTS);

  // ── Date component ────────────────────────────────────────────────────────
  const datePts = dateProximityPts(item.event_date, today);

  // ── Title overlap bonus ───────────────────────────────────────────────────
  const titleBonus = titleOverlapBonus(itemText, docTitle);

  // ── Total ─────────────────────────────────────────────────────────────────
  const score = CATEGORY_BASE + keywordPts + datePts + titleBonus;

  // ── Reason string ─────────────────────────────────────────────────────────
  const parts: string[] = [];
  if (matchedLabels.length > 0) {
    parts.push(`keywords: ${matchedLabels.slice(0, 3).join(", ")}`);
  }
  if (datePts >= MAX_DATE_PTS)   parts.push("today");
  else if (datePts >= 15)        parts.push("upcoming ≤7 days");
  else if (datePts >= 10)        parts.push("upcoming ≤30 days");
  else if (datePts >= 5)         parts.push("upcoming");
  else if (datePts === 3)        parts.push("undated");
  else                           parts.push("past");
  if (titleBonus > 0)            parts.push("title overlap");

  const reason =
    parts.length > 0
      ? `score ${score} · ${parts.join(" · ")}`
      : `score ${score} · category base only`;

  return { score, reason };
}

/**
 * Pure function — scores every candidate, filters to those at or above
 * AUTO_LINK_THRESHOLD, and returns the highest-scoring match (or null).
 *
 * Scoring priority (all embedded in the single 0-100 score):
 *   1. Category base (30 pts) — always present; document label is irrelevant.
 *   2. Keyword match (0-40 pts) — specific travel keywords in item title/note.
 *   3. Date proximity (0-20 pts) — upcoming items naturally score higher than past.
 *   4. Title overlap (0-10 pts) — bonus if doc title shares a word with the item.
 *
 * Because date proximity is embedded in the score, upcoming items will naturally
 * outscore past items with equal keyword matches. Past items are only matched
 * when no upcoming item reaches the threshold.
 *
 * Exported for unit-testing; `autoLinkDocumentToTimeline` is what callers use.
 *
 * @param items     Unlinked timeline items to score.
 * @param category  Document category — selects the keyword table.
 * @param docTitle  Document title — enables the title-overlap bonus.
 */
export function findBestAutoLinkTarget(
  items: CandidateItem[],
  category: DocumentCategory,
  docTitle = ""
): MatchResult | null {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords || keywords.length === 0) return null;
  if (items.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  // Score every item and discard those below the threshold.
  const qualified = items
    .map((item) => {
      const { score, reason } = scoreCandidate(item, keywords, docTitle, today);
      return { item, score, reason };
    })
    .filter(({ score }) => score >= AUTO_LINK_THRESHOLD);

  if (qualified.length === 0) return null;

  // Sort: highest score first; ties broken by date (earlier upcoming / more recent
  // past) then time (earlier slot first).
  qualified.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = a.item.event_date;
    const bDate = b.item.event_date;
    if (aDate !== bDate) {
      if (aDate == null) return 1;
      if (bDate == null) return -1;
      return aDate < bDate ? -1 : 1;
    }
    return a.item.time < b.item.time ? -1 : 1;
  });

  const w = qualified[0];
  return { id: w.item.id, title: w.item.title, score: w.score, reason: w.reason };
}

// ─── Async runner ─────────────────────────────────────────────────────────────

/**
 * Fetches all unlinked timeline items for the trip, runs the confidence scorer,
 * and writes `document_id` onto the best candidate if it meets the threshold.
 *
 * Guarantees:
 *   - Only items with `document_id IS NULL` are candidates — no overwrite.
 *   - UPDATE uses `.is("document_id", null)` to guard against race conditions.
 *   - Does NOT create new timeline items — no match → document attached only.
 *   - All errors are logged but non-fatal; caller always receives an AutoLinkResult.
 *
 * @param tripId      Trip whose timeline items are searched.
 * @param documentId  UUID of the newly uploaded/attached document.
 * @param category    Document category (selects keyword table).
 * @param docTitle    Document display title (enables title-overlap bonus).
 */
export async function autoLinkDocumentToTimeline(
  tripId: string,
  documentId: string,
  category: DocumentCategory,
  docTitle = ""
): Promise<AutoLinkResult> {
  const noMatch = (reason: string): AutoLinkResult => ({
    matched: false,
    score: 0,
    timelineItemId: null,
    linkedItemTitle: null,
    reason,
  });

  // Fast-exit for categories with no keyword table (identity, other).
  if (!(category in CATEGORY_KEYWORDS)) {
    return noMatch(`category "${category}" has no keyword table — skipped`);
  }

  const supabase = await createClient();

  // Fetch unlinked timeline items only.
  const { data: rows, error: fetchError } = await supabase
    .from("timeline_items")
    .select("id, title, note, event_date, time")
    .eq("trip_id", tripId)
    .is("document_id", null)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("time", { ascending: true });

  if (fetchError) {
    console.error("[document-auto-link] Fetch failed:", fetchError.message);
    return noMatch("fetch error — see server logs");
  }

  if (!rows || rows.length === 0) {
    return noMatch("no unlinked timeline items found");
  }

  const candidates: CandidateItem[] = rows.map((row) => ({
    id: row.id as string,
    title: (row.title as string) ?? "",
    note: (row.note as string) ?? "",
    event_date: (row.event_date as string | null) ?? null,
    time: (row.time as string) ?? "00:00",
  }));

  const match = findBestAutoLinkTarget(candidates, category, docTitle);

  if (!match) {
    // Compute the best score achieved (even if below threshold) for a useful reason.
    const today = new Date().toISOString().slice(0, 10);
    const keywords = CATEGORY_KEYWORDS[category]!;
    const bestScore = Math.max(
      0,
      ...candidates.map(
        (item) => scoreCandidate(item, keywords, docTitle, today).score
      )
    );
    return noMatch(
      `best candidate scored ${bestScore}, below threshold ${AUTO_LINK_THRESHOLD}`
    );
  }

  // Conditional UPDATE — `.is("document_id", null)` makes the write a no-op
  // if a concurrent request already linked this item.
  // `.select("id, title")` retrieves the linked item's title in one round-trip.
  const { data: updated, error: updateError } = await supabase
    .from("timeline_items")
    .update({ document_id: documentId })
    .eq("id", match.id)
    .is("document_id", null)
    .select("id, title");

  if (updateError) {
    console.error("[document-auto-link] Link update failed:", updateError.message);
    return noMatch("update error — see server logs");
  }

  if (!updated || updated.length === 0) {
    // Race condition: another request linked this item between fetch and update.
    return noMatch("item was linked by a concurrent request");
  }

  return {
    matched: true,
    score: match.score,
    timelineItemId: match.id,
    linkedItemTitle: (updated[0].title as string) ?? match.title,
    reason: match.reason,
  };
}
