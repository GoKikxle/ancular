"use client";

import { useActionState } from "react";
import { EventFields } from "@/components/events/EventFields";
import { createEvent, type FormState } from "../actions";

export function NewEventForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createEvent, undefined);

  return (
    <form action={action} className="mt-10 space-y-6">
      <EventFields />

      <label className="flex cursor-pointer items-start gap-3 rounded-[4px] bg-fill p-4">
        <input type="checkbox" name="guests_told" className="mt-0.5 h-[18px] w-[18px] shrink-0" />
        <span className="t-item-sub">
          <strong className="t-item block text-ink">Guests will be told about face matching</strong>
          I&apos;ll let guests know (on the invitation, programme, screen or QR poster) that photos from this event
          are shared with Ancular, and I have the right to upload them.
        </span>
      </label>

      {state?.error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={pending}>
        {pending ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
