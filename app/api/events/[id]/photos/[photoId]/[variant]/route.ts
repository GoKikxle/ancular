import { NextResponse } from "next/server";
import { previewEnabled } from "@/lib/preview-events";
import { getPreviewPhoto, writePreviewFile } from "@/lib/preview-photos";
import { VARIANTS, type Variant } from "@/lib/storage";

const MAX_BYTES = 40 * 1024 * 1024;

/** Save one locally previewed photo file (original, preview, or thumbnail). */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string; photoId: string; variant: string }> }) {
  if (!previewEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id: eventId, photoId, variant } = await params;
  if (!VARIANTS.includes(variant as Variant)) {
    return NextResponse.json({ error: "Unknown size" }, { status: 400 });
  }

  const photo = await getPreviewPhoto(photoId);
  if (!photo || photo.event_id !== eventId) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (!body.byteLength) return NextResponse.json({ error: "Empty photo" }, { status: 400 });
  if (body.byteLength > MAX_BYTES) return NextResponse.json({ error: "Photos must be under 40 MB." }, { status: 413 });

  await writePreviewFile(eventId, photoId, variant as Variant, body);
  return NextResponse.json({ ok: true });
}
