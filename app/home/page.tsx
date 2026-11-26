import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/(app)/actions";
import { AccountButton, SiteHeader } from "@/components/layout/SiteHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { KIND_LABELS, formatEventDate, type EventRow } from "@/lib/events";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your photos", robots: { index: false, follow: false } };

type Membership = { role: "host" | "guest"; status: string; events: EventRow | null };

/**
 * Where the logo goes once you're signed in. Organisers (anyone hosting an
 * event, or a confirmed account with nothing joined yet) go to their events
 * dashboard. Guests get a home of their own: the events they've joined, each
 * one a tap away from their photos. It doesn't need a confirmed email, so a
 * guest is never bounced to a confirmation screen just for tapping the logo.
 */
export default async function HomePage() {
  const { supabase, user, emailVerified } = await getUser();
  if (!user) redirect("/");

  const { data } = await supabase
    .from("event_members")
    .select("role, status, events(*)")
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false });
  const memberships = ((data ?? []) as unknown as Membership[]).filter((m) => m.events);
  const hosting = memberships.some((m) => m.role === "host");
  const joined = memberships.filter((m) => m.role === "guest");

  if (hosting || (joined.length === 0 && emailVerified)) redirect("/dashboard");

  const name = (user.user_metadata?.full_name as string | undefined)?.trim() || user.email || "";

  return (
    <div className="min-h-dvh">
      <SiteHeader
        logoHref="/home"
        action={
          <>
            <form action={signOut}>
              <SubmitButton className="nav-link" pendingLabel="Signing out…">
                Sign out
              </SubmitButton>
            </form>
            <AccountButton name={name} />
          </>
        }
      />
      <main className="container-page pb-24 pt-10 md:pt-16">
        <div className="max-w-2xl">
          <h1 className="display">Your photos</h1>
          <p className="t-lead t-muted mt-5">
            Every event you&apos;ve joined. Open one to see the photos you&apos;re in.
          </p>

          {joined.length === 0 ? (
            <section className="mt-10 border-t border-hairline pt-8">
              <h2 className="t-title">No events yet</h2>
              <p className="t-item-sub mt-2 max-w-md">
                Open the invite link your host sent you. The event will show up here once you&apos;ve joined.
              </p>
            </section>
          ) : (
            <ul className="mt-10 border-t border-hairline">
              {joined.map(({ events: e, status }) => (
                <li key={e!.id} className="border-b border-hairline">
                  <Link
                    href={`/e/${e!.invite_code}`}
                    className="-mx-2 flex items-center justify-between gap-4 rounded-[4px] px-2 py-4 hover:bg-fill"
                  >
                    <div className="min-w-0">
                      <p className="t-item truncate">{e!.name}</p>
                      <p className="t-item-sub truncate">
                        {[e!.host_name ?? KIND_LABELS[e!.kind], formatEventDate(e!.event_date)]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <span className="t-ui shrink-0">
                      {status === "approved" ? "See my photos →" : "Waiting for approval"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="t-meta mt-12">
            Hosting an event yourself?{" "}
            <Link href="/events/new" className="font-semibold text-ink underline underline-offset-4">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
