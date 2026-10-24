import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { KIND_LABELS, formatEventDate, inviteUrl, type EventRow, type MemberRow, type PhotoRow } from "@/lib/events";
import { getPreviewEvent } from "@/lib/preview-events";
import { listPreviewPhotos } from "@/lib/preview-photos";
import { PhotoUploader } from "@/components/events/PhotoUploader";
import { SharePanel } from "@/components/events/SharePanel";
import { GuestList } from "@/components/events/GuestList";
import { PhotoGrid } from "@/components/events/PhotoGrid";
import { SettingsPanel } from "@/components/events/SettingsPanel";

type Tab = "photos" | "guests" | "share" | "settings";
const TABS: { id: Tab; label: string }[] = [
  { id: "photos", label: "Photos" },
  { id: "guests", label: "Guests" },
  { id: "share", label: "Share" },
  { id: "settings", label: "Settings" },
];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { supabase, user } = await getUser();
  if (!user) {
    const preview = await getPreviewEvent(id);
    return { title: preview?.name ?? "Event" };
  }
  const { data } = await supabase.from("events").select("name").eq("id", id).maybeSingle();
  return { title: data?.name ?? "Event" };
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === rawTab) ? (rawTab as Tab) : "photos";

  const { supabase, user } = await getUser();
  const preview = user ? null : await getPreviewEvent(id);

  let event: EventRow | null = preview;
  let readyPhotos: PhotoRow[] = [];
  let guests: MemberRow[] = [];
  let consentCount = 0;

  if (user) {
    const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle<EventRow>();
    event = data;
    if (!event) notFound();

    const { data: me } = await supabase
      .from("event_members")
      .select("role, status")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (me?.role !== "host") notFound();

    const [{ data: photos }, { data: members }, { count }] = await Promise.all([
      supabase
        .from("photos")
        .select("id, event_id, original_name, width, height, face_count, status, created_at")
        .eq("event_id", id)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("event_members")
        .select("event_id, user_id, role, status, display_name, requested_at")
        .eq("event_id", id)
        .eq("role", "guest")
        .order("requested_at", { ascending: false }),
      supabase.from("consents").select("id", { count: "exact", head: true }).eq("event_id", id).is("withdrawn_at", null),
    ]);

    readyPhotos = ((photos ?? []) as PhotoRow[]).filter((p) => p.status === "ready");
    guests = (members ?? []) as MemberRow[];
    consentCount = count ?? 0;
  }

  if (preview) {
    readyPhotos = (await listPreviewPhotos(id)).filter((photo) => photo.status === "ready");
  }

  if (!event) notFound();
  const pending = guests.filter((g) => g.status === "pending").length;
  const facesTotal = readyPhotos.reduce((n, p) => n + p.face_count, 0);

  return (
    <div>
      <Link href="/dashboard" className="text-sm font-semibold text-indigo">
        ← Your events
      </Link>
      <h1 className="display mt-3 text-[2.3rem] text-indigo sm:text-[2.8rem]">{event.name}</h1>
      <p className="mt-1 text-ink-muted">
        {[KIND_LABELS[event.kind], event.host_name, formatEventDate(event.event_date), event.venue]
          .filter(Boolean)
          .join(", ")}
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-line shadow-[0_0_0_1.5px_var(--line)] sm:max-w-xl">
        {[
          { label: "photos", value: readyPhotos.length },
          { label: "faces", value: facesTotal },
          { label: "guests", value: consentCount },
        ].map((s) => (
          <div key={s.label} className="bg-paper px-4 py-3">
            <dd className="text-2xl font-bold text-indigo">{s.value.toLocaleString()}</dd>
            <dt className="text-sm text-ink-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 max-w-xl text-sm text-ink-muted">
        Faces are people found in the photos. Guests are people who agreed and searched.
      </p>

      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-line" aria-label="Event sections">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/events/${id}?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-[3px] px-4 py-3 font-semibold ${
              tab === t.id ? "border-gold text-indigo" : "border-transparent text-ink-muted hover:text-indigo"
            }`}
          >
            {t.label}
            {t.id === "guests" && pending > 0 && (
              <span className="rounded-full bg-gold px-2 text-xs font-bold text-indigo-deep">{pending}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="pt-8">
        {tab === "photos" && (
          <div className="space-y-8">
            <PhotoUploader eventId={id} />
            <PhotoGrid eventId={id} photos={readyPhotos} />
          </div>
        )}
        {tab === "guests" && <GuestList eventId={id} guests={guests} joinMode={event.join_mode} />}
        {tab === "share" && (
          <SharePanel
            url={inviteUrl(event.invite_code)}
            inviteCode={event.invite_code}
            eventName={event.name}
            joinMode={event.join_mode}
          />
        )}
        {tab === "settings" && <SettingsPanel event={event} isOwner={!user || event.owner_id === user.id} />}
      </div>
    </div>
  );
}
