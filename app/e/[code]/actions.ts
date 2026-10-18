"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";

export type JoinState = { error?: string } | undefined;

export async function joinEvent(code: string, _: JoinState, form: FormData): Promise<JoinState> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Sign in first." };
  const name = String(form.get("display_name") ?? "").trim();
  if (name.length < 2) return { error: "Add your name so the host knows who you are." };

  const { error } = await supabase.rpc("join_event", { p_code: code, p_display_name: name });
  if (error) return { error: error.message };
  revalidatePath(`/e/${code}`);
}
