"use client";

import { motion } from "framer-motion";
import type { DbTrip } from "@/lib/trips";
import { TravelerCountStepper } from "@/components/trips/TravelerCountStepper";
import {
  tripFormCompoundDivideClass,
  tripFormCompoundShellClass,
  tripFormDateInputClass,
  tripFormDateInputOptionalClass,
  tripFormDateLabelClass,
  tripFormFieldClass,
  tripFormHelperClass,
  tripFormLabelClass,
  tripFormPrimaryButtonClass,
} from "@/lib/trip-form-styles";

type TripEditFormProps = {
  trip: DbTrip;
  action: (formData: FormData) => Promise<void>;
};

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

      <input type="hidden" name="trip_id" value={trip.id} />
      <input type="hidden" name="trip_slug" value={trip.slug} />

      <motion.div {...fadeUp(0)}>
        <label className={tripFormLabelClass}>Trip name</label>
        <input
          name="title"
          required
          defaultValue={trip.title}
          placeholder="e.g. Tokyo Spring"
          className={tripFormFieldClass}
        />
      </motion.div>

      <motion.div {...fadeUp(0.05)}>
        <label className={tripFormLabelClass}>
          Destination{" "}
          <span className={tripFormHelperClass}>used for weather &amp; insights</span>
        </label>
        <input
          name="destination"
          defaultValue={trip.destination ?? ""}
          placeholder="e.g. Barcelona, Spain"
          className={tripFormFieldClass}
        />
      </motion.div>

      <motion.div {...fadeUp(0.1)}>
        <label className={tripFormLabelClass}>Trip dates</label>
        <div className={tripFormCompoundShellClass}>
          <div className={`grid grid-cols-2 ${tripFormCompoundDivideClass}`}>

            <div className="px-4 py-3.5">
              <p className={tripFormDateLabelClass}>From</p>
              <input
                name="start_date"
                type="date"
                required
                defaultValue={trip.start_date ?? ""}
                aria-label="Start date"
                className={tripFormDateInputClass}
              />
            </div>

            <div className="px-4 py-3.5">
              <p className={tripFormDateLabelClass}>
                To <span className="normal-case font-normal text-[#BBBBBB] dark:text-white/25">opt.</span>
              </p>
              <input
                name="end_date"
                type="date"
                defaultValue={trip.end_date ?? ""}
                aria-label="End date (optional)"
                className={tripFormDateInputOptionalClass}
              />
            </div>

          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.15)}>
        <label className={tripFormLabelClass}>Travelers</label>
        <TravelerCountStepper name="travelers" initialLabel={trip.travelers} />
      </motion.div>

      <motion.div {...fadeUp(0.2)}>
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#EBEBEB] bg-[#FAFAFA] px-4 py-3.5 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="mt-px shrink-0 text-sky-600/80 dark:text-sky-400/70"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 6.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="7" cy="4.5" r="0.75" fill="currentColor" />
          </svg>
          <p className="text-[12px] leading-relaxed text-[#666666] dark:text-white/40">
            Trip status (Upcoming · Active · Past) is computed automatically
            from the dates above — no need to set it manually.
          </p>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.25)} className="pt-1">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className={tripFormPrimaryButtonClass}
        >
          Save changes
        </motion.button>
      </motion.div>

    </form>
  );
}
