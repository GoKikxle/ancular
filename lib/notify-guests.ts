import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { brandUrl, siteUrl } from "@/lib/events";
import { esc, sendBatch, type OutgoingEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/server";

function secret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev";
}

/** Token for the one-click "stop emails for this event" link. */
export function optOutToken(eventId: string, userId: string) {
  return createHmac("sha256", secret()).update(`optout:${eventId}:${userId}`).digest("base64url").slice(0, 32);
}

export function checkOptOutToken(eventId: string, userId: string, token: string) {
  const want = Buffer.from(optOutToken(eventId, userId));
  const got = Buffer.from(token);
  return want.length === got.length && timingSafeEqual(want, got);
}

function absolute(url: string | null) {
  if (!url) return null;
  return url.startsWith("/") ? `${siteUrl()}${url}` : url;
}

/**
 * Email every approved guest that the event's photos are ready. Runs once per event:
 * claims photos_notified_at first, so a double click or two triggers can't send twice.
 */
export async function notifyGuestsPhotosReady(eventId: string): Promise<{ sent: number; error?: string; already?: boolean }> {
  const admin = createAdminClient();

  const { data: ev } = await admin
    .from("events")
    .select("id, name, invite_code, owner_id, brand_cover_path, photos_live, photos_notified_at")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return { sent: 0, error: "Event not found." };
  if (ev.photos_notified_at) return { sent: 0, already: true };
  if (!ev.photos_live) return { sent: 0, error: "Photos are still held. Untick “Hold photos” first." };

  const { count } = await admin
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "ready");
  if (!count) return { sent: 0, error: "Upload some photos first." };

  // Claim the send.
  const { data: claimed } = await admin
    .from("events")
    .update({ photos_notified_at: new Date().toISOString() })
    .eq("id", eventId)
    .is("photos_notified_at", null)
    .select("id");
  if (!claimed?.length) return { sent: 0, already: true };

  const { data: people } = await admin.rpc("event_notify_recipients", { p_event: eventId });
  const rows = (people ?? []) as { user_id: string; email: string; display_name: string | null }[];
  if (rows.length === 0) return { sent: 0 };

  const { data: prof } = await admin.from("organisation_profiles").select("org_name").eq("user_id", ev.owner_id).maybeSingle();
  const from = prof?.org_name || null;
  const cover = absolute(brandUrl(ev.brand_cover_path));
  const link = `${siteUrl()}/e/${ev.invite_code}`;
  const subject = `Your photos from ${ev.name} are ready`;

  const emails: OutgoingEmail[] = rows.map((r) => {
    const stop = `${siteUrl()}/api/email-opt-out?e=${ev.id}&u=${r.user_id}&t=${optOutToken(ev.id, r.user_id)}`;
    const hi = r.display_name ? `Hi ${esc(r.display_name.split(" ")[0])},` : "Hi,";
    const html = `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f0d14">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:4px;overflow:hidden">
${cover ? `<tr><td><img src="${esc(cover)}" width="560" alt="${esc(ev.name)}" style="display:block;width:100%;height:auto;border:0"></td></tr>` : ""}
<tr><td style="padding:32px 32px 8px">
<p style="margin:0 0 16px;font-size:15px;line-height:1.5">${hi}</p>
<h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;font-weight:600;letter-spacing:-0.02em">Your photos from ${esc(ev.name)} are ready</h1>
<p style="margin:0 0 28px;font-size:15px;line-height:1.55;color:#4a4752">${from ? `${esc(from)} has` : "The host has"} added the photos. Take one selfie and you&rsquo;ll see only the photos you&rsquo;re in.</p>
<a href="${esc(link)}" style="display:inline-block;background:#0f0d14;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 22px;border-radius:4px">Find my photos</a>
</td></tr>
<tr><td style="padding:28px 32px 32px;font-size:12px;line-height:1.5;color:#8a8790">
You&rsquo;re getting this because you joined ${esc(ev.name)} on Ancular. <a href="${esc(stop)}" style="color:#8a8790">Stop emails for this event</a>.
</td></tr></table>
<p style="font-size:12px;color:#8a8790;margin:16px 0 0">Ancular · Private photo finding for events</p>
</td></tr></table></body></html>`;
    const text = `${hi.replace(/&#?\w+;/g, "")}

Your photos from ${ev.name} are ready. Take one selfie and you'll see only the photos you're in:
${link}

Stop emails for this event: ${stop}`;
    return {
      to: r.email,
      subject,
      html,
      text,
      headers: { "List-Unsubscribe": `<${stop}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    };
  });

  const res = await sendBatch(emails);
  if (res.error && res.sent === 0) {
    // Nothing went out: release the claim so the host can try again.
    await admin.from("events").update({ photos_notified_at: null }).eq("id", eventId);
  }
  return res;
}
