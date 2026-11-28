import { NextResponse, type NextRequest } from "next/server";
import { checkOptOutToken } from "@/lib/notify-guests";
import { createAdminClient } from "@/lib/supabase/server";

async function optOut(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const e = p.get("e") ?? "";
  const u = p.get("u") ?? "";
  const t = p.get("t") ?? "";
  if (!e || !u || !t || !checkOptOutToken(e, u, t)) return false;
  await createAdminClient().from("event_members").update({ email_opt_out: true }).eq("event_id", e).eq("user_id", u);
  return true;
}

const page = (msg: string) =>
  new NextResponse(
    `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ancular</title><body style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;color:#0f0d14"><h1 style="font-size:24px">${msg}</h1><p style="color:#4a4752">You can still open your event link any time.</p><p><a href="/" style="color:#0f0d14">Ancular</a></p></body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

export async function GET(req: NextRequest) {
  return page((await optOut(req)) ? "You won't get more emails about this event." : "That link didn't work.");
}

/** One-click unsubscribe from mail apps (RFC 8058). */
export async function POST(req: NextRequest) {
  return new NextResponse(null, { status: (await optOut(req)) ? 200 : 400 });
}
