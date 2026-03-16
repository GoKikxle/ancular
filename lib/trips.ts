import { createClient } from "@/lib/supabase/server";

export type DbTrip = {
  id: string;
  slug: string;
  title: string;
  dates: string;
  travelers: string;
  status: "Active" | "Upcoming" | "Past";
  next_action_title: string;
  next_action_description: string;
  weather_summary: string | null;
  weather_note: string | null;
  /** ISO date "YYYY-MM-DD". Populated by createTrip; NULL for legacy trips. */
  start_date: string | null;
  /** ISO date "YYYY-MM-DD". NULL if return date is unknown or trip is one-way. */
  end_date: string | null;
  created_at: string;
};

export async function getTrips() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as DbTrip[];
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