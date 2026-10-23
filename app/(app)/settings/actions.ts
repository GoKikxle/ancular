"use server";

import { redirect } from "next/navigation";
import { createAdminClient, getUser } from "@/lib/supabase/server";

export type SettingsState = { error?: string; saved?: string } | undefined;

export async function updateProfile(_: SettingsState, form: FormData): Promise<SettingsState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (name.length < 2) return { error: "Add your name." };
  if (!email.includes("@")) return { error: "Add a real email address." };

  const { supabase, user } = await getUser();
  if (!user) return { error: "Sign in again." };

  const { error } = await supabase.auth.updateUser(
    email === user.email
      ? { data: { full_name: name.slice(0, 80) } }
      : { email, data: { full_name: name.slice(0, 80) } }
  );
  if (error) return { error: error.message };

  if (email !== user.email) {
    return { saved: "Name saved. Check your inbox to confirm the new email." };
  }
  return { saved: "Saved." };
}

export async function clearSearchData(_: SettingsState, _form: FormData): Promise<SettingsState> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Sign in again." };
  const { error } = await supabase.rpc("clear_my_search_data");
  if (error) {
    if (error.code === "42883" || /clear_my_search_data/i.test(error.message)) {
      return { error: "That isn't available yet. Try again after the latest database update." };
    }
    return { error: "Could not clear your search data. Try again." };
  }
  return { saved: "Your search results are cleared and consent is withdrawn on every event." };
}

export async function deleteAccount(_: SettingsState, form: FormData): Promise<SettingsState> {
  if (String(form.get("confirm") ?? "").trim().toLowerCase() !== "delete my account") {
    return { error: "Type “delete my account” to confirm." };
  }
  const { user } = await getUser();
  if (!user) return { error: "Sign in again." };

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { error: error.message };
  } catch {
    return { error: "Account deletion isn't set up on this server yet." };
  }

  redirect("/");
}
