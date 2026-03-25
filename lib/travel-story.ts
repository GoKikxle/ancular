import type { UserStats } from "@/lib/stats";

export type TravelStoryStats = Pick<
  UserStats,
  "completedTripCount" | "countriesVisited" | "placesVisited" | "daysTraveled" | "completedTripsThisYear"
>;

/**
 * One-line narrative for the Stats “Travel Story” card — derived only from passed stats.
 */
export function getTravelStory(stats: TravelStoryStats): string {
  const {
    completedTripCount,
    countriesVisited,
    placesVisited,
    daysTraveled,
    completedTripsThisYear,
  } = stats;

  if (completedTripCount === 0) {
    return "Complete your first trip to start your travel story.";
  }

  if (countriesVisited >= 2 && daysTraveled >= 5) {
    return `You’ve explored ${countriesVisited} countries and spent ${daysTraveled} days on the move this year.`;
  }

  if (completedTripsThisYear >= 2) {
    return `You’ve been on the move — ${completedTripsThisYear} trips and counting.`;
  }

  return `Your journey is just getting started — ${placesVisited} places so far.`;
}
