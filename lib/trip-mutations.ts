import { createClient } from "@/lib/supabase/server";

type CreateTripInput = {
  slug: string;
  title: string;
  /** Human-readable display string, e.g. "Jun 10 → Jun 17, 2025". */
  dates: string;
  /** ISO date "YYYY-MM-DD" — stored in the structured start_date column. */
  startDate: string;
  /** ISO date "YYYY-MM-DD" — stored in the structured end_date column. Null if open-ended. */
  endDate: string | null;
  travelers: string;
  status: "Active" | "Upcoming" | "Past";
  nextActionTitle: string;
  nextActionDescription: string;
  weatherSummary?: string;
  weatherNote?: string;
};

export async function createTrip(input: CreateTripInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .insert({
      slug: input.slug,
      title: input.title,
      dates: input.dates,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      travelers: input.travelers,
      status: input.status,
      next_action_title: input.nextActionTitle,
      next_action_description: input.nextActionDescription,
      weather_summary: input.weatherSummary ?? null,
      weather_note: input.weatherNote ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTripById(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("trips").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}