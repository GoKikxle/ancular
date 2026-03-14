"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DbDocument } from "@/lib/documents";
import { DocumentCategoryIcon } from "./DocumentCategoryIcon";
import { attachDocumentAction } from "@/app/trips/[tripId]/actions";

type Props = {
  tripId: string;
  tripSlug: string;
  availableDocs: DbDocument[];
};

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

export function AttachDocumentPicker({ tripId, tripSlug, availableDocs }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAttach(documentId: string) {
    startTransition(async () => {
      await attachDocumentAction(tripId, tripSlug, documentId);
      setOpen(false);
    });
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
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
            <div className="mt-3">
              {availableDocs.length > 0 ? (
                <ul className="space-y-0.5">
                  {availableDocs.map((doc) => (
                    <li key={doc.id}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAttach(doc.id)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
