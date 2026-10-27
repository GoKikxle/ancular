"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { goToCheckout } from "./checkout";

type Props = {
  eventId: string;
  used: number;
  limit: number;
  eventPlan: "free" | "pass";
  hostPlan: "free" | "pro";
  justPaid: boolean;
  passPrice: string;
  proPrice: string;
  passLimit: number;
};

/** Photo allowance for this event, with the way to unlock more. Shown on the Photos tab. */
export function EventPlanBar({ eventId, used, limit, eventPlan, hostPlan, justPaid, passPrice, proPrice, passLimit }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"pass" | "pro" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const free = eventPlan === "free" && hostPlan === "free";
  const waitingForPayment = justPaid && free;

  // Stripe confirms payment a moment after the redirect back; refresh until the plan updates.
  useEffect(() => {
    if (!waitingForPayment) return;
    const t = setInterval(() => router.refresh(), 2500);
    const stop = setTimeout(() => clearInterval(t), 30000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, [waitingForPayment, router]);

  async function buy(kind: "pass" | "pro") {
    setError(null);
    setBusy(kind);
    try {
      await goToCheckout(kind === "pass" ? { kind, eventId } : { kind });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open checkout.");
      setBusy(null);
    }
  }

  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const label = hostPlan === "pro" ? "Pro" : eventPlan === "pass" ? "Event pass" : "Free";
  const full = used >= limit;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-[4px] bg-fill p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 md:max-w-sm md:flex-1">
        <p className="t-ui tabular-nums">
          <span className="text-ink">{label}</span> · {used.toLocaleString("en-GB")} of {limit.toLocaleString("en-GB")}{" "}
          photos
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--fill-hover)]">
          <div className={`h-full rounded-full ${full ? "bg-danger" : "bg-ink"}`} style={{ width: `${pct}%` }} />
        </div>
        {waitingForPayment ? (
          <p className="t-meta mt-2" aria-live="polite">
            Payment received. Unlocking your event…
          </p>
        ) : free ? (
          <p className="t-meta mt-2">
            {full ? "This event is full. " : ""}Unlock up to {passLimit.toLocaleString("en-GB")} photos for this event.
          </p>
        ) : null}
        {error && (
          <p role="alert" className="t-ui mt-2 !text-danger">
            {error}
          </p>
        )}
      </div>
      {free && !waitingForPayment && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => buy("pass")} disabled={busy !== null}>
            {busy === "pass" ? "Opening checkout…" : `Unlock this event · ${passPrice}`}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => buy("pro")} disabled={busy !== null}>
            {busy === "pro" ? "Opening checkout…" : `Go Pro · ${proPrice}/month`}
          </button>
        </div>
      )}
    </div>
  );
}
