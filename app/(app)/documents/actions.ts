"use server";

import { revalidatePath } from "next/cache";
import { deleteDocumentFromVault } from "@/lib/documents";

/**
 * Permanently deletes a document from the vault.
 *
 * Steps (in lib/documents.ts):
 *   1. Delete file from Supabase Storage (if storage metadata is available).
 *   2. Delete `documents` row — ON DELETE CASCADE removes all trip_documents links.
 *
 * Storage warnings (e.g. file already gone) are logged server-side only and
 * do not surface to the user — the document is gone from their perspective.
 *
 * Returns { error: string | null } — null means success.
 */
export async function deleteDocumentAction(
  docId: string,
  storagePath: string | null | undefined,
  storageBucket: string | null | undefined
): Promise<{ error: string | null }> {
  const { error } = await deleteDocumentFromVault({
    id: docId,
    storage_path: storagePath,
    storage_bucket: storageBucket,
  });

  if (error) return { error };

  revalidatePath("/documents");
  return { error: null };
}
