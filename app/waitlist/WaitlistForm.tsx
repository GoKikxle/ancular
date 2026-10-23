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
      <div className="mt-8 rounded-2xl bg-paper p-6 shadow-[0_0_0_1.5px_var(--line)]">
        <h2 className="text-xl font-bold">You're on the list</h2>
        <p className="mt-2 text-ink-muted">We'll email you when you can create events.</p>
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
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Join the waitlist"}
      </button>
    </form>
  );
}
