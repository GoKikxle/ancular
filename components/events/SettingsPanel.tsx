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
    <div className="max-w-xl space-y-12">
      <form action={save} className="space-y-6">
        <EventFields event={event} />
        {saveState?.error && (
          <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
            {saveState.error}
          </p>
        )}
        <div className="flex items-center gap-4">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saveState?.saved && <span className="t-ui">Saved</span>}
        </div>
      </form>

      {isOwner && (
        <form action={remove} className="border-t border-hairline pt-8">
          <h2 className="t-title">Delete this event</h2>
          <p className="t-item-sub mt-2">
            Deletes every photo, face code and guest search result for this event. This can&apos;t be undone.
          </p>
          <label htmlFor="confirm_name" className="label mt-6">
            Type <strong className="text-ink">{event.name}</strong> to confirm
          </label>
          <input id="confirm_name" name="confirm_name" className="field" autoComplete="off" />
          {deleteState?.error && <p className="t-ui mt-2 !text-danger">{deleteState.error}</p>}
          <button type="submit" className="btn btn-danger btn-lg mt-4" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete event and photos"}
          </button>
        </form>
      )}
    </div>
  );
}
