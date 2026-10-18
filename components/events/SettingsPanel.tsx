"use client";

import { useActionState } from "react";
import { EventFields } from "@/components/events/EventFields";
import { deleteEvent, updateEvent, type FormState } from "@/app/(app)/events/actions";
import type { EventRow } from "@/lib/events";

export function SettingsPanel({ event, isOwner }: { event: EventRow; isOwner: boolean }) {
  const [saveState, save, saving] = useActionState<FormState, FormData>(updateEvent.bind(null, event.id), undefined);
  const [deleteState, remove, deleting] = useActionState<FormState, FormData>(
    deleteEvent.bind(null, event.id),
    undefined
  );

  return (
    <div className="max-w-2xl space-y-12">
      <form action={save} className="space-y-6">
        <EventFields event={event} />
        {saveState?.error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
            {saveState.error}
          </p>
        )}
        <div className="flex items-center gap-4">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saveState?.saved && <span className="font-semibold text-green">Saved</span>}
        </div>
      </form>

      {isOwner && (
        <form action={remove} className="rounded-2xl bg-danger-soft p-5">
          <h2 className="text-lg font-bold text-danger">Delete this event</h2>
          <p className="mt-1 text-[0.95rem]">
            Deletes every photo, face code and guest search result for this event. This can&apos;t be undone.
          </p>
          <label htmlFor="confirm_name" className="label mt-4">
            Type <strong>{event.name}</strong> to confirm
          </label>
          <input id="confirm_name" name="confirm_name" className="field" autoComplete="off" />
          {deleteState?.error && <p className="mt-2 font-semibold text-danger">{deleteState.error}</p>}
          <button type="submit" className="btn btn-danger mt-4" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete event and photos"}
          </button>
        </form>
      )}
    </div>
  );
}
