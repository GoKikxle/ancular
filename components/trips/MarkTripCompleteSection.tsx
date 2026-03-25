"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { completeTripAction } from "@/app/(app)/trips/actions";

type Props = {
  tripId: string;
  tripSlug: string;
};

export function MarkTripCompleteSection({ tripId, tripSlug }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="mt-10 border-t border-white/[0.06] pt-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/28">When you’re done</p>
      <AnimatePresence mode="wait" initial={false}>
        {!confirming ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-4"
          >
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] py-3.5 text-[14px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/85 active:scale-[0.99]"
            >
              Mark as completed
            </button>
            <p className="mt-2 text-center text-[12px] leading-relaxed text-white/32">
              Moves this trip to Archived and includes it in your Stats.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
          >
            <p className="text-[14px] font-semibold text-white/85">Mark this trip as completed?</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/38">
              It will leave this list, appear under Archived, and count toward My Stats. You can still open it anytime.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <form action={completeTripAction}>
                <input type="hidden" name="trip_id" value={tripId} />
                <input type="hidden" name="trip_slug" value={tripSlug} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-white py-3.5 text-[14px] font-semibold text-neutral-950 transition-opacity hover:opacity-95 active:scale-[0.99]"
                >
                  Confirm
                </button>
              </form>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="w-full rounded-xl border border-white/[0.1] py-3.5 text-[14px] font-medium text-white/50 transition-colors hover:border-white/[0.14] hover:text-white/70"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
