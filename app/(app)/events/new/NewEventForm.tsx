"use client";

import { useActionState } from "react";
import { EventFields } from "@/components/events/EventFields";
import { createEvent, type FormState } from "../actions";

export function NewEventForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createEvent, undefined);

  return (
    <form action={action} className="mt-8 space-y-6">
      <EventFields />

      <label className="flex items-start gap-3 rounded-2xl bg-indigo-soft p-4">
        <input type="checkbox" name="guests_told" className="mt-1 h-5 w-5 shrink-0 accent-[var(--indigo)]" />
        <span className="text-[0.95rem]">
          <strong className="block">Guests will be told about face matching</strong>
          I&apos;ll let guests know (on the invitation, programme, screen or QR poster) that photos from this event
          are shared with Ancular, and I have the right to upload them.
        </span>
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
