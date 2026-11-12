import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_LIVE_EVENTS_PER_MONTH, LIVE_EVENT_LIMIT_MESSAGE } from "@/lib/plans";
import type { HostPlan } from "@/lib/billing";

export { FREE_LIVE_EVENTS_PER_MONTH, LIVE_EVENT_LIMIT_MESSAGE };

export type LiveEventAllowance = {
  plan: HostPlan;
  used: number;
  limit: number;
  canCreate: boolean;
};

function monthStartUtcIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/** Owner's Pro row when the subscription is treated as paid; otherwise Free. */
export async function readHostPlan(supabase: SupabaseClient, userId: string): Promise<HostPlan> {
  const { data } = await supabase
    .from("host_billing")
    .select("plan, subscription_status")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data || data.plan !== "pro") return "free";
  const status = (data.subscription_status as string | null) ?? "active";
  if (status === "active" || status === "trialing" || status === "past_due") return "pro";
  return "free";
}

/**
 * Live events this calendar month (UTC): status active, created since month start.
 * Pro hosts are unlimited (canCreate always true; limit is informational Infinity).
 */
export async function readLiveEventAllowance(
  supabase: SupabaseClient,
  userId: string
): Promise<LiveEventAllowance> {
  const plan = await readHostPlan(supabase, userId);
  const { count, error } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId)
    .eq("status", "active")
    .gte("created_at", monthStartUtcIso());

  const used = error ? 0 : count ?? 0;
  if (plan === "pro") {
    return { plan, used, limit: Number.POSITIVE_INFINITY, canCreate: true };
  }
  return {
    plan: "free",
    used,
    limit: FREE_LIVE_EVENTS_PER_MONTH,
    canCreate: used < FREE_LIVE_EVENTS_PER_MONTH,
  };
}
