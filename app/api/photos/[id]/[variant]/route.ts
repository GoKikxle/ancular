import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { VARIANTS, photoKey, signDownload, type Variant } from "@/lib/storage";

/**
 * View or download a photo. Access is decided by row level security:
 * hosts can open any photo in their event, guests only photos they matched.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; variant: string }> }) {
  const { id, variant } = await params;
  if (!VARIANTS.includes(variant as Variant)) {
    return NextResponse.json({ error: "Unknown size" }, { status: 400 });
  }

  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in to view photos" }, { status: 401 });

  const { data: photo } = await supabase
    .from("photos")
    .select("id, event_id, original_name, events(name)")
    .eq("id", id)
    .maybeSingle();

  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  const download = new URL(request.url).searchParams.has("download");
  const eventName = (photo.events as unknown as { name: string } | null)?.name ?? "event";
  const filename = download
    ? `${eventName.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "ancular"}-${id.slice(0, 6)}.jpg`
    : undefined;

  const url = await signDownload(photoKey(photo.event_id, photo.id, variant as Variant), filename);
  const res = NextResponse.redirect(url, 302);
  res.headers.set("Cache-Control", "private, max-age=300");
  return res;
}
