import { KIND_LABELS, type EventRow } from "@/lib/events";

/** Shared fields for creating and editing an event. */
export function EventFields({ event }: { event?: Partial<EventRow> }) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="name" className="label">
          Event name
        </label>
        <input
          id="name"
          name="name"
          className="field"
          required
          maxLength={120}
          defaultValue={event?.name}
          placeholder="Tolu & Femi’s wedding"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="kind" className="label">
            Type of event
          </label>
          <select id="kind" name="kind" className="field" defaultValue={event?.kind ?? "wedding"}>
            {Object.entries(KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="event_date" className="label">
            Date
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            className="field"
            defaultValue={event?.event_date ?? undefined}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="host_name" className="label">
            Hosted by
          </label>
          <input
            id="host_name"
            name="host_name"
            className="field"
            maxLength={120}
            defaultValue={event?.host_name ?? undefined}
            placeholder="The Adeyemi family, or your church name"
          />
          <p className="hint mt-1">Guests see this on the invite.</p>
        </div>
        <div>
          <label htmlFor="venue" className="label">
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            className="field"
            maxLength={160}
            defaultValue={event?.venue ?? undefined}
            placeholder="Optional"
          />
        </div>
      </div>

      <fieldset>
        <legend className="label">Who can join with the invite link?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-2xl bg-paper p-4 shadow-[0_0_0_1.5px_var(--line)] has-[:checked]:shadow-[0_0_0_2px_var(--indigo)]">
            <input
              type="radio"
              name="join_mode"
              value="approval"
              defaultChecked={(event?.join_mode ?? "approval") === "approval"}
              className="mt-1 h-5 w-5 accent-[var(--indigo)]"
            />
            <span>
              <span className="block font-semibold">I approve each guest</span>
              <span className="hint">Best for weddings and private events.</span>
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-2xl bg-paper p-4 shadow-[0_0_0_1.5px_var(--line)] has-[:checked]:shadow-[0_0_0_2px_var(--indigo)]">
            <input
              type="radio"
              name="join_mode"
              value="open"
              defaultChecked={event?.join_mode === "open"}
              className="mt-1 h-5 w-5 accent-[var(--indigo)]"
            />
            <span>
              <span className="block font-semibold">Anyone with the link</span>
              <span className="hint">Easier for big church programmes.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="face_retention_days" className="label">
          Delete face data after
        </label>
        <select
          id="face_retention_days"
          name="face_retention_days"
          className="field sm:max-w-xs"
          defaultValue={String(event?.face_retention_days ?? 30)}
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="180">6 months</option>
        </select>
        <p className="hint mt-1">
          Counted from the event date. Photos stay; guests just can&apos;t search by selfie after this.
        </p>
      </div>
    </div>
  );
}
