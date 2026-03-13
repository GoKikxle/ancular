import { createClient } from "@/lib/supabase/server";

type CreateTripInput = {
  slug: string;
  title: string;
  dates: string;
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