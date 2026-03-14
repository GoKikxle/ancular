"use server";

import { revalidatePath } from "next/cache";
import { attachDocumentToTrip } from "@/lib/trip-documents";

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
