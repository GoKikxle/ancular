"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addTrip, deleteTrip } from "@/lib/trips-store";
import type { Trip } from "@/types/trip";

export async function createTrip(formData: FormData) {
  const title = (formData.get("title") as string).trim();
  const slug = (formData.get("slug") as string).trim();
  const dates = (formData.get("dates") as string).trim();
  const travelers = (formData.get("travelers") as string).trim();
  const status = (formData.get("status") as string).trim();

  if (!title || !slug) return;

  // TODO: Replace with Supabase insert:
  // const { error } = await supabase.from("trips").insert({ title, slug, dates, travelers, status, ... });
  const newTrip: Trip = {
    id: Date.now().toString(),
    slug,
    title,
    dates,
    travelers,
    status,
    nextActionTitle: "",
    nextActionDescription: "",
    weatherSummary: "",
    weatherNote: "",
    nearby: [],
    timeline: [],
  };

  addTrip(newTrip);
  revalidatePath("/");
  redirect(`/trips/${slug}`);
}

export async function deleteTripById(id: string) {
  // TODO: Replace with Supabase delete:
  // await supabase.from("trips").delete().eq("id", id);
  deleteTrip(id);
  revalidatePath("/");
  redirect("/");
}
