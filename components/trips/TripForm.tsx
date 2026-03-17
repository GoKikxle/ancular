"use client";

import { motion } from "framer-motion";

type TripFormProps = {
  action: (formData: FormData) => Promise<void>;
};

// Explicit h-12 (no py-*) locks every standalone control — text inputs, select,
// and date pickers — to the same rendered height on all browsers.
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

export function TripForm({ action }: TripFormProps) {
  return (
    <form action={action} className="space-y-3">

      {/* ── Trip name ────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <label className={labelClass}>Trip name</label>
        <input
          name="title"
          required
          placeholder="e.g. Tokyo Spring"
          className={fieldClass}
        />
      </motion.div>

      {/* ── URL slug ─────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.05)}>
        <label className={labelClass}>
          URL slug{" "}
          <span className="ml-1.5 normal-case tracking-normal text-white/20">
            lowercase, hyphens only
          </span>
        </label>
        <input
          name="slug"
          required
          placeholder="e.g. tokyo-spring"
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and hyphens only"
          className={fieldClass}
        />
      </motion.div>

      {/* ── Trip dates: start + end — compound card ───────────────────────────
           Both date pickers live inside one rounded container separated by a
           thin divider column. This groups them as a single "when is this trip"
           answer instead of two isolated boxes. */}
      <motion.div {...fadeUp(0.10)}>
        <label className={labelClass}>Trip dates</label>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">

            {/* Start date */}
            <div className="px-4 py-3">
              <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-white/30">
                From
              </p>
              <input
                name="start_date"
                type="date"
                required
                aria-label="Start date"
                className="h-6 w-full bg-transparent text-[14px] text-white outline-none [color-scheme:dark]"
              />
            </div>

            {/* End date */}
            <div className="px-4 py-3">
              <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-white/30">
                To{" "}
                <span className="normal-case text-white/20">opt.</span>
              </p>
              <input
                name="end_date"
                type="date"
                aria-label="End date (optional)"
                className="h-6 w-full bg-transparent text-[14px] text-white/50 outline-none [color-scheme:dark]"
              />
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── Travelers ────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.15)}>
        <label className={labelClass}>Travelers</label>
        <input
          name="travelers"
          placeholder="e.g. 2 travelers"
          className={fieldClass}
        />
      </motion.div>

      {/* Status is computed automatically from the dates above — no field needed. */}

      {/* ── Submit ───────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.20)} className="pt-2">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-[14px] font-semibold text-neutral-950 transition-colors hover:bg-white/90"
        >
          Create Trip
        </motion.button>
      </motion.div>

    </form>
  );
}
