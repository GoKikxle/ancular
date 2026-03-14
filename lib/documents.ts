import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";

/**
 * Canonical DB shape for a row in the `documents` table (snake_case columns).
 * Imported by lib/trip-documents.ts for the FK join query as well.
 *
 * Required table definition:
 *   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   name         TEXT NOT NULL
 *   category     TEXT NOT NULL CHECK (category IN ('flight','hotel','identity','booking','other'))
 *   file_url     TEXT NULL      -- public URL from Supabase Storage (see uploadToStorage)
 *   file_name    TEXT NULL      -- original filename (e.g. "boarding-pass.pdf")
 *   mime_type    TEXT NULL      -- e.g. "application/pdf", "image/jpeg"
 *   uploaded_at  DATE NOT NULL DEFAULT now()
 *   notes        TEXT NULL
 *
 * If `file_name` column does not exist yet, run:
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

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 *
 * Storage layout:  documents/{tripId}/{timestamp}-{sanitizedFilename}
 *
 * BUCKET SETUP (required once in the Supabase dashboard):
 *   1. Create a bucket named "documents".
 *   2. For simplest access, make it PUBLIC (Storage → Bucket → "Make public").
 *      The public URL is then stable and never expires.
 *   3. If you need private access, keep it private and call
 *      supabase.storage.from("documents").createSignedUrl(path, 3600)
 *      at render time instead of storing the URL directly.
 *
 * STORAGE POLICY (anon uploads via server action use the anon key):
 *   INSERT policy on "documents" bucket for role "anon" — path prefix optional.
 *   Example permissive policy for now:
 *     (bucket_id = 'documents')
 */
export async function uploadToStorage(
  file: File,
  tripId: string
): Promise<{ path: string; publicUrl: string; error: string | null }> {
  const supabase = await createClient();

  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${tripId}/${Date.now()}-${sanitized}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("[documents] Storage upload failed:", uploadError.message);
    return { path: "", publicUrl: "", error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(path);

  return { path, publicUrl: urlData.publicUrl, error: null };
}

type InsertDocumentInput = {
  name: string;
  category: DocumentCategory;
  file_url: string;
  file_name: string;
  mime_type: string;
};

/** Inserts a new row into the documents table and returns it. */
export async function insertDocument(
  input: InsertDocumentInput
): Promise<{ document: DbDocument | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      name: input.name,
      category: input.category,
      file_url: input.file_url,
      file_name: input.file_name,
      mime_type: input.mime_type,
    })
    .select()
    .single();

  if (error) {
    console.error("[documents] Insert failed:", error.message);
    return { document: null, error: error.message };
  }

  return { document: data as DbDocument, error: null };
}
