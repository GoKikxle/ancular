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
        className="flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#AAAAAA] transition-colors hover:bg-[#F0F0F0] hover:text-[#444444] active:bg-[#EAEAEA] disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/[0.08] dark:hover:text-white/70"
      >
        <KebabIcon />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-[60] mt-1.5 min-w-[min(100vw-2rem,11rem)] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#EBEBEB] bg-white py-1 shadow-lg dark:border-white/[0.1] dark:bg-neutral-900"
          role="menu"
          aria-label="Document actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            className="flex w-full items-center px-4 py-3.5 text-left text-[15px] text-[#111111] transition-colors hover:bg-[#F5F5F5] active:bg-[#EEEEEE] dark:text-white/90 dark:hover:bg-white/[0.08] dark:active:bg-white/[0.1]"
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
            className="flex w-full items-center px-4 py-3.5 text-left text-[15px] text-red-700 transition-colors hover:bg-red-50 active:bg-red-100/80 dark:text-red-400/90 dark:hover:bg-red-500/[0.12] dark:active:bg-red-500/[0.18]"
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
