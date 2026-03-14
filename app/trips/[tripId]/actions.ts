"use server";

import { revalidatePath } from "next/cache";
import { attachDocumentToTrip } from "@/lib/trip-documents";
import { uploadToStorage, insertDocument } from "@/lib/documents";
import type { DocumentCategory } from "@/types/document";

/**
 * Attaches an existing vault document to a trip.
 * Duplicate pairs are handled silently by the DB UNIQUE constraint.
 */
export async function attachDocumentAction(
  tripId: string,
  tripSlug: string,
  documentId: string
): Promise<void> {
  const { error } = await attachDocumentToTrip(tripId, documentId);
  if (error) throw new Error(error);
  revalidatePath(`/trips/${tripSlug}`);
}

/**
 * Uploads a new file to Supabase Storage, creates a documents row, and
 * immediately links it to the trip via trip_documents.
 *
 * Steps:
 *   1. Validate inputs.
 *   2. Upload file → Storage path + public URL.
 *   3. Insert into documents table.
 *   4. Insert into trip_documents (auto-attach to this trip).
 *   5. Revalidate the trip detail page.
 *
 * Returns { error: string | null } so the client can display inline feedback
 * without throwing (which would surface as an unhandled error boundary).
 */
export async function uploadAndAttachDocumentAction(
  tripId: string,
  tripSlug: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string | null)?.trim();
  const category = (formData.get("category") as DocumentCategory | null) ?? "other";

  if (!file || file.size === 0) return { error: "Please select a file." };
  if (!name) return { error: "Please enter a document title." };

  // 1 — Upload to the bucket that matches the document category
  const { path, bucket, signedUrl, error: storageError } = await uploadToStorage(file, tripId, category);
  if (storageError) return { error: `Upload failed: ${storageError}` };

  // 2 — Insert documents row
  const { document, error: insertError } = await insertDocument({
    name,
    category,
    file_url: signedUrl,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    storage_path: path,
    storage_bucket: bucket,
  });
  if (insertError || !document) return { error: `Could not save document: ${insertError}` };

  // 3 — Attach to trip
  const { error: attachError } = await attachDocumentToTrip(tripId, document.id);
  if (attachError) return { error: `Uploaded but failed to attach: ${attachError}` };

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}
