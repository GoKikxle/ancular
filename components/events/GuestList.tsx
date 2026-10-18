import { approveAllPending, decideGuest, removeGuest } from "@/app/(app)/events/actions";
import type { MemberRow } from "@/lib/events";

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function GuestList({
  eventId,
  guests,
  joinMode,
}: {
  eventId: string;
  guests: MemberRow[];
  joinMode: "open" | "approval";
}) {
  const pending = guests.filter((g) => g.status === "pending");
  const approved = guests.filter((g) => g.status === "approved");

  if (guests.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-line bg-paper px-6 py-10 text-center">
        <h2 className="text-lg font-bold">No guests yet</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          Share the invite link from the Share tab.{" "}
          {joinMode === "approval" ? "People who ask to join will wait here for you." : "People who join appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {pending.length > 0 && (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Waiting for you ({pending.length})</h2>
            {pending.length > 1 && (
              <form action={approveAllPending.bind(null, eventId)}>
                <button className="btn btn-quiet btn-sm" type="submit">
                  Let everyone in
                </button>
              </form>
            )}
          </div>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-[0_0_0_1.5px_var(--line)]">
            {pending.map((g) => (
              <li key={g.user_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-semibold">{g.display_name ?? "Guest"}</p>
                  <p className="text-sm text-ink-muted">Asked {when(g.requested_at)}</p>
                </div>
                <div className="flex gap-2">
                  <form action={decideGuest.bind(null, eventId, g.user_id, "declined")}>
                    <button className="btn btn-quiet btn-sm" type="submit">
                      Decline
                    </button>
                  </form>
                  <form action={decideGuest.bind(null, eventId, g.user_id, "approved")}>
                    <button className="btn btn-primary btn-sm" type="submit">
                      Let in
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold">In the event ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="mt-2 text-ink-muted">Nobody yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-[0_0_0_1.5px_var(--line)]">
            {approved.map((g) => (
              <li key={g.user_id} className="flex items-center justify-between gap-3 px-5 py-3">
                <p className="font-semibold">{g.display_name ?? "Guest"}</p>
                <form action={removeGuest.bind(null, eventId, g.user_id)}>
                  <button className="text-sm font-semibold text-ink-muted hover:text-danger" type="submit">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
