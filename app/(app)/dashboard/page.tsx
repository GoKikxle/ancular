import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { KIND_LABELS, formatEventDate, type EventRow } from "@/lib/events";
import { listPreviewEvents } from "@/lib/preview-events";
import { listPreviewPhotos } from "@/lib/preview-photos";
import { getHostStatus, HOST_DECLINED_MESSAGE, HOST_PENDING_MESSAGE } from "@/lib/host-access";

export const metadata: Metadata = { title: "Your events" };

type Membership = { role: "host" | "guest"; status: string; events: EventRow | null };

export default async function DashboardPage() {
  const { supabase, user } = await getUser();

  let hosting: Membership[] = [];
  let attending: Membership[] = [];
  const photoCounts = new Map<string, number>();
  const pendingCounts = new Map<string, number>();

  if (!user) {
    hosting = (await listPreviewEvents()).map((event) => ({
      role: "host",
      status: "approved",
      events: event,
    }));
    for (const photo of await listPreviewPhotos()) {
      if (photo.status === "ready") photoCounts.set(photo.event_id, (photoCounts.get(photo.event_id) ?? 0) + 1);
    }
  } else {
    const { data } = await supabase
      .from("event_members")
      .select("role, status, events(*)")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });
    const memberships = ((data ?? []) as unknown as Membership[]).filter((m) => m.events);
    hosting = memberships.filter((m) => m.role === "host");
    attending = memberships.filter((m) => m.role === "guest");
  }

  // Counts for hosted events in one query each
  const hostStatus = user ? await getHostStatus(supabase) : "approved";
  const hostedIds = user ? hosting.map((m) => m.events!.id) : [];
  if (user && hostedIds.length) {
    const [{ data: photos }, { data: pending }] = await Promise.all([
      supabase.from("photos").select("event_id").in("event_id", hostedIds).eq("status", "ready"),
      supabase.from("event_members").select("event_id").in("event_id", hostedIds).eq("status", "pending"),
    ]);
    photos?.forEach((p) => photoCounts.set(p.event_id, (photoCounts.get(p.event_id) ?? 0) + 1));
    pending?.forEach((p) => pendingCounts.set(p.event_id, (pendingCounts.get(p.event_id) ?? 0) + 1));
  }

  const canCreate = !(hostStatus === "pending" || hostStatus === "declined");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="display">Your events</h1>
        {canCreate && (
          <Link href="/events/new" className="btn btn-primary btn-lg">
            Create an event
          </Link>
        )}
      </div>
      {hostStatus === "pending" && (
        <p className="t-ui mt-8 max-w-xl rounded-[4px] bg-fill px-3 py-2.5">{HOST_PENDING_MESSAGE}</p>
      )}
      {hostStatus === "declined" && (
        <p className="t-ui mt-8 max-w-xl rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">{HOST_DECLINED_MESSAGE}</p>
      )}

      {hosting.length === 0 && attending.length === 0 && (
        <section className="mt-10 border-t border-hairline pt-8 md:mt-16">
          <h2 className="t-title">No events yet</h2>
          <p className="t-item-sub mt-2 max-w-md">
            {hostStatus === "pending"
              ? "Once you're approved, you can create an event and send guests an invite link."
              : "Create an event to upload photos and get an invite link for your guests. If someone sent you an invite link, open it and you'll find the event here afterwards."}
          </p>
          {canCreate && (
            <Link href="/events/new" className="btn btn-quiet btn-lg mt-6">
              Create your first event
            </Link>
          )}
        </section>
      )}

      {hosting.length > 0 && (
        <EventList title="Hosting" count={hosting.length}>
          {hosting.map(({ events: e }) => {
            const pending = pendingCounts.get(e!.id) ?? 0;
            return (
              <Row
                key={e!.id}
                href={`/events/${e!.id}`}
                title={e!.name}
                sub={[KIND_LABELS[e!.kind], formatEventDate(e!.event_date)].filter(Boolean).join(", ")}
                end={
                  <>
                    {pending > 0 && <span className="pill !bg-ink !text-page">{pending} waiting</span>}
                    <span className="t-meta tabular-nums">{photoCounts.get(e!.id) ?? 0} photos</span>
                  </>
                }
              />
            );
          })}
        </EventList>
      )}

      {attending.length > 0 && (
        <EventList title="Invited to" count={attending.length}>
          {attending.map(({ events: e, status }) => (
            <Row
              key={e!.id}
              href={`/e/${e!.invite_code}`}
              title={e!.name}
              sub={e!.host_name ?? KIND_LABELS[e!.kind]}
              end={
                <span className="t-ui">{status === "approved" ? "Find my photos →" : "Waiting for approval"}</span>
              }
            />
          ))}
        </EventList>
      )}
    </div>
  );
}

function EventList({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-12 md:mt-16">
      <h2 className="t-title">
        {title} <span className="text-ink-4">{count}</span>
      </h2>
      <ul className="mt-4 border-t border-hairline">{children}</ul>
    </section>
  );
}

function Row({ href, title, sub, end }: { href: string; title: string; sub: string; end: React.ReactNode }) {
  return (
    <li className="border-b border-hairline">
      <Link href={href} className="group -mx-2 flex items-center justify-between gap-4 rounded-[4px] px-2 py-4 hover:bg-fill">
        <div className="min-w-0">
          <p className="t-item truncate">{title}</p>
          <p className="t-item-sub truncate">{sub}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">{end}</div>
      </Link>
    </li>
  );
}
