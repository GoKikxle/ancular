"use client";

import { motion } from "framer-motion";
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

type TripFormProps = {
  action: (formData: FormData) => Promise<void>;
};

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

      <motion.div {...fadeUp(0)}>
        <label className={tripFormLabelClass}>Trip name</label>
        <input
          name="title"
          required
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
          placeholder="e.g. Barcelona, Spain"
          className={tripFormFieldClass}
        />
      </motion.div>

      <motion.div {...fadeUp(0.1)}>
        <label className={tripFormLabelClass}>
          URL slug{" "}
          <span className={tripFormHelperClass}>lowercase, hyphens only</span>
        </label>
        <input
          name="slug"
          required
          placeholder="e.g. tokyo-spring"
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and hyphens only"
          className={tripFormFieldClass}
        />
      </motion.div>

      <motion.div {...fadeUp(0.15)}>
        <label className={tripFormLabelClass}>Trip dates</label>
        <div className={tripFormCompoundShellClass}>
          <div className={`grid grid-cols-2 ${tripFormCompoundDivideClass}`}>

            <div className="px-4 py-3.5">
              <p className={tripFormDateLabelClass}>From</p>
              <input
                name="start_date"
                type="date"
                required
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
                aria-label="End date (optional)"
                className={tripFormDateInputOptionalClass}
              />
            </div>

          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.2)}>
        <label className={tripFormLabelClass}>Travelers</label>
        <TravelerCountStepper name="travelers" defaultCount={1} />
      </motion.div>

      <motion.div {...fadeUp(0.25)} className="pt-2">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className={tripFormPrimaryButtonClass}
        >
          Create Trip
        </motion.button>
      </motion.div>

    </form>
  );
}
