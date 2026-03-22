"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { attachDocumentToTrip, removeDocumentFromTrip } from "@/lib/trip-documents";
import { uploadToStorage, insertDocument } from "@/lib/documents";
import { generateItinerary } from "@/lib/ai-itinerary";
import {
  replaceTimelineItems,
  appendTimelineItem,
  insertManualTimelineItem,
  deleteTimelineItem,
  updateTimelineItem,
} from "@/lib/timeline-mutations";
import { autoLinkDocumentToTimeline } from "@/lib/document-auto-link";
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
 *   document_id  — UUID of a trip-attached document to link (optional, "" = no link)
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
  // Empty string from the "no document" option is normalised to null.
  const documentId = (formData.get("document_id") as string | null)?.trim() || null;

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
    documentId,
  });

  if (error) return { error: `Could not save action: ${error}` };

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null };
}

// ISO date format guard — rejects empty / locale-formatted / partial dates
// before they reach Supabase's DATE column parser.
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// 24-hour time format guard ("HH:MM")
const HH_MM_RE = /^\d{2}:\d{2}$/;

/**
 * Updates a single timeline item's editable fields and revalidates the trip page.
 *
 * FormData keys:
 *   event_date   — "YYYY-MM-DD" (required)
 *   time         — "HH:MM"      (required)
 *   title        — display text  (required)
 *   note         — free text     (optional)
 *   document_id  — UUID to link, "" or absent to clear the link (optional)
 */
export async function updateTimelineItemAction(
  itemId: string,
  tripSlug: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const eventDate = (formData.get("event_date") as string | null)?.trim() ?? "";
  const time = (formData.get("time") as string | null)?.trim() ?? "";
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const note = (formData.get("note") as string | null)?.trim() ?? "";
  // document_id is always present in the edit form (as "" when unlinked).
  // We normalise "" → null so the mutation can write null to the DB.
  const documentId = (formData.get("document_id") as string | null)?.trim() || null;

  // Validate before hitting Supabase — ISO format guards prevent malformed
  // date strings from reaching the DB's DATE column parser.
  if (!eventDate || !ISO_DATE_RE.test(eventDate))
    return { error: "Please select a valid date (YYYY-MM-DD)." };
  if (!time || !HH_MM_RE.test(time))
    return { error: "Please enter a valid time (HH:MM)." };
  if (!title)
    return { error: "Please enter a title." };

  const { error } = await updateTimelineItem({ id: itemId, eventDate, time, title, note, documentId });
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
 * Attaches an existing vault document to a trip, then attempts to auto-link
 * it to the most relevant existing timeline item.
 *
 * ── What it does ──────────────────────────────────────────────────────────────
 *   1. Creates the trip_documents join row (idempotent via DB UNIQUE constraint).
 *   2. Heuristic auto-link: searches existing timeline items for a confident
 *      category + keyword match, and sets document_id on the winner.
 *      Only items whose document_id IS NULL are candidates — no overwrite.
 *
 * ── What it does NOT do ──────────────────────────────────────────────────────
 *   Does NOT auto-create new timeline items from the document. The creation
 *   path was removed because it was title-dependent and produced duplicates
 *   when the document label didn't closely match existing item titles.
 *   If no confident timeline match exists, the document is attached to the
 *   trip and left unlinked — the user can link it manually via the edit form.
 *
 * ── Future upgrade ────────────────────────────────────────────────────────────
 *   When OCR / AI extraction is added, pass `extractedText` into
 *   `autoLinkDocumentToTimeline` to improve match confidence before deciding
 *   whether to create a new item.
 *
 * Returns { error, linkedToTimeline } so the client can show a contextual
 * success message.
 */
export async function attachDocumentAction(
  tripId: string,
  tripSlug: string,
  doc: { id: string; title: string; category: DocumentCategory }
): Promise<{ error: string | null; linkedToTimeline: boolean; linkedItemTitle: string | null }> {
  const { error } = await attachDocumentToTrip(tripId, doc.id);
  if (error) return { error, linkedToTimeline: false, linkedItemTitle: null };

  // Confidence-scored auto-link — category + keyword + date + title overlap.
  // Returns the matched item's title so the UI can show a specific message.
  // Non-fatal: a score below threshold leaves the document attached but unlinked.
  const { matched, linkedItemTitle } = await autoLinkDocumentToTimeline(
    tripId, doc.id, doc.category, doc.title
  );

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null, linkedToTimeline: matched, linkedItemTitle };
}

