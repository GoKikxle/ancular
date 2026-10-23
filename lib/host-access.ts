import type { SupabaseClient } from "@supabase/supabase-js";

export type HostStatus = "approved" | "pending" | "declined" | "unknown";

/** Unknown means the waitlist migration is not on this database yet. */
export async function getHostStatus(supabase: SupabaseClient): Promise<HostStatus> {
  const { data, error } = await supabase.from("host_access").select("status").maybeSingle();
  if (error || !data) return "unknown";
  if (data.status === "approved" || data.status === "pending" || data.status === "declined") {
    return data.status;
  }
  return "unknown";
}

export const HOST_PENDING_MESSAGE =
  "You're on the list. We'll approve your account before you can create events.";
export const HOST_DECLINED_MESSAGE = "This account can't create events. Write to us if that seems wrong.";
