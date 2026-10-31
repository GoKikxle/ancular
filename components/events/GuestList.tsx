import { approveAllPending, decideGuest, removeGuest } from "@/app/(app)/events/actions";
import type { MemberRow } from "@/lib/events";
import { SubmitButton } from "@/components/ui/SubmitButton";

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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
      <div>
        <h2 className="t-title">No guests yet</h2>
        <p className="t-item-sub mt-2 max-w-md">
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
            <h2 className="t-title">
              Waiting for you <span className="text-ink-4">{pending.length}</span>
            </h2>
            {pending.length > 1 && (
              <form action={approveAllPending.bind(null, eventId)}>
                <SubmitButton className="btn btn-quiet btn-sm" pendingLabel="Letting in…">
                  Let everyone in
                </SubmitButton>
              </form>
            )}
          </div>
          <ul className="mt-4 border-t border-hairline">
            {pending.map((g) => (
              <li key={g.user_id} className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline py-3">
                <div>
                  <p className="t-item">{g.display_name ?? "Guest"}</p>
                  <p className="t-item-sub">Asked {when(g.requested_at)}</p>
                </div>
                <div className="flex gap-2">
                  <form action={decideGuest.bind(null, eventId, g.user_id, "declined")}>
                    <SubmitButton className="btn btn-quiet btn-sm" pendingLabel="Declining…">
                      Decline
                    </SubmitButton>
                  </form>
                  <form action={decideGuest.bind(null, eventId, g.user_id, "approved")}>
                    <SubmitButton className="btn btn-primary btn-sm" pendingLabel="Letting in…">
                      Let in
                    </SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="t-title">
          In the event <span className="text-ink-4">{approved.length}</span>
        </h2>
        {approved.length === 0 ? (
          <p className="t-item-sub mt-2">Nobody yet.</p>
        ) : (
          <ul className="mt-4 border-t border-hairline">
            {approved.map((g) => (
              <li key={g.user_id} className="flex items-center justify-between gap-3 border-b border-hairline py-3">
                <p className="t-item">{g.display_name ?? "Guest"}</p>
                <form action={removeGuest.bind(null, eventId, g.user_id)}>
                  <SubmitButton className="nav-link hover:!text-danger" pendingLabel="Removing…">
                    Remove
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
