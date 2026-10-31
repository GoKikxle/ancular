"use client";

import { useEffect, useRef, useState } from "react";

/** Full-screen photo viewer shared by guests and hosts: arrows, swipe, Escape to close. */
export function PhotoViewer({
  photoId,
  ids,
  onNavigate,
  onClose,
  footer,
  src = (id) => `/api/photos/${id}/preview`,
}: {
  photoId: string;
  ids: string[];
  onNavigate: (id: string) => void;
  onClose: () => void;
  /** Actions under the photo: send and save for guests, download and remove for hosts. */
  footer?: (id: string) => React.ReactNode;
  /** Where to load each photo from (direct storage links when we have them). */
  src?: (id: string) => string;
}) {
  const index = ids.indexOf(photoId);
  const prev = index > 0 ? ids[index - 1] : null;
  const next = index < ids.length - 1 ? ids[index + 1] : null;
  const touchX = useRef<number | null>(null);
  const [dir, setDir] = useState<"next" | "prev" | null>(null);
  const go = (id: string | null, d: "next" | "prev") => {
    if (!id) return;
    setDir(d);
    onNavigate(id);
  };

  // Fetch the neighbours in the background so arrows and swipes feel instant.
  useEffect(() => {
    for (const id of [prev, next]) if (id) new Image().src = src(id);
  }, [prev, next, src]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(prev, "prev");
      if (e.key === "ArrowRight") go(next, "next");
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, next, onClose, onNavigate]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${ids.length}`}
      className="viewer-in fixed inset-0 z-50 flex flex-col bg-page"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx > 50) go(prev, "prev");
        if (dx < -50) go(next, "next");
        touchX.current = null;
      }}
    >
      <div className="flex h-[49px] shrink-0 items-center justify-between border-b border-hairline px-3 sm:px-4">
        <span className="t-ui">
          {index + 1} of {ids.length}
        </span>
        <button type="button" onClick={onClose} className="btn btn-sm btn-quiet">
          Close
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photoId}
          src={src(photoId)}
          alt={`Photo ${index + 1} of ${ids.length}`}
          className={`max-h-full max-w-full rounded-[2px] object-contain ${dir === "next" ? "slide-next" : dir === "prev" ? "slide-prev" : ""}`}
        />
        {prev && (
          <button
            type="button"
            onClick={() => go(prev, "prev")}
            aria-label="Previous photo"
            className="nudge-left absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-fill hover:bg-[var(--fill-hover)] active:scale-95 transition sm:grid"
          >
            <Chevron dir="left" />
          </button>
        )}
        {next && (
          <button
            type="button"
            onClick={() => go(next, "next")}
            aria-label="Next photo"
            className="nudge-right absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-fill hover:bg-[var(--fill-hover)] active:scale-95 transition sm:grid"
          >
            <Chevron dir="right" />
          </button>
        )}
      </div>
      {footer?.(photoId)}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}
