import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getPreviewEvent, previewEnabled } from "@/lib/preview-events";
import { createPreviewPhoto } from "@/lib/preview-photos";
import { VARIANTS, photoKey, signUpload } from "@/lib/storage";
import { plainError } from "@/lib/errors";
import { capBlock, formatAllowance, photoFileError, type StorageUsage } from "@/lib/limits";
import { billingEnabled } from "@/lib/billing";
import { planLabel, readEventAllowance } from "@/lib/allowance";

/**
 * Start uploading one photo: creates the photo record (hosts only, enforced by RLS)
 * and returns short-lived upload URLs for the original, preview and thumbnail.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const { supabase, user } = await getUser();

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    width?: number;
    height?: number;
    bytes?: number;
    originalType?: string;
  };

  if (body.bytes) {
    const fileError = photoFileError(body.bytes);
    if (fileError) return NextResponse.json({ error: fileError }, { status: 413 });
  }

  if (!user) {
    if (!previewEnabled() || !(await getPreviewEvent(eventId))) {
      return NextResponse.json({ error: "Sign in again to upload." }, { status: 401 });
    }
    const photo = await createPreviewPhoto({
      eventId,
      name: body.name?.slice(0, 200) ?? null,
      width: body.width ?? null,
      height: body.height ?? null,
    });
    const uploads = Object.fromEntries(
      VARIANTS.map((variant) => {
        const type = variant === "original" && body.originalType ? body.originalType : "image/jpeg";
        return [
          variant,
          {
            url: `/api/events/${eventId}/photos/${photo.id}/${variant}`,
            headers: { "Content-Type": type },
          },
        ] as const;
      })
    );
    return NextResponse.json({ photoId: photo.id, uploads, local: true });
  }

  if (billingEnabled()) {
    // Paid plans: each event has its own photo limit.
    const allowance = await readEventAllowance(supabase, eventId);
    if (allowance && allowance.used >= allowance.limit) {
      return NextResponse.json(
        {
          error:
            allowance.hostPlan === "pro"
              ? `This event has reached ${allowance.limit.toLocaleString("en-GB")} photos, the most for one event.`
              : `This event has reached its ${allowance.limit.toLocaleString("en-GB")} photo limit. Unlock it to add more.`,
          code: "event_limit",
        },
        { status: 403 }
      );
    }
  } else {
    // Beta: one cap across all of a host's events.
    const usage = await readHostUsage(supabase);
    const blocked = usage ? capBlock(usage, body.bytes ?? 0) : null;
    if (blocked) return NextResponse.json({ error: blocked.error }, { status: 403 });
  }

  const { data: photo, error } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      uploaded_by: user.id,
      original_name: body.name?.slice(0, 200) ?? null,
      width: body.width ?? null,
      height: body.height ?? null,
      bytes: body.bytes ?? null,
    })
    .select("id")
    .single();

  if (error || !photo) {
    const status = error?.code === "42501" ? 403 : 400;
    return NextResponse.json(
      {
        error:
          status === 403
            ? "Only hosts can add photos to this event."
            : plainError(error?.message, "The upload failed. Try again."),
      },
      { status }
    );
  }

  try {
    const uploads = Object.fromEntries(
      await Promise.all(
        VARIANTS.map(async (variant) => {
          const type = variant === "original" && body.originalType ? body.originalType : "image/jpeg";
          return [variant, await signUpload(photoKey(eventId, photo.id, variant), type)] as const;
        })
      )
    );
    return NextResponse.json({ photoId: photo.id, uploads });
  } catch {
    await supabase.from("photos").update({ status: "failed" }).eq("id", photo.id);
    return NextResponse.json(
      { error: "The upload failed. Try again." },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ allowance: null });
  if (billingEnabled()) {
    const a = await readEventAllowance(supabase, eventId);
    if (!a) return NextResponse.json({ allowance: null });
    const left = Math.max(0, a.limit - a.used);
    return NextResponse.json({
      allowance: `${planLabel(a)} · ${left.toLocaleString("en-GB")} of ${a.limit.toLocaleString("en-GB")} photos left`,
      plan: { ...a, canUpgrade: a.hostPlan !== "pro" },
    });
  }
  const usage = await readHostUsage(supabase);
  if (!usage) return NextResponse.json({ allowance: null });
  return NextResponse.json({ allowance: formatAllowance(usage) });
}

async function readHostUsage(supabase: Awaited<ReturnType<typeof getUser>>["supabase"]): Promise<StorageUsage | null> {
  const { data, error } = await supabase.rpc("host_storage_usage");
  if (error || !data) return null;
  const row = (Array.isArray(data) ? data[0] : data) as { photos?: number; bytes?: number } | undefined;
  if (!row) return null;
  return { photos: Number(row.photos ?? 0), bytes: Number(row.bytes ?? 0) };
}
