"use client";

import { useState, useSyncExternalStore } from "react";
import { zipSync } from "fflate";

/**
 * Save every photo in one go.
 * Phones: fetch phone-sized copies, then a second tap opens the share sheet with all of them
 *   ("Save Images" on iPhone, "Save to device" or Google Photos on Android). The second tap is
 *   needed because phones only open the share sheet straight after a tap.
 * Computers: fetch the full-size files and download one zip.
 */

type Mode = "share" | "zip";
type State =
  | { step: "idle" }
  | { step: "fetching"; done: number }
  | { step: "ready"; files: File[] }
  | { step: "saved" }
  | { step: "error"; message: string };

const noSubscribe = () => () => undefined;

function detectMode(): Mode {
  try {
    const probe = new File([new Uint8Array(1)], "probe.jpg", { type: "image/jpeg" });
    return typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }) ? "share" : "zip";
  } catch {
    return "zip";
  }
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ancular";
}

async function fetchAll(ids: string[], size: "preview" | "original", onProgress: (done: number) => void) {
  const out: { id: string; blob: Blob }[] = new Array(ids.length);
  let done = 0;
  let next = 0;
  async function worker() {
    while (next < ids.length) {
      const i = next++;
      const response = await fetch(`/api/photos/${ids[i]}/${size}`);
      if (!response.ok) throw new Error("fetch");
      out[i] = { id: ids[i], blob: await response.blob() };
      onProgress(++done);
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, ids.length) }, worker));
  return out;
}

export function SaveAll({ photoIds, eventName }: { photoIds: string[]; eventName: string }) {
  const mode = useSyncExternalStore(noSubscribe, detectMode, () => "zip" as Mode);
  const [state, setState] = useState<State>({ step: "idle" });
  const total = photoIds.length;
  const slug = slugify(eventName);

  async function prepare() {
    setState({ step: "fetching", done: 0 });
    try {
      if (mode === "share") {
        const items = await fetchAll(photoIds, "preview", (done) => setState({ step: "fetching", done }));
        const files = items.map(
          ({ id, blob }, i) => new File([blob], `${slug}-${String(i + 1).padStart(2, "0")}-${id.slice(0, 4)}.jpg`, { type: blob.type || "image/jpeg" })
        );
        if (!navigator.canShare({ files })) {
          setState({ step: "error", message: "Your phone can't take them all at once. Open each photo to save it." });
          return;
        }
        setState({ step: "ready", files });
        return;
      }

      const items = await fetchAll(photoIds, "original", (done) => setState({ step: "fetching", done }));
      const entries: Record<string, Uint8Array> = {};
      for (const [i, { id, blob }] of items.entries()) {
        entries[`${slug}-${String(i + 1).padStart(2, "0")}-${id.slice(0, 4)}.jpg`] = new Uint8Array(await blob.arrayBuffer());
      }
      // Photos are already compressed; store them as they are.
      const zipped = zipSync(entries, { level: 0 });
      const url = URL.createObjectURL(new Blob([zipped as BlobPart], { type: "application/zip" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-photos.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setState({ step: "saved" });
    } catch {
      setState({ step: "error", message: "Some photos didn't come through. Check your connection and try again." });
    }
  }

  async function share(files: File[]) {
    try {
      await navigator.share({ files });
      setState({ step: "saved" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({ step: "error", message: "Sharing didn't open. Open each photo to save it." });
    }
  }

  const label =
    mode === "share" ? `Save all ${total} to your phone` : `Download all ${total}`;

  return (
    <div className="flex flex-col gap-2 md:items-end">
      {state.step === "ready" ? (
        <button type="button" className="btn btn-primary btn-lg w-full md:w-auto" onClick={() => share(state.files)}>
          Save {total} photos now
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-lg w-full md:w-auto"
          onClick={prepare}
          disabled={state.step === "fetching"}
          aria-live="polite"
        >
          {state.step === "fetching" ? `Getting photos ready… ${state.done} of ${total}` : state.step === "saved" ? "Saved. Save again" : label}
        </button>
      )}
      <p className="t-meta md:text-right" aria-live="polite">
        {state.step === "error"
          ? state.message
          : state.step === "ready"
            ? "Ready. Choose Save Images, or any app."
            : mode === "share"
              ? "Phone-sized copies. Open a photo to save it at full size."
              : "Full-size photos in one zip file."}
      </p>
    </div>
  );
}
