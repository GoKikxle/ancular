"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type CurrentTripCardProps = {
  title: string;
  dates: string;
  travelers: string;
  status: string;
  href?: string;
};

function statusBadgeClass(status: string) {
  if (status === "Active") return "bg-emerald-500/15 text-emerald-300";
  if (status === "Upcoming") return "bg-amber-500/15 text-amber-300";
  return "bg-white/10 text-white/45";
}

export function CurrentTripCard({
  title,
  dates,
  travelers,
  status,
  href,
}: CurrentTripCardProps) {
  const content = (
    <motion.div
      whileTap={href ? { scale: 0.98 } : {}}
      className="mb-4 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.06]"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.1em] text-white/35">
          {status === "Active" ? "Active Trip" : "Upcoming Trip"}
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClass(status)}`}
        >
          {status}
        </span>
      </div>
      <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="mt-1.5 text-[13px] text-white/45">
        {dates} · {travelers}
      </p>
    </motion.div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
