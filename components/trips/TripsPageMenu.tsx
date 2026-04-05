"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function KebabIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="6" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="18" r="1.75" />
    </svg>
  );
}

/**
 * Trips hub ⋮ menu: open Archived from the main list, return to All trips from Archived.
 * Same outside-click + Escape pattern as AvatarMenu / VaultDocumentCardMenu.
 */
export function TripsPageMenu({ light = false }: { light?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const onArchivedPage = pathname.startsWith("/trips/archived");

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        aria-label="Trip list options"
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          light
            ? "flex h-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-[12px] border border-[#E5E5E5] bg-white text-[#666666] active:scale-[0.96]"
            : "flex h-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-white/45 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/70 active:scale-[0.99]"
        }
      >
        <KebabIcon />
      </button>

      {open && (
        <div
          className={
            light
              ? "absolute right-0 top-full z-[60] mt-1.5 min-w-[min(100vw-2rem,10rem)] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              : "absolute right-0 top-full z-[60] mt-1.5 min-w-[min(100vw-2rem,11rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.08] bg-neutral-900/95 py-1 backdrop-blur-md"
          }
          role="menu"
          aria-label="Trip list menu"
        >
          {onArchivedPage ? (
            <Link
              href="/trips"
              role="menuitem"
              className={light ? "flex w-full px-4 py-3 text-left text-[14px] text-gray-700 transition-colors hover:bg-gray-50" : "flex w-full px-4 py-3.5 text-left text-[15px] text-white/85 transition-colors hover:bg-white/[0.06]"}
              onClick={() => setOpen(false)}
            >
              All trips
            </Link>
          ) : (
            <Link
              href="/trips/archived"
              role="menuitem"
              className={light ? "flex w-full px-4 py-3 text-left text-[14px] text-gray-700 transition-colors hover:bg-gray-50" : "flex w-full px-4 py-3.5 text-left text-[15px] text-white/85 transition-colors hover:bg-white/[0.06]"}
              onClick={() => setOpen(false)}
            >
              Archived
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
