import { deletePhoto } from "@/app/(app)/events/actions";
import type { PhotoRow } from "@/lib/events";

export function PhotoGrid({ eventId, photos }: { eventId: string; photos: PhotoRow[] }) {
  if (photos.length === 0) {
    return (
      <p className="text-center text-ink-muted">
        Photos you upload appear here. Guests can only search once photos are in.
      </p>
    );
  }

  return (
    <section>
      <h2 className="sr-only">Uploaded photos</h2>
      <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
        {photos.map((p) => (
          <li key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-indigo-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/photos/${p.id}/thumb`}
              alt={p.original_name ?? "Event photo"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-indigo/90 px-2 py-0.5 text-[0.7rem] font-semibold text-white">
              {p.face_count} {p.face_count === 1 ? "face" : "faces"}
            </span>
            <form action={deletePhoto.bind(null, eventId, p.id)} className="absolute right-1.5 top-1.5">
              <button
                type="submit"
                aria-label={`Remove ${p.original_name ?? "this photo"}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/95 text-lg font-bold leading-none text-danger shadow-sm sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100"
              >
                ×
              </button>
            </form>
          </li>
        ))}
      </ul>
      {photos.length >= 500 && <p className="hint mt-3">Showing the latest 500 photos.</p>}
    </section>
  );
}
