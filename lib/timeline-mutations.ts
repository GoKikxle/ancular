import { createClient } from "@/lib/supabase/server";
import type { GeneratedItem } from "@/lib/ai-itinerary";
import type { DocumentGeneratedItem } from "@/lib/document-to-timeline";

/**
 * Input shape for a manually-created timeline action.
 *
 * Fields that don't yet have DB columns are packed into `note` as readable
 * plain text (e.g. "Birmingham → London · ends 12:00 · bring ticket").
 *
 * TODO: when these columns are added to timeline_items, store directly:
 *   end_time     TEXT NULL     — e.g. "12:00"
 *   route        TEXT NULL     — e.g. "Birmingham → London"
 *   action_type  TEXT NULL     — 'train' | 'flight' | 'pickup' | 'hotel' | 'restaurant' | 'activity' | 'other'
 *   source       TEXT NULL     — 'manual' | 'ai' | 'document'
 */
export type ManualActionInput = {
  eventDate: string;    // "YYYY-MM-DD" — from <input type="date">; stored in event_date column
  time: string;         // "HH:MM" — from <input type="time">
  title: string;
  endTime?: string;     // HH:MM, optional
  route?: string;       // route, venue, or location string
  note?: string;        // free-text user notes
};

/**
 * Inserts a single manually-created action into the trip timeline.
 *
 * Ordering: sort_order is left null so the item sorts purely by time in
 * getTimelineItemsForTrip (which orders by time ASC, sort_order ASC NULLS LAST).
 *
 * Note encoding: end_time and route are packed into the note column as
 * human-readable text until the schema has dedicated columns for them.
 */
