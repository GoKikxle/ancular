"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { createAdminClient, getUser } from "@/lib/supabase/server";

async function requireAdmin() {
  const { user } = await getUser();
  return !!user && isAdmin(user.email);
}

/** Approve or decline an organisation's verification request. */
export async function decideVerification(
  userId: string,
  decision: "approved" | "declined",
  note: string
): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Only Ancular admins can do this." };
  const { error } = await createAdminClient()
    .from("organiser_verifications")
    .update({ status: decision, decided_at: new Date().toISOString(), note: note.trim() || null })
    .eq("user_id", userId);
  if (error) {
    return {
      error: error.message.includes("name_lock")
        ? "Another organisation is already verified with this name."
        : error.message,
    };
  }
  revalidatePath("/admin");
  return {};
}

/** Take a badge away. The organiser can ask again. */
export async function removeVerification(userId: string) {
  if (!(await requireAdmin())) return;
  await createAdminClient()
    .from("organiser_verifications")
    .update({ status: "declined", decided_at: new Date().toISOString() })
    .eq("user_id", userId);
  revalidatePath("/admin");
}
