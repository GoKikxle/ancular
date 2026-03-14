import { createClient } from "@/lib/supabase/server";
import type { DbDocument } from "@/lib/documents";

// Re-export so callers can import DbDocument from either file.
export type { DbDocument } from "@/lib/documents";

/**
 * Join table (`trip_documents`) schema:
 *   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE
 *   document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE
 *   attached_at  DATE NOT NULL DEFAULT now()
 *   UNIQUE (trip_id, document_id)
 *
 * TODO (Phase 2 – attach flow):
 *   supabase.from("trip_documents").insert({ trip_id, document_id })
 *
 * TODO (Phase 3 – upload flow):
 *   supabase.storage.from("documents").upload(path, file)
 *   then supabase.from("documents").insert({ name, category, file_url, ... })
 */

export async function getDocumentsForTrip(
  tripId: string
): Promise<DbDocument[]> {
  const supabase = await createClient();

  // Uses Supabase's implicit FK join: trip_documents → documents
  const { data, error } = await supabase
    .from("trip_documents")
    .select("documents(*)")
    .eq("trip_id", tripId);

  if (error) {
    // Documents are non-critical — log and return empty so the page still renders.
    console.error("[trip-documents] Failed to fetch:", error.message);
    return [];
  }

  // Each row is { documents: DbDocument }; unwrap and filter out any null joins.
  return (data ?? [])
    .map((row) => (row as { documents: DbDocument }).documents)
    .filter(Boolean);
}
