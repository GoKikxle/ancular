export type YearlyTravelStoryStats = {
  year: number;
  tripsCompleted: number;
  countriesVisited: number;
  placesVisited: number;
  daysTraveled: number;
  flights: number;
  restaurants: number;
  favoriteDestination: string | null;
  lastPlaceVisited: string | null;
};

/**
 * Narrative line for “Your {year} Travel Story” — uses only current-year completed-trip aggregates.
 */
export function buildYearlyTravelNarrative(stats: YearlyTravelStoryStats): string {
  const {
    tripsCompleted,
    countriesVisited,
    placesVisited,
    daysTraveled,
  } = stats;

  if (tripsCompleted === 0) {
    return "No completed trips yet this year — your next journey will start the story.";
  }

  const tripWord = tripsCompleted === 1 ? "trip" : "trips";
  const countryWord = countriesVisited === 1 ? "country" : "countries";

  const caseA =
    tripsCompleted >= 3 ||
    (countriesVisited >= 2 && daysTraveled >= 10);

  if (caseA) {
    return `You completed ${tripsCompleted} ${tripWord}, explored ${countriesVisited} ${countryWord}, and spent ${daysTraveled} days on the move.`;
  }

  if (!caseA && tripsCompleted >= 1 && placesVisited >= 2) {
    return `You’ve been steadily exploring — ${tripsCompleted} ${tripWord}, ${placesVisited} places, and plenty of movement this year.`;
  }

  if (tripsCompleted === 1) {
    return `You completed 1 trip this year — ${daysTraveled} days on the move${countriesVisited > 0 ? ` across ${countriesVisited} ${countryWord}` : ""}.`;
  }

  return `You completed ${tripsCompleted} ${tripWord} this year and spent ${daysTraveled} days exploring.`;
}
