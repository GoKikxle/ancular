import { createClient } from "@/lib/supabase/server";
import { computeTripStatus } from "@/lib/trip-status";

export type DbTrip = {
  id: string;
  slug: string;
  title: string;
  dates: string;
  travelers: string;
  status: "Active" | "Upcoming" | "Past";
  /**
   * Human-readable destination, e.g. "Barcelona, Spain".
   * Used as the single source of truth for weather and trip context.
   * Requires: ALTER TABLE trips ADD COLUMN IF NOT EXISTS destination TEXT NULL;
   */
  destination?: string | null;
  next_action_title: string;
  next_action_description: string;
  weather_summary: string | null;
  weather_note: string | null;
  /** ISO date "YYYY-MM-DD". Populated by createTrip; NULL for legacy trips. */
  start_date: string | null;
  /** ISO date "YYYY-MM-DD". NULL if return date is unknown or trip is one-way. */
  end_date: string | null;
  created_at: string;
  /** Set when the user marks the trip completed; null/undefined = active list, excluded from Stats. */
  completed_at?: string | null;
};

/** All trips (e.g. document attach picker). */
export async function getAllTrips() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as DbTrip[];
}

/** Default Trips list: not yet completed. */
export async function getIncompleteTrips() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .is("completed_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as DbTrip[];
}

/** Archived: user-marked completed trips. */
export async function getArchivedTrips() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as DbTrip[];
}

/**
 * Trips that are current or upcoming (not past) — for the home dashboard only.
 * Uses date-based status when `start_date` exists; otherwise falls back to stored `status`.
 */
export async function getActiveTripsForHome(): Promise<DbTrip[]> {
  const all = await getIncompleteTrips();
  const active = all.filter((t) => {
    if (t.start_date) {
      const s = computeTripStatus(t.start_date, t.end_date ?? null);
      return s === "Active" || s === "Upcoming";
    }
    return t.status === "Active" || t.status === "Upcoming";
  });
  active.sort((a, b) => {
    const da = a.start_date ?? "";
    const db = b.start_date ?? "";
    if (da && db) return da.localeCompare(db);
    return 0;
  });
  return active;
}

export async function getTripBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;

  return data as DbTrip;
}

/** Returns slugs for the given trip IDs. Used when revalidating trip pages after document delete. */
export async function getSlugsForTripIds(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("slug")
    .in("id", ids);
  if (error) return [];
  return (data ?? []).map((r) => r.slug);
}