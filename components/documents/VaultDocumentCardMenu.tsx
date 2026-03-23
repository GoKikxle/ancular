"use client";

import { useEffect, useRef } from "react";

type Props = {
  docTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditTitle: () => void;
  onDeleteClick: () => void;
  disabled?: boolean;
};

function KebabIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="6" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="18" r="1.75" />
    </svg>
  );
}

/** Per-card ⋮ menu — ref + document click to close (same pattern as AvatarMenu). */
export function VaultDocumentCardMenu({
  docTitle,
  isOpen,
  onOpenChange,
  onEditTitle,
  onDeleteClick,
  disabled,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenChange(!isOpen);
        }}
        disabled={disabled}
        aria-label={`More actions for “${docTitle}”`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/65 active:bg-white/[0.08] disabled:opacity-30"
      >
        <KebabIcon />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-[60] mt-1.5 min-w-[min(100vw-2rem,11rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.08] bg-neutral-900/95 py-1 backdrop-blur-md"
          role="menu"
          aria-label="Document actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            className="flex w-full items-center px-4 py-3.5 text-left text-[15px] text-white/85 transition-colors hover:bg-white/[0.06] active:bg-white/[0.08]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
              onEditTitle();
            }}
          >
            Edit title
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center px-4 py-3.5 text-left text-[15px] text-red-400/90 transition-colors hover:bg-red-500/[0.08] active:bg-red-500/[0.12]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
              onDeleteClick();
            }}
          >
            Delete document
          </button>
        </div>
      )}
    </div>
  );
}
