"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { createAdminClient, getUser } from "@/lib/supabase/server";

export type VerifyState = { error?: string; done?: string } | undefined;

async function requireAdmin() {
  const { user } = await getUser();
  return !!user && isAdmin(user.email);
}

/** Mark an organiser's name and email as checked by Ancular. */
export async function verifyOrganiser(_: VerifyState, form: FormData): Promise<VerifyState> {
  if (!(await requireAdmin())) return { error: "Only Ancular admins can do this." };
  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();
  if (!email.includes("@")) return { error: "Enter the email they signed up with." };
  if (name.length < 2) return { error: "Enter the name guests should see, for example CCI Manchester." };
  const { error } = await createAdminClient().rpc("admin_verify_organiser", {
    p_email: email,
    p_name: name,
    p_note: note || null,
  });
  if (error) return { error: error.message.replace(/^.*?:\s*/, "") };
  revalidatePath("/admin");
  return { done: `${name} is verified.` };
}

/** Take the badge away. */
export async function unverifyOrganiser(userId: string) {
  if (!(await requireAdmin())) return;
  await createAdminClient().from("organiser_verifications").delete().eq("user_id", userId);
  revalidatePath("/admin");
}
