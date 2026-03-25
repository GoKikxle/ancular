import { createClient } from "@/lib/supabase/server";
import { isCompletedAtSchemaError } from "@/lib/trip-completed-at-guard";
import type { YearlyTravelStoryStats } from "@/lib/yearly-travel-story";

export type { YearlyTravelStoryStats } from "@/lib/yearly-travel-story";

export type UserStats = {
  placesVisited: number;
  countriesVisited: number;
  flights: number;
  restaurants: number;
  daysTraveled: number;
  lastPlace: string | null;
  /** Rich context for UI — all derived from completed trips only */
  completedTripCount: number;
  completedTripsThisYear: number;
  completedTripsLastYear: number;
  placesVisitedThisYear: number;
  /** City-style label from earliest completed trip (by completion date) */
  firstPlaceVisited: string | null;
  favoritePlaceVisited: string | null;
  favoritePlaceTripCount: number;
  averageTripLengthDays: number;
  longestTripDays: number;
  /** Completed trips in the current calendar year only */
  yearlyTravel: YearlyTravelStoryStats;
};

type CompletedTripRow = {
  id: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  completed_at: string | null;
};

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function completedOnOrAfter(iso: string | null, ymd: string): boolean {
  if (!iso) return false;
  const d = iso.slice(0, 10);
  return d >= ymd;
}

function completedBefore(iso: string | null, ymd: string): boolean {
  if (!iso) return false;
  const d = iso.slice(0, 10);
  return d < ymd;
}

/** City / primary place: segment before first comma, else full string. */
function placeKeyFromDestination(dest: string): string | null {
  const t = dest.trim();
  if (!t) return null;
  const first = t.split(",")[0]?.trim() ?? t;
  return first || null;
}

/** Country-ish segment: last comma-separated part, or whole string if single token. */
function countryKeyFromDestination(dest: string): string | null {
  const t = dest.trim();
  if (!t) return null;
  const parts = t.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1] ?? null;
  return t;
}

function toDisplayPlace(dest: string): string {
  const pk = placeKeyFromDestination(dest);
  if (!pk) return dest.trim();
  return pk.replace(/\b\w/g, (c) => c.toUpperCase());
}

function inclusiveTripDays(startDate: string | null, endDate: string | null): number {
  if (!startDate) return 0;
  const start = parseLocalDate(startDate);
  const end = endDate ? parseLocalDate(endDate) : start;
  const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, diffDays) + 1;
}

/** Flight vs restaurant from timeline text (action_type not stored in DB yet). */
function timelineItemCategory(title: string, note: string): "flight" | "restaurant" | null {
  const text = `${(title || "").toLowerCase()} ${(note || "").toLowerCase()}`;
  if (
    /\bflight\b|airport|boarding|departure|arrival|e-ticket|layover|\bgate\b|\bterminal\b|check-?in|baggage claim/.test(
      text
    )
  ) {
    return "flight";
  }
  if (
    /\brestaurant\b|dinner|lunch|breakfast|brunch|reservation|bistro|café|cafe|dining|food tour|tapas|sushi|pizza|\bbar\b|eatery|\bmeal\b|cuisine|omakase/.test(
      text
    )
  ) {
    return "restaurant";
  }
  return null;
}

function emptyYearlyTravel(year: number): YearlyTravelStoryStats {
  return {
    year,
    tripsCompleted: 0,
    countriesVisited: 0,
    placesVisited: 0,
    daysTraveled: 0,
    flights: 0,
    restaurants: 0,
    favoriteDestination: null,
    lastPlaceVisited: null,
  };
}

function emptyStatsForYear(year: number): UserStats {
  return {
    placesVisited: 0,
    countriesVisited: 0,
    flights: 0,
    restaurants: 0,
    daysTraveled: 0,
    lastPlace: null,
    completedTripCount: 0,
    completedTripsThisYear: 0,
    completedTripsLastYear: 0,
    placesVisitedThisYear: 0,
    firstPlaceVisited: null,
    favoritePlaceVisited: null,
    favoritePlaceTripCount: 0,
    averageTripLengthDays: 0,
    longestTripDays: 0,
    yearlyTravel: emptyYearlyTravel(year),
  };
}

