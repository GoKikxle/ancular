import { NextResponse } from "next/server";
import { previewEnabled } from "@/lib/preview-events";
import { getPreviewPhoto, updatePreviewPhoto } from "@/lib/preview-photos";

/** Mark a locally stored preview photo ready, or failed, after the files are written. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  if (!previewEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id: eventId, photoId } = await params;
  const photo = await getPreviewPhoto(photoId);
  if (!photo || photo.event_id !== eventId) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { status?: string; faceCount?: number };
  if (body.status === "failed") {
    await updatePreviewPhoto(photoId, { status: "failed" });
    return NextResponse.json({ ok: true });
  }

  const faceCount = Math.max(0, Math.min(500, Number(body.faceCount) || 0));
  await updatePreviewPhoto(photoId, { status: "ready", face_count: faceCount });
  return NextResponse.json({ ok: true });
}
