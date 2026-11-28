import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { signOut } from "@/app/(app)/actions";
import { AccountButton, SiteHeader } from "@/components/layout/SiteHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { EventsBoard } from "@/components/dashboard/EventsBoard";
import { loadBoard } from "@/lib/dashboard";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your photos",
  robots: { index: false, follow: false },
};

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
  if (isAdmin(user.email)) redirect("/admin");

  const { hosting, joined } = await loadBoard(supabase, user.id);
  if (hosting.length > 0 || (joined.length === 0 && emailVerified))
    redirect("/dashboard");

  const name =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email ||
    "";

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
        <div className="max-w-3xl">
          <h1 className="display">Your photos</h1>
          <p className="t-lead t-muted mt-5">
            Every event you&apos;ve joined. Open one to see the photos
            you&apos;re in.
          </p>

          {joined.length === 0 ? (
            <section className="mt-10 border-t border-hairline pt-8">
              <h2 className="t-title">No events yet</h2>
              <p className="t-item-sub mt-2 max-w-md">
                Open the invite link your host sent you. The event will show up
                here once you&apos;ve joined.
              </p>
            </section>
          ) : (
            <div className="mt-10">
              <EventsBoard hosting={[]} joined={joined} defaultTab="joined" />
            </div>
          )}

          <p className="t-meta mt-12">
            Hosting an event yourself?{" "}
            <Link
              href="/events/new"
              className="font-semibold text-ink underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
