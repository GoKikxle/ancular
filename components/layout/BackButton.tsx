"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  href?: string;
  label?: string;
  /** `light` for off-white shells (create/edit trip); default matches dark trip detail. */
  variant?: "dark" | "light";
};

export function BackButton({ href, label = "Back", variant = "dark" }: BackButtonProps) {
  const router = useRouter();
  const isLight = variant === "light";

  return (
    <motion.button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      whileTap={{ scale: 0.94 }}
      className={
        isLight
          ? "inline-flex items-center gap-1.5 text-[13px] text-[#9A9A9A] transition-colors hover:text-[#111111] dark:text-white/45 dark:hover:text-white/80"
          : "inline-flex items-center gap-1.5 text-[13px] text-white/40 transition-colors hover:text-white/65"
      }
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <path
          d="M9 11L5 7L9 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </motion.button>
  );
}
