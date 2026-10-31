"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Match } from "./GuestFinder";
import { SaveAll } from "./SaveAll";
import { PhotoViewer } from "@/components/photos/PhotoViewer";
import { PhotoImg } from "@/components/photos/PhotoImg";
import { usePhotoUrls } from "@/components/photos/usePhotoUrls";

type Props = {
  eventName: string;
  matches: Match[];
  onChange: (m: Match[]) => void;
  onSearchAgain: () => void;
  onWithdraw: () => Promise<void>;
  /** Called after the guest says "yes, that's me", so the search can look for more angles. */
  onConfirmed?: () => void;
};

/**
 * The page every guest judges Ancular by. One job: get them their photos.
 * Order: how many photos, Save all, the photos, unsure ones, then "missing some?".
 */
export function PhotoResults({ eventName, matches, onChange, onSearchAgain, onWithdraw, onConfirmed }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  const yours = matches.filter((m) => m.confidence === "sure" || m.confirmed);
  const maybe = matches.filter((m) => m.confidence === "maybe" && !m.confirmed);
  const ids = yours.map((m) => m.photo_id);
  const links = usePhotoUrls(matches.map((m) => m.photo_id));

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
    if (isMe) onConfirmed?.();
  }

  return (
    <div>
      {yours.length > 0 && (
        <>
          <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
            <div>
              <h1 className="display">
                <span key={yours.length} className="count-in tabular-nums">{yours.length}</span>{" "}
                {yours.length === 1 ? "photo" : "photos"} of you
              </h1>
              <p className="t-lead t-muted mt-4">Only you can see these.</p>
            </div>
            <SaveAll photoIds={ids} eventName={eventName} />
          </header>

          <ul aria-label="Your photos" className="mt-8 columns-2 gap-2 md:mt-12 md:columns-3 md:gap-8 lg:columns-4">
            {yours.map((m, i) => (
              <li key={m.photo_id} className="rise-in mb-2 break-inside-avoid md:mb-8" style={{ ["--i" as string]: i }}>
                <button
                  type="button"
                  onClick={() => setOpen(m.photo_id)}
                  className="tile block w-full"
                  aria-label={`Open photo ${i + 1} of ${yours.length}`}
                >
                  <Photo thumb={links.src(m.photo_id, "thumb")} preview={links.src(m.photo_id, "preview")} alt="A photo you're in" />
                </button>
              </li>
            ))}
          </ul>

          {maybe.length > 0 && <UnsureRow maybe={maybe} onAnswer={answer} src={(id) => links.src(id, "thumb")} />}
        </>
      )}

      {yours.length === 0 && maybe.length > 0 && (
        <>
          <h1 className="display">We might have found you</h1>
          <p className="t-lead t-muted mt-4 max-w-md">
            We&apos;re not sure about {maybe.length === 1 ? "this one" : `these ${maybe.length}`}. Tell us which are you.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
            {maybe.map((m, i) => (
              <li key={m.photo_id} className="rise-in" style={{ ["--i" as string]: i }}>
                <UnsureCard photoId={m.photo_id} onAnswer={answer} src={links.src(m.photo_id, "preview")} large />
              </li>
            ))}
          </ul>
        </>
      )}

      {yours.length === 0 && maybe.length === 0 && (
        <>
          <h1 className="display">No photos of you yet</h1>
          <p className="t-lead t-muted mt-4">That usually means one of two things.</p>
          <dl className="mt-8 max-w-md border-t border-hairline">
            <div className="border-b border-hairline py-4">
              <dt className="t-item">The photos are still going up</dt>
              <dd className="t-item-sub mt-1">Hosts often upload over a few days. Open this link again later.</dd>
            </div>
            <div className="border-b border-hairline py-4">
              <dt className="t-item">The selfie was hard to read</dt>
              <dd className="t-item-sub mt-1">Try again facing a window, with just you in the picture.</dd>
            </div>
          </dl>
          <button type="button" className="btn btn-primary btn-lg mt-8" onClick={onSearchAgain}>
            Take another selfie
          </button>
        </>
      )}

      <PageFoot showRetry={yours.length > 0 || maybe.length > 0} onSearchAgain={onSearchAgain} onWithdraw={onWithdraw} />

      {open && (
        <PhotoViewer
          photoId={open}
          ids={ids}
          onNavigate={setOpen}
          onClose={() => setOpen(null)}
          src={(id) => links.url(id, "preview")}
          footer={(id) => <SendPhoto key={id} photoId={id} eventName={eventName} />}
        />
      )}
    </div>
  );
}

