"use client";

import Link from "next/link";
import { useState } from "react";
import { goToBillingPortal, goToCheckout } from "./checkout";
import { FREE_LIVE_EVENTS_PER_MONTH } from "@/lib/plans";

/** Settings: choose Free or Pro. Event pass is bought on an event's Photos tab. */
export function PlanSection({
  plan,
  renews,
  proPrice,
  proLimit,
  freeLimit,
  liveUsed,
  justPaid,
  billingOn,
}: {
  plan: "free" | "pro";
  renews: string | null;
  proPrice: string;
  proLimit: number;
  freeLimit: number;
  liveUsed: number;
  justPaid: boolean;
  billingOn: boolean;
}) {
  const [selected, setSelected] = useState<"free" | "pro">(plan === "pro" ? "pro" : "free");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  if (plan === "pro") {
    return (
      <div className="space-y-4">
        <p className="t-item">Pro</p>
        <p className="t-item-sub">
          Unlimited events, each up to {proLimit.toLocaleString("en-GB")} photos.
          {renews ? ` Renews ${renews}.` : ""}
        </p>
        {billingOn ? (
          <button type="button" className="btn btn-quiet btn-lg" disabled={busy} onClick={() => run(goToBillingPortal)}>
            {busy ? "Opening…" : "Manage billing"}
          </button>
        ) : (
          <p className="t-meta">Billing management opens once payments are switched on.</p>
        )}
        {error && (
          <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  const atLiveLimit = liveUsed >= FREE_LIVE_EVENTS_PER_MONTH;

  return (
    <div className="space-y-4">
      {justPaid ? (
        <p className="t-item-sub" aria-live="polite">
          Payment received. Switching you to Pro…
        </p>
      ) : (
        <p className="t-item-sub">
          Free covers {FREE_LIVE_EVENTS_PER_MONTH} live events this month
          {` (${liveUsed} of ${FREE_LIVE_EVENTS_PER_MONTH} used)`} and{" "}
          {freeLimit.toLocaleString("en-GB")} photos per event. Live means the event is active, not archived.
          Unlock a single event&apos;s photo limit from its Photos tab, or go Pro for unlimited events.
        </p>
      )}

      {atLiveLimit && (
        <p className="t-ui rounded-[4px] bg-fill px-3 py-2.5">
          You&apos;ve used this month&apos;s {FREE_LIVE_EVENTS_PER_MONTH} live events. Go Pro below for unlimited
          events, or wait until next month.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2" role="listbox" aria-label="Plan">
        <button
          type="button"
          role="option"
          aria-selected={selected === "free"}
          className="rounded-[4px] border border-hairline bg-white p-4 text-left transition-[border-color,box-shadow] data-[on=true]:border-ink data-[on=true]:shadow-[inset_0_0_0_1px_var(--ink)]"
          data-on={selected === "free"}
          onClick={() => setSelected("free")}
        >
          <p className="t-item">Free</p>
          <p className="t-meta mt-1">
            {FREE_LIVE_EVENTS_PER_MONTH} live events / month · {freeLimit.toLocaleString("en-GB")} photos · current
            plan
          </p>
        </button>
        <button
          type="button"
          role="option"
          aria-selected={selected === "pro"}
          className="rounded-[4px] border border-hairline bg-white p-4 text-left transition-[border-color,box-shadow] data-[on=true]:border-ink data-[on=true]:shadow-[inset_0_0_0_1px_var(--ink)]"
          data-on={selected === "pro"}
          onClick={() => setSelected("pro")}
        >
          <p className="t-item">Pro · {proPrice}/month</p>
          <p className="t-meta mt-1">
            Unlimited events · up to {proLimit.toLocaleString("en-GB")} photos each
          </p>
        </button>
      </div>

      {selected === "pro" ? (
        billingOn ? (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            disabled={busy || justPaid}
            onClick={() => run(() => goToCheckout({ kind: "pro" }))}
          >
            {busy ? "Opening checkout…" : `Go Pro · ${proPrice}/month`}
          </button>
        ) : (
          <Link href="/pricing" className="btn btn-primary btn-lg">
            See Pro on pricing
          </Link>
        )
      ) : (
        <p className="t-meta">
          You&apos;re on Free. Choose Pro above to upgrade, or buy an Event pass on an event for a higher photo
          limit.
        </p>
      )}

      {error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
