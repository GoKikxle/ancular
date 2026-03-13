"use client";

import { motion } from "framer-motion";

type TripFormProps = {
  action: (formData: FormData) => Promise<void>;
};

const fieldClass =
  "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[14px] text-white placeholder-white/20 focus:border-white/[0.16] focus:bg-white/[0.06] focus:outline-none transition-colors";

const labelClass = "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/35";

const fields = [
  {
    name: "title",
    label: "Trip name",
    placeholder: "e.g. Tokyo Spring",
    required: true,
  },
  {
    name: "slug",
    label: "URL slug",
    placeholder: "e.g. tokyo-spring",
    required: true,
    hint: "lowercase, hyphens only",
    pattern: "[a-z0-9-]+",
  },
  {
    name: "dates",
    label: "Dates",
    placeholder: "e.g. Jun 10 → Jun 17",
  },
  {
    name: "travelers",
    label: "Travelers",
    placeholder: "e.g. 2 travelers",
  },
];

export function TripForm({ action }: TripFormProps) {
  return (
    <form action={action} className="space-y-3">
      {fields.map((field, i) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.05,
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <label className={labelClass}>
            {field.label}
            {field.hint && (
              <span className="ml-1.5 normal-case tracking-normal text-white/20">
                {field.hint}
              </span>
            )}
          </label>
          <input
            name={field.name}
            required={field.required}
            placeholder={field.placeholder}
            pattern={field.pattern}
            title={
              field.pattern
                ? "Lowercase letters, numbers, and hyphens only"
                : undefined
            }
            className={fieldClass}
          />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: fields.length * 0.05,
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <label className={labelClass}>Status</label>
        <select name="status" defaultValue="Upcoming" className={fieldClass}>
          <option value="Upcoming" className="bg-neutral-900">
            Upcoming
          </option>
          <option value="Active" className="bg-neutral-900">
            Active
          </option>
          <option value="Past" className="bg-neutral-900">
            Past
          </option>
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: (fields.length + 1) * 0.05,
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="pt-2"
      >
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
