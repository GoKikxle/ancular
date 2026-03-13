"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Trip } from "@/types/trip";

function statusDotClass(status: string) {
  if (status === "Active") return "bg-emerald-400";
  if (status === "Upcoming") return "bg-amber-400";
  return "bg-white/25";
}

type TripSwitcherProps = {
  trips: Trip[];
  currentSlug?: string;
};

export function TripSwitcher({ trips, currentSlug }: TripSwitcherProps) {
  const router = useRouter();

  if (trips.length === 0) return null;

  return (
    <div className="mb-6 -mx-5">
      <div className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-1">
        {trips.map((trip) => {
          const isActive = trip.slug === currentSlug;
          return (
            <motion.button
              key={trip.id}
              onClick={() => router.push(`/trips/${trip.slug}`)}
              whileTap={{ scale: 0.93 }}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                isActive
                  ? "border-white/[0.16] bg-white/[0.09] text-white"
                  : "border-white/[0.07] bg-transparent text-white/45 hover:text-white/65"
              }`}
            >
              <span
                className={`h-[5px] w-[5px] flex-shrink-0 rounded-full ${statusDotClass(trip.status)}`}
              />
              {trip.title}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
