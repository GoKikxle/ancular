"use server";

import { redirect } from "next/navigation";
import { createTrip, deleteTripById } from "@/lib/trip-mutations";

/**
 * Formats two "YYYY-MM-DD" date strings into a human-readable range like
 * "Jun 10 → Jun 17, 2025". Used to populate the `dates` display column on trips.
 *
 * Parsing is done in local-time noon to avoid any UTC midnight timezone shifts
 * that can cause off-by-one-day errors with `new Date("YYYY-MM-DD")`.
 */
function formatTripDates(start: string, end: string): string {
  const parse = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  };

  const startFmt = parse(start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (!end) return startFmt;

  const endFmt = parse(end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFmt} → ${endFmt}`;
}

export async function createTripAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const travelers = String(formData.get("travelers") ?? "").trim();
  const status = String(formData.get("status") ?? "Upcoming").trim() as
    | "Active"
    | "Upcoming"
    | "Past";

  if (!title || !slug || !startDate || !travelers) {
    throw new Error("Missing required fields.");
  }

  // Format start/end dates into the human-readable `dates` column value.
  const dates = formatTripDates(startDate, endDate);

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