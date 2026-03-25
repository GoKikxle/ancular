import { createClient } from "@/lib/supabase/server";
import { isCompletedAtSchemaError } from "@/lib/trip-completed-at-guard";

export type UserStats = {
  placesVisited: number;
  countriesVisited: number;
  flights: number;
  restaurants: number;
  daysTraveled: number;
  lastPlace: string | null;
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

const emptyStats: UserStats = {
  placesVisited: 0,
  countriesVisited: 0,
  flights: 0,
  restaurants: 0,
  daysTraveled: 0,
  lastPlace: null,
};

/**
 * Aggregates for trips with `completed_at` set only. Active / incomplete / deleted trips excluded.
 * Timeline counts use title+note heuristics until `action_type` exists on `timeline_items`.
 */
export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return emptyStats;

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
      return emptyStats;
    }
  }

  const trips = (tripsData ?? []) as CompletedTripRow[];
  const tripIds = trips.map((t) => t.id);

  let items: { title: string; note: string }[] = [];
  if (tripIds.length > 0) {
    const { data: itemRows, error: itemsError } = await supabase
      .from("timeline_items")
      .select("title, note")
      .in("trip_id", tripIds);
    if (itemsError) {
      console.error("[getUserStats] timeline_items query:", itemsError.message);
    } else {
      items = (itemRows ?? []) as { title: string; note: string }[];
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
  for (const t of trips) {
    daysTraveled += inclusiveTripDays(t.start_date, t.end_date);
  }

  const lastPlace =
    trips.map((t) => (t.destination || "").trim()).find((d) => d.length > 0) ?? null;

  return {
    placesVisited: placeKeys.size,
    countriesVisited: countryKeys.size,
    flights,
    restaurants,
    daysTraveled,
    lastPlace,
  };
}
