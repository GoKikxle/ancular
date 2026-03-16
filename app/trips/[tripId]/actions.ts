"use server";

import { revalidatePath } from "next/cache";
import { attachDocumentToTrip, removeDocumentFromTrip } from "@/lib/trip-documents";
import { uploadToStorage, insertDocument } from "@/lib/documents";
import { generateItinerary } from "@/lib/ai-itinerary";
import {
  replaceTimelineItems,
  appendTimelineItem,
  insertManualTimelineItem,
  deleteTimelineItem,
  insertDocumentTimelineItems,
  updateTimelineItem,
} from "@/lib/timeline-mutations";
import { generateTimelineItemsFromDocument } from "@/lib/document-to-timeline";
import type { TripDateContext } from "@/lib/document-to-timeline";
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
 * Adds a single smart suggestion as a new timeline item on a trip.
 * Non-destructive — appends after all existing items.
 *
 * Returns { error: string | null } for client feedback.
 */
export async function addSuggestionToTimelineAction(
  tripId: string,
  tripSlug: string,
  suggestion: { title: string; description: string; suggested_time?: string }
): Promise<{ error: string | null }> {
  const time = suggestion.suggested_time ?? "12:00";
  const { error } = await appendTimelineItem(tripId, {
    time,
    title: suggestion.title,
    note: suggestion.description,
  });
  if (error) return { error };
  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}

/**
 * Adds a manually-entered booked action to the trip timeline.
 *
 * Fields without a DB column yet (end_time, route) are encoded into the
 * note field as readable plain text. See lib/timeline-mutations.ts for the
 * full encoding strategy and migration path.
 *
 * FormData keys:
 *   action_type  — 'train' | 'flight' | 'pickup' | 'hotel' | 'restaurant' | 'activity' | 'other'
 *   event_date   — "YYYY-MM-DD" (required)
 *   title        — e.g. "Train to London" (required)
 *   start_time   — HH:MM (required)
 *   end_time     — HH:MM (optional)
 *   route        — route, venue, or location (optional)
 *   note         — free-text notes (optional)
 */
export async function addManualActionAction(
  tripId: string,
  tripSlug: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const eventDate = (formData.get("event_date") as string | null)?.trim();
  const title = (formData.get("title") as string | null)?.trim();
  const startTime = (formData.get("start_time") as string | null)?.trim();
  const endTime = (formData.get("end_time") as string | null)?.trim() || undefined;
  const route = (formData.get("route") as string | null)?.trim() || undefined;
  const note = (formData.get("note") as string | null)?.trim() || undefined;

  if (!eventDate) return { error: "Please select a date for this action." };
  if (!title) return { error: "Please enter a title for this action." };
  if (!startTime) return { error: "Please enter a start time." };

  const { error } = await insertManualTimelineItem(tripId, {
    eventDate,
    time: startTime,
    title,
    endTime,
    route,
    note,
  });

  if (error) return { error: `Could not save action: ${error}` };

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}

/**
 * Updates a single timeline item's editable fields and revalidates the trip page.
 *
 * FormData keys:
 *   event_date  — "YYYY-MM-DD" (required)
 *   time        — "HH:MM"      (required)
 *   title       — display text  (required)
 *   note        — free text     (optional)
 */
/**
 * Matches ISO date strings produced by <input type="date">: "YYYY-MM-DD".
 * Rejects empty strings, locale-formatted strings, and partial dates before
 * they reach Supabase's DATE column parser.
 */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Matches 24-hour time strings produced by <input type="time">: "HH:MM".
 */
const HH_MM_RE = /^\d{2}:\d{2}$/;

export async function updateTimelineItemAction(
  itemId: string,
  tripSlug: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const eventDate = (formData.get("event_date") as string | null)?.trim() ?? "";
  const time = (formData.get("time") as string | null)?.trim() ?? "";
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const note = (formData.get("note") as string | null)?.trim() ?? "";

  // Validate before hitting Supabase — ISO format guards prevent malformed
  // date strings from reaching the DB's DATE column parser.
  if (!eventDate || !ISO_DATE_RE.test(eventDate))
    return { error: "Please select a valid date (YYYY-MM-DD)." };
  if (!time || !HH_MM_RE.test(time))
    return { error: "Please enter a valid time (HH:MM)." };
  if (!title)
    return { error: "Please enter a title." };

  const { error } = await updateTimelineItem({ id: itemId, eventDate, time, title, note });
  if (error) return { error: `Could not update action: ${error}` };

  // Invalidate the trip page cache so the next RSC render returns the updated,
  // correctly-ordered timeline from Supabase.
  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}

