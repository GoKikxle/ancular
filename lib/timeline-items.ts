import { createClient } from "@/lib/supabase/server";

/**
 * DB shape for a row in the `timeline_items` table.
 *
 * Required columns:
 *   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE
 *   event_date   DATE NULL              -- "YYYY-MM-DD"; see migration note below
 *   time         TEXT NOT NULL          -- "HH:MM" (24-hour, zero-padded)
 *   title        TEXT NOT NULL
 *   note         TEXT NOT NULL DEFAULT ''
 *   sort_order   INTEGER NULL           -- ascending display order
 *   document_id  UUID NULL REFERENCES documents(id) ON DELETE SET NULL
 *                                       -- run supabase/add-document-id.sql
 *   created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
 *
 * ⚠️  Schema migrations required:
 *   event_date:  supabase/add-event-date.sql
 *   document_id: supabase/add-document-id.sql
 *
 * TODO: extend the schema with these columns when ready:
 *   location        TEXT NULL   -- e.g. "Terminal 2, Gate B14"
 *   document_label  TEXT NULL   -- e.g. "Boarding Pass"
 *
 * Source column — activate visual distinction in TimelineCard:
 *   ALTER TABLE timeline_items
 *     ADD COLUMN IF NOT EXISTS source TEXT NULL
 *     CHECK (source IS NULL OR source IN ('manual', 'ai', 'document'));
 *   Then update insertManualTimelineItem   → source: 'manual'
 *        update insertDocumentTimelineItems → source: 'document'
 *        update replaceTimelineItems        → source: 'ai'
 */
export type DbTimelineItem = {
  id: string;
  trip_id: string;
  /** ISO date string "YYYY-MM-DD". NULL for items created before date support. */
  event_date?: string | null;
  time: string;
  title: string;
  note: string;
  sort_order: number | null;
  /**
   * UUID of the linked document from the `documents` table.
   * NULL when no document is associated with this action.
   * Requires supabase/add-document-id.sql migration.
   * ON DELETE SET NULL — if the document is deleted from the vault,
   * this field silently becomes null rather than blocking the delete.
   */
  document_id?: string | null;
  // Optional — add columns to DB before relying on these:
  location?: string | null;
  document_label?: string | null;
  /** 'manual' | 'ai' | 'document' — NULL until source column is added to DB. */
  source?: "manual" | "ai" | "document" | null;
  created_at: string;
};

/**
 * Minimal document shape passed to timeline forms for the document selector.
 * Only the fields needed to render the selector and store the FK are included.
 * Keeping it separate from DbDocument avoids importing the full document type
 * into every client component that renders a timeline form.
 */
export type TripDocOption = {
  id: string;
  title: string;
};

export async function getTimelineItemsForTrip(
  tripId: string
): Promise<DbTimelineItem[]> {
  const supabase = await createClient();

  // Sort order:
  //   1. event_date ASC, nulls last  — items with a date come first in calendar order;
  //      legacy items (no date) fall to the bottom.
  //   2. time ASC                    — within the same day, sort chronologically by HH:MM.
  //   3. sort_order ASC, nulls last  — tiebreak for AI-generated items sharing a time slot.
  const { data, error } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("time", { ascending: true })
    .order("sort_order", { ascending: true, nullsFirst: false });

  if (error) {
    // Timeline is non-critical — log and return an empty list
    // so the rest of the trip detail page still renders.
    console.error("[timeline-items] Failed to fetch:", error.message);
    return [];
  }

  return (data ?? []) as DbTimelineItem[];
}
