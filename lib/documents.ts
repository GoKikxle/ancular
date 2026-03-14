import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";

/**
 * Canonical DB shape for a row in the `documents` table (snake_case columns).
 * Imported by lib/trip-documents.ts for the FK join query as well.
 *
 * Minimum required table definition:
 *   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   name         TEXT NOT NULL
 *   category     TEXT NOT NULL CHECK (category IN ('flight','hotel','identity','booking','other'))
 *   file_url     TEXT NULL      -- Supabase Storage public URL
 *   file_name    TEXT NULL      -- original filename from upload (e.g. "ticket.pdf")
 *   mime_type    TEXT NULL      -- e.g. "application/pdf", "image/jpeg"
 *   uploaded_at  DATE NOT NULL DEFAULT now()
 *   notes        TEXT NULL
 *
 * TODO (Phase 3 – upload): if `file_name` column does not exist yet, run:
 *   ALTER TABLE documents ADD COLUMN file_name TEXT NULL;
 */
export type DbDocument = {
  id: string;
  name: string;
  category: DocumentCategory;
  file_url: string | null;
  /** Original filename from upload — stored separately from the display name. */
  file_name?: string | null;
  mime_type: string | null;
  uploaded_at: string;
  notes?: string | null;
};

/** Fetches every document in the vault, newest first. */
export async function getAllDocuments(): Promise<DbDocument[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("[documents] Failed to fetch vault:", error.message);
    return [];
  }

  return (data ?? []) as DbDocument[];
}
