import type { Metadata } from "next";
import Link from "next/link";
import { AdirePattern } from "@/components/brand/AdirePattern";
import { Logo } from "@/components/brand/Logo";
import { GuestFinder, type Match } from "@/components/guest/GuestFinder";
import { JoinForm } from "@/components/guest/JoinForm";
import { getUser } from "@/lib/supabase/server";
import { KIND_LABELS, formatEventDate, type EventKind } from "@/lib/events";
import { PREVIEW_OWNER_ID, getPreviewEventByInviteCode, previewEnabled } from "@/lib/preview-events";
import { continueWithoutAccountHref, getPreviewMembership, previewGuestActive } from "@/lib/preview-guest";

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
  const { supabase, user: sessionUser } = await getUser();
  // Preview events store a placeholder owner. That id is not a signed-in visitor.
  const user = sessionUser && !(previewEnabled() && sessionUser.id === PREVIEW_OWNER_ID) ? sessionUser : null;

  let invite: Invite | undefined;
  try {
    const { data, error } = await supabase.rpc("get_event_invite", { p_code: code });
    if (!error) invite = (data as Invite[] | null)?.[0];
  } catch {
    invite = undefined;
  }

  // Only events missing from Supabase come from the local preview store.
  // A live invite must not be replaced, even for a signed-out visitor.
  let fromPreviewStore = false;
  if (!invite && previewEnabled()) {
    const preview = await getPreviewEventByInviteCode(code);
    if (preview) {
      fromPreviewStore = true;
      invite = {
        id: preview.id,
        name: preview.name,
        host_name: preview.host_name,
        kind: preview.kind,
        event_date: preview.event_date,
        join_mode: preview.join_mode,
        status: preview.status,
      };
    }
  }

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
  // The preview-guest cookie is for local sample events only. On a live invite it must not
  // show the preview join form, which cannot see this event.
  const previewGuest = fromPreviewStore && !user && (await previewGuestActive());

  if (previewGuest) {
    const membership = await getPreviewMembership(invite.id);

    if (!membership) {
      return (
        <Shell header={header}>
          <h2 className="text-2xl font-bold">Join to find your photos</h2>
          <p className="mt-2 text-ink-muted">Add your name and you can search straight away.</p>
          <JoinForm code={code} defaultName="" />
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

    return (
      <Shell header={header} wide>
        <GuestFinder
          eventId={invite.id}
          eventName={invite.name}
          hasConsent={membership.consent}
          initialMatches={[]}
          preview
        />
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell header={header}>
        <h2 className="text-2xl font-bold">Find every photo you&apos;re in</h2>
        <p className="mt-2 text-ink-muted">
          Create a free account or sign in, then take one selfie. You&apos;ll only see photos of you, and your selfie
          stays on your phone.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {fromPreviewStore ? (
            <Link href={continueWithoutAccountHref(next)} className="btn btn-primary">
              Continue as a guest
            </Link>
          ) : null}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className={fromPreviewStore ? "btn btn-quiet" : "btn btn-primary"}
          >
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

  const hosting = membership?.role === "host";

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

  if (!hosting && membership.status === "pending") {
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

  if (!hosting && membership.status === "declined") {
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
      {hosting && (
        <p className="mb-6 text-sm text-ink-muted">You host this event. Guests who open this link see this page.</p>
      )}
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
