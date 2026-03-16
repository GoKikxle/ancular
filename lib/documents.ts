import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/document";
import { getBucketForCategory, SIGNED_URL_TTL } from "@/lib/storage-buckets";

/**
 * Canonical DB shape for a row in the `documents` table (snake_case columns).
 * Imported by lib/trip-documents.ts for the FK join query as well.
 *
 * Required table definition:
 *   id           UUID PRIMARY KEY DEFAULT gen_random_uuid()
 *   title        TEXT NOT NULL        ← canonical display field
 *   name         TEXT NULL            ← optional alias; mirrored from title on insert
 *   category     TEXT NOT NULL CHECK (category IN ('flight','hotel','identity','booking','other'))
 *   file_url     TEXT NULL      -- long-lived signed URL from Supabase Storage
 *   file_name    TEXT NULL      -- original OS filename (e.g. "boarding-pass.pdf")
 *   mime_type    TEXT NULL      -- e.g. "application/pdf", "image/jpeg"
 *   uploaded_at  DATE NOT NULL DEFAULT now()
 *   notes        TEXT NULL
 *
 * If migrating from a `name`-only schema, run once:
 *   ALTER TABLE documents RENAME COLUMN name TO title;
 *   ALTER TABLE documents ADD COLUMN name TEXT NULL;
 *   UPDATE documents SET name = title;
 *
 * If adding missing columns:
 *   ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT NULL;
 *   ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path TEXT NULL;
 *   ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_bucket TEXT NULL;
 */
export type DbDocument = {
  id: string;
  /** Canonical user-facing display label (e.g. "Boarding pass"). Maps to `title` in DB. */
  title: string;
  /** Optional alias kept for backward compatibility with rows that pre-date the title migration. */
  name?: string | null;
  category: DocumentCategory;
  /** Long-lived signed URL (5-year TTL). Regenerate from storage_bucket + storage_path if expired. */
  file_url: string | null;
  /** Original OS filename from upload — stored separately from the display title. */
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
  title: string;
  category: DocumentCategory;
  file_url: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  storage_bucket: string;
};

/**
 * Permanently deletes a document from the vault.
 *
 * Deletion order:
 *   1. Remove file from Supabase Storage (if storage_path + storage_bucket are set).
 *      If storage removal fails, a warning is recorded but we still proceed —
 *      an orphaned storage object is recoverable; an orphaned DB row is not.
 *   2. Delete the `documents` row.
 *      The FK constraint on `trip_documents.document_id` has ON DELETE CASCADE,
 *      so all trip links are automatically removed at the DB level.
 *
 * Storage "not found" is treated as a no-op (idempotent).
 */
export async function deleteDocumentFromVault(
  doc: Pick<DbDocument, "id" | "storage_path" | "storage_bucket">
): Promise<{ error: string | null; storageWarning: string | null }> {
  const supabase = await createClient();
  let storageWarning: string | null = null;

  if (doc.storage_path && doc.storage_bucket) {
    const { error: storageError } = await supabase.storage
      .from(doc.storage_bucket)
      .remove([doc.storage_path]);

    if (storageError) {
      console.warn("[documents] Storage removal warning:", storageError.message);
      // Log but continue — we always delete the DB row so the vault stays clean.
      // Orphaned storage objects can be swept up by a maintenance job if needed.
      storageWarning = storageError.message;
    }
  }

  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("id", doc.id);

  if (dbError) {
    console.error("[documents] Vault deletion failed:", dbError.message);
    return { error: dbError.message, storageWarning };
  }

  return { error: null, storageWarning };
}

/** Inserts a new row into the documents table and returns it. */
export async function insertDocument(
  input: InsertDocumentInput
): Promise<{ document: DbDocument | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title: input.title,
      name: input.title, // mirror for backward compat — remove if `name` column does not exist
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
