import type { Metadata } from "next";
import Link from "next/link";
import { UpgradeNudge } from "@/components/billing/UpgradeNudge";
import { getUser } from "@/lib/supabase/server";
import { EventsBoard } from "@/components/dashboard/EventsBoard";
import { loadBoard, type BoardRow } from "@/lib/dashboard";
import { KIND_LABELS, formatEventDate } from "@/lib/events";
import { readLiveEventAllowance } from "@/lib/live-events";
import { listPreviewEvents } from "@/lib/preview-events";
import { listPreviewPhotos } from "@/lib/preview-photos";

export const metadata: Metadata = { title: "Your events" };

export default async function DashboardPage() {
  const { supabase, user } = await getUser();

  let hosting: BoardRow[] = [];
  let joined: BoardRow[] = [];

  if (!user) {
    const counts = new Map<string, number>();
    for (const photo of await listPreviewPhotos()) {
      if (photo.status === "ready")
        counts.set(photo.event_id, (counts.get(photo.event_id) ?? 0) + 1);
    }
    hosting = (await listPreviewEvents()).map((e) => ({
      id: e.id,
      href: `/events/${e.id}`,
      title: e.name,
      sub: [KIND_LABELS[e.kind], formatEventDate(e.event_date)]
        .filter(Boolean)
        .join(", "),
      past: false,
      tags: [{ label: "Live", tone: "live" as const }],
      meta: `${counts.get(e.id) ?? 0} photos`,
      action: null,
    }));
  } else {
    ({ hosting, joined } = await loadBoard(supabase, user.id));
  }

  const live = user ? await readLiveEventAllowance(supabase, user.id) : null;
  const canCreate = !live || live.canCreate;
  const showFreeNudge = live?.plan === "free";

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
      {showFreeNudge && live && (
        <div className="mt-8">
          <UpgradeNudge used={live.used} atLimit={!live.canCreate} />
        </div>
      )}

      {hosting.length === 0 && joined.length === 0 ? (
        <section className="mt-10 border-t border-hairline pt-8 md:mt-16">
          <h2 className="t-title">No events yet</h2>
          <p className="t-item-sub mt-2 max-w-md">
            Create an event to upload photos and get an invite link for your
            guests. If someone sent you an invite link, open it and you&apos;ll
            find the event here afterwards.
          </p>
          {canCreate && (
            <Link href="/events/new" className="btn btn-quiet btn-lg mt-6">
              Create your first event
            </Link>
          )}
        </section>
      ) : (
        <div className="mt-10 md:mt-14">
          <EventsBoard
            hosting={hosting}
            joined={joined}
            defaultTab={hosting.length ? "hosting" : "joined"}
          />
        </div>
      )}
    </div>
  );
}
