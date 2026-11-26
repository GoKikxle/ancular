"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";

/**
 * A guest takes an event off their list: their face data for it is deleted,
 * their matches are cleared and they leave the event. Their photos stay with the host.
 */
export async function leaveEvent(eventId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Sign in again to do that." };
  await supabase.rpc("withdraw_face_consent", { p_event: eventId });
  await supabase
    .from("photo_matches")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);
  const { error } = await supabase
    .from("event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("role", "guest");
  if (error) return { error: "Couldn't remove this event. Try again." };
  revalidatePath("/dashboard");
  revalidatePath("/home");
  return {};
}
