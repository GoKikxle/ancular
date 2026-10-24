"use client";

import { useState } from "react";
import Link from "next/link";

const POINTS = [
  ["Your selfie stays on your phone.", "Ancular reads a face code from it on this device and only sends that code to search."],
  ["The code is used once.", "We compare it with the faces in this event's photos, then throw it away."],
  ["Only you see the results.", "Not the host, not other guests."],
  ["You can undo this.", "Delete your face data for this event at any time from this page."],
] as const;

export function ConsentStep({ eventName, onAgree }: { eventName: string; onAgree: () => Promise<void> }) {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <div className="max-w-xl">
        <h1 className="display">No problem</h1>
        <p className="t-lead t-muted mt-5">
          We won&apos;t use face matching for you. You&apos;re still part of {eventName}; ask the host to send you any
          photos you&apos;d like. You can change your mind here any time.
        </p>
        <button type="button" className="btn btn-quiet btn-lg mt-8" onClick={() => setDeclined(false)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="display">Before you take a selfie</h1>
      <p className="t-lead t-muted mt-5">Four things to know. It takes a few seconds to read.</p>

      <ol className="mt-8 border-t border-hairline md:mt-10">
        {POINTS.map(([title, body], i) => (
          <li key={title} className="grid grid-cols-[2rem_1fr] border-b border-hairline py-4">
            <span className="t-meta tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="t-item">{title}</p>
              <p className="t-item-sub mt-0.5">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-[4px] bg-fill p-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0"
        />
        <span className="text-[0.875rem] leading-[1.4]">
          I agree to Ancular using my selfie to find photos of me at <strong className="font-semibold">{eventName}</strong>.
          My selfie isn&apos;t stored, and I can withdraw at any time.
        </span>
      </label>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="btn btn-primary btn-lg sm:flex-1"
          disabled={!checked || saving}
          onClick={async () => {
            setSaving(true);
            await onAgree();
            setSaving(false);
          }}
        >
          {saving ? "One moment…" : "Continue to selfie"}
        </button>
        <button type="button" className="btn btn-quiet btn-lg" onClick={() => setDeclined(true)}>
          No thanks
        </button>
      </div>
      <p className="t-meta mt-5">
        <Link href="/privacy" className="underline decoration-[var(--hairline-strong)] underline-offset-4 hover:text-ink">
          How Ancular handles your data
        </Link>
      </p>
    </div>
  );
}
