"use client";

import Link from "next/link";
import { useState } from "react";
import { goToCheckout } from "./checkout";

type EventOption = {
  id: string;
  name: string;
  sub: string;
};

/** Pick which free event to unlock with an Event pass, then open Stripe. */
export function PassUnlockList({ events, passPrice }: { events: EventOption[]; passPrice: string }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function unlock(eventId: string) {
    setError(null);
    setBusyId(eventId);
    try {
      await goToCheckout({ kind: "pass", eventId });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open checkout. Try again.");
      setBusyId(null);
    }
  }

  return (
    <div className="mt-10 space-y-4">
      <ul className="border-t border-hairline">
        {events.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline py-4">
            <div className="min-w-0">
              <p className="t-item truncate">{e.name}</p>
              <p className="t-item-sub truncate">{e.sub}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link href={`/events/${e.id}?tab=photos`} className="btn btn-quiet">
                Open event
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busyId !== null}
                onClick={() => unlock(e.id)}
              >
                {busyId === e.id ? "Opening checkout…" : `Unlock · ${passPrice}`}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
