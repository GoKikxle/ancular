"use server";

import { revalidatePath } from "next/cache";
import { deleteDocumentFromVault } from "@/lib/documents";
import { getTripIdsForDocument } from "@/lib/trip-documents";
import { getSlugsForTripIds } from "@/lib/trips";

/**
 * Permanently deletes a document from the vault.
 *
 * Steps (in lib/documents.ts):
 *   1. Delete file from Supabase Storage (if storage metadata is available).
 *   2. Delete `documents` row — ON DELETE CASCADE removes all trip_documents links.
 *   3. timeline_items.document_id is SET NULL via FK.
 *
 * Returns { error: string | null } — null means success.
 */
export async function deleteDocumentAction(
  docId: string,
  storagePath: string | null | undefined,
  storageBucket: string | null | undefined
): Promise<{ error: string | null }> {
  const tripIds = await getTripIdsForDocument(docId);

  const { error } = await deleteDocumentFromVault({
    id: docId,
    storage_path: storagePath,
    storage_bucket: storageBucket,
  });

  if (error) {
    return { error: "Could not remove document" };
  }

  revalidatePath("/documents");
  const slugs = await getSlugsForTripIds(tripIds);
  slugs.forEach((s) => revalidatePath(`/trips/${s}`));
  return { error: null };
}
