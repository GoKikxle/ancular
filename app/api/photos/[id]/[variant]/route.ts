import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getPreviewEvent, previewEnabled } from "@/lib/preview-events";
import { getPreviewPhoto, readPreviewFile } from "@/lib/preview-photos";
import { SHARE_LINK_SECONDS, VARIANTS, photoKey, signDownload, type Variant } from "@/lib/storage";

/**
 * View or download a photo. Access is decided by row level security:
 * hosts can open any photo in their event, guests only photos they matched.
 * `?link` returns a storage URL for that photo as JSON, valid for 7 days, so a guest
 * can send it to someone who isn't signed in. It does not change who can request the link.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; variant: string }> }) {
  const { id, variant } = await params;
  if (!VARIANTS.includes(variant as Variant)) {
    return NextResponse.json({ error: "Unknown size" }, { status: 400 });
  }

  const wantLink = new URL(request.url).searchParams.has("link");
  const { supabase, user } = await getUser();
  if (!user && previewEnabled()) {
    if (wantLink) {
      return NextResponse.json(
        { error: "Couldn't make a link that opens without your login." },
        { status: 404, headers: { "Cache-Control": "private, no-store" } }
      );
    }
    const photo = await getPreviewPhoto(id);
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    const bytes = await readPreviewFile(photo.event_id, photo.id, variant as Variant);
    if (!bytes) return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    const event = await getPreviewEvent(photo.event_id);
    const download = new URL(request.url).searchParams.has("download");
    const headers = new Headers({
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=300",
    });
    if (download) {
      const eventName = event?.name ?? "event";
      const filename = `${eventName.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "ancular"}-${id.slice(0, 6)}.jpg`;
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    }
    return new NextResponse(new Uint8Array(bytes), { headers });
  }
  if (!user) return NextResponse.json({ error: "Sign in again to view photos." }, { status: 401 });

  const { data: photo } = await supabase
    .from("photos")
    .select("id, event_id, original_name, events(name)")
    .eq("id", id)
    .maybeSingle();

  if (!photo) return NextResponse.json({ error: "That photo isn't available." }, { status: 404 });

  const download = new URL(request.url).searchParams.has("download");
  const eventName = (photo.events as unknown as { name: string } | null)?.name ?? "event";
  const filename = download
    ? `${eventName.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "ancular"}-${id.slice(0, 6)}.jpg`
    : undefined;

  let url: string;
  try {
    url = wantLink
      ? await signDownload(photoKey(photo.event_id, photo.id, variant as Variant), undefined, SHARE_LINK_SECONDS)
      : await signDownload(photoKey(photo.event_id, photo.id, variant as Variant), filename);
  } catch {
    return NextResponse.json({ error: "That photo isn't available right now." }, { status: 500 });
  }
  if (wantLink) {
    return NextResponse.json(
      { url, expiresInDays: SHARE_LINK_SECONDS / 86400 },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }
  const res = NextResponse.redirect(url, 302);
  res.headers.set("Cache-Control", "private, max-age=300");
  return res;
}
