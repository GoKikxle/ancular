"use server";

import { createClient } from "@/lib/supabase/server";

export type WaitlistState = { error?: string; done?: boolean } | undefined;

const ROLES = ["photographer", "church", "other"] as const;

export async function joinWaitlist(_: WaitlistState, form: FormData): Promise<WaitlistState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const role = String(form.get("role") ?? "");
  const note = String(form.get("note") ?? "").trim();

  if (name.length < 2) return { error: "Add your name." };
  if (!email.includes("@") || email.length < 3) return { error: "Add a real email address." };
  if (!ROLES.includes(role as (typeof ROLES)[number])) return { error: "Choose what you do." };

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({
    name: name.slice(0, 80),
    email: email.slice(0, 200),
    role,
    note: note ? note.slice(0, 500) : null,
  });

  if (error) {
    if (error.code === "42P01" || /waitlist/i.test(error.message)) {
      return { error: "The waitlist isn't open yet. Try again shortly." };
    }
    return { error: "Could not save that. Try again." };
  }
  return { done: true };
}
