"use server";

import { revalidatePath } from "next/cache";
import { attachDocumentToTrip } from "@/lib/trip-documents";
import { uploadToStorage, insertDocument } from "@/lib/documents";
import { generateItinerary } from "@/lib/ai-itinerary";
import { replaceTimelineItems } from "@/lib/timeline-mutations";
import type { DocumentCategory } from "@/types/document";

type TripContext = {
  title: string;
  dates: string;
  weather_summary: string | null;
  weather_note: string | null;
};

/**
 * Generate an AI itinerary for a trip and persist it into timeline_items.
 *
 * Flow:
 *   1. Read user preferences from FormData.
 *   2. Call generateItinerary() — currently the smart mock; swap for a real
 *      provider by editing lib/ai-itinerary.ts (interface unchanged).
 *   3. Persist via replaceTimelineItems() — clears existing items, inserts new.
 *   4. Revalidate the trip page so the updated timeline is shown.
 *
 * Returns { error: string | null } so the client can display inline feedback.
 */
export async function generateItineraryAction(
  tripId: string,
  tripSlug: string,
  tripContext: TripContext,
  formData: FormData
): Promise<{ error: string | null }> {
  const destination = (formData.get("destination") as string | null)?.trim();
  const travelStyle = (formData.get("travel_style") as string | null)?.trim();
  const interests = (formData.get("interests") as string | null)?.trim();
  const pace = (formData.get("pace") as string | null)?.trim();
  const notes = (formData.get("notes") as string | null)?.trim();

  const { items, error: genError } = await generateItinerary({
    tripTitle: tripContext.title,
    tripDates: tripContext.dates,
    weatherSummary: tripContext.weather_summary,
    weatherNote: tripContext.weather_note,
    destination,
    travelStyle,
    interests,
    pace,
    notes,
  });

  if (genError) return { error: `Generation failed: ${genError}` };

  const { error: saveError } = await replaceTimelineItems(tripId, items);
  if (saveError) return { error: `Could not save itinerary: ${saveError}` };

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}

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
  // The form field is named "name" (HTML convention) but maps to `title` in the DB.
  const title = (formData.get("name") as string | null)?.trim();
  const category = (formData.get("category") as DocumentCategory | null) ?? "other";

  if (!file || file.size === 0) return { error: "Please select a file." };
  if (!title) return { error: "Please enter a document title." };

  // 1 — Upload to the bucket that matches the document category
  const { path, bucket, signedUrl, error: storageError } = await uploadToStorage(file, tripId, category);
  if (storageError) return { error: `Upload failed: ${storageError}` };

  // 2 — Insert documents row
  const { document, error: insertError } = await insertDocument({
    title,
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
