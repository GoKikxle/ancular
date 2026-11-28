"use client";

import { useState, useTransition } from "react";
import { emailGuestsPhotosReady } from "@/app/(app)/events/actions";

/** "Photos are live. Email your guests." Shown to the host once photos are up, until sent. */
export function NotifyGuestsCard({
  eventId,
  guests,
  notifiedAt,
}: {
  eventId: string;
  guests: number;
  notifiedAt: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);

  if (notifiedAt || sent !== null) {
    const when = notifiedAt
      ? new Date(notifiedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      : "just now";
    return (
      <p className="t-meta mt-6">
        Guests were emailed that the photos are ready ({when}
        {sent !== null ? `, ${sent} ${sent === 1 ? "guest" : "guests"}` : ""}).
      </p>
    );
  }

  return (
    <div className="pb-banner mt-8">
      <div className="min-w-0">
        <p className="t-item">Photos are live</p>
        <p className="t-item-sub mt-1">
          {guests > 0
            ? `Email the ${guests} ${guests === 1 ? "guest" : "guests"} who joined, so they know to come and find their photos. You can only send this once, so add everything first.`
            : "No guests have joined yet. When they do, you can email them here."}
        </p>
        {error && <p className="t-ui mt-2 !text-danger">{error}</p>}
      </div>
      {guests > 0 && (
        <button
          type="button"
          className="btn btn-primary btn-sm shrink-0"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await emailGuestsPhotosReady(eventId);
              if (res.error) setError(res.error);
              else setSent(res.sent ?? 0);
            })
          }
        >
          {pending ? "Sending…" : "Email guests"}
        </button>
      )}
    </div>
  );
}
