import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_id: string | null;
  updated_at: string;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_id, updated_at")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: { display_name?: string; avatar_id?: string }
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const profile = await getProfile(userId);

  if (!profile) {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      display_name: updates.display_name ?? null,
      avatar_id: updates.avatar_id ?? "avatar_1",
    });
    return { error: error?.message ?? null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return { error: error?.message ?? null };
}
