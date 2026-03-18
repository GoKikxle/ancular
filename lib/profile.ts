import { createClient } from "@/lib/supabase/server";
import { getAvatarById } from "./avatars";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Load the current user's profile. Returns null if not found. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    email: (row.email as string | null) ?? user.email ?? null,
    full_name: (row.full_name as string | null) ?? (row.display_name as string | null) ?? null,
    avatar_id: (row.avatar_id as string | null) ?? "avatar_1",
    created_at: (row.created_at as string) ?? new Date().toISOString(),
    updated_at: (row.updated_at as string) ?? new Date().toISOString(),
  } as Profile;
}

/** Create or update profile. Ensures row exists before updating. */
export async function upsertProfile(updates: {
  full_name?: string;
  avatar_id?: string;
  email?: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await getCurrentProfile();

  if (!existing) {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: updates.email ?? user.email ?? null,
      full_name: updates.full_name ?? null,
      avatar_id: updates.avatar_id ?? "avatar_1",
    });

    if (error) {
      console.error("[profiles] INSERT response:", { error, userId: user.id });
      return { error: error.message };
    }
    return { error: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(updates.full_name !== undefined && { full_name: updates.full_name }),
      ...(updates.avatar_id !== undefined && { avatar_id: updates.avatar_id }),
      ...(updates.email !== undefined && { email: updates.email }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[profiles] UPDATE response:", { error, userId: user.id });
    return { error: error.message };
  }
  return { error: null };
}

/** Get avatar info for display. Re-export for convenience. */
export { getAvatarById } from "./avatars";