/**
 * Uploads a new file to Supabase Storage, creates a documents row, links it
 * to the trip via trip_documents, and attempts to auto-link the document to
 * the most relevant existing timeline item.
 *
 * Steps:
 *   1. Validate inputs.
 *   2. Upload file → Storage path + signed URL.
 *   3. Insert into documents table.
 *   4. Insert into trip_documents (auto-attach to this trip).
 *   5. Heuristic auto-link: set document_id on the best matching existing
 *      timeline item (category-first, keyword-scored, date-aware).
 *   6. Revalidate the trip detail page.
 *
 * ── What it does NOT do ──────────────────────────────────────────────────────
 *   Does NOT auto-create new timeline items from the document. The creation
 *   path was removed because it relied on document-title matching for
 *   deduplication, causing duplicate actions when the user chose a label
 *   that didn't match the existing item title.
 *   If no confident timeline match exists, the document is stored and attached
 *   to the trip — the user can link it from the timeline edit form.
 *
 * ── Future upgrade ────────────────────────────────────────────────────────────
 *   When OCR / AI extraction is available, pass `extractedText` into
 *   `autoLinkDocumentToTimeline`. If confidence is high enough, also create
 *   a new timeline item from the extracted data and link to it.
 *
 * Returns { error, linkedToTimeline } so the client can show a contextual
 * success message.
 */
export async function uploadAndAttachDocumentAction(
  tripId: string,
  tripSlug: string,
  formData: FormData
): Promise<{ error: string | null; linkedToTimeline: boolean; linkedItemTitle: string | null }> {
  const file = formData.get("file") as File | null;
  // The form field is named "name" (HTML convention) but maps to `title` in the DB.
  const title = (formData.get("name") as string | null)?.trim();
  const category = (formData.get("category") as DocumentCategory | null) ?? "other";

  if (!file || file.size === 0) return { error: "Please select a file.", linkedToTimeline: false, linkedItemTitle: null };
  if (!title) return { error: "Please enter a document title.", linkedToTimeline: false, linkedItemTitle: null };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", linkedToTimeline: false, linkedItemTitle: null };

  // 1 — Upload to the bucket that matches the document category
  const { path, bucket, signedUrl, error: storageError } = await uploadToStorage(file, tripId, category);
  if (storageError) return { error: `Upload failed: ${storageError}`, linkedToTimeline: false, linkedItemTitle: null };

  // 2 — Insert documents row (use same supabase client so session/JWT is available for RLS)
  const { document, error: insertError } = await insertDocument(
    {
      title,
      category,
      file_url: signedUrl,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      storage_path: path,
      storage_bucket: bucket,
    },
    { supabase }
  );
  if (insertError || !document) return { error: `Could not save document: ${insertError}`, linkedToTimeline: false, linkedItemTitle: null };

  // 3 — Attach to trip (document exists and belongs to user; trip_documents RLS allows)
  const { error: attachError } = await attachDocumentToTrip(tripId, document.id);
  if (attachError) return { error: `Uploaded but failed to attach: ${attachError}`, linkedToTimeline: false, linkedItemTitle: null };

  // 4 — Confidence-scored auto-link. Only links when score ≥ AUTO_LINK_THRESHOLD.
  // Passes the document title for the title-overlap bonus component.
  // Non-fatal: below-threshold docs are attached to the trip but left unlinked.
  const { matched, linkedItemTitle } = await autoLinkDocumentToTimeline(
    tripId, document.id, category, title
  );

  revalidatePath(`/trips/${tripSlug}`);
  return { error: null, linkedToTimeline: matched, linkedItemTitle };
}
