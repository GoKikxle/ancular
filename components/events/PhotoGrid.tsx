"use client";

import { useState } from "react";
import { deletePhoto } from "@/app/(app)/events/actions";
import type { PhotoRow } from "@/lib/events";
import { PhotoViewer } from "@/components/photos/PhotoViewer";

function faces(n: number) {
  return `${n} ${n === 1 ? "face" : "faces"}`;
}

export function PhotoGrid({ eventId, photos }: { eventId: string; photos: PhotoRow[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (photos.length === 0) {
    return <p className="t-item-sub">Photos you upload appear here. Guests can only search once photos are in.</p>;
  }

  const ids = photos.map((p) => p.id);
  const byId = new Map(photos.map((p) => [p.id, p]));

  return (
    <section>
      <h2 className="sr-only">Uploaded photos</h2>
      <ul className="columns-2 gap-2 sm:columns-3 md:columns-4 md:gap-4 lg:columns-5">
        {photos.map((p, i) => (
          <li
            key={p.id}
            className="media group relative mb-2 break-inside-avoid md:mb-4"
            style={{ aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : "4 / 5" }}
          >
            <button
              type="button"
              onClick={() => setOpen(p.id)}
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
              className="block h-full w-full cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/photos/${p.id}/thumb`} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
            <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink">
              {faces(p.face_count)}
            </span>
            <form action={deletePhoto.bind(null, eventId, p.id)} className="absolute right-1.5 top-1.5">
              <button
                type="submit"
                aria-label={`Remove ${p.original_name ?? "this photo"}`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-semibold leading-none text-ink hover:bg-ink hover:text-white sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100"
              >
                ×
              </button>
            </form>
          </li>
        ))}
      </ul>
      {photos.length >= 500 && <p className="hint mt-3">Showing the latest 500 photos.</p>}

      {open && (
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
