import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PassUnlockList } from "@/components/billing/PassUnlockList";
import { KIND_LABELS, formatEventDate, type EventRow } from "@/lib/events";
import { billingEnabled, formatPrice, PASS_PRICE_PENCE, PASS_PHOTOS_PER_EVENT } from "@/lib/billing";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Event pass" };

type Membership = { role: "host" | "guest"; events: EventRow | null };

/**
 * Pricing "Event pass" lands here. Stripe needs a specific event, so we either
 * send the host to create one, open the one free event's Photos tab, or let them
 * pick which event to unlock.
 */
export default async function EventPassPage() {
  const { supabase, user } = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/billing/pass")}`);

  if (!billingEnabled()) {
    return (
      <Shell>
        <p className="t-lead t-muted mt-5">Payments aren&apos;t switched on yet. Try again later.</p>
        <Link href="/dashboard" className="btn btn-quiet btn-lg mt-8">
          Back to events
        </Link>
      </Shell>
    );
  }

  const { data: billing } = await supabase.from("host_billing").select("plan").eq("user_id", user.id).maybeSingle();
  if (billing?.plan === "pro") {
    return (
      <Shell>
        <p className="t-lead t-muted mt-5">
          You&apos;re on Pro, so every event already has the higher photo limit. You don&apos;t need an Event pass.
        </p>
        <Link href="/dashboard" className="btn btn-quiet btn-lg mt-8">
          Back to events
        </Link>
      </Shell>
    );
  }

  const { data } = await supabase
    .from("event_members")
    .select("role, events(*)")
    .eq("user_id", user.id)
    .eq("role", "host")
    .order("requested_at", { ascending: false });

  const hosted = ((data ?? []) as unknown as Membership[])
    .map((m) => m.events)
    .filter((e): e is EventRow => !!e);

  if (hosted.length === 0) {
    return (
      <Shell>
        <p className="t-lead t-muted mt-5">
          An Event pass unlocks one event for up to {PASS_PHOTOS_PER_EVENT.toLocaleString("en-GB")} photos. Create the
          event first, then unlock it from the Photos tab.
        </p>
        <Link href="/events/new" className="btn btn-primary btn-lg mt-8">
          Create an event
        </Link>
      </Shell>
    );
  }

  const unlockable = hosted.filter((e) => e.plan !== "pass");
  if (unlockable.length === 0) {
    return (
      <Shell>
        <p className="t-lead t-muted mt-5">
          Every event you host is already unlocked. Create another event if you need a new pass.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/events/new" className="btn btn-primary btn-lg">
            Create an event
          </Link>
          <Link href="/dashboard" className="btn btn-quiet btn-lg">
            Back to events
          </Link>
        </div>
      </Shell>
    );
  }

  if (unlockable.length === 1) {
    redirect(`/events/${unlockable[0].id}?tab=photos`);
  }

  const options = unlockable.map((e) => ({
    id: e.id,
    name: e.name,
    sub: [KIND_LABELS[e.kind], formatEventDate(e.event_date)].filter(Boolean).join(", "),
  }));

  return (
    <Shell>
      <p className="t-lead t-muted mt-5">
        Choose which event to unlock for {formatPrice(PASS_PRICE_PENCE)}. Guests never pay.
      </p>
      <PassUnlockList events={options} passPrice={formatPrice(PASS_PRICE_PENCE)} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-xl">
      <h1 className="display">Event pass</h1>
      {children}
    </div>
  );
}