/** Thumbnail on phones, the larger preview on wide screens. Grey until it arrives. */
function Photo({ thumb, preview, alt }: { thumb: string | null; preview: string | null; alt: string }) {
  const [loaded, setLoaded] = useState<string | null>(null);
  const isLoaded = thumb !== null && loaded === thumb;
  if (!thumb || !preview) return <span className="media skeleton block aspect-[4/5]" />;
  return (
    <span className={`media block ${isLoaded ? "" : "skeleton aspect-[4/5]"}`}>
      <picture>
        <source media="(min-width: 768px)" srcSet={preview} />
        <img
          src={thumb}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(thumb)}
          onError={() => setLoaded(thumb)}
          ref={(el) => {
            if (el?.complete && el.naturalWidth > 0 && !isLoaded) requestAnimationFrame(() => setLoaded(thumb));
          }}
          data-loaded={isLoaded}
          className="photo-in block h-auto w-full"
        />
      </picture>
    </span>
  );
}

function UnsureRow({
  maybe,
  onAnswer,
  src,
}: {
  maybe: Match[];
  onAnswer: (id: string, isMe: boolean) => void;
  src: (id: string) => string | null;
}) {
  return (
    <section className="mt-16 border-t border-hairline pt-8 md:mt-24 md:pt-10">
      <h2 className="t-title">
        Is this you? <span className="text-ink-4">{maybe.length}</span>
      </h2>
      <p className="t-item-sub mt-2">We&apos;re not sure about these. Tap yes and they join your photos.</p>
      <ul className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        {maybe.map((m) => (
          <li key={m.photo_id} className="w-[44%] shrink-0 snap-start sm:w-56">
            <UnsureCard photoId={m.photo_id} onAnswer={onAnswer} src={src(m.photo_id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function UnsureCard({
  photoId,
  onAnswer,
  src,
  large = false,
}: {
  photoId: string;
  onAnswer: (id: string, isMe: boolean) => void;
  src: string | null;
  large?: boolean;
}) {
  // Play the fly-off first, then hand the answer up (which removes the card).
  const [leaving, setLeaving] = useState<"yes" | "no" | null>(null);
  function choose(isMe: boolean) {
    if (leaving) return;
    setLeaving(isMe ? "yes" : "no");
    setTimeout(() => onAnswer(photoId, isMe), 260);
  }
  return (
    <div className={leaving === "yes" ? "leave-yes" : leaving === "no" ? "leave-no" : ""}>
      <div className="media aspect-[4/5]">
        <PhotoImg src={src} alt="A photo that might include you" />
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="btn btn-sm btn-quiet flex-1" onClick={() => choose(false)}>
          {large ? "Not me" : "No"}
        </button>
        <button type="button" className="btn btn-sm btn-primary flex-1" onClick={() => choose(true)}>
          {large ? "Yes, that's me" : "Yes"}
        </button>
      </div>
    </div>
  );
}

function PageFoot({
  showRetry,
  onSearchAgain,
  onWithdraw,
}: {
  showRetry: boolean;
  onSearchAgain: () => void;
  onWithdraw: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <footer className="mt-16 flex flex-col gap-6 border-t border-hairline pt-8 md:mt-24 md:flex-row md:items-center md:justify-between">
      {showRetry ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="t-item">Missing some photos?</p>
          <button type="button" className="btn btn-sm btn-quiet" onClick={onSearchAgain}>
            Take another selfie
          </button>
        </div>
      ) : (
        <span />
      )}
      {!confirming ? (
        <button type="button" className="t-meta self-start underline underline-offset-4 hover:text-ink-2 md:self-auto" onClick={() => setConfirming(true)}>
          Delete my face data for this event
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <p className="t-ui mr-2">Delete your face data and results for this event?</p>
          <button type="button" className="btn btn-sm btn-quiet" onClick={() => setConfirming(false)}>
            Keep it
          </button>
          <button type="button" className="btn btn-sm btn-danger" onClick={onWithdraw}>
            Delete
          </button>
        </div>
      )}
    </footer>
  );
}

/* ---------- Sending one photo ---------- */

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

  const note =
    problem ??
    (mode.kind === "file"
      ? "Choose WhatsApp, or any app, from the list."
      : mode.kind === "link"
        ? `Sends a link to this photo that works for ${mode.days} days.`
        : mode.kind === "none"
          ? "Save the photo, then send it from WhatsApp."
          : " ");

  return (
    <div className="border-t border-hairline px-4 pb-[calc(16px+var(--safe-bottom))] pt-4">
      <div className="mx-auto flex max-w-md flex-col gap-2">
        <div className="flex gap-2">
          {mode.kind === "file" && (
            <button type="button" className="btn btn-primary btn-lg flex-1" onClick={() => shareFile(mode.file)}>
              Send on WhatsApp
            </button>
          )}
          {mode.kind === "link" && (
            <a href={mode.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg flex-1">
              Send on WhatsApp
            </a>
          )}
          {mode.kind === "loading" && (
            <button type="button" className="btn btn-primary btn-lg flex-1" disabled>
              Getting it ready…
            </button>
          )}
          <a href={`/api/photos/${photoId}/original?download`} className="btn btn-quiet btn-lg flex-1">
            Save full size
          </a>
        </div>
        <p role={problem ? "alert" : undefined} className="t-meta text-center">
          {note}
        </p>
      </div>
    </div>
  );
}
