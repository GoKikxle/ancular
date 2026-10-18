"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectAllFaces, loadFaceApi, toVectorLiteral } from "@/lib/face";
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
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}

export function PhotoUploader({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [modelState, setModelState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [dragging, setDragging] = useState(false);
  const running = useRef(0);
  const queue = useRef<Item[]>([]);

  const busy = items.some((i) => i.state === "waiting" || i.state === "working");
  const done = items.filter((i) => i.state === "done").length;
  const failed = items.filter((i) => i.state === "failed").length;
  const facesFound = items.reduce((n, i) => n + (i.faces ?? 0), 0);

  // Warn before closing the tab mid-upload.
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
        const faces = await detectAllFaces(detectCanvas);
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

        if (faces.length) {
          const { error } = await createClient().from("faces").insert(
            faces.map((f) => ({
              event_id: eventId,
              photo_id: photoId,
              embedding: toVectorLiteral(f.embedding),
              box: f.box,
            }))
          );
          if (error) throw new Error(error.message);
        }
        await createClient()
          .from("photos")
          .update({ status: "ready", face_count: faces.length, indexed_at: new Date().toISOString() })
          .eq("id", photoId);

        update(item.id, { state: "done", faces: faces.length });
      } catch (err) {
        if (photoId) await createClient().from("photos").update({ status: "failed" }).eq("id", photoId);
        update(item.id, {
          state: "failed",
          error:
            err instanceof Error && /decode|source image/i.test(err.message)
              ? "This file type can't be read. Export it as JPEG and try again."
              : err instanceof Error
                ? err.message
                : "Upload failed",
        });
      }
    },
    [eventId]
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
        await loadFaceApi("host");
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-indigo bg-indigo-soft" : "border-line bg-paper hover:border-indigo"
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
        <span className="text-lg font-bold text-indigo">Add photos</span>
        <span className="mt-1 text-ink-muted">Drop JPEGs here or tap to choose. You can add hundreds at once.</span>
      </label>

      {modelState === "loading" && (
        <p className="mt-4 text-sm text-ink-muted">Getting the face finder ready. This downloads once (about 12 MB).</p>
      )}

      {total > 0 && (
        <div className="mt-6 rounded-2xl bg-paper p-5 shadow-[0_0_0_1.5px_var(--line)]" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">
              {busy ? `Uploading: ${done + failed} of ${total} done` : `${done} of ${total} uploaded`}
            </p>
            <p className="text-sm text-ink-muted">{facesFound} faces found</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-indigo-soft">
            <div className="h-full rounded-full bg-indigo transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          {busy && <p className="mt-3 text-sm text-ink-muted">Keep this page open until the upload finishes.</p>}
          {failed > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-danger">{failed} didn&apos;t upload</p>
              <ul className="mt-1 max-h-32 space-y-1 overflow-auto text-sm text-ink-muted">
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
