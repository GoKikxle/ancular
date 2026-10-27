import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { eventPhotoLimit, type EventPlan, type HostPlan } from "@/lib/billing";

export type EventAllowance = {
  used: number;
  limit: number;
  eventPlan: EventPlan;
  hostPlan: HostPlan;
};

/** Photos used and allowed for one event (hosts only; null for anyone else). */
export async function readEventAllowance(supabase: SupabaseClient, eventId: string): Promise<EventAllowance | null> {
  const { data, error } = await supabase.rpc("event_allowance", { p_event: eventId });
  if (error || !data) return null;
  const row = (Array.isArray(data) ? data[0] : data) as
    | { photos?: number; event_plan?: EventPlan; host_plan?: HostPlan }
    | undefined;
  if (!row) return null;
  const eventPlan = row.event_plan === "pass" ? "pass" : "free";
  const hostPlan = row.host_plan === "pro" ? "pro" : "free";
  return { used: Number(row.photos ?? 0), limit: eventPhotoLimit(eventPlan, hostPlan), eventPlan, hostPlan };
}

export function planLabel(a: Pick<EventAllowance, "eventPlan" | "hostPlan">) {
  if (a.hostPlan === "pro") return "Pro";
  return a.eventPlan === "pass" ? "Event pass" : "Free";
}
