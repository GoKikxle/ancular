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
  const [adult, setAdult] = useState(false);
  const [under18, setUnder18] = useState(false);
  const [saving, setSaving] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (under18) {
    return (
      <div className="max-w-xl">
        <h1 className="display">Face search is for adults</h1>
        <p className="t-lead t-muted mt-5">
          Selfie search on Ancular is only for people aged 18 or over, so we won&apos;t scan your face. You can still
          get your photos from {eventName}: ask the host, or a parent or guardian, to share them with you.
        </p>
        <button type="button" className="btn btn-quiet btn-lg mt-8" onClick={() => setUnder18(false)}>
          Go back
        </button>
      </div>
    );
  }

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

      <label className="mt-8 flex cursor-pointer items-start gap-3 choice-card p-4">
        <input
          type="checkbox"
          checked={adult}
          onChange={(e) => setAdult(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0"
          required
        />
        <span className="text-[0.875rem] leading-[1.4]">
          I confirm I&apos;m <strong className="font-semibold">18 or over</strong>.
        </span>
      </label>

      <label className="mt-2 flex cursor-pointer items-start gap-3 choice-card p-4">
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
          disabled={!checked || !adult || saving}
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
      {!(checked && adult) && (
        <p className="t-meta mt-3">Tick both boxes to continue.</p>
      )}
      <button
        type="button"
        className="t-meta mt-3 underline decoration-[var(--hairline-strong)] underline-offset-4 hover:text-ink"
        onClick={() => setUnder18(true)}
      >
        I&apos;m under 18
      </button>
      <p className="t-meta mt-5">
        <Link href="/privacy" className="underline decoration-[var(--hairline-strong)] underline-offset-4 hover:text-ink">
          How Ancular handles your data
        </Link>
      </p>
    </div>
  );
}
