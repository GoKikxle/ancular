"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { deletePrefix, eventPrefix } from "@/lib/storage";
import type { EventKind, JoinMode } from "@/lib/events";
import {
  createPreviewEvent,
  deletePreviewEvent,
  getPreviewEvent,
  previewEnabled,
  updatePreviewEvent,
} from "@/lib/preview-events";
import { deletePreviewPhoto, deletePreviewPhotosForEvent } from "@/lib/preview-photos";

export type FormState = { error?: string; saved?: boolean } | undefined;

const KINDS: EventKind[] = ["wedding", "church", "party", "birthday", "corporate", "other"];

function readEventFields(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const hostName = String(form.get("host_name") ?? "").trim();
  const kindRaw = String(form.get("kind") ?? "other");
  const kind = (KINDS.includes(kindRaw as EventKind) ? kindRaw : "other") as EventKind;
  const eventDate = String(form.get("event_date") ?? "").trim() || null;
  const venue = String(form.get("venue") ?? "").trim() || null;
  const joinMode: JoinMode = form.get("join_mode") === "open" ? "open" : "approval";
  const retention = Math.min(365, Math.max(1, Number(form.get("face_retention_days") ?? 30) || 30));
  return { name, hostName, kind, eventDate, venue, joinMode, retention };
}

export async function createEvent(_: FormState, form: FormData): Promise<FormState> {
  const f = readEventFields(form);
  if (f.name.length < 2) return { error: "Give the event a name, for example “Tolu & Femi’s wedding”." };
  if (form.get("guests_told") !== "on") {
    return { error: "Confirm that guests will be told photos are shared with face matching." };
  }

  const { supabase, user } = await getUser();
  if (!user) {
    if (!previewEnabled()) return { error: "Sign in again to create an event." };
    const event = await createPreviewEvent(f);
    redirect(`/events/${event.id}?tab=photos`);
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      owner_id: user.id,
      name: f.name,
      host_name: f.hostName || null,
      kind: f.kind,
      event_date: f.eventDate,
      venue: f.venue,
      join_mode: f.joinMode,
      face_retention_days: f.retention,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create the event. Try again." };
  redirect(`/events/${data.id}?tab=photos`);
}

export async function updateEvent(eventId: string, _: FormState, form: FormData): Promise<FormState> {
  const f = readEventFields(form);
  if (f.name.length < 2) return { error: "The event needs a name." };

  const { supabase, user } = await getUser();
  if (!user) {
    if (!previewEnabled()) return { error: "Sign in again to save this event." };
    const updated = await updatePreviewEvent(eventId, f);
    if (!updated) return { error: "This event isn't on this computer anymore." };
    revalidatePath(`/events/${eventId}`);
    return { saved: true };
  }

  const { error } = await supabase
    .from("events")
    .update({
      name: f.name,
      host_name: f.hostName || null,
      kind: f.kind,
      event_date: f.eventDate,
      venue: f.venue,
      join_mode: f.joinMode,
      face_retention_days: f.retention,
    })
    .eq("id", eventId);

  if (error) return { error: error.message };
  revalidatePath(`/events/${eventId}`);
  return { saved: true };
}

export async function decideGuest(eventId: string, userId: string, decision: "approved" | "declined") {
  const { supabase } = await getUser();
  await supabase
    .from("event_members")
    .update({ status: decision, decided_at: new Date().toISOString() })
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .eq("role", "guest");
  revalidatePath(`/events/${eventId}`);
}

export async function approveAllPending(eventId: string) {
  const { supabase } = await getUser();
  await supabase
    .from("event_members")
    .update({ status: "approved", decided_at: new Date().toISOString() })
    .eq("event_id", eventId)
    .eq("status", "pending")
    .eq("role", "guest");
  revalidatePath(`/events/${eventId}`);
}

export async function removeGuest(eventId: string, userId: string) {
  const { supabase } = await getUser();
  await supabase.from("event_members").delete().eq("event_id", eventId).eq("user_id", userId).eq("role", "guest");
  revalidatePath(`/events/${eventId}`);
}

export async function deleteEvent(eventId: string, _: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await getUser();
  const preview = !user && previewEnabled() ? await getPreviewEvent(eventId) : null;
  const { data: remote } = user
    ? await supabase.from("events").select("id, name, owner_id").eq("id", eventId).single()
    : { data: null };
  const event = preview ?? remote;
  if (!event || (user && event.owner_id !== user.id) || (!user && !preview)) {
    return { error: "Only the person who created the event can delete it." };
  }
  if (String(form.get("confirm_name") ?? "").trim() !== event.name) {
    return { error: "Type the event name exactly to confirm." };
  }

  if (preview) {
    await deletePreviewPhotosForEvent(eventId);
    await deletePreviewEvent(eventId);
    redirect("/dashboard");
  }

  // Photos first (storage), then the database rows. Face codes and matches cascade.
  try {
    await deletePrefix(eventPrefix(eventId));
  } catch (err) {
    return { error: `Couldn't delete the photo files: ${err instanceof Error ? err.message : "unknown error"}` };
  }
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function deletePhoto(eventId: string, photoId: string) {
  const { supabase, user } = await getUser();
  if (!user && previewEnabled()) {
    await deletePreviewPhoto(eventId, photoId);
    revalidatePath(`/events/${eventId}`);
    return;
  }
  const { error } = await supabase.from("photos").delete().eq("id", photoId).eq("event_id", eventId);
  if (!error) {
    await deletePrefix(`${eventPrefix(eventId)}${photoId}/`).catch(() => undefined);
  }
  revalidatePath(`/events/${eventId}`);
}
