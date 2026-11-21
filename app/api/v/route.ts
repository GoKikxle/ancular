import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Anonymous page-view counter for the owner dashboard.
 * Stores only the page (ids blanked out), the referring site, the country Vercel
 * reports, and whether the view started a visit (came from another site or none).
 * No cookies, no IP address, nothing that identifies the visitor.
 */

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|headless|lighthouse/i;
const OWN_HOSTS = new Set(["ancular.com", "www.ancular.com", "localhost"]);

function cleanPath(raw: unknown) {
  if (typeof raw !== "string" || !raw.startsWith("/")) return null;
  return raw
    .split("?")[0]
    .replace(/\/e\/[^/]+/, "/e/[invite]")
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "[id]")
    .slice(0, 200);
}

function hostOf(raw: unknown) {
  if (typeof raw !== "string" || !raw) return null;
  try {
    return new URL(raw).hostname.replace(/^www\./, "").slice(0, 120);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (BOTS.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  let body: { p?: unknown; r?: unknown } = {};
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const path = cleanPath(body.p);
  if (!path || path.startsWith("/admin") || path.startsWith("/api")) return new NextResponse(null, { status: 204 });

  const ref = hostOf(body.r);
  const own = ref !== null && (OWN_HOSTS.has(ref) || ref.endsWith(".vercel.app"));
  const country = (req.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase() || null;

  try {
    await createAdminClient()
      .from("page_views")
      .insert({ path, referrer_host: own ? null : ref, country, is_entry: !own });
  } catch {
    // Counting must never break the site.
  }
  return new NextResponse(null, { status: 204 });
}
