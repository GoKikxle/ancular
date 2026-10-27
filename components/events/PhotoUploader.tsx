"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { plainError } from "@/lib/errors";
import { detectAllFaces, faceColumn, preloadFaces, toVectorLiteral, type FaceModel } from "@/lib/face";
import { DETECT_MAX, PREVIEW_MAX, THUMB_MAX, canvasToJpeg, drawScaled, loadBitmap } from "@/lib/image";

type Item = {
  id: string;
  file: File;
  state: "waiting" | "working" | "done" | "failed";
  faces?: number;
  error?: string;
};

type UploadTarget = { url: string; headers: Record<string, string> };

const CONCURRENCY = 2;

async function put(target: UploadTarget, body: Blob) {
  const res = await fetch(target.url, { method: "PUT", headers: target.headers, body });
  if (!res.ok) throw new Error("Upload failed");
}

export function PhotoUploader({ eventId, faceModel = "v1" }: { eventId: string; faceModel?: FaceModel }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [modelState, setModelState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [dragging, setDragging] = useState(false);
  const [allowance, setAllowance] = useState<string | null>(null);
  const running = useRef(0);
  const queue = useRef<Item[]>([]);

  const busy = items.some((i) => i.state === "waiting" || i.state === "working");
  const done = items.filter((i) => i.state === "done").length;
  const failed = items.filter((i) => i.state === "failed").length;
  const facesFound = items.reduce((n, i) => n + (i.faces ?? 0), 0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events/${eventId}/photos`)
      .then((res) => res.json())
      .then((data: { allowance?: string | null }) => {
        if (!cancelled && data.allowance) setAllowance(data.allowance);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const update = (id: string, patch: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const processOne = useCallback(
    async (item: Item) => {
      update(item.id, { state: "working" });
      let photoId: string | null = null;
      try {
        const bitmap = await loadBitmap(item.file);
        const detectCanvas = drawScaled(bitmap, DETECT_MAX);
        const faces = await detectAllFaces(detectCanvas, faceModel);
        const preview = await canvasToJpeg(drawScaled(bitmap, PREVIEW_MAX), 0.82);
        const thumb = await canvasToJpeg(drawScaled(bitmap, THUMB_MAX), 0.78);
        const { width, height } = bitmap;
        bitmap.close();

        const res = await fetch(`/api/events/${eventId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.file.name,
            width,
            height,
            bytes: item.file.size,
            originalType: item.file.type || "image/jpeg",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        photoId = data.photoId as string;
        const uploads = data.uploads as Record<"original" | "preview" | "thumb", UploadTarget>;

        await Promise.all([put(uploads.thumb, thumb), put(uploads.preview, preview)]);
        await put(uploads.original, item.file);

        if (data.local) {
          const done = await fetch(`/api/events/${eventId}/photos/${photoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ faceCount: faces.length }),
          });
          const doneData = await done.json().catch(() => ({}));
          if (!done.ok) throw new Error(doneData.error ?? "Upload failed");
          update(item.id, { state: "done", faces: faces.length });
          return;
        }

        if (faces.length) {
          const { error } = await createClient().from("faces").insert(
            faces.map((f) => ({
              event_id: eventId,
              photo_id: photoId,
              [faceColumn(faceModel)]: toVectorLiteral(f.embedding),
              box: f.box,
            }))
          );
          if (error) throw new Error(plainError(error.message, "The upload failed. Try again."));
        }
        await createClient()
          .from("photos")
          .update({ status: "ready", face_count: faces.length, indexed_at: new Date().toISOString() })
          .eq("id", photoId);

        update(item.id, { state: "done", faces: faces.length });
      } catch (err) {
        if (photoId) {
          const failed = await fetch(`/api/events/${eventId}/photos/${photoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "failed" }),
          }).catch(() => null);
          if (!failed?.ok) {
            await createClient()
              .from("photos")
              .update({ status: "failed" })
              .eq("id", photoId)
              .then(() => undefined, () => undefined);
          }
        }
        update(item.id, {
          state: "failed",
          error:
            err instanceof Error && /decode|source image/i.test(err.message)
              ? "This file type can't be read. Export it as JPEG and try again."
              : plainError(err instanceof Error ? err.message : null, "The upload failed. Try again."),
        });
      }
    },
    [eventId, faceModel]
  );

  const pumpRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    pumpRef.current = () => {
      while (running.current < CONCURRENCY && queue.current.length) {
        const next = queue.current.shift()!;
        running.current++;
        processOne(next).finally(() => {
          running.current--;
          if (queue.current.length) pumpRef.current();
          else if (running.current === 0) router.refresh();
        });
      }
    };
  }, [processOne, router]);
  const pump = () => pumpRef.current();

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(f.name));
    if (!files.length) return;
    const newItems: Item[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      state: "waiting",
    }));
    setItems((list) => [...list, ...newItems]);

    if (modelState !== "ready") {
      setModelState("loading");
      try {
        await preloadFaces(faceModel, "host");
        setModelState("ready");
      } catch {
        setModelState("error");
        setItems((list) =>
          list.map((i) =>
            i.state === "waiting" ? { ...i, state: "failed", error: "Face finder didn't load. Check your connection." } : i
          )
        );
        return;
      }
    }
    queue.current.push(...newItems);
    pump();
  }

  function retryFailed() {
    const retry = items.filter((i) => i.state === "failed");
    retry.forEach((i) => update(i.id, { state: "waiting", error: undefined }));
    queue.current.push(...retry);
    pump();
  }

  const total = items.length;
  const pct = total ? Math.round(((done + failed) / total) * 100) : 0;

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[4px] px-6 py-12 text-center transition-colors md:py-16 ${
          dragging ? "bg-[var(--fill-hover)] shadow-[inset_0_0_0_1.5px_var(--ink)]" : "bg-fill hover:bg-[var(--fill-hover)]"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="btn btn-primary btn-sm pointer-events-none">Add photos</span>
        <span className="t-item-sub mt-3">Drop JPEGs here or tap to choose. You can add hundreds at once.</span>
        {allowance && <span className="t-meta mt-1">{allowance}</span>}
      </label>

      {modelState === "loading" && (
        <p className="t-meta mt-3">Getting the face finder ready. This downloads once (about 12 MB).</p>
      )}

      {total > 0 && (
        <div className="mt-6 border-t border-hairline pt-5" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="t-item">
              {busy ? `Uploading: ${done + failed} of ${total} done` : `${done} of ${total} uploaded`}
            </p>
            <p className="t-meta">{facesFound} faces in these photos</p>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-fill">
            <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          {busy && <p className="t-meta mt-3">Keep this page open until the upload finishes.</p>}
          {failed > 0 && (
            <div className="mt-4">
              <p className="t-ui !text-danger">{failed} didn&apos;t upload</p>
              <ul className="t-meta mt-1 max-h-32 space-y-1 overflow-auto">
                {items
                  .filter((i) => i.state === "failed")
                  .slice(0, 20)
                  .map((i) => (
                    <li key={i.id}>
                      {i.file.name}: {i.error}
                    </li>
                  ))}
              </ul>
              {!busy && (
                <button type="button" className="btn btn-quiet btn-sm mt-3" onClick={retryFailed}>
                  Try those again
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
