import type { SupabaseClient } from "@supabase/supabase-js";

export type OrgProfile = {
  org_name: string | null;
  website: string | null;
  logo_path: string | null;
  brand_color: string | null;
  banner_dismissed_at: string | null;
};

export type MyVerification = {
  org_name: string;
  website_domain: string;
  contact_email: string;
  status: "pending" | "approved" | "declined";
  requested_at: string;
  decided_at: string | null;
} | null;

export type ProfileSteps = {
  details: boolean;
  logo: boolean;
  verification: boolean;
  done: number;
  total: number;
};

export async function loadOrgProfile(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: v }] = await Promise.all([
    supabase
      .from("organisation_profiles")
      .select("org_name, website, logo_path, brand_color, banner_dismissed_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.rpc("my_verification"),
  ]);
  const verification = ((v as MyVerification[] | null)?.[0] ?? null) as MyVerification;
  const p = (profile ?? null) as OrgProfile | null;
  const steps = {
    details: !!(p?.org_name && p?.website),
    logo: !!p?.logo_path,
    verification: verification?.status === "pending" || verification?.status === "approved",
  };
  const done = Object.values(steps).filter(Boolean).length;
  return { profile: p, verification, steps: { ...steps, done, total: 3 } as ProfileSteps };
}
