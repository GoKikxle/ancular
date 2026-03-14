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
 *   UNIQUE (trip_id, document_id)   ← enforces no-duplicate at DB level
 *
 * TODO (Phase 4 – upload flow):
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
    .map((row) => (row as unknown as { documents: DbDocument }).documents)
    .filter(Boolean);
}

/**
 * Attaches a vault document to a trip.
 * The UNIQUE constraint on (trip_id, document_id) prevents duplicates at the
 * DB level. Postgres error code 23505 = unique_violation; we treat it as a
 * no-op so callers don't need to pre-filter.
 */
export async function attachDocumentToTrip(
  tripId: string,
  documentId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trip_documents")
    .insert({ trip_id: tripId, document_id: documentId });

  if (error) {
    if (error.code === "23505") return { error: null }; // already attached — silent no-op
    console.error("[trip-documents] Failed to attach:", error.message);
    return { error: error.message };
  }

  return { error: null };
}
