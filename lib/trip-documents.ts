import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";

/**
 * DB shape for a row in the `documents` table (snake_case columns).
 *
 * Minimum required table definition:
 *   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   name         TEXT NOT NULL
 *   category     TEXT NOT NULL CHECK (category IN ('flight','hotel','identity','booking','other'))
 *   file_url     TEXT NULL          -- Supabase Storage public URL
 *   mime_type    TEXT NULL
 *   uploaded_at  DATE NOT NULL DEFAULT now()
 *   notes        TEXT NULL
 *
 * Required join table (`trip_documents`):
 *   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE
 *   document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE
 *   attached_at  DATE NOT NULL DEFAULT now()
 *   UNIQUE (trip_id, document_id)
 *
 * TODO (Phase 2 – attach flow): call
 *   supabase.from("trip_documents").insert({ trip_id, document_id })
 *
 * TODO (Phase 3 – upload flow): call
 *   supabase.storage.from("documents").upload(path, file)
 *   then supabase.from("documents").insert({ name, category, file_url, ... })
 */
export type DbDocument = {
  id: string;
  name: string;
  category: DocumentCategory;
  file_url: string | null;
  mime_type: string | null;
  uploaded_at: string;
  notes?: string | null;
};

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
