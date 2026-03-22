"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DbDocument } from "@/lib/documents";
import type { TripDateContext } from "@/lib/document-to-timeline";
import { DocumentCategoryIcon } from "./DocumentCategoryIcon";
import { attachDocumentAction } from "@/app/(app)/trips/[tripId]/actions";

type Props = {
  tripId: string;
  tripSlug: string;
  availableDocs: DbDocument[];
  /** Forwarded to attachDocumentAction so generated timeline items get real dates. */
  tripDates?: TripDateContext;
};

type AttachState =
  | "idle"
  | { success: true; linkedToTimeline: boolean; linkedItemTitle: string | null }
  | { error: string };

const slideVariants = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function successMessage(linked: boolean, title: string | null): string {
  if (linked && title) return `Attached and linked to ${title}.`;
  if (linked)          return "Attached · linked to timeline action.";
  return "Document attached. No matching action found yet.";
}

export function AttachDocumentPicker({ tripId, tripSlug, availableDocs, tripDates }: Props) {
  const [open, setOpen] = useState(false);
  const [attachState, setAttachState] = useState<AttachState>("idle");
  const [isPending, startTransition] = useTransition();

  function handleAttach(doc: DbDocument) {
    setAttachState("idle");
    startTransition(async () => {
      try {
        const result = await attachDocumentAction(
          tripId,
          tripSlug,
          { id: doc.id, title: doc.title, category: doc.category }
        );

        if (result?.error) {
          setAttachState({ error: result.error });
        } else if (result) {
          setAttachState({
            success: true,
            linkedToTimeline: result.linkedToTimeline,
            linkedItemTitle: result.linkedItemTitle,
          });
          setTimeout(() => {
            setOpen(false);
            setAttachState("idle");
          }, 1800);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to attach document.";
        setAttachState({ error: msg });
      }
    });
  }

  const isSuccess = typeof attachState === "object" && "success" in attachState;
  const errorMessage = typeof attachState === "object" && "error" in attachState ? attachState.error : null;

  return (
    <div>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (open) setAttachState("idle");
        }}
        disabled={isPending}
        className={`rounded-full border px-3 py-1 text-[11px] transition-colors disabled:opacity-40 ${
          open
            ? "border-white/[0.18] bg-white/[0.09] text-white/80"
            : "border-white/[0.07] text-white/35 hover:text-white/55"
        }`}
      >
        {open ? "Cancel" : "+ Attach from vault"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="attach-picker"
            variants={slideVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            {/* ── Success banner ────────────────────────────────────────────── */}
            {isSuccess ? (
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="flex-shrink-0 text-emerald-400"
                >
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-[13px] text-emerald-300">
                  {successMessage(
                    (attachState as { success: true; linkedToTimeline: boolean; linkedItemTitle: string | null }).linkedToTimeline,
                    (attachState as { success: true; linkedToTimeline: boolean; linkedItemTitle: string | null }).linkedItemTitle,
                  )}
                </p>
              </div>
            ) : (
              <div className="mt-3">
                {/* ── Inline error ───────────────────────────────────────────── */}
                {errorMessage && (
                  <p className="mb-2 rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2 text-[12px] text-red-300">
                    {errorMessage}
                  </p>
                )}

                {/* ── Document list ──────────────────────────────────────────── */}
                {availableDocs.length > 0 ? (
                  <ul className="space-y-0.5">
                    {availableDocs.map((doc) => (
                      <li key={doc.id}>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAttach(doc)}
                          disabled={isPending}
                          className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/75 disabled:opacity-40"
                        >
                          <DocumentCategoryIcon category={doc.category} />
                          <span className="min-w-0 flex-1 truncate text-left">
                            {doc.title}
                          </span>
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 text-[13px] text-white/28">
                    All vault documents are already attached.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
