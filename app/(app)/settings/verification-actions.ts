"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";

export type VerificationState = { error?: string; sent?: boolean } | undefined;

/** Organiser asks to be verified. The database checks the email is on the website's domain. */
export async function requestVerification(_: VerificationState, form: FormData): Promise<VerificationState> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Sign in again to continue." };
  const { error } = await supabase.rpc("request_verification", {
    p_name: String(form.get("org_name") ?? ""),
    p_website: String(form.get("website") ?? ""),
    p_email: String(form.get("contact_email") ?? ""),
  });
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { sent: true };
}
