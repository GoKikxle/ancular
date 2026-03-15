import { createClient } from "@/lib/supabase/server";
import type { GeneratedItem } from "@/lib/ai-itinerary";

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
