"use server";

import { redirect } from "next/navigation";
import { upsertProfile } from "@/lib/profile";

export async function updateProfileAction(formData: FormData) {
  const full_name = (formData.get("full_name") as string)?.trim() ?? null;
  const avatar_id = (formData.get("avatar_id") as string)?.trim() || null;

  const { error } = await upsertProfile({
    full_name: full_name || undefined,
    avatar_id: avatar_id || undefined,
  });

  if (error) {
    return { error };
  }

  redirect("/settings");
}