/**
 * Deletes a single timeline item and revalidates the trip page.
 * Only the row with the given itemId is removed; all others are preserved.
 */
export async function deleteTimelineItemAction(
  itemId: string,
  tripSlug: string
): Promise<{ error: string | null }> {
  const { error } = await deleteTimelineItem(itemId);
  if (error) return { error };
  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}

/**
 * Removes a document from a trip (deletes the trip_documents join row only).
 *
 * The document and its file in Supabase Storage are untouched — this is NOT
 * a vault delete. The document remains available for re-attachment.
 */
export async function removeDocumentFromTripAction(
  tripId: string,
  tripSlug: string,
  documentId: string
): Promise<{ error: string | null }> {
  const { error } = await removeDocumentFromTrip(tripId, documentId);
  if (error) return { error };
  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}

/**
 * Attaches an existing vault document to a trip, then auto-creates timeline
 * items from the document's category and title.
 *
 * Accepts the full document object (not just the ID) so the generation step
 * has access to `title` and `category` without an extra DB round-trip.
 *
 * Duplicate attach pairs are handled silently by the DB UNIQUE constraint.
 * Duplicate timeline items are filtered by `insertDocumentTimelineItems`.
 *
 * Returns { error, timelineItemsCreated } rather than throwing, consistent
 * with the upload action signature.
 */
export async function attachDocumentAction(
  tripId: string,
  tripSlug: string,
  doc: { id: string; title: string; category: DocumentCategory },
  /** Trip start/end dates used to assign event_date to generated timeline items. */
  tripDates?: TripDateContext
): Promise<{ error: string | null; timelineItemsCreated: number }> {
  const { error } = await attachDocumentToTrip(tripId, doc.id);
  if (error) return { error, timelineItemsCreated: 0 };

  // Auto-create timeline items from the document's category + title.
  // tripDates provides fallback event_date values so hotel/flight items land
  // on the correct day instead of sorting last with a null date.
  const generated = generateTimelineItemsFromDocument(
    { title: doc.title, category: doc.category },
    tripDates
  );
  const { inserted } = await insertDocumentTimelineItems(tripId, generated, doc.id);

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null, timelineItemsCreated: inserted };
}

/**
 * Uploads a new file to Supabase Storage, creates a documents row, links it
 * to the trip via trip_documents, and auto-creates timeline items from the
 * document's category and title.
 *
 * Steps:
 *   1. Validate inputs.
 *   2. Upload file → Storage path + signed URL.
 *   3. Insert into documents table.
 *   4. Insert into trip_documents (auto-attach to this trip).
 *   5. Generate and insert timeline items (deduped by title).
 *   6. Revalidate the trip detail page.
 *
 * Returns { error, timelineItemsCreated } so the client can show a contextual
 * success message (e.g. "Uploaded · 1 action added to timeline").
 */
export async function uploadAndAttachDocumentAction(
  tripId: string,
  tripSlug: string,
  formData: FormData,
  /** Trip start/end dates used to assign event_date to generated timeline items. */
  tripDates?: TripDateContext
): Promise<{ error: string | null; timelineItemsCreated: number }> {
  const file = formData.get("file") as File | null;
  // The form field is named "name" (HTML convention) but maps to `title` in the DB.
  const title = (formData.get("name") as string | null)?.trim();
  const category = (formData.get("category") as DocumentCategory | null) ?? "other";

  if (!file || file.size === 0) return { error: "Please select a file.", timelineItemsCreated: 0 };
  if (!title) return { error: "Please enter a document title.", timelineItemsCreated: 0 };

  // 1 — Upload to the bucket that matches the document category
  const { path, bucket, signedUrl, error: storageError } = await uploadToStorage(file, tripId, category);
  if (storageError) return { error: `Upload failed: ${storageError}`, timelineItemsCreated: 0 };

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
  if (insertError || !document) return { error: `Could not save document: ${insertError}`, timelineItemsCreated: 0 };

  // 3 — Attach to trip
  const { error: attachError } = await attachDocumentToTrip(tripId, document.id);
  if (attachError) return { error: `Uploaded but failed to attach: ${attachError}`, timelineItemsCreated: 0 };

  // 4 — Auto-create timeline items from category + title (deduped, non-blocking)
  const generated = generateTimelineItemsFromDocument({ title, category }, tripDates);
  const { inserted } = await insertDocumentTimelineItems(tripId, generated, document.id);

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null, timelineItemsCreated: inserted };
}
