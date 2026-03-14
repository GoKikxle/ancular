import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";
import { getBucketForCategory, SIGNED_URL_TTL } from "@/lib/storage-buckets";

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
  /** Long-lived signed URL (5-year TTL). Regenerate from storage_bucket + storage_path if expired. */
  file_url: string | null;
  /** Original filename from upload — stored separately from the display name. */
  file_name?: string | null;
  mime_type: string | null;
  uploaded_at: string;
  notes?: string | null;
  /** Object path within the storage bucket — used to regenerate signed URLs. */
  storage_path?: string | null;
  /** Supabase Storage bucket name (e.g. "flight"). See lib/storage-buckets.ts. */
  storage_bucket?: string | null;
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
 * Uploads a file to the correct private Supabase Storage bucket for its
 * document category, then returns a long-lived signed URL.
 *
 * Bucket routing:  category → bucket (see lib/storage-buckets.ts)
 * Storage layout:  {bucket}/{tripId}/{timestamp}-{sanitizedFilename}
 *
 * Signed URL TTL: SIGNED_URL_TTL (~5 years). The URL is stored in the
 * documents.file_url column. To regenerate a fresh signed URL later:
 *   supabase.storage.from(storage_bucket).createSignedUrl(storage_path, SIGNED_URL_TTL)
 *
 * BUCKET SETUP: Run supabase/storage-setup.sql once in your Supabase project.
 */
export async function uploadToStorage(
  file: File,
  tripId: string,
  category: DocumentCategory
): Promise<{ path: string; bucket: string; signedUrl: string; error: string | null }> {
  const supabase = await createClient();

  const bucket = getBucketForCategory(category);
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${tripId}/${Date.now()}-${sanitized}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error(`[documents] Storage upload to "${bucket}" failed:`, uploadError.message);
    return { path: "", bucket: "", signedUrl: "", error: uploadError.message };
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (signedError || !signedData?.signedUrl) {
    console.error("[documents] Failed to create signed URL:", signedError?.message);
    return { path: "", bucket: "", signedUrl: "", error: signedError?.message ?? "Failed to sign URL" };
  }

  return { path, bucket, signedUrl: signedData.signedUrl, error: null };
}

type InsertDocumentInput = {
  name: string;
  category: DocumentCategory;
  file_url: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  storage_bucket: string;
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
      storage_path: input.storage_path,
      storage_bucket: input.storage_bucket,
    })
    .select()
    .single();

  if (error) {
    console.error("[documents] Insert failed:", error.message);
    return { document: null, error: error.message };
  }

  return { document: data as DbDocument, error: null };
}
