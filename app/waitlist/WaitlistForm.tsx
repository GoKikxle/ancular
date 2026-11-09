"use client";

import { useActionState, useState } from "react";
import { joinWaitlist, type WaitlistState } from "./actions";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  if (state?.done) {
    return (
      <div className="confirm-in flex-col !items-start py-6" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
          <svg viewBox="0 0 16 16" className="pop h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </span>
        <h2 className="mt-5 text-[1.75rem] font-medium leading-[1.05] tracking-[-0.04em]">You&apos;re on the list.</h2>
        <p className="lp-lead mt-2">We&apos;ll email you when you can create events.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <h2 className="mb-6 text-[1.375rem] font-semibold tracking-[-0.03em]">Your details</h2>
      <div>
        <label htmlFor="name" className="label">
          Your name
        </label>
        <input
          id="name"
          name="name"
          className="field"
          required
          maxLength={80}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="field"
          required
          maxLength={200}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="role" className="label">
          What you do
        </label>
        <select id="role" name="role" className="field" defaultValue="photographer" required>
          <option value="photographer">Photographer</option>
          <option value="church">Church media</option>
          <option value="other">Event organiser or something else</option>
        </select>
      </div>
      <div>
        <label htmlFor="note" className="label">
          Note
        </label>
        <textarea
          id="note"
          name="note"
          className="field min-h-24"
          maxLength={500}
          placeholder="Optional"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {state?.error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-pill btn-lg mt-2 w-full" disabled={pending} aria-busy={pending || undefined}>
        {pending ? "Sending…" : "Join the waitlist"}
      </button>
    </form>
  );
}
