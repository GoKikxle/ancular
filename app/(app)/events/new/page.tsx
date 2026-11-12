import type { Metadata } from "next";
import Link from "next/link";
import { UpgradeNudge } from "@/components/billing/UpgradeNudge";
import { readLiveEventAllowance } from "@/lib/live-events";
import { getUser } from "@/lib/supabase/server";
import { NewEventForm } from "./NewEventForm";

export const metadata: Metadata = { title: "Create an event" };

export default async function NewEventPage() {
  const { supabase, user } = await getUser();
  const live = user ? await readLiveEventAllowance(supabase, user.id) : null;
  const atLimit = live?.plan === "free" && !live.canCreate;

  return (
    <div className="max-w-xl">
      <h1 className="display">Create an event</h1>
      <p className="t-lead t-muted mt-5">
        You&apos;ll upload photos next, then get the invite link and QR code for your guests.
      </p>
      {atLimit ? (
        <div className="mt-10 space-y-6">
          <UpgradeNudge used={live.used} atLimit />
          <Link href="/settings" className="btn btn-primary btn-lg">
            Open Settings
          </Link>
        </div>
      ) : (
        <>
          {live?.plan === "free" && (
            <div className="mt-8">
              <UpgradeNudge used={live.used} />
            </div>
          )}
          <NewEventForm />
        </>
      )}
    </div>
  );
}
