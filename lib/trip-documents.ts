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
 * Removes a document from a specific trip by deleting the trip_documents row.
 *
 * Safe by design:
 *   - Does NOT delete the document from the `documents` table.
 *   - Does NOT delete the file from Supabase Storage.
 *   - Only the join row (trip_id, document_id) is removed.
 *   - The document remains in the vault and can be re-attached at any time.
 */
export async function removeDocumentFromTrip(
  tripId: string,
  documentId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trip_documents")
    .delete()
    .eq("trip_id", tripId)
    .eq("document_id", documentId);

  if (error) {
    console.error("[trip-documents] Failed to remove:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Returns trip IDs that have this document attached. Used to revalidate trip
 * pages when a document is deleted from the vault.
 */
export async function getTripIdsForDocument(documentId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_documents")
    .select("trip_id")
    .eq("document_id", documentId);

  if (error) {
    console.error("[trip-documents] Failed to fetch trips for document:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.trip_id);
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
