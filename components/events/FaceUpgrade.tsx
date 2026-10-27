"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectAllFaces, preloadFaces, toVectorLiteral } from "@/lib/face";
import { DETECT_MAX, drawScaled, loadBitmap } from "@/lib/image";

type State =
  | { step: "idle" }
  | { step: "loading" }
  | { step: "scanning"; done: number; total: number }
  | { step: "finished"; photos: number }
  | { step: "error"; message: string };

/**
 * Move an older event to face model v2 (better with turned heads and side profiles).
 * Runs in the host's browser like uploads do: each photo is read again and its v2 face
 * codes are added next to the old ones, so guests can keep searching meanwhile. When
 * every photo is done the event switches to v2 and the old codes are deleted.
 * Safe to stop and restart: photos already scanned are skipped.
 */
export function FaceUpgrade({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ step: "idle" });
  const stopped = useRef(false);

  async function run() {
    stopped.current = false;
    setState({ step: "loading" });
    const supabase = createClient();
    try {
      await preloadFaces("v2", "host");
      const [{ data: photos, error: e1 }, { data: scanned, error: e2 }] = await Promise.all([
        supabase.from("photos").select("id").eq("event_id", eventId).eq("status", "ready"),
        supabase.from("faces").select("photo_id").eq("event_id", eventId).not("embedding_v2", "is", null),
      ]);
      if (e1 || e2) throw new Error("load");
      const done = new Set((scanned ?? []).map((r) => r.photo_id as string));
      const todo = (photos ?? []).map((p) => p.id as string).filter((id) => !done.has(id));
      const total = (photos ?? []).length;
      let count = total - todo.length;
      setState({ step: "scanning", done: count, total });

      for (const photoId of todo) {
        if (stopped.current) {
          setState({ step: "idle" });
          return;
        }
        const res = await fetch(`/api/photos/${photoId}/preview`);
        if (res.ok) {
          const bitmap = await loadBitmap(await res.blob());
          const canvas = drawScaled(bitmap, DETECT_MAX);
          bitmap.close();
          const faces = await detectAllFaces(canvas, "v2");
          if (faces.length) {
            const { error } = await supabase.from("faces").insert(
              faces.map((f) => ({
                event_id: eventId,
                photo_id: photoId,
                embedding_v2: toVectorLiteral(f.embedding),
                box: f.box,
              }))
            );
            if (error) throw new Error("save");
          }
          await supabase.from("photos").update({ face_count: faces.length }).eq("id", photoId);
        }
        count += 1;
        setState({ step: "scanning", done: count, total });
      }

      // Every photo has v2 codes: switch the event over, then remove the old codes.
      const { error: e3 } = await supabase.from("events").update({ face_model: "v2" }).eq("id", eventId);
      if (e3) throw new Error("switch");
      await supabase.from("faces").delete().eq("event_id", eventId).not("embedding", "is", null);
      setState({ step: "finished", photos: total });
      router.refresh();
    } catch {
      setState({ step: "error", message: "The re-scan stopped. Check your connection and press Continue." });
    }
  }

  const busy = state.step === "loading" || state.step === "scanning";
  const pct = state.step === "scanning" && state.total ? Math.round((state.done / state.total) * 100) : 0;

  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="t-title">Better matching</h2>
      {state.step === "finished" ? (
        <p className="t-item-sub mt-2">
          Done. All {state.photos.toLocaleString("en-GB")} photos now use the newer face model. Guests who search again
          will find more side-on photos.
        </p>
      ) : (
        <>
          <p className="t-item-sub mt-2 max-w-md">
            This event uses the older face model. Re-scan its photos with the newer one to find guests in side-on and
            turned-head photos. Guests can keep searching while it runs. Keep this page open; you can stop and carry on
            later.
          </p>
          {state.step === "scanning" && (
            <div className="mt-4 max-w-md" aria-live="polite">
              <p className="t-ui tabular-nums">
                {state.done.toLocaleString("en-GB")} of {state.total.toLocaleString("en-GB")} photos
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-fill">
                <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          {state.step === "error" && (
            <p role="alert" className="t-ui mt-4 max-w-md rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
              {state.message}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            {busy ? (
              <button type="button" className="btn btn-quiet btn-lg" onClick={() => (stopped.current = true)}>
                {state.step === "loading" ? "Getting ready…" : "Stop"}
              </button>
            ) : (
              <button type="button" className="btn btn-primary btn-lg" onClick={run}>
                {state.step === "error" ? "Continue" : "Re-scan photos"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
