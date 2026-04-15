import type { DbTrip } from "@/lib/trips";
import { computeTripStatus } from "@/lib/trip-status";

/** Date-based or stored status for trips shown on Home / active lists. */
export function homeTripKind(t: DbTrip): "Active" | "Upcoming" {
  if (t.start_date) {
    const s = computeTripStatus(t.start_date, t.end_date ?? null);
    if (s === "Past") return "Upcoming";
    return s;
  }
  return t.status === "Active" ? "Active" : "Upcoming";
}

/**
 * First in-list trip that is currently Active becomes the featured card;
 * all others (including additional Active, if any) render as upcoming strips.
 */
export function splitFeaturedAndUpcomingTrips(trips: DbTrip[]): {
  featured: DbTrip | null;
  upcoming: DbTrip[];
} {
  const idx = trips.findIndex((t) => homeTripKind(t) === "Active");
  if (idx === -1) return { featured: null, upcoming: trips };
  return {
    featured: trips[idx]!,
    upcoming: [...trips.slice(0, idx), ...trips.slice(idx + 1)],
  };
}
