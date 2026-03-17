"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TripActionsProps = {
  tripId: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

function TrashIcon() {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true">
      <path
        d="M1 3.5h11M4.5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M10.5 3.5l-.7 8a1 1 0 01-1 .9H4.2a1 1 0 01-1-.9l-.7-8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Inline two-step delete confirmation for a trip.
 *
 * Idle state  → one full-width muted-red button.
 * Confirm state → warning text + "Delete permanently" (solid red) + "Cancel".
 *
 * Uses the existing deleteTripAction from app/trips/actions.ts so no new
 * mutation logic is introduced here.
 */
export function TripActions({ tripId, deleteAction }: TripActionsProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait" initial={false}>
        {!confirming ? (
          // ── Idle state ────────────────────────────────────────────────────────
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <motion.button
              type="button"
              onClick={() => setConfirming(true)}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/[0.18] bg-red-500/[0.07] py-3.5 text-[14px] font-medium text-red-400/80 transition-colors hover:border-red-500/[0.28] hover:bg-red-500/[0.12] hover:text-red-400"
            >
              <TrashIcon />
              Delete this trip
            </motion.button>
          </motion.div>
        ) : (
          // ── Confirm state ─────────────────────────────────────────────────────
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden rounded-2xl border border-red-500/[0.18] bg-red-500/[0.05]"
          >
            {/* Warning message */}
            <div className="px-4 pt-4 pb-3">
              <p className="text-[13px] font-semibold text-red-400/90">
                Delete this trip?
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/35">
                This will permanently remove the trip, its timeline actions, and
                all attached documents. This cannot be undone.
              </p>
            </div>

            {/* Action row */}
            <div className="flex flex-col gap-2 px-4 pb-4">
              <form action={deleteAction}>
                <input type="hidden" name="id" value={tripId} />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-xl bg-red-500 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-red-400"
                >
                  Delete permanently
                </motion.button>
              </form>

              <motion.button
                type="button"
                onClick={() => setConfirming(false)}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 text-[14px] font-medium text-white/50 transition-colors hover:border-white/[0.14] hover:text-white/70"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