/**
 * Aggregates for trips with `completed_at` set only. Active / incomplete / deleted trips excluded.
 * Timeline counts use title+note heuristics until `action_type` exists on `timeline_items`.
 */
export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const statsYear = new Date().getFullYear();
  if (!user) return emptyStatsForYear(statsYear);

  let { data: tripsData, error: tripsError } = await supabase
    .from("trips")
    .select("id, destination, start_date, end_date, completed_at")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (tripsError) {
    if (isCompletedAtSchemaError(tripsError)) {
      tripsData = [];
    } else {
      console.error("[getUserStats] trips query:", tripsError.message);
      return emptyStatsForYear(statsYear);
    }
  }

  const trips = (tripsData ?? []) as CompletedTripRow[];
  const tripIds = trips.map((t) => t.id);
  const year = statsYear;
  const jan1 = `${year}-01-01`;
  const jan1Next = `${year + 1}-01-01`;
  const jan1Last = `${year - 1}-01-01`;

  let items: { trip_id: string; title: string; note: string }[] = [];
  if (tripIds.length > 0) {
    const { data: itemRows, error: itemsError } = await supabase
      .from("timeline_items")
      .select("trip_id, title, note")
      .in("trip_id", tripIds);
    if (itemsError) {
      console.error("[getUserStats] timeline_items query:", itemsError.message);
    } else {
      items = (itemRows ?? []) as { trip_id: string; title: string; note: string }[];
    }
  }

  const placeKeys = new Set<string>();
  const countryKeys = new Set<string>();

  for (const t of trips) {
    const dest = (t.destination || "").trim();
    if (!dest) continue;
    const pk = placeKeyFromDestination(dest);
    if (pk) placeKeys.add(pk.toLowerCase());
    const ck = countryKeyFromDestination(dest);
    if (ck) countryKeys.add(ck.toLowerCase());
  }

  let flights = 0;
  let restaurants = 0;
  for (const item of items) {
    const cat = timelineItemCategory(item.title, item.note);
    if (cat === "flight") flights++;
    if (cat === "restaurant") restaurants++;
  }

  let daysTraveled = 0;
  let longestTripDays = 0;
  for (const t of trips) {
    const d = inclusiveTripDays(t.start_date, t.end_date);
    daysTraveled += d;
    longestTripDays = Math.max(longestTripDays, d);
  }

  const lastPlace =
    trips.map((t) => (t.destination || "").trim()).find((d) => d.length > 0) ?? null;

  const completedTripCount = trips.length;
  const completedTripsThisYear = trips.filter(
    (t) => completedOnOrAfter(t.completed_at, jan1) && completedBefore(t.completed_at, jan1Next)
  ).length;
  const completedTripsLastYear = trips.filter(
    (t) => completedOnOrAfter(t.completed_at, jan1Last) && completedBefore(t.completed_at, jan1)
  ).length;

  const tripsThisYear = trips.filter(
    (t) => completedOnOrAfter(t.completed_at, jan1) && completedBefore(t.completed_at, jan1Next)
  );
  const placesThisYear = new Set<string>();
  for (const t of tripsThisYear) {
    const dest = (t.destination || "").trim();
    const pk = placeKeyFromDestination(dest);
    if (pk) placesThisYear.add(pk.toLowerCase());
  }
  const placesVisitedThisYear = placesThisYear.size;

  const countriesThisYear = new Set<string>();
  let daysTraveledThisYear = 0;
  for (const t of tripsThisYear) {
    const dest = (t.destination || "").trim();
    const ck = countryKeyFromDestination(dest);
    if (ck) countriesThisYear.add(ck.toLowerCase());
    daysTraveledThisYear += inclusiveTripDays(t.start_date, t.end_date);
  }
  const countriesVisitedThisYear = countriesThisYear.size;

  const thisYearTripIdSet = new Set(tripsThisYear.map((t) => t.id));
  let flightsThisYear = 0;
  let restaurantsThisYear = 0;
  for (const item of items) {
    if (!thisYearTripIdSet.has(item.trip_id)) continue;
    const cat = timelineItemCategory(item.title, item.note);
    if (cat === "flight") flightsThisYear++;
    if (cat === "restaurant") restaurantsThisYear++;
  }

  const placeTripCountsYear = new Map<string, number>();
  const lastCompletedByPlaceYear = new Map<string, string>();
  for (const t of tripsThisYear) {
    const dest = (t.destination || "").trim();
    const pk = placeKeyFromDestination(dest);
    if (!pk) continue;
    const k = pk.toLowerCase();
    placeTripCountsYear.set(k, (placeTripCountsYear.get(k) ?? 0) + 1);
    const c = t.completed_at ?? "";
    if (c > (lastCompletedByPlaceYear.get(k) ?? "")) lastCompletedByPlaceYear.set(k, c);
  }

  let favoriteDestinationThisYear: string | null = null;
  let favoriteYearCount = 0;
  let favoriteYearTie = "";
  for (const [k, n] of placeTripCountsYear) {
    const lastC = lastCompletedByPlaceYear.get(k) ?? "";
    if (n > favoriteYearCount || (n === favoriteYearCount && lastC > favoriteYearTie)) {
      favoriteYearCount = n;
      favoriteYearTie = lastC;
      const sample = tripsThisYear.find(
        (t) => placeKeyFromDestination((t.destination || "").trim())?.toLowerCase() === k
      );
      favoriteDestinationThisYear = sample?.destination
        ? toDisplayPlace(sample.destination)
        : null;
    }
  }

  const tripsThisYearNewest = [...tripsThisYear].sort((a, b) =>
    (b.completed_at ?? "").localeCompare(a.completed_at ?? "")
  );
  const lastPlaceVisitedThisYear =
    tripsThisYearNewest.map((t) => (t.destination || "").trim()).find((d) => d.length > 0) ?? null;

  const yearlyTravel: YearlyTravelStoryStats = {
    year,
    tripsCompleted: tripsThisYear.length,
    countriesVisited: countriesVisitedThisYear,
    placesVisited: placesVisitedThisYear,
    daysTraveled: daysTraveledThisYear,
    flights: flightsThisYear,
    restaurants: restaurantsThisYear,
    favoriteDestination: favoriteDestinationThisYear,
    lastPlaceVisited: lastPlaceVisitedThisYear,
  };

  const chronological = [...trips].sort((a, b) => {
    const ca = a.completed_at ?? "";
    const cb = b.completed_at ?? "";
    return ca.localeCompare(cb);
  });
  let firstPlaceVisited: string | null = null;
  for (const t of chronological) {
    const dest = (t.destination || "").trim();
    if (dest) {
      firstPlaceVisited = toDisplayPlace(dest);
      break;
    }
  }

  const placeTripCounts = new Map<string, number>();
  const lastCompletedByPlace = new Map<string, string>();
  for (const t of trips) {
    const dest = (t.destination || "").trim();
    const pk = placeKeyFromDestination(dest);
    if (!pk) continue;
    const k = pk.toLowerCase();
    placeTripCounts.set(k, (placeTripCounts.get(k) ?? 0) + 1);
    const c = t.completed_at ?? "";
    if (c > (lastCompletedByPlace.get(k) ?? "")) lastCompletedByPlace.set(k, c);
  }

  let favoritePlaceVisited: string | null = null;
  let favoritePlaceTripCount = 0;
  let favoriteTieDate = "";
  for (const [k, n] of placeTripCounts) {
    const lastC = lastCompletedByPlace.get(k) ?? "";
    if (n > favoritePlaceTripCount || (n === favoritePlaceTripCount && lastC > favoriteTieDate)) {
      favoritePlaceTripCount = n;
      favoriteTieDate = lastC;
      const sample = trips.find(
        (t) => placeKeyFromDestination((t.destination || "").trim())?.toLowerCase() === k
      );
      favoritePlaceVisited = sample?.destination
        ? toDisplayPlace(sample.destination)
        : null;
    }
  }

  const averageTripLengthDays =
    trips.length > 0 ? Math.round(daysTraveled / trips.length) : 0;

  return {
    placesVisited: placeKeys.size,
    countriesVisited: countryKeys.size,
    flights,
    restaurants,
    daysTraveled,
    lastPlace,
    completedTripCount,
    completedTripsThisYear,
    completedTripsLastYear,
    placesVisitedThisYear,
    firstPlaceVisited,
    favoritePlaceVisited,
    favoritePlaceTripCount,
    averageTripLengthDays,
    longestTripDays,
    yearlyTravel,
  };
}
