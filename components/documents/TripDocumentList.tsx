"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DbDocument } from "@/lib/documents";
import { DocumentCategoryIcon } from "./DocumentCategoryIcon";
import { removeDocumentFromTripAction } from "@/app/(app)/trips/[tripId]/actions";

// ── Icons ─────────────────────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden="true">
      <path
        d="M1 3.5h10M4.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 3.5l.6 7.2a1 1 0 001 .8h4.8a1 1 0 001-.8L10 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M4.5 6.5v3M7.5 6.5v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Animation ─────────────────────────────────────────────────────────────────

const confirmSlide = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.14, ease: [0.55, 0, 1, 0.45] as const },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  docs: DbDocument[];
  tripId: string;
  tripSlug: string;
};

/**
 * Interactive list of documents attached to a trip.
 *
 * Each document row has a remove affordance (trash icon) that expands into an
 * inline two-step confirmation before firing the server action.
 *
 * "Remove from trip" only deletes the trip_documents join row — the document
 * and its storage file are completely untouched.
 */
export function TripDocumentList({ docs, tripId, tripSlug }: Props) {
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestConfirm(id: string) {
    setConfirmingId(id);
  }

  function cancelConfirm() {
    setConfirmingId(null);
  }

  function handleRemove(documentId: string) {
    setRemovingId(documentId);
    setConfirmingId(null);
    setRemoveError(null);
    startTransition(async () => {
      try {
        const result = await removeDocumentFromTripAction(tripId, tripSlug, documentId);
        if (result?.error) {
          setRemoveError(result.error);
        } else {
          router.refresh();
        }
      } catch {
        setRemoveError("Could not remove document");
      }
      setRemovingId(null);
    });
  }

  return (
    <ul className="space-y-2">
      {removeError && (
        <li>
          <p className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[12px] text-red-300">
            {removeError}
          </p>
        </li>
      )}
      {docs.map((doc) => {
        const isConfirming = confirmingId === doc.id;
        const isRemoving = removingId === doc.id && isPending;

        return (
          <li key={doc.id}>
            {/* ── Main row ──────────────────────────────────────────────────
                 Dims atomically when in confirm or removing state.
                 View link and trash icon are hidden during confirmation so
                 the row doesn't feel cluttered while the confirm row is open. */}
            <div
              className={`flex items-center gap-2.5 transition-opacity duration-150 ${
                isRemoving
                  ? "pointer-events-none opacity-35"
                  : isConfirming
                  ? "opacity-50"
                  : "opacity-100"
              }`}
            >
              <DocumentCategoryIcon category={doc.category} />

              <span className="min-w-0 flex-1 truncate text-[14px] text-white/60">
                {doc.title}
              </span>

              {/* View link — hidden while confirmation is open */}
              {!isConfirming && doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/28 transition-colors hover:text-white/50"
                >
                  View
                </a>
              )}

              {/* No-file badge — hidden while confirmation is open */}
              {!isConfirming && !doc.file_url && (
                <span className="flex-shrink-0 rounded-full border border-white/[0.07] px-2 py-0.5 text-[10px] text-white/20">
                  No file
                </span>
              )}

              {/* Remove trigger — hidden while confirmation is open */}
              {!isConfirming && (
                <button
                  type="button"
                  onClick={() => requestConfirm(doc.id)}
                  disabled={isPending}
                  aria-label={`Remove "${doc.title}" from this trip`}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/[0.28] transition-colors hover:text-white/50 active:text-red-400/70 disabled:opacity-30"
                >
                  <TrashIcon />
                </button>
              )}
            </div>

            {/* ── Confirmation row ──────────────────────────────────────────── */}
            <AnimatePresence initial={false}>
              {isConfirming && (
                <motion.div
                  key={`confirm-${doc.id}`}
                  variants={confirmSlide}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 pb-0.5 pt-2.5">
                    <p className="text-[12px] text-white/35">
                      Remove from trip?
                    </p>
                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={cancelConfirm}
                        className="rounded-full border border-white/[0.12] px-3 py-1.5 text-[12px] text-white/40 transition-colors hover:text-white/60"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(doc.id)}
                        className="rounded-full border border-red-500/25 bg-red-500/[0.09] px-3 py-1.5 text-[12px] font-medium text-red-400/80 transition-colors hover:bg-red-500/[0.16] hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
