"use client";

import { motion } from "framer-motion";

type NextActionCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref?: string;
};

export function NextActionCard({
  title,
  description,
  buttonLabel,
  buttonHref,
}: NextActionCardProps) {
  return (
    <section className="mb-4 rounded-3xl bg-sky-500 px-5 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-950/55">
        Next Action
      </p>
      <h3 className="mt-2 text-[22px] font-semibold leading-snug tracking-[-0.01em] text-sky-950">
        {title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sky-950/65">
        {description}
      </p>
      <motion.a
        href={buttonHref ?? "#"}
        whileTap={{ scale: 0.96 }}
        className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-sky-950 px-4 py-2.5 text-[13px] font-medium text-white"
      >
        {buttonLabel}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6h7M6.5 3l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.a>
    </section>
  );
}
