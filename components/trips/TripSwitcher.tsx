"use client";

import { useRouter } from "next/navigation";
import type { Trip } from "@/types/trip";

type TripSwitcherProps = {
  trips: Trip[];
  currentSlug?: string;
};

export function TripSwitcher({ trips, currentSlug }: TripSwitcherProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    if (slug) router.push(`/trips/${slug}`);
  }

  return (
    <div className="mb-6">
      <select
        defaultValue={currentSlug ?? ""}
        onChange={handleChange}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20"
      >
        <option value="" disabled className="bg-neutral-900 text-white/50">
          Jump to trip...
        </option>
        {trips.map((trip) => (
          <option key={trip.id} value={trip.slug} className="bg-neutral-900 text-white">
            {trip.title} · {trip.status}
          </option>
        ))}
      </select>
    </div>
  );
}
