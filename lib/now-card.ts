/**
 * Now Card — logic for "what to do right now" from timeline items.
 *
 * Uses timeline_items: title, event_date, time, document_id.
 * - Current: event within next 2 hours
 * - Next: first upcoming event (when none is current)
 */

import { createClient } from "@/lib/supabase/server";
import type { DbTimelineItem } from "@/lib/timeline-items";

export type NowItemView = {
  title: string;
  time: string;
  eventDate: string | null;
  label: "Now" | "Next";
  documentId: string | null;
  fileUrl: string | null;
  tripSlug: string;
};

function toLocalDateTime(eventDate: string, time: string): Date {
  const [y, mo, d] = eventDate.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}

/** True if the item's start is within the next 2 hours from now. */
function isWithinNext2Hours(item: Pick<DbTimelineItem, "event_date" | "time">, now: Date): boolean {
  if (!item.event_date) return false;
  const start = toLocalDateTime(item.event_date, item.time);
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return start >= now && start <= twoHoursFromNow;
}

/** True if the item's start is in the future. */
function isUpcoming(item: Pick<DbTimelineItem, "event_date" | "time">, now: Date): boolean {
  if (!item.event_date) return false;
  const start = toLocalDateTime(item.event_date, item.time);
  return start > now;
}

/**
 * Fetches the item to show on the Now Card.
 * - If any event is within the next 2 hours → show as "Now"
 * - Otherwise → show next upcoming event as "Next"
 * Returns null when there are no upcoming items.
 */
export async function getUpcomingNowItem(): Promise<NowItemView | null> {
  const supabase = await createClient();
  const now = new Date();

  const { data: trips } = await supabase.from("trips").select("id, slug").order("created_at", { ascending: false });
  if (!trips?.length) return null;

  const tripIds = trips.map((t) => t.id);
  const slugById = new Map(trips.map((t) => [t.id, t.slug]));

  const { data: items } = await supabase
    .from("timeline_items")
    .select("id, trip_id, title, event_date, time, document_id")
    .in("trip_id", tripIds)
    .not("event_date", "is", null)
    .order("event_date", { ascending: true })
    .order("time", { ascending: true });

  const rows = (items ?? []) as Array<
    Pick<DbTimelineItem, "id" | "trip_id" | "title" | "event_date" | "time" | "document_id">
  >;

  const current = rows.find((r) => r.event_date && isWithinNext2Hours(r, now));
  const next = current ?? rows.find((r) => r.event_date && isUpcoming(r, now));

  if (!next?.event_date) return null;

  const tripSlug = slugById.get(next.trip_id) ?? "";
  const documentId = next.document_id ?? null;

  let fileUrl: string | null = null;
  if (documentId) {
    const { data: doc } = await supabase.from("documents").select("file_url").eq("id", documentId).single();
    fileUrl = (doc as { file_url: string | null } | null)?.file_url ?? null;
  }

  return {
    title: next.title,
    time: next.time,
    eventDate: next.event_date ?? null,
    label: current ? "Now" : "Next",
    documentId,
    fileUrl,
    tripSlug,
  };
}
