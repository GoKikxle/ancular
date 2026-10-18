import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { KIND_LABELS, formatEventDate, type EventRow } from "@/lib/events";

export const metadata: Metadata = { title: "Your events" };

type Membership = { role: "host" | "guest"; status: string; events: EventRow | null };

export default async function DashboardPage() {
  const { supabase, user } = await getUser();

  const { data } = await supabase
    .from("event_members")
    .select("role, status, events(*)")
    .eq("user_id", user!.id)
    .order("requested_at", { ascending: false });

  const memberships = ((data ?? []) as unknown as Membership[]).filter((m) => m.events);
  const hosting = memberships.filter((m) => m.role === "host");
  const attending = memberships.filter((m) => m.role === "guest");

  // Counts for hosted events in one query each
  const hostedIds = hosting.map((m) => m.events!.id);
  const photoCounts = new Map<string, number>();
  const pendingCounts = new Map<string, number>();
  if (hostedIds.length) {
    const [{ data: photos }, { data: pending }] = await Promise.all([
      supabase.from("photos").select("event_id").in("event_id", hostedIds).eq("status", "ready"),
      supabase.from("event_members").select("event_id").in("event_id", hostedIds).eq("status", "pending"),
    ]);
    photos?.forEach((p) => photoCounts.set(p.event_id, (photoCounts.get(p.event_id) ?? 0) + 1));
    pending?.forEach((p) => pendingCounts.set(p.event_id, (pendingCounts.get(p.event_id) ?? 0) + 1));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[2.4rem] text-indigo">Your events</h1>
        <Link href="/events/new" className="btn btn-primary">
          Create an event
        </Link>
      </div>

      {hosting.length === 0 && attending.length === 0 && (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-line bg-paper px-6 py-12 text-center">
          <h2 className="text-xl font-bold">No events yet</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-muted">
            Create an event to upload photos and get an invite link for your guests. If someone sent you an invite
            link, open it and you&apos;ll find the event here afterwards.
          </p>
          <Link href="/events/new" className="btn btn-gold mt-6">
            Create your first event
          </Link>
        </div>
      )}

      {hosting.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-muted">Hosting</h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-[0_0_0_1.5px_var(--line)]">
            {hosting.map(({ events: e }) => {
              const pending = pendingCounts.get(e!.id) ?? 0;
              return (
                <li key={e!.id}>
                  <Link
                    href={`/events/${e!.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-resist"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{e!.name}</p>
                      <p className="text-sm text-ink-muted">
                        {[KIND_LABELS[e!.kind], formatEventDate(e!.event_date)].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-sm">
                      {pending > 0 && (
                        <span className="rounded-full bg-gold px-2.5 py-1 font-semibold text-indigo-deep">
                          {pending} waiting
                        </span>
                      )}
                      <span className="text-ink-muted">{photoCounts.get(e!.id) ?? 0} photos</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {attending.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-muted">Invited to</h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-[0_0_0_1.5px_var(--line)]">
            {attending.map(({ events: e, status }) => (
              <li key={e!.id}>
                <Link
                  href={`/e/${e!.invite_code}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-resist"
                >
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{e!.name}</p>
                    <p className="text-sm text-ink-muted">{e!.host_name ?? KIND_LABELS[e!.kind]}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-indigo">
                    {status === "approved" ? "Find my photos" : "Waiting for approval"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
