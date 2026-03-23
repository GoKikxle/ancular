"use client";

import { motion } from "framer-motion";
import type { DbTrip } from "@/lib/trips";
import { TravelerCountStepper } from "@/components/trips/TravelerCountStepper";

type TripEditFormProps = {
  trip: DbTrip;
  action: (formData: FormData) => Promise<void>;
};

// Same height token as TripForm — locks all standalone controls to 48px.
const fieldClass =
  "h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 text-[14px] text-white placeholder-white/20 focus:border-white/[0.16] focus:bg-white/[0.06] focus:outline-none transition-colors";

const labelClass =
  "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/35";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

export function TripEditForm({ trip, action }: TripEditFormProps) {
  return (
    <form action={action} className="space-y-3">

      {/* Hidden fields — trip identity (slug never changes) */}
      <input type="hidden" name="trip_id" value={trip.id} />
      <input type="hidden" name="trip_slug" value={trip.slug} />

      {/* ── Trip name ────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <label className={labelClass}>Trip name</label>
        <input
          name="title"
          required
          defaultValue={trip.title}
          placeholder="e.g. Tokyo Spring"
          className={fieldClass}
        />
      </motion.div>

      {/* ── Destination ──────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.05)}>
        <label className={labelClass}>
          Destination{" "}
          <span className="ml-1.5 normal-case tracking-normal text-white/20">
            used for weather &amp; insights
          </span>
        </label>
        <input
          name="destination"
          defaultValue={trip.destination ?? ""}
          placeholder="e.g. Barcelona, Spain"
          className={fieldClass}
        />
      </motion.div>

      {/* ── Trip dates: start + end — compound card ───────────────────────────
           Same layout as TripForm for visual consistency across create / edit. */}
      <motion.div {...fadeUp(0.10)}>
        <label className={labelClass}>Trip dates</label>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">

            {/* Start date */}
            <div className="px-4 py-3.5">
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.1em] text-white/30">
                From
              </p>
              <input
                name="start_date"
                type="date"
                required
                defaultValue={trip.start_date ?? ""}
                aria-label="Start date"
                className="h-6 w-full bg-transparent text-[14px] text-white outline-none [color-scheme:dark]"
              />
            </div>

            {/* End date */}
            <div className="px-4 py-3.5">
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.1em] text-white/30">
                To{" "}
                <span className="normal-case text-white/20">opt.</span>
              </p>
              <input
                name="end_date"
                type="date"
                defaultValue={trip.end_date ?? ""}
                aria-label="End date (optional)"
                className="h-6 w-full bg-transparent text-[14px] text-white/60 outline-none [color-scheme:dark]"
              />
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── Travelers ────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.15)}>
        <label className={labelClass}>Travelers</label>
        <TravelerCountStepper name="travelers" initialLabel={trip.travelers} />
      </motion.div>

      {/* ── Auto-status note — compact info row ──────────────────────────────── */}
      <motion.div {...fadeUp(0.20)}>
        <div className="flex items-start gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
          {/* Info circle icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="mt-px shrink-0 text-white/25"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 6.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="7" cy="4.5" r="0.75" fill="currentColor" />
          </svg>
          <p className="text-[12px] leading-relaxed text-white/30">
            Trip status (Upcoming · Active · Past) is computed automatically
            from the dates above — no need to set it manually.
          </p>
        </div>
      </motion.div>

      {/* ── Submit ───────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.25)} className="pt-1">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl bg-white px-4 py-4 text-[15px] font-semibold text-neutral-950 transition-colors hover:bg-white/90"
        >
          Save changes
        </motion.button>
      </motion.div>

    </form>
  );
}
