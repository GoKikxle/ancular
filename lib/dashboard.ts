import type { SupabaseClient } from "@supabase/supabase-js";
import { KIND_LABELS, formatEventDate, type EventRow } from "@/lib/events";
import { photoKey, signDownloads } from "@/lib/storage";

export type BoardRow = {
  id: string;
  href: string;
  title: string;
  sub: string;
  cover?: string;
  past: boolean;
  /** Small tags on the right: "Live", "4 waiting", "Closed", "Waiting for approval". */
  tags: { label: string; tone: "live" | "attention" | "quiet" }[];
  /** Last line of detail, e.g. "1,240 photos · 312 guests" or "12 photos of you". */
  meta: string;
  /** Hosts delete from event settings; guests remove the event from their list. */
  action:
    | { kind: "delete"; href: string }
    | { kind: "remove"; eventId: string }
    | null;
};

type Membership = {
  role: "host" | "guest";
  status: string;
  events: EventRow | null;
};

const DAY = 24 * 60 * 60 * 1000;
const n = (x: number) => x.toLocaleString("en-GB");

function isPast(e: EventRow) {
  if (e.status === "archived") return true;
  if (!e.event_date) return false;
  return e.event_date < new Date().toISOString().slice(0, 10);
}

/** "Face data deletes in 12 days", counted from the event date like the setting says. */
function faceDataLine(e: EventRow) {
  if (!e.event_date) return null;
  const end = new Date(e.event_date).getTime() + e.face_retention_days * DAY;
  const days = Math.ceil((end - Date.now()) / DAY);
  if (days <= 0) return "Face data deleted";
  return `Face data deletes in ${days} day${days === 1 ? "" : "s"}`;
}

/** Everything the dashboard and the guest home need, in one pass. */
export async function loadBoard(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("event_members")
    .select("role, status, events(*)")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false });
  const memberships = ((data ?? []) as unknown as Membership[]).filter(
    (m) => m.events,
  );
  const hostingM = memberships.filter((m) => m.role === "host");
  const joinedM = memberships.filter((m) => m.role === "guest");
  const hostedIds = hostingM.map((m) => m.events!.id);
  const joinedIds = joinedM.map((m) => m.events!.id);

  const photoCounts = new Map<string, number>();
  const guestCounts = new Map<string, number>();
  const pendingCounts = new Map<string, number>();
  const covers = new Map<string, string>();
  const myCounts = new Map<string, number>();

  await Promise.all([
    hostedIds.length
      ? Promise.all([
          supabase
            .from("photos")
            .select("id, event_id")
            .in("event_id", hostedIds)
            .eq("status", "ready")
            .order("created_at", { ascending: true }),
          supabase
            .from("event_members")
            .select("event_id, status")
            .in("event_id", hostedIds)
            .eq("role", "guest"),
        ]).then(async ([{ data: photos }, { data: guests }]) => {
          for (const p of photos ?? []) {
            photoCounts.set(p.event_id, (photoCounts.get(p.event_id) ?? 0) + 1);
            if (!covers.has(p.event_id)) covers.set(p.event_id, p.id);
          }
          for (const g of guests ?? []) {
            if (g.status === "approved")
              guestCounts.set(
                g.event_id,
                (guestCounts.get(g.event_id) ?? 0) + 1,
              );
            if (g.status === "pending")
              pendingCounts.set(
                g.event_id,
                (pendingCounts.get(g.event_id) ?? 0) + 1,
              );
          }
          if (covers.size) {
            try {
              const keys = [...covers].map(([eventId, photoId]) =>
                photoKey(eventId, photoId, "thumb"),
              );
              const signed = await signDownloads(keys, 60 * 60);
              for (const [eventId, photoId] of covers) {
                const url = signed[photoKey(eventId, photoId, "thumb")];
                if (url) covers.set(eventId, url);
                else covers.delete(eventId);
              }
            } catch {
              covers.clear();
            }
          }
        })
      : null,
    joinedIds.length
      ? supabase
          .from("photo_matches")
          .select("event_id")
          .eq("user_id", userId)
          .in("event_id", joinedIds)
          .eq("rejected", false)
          .then(({ data: matches }) => {
            for (const m of matches ?? [])
              myCounts.set(m.event_id, (myCounts.get(m.event_id) ?? 0) + 1);
          })
      : null,
  ]);

  const hosting: BoardRow[] = hostingM.map(({ events: e }) => {
    const ev = e!;
    const past = isPast(ev);
    const pending = pendingCounts.get(ev.id) ?? 0;
    const tags: BoardRow["tags"] = [];
    if (pending > 0)
      tags.push({ label: `${pending} waiting`, tone: "attention" });
    tags.push(
      ev.status === "archived"
        ? { label: "Closed", tone: "quiet" }
        : { label: "Live", tone: "live" },
    );
    const meta = [
      `${n(photoCounts.get(ev.id) ?? 0)} photos`,
      `${n(guestCounts.get(ev.id) ?? 0)} guests`,
    ];
    const face = past ? faceDataLine(ev) : null;
    if (face) meta.push(face);
    return {
      id: ev.id,
      href: `/events/${ev.id}`,
      title: ev.name,
      sub: [KIND_LABELS[ev.kind], formatEventDate(ev.event_date)]
        .filter(Boolean)
        .join(", "),
      cover: covers.get(ev.id),
      past,
      tags,
      meta: meta.join(" · "),
      action: past
        ? { kind: "delete", href: `/events/${ev.id}?tab=settings` }
        : null,
    };
  });

  const joined: BoardRow[] = joinedM.map(({ events: e, status }) => {
    const ev = e!;
    const past = isPast(ev);
    const mine = myCounts.get(ev.id) ?? 0;
    const tags: BoardRow["tags"] =
      status === "approved"
        ? []
        : [
            {
              label:
                status === "pending" ? "Waiting for approval" : "Not approved",
              tone: "quiet",
            },
          ];
    const meta = [
      mine > 0
        ? `${n(mine)} photo${mine === 1 ? "" : "s"} of you`
        : "Find your photos",
    ];
    const face = faceDataLine(ev);
    if (past && face) meta.push(face);
    return {
      id: ev.id,
      href: `/e/${ev.invite_code}`,
      title: ev.name,
      sub: [
        ev.host_name ?? KIND_LABELS[ev.kind],
        formatEventDate(ev.event_date),
      ]
        .filter(Boolean)
        .join(", "),
      past,
      tags,
      meta: meta.join(" · "),
      action: { kind: "remove", eventId: ev.id },
    };
  });

  return { hosting, joined };
}
