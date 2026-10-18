"use client";

import { useState } from "react";
import Link from "next/link";

export function ConsentStep({ eventName, onAgree }: { eventName: string; onAgree: () => Promise<void> }) {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <div className="mx-auto max-w-md">
        <h2 className="text-2xl font-bold">No problem</h2>
        <p className="mt-2 text-ink-muted">
          We won&apos;t use face matching for you. You&apos;re still part of {eventName}; ask the host to send you any
          photos you&apos;d like. You can change your mind here any time.
        </p>
        <button type="button" className="btn btn-quiet mt-6" onClick={() => setDeclined(false)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-2xl font-bold">Before you take a selfie</h2>
      <ul className="mt-5 space-y-4">
        {[
          ["Your selfie stays on your phone.", "Ancular reads a face code from it on this device and only sends that code to search."],
          ["The code is used once.", "We compare it with the faces in this event's photos, then throw it away."],
          ["Only you see the results.", "Not the host, not other guests."],
          ["You can undo this.", "Delete your face data for this event at any time from this page."],
        ].map(([title, body]) => (
          <li key={title} className="border-l-[3px] border-gold pl-4">
            <p className="font-semibold">{title}</p>
            <p className="text-[0.95rem] text-ink-muted">{body}</p>
          </li>
        ))}
      </ul>

      <label className="mt-8 flex items-start gap-3 rounded-2xl bg-paper p-4 shadow-[0_0_0_1.5px_var(--line)]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--indigo)]"
        />
        <span>
          I agree to Ancular using my selfie to find photos of me at <strong>{eventName}</strong>. My selfie isn&apos;t
          stored, and I can withdraw at any time.
        </span>
      </label>

      <button
        type="button"
        className="btn btn-primary mt-5 w-full"
        disabled={!checked || saving}
        onClick={async () => {
          setSaving(true);
          await onAgree();
          setSaving(false);
        }}
      >
        {saving ? "One moment…" : "Continue to selfie"}
      </button>
      <button type="button" className="btn btn-quiet mt-3 w-full" onClick={() => setDeclined(true)}>
        No thanks
      </button>
      <p className="mt-4 text-center text-sm text-ink-muted">
        <Link href="/privacy" className="underline underline-offset-4">
          How Ancular handles your data
        </Link>
      </p>
    </div>
  );
}
