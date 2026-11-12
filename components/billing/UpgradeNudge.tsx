import Link from "next/link";
import { FREE_LIVE_EVENTS_PER_MONTH } from "@/lib/plans";

/** Plain nudge for Free hosts — settings, dashboard, and the live-event limit. */
export function UpgradeNudge({
  used,
  atLimit = false,
}: {
  used?: number;
  atLimit?: boolean;
}) {
  const count =
    typeof used === "number"
      ? `${used} of ${FREE_LIVE_EVENTS_PER_MONTH} live events this month`
      : `${FREE_LIVE_EVENTS_PER_MONTH} live events a month`;

  return (
    <p className="t-ui max-w-xl rounded-[4px] bg-fill px-3 py-2.5">
      {atLimit ? (
        <>
          Free covers {FREE_LIVE_EVENTS_PER_MONTH} live events this month.{" "}
          <Link href="/settings" className="font-semibold text-ink underline underline-offset-4">
            Go Pro
          </Link>{" "}
          for unlimited events, or wait until next month. Event pass raises the photo limit on one event; it
          doesn&apos;t add event slots.
        </>
      ) : (
        <>
          You&apos;re on Free · {count}.{" "}
          <Link href="/settings" className="font-semibold text-ink underline underline-offset-4">
            Go Pro
          </Link>{" "}
          for unlimited events, or unlock more photos on an event with an{" "}
          <Link href="/billing/pass" className="font-semibold text-ink underline underline-offset-4">
            Event pass
          </Link>
          .
        </>
      )}
    </p>
  );
}
