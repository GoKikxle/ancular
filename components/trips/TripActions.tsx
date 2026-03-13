"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TripActionsProps = {
  onDelete: () => Promise<void>;
};

export function TripActions({ onDelete }: TripActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirmDelete() {
    startTransition(() => onDelete());
  }

  return (
    <div className="mt-10 border-t border-white/[0.06] pt-6">
      <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-white/25">
        Danger Zone
      </p>

      <AnimatePresence mode="wait">
        {!confirming ? (
          <motion.button
            key="delete-trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirming(true)}
            className="w-full rounded-2xl border border-white/[0.07] px-4 py-3 text-[13px] text-white/35 transition-colors hover:border-red-500/20 hover:text-red-400/80"
          >
            Delete Trip
          </motion.button>
        ) : (
          <motion.div
            key="delete-confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl border border-red-500/[0.18] bg-red-500/[0.05] p-4"
          >
            <p className="mb-3.5 text-[13px] leading-relaxed text-white/60">
              Delete this trip? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-[13px] text-white/45 transition-colors hover:text-white/65"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-500/75 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40"
              >
                {isPending ? "Deleting…" : "Delete"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
