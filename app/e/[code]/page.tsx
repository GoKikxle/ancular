import type { Metadata } from "next";
import Link from "next/link";
import { AdirePattern } from "@/components/brand/AdirePattern";
import { Logo } from "@/components/brand/Logo";
import { GuestFinder, type Match } from "@/components/guest/GuestFinder";
import { JoinForm } from "@/components/guest/JoinForm";
import { getUser } from "@/lib/supabase/server";
import { KIND_LABELS, formatEventDate, type EventKind } from "@/lib/events";

type Invite = {
  id: string;
  name: string;
  host_name: string | null;
  kind: EventKind;
  event_date: string | null;
  join_mode: "open" | "approval";
  status: "active" | "archived";
};

export const metadata: Metadata = {
  title: "Your event photos",
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { supabase, user } = await getUser();

  const { data } = await supabase.rpc("get_event_invite", { p_code: code });
  const invite = (data as Invite[] | null)?.[0];

  if (!invite || invite.status !== "active") {
    return (
      <Shell>
        <h1 className="display text-[2.2rem] text-indigo">This invite link isn&apos;t working</h1>
        <p className="mt-3 text-ink-muted">
          It may have been typed wrongly or the event has closed. Ask the host to send the link again.
        </p>
        <Link href="/" className="btn btn-quiet mt-6">
          Go to Ancular
        </Link>
      </Shell>
    );
  }

  const header = <EventHeader invite={invite} />;
  const next = `/e/${code}`;

  if (!user) {
    return (
      <Shell header={header}>
        <h2 className="text-2xl font-bold">Find every photo you&apos;re in</h2>
        <p className="mt-2 text-ink-muted">
          Create a free account or sign in, then take one selfie. You&apos;ll only see photos of you, and your selfie
          stays on your phone.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="btn btn-primary">
            Create an account
          </Link>
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn btn-quiet">
            I have an account
          </Link>
        </div>
      </Shell>
    );
  }

  const { data: membership } = await supabase
    .from("event_members")
    .select("role, status")
    .eq("event_id", invite.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role === "host") {
    return (
      <Shell header={header}>
        <h2 className="text-2xl font-bold">You&apos;re hosting this event</h2>
        <p className="mt-2 text-ink-muted">This is the page your guests see when they open the invite link.</p>
        <Link href={`/events/${invite.id}`} className="btn btn-primary mt-6">
          Manage the event
        </Link>
      </Shell>
    );
  }

  if (!membership) {
    const suggested = (user.user_metadata?.full_name as string | undefined) ?? "";
    return (
      <Shell header={header}>
        <h2 className="text-2xl font-bold">Join to find your photos</h2>
        <p className="mt-2 text-ink-muted">
          {invite.join_mode === "approval"
            ? "The host lets each guest in. Add your name so they know it's you."
            : "Add your name and you can search straight away."}
        </p>
        <JoinForm code={code} defaultName={suggested} />
      </Shell>
    );
  }

  if (membership.status === "pending") {
    return (
      <Shell header={header}>
        <h2 className="text-2xl font-bold">Waiting for the host to let you in</h2>
        <p className="mt-2 text-ink-muted">
          We&apos;ve told them you asked to join. Check back on this page later, or nudge the host on WhatsApp.
        </p>
        <Link href={next} className="btn btn-quiet mt-6">
          Check again
        </Link>
      </Shell>
    );
  }

  if (membership.status === "declined") {
    return (
      <Shell header={header}>
        <h2 className="text-2xl font-bold">The host hasn&apos;t added you to this event</h2>
        <p className="mt-2 text-ink-muted">If you think that&apos;s a mistake, contact the host directly.</p>
      </Shell>
    );
  }

  const [{ data: consent }, { data: matches }] = await Promise.all([
    supabase
      .from("consents")
      .select("id")
      .eq("event_id", invite.id)
      .eq("user_id", user.id)
      .is("withdrawn_at", null)
      .maybeSingle(),
    supabase
      .from("photo_matches")
      .select("photo_id, distance, confidence, confirmed")
      .eq("event_id", invite.id)
      .eq("user_id", user.id)
      .eq("rejected", false)
      .order("distance"),
  ]);

  return (
    <Shell header={header} wide>
      <GuestFinder
        eventId={invite.id}
        eventName={invite.name}
        hasConsent={!!consent}
        initialMatches={(matches ?? []) as Match[]}
      />
    </Shell>
  );
}

function EventHeader({ invite }: { invite: Invite }) {
  return (
    <div className="relative overflow-hidden bg-indigo text-white">
      <AdirePattern className="absolute inset-0 h-full w-full opacity-40" cols={12} rows={5} found={[9, 2]} />
      <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <Logo onIndigo />
        <p className="mt-10 font-semibold text-gold">
          {[KIND_LABELS[invite.kind], formatEventDate(invite.event_date)].filter(Boolean).join(", ")}
        </p>
        <h1 className="display mt-2 text-[2.4rem] sm:text-[3.2rem]">{invite.name}</h1>
        {invite.host_name && <p className="mt-1 text-white/80">Hosted by {invite.host_name}</p>}
      </div>
    </div>
  );
}

function Shell({ children, header, wide }: { children: React.ReactNode; header?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-dvh">
      {header ?? (
        <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6">
          <Logo />
        </div>
      )}
      <main className={`mx-auto px-4 py-10 sm:px-6 ${wide ? "max-w-3xl" : "max-w-md"}`}>{children}</main>
    </div>
  );
}
