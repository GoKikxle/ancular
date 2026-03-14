import { createClient } from "@/lib/supabase/server";

/**
 * DB shape for a row in the `timeline_items` table.
 *
 * Minimum required columns (create the table with at least these):
 *   id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE
 *   time        TEXT NOT NULL          -- e.g. "9:00 AM"
 *   title       TEXT NOT NULL
 *   note        TEXT NOT NULL DEFAULT ''
 *   sort_order  INTEGER NULL           -- ascending display order
 *   created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
 *
 * TODO: extend the schema with these columns when ready:
 *   location        TEXT NULL   -- e.g. "Terminal 2, Gate B14"
 *   document_label  TEXT NULL   -- e.g. "Boarding Pass"
 */
export type DbTimelineItem = {
  id: string;
  trip_id: string;
  time: string;
  title: string;
  note: string;
  sort_order: number | null;
  // Optional — add columns to DB before relying on these:
  location?: string | null;
  document_label?: string | null;
  created_at: string;
};

export async function getTimelineItemsForTrip(
  tripId: string
): Promise<DbTimelineItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true });

  if (error) {
    // Timeline is non-critical — log and return an empty list
    // so the rest of the trip detail page still renders.
    console.error("[timeline-items] Failed to fetch:", error.message);
    return [];
  }

  return (data ?? []) as DbTimelineItem[];
}
