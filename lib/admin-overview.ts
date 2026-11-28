import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export type Daily = { day: string; signups: number; events: number; photos: number; searches: number; views: number; visits: number };
export type Overview = {
  generated_at: string;
  totals: Record<
    | "users" | "users_confirmed" | "users_7d" | "events" | "events_active" | "events_7d" | "hosts" | "photos" | "photos_7d"
    | "guests" | "guests_pending" | "consents" | "searches" | "searches_7d" | "searchers" | "searches_found" | "photos_found"
    | "views_7d" | "visits_7d",
    number
  >;
  daily: Daily[];
  top_pages: { path: string; views: number }[];
  referrers: { source: string; visits: number }[];
  countries: { country: string; visits: number }[];
  recent_events: {
    name: string; kind: string; created_at: string; join_mode: string; status: string;
    host: string | null; photos: number; guests: number; searches: number;
  }[];
  recent_signups: { email: string | null; created_at: string; confirmed: boolean; events: number }[];
};

export const n = (x: number) => x.toLocaleString("en-GB");
export const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");
export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
export const sum = (rows: Daily[], k: keyof Omit<Daily, "day">) => rows.reduce((a, r) => a + Number(r[k]), 0);

export function countryName(code: string) {
  if (code === "??") return "Unknown";
  try {
    return new Intl.DisplayNames(["en-GB"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export async function loadOverview(): Promise<{ o: Overview | null; error: string | null }> {
  const { data, error } = await createAdminClient().rpc("admin_overview", { p_days: 30 });
  return { o: (data as Overview) ?? null, error: error?.message ?? (data ? null : "No data") };
}
