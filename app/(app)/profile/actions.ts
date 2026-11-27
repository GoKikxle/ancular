"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";

export type ProfileState = { error?: string; saved?: boolean } | undefined;

function cleanWebsite(raw: string) {
  const v = raw.trim().toLowerCase().replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").replace(/[/?#].*$/, "");
  return v;
}

/** Save the organisation's name, website, logo and colour. */
export async function saveOrgProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Sign in again to save." };

  const name = String(form.get("org_name") ?? "").trim().slice(0, 120) || null;
  const websiteRaw = String(form.get("website") ?? "");
  const website = websiteRaw.trim() ? cleanWebsite(websiteRaw) : null;
  if (website && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(website)) {
    return { error: "Enter your website like yourorganisation.org" };
  }
  const logo = String(form.get("logo_path") ?? "").trim() || null;
  if (logo && !logo.startsWith(`org/${user.id}/`)) return { error: "That logo didn't upload properly. Try again." };
  const colorRaw = String(form.get("brand_color") ?? "").trim();
  const color = form.get("use_color") === "on" && /^#[0-9a-fA-F]{6}$/.test(colorRaw) ? colorRaw : null;

  const { error } = await supabase.from("organisation_profiles").upsert({
    user_id: user.id,
    org_name: name,
    website,
    logo_path: logo,
    brand_color: color,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Could not save. Try again." };
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { saved: true };
}

/** "Not now" on the dashboard banner. */
export async function dismissProfileBanner() {
  const { supabase, user } = await getUser();
  if (!user) return;
  await supabase
    .from("organisation_profiles")
    .upsert({ user_id: user.id, banner_dismissed_at: new Date().toISOString() }, { onConflict: "user_id" });
  revalidatePath("/dashboard");
}
