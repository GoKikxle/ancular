"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/profiles";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const display_name = (formData.get("display_name") as string)?.trim() ?? null;
  const avatar_id = (formData.get("avatar_id") as string)?.trim() || null;

  const { error } = await updateProfile(user.id, {
    display_name: display_name || undefined,
    avatar_id: avatar_id || undefined,
  });

  if (error) {
    return { error };
  }

  redirect("/settings");
}
