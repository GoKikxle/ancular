"use client";

import { ActiveTripCard, UpcomingTripRow } from "@/components/trips/TripListCards";
import type { DbTrip } from "@/lib/trips";

type Props = {
  featured: DbTrip | null;
  upcoming: DbTrip[];
};

export function HomeTripCardsBlock({ featured, upcoming }: Props) {
  return (
    <div className="flex flex-col gap-[10px]">
      {featured ? <ActiveTripCard trip={featured} /> : null}
      {upcoming.map((trip) => (
        <UpcomingTripRow key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
