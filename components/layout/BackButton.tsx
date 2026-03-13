"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  href?: string;
  label?: string;
};

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => (href ? router.push(href) : router.back())}
      whileTap={{ scale: 0.94 }}
      className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-white/40 transition-colors hover:text-white/65"
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
