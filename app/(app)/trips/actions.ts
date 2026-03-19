"use server";

import { redirect } from "next/navigation";
import { createTrip, updateTrip, deleteTripById } from "@/lib/trip-mutations";
import { formatTripDates } from "@/lib/trip-status";

export async function createTripAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const travelers = String(formData.get("travelers") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim() || null;

  if (!title || !slug || !startDate) {
    throw new Error("Missing required fields.");
  }

  // Status is computed automatically from dates inside createTrip().
  const dates = formatTripDates(startDate, endDate || null);

  const trip = await createTrip({
    title,
    slug,
    dates,
    startDate,
    endDate: endDate || null,
    travelers,
    destination,
    nextActionTitle: "Add your next action",
    nextActionDescription: "Set the next important step for this trip.",
    weatherSummary: "",
    weatherNote: "",
  });

  redirect(`/trips/${trip.slug}`);
}

/**
 * Updates a trip's title, dates, and travelers.
 * Status is recomputed automatically from the new dates.
 *
 * The trip's slug is unchanged — redirect back to the same trip URL.
 * trip_id and trip_slug are passed as hidden inputs from TripEditForm.
 */
export async function updateTripAction(formData: FormData) {
  const tripId = String(formData.get("trip_id") ?? "").trim();
  const tripSlug = String(formData.get("trip_slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const travelers = String(formData.get("travelers") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim() || null;

  if (!tripId || !tripSlug || !title || !startDate) {
    redirect(`/trips/${tripSlug}/edit?error=${encodeURIComponent("Missing required fields.")}`);
    return;
  }

  try {
    await updateTrip({
      id: tripId,
      title,
      startDate,
      endDate: endDate || null,
      travelers,
      destination,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save trip.";
    console.error("[updateTripAction]", message, err);
    redirect(`/trips/${tripSlug}/edit?error=${encodeURIComponent(message)}`);
    return;
  }

  redirect(`/trips/${tripSlug}`);
}

export async function deleteTripAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Missing trip id.");
  }

  await deleteTripById(id);
  redirect("/");
}
