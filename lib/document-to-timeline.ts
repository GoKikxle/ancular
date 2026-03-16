/**
 * Document → Timeline Auto-Creation
 *
 * Converts document metadata (category + title) into structured timeline item
 * templates that are inserted automatically when a document is uploaded or attached.
 *
 * ── Architecture boundary ───────────────────────────────────────────────────────
 * `generateTimelineItemsFromDocument` is the single integration point for future
 * intelligence. To upgrade from rule-based → AI/OCR:
 *   1. Accept a `fileContent: string` (extracted text) alongside the metadata.
 *   2. Pass it to an LLM/OCR extractor that returns date, time, route, reference.
 *   3. Populate `eventDate` and `time` from the extracted values instead of placeholders.
 *
 * All callers (`insertDocumentTimelineItems`, server actions) stay unchanged.
 *
 * ── Supported categories ───────────────────────────────────────────────────────
 *   flight   → 1 item  (departure action, 09:00 placeholder)
 *   hotel    → 2 items (check-in at 15:00, check-out at 11:00)
 *   booking  → 1 item  (reservation at 12:00)
 *   identity → 0 items (no useful timeline action)
 *   other    → 0 items (no useful timeline action)
 */

import type { DocumentCategory } from "@/types/document";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DocumentGeneratedItem = {
  /** Timeline item title. Derived from document title when specific enough. */
  title: string;

  /**
   * Placeholder 24-hour time ("HH:MM"). Chosen to be sensible per category.
   * The user edits this once they know the confirmed departure/check-in time.
   *
   * Future: replace with AI-extracted time from file content.
   */
  time: string;

  /**
   * Contextual note shown in the timeline card. Contains the source document
   * title so the user knows where the item came from, plus a prompt to confirm
   * the actual date/time.
   *
   * Future: replace with extracted route, reference number, gate info.
   */
  note: string;

  /**
   * Matches the `action_type` pill values in AddActionForm.
   * Packed into note for now; maps to the `action_type` column when it is added.
   *
   * TODO: store directly once `action_type TEXT NULL` column exists:
   *   ALTER TABLE timeline_items ADD COLUMN IF NOT EXISTS action_type TEXT NULL;
   */
  actionType: "flight" | "hotel" | "activity" | "other";
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derives a display title from the document title when it is specific and
 * short enough to be useful (≤ 40 chars). Falls back to `fallback` otherwise.
 */
function deriveTitle(docTitle: string, fallback: string): string {
  const cleaned = (docTitle ?? "").trim();
  if (!cleaned || cleaned.toLowerCase() === fallback.toLowerCase()) return fallback;
  return cleaned.length <= 40 ? cleaned : fallback;
}

function noteFor(docTitle: string, hint: string): string {
  return `From "${docTitle}" · ${hint}`;
}

// ─── Generation engine ─────────────────────────────────────────────────────────

/**
 * Returns zero or more timeline item templates derived from a document's
 * category and title. All items have `event_date: null` (no date known yet)
 * so they sort after explicitly-dated items and the user can fill them in.
 *
 * This function is deliberately pure and synchronous — it only transforms
 * metadata, never touches the database.
 *
 * @param doc  Document metadata. Only `title` and `category` are used for now.
 *             Add `fileContent?: string` here when upgrading to OCR/AI extraction.
 */
export function generateTimelineItemsFromDocument(doc: {
  title: string;
  category: DocumentCategory;
}): DocumentGeneratedItem[] {
  const { category } = doc;

  switch (category) {
    case "flight": {
      const title = deriveTitle(doc.title, "Flight");
      return [
        {
          title,
          time: "09:00",
          note: noteFor(doc.title, "Update departure date and time when confirmed."),
          actionType: "flight",
        },
      ];
    }

    case "hotel": {
      const label = deriveTitle(doc.title, "Hotel");
      return [
        {
          title: `${label} check-in`,
          time: "15:00",
          note: noteFor(doc.title, "Update check-in date when confirmed."),
          actionType: "hotel",
        },
        {
          title: `${label} check-out`,
          time: "11:00",
          note: noteFor(doc.title, "Update check-out date when confirmed."),
          actionType: "hotel",
        },
      ];
    }

    case "booking": {
      const title = deriveTitle(doc.title, "Reservation");
      return [
        {
          title,
          time: "12:00",
          note: noteFor(doc.title, "Update date and time when confirmed."),
          actionType: "activity",
        },
      ];
    }

    // No useful timeline actions for identity documents or generic files.
    case "identity":
    case "other":
    default:
      return [];
  }
}
