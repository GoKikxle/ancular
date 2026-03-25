import { createClient } from "@/lib/supabase/server";

export type UserStats = {
  placesVisited: number;
  flights: number;
  milesTraveled: number | null;
  timeTraveled: string | null;
  restaurantsDiscovered: number;
};

function inferActionType(title: string, note: string): string | null {
  const text = `${(title || "").toLowerCase()} ${(note || "").toLowerCase()}`;
  if (/\bflight\b|airport|boarding|departure|arrival|e-ticket/.test(text)) return "flight";
  if (/\brestaurant\b|dinner|lunch|breakfast|reservation|bistro|café|dining/.test(text)) return "restaurant";
  return null;
}

export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      placesVisited: 0,
      flights: 0,
      milesTraveled: null,
      timeTraveled: null,
      restaurantsDiscovered: 0,
    };
  }

  const { data: tripsData } = await supabase
    .from("trips")
    .select("id, destination, start_date, end_date")
    .not("completed_at", "is", null)
    .order("created_at", { ascending: false });

  const trips = (tripsData ?? []) as { id: string; destination: string | null; start_date: string | null; end_date: string | null }[];
  const tripIds = trips.map((t) => t.id);

  let items: { title: string; note: string }[] = [];
  if (tripIds.length > 0) {
    const { data } = await supabase
      .from("timeline_items")
      .select("title, note")
      .in("trip_id", tripIds);
    items = (data ?? []) as { title: string; note: string }[];
  }

  const destinations = new Set(
    trips.map((t) => (t.destination || "").trim()).filter(Boolean)
  );
  const placesVisited = destinations.size;

  let flights = 0;
  let restaurantsDiscovered = 0;
  for (const item of items) {
    const type = inferActionType(item.title, item.note);
    if (type === "flight") flights++;
    if (type === "restaurant") restaurantsDiscovered++;
  }

  let timeTraveled: string | null = null;
  if (trips.length > 0) {
    const dates: number[] = [];
    for (const t of trips) {
      if (t.start_date) {
        const start = new Date(t.start_date).getTime();
        const end = t.end_date ? new Date(t.end_date).getTime() : start;
        dates.push(Math.max(0, Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1));
      }
    }
    if (dates.length > 0) {
      const totalDays = dates.reduce((a, b) => a + b, 0);
      if (totalDays >= 365) {
        timeTraveled = `${Math.floor(totalDays / 365)} year${Math.floor(totalDays / 365) !== 1 ? "s" : ""}`;
      } else if (totalDays >= 30) {
        timeTraveled = `${Math.floor(totalDays / 30)} month${Math.floor(totalDays / 30) !== 1 ? "s" : ""}`;
      } else {
        timeTraveled = `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
      }
    }
  }

  return {
    placesVisited,
    flights,
    milesTraveled: null,
    timeTraveled,
    restaurantsDiscovered,
  };
}
