import { createClient } from "@/lib/supabase/server";
import { getAvatarById } from "./avatars";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_id: string | null;
  created_at: string;
  updated_at: string;
  /** Unread notifications count. Mock for now; real notifications plug in later. */
  notifications_unread_count?: number;
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
    notifications_unread_count: (row.notifications_unread_count as number | undefined) ?? 0,
  } as Profile;
}

/** Create or update profile. */
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

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: updates.full_name ?? null,
    avatar_id: updates.avatar_id ?? "avatar_1",
    updated_at: new Date().toISOString(),
  };
  console.log("[profiles] upsert payload:", payload);

  const upsertPromise = supabase.from("profiles").upsert(payload, { onConflict: "id" });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Profile save timed out after 10 seconds")), 10_000)
  );

  try {
    const result = await Promise.race([upsertPromise, timeoutPromise]);
    if (result.error) {
      console.error("[profiles] Supabase error:", result.error);
      return { error: result.error.message };
    }
    return { error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Profile save failed";
    if (msg.includes("timed out")) console.error("[profiles]", msg);
    return { error: msg };
  }
}

/** Get avatar info for display. Re-export for convenience. */
export { getAvatarById } from "./avatars";
