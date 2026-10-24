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
      <div className="mt-8 rounded-[4px] bg-fill p-5">
        <h2 className="t-item">You&apos;re on the list</h2>
        <p className="t-item-sub mt-1">We&apos;ll email you when you can create events.</p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-4">
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
          <option value="other">Something else</option>
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
      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
        {pending ? "Sending…" : "Join the waitlist"}
      </button>
    </form>
  );
}
