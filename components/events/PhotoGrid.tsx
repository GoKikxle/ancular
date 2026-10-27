"use client";

import { useRef, useState, useTransition } from "react";
import { deletePhoto, deletePhotos } from "@/app/(app)/events/actions";
import type { PhotoRow } from "@/lib/events";
import { PhotoViewer } from "@/components/photos/PhotoViewer";

function faces(n: number) {
  return `${n} ${n === 1 ? "face" : "faces"}`;
}

function plural(n: number) {
  return `${n.toLocaleString("en-GB")} ${n === 1 ? "photo" : "photos"}`;
}

export function PhotoGrid({ eventId, photos }: { eventId: string; photos: PhotoRow[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const lastClicked = useRef<number | null>(null);

  if (photos.length === 0) {
    return <p className="t-item-sub">Photos you upload appear here. Guests can only search once photos are in.</p>;
  }

  const ids = photos.map((p) => p.id);
  const byId = new Map(photos.map((p) => [p.id, p]));
  const count = selected.size;
  const allSelected = count === photos.length;

  function stopSelecting() {
    setSelecting(false);
    setSelected(new Set());
    setConfirming(false);
    lastClicked.current = null;
  }

  // Tap to toggle; shift-click on a computer selects everything between.
  function toggle(index: number, shift: boolean) {
    setConfirming(false);
    // Read the anchor now: React may run the updater below after it has moved on.
    const anchor = lastClicked.current;
    setSelected((prev) => {
      const next = new Set(prev);
      const id = ids[index];
      if (shift && anchor !== null) {
        const [a, b] = [anchor, index].sort((x, y) => x - y);
        const turnOn = !prev.has(id);
        for (let i = a; i <= b; i++) {
          if (turnOn) next.add(ids[i]);
          else next.delete(ids[i]);
        }
      } else if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    lastClicked.current = index;
  }

  function removeSelected() {
    const chosen = [...selected];
    startTransition(async () => {
      const result = await deletePhotos(eventId, chosen);
      if (result.error) {
        setNotice(result.error);
        setConfirming(false);
        return;
      }
      setNotice(`Deleted ${plural(result.deleted)}.`);
      stopSelecting();
    });
  }

  return (
    <section>
      <h2 className="sr-only">Uploaded photos</h2>

      <div className="sticky top-[49px] z-20 -mx-4 mb-4 flex min-h-[52px] flex-wrap items-center justify-between gap-2 bg-page/95 px-4 py-2 backdrop-blur md:mx-0 md:px-0">
        {!selecting ? (
          <>
            <p className="t-meta" aria-live="polite">
              {notice ?? plural(photos.length)}
            </p>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                setNotice(null);
                setSelecting(true);
              }}
            >
              Select
            </button>
          </>
        ) : confirming ? (
          <>
            <p className="t-ui" role="alert">
              Delete {plural(count)}? Guests lose them too. This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setConfirming(false)} disabled={pending}>
                Keep
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={removeSelected} disabled={pending}>
                {pending ? "Deleting…" : `Delete ${plural(count)}`}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <p className="t-ui tabular-nums" aria-live="polite">
                {count === 0 ? "Tap photos to select" : `${plural(count)} selected`}
              </p>
              <button
                type="button"
                className="nav-link"
                onClick={() => setSelected(allSelected ? new Set() : new Set(ids))}
              >
                {allSelected ? "Clear" : "Select all"}
              </button>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-quiet btn-sm" onClick={stopSelecting}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={count === 0}
                onClick={() => setConfirming(true)}
              >
                Delete{count > 0 ? ` ${count.toLocaleString("en-GB")}` : ""}
              </button>
            </div>
          </>
        )}
      </div>

      <ul className="columns-2 gap-2 sm:columns-3 md:columns-4 md:gap-4 lg:columns-5">
        {photos.map((p, i) => {
          const isSelected = selected.has(p.id);
          return (
            <li
              key={p.id}
              className="media group relative mb-2 break-inside-avoid md:mb-4"
              style={{ aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : "4 / 5" }}
            >
              {selecting ? (
                <button
                  type="button"
                  onClick={(e) => toggle(i, e.shiftKey)}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? "Deselect" : "Select"} photo ${i + 1} of ${photos.length}`}
                  className="block h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/photos/${p.id}/thumb`}
                    alt=""
                    loading="lazy"
                    className={`h-full w-full object-cover transition-opacity ${isSelected ? "opacity-70" : ""}`}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full ${
                      isSelected ? "bg-ink text-white" : "bg-white/90 shadow-[inset_0_0_0_1.5px_rgba(0,0,0,0.35)]"
                    }`}
                  >
                    {isSelected && (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                    )}
                  </span>
                  {isSelected && <span aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_var(--ink)]" />}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setOpen(p.id)}
                    aria-label={`Open photo ${i + 1} of ${photos.length}`}
                    className="block h-full w-full cursor-zoom-in"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/photos/${p.id}/thumb`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                  <form action={deletePhoto.bind(null, eventId, p.id)} className="absolute right-1.5 top-1.5">
                    <button
                      type="submit"
                      aria-label={`Remove ${p.original_name ?? "this photo"}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-semibold leading-none text-ink hover:bg-ink hover:text-white sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </form>
                </>
              )}
              <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink">
                {faces(p.face_count)}
              </span>
            </li>
          );
        })}
      </ul>
      {photos.length >= 500 && <p className="hint mt-3">Showing the latest 500 photos.</p>}

      {open && !selecting && (
        <PhotoViewer
          photoId={open}
          ids={ids}
          onNavigate={setOpen}
          onClose={() => setOpen(null)}
          footer={(id) => {
            const photo = byId.get(id);
            const index = ids.indexOf(id);
            const after = ids[index + 1] ?? ids[index - 1] ?? null;
            return (
              <div className="shrink-0 border-t border-hairline px-4 pb-[calc(16px+var(--safe-bottom))] pt-4">
                <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="t-item truncate">{photo?.original_name ?? "Event photo"}</p>
                    <p className="t-item-sub">
                      {faces(photo?.face_count ?? 0)}
                      {photo?.width && photo?.height ? ` · ${photo.width} × ${photo.height}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/api/photos/${id}/original?download`} className="btn btn-quiet">
                      Download
                    </a>
                    <form
                      action={async () => {
                        await deletePhoto(eventId, id);
                        setOpen(after);
                      }}
                    >
                      <button type="submit" className="btn btn-quiet hover:!text-danger">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          }}
        />
      )}
    </section>
  );
}
