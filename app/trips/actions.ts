"use server";

import { redirect } from "next/navigation";
import { createTrip, deleteTripById } from "@/lib/trip-mutations";

export async function createTripAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const dates = String(formData.get("dates") ?? "").trim();
  const travelers = String(formData.get("travelers") ?? "").trim();
  const status = String(formData.get("status") ?? "Upcoming").trim() as
    | "Active"
    | "Upcoming"
    | "Past";

  if (!title || !slug || !dates || !travelers) {
    throw new Error("Missing required fields.");
  }

  const trip = await createTrip({
    title,
    slug,
    dates,
    travelers,
    status,
    nextActionTitle: "Add your next action",
    nextActionDescription: "Set the next important step for this trip.",
    weatherSummary: "",
    weatherNote: "",
  });

  redirect(`/trips/${trip.slug}`);
}

export async function deleteTripAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("Missing trip id.");
  }

  await deleteTripById(id);
  redirect("/");
}