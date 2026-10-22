"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { PREVIEW_OWNER_ID, getPreviewEvent, getPreviewEventByInviteCode, previewEnabled } from "@/lib/preview-events";
import { joinPreviewGuest, previewGuestActive, setPreviewGuestConsent } from "@/lib/preview-guest";

export type JoinState = { error?: string } | undefined;

export async function joinEvent(code: string, _: JoinState, form: FormData): Promise<JoinState> {
  const { supabase, user: sessionUser } = await getUser();
  const user = sessionUser && !(previewEnabled() && sessionUser.id === PREVIEW_OWNER_ID) ? sessionUser : null;
  const name = String(form.get("display_name") ?? "").trim();
  if (name.length < 2) return { error: "Add your name so the host knows who you are." };

  if (!user) {
    if (!(await previewGuestActive())) return { error: "Sign in first." };

    // A leftover preview-guest cookie must not handle a live invite. Those join through join_event.
    let liveInvite = false;
    try {
      const { data, error } = await supabase.rpc("get_event_invite", { p_code: code });
      liveInvite = !error && Array.isArray(data) && data.length > 0;
    } catch {
      liveInvite = false;
    }
    if (liveInvite) return { error: "Sign in first." };

    const event = await getPreviewEventByInviteCode(code);
    if (!event || event.status !== "active") return { error: "This invite link isn't working." };
    await joinPreviewGuest(event.id, name);
    revalidatePath(`/e/${code}`);
    return;
  }

  const { error } = await supabase.rpc("join_event", { p_code: code, p_display_name: name });
  if (error) return { error: error.message };
  revalidatePath(`/e/${code}`);
}

export async function grantPreviewConsent(eventId: string): Promise<{ error?: string }> {
  if (!(await previewGuestActive())) return { error: "Sign in first." };
  const saved = await setPreviewGuestConsent(eventId, true);
  if (!saved) return { error: "Join this event before agreeing to face matching." };
  const event = await getPreviewEvent(eventId);
  if (event) revalidatePath(`/e/${event.invite_code}`);
  return {};
}

export async function withdrawPreviewConsent(eventId: string): Promise<{ error?: string }> {
  if (!(await previewGuestActive())) return { error: "Sign in first." };
  const saved = await setPreviewGuestConsent(eventId, false);
  if (!saved) return { error: "Join this event before agreeing to face matching." };
  const event = await getPreviewEvent(eventId);
  if (event) revalidatePath(`/e/${event.invite_code}`);
  return {};
}
