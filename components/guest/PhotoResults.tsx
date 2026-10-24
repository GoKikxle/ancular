"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Match } from "./GuestFinder";

type Props = {
  eventName: string;
  matches: Match[];
  onChange: (m: Match[]) => void;
  onSearchAgain: () => void;
  onWithdraw: () => Promise<void>;
};

export function PhotoResults({ eventName, matches, onChange, onSearchAgain, onWithdraw }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const yours = matches.filter((m) => m.confidence === "sure" || m.confirmed);
  const maybe = matches.filter((m) => m.confidence === "maybe" && !m.confirmed);

  async function answer(photoId: string, isMe: boolean) {
    await createClient()
      .from("photo_matches")
      .update(isMe ? { confirmed: true } : { rejected: true })
      .eq("photo_id", photoId);
    onChange(
      isMe
        ? matches.map((m) => (m.photo_id === photoId ? { ...m, confirmed: true } : m))
        : matches.filter((m) => m.photo_id !== photoId)
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-[2.2rem] text-indigo">
            {yours.length === 0 ? "No photos found yet" : `${yours.length} ${yours.length === 1 ? "photo" : "photos"} of you`}
          </h2>
          <p className="mt-1 text-ink-muted">
            {yours.length === 0
              ? "The host may still be uploading. Check back later, or try a clearer selfie."
              : "Tap a photo to see it full size and save it."}
          </p>
        </div>
        <button type="button" className="btn btn-quiet btn-sm" onClick={onSearchAgain}>
          Search again
        </button>
      </div>

      {yours.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {yours.map((m) => (
            <li key={m.photo_id}>
              <button
                type="button"
                onClick={() => setOpen(m.photo_id)}
                className="block aspect-square w-full overflow-hidden rounded-xl bg-indigo-soft shadow-[0_0_0_2px_var(--gold)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/photos/${m.photo_id}/thumb`} alt="A photo you're in" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {maybe.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xl font-bold">Is this you?</h3>
          <p className="mt-1 text-ink-muted">We&apos;re not sure about these. Tell us and we&apos;ll sort them.</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {maybe.map((m) => (
              <li key={m.photo_id} className="overflow-hidden rounded-xl bg-paper shadow-[0_0_0_1.5px_var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/photos/${m.photo_id}/thumb`} alt="A photo that might include you" loading="lazy" className="aspect-square w-full object-cover" />
                <div className="grid grid-cols-2 gap-px bg-line">
                  <button type="button" className="bg-paper py-2.5 text-sm font-semibold text-ink-muted" onClick={() => answer(m.photo_id, false)}>
                    Not me
                  </button>
                  <button type="button" className="bg-paper py-2.5 text-sm font-semibold text-indigo" onClick={() => answer(m.photo_id, true)}>
                    That&apos;s me
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-16 border-t border-line pt-6">
        {!confirmWithdraw ? (
          <button type="button" className="text-sm font-semibold text-ink-muted underline underline-offset-4" onClick={() => setConfirmWithdraw(true)}>
            Delete my face data for this event
          </button>
        ) : (
          <div className="rounded-2xl bg-danger-soft p-4">
            <p className="font-semibold">Delete your face data and results for this event?</p>
            <p className="mt-1 text-sm">Your list of photos here will be cleared. You can search again later if you agree again.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn btn-sm btn-quiet" onClick={() => setConfirmWithdraw(false)}>
                Keep it
              </button>
              <button type="button" className="btn btn-sm btn-danger" onClick={onWithdraw}>
                Delete
              </button>
            </div>
          </div>
        )}
      </section>

      {open && (
        <PhotoViewer
          eventName={eventName}
          photoId={open}
          ids={yours.map((m) => m.photo_id)}
          onNavigate={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

/** Accept only a direct storage URL, never our own login-only /api/photos address. */
function directPhotoUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.pathname.includes("/api/photos/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function photoFileName(eventName: string, photoId: string) {
  const slug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ancular";
  return `${slug}-${photoId.slice(0, 6)}.jpg`;
}

type SendMode =
  | { kind: "loading" }
  /** Phones: the photo itself goes through the share sheet. Nothing expires. */
  | { kind: "file"; file: File }
  /** Computers: WhatsApp only takes text from a web page, so a link that lasts a few days. */
  | { kind: "link"; href: string; days: number }
  | { kind: "none" };

async function prepareSend(photoId: string, eventName: string): Promise<SendMode> {
  if (typeof navigator.canShare === "function") {
    try {
      const response = await fetch(`/api/photos/${photoId}/preview`);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], photoFileName(eventName, photoId), { type: blob.type || "image/jpeg" });
        if (navigator.canShare({ files: [file] })) return { kind: "file", file };
      }
    } catch {
      /* fall through to a link */
    }
  }

  try {
    const response = await fetch(`/api/photos/${photoId}/preview?link`, { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { url?: unknown; expiresInDays?: unknown };
      const url = directPhotoUrl(data.url);
      const days = typeof data.expiresInDays === "number" ? Math.floor(data.expiresInDays) : 7;
      if (url) {
        const text = `A photo from ${eventName}, shared from Ancular. The link works for ${days} days: ${url}`;
        return { kind: "link", days, href: `https://wa.me/?text=${encodeURIComponent(text)}` };
      }
    }
  } catch {
    /* nothing else to try */
  }
  return { kind: "none" };
}

/** Send on WhatsApp + Save. Keyed by photo, so it starts fresh for each one. */
function SendPhoto({ photoId, eventName }: { photoId: string; eventName: string }) {
  const [mode, setMode] = useState<SendMode>({ kind: "loading" });
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    prepareSend(photoId, eventName).then((next) => {
      if (!cancelled) setMode(next);
    });
    return () => {
      cancelled = true;
    };
  }, [photoId, eventName]);

  async function shareFile(file: File) {
    setProblem(null);
    try {
      await navigator.share({ files: [file] });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setProblem("Sharing didn't open. Save the photo, then send it from WhatsApp.");
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-[calc(1rem+var(--safe-bottom))] pt-3">
      {mode.kind === "file" && (
        <button type="button" className="btn btn-gold w-full" onClick={() => shareFile(mode.file)}>
          Send on WhatsApp
        </button>
      )}
      {mode.kind === "link" && (
        <a href={mode.href} target="_blank" rel="noopener noreferrer" className="btn btn-gold w-full">
          Send on WhatsApp
        </a>
      )}
      {mode.kind === "loading" && (
        <button type="button" className="btn btn-gold w-full" disabled>
          Getting the photo ready…
        </button>
      )}

      {mode.kind === "file" && <p className="text-center text-sm text-white/70">Choose WhatsApp, or any app, from the list.</p>}
      {mode.kind === "link" && (
        <p className="text-center text-sm text-white/70">Sends a link to this photo that works for {mode.days} days.</p>
      )}
      {mode.kind === "none" && (
        <p className="text-center text-sm text-white/80">Save the photo, then send it from WhatsApp.</p>
      )}
      {problem && (
        <p role="alert" className="text-center text-sm text-white">
          {problem}
        </p>
      )}

      <a href={`/api/photos/${photoId}/original?download`} className="btn btn-on-indigo w-full">
        Save full size
      </a>
    </div>
  );
}

function PhotoViewer({
  eventName,
  photoId,
  ids,
  onNavigate,
  onClose,
}: {
  eventName: string;
  photoId: string;
  ids: string[];
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const index = ids.indexOf(photoId);
  const prev = index > 0 ? ids[index - 1] : null;
  const next = index < ids.length - 1 ? ids[index + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prev) onNavigate(prev);
      if (e.key === "ArrowRight" && next) onNavigate(next);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [prev, next, onClose, onNavigate]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Photo" className="fixed inset-0 z-50 flex flex-col bg-indigo-deep">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm text-white/70">
          {index + 1} of {ids.length}
        </span>
        <button type="button" onClick={onClose} className="btn btn-sm btn-on-indigo">
          Close
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/photos/${photoId}/preview`} alt="A photo you're in" className="max-h-full max-w-full rounded-lg object-contain" />
        {prev && (
          <button type="button" onClick={() => onNavigate(prev)} aria-label="Previous photo" className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white">
            ‹
          </button>
        )}
        {next && (
          <button type="button" onClick={() => onNavigate(next)} aria-label="Next photo" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white">
            ›
          </button>
        )}
      </div>
      <SendPhoto key={photoId} photoId={photoId} eventName={eventName} />
    </div>
  );
}
