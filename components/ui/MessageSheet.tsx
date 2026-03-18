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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/[0.08] bg-neutral-950"
          >
            {/* Drag handle (visual affordance) */}
            <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-xl p-2 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path
                    d="M5 5l8 8M13 5l-8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Category (optional) */}
              {categoryLabel && (
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">
                  {categoryLabel}
                </p>
              )}

              {/* Title */}
              <h3 className="pr-12 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-white">
                {title}
              </h3>

              {/* Full body */}
              <p className="mt-4 text-[15px] leading-relaxed text-white/55">
                {body}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