export async function insertManualTimelineItem(
  tripId: string,
  input: ManualActionInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Pack route, end time, and free notes into the note field.
  // The display order matches how a user reads a travel itinerary.
  const noteParts = [
    input.route?.trim() || null,
    input.endTime ? `ends ${input.endTime}` : null,
    input.note?.trim() || null,
  ].filter(Boolean);

  const { error } = await supabase.from("timeline_items").insert({
    trip_id: tripId,
    event_date: input.eventDate,  // "YYYY-MM-DD" — requires schema migration (see lib/timeline-items.ts)
    time: input.time,
    title: input.title,
    note: noteParts.join(" · "),
    sort_order: null, // chronological ordering is handled by event_date + time columns
    // TODO: source: 'manual', action_type: input.actionType — add when columns exist
  });

  if (error) {
    console.error("[timeline-mutations] Manual insert failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Appends a single item to the trip timeline, placed after all existing items.
 * Unlike replaceTimelineItems, this is non-destructive — it does not remove
 * any existing rows.
 */
export async function appendTimelineItem(
  tripId: string,
  item: { time: string; title: string; note: string }
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Find the current highest sort_order so we can append after it
  const { data: existing } = await supabase
    .from("timeline_items")
    .select("sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = (existing?.[0]?.sort_order as number | null) ?? 0;

  const { error } = await supabase.from("timeline_items").insert({
    trip_id: tripId,
    time: item.time,
    title: item.title,
    note: item.note,
    sort_order: maxOrder + 1,
  });

  if (error) {
    console.error("[timeline-mutations] Append failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Deletes a single timeline item by its primary key.
 * Safe: only removes the row with the given id.
 */
export async function deleteTimelineItem(
  itemId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("timeline_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("[timeline-mutations] Delete failed:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Replaces all timeline_items for a trip with the provided items.
 *
 * Strategy: DELETE all existing rows for the trip, then bulk INSERT the new ones.
 * This avoids duplicates on every re-generation and keeps sort_order clean.
 *
 * If items is empty the function still deletes existing rows (effectively clears
 * the timeline) and returns successfully.
 */
export async function replaceTimelineItems(
  tripId: string,
  items: GeneratedItem[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // 1 — Remove all existing timeline rows for this trip
  const { error: deleteError } = await supabase
    .from("timeline_items")
    .delete()
    .eq("trip_id", tripId);

  if (deleteError) {
    console.error("[timeline-mutations] Delete failed:", deleteError.message);
    return { error: deleteError.message };
  }

  if (items.length === 0) return { error: null };

  // 2 — Bulk insert the generated rows
  const rows = items.map((item) => ({
    trip_id: tripId,
    time: item.time,
    title: item.title,
    note: item.note,
    sort_order: item.sort_order,
    // TODO: uncomment once `location` and `document_label` columns exist
    //       in the timeline_items table (see lib/timeline-items.ts for schema notes):
    // location: item.location ?? null,
    // document_label: item.document_label ?? null,
  }));

  const { error: insertError } = await supabase
    .from("timeline_items")
    .insert(rows);

  if (insertError) {
    console.error("[timeline-mutations] Insert failed:", insertError.message);
    return { error: insertError.message };
  }

  return { error: null };
}

/**
 * Inserts timeline items generated from a document attachment.
 *
 * Deduplication: before inserting, the existing item titles for this trip are
 * fetched and any generated item whose title already exists is skipped. This
 * prevents re-attaching the same document (or a document with an identical title)
 * from creating duplicate timeline rows.
 *
 * All inserted items have `event_date: null` so they sort after explicitly-dated
 * items (NULLS LAST) and the user can fill in the actual date later.
 *
 * ── Source metadata ────────────────────────────────────────────────────────────
 * `documentId` is accepted and intentionally unused until the schema gains a
 * `source_document_id` column. When that column is available, store it here for
 * precise per-document deduplication and traceability.
 *
 * TODO: run this SQL migration, then store the values below:
 *   ALTER TABLE timeline_items ADD COLUMN IF NOT EXISTS source TEXT NULL
 *     CHECK (source IS NULL OR source IN ('manual', 'ai', 'document'));
 *   ALTER TABLE timeline_items ADD COLUMN IF NOT EXISTS source_document_id UUID NULL
 *     REFERENCES documents(id) ON DELETE SET NULL;
 *
 * Then replace the title-based dedup with:
 *   SELECT id FROM timeline_items WHERE trip_id = $1 AND source_document_id = $2
 */
export async function insertDocumentTimelineItems(
  tripId: string,
  items: DocumentGeneratedItem[],
  /** Prepared for future `source_document_id` column — not yet stored in DB. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _documentId?: string
): Promise<{ inserted: number; error: string | null }> {
  if (items.length === 0) return { inserted: 0, error: null };

  const supabase = await createClient();

  // Fetch existing titles for this trip so we can skip duplicates.
  const { data: existing, error: fetchError } = await supabase
    .from("timeline_items")
    .select("title")
    .eq("trip_id", tripId);

  if (fetchError) {
    console.error("[timeline-mutations] Dedup fetch failed:", fetchError.message);
    return { inserted: 0, error: fetchError.message };
  }

  const existingTitles = new Set(
    (existing ?? []).map((row: { title: string }) => row.title.toLowerCase().trim())
  );

  // Only insert items whose title does not already exist in this trip.
  const newItems = items.filter(
    (item) => !existingTitles.has(item.title.toLowerCase().trim())
  );

  if (newItems.length === 0) return { inserted: 0, error: null };

  const rows = newItems.map((item) => ({
    trip_id: tripId,
    event_date: null,    // Unknown until user edits — sorts last (NULLS LAST in getTimelineItemsForTrip)
    time: item.time,
    title: item.title,
    note: item.note,
    sort_order: null,
    // TODO: source: "document", source_document_id: documentId — add when columns exist
  }));

  const { error: insertError } = await supabase.from("timeline_items").insert(rows);

  if (insertError) {
    console.error("[timeline-mutations] Document timeline insert failed:", insertError.message);
    return { inserted: 0, error: insertError.message };
  }

  return { inserted: newItems.length, error: null };
}
