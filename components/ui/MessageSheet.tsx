"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type MessageSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  /** Optional label shown below title, e.g. "Food" or "Local tip". */
  categoryLabel?: string;
};

/**
 * Full-text view for "Good to Know" tips.
 * Opens as a bottom-anchored sheet on tap. Close via button or backdrop tap.
 * Dark premium mobile-first styling.
 */
export function MessageSheet({
  isOpen,
  onClose,
  title,
  body,
  categoryLabel,
}: MessageSheetProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — tap to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[1.75rem] border-t border-white/[0.06] bg-neutral-950 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
          >
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center border-b border-white/[0.04] bg-neutral-950/95 py-3 backdrop-blur-sm">
              <div
                className="h-1 w-12 rounded-full bg-white/25"
                aria-hidden="true"
              />
            </div>

            <div className="relative px-6 pb-10 pt-6">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-6 rounded-xl p-2.5 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/65 active:scale-95"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M5 5l8 8M13 5l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Category (optional) */}
              {categoryLabel && (
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  {categoryLabel}
                </p>
              )}

              {/* Title */}
              <h3 className="pr-14 text-[24px] font-semibold leading-[1.25] tracking-[-0.025em] text-white">
                {title}
              </h3>

              {/* Full body — comfortable reading */}
              <div className="mt-6">
                <p className="text-[16px] leading-[1.65] text-white/60 selection:bg-white/10">
                  {body}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
