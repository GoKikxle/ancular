import { createClient } from "@/lib/supabase/server";
import { computeTripStatus, formatTripDates } from "@/lib/trip-status";

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
  /** Human-readable destination, e.g. "Barcelona, Spain". Single source of truth for weather + context. */
  destination?: string | null;
  nextActionTitle: string;
  nextActionDescription: string;
  weatherSummary?: string;
  weatherNote?: string;
};

export type UpdateTripInput = {
  id: string;
  title: string;
  /** ISO date "YYYY-MM-DD" */
  startDate: string;
  /** ISO date "YYYY-MM-DD" — null if open-ended. */
  endDate: string | null;
  travelers: string;
  /** Human-readable destination, e.g. "Barcelona, Spain". */
  destination?: string | null;
};

export async function createTrip(input: CreateTripInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Status is always derived from dates — never accepted from user input.
  const status = computeTripStatus(input.startDate, input.endDate);

  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      slug: input.slug,
      title: input.title,
      dates: input.dates,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      travelers: input.travelers,
      destination: input.destination ?? null,
      status,
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

/**
 * Updates a trip's editable fields and recomputes status from the new dates.
 * The slug is never changed here — redirect back using the original slug.
 */
export async function updateTrip(input: UpdateTripInput) {
  const supabase = await createClient();

  const status = computeTripStatus(input.startDate, input.endDate);
  const dates = formatTripDates(input.startDate, input.endDate);

  const { data, error } = await supabase
    .from("trips")
    .update({
      title: input.title,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      dates,
      status,
      travelers: input.travelers,
      destination: input.destination ?? null,
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    console.error("[updateTrip] Supabase error:", error.message, error.code, error.details);
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
